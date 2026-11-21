# RunningHubAI/rh-k2-lora

## Resumen

rh-k2-lora es un adaptador LoRA de edición de imágenes publicado por RunningHubAI en Hugging Face. Según la model card, se trata de un LoRA afinado a partir del modelo base "krea2" y orientado a tareas de image-text-to-image, es decir, edición o generación de imágenes guiada por texto e imagen de referencia. El repositorio contiene un único archivo de pesos de 224 MiB, `K2 SJFG.safetensors`, dentro de un repo de 0,9 GB.

El modelo está pensado para cargarse en ComfyUI, RunningHub o Hugging Face, y la propia model card remite a la plataforma RunningHub para su uso online y para el entrenamiento de modelos. La información publicada es muy escasa: no se detallan la arquitectura del modelo base, el número de parámetros, la longitud de contexto ni los datos de entrenamiento. La etiqueta del prompt incluida en la model card ("SJFG") sugiere un LoRA de estilo o de activación de un concepto concreto, pero no se aporta documentación adicional.

Por tanto, esta ficha debe leerse como una descripción de un artefacto de pesos para ComfyUI más que como la de un modelo fundacional. Su relevancia actual es limitada y muy específica: sirve a usuarios del ecosistema ComfyUI/RunningHub que quieran reproducir el efecto para el que fue entrenado, no como modelo general de generación o edición de imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre modelo base "krea2" (arquitectura del base no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors; se usa como LoRA en el base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "Follow the original project or upstream license", copyright del autor) |
| Formato de pesos | safetensors (`K2 SJFG.safetensors`, 224 MiB) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base "krea2" ni sobre el proceso de entrenamiento del adaptador. La model card solo indica que se trata de un LoRA de edición de imágenes ("LoRA (image edit)"), afinado desde krea2, y que el autor es el usuario de RunningHub identificado como "蛋炒饭". No se documentan el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni ninguna innovación técnica (atención lineal, decodificación especulativa, etc.).

El único dato técnico verificable es el tamaño del artefacto: un archivo safetensors de 224 MiB, coherente con un adaptador LoRA de rango bajo sobre un modelo de difusión o de image-to-image de tamaño medio. Cualquier afirmación adicional sobre el entrenamiento sería especulativa.

## Capacidades

- Edición de imágenes guiada por texto e imagen de entrada (pipeline image-text-to-image), presumiblemente mediante la activación del concepto o estilo para el que fue entrenado (etiqueta "SJFG").
- Integración con ComfyUI como nodo de carga de LoRA sobre el modelo base krea2.
- Uso en la plataforma RunningHub, tanto online como vía API.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes, multilingüismo ni modos de "thinking".
- No se documentan capacidades de visión más allá de la propia tarea de edición de imagen.

## Casos de uso

- Edición de imágenes en ComfyUI: cargar `K2 SJFG.safetensors` como LoRA sobre el base krea2 y aplicar el efecto aprendido a imágenes de entrada mediante prompts de texto, dentro de un flujo de trabajo de nodos ya existente.
- Prototipado rápido de estilos o conceptos: usar el LoRA para comprobar in situ el efecto "SJFG" antes de decidir si se integra en un pipeline de producción.
- Automatización vía API de RunningHub: invocar el modelo a través de la API documentada para aplicar el efecto de forma programática en un servicio externo, sin gestionar infraestructura propia de GPU.
- Flujos de trabajo reproducibles en equipo: al ser un artefacto pequeño (224 MiB), es fácil de versionar y distribuir junto con el grafo de ComfyUI para que varios miembros del equipo obtengan resultados idénticos.
- Experimentación con adaptadores LoRA: sirve como ejemplo práctico de cómo RunningHub publica y entrena LoRAs, útil para quien quiera replicar el proceso con sus propios conceptos.
- Previsualización de resultados para clientes: generar variantes editadas de una imagen de referencia con el efecto del LoRA para validar dirección creativa antes de invertir en un modelo entrenado a medida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Depende enteramente del modelo base krea2, cuyas especificaciones no se documentan; el LoRA en sí ocupa 224 MiB en disco.
- GPU recomendadas: no disponible por falta de datos del base.
- Compatibilidad con GPU de consumo: no disponible; no se puede confirmar si cabe en RTX 4090, RTX 3090 u otras.
- Opciones de despliegue: ComfyUI (principal), plataforma RunningHub (online y API). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que además no aplican a un LoRA de edición de imágenes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-k2-lora | LoRA de edición de imagen sobre krea2 | no disponible | no disponible | no disponible | Hugging Face, ComfyUI, RunningHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (LoRAs de edición de imagen sobre el mismo base u otros bases equivalentes) en la documentación proporcionada.

## Limitaciones y advertencias

- Documentación mínima: no se especifican arquitectura del base, parámetros, contexto, idiomas ni datos de entrenamiento, lo que impide evaluar el modelo con rigor.
- Licencia no disponible: la model card remite a la licencia del proyecto original o upstream; antes de cualquier uso comercial es imprescindible verificar los términos del modelo base krea2 y del autor.
- Dependencia del modelo base: el LoRA no funciona de forma autónoma; requiere cargar krea2 (y presumiblemente el nodo y el flujo correctos en ComfyUI).
- Alcance muy restringido: está entrenado para un efecto o concepto concreto ("SJFG"); fuera de ese uso, el comportamiento no está documentado.
- Sin métricas de calidad: no hay benchmarks ni evaluaciones publicadas, por lo que no se puede comparar su rendimiento ni su fidelidad al prompt.
- Riesgo de sesgos y alucinaciones visuales: no evaluado; al ser un adaptador de imagen, los sesgos del base y del dataset de entrenamiento pueden trasladarse al resultado.
- Popularidad nula en el momento de la consulta (0 descargas, 0 likes), lo que reduce la probabilidad de encontrar soporte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-k2-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2085987702188630017
- Página del autor: https://www.runninghub.cn/user-center/1998426240958746626
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-k2-lora/blob/main/README_cn.md
