# Calm153/vitrion-qwen3-1.7b-qlora-n64

## Resumen

Vitrion Qwen3-1.7B QLoRA n64 es un adaptador QLoRA publicado por el usuario Calm153 sobre el modelo base Qwen/Qwen3-1.7B. No se trata de un modelo completo, sino de un checkpoint de ajuste fino (PEFT) entrenado con 64 conversaciones sintéticas para una tarea ficticia y estrecha de tipo "máquina": el modelo debe producir decisiones y configuraciones exactas en formato JSON, manteniendo un estado interno que solo se declara en el primer turno de la conversación.

El autor lo describe explícitamente como un "draft checkpoint" (borrador) y no como un controlador de seguridad apto para producción. La evaluación propia sobre 30 conversaciones (180 turnos puntuados) arroja una adherencia a especificación de 0,4, robustez de 0,48 y una tasa de conversaciones superadas de 0,13, con un umbral de fiabilidad declarado del 100 % que el modelo no alcanza.

Su relevancia es metodológica más que práctica: documenta un experimento de ajuste fino con datos sintéticos generados por un profesor guiado por oráculo, con evaluación mediante un juez LLM y un conjunto de fallos tipificados. El repositorio ocupa 0,1 GB y acumula 16 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador QLoRA (PEFT) sobre transformer decoder-only Qwen3-1.7B |
| Parametros totales | No disponible (el adaptador depende de Qwen3-1.7B; el tamaño del adaptador no se detalla) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3-1.7B) |
| Tipos de cuantizacion | QLoRA implica cuantizacion del base durante el entrenamiento; no se detallan formatos de inferencia publicados |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador PEFT de tipo QLoRA entrenado sobre Qwen/Qwen3-1.7B, un transformer decoder-only de 1.700 millones de parametros. La revision del modelo base fijada es 70d244cc86ccca08cf5af4e1e306ecf908b1ad5e. El entrenamiento se realizo con 64 conversaciones sinteticas; las etiquetas del profesor fueron guiadas por oraculo y filtradas de forma exacta, no inferidas de manera independiente, segun advierte el propio autor.

La tarea es deliberadamente estrecha: una funcion oculta finita con transiciones disjuntas, donde el estado inicial se declara una sola vez y las peticiones posteriores no incluyen recordatorio de estado, formula, puntuacion del simulador ni correccion del oraculo. El modelo debe responder con decisiones y configuraciones JSON exactas. El repositorio incluye scripts de evaluacion con dependencias fijadas y un fichero training.json con GPU, recuento de tokens, hiperparametros y metricas reales de entrenamiento, aunque esos valores no se reproducen en la informacion disponible. Quedan pendientes una evaluacion retenida por el equipo, una curva final con cuatro tamanos y la determinacion del N minimo viable.

## Capacidades

- Generacion de respuestas estructuradas en JSON para una tarea sintetica de decision y configuracion.
- Mantenimiento implicito de estado conversacional a lo largo de multiples turnos, sin recordatorios explicitos.
- Razonamiento de un solo paso sobre una funcion oculta finita definida en el conjunto de entrenamiento.
- Conversacion multi-turno (la evaluacion puntua 180 turnos repartidos en 30 conversaciones).
- Capacidades generales de Qwen3-1.7B potencialmente conservadas (generacion de texto, codigo, matematicas), aunque no se documentan ni se evaluan en esta ficha.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking especifico del adaptador.

## Casos de uso

- Investigacion sobre ajuste fino con datos sinteticos: sirve como referencia reproducible para estudiar como 64 conversaciones afectan a la adherencia a especificacion en un modelo de 1,7B, con codigo de evaluacion y commits fijados.
- Estudio de robustez conversacional: el conjunto de fallos tipificados (WRONG_STATE, SAFE_REJECTION, UNSAFE_ACCEPTANCE, entre otros) permite analizar modos de error en tareas con estado oculto.
- Prototipado de validacion de formato JSON: util para comprobar pipelines de parseo y validacion de salidas estructuradas antes de invertir en un modelo mayor.
- Evaluacion de jueces LLM: el script eval.py usa un juez LLM informado con API key por entorno, lo que facilita experimentar con criterios de evaluacion automatizada.
- Docencia y divulgacion: ejemplo realista de las limitaciones de un checkpoint borrador con metricas por debajo del umbral declarado, adecuado para explicar por que no debe desplegarse como controlador de seguridad.
- Base para comparativas de escalado: al ser el punto n=64 de una curva prevista de cuatro tamanos, permite contrastar resultados cuando se publiquen los demas checkpoints.

## Benchmarks y rendimiento

Evaluacion propia del autor sobre 30 conversaciones y 180 turnos puntuados (run "tuned-64"):

| Metrica | Valor |
|---|---|
| Conversaciones completadas | 30 de 30 |
| Turnos puntuados | 180 |
| Adherencia a especificacion | 0,4 |
| Robustez | 0,4803921568627451 |
| Conversaciones superadas | 0,13333333333333333 |
| Adherencia del juez LLM | 0,4 |
| Errores del juez | 0 |

Desglose de fallos:

| Tipo de fallo | Recuento |
|---|---|
| WRONG_STATE | 108 |
| WRONG_DECISION | 53 |
| SAFE_REJECTION | 47 |
| REJECTED_STATE_MUTATION | 37 |
| UNSAFE_ACCEPTANCE | 6 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; al apoyarse en Qwen3-1.7B, el base en precision completa requiere del orden de 3,4 GB solo para pesos, y en cuantizacion de 4 bits alrededor de 1 GB, mas overhead de activaciones y KV cache (estimacion general, no publicada por el autor).
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano del base (1,7B), aunque el autor no lo documenta.
- Opciones de despliegue: el adaptador es PEFT sobre safetensors; requiere cargar Qwen3-1.7B y aplicar el adaptador. El autor no detalla soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Vitrion Qwen3-1.7B QLoRA n64 | Adaptador sobre 1,7B | No disponible | Apache 2.0 | Checkpoint borrador, evaluacion propia con adherencia 0,4 |
| Qwen/Qwen3-1.7B (base) | 1,7B | No disponible en esta ficha | Apache 2.0 (segun el adaptador) | Modelo generalista sin ajuste para la tarea sintetica |
| Otros adaptadores QLoRA sobre Qwen3-1.7B | Variable | Heredado del base | Variable | No disponible |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El autor lo califica explicitamente como borrador y no como controlador de seguridad de produccion.
- La adherencia a especificacion (0,4) y la tasa de conversaciones superadas (0,13) estan muy por debajo del umbral de fiabilidad del 100 % declarado por el propio autor.
- Se registran 6 casos de UNSAFE_ACCEPTANCE y 47 de SAFE_REJECTION, lo que indica comportamiento inseguro o excesivamente conservador en una parte de los turnos.
- El tipo de fallo dominante es WRONG_STATE (108 de 180 turnos), es decir, perdida o corrupcion del estado conversacional.
- Las etiquetas de entrenamiento fueron guiadas por oraculo y filtradas de forma exacta, no inferidas de forma independiente, lo que puede inflar la calidad aparente de los datos.
- La evaluacion mide una funcion oculta finita y sintetica con transiciones disjuntas; no extrapola a dominios reales.
- No se documentan idiomas soportados ni sesgos conocidos.
- La licencia Apache 2.0 permite uso comercial del adaptador, pero el modelo base Qwen3-1.7B tiene sus propias condiciones que deben verificarse por separado.
- El script de evaluacion requiere una API key de OpenAI leida del entorno; el autor advierte de no guardar claves reales en comandos o informes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Calm153/vitrion-qwen3-1.7b-qlora-n64
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.
