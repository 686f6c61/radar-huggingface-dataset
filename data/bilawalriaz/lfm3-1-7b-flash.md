# bilawalriaz/lfm3-1.7b-flash

## Resumen

LFM3-1.7B Flash es un ajuste fino mediante LoRA del modelo LiquidAI/LFM3-1.7B, desarrollado por el usuario bilawalriaz y publicado en Hugging Face. Su objetivo es resolver un problema concreto en agentes locales: la latencia provocada por el bucle de razonamiento del propio modelo, que tiende a ejecutar una llamada a herramienta por turno, releyendo el contexto en cada iteración. Flash reescribe ese comportamiento para agrupar varias llamadas independientes en un único turno del asistente, reduciendo el número de turnos y de tokens generados.

El modelo mantiene la arquitectura del LFM3 original (transformer de 1.728.801.600 parámetros) y se distribuye exclusivamente en formato GGUF para llama.cpp, con cuantizaciones desde Q4_0 hasta f16. La model card reporta una mejora de éxito del 92,9% al 96,5% en un conjunto de 254 tareas, con una reducción del 72% en tokens generados y una latencia mediana de 5,69 s a 1,94 s sobre una RTX 2070 Max-Q.

Es relevante ahora porque propone un enfoque práctico para abaratar agentes locales en hardware de consumo (8 GB de VRAM), un segmento donde el coste por turno y el número de turnos determinan la viabilidad del despliegue. No obstante, las capacidades están acotadas a un dominio sintético de mantenimiento y a un único idioma (inglés).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base LiquidAI/LFM3-1.7B) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de ejecucion usa `-c 8192`) |
| Tipos de cuantizacion | Q4_0, Q4_K_M, Q5_K_M, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | lfm1.0 (other) |
| Formato de pesos | GGUF (llama.cpp); adaptador LoRA sobre el checkpoint base |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B, un transformer de 1.728.801.600 parámetros. El ajuste se realizó mediante LoRA con rango 16 aplicado a las proyecciones de atención y MLP, con 16,5 millones de parámetros entrenables, dos épocas en fp16 sobre 485 trayectorias. La función de pérdida se aplica únicamente a los tokens del asistente (pensamiento, llamadas y respuesta final); los system prompts, turnos de usuario y salidas de herramientas no se supervisan.

Los datos de entrenamiento provienen de un entorno de fixtures sintético que incluye un corpus documental, registros estructurados, ficheros de workspace, aritmética y un almacén de estado en sandbox. Un modelo profesor propuso llamadas a herramientas en JSON, un proceso local las ejecutó contra los fixtures y el profesor recibió los resultados reales; un verificador comprobó hechos, estado final, orden de dependencias y presupuestos de llamadas, y solo las trayectorias que pasaron entraron en el conjunto de entrenamiento. La innovación técnica destacable es el aprendizaje de batching de llamadas independientes en un solo turno, manteniendo la espera en llamadas con dependencia secuencial y la recuperación ante fallos inyectados de herramientas.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat propia (`<|im_start|>`, `<think>`, `<tool_call>`, `<|im_end|>`).
- Tool calling y function calling con formato estructurado basado en `<function=...>` y `<parameter=...>`.
- Agrupación de múltiples llamadas independientes en un único turno del asistente.
- Ordenación correcta de dependencias entre llamadas (las dependientes esperan al resultado previo).
- Recuperación ante fallos inyectados de herramientas (24/24 en la evaluación reportada).
- Refusal ante registros inexistentes.
- Razonamiento multi-step dentro de un mismo turno mediante el bloque `<think>`.
- No dispone de capacidades de visión, audio ni thinking mode extendido más allá del bloque de pensamiento citado.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Agentes de mantenimiento industrial: el modelo está entrenado sobre un entorno de fixtures de mantenimiento con registros estructurados y corpus documental, por lo que encaja en asistentes que consultan fichas de activos (por ejemplo, `P-102`, `SITE-9`) y devuelven resultados consolidados en un solo turno.
- Automatización de consultas paralelas a APIs: cuando una petición requiere varios lookups independientes, Flash emite todas las llamadas en un turno y un ejecutor las lanza simultáneamente, reduciendo la latencia frente a un bucle secuencial.
- Asistentes locales en hardware de consumo: con Q4_K_M (1,02 GiB) cabe en GPUs de 8 GB y permite desplegar agentes en estaciones de trabajo sin infraestructura dedicada.
- Pipelines con presupuesto de tokens ajustado: la reducción del 72% en tokens generados (494,6 a 138,6 por tarea) abarata el coste por tarea en entornos con facturación por token o con límites de contexto.
- Recuperación ante errores de herramientas: útil en integraciones donde las APIs fallan de forma intermitente, ya que el modelo recupera fallos inyectados mejor que el base (24/24 frente a 17/24).
- Orquestación de flujos con dependencias: tareas de tipo secuencial donde una llamada necesita el resultado de la anterior se resuelven correctamente (21/21 frente a 19/21 del base).
- Integración en llama.cpp con endpoint `/completion`: adecuado para servir el modelo con plantilla de chat propia y un parser de herramientas externo que no trunque la generación tras la primera llamada.

## Benchmarks y rendimiento

Evaluación sobre 254 tareas de un entorno sintético de mantenimiento, mismos pesos f16, decodificación greedy, RTX 2070 Max-Q:

| Metrica | Base | Run1 | Flash (run2) |
|---|---|---|---|
| Exito | 236/254 (92,9%) | 230/254 (90,6%) | 245/254 (96,5%) |
| Turnos del modelo por tarea | 2,64 | 2,06 | 2,43 |
| Llamadas a herramienta por tarea | 3,40 | 2,45 | 2,94 |
| Tokens generados por tarea | 494,6 | 118,7 | 138,6 |
| Latencia mediana | 5,69 s | 1,84 s | 1,94 s |
| Violaciones de dependencia | 0 | 0 | 0 |

Comparación pareada frente al base en las mismas tareas: +3,2 puntos, IC 95% de −0,4 a +6,8. Desglose por familia: recuperación de fallos inyectados 24/24 frente a 17/24; tareas secuenciales 21/21 frente a 19/21; lotes independientes 74/74 en ambos; aritmética y conversión de unidades 71/77 frente a 74/77; ambas versiones fallan las dos tareas de evidencia contradictoria. Antes de la evaluación final, Flash superó una puerta de desarrollo separada de 60 tareas con 56/60 frente a 52/60 del base.

Rendimiento de cuantizaciones (suite de humo de cinco o seis tareas, no accuracy):

| Fichero | Tamano | Suite de humo |
|---|---|---|
| `lfm3-1.7b-flash-Q4_0.gguf` | 0,98 GiB | 5/5 |
| `lfm3-1.7b-flash-Q4_K_M.gguf` | 1,02 GiB | 6/6 |
| `lfm3-1.7b-flash-Q5_K_M.gguf` | 1,17 GiB | 5/5 |
| `lfm3-1.7b-flash-Q8_0.gguf` | 1,72 GiB | 5/5 |
| `lfm3-1.7b-flash-f16.gguf` | 3,23 GiB | referencia |

Latencia mediana en esa comprobación: Q4_0 1,14 s, Q8_0 1,31 s.

## Requisitos de hardware

- VRAM estimada: Q4_0 ~0,98 GiB, Q4_K_M ~1,02 GiB, Q5_K_M ~1,17 GiB, Q8_0 ~1,72 GiB, f16 ~3,23 GiB de pesos; añadir overhead de contexto KV.
- GPU recomendadas: RTX 2070 Max-Q validada en la model card; cualquier GPU consumer con 4 GB o más debería alojar las cuantizaciones Q4 y Q5.
- Cabe en GPU consumer: sí, con Q4_K_M en tarjetas de 8 GB y en la mayoría de GPUs de gama media recientes.
- Despliegue: llama.cpp (`llama-server`), con `-c 8192 -ngl 99` en el ejemplo; compatible con endpoints OpenAI (`endpoints_compatible`). No se documenta soporte para vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: latencia mediana de 1,94 s por tarea en la evaluación f16 sobre RTX 2070 Max-Q; 1,14 s mediana con Q4_0 en la suite de humo. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exito (254 tareas) | Tokens/tarea | Latencia mediana | Licencia |
|---|---|---|---|---|---|---|
| LFM3-1.7B Flash | 1,73 B | no disponible | 96,5% | 138,6 | 1,94 s | lfm1.0 |
| LiquidAI/LFM3-1.7B (base) | 1,73 B | no disponible | 92,9% | 494,6 | 5,69 s | lfm1.0 |
| LFM3-1.7B Flash run1 | 1,73 B | no disponible | 90,6% | 118,7 | 1,84 s | lfm1.0 |

No se dispone de datos de benchmarks frente a otros modelos de la misma categoría (por ejemplo, otros modelos de 1-2 B orientados a tool calling) en la información proporcionada.

## Limitaciones y advertencias

- Los datos de entrenamiento son sintéticos y de un único dominio; enseñan batching, orden de dependencias, recuperación de fallos y refusal, no uso general de herramientas.
- Las evaluaciones son solo en inglés y con una única semilla de entrenamiento; el resultado de 254 tareas es una ejecución única.
- Las tareas de evidencia contradictoria fallan: el modelo tiende a confiar en un documento erróneo en lugar de comprobar los registros.
- La aritmética depende de la llamada a herramienta; si omite `calculate` o `convert_units`, puede dar resultados incorrectos (run1 es el ejemplo).
- Las cuantizaciones se validaron en cinco tareas, no sobre la suite completa de evaluación.
- La licencia lfm1.0 impone restricciones que deben revisarse antes de uso comercial; se hereda del modelo base.
- El endpoint de chat de llama.cpp puede aplicar su propio parser de herramientas y detenerse tras la primera llamada; se recomienda usar `/completion` con la plantilla de chat propia.
- Riesgo de alucinación no cuantificado en la información disponible; el modelo puede omitir llamadas a herramientas y responder de memoria.
- Sesgos conocidos no documentados en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bilawalriaz/lfm3-1.7b-flash
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia del base: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
