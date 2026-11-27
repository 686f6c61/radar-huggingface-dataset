# drmhse/nano-edge-tts-standalone

## Resumen

nano-edge-tts-standalone es un modelo de síntesis de voz (text-to-speech) de tan solo 3,27 millones de parámetros, destilado a partir de Kokoro-82M por el autor independiente drmhse. A diferencia de la versión v1, que conservaba el lado de texto de Kokoro (28,5M de parámetros), esta versión reemplaza tanto el codificador de texto como el decodificador, de modo que no ejecuta ninguna red de Kokoro ni requiere instalar su software auxiliar (misaki, spaCy, espeak-ng). De Kokoro solo conserva datos: el vocabulario de fonemas, los 28 vectores de voz en inglés y el front-end de texto.

El modelo resuelve el problema de desplegar TTS neuronal de calidad razonable en entornos con recursos muy limitados, como CPU de un solo hilo, dispositivos edge o navegador. Su arquitectura combina un lado de texto (1,52M) que convierte fonemas, etiquetas POS de sus palabras y la voz en features, duraciones, pitch y energía, con un mapeador (0,96M, 80 frames/s) y un renderizador (0,79M, 160 frames/s) que fijan ganancias por frecuencia sobre un tren de pulsos y ruido blanco. Dos STFT inversas generan el audio final, sin ninguna red a la tasa de muestreo de audio.

Es relevante porque demuestra que la destilación de conocimiento puede comprimir un TTS de 81,8M de parámetros a 3,27M (25 veces menos) manteniendo una calidad competitiva en el Open TTS Leaderboard (0,69 % de word error y 4,465 de UTMOS), con un factor de tiempo real de 0,0050 en PyTorch y 0,0045 en ONNX Runtime sobre un hilo de CPU, es decir, entre 28 y 31 veces más rápido que Kokoro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS híbrido: lado de texto (transformer ligero) + mapeador + renderizador harmonic-plus-noise con DDSP y dos STFT inversas |
| Parametros totales | 3,27M (lado de texto 1,52M, mapeador 0,96M, renderizador 0,79M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos de 13 MB en disco, sin detalle de cuantizacion) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors/PyTorch y grafos ONNX (repo con pytorch y onnx) |

## Arquitectura y entrenamiento

El modelo es el resultado de una cadena de destilación de conocimiento desde Kokoro-82M. La arquitectura se divide en tres componentes aprendidos: un lado de texto de 1,52M de parámetros que recibe fonemas, etiquetas de parte de la oración de las palabras y el vector de voz, y produce features, duraciones, pitch y energía; un mapeador de 0,96M que opera a 80 frames por segundo; y un renderizador de 0,79M que opera a 160 frames por segundo. El renderizador fija ganancias por frecuencia sobre un tren de pulsos y sobre ruido blanco (enfoque harmonic-plus-noise con DDSP), y el audio final se obtiene con dos STFT inversas. Ninguna red se ejecuta a la tasa de muestreo de audio, lo que explica el bajo coste computacional.

El entrenamiento parte de datos de Kokoro (vocabulario de fonemas, 28 vectores de voz ingleses y front-end de texto) pero todos los pesos son nuevos. La model card documenta la cadena completa de checkpoints con argumentos y logs en el directorio `chain/`, el código exacto en `code/` y un script reproducible desde libros públicos hasta los pesos finales. La versión 2.2 (la actual) afina el decodificador con su post-filtro activado durante el entrenamiento (checkpoint `G5S`), lo que corrige el realce artificial de la banda de 4–8 kHz presente en 2.1 (que estaba entre +2,1 y +5,0 dB por encima de Kokoro) y reduce el grano de 160 Hz aproximadamente a la mitad. La versión 2.1 había afinado el lado de texto (`FT4_map`) para recuperar palabras como "boy" y "noise" que se perdían en 2.0. No se especifica en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Síntesis de voz en inglés a partir de texto, con 28 voces predefinidas (af_heart, af_bella, am_michael, am_fenrir, entre otras).
- Conversión de texto a fonemas mediante front-end empaquetado, sin dependencias de misaki, spaCy ni espeak-ng.
- Control de duración, pitch y energía por fonema a través del lado de texto.
- Generación de audio de alta fidelidad relativa mediante renderizado harmonic-plus-noise con DDSP.
- Inferencia en CPU de un solo hilo con factor de tiempo real de 0,0050 (PyTorch) y 0,0045 (ONNX Runtime).
- Síntesis por lotes (batched synthesis) y wrapper de `transformers`.
- Exportación a ONNX para despliegue en entornos sin PyTorch.
- Reproducibilidad completa: cadena de entrenamiento, código y script de reconstrucción publicados.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step; es exclusivamente un modelo TTS.
- No soporta visión, audio de entrada ni otros idiomas distintos del inglés.

## Casos de uso

- Lectura de artículos y documentos en aplicaciones móviles: el modelo cabe en 13 MB de pesos y consume 0,60 GB de memoria pico con ONNX Runtime, por lo que puede ejecutarse en el propio dispositivo sin conexión, leyendo texto en inglés con una de las 28 voces.
- Asistentes de voz embebidos en dispositivos IoT o edge: con un factor de tiempo real de 0,0045 en un hilo de CPU, puede sintetizar respuestas de voz en tiempo real en hardware de bajas prestaciones donde Kokoro-82M no cabría.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla que necesiten síntesis local, rápida y con bajo consumo de memoria, sin depender de servicios en la nube.
- Generación de audiolibros y pódcast automatizados: la calidad medida en el Open TTS Leaderboard (0,69 % de word error, UTMOS 4,465) y la capacidad de síntesis por lotes permiten procesar textos largos por fragmentos con voces consistentes.
- Sistemas de navegación y avisos por voz en vehículos: la latencia baja y la ausencia de dependencias externas facilitan el despliegue en unidades de infoentretenimiento con CPU limitada.
- Pruebas de integración continua (CI) para pipelines de audio: al ser reproducible y ligero, puede usarse como generador de voz de referencia en tests automatizados de sistemas de reconocimiento de voz o de procesamiento de audio.
- Demos educativas y de investigación sobre destilación de modelos: la cadena de entrenamiento publicada permite estudiar cómo se comprime un TTS de 81,8M a 3,27M parámetros con pérdida mínima de calidad.

## Benchmarks y rendimiento

| Metrica | Kokoro-82M | nano-edge-tts v2.0 | nano-edge-tts v2.2 (este) |
|---|---|---|---|
| Parametros aprendidos | 81,8M | 3,27M | 3,27M |
| Pesos en disco | 327 MB | 13 MB | 13 MB |
| Factor de tiempo real, un hilo CPU (PyTorch) | 0,1415 | 0,0048 (29× más rápido) | 0,0050 (28× más rápido) |
| Factor de tiempo real, un hilo CPU (ONNX Runtime) | no disponible | no disponible | 0,0045 (31× más rápido) |
| Memoria pico con front-end (PyTorch) | 1,78 GB | 0,60 GB | 0,71 GB |
| Memoria pico con front-end (ONNX Runtime) | no disponible | no disponible | 0,60 GB |
| Errores de palabra con Whisper small.en (60 frases no vistas) | 36 | 39 | 35 |
| Palabras objetivo difíciles pronunciadas (dos reconocedores, 27 voces) | 81,8 % | 59,3 % | 78,9 % |
| Open TTS Leaderboard inglés, word error / UTMOS | 0,66 % / 4,51 | 0,77 % / 4,441 | 0,69 % / 4,465 |

Los datos de Kokoro en el leaderboard se publicaron en la versión 1.7.0 con otro hardware; los de este modelo se ejecutaron localmente en un hilo de CPU. Las cifras de palabras difíciles corresponden a 4.806 objetivos (34 palabras con sonidos raros o confundibles, solas, en mitad de frase y a final de frase, más 20 preguntas cortas), contando una palabra como pronunciada solo si faster-whisper small.en y wav2vec2-large-960h la detectan.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el modelo está diseñado para CPU. Memoria pico de 0,71 GB en PyTorch y 0,60 GB en ONNX Runtime con el front-end incluido.
- GPU recomendadas: no disponibles ni necesarias; el modelo no está pensado para aceleración GPU y la información no documenta rendimiento en GPU.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) por su tamaño ínfimo, pero no se han publicado cifras de latencia en GPU.
- Opciones de despliegue: PyTorch nativo, ONNX Runtime, wrapper de `transformers`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput: factor de tiempo real de 0,0050 en PyTorch y 0,0045 en ONNX Runtime sobre un hilo de CPU (Apple Silicon), medido sobre seis frases de muestra (unos 45 s de audio), mejor de tres ejecuciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| nano-edge-tts-standalone (este) | 3,27M | no disponible | Apache 2.0 | Hugging Face | Destilado de Kokoro, solo inglés, 28 voces, sin dependencias externas |
| Kokoro-82M | 81,8M | no disponible | Apache 2.0 | Hugging Face | Modelo base; requiere misaki, spaCy y espeak-ng; 25× más parámetros |
| nano-edge-tts v1 | 30,2M | no disponible | Apache 2.0 | Hugging Face | Versión previa; conserva el lado de texto de Kokoro (28,5M) |
| Otros TTS ligeros (p. ej. Piper, VITS pequeños) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

La comparación se limita a la familia nano-edge-tts y su modelo base Kokoro-82M, ya que la información disponible no incluye datos de otros modelos TTS comparables en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Solo soporta inglés; no hay soporte multilingüe documentado.
- El modelo es exclusivamente TTS: no genera texto, no razona, no hace tool calling ni soporta agentes.
- Riesgo de errores de pronunciación en palabras con sonidos raros o confundibles: la tasa de acierto en palabras difíciles es del 78,9 %, inferior al 81,8 % de Kokoro-82M.
- El word error en el Open TTS Leaderboard (0,69 %) es ligeramente superior al de Kokoro (0,66 %), aunque la diferencia es pequeña.
- La calidad de voz depende de las 28 voces predefinidas; no se documenta clonación de voz ni voces personalizadas.
- No se han publicado datos sobre sesgos demográficos o acentos más allá de las voces incluidas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo deriva de Kokoro-82M (también Apache 2.0), por lo que conviene verificar el cumplimiento de ambas licencias en producción.
- Las cifras de rendimiento se midieron en un portátil con CPU Apple Silicon; el rendimiento en otros hardware puede variar.
- La información no detalla el proceso de cuantización ni los formatos exactos de los pesos más allá de PyTorch y ONNX.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/drmhse/nano-edge-tts-standalone
- Modelo base Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Versión previa nano-edge-tts v1: https://huggingface.co/drmhse/nano-edge-tts
- Paper: https://huggingface.co/drmhse/nano-edge-tts-standalone/blob/main/paper/paper.pdf
- Open TTS Leaderboard: https://huggingface.co/spaces/hf-audio/open_tts_leaderboard
- Tag v2.1: https://huggingface.co/drmhse/nano-edge-tts-standalone/tree/v2.1
- Tag v2.1-g2: https://huggingface.co/drmhse/nano-edge-tts-standalone/tree/v2.1-g2
- Tag v2.0: https://huggingface.co/drmhse/nano-edge-tts-standalone/tree/v2.0
- Muestras de audio: https://huggingface.co/drmhse/nano-edge-tts-standalone/resolve/main/samples/af_heart_kokoro.wav (y equivalentes para af_bella, am_michael, am_fenrir)
