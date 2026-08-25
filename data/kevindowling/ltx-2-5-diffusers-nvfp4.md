# KevinDowling/LTX-2.5-Diffusers-NVFP4

## Resumen

LTX-2.5-Diffusers-NVFP4 es una versión cuantizada en formato NVFP4 (NVIDIA FP4) del modelo LTX-2.5-Diffusers de Lightricks, un modelo de difusión de video de última generación que genera vídeo sincronizado con audio estéreo de 48 kHz. Esta variante, publicada por KevinDowling, está optimizada para hardware Blackwell de NVIDIA (como DGX Spark y GB10) y reduce el tamaño del modelo original de 19B parámetros a aproximadamente 10,8B parámetros en safetensors, manteniendo la arquitectura de transformer de difusión (DiT) y el pipeline de image-to-video.

El modelo resuelve el problema de la generación de vídeo de alta calidad con audio sincronizado en un solo modelo, sin necesidad de pipelines separados. Su relevancia actual radica en que ofrece una alternativa cuantizada que puede ejecutarse en hardware de consumo profesional con requisitos de VRAM reducidos, manteniendo las capacidades del modelo base. El acceso es restringido (gated) y requiere aceptar la licencia comunitaria de LTX-2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) para video y audio |
| Parametros totales | 10.820.238.592 (según safetensors; el modelo base original tiene 19B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (modelo de video, no texto) |
| Tipos de cuantizacion | NVFP4 (FP4 de NVIDIA) |
| Idiomas soportados | no disponible (el modelo base no especifica idiomas; la generación de video es agnóstica al idioma) |
| Licencia | ltx-2-community-license-agreement |
| Formato de pesos | safetensors (cuantizado NVFP4) |

## Arquitectura y entrenamiento

LTX-2.5-Diffusers es un modelo denso de 19B parámetros basado en un transformer de difusión (DiT) que procesa video y audio de forma conjunta. El modelo original genera video con audio estéreo sincronizado a 48 kHz, y soporta múltiples modos de rendimiento (calidad, velocidad, etc.). La versión NVFP4 aquí descrita es una cuantización del modelo base que reduce el peso de los parámetros a precisión FP4, optimizada para las unidades tensor de quinta generación de NVIDIA (Blackwell). No se dispone de información detallada sobre el dataset de entrenamiento ni sobre el proceso de alineación (RLHF/DPO) del modelo base en los resultados de búsqueda. La cuantización se ha realizado probablemente mediante técnicas de calibración post-entrenamiento, aunque no se especifica el método exacto.

## Capacidades

- Generación de video a partir de una imagen inicial (image-to-video) con movimiento coherente y continuidad entre fotogramas.
- Generación de audio sincronizado con el video, incluyendo diálogos, efectos de sonido y música, en estéreo a 48 kHz.
- Soporte de múltiples modos de rendimiento (calidad, velocidad, equilibrio) según las necesidades del usuario.
- Capacidad de generación multi-shot nativa, lo que permite mantener consistencia entre escenas o tomas consecutivas.
- Fuerte adherencia a las indicaciones (prompt adherence) para controlar el contenido visual y auditivo.
- No se ha confirmado soporte de tool calling, agentes o razonamiento multi-paso, ya que es un modelo generativo de video, no un LLM conversacional.

## Casos de uso

- Producción de vídeo para marketing y publicidad: el modelo puede generar clips promocionales de alta calidad a partir de una imagen de producto o un storyboard, con audio sincronizado, reduciendo costes de producción.
- Creación de contenido para redes sociales: los creadores pueden generar vídeos cortos con audio para plataformas como TikTok o Instagram Reels, partiendo de una imagen fija y una descripción textual.
- Previsualización en cine y animación: los directores pueden usar el modelo para crear animáticas o previsualizaciones con audio provisional antes de la producción final.
- Generación de material educativo: permite crear vídeos explicativos con narración y efectos visuales a partir de imágenes o diagramas, facilitando la producción de cursos online.
- Desarrollo de videojuegos: el modelo puede generar cinemáticas o secuencias de vídeo con audio para integrar en juegos, a partir de concept art o capturas de pantalla.
- Restauración y mejora de contenido audiovisual: aunque no es su función principal, la capacidad de generar audio sincronizado puede usarse para añadir sonido a vídeos mudos existentes, partiendo de un fotograma clave.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta versión cuantizada NVFP4 en la información disponible. El modelo base LTX-2.5 no presenta tablas de benchmarks en los resultados de búsqueda obtenidos. Por tanto, no se dispone de datos comparativos de rendimiento (PSNR, FID, CLIP score, etc.) para esta variante.

## Requisitos de hardware

- VRAM estimada: al ser una cuantización NVFP4, el tamaño del modelo en memoria es de aproximadamente 10,8 GB (según el número de parámetros y la precisión FP4). Sin embargo, el pipeline de difusión requiere memoria adicional para las activaciones y el procesamiento de video, por lo que se recomienda al menos 16 GB de VRAM para inferencia básica.
- GPU recomendadas: NVIDIA Blackwell (serie RTX 50, DGX Spark, GB10) por su soporte nativo de FP4. También puede ejecutarse en GPUs Ampere o Ada con emulación, aunque con menor rendimiento.
- En consumer GPU: cabe en tarjetas con 16 GB o más, como RTX 4080, RTX 4090 o RTX 5080, siempre que se utilice la cuantización NVFP4 y se ajuste el tamaño del lote.
- Opciones de despliegue: el modelo está diseñado para usarse con la librería `diffusers` de HuggingFace. También se puede integrar con vLLM-Omni (según los recipes de vLLM) para servir el modelo en producción, aunque la cuantización NVFP4 puede requerir soporte específico de vLLM para FP4.
- Latencia y throughput: no se dispone de datos medidos para esta versión cuantizada. El modelo base de 19B requiere una GPU de alta gama para tiempos de generación razonables; la cuantización FP4 debería mejorar el throughput en hardware Blackwell, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX-2.5-Diffusers (base) | 19B | no disponible | DiT video+audio | ltx-2-community | HuggingFace (gated) |
| LTX-2.5-Diffusers-NVFP4 (este) | 10,8B (cuantizado) | no disponible | DiT video+audio cuantizado | ltx-2-community | HuggingFace (gated) |
| Stable Video Diffusion | 1.4B (aprox.) | no disponible | UNet video | Stability AI Community | HuggingFace (abierto) |

La comparativa se limita a modelos de generación de video conocidos. LTX-2.5 destaca por integrar audio sincronizado, algo que Stable Video Diffusion no ofrece. La versión cuantizada reduce el tamaño y los requisitos de hardware, pero no se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated en HuggingFace, por lo que es necesario aceptar la licencia y las condiciones de uso antes de descargarlo.
- Licencia comunitaria: la `ltx-2-community-license-agreement` puede imponer restricciones sobre el uso comercial, la redistribución o la generación de contenido con fines específicos. Es imprescindible revisar el texto completo de la licencia.
- Pérdida de calidad por cuantización: la cuantización NVFP4 puede degradar ligeramente la fidelidad del video y el audio en comparación con el modelo original en FP16/BF16, especialmente en escenas con detalles finos o texturas complejas.
- Sesgos y alucinaciones: como todo modelo generativo, puede producir contenido visual o auditivo no deseado, incoherente o con sesgos derivados de los datos de entrenamiento. No se dispone de información específica sobre sesgos para este modelo.
- Limitaciones de contexto: al ser un modelo de video, no procesa texto largo ni mantiene conversaciones; su entrada principal es una imagen y una indicación textual.
- Requisitos de hardware específicos: el formato NVFP4 está optimizado para GPUs Blackwell; en hardware anterior puede no ser compatible o requerir conversión a otra precisión, lo que anularía la ventaja de la cuantización.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KevinDowling/LTX-2.5-Diffusers-NVFP4
- Modelo base en HuggingFace: https://huggingface.co/Lightricks/LTX-2.5-Diffusers
- Repositorio oficial de LTX-2: https://github.com/Lightricks/LTX-2
- Página del modelo LTX-2.5: https://ltx.io/model/ltx-2-5
- Recipes de vLLM para LTX-2.5-Diffusers: https://recipes.vllm.ai/Lightricks/LTX-2.5-Diffusers
