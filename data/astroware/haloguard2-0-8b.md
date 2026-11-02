# astroware/HaloGuard2-0.8B

## Resumen

HaloGuard 2.0-Stream-0.8B es un modelo de clasificación de tokens desarrollado por astroware, diseñado específicamente como guardián de seguridad de salida en tiempo real. A diferencia de los clasificadores de seguridad convencionales que evalúan una respuesta completa una vez generada, este modelo emite una probabilidad de inseguridad en cada token de la respuesta mientras esta se produce, permitiendo interrumpir una generación dañina a mitad de stream. Se construye sobre el backbone Qwen3.5-0.8B (752 millones de parámetros) y se distribuye con licencia Apache 2.0.

El modelo aborda un problema concreto en despliegues de LLM en producción: los guardianes de entrada solo inspeccionan el prompt antes de generar, por lo que no detectan respuestas que empiezan con un rechazo y después cumplen con la petición dañina. HaloGuard-Stream reporta además el índice del token donde la respuesta se vuelve insegura (`first_fire_index`), lo que permite trazabilidad y corte preciso del stream. Su contexto máximo es de 2.048 tokens y está entrenado únicamente en inglés.

La relevancia actual reside en su rendimiento: según la model card, alcanza un Macro-F1 medio de 83,6 en seis benchmarks de daño en respuestas con una única regla de decisión global, superando a Qwen3Guard-Stream en todos los tamaños (de 0,6B a 27B) por márgenes de +2,65 a +4,81 puntos. Es un modelo pequeño, desplegable en una sola GPU consumer, pensado para ejecutarse en línea junto al modelo generador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen3.5) con cabeza de clasificación por token |
| Parametros totales | 752.395.074 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (checkpoint en bfloat16; se menciona ejecución en ≥4 GB VRAM) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un transformer causal basado en Qwen3.5-0.8B al que se le añade una cabeza de clasificación por token que produce `P(unsafe)` en cada posición de la respuesta. La señal es causal: la probabilidad en el token *t* depende únicamente del prompt y de los tokens 0..*t*. El prompt se incluye en el forward pass como contexto, pero el scoring está restringido a posiciones de respuesta, de modo que ningún token del prompt puede disparar el veredicto. Esta restricción se aplica en tiempo de scoring y es lo que distingue al modelo de un clasificador de prompts con interfaz de guardián de salida.

La decisión a nivel de respuesta se forma mediante una regla de servicio calibrada (no forma parte de los pesos): se dispara si `max_t P(unsafe)_t ≥ 0.975` (brazo de pico) o si existen 2 tokens consecutivos con `P(unsafe)_t ≥ 0.70` (brazo de racha). El veredicto es latch: una vez disparado, no se revierte. La regla se distribuye en `serving_rule.json` y las probabilidades por token se exponen para permitir recalibrar el umbral según los costes de falsos positivos y falsos negativos. La política de entrenamiento trata explícitamente el patrón "rechaza primero, cumple después" como inseguro. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO.

## Capacidades

- Clasificación de seguridad por token sobre respuestas generadas, con veredicto binario `safe`/`unsafe` y latch.
- Detección del punto de inicio del daño en la respuesta (`first_fire_index`), habilitando el corte mid-stream.
- Condicionamiento sobre el prompt como contexto sin que este pueda disparar el veredicto.
- Detección de cumplimiento tras rechazo (compliance-after-refusal), un fallo que las heurísticas de prefijo y palabras clave no capturan.
- Regla de decisión de dos brazos (pico y racha corta) con umbrales calibrados y probabilidades crudas expuestas para reajuste.
- Clasificación de tokens (pipeline `token-classification`), no generación de texto.
- Solo inglés; no se documentan capacidades multilingües, tool calling, agentes ni visión.

## Casos de uso

- Moderación de salida en streaming: integrar el guardián en el bucle de decodificación del LLM generador y cortar la generación en cuanto se dispara el veredicto, evitando que el usuario reciba el resto de una respuesta dañina.
- Detección de compliance-after-refusal: en asistentes con política de rechazo, el guardián identifica respuestas que empiezan rechazando y después proporcionan la información peligrosa, un patrón que los filtros de prefijo dejan pasar.
- Trazabilidad y auditoría: registrar `first_fire_index` y las probabilidades por token para reconstruir en qué punto exacto de la respuesta se produjo la violación y alimentar revisiones posteriores.
- Ajuste de umbrales por dominio: usar las probabilidades crudas y `serving_rule.json` para recalibrar el punto de operación según el coste relativo de falsos positivos y falsos negativos en un producto concreto (por ejemplo, un chatbot médico frente a uno creativo).
- Capa de seguridad en pipelines de CI/CD de prompts: ejecutar el guardián sobre respuestas de regresión generadas por el modelo en pruebas automatizadas para detectar degradaciones de seguridad antes de desplegar.
- Investigación en seguridad de LLM: emplear el modelo como baseline de 0,8B con veredictos por token para comparar estrategias de moderación en streaming y estudiar la dinámica temporal del daño en respuestas.
- Despliegue en hardware modesto: al requerir una sola GPU con ≥4 GB de VRAM, puede co-ubicarse con el modelo generador en entornos con recursos limitados o en inferencia local.

## Benchmarks y rendimiento

Según la model card, el modelo alcanza un Macro-F1 medio de 83,6 en seis benchmarks de daño en respuestas bajo una única regla de decisión global, y 83,3 en el conjunto held-out. Se indica que supera a Qwen3Guard-Stream en todos los tamaños por +2,65 a +4,81 puntos. No se proporcionan en la información disponible las tablas desglosadas por benchmark ni los resultados de MMLU, HumanEval o GSM8K (no aplicables a un clasificador de tokens).

| Metrica | Valor |
|---|---|
| Macro-F1 medio (6 benchmarks) | 83,6 |
| Macro-F1 held-out | 83,3 |
| Ventaja sobre Qwen3Guard-Stream | +2,65 a +4,81 puntos (todos los tamaños) |

## Requisitos de hardware

- VRAM estimada: ≥4 GB para inferencia en bfloat16 según la model card; el repo ocupa 1,5 GB.
- GPU recomendadas: cualquier GPU con ≥4 GB de VRAM; cabe en GPUs consumer (RTX 3060, RTX 4060, RTX 4090) y en A100/H100 para despliegues de mayor concurrencia.
- Despliegue: `transformers` con `trust_remote_code=True`; se requiere una build fijada de transformers (commit `394b1a0eaa8e6199e372334da0aff3753a117fdb`) si la versión estándar no define el `model_type` de Qwen3.5. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Macro-F1 (respuestas) | Licencia |
|---|---|---|---|---|---|
| HaloGuard 2.0-Stream-0.8B | 0,75B | 2.048 | Guardián de salida por token | 83,6 | Apache 2.0 |
| Qwen3Guard-Stream (varios tamaños) | 0,6B–27B | no disponible | Guardián de salida en streaming | inferior en +2,65 a +4,81 puntos | no disponible |
| HaloGuard 1.0-Gen-0.8B | 0,8B | no disponible | Guardián de entrada (prompts) | 90,9 (prompts) | no disponible |

La comparativa se limita a los datos de la model card; no se dispone de cifras desglosadas por tamaño de Qwen3Guard-Stream ni de otros guardianes abiertos.

## Limitaciones y advertencias

- Solo inglés: no se documenta soporte multilingüe, lo que limita su uso en despliegues en castellano u otros idiomas.
- Contexto máximo de 2.048 tokens: respuestas o prompts más largos quedan fuera de la ventana y no pueden evaluarse correctamente.
- Es un clasificador, no un generador: no produce texto ni razonamiento; su única salida es una probabilidad de inseguridad por token y un veredicto.
- Riesgo de falsos positivos y negativos inherente a la calibración de umbrales; la regla de servicio es una propiedad del despliegue y debe reajustarse según el dominio.
- El veredicto es latch: una vez disparado no se revierte, lo que puede cortar streams legítimos si el umbral está mal calibrado.
- Requiere `trust_remote_code=True` y una build específica de transformers, lo que añade riesgo de cadena de suministro y complejidad de despliegue.
- No se detallan sesgos conocidos, composición del dataset de entrenamiento ni proceso de alineación, lo que dificulta evaluar su comportamiento en dominios sensibles.
- Licencia Apache 2.0 permite uso comercial, pero la política de seguridad subyacente no está documentada en detalle; conviene auditar el comportamiento antes de producción.

## Enlaces

- HuggingFace: https://huggingface.co/astroware/HaloGuard2-0.8B
- Modelo hermano (guardián de entrada): https://huggingface.co/astroware/HaloGuard1-Gen-0.8B
- Build fijada de transformers: https://github.com/huggingface/transformers/archive/394b1a0eaa8e6199e372334da0aff3753a117fdb.tar.gz
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
