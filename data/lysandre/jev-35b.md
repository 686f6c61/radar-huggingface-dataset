# lysandre/JEV-35B

## Resumen

JEV-35B es un modelo de decisión de tipo "System 1" construido por AutoTrust AI mediante fine-tuning del modelo base Qwen/Qwen3.5-35B-A3B. Su propósito no es la generación libre de texto, sino emitir decisiones tipadas y con probabilidades calibradas sobre un conjunto de hasta 256 opciones en una sola pasada, lo que lo sitúa en la categoría de modelos de clasificación y ranking más que en la de asistentes conversacionales. Se distribuye con licencia Apache 2.0 y pesos en safetensors, con un total de 35.951.822.704 parámetros y una arquitectura de mezcla de expertos (MoE) en la que aproximadamente 3.000 millones de parámetros están activos por token.

El modelo parte de la arquitectura Qwen3.5-35B-A3B y hereda su tokenizador y su torre de visión, lo que le permite procesar entradas de imagen y texto (pipeline image-text-to-text) además de texto puro. Sobre esa base, AutoTrust ha entrenado un cabezal de decisión orientado a producir distribuciones de probabilidad sobre opciones discretas, con soporte para tool calling y despliegue mediante vLLM. La model card declara una puntuación de 59,73 en el Decision Index 0.3 (suite pública) y un rendimiento aproximado de 71,94 en su reconstrucción de benchmarks de visión.

Su relevancia actual reside en la propuesta de sustituir equipos de ranking y re-ranking por un único modelo de decisión calibrado con latencia baja: la model card reporta una latencia mediana de 204 ms por petición en una GPU B200, y una variante cuantizada en NVFP4 que reduce el peso a 25,6 GB y permite ejecución en GPUs de 32-48 GB. Es, por tanto, una alternativa interesante para sistemas de recomendación, búsqueda y enrutamiento donde la latencia y la calibración importan más que la generación creativa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), base Qwen3.5-35B-A3B, con cabezal de decisión tipada |
| Parámetros totales | 35.951.822.704 |
| Parámetros activos | Aproximadamente 3.000 millones por token (según la model card: "about 3 B active per token") |
| Longitud de contexto | No disponible |
| Tipos de cuantización | bf16 (repo principal); NVFP4 en el repo autotrust/JEV-35B-NVFP4 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); compatible con vLLM |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del Qwen3.5-35B-A3B, un transformer de mezcla de expertos con 35.951 millones de parámetros totales y alrededor de 3.000 millones activos por token. La innovación principal no está en la arquitectura base, sino en el cabezal y el entrenamiento de decisión: el modelo emite decisiones tipadas (choice, score) con probabilidades calibradas sobre hasta 256 opciones en una sola pasada, lo que la model card describe como "System 1". No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La model card indica que el entrenamiento de decisión fue exclusivamente textual ("no robot or embodied data in JEV-35B's decision training (text only)"), pese a lo cual el modelo conserva capacidades de visión heredadas del base y las explota en tareas de razonamiento encarnado. También se menciona un modo "thinking" que activa el modelo base sin modificar (System 2) y combina su distribución de respuesta al 50/50 con la de System 1; en el caso de JEV-35B, la model card aclara que el modelo no tiene modo thinking propio, y que ese modo se documenta para el modelo hermano JEV-27B-VL. El despliegue se realiza mediante un script `serve.sh` propio y una API compatible con `/v1/decide`.

## Capacidades

- Clasificación y decisión tipada: emite decisiones `choice` y `score` con probabilidades calibradas sobre hasta 256 opciones en una sola pasada.
- Procesamiento de imagen y texto: pipeline image-text-to-text, con torre de visión heredada del modelo base.
- Razonamiento espacial, de acción, de trayectoria, de estado y de tarea en escenarios físicos (evaluado en ERQA).
- Razonamiento multi-vista y pointing sobre imágenes.
- Soporte de tool calling y function calling (etiqueta `endpoints_compatible`).
- Capacidades multilingües: limitadas al inglés según la model card.
- No dispone de modo thinking propio; el modo System 2 se describe para el modelo hermano JEV-27B-VL.
- Compatible con vLLM para servir la API de decisión.

## Casos de uso

- Re-ranking en motores de búsqueda: el modelo puede recibir los resultados de varios buscadores (Google News, Bing News, Yahoo News) y reordenarlos por relevancia en una sola pasada, como demuestra la demo GuruSearch de AutoTrust.
- Recomendación de contenidos: agregación de titulares de varios feeds y ordenación por importancia mediante decisiones calibradas, con latencia mediana de 204 ms en B200.
- Enrutamiento de consultas en pipelines de agentes: clasificar una consulta de entrada entre hasta 256 intenciones o herramientas con probabilidades calibradas, sustituyendo a un clasificador separado.
- Moderación y etiquetado: asignación de categorías discretas a textos o imágenes con puntuaciones de confianza utilizables para umbrales de decisión.
- Razonamiento encarnado y robótica: responder preguntas de opción múltiple sobre escenas físicas (ERQA) sin entrenamiento específico en datos de robot, útil para planificación de alto nivel en agentes embodied.
- Verificación de tareas en entornos simulados: evaluar si una tarea se completó correctamente a partir de imágenes y una descripción textual.
- Selección de respuestas en sistemas de generación aumentada: elegir entre múltiples candidatos generados por otro modelo mediante scoring calibrado.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo en la model-index y en la model card. No se han verificado de forma independiente.

| Benchmark | Métrica | JEV-35B | Referencia comparada |
|---|---|---|---|
| Decision Index 0.3, suite pública | decision_index | 59,73 | JEV-27B-VL: 53,64 en el board |
| Reconstrucción de benchmarks de visión | score aproximado | 71,94 | JEV-27B-VL: 71,67 en la misma reconstrucción |
| ERQA (una pasada, sin thinking) | precisión | 51,3 % | PhysBrain 1.5: 52,8 %; otros modelos embodied de 7-9B: 42,3-47,5 % |
| Latencia mediana por petición (B200) | ms | 204 | JEV-27B-VL: 271 ms |

La model card también reporta para la variante NVFP4 un Decision Index 0.3 de 59,18 (frente a 59,73 en bf16), una reconstrucción de visión de 71,23 (frente a 71,94) y un 96,6 % de respuestas idénticas a bf16 en el Decision Index.

## Requisitos de hardware

- VRAM estimada en bf16: 66,5 GiB de memoria de GPU para los pesos (descarga de 72 GB).
- VRAM estimada en NVFP4: 23,3 GiB de memoria de GPU para los pesos (descarga de 25,6 GB).
- GPU recomendadas: una B200 para la versión bf16 según las mediciones del autor; la variante NVFP4 cabe en una GPU de 32-48 GB.
- GPU de consumo: la versión bf16 no cabe en GPUs de consumo de 24 GB; la NVFP4 podría ejecutarse en GPUs de 32 GB o más, aunque no se especifican modelos concretos de consumo.
- Opciones de despliegue: vLLM (etiqueta del repo) y el script `serve.sh` propio del autor con API `/v1/decide`.
- Latencia: mediana de 204 ms por petición en una B200 para la versión bf16; la variante NVFP4 mantiene la misma latencia según la model card.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decision Index 0.3 | ERQA | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| JEV-35B (este modelo) | 35,95 B totales, ~3 B activos | No disponible | 59,73 | 51,3 % | Apache 2.0 | Pesos abiertos en Hugging Face |
| JEV-27B-VL | No disponible | No disponible | 53,64 | 61,5 % con thinking | No disponible | Pesos abiertos en Hugging Face |
| PhysBrain 1.5 | No disponible | No disponible | No disponible | 52,8 % | No disponible | No disponible |
| Modelos embodied abiertos de 7-9B | 7-9 B | No disponible | No disponible | 42,3-47,5 % | No disponible | No disponible |

## Limitaciones y advertencias

- El modelo está entrenado y evaluado principalmente en inglés; no se declaran capacidades multilingües.
- No dispone de modo thinking propio, lo que limita el razonamiento multi-paso en comparación con JEV-27B-VL.
- Riesgo de alucinación en las decisiones: aunque emite probabilidades calibradas, no se han publicado análisis de calibración independientes.
- El entrenamiento de decisión es exclusivamente textual; el rendimiento en visión depende de las capacidades heredadas del modelo base y no de un entrenamiento específico.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (campo `verified: false` en la model-index).
- El modelo no está afiliado a TypeSafe AI ni a su producto TypeSafe Jev 1.13; la model card lo aclara explícitamente para evitar confusión.
- No se dispone de información sobre sesgos, composición del dataset de entrenamiento ni evaluación de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-35B-A3B puede tener condiciones adicionales que conviene revisar.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/lysandre/JEV-35B
- Variante NVFP4: https://huggingface.co/autotrust/JEV-35B-NVFP4
- Modelo hermano JEV-27B-VL: https://huggingface.co/autotrust/JEV-27B-VL
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Blog del autor: https://huggingface.co/blog/autotrust/one-decision-model-instead-of-a-ranking-team-short
- Demo GuruSearch: https://news.guru.so/ui
- Benchmark ERQA: https://github.com/embodiedreasoning/ERQA
