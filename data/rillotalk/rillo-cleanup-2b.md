# rillotalk/rillo-cleanup-2b

## Resumen

rillo-cleanup-2b es un modelo de lenguaje pequeno especializado en la limpieza de dictado en ingles para macOS, desarrollado por rillotalk como componente del producto Rillo. Su tarea no es conversacional en el sentido habitual: recibe una transcripcion cruda de voz a texto y la transforma en el texto que el usuario habria escrito, eliminando muletillas, resolviendo autocorrecciones, anadiendo puntuacion y mayusculas, convirtiendo numeros a digitos y formateando listas dictadas. Una restriccion clave de diseno es que nunca responde ni obedece al contenido dictado, ya que con frecuencia ese contenido es un mensaje dirigido a un asistente de IA.

El modelo es un fine-tuning de Qwen/Qwen3.5-2B, con 1.574.608.704 parametros reales en safetensors (por debajo de los 2B nominales del nombre comercial), distribuido en formato MLX cuantizado a 6 bits y con el vocabulario recortado a aproximadamente 98.000 tokens, los que cubren el texto en ingles. El repositorio ocupa 1,3 GB. La licencia es Apache 2.0, heredada del modelo base.

Su relevancia es acotada pero clara: cubre un nicho de post-procesado de STT en el que los modelos generalistas tienden a "responder" al texto dictado en lugar de limpiarlo, y lo hace con un modelo lo bastante pequeno para ejecutarse localmente en un Mac. No hay publicaciones de benchmarks ni metricas de calidad asociadas en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-2B; detalles de atencion no disponibles) |
| Parametros totales | 1.574.608.704 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits (build MLX); no se documentan otras variantes |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B, un transformer decoder-only, y se ha ajustado mediante fine-tuning supervisado para una unica tarea de reescritura de texto. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esa informacion no esta disponible.

Las decisiones tecnicas documentadas son de despliegue y de formato de entrada mas que de arquitectura. El build distribuido usa MLX con cuantizacion a 6 bits y un vocabulario recortado a unos 98.000 tokens para reducir el espacio de embeddings al subconjunto relevante para ingles. El prompt de sistema es fijo e incluye una lista de palabras del usuario ("Word list:") que actua como sesgo lexico para nombres propios y terminos tecnicos, y la generacion se ejecuta con `enable_thinking=False`, es decir, sin modo de razonamiento extendido.

## Capacidades

- Reescritura de dictado: convierte transcripciones crudas en texto limpio y listo para enviar.
- Eliminacion de muletillas y repeticiones propias del habla espontanea.
- Resolucion de autocorrecciones: conserva unicamente la version final cuando el hablante se corrige.
- Puntuacion y capitalizacion automaticas.
- Normalizacion de numeros: escribe las cantidades habladas como digitos.
- Formateo de listas dictadas oralmente.
- Sesgo lexico mediante lista de palabras proporcionada en el prompt de sistema.
- Restriccion de no seguimiento de instrucciones: no responde ni ejecuta el contenido dictado.
- Sin soporte documentado de tool calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Dictado en macOS dentro de la app Rillo: el modelo recibe la salida del motor STT y devuelve el texto final que se inserta en el campo activo, con puntuacion y mayusculas correctas.
- Mensajes a asistentes de IA por voz: al no obedecer el contenido dictado, permite dictar una instruccion a un LLM sin que el modelo de limpieza la ejecute ni la responda, evitando fugas de comportamiento.
- Correos y mensajes de chat dictados: elimina muletillas y reformula autocorrecciones, de modo que el texto enviado no contiene rastros del habla oral.
- Nombres propios y jerga tecnica: la lista de palabras del prompt de sistema sesga la salida hacia la grafia correcta de nombres de personas, productos o terminos de dominio.
- Notas con listas: formatea enumeraciones dictadas oralmente en listas legibles, util para actas rapidas o checklists.
- Preprocesado en pipelines de STT: puede insertarse como etapa de post-procesado entre el reconocedor y el consumidor final del texto, reduciendo la necesidad de reglas heuristicas de limpieza.
- Ejecucion local en Mac: al ser un modelo de 1,3 GB en MLX 6 bits, permite procesar dictado sin enviar el audio ni el texto a servidores externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni metricas especificas de calidad de limpieza de dictado (por ejemplo, tasa de eliminacion de muletillas o fidelidad semantica respecto al texto dictado).

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio pesa 1,3 GB en 6 bits, por lo que la inferencia cabe holgadamente en 2-3 GB de memoria considerando cache de contexto y overhead del runtime.
- GPU recomendadas: el build es MLX, orientado a Apple Silicon. No se distribuyen pesos en otros formatos en este repositorio.
- Cabe en hardware consumer: si, en cualquier Mac con Apple Silicon (serie M1 en adelante) con memoria unificada suficiente; en GPU NVIDIA no es desplegable sin conversion previa a otro formato.
- Opciones de despliegue: MLX (libreria indicada en la model card). No se documentan pesos GGUF, ni compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. Por el tamano del modelo y la cuantizacion a 6 bits, se espera latencia baja en Apple Silicon, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| rillo-cleanup-2b | 1,57B | no disponible | en | Apache 2.0 | MLX safetensors 6 bits | Fine-tuning especializado en limpieza de dictado |
| Qwen/Qwen3.5-2B (base) | ~2B nominales | no disponible | multilingue | Apache 2.0 | safetensors | Modelo generalista; no especializado en limpieza y propenso a responder al texto dictado |
| Modelos de post-procesado STT comerciales | no disponible | no disponible | varios | propietaria | API | No hay datos publicos comparables de parametros ni contexto |

No se dispone de informacion sobre alternativas open source directamente comparables en la tarea de limpieza de dictado con pesos publicos y metricas verificables.

## Limitaciones y advertencias

- Solo ingles: no se ha entrenado ni evaluado para otros idiomas, y el vocabulario esta recortado a ~98.000 tokens de ingles.
- Sin datos de evaluacion: no hay benchmarks ni metricas de calidad publicadas, por lo que el rendimiento real en produccion no esta cuantificado.
- Riesgo de alucinacion: al ser un modelo generativo, puede introducir palabras no dictadas o alterar el contenido al reescribir; la instruccion de no responder al texto reduce pero no elimina este riesgo.
- Dependencia de la lista de palabras: la calidad en nombres propios y terminos tecnicos depende de que el prompt de sistema incluya la lista adecuada.
- Formato unico: solo se distribuye build MLX 6 bits; no hay pesos en safetensors estandar, GGUF ni otras precisiones, lo que limita el despliegue fuera de Apple Silicon.
- Contexto no documentado: se desconoce la longitud maxima de transcripcion que admite, lo que impide garantizar dictados largos.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en produccion por terceros.
- Licencia: Apache 2.0 permite uso comercial, pero se heredan las condiciones y avisos del modelo base Qwen3.5-2B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rillotalk/rillo-cleanup-2b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Producto Rillo: https://rillo.talk
