# N8STORM/Qwen3.8-27B-OBLITERATED

## Resumen

Qwen3.8-27B-OBLITERATED es una variante "abliterated" (sin mecanismos de rechazo) del modelo Qwen/Qwen3.8-27B, publicada por el usuario N8STORM en Hugging Face. Se trata de una modificacion de pesos que elimina el comportamiento de rechazo y las respuestas de tipo "safety lecture" mediante tecnicas de proyeccion de direcciones de rechazo en el espacio de pesos (abliteration), sin reentrenar el modelo desde cero. El resultado es un modelo de 27.781 millones de parametros (aproximadamente 27,8B) que conserva gran parte de las capacidades del modelo base pero responde sin filtros de seguridad.

La relevancia de esta publicacion es doble. Por un lado, sirve como material de investigacion en seguridad de IA (red-teaming, evaluacion de robustez de alineamiento, estudios de abliteration). Por otro, ilustra el estado actual de las tecnicas de "uncensoring" aplicadas a modelos de gran tamano: el autor documenta tres iteraciones (V1, V2, V3) con distintos compromisos entre eliminacion de rechazos y degradacion de capacidad medida en MMLU. La version V3 reporta una perdida de 2,1 puntos porcentuales en MMLU respecto al modelo base, con eliminacion tanto de rechazos duros como de evasivas blandas.

El modelo se distribuye en formatos safetensors, GGUF y MLX, con licencia Apache 2.0 heredada del modelo base. El repositorio ocupa 237,1 GB, lo que refleja la presencia de multiples cuantizaciones y formatos. No se dispone de informacion sobre idiomas soportados ni sobre la longitud de contexto en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (model_type: qwen3), derivada de Qwen/Qwen3.8-27B |
| Parametros totales | 27.781.427.952 (27,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors (bfloat16 segun ejemplo de codigo), GGUF, MLX |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, MLX |

## Arquitectura y entrenamiento

El modelo es una modificacion de pesos del Qwen/Qwen3.8-27B, un transformer denso de 27,8B parametros. No se ha reentrenado: la intervencion consiste en abliteration, es decir, identificar direcciones en el espacio de activaciones/pesos asociadas al comportamiento de rechazo y proyectarlas fuera de la matriz de pesos. El autor documenta tres versiones del proceso. V1 aplico una unica pasada agresiva de SVD con 5 direcciones, eliminando los rechazos duros pero con una caida de 6 puntos en MMLU. V2 introdujo lo que el autor denomina "complementary abliteration blending": combinar dos cirugias con modos de fallo distintos (SVD, que captura el rechazo de forma agresiva pero dano la capacidad, y LEACE, que minimiza la informacion mutua preservando capacidad pero con menor eliminacion de rechazo) y mezclar sus pesos al 60/40. V3 aplica refinamiento iterativo sobre V2 mas una pasada de cirugia dirigida con un corpus focalizado por categoria de evasion, seguida de un blend final.

No se dispone de informacion sobre el numero de tokens de entrenamiento original del modelo base, la composicion del dataset, ni si hubo RLHF/DPO en su alineamiento, ya que la model card proporcionada no incluye esos datos. Tampoco se documentan innovaciones de inferencia como decodificacion especulativa o attention linear. La unica innovacion tecnica descrita es el metodo de abliteration por blending complementario e iterativo.

## Capacidades

- Generacion de texto conversacional y de proposito general, heredada del modelo base Qwen3.8-27B.
- Razonamiento y conocimiento general medido en MMLU (82,3% en la version V3, 0-shot, n=5700).
- Generacion de codigo: el autor reporta 20/20 tareas de codigo/ciberseguridad resueltas con codigo funcional en V3.
- Modo thinking: la V3 es compatible con `enable_thinking` activado y desactivado, sin rechazos en ninguno de los dos modos.
- Respuestas sin rechazo ni evasivas de seguridad en consultas restringidas, segun la evaluacion manual del autor.
- Soporte de tool calling / function calling: no documentado explicitamente en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: el autor incluye una seccion especifica de uso agentico (harness de coding agents, frameworks de pentest) con recomendaciones de parametros, lo que implica uso previsto en bucles de agente.
- Capacidades multilingues: no disponibles.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Investigacion en seguridad de IA y red-teaming: el modelo permite estudiar que comportamientos persisten tras eliminar los rechazos y como se degrada la capacidad, sirviendo como caso control en estudios de alineamiento y robustez. Es adecuado porque el autor documenta el proceso completo V1-V3 con metricas de capacidad.
- Evaluacion de tecnicas de abliteration: comparar SVD, LEACE y blending complementario sobre un mismo modelo base de 27,8B permite medir el compromiso entre eliminacion de rechazo y perdida de MMLU de forma reproducible.
- Generacion de codigo ofensivo controlado en entornos de laboratorio: el autor reporta 20/20 en tareas de codigo/ciberseguridad; util en ejercicios de pentest autorizados donde el modelo base rechazaria la peticion.
- Agentes de codigo autonomos: la model card incluye ajustes especificos para harness agenticos (repetition_penalty 1,15, temperature 0,1-0,3, resumen de contexto tras ~10 turnos), lo que lo hace adecuado para pipelines de agente con multiples llamadas a herramientas.
- Analisis de contenido sensible para moderacion: generar respuestas a consultas restringidas permite construir datasets de evaluacion para clasificadores de seguridad y sistemas de moderacion.
- Investigacion sobre alucinacion y fidelidad: al eliminar las evasivas de seguridad, el modelo expone directamente su comportamiento generativo, lo que facilita estudiar cuando inventa contenido frente a cuando responde con sustancia real.
- Despliegue local en Apple Silicon: la disponibilidad de pesos en formato MLX permite ejecutar el modelo en hardware de Apple para experimentacion offline.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (MMLU, lm-eval-harness, 0-shot, n=5700, 100 preguntas por materia):

| Modelo | MMLU | Stderr | vs stock |
|---|---|---|---|
| Qwen3.8-27B (stock) | 84,5% | no disponible | — |
| V1 | 81,4% | no disponible | -6,0 pp |
| V2 | 84,3% | no disponible | -0,3 pp |
| V3 | 82,3% | no disponible | -2,1 pp |

Otras metricas cualitativas reportadas por el autor (no benchmarks estandarizados):

| Metrica | Stock | V3 |
|---|---|---|
| Tareas de codigo/ciberseguridad (20 prompts) | rechaza | 20/20 con codigo funcional |
| Tareas avanzadas del mundo real (8) | 5/8 | 7/8 |
| Modo thinking | si | si (sin rechazos) |

No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, MMLU-Pro, etc.) en la informacion disponible. Los datos de MMLU son autoevaluados por el autor y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 55-56 GB solo para pesos (27,8B x 2 bytes), mas overhead de activaciones y KV cache; se recomienda 64-80 GB para contexto largo.
- Cuantizacion a 8 bits: aproximadamente 28 GB de pesos; a 4 bits: aproximadamente 14-16 GB, segun el esquema GGUF/MLX elegido.
- GPU recomendadas: A100 80GB o H100 para bfloat16 sin cuantizar; A100 40GB o RTX 6000 Ada para 8 bits; RTX 4090 (24 GB) viable solo con cuantizacion 4 bits y contexto moderado.
- Cabe en GPU consumer: si, con cuantizacion 4 bits en RTX 4090, RTX 3090 (24 GB) o similares; en 8 bits requiere GPUs de 32 GB o mas.
- Opciones de despliegue: llama.cpp (con `--jinja` para la plantilla de chat incluida en los GGUF), Ollama, LM Studio, MLX (Apple Silicon), transformers con `device_map="auto"`. vLLM y TGI no estan documentados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Licencia | Formatos | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-OBLITERATED (V3) | 27,8B | no disponible | 82,3% (0-shot, autor) | Apache 2.0 | safetensors, GGUF, MLX | Abliterated, sin rechazos |
| Qwen/Qwen3.8-27B (stock) | 27,8B | no disponible | 84,5% (0-shot, autor) | Apache 2.0 | safetensors, GGUF | Modelo base con alineamiento estandar |
| Otras variantes abliterated de la familia Qwen3 | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

La comparativa con alternativas de la misma categoria (otros modelos abliterated de ~27B) no esta disponible en la informacion proporcionada. La unica comparacion solida es contra el modelo base stock, del que se heredan arquitectura y licencia.

## Limitaciones y advertencias

- Eliminacion deliberada de mecanismos de seguridad: el modelo responde a consultas que el modelo base rechazaria, incluido contenido de ciberseguridad ofensiva. No es apto para despliegue en produccion orientado a usuarios finales sin capas de moderacion externas.
- Degradacion de capacidad: la V3 pierde 2,1 puntos de MMLU respecto al stock (82,3% frente a 84,5%), y la V1 perdia 6 puntos. El compromiso entre liberacion y capacidad es real y medido por el autor.
- Datos autoevaluados: las metricas de MMLU y las evaluaciones cualitativas (20/20 en codigo, 7/8 en tareas reales) son reportadas por el autor sin verificacion independiente ni detalle de metodologia mas alla de n=5700 en MMLU.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la eliminacion de evasivas puede aumentar la confianza aparente en respuestas incorrectas, pero no hay datos que lo confirmen.
- Sensibilidad a parametros: el autor advierte que temperature 0 y repetition_penalty 1,15 son criticos; valores fuera de rango degradan la calidad o provocan bucles. Esto indica fragilidad en la generacion.
- Prompt de sistema: el autor recomienda no usar system prompt porque puede reintroducir rechazos, lo que limita el control de comportamiento en produccion.
- Idiomas y contexto: no se dispone de informacion sobre cobertura multilingue ni longitud de contexto, lo que impide evaluar su idoneidad para tareas de contexto largo o no inglesas.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume la responsabilidad legal y etica del contenido generado sin filtros.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad; conviene auditar los pesos antes de usarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/N8STORM/Qwen3.8-27B-OBLITERATED
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper de referencia sobre abliteration (no enlazado en la model card; no disponible en la informacion proporcionada)
- Repositorio del metodo LEACE (no enlazado en la model card; no disponible en la informacion proporcionada)
- Blog o demo del autor: no disponible en la informacion proporcionada
