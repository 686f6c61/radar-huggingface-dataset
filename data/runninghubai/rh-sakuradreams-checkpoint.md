# RunningHubAI/rh-sakuradreams-checkpoint

## Resumen

rh-sakuradreams-checkpoint es un checkpoint de generación de imágenes publicado por RunningHubAI en Hugging Face, pensado para cargarse en ComfyUI y en la plataforma RunningHub. El repositorio contiene un único fichero de pesos, `sakuraDreams_v20.safetensors`, de 6617 MiB, dentro de un repositorio de 6,9 GB. La model card indica que es un fine-tune de IL-XL y que la publicación se hace en nombre del autor @百迟.

No es un modelo de lenguaje: no se documentan parámetros, longitud de contexto, idiomas de prompt ni pipeline de inferencia. La arquitectura subyacente tampoco se explicita; el único dato técnico relevante es el modelo base declarado, IL-XL, y el formato de pesos, safetensors.

Su interés práctico es acotado: permite experimentar con un checkpoint de imágenes en flujos ComfyUI sin entrenamiento propio, pero la ausencia de benchmarks, documentación de entrenamiento y licencia clara limita su adopción en producción. En el momento de la consulta acumula 0 descargas y 0 me gusta, por lo que tampoco existe validación comunitaria significativa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible; checkpoint de generación de imágenes para ComfyUI, sin arquitectura explicitada |
| Parámetros totales | no disponible |
| Longitud de contexto | no disponible (no aplica a un checkpoint de imágenes) |
| Tipos de cuantización | no disponible; solo se lista un safetensors sin variantes cuantizadas documentadas |
| Idiomas soportados | no disponible; no se documenta el idioma de los prompts |
| Licencia | no disponible; se indica que se siga la licencia del proyecto original o upstream y que el copyright queda en el autor |
| Formato de pesos | safetensors |
| Tipo de modelo | checkpoint para ComfyUI y RunningHub |
| Archivo principal | `sakuraDreams_v20.safetensors` (6617 MiB, aproximadamente 6,46 GiB) |
| Tamaño del repositorio | 6,9 GB |
| Pipeline | no disponible |
| Modelo base | IL-XL (`Finetuned from: IL-XL`) |
| Descargas / me gusta | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La información disponible no permite describir la arquitectura interna del modelo. La model card no indica si se trata de un transformer de difusión, de un UNet, de un modelo híbrido ni de otra familia concreta; tampoco se especifican resolución de entrenamiento, número de parámetros, dataset, número de pasos, sampler recomendado, escala de CFG ni proceso de ajuste fino. El único dato técnico declarado es que el checkpoint es un fine-tune de IL-XL.

No se documenta el uso de RLHF, DPO ni técnicas de alineación similares. Tampoco se detallan innovaciones técnicas como decodificación especulativa, atención lineal o entrenamiento con datos sintéticos. Cualquier afirmación sobre el dataset o el procedimiento de entrenamiento sería una inferencia no respaldada por la información proporcionada.

## Capacidades

- Generación de imágenes a partir de prompts en ComfyUI, cargando el checkpoint `sakuraDreams_v20.safetensors`.
- Ejecución en RunningHub y en flujos locales de ComfyUI, según la model card.
- No se documentan capacidades de tool calling, function calling ni agentes.
- No se documenta razonamiento multi-step, generación de código, matemáticas, visión, audio ni modo thinking.
- No es un modelo de lenguaje: no procesa contexto textual largo ni genera texto.
- No se documenta soporte multilingüe ni comportamiento diferencial según el idioma del prompt.
- No se documentan capacidades especiales como inpainting, img2img, ControlNet, LoRA, upscaling o edición guiada.
- No se publican ejemplos de prompts, estilos objetivo ni parámetros de inferencia recomendados.

## Casos de uso

- Exploración de concepto visual en ComfyUI: cargar el safetensors como checkpoint y generar un lote de variaciones de una misma idea para revisar composición, paleta e iluminación. Es adecuado para fases tempranas porque no requiere entrenamiento adicional, aunque la ausencia de parámetros recomendados obliga a ajustar sampler y CFG por prueba y error.
- Ilustración de acompañamiento para artículos o blogs: generar imágenes a partir de un prompt descriptivo y seleccionar variantes. Resulta útil si el estilo del checkpoint encaja con la línea editorial, pero exige revisión humana y verificación de la licencia antes de publicar.
- Moodboards para diseño de producto o interiorismo: producir referencias atmosféricas y de materiales para discutir una dirección visual. No debe utilizarse como plano técnico ni como especificación de fabricación.
- Concept art de personajes y entornos: iterar siluetas, vestuario y escenarios en un flujo ComfyUI. La integración sería básica, ya que no se documenta compatibilidad con ControlNet, LoRA ni otras herramientas de control.
- Contenido para redes sociales: generar variaciones de una imagen promocional o de un recurso gráfico. Es necesario revisar derechos de autor y condiciones de uso comercial, porque la licencia no está disponible.
- Demostración docente de flujos ComfyUI: ejemplificar la carga de un checkpoint, la escritura de un prompt y el muestreo en talleres o cursos. El tamaño de 6,46 GiB de pesos permite trabajar en entornos con VRAM suficiente, aunque no se confirma una GPU mínima.
- Prueba de estilo antes de un fine-tune propio: usar el checkpoint como referencia visual para calibrar expectativas y después entrenar un modelo específico. Sirve para comparar direcciones estéticas, no para validar calidad de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al no ser un modelo de lenguaje, métricas como MMLU, HumanEval o GSM8K no aplican. Tampoco se aportan evaluaciones de calidad de imagen, FID, CLIP score ni comparaciones cuantitativas con otros checkpoints.

## Requisitos de hardware

- VRAM estimada: no disponible. Los pesos ocupan 6617 MiB; a esa cifra hay que añadir el text encoder, el VAE, las activaciones y el overhead del runtime. No se publican requisitos oficiales.
- GPU recomendadas: no disponible; no hay lista de GPU validadas por el autor.
- GPU consumer: no confirmado. El tamaño del checkpoint es compatible con tarjetas de gama alta con VRAM suficiente, pero no se especifica una GPU mínima ni se aportan pruebas de funcionamiento.
- Opciones de despliegue: ComfyUI y RunningHub son las vías indicadas en la model card. vLLM, TGI, llama.cpp y Ollama no están orientados a checkpoints de imágenes y no se documentan para este modelo.
- Latencia y throughput: no disponible.
- Almacenamiento: 6,9 GB de repositorio; 6617 MiB de pesos en el fichero principal.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-sakuradreams-checkpoint | checkpoint de imágenes para ComfyUI | no disponible | no aplica | no disponible | Hugging Face y RunningHub |
| IL-XL (base declarada) | modelo base de imágenes | no disponible | no aplica | no disponible | no verificado en la información |
| Alternativas de la misma categoría, como otros checkpoints para ComfyUI | checkpoints de imágenes | no disponible | no aplica | no disponible | no disponible |

No hay datos de rendimiento ni de especificaciones de las alternativas en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de calidad, velocidad o consumo de VRAM.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial. La model card remite a la licencia del proyecto original o upstream de IL-XL y mantiene el copyright en el autor.
- Documentación mínima: no se indican arquitectura, resolución de entrenamiento, dataset, sampler, pasos, CFG, negative prompt ni parámetros recomendados.
- Sin benchmarks ni evaluaciones de calidad: el rendimiento es subjetivo y depende del prompt, del sampler y del flujo de ComfyUI utilizado.
- Sesgos no documentados: al no detallarse el dataset de entrenamiento, no es posible evaluar sesgos de género, etnia, estilo o representación.
- Riesgo de desajuste con el prompt: no es una alucinación textual, pero puede generar imágenes incoherentes o que no sigan las instrucciones.
- Idioma no documentado: no se especifica si los prompts funcionan mejor en inglés, chino u otros idiomas.
- No es un modelo de lenguaje: no soporta tool calling, agentes, código, matemáticas, visión ni audio.
- Compatibilidad no confirmada con LoRA, ControlNet, inpainting, img2img o upscaling.
- Validación comunitaria baja: 0 descargas y 0 me gusta en el momento de la consulta.
- El nombre `sakuraDreams` no constituye una especificación de estilo; no hay documentación que confirme el estilo objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-sakuradreams-checkpoint
- Model card en chino: https://huggingface.co/RunningHubAI/rh-sakuradreams-checkpoint/blob/main/README_cn.md
- Página original en RunningHub: https://www.runninghub.ai/model/public/2057138038165303298
- Página del autor: https://www.runninghub.ai/user-center/1975220411615117314
- RunningHub: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API en inglés: https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API en chino: https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- API relacionada de Seedance 2.5: https://www.runninghub.ai/call-api/api-detail/2133100000000700025

No se han encontrado papers, repositorios de código ni demos adicionales en la búsqueda web realizada.
