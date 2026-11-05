# iyttor/VidVec-7B

## Resumen

VidVec-7B es un modelo de embeddings video-texto desarrollado por OriginAI (Issar Tzachor, Dvir Samuel y Rami Ben-Ari), presentado en NeurIPS 2026. Se construye a partir del MLLM generativo VideoLLaMA3-7B mediante una adaptacion ligera: un entrenamiento LoRA de menos de 30 minutos en 4 GPUs sobre aproximadamente 60.000 pares de texto, sin pares video-texto adicionales. El resultado es un extractor de caracteristicas que transforma un modelo generativo multimodal en un embedder eficaz para recuperacion video-texto, con embeddings L2-normalizados de 3584 dimensiones.

La relevancia del modelo reside en su protocolo de evaluacion zero-shot estricto: ni VidVec ni su backbone se entrenaron con las particiones de entrenamiento de los benchmarks empleados (MSR-VTT, MSVD, VATEX, DiDeMo y ActivityNet), siguiendo el protocolo de InternVideo2 y VideoPrism. Con solo 60K pares de texto supera a modelos dedicados de video como InternVideo2-6B, entrenado con 100M de pares video-texto, en la mayoria de metricas de recuperacion.

La innovacion central es la "optimizacion en contexto solo-texto": se alinean descripciones detalladas de video con resumenes cortos, lo que resulta mas eficaz que el ajuste fino emparejado video-texto. El checkpoint publicado es VidVec-O (la salida de la optimizacion en contexto, con el adaptador LoRA fusionado en los pesos); el sistema completo de dos etapas anade un reordenamiento de los top-K candidatos con la cabeza MLLM calibrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basado en VideoLLaMA3-7B (MLLM generativo adaptado a embedding) |
| Parametros totales | 8.044.744.944 (8,04B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el modelo se carga en bf16; no se documentan cuantizaciones GGUF/AWQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con remote code de transformers) |

## Arquitectura y entrenamiento

VidVec-7B hereda la arquitectura de VideoLLaMA3-7B, un MLLM que procesa video y texto y genera respuestas. La adaptacion a embedding es minima: se aplica LoRA sobre el modelo base usando aproximadamente 60.000 pares de texto (descripciones detalladas de video alineadas con resumenes cortos), con menos de 30 minutos de entrenamiento en 4 GPUs. El adaptador LoRA se fusiona en los pesos finales. Los embeddings se extraen de la capa final del modelo, con dimension 3584 y normalizacion L2, de modo que la similitud se calcula como producto escalar.

El pipeline de inferencia muestrea fotogramas a 2 fps con un maximo de 180 fotogramas por video y aplica prompts de resumen: `'Summarize above video in one word: '` para video y `'Summarize above sentence in one word: '` para texto. La decodificacion de `.mp4` delega en el binario `ffmpeg` del sistema. El sistema completo de dos etapas (VidVec) reordena los 5 mejores candidatos texto-a-video con la cabeza MLLM calibrada; esa etapa de reordenamiento forma parte del codigo publicado en GitHub y no del checkpoint.

## Capacidades

- Generacion de embeddings video-texto: `encode_video()` y `encode_text()` devuelven vectores L2-normalizados de 3584 dimensiones.
- Calculo de similitud directa entre un video y una frase mediante `similarity()`.
- Ranking de multiples textos frente a un video mediante `rank()`, con similitud y posicion.
- Recuperacion texto-a-video (T2V) y video-a-texto (V2T).
- Procesamiento multimodal de video con muestreo configurable de fotogramas (fps y max_frames).
- Soporte de reordenamiento opcional de candidatos con la cabeza MLLM calibrada (en el codigo, no en el checkpoint).
- Capacidades multilingues: solo ingles.
- No se documentan tool calling, function calling, agentes ni modos de razonamiento extendido; el modelo es un extractor de caracteristicas, no un generador de uso general.

## Casos de uso

- Busqueda semantica de video: indexar una videoteca calculando `encode_video()` por clip y responder consultas en lenguaje natural con `encode_text()` y producto escalar; adecuado por sus embeddings normalizados y su rendimiento zero-shot en MSR-VTT y MSVD.
- Moderacion y etiquetado de contenido audiovisual: comparar clips con descripciones textuales de politicas para recuperar los candidatos mas proximos y revisarlos manualmente.
- Generacion automatica de metadatos: emparejar cada video de un catalogo con la descripcion corta mas afin entre un conjunto de candidatos mediante `rank()`, reduciendo el trabajo de catalogacion.
- Sistemas de recomendacion basados en contenido: representar videos y descripciones de usuario en el mismo espacio de 3584 dimensiones para calcular afinidad vectorial.
- Anotacion y curacion de datasets: localizar en un corpus los clips que mejor coinciden con una descripcion objetivo para construir conjuntos de entrenamiento o evaluacion.
- Recuperacion video-a-texto en archivos periodisticos: dada una consulta de video, recuperar los textos o resumenes asociados mediante la direccion V2T, con resultados zero-shot de 54,9 en MSR-VTT y 85,7 en MSVD (Recall@1).
- Reordenamiento en pipelines de dos etapas: usar VidVec-O como primera etapa de recuperacion y la cabeza MLLM calibrada para reordenar los 5 mejores candidatos, tal como describe el paper.

## Benchmarks y rendimiento

Recall@1 en evaluacion zero-shot. VidVec corresponde a VidVec-O con reordenamiento de los 5 mejores candidatos T2V; las columnas V2T son VidVec-O solo.

| Metodo | Pares video-texto | MSR-VTT T2V | MSR-VTT V2T | MSVD T2V | MSVD V2T | VATEX T2V | VATEX V2T | DiDeMo T2V | DiDeMo V2T |
|---|---|---|---|---|---|---|---|---|---|
| InternVideo-L | 12M | 40,7 | 39,6 | 43,4 | 67,6 | 49,5 | 69,5 | 31,5 | 33,5 |
| UMT-L | 10M | 42,6 | 38,6 | 49,9 | 75,4 | – | – | 48,6 | 49,9 |
| LanguageBind | 10M | 44,8 | 40,9 | 53,9 | 72,0 | – | – | 39,9 | – |
| VideoPrism-g | 600M | 52,7 | 51,7 | – | – | 62,5 | 77,1 | – | – |
| PE-Core-G | 22M | 51,2 | 49,9 | 59,7 | 85,4 | – | – | – | – |
| InternVideo2-6B | 100M | 55,9 | 53,7 | 59,3 | 83,1 | **71,5** | 85,3 | 57,9 | **57,1** |
| **VidVec** | **0 (solo texto)** | **56,4** | **54,9** | **61,6** | **85,7** | 70,5 | **89,6** | **62,3** | 56,5 |

Los resultados de ActivityNet y las ablaciones estan en el paper. No se han publicado en la informacion disponible resultados de benchmarks de lenguaje general (MMLU, HumanEval, GSM8K), ya que el modelo es un extractor de caracteristicas y no un generador evaluado en esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 32 GB en bf16 segun la model card (8,04B parametros en bf16). No se documentan requisitos para cuantizaciones de 8 o 4 bits.
- GPU recomendadas: una GPU CUDA con soporte bf16 y 32 GB o mas de memoria (A100 40/80 GB, H100, L40S). No se garantiza su funcionamiento en GPUs consumer de 24 GB como la RTX 4090 en bf16 sin cuantizacion, que no esta documentada.
- Cabe en consumer GPU: no disponible con los datos publicados; en bf16 no cabe en GPUs de 24 GB.
- Opciones de despliegue: `transformers==4.46.3` con `trust_remote_code=True`; FlashAttention-2 opcional (`flash-attn==2.7.4.post1`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Dependencias del sistema: binario `ffmpeg` en el PATH para decodificar `.mp4`; `decord`, `opencv-python`, `imageio`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Pares video-texto de entrenamiento | Contexto | Licencia | MSR-VTT T2V (R@1) |
|---|---|---|---|---|---|
| VidVec-7B | 8,04B | 0 (60K pares solo texto) | no disponible | apache-2.0 | 56,4 (con reordenamiento) |
| InternVideo2-6B | 6B | 100M | no disponible | no disponible | 55,9 |
| LanguageBind | no disponible | 10M | no disponible | no disponible | 44,8 |
| UMT-L | no disponible | 10M | no disponible | no disponible | 42,6 |

Frente a los embedders MLLM de 7B, VidVec-O usa aproximadamente 60K pares solo texto mientras que aquellos se entrenan con entre 10 y 100 veces mas datos vision-texto, segun la model card.

## Limitaciones y advertencias

- Solo soporta ingles; no se documenta cobertura multilingue.
- Es un extractor de caracteristicas, no un modelo generativo de uso general: no se debe esperar razonamiento, codigo ni respuestas conversacionales.
- El remote code solo funciona con `transformers==4.46.3`; versiones mas recientes no lo ejecutan, lo que complica el mantenimiento en produccion.
- Requiere el binario `ffmpeg` en el sistema y al menos 32 GB de VRAM en bf16.
- El checkpoint publicado es VidVec-O; los resultados de la tabla de VidVec incluyen reordenamiento con la cabeza MLLM, que hay que implementar desde el repositorio de codigo.
- Riesgo de alucinacion: no aplica de forma directa al ser un embedder, pero las descripciones generadas por el backbone pueden introducir sesgos en la alineacion texto-video.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia apache-2.0, que permite uso comercial; conviene verificar las condiciones del modelo base VideoLLaMA3-7B.
- Modelo con muy poca adopcion en HuggingFace (7 descargas, 0 likes) en el momento de la consulta; no hay evidencia de uso en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iyttor/VidVec-7B
- Pagina del proyecto: https://iyttor.github.io/VidVec/
- Paper (arXiv): https://arxiv.org/abs/2602.08099
- Codigo en GitHub: https://github.com/iyttor/VidVec/
- Modelo base: https://huggingface.co/DAMO-NLP-SG/VideoLLaMA3-7B
- Dataset citado: https://huggingface.co/datasets/WenhaoWang/VideoUFO
