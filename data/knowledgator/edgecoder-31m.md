# knowledgator/EdgeCoder-31M

## Resumen

EdgeCoder-31M es un codificador de texto compacto en inglés desarrollado por Knowledgator Engineering. Con 31 millones de parámetros (14,2 millones sin la tabla de embeddings) y 8 capas, está diseñado para tareas de extracción de características, clasificación y generación de embeddings, con una ventana de contexto de hasta 8192 tokens. Emplea una arquitectura DeBERTa-v2 con atención relativa desenredada y sin posiciones absolutas.

El modelo se preentrena con ModernELECTRA, una variante del objetivo de detección de tokens reemplazados (RTD) de ELECTRA y DeBERTaV3, complementada con una tarea de reconstrucción de ventana de frontera. El objetivo declarado por el autor es resolver la debilidad habitual de los codificadores RTD como base para modelos de embeddings: EdgeCoder-31M conserva la calidad de clasificación del RTD y, tras un ajuste fino, iguala a codificadores basados en modelado de lenguaje enmascarado de su mismo tamaño en tareas de embeddings.

Es relevante ahora porque demuestra que un codificador de 31M puede superar a BERT-base (109,5M) en la media de GLUE (86,0 frente a 84,7) y situarse al nivel de MiniLM-L12 y Ettin-Enc-32m en MTEB English v2, con un coste computacional y de memoria mucho menor. El repositorio contiene únicamente el codificador discriminador, sin cabeza de modelado de lenguaje enmascarado, por lo que está pensado para ajuste fino y extracción de características, no para fill-mask.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (atención relativa desenredada, sin posiciones absolutas) |
| Parametros totales | 31.036.416 (14,2M sin la tabla de embeddings) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers) |

Detalles adicionales de arquitectura: 8 capas, dimensión oculta 384, FFN de 1536, 6 cabezas de atención. El embedding de tokens es factorizado: tabla de 128 dimensiones con proyección lineal a 384. Tokenizador DeBERTa-v3 SentencePiece con 128.100 tokens. Tamaño del repositorio: 0,1 GB.

## Arquitectura y entrenamiento

EdgeCoder-31M es un transformer encoder de tipo DeBERTa-v2 con atención relativa desenredada y sin codificaciones posicionales absolutas. El preentrenamiento sigue el esquema ModernELECTRA: detección de tokens reemplazados en todas las posiciones más una tarea de reconstrucción de ventana de frontera, en la que cada token se predice a partir de los dos estados ocultos de los bordes de una ventana aleatoria de 3 a 12 tokens que lo contiene. La pérdida de ventana tiene un peso de 0,003. Los reemplazos se muestrean de un generador separado de 4 capas preentrenado con modelado de lenguaje enmascarado y congelado después, con temperatura decreciente de 1,5 a 0,9 durante el entrenamiento y una tasa de enmascaramiento del 30%.

El entrenamiento utilizó aproximadamente 1,0 billón de tokens de texto en inglés: páginas web, noticias, artículos científicos y PDF, libros, texto legal, código fuente, matemáticas y foros de preguntas y respuestas. Se aplicó un currículo de longitud: 512 tokens para alrededor del 90 % de los tokens de entrenamiento, y después 2048 y 8192 tokens sobre documentos largos. El hardware empleado fue un nodo con 8 × NVIDIA RTX PRO 6000 Black. El autor recomienda FlashDeBERTa, la implementación con la que se entrenó el modelo, para entradas largas, ya que la atención estándar de DeBERTa escala cuadráticamente en memoria con la longitud de secuencia.

## Capacidades

- Extracción de características: genera estados ocultos de 384 dimensiones por token, aptos para tareas posteriores de clasificación, etiquetado y agrupamiento.
- Clasificación de secuencias y de tokens mediante cabezas estándar (`AutoModelForSequenceClassification`, `AutoModelForTokenClassification`).
- Generación de embeddings de frase tras ajuste fino con pérdida contrastiva y mean pooling, con rendimiento competitivo en MTEB English v2.
- Soporte de contexto largo de hasta 8192 tokens, especialmente con FlashDeBERTa.
- FlashDeBERTa proporciona además cabezas para question answering y multiple choice.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un encoder, no un modelo generativo.
- No dispone de cabeza de modelado de lenguaje enmascarado, por lo que no sirve para fill-mask.
- Capacidad multilingüe: no; solo inglés (existe una versión multilingüe separada, EdgeCoder-Multilingual-61M).

## Casos de uso

- Clasificación de texto en producción: ajuste fino con `AutoModelForSequenceClassification` para moderación de contenido, detección de spam o enrutamiento de tickets; sus 31M permiten desplegar muchas instancias en CPU o GPU pequeñas con latencia baja.
- Etiquetado de tokens y extracción de entidades: con `AutoModelForTokenClassification` y contexto de 8192 tokens se pueden procesar documentos completos (contratos, informes) sin truncar, capturando entidades en secciones alejadas del texto.
- Búsqueda semántica y recuperación: tras ajuste fino como modelo de embeddings (como en la evaluación MTEB con tripletas de MS MARCO), sirve para indexar y recuperar pasajes con un coste de almacenamiento de vectores de 384 dimensiones, muy inferior al de modelos de 768 o 1024 dimensiones.
- Reranking de resultados de búsqueda: ajustado como cross-encoder, puntúa pares consulta-documento; la ventana de 8192 tokens permite incluir pasajes largos completos.
- Question answering extractivo: con la cabeza de QA de FlashDeBERTa, localiza respuestas en documentos largos, útil en asistentes documentales sobre normativa o manuales técnicos.
- Análisis de código fuente: el corpus de entrenamiento incluye código; puede ajustarse para detección de vulnerabilidades, clasificación de fragmentos o etiquetado de identificadores en pipelines de CI/CD.
- Procesamiento de documentos legales y científicos: el entrenamiento incluye texto legal, artículos y PDF, y el contexto largo facilita tareas de clasificación de secciones y extracción de metadatos en documentos extensos.
- Despliegue en el borde: por su tamaño (0,1 GB de pesos), es viable en dispositivos con recursos limitados o en contenedores con restricciones estrictas de memoria.

## Benchmarks y rendimiento

Resultados de GLUE (dev), según el paper, con una sola semilla y la mejor ejecución de un barrido de hiperparámetros siguiendo el protocolo Ettin:

| Modelo | Params | CoLA | SST-2 | MRPC | STS-B | QQP | MNLI | QNLI | RTE | Media |
|---|---|---|---|---|---|---|---|---|---|---|
| BERT-small | 28,8M | 44,8 | 90,1 | 83,1 | 87,6 | 90,1 | 79,2 | 88,2 | 69,3 | 79,0 |
| MiniLM-L12 | 33,4M | 59,1 | 93,3 | 91,2 | 89,2 | 91,5 | 85,6 | 91,9 | 74,7 | 84,6 |
| Ettin-Enc-32m | 31,9M | 57,4 | 92,0 | 89,7 | 89,5 | 91,0 | 83,4 | 90,7 | 74,7 | 83,5 |
| EdgeCoder-31M | 31,0M | 64,9 | 92,2 | 91,8 | 90,2 | 91,1 | 84,5 | 90,3 | 82,7 | 86,0 |
| DistilBERT | 66,4M | 56,9 | 92,2 | 86,8 | 87,4 | 90,8 | 82,7 | 89,5 | 66,1 | 81,5 |
| BERT-base | 109,5M | 59,0 | 93,1 | 89,5 | 89,4 | 91,4 | 85,4 | 91,6 | 78,2 | 84,7 |
| Ettin-Enc-68m | 68,1M | 64,8 | 94,4 | 92,2 | 91,1 | 91,9 | 87,0 | 92,9 | 83,8 | 87,2 |

Resultados de MTEB English v2 (41 tareas). Cada backbone se ajusta una vez como modelo de embeddings de frase sobre 1M de tripletas de MS MARCO (una época, mean pooling, pérdida contrastiva); las puntuaciones describen el backbone tras ese ajuste fino, no el checkpoint del repositorio tal cual:

| Modelo | Params | Clas. | Agrup. | PairCl. | Rerank. | Retr. | STS | Summ. | Media |
|---|---|---|---|---|---|---|---|---|---|
| BERT-small | 28,8M | 64,7 | 39,6 | 79,4 | 41,7 | 38,1 | 73,0 | 21,6 | 51,1 |
| MiniLM-L12 | 33,4M | 64,9 | 37,8 | 79,8 | 43,5 | 38,4 | 73,2 | 21,4 | 51,3 |
| Ettin-Enc-32m | 31,9M | 64,2 | 39,6 | 77,1 | 42,6 | 39,7 | 73,2 | 19,9 | 50,9 |
| EdgeCoder-31M | 31,0M | 65,3 | 39,7 | 78,0 | 42,3 | 38,6 | 73,1 | 20,9 | 51,1 |

## Requisitos de hardware

- VRAM estimada: los pesos en fp32 ocupan aproximadamente 124 MB; en fp16, unos 62 MB. La memoria real en inferencia la domina la activación, que crece con la longitud de secuencia.
- Para secuencias de 512 tokens, la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, etc.) e incluso en CPU.
- Para secuencias de 8192 tokens, la atención estándar de DeBERTa escala cuadráticamente en memoria; se recomienda FlashDeBERTa, que reduce el consumo y permite usar GPU de gama media (RTX 3060/4070 en adelante) con lotes pequeños.
- GPU recomendadas para entrenamiento: el autor usó 8 × NVIDIA RTX PRO 6000 Black; para ajuste fino a longitudes cortas basta una RTX 4090 o A100.
- Opciones de despliegue: `transformers` (referencia), FlashDeBERTa (recomendado para contexto largo), text-embeddings-inference (etiqueta del repositorio) y endpoints compatibles. No se documentan integraciones con vLLM, llama.cpp ni Ollama, al no ser un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Params | Contexto | GLUE (media) | MTEB v2 (media) | Licencia | Idiomas |
|---|---|---|---|---|---|---|
| EdgeCoder-31M | 31,0M | 8192 | 86,0 | 51,1 | Apache 2.0 | inglés |
| Ettin-Enc-32m | 31,9M | no disponible | 83,5 | 50,9 | no disponible | inglés |
| MiniLM-L12 | 33,4M | no disponible | 84,6 | 51,3 | no disponible | inglés |
| BERT-small | 28,8M | no disponible | 79,0 | 51,1 | no disponible | inglés |
| BERT-base | 109,5M | 512 | 84,7 | no disponible | Apache 2.0 | inglés |

EdgeCoder-31M destaca en GLUE frente a los codificadores de su tamaño, con una ventaja clara en CoLA (64,9) y RTE (82,7), y se mantiene competitivo en MTEB English v2 pese a ser un encoder RTD. Frente a BERT-base, ofrece mejor media de GLUE con un tercio de los parámetros y un contexto 16 veces mayor.

## Limitaciones y advertencias

- Solo inglés: no soporta otros idiomas; para multilingüe existe EdgeCoder-Multilingual-61M.
- No es un modelo generativo ni tiene cabeza de modelado de lenguaje enmascarado; no puede usarse para fill-mask ni para generar texto.
- Los resultados de MTEB corresponden al backbone tras un ajuste fino específico con tripletas de MS MARCO; el checkpoint del repositorio sin ajustar no ofrece esas puntuaciones de embeddings.
- Los resultados de GLUE provienen de una sola semilla y de la mejor ejecución de un barrido de hiperparámetros, lo que puede sobreestimar ligeramente el rendimiento esperado en producción.
- Riesgo de sesgos y alucinación: al entrenarse con 1,0 billón de tokens de web, noticias, foros y texto legal, puede heredar sesgos de esos corpus; en tareas de QA extractivo puede seleccionar pasajes incorrectos como respuesta.
- La atención estándar de DeBERTa es cuadrática en memoria; sin FlashDeBERTa, las secuencias de 8192 tokens pueden agotar la VRAM en GPU consumer.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de los datos de entrenamiento subyacentes, no detalladas en la información disponible.
- El paper referenciado (arXiv:2611.31495) aparece en las etiquetas sin enlace verificado en la model card; el autor marca el enlace como pendiente (TODO).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/knowledgator/EdgeCoder-31M
- Versión multilingüe: https://huggingface.co/knowledgator/EdgeCoder-Multilingual-61M
- Repositorio FlashDeBERTa: https://github.com/Knowledgator/FlashDeBERTa
- Knowledgator Engineering: https://knowledgator.com
- Paper (referencia en etiquetas, enlace no verificado): arXiv:2611.31495
