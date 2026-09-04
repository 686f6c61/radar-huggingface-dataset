# Qwen/Qwen-Image-2512

## Resumen

Qwen-Image-2512 es un modelo de difusión de texto a imagen desarrollado por Qwen, lanzado en diciembre de 2025 como actualización del modelo base Qwen-Image de agosto de 2025. El modelo genera imágenes fotorrealistas a partir de descripciones textuales y está disponible bajo licencia Apache 2.0, con soporte para inglés y chino. Se integra en la librería `diffusers` y se puede utilizar tanto en local como a través de Qwen Chat o Azure AI Foundry.

La principal novedad de esta versión es la mejora sustancial del realismo humano, reduciendo el aspecto característico de las imágenes generadas por IA y aportando mayor detalle en rostros, piel y cabello. También se ha mejorado el renderizado de elementos naturales como paisajes y pelaje animal, así como la precisión en la composición de texto dentro de la imagen. Con 20.430.401.088 parámetros, es uno de los modelos open-source más grandes de su categoría, y el autor afirma que, tras más de 10.000 rondas de evaluación ciega en AI Arena, se posiciona como el modelo de código abierto más potente de texto a imagen, compitiendo incluso con modelos cerrados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión text-to-image (arquitectura interna no especificada en la información disponible) |
| Parametros totales | 20.430.401.088 (~20,4 mil millones) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No aplicable (modelo de imagen) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen-Image-2512 es un modelo de difusión de texto a imagen, implementado mediante el pipeline `QwenImagePipeline` de la librería `diffusers`. La información disponible no detalla la arquitectura interna del backbone ni la composición de los datos de entrenamiento. El autor únicamente indica que se trata de una actualización del modelo Qwen-Image de agosto de 2025, con mejoras centradas en el realismo humano, el detalle natural y el renderizado de texto. No se mencionan técnicas como RLHF o DPO, ni innovaciones específicas de arquitectura. El repositorio incluye el código de ejemplo para cargar el pipeline con `torch.bfloat16` en GPU o `torch.float32` en CPU.

## Capacidades

- Generación de imágenes a partir de prompts textuales en inglés y chino.
- Realismo humano mejorado: reduce el aspecto de imagen generada por IA y aporta mayor detalle en rostros, piel y cabello.
- Renderizado más fino de paisajes, pelaje animal y otros elementos naturales.
- Mayor precisión en el renderizado de texto dentro de la imagen, con composiciones multimodales (texto + imagen) más fieles.
- Soporte para múltiples relaciones de aspecto: 1:1, 16:9, 9:16, 4:3, 3:4, 3:2 y 2:3.
- Integración con la librería `diffusers` y con Qwen Chat para edición de imágenes.
- Disponible en Hugging Face, ModelScope y Azure AI Foundry.

## Casos de uso

- Generación de retratos fotorrealistas para campañas de marketing: se puede describir a una persona con un prompt detallado en inglés o chino y obtener una imagen con aspecto natural, adecuada para publicidad o redes sociales.
- Ilustración de personajes para juegos o cómics: el modelo permite generar personajes con vestimenta, entorno y expresión detallados, útiles para concept art.
- Diseño de carteles y material gráfico con texto integrado: gracias a la mejora en renderizado de texto, se pueden generar composiciones con titulares legibles, reduciendo el trabajo posterior de edición.
- Creación de contenido para redes sociales: soporta diferentes relaciones de aspecto, lo que facilita generar imágenes adaptadas a formatos como historias, publicaciones cuadradas o banners.
- Prototipado de conceptos de producto: describir un objeto y obtener un render detallado que sirva como referencia para diseño industrial o presentaciones.
- Edición de imágenes en entornos creativos: mediante Qwen Chat se puede utilizar la funcionalidad de edición de imagen para modificar imágenes existentes manteniendo coherencia visual.
- Generación de fondos para videojuegos o cine: el modelo produce paisajes y escenas con alto nivel de detalle, útiles para preproducción visual.
- Investigación en generación de imágenes: al ser open-source y de gran tamaño, puede servir como modelo base para fine-tuning en tareas específicas.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. El autor indica que el modelo superó más de 10.000 rondas de evaluación ciega en AI Arena, posicionándose como el modelo open-source más fuerte de texto a imagen, pero no se proporcionan métricas concretas (MMLU, HumanEval, etc.) ni comparativas cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 40,8 GB solo para los pesos en bfloat16 (20.430.401.088 parámetros × 2 bytes), más memoria adicional para activaciones y overhead del pipeline.
- GPU recomendadas: no se especifican oficialmente; se requiere una GPU con al menos 40 GB de VRAM, como A100 80GB o H100 80GB. También es viable el uso de varias GPUs.
- ¿Cabe en consumer GPU? No, una RTX 4090 con 24 GB no es suficiente para cargar el modelo en bfloat16.
- Opciones de despliegue: `diffusers` (pipeline oficial), Azure AI Foundry y Qwen Chat. No se mencionan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de especificaciones de modelos comparables en la información proporcionada. La única comparación documentada es con la versión anterior, Qwen-Image (agosto de 2025), que el autor describe como inferior en realismo humano, detalle natural y renderizado de texto. No se proporcionan métricas cuantitativas de esta comparación.

| Aspecto | Qwen-Image-2512 (diciembre 2025) | Qwen-Image (agosto 2025) |
|---|---|---|
| Realismo humano | Mejorado, reduce el aspecto de IA | Inferior según el autor |
| Detalle natural | Mayor detalle en paisajes y pelaje | Inferior según el autor |
| Renderizado de texto | Mayor precisión y calidad | Inferior según el autor |
| Parámetros | 20.430.401.088 | No disponible |
| Licencia | Apache 2.0 | No disponible |

## Limitaciones y advertencias

- Riesgo de alucinación visual: como en otros modelos de difusión, puede generar artefactos o detalles incorrectos. El propio autor recomienda un prompt negativo que incluye "deformidades de extremidades, dedos deformados" y "aspecto de IA", lo que sugiere que estos problemas pueden aparecer.
- Sesgos: no se han documentado sesgos específicos en la información disponible. Al ser un modelo entrenado con datos de internet, puede reflejar sesgos presentes en esos datos, especialmente en la representación de personas.
- Limitaciones de idioma: solo se soportan prompts en inglés y chino. El uso de otros idiomas puede producir resultados deficientes.
- Licencia Apache 2.0: permite uso comercial, pero requiere atribución y no incluye garantías.
- Dependencia de hardware: requiere una GPU con gran cantidad de memoria, lo que limita su uso en entornos de consumo.
- Sin información sobre seguridad, filtros de contenido o evaluaciones de alineación.

## Enlaces

- Hugging Face: https://huggingface.co/Qwen/Qwen-Image-2512
- ModelScope: https://modelscope.cn/models/Qwen/Qwen-Image-2512
- Tech Report: https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen-Image/Qwen_Image.pdf
- Blog oficial: https://qwen.ai/blog?id=qwen-image-2512
- Demo en Hugging Face: https://huggingface.co/spaces/Qwen/Qwen-Image-2512
- GitHub: https://github.com/QwenLM/Qwen-Image
- Discord: https://discord.gg/CV4E9rpNSD
- Qwen Chat: https://chat.qwen.ai/
- Azure AI Foundry: https://ai.azure.com/catalog/models/qwen--qwen-image-2512
