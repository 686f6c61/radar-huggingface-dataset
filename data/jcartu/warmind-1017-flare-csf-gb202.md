# jcartu/WARMIND-1017-FLARE-CSF-gb202

## Resumen

WARMIND-1017-FLARE-CSF-gb202 es un paquete de inferencia publicado por el usuario jcartu en Hugging Face, consistente en la exportación del modelo WARMIND-1017 al runtime Flare de NVIDIA (proyecto spark-local-inference). WARMIND-1017 es a su vez una versión "abliterated" (dirección de rechazo invertida en 132 tensores densos) de DeepSeek-V4.1-Flash-1017, el modelo de DeepSeek publicado bajo licencia MIT. Este repositorio no contiene pesos en formato estándar (safetensors, GGUF), sino un paquete de despliegue con pesos, kernels CUDA compilados y grafos de ejecución capturados para un despliegue concreto: cuatro GPU RTX PRO 6000 Blackwell de 96 GB en paralelo de tensor 4.

La variante CSF se distingue de la versión nativa del mismo autor por almacenar las escalas de expertos con la compresión sin pérdida CSF de Local Inference Lab, lo que libera memoria de GPU para caché KV: aproximadamente 20,8 millones de tokens KV frente a 16,8 millones en la versión nativa, con un rendimiento prácticamente idéntico (299 frente a 298 tok/s a concurrencia 1, 2.071 frente a 2.129 tok/s a concurrencia 32, dentro del ruido entre ejecuciones).

El modelo es relevante para quienes dispongan de hardware Blackwell de gama profesional y necesiten servir contexto muy largo (1.048.576 tokens por petición, 32 peticiones concurrentes) con un modelo sin censura. Su utilidad queda limitada por el formato propietario: Transformers, vLLM, SGLang y llama.cpp no pueden cargarlo, y requiere la imagen de contenedor Flare concreta indicada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base DeepSeek-V4.1-Flash-1017; detalles de arquitectura no incluidos en la informacion proporcionada) |
| Parametros totales | 42.186.777 (segun metadatos de safetensors del repositorio) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens por peticion |
| Tipos de cuantizacion | 8-bit (tag del repositorio); NVFP4 en la cabeza draft, FP8 en la cabeza Markov, BF16 en el computo MLA, escalas de expertos en CSF |
| Idiomas soportados | no disponible |
| Licencia | MIT para los pesos; Apache-2.0 y BSD-3-Clause para los componentes compilados del runtime |
| Formato de pesos | Paquete de runtime Flare (`gb202-tp4`): pesos, kernels CUDA compilados y grafos de ejecucion capturados; no compatible con safetensors estandar, GGUF, vLLM, SGLang ni llama.cpp |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base DeepSeek-V4.1-Flash-1017 en la documentacion proporcionada. La model card menciona componentes concretos del pipeline de inferencia: computo MLA en BF16, cabeza draft en NVFP4, cabeza Markov y muestreo paralelo de vocabulario en FP8, y escalas de expertos comprimidas con CSF (lo que implica una arquitectura con expertos, aunque no se detalla el esquema MoE). Tambien se menciona un componente denominado Engram con 188,8 GiB de tablas y 5,7 GiB de escalas residentes.

El proceso de adaptacion aplicado por jcartu consiste en invertir la direccion de rechazo en 132 tensores densos (abliteration) sin modificar nada mas, y posteriormente exportar el resultado al runtime Flare con los ajustes de exportacion de joninco. La exportacion se verifico con SHA-256 sobre los 82 archivos de pesos y runtime contra el repositorio WARMIND-1017 en el commit `4fbce630`. No se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni fases de RLHF o DPO.

## Capacidades

- Generacion de texto en el pipeline `text-generation`; no se documentan capacidades especificas de razonamiento, codigo, matematicas o vision.
- Modelo sin censura: la abliteration invierte la direccion de rechazo en 132 tensores densos, por lo que no aplica rechazos aprendidos.
- Decodificacion especulativa con siete tokens draft MTP por ronda y verificacion adaptativa.
- Soporte de hasta 32 peticiones concurrentes con 1.048.576 tokens de contexto por peticion.
- Muestreo con temperatura, top-k, min-p y penalizaciones de presencia y frecuencia fijados en sus valores por defecto; las peticiones que los modifiquen se sirven con el valor por defecto en lugar de rechazarse.
- top-p fijado en 1.0; el muestreo paralelo de vocabulario no admite valores inferiores.
- No se documenta soporte de tool calling, function calling, agentes, multilingueismo ni modos especiales de razonamiento.

## Casos de uso

- Analisis de documentos extensos: con 1.048.576 tokens de contexto por peticion, el modelo puede procesar libros completos, expedientes o bases de codigo en una sola pasada sin fragmentacion ni recuperacion externa.
- Servicio de chat concurrente de alta densidad: la configuracion soporta 32 peticiones simultaneas y 20.789.376 tokens KV en el equipo de referencia, lo que permite mantener muchas sesiones largas abiertas a la vez.
- Procesamiento por lotes de corpus largos: el rendimiento medido (2.071-2.129 tok/s a concurrencia 32) lo hace adecuado para tareas de resumen, extraccion o clasificacion sobre grandes volumenes de texto en un unico nodo de cuatro GPU.
- Investigacion sobre alineacion y seguridad: al ser una version abliterated, sirve para estudiar el comportamiento de modelos sin rechazo aprendido y comparar con la version original de DeepSeek.
- Evaluacion de runtimes de inferencia: el paquete incluye kernels compilados y grafos capturados, por lo que es util para medir el rendimiento de Flare y de la compresion CSF frente a escalas nativas en hardware Blackwell.
- Despliegue on-premise con contexto masivo: para organizaciones con cuatro RTX PRO 6000 Blackwell y 510 GB de NVMe local que necesiten servir un modelo de gran contexto sin dependencia de la nube.

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados en la informacion disponible son medidas de throughput del propio autor, comparando esta variante CSF con la variante nativa (WARMIND-1017-FLARE-gb202), ambas descargadas la misma noche:

| Metrica | Nativa | CSF |
|---|---|---|
| Tokens KV en el equipo de referencia | 16.807.936 | 20.789.376 |
| `llm_decode_bench` a C1 (tok/s) | 299 | 298 |
| `llm_decode_bench` a C8 (tok/s) | 1.144 | 1.136 |
| `llm_decode_bench` a C16 (tok/s) | 1.593 | 1.549 |
| `llm_decode_bench` a C32 (tok/s) | 2.071 | 2.129 |
| Test de un solo usuario de Festr (tok/s) | 544 | 563 |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- GPU: cuatro RTX PRO 6000 Blackwell de 96 GB (SM120), tensor parallel 4, Linux x86-64. No hay soporte para otras configuraciones en este paquete.
- Almacenamiento: 510 GB (475 GiB) de NVMe local; la herramienta `hf` escribe directamente en la carpeta.
- Memoria de host: RAM suficiente para la cache de filas de Engram que se elija (32 GiB en el ejemplo del autor), mas 5,7 GiB de escalas Engram residentes y unos pocos GiB para Flare.
- Software: NVIDIA Container Toolkit (probado con driver 615.78.08) e imagen Flare `ghcr.io/local-inference-lab/flare:release-18b16e1-main-20261104`.
- No cabe en GPU de consumo: requiere cuatro aceleradores profesionales Blackwell y un formato de runtime propietario.
- Opciones de despliegue: exclusivamente Flare; Transformers, vLLM, SGLang y llama.cpp no pueden cargar este formato.
- Rendimiento medido: 298 tok/s a concurrencia 1, 2.129 tok/s a concurrencia 32, 563 tok/s en prueba de un solo usuario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| WARMIND-1017-FLARE-CSF-gb202 | 42.186.777 | 1.048.576 tokens/peticion; 20,8 M tokens KV | Flare `gb202-tp4` | MIT (pesos) | Variante con escalas CSF; foco en capacidad KV |
| WARMIND-1017-FLARE-gb202 (mismo autor) | 42.186.777 | 1.048.576 tokens/peticion; 16,8 M tokens KV | Flare `gb202-tp4` | MIT (pesos) | Mismos pesos y ajustes con escalas nativas; menos capacidad KV |
| DeepSeek-V4.1-Flash-1017-FLARE `gb202` (Local Inference Lab) | no disponible | ~17,0 M tokens KV en cuatro GPU de 96 GB (segun su model card) | Flare `gb202-tp4` | MIT | Pesos originales sin abliteration; revision del 4 de noviembre con escalas nativas |
| DeepSeek-V4.1-Flash-1017 (DeepSeek) | no disponible | no disponible | safetensors estandar | MIT | Modelo base original; compatible con runtimes convencionales |

## Limitaciones y advertencias

- La abliteration elimina los rechazos aprendidos, lo que incrementa el riesgo de generar contenido danino, sesgado o inapropiado sin filtro; no es adecuado para aplicaciones orientadas al publico sin moderacion externa.
- Riesgo de alucinacion no cuantificado; no se han publicado evaluaciones de fidelidad factual en la informacion disponible.
- El muestreo esta fijado: temperatura, top-k, min-p y penalizaciones usan los valores por defecto, y top-p esta forzado a 1.0. Las peticiones que soliciten otros valores se sirven silenciosamente con los valores por defecto, lo que puede alterar el comportamiento esperado en produccion.
- Formato propietario: no se puede cargar con Transformers, vLLM, SGLang ni llama.cpp; requiere la imagen Flare concreta y el hardware especificado.
- Hardware muy restrictivo: cuatro RTX PRO 6000 Blackwell de 96 GB y 510 GB de NVMe; no hay alternativa en GPU de consumo.
- La firma del paquete corresponde a una clave de desarrollo local (namespace `local-development`), no a una clave de publicacion verificada de terceros.
- El repositorio tiene 0 descargas y 5 likes en el momento de la consulta; no hay validacion independiente del rendimiento ni de la calidad del modelo.
- No se dispone de informacion sobre idiomas soportados ni sobre sesgos especificos del modelo base.
- La licencia MIT cubre los pesos, pero los componentes compilados del runtime tienen licencias Apache-2.0 y BSD-3-Clause que deben respetarse por separado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jcartu/WARMIND-1017-FLARE-CSF-gb202
- Modelo base WARMIND-1017: https://huggingface.co/jcartu/WARMIND-1017
- Variante nativa del mismo autor: https://huggingface.co/jcartu/WARMIND-1017-FLARE-gb202
- Modelo original de DeepSeek: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Paquete de Local Inference Lab: https://huggingface.co/local-inference-lab/DeepSeek-V4.1-Flash-1017-FLARE/tree/gb202
- Proyecto Flare (NVIDIA spark-local-inference): https://github.com/NVIDIA/spark-local-inference
- Pull request de Flare sobre top-p: https://github.com/NVIDIA/spark-local-inference/pull/180
- Rama de la build anterior: https://huggingface.co/jcartu/WARMIND-1017-FLARE-CSF-gb202/tree/gb202-6fa01a4
- Fichero de firma: https://huggingface.co/jcartu/WARMIND-1017-FLARE-CSF-gb202/blob/main/development-publisher.json
