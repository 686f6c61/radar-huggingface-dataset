# ngquocvinh/NeoHorse-1-9B-GGUF

## Resumen

NeoHorse-1-9B-GGUF es un paquete de cuantizaciones en formato GGUF publicado por el usuario ngquocvinh sobre el modelo TokenRhythm/NeoHorse-1-9B, un modelo de lenguaje causal de aproximadamente 8.950 millones de parámetros (8.953.803.264 según los pesos safetensors del modelo base). El modelo original es un post-entrenamiento derivado de Qwen3.5-9B, orientado a harnesses de agentes basados en texto, uso de herramientas, generación de código, razonamiento y seguimiento de instrucciones. Se trata, por tanto, de una release de conversión y cuantización: no se ha realizado entrenamiento ni fine-tuning en este repositorio.

La relevancia de esta publicación es práctica: el repositorio incluye nueve cuantizaciones (desde Q8_0 hasta Q1_0) generadas directamente desde un GGUF BF16 con una imatrix específica del modelo, junto con mediciones de fidelidad reproducibles (KLD, acuerdo Top-1, delta de perplejidad) frente a la referencia BF16. Esto permite a un desarrollador elegir el punto de compromiso entre tamaño en disco, VRAM necesaria y degradación de comportamiento con datos medidos, en lugar de estimaciones genéricas.

El modelo declara un contexto nativo de 262.144 tokens, extensible hasta 1.010.000 según la model card del repositorio upstream, y una media de 69,04 en un conjunto de diez benchmarks frente a 65,60 de Qwen3.5-9B bajo el protocolo de evaluación SGLang del autor original. Estas cifras corresponden al modelo upstream, no a estos archivos GGUF. El paquete es solo de texto: no incluye pesos de visión. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (derivado de Qwen3.5-9B); el config conserva un campo de recuento de capas MTP, pero el checkpoint no contiene tensores MTP |
| Parametros totales | 8.953.803.264 (aproximadamente 9B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens segun la model card upstream |
| Tipos de cuantizacion | BF16 (referencia), Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K, IQ2_XS, IQ1_M, Q1_0 |
| Idiomas soportados | no disponible (la model card no enumera idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors BF16 |
| Tamano del repositorio | 45,6 GB |
| Plantilla de chat | chat_template.jinja, heredada del checkpoint upstream solo texto |
| Calibracion | imatrix especifica del modelo incluida en calibration/ |
| Descargas / likes | 0 descargas, 4 likes |
| Fecha de creacion | 13 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer causal denso de aproximadamente 9B de parámetros, post-entrenado a partir de Qwen3.5-9B para su uso en entornos de agentes basados en texto. La model card upstream describe un contexto nativo de 262.144 tokens con extensibilidad hasta 1.010.000, y publica una media de 69,04 en diez benchmarks frente a 65,60 de Qwen3.5-9B bajo el protocolo SGLang del autor. El checkpoint upstream empleado como fuente es la revisión `ba5b6e40d88a6ddf4591e176738254a3bc715765`.

En este repositorio no hay entrenamiento ni ajuste alguno: es una release exclusivamente de cuantización. El GGUF BF16 se convirtió directamente desde los safetensors BF16 upstream con `--no-nextn`, porque el checkpoint solo texto no contiene tensores MTP pese a que su configuración conserva un campo de recuento de capas MTP. Cada archivo publicado se cuantizó directamente desde ese GGUF BF16 usando la imatrix específica del modelo incluida en `calibration/`, sin recuantizar desde otro archivo ya cuantizado. Todos los archivos pasaron pruebas de carga y generación corta en inglés; el BF16 superó además `--check-tensors`.

La validación de fidelidad se realizó sobre los dos primeros fragmentos de `wiki.valid.raw`, con 2.048 tokens por fragmento, usando la build CUDA de llama.cpp sobre una NVIDIA A10M. La perplejidad media de la referencia BF16 fue 5,641047. Los registros de conversión, calibración, cuantización y benchmark se conservan en local y no forman parte del paquete público; sí se incluyen `SHA256SUMS.txt` y los resúmenes en `reproducibility/`.

## Capacidades

- Generación de texto conversacional e instrucciones de un solo turno y multi-turno, con plantilla de chat Jinja propia.
- Razonamiento multi-paso y modo de razonamiento conmutable: el ejemplo de la model card usa `--reasoning off`, lo que indica que el modo de pensamiento puede activarse o desactivarse en tiempo de inferencia.
- Uso de herramientas y function calling, orientado explícitamente a harnesses de agentes basados en texto.
- Generación y asistencia de código, etiquetada por el autor como capacidad de coding.
- Razonamiento matemático y lógico, dentro del bloque de capacidades de reasoning declaradas.
- Flujos agénticos: la etiqueta `agentic` y el enfoque en tool-use sugieren soporte para cadenas de acciones con llamadas a herramientas.
- Contexto largo: hasta 262.144 tokens nativos, lo que habilita el procesamiento de documentos extensos y conversaciones de muchas vueltas.
- Capacidad multimodal: no disponible en este paquete; solo se distribuyen pesos de texto y se indica expresamente que los pesos de visión no están incluidos.
- Cobertura multilingüe: no disponible, la model card no enumera idiomas soportados.

## Casos de uso

- Agentes de automatización de tareas con herramientas: el modelo está post-entrenado para tool-use y puede encadenar llamadas a APIs, lectura de ficheros y ejecución de comandos dentro de un harness agéntico, con la ventana de 262.144 tokens como memoria de trabajo de la sesión.
- Asistente de código integrado en el IDE: la etiqueta de coding y el soporte de instrucciones permiten autocompletado, refactorización y explicación de fragmentos; al ser un GGUF de 9B puede ejecutarse en local, evitando enviar código propietario a servicios externos.
- Análisis de documentos largos: informes, contratos o expedientes que superen las 100.000 palabras caben en el contexto nativo sin técnicas de recuperación, lo que simplifica la arquitectura de la aplicación.
- Atención al cliente multi-turno: conversaciones largas con historial completo en contexto, con la cuantización Q5_K_M o Q6_K como opción cuando la fidelidad conversacional importa más que el ahorro de memoria.
- Procesamiento por lotes en servidor con llama-server: al ser GGUF, se puede desplegar detrás de una API compatible con OpenAI y escalar horizontalmente sin depender de GPUs de gama alta, usando Q4_K_M como punto de partida recomendado por el propio autor.
- Evaluación y ajuste de pipelines RAG: la versión Q8_0 conserva el 98,436% de acuerdo Top-1 con BF16, lo que la hace adecuada como referencia de bajo coste para comparar variantes de recuperación antes de pasar a producción.
- Prototipado en portátil o estación de trabajo sin GPU dedicada: las cuantizaciones Q3_K_M e inferiores permiten ejecutar el modelo en CPU con llama.cpp, aceptando la degradación documentada.
- Generación de documentación técnica y resúmenes estructurados a partir de repositorios o bases de conocimiento, apoyándose en la ventana de contexto larga para no fragmentar la entrada.

## Benchmarks y rendimiento

La model card del repositorio GGUF no publica resultados de benchmarks de tareas para estos archivos. Cita cifras del modelo upstream, medidas bajo el protocolo SGLang del autor original: media de 69,04 en diez benchmarks para NeoHorse-1-9B frente a 65,60 para Qwen3.5-9B. El desglose por benchmark no está disponible en la información proporcionada.

Lo que sí se publica son mediciones de fidelidad de la cuantización frente a la referencia BF16, sobre los dos primeros fragmentos de `wiki.valid.raw` (2.048 tokens por fragmento) con llama.cpp CUDA en una NVIDIA A10M. La perplejidad media del BF16 de referencia fue 5,641047:

| Archivo | KLD medio (menor mejor) | Top-1 vs BF16 (mayor mejor) | Delta PPL | RMS delta p |
|---|---:|---:|---:|---:|
| NeoHorse-1-9B-Q8_0.gguf | 0,006655 | 98,436% | +0,732% | 0,811% |
| NeoHorse-1-9B-Q6_K.gguf | 0,009702 | 97,312% | +1,120% | 1,408% |
| NeoHorse-1-9B-Q5_K_M.gguf | 0,030926 | 94,673% | +2,158% | 5,841% |
| NeoHorse-1-9B-Q4_K_M.gguf | 0,029467 | 94,428% | +0,951% | 4,429% |
| NeoHorse-1-9B-Q3_K_M.gguf | 0,069233 | 88,368% | +4,573% | 7,326% |
| NeoHorse-1-9B-Q2_K.gguf | 0,199997 | 82,063% | +14,167% | 12,510% |
| NeoHorse-1-9B-IQ2_XS.gguf | 0,342380 | 77,761% | +30,698% | 18,365% |
| NeoHorse-1-9B-IQ1_M.gguf | 0,807561 | 64,565% | +96,977% | 28,701% |
| NeoHorse-1-9B-Q1_0.gguf | 15,570850 | 2,933% | +596289635,160% | 63,365% |

El propio autor advierte que estas son mediciones de fidelidad de siguiente token, no benchmarks de tareas, y que el comportamiento en razonamiento, código y tool-use puede variar según la carga de trabajo. Los resultados legibles por máquina están en `reproducibility/quality-summary.tsv` y los detalles de evaluación en `reproducibility/manifest.md`.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del recuento de parámetros (8.953.803.264) y de los bits por peso típicos de cada tipo de cuantización. No incluyen la caché KV ni los buffers de runtime, y la información disponible no detalla el número de capas, cabezas ni dimensión de cabeza, por lo que el coste exacto de la caché KV a contexto largo no está disponible.

| Cuantizacion | Peso aproximado de los pesos | Encaje en GPU de consumo |
|---|---:|---|
| BF16 | ~17,9 GB | No en GPUs de 24 GB con contexto largo |
| Q8_0 | ~9,5 GB | Sí, RTX 4090 24 GB, RTX 3090 24 GB |
| Q6_K | ~7,4 GB | Sí, RTX 4080 16 GB, RTX 4090 24 GB |
| Q5_K_M | ~6,4 GB | Sí, RTX 4070 Ti 12 GB, RTX 3060 12 GB |
| Q4_K_M | ~5,4 GB | Sí, RTX 3060 12 GB, RTX 4060 Ti 8 GB con contexto moderado |
| Q3_K_M | ~4,4 GB | Sí, GPUs de 8 GB e inferiores |
| Q2_K | ~2,9 GB | Sí, GPUs de 6-8 GB y CPU |
| IQ2_XS | ~2,6 GB | Sí, CPU o GPU de gama baja, con degradación notable |
| IQ1_M | ~2,0 GB | CPU o GPU muy limitada, con degradación severa |
| Q1_0 | ~1,3 GB | Desaconsejado: fidelidad prácticamente nula |

- GPU recomendadas para produccion: A100 40/80 GB o H100 para servir varias instancias o contexto muy largo; L40S y A10G para despliegues de una sola instancia con Q5_K_M o Q6_K.
- GPU de consumo: RTX 4090 y RTX 3090 (24 GB) cubren Q8_0; RTX 4080 y 4070 Ti (16 GB) cubren Q6_K; RTX 3060 12 GB cubre Q5_K_M y Q4_K_M; tarjetas de 8 GB cubren Q3_K_M y Q2_K.
- Contexto largo: con 262.144 tokens nativos, la caché KV puede superar con holgura el tamaño de los pesos en GPUs de 24 GB. Para producir con contexto muy extenso hay que reservar VRAM adicional o recurrir a offload de capas a CPU.
- Despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama mediante Modelfile apuntando al GGUF, LM Studio, koboldcpp y `llama-cpp-python`. vLLM ofrece soporte parcial de GGUF y no cubre todos los tipos de cuantización k-quant e IQ; TGI no soporta GGUF de forma nativa. Para estos archivos, llama.cpp es la vía de referencia.
- Latencia y throughput: no disponible. El repositorio menciona un `reproducibility/runtime-summary.tsv` con lecturas de runtime, pero no se incluyen sus valores en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| ngquocvinh/NeoHorse-1-9B-GGUF | 8,95B denso | 262.144 tokens (hasta 1.010.000) | Sin benchmarks de tareas publicados; fidelidad medida frente a BF16 (Q8_0: 98,436% Top-1) | Apache 2.0 | GGUF, 9 cuantizaciones, llama.cpp |
| TokenRhythm/NeoHorse-1-9B | 8,95B denso | 262.144 tokens (hasta 1.010.000) | 69,04 de media en diez benchmarks (protocolo SGLang del autor) | Apache 2.0 | Safetensors BF16; es el modelo base de esta release |
| Qwen3.5-9B | aproximadamente 9B denso | no disponible | 65,60 de media en los mismos diez benchmarks segun la model card upstream | no disponible en la información proporcionada | Safetensors, referencia upstream del post-entrenamiento |

No se dispone de datos de benchmark medidos sobre los archivos GGUF concretos ni de comparativas con otras alternativas de 8-9B en la información proporcionada, por lo que la comparación se limita a los tres elementos anteriores.

## Limitaciones y advertencias

- Este repositorio es una cuantización comunitaria, no una release oficial de TokenRhythm ni un respaldo del autor original del modelo.
- Las mediciones publicadas son de fidelidad de siguiente token (KLD, Top-1, delta PPL, RMS delta p) sobre dos fragmentos de Wikipedia en inglés. No son benchmarks de tareas y no garantizan un comportamiento equivalente en razonamiento, código o tool-use.
- La degradación en cuantizaciones bajas es severa y está documentada: IQ2_XS presenta un aumento de perplejidad del 30,698% y un acuerdo Top-1 del 77,761%; IQ1_M del 96,977% y 64,565%; Q1_0 es inutilizable en la práctica (KLD 15,570850 y solo 2,933% de acuerdo Top-1). No se recomienda usar Q1_0 ni IQ1_M en producción.
- La calibración de la imatrix se realizó sobre `wiki.valid.raw`, corpus en inglés. Es razonable esperar menor fidelidad en otros idiomas y dominios, aunque no hay mediciones que lo cuantifiquen.
- Idiomas soportados: no disponible. La model card no enumera idiomas y los ejemplos de uso están en inglés.
- Los pesos de visión no están incluidos: cualquier capacidad multimodal del modelo upstream queda fuera de este paquete.
- La configuración del checkpoint conserva un campo de recuento de capas MTP aunque no haya tensores MTP, lo que puede inducir a error al inspeccionar el config.
- Riesgo de alucinación: inherente a los modelos de ~9B de esta categoría. No hay evaluación publicada de tasas de alucinación en la información disponible.
- Sesgos: no disponible. No se documenta ningún análisis de sesgo en la model card.
- La licencia Apache 2.0 permite uso comercial, pero el repositorio retiene la licencia upstream; conviene revisar los términos del modelo base antes de un despliegue productivo.
- Adopción muy baja: 0 descargas y 4 likes en el momento de la consulta. No existe validación externa independiente de estos archivos más allá de las pruebas del propio autor.
- Los registros crudos de conversión, calibración, cuantización y benchmark no forman parte del paquete público, por lo que la reproducibilidad completa depende de reejecutar el pipeline descrito en `reproducibility/manifest.md`.
- El uso de contexto muy largo con 262.144 tokens o más exige VRAM adicional considerable para la caché KV, que no está cuantificada en la documentación disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ngquocvinh/NeoHorse-1-9B-GGUF
- Modelo base: https://huggingface.co/TokenRhythm/NeoHorse-1-9B
- Revisión upstream usada como fuente: https://huggingface.co/TokenRhythm/NeoHorse-1-9B/tree/ba5b6e40d88a6ddf4591e176738254a3bc715765
- Imagen de resultados de evaluación upstream: figura `9B_head_fig.jpg` dentro del repositorio upstream
- Resultados legibles por máquina: `reproducibility/quality-summary.tsv` en el repositorio
- Detalles de evaluación: `reproducibility/manifest.md` en el repositorio
- Lecturas de runtime: `reproducibility/runtime-summary.tsv` en el repositorio
- Verificación de artefactos: `SHA256SUMS.txt` en el repositorio
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Página de apoyo del cuantizador: https://ko-fi.com/ngquocvinh
- Búsqueda web: no se ha encontrado ningún resultado relevante sobre este modelo. Las únicas coincidencias devueltas corresponden a la web de un minorista de moda y no guardan relación con el modelo.
