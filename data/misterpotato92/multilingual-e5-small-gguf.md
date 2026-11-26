# MisterPotato92/multilingual-e5-small-GGUF

## Resumen

multilingual-e5-small-GGUF es la conversión al formato GGUF del modelo de embeddings intfloat/multilingual-e5-small, publicada por el usuario MisterPotato92. Se trata de un encoder BERT de 117,5 millones de parámetros que genera representaciones vectoriales densas de 384 dimensiones para textos en más de 90 idiomas. No es un modelo generativo: su única función es producir embeddings de frases y pasajes, lo que lo hace útil para búsqueda semántica, recuperación aumentada (RAG) y agrupamiento de documentos.

La relevancia de esta publicación radica en el formato: al estar en GGUF/GGML, el modelo puede ejecutarse con herramientas ligeras basadas en ggml como CrispEmbed o una bifurcación de Ollama, sin necesidad de PyTorch ni de una GPU dedicada. El autor recomienda la cuantización Q8_0 (126 MiB), que conserva una similitud coseno de 0,9999 frente al modelo original en F32, mientras que las variantes de 4 bits reducen el tamaño a 115 MiB a costa de bajar a 0,990.

El repositorio redistribuye únicamente pesos convertidos y cuantizados, sin entrenamiento ni ajuste fino adicional, y mantiene la licencia MIT del modelo original. Es una opción práctica para desplegar búsqueda multilingüe en entornos con recursos limitados o en arquitecturas basadas en contenedores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer) |
| Parametros totales | 117.505.920 (118M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32, Q8_0, Q4_K, Q4_K + imatrix, IQ4_XS |
| Idiomas soportados | más de 90 (en, de, fr, es, zh, ja, ko, ar, hi, pt, ru, it, nl, pl, tr, vi, th, id, sv, da, no, fi, cs, ro, hu, bg, uk, ca, el, hr, sk, sl, et, lt, lv, ms, tl, sw, af, cy, ga, sq, mk, bs, mt, gl, eu, is, ka, hy, kk, uz, az, be, mn, ne, si, km, my, lo, am, ps, sd, ku, ug, bo, dz, fy) |
| Licencia | MIT |
| Formato de pesos | GGUF / GGML |
| Dimension de embedding | 384 |
| Numero de capas | 12 |
| Pooling | mean |
| Tokenizador | SentencePiece |
| Similitud coseno Q8_0 vs Hugging Face | 0,9999 |
| Similitud coseno Q4_K vs Hugging Face | 0,990 |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer tipo BERT de 12 capas con 117,5 millones de parámetros y una dimensión oculta de 384. Emplea tokenizador SentencePiece y pooling de media sobre las representaciones de token para producir un único vector por texto. La familia E5 se entrena con objetivos de contraste (texto emparejado y pasajes) y requiere prefijos específicos (`query:` y `passage:`) en la entrada para obtener un rendimiento óptimo en recuperación, aunque la model card del repositorio no detalla esta convención.

Esta publicación concreta no ha realizado entrenamiento, ajuste fino, fusión ni destilación: solo conversión de formato y cuantización. Los datos de entrenamiento originales no se documentan en la información disponible y corresponden al proveedor upstream (intfloat). La innovación técnica del repositorio es la generación de una matriz de importancia (imatrix) para las cuantizaciones de 4 bits, disponible como archivo auxiliar de 131 KiB junto con las notas A/B de su elaboración.

## Capacidades

- Generación de embeddings de frases y pasajes en más de 90 idiomas.
- Búsqueda semántica y recuperación de documentos mediante similitud coseno.
- Agrupamiento y clasificación de textos a partir de sus representaciones vectoriales.
- Detección de duplicados y near-duplicates semánticos.
- Soporte de API compatible con OpenAI (`/v1/embeddings`), Ollama nativa (`/api/embed`) y Ollama legacy (`/api/embeddings`) a través del servidor CrispEmbed.
- Integración con Ollama mediante una bifurcación específica que añade soporte de embeddings XLM-R.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Búsqueda semántica multilingüe: indexar un corpus en varios idiomas y consultar en cualquiera de ellos, ya que el modelo proyecta textos de más de 90 lenguas en un mismo espacio vectorial de 384 dimensiones.
- Recuperación aumentada (RAG) en producción: generar embeddings de fragmentos de documentación y de la consulta del usuario para recuperar los pasajes más relevantes antes de pasarlos a un LLM generativo.
- Deduplicación de catálogos: calcular similitud coseno entre descripciones de productos o artículos para detectar entradas redundantes sin comparar cadenas exactas.
- Clasificación y enrutado de tickets: agrupar consultas de soporte por temática usando clustering sobre los embeddings y derivar cada grupo al equipo correspondiente.
- Búsqueda en aplicaciones de escritorio o embebidas: desplegar el modelo en Q8_0 (126 MiB) con CrispEmbed u Ollama en equipos sin GPU, manteniendo una fidelidad de 0,9999 respecto al original.
- Moderación y filtrado de contenido: comparar la representación de un texto entrante con la de una lista de referencia de temas prohibidos para activar revisiones.
- Motor de recomendación basado en contenido: vectorizar descripciones y perfiles de usuario para sugerir elementos con representaciones próximas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card solo aporta métricas de fidelidad de la cuantización frente al modelo original en F32, medidas como similitud coseno:

| Variante | Tamano | Similitud coseno vs Hugging Face |
|---|---|---|
| F32 | 455 MiB | 1,0000 (referencia) |
| Q8_0 | 126 MiB | 0,9999 |
| Q4_K | 115 MiB | 0,990 |
| Q4_K + imatrix | 115 MiB | no medida |
| IQ4_XS | 115 MiB | no medida |

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las variantes; 455 MiB en F32, 126 MiB en Q8_0 y 115 MiB en las cuantizaciones de 4 bits.
- Cabe holgadamente en cualquier GPU consumer, incluida una GTX 1050 o una iGPU con memoria compartida; también funciona en CPU.
- GPU recomendadas: no requiere GPU dedicada; para lotes grandes se puede usar cualquier GPU con al menos 1 GB de VRAM libre (RTX 3060, RTX 4090, A100, H100) sin que el modelo sea el cuello de botella.
- Opciones de despliegue: CrispEmbed (CLI, servidor y API Python), Ollama mediante la bifurcación CrispStrobe con soporte XLM-R, y cualquier runtime ggml/GGUF compatible con embeddings.
- Latencia y throughput: no disponibles en la información proporcionada; al tratarse de un BERT de 12 capas y 118M de parámetros, se espera un coste por lote muy bajo en CPU y GPU modernas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| multilingual-e5-small-GGUF (este) | 118M | no disponible | más de 90 | MIT | GGUF |
| intfloat/multilingual-e5-small | 118M | no disponible | más de 90 | MIT | safetensors (PyTorch) |
| intfloat/multilingual-e5-base | no disponible en la informacion | no disponible | más de 90 | MIT | safetensors |
| BAAI/bge-m3 | no disponible en la informacion | no disponible | multilingüe | MIT | safetensors |

La comparación cuantitativa de rendimiento entre estos modelos no está disponible en la información proporcionada. La diferencia principal de esta publicación frente al modelo original es el formato: GGUF permite ejecución con ggml sin PyTorch, a cambio de depender de runtimes específicos para embeddings.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no responde preguntas ni ejecuta tool calling; solo calcula embeddings.
- El rendimiento óptimo de la familia E5 depende de prefijar las entradas con `query:` o `passage:`; la model card de este repositorio no documenta esa convención, por lo que conviene consultar la del modelo original.
- La cuantización Q4_K pierde precisión medible (0,990 de similitud coseno); el autor recomienda Q8_0 salvo restricciones estrictas de memoria.
- La longitud máxima de secuencia no se indica en la información disponible; textos largos pueden requerir truncado o fragmentación.
- Riesgo de sesgos heredados de los datos de entrenamiento originales, que no se detallan en la información disponible.
- La licencia MIT permite uso comercial, pero el repositorio no otorga derechos adicionales a los de la licencia upstream.
- Bajo la normativa europea de IA (Reglamento UE 2024/1689), el proveedor del modelo sigue siendo el autor upstream; este repositorio solo cambia la serialización.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MisterPotato92/multilingual-e5-small-GGUF
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- CrispEmbed: https://github.com/CrispStrobe/CrispEmbed
- Bifurcación de Ollama con soporte XLM-R: https://github.com/CrispStrobe/ollama/tree/feat/xlmr-embedding
- Ollama: https://ollama.com
