# kawshikbuet17/bangla-heteronym-mdeberta-v3-base

## Resumen

El modelo `bangla-heteronym-mdeberta-v3-base` es un clasificador de desambiguación de heterónimos en bengalí (bangla), desarrollado por Kawshik Kumar Paul (BUET). Resuelve un problema muy concreto de la síntesis de voz en bengalí: muchas palabras se escriben igual pero se pronuncian de forma distinta según el contexto oracional (por ejemplo, "কর" puede leerse como impuesto, como imperativo de "hacer" o como forma de futuro). El modelo recibe la oración con la palabra marcada y devuelve la lectura correcta, expresada como una reescritura en escritura bengalí que el front-end del sistema TTS puede usar para la conversión grafema-fonema.

Se trata de un ajuste fino de `microsoft/mdeberta-v3-base`, un transformer encoder de tipo DeBERTa-v3 con 278 millones de parámetros, sobre el dataset `kawshikbuet17/bangla-heteronyms`. La tarea es de clasificación restringida: no genera texto libre, sino que puntúa las lecturas candidatas conocidas de cada heterónimo y elige la de mayor probabilidad. Esta restricción hace que el modelo sea muy ligero en inferencia (24,9 ms por oración en una Tesla T4) y determinista en su salida, pero también limita su alcance estrictamente al vocabulario del dataset.

Su relevancia es acotada pero clara: demuestra que un encoder multilingüe de tamaño base es suficiente para resolver la ambigüedad léxica de heterónimos en bengalí con una precisión cercana al 97,5 %, y lo publica con licencia MIT junto a un benchmark reproducible de 12 modelos. No obstante, el propio autor recomienda para la mayoría de usos el checkpoint `bangla-heteronym-banglabert`, que obtiene 99,46 % con menor latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3, ajuste fino de `microsoft/mdeberta-v3-base`) con cabeza lineal de clasificación |
| Parametros totales | 278.218.752 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (longitud máxima de entrada de mDeBERTa-v3-base, no especificada en la información) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors; no se documentan cuantizaciones GGUF/ONNX) |
| Idiomas soportados | bengalí (bn) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea | Clasificación de lecturas de heterónimos (text-to-speech / grapheme-to-phoneme) |
| Dataset de entrenamiento | `kawshikbuet17/bangla-heteronyms` |
| Tamaño del repositorio | 1,1 GB |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/mdeberta-v3-base`, un encoder transformer de la familia DeBERTa-v3 con atención desenredada y embeddings de posición relativos, al que se le añade una cabeza lineal específica. La entrada se construye concatenando la palabra objetivo con la oración en la que aparece marcada mediante delimitadores (`@`), de modo que el encoder dispone del contexto oracional completo. La cabeza lineal se aplica sobre la representación del token del marcador de apertura y produce una puntuación por cada lectura candidata del heterónimo; la lectura con mayor puntuación es la salida. Las lecturas se representan como reescrituras en escritura bengalí (por ejemplo, `করো` o `কোরো`), y el hasanta visible se codifica como hasanta más ZWNJ.

El ajuste fino se realizó sobre el dataset `kawshikbuet17/bangla-heteronyms`, con 14 oraciones por lectura, usando AdamW, tasa de aprendizaje 3e-5, tamaño de lote 32, precisión fp32, un máximo de 10 épocas con parada temprana sobre la precisión de validación, en una única Tesla T4. No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación, ni el volumen total de tokens de entrenamiento. La innovación técnica principal no está en la arquitectura, sino en el planteamiento del problema: reducir la desambiguación de pronunciación a una clasificación cerrada sobre lecturas conocidas, lo que evita la generación libre y sus errores asociados.

## Capacidades

- Desambiguación de heterónimos en bengalí: dado un texto y una palabra heterónima, selecciona la lectura correcta según el contexto oracional.
- Foneticización de texto completo (`phoneticize`): sustituye todas las apariciones de heterónimos conocidos por su lectura y deja el resto del texto intacto.
- Foneticización con metadatos (`phoneticize_detailed`): devuelve la posición, la lectura y la confianza de cada heterónimo sustituido.
- Predicción de una palabra concreta (`predict`): devuelve la lectura de la primera aparición de un heterónimo en una oración.
- Predicción sobre palabra marcada (`predict_marked`, `phoneticize_marked`): permite desambiguar una ocurrencia específica cuando la palabra aparece varias veces en el texto.
- Procesamiento por lotes: todas las funciones tienen variantes `_batch` que procesan listas de entradas en una sola pasada.
- Integración en pipelines TTS: la salida en escritura bengalí está pensada para alimentar el front-end grafema-fonema de un sistema de síntesis de voz.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto libre.

## Casos de uso

- Front-end de un sistema TTS en bengalí: el modelo se ejecuta antes del conversor grafema-fonema para fijar la pronunciación de palabras ambiguas; su latencia de 24,9 ms por oración en T4 permite integrarlo en tiempo real en un servicio de lectura de textos.
- Lectura de noticias y artículos por voz: `phoneticize` recorre el texto completo y sustituye cada heterónimo conocido, de modo que el sintetizador recibe una transcripción no ambigua sin intervención manual.
- Audiolibros y narración automatizada: el procesamiento por lotes (`phoneticize_batch`) permite preprocesar capítulos enteros y revisar las sustituciones con las confianzas devueltas por `phoneticize_detailed` antes de la síntesis.
- Asistentes de voz en bengalí: la función `predict_marked` permite desambiguar una ocurrencia concreta cuando la palabra se repite, útil en respuestas generadas dinámicamente cuyo contexto no se conoce de antemano.
- Herramientas de accesibilidad para lectores de pantalla: el modelo puede insertarse en el pipeline de un lector que opere sobre texto bengalí para mejorar la inteligibilidad de la lectura en voz alta.
- Investigación en grafema-fonema para lenguas de la India: el repositorio de benchmark asociado y las funciones de evaluación permiten comparar modelos de desambiguación léxica con un conjunto de test fijo de 1.104 oraciones.
- Preprocesado en pipelines de subtitulado o doblaje: la salida con posiciones y confianzas facilita la revisión humana de los puntos dudosos antes de generar el audio.

## Benchmarks y rendimiento

Conjunto de test del split principal: 1.104 oraciones, 3 por lectura.

| Metrica | Resultado |
|---|---|
| Accuracy (checkpoint, semilla 42) | 97,46 % |
| Macro-F1 (checkpoint, semilla 42) | 97,37 % |
| Accuracy (media de 3 semillas) | 97,61 ± 0,14 % |
| Macro-F1 (media de 3 semillas) | 97,48 ± 0,10 % |
| Latencia por oración (T4, fp32, batch 1) | 24,9 ms |
| Latencia por oración (CPU, 4 hilos) | 118 ms |
| Throughput (T4, batch 32) | ~240 oraciones/s |
| Posición en el benchmark de 12 modelos (accuracy media) | 8.ª de 12 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este modelo, ya que su tarea no es de propósito general. El autor indica que el mejor modelo del benchmark es `bangla-heteronym-banglabert`, con 99,46 % de accuracy y 12,5 ms en T4.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 278 millones de parámetros; en fp32 ocupa aproximadamente 1,1 GB de pesos, y en fp16 alrededor de 0,56 GB. Con activaciones y overhead del runtime, se puede ejecutar con comodidad en GPUs de 4 GB o más.
- GPU recomendadas: Tesla T4 (medida de referencia del autor), así como A100, H100, L4 o RTX 4090 para despliegues de mayor volumen; el modelo no requiere GPUs de gama alta.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo con 4 GB o más de VRAM (RTX 3050, RTX 3060, RTX 4060, etc.).
- CPU: funciona en CPU con 4 hilos a 118 ms por oración; viable para procesamiento por lotes no interactivo.
- Opciones de despliegue: el autor distribuye un `Predictor` propio en el repositorio de GitHub, que requiere clonar el repositorio e instalar sus dependencias. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; al ser un encoder con cabeza personalizada, el despliegue estándar sería con PyTorch y Transformers más el código del autor.
- Latencia y throughput: 24,9 ms por oración en T4 con batch 1 y unas 240 oraciones por segundo con batch 32; en CPU, 118 ms por oración con 4 hilos.

## Comparativa con modelos similares

| Modelo | Parametros | Accuracy (media de test) | Latencia (T4) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bangla-heteronym-mdeberta-v3-base` (este) | 278 M | 97,61 ± 0,14 % | 24,9 ms | MIT | Hugging Face |
| `bangla-heteronym-banglabert` | no disponible | 99,46 % | 12,5 ms | no disponible en la información | Hugging Face |
| Otros 10 modelos del benchmark del autor | no disponible | no disponible por modelo | no disponible | no disponible | Hugging Face (repositorio del benchmark) |

El autor sitúa este checkpoint en octava posición de 12 modelos por accuracy media y recomienda `bangla-heteronym-banglabert` para la mayoría de usos, al ser más preciso y más rápido. No se dispone en la información proporcionada de las especificaciones completas de los otros diez modelos del benchmark.

## Limitaciones y advertencias

- Cobertura léxica cerrada: solo desambigua los heterónimos presentes en el dataset `kawshikbuet17/bangla-heteronyms`. Para cualquier otra palabra, `predict` lanza un `ValueError` y el modelo no tiene lecturas entre las que elegir.
- Dominio de entrenamiento sintético: las oraciones se escribieron específicamente para el dataset, por lo que la precisión sobre texto real puede ser inferior al 97,5 % reportado.
- Una única lengua: solo bengalí (bn); no hay soporte multilingüe pese a partir de un modelo multilingüe.
- Sin generación libre: no es un modelo de chat, razonamiento ni código; cualquier uso fuera de la clasificación de lecturas de heterónimos no está soportado.
- Dependencia de código externo: requiere el repositorio de GitHub del autor y su clase `Predictor`; no es cargable directamente con `AutoModelForSequenceClassification` de Transformers sin adaptaciones.
- Riesgo de alucinación bajo en la tarea, pero posible error de clasificación en contextos ambiguos o poco frecuentes; las confianzas devueltas por `phoneticize_detailed` permiten filtrar casos dudosos.
- Sesgos: no se documentan análisis de sesgo en la información disponible; el dataset está limitado a las oraciones escritas por el autor.
- Licencia MIT: permite uso comercial y modificación, manteniendo el aviso de copyright original del modelo base en el fichero LICENSE.
- Para producción a gran escala conviene evaluar el checkpoint alternativo `bangla-heteronym-banglabert`, según la recomendación del propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kawshikbuet17/bangla-heteronym-mdeberta-v3-base
- Dataset de heterónimos: https://huggingface.co/datasets/kawshikbuet17/bangla-heteronyms
- Repositorio del benchmark y código de inferencia: https://github.com/kawshikbuet17/bangla-heteronym-benchmark
- Checkpoint recomendado por el autor: https://huggingface.co/kawshikbuet17/bangla-heteronym-banglabert
- Modelo base: https://huggingface.co/microsoft/mdeberta-v3-base
