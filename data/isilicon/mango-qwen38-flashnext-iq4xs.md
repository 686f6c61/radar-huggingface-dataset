# isilicon/mango-qwen38-flashnext-iq4xs

## Resumen

Qwen3.8 Flash Next (IQ4_XS) es un mirror de preservación publicado por el usuario isilicon en Hugging Face, que empaqueta la cuantización IQ4_XS creada por mradermacher sobre la variante "Uncensored" de Qwen3.8 Flash Next, a su vez una modificación de rechazos (refusal-modified) realizada por OrcaRouter sobre el modelo original de Qwen. El repositorio no es un entrenamiento nuevo: su valor añadido está en preservar los bytes exactos de la cuantización evaluada en la comparativa Mango y documentar resultados medidos sobre esa configuración precisa.

El modelo base tiene 176.943.899.520 parámetros (dato real de safetensors), lo que lo sitúa en la categoría de modelos grandes, y se distribuye en formato GGUF de archivo único de 98,42 GB. Está orientado a generación de texto conversacional en inglés y chino, con licencia Apache 2.0 declarada.

Su relevancia actual radica en la evaluación Mango adjunta: obtuvo una puntuación ponderada de 84,19/100, la más alta de su cohorte de diez configuraciones, con 12/12 casos agénticos superados y 19/20 pruebas locales de código, lo que lo hace interesante para quien busque un modelo grande sin filtros de rechazo con rendimiento agéntico y de código medido de forma reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles concretos no disponibles; variante "Flash Next" de Qwen3.8) |
| Parametros totales | 176.943.899.520 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_XS (GGUF) |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo unico de 98,42 GB / 91,66 GiB) |

## Arquitectura y entrenamiento

El artefacto distribuido es una cuantización IQ4_XS en formato GGUF de 4 bits (variante importance-matrix de llama.cpp), generada por mradermacher a partir de mradermacher/Qwen3.8-Flash-Next-Uncensored-GGUF, concretamente de la revision `3aa3ff434a0dc2b9dd6886fe12da134756229f74`. La variante "Uncensored" fue producida por OrcaRouter modificando el comportamiento de rechazo del Qwen3.8 Flash Next original. No hay informacion disponible sobre la arquitectura interna (si es MoE, densa o hibrida), el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO.

Este repositorio no aporta innovacion tecnica propia de entrenamiento: su funcion es la preservacion documentada ("preservation-mirror") de la cuantizacion exacta usada en la comparativa Mango, manteniendo los bytes de origen sin cambios.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation) en ingles y chino.
- Generacion y correccion de codigo: 19/20 pruebas locales tipo HumanEval+ superadas (95,00 %).
- Function calling / tool calling: 31/40 comprobaciones locales estilo BFCL superadas (77,50 %).
- Comportamiento agéntico multi-paso: 12/12 casos agénticos superan las comprobaciones mecanicas de completitud, evidencia y permisos.
- Razonamiento matematico: 5/5 problemas de MATH-500 niveles 4-5 correctos en la muestra local.
- Conocimiento general: 92,86 % en un subconjunto de 14 preguntas de MMLU-Pro.
- Comprension social/emocional: 82,16 de media en EQ-Bench v2.
- Ciberseguridad: 83,33/100 en el dominio correspondiente (CyberMetric 100 %, CTI 70-80 %).
- Sin filtros de rechazo (variante "Uncensored"), lo que permite respuestas que el modelo original rehusaria.

## Casos de uso

- Asistentes conversacionales sin restricciones de rechazo: la variante Uncensored responde a consultas que el modelo base rehusaria; util en investigacion sobre alineacion o para dominios donde los rechazos falsos positivos degradan la experiencia.
- Generacion de codigo local: con un 95 % en pruebas tipo HumanEval+, es adecuado para autocompletado, refactorizacion y generacion de funciones en entornos offline o autoalojados.
- Agentes con llamadas a herramientas: supera las comprobaciones mecanicas de los 12 casos agenticos (completitud, evidencia, permisos y totales de precio), lo que lo hace viable para pipelines de agentes con function calling, aunque con un 77,5 % en llamadas estilo BFCL conviene validar las firmas de funcion.
- Analisis de ciberseguridad: buen rendimiento en CyberMetric (100 %) y razonamiento de causa raiz/CWE (80 %), util para triaje de vulnerabilidades y revision de configuraciones con supervision humana.
- Comprension emocional y dialogo social: 82,16 en EQ-Bench v2, adecuado para chatbots de apoyo, roleplay o evaluacion de tono en conversaciones.
- Razonamiento matematico y de conocimiento general: 100 % en MATH-500 niveles 4-5 (muestra de 5) y 92,86 % en MMLU-Pro (muestra de 14), apto para asistentes de estudio y verificacion de razonamiento.
- Reproduccion de experimentos de benchmarking: al ser un mirror de bytes exactos, sirve para replicar la evaluacion Mango con la misma configuracion medida.

## Benchmarks y rendimiento

Los unicos datos publicados son los de la evaluacion Mango (subconjuntos pequenos y graders locales; no son las pipelines oficiales de los benchmarks). No hay comparativa numerica completa con otros modelos en la informacion disponible mas alla de que obtuvo la puntuacion mas alta de su cohorte de diez configuraciones.

| Task / grader local | n | Media / % | Intervalo 95 % | Metodo |
|---|---|---|---|---|
| EQ-Bench v2 | 30 | 82,16 | 74,79-88,30 | Bootstrap media |
| OpenToM labels | 18 | 66,67 | 43,75-83,72 | Wilson |
| CTI multiple choice | 20 | 70,00 | 48,10-85,45 | Wilson |
| CTI root-cause / CWE | 15 | 80,00 | 54,81-92,95 | Wilson |
| CyberMetric | 20 | 100,00 | 83,89-100,00 | Wilson |
| Llamadas locales estilo BFCL | 40 | 77,50 | 62,50-87,68 | Wilson |
| HumanEval+ (tests locales) | 20 | 95,00 | 76,39-99,11 | Wilson |
| IFEval strict prompt pass | 20 | 85,00 | 63,96-94,76 | Wilson |
| MMLU-Pro (subconjunto) | 14 | 92,86 | 68,53-98,73 | Wilson |
| MATH-500 niveles 4-5 | 5 | 100,00 | 56,55-100,00 | Wilson |
| Agent-loop heuristico | 12 | 100,00 | 75,75-100,00 | Wilson |

Puntuacion global ponderada Mango: 84,19/100. Perfil por dominios: social/emocional 74,41 (peso 30 %), ciberseguridad 83,33 (20 %), codigo 95,00 (10 %), agentic 88,75 (30 %), seguimiento de instrucciones 85,00 (5 %), conocimiento general/matematicas 96,43 (5 %).

Rendimiento registrado: carga de trabajo completa de 35,33 min (202 preguntas + 12 casos agenticos), latencia p50/p95 de peticion 7,02/15,76 s, TTFT p50/p95 0,64/1,47 s, tasa mediana de tokens de salida ~86,52 tokens/segundo reportados por el motor (no es throughput nativo de decodificacion). No se han publicado resultados de benchmarks oficiales (MMLU completo, HumanEval oficial, GSM8K) en la informacion disponible.

## Requisitos de hardware

- El archivo GGUF pesa 98,42 GB (91,66 GiB); a eso hay que sumar KV cache, memoria de trabajo y overhead del runtime. La carga en GPU pura requeriria del orden de 100+ GB de VRAM efectiva.
- Con offload parcial a CPU/RAM (llama.cpp), es viable con sistemas con 128-256 GB de RAM unificada o combinaciones de GPU + RAM; no cabe completo en una GPU de consumo (una RTX 4090 con 24 GB solo podria cargar una fraccion pequena de las capas).
- GPU recomendadas para inferencia en GPU: A100 80 GB (x2), H100 80 GB (x2) o plataformas con memoria unificada amplia (Apple Silicon con 128-192 GB, mediante variantes MLX del modelo base).
- Despliegue: llama.cpp (formato GGUF nativo, recomendado), Ollama, LM Studio y runtimes compatibles con GGUF; vLLM y TGI no consumen GGUF directamente (requeririan los pesos originales en safetensors).
- Latencia registrada en la evaluacion: TTFT p50 de 0,64 s y ~86,52 tokens/s reportados, en el hardware usado para el test (no especificado en la informacion disponible).

## Comparativa con modelos similares

Dentro de la cohorte Mango de diez configuraciones se mencionan comparaciones, pero solo hay un dato numerico explicito: la carga de trabajo de este modelo fue de 35,33 min frente a 23,98 min para "Qwen27 MLX4" (Qwen3.8 27B Uncensored en MLX 4-bit). La ventaja de calidad sobre Qwen se declara incierta en la muestra pequena, con estudio de esfuerzo aparte: medium 82,87/100 frente a xhigh 84,41/100 (diferencia emparejada +1,54, intervalo 95 % [-1,71, +4,82]).

| Modelo | Parametros | Formato | Puntuacion Mango | Tiempo de carga de trabajo | Licencia |
|---|---|---|---|---|---|
| Qwen3.8 Flash Next Uncensored IQ4_XS (este) | 176,94 B | GGUF IQ4_XS | 84,19/100 | 35,33 min | Apache 2.0 |
| Qwen3.8 27B Uncensored MLX4 | no disponible | MLX 4-bit | no disponible | 23,98 min | no disponible |
| Resto de la cohorte (8 configuraciones) | no disponible | no disponible | no disponible | no disponible | no disponible |

Comparativas frente a modelos externos (Llama, Mistral, DeepSeek, etc.) no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Variante "Uncensored" (refusal-modified por OrcaRouter): el modelo no rechazara contenidos que el original si rechazaria. Su uso conlleva responsabilidad legal y etica plena del operador; no apto para entornos con usuarios finales sin capas de moderacion propias.
- Los benchmarks son subconjuntos pequenos (n entre 5 y 40) con graders locales, no las pipelines oficiales; los intervalos de confianza son amplios y la ventaja de calidad frente a configuraciones mas pequenas es estadisticamente incierta.
- Idiomas limitados a ingles y chino segun la model card; el rendimiento en castellano no esta documentado.
- Longitud de contexto, numero de parametros activos y detalles de arquitectura no disponibles; dificulta planificar KV cache y coste por token.
- Es un mirror de preservacion: sin soporte del creador original del modelo; `inference: false` en la model card indica que no hay API de inferencia serverless en el Hub.
- El tamano del payload (98,42 GB) no equivale a la VRAM necesaria: hay que anadir KV cache y overhead del runtime.
- La tasa de ~86,52 tokens/s es un calculo de contadores del motor dividido por tiempo de peticion, no throughput nativo de decodificacion, y el conteo de tokens difiere entre motores.
- Licencia Apache 2.0 declarada, permisiva para uso comercial, pero la procedencia de la modificacion "Uncensored" (OrcaRouter) introduce una cadena de derivacion que conviene verificar antes de despliegues comerciales.

## Enlaces

- Modelo: https://huggingface.co/isilicon/mango-qwen38-flashnext-iq4xs
- Modelo base (cuantizacion mradermacher): https://huggingface.co/mradermacher/Qwen3.8-Flash-Next-Uncensored-GGUF
- Coleccion Mango (modelos probados y mirrors de preservacion): https://huggingface.co/collections/isilicon/mango-tested-models-and-preservation-mirrors-6ae3b73994c895ab42e360d2
- Resultados de evaluacion Mango (dataset): https://huggingface.co/datasets/isilicon/mango-evaluation-results
- Estudio de esfuerzo Qwen medium vs xhigh: https://huggingface.co/isilicon/mango-qwen38-27b-uncensored-mlx4#qwen-medium-versus-xhigh
- Comunidad Discord (Infinity): https://discord.gg/5n5YDbQCMy
- Paper, repositorio de codigo del modelo original y demo: no disponibles
