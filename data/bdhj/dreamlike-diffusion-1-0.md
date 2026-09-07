# Bdhj/dreamlike-diffusion-1.0

## Resumen

Dreamlike Diffusion 1.0 es un modelo de generación de imágenes texto a imagen desarrollado por dreamlike.art. Se trata de un fine-tuning de Stable Diffusion 1.5 sobre arte de alta calidad, con el objetivo de producir resultados estéticamente más artísticos y refinados que el modelo base. Resuelve la necesidad de disponer de un generador con un estilo visual definido sin necesidad de ajustar prompts complejos o entrenar un modelo desde cero.

Su relevancia radica en que ofrece una alternativa estética dentro del ecosistema Stable Diffusion, manteniendo la misma arquitectura y facilidad de uso. El modelo se distribuye con la arquitectura Latent Diffusion Model (compuesta por UNet, VAE y un codificador de texto CLIP), 859.520.964 parámetros y una longitud de contexto de 77 tokens para el prompt de texto. Está disponible en formato safetensors y como checkpoint clásico de CompVis.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Latent Diffusion Model (Stable Diffusion 1.5 fine-tuned) |
| Parametros totales | 859.520.964 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 77 tokens (prompt de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Modified CreativeML OpenRAIL-M |
| Formato de pesos | safetensors y ckpt (checkpoint de CompVis) |

## Arquitectura y entrenamiento

Dreamlike Diffusion 1.0 es un modelo de difusión latente (LDM) basado en Stable Diffusion 1.5. La arquitectura consta de un UNet como denoiser, un VAE para codificar y decodificar imágenes en el espacio latente, y un codificador de texto CLIP para condicionar la generación a partir de un prompt. El modelo ha sido afinado sobre un conjunto de imágenes artísticas de alta calidad, aunque no se dispone de información detallada sobre la composición del dataset ni el número de tokens utilizados durante el entrenamiento.

No se han documentado innovaciones técnicas destacables más allá del fine-tuning artístico. El modelo se usa exactamente igual que Stable Diffusion 1.5, y se recomienda añadir el token `dreamlikeart` al prompt si el estilo artístico resultante es demasiado débil. También se sugiere utilizar relaciones de aspecto no cuadradas y resoluciones ligeramente superiores a 512x512 para obtener mejores resultados.

## Capacidades

- Generación de imágenes a partir de texto con un estilo artístico de alta calidad, gracias al fine-tuning sobre arte.
- Compatibilidad total con los prompts utilizados en Stable Diffusion 1.5.
- Soporte de relaciones de aspecto no cuadradas (2:3, 9:16, 3:2, 16:9) y resoluciones como 640x640, 512x768 o 768x512.
- Refuerzo del estilo mediante la palabra clave `dreamlikeart` en el prompt.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No soporta entrada de imagen, audio ni otras modalidades; es exclusivamente texto a imagen.
- Idioma principal de los prompts: inglés.

## Casos de uso

- Generación de arte conceptual para juegos y cine: el modelo permite crear ilustraciones de alta calidad para previsualizar escenarios, personajes o atmósferas. Se usa con prompts descriptivos y la palabra clave `dreamlikeart` para intensificar el estilo artístico.
- Ilustración para proyectos no comerciales: blogs, redes sociales o presentaciones pueden beneficiarse de imágenes con acabado artístico sin necesidad de ajustes adicionales, siempre que el uso no genere ingresos.
- Diseño de personajes: se pueden generar conceptos de personajes detallando peinado, ropa, expresión y pose. El fine-tuning artístico produce resultados más estilizados que el modelo base.
- Prototipado de escenarios para entornos virtuales: permite generar fondos o texturas conceptuales que luego pueden refinarse o integrarse en flujos de trabajo de arte digital.
- Investigación en modelos de difusión: sirve como referencia para estudiar el efecto del fine-tuning artístico sobre Stable Diffusion 1.5 en tareas de generación estilizada, comparando resultados con el modelo base.
- Generación de material educativo o divulgativo no comercial: ilustraciones para explicar conceptos visuales en cursos, tutoriales o artículos, siempre que no haya fines lucrativos.
- Arte generativo para proyectos personales: exploración creativa de variaciones de estilo mediante el uso de semillas y prompts, sin restricciones comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: basado en la arquitectura Stable Diffusion 1.5, se estima un consumo de aproximadamente 4 GB en fp16 para generar imágenes de 512x512. Se recomienda 8 GB de VRAM para mayor margen.
- GPU recomendadas: tarjetas de consumo como RTX 3060 12GB, RTX 4070 o superiores. No se requiere GPU de centro de datos para uso básico.
- Compatibilidad con GPU de consumo: sí, el modelo puede ejecutarse en GPUs de consumo con 8 GB de VRAM o más.
- Opciones de despliegue: Diffusers (StableDiffusionPipeline), CompVis (checkpoint .ckpt), Gradio Web UI, Automatic1111 y ComfyUI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa exhaustiva con alternativas de la misma categoría. Como referencia, el modelo es un fine-tuning de Stable Diffusion 1.5, por lo que comparte arquitectura y parámetros con la base.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Dreamlike Diffusion 1.0 | 859.520.964 | 77 tokens | Modified CreativeML OpenRAIL-M | HuggingFace |
| Stable Diffusion 1.5 | ~860M | 77 tokens | CreativeML OpenRAIL-M | HuggingFace |

## Limitaciones y advertencias

- Licencia modificada: está prohibido alojar o utilizar el modelo o sus derivados en sitios web, aplicaciones o servicios que generen ingresos o donaciones. Para uso comercial en equipos de más de 10 personas, es necesario contactar con dreamlike.art.
- Los resultados generados pueden utilizarse comercialmente solo en equipos de 10 personas o menos.
- Sesgos no documentados: al ser un derivado de Stable Diffusion 1.5, puede heredar sesgos presentes en el dataset de entrenamiento original (LAION).
- Riesgo de alucinación visual: el modelo puede producir contenido no deseado, incoherente o que no se corresponda con el prompt.
- Contexto de texto limitado a 77 tokens: los prompts muy largos se truncarán, perdiendo información.
- Soporte exclusivo de inglés en los prompts.
- No soporta entrada de imagen ni otras modalidades; es únicamente texto a imagen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dreamlike-art/dreamlike-diffusion-1.0
- Espejo en HuggingFace: https://huggingface.co/Bdhj/dreamlike-diffusion-1.0
- Licencia: https://huggingface.co/dreamlike-art/dreamlike-diffusion-1.0/blob/main/LICENSE.md
- Dreamlike Photoreal 2.0: https://huggingface.co/dreamlike-art/dreamlike-photoreal-2.0
- Gradio Space: https://huggingface.co/spaces/akhaliq/dreamlike-diffusion-1.0
- Documentación de Stable Diffusion Pipeline: https://huggingface.co/docs/diffusers/api/pipelines/stable_diffusion
