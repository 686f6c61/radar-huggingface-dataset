# Kujira/Qwen3.8-27B-GSQ-RCO-IQ2_XS-mtp-CHiPS-Uncensored-v1

## Resumen

Qwen3.8-27B-GSQ-RCO-IQ2_XS-mtp-CHiPS-Uncensored-v1 es una cuantizacion GGUF de 27.320.697.856 parametros derivada de ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF, que a su vez parte del modelo base Qwen3.8-27B del equipo Qwen. La publica el usuario Kujira y su rasgo definitorio es la reduccion del comportamiento de rechazo (refusal) mediante una tecnica denominada CHiPS (Causal Head-isolated Projection Steering), aplicada sobre la cuantizacion IQ2_XS-mtp. El resultado es un fichero de 8,8 GB que conserva el mismo esquema de cuantizacion que el original, incluida la cabeza MTP para decodificacion especulativa.

El modelo resuelve un problema muy concreto: obtener una variante del Qwen3.8-27B cuantizado a IQ2_XS que responda a peticiones que el original rechaza, sin degradar la coherencia, el tool calling ni la perplejidad. Segun la model card, el porcentaje de rechazos ante peticiones daninas cae del 88,5 % al 1 %, mientras que las metricas de perplejidad se mantienen dentro del 0,3 % respecto al fichero original. La edicion afecta a una parte muy pequena del modelo: el resto de tensores son identicos byte a byte al fichero de origen.

Es relevante ahora porque demuestra que las tecnicas de steering sobre cabezas de atencion permiten modificar el comportamiento de rechazo de un modelo cuantizado sin reentrenar ni recuantizar, manteniendo el formato GGUF estandar y la compatibilidad con llama.cpp. La licencia es Apache-2.0, heredada del modelo base y de la cuantizacion original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B; detalles de capas y atencion no disponibles en la informacion proporcionada) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XS (unica variante publicada, con cabeza MTP) |
| Idiomas soportados | no disponible (la evaluacion cubre ingles y japones) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (8,8 GB; repo de 17,5 GB) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion IQ2_XS del Qwen3.8-27B original, producida por ISTA DASLab con las tecnicas GSQ y RCO, e incluye la cabeza MTP (multi-token prediction) para decodificacion especulativa. Sobre ese fichero, Kujira aplica CHiPS (Causal Head-isolated Projection Steering), un metodo que modifica de forma aislada las proyecciones de determinadas cabezas de atencion para reducir la conducta de rechazo. No se trata de un reentrenamiento ni de un fine-tuning con datos: la model card indica que la receta concreta no se publica y que las mediciones del articulo de referencia se hicieron sobre otros modelos.

La edicion esta confinada a una fraccion muy pequena de los tensores; el resto permanece byte-identico al fichero de ISTA DASLab. La evaluacion del fichero liberado se contrasto con la misma edicion aplicada en tiempo de carga sobre el original: en 64 prompts, la divergencia KL de la distribucion del primer token es de 0,006 o menos, y el token mas probable coincide en 62 de ellos. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto conversacional en formato GGUF estandar, compatible con llama.cpp y llama-server sin adaptadores ni builds especiales.
- Razonamiento con modo thinking habilitado (la evaluacion usa thinking activado y un limite de 1.536 tokens nuevos).
- Tool calling / function calling: la evaluacion reporta 97 % de acierto en nombre de herramienta y 100 % en argumentos, con 90 % de no invocar herramienta cuando no es necesaria y 100 % de seguimiento tras el resultado de una herramienta.
- Tareas largas de multiples pasos (long-form multi-step), con un rendimiento proximo al original.
- Decodificacion especulativa mediante la cabeza MTP incluida en el fichero.
- Capacidad multilingue limitada en la evaluacion a ingles y japones; no hay listado oficial de idiomas.
- Vision: el proyector mmproj no se incluye en este repo y el uso con vision no se ha probado.

## Casos de uso

- Investigacion sobre alineacion y rechazo: permite estudiar como responde un modelo cuando se elimina gran parte de su conducta de rechazo, comparando el fichero original, la variante Heretic y esta version con las mismas metricas.
- Evaluacion de tecnicas de steering: util para reproducir y contrastar el efecto de CHiPS sobre un modelo cuantizado, midiendo perplejidad y coherencia antes y despues.
- Despliegue local en hardware modesto: al ocupar 8,8 GB en IQ2_XS, se puede ejecutar en GPU de consumo con llama.cpp, lo que facilita experimentar con un modelo de 27B en equipos de gama alta domestica.
- Pruebas de robustez y red teaming: sirve como sujeto de prueba para medir la eficacia de filtros y salvaguardas externas, ya que el propio modelo casi no rechaza peticiones.
- Pipelines de agentes con tool calling: integrable en flujos que requieren invocar funciones y encadenar turnos tras el resultado de una herramienta, con la advertencia de que necesita salvaguardas propias.
- Generacion de texto creativo sin restricciones de contenido: para prototipos y experimentos donde se busca explorar respuestas que el modelo original bloquearia, siempre bajo responsabilidad del usuario.
- Evaluacion comparativa de cuantizaciones: permite medir el impacto de IQ2_XS frente a otras cuantizaciones del mismo modelo base en tareas de razonamiento y codigo.

## Benchmarks y rendimiento

Los datos publicados en la model card no son benchmarks estandar (MMLU, HumanEval, GSM8K), sino evaluaciones propias del autor sobre rechazo, tareas largas, tool calling y perplejidad. Se reproducen a continuacion.

Rechazos y modos de fallo (104 peticiones daninas y 100 inofensivas, thinking activado):

| Metrica | Original | Heretic | Este modelo |
|---|---|---|---|
| Rechazo en peticiones daninas | 88,5 % | 1 % | 1 % |
| Rechazo en peticiones inofensivas | 4 % | 1 % | 1 % |
| Bucles (daninas / inofensivas) | 0 % / 1 % | 1 % / 1 % | 0 % / 0 % |
| Respuestas vacias (daninas / inofensivas) | 0 % / 2 % | 1 % / 2 % | 2 % / 2 % |

Tareas largas y tool calling (24 tareas largas y 40 tareas de tool calling):

| Metrica | Original | Heretic | Este modelo |
|---|---|---|---|
| Tareas largas: limite de tokens alcanzado | 8 % | 21 % | 12 % |
| Tareas largas: bucles | 0 % | 0 % | 4 % (1 tarea) |
| Tareas largas: salida vacia | 4 % | 4 % | 4 % |
| Tareas largas: tokens medios | 2.151 | 2.260 | 2.083 |
| Tool calls: nombre / argumentos correctos | 97 % / 100 % | 100 % / 100 % | 97 % / 100 % |
| Sin tool call cuando no se necesita | 90 % | 100 % | 90 % |
| Turno de seguimiento tras resultado de herramienta | 100 % | 100 % | 100 % |

Perplejidad (teacher-forced, chunks de 512 tokens, textos internos de referencia):

| Corpus | Original | Este modelo |
|---|---|---|
| Ingles | 5,553 | 5,546 |
| Japones | 18,333 | 18,355 |
| Codigo | 3,978 | 3,982 |
| Corpus general | 4,161 | 4,161 |

Las diferencias de perplejidad quedan dentro del 0,3 %. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el fichero GGUF ocupa 8,8 GB en IQ2_XS; con cache KV q8_0 y contexto moderado, el consumo se situa por encima de los 9-10 GB, aunque la cifra exacta depende del contexto configurado y no esta publicada.
- GPU recomendadas: tarjetas con 12-16 GB o mas de VRAM para contexto amplio; una RTX 4090 (24 GB) permite holgura con contexto largo. En A100 y H100 se puede ejecutar, aunque su tamano no las hace necesarias.
- Cabe en GPU de consumo: si, en modelos con 12 GB o mas (por ejemplo RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090) usando llama.cpp con offload completo de capas (`-ngl 99`).
- Opciones de despliegue: llama.cpp / llama-server (metodo documentado por el autor, con `--jinja`), y en general cualquier runtime compatible con GGUF. vLLM, TGI y Ollama no se mencionan en la informacion proporcionada.
- Latencia y throughput: no disponibles. La cabeza MTP permite decodificacion especulativa, lo que deberia aumentar el throughput frente a la decodificacion autoregresiva estandar, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Rechazo (daninas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (Kujira CHiPS) | 27.320.697.856 | IQ2_XS + MTP | no disponible | 1 % | Apache-2.0 | GGUF, 8,8 GB |
| ISTA-DASLab/Qwen3.8-27B-GSQ-RCO (original) | 27.320.697.856 | IQ2_XS + MTP | no disponible | 88,5 % | Apache-2.0 | GGUF |
| 0bserverx/Qwen3.8-27B-Heretic-GSQ-RCO | 27.320.697.856 | IQ2_XS (cuantizacion separada) | no disponible | 1 % | Apache-2.0 | GGUF |
| Qwen/Qwen3.8-27B (base) | 27.320.697.856 | BF16 y otras | no disponible | no disponible | Apache-2.0 | safetensors y derivados |

Las tres variantes comparten el mismo modelo base y tamano; la diferencia principal es el tratamiento del rechazo y, en el caso del original, la fidelidad completa al modelo de ISTA DASLab. La variante Heretic es un fichero cuantizado por separado, por lo que su perplejidad no es directamente comparable segun el autor.

## Limitaciones y advertencias

- El modelo sigue muchas peticiones que el original rechaza y puede producir contenido danino, ofensivo o inexacto; esta pensado para investigacion y para usuarios que comprendan ese riesgo.
- La deteccion de rechazos se hizo por coincidencia de frases en ingles y japones, sin revision humana; una respuesta que evita la peticion sin usar una frase de rechazo no se contabiliza como rechazo.
- Los conjuntos de evaluacion son pequenos: una peticion equivale aproximadamente al 1 %, y el 1-3 % restante de rechazos varia entre ejecuciones.
- Solo se probaron peticiones de un turno sin system prompt; no se evaluaron conversaciones multi-turno, system prompts ni peticiones reformuladas o adversariales.
- Solo se publica la variante IQ2_XS-mtp y el uso con vision no se ha probado; el proyector mmproj no se incluye en el repo.
- La receta de CHiPS no se publica y las mediciones del articulo de referencia corresponden a otros modelos, por lo que la reproducibilidad del metodo es limitada.
- No hay informacion sobre sesgos del modelo base ni sobre los idiomas oficialmente soportados.
- La licencia Apache-2.0 permite uso comercial, pero el usuario es responsable del cumplimiento legal y debe anadir sus propias salvaguardas antes de servir el modelo a terceros.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; la perplejidad se mantiene practicamente identica al original, pero eso no mide factualidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kujira/Qwen3.8-27B-GSQ-RCO-IQ2_XS-mtp-CHiPS-Uncensored-v1
- Modelo base cuantizado (ISTA DASLab): https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Variante Heretic: https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-GSQ-RCO-GGUF
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Articulo sobre CHiPS: https://balaena01.github.io/chips-steering/
- Papers citados en los tags: arxiv:2604.18556 y arxiv:2605.00649 (referencias incluidas en los metadatos del modelo; no se dispone de sus titulos en la informacion proporcionada)
