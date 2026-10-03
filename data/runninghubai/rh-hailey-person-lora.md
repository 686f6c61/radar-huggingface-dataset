# RunningHubAI/rh-hailey-person-lora

## Resumen

rh-hailey-person-lora es un adaptador de bajo rango (LoRA) orientado a la edicion y generacion de imagenes con identidad de personaje, publicado por la cuenta RunningHubAI en Hugging Face y atribuido en la model card al usuario @wwwwq. El adaptador esta afinado a partir del modelo base krea2 y se distribuye como un unico fichero de pesos de 224 MiB, con la palabra de activacion (trigger word) `hailey_person`. Su proposito es trasladar de forma consistente la apariencia de un sujeto concreto (la "persona Hailey") a nuevas generaciones y ediciones de imagen, sin necesidad de reentrenar el modelo base.

Se trata de un modelo de la categoria image-text-to-image, integrado en el ecosistema ComfyUI y en la plataforma RunningHub, que ofrece entrenamiento y ejecucion de LoRA sin infraestructura propia. El repositorio ocupa 0,2 GB (principalmente el fichero safetensors) y no registra descargas ni "likes" en el momento de redactar esta ficha, lo que indica que es una publicacion muy reciente y practicamente sin validacion externa.

Por su naturaleza de LoRA, no es un modelo autonomo: requiere cargarse sobre krea2 (o sobre la version concreta de ese modelo base compatible) para funcionar. La informacion publica es escasa y no incluye datos de entrenamiento, licencia explicita ni resultados de evaluacion, por lo que su adopcion en produccion exige verificar primero la licencia del modelo base subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base krea2; arquitectura del backbone no disponible |
| Parametros totales | no disponible (el fichero pesa 224 MiB; el rango y numero de parametros del LoRA no se especifican) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a un modelo de imagen) |
| Tipos de cuantizacion | no disponible; se distribuye pesos en safetensors sin indicacion de cuantizaciones adicionales |
| Idiomas soportados | no disponibles (las instrucciones de texto dependen del codificador de texto del modelo base) |
| Licencia | no disponible; publicado por RunningHub en nombre del autor, con copyright del autor y remision a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (fichero `hailey_person_v1_c1-st2000.safetensors`, 224 MiB) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, una tecnica de ajuste eficiente en parametros que congela el modelo base e inyecta matrices de bajo rango en determinadas capas. En este caso el modelo base es krea2, segun la propia model card ("Finetuned from: krea2"). No se dispone de informacion sobre el rango del LoRA, las capas objetivo, la resolucion de entrenamiento, el numero de pasos, el tamano del dataset ni la composicion de las imagenes de entrenamiento.

El nombre del fichero (`hailey_person_v1_c1-st2000`) sugiere un checkpoint correspondiente al paso 2000 de un entrenamiento (el sufijo "st2000"), pero esta interpretacion es inferida del nombre y no esta confirmada en la documentacion. No hay constancia de uso de RLHF, DPO ni de tecnicas de refinamiento especificas, ni de innovaciones tecnicas destacables mas alla del propio ajuste LoRA.

## Capacidades

- Generacion y edicion de imagenes condicionadas por texto e imagen (pipeline image-text-to-image): el adaptador permite introducir la identidad del sujeto `hailey_person` en nuevas composiciones.
- Personalizacion de personaje: aplica una identidad concreta de forma consistente sobre el modelo base krea2.
- Integracion en ComfyUI: los tags indican compatibilidad con flujos de trabajo de ComfyUI.
- Ejecucion gestionada en RunningHub: la model card enlaza a entrenamiento y ejecucion en la plataforma RunningHub.
- Tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no disponibles; dependen del codificador de texto del modelo base krea2.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Generacion de retratos de personaje consistente: cargando el LoRA sobre krea2 con la trigger word `hailey_person`, se pueden producir multiples imagenes del mismo sujeto en poses y escenas distintas, util para creadores de contenido que necesitan coherencia de identidad entre piezas.
- Ilustracion editorial y narrativa serializada: permite mantener el mismo personaje a lo largo de varias ilustraciones de un comic, cuento o storyboard, reduciendo la deriva de identidad entre viñetas.
- Edicion de imagen (image edit): dado que el pipeline es image-text-to-image, el adaptador puede emplearse para retocar o transformar fotografias existentes introduciendo o modificando la identidad del sujeto.
- Prototipado de personajes para videojuegos o animacion: generar conceptos y variaciones del personaje en la fase de preproduccion antes de modelar en 3D.
- Avatares y material para redes sociales: produccion rapida de imagenes de perfil o contenido visual con una identidad fija sin sesiones fotograficas.
- Flujos automatizados en ComfyUI: encadenar el LoRA dentro de un grafo de ComfyUI para generar lotes de imagenes por lotes o combinarlo con otros nodos de control (pose, profundidad, etc.).
- Experimentacion e investigacion en LoRA de personaje: sirve como caso de estudio para comparar tecnicas de personalizacion sobre el modelo base krea2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El propio adaptador LoRA ocupa solo 224 MiB, por lo que su impacto en VRAM es marginal; los requisitos reales vienen determinados por el modelo base krea2, que no se detalla en la informacion proporcionada.
- VRAM estimada: no disponible para el modelo base krea2; en general, un modelo de difusion de este tipo suele requerir entre 8 y 24 GB de VRAM segun precision y resolucion, pero este dato no esta confirmado para krea2 en la informacion disponible.
- GPU recomendadas: no disponible. Como referencia de categoria, las GPU de consumo de gama alta (por ejemplo RTX 3090, RTX 4090) suelen ser suficientes para modelos de difusion con cuantizacion, pero no hay confirmacion especifica.
- Si cabe en GPU de consumo: no disponible de forma confirmada.
- Opciones de despliegue: ComfyUI (indicado en los tags), RunningHub (plataforma del autor) y Hugging Face. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables a este LoRA).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos sobre modelos directamente comparables en la informacion proporcionada (parametros, contexto, rendimiento o licencia de alternativas de personalizacion de personaje sobre krea2). Dentro del mismo repositorio de RunningHubAI existen otros adaptadores LoRA (por ejemplo, `rh-ai-lora`), pero no hay informacion suficiente para establecer una comparacion tecnica rigurosa. Por tanto: no disponible.

## Limitaciones y advertencias

- Licencia no disponible: la model card remite a la licencia del proyecto original o upstream y mantiene el copyright del autor, por lo que el uso comercial no puede darse por supuesto y debe verificarse antes de cualquier despliegue en produccion.
- Dependencia del modelo base krea2: el LoRA no funciona de forma autonoma y su comportamiento depende por completo de dicho modelo base y de su propia licencia.
- Sesgos conocidos: no disponibles, pero al ser un adaptador de identidad de personaje, puede reproducir sesgos de representacion del dataset de entrenamiento (no documentado).
- Riesgo de alucinacion: en modelos generativos de imagen el equivalente es la generacion de artefactos, deformaciones anatomicas o resultados inconsistentes con la identidad pretendida, especialmente en poses o resoluciones no vistas durante el entrenamiento.
- Sin documentacion de entrenamiento: no se especifican pasos, dataset, rango del LoRA ni parametros de entrenamiento, lo que dificulta reproducir o auditar el resultado.
- Sin adopcion verificable: 0 descargas y 0 "likes" en el momento de la consulta, sin evaluaciones independientes publicadas.
- Limitaciones de idioma: no disponibles; dependen del codificador de texto del modelo base.
- Nombre de fichero como unica pista del entrenamiento: el sufijo `st2000` sugiere el paso 2000, pero no esta confirmado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-hailey-person-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2106388327405559810
- Pagina del autor (@wwwwq): https://www.runninghub.ai/user-center/2084559357706317825
- Plataforma RunningHub (internacional): https://www.runninghub.ai
- Plataforma RunningHub (China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Listado de modelos de RunningHubAI en Hugging Face: https://huggingface.co/RunningHubAI/models
