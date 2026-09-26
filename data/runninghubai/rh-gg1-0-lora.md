# RunningHubAI/rh-gg1.0-lora

## Resumen

rh-gg1.0-lora es un adaptador LoRA para edicion de imagenes publicado por RunningHubAI (RunningHub) en Hugging Face. Segun su model card, esta afinado a partir del modelo base krea2 y su unico artefacto es un archivo de pesos de 218 MiB (`gg_krea2_000002250.safetensors`), lo que lo situa en la categoria de adaptadores ligeros que se cargan sobre un modelo de difusion preentrenado en lugar de sustituirlo.

El modelo resuelve el problema clasico de personalizar el comportamiento de un generador de imagenes sin reentrenar el modelo completo: al tratarse de un LoRA, se inyecta en un flujo de trabajo de ComfyUI y modifica el estilo o el comportamiento de edicion del modelo base con un coste de almacenamiento minimo. Esta etiquetado con el pipeline `image-text-to-image`, es decir, edicion de imagen guiada por texto (imagen de entrada mas prompt de instrucciones).

La relevancia practica del repositorio es limitada por la escasez de documentacion: no declara licencia, no publica resultados de benchmarks, no especifica el dataset de entrenamiento ni la palabra de activacion, y acumula cero descargas y cero valoraciones. Se trata, por tanto, de un artefacto orientado al ecosistema RunningHub/ComfyUI mas que a un uso generico bien documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre un modelo de difusion; modelo base declarado: krea2) |
| Parametros totales | no disponible (peso del archivo LoRA: 218 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusion; sin ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors sin cuantizar; las opciones dependen del modelo base y del runtime) |
| Idiomas soportados | no disponible; la model card se ofrece en ingles y en chino (`README_cn.md`) |
| Licencia | no disponible; la model card indica "follow the original project or upstream license", con copyright del autor |
| Formato de pesos | safetensors (`gg_krea2_000002250.safetensors`, 218 MiB, marcado como LoRA weights) |

Datos adicionales del repositorio: identificador `RunningHubAI/rh-gg1.0-lora`, pipeline `image-text-to-image`, tamano del repo 0.2 GB, 0 descargas, 0 likes, creado el 2026-09-26 y actualizado el 2026-09-26.

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente pesos de tipo LoRA (low-rank adaptation): un conjunto de matrices de bajo rango que se acoplan a las capas de un modelo de difusion preentrenado para modificar su comportamiento sin alterar sus pesos originales. El autor declara como base el modelo krea2. El nombre del archivo, `gg_krea2_000002250`, sugiere un identificador de paso o version de entrenamiento, pero no se aporta ninguna informacion adicional al respecto en la model card.

No hay datos disponibles sobre el numero de imagenes de entrenamiento, la composicion del dataset, la resolucion de entrenamiento, el rango del LoRA, el learning rate, la palabra de activacion ni si se aplicaron tecnicas de regularizacion o de refuerzo. Tampoco se documenta ninguna innovacion tecnica (decodificacion especulativa, atencion lineal u otras), lo cual es coherente con la naturaleza de adaptador del artefacto. La model card unicamente remite a las herramientas de entrenamiento de RunningHub como via para reproducir el proceso.

## Capacidades

- Edicion de imagenes guiada por texto: pipeline declarado `image-text-to-image`, es decir, recibe una imagen de entrada y un prompt y produce una imagen editada.
- Aplicacion de estilo o comportamiento aprendido sobre el modelo base krea2 mediante inyeccion LoRA.
- Integracion nativa en flujos de ComfyUI (etiqueta `comfyui` declarada por el autor).
- Carga y ejecucion en la plataforma RunningHub (version internacional y version China).
- Distribucion como un unico archivo safetensors de 218 MiB, lo que facilita su intercambio y versionado.
- Sin capacidades de generacion de texto, razonamiento, codigo, matematicas ni vision comprensiva: el artefacto es un adaptador de imagen, no un modelo de lenguaje.
- Soporte de tool calling / function calling: no disponible (no aplica).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingues: no disponibles; el comportamiento ante prompts en distintos idiomas depende del modelo base y no esta documentado.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Edicion de fotografia de producto en e-commerce: cargar el LoRA sobre krea2 en ComfyUI y aplicar un prompt de instrucciones para homogeneizar fondo, iluminacion y estilo entre cientos de referencias de catalogo, aprovechando que el adaptador ocupa solo 218 MiB y no requiere reentrenar el modelo base.
- Retoque por lotes en flujos automatizados: integrar el nodo LoRA en un grafo de ComfyUI que procese una carpeta de imagenes y aplique consistentemente el mismo tratamiento de estilo, ya que la naturaleza del adaptador garantiza un efecto uniforme sin variabilidad de pesos.
- Transferencia de estilo para marketing: generar variantes visuales de una campana manteniendo la composicion de la imagen original y modificando unicamente la estetica, un caso de uso directo del pipeline `image-text-to-image`.
- Iteracion rapida de conceptos en diseno grafico: probar el estilo aprendido sobre bocetos o renders previos antes de decidir una linea visual, sustituyendo el LoRA por otro adaptador en el mismo grafo de ComfyUI sin tocar el modelo base.
- Visualizacion arquitectonica y de interiores: aplicar el tratamiento aprendido a renders previos para explorar acabados o ambientaciones, manteniendo intacta la geometria de la imagen de entrada.
- Preprocesado de datasets de imagen: usar el adaptador para normalizar el aspecto de un conjunto de imagenes antes de alimentar otro entrenamiento, dado su bajo coste de almacenamiento y su capacidad de encadenarse en un pipeline mayor.
- Automatizacion por API en produccion: desplegar el flujo en RunningHub y consumirlo desde la API del proveedor para tareas de edicion bajo demanda, sin necesidad de gestionar infraestructura GPU propia.
- Prototipado en local con GPU de consumo: al ser un LoRA, el requisito de VRAM adicional es minimo frente al del modelo base, por lo que resulta adecuado para entornos de prueba en equipos de gama alta para consumidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio contiene unicamente el adaptador LoRA (218 MiB). El requisito real de VRAM lo determina el modelo base krea2, cuyo tamano no se especifica en la informacion disponible.
- VRAM estimada para inferencia: no disponible. La ficha no puede calcularse sin conocer la arquitectura y el tamano del modelo base.
- GPU recomendadas: no disponible para este modelo concreto. Como referencia general de despliegue de modelos de difusion para edicion de imagen, se suelen emplear GPU de centro de datos (A100, H100) y GPU de consumo de gama alta (RTX 4090, 24 GB) o de gama media-alta (RTX 3060 12 GB, RTX 4070 Ti), pero esta indicacion es orientativa y no procede de la documentacion del autor.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; depende enteramente del modelo base y de la precision de carga.
- Opciones de despliegue documentadas: ComfyUI y la plataforma RunningHub (internacional y China), incluida su API. El autor no menciona soporte explicito para vLLM, llama.cpp, Ollama ni TGI, herramientas por otra parte orientadas a modelos de lenguaje y no aplicables a este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento, tamano ni licencia de este adaptador ni de alternativas comparables, por lo que no es posible establecer una comparacion con numeros verificables. Como referencia estructural, un LoRA de este tipo es comparable a otros adaptadores de la misma familia (por ejemplo, adaptadores derivados del mismo modelo base krea2 publicados por otros autores), pero no se dispone de datos de ninguno de ellos en la informacion consultada.

## Limitaciones y advertencias

- Licencia no declarada: la model card remite a "the original project or upstream license" sin concretar cual es, lo que impide determinar con certeza si el uso comercial esta permitido. Es un riesgo juridico relevante para produccion.
- Dependencia del modelo base: el adaptador no es autonomo; su comportamiento, su licencia efectiva y sus limitaciones quedan supeditados a krea2, cuyo licenciamiento no se detalla.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad, fidelidad de edicion ni robustez frente a prompts diversos.
- Documentacion minima: no se especifican palabra de activacion, rango del LoRA, escala de aplicacion recomendada ni dataset de entrenamiento, parametros necesarios para reproducir resultados.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede introducir o eliminar elementos no solicitados en la imagen de entrada, especialmente en ediciones con prompts ambiguos.
- Sesgos: no documentados. Al heredar el comportamiento del modelo base, es esperable que reproduzca los sesgos presentes en los datos de entrenamiento de este, pero no hay informacion al respecto.
- Limitaciones de idioma: no se declara que idiomas entiende el modelo; la respuesta a prompts en castellano es desconocida y depende del modelo base.
- Adopcion nula: cero descargas y cero valoraciones en el momento de redactar esta ficha, lo que implica ausencia de validacion por parte de la comunidad.
- Fechas del repositorio anormalmente futuras (creacion y actualizacion en 2026-09-26), dato que conviene contrastar antes de tratarlo como referencia temporal fiable.
- Los resultados de la busqueda web realizada no aportan informacion tecnica sobre este modelo; los enlaces encontrados corresponden a un servicio de streaming sin relacion con el artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-gg1.0-lora
- Proyecto original en RunningHub: https://www.runninghub.ai/model/public/2089386476604862465
- Perfil del autor en RunningHub (yang you): https://www.runninghub.ai/user-center/2066883782916788226
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Ejemplo de llamada a la API (Seedance 2.5): https://www.runninghub.ai/call-api/api-detail/2133100000000700025
- Version en chino de la model card: README_cn.md dentro del repositorio
