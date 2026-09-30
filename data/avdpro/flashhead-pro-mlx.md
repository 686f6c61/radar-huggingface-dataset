# Avdpro/FlashHead-Pro-MLX

## Resumen

FlashHead-Pro-MLX es un checkpoint autocontenido publicado por el usuario Avdpro que empaqueta el modelo SoulX-FlashHead-Pro en formato MLX para su ejecución nativa en Apple Silicon. Se trata de una conversión de pesos, no de un modelo entrenado desde cero: incluye el DiT (Diffusion Transformer) Pro, su VAE y el encoder de audio Wav2Vec2 base, con los tensores reordenados a los layouts de MLX. El modelo subyacente, SoulX-FlashHead, es un framework unificado de 1.300 millones de parámetros desarrollado por Soul-AILab para generación de vídeo-retrato ("talking head") de alta fidelidad, longitud ilimitada y en streaming.

La relevancia de esta ficha concreta radica en que elimina la dependencia de PyTorch y CUDA para la inferencia: según la model card, no se requiere Torch en tiempo de ejecución. Esto abre la generación local de vídeo audio-driven a equipos con chips de Apple, un nicho tradicionalmente desatendido por los pipelines de difusión basados en CUDA. El checkpoint fija revisiones upstream concretas y publica un archivo `ai2apps-checkpoint.json` con hashes SHA-256 y tamaños exactos para garantizar reproducibilidad.

El modelo genera vídeo a 512x512, 25 FPS y cuatro pasos de denoising, partiendo de una imagen y una pista de audio. La model card aclara explícitamente que esta ruta es de generación offline local y no reclama streaming en tiempo real, a diferencia de las variantes optimizadas del proyecto original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) sobre el framework SoulX-FlashHead, con VAE dedicado y encoder de audio Wav2Vec2 base |
| Parametros totales | 1.300 millones (1,3B), segun la nomenclatura del modelo upstream SoulX-FlashHead-1_3B |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (generacion de video, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (el repo se distribuye en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (el audio de entrada lo procesa Wav2Vec2-base-960h, entrenado sobre habla inglesa segun el checkpoint upstream; no hay confirmacion de soporte multilingue) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (VAE Pro convertido offline desde un state dict de tensores puros); carga con conversion de layouts a MLX |

## Arquitectura y entrenamiento

El modelo upstream SoulX-FlashHead emplea un esquema de entrenamiento en dos etapas descrito en el paper asociado (arXiv 2602.07449): un preentrenamiento espacio-temporal consciente del streaming ("Streaming-Aware Spatiotemporal Pre-training") y una destilación bidireccional guiada por oráculo ("Oracle-Guided Bidirectional Distillation"). Este diseño busca equilibrar velocidad y calidad, que en trabajos previos de generación de vídeo-retrato solían ser objetivos contrapuestos. La arquitectura de generación es un Diffusion Transformer (DiT) que modela el vídeo condicionado por una imagen de referencia y una señal de audio.

En esta ficha concreta no hay entrenamiento adicional: FlashHead-Pro-MLX es una conversión de los pesos oficiales de SoulX-FlashHead-1_3B a MLX. El repositorio incluye el DiT Pro, su VAE y el Wav2Vec2 base, con los tensores reordenados al layout que espera MLX. La model card indica que el VAE Pro se convirtió offline desde un diccionario de estado de tensores puros a safetensors y que las revisiones upstream están fijadas. No se proporcionan datos sobre número de tokens, composición del dataset ni detalles de RLHF/DPO para esta conversión, ya que no implican entrenamiento.

## Capacidades

- Generación de vídeo a partir de imagen (image-to-video) condicionada por una imagen de referencia.
- Generación de vídeo dirigida por audio (audio-driven-video): el movimiento y la expresividad del retrato se sincronizan con la pista de audio de entrada.
- Generación de vídeo-retrato ("talking head") de alta fidelidad a 512x512 y 25 FPS.
- Inferencia en cuatro pasos de denoising, lo que reduce el coste computacional por fotograma frente a schedulers de más pasos.
- Ejecución nativa en MLX sin PyTorch en tiempo de ejecución.
- Ruta de generación local offline; la model card no reclama capacidad de streaming en tiempo real para esta conversión.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y multi-step reasoning: no aplica.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Generación local de avatares parlantes en Mac: desarrolladores con un Mac equipado con chip de la serie M pueden producir vídeos de retrato sincronizados con audio sin depender de CUDA ni de servicios en la nube, usando el runtime MLX del proyecto AI2Apps.
- Prototipado de contenido para creadores en Apple Silicon: a partir de una fotografía y una locución grabada, el modelo genera un clip de vídeo de 512x512 a 25 FPS, útil para pruebas de concepto de vídeo promocional o de presentación.
- Previsualización de personajes en pipelines de animación: dado que parte de una imagen fija y audio, sirve para validar la expresividad y la sincronización labial de un personaje antes de invertir en un render de mayor calidad.
- Doblaje y localización de vídeo existente: se puede alimentar una imagen del hablante y una pista de audio en otro idioma para generar un retrato que "pronuncie" el nuevo audio, útil en flujos de postproducción que ya dispongan de la imagen y el audio final.
- Investigación en modelos de difusión sobre MLX: al ser un checkpoint autocontenido con revisiones fijadas y hashes SHA-256, sirve como artefacto reproducible para estudiar la portabilidad de DiT y VAE entre frameworks (Torch a MLX).
- Docencia y experimentación offline: su ejecución local y sin Torch facilita su uso en entornos educativos con hardware Apple, sin coste de GPU cloud ni dependencias de compilación CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (FID, LSE-D, sincronización labial, etc.) para esta conversión MLX en la información disponible. Los únicos datos numéricos públicos corresponden al proyecto upstream SoulX-FlashHead, ejecutado sobre CUDA, y no son extrapolables directamente a esta conversión en MLX:

| Variante upstream | Hardware | Rendimiento reportado |
|---|---|---|
| SoulX-FlashHead-Lite | RTX 4090 | 96 FPS, o 3 streams concurrentes en tiempo real (25+ FPS) |
| SoulX-FlashHead-Pro | RTX 4090 | 10,8 FPS |
| SoulX-FlashHead-Pro | 2x RTX 5090 | tiempo real (25+ FPS) |

Nota: estos valores proceden de la documentación del proyecto original Soul-AILab/SoulX-FlashHead y de repos derivados, no de la model card de FlashHead-Pro-MLX, que no aporta cifras de throughput ni latencia para la ruta MLX.

## Requisitos de hardware

- El repositorio pesa 6,9 GB, por lo que se necesita espacio en disco suficiente para el checkpoint completo (DiT Pro, VAE y Wav2Vec2) más el runtime y el código Python distribuidos por separado.
- Al estar en formato MLX, el destino natural son equipos Apple Silicon (serie M). No se documentan requisitos mínimos de memoria unificada en la información disponible.
- VRAM estimada para inferencia: no disponible. Al no publicarse cuantizaciones alternativas ni cifras de memoria pico, no es posible dar una estimación fiable.
- GPU recomendadas: para MLX, chips de Apple (M-series); no aplica el listado de GPUs CUDA. Para las variantes upstream en Torch se documentan RTX 4090 (Lite y Pro) y 2x RTX 5090 (Pro en tiempo real).
- Compatibilidad con GPU de consumo: el modelo upstream Lite se ejecuta en una RTX 4090 e incluso en una T4 de Colab según reportes de terceros; el Pro requiere hardware más potente para tiempo real. Para esta conversión MLX no hay datos publicados.
- Opciones de despliegue: MLX con el runtime de AI2Apps FlashHead (Model Worker nativo MLX). No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que además no son aplicables a un modelo de difusión de vídeo.
- Latencia y throughput estimados: no disponibles para la ruta MLX.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de alternativas equivalentes dentro de la información proporcionada, más allá de las propias variantes del proyecto SoulX-FlashHead. Se incluye la comparación interna disponible:

| Modelo | Parametros | Framework | Hardware objetivo | Rendimiento | Licencia |
|---|---|---|---|---|---|
| FlashHead-Pro-MLX (esta ficha) | 1,3B | MLX | Apple Silicon | no disponible | apache-2.0 |
| SoulX-FlashHead-Pro | 1,3B | Torch/CUDA | RTX 4090, 2x RTX 5090 | 10,8 FPS en RTX 4090; 25+ FPS en 2x RTX 5090 | apache-2.0 |
| SoulX-FlashHead-Lite | 1,3B | Torch/CUDA | RTX 4090, T4 | 96 FPS; 3 streams concurrentes a 25+ FPS en RTX 4090 | apache-2.0 |

Comparativa con modelos de terceros (por ejemplo, otros generadores de talking head): no disponible en la información proporcionada.

## Limitaciones y advertencias

- La model card restringe explícitamente el alcance: es una ruta de generación offline local y no reclama streaming en tiempo real, a diferencia de las variantes Lite/Pro optimizadas del proyecto original.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso comunitario ni de validación independiente de esta conversión.
- Al ser una conversión de pesos, cualquier degradación introducida en el proceso de reordenación de tensores o en la conversión del VAE Pro a safetensors no está validada por benchmarks publicados.
- Idiomas soportados no confirmados: el encoder de audio es Wav2Vec2-base-960h, entrenado sobre habla inglesa, lo que puede limitar la calidad de sincronización con audio en otros idiomas.
- No se documentan cuantizaciones alternativas, por lo que el consumo de memoria unificada puede ser elevado y no ajustable.
- Riesgo de alucinación visual y artefactos: como todo modelo de difusión generativa, puede producir movimientos faciales irreales, desincronización labial o artefactos temporales, especialmente con audios atípicos o imágenes de referencia poco habituales.
- Restricciones de licencia: la licencia es Apache-2.0, que permite uso comercial, pero la model card exige preservar `LICENSE` y `NOTICE.md`. Deben respetarse asimismo las condiciones de los pesos upstream (SoulX-FlashHead) y de Wav2Vec2.
- Dependencia de un runtime externo: el código Python y el runtime se distribuyen por separado, de modo que la reproducibilidad depende de que AI2Apps mantenga disponible su Model Worker.
- La fecha de creación y actualización del repositorio (2026) y el propio ecosistema del modelo sugieren consultar la vigencia del proyecto antes de usarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Avdpro/FlashHead-Pro-MLX
- Repositorio upstream SoulX-FlashHead: https://github.com/Soul-AILab/SoulX-FlashHead
- Pesos oficiales SoulX-FlashHead-1_3B: https://huggingface.co/Soul-AILab/SoulX-FlashHead-1_3B
- Wav2Vec2 base (encoder de audio): https://huggingface.co/facebook/wav2vec2-base-960h
- Paper (PDF): https://arxiv.org/pdf/2602.07449
- Paper (HTML): https://arxiv.org/html/2602.07449
- Repositorio derivado CyberVerse (modelos flash_head): https://github.com/Lynpoint/CyberVerse/tree/main/models/flash_head
- Guia de ejecucion en Colab T4: https://ansaribilal.com/blog/talkdrive-soulx-flashhead-colab-talking-head-2026/
