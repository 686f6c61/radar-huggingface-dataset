# mohddanish305/tiny-intent-v3-onnx

## Resumen

Tiny Intent v3 es un clasificador de intenciones de muy pequeno tamano (1,14 millones de parametros) disenado para ejecutarse integramente en el dispositivo (on-device) en telefonos moviles. Lo desarrolla el autor independiente Mohd Danish y su funcion es recibir una unica frase de texto —procedente del reconocimiento automatico de voz del telefono— y devolver una de 16 intenciones posibles (por ejemplo, `set_alarm`, `answer_call` u `open_app`) junto con una puntuacion de confianza. El modelo solo decide la intencion; la extraccion de parametros concretos (hora, nombre del contacto, ciudad, duracion) se realiza con reglas y expresiones regulares en el codigo de la aplicacion.

Tecnicamente es una red neuronal convolucional (CNN) minima entrenada desde cero, no un transformer, y se distribuye en formato ONNX cuantizado a int8 con un peso de solo 1,10 MB. Soporta hindi en escritura devanagari, hinglish en alfabeto latino e ingles, y esta pensado para funcionar completamente sin conexion. Su relevancia radica en que demuestra que tareas de clasificacion de comandos de voz pueden resolverse de forma local, con latencia minima y sin coste de inferencia en la nube, reservando un modelo en la nube (Gemini o Groq) unicamente como respaldo cuando la confianza es baja.

El modelo forma parte de un ecosistema mas amplio del mismo autor: un modelo de reconocimiento de voz (Xora Whisper AI, basado en Whisper-tiny ajustado para hindi), un conjunto de datos publico y un paquete de Flutter (`flutter_voice_intent`) para integrarlo en aplicaciones moviles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN pequena (tiny CNN), entrenada desde cero |
| Parametros totales | 1.143.824 (1,14 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32 tokens (max_len fijo por frase) |
| Tipos de cuantizacion | int8 (ONNX cuantizado) |
| Idiomas soportados | Hindi (devanagari), hinglish (romano), ingles |
| Licencia | MIT |
| Formato de pesos | ONNX (`intent_model_int8.onnx`, 1,10 MB) |

## Arquitectura y entrenamiento

El modelo es una red neuronal convolucional de una dimension de muy baja capacidad, con 1.143.824 parametros, entrenada desde cero. El texto se tokeniza a nivel de palabra con un vocabulario de 608 palabras: se pasa a minusculas, se conservan caracteres devanagari y `[a-z0-9]`, se trunca a 32 tokens y se rellena con `<pad>=0`; las palabras fuera de vocabulario se mapean a `<unk>=1`. La entrada se procesa como una secuencia de identificadores enteros y la salida es un vector de logits sobre 16 clases, del que se obtiene la distribucion de probabilidad mediante softmax.

El entrenamiento se realizo en CPU de Google Colab el 26 de noviembre de 2026, durante 20 epocas y en aproximadamente 208 segundos. Los datos de entrenamiento de la version v3 constan de 2.629 filas de entrenamiento, 228 de validacion y 476 de test, con cero solapamiento entre entrenamiento y test y cero duplicados. El conjunto combina plantillas con nombres, horas, ciudades y aplicaciones aleatorias, frases escritas a mano y transcripciones ruidosas de Whisper. Cabe destacar que 230 frases escritas a mano se incluyen unicamente en el conjunto de test y nunca aparecen en entrenamiento, lo que hace que la metrica reportada sea mas honesta. No se documenta uso de RLHF ni DPO, algo coherente con un clasificador supervisado de este tamano.

## Capacidades

- Clasificacion de intenciones de comandos de voz en 16 clases: seis de llamadas (`answer_call`, `reject_call`, `end_call`, `mute_call`, `hold_call`, `make_call`), cinco de reloj (`set_alarm`, `cancel_alarm`, `set_timer`, `start_stopwatch`, `stop_stopwatch`), tres de informacion (`get_time`, `get_date`, `get_weather`), una de aplicaciones (`open_app`) y una de reserva (`unknown`).
- Devuelve una puntuacion de confianza por intencion, lo que permite aplicar umbrales (el autor recomienda derivar a la nube por debajo de 0,70).
- Multilingue en tres variantes: hindi en devanagari, hinglish en alfabeto romano e ingles.
- Inferencia completamente offline y en el dispositivo, sin dependencia de red.
- No realiza extraccion de parametros (slots): horas, contactos, aplicaciones o ciudades se extraen con reglas externas.
- No soporta tool calling ni function calling, ni razonamiento multi-paso, ni generacion de texto libre, ni vision ni audio.

## Casos de uso

- Asistente de voz movil offline: el modelo recibe la transcripcion del reconocimiento de voz y decide la intencion para disparar acciones del sistema (fijar alarma, abrir aplicacion, consultar la hora) sin enviar audio ni texto a un servidor, lo que preserva la privacidad y elimina el coste de inferencia en la nube.
- Control de llamadas manos libres: con seis intenciones dedicadas (`answer_call`, `reject_call`, `end_call`, `mute_call`, `hold_call`, `make_call`) permite gestionar llamadas por voz en Android, util en conduccion o con las manos ocupadas (en iOS no es posible por restricciones del sistema).
- Gestion de alarmas y temporizadores: las intenciones `set_alarm`, `cancel_alarm`, `set_timer`, `start_stopwatch` y `stop_stopwatch` cubren el flujo completo de reloj, con el slot de hora extraido por reglas en la app.
- Enrutado con respaldo a la nube: gracias a la confianza por clase, la aplicacion puede resolver localmente comandos claros y derivar a Gemini o Groq cuando la confianza cae por debajo de 0,70 o la intencion es `unknown`, combinando latencia baja con cobertura de consultas abiertas.
- Integracion en aplicaciones Flutter multiplataforma: el paquete `flutter_voice_intent` v0.2.0 permite incrustar el mismo archivo ONNX en Android, iOS, escritorio o web, reutilizando el modelo sin reentrenamiento.
- Prototipado y docencia de clasificacion de texto: su tamano (1,10 MB), su licencia MIT y su entrenamiento reproducible en CPU de Colab lo hacen idoneo para ensenar pipelines completos de tokenizacion, exportacion a ONNX y cuantizacion int8.
- Procesamiento por lotes en servidores modestos: al ejecutarse con `onnxruntime` en CPU (`CPUExecutionProvider`), puede clasificar grandes volumenes de transcripciones en hardware sin GPU para analitica de comandos o etiquetado de datos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision en test (PyTorch) | 96,2 % (476 filas) |
| Precision en test (ONNX) | 96,2 % (identica a PyTorch) |
| Tamano ONNX int8 | 1,10 MB |
| Vocabulario | 608 palabras |
| F1 macro | 0,965 |
| Epocas / tiempo de entrenamiento | 20 epocas / ~208 s en CPU de Colab |

F1 por intencion en test limpio: `mute_call` 1,000, `hold_call` 1,000, `set_alarm` 1,000, `cancel_alarm` 0,981, `get_date` 0,958, `unknown` 0,935, `open_app` 0,925, `reject_call` 0,921, `end_call` 0,912. Evolucion de versiones: v1 88,4 %, v2 95,4 %, v3 96,2 %. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el modelo pesa 1,10 MB en int8 y opera en CPU.
- GPU recomendadas: no aplica; el autor lo entreno y ejecuta en CPU (Google Colab CPU y `CPUExecutionProvider`).
- Cabe en cualquier GPU de consumo e incluso en telefonos moviles; no necesita GPU dedicada.
- Opciones de despliegue: `onnxruntime` (Python, Android, iOS, React), paquete de Flutter `flutter_voice_intent` v0.2.0. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no se publican cifras concretas; por el tamano (1,14 M de parametros, secuencia de 32 tokens) se espera inferencia en el orden de milisegundos en CPU movil, aunque el dato no esta confirmado en la informacion disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados de otros clasificadores de intenciones comparables ni datos de referencia cruzada. Como referencia interna del propio autor, la version anterior v2 alcanzo un 95,4 % frente al 96,2 % de v3, y el modelo complementario Xora Whisper AI cubre la fase de reconocimiento de voz, pero no son alternativas equivalentes de clasificacion de intenciones.

## Limitaciones y advertencias

- Familias de intenciones facilmente confundibles por compartir vocabulario: llamadas (answer/reject/end/make/mute/hold), alarmas (set/cancel) y temporizador frente a cronometro.
- No soporta conversacion abierta ni preguntas generales; para ello debe usarse el respaldo en la nube recomendado por el autor.
- La extraccion de parametros (slots) no la realiza el modelo, sino reglas en la aplicacion, lo que traslada parte de la robustez al codigo externo.
- Los comandos muy cortos y los errores tipograficos procedentes del reconocimiento de voz pueden degradar la clasificacion.
- Vocabulario limitado a 608 palabras y truncamiento a 32 tokens: frases fuera de ese rango o con terminos no vistos se mapean a `<unk>`.
- En iOS las acciones de control de llamadas no estan permitidas para aplicaciones de terceros, por lo que esos casos de uso quedan restringidos a Android.
- Licencia MIT, que permite uso comercial con atribucion de copyright (Copyright 2026 Mohd Danish); conviene revisar los terminos de los modelos complementarios y del dataset por separado.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea con alta confianza en frases ambiguas; se recomienda el umbral de 0,70 propuesto por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mohddanish305/tiny-intent-v3-onnx
- Modelo de voz complementario (Xora Whisper AI): https://huggingface.co/mohddanish305/xora-whisper-ai
- Dataset: https://huggingface.co/datasets/mohddanish305/voice-command-intents-hindi-hinglish-english
- Paquete de Flutter: https://pub.dev/packages/flutter_voice_intent
- Codigo en GitHub: el enlace figura como marcador `GITHUB_REPO_URL_HERE` en la model card, por lo que la URL real no esta disponible.
