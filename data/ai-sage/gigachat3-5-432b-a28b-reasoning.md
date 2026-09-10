# ai-sage/GigaChat3.5-432B-A28B-Reasoning

## Resumen

GigaChat 3.5 Reasoning es la primera variante de la familia GigaChat con razonamiento completo entrenado mediante RL en linea (online RL). Lo desarrolla ai-sage, la organizacion responsable de los modelos GigaChat, y se distribuye bajo licencia MIT. Se trata de un modelo de tipo Mixture-of-Experts con 432.000 millones de parametros totales y 28.000 millones de parametros activos por token, lo que lo situa en la categoria de modelos frontera de gran escala pero con un coste de inferencia por token relativamente contenido gracias al enrutado disperso.

La innovacion principal es su arquitectura hibrida, que combina capas de Multi-head Latent Attention (MLA) con capas de atencion lineal GatedDeltaNet, ademas de una normalizacion GatedNorm y tres cabezas MTP (Multi-Token Prediction) para decodificacion especulativa. El modelo soporta una longitud de contexto maxima de 262.144 tokens y esta entrenado de forma nativa en FP8 en todas las etapas, lo que reduce el peso del repositorio a 446 GB.

Es relevante ahora porque cubre el hueco de modelos de razonamiento abiertos con licencia permisiva y capacidades fuertes en matematicas, generacion y edicion de codigo, agentes de repositorio (estilo SWE-bench), function calling y salida estructurada, dominios donde los modelos abiertos solian quedar por detras de las alternativas cerradas o de pesos abiertos con licencias mas restrictivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido MoE con Multi-head Latent Attention (MLA) y capas de atencion lineal GatedDeltaNet; GatedNorm tras RMSNorm; 3 cabezas MTP |
| Parametros totales | 432B nominales (438.085.063.424 medidos en los ficheros safetensors) |
| Parametros activos | 28B |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | FP8 nativo (pesos publicados en este repo); bf16 disponible en repositorio aparte. No se listan GGUF, AWQ ni GPTQ |
| Idiomas soportados | Ruso (ru) e ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP8), con codigo personalizado (`custom_code`, requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

El modelo es un Mixture-of-Experts de 432B parametros con 28B activos. La columna vertebral combina capas de Multi-head Latent Attention con capas de atencion lineal basadas en GatedDeltaNet, un esquema hibrido que reduce el coste de atencion en contextos largos respecto a un transformer denso puro. Sobre cada RMSNorm se aplica GatedNorm, una puerta multiplicativa aprendida que modula la activacion. El modelo incorpora tres cabezas MTP para decodificacion especulativa, orientadas a mejorar el throughput de generacion. El contexto maximo soportado es de 262.144 tokens y el entrenamiento se realizo de forma nativa en FP8 en todas las etapas.

El post-entrenamiento parte de un checkpoint SFT. Sobre el se entrenan de forma independiente seis expertos de dominio con RL en linea, que despues se fusionan en un unico modelo de publicacion mediante destilacion on-policy (OPD). Los expertos son: STEM (matematicas, olimpiadas, ciencias naturales; recompensa por verificacion de respuesta final), Code (algoritmos, edicion de codigo, generacion de tests; recompensa por ejecucion), Code Agent (tareas a nivel de repositorio estilo SWE-bench; recompensa por tests tras aplicar el parche), General Agent (function calling, interaccion con usuario, memoria, busqueda; recompensa por estado final del entorno), Dialogue (evaluacion por pares con un juez LLM) y Soft Skills (seguimiento de instrucciones, formatos, contexto largo y salida estructurada; verificacion de respuesta final). Los expertos se entrenan con CISPO. Antes de cada ronda, las tareas resueltas en mas del 75% de los intentos se eliminan del conjunto, de modo que el set de entrenamiento se desplaza hacia tareas mas dificiles conforme el modelo mejora. Las recompensas combinan comprobaciones con puerta para restricciones duras, recompensas aditivas de calidad y una penalizacion de longitud adaptativa. La fusion final mediante OPD hace que el estudiante genere su propia trayectoria y el experto del dominio correspondiente proporcione supervision a nivel de token sobre ella.

## Capacidades

- Generacion de texto conversacional y razonamiento en cadena, con modo de razonamiento explicito (modelo de la familia Reasoning).
- Razonamiento matematico avanzado: problemas tipo AIME, HMMT y olimpiadas, con verificacion de respuesta final como senal de entrenamiento.
- Generacion y edicion de codigo, incluida generacion de tests y tareas a nivel de repositorio (parches verificados con la suite de tests).
- Uso de herramientas y function calling, con un experto dedicado a agentes generales (memoria, busqueda, interaccion multi-turno).
- Salida estructurada: el experto de Soft Skills se entrena especificamente para formatos y structured output, con resultados destacados en StructEval.
- Razonamiento multi-paso y comportamiento agentico en entornos con estado final verificable (TAU3-bench, Terminal-Bench).
- Contexto largo: hasta 262.144 tokens, apoyado en capas de atencion lineal que reducen el coste frente a atencion cuadratica.
- Capacidades multilingues limitadas a ruso e ingles; no se declaran otros idiomas.
- Decodificacion especulativa nativa mediante tres cabezas MTP.
- Pesos entrenados de forma nativa en FP8, lo que facilita el despliegue en hardware con soporte FP8.

## Casos de uso

- Agente de resolucion de incidencias en repositorios: el modelo puede recibir un issue y el arbol del repositorio, generar un parche y validarlo con la suite de tests, replicando el escenario de SWE-bench Verified donde obtiene 64,7. Es adecuado porque fue entrenado con recompensa basada en tests aplicados al parche.
- Automatizacion de tareas de terminal y operaciones: con 30,3 en Terminal-Bench 2, puede encadenar comandos y verificar el estado final del entorno, util para scripts de aprovisionamiento o diagnostico de sistemas.
- Atencion al cliente multi-turno en ruso: el experto de Dialogue se entrena con evaluacion lado a lado por un juez LLM y el contexto de 262K tokens permite mantener historiales extensos de conversacion sin truncar.
- Asistentes con function calling en produccion: el soporte de tool use y structured output permite integrarlo en pipelines donde la salida debe validarse contra un esquema JSON antes de ejecutarse, por ejemplo en orquestacion de flujos internos.
- Tutorizacion y resolucion de problemas de matematicas y ciencias: con 89 en AIME 2025 y 83,13 en HMMT 2025, puede generar soluciones paso a paso para problemas de nivel competitivo, con la salvedad de que las respuestas deben verificarse.
- Extraccion y normalizacion de datos en contextos largos: 85 en StructEval y 262K tokens de ventana permiten procesar contratos, informes o expedientes extensos y devolver campos estructurados.
- Copiloto de codigo en IDE o CI/CD: con 85,4 en Live Code Bench v6 puede generar y revisar codigo dentro de pipelines, incluyendo generacion de tests automatizados marcada por recompensa de ejecucion.
- Evaluacion de calidad de dialogos: el componente de Dialogue, entrenado con juicio por pares, puede emplearse como evaluador auxiliar dentro de procesos de anotacion o control de calidad.

## Benchmarks y rendimiento

Resultados publicados en la model card. La comparativa se realiza contra GigaChat 3.5 Ultra Instruct (mismo desarrollador, sin razonamiento) y DeepSeek V4 Flash Preview Reasoning. Los valores en negrita son los mejores de cada fila segun la tabla original.

| Tarea | GigaChat 3.5 Ultra Instruct | GigaChat 3.5 Ultra Reasoning | DeepSeek V4 Flash Preview Reasoning |
|---|---:|---:|---:|
| AIME 2025, mean@32 | 68 | **89** | 88,95 |
| AIME 2026, mean@32 | 67 | **92** | 90,4 |
| HMMT 2025, mean@8 | 36,67 | 83,13 | **95,21** |
| IMOAnswerBench | 32 | 73 | **85,75** |
| GPQA-Diamond | 61,11 | 82,32 | **87,4** |
| IFBench | 43,66 | **77** | 73,33 |
| StructEval | 74,35 | **85** | 80,19 |
| MERA-2.0 | 24,9 | **42,3** | no disponible |
| Function Calling V4 | 51,57 | 58,59 | **68,06** |
| TAU3-bench | 50,03 | 47,8 | **67,7** |
| Natural Plan | 64 | 80,19 | **88** |
| Live Code Bench v6 | 56,2 | 85,4 | **87,87** |
| SWE-bench Verified | 42,6 | 64,7 | **78,6** |
| Terminal-Bench 2 | 13,48 | 30,3 | **56,6** |
| Pollux (Arena) | no disponible | no disponible | no disponible |

La seccion de Arena Pollux aparece truncada en la informacion proporcionada, por lo que no se reproducen sus valores.

## Requisitos de hardware

- Peso de los pesos en FP8: aproximadamente 438 GB (438.085.063.424 parametros a 8 bits). Solo el almacenamiento de pesos ya exige un nodo multi-GPU.
- Despliegue minimo en FP8: 8 GPU H100 de 80 GB (640 GB agregados) dejan unos 200 GB para cache KV, activaciones y margen del runtime. Con tensor parallelism de 8 vias es el escenario mas ajustado razonable.
- Alternativa FP8 con mas margen: 4 GPU H200 de 141 GB (564 GB) o 8 GPU H200, esta ultima opcion comoda para contextos largos.
- Version bf16: alrededor de 876 GB de pesos, lo que requiere 16 GPU H100 de 80 GB o 8 GPU H200 de 141 GB. El propio autor recomienda el repositorio bf16 para fine-tuning o cuantizacion personalizada.
- GPU de consumo: no cabe. Ni siquiera en configuraciones multi-GPU de consumo (4x RTX 4090 con 24 GB = 96 GB) se aproxima al espacio necesario para los pesos en FP8.
- Opciones de despliegue: el modelo declara `custom_code`, por lo que requiere `trust_remote_code=True` en la libreria de inferencia. Servidores compatibles con FP8 y atencion hibrida (vLLM o SGLang con soporte para la arquitectura) son las vias naturales; no se publica soporte GGUF, por lo que llama.cpp u Ollama no son viables con este repositorio.
- Decodificacion especulativa: las tres cabezas MTP permiten acelerar la generacion, con el consiguiente aumento de throughput a igual hardware.
- Latencia y throughput concretos: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Razonamiento | Resultados destacados |
|---|---|---|---|---|---|
| GigaChat 3.5 Reasoning | 432B totales / 28B activos | 262.144 tokens | MIT | Si (online RL) | AIME 2025 89; Live Code Bench v6 85,4; SWE-bench Verified 64,7 |
| GigaChat 3.5 Ultra Instruct | no disponible | no disponible | no disponible | No | AIME 2025 68; Live Code Bench v6 56,2; SWE-bench Verified 42,6 |
| DeepSeek V4 Flash Preview Reasoning | no disponible | no disponible | no disponible | Si | AIME 2025 88,95; Live Code Bench v6 87,87; SWE-bench Verified 78,6; Terminal-Bench 2 56,6 |

Frente a GigaChat 3.5 Ultra Instruct, la variante Reasoning mejora de forma clara en matematicas (68 a 89 en AIME 2025), codigo (56,2 a 85,4 en Live Code Bench v6) y agentes de repositorio (42,6 a 64,7 en SWE-bench Verified). Frente a DeepSeek V4 Flash Preview Reasoning, GigaChat 3.5 Reasoning gana en AIME 2025 (89 frente a 88,95), AIME 2026 (92 frente a 90,4), IFBench (77 frente a 73,33), StructEval (85 frente a 80,19) y MERA-2.0 (42,3, sin dato del competidor), pero pierde en HMMT 2025, IMOAnswerBench, GPQA-Diamond, Function Calling V4, TAU3-bench, Natural Plan, Live Code Bench v6, SWE-bench Verified y Terminal-Bench 2. Los parametros, contexto y licencia de las dos alternativas no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas: solo ruso e ingles declarados. El rendimiento en castellano no esta documentado y no deberia asumirse.
- Riesgo de alucinacion: es un modelo de razonamiento generativo; los propios autores emplean verificacion de respuesta final como senal de recompensa, lo que implica que la verificacion externa sigue siendo necesaria en produccion, especialmente en matematicas y afirmaciones factuales.
- Rendimiento inferior al competidor en tareas de agente real (TAU3-bench 47,8 frente a 67,7; Terminal-Bench 2 30,3 frente a 56,6), lo que limita su uso en automatizacion de entornos sin supervision.
- Function calling: 58,59 en Function Calling V4, por debajo del 68,06 del comparador, por lo que en flujos criticos conviene validar estrictamente los argumentos generados.
- Coste de despliegue: solo los pesos en FP8 ocupan unos 438 GB, lo que excluye cualquier escenario de GPU de consumo y exige infraestructura multi-GPU de gama alta.
- Requiere `trust_remote_code`: la arquitectura es personalizada y el codigo del repositorio se ejecuta en el proceso de carga, lo que debe revisarse en entornos con requisitos de seguridad estrictos.
- Repositorio de 446 GB: la descarga y el almacenamiento suponen una barrera operativa relevante.
- Licencia MIT: permite uso comercial sin restricciones de atribucion mas alla de las habituales, pero conviene verificar la licencia de los datos de entrenamiento, no detallada en la informacion disponible.
- Sesgos: la model card no documenta evaluaciones de sesgo, toxicidad ni seguridad, por lo que no hay datos disponibles al respecto.
- Seccion de Arena (Pollux) truncada: no se pueden evaluar los resultados de comparacion ciega con usuarios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ai-sage/GigaChat3.5-432B-A28B-Reasoning
- Version bf16 para fine-tuning y cuantizacion personalizada: https://huggingface.co/ai-sage/GigaChat3.5-432B-A28B-Reasoning-bf16
- Modelo base: https://huggingface.co/ai-sage/GigaChat3.5-432B-A28B-base
- Diagrama de arquitectura: https://cdn-uploads.huggingface.co/production/uploads/67a4f89d46a7612efd49c561/AsNtVz8i9vxHhqcT5LT9Y.png
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada.
