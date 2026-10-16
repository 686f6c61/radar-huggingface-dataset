# sigmanih/Qwen-Qwen3.8-27B-GGUF-Q4_K_M

## Resumen

Qwen-Qwen3.8-27B-GGUF-Q4_K_M es una distribucion cuantizada en formato GGUF del modelo base Qwen/Qwen3.8-27B, publicada por el usuario sigmanih mediante la herramienta Sigma Studio (modulo Model Hub). El repositorio contiene una unica cuantizacion, Q4_K_M, con un peso en disco de 15,66 GB (16,8 GB de tamano total de repositorio) y 27.320.697.856 parametros totales segun los datos de safetensors del propio Hub.

La model card declara una ventana de contexto de 262.144 tokens, 65 capas de transformer, una dimension oculta de 5120 y una arquitectura etiquetada como `qwen35`. El modelo se presenta como orientado a razonamiento logico avanzado, especializacion de dominio empresarial y refactorizacion de codigo complejo, con soporte para `llama.cpp` y compatibilidad con endpoints. Los idiomas declarados son ingles e italiano.

Su relevancia practica reside en que permite ejecutar un modelo de ~27 B en una GPU de consumo de 24 GB de VRAM con offload completo (aproximadamente 16,8 GB), o en CPU/hibrido con unos 16,6 GB de RAM. No obstante, el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, y las cifras de benchmark que publica el autor proceden de una porcion reducida de los conjuntos de evaluacion, por lo que deben interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, etiquetada como `qwen35` en la model card |
| Parametros totales | 27.320.697.856 (dato real de safetensors) |
| Parametros activos | 27 B declarados en la model card; no se especifica si la arquitectura es MoE |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M (unica cuantizacion publicada en el repositorio) |
| Idiomas soportados | Ingles (en) e italiano (it) |
| Licencia | other (segun metadatos del Hub); la model card muestra una insignia Apache-2.0, lo que genera discrepancias |
| Formato de pesos | GGUF (Q4_K_M) |
| Capas del transformer | 65 |
| Dimension oculta | 5120 |
| Huella en disco | 15,66 GB |
| Tamano del repositorio | 16,8 GB |
| Modelo base | Qwen/Qwen3.8-27B |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre el entrenamiento del modelo base Qwen/Qwen3.8-27B en la documentacion proporcionada. La model card identifica la arquitectura base como `qwen35`, con 65 capas de transformer y una dimension oculta de 5120, lo que situa al modelo en la categoria de transformers densos de escala ~27 B, si bien no se confirma si incorpora componentes de mezcla de expertos (MoE). Al tratarse de un artefacto de cuantizacion, el autor no ha realizado entrenamiento adicional: la publicacion consiste en la conversion y compresion de los pesos del modelo base al formato GGUF con el metodo Q4_K_M.

La unica innovacion tecnica documentada en el repositorio es el propio proceso de cuantizacion y su integracion con Sigma Studio / SigmaEngine, que el autor describe como un pipeline acelerado por GPU para la publicacion y evaluacion determinista del modelo (semilla 42, temperatura 0,0). No se detallan tokens de entrenamiento, composicion del dataset, ni etapas de RLHF o DPO en la informacion disponible. Si se menciona una distincion entre dos modos de ejecucion: respuesta directa ("No-Thinking") y razonamiento en cadena de pensamiento ("Deep Thinking CoT").

## Capacidades

- Generacion de texto conversacional en ingles e italiano.
- Razonamiento en dos modos: respuesta directa de baja latencia ("No-Thinking") y razonamiento paso a paso con traza CoT ("Deep Thinking").
- Generacion de codigo en Python: la model card reporta 7/7 en HumanEval (pass@1) y 6/9 en MBPP.
- Razonamiento matematico multi-paso: 9/9 en GSM8K y 8/9 en MATH segun la evaluacion del autor.
- Razonamiento cientifico y de conocimiento general: 9/9 en ARC-Challenge, 6/7 en BIG-Bench Hard, 7/9 en MMLU-Pro.
- Tool calling / function calling: se declara una adherencia al protocolo de herramientas del 94,6 % y uso exclusivo de funciones registradas con esquemas validos.
- Soporte de agentes y ejecucion multi-paso dentro de un entorno aislado ("Sandbox Jail") con contencion declarada del 100 %.
- Contexto largo: ventana declarada de 262.144 tokens, util para documentos extensos y conversaciones multi-turno.
- Capacidades de vision, audio o multimodalidad: no disponibles en la informacion proporcionada.

## Casos de uso

- Refactorizacion de base de codigo en Python: el modelo puede analizar modulos completos y proponer reestructuraciones, apoyandose en su ventana de 262.144 tokens para mantener varios ficheros en contexto y en su tool calling para leer y escribir ficheros mediante funciones registradas.
- Asistente de desarrollo integrado en CI/CD: dado su soporte de `llama.cpp` y compatibilidad con endpoints, puede desplegarse como servicio interno que revise pull requests, genere parches y ejecute llamadas a herramientas de lint o test.
- Analisis de documentacion tecnica extensa: con 262.144 tokens de contexto es viable introducir manuales o especificaciones largas y obtener resumenes, extraccion de requisitos o respuestas sobre secciones concretas.
- Agentes de automatizacion de tareas sobre sistema de ficheros: la model card reporta contencion del 100 % en un sandbox y adherencia al 94,6 % al protocolo de herramientas, lo que lo hace apto para flujos de lectura/escritura controlados en entornos aislados.
- Tutorizacion y resolucion de problemas matematicos: el modo Deep Thinking CoT esta orientado a problemas de competicion y calculo multi-paso, donde la model card reporta 89 % en MATH y 100 % en GSM8K.
- Atencion al cliente en ingles e italiano: al cubrir ambos idiomas de forma nativa y sostener conversaciones multi-turno con contexto largo, puede gestionar historiales extensos sin truncamiento prematuro.
- Generacion de respuestas factuales con control de alucinacion: el 89 % declarado en TruthfulQA sugiere un comportamiento razonable en preguntas de factualidad, aunque la validacion debe hacerse siempre en el dominio concreto de produccion.

## Benchmarks y rendimiento

Resultados declarados por el autor, evaluados con SigmaEngine sobre GPU (temperatura 0, semilla 42). Aviso explicito incluido en la propia model card: las puntuaciones se midieron sobre una porcion del conjunto de datos, no sobre la suite completa, por lo que no son comparables con ejecuciones completas de referencia.

| Benchmark | Categoria | Aciertos / total | Precision |
|---|---|---|---|
| ARC-Challenge | Razonamiento cientifico | 9 / 9 | 100 % |
| BIG-Bench Hard | Logica multi-tarea y simbolica | 6 / 7 | 86 % |
| GPQA | Razonamiento academico de posgrado | 5 / 9 | 56 % |
| GSM8K | Matematicas escolares multi-paso | 9 / 9 | 100 % |
| HellaSwag | Sentido comun y NLI situacional | 6 / 9 | 67 % |
| HumanEval | Codigo Python (pass@1) | 7 / 7 | 100 % |
| MATH | Matematicas de competicion | 8 / 9 | 89 % |
| MBPP | Programacion Python con tests unitarios | 6 / 9 | 67 % |
| MMLU | Conocimiento general multi-materia | 8 / 14 | 57 % |
| MMLU-Pro | Razonamiento avanzado multi-paso | 7 / 9 | 78 % |
| TruthfulQA | Factualidad y anti-alucinacion | 8 / 9 | 89 % |
| Total | Todos los conjuntos evaluados | 79 / 100 | 79 % |

Comparativa entre modos de razonamiento:

| Modo de ejecucion | Precision | Preguntas superadas | Perfil |
|---|---|---|---|
| No-Thinking (respuesta directa) | 77,2 % | 44 / 57 | Latencia minima, sin tokens de razonamiento |
| Deep Thinking (CoT) | 81,4 % | 35 / 43 | Traza de razonamiento multi-paso, delta de +4,2 % |

Evaluacion de tool calling y comportamiento agentico (sandbox aislado):

| Metrica | Resultado | Detalle declarado |
|---|---|---|
| Adherencia al protocolo de herramientas | 94,6 % | 0/92 criterios analiticos verificados (dato contradictorio en la propia tabla) |
| Finalizacion autonoma de tareas | 0,0 % | 0/1 escenarios completados con el fichero objetivo exacto |
| Contencion en el sandbox | 100 % conforme | Cero intentos de salida del espacio de trabajo |
| Eficiencia de ejecucion | 0 turnos (0,0 s) | Consumo optimo de turnos y tokens |

Hash de reproducibilidad declarado: `SHA256-DBC4614BF3056DFE`. Protocolo: `code_execution`, `continuation_logprob`, `cot_generation`, `letter_logprob`.

## Requisitos de hardware

- VRAM para offload completo en GPU: aproximadamente 16,8 GB.
- RAM para ejecucion en CPU o modo hibrido: aproximadamente 16,6 GB.
- GPU recomendada por el autor: 24 GB de VRAM, por ejemplo RTX 3090 o RTX 4090.
- Encaje en GPU de consumo: si, en tarjetas de 24 GB (RTX 3090, RTX 4090). No cabe con offload completo en GPU de 16 GB; en ese caso requeriria offload parcial a CPU.
- Alternativa sin GPU: CPU con 32-64 GB de RAM en modo hibrido.
- Opciones de despliegue: `llama.cpp` (etiqueta explicita del repositorio), Ollama, LM Studio y cualquier runtime compatible con GGUF. La etiqueta `endpoints_compatible` sugiere compatibilidad con APIs de tipo OpenAI; vLLM y TGI no soportan GGUF de forma nativa en configuraciones estandar.
- Latencia y throughput: no disponibles. La model card no incluye mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de informacion suficiente en la documentacion proporcionada para establecer una comparativa rigurosa con alternativas de la misma categoria. La unica referencia directa es el modelo base del que deriva esta cuantizacion.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Qwen3.8-27B-GGUF-Q4_K_M (este) | 27,32 B | 262.144 tokens | GGUF Q4_K_M | other (segun Hub) | Publico en HuggingFace, 0 descargas |
| Qwen/Qwen3.8-27B (base) | no disponible | no disponible | safetensors | no disponible | Referenciado como `base_model`, sin datos adicionales |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

Para el resto de modelos de la misma escala (~27 B, contexto largo) no se han aportado especificaciones ni resultados en la informacion suministrada, por lo que no procede fijar comparaciones numericas.

## Limitaciones y advertencias

- Las puntuaciones de benchmark se calcularon sobre porciones reducidas de cada conjunto de datos, tal y como advierte la propia model card; no equivalen a una ejecucion completa y no son comparables con cifras publicadas de referencia.
- La tabla de evaluacion agentica contiene resultados internamente contradictorios: declara un 94,6 % de adherencia al protocolo de herramientas junto a "0/92 criterios analiticos verificados", y un 0,0 % de finalizacion autonoma de tareas. Estas cifras no permiten afirmar capacidad agentica real en produccion.
- Discrepancia de licencia: los metadatos del Hub indican `license: other`, mientras que la model card muestra una insignia Apache-2.0. Es imprescindible aclarar la licencia aplicable antes de cualquier uso comercial.
- Idiomas declarados limitados a ingles e italiano; el rendimiento en castellano no esta documentado ni cuantificado.
- Cobertura de benchmark reducida y no representativa: MMLU con solo 14 preguntas y MMLU-Pro con 9, lo que produce intervalos de confianza muy amplios.
- Riesgo de alucinacion: aunque el autor reporta un 89 % en TruthfulQA (8/9 preguntas), el tamano de la muestra es demasiado pequeno para extraer conclusiones solidas sobre factualidad en dominios especializados.
- Sesgos conocidos: no disponible. El autor no publica analisis de sesgos ni evaluacion de seguridad.
- Trazabilidad de la cuantizacion: no se documentan la version exacta del modelo base, el commit de origen ni el procedimiento de conversion, mas alla de la referencia a `Qwen/Qwen3.8-27B`.
- Repositorio sin validacion de la comunidad: 0 descargas y 0 "likes", lo que implica ausencia de verificacion independiente de los pesos, de los resultados y de la reproducibilidad.
- Ausencia de datos de rendimiento operativo (latencia, throughput, consumo) que permitan planificar un despliegue en produccion.
- Los resultados de busqueda web realizados no devolvieron informacion relevante sobre este modelo; los enlaces obtenidos eran de naturaleza no relacionada y se han descartado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sigmanih/Qwen-Qwen3.8-27B-GGUF-Q4_K_M
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio Sigma Studio: https://github.com/Sigmanih/SigmaStudio
- Perfil del autor en HuggingFace: https://huggingface.co/sigmanih
- Paper, blog tecnico, demo o documentacion adicional del modelo: no disponibles. La busqueda web realizada no devolvio resultados relevantes.
