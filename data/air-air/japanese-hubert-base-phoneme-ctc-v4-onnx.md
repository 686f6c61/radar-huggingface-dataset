# air-air/japanese-hubert-base-phoneme-ctc-v4-ONNX

## Resumen

`air-air/japanese-hubert-base-phoneme-ctc-v4-ONNX` es la conversión a ONNX del reconocedor de fonemas japoneses `prj-beatrice/japanese-hubert-base-phoneme-ctc-v4`, un fine-tuning del encoder `rinna/japanese-hubert-base` sobre ReazonSpeech con una cabeza CTC y el inventario de fonemas de OpenJTalk/pyopenjtalk. El resultado no transcribe texto: emite secuencias de fonemas (`a i u e o N cl`, `k s sh ch ts j`, `ky ny hy`, etc.), lo que lo hace útil como pieza intermedia en pipelines de voz (TTS, alineamiento, evaluación de pronunciación) más que como motor de subtitulado.

El trabajo de air-air no reentrena nada: exporta los pesos a ONNX, cuantiza las matrices a 4 bits (bloque de 32) y mantiene las convoluciones en 8 bits con un `DequantizeLinear` delante de cada `Conv`. El resultado es un paquete de 63 MB (repositorio de 0,1 GB) que se ejecuta en el navegador mediante `transformers.js` con `dtype: 'q4'`, sin servidor y sin enviar audio fuera del cliente.

Su relevancia es de nicho pero clara: acerca un modelo fonético japones a aplicaciones web con requisitos de privacidad y latencia estrictos, a costa de una cuantización agresiva cuyo impacto en la tasa de error no se documenta. La licencia Apache 2.0 se hereda del modelo fuente, entrenado sobre ReazonSpeech.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer HuBERT (extractor convolucional + capas transformer) con cabeza CTC para clasificación de fonemas |
| Parámetros totales | No disponible en la información proporcionada; variante "base" de HuBERT (del orden de 9,5 × 10^7 parámetros según la arquitectura de referencia, no confirmado por el autor) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; modelo de audio con entrada en muestras a 16 kHz mono (el autor no documenta límite de duración) |
| Tipos de cuantización | Pesos matriciales a 4 bits (bloque 32) y pesos convolucionales a 8 bits con `DequantizeLinear` previo a cada `Conv`; en `transformers.js` se carga con `dtype: 'q4'` |
| Idiomas soportados | Japonés (`ja`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (repositorio de 0,1 GB; descarga de 63 MB) |
| Entrada de audio | 16 kHz mono, sin normalización (`do_normalize: false`) |
| Vocabulario de salida | Fonemas de OpenJTalk; `PAD` (id 0) actúa como blank de CTC |
| Revisión del modelo fuente | `f5fe07043bcb0b77a86faf72ac6d8fc1ae558f99` |

## Arquitectura y entrenamiento

La arquitectura es la de HuBERT: un front-end convolucional que convierte la forma de onda en una secuencia de tramas latentes, seguido de un transformer (variante "base") y una cabeza lineal CTC. El modelo original de rinna se preentrenó de forma auto-supervisada sobre audio japonés y después `prj-beatrice` lo ajustó con supervisión CTC sobre ReazonSpeech, usando el inventario de fonemas de pyopenjtalk como etiquetas en lugar de caracteres o subpalabras. No se documenta en la información disponible el número de horas de ajuste fino, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (poco habituales en ASR).

La innovación de esta ficha no está en el entrenamiento sino en la cadena de exportación: conversión a ONNX desde la revisión `f5fe070...`, cuantización mixta (4 bits en matrices, 8 bits en convoluciones) y empaquetado para `transformers.js`. No hay decodificación especulativa, atención lineal ni modificaciones arquitectónicas; el modelo es un HuBERT base estándar con cabeza CTC. El autor advierte de un detalle práctico del ajuste fino: el modelo necesita silencio alrededor de una sílaba aislada —unos 150 ms por cada lado—, porque con recortes ceñidos al sonido puede no emitir nada.

## Capacidades

- Reconocimiento de fonemas del japonés a partir de audio a 16 kHz mono, con salida en el inventario de OpenJTalk.
- Salida CTC con blank en el id 0, compatible con decodificación greedy o con decodificadores externos (léxico, beam search) que el usuario aporte.
- Ejecución en navegador vía `transformers.js` (`AutoFeatureExtractor` + `AutoModelForCTC` con `dtype: 'q4'`), incluyendo entornos sin GPU.
- Inferencia local/offline: el audio no abandona el dispositivo, lo que habilita casos con requisitos de privacidad.
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso.
- No genera texto, traducción, puntuación ni transcripción ortográfica: solo fonemas.
- No tiene capacidades de visión ni de audio más allá del reconocimiento fonético.
- Multilingüismo: únicamente japonés.

## Casos de uso

- **Evaluación de pronunciación en apps de aprendizaje de japonés**: el modelo devuelve la secuencia de fonemas emitida, que se compara con la secuencia esperada del texto de referencia (obtenida con pyopenjtalk) para calcular inserciones, omisiones y sustituciones por fonema. Es adecuado porque trabaja en el mismo inventario que el analizador morfológico-fonético estándar de japonés.
- **Front-end de sistemas TTS**: en pipelines de síntesis por fonemas, la salida CTC puede usarse para verificar o alinear la pronunciación de un clip grabado antes de clonar voz o de ajustar un modelo acústico.
- **Alineamiento forzado y segmentación**: con las etiquetas fonéticas conocidas, los logits CTC permiten derivar marcas temporales por fonema, útil para subtitulado a nivel de sílaba o para karaoke y resaltado sincronizado.
- **Procesamiento de voz en el navegador con privacidad**: una web estática puede cargar los 63 MB del modelo y procesar audio en el cliente sin backend, lo que simplifica el cumplimiento de RGPD al no transmitir grabaciones.
- **Investigación fonética y construcción de corpus**: extracción masiva de transcripciones fonéticas sobre grabaciones japonesas para estudios de variación, análisis de habla espontánea o anotación asistida de corpus.
- **Búsqueda y recuperación por pronunciación**: indexar clips por su secuencia fonética para permitir búsquedas del tipo "cómo se pronuncia" en diccionarios o bases de datos de audio, sin depender de transcripción ortográfica.
- **Preprocesado para modelos de voz que consumen fonemas**: convertir audio en etiquetas fonéticas para entrenar o evaluar modelos acústicos y conversores grafema-fonema en japonés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye tasa de error de fonemas (PER), WER, CER ni comparaciones con el modelo fuente en precisión flotante, por lo que no es posible cuantificar el impacto de la cuantización a 4 bits. Tampoco se han encontrado resultados en la búsqueda web realizada, cuyos resultados no guardaban relación con el modelo.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en la práctica; el artefacto pesa 63 MB y el grafo ONNX cuantizado trabaja con activaciones pequeñas para entradas de audio de pocos segundos.
- Cabe holgadamente en GPU de consumo: cualquier RTX 20xx/30xx/40xx, e incluso en iGPU y en CPU.
- Despliegue principal: `transformers.js` en navegador (WASM o WebGPU) y en Node.js; también es posible usar el ONNX con `onnxruntime` directamente.
- No se proporcionan cifras de latencia ni de throughput (RTF) en la información disponible; dependerá del backend (WASM en un solo hilo es sensiblemente más lento que WebGPU) y de la duración del audio.
- El requisito práctico documentado no es de cómputo sino de datos: añadir unos 150 ms de silencio a cada lado de sílabas aisladas para evitar salidas vacías.
- Repositorio de 0,1 GB: el modelo se descarga y se cachea en el cliente, lo que condiciona la primera carga en redes lentas.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto/entrada | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `air-air/japanese-hubert-base-phoneme-ctc-v4-ONNX` (este) | HuBERT base + CTC de fonemas, cuantizado | Base (≈9,5 × 10^7, no confirmado) | Audio 16 kHz mono | Apache 2.0 | ONNX 4/8 bits, 63 MB | Pensado para navegador; sin métricas publicadas |
| `prj-beatrice/japanese-hubert-base-phoneme-ctc-v4` | Mismo modelo en precisión original | Base | Audio 16 kHz mono | Apache 2.0 | Safetensors/PyTorch (no detallado) | Modelo fuente; referencia para medir la pérdida por cuantización |
| `rinna/japanese-hubert-base` | Encoder HuBERT auto-supervisado | Base | Audio 16 kHz mono | No disponible en la información proporcionada | PyTorch | No incluye cabeza CTC ni etiquetas fonéticas; requiere fine-tuning |

No se dispone de datos de rendimiento comparado (PER/WER) entre estas variantes en la información proporcionada, por lo que la comparación se limita a arquitectura, formato y licencia.

## Limitaciones y advertencias

- La salida son fonemas, no texto: no sustituye a un ASR ortográfico ni genera puntuación, kanji ni segmentación de palabras.
- Solo japonés; el rendimiento en otros idiomas o en japonés con acentos muy marcados o ruido de fondo no está documentado.
- Requiere silencio alrededor de sílabas aisladas (≈150 ms); con recortes ajustados puede devolver una secuencia vacía.
- La entrada no se normaliza (`do_normalize: false`): aplicar normalización externa alteraría las condiciones de entrenamiento.
- La cuantización a 4 bits puede degradar la precisión fonética respecto al modelo fuente; no hay métricas que permitan acotar esa pérdida. Conviene validar con un conjunto propio antes de producción.
- Entrenado sobre ReazonSpeech: posible sesgo hacia el dominio y las condiciones de grabación de ese corpus (habla mayoritariamente limpia, locutores profesionales).
- Riesgo de alucinación en el sentido de emisiones espurias sobre silencio, ruido o música; el blank CTC no elimina ese comportamiento.
- Licencia Apache 2.0 permite uso comercial, pero los datos de entrenamiento originales se amparan en el artículo 30-4 de la ley japonesa de copyright; conviene revisar las condiciones de ReazonSpeech si el uso es comercial.
- Dependencia del ecosistema `transformers.js`/ONNX Runtime: no hay pesos PyTorch en este repositorio, y `library_name` es `transformers.js`.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni mantenimiento demostrado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/air-air/japanese-hubert-base-phoneme-ctc-v4-ONNX
- Modelo fuente (fine-tuning CTC de fonemas): https://huggingface.co/prj-beatrice/japanese-hubert-base-phoneme-ctc-v4
- Encoder base japonés: https://huggingface.co/rinna/japanese-hubert-base
- Dataset de entrenamiento: https://huggingface.co/datasets/reazon-research/reazonspeech
- Licencia del repositorio: https://huggingface.co/air-air/japanese-hubert-base-phoneme-ctc-v4-ONNX/blob/main/LICENSE

Nota: la búsqueda web realizada no devolvió enlaces relevantes al modelo (los resultados correspondían a servicios de alojamiento y aerolíneas), por lo que no se incluyen papers, blogs ni demos adicionales.
