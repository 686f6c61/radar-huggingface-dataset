# joseyarashio/duckmind-name-kws-danhuang

## Resumen

duckmind-name-kws-danhuang es un detector de palabra clave (keyword spotting, KWS) en streaming desarrollado por joseyarashio como componente del proyecto duckmind, una pila de cognición no oficial para robots tipo Microduck. El modelo se activa cuando alguien pronuncia el nombre «蛋黃» (dan4 huang2) en mandarín, con acentos de Taiwán y de China continental. No es un modelo de lenguaje: es un clasificador de audio frame a frame que emite un logit por cada trama de 10 ms indicando si el nombre se acaba de oír.

Técnicamente es una red convolucional temporal causal (NameTCN) de 635.937 parámetros, con 12 bloques de convolución 1-D depthwise-separable, anchura oculta 224 y un campo receptivo de 181 tramas (1,8 s). Consume audio mono a 16 kHz convertido a tramas log-mel de 40 bandas (ventana de 25 ms, salto de 10 ms, 20-7600 Hz) y mantiene una caché de forma `[1, 224, 180]` entre fragmentos, lo que permite inferencia en streaming por trozos con resultados equivalentes al procesamiento de la señal completa.

Su relevancia actual es doble. Por un lado, es un ejemplo poco habitual de model card honesta: el autor publica el modelo declarando explícitamente que **no superó su propia aceptación** (75,0% de detección a 10 dB SNR frente al 95% exigido, y 65,1% a 5 dB frente al 90%), y que por ello no está integrado en el simulador de duckmind. Por otro, documenta con detalle un pipeline completo de KWS de bajo coste (entrenamiento con voces sintéticas, minería de negativos duros, cabecera CTC auxiliar, cuantización int8) sobre un dataset público (espnet/yodas2), lo que lo convierte en un punto de partida reproducible para investigación en wake-words en entornos con ruido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | NameTCN: red convolucional temporal causal, 12 bloques depthwise-separable 1-D (3 stacks × 4 capas, kernel 5, dilatación 1-8), anchura oculta 224 |
| Parámetros totales | 635.937 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | campo receptivo de 181 tramas (1,8 s); caché de streaming `[1, 224, 180]` |
| Tipos de cuantización | int8 dinámica (evaluada, no publicada: más lenta en Arm y con divergencia en 6 de 300 positivos); solo se publica fp32 |
| Idiomas soportados | chino mandarín (acentos de Taiwán y China continental) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (fp32, 2,55 MB); sidecar `name_kws.json` con la regla de decisión |
| Entrada | audio mono 16 kHz, log-mel de 40 bandas (25 ms / 10 ms hop, 20-7600 Hz) |
| Salida | un logit por trama; umbral 0,9677 con suavizado de 12 tramas y refractario de 1,5 s |
| Dataset de entrenamiento | espnet/yodas2 (etiquetado); positivos sintéticos generados con Qwen3-TTS 12Hz 1.7B VoiceDesign |
| Runtime | ONNX Runtime, solo CPU |

## Arquitectura y entrenamiento

El modelo es una TCN causal con convoluciones separables en profundidad. Doce bloques organizados en tres stacks de cuatro capas, con kernel 5 y dilataciones de 1 a 8, generan un campo receptivo de 181 tramas. La causalidad estricta y la caché inter-fragmento permiten que la inferencia en streaming coincida con el procesamiento de la señal completa: la diferencia máxima entre ONNX y PyTorch es de 9,5e-6. El coste medido es de 0,38 ms por cada 20 ms de audio en un núcleo de Apple Silicon y 0,37 ms en un núcleo Arm de servidor, con ONNX Runtime y un solo hilo. No se midió en Raspberry Pi Zero 2 W; la estimación del autor es aproximadamente medio núcleo.

El entrenamiento se realizó fuera del dispositivo, en una GPU, por rondas con minería de negativos duros sobre ventanas de 3 s: el logit máximo antes del nombre debe permanecer bajo y el máximo a partir de 250 ms después del nombre debe ser alto. Se usó una cabecera CTC auxiliar de iniciales/finales pinyin más tono, entrenada sobre 167.753 enunciados reales transcritos, que se descartó en la exportación y que aproximadamente duplicó la detección con la misma tasa de falsos positivos. La aumentación incluyó salas simuladas por método de fuente-imagen (micrófono a 15-30 cm del suelo, hablante a 0,4-1,7 m de altura), respuestas de impulso reales, hablantes de fondo, ruido y música a −1…28 dB SNR, ganancias de −40…−3 dBFS, velocidades de 0,85-1,18 y SpecAugment, en bf16. El checkpoint publicado es `m3`, ronda 4, inicializado desde `m2b` ronda 5.

Un punto crítico: **todos los positivos de entrenamiento son sintéticos**, generados con Qwen3-TTS VoiceDesign (aproximadamente un 40% de voces infantiles de 3 a 9 años) y voces clonadas a partir de hablantes de referencia de Common Voice. No se grabó ninguna voz real de un familiar diciendo «蛋黃». Además, el pipeline de datos y el entrenador de la v4 no están publicados, por lo que esta ejecución exacta no es reproducible con el código público actual; solo lo están el detector de runtime y una receta anterior (`duckmind.namekws.synth`/`train`).

## Capacidades

- Detección de palabra clave en streaming: emite un logit por trama de 10 ms y dispara cuando el nombre «蛋黃» se acaba de pronunciar, con una latencia de fin de nombre a disparo de p50 −15 ms, p95 175 ms y máximo 295 ms.
- Procesamiento causal por fragmentos con caché de estado, equivalente al procesamiento de la señal completa (diferencia máxima ONNX vs PyTorch de 9,5e-6).
- Robustez parcial frente a ruido y distancia: entrenado con salas simuladas, respuestas de impulso reales, hablantes de fondo, música y ruido a −1…28 dB SNR.
- Discriminación de palabras confundibles: 蛋糕 (pastel), 但是 (pero), 黃色 (amarillo), 蛋 y 旦, con un peor caso del 1,8% (旦, en limpio).
- Control de falsos positivos mediante umbral, suavizado de 12 tramas y tiempo refractario de 1,5 s configurables en el sidecar.
- Inferencia solo CPU con ONNX Runtime, apta para dispositivos embebidos.
- No soporta tool calling, function calling, agentes, visión, audio de entrada más allá de la clasificación ni generación de texto. Es exclusivamente un clasificador binario por trama.

## Casos de uso

- Investigación en keyword spotting de bajo coste: sirve como línea base reproducible y como ejemplo documentado de evaluación con puertas de aceptación congeladas antes del entrenamiento, útil para comparar técnicas de aumentación y minería de negativos.
- Punto de partida para reentrenamiento con voces reales: al estar bajo Apache 2.0 y en ONNX, un equipo puede sustituir los positivos sintéticos por grabaciones propias del hablante objetivo y afinar el modelo para su dominio.
- Wake-word en robótica de sobremesa con restricciones de cómputo: el coste de 0,37-0,38 ms por 20 ms de audio en un núcleo permite integrarlo en un robot tipo Microduck sin GPU, siempre que se acepte su tasa de detección actual.
- Detección de nombre en asistentes domésticos experimentales: la ventana de 1,8 s y la latencia p95 de 175 ms son compatibles con interacciones conversacionales, aunque la tasa de acierto en ruido limita su uso en producción.
- Filtrado previo en pipelines de audio: puede actuar como primera etapa que activa un reconocedor de voz completo solo cuando se detecta el nombre, reduciendo el consumo en dispositivos siempre encendidos.
- Evaluación de robustness en condiciones acústicas adversas: el modelo card publica resultados desglosados por tipo de ruido, distancia, frase y fuente, lo que permite usarlo como banco de pruebas para metodologías de evaluación de KWS.

## Benchmarks y rendimiento

| Puerta de aceptación (congelada antes del entrenamiento) | Requerido | Medido | ¿Pasa? |
|---|---|---|---|
| Detección a 10 dB SNR | ≥ 95% | 75,0% | no |
| Detección a 5 dB SNR | ≥ 90% | 65,1% | no |
| Falsos positivos en habla real reservada | ≤ 1 por 24 h | 4 en 130,45 h = 0,74 por 24 h (cota superior Poisson 95% ≈ 1,7) | sí (estimación puntual) |
| Palabras confundibles (蛋糕 / 但是 / 黃色 / 蛋 / 旦) | cada una ≤ 5% | peor caso 1,8% (旦, limpio) | sí |
| Tamaño | ≤ 250 k parámetros o ≤ 1 MB int8 | 635.937 parámetros; int8 0,72 MB | sí (cláusula int8) |
| Latencia, fin de nombre → disparo | ≤ 300 ms | p50 −15 ms, p95 175 ms, máx. 295 ms | sí (al límite) |
| Streaming con caché | igual a clip completo | diferencia máxima ONNX vs PyTorch 9,5e-6 | sí |

Compromiso umbral / detección (mismos datos de test, no usados para elegir el umbral):

| Umbral | Detección 10 dB | Detección 5 dB | Falsos positivos en habla real por 24 h |
|---|---|---|---|
| 0,50 | 95,9% | 92,8% | 27,6 |
| 0,80 | 90,8% | 84,4% | 4,97 |
| 0,90 | 85,4% | 78,3% | 2,21 |
| 0,95 | 79,5% | 70,7% | 1,10 |
| 0,98 | 69,0% | 59,1% | 0,55 |

Rendimiento por contexto a 10 dB: 89% para «好乖蛋黃», 78% para «蛋黃» solo, 65% para «蛋黃過來» y 67% para «蛋黃你好». Con televisión de fondo: 71% a 10 dB y 56% a 5 dB. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a un modelo de clasificación de audio.

## Requisitos de hardware

- VRAM: no aplica; el modelo corre en CPU. El fichero ONNX fp32 ocupa 2,55 MB.
- GPU: no necesaria. El autor solo documenta ejecución en CPU con ONNX Runtime.
- Cabe en cualquier GPU de consumo y en dispositivos embebidos, pero no se han publicado mediciones en RTX 4090, A100, H100 ni similares.
- Despliegue: ONNX Runtime (CPU, un hilo) mediante `duckmind.namekws.detector.NameDetector`, que lee `name_kws.onnx` y su sidecar `name_kws.json` (formato 2). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia: 0,38 ms por 20 ms de audio en un núcleo de Apple Silicon y 0,37 ms en un núcleo Arm de servidor. Latencia de disparo p50 −15 ms, p95 175 ms, máximo 295 ms.
- Raspberry Pi Zero 2 W: no medido; estimación del autor de aproximadamente medio núcleo.
- Cuantización int8 dinámica: 0,72 MB, más lenta en Arm y con divergencia en 6 de 300 positivos respecto a fp32; por eso solo se publica fp32.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables en la información proporcionada para establecer una comparación cuantitativa con otros detectores de wake-word (por ejemplo, Porcupine, Snowboy, openWakeWord o modelos KWS de ESPnet). La tabla siguiente recoge únicamente los datos disponibles de este modelo frente a alternativas de la misma categoría, indicando los campos no disponibles.

| Modelo | Parámetros | Contexto / ventana | Licencia | Formato | Datos de rendimiento |
|---|---|---|---|---|---|
| duckmind-name-kws-danhuang | 635.937 | 1,8 s (181 tramas) | Apache 2.0 | ONNX | 75,0% a 10 dB; 65,1% a 5 dB |
| openWakeWord | no disponible | no disponible | no disponible | no disponible | no disponible |
| Porcupine (Picovoice) | no disponible | no disponible | propietaria | no disponible | no disponible |
| Modelos KWS de ESPnet | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No supera su aceptación: 75,0% de detección a 10 dB SNR (requerido ≥ 95%) y 65,1% a 5 dB (requerido ≥ 90%). El autor no lo integra en el simulador de duckmind y la «oreja» del nombre está desactivada por defecto.
- Todos los positivos de entrenamiento son sintéticos (Qwen3-TTS y voces clonadas de adultos de Common Voice). No hay ninguna grabación real de una persona diciendo «蛋黃», y las voces infantiles reales no están representadas en las voces clonadas.
- Debilidad cuando el nombre va seguido de más palabras: 65% para «蛋黃過來» y 67% para «蛋黃你好» a 10 dB, frente al 89% de «好乖蛋黃».
- Debilidad con televisión de fondo: 71% a 10 dB y 56% a 5 dB.
- En una comprobación informal con 13 frases sintetizadas localmente con otro motor TTS (solo evaluación, nunca entrenamiento), se perdió «蛋黃，過來這裡。».
- La cota superior de Poisson para falsos positivos (≈ 1,7 por 24 h) supera el límite de 1 por 24 h, aunque la estimación puntual (0,74) lo cumpla; el margen es escaso.
- El pipeline de datos y el entrenador de la v4 no están publicados, por lo que esta ejecución exacta no es reproducible con el código público actual.
- No debe usarse para seguridad, control de acceso ni funciones críticas. El propio autor lo restringe a investigación y reentrenamiento.
- Licencia Apache 2.0: permite uso comercial con atribución, pero las condiciones de los datos de entrenamiento (Qwen3-TTS, Common Voice, espnet/yodas2) deben verificarse por separado antes de un despliegue comercial.
- Solo soporta mandarín (Taiwán y China continental); no hay soporte multilingüe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joseyarashio/duckmind-name-kws-danhuang
- Repositorio duckmind: https://github.com/joseyarashio/duckmind
- Detector de runtime: https://github.com/joseyarashio/duckmind/blob/main/src/duckmind/namekws/detector.py
- Dataset espnet/yodas2: https://huggingface.co/datasets/espnet/yodas2
- Resultados completos de la puerta de aceptación: `evaluation/gate.json` (en el repositorio del modelo)
- Configuración y procedencia: `name_kws.json` (en el repositorio del modelo)
