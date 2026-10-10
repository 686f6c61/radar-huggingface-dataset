# RunningHubAI/rh-riley-fem-lora

## Resumen

rh-riley-fem-lora es un adaptador LoRA de edicion de imagen publicado por RunningHubAI, la cuenta de la plataforma RunningHub en HuggingFace. No es un modelo de lenguaje ni un modelo base: se trata de un peso adicional que se carga sobre un modelo de difusion previo, en este caso "krea2" segun indica el propio autor en la model card. Su funcion es introducir un concepto o personaje concreto, activado mediante la palabra clave (trigger word) "Riley", dentro de flujos de generacion y edicion de imagen condicionados por texto.

El repositorio ocupa 0,2 GB y contiene un unico fichero de pesos en formato safetensors de 218 MiB (`riley_lora_v1_000002750.safetensors`). La etiqueta de pipeline es `image-text-to-image` y las etiquetas declaradas son `comfyui` y `lora`, lo que situa al modelo en el ecosistema de ComfyUI, RunningHub y Hugging Face como plataformas previstas de uso.

La relevancia de esta ficha es limitada desde el punto de vista de la investigacion: no hay informacion publicada sobre el dataset de entrenamiento, el rango del adaptador, la licencia ni resultados de evaluacion, y el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta. Se documenta aqui como ejemplo de adaptador de bajo rango distribuido a traves de una plataforma de generacion de imagen, con las limitaciones de trazabilidad que ello implica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (low-rank adaptation) sobre modelo de difusion base "krea2" |
| Parametros totales | no disponible (el repositorio contiene un unico fichero de 218 MiB en safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "Published by RunningHub on behalf of the author. Copyright remains with the author. Follow the original project or upstream license") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible describe un unico artefacto: un adaptador LoRA de 218 MiB destinado a edicion de imagen condicionada por texto e imagen (`image-text-to-image`). El autor indica que el modelo esta afinado a partir de "krea2" ("Finetuned from: krea2"), pero no se detalla si se trata de una destilacion de tipo Low-Rank Adaptation clasica, que modulos del transformer de difusion se adaptan, ni cual es el rango, alpha o dropout empleados. El nombre del fichero, `riley_lora_v1_000002750`, sugiere un checkpoint correspondiente al paso 2750 de entrenamiento, si bien esto es una inferencia a partir del nombre y no un dato confirmado en la documentacion.

Tampoco se especifica el volumen de datos de entrenamiento, la composicion del dataset, el metodo de anotacion, ni si se aplicaron tecnicas de regularizacion, curado de imagenes o filtrado de contenido. No hay informacion sobre procesos de ajuste por preferencias humanas (RLHF, DPO) ni sobre innovaciones tecnicas como atencion lineal o decodificacion especulativa, que en cualquier caso no aplican a un adaptador de difusion de este tipo. La model card es, en la practica, un formulario de publicacion de la plataforma RunningHub con campos minimos: tipo de modelo, plataformas soportadas, autor, palabra clave y listado de ficheros.

## Capacidades

- Edicion y generacion de imagen condicionada por texto e imagen (`image-text-to-image`) mediante un flujo de difusion.
- Introduccion de un concepto o personaje concreto, activado con la palabra clave "Riley" en el prompt.
- Integracion en flujos de trabajo de ComfyUI, segun la etiqueta `comfyui` declarada por el autor.
- Ejecucion a traves de la plataforma RunningHub (version internacional y version china) y mediante su API, segun los enlaces de la model card.
- Carga como adaptador sobre el modelo base "krea2", sin necesidad de sustituir los pesos del modelo original.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no disponible (no se especifica que idiomas acepta el codificador de texto del modelo base).
- Capacidades especiales: no se documentan modos de pensamiento, audio ni vision mas alla de la propia generacion de imagen.

## Casos de uso

- Edicion de retratos en estudio: cargando el adaptador sobre krea2 en ComfyUI, el flujo puede aplicar el concepto "Riley" a una fotografia de entrada para obtener variaciones coherentes de un mismo personaje sin reentrenar el modelo base.
- Produccion de contenido para redes sociales: generacion por lotes de imagenes de un personaje recurrente usando la palabra clave "Riley" en cada prompt, lo que reduce la deriva de identidad entre publicaciones.
- Ilustracion de narrativa serial: creacion de un elenco visual estable para comics, cuentos o novelas visuales, donde el adaptador garantiza consistencia del personaje a lo largo de multiples escenas.
- Prototipado de storyboards: iteracion rapida sobre bocetos y encuadres en `image-text-to-image`, aprovechando el bucle de trabajo nativo de ComfyUI para ajustar composicion y estilo antes de producir material final.
- Automatizacion via API: integracion del adaptador en un servicio que exponga la API de RunningHub para generar variaciones de personaje bajo demanda desde una aplicacion externa.
- Pruebas de concepto de identidad de marca: uso interno para explorar la representacion visual de una mascota o personaje corporativo, siempre que la licencia final lo permita.
- Generacion asistida en flujos de diseno grafico: incorporacion del adaptador como nodo adicional en un grafo de ComfyUI compartido por un equipo, de modo que todos los disenadores obtengan el mismo personaje con los mismos parametros.
- Material de referencia para entrenamiento posterior: las imagenes generadas pueden servir como conjunto de referencia para ajustes adicionales, aunque conviene revisar las condiciones de uso antes de reutilizarlas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, similitud de identidad, evaluacion humana) ni comparaciones cuantitativas con otros adaptadores. Tampoco se documentan tiempos de inferencia ni calidad percibida.

## Requisitos de hardware

- Tamano del adaptador: 218 MiB en un unico fichero safetensors, por lo que el almacenamiento y el coste de carga del propio LoRA son despreciables.
- VRAM total necesaria: no disponible en la informacion proporcionada. Depende del modelo base "krea2", cuyas caracteristicas (tamano de parametros, precision, resolucion de entrenamiento) no se detallan.
- GPU recomendadas: no disponible. No se ha publicado una tabla de compatibilidad de GPU.
- Compatibilidad con GPU de consumo: no disponible. No puede confirmarse si el conjunto base mas adaptador cabe en tarjetas de gama de consumo.
- Opciones de despliegue: ComfyUI, la plataforma RunningHub (internacional y china) y Hugging Face, segun las etiquetas y enlaces de la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no resultan aplicables a un adaptador de difusion.
- Latencia y throughput: no disponible. No se aportan mediciones de tiempo por imagen ni de imagenes por segundo.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica otros adaptadores LoRA comparables, ni versiones alternativas del mismo autor, ni resultados que permitan situar este adaptador frente a otros conceptos de la misma categoria. El unico punto de referencia declarado es el modelo base "krea2", del que tampoco se ofrecen especificaciones tecnicas en la model card.

## Limitaciones y advertencias

- Licencia sin definir: la model card remite a "the original project or upstream license", sin concretar condiciones. No puede asumirse uso comercial permitido sin verificacion previa con el autor o con la licencia del modelo base krea2.
- Ausencia de trazabilidad del entrenamiento: no se documenta el dataset, su procedencia, su licencia ni los criterios de filtrado, lo que impide evaluar sesgos y riesgos de reproduccion de material protegido.
- Riesgo de sobreajuste al concepto: al ser un LoRA de personaje con una unica palabra clave, es probable que el adaptador imponga rasgos de identidad muy marcados y reduzca la diversidad de las salidas, aunque no hay datos que lo confirmen.
- Dependencia estricta del modelo base: el adaptador solo es funcional sobre "krea2"; cargarlo sobre otra base puede degradar la calidad o no producir efecto alguno.
- Palabra clave obligatoria: sin incluir "Riley" en el prompt, es probable que el concepto no se active, y el autor no documenta pesos o escalas recomendadas para el adaptador.
- Idiomas no especificados: se desconoce si el codificador de texto del modelo base procesa prompts en castellano, por lo que conviene validar el comportamiento antes de desplegarlo en produccion.
- Sin validacion comunitaria: el repositorio registra 0 descargas y 0 "likes", de modo que no existe evidencia externa de calidad, estabilidad ni reproducibilidad.
- Riesgo de contenido inapropiado: los adaptadores de personaje de origen no verificado pueden producir resultados no deseados segun el prompt; se recomienda aplicar filtrado y revision humana en cualquier despliegue publico.
- Fecha de publicacion inusual: el repositorio figura como creado el 2026-10-10, dato que conviene contrastar con la plataforma de origen antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RunningHubAI/rh-riley-fem-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2091447704609431554
- Pagina del autor en RunningHub (@Lars): https://www.runninghub.ai/user-center/2081023300781174786
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Llamada a la API de RunningHub: https://www.runninghub.ai/call-api
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Detalle de la API de Seedance 2.5: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
