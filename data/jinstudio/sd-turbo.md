# Jinstudio/sd-turbo

## Resumen

SD-Turbo es un modelo generativo de texto a imagen (text-to-image) destilado a partir de Stable Diffusion 2.1, desarrollado originalmente por Stability AI. Su rasgo distintivo es que sintetiza imágenes fotorrealistas de 512x512 píxeles en una única evaluación de red (un solo paso de muestreo), frente a las decenas de pasos que requieren los pipelines de difusión convencionales. El repositorio analizado, Jinstudio/sd-turbo, es una reproducción de terceros del modelo original de Stability AI: la model card publicada es la de SD-Turbo y describe el método de entrenamiento Adversarial Diffusion Distillation (ADD).

El modelo se apoya en el pipeline `StableDiffusionPipeline` de la librería Diffusers y se distribuye en formato safetensors, con 865.910.724 parámetros contabilizados en los tensores publicados y un tamaño de repositorio de 13,0 GB (lo que sugiere variantes de precisión fp16 y fp32). Está pensado como artefacto de investigación para estudiar modelos de difusión pequeños y destilados, y para aplicaciones en tiempo real donde la latencia de muestreo es el factor crítico.

Es relevante ahora porque la destilación adversarial permite llevar la generación de imágenes a escenarios interactivos (previsualización instantánea, edición iterativa, generación por lotes masiva) sobre hardware de consumo, sin depender de clústeres de GPU. Conviene tener en cuenta que el repositorio concreto analizado presenta 0 descargas y 0 likes, no declara licencia en sus metadatos y no es el repositorio oficial, por lo que el material de referencia principal es la model card de Stability AI reproducida en él.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión latente text-to-image (pipeline `StableDiffusionPipeline`: UNet + VAE + codificador de texto), destilada de Stable Diffusion 2.1 |
| Parámetros totales | 865.910.724 (tensores contabilizados en los archivos safetensors del repositorio) |
| Parámetros activos | No aplica (no es una arquitectura MoE) |
| Longitud de contexto | No aplica como ventana de contexto de LLM. El codificador de texto de la familia Stable Diffusion 2.x procesa 77 tokens por prompt; este dato no se confirma en la información del repositorio |
| Tipos de cuantización | fp16 y fp32 (variantes habituales de los pipelines Diffusers). No se listan conversiones GGUF, ONNX ni cuantizaciones de 8/4 bits en este repositorio |
| Idiomas soportados | No disponible |
| Licencia | No disponible en los metadatos de este repositorio. La model card remite a la licencia de Stability AI (https://stability.ai/license) y a https://stability.ai/membership para uso comercial |
| Formato de pesos | safetensors |
| Librería | diffusers |
| Pipeline declarado | text-to-image |
| Tamaño del repositorio | 13,0 GB |
| Repositorio creado | 2026-10-09 (según metadatos de HuggingFace) |
| Última actualización | 2026-10-09 (según metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

SD-Turbo es un modelo de difusión latente que hereda la arquitectura de Stable Diffusion 2.1 (UNet de denoising, autoencoder variacional y codificador de texto) y sustituye el muestreo iterativo tradicional por un régimen de muy pocos pasos. La innovación técnica central es Adversarial Diffusion Distillation (ADD), un método de entrenamiento que combina dos señales: destilación por score distillation, que aprovecha un modelo de difusión de gran escala ya entrenado (en este caso SD 2.1) como profesor, y una pérdida adversarial que preserva la fidelidad de la imagen incluso en el régimen de uno o dos pasos de muestreo. El resultado es un modelo capaz de generar en una sola evaluación de red, con 1 a 4 pasos como rango de trabajo documentado.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron fases de RLHF o DPO; tampoco se detallan los datos del estudio de usuarios más allá del resultado cualitativo publicado. El modelo se publica como artefacto de investigación y la model card recomienda SDXL-Turbo para mayor calidad y mejor comprensión de prompts. No se documentan en la información disponible innovaciones adicionales como decodificación especulativa ni mecanismos de atención lineal.

## Capacidades

- Generación de texto a imagen fotorrealista a resolución de 512x512 píxeles, con un único paso de inferencia como configuración preferida.
- Generación en 1 a 4 pasos de muestreo, lo que habilita flujos interactivos y de tiempo real.
- Image-to-image: la model card documenta el uso del pipeline `AutoPipelineForImage2Image`, con la restricción de que `num_inference_steps * strength` debe ser mayor o igual a 1.
- Ausencia de classifier-free guidance: el modelo no utiliza `guidance_scale` ni `negative_prompt`, que se desactivan con `guidance_scale=0.0`.
- Soporte de prompts textuales en el pipeline Diffusers estándar, con el codificador de texto heredado de SD 2.1.
- No soporta renderizado de texto legible dentro de la imagen generada.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No dispone de modo de razonamiento (thinking mode), ni capacidades de audio o vídeo.
- No es un modelo multimodal de entrada: no procesa imágenes como condición semántica de alto nivel más allá del pipeline image-to-image documentado.

## Casos de uso

- Previsualización instantánea en herramientas creativas: con un solo paso de red, el modelo permite que un usuario vea una aproximación de la imagen mientras escribe el prompt, sin esperas perceptibles, y luego refinar el resultado con 2 a 4 pasos o derivar a un modelo mayor.
- Edición iterativa de imágenes (image-to-image): partiendo de un boceto, una captura o un render previo, se puede aplicar una transformación con `strength` bajo y 1 o 2 pasos para obtener variaciones estilizadas manteniendo la estructura de la imagen de entrada.
- Generación por lotes de assets para prototipado de producto o videojuegos: el coste por imagen es mínimo al requerir una sola evaluación de red, lo que hace viable producir cientos de variaciones de un concepto para selección posterior.
- Investigación sobre destilación de modelos generativos: el modelo es explícitamente un artefacto de investigación para estudiar modelos pequeños y destilados, comparando la destilación adversarial (ADD) con alternativas como LCM-LoRA.
- Estudio de sesgos y seguridad en modelos generativos: la model card contempla el despliegue seguro y el sondeo de limitaciones y sesgos como áreas de uso previsto, aprovechando la baja latencia para generar grandes muestras de auditoría.
- Herramientas educativas y de demostración: entornos con hardware modesto pueden ejecutar el modelo para explicar el funcionamiento de la difusión latente y la destilación en tiempo real.
- Aumento de datos sintéticos en pipelines de visión por computador: generación rápida de imágenes etiquetadas por prompt para preentrenamiento o pruebas de robustez, siempre que no se requiera fidelidad factual.
- Interfaz de búsqueda visual o generación asociativa en aplicaciones móviles o de escritorio, donde el presupuesto de cómputo y de batería es limitado y no es viable un modelo de difusión de muchos pasos.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible; se trata de un modelo de generación de imágenes y no de un modelo de lenguaje.

La model card incluye únicamente un estudio de preferencia humana, presentado mediante gráficos (`image_quality_one_step.png` y `prompt_alignment_one_step.png`), que indica que SD-Turbo evaluado a un solo paso es preferido por los votantes humanos en calidad de imagen y seguimiento de prompt frente a LCM-LoRA XL y LCM-LoRA 1.5. No se proporcionan los valores numéricos de dicho estudio en el material disponible.

| Evaluación | Resultado |
|---|---|
| MMLU / HumanEval / GSM8K | No aplica (modelo text-to-image) |
| Preferencia humana en calidad de imagen (1 paso) | Preferido sobre LCM-LoRA XL y LCM-LoRA 1.5; sin cifras publicadas en la información disponible |
| Preferencia humana en seguimiento de prompt (1 paso) | Preferido sobre LCM-LoRA XL y LCM-LoRA 1.5; sin cifras publicadas en la información disponible |
| Comparación con SDXL-Turbo | La model card indica calidad y alineación de prompt inferiores a SDXL-Turbo |

## Requisitos de hardware

- VRAM estimada: el dato exacto no está disponible en la información proporcionada. Con 865.910.724 parámetros en los tensores publicados, una carga en fp16 requiere del orden de 1,7 GB solo para esos pesos, más la memoria del VAE y del codificador de texto y el coste de activaciones durante la inferencia.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, el modelo es apto para GPUs de consumo con 6 GB o más de VRAM en fp16, y las GPUs de datacenter (A100, H100) quedan sobredimensionadas para inferencia individual, siendo útiles solo para servir muchas peticiones en paralelo.
- Cabe en GPU de consumo: sí, conforme al recuento de parámetros y al tamaño del repositorio; no se dispone de requisitos oficiales publicados para confirmar el mínimo exacto.
- Opciones de despliegue: Diffusers (`AutoPipelineForText2Image`, `AutoPipelineForImage2Image`) con PyTorch y Accelerate, tal como documenta la model card; el repositorio `Stability-AI/generative-models` implementa los frameworks de entrenamiento e inferencia de referencia. No se documentan en la información disponible soportes adicionales como vLLM (orientado a modelos de lenguaje), TensorRT o servidores tipo TGI.
- Latencia y throughput: no se publican cifras. Por diseño, el modelo requiere una única evaluación de red en su configuración de un paso, frente a las decenas de pasos de los pipelines de difusión convencionales, lo que implica una reducción de latencia de al menos un orden de magnitud.
- Nota de despliegue: la model card especifica `torch_dtype=torch.float16` y `variant="fp16"`, con `guidance_scale=0.0` y `num_inference_steps=1` como configuración recomendada.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Pasos de muestreo | Contexto de prompt | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SD-Turbo (Jinstudio/sd-turbo, copia de stabilityai/sd-turbo) | 865.910.724 tensores en safetensors (dato del repositorio) | 512x512 (preferida) | 1 a 4 | 77 tokens por prompt (codificador heredado de SD 2.1; no confirmado en este repositorio) | No declarada en este repositorio; remite a la licencia de Stability AI | HuggingFace, Diffusers |
| SDXL-Turbo (stabilityai/sdxl-turbo) | No disponible en la información proporcionada | 1024x1024 (modelo mayor) | 1 a 4 (mismo método ADD) | No disponible | Licencia de Stability AI | HuggingFace, Diffusers |
| LCM-LoRA 1.5 (referencia del estudio de preferencia) | No disponible en la información proporcionada | No disponible | Pocos pasos (LoRA de destilación sobre SD 1.5) | No disponible | No disponible | HuggingFace |
| LCM-LoRA XL (referencia del estudio de preferencia) | No disponible en la información proporcionada | No disponible | Pocos pasos (LoRA de destilación sobre SDXL) | No disponible | No disponible | HuggingFace |

La model card sitúa explícitamente a SDXL-Turbo por encima de SD-Turbo en calidad y comprensión de prompts, y recomienda su uso cuando se busca mayor calidad. Los datos numéricos de parámetros y resolución de los modelos comparados no se incluyen en la información proporcionada más allá de lo indicado en la tabla.

## Limitaciones y advertencias

- Calidad y alineación de prompt inferiores a SDXL-Turbo, según reconoce la propia model card.
- Resolución fija de 512x512 píxeles; no se alcanza fotorrealismo perfecto y el modelo no logra renderizar texto legible.
- Las caras y las personas en general pueden no generarse correctamente.
- La parte de autoencoding del modelo es con pérdida (lossy), lo que introduce degradación en la reconstrucción.
- El modelo no fue entrenado para representar hechos ni personas o eventos reales; su uso para generar ese tipo de contenido queda fuera de su alcance previsto.
- Riesgo de sesgos: la información disponible no detalla la composición del dataset de entrenamiento ni sus sesgos demográficos o culturales, por lo que no pueden cuantificarse aquí.
- No debe usarse de forma que vulnere la Acceptable Use Policy de Stability AI (https://stability.ai/use-policy).
- Licencia: los metadatos de este repositorio no declaran licencia. La model card remite a https://stability.ai/license y, para uso comercial, a https://stability.ai/membership. Verificar la licencia aplicable antes de cualquier despliegue en producción es imprescindible.
- Advertencia sobre la procedencia: Jinstudio/sd-turbo es una reproducción de terceros, con 0 descargas y 0 likes, no verificada, y con fecha de creación en 2026-10-09 según los metadatos. Para uso en producción conviene partir del repositorio oficial `stabilityai/sd-turbo` y comprobar la integridad y el origen de los pesos.
- No se documentan en este repositorio variantes cuantizadas (GGUF, ONNX, 8 bits) ni requisitos de hardware oficiales, lo que complica la planificación de despliegues con restricciones de memoria.
- Al ser un modelo de generación de imágenes y no de lenguaje, no ofrece razonamiento, código, matemáticas ni tool calling; cualquier expectativa en ese sentido es inaplicable.

## Enlaces

- Repositorio analizado: https://huggingface.co/Jinstudio/sd-turbo
- Repositorio oficial del modelo: https://huggingface.co/stabilityai/sd-turbo
- Versión mayor recomendada por el autor: https://huggingface.co/stabilityai/sdxl-turbo/
- Modelo base del que se destila: https://huggingface.co/stabilityai/stable-diffusion-2-1
- Repositorio de código de Stability AI: https://github.com/Stability-AI/generative-models
- Informe técnico de Adversarial Diffusion Distillation: https://stability.ai/research/adversarial-diffusion-distillation
- Demo de SDXL-Turbo en Clipdrop: http://clipdrop.co/stable-diffusion-turbo
- Licencia de Stability AI: https://stability.ai/license
- Membresía para uso comercial: https://stability.ai/membership
- Política de uso aceptable: https://stability.ai/use-policy

Nota sobre la búsqueda web: los resultados obtenidos no guardan relación con el modelo (corresponden a contenidos audiovisuales no vinculados), por lo que no se han incorporado enlaces adicionales de esa búsqueda.
