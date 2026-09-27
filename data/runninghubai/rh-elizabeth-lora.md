# RunningHubAI/rh-elizabeth-lora

## Resumen

rh-elizabeth-lora es un adaptador LoRA de edicion de imagen publicado por RunningHubAI (RunningHub) en nombre del autor identificado como @VIN GO. Se distribuye como un unico fichero safetensors de 224 MiB (`Elizabeth_c1-st6000.safetensors`) y esta pensado para cargarse en flujos de ComfyUI, en la plataforma RunningHub o desde Hugging Face. La model card lo declara como un LoRA de edicion de imagen afinado a partir de `krea2` y activado mediante la palabra clave "Elizabeth".

El modelo no es un modelo de lenguaje ni un modelo base autonomo: es un adaptador de bajo rango que modifica el comportamiento de un modelo de difusion subyacente para reproducir un personaje o estilo concreto. Su relevancia practica esta en la personalizacion de personajes con consistencia entre generaciones, un caso de uso muy extendido en produccion grafica, ilustracion y creacion de contenido.

La informacion publicada es muy escasa: no se documentan parametros, dataset, licencia, idiomas, benchmarks ni requisitos de hardware. El repositorio acumulaba 0 descargas y 0 likes en el momento de la consulta, con un tamano total de 0,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre un modelo de difusion; no se especifica la arquitectura del modelo base) |
| Parametros totales | no disponible (unico fichero de pesos de 224 MiB; no se publica el recuento de parametros) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la ventana de contexto no aplica y depende del modelo base) |
| Tipos de cuantizacion | no disponible (solo se distribuye safetensors; no se documentan variantes FP8, GGUF ni NF4) |
| Idiomas soportados | no disponible (la palabra de activacion es "Elizabeth"; la model card esta en ingles) |
| Licencia | no disponible (la model card indica que se siga la licencia del proyecto original o del modelo base) |
| Formato de pesos | safetensors (`Elizabeth_c1-st6000.safetensors`, 224 MiB) |
| Tipo de artefacto | LoRA de edicion de imagen (image-text-to-image) |
| Modelo base declarado | krea2 |
| Palabra de activacion | Elizabeth |
| Autor | RunningHub - @VIN GO |
| Tamano del repositorio | 0,2 GB |
| Fecha de creacion en el repositorio | 26/09/2026 |
| Ultima actualizacion | 26/09/2026 |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base para ajustar su comportamiento sin reentrenar todos los pesos. La model card indica que el modelo parte de `krea2`, pero no detalla si el adaptador se aplica sobre modulos de atencion, sobre proyecciones lineales o sobre ambos, ni el rango, el alpha o la tasa de aprendizaje empleados. Tampoco se especifica si el adaptador esta orientado a la generacion desde cero o a la edicion de una imagen de entrada; la etiqueta de pipeline del repositorio es image-text-to-image.

El nombre del fichero (`Elizabeth_c1-st6000`) sugiere un checkpoint correspondiente al paso 6000 de un entrenamiento, aunque este extremo no se documenta en la informacion disponible. No hay datos sobre el dataset de entrenamiento, el numero de imagenes, el numero de pasos totales, el uso de regularizacion, ni sobre tecnicas de alineacion como RLHF o DPO, que en el caso de modelos de difusion se sustituirian por tecnicas de ajuste con preferencias humanas no mencionadas. RunningHub ofrece un servicio de entrenamiento propio, lo que apunta a que este adaptador se genero con esa infraestructura.

## Capacidades

- Personalizacion de personaje: reproduce la identidad visual asociada a la palabra de activacion "Elizabeth" en imagenes generadas o editadas.
- Edicion de imagen guiada por texto, segun la etiqueta de pipeline image-text-to-image del repositorio.
- Integracion en flujos de ComfyUI como nodo de carga de LoRA sobre un modelo base compatible.
- Uso mediante la plataforma RunningHub, que permite ejecutarlo sin montar infraestructura propia.
- Composicion con otros LoRA y con el modelo base `krea2`, sujeto a la compatibilidad de pesos no documentada.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica (no es un modelo de lenguaje).
- Capacidades multilingues: no disponible (no se documentan idiomas de prompt).
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Consistencia de personaje en series ilustradas: el adaptador permite generar varias ilustraciones del mismo personaje manteniendo rasgos reconocibles, lo que resulta util para libros infantiles, comics o webcomics con produccion continua.
- Creacion de avatares y retratos personalizados: en un flujo de ComfyUI se puede combinar el LoRA con un prompt de iluminacion y encuadre para producir variaciones de retrato de un mismo personaje para perfiles o material promocional.
- Edicion de imagenes existentes con identidad fija: sobre el pipeline image-text-to-image, aplicar el adaptador permite retocar o reestilizar una imagen conservando la identidad del personaje definido por "Elizabeth".
- Direccion de arte para previsualizacion: estudio de variaciones de vestuario, iluminacion y escenario de un personaje antes de encargar el trabajo final a un ilustrador, reduciendo el coste de las iteraciones iniciales.
- Storyboards y material de pitch: generacion rapida de secuencias con un personaje estable para presentar una idea a un cliente o a un equipo de produccion.
- Prototipado de merchandising: simulaciones de camisetas, posteres o vinilos con el personaje antes de validar el diseno con fabricantes.
- Aumento de datos para otros entrenamientos: generar un conjunto de imagenes etiquetadas del personaje para entrenar clasificadores o para alimentar posteriores ajustes de LoRA con mayor variedad.
- Demostraciones y pruebas de concepto de la plataforma RunningHub: al estar publicado en Hugging Face y en RunningHub, sirve como ejemplo reproducible de un flujo LoRA de personaje de extremo a extremo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, similitud de identidad ni comparaciones con otros adaptadores), y el repositorio no dispone de una seccion de evaluacion. Tampoco se documentan tiempos de inferencia, pasos de muestreo recomendados ni el peso ideal del adaptador dentro del prompt.

## Requisitos de hardware

- El adaptador en si pesa 224 MiB, por lo que el requisito dominante de VRAM es el del modelo base `krea2`, cuyos parametros y consumo no se documentan en la informacion disponible.
- VRAM estimada para inferencia: no disponible (depende por completo del modelo base y de la precision de carga).
- GPU recomendadas: no disponible; no hay recomendaciones publicadas por el autor.
- Viabilidad en GPU de consumo: no verificable con los datos disponibles; dependera de si el modelo base cabe en la VRAM de la GPU objetivo.
- Opciones de despliegue documentadas: ComfyUI (etiqueta del repositorio), la plataforma RunningHub (ejecucion en la nube) y la carga directa de safetensors desde Hugging Face.
- Opciones de despliegue no documentadas: vLLM no aplica (no es un modelo de lenguaje), y no se mencionan llama.cpp, Ollama, TGI ni Diffusers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparacion se realiza con adaptadores publicados por el mismo autor o alojados en la misma plataforma, localizados a traves de la busqueda web. No se dispone de datos de rendimiento de ninguno de ellos.

| Modelo | Tipo | Modelo base declarado | Palabra de activacion | Tamano del adaptador | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-elizabeth-lora | LoRA de edicion de imagen | krea2 | Elizabeth | 224 MiB | no disponible | Hugging Face y RunningHub |
| rh-iphone-lora | LoRA de estilo fotografico | no disponible | no disponible | no disponible | no disponible | Hugging Face y RunningHub |
| rh-real-light-and-shadow-texture-lora | LoRA de textura e iluminacion | no disponible | no disponible | no disponible | no disponible | Hugging Face y RunningHub |
| Elizabeth 伊丽傻白 Style - IL (RunningHub, id 2045116553565310978) | LoRA de personaje o estilo | no disponible | no disponible | no disponible | no disponible | RunningHub |
| elizabeth (RunningHub, id 1924419137463119874) | LoRA de personaje | no disponible | no disponible | no disponible | no disponible | RunningHub |

Advertencia: los tres ultimos modelos proceden de resultados de busqueda web y no estan confirmados como equivalentes ni como variantes del mismo personaje; se listan unicamente como referencia de ecosistema.

## Limitaciones y advertencias

- Ausencia total de licencia explicita: la model card remite a la licencia del proyecto original o del modelo base, lo que deja el uso comercial en una situacion juridica indeterminada.
- No se documenta el modelo base `krea2` en detalle, por lo que se desconoce si su licencia permite uso comercial y si el adaptador hereda restricciones adicionales.
- Riesgo de derechos de imagen: el nombre "Elizabeth" y la etiqueta de personaje no permiten determinar si se trata de una persona real o de una obra protegida; conviene verificar los derechos antes de cualquier uso publico.
- Sin informacion sobre el dataset de entrenamiento, es posible que el adaptador reproduzca sesgos de representacion del material original (etnia, complexion, estilo) o sobreajuste una unica apariencia.
- Riesgo de sobreajuste al prompt de activacion: los LoRA de personaje suelen degradar la diversidad de poses, encuadres e iluminacion si se aplican con pesos altos.
- No se documenta el peso recomendado del adaptador ni los pasos de muestreo, por lo que el ajuste fino del flujo queda a cargo del usuario.
- No hay benchmarks, demostraciones comparativas ni ejemplos de salida en la model card.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validacion por parte de la comunidad ni reportes de fallos.
- La informacion sobre idiomas de prompt es inexistente; no puede confirmarse un comportamiento fiable con prompts en castellano.
- No se especifican requisitos de hardware ni compatibilidad con versiones concretas de ComfyUI o de otros runners.
- Al ser un adaptador, cualquier cambio en el modelo base o en las herramientas de carga puede romper la compatibilidad de pesos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-elizabeth-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2099110539590197250
- Pagina del autor en RunningHub (@VIN GO): https://www.runninghub.ai/user-center/2030329718947188738
- Plataforma RunningHub: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Perfil del publicador en Hugging Face: https://huggingface.co/RunningHubAI
- Modelo relacionado del mismo autor (LoRA de estilo iPhone): https://huggingface.co/RunningHubAI/rh-iphone-lora
- Modelo relacionado del mismo autor (LoRA de luz y sombra): https://huggingface.co/RunningHubAI/rh-real-light-and-shadow-texture-lora
- LoRA "elizabeth" en RunningHub (id 1924419137463119874): https://www.runninghub.ai/model/public/1924419137463119874
- LoRA "Elizabeth 伊丽傻白 Style - IL" en RunningHub (id 2045116553565310978): https://www.runninghub.ai/model/public/2045116553565310978
