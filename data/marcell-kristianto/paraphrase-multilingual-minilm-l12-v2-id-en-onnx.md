# Marcell-Kristianto/paraphrase-multilingual-MiniLM-L12-v2-id-en-onnx

## Resumen

`Marcell-Kristianto/paraphrase-multilingual-MiniLM-L12-v2-id-en-onnx` es una distribucion ONNX INT8 con poda de vocabulario del modelo `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`, orientada especificamente a recuperacion de informacion bilingue indonesio-ingles en entornos con memoria muy limitada (contenedores de 512 MB de RAM). Lo publica el usuario Marcell-Kristianto bajo licencia Apache 2.0 y esta pensado para su uso con `fastembed` y pipelines de embeddings en produccion.

El modelo mantiene la arquitectura original de 12 capas MiniLM con 384 dimensiones ocultas, pooling por media y normalizacion L2, pero reduce el vocabulario original de 250.002 tokens (que cubria alfabetos cirilico, chino, arabe, devanagari, thai, etc.) a 83.027 subpalabras latinas, ASCII, digitos, puntuacion y subpalabras indonesias. Con ello el fichero pasa de 241 MB a 106 MB y el consumo en ONNX Runtime baja de aproximadamente 640 MB a 345 MB.

Es relevante ahora porque demuestra una tecnica practica de compresion de modelos de embeddings multilingues sin perdida medible de calidad en los idiomas objetivo: el autor reporta una paridad numerica del 100,000000 % en similitud coseno hasta 8 decimales sobre consultas en indonesio e ingles frente al modelo completo de 250k tokens. El repositorio es pequeno (0,2 GB) y tiene un uso muy bajo (26 descargas, 0 likes) en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT/MiniLM, 12 capas, 384 dimensiones ocultas, mean pooling + normalizacion L2 |
| Parametros totales | no disponible (modelo base MiniLM-L12, tamano exacto no indicado en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (ONNX) |
| Idiomas soportados | indonesio (id), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (INT8); repositorio de 0,2 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer encoder de tipo MiniLM con 12 capas y 384 dimensiones ocultas, disenado para generar embeddings de frases mediante mean pooling y normalizacion L2. La variante publicada no reentrena el modelo: aplica una poda del vocabulario SentencePiece/Unigram original de 250.002 tokens a 83.027 tokens que cubren caracteres latinos, ASCII, digitos, puntuacion y subpalabras del indonesio, y exporta los pesos a ONNX con cuantizacion INT8.

La innovacion tecnica destacable es precisamente esa poda de vocabulario combinada con INT8: reduce el fichero de 241 MB a 106 MB y el footprint en RAM de aproximadamente 640 MB a 345 MB en ONNX Runtime, manteniendo segun el autor una similitud coseno identica hasta 8 decimales (100,000000 %) en consultas de indonesio e ingles respecto al modelo completo. No se indica en la informacion disponible el numero de tokens de entrenamiento del modelo base, la composicion del dataset ni si hubo fases de RLHF o DPO; esos detalles corresponden al modelo original `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`.

## Capacidades

- Generacion de embeddings de frases y parrafos para similitud semantica y recuperacion (pipeline `feature-extraction`).
- Busqueda semantica bilingue indonesio-ingles.
- Calculo de similitud coseno entre textos de ambos idiomas.
- Extraccion de caracteristicas para downstream: clustering, deduplicacion, clasificacion por vecinos.
- Compatible con `sentence-transformers`, `fastembed` y `text-embeddings-inference`.
- Formato ONNX INT8 adecuado para inferencia en CPU y entornos con poca memoria.
- No soporta tool calling ni function calling: es un modelo de embeddings, no generativo.
- No soporta agentes ni razonamiento multi-paso.
- No tiene modo thinking, vision ni audio.
- Capacidad multilingue limitada a los dos idiomas objetivo (id, en); otros alfabetos fueron eliminados del vocabulario.

## Casos de uso

- Busqueda semantica en aplicaciones bilingues indonesio-ingles: indexar documentos en ambos idiomas y recuperar por similitud coseno con embeddings de 384 dimensiones, con un footprint de 345 MB que cabe en contenedores pequenos.
- Deduplicacion de contenidos en plataformas de noticias o foros indonesios: calcular embeddings de cada articulo y agrupar por umbral de similitud, aprovechando la paridad numerica con el modelo completo para no degradar la calidad frente a la version de 250k tokens.
- Clasificacion y clustering de tickets de soporte: generar embeddings de las consultas de usuario y alimentar un clasificador ligero o un algoritmo de clustering, ejecutable en CPU sin GPU.
- RAG en produccion con presupuesto de memoria ajustado: usar el modelo como encoder de consultas y de fragmentos de documento en un pipeline de recuperacion, desplegado con `fastembed` o `text-embeddings-inference` en instancias pequenas.
- Filtrado previo en sistemas de moderacion o recomendacion: calcular similitud entre textos y candidatos para reducir el conjunto antes de un modelo mas costoso, gracias al bajo coste de inferencia en INT8.
- Prototipado rapido en entornos de desarrollo sin GPU: al ser ONNX INT8 y de 106 MB, permite iterar localmente en portatiles y contenedores de 512 MB de RAM sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado por el autor es la paridad numerica: 100,000000 % de similitud coseno hasta 8 decimales en todas las consultas de indonesio e ingles frente al modelo completo de 250k tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal (inferencia en CPU); en GPU el modelo INT8 ocupa aproximadamente 106 MB de pesos.
- RAM estimada en ONNX Runtime: aproximadamente 345 MB (frente a ~640 MB del modelo completo).
- GPU recomendadas: no requiere GPU; cualquier GPU con al menos ~0,5 GB de memoria libre puede alojarlo.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) y en CPU convencional.
- Opciones de despliegue: ONNX Runtime, `fastembed`, `sentence-transformers`, `text-embeddings-inference` (tag `endpoints_compatible`).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Este modelo (MiniLM-L12 v2 id-en ONNX pruned) | no disponible (MiniLM-L12, 384 dim) | no disponible | id, en | Apache 2.0 | ONNX INT8 | 106 MB, ~345 MB RAM, vocabulario podado a 83.027 tokens |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | no disponible (MiniLM-L12, 384 dim) | no disponible | multilingue (50+ idiomas) | Apache 2.0 | safetensors / PyTorch | 241 MB, ~640 MB RAM, vocabulario de 250.002 tokens |
| Otros modelos de embeddings multilingues (p. ej. LaBSE, multilingual-e5) | no disponible | no disponible | multilingue | variable | variable | No comparados en la informacion disponible |

La comparativa directa solo puede establecerse con el modelo base del que deriva: misma arquitectura y dimensiones, pero el modelo original cubre mas idiomas y alfabetos a cambio de mayor tamano y consumo de memoria. No hay datos de benchmarks que permitan comparar calidad frente a otras alternativas.

## Limitaciones y advertencias

- Solo cubre indonesio e ingles: el vocabulario fue podado eliminando cirilico, chino, arabe, devanagari, thai y otros alfabetos, por lo que el rendimiento en cualquier otro idioma sera degradado o invalido.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento, solo genera embeddings.
- La paridad numerica reportada (100,000000 % de similitud coseno) la declara el autor; no hay evaluacion independiente publicada en la informacion disponible.
- Riesgo de sesgos y alucinacion: al ser un encoder de embeddings no alucina texto, pero hereda los sesgos del corpus de entrenamiento del modelo base, no documentados en esta ficha.
- Longitud de contexto no documentada: conviene verificar el limite de tokens del modelo base antes de usarlo con documentos largos.
- Uso comercial permitido por la licencia Apache 2.0, sin restricciones adicionales indicadas.
- Repositorio con muy baja adopcion (26 descargas, 0 likes) y creado en 2026: no hay historial de mantenimiento ni garantias de soporte.
- Para produccion, validar la calidad de recuperacion en el dominio concreto antes de sustituir al modelo completo.

## Enlaces

- Hugging Face: https://huggingface.co/Marcell-Kristianto/paraphrase-multilingual-MiniLM-L12-v2-id-en-onnx
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Libreria sentence-transformers: https://www.sbert.net/
- fastembed: https://github.com/qdrant/fastembed
- ONNX Runtime: https://onnxruntime.ai/
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
