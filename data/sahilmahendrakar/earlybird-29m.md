# sahilmahendrakar/Earlybird-29M

## Resumen

Earlybird es un modelo de reconocimiento automático del habla (ASR) en streaming disenado para ejecutarse en dispositivo, desarrollado por sahilmahendrakar y publicado en Hugging Face. Se trata de un fine-tuning de Moonshine Streaming Tiny (Moonshine AI) que predice cada palabra antes de que el hablante termine de pronunciarla, junto con una puntuacion de confianza por palabra. Con 29 millones de parametros y un peso de 16,8 MB en cuantizacion de 4 bits, su propuesta es reducir la latencia de transcripcion por debajo de cero: en audio de audiolibros, la palabra tipica se predice correctamente 90 ms antes de que el hablante la termine, frente a los 90-400 ms de retraso de los modelos de streaming convencionales.

El modelo aborda un problema concreto de los agentes de voz: el tiempo que un reconocedor tarda en emitir una palabra es tiempo que el agente no puede dedicar a buscar, recuperar un registro o planificar una respuesta mientras el usuario aun habla. Earlybird invierte esa dinamica adelantando la salida, a costa de reescrituras posteriores (1,3 cambios por palabra en audiolibros y entre 2 y 6 en habla espontanea o ruidosa).

Es relevante ahora porque demuestra que un modelo por debajo de 100 MB puede igualar o superar en precision a alternativas del mismo orden de tamano y, ademas, ser el unico modelo por debajo de 1 GB que acierta la palabra mediana antes de que termine. Su licencia MIT y su naturaleza on-device lo hacen atractivo para despliegues con requisitos estrictos de privacidad y latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Moonshine Streaming Tiny (fine-tuning) |
| Parametros totales | 29M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (formato personalizado, requiere `earlybird.py`) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | formato de 4 bits personalizado, cargado mediante script propio (`earlybird.py`); no compatible con safetensors/GGUF estandar |
| Tamano del modelo | 16,8 MB |
| Entrada de audio | 16 kHz mono float32, en pasos de 80 ms |
| Vocabulario | 19.007 tokens (subconjunto del vocabulario de Moonshine Tiny) |
| Velocidad de inferencia | ~2x tiempo real en un solo hilo de CPU |

## Arquitectura y entrenamiento

Earlybird parte de Moonshine Streaming Tiny y se ajusta con un objetivo poco habitual: se le presentan audios cortados en puntos aleatorios, incluso a mitad de palabra, y se le pide que escriba todas las palabras escuchadas hasta ese momento, incluida la palabra a medio pronunciar de forma completa, mas una prediccion de las dos palabras siguientes. Las probabilidades brutas de los tokens sirven como confianza por palabra, sin calibracion adicional. El autor recorto el vocabulario de Moonshine Tiny a los 19.007 tokens que usa el habla en ingles, lo que reduce el modelo a 29M parametros con una perdida de precision casi nula, y lo cuantizo a 4 bits.

El entrenamiento utilizo aproximadamente 1.000 horas de habla publica en ingles (LibriSpeech y People's Speech) mas unas 25 horas de habla sintetica. No se documenta en la informacion disponible el uso de RLHF o DPO. La innovacion principal no es arquitectonica sino de formulacion de la tarea: el modelo aprende a emitir palabras parciales y predicciones futuras con confianza asociada, lo que permite mostrar texto antes de que el hablante termine.

## Capacidades

- Reconocimiento de voz en streaming con actualizaciones cada 80 ms de audio.
- Prediccion de palabras antes de que el hablante las termine (latencia mediana negativa en todos los conjuntos de prueba evaluados).
- Puntuacion de confianza por palabra basada en probabilidades brutas del modelo, incluidas las palabras aun en curso.
- Prediccion de las dos palabras siguientes como ayuda a la salida temprana.
- Transcripcion por lotes de ficheros de audio (`transcribe`) y en vivo mediante un flujo (`stream().feed()`).
- Ejecucion en dispositivo: ~2x tiempo real en un solo hilo de CPU.
- No soporta tool calling, function calling, vision, audio de entrada mas alla de ASR, ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles exclusivamente.

## Casos de uso

- Agentes de voz de baja latencia: el agente puede iniciar busquedas, recuperar registros o preparar una respuesta mientras el usuario aun pronuncia la frase, gracias a la prediccion adelantada de palabras con confianza.
- Subtitulado en vivo en dispositivos locales: actualizaciones cada 80 ms y ejecucion a 2x tiempo real en CPU permiten generar subtitulos en un portatil o dispositivo embebido sin conexion.
- Asistentes de dictado en movil o edge: el modelo de 16,8 MB cabe en memoria sin problema y funciona sin GPU, lo que facilita integrarlo en aplicaciones con requisitos de privacidad (el audio no sale del dispositivo).
- Transcripcion de reuniones y llamadas de earnings: los resultados publicados en llamadas de resultados (18,4% WER, -46 ms de latencia) lo hacen util para actas y resumenes en tiempo casi real.
- Interfaces de accesibilidad: la salida temprana con confianza permite anticipar comandos por voz y reducir la sensacion de retardo en usuarios con dificultades motoras.
- Filtrado y enrutamiento de audio en pipelines: la confianza por palabra permite descartar o marcar segmentos dudosos antes de pasarlos a un modelo mayor (por ejemplo, Whisper) para verificacion.
- Prototipado de investigacion en ASR streaming: licencia MIT, codigo y paper disponibles, lo que facilita reproducir y extender el enfoque de prediccion adelantada.

## Benchmarks y rendimiento

Latencia mediana por palabra (ms; negativo = predicha antes de terminar) y word error rate (WER):

| Conjunto de prueba | Earlybird | Moonshine Tiny | Whistle | Whisper base |
|---|---|---|---|---|
| Audiolibros | -90 ms · 2,3% | +270 ms · 3,9% | +400 ms · 3,1% | +90 ms · 2,3% |
| Audiolibros dificiles | -60 ms · 9,7% | +300 ms · 13,2% | +460 ms · 10,1% | +140 ms · 8,7% |
| Charlas TED | -68 ms · 5,4% | +298 ms · 6,8% | +505 ms · 7,3% | +125 ms · 4,8% |
| Discurso publico | -66 ms · 14,5% | +290 ms · 16,7% | +477 ms · 14,2% | +127 ms · 10,5% |
| Llamadas de resultados | -46 ms · 18,4% | +309 ms · 21,6% | +535 ms · 17,8% | +142 ms · 13,3% |
| Habla sintetica | -73 ms · 5,6% | +292 ms · 7,0% | +424 ms · 7,5% | +90 ms · 4,8% |

Precision media en los 8 conjuntos del Hugging Face Open ASR Leaderboard:

| Modelo | Tamano | WER medio (8 conjuntos) |
|---|---|---|
| Whisper base | ~145 MB | 9,7% |
| Whistle | 16,9 MB | 12,2% |
| Earlybird | 16,8 MB | 12,6% |
| Moonshine Tiny | 45 MB | 14,4% |

Calibracion de la confianza: cuando Earlybird declara al menos un 90% de confianza en una palabra aun no terminada, acierta entre el 91% y el 96% de las veces.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el modelo pesa 16,8 MB en 4 bits y se ejecuta en CPU.
- GPU recomendadas: no necesarias; cualquier CPU moderna es suficiente. En GPU, no se documentan requisitos especificos.
- Cabe en cualquier GPU de consumo e incluso en dispositivos embebidos; el limite practico es la memoria del sistema, no la VRAM.
- Despliegue: carga mediante `earlybird.py` (incluido en el repo y en GitHub) con `transformers>=5`, `torch`, `soundfile` y `huggingface_hub`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~2x tiempo real en un solo hilo de CPU; actualizaciones de salida cada 80 ms de audio.

## Comparativa con modelos similares

| Modelo | Parametros / tamano | Latencia mediana (audiolibros) | WER medio Open ASR | Licencia | Notas |
|---|---|---|---|---|---|
| Earlybird | 29M / 16,8 MB | -90 ms | 12,6% | MIT | Salida adelantada con confianza; solo ingles |
| Moonshine Tiny | 45 MB | +270 ms | 14,4% | MIT | Modelo base; streaming convencional |
| Whistle | 16,9 MB | +400 ms | 12,2% | no disponible | Precision similar; sin salida adelantada |
| Whisper base | ~145 MB | +90 ms | 9,7% | MIT | Mas preciso pero ~9x mas grande y con retardo positivo |

## Limitaciones y advertencias

- Precision: Whisper base, 2,5 veces mas grande, comete menos errores en todos los conjuntos salvo en audiolibros, donde empatan. Con ruido de fondo a 10 dB, Earlybird falla el 32% de las palabras frente al 8,9% de Whisper base.
- Reescrituras: mostrar palabras antes implica cambiarlas mas a menudo; 1,3 cambios por palabra en audiolibros y entre 2 y 6 en habla espontanea o ruidosa, lo que exige gestionar la UI y la logica de sustitucion.
- Las predicciones de las dos palabras siguientes aportan poco: con confianza del 50% o mas, solo aproximadamente 1 de cada 7 palabras se acierta antes de terminar; la mayoria de la salida temprana proviene de la propia transcripcion.
- Solo ingles; no hay soporte multilingue.
- Formato de pesos personalizado de 4 bits: no se carga con herramientas estandar (safetensors, GGUF, vLLM, llama.cpp); requiere el script `earlybird.py`.
- Riesgo de alucinacion y sustituciones en audio ruidoso o con habla solapada, agravado por la emision temprana.
- No se documentan sesgos especificos mas alla de los inherentes a los corpus de entrenamiento (LibriSpeech, People's Speech), predominantemente ingles y de dominio publico.
- Licencia MIT permite uso comercial, pero se debe conservar el aviso de copyright de Useful Sensors, Inc. (dba Moonshine) por el modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/sahilmahendrakar/Earlybird-29M
- Write-up del autor: https://sahilmahendrakar.com/writings/earlybird
- Codigo: https://github.com/sahilmahendrakar/earlybird
- Demo: https://huggingface.co/spaces/sahilmahendrakar/earlybird
- Paper: https://arxiv.org/abs/2611.14421
- Modelo base (Moonshine Streaming Tiny): https://huggingface.co/moonshine-ai/moonshine-streaming-tiny
- Repositorio Moonshine: https://github.com/moonshine-ai/moonshine
