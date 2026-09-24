# mradermacher/Qwen3-VL-4B-Instruct-heretic-Semantic-Same-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF estáticas del modelo VINAY-UMRETHE/Qwen3-VL-4B-Instruct-heretic-Semantic-Same, publicadas por mradermacher. Se trata de un modelo multimodal de visión y lenguaje (VL) derivado de la familia Qwen3-VL-4B-Instruct, con 4.022.468.096 parámetros (4,02 B), que ha sido modificado mediante técnicas de "abliteration" o "decensoring" (etiquetas heretic, uncensored, decensored, abliterated) para eliminar los mecanismos de rechazo de respuestas del modelo instruct original. El resultado es un modelo conversacional en inglés con capacidad de procesar imágenes, pensado para despliegue local.

La relevancia de esta ficha radica en que el repositorio empaqueta el modelo en múltiples niveles de cuantización (desde Q2_K de 1,8 GB hasta f16 de 8,2 GB), más dos ficheros de proyección multimodal (mmproj) necesarios para la entrada de visión. Esto permite ejecutar un modelo VL de 4 B en hardware de consumo, algo imposible con los pesos originales en safetensors, y ofrece alternativas con distintos compromisos de calidad, tamaño y velocidad.

El modelo se distribuye bajo licencia Apache 2.0 y declara únicamente el idioma inglés. Cabe señalar que no hay benchmarks publicados, el repositorio no registra descargas ni valoraciones en el momento de la consulta, y la model card original no documenta detalles de entrenamiento, contexto o composición del dataset.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje); detalles concretos de la arquitectura del modelo base no disponibles |
| Parámetros totales | 4.022.468.096 (4,02 B), según safetensors del modelo base |
| Parámetros activos | No aplica; no hay indicios de que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 y f16 (estáticas); existe una variante i1-GGUF con cuantización ponderada/imatrix |
| Idiomas soportados | en (inglés), según la model card |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (incluye proyector multimodal mmproj en Q8_0 y f16) |
| Proyector multimodal | mmproj-Q8_0 (0,6 GB) y mmproj-f16 (0,9 GB) |
| Cuantizador | mradermacher (quantize_version 2, output_tensor_quantised 1, convert_type hf) |
| Modelo base | VINAY-UMRETHE/Qwen3-VL-4B-Instruct-heretic-Semantic-Same |
| Tamaño total del repositorio | 37,7 GB (incluye todas las variantes) |
| Pipeline declarado | conversational |

## Arquitectura y entrenamiento

La información disponible no documenta la arquitectura interna ni el proceso de entrenamiento. Por la denominación del modelo base (Qwen3-VL-4B-Instruct) se deduce que se trata de un transformer multimodal de la familia Qwen3-VL, con un codificador visual y un proyector que adapta las representaciones de imagen al espacio del modelo de lenguaje; la presencia de los ficheros mmproj en el repositorio GGUF confirma que la ruta de visión es parte del modelo empaquetado. No obstante, el número de tokens de entrenamiento, la composición del dataset y el uso de RLHF o DPO no están disponibles en la información proporcionada.

La modificación respecto al modelo instruct original consiste en una intervención sobre los pesos conocida como abliteration, orientada a suprimir direcciones de activación asociadas al rechazo de peticiones. Las etiquetas heretic, decensored, uncensored, abliterated y reproducible indican este tipo de intervención sin reentrenamiento supervisado adicional documentado. No se especifica el procedimiento exacto (por ejemplo, el conjunto de prompts utilizado para calcular las direcciones de rechazo) ni si se aplicó algún ajuste posterior; la model card del cuantizador se limita a indicar la procedencia y los parámetros de conversión a GGUF.

## Capacidades

- Generación de texto conversacional en inglés, con formato de instrucciones (instruct).
- Procesamiento de imágenes (visión-lenguaje): el repositorio incluye el proyector multimodal mmproj, imprescindible para habilitar la entrada visual en llama.cpp y derivados.
- Interacción multimodal imagen-texto: descripción de imágenes, respuesta a preguntas sobre contenido visual y tareas derivadas de caption.
- Respuestas con menor tasa de rechazo gracias a la modificación abliterated/decensored, lo que amplía el rango de peticiones que el modelo atiende.
- Ejecución en CPU y GPU mediante el ecosistema GGUF, con múltiples niveles de cuantización para ajustar el uso de memoria.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes o razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking o razonamiento extendido: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Extracción de información de documentos escaneados: el modelo puede recibir una imagen de factura, formulario o contrato y devolver campos estructurados en texto, aprovechando su naturaleza visión-lenguaje y su reducido tamaño para desplegarse en servidores modestos.
- Catalogación automática de imágenes: generación de descripciones y etiquetas para bibliotecas de fotos, catálogos de producto o archivos multimedia, ejecutable en local sin enviar datos a servicios externos.
- Asistente conversacional sin filtros editoriales: útil en investigación sobre alineación, generación creativa o escritura de ficción donde las salvaguardas del modelo original bloquean respuestas legítimas.
- Investigación en seguridad y alineación: comparar el comportamiento del modelo abliterated frente al instruct original permite estudiar cómo se distribuyen las direcciones de rechazo y qué capacidades se ven afectadas por la intervención.
- Asistencia sobre capturas de pantalla: análisis de interfaces, revisión de errores en pantalla o extracción de texto de capturas dentro de flujos de soporte técnico.
- Generación de datos sintéticos multimodales: producción de pares imagen-texto para aumentar datasets de entrenamiento, ejecutable en local con cuantizaciones Q4 o Q5.
- Despliegue en portátiles y equipos de gama media: las variantes Q4_K_M (2,6 GB) o Q4_K_S (2,5 GB) más el mmproj permiten inferencia multimodal en GPU de 6-8 GB de VRAM o incluso en CPU.
- Procesamiento por lotes con requisitos de privacidad: al ser un modelo local, se puede procesar documentación sensible sin salida de datos a la nube, siempre que se asuman las limitaciones de calidad de la cuantización elegida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del cuantizador no incluye métricas de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluación, y tampoco se aportan comparaciones numéricas con el modelo base o con el instruct original.

## Requisitos de hardware

Tamaños de fichero publicados en el repositorio (los pesos se suman al mmproj si se requiere visión):

| Cuantización | Tamaño (GB) | Notas del autor |
|---|---|---|
| Q2_K | 1,8 | — |
| Q3_K_S | 2,0 | — |
| Q3_K_M | 2,2 | Calidad inferior |
| Q3_K_L | 2,3 | — |
| IQ4_XS | 2,4 | — |
| Q4_K_S | 2,5 | Rápida, recomendada |
| Q4_K_M | 2,6 | Rápida, recomendada |
| Q5_K_S | 2,9 | — |
| Q5_K_M | 3,0 | — |
| Q6_K | 3,4 | Muy buena calidad |
| Q8_0 | 4,4 | Rápida, mejor calidad |
| f16 | 8,2 | 16 bpw, excesiva |
| mmproj-Q8_0 | 0,6 | Suplemento multimodal |
| mmproj-f16 | 0,9 | Suplemento multimodal |

- VRAM estimada para inferencia completa en GPU: aproximadamente 3-4 GB con Q4_K_M más mmproj y caché KV reducida; en torno a 6-7 GB con Q8_0 más mmproj-f16; alrededor de 11-12 GB con f16 más mmproj-f16. Son estimaciones a partir de los tamaños de fichero; no hay cifras oficiales.
- GPU consumer compatibles: cualquier tarjeta con 6 GB o más de VRAM (RTX 3060, RTX 4060, RTX 2060) puede ejecutar las cuantizaciones Q4 y Q5 con visión; una RTX 4090 (24 GB) permite f16 con contexto amplio.
- GPU de centro de datos: A100, H100 o L40S pueden alojar varias instancias concurrentes del modelo cuantizado en una sola tarjeta, aunque sería un uso desproporcionado dado el tamaño del modelo.
- Inferencia en CPU: viable con Q4_K_M o inferiores usando llama.cpp; el rendimiento dependerá del número de núcleos y del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, KoboldCpp, text-generation-webui y otros frontends compatibles con GGUF. vLLM y TGI tienen soporte limitado o experimental de GGUF, por lo que se recomienda el ecosistema llama.cpp para este formato.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token para ninguna de las cuantizaciones.

## Comparativa con modelos similares

| Modelo | Formato | Parámetros | Licencia | Cuantizaciones | Notas |
|---|---|---|---|---|---|
| mradermacher/Qwen3-VL-4B-Instruct-heretic-Semantic-Same-GGUF (este) | GGUF | 4,02 B | apache-2.0 | 12 niveles (Q2_K a f16) + mmproj | Cuantización estática; sin benchmark publicado |
| mradermacher/Qwen3-VL-4B-Instruct-heretic-Semantic-Same-i1-GGUF | GGUF | 4,02 B | apache-2.0 (según el modelo base) | Cuantización ponderada/imatrix | Alternativa de mayor precisión por bit según el autor |
| VINAY-UMRETHE/Qwen3-VL-4B-Instruct-heretic-Semantic-Same | safetensors (transformers) | 4,02 B | apache-2.0 | Sin cuantizar | Modelo base del que derivan las cuantizaciones |
| Qwen/Qwen3-VL-4B-Instruct | no disponible en la información proporcionada | ~4 B (según denominación) | no disponible en la información proporcionada | no disponible | Modelo instruct original de la familia; no se dispone de datos comparativos en esta búsqueda |

No se dispone de datos de rendimiento (contexto, benchmarks, licencia exacta del upstream) que permitan una comparación cuantitativa con alternativas de otros desarrolladores. La comparación se limita a formato, tamaño y licencia declarada.

## Limitaciones y advertencias

- Modelo abliterated/decensored: la supresión de mecanismos de rechazo implica que puede generar contenido ofensivo, ilegal o peligroso. No es apto para aplicaciones de cara al público sin filtros adicionales y requiere evaluación previa en cualquier despliegue en producción.
- Riesgo de alucinación: no hay evaluación publicada de fidelidad, por lo que se debe asumir el comportamiento típico de un modelo de 4 B, con mayor propensión a inventar datos que modelos de mayor tamaño.
- Idiomas: solo se declara inglés. El rendimiento en castellano u otros idiomas no está verificado y previsiblemente será inferior.
- Longitud de contexto: no disponible. No se puede planificar el truncado o la estrategia de chunks sin conocer este dato.
- Cuantizaciones de baja precisión: Q2_K y las variantes Q3 degradan de forma notable la calidad respecto a Q4 o superiores; el propio autor marca Q3_K_M como "lower quality".
- Visión dependiente del mmproj: si se carga el GGUF sin el fichero mmproj correspondiente, el modelo no procesará imágenes.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no exime al usuario de responsabilidad legal sobre el contenido generado; el autor de la cuantización no ofrece garantías.
- Sin validación comunitaria: el repositorio registra 0 descargas y 0 valoraciones en el momento de la consulta, lo que impide contrastar la calidad real de las cuantizaciones publicadas.
- Ausencia de benchmarks: no se pueden verificar afirmaciones de rendimiento ni comparar de forma objetiva con el modelo instruct original.
- La model card del cuantizador es genérica y no documenta diferencias funcionales entre variantes más allá del tamaño y la recomendación de uso.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/mradermacher/Qwen3-VL-4B-Instruct-heretic-Semantic-Same-GGUF
- Cuantizaciones ponderadas i1 (imatrix): https://huggingface.co/mradermacher/Qwen3-VL-4B-Instruct-heretic-Semantic-Same-i1-GGUF
- Modelo base: https://huggingface.co/VINAY-UMRETHE/Qwen3-VL-4B-Instruct-heretic-Semantic-Same
- Visión general y lista de descargas del autor: https://hf.tst.eu/model#Qwen3-VL-4B-Instruct-heretic-Semantic-Same-GGUF
- Proyector multimodal mmproj-Q8_0: https://huggingface.co/mradermacher/Qwen3-VL-4B-Instruct-heretic-Semantic-Same-GGUF/resolve/main/Qwen3-VL-4B-Instruct-heretic-Semantic-Same.mmproj-Q8_0.gguf
- Proyector multimodal mmproj-f16: https://huggingface.co/mradermacher/Qwen3-VL-4B-Instruct-heretic-Semantic-Same-GGUF/resolve/main/Qwen3-VL-4B-Instruct-heretic-Semantic-Same.mmproj-f16.gguf
- Guía de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Gráfica comparativa de perplejidad entre tipos de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones GGUF: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa que aloja la infraestructura del cuantizador: https://www.nethype.de/
