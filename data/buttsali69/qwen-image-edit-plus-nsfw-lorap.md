# buttsali69/qwen-image-edit-plus-nsfw-lorap

## Resumen

MCNL v1 (Multi Concept NSFW LoRA) es un adaptador LoRA para el pipeline de difusión Qwen-Image-Edit-2511, orientado a la generación y edición de contenido para adultos (NSFW). Lo publica el usuario buttsali69 en Hugging Face, aunque la model card y el código de ejemplo remiten al repositorio original de ScottzillaSystems, del que este parece ser una réplica o re-subida. El adaptador no es un modelo autónomo: requiere cargar el modelo base Qwen/Qwen-Image-Edit-2511 y aplicar los pesos LoRA sobre la torre del transformer de difusión.

Técnicamente es un LoRA de aproximadamente 563 MB en formato safetensors que se inyecta en QwenImageTransformer2DModel, la arquitectura MMDiT (multimodal diffusion transformer) del modelo base. Su función es ampliar el rango de conceptos que el modelo base puede generar y editar, incorporando un conjunto de trigger words explícitas que activan representaciones de contenido sexual. El repositorio ocupa 0,6 GB y no registra descargas ni interacciones en el momento de la consulta.

Su relevancia es acotada y de nicho: sirve como ejemplo de adaptación mediante LoRA de un modelo de edición de imagen de gran tamaño para dominios restringidos, y resulta útil para quien necesite reproducir el pipeline de Qwen-Image-Edit con adaptadores adicionales. No aporta innovaciones arquitectónicas propias ni benchmarks publicados, y su uso está sujeto a las restricciones de la licencia OpenRAIL++ y a las políticas de contenido de las plataformas de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre QwenImageTransformer2DModel (MMDiT) del modelo base Qwen-Image-Edit-2511 |
| Parametros totales | no disponible (adaptador LoRA de ~563 MB en safetensors; el modelo base no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el ejemplo usa bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | openrail++ |
| Formato de pesos | safetensors (`qwen-image-edit-plus-nsfw-lora.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA aplicado sobre QwenImageTransformer2DModel, el bloque transformer de difusión multimodal (MMDiT) del modelo Qwen-Image-Edit-2511. No se modifica la arquitectura del modelo base: los pesos LoRA se cargan con `pipe.load_lora_weights(...)` de la librería diffusers y se activan mediante `set_adapters`, de modo que la inferencia sigue ejecutándose sobre el pipeline completo `QwenImageEditPlusPipeline` en precisión bfloat16. El fichero de pesos ocupa aproximadamente 563 MB, lo que es coherente con un adaptador de rango bajo sobre una torre de difusión de gran tamaño.

No se dispone de información sobre el conjunto de datos de entrenamiento, el número de pasos, el rango del LoRA, la composición del dataset ni si se aplicaron técnicas de regularización o captions específicas. La model card únicamente documenta el uso en inferencia, los trigger words y los parámetros recomendados (`num_inference_steps=40`, `true_cfg_scale=4.0`, `negative_prompt=" "`). No hay evidencia de RLHF, DPO ni de evaluaciones cuantitativas del adaptador.

## Capacidades

- Edición de imagen a imagen (image-to-image) sobre el pipeline Qwen-Image-Edit-2511, aplicando transformaciones guiadas por prompt sobre una imagen de entrada.
- Generación y edición de contenido para adultos mediante un conjunto de trigger words documentadas: `nsfw`, `nipples`, `vagina`, `penis`, `missionary`, `cowgirlout`, `reversecowgirlpov`, `blowjob`, `cum_on_face`, `creamp1e`, `l1ck`.
- Control de la fuerza del condicionamiento mediante `true_cfg_scale` y del número de pasos de muestreo (`num_inference_steps`), con soporte de `negative_prompt`.
- Compatibilidad con el ecosistema diffusers: carga y descarga de adaptadores en caliente mediante `load_lora_weights`, `set_adapters` y nombres de adaptador.
- Integración con el Space de terceros ScottzillaSystems Image Editor, que permite seleccionar el adaptador desde un desplegable.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, matemáticas, código, visión analítica, audio ni modo thinking; el adaptador es exclusivamente generativo de imagen.

## Casos de uso

- Edición de retratos con control de contenido para adultos: el adaptador permite aplicar transformaciones sobre una imagen de entrada guiadas por prompt, con los trigger words documentados para activar conceptos concretos, usando 40 pasos y `true_cfg_scale=4.0`.
- Prototipado de pipelines de edición de imagen con LoRA: sirve como ejemplo reproducible de cómo cargar un adaptador sobre `QwenImageEditPlusPipeline` en diffusers, útil para desarrolladores que quieran construir sus propios adaptadores sobre el mismo modelo base.
- Investigación sobre adaptación de modelos de difusión a dominios restringidos: permite estudiar cómo un LoRA de ~563 MB modifica el comportamiento de una torre MMDiT sin reentrenar el modelo completo.
- Pruebas de integración en Spaces de Hugging Face: el adaptador está pensado para seleccionarse desde el desplegable del Space ScottzillaSystems Image Editor, lo que facilita evaluar su comportamiento sin escribir código.
- Evaluación de salvaguardas y filtros de contenido: útil para equipos que necesiten medir cómo responden los clasificadores y moderadores ante un adaptador NSFW explícito antes de desplegar pipelines de edición en producción.
- Comparación de variantes de LoRA: al existir una versión MCNL v2 enlazada desde la model card, permite comparar el comportamiento y la calidad de dos iteraciones del mismo adaptador sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador por sí solo ocupa unos 563 MB en safetensors, pero requiere cargar el modelo base Qwen-Image-Edit-2511 completo en memoria; la VRAM necesaria la determina el modelo base, no el LoRA.
- El ejemplo oficial carga el pipeline con `torch_dtype=torch.bfloat16` y `.to("cuda")`, lo que implica una GPU con suficiente VRAM para el transformer de difusión en bfloat16; no se especifica la cifra exacta en la información disponible.
- No se documentan GPU recomendadas (A100, H100, RTX 4090 u otras) ni si el pipeline cabe en GPU de consumo; no disponible.
- Opciones de despliegue: diffusers (`QwenImageEditPlusPipeline`), el Space de Hugging Face ScottzillaSystems Image Editor, o cualquier plataforma que cargue adaptadores LoRA de diffusers. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un pipeline de difusión de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| buttsali69/qwen-image-edit-plus-nsfw-lorap (MCNL v1) | LoRA de edición de imagen NSFW | Qwen/Qwen-Image-Edit-2511 | ~563 MB (safetensors) | no disponible | openrail++ | Hugging Face, 0 descargas |
| ScottzillaSystems/qwen-image-edit-plus-nsfw-lora | LoRA de edición de imagen NSFW (original) | Qwen/Qwen-Image-Edit-2511 | no disponible | no disponible | no disponible | Hugging Face |
| ScottzillaSystems/qwen-image-edit-plus-nsfw-lora2 (MCNL v2) | LoRA de edición de imagen NSFW (versión actualizada) | Qwen/Qwen-Image-Edit-2511 | no disponible | no disponible | no disponible | Hugging Face |
| aiunivers/qwen-image-edit-plus-nsfw-lora | Re-subida del LoRA para una plataforma de terceros | Qwen/Qwen-Image-Edit-2511 | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- Contenido explícito para adultos: el adaptador está diseñado para generar material NSFW y no es apto para todos los públicos; las plataformas que lo alojan o sirven deben aplicar verificación de edad y moderación.
- Riesgo de uso indebido: la generación de imágenes sexuales sin consentimiento, especialmente con personas reales, puede ser ilegal en muchas jurisdicciones y viola las políticas de la mayoría de servicios.
- Licencia OpenRAIL++: impone restricciones de uso, incluidas limitaciones sobre usos dañinos y sobre la redistribución; conviene revisar el texto completo antes de cualquier uso comercial.
- Autoría y procedencia dudosas: el repositorio de buttsali69 parece una réplica del original de ScottzillaSystems, y existe al menos otra re-subida (aiunivers) para una plataforma de terceros; no hay garantía de que los pesos coincidan bit a bit con el original.
- Sin métricas de calidad: no hay benchmarks, evaluaciones humanas ni comparaciones cuantitativas publicadas; la calidad de la edición y la fidelidad a los trigger words no están verificadas de forma independiente.
- Dependencia estricta del modelo base: solo funciona con Qwen/Qwen-Image-Edit-2511; no es utilizable de forma autónoma ni con otros pipelines de difusión.
- Documentación incompleta: se desconoce el dataset de entrenamiento, el rango del LoRA, los hiperparámetros y las limitaciones idiomáticas; la model card solo cubre el uso en inferencia.
- Sesgos: al no documentarse la composición del dataset, no es posible evaluar sesgos de representación corporal, género, etnia o edad en las salidas.
- Sin tracción verificable: 0 descargas y 0 likes en el momento de la consulta, lo que dificulta validar su funcionamiento mediante reportes de terceros.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/buttsali69/qwen-image-edit-plus-nsfw-lorap
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Repositorio original (ScottzillaSystems): https://huggingface.co/ScottzillaSystems/qwen-image-edit-plus-nsfw-lora
- Versión MCNL v2: https://huggingface.co/ScottzillaSystems/qwen-image-edit-plus-nsfw-lora2
- Space de edición de imagen: https://huggingface.co/spaces/ScottzillaSystems/Qwen-Image-Edit-2511-LoRAs-Fast
- Re-subida en aiunivers: https://huggingface.co/aiunivers/qwen-image-edit-plus-nsfw-lora
- README de la re-subida: https://huggingface.co/aiunivers/qwen-image-edit-plus-nsfw-lora/blob/main/README.md
