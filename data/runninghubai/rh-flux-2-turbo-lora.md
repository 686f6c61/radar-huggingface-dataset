# RunningHubAI/rh-flux.2-turbo-lora

## Resumen

rh-flux.2-turbo-lora es un adaptador LoRA publicado por RunningHub (RunningHubAI) para la familia de modelos de generación de imágenes FLUX.2. No se trata de un modelo completo, sino de un fichero de pesos de 2633 MiB en formato safetensors que se aplica sobre un modelo base de la familia FLUX.2 para acelerar la generación, según se desprende del nombre "turbo" y de la referencia al checkpoint fal/FLUX.2-dev-Turbo incluida en la model card.

El adaptador está pensado para su uso en ComfyUI y en la plataforma RunningHub, y está etiquetado con las tags comfyui, lora y region:us. La model card indica "Finetuned from: F2基础" (base F2), pero no se documentan ni el dataset de entrenamiento, ni el número de pasos, ni la metodología de destilación empleada.

En el momento de la consulta el repositorio acumula 0 descargas y 0 likes y ocupa 2,8 GB. Su relevancia es acotada: se dirige a quien ya trabaja con FLUX.2 en ComfyUI y busca un ajuste de velocidad o estilo, no a quien necesite un modelo autónomo. Toda la información técnica adicional (licencia explícita, especificaciones del base, resultados) no está disponible en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA; el modelo base pertenece a la familia FLUX.2, referenciado como fal/FLUX.2-dev-Turbo) |
| Parametros totales | no disponible (adaptador; fichero de pesos de 2633 MiB, 2,57 GiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generación de imágenes; sin datos de resolución o pasos en la model card) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; se aplican sobre el modelo base con la precisión con que este se cargue) |
| Idiomas soportados | no disponible (no se documenta el soporte multilingüe de los prompts) |
| Licencia | no disponible; la model card solo indica que se debe seguir la licencia del proyecto original o del upstream |
| Formato de pesos | safetensors (`flux.2-turbo-lora.safetensors`) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del adaptador. Se trata de un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base para modificar su comportamiento sin reentrenar el modelo completo. El base indicado es fal/FLUX.2-dev-Turbo, de la familia FLUX.2, y la model card menciona "Finetuned from: F2基础", lo que apunta a un ajuste sobre una versión base de FLUX.2. No se especifican el rango del LoRA, las capas objetivo ni la configuración de entrenamiento.

Tampoco se detallan los datos de entrenamiento: no hay número de imágenes, composición del dataset, resolución, ni si se emplearon técnicas como destilación por pasos (step distillation), que es lo habitual en adaptadores etiquetados como "turbo" para reducir el número de pasos de muestreo necesarios. No se documenta el uso de RLHF, DPO ni ningún otro esquema de alineación, algo por otra parte poco frecuente en modelos de difusión. Cualquier afirmación sobre la innovación técnica del adaptador sería especulativa con la información disponible.

## Capacidades

- Generación de imágenes: el adaptador está diseñado para modificar el comportamiento de un modelo de difusión FLUX.2 en tareas de text-to-image, aunque no se detallan las capacidades concretas ni la mejora de calidad o velocidad esperada.
- Aceleración de muestreo: la denominación "turbo" sugiere un ajuste orientado a reducir el número de pasos de inferencia, pero no se cuantifica en la model card.
- Integración con ComfyUI: está etiquetado como comfyui y lora, por lo que se espera su uso como nodo LoRA dentro de un grafo de ComfyUI.
- Despliegue en RunningHub: la model card incluye enlaces directos a la plataforma y a su API, y permite cargar los pesos en ese entorno.
- Estilización: al ser un LoRA, es probable que pueda combinarse con otros adaptadores, aunque no se documentan compatibilidades ni pesos recomendados.
- Tool calling, agentes, razonamiento multi-paso, visión, audio y capacidades multilingües: no disponibles o no aplicables a un adaptador de generación de imágenes.

## Casos de uso

- Generación de imágenes dentro de ComfyUI: cargar `flux.2-turbo-lora.safetensors` como nodo LoRA sobre el base FLUX.2 correspondiente para producir imágenes en un flujo de trabajo ya existente, sin cambiar el resto del grafo.
- Reducción del coste de inferencia en producción: si el adaptador cumple la función de destilación implícita en el nombre "turbo", permitiría reducir el número de pasos de muestreo por imagen y, con ello, el tiempo de GPU por petición; el ahorro concreto no está documentado.
- Pruebas de concepto con FLUX.2: evaluar la familia FLUX.2 en un entorno controlado antes de comprometerse con infraestructura dedicada, dado que el adaptador es un fichero pequeño (2,6 GB) frente al peso del checkpoint completo.
- Prototipado de estilos o ajustes concretos: servir como punto de partida para quien quiera entrenar sus propios LoRA sobre FLUX.2 en RunningHub, usando este adaptador como referencia de formato y plataforma.
- Pipelines de generación por lotes: integrar el adaptador en un servicio que consuma la API de RunningHub para generar imágenes de forma programática, siempre que se cumplan los términos de uso de la plataforma.
- Experimentación en investigación: comparar la salida del base FLUX.2 con y sin el adaptador para medir el efecto de un LoRA de bajo rango sobre la fidelidad al prompt, con la salvedad de que no hay métricas publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM del adaptador: el fichero pesa 2633 MiB (2,57 GiB), que se suman en memoria a los pesos del modelo base.
- VRAM total para inferencia: no disponible en la documentación. Depende por completo del checkpoint FLUX.2 sobre el que se aplique y de su precisión de carga; no se puede estimar con rigor a partir de los datos facilitados.
- GPU recomendadas: no disponible. La model card no menciona hardware objetivo.
- Compatibilidad con GPU de consumo: no disponible. No se confirma si el adaptador funciona en tarjetas de gama de consumo ni con qué cuantizaciones.
- Opciones de despliegue: ComfyUI (confirmado por las etiquetas y la propia model card), plataforma RunningHub y, presumiblemente, cualquier runtime capaz de cargar LoRA en safetensors sobre FLUX.2; no se documentan vLLM, llama.cpp, Ollama ni TGI, que además no son runtimes propios de modelos de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Proposito | Tamano de pesos | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-flux.2-turbo-lora | Adaptador LoRA para FLUX.2 | Ajuste/aceleración sobre FLUX.2 | 2633 MiB | safetensors | no disponible (se remite al upstream) | Hugging Face, ComfyUI, RunningHub |
| fal/FLUX.2-dev-Turbo | Checkpoint base (referenciado en la model card) | Generación de imágenes FLUX.2 | no disponible | no disponible | no disponible | Hugging Face (fal) |
| Otros LoRA de aceleración para FLUX | Adaptador LoRA | Reducción de pasos de muestreo | no disponible | safetensors (habitual) | no disponible | no disponible |

No se dispone de datos de rendimiento, contexto ni especificaciones comparables para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al no publicarse la composición del dataset de entrenamiento, no es posible evaluar sesgos de representación.
- Riesgo de alucinación: no aplicable en el sentido textual, pero sí existe el riesgo habitual de los modelos de difusión de generar contenido que no se corresponde con el prompt.
- Limitaciones de contexto e idioma: no se documenta el comportamiento del adaptador con prompts en distintos idiomas, ni con prompts largos o complejos.
- Licencia: la model card no concede una licencia explícita. Indica que "los derechos de autor permanecen en el autor" y que se debe "seguir la licencia del proyecto original o del upstream". Esto implica que el uso comercial depende de la licencia de FLUX.2 y del checkpoint base, que deben verificarse por separado antes de cualquier despliegue en producción.
- Ausencia de métricas: no hay benchmarks, comparativas ni ejemplos de salida en la información disponible, lo que impide validar las afirmaciones implícitas en el nombre "turbo".
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en la comunidad.
- Metadatos inconsistentes: las fechas del repositorio (creación y actualización el 12 de octubre de 2026) son posteriores a la fecha actual, lo que sugiere un error de registro o una fecha programada; conviene no tomarlas como referencia.
- Dependencia del base: el adaptador es inutilizable por sí solo; requiere el checkpoint FLUX.2 correspondiente, cuya disponibilidad, tamaño y licencia no se detallan.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-flux.2-turbo-lora
- Checkpoint base referenciado: https://huggingface.co/fal/FLUX.2-dev-Turbo/tree/main
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/2006020378092847105
- Página del autor: https://www.runninghub.cn/user-center/1819214514410942465
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (ZH): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- README en chino: README_cn.md (en el propio repositorio)
