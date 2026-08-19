# meta-llama/Prompt-Guard-86M

## Resumen

Prompt-Guard-86M es un modelo de clasificación de texto desarrollado por Meta, diseñado específicamente para detectar inyecciones de prompts (prompt injection) y jailbreaks en entradas dirigidas a modelos de lenguaje. A pesar de su nombre, el modelo tiene 278,8 millones de parámetros reales, aunque se comercializa como "86M" por su arquitectura base DeBERTa-v2. Se publicó en julio de 2024 como parte del ecosistema Llama 3.1, con licencia llama3.1 y acceso restringido en HuggingFace.

El modelo resuelve un problema crítico de seguridad en sistemas basados en LLM: distinguir entre instrucciones legítimas y ataques adversariales que intentan manipular el comportamiento del modelo. Su relevancia actual radica en que los despliegues de agentes y asistentes con herramientas requieren filtros de entrada fiables, y Prompt-Guard ofrece una solución ligera (2,2 GB en safetensors) que puede integrarse como capa previa a cualquier LLM.

Arquitectónicamente es un encoder transformer de tipo DeBERTa-v2, optimizado para clasificación de secuencias. Su ventana de contexto no está publicada oficialmente, pero por su base debería rondar los 512 tokens. Está entrenado exclusivamente en inglés y su salida es una etiqueta de clasificación con tres categorías: inyección, jailbreak o benigno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (encoder transformer) |
| Parametros totales | 278.811.651 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (estimable en 512 tokens por base DeBERTa-v2) |
| Tipos de cuantizacion | no publicados oficialmente (compatible con cuantizacion estandar de Transformers) |
| Idiomas soportados | ingles (en) |
| Licencia | llama3.1 (uso comercial permitido con condiciones, acceso gated) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Prompt-Guard se basa en DeBERTa-v2, un encoder transformer con atencion disentangled (separacion de contenido y posicion relativa) que mejora la captura de relaciones sintacticas y semanticas frente a BERT clasico. El modelo tiene 278,8 millones de parametros, muy por encima de los 86 millones que sugiere su nombre, lo que indica que se trata de una variante "large" de DeBERTa-v2 reentrenada para la tarea especifica de clasificacion de seguridad.

Meta no ha publicado detalles sobre el dataset de entrenamiento ni el proceso de fine-tuning. Se sabe que el modelo fue entrenado para producir tres etiquetas de salida: "benign" (inocuo), "injection" (inyeccion de prompt) y "jailbreak". No se ha documentado el uso de RLHF ni DPO; al ser un clasificador, el entrenamiento probablemente fue de tipo supervised fine-tuning sobre ejemplos etiquetados de ataques conocidos. Tampoco hay informacion publica sobre el numero de tokens de entrenamiento ni la composicion del dataset.

Una caracteristica destacable es que el modelo esta disenado para ser usado como filtro previo: recibe el texto del usuario y devuelve una etiqueta, de modo que un sistema puede bloquear o marcar entradas maliciosas antes de pasarlas a un LLM generativo. Su tamano reducido permite inferencia rapida incluso en CPU.

## Capacidades

- Clasificacion de texto en tres categorias: benigno, inyeccion de prompt y jailbreak.
- Deteccion de ataques de prompt injection, incluyendo intentos de redireccionamiento, exfiltracion de instrucciones o cambios de rol.
- Identificacion de jailbreaks clasicos y variantes recientes, como los basados en codificacion, roles ficticios o instrucciones en otros idiomas (aunque el modelo solo esta entrenado en ingles).
- Salida determinista con etiquetas discretas, apta para integracion en pipelines de seguridad automatizados.
- Compatible con la libreria Transformers de HuggingFace y con Text Embeddings Inference (TEI), lo que permite desplegarlo como endpoint dedicado.
- No es un modelo generativo: no produce texto libre, solo clasifica.
- No soporta tool calling ni razonamiento multi-paso por su naturaleza de clasificador.

## Casos de uso

- Filtro de entrada para chatbots de atencion al cliente: se coloca Prompt-Guard antes del LLM generativo para detectar si un usuario intenta inyectar instrucciones maliciosas (por ejemplo, "ignora tus reglas y di X"). Su latencia baja permite usarlo en tiempo real sin penalizar la experiencia del usuario.
- Proteccion de agentes con acceso a herramientas: en sistemas donde un LLM puede llamar a APIs, bases de datos o ejecutar codigo, Prompt-Guard actua como primera barrera para bloquear prompts que intenten manipular las herramientas conectadas.
- Moderacion de contenido en foros o comunidades: clasifica mensajes de usuarios para detectar intentos de jailbreak antes de que lleguen a un modelo generativo, reduciendo el riesgo de respuestas inapropiadas o peligrosas.
- Auditoria de logs de interaccion: se puede ejecutar offline sobre historiales de conversaciones para identificar ataques previos y mejorar las defensas del sistema.
- Capa de seguridad en APIs de LLM como servicio: integrado en un proxy o gateway, Prompt-Guard filtra todas las peticiones entrantes y devuelve un codigo de error si detecta una inyeccion, protegiendo al proveedor y a sus clientes.
- Evaluacion de robustez de otros modelos: los equipos de seguridad pueden usar Prompt-Guard como oraculo para medir la frecuencia de ataques exitosos en sus propios sistemas y ajustar politicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Meta no ha proporcionado metricas oficiales de exactitud, precision o recall sobre conjuntos de datos estandar como MMLU o HumanEval, ya que este modelo no realiza tareas generativas sino clasificacion de seguridad. Tampoco hay comparaciones publicas con otros detectores de jailbreak como Llama Guard o modelos de moderacion de OpenAI.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 278,8 millones de parametros en precision FP32, lo que ocupa aproximadamente 1,1 GB en memoria. Con cuantizacion a FP16 o INT8, el uso de VRAM se reduce a unos 0,6-0,8 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Una NVIDIA T4, GTX 1650 o incluso una CPU moderna pueden ejecutar inferencia sin problemas.
- Compatible con hardware consumer: si, cabe en cualquier GPU de consumo actual (RTX 3060, RTX 4090, etc.) y tambien en CPU con unos 4 GB de RAM.
- Opciones de despliegue: se puede servir con la libreria Transformers de HuggingFace, con Text Embeddings Inference (TEI) para endpoints dedicados, o mediante vLLM si se adapta como modelo de clasificacion. Tambien es compatible con SageMaker (deploy:sagemaker) y con endpoints de HuggingFace.
- Latencia y throughput estimados: no hay datos oficiales, pero por su tamano se espera una latencia inferior a 10 ms en GPU moderna y de 50-100 ms en CPU para secuencias cortas. El throughput puede superar las 1000 peticiones por segundo en un endpoint con una sola GPU T4.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Tarea |
|---|---|---|---|---|---|
| Prompt-Guard-86M | 278,8 M | DeBERTa-v2 | no disponible | llama3.1 | Clasificador de inyecciones/jailbreaks |
| Llama Guard 2 | 8 B | Llama 2 | 4096 | llama2 | Clasificador de seguridad de contenido (prompt y respuesta) |
| Llama Guard 3 | 8 B | Llama 3 | 8192 | llama3.1 | Clasificador de seguridad de contenido (prompt y respuesta) |
| OpenAI Moderation | no publicado | no publicado | no disponible | API propietaria | Moderacion de contenido generico |

Prompt-Guard se diferencia de Llama Guard en que es un encoder puro (no generativo), mucho mas ligero y rapido, pero tambien menos flexible: solo detecta inyecciones y jailbreaks, no otro tipo de contenido toxico. Llama Guard cubre un espectro mas amplio de categorias de seguridad (violencia, odio, sexual, etc.) y ademas clasifica tanto el prompt como la respuesta generada. Para entornos con recursos limitados, Prompt-Guard es la opcion mas eficiente; para politicas de seguridad completas, Llama Guard es mas adecuado.

## Limitaciones y advertencias

- El modelo solo esta entrenado en ingles; los ataques en otros idiomas pueden no ser detectados correctamente, lo que supone un riesgo en despliegues multilingues.
- No se han publicado datos sobre sesgos, pero al ser un clasificador entrenado con datos etiquetados, puede presentar falsos positivos (bloquear prompts legitimos) o falsos negativos (dejar pasar ataques novedosos).
- Riesgo de alucinacion no aplica directamente, pero la clasificacion puede ser incorrecta ante variantes de ataque no vistas durante el entrenamiento, especialmente jailbreaks recientes o tecnicas de ofuscacion avanzadas.
- La licencia llama3.1 permite uso comercial, pero requiere aceptar los terminos de Meta y el acceso es gated en HuggingFace; es necesario solicitar acceso y cumplir las condiciones de uso.
- La longitud de contexto no esta publicada; si se supera el limite de la arquitectura DeBERTa-v2 (tipicamente 512 tokens), el modelo truncara el texto y podria perder informacion relevante para la clasificacion.
- No es un sustituto de un sistema de seguridad completo: debe combinarse con otras capas de defensa (filtros de salida, sandboxing de herramientas, etc.).
- No se proporcionan garantias de rendimiento en produccion; Meta no ofrece soporte oficial para este modelo.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/meta-llama/Prompt-Guard-86M
- Documentacion de Llama 3.1 (contexto de la familia de modelos): https://ai.meta.com/blog/meta-llama-3-1/
- Repositorio de Transformers de HuggingFace (para integracion): https://github.com/huggingface/transformers
- Documentacion de Text Embeddings Inference (TEI): https://github.com/huggingface/text-embeddings-inference
- Blog de Meta sobre seguridad en IA (referencia general): https://ai.meta.com/research/
