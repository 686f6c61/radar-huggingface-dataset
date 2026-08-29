# changwangss/sdxl-base-1.0-mxfp4-smooth-signround

## Resumen

El modelo `changwangss/sdxl-base-1.0-mxfp4-smooth-signround` es una variante cuantizada del Stable Diffusion XL (SDXL) base 1.0, desarrollada por el usuario changwangss. Se trata de un modelo de difusión latente para generación de imágenes a partir de texto, que emplea una cuantización de 4 bits en formato MXFP4 (Microscaling Floating Point 4) con la técnica de redondeo suave y signo (smooth-signround) para reducir el tamaño y los requisitos de memoria sin degradar excesivamente la calidad de salida. El modelo original SDXL base fue creado por Stability AI y es uno de los generadores de imágenes open source más utilizados, con capacidad de renderizar a 1024x1024 píxeles y una comprensión de prompts notablemente superior a las versiones anteriores de Stable Diffusion.

Esta variante cuantizada resulta relevante para desarrolladores que necesitan desplegar SDXL en entornos con recursos limitados, como GPUs de consumo o inferencia en la nube con coste reducido. Al reducir los pesos a 4 bits, el modelo ocupa aproximadamente 4.4 GB en el repositorio (frente a los ~6.9 GB del original en fp16), lo que permite cargarlo en tarjetas gráficas con menos VRAM. La técnica smooth-signround busca minimizar el error de cuantización, manteniendo una calidad visual cercana a la del modelo original. El pipeline es text-to-image y la librería asociada es `diffusers`, lo que facilita su integración en proyectos existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion XL base (UNet + VAE + dos text encoders: OpenCLIP-ViT/bigG y CLIP-ViT/L) |
| Parametros totales | 1.768.858.884 (aprox. 1.77B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (los text encoders procesan secuencias de hasta 77 tokens por encoder, pero no se especifica para esta variante) |
| Tipos de cuantizacion | MXFP4 (4 bits) con smooth-signround |
| Idiomas soportados | no disponible (el modelo original SDXL funciona principalmente en ingles, aunque puede generalizar a otros idiomas con limitaciones) |
| Licencia | no disponible (el modelo original SDXL usa CreativeML Open RAIL++-M, pero esta variante no especifica licencia) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base SDXL es un modelo de difusión latente que combina un UNet con aproximadamente 2.6 mil millones de parámetros (aunque el recuento total del checkpoint incluye los text encoders y el VAE, sumando 1.77B en esta versión cuantizada). Utiliza dos text encoders preentrenados: OpenCLIP-ViT/bigG (con 694M parámetros) y CLIP-ViT/L (con 123M parámetros), cuyas representaciones se concatenan para guiar la generación. El VAE es un autoencoder con factor de compresión 8, que reduce la dimensionalidad del espacio latente. El entrenamiento original de SDXL base se realizó con un conjunto de datos de aproximadamente 3.2 mil millones de imágenes, con un proceso de dos fases: primero un entrenamiento en baja resolución y luego un refinamiento a 1024x1024. No se aplicó RLHF ni DPO, sino un ajuste fino con preferencias humanas para mejorar la estética.

La variante cuantizada no modifica la arquitectura, sino que aplica una cuantización post-entrenamiento de los pesos a formato MXFP4. MXFP4 es un formato de punto flotante de 4 bits con una mantisa de 3 bits y un exponente compartido por bloque, diseñado para hardware moderno con soporte de microscaling. La técnica smooth-signround combina un suavizado de la distribución de pesos (para reducir la sensibilidad a la cuantización) con un redondeo basado en el signo, lo que mejora la precisión frente a métodos de redondeo estándar. No se dispone de detalles sobre el conjunto de datos de calibración utilizado para esta cuantización, ni sobre si se realizó un ajuste fino posterior.

## Capacidades

- Generación de imágenes fotorrealistas y artísticas a partir de descripciones textuales, con resolución nativa de 1024x1024 píxeles.
- Comprensión de prompts complejos gracias a la combinación de dos text encoders, lo que permite capturar atributos, estilos y composiciones detalladas.
- Soporte de técnicas de guiado como classifier-free guidance y negative prompts, habituales en el ecosistema diffusers.
- Compatibilidad con el pipeline `StableDiffusionXLPipeline` de la librería diffusers, lo que permite usar schedulers como DDIM, Euler, DPM++ y otros.
- Capacidad de generar variaciones de una misma imagen mediante semillas y ajustes de parámetros (steps, CFG scale, etc.).
- No incluye capacidades de tool calling, agentes, visión multimodal ni procesamiento de audio; es exclusivamente text-to-image.

## Casos de uso

- Generación de ilustraciones y arte conceptual: un estudio de diseño puede usar el modelo para crear bocetos iniciales de personajes, escenarios o productos a partir de descripciones verbales, reduciendo el tiempo de exploración creativa. La cuantización permite ejecutarlo en una GPU de gama media como una RTX 3060 con 12 GB de VRAM.
- Prototipado rápido de interfaces y assets para videojuegos: los desarrolladores pueden generar texturas, fondos o sprites en alta resolución sin necesidad de un artista en cada iteración. El modelo acepta prompts detallados sobre estilo, iluminación y composición, y su tamaño reducido facilita la integración en pipelines de CI/CD para pruebas automáticas.
- Generación de imágenes para campañas de marketing: agencias pueden producir imágenes de producto o lifestyle para redes sociales y anuncios, ajustando el prompt para reflejar la identidad de marca. La cuantización MXFP4 reduce el coste de inferencia en servicios cloud, permitiendo escalar sin disparar la factura.
- Creación de contenido educativo y divulgativo: profesores y creadores de contenido pueden generar diagramas, infografías o escenas históricas a partir de texto, con una calidad suficiente para su uso en presentaciones o vídeos. El modelo maneja bien conceptos abstractos si el prompt es claro.
- Personalización de imágenes mediante inpainting y outpainting: aunque el checkpoint base no está entrenado específicamente para estas tareas, el pipeline de diffusers permite combinarlo con máscaras para editar regiones concretas de una imagen existente, útil en retoque fotográfico o restauración.
- Experimentación en investigación de cuantización: al ser una variante cuantizada con una técnica novedosa (smooth-signround), sirve como caso de estudio para evaluar el impacto de la cuantización MXFP4 en la calidad de generación, comparando con el modelo original en términos de FID, CLIP score y preferencia humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como FID, CLIP score o evaluaciones de preferencia humana para esta variante cuantizada. El modelo original SDXL base reporta mejoras significativas frente a Stable Diffusion 1.5 y 2.1 en preferencia humana, pero no hay datos específicos de esta cuantización. Se recomienda realizar una evaluación propia comparando la salida con el modelo original en fp16 para medir la degradación introducida por la cuantización.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo cuantizado a 4 bits, el checkpoint ocupa 4.4 GB en disco. Para cargar el modelo completo en memoria con diffusers, se estima un consumo de VRAM de entre 6 y 8 GB, dependiendo de la resolución de salida y el scheduler utilizado. Con `enable_model_cpu_offload()` se puede reducir el pico de VRAM a unos 4 GB, a costa de mayor latencia.
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM, como NVIDIA RTX 3060/3070, RTX 4060/4070, o GPUs de datacenter como A10G o L4. Para generación a 1024x1024 con 30 pasos, una RTX 3090 o superior ofrece tiempos de inferencia de 5-10 segundos; en GPUs de 8 GB puede ser necesario reducir la resolución o usar menos pasos.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo con 8 GB o más, siempre que se use la cuantización MXFP4 y se gestione la memoria con offload si es necesario.
- Opciones de despliegue: al ser un modelo de diffusers, se puede servir con la librería `diffusers` en Python, o mediante servidores de inferencia como Hugging Face Inference Endpoints, Replicate o servicios gestionados. También es posible convertirlo a formato ONNX o TensorRT para optimización, aunque no se proporcionan pesos en esos formatos.
- Latencia y throughput estimados: no hay datos publicados. Como referencia, el modelo SDXL original en fp16 tarda unos 10-15 segundos en una RTX 4090 para 30 pasos a 1024x1024; la versión cuantizada podría ser ligeramente más rápida en memoria y cómputo, pero la latencia depende en gran medida del hardware y del scheduler.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resolucion | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| changwangss/sdxl-base-1.0-mxfp4-smooth-signround | 1.77B (cuantizado 4 bits) | no disponible | 1024x1024 | no disponible | safetensors | Variante cuantizada de SDXL base |
| stabilityai/stable-diffusion-xl-base-1.0 | 3.5B (UNet + encoders) | 77 tokens por encoder | 1024x1024 | CreativeML Open RAIL++-M | safetensors | Modelo original en fp16, ~6.9 GB |
| stabilityai/sdxl-turbo | 3.5B | 77 tokens | 1024x1024 | CreativeML Open RAIL++-M | safetensors | Versión destilada para 1-4 pasos, más rápida pero con menos control |
| runwayml/stable-diffusion-v1-5 | 0.98B | 77 tokens | 512x512 | CreativeML Open RAIL-M | safetensors | Generación anterior, menor calidad y resolución |

La comparativa se basa en el conocimiento general de los modelos; no se dispone de datos específicos de rendimiento de la variante cuantizada frente a sus alternativas. La principal ventaja de esta variante es su menor tamaño (4.4 GB frente a 6.9 GB), lo que facilita el despliegue en entornos con restricciones de memoria, aunque puede presentar una ligera pérdida de calidad visual debido a la cuantización.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo original SDXL fue entrenado con datos de internet, por lo que puede reflejar sesgos de género, raza y cultura presentes en las imágenes de entrenamiento. La cuantización no corrige estos sesgos.
- Riesgo de alucinacion: en generación de imágenes, el modelo puede producir detalles inconsistentes, texto ilegible o anatomías incorrectas, especialmente con prompts complejos o poco específicos. La cuantización puede aumentar estos artefactos.
- Limitaciones de contexto: los text encoders tienen una longitud máxima de 77 tokens por encoder, por lo que prompts muy largos se truncan. No se ha verificado si esta variante modifica ese límite.
- Limitaciones de idioma: aunque el modelo puede interpretar prompts en otros idiomas, su rendimiento óptimo se da en inglés. No se especifican idiomas soportados en la ficha de HuggingFace.
- Restricciones de licencia: la licencia de esta variante no está disponible. El modelo original SDXL usa CreativeML Open RAIL++-M, que permite uso comercial con ciertas restricciones (no usar para generar contenido ilegal o dañino). Se recomienda contactar al autor para aclarar los términos antes de usar en producción.
- Caveat de cuantización: la cuantización MXFP4 puede degradar la calidad en escenarios de alta exigencia (por ejemplo, rostros o texto pequeño). Se recomienda evaluar visualmente los resultados antes de desplegar en aplicaciones críticas.
- Compatibilidad: aunque el tag indica `endpoints_compatible`, no se garantiza que todos los componentes (VAE, text encoders) estén cuantizados de la misma forma, lo que podría causar incompatibilidades con ciertas versiones de diffusers o hardware sin soporte para MXFP4.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/changwangss/sdxl-base-1.0-mxfp4-smooth-signround
- Modelo original SDXL base (Stability AI): https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Paper de SDXL (arXiv): https://arxiv.org/abs/2307.01952
- Documentación de diffusers para SDXL: https://huggingface.co/docs/diffusers/using-diffusers/sdxl
- Repositorio de SDXL en GitHub (referencia): https://github.com/Stability-AI/generative-models
