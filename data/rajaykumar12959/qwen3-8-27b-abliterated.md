# rajaykumar12959/qwen3.8-27b-abliterated

## Resumen

Qwen3.8-27B Abliterated es un checkpoint derivado del modelo Qwen/Qwen3.8-27B al que se le ha eliminado a nivel de pesos la direccion de rechazo (refusal) mediante una tecnica de ablacion por diferencia de medias. El autor del repositorio es el usuario de HuggingFace rajaykumar12959 y el modelo base pertenece a la familia Qwen. El problema que aborda es el de los modelos alineados que se niegan a responder a determinadas peticiones: aqui la tasa de rechazo baja del 99,3% al 0,0% en un conjunto de 292 prompts daninos repartidos en 12 categorias.

La edicion no usa LoRA ni hooks en tiempo de ejecucion: la direccion se extrae de la capa 37 de 64, se purifica por Gram-Schmidt y se ortogonaliza de forma cerrada contra todas las matrices que escriben en el flujo residual (o_proj de las 16 capas de atencion completa, out_proj de las 48 capas de atencion lineal Gated DeltaNet y down_proj de las 64 capas). El resultado queda grabado en el checkpoint y es irreversible salvo que se vuelva a descargar el modelo original.

Se trata de un modelo solo de texto de 26.895.998.464 parametros (~26,9 B) en bf16, aunque el repositorio base sea un modelo de vision-lenguaje: el encoder de vision y la cabeza de prediccion multi-token (MTP) no estan incluidos. Es relevante ahora porque documenta con detalle el coste de capacidad asociado a eliminar el rechazo (3,3 puntos de MMLU-Pro) y ofrece una curva de compromiso entre coeficiente de ablacion y tasa de rechazo. El repositorio es muy reciente (publicado el 9 de octubre de 2026) y practicamente sin adopcion: 0 descargas y 1 like en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion completa y atencion lineal Gated DeltaNet, clase `Qwen3_5ForCausalLM`; 64 capas en total (16 de atencion completa y 48 de atencion lineal) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | No aplica: segun la informacion disponible no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible: el repositorio solo publica pesos bf16 en safetensors |
| Idiomas soportados | No disponible (la model card solo indica que las generaciones comprobadas son respuestas fluidas en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo base es un transformer hibrido de 64 capas que combina 16 capas de atencion completa con 48 capas de atencion lineal del tipo Gated DeltaNet. El checkpoint abliterado conserva la configuracion y el tokenizer/chat template del original, y solo modifica los tensores que escriben en el flujo residual: `self_attn.o_proj` en las capas de atencion completa, `linear_attn.out_proj` en las capas de atencion lineal y `mlp.down_proj` en las 64 capas.

El metodo no implica entrenamiento por gradiente ni RLHF/DPO. Se calcula una direccion de rechazo por diferencia de medias en fp32 sobre el ultimo token con plantilla de chat, comparando activaciones de prompts daninos frente a prompts inofensivos. Esa direccion se purifica contra la direccion media de los prompts inofensivos y se normaliza, y despues se elimina de los pesos mediante ortogonalizacion en forma cerrada: para una proyeccion `y = Wx + b`, se aplica `W' = W − d̂(d̂ᵀW)` y `b' = b − (d̂·b)d̂`. La capa elegida fue la 37 (58% de profundidad), seleccionada tras un barrido por las capas 33, 37, 41, 47, 53 y 56 con coeficientes 1,0 / 0,85 / 0,7 / 0,5. Curiosamente, las capas con mayor puntuacion de calidad de senal (53 y 56) fueron las que menos suprimieron el rechazo. Los conjuntos de datos empleados para extraer la direccion y evaluar son walledai/AdvBench (prompts daninos) y tatsu-lab/alpaca.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles, con respuestas fluidas de longitud y diversidad lexica comparables a las del modelo original segun las comprobaciones del autor.
- Razonamiento y conocimiento general: 61,8% en MMLU-Pro en modo zero-shot por verosimilitud de la letra de respuesta (sin cadena de pensamiento) y 1,000 en ARC-Easy (100 preguntas).
- Respuesta sin rechazo: 0,0% de tasa de rechazo en 292 prompts daninos reservados, repartidos en 12 categorias, frente al 99,3% del modelo original.
- Plantilla de chat con parametro `enable_thinking`, heredada del modelo base; todas las evaluaciones publicadas se hicieron con `enable_thinking=False`. El modo thinking no fue evaluado.
- Capacidad multilingue: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Vision: no disponible. El checkpoint es solo texto; el encoder de vision del modelo base no esta incluido.
- Prediccion multi-token (MTP): no incluida.

## Casos de uso

- Investigacion en seguridad de IA y red teaming: sirve como sujeto de prueba para medir hasta que punto un guardrail externo (clasificador de entrada/salida) sigue siendo necesario cuando el propio modelo ya no rechaza, y para estudiar la geometria de la direccion de rechazo con un modelo de 64 capas.
- Generacion de datos adversarios para evaluar filtros: al no rechazar, el modelo puede producir lotes de prompts y respuestas hostiles controlados que alimenten la evaluacion de clasificadores de toxicidad, siempre en un entorno aislado y con registro de uso.
- Estudio comparado de metodos de abliteracion: la model card publica la tabla de compromiso coeficiente/rechazo, lo que permite reproducir el experimento y comparar ablacion con pesos frente a hooks en tiempo de ejecucion sobre el mismo modelo original.
- Escritura creativa sin filtros tematicos: narrativa de terror, thriller o ficcion con violencia y contenido sensible, donde los rechazos del modelo alineado interrumpen la generacion y obligan a reescribir el prompt.
- Analisis de contenido danino ya existente: clasificacion, resumen o reescritura de material sensible (informes de abuso, corpus de discurso de odio) en tareas de anotacion donde un modelo alineado se negaria a procesar la entrada.
- Despliegue on-premise con requisitos de confidencialidad: al ser un checkpoint Apache 2.0 con pesos abiertos, se puede servir en una maquina de 80 GB controlada por la organizacion, sin llamadas a API externas, para procesar texto que no puede salir del perimetro.
- Ajuste fino posterior: partir de un modelo ya sin direccion de rechazo puede simplificar proyectos de investigacion sobre alineacion, ya que el punto de partida no presenta el sesgo de rechazo que se quiere estudiar.

## Benchmarks y rendimiento

Resultados publicados por el autor, comparando el modelo original con el abliterado sobre las mismas preguntas:

| Metrica | Original | Abliterado |
|---|---|---|
| Tasa de rechazo (292 prompts daninos reservados, 12 categorias) | 99,3% | 0,0% |
| MMLU-Pro (490 preguntas, 35 por asignatura x 14; azar 11,7%) | 65,1% | 61,8% (-3,3 pp) |
| Divergencia KL en prompts inofensivos (primer token, 90 prompts) | no disponible | 0,086 nats |
| Mismo top-1 en el primer token que el original, prompts inofensivos | no disponible | 92,2% |
| ARC-Easy (100 preguntas) | 1,000 | 1,000 |

Desglose de MMLU-Pro por asignatura (las diferencias de 1-2 preguntas por asignatura son ruido, ya que 1 pregunta equivale a 2,9 pp):

| Asignatura | Original | Abliterado |
|---|---|---|
| biology | 97,1% | 97,1% |
| business | 45,7% | 34,3% |
| chemistry | 60,0% | 51,4% |
| computer science | 68,6% | 68,6% |
| economics | 68,6% | 62,9% |
| engineering | 48,6% | 45,7% |
| health | 80,0% | 77,1% |
| history | 91,4% | 88,6% |
| law | 45,7% | 48,6% |
| math | 48,6% | 45,7% |
| other | 57,1% | 57,1% |
| philosophy | 57,1% | 54,3% |
| physics | 54,3% | 51,4% |
| psychology | 88,6% | 82,9% |

Curva de compromiso con ablacion reversible mediante hook en tiempo de ejecucion, misma direccion, evaluada por el modelo sin modificar:

| Coeficiente | Tasa de rechazo | Capacidad |
|---|---|---|
| 1,00 | 0,0% | 1,000 |
| 0,85 | 0,3% | 1,000 |
| 0,70 | 2,1% | 1,000 |
| 0,50 | 3,1% | 1,000 |

Tasa de rechazo en la porcion de validacion (50 prompts) segun capa y coeficiente:

| Capa | c=1,0 | c=0,85 | c=0,7 | c=0,5 |
|---|---|---|---|---|
| 33 | 14% | 18% | 16% | 20% |
| 37 | 0% | 0% | 0% | 0% |
| 41 | 0% | 4% | 2% | 2% |
| 47 | 0% | 0% | 0% | 0% |
| 53 | 36% | 38% | 34% | 38% |
| 56 | 70% | 70% | 64% | 66% |

No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, MMLU completo u otros) en la informacion disponible. Los numeros absolutos de MMLU-Pro son inferiores a los publicados por Qwen para el modelo base porque aqui se evalua zero-shot por verosimilitud de la letra, sin cadena de pensamiento ni contexto de 5 ejemplos.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 55 GB de memoria de GPU, segun el propio autor (unos 53,8 GB de pesos mas overhead de activaciones y cache KV).
- GPU recomendadas: una A100 de 80 GB o una H100 de 80 GB para servir el modelo en bf16 en una sola tarjeta.
- GPU de consumo: no cabe en bf16 en una RTX 4090 ni en ninguna GPU de 24 GB. Como el repositorio no publica pesos GGUF ni cuantizados, el uso en hardware de consumo exigiria convertir y cuantizar por cuenta propia, algo no documentado por el autor.
- Multi-GPU: es posible repartir el modelo con `device_map="auto"` en Transformers, aunque no se publican cifras de latencia ni de throughput en configuraciones multi-tarjeta.
- Opciones de despliegue: Transformers (`>=5.19.0`) es el unico stack probado por el autor. Se recomienda instalar `flash-linear-attention` y, opcionalmente, `causal-conv1d` para acelerar las capas de atencion lineal. No hay confirmacion de soporte en vLLM, TGI, llama.cpp u Ollama, ni pesos GGUF publicados.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro | Tasa de rechazo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B Abliterated (este) | ~26,9 B | no disponible | 61,8% (zero-shot, sin CoT) | 0,0% | Apache 2.0 | safetensors bf16, solo texto |
| Qwen/Qwen3.8-27B (base) | no disponible | no disponible | 65,1% (misma evaluacion) | 99,3% | no disponible | modelo vision-lenguaje completo |
| Alternativas abliteradas de otros tamanos | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card cita Qwen2.5-7B-Instruct unicamente como referencia metodologica, porque su capa ganadora de ablacion tambien se situa al 58% de profundidad (16/28), pero no se aportan datos de rendimiento comparables entre ambos. No se dispone de informacion sobre otros checkpoints abliterados de la misma categoria con la que contrastar parametros, contexto o resultados. Se recomienda tratar la comparacion con el modelo base como la unica contrastada empiricamente, teniendo en cuenta que ambos se evaluaron con el mismo protocolo zero-shot.

## Limitaciones y advertencias

- Eliminacion total del rechazo: la tasa de rechazo es del 0,0% en las 12 categorias evaluadas. El modelo respondera a practicamente cualquier peticion, incluidas las que el modelo original rechazaba. Requiere guardrails externos obligatorios si se expone a usuarios finales.
- Uso previsto eminentemente de investigacion: el autor no publica evaluaciones de seguridad, filtros de salida ni criterios de uso aceptable. Desplegarlo como asistente publico sin capas de moderacion propias es un riesgo legal y reputacional.
- Coste de capacidad medible: la ablacion reduce MMLU-Pro en 3,3 puntos (65,1% a 61,8%). Once de las catorce asignaturas bajan ligeramente, lo que sugiere un efecto sistematico y no ruido estadistico. La mayor caida es en business (45,7% a 34,3%) y chemistry (60,0% a 51,4%).
- Riesgo de degradacion no detectada: la divergencia KL de 0,086 nats y el 92,2% de coincidencia en el primer token indican que la edicion esta mayoritariamente confinada al comportamiento de rechazo, pero un 7,8% de cambios en el primer token sobre prompts inofensivos no es despreciable en tareas de formato estricto.
- Solo texto: a pesar de que el modelo base es vision-lenguaje, este checkpoint no incluye el encoder de vision ni la cabeza MTP. No se puede usar para tareas multimodales.
- Idiomas no especificados: no hay evaluacion multilingue. Las comprobaciones cualitativas se hicieron en ingles, por lo que el rendimiento en castellano u otros idiomas es desconocido.
- Longitud de contexto desconocida: no se documenta la ventana de contexto del modelo base ni si la ablacion afecta al comportamiento en contextos largos.
- Modo thinking sin evaluar: el chat template expone `enable_thinking`, pero todas las metricas publicadas se obtuvieron con `enable_thinking=False`. El rendimiento en modo razonamiento es una incognita.
- Riesgo de alucinacion: no se ha medido. El autor no publica resultados de fidelidad, veracidad ni tasas de alucinacion, ni para el original ni para el abliterado.
- Sesgos: no se ha realizado ninguna evaluacion de sesgo demografico, social o cultural. Se desconocen los sesgos heredados del modelo base y el efecto de la ablacion sobre ellos.
- Adopcion nula y sin validacion externa: el repositorio acumula 0 descargas y 1 like, y todas las metricas proceden del propio autor, sin replicacion independiente. Conviene verificar los resultados antes de usarlos como referencia.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el autor del checkpoint derivado no ofrece garantias ni asume responsabilidad sobre el uso. La licencia del modelo base no se detalla en la informacion disponible.
- Irreversibilidad: la edicion esta grabada en los pesos, no es un hook desactivable. Para recuperar el comportamiento alineado hay que volver al checkpoint original.

## Enlaces

- Repositorio del modelo: https://huggingface.co/rajaykumar12959/qwen3.8-27b-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de prompts daninos (AdvBench): https://huggingface.co/datasets/walledai/AdvBench
- Dataset de instrucciones (Alpaca): https://huggingface.co/datasets/tatsu-lab/alpaca
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
