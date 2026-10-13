# sigmanih/microsoft-phi-4-GGUF-Q4_K_M

## Resumen

`sigmanih/microsoft-phi-4-GGUF-Q4_K_M` es una cuantizacion en formato GGUF, concretamente con el esquema Q4_K_M, del modelo `microsoft/phi-4`, publicada por el usuario sigmanih mediante el modulo Model Hub de su herramienta Sigma Studio. No es un modelo entrenado desde cero, sino una redistribucion optimizada para inferencia local del phi-4 de Microsoft: un transformer decoder-only denso de 14.659.507.200 parametros (14,66 B) con 40 capas, dimension oculta 5120 y una ventana de contexto de 16.384 tokens.

El problema que aborda es el del despliegue en hardware modesto. La cuantizacion Q4_K_M deja la huella en disco en 8,44 GB (9,1 GB de repositorio) y, segun el autor, permite el offload completo en GPU con unos 10,6 GB de VRAM, lo que lo hace ejecutable en tarjetas de consumo de 12 GB como una RTX 3060 o una RTX 4070. Frente a los aproximadamente 29 GB que ocupan los pesos en bf16, la ganancia practica es notable.

Su relevancia es, por tanto, la de un artefacto de despliegue mas que la de un modelo nuevo: conserva las capacidades de razonamiento, matematicas y codigo de phi-4 a cambio de una perdida de precision derivada de la cuantizacion a 4 bits. Conviene tener presente que la licencia declarada es `other`, que el README muestra una insignia Apache-2.0 y que el modelo base se publica bajo MIT, una discrepancia sin aclarar por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, arquitectura `phi3` segun la model card del repositorio |
| Parametros totales | 14.659.507.200 (14,66 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | Q4_K_M (unico formato publicado en este repositorio) |
| Idiomas soportados | en, it (etiquetas del repositorio); la model card no documenta evaluacion en italiano y el modelo base esta orientado al ingles |
| Licencia | other (el README muestra una insignia Apache-2.0 y el modelo base `microsoft/phi-4` se publica bajo MIT; discrepancia no aclarada) |
| Formato de pesos | GGUF (Q4_K_M) |
| Capas del transformer | 40 |
| Dimension oculta | 5120 |
| Tamano del repositorio | 9,1 GB |
| Huella en disco de los pesos | 8,44 GB |
| VRAM declarada por el autor | ~10,6 GB con offload completo en GPU; ~10,4 GB de RAM en modo CPU/hibrido |
| Parametros de decodificacion evaluados | temperature 0,0, seed 42 |
| Descargas / likes | 154 / 1 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de `microsoft/phi-4`: un transformer decoder-only denso de 40 capas y 5120 dimensiones ocultas, etiquetado como `phi3` en la libreria de transformers. Este repositorio no aporta informacion sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset, fases de RLHF, DPO u otras tecnicas de alineamiento): esos datos corresponden a la documentacion de Microsoft y no se incluyen en la model card proporcionada. Tampoco se documenta el proceso de cuantizacion mas alla del esquema Q4_K_M y de la herramienta empleada (Sigma Studio, con un componente denominado SigmaEngine para inferencia acelerada en GPU).

La unica innovacion tecnica que el repositorio documenta de forma explicita es la distincion entre dos modos de ejecucion evaluados por el autor: un modo directo sin tokens de razonamiento (No-Thinking) y un modo con traza de razonamiento paso a paso (Deep Thinking / CoT). Segun sus mediciones, el modo CoT mejora la precision agregada en 3,1 puntos porcentuales (73,7 % frente a 76,7 %) a costa de generar tokens adicionales y, por tanto, de mayor latencia. No se describe ninguna tecnica de atencion alternativa, decodificacion especulativa ni arquitectura hibrida.

## Capacidades

- Generacion de texto conversacional y respuesta a instrucciones en formato chat.
- Razonamiento multi-paso con modo de pensamiento explicito (CoT) activable, con una mejora medida por el autor de 3,1 puntos sobre el modo directo.
- Matematicas: 100 % en GSM8K y 89 % en MATH segun la evaluacion del autor (sobre subconjuntos reducidos).
- Generacion de codigo Python: 86 % en HumanEval (pass@1) y 89 % en MBPP con pruebas unitarias, en la misma evaluacion.
- Razonamiento cientifico y de sentido comun a nivel escolar: 89 % en ARC-Challenge.
- Tool calling / function calling: el autor reporta una adherencia al protocolo de herramientas del 89,1 %, sin funciones inventadas fuera del esquema registrado.
- Capacidades multilingues limitadas: etiquetado como en/it, sin evidencia de evaluacion especifica en italiano.
- Capacidad de ejecucion local en GPU de consumo gracias a la cuantizacion Q4_K_M.
- No se documentan capacidades de vision, audio ni multimodalidad.

## Casos de uso

- Asistente de razonamiento matematico en local: con 16.384 tokens de contexto y resultados declarados del 100 % en GSM8K y 89 % en MATH, es adecuado para resolver problemas paso a paso activando el modo CoT, por ejemplo en herramientas de estudio o de verificacion de calculos sin enviar datos a la nube.
- Refactorizacion y revision de codigo Python en el puesto de trabajo: los 86 % en HumanEval y 89 % en MBPP lo sitúan como un asistente viable para reescribir funciones, generar pruebas unitarias y explicar codigo, siempre que el fichero quepa en la ventana de 16K tokens o se fragmente previamente.
- Despliegue en estaciones de trabajo sin GPU de centro de datos: con 8,44 GB de pesos y ~10,6 GB de VRAM en offload total, cabe en una RTX 3060 de 12 GB o una RTX 4070, lo que permite ofrecer asistencia generativa a equipos pequenos con hardware ya amortizado.
- Atencion al cliente o asistencia interna con requisitos de confidencialidad: al ejecutarse integramente en local mediante llama.cpp u Ollama, los datos no salen de la infraestructura de la organizacion, algo critico en sectores regulados.
- Generacion de preguntas y material didactico de nivel escolar y preuniversitario: los resultados en ARC-Challenge (89 %) y MATH (89 %) son consistentes con este uso, mientras que el 56 % en GPQA aconseja no emplearlo sin supervision en contenido de nivel de posgrado.
- Integracion en pipelines de CI/CD como revisor automatico de parches: el soporte de tool calling y la adherencia del 89,1 % al protocolo permiten invocarlo con esquemas de herramientas estrictos para lanzar analisis, aunque la finalizacion autonoma de tareas complejas no esta garantizada (0 % en el escenario del propio autor).
- Prototipado de agentes en sandbox: util para experimentar con bucles multi-turno y llamadas a herramientas en un entorno aislado, dado que el autor reporta contencion del 100 % dentro del espacio de trabajo, pero no para flujos autononos de produccion sin un orquestador externo.
- Clasificacion y resumen por lotes en CPU o modo hibrido: con ~10,4 GB de RAM en modo CPU, encaja en servidores sin GPU para tareas de procesamiento masivo de texto donde la latencia no es critica.

## Benchmarks y rendimiento

Los siguientes datos proceden exclusivamente de la model card del autor. Estan medidos sobre subconjuntos reducidos de cada suite (entre 7 y 14 preguntas por conjunto), con temperature 0,0 y seed 42, y el propio autor advierte que no son comparables con ejecuciones de suite completa.

| Benchmark | Ambito | Aciertos / total | Precision | Estado declarado |
|---|---|---|---|---|
| GSM8K | Matematicas de primaria multi-paso | 9 / 9 | 100 % | superado |
| ARC-Challenge | Ciencia y razonamiento escolar | 8 / 9 | 89 % | superado |
| MATH | Matematicas de competicion | 8 / 9 | 89 % | superado |
| MBPP | Programacion Python con tests | 8 / 9 | 89 % | superado |
| TruthfulQA | Factualidad y anti-alucinacion | 8 / 9 | 89 % | superado |
| BIG-Bench Hard | Logica multi-tarea y simbolica | 6 / 7 | 86 % | superado |
| HumanEval | Codigo Python (pass@1) | 6 / 7 | 86 % | superado |
| GPQA | Razonamiento academico de posgrado | 5 / 9 | 56 % | discreto |
| HellaSwag | Sentido comun y NLI situacional | 5 / 9 | 56 % | discreto |
| MMLU-Pro | Razonamiento avanzado multi-paso | 5 / 9 | 56 % | discreto |
| MMLU | Conocimiento general multi-materia | 7 / 14 | 50 % | discreto |
| Total agregado | Todos los conjuntos evaluados | 75 / 100 | 75 % | 75 % de aprobados |

Protocolo declarado: `code_execution`, `continuation_logprob`, `cot_generation`, `letter_logprob`; temperature 0,0; seed 42; hash de reproducibilidad `SHA256-B2586A4754F20163`. Fecha de ejecucion indicada: 2026-10-08, motor SigmaEngine sobre GPU.

Comparativa de modos de razonamiento declarada por el autor:

| Modo de ejecucion | Precision | Preguntas superadas | Perfil operativo |
|---|---|---|---|
| No-Thinking (respuesta directa) | 73,7 % | 42 / 57 | Latencia minima, sin tokens de razonamiento |
| Deep Thinking (CoT) | 76,7 % | 33 / 43 | Traza de razonamiento multi-paso, +3,1 puntos |
| Delta CoT frente a directo | +3,1 % | no aplica | Mayor coste en tokens y latencia |

Evaluacion de protocolo de agentes y tool calling en sandbox aislado, aportada por el autor:

| Metrica | Resultado | Detalle declarado |
|---|---|---|
| Adherencia al protocolo de herramientas | 89,1 % | 0 de 92 criterios analiticos verificados |
| Finalizacion autonoma de tareas | 0,0 % | 0 de 1 escenarios completados con el fichero objetivo exacto |
| Contencion en el sandbox | 100 % conforme | Ningun intento de escape del espacio de trabajo |
| Eficiencia de ejecucion | 0 turnos (0,0 s) | Uso declarado optimo de turnos y tokens |

No se han publicado en la informacion disponible resultados del modelo base `microsoft/phi-4` ni de modelos comparables medidos con el mismo protocolo, por lo que no se incluye una tabla comparativa de rendimiento homogenea.

## Requisitos de hardware

- VRAM para inferencia: ~10,6 GB con offload completo en GPU segun el autor; ~10,4 GB de RAM en modo CPU o hibrido. Los pesos Q4_K_M ocupan 8,44 GB en disco.
- Memoria KV adicional: no declarada por el autor. Como estimacion propia a partir de 40 capas, 5120 dimensiones ocultas y atencion con cabezas KV agrupadas, el cache en FP16 para 16.384 tokens se situa en el orden de 3 GB, por lo que conviene reservar margen sobre los 10,6 GB indicados. Esta cifra es una estimacion, no un dato facilitado por el repositorio.
- GPU recomendadas por el autor: GPU con 12-16 GB de VRAM, por ejemplo RTX 3060 o RTX 4070, o bien un sistema con 32 GB de RAM para ejecucion en CPU.
- Cabe en GPU de consumo: si, en modelos de 12 GB o mas (RTX 3060 12 GB, RTX 4070 12 GB, RTX 4080 16 GB, RTX 4090 24 GB). No cabe con offload total en GPU de 8 GB.
- Apple Silicon: viable en equipos con memoria unificada de 16 GB o superior, con margen ajustado en la configuracion de 16 GB.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, Jan, koboldcpp, llama-cpp-python y text-generation-webui. El soporte de GGUF en vLLM y SGLang es experimental o parcial; TGI no soporta GGUF. La model card menciona ademas SigmaEngine como motor propio de la herramienta del autor.
- Latencia y throughput: no disponible. No se publican tokens por segundo ni tiempos de primera token en la informacion proporcionada. El modo CoT incrementa la latencia al generar tokens de razonamiento adicionales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| sigmanih/microsoft-phi-4-GGUF-Q4_K_M | 14,66 B | 16.384 | GGUF Q4_K_M | other (base MIT) | 154 descargas, 1 like | 75/100 sobre subconjuntos (dato del autor) |
| microsoft/phi-4 (modelo base) | 14,66 B | 16.384 | safetensors (bf16) | MIT | publico en HuggingFace | MMLU 84,8 (referencia externa publicada por Microsoft, no incluida en la informacion proporcionada) |
| Qwen2.5-14B-Instruct | ~14,7 B | 32.768 | safetensors, GGUF | Apache-2.0 | publico en HuggingFace | no disponible |
| Llama-3.1-8B-Instruct | 8 B | 131.072 | safetensors, GGUF | Llama 3.1 Community License | publico en HuggingFace | no disponible |

La comparacion relevante es contra el propio modelo base: esta cuantizacion ocupa un tercio del espacio en disco (8,44 GB frente a ~29 GB en bf16) y reduce el requisito de VRAM de forma proporcional, a cambio de la perdida de precision inherente a 4 bits y de la perdida de la licencia MIT original en la declaracion del repositorio. Frente a alternativas de contexto largo como Qwen2.5-14B (32K) o Llama-3.1-8B (128K), la ventana de 16.384 tokens de phi-4 es la limitacion estructural mas destacable.

## Limitaciones y advertencias

- Licencia ambigua: el repositorio declara `other`, el README muestra una insignia Apache-2.0 y el modelo base `microsoft/phi-4` se distribuye bajo MIT. Antes de cualquier uso comercial es imprescindible aclarar que terminos aplican realmente a esta redistribucion.
- Finalizacion autonoma nula en el propio benchmark del autor: 0 de 1 escenarios de agente completados con el fichero objetivo exacto. La adherencia al protocolo de herramientas (89,1 %) no garantiza que el modelo complete tareas multi-paso sin un orquestador externo.
- Benchmarks poco representativos: las puntuaciones se calculan sobre 7 a 14 preguntas por suite, lo que produce intervalos de confianza muy amplios. El propio autor advierte que no son comparables con ejecuciones de suite completa.
- Riesgo de alucinacion: aunque TruthfulQA alcanza el 89 % en el subconjunto evaluado, los resultados en MMLU (50 %), HellaSwag (56 %) y MMLU-Pro (56 %) indican debilidad en conocimiento factual y sentido comun, terreno propicio a la invencion de datos.
- Perdida de precision por cuantizacion: Q4_K_M degrada el rendimiento respecto a los pesos en bf16. Los numeros de esta ficha no deben extrapolarse al modelo base sin verificar.
- Idiomas: el modelo base esta entrenado principalmente en ingles. La etiqueta `it` no va acompanada de ninguna evaluacion en italiano; el rendimiento en castellano u otras lenguas no esta documentado.
- Contexto limitado: 16.384 tokens es inferior a las ventanas de 32K o 128K habituales en alternativas contemporaneas, lo que obliga a fragmentar documentos largos.
- Sesgos: no documentados en la model card. El modelo hereda los sesgos del corpus de entrenamiento de phi-4, sobre el que este repositorio no aporta informacion.
- Trazabilidad: la model card esta generada por la herramienta del propio autor (Sigma Studio) y las fechas de creacion y actualizacion del repositorio (octubre de 2026) resultan anomalas, lo que dificulta auditar la procedencia y el proceso de cuantizacion.
- Rendimiento en produccion: no se publican datos de latencia, throughput ni estabilidad bajo carga concurrente, imprescindibles para dimensionar un despliegue real.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/sigmanih/microsoft-phi-4-GGUF-Q4_K_M
- Modelo base `microsoft/phi-4`: https://huggingface.co/microsoft/phi-4
- Repositorio de Sigma Studio (herramienta del autor): https://github.com/Sigmanih/SigmaStudio
- Perfil del autor en HuggingFace: https://huggingface.co/sigmanih
- Phi-4 Technical Report (Microsoft, arXiv:2412.08905): https://arxiv.org/abs/2412.08905
- Pagina de licencia de referencia del modelo base (MIT): https://huggingface.co/microsoft/phi-4/blob/main/LICENSE
