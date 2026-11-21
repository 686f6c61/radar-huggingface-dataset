# RunningHubAI/rh-krea2cg-lora

## Resumen

`rh-krea2cg-lora` es un adaptador LoRA de edicion de imagen (image edit) publicado por RunningHub bajo la cuenta RunningHubAI. Se presenta como un ajuste fino (finetune) derivado del modelo base `krea2` y esta pensado para su uso dentro de flujos de trabajo de ComfyUI, la plataforma RunningHub y Hugging Face. El repositorio contiene un unico archivo de pesos en formato safetensors de 224 MiB, lo que es coherente con la naturaleza de un adaptador LoRA y no con un modelo completo.

El modelo esta etiquetado con el pipeline `image-text-to-image`, lo que indica que opera en tareas de generacion o edicion de imagen condicionada por texto. El nombre del archivo de pesos, "Krea2二次元CG角色" (personajes CG de estilo anime de Krea2), sugiere que el adaptador esta orientado a la generacion de personajes con estetica de animacion japonesa y renderizado CG. No obstante, la model card no documenta con detalle el dataset de entrenamiento ni los hiperparametros utilizados.

La relevancia de esta ficha es limitada por la escasez de informacion tecnica publicada: no hay datos de benchmarks, no se especifica la licencia concreta, no se detalla el modelo base exacto sobre el que se aplica el LoRA ni se documentan los idiomas soportados. Es, por tanto, un artefacto de uso practico dentro del ecosistema RunningHub/ComfyUI mas que un modelo con documentacion tecnica exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base `krea2`; arquitectura del modelo base no disponible |
| Parametros totales | no disponible (el archivo de pesos ocupa 224 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors (archivo `Krea2二次元CG角色.safetensors`, 224 MiB) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas de un modelo base para modificar su comportamiento sin reentrenar todos los pesos. La model card indica que el modelo se ha ajustado a partir de `krea2`, pero no especifica la arquitectura de ese modelo base (transformer de difusion, DiT, UNet u otra), ni el numero de parametros del mismo, ni la dimension de rango del adaptador.

No se documentan el numero de tokens o imagenes de entrenamiento, la composicion del dataset, el uso de tecnicas como RLHF/DPO (poco habituales en modelos de imagen) ni innovaciones tecnicas destacables. La unica informacion sobre el proceso es que el entrenamiento se realizo en la plataforma RunningHub, que ofrece servicios de entrenamiento de modelos, y que el adaptador esta pensado para ejecutarse en ComfyUI.

## Capacidades

- Edicion y generacion de imagen condicionada por texto, segun el pipeline declarado `image-text-to-image`.
- Especializacion aparente en personajes de estilo anime/CG, a juzgar por el nombre del archivo de pesos ("二次元CG角色", personajes CG bidimensionales).
- Integracion con ComfyUI mediante carga del archivo safetensors en un nodo de LoRA.
- Compatibilidad con la plataforma RunningHub y su API, segun los enlaces de la model card.
- Soporte de tool calling / function calling: no disponible (no aplica a un LoRA de imagen).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Generacion de personajes anime/CG en produccion de ilustracion: el adaptador se cargaria en ComfyUI junto al modelo base `krea2` para condicionar la salida hacia un estilo de personaje consistente, util para ilustradores que necesitan coherencia estilistica en series de imagenes.
- Creacion de assets para videojuegos o novelas visuales: permite generar retratos y poses de personajes con una estetica homogenea, reduciendo el trabajo manual de retoque entre ilustraciones.
- Prototipado rapido de concept art: al ser un LoRA ligero (224 MiB), se puede intercambiar rapidamente con otros adaptadores en un mismo flujo de ComfyUI para explorar variantes de estilo sin recargar el modelo base.
- Automatizacion via API de RunningHub: la model card enlaza la API de la plataforma, de modo que el adaptador puede invocarse en pipelines programaticos de generacion de imagen bajo demanda.
- Educacion y experimentacion con LoRA: su tamano reducido y su publicacion abierta en Hugging Face lo hacen util para estudiar como un adaptador de bajo rango modifica el comportamiento de un modelo de difusion.
- Integracion en flujos de trabajo de ComfyUI compartidos: al estar etiquetado como `comfyui`, puede incorporarse a grafos de nodos existentes para tareas de edicion de imagen por texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende enteramente del modelo base `krea2`, cuyo tamano y requisitos no se documentan.
- GPU recomendadas: no disponible. Al tratarse de un LoRA, los requisitos vendran determinados por el modelo base sobre el que se aplique.
- Compatibilidad con GPU de consumo: no disponible; no se puede confirmar sin conocer el modelo base.
- Opciones de despliegue: ComfyUI (mencionado explicitamente), plataforma RunningHub y su API. Otros runners (vLLM, llama.cpp, Ollama, TGI) no aplican a un modelo de imagen de este tipo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-krea2cg-lora | LoRA de imagen (base `krea2`) | no disponible (224 MiB de pesos) | no disponible | no disponible | Hugging Face, RunningHub, ComfyUI |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- La model card no especifica la licencia concreta: indica que se debe seguir la licencia del proyecto original o upstream, lo que impide confirmar si el uso comercial esta permitido.
- No se documenta el modelo base exacto (`krea2`) ni sus requisitos, por lo que no se puede garantizar la reproducibilidad del resultado fuera del ecosistema RunningHub/ComfyUI.
- Riesgo de alucinacion y sesgos: no evaluado ni documentado por el autor; al ser un modelo generativo de imagen, puede producir artefactos visuales y reproducir sesgos del dataset de entrenamiento, que no se detalla.
- No hay informacion sobre idiomas soportados en los prompts.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad.
- El nombre del archivo de pesos esta en chino, lo que puede requerir atencion a la codificacion en algunos entornos.
- No se han publicado benchmarks ni evaluaciones cuantitativas de calidad.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-krea2cg-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2091505026867343361
- Pagina del autor: https://www.runninghub.ai/user-center/2085048586185814018
- Flujo de trabajo y aplicacion asociados: https://www.runninghub.ai/zh-cn/post/2091542695756378114
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
