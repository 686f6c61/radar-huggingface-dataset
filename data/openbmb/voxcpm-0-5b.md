# openbmb/VoxCPM-0.5B

## Resumen

VoxCPM-0.5B es un sistema de síntesis de voz (text-to-speech) desarrollado por OpenBMB (ModelBest) que se distingue por prescindir de la tokenización discreta del audio. En lugar de convertir la señal de voz en tokens discretos, como hacen la mayoría de los sistemas TTS actuales, VoxCPM modela el habla en un espacio continuo mediante una arquitectura autorregresiva de difusión (LocDiT) construida sobre el backbone del modelo de lenguaje MiniCPM4-0.5B. El resultado es un sistema de 0,5 mil millones de parámetros que genera representaciones acústicas continuas directamente a partir del texto.

El modelo está entrenado sobre un corpus bilingüe (inglés y chino) de aproximadamente 1,8 millones de horas de audio, lo que le permite adaptar la prosodia, el ritmo y la expresividad al contenido del texto. Su segunda capacidad destacada es el clonado de voz zero-shot: con un clip corto de audio de referencia es capaz de replicar no solo el timbre, sino también el acento, la entonación emocional y el ritmo del hablante original.

Es relevante ahora porque demuestra que un modelo compacto (0,5B) puede alcanzar un factor de tiempo real (RTF) de hasta 0,17 en una GPU de consumo como la RTX 4090, abriendo la puerta a aplicaciones de voz en tiempo real desplegables en hardware asequible, y todo ello bajo licencia Apache 2.0, lo que facilita su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Autorregresiva de difusión (LocDiT) sobre backbone MiniCPM4-0.5B, sin tokenizador de audio; decodificación en espacio continuo con modelado jerárquico del lenguaje y restricciones FSQ |
| Parámetros totales | 0,5 mil millones (aproximado, según nombre del modelo) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (librería `voxcpm`); tamaño del repo 2,9 GB |

## Arquitectura y entrenamiento

VoxCPM emplea una arquitectura autorregresiva de difusión de extremo a extremo que genera representaciones continuas del habla directamente desde el texto, evitando la conversión a tokens discretos. El backbone es MiniCPM4-0.5B, sobre el que se construye un modelado jerárquico del lenguaje combinado con restricciones FSQ (Finite Scalar Quantization) para lograr un desacoplamiento implícito entre semántica y acústica. El módulo de difusión se denomina LocDiT y su número de pasos de inferencia es configurable (por defecto 10), lo que permite ajustar el equilibrio entre calidad y velocidad.

El entrenamiento se realizó sobre un corpus bilingüe de aproximadamente 1,8 millones de horas de audio en inglés y chino. La model card no detalla la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. Entre las innovaciones técnicas destacan la generación en espacio continuo sin tokenizador, el control de guiado mediante `cfg_value` (LM guidance sobre LocDiT), la normalización de texto externa (`normalize`) y un mecanismo de reintento automático para casos problemáticos (`retry_badcase`) que detecta y regenera salidas anómalas.

## Capacidades

- Síntesis de voz expresiva y consciente del contexto: infiere prosodia y estilo de habla a partir del contenido del texto.
- Clonado de voz zero-shot: replica timbre, acento, tono emocional, ritmo y cadencia a partir de un clip corto de referencia.
- Generación bilingüe: inglés y chino.
- Síntesis en streaming con factor de tiempo real (RTF) de hasta 0,17 en RTX 4090.
- Interfaz de línea de comandos (`voxcpm`) y API de Python (`VoxCPM.from_pretrained`).
- Procesamiento por lotes (una línea de texto por entrada).
- Herramientas auxiliares integradas: normalización de texto (TN), reducción de ruido (ZipEnhancer) y ASR del prompt de referencia (SenseVoice-Small) en la demo web.
- Control de calidad/velocidad mediante parámetros ajustables (`cfg_value`, `inference_timesteps`).
- No se menciona soporte de tool calling, agentes ni visión; es un modelo exclusivamente TTS.

## Casos de uso

- Atención al cliente automatizada: generación de respuestas de voz naturales y expresivas en inglés o chino para asistentes telefónicos o chatbots con salida de audio, aprovechando el RTF de 0,17 para respuestas en tiempo real.
- Audiolibros y narración: la generación consciente del contexto permite adaptar la prosodia al contenido narrativo, y el clonado de voz posibilita mantener una voz de narrador consistente a lo largo de horas de audio.
- Doblaje y localización: clonado de la voz del actor original para generar versiones en inglés o chino preservando timbre y estilo interpretativo, con procesamiento por lotes para guiones completos.
- Asistentes de voz embebidos: el tamaño compacto (0,5B, repo de 2,9 GB) y el rendimiento en RTX 4090 permiten desplegarlo en estaciones de trabajo con GPU de consumo para prototipos y productos de voz locales.
- Accesibilidad: conversión de texto a voz personalizada clonando la voz del propio usuario para personas que pierden la capacidad de hablar, gracias al clonado zero-shot con un clip corto.
- Creación de contenido y podcasting: generación rápida de locuciones con control de estilo y velocidad mediante `inference_timesteps` y `cfg_value`, con normalización de texto integrada para una pronunciación correcta de números y símbolos.
- Pruebas de concepto e investigación en TTS: al ser Apache 2.0 y estar disponible en PyPI (`pip install voxcpm`), sirve como base para experimentación académica en síntesis continua sin tokenizador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento proporcionado es el factor de tiempo real (RTF) de hasta 0,17 en una NVIDIA RTX 4090 con síntesis en streaming.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el tamaño del repositorio es de 2,9 GB, por lo que en precisión completa se estima un consumo en torno a 3-4 GB de VRAM (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: NVIDIA RTX 4090 (rendimiento medido con RTF 0,17 en streaming). No se especifican otras GPU.
- Cabe en GPU de consumo: sí, según el dato de RTF en RTX 4090; el tamaño reducido del modelo sugiere compatibilidad con GPU de gama media-alta, aunque no hay mediciones publicadas para estas.
- Opciones de despliegue: librería oficial `voxcpm` (PyPI), CLI `voxcpm` / `python -m voxcpm.cli`, demo web (`python app.py`) e integración con Hugging Face Hub. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF de hasta 0,17 en RTX 4090 (streaming), lo que implica síntesis más rápida que el tiempo real en ese hardware. No se proporcionan cifras de throughput (caracteres o segundos de audio por segundo) adicionales.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Clonado de voz | Licencia | Enfoque |
|---|---|---|---|---|---|
| VoxCPM-0.5B | 0,5B | en, zh | Zero-shot | Apache 2.0 | TTS sin tokenizador, difusión autorregresiva |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de datos sobre modelos comparables (parámetros, contexto, benchmarks o licencia) que permitan una comparación rigurosa. Se recomienda consultar la página de proyecto y la demo para evaluar frente a otros sistemas TTS de código abierto.

## Limitaciones y advertencias

- Solo soporta inglés y chino; no hay evidencia de otros idiomas.
- Es un modelo exclusivamente de texto a voz: no realiza razonamiento, código ni otras tareas de lenguaje.
- Riesgo de alucinación acústica: el propio autor incluye un mecanismo de reintento (`retry_badcase`) para casos en los que la generación se descontrola, lo que indica que pueden producirse salidas anómalas o inestables.
- El clonado de voz plantea riesgos éticos y legales (suplantación de identidad, deepfakes); aunque la licencia es Apache 2.0, el uso responsable del clonado no está restringido técnicamente por el modelo.
- La calidad del clonado depende de la calidad del audio de referencia; el autor recomienda usar ZipEnhancer para mejorar los prompts de voz.
- No se detalla la composición del dataset de entrenamiento ni posibles sesgos de acento, género o dialecto dentro del inglés y el chino.
- No hay información publicada sobre cuantizaciones, longitud de contexto ni benchmarks objetivos de calidad (MOS, similitud de hablante).
- El rendimiento medido (RTF 0,17) corresponde a una RTX 4090; en hardware inferior la latencia puede no ser compatible con tiempo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openbmb/VoxCPM-0.5B
- Página del proyecto (GitHub): https://github.com/OpenBMB/VoxCPM/
- Documentación OpenBMB: https://openbmb.cn/docs/
- Demo en vivo (Hugging Face Spaces): https://huggingface.co/spaces/OpenBMB/VoxCPM-Demo
- Página de muestras de audio: https://openbmb.github.io/VoxCPM-demopage/
- Modelo base: https://huggingface.co/openbmb/MiniCPM4-0.5B
