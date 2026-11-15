# qda-lab/QDA-Qwen3.8-27B-Q6-GGUF

## Resumen

QDA-Qwen3.8-27B-Q6-GGUF es una cuantizacion GGUF del modelo Qwen/Qwen3.8-27B, publicada por qda-lab para su uso con llama.cpp. El modelo base es un transformer denso de 27.320.697.856 parametros (27,3 mil millones) desarrollado por el equipo Qwen, y esta version cuantizada mantiene la licencia Apache-2.0 del original. El repositorio ocupa 22,0 GB y esta pensado para inferencia local con llama.cpp sin modificaciones del runtime.

La particularidad de esta publicacion no es el modelo en si, sino el metodo de cuantizacion: una mezcla por tensor seleccionada mediante busqueda automatizada de QDA, con un 75 % de los pesos en Q6_K, un 19 % en Q5_K, un 5 % en Q8_0 y un 1 % en Q4_K (las normas y tensores pequenos se mantienen en F32). Los tensores Q5_K y Q6_K se resuelven con GPTQ directamente sobre las rejillas de llama.cpp, con ajuste de escalas ponderado por la diagonal del hessiano.

El autor publica una evaluacion comparativa frente a la cuantizacion UD-Q6_K de unsloth, con una media de 80,3 frente a 78,9 en seis benchmarks en modo thinking. Es relevante para quienes necesitan ejecutar un modelo de razonamiento de 27B en hardware local con la maxima fidelidad posible respecto al modelo en bf16, y para quienes quieran reproducir el proceso de cuantizacion, ya que se publican la receta y los datos de calibracion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen/Qwen3.8-27B); el autor no detalla la arquitectura interna en la model card |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Mezcla por tensor: 75 % Q6_K, 19 % Q5_K, 5 % Q8_0, 1 % Q4_K (normas y tensores pequenos en F32) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero unico `QDA-Qwen3.8-27B-Q6.gguf`, 22,0 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 27,3 mil millones de parametros. La model card de esta cuantizacion no describe la arquitectura interna del modelo original (numero de capas, dimension oculta, mecanismo de atencion ni datos de entrenamiento); solo menciona que conserva el bloque de prediccion multi-token (multi-token prediction) del modelo base y que dispone de modo thinking. Para los detalles de arquitectura y preentrenamiento hay que remitirse a la model card de Qwen/Qwen3.8-27B, que no forma parte de la informacion proporcionada.

El proceso de cuantizacion es el elemento tecnico diferencial. QDA selecciona automaticamente el tipo de cada tensor mediante busqueda, y en las 64 capas del transformer los tensores Q5_K y Q6_K se resuelven con GPTQ (damping 0,01, orden de activacion estatico) directamente sobre las rejillas de cuantizacion de llama.cpp, ajustando las escalas de cada grupo con el metodo de ajuste ponderado por importancia de llama.cpp y ponderando por la diagonal del hessiano de GPTQ. El embedding de tokens, la cabeza de salida, el bloque de prediccion multi-token y los tensores en Q8_0 se escriben desde el modelo en bf16 con el cuantizador nativo de llama.cpp.

La calibracion usa respuestas del propio modelo base: `kd-traces-1234.jsonl` contiene 1.234 filas con los token ids de cada prompt y de la respuesta generada por Qwen/Qwen3.8-27B en vLLM (bf16) con temperatura 1,0, top-p 0,95, top-k 20, semilla 17 + numero de fila y un maximo de 8.192 tokens nuevos. Los prompts (`kd-prompts-1234.jsonl`) son problemas de matematicas, codigo y ciencia procedentes de NuminaMath-CoT, code_contests y ARC; un filtro de contaminacion elimino 8 filas solapadas con conjuntos de evaluacion, dejando 1.226. La construccion final uso 597 muestras de 4.096 tokens con semilla 0. El autor advierte que el campo `general.file_type` del fichero indica 15 (Q4_K_M), una etiqueta heredada de la plantilla de construccion que no refleja la mezcla real; llama.cpp carga cada tensor por su tipo almacenado, por lo que la etiqueta no afecta a la ejecucion.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Razonamiento en modo thinking: la evaluacion se realizo con thinking mode activado y pass@1 promediado sobre 1-8 semillas.
- Razonamiento matematico: evaluado en AIME 2025 y HMMT Feb 2026, con calibracion basada en problemas de NuminaMath-CoT.
- Generacion de codigo: evaluado en LiveCodeBench, con calibracion que incluye problemas de code_contests.
- Razonamiento cientifico de nivel avanzado: evaluado en GPQA-Diamond.
- Seguimiento de instrucciones: evaluado en IFBench.
- Conocimiento general y razonamiento multidisciplinar: evaluado en MMLU-Pro.
- Prediccion multi-token: el bloque correspondiente se conserva en la cuantizacion.
- Soporte de tool calling, function calling y comportamiento agentico multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible en la informacion proporcionada (el pipeline declarado es solo texto).

## Casos de uso

- Razonamiento matematico asistido en local: con un rendimiento de 89,6 en AIME 2025 en modo thinking, el modelo sirve para resolver problemas de competicion y verificar demostraciones paso a paso en entornos sin acceso a API, usando `llama-server` como backend.
- Generacion y revision de codigo en estaciones de trabajo: los 84,4 puntos en LiveCodeBench y la calibracion con problemas de code_contests lo hacen adecuado para autocompletado, refactorizacion y explicacion de codigo en un flujo con llama.cpp, sin depender de servicios externos.
- Analisis de literatura cientifica y preguntas de nivel experto: los 82,1 en GPQA-Diamond permiten usarlo como asistente de estudio o triaje de preguntas tecnicas de fisica, quimica y biologia en un entorno controlado.
- Evaluacion de calidad de cuantizaciones: al publicarse la receta, los datos de calibracion y los hashes, sirve como referencia reproducible para comparar metodos de cuantizacion (QDA frente a UD-Q6_K de unsloth) con el mismo muestreo y las mismas semillas.
- Despliegue en hardware de una sola GPU: con 22,0 GB de pesos, cabe en GPUs de 24 GB de VRAM y permite servir un modelo de 27B con razonamiento avanzado en una unica maquina, util para prototipos y demos internas.
- Procesamiento por lotes de problemas de instrucciones estrictas: los 68,8 en IFBench lo hacen util para tareas donde el formato de salida y las restricciones del prompt deben respetarse, como extraccion estructurada o generacion de informes con plantilla fija.
- Base para ajuste fino o destilacion: el formato GGUF no es el adecuado para entrenamiento, pero el modelo base bf16 referenciado permite partir de el para adaptaciones posteriores.

## Benchmarks y rendimiento

Resultados publicados por el autor, en modo thinking, pass@1 promediado sobre 1-8 semillas, ejecutados en llama.cpp con el mismo muestreo, limites de tokens y semillas para ambos ficheros:

| Benchmark | QDA (esta cuantizacion) | unsloth UD-Q6_K |
|---|---|---|
| AIME 2025 | 89,6 | 85,4 |
| HMMT Feb 2026 | 73,9 | 71,6 |
| GPQA-Diamond | 82,1 | 81,1 |
| IFBench | 68,8 | 66,9 |
| MMLU-Pro | 83,4 | 83,4 |
| LiveCodeBench | 84,4 | 84,8 |
| Media | 80,3 | 78,9 |

El autor indica que las diferencias frente a la cuantizacion de referencia estan dentro del ruido entre ejecuciones en todos los benchmarks. No se publican resultados del modelo base en bf16 ni comparaciones con otras cuantizaciones distintas de UD-Q6_K.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero pesa 22,0 GB; se necesita al menos esa cantidad de VRAM para cargar todos los tensores en GPU, mas el espacio para el contexto KV. Con contexto largo, la VRAM total puede superar los 24 GB.
- GPU recomendadas: A100 (40/80 GB) y H100 para servicio con contexto amplio y concurrencia; RTX 4090 (24 GB) para uso individual si se limita el contexto o se descargan capas a CPU.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) con margen ajustado; en GPUs de 16 GB o menos es necesario usar offload parcial a CPU (por ejemplo, con `-ngl` en llama.cpp), con la consiguiente perdida de velocidad.
- Opciones de despliegue: llama.cpp, tanto con `llama-server -hf qda-lab/QDA-Qwen3.8-27B-Q6-GGUF` como con el binario compilado en el commit `9e2a04a439edc49f08c5acdafefae19dfa25a658` indicado en la receta. El autor solo documenta llama.cpp; no se mencionan vLLM, TGI, Ollama ni otros runtimes en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| QDA-Qwen3.8-27B-Q6-GGUF | 27,3 B | No disponible | GGUF (mezcla Q6_K/Q5_K/Q8_0/Q4_K) | Apache-2.0 | Media 80,3 en 6 benchmarks (autor) |
| unsloth UD-Q6_K de Qwen3.8-27B | 27,3 B | No disponible | GGUF (Q6_K dinamico) | Apache-2.0 (heredada del base) | Media 78,9 en los mismos 6 benchmarks |
| Qwen/Qwen3.8-27B (bf16) | 27,3 B | No disponible | safetensors | Apache-2.0 | No disponible en la informacion proporcionada |

La comparacion se limita a las dos cuantizaciones GGUF evaluadas por el autor y al modelo base referenciado. No se dispone de datos para comparar con modelos de otros desarrolladores del mismo tamano o categoria.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion proporcionada; al ser una cuantizacion del modelo Qwen, hereda los sesgos del modelo base, no evaluados aqui.
- Riesgo de alucinacion: no cuantificado en la model card; los benchmarks publicados miden exactitud en tareas cerradas, no verificacion factual en preguntas abiertas.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se detallan; el autor solo declara el pipeline de texto y no especifica cobertura multilingue.
- Etiqueta de cuantizacion incorrecta: el campo `general.file_type` del GGUF indica Q4_K_M aunque la mezcla real es mayoritariamente Q6_K. Herramientas que lean ese campo para mostrar el tipo de cuantizacion informaran de un valor erroneo; llama.cpp no se ve afectado.
- Diferencias dentro del ruido: el autor reconoce que las ventajas frente a UD-Q6_K estan dentro de la variabilidad entre ejecuciones, por lo que no deben interpretarse como una superioridad consistente.
- Datos de calibracion con licencias propias: los prompts proceden de NuminaMath-CoT (Apache-2.0), code_contests (CC BY 4.0) y ARC (CC BY-SA 4.0); su reutilizacion esta sujeta a esas licencias, independientemente de la Apache-2.0 del modelo.
- Licencia para uso comercial: Apache-2.0 permite uso comercial, pero conviene revisar los terminos del modelo base Qwen/Qwen3.8-27B, ya que esta ficha no los recoge.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, creado el 2026-11-15; no hay evidencia de uso en produccion ni validacion independiente de los resultados.
- Reproducibilidad: requiere la libreria QDA version 0.1.1 y un commit concreto de llama.cpp; cambios posteriores en el cuantizador pueden alterar el resultado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/qda-lab/QDA-Qwen3.8-27B-Q6-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de pools de calibracion: https://huggingface.co/datasets/qda-lab/qda-calibration-pools
- Receta e inputs de construccion: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs/tree/main/QDA-Qwen3.8-27B-Q6-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
