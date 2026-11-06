# Parabol/harrier-oss-v1-270m-ONNX-INT8

## Resumen

Parabol/harrier-oss-v1-270m-ONNX-INT8 es una compilación cuantizada a 8 bits del modelo de embeddings de Microsoft microsoft/harrier-oss-v1-270m, empaquetada en formato ONNX para su carga en CPU mediante Text Embeddings Inference (TEI). El modelo base pertenece a la familia Gemma 3 (etiqueta `gemma3_text`) con 270 millones de parámetros y está diseñado para generar representaciones vectoriales de texto (feature extraction y sentence similarity). Parabol, la empresa que publica esta versión, la utiliza en producción para su motor de búsqueda interna.

La aportación técnica de esta build no es el modelo en sí, sino la ingeniería de cuantización: TEI solo lee `onnx/model.onnx` y `onnx/model.onnx_data`, y las alternativas cuantizadas disponibles no podían seleccionarse o usaban operadores no soportados por el ONNX Runtime de TEI (como `GatherBlockQuantized`). Esta versión cuantiza las operaciones `MatMul` y `Gather` —incluyendo el embedding de tokens de 262.144 × 640— a UINT8 simétrico por canal con operadores estándar, reduciendo los pesos de 1.106 MB a 302 MB.

Es relevante para equipos que necesitan desplegar búsqueda semántica o RAG en infraestructura CPU sin GPU, con un consumo de memoria contenido (712 MiB en reposo, 793 MiB en pico) y un rendimiento superior al modelo en precisión completa en el escenario medido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3, `gemma3_text`) |
| Parámetros totales | 270 millones |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 (UINT8 simétrico por canal) sobre ONNX |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx` + `model.onnx_data` externo) |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Gemma 3 (`gemma3_text`) con 270 millones de parámetros, orientado a la extracción de embeddings. La model card de esta build no documenta la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo fases de ajuste con RLHF o DPO; esa información correspondería a la model card original de microsoft/harrier-oss-v1-270m, no incluida en la información disponible.

La innovación de esta versión es exclusivamente de despliegue: la cuantización se aplica sobre la exportación ONNX de precisión completa de onnx-community/harrier-oss-v1-270m (revisión `d59c919d0159aea2c19ed7d04288fcdd048d0f9c`), cuantizando `MatMul` y `Gather` a UINT8 simétrico por canal con operadores estándar compatibles con el ONNX Runtime de TEI. El script `quantize.py` reproduce los ficheros `onnx/model.onnx` y `onnx/model.onnx_data` byte a byte con onnxruntime 1.22.1 y onnx 1.23.2. El tokenizador y los ficheros de configuración se copian sin cambios de la revisión original. El pooling recomendado es last-token.

## Capacidades

- Generación de embeddings de texto para búsqueda semántica y similitud entre frases (`sentence-similarity`).
- Extracción de características (`feature-extraction`) a partir de texto.
- Soporte de instrucciones previas a la consulta, con el formato `Instruct: <tarea>\nQuery: <consulta>`, dejando los documentos sin instrucción.
- Compatibilidad con endpoints (`endpoints_compatible`) y con el backend ONNX de Text Embeddings Inference.
- Inferencia en CPU sin GPU.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes; el pipeline declarado es exclusivamente `feature-extraction`.

## Casos de uso

- Búsqueda semántica en producción sobre CPU: desplegando el modelo con TEI (`--pooling last-token`) se obtiene un servicio de embeddings con 793 MiB de pico de memoria, adecuado para entornos sin GPU o con GPU limitada.
- RAG (retrieval-augmented generation) en infraestructura modesta: el tamaño de 302 MB de pesos permite ejecutar el indexador y el servidor de consultas en la misma máquina que el resto del pipeline, con latencia de 628 tokens por segundo en el escenario medido.
- Deduplicación y agrupación de documentos: la similitud coseno entre vectores permite detectar contenido duplicado o casi duplicado; la build advierte de que las similitudes se desplazan alrededor de 0,01 de media, por lo que conviene usar umbrales con margen.
- Motor de búsqueda interno de una organización: es exactamente el uso que Parabol declara en producción, con calidad de ranking equivalente a precisión completa dentro de 0,01 nDCG@10 en sus conjuntos de evaluación internos.
- Clasificación y clustering de textos por similitud: los embeddings sirven como entrada a clasificadores ligeros o algoritmos de clustering sin necesidad de infraestructura GPU.
- Filtrado previo en pipelines de moderación o recomendación: el bajo coste de inferencia en CPU permite puntuar grandes volúmenes de candidatos antes de aplicar modelos más caros.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, MTEB, etc.). Sí incluye una comparación medida en TEI 1.9.4 (x86-64, 3 CPUs) frente a la exportación ONNX en precisión completa:

| Métrica | Precisión completa | Esta build (INT8) |
|---|---|---|
| Pesos | 1.106 MB | 302 MB |
| Memoria en reposo / pico bajo carga | 1.274 / 1.417 MiB | 712 / 793 MiB |
| Tokens por segundo (una petición a la vez) | 549 | 628 |
| Similitud coseno con vectores de precisión completa | — | 0,973 a 0,989 (mediana 0,985) |
| Calidad de ranking (nDCG@10 interno de Parabol) | referencia | igual dentro de 0,01 |

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia está pensada para CPU. Memoria RAM estimada: 712 MiB en reposo y 793 MiB en pico bajo carga, según las mediciones del autor.
- GPU recomendadas: no aplica para este formato; el backend ONNX de TEI está orientado a CPU.
- GPU de consumo: irrelevante para este build, que no necesita GPU.
- Despliegue: Text Embeddings Inference con imagen `ghcr.io/huggingface/text-embeddings-inference:cpu-1.9.4` y `--model-id Parabol/harrier-oss-v1-270m-ONNX-INT8 --pooling last-token`. También es compatible con ONNX Runtime directamente.
- Latencia y throughput: 628 tokens por segundo con una petición a la vez en x86-64 con 3 CPUs (TEI 1.9.4), frente a 549 del modelo en precisión completa.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato / cuantización | Memoria | Licencia | Notas |
|---|---|---|---|---|---|
| Parabol/harrier-oss-v1-270m-ONNX-INT8 | 270 M | ONNX INT8 | 712 / 793 MiB | MIT | Objetivo: TEI en CPU; 628 tok/s |
| microsoft/harrier-oss-v1-270m | 270 M | pesos originales | no disponible | MIT | Modelo base; sin datos de rendimiento en la información disponible |
| onnx-community/harrier-oss-v1-270m-ONNX | 270 M | ONNX (precisión completa) | 1.274 / 1.417 MiB | MIT | Exportación de referencia; 549 tok/s |
| wjixiang/harrier-oss-v1-270m-onnx | 270 M | ONNX int8 (variante de onnx-community) | no disponible | no disponible | Exportación comunitaria para ONNX Runtime local; sin datos comparativos publicados |

## Limitaciones y advertencias

- Los vectores no son idénticos a los de precisión completa: la similitud coseno cae entre 0,973 y 0,989, y las puntuaciones de similitud se desplazan alrededor de 0,01 de media. Empates cercanos pueden invertirse y páginas próximas a un umbral fijo de similitud pueden cruzarlo.
- El modelo está pensado exclusivamente para embeddings; no genera texto ni razona, por lo que no debe emplearse como modelo conversacional.
- No se documentan los idiomas soportados; la cobertura multilingüe debe validarse empíricamente antes de usarlo en producción con idiomas distintos del inglés.
- No se dispone de datos sobre sesgos del modelo base en la información proporcionada.
- El riesgo de alucinación es bajo en el sentido estricto (no genera texto), pero los embeddings pueden producir recuperaciones irrelevantes si la instrucción de consulta no se formatea correctamente.
- Es imprescindible usar last-token pooling y el formato de instrucción recomendado; otros poolings degradan la calidad.
- La licencia MIT permite uso comercial sin restricciones, igual que el modelo base; el crédito corresponde a los autores de Microsoft y a onnx-community por la exportación.
- El repositorio no registra descargas ni likes en el momento de la consulta, por lo que la validación comunitaria es inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Parabol/harrier-oss-v1-270m-ONNX-INT8
- Modelo base: https://huggingface.co/microsoft/harrier-oss-v1-270m
- Exportación ONNX de referencia: https://huggingface.co/onnx-community/harrier-oss-v1-270m-ONNX
- Exportación ONNX comunitaria alternativa: https://huggingface.co/wjixiang/harrier-oss-v1-270m-onnx
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
- Parabol: https://www.parabol.co/
