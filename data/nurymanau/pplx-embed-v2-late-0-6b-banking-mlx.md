# Nurymanau/pplx-embed-v2-late-0.6b-BANKING-MLX

## Resumen

Nurymanau/pplx-embed-v2-late-0.6b-BANKING-MLX es un checkpoint de recuperación por late interaction (estilo ColBERT, con MaxSim) obtenido por fine-tuning completo de los 493.859.776 parámetros de texto del modelo perplexity-ai/pplx-embed-v2-late-0.6b, un modelo de aproximadamente 0,6 B de parámetros con backbone etiquetado como qwen3_5. Lo desarrolla el usuario independiente Nurymanau y se publica como trabajo no oficial, sin afiliación ni respaldo de Perplexity. Su propósito concreto es mejorar la recuperación de ejemplos de intención sobre el dominio bancario representado por el dataset PolyAI/banking77.

El modelo genera embeddings de token y aplica MaxSim para puntuar pares consulta-documento, ejecutándose sobre un runtime MLX propio (no es un checkpoint compatible con mlx_lm ni con Sentence Transformers, y la inferencia no importa ni Torch ni Transformers). Está pensado para Apple Silicon: el repositorio ocupa 1,2 GB y el fichero de pesos 1.189.337.803 bytes. Los pesos de visión se preservan del modelo base, pero la calidad de imagen tras el entrenamiento no está validada.

Su relevancia actual es doble: por un lado documenta una receta de fine-tuning completo frente a adaptadores ligeros con resultados medidos (nDCG@10 del 89,49 % frente al 77,74 % del adaptador y al 74,05 % del base en el test de recuperación de intenciones); por otro, es un ejemplo reproducible de entrenamiento y evaluación de un retriever late-interaction en hardware Apple, con un coste estimado de alquiler de GPU de 0,925 dólares para entrenamiento, evaluación y rescate.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Late interaction (ColBERT, similitud MaxSim) sobre backbone etiquetado qwen3_5; incluye proyección aprendida |
| Parámetros totales | 493.859.776 parámetros de texto (12 capas de texto); el total incluyendo visión no está disponible |
| Parámetros activos | No aplica (no se describe como modelo MoE) |
| Longitud de contexto | Consulta de hasta 1.024 tokens y documento de hasta 4.096 tokens por llamada; las entradas sobredimensionadas se rechazan |
| Tipos de cuantización | FP16 nativo en MLX (test principal) y FP32 en CUDA (evaluación cruzada en NanoSciFact); no se documentan GGUF, AWQ ni GPTQ |
| Idiomas soportados | Inglés (en) |
| Licencia | Pesos MIT (WEIGHTS_LICENSE.txt); runtime Apache-2.0; datos de entrenamiento BANKING77 CC BY 4.0 |
| Formato de pesos | safetensors dentro de un runtime MLX propio (`pplx_mlx.cli`); fichero de pesos de 1.189.337.803 bytes |
| Modelo base | perplexity-ai/pplx-embed-v2-late-0.6b (revisión 8fc2de24534aa3610d85fa59c463313a5f096455) |
| Relación con el base | Fine-tuning completo (todos los parámetros de texto) |
| Pipeline | feature-extraction |
| Plataforma | Apple Silicon con MLX (probado con Python 3.12 y MLX 0.32.3) |

## Arquitectura y entrenamiento

Se trata de un retriever de interacción tardía: en lugar de un único vector por texto, produce embeddings a nivel de token y calcula la puntuación con MaxSim, el esquema característico de la familia ColBERT. El repositorio describe "embeddings nativos de token y recuperación MaxSim" y una proyección aprendida que forma parte del checkpoint; el autor advierte explícitamente de que no debe añadirse el adaptador P6 por separado. Los pesos de visión se conservan del modelo base, aunque su calidad tras el entrenamiento no ha sido validada y la variante estudiante de seis capas carece de soporte de imagen. La inferencia se realiza con un runtime MLX a medida que no importa Torch ni Transformers.

El entrenamiento consistió en fine-tuning completo de las 12 capas de texto sobre datos derivados de BANKING77 (PolyAI, CC BY 4.0, Casanueva et al., 2020), con 1.232 consultas y 154 ejemplares de entrenamiento, y un conjunto de desarrollo separado de 308 consultas y 154 documentos. La búsqueda de receta cubrió dos semillas, dos tasas de aprendizaje y tres épocas por brazo, con selección basada únicamente en el conjunto de desarrollo. No se documentan fases de RLHF ni de DPO, ni el número de tokens de preentrenamiento del modelo original ni la composición de su dataset; la contaminación del preentrenamiento upstream es desconocida según la model card. Este repositorio de variante única reempaqueta bytes idénticos a los publicados en Nurymanau/pplx-embed-v2-late-0.6b-MLX, con PROVENANCE.json y SHA256SUMS.json, y sin entrenamiento adicional durante el reempaquetado.

## Capacidades

- Recuperación semántica densa mediante late interaction y MaxSim, orientada a pares consulta-documento en inglés.
- Indexación y búsqueda de documentos mediante el CLI del runtime (`index` y `search`), con índices reconstruidos cuando cambia el modelo.
- Fine-tuning especializado en intenciones bancarias: recuperación de ejemplares de intención del espacio BANKING77.
- Extracción de características (pipeline feature-extraction) para alimentar sistemas de RAG o clasificadores posteriores.
- Procesamiento de una entrada sin padding por llamada, con límites estrictos de 1.024 tokens para consultas y 4.096 para documentos.
- Soporte de tool calling, function calling, agentes, razonamiento multi-paso, generación de texto y matemáticas: no aplica; es un modelo de embeddings, no generativo.
- Capacidades multimodales: los pesos de visión se preservan, pero la calidad de imagen tras el entrenamiento no está validada y la variante estudiante no soporta imagen.
- Multilingüismo: no disponible; solo se declara inglés.

## Casos de uso

- Enrutado de tickets de banca: indexar los ejemplares de intención de BANKING77 y recuperar el más próximo a la consulta del cliente para asignar cola o categoría. El modelo fue entrenado precisamente sobre este espacio, con un Hit@1 del 87,01 % en el test de recuperación de intenciones reportado.
- Búsqueda semántica en bases de conocimiento de productos bancarios: indexar fichas de producto, condiciones y preguntas frecuentes (chunks de hasta 4.096 tokens) y resolver consultas de hasta 1.024 tokens con puntuación MaxSim.
- Recuperación para RAG en atención al cliente: usar los documentos recuperados como contexto para un LLM generativo en inglés, reduciendo el corpus que se envía al modelo de generación.
- Deduplicación y agrupación de consultas repetidas: comparar embeddings de token de consultas entrantes para detectar duplicados o casi duplicados antes de crear incidencias.
- Evaluación comparativa de recetas de fine-tuning: el repositorio publica resultados de base, adaptador ligero, fine-tuning completo y estudiante de seis capas, lo que permite reproducir el protocolo (770 consultas, 154 documentos, 77 intenciones) como banco de pruebas.
- Prototipado y experimentación en Apple Silicon: el CLI del runtime MLX permite construir un índice local y consultarlo en un Mac sin GPU dedicada, útil para demos internas y validación de conceptos.
- Segunda fase de ranking en pipelines de búsqueda: al operar sobre representaciones por token, puede usarse para reordenar candidatos recuperados por un retriever más barato, siempre que el idioma del corpus sea inglés.
- Construcción de datasets de entrenamiento: recuperar ejemplares de intención similares para anotación asistida o ampliación de conjuntos etiquetados.

## Benchmarks y rendimiento

Test de recuperación de ejemplares de intención sobre BANKING77: 770 consultas, 154 documentos y 77 intenciones, en MLX FP16 nativo. El autor aclara que no es el benchmark oficial de clasificación BANKING77 ni una medida de exactitud de respuesta.

| Variante | nDCG@10 | Hit@1 | Recall@10 |
|---|---:|---:|---:|
| Base original | 74,05 % | 70,91 % | 84,87 % |
| Base + adaptador pequeño | 77,74 % | 74,55 % | 87,86 % |
| Fine-tuning completo de texto (este checkpoint) | 89,49 % | 87,01 % | 95,26 % |
| Estudiante de seis capas | 81,79 % | 78,83 % | 91,30 % |

Significación reportada: la comparación entre fine-tuning completo y profesor adaptado supone +11,75 puntos porcentuales de nDCG, con intervalo de confianza del 95 % por bootstrap pareado sobre 77 intenciones de [+9,20, +14,53]; el estudiante suma +4,05 puntos, con IC [+1,53, +6,67]. El autor advierte de que se miden recetas completas y que no existe un control con solo la cabeza para aislar la contribución de las capas internas.

Verificación cruzada de dominio con NanoSciFact (FP32 en CUDA, 40 consultas y 2.919 documentos):

| Variante | nDCG@10 |
|---|---:|
| Profesor adaptado | 85,81 % |
| Fine-tuning completo | 84,62 % |
| Estudiante de seis capas | 66,05 % |

En esa prueba se reporta una caída de Hit@1 del 80 % al 75 % y un Recall@10 estable en el 92,5 %. No se ejecutó una prueba NanoSciFact nativa en MLX para los modelos recién entrenados, y el autor indica que el estudiante no es un reemplazo genérico.

Latencia: mediana en caliente de 26,16 ms para el estudiante frente a 48,04 ms para el profesor sobre ocho entradas fijas de desarrollo en un Mac M3 con 16 GB (aproximadamente 1,84×). Son dos calentamientos y siete pasadas medidas; el propio autor señala que es un fixture de latencia pequeño y no throughput de aplicación. El estudiante tiene un 24,2 % menos de parámetros de texto y un fichero un 37,1 % más pequeño, que además omite visión. Coste estimado de alquiler de GPU para entrenamiento, evaluación y rescate: 0,925 dólares, sin almacenamiento ni R2.

## Requisitos de hardware

- VRAM o memoria unificada estimada: el fichero de pesos ocupa 1.189.337.803 bytes (unos 1,19 GB), por lo que en FP16 el modelo requiere ese tamaño más el overhead del runtime y del índice; no se publican requisitos mínimos oficiales.
- Hardware validado: Mac con Apple Silicon M3 y 16 GB de memoria unificada, con Python 3.12 y MLX 0.32.3.
- GPU CUDA: la verificación cruzada en NanoSciFact se hizo en FP32 sobre CUDA, pero no se especifica el modelo de GPU empleado.
- GPU de entrenamiento: no disponible; solo se informa del coste estimado de alquiler (0,925 dólares) para el ciclo completo.
- Opciones de despliegue: exclusivamente el runtime MLX propio del repositorio (`PYTHONPATH=code python -m pplx_mlx.cli --model . index|search`). No es compatible con vLLM, llama.cpp, Ollama, TGI ni Sentence Transformers, y no se ofrecen pesos GGUF.
- Restricciones operativas: una entrada sin padding por llamada, rechazo de consultas de más de 1.024 tokens y documentos de más de 4.096 tokens, y recomendación de evitar trabajos de modelo en paralelo en Macs con poca memoria.
- Latencia: 48,04 ms de mediana en caliente para el profesor y 26,16 ms para el estudiante en el fixture descrito; no hay datos de throughput en producción.
- Almacenamiento: el repositorio completo, incluida la carpeta `code/`, debe descargarse (1,2 GB declarados en HuggingFace).

## Comparativa con modelos similares

No se dispone de especificaciones detalladas de terceros comparables en la información proporcionada; la comparación se limita a las variantes del mismo linaje publicadas por el mismo autor.

| Modelo o variante | Parámetros | Contexto | nDCG@10 (BANKING) | nDCG@10 (NanoSciFact) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| perplexity-ai/pplx-embed-v2-late-0.6b (upstream) | no disponible en detalle | no disponible | no disponible | no disponible | MIT (pesos) | HuggingFace |
| Nurymanau/pplx-embed-v2-late-0.6b-MLX-fp16 (base original en MLX) | mismo checkpoint base | consulta 1.024 / documento 4.096 tokens | 74,05 % | no disponible | MIT | HuggingFace |
| Base + adaptador pequeño | mismo checkpoint base + adaptador | consulta 1.024 / documento 4.096 tokens | 77,74 % | 85,81 % | MIT | Referenciado como variante; el adaptador P6 no debe añadirse a este checkpoint |
| Este checkpoint (fine-tuning completo de texto) | 493.859.776 parámetros de texto | consulta 1.024 / documento 4.096 tokens | 89,49 % | 84,62 % | MIT | HuggingFace |
| Nurymanau/pplx-embed-v2-late-BANKING-Student6-MLX | 24,2 % menos de parámetros de texto | consulta 1.024 / documento 4.096 tokens | 81,79 % | 66,05 % | MIT | HuggingFace |

## Limitaciones y advertencias

- Modelo no oficial: trabajo independiente sin afiliación ni respaldo de Perplexity. El autor recomienda no tratarlo como referencia de la organización original.
- Solo inglés: el campo de idioma declara únicamente `en`, por lo que el rendimiento en castellano u otros idiomas no está validado.
- Alcance de la evaluación: los resultados de BANKING corresponden a un test propio de recuperación de ejemplares de intención (770 consultas, 154 documentos, 77 intenciones) y no al benchmark oficial de clasificación BANKING77 ni a una medida de exactitud de respuesta final.
- Deriva de dominio: en la verificación con NanoSciFact, el fine-tuning completo obtiene 84,62 % de nDCG@10 frente al 85,81 % del profesor adaptado, con caída de Hit@1 del 80 % al 75 %. El ajuste específico para banca puede degradar ligeramente el comportamiento fuera de dominio.
- Contaminación desconocida: se desconoce si el preentrenamiento upstream incluyó datos de los conjuntos de evaluación.
- Modalidad de imagen: los pesos de visión se preservan pero su calidad tras el entrenamiento no está validada; la variante estudiante no soporta imagen en absoluto.
- Runtime cerrado: es un runtime MLX personalizado, no un checkpoint drop-in de mlx_lm ni de Sentence Transformers, sin soporte de vLLM, llama.cpp, Ollama ni TGI, y sin pesos GGUF publicados.
- Límites de entrada estrictos: una entrada sin padding por llamada, 1.024 tokens máximo por consulta y 4.096 por documento; las entradas mayores se rechazan y el índice debe reconstruirse al cambiar de modelo.
- Rendimiento no extrapolable: las cifras de latencia provienen de ocho entradas fijas de desarrollo en un M3 con 16 GB, no de una prueba de throughput; el coste de 0,925 dólares es una estimación, no una factura.
- No hay control head-only en el experimento, por lo que la contribución atribuible a las capas internas frente a la cabeza de proyección no queda aislada.
- Advertencia de uso: al no ser un modelo generativo, el riesgo de alucinación se traslada al LLM que consuma los documentos recuperados; una recuperación errónea puede propagar contexto incorrecto.
- Tracción pública nula en la fecha de los datos: 0 descargas y 0 me gusta, lo que implica ausencia de validación independiente por parte de la comunidad.
- Licencias: los pesos son MIT y el runtime Apache-2.0, pero los datos de entrenamiento BANKING77 son CC BY 4.0 y no se redistribuye el dataset crudo; conviene revisar `DATA_LICENSE.txt`, `WEIGHTS_LICENSE.txt` y `licenses/` antes de un uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nurymanau/pplx-embed-v2-late-0.6b-BANKING-MLX
- Modelo base upstream: https://huggingface.co/perplexity-ai/pplx-embed-v2-late-0.6b
- Variante base original en MLX FP16: https://huggingface.co/Nurymanau/pplx-embed-v2-late-0.6b-MLX-fp16
- Repositorio multi-variante origen del reempaquetado: https://huggingface.co/Nurymanau/pplx-embed-v2-late-0.6b-MLX
- Estudiante de seis capas: https://huggingface.co/Nurymanau/pplx-embed-v2-late-BANKING-Student6-MLX
- Colección Apple Silicon MLX: https://huggingface.co/collections/Nurymanau/apple-silicon-mlx-ports-and-experiments-6ac9709d0628f31e0993a8f7
- Código fuente del runtime: https://github.com/Obscyra-app/pplx-embed-mlx
- Artículo del experimento: https://github.com/Obscyra-app/pplx-embed-mlx/blob/main/docs/experiment.md
- Resultados exactos: P10_README.md (referenciado en la model card, dentro del repositorio)
- Dataset BANKING77: https://huggingface.co/datasets/PolyAI/banking77
- Paper del dataset: https://arxiv.org/abs/2003.04807
