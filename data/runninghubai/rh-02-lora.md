# RunningHubAI/rh-02-lora

## Resumen

rh-02-lora es un adaptador LoRA de generacion de imagenes a partir de texto (text-to-image) publicado por la organizacion RunningHubAI en Hugging Face, con autoría atribuida al usuario @HUA555 dentro de la plataforma RunningHub. El unico artefacto del repositorio es `HUA02.safetensors`, un archivo de pesos de 162 MiB, y la model card indica que el modelo se ha entrenado partiendo de Z-image-turbo. Se trata, por tanto, de un ajuste fino de bajo rango que no funciona de forma autonoma: necesita cargarse sobre el modelo base indicado.

El repositorio no incluye informacion sobre el concepto, estilo o sujeto que el LoRA incorpora. La unica descripcion disponible es la etiqueta "02" incluida en la model card, que no aporta detalles sobre el contenido aprendido, el dataset de entrenamiento ni los hiperparametros usados. Tampoco se publican ejemplos de imagenes generadas con el adaptador dentro de la informacion disponible.

Su relevancia actual es limitada y acotada al ecosistema que lo aloja: esta pensado para ejecutarse en ComfyUI, en la propia plataforma RunningHub (web y API) y en Hugging Face. En el momento de la consulta acumula 0 descargas y 0 "likes", y el repositorio fue creado y actualizado el 27 de septiembre de 2026, lo que indica una publicacion reciente y sin validacion por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusion text-to-image Z-image-turbo |
| Parametros totales | no disponible (el archivo de pesos ocupa 162 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors (`HUA02.safetensors`, 162 MiB) |
| Modelo base | Z-image-turbo |
| Tamano del repositorio | 0,2 GB |
| Plataformas soportadas | ComfyUI, RunningHub (web y API), Hugging Face |
| Fecha de creacion | 2026-09-27 |
| Ultima actualizacion | 2026-09-27 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del adaptador mas alla de su naturaleza: es un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base para modificar su comportamiento sin reentrenar todos los pesos. El modelo base declarado es Z-image-turbo, un modelo de difusion text-to-image, por lo que el adaptador hereda su arquitectura, su tokenizador de texto y su procedimiento de muestreo. El autor no especifica en que capas concretas se ha aplicado el rango ni cual es el valor de rango o alpha utilizado.

Tampoco se documentan los datos de entrenamiento: no hay numero de imagenes, composicion del dataset, resolucion de entrenamiento, numero de pasos, learning rate ni si se aplicaron tecnicas de regularizacion como caption dropout. No se menciona el uso de RLHF, DPO ni de ninguna otra fase de alineacion, algo esperable en un adaptador de generacion de imagenes. No se declara ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal ni similares).

## Capacidades

- Generacion de imagenes a partir de prompts de texto, condicionada por el modelo base Z-image-turbo sobre el que se carga el adaptador.
- Aplicacion del concepto o estilo especifico aprendido por el LoRA, identificado en la model card unicamente como "02"; no hay documentacion que describa cual es ese concepto.
- Ejecucion en ComfyUI como nodo de carga de LoRA dentro de un grafo de generacion.
- Ejecucion en la plataforma RunningHub, tanto en su interfaz web como mediante API.
- Combinacion con otros componentes del ecosistema ComfyUI (por ejemplo, LoRAs adicionales, adaptadores de control o pipelines de posprocesado), siempre que el modelo base lo permita.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, vision de entrada, audio ni modo de pensamiento; son capacidades ajenas al tipo de modelo.
- No se documenta el conjunto de idiomas admitidos en los prompts.

## Casos de uso

- Generacion de imagenes con un estilo concreto en ComfyUI: el adaptador se carga sobre Z-image-turbo en un grafo de text-to-image para aplicar el concepto "02" a los prompts del usuario, reutilizando el resto de nodos ya configurados en el flujo de trabajo.
- Produccion por lotes mediante la API de RunningHub: al estar publicada en la plataforma, la inferencia puede invocarse por API, lo que permite generar conjuntos de imagenes de forma automatizada sin mantener infraestructura de GPU propia.
- Pruebas de concepto y prototipado visual: gracias al tamano reducido del archivo (162 MiB), el adaptador se descarga e integra rapidamente para evaluar si el estilo encaja antes de invertir en un entrenamiento propio.
- Variaciones controladas de un mismo estilo: al ser un LoRA intercambiable, permite alternar entre el modelo base sin adaptador y el modelo con adaptador dentro del mismo grafo, comparando resultados con el mismo prompt y la misma semilla.
- Integracion en pipelines de generacion de assets para productos digitales (ilustracion, fondos, material de marketing), siempre que la licencia del adaptador y del modelo base lo permitan en el contexto comercial correspondiente.
- Experimentacion en investigacion sobre adaptadores de bajo rango: el archivo sirve como ejemplo de LoRA entrenado sobre Z-image-turbo para estudiar tecnicas de mezcla de pesos, escalado de fuerza del LoRA o comparacion de adaptadores.
- Evaluacion interna de proveedores de inferencia: al ser un artefacto pequeno y de licencia no especificada, puede usarse como caso de prueba para medir latencia y consumo de VRAM de un despliegue concreto, sustituyendolo despues por el adaptador definitivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, evaluaciones de alineacion prompt-imagen), ni comparaciones cuantitativas con otros adaptadores, ni ejemplos con semilla y prompt reproducible.

## Requisitos de hardware

- El adaptador en si ocupa 162 MiB en disco, un tamano despreciable frente al modelo base.
- La VRAM necesaria para inferencia viene determinada por Z-image-turbo, no por el LoRA. La informacion proporcionada no incluye los requisitos del modelo base, por lo que no es posible dar una cifra verificada.
- Como referencia orientativa de categoria (modelos de difusion text-to-image de generacion rapida), un despliegue en precision completa suele requerir del orden de 12 a 16 GB de VRAM, y las variantes cuantizadas o con offloading pueden reducir el requisito; estas cifras no estan confirmadas para este modelo.
- No se dispone de datos de latencia ni de throughput para este adaptador.
- Opciones de despliegue documentadas: ComfyUI, la plataforma RunningHub (web y API) y Hugging Face como repositorio de pesos.
- No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, herramientas orientadas a modelos de lenguaje y no a difusion.

## Comparativa con modelos similares

La categoria natural de comparacion son otros adaptadores LoRA entrenados sobre Z-image-turbo, u otros LoRAs de text-to-image distribuidos en safetensors. No se ha encontrado informacion verificable sobre alternativas concretas en la informacion disponible, ni datos de rendimiento de este adaptador que permitan establecer una comparacion cuantitativa.

| Modelo | Tipo | Base | Tamano del adaptador | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-02-lora (RunningHubAI) | LoRA text-to-image | Z-image-turbo | 162 MiB | no disponible | Hugging Face, RunningHub, ComfyUI |
| Alternativas comparables | LoRA text-to-image | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks, contexto ni parametros de modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de documentacion: no se describe el concepto aprendido, el dataset, los hiperparametros ni el procedimiento de entrenamiento, lo que impide evaluar que comportamientos ha adquirido el adaptador.
- Sin benchmarks ni ejemplos: no hay evidencia publicada de la calidad del resultado ni de su fidelidad al prompt.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, con creacion y ultima actualizacion en la misma fecha.
- Licencia no disponible: la model card indica que el copyright permanece en el autor y que debe seguirse la licencia del proyecto original o upstream. Antes de cualquier uso comercial es imprescindible verificar la licencia de Z-image-turbo y contactar con el autor.
- Riesgo de sobreajuste inherente a los adaptadores LoRA de bajo rango, especialmente cuando no se documenta el tamano del dataset de entrenamiento.
- El comportamiento del adaptador depende por completo del modelo base: cambios de version o de variante de Z-image-turbo pueden degradar o alterar los resultados.
- Idiomas de los prompts no especificados; conviene asumir que el entrenamiento se hizo con prompts en ingles salvo verificacion propia, ya que no se declara soporte multilingue.
- No hay filtros de contenido ni declaraciones de moderacion documentadas; la responsabilidad sobre el contenido generado recae en quien despliega el modelo.
- Los resultados de la busqueda web realizada no contienen informacion relevante sobre este modelo (los enlaces recuperados corresponden a foros y sitios sin relacion), por lo que no ha sido posible contrastar datos externos.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-02-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2028043544857939970
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/2001277515308191745
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio para China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
