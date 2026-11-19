# somenetworktrouble/NVIDIA-Nemotron-Labs-Dory1.0-4B-heretic-GGUF

## Resumen

NVIDIA-Nemotron-Labs-Dory1.0-4B es un modelo de lenguaje de aproximadamente 4.000 millones de parametros (3.975.229.440 exactos) desarrollado por NVIDIA dentro de su linea Nemotron Labs. Su rasgo diferencial es la arquitectura *looped* (latente-recurrente): en lugar de apilar capas distintas, divide la red en tres bloques (entrada, recurrente y salida) y aplica repetidamente el bloque recurrente compartido, de modo que un mismo checkpoint puede ejecutarse con distinto numero de bucles para intercambiar computo de inferencia por precision sin reentrenar ni cambiar de modelo.

El modelo parte de un backbone normalized-GPT (nGPT) con atencion hibrida que intercala capas de ventana deslizante (SWA) y capas de atencion completa, soporta contextos de hasta 256K tokens y se preentreno nativamente en NVFP4 antes de continuar en BF16. Esta pensado para razonamiento de proposito general en una huella pequena, con enfasis en eficiencia de tokens: el computo adicional por token se dedica a "pensar" en espacio latente en lugar de generar salidas mas largas.

La ficha corresponde a la variante GGUF publicada por el usuario `somenetworktrouble`, que ha pasado el modelo base por la herramienta `heretic-gguf` para producir una version "abliterada" (con reduccion de rechazos) en cuantizacion Q5_K_M. Es relevante ahora porque combina tres tendencias recientes: inferencia elastica en computo, preentrenamiento en formatos de 4 bits y publicacion de pesos abiertos bajo licencia OpenMDW-1.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped (latent-recurrent) normalized-GPT con atencion hibrida intercalada (SWA + atencion completa); bloques de entrada (8 capas), recurrente (20 capas) y salida (8 capas) |
| Parametros totales | 3.975.229.440 (~4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 256K tokens |
| Tipos de cuantizacion | Q5_K_M en esta variante GGUF; el modelo base ofrece BF16, MXFP8, NVFP4 y Q5_K_M |
| Idiomas soportados | ingles |
| Licencia | OpenMDW License Agreement, version 1.1 (`openmdw-1.1`) |
| Formato de pesos | GGUF (variante heretic); safetensors en el modelo base |
| Precision de referencia | Q5_K_M |
| Fecha de publicacion | 16 de octubre de 2026 (modelo base) |
| Fecha de corte de datos | preentrenamiento: septiembre de 2025; postentrenamiento: mayo de 2026 |
| Uso comercial | permitido (licencia OpenMDW-1.1) |

## Arquitectura y entrenamiento

Dory1.0-4B emplea una arquitectura *looped* o latente-recurrente sobre un backbone normalized-GPT (nGPT). La pila de capas se divide en tres grupos: un bloque de entrada (I) de 8 capas, un bloque recurrente (R) compartido de 20 capas que se aplica varias veces entre la entrada y la salida, y un bloque de salida (O) de 8 capas. La entrada se reinyecta en cada bucle. Esta comparticion de parametros permite aumentar el computo por token sin incrementar el numero de pesos, y el checkpoint unico admite distintos presupuestos de inferencia (1, 2 o 4 bucles en los resultados publicados) sin reentrenamiento.

La atencion es hibrida: intercala capas de ventana deslizante (SWA) con capas de atencion completa, lo que reduce coste de memoria en contextos largos. Una innovacion destacable es el *last-loop KV caching*: aunque el bucle estandar almacena una cache KV por cada pasada, Dory mantiene una sola cache por capa de atencion recurrente, de modo que no anade sobrecoste de memoria frente a un modelo no bucleado. El modelo se preentreno nativamente en NVFP4 (formato de coma flotante de 4 bits de NVIDIA) y continuo el entrenamiento en BF16. Los datos de preentrenamiento proceden de `nvidia/nemotron-pre-training-datasets` (corte en septiembre de 2025) y el postentrenamiento de `nvidia/nemotron-post-training-v3` (corte en mayo de 2026). No se detalla en la informacion disponible el numero exacto de tokens ni la composicion del dataset, ni si se empleo RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento de proposito general en ingles.
- Razonamiento con presupuesto de computo elastico: 1, 2 o 4 bucles del bloque recurrente permiten ajustar precision frente a coste de inferencia.
- Eficiencia de tokens: el computo extra se invierte en razonamiento latente en lugar de cadenas de salida mas largas.
- Capacidades de codigo y agenticas reflejadas en los benchmarks publicados (SciCode, SWE-bench Verified, Terminal-Bench 2.1).
- Contexto largo de hasta 256K tokens, adecuado para documentos extensos y conversaciones multi-turno largas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: evaluado en benchmarks agenticos, aunque sin detalle de implementacion.
- Capacidades multilingues limitadas al ingles.
- Capacidades de vision o audio: no disponibles.
- Variante "heretic": reduccion deliberada de comportamientos de rechazo mediante la herramienta `heretic-gguf`.

## Casos de uso

- Razonamiento general en produccion con presupuesto variable: desplegar el mismo checkpoint con 1 bucle para tareas de baja latencia y con 4 bucles para tareas que requieran mayor precision, sin cambiar de modelo ni reentrenar.
- Analisis de documentos largos: gracias a sus 256K tokens de contexto, puede procesar contratos, informes o bases de codigo extensas en una sola pasada, con las capas SWA reduciendo el coste de memoria.
- Asistencia de codigo y tareas de ingenieria de software: sus resultados en SWE-bench Verified y SciCode lo hacen util para generacion y depuracion de codigo dentro de pipelines, siempre que se valide la salida.
- Automatizacion de terminal y agentes de linea de comandos: los resultados en Terminal-Bench 2.1 indican uso en tareas de shell y flujos agenticos multi-paso.
- Despliegue en hardware limitado: al ser un modelo de ~4B en Q5_K_M, cabe en GPUs de consumo y en entornos de borde, lo que facilita prototipado y servicios de bajo coste.
- Investigacion sobre arquitecturas recurrentes y computo elastico: sirve como banco de pruebas para estudiar el equilibrio entre numero de bucles, precision y latencia.
- Experimentacion con modelos sin rechazos: la variante heretic es util para estudiar comportamiento de rechazo y alineacion, con las cautelas eticas correspondientes.

## Benchmarks y rendimiento

Resultados publicados en la model card del modelo base (Dory1.0-4B), comparados con alternativas. La columna Dory1.0-4B varia segun el numero de bucles; la marca † indica puntuacion reportada por terceros.

| Tarea | Dory 1 loop | Dory 2 loops | Dory 4 loops | Qwen3.5-4B | Qwen3.5-9B | Gemma 4 26B A4B | Qwen3.6-35B-A3B |
|---|---|---|---|---|---|---|---|
| SciCode | 27,3 | 34,94 | 35,11 | 25,82 | 28,21 | 40,32 | 37,24 |
| SWE-bench Verified | 50,3 | 59,5 | 61,8 | 54,7 | 61,0 | 57,40 | 73,4† |
| Terminal-Bench 2.1 | 12,5 | 18,1 | 22,2 | 15 | 24 | 35 | 43 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval o GSM8K para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, un modelo de ~4B en Q5_K_M ocupa aproximadamente 3 GB de pesos; el consumo real depende del contexto (hasta 256K tokens) y del numero de bucles.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, es plausible su ejecucion en GPUs de consumo, aunque no se confirma oficialmente.
- Cabe en GPU de consumo: previsiblemente si, en cuantizacion Q5_K_M, aunque no se especifica en la documentacion.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp y Ollama; la model card indica compatibilidad con `transformers` y `endpoints_compatible`. Para el modelo base en BF16/MXFP8/NVFP4 se esperaria soporte de stacks de NVIDIA, aunque no se detalla.
- Latencia y throughput: no disponibles. El coste escala con el numero de bucles configurado (1, 2 o 4).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Dory1.0-4B (este) | ~4B | 256K | OpenMDW-1.1 | Arquitectura looped, computo elastico, solo ingles |
| Qwen3.5-4B | ~4B | no disponible | no disponible | Comparable en tamano; mejor en Terminal-Bench a 1 bucle de Dory |
| Qwen3.5-9B | ~9B | no disponible | no disponible | Mayor tamano; supera a Dory 4 loops en SWE-bench y Terminal-Bench |
| Gemma 4 26B A4B | 26B (MoE, ~4B activos) | no disponible | no disponible | Mayor capacidad en SciCode y Terminal-Bench |
| Qwen3.6-35B-A3B | 35B (MoE, ~3B activos) | no disponible | no disponible | El mas fuerte de la comparativa en SWE-bench y Terminal-Bench |

## Limitaciones y advertencias

- Solo soporta ingles; no se garantiza calidad en castellano ni en otros idiomas.
- La variante heretic reduce los rechazos de forma deliberada, lo que puede aumentar el riesgo de generar contenido inapropiado o danino y complica el cumplimiento de politicas de seguridad en produccion.
- Riesgo de alucinacion inherente a los modelos de ~4B; conviene validar salidas en tareas criticas.
- El rendimiento depende fuertemente del numero de bucles configurado: con 1 bucle los resultados caen de forma notable frente a 2 o 4.
- La licencia OpenMDW-1.1 permite uso comercial, pero debe revisarse el texto completo para obligaciones de atribucion y condiciones.
- El contexto de 256K no implica calidad uniforme en toda la ventana; no hay datos publicados sobre degradacion con la longitud.
- No se dispone de informacion sobre sesgos evaluados, datos de alineacion (RLHF/DPO) ni evaluaciones de seguridad.
- La cuantizacion Q5_K_M introduce perdida de precision respecto al modelo base en BF16.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/somenetworktrouble/NVIDIA-Nemotron-Labs-Dory1.0-4B-heretic-GGUF
- Pagina de desarrollador de NVIDIA Nemotron: https://developer.nvidia.com/nemotron
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Texto de la licencia OpenMDW-1.1: https://raw.githubusercontent.com/OpenMDW/OpenMDW/refs/heads/main/1.1/LICENSE.OpenMDW-1.1
- Herramienta heretic-gguf: https://github.com/MoriNoNushi/heretic-gguf
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
- Dataset de preentrenamiento: https://huggingface.co/datasets/nvidia/nemotron-pre-training-datasets
- Dataset de postentrenamiento: https://huggingface.co/datasets/nvidia/nemotron-post-training-v3
