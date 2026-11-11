# elvezjp/DeepSeek-V4.1-Flash-1017-ELVEZ-FP4-gguf

## Resumen

DeepSeek-V4.1-Flash-1017-ELVEZ-FP4 es una cuantizacion GGUF del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek, publicada por ELVEZ (Japon) para su distribucion interna IXV. La particularidad de esta version es que preserva los expertos enrutados (routed experts) exactamente en el formato FP4 original de DeepSeek (valores E2M1 con una escala E8M0 por cada 32 valores), repackados al layout MXFP4 de GGUF sin alterar ningun valor. Las matrices no expertas (proyecciones de atencion, expertos compartidos, cabeza de salida) se convierten de FP8 a Q8_0, y las tablas Engram se mantienen en FP8 oficial.

El modelo base es un transformer con arquitectura de mezcla de expertos (MoE) segun se deduce de la presencia de routed experts y shared experts. El repositorio ocupa 501,6 GB, distribuido en tres partes de aproximadamente 167 GB cada una, lo que refleja el gran tamano del checkpoint original. La model card indica que el modelo esta pensado para ejecutarse en un Mac Studio con M3 Ultra y 512 GB de memoria unificada, mediante el motor propietario `ixv-server` con backend Metal.

La relevancia de esta ficha es doble: por un lado, documenta una cuantizacion que mantiene la precision original de los expertos (a diferencia de la variante Q2 del mismo autor, que comprime a unos 2,3 bits); por otro, advierte de que el GGUF no es de proposito general y no funciona con llama.cpp ni Ollama, lo que limita su uso a entornos controlados. La licencia es MIT, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); routed experts + shared experts; incluye tablas Engram y un encoder de vision separado |
| Parametros totales | no disponible (el repo pesa 501,6 GB; los expertos enrutados ocupan 288.777.830.400 bytes) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (expertos enrutados, valores FP4 E2M1 + escala E8M0), Q8_0 (atencion, expertos compartidos, cabeza de salida), F16/F32 (norms, router y tensores pequenos), FP8 (tablas Engram) |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (3 partes que se unen con `cat`; 1.046 tensores) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de lo que se infiere del proceso de cuantizacion: se trata de un transformer con mezcla de expertos, con expertos enrutados (gate, up y down) almacenados en FP4 en el checkpoint oficial, expertos compartidos, proyecciones de atencion en FP8, un router y norms en F16/F32, y tablas Engram en FP8. El modelo incluye ademas un encoder de vision (`DeepSeek-V4.1-Flash-1017-Vision.gguf`) y una cabeza draft DSpark (`DeepSeek-V4.1-Flash-1017-DSpark.gguf`) para decodificacion especulativa, aunque estos archivos no se incluyen en este repositorio y remiten al repositorio de la variante Q2.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. La innovacion tecnica destacable de esta publicacion es el repack de los expertos FP4 oficiales al layout MXFP4 de GGUF sin recalcular valores ni aplicar imatrix, lo que preserva exactamente la precision del checkpoint original. La conversion se realizo con `deepseek41_quantize.py --quant fp4` en unos 17 minutos sobre un M3 Ultra con 16 hilos, y se valido con `deepseek41_validate_gguf.py`, comprobando los 1.046 layouts de tensores y que cada experto enrutado coincide con el repack de los bytes FP4 oficiales.

## Capacidades

- Generacion de texto en japones e ingles, con resultados iguales o ligeramente mejores que la variante Q2 en QA japones y escritura de formato largo, segun las mediciones del autor.
- Generacion de codigo: obtuvo 162/164 en HumanEval en el banco de pruebas del autor sobre Mac Studio M3 Ultra.
- Razonamiento multi-turno y conversacional (se infiere del uso previsto como modelo principal en una distribucion de desarrollo de software).
- Capacidades de vision mediante el encoder separado `DeepSeek-V4.1-Flash-1017-Vision.gguf` (no incluido en este repo).
- Decodificacion especulativa mediante la cabeza draft DSpark (no incluida en este repo).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues limitadas a japones e ingles segun los tags del repositorio.

## Casos de uso

- Asistencia al desarrollo de software en japones: el modelo esta pensado como modelo principal de IXV, la distribucion de IA para desarrollo de software en Japon de ELVEZ, por lo que encaja en tareas de generacion y revision de codigo con documentacion y comentarios en japones.
- Evaluacion de cuantizaciones FP4 frente a Q2: util para investigadores que quieran comparar el impacto de preservar los expertos en FP4 original (287 GiB de memoria, 162/164 en HumanEval) frente a comprimirlos a 2,3 bits (161 GiB, 152/164).
- Generacion de codigo verificada en local: con 162/164 en HumanEval medido por el autor, puede emplearse en pipelines de generacion de codigo donde se requiera ejecucion totalmente local en hardware Apple Silicon de gran capacidad.
- Procesamiento de documentacion tecnica bilingue japones-ingles: el modelo mantiene calidad en QA japones y escritura de formato largo, adecuado para resumir o redactar documentacion en ambos idiomas.
- Reproduccion de la cadena de cuantizacion: el repositorio documenta comandos, hashes SHA-256 y validaciones, lo que permite reproducir el proceso y auditar la fidelidad de los pesos.
- Inferencia en estaciones de trabajo con memoria unificada: requiere unos 287 GiB de memoria, por lo que solo es viable en equipos como el Mac Studio M3 Ultra de 512 GB; sirve para prototipos y evaluaciones internas en ese tipo de hardware.
- Vision por computador en local: combinando este GGUF con el encoder de vision del repositorio Q2, se pueden abordar tareas de descripcion de imagenes o extraccion de informacion de documentos, siempre con el motor `ixv-server`.

## Benchmarks y rendimiento

| Benchmark | Este modelo (FP4) | Variante Q2 del mismo autor | Condiciones |
|---|---:|---:|---|
| HumanEval | 162/164 | 152/164 | Mac Studio M3 Ultra 512 GB, mismo motor y ajustes |
| QA en japones | igual o ligeramente mejor | referencia | Mismo entorno |
| Escritura de formato largo | igual o ligeramente mejor | referencia | Mismo entorno |
| Velocidad de decodificacion | 5-8 % mas lenta | referencia | Mismo entorno |
| Memoria necesaria | ~287 GiB | ~161 GiB | Mismo entorno |

No se han publicado resultados de MMLU, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- Memoria necesaria para inferencia: aproximadamente 287 GiB (frente a unos 161 GiB de la variante Q2); los pesos principales que permanecen en memoria son unos 278,3 GiB y el motor lee del disco solo las filas Engram necesarias.
- Espacio en disco: el archivo unido ocupa 501.609.136.128 bytes; unir las tres partes requiere ademas unos 467 GiB libres.
- GPU recomendadas: el autor solo ha probado un Mac Studio con M3 Ultra y 512 GB de memoria unificada con backend Metal. No hay datos de GPUs NVIDIA (A100, H100, RTX 4090) ni de otras plataformas.
- Compatibilidad con GPU de consumo: no cabe en ninguna GPU de consumo actual; el requisito de memoria lo excluye.
- Opciones de despliegue: exclusivamente el motor propietario `ixv-server` de IXV con Metal. El autor advierte explicitamente de que llama.cpp, Ollama y otros fragmentos generados por Hugging Face no se han probado y no se espera que funcionen, porque el GGUF almacena las tablas Engram en un layout propio.
- Latencia y throughput: la decodificacion es un 5-8 % mas lenta que la variante Q2 en el mismo hardware; no se proporcionan valores absolutos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-ELVEZ-FP4 (este) | no disponible | no disponible | 162/164 | MIT | GGUF en 3 partes, solo motor ixv-server |
| DeepSeek-V4.1-Flash-1017-ELVEZ-Q2 | no disponible | no disponible | 152/164 | MIT | GGUF, mismo motor, ~161 GiB |
| DeepSeek-V4.1-Flash-1017 (oficial) | no disponible | no disponible | no disponible | MIT | Safetensors FP8/FP4, pesos originales |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- El GGUF no es de proposito general: almacena las tablas Engram en un layout propio y solo se ha probado con el motor `ixv-server` de IXV sobre Metal. No se espera que funcione con llama.cpp, Ollama ni otras herramientas estandar.
- Requiere aproximadamente 287 GiB de memoria, lo que restringe su uso a estaciones de trabajo de gama muy alta como el Mac Studio M3 Ultra de 512 GB.
- La descarga se distribuye en tres partes que deben unirse con `cat` y verificarse con SHA-256; las partes no son utilizables por separado.
- El encoder de vision y la cabeza draft DSpark no estan incluidos en este repositorio y deben obtenerse del repositorio de la variante Q2.
- Idiomas soportados limitados a japones e ingles segun los tags; no hay datos sobre rendimiento en castellano.
- No se han publicado datos sobre sesgos, tasa de alucinacion ni evaluaciones de seguridad.
- El modelo se ofrece "tal cual", sin garantia de ningun tipo; ELVEZ declina responsabilidad por danos derivados de su uso, aunque la licencia declarada es MIT.
- La fecha de publicacion (2026-11-11) y la ausencia de descargas y likes indican que se trata de una publicacion reciente y sin validacion externa por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/elvezjp/DeepSeek-V4.1-Flash-1017-ELVEZ-FP4-gguf
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Variante Q2 del mismo autor: https://huggingface.co/elvezjp/DeepSeek-V4.1-Flash-1017-ELVEZ-Q2-gguf
- IXV (distribucion de IA de ELVEZ): https://ixv.jp/
- Converter base `antirez/ds4` `gguf-tools`: no disponible como enlace directo en la informacion proporcionada
