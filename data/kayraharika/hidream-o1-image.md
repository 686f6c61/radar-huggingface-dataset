# kayraharika/HiDream-O1-Image

## Resumen

HiDream-O1-Image es un modelo de generación de imágenes unificado, desarrollado por el equipo de HiDream-ai. Está construido sobre un Transformer unificado a nivel de píxel (UiT), lo que significa que no depende de un VAE externo ni de codificadores de texto separados: codifica píxeles, texto y condiciones específicas de la tarea en un único espacio de tokens compartido. Esto le permite abordar tareas como text-to-image, edición por instrucciones, personalización por sujeto y generación de storyboards, con una resolución nativa de hasta 2048 × 2048.

El modelo tiene 8.804.887.792 parámetros (aproximadamente 8.8B), está licenciado bajo MIT y se distribuye en formato safetensors. Según la documentación del autor, un checkpoint de 8B alcanza un rendimiento comparable o superior al de modelos de difusión más grandes y a algunos modelos propietarios cerrados. La variante Dev-2604 se sitúa en el puesto #8 en la Artificial Analysis Text to Image Arena, lo que lo convierte en un referente entre los modelos abiertos de generación de imágenes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pixel-level Unified Transformer (UiT), sin VAE ni codificador de texto externo |
| Parámetros totales | 8.804.887.792 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no se especifica; el modelo opera sobre tokens de píxeles y texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (la documentación menciona renderizado de texto multilingüe, pero no lista idiomas concretos) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

HiDream-O1-Image utiliza un Transformer unificado a nivel de píxel (UiT) que procesa directamente píxeles en bruto, texto y condiciones de tarea en una única secuencia de tokens. Al no usar VAE ni codificadores de texto separados, elimina cuellos de botella típicos de los modelos de difusión y permite una integración más directa entre la comprensión del lenguaje y la síntesis de imagen. El modelo incorpora un "Reasoning-Driven Prompt Agent" integrado, un agente de razonamiento que resuelve conocimiento implícito, layout y renderizado de texto antes de la generación.

No se han proporcionado detalles sobre el dataset de entrenamiento, el número de tokens ni si se aplicaron técnicas como RLHF o DPO. La documentación indica que existen variantes destiladas (Dev) con 28 pasos de inferencia, y una versión Dev-2604 optimizada para text-to-image, junto con un Prompt Agent basado en google/gemma-4-31B-it. También se advierte que PyTorch 2.9.x no es recomendado debido a un problema conocido.

## Capacidades

- Generación de imágenes text-to-image de alta resolución, hasta 2048 × 2048, con detalle fino.
- Edición de imágenes por instrucciones, permitiendo modificar escenas, objetos o estilos mediante comandos en lenguaje natural.
- Personalización por sujeto (subject-driven personalization), preservando la identidad o propiedad intelectual de un personaje o producto en nuevas escenas.
- Renderizado de texto largo: soporta texto multi-región, multilingüe y con control de layout, útil para carteles, infografías y contenido publicitario.
- Generación de storyboards, creando secuencias coherentes de imágenes a partir de descripciones narrativas.
- Razonamiento previo a la generación mediante el Prompt Agent, que resuelve ambigüedades de layout, conocimiento implícito y texto antes de sintetizar la imagen.
- No soporta tool calling ni agentes de texto; es un modelo puramente de generación de imágenes.

## Casos de uso

- Creación de contenido publicitario: el modelo puede generar anuncios con texto integrado y control de layout, lo que permite producir piezas finales para campañas sin necesidad de composición manual posterior.
- Edición de imágenes en estudios de diseño: mediante instrucciones en lenguaje natural, los diseñadores pueden modificar fondos, añadir objetos o cambiar estilos, acelerando iteraciones en flujos de trabajo creativos.
- Personalización de personajes para videojuegos: la personalización por sujeto permite mantener la identidad visual de un personaje a lo largo de distintas escenas, útil para generar concept art y materiales de marketing.
- Generación de storyboards para cine o animación: a partir de descripciones de escenas, el modelo produce secuencias visuales coherentes que sirven como guion gráfico preliminar.
- Diseño de cartelería multilingüe: el soporte de texto largo y multi-región permite generar carteles con titulares en varios idiomas, controlando la posición y el tamaño del texto.
- Prototipado de producto: se pueden generar imágenes de concepto de producto a partir de descripciones y referencias, facilitando la validación de ideas antes del desarrollo físico.
- Automatización de contenido para e-commerce: el modelo puede crear variaciones de imágenes de producto con diferentes fondos, contextos o composiciones, a partir de una única imagen de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye tablas de evaluación (GenEval, alineación de prompts densos, preferencia humana, texto visual complejo y renderizado de texto largo), pero los datos proporcionados están incompletos y no incluyen los resultados específicos del modelo HiDream-O1-Image. Por tanto, no es posible presentar cifras fiables de rendimiento. La documentación afirma que la variante Dev-2604 ocupa el puesto #8 en la Artificial Analysis Text to Image Arena, pero no se dispone de los detalles de esa evaluación.

## Requisitos de hardware

- VRAM estimada: el tamaño del repositorio es de 35.2 GB, lo que sugiere pesos en FP16 o BF16. Para cargar los pesos se necesitarían aproximadamente 17.6 GB de VRAM, más el overhead de activaciones y la resolución de salida (2048 × 2048), por lo que se recomienda al menos 24 GB de VRAM.
- GPU recomendadas: NVIDIA A100, H100 o RTX 4090 (24 GB) para inferencia completa. Para resoluciones altas o lotes grandes, se necesitará más memoria.
- Despliegue: al ser un modelo de transformers con safetensors, puede cargarse con la librería transformers de Hugging Face. No se indica soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Licencia | Tareas principales |
|---|---|---|---|---|
| HiDream-O1-Image | 8.8B | Pixel-level Unified Transformer (UiT) | MIT | Text-to-image, edición, personalización, storyboard |
| PixArt | 4.3B + 0.6B | Diffusion Transformer (DiT) | no disponible | Text-to-image |
| Show-o | 1.3B | Autoregressive | no disponible | Text-to-image, edición |

No se dispone de resultados de benchmarks comparativos completos para estos modelos en la información proporcionada. HiDream-O1-Image destaca por su arquitectura unificada sin VAE, su licencia MIT y su soporte de múltiples tareas en un solo checkpoint.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado en la información disponible.
- Riesgo de alucinación visual: en la generación de texto dentro de imágenes, puede producir palabras incorrectas o distorsionadas, especialmente en textos largos o complejos.
- Limitaciones de contexto: no aplica en el sentido de modelos de lenguaje, pero el renderizado de texto muy extenso puede degradarse en calidad.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero exige mantener el aviso de copyright y la licencia en las redistribuciones.
- Caveat técnico: PyTorch 2.9.x no es recomendado por un problema conocido, según la documentación del autor.
- El repositorio de Hugging Face consultado (kayraharika/HiDream-O1-Image) parece ser una copia o re-subida del modelo original. Se recomienda verificar la procedencia y autenticidad antes de usarlo en producción.

## Enlaces

- Repositorio en Hugging Face (kayraharika): https://huggingface.co/kayraharika/HiDream-O1-Image
- Repositorio original en Hugging Face: https://huggingface.co/HiDream-ai/HiDream-O1-Image
- GitHub del proyecto: https://github.com/HiDream-ai/HiDream-O1-Image
- Informe técnico (arXiv): https://arxiv.org/pdf/2605.11061v1
- Página web oficial: https://hidream.ai/
- Variante Dev: https://huggingface.co/HiDream-ai/HiDream-O1-Image-Dev
- Prompt Refine: https://huggingface.co/HiDream-ai/Prompt-Refine
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/HiDream-ai/HiDream-O1-Image
