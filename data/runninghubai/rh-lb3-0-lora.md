# RunningHubAI/rh-lb3.0-lora

## Resumen

rh-lb3.0-lora es un adaptador LoRA orientado a edicion de imagen (image edit) publicado por RunningHubAI, la organizacion de la plataforma RunningHub. No se trata de un modelo de lenguaje ni de un modelo fundacional completo, sino de un fichero de pesos adicionales que se carga sobre un modelo base de difusion para modificar su comportamiento de generacion o edicion a partir de una imagen y un prompt de texto. La model card indica que el adaptador esta afinado a partir de "krea2", aunque no detalla la arquitectura exacta del backbone ni el procedimiento de entrenamiento seguido.

El unico artefacto incluido en el repositorio es `lb_krea2.safetensors`, de 218 MiB, con un peso total de repositorio de 0,2 GB. El pipeline declarado es image-text-to-image y las plataformas de uso previstas son ComfyUI, la propia nube de RunningHub y Hugging Face. El modelo se publico el 26 de septiembre de 2026 y, en el momento de redactar esta ficha, acumula 0 descargas y 0 likes, por lo que no existe validacion comunitaria documentada.

Su relevancia es limitada y muy acotada: sirve para quien ya trabaje con el modelo base krea2 en un flujo de ComfyUI y quiera aplicar un estilo o comportamiento de edicion concreto. No hay informacion publica sobre el conjunto de datos de entrenamiento, el rango del LoRA, los resultados cualitativos ni las condiciones de licencia, lo que obliga a tratarlo como un recurso experimental y a verificar su comportamiento antes de integrarlo en cualquier pipeline de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card solo indica "finetuned from: krea2"; no se detalla el backbone subyacente) |
| Parametros totales | no disponible (el adaptador ocupa 218 MiB en disco, pero no se especifica el numero de parametros ni el rango del LoRA) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de difusion para imagen; no expone ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (se distribuye un unico fichero safetensors sin variantes cuantizadas) |
| Idiomas soportados | no disponible (el prompt textual depende del codificador de texto del modelo base krea2) |
| Licencia | no disponible (la model card remite a "the original project or upstream license" y mantiene el copyright del autor) |
| Formato de pesos | safetensors |
| Tipo de modelo | LoRA para image edit (image-text-to-image) |
| Modelo base | krea2 |
| Fichero principal | `lb_krea2.safetensors` (218 MiB) |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |
| Fecha de publicacion | 26 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica sobre la arquitectura interna del adaptador. La model card unicamente declara que es un LoRA de edicion de imagen afinado desde "krea2" y que su integracion esta pensada para ComfyUI, RunningHub y Hugging Face. No se indica el rango de las matrices de bajo rango, las capas objetivo (attention, cross-attention, MLP), el tipo de precision de entrenamiento ni si se aplicaron tecnicas adicionales como LoRA con descomposicion, DoRA o adaptadores de estilo.

Tampoco hay datos sobre el entrenamiento: no se especifica el numero de imagenes o pasos, la composicion del dataset, el uso de imagenes con permisos de uso comercial, ni si hubo una fase de ajuste con preferencias humanas. El enlace a "Train at RunningHub" sugiere que el modelo se entreno con las herramientas de la propia plataforma, pero no se aporta ninguna metrica de convergencia ni evaluacion. Cualquier afirmacion sobre innovaciones tecnicas (por ejemplo, atencion lineal o decodificacion especulativa) seria especulativa y no se incluye en esta ficha.

## Capacidades

- Edicion de imagen guiada por texto e imagen: el pipeline declarado es image-text-to-image, por lo que el adaptador esta pensado para modificar una imagen de entrada siguiendo instrucciones textuales.
- Aplicacion de estilo o de un comportamiento de edicion concreto sobre el modelo base krea2, presumiblemente aprendido durante el ajuste fino.
- Integracion directa en flujos de ComfyUI como nodo de carga de LoRA sobre el modelo base correspondiente.
- Uso en la nube de RunningHub, donde el autor publica el modelo original y ofrece entrenamiento de modelos.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso: son capacidades de modelos de lenguaje que no aplican a este tipo de artefacto.
- No se documentan capacidades de vision semantica, audio, video ni modo "thinking". La unica entrada visual esperada es la imagen a editar.
- Capacidades multilingues: no documentadas. El idioma efectivo de los prompts dependera del codificador de texto del modelo base, no del LoRA.

## Casos de uso

- Edicion de imagenes por lotes en un flujo de ComfyUI: cargando `lb_krea2.safetensors` sobre krea2 y encadenando un nodo de edicion, se puede aplicar un mismo cambio (restilizado, retoque de fondo, ajuste de iluminacion) a un conjunto de imagenes de forma reproducible mediante API o cola de trabajos.
- Prototipado visual en estudios de diseno: el adaptador permite explorar variaciones de una imagen de referencia sin reentrenar el modelo base, reduciendo el tiempo de iteracion frente a un ajuste completo.
- Creacion de contenido para marketing y redes sociales: generacion de variantes de una imagen corporativa o de producto manteniendo una estetica consistente, siempre que se disponga de derechos sobre las imagenes de entrada y del modelo base.
- Retoque fotografico asistido: modificar elementos concretos de una fotografia a partir de una instruccion de texto, integr andolo como paso previo o posterior a una herramienta de retoque tradicional.
- Generacion de recursos para videojuegos o ilustracion: producir assets de estilo homogeneo a partir de bocetos o referencias, reutilizando el mismo LoRA para mantener coherencia visual entre piezas.
- Servicio de edicion de imagen bajo API: desplegar el modelo base mas el LoRA en un endpoint propio (por ejemplo, sobre infraestructura con GPU) y ofrecer edicion de imagenes a terceros, con la salvedad de que la licencia no esta clara.
- Automatizacion de pipelines creativos: encadenar el LoRA con herramientas de upscaling, segmentacion o control de pose dentro de ComfyUI para construir flujos de postproduccion completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, SSIM, LPIPS ni evaluaciones humanas) ni comparaciones cuantitativas con otros adaptadores. Tampoco se documentan tiempos de inferencia, throughput ni consumo de VRAM.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma directa. El LoRA en si anade un consumo minimo de memoria (del orden de cientos de MiB), pero el requisito real lo determina el modelo base krea2, cuyo tamano no se especifica en la informacion proporcionada.
- GPU recomendadas: no disponibles. Dependen del modelo base; en modelos de difusion de imagen de gama similar suelen emplearse GPUs con 12-24 GB de VRAM (por ejemplo, RTX 4090, RTX 3090, A100 o H100), pero esto no se confirma para este caso.
- Compatibilidad con GPU de consumo: no confirmada. Al ser un adaptador pequeno (218 MiB) el cuello de botella sera el modelo base, no el LoRA.
- Opciones de despliegue: ComfyUI es el entorno explicitamente soportado; tambien se menciona RunningHub (nube y API) y Hugging Face como plataforma de alojamiento. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, herramientas orientadas a modelos de lenguaje que no aplican a este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos suficientes para establecer una comparativa cuantitativa fiable. En la misma categoria (adaptadores LoRA para edicion de imagen sobre modelos de difusion) existen numerosos modelos publicados en Hugging Face y Civitai, pero la informacion proporcionada no incluye metricas de ninguno de ellos ni del presente modelo.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-lb3.0-lora (este modelo) | no disponible (218 MiB en disco) | no aplicable | sin benchmarks publicados | no disponible | Hugging Face, RunningHub |
| Otros LoRA de edicion de imagen | no disponible | no aplicable | no disponible | variable segun autor | Hugging Face, Civitai |
| Modelo base krea2 | no disponible | no aplicable | no disponible | la del proyecto original | segun su repositorio original |

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se especifican datos de entrenamiento, rango del LoRA, capas objetivo ni procedimiento de ajuste, lo que impide reproducir o auditar el modelo.
- Licencia no disponible: la model card remite a la licencia del proyecto original o del modelo base y mantiene el copyright del autor, pero no concreta condiciones. No se puede asumir uso comercial sin verificar la licencia de krea2 y del LoRA.
- Dependencia estricta del modelo base: el adaptador solo funciona correctamente sobre krea2. Cargarlo sobre otro backbone puede degradar los resultados o no producir efecto.
- Riesgo de sobreajuste a los datos de entrenamiento: al no publicarse el dataset, no se puede evaluar si el LoRA reproduce estilos, sesgos o elementos concretos de las imagenes usadas en el ajuste.
- Sesgos potenciales: un modelo de generacion de imagen puede perpetuar sesgos de representacion (genero, etnia, edad, corporalidad) heredados del modelo base y del conjunto de entrenamiento. No hay evaluacion publicada al respecto.
- Fidelidad al prompt no garantizada: no existen metricas que indiquen como de bien sigue el adaptador las instrucciones de edicion ni si introduce artefactos.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la publicacion, sin demos comparativas ni imagenes de ejemplo en la model card.
- Idiomas no documentados: no se especifica para que lenguajes de prompt esta optimizado el modelo base, lo que puede afectar a la calidad con instrucciones en castellano.
- Caveat de produccion: cualquier despliegue deberia incluir pruebas A/B contra el modelo base sin el LoRA para verificar que la mejora justifica el coste de integracion y el riesgo legal derivado de la licencia.
- Fecha de publicacion inusual: la model card registra 2026-09-26 como fecha de creacion y actualizacion; conviene confirmar la vigencia del repositorio antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-lb3.0-lora
- Proyecto original en RunningHub: https://www.runninghub.ai/model/public/2094961800650551298
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/2066883782916788226
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Llamada a la API de RunningHub: https://www.runninghub.ai/call-api
- Detalle de API de Seedance 2.5 en RunningHub: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
