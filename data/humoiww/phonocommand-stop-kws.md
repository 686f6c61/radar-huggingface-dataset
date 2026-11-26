# humoiww/PhonoCommand-Stop-KWS

## Resumen

PhonoCommand Stop KWS es un detector acústico de palabra clave (keyword spotting, KWS) orientado a la detección de la palabra de parada "stop" en inglés y "停" en chino, incluyendo cantonés como idioma declarado. Lo publica el usuario humoiww como componente del sistema StreamingCommand, y se distribuye como un único fichero ONNX de 11,4 MB pensado para inferencia en CPU dentro de una arquitectura de streaming.

El modelo deriva de un checkpoint Zipformer bilingüe chino-inglés de Icefall (icefall-kws-zipformer-zh-en-3M), al que se le ha adaptado el codificador acústico original con un clasificador de streaming de tres clases: ruido de fondo, "stop" en inglés y "停" en chino. No es un modelo generativo ni un LLM: es un clasificador de tramas que consume características acústicas y estados de streaming, y devuelve detecciones puntuales.

Su relevancia práctica está en que cubre una necesidad muy concreta en pipelines de voz en tiempo real (interrumpir una reproducción o un agente conversacional con una orden de parada) con un coste computacional mínimo y una licencia permisiva Apache 2.0. El frontend PCM mono a 16 kHz, la gestión de estados y los umbrales de decisión no forman parte del repositorio: los aporta StreamingCommand.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer (encoder acústico de Icefall) con clasificador de streaming |
| Parametros totales | no disponible (pesos ONNX de 11.367.855 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de streaming por tramas, no secuencial) |
| Tipos de cuantizacion | no disponible (export ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | en, zh, yue |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`zipformer-start-tail.onnx`) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint bilingüe KWS de Icefall `icefall-kws-zipformer-zh-en-3M`, publicado en ModelScope. La arquitectura base es Zipformer, un encoder convolucional-recurrente con atención lineal empleado habitualmente en reconocimiento de voz, aquí reducido a una tarea de clasificación de keyword spotting. Sobre el codificador acústico original se añade un clasificador de streaming con tres clases (fondo, "stop" en inglés, "停" en chino).

El export a ONNX recibe como entradas las características acústicas y los estados de streaming, lo que implica una inferencia incremental trama a trama. No se documentan en la información disponible el volumen de datos de entrenamiento, la composición del dataset de fine-tuning, ni si hubo técnicas de aumento de datos, destilación o ajuste con RLHF/DPO (no aplicable en este tipo de modelo). Tampoco se detalla el esquema exacto de características acústicas de entrada más allá de que el frontend PCM mono a 16 kHz lo aporta StreamingCommand.

## Capacidades

- Detección de la palabra de parada "stop" en inglés y "停" en chino sobre audio continuo.
- Clasificación de tres clases: fondo, "stop" y "停".
- Inferencia en streaming con estados recurrentes persistentes entre tramas.
- Ejecución en CPU mediante ONNX Runtime (el autor lo describe explícitamente como detector acústico para CPU).
- Modelo acústico multilingüe limitado a en, zh y yue.
- No realiza generación de texto, razonamiento, código, matemáticas, visión ni tool calling.
- No soporta agentes ni razonamiento multi-paso: es un clasificador puntual.

## Casos de uso

- Interrupción por voz de asistentes conversacionales: el detector consume el flujo PCM a 16 kHz en paralelo al reconocedor principal y emite una señal de parada cuando el usuario dice "stop" o "停", permitiendo cortar la síntesis de voz o la generación en curso sin esperar al resultado del ASR completo.
- Manos libres en entornos industriales o de laboratorio: como disparador de parada de emergencia por voz sobre un dispositivo con micrófono, con la ventaja de que el modelo es lo bastante pequeño (11,4 MB) para ejecutarse en CPU junto al resto del sistema.
- Control de reproducción multimedia: detener música, vídeo o lectura de un audiolibro mediante una orden corta, integrándolo en un pipeline de audio de baja latencia.
- Atención al cliente automatizada: capa de barge-in que permite al usuario interrumpir un mensaje pregrabado o una respuesta TTS con una palabra clave fija, reduciendo la latencia percibida frente a soluciones basadas en VAD.
- Domótica y dispositivos embebidos: activación de una rutina de parada (por ejemplo, cerrar una persiana motorizada o detener una rutina de limpieza) en dispositivos con recursos limitados y sin GPU.
- Filtrado previo en pipelines de ASR: descartar o marcar segmentos que contienen órdenes de parada antes de enviarlos a un reconocedor más costoso, ahorrando cómputo en despliegues con muchas horas de audio.
- Evaluación y prototipado de sistemas de wake-word: servir como bloque de referencia para comparar umbrales y tasas de falsos positivos en un sistema de activación por voz propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica que el modelo se validó con grabaciones del propio proyecto y advierte de que siguen siendo posibles los falsos positivos y las detecciones perdidas. No se documentan métricas de precisión, recall, AUC, tasa de falsos positivos por hora ni latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el autor lo describe como detector para CPU y el fichero ONNX ocupa 11,4 MB, por lo que el consumo de memoria es del orden de decenas de MB en RAM.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Cualquier GPU (RTX 4090, A100, H100) serviría vía ONNX Runtime con provider CUDA, pero no aporta ventaja significativa para este tamaño.
- Cabe en cualquier GPU de consumo e incluso en dispositivos embebidos y SBC con CPU modesta.
- Opciones de despliegue: ONNX Runtime (CPU o CUDA) y cualquier runtime compatible con ONNX; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. Al ser streaming, la latencia vendrá determinada por el tamaño de trama y el frontend de StreamingCommand, no documentados.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Formato | Contexto |
|---|---|---|---|---|---|
| PhonoCommand Stop KWS | Zipformer KWS (streaming) | en, zh, yue | apache-2.0 | ONNX | no aplica |
| icefall-kws-zipformer-zh-en-3M (pkufool) | Zipformer KWS (checkpoint base) | zh, en | no disponible en la información | no disponible | no aplica |
| Porcupine (Picovoice) | KWS comercial | múltiples | propietaria | binario | no aplica |
| openWakeWord | KWS open source | principalmente en | apache-2.0 | ONNX/TFLite | no aplica |

La comparación con alternativas comerciales y de código abierto es cualitativa: no se dispone de métricas publicadas de este modelo que permitan contrastar precisión o tasa de falsos positivos frente a Porcupine u openWakeWord. La diferencia principal es el enfoque bilingüe chino-inglés y la derivación explícita de un checkpoint de Icefall.

## Limitaciones y advertencias

- El autor advierte explícitamente de que persisten falsos positivos y detecciones perdidas; no se publican tasas de error.
- Solo detecta dos palabras concretas ("stop" y "停"); no es un sistema de reconocimiento de voz ni admite vocabulario configurable.
- El repositorio no incluye el frontend PCM, la gestión de estados ni los umbrales: sin StreamingCommand el modelo no es directamente utilizable.
- El rendimiento en acentos, ruido de fondo, micrófonos lejanos o habla espontánea no está documentado.
- La cobertura de cantonés (yue) se declara en los metadatos, pero la model card solo menciona inglés y chino; no hay evidencia de evaluación específica en cantonés.
- No se documentan sesgos demográficos ni acústicos; al ser un clasificador de dos palabras, el riesgo de sesgo se limita a la variabilidad de pronunciación y condiciones de grabación.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero conviene conservar el aviso de licencia y verificar las obligaciones derivadas del checkpoint base de Icefall.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño reportado es 0.0 GB pese a que la model card declara un fichero de 11,4 MB; conviene verificar la integridad con el SHA-256 indicado antes de desplegarlo.
- Para producción, es imprescindible validar el modelo con grabaciones propias del dominio objetivo y ajustar los umbrales de decisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/humoiww/PhonoCommand-Stop-KWS
- Checkpoint base en ModelScope: https://www.modelscope.cn/models/pkufool/icefall-kws-zipformer-zh-en-3M-2025-12-20
- Icefall (repositorio de recetas KWS y ASR): https://github.com/k2-fsa/icefall
- ONNX Runtime: https://onnxruntime.ai/
