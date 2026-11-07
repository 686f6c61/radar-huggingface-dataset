# skaldrim/opus-mt-is-en-ct2-int8

## Resumen
`skaldrim/opus-mt-is-en-ct2-int8` es una conversión a CTranslate2 con cuantización int8 de los modelos de traducción automática neuronal de OPUS-MT para el par islandés-inglés e inglés-islandés. El autor original de los pesos es el grupo de investigación en tecnología del lenguaje de la Universidad de Helsinki (Jörg Tiedemann, Santhosh Thottingal y colaboradores), que entrenó los modelos con Marian NMT sobre el corpus OPUS. Esta versión concreta solo cambia el formato, no el contenido: no hay reentrenamiento ni ajuste fino, únicamente la conversión de los pesos de Hugging Face (Marian) a CTranslate2 con cuantización int8.

El paquete contiene dos carpetas independientes, una por dirección de traducción (`opus-mt-is-en` y `opus-mt-en-is`), cada una con su `model.bin`, su `config.json`, un vocabulario compartido y los modelos SentencePiece originales (`source.spm`, `target.spm`). El objetivo declarado es la traducción en dispositivo de subtítulos dentro de la aplicación Skaldrim, sin enviar texto a servidores externos. Por su tamaño reducido (unos 76 MB por dirección en int8) y su licencia Apache-2.0, es una opción práctica para traducción islandés-inglés embebida en aplicaciones de escritorio o móviles.

La relevancia actual es la de un recurso de infraestructura: los modelos OPUS-MT son una referencia consolidada para traducción de baja latencia y bajo coste en pares de idiomas con pocos recursos, y esta conversión facilita su despliegue en entornos con CPU o recursos limitados mediante CTranslate2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder de Marian NMT (OPUS-MT) |
| Parametros totales | no disponible (pesos int8 de 76.263.555 bytes por dirección) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (CTranslate2, `--quantization int8`) |
| Idiomas soportados | islandés (is) e inglés (en), en ambas direcciones |
| Licencia | Apache-2.0 |
| Formato de pesos | CTranslate2 (`model.bin`), más `config.json`, `shared_vocabulary.json` y modelos SentencePiece (`source.spm`, `target.spm`) |

## Arquitectura y entrenamiento
Cada dirección es un transformer encoder-decoder entrenado con Marian NMT por el grupo OPUS-MT sobre la colección de corpus OPUS. La model card original de OPUS-MT cita el artículo de Tiedemann y Thottingal (EAMT 2020) como referencia del sistema. La tokenización se realiza con modelos SentencePiece independientes para origen y destino, que en esta conversión se mantienen idénticos a los originales.

La conversión se hizo con `ct2-transformers-converter --quantization int8` a partir de los pesos Marian de Hugging Face. No hubo entrenamiento adicional, ajuste fino ni modificación del vocabulario o de los tokenizadores; el autor indica explícitamente que solo cambió el formato. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset más allá de la referencia al corpus OPUS, ni sobre el uso de RLHF o DPO (no aplicable en este tipo de modelos de traducción).

## Capacidades
- Traducción automática islandés a inglés (`opus-mt-is-en`).
- Traducción automática inglés a islandés (`opus-mt-en-is`).
- Traducción de frases y párrafos cortos, con el objetivo declarado de traducir subtítulos de vídeo en dispositivo.
- Tokenización SentencePiece integrada para ambos idiomas.
- Inferencia en CPU y GPU mediante CTranslate2, con pesos int8 para reducir memoria y latencia.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- No es un modelo generativo de propósito general: su única tarea es la traducción entre los dos idiomas indicados.

## Casos de uso
- Traducción de subtítulos en aplicaciones de escritorio o móviles: el modelo está pensado para traducir texto de subtítulos localmente, sin enviar datos a un servidor, gracias a su tamaño reducido y a la inferencia con CTranslate2.
- Traducción en tiempo real de conversaciones escritas islandés-inglés: la baja latencia esperada de un modelo de 76 MB en int8 permite integrarlo en chats o herramientas de mensajería.
- Procesamiento por lotes de corpus islandeses: traducción masiva de documentos, artículos o transcripciones al inglés en pipelines offline con CPU.
- Localización de contenidos: traducción de cadenas de interfaz o documentación breve entre islandés e inglés en herramientas de localización.
- Preprocesamiento para búsqueda y análisis: traducción de textos islandeses a inglés para alimentar índices de búsqueda o sistemas de análisis que solo funcionan bien en inglés.
- Prototipado de sistemas de traducción: servir como línea base ligera y de código abierto para comparar con modelos más grandes o para validar pipelines de CTranslate2 antes de escalar.
- Traducción integrada en dispositivos con recursos limitados: su tamaño permite desplegarlo en equipos sin GPU dedicada o en entornos edge.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: muy baja; cada dirección ocupa unos 76 MB en int8, por lo que el modelo completo cabe holgadamente en cualquier GPU consumer e incluso en memoria unificada de dispositivos móviles.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere una A100, H100 o RTX 4090. Una GPU integrada o una GTX 1650 en adelante ya ofrecen margen sobrado.
- Cabe en GPU consumer: sí, en todas las gamas actuales, y también funciona en CPU.
- Opciones de despliegue: CTranslate2 (biblioteca nativa o bindings de Python), con soporte de inferencia en CPU y GPU. No se distribuye en formato GGUF, por lo que no es directamente compatible con llama.cpp u Ollama sin conversión adicional.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera una latencia de milisegundos por frase en CPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| skaldrim/opus-mt-is-en-ct2-int8 | no disponible (76 MB int8 por dirección) | no disponible | is, en | Apache-2.0 | CTranslate2 int8 |
| Helsinki-NLP/opus-mt-is-en | no disponible | no disponible | is, en | Apache-2.0 | PyTorch/safetensors (Marian) |
| Helsinki-NLP/opus-mt-en-is | no disponible | no disponible | en, is | Apache-2.0 | PyTorch/safetensors (Marian) |
| Otros modelos OPUS-MT del catálogo | variable según par | no disponible | múltiples pares | Apache-2.0 | PyTorch/safetensors |

La diferencia principal frente a los modelos originales de Helsinki-NLP es el formato y la cuantización: esta versión está optimizada para CTranslate2 en int8, lo que reduce el tamaño y acelera la inferencia en CPU, a costa de una posible pérdida mínima de calidad respecto a los pesos originales en precisión completa. No se dispone de datos de benchmarks que permitan cuantificar esa diferencia.

## Limitaciones y advertencias
- Es una conversión de formato, no un modelo nuevo: hereda todas las limitaciones de los OPUS-MT originales para islandés-inglés.
- Solo cubre el par islandés-inglés en ambas direcciones; no traduce otros idiomas.
- No se han publicado evaluaciones de calidad para esta conversión int8; la cuantización puede introducir degradación menor respecto a los pesos originales.
- Riesgo de alucinación y de traducciones incorrectas en textos especializados, dominios técnicos o frases ambiguas, como en cualquier sistema de traducción automática neuronal.
- No es adecuado para tareas generativas, razonamiento, código o agentes.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda conservar la atribución a los autores originales de OPUS-MT y citar el artículo de Tiedemann y Thottingal (2020).
- El autor advierte de que cualquier error en la conversión es responsabilidad suya, no de los creadores originales.
- No se distribuye en GGUF ni en otros formatos para llama.cpp u Ollama; requiere CTranslate2 para su uso directo.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/skaldrim/opus-mt-is-en-ct2-int8
- Modelo base islandés-inglés: https://huggingface.co/Helsinki-NLP/opus-mt-is-en
- Modelo base inglés-islandés: https://huggingface.co/Helsinki-NLP/opus-mt-en-is
- Repositorio OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Guía de OPUS-MT en CTranslate2: https://opennmt.net/CTranslate2/guides/opus_mt.html
- Repositorio CTranslate2: https://github.com/OpenNMT/CTranslate2
- Artículo de referencia: Tiedemann, J. y Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. Proceedings of the 22nd Annual Conference of the European Association for Machine Translation (EAMT).
