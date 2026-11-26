# RedHatAI/Hy4-NVFP4

## Resumen
Hy4-NVFP4 es un checkpoint cuantizado en NVFP4 del modelo multimodal tencent/Hy4, publicado por RedHatAI. Se trata de un modelo de arquitectura híbrida MoE (mezcla de expertos) con capacidad de entrada de texto, imagen y vídeo, y salida únicamente de texto, disenado para inferencia de alto rendimiento en hardware Blackwell. El checkpoint reduce el peso original de aproximadamente 1,55 TB a unos 479 GB (447 GiB) manteniendo en BF16 las capas sensibles a la precision.

El modelo base Hy4 es un transformer MoE de gran escala con 774.434 millones de parametros totales, orientado a tareas de razonamiento, matemáticas y comprensión multimodal. Esta version cuantizada emplea el formato compressed-tensors de LLM Compressor y esta pensada para servirse con vLLM, lo que la hace relevante para despliegues en produccion que necesitan reducir huella de memoria sin sacrificar apenas calidad.

La relevancia actual radica en que demuestra que la cuantizacion NVFP4 (E2M1) aplicada solo a los expertos enrutados de las 77 capas MoE permite recortar el coste de almacenamiento y memoria en mas de un 69 % conservando entre el 98,3 % y el 99,5 % del rendimiento del baseline FP8 en benchmarks de razonamiento. Es, por tanto, una opcion practica para servir modelos de casi 800.000 millones de parametros en infraestructuras con GPUs Blackwell.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HYV4VLForConditionalGeneration (transformer MoE multimodal, 77 capas MoE) |
| Parametros totales | 774.434.002.142 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (FP4 E2M1) en pesos y activaciones de expertos enrutados; resto en BF16 |
| Idiomas soportados | en, zh |
| Licencia | tencent-hy-license (other) |
| Formato de pesos | safetensors (compressed-tensors, NVFP4) |

## Arquitectura y entrenamiento
El modelo base Hy4 emplea una arquitectura de transformer con mezcla de expertos (MoE) distribuida en 77 capas, con una primera capa densa, expertos compartidos y un enrutador por capa. Incluye ademas un codificador de vision con adaptador para entradas de imagen y video, un cabezal `lm_head` y un drafter de decodificacion especulativa DFly2. La atencion usa un backend FLASHMLA_SPARSE, lo que sugiere mecanismos de atencion lineal dispersa (MLA, multi-head latent attention) en lugar de atencion densa clasica.

El proceso de cuantizacion lo realizo RedHatAI con LLM Compressor mediante el esquema NVFP4 sobre los pesos de los expertos enrutados (`gate_proj`, `up_proj`, `down_proj`) de las 77 capas MoE. Se uso calibracion con 512 muestras del dataset `mlabonne/open-perfectblend`, longitud maxima de secuencia 2048 y el observer `nvfp4_expanded_imatrix`, distribuido en 4 GPUs. La cuantizacion aplica escalas FP8 E4M3 por cada 16 elementos y una escala global FP32 por tensor. Todas las capas fuera de los expertos enrutados (atencion, indexador DSA, capa densa inicial, expertos compartidos, enrutadores, codificador de vision, adaptador, `lm_head` y drafter DFly2) permanecen en BF16. No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base ni sobre el uso de RLHF o DPO.

## Capacidades
- Generacion de texto y razonamiento multi-paso, con modo de razonamiento configurable (`no_think` y `high`, este ultimo por defecto).
- Entrada multimodal: procesa imagenes y video (la configuracion de vLLM recomendada limita a 1 imagen y 0 videos por prompt).
- Razonamiento matematico y resolucion de problemas (evaluado en GSM8K Platinum y GPQA Diamond).
- Soporte de tool calling / function calling mediante el parser `hy_v4` de vLLM y `--enable-auto-tool-choice`.
- Soporte de agentes y razonamiento multi-paso a traves del parser de razonamiento `hy_v4`.
- Capacidades multilingues limitadas a ingles y chino.
- Decodificacion especulativa integrada mediante el drafter DFly2 incluido en el checkpoint (requiere un PR de vLLM aun no fusionado).
- Modo de pensamiento (thinking mode) con esfuerzo de razonamiento ajustable.

## Casos de uso
- Razonamiento matematico asistido: el modelo resuelve problemas de nivel escolar y competicion con un 96,28 % de acierto en GSM8K Platinum, adecuado para tutores automaticos o verificacion de calculos en pipelines educativos.
- Respuesta a preguntas cientificas de nivel experto: con un 89,90 % en GPQA Diamond, sirve para asistentes de investigacion que requieren razonamiento profundo sobre fisica, quimica y biologia.
- Atencion al cliente multimodal en ingles y chino: al aceptar imagenes, puede interpretar capturas de pantalla o fotos de productos enviadas por el usuario y responder en texto, con soporte de tool calling para consultar sistemas internos.
- Agentes automatizados con function calling: integrado en vLLM con `--enable-auto-tool-choice` y el parser `hy_v4`, permite construir agentes que encadenan llamadas a APIs y razonamiento multi-paso.
- Analisis de documentos e imagenes tecnicas: el codificador de vision permite extraer informacion de diagramas o esquemas y generar resumenes textuales, util en entornos de ingenieria.
- Despliegue en produccion con coste reducido: al ocupar unos 479 GB frente a 1,55 TB del original, permite servir un modelo de casi 800.000 millones de parametros en 4 GPUs Blackwell con tensor parallelism 4, rebajando requisitos de memoria.
- Generacion de codigo asistida con razonamiento: aunque no se han publicado benchmarks de codigo, el modo `high` de razonamiento y el soporte de tool calling lo hacen apto para asistentes de programacion que consultan documentacion via herramientas.

## Benchmarks y rendimiento

| Categoria | Benchmark | Hy4-NVFP4 | tencent/Hy4-FP8 | Recuperacion |
|---|---|---|---|---|
| Razonamiento | GSM8K Platinum (strict-match) | 96,28 % | 96,77 % | 99,5 % |
| Razonamiento | GPQA Diamond (pass@1) | 89,90 % | 91,41 % | 98,3 % |

Las evaluaciones se realizaron con lighteval sobre un servidor vLLM en 4xB300 con tensor parallelism 4, parser de razonamiento `hy_v4`, esfuerzo `high`, temperatura 0,9, top_p 1,0 y una sola semilla. Los errores estandar son de aproximadamente 0,5 puntos en GSM8K Platinum y 2,1 puntos en GPQA Diamond (198 preguntas), por lo que la diferencia en GPQA queda dentro del margen de error.

## Requisitos de hardware
- VRAM estimada para inferencia: el checkpoint ocupa unos 479 GB (447 GiB); se necesita al menos esa cantidad de memoria agregada, mas overhead de activaciones y cache KV.
- GPU recomendadas: 4x NVIDIA B300 (configuracion usada en la evaluacion oficial) con tensor parallelism 4; tambien cabe en H100/H200 en configuraciones multi-GPU equivalentes, aunque la optimizacion NVFP4 esta pensada para Blackwell.
- No cabe en GPUs consumer (RTX 4090, 5090) ni en una unica GPU de datacenter; requiere despliegue multi-GPU.
- Opciones de despliegue: vLLM (recomendado, con `--attention-backend FLASHMLA_SPARSE`), LLM Compressor para recompresion; no se menciona soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- La decodificacion especulativa DFly2 requiere el PR vllm-project/vllm#69274, aun no fusionado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RedHatAI/Hy4-NVFP4 | 774,4 B | no disponible | NVFP4 (expertos) + BF16 | tencent-hy-license | Hugging Face |
| tencent/Hy4-FP8 | 774,4 B (base) | no disponible | FP8 | tencent-hy-license | Hugging Face |
| tencent/Hy4 (BF16) | 774,4 B | no disponible | BF16 | tencent-hy-license | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de otros modelos de tamano y categoria equivalentes en la informacion proporcionada. El principal diferencial de Hy4-NVFP4 frente a Hy4-FP8 es el tamano del checkpoint (479 GB frente a un peso FP8 mayor) y su optimizacion para Blackwell, con una recuperacion de calidad del 98,3-99,5 % respecto al baseline FP8.

## Limitaciones y advertencias
- Sesgos conocidos: no se documentan en la informacion disponible, pero al entrenarse principalmente en ingles y chino puede presentar sesgos culturales y linguisticos en otros idiomas.
- Riesgo de alucinacion: inherente a los modelos generativos de gran escala; los benchmarks de razonamiento no eliminan la posibilidad de respuestas plausibles pero incorrectas.
- Limitaciones de contexto e idioma: solo soporta ingles y chino; la longitud de contexto no se especifica. La configuracion de vLLM recomendada limita a 1 imagen y 0 videos por prompt.
- Restricciones de licencia: la licencia tencent-hy-license es de tipo "other"; es imprescindible revisar sus terminos antes de cualquier uso comercial.
- Caveat de produccion: la decodificacion especulativa DFly2 depende de un PR de vLLM no fusionado; sin el, se pierde la aceleracion asociada.
- La cuantizacion deja en BF16 las capas no expertas, por lo que el ahorro de memoria se concentra en los expertos enrutados; el checkpoint sigue requiriendo infraestructura multi-GPU de gama alta.
- El proceso de conversion de nombres de pesos de Transformers para `hy_v4_vl` es con perdida, aunque el autor verifico tensor a tensor la identidad bit a bit de los tensores no expertos.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/RedHatAI/Hy4-NVFP4
- Modelo base: https://huggingface.co/tencent/Hy4
- Baseline FP8: https://huggingface.co/tencent/Hy4-FP8
- Licencia: https://huggingface.co/tencent/Hy4/blob/main/LICENSE
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- PR de vLLM para DFly2: https://github.com/vllm-project/vllm/pull/69274
- lighteval: https://github.com/huggingface/lighteval
- Dataset de calibracion: https://huggingface.co/datasets/mlabonne/open-perfectblend
