# rockerBOO/minimax-h3-nvfp4-convrot

## Resumen

MiniMax H3 es un modelo omni-modal de 33 000 millones de parámetros desarrollado por MiniMax, capaz de generar vídeo y audio sincronizados a partir de texto, imágenes o referencias multimodales. Este repositorio concreto, `rockerBOO/minimax-h3-nvfp4-convrot`, no contiene el modelo original sino una versión cuantizada y podada específicamente diseñada para ejecutarse localmente en ComfyUI, el popular entorno de composición de nodos. El autor, rockerBOO, ha aplicado una cuantización mixta NVFP4/FP8/BF16 y una poda de la red de modulación AdaLN para reducir el peso del checkpoint de 34 GB a 20 GB sin pérdida de calidad reportada.

El modelo genera vídeo a 768p, 24 fps, con duraciones de 4 a 15 segundos, acompañado de audio estéreo de 32 kHz sincronizado. Existen dos modos principales: `fl2va` (condicionado por el primer/último fotograma) y `ref2va` (referencia omni-modal con hasta 9 imágenes, 3 clips de vídeo y 3 clips de audio). La relevancia actual radica en que permite ejecutar un generador de vídeo de última generación en hardware de consumo (GPU Blackwell) con un formato de archivo único integrable en ComfyUI, algo que hasta ahora requería infraestructura de servidor. La cuantización NVFP4 exige GPUs Blackwell (RTX 50-series, B100/B200), mientras que las variantes INT4 ofrecen una vía experimental para GPUs Ampere/Ada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) omni-modal con red de modulación AdaLN |
| Parametros totales | 33 100 millones (33,1B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo procesa secuencias de vídeo y audio, no texto de contexto largo) |
| Tipos de cuantizacion | NVFP4 (MLP), FP8 (attention QKV y AdaLN), BF16 (capas sensibles), INT4/INT8 (variantes experimentales) |
| Idiomas soportados | no disponible (el modelo base MiniMax-H3 es omni-modal; no se especifican idiomas en la información) |
| Licencia | minimax-h3-community (licencia personalizada, ver enlace) |
| Formato de pesos | safetensors (single-file checkpoint de ComfyUI) |

## Arquitectura y entrenamiento

MiniMax H3 es un diffusion transformer omni-modal de 33,1B parámetros que genera vídeo y audio de forma conjunta. La arquitectura combina un codificador de texto (Qwen3-VL 32B, que se distribuye por separado en Comfy-Org/MiniMax-H3), un codificador de vídeo, un codificador de audio y un decodificador de difusión. El modelo utiliza una red de modulación AdaLN (Adaptive Layer Normalization) que condiciona las capas del transformer según el paso de tiempo de difusión. Comfy-Org descubrió que estos pesos AdaLN (13,1B parámetros, el 39% del total) dependen únicamente del timestep, no del contenido, por lo que pueden reemplazarse por una tabla de búsqueda precomputada sin pérdida de calidad, reduciendo el tamaño de 34 GB a 20 GB.

La cuantización aplicada en este repositorio utiliza un perfil por capas construido manualmente: las 90 capas MLP (`mlp.fc1`/`mlp.fc2`) se cuantizan en NVFP4, las proyecciones de atención QKV y AdaLN en FP8 con escala por tensor, y las capas sensibles (los 2 primeros y 3 últimos bloques transformer, la proyección de salida de atención, las proyecciones de entrada/salida y el token refiner) se mantienen en BF16. El resultado son 985 tensores con 180 capas cuantizadas, verificadas contra el encabezado de metadatos de cuantización. No se han publicado detalles sobre el dataset de entrenamiento ni el proceso de alineación (RLHF/DPO) del modelo base en la información disponible.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con resolución 768p, 24 fps y duración de 4 a 15 segundos.
- Generación de vídeo condicionada por imágenes (image-to-video): modo `fl2va` acepta una o dos imágenes (primer/último fotograma) para controlar el inicio y fin de la secuencia.
- Generación de vídeo con referencia omni-modal (modo `ref2va`): hasta 9 imágenes, 3 clips de vídeo y 3 clips de audio como condiciones de entrada.
- Generación de audio sincronizado: el modelo produce audio estéreo de 32 kHz alineado con el vídeo generado.
- Salida de 2K: requiere el módulo separado `H3-Regenerate-2K`, no incluido en este repositorio ni en el de Comfy-Org.
- Integración con ComfyUI: los checkpoints son archivos únicos compatibles con los flujos de trabajo I2V/T2V/R2V del repositorio Comfy-Org.
- Cuantización mixta: soporta NVFP4 (Blackwell) e INT4/INT8 (experimental, GPUs Ampere/Ada) para reducir requisitos de VRAM.

## Casos de uso

- Producción de vídeo para redes sociales: generar clips de 4 a 15 segundos a 768p/24 fps con audio sincronizado directamente desde un prompt de texto, adecuado para contenido de TikTok, Instagram Reels o YouTube Shorts, con la ventaja de ejecutarse localmente sin costes de API.
- Prototipado de storyboards animados: usar el modo `fl2va` con dos imágenes (primera y última) para previsualizar transiciones entre escenas antes de la producción final, ahorrando tiempo en la fase de preproducción.
- Creación de avatares parlantes con referencia visual: el modo `ref2va` permite pasar varias imágenes de un personaje y clips de audio para generar vídeo donde ese personaje habla con la voz proporcionada, útil para doblaje o presentaciones.
- Restauración y animación de fotografías históricas: con una única imagen de entrada, el modelo puede generar un vídeo corto animado con movimiento plausible, útil para museos o documentales.
- Generación de material de entrenamiento sintético: crear vídeos etiquetados con audio para aumentar datasets de visión por computador o de reconocimiento de voz, aprovechando la generación local y la licencia comunitaria.
- Evaluación de calidad de cuantización: investigadores pueden comparar la salida del modelo NVFP4 frente a la del modelo BF16 original para validar la pérdida de calidad de la cuantización, usando los flujos de ComfyUI con el mismo prompt y semilla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor del repositorio indica explícitamente que "la calidad no se ha medido en ningún lugar de este repo" y que los archivos NVFP4 se recomiendan por usar formatos conservadores y establecidos, no por resultados de evaluación. No hay datos de MMLU, HumanEval u otros benchmarks estándar, ya que se trata de un modelo de generación de vídeo, no de lenguaje o código.

## Requisitos de hardware

- VRAM estimada: los archivos NVFP4 podados ocupan 20 GB en disco; el modelo completo NVFP4 sin podar ocupa 34 GB. La VRAM necesaria en inferencia dependerá de la resolución y duración del vídeo, pero se estima que el checkpoint de 20 GB requiere al menos 24 GB de VRAM para funcionar con holgura en ComfyUI.
- GPU recomendadas: exclusivamente Blackwell para NVFP4 (SM >= 10.0/12.0): RTX 50-series (5090, 5080, 5070 Ti, etc.) y GPUs de datacenter B100/B200. Las variantes INT4/INT8 son la única vía para GPUs Ampere/Ada (RTX 30-series, RTX 40-series), aunque con calidad no validada y sin ventaja de velocidad en Blackwell.
- Compatibilidad con consumer GPU: sí, pero solo con las RTX 50-series para NVFP4. Las INT4 experimentales pueden correr en RTX 30/40 pero requieren una build de ComfyUI con `comfy-kitchen` y su layout `TensorCoreConvRotW4A4Layout`.
- Opciones de despliegue: ComfyUI es el entorno principal; los checkpoints se colocan en `models/diffusion_models` junto con el text encoder Qwen3-VL 32B (versión `nvfp4_awq` recomendada) y el VAE del repositorio Comfy-Org. No se mencionan otros runtime como vLLM o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. El autor menciona que la variante `pruned_nvfp4_convrot_int8` es más rápida que `pruned_nvfp4` al mismo tamaño, pero no proporciona cifras concretas.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa con otros modelos de generación de vídeo (como Wan, Hunyuan Video, CogVideoX o LTX-Video) en términos de rendimiento y calidad, ya que este repositorio es una cuantización específica para ComfyUI y no publica benchmarks. Se puede indicar lo siguiente:

| Modelo | Parametros | Resolucion | Audio | Licencia | Formato |
|---|---|---|---|---|---|
| MiniMax-H3 (este repo, NVFP4) | 33,1B | 768p/24fps | Sí (32 kHz) | minimax-h3-community | ComfyUI single-file |
| MiniMax-H3 original (BF16) | 33,1B | 768p/24fps | Sí (32 kHz) | minimax-h3-community | Diffusers / ComfyUI |
| Comfy-Org/MiniMax-H3 (INT8) | 33,1B | 768p/24fps | Sí (32 kHz) | minimax-h3-community | ComfyUI single-file |

La comparativa con otros modelos de vídeo generativo (p. ej., Wan 2.2, Hunyuan Video) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La calidad de la cuantización no ha sido evaluada formalmente. El autor afirma que los archivos NVFP4 "usan formatos conservadores y establecidos" y están confirmados como funcionales, pero no hay métricas objetivas de pérdida de calidad.
- Los archivos NVFP4 requieren GPUs Blackwell (RTX 50-series, B100/B200). No hay fallback para tarjetas más antiguas; en GPUs Ampere/Ada solo funcionan las variantes INT4, que son experimentales y con calidad no evaluada.
- La poda AdaLN depende de la detección basada en formas de ComfyUI. Fuera de ComfyUI, los archivos podados (`pruned_*`) pueden no funcionar; los archivos sin podar (`nvfp4`, `int4_convrot_simple`) son la opción más segura.
- Las variantes INT4 requieren una build específica de ComfyUI con `comfy-kitchen`. Además, en GPUs Blackwell el kernel W4A4 de `comfy-kitchen` no usa tensor cores INT4 nativos, por lo que no hay ventaja de velocidad frente a NVFP4.
- El modelo base tiene licencia `minimax-h3-community`, que es una licencia personalizada. Es necesario revisar el texto completo de la licencia para conocer las restricciones de uso comercial y redistribución.
- No se especifican idiomas soportados. El text encoder Qwen3-VL 32B probablemente soporta múltiples idiomas, pero no hay confirmación en la información del repositorio.
- El repositorio no incluye el módulo `H3-Regenerate-2K` para salida en 2K; los usuarios que necesiten esa resolución deben obtenerlo por separado.
- El tamaño del repositorio es de 211,6 GB (incluye todas las variantes), lo que implica un tiempo de descarga considerable y requiere espacio en disco.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/rockerBOO/minimax-h3-nvfp4-convrot
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Repack de Comfy-Org (text encoder, VAE, flujos de trabajo): https://huggingface.co/Comfy-Org/MiniMax-H3
- Licencia del modelo: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Blog de Comfy sobre la poda AdaLN: https://blog.comfy.org/i/209313677/optimized-for-local-inference-in-comfyui
- Paper de MiniMax-H3 (referencia arxiv:2512.03673): no se proporciona URL directa, pero el identificador está en los tags del repositorio.
