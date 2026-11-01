# pdnhan/xlm-roberta-capu-mobile

## Resumen

`pdnhan/xlm-roberta-capu-mobile` es una conversión a ONNX del modelo `dragonSwing/xlm-roberta-capu`, un restaurador de mayúsculas y puntuación para vietnamita construido sobre XLM-RoBERTa-base (278 M de parámetros). El problema que resuelve es concreto: convertir texto en minúsculas y sin puntuar —típicamente la salida de un sistema de reconocimiento automático del habla (ASR)— en texto escrito correctamente, recuperando los signos `.` `,` `:` `?`, las mayúsculas (incluidas grafías mixtas como *MobiFone* o *YouTube*) y la expansión de letras y dígitos dictados (*năm g* → *5G*).

La relevancia de esta versión no está en el modelo en sí, cuyos pesos son idénticos a los del original, sino en el empaquetado: exportación ONNX en fp32 y en 8 bits, tokenizador SentencePiece en TSV, tablas de etiquetas y código listo para usar en Kotlin (Android) y Swift (iOS) que cubre tokenización, troceado de textos largos y aplicación de las ediciones. El objetivo declarado es la inferencia en dispositivo (*on-device*), sin servidor.

El repositorio ocupa 1,4 GB y el modelo cuantizado a 8 bits pesa 280,8 MB; junto con el tokenizador y las tablas auxiliares, una app móvil descarga unos 290 MB. La licencia es CC BY-SA 4.0, lo que impone obligaciones de atribución y *share-alike* sobre obras derivadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa-base (transformer encoder) para etiquetado de tokens (token classification) |
| Parametros totales | 278 M (según la model card del autor) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como ventana nominal; el pipeline procesa ventanas de 48 palabras con solapamiento de 12, y cada ejecución del modelo admite hasta 64 palabras |
| Tipos de cuantizacion | fp32 (`onnx/model.onnx`) e int8 de 8 bits (`onnx/model_quantized.onnx`); no se publican GGUF ni otras variantes |
| Idiomas soportados | vietnamita (`vi`) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (opset 17 en fp32); tokenizador en `tokenizer.json` y `unigram.tsv`; tablas auxiliares en TSV/TXT |

## Arquitectura y entrenamiento

El modelo es un encoder transformer XLM-RoBERTa-base que formula la tarea como etiquetado a nivel de palabra: recibe `input_ids` con un token especial `$START` (id 250002) seguido de los subtokens de cada palabra, junto con `attention_mask` e `input_offsets` (índice del primer subtoken de cada palabra). Devuelve dos cabezas: `logits` de forma `[batch, words+1, 15]` con las etiquetas de edición (definidas en `labels.txt`) y `detect_logits` de forma `[batch, words+1, 4]` con clases de detección de error (en `d_tags.txt`, marcada como no necesaria). El texto final se obtiene aplicando las ediciones predichas palabra a palabra, no generando texto libre.

Sobre el entrenamiento no se aportan detalles en la información disponible: no se especifican el número de tokens, la composición exacta del corpus ni si hubo ajuste con RLHF o DPO. La model card cita el dataset `oscar-corpus/OSCAR-2109` como fuente de datos y el modelo base `dragonSwing/xlm-roberta-capu`. La innovación técnica de esta variante es de ingeniería de despliegue: cuantización int8 con capas lineales como `MatMulNBits` (8 bits, simétrica, bloques de 128, `accuracy_level` 4), embedding como `Gather` int8 y activaciones en coma flotante, requiriendo ONNX Runtime 1.22 o superior (probado con 1.22.0, 1.23.0 y 1.31.1). Se incluye además una tabla `number_words.tsv` que mapea palabra, etiqueta y reemplazo para las etiquetas `$TRANSFORM_VERB_*`.

## Capacidades

- Restauración de puntuación: inserta `.`, `,`, `:` y `?` en texto sin puntuar.
- Restauración de mayúsculas, incluidas grafías de marca con capitalización interna (*MobiFone*, *YouTube*).
- Expansión de letras y dígitos dictados a su forma escrita (*năm g* → *5G*).
- Etiquetado a nivel de palabra con dos cabezas de salida (edición y detección de error).
- Procesamiento de textos largos mediante troceado en ventanas de 48 palabras con solapamiento de 12.
- Inferencia en dispositivo en Android (Kotlin) e iOS (Swift) sobre ONNX Runtime, con código auxiliar incluido.
- Tokenizador SentencePiece (unigram) con el token `$START` añadido, disponible en `tokenizer.json` para Python y en `unigram.tsv` para móvil.
- Capacidad multilingüe: limitada a vietnamita; no se documentan otras lenguas.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido: es un modelo discriminativo de etiquetado, no generativo.

## Casos de uso

- Postprocesado de ASR en vietnamita: la salida cruda del reconocedor de voz llega en minúsculas y sin puntuar; el modelo la convierte en texto legible aplicando las ediciones predichas, que es exactamente el escenario para el que se diseñó y evalúa (FLEURS vietnamita).
- Dictado en apps móviles sin conexión: integrado con el código Kotlin o Swift del repositorio, el modelo de 280,8 MB corre en el dispositivo y evita enviar audio o transcripciones a un servidor, lo que reduce latencia y exposición de datos.
- Subtitulado y transcripción de reuniones: el troceado en ventanas de 48 palabras con solapamiento de 12 permite procesar transcripciones largas por bloques, restaurando puntuación y mayúsculas para mejorar la lectura.
- Normalización de texto para motores TTS: un texto sin puntuar produce prosodia pobre; restaurar comas, puntos y signos de interrogación antes de la síntesis mejora las pausas y la entonación.
- Limpieza de corpus para entrenamiento: textos extraídos de OSCAR y otras fuentes web suelen venir en minúsculas y sin puntuación; el modelo puede normalizarlos antes de usarlos en pipelines de datos.
- Accesibilidad y entrada por voz: expansión de letras y dígitos dictados (*năm g* → *5G*) útil en formularios, direcciones y nombres de producto donde el ASR devuelve la forma hablada.
- Procesamiento por lotes en servidor: aunque el foco es móvil, la exportación fp32 con ONNX Runtime permite ejecutar el modelo en CPU x86 para normalizar grandes volúmenes de texto vietnamita.

## Benchmarks y rendimiento

Evaluación publicada por el autor sobre 347 frases únicas del *test split* vietnamita de FLEURS, en minúsculas y sin puntuación, más 43 párrafos de 8 frases consecutivas, comparadas con las transcripciones originales. F1 a nivel de palabra para los cuatro signos de puntuación y para las palabras capitalizadas:

| Modelo | F1 puntuación | F1 mayúsculas | Mismo texto que el modelo original |
|---|---|---|---|
| original (PyTorch, `gec_model.py`) | 0,763 | 0,869 | — |
| `onnx/model.onnx` (fp32) | 0,763 | 0,869 | 392 / 392 |
| `onnx/model_quantized.onnx` (8 bits) | 0,766 | 0,869 | 315 / 392 |

El autor indica que la exportación fp32 con el código del repositorio reproduce exactamente el texto del pipeline original, y que el modelo de 8 bits difiere en algunos textos —principalmente comas en casos límite— con una precisión global equivalente. El código Kotlin (ejecutado en JVM con ONNX Runtime 1.31.1) y el Swift producen el mismo texto que la referencia Python en los 392 textos; el tokenizador Python coincide con `tokenizers` en las 3.480 palabras distintas del conjunto de prueba.

Rendimiento medido en CPU x86 de escritorio con 8 hilos, un texto a la vez: 392 textos (21.514 palabras) en 13,4 s con el modelo de 8 bits y 17,4 s con fp32. No se publican cifras de latencia o throughput en dispositivos móviles; el autor solo indica que los teléfonos son más lentos.

## Requisitos de hardware

- VRAM/RAM estimada: el modelo de 8 bits pesa 280,8 MB y el fp32 1.110,1 MB; con tokenizador y tablas auxiliares la descarga móvil es de unos 290 MB. No se publica el pico de memoria en ejecución.
- GPU recomendadas: no se documentan; el modelo está pensado para CPU y para aceleradores móviles vía ONNX Runtime. La evaluación de velocidad se hizo en CPU x86 de escritorio.
- Cabe en GPU de consumo: sí, por tamaño (el fp32 ocupa ~1,1 GB en disco), aunque no es el objetivo declarado ni se aportan datos de rendimiento en GPU.
- Despliegue: ONNX Runtime 1.22 o superior (probado con 1.22.0, 1.23.0 y 1.31.1); en móvil, Android con Kotlin e iOS con Swift usando el código del repositorio. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato y tarea.
- Latencia y throughput: 21.514 palabras en 13,4 s (8 bits) y 17,4 s (fp32) en CPU x86 de 8 hilos, un texto a la vez. Sin datos para móvil.
- Restricción operativa: cada ejecución del modelo procesa hasta 64 palabras, y el pipeline trocea en ventanas de 48 palabras con solapamiento de 12.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `pdnhan/xlm-roberta-capu-mobile` | 278 M | ventanas de 48 palabras (hasta 64 por ejecución) | vi | CC BY-SA 4.0 | ONNX (fp32 e int8) |
| `dragonSwing/xlm-roberta-capu` (original) | 278 M | no disponible | vi | no disponible en la información proporcionada | PyTorch (según la referencia al pipeline `gec_model.py`) |
| Alternativas de restauración de puntuación para vietnamita | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa solo es posible con el modelo original, del que esta variante hereda los pesos: el fp32 reproduce su salida exactamente (392/392 textos) y el int8 mantiene la precisión con diferencias en 77 de 392 textos. No se dispone de información sobre otros modelos comparables de la misma categoría y idioma.

## Limitaciones y advertencias

- Ámbito lingüístico restringido: solo vietnamita; no hay evidencia de comportamiento en otras lenguas pese a partir de un modelo multilingüe como XLM-RoBERTa.
- El modelo de 8 bits no es idéntico al original: difiere en 77 de 392 textos de prueba, sobre todo en comas en casos límite. Para pipelines que exijan reproducibilidad exacta, usar la exportación fp32.
- Dependencia estricta de ONNX Runtime 1.22 o superior para el modelo int8; versiones anteriores solo ejecutan `MatMulNBits` de 4 bits y no cargarán estos pesos.
- Límite de 64 palabras por ejecución y troceado en ventanas de 48 con solapamiento de 12: textos largos requieren el código de troceado del repositorio y pueden producir inconsistencias en las fronteras de ventana.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluación fuera de FLEURS; el conjunto de evaluación es pequeño (347 frases más 43 párrafos) y de un único dominio (transcripciones de FLEURS).
- Licencia CC BY-SA 4.0: permite uso comercial, pero exige atribución y que las obras derivadas se distribuyan bajo la misma licencia, lo que puede condicionar productos propietarios que integren el modelo o adaptaciones del mismo.
- Sin datos publicados sobre entrenamiento (tokens, composición del corpus, alineación con preferencias humanas), lo que limita la evaluación de su robustez fuera de dominio.
- El repositorio ocupa 1,4 GB por incluir fp32 e int8; las apps deben descargar selectivamente el archivo de 8 bits para no duplicar espacio.
- La cabeza `detect_logits` está marcada como no necesaria; su uso no está documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pdnhan/xlm-roberta-capu-mobile
- Modelo base: https://huggingface.co/dragonSwing/xlm-roberta-capu
- ONNX Runtime: https://onnxruntime.ai
- Dataset citado: https://huggingface.co/datasets/oscar-corpus/OSCAR-2109
- Dataset de evaluación FLEURS: https://huggingface.co/datasets/google/fleurs
- Código de referencia Python del pipeline: `python/capu.py` (incluido en el repositorio del modelo)
- Código Android (Kotlin): carpeta `android/` del repositorio del modelo
- Código iOS (Swift): carpeta `ios/` del repositorio del modelo
