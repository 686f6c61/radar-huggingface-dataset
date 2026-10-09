# mo-shadfar/laya-fa-spam-detectiom

## Resumen

Laya fa spam detection es un ajuste fino (fine-tuning) del checkpoint multilingue de Laya, un framework de agentes, publicado por el usuario mo-shadfar en HuggingFace. El modelo se ha entrenado especificamente sobre un conjunto de datos persa de atencion al cliente, con el objetivo de resolver tareas de deteccion de spam y clasificacion de intenciones, urgencia y preguntas nulas (etiquetadas como "noul" en la model card). El repositorio pesa 0,7 GB y los pesos en safetensors suman 321.908.998 parametros, lo que lo situa en la categoria de modelos pequenos (aproximadamente 0,3 mil millones de parametros), aptos para inferencia en hardware modesto.

El problema que aborda es concreto: automatizar la triaje de mensajes entrantes en un canal de atencion al cliente en persa, distinguiendo entre consultas legitimas, spam y consultas sin contenido util. Para ello se apoya en el paradigma "system-one" y en la receta RLCD (Reinforcement Learning from Contrastive Data), tecnicas asociadas al ecosistema Laya, que combinan el ajuste supervisado con objetivos suaves (soft targets) sobre las categorias de salida.

La relevancia actual del modelo es limitada pero ilustrativa: se trata de un ejemplo practico de como adaptar un checkpoint de agentes multilingue a un dominio y un idioma especificos con un conjunto de datos pequeno (unos 300 casos) y recursos de entrenamiento asequibles (2x T4 en Kaggle). En el momento de la consulta no registra descargas ni "likes", y la model card no proporciona detalles sobre la arquitectura interna, la longitud de contexto ni los resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoint del framework Laya; la informacion proporcionada no detalla la arquitectura) |
| Parametros totales | 321.908.998 (aprox. 321,9 M) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (unicamente se publican pesos en safetensors; no se listan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | persa (farsi) segun las etiquetas; el checkpoint base se describe como multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura subyacente. El modelo se presenta como un ajuste fino del "checkpoint multilingue" de Laya, un framework orientado a agentes, etiquetado con los terminos "laya" y "system-one". No se especifica si el backbone es un transformer denso, un modelo de mezcla de expertos (MoE) o una arquitectura hibrida, ni se indica el numero de capas, dimensiones ocultas o mecanismo de atencion. Tampoco se detalla la longitud de contexto soportada. Los unicos datos objetivos disponibles son el recuento de parametros (321.908.998) y el tamano del repositorio (0,7 GB), coherente con un almacenamiento en precision de 16 bits.

En cuanto al entrenamiento, el autor indica que se partio de un conjunto persa de atencion al cliente con aproximadamente 300 casos, y que se emplearon objetivos suaves (soft targets) sobre tres dimensiones: intencion (intent), urgencia (urgency) y preguntas nulas (denominadas "noul" en la model card). El procedimiento siguio la receta RLCD con entrenamiento distribuido (DDP), descrita en el cuaderno de ajuste fino de Laya, y se ejecuto sobre 2 GPU T4 en Kaggle. No se proporcionan datos sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron etapas adicionales de RLHF o DPO mas alla de la mencionada RLCD.

## Capacidades

- Clasificacion y deteccion de spam en mensajes de atencion al cliente en persa, con salidas sobre intencion, urgencia y condiciones de pregunta nula.
- Prediccion basada en estado y preguntas a traves de la API del framework: `agent.predict(state, questions)`.
- Integracion con el ecosistema Laya para flujos de agentes, segun la interfaz de ejemplo de la model card.
- Capacidad multilingue heredada del checkpoint base (no verificada en la model card para este ajuste).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Razonamiento multi-paso o modo de pensamiento explicito: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Filtrado de spam en formularios de contacto: el modelo puede clasificar los mensajes entrantes en un buzon de soporte en persa y marcar como spam aquellos que no constituyen consultas legitimas, reduciendo el volumen que llega a los agentes humanos.
- Triaje por urgencia: dado que el ajuste incorpora la dimension de urgencia, permite priorizar los tickets mas criticos dentro de una cola de atencion al cliente, dirigiendo primero los casos que requieren respuesta inmediata.
- Enrutado por intencion: la clasificacion de intenciones facilita dirigir cada consulta al equipo o flujo de trabajo adecuado (facturacion, incidencias tecnicas, informacion comercial, etc.).
- Deteccion de consultas vacias o incompletas: la etiqueta de pregunta nula permite identificar mensajes sin contenido accionable y solicitar automaticamente la informacion faltante antes de asignar un agente.
- Preprocesado en pipelines de agentes Laya: al exponer la interfaz `predict(state, questions)`, el modelo puede integrarse como un paso previo de clasificacion dentro de un agente conversacional mas amplio construido con el propio framework.
- Moderacion de canales de soporte en persa: aplicable a foros, chats o sistemas de tickets en los que sea necesario separar contenido promocional no deseado de consultas reales.
- Experimentacion academica: por su tamano reducido y su licencia permisiva, sirve como caso de estudio para reproducir recetas de ajuste fino con objetivos suaves y RLCD en GPUs de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision de 16 bits: aproximadamente 0,65 GB solo para los pesos (321,9 M de parametros), a los que hay que sumar el consumo de activaciones y del runtime.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 0,35 GB; en 4 bits, en torno a 0,2 GB (estimaciones teoricas, ya que el autor no publica variantes cuantizadas).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; una NVIDIA T4, RTX 3060, RTX 4060 o superior cubre el caso sin problemas. Para entrenamiento, el autor utilizo 2x T4.
- Cabe en GPU de consumo: si, practicamente cualquier GPU de consumo moderna (RTX 3050 en adelante) puede ejecutar el modelo, dado su tamano inferior a 0,5 mil millones de parametros.
- Opciones de despliegue: la via documentada es la libreria `laya` mediante `laya.load(...)`. No se confirma soporte para vLLM, TGI, llama.cpp u Ollama, y no se ofrecen pesos GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica modelos comparables de la misma categoria (clasificacion de spam en persa ajustados sobre un backbone de agentes de ~0,3 B de parametros), por lo que no es posible establecer una comparacion fiable sin datos verificables.

## Limitaciones y advertencias

- El ajuste se ha realizado sobre un conjunto de aproximadamente 300 casos, un volumen muy reducido que limita la generalizacion y aumenta el riesgo de sobreajuste.
- No hay resultados de evaluacion publicados, por lo que se desconoce la precision real en produccion sobre datos distintos al de entrenamiento.
- Riesgo de alucinacion y de clasificaciones erroneas en mensajes ambiguos o con campos lexicos poco representados en el conjunto de entrenamiento.
- La model card no documenta sesgos conocidos ni la composicion demografica o tematica del dataset, lo que impide evaluar sesgos sistematicos.
- El ajuste esta orientado al persa; su comportamiento en otros idiomas no esta verificado aunque el checkpoint base sea multilingue.
- No se especifica la longitud de contexto, por lo que se desconoce como se comporta con conversaciones largas o hilos multi-turno extensos.
- La licencia Apache 2.0 permite uso comercial y modificacion, pero el usuario debe asumir la ausencia de garantias y de soporte por parte del autor.
- El repositorio no registra descargas ni interacciones, y la model card es minima; conviene tratar el modelo como un experimento y validarlo exhaustivamente antes de cualquier despliegue.
- Las busquedas web asociadas no devolvieron documentacion tecnica relevante sobre este modelo concreto.

## Enlaces

- HuggingFace: https://huggingface.co/mo-shadfar/laya-fa-spam-detectiom
- No se han encontrado en la busqueda web enlaces relevantes adicionales (papers, blogs, repositorios o demos) asociados a este modelo.
