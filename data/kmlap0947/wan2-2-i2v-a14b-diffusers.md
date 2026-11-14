# Kmlap0947/Wan2.2-I2V-A14B-Diffusers

## Resumen

Wan2.2-I2V-A14B es un modelo de difusión para generación de vídeo a partir de imagen (image-to-video) desarrollado por el equipo Wan-AI (Alibaba). Esta ficha concreta corresponde a una republicación no oficial en el repositorio `Kmlap0947/Wan2.2-I2V-A14B-Diffusers`, que empaqueta los pesos en formato Diffusers (`WanImageToVideoPipeline`) con un total de 14.288.901.184 parámetros y un tamaño de repositorio de 126,2 GB.

El modelo forma parte de la familia Wan2.2, una actualización de los modelos fundacionales de vídeo de Wan que introduce una arquitectura Mixture-of-Experts (MoE) en el proceso de difusión: distintos expertos especializados se encargan de tramos diferentes del denoising a lo largo de los timesteps, ampliando la capacidad total del modelo sin incrementar proporcionalmente el coste computacional por paso. La variante I2V-A14B está especializada en animar imágenes de entrada y soporta resoluciones de 480P y 720P.

Su relevancia radica en que se distribuye con licencia Apache 2.0, ofrece integración oficial con Diffusers y ComfyUI, y compite en calidad de movimiento, semántica y estética con modelos de vídeo generativo tanto abiertos como cerrados. La model card reporta un aumento del 65,6 % en imágenes y del 83,2 % en vídeos de entrenamiento respecto a Wan2.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión para vídeo con Mixture-of-Experts (MoE) sobre timesteps de denoising |
| Parametros totales | 14.288.901.184 |
| Parametros activos | no disponible (el numero de expertos activos por paso no se detalla en la informacion proporcionada) |
| Longitud de contexto | no aplica (modelo generativo de vídeo, no LLM); resoluciones soportadas: 480P y 720P |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (integracion Diffusers, `WanImageToVideoPipeline`) |

## Arquitectura y entrenamiento

Wan2.2-I2V-A14B es un modelo de difusión para vídeo que incorpora una arquitectura Mixture-of-Experts en el proceso de denoising. La innovación principal descrita en la model card consiste en separar el proceso de eliminación de ruido por tramos de timesteps, asignando expertos especializados y potentes a cada tramo. Esto permite aumentar la capacidad global del modelo manteniendo un coste computacional comparable al de un modelo denso de menor tamaño. La variante I2V-A14B está diseñada específicamente para image-to-video, con soporte de 480P y 720P, y según el autor produce una síntesis de vídeo más estable con menos movimientos de cámara irreales y mejor soporte de escenas estilizadas.

En cuanto a datos de entrenamiento, la model card indica que Wan2.2 se entrenó con un 65,6 % más de imágenes y un 83,2 % más de vídeos que Wan2.1, e incorpora datos estéticos curados con etiquetas detalladas de iluminación, composición, contraste y tono de color para permitir un control más preciso del estilo cinematográfico. No se especifica en la información proporcionada el número exacto de tokens, la composición completa del dataset ni si se aplicaron etapas de RLHF o DPO. La familia Wan2.2 incluye además una variante TI2V-5B con un VAE de alta compresión (ratio 16×16×4) que soporta 720P a 24 fps en GPUs de consumo como la RTX 4090, aunque esa variante es un modelo distinto del A14B aquí descrito.

## Capacidades

- Generación de vídeo a partir de una imagen de entrada (image-to-video) en resoluciones de 480P y 720P.
- Generación de movimiento complejo: la model card destaca mejoras en generalización de movimientos, semántica y estética respecto a Wan2.1.
- Estética cinematográfica controlable: datos etiquetados con iluminación, composición, contraste y tono de color permiten ajustar preferencias estéticas.
- Soporte de escenas estilizadas diversas y menor tendencia a movimientos de cámara irreales.
- Integración nativa con Diffusers mediante `WanImageToVideoPipeline`.
- Integración con ComfyUI para flujos de trabajo visuales.
- Soporte de inferencia multi-GPU en el código oficial de Wan2.2.
- Idiomas de prompt soportados: inglés (en) y chino (zh).
- No se documentan en la información disponible capacidades de tool calling, agentes, audio, visión comprensiva ni thinking mode; es un modelo generativo de vídeo, no un LLM.

## Casos de uso

- Animación de imágenes fijas para publicidad: a partir de una fotografía de producto se genera un clip de vídeo con movimiento de cámara controlado, útil para anuncios y catálogos, gracias al soporte de 480P y 720P y al control estético etiquetado.
- Previsualización de storyboards en cine y animación: convertir frames clave en clips animados para validar ritmo y composición antes de la producción final, aprovechando la generación de movimiento complejo y la estética cinematográfica controlable.
- Creación de contenido para redes sociales: generar vídeos cortos a partir de ilustraciones o fotos con estilos ajustables mediante prompts en inglés o chino.
- Prototipado de videojuegos: animar concept art y sprites estáticos para evaluar animaciones de personajes o entornos antes de implementarlas en el motor.
- Restauración creativa y "living photos": animar fotografías antiguas o retratos con movimientos sutiles y estables, beneficiándose de la reducción de movimientos de cámara irreales descrita por el autor.
- Investigación en generación de vídeo: servir como base para fine-tuning o experimentación con arquitecturas MoE en difusión, al estar disponible bajo Apache 2.0 y con pesos en safetensors e integración Diffusers.
- Automatización de pipelines de marketing: integrar el modelo en flujos con ComfyUI o Diffusers para generar variaciones de vídeo a partir de bancos de imágenes de forma por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma de forma cualitativa que Wan2.2 alcanza "TOP performance among all open-sourced and closed-sourced models" y que la variante TI2V-5B es uno de los modelos 720P@24fps más rápidos disponibles, pero no se incluyen tablas numéricas de métricas (FVD, CLIP score, VBench u otras) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Con 14.288.901.184 parámetros y pesos en safetensors, el repositorio ocupa 126,2 GB; la inferencia en precisión completa requiere múltiples GPUs de alta capacidad.
- GPU recomendadas: el código oficial de Wan2.2 incluye inferencia multi-GPU para el modelo A14B, lo que sugiere despliegue en configuraciones con varias GPUs de datacenter (tipo A100/H100). No se detallan modelos concretos en la información disponible.
- ¿Cabe en GPU de consumo? La model card menciona que la variante TI2V-5B (un modelo distinto, no el A14B) puede ejecutarse en GPUs de consumo como la RTX 4090 a 720P@24fps. Para el I2V-A14B no se confirma que quepa en una GPU de consumo.
- Opciones de despliegue: Diffusers (`WanImageToVideoPipeline`), ComfyUI, y el repositorio oficial `Wan-Video/Wan2.2` con scripts de inferencia multi-GPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de vídeo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan2.2-I2V-A14B (esta ficha) | 14.288.901.184 | 480P / 720P | Difusion MoE, image-to-video | Apache 2.0 | Hugging Face, ModelScope, Diffusers, ComfyUI |
| Wan2.2-T2V-A14B | no disponible en la informacion | 480P / 720P | Difusion MoE, text-to-video | Apache 2.0 | Hugging Face, ModelScope |
| Wan2.2-TI2V-5B | no disponible en la informacion | 720P a 24 fps | Difusion con VAE de alta compresion (16x16x4), T2V+I2V | Apache 2.0 | Hugging Face, ModelScope, ejecutable en RTX 4090 |
| Wan2.1 | no disponible en la informacion | no disponible | Difusion (predecesor, sin MoE descrito) | no disponible | GitHub Wan-Video/Wan2.1 |

No se dispone en la información proporcionada de datos comparativos de rendimiento numérico con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- Este repositorio (`Kmlap0947/Wan2.2-I2V-A14B-Diffusers`) es una republicación de un tercero, no el repositorio oficial de Wan-AI; conviene verificar la integridad de los pesos frente al original.
- Registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso comunitario ni validación externa de esta copia concreta.
- Riesgo de alucinación visual: como modelo generativo, puede producir movimientos, objetos o detalles inconsistentes con la imagen de entrada.
- Idiomas de prompt limitados a inglés y chino; el rendimiento con prompts en castellano no está documentado.
- No se detallan sesgos conocidos en la información proporcionada.
- Aunque la licencia es Apache 2.0 (permite uso comercial), el modelo base es de Wan-AI y conviene revisar los términos del repositorio oficial antes de producción.
- El tamaño del repositorio (126,2 GB) y los 14,3 mil millones de parámetros implican requisitos de almacenamiento y cómputo elevados; no se confirma viabilidad en GPU de consumo para esta variante.
- No se especifican limitaciones de longitud de vídeo, número de frames ni latencia, datos relevantes para planificar producción.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/Kmlap0947/Wan2.2-I2V-A14B-Diffusers
- Repositorio oficial I2V-A14B (Diffusers): https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B-Diffusers
- Pesos oficiales I2V-A14B: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
- ModelScope oficial I2V-A14B: https://modelscope.cn/models/Wan-AI/Wan2.2-I2V-A14B
- Organizacion Wan-AI en Hugging Face: https://huggingface.co/Wan-AI/
- Repositorio GitHub: https://github.com/Wan-Video/Wan2.2
- Informe tecnico (arXiv): https://arxiv.org/abs/2503.20314
- Blog oficial: https://wan.video/welcome
- Sitio web: https://wan.video
- Documentacion ComfyUI: https://docs.comfy.org/tutorials/video/wan/wan2_2
- Discord: https://discord.gg/AKNgpMK4Yj
