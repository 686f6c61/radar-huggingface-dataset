# RunningHubAI/rh-krea2-plane-style-lora

## Resumen

rh-krea2-plane-style-lora es un adaptador LoRA de edición de imagen publicado por RunningHubAI en nombre del autor, orientado a aplicar un estilo visual concreto («plane style») sobre el modelo base krea2. No es un modelo completo, sino un ajuste fino de bajo rango que pesa 224 MiB en un único fichero safetensors (`Krea2PlaneStyle_c1-st8000.safetensors`), pensado para cargarse sobre el modelo base dentro de ComfyUI, RunningHub o Hugging Face. El repositorio se creó el 26 de septiembre de 2026 y, en el momento de redactar esta ficha, acumula 0 descargas y 0 «likes», por lo que se trata de una publicación reciente y sin validación comunitaria.

El problema que resuelve es acotado y práctico: evitar tener que reentrenar un modelo de difusión completo para conseguir de forma consistente una estética de estilo «plane» en tareas de edición de imagen guiada por texto (pipeline declarado: image-text-to-image). Un LoRA de este tamaño se integra en flujos existentes de generación y edición con un coste de almacenamiento y de VRAM marginal respecto al modelo base.

La información publicada es muy escasa: la model card no detalla arquitectura del modelo base, número de tokens de entrenamiento, composición del dataset, parámetros totales del adaptador, idiomas ni licencia concreta. Cualquier evaluación rigurosa exige, por tanto, probar el adaptador sobre la versión exacta de krea2 con la que fue entrenado, ya que la calidad y la compatibilidad dependen del checkpoint base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base krea2; arquitectura del modelo base no especificada en la informacion disponible |
| Parametros totales | no disponible (el repositorio solo publica el peso del adaptador: 224 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generacion y edicion de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (se distribuye un unico fichero safetensors; no se publican versiones GGUF ni cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible; RunningHub indica que publica en nombre del autor, que mantiene el copyright, y remite a la licencia del proyecto original |
| Formato de pesos | safetensors (`Krea2PlaneStyle_c1-st8000.safetensors`, 224 MiB) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del adaptador mas alla de su naturaleza LoRA (fine-tuning de bajo rango) ni la del modelo base, identificado unicamente como «krea2». Tampoco se especifican el rango, el alpha, los modulos objetivo ni si el entrenamiento afecto a capas de atencion, a proyecciones o a ambos. El nombre del fichero (`c1-st8000`) sugiere un checkpoint correspondiente al paso 8000 de un entrenamiento, pero el autor no confirma esta interpretacion ni publica hiperparametros, resolucion de entrenamiento, scheduler o funcion de perdida.

No hay datos sobre el volumen de tokens o de imagenes usadas, la composicion del dataset, el uso de tecnicas de alineacion como RLHF o DPO, ni innovaciones tecnicas destacables. Tampoco se documenta si el adaptador se entreno con captions especificos o con una palabra de activacion (trigger word) que deba incluirse en el prompt; este ultimo punto es relevante en la practica, porque determina como invocar el estilo en ComfyUI.

## Capacidades

- Edicion de imagen guiada por texto sobre el modelo base krea2, aplicando un estilo visual denominado «plane style».
- Generacion y transformacion de imagenes dentro del pipeline image-text-to-image, segun la etiqueta declarada en el repositorio.
- Integracion en flujos de ComfyUI mediante carga de LoRA, tal como indican las etiquetas y la model card.
- Ejecucion en la plataforma RunningHub, tanto en su version internacional como en la china, y en Hugging Face.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no disponible; el modelo no procesa idioma natural de forma directa, sino condicionamiento textual a traves del codificador del modelo base.
- Capacidades especiales (modo «thinking», vision, audio): no disponible; no se documenta ninguna.

## Casos de uso

- Ilustracion de aeronaves y conceptos aeroespaciales: aplicar el estilo «plane» a fotografias o renders existentes para obtener laminas con una estetica homogenea, util en presentaciones tecnicas y material divulgativo. El adaptador evita reentrenar el modelo base para cada entrega.
- Concept art para videojuegos y simuladores: generar variaciones estilizadas de aeronaves para hojas de estilo de produccion, manteniendo coherencia visual en lotes de imagenes gracias a un unico peso de 224 MiB facil de versionar.
- Edicion por lotes en ComfyUI: incorporar el nodo de LoRA en un grafo ya existente y procesar catalogos de imagenes con la misma estetica, sin tocar el resto del pipeline del modelo base.
- Pruebas de estilo rapidas (A/B de direccion artistica): comparar el aspecto del modelo base con y sin el adaptador para decidir si el estilo encaja en una campana, dado el bajo coste de cargar y descargar el LoRA.
- Material para redes sociales y marketing: transformar fotografias de producto o de stock en imagenes con una identidad visual reconocible, reutilizando el mismo flujo para toda la cuenta.
- Storyboard y previsualizacion: convertir bocetos o imagenes de referencia en fotogramas estilizados antes de pasar a produccion 3D, como paso intermedio de bajo coste.
- Prototipado en la nube sin GPU local: ejecutar el adaptador a traves de la API de RunningHub cuando no se dispone de hardware propio, segun los enlaces publicados por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, similitud con imagenes de referencia ni comparaciones cuantitativas) ni evaluaciones cualitativas con ejemplos de antes y despues.

## Requisitos de hardware

- VRAM para inferencia: no disponible para el modelo base. El adaptador en si anade un coste minimo: el fichero safetensors ocupa 224 MiB, de modo que el requisito real de VRAM lo determina el checkpoint krea2 sobre el que se cargue, no el LoRA.
- GPU recomendadas: no disponible. La eleccion de GPU depende del modelo base, que la informacion proporcionada no identifica en su variante concreta.
- Compatibilidad con GPU de consumo: no confirmada. Depende integramente del modelo base; el adaptador no introduce una barrera adicional relevante en memoria.
- Opciones de despliegue: ComfyUI (indicado en las etiquetas y en la model card), plataforma RunningHub (internacional y china) y Hugging Face. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion de imagen.
- Latencia y throughput: no disponible. No se publican tiempos de inferencia, resoluciones de salida ni numero de pasos de muestreo recomendados.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos objetivos (parametros, contexto, metricas o licencia) de este adaptador ni de alternativas comparables, y el autor no publica referencias a otros LoRA de estilo de la misma familia. Cualquier comparacion requeriria conocer primero la variante exacta del modelo base krea2 y disponer de evaluaciones homogeneas, que no se han publicado.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Al no documentarse el dataset de entrenamiento, no puede evaluarse que sesgos visuales, culturales o de representacion puede introducir el adaptador.
- Riesgo de alucinacion: no aplica en el sentido de texto generado, pero si existe riesgo de artefactos y de deformaciones tipicas de los modelos de difusion, especialmente en estructuras finas (aeronaves, geometria, texto en la imagen). No se han publicado ejemplos que permitan acotarlo.
- Limitaciones de contexto o idioma: no se especifican idiomas soportados ni el comportamiento del condicionamiento textual. La falta de una palabra de activacion documentada puede provocar que el estilo no se aplique de forma consistente o que contamine imagenes en las que no se desea.
- Restricciones de licencia: la licencia figura como no disponible. La model card indica que RunningHub publica el modelo en nombre del autor, que conserva el copyright, y remite a la licencia del proyecto original. Antes de cualquier uso comercial es imprescindible verificar la licencia del modelo base krea2 y obtener autorizacion del autor del LoRA; a dia de hoy no hay garantia explicita de uso comercial.
- Compatibilidad: al ser un LoRA, solo funciona sobre el modelo base para el que fue entrenado. Cargarlo sobre otro checkpoint o sobre una version distinta de krea2 puede degradar el resultado o no producir efecto.
- Madurez del repositorio: 0 descargas, 0 «likes», sin historial de versiones ni comunidad que haya validado los pesos. El tamano del repositorio (0,2 GB) coincide con el unico fichero publicado.
- Ausencia de documentacion de entrenamiento: sin pasos, learning rate, resolucion ni composicion del dataset, la reproducibilidad es nula.
- Trazabilidad de las busquedas: las busquedas web realizadas no devolvieron ningun resultado relacionado con el modelo; los enlaces obtenidos no guardan relacion con este repositorio y se han descartado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-krea2-plane-style-lora
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/2074715678074036225
- Pagina del autor: https://www.runninghub.cn/user-center/2011770127833632769
- RunningHub internacional: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
