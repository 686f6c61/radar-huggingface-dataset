# sankity/sherpa-onnx-whisper-tiny-id

## Resumen

`sherpa-onnx-whisper-tiny-id` es una exportación a formato ONNX del modelo `maleo-ai/whisper-tiny-id`, un fine-tuning de OpenAI Whisper tiny (39 millones de parámetros) especializado en reconocimiento automático de habla (ASR) en indonesio. Lo publica el usuario `sankity` (Santhra) y su propósito es permitir la inferencia offline del modelo mediante la librería sherpa-onnx, que carga directamente los ficheros ONNX sin necesidad de PyTorch ni de la pila de transformers.

El modelo hereda la arquitectura encoder-decoder transformer propia de Whisper en su variante tiny, con una ventana de audio de 30 segundos y muestreo de entrada de 16 kHz mono. Al estar exportado en fp32 sin cuantización int8, el paquete ocupa aproximadamente 0,2 GB en el repositorio, lo que lo hace adecuado para despliegues en dispositivos con recursos limitados, aplicaciones de escritorio o sistemas embebidos.

Su relevancia radica en dos factores: por un lado, cubre una lengua con relativamente pocos modelos ASR abiertos como es el indonesio; por otro, el formato sherpa-onnx facilita la integración en producción sin dependencias pesadas, algo útil para transcripción local, subtitulado o asistentes de voz que deban ejecutarse sin conexión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | 39 millones (modelo base Whisper tiny) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 30 segundos por inferencia (estándar Whisper) |
| Tipos de cuantizacion | fp32 (sin cuantización int8 en esta exportación) |
| Idiomas soportados | indonesio (id) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (encoder y decoder separados) + tokens.txt |

## Arquitectura y entrenamiento

El modelo subyacente es OpenAI Whisper tiny, un transformer encoder-decoder con 39 millones de parámetros que procesa espectrogramas Mel de audio de 16 kHz y genera tokens de texto de forma autorregresiva. La variante `maleo-ai/whisper-tiny-id` fue afinada por Eka Tresna Irawan (Maleo Research Group) sobre el checkpoint original de Whisper para especializarlo en indonesio; la model card no detalla el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La exportación a ONNX se realizó en dos pasos documentados por el autor: primero la conversión del checkpoint de Hugging Face al formato `.pt` original de OpenAI (invirtiendo el mapeo `WHISPER_MAPPING` de transformers y casteando de fp16 a fp32), y después la exportación con el script oficial `scripts/whisper/export-onnx.py` de sherpa-onnx en el commit `17d5f144035fb35e13b787445fd3a0100998aa5a`, añadiendo una rama `tiny-id` y pasando `dynamo=False` a `torch.onnx.export` para compatibilidad con PyTorch 2.9 o superior. El tokenizador `tokens.txt` es el `multilingual.tiktoken` estándar de Whisper, idéntico en bytes entre todos los tamaños del modelo.

## Capacidades

- Reconocimiento automático de habla (ASR) offline en indonesio a partir de audio de 16 kHz mono.
- Transcripción de fragmentos de hasta 30 segundos por inferencia, encadenables para audio más largo mediante segmentación externa.
- Ejecución sin PyTorch en tiempo de inferencia: solo requiere el runtime de sherpa-onnx y los ficheros ONNX.
- Funcionamiento completamente local, sin llamadas a servicios externos.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente ASR.
- Capacidad multilingüe limitada al indonesio (aunque el tokenizador subyacente es el multilingüe de Whisper, el ajuste fino está orientado a `id`).
- No incluye visión, audio generativo ni modo de razonamiento extendido.

## Casos de uso

- Transcripción local de reuniones en indonesio: el modelo puede procesar grabaciones segmentadas en bloques de 30 segundos y generar actas o resúmenes posteriores, sin enviar audio a la nube.
- Subtitulado automático de vídeo: integrado en un pipeline que extrae audio a 16 kHz mono y lo pasa por sherpa-onnx, permite generar pistas de subtítulos en indonesio para contenido educativo o corporativo.
- Asistentes de voz embebidos: al ocupar unos 0,2 GB en fp32 y no requerir GPU, puede desplegarse en dispositivos de borde (Raspberry Pi, mini-PC) para comandos de voz en indonesio.
- Atención al cliente telefónica: transcripción de llamadas en centros de contacto indonesios para análisis de calidad, búsqueda de palabras clave y cumplimiento normativo, ejecutándose on-premise.
- Investigación lingüística y corpus: generación de transcripciones a gran escala de grabaciones de campo en indonesio para estudios sociolingüísticos o construcción de datasets.
- Aplicaciones de accesibilidad: dictado por voz en indonesio en herramientas de escritorio o móviles que deban funcionar sin conexión.
- Prototipado rápido de ASR: al estar en formato ONNX y con licencia Apache-2.0, sirve como línea base para comparar con modelos ASR más grandes antes de invertir en infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; con 39 millones de parámetros en fp32 el modelo ocupa aproximadamente 0,15 GB en memoria (encoder ~37,6 MB, decoder ~114,5 MB) más el overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre es suficiente; no obstante, la inferencia en CPU es viable y habitual para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3050 o superior) e incluso en iGPU.
- Cabe en CPU: sí, en procesadores de escritorio y en placas tipo Raspberry Pi 4/5 con margen razonable para audio corto.
- Opciones de despliegue: sherpa-onnx (runtime nativo, C++/Python/Kotlin/Swift), con los ficheros `tiny-id-encoder.onnx`, `tiny-id-decoder.onnx` y `tiny-id-tokens.txt`. No está pensado para vLLM, TGI ni llama.cpp, que no soportan este formato ASR.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del hardware y de la longitud del audio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| sherpa-onnx-whisper-tiny-id (este) | 39 M | 30 s por inferencia | indonesio | Apache-2.0 | ONNX |
| maleo-ai/whisper-tiny-id (modelo base) | 39 M | 30 s por inferencia | indonesio | Apache-2.0 | safetensors (HF) |
| openai/whisper-tiny | 39 M | 30 s por inferencia | multilingüe (99 idiomas) | MIT | safetensors / .pt |
| openai/whisper-small | 244 M | 30 s por inferencia | multilingüe (99 idiomas) | MIT | safetensors / .pt |

La comparación con `whisper-tiny` original es la más directa: mismo tamaño y arquitectura, pero el modelo de OpenAI es multilingüe y no está especializado en indonesio, por lo que en esa lengua el ajuste fino de Maleo debería ofrecer mejores resultados (sin datos de benchmark públicos que lo confirmen). Frente a `whisper-small`, este último tiene seis veces más parámetros y mayor precisión potencial, a costa de más memoria y latencia. La ventaja específica de esta exportación frente al modelo base es la disponibilidad en ONNX para sherpa-onnx, que simplifica el despliegue en producción.

## Limitaciones y advertencias

- Modelo de 39 millones de parámetros: la precisión ASR será notablemente inferior a la de variantes small, medium o large de Whisper, especialmente con ruido de fondo, acentos marcados o audio telefónico de baja calidad.
- Ventana fija de 30 segundos: audios más largos requieren segmentación externa, con el riesgo de cortar palabras en las fronteras si no se solapan los fragmentos.
- Especializado únicamente en indonesio: no debe esperarse buen rendimiento en malayo, javanés u otras lenguas cercanas, ni en code-switching con inglés.
- Sin cuantización int8: el paquete es mayor que una versión cuantizada equivalente, aunque sigue siendo pequeño en términos absolutos.
- Riesgo de alucinación típico de Whisper: en segmentos con silencio o ruido puede generar texto inventado; conviene aplicar detección de voz (VAD) previa.
- Sesgos: no se documentan sesgos específicos en la model card; al derivar de Whisper, puede heredar sesgos de los datos de entrenamiento originales.
- Licencia Apache-2.0: permite uso comercial sin restricciones adicionales, siempre que se conserve la atribución a los autores originales y al exportador.
- Repositorio con cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación comunitaria de la exportación.
- La model card no documenta métricas de calidad (WER/CER) sobre ningún conjunto de evaluación, lo que dificulta estimar su rendimiento real antes de desplegarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sankity/sherpa-onnx-whisper-tiny-id
- Modelo base: https://huggingface.co/maleo-ai/whisper-tiny-id
- sherpa-onnx (repositorio oficial): https://github.com/k2-fsa/sherpa-onnx
- Script de exportación ONNX de Whisper en sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx/blob/master/scripts/whisper/export-onnx.py
- OpenAI Whisper (modelo original): https://github.com/openai/whisper
