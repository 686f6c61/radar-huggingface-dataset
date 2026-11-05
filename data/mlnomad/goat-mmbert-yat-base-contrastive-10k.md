# mlnomad/goat-mmbert-yat-base-contrastive-10k

## Resumen

GOAT mmBERT YAT Base Contrastive 10K es un codificador de texto multilingüe desarrollado por mlnomad, publicado en HuggingFace bajo licencia MIT. Se trata de un checkpoint de ajuste fino contrastivo (paso 10.000) inicializado a partir del modelo preentrenado por MLM `mlnomad/goat-mmbert-yat-base-mlm-10b`, que a su vez partió de inicialización desde cero y completó 10.038.104.948 tokens no padding. El modelo cuenta con aproximadamente 281,8 millones de parámetros (incluyendo la cabeza MLM retenida, aunque no se usa en inferencia de embeddings) y produce embeddings de 768 dimensiones.

El modelo resuelve el problema de generar representaciones densas de frases para recuperación de información (retrieval) y similitud semántica en múltiples idiomas y código. Su relevancia radica en que combina una arquitectura con innovaciones propias de la familia GOAT (atención GOAT-input y bloques feed-forward YATGLU) con un entrenamiento contrastivo sobre una mezcla de MS MARCO, Global Voices, CodeSearchNet y ocho fuentes de idiomas MIRACL. Está implementado en Flax (JAX) y se distribuye con la librería FlaxChat, lo que lo hace interesante para entornos TPU y para quienes trabajan fuera del ecosistema PyTorch habitual.

La ventana de contexto configurada para posiciones es de 8.192 tokens, aunque la evaluación se realizó con longitud máxima de 512 y truncamiento por la derecha. El checkpoint final (paso 10.000) se seleccionó para benchmarking, mientras que el paso 4.000 fue el mejor checkpoint que superó todas las puertas de regresión de desarrollo. El modelo está pensado como encoder de frases, no como modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder de 22 capas con atención GOAT-input y bloques feed-forward YATGLU |
| Parametros totales | 281.833.984 (incluye cabeza MLM retenida) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 posiciones configuradas; evaluación con máximo 512 y truncamiento por la derecha |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Multilingüe (entrenado con MS MARCO, Global Voices, CodeSearchNet y ocho fuentes MIRACL; lista exacta de idiomas no disponible) |
| Licencia | MIT |
| Formato de pesos | safetensors, flax (JAX/Flax NNX) |
| Dimension de embeddings | 768 |
| Libreria | flax (FlaxChat) |
| Tamano del repo | 1,2 GB |
| Modelo base | mlnomad/goat-mmbert-yat-base-mlm-10b (finetune) |

## Arquitectura y entrenamiento

El backbone es un transformer encoder de 22 capas que incorpora atención GOAT-input y bloques feed-forward YATGLU, una variante propia de la familia GOAT. El modelo padre por MLM se inicializó desde cero y completó la cobertura de un corpus preparado de 10.038.104.948 tokens no padding tras una etapa MLM previa. Este release conserva la cabeza MLM del modelo preentrenado, aunque la función principal es la generación de embeddings de frase mediante mean pooling sobre los estados no padding (incluyendo tokens especiales) y normalización L2 en FP32.

El ajuste fino contrastivo utilizó una mezcla preparada de 563.962 filas de entrenamiento provenientes de MS MARCO, bitexto de Global Voices, CodeSearchNet y ocho fuentes de idiomas MIRACL. Se realizaron 10.000 actualizaciones del optimizador con batch global 128; dado que el muestreo fue con reemplazo, las actualizaciones incluyen filas repetidas. El objetivo es InfoNCE coseno simétrico con temperatura 0,05, con negativos in-batch, negativos minados cuando estaban disponibles y enmascaramiento de duplicados y positivos conocidos. Se usó AdamW, learning rate pico de 3e-5, 200 actualizaciones de warmup, schedule coseno de 10.000 actualizaciones y semilla 1028. El checkpoint preserva los parámetros de atención y la configuración de precisión del modelo preentrenado. El paso 4.000 fue el mejor checkpoint que superó todas las puertas de regresión de desarrollo; el paso 10.000 completó el schedule y se evaluó sobre el inventario completo de benchmarks.

## Capacidades

- Generación de embeddings de frase de 768 dimensiones para similitud semántica y recuperación densa.
- Similitud semántica multilingüe entre pares de frases.
- Recuperación de información (retrieval) en múltiples idiomas, con evaluación específica en MIRACL de 18 idiomas.
- Recuperación de código, con evaluación en CoIR (diez tareas) y entrenamiento sobre CodeSearchNet.
- Procesamiento de pares de frases bilingües (bitexto) para tareas de alineamiento y búsqueda cross-lingüe.
- Pooling de media con normalización L2 integrado en la API (`model.pool`).
- Codificación de tokens a estados por token (`model.encode`).
- No dispone de tool calling, function calling, agentes ni razonamiento multi-paso: es un encoder, no un modelo generativo.
- No dispone de visión ni audio.
- No dispone de modo thinking.

## Casos de uso

- Búsqueda semántica multilingüe: el modelo genera embeddings normalizados de 768 dimensiones que permiten indexar documentos en varios idiomas y recuperar por similitud coseno, aprovechando su entrenamiento con fuentes MIRACL y Global Voices para consultas cross-lingües.
- Recuperación de código en repositorios: con entrenamiento sobre CodeSearchNet y evaluación en CoIR, puede indexar fragmentos de código y emparejarlos con descripciones en lenguaje natural para asistentes de documentación o búsqueda interna.
- Deduplicación y clustering de documentos: la similitud coseno entre embeddings permite agrupar documentos casi duplicados o temáticamente cercanos en pipelines de curación de datos, usando el pooling de media ya incluido.
- Reranking de resultados de búsqueda: como encoder de pares, puede puntuar la relevancia consulta-documento en una segunda fase de un pipeline de recuperación, con truncamiento a 512 tokens para pasajes.
- Moderación y clasificación semántica de contenido: los embeddings sirven como features para clasificadores ligeros de intención, toxicidad o temática en múltiples idiomas, sin necesidad de reentrenar el encoder.
- Sistemas de recomendación basados en contenido: representar ítems y perfiles de usuario como vectores de 768 dimensiones para calcular afinidad mediante producto escalar, con la ventaja de cubrir contenido multilingüe.
- Alineamiento de bitextos para minería de traducción: el modelo se entrenó con bitexto de Global Voices y puede usarse para puntuar pares de frases candidatas en la construcción de corpus paralelos.
- Búsqueda en bases de conocimiento sobre TPU: al estar implementado en Flax/JAX con FlaxChat, encaja en infraestructura TPU v5e donde se midió la inferencia con batch 16 y longitudes de 128 y 512.

## Benchmarks y rendimiento

Resultados publicados en la model card, en escala de visualización 0–100. Evaluación en TPU v5e físicas con MTEB 2.21.8, longitud máxima 512, batch de inferencia 16, truncamiento por la derecha, sin prompts, mean pooling sobre estados no padding incluyendo tokens especiales y normalización L2 en FP32.

| Benchmark | GOAT MLM base | GOAT contrastive 10K | Previous YAT embedding v1 |
|---|---:|---:|---:|
| English MTEB, 41 tareas / media de siete categorías | 36,84 | **45,93** | 52,78 |
| Multilingual MTEB, 131 tareas / ocho categorías comunes | 31,77 | **42,61** | 48,21 |
| Multilingual MTEB, media de nueve categorías | 28,07 | **37,67** | 42,40 |
| CoIR, media de diez tareas | 9,91 | **34,25** | 43,45 |
| MIRACL hard-negative retrieval, media de 18 idiomas | 1,82 | **24,51** | 46,37 |

El inventario completo contiene 182 tareas, ejecutadas en 204 jobs (incluyendo seis splits de WebLINX y 18 subconjuntos de idioma de MIRACL). La media multilingüe de ocho categorías excluye InstructionReranking y sigue la convención del paper de mmBERT; la media nativa de nueve categorías incluye InstructionReranking. La columna GOAT base y la de YAT previo usan sus recibos publicados de suite completa sobre las mismas revisiones de tareas y datasets. El paper de mmBERT reporta 53,9 en English MTEB, 54,1 en multilingual MTEB sobre ocho categorías y 42,2 en CoIR para su evaluación base tras fine-tuning con MS MARCO; su modelo fundacional tiene 307M parámetros y se preentrenó con 3T tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 281,8M parámetros, en FP32 serían aproximadamente 1,1 GB de pesos, y en FP16/BF16 alrededor de 0,56 GB, a lo que hay que sumar activaciones y memoria del tokenizador para batch 16 y longitud 512.
- GPU recomendadas: no se especifican en la información proporcionada; el modelo está implementado en Flax/JAX y la inferencia medida se realizó en TPU v5e físicas.
- Cabe en GPU consumer: previsiblemente sí por tamaño de parámetros, pero no hay confirmación oficial ni lista de GPUs probadas en la información disponible.
- Opciones de despliegue: FlaxChat (`pip install "flaxchat[encoder]"`), con backend JAX; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La medición reportada es de alcance físico en TPU con batch 16 y longitudes de secuencia 128 y 512.
- El repositorio incluye un directorio `implementation/` con el código Flax congelado y un `runtime-requirements.txt` con el entorno de benchmarking fijado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | English MTEB | Multilingual MTEB (8 cat.) | CoIR | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---:|---|---|
| GOAT mmBERT YAT Base Contrastive 10K | 281,8M | 8.192 posiciones (eval. 512) | 45,93 | 42,61 | 34,25 | MIT | HuggingFace, Flax |
| GOAT MLM base (modelo padre) | No disponible | No disponible | 36,84 | 31,77 | 9,91 | MIT | HuggingFace |
| Previous YAT embedding v1 | No disponible | No disponible | 52,78 | 48,21 | 43,45 | No disponible | HuggingFace |
| mmBERT base (paper) | 307M | No disponible | 53,9 | 54,1 | 42,2 | No disponible | Paper |

El modelo supera claramente a su padre MLM en todas las métricas, pero queda por debajo del YAT embedding v1 previo y del mmBERT base reportado en el paper en English MTEB, multilingual MTEB y CoIR. La comparación con mmBERT debe tomarse con cautela porque las cifras del paper corresponden a otra configuración de evaluación y a un modelo con 3T tokens de preentrenamiento.

## Limitaciones y advertencias

- Es un encoder de frases, no un modelo generativo: no soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.
- Rendimiento inferior al modelo YAT embedding v1 previo y al mmBERT base del paper en las métricas publicadas; en MIRACL hard-negative retrieval la caída frente a YAT v1 es muy acusada (24,51 frente a 46,37).
- La auditoría completa de solapamiento a nivel de fila entre los datos de entrenamiento y todas las entradas de benchmark está pendiente según la propia model card, lo que introduce riesgo de contaminación no cuantificado.
- El entrenamiento usó muestreo con reemplazo, por lo que las 10.000 actualizaciones incluyen filas repetidas; esto puede afectar a la generalización.
- La evaluación se realizó con truncamiento a 512 tokens pese a una capacidad de posiciones de 8.192, por lo que el comportamiento más allá de 512 no está validado.
- La lista exacta de idiomas soportados no está disponible; el soporte multilingüe se infiere de las fuentes de entrenamiento (MIRACL de ocho idiomas, Global Voices).
- No hay datos publicados sobre sesgos, tasas de alucinación (no aplica a generación, pero sí a falsos positivos en retrieval) ni robustez en dominios fuera de los benchmarks.
- Licencia MIT: permite uso comercial, pero conviene verificar las licencias de los datasets de entrenamiento (MS MARCO, MIRACL, CodeSearchNet, Global Voices) para usos derivados.
- El ecosistema es Flax/JAX con FlaxChat, lo que limita la integración directa con herramientas estándar de PyTorch como sentence-transformers, vLLM o TGI.
- El checkpoint incluye la cabeza MLM retenida, lo que incrementa ligeramente el tamaño respecto a un encoder puro de embeddings.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlnomad/goat-mmbert-yat-base-contrastive-10k
- Modelo base MLM: https://huggingface.co/mlnomad/goat-mmbert-yat-base-mlm-10b
- Modelo YAT previo y recibos publicados: https://huggingface.co/mlnomad/yat-mmbert-base-embedding-v1/tree/571d0ef3d8e1381055845fce334a48be253c3fea
- Resultados completos (RESULTS.md): https://huggingface.co/mlnomad/goat-mmbert-yat-base-contrastive-10k/blob/main/RESULTS.md
- Paper de mmBERT (Tablas 4–6): https://arxiv.org/html/2509.06888v1
- Repositorio FlaxChat: https://github.com/mlnomadpy/flaxchat
