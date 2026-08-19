# Diamond1400/qwen-image-edit-plus-nsfw-lora

## Resumen

El modelo `Diamond1400/qwen-image-edit-plus-nsfw-lora` es un adaptador LoRA (Low-Rank Adaptation) diseñado para el modelo de difusión Qwen-Image-Edit-2511, desarrollado por Qwen. Este adaptador, creado por el usuario Diamond1400, amplía las capacidades del modelo base para permitir la generación y edición de imágenes con contenido explícito (NSFW), algo que el modelo original no soporta de forma nativa. Se presenta como una solución para quienes necesitan herramientas de edición de imágenes con control fino sobre anatomía y escenas explícitas, un ámbito habitualmente restringido en los modelos de difusión comerciales.

El adaptador se integra en el pipeline de `diffusers` mediante `QwenImageEditPlusPipeline` y se distribuye como un archivo `safetensors` de aproximadamente 563 MB. El modelo base Qwen-Image-Edit-2511, sobre el que se aplica el LoRA, es un transformer multimodal de difusión (MMDiT) con 20 000 millones de parámetros, según información del artículo de Civitai. Aunque el LoRA en sí tiene un número reducido de parámetros entrenables (típicamente entre 10 y 20 millones en configuraciones de rango 128), su efecto es significativo al modificar el comportamiento del modelo base para tareas específicas. La relevancia de este adaptador radica en que democratiza el acceso a la edición de imágenes NSFW de alta calidad, un nicho que suele estar cubierto por soluciones propietarias o con restricciones de uso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | QwenImageTransformer2DModel (MMDiT) con adaptador LoRA |
| Parametros totales | No disponible (el modelo base tiene 20 000 millones; el LoRA añade un número reducido de parámetros entrenables, no especificado) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de difusión para imágenes) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en bfloat16, pero no se especifican cuantizaciones alternativas) |
| Idiomas soportados | No disponibles (el modelo base soporta inglés y chino, pero no se indica para este adaptador) |
| Licencia | OpenRAIL++ |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura MMDiT (Multimodal Diffusion Transformer) del modelo Qwen-Image-Edit-2511, que procesa simultáneamente texto e imagen para tareas de edición. El LoRA se aplica a las capas de atención del transformer, modificando los pesos de forma eficiente sin necesidad de reentrenar el modelo completo. No se han publicado detalles específicos sobre el dataset de entrenamiento, el número de pasos o la configuración exacta del LoRA (rango, alpha, etc.). Sin embargo, el artículo de Civitai sobre LoRA NSFW para Qwen-Image indica que para obtener resultados de calidad en anatomía se requieren al menos 1500 imágenes cuidadosamente seleccionadas y un rango mínimo de 128, lo que sugiere que este adaptador podría seguir una metodología similar, aunque no se confirma.

El entrenamiento se realizó sobre el modelo base Qwen-Image-Edit-2511, que ya posee capacidades avanzadas de edición de imágenes mediante instrucciones en lenguaje natural. El LoRA añade un conjunto de "trigger words" (palabras desencadenantes) que activan conceptos específicos relacionados con contenido explícito, como `nsfw`, `nipples`, `vagina`, `penis`, `missionary`, `blowjob`, entre otros. Estas palabras se incorporan en el prompt para dirigir la generación hacia escenas o atributos concretos.

## Capacidades

- Generación y edición de imágenes con contenido explícito (NSFW), incluyendo desnudos, actos sexuales y anatomía detallada.
- Control fino sobre conceptos específicos mediante trigger words documentadas en la model card.
- Integración con el pipeline `QwenImageEditPlusPipeline` de `diffusers`, lo que permite edición de imágenes existentes (image-to-image) y generación a partir de texto.
- Hereda las capacidades del modelo base Qwen-Image-Edit-2511, como la comprensión de instrucciones complejas en lenguaje natural y la edición de múltiples objetos o escenas.
- Soporte para ajuste de parámetros de inferencia como `true_cfg_scale` y `negative_prompt`, lo que permite controlar la adherencia al prompt y la calidad de la imagen.
- Compatibilidad con el espacio de Hugging Face "ScottzillaSystems Image Editor", que ofrece una interfaz gráfica para cargar el adaptador y usarlo sin código.
- Capacidad de combinación con otros adaptadores LoRA (según la arquitectura de `diffusers`), aunque no se documenta explícitamente.

## Casos de uso

- Creación de arte erótico personalizado: artistas digitales pueden usar el adaptador para generar ilustraciones explícitas con control sobre poses, anatomía y escenarios, integrando el LoRA en su flujo de trabajo con `diffusers`.
- Edición de imágenes existentes para contenido adulto: el modelo permite modificar fotografías o ilustraciones añadiendo elementos NSFW, como desnudos o actos sexuales, mediante instrucciones de texto.
- Prototipado de contenido para plataformas de entretenimiento adulto: empresas o creadores pueden generar imágenes de prueba para validar conceptos antes de producir contenido final, reduciendo costes de producción.
- Personalización de personajes en juegos o cómics: el adaptador puede usarse para crear variantes explícitas de personajes existentes, manteniendo la coherencia visual gracias a la edición basada en instrucciones.
- Investigación en generación de imágenes con contenido sensible: académicos o desarrolladores pueden estudiar el comportamiento de los modelos de difusión cuando se les añade un LoRA NSFW, analizando sesgos, calidad y limitaciones.
- Generación de contenido para comunidades específicas: foros o redes sociales con temática adulta pueden emplear el adaptador para producir imágenes que cumplan con las normas de la comunidad, siempre que se respete la licencia y las restricciones de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como FID, CLIP score o evaluaciones humanas para este adaptador. El artículo de Civitai menciona que Qwen-Image (20B) tiene dificultades con la generación NSFW sin fine-tuning, y que un LoRA bien entrenado mejora la anatomía, pero no proporciona cifras concretas. Por tanto, no es posible comparar cuantitativamente este modelo con alternativas.

## Requisitos de hardware

- El adaptador LoRA en sí es ligero (~563 MB), pero requiere cargar el modelo base Qwen-Image-Edit-2511, que tiene 20 000 millones de parámetros. En bfloat16, el modelo base ocupa aproximadamente 40 GB de VRAM, por lo que se necesita una GPU con al menos 48 GB (por ejemplo, A6000, A100 80GB, H100) para inferencia sin cuantización.
- Con cuantización (por ejemplo, 8 bits o 4 bits) se podría reducir el requisito a 24 GB o 16 GB, respectivamente, pero no se especifican configuraciones oficiales para este adaptador.
- En GPUs de consumo como la RTX 4090 (24 GB VRAM) sería posible ejecutar el modelo con cuantización, aunque con posibles pérdidas de calidad. La RTX 3090 (24 GB) también podría ser viable.
- Opciones de despliegue: el adaptador se integra con `diffusers`, por lo que puede usarse con `vLLM` (aunque no es el caso típico para difusión), `Ollama` no es aplicable (es para LLMs), y `llama.cpp` tampoco. Las opciones recomendadas son `diffusers` con PyTorch, o el espacio de Hugging Face "ScottzillaSystems Image Editor" que ya lo tiene preconfigurado.
- La latencia dependerá del hardware y del número de pasos de inferencia (el ejemplo usa 40 pasos). En una A100, cada imagen podría tardar entre 5 y 15 segundos, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros adaptadores LoRA NSFW para Qwen-Image-Edit. Existen alternativas en Hugging Face, como `aiunivers/qwen-image-edit-plus-nsfw-lora` (que parece ser una copia o variante) y la versión v2 del mismo autor (`ScottzillaSystems/qwen-image-edit-plus-nsfw-lora2`), pero no se proporcionan métricas comparativas. En el ámbito de modelos de difusión con soporte NSFW, se podrían mencionar adaptadores para Flux.1 o SDXL, pero no hay datos objetivos para comparar. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Contenido explícito: el modelo está diseñado para generar material NSFW, lo que puede ser inapropiado para menores o entornos laborales. Debe usarse con responsabilidad y cumpliendo las leyes locales.
- Sesgos y alucinaciones: al ser un adaptador sobre un modelo base, puede heredar sesgos del entrenamiento original y producir imágenes con deformidades anatómicas o incoherencias, especialmente en escenas complejas.
- Riesgo de mal uso: la generación de contenido explícito no consentido (por ejemplo, deepfakes) es un riesgo ético y legal. La licencia OpenRAIL++ incluye restricciones de uso que prohíben aplicaciones ilegales o dañinas.
- Limitaciones de idioma: aunque el modelo base soporta inglés y chino, no se especifica si el adaptador funciona correctamente en otros idiomas. Los trigger words están en inglés.
- Dependencia del modelo base: el adaptador solo funciona con Qwen-Image-Edit-2511; no es compatible con otras versiones o arquitecturas.
- Sin soporte oficial: el autor no proporciona documentación técnica detallada ni garantías de rendimiento. El número de descargas es 0, lo que sugiere que no ha sido probado ampliamente por la comunidad.
- Restricciones de la licencia: OpenRAIL++ impone condiciones de uso responsable, incluyendo la prohibición de generar contenido ilegal o difamatorio, y exige atribución al autor original.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Diamond1400/qwen-image-edit-plus-nsfw-lora)
- [Modelo base Qwen-Image-Edit-2511](https://huggingface.co/Qwen/Qwen-Image-Edit-2511)
- [Espacio ScottzillaSystems Image Editor](https://huggingface.co/spaces/ScottzillaSystems/Qwen-Image-Edit-2511-LoRAs-Fast)
- [Versión v2 del adaptador](https://huggingface.co/ScottzillaSystems/qwen-image-edit-plus-nsfw-lora2)
- [Artículo de Civitai sobre LoRA NSFW para Qwen-Image](https://civitai.com/articles/18798/qwen-image-nsfw-lora-notes)
- [Repositorio GitHub de Qwen-Image](https://github.com/QwenLM/Qwen-Image)
- [Sitio web de tutoriales Qwen AI Image Editor](https://www.qwenaiimageeditor.com/)
