# bartowski/Cloudflare_clef-flash-GGUF

## Resumen

clef-flash es un modelo de decisión multimodal desarrollado por Cloudflare, distribuido en formato GGUF por bartowski. A diferencia de los modelos generativos convencionales, no produce texto libre: lee un estado (texto o JSON) junto con un esquema de preguntas tipadas y devuelve, en un único forward pass, una probabilidad para cada opción permitida de cada pregunta. Esta orientación a la clasificación estructurada lo convierte en una pieza adecuada para enrutado, moderación y extracción de etiquetas dentro de pipelines automatizados.

El modelo base cuenta con aproximadamente 9.075 millones de parámetros (9B), acepta entradas de texto e imagen (esta última requiere el fichero mmproj) y se apoya en la arquitectura Qwen3.5 según las etiquetas del autor. Su relevancia actual reside en la creciente demanda de componentes deterministas y tipados para sistemas agenticos: sustituir llamadas a un LLM generativo por un clasificador dedicado reduce latencia, coste y variabilidad de salida.

La licencia Apache 2.0 permite uso comercial sin restricciones significativas, y la disponibilidad de cuantizaciones GGUF desde 2 bits hasta bf16 facilita el despliegue tanto en servidores como en hardware de consumo. La integración con llama.cpp se realiza mediante el endpoint `/v1/systemone` de `llama-server`, que implementa la TypeSafe System One API.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5 según etiquetas del autor), con cabeza de decisión para clasificación tipada |
| Parametros totales | 9.075.566.084 (~9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q5_K_M, Q4_K_L, Q5_K_S, Q4_1, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, IQ3_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); checkpoint original en safetensors |

## Arquitectura y entrenamiento

El modelo se compone de un backbone transformer multimodal (etiquetado como Qwen3.5) que procesa texto e imágenes, seguido de una cabeza de decisión que transforma los estados ocultos finales en distribuciones de probabilidad sobre las opciones definidas por el esquema de preguntas. La cabeza de decisión se almacena siempre en Q8_0 en todas las cuantizaciones, independientemente del formato del resto de pesos, para preservar la calidad de la salida.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. El autor indica que no es posible calcular una importance matrix (imatrix) para este modelo, porque la herramienta de llama.cpp calibra sobre probabilidades de tokens generados durante la generación de texto, y un modelo de decisión no genera texto. Por la misma razón tampoco se pueden medir perplejidad ni divergencia KL. Las cuantizaciones por debajo de 4 bits por peso pierden calidad de forma notablemente superior a una cuantización con imatrix del mismo tamaño, y los formatos que requieren imatrix (IQ1, IQ2, IQ3_XS, IQ3_XXS, Q2_K_S) no están disponibles.

## Capacidades

- Clasificación tipada de estados de texto o JSON contra un esquema de preguntas con criterios predefinidos.
- Tipos de pregunta soportados: `choice` (selección entre opciones), `noul` (booleano sí/no) y `score` (puntuación ordinal sobre criterios).
- Salida de probabilidades por opción en un único forward pass, sin generación autoregresiva.
- Procesamiento de imágenes cuando se carga el fichero mmproj correspondiente.
- Enrutado y clasificación de conversaciones, incluida la detección de urgencia o estado emocional.
- Integración con llama.cpp mediante el endpoint `/v1/systemone` de `llama-server`.
- No soporta tool calling ni function calling en el sentido convencional, ni agentes multi-step, ni decodificación especulativa.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Enrutado de tickets de soporte: el modelo recibe el mensaje del cliente como estado y un esquema con la pregunta `route` de tipo `choice` (billing, shipping, technical), devolviendo la probabilidad de cada equipo en una sola pasada. Adecuado por su latencia baja y salida determinista frente a un LLM generativo.
- Triaje de urgencia: combinación de una pregunta `score` con criterios ordinales ("can wait", "this week", "today", "right now") para priorizar colas de atención sin intervención humana.
- Moderación de contenido: clasificación de textos o imágenes contra un esquema de políticas tipadas, obteniendo probabilidades por categoría que permiten aplicar umbrales configurables.
- Detección de sentimiento y tono: pregunta `noul` del estilo "¿El cliente está enfadado?" junto con preguntas `score` sobre intensidad emocional, útil en sistemas de atención al cliente automatizada.
- Extracción de etiquetas estructuradas: clasificación de documentos o formularios contra un esquema fijo de campos, sustituyendo parsers frágiles por un clasificador con salida probabilística.
- Clasificación de imágenes en pipelines industriales: con el fichero mmproj cargado, el modelo puede etiquetar imágenes contra criterios tipados (defectos, categorías de producto) en un único forward pass.
- Filtrado previo en sistemas RAG o agenticos: decidir qué ruta, herramienta o subagente debe atender una consulta antes de invocar un LLM generativo, reduciendo coste y variabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor señala además que perplejidad y divergencia KL no pueden medirse para este modelo, al no generar texto sobre el que calibrar. Las descripciones de calidad asociadas a cada cuantización son orientativas generales, no mediciones específicas de este modelo.

## Requisitos de hardware

- VRAM estimada: aproximadamente 6,04 GB para Q4_K_M, 6,07 GB para Q4_1, 6,66 GB para Q5_K_S, 6,80 GB para Q4_K_L, 6,98 GB para Q5_K_M, 7,83 GB para Q6_K, 8,32 GB para Q6_K_L, 9,68 GB para Q8_0 y 18,16 GB para bf16.
- Cabe en GPU de consumo: Q4_K_M y Q4_1 en tarjetas de 8 GB (RTX 3060, RTX 4060); Q5_K_M y Q6_K en tarjetas de 12 GB (RTX 3060 12GB, RTX 4070); Q8_0 en tarjetas de 12-16 GB; bf16 en 24 GB (RTX 4090) o A100/H100.
- GPU recomendadas: RTX 4090 o A100/H100 para bf16 y Q8_0; RTX 3060 12GB, RTX 4070 o RTX 4080 para cuantizaciones de 5-6 bits; RTX 4060 o RTX 3060 8GB para Q4.
- Opciones de despliegue: llama.cpp con `llama-server` (endpoint `/v1/systemone`), versión b11430 o superior. No se documentan opciones con vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles. Al tratarse de un único forward pass sin generación autoregresiva, la latencia esperada es sensiblemente inferior a la de un LLM generativo del mismo tamaño, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| clef-flash (Cloudflare) | ~9B | no disponible | Probabilidades tipadas por pregunta | Apache 2.0 | GGUF vía bartowski, checkpoint original |
| Modelos de clasificación tipo BERT/RoBERTa | 0,1-0,4B | 512 tokens tipicamente | Etiqueta única por texto | Apache 2.0 / MIT segun variante | Hugging Face, amplia |
| LLM generativos con salida JSON (p. ej. Qwen de 7-9B) | 7-9B | 8K-128K segun variante | Texto libre o JSON parseable | Apache 2.0 u otras | Amplia |

La ventaja específica de clef-flash es la combinación de esquema tipado, salida probabilística por opción y multimodalidad en un solo modelo, frente a clasificadores BERT (limitados a una etiqueta y sin visión) y frente a LLMs generativos (salida menos determinista y mayor coste por consulta). No se dispone de comparaciones de rendimiento numéricas con alternativas.

## Limitaciones y advertencias

- No genera texto: no puede usarse como chatbot, completador ni endpoint de chat; requiere el endpoint `/v1/systemone` de `llama-server`.
- Las cuantizaciones por debajo de 4 bits por peso (Q3_K_L, Q3_K_M, IQ3_M, Q3_K_S, Q2_K) pierden calidad de forma notablemente superior a una cuantización con imatrix del mismo tamaño; se recomienda Q4_K_M o superior.
- No se pueden calcular imatrix, perplejidad ni divergencia KL para este modelo, por lo que no hay métricas objetivas de degradación por cuantización.
- La cabeza de decisión se almacena en Q8_0 en todas las cuantizaciones; no se ha medido el coste de cuantizarla a otros formatos.
- Longitud de contexto, idiomas soportados y sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no aplica en el sentido habitual al no generar texto, pero las probabilidades de clasificación pueden ser mal calibradas en dominios alejados de los datos de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución con atribución y conservación del aviso de licencia.
- Para producción, conviene validar los umbrales de decisión sobre datos propios, dado que no hay benchmarks publicados que orienten la calibración.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/Cloudflare_clef-flash-GGUF
- Modelo original: https://huggingface.co/Cloudflare/clef-flash
- llama.cpp: https://github.com/ggml-org/llama.cpp/
- Release de llama.cpp usado para la cuantización: https://github.com/ggml-org/llama.cpp/releases/tag/b11430
- Documentación del endpoint `/v1/systemone`: https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md
- TypeSafe System One API: https://docs.typesafe.ai/api
- Fichero recomendado Q4_K_M: https://huggingface.co/bartowski/Cloudflare_clef-flash-GGUF/blob/main/Cloudflare_clef-flash-Q4_K_M.gguf
