# RunningHubAI/rh-nayru-krea2-nsfw-lora

## Resumen

rh-nayru-krea2-nsfw-lora es un adaptador LoRA de edicion de imagen publicado por RunningHubAI en nombre del autor Nicolas Adduci. Se trata de un ajuste fino (fine-tuning) derivado del modelo base krea2, orientado a la generacion y edicion de imagenes con contenido para adultos (NSFW). El repositorio contiene un unico archivo de pesos en formato safetensors de 218 MiB, lo que es coherente con la naturaleza ligera de un adaptador LoRA frente a un modelo completo.

El modelo se distribuye principalmente para su uso dentro del ecosistema ComfyUI y de la plataforma RunningHub, que ofrece carga, inferencia y entrenamiento alojados. La model card es extremadamente escueta: no detalla arquitectura del modelo base, numero de parametros, longitud de contexto (en el caso de modelos de difusion, resolucion y pasos de muestreo), datos de entrenamiento ni resultados de evaluacion. La etiqueta de pipeline es image-text-to-image, lo que indica que el adaptador opera sobre un modelo generativo de imagen condicionado por texto.

La relevancia de esta ficha es limitada desde el punto de vista de la investigacion abierta: se trata de un artefacto de estilo/dominio para un modelo base propietario o poco documentado, con licencia no disponible y sin benchmarks. Su interes practico se circunscribe a usuarios de ComfyUI o RunningHub que quieran reproducir el estilo o el personaje "Nayru" sobre krea2. No debe confundirse con un modelo de lenguaje: no procesa texto de forma autoregresiva ni tiene ventana de contexto en el sentido habitual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base krea2; arquitectura del base no disponible |
| Parametros totales | no disponible (pesos LoRA de 218 MiB; el modelo base no se distribuye en este repo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica / no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; cuantizacion depende del runtime del base) |
| Idiomas soportados | no disponible (prompts en lenguaje natural; idiomas no declarados) |
| Licencia | no disponible (la model card remite a la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors (`NAYRUKREA2NSFW2000.safetensors`, 218 MiB) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas de un modelo base congelado para modificar su comportamiento sin reentrenar todos los pesos. El modelo base declarado es krea2. La model card no especifica la arquitectura interna de krea2 (si es un UNet, un transformer de difusion tipo DiT, o un modelo hibrido), ni el rango del LoRA, ni sobre que modulos se aplico (attention, cross-attention, MLP).

Tampoco se documentan los datos de entrenamiento: no se indica el numero de imagenes, su composicion, la resolucion, el numero de pasos, la tasa de aprendizaje ni si hubo tecnicas de regularizacion o captioning asistido. No se menciona RLHF, DPO ni preferencias humanas, algo esperable en un adaptador de imagen. La unica innovacion tecnica reseñable es la palabra de activacion (trigger word) "Nayru", que debe incluirse en el prompt para invocar el concepto aprendido. El nombre del archivo (`NAYRUKREA2NSFW2000`) sugiere, sin confirmacion oficial, un entrenamiento con unos 2000 pasos o muestras, pero es una inferencia no verificada.

## Capacidades

- Generacion y edicion de imagen condicionada por texto (pipeline image-text-to-image) sobre el modelo base krea2.
- Inyeccion de un concepto o estilo concreto mediante la trigger word "Nayru".
- Produccion de contenido para adultos (NSFW), segun la etiqueta `not-for-all-audiences` del repositorio.
- Integracion en flujos de trabajo de ComfyUI mediante el nodo de carga de LoRA.
- Ejecucion en la plataforma alojada RunningHub, que permite probar el modelo sin infraestructura propia.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni capacidades de audio o vision analitica; es un adaptador generativo de imagen, no un modelo de lenguaje.

## Casos de uso

- Prototipado de personajes en ComfyUI: cargar el LoRA junto con el checkpoint krea2 y usar la trigger word "Nayru" para generar variaciones consistentes de un personaje en distintas poses y escenas, aprovechando el bajo peso del adaptador (218 MiB) para iterar rapido.
- Ilustracion de contenido adulto para plataformas con verificacion de edad: el adaptador permite producir material NSFW de forma controlada dentro de un pipeline local, sin depender de servicios externos que puedan registrar los prompts.
- Pruebas de concepto en RunningHub: usar la inferencia alojada para evaluar si el estilo del LoRA encaja con un proyecto antes de montar infraestructura propia con el modelo base.
- Composicion de pipelines multi-LoRA: combinar este adaptador con otros LoRA de estilo o de composicion en ComfyUI para obtener un look personalizado, ya que los LoRA se apilan con pesos ajustables.
- Generacion de material de referencia para artistas: servir como base para bocetos o studies de anatomia y vestuario en un contexto de produccion de contenido para adultos.
- Investigacion sobre adaptadores de bajo rango: usar el artefacto como ejemplo practico de fine-tuning sobre un modelo de difusion para estudiar como un LoRA de 218 MiB modifica el espacio latente del base, siempre que se respete la licencia upstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, similitud de concepto) ni comparaciones cuantitativas con otros LoRA.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; depende enteramente del modelo base krea2, cuyos requisitos no se documentan en este repositorio. El adaptador en si solo ocupa 218 MiB en disco y una fraccion adicional en VRAM al cargarse.
- GPU recomendadas: no disponibles para el base. Para modelos de difusion de imagen de tamano comparable, lo habitual es partir de 8-12 GB de VRAM en consumer y 24 GB o mas en GPUs de datacenter (A100, H100) para resoluciones altas o lotes grandes; esta estimacion es generica y no esta confirmada para krea2.
- ¿Cabe en consumer GPU?: probablemente si, en funcion del base y de la cuantizacion aplicada al checkpoint principal; no confirmado.
- Opciones de despliegue: ComfyUI (soporte nativo de LoRA), RunningHub (alojado), y cualquier runtime que cargue el base krea2 y permita aplicar adaptadores safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada LoRA comparables sobre el mismo base krea2 ni adaptadores de la misma categoria con datos verificables de parametros, contexto o rendimiento. Cualquier comparacion cuantitativa seria especulativa.

## Limitaciones y advertencias

- Contenido NSFW: el repositorio esta marcado como `not-for-all-adversaries`/`not-for-all-audiences`; su uso requiere verificacion de edad y cumplimiento de la legislacion aplicable sobre contenido para adultos.
- Licencia no disponible: la model card remite a la licencia del proyecto original o upstream, pero no la especifica. No se puede confirmar el uso comercial sin consultar la licencia de krea2 y del autor.
- Modelo base no incluido: el repositorio solo contiene el adaptador; sin acceso a krea2 el artefacto es inutilizable.
- Documentacion minima: sin datos de entrenamiento, rango del LoRA, modulos afectados ni evaluacion, lo que dificulta reproducir resultados o auditar sesgos.
- Riesgo de sobreajuste al concepto: al ser un LoRA de concepto/personaje, puede degradar la diversidad de las generaciones o imponer el estilo de forma excesiva si se sube el peso del adaptador.
- Alucinacion visual: como cualquier modelo generativo de imagen, puede producir anatomia incorrecta, artefactos o incoherencias en escenas complejas.
- Idiomas: no se declaran idiomas soportados para los prompts; el comportamiento multilingue no esta verificado.
- Sin benchmarks: no hay evidencia publica de calidad frente a alternativas.
- Fecha de creacion futura (2026-11-05) en los metadatos: conviene verificar la procedencia y la integridad del artefacto antes de usarlo en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/RunningHubAI/rh-nayru-krea2-nsfw-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2091428750184497153
- Pagina del autor: https://www.runninghub.ai/user-center/2007108761445212162
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
