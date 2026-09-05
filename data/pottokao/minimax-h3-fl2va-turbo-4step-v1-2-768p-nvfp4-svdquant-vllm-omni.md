# pottokao/MiniMax-H3-FL2VA-turbo-4step-v1.2-768p-NVFP4-SVDQuant-vLLM-Omni

## Resumen

El modelo `pottokao/MiniMax-H3-FL2VA-turbo-4step-v1.2-768p-NVFP4-SVDQuant-vLLM-Omni` es una version cuantizada y optimizada para inferencia del modelo de generacion de video y audio MiniMax-H3 FL2VA, desarrollado por el usuario pottokao sobre la arquitectura original de ModelTC. Se trata de un Diffusion Transformer (DiT) de 50 capas que genera video y audio sincronizado a partir de una imagen inicial y una imagen final, ademas de una descripcion de texto. La variante "Turbo" incorpora una destilacion a 4 pasos de inferencia mediante una LoRA fusionada (rank-128, alpha=8), lo que reduce drasticamente el coste computacional frente a los 8 o mas pasos del modelo original.

El modelo se distribuye en formato serializado para vLLM-Omni, con cuantizacion SVDQuant NVFP4 (activacion W4A4, correccion low-rank rank-32 y curva AdaLN rank-16). Esta cuantizacion reduce el peso del transformer a aproximadamente 12.3 GiB, permitiendo su ejecucion en GPUs de consumo Blackwell (SM120, como la RTX 5060 Ti o 5070 Ti) y en sistemas como GB10/DGX Spark (SM121), siempre que se aplique un parche especifico a vLLM-Omni v0.28.0. El modelo no incluye el text encoder, que debe cargarse por separado (Qwen3VL-32B en version abliterated y cuantizada NVFP4-AWQ). Es una pieza de un pipeline mas amplio de generacion de video, orientada a entornos de produccion con restricciones de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) para generacion de video y audio, basado en MiniMax-H3 FL2VA, 50 capas |
| Parametros totales | No disponible (el repo contiene ~12.3 GiB de pesos cuantizados, pero no se indica el numero de parametros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de video y audio, no de texto) |
| Tipos de cuantizacion | NVFP4 SVDQuant (activacion W4A4, correccion low-rank rank-32, curva AdaLN rank-16) |
| Idiomas soportados | No disponible (el text encoder externo Qwen3VL-32B puede soportar multiples idiomas, pero no se especifica para este modelo) |
| Licencia | Apache-2.0 |
| Formato de pesos | vLLM-Omni serialized SVDQuant (3 shards safetensors, ~12.3 GiB, 1785 tensores) |

## Arquitectura y entrenamiento

El modelo es un Diffusion Transformer (DiT) de 50 capas que opera sobre la arquitectura MiniMax-H3 FL2VA. La sigla FL2VA indica que el modelo toma como condicion tanto el primer como el ultimo frame de una secuencia de video, ademas de un prompt de texto, y genera simultaneamente el video intermedio y el audio sincronizado. El transformer principal esta cuantizado con SVDQuant NVFP4, una tecnica que combina descomposicion en valores singulares (SVD) con cuantizacion de 4 bits para los pesos y activaciones, manteniendo una correccion de bajo rango (rank-32) para mitigar la perdida de precision. Los modulos `token_refiner`, `adaln_proj` y `condition_proj` se excluyen de la cuantizacion para preservar la estabilidad numerica.

El entrenamiento se basa en la destilacion del modelo bf16 original con una LoRA "Turbo" de 4 pasos (rank-128, alpha=8), que se fusiona directamente en los pesos del transformer. Segun la documentacion del autor, nunca se de-cuantizo el modelo a fp4; la cuantizacion SVDQuant se aplico sobre el modelo bf16 con la LoRA ya fusionada, lo que evita perdidas adicionales. No se especifican datos sobre el dataset de entrenamiento, el numero de tokens ni la composicion del corpus, ni tampoco si se aplicaron tecnicas como RLHF o DPO. El modelo se describe como un componente "abliterated / uncensored" del stack de generacion de video, lo que sugiere una eliminacion de ciertas restricciones de seguridad en el pipeline.

## Capacidades

- Generacion de video y audio sincronizado a partir de una imagen inicial y una imagen final, mas una descripcion de texto.
- Inferencia en 4 pasos gracias a la destilacion "Turbo", lo que reduce significativamente la latencia frente a modelos de 8 o mas pasos.
- Resolucion de salida de 768p.
- Condicionamiento por primer y ultimo frame (First & Last Frame -> Video + Audio).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues no especificadas; el text encoder externo Qwen3VL-32B puede aportar soporte multilingue, pero no se garantiza para este modelo.
- El modelo no incluye el text encoder; requiere el modelo `pottokao/MiniMax-H3-TextEncoder-Qwen3VL-32B-abliterated-NVFP4-AWQ` como componente externo.
- La cuantizacion NVFP4 SVDQuant permite ejecutar el DiT en GPUs de consumo con 16 GB de VRAM, aunque requiere un parche de vLLM-Omni para habilitar SM120/SM121.

## Casos de uso

- Creacion de clips cortos para redes sociales: el modelo puede generar videos de 768p con audio sincronizado a partir de una imagen inicial y final, lo que permite producir contenido atractivo para plataformas como TikTok, Instagram Reels o YouTube Shorts sin necesidad de equipos de filmacion.
- Prototipado de escenas cinematograficas: los cineastas pueden usar el modelo para generar storyboards animados con audio a partir de fotogramas clave, acelerando la previsualizacion de planos y secuencias antes del rodaje real.
- Generacion de anuncios de producto: se puede partir de una imagen del producto y una imagen del resultado deseado, y el modelo genera un video con narracion o efectos de sonido, util para campanas de marketing digital con presupuestos limitados.
- Animacion de personajes a partir de imagenes fijas: usando un primer y ultimo frame de un personaje, el modelo puede producir una animacion fluida con voz, lo que resulta util para la creacion de avatares o mascotas de marca.
- Contenido educativo: los docentes pueden convertir diapositivas o ilustraciones en videos narrados, generando audio explicativo sincronizado con las imagenes, lo que facilita la creacion de material didactico multimedia.
- Generacion de efectos visuales para videojuegos: el modelo puede producir secuencias de video de fondo con audio ambiental, como paisajes animados o cinematicas, que luego pueden integrarse en motores de juego.
- Asistencia en produccion de video: los editores pueden generar tomas alternativas o variaciones de una escena a partir de los mismos fotogramas clave, explorando diferentes interpretaciones visuales y sonoras sin necesidad de regrabar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB con CPU-offload, gracias al parche que marca el checkpoint como cuantizado offline. Sin este parche, el modelo puede agotar la memoria en GPUs de 16 GB.
- GPU recomendadas: RTX 5070 Ti, RTX 5060 Ti (SM120, consumer Blackwell), GB10 / DGX Spark (SM121), y tambien B300 (SM103, soportado de forma nativa por vLLM-Omni v0.28.0).
- El modelo cabe en GPUs de consumo de gama media-alta con arquitectura Blackwell, pero no en GPUs de generaciones anteriores (Ampere, Ada) sin modificaciones adicionales.
- Opciones de despliegue: vLLM-Omni v0.28.0 con el parche `vllm_omni_0.28.0_sm120_svdquant.patch`, o mediante la imagen Docker precompilada incluida en el repositorio (`h3-vllm-omni-nvfp4:0.28.0-sm120`), que se carga con `docker load`.
- Latencia y throughput estimados: no disponibles. El modelo esta optimizado para 4 pasos de inferencia, pero no se proporcionan mediciones concretas.

## Comparativa con modelos similares

| Modelo | Formato | Cuantizacion | Pasos | Resolucion | Hardware objetivo | Licencia |
|---|---|---|---|---|---|---|
| `pottokao/MiniMax-H3-FL2VA-turbo-4step-v1.2-768p-NVFP4-SVDQuant-vLLM-Omni` | vLLM-Omni serialized SVDQuant | NVFP4 SVDQuant | 4 | 768p | SM120/SM121 (Blackwell consumer) | Apache-2.0 |
| `pottokao/MiniMax-H3-FL2VA-turbo-4step-v1.2-768p-NVFP4-rotated-T1` | ComfyUI (nunchaku loader) | NVFP4 rotated | 4 | 768p | No especificado, orientado a ComfyUI | Apache-2.0 |
| `lightx2v/Minimax-h3-Turbo` | LoRA para MiniMax-H3 | No cuantizado (bf16) | 8 (en el Studio) | 768p | No especificado | No disponible |
| MiniMax-H3 FL2VA original (bf16) | Diffusers / vLLM-Omni | Sin cuantizar | 8+ | 768p o superior | GPU de alta gama (A100, H100) | No especificado |

La comparativa muestra que la variante `vLLM-Omni` esta optimizada para despliegue en GPUs de consumo Blackwell mediante cuantizacion NVFP4, mientras que la variante `rotated-T1` esta pensada para ComfyUI. El modelo `lightx2v/Minimax-h3-Turbo` es una LoRA de destilacion que requiere el modelo base sin cuantizar, por lo que no es directamente comparable en cuanto a requisitos de hardware.

## Limitaciones y advertencias

- El modelo se describe como "abliterated / uncensored", lo que indica que se han eliminado ciertas restricciones de seguridad. Esto puede conllevar la generacion de contenido inapropiado o no deseado, especialmente en entornos de produccion sin supervision.
- Requiere un text encoder externo especifico (`Qwen3VL-32B-abliterated-NVFP4-AWQ`), que tambien esta abliterated y cuantizado. El modelo no funciona sin este componente.
- La cuantizacion NVFP4 SVDQuant puede degradar la calidad visual y auditiva en comparacion con el modelo bf16 original, especialmente en escenas con detalle fino o movimiento complejo.
- El parche de vLLM-Omni es necesario para ejecutar el modelo en SM120/SM121; sin el, la inferencia falla o agota la memoria en GPUs de 16 GB.
- No se han publicado benchmarks ni evaluaciones de rendimiento, por lo que no es posible comparar objetivamente la calidad del video generado con otros modelos.
- La resolucion esta limitada a 768p, lo que puede ser insuficiente para aplicaciones que requieran mayor definicion.
- No se especifican los idiomas soportados por el modelo, aunque el text encoder Qwen3VL-32B es multilingue. La calidad de la generacion puede variar segun el idioma del prompt.
- Existe riesgo de alucinacion visual: el modelo puede generar contenido que no corresponde fielmente al prompt de texto o a los frames de condicion, especialmente en escenarios ambiguos.
- El repositorio no incluye el text encoder, por lo que el usuario debe descargarlo por separado, aumentando el espacio total requerido (22.1 GB del repo principal mas el text encoder).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pottokao/MiniMax-H3-FL2VA-turbo-4step-v1.2-768p-NVFP4-SVDQuant-vLLM-Omni
- Repositorio de destilacion Turbo (ModelTC): https://github.com/ModelTC/Minimax-H3-Turbo
- LoRA Turbo en HuggingFace (lightx2v): https://huggingface.co/lightx2v/Minimax-h3-Turbo
- Variante ComfyUI (rotated-NVFP4): https://huggingface.co/pottokao/MiniMax-H3-FL2VA-turbo-4step-v1.2-768p-NVFP4-rotated-T1
- Text encoder requerido: https://huggingface.co/pottokao/MiniMax-H3-TextEncoder-Qwen3VL-32B-abliterated-NVFP4-AWQ
