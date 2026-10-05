# ApolloRaines/Clef-Flash-Truthful-m0.5

## Resumen

Clef-Flash-Truthful-m0.5 es una variante modificada a nivel de pesos del modelo Cloudflare/clef-flash, un modelo multimodal de 9.409.813.744 parametros (aproximadamente 9,4B) disenado para producir decisiones tipadas en lugar de texto libre. El autor de esta variante es ApolloRaines, y la modificacion se ha realizado con la herramienta de cirugia de pesos jBlaze, que altera direcciones de comportamiento en el residual stream sin entrenamiento ni descenso de gradiente. El objetivo declarado es amplificar una direccion de veracidad (truthfulness) en las proyecciones de salida de atencion y de la MLP en las 32 capas del backbone.

El modelo base, Clef-Flash, es un modelo de Cloudflare post-entrenado a partir de Qwen/Qwen3.5-9B, que combina un backbone Qwen3.5-9B con su codificador de vision y una cabeza de decision conjunta (joint schema head). La entrada puede ser texto, JSON, imagenes o video, y la salida es un logit por cada opcion permitida de cada pregunta del esquema, con softmax por pregunta para obtener probabilidades. No hay generacion de texto libre ni parseo de salida en el modo de decision tipada.

La relevancia de esta variante es metodologica: es la primera publicacion de jBlaze sobre la arquitectura de atencion hibrida de Qwen3.5, en la que 24 de las 32 capas usan atencion lineal y 8 usan atencion completa. La cabeza de decision conjunta no se ha modificado, de modo que la inferencia tipada via `systemone()` devuelve el mismo esquema con la misma forma que el modelo original. El modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y no se han publicado resultados de benchmarks completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido Qwen3.5 con atencion mixta (24 de 32 capas de atencion lineal, 8 de atencion completa) mas codificador de vision y cabeza de decision conjunta (joint schema head) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se han publicado GGUF ni cuantizaciones de otro tipo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de Cloudflare/clef-flash y Qwen/Qwen3.5-9B) |
| Formato de pesos | safetensors (sharded, con `model.safetensors.index.json`), mas `joint_head.safetensors` y `joint_head_config.json`; incluye codigo Python propio (`joint_schema_model.py`) |

## Arquitectura y entrenamiento

El backbone es Qwen/Qwen3.5-9B con su codificador de vision, almacenado en safetensors fragmentados. Sobre el backbone se anade una cabeza de transformador pequena que lee los estados ocultos finales, enruta evidencia desde el estado hacia cada pregunta y puntua conjuntamente todas las opciones de todas las preguntas. La salida es un logit por opcion permitida. La arquitectura de atencion es hibrida: 24 de las 32 capas usan `linear_attn.out_proj` (atencion lineal) y las 8 restantes usan `self_attn.o_proj` (atencion completa).

Esta variante concreta no ha sido entrenada. La modificacion se aplico con jBlaze, que extrae una direccion en el residual stream contrastando activaciones medias sobre pares de prompts positivos y negativos, aplica winsorizacion de valores atipicos y reduce mediante SVD a un subespacio por capa. Esa direccion se proyecta hacia dentro (o hacia fuera) de los tensores de salida del bloque de atencion (`linear_attn.out_proj` o `self_attn.o_proj` segun el tipo de capa) y del bloque MLP (`mlp.down_proj`), ponderada por un multiplicador. La forma del edit declarada es: base de identidad reducida (deid m=1,0) mas direccion de veracidad amplificada aplicada con m=0,5 sobre el brazo A2 (proyecciones de salida de atencion y MLP) en las 32 capas. No hay datos nuevos de entrenamiento ni pasos de gradiente. La cabeza de decision conjunta (`joint_head.safetensors`) no se toco. El perfil jBlaze para esta familia se verifico con `jprobe` con un resultado de 100/100, comprobando que `layer_out - layer_in == attn + mlp` sobre activaciones reales.

## Capacidades

- Decision tipada multimodal: acepta estado en formato texto, JSON, imagen o video y devuelve una probabilidad para cada opcion permitida de cada pregunta del esquema, en un unico forward pass.
- Salida estructurada sin parseo: un logit por opcion, con softmax por pregunta; no requiere post-procesado de texto ni formateo de la respuesta.
- Generacion de texto libre en modo CausalLM, con recomendacion de usar la plantilla de chat de Qwen3.5 con `enable_thinking=False` para mantener coherencia en esta magnitud de edicion.
- Procesamiento de vision: hereda el codificador de vision del backbone Qwen3.5-9B y la cobertura de vision-lenguaje anadida por el perfil jBlaze.
- Clasificacion y structured output: los tags del autor incluyen `classification`, `structured-output` e `image-text-to-typed-output`.
- Conversacion: el pipeline declarado es `image-text-to-text` y los tags incluyen `conversational`.
- Compatibilidad de API: la API de Clef-Flash es compatible con Jev y SystemOne; el codigo de carga (`load_release_model`) y de inferencia tipada (`systemone`) funciona sin cambios respecto al modelo base.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el autor no declara listado de idiomas.
- Capacidades de audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Enrutamiento y triaje de tickets de soporte: dado un estado con el texto del ticket y un esquema de preguntas tipadas (categoria, urgencia, equipo destino), el modelo devuelve una probabilidad por opcion en un solo forward pass, sin necesidad de parsear texto generado. El canario de decision tipada del autor muestra este patron con la etiqueta `overdue` a 0,977 de confianza.
- Clasificacion de documentos con evidencia visual: al aceptar imagenes ademas de texto y JSON, permite clasificar formularios escaneados, capturas o fotogramas de video dentro de un esquema predefinido de opciones, con la cabeza conjunta enrutando la evidencia a cada pregunta.
- Moderacion de contenido con esquema fijo: la salida estrictamente acotada a las opciones permitidas reduce el riesgo de respuestas fuera de rango en comparacion con un modelo generativo, lo que simplifica el registro de auditoria y la reproducibilidad de la decision.
- Investigacion sobre edicion de comportamiento en pesos: la variante sirve como caso de estudio replicable de jBlaze sobre atencion hibrida, permitiendo comparar la misma peticion contra `Cloudflare/clef-flash` para medir el desplazamiento de comportamiento en modo CausalLM y verificar que la cabeza de decision no se altera.
- Evaluacion de robustez de cabezas de decision tras cirugia de pesos: util para comprobar si una intervencion en el residual stream del backbone degrada la calibracion de la cabeza conjunta, dado que el autor solo realizo una prueba de humo y no una evaluacion completa.
- Generacion de texto asistida con sesgo de veracidad: en tareas de respuesta factual donde se quiere un tono mas afirmativo y detallado que el del modelo base, tal como ilustra el canario libre del autor sobre el mito del 10 por ciento del cerebro.
- Extraccion de decisiones en pipelines de automatizacion compatibles con SystemOne: al mantener la misma firma de `systemone(model, processor, request)`, la variante se puede sustituir en un pipeline existente sin reescribir la capa de integracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye cifras de MMLU, HumanEval, GSM8K ni de la suite de evaluacion de Clef, y solo aporta dos canarios cualitativos.

| Prueba | Clef-Flash original | Clef-Flash-Truthful-m0.5 |
|---|---|---|
| Canario libre (modo CausalLM), mito del 10 por ciento del cerebro | "No, that is not true. It is a persistent myth with no scientific basis." | "No, it is not true. The 10% brain myth is false. Neuroscientific evidence shows that humans use far more than this tiny fraction..." |
| Canario de decision tipada (modo SystemOne) | Etiqueta `overdue` con 0,977 de confianza | Etiqueta `overdue` con 0,978 de confianza |
| Verificacion `jprobe` de la identidad `layer_out - layer_in == attn + mlp` | no aplica | 100/100 |

No hay datos publicos de latencia, throughput ni consumo de memoria medidos por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 18,8 GB solo para los pesos, calculados a partir de 9.409.813.744 parametros a 2 bytes por parametro. Con cache KV, activaciones y overhead del runtime, el consumo practico se situa por encima de 20 GB.
- El repositorio completo ocupa 19,1 GB, coherente con pesos sin cuantizar en safetensors.
- GPU recomendadas: A100 40 GB, H100 80 GB, L40S 48 GB o A6000 48 GB para BF16 con margen. Una RTX 4090 de 24 GB queda muy justa en BF16 y no se puede confirmar que quepa sin cuantizacion, ya que no hay cuantizaciones publicadas.
- No hay pesos GGUF, AWQ, GPTQ ni FP8 publicados, por lo que el despliegue en GPU de consumo con 8-12 GB de VRAM requeriria cuantizar el modelo por cuenta propia.
- Opciones de despliegue: carga mediante `transformers` con el codigo propio del repositorio (`joint_schema_model.py`) y la funcion `load_release_model(path, device="cuda")`. El uso de codigo personalizado implica `trust_remote_code=True`. No hay confirmacion de compatibilidad con vLLM, TGI, llama.cpp, Ollama ni SGLang en la informacion proporcionada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo de salida | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ApolloRaines/Clef-Flash-Truthful-m0.5 | 9,41B | Decision tipada multimodal mas texto libre en modo CausalLM | no disponible | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| Cloudflare/clef-flash | no disponible (es el modelo base, backbone de 9B segun el autor) | Decision tipada multimodal | no disponible | Apache 2.0 | HuggingFace |
| Cloudflare/clef | no disponible (variante mayor segun el autor) | Decision tipada multimodal | no disponible | no disponible | HuggingFace |
| Qwen/Qwen3.5-9B | 9B (arquitectura de referencia del backbone) | Texto y vision, generacion libre | no disponible | no disponible | HuggingFace |

La informacion disponible no permite comparar rendimiento numerico entre estos modelos, ya que no se han publicado resultados de benchmarks ni de la Decision Index leaderboard en los materiales consultados.

## Limitaciones y advertencias

- Fuga de direcciones de comportamiento: el propio autor advierte de que las direcciones de comportamiento pueden filtrarse entre prompts; un modelo con verbosidad reducida puede seguir siendo verboso en algunas entradas y viceversa. Lo mismo aplica a la direccion de veracidad amplificada.
- Evaluacion incompleta de la cabeza de decision: la cabeza conjunta se preserva por construccion, pero solo se ha probado con una prueba de humo y no se ha evaluado contra la suite completa de Clef. La preservacion funcional en produccion no esta garantizada.
- Ausencia de benchmarks: no hay metricas de calidad, calibracion, robustez ni regresiones frente al modelo base, mas alla de los dos canarios mostrados.
- Riesgo de alucinacion: amplificar una direccion de veracidad en los pesos no elimina la generacion de contenido falso; cambia el estilo de la respuesta, como muestra el canario, no su correccion factual.
- Idiomas no declarados: el autor no especifica la lista de idiomas soportados, por lo que el comportamiento multilingue es desconocido.
- Longitud de contexto no declarada: no se puede planificar el uso con estados largos o esquemas extensos sin conocer la ventana efectiva.
- Requiere codigo personalizado: el repositorio incluye `joint_schema_model.py` y depende de `trust_remote_code=True` en transformers, lo que implica ejecutar codigo de terceros en el entorno de produccion y revisarlo antes de desplegar.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, con creacion y ultima actualizacion el mismo dia (4 de octubre de 2026). No hay evidencia de uso independiente ni de replicacion por terceros.
- Fecha de publicacion futura respecto a la fecha de consulta habitual de los repositorios; conviene verificar la vigencia del repositorio antes de integrarlo.
- Licencia: Apache 2.0 permite uso comercial, pero se mantiene la obligacion de atribucion a Cloudflare/clef-flash y a Qwen/Qwen3.5-9B. Debe conservarse el aviso de licencia y la atribucion del modelo base.
- La arquitectura hibrida implica que cualquier herramienta de edicion o cuantizacion que asuma atencion completa puede fallar o producir resultados incorrectos sobre las 24 capas de atencion lineal.
- No hay informacion sobre sesgos demograficos, de genero, culturales o de idioma especificos de esta variante.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ApolloRaines/Clef-Flash-Truthful-m0.5
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- Variante mayor de Clef: https://huggingface.co/Cloudflare/clef
- Backbone: https://huggingface.co/Qwen/Qwen3.5-9B
- Anuncio de los modelos de decision Clef en el blog de Cloudflare: https://blog.cloudflare.com/clef-decision-models
- Leaderboard Decision Index: https://clef-evals.workers-ai-mle.workers.dev
- Herramienta jBlaze: https://jblaze.dev
- Metodologia y comparativa con ROME, MEMIT, AlphaEdit y LoRA: https://jblaze.dev/prior-work.html
- Busqueda web: no se han encontrado enlaces relevantes sobre el modelo. Los resultados devueltos corresponden al sitio web del Juventus Football Club y no guardan relacion con la ficha.
