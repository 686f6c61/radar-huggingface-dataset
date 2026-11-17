# Dorotheou/Wan2.2-T2V-A14B

## Resumen

Wan2.2-T2V-A14B es un modelo de difusión texto-a-vídeo desarrollado por el equipo Wan (Wan-AI) y distribuido en este repositorio por el usuario Dorotheou. Forma parte de la familia Wan2.2, una actualización de los modelos fundacionales de vídeo de Wan que introduce una arquitectura de mezcla de expertos (MoE) en el proceso de difusión, separando las fases de eliminación de ruido según el paso temporal con expertos especializados. El modelo genera vídeos de 5 segundos en resoluciones de 480P y 720P a partir de descripciones textuales.

El modelo resuelve el problema de la generación de vídeo de alta calidad con control estético y movimiento complejo. Según la model card, Wan2.2 se entrenó con un 65,6 % más de imágenes y un 83,2 % más de vídeos que Wan2.1, lo que mejora la generalización en movimiento, semántica y estética. La arquitectura MoE permite ampliar la capacidad total del modelo manteniendo el mismo coste computacional en inferencia, ya que cada experto se activa solo en su tramo del proceso de difusión.

El repositorio tiene un tamaño de 126,2 GB y se distribuye bajo licencia Apache 2.0. Está integrado con las librerías `diffusers` y `wan2.2`, y cuenta con soporte para ComfyUI y Diffusers. La relevancia actual radica en que se posiciona, según sus autores, por encima de los principales modelos comerciales en la mayoría de dimensiones del benchmark Wan-Bench 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión con mezcla de expertos (MoE) para texto-a-vídeo |
| Parametros totales | 14B (denominación A14B del modelo; desglose exacto de parámetros activos no disponible) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (modelo de difusión, no de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Resolución de salida | 480P y 720P |
| Duración de vídeo | 5 segundos |
| Pipeline | text-to-video |
| Tamaño del repositorio | 126,2 GB |

## Arquitectura y entrenamiento

Wan2.2-T2V-A14B emplea una arquitectura de difusión con mezcla de expertos (MoE) aplicada al proceso de eliminación de ruido. La innovación principal consiste en separar el proceso de denoising por pasos temporales, asignando expertos especializados a tramos distintos del proceso. Esto amplía la capacidad total del modelo sin incrementar el coste computacional por paso, ya que solo se activa el experto correspondiente al tramo temporal en curso. El modelo se distribuye en formato safetensors y se ejecuta mediante la librería `wan2.2` y `diffusers`.

En cuanto al entrenamiento, la model card indica que Wan2.2 se entrenó con un 65,6 % más de imágenes y un 83,2 % más de vídeos que Wan2.1, e incorpora datos estéticos curados con etiquetas detalladas de iluminación, composición, contraste y tono de color. No se especifica en la información disponible el número total de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo se apoya en un VAE de alta compresión (16×16×4) en la variante TI2V-5B de la familia, aunque no se detalla si el T2V-A14B usa exactamente el mismo VAE.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) en resoluciones de 480P y 720P.
- Generación de clips de 5 segundos de duración.
- Control estético cinematográfico: la incorporación de datos etiquetados permite controlar iluminación, composición, contraste y tono de color.
- Generación de movimiento complejo, con mejor generalización en movimiento, semántica y estética respecto a Wan2.1.
- Integración con ComfyUI y Diffusers para flujos de trabajo de generación.
- Inferencia multi-GPU disponible en el código oficial.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio.

## Casos de uso

- Producción de vídeo publicitario: el modelo genera clips de 5 segundos en 720P con control de iluminación y composición, adecuado para prototipos rápidos de anuncios y storyboards animados antes de la producción final.
- Previsualización de escenas cinematográficas: gracias a los datos estéticos etiquetados, permite generar versiones preliminares de planos con un tono de color e iluminación concretos, útil en fases de preproducción.
- Creación de contenido para redes sociales: la generación de clips cortos de 5 segundos en 480P o 720P encaja con formatos de vídeo breve para plataformas sociales.
- Generación de material de referencia para animación: los clips generados pueden servir como referencia de movimiento para animadores o para equipos de VFX.
- Investigación en generación de vídeo: al ser un modelo abierto con arquitectura MoE, sirve como base para experimentación académica en difusión de vídeo y arquitecturas de expertos.
- Integración en pipelines creativos con ComfyUI: el soporte de ComfyUI permite encadenar el modelo con otros nodos de posprocesado, escalado o edición dentro de un flujo de trabajo visual.
- Prototipado de vídeo en entornos con múltiples GPU: el código de inferencia multi-GPU facilita el despliegue en clústeres para generar lotes de clips.

## Benchmarks y rendimiento

La model card menciona que, en el benchmark Wan-Bench 2.0, el modelo supera a los principales modelos comerciales en la mayoría de dimensiones clave de evaluación. Sin embargo, no se proporcionan cifras numéricas concretas de MMLU, HumanEval, GSM8K ni de métricas de vídeo (FVD, CLIP score, etc.) en la información disponible.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 126,2 GB en disco, lo que da una idea del tamaño de los pesos en precisión completa o alta.
- GPU recomendadas: no se especifican modelos concretos para el T2V-A14B en la información disponible. La model card menciona que la variante TI2V-5B de la familia puede ejecutarse en tarjetas de consumo como la RTX 4090, pero no confirma lo mismo para el T2V-A14B.
- ¿Cabe en GPU de consumo? No confirmado para este modelo de 14B; la familia incluye una variante de 5B apta para RTX 4090.
- Opciones de despliegue: código oficial de inferencia multi-GPU del repositorio Wan2.2, integración con ComfyUI y con Diffusers. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de difusión de vídeo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Duración | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan2.2-T2V-A14B | 14B (MoE) | 480P / 720P | 5 s | Apache 2.0 | Hugging Face, ModelScope |
| Wan2.2-TI2V-5B | 5B | 720P a 24 fps | no disponible | Apache 2.0 | Hugging Face, ModelScope |
| Wan2.2-I2V-A14B | 14B (MoE) | 480P / 720P | no disponible | Apache 2.0 | Hugging Face, ModelScope |
| Wan2.1 | no disponible | no disponible | no disponible | no disponible | GitHub, Hugging Face |

La información disponible no incluye comparativas numéricas de rendimiento frente a modelos de otros desarrolladores (por ejemplo, Sora, Kling o Veo). La comparación se limita a las variantes de la propia familia Wan2.2.

## Limitaciones y advertencias

- Riesgo de alucinación visual: como modelo generativo de difusión, puede producir contenido incoherente, artefactos o movimientos irreales, especialmente en escenas complejas.
- Sesgos: no se documentan sesgos específicos, pero al entrenarse con datos web y estéticos curados puede reflejar sesgos de representación de los datasets de origen.
- Idiomas: no se especifican los idiomas soportados para los prompts; no hay confirmación de cobertura multilingüe.
- Longitud de contexto: no aplica como modelo de lenguaje, pero la duración de vídeo está limitada a 5 segundos por generación.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de los datasets de entrenamiento y de los pesos distribuidos por terceros (este repositorio es de un usuario distinto de Wan-AI).
- Repositorio de terceros: el repositorio `Dorotheou/Wan2.2-T2V-A14B` tiene 0 descargas y 0 likes, y no está verificado como oficial; para producción se recomienda usar el repositorio oficial `Wan-AI/Wan2.2-T2V-A14B`.
- Requisitos de hardware elevados: 126,2 GB de pesos y necesidad de inferencia multi-GPU según el código oficial.
- No se documentan limitaciones específicas de resolución más allá de 480P y 720P.

## Enlaces

- Repositorio en Hugging Face (este): https://huggingface.co/Dorotheou/Wan2.2-T2V-A14B
- Repositorio oficial del modelo: https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B
- Organización Wan en Hugging Face: https://huggingface.co/Wan-AI/
- GitHub oficial: https://github.com/Wan-Video/Wan2.2
- ModelScope: https://modelscope.cn/models/Wan-AI/Wan2.2-T2V-A14B
- Informe técnico (arXiv): https://arxiv.org/abs/2503.20314
- Blog de Wan: https://wan.video/welcome
- Sitio web de Wan: https://wan.video
- Discord: https://discord.gg/AKNgpMK4Yj
