# RunningHubAI/rh-ltx-2-19b-ic-lora-depth-control.safetensors-lora

## Resumen

`rh-ltx-2-19b-ic-lora-depth-control.safetensors-lora` es un adaptador LoRA publicado por RunningHubAI para el modelo LTX-2 de 19B parametros, orientado al control por profundidad (*depth control*) en generacion de video. El repositorio distribuye un unico fichero de pesos, `ltx-2-19b-ic-lora-depth-control.safetensors`, de 624 MiB, que se carga sobre el modelo base para condicionar la generacion a partir de mapas de profundidad. El autor del entrenamiento figura como [@十字鱼](https://www.runninghub.cn/user-center/1931247775575351297) y la publicacion se realiza a traves de la plataforma RunningHub.

El objetivo del adaptador es anadir una senal de control estructural al pipeline de generacion: en lugar de depender unicamente de un prompt de texto, el LoRA permite guiar la sintesis de video con informacion de profundidad, lo que resulta util para mantener la coherencia geometrica entre fotogramas y para reproducir movimientos o composiciones espaciales concretas. La denominacion "ic" (in-context) sugiere un esquema de condicionamiento en contexto, habitual en los LoRA de control para modelos de difusion.

Se trata de un repositorio muy reciente (creado el 21 de septiembre de 2026) con cero descargas y cero likes en el momento de la consulta, y su model card es minima: no incluye datos de arquitectura, dataset de entrenamiento, benchmarks ni licencia explicita. Cualquier evaluacion en produccion deberia completarse consultando el proyecto original y la licencia del modelo base LTX-2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Es un adaptador LoRA (Low-Rank Adaptation) para el modelo base LTX-2 de 19B; la arquitectura del modelo base no se detalla en la informacion proporcionada |
| Parametros totales | No disponible (no se indica el numero de parametros del adaptador; el fichero de pesos ocupa 624 MiB) |
| Parametros activos | No aplica (no hay indicios de que el modelo base sea un MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. Los pesos se distribuyen en safetensors; no se documentan variantes cuantizadas |
| Idiomas soportados | No disponible |
| Licencia | No disponible. La model card indica que se sigue la licencia del proyecto original o upstream, y que el copyright permanece en el autor |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura del modelo base ni la del adaptador. Por la nomenclatura del repositorio (`ltx-2-19b-ic-lora-depth-control`), se trata de un LoRA de control por profundidad sobre un modelo de 19B parametros identificado como LTX-2, integrable en flujos de trabajo de ComfyUI. No se especifica si el entrenamiento se realizo sobre un transformer de difusion, un modelo hibrido o cualquier otra topologia, ni se detalla el numero de tokens o fotogramas utilizados.

Tampoco hay informacion sobre el dataset de entrenamiento, la composicion de los datos, el uso de tecnicas de alineacion (RLHF, DPO), el rango del LoRA, el alpha, las capas objetivo ni hiperparametros de entrenamiento. La model card unicamente indica que el modelo se puede entrenar y cargar en la plataforma RunningHub y que el adaptador esta pensado para su uso en ComfyUI, RunningHub y Hugging Face.

## Capacidades

- Condicionamiento por profundidad: el adaptador anade control estructural mediante mapas de profundidad sobre el modelo base LTX-2 de 19B, segun la propia denominacion del repositorio.
- Generacion de video guiada: al ser un LoRA de control, su funcion es modificar el comportamiento del modelo base durante la inferencia; no es un modelo autonomo y no genera salida por si mismo.
- Integracion en ComfyUI: la etiqueta `comfyui` y las plataformas declaradas indican compatibilidad con flujos de trabajo de nodos de ComfyUI.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica (modelo de generacion de video).
- Capacidades multilingues: no disponible.
- Capacidades especiales: control por profundidad; no se documentan modos de pensamiento, vision, audio ni otras capacidades.

## Casos de uso

- Generacion de video con estructura controlada: se carga el LoRA sobre LTX-2 en ComfyUI y se introduce un mapa de profundidad como condicion, de modo que la composicion espacial de la escena quede fijada mientras el prompt define el estilo y los materiales.
- Previsualizacion y *previz* de planos: a partir de una captura de profundidad de un previz 3D, el adaptador permite generar una version estilizada del plano, util para presentar propuestas visuales antes de rodar o animar.
- Transferencia de movimiento y camara: al condicionar por profundidad, es posible reproducir la trayectoria de camara de una secuencia de referencia sobre una escena nueva generada con el modelo base.
- Animacion de storyboards: un storyboard con informacion de profundidad por plano puede convertirse en clips animados coherentes, manteniendo la geometria prevista por el director de arte.
- Efectos y *clean plates*: en postproduccion, el control por profundidad ayuda a generar elementos que respeten la oclusion y la distancia relativa de los objetos de la escena original.
- Prototipado rapido de escenas para publicidad: los equipos pueden iterar composiciones espaciales sin rehacer el encuadre, cambiando unicamente el prompt de estilo sobre el mismo mapa de profundidad.
- Investigacion en control condicionado: el adaptador sirve como punto de partida para estudiar como influye una senal geometrica densa en la coherencia temporal de un modelo de video de 19B.
- Automatizacion en la nube: dado que RunningHub ofrece API y despliegue en su plataforma, el flujo puede integrarse en pipelines automatizados de generacion por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FVD, CLIP-score, similitud estructural, consistencia temporal ni comparativas con otros adaptadores de control).

## Requisitos de hardware

Las cifras de VRAM que se indican a continuacion son estimaciones derivadas del tamano declarado del modelo base (19B parametros) y no proceden de mediciones publicadas por el autor; deben tratarse como orientativas.

- VRAM estimada por el modelo base: en bf16/fp16, unos 38 GB solo para los pesos del modelo de 19B, mas el coste de activaciones, atencion temporal y VAE, lo que en la practica exige GPUs de 48-80 GB.
- VRAM estimada en fp8: en torno a 19-20 GB para los pesos, con overhead adicional de inferencia de video; probablemente requiere 32-48 GB para operar con comodidad.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 10-12 GB para los pesos, lo que dejaria el adaptador al alcance de GPUs consumer de gama alta, siempre que el resto del pipeline (VAE, decodificacion de fotogramas) quepa en memoria.
- GPUs recomendadas: no disponibles en la informacion proporcionada. Por tamano del modelo base, el rango objetivo serian aceleradores de clase A100 80 GB o H100; en consumer, una RTX 4090 (24 GB) o comparable, con cuantizacion agresiva.
- Compatibilidad con GPU consumer: no confirmada por el autor. El adaptador en si ocupa 624 MiB, pero el cuello de botella es el modelo base.
- Opciones de despliegue: ComfyUI y la plataforma RunningHub (tanto en su version internacional como en la china). No se documenta soporte oficial para vLLM, llama.cpp, Ollama ni TGI, que ademas no son herramientas orientadas a este tipo de adaptadores de difusion.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. La model card no referencia alternativas ni publica metricas que permitan una comparacion objetiva con otros adaptadores de control por profundidad. A modo de contexto, la unica referencia disponible es el propio modelo base y su ecosistema:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| rh-ltx-2-19b-ic-lora-depth-control | No disponible (LoRA de 624 MiB) | No disponible | No disponible (sigue la del proyecto upstream) | Hugging Face, ComfyUI, RunningHub |
| LTX-2 19B (modelo base) | 19B (segun nomenclatura del repositorio) | No disponible | No disponible | No confirmado en la informacion proporcionada |
| Otros adaptadores de control por profundidad | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo base LTX-2 de 19B y un entorno compatible (ComfyUI o RunningHub) para producir resultados.
- Ausencia de documentacion: la model card no describe el dataset, el procedimiento de entrenamiento, el rango del LoRA ni los hiperparametros, lo que dificulta reproducir o auditar el adaptador.
- Licencia no declarada: la model card remite a la licencia del proyecto original o upstream. Antes de un uso comercial es imprescindible verificar la licencia de LTX-2 y las condiciones de la plataforma RunningHub, ya que el repositorio no concede permisos explicitos.
- Riesgo de alucinacion visual: como cualquier modelo generativo sobre condicionamiento estructural, puede producir geometrias incoherentes o artefactos cuando el mapa de profundidad es ambiguo o poco denso. No hay evaluaciones publicadas que cuantifiquen este riesgo.
- Sesgos: no disponibles. No se documenta la composicion del dataset de entrenamiento, por lo que no puede evaluarse el sesgo demografico, cultural o de dominio.
- Limitaciones de idioma: no disponibles. El comportamiento multilingue dependera del codificador de texto del modelo base.
- Adopcion nula: con cero descargas y cero likes en el momento de la consulta, no existe validacion comunitaria ni informes de terceros sobre su funcionamiento.
- Fecha de publicacion: el repositorio figura creado y actualizado en septiembre de 2026, con muy pocos minutos entre ambos eventos, lo que sugiere una subida automatizada y sin curacion posterior.
- Advertencia sobre la busqueda web: los resultados de busqueda asociados no contienen informacion tecnica relevante sobre este modelo, por lo que no ha sido posible contrastar ni ampliar los datos de la model card.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-ltx-2-19b-ic-lora-depth-control.safetensors-lora
- Proyecto original del modelo: https://www.runninghub.cn/model/public/2008453722132717570
- Pagina del autor: https://www.runninghub.cn/user-center/1931247775575351297
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API de RunningHub: https://www.runninghub.cn/runninghub-api-doc-en/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
