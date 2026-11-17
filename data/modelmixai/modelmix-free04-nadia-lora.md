# ModelMixAI/modelmix-free04-nadia-lora

## Resumen

Nadia es un LoRA de personaje completo para Stable Diffusion XL (SDXL), desarrollado por ModelMixAI dentro de su catálogo de modelos virtuales e influencers de IA. El adaptador fija una identidad visual coherente —rostro y cuerpo— de un personaje ficticio, "Nadia, 27, creadora de maquillaje glam persa", de modo que la misma modelo virtual aparezca consistente entre generaciones. Está entrenado sobre epiCRealism XL, un checkpoint derivado de stabilityai/stable-diffusion-xl-base-1.0, y se distribuye como archivo .safetensors de 0,3 GB.

El modelo resuelve un problema concreto en flujos de generación de imagen: la inconsistencia de personaje entre imágenes. En lugar de describir el aspecto en cada prompt, el LoRA inyecta la identidad mediante un token de activación (`mmx_free04_nadia_cy`) y un peso recomendado de 0,9. Es relevante como pieza de un sistema modular de LoRAs (personajes, rostros, cuerpos y localizaciones) que el autor comercializa por separado, y se ofrece gratuitamente como muestra de ese catálogo.

No es un modelo de lenguaje: no tiene parámetros, contexto ni capacidades de razonamiento. Es un adaptador de bajo rango para un modelo de difusión de texto a imagen, y todas las especificaciones de esta ficha se refieren a ese dominio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre SDXL, un UNet de difusión latente con codificador de texto |
| Parametros totales | no disponible (el LoRA se entrena sobre SDXL base; el número de parámetros del adaptador no se publica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de texto a imagen; sin ventana de contexto) |
| Tipos de cuantizacion | no disponible (se distribuye en .safetensors; el LoRA se carga en fp16 sobre el checkpoint base) |
| Idiomas soportados | no disponible (los prompts se procesan con el codificador de texto de SDXL, mayoritariamente inglés) |
| Licencia | other (uso personal únicamente; uso comercial no incluido) |
| Formato de pesos | .safetensors (0,3 GB) |

## Arquitectura y entrenamiento

El adaptador es un LoRA aplicado sobre SDXL, el modelo de difusión latente de Stability AI compuesto por un UNet, un VAE y dos codificadores de texto (CLIP ViT-L y OpenCLIP ViT-bigG). El LoRA congela los pesos del modelo base e inyecta matrices de bajo rango en las capas del UNet, de modo que el checkpoint base permanece intacto y el adaptador solo modula la generación. Según la model card, el entrenamiento se realizó sobre epiCRealism XL, un refinamiento de SDXL orientado a fotorrealismo.

El conjunto de datos de entrenamiento consta de 20 imágenes del personaje, una cantidad reducida que explica la naturaleza especializada del adaptador: captura una identidad concreta, no un estilo general. No se documentan el número de pasos, la tasa de aprendizaje, la resolución de entrenamiento ni si se aplicaron técnicas de regularización o aumento de datos. Tampoco se especifica si hubo etapas de refinamiento adicionales. El token de activación es `mmx_free04_nadia_cy` y la etiqueta de invocación recomendada es `<lora:mmx_free04_nadia_cy:0.9>`, con un rango de peso sugerido de 0,8 a 1,0.

## Capacidades

- Generación de imágenes fotorrealistas de un personaje femenino adulto ficticio con identidad visual consistente entre generaciones.
- Control de rasgos faciales definidos en la model card: mujer persa, cabello negro largo ondulado y voluminoso, ojos marrón oscuro, piel oliva, cejas gruesas marcadas, pestañas dramáticas y maquillaje contour.
- Reproducción del cuerpo completo del personaje, no solo del rostro, según la descripción del autor.
- Combinación con LoRAs de localización del mismo catálogo para situar al personaje en escenas coherentes.
- Ajuste de intensidad del efecto mediante el peso del LoRA (0,8–1,0; 0,9 recomendado).
- Integración en pipelines de texto a imagen compatibles con SDXL (Diffusers, ComfyUI, Automatic1111 y similares).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de código: es exclusivamente un adaptador de imagen.

## Casos de uso

- Creación de una influencer virtual consistente: el LoRA mantiene el mismo rostro y cuerpo en una serie de publicaciones, lo que permite construir un feed coherente sin regenerar la identidad en cada imagen.
- Producción de contenido para redes sociales: generación por lotes de imágenes del personaje con distintos prompts de vestuario y escena, manteniendo la identidad fija mediante el token de activación.
- Pruebas de concepto de maquillaje y estilismo: al estar especializado en maquillaje glam, sirve para generar referencias visuales de looks de belleza sobre un rostro estable.
- Composición de escenas con LoRAs de localización: combinando este personaje con un LoRA de entorno de ModelMix se obtienen series de imágenes coherentes en localizaciones recurrentes, útil para narrativa visual o catálogos.
- Prototipado de personajes para proyectos creativos: el adaptador sirve como base para evaluar si el pipeline SDXL y el flujo de LoRAs encajan antes de encargar un personaje a medida al autor.
- Demostración y evaluación de la técnica LoRA: con solo 20 imágenes de entrenamiento, es un ejemplo práctico de cómo un adaptador de bajo rango fija una identidad concreta sobre un checkpoint fotorrealista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FID, CLIP score, similitud de identidad ni evaluaciones comparativas), y este tipo de adaptadores no se evalúa habitualmente con los benchmarks de modelos de lenguaje.

## Requisitos de hardware

- El LoRA pesa 0,3 GB, pero requiere cargar el checkpoint base SDXL (aproximadamente 6,9 GB en fp16) para funcionar.
- VRAM estimada para inferencia en fp16: en torno a 8–10 GB con optimizaciones de memoria; el consumo exacto depende del sampler, la resolución y el backend.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100 o H100 para generación rápida y por lotes; tarjetas con 8 GB o más pueden ejecutar SDXL con atención eficiente o descarga parcial a CPU.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores, con posibles ajustes de memoria.
- Opciones de despliegue: Diffusers (Python), ComfyUI, Automatic1111/Forge, InvokeAI y otros frontends compatibles con LoRAs de SDXL.
- Latencia y throughput: no disponibles. Dependen del hardware, la resolución y el número de pasos; no se publican cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ModelMixAI/modelmix-free04-nadia-lora | LoRA de personaje | SDXL (epiCRealism XL) | 20 imágenes | other (solo uso personal) | Hugging Face, gratuita |
| LoRAs de personaje de otros autores en Civitai | LoRA de personaje | SDXL o SD 1.5 | Variable, a menudo decenas de imágenes | Variable según autor | Civitai y repositorios comunitarios |
| stabilityai/stable-diffusion-xl-base-1.0 | Modelo base completo | SDXL | Dataset masivo no detallado en esta ficha | CreativeML Open RAIL++-M | Hugging Face, gratuita |

La comparación directa con adaptadores concretos no está disponible: no se han publicado métricas de identidad ni de calidad que permitan un contraste cuantitativo. La diferencia principal frente a otros LoRAs de personaje es la licencia restrictiva (solo uso personal) y su integración en un catálogo modular de pago.

## Limitaciones y advertencias

- Licencia de uso personal únicamente: el uso comercial no está incluido, lo que impide emplearla en productos, servicios o campañas sin acuerdo adicional con el autor.
- Prohibida la redistribución, reventa, compartición o resubida del archivo .safetensors.
- Prohibido usar el LoRA para representar personas reales o menores de edad.
- El personaje es ficticio y generado por IA; cualquier parecido con personas reales es accidental.
- Entrenado con solo 20 imágenes: la variedad de poses, expresiones y ángulos puede ser limitada, y el peso recomendado (0,9) sugiere que valores altos pueden degradar la imagen.
- Riesgo de sobreajuste al estilo del checkpoint base epiCRealism XL, lo que puede condicionar la estética final.
- Sin información sobre sesgos: no se documentan sesgos demográficos ni de representación, aunque el personaje parte de una descripción étnica y estética concreta.
- Sin datos de benchmarks ni de calidad objetiva; la evaluación es puramente visual.
- El codificador de texto de SDXL está optimizado para inglés, por lo que los prompts en otros idiomas pueden rendir peor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ModelMixAI/modelmix-free04-nadia-lora
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Tienda Payhip del autor: https://payhip.com/modelmix
- Lemon Squeezy: https://modelmix.lemonsqueezy.com
- 3DIMLI: https://www.3dimli.com/store/modelmix
- Whop: https://whop.com/modelmix
