# DISCOStudy/PhenoGemini

## Resumen

PhenoGemini es un modelo de lenguaje especializado en priorizacion de genes candidatos a partir del fenotipo de un paciente. Lo desarrolla DISCOStudy y se publica en HuggingFace bajo licencia MIT, con un total de 32.363.165.696 parametros (aproximadamente 32,4 mil millones) repartidos en un repositorio de 64,7 GB en formato safetensors. La etiqueta de arquitectura del repositorio es `qwen3_moe`, lo que indica que se trata de un transformer con mezcla de expertos (MoE) derivado de la familia Qwen3; el modelo esta declarado unicamente en ingles y esta etiquetado como `medical`.

El problema que resuelve es concreto: dado un conjunto de terminos fenotipicos (tipicamente terminos HPO) mas un bloque de pacientes similares recuperados de la literatura, el modelo devuelve una lista priorizada de genes ordenada por probabilidad de ser el causante de la enfermedad. No es un modelo conversacional ni genera texto libre: durante la inferencia realiza un ranking sobre el subespacio de tokens de genes en los logits de la ultima posicion, enmascarando el resto del vocabulario. Para ello el tokenizador incorpora tokens especiales con el formato `<|PhenoGemini-Special-Token-Entrez-ID-XXXXX|>`, donde el numero final es el Entrez Gene ID.

Su relevancia actual radica en el enfoque: en lugar de pedir a un LLM generalista que "escriba" el gen, restringe la salida a un vocabulario cerrado de identificadores geneticos y explota la distribucion de logits como puntuacion de ranking. Esto convierte la tarea de diagnostico genetico en un problema de clasificacion masiva evaluable de forma objetiva, y es reutilizable en cualquier pipeline bioinformatico que ya trabaje con HPO y Entrez IDs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (tag `qwen3_moe`, familia Qwen3); detalles de capas y numero de expertos no disponibles |
| Parametros totales | 32.363.165.696 (32,4 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors; por tamano de repo, 64,7 GB para 32,36 mil millones de parametros, corresponden a bf16/fp16) |
| Idiomas soportados | en (ingles) |
| Licencia | mit |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos de la familia Qwen3, segun la etiqueta `qwen3_moe` del repositorio y el uso de `AutoModelForCausalLM` en el codigo de referencia. El modelo se carga con `torch_dtype="auto"` y `device_map="auto"`, y los pesos publicados ocupan 64,7 GB, lo que es coherente con precision bf16/fp16 sobre 32,36 mil millones de parametros. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste por instrucciones.

La innovacion tecnica destacable es la extension del vocabulario con tokens especiales que representan genes mediante su Entrez Gene ID. La inferencia consiste en una unica pasada hacia delante: se toma el vector de logits de la ultima posicion, se enmascaran todos los tokens que no pertenecen al subespacio genico y se ordenan los logits restantes de forma descendente. Esto evita la decodificacion autorregresiva y convierte el modelo en un ranker. Ademas, la funcion de formateo de prompt del autor inserta explicitamente un cierre de bloque de razonamiento (`</think>`) antes del fragmento final, lo que sugiere que el modelo fue entrenado con trazas de razonamiento extensas al estilo Qwen3. El flujo de trabajo documentado incluye un paso previo de recuperacion: la aplicacion PhenoGemini Atlas recupera pacientes similares de la literatura ("twin patients") y los anexa al prompt, funcionando como un RAG estructurado sobre casos publicados.

## Capacidades

- Priorizacion de genes candidatos: ordena el vocabulario de genes por logit en la ultima posicion del prompt, devolviendo una lista priorizada con puntuaciones.
- Ranking restringido por subespacio: al enmascarar los tokens no genicos, la salida no puede contener texto libre ni alucinaciones en formato; el resultado es siempre una lista de identificadores Entrez.
- Razonamiento previo a la respuesta: la plantilla de chat esperada incluye un bloque de razonamiento que se cierra con `</think>` antes de la frase de conclusion, lo que indica modo de pensamiento entrenado.
- Integracion con recuperacion externa: disenado para consumir prompts que incluyen pacientes fenotipicamente similares recuperados de la literatura por PhenoGemini Atlas.
- Multilingue: no; la model card declara unicamente ingles.
- Tool calling / function calling: no documentado.
- Capacidades de agente o razonamiento multi-paso autonomo: no documentadas; el uso previsto es una pasada de ranking sobre un prompt ya construido.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Priorizacion genetica en investigacion de enfermedades raras: dado un listado de terminos HPO de un paciente, el modelo devuelve una lista ordenada de genes candidatos que un equipo de genetica puede contrastar con paneles o exomas. Es adecuado porque su salida es directamente un ranking comparable entre casos.
- Triaje previo a la secuenciacion: en cohortes grandes donde secuenciar todos los exomas es inviable, el ranking permite seleccionar subconjuntos de genes a analizar primero, reduciendo el espacio de busqueda antes de aplicar herramientas de analisis de variantes.
- Reanalisis de casos sin diagnostico: para pacientes que ya tienen exoma secuenciado pero sin diagnostico resuelto, el modelo reordena los genes y puede revalorizar variantes que habian quedado descartadas por prioridad baja.
- Generacion de hipotesis para publicaciones: el ranking sirve como hipotesis reproducible y citables en articulos de genetica clinica, con una puntuacion numerica asociada en lugar de una afirmacion cualitativa.
- Integracion en pipelines bioinformaticos: el codigo de referencia en Python con `transformers` encaja en flujos existentes de analisis tipo Nextflow o Snakemake, con una llamada de inferencia por paciente.
- Benchmarking y validacion de metodos de priorizacion: al devolver una lista ordenada y una puntuacion, es directamente evaluable con metricas de ranking (top-k, MRR, recall@k) frente a herramientas clasicas de priorizacion genica.
- Apoyo a la anotacion fenotipica en bases de datos: ordenar genes por fenotipo ayuda a curar relaciones gen-fenotipo en repositorios biomedicos.
- Docencia en genetica clinica: permite construir ejercicios donde el alumno compara el ranking del modelo con el diagnostico real de un caso publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en bf16/fp16: los pesos ocupan 64,7 GB, por lo que se necesitan aproximadamente 70-80 GB de VRAM contando activaciones. Requiere una A100 80 GB, una H100 80 GB o reparto por tensor parallelism entre dos GPU de 48 GB (A6000 Ada, L40S) o dos RTX 4090 de 24 GB.
- Inferencia en 8 bits: estimacion de 33-36 GB de VRAM, viable en A100 40 GB, RTX 6000 Ada 48 GB o L40S 48 GB.
- Inferencia en 4 bits: estimacion de 18-20 GB de VRAM, lo que permite ejecucion en una unica GPU de consumo como RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 5090. La cuantizacion no esta documentada por el autor, por lo que requeriria cuantizar los pesos safetensors a GPTQ, AWQ o GGUF.
- GPU de consumo: si cabe en RTX 4090 / RTX 3090 con cuantizacion de 4 bits. En precision completa, no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: el autor solo documenta `transformers` con `AutoModelForCausalLM`. vLLM o TGI son tecnicamente posibles, pero requieren implementar a medida el enmascarado de logits sobre el subespacio genico y la gestion de los tokens especiales. llama.cpp u Ollama necesitarian conversion a GGUF y tambien logica adicional para el ranking, ya que el uso previsto no es la generacion de texto.
- Al no haber decodificacion autorregresiva, no se genera cache KV creciente: el consumo de memoria depende de la longitud del prompt (fenotipos mas pacientes similares anexados), no del numero de tokens generados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han proporcionado datos de modelos comparables de priorizacion genica en la informacion disponible. La unica referencia directa es la familia base indicada por la etiqueta del repositorio, cuyos valores se incluyen solo como contexto arquitectonico y no estan confirmados por la model card de PhenoGemini.

| Modelo | Parametros totales | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PhenoGemini | 32,36 mil millones | no disponible | Ranking de genes por fenotipo | mit | HuggingFace, 0 descargas |
| Qwen3 (familia base, tag `qwen3_moe`) | no confirmado en la informacion proporcionada | no disponible | Generacion de texto general | no disponible | HuggingFace |
| Herramientas clasicas de priorizacion genica (Exomiser, PhenIX, LIRICAL) | no disponible | no aplica | Priorizacion por fenotipo y herencia | no disponible | no disponible |

## Limitaciones y advertencias

- Uso clinico no autorizado: la model card incluye texto (actualmente comentado en el frontmatter) que declara que el modelo y sus pesos se ofrecen solo con fines de investigacion y educativos, y que no deben emplearse para diagnostico, decisiones terapeuticas ni manejo de pacientes. Cualquier uso clinico exigiria validacion independiente, aprobacion regulatoria y supervision profesional.
- Ausencia de validacion por la comunidad: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia publica de replicacion ni de rendimiento en cohortes externas.
- Riesgo de ranking incorrecto no calibrado: los logits ordenados no constituyen probabilidades calibradas; un gen en primera posicion no implica una probabilidad clinica conocida.
- Sesgo de recuperacion: el prompt recomendado depende de "twin patients" extraidos de la literatura, lo que introduce sesgo de publicacion y favorece genes y enfermedades ya bien caracterizados, en detrimento de asociaciones nuevas o infrecuentes.
- Cobertura limitada del vocabulario: solo pueden puntuarse los genes representados por tokens del tipo `<|PhenoGemini-Special-Token-Entrez-ID-...|>`. Un gen ausente del vocabulario no puede aparecer nunca en el ranking.
- Fragilidad del prompt: el autor advierte explicitamente de que el prompt no debe terminar en espacios, saltos de linea ni caracteres en blanco, ya que el ranking se calcula sobre el ultimo token. Un espacio final invalida el resultado.
- Idioma: el modelo solo esta declarado en ingles; prompts en otros idiomas o terminos HPO traducidos no estan soportados de forma documentada.
- Longitud de contexto no documentada: se desconoce cuantos pacientes similares pueden anexarse al prompt antes de truncar informacion.
- Datos sensibles: la entrada son fenotipos de pacientes, potencialmente vinculables a datos geneticos. Cualquier despliegue debe cumplir la normativa aplicable de proteccion de datos y de investigacion con sujetos humanos, tal como recoge el texto de la propia model card.
- Licencia: aunque la licencia declarada es MIT, que permite uso comercial, el texto comentado del autor expresa una intencion de uso exclusivamente no comercial y de investigacion; esta discrepancia debe resolverse con los responsables del modelo antes de un uso en produccion.
- Gating desactivado: los campos de aceptacion de licencia aparecen comentados, por lo que el acceso al repositorio es abierto en la practica, sin control de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DISCOStudy/PhenoGemini
- Repositorio GitHub con ejemplos de uso y datos de demostracion: https://github.com/discostudy/phenogemini
- Aplicacion PhenoGemini Atlas para generar prompts con pacientes similares: https://phenogemini.org/
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos resultados obtenidos eran listados de museos de Chicago, sin relacion con el modelo.
