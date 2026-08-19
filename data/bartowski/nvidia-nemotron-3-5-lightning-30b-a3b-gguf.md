# bartowski/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF

## Resumen

El modelo NVIDIA-Nemotron-3.5-Lightning-30B-A3B es un modelo de lenguaje de gran tamaño desarrollado por NVIDIA, diseñado para generación de texto conversacional y tareas de razonamiento. Esta ficha se centra en la cuantización GGUF realizada por bartowski, que permite ejecutar el modelo en entornos con recursos limitados mediante llama.cpp y otras herramientas compatibles. El modelo original, publicado en formato BF16, presenta una arquitectura de mezcla de expertos (MoE) con 33 mil millones de parámetros totales y aproximadamente 3 mil millones activos por token, lo que lo hace notablemente eficiente en inferencia.

La relevancia de esta cuantización radica en que democratiza el acceso a un modelo de última generación de NVIDIA, que ha sido pre-entrenado con más de 20 billones de tokens y posteriormente afinado con datos curados y sintéticos de alta calidad. Además, incorpora la técnica de predicción multi-token (MTP), que acelera la generación al predecir varios tokens a la vez. Está disponible en seis idiomas principales (inglés, español, francés, alemán, italiano y japonés) y se distribuye bajo la licencia openmdw-1.1 de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) - inferida del nombre "A3B", no confirmada explicitamente |
| Parametros totales | 33B (segun la model card de bartowski) |
| Parametros activos | ~3B (inferido del nombre "A3B", no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q5_K_L, Q5_K_M, Q4_K_L, Q4_K_M, Q5_K_S, Q4_K_S, Q4_1, Q3_K_XL, IQ3_M, Q3_K_L, Q3_K_M (y posiblemente mas) |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | openmdw-1.1 (NVIDIA) |
| Formato de pesos | GGUF (cuantizaciones de bartowski) |

## Arquitectura y entrenamiento

El modelo base NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 emplea una arquitectura de mezcla de expertos (MoE), como sugiere la nomenclatura "A3B" (3 mil millones de parametros activos). Segun la informacion publicada en NVIDIA NIM, el modelo fue pre-entrenado con mas de 20 billones de tokens, e incluye una pequeña porcion de datos de question-answering y alineacion para mejorar la precision. El corpus de post-entrenamiento consiste en datos curados y generados sinteticamente de alta calidad.

La cuantizacion GGUF de bartowski se realizo con llama.cpp (release b10362) utilizando la tecnica imatrix (importance matrix) para optimizar la calidad de los pesos cuantizados. Ademas, el modelo soporta prediccion multi-token (MTP), una innovacion que permite predecir varios tokens futuros simultaneamente, mejorando la velocidad de generacion. En las cuantizaciones imatrix, las capas MTP se almacenan en Q4_0 para maximizar el rendimiento, excepto en la version Q8_0.

## Capacidades

- Generacion de texto conversacional con formato de prompt ChatML (con etiquetas `<|im_start|>` y `<|im_end|>`), incluyendo un token "thinking" al inicio de la respuesta del asistente que sugiere un modo de razonamiento interno.
- Soporte multilingue en seis idiomas: ingles, español, frances, aleman, italiano y japones.
- Prediccion multi-token (MTP) para acelerar la generacion, disponible en las cuantizaciones GGUF.
- Capacidad de manejar conversaciones multi-turno gracias a su entrenamiento con datos conversacionales (etiqueta "conversational" en HuggingFace).
- Compatible con herramientas de inferencia como llama.cpp y vLLM (este ultimo con el modelo BF16 original).
- No se ha especificado soporte explicito para tool calling o function calling en la informacion disponible.

## Casos de uso

- Asistentes conversacionales multilingues: el modelo puede gestionar dialogos en seis idiomas, lo que lo hace adecuado para aplicaciones de atencion al cliente internacional sin necesidad de multiples modelos.
- Generacion de texto en tiempo real con baja latencia: gracias a su arquitectura MoE con solo ~3B parametros activos y la tecnica MTP, es posible obtener respuestas rapidas en entornos de produccion con GPUs de gama media.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q4_K_M (25.48 GB) o Q3_K_M (19.82 GB) permiten ejecutar el modelo en hardware de consumo, como una RTX 4090 con 24 GB de VRAM, mediante offloading parcial a CPU.
- Desarrollo de chatbots especializados en dominios tecnicos: su entrenamiento con datos de alta calidad y su capacidad de razonamiento (token "thinking") lo hacen util para asistencia tecnica o educativa.
- Traduccion automatica entre los idiomas soportados: aunque no es un modelo de traduccion dedicado, su competencia multilingue permite realizar traducciones basicas o asistidas.
- Experimentacion e investigacion en eficiencia de inferencia: al ser un modelo MoE con MTP, es un candidato ideal para estudiar tecnicas de cuantizacion y optimizacion en llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras metricas estandar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion. Por ejemplo, Q4_K_M (25.48 GB) requiere al menos 26 GB de VRAM para cargar los pesos completos; Q8_0 (35.00 GB) necesita unos 36 GB. Las versiones Q3_K_M (19.82 GB) pueden caber en GPUs de 24 GB con espacio para contexto.
- GPU recomendadas: para Q4_K_M o superior, se recomienda una GPU con 32 GB o mas (como A100 40GB, RTX A6000 48GB). Para Q3_K_M o Q4_K_S (23.20 GB), una RTX 4090 de 24 GB es suficiente con offloading a CPU si el contexto es grande.
- Si cabe en consumer GPU: si, las cuantizaciones Q3_K_M, Q4_K_S y Q4_1 (20.87 GB) caben en GPUs de consumo de 24 GB (RTX 3090/4090). Las versiones Q4_K_M y superiores requieren GPUs con mas VRAM o uso combinado CPU+GPU.
- Opciones de despliegue: llama.cpp (soporte nativo para GGUF), vLLM (con el modelo BF16 original, no con GGUF), y herramientas compatibles como Ollama o LM Studio que pueden cargar archivos GGUF.
- Latencia y throughput estimados: no disponibles. La velocidad dependera del hardware y de la cuantizacion; la tecnica MTP deberia mejorar el throughput en comparacion con modelos densos de tamaño similar.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar directamente con alternativas. A continuacion se presenta una comparativa estructural basada en informacion publica:

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Lightning-30B-A3B | 33B (segun card) | ~3B | no disponible | openmdw-1.1 | GGUF (cuantizado) |
| Mixtral 8x7B | 46.7B | 12.9B | 32K | Apache 2.0 | GGUF, safetensors |
| Llama 3.1 8B (denso) | 8B | 8B | 128K | Llama 3.1 | GGUF, safetensors |

Nota: Mixtral 8x7B es un modelo MoE mas grande (12.9B activos) con licencia Apache 2.0, mientras que Llama 3.1 8B es denso y mas pequeño. Sin datos de rendimiento, no es posible establecer una comparativa de calidad.

## Limitaciones y advertencias

- Sesgos y alucinaciones: como todos los modelos de lenguaje, puede generar respuestas inexactas, sesgadas o inapropiadas. NVIDIA advierte explicitamente sobre este riesgo en su documentacion NIM.
- Licencia openmdw-1.1: es una licencia de NVIDIA de codigo abierto, pero es necesario revisar sus terminos especificos antes de uso comercial, ya que puede incluir restricciones de atribucion o uso.
- Longitud de contexto no especificada: no se ha publicado el tamaño de la ventana de contexto, lo que dificulta planificar aplicaciones que requieran manejar documentos largos.
- Cobertura de idiomas limitada: solo seis idiomas, lo que excluye otros como chino, arabe o portugues.
- Dependencia de herramientas de cuantizacion: las cuantizaciones GGUF requieren llama.cpp u otras herramientas compatibles; no son directamente utilizables con frameworks como PyTorch sin conversion adicional.
- Las capas MTP se almacenan en Q4_0 en las cuantizaciones imatrix (excepto Q8_0), lo que puede afectar ligeramente a la calidad de las predicciones multi-token.

## Enlaces

- Repositorio HuggingFace de la cuantizacion GGUF: https://huggingface.co/bartowski/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF
- Modelo original en BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Model card en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard
- Catalogo NGC de NVIDIA: https://catalog.ngc.nvidia.com/orgs/nim/nvidia/models/nemotron-3.5-lightning
