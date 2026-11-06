# brunoramos09/game-similarity-bge-small

## Resumen

`game-similarity-bge-small` es un modelo de embeddings de frases obtenido mediante fine-tuning de `BAAI/bge-small-en-v1.5` sobre pares de videojuegos similares extraidos de IGDB. Lo publica el usuario independiente brunoramos09 y su proposito es recuperar juegos parecidos a partir de texto descriptivo (nombre, generos, temas y resumen). El modelo tiene 33,36 millones de parametros, arquitectura BERT de tipo encoder y un contexto de entrenamiento de 256 tokens.

Su interes no reside en el rendimiento, sino en su valor como caso documentado de fallo metodologico: el autor declara explicitamente que el fine-tuning no funciono como esperaba y que el modelo base o un embedding comercial obtuvieron mejores resultados en su evaluacion con consultas humanas. El modelo mejoro de forma notable la prediccion de las listas de IGDB (precision@5 de 0,074 frente a 0,015 del base) pero empeoro en el conjunto dorado escrito a mano (0,020 frente a 0,053), lo que ilustra como un dataset de entrenamiento ruidoso puede desplazar el modelo hacia la reproduccion de ese ruido.

Es relevante ahora como referencia practica para quien disene pipelines de recomendacion o fine-tuning de embeddings: demuestra que una metrica de validacion derivada de la misma fuente que los datos de entrenamiento puede ocultar una perdida de calidad real en el uso previsto. La licencia MIT y el formato safetensors facilitan su inspeccion y reproduccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base: BAAI/bge-small-en-v1.5) |
| Parametros totales | 33.360.000 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (longitud de entrenamiento; el modelo base soporta hasta 512) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; compatible con cuantizacion a int8/fp16 via herramientas estandar, no documentado por el autor) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria sentence-transformers) |

## Arquitectura y entrenamiento

El modelo parte de `BAAI/bge-small-en-v1.5`, un encoder BERT de 12 capas y 33,36 millones de parametros especializado en embeddings de frases, y se afina con `MultipleNegativesRankingLoss`, batch size 64 y learning rate 2e-5 durante 3 epocas. La seleccion de epocas se hizo sobre un conjunto de validacion de juegos excluidos del entrenamiento. Los datos son 24.048 pares de juegos extraidos de las listas de "juegos similares" de IGDB, descartando pares de la misma franquicia o de versiones del mismo titulo. El texto de entrada combina nombre, generos, temas y resumen, truncado a 256 tokens.

La innovacion tecnica no esta en la arquitectura, sino en la metodologia de evaluacion: el autor reservo un conjunto de juegos de test, un conjunto dorado de consultas escritas a mano y los juegos esperados, y calculo precision@5 sobre un catalogo de 31.749 juegos con intervalos bootstrap al 95 %. El resultado revela un desajuste entre la distribucion de entrenamiento (listas de IGDB, con ruido como incluir Outlast y Alien: Isolation entre los similares de Portal) y el juicio humano. El modelo aprendio a replicar el ruido del etiquetado en lugar de la nocion subyacente de similitud entre juegos.

## Capacidades

- Generacion de embeddings de frases para similitud semantica y recuperacion densa (sentence-similarity).
- Busqueda de videojuegos similares a partir de texto descriptivo en ingles.
- Indexacion y recuperacion sobre catalogos de hasta decenas de miles de titulos (evaluado con 31.749 juegos).
- Compatible con Text Embeddings Inference (tag `text-embeddings-inference`) y con endpoints compatibles.
- Integrable en pipelines de sentence-transformers para calculo de similitud coseno.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un encoder, no un modelo generativo.
- Capacidad multilingue: solo ingles.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Recomendacion de videojuegos en catalogo cerrado: indexar los embeddings de todos los titulos y recuperar los k mas cercanos al embedding de un juego consultado. Adecuado por su bajo coste computacional (33 M de parametros) y su rendimiento medido sobre 31.749 juegos, aunque conviene validar la calidad con consultas humanas antes de produccion.
- Busqueda semantica en tiendas o bases de datos de juegos: permitir consultas en lenguaje natural ("juego de exploracion espacial con gestion de recursos") y devolver titulos por similitud vectorial.
- Filtrado y deduplicacion de catalogos: detectar fichas de juegos casi identicas o versiones solapadas comparando embeddings con umbral de similitud coseno.
- Baseline en experimentos de fine-tuning de embeddings: sirve como referencia documentada de un caso donde el ajuste empeora la metrica humana, util para disenar protocolos de evaluacion con conjuntos dorados independientes.
- Clasificacion y agrupamiento tematico: usar los embeddings como caracteristicas para clustering de generos o temas en analisis de mercado.
- Prototipado rapido en CPU: con 33 M de parametros y pesos safetensors de ~0,1 GB, se puede desplegar en entornos sin GPU para pruebas de concepto de recuperacion semantica.
- Sistema de etiquetado asistido: sugerir etiquetas de similitud para curacion editorial, siempre con revision humana dado el ruido aprendido del dataset.

## Benchmarks y rendimiento

Precision@5 sobre el mismo catalogo de 31.749 juegos, con intervalos bootstrap al 95 %:

| Modelo | Conjunto dorado manual (30 juegos) | Listas de test de IGDB (3.000 juegos) |
|---|---|---|
| `bge-small-en-v1.5` (base) | 0,053 (0,020 a 0,093) | 0,015 (0,013 a 0,017) |
| **Este modelo** | **0,020 (0,000 a 0,047)** | **0,074 (0,069 a 0,078)** |
| `voyage-4-lite` (produccion) | 0,127 (0,067 a 0,187) | 0,036 (0,033 a 0,040) |

El autor senala que la caida frente al modelo de produccion en el conjunto dorado queda fuera del margen de error (intervalo 0,060 a 0,160). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, lo cual es esperable en un modelo de embeddings.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (33,36 M de parametros, ~134 MB de pesos); ~70 MB en fp16 y ~35 MB en int8.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 4090 o A100 quedan sobredimensionadas para este modelo. Una GTX 1650 o incluso CPU son viables.
- Cabe en cualquier GPU consumer y en CPU. El repo ocupa 0,1 GB.
- Opciones de despliegue: sentence-transformers (nativo), Text Embeddings Inference (tag `text-embeddings-inference`), ONNX Runtime y contenedores de inferencia compatibles con endpoints.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por tamano, se espera un throughput alto en CPU y muy alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision@5 (dorado) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `game-similarity-bge-small` | 33,36 M | 256 tokens | 0,020 | MIT | Hugging Face |
| `BAAI/bge-small-en-v1.5` | 33,36 M | 512 tokens | 0,053 | MIT | Hugging Face |
| `voyage-4-lite` | no disponible | no disponible | 0,127 | comercial (API) | API de Voyage AI |

El modelo base supera a este fine-tuning en el conjunto dorado y es la alternativa directa recomendada por el propio autor. `voyage-4-lite` es un modelo comercial de embeddings con mejor precision en consultas humanas, aunque con coste por uso y sin pesos abiertos. No se dispone de datos de otros modelos de embeddings especializados en videojuegos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo procesa texto en ingles; no se evaluo en otros idiomas ni en otros catalogos distintos del de 31.749 juegos.
- Riesgo de reproducir el ruido de las listas de IGDB: el modelo aprendio asociaciones discutibles (el autor cita Outlast y Alien: Isolation como similares de Portal en los datos de origen).
- Peor rendimiento que el modelo base en consultas humanas (0,020 frente a 0,053 en el conjunto dorado), con intervalo que incluye el cero; no es apto para produccion sin validacion adicional.
- El conjunto dorado tiene solo 30 juegos y fue redactado con asistencia de IA, lo que limita la potencia estadistica de la evaluacion.
- Contexto de entrenamiento de 256 tokens: los resumenes mas largos se truncan y pueden perder informacion relevante.
- Sesgos conocidos: no documentados por el autor; al entrenarse sobre un catalogo concreto, puede infrarepresentar generos o regiones poco presentes en IGDB.
- Licencia MIT permite uso comercial, pero el autor desaconseja su uso en produccion por los resultados de evaluacion.
- No es un modelo generativo: no produce texto, solo vectores; no sirve para tareas de generacion, razonamiento o codigo.
- Para despliegue en produccion, el autor sugiere el modelo base o un embedding comercial, y propone como siguiente paso entrenar con pares mas limpios (listas de usuarios o juegos jugados por los mismos usuarios).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brunoramos09/game-similarity-bge-small
- Repositorio de evaluacion en GitHub: https://github.com/brunoramos09/game-similarity
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
