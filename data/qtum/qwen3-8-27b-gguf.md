# qtum/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B es un modelo de lenguaje multimodal (visión-lenguaje) de 27 000 millones de parámetros desarrollado por el equipo Qwen de Alibaba. Este repositorio contiene las cuantizaciones GGUF realizadas por el usuario qtum con llama.cpp, lo que permite ejecutar el modelo en hardware de consumo con distintos niveles de precisión y uso de memoria. El modelo acepta texto, imagen y vídeo como entrada y genera texto como salida, con una ventana de contexto nativa de 262 144 tokens, ampliable mediante YaRN.

La arquitectura es híbrida: combina 16 capas de atención completa con consultas agrupadas (GQA) y 48 capas de atención lineal Gated DeltaNet, lo que reduce drásticamente el coste de la caché KV frente a un transformer denso equivalente. Esta característica, junto con las cuantizaciones publicadas (desde Q8_0 hasta IQ2_XXS), hace que el modelo sea viable en GPUs de consumo para tareas multimodales de contexto largo. El repositorio incluye además un proyector de visión separado (mmproj) y una cabeza MTP para decodificación especulativa.

La relevancia actual radica en que ofrece capacidades multimodales de alto nivel (imagen, vídeo y texto) con un coste de inferencia contenido gracias a la atención lineal y a las cuantizaciones optimizadas con imatrix. Es una opción práctica para desarrolladores que necesitan desplegar un asistente visual en local o en entornos con recursos limitados, manteniendo una licencia Apache 2.0 que permite uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 16 capas GQA full attention + 48 capas Gated DeltaNet linear attention (64 capas decoder) |
| Parametros totales | 26 895 998 464 (backbone); 27 800 millones incluyendo vision tower |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativo, extensible con YaRN |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_1, Q4_K_M, IQ4_NL, Q4_K_S, Q4_0, IQ4_XS, Q3_K_M, IQ3_M, Q3_K_S, IQ3_XXS, Q2_K, IQ2_M, IQ2_XS, IQ2_XXS |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (backbone, mmproj para visión, mtp para decodificación especulativa) |

## Arquitectura y entrenamiento

El modelo utiliza una pila de 64 capas decoder con un patrón híbrido: cada cuarta capa (16 en total) emplea atención completa con consultas agrupadas (GQA), mientras que las 48 restantes usan atención lineal Gated DeltaNet. Esta combinación reduce el coste de la caché KV: solo las 16 capas de atención completa mantienen una caché que crece con el contexto, mientras que las capas lineales mantienen un estado recurrente de tamaño fijo. El vocabulario es de 248 320 tokens con embeddings no atados (untied), lo que influye en el tamaño de los archivos de pesos.

El repositorio no proporciona información sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO). Los datos disponibles se limitan a la arquitectura y a las cuantizaciones. Las cuantizaciones se calibraron con imatrix (n_ctx=512, mezcla de código, inglés y chino), y se aplicó protección especial a ciertos tensores: los parámetros de estado de la atención lineal (ssm_alpha, ssm_beta) se mantienen en F32, las proyecciones de atención de las capas full attention en Q8_0, y los embeddings de entrada/salida en Q6_K (o Q4_K por debajo de 4 bits). El archivo imatrix.gguf se publica para auditar la calibración.

## Capacidades

- Generación de texto y razonamiento: modelo de lenguaje denso de 27B con capacidad de razonamiento complejo, aunque no se especifican modos de pensamiento explícitos.
- Entrada multimodal: acepta imágenes y vídeo además de texto, gracias al proyector de visión (mmproj) que se carga como archivo separado en llama.cpp.
- Salida de texto: genera respuestas en inglés y chino.
- Contexto largo: 262 144 tokens nativos, ampliables con YaRN, adecuado para documentos extensos o conversaciones multi-turno.
- Decodificación especulativa: incluye una cabeza MTP (multi-token prediction) que puede usarse como borrador para acelerar la generación.
- Cuantizaciones flexibles: 18 niveles de cuantización que permiten ajustar el equilibrio entre tamaño, velocidad y calidad.
- Sin soporte explícito de tool calling o function calling en la información proporcionada.

## Casos de uso

- Análisis de documentos visuales: el modelo puede procesar imágenes y extraer información textual o responder preguntas sobre diagramas, capturas de pantalla o fotografías, gracias a su entrada multimodal y a su contexto de 262k tokens.
- Asistente de atención al cliente multilingüe: con soporte para inglés y chino, puede gestionar conversaciones largas con historial extenso sin agotar la ventana de contexto, manteniendo un coste de caché KV reducido.
- Generación de código con contexto de repositorio: su ventana de 262k tokens permite incluir archivos completos de un proyecto y generar o modificar código con coherencia, aunque no se confirma soporte de tool calling.
- Transcripción y resumen de vídeo: al aceptar entrada de vídeo, puede resumir contenido audiovisual o extraer información relevante, útil para archivado o búsqueda interna.
- Despliegue en edge con GPU de consumo: las cuantizaciones Q4_K_M o IQ4_XS (≈16 GiB) permiten ejecutar el modelo en una RTX 4090 o similar, con la ventaja de que la caché KV ocupa solo ~2 GiB para 32k de contexto.
- Investigación en eficiencia de atención: la arquitectura híbrida Gated DeltaNet es un caso de estudio práctico para evaluar el rendimiento de atención lineal frente a atención completa en tareas multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye valores de perplejidad (PPL) sobre el conjunto de calibración imatrix, que se muestran en la tabla de cuantizaciones. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar.

## Requisitos de hardware

- VRAM estimada: el tamaño del archivo GGUF más el proyector de visión (≈0.9 GiB) más la caché KV. Para 32k de contexto, la caché KV ocupa aproximadamente 2 GiB. Ejemplos: Q4_K_M (16.53 GiB) + 0.9 + 2 ≈ 19.4 GiB; Q8_0 (26.12 GiB) + 0.9 + 2 ≈ 29 GiB.
- GPU recomendadas: para cuantizaciones de 4 bits (Q4_K_M, IQ4_XS) cabe en una RTX 4090 (24 GB) o RTX 3090 (24 GB). Para Q8_0 se necesita una GPU con 32 GB o más, como A100 40GB o RTX A6000. Las cuantizaciones de 3 bits o inferiores (IQ3_M, Q2_K) pueden caber en GPUs de 16 GB (RTX 4080, RTX 3080 Ti).
- Opciones de despliegue: llama.cpp (compatible con GGUF y mmproj), vLLM (si soporta GGUF y arquitecturas híbridas), Ollama (si se importa el GGUF), TGI (con adaptación). El repositorio está diseñado para llama.cpp, que reconoce los prefijos mmproj- y mtp-.
- Latencia y throughput: no se proporcionan datos medidos. La atención lineal reduce el coste de la caché KV, lo que debería mejorar la velocidad en contextos largos frente a un modelo denso equivalente, pero no hay cifras concretas.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. El repositorio es una cuantización del modelo base Qwen/Qwen3.8-27B, por lo que la comparativa natural sería contra otras cuantizaciones del mismo modelo (ya cubiertas en la tabla de especificaciones). Para comparar con alternativas de la misma categoría (modelos multimodales de ~27B), se necesitarían datos de benchmarks que no están disponibles en esta fuente.

## Limitaciones y advertencias

- Idiomas limitados: solo inglés y chino. No hay soporte declarado para español u otros idiomas, lo que restringe su uso en entornos multilingües amplios.
- Riesgo de alucinación: como todo modelo generativo, puede producir contenido factualmente incorrecto, especialmente en tareas de razonamiento o con entradas ambiguas.
- Sesgos: no se documentan sesgos específicos, pero al estar entrenado principalmente con datos en inglés y chino, puede reflejar sesgos culturales o lingüísticos de esos dominios.
- Dependencia del proyector de visión: sin el archivo mmproj, el modelo funciona solo en modo texto; es necesario descargar ambos archivos para usar capacidades multimodales.
- Calidad de cuantización: los niveles por debajo de 4 bits (Q3, Q2, IQ2) muestran un aumento notable de perplejidad (hasta 8.56 en IQ2_XXS frente a 6.79 en Q8_0), lo que puede degradar la calidad en tareas complejas.
- Compatibilidad de runtime: las cuantizaciones IQ (IQ4_NL, IQ3_M, etc.) requieren soporte específico en el runtime; no todos los backends las aceptan.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base puede tener condiciones adicionales no reflejadas en este repositorio; se recomienda revisar la licencia del modelo original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/qtum/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- README en chino: https://huggingface.co/qtum/Qwen3.8-27B-GGUF/blob/main/README_zh.md
