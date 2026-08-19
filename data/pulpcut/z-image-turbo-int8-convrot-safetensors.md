# PulpCut/Z-Image-Turbo-INT8-ConvRot-safetensors

## Resumen

Z-Image-Turbo-INT8-ConvRot-safetensors es un repackaging del modelo de generación de imágenes Z-Image-Turbo de Alibaba Tongyi Lab, adaptado para el motor de inferencia nativo H3ddle. El autor, PulpCut, reorganiza los pesos del modelo en cuatro archivos independientes (transformer, text encoder, VAE decoder y tokenizer) para permitir una carga y validación modular, sin retrenar, fusionar ni re-cuantizar ningún tensor. El modelo base es Z-Image-Turbo, un transformer de difusión de 6.15 mil millones de parámetros destilado para generar imágenes en solo 8 pasos de evaluación, con cuantización INT8 mediante la técnica ConvRot de Martin Rizzo.

La relevancia de este checkpoint radica en su optimización para Apple Silicon: las matrices INT8 se almacenan en orden input-major (transpuestas respecto al release original), lo que mejora la localidad de caché y ofrece una ganancia de rendimiento de aproximadamente el 9% en esa plataforma. Además, se elimina el encoder del autoencoder (innecesario en text-to-image) y se revierte la cuantización de la última capa lineal a bf16, reduciendo la pérdida de precisión sin impacto significativo en el tamaño. El modelo mantiene la licencia Apache 2.0 y está disponible en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (S3-DiT) con 30 capas + 2 refiners + 2 refiners adicionales; text encoder Qwen3-4B; VAE decoder AutoencoderKL |
| Parametros totales | 6.15 mil millones (transformer) + 4 mil millones (text encoder) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el text encoder Qwen3-4B tiene su propio límite, no especificado) |
| Tipos de cuantizacion | INT8 (matrices ConvRot) excepto la última capa lineal en bf16 |
| Idiomas soportados | inglés y chino (según documentación de Z-Image-Turbo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (archivos separados por subsistema: transformer, text_encoder, vae_decoder, tokenizer.json) |

## Arquitectura y entrenamiento

El modelo original Z-Image-Turbo es un transformer de difusión (DiT) de 6.15 mil millones de parámetros, desarrollado por Alibaba Tongyi Lab. Emplea una arquitectura S3-DiT (probablemente "Scaled and Shifted" o similar, no especificado) con 30 capas principales y dos pares de capas refinadoras. El text encoder es Qwen3-4B, un modelo de lenguaje de 4 mil millones de parámetros, y el decodificador VAE es la mitad decoder de un AutoencoderKL. El modelo fue destilado (variante Turbo) para requerir solo 8 NFEs (Number of Function Evaluations) en lugar de los 50 o más típicos, logrando una latencia inferior a un segundo en GPUs empresariales como la H800.

La cuantización INT8 aplicada por Martin Rizzo utiliza la técnica ConvRot, que rota la activación en lugar del peso para preservar la precisión de la cuantización. En este repackaging, las matrices INT8 se almacenan transpuestas (input-major) para mejorar el acceso a memoria en Apple Silicon, y la última capa lineal (`final_layer.linear`) se revierte a bf16 porque su cuantización agresiva (64x3840) degradaba la calidad sin un ahorro real de memoria. Además, se elimina el encoder del VAE (244 tensores reducidos a 138, de 167 MB a 99 MB) y se añade un archivo `recipe.json` con las constantes de inferencia (flow-match shift, escalados latentes, hiperparámetros del DiT) para que el motor no dependa de código Python externo.

## Capacidades

- Generación de imágenes fotorrealistas de alta calidad a partir de descripciones textuales.
- Renderizado de texto dentro de la imagen en inglés y chino, con buena fidelidad tipográfica.
- Adherencia a instrucciones complejas y composición de escenas con múltiples elementos.
- Inferencia rápida: 8 pasos de evaluación, lo que permite generación casi en tiempo real.
- Compatible con el pipeline de text-to-image de Hugging Face (pipeline_tag: text-to-image).
- No soporta tool calling, agentes ni razonamiento multi-paso (es un modelo generativo de imágenes, no un LLM conversacional).

## Casos de uso

- Generación de imágenes en producción a alta velocidad: gracias a sus 8 NFEs y la cuantización INT8, el modelo puede integrarse en APIs de generación de imágenes donde la latencia es crítica, como servicios de diseño asistido por IA o generación de contenido para marketing.
- Aplicaciones locales en Apple Silicon: el repackaging está optimizado para hardware Apple (M1/M2/M3), permitiendo ejecutar generación de imágenes en equipos de escritorio o portátiles sin GPU dedicada, con un rendimiento aceptable para prototipado y uso personal.
- Edición y variación de imágenes en flujos de trabajo de diseño: el modelo puede usarse como base para generar variaciones de conceptos visuales, ilustraciones para publicaciones o bocetos iniciales en estudios creativos.
- Generación de imágenes para documentación técnica: su capacidad de renderizar texto legible en inglés y chino lo hace útil para crear diagramas, infografías o capturas explicativas.
- Integración en motores de juego o aplicaciones interactivas: la baja latencia permite generar texturas o fondos proceduralmente en tiempo real, aunque el tamaño del modelo (14.3 GB) puede requerir optimizaciones adicionales.
- Investigación en cuantización y eficiencia: el checkpoint sirve como referencia para estudiar el impacto de la transposición de matrices INT8 y la reversión de cuantización en la calidad de salida, especialmente en arquitecturas de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación original de Z-Image-Turbo afirma que "iguala o supera a los principales competidores" con 8 NFEs, y que ofrece latencia sub-segundo en GPUs H800, pero no se proporcionan números concretos (MMLU, FID, CLIP score, etc.) en los materiales consultados.

## Requisitos de hardware

- VRAM estimada: el modelo original en bf16 ocupa aproximadamente 12.3 GB (6.15B x 2 bytes), por lo que cabe en GPUs con 16 GB de VRAM. La versión INT8 reduce el tamaño a unos 6.69 GB (según el checkpoint de Civitai), permitiendo ejecución en GPUs con 8-10 GB de VRAM.
- GPU recomendadas: H800 (para latencia sub-segundo), RTX 4090 (24 GB), RTX 4080 (16 GB), o cualquier GPU con al menos 8 GB de VRAM para la versión INT8. En Apple Silicon, se recomienda M1 Pro o superior para aprovechar la optimización de transposición.
- Compatibilidad con consumer GPU: sí, la versión INT8 cabe en GPUs de gama media como RTX 3060 (12 GB) o RTX 4060 (8 GB).
- Opciones de despliegue: el formato safetensors es compatible con Hugging Face Diffusers, aunque el repackaging está pensado para el motor H3ddle. También puede usarse con ComfyUI (existe una versión específica para ello) y con vLLM o TGI si se adapta.
- Latencia y throughput: no se proporcionan datos exactos, pero la variante Turbo original logra menos de 1 segundo por imagen en H800. En Apple Silicon, la ganancia del 9% por la transposición sugiere una mejora notable, aunque sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Z-Image-Turbo (original) | 6.15B | bf16 | no aplica | Apache 2.0 | safetensors |
| Z-Image-Turbo-INT8-ConvRot (este) | 6.15B | INT8 (ConvRot) | no aplica | Apache 2.0 | safetensors separados |
| SDXL (Stability AI) | 3.5B (UNet) + 0.8B (text encoder) | fp16 | no aplica | OpenRAIL++ | safetensors |
| FLUX.1-schnell (Black Forest Labs) | 12B | fp8 | no aplica | Apache 2.0 | safetensors |

La comparativa muestra que este modelo ofrece un equilibrio entre tamaño y velocidad: es más pequeño que FLUX.1-schnell y más rápido que SDXL (8 NFEs frente a 30-50). La licencia Apache 2.0 permite uso comercial sin restricciones, a diferencia de SDXL que usa OpenRAIL++.

## Limitaciones y advertencias

- No se dispone de documentación sobre sesgos o alucinaciones visuales específicas de este repackaging; el modelo original puede presentar artefactos en caras, manos o texto complejo, como es común en modelos de difusión.
- El contexto del text encoder no está especificado, por lo que prompts muy largos pueden truncarse o degradar la calidad de la generación.
- La eliminación del encoder del VAE hace que el checkpoint no sea adecuado para tareas de image-to-image o edición que requieran codificar imágenes de entrada.
- La cuantización INT8 puede reducir la fidelidad en comparación con el modelo bf16 original, especialmente en detalles finos o gradientes suaves, aunque la reversión de la última capa mitiga parte de esta pérdida.
- El formato de archivos separados por subsistema requiere un motor compatible (H3ddle) o adaptación manual para usarlo con Diffusers estándar.
- No hay garantía de soporte oficial: el repositorio es un repackaging de un tercero, no un release oficial de Tongyi Lab.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/PulpCut/Z-Image-Turbo-INT8-ConvRot-safetensors
- Repositorio original de Z-Image (Tongyi-MAI): https://github.com/Tongyi-MAI/Z-Image
- Checkpoint INT8 original de Martin Rizzo: https://huggingface.co/martin-rizzo/Z-Image-Turbo-INT8-ConvRot-ComfyUI
- Checkpoint INT8 alternativo (Winnougan): https://huggingface.co/Winnougan/Z-Image-Base-Turbo-INT8-Convrot
- Página en Civitai del checkpoint INT8: https://civitai.com/models/2732212/z-image-int8
- Página en Civitai de Z-Image-Turbo original: https://civitai.com/models/2168935/z-image-turbo
