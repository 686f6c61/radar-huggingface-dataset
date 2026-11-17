# Jluedy/whisper-base.en

## Resumen

`Jluedy/whisper-base.en` es una conversión a ONNX del modelo `openai/whisper-base.en`, publicada por el usuario Jluedy con el objetivo de hacerlo compatible con Transformers.js y, por extensión, con la inferencia en el navegador mediante WebML. No se trata de un modelo nuevo ni de un fine-tuning: es una redistribución de los pesos originales de OpenAI en formato ONNX, estructurada según la convención recomendada por Hugging Face (carpeta `onnx` dentro del repositorio).

El modelo subyacente, Whisper base.en, es un sistema de reconocimiento automático del habla (ASR) de tipo encoder-decoder transformer, entrenado por OpenAI sobre 680.000 horas de audio supervisado débilmente. La variante `.en` está especializada exclusivamente en inglés y corresponde al segundo tamaño de la familia Whisper (74 millones de parámetros), por encima de tiny y por debajo de small, medium y large.

La relevancia de esta ficha es acotada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su interés práctico se limita a quienes necesiten ejecutar Whisper base.en en un entorno JavaScript (Node.js o navegador) sin depender de Python. Para cualquier uso en producción en servidor, es preferible recurrir al modelo original de OpenAI o a conversiones mantenidas por el propio ecosistema de Transformers.js.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 74 millones (heredados de openai/whisper-base.en) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana de entrada; 448 tokens de contexto en el decoder |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos ONNX; se desconoce si hay variantes cuantizadas) |
| Idiomas soportados | ingles unicamente (sufijo `.en`) |
| Licencia | no disponible en la informacion proporcionada (el modelo base de OpenAI se distribuye habitualmente bajo licencia MIT, pero debe verificarse en el repositorio original) |
| Formato de pesos | ONNX (carpeta `onnx`), compatible con Transformers.js |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper: un encoder transformer que procesa espectrogramas mel de 80 canales y un decoder transformer autorregresivo que genera tokens de texto, con atención cruzada entre ambos. El modelo base emplea 6 capas en encoder y 6 en decoder, con dimensión oculta de 512 y 8 cabezas de atención. La entrada se normaliza a ventanas de 30 segundos y el decoder opera con un contexto máximo de 448 tokens.

El entrenamiento original de OpenAI se realizó sobre 680.000 horas de audio multilingüe con supervisión débil, sin fine-tuning específico por tarea. La variante `.en` se entrenó únicamente con datos en inglés, lo que elimina la tarea de detección de idioma y mejora la precisión en esa lengua frente a las variantes multilingües del mismo tamaño. No se dispone de información sobre el proceso de conversión a ONNX empleado por Jluedy, ni sobre si se aplicaron optimizaciones adicionales (fusión de operadores, cuantización, etc.).

## Capacidades

- Reconocimiento automático del habla en inglés a partir de audio de hasta 30 segundos por segmento.
- Transcripción con puntuación y mayúsculas inferidas por el modelo.
- Traducción de audio en inglés a texto en inglés (la tarea de traducción a otros idiomas no está soportada en la variante `.en`).
- Detección de actividad de voz implícita mediante los tokens de timestamp del decoder.
- Ejecución en navegador y en Node.js a través de Transformers.js, sin backend Python.
- No soporta tool calling, function calling ni razonamiento multi-step.
- No dispone de modo thinking, visión ni audio generation.
- Capacidad multilingüe: nula más allá del inglés.

## Casos de uso

- Transcripción en el navegador: integrar el modelo en una aplicación web que transcriba notas de voz o reuniones sin enviar el audio a un servidor, usando Transformers.js y los pesos ONNX del repositorio. Adecuado por la privacidad y por evitar costes de infraestructura.
- Subtitulado de vídeos en inglés: procesar pistas de audio en segmentos de 30 segundos y generar subtítulos con timestamps, aprovechando la salida estructurada del decoder de Whisper.
- Prototipado rápido en JavaScript: validar una idea de producto de transcripción en Node.js antes de migrar a un backend Python con el modelo original, reduciendo la fricción de dependencias.
- Dictado por voz en aplicaciones de escritorio Electron: el modelo cabe en el repositorio de 2,2 GB y puede ejecutarse localmente sin GPU dedicada, ofreciendo dictado offline en inglés.
- Búsqueda por voz en documentación técnica: transcribir consultas habladas en inglés y pasarlas a un motor de búsqueda textual, con latencia aceptable para consultas cortas.
- Accesibilidad web: añadir transcripción en vivo a contenido multimedia en inglés para usuarios con discapacidad auditiva, ejecutando el modelo en el cliente y evitando depender de servicios externos de ASR.
- Análisis de llamadas de atención al cliente en inglés: transcribir grabaciones cortas para extraer texto indexable, aunque para volúmenes altos conviene usar el modelo original en servidor con vLLM o faster-whisper.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de WER, latencia ni throughput, y al tratarse de una conversión de formato no se esperan diferencias de calidad respecto a `openai/whisper-base.en` más allá de posibles variaciones numéricas por la conversión a ONNX.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en FP32 para los 74 millones de parámetros; en la práctica, el modelo puede ejecutarse en CPU sin GPU dedicada.
- GPU recomendadas: no requiere GPU; funciona en CPU moderna. En GPU, cualquier tarjeta con al menos 2 GB de VRAM es suficiente (GTX 1050, RTX 3050, etc.).
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer e incluso en iGPU.
- Opciones de despliegue: Transformers.js (navegador y Node.js) es el objetivo del repositorio; también puede servirse con ONNX Runtime directamente. Para servidor en Python, es preferible usar el modelo original con faster-whisper, WhisperX o el pipeline de Transformers.
- Latencia y throughput: no disponibles. Como referencia cualitativa, Whisper base procesa audio en tiempo real o más rápido en CPU moderna, pero no se dispone de cifras medidas para esta conversión concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto audio | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Jluedy/whisper-base.en (este) | 74 M | Ingles | 30 s | ONNX | no disponible | Hugging Face, 0 descargas |
| openai/whisper-base.en | 74 M | Ingles | 30 s | PyTorch (safetensors/bin) | MIT (segun repositorio original) | Hugging Face, ampliamente usado |
| openai/whisper-small.en | 244 M | Ingles | 30 s | PyTorch | MIT (segun repositorio original) | Hugging Face, ampliamente usado |
| openai/whisper-base (multilingue) | 74 M | Multilingue (99 idiomas) | 30 s | PyTorch | MIT (segun repositorio original) | Hugging Face, ampliamente usado |

La diferencia principal frente a las alternativas es el formato: este repositorio ofrece pesos ONNX listos para Transformers.js, mientras que los originales de OpenAI requieren conversión previa para su uso en JavaScript. En calidad y capacidades, es equivalente a `openai/whisper-base.en` y queda por debajo de `whisper-small.en` en precisión, a costa de un mayor coste computacional.

## Limitaciones y advertencias

- Especializado exclusivamente en inglés: no transcribe ni traduce otros idiomas.
- Ventana de audio limitada a 30 segundos por segmento; para audios más largos es necesario segmentar y gestionar los timestamps manualmente.
- Riesgo de alucinación en pasajes con silencio, ruido o audio ininteligible, comportamiento documentado en la familia Whisper.
- Sesgos heredados del entrenamiento original de OpenAI sobre datos web y de subtitulado, con posible infrarepresentación de acentos no estándar y variedades dialectales.
- Licencia no declarada en la información disponible: antes de un uso comercial, verificar la licencia del modelo base en `openai/whisper-base.en` y los términos aplicables a la conversión.
- Repositorio con 0 descargas y 0 likes: sin evidencia de uso en producción ni mantenimiento activo; la model card indica que se trata de una solución temporal hasta que WebML gane tracción.
- El tamaño del repositorio (2,2 GB) es desproporcionado para 74 millones de parámetros, lo que sugiere que puede contener múltiples variantes ONNX o pesos sin cuantizar; conviene inspeccionar la carpeta `onnx` antes de desplegar.
- Para servidor en producción, usar el modelo original con faster-whisper o WhisperX ofrece mejor rendimiento y soporte comunitario.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Jluedy/whisper-base.en
- Modelo base original: https://huggingface.co/openai/whisper-base.en
- Repositorio de Whisper en OpenAI: https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- Documentación de Optimum para conversión a ONNX: https://huggingface.co/docs/optimum/index
- Documentación de ONNX Runtime: https://onnxruntime.ai/docs/
