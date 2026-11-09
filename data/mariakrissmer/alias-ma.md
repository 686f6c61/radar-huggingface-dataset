# mariakrissmer/ALIAS-MA

## Resumen

ALIAS-MA es un modelo de embeddings de frases (sentence transformer) desarrollado por mariakrissmer y publicado en Hugging Face bajo licencia MIT. Se trata de un encoder BERT fine-tuneado a partir de `NeuML/pubmedbert-base-embeddings` cuyo objetivo es proyectar descripciones de células y texto biomédico en un espacio vectorial compartido, de forma que términos equivalentes o relacionados (por ejemplo, "CD8 T cell" y "cytotoxic T lymphocyte") queden próximos en el espacio de embeddings. Es la variante etiquetada como **MA** en el manuscrito asociado al proyecto ALIAS.

El modelo resuelve un problema concreto de la investigación biomédica: la necesidad de comparar y agrupar descripciones heterogéneas de tipos celulares, anotaciones de single-cell y literatura científica en un mismo marco semántico. Con 109.482.240 parámetros y un repositorio de 0,4 GB, es un modelo compacto pensado para ejecutarse en hardware modesto y para integrarse en pipelines de búsqueda semántica o clustering sobre datos biológicos.

Es relevante ahora porque los embeddings especializados en dominios científicos permiten construir sistemas de recuperación de información y anotación automática sobre corpus biomédicos sin depender de modelos generalistas, y porque su licencia MIT facilita su reutilización en investigación y en productos derivados. No obstante, el autor lo presenta explícitamente como herramienta de investigación exploratoria, sin validación clínica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (encoder), empaquetado como SentenceTransformer |
| Parametros totales | 109.482.240 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT (modelo); modelo base Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ALIAS-MA es un encoder transformer de la familia BERT, derivado del modelo `NeuML/pubmedbert-base-embeddings`, que a su vez parte de PubMedBERT y ha sido adaptado para generar embeddings de frases. Sobre esa base, el autor aplica un fine-tuning con pares y datos orientados a similitud semántica, de modo que el modelo produce representaciones vectoriales comparables mediante similitud coseno. El empaquetado sigue el formato estándar de la librería `sentence-transformers`, lo que permite cargarlo con `SentenceTransformer("mariakrissmer/ALIAS-MA")` y generar embeddings con `model.encode(...)`.

El entrenamiento se realizó sobre dos conjuntos de datos documentados en la model card: `S2_heldout_donor_semantic_200k` y `N1_ncbi_literature`. El identificador interno del modelo (`MB_HIAI_Tcells_S2_N1_200k_lr5e5_e15`) sugiere un entrenamiento sobre datos de células T, con un learning rate de 5e-5 y 15 épocas, aunque estos detalles no se explicitan como hiperparámetros formales en la información disponible. No se especifica el número total de tokens de entrenamiento, la composición exacta de los datasets ni si se emplearon técnicas de RLHF o DPO (no aplicables habitualmente a modelos de embeddings). La procedencia de código y datos se enlaza a la rama `manuscript-reproducibility` del repositorio del proyecto ALIAS.

## Capacidades

- Generación de embeddings de frases y textos cortos para similitud semántica (pipeline `sentence-similarity`).
- Proyección conjunta de descripciones de células y texto biomédico en un espacio vectorial compartido.
- Búsqueda semántica y recuperación de información sobre corpus biomédicos.
- Clustering y agrupación de anotaciones celulares o términos biológicos equivalentes.
- Detección de sinónimos y relaciones semánticas entre conceptos del dominio (por ejemplo, nombres alternativos de tipos celulares).
- Integración con la librería `sentence-transformers` y con Text Embeddings Inference (tag `text-embeddings-inference`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades multilingües: no disponibles (no se documentan idiomas soportados).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step, visión ni audio; es un modelo exclusivamente de embeddings.

## Casos de uso

- Búsqueda semántica en literatura biomédica: indexar abstracts y artículos de NCBI en una base vectorial y recuperar los más relevantes ante una consulta en lenguaje natural, aprovechando el fine-tuning sobre `N1_ncbi_literature`.
- Normalización de anotaciones de single-cell: mapear etiquetas heterogéneas de tipos celulares procedentes de distintos estudios a un espacio común para detectar duplicados y sinónimos antes del análisis.
- Clustering de poblaciones celulares: agrupar descripciones textuales de células por similitud de embeddings para apoyar la anotación automática de clusters en experimentos de scRNA-seq.
- Deduplicación de ontologías y vocabularios: comparar términos de ontologías biomédicas y detectar equivalencias semánticas entre entradas.
- Motor de recomendación de publicaciones: calcular similitud entre el perfil de un investigador y artículos del corpus para sugerir lecturas relacionadas.
- Construcción de pipelines RAG en dominios biológicos: usar los embeddings como recuperador en un sistema de generación aumentada por recuperación sobre documentación científica.
- Prototipado rápido en investigación: al ser un modelo de 0,4 GB con licencia MIT, permite experimentar en entornos con recursos limitados sin coste de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,44 GB solo para pesos (109,5 M de parámetros × 4 bytes), más overhead de activaciones y tokenizador; en la práctica, menos de 1-2 GB.
- En FP16/BF16: aproximadamente 0,22 GB para pesos, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; funciona en RTX 3060, RTX 4060, RTX 4090, A100 o H100, aunque para este tamaño las GPUs de gama alta no aportan ventajas significativas frente a alternativas menores.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU modernas e incluso en CPU para cargas moderadas.
- Opciones de despliegue: `sentence-transformers`, Text Embeddings Inference (TEI), y cualquier servidor compatible con endpoints de embeddings; también es viable la inferencia en CPU con ONNX u otras rutas de optimización.
- Latencia y throughput estimados: no disponibles (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ALIAS-MA | 109,5 M | No disponible | Biomédico / single-cell | MIT | Hugging Face |
| NeuML/pubmedbert-base-embeddings | No disponible | No disponible | Biomédico | Apache 2.0 | Hugging Face |
| Modelos de embeddings generalistas (p. ej. familia all-MiniLM) | ~22-118 M | No disponible | General | Varía (Apache 2.0 / MIT) | Hugging Face |

La comparación cuantitativa de rendimiento no está disponible, ya que ALIAS-MA no publica benchmarks. Frente a su modelo base, ALIAS-MA añade un fine-tuning específico para el alineamiento entre descripciones celulares y literatura biomédica; frente a los embeddings generalistas, su ventaja esperada es la especialización de dominio, a costa de una menor cobertura fuera del ámbito biomédico.

## Limitaciones y advertencias

- Modelo de investigación exploratoria: el autor indica explícitamente que no ha sido validado para uso clínico.
- Riesgo de alucinación: al ser un modelo de embeddings no genera texto, pero puede producir similitudes engañosas entre términos no relacionados si se usa fuera del dominio para el que fue entrenado.
- Sesgos conocidos: no documentados; al derivar de PubMedBERT y de datasets biomédicos, puede heredar sesgos de la literatura científica y de las anotaciones de los estudios de origen.
- Limitaciones de contexto e idioma: no se especifican la longitud máxima de secuencia ni los idiomas soportados; se desconoce su comportamiento fuera del inglés científico.
- Restricciones de licencia: el modelo es MIT, pero el modelo base es Apache 2.0; se incluye el texto de la licencia upstream en el repositorio, por lo que conviene conservar los avisos de atribución correspondientes.
- Caveat para producción: con 0 descargas y 0 likes en el momento de la consulta, no hay evidencia de uso comunitario ni de validación externa; para entornos productivos conviene evaluar su calidad en el corpus concreto antes de desplegarlo.
- No se documentan cuantizaciones oficiales ni métricas de latencia, lo que dificulta planificar el rendimiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mariakrissmer/ALIAS-MA
- Modelo base: https://huggingface.co/NeuML/pubmedbert-base-embeddings
- Repositorio del proyecto ALIAS (rama de reproducibilidad del manuscrito): https://github.com/MariaKrissmer/alias/tree/manuscript-reproducibility
