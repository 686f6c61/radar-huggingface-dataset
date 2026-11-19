# gyohng/flint-terse

## Resumen

Flint Terse es un adaptador LoRA en formato GGUF para el modelo Recursive Flint, desarrollado por el usuario gyohng. Su proposito es reducir drasticamente la longitud del razonamiento interno del modelo (el contenido dentro de las etiquetas `<think>`) sin sacrificar la calidad de las respuestas finales. Segun la model card, el adaptador reduce el pensamiento en aproximadamente un 62 % en tareas de codigo, un 79 % en matematicas y un 85 % en prosa y conversacion, manteniendo e incluso mejorando ligeramente las puntuaciones del modelo base en las pruebas internas del autor.

El modelo base es Recursive Flint, un modelo de arquitectura no especificada en la informacion disponible, distribuido originalmente en cuantizacion int4 (archivo `flint-int4-q4_1.gguf`). El adaptador se aplica sobre esa cuantizacion concreta sin modificar los pesos base, lo que lo hace directamente utilizable en llama.cpp y LM Studio. El repositorio ocupa 0,3 GB e incluye el archivo LoRA (171 MB) y una plantilla de chat adaptada para LM Studio.

La relevancia de este adaptador radica en su enfoque practico: los modelos con modo de razonamiento extendido generan cadenas de pensamiento largas que incrementan la latencia y el coste de inferencia. Flint Terse demuestra que es posible entrenar, mediante aprendizaje por refuerzo sobre los propios pesos cuantizados, un comportamiento de pensamiento conciso que conserva la precision en codigo y mejora en matematicas, lo que resulta relevante para despliegues en produccion con restricciones de latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 32, FP32) sobre modelo base Recursive Flint; arquitectura del base no disponible |
| Parametros totales | 42.729.472 |
| Parametros activos | no disponible (no se indica que el base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El adaptador se distribuye como GGUF y se aplica sobre la cuantizacion int4 q4_1 del base; no se soportan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (LoRA); plantilla de chat en Jinja |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 en FP32 aplicado sobre los coeficientes int4 del modelo base, concretamente sobre las capas de atencion, el experto compartido y los MLP densos. La mencion al "experto compartido" sugiere que el modelo base emplea una arquitectura de mezcla de expertos (MoE), aunque la informacion disponible no detalla la arquitectura completa del base ni su numero de parametros totales o activos.

El entrenamiento combino aprendizaje por refuerzo y una fase supervisada. En la fase de RL, el modelo aprendio de sus propias respuestas: una respuesta obtenia recompensa solo si superaba sus tests y se ajustaba a un presupuesto de pensamiento decreciente. Posteriormente, una pasada supervisada corta enseno el estilo de pensamiento telegrafico para prosa y conversacion. El autor publica codigo, datos y un script de reproduccion en su repositorio de GitHub. El adaptador debe aplicarse exactamente sobre el archivo `flint-int4-q4_1.gguf` de la revision `9c47151036bc2c34331142dda04488bceab2bc9f` (SHA-256 `43c07baccdba42eb7528a9630ee15699b1942c297291dc1b39a061f508ee1a4b`); otras cuantizaciones no estan soportadas.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base.
- Razonamiento con modo de pensamiento explicito dentro de etiquetas `<think>`, pero con cadenas mucho mas breves que el base.
- Generacion de codigo con precision equivalente al base segun las pruebas del autor.
- Razonamiento matematico, con mejora reportada frente al base en las pruebas internas.
- Respuestas finales completas: el autor afirma que las etiquetas `<think>` no se filtran en la respuesta final.
- Integracion con llama.cpp y LM Studio mediante carga de LoRA en GGUF.
- Soporte de plantilla de chat Jinja compatible con LM Studio.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o vision: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes de codigo en produccion: el adaptador conserva la precision del base en tareas de codigo (102,7 frente a 102,3 en las pruebas del autor) reduciendo el pensamiento un 62 %, lo que disminuye la latencia por peticion en pipelines de generacion y revision de codigo.
- Razonamiento matematico en entornos interactivos: con una reduccion del 79 % en tokens de pensamiento y una puntuacion superior a la del base (109,7 frente a 103,3), es adecuado para tutores o asistentes que resuelven problemas paso a paso con respuesta rapida.
- Chat de atencion al cliente: la reduccion del 85 % en pensamiento para prosa y conversacion permite respuestas mas agiles en dialogos multi-turno, manteniendo la calidad de la respuesta final.
- Despliegue local en estaciones de trabajo: al ejecutarse sobre la cuantizacion int4 del base mediante llama.cpp o LM Studio, puede correr en equipos de desarrollo sin infraestructura GPU dedicada de gran escala.
- Prototipado rapido de agentes conversacionales: la carga en un solo comando mediante el script del repositorio de GitHub facilita experimentar con un modelo de razonamiento conciso antes de invertir en despliegues mayores.
- Reduccion de coste de inferencia: en servicios que facturan por token generado, recortar entre el 62 % y el 85 % de los tokens de pensamiento reduce directamente el coste por consulta sin cambiar el modelo base.
- Evaluacion de tecnicas de RL sobre pesos cuantizados: el codigo y los datos publicados permiten reproducir el entrenamiento y estudiar como afecta el RL aplicado directamente sobre coeficientes int4.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos sobre el base int4 sin modificar en llama.cpp, con media de tres semillas, una muestra por tarea, temperatura 1, top-p 0,95 y top-k 20. Las puntuaciones corresponden a la metrica interna del autor (no se especifica la escala).

| Modelo | Codigo (110 tareas) | Matematicas (120 tareas) | Menos pensamiento: codigo | matematicas | prosa y chat |
|---|---:|---:|---:|---:|---:|
| Flint int4 (base) | 102,3 | 103,3 | — | — | — |
| flint-terse | 102,7 | 109,7 | 62 % | 79 % | 85 % |
| flint-terse-minimalist | 98,0 | 108,0 | 81 % | 86 % | 85 % |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del modelo base Flint en cuantizacion q4_1, cuyos requisitos no se detallan en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el ejemplo de uso documentado esta orientado a LM Studio en Mac (ejecucion en CPU/GPU integrada mediante Metal) y a llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-server` con `--lora`), LM Studio (cargador de un comando del repositorio de GitHub) y MLX mediante la version `gyohng/flint-terse-mlx`.
- Latencia y throughput: no disponibles como cifras absolutas; la reduccion de tokens de pensamiento (62-85 %) implica una disminucion proporcional del tiempo de generacion en la fase de razonamiento.
- Muestreo recomendado: temperatura 1, top-p 0,95, top-k 20.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Puntuacion codigo | Puntuacion matematicas | Licencia | Disponibilidad |
|---|---|---|---:|---:|---:|---|---|
| flint-terse | LoRA GGUF sobre Flint int4 | 42.729.472 (adaptador) | no disponible | 102,7 | 109,7 | Apache-2.0 | Hugging Face + GitHub |
| flint-terse-minimalist | LoRA GGUF sobre Flint int4 | no disponible | no disponible | 98,0 | 108,0 | Apache-2.0 (segun repositorio del autor) | Hugging Face |
| Flint int4 (base) | Modelo base cuantizado | no disponible | no disponible | 102,3 | 103,3 | Apache-2.0 | Hugging Face |
| flint-terse-mlx | Version MLX del adaptador | no disponible | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos para comparar con modelos de otras familias en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador solo es compatible con el archivo `flint-int4-q4_1.gguf` de la revision y SHA-256 indicados; otras cuantizaciones son checkpoints distintos y no estan soportadas.
- Las puntuaciones de benchmarks son internas del autor, con una sola muestra por tarea y una metrica no estandarizada; no son directamente comparables con resultados de MMLU, HumanEval o GSM8K.
- No se dispone de informacion sobre sesgos del modelo base ni del adaptador.
- Riesgo de alucinacion: inherente a los modelos generativos; no se documenta una evaluacion especifica en la informacion disponible.
- Idiomas soportados no documentados; el comportamiento multilingue no esta garantizado.
- Longitud de contexto del base no disponible, lo que impide evaluar su idoneidad para tareas de contexto largo.
- El autor advierte que la plantilla de chat incluida elimina el `replace("\x00", "")` de la plantilla original de Flint porque el motor de plantillas de LM Studio no lo soporta; conviene verificar el comportamiento en otros entornos.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validacion por parte de la comunidad es practicamente inexistente.
- Licencia Apache-2.0 sin condiciones adicionales segun el autor; aun asi, conviene revisar la licencia del modelo base Flint antes de un uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gyohng/flint-terse
- Version MLX: https://huggingface.co/gyohng/flint-terse-mlx
- Version minimalist: https://huggingface.co/gyohng/flint-terse-minimalist
- Modelo base (Repositorio Flint): https://huggingface.co/RecursiveSI/flint
- Modelo base int4 GGUF: https://huggingface.co/RecursiveSI/flint-int4-gguf
- Repositorio GitHub (codigo, datos y reproduccion): https://github.com/gyohng/flint-terse
- Organizacion Recursive: https://huggingface.co/RecursiveSI
