# smdesai/GLiNER25-Multi-Decide-FP16-CoreAI

## Resumen

GLiNER25-Multi-Decide-FP16-CoreAI es una conversión del modelo base fastino/GLiNER2.5-multi-Decide (Apache-2.0) al formato Core AI de Apple, pensada para ejecución en dispositivo (on-device) en iOS 27+ y macOS 27+. El autor, smdesai, ha exportado únicamente la parte de clasificación del checkpoint: el encoder mDeBERTa-v3-base junto con la MLP clasificadora, dejando fuera la tabla de embeddings de palabras, que se entrega como un fichero aparte (`word_embeddings.f16`) que el host consulta mediante mmap. Se describe como text-classification y está orientado a dispositivos Apple con acceso a GPU/ANE.

La conversión mantiene los pesos aprendidos sin cambios y expone tres funciones de contexto fijo (`context128`, `context256`, `context512`) con un máximo de 512 tokens. El grafo emplea buckets constantes de posición relativa, sesgo de desplazamiento relativo sin gather y SDPA fusionado. El repositorio ocupa 0,6 GB, de los cuales 384 MB son la tabla de embeddings (250.112 × 768 en FP16) y 174 MB el asset FP16 del modelo.

Es relevante ahora porque permite desplegar reconocimiento/etiquetado multilingüe y clasificación de texto en el propio dispositivo Apple sin enviar datos a la nube, con tiempos de inferencia del orden de 10-32 ms en un iPhone 17 Pro y una huella de memoria de 213-243 MiB. La licencia Apache-2.0 facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder mDeBERTa-v3-base + MLP clasificadora |
| Parametros totales | ~278 M (derivado: la tabla de embeddings, 250.112 × 768 = 192.086.016, representa el 69%) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | maxima de 512 tokens (funciones context128, context256 y context512) |
| Tipos de cuantizacion | FP16 (exportacion FP16) |
| Idiomas soportados | multilingual, en (validado en ingles y otras 25 lenguas/escrituras) |
| Licencia | apache-2.0 |
| Formato de pesos | Core AI asset (`GLiNER25-multi-Decide-FP16.aimodel/main.mlirb`), `word_embeddings.f16` (FP16 little-endian, row-major, sin cabecera, 384.172.032 bytes), `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo es un encoder transformer mDeBERTa-v3-base seguido de una MLP de clasificación. La exportación cubre solo la ruta de clasificación: encoder más clasificador. El tokenizador es el del checkpoint base, un Unigram de 250.000 piezas (mDeBERTa-v3), con el layout `classify_text` del procesador GLiNER2 (esquema `( [P] task ( [L] label ... ) )`, `[SEP_TEXT]` y las palabras del texto en minúsculas, cada pieza tokenizada por separado, sin `[CLS]`/`[SEP]`). La clasificación se lee en las posiciones de los marcadores `[L]` del esquema.

Como innovación de la conversión, la tabla de embeddings de palabras (el 69% de los parámetros) se mantiene fuera del modelo y se consulta en el host mediante mmap, copiando una fila de 1.536 bytes por token. La LayerNorm de embeddings y el resto de la red van en el modelo, de modo que los resultados son idénticos bit a bit a una búsqueda dentro del grafo. El grafo usa buckets constantes de posición relativa, sesgo de desplazamiento relativo sin gather y SDPA fusionado. La exportación se realizó con coreai-torch 0.4.3 / coreai-core 1.0.0b3 / Torch 2.11.0 sobre el checkpoint en la revisión `6bc1d43d201b0691e733626389af8c57eea3ea68`. No se especifican en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO).

## Capacidades

- Clasificación de texto y etiquetado por token mediante esquemas de etiquetas (zero-shot según el diseño de GLiNER2).
- Reconocimiento de entidades y clasificación guiada por esquema, leyendo los marcadores `[L]` de la petición.
- Multilingüe: validado en inglés y otras 25 lenguas y escrituras (incluidas peticiones de 257-512 tokens).
- Ejecución on-device en Apple: funciones de contexto fijo (128, 256 y 512 tokens).
- Inferencia determinista: tres lanzamientos producen resultados idénticos.
- No incluye, en esta conversión, la ruta de extracción de spans de NER completa (solo clasificación).
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Etiquetado de entidades en el dispositivo: el modelo clasifica posiciones de tokens según un esquema de etiquetas, lo que permite extraer entidades de notas, mensajes o documentos sin salir del iPhone o Mac.
- Clasificación de correos y mensajes en apps de productividad: con context256 (15 ms en iPhone 17 Pro) se puede categorizar texto entrante por temas o intenciones de forma local.
- Moderación de contenido local: clasificar comentarios o textos de usuario con un esquema de etiquetas sensible, evitando enviar contenido a servidores.
- Procesamiento de texto sanitario o legal con privacidad: al ejecutarse on-device, los datos sensibles no abandonan el dispositivo, lo que encaja con requisitos de confidencialidad.
- Preprocesado para asistentes conversacionales: clasificar la intención o el dominio de una consulta antes de enrutarla a otro componente del sistema.
- Análisis multilingüe en aplicaciones iOS: al estar validado en 26 lenguas/escrituras, permite clasificar texto de usuarios internacionales con el mismo binario.
- Enriquecimiento de datos en pipelines de macOS: etiquetar lotes de texto (fichas, tickets, registros) con context512 (32 ms) para tareas batch de clasificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor aporta en su lugar datos de validación frente a un oracle FP32 de PyTorch, con una pasarela estricta (toda decisión coincide y el error máximo de probabilidad es ≤ 0,005). Córpora: 43 peticiones (context128), 80 (context256) y 113 (context512), en inglés y otras 25 lenguas/escrituras, incluidas peticiones de 257-512 tokens.

| Funcion | Error max. de probabilidad | Mediana de latencia | Huella maxima |
|---|---:|---:|---:|
| context128 | 0,0037 | 10,7-10,8 ms | 213 MiB |
| context256 | 0,0037 | 15,0-15,1 ms | 218 MiB |
| context512 | 0,0037 | 31,9 ms | 226-243 MiB |

Mediciones en iPhone 17 Pro con iOS 27.2 y GPU. Con las tres funciones cargadas en un mismo proceso, la huella máxima es de 223-264 MiB. En un Mac (M3 Max) con GPU, el error máximo es 0,0034 / 0,0034 / 0,0045. La primera carga especializa el asset para el dispositivo (~2-3 s) y las posteriores usan la caché del sistema (0,01 s).

## Requisitos de hardware

- Huella de memoria en dispositivo: 213 MiB (context128), 218 MiB (context256) y 226-243 MiB (context512); hasta 264 MiB con las tres funciones cargadas.
- Plataformas objetivo: iOS 27+ y macOS 27+ con Core AI; validado en iPhone 17 Pro (iOS 27.2) y en un Mac con M3 Max.
- Colocación en GPU obligatoria: la conversión inglesa con el mismo grafo se bloqueó con una aserción de región ANE de MPSGraph bajo la colocación por defecto en iOS 27.2; debe usarse `preferredComputeUnitKind: .gpu`. La colocación por defecto no se ha probado con este modelo.
- Almacenamiento: repositorio de 0,6 GB (384 MB de embeddings + 174 MB del asset FP16 + tokenizador).
- No se documentan opciones de despliegue alternativas (vLLM, llama.cpp, Ollama, TGI); está atado al runtime de Core AI de Apple.
- Latencia: 10,7-31,9 ms según función en iPhone 17 Pro; la búsqueda de embeddings tarda 40-75 µs por token con el fichero en caché de página (1-5 ms más en las primeras peticiones tras la instalación).

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smdesai/GLiNER25-Multi-Decide-FP16-CoreAI | mDeBERTa-v3-base + MLP clasificadora, export Core AI | 512 tokens (funciones 128/256/512) | multilingual, en (26 lenguas/escrituras) | apache-2.0 | Core AI (iOS 27+/macOS 27+), GPU |
| fastino/GLiNER2.5-multi-Decide (base) | mDeBERTa-v3-base + clasificador GLiNER2 | no disponible en la informacion | multilingual, en | apache-2.0 | Pesos PyTorch/HF |
| Conversion GLiNER2.5-Decide (inglesa, misma familia) | mismo grafo que esta conversion | no disponible | en | apache-2.0 | Core AI; sufrio la asercion ANE indicada |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Máximo de 512 tokens: hay que rechazar las peticiones más largas, no truncarlas; el límite es fijo por función.
- Se debe seleccionar la función más pequeña que quepa en la petición y rellenar (pad id 0) hasta su longitud.
- La conversión es solo de clasificación; no incluye la ruta completa de extracción de spans de GLiNER2.
- Colocación en GPU obligatoria: la colocación por defecto puede provocar una aserción de región ANE de MPSGraph (observado en la conversión inglesa en iOS 27.2). No se ha probado la colocación por defecto en este modelo.
- Primera carga lenta (~2-3 s) por especialización del asset; las posteriores usan caché.
- Riesgo de sesgo y alucinación no documentado en la información disponible; al derivar de mDeBERTa-v3-base, hereda las limitaciones del modelo base y de sus datos.
- Licencia Apache-2.0: permite uso comercial con las obligaciones habituales de atribución; conviene revisar los términos del modelo base.
- Compatibilidad restringida a iOS 27+ y macOS 27+; no hay soporte documentado fuera de Core AI.
- Este repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin garantía de mantenimiento por parte del autor.

## Enlaces

- HuggingFace: https://huggingface.co/smdesai/GLiNER25-Multi-Decide-FP16-CoreAI
- Modelo base: https://huggingface.co/fastino/GLiNER2.5-multi-Decide
- Revisión del checkpoint: `6bc1d43d201b0691e733626389af8c57eea3ea68`
- Paper, blog, repositorio o demo adicionales: no disponible
