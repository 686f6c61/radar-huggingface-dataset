# Kujira/Qwen3.8-27B-GSQ-RCO-IQ2_XS-mtp-CHiPS-Uncensored-v1

## Resumen

Qwen3.8-27B-GSQ-RCO-IQ2_XS-mtp-CHiPS-Uncensored-v1 es una cuantizacion GGUF del modelo Qwen3.8-27B (27.320.697.856 parametros) publicada por el usuario Kujira, que parte de la release GSQ-RCO de ISTA DASLab y le aplica una modificacion para reducir el comportamiento de rechazo (refusal). El modelo base es un transformer denso de la familia Qwen3.8, desarrollado originalmente por el equipo Qwen, y esta cuantizado en formato IQ2_XS con la cabeza MTP (multi-token prediction) conservada para decodificacion especulativa.

La relevancia de esta ficha es doble: por un lado documenta una tecnica de "ablacion de rechazo" aplicada sobre pesos ya cuantizados (CHiPS, Causal Head-isolated Projection Steering, sin detalles publicos), y por otro sirve como ejemplo de publicacion de variantes "uncensored" sobre modelos Apache-2.0. El autor reporta que los rechazos ante peticiones daninas caen del 88,5% al 1%, manteniendo perplejidad y comportamiento de tool calling practicamente identicos al fichero original.

El modelo se distribuye como un unico fichero GGUF de 8,8 GB, sin proyector de vision, y esta pensado para inferencia local con llama.cpp. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.8), con cabeza MTP para decodificacion especulativa |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XS (unica variante publicada, con cabeza MTP incluida) |
| Idiomas soportados | no disponible (la evaluacion del autor usa peticiones en ingles y japones) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero unico de 8,8 GB; repo de 17,6 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 27.320.697.856 parametros derivado de Qwen3.8-27B. La release de ISTA DASLab aplica cuantizacion GSQ-RCO en formato IQ2_XS e incluye la cabeza MTP (multi-token prediction) que permite decodificacion especulativa en llama.cpp. Sobre esos pesos, Kujira aplica CHiPS (Causal Head-isolated Projection Steering), una intervencion que, segun el autor, modifica solo una parte muy pequena del modelo: el resto de tensores son byte-identicos al fichero original. Los detalles del metodo no se han divulgado.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo original; la model card solo describe el proceso de edicion posterior. La evaluacion del autor verifica que la edicion es estable: sobre 64 prompts, la divergencia KL de la distribucion del primer token es de 0,006 o menos, y el token mas probable coincide en 62 de ellos. La perplejidad teacher-forced en textos de referencia de 512 tokens se mantiene dentro del 0,3% respecto al original (ingles 5,546 frente a 5,553; japones 18,355 frente a 18,333; codigo 3,982 frente a 3,978; corpus general 4,161 en ambos).

## Capacidades

- Generacion de texto conversacional de un solo turno y multi-turno (la evaluacion solo cubre un turno sin system prompt).
- Razonamiento con modo "thinking" habilitado, con limite de tokens configurable.
- Tool calling / function calling: 97% de acierto en nombre de herramienta y 100% en argumentos sobre 40 tareas de evaluacion.
- Seguimiento de resultados de herramientas en un turno posterior (100% en la evaluacion del autor).
- Tareas largas de multiples pasos (24 tareas evaluadas, con 12% que alcanzan el limite de tokens).
- Decodificacion especulativa mediante la cabeza MTP incluida en el GGUF.
- Capacidad de vision no verificada: el proyector mmproj no se incluye y el autor indica que no se ha probado.
- Reduccion drastica del comportamiento de rechazo (del 88,5% al 1% en peticiones daninas), lo que constituye una capacidad deliberada de esta variante.

## Casos de uso

- Investigacion sobre alineacion y refusal: el modelo permite estudiar como una intervencion localizada en los pesos altera la tasa de rechazo sin degradar la perplejidad, con una linea base cuantificada (88,5% frente a 1%).
- Evaluacion de tecnicas de edicion de modelos: util para comparar CHiPS con otras aproximaciones como Heretic sobre el mismo fichero cuantizado, usando las tablas de rechazo, bucles y tool calling del autor.
- Despliegue local en equipos con poca VRAM: al ocupar 8,8 GB en IQ2_XS, cabe en GPUs de consumo de 12 GB o mas y permite ejecutar un modelo de 27B en hardware modesto.
- Pruebas de robustez de pipelines de agentes: el modelo conserva tool calling (97%/100%) y seguimiento de resultados (100%), por lo que sirve para validar orquestadores de herramientas en escenarios controlados.
- Generacion de codigo y texto tecnico en local: la perplejidad en codigo (3,982) es la mas baja de las categorias medidas, lo que sugiere un comportamiento estable en ese dominio.
- Analisis de contenido multilingue ingles-japones: la evaluacion cubre ambos idiomas y las perplejidades son consistentes con el original (18,355 en japones).
- Experimentos de decodificacion especulativa: la cabeza MTP incluida permite medir aceleraciones de inferencia en llama.cpp con `--jinja`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor presenta evaluaciones propias comparando tres ficheros de la misma cuantizacion IQ2_XS-mtp:

| Metrica | Original | Heretic | Este modelo |
|---|---|---|---|
| Rechazo en peticiones daninas (104) | 88,5% | 1% | 1% |
| Rechazo en peticiones inofensivas (100) | 4% | 1% | 1% |
| Bucles (daninas / inofensivas) | 0% / 1% | 1% / 1% | 0% / 0% |
| Respuestas vacias (daninas / inofensivas) | 0% / 2% | 1% / 2% | 2% / 2% |
| Tareas largas: limite de tokens | 8% | 21% | 12% |
| Tareas largas: bucles | 0% | 0% | 4% (1 tarea) |
| Tareas largas: salida vacia | 4% | 4% | 4% |
| Tareas largas: tokens medios | 2.151 | 2.260 | 2.083 |
| Tool calls: nombre / argumentos correctos | 97% / 100% | 100% / 100% | 97% / 100% |
| Sin tool call cuando no hace falta | 90% | 100% | 90% |
| Turno posterior tras resultado de herramienta | 100% | 100% | 100% |

Perplejidad teacher-forced (chunks de 512 tokens, textos internos de referencia):

| Corpus | Original | Este modelo |
|---|---|---|
| Ingles | 5,553 | 5,546 |
| Japones | 18,333 | 18,355 |
| Codigo | 3,978 | 3,982 |
| General | 4,161 | 4,161 |

Configuracion de evaluacion: llama.cpp (`llama-server`), thinking activado, temperatura 0,6, top_p 0,95, top_k 20, maximo 1.536 tokens nuevos, semilla fija y cache KV q8_0.

## Requisitos de hardware

- VRAM estimada: el fichero GGUF ocupa 8,8 GB; con cache KV q8_0 y contexto moderado, el consumo real se situa por encima de esa cifra (no se especifica el contexto usado en la evaluacion).
- GPU de consumo: cabe en tarjetas de 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) usando `-ngl 99` para descargar todas las capas.
- GPU profesional: A100, H100 y L40S sin problema de memoria; el cuello de botella sera el ancho de banda, no la VRAM.
- Despliegue: llama.cpp (`llama-server`) es el runtime de referencia segun la model card; el fichero es GGUF estandar y no requiere adaptador ni build especial. Ollama puede cargarlo importando el GGUF; vLLM y TGI no soportan GGUF de forma nativa para este caso.
- Latencia y throughput: no disponibles. La cabeza MTP permite decodificacion especulativa, pero el autor no publica cifras de tokens por segundo.
- Descarga: `hf download Kujira/Qwen3.8-27B-GSQ-RCO-IQ2_XS-mtp-CHiPS-Uncensored-v1 <fichero>.gguf --local-dir .` y arranque con `llama-server -m <fichero>.gguf -ngl 99 --jinja`.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Rechazo (daninas) | Tool calling | Licencia | Formato |
|---|---|---|---|---|---|---|---|
| Este modelo (CHiPS) | 27,3B | IQ2_XS-mtp | no disponible | 1% | 97% / 100% | Apache-2.0 | GGUF |
| ISTA-DASLab Qwen3.8-27B-GSQ-RCO | 27,3B | IQ2_XS-mtp | no disponible | 88,5% | 97% / 100% | Apache-2.0 | GGUF |
| 0bserverx Qwen3.8-27B-Heretic-GSQ-RCO | 27,3B | IQ2_XS-mtp | no disponible | 1% | 100% / 100% | Apache-2.0 | GGUF |
| Qwen3.8-27B (original) | 27,3B | BF16 | no disponible | no disponible | no disponible | Apache-2.0 | safetensors |

La comparativa se limita a variantes del mismo modelo base porque no se dispone de datos de benchmarks estandar que permitan contrastar con otras familias de 27B.

## Limitaciones y advertencias

- El modelo sigue peticiones que el original rechaza y puede producir contenido danino, ofensivo o inexacto; el autor lo restringe a investigacion y a usuarios que comprendan el riesgo.
- La deteccion de rechazo se hizo por coincidencia de frases en ingles y japones, sin revision humana; respuestas que evitan la peticion sin frase de rechazo no se cuentan como rechazo.
- Los conjuntos de evaluacion son pequenos (una peticion equivale a ~1%), por lo que el 1-3% de rechazos varia entre ejecuciones.
- Solo se probaron peticiones de un turno sin system prompt; no se evaluaron conversaciones multi-turno, system prompts ni peticiones reformuladas o adversariales.
- Solo se publica la variante IQ2_XS-mtp; la vision no se ha probado y el proyector mmproj no se incluye.
- La cuantizacion IQ2_XS es agresiva: la perplejidad en japones (18,355) es notablemente alta frente al ingles (5,546), lo que sugiere degradacion en ese idioma.
- No se han publicado resultados de benchmarks estandar, por lo que no hay evidencia publica de rendimiento en MMLU, HumanEval o GSM8K.
- La licencia Apache-2.0 permite uso comercial, pero el autor recomienda anadir salvaguardas propias antes de exponer el modelo a terceros y advierte de la responsabilidad legal del usuario.
- Los detalles del metodo CHiPS no se han divulgado, lo que impide auditar la edicion mas alla de las comprobaciones de KL y perplejidad del autor.
- El autor advierte de un 4% de bucles en tareas largas (una tarea), frente al 0% del original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kujira/Qwen3.8-27B-GSQ-RCO-IQ2_XS-mtp-CHiPS-Uncensored-v1
- Modelo base cuantizado (ISTA DASLab): https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Variante Heretic de referencia: https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-GSQ-RCO-GGUF
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper GSQ (referenciado en tags): https://arxiv.org/abs/2604.18556
- Paper RCO (referenciado en tags): https://arxiv.org/abs/2605.00649
