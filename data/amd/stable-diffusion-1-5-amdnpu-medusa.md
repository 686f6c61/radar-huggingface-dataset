# amd/stable-diffusion-1.5-amdnpu-medusa

## Resumen

El modelo `amd/stable-diffusion-1.5-amdnpu-medusa` es una variante optimizada de Stable Diffusion 1.5 desarrollada por AMD para ejecutar el pipeline completo de generación de imágenes en las NPU integradas de los procesadores Ryzen AI. Se trata de una adaptación del repositorio `amd/stable-diffusion-1.5-amdnpu` que incorpora la técnica Medusa, una optimización específica de AMD para acelerar los pasos de denoising del UNet en hardware NPU. El modelo se distribuye en formato ONNX, con los componentes principales (UNet y VAE decoder) reestructurados para aprovechar el acelerador NPU, mientras que el text encoder, tokenizer y scheduler se mantienen compartidos con la versión para GPU.

Esta ficha es relevante porque permite ejecutar generación de imágenes por difusión en equipos sin GPU dedicada, utilizando únicamente la NPU integrada en los APU Ryzen AI, lo que reduce costes y consumo energético en entornos de edge computing y estaciones de trabajo ligeras. El modelo mantiene las capacidades del Stable Diffusion 1.5 original, incluyendo la generación de imágenes fotorrealistas a partir de prompts de texto, con una licencia CreativeML OpenRAIL-M que permite uso comercial bajo ciertas restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Latent Diffusion Model (UNet + VAE + CLIP ViT-L/14 text encoder) |
| Parametros totales | no disponible (el modelo original SD 1.5 tiene ~860M en el UNet, pero no se especifica para esta variante) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica, es texto a imagen; el text encoder CLIP tiene un máximo de 77 tokens) |
| Tipos de cuantizacion | no especificada (el tag "Quantization" indica que está cuantizado, pero no se detalla el tipo ni el bit-width) |
| Idiomas soportados | en (inglés) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | ONNX (con algunos componentes en safetensors según los tags) |

## Arquitectura y entrenamiento

El modelo se basa en Stable Diffusion 1.5, un Latent Diffusion Model que combina un autoencoder VAE, un UNet para el proceso de denoising en el espacio latente y un text encoder CLIP ViT-L/14 preentrenado para convertir los prompts en embeddings condicionantes. El entrenamiento original se realizó sobre el dataset LAION-5B, con un proceso de difusión latente que reduce la dimensionalidad del espacio de generación. En esta variante de AMD, el UNet y el VAE decoder se han exportado y reestructurado específicamente para ejecutarse en NPU, utilizando técnicas de cuantización y optimización de grafos ONNX. La variante Medusa añade una capa adicional de optimización, aunque no se proporcionan detalles técnicos sobre su implementación en la documentación disponible. No se indica si se realizó un reentrenamiento o si es una conversión directa del modelo original.

## Capacidades

- Generación de imágenes fotorrealistas a partir de prompts de texto en inglés, con resolución típica de 512x512 píxeles.
- Edición de imágenes mediante inpainting y outpainting (si se combina con el pipeline adecuado, aunque no se incluye en este repositorio).
- Control de estilo y composición mediante prompts detallados, gracias al text encoder CLIP.
- Ejecución completamente local en hardware AMD con NPU, sin necesidad de conexión a internet ni servicios en la nube.
- Integración con el ecosistema de Hugging Face Diffusers, ya que la estructura de carpetas (scheduler, text_encoder, tokenizer, unet, vae_decoder) es compatible con el pipeline estándar.
- No soporta tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de generación de imágenes.

## Casos de uso

- Generación de imágenes en equipos sin GPU dedicada: ideal para portátiles y mini-PCs con procesadores Ryzen AI, permitiendo a diseñadores y desarrolladores crear prototipos visuales sin depender de hardware gráfico costoso.
- Automatización de contenido visual en entornos de edge computing: se puede desplegar en dispositivos con NPU para generar imágenes bajo demanda en aplicaciones de publicidad, marketing o redes sociales, con baja latencia y consumo energético reducido.
- Creación de datasets sintéticos para entrenamiento de otros modelos: al ejecutarse localmente, permite generar grandes volúmenes de imágenes etiquetadas sin costes de API, útil para investigación en visión por computador.
- Asistencia creativa en flujos de diseño: los artistas pueden iterar rápidamente sobre conceptos visuales usando prompts, con la ventaja de que el modelo se ejecuta en el propio equipo, manteniendo la privacidad de los borradores.
- Educación y demostraciones técnicas: sirve como ejemplo de despliegue de modelos de difusión en hardware heterogéneo, mostrando cómo optimizar ONNX para NPU en talleres y cursos de IA.
- Generación de imágenes para documentación técnica o presentaciones: los desarrolladores pueden crear ilustraciones personalizadas para manuales, slides o diagramas sin salir del entorno de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas de velocidad, latencia o calidad de imagen para esta variante Medusa en comparación con el modelo original o con otras implementaciones.

## Requisitos de hardware

- Requiere un procesador AMD Ryzen AI con NPU integrada (por ejemplo, las series Ryzen 7040 o posteriores con motor XDNA).
- No se especifica la cantidad de VRAM necesaria, ya que la inferencia se realiza en la NPU, no en la GPU. La memoria del sistema (RAM) debe ser suficiente para cargar los modelos ONNX, que en conjunto ocupan aproximadamente 1.3 GB.
- No es compatible con GPUs convencionales en esta versión específica, aunque los componentes compartidos (text encoder, tokenizer, scheduler) pueden ejecutarse en CPU o GPU.
- Para el despliegue se recomienda usar el repositorio `sd-sandbox` de AMD, que proporciona el código de ejemplo y las instrucciones de ejecución.
- El formato ONNX permite su uso con ONNX Runtime, pero no se mencionan herramientas específicas como vLLM, llama.cpp u Ollama, que son para modelos de lenguaje.

## Comparativa con modelos similares

| Modelo | Arquitectura | Formato | Hardware objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| amd/stable-diffusion-1.5-amdnpu-medusa | Latent Diffusion (SD 1.5) | ONNX | NPU AMD Ryzen AI | CreativeML OpenRAIL-M | Hugging Face |
| stable-diffusion-v1-5/stable-diffusion-v1-5 | Latent Diffusion (SD 1.5) | PyTorch / safetensors | GPU (CUDA) | CreativeML OpenRAIL-M | Hugging Face |
| amd/stable-diffusion-1.5-amdnpu | Latent Diffusion (SD 1.5) | ONNX | NPU AMD Ryzen AI | CreativeML OpenRAIL-M | Hugging Face |

La diferencia principal entre la variante Medusa y la variante estándar de AMD es la optimización adicional para acelerar el denoising, aunque no se documentan los detalles técnicos ni las ganancias de rendimiento. Frente al modelo original, esta versión sacrifica flexibilidad de hardware (solo NPU) a cambio de eficiencia en dispositivos sin GPU.

## Limitaciones y advertencias

- El modelo hereda los sesgos y limitaciones del Stable Diffusion 1.5 original, incluyendo posibles representaciones estereotipadas o inexactas de ciertos grupos demográficos, profesiones o escenarios.
- Puede generar contenido inapropiado o dañino si se le pide explícitamente, a pesar de los filtros de seguridad del pipeline original. Se recomienda implementar medidas de moderación adicionales en entornos de producción.
- La generación de imágenes puede presentar alucinaciones visuales, como objetos deformados, texto ilegible o anatomía incorrecta, especialmente con prompts complejos o poco comunes.
- El modelo solo soporta prompts en inglés; no se ha entrenado ni optimizado para otros idiomas, lo que limita su uso en contextos multilingües.
- La licencia CreativeML OpenRAIL-M permite uso comercial, pero impone restricciones sobre el uso del modelo para generar contenido ilegal, difamatorio o que viole los derechos de terceros. Es obligatorio revisar los términos completos de la licencia antes de su despliegue.
- No se proporciona información sobre la robustez del modelo frente a ataques adversarios o sobre su comportamiento en escenarios de alta concurrencia. La ejecución en NPU puede tener limitaciones de throughput no documentadas.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/amd/stable-diffusion-1.5-amdnpu-medusa
- Modelo base original: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Repositorio de ejemplo de AMD (sd-sandbox): https://github.com/amd/sd-sandbox
- Modelo AMD sin variante Medusa: https://huggingface.co/amd/stable-diffusion-1.5-amdnpu
- Anuncio de colaboración AMD-Stability AI: https://stability.ai/news-updates/stable-diffusion-now-optimized-for-amd-radeon-gpus
- Paper de Latent Diffusion Models: https://arxiv.org/abs/2112.10752
- Paper de CLIP: https://arxiv.org/abs/2103.00020
- Paper de Imagen (referencia para text encoder): https://arxiv.org/abs/2205.11487
