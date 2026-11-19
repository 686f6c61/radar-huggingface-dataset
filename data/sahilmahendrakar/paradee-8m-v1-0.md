# sahilmahendrakar/Paradee-8M-v1.0

## Resumen

Paradee-8M-v1.0 es un modelo de síntesis de voz (text-to-speech) en inglés desarrollado por sahilmahendrakar, destilado a partir de Kokoro-82M mediante destilación de conocimiento. Con 8,07 millones de parámetros, reproduce una única voz, la `af_heart` de Kokoro, y está pensado para escenarios donde el tamaño y la velocidad de inferencia en CPU son críticos. La versión int8 ocupa un único archivo ONNX de 9 MB, frente a los 325 MB del modelo profesor.

El modelo mantiene una calidad cercana a su profesor: 4,41 de UTMOS frente a 4,52 de Kokoro-82M, y una tasa de error de palabra (WER) idéntica del 5,7 % en la evaluación del autor. En la Open TTS Leaderboard de Hugging Face, a fecha de 9 de octubre de 2026, ocupa el segundo puesto en WER en inglés (1,47 %), solo por detrás de Kokoro-82M (1,46 %), y lidera el benchmark de streaming en CPU con un RTFx de 11,48.

Su relevancia actual radica en que demuestra que es posible comprimir un modelo TTS de 82M a 8M parámetros con una pérdida de calidad mínima, habilitando despliegues en navegador, dispositivos de borde y entornos sin GPU con latencias de primer audio de 390 ms.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro a anchuras reducidas: lado de texto (4,23M) y decodificador (3,85M), con filtro de phase-locking |
| Parametros totales | 8,07M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de hasta 512 tokens de fonemas, incluidos pads) |
| Tipos de cuantizacion | int8 (9,0 MB) y fp32 (37 MB) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (int8 y fp32), PyTorch (.pt para las dos mitades) |
| Frecuencia de muestreo | 24 kHz |
| Voces | una sola (`af_heart` de Kokoro) |
| Entradas | `input_ids` int64 [1, T] (fonemas con pad 0 en los extremos) y `speed` float32 [1] |
| Salida | `waveform` float32 [1, samples] a 24 kHz |

## Arquitectura y entrenamiento

Paradee reutiliza el código de Kokoro con anchuras menores: se divide en un lado de texto de 4,23M de parámetros y un decodificador de 3,85M. Ambas mitades se entrenaron por separado contra el profesor congelado (Kokoro-82M), sobre 12.000 frases de WikiText-103 (23,9 horas de audio) leídas por Kokoro. El lado de texto aprende a predecir las duraciones de fonema, el pitch y la energía del profesor, mientras que el decodificador genera la forma de onda. El grafo ONNX incluye un filtro de phase-locking que forma parte del modelo exportado.

El proceso es destilación pura, sin RLHF ni DPO. La innovación principal es la compresión extrema: mantiene la arquitectura y el vocabulario fonético de Kokoro, pero reduce las dimensiones internas hasta los 8M de parámetros. El resultado es un modelo que funciona en un único hilo de CPU y que puede ejecutarse en el navegador mediante ONNX Runtime o kokoro-js. Para el navegador, el autor proporciona `web/misaki.js`, que convierte la ortografía de eSpeak NG (usada por kokoro-js) a la notación de misaki, la librería G2P de Kokoro; sin esta conversión, Whisper transcribe mal aproximadamente el 31 % de las palabras, y con ella alrededor del 2 %.

## Capacidades

- Síntesis de voz en inglés a partir de texto, con una única voz (`af_heart`).
- Control de velocidad mediante el parámetro `speed` (1.0 es velocidad normal).
- Fonemización compatible con misaki (la G2P de Kokoro); requiere entrada en formato de fonemas misaki.
- Inferencia en CPU sin GPU, con un rendimiento de aproximadamente 18x tiempo real en un hilo de CPU (25x en la medición PyTorch del paper).
- Exportación ONNX con grafo completo de fonemas a audio, apta para onnxruntime y navegador.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- No es multilingüe: solo inglés.

## Casos de uso

- Lectura por voz en el navegador: con el archivo ONNX int8 de 9 MB, el modelo puede cargarse en una página web y sintetizar texto sin backend, usando kokoro-js y el conversor `misaki.js` para la fonemización.
- Asistentes de voz en dispositivos de borde: su ejecución en un solo hilo de CPU y su tamaño reducido permiten integrarlo en Raspberry Pi o dispositivos embebidos para respuestas habladas en tiempo real.
- Generación de audiolibros y contenido largo: la velocidad de 18x tiempo real en CPU permite sintetizar horas de texto en minutos sin infraestructura GPU.
- Accesibilidad: lectura de pantalla para personas con discapacidad visual en aplicaciones de escritorio o web, donde el coste de un modelo de 325 MB sería prohibitivo.
- Sistemas de respuesta interactiva por voz (IVR): la latencia de primer audio de 390 ms en streaming CPU permite conversaciones fluidas en centros de llamadas con recursos limitados.
- Pruebas y prototipado de pipelines TTS: al ser un modelo pequeño y con licencia Apache 2.0, sirve para validar integraciones de TTS antes de pasar a modelos mayores.
- Síntesis por lotes en servidores sin GPU: el throughput de 11,5x tiempo real en streaming CPU permite procesar grandes volúmenes de texto en infraestructura convencional.

## Benchmarks y rendimiento

Resultados del paper sobre 200 frases reservadas; velocidad medida en un hilo de CPU de Apple M4 Pro (PyTorch):

| Modelo (voz) | Params | Tamano | Velocidad | UTMOS | WER |
|---|---:|---:|---:|---:|---:|
| Kokoro-82M, profesor (af_heart) | 81,8M | 325 MB | 7,6x | 4,52 | 5,7 % |
| **Paradee (af_heart)** | **8,07M** | **8,45 MB** | **25,0x** | **4,41** | **5,7 %** |
| Kokoro-7M-Distill (af_msa) | 7,48M | 30,1 MB | 35,5x | 4,18 | 7,4 % |
| Piper, en_US-lessac-medium | 15,7M | 63,2 MB | 15,4x | 4,36 | 8,8 % |
| KittenTTS nano 0.8 (Bella) | 14,0M | 56,8 MB | 10,7x | 4,01 | 5,5 % |

El archivo `paradee_int8.onnx` publicado obtiene UTMOS 4,41 en las mismas frases y corre a aproximadamente 18x tiempo real en onnxruntime con un hilo.

Open TTS Leaderboard de Hugging Face (a 9 de octubre de 2026):

| Metrica | Resultado |
|---|---|
| WER en ingles (Seed TTS Eval / CV3 Eval) | 1,47 % (2.o puesto, tras Kokoro-82M con 1,46 %) |
| Pareto front tamano vs. WER | En la frontera; ningun modelo de tamano comparable baja el WER |
| RTFx en streaming CPU (batch 1, un hilo) | 11,48 (1.er puesto) |
| Time-to-first-audio en streaming CPU | 390 ms de mediana (4.o puesto) |

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo int8 de 9 MB cabe en memoria RAM de cualquier dispositivo.
- GPU recomendadas: no necesarias; funciona en CPU. En GPU puede ejecutarse con onnxruntime, pero el modelo está optimizado para CPU.
- Cabe en cualquier GPU de consumo e incluso en dispositivos sin GPU; el límite práctico es la RAM disponible (unos pocos MB).
- Opciones de despliegue: onnxruntime (Python), kokoro-js y ONNX Runtime Web en navegador, y el paquete Python `paradee` del repositorio del autor.
- Latencia y throughput: aproximadamente 18x tiempo real en un hilo de CPU con onnxruntime; 25x en la medición PyTorch del paper; 11,48 de RTFx y 390 ms de TTFA en el benchmark de streaming CPU de la leaderboard.

## Comparativa con modelos similares

| Modelo | Params | Tamano | Velocidad (CPU) | UTMOS | WER | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---:|---|---|
| Paradee-8M-v1.0 | 8,07M | 8,45 MB | 25,0x (PyTorch) / ~18x (ONNX) | 4,41 | 5,7 % | Apache 2.0 | Hugging Face + GitHub |
| Kokoro-82M | 81,8M | 325 MB | 7,6x | 4,52 | 5,7 % | Apache 2.0 | Hugging Face |
| Kokoro-7M-Distill | 7,48M | 30,1 MB | 35,5x | 4,18 | 7,4 % | no disponible | Hugging Face |
| Piper en_US-lessac-medium | 15,7M | 63,2 MB | 15,4x | 4,36 | 8,8 % | no disponible | Hugging Face / GitHub |
| KittenTTS nano 0.8 | 14,0M | 56,8 MB | 10,7x | 4,01 | 5,5 % | no disponible | Hugging Face |

Paradee ofrece el mejor equilibrio entre tamaño, calidad y velocidad de su categoría: es el más pequeño de la comparativa, con un UTMOS solo 0,11 puntos por debajo de su profesor y un WER muy inferior al de Piper y Kokoro-7M-Distill.

## Limitaciones y advertencias

- Solo habla inglés; no soporta otros idiomas.
- Una única voz (`af_heart`); no permite cambiar de hablante sin reentrenar.
- La entrada debe estar fonemizada según misaki; usar otra G2P sin conversión degrada gravemente la inteligibilidad (hasta un 31 % de palabras mal transcritas con eSpeak NG directo).
- Límite de 512 tokens de fonemas por inferencia, incluidos los pads de inicio y fin.
- Riesgo de alucinación acústica en textos fuera de dominio: el modelo se entrenó con 12.000 frases de WikiText-103, por lo que puede fallar en dominios muy alejados (números, siglas, nombres propios).
- No se han publicado análisis de sesgos; al derivar de Kokoro y de una única voz, puede heredar sesgos prosódicos del profesor.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base Kokoro-82M y de los datos de entrenamiento.
- El rendimiento medido en la leaderboard y en el paper corresponde a hardware concreto (Apple M4 Pro); en CPUs más lentas el throughput y la latencia variarán.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.0
- Paper: https://huggingface.co/papers/2610.06817
- Repositorio de código, entrenamiento y paquete Python: https://github.com/sahilmahendrakar/paradee
- Modelo base Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Librería misaki (G2P de Kokoro): https://github.com/hexgrad/misaki
- Open TTS Leaderboard: https://huggingface.co/spaces/hf-audio/open_tts_leaderboard
- Seed TTS Eval: https://github.com/BytedanceSpeech/seed-tts-eval
- CV3 Eval: https://github.com/QwenAudio/CV3-Eval
