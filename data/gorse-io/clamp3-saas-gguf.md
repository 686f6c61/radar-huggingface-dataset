# gorse-io/CLaMP3-SAAS-GGUF

## Resumen

CLaMP3-SAAS-GGUF es una conversión no oficial al formato GGUF del checkpoint SAAS del modelo `sander-wood/clamp3`, publicada por `gorse-io`. No es una versión oficial de CLaMP3 ni un modelo de lenguaje generativo: se trata de un extractor de características (pipeline `feature-extraction`) que proyecta texto y características de audio musical a un espacio de embeddings común de 768 dimensiones. El encoder de texto es una XLM-RoBERTa base (configuración y tokenizer de `FacebookAI/xlm-roberta-base`), y la rama de audio consume características precalculadas de MERT-v1-95M, no forma de onda en bruto.

El interés práctico de esta publicación es que permite ejecutar el modelo en CPU mediante un runtime nativo propio (`clap-model` de `gorse-io/clap.cpp`), sin dependencias de Transformers, llama.cpp, Ollama ni TGI. Se ofrecen cuatro niveles de precisión (F32, F16, Q8_0 y Q4_K_M) con métricas de fidelidad medidas frente al checkpoint F32 de referencia. La conversión omite deliberadamente los componentes simbólicos e imágenes del checkpoint original, por lo que cubre únicamente entrada de texto y características de audio MERT.

La relevancia actual es acotada y específica: sirve para construir sistemas de recuperación y alineación música-texto multilingües en entornos donde no se dispone de GPU. Conviene subrayar que el Q4_K_M presenta una deriva de texto notable (coseno mínimo ~0,9693) y que el modelo debe evaluarse en la tarea concreta antes de usarse en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dual-encoder (texto: XLM-RoBERTa base; audio: proyección sobre características MERT-v1-95M), arquitectura GGUF `general.architecture=clamp3` |
| Parametros totales | No disponible de forma explicita; el GGUF F32 ocupa 1.464.290.528 bytes, equivalente a ~366 M de parametros almacenados en F32 (incluye 397 tensores) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No se declara un limite formal; el encoder de texto aplica agregacion por chunks sin truncado implicito a 512 tokens, validado con una entrada de 722 tokens |
| Tipos de cuantizacion | F32, F16, Q8_0 y Q4_K_M |
| Idiomas soportados | Multilingue (tokenizer XLM-R Unigram/Precompiled embebido) |
| Licencia | MIT |
| Formato de pesos | GGUF (custom, cargable solo por el runtime `clap-model` de `gorse-io/clap.cpp`) |

## Arquitectura y entrenamiento

La arquitectura es un dual-encoder de recuperación: un encoder de texto XLM-RoBERTa base y una rama de audio que no procesa forma de onda, sino características precalculadas de MERT-v1-95M (float32, C-contiguo, little-endian, forma `[T,768]` o `[1,T,768]`) que se proyectan al mismo espacio de 768 dimensiones. Las salidas no están normalizadas L2. El encoder de audio añade un vector cero inicial y final, usa chunks de 128 frames, sustituye un chunk final parcial por una ventana completa solapada, aplica padding y máscara, hace pooling de media enmascarado, una proyección aprendida y agrega con pesos de chunk completo/resto. El texto usa el tokenizer XLM-R embebido con la misma agregación por chunks. Cada fichero contiene 397 tensores.

No se detallan en la información disponible los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) del checkpoint original `sander-wood/clamp3`; esta publicación es únicamente una conversión de pesos, verificada por hash SHA-256 frente al checkpoint fuente en la revisión `355625cc1c6f73726bbcd0eb9276ac7152d56426`. La conversión excluye los encoders simbólicos, las entradas ABC/MTF/MusicXML/imagen y los pesos no usados de pooler de texto/audio y word-embedding de audio, por lo que no constituye el checkpoint multimodal original completo. No se emplearon pesos sintéticos ni corpus de calibración para las cuantizaciones.

## Capacidades

- Extracción de embeddings de texto multilingüe en 768 dimensiones (sin normalización L2).
- Extracción de embeddings de audio musical a partir de características MERT-v1-95M precalculadas.
- Alineación texto-música en un espacio vectorial común, apta para recuperación y similitud semántica.
- Procesamiento de entradas de texto largas mediante agregación por chunks (validado con 722 tokens, sin truncado silencioso a 512).
- Soporte multilingüe de texto heredado de XLM-R.
- No es un modelo generativo: no produce texto, no soporta tool calling, function calling, agentes ni razonamiento multi-step.
- No procesa audio en bruto ni entradas simbólicas (ABC, MTF, MusicXML) ni imágenes.

## Casos de uso

- Búsqueda semántica de música por descripción textual: indexar un catálogo con embeddings de audio (vía MERT) y consultar con descripciones en lenguaje natural proyectadas al mismo espacio de 768 dimensiones.
- Recomendación música-texto: calcular similitud coseno entre preferencias expresadas en texto y embeddings de pistas para generar candidatos.
- Recuperación multilingüe: al usar el tokenizer XLM-R, permite consultas en distintos idiomas sobre un mismo índice musical.
- Clustering y deduplicación de catálogo: agrupar pistas por proximidad vectorial para organizar bibliotecas o detectar duplicados.
- Anotación asistida de metadatos: usar similitudes con descripciones etiquetadas para sugerir género, ambiente o instrumentación.
- Prototipado en CPU sin GPU: desplegar el modelo con el ejecutable `clap-model` en servidores modestos para validar pipelines de recuperación antes de escalar.
- Generación de playlists por similitud: construir listas a partir de vecinos más cercanos en el espacio de embeddings de audio.
- Filtrado previo en pipelines de MIR (music information retrieval): usar los embeddings como etapa de recuperación antes de modelos más costosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K, recuperación, etc.) en la información disponible. El autor sí aporta métricas de fidelidad de cuantización frente al checkpoint F32 de referencia, medidas sobre un conjunto de prueba determinista y pequeño; no son puntuaciones de recuperación.

| Fichero | Bytes | Coseno minimo (texto) | Coseno minimo (feature audio) |
|---|---:|---:|---:|
| `clamp3-saas-f32.gguf` | 1.464.290.528 | 1,0000000000 | 1,0000000000 |
| `clamp3-saas-f16.gguf` | 737.198.816 | 0,9999996841 | 0,9999998536 |
| `clamp3-saas-q8_0.gguf` | 396.376.928 | 0,9992065834 | 0,9999093049 |
| `clamp3-saas-q4_k_m.gguf` | 233.156.288 | 0,9692604337 | 0,9950416007 |

El Q4_K_M presenta una deriva de texto sustancial (coseno mínimo ~0,9693 y error L2 relativo máximo de ~24,7%); el autor advierte explícitamente de no asumirlo equivalente a F32/F16. El Q8_0 alcanza un coseno mínimo de texto de ~0,9992. Ambas cuantizaciones se generaron directamente desde F32.

## Requisitos de hardware

- VRAM: no requiere GPU; la validación oficial se realizó en CPU con ICU del sistema.
- Memoria RAM aproximada según fichero: F32 ~1,5 GB; F16 ~737 MB; Q8_0 ~396 MB; Q4_K_M ~233 MB, más el overhead del runtime.
- GPU recomendadas: ninguna obligatoria; no se documenta soporte GPU para este runtime.
- Cabe en cualquier equipo de consumo: el fichero más pequeño (Q4_K_M) ocupa 233 MB y el F32 ~1,46 GB.
- Preprocesamiento adicional: la extracción de características MERT-v1-95M es externa (script `preprocessing/audio/extract_mert.py` con `--mean_features`), con sus propios pesos y licencia, no incluidos en el GGUF.
- Despliegue: exclusivamente el ejecutable nativo `clap-model` de `gorse-io/clap.cpp` (revisión probada `e5221ec109920d942263b353e8d83f02daacd2c3`, ggml `a05c9922613c6a2230dbb1d0de679519ecafb4f0`). No es compatible con vLLM, llama.cpp, Ollama, TGI ni Transformers, y no hay soporte de inferencia alojada en el Hub.
- Latencia y throughput: no disponibles en la información proporcionada; la validación usó 2 hilos de CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CLaMP3-SAAS-GGUF (este) | Embeddings musica-texto (dual-encoder) | ~366 M en F32 (derivado) | Sin truncado implicito a 512; validado a 722 tokens | MIT | GGUF via runtime `clap-model` |
| `sander-wood/clamp3` (base oficial) | CLaMP3 completo (incluye componentes simbolicos) | No disponible | No disponible | No disponible en la informacion | Checkpoint original en HF |
| `m-a-p/MERT-v1-95M` | Encoder de audio musical (features) | ~95 M | No disponible | No disponible en la informacion | HF, usado como preprocesamiento externo |
| `FacebookAI/xlm-roberta-base` | Encoder de texto multilingue | No disponible | 512 tokens por chunk (base) | No disponible en la informacion | HF, usado como base del encoder de texto |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada, por lo que no se ofrece una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Es una conversión no oficial; no debe presentarse como lanzamiento oficial de CLaMP3.
- No es un modelo de lenguaje: no genera texto ni soporta tool calling, agentes o razonamiento.
- El Q4_K_M muestra deriva de texto significativa (~24,7% de error L2 relativo máximo); no se debe asumir equivalencia con F32/F16 ni preservación de precisión en recuperación.
- El autor advierte que las similitudes reportadas no son puntuaciones de recuperación; hay que evaluar en la tarea propia.
- No soporta audio en bruto: requiere características MERT-v1-95M precalculadas externamente, con pesos y licencia a revisar por separado.
- Los componentes simbólicos (ABC, MTF, MusicXML) e imagen del checkpoint original están omitidos; no cubre esas modalidades.
- El runtime es específico (`clap-model`); no es cargable en llama.cpp, Ollama, Transformers, TGI ni vLLM, y no hay inferencia alojada en el Hub.
- Las salidas no están normalizadas L2; el consumidor debe aplicar normalización si su métrica lo requiere.
- La deduplicación/reordenación de líneas en ficheros de texto del flujo original es un paso externo no garantizado por la API de cadena directa del runtime nativo.
- Licencia MIT para los pesos GGUF, pero las dependencias externas (MERT, XLM-R) deben revisarse por separado.
- Riesgo de sesgo: no documentado en la información disponible; al ser un modelo multilingüe basado en XLM-R, puede heredar sesgos de su corpus de entrenamiento, no verificados aquí.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gorse-io/CLaMP3-SAAS-GGUF
- Modelo base: https://huggingface.co/sander-wood/clamp3
- Runtime nativo `clap.cpp`: https://github.com/gorse-io/clap.cpp
- Encoder de texto base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Extractor de características de audio: https://huggingface.co/m-a-p/MERT-v1-95M
