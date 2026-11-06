# astroware/HaloGuard2.0-0.8B

## Resumen

HaloGuard 2.0-Stream-0.8B es un modelo de clasificación de tokens desarrollado por astroware, concebido como un guard de salida en streaming: en lugar de evaluar la respuesta completa una vez generada, emite una probabilidad de inseguridad en cada token de la respuesta a medida que se produce. Se construye sobre un backbone causal Qwen3.5-0.8B (752.395.074 parámetros reales en safetensors) al que se añade una cabeza de clasificación binaria por posición, con un contexto máximo de 2.048 tokens y soporte exclusivo de inglés.

Su relevancia radica en que resuelve un problema que los clasificadores de secuencia no abordan: detectar no solo si una respuesta es dañina, sino en qué punto exacto dejó de ser segura, permitiendo cortar la generación a mitad de stream. La regla de servicio es latchada (una vez dispara, permanece disparada) y combina dos brazos: un pico de alta precisión (máximo ≥ 0.975) o una racha de dos tokens consecutivos ≥ 0.70, lo que recupera daño sostenido de confianza moderada. El autor reporta 83,6 de F1 medio en seis benchmarks (83,3 en held-out), situándose por delante de Qwen3Guard-Stream en todos los tamaños.

El modelo se distribuye con licencia Apache 2.0, en bfloat16, y está pensado para despliegue inline junto al modelo generador, no como clasificador post-hoc. Su diseño trata explícitamente el patrón "rechaza primero, cumple después" como inseguro, que es el modo de fallo dominante en guards de respuesta y el que los heurísticos de prefijo y palabras clave no detectan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen3.5-0.8B) con cabeza de clasificación por token |
| Parametros totales | 752.395.074 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible (checkpoint publicado en bfloat16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tarea | Token classification (streaming response-safety) |
| Posiciones evaluadas | Solo tokens de respuesta (el prompt es contexto) |
| Precisión de publicación | bfloat16 |
| Tamaño del repo | 1,5 GB |
| Código personalizado | Sí (trust_remote_code=True requerido) |

## Arquitectura y entrenamiento

El modelo es un transformer causal basado en Qwen3.5-0.8B sobre el que se monta una cabeza de clasificación que produce P(unsafe) en cada posición de la respuesta. La señal es causal: la probabilidad en el token t depende únicamente del prompt y de los tokens 0..t, lo que habilita su uso durante la generación y no solo después. El prompt participa en el forward pass como contexto (el guard debe condicionarse a lo preguntado), pero ninguna posición del prompt puede disparar el veredicto; esto se impone en el momento del scoring y es lo que distingue un guard de salida real de un clasificador de prompt con interfaz de guard.

La decisión a nivel de respuesta se rige por una regla de servicio latchada: dispara si el máximo de P(unsafe) ≥ 0.975 (brazo de pico) o si existen dos tokens consecutivos con P(unsafe) ≥ 0.70 (brazo de racha). La regla es propiedad del despliegue, no de los pesos: se calibra en `serving_rule.json` y las probabilidades por token se exponen para reajustar el compromiso entre falsos positivos y falsos negativos. La política trata explícitamente como inseguro el patrón de rechazo seguido de cumplimiento. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Clasificación binaria safe/unsafe por token de respuesta, con probabilidad calibrada en cada posición.
- Detección del punto de inicio del daño (`first_fire_index`), no solo del resultado final.
- Regla de servicio latchada de dos brazos (pico ≥ 0.975 o racha de 2 tokens ≥ 0.70) con longitud de racha máxima de 3 como invariante de release.
- Reconocimiento del patrón "rechaza primero, cumple después" como inseguro.
- Condicionamiento al prompt como contexto sin que el prompt pueda disparar el veredicto.
- Exposición de las probabilidades crudas por token para recalibración del umbral.
- Integración con `transformers` mediante `AutoModelForTokenClassification` y `trust_remote_code=True`.
- Capacidad de monitorización inline durante la generación (deployment tier per-token).
- No soporta tool calling, agentes, visión, audio ni razonamiento multi-paso: es un clasificador, no un generador.

## Casos de uso

- Moderación de salida en producción en tiempo real: el guard se ejecuta en paralelo al modelo generador y corta el stream en el primer token donde se satisface la regla, evitando que el usuario reciba el tramo dañino completo.
- Cumplimiento normativo en asistentes desplegados: registro del `first_fire_index` y de la probabilidad máxima para auditoría de incidentes, con trazabilidad de en qué punto exacto se detuvo cada respuesta.
- Detección de jailbreaks por cumplimiento diferido: casos en los que el modelo rechaza en apariencia y luego filtra el contenido peligroso en la cola de la respuesta, patrón que los filtros de prefijo no capturan.
- Capa de seguridad en pipelines de generación con vLLM o TGI: el guard se intercala como hook de token en el bucle de decodificación, con una huella de 4 GB de VRAM que permite co-ubicarlo con el modelo principal en una sola GPU.
- Evaluación offline de datasets de respuestas: scoring por token de conversaciones registradas para construir conjuntos de datos de seguridad etiquetados con posición de inicio del daño.
- Red teaming y análisis de robustez: uso de las probabilidades por token para estudiar la evolución de la confianza del guard a lo largo de una respuesta y localizar transiciones graduales hacia contenido inseguro.
- Filtrado en sistemas de atención al cliente automatizada: corte de respuestas generadas antes de su entrega al usuario final, con umbrales reajustables según el coste asimétrico de falsos positivos y negativos del dominio.

## Benchmarks y rendimiento

El autor reporta un F1 medio de 83,6 en seis benchmarks bajo una única regla de decisión global, y 83,3 en el conjunto held-out. Indica además una ventaja de +2,65 a +4,81 sobre Qwen3Guard-Stream en todos los tamaños. No se detallan en la información disponible los nombres de los seis benchmarks ni los resultados desglosados por benchmark, por lo que no es posible presentar una tabla comparativa con cifras por tarea.

| Métrica | Valor reportado |
|---|---|
| Macro-F1 medio (6 benchmarks) | 83,6 |
| Macro-F1 held-out | 83,3 |
| Diferencia vs. Qwen3Guard-Stream | +2,65 a +4,81 |
| Comparación con guards abiertos 0,6B–27B | Superior según el autor |

No se han publicado en la información disponible los resultados desglosados por benchmark (MMLU, HumanEval, GSM8K u otros), que además no aplican a un clasificador de tokens.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,5 GB para los pesos en bfloat16; el autor indica que el checkpoint corre en una sola GPU con ≥ 4 GB de VRAM, margen que cubre activaciones y contexto.
- GPU recomendadas: cualquier GPU con ≥ 4 GB, incluidas RTX 3060, RTX 4060, RTX 4090, A100 y H100; el modelo es lo bastante pequeño para co-ubicarse con el generador principal.
- Cabe en GPU de consumo: sí, en todas las GPU consumer con ≥ 4 GB de VRAM.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y el build fijado de transformers indicado en la model card (commit 394b1a0e); requiere `torch`, `accelerate`, `tokenizers>=0.22` y `safetensors>=0.7`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | F1 reportado | Licencia |
|---|---|---|---|---|---|
| HaloGuard 2.0-Stream-0.8B | 752 M | 2.048 | Guard de salida en streaming | 83,6 (6 benchmarks) | Apache 2.0 |
| Qwen3Guard-Stream (varios tamaños) | No disponible | No disponible | Guard de salida en streaming | Inferior en +2,65 a +4,81 según el autor | No disponible |
| HaloGuard 1.0-Gen-0.8B | No disponible | No disponible | Guard de entrada (prompt) | 90,9 (prompt harmfulness) | No disponible |

La comparación con Qwen3Guard-Stream se basa únicamente en la afirmación del autor; no se dispone de las cifras desglosadas ni de los tamaños concretos evaluados. HaloGuard 1.0-Gen-0.8B es el miembro de entrada de la misma familia y está diseñado para colocarse en el lado opuesto del modelo generador.

## Limitaciones y advertencias

- Solo inglés: no hay soporte multilingüe declarado, lo que limita su uso en despliegues en castellano u otros idiomas.
- Contexto máximo de 2.048 tokens: respuestas o prompts más largos quedan truncados y fuera del alcance del guard.
- Requiere código personalizado (`trust_remote_code=True`) y un build específico de transformers; las versiones estándar pueden fallar con un KeyError de `model_type`.
- Es un clasificador, no un generador: no puede sustituir al modelo principal ni realizar tool calling, agentes o razonamiento.
- Riesgo de falsos positivos y negativos inherente a la regla de umbral; el autor recomienda recalibrar contra los costes propios del despliegue, lo que implica trabajo de evaluación adicional.
- La regla de servicio es una propiedad del despliegue, no de los pesos: cambiar los umbrales altera el comportamiento y requiere validación.
- Sesgos: no se documentan en la información disponible análisis de sesgo por demografía, dominio o tipo de contenido.
- Riesgo de alucinación del propio guard: no se reportan métricas de calibración más allá del F1 agregado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B debe verificarse por separado en cuanto a sus términos.
- Los resultados de benchmarks son afirmaciones del autor sin desglose público en la información disponible; conviene validarlos de forma independiente antes de producción.
- Modelo con 29 descargas y 0 likes en el momento de la ficha: ecosistema de validación externa muy limitado.

## Enlaces

- Hugging Face: https://huggingface.co/astroware/HaloGuard2.0-0.8B
- Modelo de entrada de la familia: https://huggingface.co/astroware/HaloGuard1-Gen-0.8B
- Build de transformers requerido: https://github.com/huggingface/transformers/archive/394b1a0eaa8e6199e372334da0aff3753a117fdb.tar.gz
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
