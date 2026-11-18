# cloud0day3/antalia-mini

## Resumen

Antalia-2 Mini es un modelo de síntesis de voz (text-to-speech) para turco, desarrollado por el usuario cloud0day3. Se trata de un modelo deliberadamente pequeño: 7,62 millones de parámetros en total, repartidos entre un modelo acústico de 3,69 M y un vocoder de 3,93 M. Genera audio a 48 kHz y, según su autor, funciona bastante más rápido que el tiempo real en una CPU convencional. Su relevancia radica en la combinación de tamaño mínimo, licencia permisiva (Apache-2.0) y ejecución local sin GPU, lo que lo hace apto para despliegues embebidos, navegador o entornos sin acelerador.

El modelo acepta texto turco en bruto e incorpora un normalizador de texto que convierte números, fechas, horas, importes, siglas, direcciones web y palabras en inglés o marcas a su forma hablada en turco. La voz es sintética y masculina (la voz de Antalia-2), no corresponde a ninguna persona real y el conjunto de entrenamiento no contiene grabaciones de hablantes reales.

La versión documentada es la 1.0.1. La inferencia y los pesos se distribuyen bajo Apache-2.0, mientras que el código y los datos de entrenamiento no son públicos. El modelo se publica como paquete de Python (`pip install antalia-mini`) y cuenta con una demo en el navegador mediante ONNX Runtime Web que ejecuta todo en el dispositivo del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo acústico basado en flow-matching (8 pasos por defecto, CFG 2.0) + vocoder; detalles internos no disponibles |
| Parametros totales | 7,62 M (modelo acústico 3,69 M + vocoder 3,93 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa texto por fragmentos en `stream()`) |
| Tipos de cuantizacion | fp32 por defecto; variante fp16 disponible (`variant="fp16"`, convertida a fp32 al cargar) |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache-2.0 (inferencia y pesos); código y datos de entrenamiento no públicos |
| Formato de pesos | safetensors (pesos ~31 MB); wheel de Python incluido en el repo; demo en ONNX Runtime Web |
| Frecuencia de salida | 48 kHz nativa; remuestreo a 24, 16 y 8 kHz |
| Tamaño del repositorio | 0,1 GB |
| Dependencias | PyTorch, NumPy, safetensors, soundfile, cmudict (no incluida en el paquete; GPL-3.0-or-later en PyPI, datos del diccionario CMU con licencia tipo BSD) |
| Requisitos de Python | 3.10 o superior |

## Arquitectura y entrenamiento

La información pública describe un modelo acústico de 3,69 M de parámetros que emplea flow-matching para generar la representación acústica, seguido de un vocoder de 3,93 M que produce la forma de onda a 48 kHz. El número de pasos de flow-matching es configurable (por defecto 8; con 4 pasos el autor reporta un empeoramiento medido en WER y CER sobre su benchmark interno). También se aplica classifier-free guidance con valor por defecto 2.0. No se detallan la topología interna (número de capas, dimensión oculta, tipo de atención) ni la composición del dataset de entrenamiento.

El autor indica explícitamente que el código y los datos de entrenamiento no son públicos, y que los datos no contienen grabaciones de hablantes reales: la voz es sintética. El paquete incorpora un normalizador de texto propio que resuelve números, fechas, horas, importes, siglas, URLs y términos en inglés o marcas. Además, la versión 1.0.1 aplica por defecto un ecualizador de salida (paso alto a 80 Hz, shelf de -4 dB a 200 Hz, -2,5 dB a 350 Hz, +3 dB a 3,2 kHz, +2 dB por encima de 8 kHz), un de-esser por encima de 5,5 kHz y una ganancia de compensación fija de +1,6 dB con limitador de picos suave. También incluye dos correcciones de lectura activadas por defecto: el troceado de textos largos con un prefijo "ee" recortado cuando el fragmento empieza por "ö" o "ı", y el alargamiento de sonidos dobles.

## Capacidades

- Síntesis de voz en turco a partir de texto en bruto, con una única voz masculina sintética.
- Normalización integrada de números, fechas, horas, importes, siglas, direcciones web y palabras en inglés o marcas.
- Salida a 48 kHz con remuestreo opcional a 24, 16 y 8 kHz para telefonía o pipelines de ASR.
- Generación determinista mediante semilla (`seed`): misma entrada, semilla y ajustes producen el mismo audio.
- Control de velocidad (`speed`, por defecto 0,95), pasos de flow-matching (`steps`) y guía (`cfg`).
- Síntesis por lotes en GPU (`tts.say([...])`).
- Streaming por frases (`tts.stream(long_text)`) con continuidad del estado del filtro entre fragmentos.
- Ejecución en CPU por defecto, con soporte opcional de CUDA y de MPS en Apple Silicon.
- Interfaz de línea de comandos (`antalia-mini "texto" -o salida.wav`).
- Demo en navegador con ONNX Runtime Web, sin servidor, donde el texto no sale del dispositivo.
- No dispone de tool calling, razonamiento multi-paso, visión ni audio de entrada: es exclusivamente TTS.

## Casos de uso

- Asistentes de voz para turco en dispositivos sin GPU: el modelo corre en CPU más rápido que tiempo real con solo 7,62 M de parámetros, lo que permite integrarlo en sistemas empotrados, Raspberry Pi o portátiles modestos sin acelerador.
- Lectura de notificaciones y avisos con datos variables: el normalizador convierte fechas, horas e importes ("Randevunuz 14 Ekim Salı günü saat 15:30'da") sin preprocesado adicional, idóneo para recordatorios de citas, banca o logística.
- Atención telefónica automatizada: la salida a 8 kHz mediante `Antalia(sample_rate=8000)` encaja directamente en pipelines telefónicos y de ASR sin remuestreo externo.
- Síntesis en el navegador con privacidad: la demo con ONNX Runtime Web permite generar voz en el cliente sin enviar el texto a un servidor, útil para aplicaciones con requisitos de privacidad o en entornos con conectividad limitada.
- Locución de textos largos por streaming: `tts.stream()` sintetiza frase a frase y mantiene el estado del filtro, lo que reduce la latencia inicial en audiolibros, podcasts o lectores de pantalla.
- Generación de datos sintéticos para entrenar o evaluar ASR en turco: la reproducibilidad por semilla y las tasas de 8/16/24 kHz facilitan crear corpus controlados de audio y transcripción.
- Pruebas de accesibilidad y prototipado rápido: la instalación vía `pip` y la CLI permiten incorporar voz turca a prototipos en minutos, con licencia Apache-2.0 para uso comercial.

## Benchmarks y rendimiento

El autor reporta únicamente métricas internas de calidad de la síntesis, comparando 8 pasos frente a 4 pasos (3 semillas, con el ecualizador de la versión 1.0.0):

| Configuracion | WER | CER |
|---|---|---|
| 8 pasos (por defecto) | 0,97 % | 0,19 % |
| 4 pasos | 1,17 % | 0,23 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con otros sistemas TTS.

## Requisitos de hardware

- VRAM: no aplica en CPU; en GPU el modelo es mínimo (pesos de ~31 MB, fp32), por lo que cualquier GPU con unos pocos cientos de MB libres es suficiente.
- GPU recomendadas: no se especifican modelos concretos; el autor indica que usa CUDA si está disponible y MPS como opción en Apple Silicon, con la CPU como valor por defecto.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo actual (RTX 4090, RTX 3060, etc.) e incluso en iGPU, dado el tamaño del modelo.
- Despliegue: paquete de Python `antalia-mini` (PyTorch), CLI incluida, wheel en el repositorio de Hugging Face y demo en navegador con ONNX Runtime Web. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un TTS de este tipo).
- Latencia y throughput: el autor afirma que funciona "bastante más rápido que el tiempo real" en una CPU convencional, pero no publica cifras concretas de latencia ni de RTF.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. Como referencia del ecosistema TTS open source de tamano pequeno podrian considerarse Piper o Coqui TTS, pero no se han facilitado sus cifras para una comparacion rigurosa.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Antalia-2 Mini | 7,62 M | No disponible | Turco | Apache-2.0 | Hugging Face + PyPI + demo web |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Una sola voz sintética masculina; no hay control de hablante ni clonación.
- Solo turco: no soporta otros idiomas de forma nativa, aunque normaliza palabras en inglés o marcas a la pronunciación turca.
- El autor documenta errores conocidos al inicio de fragmento con "ö" (sonidos parásitos) y posibles errores similares antes de "ı", mitigados con un prefijo "ee" recortado que puede desactivarse.
- La variante fp16 produce audio "cercano pero no idéntico" al fp32: las duraciones redondeadas pueden cambiar y, en las pruebas del autor, 5 de 50 frases salieron con longitud distinta.
- No se publican datos de sesgos, robustez ante texto ruidoso ni evaluación con hablantes reales; la voz es sintética y el dataset de entrenamiento no es auditable.
- Riesgo de alucinación acústica o pronunciaciones incorrectas en palabras fuera del dominio del normalizador (nombres propios poco frecuentes, jerga, siglas no contempladas).
- Licencia Apache-2.0 para inferencia y pesos, pero el código y los datos de entrenamiento no son públicos, lo que limita la reproducibilidad y la auditoría del modelo.
- La dependencia `cmudict` no está incluida en el paquete y tiene su propia licencia (GPL-3.0-or-later en PyPI; datos del diccionario CMU con licencia tipo BSD), lo que conviene revisar antes de redistribuir.
- El ecualizador y el limitador por defecto alteran la salida; para reproducir exactamente la salida cruda hay que pasar `eq=False`. No hay normalización de sonoridad por utterance.
- No apto para usos que requieran voz humana real, verificación biométrica ni síntesis expresiva con control de emoción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cloud0day3/antalia-mini
- Demo en el navegador (Hugging Face Spaces): https://huggingface.co/spaces/cloud0day3/antalia-mini
- Modelo predecesor Antalia-1: https://huggingface.co/cloud0day3/antalia-1
- Wheel del paquete: https://huggingface.co/cloud0day3/antalia-mini/resolve/main/antalia_mini-1.0.1-py3-none-any.whl
- Muestras de audio: https://huggingface.co/cloud0day3/antalia-mini/resolve/main/samples/01-greeting.wav (y siguientes `02-appointment.wav`, etc.)
- Paquete en PyPI: `pip install antalia-mini` (no se ha proporcionado URL directa)
