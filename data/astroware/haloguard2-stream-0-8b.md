# astroware/HaloGuard2-Stream-0.8B

## Resumen

HaloGuard 2.0-Stream-0.8B es un modelo de clasificación de tokens desarrollado por astroware, diseñado específicamente como guardián de salida en streaming para sistemas de generación de texto. A diferencia de los clasificadores de seguridad convencionales que evalúan una respuesta completa una vez generada, este modelo emite una probabilidad de peligrosidad en cada token de la respuesta mientras se produce, permitiendo interrumpir una generación dañina a mitad de flujo antes de que llegue al usuario.

El modelo se construye sobre el backbone causal Qwen3.5-0.8B (752 millones de parámetros totales) al que se añade una cabeza de clasificación por token. Su contexto máximo es de 2.048 tokens, trabaja únicamente en inglés y se distribuye en bfloat16 con licencia Apache 2.0. La innovación clave es que el veredicto es causal y posicional: la probabilidad en el token t depende solo del prompt y de los tokens 0..t, lo que permite reportar el índice exacto donde la respuesta se vuelve insegura (`first_fire_index`).

Su relevancia actual radica en que aborda el modo de fallo dominante de los guardianes de salida: la "conformidad tras rechazo" (el modelo rechaza primero y luego cumple). La política de decisión, latchada y de dos brazos, detecta este patrón que las heurísticas de prefijo y palabras clave pasan por alto. El autor reporta 83,6 de F1 medio en seis benchmarks, el mejor resultado de su clase según la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen3.5-0.8B) con cabeza de clasificación por token |
| Parámetros totales | 752.395.074 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | bfloat16 (pesos publicados); no se documentan otras cuantizaciones |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un transformer causal basado en Qwen3.5-0.8B sobre el que se superpone una cabeza de clasificación de tokens que produce `P(unsafe)` en cada posición de la respuesta. El prompt se incluye en el forward pass como contexto, pero el scoring está restringido a las posiciones de la respuesta: ningún token del prompt puede disparar el veredicto, lo que se impone en tiempo de scoring. La señal es causal, de modo que la probabilidad en el token t solo depende del prompt y de los tokens 0..t, condición necesaria para su uso durante la generación.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO. Sí se documenta la regla de servicio calibrada (`serving_rule.json`), que combina un brazo de pico (`max ≥ 0.975`) con un brazo de racha (2 tokens consecutivos `≥ 0.70`), con latch en el primer disparo y una invariante de liberación de `run_length ≤ 3`. Las probabilidades por token se exponen en crudo para permitir recalibrar el punto de operación según los costes de falsos positivos y negativos del despliegue.

## Capacidades

- Clasificación de seguridad de respuestas generadas por un asistente, token a token, en modo streaming.
- Emisión de un veredicto binario (`safe` / `unsafe`) latchado, junto con el índice del primer token que dispara (`first_fire_index`).
- Detección del punto de inicio de la nocividad (onset), no solo del resultado final de la respuesta.
- Reconocimiento de conformidad tras rechazo: trata como insegura una respuesta que primero rechaza y después cumple.
- Condicionamiento sobre el prompt como contexto sin que este pueda disparar el veredicto.
- Exposición de probabilidades por token (`max_p`, rachas) para recalibración del umbral.
- Capacidad monolingüe: solo inglés.

## Casos de uso

- Moderación de salida en asistentes conversacionales: el guardián se ejecuta en paralelo a la generación y corta el flujo en el token donde la respuesta se vuelve insegura, evitando que el usuario reciba contenido dañino ya completo.
- Protección frente a conformidad tras rechazo en despliegues de LLM: al disparar en el token de cumplimiento (por ejemplo, el índice 18 del ejemplo de la model card) y no en el prefijo de rechazo, detecta el patrón que las heurísticas de prefijo dejan pasar.
- Filtrado en pipelines de generación de código o texto técnico: con 2.048 tokens de contexto puede monitorizar respuestas de longitud media en herramientas de autocompletado o asistentes de documentación.
- Capa de seguridad en agentes autónomos: al ser un clasificador causal por token, se integra en bucles de razonamiento multi-paso para abortar una trayectoria antes de que el agente emita una acción textual peligrosa.
- Auditoría y análisis de trazas: el `first_fire_index` y las probabilidades por token permiten registrar dónde se desvió una respuesta, útil para revisión posterior y ajuste de políticas.
- Despliegue en hardware modesto: con 752 millones de parámetros en bfloat16 y un requisito de 4 GB de VRAM, puede ejecutarse en una única GPU de consumo junto al modelo generador o en un servicio separado de bajo coste.
- Complemento de un guardián de entrada: junto con HaloGuard 1.0-Gen-0.8B (que filtra prompts antes de generar), forma una pareja entrada/salida para cubrir ambos lados del pipeline.

## Benchmarks y rendimiento

La model card reporta los siguientes datos agregados, sin desglose por benchmark individual en la información disponible:

| Métrica | Valor |
|---|---|
| F1 macro medio (6 benchmarks) | 83,6 |
| F1 en conjunto held-out | 83,3 |
| Ventaja sobre Qwen3Guard-Stream | +2,65 a +4,81 en todos los tamaños |

No se han publicado en la información disponible los resultados desglosados por benchmark (MMLU, HumanEval, GSM8K u otros), por lo que no se presentan cifras individuales.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,5 GB para los pesos en bfloat16; la model card indica que funciona en una sola GPU con ≥4 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; cabe en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Despliegue: `transformers` con `trust_remote_code=True`; la arquitectura Qwen3.5 puede requerir una build fijada de transformers (commit `394b1a0eaa8e6199e372334da0aff3753a117fdb`) si la versión estándar no define el `model_type`.
- Dependencias: `torch`, `accelerate`, `tokenizers>=0.22`, `safetensors>=0.7`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | F1 reportado |
|---|---|---|---|---|---|
| HaloGuard 2.0-Stream-0.8B | 752 M | 2.048 | Guardián de salida en streaming | Apache 2.0 | 83,6 (6 benchmarks) |
| Qwen3Guard-Stream | 0,6B a 27B (varios tamaños) | No disponible | Guardián de salida en streaming | No disponible | Inferior en +2,65 a +4,81 según el autor |
| HaloGuard 1.0-Gen-0.8B | 0,8B | No disponible | Guardián de entrada (prompts) | Apache 2.0 | 90,9 (prompt harmfulness) |

La comparativa se limita a los modelos citados en la model card; no se dispone de datos de otras alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo monolingüe: solo soporta inglés; su uso con otros idiomas no está validado.
- Contexto limitado a 2.048 tokens, insuficiente para respuestas muy largas o conversaciones extensas.
- Es un clasificador, no un generador: no produce texto ni razona; su utilidad depende de integrarse en un pipeline de generación.
- La regla de servicio (umbrales 0,975 y 0,70, latch) está calibrada para un punto de operación concreto; cambiarla altera el equilibrio entre falsos positivos y negativos.
- Riesgo de falsos positivos y negativos inherente a cualquier clasificador de seguridad; el autor expone las probabilidades crudas precisamente para recalibrar.
- Requiere `trust_remote_code=True` y posiblemente una build no estándar de transformers, lo que añade riesgo operativo en producción.
- No se documentan sesgos específicos ni la composición del dataset de entrenamiento, lo que dificulta evaluar su comportamiento en dominios concretos.
- Licencia Apache 2.0: permite uso comercial, pero el usuario es responsable del cumplimiento normativo en su jurisdicción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/astroware/HaloGuard2-Stream-0.8B
- Modelo complementario de entrada: https://huggingface.co/astroware/HaloGuard1-Gen-0.8B
- Build de transformers referenciada: https://github.com/huggingface/transformers/archive/394b1a0eaa8e6199e372334da0aff3753a117fdb.tar.gz
