# bkoloski/zapirko-xlmr

## Resumen

zapirko-xlmr es un modelo de clasificación de tokens (token classification) desarrollado por bkoloski para restaurar puntuación y mayúsculas en texto macedonio en minúsculas y sin puntuar, típicamente la salida de un sistema de reconocimiento automático del habla (ASR). Se trata de un fine-tuning de XLM-RoBERTa base sobre la tarea de truecasing y repuntuación, y se emplea en producción en la aplicación Buki (buki.mk) justo después de la transcripción de audio.

El modelo resuelve un problema muy concreto y bien delimitado: los transcriptores ASR entregan secuencias de palabras sin comas, puntos, signos de interrogación ni mayúsculas, lo que dificulta la lectura y el procesamiento posterior. zapirko-xlmr etiqueta cada palabra con una de ocho clases (marca posterior × capitalización inicial) sin modificar nunca las palabras en sí, lo que preserva fielmente el contenido transcrito.

Con 277 millones de parámetros, licencia MIT y un coste de entrenamiento de unos 15 minutos en una A100, el modelo es relevante por su eficiencia extrema (del orden de 10.000 a 25.000 palabras por segundo en GPU) frente a alternativas generativas mucho más costosas, y por cubrir una lengua de bajos recursos como el macedonio con datos y evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) con cabeza de clasificación de tokens |
| Parametros totales | 277.459.208 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (max_length en el ejemplo de uso); para textos largos se recomienda ventanas solapadas de unas 100 palabras con stride 50 |
| Tipos de cuantizacion | pesos almacenados en fp16; no se documentan otras cuantizaciones |
| Idiomas soportados | macedonio (mk) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un XLM-RoBERTa base (encoder transformer) con una cabeza de clasificación de tokens que predice, para cada palabra, una de ocho etiquetas: la marca que va después de la palabra (`none`, `comma`, `period`, `question`) combinada con si la palabra empieza en mayúscula (`low`, `cap`). La etiqueta k se decodifica como marca k // 2 y capitalización k % 2. Solo el primer subtoken de cada palabra determina su etiqueta. No se modifica el léxico: la salida es siempre una transformación de la entrada.

El entrenamiento usó aproximadamente 10 millones de palabras distribuidas en 135.088 ventanas de 40 a 120 palabras: 6,95 millones de palabras de texto web del corpus LVSTCK/macedonian-corpus-cleaned-dedup (saltando los primeros 50.000 documentos y eliminando ventanas que compartían 8-gramas con los conjuntos de test) y 3,0 millones de palabras de OpenSubtitles (OPUS v2024, macedonio), que aportan casi todos los signos de interrogación (35 por cada 1.000 palabras frente a 1,4 en texto web). La entrada se construye eliminando la puntuación y pasando las palabras a minúsculas, mientras que las etiquetas provienen del texto original. El ajuste fue de 2 épocas, batch 32, learning rate 5e-5 con decaimiento lineal y 6 % de warm-up, precisión bf16, una sola A100 y unos 15 minutos de cómputo. No se documenta RLHF ni DPO, al no ser un modelo generativo.

## Capacidades

- Repuntuación: inserta comas, puntos y signos de interrogación tras las palabras.
- Truecasing: decide si cada palabra empieza en mayúscula.
- Etiquetado a nivel de palabra con preservación exacta del léxico original.
- Procesamiento por ventanas solapadas para textos largos, con promediado ponderado de probabilidades por distancia al borde de la ventana.
- Consistencia de capitalización entre formas de una misma palabra y mayúscula al inicio de cada oración (implementado en el pipeline de referencia de Buki).
- Especializado en macedonio; no cubre otras lenguas.
- No es un modelo generativo: no produce texto nuevo ni admite tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Postprocesado de ASR en macedonio: tras la transcripción de audio, el modelo restaura puntuación y mayúsculas para que la salida sea legible, que es exactamente el uso en producción en Buki.
- Subtitulado automático: el modelo está entrenado con OpenSubtitles y rinde especialmente bien en signos de interrogación en diálogo (F1 de 0,75 con 947 preguntas en el conjunto de test), lo que lo hace adecuado para generar subtítulos puntuados a partir de transcripciones.
- Normalización de corpus web: textos extraídos de la web en minúsculas y sin puntuar pueden repuntuarse para tareas posteriores de indexación, búsqueda o análisis lingüístico.
- Preprocesado para TTS: una entrada bien puntuada y capitalizada mejora la prosodia y la segmentación en sistemas de síntesis de voz.
- Etiquetado lingüístico y anotación: al ser un clasificador de tokens, puede integrarse en pipelines de anotación que necesiten marcas de frontera oracional y casing.
- Procesamiento de grandes volúmenes: con un rendimiento de 10.000 a 25.000 palabras por segundo en GPU, es viable repuntuar corpus completos de millones de palabras en minutos, algo inviable con un modelo generativo de 2B.
- Integración en aplicaciones de dictado o notas de voz: el modelo añade puntuación legible a la transcripción antes de mostrarla al usuario.

## Benchmarks y rendimiento

F1 sobre texto macedonio reservado, con el esquema de ventanas descrito. La comparación es con zapirko, un modelo generativo de 2B (Gemma-2-2B con LoRA, vía Ollama).

| Conjunto de test | Palabras | coma | punto | interrogación | mayúsculas | zapirko coma / punto / mayúsculas |
|---|---|---|---|---|---|---|
| Frases FLEURS | 8,5k | 0,76 | 0,93 | (1 pregunta) | 0,93 | 0,77 / 0,95 / 0,93 |
| Párrafos web | 9,7k | 0,69 | 0,80 | 0,48 (13) | 0,89 | 0,64 / 0,77 / 0,83 |
| Un texto de 2.000 palabras | 2k | 0,72 | 0,79 | 0,50 (9) | 0,82 | 0,63 / 0,68 / 0,76 |
| Subtítulos (diálogo) | 23,9k | 0,58 | 0,84 | 0,75 (947) | 0,88 | no disponible |

- Se conservan todas las palabras en la evaluación.
- Velocidad: aproximadamente 10.000 a 25.000 palabras por segundo en GPU, frente a unas 30 del modelo generativo zapirko.
- Solo el conjunto de subtítulos contiene suficientes preguntas para medir esa clase; los recuentos entre paréntesis indican cuán pocas hay en los demás conjuntos.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, los 277 millones de parámetros ocupan aproximadamente 0,55 GB de pesos; con activaciones y overhead, cabe holgadamente en 2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna sirve; una A100 o H100 para máximo throughput, y RTX 4090, RTX 3090 o incluso GPUs de gama media para uso interactivo.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2-4 GB de VRAM; también es viable en CPU para volúmenes moderados.
- Opciones de despliegue: transformers (AutoModelForTokenClassification), con posibilidad de exportación a ONNX o TorchScript para servir; el pipeline de referencia de Buki está en Python.
- Latencia y throughput: 10.000 a 25.000 palabras por segundo en GPU según la model card; el entrenamiento completo requirió unos 15 minutos en una A100.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zapirko-xlmr | 277 M | 512 tokens (ventanas solapadas para textos largos) | Repuntuación y truecasing en macedonio | MIT | Hugging Face |
| zapirko (Gemma-2-2B + LoRA) | 2B | no disponible | Repuntuación y truecasing en macedonio (generativo) | no disponible | Ollama |
| XLM-RoBERTa base | 278 M | 512 tokens | Modelo base multilingüe, sin fine-tuning de puntuación | MIT | Hugging Face |

Frente a zapirko, el modelo generativo de 2B, zapirko-xlmr obtiene F1 superior en comas, puntos y mayúsculas en los tres conjuntos comparables (por ejemplo, 0,69 frente a 0,64 en coma y 0,80 frente a 0,77 en punto en párrafos web) con un coste computacional tres órdenes de magnitud menor en inferencia.

## Limitaciones y advertencias

- Solo macedonio: no está entrenado ni evaluado en otras lenguas.
- Las preguntas marcadas únicamente por entonación, sin partículas como дали/ли ni palabra interrogativa, no pueden detectarse en texto; es una limitación intrínseca de la tarea.
- El rendimiento en comas es el más bajo (F1 de 0,58 en subtítulos y 0,69 en párrafos web), por lo que la puntuación de coma en textos largos puede requerir revisión.
- Riesgo de alucinación estructural: el modelo puede insertar o omitir marcas incorrectamente, aunque nunca altera las palabras.
- Para textos de más de 512 tokens es necesario aplicar ventanas solapadas; sin ese esquema, la calidad cae en los bordes.
- La licencia MIT permite uso comercial sin restricciones documentadas, pero el modelo base XLM-RoBERTa también es MIT, por lo que no hay caveats de licencia conocidos.
- El modelo tiene un uso muy específico (token classification) y no debe emplearse como generador de texto ni para tareas fuera de la repuntuación y el casing.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bkoloski/zapirko-xlmr
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Dataset de entrenamiento: https://huggingface.co/datasets/LVSTCK/macedonian-corpus-cleaned-dedup
- Pipeline de referencia en Buki (punct_xlmr.py): https://github.com/bkolosk1/buki_webapp
- Aplicación Buki: https://buki.mk
