# jadermcs/lexsplade-xlm-roberta-large-silver

## Resumen

LexSPLADE (xlm-roberta-large, silver) es un codificador léxico disperso de palabras en contexto desarrollado por jadermcs. A diferencia de los modelos de embeddings de frases, este modelo recibe una oración con una palabra marcada mediante las etiquetas `<t>` … `</t>` y devuelve un vector disperso sobre el vocabulario de 250.004 tokens de XLM-R que describe específicamente esa palabra en ese contexto. Es, por tanto, un embedding de palabra sensible al contexto, útil para tareas de desambiguación de sentido (word-sense disambiguation) y semántica léxica.

El modelo parte de `FacebookAI/xlm-roberta-large` (560 millones de parámetros) y se ha afinado con 31.914 pares de palabras en contexto con el mismo lema, procedentes de datos silver verificados por LLM y del conjunto de entrenamiento de MCL-WiC. Utiliza una arquitectura SPLADE con una cabeza MLM aplicada únicamente al span marcado, lo que evita generar tensores de logits de tamaño `[batch, seq, 250k]` y mantiene la eficiencia.

Su relevancia radica en que produce representaciones dispersas interpretables: cada dimensión corresponde a una entrada del vocabulario, de modo que un vector puede leerse directamente como una lista de palabras relacionadas. Esto lo hace atractivo para sistemas de recuperación léxica, análisis semántico y evaluación de desambiguación, aunque su licencia Apache 2.0 y su naturaleza experimental (5 descargas, sin likes) sugieren que se trata de un modelo de investigación más que de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-large) con cabeza MLM y pooling de span objetivo, codificador disperso tipo SPLADE |
| Parametros totales | 560.144.532 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (limitada por `max_seq_length` de XLM-R, no especificada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés; el backbone XLM-R es multilingüe, pero el entrenamiento es solo en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería sentence-transformers; incluye módulo custom `modeling_lexsplade.py`) |

## Arquitectura y entrenamiento

El modelo se construye sobre `FacebookAI/xlm-roberta-large`, un transformer encoder de 24 capas y 560 millones de parámetros con vocabulario de 250.004 tokens. Sobre el backbone se añade una cabeza MLM que se aplica exclusivamente a los tokens marcados con `<t>` … `</t>`, seguida de una operación de centrado de logits por token (se resta la media y se suma 2,5 veces la desviación típica antes de la ReLU) y de una proyección dispersa sobre el vocabulario. Este diseño de pooling de span objetivo es un módulo personalizado incluido en el repositorio (`modeling_lexsplade.py`), por lo que requiere `trust_remote_code=True`.

El entrenamiento emplea 31.914 pares de palabras en contexto con el mismo lema, combinando datos silver verificados por LLM y el conjunto de entrenamiento de MCL-WiC. La función de pérdida es AnglE sobre los vectores dispersos de la palabra objetivo, con un regularizador de FLOPS de SPLADE (coeficiente 1e-3) y un término de Barlow Twins sobre la representación densa del span. Se enmascaran tokens especiales, stop words y tokens sin letra ni dígito. La semilla utilizada es 44. El modelo comparte backbone con XL-LEXEME (`pierluigic/xl-lexeme`), lo que permite comparaciones controladas sobre la misma arquitectura base.

## Capacidades

- Generación de embeddings dispersos de palabras en contexto: devuelve un vector sobre el vocabulario de XLM-R que representa el significado de una palabra marcada en una oración concreta.
- Desambiguación de sentido de palabra (word-sense disambiguation): distingue usos polisémicos de un mismo lema (por ejemplo, "bank" como orilla de río frente a entidad financiera).
- Interpretabilidad léxica: las dimensiones del vector corresponden a entradas del vocabulario, por lo que el vector puede leerse como una lista de palabras relacionadas (por ejemplo, `bank`, `account`, `deposit`, `checking`).
- Similitud semántica a nivel de palabra: permite calcular similitud coseno entre dos usos contextuales de una palabra.
- Extracción de características (pipeline `feature-extraction`).
- Compatibilidad con Text Embeddings Inference (tag `text-embeddings-inference`) y endpoints.
- No soporta tool calling, agentes, visión, audio ni generación de texto; es exclusivamente un codificador.

## Casos de uso

- Desambiguación de sentido en pipelines de NLP: dado un corpus con palabras polisémicas marcadas, el modelo genera vectores contextuales que permiten agrupar usos por sentido y alimentar sistemas de anotación semántica o construcción de léxicos.
- Recuperación léxica interpretable: al producir vectores dispersos sobre el vocabulario, se puede construir un índice invertido donde cada dimensión es una palabra, facilitando la inspección y depuración de resultados de búsqueda semántica.
- Enriquecimiento de bases de datos léxicas: el modelo puede generar representaciones de palabras en contexto para proyectos de lexicografía computacional, ayudando a identificar acepciones y ejemplos de uso.
- Evaluación de modelos de desambiguación: al compartir backbone con XL-LEXEME, sirve como referencia controlada para comparar estrategias de pooling y funciones de pérdida en tareas de WiC (Word-in-Context).
- Análisis de similitud semántica en textos: permite comparar el uso de una misma palabra en dos oraciones distintas mediante similitud coseno de sus vectores dispersos, útil en estudios de variación de sentido.
- Sistemas de búsqueda sensible al contexto: en un motor de búsqueda documental, se pueden usar los vectores de palabras clave contextualizadas para desambiguar consultas ambiguas antes de la recuperación.
- Investigación en representaciones dispersas: sirve como banco de pruebas para estudiar el efecto del regularizador SPLADE y del centrado de logits en la calidad de embeddings léxicos.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre MCL-WiC en inglés. AP es la precisión media de la similitud coseno; la accuracy se calcula en el mejor umbral de cada split.

| Split | Accuracy | AP |
|---|---|---|
| test | 91,70 | 96,67 |
| dev | 91,00 | 95,07 |

Media de dimensiones no nulas por uso en MCL-WiC test: 246 de 250.004.

No se han publicado comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 560 millones de parámetros en fp32 se requieren aproximadamente 2,2 GB solo para pesos, más memoria para activaciones y el tensor de logits del span marcado. En fp16/bf16 se reduce a unos 1,1 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para inferencia en fp16 con lotes pequeños; A100 o H100 para procesamiento por lotes a gran escala.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB), siempre que se use fp16 y lotes moderados.
- Opciones de despliegue: sentence-transformers (con `trust_remote_code=True`), Text Embeddings Inference (tag `text-embeddings-inference`), endpoints de Hugging Face. No se menciona soporte para llama.cpp, Ollama ni vLLM.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| LexSPLADE (xlm-roberta-large, silver) | 560 M | no disponible | en (entrenamiento) | apache-2.0 | Embedding disperso de palabra en contexto (SPLADE) |
| XL-LEXEME (`pierluigic/xl-lexeme`) | ~560 M (XLM-R large) | no disponible | en | no disponible en la información | Embedding de palabra en contexto, mismo backbone |
| `jadermcs/lexsplade-bert-large-silver` | ~340 M (BERT-large) | no disponible | en | apache-2.0 | Variante sobre BERT-large, solo datos silver |
| `jadermcs/lexsplade-roberta-large-silver-wic-wnbags` | ~355 M (RoBERTa-large) | no disponible | en | apache-2.0 | Variante sobre RoBERTa-large con WiC y WordNet sense bags |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos en inglés; su uso en otros idiomas, aunque el backbone XLM-R sea multilingüe, no está validado.
- Requiere marcar la palabra objetivo con `<t>` … `</t>`; si los marcadores se truncan por superar `max_seq_length`, el pooling recae sobre toda la oración y devuelve un embedding de frase en lugar de uno de palabra, lo que produce resultados incorrectos de forma silenciosa.
- Necesita `trust_remote_code=True` por el módulo personalizado de pooling; esto implica ejecutar código del repositorio y debe auditarse antes de usarlo en producción.
- Modelo experimental con muy baja adopción (5 descargas, 0 likes) y sin validación externa conocida; no se recomienda para producción sin evaluación propia.
- Riesgo de sesgos heredados de XLM-R y de los datos silver generados por LLM, que pueden contener errores de anotación.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base XLM-R y los datos de entrenamiento pueden tener condiciones adicionales que conviene revisar.
- No se especifican la longitud máxima de secuencia efectiva ni los requisitos exactos de memoria, lo que complica el dimensionamiento de despliegues.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jadermcs/lexsplade-xlm-roberta-large-silver
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- XL-LEXEME (backbone compartido): https://huggingface.co/pierluigic/xl-lexeme
- Variante BERT-large: https://huggingface.co/jadermcs/lexsplade-bert-large-silver
- Variante RoBERTa-large con WiC y WordNet: https://huggingface.co/jadermcs/lexsplade-roberta-large-silver-wic-wnbags
