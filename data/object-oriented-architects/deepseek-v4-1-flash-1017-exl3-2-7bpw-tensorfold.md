# object-oriented-architects/DeepSeek-V4.1-Flash-1017-EXL3-2.7bpw-TensorFold

## Resumen
DeepSeek-V4.1-Flash-1017-EXL3-2.7bpw-TensorFold es una cuantizacion de un modelo de lenguaje de gran escala desarrollado originalmente por DeepSeek. La ficha corresponde a una publicacion de la organizacion object-oriented-architects, que parte del checkpoint oficial `deepseek-ai/DeepSeek-V4.1-Flash-1017` y aplica una cuantizacion EXL3 (ExLlamaV3) de 2,7 bits por peso (bpw) orientada a servir el modelo en hardware limitado, concretamente en dos nodos NVIDIA DGX Spark mediante el motor TensorFold.

El modelo base es un transformer con arquitectura Mixture-of-Experts (MoE), segun los tags del repositorio, con 99.373.023.442 parametros totales declarados en los safetensors. La cuantizacion reduce el peso del repositorio a 198,9 GB distribuidos en 363 archivos safetensors, y redistribuye la precision por experto en funcion de su sensibilidad medida, lo que permite un empaquetado mas compacto que la version de referencia de 2,9 bpw manteniendo una divergencia KL menor frente al modelo oficial.

Su relevancia es practica: demuestra que un modelo MoE de ~99.000 millones de parametros puede servirse en dos aceleradores de consumo profesional con ventanas de contexto de hasta 1.048.576 posiciones por peticion y ventanas compartidas de 3.932.160 posiciones entre 8 flujos concurrentes. La licencia es MIT, lo que facilita su uso comercial, aunque las condiciones del modelo base original deben verificarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con torre de vision y drafter DSpark/MTP; 40 capas troncales con 384 expertos enrutados por capa |
| Parametros totales | 99.373.023.442 |
| Parametros activos | no disponible |
| Longitud de contexto | Hasta 1.048.576 posiciones por peticion; ventana compartida de 3.932.160 posiciones entre 8 flujos (motor Zig) |
| Tipos de cuantizacion | EXL3 (ExLlamaV3) con asignacion por sensibilidad: K2, K3, K4 y K5 segun experto; media 2,70 bpw en expertos enrutados y 2,73 bpw en pesos troncales; head a 6 bpw |
| Idiomas soportados | no disponible (el panel de evaluacion incluye una categoria multilingue, pero no se enumeran idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors (363 archivos), formato EXL3 para ExLlamaV3 |

## Arquitectura y entrenamiento
La arquitectura es un transformer MoE con 40 capas troncales, cada una con 384 expertos enrutados con tres matrices (`w1`, `w2`, `w3`). El checkpoint incluye ademas expertos compartidos, una cabeza de salida, un drafter DSpark/MTP (multi-token prediction) y una torre de vision, lo que confirma capacidades multimodales de entrada visual en el modelo base. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF o DPO del modelo original; esos datos no aparecen en la informacion proporcionada.

La innovacion tecnica de esta publicacion es la asignacion de bitrate por experto en funcion de la sensibilidad medida: de los expertos enrutados, 6.237 quedan en K2, 7.529 en K3, 1.559 en K4 y 35 en K5, con una media de 2,70 bpw. El resto de tensores (atencion, expertos compartidos, cabeza, drafter y torre de vision) se hereda byte a byte de la cuantizacion de LibertAIDAI a 2,9 bpw. El motor de inferencia es un fork de TensorFold (rama `deepseek-v41-zig-tp2`) que deduce el ancho de bits de cada tensor a partir de su forma, lo que permite cargar el pack sin un mapa externo de cuantizacion.

## Capacidades
- Generacion de texto en modo chat y completado, con pipeline `text-generation`.
- Razonamiento y resolucion de problemas: el panel de evaluacion incluye categorias de conocimiento y matematicas, con divergencia KL de 0,0563 y 0,0187 respectivamente frente al modelo oficial.
- Generacion de codigo: es el dominio con mejor fidelidad de la cuantizacion (KLD 0,0143, acuerdo top-1 del 96,33%).
- Flujos agenticos y multi-turno: categoria "agentic" evaluada con KLD 0,0265 y acuerdo top-1 del 95,11%; el caso de uso documentado incluye agentes de programacion reenviando resultados de herramientas.
- Contexto largo: categoria "long" con KLD 0,0323; soporta prompts de hasta 1.048.576 posiciones y ventanas compartidas de 3,9M posiciones entre 8 flujos.
- Capacidades multilingues: existe una categoria "multilingual" en el panel de evaluacion, aunque no se detallan los idiomas cubiertos.
- Vision: el pack incluye la torre de vision del modelo base, por lo que conserva la capacidad multimodal de entrada de imagenes.
- Decodificacion especulativa: incorpora el drafter DSpark/MTP del modelo base, heredado sin recuantizar.

## Casos de uso
- Agentes de programacion autonoma: el modelo puede mantener conversaciones multi-turno con resultados de herramientas y contexto de repositorio completo. Con 1.048.576 posiciones por peticion y un acuerdo top-1 del 96,33% en codigo, es adecuado para tareas de refactorizacion, revision de PRs y generacion de parches sobre bases de codigo grandes.
- Asistencia en terminal y CI/CD: desplegado en dos DGX Spark con el motor Zig, puede servir a varios agentes concurrentes (8 flujos en la prueba documentada) manteniendo 8-11 GiB de memoria libre por nodo, lo que permite integrarlo en pipelines internos sin GPU de centro de datos.
- Analisis de documentos extensos: la ventana de 1M posiciones por peticion permite resumir, extraer y responder preguntas sobre informes, expedientes o libros tecnicos completos en una sola pasada, con un prefill medido de 546 s para un prompt de 1.040.000 tokens.
- Evaluacion de modelos y control de calidad de cuantizaciones: el pack incluye metricas reproducibles de KLD, acuerdo top-1 y perplejidad frente al checkpoint oficial, util para equipos que necesiten validar una cuantizacion antes de adoptarla en produccion.
- Despliegue en laboratorio con hardware de gama alta de consumo profesional: al ocupar 198,9 GB y dejar margen de memoria en dos DGX Spark, sirve para prototipar aplicaciones sobre un MoE de ~99.000 millones de parametros sin alquilar nodos H100.
- Procesamiento multimodal de capturas y diagramas: la torre de vision heredada permite describir interfaces, extraer texto de imagenes tecnicas o interpretar diagramas de arquitectura dentro de un flujo de documentacion.
- Investigacion sobre cuantizacion selectiva: la receta de asignacion por sensibilidad (K2-K5 por experto) es un caso de estudio replicable para quienes investigan compresion de MoE.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks convencionales (MMLU, GSM8K, HumanEval) con cifras numericas en la informacion disponible; la model card menciona que la precision en MMLU y GSM8K coincide con la API de DeepSeek, pero sin valores. Si se publican las siguientes metricas de fidelidad frente al modelo oficial:

| Metrica | Pesos oficiales (FP8/MXFP4) | Este repo (2,7 bpw) | LibertAIDAI (2,9 bpw) |
|---|---:|---:|---:|
| Divergencia KL media | — | 0,0248 | 0,0324 |
| Divergencia KL p99 | — | 0,375 | 0,433 |
| Acuerdo top-1 | — | 95,64% | 94,66% |
| Perplejidad | 1,5614 | 1,5825 | 1,5918 |

Desglose por dominio (posiciones evaluadas, KLD y top-1):

| Dominio | Posiciones | KLD este repo | KLD LibertAIDAI | Top-1 este repo | Top-1 LibertAIDAI |
|---|---:|---:|---:|---:|---:|
| Codigo | 161.765 | 0,0143 | 0,0214 | 96,33% | 95,30% |
| Agentico | 16.206 | 0,0265 | 0,0395 | 95,11% | 93,79% |
| Contexto largo | 15.730 | 0,0323 | 0,0403 | 95,38% | 94,47% |
| Chat | 13.593 | 0,0724 | 0,0882 | 91,58% | 90,82% |
| Conocimiento | 11.658 | 0,0563 | 0,0663 | 93,74% | 92,65% |
| Matematicas | 9.643 | 0,0187 | 0,0259 | 95,34% | 94,64% |
| Multilingue | 8.419 | 0,0783 | 0,0669 | 94,24% | 94,39% |
| Escritura | 2.702 | 0,0799 | 0,0942 | 92,67% | 91,41% |

El panel de evaluacion consta de 199 conversaciones, 301.828 tokens y 239.716 posiciones puntuadas, generado con las herramientas `caldata` de sudoingX a partir de respuestas del propio DeepSeek-V4.1-Flash-1017. La unica categoria donde este pack empeora respecto al de 2,9 bpw es multilingue (KLD 0,0783 frente a 0,0669).

## Requisitos de hardware
- VRAM/espacio en disco: 198,9 GB (185,2 GiB) para los pesos en safetensors; requiere reparto entre al menos dos aceleradores de 128 GB unificados.
- Configuracion validada: dos NVIDIA DGX Spark con el motor Zig de TensorFold (`deepseek-v41-zig-tp2`), con 9,0/11,3 GiB libres por nodo tras un prompt de 1M tokens y 8,3/10,4 GiB libres con 8 chats concurrentes de ~230K tokens.
- Memoria de cache KV: en el motor Python, aproximadamente 1,45 GiB por nodo por millon de tokens.
- GPU de centro de datos: no se documenta su uso en A100, H100 u otras GPU; el pack esta pensado y probado para DGX Spark.
- GPU de consumo: no cabe en una RTX 4090 ni en GPUs de 24-48 GB; el tamano del pack lo impide.
- Opciones de despliegue: TensorFold en sus ramas `deepseek-v41-zig-tp2` (produccion) y `deepseek-v41-tp2` (Python, usado para las mediciones). El kit de servido Mia/LibertAIDAI no se espera compatible porque depende de un unico K por capa en `exl3_k_map.json`.
- Latencia y throughput: prefill de 546 s para un prompt de 1.040.000 tokens; la velocidad de decodificacion coincide con el pack de 2,9 bpw en el mismo motor, sin cifras absolutas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | KLD media vs oficial | Licencia |
|---|---|---:|---|---:|---|
| Este repo (2,7 bpw) | 99.373.023.442 | 1.048.576 por peticion; 3.932.160 compartidos | EXL3 selectiva 2,70 bpw | 0,0248 | MIT |
| LibertAIDAI 2,9 bpw | mismo base | no disponible en la informacion | EXL3 2,9 bpw | 0,0324 | no disponible en la informacion |
| DeepSeek-V4.1-Flash-1017 oficial | mismo base | no disponible en la informacion | FP8 / MXFP4 | referencia | no disponible en la informacion |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias
- La cuantizacion introduce degradacion medible: KLD media de 0,0248 y acuerdo top-1 del 95,64% frente al modelo oficial; en chat y escritura el acuerdo baja al 91,58% y 92,67%.
- El dominio multilingue es el unico donde este pack es peor que el de 2,9 bpw (KLD 0,0783 frente a 0,0669); no se recomienda para cargas multilingues exigentes sin validacion propia.
- Solo esta probado con los forks de TensorFold de bertholomus; otros motores (vLLM, llama.cpp, Ollama, TGI) no estan soportados segun la model card.
- El kit de servido Mia/LibertAIDAI no se espera compatible con este pack, y no se ha probado.
- No se incluyen las tablas Engram en el repositorio, lo que puede afectar a funcionalidades que dependan de ellas.
- La licencia MIT del repositorio no sustituye a la licencia del modelo base `deepseek-ai/DeepSeek-V4.1-Flash-1017`; debe revisarse antes de uso comercial.
- Riesgo de alucinacion inherente al modelo base; no se documentan evaluaciones de sesgo ni de seguridad en la informacion disponible.
- El prefill de prompts de 1M tokens tarda cientos de segundos (546 s medidos), lo que limita su uso interactivo con contextos muy largos.
- Requiere hardware especializado (dos DGX Spark) y no cabe en GPUs de consumo convencionales.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/object-oriented-architects/DeepSeek-V4.1-Flash-1017-EXL3-2.7bpw-TensorFold
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Cuantizacion de referencia 2,9 bpw: https://huggingface.co/LibertAIDAI/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw
- Receta de cuantizacion de sudoingX: https://github.com/sudoingX/dgx-spark-deepseek-v41
- TensorFold (original): https://github.com/ashhart/TensorFold
- TensorFold, rama Zig: https://github.com/bertholomus/TensorFold/tree/deepseek-v41-zig-tp2
- TensorFold, rama Python: https://github.com/bertholomus/TensorFold/tree/deepseek-v41-tp2
- Kit de servido Mia/LibertAIDAI: https://github.com/MiaAI-Lab/DeepSeek-v4.1-Flash-EXL3-2x-DGX-Sparks
- Receta de evaluacion de lucataco: https://github.com/lucataco/DeepSeek-V4.1-Flas (enlace truncado en la model card)
- Parches de configuracion Zig: https://huggingface.co/object-oriented-architects/DeepSeek-V4.1-Flash-1017-EXL3-2.7bpw-TensorFold/tree/main/zig-tp2-patches
