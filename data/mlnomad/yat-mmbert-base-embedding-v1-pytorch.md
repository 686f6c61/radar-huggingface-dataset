# mlnomad/yat-mmbert-base-embedding-v1-pytorch

## Resumen

El modelo mlnomad/yat-mmbert-base-embedding-v1-pytorch es la conversión a PyTorch de YAT mmBERT base embedding v1, un encoder de 307.786.240 parámetros fine-tuned para recuperación de información en inglés y multilingüe, así como para búsqueda de código. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos que mantiene la arquitectura original basada en atención bidireccional YAT y capas feed-forward YAT GLU. Lo desarrolla el usuario mlnomad y se publica bajo licencia MIT.

El modelo resuelve tareas de representación densa de frases y documentos, generando embeddings normalizados que pueden usarse para búsqueda semántica, recuperación en pipelines RAG y similitud entre textos. Su relevancia radica en ofrecer una implementación en PyTorch de un encoder que en su versión original estaba en JAX, facilitando su integración en entornos de producción basados en PyTorch. Incluye un loader personalizado (`yat_encoder.py`) y no es compatible con `transformers.AutoModel`.

La longitud de contexto empleada durante el entrenamiento fue de 128 tokens para consultas y 256 para documentos, aunque no se especifica una ventana máxima validada para entradas más largas. El modelo hereda pesos de mmBERT y YAT anteriores, por lo que no es un reemplazo desde cero de mmBERT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer con atención bidireccional YAT y capas feed-forward YAT GLU |
| Parametros totales | 307.786.240 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | Entrenado con consultas truncadas a 128 tokens y documentos a 256; longitud máxima no especificada |
| Tipos de cuantizacion | no disponible (pesos en BF16, safetensors) |
| Idiomas soportados | Multilingüe (incluye inglés; 18 idiomas en MIRACL) |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

Se trata de un encoder transformer que implementa atención bidireccional YAT y capas feed-forward YAT GLU con sesgo fijo 1, épsilon fijo 0.01 y parámetros alpha entrenados. La aritmética de características y distancias se realiza en BF16, mientras que los residuales y las puntuaciones de atención se mantienen en FP32. El repositorio incluye un cargador personalizado en PyTorch (`yat_encoder.py`) y no es un checkpoint de `transformers.AutoModel`.

El fine-tuning se orientó a recuperación en inglés y multilingüe, además de búsqueda de código. Se utilizaron pares de CodeSearchNet durante el ajuste, con consultas truncadas a 128 tokens y documentos a 256. El modelo hereda pesos de mmBERT y YAT anteriores, y la conversión a PyTorch no implica un entrenamiento adicional. Para lotes de distinta longitud, se debe rellenar con el token ID 0; el pooling promedia los estados de tokens no rellenos, incluyendo tokens especiales.

## Capacidades

- Generación de embeddings de frases para recuperación de información (information retrieval).
- Búsqueda de código (code-search) y recuperación de documentos técnicos.
- Soporte multilingüe para recuperación en 18 idiomas según MIRACL.
- No es un modelo generativo: no produce texto, solo representaciones vectoriales normalizadas.
- No soporta tool calling, function calling ni agentes.
- No tiene capacidades de visión, audio ni modo thinking.
- Adecuado para similitud semántica, clustering y deduplicación de textos.

## Casos de uso

- Búsqueda semántica en documentación técnica: indexar documentos con embeddings y recuperar los más relevantes para una consulta. Es adecuado por su entrenamiento específico en recuperación multilingüe y su buen rendimiento en MTEB.
- Búsqueda de código en repositorios: generar embeddings de fragmentos de código y consultas en lenguaje natural para encontrar implementaciones similares. El modelo fue fine-tuned con pares de CodeSearchNet.
- Recuperación aumentada por generación (RAG): usar el modelo como retriever en pipelines RAG, aprovechando su capacidad multilingüe y de código para seleccionar pasajes relevantes.
- Deduplicación de documentos: calcular similitud coseno entre embeddings para identificar duplicados en grandes corpus. Su pooling promedia tokens no rellenos, lo que permite comparar documentos de distinta longitud.
- Clustering de noticias o artículos: agrupar documentos por temática usando sus embeddings. La representación densa facilita algoritmos como k-means sobre vectores normalizados.
- Sistemas de recomendación basados en contenido: representar ítems textuales y preferencias de usuario para recomendar artículos similares. El modelo soporta entradas multilingües.
- Clasificación zero-shot por similitud: comparar el embedding de una consulta con los embeddings de etiquetas descriptivas para asignar categorías sin entrenamiento adicional.
- Moderación de contenido: detectar similitud con ejemplos prohibidos mediante la distancia coseno entre embeddings.

## Benchmarks y rendimiento

Los siguientes resultados corresponden al checkpoint original en JAX, evaluado en un chip físico TPU v5e, no a una benchmark independiente de la conversión a PyTorch. La paridad de conversión se registra en `parity.json` y los hashes exactos en `conversion.json`.

| Benchmark | Puntuación |
|---|---:|
| English MTEB v2, 41 tareas, media de siete categorías | 52.78 |
| Multilingual MTEB v2, 131 tareas, media de ocho categorías | 48.21 |
| CoIR, media de diez tareas | 43.45 |
| MIRACL hard-negative, media de 18 idiomas | 46.37 |

En la verificación de conversión, con ocho entradas (inglés, multilingüe y código) a 128 tokens en un TPU v5e, se obtuvo un coseno mínimo de vectores agrupados de 0.999960, un 100% de acuerdo top-1 y top-3 dentro de ese lote de ocho ítems, y una deriva máxima de la puntuación coseno por pares de 0.003854 frente a la fuente JAX. Estas son comprobaciones de conversión, no una equivalencia completa de benchmarks ni una medición de latencia; las coordenadas individuales agrupadas difirieron hasta 0.06483.

El modelo mejoró la recuperación respecto a su checkpoint contrastivo anterior, pero empeoró en Tatoeba cross-language de 52.72 a 35.27. Además, se usaron pares de CodeSearchNet para el fine-tuning, por lo que los resultados de CoIR de la familia CodeSearchNet requieren una auditoría de solapamiento entre entrenamiento y evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0.6 GB para los pesos en BF16 (307.786.240 parámetros × 2 bytes). Con overhead de activaciones y pooling, se recomienda al menos 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. No se especifican modelos concretos en la información disponible.
- Cabe en GPU de consumo: sí, en tarjetas como GTX 1650, RTX 3050 o superiores. También puede ejecutarse en CPU.
- Opciones de despliegue: requiere un cargador personalizado en PyTorch (`yat_encoder.py`); no es compatible de forma nativa con vLLM, llama.cpp, Ollama o TGI. Se puede exportar manualmente a ONNX o TorchScript.
- Latencia y throughput: no disponibles. El fallback denso en BF16 favorece la paridad sobre la velocidad de servicio, por lo que se recomienda medir la latencia antes de usarlo en producción.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. La única comparación directa posible es con el modelo base del que deriva esta conversión.

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| mlnomad/yat-mmbert-base-embedding-v1-pytorch | 307.786.240 | Entrenado con 128/256 tokens | MIT | safetensors (PyTorch) |
| mlnomad/yat-mmbert-base-embedding-v1 (modelo base) | 307.786.240 | Entrenado con 128/256 tokens | MIT | JAX |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo generativo: solo produce embeddings, no texto.
- No soporta tool calling, function calling ni flujos de agentes.
- La longitud de contexto validada durante el entrenamiento es de 128 tokens para consultas y 256 para documentos; el rendimiento en entradas más largas no está verificado.
- Se observó una regresión en Tatoeba cross-language (de 52.72 a 35.27) respecto al checkpoint anterior.
- Los resultados de CoIR en la familia CodeSearchNet pueden estar contaminados por solapamiento entre entrenamiento y evaluación; se requiere auditoría.
- Hereda pesos de mmBERT y YAT anteriores; no es un reemplazo desde cero de mmBERT.
- Requiere un cargador personalizado y no es compatible con `transformers.AutoModel`, lo que complica la integración con herramientas estándar.
- El pooling promedia tokens no rellenos, incluyendo tokens especiales, lo que puede afectar a la representación final.
- El fallback denso en BF16 prioriza la paridad sobre la velocidad; se debe medir la latencia antes de desplegarlo en producción.
- La licencia MIT permite uso comercial, pero no se especifica la procedencia de los datos de entrenamiento ni posibles sesgos.
- No se han publicado datos sobre sesgos, alucinación (no aplica al no ser generativo) ni restricciones idiomáticas más allá de las métricas multilingües.

## Enlaces

- https://huggingface.co/mlnomad/yat-mmbert-base-embedding-v1-pytorch
- https://huggingface.co/mlnomad/yat-mmbert-base-embedding-v1
