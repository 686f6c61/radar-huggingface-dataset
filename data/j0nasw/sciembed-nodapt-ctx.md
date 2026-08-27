# J0nasW/sciembed-nodapt-ctx

## Resumen

SciEmbed-NoDAPT-CTX es un modelo de embeddings para documentos científicos desarrollado por Jonas W. (J0nasW) como parte del lanzamiento SciEmbed, presentado en Findings of EMNLP 2026. Se trata de un embedder de frases y párrafos basado en ModernBERT-base, con 149 millones de parámetros, que utiliza el contexto de citas bibliográficas como señal principal de entrenamiento contrastivo. Su objetivo es mejorar la representación semántica de textos científicos para tareas como búsqueda, clasificación, regresión y proximidad entre documentos.

La variante "NoDAPT" indica que se omitió la etapa de adaptación de dominio mediante MLM (domain-adaptive masked language modeling), entrenando directamente con contraste sobre el modelo base. Según la model card, esta omisión apenas afecta al rendimiento (una diferencia de ~0.1 en la métrica global) cuando se utilizan las señales de contexto de citas. El modelo acepta secuencias de hasta 512 tokens, produce embeddings de 768 dimensiones (truncables a 512, 256 o 128 mediante Matryoshka) y se distribuye bajo licencia MIT, lo que facilita su uso comercial y académico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base) |
| Parametros totales | 149.014.272 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de ModernBERT-base, un encoder Transformer optimizado para eficiencia y longitud de contexto moderada. La arquitectura es densa, sin mezcla de expertos, y utiliza pooling por media (mean pooling) sobre las representaciones de los tokens para obtener el embedding final de la frase. La dimensión de salida es 768, con soporte para truncamiento Matryoshka a 512, 256 y 128 dimensiones, lo que permite ajustar el equilibrio entre calidad y coste computacional.

El entrenamiento se realizó en dos fases según la receta SciEmbed: la primera (DAPT, domain-adaptive pretraining) se omitió en esta variante, y la segunda consistió en un entrenamiento contrastivo supervisado utilizando frases de contexto de citas como pares positivos. Esta señal aprovecha la estructura de las citas en la literatura científica para aprender representaciones que reflejan relaciones semánticas entre documentos. No se dispone de información detallada sobre el volumen de datos, el número de pasos o el uso de técnicas como hard negatives mining o in-batch negatives.

## Capacidades

- Generación de embeddings de frases y párrafos científicos normalizados (cosine similarity).
- Similitud semántica entre textos: permite calcular distancias entre abstracts, secciones o citas.
- Búsqueda semántica en corpus de documentos científicos (retrieval).
- Clasificación de textos por categorías temáticas o de tarea.
- Regresión sobre propiedades numéricas de documentos (p. ej., impacto, relevancia).
- Proximidad entre documentos basada en contexto de citas.
- Soporte de truncamiento Matryoshka para reducir dimensionalidad sin reentrenar.
- Integración con sentence-transformers y compatible con text-embeddings-inference.

## Casos de uso

- Búsqueda semántica en repositorios de artículos: indexar abstracts y párrafos de papers para recuperar documentos relevantes a partir de consultas en lenguaje natural, aprovechando la señal de citas para capturar relaciones temáticas implícitas.
- Sistemas de recomendación de literatura: dado un artículo de referencia, encontrar otros trabajos relacionados mediante similitud de embeddings, útil para sugerencias de lectura o revisión bibliográfica.
- Clasificación automática de manuscritos: asignar categorías temáticas (p. ej., áreas de la ACM o dominios de la Web of Science) a partir del embedding del abstract, con una precisión reportada de 75.3 en SciRepEval.
- Análisis de redes de citas: agrupar documentos por proximidad semántica para detectar comunidades de investigación o frentes de conocimiento emergentes.
- Detección de duplicados o plagio parcial: comparar embeddings de fragmentos de texto para identificar solapamientos entre documentos científicos.
- Filtrado de resultados en motores de búsqueda académica: reordenar resultados por relevancia semántica en lugar de coincidencia de palabras clave, mejorando la precisión en consultas complejas.
- Generación de resúmenes o mapas de conocimiento: proyectar embeddings en espacios de baja dimensión para visualizar relaciones entre documentos en herramientas de análisis bibliométrico.

## Benchmarks y rendimiento

El modelo reporta resultados en SciRepEval, un benchmark de evaluación para embeddings científicos con cuatro categorías. Los valores son los siguientes:

| Categoria | Puntuacion |
|---|---|
| Clasificacion | 75.3 |
| Regresion | 28.2 |
| Proximidad | 80.8 |
| Busqueda | 82.6 |
| Global (macro) | 66.7 ± 0.07 |

No se han publicado comparaciones con otros modelos en la información disponible. La desviación de ±0.07 en la métrica global sugiere estabilidad en los resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 149M parámetros, la huella de memoria es reducida. Con precisión FP32, el modelo ocupa aproximadamente 596 MB; con cuantización FP16 o int8, se reduce a ~300 MB o ~150 MB respectivamente, aunque no se han publicado pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en lote pequeño. Tarjetas como NVIDIA T4, GTX 1660, RTX 2060 o superiores funcionan sin problemas. Para procesamiento por lotes grande, una A10 o A100 ofrecería mayor throughput.
- Compatibilidad con GPUs de consumo: sí, cabe en cualquier GPU moderna de consumo (RTX 3060, RTX 4090, etc.) incluso con cuantización.
- Opciones de despliegue: al ser un modelo sentence-transformers, se puede servir con frameworks como Hugging Face Inference Endpoints, text-embeddings-inference (TEI), o mediante la librería directamente en un servicio Python. También es compatible con FAISS o Milvus para indexación vectorial.
- Latencia y throughput: no se han publicado mediciones específicas. Como referencia, un modelo de este tamaño en una GPU T4 suele procesar entre 500 y 2000 frases por segundo con batch de 32, dependiendo de la longitud de las secuencias.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de embeddings científicos en la información proporcionada. El modelo base ModernBERT-base es un encoder general de 149M parámetros, pero no se han facilitado resultados de otros embedders como SciBERT, SPECTER o SciNCL en el mismo benchmark. Por tanto, no es posible realizar una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con textos en inglés, por lo que su rendimiento en otros idiomas será muy limitado o nulo.
- La longitud de contexto de 512 tokens es corta para documentos completos; es adecuado para abstracts, secciones o párrafos, pero no para artículos enteros sin truncamiento.
- Al ser un modelo de embeddings, no genera texto ni realiza razonamiento; su uso se limita a tareas de representación y similitud.
- No se han documentado sesgos específicos, pero al entrenarse con literatura científica, puede reflejar sesgos de cobertura de las fuentes (p. ej., dominios o regiones sobrerrepresentados).
- El riesgo de alucinación no aplica directamente, pero los embeddings pueden producir falsos positivos en tareas de similitud si los textos comparten vocabulario superficial sin relación semántica real.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo se distribuye sin garantías; el autor no ofrece soporte oficial.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un modelo reciente y poco validado por la comunidad; se recomienda evaluar su rendimiento en el dominio específico antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/J0nasW/sciembed-nodapt-ctx
- Repositorio del autor en GitHub: https://github.com/J0nasW
- Variante con DAPT (sciembed-ctx): https://huggingface.co/anon-nlp/sciembed-ctx
- Variante sin DAPT (anónima): https://huggingface.co/anon-nlp/sciembed-nodapt-ctx
- Paper: *SciEmbed: Citation-Context Supervision for Scientific Document Embeddings*, Findings of EMNLP 2026 (enlace no disponible en la información proporcionada).
