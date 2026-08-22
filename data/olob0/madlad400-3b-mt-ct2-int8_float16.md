# olob0/madlad400-3b-mt-ct2-int8_float16

## Resumen

`olob0/madlad400-3b-mt-ct2-int8_float16` es una conversión al formato CTranslate2 del modelo de traducción multilingüe `google/madlad400-3b-mt` de Google, cuantizado con precisión mixta `int8_float16`. El modelo original, MADLAD-400-3B-MT, es un sistema de traducción automática neuronal basado en la arquitectura T5, con 3 mil millones de parámetros, 32 capas encoder-decoder y entrenado sobre 1 billón de tokens que cubren más de 450 idiomas. Esta conversión reduce el peso del modelo de 11,8 GB a 2,8 GB y elimina el paso de conversión previo a la carga, lo que facilita su despliegue en entornos de producción.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un traductor multilingüe de alta calidad en hardware modesto, sin sacrificar demasiada precisión. El formato CTranslate2 está optimizado para inferencia en CPU y GPU, con soporte de decodificación eficiente y uso de memoria reducido. La licencia Apache-2.0 permite uso comercial sin restricciones, heredada del modelo original de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 (encoder-decoder, 32 capas) |
| Parametros totales | 3B (no disponible el desglose exacto) |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo original no publica este dato) |
| Tipos de cuantizacion | int8_float16 (CTranslate2) |
| Idiomas soportados | 450+ idiomas (del modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | CTranslate2 (binario propio, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base MADLAD-400-3B-MT emplea la arquitectura T5 (Text-to-Text Transfer Transformer), un encoder-decoder completamente denso con 32 capas en cada bloque. El tokenizer es un SentencePiece compartido con un vocabulario de 256 000 subpalabras, lo que permite manejar de forma eficiente la gran diversidad de escrituras y alfabetos de los 450+ idiomas soportados. El entrenamiento se realizó sobre el corpus MADLAD-400, un conjunto de datos auditado a nivel de documento con 1 billón de tokens extraídos de fuentes públicas, sin uso de datos paralelos supervisados. No se aplicaron técnicas de RLHF ni DPO; el modelo se entrena exclusivamente con pérdida de modelado de lenguaje en tareas de traducción.

La conversión a CTranslate2 se realizó mediante la herramienta `ct2-transformers-converter` con la opción `--quantization int8_float16`, que cuantifica los pesos lineales y de embedding a int8 y mantiene las activaciones en float16. Esta cuantización reduce el tamaño del modelo en un factor de 4,2 y acelera la inferencia en hardware moderno, especialmente en GPUs con soporte de tensor cores para int8. El tokenizer se copió íntegramente, de modo que no se requiere descarga adicional.

## Capacidades

- Traducción automática multilingüe: soporta más de 450 idiomas, con calidad competitiva frente a modelos mucho más grandes.
- Traducción directa entre idiomas: no requiere un pivote intermedio; se especifica el idioma de destino mediante un token `<2xx>` al inicio del texto fuente.
- Decodificación eficiente: el formato CTranslate2 permite inferencia rápida en CPU y GPU, con soporte de batching dinámico y ejecución asíncrona.
- Integración con el ecosistema Hugging Face: el tokenizer se carga con `AutoTokenizer` y la traducción se ejecuta con la API `ctranslate2.Translator`.
- Compatibilidad con pipelines de traducción en producción: el formato binario de CTranslate2 no requiere conversión en el momento de la carga, lo que reduce la latencia de arranque.
- Sin soporte de tool calling ni agentes: es un modelo de traducción puro, sin capacidades de razonamiento multistep ni generación de código.

## Casos de uso

- Servicio de traducción en tiempo real para plataformas de atención al cliente: el modelo puede traducir consultas de usuarios en decenas de idiomas con baja latencia, gracias a la cuantización int8_float16 que permite ejecutar inferencia en GPUs consumer de 8-16 GB de VRAM.
- Traducción de documentos y contenidos web: la ventana de contexto del modelo original permite procesar párrafos completos, y el formato CTranslate2 facilita el procesamiento por lotes en pipelines de ingestión de datos.
- Integración en pipelines de NLP multilingües: se puede combinar con otros modelos (etiquetado, análisis de sentimiento) para construir sistemas de análisis de texto en múltiples idiomas.
- Traducción de subtítulos y contenido audiovisual: el rendimiento de inferencia en CPU permite su uso en entornos sin GPU, con tiempos de procesamiento aceptables para vídeo de baja resolución.
- Traducción de código y documentación técnica: el modelo maneja bien terminología técnica y nombres de variables, gracias a su entrenamiento sobre corpus de código y documentación pública.
- Despliegue en entornos de borde o dispositivos con recursos limitados: el peso de 2,8 GB y la compatibilidad con CPU permiten su ejecución en servidores sin aceleradores dedicados, aunque con mayor latencia.
- Traducción de contenidos generados por otros LLM: el modelo puede servir como postprocesador para traducir salidas de modelos generativos a otros idiomas, manteniendo la coherencia del texto original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta conversión CTranslate2. El modelo original `google/madlad400-3b-mt` reporta en su model card que es competitivo con modelos de traducción multilingüe de tamaño significativamente mayor, pero no se proporcionan puntuaciones numéricas detalladas en la documentación accesible. En la base de datos OpenModelMap se indica un valor de MMLU de 45, aunque este benchmark no es representativo para tareas de traducción y no se ha verificado su metodología. Se recomienda consultar el paper original para obtener métricas de calidad de traducción en pares de idiomas específicos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo cuantizado a int8_float16 ocupa aproximadamente 2,8 GB en memoria, por lo que cabe en GPU con 4 GB de VRAM o más (por ejemplo, GTX 1650, RTX 3050).
- GPU recomendadas: NVIDIA T4, RTX 3090, A10G o superiores para inferencia en producción; también es compatible con CPU (AVX2/AVX512) para entornos sin GPU.
- En consumer GPU: sí, funciona en RTX 3060, RTX 3070, RTX 4060, entre otras, con throughput típico de 100-300 tokens/segundo en GPU de gama media.
- Opciones de despliegue: la librería `ctranslate2` se integra con Python, y se puede servir mediante la API REST de CTranslate2 o a través de frameworks como FastAPI. No es compatible con vLLM, Ollama ni llama.cpp, ya que usa un formato propietario.
- Latencia estimada: en GPU T4, la traducción de una frase de 20 palabras tarda alrededor de 50-100 ms; en CPU moderno (8 núcleos), entre 300-600 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `google/madlad400-3b-mt` | 3B | No disponible | 450+ | Apache-2.0 | Safetensors |
| `olob0/madlad400-3b-mt-ct2-int8_float16` | 3B | No disponible | 450+ | Apache-2.0 | CTranslate2 |
| `facebook/nllb-200-distilled-600M` | 600M | 512 tokens | 200 | CC-BY-NC | Safetensors |
| `google/mt5-large` | 1.2B | 512 tokens | 101 | Apache-2.0 | Safetensors |

La conversión CTranslate2 ofrece el mismo rendimiento que el modelo original de Google, pero con un peso 4 veces menor y una carga más rápida. En comparación con NLLB-200, MADLAD-400 cubre más del doble de idiomas y no tiene restricciones de licencia comercial, aunque NLLB-200 tiene un tamaño más compacto en su versión destilada. Frente a mT5-large, MADLAD-400 ofrece más idiomas y un rendimiento de traducción superior según el paper, aunque mT5 es más flexible para tareas de generación de texto.

## Limitaciones y advertencias

- La cuantización int8_float16 puede introducir una ligera pérdida de precisión en la traducción, especialmente en idiomas con escrituras complejas o vocabulario técnico. Se recomienda evaluar la calidad en los pares de idiomas de uso específico antes de desplegar en producción.
- El modelo hereda los sesgos del corpus MADLAD-400, que se construyó con datos públicos de Internet; puede generar traducciones con estereotipos o contenido sensible en contextos delicados.
- No se han documentado límites explícitos de longitud de contexto, pero el modelo T5 original tiene una ventana de contexto de 512 tokens; textos más largos deben segmentarse.
- La licencia Apache-2.0 permite uso comercial, pero el modelo original de Google no incluye garantías de exactitud ni de ausencia de errores en la traducción.
- El formato CTranslate2 es específico de la librería `ctranslate2`; no es directamente interoperable con otros frameworks como Transformers o llama.cpp. Para usarlo con Transformers, se debe volver a convertir al formato original.
- No se ha verificado el rendimiento en todos los idiomas; los idiomas con menos representación en el corpus pueden presentar peor calidad de traducción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/olob0/madlad400-3b-mt-ct2-int8_float16
- Modelo original: https://huggingface.co/google/madlad400-3b-mt
- Documentación de MADLAD-400 en Transformers: https://huggingface.co/docs/transformers/model_doc/madlad-400
- Repositorio de investigación de Google: https://github.com/google-research/google-research/blob/master/madlad_400/README.md
- Paper de MADLAD-400 (enlace no disponible en la búsqueda, se infiere del repositorio)
