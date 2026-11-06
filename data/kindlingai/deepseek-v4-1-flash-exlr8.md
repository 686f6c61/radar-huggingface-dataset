# kindlingai/deepseek-v4.1-flash-exlr8

## Resumen

DeepSeek-V4.1-Flash-1017 · exlr8 es una redistribucion del modelo oficial DeepSeek-V4.1-Flash-1017 (deepseek-ai) en el formato de almacenamiento exlr8 v2, publicada por kindlingai. No es un modelo nuevo ni un fine-tune de capacidades: los pesos son byte a byte los del modelo base, reorganizados en un layout orientado a inferencia con tensor parallelism y descarga selectiva por rangos HTTP. La unica modificacion real de pesos afecta a las capas 0-7, cuyos expertos enrutados y compartidos se recodifican con un trellis de 4 bits (codebook pmcgx) en lugar de los codigos MXFP4/FP8 oficiales.

El modelo es un transformer con arquitectura MoE (mezcla de expertos), segun indican las etiquetas y el propio layout (expertos enrutados, experto compartido, capas MTP). El repositorio ocupa 565,5 GB, de los cuales 510 GB corresponden a los pesos oficiales y 54,5 GB a los ficheros k4 adicionales de las capas 0-7. La distribucion incorpora slices de indexado para TP de 1 a 8, lo que permite a cada maquina descargar solo su particion.

Su relevancia es practica: facilita desplegar un modelo de gran tamano en clusters multi-GPU con un formato que evita duplicar descargas y permite elegir entre los pesos oficiales (`native`) o la version comprimida de las primeras capas (`pmcgx-k4`). La licencia es MIT, igual que la del modelo fuente. No se dispone de datos publicados sobre parametros totales, longitud de contexto ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con etapas MTP; layout exlr8 v2 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (MoE; numero de expertos no indicado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (expertos enrutados), FP8 E4M3 (experto compartido), BF16/FP8 (matrices densas), trellis 4 bits pmcgx (capas 0-7) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors con layout exlr8 v2 (stores `mxfp4`, `fp8b32`, `k4`; manifiestos JSON; slices TP 1-8) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos: 40 capas principales (`layers.0` a `layers.39`) mas 3 etapas MTP (`mtp.0` a `mtp.2`). Cada capa contiene expertos enrutados almacenados en MXFP4 (FP4 E2M1 con una escala E8M0 por cada 32 entradas) y un experto compartido en FP8 E4M3 con escala E8M0 por bloque de 32x32. Ademas hay matrices densas (atencion, router, engram y tensores mHC), tablas engram en las capas 1 y 14, y una torre de vision con aligner, lo que indica capacidades multimodales.

La innovacion de esta publicacion no esta en el entrenamiento (no se aportan datos de tokens, composicion del dataset ni fases de RLHF/DPO) sino en el formato: exlr8 divide cada proyeccion de experto en unidades de 128 canales intermedios y asigna a cada unidad un rango propietario segun la formula `(18·e + u + L) mod N`, de modo que en TP=N cada maquina descarga solo su parte mediante peticiones HTTP por rangos. Las capas 0-7 recodifican sus expertos con un trellis de 4 bits (327.680 bytes por unidad frente a 348.160 en MXFP4), usando un trellis por pares donde dos pesos comparten un estado de 20 bits y cada uno es la suma de dos mitades fp16 redondeadas a FP8 E4M3, con rotacion Hadamard 128x128 y escalas por canal y por bloque. El soporte de estas capas en el motor gr8 esta en desarrollo y el loader de referencia en PyTorch aun no decodifica el codebook pmcgx.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base DeepSeek-V4.1-Flash-1017, sin cambios funcionales en esta redistribucion.
- Procesamiento de vision: el repositorio incluye `exlr8-extra-vision.safetensors` con torre de vision y aligner.
- Etapas MTP (multi-token prediction): presentes en las capas 40-42, orientadas a decodificacion especulativa o generacion multi-token.
- Memoria engram: tablas engram en las capas 1 y 14, mecanismo asociativo del modelo base.
- Tool calling y comportamiento de agente: no confirmado en la informacion disponible; depende del modelo fuente.
- Multilingue: no disponible.
- Modo thinking: no disponible.

## Casos de uso

- Despliegue multi-GPU en cluster: el layout con slices `index-slices/tpN/` permite que cada nodo descargue unicamente su particion (TP de 1 a 8), reduciendo el trafico y el almacenamiento por maquina frente a descargar los 565 GB completos.
- Servicio de inferencia a gran escala: al conservar los codigos MXFP4 y FP8 oficiales, un motor compatible con FP4/FP8 puede servir el modelo sin conversion adicional, usando el manifiesto `native`.
- Optimizacion de memoria en las primeras capas: el manifiesto `pmcgx-k4` reduce el peso de los expertos de las capas 0-7 un 5,9 % por unidad (327.680 frente a 348.160 bytes), util cuando el presupuesto de VRAM o de ancho de banda es ajustado.
- Investigacion en formatos de cuantizacion: sirve como caso de estudio reproducible de codificacion trellis de 4 bits con codebook compartido, comparando fidelidad frente a MXFP4 en las mismas capas.
- Pipelines con vision: la inclusion de la torre de vision permite tareas de comprension de imagen y texto en el mismo despliegue.
- Evaluacion y benchmarking del modelo base: al ser pesos identicos byte a byte (salvo capas 0-7 en `k4`), es una via fiable para reproducir resultados de DeepSeek-V4.1-Flash-1017 en entornos con el formato exlr8.
- Archivado y distribucion eficiente: los ficheros `hashes/<path>.sha256` y los checksums por unidad permiten verificar integridad en espejos y CDN.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el repositorio completo son 565,5 GB en disco y el manifiesto `pmcgx-k4` requiere leer 507 GB. La inferencia necesita repartir los pesos entre varias GPU.
- GPU recomendadas: no especificadas por el autor; por el volumen de pesos, el despliegue realista exige nodos multi-GPU (A100/H100/H200) con tensor parallelism de 1 a 8 segun los slices publicados.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en configuraciones consumer tipicas.
- Opciones de despliegue: loader de referencia en PyTorch de kindlingai/exlr8 (solo stores nativos, sin decodificacion pmcgx); motor kindlingai/gr8 con soporte de capas trellis en desarrollo. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| kindlingai/deepseek-v4.1-flash-exlr8 | no disponible | no disponible | exlr8 v2 con k4 en capas 0-7 | MIT | Esta ficha; anade 54,5 GB de ficheros k4 |
| kindlingai/deepseek-v4.1-flash-exlr8-native | no disponible | no disponible | exlr8 v2 solo stores oficiales | MIT | Mismos pesos sin recodificacion trellis |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | no disponible | no disponible | safetensors originales | MIT | Modelo fuente oficial |

## Limitaciones y advertencias

- El soporte del codebook pmcgx en el motor gr8 esta en desarrollo y el loader de referencia no lo decodifica; las capas 0-7 en formato `k4` no son utilizables hoy con las herramientas publicadas.
- La recodificacion trellis de 4 bits en capas 0-7 es con perdida respecto a los codigos oficiales; no se han publicado metricas de degradacion.
- No hay informacion sobre sesgos, tasas de alucinacion ni limitaciones de contexto o idioma; deben consultarse en la model card del modelo fuente.
- El modelo base es un MoE de gran tamano: el coste de almacenamiento (565 GB) y de inferencia multi-GPU es alto.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo fuente y de los datos de entrenamiento originales.
- Los hashes y checksums permiten verificar integridad, pero la ausencia de benchmarks propios impide validar el rendimiento real de esta distribucion frente al original.

## Enlaces

- Hugging Face: https://huggingface.co/kindlingai/deepseek-v4.1-flash-exlr8
- Modelo base en este formato: https://huggingface.co/kindlingai/deepseek-v4.1-flash-exlr8-native
- Modelo oficial: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Especificacion del formato exlr8 v2: https://github.com/kindlingai/exlr8/blob/main/FORMAT.md
- Loader de referencia: https://github.com/kindlingai/exlr8
- Motor gr8: https://github.com/kindlingai/gr8
