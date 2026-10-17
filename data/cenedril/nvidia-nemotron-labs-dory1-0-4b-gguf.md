# Cenedril/NVIDIA-Nemotron-Labs-Dory1.0-4B-GGUF

## Resumen

NVIDIA-Nemotron-Labs-Dory1.0-4B es un modelo de lenguaje de aproximadamente 4.000 millones de parámetros desarrollado por NVIDIA dentro de su línea Nemotron Labs. Su rasgo diferencial es la arquitectura "looped" o latente-recurrente: en lugar de apilar capas distintas, el modelo reaplica repetidamente un bloque compartido de 20 capas entre un bloque de entrada y otro de salida, de modo que puede gastar más cómputo por token sin aumentar el número de parámetros. Esto permite un ajuste elástico del coste de inferencia (1, 2 o 4 bucles) sobre un mismo checkpoint, sin reentrenar ni cambiar de pesos.

El repositorio analizado, Cenedril/NVIDIA-Nemotron-Labs-Dory1.0-4B-GGUF, es una cuantización comunitaria en formato GGUF con precisión Q5_K_M, publicada por el usuario Cenedril a partir del modelo original de NVIDIA. El modelo base soporta hasta 256K tokens de contexto, está entrenado únicamente en inglés y se distribuye bajo la licencia OpenMDW-1.1, que permite uso comercial y no comercial.

Su relevancia actual reside en la combinación de huella reducida (3,7 GB de repositorio en Q5_K_M), contexto muy largo y un mecanismo de razonamiento en espacio latente que reduce el número de tokens generados necesarios para resolver una tarea. El modelo original se publicó el 16 de octubre de 2026 y está disponible en BF16, MXFP8, NVFP4 y Q5_K_M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT normalizado (nGPT) con bucle latente-recurrente y atencion hibrida intercalada: sliding-window attention (SWA) y capas de atencion completa |
| Parametros totales | 3.975.229.440 (aproximadamente 4B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | hasta 256.000 tokens |
| Tipos de cuantizacion | Q5_K_M (este repositorio); el modelo original ofrece ademas BF16, MXFP8 y NVFP4 |
| Idiomas soportados | ingles (en) |
| Licencia | OpenMDW License Agreement, version 1.1 (openmdw-1.1) |
| Formato de pesos | GGUF (este repositorio); safetensors en las versiones originales |

## Arquitectura y entrenamiento

Dory1.0-4B emplea un backbone nGPT (normalized-GPT) organizado en tres grupos de capas: un bloque de entrada de 8 capas, un bloque recurrente compartido de 20 capas y un bloque de salida de 8 capas. El bloque recurrente se aplica varias veces entre entrada y salida, y la entrada se reinyecta en cada iteracion del bucle. La atencion es hibrida, alternando capas de sliding-window attention con capas de atencion completa, lo que reduce el coste del contexto largo. El modelo fue preentrenado de forma nativa en NVFP4, el formato de coma flotante de 4 bits de NVIDIA, y despues continuo el entrenamiento en BF16. Los datos proceden de nvidia/nemotron-pre-training-datasets (con fecha de corte en septiembre de 2025) y el postentrenamiento de nvidia/nemotron-post-training-v3 (con fecha de corte en mayo de 2026). No se especifica en la informacion disponible si se aplicaron tecnicas concretas de RLHF o DPO, ni el volumen total de tokens de entrenamiento.

La innovacion principal es el cacheo KV del ultimo bucle (last-loop KV caching): en un esquema de bucle estandar cada iteracion mantiene su propia cache KV y la memoria crece con el numero de bucles, mientras que Dory mantiene una unica cache por capa de atencion recurrente. Con esta opcion activada, el modelo no anade sobrecoste de cache KV respecto a un modelo no recurrente de tamano equivalente, independientemente del numero de bucles. El numero de bucles es un hiperparametro de inferencia: 1 bucle corresponde al menor coste de computo y 4 bucles al mayor, con ganancias de precision asociadas.

## Capacidades

- Generacion de texto conversacional en ingles con soporte de plantilla de chat (pipeline text-generation, tag conversational).
- Razonamiento general de proposito multiple en una huella pequena, segun la propia descripcion del autor.
- Razonamiento en espacio latente: el computo adicional por token se invierte en "pensar" internamente en lugar de alargar la salida, lo que reduce el numero de tokens generados.
- Codigo y tareas agénticas: los benchmarks publicados incluyen SciCode, SWE-bench Verified y Terminal-Bench 2.1, lo que indica capacidad para resolucion de problemas de programacion y uso de terminal.
- Tareas de agente con herramientas en dominios concretos: el benchmark τ³-bench (Banking) sugiere soporte de flujos de agente en escenarios de atencion al cliente o banca.
- Ajuste elastico del computo de inferencia: 1, 2 o 4 bucles sobre el mismo checkpoint, sin reentrenamiento ni cambio de pesos.
- Contexto largo de hasta 256K tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Capacidades de vision o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Atencion al cliente automatizada: con hasta 256K tokens de contexto, el modelo puede mantener conversaciones multi-turno con historial largo, documentacion de producto y politicas internas en la misma ventana, sin necesidad de resumir ni trocear el contexto.
- Agente de soporte bancario o financiero: el rendimiento reportado en τ³-bench (Banking) lo hace candidato para flujos de agente que consultan saldos, ejecutan operaciones y escalan a humanos, siempre que se valide el comportamiento real en produccion.
- Asistente de programacion en local: con 4 bucles alcanza 61,8 en SWE-bench Verified, por lo que puede integrarse en entornos de desarrollo para resolver issues acotados o generar parches, ejecutandose en una GPU de consumo.
- Automatizacion de terminal y scripting: los resultados en Terminal-Bench 2.1 (hasta 22,2 con 4 bucles) permiten usarlo en agentes que operan sobre shell para tareas de administracion y despliegue controlado.
- Analisis de documentacion tecnica extensa: el contexto de 256K tokens permite procesar manuales, contratos o bases de codigo completas en una sola pasada, con decodificacion local en GGUF.
- Prototipado e investigacion en arquitecturas recurrentes: al ser un modelo de bucle con computo elastico, es util para estudiar el intercambio entre bucles de inferencia y precision en tareas concretas sin cambiar de checkpoint.
- Despliegue en el borde o en portatiles: la cuantizacion Q5_K_M ocupa 3,7 GB, lo que permite ejecucion local en equipos con GPU modesta o incluso en CPU mediante llama.cpp para tareas de baja concurrencia.
- Clasificacion y extraccion de informacion en ingles: tareas de resumen, etiquetado y extraccion estructurada sobre corpus largos, con la ventaja del cacheo KV del ultimo bucle para no penalizar la memoria al aumentar los bucles.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor para Dory1.0-4B con 1, 2 y 4 bucles, comparados con modelos de la misma categoria. La tabla disponible esta truncada: solo se recogen las tareas completas que aparecen en la informacion proporcionada.

| Tarea | Dory 1 bucle | Dory 2 bucles | Dory 4 bucles | Qwen3.5-4B | Qwen3.5-9B | Gemma 4 26B A4B | Qwen3.6-35B-A3B |
|---|---|---|---|---|---|---|---|
| SciCode | 27,3 | 34,94 | 35,11 | 25,82 | 28,21 | 40,32 | 37,24 |
| SWE-bench Verified | 50,3 | 59,5 | 61,8 | 54,7 | 61,0 | 57,40 | 73,4 (reportado) |
| Terminal-Bench 2.1 | 12,5 | 18,1 | 22,2 | 15 | 24 | 35 | 43 |
| τ³-bench (Banking) | 11,6 | 12,89 | 14,69 | 5,03 | 7,22 | no disponible (tabla truncada) | no disponible (tabla truncada) |

El resto de tareas incluidas en la model card original no estan disponibles en la informacion proporcionada. No se han publicado en esta informacion resultados de MMLU, HumanEval, GSM8K ni otros benchmarks adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio GGUF en Q5_K_M ocupa 3,7 GB, por lo que los pesos requieren en torno a 4 GB de VRAM. Hay que sumar la cache KV, que depende del contexto efectivo y de si se activa el cacheo KV del ultimo bucle.
- GPU recomendadas: cualquier GPU con 6-8 GB de VRAM o mas es suficiente para contexto moderado. Para contexto cercano a 256K tokens se necesita mas memoria por la cache KV, y es recomendable usar GPU de 24 GB o superiores (RTX 3090/4090, A100, H100).
- Cabe en GPU de consumo: si. Ejemplos habituales: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. En tarjetas de 8 GB es viable con contexto reducido.
- Despliegue: llama.cpp y Ollama son las opciones naturales para el formato GGUF de este repositorio; LM Studio tambien lo soporta. Para las versiones en BF16, MXFP8 o NVFP4 del modelo original se usarian vLLM o TGI con backend compatible con CUDA.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. El coste de inferencia escala con el numero de bucles configurado, de modo que 4 bucles implican aproximadamente cuatro pasadas por el bloque recurrente frente a 1 bucle, con la precision adicional descrita en los benchmarks.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento destacado |
|---|---|---|---|---|---|
| Dory1.0-4B (4 bucles) | ~4B denso | 256K | OpenMDW-1.1 | GGUF, BF16, MXFP8, NVFP4 | SWE-bench Verified 61,8; SciCode 35,11 |
| Qwen3.5-4B | 4B | no disponible | no disponible | no disponible | SWE-bench Verified 54,7; SciCode 25,82 |
| Qwen3.5-9B | 9B | no disponible | no disponible | no disponible | SWE-bench Verified 61,0; SciCode 28,21 |
| Gemma 4 26B A4B | 26B (MoE, 4B activos) | no disponible | no disponible | no disponible | SWE-bench Verified 57,40; SciCode 40,32 |
| Qwen3.6-35B-A3B | 35B (MoE, 3B activos) | no disponible | no disponible | no disponible | SWE-bench Verified 73,4 (reportado); Terminal-Bench 2.1 43 |

Los datos de contexto, licencia y disponibilidad de los modelos comparados no estan disponibles en la informacion proporcionada; solo se dispone de sus resultados de benchmark parciales.

## Limitaciones y advertencias

- El modelo esta entrenado y evaluado unicamente en ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- Riesgo de alucinacion no cuantificado: no se han publicado en esta informacion tasas de alucinacion ni evaluaciones de fidelidad.
- Sesgos conocidos: la model card no documenta analisis de sesgos ni de seguridad. Al proceder de un corpus web a gran escala, es esperable la presencia de sesgos no mitigados explicitamente.
- Esta ficha corresponde a una cuantizacion comunitaria (Cenedril) y no a los pesos oficiales de NVIDIA: la perdida de precision de Q5_K_M respecto a BF16 no esta cuantificada en la informacion disponible. El repositorio registra 0 descargas y 0 likes, sin validacion de la comunidad.
- Restricciones de licencia: se aplica la OpenMDW-1.1, que permite uso comercial y no comercial, pero conviene revisar el texto completo del acuerdo antes de un despliegue en produccion.
- La ventana de 256K tokens exige una cache KV considerable en memoria, especialmente si no se activa el cacheo KV del ultimo bucle. En GPU de consumo esto obliga a reducir el contexto efectivo.
- El rendimiento depende fuertemente del numero de bucles configurado: usar 1 bucle degrada notablemente las metricas (por ejemplo, SWE-bench Verified baja de 61,8 a 50,3), por lo que el ajuste de computo debe validarse por tarea.
- Los benchmarks incluidos en la model card estan parcialmente truncados en la informacion disponible y algunos valores del modelo Qwen3.6-35B-A3B estan marcados como reportados por terceros, no verificados de forma independiente.
- Formatos NVFP4 y MXFP8 requieren hardware y stacks de inferencia especificos; no son portables a cualquier backend.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Cenedril/NVIDIA-Nemotron-Labs-Dory1.0-4B-GGUF
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Texto completo de la licencia (GitHub): https://raw.githubusercontent.com/OpenMDW/OpenMDW/refs/heads/main/1.1/LICENSE.OpenMDW-1.1
- Pagina de desarrollador de NVIDIA Nemotron: https://developer.nvidia.com/nemotron
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
- Dataset de preentrenamiento: https://huggingface.co/datasets/nvidia/nemotron-pre-training-datasets
- Dataset de postentrenamiento: https://huggingface.co/datasets/nvidia/nemotron-post-training-v3
