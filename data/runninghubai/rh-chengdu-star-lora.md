# RunningHubAI/rh-chengdu-star-lora

## Resumen

`rh-chengdu-star-lora` es un adaptador LoRA (Low-Rank Adaptation) publicado por RunningHubAI bajo su cuenta de Hugging Face. No se trata de un modelo de lenguaje, sino de un ajuste fino ligero orientado a edición de imágenes dentro de pipelines de generación image-to-image (etiqueta `image-text-to-image`). El adaptador se distribuye como un único archivo `safetensors` de 109 MiB y está pensado para cargarse sobre un modelo base identificado en la model card como `krea2`.

La relevancia de esta ficha es limitada en el contexto de evaluación de modelos de IA open source: el repositorio no expone arquitectura, número de parámetros del modelo base, longitud de contexto, idiomas ni licencia explícita. La información disponible se reduce a metadatos de publicación (autor, fecha, tamaño del repo, pipeline declarado) y a enlaces a la plataforma RunningHub, donde el autor aloja el modelo original.

Por tanto, esta ficha documenta lo que se puede verificar y marca explícitamente como "no disponible" todo aquello que la model card no declara. No debe interpretarse como un modelo de propósito general ni como una alternativa a LLM o modelos multimodales de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base `krea2`; arquitectura del base no disponible |
| Parametros totales | no disponible (el adaptador pesa 109 MiB; el base no se detalla) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible; se distribuye en `safetensors` |
| Idiomas soportados | no disponibles |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o upstream |
| Formato de pesos | `safetensors` (`krea2raw_buttplug_v1.safetensors`, 109 MiB) |

## Arquitectura y entrenamiento

El repositorio contiene únicamente pesos LoRA, no un modelo completo. La model card indica que el adaptador está afinado a partir de `krea2` y que su función es la edición de imágenes (`Model Type: LoRA (image edit)`), con pipeline declarado `image-text-to-image`. No se especifican el rango del adaptador, las capas objetivo, el número de pasos de entrenamiento, el dataset utilizado ni si hubo técnicas de alineación (RLHF, DPO u otras). Tampoco se documenta el número de parámetros del modelo base ni su arquitectura interna (transformer de difusión, modelo híbrido u otra).

La única innovación técnica verificable es el formato de distribución: un único archivo `safetensors` de 109 MiB, cargable en ComfyUI, RunningHub o Hugging Face según la propia model card. Cualquier otra afirmación sobre el proceso de entrenamiento sería especulativa y no se incluye.

## Capacidades

- Edición de imágenes mediante adaptador LoRA sobre el modelo base `krea2`.
- Integración declarada con ComfyUI, RunningHub y Hugging Face.
- Pipeline `image-text-to-image`: se espera entrada de imagen y texto, aunque los detalles de la interfaz no están documentados.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- No se documentan modos especiales (thinking mode, visión, audio) más allá del pipeline de imagen declarado.

## Casos de uso

- Edición de imágenes en ComfyUI: el adaptador se carga como nodo LoRA sobre el modelo base para aplicar el estilo o transformación aprendida, aprovechando el ecosistema de nodos de ComfyUI.
- Prototipado en RunningHub: la plataforma del autor permite cargar el peso y probarlo en línea sin infraestructura propia, útil para validar el resultado antes de integrarlo en un flujo local.
- Experimentación con adaptadores de bajo rango: investigadores que estudian LoRA pueden inspeccionar el tamaño (109 MiB) y el formato `safetensors` como referencia de empaquetado.
- Integración vía API de RunningHub: la model card enlaza la documentación de API, lo que permite invocar el modelo de forma remota en lugar de desplegarlo localmente.
- Flujos de edición image-to-image con texto: adecuado para tareas donde se parte de una imagen y una instrucción textual, según el pipeline declarado.
- Evaluación comparativa de LoRAs sobre `krea2`: sirve como punto de comparación frente a otros adaptadores del mismo base, siempre que se disponga del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende enteramente del modelo base `krea2`, cuyos requisitos no se documentan.
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: no determinable con la información aportada.
- Opciones de despliegue: ComfyUI, RunningHub (plataforma del autor) y Hugging Face, según la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un adaptador de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica otros adaptadores LoRA comparables sobre `krea2`, ni ofrece métricas que permitan una comparación rigurosa con alternativas.

## Limitaciones y advertencias

- La licencia no está declarada de forma explícita; la model card remite a la licencia del proyecto original o upstream, lo que impide confirmar el uso comercial.
- No se documentan sesgos conocidos, pero al ser un adaptador de edición de imágenes hereda los sesgos del modelo base `krea2`, no evaluados aquí.
- Riesgo de alucinación no aplicable en el sentido de LLM; en su lugar, existe riesgo de artefactos visuales propios de la generación/edición de imágenes, no cuantificado.
- No hay información sobre idiomas soportados ni sobre el comportamiento con prompts en castellano.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- El nombre del archivo (`krea2raw_buttplug_v1.safetensors`) y el enlace a Civitai sugieren un contenido de nicho; conviene revisar la idoneidad del caso de uso antes de integrarlo en producción.
- No se especifican requisitos de hardware ni límites de contexto, lo que dificulta planificar el despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-chengdu-star-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2079002329203298305
- Página del autor: https://www.runninghub.ai/user-center/2041030036219498497
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Enlace a Civitai citado en la model card: https://civitai.red/models/2790799/butt plug krea 2?modelVersionId=3144988
