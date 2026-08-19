# AtomicChat/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF

## Resumen

NVIDIA Nemotron 3.5 Lightning 30B A3B es un modelo de generacion de texto de arquitectura hibrida que combina bloques Mamba2 (state space model) con capas de mezcla de expertos (MoE). Desarrollado por NVIDIA, cuenta con 32.913 millones de parametros totales de los cuales aproximadamente 3.000 millones se activan por token, lo que lo situa en la categoria de modelos eficientes para inferencia de alto rendimiento. El repositorio analizado, publicado por AtomicChat, contiene las cuantizaciones GGUF construidas con llama.cpp y calibradas mediante importance matrix (imatrix).

La relevancia de esta publicacion reside en el trabajo de cuantizacion realizado sobre una arquitectura inusual: los tensores de expertos (ffn_down_exps y ffn_up_exps) tienen dimensiones que no son divisibles por 256, lo que impide el uso de K-quants y I-quants estandar en superbloques. AtomicChat ha desarrollado un esquema de asignacion explicita de cuantizacion por tensor (Atomic Dynamic, AD) que logra una calidad superior a la de los formatos convencionales, incluyendo una comparativa favorable frente a NVFP4 de ggml-org. El modelo base esta disponible en BF16 bajo la licencia propietaria nvidia-open-model-license.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba2 + MoE (mixture of experts) |
| Parametros totales | 32.913.266.240 (~32,9 B) |
| Parametros activos | ~3 B (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, AD-Q5_0_XL, Q5_K_M, Q4_K_M, AD-IQ4_NL_L, AD-IQ4_NL, Q2_0 (experimental) |
| Idiomas soportados | no disponibles |
| Licencia | nvidia-open-model-license |
| Formato de pesos | GGUF (cuantizaciones); BF16 en safetensors en el repo base |

## Arquitectura y entrenamiento

El modelo combina bloques Mamba2, una arquitectura de espacio de estados (SSM) que ofrece complejidad lineal respecto a la longitud de secuencia, con capas de mezcla de expertos. Los tensores de expertos presentan dimensiones particulares: ffn_down_exps con ancho 1856 (64 × 29) y ffn_up_exps con ancho 2688 (128 × 21), que en conjunto representan el 93 % del peso del modelo. Estas dimensiones, al no ser divisibles por 256, impiden el uso de K-quants e I-quants en superbloques de 256 pesos, lo que obliga a recurrir a tipos de bloque 32 o a cuantizaciones alternativas.

El entrenamiento del modelo base fue realizado por NVIDIA, aunque la informacion disponible no detalla la composicion del dataset ni el numero de tokens de entrenamiento. El trabajo de AtomicChat se centra en la cuantizacion: construyeron las versiones GGUF con llama.cpp (commit ba360ef), aplicaron calibracion con importance matrix y desarrollaron el esquema AD (Atomic Dynamic), que asigna explicitamente el tipo de cuantizacion a cada tensor de expertos en lugar de depender de los presets estandar. El nombre AD-<down_exps>-<up_exps> refleja esta asignacion. Adicionalmente, se incluye un drafter de decodificacion especulativa (dflash, 1,2 GB en BF16) que acelera la generacion.

## Capacidades

- Generacion de texto autoregresiva con arquitectura hibrida Mamba2 + MoE.
- Eficiencia computacional: solo ~3 B de parametros activos por token, lo que reduce la carga de memoria y computo en inferencia.
- Decodificacion especulativa soportada mediante el drafter dflash incluido en el repositorio.
- Compatibilidad con llama.cpp y endpoints compatibles con el ecosistema GGUF.
- Capacidad conversacional (etiqueta "conversational" en el repositorio).
- Velocidad de generacion alta: entre 290 y 348 tokens/s en una RTX 5090 con descarga completa a VRAM, segun la cuantizacion.
- Procesamiento de prompt rapido: 11.809 tokens/s (prefill pp512) en la cuantizacion AD-IQ4_NL_L.

## Casos de uso

- Inferencia de texto a alta velocidad en produccion: con 290-348 tokens/s medidos en una RTX 5090, el modelo es adecuado para servicios de generacion de texto en tiempo real donde la latencia es critica, como asistentes conversacionales o chatbots de atencion al cliente.
- Despliegue en GPU de consumo: la cuantizacion AD-IQ4_NL ocupa 19,7 GB, lo que permite ejecutar el modelo en tarjetas con 24 GB de VRAM (RTX 4090) manteniendo una calidad cercana a Q5_K_M con 6,9 GB menos de peso.
- Generacion con decodificacion especulativa: el drafter dflash (1,2 GB) permite acelerar la generacion en escenarios de baja latencia, como sistemas de autocompletado o asistentes de codigo.
- Evaluacion de calidad de cuantizacion: los ficheros publicados con metricas de divergencia KL y top-1 agreement permiten a investigadores comparar el impacto de distintas estrategias de cuantizacion sobre arquitecturas MoE con formas de tensor no estandar.
- Investigacion en arquitecturas hibridas SSM + MoE: el modelo sirve como referencia para estudiar el comportamiento de Mamba2 combinado con mezcla de expertos, un area aun poco explorada en la literatura.
- Servicios de generacion con restriccion de VRAM: las cuantizaciones intermedias (Q4_K_M a 25 GB, Q5_K_M a 26,6 GB) ofrecen opciones para entornos con memoria limitada donde se prioriza la velocidad sobre la fidelidad maxima.

## Benchmarks y rendimiento

La informacion disponible no incluye benchmarks estandar de capacidad (MMLU, HumanEval, GSM8K) para el modelo base. Sin embargo, el repositorio publica metricas de calidad de cuantizacion medidas sobre un conjunto de validacion retenido (eval_neutral), con divergencia KL respecto a la referencia Q8_0 y acuerdo top-1, asi como rendimiento de generacion en una RTX 5090:

| Fichero | Tamano | Mean KLD | q99 KLD | Top-1 | tok/s |
|---|---:|---:|---:|---:|---:|
| Q8_0 (referencia) | 35,0 GB | — | — | — | 290,6 |
| AD-Q5_0_XL | 28,8 GB | 0,00749 | 0,075 | 95,73 % | 304,1 |
| Q5_K_M | 26,6 GB | 0,01781 | 0,159 | 93,22 % | 338,7 |
| Q4_K_M | 25,0 GB | 0,02542 | 0,219 | 91,88 % | 348,5 |
| AD-IQ4_NL_L | 22,4 GB | 0,01345 | 0,123 | 94,16 % | 318,1 |
| AD-IQ4_NL | 19,7 GB | 0,01728 | 0,157 | 93,49 % | 326,5 |
| AD-Q2_0_L (experimental) | 15,5 GB | 1,097 | — | 53,0 % | — |
| AD-Q2_0 (experimental) | 11,4 GB | 2,403 | — | 33,5 % | — |

Comparativa frente a NVFP4 de ggml-org a tamano equivalente:

| Fichero | Tamano | Mean KLD | Top-1 |
|---|---:|---:|---:|
| AD-IQ4_NL_L | 22,4 GB | 0,01345 | 94,16 % |
| NVFP4 (ggml-org) | 22,5 GB | 0,06233 | 86,75 % |

La cuantizacion AD-IQ4_NL_L presenta una divergencia KL 4,6 veces menor que NVFP4 al mismo tamano. No obstante, NVFP4 gana en procesamiento de prompt (14.460 frente a 11.809 tokens/s en pp512) gracias a los kernels nativos FP4 de Blackwell.

## Requisitos de hardware

- VRAM estimada: la cuantizacion recomendada AD-IQ4_NL ocupa 19,7 GB; la de mayor calidad, Q8_0, 35,0 GB. No existe actualmente una cuantizacion util por debajo de 19,7 GB.
- GPU compatibles: RTX 5090 (medida en las pruebas), RTX 4090 (24 GB) puede ejecutar todas las cuantizaciones hasta AD-IQ4_NL_L; Q8_0 requiere GPU con 40 GB o mas (A100, H100, RTX 6000 Ada).
- En GPU de consumo: si, con RTX 4090 o RTX 5090 usando AD-IQ4_NL (19,7 GB) o AD-IQ4_NL_L (22,4 GB). No hay opcion viable para tarjetas de 16 GB.
- Opciones de despliegue: llama.cpp (usado para las mediciones), compatible con servidores de inferencia que acepten GGUF; el repositorio incluye la etiqueta "endpoints_compatible".
- Rendimiento medido: 290-348 tokens/s de generacion y 11.809 tokens/s de prefill (pp512) en una unica RTX 5090 con descarga completa.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos de la misma categoria (MoE con ~3 B activos) en la informacion proporcionada. La unica comparativa publicada es interna entre cuantizaciones del mismo modelo y frente a NVFP4 de ggml-org, ya descrita en la seccion de benchmarks. Para una comparativa con modelos como Qwen3-30B-A3B o MiniMax-M1-30B-A3B, no se han publicado resultados en la informacion disponible.

## Limitaciones y advertencias

- No existe una cuantizacion util para 16 GB de VRAM: las opciones Q2_0 experimentales presentan una degradacion severa (33,5 % de acuerdo top-1 en el peor caso), por lo que no deben usarse en produccion.
- Los ficheros Q2_0 publicados en el directorio experimental/ son solo para reproducibilidad; un acuerdo top-1 del 33 % implica que el modelo elige un token distinto dos de cada tres veces.
- Cualquier fichero IQ2_XXS, IQ3_XXS, Q2_K o Q3_K_M publicado para este modelo por otros autores es en realidad un fichero de 4,5 bpw debido a la sustitucion automatica de tipos en llama.cpp; el nombre del fichero no refleja el bitrate real.
- Los tipos de cuantizacion Q1_0, Q2_0, MXFP4 y NVFP4 no leen la importance matrix, por lo que no pueden calibrarse; esto limita su calidad en este modelo.
- La licencia nvidia-open-model-license es una licencia propietaria de NVIDIA; debe revisarse si permite uso comercial y redistribucion en el caso de uso previsto.
- No se ha publicado informacion sobre sesgos, alucinacion o comportamiento en idiomas distintos de los soportados; los idiomas soportados no estan documentados en el repositorio.
- La longitud de contexto no esta documentada en la informacion proporcionada.
- El repositorio ocupa 349,9 GB en total, lo que requiere planificacion de almacenamiento si se descargan todas las cuantizaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/AtomicChat/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF
- Repositorio de metricas: https://huggingface.co/AtomicChat/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF-metrics
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
