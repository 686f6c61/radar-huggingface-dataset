# RunningHubAI/rh-z-image-turbo-fp16-nsfw-unet

## Resumen

rh-z-image-turbo-fp16-nsfw-unet es un fichero de pesos de tipo UNET para generacion de imagen a partir de texto, publicado por RunningHubAI en Hugging Face el 1 de octubre de 2026. Se trata de un ajuste fino (finetune) del modelo Z-Image-Turbo, orientado a la generacion de contenido para adultos, segun indican las etiquetas del repositorio (`not-for-all-audiences`) y el propio nombre del modelo. El repositorio contiene un unico fichero safetensors de 11.740 MiB en precision fp16.

El modelo no incluye text encoder ni VAE: es exclusivamente el componente UNET, pensado para cargarse en ComfyUI o en la plataforma RunningHub. Pese a que el peso del fichero permite estimar una horquilla de unos 6.100 millones de parametros, el autor no publica ni la arquitectura exacta, ni el numero de tokens de entrenamiento, ni la composicion del dataset de ajuste.

Su relevancia actual es limitada y muy especifica: cubre el nicho de pesos afinados sin censura para flujos de trabajo de difusion autoalojados. La model card es practicamente un esqueleto (contiene un marcador de posicion `<p>1</p>`), no se declara licencia concreta y el repositorio acumula 0 descargas y 0 "likes", por lo que no existe validacion comunitaria ni datos de rendimiento publicados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNET de difusion para text-to-image (arquitectura de red concreta no disponible); derivada de Z-Image-Turbo |
| Parametros totales | No disponible oficialmente. Estimacion a partir del tamano del fichero en fp16 (11.740 MiB): ~6.100 millones de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de generacion de imagen); no disponible informacion sobre resolucion maxima de salida |
| Tipos de cuantizacion | Solo fp16 en este repositorio. No se publican variantes fp8, GGUF ni int8 |
| Idiomas soportados | No disponible. La model card esta redactada en ingles y chino, pero no declara idiomas de prompt |
| Licencia | No disponible. La model card indica: "Published by RunningHub on behalf of the author. Copyright remains with the author. Follow the original project or upstream license" |
| Formato de pesos | safetensors (`Z-Image-Turbo-fp16 nsfw.safetensors`, 11.740 MiB) |
| Tipo de pipeline | text-to-image |
| Tamano del repositorio | 12,3 GB |
| Plataformas declaradas | ComfyUI, RunningHub, Hugging Face |
| Modelo base | Z-Image-Turbo |
| Fecha de creacion | 2026-10-01 |
| Ultima actualizacion | 2026-10-01 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El repositorio solo distribuye los pesos del UNET en fp16 dentro de un fichero safetensors. El autor lo etiqueta como `unet` y `comfyui`, lo que implica que esta pensado para sustituir el componente de denoising de un pipeline de difusion latente en ComfyUI, dejando fuera el text encoder y el VAE, que deben obtenerse por separado del proyecto original. La model card no describe la topologia interna (atencion, tipo de bloque, uso de atencion lineal, destilacion por pasos, etc.), por lo que no es posible confirmar mas detalles arquitectonicos que los derivados del nombre del modelo base, Z-Image-Turbo.

Tampoco hay informacion sobre el proceso de ajuste: no se indica el numero de imagenes o tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La seccion "About this model" de la model card contiene unicamente el marcador de posicion `<p>1</p>`, lo que sugiere que se subio mediante una plantilla automatizada sin documentacion tecnica adicional. Los datos de fecha de creacion y actualizacion (1 de octubre de 2026) son posteriores a la fecha habitual de consulta, lo que apunta a un posible error de metadatos en la plataforma o a un entorno con reloj no sincronizado.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image) mediante difusion latente.
- Generacion de contenido para adultos: el repositorio esta marcado como `not-for-all-audiences` y el nombre incluye el sufijo `nsfw`, lo que indica un ajuste orientado a este dominio.
- Integracion como nodo UNET en flujos de ComfyUI.
- Ejecucion en la plataforma en linea de RunningHub, segun declara el autor.
- Precision fp16, lo que reduce el uso de memoria frente a fp32 a costa de una ligera perdida de fidelidad numerica.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje.
- No dispone de modo de razonamiento (thinking mode), vision de entrada ni procesamiento de audio.
- Capacidades multilingues: no disponibles; no se declara que idiomas acepta el codificador de texto.

## Casos de uso

- Generacion de ilustracion para adultos en infraestructura propia: al ser un UNET aislado en fp16, se puede cargar en una instalacion local de ComfyUI y ejecutar en una GPU de un solo inquilino, evitando enviar prompts a servicios de terceros.
- Entrenamiento de LoRA y ajustes de estilo: los pesos sirven como punto de partida para afinar estilos concretos dentro del dominio para adultos, ya que el modelo base ya esta ajustado a ese tipo de contenido y reduce el riesgo de que el LoRA deforme la estetica general.
- Evaluacion de sistemas de moderacion de contenido: puede emplearse como generador adversario controlado para poner a prueba clasificadores de imagenes y filtros de seguridad, siempre en un entorno aislado y con las salvaguardas legales correspondientes.
- Produccion por lotes para estudios de ilustracion: el pipeline se puede automatizar con scripts que recorran un fichero de prompts y generen variaciones de forma desatendida, aprovechando que el UNET se carga una sola vez en memoria.
- Integracion en flujos de trabajo existentes de ComfyUI: al ser un fichero safetensors de UNET, se puede sustituir el nodo correspondiente en grafos ya construidos para cambiar el estilo de salida sin rehacer el pipeline de text encoder y VAE.
- Despliegue mediante API en RunningHub: el autor enlaza la documentacion de su API, lo que permite invocar el modelo de forma remota sin gestionar GPU propia, util para pruebas de concepto o demostraciones.
- Investigacion sobre sesgos y representacion: al no publicarse la composicion del dataset de ajuste, el modelo puede usarse en estudios que midan como un finetune sin documentar modifica la distribucion de salidas respecto al modelo base.
- Comparacion de variantes: sirve para contrastar el comportamiento de la version sin censura frente a la version estandar del mismo autor (`rh-z-image-turbo-fp16-unet`) en tareas de evaluacion cualitativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, Human Preference Score ni similares), y el repositorio registra 0 descargas y 0 interacciones, por lo que tampoco existen evaluaciones de terceros.

## Requisitos de hardware

- VRAM para los pesos: el fichero fp16 ocupa 11.740 MiB (unos 11,5 GiB), de modo que el UNET por si solo no cabe en GPUs de 8 GB o 12 GB sin intercambio a memoria del sistema.
- VRAM del pipeline completo: no disponible de forma oficial. Estimacion: sumando text encoder, VAE y los buffers de atencion por encima de los pesos, un pipeline funcional necesita del orden de 16-24 GB de VRAM. En precision reducida o con descarga por capas se puede operar por debajo de ese umbral, a costa de latencia.
- GPU recomendadas: tarjetas con 24 GB o mas, como RTX 3090, RTX 4090, A100 40/80 GB o H100, permiten cargar el UNET y el resto del pipeline sin estrategias de offload agresivas.
- GPU de consumo: es viable en una RTX 4090 o RTX 3090 de 24 GB. En tarjetas de 16 GB (por ejemplo RTX 4080) requerira gestion cuidadosa de memoria u offload parcial. Por debajo de 12 GB no es practico sin cuantizacion adicional, que este repositorio no proporciona.
- Opciones de despliegue: ComfyUI es el entorno declarado por el autor. Al tratarse de un safetensors de UNET y no de un modelo completo con pipeline, no es directamente compatible con Ollama ni con llama.cpp. vLLM y TGI no aplican a modelos de difusion de imagen. La plataforma RunningHub es la alternativa gestionada que ofrece el propio autor.
- Latencia y throughput: no disponible. No se publican tiempos de inferencia, numero de pasos de muestreo ni resoluciones de referencia.

## Comparativa con modelos similares

| Modelo | Autor | Parametros | Formato | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-z-image-turbo-fp16-nsfw-unet | RunningHubAI | ~6.100 M (estimado) | safetensors fp16 | No disponible | Finetune de Z-Image-Turbo para contenido para adultos | Hugging Face, RunningHub |
| rh-z-image-turbo-fp16-unet | RunningHubAI | No disponible | safetensors fp16 | No disponible | Finetune de Z-Image-Turbo sin el ajuste para adultos | Hugging Face, RunningHub |
| rh-z-imagebase-fp16-unet | RunningHubAI | No disponible | safetensors fp16 | No disponible | Variante base de la familia Z-Image | Hugging Face, RunningHub |
| Z-Image-Turbo (modelo original) | Proyecto upstream de Z-Image (no identificado en la informacion disponible) | No disponible | No disponible | No disponible | Modelo original del que derivan los anteriores | No disponible |

No se dispone de datos de rendimiento comparativos entre estas variantes, ni de parametros, contexto o resolucion declarados para ninguna de ellas. La comparacion se limita a la procedencia y al formato de distribucion.

## Limitaciones y advertencias

- Licencia no especificada: la model card remite a "la licencia del proyecto original o upstream" sin identificarla. Antes de cualquier uso comercial es imprescindible verificar los terminos de Z-Image-Turbo en su repositorio de origen; de lo contrario, el uso en produccion queda en un limbo legal.
- Contenido para adultos: el modelo esta marcado como `not-for-all-audiences` y esta disenado para generar material NSFW. Su uso exige cumplir la normativa aplicable en materia de verificacion de edad, proteccion de menores y regulacion de contenidos, ademas de contar con salvaguardas tecnicas en el despliegue.
- Ausencia total de datos de entrenamiento: no se publica la composicion del dataset de ajuste, por lo que no se pueden evaluar sesgos de representacion, ni de genero, ni etnicos, ni de otro tipo.
- Riesgo de artefactos: no hay evaluaciones publicadas de calidad. En modelos de difusion afinados sin documentar son frecuentes los fallos anatomicos, la descomposicion de manos y rostros y la aparicion de texto ilegible.
- Idiomas de prompt no declarados: si el text encoder asociado se optimizo para ingles, los prompts en castellano pueden degradar notablemente el resultado.
- Repositorio sin traccion: 0 descargas y 0 "likes" en el momento de la consulta, sin issues ni discusiones. No hay senales de mantenimiento ni de soporte.
- Model card incompleta: la seccion descriptiva contiene un marcador de posicion sin contenido, y no se ofrecen instrucciones de instalacion, versiones compatibles de ComfyUI ni parametros de muestreo recomendados.
- Metadatos de fecha inconsistentes: las fechas de creacion y actualizacion (1 de octubre de 2026) son posteriores a la fecha habitual de consulta, lo que sugiere un posible error en el registro y dificulta trazar la version real de los pesos.
- Paquete incompleto: solo contiene el UNET. Sin text encoder ni VAE correctos, los pesos son inutilizables; hay que obtener esos componentes por otra via y asegurar su compatibilidad.
- Sin benchmarks reproducibles: es imposible estimar de antemano si el finetune degrada la calidad general respecto al modelo base en prompts no relacionados con el dominio para adultos.
- Sin cuantizaciones alternativas: la unica opcion disponible es fp16, lo que limita el despliegue en hardware de gama media.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-z-image-turbo-fp16-nsfw-unet
- Repositorio del hermano sin ajuste NSFW: https://huggingface.co/RunningHubAI/rh-z-image-turbo-fp16-unet
- Ficha del modelo original en RunningHub: https://www.runninghub.cn/model/public/2038827985284898817
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/1982317316849410049
- Plataforma RunningHub (internacional): https://www.runninghub.ai
- Plataforma RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Pagina de entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Catalogo de modelos del autor en Hugging Face: https://huggingface.co/RunningHubAI/models
- Variante Z-Image-Turbo-fp16 en RunningHub: https://www.runninghub.ai/model/public/2035287591976706050
- Variante Z-Image-Turbo-fp16 Enhanced Edition: https://www.runninghub.ai/model/public/2022102350244093953
