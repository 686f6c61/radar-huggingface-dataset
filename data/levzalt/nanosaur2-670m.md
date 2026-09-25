# levzalt/Nanosaur2-670M

## Resumen

Nanosaur2 es un modelo de difusión texto-a-imagen de 670 millones de parámetros orientado a generación de ilustración, desarrollado por el usuario levzalt y publicado en Hugging Face bajo licencia MIT. Se trata de un Diffusion Transformer (DiT) que combina adaLN-single, RoPE 2D, SwiGLU y QK-norm, e incorpora bloques intermedios dispersos mediante la técnica SPRINT, además de predicción en espacio x. El pipeline completo incluye un text encoder Gemma-3-270M congelado y un VAE semántico basado en DINOv2 de 129M de parámetros.

El modelo resuelve la generación de imágenes ilustradas a partir de prompts en lenguaje natural o etiquetas tipo danbooru, con soporte nativo en ComfyUI mediante un nodo personalizado. Su relevancia radica en el coste de entrenamiento declarado (600 dólares estadounidenses) y en un presupuesto de cómputo de 11 días de H100 para el entrenamiento base sobre un dataset de 4 millones de imágenes de ilustración, lo que lo sitúa como una propuesta de bajo coste dentro de la categoría de DiT pequeños.

Está pensado explícitamente para fines de investigación, con soporte para entrenamiento de LoRA sobre carpetas de imágenes con captions en formato `.txt`. No se han publicado datos sobre idiomas soportados ni benchmarks cuantitativos en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con adaLN-single, RoPE 2D, SwiGLU, QK-norm, bloques intermedios dispersos SPRINT y predicción x |
| Parámetros totales | 670M (modelo de difusión) + 270M (text encoder Gemma-3) + 129M (VAE DINOv2) |
| Parámetros activos | no disponible (no es MoE; el autor no publica ratio de tokens activos en SPRINT) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (tres ficheros: `nanosaur2_diffusion_model.safetensors`, `nanosaur2_text_encoder.safetensors`, `nanosaur2_vae.safetensors`) |

## Arquitectura y entrenamiento

El núcleo es un DiT de 670M de parámetros que adopta varias decisiones de diseño de la literatura reciente: adaLN-single para el condicionamiento por timestep, RoPE 2D como codificación posicional, SwiGLU como activación en el bloque MLP y QK-norm para estabilizar la atención. La innovación más destacada es la integración de bloques intermedios dispersos SPRINT (Sparse-Dense Residual Fusion), que permite que un subconjunto de tokens atraviese los bloques centrales, reduciendo el cómputo. La predicción se realiza en espacio x con pérdida sobre v (x-prediction con v-loss), con timesteps muestreados de forma logit-normal y un 10 % de caption dropout. Para el classifier-free guidance, las muestras con texto descartado saltan los bloques intermedios el 50 % de las veces y el resto el 5 %, lo que entrena el paso incondicional de path-drop usado por las guías `alternate` y `path_drop`.

El text encoder es Gemma-3-270M congelado, del que se toma la penúltima capa con la normalización final aplicada. El VAE es un autoencoder de representación de 129M de parámetros entrenado a partir de DINOv2-B: se congela DINOv2 (32 canales), se usa DINOv2 con patch embed descongelado (estilo UniSpace) y concatenación por canales de las últimas 6 capas (32 canales), con decoder convolucional. Las pérdidas son VISReg (1e-3) sobre el cuello de botella latente de 64 dimensiones y MSE de embeddings DINO por capa con pesos iguales sobre DINOv2-B y DINOv3-B, sin pérdidas de píxel, sin LPIPS y sin GAN. El entrenamiento se divide en tres fases: VAE (50 000 pasos, 6 horas en 1×H100), base (11 días-H100 sobre 4M imágenes de ilustración con el optimizador Dion3, lr 1e-3 y decaimiento coseno, repartidos en 3 días a 256×256, 3 días a 512×512 y 5 días a 1024×1024 con aspect buckets) y ajuste estético (4 horas sin token dropping de SPRINT, Dion3 1e-4).

## Capacidades

- Generación de imágenes de ilustración texto-a-imagen a 1024×1024 con aspect buckets.
- Acepta tanto etiquetas tipo danbooru como prompts en lenguaje natural.
- Soporte de upweighting de etiquetas de artista mediante sintaxis `(artist:4)`, que actúa sobre el sesgo de cross-attention y no sobre la magnitud del embedding.
- Muestreo con CFG alternado y PDG (path-drop guidance) procedente de SPRINT.
- Entrenamiento de LoRA sobre carpetas de imágenes con captions `.txt` del mismo nombre, con salida a `models/loras/<folder name>.safetensors`.
- Integración con ComfyUI mediante nodo personalizado (`nanosaur2_support`) y workflow arrastrable (`nanosaur2_workflow.json`).
- No se documenta soporte de tool calling, agentes, visión de entrada ni audio.

## Casos de uso

- Generación de concept art y storyboards: el modelo produce ilustraciones a 1024×1024 con aspect buckets, adecuado para iterar ideas visuales antes de un render final de mayor calidad.
- Fine-tuning de estilo con LoRA: el script incluido permite entrenar adaptadores sobre un conjunto propio de imágenes con captions, útil para reproducir un estilo de estudio o de una serie concreta.
- Previsualización en pipelines de producción artística: al ser un modelo de 670M y coste de entrenamiento bajo, sirve como paso rápido de previsualización antes de modelos mayores.
- Generación de assets para videojuegos y prototipos: ilustraciones de personajes, entornos y elementos decorativos para prototipos o demos internas.
- Investigación en eficiencia de DiT: la combinación de SPRINT, representation autoencoders y predicción x lo convierte en una base reproducible para estudiar técnicas de reducción de cómputo.
- Aumento de datos sintéticos: generación de imágenes etiquetadas para entrenar o evaluar clasificadores y otros modelos de visión.
- Experimentación local en ComfyUI: al caber en GPU de consumo, permite flujos de trabajo de difusión sin depender de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Los pesos suman aproximadamente 2,1 GB en precisión de 16 bits (670M + 270M + 129M parámetros), coincidiendo con el tamaño del repositorio.
- VRAM estimada para inferencia a 1024×1024: en el rango de 6 a 12 GB, dependiendo de la implementación y de la memoria de activaciones; a resoluciones menores (256×256 o 512×512) el requisito baja de forma notable. Es una estimación derivada del tamaño de los pesos, no un dato publicado por el autor.
- GPU recomendadas: cualquier GPU con al menos 8-12 GB de VRAM; H100 o A100 son suficientes y sobredimensionadas para inferencia, y se usaron para el entrenamiento (11 días-H100 para el modelo base).
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090.
- Opciones de despliegue: ComfyUI mediante el nodo personalizado `nanosaur2_support` es la única vía documentada. No se menciona soporte para vLLM, llama.cpp, Ollama, TGI ni Diffusers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|
| Nanosaur2 | 670M (DiT) + 270M + 129M | 1024×1024 con aspect buckets | MIT | Hugging Face, integración ComfyUI |
| PixArt-α | ~0,6B | hasta 1024×1024 | licencia propia del proyecto | pesos abiertos; no verificado en esta búsqueda |
| Sana-0.6B | 0,6B | hasta 1024×1024 y superior | Apache 2.0 (según su publicación) | pesos abiertos; no verificado en esta búsqueda |
| FLUX.1-schnell | ~12B | hasta 1024×1024 y superior | Apache 2.0 | pesos abiertos; no verificado en esta búsqueda |

Nota: los datos de los modelos comparativos proceden de conocimiento general y no se han verificado en la búsqueda web de esta ficha. Nanosaur2 se distingue por su licencia MIT sin restricciones, su tamaño reducido y su integración nativa con ComfyUI, mientras que FLUX.1-schnell lo supera ampliamente en parámetros y presumiblemente en calidad y velocidad de muestreo.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo es para fines de investigación, aunque la licencia MIT permite uso comercial sin restricciones adicionales.
- El dataset de entrenamiento son 4 millones de imágenes de ilustración, por lo que el modelo está sesgado hacia estilos anime/ilustración y previsiblemente rinde peor en fotografía realista.
- No se han publicado evaluaciones de sesgo ni de seguridad, ni tampoco tasas de alucinación o de fallo en la generación.
- No se especifican los idiomas soportados en el prompt; el text encoder Gemma-3-270M es multilingüe, pero el entrenamiento se realizó sobre captions presumiblemente en inglés.
- Posible generación de contenido inapropiado o NSFW: la propia model card muestra un prompt de ejemplo con etiquetas típicas de la escena de ilustración anime, y no se documenta ningún filtro de seguridad.
- Sólo está documentada la inferencia en ComfyUI con parámetros concretos (Euler simple, 50 pasos, CFG 4, shift 3), lo que limita la portabilidad a otros runtime sin trabajo adicional.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validación comunitaria ni evidencia externa de calidad o estabilidad.
- El soporte de LoRA requiere entrenamiento con el script proporcionado y no se han publicado métricas de calidad de los adaptadores resultantes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/levzalt/Nanosaur2-670M
- Perfil del autor: https://huggingface.co/levzalt
- Referencias citadas en la model card:
  - SPRINT: Sparse-Dense Residual Fusion for Efficient Diffusion Transformers — https://arxiv.org/abs/2510.21986
  - Scalable Diffusion Models with Transformers (DiT) — https://arxiv.org/abs/2212.09748
  - PixArt-α — https://arxiv.org/abs/2310.00426
  - RoFormer (RoPE) — https://arxiv.org/abs/2104.09864
  - GLU Variants Improve Transformer — https://arxiv.org/abs/2002.05202
  - Scaling Vision Transformers to 22 Billion Parameters (QK-norm) — https://arxiv.org/abs/2302.05442
  - Back to Basics: Let Denoising Generative Models Denoise (x-prediction) — https://arxiv.org/abs/2511.13720
  - Gemma 3 Technical Report — https://arxiv.org/abs/2503.19786
  - DINOv2 — https://arxiv.org/abs/2304.07193
  - Diffusion Transformers with Representation Autoencoders — https://arxiv.org/abs/2510.11690
  - Improved Baselines with Representation Autoencoders — https://arxiv.org/abs/2605.18324
  - UniSpace — https://arxiv.org/abs/2608.08676
  - VISReg — https://arxiv.org/abs/2606.02572
  - DINOv3 — https://arxiv.org/abs/2508.10104
  - Dion3: Full-Stack Orthogonal Updates — https://arxiv.org/abs/2608.11612
