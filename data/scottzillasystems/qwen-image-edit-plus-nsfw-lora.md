# ScottzillaSystems/qwen-image-edit-plus-nsfw-lora

## Resumen

MCNL v1 (Multi Concept NSFW LoRA) es un adaptador de tipo LoRA desarrollado por ScottzillaSystems sobre el modelo base Qwen/Qwen-Image-Edit-2511, un modelo de difusión de imágenes de 20 000 millones de parámetros con arquitectura MMDiT. Este adaptador amplía las capacidades del modelo base para generar y editar imágenes con contenido explícito (NSFW), activando conceptos específicos mediante palabras clave (trigger words). Con más de 95 000 descargas y 251 likes en Hugging Face, se ha convertido en una opción popular dentro del ecosistema de edición de imágenes basada en difusión, aunque su uso está restringido a audiencias adultas y a contextos legales y éticos apropiados.

El adaptador se distribuye como un archivo safetensors de aproximadamente 563 MB y se integra fácilmente en pipelines de Diffusers, permitiendo tanto la edición de imágenes existentes como la generación de nuevas composiciones. Su relevancia radica en que ofrece una vía para personalizar un modelo de edición de imágenes de última generación sin necesidad de reentrenar el modelo completo, reduciendo costes computacionales y facilitando su adopción en entornos de producción. No obstante, su naturaleza NSFW implica que no es adecuado para aplicaciones generales y debe manejarse con las debidas salvaguardas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | QwenImageTransformer2DModel (MMDiT) LoRA |
| Parametros totales | no disponible (archivo de ~563 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | OpenRAIL++ |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador es un LoRA (Low-Rank Adaptation) que se aplica al modelo base Qwen-Image-Edit-2511, un transformer multimodal de difusión (MMDiT) de 20 000 millones de parámetros. El LoRA introduce matrices de bajo rango en las capas de atención del modelo base, permitiendo ajustar el comportamiento del modelo sin modificar los pesos originales. No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de pasos, la tasa de aprendizaje ni el método de optimización utilizado para este adaptador. La model card únicamente indica que el adaptador habilita conceptos NSFW mediante palabras clave específicas, lo que sugiere un entrenamiento supervisado con pares imagen-texto etiquetados para esos conceptos.

## Capacidades

- Generación y edición de imágenes con contenido explícito (NSFW), incluyendo desnudos y actos sexuales.
- Activación de conceptos concretos mediante trigger words: `nsfw`, `nipples`, `vagina`, `penis`, `missionary`, `cowgirlout`, `reversecowgirlpov`, `blowjob`, `cum_on_face`, `creamp1e`, `l1ck`.
- Compatible con el pipeline `QwenImageEditPlusPipeline` de Diffusers, lo que permite integración con flujos de trabajo existentes.
- Funciona tanto para edición de imágenes (image-to-image) como para generación desde texto (text-to-image) cuando se combina con el modelo base.
- Soporta ajuste fino de la intensidad del efecto mediante el parámetro `adapter_name` y la selección de adaptadores en tiempo de ejecución.
- No se han documentado capacidades adicionales como tool calling, agentes o procesamiento de audio/video.

## Casos de uso

- Creación de contenido artístico para adultos: artistas digitales pueden utilizar el adaptador para generar ilustraciones o editar fotografías con temática erótica, manteniendo un control fino sobre la composición mediante prompts y trigger words.
- Personalización de imágenes para proyectos de ficción: escritores o creadores de novelas visuales pueden adaptar imágenes de personajes a escenas explícitas, aprovechando la edición precisa del modelo base.
- Edición de imágenes para uso privado: usuarios individuales pueden modificar fotografías personales con fines privados, siempre que cumplan con las leyes locales y los términos de la licencia.
- Investigación en generación de contenido sensible: investigadores en ética de IA o moderación de contenido pueden estudiar el comportamiento del modelo ante prompts NSFW, aunque deben hacerlo en entornos controlados y con las debidas autorizaciones.
- Desarrollo de herramientas de filtrado: ingenieros de seguridad pueden utilizar este adaptador para probar sistemas de detección de contenido explícito, generando ejemplos de prueba para entrenar clasificadores.
- Prototipado de aplicaciones de edición de imágenes para nichos específicos: empresas que desarrollan software de edición para audiencias adultas pueden integrar este LoRA como una opción adicional, siempre que cumplan con las políticas de la plataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como FID, CLIP score o comparaciones con otros adaptadores NSFW.

## Requisitos de hardware

- El modelo base Qwen-Image-Edit-2511 tiene 20 000 millones de parámetros, por lo que se requiere una GPU con al menos 24 GB de VRAM para inferencia en bfloat16 (por ejemplo, RTX 3090, RTX 4090, A100, H100).
- El adaptador LoRA añade un overhead mínimo de memoria (aproximadamente 1-2 GB adicionales), por lo que los requisitos de VRAM están dominados por el modelo base.
- Se recomienda el uso de GPUs de gama alta con soporte para bfloat16 y suficiente memoria para el procesamiento de imágenes de alta resolución.
- Opciones de despliegue: el adaptador se integra con Diffusers, por lo que puede ejecutarse en entornos que soporten PyTorch y CUDA. No se menciona compatibilidad con vLLM, llama.cpp u otros motores de inferencia optimizados.
- La latencia y el throughput dependen del hardware y de la resolución de las imágenes; no se han publicado cifras específicas.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA NSFW comparables en el momento de la redacción. El propio autor publica una versión actualizada (MCNL v2) en [qwen-image-edit-plus-nsfw-lora2](https://huggingface.co/ScottzillaSystems/qwen-image-edit-plus-nsfw-lora2), pero no se han detallado diferencias técnicas. Otros LoRAs para edición de imágenes (como los de maniquíes o estilos realistas) existen en plataformas como Civitai, pero no son directamente comparables por su finalidad no NSFW.

## Limitaciones y advertencias

- Contenido explícito: el adaptador está diseñado exclusivamente para generar y editar contenido NSFW, lo que lo hace inadecuado para aplicaciones generales, educativas o profesionales que no requieran este tipo de material.
- Riesgo de alucinación: como cualquier modelo de difusión, puede producir artefactos visuales, distorsiones anatómicas o resultados no deseados, especialmente con prompts ambiguos o de baja calidad.
- Sesgos: el entrenamiento con datos NSFW puede perpetuar estereotipos de género, raza o cuerpo, y no se han documentado medidas de mitigación.
- Restricciones de licencia: OpenRAIL++ impone condiciones de uso que prohíben la generación de contenido ilegal, dañino o que viole los derechos de terceros. El uso comercial debe revisarse cuidadosamente para cumplir con los términos.
- Dependencia del modelo base: el rendimiento del adaptador está limitado por las capacidades y limitaciones de Qwen-Image-Edit-2511, incluyendo su ventana de contexto de imagen y su precisión en la edición.
- Sin soporte multilingüe documentado: la model card no especifica idiomas, por lo que se asume que los prompts deben estar en inglés o en el idioma en el que fue entrenado el modelo base.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ScottzillaSystems/qwen-image-edit-plus-nsfw-lora)
- [Versión v2 del adaptador](https://huggingface.co/ScottzillaSystems/qwen-image-edit-plus-nsfw-lora2)
- [Space de edición de imágenes de ScottzillaSystems](https://huggingface.co/spaces/ScottzillaSystems/Qwen-Image-Edit-2511-LoRAs-Fast)
- [Modelo base Qwen-Image-Edit-2511](https://huggingface.co/Qwen/Qwen-Image-Edit-2511)
- [Repositorio GitHub de Qwen-Image-Edit (modelo base)](https://github.com/MozDevApps/Qwen-Image-Edit)
