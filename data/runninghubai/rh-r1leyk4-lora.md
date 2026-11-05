# RunningHubAI/rh-r1leyk4-lora

## Resumen

`rh-r1leyk4-lora` es un adaptador LoRA de edición de imágenes publicado por RunningHubAI en Hugging Face. No se trata de un modelo de lenguaje ni de un modelo fundacional completo, sino de un conjunto de pesos de bajo rango (218 MiB en un único fichero `ALICE_K2_GUIDE.safetensors`) que se aplica sobre un modelo base identificado en la model card como `krea2`. Su función es la edición de imágenes guiada por texto dentro del pipeline `image-text-to-image`, es decir, recibe una imagen de entrada y una instrucción textual y devuelve una imagen modificada.

El adaptador está pensado para ejecutarse en ComfyUI, RunningHub o directamente desde Hugging Face, y requiere el uso de la palabra de activación `r1keyk4` para que el efecto aprendido se manifieste en la generación. La model card es extremadamente escasa: no documenta el dataset de entrenamiento, el número de pasos, la tasa de aprendizaje, la resolución objetivo ni las capacidades exactas del adaptador. El campo "About this model" contiene únicamente un párrafo vacío con el carácter "1".

Por su naturaleza (LoRA de edición de imagen de 218 MiB con cero descargas y cero likes en el momento de la consulta), su relevancia es limitada para el público general de desarrolladores e investigadores. Resulta útil únicamente como ejemplo de adaptador alojado en la infraestructura de RunningHub y como pieza concreta para flujos de ComfyUI que ya utilicen el modelo base `krea2`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base `krea2`; arquitectura del base no disponible |
| Parametros totales | no disponible (el fichero de pesos ocupa 218 MiB, no se indica el rango ni el número de parámetros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o del modelo upstream |
| Formato de pesos | safetensors (`ALICE_K2_GUIDE.safetensors`) |
| Tamano del repo | 0,2 GB |
| Pipeline declarado | `image-text-to-image` |
| Palabra de activacion | `r1keyk4` |
| Modelo base | `krea2` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del adaptador más allá de que se trata de un LoRA de edición de imagen fine-tuneado a partir de `krea2`. No se especifica el rango del LoRA, las capas objetivo (atención, proyecciones cruzadas, etc.), ni si se entrenó con pares imagen-texto, con máscaras de edición o con un esquema de difusión condicionada. Tampoco se documenta el número de pasos de entrenamiento, el tamaño del dataset, la resolución de las imágenes de entrenamiento ni si se aplicaron técnicas como regularización, LoRA de bajo rango con inicialización específica o entrenamiento con ruido balanceado.

El único dato técnico concreto es el tamaño del fichero de pesos (218 MiB) y el nombre del artefacto (`ALICE_K2_GUIDE.safetensors`), que sugiere un adaptador orientado a un estilo o personaje concreto más que a una edición genérica. La model card no incluye información sobre evaluación cuantitativa, curvas de pérdida ni comparaciones con otros adaptadores.

## Capacidades

- Edición de imágenes guiada por texto: el pipeline declarado es `image-text-to-image`, por lo que se espera que acepte una imagen de entrada y una instrucción textual para producir una imagen editada.
- Activación mediante la palabra clave `r1keyk4`, necesaria para invocar el comportamiento aprendido durante el fine-tuning.
- Integración en ComfyUI mediante el nodo de carga de LoRA correspondiente al modelo base `krea2`.
- Ejecución en la plataforma RunningHub (tanto en la versión internacional como en la china) y en Hugging Face.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código, visión general, audio ni modo "thinking".
- No se documentan capacidades multilingües; el idioma de las instrucciones de edición no está especificado.

## Casos de uso

- Edición de estilo consistente en ComfyUI: aplicar el LoRA sobre `krea2` con la palabra `r1keyk4` para reproducir un estilo visual concreto en lotes de imágenes, aprovechando que el adaptador pesa solo 218 MiB y se carga junto al modelo base.
- Prototipado rápido de flujos de edición de imagen: usar el adaptador como ejemplo mínimo para validar un pipeline `image-text-to-image` antes de entrenar un LoRA propio con la herramienta de entrenamiento de RunningHub.
- Integración vía API de RunningHub: invocar el modelo público (ID 2110293324845289474) desde la API de RunningHub para incorporar la edición de imágenes en una aplicación web sin gestionar infraestructura GPU propia.
- Generación de variaciones controladas de una imagen de referencia: introducir una imagen y una instrucción textual con la palabra de activación para obtener versiones editadas manteniendo la composición original.
- Pruebas de compatibilidad de LoRA en ComfyUI: verificar la carga de un adaptador safetensors de 218 MiB sobre `krea2` y comprobar el efecto de la palabra de activación en distintos prompts.
- Docencia y demostraciones: ilustrar el concepto de LoRA de edición de imagen con un artefacto pequeño y de acceso público, aunque con la advertencia de que la documentación es mínima.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad de edición (FID, CLIP score, LPIPS), comparaciones con otros LoRA ni evaluaciones humanas.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador en sí; depende del modelo base `krea2`, cuyos requisitos no se documentan en esta ficha.
- GPU recomendadas: no disponibles. Al tratarse de un LoRA de 218 MiB, la carga del adaptador es ligera, pero la inferencia requiere el modelo base completo.
- Compatibilidad con GPU de consumo: no se puede determinar sin conocer los requisitos de `krea2`.
- Opciones de despliegue: ComfyUI (flujo principal), plataforma RunningHub (web y API) y carga directa desde Hugging Face. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros adaptadores LoRA de edición de imagen comparables ni datos de rendimiento que permitan una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Documentación mínima: la model card no describe el dataset, el proceso de entrenamiento, las capacidades exactas ni las limitaciones del adaptador.
- Licencia no disponible: la model card remite a la licencia del proyecto original o upstream, por lo que el uso comercial no está claro y requiere verificar la licencia de `krea2` y de RunningHub.
- Dependencia del modelo base `krea2`: el adaptador no es autónomo y su comportamiento depende por completo de la disponibilidad y versión de dicho base.
- Riesgo de sobreajuste o de sesgos del dataset de entrenamiento: al no documentarse los datos, no se puede evaluar la diversidad ni los sesgos del adaptador.
- Riesgo de resultados no deseados: la palabra de activación `r1keyk4` es opaca y no se explica qué estilo o contenido activa.
- Idiomas no especificados: se desconoce si las instrucciones de edición funcionan en castellano, inglés u otros idiomas.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación por parte de la comunidad.
- Fecha de creación y actualización (2026-11-05) muy próxima entre sí: no hay historial de versiones ni correcciones posteriores.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-r1leyk4-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2110293324845289474
- Página del autor en RunningHub: https://www.runninghub.ai/user-center/2110292227720564738
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API de RunningHub (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-r1leyk4-lora/blob/main/README_cn.md
