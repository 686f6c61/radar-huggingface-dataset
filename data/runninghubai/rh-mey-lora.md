# RunningHubAI/rh-mey-lora

## Resumen

`rh-mey-lora` es un adaptador LoRA para edición de imágenes (pipeline `image-text-to-image`) publicado por RunningHubAI en Hugging Face. No se trata de un modelo base completo, sino de un conjunto de pesos de bajo rango (218 MiB en un único fichero `MEy.safetensors`) que se aplica sobre un modelo base identificado en la model card como `krea2`. Su función es introducir un concepto o estilo concreto, activado mediante la palabra disparadora `MEy`, dentro de flujos de trabajo de ComfyUI o de la propia plataforma RunningHub.

El modelo está pensado para su uso en entornos de generación y edición de imagen, no para tareas de lenguaje. La información publicada es muy escasa: no se detallan parámetros totales, longitud de contexto, idiomas, licencia explícita ni datos de entrenamiento. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el 4 de noviembre de 2026.

Su relevancia es por tanto acotada: resulta útil para quien quiera reproducir el concepto `MEy` en ComfyUI o en RunningHub, pero no constituye una pieza para evaluar en pipelines de IA generativa de propósito general ni dispone de métricas públicas que permitan compararlo con alternativas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base `krea2`; no se especifica la arquitectura del base |
| Parámetros totales | no disponible (pesos LoRA de 218 MiB; el número de parámetros del adaptador no se publica) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantización | no disponible; se distribuye en safetensors sin indicar variantes cuantizadas |
| Idiomas soportados | no disponible (las palabras disparadoras y prompts se infieren en inglés por la model card, pero no se declara) |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`MEy.safetensors`, 218 MiB) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas de un modelo base para especializarlo sin reentrenar todos sus pesos. La model card indica que el ajuste fino parte de `krea2`, pero no describe la arquitectura de ese modelo base, el número de pasos de entrenamiento, el tamaño del dataset, la composición de las imágenes de entrenamiento ni si se emplearon técnicas de regularización o de aumento de datos.

Tampoco se documenta si el adaptador afecta a todas las capas de atención o solo a un subconjunto, ni el rango (`rank`) y el `alpha` utilizados, que son parámetros habituales en cualquier LoRA y determinan en buena medida su comportamiento. La única información operativa es la palabra disparadora `MEy`, necesaria para activar el concepto aprendido durante la inferencia.

## Capacidades

- Edición de imágenes guiada por texto e imagen de entrada (`image-text-to-image`), aplicando el concepto `MEy` sobre la imagen original.
- Integración con ComfyUI mediante el nodo de carga de LoRA correspondiente.
- Ejecución en la plataforma RunningHub, que ofrece endpoints de API para invocar el modelo de forma remota.
- Activación mediante la palabra disparadora `MEy` en el prompt.
- No se declaran capacidades de generación de texto, razonamiento, código, matemáticas, visión comprensiva, tool calling, agentes ni multilingüismo.
- No se documentan modos especiales como *thinking mode*, audio o vídeo.

## Casos de uso

- Edición de retratos o personajes con el concepto `MEy`: se carga el LoRA en ComfyUI junto con el modelo base `krea2` y se introduce la palabra disparadora en el prompt para transferir el estilo o identidad aprendidos a una imagen de entrada.
- Prototipado rápido de variaciones visuales: al ser un adaptador ligero de 218 MiB, se puede intercambiar entre distintos LoRA en un mismo flujo de ComfyUI sin recargar el modelo base, lo que agiliza la comparación de estilos.
- Automatización de pipelines de edición por API: mediante los endpoints de RunningHub se puede invocar el modelo desde un servicio externo para procesar lotes de imágenes con el concepto `MEy`.
- Pruebas de concepto en investigación de adaptadores: sirve como ejemplo de LoRA de imagen para estudiar cómo un adaptador de bajo rango modifica la salida de un modelo base concreto.
- Generación de material gráfico de marca o campaña: si el concepto `MEy` corresponde a un estilo o personaje autorizado, puede emplearse para producir variaciones consistentes de imágenes promocionales.
- Integración en flujos de trabajo de diseño asistido: combinado con otros nodos de ComfyUI (controlnet, upscalers, inpainting), permite refinar regiones concretas de una imagen manteniendo la coherencia del concepto aprendido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador en sí; depende enteramente del modelo base `krea2`, cuyos requisitos no se documentan.
- GPU recomendadas: no disponible. Al ser un LoRA de imagen, lo habitual es que el modelo base requiera GPUs con al menos 8-12 GB de VRAM en cuantizaciones agresivas y 16-24 GB para precisión completa, pero este dato no se confirma en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; depende del modelo base y del backend utilizado.
- Opciones de despliegue: ComfyUI (indicado en los tags), plataforma RunningHub y su API. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de imagen de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño de pesos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rh-mey-lora` | LoRA de imagen sobre `krea2` | 218 MiB | no aplica | no disponible | Hugging Face, ComfyUI, RunningHub |
| LoRA de estilo genéricos en Civitai | LoRA de imagen | variable (50-300 MiB típico) | no aplica | variable según autor | Civitai, Hugging Face |
| Adaptadores oficiales del modelo base `krea2` | LoRA oficial | no disponible | no aplica | la del proyecto `krea2` | según el proyecto original |

No se dispone de datos de rendimiento ni de parámetros del adaptador que permitan una comparación cuantitativa con alternativas. La comparativa anterior es estructural, no de calidad.

## Limitaciones y advertencias

- La información publicada es mínima: no hay licencia explícita, ni idiomas, ni datos de entrenamiento, lo que dificulta evaluar su idoneidad para producción.
- Al ser un LoRA, su comportamiento y calidad dependen críticamente del modelo base `krea2`; usar otro base puede degradar o anular el efecto del adaptador.
- Requiere la palabra disparadora `MEy` para activarse; sin ella, el efecto puede ser nulo o impredecible.
- Riesgo de sobreajuste al concepto aprendido: puede reproducir rasgos no deseados del dataset de entrenamiento, que no se documenta.
- No se declaran sesgos conocidos, pero al no publicarse la composición del dataset no es posible descartar sesgos demográficos o estilísticos.
- La licencia no está clara: la model card remite a la del proyecto original o upstream, por lo que el uso comercial exige verificar la licencia de `krea2` y del propio adaptador con el autor.
- Repositorio sin descargas ni validación comunitaria: no hay evidencia pública de su funcionamiento más allá de la model card.
- No apto para tareas de texto, razonamiento, código o agentes; es exclusivamente un adaptador de imagen.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-mey-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2117864785823150082
- Página del autor: https://www.runninghub.ai/user-center/2103662895817433089
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-mey-lora/blob/main/README_cn.md
