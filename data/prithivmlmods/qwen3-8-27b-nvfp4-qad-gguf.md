# prithivMLmods/Qwen3.8-27B-NVFP4-QAD-GGUF

## Resumen

Qwen3.8-27B-NVFP4-QAD-GGUF es una distribucion cuantizada en formato GGUF del modelo multimodal Qwen3.8-27B de Alibaba, publicada por el usuario prithivMLmods. El trabajo de cuantizacion se realizo con NVIDIA Model Optimizer (v0.48.0) aplicando Quantization-Aware Distillation (QAD) sobre 1,26 mil millones de tokens del dataset `nvidia/Nemotron-Cascade-2-SFT-Data`, y el resultado se empaqueto en GGUF para su uso con llama.cpp.

El modelo base es un transformer multimodal (`Qwen3_5ForConditionalGeneration`) de 27.320.698.658 parametros que acepta entradas de texto, imagen y video, con una ventana de contexto de 262.144 tokens. La cuantizacion NVFP4 reduce el espacio en disco y en memoria de GPU en aproximadamente 2,8 veces respecto al modelo BF16, con una perdida de precision practicamente nula segun los datos del autor.

La relevancia de esta ficha radica en que combina tres piezas poco habituales: cuantizacion FP4 nativa para hardware NVIDIA Blackwell, decodificacion especulativa integrada mediante Multi-Token Prediction (MTP) sin modelo draft separado, y soporte multimodal en un unico fichero GGUF con proyector de vision aparte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (`Qwen3_5ForConditionalGeneration`), con cabezas MTP para decodificacion especulativa |
| Parametros totales | 27.320.698.658 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (fichero principal); proyector multimodal en BF16 |
| Idiomas soportados | en (ingles) |
| Licencia | NVIDIA Open Model License (nvidia-open-model-license) |
| Formato de pesos | GGUF (`Qwen3.8-27B-NVFP4-QAD.gguf` de 19,1 GB; `Qwen3.8-27B-NVFP4-QAD.mmproj-bf16.gguf` de 931 MB) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de tipo `Qwen3_5ForConditionalGeneration` que procesa texto, imagen y video. La variante publicada aqui no reentrena el modelo desde cero: aplica Quantization-Aware Distillation con NVIDIA Model Optimizer v0.48.0, cuantizando a NVFP4 los pesos y las activaciones de los operadores lineales dentro de los bloques del transformer mientras actualiza los pesos subyacentes contra las probabilidades token a token del profesor en BF16. El proceso consumio 1,26 mil millones de tokens de `nvidia/Nemotron-Cascade-2-SFT-Data`.

La innovacion principal es la integracion de Multi-Token Prediction (MTP) directamente en los pesos GGUF: el fichero incluye cabezas de salida adicionales que predicen varios tokens futuros en una sola pasada, lo que permite decodificacion especulativa sin necesidad de un modelo draft separado. En la prueba del autor se uso `--spec-type draft-mtp` con `draft_n_max=2`. Ademas, el formato NVFP4 esta pensado para aprovechar los Tensor Cores FP4 nativos de las GPU NVIDIA Blackwell (SM120, GB202, B200, B300, RTX Pro 6000, RTX 50-series).

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento activable (`--reasoning on`).
- Entrada multimodal: texto, imagen y video (requiere el fichero `mmproj-bf16.gguf` para la parte visual).
- Razonamiento multi-paso y resolucion de problemas matematicos y logicos (los tests del autor incluyen problemas de listas enlazadas, cinematica, caudal, combinatoria y edades).
- Generacion de codigo (test de insercion de nodo en lista enlazada simple).
- Decodificacion especulativa MTP integrada para acelerar la inferencia local.
- Conversacion multi-turno con ventana de contexto de 262.144 tokens.
- Soporte de inferencia en vLLM (`--quantization modelopt`) y SGLang segun la model card, ademas de llama.cpp.
- Capacidades multilingues: la model card solo declara ingles (`en`); no se documentan otros idiomas.

## Casos de uso

- Asistencia tecnica con documentos largos: con 262.144 tokens de contexto se pueden cargar manuales, normativas o bases de codigo extensas y mantener conversaciones multi-turno sin truncar el material de referencia.
- Analisis de documentacion tecnica con imagenes: al aceptar imagen y texto, resulta adecuado para interpretar diagramas de arquitectura, capturas de pantalla de errores o planos junto a la pregunta del usuario.
- Generacion de codigo en local: el soporte de llama.cpp con MTP y el tamano de 19,1 GB permiten integrarlo en flujos de desarrollo sobre estaciones de trabajo con GPU Blackwell, sin depender de la nube.
- Revision de video tecnico: la entrada de video permite resumir grabaciones de reuniones, demos de producto o material de vigilancia junto a instrucciones textuales.
- Razonamiento matematico y verificacion de calculos: los tests publicados (problemas de cinematica, caudal, combinatoria y edades) muestran uso en entornos educativos o de validacion de resultados numericos.
- Despliegue en infraestructura NVIDIA Blackwell: al estar cuantizado en NVFP4 y validado en RTX PRO 6000 con 96 GB, encaja en servidores con B200/B300 o estaciones RTX PRO 6000 para inferencia de produccion con alta concurrencia.
- Prototipado de agentes con tool calling: aunque la model card no detalla el soporte explicito de function calling, el modelo base Qwen3.8-27B y el contexto largo permiten construir pipelines de agentes multi-paso; conviene validar esta capacidad antes de llevarla a produccion.

## Benchmarks y rendimiento

Datos publicados por el autor comparando NVFP4 QAD frente a la linea base BF16:

| Benchmark | NVFP4 QAD | BF16 |
|---|---|---|
| GPQA Diamond | 87,94 | 88,19 |
| IFBench | 79,04 | 79,25 |
| MMMU Pro | 75,61 | 75,78 |
| SciCode | 48,82 | 48,34 |
| Terminal-Bench 2.1 | 76,69 | 77,25 |
| AA-LCR | 79,13 | 78,63 |

Rendimiento de inferencia medido en una NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB VRAM) con llama-cli, Flash Attention activado, contexto de 16.384 tokens, KV cache en bf16, `-ngl 99` y MTP con `draft_n_max=2`:

| Metrica | Valor |
|---|---|
| Velocidad media de procesamiento de prompt | 184,34 tokens/s |
| Velocidad media de generacion | 132,58 tokens/s |
| Tiempo total de ejecucion | 43,1 s |
| VRAM maxima utilizada | 17,79 GiB |
| Utilizacion maxima de GPU | 96% |
| Ejecuciones de prueba | 5 |

## Requisitos de hardware

- VRAM estimada: el fichero GGUF ocupa 19,1 GB; en la prueba con contexto de 16.384 tokens y KV cache en bf16 el pico fue de 17,79 GiB, por lo que un contexto mayor incrementara el consumo de KV cache de forma proporcional.
- GPU recomendadas: NVIDIA Blackwell, es decir, RTX PRO 6000, RTX 50-series, B200 y B300. El formato NVFP4 depende de los Tensor Cores FP4 de esta generacion.
- Compatibilidad con GPU de consumo: si, en las RTX 50-series de NVIDIA, siempre que la VRAM disponible cubra el peso del modelo mas la cache KV.
- Opciones de despliegue: llama.cpp (`llama-cli` y binarios derivados), vLLM con `--quantization modelopt` y SGLang segun la model card.
- Latencia y throughput: 184,34 tokens/s de procesamiento de prompt y 132,58 tokens/s de generacion en RTX PRO 6000 con MTP activado y contexto de 16.384 tokens. No hay datos de rendimiento para otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-NVFP4-QAD-GGUF (esta ficha) | 27,32 B | 262.144 | NVFP4 + MTP | NVIDIA Open Model License | Multimodal, optimizado para Blackwell |
| Qwen3.8-27B (BF16, modelo base) | 27,32 B | 262.144 | BF16 | licencia del modelo base (no detallada en la informacion disponible) | Referencia de precision; ocupa aproximadamente 2,8 veces mas |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de otros modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- La model card solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- La cuantizacion NVFP4 esta ligada al hardware NVIDIA Blackwell; en GPU anteriores no se aprovechan los Tensor Cores FP4 y el rendimiento puede degradarse o no ser compatible.
- Los benchmarks publicados son los del autor de la cuantizacion; no se han verificado de forma independiente.
- El modelo puede alucinar, especialmente en tareas de razonamiento abierto o cuando se le pide informacion factual no presente en el contexto.
- El uso comercial esta permitido bajo la NVIDIA Open Model License, pero conviene revisar los terminos completos del acuerdo y la licencia del modelo base Qwen3.8-27B antes de desplegarlo en produccion.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que la validacion por parte de la comunidad es practicamente nula.
- El fichero de proyector multimodal (`mmproj-bf16.gguf`) es imprescindible para las capacidades de vision; sin el, el modelo solo procesa texto.
- No se documentan sesgos especificos ni resultados de evaluacion de seguridad en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/prithivMLmods/Qwen3.8-27B-NVFP4-QAD-GGUF
- Fichero GGUF principal: https://huggingface.co/prithivMLmods/Qwen3.8-27B-NVFP4-QAD-GGUF/blob/main/Qwen3.8-27B-NVFP4-QAD.gguf
- Proyector multimodal BF16: https://huggingface.co/prithivMLmods/Qwen3.8-27B-NVFP4-QAD-GGUF/blob/main/Qwen3.8-27B-NVFP4-QAD.mmproj-bf16.gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4-QAD/blob/main/LICENSE
- Dataset de destilacion: https://huggingface.co/datasets/nvidia/Nemotron-Cascade-2-SFT-Data
- Log de pruebas (HF Bucket): https://huggingface.co/buckets/prithivMLmods/qwen3-8-27b-nvfp4-qad-11-28-2026/tree/session_20261128_020316_IST
- llama.cpp: https://github.com/ggml-org/llama.cpp
