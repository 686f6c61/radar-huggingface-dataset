# INGMUYLEANG/akkhara-byt5-small

## Resumen

Akkhara es un modelo de transliteración de secuencia a secuencia construido sobre ByT5-small y ajustado por Ing Muyleang. Convierte texto escrito en *Sing Khmer* (jémer romanizado tal y como se teclea en chats y redes sociales) en escritura jémer estándar, devolviendo una lista ordenada de cinco candidatos al estilo de un asistente de entrada (IME). El problema que aborda es concreto: el jémer romanizado carece de ortografía normalizada, de modo que una misma palabra puede escribirse de múltiples formas (`knhom`, `knh`, `nh` para ខ្ញុំ), y solo el contexto de la frase permite desambiguar.

El modelo tiene 299,6 millones de parámetros y emplea una arquitectura transformer encoder-decoder de tipo T5 a nivel de byte, lo que le permite procesar directamente la cadena UTF-8 sin depender de un vocabulario de subpalabras. Está entrenado principalmente con pares sintéticos generados a partir de Wikipedia en jémer, MADLAD-400 km y CC-100 km, complementados con grafías reales de hablantes nativos y, en su versión v4, con 405 frases reales de redes sociales.

Su relevancia reside en la utilidad práctica como backend de teclados y como paso de normalización previo a otros modelos de PLN en jémer (búsqueda, clasificación, TTS). La licencia Apache-2.0 y su tamaño reducido facilitan el despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5), byte-level (ByT5) |
| Parametros totales | 299.637.760 (≈0,3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | entrada 160 bytes, objetivo 320 bytes (max length de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; admite cuantizacion estandar de transformers/PyTorch) |
| Idiomas soportados | jémer (km); palabras inglesas de chat en entradas mixtas (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/byt5-small`, un transformer encoder-decoder con tokenización a nivel de byte. Esta elección evita problemas de vocabulario con la escritura jémer y permite manejar directamente grafías romanizadas irregulares y mezclas de código (code-mixing) con palabras inglesas como `bro`, `sorry` o `haha`, que el modelo conserva tal cual. El ajuste fino se realizó con objetivo de entropía cruzada y teacher forcing, optimizador AdamW (weight decay 0), recorte de gradiente 1.0, precisión bfloat16 con pesos maestros en float32 y batch efectivo de 384 (32 por GPU × 4 acumulaciones × 3 GPUs con DDP).

El entrenamiento se organizó en cuatro rondas incrementales (v1 a v4). La v1 usó unos 300.000 pares sintéticos generados a partir de Wikipedia en jémer, CC-100 km y MADLAD-400 km con un romanizador basado en reglas; la v2 añadió grafías de hablantes nativos, palabras inglesas preservadas y ortografía estándar en los objetivos; la v3 incorporó más palabras de chat y correcciones de colisiones; la v4 sumó 405 frases reales de redes sociales transliteradas por un asistente de IA y verificadas automáticamente (no publicadas). El preprocesado incluye normalización Unicode, reordenación de marcas jémer, segmentación con khmer-nltk, romanización basada en reglas con variantes de chat, fragmentos de 2 a 12 palabras, perfiles de tecleo y ruido conversacional. La selección del modelo se hizo por menor CER de validación, evaluando cada 250 pasos.

## Capacidades

- Transliteración de jémer romanizado (*Sing Khmer*) a escritura jémer estándar.
- Generación de una lista ordenada de cinco candidatos (top-5) para selección por parte del usuario, al estilo de un IME.
- Desambiguación contextual de abreviaturas ambiguas (`ng` = និង / នឹង, `mn`, `dl`, `bn`) usando el contexto de la frase.
- Preservación de palabras inglesas de chat tal y como se escriben (`bro`, `haha`, `sorry`).
- Manejo de mezcla de código (code-mixing) jémer-inglés en la misma entrada.
- Procesamiento a nivel de byte, sin dependencia de un vocabulario de subpalabras.
- Soporte de decodificación con búsqueda por haces y múltiples secuencias de retorno (`num_beams=5`, `num_return_sequences=5`).
- Compatible con `text2text-generation` en transformers 4.x y con `text-generation-inference` y endpoints compatibles según los tags del repositorio.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo especializado en una única tarea.

## Casos de uso

- Backend de teclado o IME para jémer: el modelo convierte cada fragmento romanizado en candidatos en escritura jémer; para escritura en vivo se recomienda trocear la entrada en bloques de unas 6 palabras y cachear los bloques completados, de modo que cada pulsación solo regenere el último bloque (implementado en `akkhara/ime.py` del repositorio).
- Normalización de mensajes de chat antes de otros modelos de PLN: convertir texto romanizado a escritura estándar para alimentar buscadores, clasificadores o sistemas de TTS que esperan jémer nativo.
- Limpieza de corpus de redes sociales en jémer: transformar publicaciones romanizadas a escritura estándar para unificar el corpus antes del entrenamiento o análisis.
- Asistencia a usuarios en aplicaciones de mensajería: mostrar los cinco candidatos permite al usuario elegir la grafía correcta cuando la abreviatura es ambigua.
- Preprocesado para sistemas de traducción o recuperación de información en jémer: la salida normalizada mejora la coincidencia léxica frente a variantes romanizadas.
- Investigación sobre transliteración y romanización de lenguas de escritura no latina: el par sintético y la metodología de generación de datos (romanizador basado en reglas + perfiles de tecleo + ruido de chat) son reutilizables para otras lenguas.
- Evaluación de modelos byte-level en tareas de normalización ortográfica: ByT5-small como caso de estudio de ajuste fino eficiente (entrenamientos de 18 a 24 minutos por ronda según la model card).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card menciona métricas de evaluación (CER, WER, accuracy) y que las puntuaciones sobre chat real provienen de solo 15-19 frases, pero no se incluyen los valores numéricos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 299,6M de parámetros, en float32 ocupa aproximadamente 1,2 GB de pesos; en bfloat16 unos 0,6 GB; en cuantización de 8 bits alrededor de 0,3 GB. El consumo real depende del batch y de la longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 lo ejecutan sin problemas.
- Cabe holgadamente en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: transformers (`AutoModelForSeq2SeqLM`), pipeline `text2text-generation` en transformers 4.x, text-generation-inference y endpoints compatibles según los tags; también es viable la exportación a ONNX o la conversión a GGUF para llama.cpp/Ollama, aunque no se documenta oficialmente.
- Latencia y throughput estimados: no disponibles en la información proporcionada; el tamaño reducido y los tiempos de entrenamiento de 18-24 minutos por ronda sugieren una inferencia ligera, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Akkhara (byt5-small) | 299,6M | 160 bytes entrada / 320 bytes objetivo | Transliteración Sing Khmer → jémer | Apache-2.0 | Hugging Face |
| google/byt5-small | ≈300M | no disponible | Modelo base multilingüe byte-level | Apache-2.0 | Hugging Face |
| google/mt5-small | ≈300M | no disponible | Traducción multilingüe | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de Akkhara con alternativas especializadas en transliteración de jémer; no se conocen en la información proporcionada otros modelos públicos dedicados a esta tarea concreta.

## Limitaciones y advertencias

- Entrenado mayoritariamente con pares sintéticos derivados de texto periodístico y enciclopédico; el chat real es más difícil y las puntuaciones sobre chat real proceden de solo 15-19 frases.
- Las abreviaturas cortas son ambiguas (`ng` = និង / នឹង, `mn`, `dl`, `bn`); la respuesta correcta suele estar en el top-5 en lugar de en la primera posición.
- Varias palabras de 1-2 letras seguidas (`b sl o nah o dg ot`) pueden confundir al modelo.
- El modelo conoce palabras malsonantes y abreviaturas porque aparecen en el chat real; puede generar contenido soez.
- Uso fuera de alcance: traducción al inglés u otros idiomas, texto formal donde se exija ortografía exacta sin revisión humana, y documentos muy largos en una sola llamada (deben trocearse).
- Riesgo de alucinación en entradas muy ruidosas o fuera de distribución; se recomienda mostrar los cinco candidatos y evaluar sobre chat real propio antes de desplegar.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las licencias de los datos de entrenamiento (Wikipedia CC BY-SA, MADLAD-400 ODC-BY, CC-100 sin licencia explícita sujeta a los términos de Common Crawl).
- Las 405 frases reales de redes sociales usadas en v4 no están publicadas, lo que limita la reproducibilidad completa del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/INGMUYLEANG/akkhara-byt5-small
- Repositorio de código: https://github.com/MuyleangIng/ahkhara
- Dataset: https://huggingface.co/datasets/INGMUYLEANG/akkhara-sing-khmer
- Modelo base: https://huggingface.co/google/byt5-small
- Demo: aplicación Gradio en el repositorio (`scripts/09_demo.py`)
