# kindlingai/deepseek-v4.1-flash-exlr8-native

## Resumen

DeepSeek-V4.1-Flash-1017 · exlr8 native es una redistribución del checkpoint oficial de DeepSeek-V4.1-Flash-1017 en el formato de fichero exlr8 v2, publicada por el usuario kindlingai. No se trata de un modelo nuevo ni de una cuantización adicional: los pesos son idénticos byte a byte a los del modelo base, con los expertos enrutados conservando sus códigos y escalas MXFP4 y el resto de matrices manteniendo sus valores FP8 o BF16. El único cambio es la disposición física de los ficheros.

El objetivo de esta redistribución es facilitar la carga distribuida por tensor parallelism: el checkpoint original almacena cada experto como tensores completos en 48 shards de hasta 95 GB, mientras que exlr8 divide cada proyección de experto en unidades de 128 canales intermedios y asigna a cada unidad un rango propietario fijo para cada tamaño de TP. Así, un nodo puede descargar solo su parte mediante peticiones HTTP range, sin necesidad de bajar shards completos.

El repositorio ocupa 510 GB, de los cuales 297,6 GB corresponden a expertos y 212,9 GB a ficheros densos (de los que 202,8 GB son las dos tablas engram). La arquitectura subyacente es un transformer MoE con 40 capas principales y 3 etapas MTP, aunque los detalles de parámetros totales, activos y longitud de contexto no se especifican en la información disponible. La licencia es MIT, igual que la del modelo fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (40 capas principales + 3 etapas MTP), con torre de visión y tablas engram |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (expertos enrutados, FP4 E2M1 con escala E8M0 por 32 entradas), FP8 E4M3 (experto compartido y matrices densas, escala E8M0 por bloque 32x32), MXFP8 (tablas engram), BF16 (normas y otros tensores) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | exlr8 v2 (safetensors por capa, stores `mxfp4` y `fp8b32`, índices de unidades, slices TP de 1 a 8, manifiesto nativo) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 40 capas principales (identificadas como `layers.L.`) y 3 etapas de predicción multi-token (`mtp.0.` a `mtp.2.`), según la nomenclatura de los ficheros del repositorio. Cada capa contiene tensores de atención, router, engram y mHC, además de un experto compartido y expertos enrutados. El experto compartido es el índice 384 (o 128 en las capas MTP). Las capas 1 y 14 incluyen tablas engram de 202,8 GB en total, divididas en ficheros de 2^24 filas.

La innovación de esta publicación no está en el entrenamiento, que corresponde íntegramente al modelo fuente DeepSeek-V4.1-Flash-1017 (revisión `1bae0e1088993b9b82de08f59de5be5a34e42170`), sino en el layout de almacenamiento. exlr8 corta cada proyección de experto en unidades de 128 canales intermedios; el propietario de la unidad u del experto e en la capa L para TP = N es el rango `(18·e + u + L) mod N`. Los slices `index-slices/tpN/<store>/rankR.safetensors` listan cada unidad con su offset de bytes y checksum xxhash64. Las matrices densas se guardan en un fichero por capa con checksum por bloque de 128 canales. No hay reentrenamiento, RLHF ni DPO asociados a esta publicación; la verificación consiste en reconstruir todos los tensores con el loader de referencia y compararlos con el checkpoint fuente (nombres, dtypes, formas y bytes coinciden).

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base DeepSeek-V4.1-Flash-1017; los detalles concretos no se detallan en la información disponible.
- Procesamiento de visión: el repositorio incluye `dense/exlr8-extra-vision.safetensors` con la torre de visión y el aligner, lo que confirma soporte multimodal de imagen.
- Predicción multi-token: las tres etapas MTP (`mtp.0.` a `mtp.2.`) permiten decodificación especulativa o generación multi-token, según el diseño del modelo fuente.
- Memoria engram: las tablas engram de las capas 1 y 14 (202,8 GB) forman parte del mecanismo del modelo base; su función exacta no se describe en la model card.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Despliegue distribuido en clústeres multi-nodo: el layout exlr8 permite que cada rango de tensor parallelism descargue únicamente su parte de los expertos mediante HTTP range requests, lo que reduce el almacenamiento local necesario y acelera el arranque en entornos con TP = 1 a 8. Es el caso de uso principal de esta publicación.
- Investigación sobre serving de MoE a gran escala: los slices por rango y los checksums xxhash64 permiten validar la integridad de cada unidad durante la carga, útil para estudiar estrategias de sharding y balanceo de expertos.
- Reproducibilidad de experimentos: al conservar los pesos byte a byte, un investigador puede reconstruir el checkpoint original con el loader de referencia (`--raw`) y verificar que coincide con la revisión fuente, lo que facilita la auditoría de resultados.
- Prototipado con el loader de PyTorch: el comando `python -m loader.exlr8 DIR --manifest native --layer 20 --raw --verify --out layer20.safetensors` permite extraer y decodificar capas concretas a BF16 o FP32 para inspección o experimentos aislados.
- Evaluación de cuantizaciones MXFP4 y FP8: al mantener los códigos FP4 y las escalas E8M0 originales, el repositorio sirve como referencia para comparar el impacto de estas cuantizaciones frente a dequantizaciones alternativas.
- Integración futura en motores de inferencia: aunque ningún motor lee aún este layout, el formato está pensado para servir de base a implementaciones de tensor parallelism en motores como vLLM o TGI; los slices TP de 1 a 8 son el contrato de integración.
- Archivado y distribución del checkpoint: el empaquetado por capas y stores facilita la distribución selectiva de partes del modelo (por ejemplo, solo la torre de visión o solo determinadas capas) sin transferir los 510 GB completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el modelo completo; el repositorio ocupa 510 GB en disco (297,6 GB de expertos y 212,9 GB densos). En TP = 4, cada rango maneja aproximadamente 74 GB de expertos.
- GPU recomendadas: no disponible en la información proporcionada. El tamaño del checkpoint descarta GPUs de consumo para el modelo completo.
- Cabe en consumer GPU: no para el modelo completo; no se documenta ningún subconjunto ejecutable en GPUs de consumo.
- Opciones de despliegue: ningún motor de serving lee este layout todavía. Solo existe el loader de referencia en PyTorch puro del repositorio `kindlingai/exlr8`, que decodifica a BF16 o FP32 y permite verificar checksums.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| kindlingai/deepseek-v4.1-flash-exlr8-native | no disponible | no disponible | exlr8 v2 | MIT | Redistribución con layout propio, sin motor de serving |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | no disponible | no disponible | safetensors (48 shards) | MIT | Checkpoint fuente oficial |
| Otras cuantizaciones del mismo modelo base | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa relevante es con el checkpoint fuente: este repositorio no altera pesos ni precisión, solo la disposición de ficheros y añade slices por rango TP e índices con checksums. Frente a una cuantización convencional (por ejemplo, GGUF o AWQ), la diferencia es que aquí no hay pérdida adicional de precisión, pero tampoco hay compatibilidad con motores estándar.

## Limitaciones y advertencias

- Ningún motor de serving (vLLM, TGI, llama.cpp, Ollama) lee el layout exlr8; solo el loader de referencia en PyTorch puro puede cargarlo, lo que limita su uso en producción.
- El repositorio pesa 510 GB, con 202,8 GB dedicados a las tablas engram de solo dos capas; el almacenamiento y la transferencia son costosos.
- La model card no documenta sesgos, tasas de alucinación ni comportamiento multilingüe; estas limitaciones deben consultarse en la documentación del modelo base.
- No se especifican parámetros totales, activos ni longitud de contexto, lo que impide dimensionar correctamente el hardware sin consultar el modelo fuente.
- La licencia MIT se hereda del modelo fuente; conviene verificar las condiciones del checkpoint original por si hubiera términos adicionales no reflejados en esta redistribución.
- El autor es un usuario independiente (kindlingai), no el equipo de DeepSeek; la publicación no tiene el respaldo oficial del desarrollador del modelo.
- Los checksums y la verificación byte a byte reducen el riesgo de corrupción, pero no sustituyen una validación funcional del modelo en tareas reales.
- El identificador de conjunto de pesos (`dc566d59...`) y la revisión fuente (`1bae0e10...`) deben conservarse para trazabilidad; cualquier divergencia invalida la equivalencia con el checkpoint original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kindlingai/deepseek-v4.1-flash-exlr8-native
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Especificación del formato exlr8 v2: https://github.com/kindlingai/exlr8/blob/main/FORMAT.md
- Repositorio del loader de referencia: https://github.com/kindlingai/exlr8
