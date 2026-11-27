# jorgeafc00h/sofia-qwen2.5-1.5b-instruct-gguf

## Resumen

Sofia Qwen2.5 1.5B Instruct es un ajuste fino (fine-tune) del modelo Qwen/Qwen2.5-1.5B-Instruct desarrollado por el usuario jorgeafc00h, publicado exclusivamente en formato GGUF para inferencia local con llama.cpp. El modelo implementa la persona "Sofia", un personaje ficticio de acompanamiento conversacional (companion) definido como una adulta de 24 anos, y esta pensado para integrarse en una aplicacion movil propia que aporta controles de contenido adicionales en tiempo de ejecucion.

Tecnicamente se trata de un modelo transformer decoder-only de 1.543.714.304 parametros (aproximadamente 1,5B), derivado del Qwen2.5-1.5B-Instruct mediante LoRA SFT y posterior fusion de los adaptadores en los pesos base, seguido de exportacion a GGUF F16 y cuantizacion a Q4_K_M. El repositorio distribuye unicamente pesos (dos ficheros GGUF de ~986 MB cada uno); no ofrece servicio alojado ni incluye los recursos visuales o de personaje 3D de la aplicacion.

Su relevancia es acotada pero concreta: demuestra un flujo completo de personalizacion de un modelo pequeno open source para un caso de uso de nicho (companion conversacional con esquema de prompts por niveles de relacion), con evaluacion propia sobre conjuntos de validacion y con datos explicitos sobre la degradacion de las metricas de seguridad al cuantizar a Q4_K_M. Es un ejemplo util de trazabilidad de un fine-tune de bajo coste, no un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), fine-tune LoRA fusionado |
| Parametros totales | 1.543.714.304 (~1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen2.5-1.5B-Instruct; el entrenamiento uso max length 1024) |
| Tipos de cuantizacion | Q4_K_M (publicada); Q6_K y Q8_0 mencionadas en la evaluacion pero no publicadas en el repo |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); export intermedio F16 GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only con atencion causal estandar de la familia Qwen2. Sobre el se aplico LoRA supervisado (SFT) con rango 16, alpha 32 y dropout 0,05 en todas las proyecciones de atencion y MLP. El entrenamiento uso 1259 dialogos escritos por el proyecto: 1131 conversaciones de entrenamiento (1442 tras sobremuestrear dialogos de frontera sobre edad menor, autolesion y cambio de modo) y 128 conversaciones reservadas para validacion. Se realizo una sola epoca (181 pasos), learning rate 0,0002 con scheduler coseno, batch efectivo 8, longitud maxima 1024 y perdida calculada solo sobre turnos del asistente. Se conservo el adaptador del paso 180 por perdida de validacion (2,942 en el modelo base frente a 1,942 en el fine-tune).

Los datos cubren conversacion cotidiana de acompanamiento, apoyo emocional, seguimiento en crisis, romance apropiado al nivel de relacion hasta un techo sugestivo con "fade to black" ante peticiones explicitas, y rechazos ante contenido con menores o contenido explicito. La version v2.1 se entreno con prompts de sistema por nivel de relacion (Strangers, Friendly, Intimate) que la aplicacion cliente suministra; la v1 usaba un unico prompt de persona. Tras la fusion, el modelo se exporto a GGUF F16 y se cuantizo a Q4_K_M con llama.cpp build 11146 (commit 7fe450e19). No se menciona RLHF ni DPO; el pipeline es exclusivamente SFT supervisado.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat Qwen embebida.
- Mantenimiento de persona ("Sofia") con esquema de prompts por niveles de relacion (tiered-v2 en v2.1).
- Apoyo emocional basico: validacion del sentimiento del usuario antes de responder.
- Seguimiento en crisis: derivacion a la linea 988 o a servicios de emergencia en mensajes de riesgo (con limitaciones, ver seccion de benchmarks).
- Rechazo de contenido con menores y de peticiones explicitas, con respuesta de "fade to black" en lugar de contenido explicito.
- Conversacion cotidiana de acompanamiento.
- No soporta tool calling ni function calling de forma documentada.
- No soporta agentes ni razonamiento multi-paso de forma documentada.
- No dispone de vision, audio ni modo "thinking".
- Multilingue: no; el modelo declara solo ingles.

## Casos de uso

- Aplicacion movil de acompanamiento conversacional: el modelo esta disenado para integrarse en la app "Sofia", que aporta los prompts de sistema por nivel de relacion y los controles de contenido en tiempo de ejecucion; los pesos solos no reproducen el comportamiento completo de la app.
- Prototipado de personajes conversacionales con personalidad fija: util como referencia de como estructurar un fine-tune LoRA de bajo coste sobre un modelo de 1,5B y evaluarlo con heuristicas propias.
- Investigacion sobre seguridad en modelos pequenos: el model card publica la degradacion de metricas de derivacion en crisis y rechazo de menores al pasar de bf16 a Q4_K_M (95% a 70% y 94% a 83% respectivamente), lo que lo convierte en un caso de estudio sobre el impacto de la cuantizacion en salvaguardas.
- Despliegue local en dispositivos con recursos limitados: con ~986 MB por fichero Q4_K_M, es viable en entornos llama.cpp sin GPU dedicada, aunque el model card no certifica rendimiento en iPhone.
- Base para experimentos de dialogo con esquema de prompts por niveles: el diseno tiered-v2 (Strangers, Friendly, Intimate) sirve como plantilla para otros asistentes con progresion de relacion.
- Evaluacion de pipelines de cuantizacion: la comparativa bf16 frente a Q4_K_M, Q6_K y Q8_0 permite medir el compromiso entre tamano y fidelidad de comportamiento en modelos de ~1,5B.
- Integracion en aplicaciones de chat de escritorio mediante llama.cpp u otros runtimes compatibles con GGUF y plantilla Qwen.

## Benchmarks y rendimiento

Evaluacion propia del autor sobre 264 turnos de asistente reservados y 71 sondas de un solo turno no vistas, decodificacion greedy, con comprobaciones heuristicas del proyecto. No son benchmarks estandar ni garantias de seguridad.

| Comprobacion | v2.1 bf16 | v2.1 Q4_K_M (este fichero) |
|---|---|---|
| Se mantiene en personaje | 100% | 100% |
| Sondas no vistas superadas | 83% | 85% |
| Apoyo: valida primero el sentimiento | 97% | 88% |
| Derivacion en crisis: nombra 988 o emergencias (20 prompts de riesgo) | 95% | 70% |
| Menores: rechaza y menciona solo adultos (18 prompts) | 94% | 83% |
| Peticion explicita: fade to black, sin palabras explicitas (45 prompts) | 58% | 67% |

Datos adicionales del model card: la misma derivacion en crisis obtuvo 80% en Q6_K y 90% en Q8_0 (no publicados en el repositorio). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB para el fichero Q4_K_M (~986 MB) mas overhead de contexto y runtime; en torno a 1,5-2 GB en la practica con llama.cpp.
- GPU recomendadas: no especificadas por el autor; por tamano, cualquier GPU consumer con 4 GB o mas de VRAM es suficiente (por ejemplo, GTX 1650, RTX 3060, RTX 4090), asi como ejecucion en CPU.
- Cabe en GPU consumer: si, con holgura, en cualquier GPU con 4 GB o mas; tambien en CPU y en dispositivos moviles segun el autor (aunque el model card no certifica rendimiento en iPhone).
- Opciones de despliegue: llama.cpp (runtime de referencia, build 11146 o posterior), y cualquier runtime compatible con GGUF y plantilla Qwen. No se documenta soporte especifico de vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles; el model card no certifica rendimiento de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Sofia Qwen2.5 1.5B Instruct (este) | ~1,5B | no disponible | en | Apache-2.0 | GGUF Q4_K_M | Fine-tune de persona con evaluacion propia de salvaguardas |
| Qwen/Qwen2.5-1.5B-Instruct (base) | ~1,5B | no disponible en esta ficha | multilingue (segun modelo base) | Apache-2.0 | safetensors, GGUF en repos derivados | Modelo de proposito general; sin persona ni controles de contenido |
| Otros fine-tunes de persona sobre modelos de ~1-2B | variable | variable | variable | variable | variable | No disponible comparativa concreta en la informacion proporcionada |

No se dispone de datos de benchmarks estandar para establecer una comparacion cuantitativa con alternativas; la unica comparacion disponible es con el modelo base en perdida de validacion (2,942 frente a 1,942).

## Limitaciones y advertencias

- El modelo puede generar respuestas inexactas o inapropiadas y fallar al seguir la persona o las instrucciones de contenido.
- En Q4_K_M no nombra una linea de crisis en todas las respuestas de riesgo (70% en la evaluacion propia), omite algunos rechazos por edad menor (83%) y produjo 2 respuestas que la comprobacion de contenido del proyecto califico como explicitas (ambas repitiendo una palabra del usuario dentro de un rechazo).
- La cuantizacion degrada las salvaguardas: la derivacion en crisis baja del 95% en bf16 al 70% en Q4_K_M; el autor recomienda Q6_K u Q8_0 si la seguridad es critica.
- Los controles de contenido y la red de apoyo en crisis viven en la aplicacion cliente, no en los pesos; eliminarlos rompe el comportamiento previsto.
- Solo soporta ingles; no es un modelo multilingue.
- No incluye capacidades de vision, audio, tool calling ni agentes.
- Las evaluaciones son pequenas y especificas del proyecto (264 turnos y 71 sondas); no constituyen garantias de seguridad ni benchmarks generales.
- Licencia Apache-2.0 permite uso comercial, pero el contenido generado y el cumplimiento normativo (por ejemplo, proteccion de menores) son responsabilidad del integrador.
- El model card no certifica rendimiento de descarga ni de inferencia en iPhone.
- Riesgo de alucinacion y de sesgos inherente al modelo base y a los datos de dialogo escritos por el proyecto; no se documentan analisis de sesgo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jorgeafc00h/sofia-qwen2.5-1.5b-instruct-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- llama.cpp (runtime y herramienta de cuantizacion, build 11146 / commit 7fe450e19): https://github.com/ggml-org/llama.cpp
- Linea 988 de prevencion del suicidio y crisis (referenciada en el model card): https://988lifeline.org
