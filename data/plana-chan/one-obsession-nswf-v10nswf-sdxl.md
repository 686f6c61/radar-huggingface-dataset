# Plana-Chan/one-obsession-nswf-v10nswf-sdxl

## Resumen

El modelo `Plana-Chan/one-obsession-nswf-v10nswf-sdxl` es un fine-tune de Stable Diffusion XL (SDXL) orientado a la generación de imágenes anime, desarrollado por el usuario `maxfeifei8` y subido a Hugging Face por `Plana-Chan`. Se basa en el modelo `OnomaAIResearch/Illustrious-xl-early-release-v0`, un checkpoint de SDXL especializado en ilustración anime, y está diseñado para producir imágenes con un estilo propio denominado "my style", con énfasis en personajes femeninos y un acabado visual particular.

El modelo está pensado para usuarios que buscan un generador de imágenes anime de alta calidad con control fino sobre el estilo, aunque su naturaleza NSFW (not safe for work) lo restringe a audiencias adultas. Con 2.567 millones de parámetros y un tamaño de repositorio de 6,9 GB, es un modelo de tamaño considerable que requiere hardware con suficiente VRAM para su inferencia. Su licencia `faipl-1.0-sd` impone condiciones específicas de uso que deben revisarse antes de cualquier despliegue comercial.

La relevancia de este modelo radica en su especialización: mientras que SDXL base es genérico, este fine-tune ha sido ajustado para un estilo concreto de anime, lo que lo hace útil para ilustradores, estudios de animación y aficionados que necesitan consistencia estilística sin depender de prompts complejos. Sin embargo, al ser un modelo reciente (creado en septiembre de 2026) y con cero descargas registradas, su adopción es aún limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion XL (UNet + VAE + CLIP text encoder) |
| Parametros totales | 2.567.463.684 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de imagen, no texto) |
| Tipos de cuantizacion | No disponible (se distribuye en safetensors, sin cuantizaciones predefinidas) |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | faipl-1.0-sd (https://freedevproject.org/faipl-1.0-sd/) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `OnomaAIResearch/Illustrious-xl-early-release-v0`, que a su vez es una variante de Stable Diffusion XL. SDXL utiliza una arquitectura de difusión latente con un UNet de aproximadamente 2,6 mil millones de parámetros, un VAE y dos codificadores de texto (CLIP ViT-L y OpenCLIP ViT-bigG). El fine-tune se realizó sobre el checkpoint de Illustrious, que ya había sido entrenado con un dataset extenso de imágenes anime, y posteriormente se ajustó con un dataset adicional (no especificado) para lograr el estilo "my style" y las características NSFW.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se utilizaron técnicas como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá del ajuste fino estándar. El modelo se distribuye en formato safetensors y es compatible con la librería `diffusers` mediante `StableDiffusionXLPipeline`.

## Capacidades

- Generación de imágenes anime de alta resolución (típicamente 1024x1024 o superior, según la configuración de SDXL).
- Estilo artístico propio denominado "my style", con énfasis en personajes femeninos y acabados de luz y sombra extremos (según los tags del modelo).
- Soporte de prompts en inglés para controlar composición, personajes y escenas.
- Capacidad de generar contenido NSFW (no apto para todos los públicos), lo que lo diferencia de modelos censurados.
- Compatible con la infraestructura de `diffusers`, lo que permite integración con pipelines de generación, inpainting, img2img y otras técnicas de SDXL.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio o vídeo.

## Casos de uso

- Ilustración de personajes anime para proyectos independientes: el modelo permite generar personajes femeninos con un estilo consistente, útil para diseñadores de personajes que necesitan explorar variaciones rápidamente.
- Creación de contenido para novelas visuales o juegos indie: su capacidad para producir imágenes de alta calidad con estilo anime facilita la generación de sprites, fondos y arte de portada sin depender de artistas externos.
- Generación de avatares personalizados para comunidades online: los usuarios pueden crear imágenes de perfil únicas con el estilo característico del modelo, aprovechando su enfoque en personajes femeninos.
- Prototipado de conceptos para animación: los estudios pueden usar el modelo para generar storyboards o conceptos preliminares, aunque la resolución y el estilo deben validarse antes de producción.
- Experimentación artística con estilos NSFW: para artistas que trabajan en géneros adultos, el modelo ofrece un punto de partida sin restricciones de censura, siempre que se respete la licencia.
- Entrenamiento de modelos derivados: al ser un checkpoint de SDXL, puede usarse como base para fine-tunes adicionales, permitiendo a otros desarrolladores adaptar el estilo a sus necesidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, FID u otras métricas de evaluación de modelos de imagen. El rendimiento cualitativo solo puede inferirse de los ejemplos mostrados en la página de Civitai, pero no se dispone de métricas objetivas.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo SDXL, se recomienda al menos 8-10 GB de VRAM para generar a 1024x1024 en fp16. Con cuantizaciones (por ejemplo, fp8 o int8) podría reducirse a 6-8 GB, pero no se ofrecen versiones cuantizadas oficiales.
- GPU recomendadas: NVIDIA RTX 3060 (12 GB) o superior, RTX 4070, RTX 4090, A100, H100. En GPUs con menos de 8 GB, la generación será lenta o requerirá técnicas de offloading.
- En consumer GPU: sí, cabe en GPUs como RTX 3060, 3070, 3080, 4060 Ti, 4070, etc., siempre que tengan al menos 8 GB de VRAM.
- Opciones de despliegue: compatible con `diffusers` (Python), `ComfyUI`, `Automatic1111` (a través de extensiones), y servidores de inferencia como `vLLM` (aunque vLLM está más orientado a LLMs, para SDXL se usan soluciones como `Stable Diffusion WebUI` o `ComfyUI`). También puede desplegarse en `Hugging Face Inference Endpoints` (el modelo tiene la etiqueta `endpoints_compatible`).
- Latencia y throughput: no se dispone de datos medidos. En una RTX 4090, una generación de 1024x1024 con 30 pasos suele tardar entre 2 y 5 segundos, pero esto es una estimación general de SDXL, no específica de este modelo.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Plana-Chan/one-obsession-nswf-v10nswf-sdxl | Illustrious XL (SDXL) | 2,57 B | No aplica | faipl-1.0-sd | Hugging Face |
| OnomaAIResearch/Illustrious-xl-early-release-v0 | SDXL | ~2,6 B | No aplica | No especificada (probablemente open) | Hugging Face |
| StabilityAI/stable-diffusion-xl-base-1.0 | SDXL | 2,6 B | No aplica | OpenRAIL++ | Hugging Face |

No se dispone de datos de rendimiento comparativo (FID, CLIP score, etc.) para estos modelos. La comparativa se limita a características generales. El modelo `one-obsession` se distingue por su enfoque NSFW y su estilo "my style", mientras que los otros son más genéricos o de referencia.

## Limitaciones y advertencias

- Contenido NSFW: el modelo está diseñado para generar contenido explícito, lo que puede ser inapropiado para entornos laborales o menores de edad. Debe usarse con responsabilidad y en plataformas que permitan este tipo de contenido.
- Sesgos conocidos: al estar entrenado principalmente con imágenes anime de personajes femeninos, puede tener un sesgo hacia ese tipo de representación, limitando la diversidad de géneros, etnias o estilos.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar artefactos, anatomías incorrectas o detalles inconsistentes, especialmente en manos, ojos o fondos complejos.
- Licencia `faipl-1.0-sd`: esta licencia impone restricciones específicas, como la prohibición de uso comercial sin permiso explícito o la obligación de compartir derivados bajo la misma licencia. Es imprescindible revisar el texto completo antes de cualquier uso.
- Idioma: solo se documenta soporte para inglés. Los prompts en otros idiomas pueden no funcionar correctamente.
- Sin mantenimiento activo: el modelo tiene cero descargas y no se observan actualizaciones desde su creación. No hay garantía de soporte o corrección de errores.
- Requisitos de hardware: la inferencia en GPUs de gama baja puede ser lenta o inviable, lo que limita su uso en entornos sin hardware adecuado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Plana-Chan/one-obsession-nswf-v10nswf-sdxl
- Modelo original en Civitai: https://civitai.com/models/1318945/one-obsessionnswf?modelVersionId=1489105
- Licencia faipl-1.0-sd: https://freedevproject.org/faipl-1.0-sd/
- Modelo base Illustrious XL: https://huggingface.co/OnomaAIResearch/Illustrious-xl-early-release-v0
- Repositorio espejo (John6666): https://huggingface.co/John6666/one-obsession-nswf-v10nswf-sdxl
