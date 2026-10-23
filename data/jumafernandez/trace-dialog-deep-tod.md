# jumafernandez/trace-dialog-deep-tod

## Resumen

TRACE-Dialog (deep, task-oriented, supervised) es un codificador de diálogos completos desarrollado por J. M. Fernández (con M. Errecalde y S. Burdisso como coautores del trabajo en preparación). No es un modelo generativo: recibe un diálogo de diálogo orientado a tareas (tipo SGD o SpokenWOZ) y devuelve un único vector de 768 dimensiones que representa la conversación completa, incluyendo la trayectoria de sus turnos. Sobre el encoder contextual de turnos TRACE se añade un vector `[CLS]` aprendido, situado antes de los turnos y seguido de un `[SEP]` también aprendido; la representación del diálogo es la salida `h_[CLS]` en esa posición.

El modelo parte del encoder de turnos `sergioburdisso/dialog2flow-joint-bert-base`, que permanece congelado, y añade dos etapas de entrenamiento sobre el vector `[CLS]`: primero un preentrenamiento sin objetivo propio (al estilo RoBERTa) sobre diálogos empaquetados sin contaminación cruzada y, después, una etapa supervisada de similitud en la que los positivos son diálogos que comparten el mismo conjunto de servicios. El resultado es sensible al orden de los turnos, algo que los embeddings de frase convencionales no capturan.

Su relevancia es doble: por un lado, ofrece memoria conversacional compacta para agentes de diálogo (es la representación usada por el agente `dialog2agent`); por otro, su tamaño (85,1 M de parámetros, 0,3 GB de repositorio) permite ejecutarlo en CPU o en cualquier GPU de consumo. La licencia Apache-2.0 facilita su integración comercial. El modelo solo trabaja en inglés y únicamente sobre los primeros 62 turnos de cada diálogo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder estilo BERT sobre embeddings de turno con vectores `[CLS]` y `[SEP]` aprendidos; 12 capas, 12 cabezas, tamano oculto 768; atencion bidireccional |
| Parametros totales | 85.109.760 (85,1 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Hasta 62 turnos por dialogo (limite de la implementacion); longitud en tokens no disponible |
| Tipos de cuantizacion | No disponible (no se publican versiones cuantizadas; al ser un encoder de 85 M es viable FP32, FP16 e INT8) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (checkpoint convertido al formato Transformers), con codigo propio (`trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer bidireccional de 12 capas y 12 cabezas con tamano oculto 768, pero no opera sobre tokens sino sobre embeddings de turno de 768 dimensiones e identificadores de hablante. El encoder de turnos base (`sergioburdisso/dialog2flow-joint-bert-base`) esta congelado: los turnos se codifican con el y solo se entrena el vector `[CLS]` insertado al principio de la secuencia, precediendo a los turnos y seguido de un `[SEP]` aprendido. La salida `h_[CLS] ∈ R^768` es la representacion del dialogo completo. La secuencia de entrada se trunca a los primeros 62 turnos.

El entrenamiento del slot `[CLS]` tiene dos fases. La primera sigue el esquema de RoBERTa: el vector se entrena sin objetivo propio sobre dialogos orientados a tareas del corpus de Dialog2Flow, empaquetados de forma que no haya contaminacion cruzada entre conversaciones. La segunda es una etapa supervisada de similitud (5 epocas, learning rate 2e-5, temperatura 0,05, semilla 42) en la que se consideran positivos los dialogos que comparten el mismo conjunto de servicios, usando los servicios de SGD como supervision. La innovacion principal es, por tanto, el sesgo inductivo de trayectoria: la representacion depende del orden de los turnos, de modo que resume la conversacion y no solo el ultimo turno.

El repositorio contiene el checkpoint convertido a Transformers. La conversion se verifico contra las representaciones del codigo de entrenamiento en 1.882 prefijos de dialogo de SpokenWOZ, con una diferencia absoluta maxima de 7,4e-6. La interfaz de sentence-transformers se verifico con el texto de 500 prefijos de SpokenWOZ (de 1 a 90 turnos), con una diferencia absoluta maxima de 1,4e-5 frente a sentence-transformers 5.6 y 6.2.

## Capacidades

- Extraccion de caracteristicas (`feature-extraction`): genera un embedding unico de 768 dimensiones por dialogo completo.
- Representacion sensible a la trayectoria: distingue dialogos con los mismos turnos en orden distinto.
- Similitud y recuperacion semantica de dialogos: los vectores son comparables con las funciones de similitud de sentence-transformers.
- Prediccion de actos de dialogo por voto de vecinos: con la representacion combinada `[e_t ; lambda h_[CLS]]` se predice el siguiente acto de dialogo a partir de las continuaciones de los k turnos mas cercanos.
- Memoria conversacional para agentes: es la representacion usada por el agente `dialog2agent`.
- Acepta dos formatos de entrada: lista de mensajes de chat (`role`/`content`) o lista de turnos (`speaker`/`text`), y tambien embeddings base precalculados mediante `embeddings=`.
- No soporta generacion de texto, tool calling, razonamiento multi-paso, vision ni audio: es exclusivamente un encoder.
- Multilingue: no; solo ingles.

## Casos de uso

- Recuperacion de dialogos similares en un corpus historico: codificar un dialogo en curso y buscar en la coleccion los vectores mas cercanos para recuperar conversaciones previas sobre el mismo conjunto de servicios, tal como se evaluo en la tarea de recuperacion de situaciones conversacionales sobre SpokenWOZ.
- Memoria conversacional en agentes de dialogo: sustituir el historial completo por un vector de 768 dimensiones que se concatena con el embedding del turno actual (`[e_t ; lambda h_[CLS]]`), reduciendo el coste de contexto en cada decision del agente; es el uso real en `dialog2agent`.
- Prediccion del siguiente acto de dialogo: clasificar la accion del sistema mediante el voto de las continuaciones de los k turnos mas cercanos, con una exactitud de 0,482 y Macro-F1 de 0,173 en la configuracion combinada reportada.
- Enrutado y triaje de conversaciones: dado un dialogo entrante, asignar el servicio o flujo de atencion adecuado comparando su embedding con los de dialogos etiquetados por servicio del conjunto SGD.
- Deduplicacion y control de calidad de transcripciones: agrupar dialogos por similitud vectorial para detectar conversaciones redundantes o anomalas en un corpus de soporte.
- Deteccion de deriva conversacional: comparar el embedding del prefijo actual con el de referencia de un flujo esperado para detectar desviaciones en el orden de los turnos, aprovechando la sensibilidad a la trayectoria.
- Indexacion vectorial a bajo coste: al ocupar 0,3 GB el repositorio y producir vectores de 768 dimensiones, es viable indexar decenas de miles de dialogos en un indice vectorial ligero ejecutado en CPU.

## Benchmarks y rendimiento

Los unicos resultados publicados corresponden a la recuperacion de situaciones conversacionales en SpokenWOZ, donde el siguiente acto de dialogo se predice por el voto de las continuaciones de los k turnos mas cercanos (1.019 dialogos de entrenamiento de dominio unico, con validacion cruzada). No se han publicado resultados en benchmarks estandar de LLM (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Representacion | Accuracy | Macro-F1 | Coverage@5 |
|---|---|---|---|
| `e_t` (Dialog2Flow) | 0,454 | 0,135 | 0,646 |
| `h_[CLS]` del prefijo (este modelo) | 0,301 | 0,084 | 0,548 |
| `[e_t ; lambda h_[CLS]]` | 0,482 | 0,173 | 0,685 |

Lectura de los datos: la representacion del dialogo por si sola (0,301) es peor que el embedding del turno actual (0,454) para predecir el siguiente acto, lo que confirma que resume los servicios de la conversacion y no su ultimo turno. Su valor aparece al combinarse con el turno actual: la configuracion `[e_t ; lambda h_[CLS]]` supera a la linea base en las tres metricas (0,482 de exactitud, 0,173 de Macro-F1, 0,685 de cobertura a 5).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,34 GB de pesos en FP32 y 0,17 GB en FP16; sumando activaciones y overhead de runtime, el consumo se mantiene por debajo de 1 GB en FP32 y de unos 0,5 GB en FP16 (estimacion a partir de los 85,1 M de parametros).
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; no requiere A100 ni H100. Una RTX 4090, una RTX 3060 o incluso una iGPU con aceleracion son suficientes.
- Compatibilidad con GPU de consumo: si, en cualquier GPU consumer moderna (GTX 1050 o superior en la practica, dado el tamano) y tambien en CPU, donde la inferencia por dialogo es del orden de milisegundos.
- Opciones de despliegue: `sentence-transformers` (con `trust_remote_code=True`), `transformers` mediante `AutoModel.from_pretrained` y `encode_dialogue(turns, speakers)`, o cualquier servidor de embeddings que admita codigo remoto. vLLM, llama.cpp, Ollama y TGI no estan soportados de forma directa al no ser un modelo generativo ni disponer de versiones GGUF.
- Latencia y throughput: no disponibles de forma oficial. Por el tamano del modelo se espera un coste por dialogo muy bajo (decenas de milisegundos en CPU, por debajo de la decena de milisegundos en GPU), pero no hay cifras publicadas.
- Almacenamiento: 0,3 GB de repositorio, incluyendo pesos safetensors y codigo personalizado.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension de salida | Entrada | Especifico de dialogo | Licencia |
|---|---|---|---|---|---|
| trace-dialog-deep-tod | 85,1 M | 768 | Dialogo completo (hasta 62 turnos) | Si (orientado a tareas, con trayectoria) | Apache-2.0 |
| sergioburdisso/dialog2flow-joint-bert-base | No disponible en la informacion | 768 | Turno individual | Si (encoder de turno base) | No disponible en la informacion |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | 384 | Texto plano (hasta 256 tokens) | No | Apache-2.0 |
| BAAI/bge-base-en-v1.5 | 109 M | 768 | Texto plano (hasta 512 tokens) | No | MIT |

Diferencias clave: los modelos de frase de proposito general (MiniLM, BGE) tratan la entrada como un texto plano y no modelan la alternancia de hablantes ni el orden de los turnos como senal principal; TRACE-Dialog consume estructuras de dialogo y produce un vector de la conversacion completa, pero solo funciona con los embeddings del encoder base con el que fue entrenado y unicamente en ingles. Frente a su modelo base Dialog2Flow, TRACE-Dialog anade la representacion agregada del dialogo (`h_[CLS]`) sobre las representaciones de turno.

## Limitaciones y advertencias

- Solo ingles. No se ha entrenado ni evaluado en castellano ni en otros idiomas.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso; cualquier uso como LLM es invalido.
- Dependencia estricta del encoder base: espera los embeddings de `sergioburdisso/dialog2flow-joint-bert-base`. Alimentarlo con embeddings de otro encoder produce representaciones sin sentido.
- Truncamiento a 62 turnos: los dialogos mas largos pierden informacion sin aviso explicito en la salida.
- La nocion de similitud esta sesgada por la supervision: la etapa supervisada usa los servicios de SGD, por lo que "dialogos parecidos" significa "dialogos que sirven a la misma tarea". No es una similitud tematica generica.
- Rendimiento individual limitado: usando solo `h_[CLS]` la exactitud cae a 0,301 frente a 0,454 del embedding del turno; el modelo aporta valor en combinacion, no en solitario.
- Riesgo de alucinacion no aplica (no genera texto), pero si hay riesgo de falsos positivos en recuperacion cuando los servicios no estan bien representados en el corpus de entrenamiento.
- Sesgos: no se documentan analisis de sesgo; el corpus (Dialog2Flow, SGD, SpokenWOZ) es de dominio de reservas y servicios, con la distribucion y los sesgos propios de esos conjuntos.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; se recomienda fijar una `revision` concreta. La model card lo aconseja explicitamente.
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de la consulta; no hay ecosistema, issues ni validacion independiente.
- Trabajo en preparacion: la publicacion citada (Fernandez, Errecalde y Burdisso, *TRACE-Dialog: Trajectory-Aware Dialogue Embeddings from Contextual Turn Representations*) aun no esta publicada, por lo que no hay revision por pares disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jumafernandez/trace-dialog-deep-tod
- Modelo base (encoder de turnos): https://huggingface.co/sergioburdisso/dialog2flow-joint-bert-base
- Repositorio del agente que usa esta representacion: https://github.com/jumafernandez/dialog2agent
