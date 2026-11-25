# altslate/indic-embed-small

## Resumen

indic-embed-small es un modelo de embeddings de frases de 140 millones de parámetros desarrollado por altslate, especializado en lenguas de la India tal y como se escriben en la práctica: en escritura nativa, en versión romanizada ("kal meeting cancel ho gayi") y en código mixto (hinglish), además de inglés. Resuelve un problema concreto de recuperación de información: permite buscar documentos en escritura nativa con consultas romanizadas (o al revés) sin necesidad de transliterar previamente, porque ambas representaciones caen cerca en el espacio vectorial.

El modelo es una destilación de BAAI/bge-m3 (568M) sobre el encoder jhu-clsp/mmBERT-small, con 140.493.696 parámetros en safetensors. Produce vectores de 1024 dimensiones normalizados en L2 (similitud coseno equivalente a producto escalar) y se entrenó con una longitud máxima de 128 tokens. Cubre once idiomas: hindi, bengalí, tamil, telugu, marati, guyaratí, canarés, malabar, panyabí, urdu e inglés.

Su relevancia actual radica en el escenario multilingüe real de India, donde la mayoría de las consultas de usuario llegan en texto romanizado o mezclado con inglés, mientras que los corpus indexados están en escritura nativa. Un encoder pequeño de 140M que resuelve esta brecha con recall@1 superior al 99 % en la tarea romanizado ↔ nativo es directamente desplegable en entornos con recursos limitados, incluido el navegador mediante transformers.js.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base jhu-clsp/mmBERT-small) con cabeza de proyección a 1024 dimensiones |
| Parámetros totales | 140.493.696 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 128 tokens (longitud máxima usada en entrenamiento) |
| Tipos de cuantización | fp32, fp16 (ONNX); no se publica int8 por pérdida de calidad (coseno medio 0,94 frente a fp32) |
| Idiomas soportados | en, hi, bn, ta, te, mr, gu, kn, ml, pa, ur |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (fp32 564 MB, fp16 282 MB) |

## Arquitectura y entrenamiento

El modelo parte de jhu-clsp/mmBERT-small, un encoder transformer de tipo ModernBERT orientado a lenguas multilingües, y añade una cabeza de proyección que transforma los estados de token en un vector de frase de 1024 dimensiones normalizado en L2. La innovación principal no está en la arquitectura sino en el objetivo de destilación: se entrena para que las entradas romanizadas y las nativas se mapeen al embedding del profesor (BAAI/bge-m3) de la frase nativa, y para que las entradas en lenguas indias se mapeen al embedding del profesor de su traducción al inglés. De este modo se alinean tres representaciones (romanizada, nativa y traducción inglesa) en un mismo espacio.

El entrenamiento se realizó en tres rondas, con selección de hiperparámetros y del checkpoint final sobre los splits de desarrollo. Los conjuntos de evaluación (Dakshina, FLORES y STS) están completamente reservados: ninguna frase de sus splits de test o desarrollo se usó en entrenamiento, con una excepción menor documentada en la sección de STS. No se especifica en la información disponible el número total de tokens de entrenamiento ni la composición exacta del dataset. El modelo no requiere prefijo ni instrucción en la inferencia, y se ha validado con sentence-transformers 5.1.2 (transformers 4.57.6) y 6.3.0 (transformers 5.24.0), obteniendo los mismos vectores en ambas versiones.

## Capacidades

- Generación de embeddings de frase de 1024 dimensiones, normalizados en L2, para similitud coseno.
- Alineación cross-lingual entre escritura nativa, romanización y traducción al inglés en las diez lenguas indias cubiertas.
- Recuperación de documentos en escritura nativa mediante consultas romanizadas, y viceversa, sin transliteración previa.
- Manejo de código mixto (hinglish y variantes equivalentes en otras lenguas), frecuente en conversación informal.
- Feature extraction para búsqueda semántica, clustering y deduplicación de textos multilingües.
- Ejecución en navegador y Node mediante transformers.js con los pesos ONNX incluidos (fp32 y fp16).
- Compatibilidad con text-embeddings-inference y endpoints compatibles.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un encoder de embeddings, no un modelo generativo.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Búsqueda semántica en bases documentales en escritura nativa con consultas de usuarios romanizadas: el modelo sitúa "kal meeting cancel ho gayi" a coseno 0,90 de "कल मीटिंग कैंसल हो गई", lo que permite indexar corpus en devanagari, bengalí o tamil y atender consultas tecleadas en caracteres latinos sin capa de transliteración.
- Atención al cliente en chat para el mercado indio: los usuarios escriben en hinglish o en romanizaciones informales; el modelo recupera la respuesta o el artículo de ayuda correcto del corpus en escritura nativa o en inglés con recall@1 superior al 99 % en la tarea romanizado ↔ nativo.
- Deduplicación y clustering de tickets de soporte: al alinear romanizado, nativo e inglés, se pueden agrupar incidencias equivalentes escritas de formas distintas por usuarios de distintas regiones.
- Moderación de contenido y clasificación de texto multilingüe: los embeddings sirven como features para clasificadores ligeros sobre mensajes en diez lenguas indias más inglés, con un encoder de solo 140M parámetros.
- Búsqueda en aplicaciones web y móviles del lado del cliente: los pesos ONNX fp16 (282 MB) se ejecutan con transformers.js en navegador o Node, permitiendo búsqueda semántica local sin enviar texto a un servidor.
- Sistemas de recomendación de contenido multilingüe: similitud entre artículos, vídeos o productos descritos en distintas lenguas y alfabetos, usando un único espacio vectorial de 1024 dimensiones.
- Construcción de índices RAG para asistentes que operan sobre documentación en inglés pero reciben preguntas en lenguas indias romanizadas, gracias a la alineación con la traducción inglesa.

## Benchmarks y rendimiento

Todos los conjuntos son held-out. Recall@1 promediado en ambas direcciones y en las diez lenguas; STS es Spearman × 100.

| Modelo | Parámetros | Romanizado ↔ nativo (Dakshina) | Inglés ↔ indio (FLORES) | Inglés ↔ indio romanizado (FLORES) | STS inglés ↔ indio | STS inglés |
|---|---|---|---|---|---|---|
| **altslate/indic-embed-small** | 140M | **0,993** | 0,999 | **0,996** | 53,0 | 80,0 |
| l3cube-pune/indic-sentence-similarity-sbert | 237M | 0,824 | 0,996 | 0,652 | 56,3 | **85,3** |
| BAAI/bge-m3 (profesor) | 568M | 0,608 | 0,999 | 0,413 | 53,2 | 84,8 |
| sentence-transformers/LaBSE | 471M | 0,507 | **1,000** | 0,423 | **56,5** | 72,2 |
| intfloat/multilingual-e5-small | 118M | 0,479 | 0,996 | 0,286 | 42,4 | 83,4 |
| paraphrase-multilingual-MiniLM-L12-v2 | 118M | 0,076 | 0,474 | 0,112 | 22,5 | 84,3 |

Recall@1 romanizado ↔ nativo por lengua (Dakshina test, 1000 frases por lengua):

| Modelo | hi | bn | ta | te | mr | gu | kn | ml | pa | ur |
|---|---|---|---|---|---|---|---|---|---|---|
| **este modelo** | **1,00** | **0,99** | **0,99** | **0,99** | **1,00** | **1,00** | **1,00** | **1,00** | **0,99** | **0,99** |
| l3cube indic sbert | 0,97 | 0,69 | 0,62 | 0,83 | 0,90 | 0,87 | 0,78 | 0,85 | 0,89 | 0,85 |
| bge-m3 | 0,69 | 0,65 | 0,47 | 0,59 | 0,63 | 0,58 | 0,52 | 0,56 | 0,65 | 0,74 |

En fidelidad de cuantización, el ONNX fp32 coincide con PyTorch (coseno 1,0000 en todas las frases de prueba) y el fp16 alcanza un coseno medio de 0,99997 (mínimo 0,9996). La cuantización dinámica int8 se descartó (coseno medio 0,94 frente a fp32).

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,6 GB de pesos más activaciones para lotes de 128 tokens; en fp16, aproximadamente 0,3 GB.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para cargas moderadas.
- GPU recomendadas para servicio de alta concurrencia: A100, H100 o L4 para lotes grandes; el modelo es lo bastante pequeño como para que la latencia esté dominada por el tokenizador y el overhead de red en muchos despliegues.
- Despliegue con sentence-transformers, text-embeddings-inference (endpoints compatibles), ONNX Runtime y transformers.js (navegador y Node).
- El archivo ONNX fp16 de 282 MB permite ejecución en cliente; el fp32 de 564 MB es la referencia exacta frente a PyTorch.
- No se han publicado cifras de latencia ni throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Romanizado ↔ nativo | STS inglés ↔ indio | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| altslate/indic-embed-small | 140M | 128 tokens | 0,993 | 53,0 | Apache 2.0 | HF, ONNX, transformers.js |
| l3cube-pune/indic-sentence-similarity-sbert | 237M | no disponible | 0,824 | 56,3 | no disponible en la información | HF |
| BAAI/bge-m3 | 568M | no disponible en la información | 0,608 | 53,2 | no disponible en la información | HF |
| sentence-transformers/LaBSE | 471M | no disponible | 0,507 | 56,5 | no disponible en la información | HF |
| intfloat/multilingual-e5-small | 118M | no disponible | 0,479 | 42,4 | no disponible en la información | HF |

Frente a alternativas más grandes, indic-embed-small gana de forma clara en la tarea específica de romanizado ↔ nativo (0,993 frente a 0,824 del siguiente mejor) y en inglés ↔ indio romanizado (0,996 frente a 0,652), con un coste de parámetros mucho menor. En cambio, queda por detrás en STS inglés ↔ indio (53,0 frente a 56,3 de l3cube y 56,5 de LaBSE) y en STS inglés (80,0 frente a 85,3 de l3cube), lo que refleja el compromiso del entrenamiento hacia la alineación romanizada.

## Limitaciones y advertencias

- Ventana de contexto de solo 128 tokens: los textos más largos se truncan, lo que puede degradar la recuperación de documentos extensos si no se segmentan previamente.
- Rendimiento inferior en STS inglés ↔ indio y en STS inglés comparado con encoders más grandes; no es la mejor opción si la tarea principal es similitud semántica fina en inglés.
- No se publica información sobre sesgos demográficos, geográficos o de género; la evaluación se limita a recall y STS, sin análisis de sesgo.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos en recuperación: la alta alineación romanizado ↔ nativo puede producir similitudes altas entre frases superficialmente parecidas pero semánticamente distintas.
- La cuantización int8 no está soportada por pérdida de calidad; quien necesite menos de 282 MB deberá asumir fp16 o recurrir a otra alternativa.
- No debe usarse la pipeline `feature-extraction` de transformers: haría mean-pooling de los estados de 384 dimensiones y omitiría la cabeza de proyección, produciendo vectores incorrectos. Hay que leer la salida `sentence_embedding`.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base jhu-clsp/mmBERT-small y del profesor bge-m3 si se redistribuyen derivados.
- Cobertura limitada a once idiomas; no se ha evaluado en otras lenguas indias ni en variedades dialectales no representadas en Dakshina o FLORES.
- El modelo se publicó con 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación independiente de la comunidad sobre los resultados reportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/altslate/indic-embed-small
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Profesor de destilación: https://huggingface.co/BAAI/bge-m3
- Alternativa comparada: https://huggingface.co/l3cube-pune/indic-sentence-similarity-sbert
- Alternativa comparada: https://huggingface.co/sentence-transformers/LaBSE
- Alternativa comparada: https://huggingface.co/intfloat/multilingual-e5-small
- Alternativa comparada: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Dataset Dakshina: https://github.com/google-research-datasets/dakshina
