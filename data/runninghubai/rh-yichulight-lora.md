# RunningHubAI/rh-yichulight-lora

## Resumen

rh-yichulight-lora es un adaptador LoRA de tipo text-to-image publicado por RunningHubAI (autor original identificado en la model card como "@Yy Kk" en la plataforma RunningHub). No es un modelo base, sino un ajuste fino de bajo rango que se aplica sobre Flux2-Klein-9B para modificar el comportamiento de la iluminación en la imagen generada. Su función concreta es eliminar la luz direccional y los efectos de sombreado duros, sustituyéndolos por una iluminación ambiental difusa, uniforme y sin sombras, manteniendo intactos el sujeto, los colores, los materiales, la pose y el fondo.

El repositorio contiene un único archivo de pesos en formato safetensors de 158 MiB (`klein_light_remover_000012000.safetensors`), lo que es coherente con un adaptador LoRA de rango bajo y no con un modelo completo. El repo ocupa 0,2 GB en total. Está etiquetado para ComfyUI y text-to-image, y se distribuye a través de Hugging Face y de la propia plataforma RunningHub, que ofrece ejecución online y API.

Es relevante para flujos de trabajo de generación y posproducción de imagen que necesitan un control de iluminación reproducible: normalizar la luz de una escena para integrar elementos, preparar imágenes para composición o conseguir un aspecto plano y de bajo contraste sin recurrir a edición manual. La información pública disponible es escasa: no hay datos de licencia explícitos, idiomas, benchmarks ni detalles del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Flux2-Klein-9B |
| Parametros totales | no disponible (el adaptador pesa 158 MiB en safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; la cuantizacion depende del modelo base en ComfyUI) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base Flux2-Klein-9B para adaptar su comportamiento sin reentrenar todos los pesos. El nombre del archivo (`klein_light_remover_000012000.safetensors`) sugiere un checkpoint intermedio o final de un entrenamiento de eliminación de luz, con un contador de pasos asociado. El tamaño de 158 MiB es consistente con un adaptador de rango moderado sobre un modelo de la familia Flux.

No se dispone de información sobre el número de tokens o imágenes de entrenamiento, la composición del dataset, el uso de RLHF/DPO (no aplicable en un modelo de difusión de imagen) ni innovaciones técnicas específicas. La model card indica que el entrenamiento se realizó en la plataforma RunningHub y enlaza a su página de entrenamiento, pero no detalla hiperparámetros, resolución de entrenamiento ni configuración del pipeline.

## Capacidades

- Modificación de iluminación en generación text-to-image: elimina luz direccional, sombras duras y altos brillos, sustituyéndolos por luz ambiental difusa uniforme.
- Preservación de contenido: mantiene el sujeto, los colores, los materiales, la pose y el fondo de la imagen de entrada.
- Aplanamiento de la exposición: produce imágenes de bajo contraste y exposición uniforme.
- Integración con ComfyUI: el adaptador está etiquetado para su uso en flujos de ComfyUI.
- Ejecución en plataforma: disponible para su uso online y vía API en RunningHub.
- No dispone de capacidades de texto, razonamiento, código, tool calling ni agentes: es un adaptador de imagen.
- No se documentan capacidades multilingües ni modos especiales (thinking, visión, audio).

## Casos de uso

- Normalización de iluminación en pipelines de generación: aplicar el LoRA sobre Flux2-Klein-9B en ComfyUI para obtener imágenes con luz plana y difusa, útil cuando se necesita un aspecto consistente entre lotes.
- Integración de elementos en composición: al eliminar sombras direccionales y altos brillos, la imagen resultante es más fácil de combinar con otros elementos sin inconsistencias de iluminación.
- Preparación de material para edición posterior: generar una versión de bajo contraste que sirva como base para retoque, color grading o matte painting.
- Uniformidad visual en catálogos o series: producir conjuntos de imágenes con iluminación homogénea sin ajustes manuales por imagen.
- Prototipado rápido de conceptos: explorar variantes de una escena con iluminación neutra antes de decidir el acabado final.
- Automatización vía API: integrar el adaptador en un servicio de RunningHub para procesar solicitudes de generación con iluminación controlada sin gestionar infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada; depende del modelo base Flux2-Klein-9B y de la cuantizacion empleada.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el adaptador en si ocupa 158 MiB, pero el requisito real lo marca el modelo base.
- Opciones de despliegue: ComfyUI (etiqueta oficial), plataforma RunningHub y su API. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros adaptadores LoRA de eliminacion de luz ni datos comparativos de rendimiento, contexto o licencia frente a alternativas.

## Limitaciones y advertencias

- Licencia no disponible: la model card remite a la licencia del proyecto original o upstream, por lo que el uso comercial no esta claro y debe verificarse antes de producción.
- Alcance muy especifico: el adaptador esta disenado para eliminar luz direccional; su uso fuera de ese objetivo puede degradar la imagen.
- Dependencia del modelo base: requiere Flux2-Klein-9B y un entorno compatible (ComfyUI o RunningHub); no es un modelo autonomo.
- Sin datos de entrenamiento publicados: no se puede evaluar la composicion del dataset ni posibles sesgos.
- Riesgo de alucinacion o artefactos: no documentado; en modelos de difusion, los adaptadores de iluminacion pueden introducir inconsistencias en materiales o reflejos.
- Idiomas no disponibles: no se especifica el soporte de prompts en distintos idiomas.
- Repositorio sin descargas ni likes en el momento de la consulta: ecosistema de validacion limitado.
- Sin benchmarks: no hay evidencia cuantitativa de calidad frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-yichulight-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2079825826480140289
- Perfil del autor en RunningHub: https://www.runninghub.ai/user-center/1998606510911541249
- RunningHub: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: README_cn.md (en el repositorio)
