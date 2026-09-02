# Plana-Chan/qwen-image-edit-plus-nsfw-lora

## Resumen

El modelo `Plana-Chan/qwen-image-edit-plus-nsfw-lora` es un adaptador LoRA (Low-Rank Adaptation) diseñado para el modelo base `Qwen/Qwen-Image-Edit-2511`, un pipeline de edición de imágenes basado en difusión. Desarrollado por Plana-Chan, este adaptador amplía las capacidades del modelo base para permitir la generación y edición de contenido NSFW (not safe for work), un área en la que el modelo original presenta limitaciones. El LoRA se distribuye como un archivo safetensors de aproximadamente 563 MB y se integra mediante la librería `diffusers`, lo que facilita su uso en flujos de trabajo existentes.

La relevancia de este adaptador radica en que el modelo base Qwen-Image-Edit-2511, al igual que otros modelos de difusión de gran tamaño, no está optimizado para contenido explícito. Este LoRA añade una capa de ajuste fino que permite a los usuarios generar o editar imágenes con contenido adulto mediante prompts de texto, utilizando palabras clave específicas (trigger words) como `nsfw`, `nipples`, `vagina`, entre otras. Aunque el modelo base es un MMDiT (Multi-Modal Diffusion Transformer) con una arquitectura compleja, el adaptador LoRA solo modifica una fracción de los pesos, lo que lo hace ligero y fácil de desplegar sobre el modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre QwenImageTransformer2DModel (MMDiT) |
| Parametros totales | no disponible (tamaño del archivo: ~563 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | OpenRAIL++ |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se basa en el modelo `Qwen/Qwen-Image-Edit-2511`, que emplea una arquitectura de difusión MMDiT (Multi-Modal Diffusion Transformer) para procesar tanto texto como imágenes. El LoRA ajusta los pesos del transformer para habilitar la generación de contenido NSFW, un dominio que el modelo base no cubre de forma nativa. No se dispone de información pública sobre el conjunto de datos de entrenamiento, el número de imágenes utilizadas, el rango del LoRA ni el proceso de ajuste (por ejemplo, si se empleó RLHF o DPO). La model card solo indica que se trata de un adaptador multi-concepto (MCNL v1) y proporciona instrucciones de uso con `diffusers`.

Según un artículo de Civitai sobre LoRA NSFW para Qwen-Image, se recomienda un mínimo de 1500 imágenes de alta calidad y un rank de 128 para obtener resultados aceptables, pero no se confirma que este adaptador haya seguido esas pautas. Por tanto, los detalles específicos del entrenamiento permanecen no disponibles.

## Capacidades

- Edición de imágenes mediante prompts de texto (image-to-image), utilizando el pipeline `QwenImageEditPlusPipeline` de `diffusers`.
- Generación de contenido NSFW, incluyendo desnudos y actos sexuales, a través de trigger words específicas como `nsfw`, `nipples`, `vagina`, `penis`, `missionary`, `cowgirlout`, `blowjob`, `cum_on_face`, `creamp1e` y `l1ck`.
- Soporte multi-concepto (MCNL), lo que permite combinar varias de estas palabras clave en un solo prompt para escenas más complejas.
- Integración sencilla con el Space de Hugging Face `ScottzillaSystems/Qwen-Image-Edit-2511-LoRAs-Fast`, que ofrece una interfaz gráfica para seleccionar el adaptador.
- Compatibilidad con el flujo de trabajo estándar de `diffusers`, incluyendo la carga de pesos LoRA mediante `load_lora_weights` y `set_adapters`.
- No se documentan capacidades adicionales como tool calling, agentes o razonamiento multi-paso, ya que el modelo se centra exclusivamente en la edición de imágenes.

## Casos de uso

- Edición de imágenes artísticas para contenido adulto: el adaptador permite transformar ilustraciones o fotografías existentes añadiendo elementos NSFW mediante prompts descriptivos, útil para artistas que trabajan en el género erótico.
- Generación de ilustraciones personalizadas para novelas visuales o juegos para adultos: los desarrolladores pueden usar el LoRA para crear escenas específicas con personajes y situaciones definidas por texto.
- Modificación de fotografías para proyectos de fotografía artística con contenido explícito: el modelo puede ajustar imágenes reales para añadir o modificar elementos NSFW, siempre que se respeten las leyes de consentimiento y uso.
- Creación de contenido para plataformas de suscripción o venta de arte digital: los creadores pueden generar series de imágenes NSFW de forma rápida y consistente, manteniendo un estilo coherente gracias al modelo base.
- Investigación académica sobre generación de imágenes con contenido explícito: el adaptador sirve como herramienta para estudiar los límites y sesgos de los modelos de difusión en dominios sensibles.
- Prototipado de aplicaciones de edición de imágenes para adultos: los desarrolladores pueden integrar el LoRA en pipelines de `diffusers` para ofrecer funcionalidades de edición NSFW en sus propias aplicaciones, siempre que cumplan con la licencia OpenRAIL++.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre métricas de calidad de imagen (como FID o CLIP score), ni comparaciones cuantitativas con otros adaptadores NSFW. El rendimiento en términos de velocidad o uso de memoria depende del modelo base y del hardware utilizado, pero no se proporcionan cifras concretas.

## Requisitos de hardware

- No se especifican requisitos de VRAM para el adaptador en la documentación. Dado que el LoRA se carga sobre el modelo base `Qwen-Image-Edit-2511`, los requisitos de hardware son los de dicho modelo, que no se detallan en la información disponible.
- El modelo base es un transformer de difusión de gran tamaño (probablemente en el rango de 20 mil millones de parámetros, según referencias indirectas en artículos sobre Qwen-Image), por lo que se recomienda una GPU con al menos 16 GB de VRAM para inferencia en `bfloat16`. Sin embargo, esta cifra es una estimación y no está confirmada.
- El adaptador en sí es ligero (~563 MB) y no añade una carga significativa de memoria, pero requiere que el modelo base esté cargado en memoria.
- Opciones de despliegue: se puede usar con `diffusers` en Python, o a través del Space de Hugging Face `ScottzillaSystems/Qwen-Image-Edit-2511-LoRAs-Fast` para una interfaz gráfica. No se mencionan integraciones con vLLM, llama.cpp u otros motores de inferencia.
- La latencia y el throughput dependen del hardware y del número de pasos de inferencia (el ejemplo usa 40 pasos), pero no se proporcionan datos específicos.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros adaptadores LoRA NSFW para Qwen-Image. Existen alternativas como `qwen-image-edit-plus-lora` (de Replicate) o `Qwen-Image-NSFW` (de StarsFriday), pero no se han publicado especificaciones detalladas ni resultados de benchmarks en las fuentes consultadas. El propio autor ofrece una versión actualizada, `ScottzillaSystems/qwen-image-edit-plus-nsfw-lora2` (MCNL v2), que podría presentar mejoras, pero no se documentan diferencias concretas. Por tanto, la comparativa se limita a indicar la existencia de estas alternativas sin datos verificables.

## Limitaciones y advertencias

- Contenido explícito: el adaptador está diseñado exclusivamente para generar y editar contenido NSFW, lo que lo hace inapropiado para menores y para entornos profesionales no relacionados con este ámbito.
- Sesgos potenciales: al ser un ajuste fino sobre un modelo base, puede heredar sesgos de género, raza o representación corporal presentes en los datos de entrenamiento, lo que podría generar resultados estereotipados o no deseados.
- Riesgo de alucinación: en la edición de imágenes, el modelo puede introducir elementos no solicitados o distorsionar la imagen original, especialmente con prompts ambiguos o complejos.
- Restricciones de licencia: la licencia OpenRAIL++ permite uso comercial, pero impone restricciones de uso responsable, como no generar contenido ilegal o dañino. Los usuarios deben revisar los términos completos antes de su implementación.
- Dependencia del modelo base: el rendimiento y la calidad dependen en gran medida de `Qwen-Image-Edit-2511`, que puede tener limitaciones propias en cuanto a resolución, fidelidad de edición o soporte de idiomas.
- Sin soporte técnico: al ser un modelo de la comunidad con cero descargas y cero likes, no hay garantía de mantenimiento o actualizaciones, y la documentación es mínima.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Plana-Chan/qwen-image-edit-plus-nsfw-lora)
- [Modelo base Qwen-Image-Edit-2511](https://huggingface.co/Qwen/Qwen-Image-Edit-2511)
- [Space de ScottzillaSystems para edición de imágenes](https://huggingface.co/spaces/ScottzillaSystems/Qwen-Image-Edit-2511-LoRAs-Fast)
- [Versión actualizada MCNL v2](https://huggingface.co/ScottzillaSystems/qwen-image-edit-plus-nsfw-lora2)
- [Artículo de Civitai sobre LoRA NSFW para Qwen-Image](https://civitai.com/articles/18798/qwen-image-nsfw-lora-notes)
- [Comparativa en aimodels.fyi](https://www.aimodels.fyi/models/compare/qwen-image-edit-plus-lora-qwen-vs-qwen-image-nsfw-starsfriday)
- [Sitio web de Qwen AI Image Editor](https://www.qwenaiimageeditor.com/)
