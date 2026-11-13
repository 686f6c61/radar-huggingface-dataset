# kungfupanda12/bolo-sun

## Resumen

Bolo Sun v1 es un modelo de reconocimiento automático del habla (ASR) especializado en comandos de voz en hinglish, la mezcla de hindi y english que se usa coloquialmente en la India. Lo desarrolla el autor independiente kungfupanda12 como componente del asistente Bolo, una aplicación de escritorio offline para portátiles que interpreta órdenes cortas como "downloads folder mein terminal kholo" y las transcribe en escritura latina (romanizada). El modelo parte de Oriserve/Whisper-Hindi2Hinglish-Swift, una variante de Whisper base de 73 millones de parámetros, y se ha ajustado fino sobre datos sintéticos.

La relevancia del modelo reside en su enfoque de despliegue: con 72,6 millones de parámetros y pesos en float16 de 142 MB, está pensado para ejecutarse en el propio dispositivo (on-device), sin conexión y con latencias de alrededor de 100 ms por comando en un Apple M2. No es un modelo de dictado general, sino un reconocedor de comandos acotado a 20 tipos de órdenes, entrenado exclusivamente con voz sintética generada mediante TTS (Indic Parler-TTS) y aumentada con respuestas de impulso de sala y ruido real.

Se trata de una versión de previsualización de investigación (v1) publicada en noviembre de 2026, con cero descargas y cero likes en Hugging Face en el momento de la consulta. Su interés técnico está en la cadena completa del asistente: el ASR genera las cinco mejores transcripciones, un modelo de comandos (Bolo Tiny) las reordena y se validan nombres contra las aplicaciones y carpetas realmente presentes en la máquina.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper base) |
| Parámetros totales | 72.593.920 (73 M) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (ventana de audio de Whisper base, no especificada en la información) |
| Tipos de cuantización | Pesos publicados en float16; no se detallan otras cuantizaciones |
| Idiomas soportados | Hindi (hi), inglés (en); salida en hinglish romanizado |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un Whisper de tamaño base (encoder-decoder transformer con atención estándar), heredado de Oriserve/Whisper-Hindi2Hinglish-Swift y ajustado fino de forma completa (full fine-tuning). No incorpora innovaciones arquitectónicas propias: la aportación está en el corpus de entrenamiento y en el pipeline que lo rodea.

El entrenamiento se realizó íntegramente con voz sintética: 3.287 clips de comando que cubren 20 tipos de órdenes, generados con Indic Parler-TTS, a los que se añadieron respuestas de impulso de sala reales y ruido del corpus OpenSLR 28, además de aproximadamente un 3 % de clips solo con ruido. Se ejecutaron 5 épocas, unos 12 minutos en una GPU T4 gratuita de Kaggle. El autor documenta que entrenar 10 épocas reducía el WER sintético pero empeoraba el rendimiento sobre voz real, lo que motivó detenerse en 5. No se menciona uso de RLHF ni DPO; el ajuste es supervisado sobre pares audio-transcripción.

## Capacidades

- Reconocimiento de voz de comandos cortos en hinglish, con salida en escritura latina romanizada.
- Manejo de code-switching hindi-inglés dentro de una misma frase.
- Generación de múltiples hipótesis de transcripción (el pipeline del asistente conserva las 5 mejores).
- Integración con un modelo de reordenación de comandos (Bolo Tiny) para seleccionar la transcripción final.
- Verificación de entidades (nombres de aplicaciones y carpetas) contra el sistema de archivos real del dispositivo.
- Ejecución offline: no requiere conexión y el audio no sale del equipo.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un componente ASR puro.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Asistente de voz de escritorio offline: el modelo transcribe órdenes como "volume 40 pe kar do" y las entrega al intérprete de comandos de Bolo, que ejecuta la acción sobre el sistema operativo sin enviar audio a ningún servidor.
- Automatización de tareas cotidianas en portátiles: apertura de terminales, gestión de carpetas o ajuste de volumen mediante voz, aprovechando la latencia de ~100 ms en hardware consumer como un Apple M2.
- Prototipado de interfaces de voz para usuarios bilingües hindi-inglés: sirve como base para experimentar con ASR code-switching en entornos donde no se dispone de datos reales etiquetados.
- Investigación sobre entrenamiento con datos sintéticos: el modelo y su documentación (WHAT_WE_TRIED.md) permiten reproducir el efecto de la aumentación con ruido y respuestas de impulso en un dominio acotado.
- Evaluación de pipelines ASR + reordenación: al conservar 5 hipótesis y aplicar un modelo de comandos, es un banco de pruebas para estudiar cómo el reranking mejora la precisión de acción final (del ~51 % al 80 % según el autor).
- Despliegue en dispositivos con recursos limitados: sus 142 MB en float16 permiten incluirlo en aplicaciones de escritorio o embebidas sin GPU dedicada, siempre que el dominio de comandos esté acotado.
- Pruebas de privacidad en asistentes de voz: al no usar grabaciones reales en el entrenamiento y ejecutarse en local, sirve como referencia para arquitecturas que evitan la telemetría de audio.

## Benchmarks y rendimiento

| Conjunto de prueba | Swift (base) | Bolo Sun |
|---|---|---|
| Sintético, voces TTS reservadas: WER | 32,1 % | 16,2 % |
| Voz real, 55 comandos, 1 hablante: WER | No disponible | 18,3 % (v0: 23,7 %) |
| Voz real, mismos 55: acción correcta (pipeline Bolo completo) | ~51 % | 80,0 % |
| OpenSLR 104 hindi-inglés: WER | 55,2 % | v0: 59,1 % |

El autor advierte que los resultados sobre voz real provienen de un único hablante (él mismo), con micrófono de portátil en una sala silenciosa, y que con n = 55 la incertidumbre es de aproximadamente ±11 puntos. Además, algunas correcciones del pipeline se descubrieron sobre ese mismo conjunto, por lo que el 80 % de acción correcta es optimista.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para inferencia en float16 (142 MB de pesos más activaciones); no se especifica cifra exacta.
- GPU recomendadas: no se indican modelos concretos; el entrenamiento se realizó en una T4 de Kaggle y la inferencia se midió en un Apple M2.
- Cabe en GPU consumer: sí, por tamaño; también en CPU y en hardware Apple Silicon.
- Opciones de despliegue: pipeline de transformers (librería indicada), con posibilidad de exportación a otros runtimes no documentada en la información disponible.
- Latencia: ~100 ms por comando con decodificación greedy y ~180 ms con beam search de 5 en un Apple M2.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER (referencia) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bolo Sun v1 | 73 M | No disponible | 16,2 % sintético; 18,3 % voz real (1 hablante) | Apache-2.0 | Hugging Face |
| Oriserve/Whisper-Hindi2Hinglish-Swift | 73 M (Whisper base) | No disponible | 32,1 % sintético; 55,2 % OpenSLR 104 | No disponible en la información | Hugging Face |
| Whisper base (OpenAI) | 74 M | 30 s de audio | No disponible en la información | MIT (según información pública de OpenAI) | Hugging Face, OpenAI |

La comparación directa con Whisper base original no está respaldada por datos en la información proporcionada; solo se dispone de las cifras frente a Swift. No se han identificado en la información otros modelos ASR específicos de comandos hinglish con los que contrastar.

## Limitaciones y advertencias

- Entrenado solo con voz sintética: no se usaron grabaciones de personas reales diciendo comandos, lo que puede limitar la generalización a voces, acentos y micrófonos distintos.
- Evaluación sobre voz real con un único hablante y 55 muestras (±11 puntos de incertidumbre); el 80 % de acción correcta es optimista por haberse ajustado el pipeline sobre ese mismo conjunto.
- Debilidad documentada con palabras inglesas dentro de frases hindi: "quit arc" transcrito como "width arduino" o "google" como "go well".
- Olvido parcial en habla general: en OpenSLR 104 el WER empeora respecto a Swift (59,1 % frente a 55,2 % en v0).
- Diseñado para comandos, no para dictado: no debe usarse para transcripción libre de reuniones o audio largo.
- Riesgo de alucinación inherente a los modelos Whisper en segmentos con ruido o silencio, aunque el autor incluyó un 3 % de clips solo con ruido para mitigarlo.
- Licencia Apache-2.0: permite uso comercial, pero el modelo se distribuye como previsualización de investigación sin garantías de robustez en producción.
- Sin soporte de tool calling ni de agentes; cualquier lógica de acción recae en el pipeline externo (Bolo Tiny y verificación de entidades).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kungfupanda12/bolo-sun
- Modelo base: https://huggingface.co/Oriserve/Whisper-Hindi2Hinglish-Swift
- Modelo de comandos Bolo Tiny: https://huggingface.co/kungfupanda12/bolo-tiny
- Repositorio del asistente Bolo: https://github.com/Optimus2007/bolo
- Documentación de experimentos: https://github.com/Optimus2007/bolo/blob/main/docs/WHAT_WE_TRIED.md
- TTS usado para datos sintéticos: https://huggingface.co/ai4bharat/indic-parler-tts
