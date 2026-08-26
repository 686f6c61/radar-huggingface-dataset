# sifat-febo/banglish-embed-minilm-small

## Resumen

Banglish Embed MiniLM Small es un modelo de embeddings de frases (sentence embeddings) desarrollado por Sifat Febo, diseñado para resolver un problema muy concreto: la recuperación de información en bengalí cuando el texto puede estar escrito en escritura bengalí (বাংলা) o en bengalí romanizado (banglish, es decir, bengalí transcrito al alfabeto latino). El modelo permite buscar en cualquiera de los dos formatos y encontrar resultados en ambos, unificando el espacio semántico de una lengua de bajos recursos que suele aparecer en dos escrituras distintas en la práctica digital.

Se trata de un fine-tuning del modelo `paraphrase-multilingual-MiniLM-L12-v2` (Apache 2.0) sobre el dataset de pares `BanglaTLit`, con 117 millones de parámetros y un peso de 0,47 GB. Está pensado para ejecutarse en CPU de portátil, sin necesidad de GPU, cuenta ni conexión a internet. Es la versión intermedia de una familia de tres modelos: el grande (`banglish-embed`, 0,95 GB, más preciso), este (0,47 GB) y uno ultrapequeño de 12 MB disponible como revisión del modelo grande. Su relevancia actual radica en que aborda un caso de uso real en comunidades bengalíes: la mayoría del contenido en redes sociales y foros usa banglish, mientras que los documentos formales usan escritura bengalí, y los sistemas de búsqueda tradicionales fallan al cruzar ambas escrituras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MiniLM-L12, 12 capas, 384 dimensiones ocultas) |
| Parametros totales | 117.352.320 |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (base MiniLM); la model card indica truncamiento a ~50 palabras |
| Tipos de cuantizacion | no disponible (se distribuye en FP32/FP16 estándar de sentence-transformers) |
| Idiomas soportados | bengalí (bn) y bengalí romanizado / banglish (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `paraphrase-multilingual-MiniLM-L12-v2`, un transformer encoder de 12 capas con 384 dimensiones ocultas y 117 millones de parámetros, entrenado originalmente para producir embeddings multilingües de frases mediante siamese networks. Sobre esta base se realizó un fine-tuning con el dataset `BanglaTLit` (licencia MIT), que contiene pares de frases en bengalí y su correspondiente transliteración romanizada (banglish). El entrenamiento consistió en ajustar los embeddings para que frases equivalentes en ambas escrituras queden cerca en el espacio vectorial, usando típicamente una función de pérdida de similitud de coseno o triplet loss (no se especifica el detalle exacto en la documentación disponible). No se menciona el uso de RLHF ni DPO; es un fine-tuning supervisado estándar para tareas de similitud semántica.

Una innovación destacable es que, al partir de un modelo multilingüe ya entrenado, el fine-tuning solo necesita ajustar las representaciones para alinear las dos escrituras del bengalí, lo que permite obtener resultados competitivos con un coste de entrenamiento reducido. El modelo hereda la arquitectura y el vocabulario del modelo base, por lo que es compatible con pipelines existentes que ya usen `paraphrase-multilingual-MiniLM-L12-v2`.

## Capacidades

- Generación de embeddings de frases para similitud semántica (sentence similarity).
- Recuperación cross-script: dado un texto en bengalí, encuentra el equivalente en banglish y viceversa.
- Búsqueda semántica en corpus mixtos (bengalí y banglish) con una sola consulta.
- Clasificación de pares de frases (paraphrase detection) entre escrituras.
- Funciona en CPU sin GPU, con un peso de 0,47 GB.
- Compatible con la librería `sentence-transformers` y con `text-embeddings-inference` (según tags).
- No es un modelo generativo: no produce texto, solo representaciones vectoriales.
- No soporta tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Búsqueda en foros y redes sociales bengalíes: muchos usuarios escriben en banglish mientras que los hilos antiguos o formales están en bengalí. Este modelo permite indexar ambos formatos y devolver resultados relevantes sin importar la escritura de la consulta.
- Sistemas de preguntas y respuestas (QA) sobre documentación bengalí: al convertir preguntas y respuestas a embeddings, se puede recuperar el pasaje correcto aunque la pregunta esté en banglish y el documento en bengalí.
- Deduplicación de contenido: detectar si dos publicaciones en diferentes escrituras (una en bengalí, otra en banglish) hablan de lo mismo, útil para moderación o agregación de noticias.
- Chatbots de atención al cliente en bengalí: el modelo puede emparejar la consulta del usuario (escrita en banglish) con respuestas predefinidas en bengalí, sin necesidad de traducción previa.
- Motores de recomendación de artículos o vídeos: basándose en la similitud de títulos o descripciones en ambas escrituras, se pueden sugerir contenidos relacionados.
- Construcción de datasets paralelos bengalí-banglish: al identificar pares de frases equivalentes automáticamente, se puede ampliar corpus de entrenamiento para otros modelos.

## Benchmarks y rendimiento

La model card reporta resultados de recuperación top-1 sobre un conjunto de prueba de 2.000 pares de frases (una en bengalí, una en banglish). La métrica indica la frecuencia con la que la frase correcta aparece en primer lugar entre 1.999 distractores. Un empate se cuenta como error.

| Modelo | Bengali → Banglish | Banglish → Bengali | Tamano |
|---|---|---|---|
| banglish-embed (grande) | 0.995 | 0.992 | 0.95 GB |
| **banglish-embed-minilm-small (este)** | **0.988** | **0.986** | **0.47 GB** |
| Modelo de 12 MB (revision antigua) | 0.983 | 0.986 | 0.012 GB |

En errores absolutos: este modelo comete 52 errores frente a 26 del modelo grande, es decir, aproximadamente un error adicional por cada 80 búsquedas. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GLUE, ya que no es un modelo generativo ni de razonamiento.

## Requisitos de hardware

- VRAM estimada: ~0,5 GB en FP32; ~0,25 GB en FP16. Cabe en cualquier GPU consumer (incluso integradas).
- CPU: funciona en portátiles sin GPU; la inferencia es rápida para embeddings de frases (típicamente <10 ms por frase en CPU moderna).
- GPU recomendadas: cualquiera con 1 GB de VRAM es suficiente; no requiere GPU de datacenter.
- Opciones de despliegue: `sentence-transformers` (Python), `text-embeddings-inference` (TGI) para servir en producción, o exportación a ONNX para entornos sin Python.
- Latencia: no se proporcionan datos oficiales, pero al ser un modelo de 117M y 384 dimensiones, la latencia es del orden de milisegundos en CPU y sub-milisegundos en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (Bengali→Banglish) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **banglish-embed-minilm-small** | 117M | 512 tokens | 0.988 | Apache 2.0 | HuggingFace |
| banglish-embed (grande) | no disponible | no disponible | 0.995 | Apache 2.0 | HuggingFace |
| Modelo de 12 MB (revision) | ~12M | no disponible | 0.983 | Apache 2.0 | HuggingFace (revision) |
| paraphrase-multilingual-MiniLM-L12-v2 (base) | 117M | 512 tokens | no evaluado en esta tarea | Apache 2.0 | HuggingFace |

La comparativa se limita a la familia del propio autor, ya que no se han encontrado otros modelos específicos para bengalí-banglish en la información disponible. El modelo base multilingüe no está optimizado para esta tarea cross-script.

## Limitaciones y advertencias

- Truncamiento a aproximadamente 50 palabras: frases más largas pierden información, lo que puede afectar a documentos extensos.
- Especialización exclusiva en similitud semántica: no genera texto, no responde preguntas ni realiza razonamiento.
- Cobertura limitada a bengalí y banglish; no soporta otros idiomas de forma fiable, aunque el modelo base sea multilingüe.
- Posibles sesgos derivados del dataset de entrenamiento `BanglaTLit`, que puede no representar todas las variantes dialectales o registros del bengalí.
- Riesgo de alucinación no aplica (no es generativo), pero sí puede producir falsos positivos en recuperación si las frases son muy similares superficialmente.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero el modelo base y el dataset tienen sus propias licencias (Apache 2.0 y MIT respectivamente), todas permisivas.
- Para casos donde la precisión sea crítica, el autor recomienda usar el modelo grande `banglish-embed` (0,95 GB) que comete la mitad de errores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sifat-febo/banglish-embed-minilm-small
- Modelo grande (banglish-embed): https://huggingface.co/sifat-febo/banglish-embed
- Dataset BanglaTLit: https://huggingface.co/datasets/aplycaebous/BanglaTLit
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
