# rahul27474/hinglish-embed-small

## Resumen

hinglish-embed-small es un modelo de embeddings de texto de 37 millones de parámetros desarrollado por el usuario rahul27474 y publicado en Hugging Face. Está especializado en la recuperación semántica de texto Hinglish romanizado (hindi escrito con alfabeto latino), hindi en devanagari e inglés, y se presenta como una alternativa ligera y rápida en CPU para pipelines de RAG y búsqueda semántica en el contexto del mercado indio. Deriva de intfloat/multilingual-e5-small mediante fine-tuning y reducción de vocabulario, no se entrena desde cero.

El problema que aborda es concreto: los usuarios indios escriben con frecuencia mezclas de hindi romanizado, abreviaturas tipo SMS y errores ortográficos ("bhai upi se paise kat gaye par receiver ko nhi mile") que los embedders multilingües genéricos manejan mal. El modelo está entrenado para emparejar consultas en cualquiera de las tres formas (hinglish, hindi, inglés) contra documentos en cualquiera de las tres, con embeddings de 384 dimensiones y similitud coseno.

Su relevancia práctica reside en la relación calidad/tamaño: con 37M de parámetros es 3,2 veces más pequeño que multilingual-e5-small y 15 veces más pequeño que bge-m3, incluye pesos ONNX int8 de 38 MB y se distribuye con licencia MIT, lo que permite uso comercial. La longitud de contexto no se especifica en la información disponible, aunque los ejemplos de uso truncan a 512 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (encoder), derivado de intfloat/multilingual-e5-small |
| Parametros totales | 36.999.552 (37M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (los ejemplos de uso truncan a 512 tokens) |
| Tipos de cuantizacion | ONNX int8 (`onnx/model_quint8_avx2.onnx`, 38 MB) y ONNX fp32; pesos safetensors en fp32 |
| Idiomas soportados | Hindi (devanagari), inglés y hinglish romanizado (códigos hi, en) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX (int8 y fp32) |
| Dimension de embedding | 384 |
| Funcion de similitud | Coseno |
| Prefijos requeridos | `query: ` para consultas, `passage: ` para documentos |
| Tamano del repo | 0,3 GB |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo BERT con 37M de parámetros, obtenido por fine-tuning y recorte de vocabulario a partir de intfloat/multilingual-e5-small (118M). El recorte de vocabulario reduce el consumo de memoria, pero según el autor no reduce los FLOPs por token, por lo que el throughput en lote se mantiene similar al del modelo base. Los embeddings se generan con pooling medio y normalización L2, y se comparan por similitud coseno.

El entrenamiento se realizó sobre el dataset rahul27474/hinglish-retrieval-train, orientado a recuperación en dominios cotidianos y de atención al cliente indios (UPI, IRCTC, Aadhaar/PAN, telecomunicaciones, seguros, reparto de comida). La evaluación se hizo sobre rahul27474/hinglish-retrieval-bench, con 3.626 pasajes multilingües y 268 temas retenidos en 40 dominios. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; al tratarse de un modelo de embeddings, el objetivo es de similitud/recuperación y no de generación. El autor advierte que el benchmark es sintético y fue generado por el mismo pipeline LLM que los datos de entrenamiento, por lo que la ventaja observada podría reducirse en datos reales.

## Capacidades

- Generación de embeddings de texto de 384 dimensiones para similitud semántica y recuperación (retrieval).
- Recuperación cross-lingüe entre hinglish romanizado, hindi en devanagari e inglés: una consulta en cualquiera de las tres formas puede recuperar documentos en cualquiera de las otras.
- Soporte de RAG (retrieval-augmented generation) como componente de indexación y búsqueda.
- Feature extraction para pipelines de clasificación, clustering o deduplicación semántica.
- Prefijos de tarea integrados (`query:` / `passage:`) accesibles mediante `encode_query` / `encode_document` en sentence-transformers 5 o superior.
- Compatibilidad con ONNX y transformers.js para ejecución en CPU y en navegador.
- Compatibilidad con text-embeddings-inference y endpoints compatibles según los tags del repositorio.
- Integración con LangChain y LlamaIndex mediante sus wrappers de sentence-transformers/HuggingFace.
- No dispone de tool calling, agentes, razonamiento multi-paso, visión ni audio: es exclusivamente un modelo de embeddings.

## Casos de uso

- Chatbot de soporte con FAQ: indexar respuestas de atención al cliente en hinglish, hindi e inglés y recuperar la más relevante para consultas informales como "refund kab aayega", usando los prefijos `query:` y `passage:` y similitud coseno sobre embeddings de 384 dimensiones.
- Búsqueda semántica en atención al cliente de servicios financieros: recuperar documentación sobre UPI, reembolsos o fallos de transacción a partir de consultas escritas en hinglish romanizado, un dominio incluido explícitamente en el benchmark del modelo.
- RAG sobre documentación de trámites administrativos: indexar textos sobre Aadhaar, PAN, IRCTC o portabilidad telefónica y recuperar pasajes relevantes para consultas en cualquiera de los tres idiomas, con la ventaja de que el modelo es cross-lingüe.
- Despliegue en CPU de bajo coste: con los pesos ONNX int8 (38 MB) y una latencia de 12,8 ms por consulta en una caja de 4 vCPU, es adecuado para servicios de búsqueda en entornos sin GPU o con presupuesto limitado.
- Búsqueda en navegador sin servidor: mediante transformers.js con dtype q8, permite ejecutar la búsqueda semántica localmente en el cliente, útil para demos o aplicaciones con requisitos de privacidad.
- Deduplicación y clustering de tickets de soporte: generar embeddings de tickets en hinglish y agrupar consultas equivalentes escritas con variantes ortográficas distintas para enrutarlas al equipo adecuado.
- Moderación o clasificación de contenido multilingüe: usar los embeddings como features de entrada para clasificadores que operen sobre texto mezclado hindi-inglés.

## Benchmarks y rendimiento

Resultados de nDCG@10 con relevancia graduada sobre hinglish-retrieval-bench (3.626 pasajes, 268 temas, 40 dominios):

| Modelo | Parámetros | Consultas hinglish | Consultas hindi | Consultas inglés |
|---|---|---|---|---|
| hinglish-embed-small | 37M | 0,788 | 0,802 | 0,817 |
| hinglish-embed-small, ONNX int8 | 37M | 0,785 | 0,800 | 0,815 |
| BAAI/bge-m3 | 568M | 0,612 | 0,717 | 0,743 |
| intfloat/multilingual-e5-small | 118M | 0,482 | 0,570 | 0,704 |
| intfloat/multilingual-e5-base | 278M | 0,444 | 0,549 | 0,679 |

Recall@10 en consultas hinglish: 0,932 para hinglish-embed-small frente a 0,733 de bge-m3 y 0,573 de e5-small.

Latencia y throughput en CPU (4 vCPU, Kaggle, con sentence-transformers):

| Modelo y formato | Latencia por consulta | Throughput en lote |
|---|---|---|
| hinglish-embed-small, ONNX int8 | 12,8 ms | 112 sent/s |
| hinglish-embed-small, ONNX fp32 | 15,7 ms | 101 sent/s |
| hinglish-embed-small, PyTorch fp32 | 34,3 ms | 110 sent/s |
| multilingual-e5-small, PyTorch fp32 | 29,2 ms | 115 sent/s |
| bge-m3, PyTorch fp32 | ~248 ms | ~16 sent/s |

El autor señala que el benchmark es sintético y generado por el mismo pipeline que los datos de entrenamiento, por lo que la ventaja podría ser menor en datos reales.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en fp32 ocupa aproximadamente 148 MB (37M parámetros × 4 bytes); en ONNX int8, unos 38 MB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (por ejemplo, RTX 3060, RTX 4090) puede ejecutarlo, pero su diseño está optimizado para CPU.
- Cabe en GPU consumer: sí, en todas, dado su tamaño reducido.
- Opciones de despliegue: sentence-transformers (PyTorch u ONNX), transformers, transformers.js (navegador o Node), text-embeddings-inference y endpoints compatibles, además de los wrappers de LangChain y LlamaIndex.
- Latencia y throughput: 12,8 ms por consulta y 112 sentencias/s en lote con ONNX int8 en 4 vCPU; 15,7 ms y 101 sent/s con ONNX fp32; 34,3 ms y 110 sent/s con PyTorch fp32. La latencia por consulta con int8 es 2,3 veces menor que con e5-small y unas 19 veces menor que con bge-m3.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | nDCG@10 hinglish | Licencia | Formatos |
|---|---|---|---|---|---|
| hinglish-embed-small | 37M | hi, en, hinglish | 0,788 | MIT | safetensors, ONNX int8/fp32 |
| intfloat/multilingual-e5-small | 118M | multilingüe | 0,482 | MIT | safetensors |
| intfloat/multilingual-e5-base | 278M | multilingüe | 0,444 | MIT | safetensors |
| BAAI/bge-m3 | 568M | multilingüe | 0,612 | MIT | safetensors |

hinglish-embed-small es el más pequeño de la comparativa, el único con pesos ONNX int8 incluidos y el que obtiene los mejores resultados en el benchmark del autor para las tres formas de consulta. La longitud de contexto de los modelos comparados no se detalla en la información disponible.

## Limitaciones y advertencias

- El benchmark es sintético y fue generado por el mismo pipeline LLM que los datos de entrenamiento; el autor recomienda evaluar sobre una muestra de consultas reales antes de adoptar el modelo.
- El dominio está acotado a contextos indios cotidianos y de atención al cliente; el rendimiento en otros dominios o variantes dialectales no está documentado.
- Solo cubre hindi, inglés y hinglish romanizado; no se han publicado evaluaciones en otras lenguas.
- No se especifica la longitud máxima de contexto; los ejemplos truncan a 512 tokens, por lo que textos más largos pueden perder información.
- Riesgo de sesgos derivado de los datos de entrenamiento sintéticos y de los dominios cubiertos; no se documentan análisis de sesgo.
- Como modelo de embeddings, no genera texto ni razona: no debe usarse para tareas generativas ni de tool calling.
- Es necesario aplicar correctamente los prefijos `query:` y `passage:`; omitirlos puede degradar la recuperación.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es aún inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rahul27474/hinglish-embed-small
- Demo en el navegador (Space): https://huggingface.co/spaces/rahul27474/hinglish-embed-small-demo
- Dataset de entrenamiento: https://huggingface.co/datasets/rahul27474/hinglish-retrieval-train
- Dataset de evaluación: https://huggingface.co/datasets/rahul27474/hinglish-retrieval-bench
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
