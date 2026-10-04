# OpenVoiceOS/wakehubert-wakewords

## Resumen

OpenVoiceOS/wakehubert-wakewords es una coleccion de modelos de deteccion de palabra de activacion (wake word) para ingles, publicada por OpenVoiceOS y entrenada con la herramienta wakeforge. No es un modelo de lenguaje ni un sistema de reconocimiento de voz completo: el repositorio contiene diez cabeceras de clasificacion ONNX, una por palabra clave, que leen caracteristicas acusticas producidas por WakeHuBERT tiny, un extractor de caracteristicas de 0,64 M de parametros destilado de HuBERT-base. Cada cabecera es un clasificador GRU pequeno que puntua la ultima ventana de 1,5 s de audio (24.000 muestras a 16 kHz, 75 fotogramas de caracteristicas) y emite un logit cuya sigmoide es la probabilidad de que la ventana contenga la palabra.

La relevancia practica del paquete es que resuelve el problema del wake word en asistentes de voz autoalojados con un coste computacional minimo: el featurizador es causal, cuantizado a int8 y cuesta aproximadamente 1-2 ms por bloque de 80 ms en un solo nucleo de CPU. Al ser un unico extractor compartido por todas las cabeceras, un dispositivo puede escuchar varias palabras clave con una sola pasada del featurizador, y el despliegue solo requiere numpy, onnxruntime y huggingface_hub, sin dependencia del stack completo de OpenVoiceOS.

El repositorio incluye diez palabras: jarvis, alexa, hey jarvis, hey marvin, home assistant, okay nabu, hello nabu, computer, hey mycroft y wake up. Siete de ellas estan calibradas y llevan umbrales por defecto mas bajos (entre 0,16 y 0,57), mientras que las tres restantes usan el featurizador en float32 y umbrales altos (0,965-0,99). La licencia es Apache-2.0 y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador GRU sobre caracteristicas de WakeHuBERT tiny (extractor destilado de HuBERT-base) |
| Parametros totales | Cabecera GRU: no disponible; featurizador base: 0,64 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en el sentido de contexto textual; ventana de entrada fija de 1,5 s (24.000 muestras a 16 kHz, 75 fotogramas de 128 dimensiones) |
| Tipos de cuantizacion | Featurizador int8 (wakehubert-int8) para jarvis, alexa, hey jarvis, hey marvin, home assistant, okay nabu y hello nabu; float32 (wakehubert) para computer, hey mycroft y wake up |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (un fichero por palabra en models/, mas models.json) |
| Tamano del repositorio | 0,0 GB (por debajo de la resolucion de medida de HuggingFace) |
| Numero de modelos incluidos | 10 cabeceras de palabra clave |
| Cadencia de puntuacion | Un bloque de 1.280 muestras cada 80 ms (recomendado en la model card) |
| Tiempo de bloqueo tras deteccion | 25 bloques (2 s) segun el ejemplo de la model card |
| Metadatos ONNX | wake_word, pretrained_featurizer, default_threshold, window_frames, license, training_data, calibrated, calib_a, calib_b |
| Modelo base | TigreGotico/wakehubert-tiny |

## Arquitectura y entrenamiento

El sistema se divide en dos etapas. La primera es WakeHuBERT tiny, un extractor de caracteristicas de 0,64 M de parametros destilado de HuBERT-base, con salida causal y forma [1, 75, 128] para una ventana de 1,5 s. La segunda es una cabecera GRU especifica por palabra que consume esas caracteristicas y produce un unico logit; la sigmoide de ese logit se interpreta como la probabilidad de que la ventana contenga la palabra de activacion. La model card no detalla el numero de capas, el tamano oculto ni el recuento de parametros de la GRU.

El entrenamiento se realizo con wakeforge, la herramienta del propio autor, sobre un conjunto de datasets sinteticos alojados en el Hub: TigreGotico/synthetic-wakeword-jarvis, synthetic-wakeword-alexa, synthetic-wakeword-ok_nabu, synthetic-wakeword-hey_jarvis, synthetic-wakeword-hey_marvin, synthetic-wakeword-home_assistant, synthetic-wakeword-hello_nabu, synthetic-wakeword-computer y synthetic-wakeword-wake_up, junto con el conjunto negativo TigreGotico/not-wake-words-speech-en para ejemplos que no contienen la palabra. La model card no indica el numero de horas, el numero de tokens ni la composicion exacta de estos conjuntos, ni si se aplicaron etapas de ajuste tipo RLHF o DPO (no tendria sentido en un clasificador de audio, pero no se especifica la receta de optimizacion).

La innovacion tecnica destacable es la calibracion de umbrales: siete modelos incluyen los metadatos calibrated, calib_a y calib_b, y umbrales por defecto sensiblemente mas bajos que los de los modelos sin calibrar, lo que sugiere una recalibracion de la probabilidad para operar en un punto de trabajo mas util. La model card describe el compromiso habitual: bajar el umbral dispara con mas facilidad y produce mas falsos positivos; subirlo omite mas activaciones reales y reduce los falsos positivos. El texto proporcionado se corta justo cuando empieza a detallar el procedimiento en modelos calibrados, por lo que el metodo completo no esta disponible.

## Capacidades

- Clasificacion binaria de audio para deteccion de palabra de activacion en ingles, con salida de probabilidad por ventana.
- Diez palabras clave cubiertas: jarvis, alexa, hey jarvis, hey marvin, home assistant, okay nabu, hello nabu, computer, hey mycroft y wake up.
- Puntuacion continua con ventana deslizante: un bloque de 1.280 muestras (80 ms) con reevaluacion de la ultima ventana de 1,5 s.
- Featurizador causal y compartido: una sola ejecucion del extractor alimenta simultaneamente a cualquier numero de cabeceras de palabra.
- Ajuste de sensibilidad en tiempo de ejecucion mediante el parametro threshold.
- Metadatos autodescriptivos en el propio ONNX (palabra, featurizador requerido, umbral por defecto, tamano de ventana, licencia y datos de entrenamiento), de modo que el consumidor no necesita ficheros de configuracion externos.
- Integracion directa con OpenVoiceOS mediante el plugin ovos-ww-plugin-wakeforge.
- No ofrece: reconocimiento de voz (ASR), generacion de texto, razonamiento, codigo, matematicas, vision, audio generativo, tool calling ni razonamiento multi-paso.
- No se declara soporte multilingue: solo ingles.
- No se declaran capacidades de deteccion de hablante, diarizacion ni verificacion de voz.

## Casos de uso

- Activacion de asistentes de voz autoalojados: instalar ovos-ww-plugin-wakeforge y declarar la palabra en mycroft.conf permite al listener de OpenVoiceOS despertar con hey_jarvis, alexa u okay nabu sin enviar audio a terceros; el plugin ya incluye ambos featurizadores, de modo que no hay descargas adicionales en tiempo de ejecucion.
- Deteccion simultanea de varias palabras en un mismo dispositivo: como el featurizador es unico y causal, se ejecuta una vez por bloque y las caracteristicas resultantes se pasan a cada cabecera; un altavoz domestico puede escuchar a la vez "computer", "home assistant" y "hey marvin" con un coste marginal por palabra adicional muy bajo.
- Asistentes de domotica integrados con Home Assistant: los modelos home_assistant, okay_nabu y hello_nabu estan entrenados especificamente sobre esos disparadores sinteticos y permiten construir un frontal de voz local para automatizaciones del hogar sin depender de la nube.
- Despliegue en hardware embebido sin GPU: con un coste de 1-2 ms por bloque de 80 ms en un nucleo para el featurizador int8 y una huella de repositorio inferior a 0,1 GB, el sistema es viable en Raspberry Pi y en equipos de placa unica con onnxruntime, dejando la CPU libre para el resto del asistente.
- Filtrado previo a un motor ASR: colocar el detector delante de un reconocedor reduce el consumo y el coste por minuto al enviar al ASR unicamente las ventanas posteriores a una activacion, con un tiempo de bloqueo configurable (2 s en el ejemplo de la model card) para evitar disparos repetidos.
- Investigacion en keyword spotting: el repositorio sirve como linea base reproducible para estudiar el efecto de la cuantizacion int8 del featurizador, de la calibracion del umbral y del tamano de ventana sobre la tasa de falsos positivos y falsos negativos.
- Prototipos con microfono en Python: el ejemplo de la model card combina sounddevice y onnxruntime en menos de treinta lineas para obtener una puntuacion y un booleano de deteccion por bloque, util para validar rapidamente una palabra nueva antes de integrarla en un producto.
- Extension a palabras personalizadas: dado que el paquete se genero con wakeforge sobre datasets sinteticos, el mismo flujo permite entrenar cabeceras nuevas sobre el featurizador WakeHuBERT tiny existente, reutilizando el coste de inferencia ya medido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que models.json incluye "measured results" por modelo, pero los valores concretos no forman parte de la informacion proporcionada. Los unicos datos de rendimiento disponibles son de coste computacional y no de calidad: aproximadamente 1-2 ms por bloque de 80 ms en un nucleo de CPU para el featurizador int8, con reevaluacion de una ventana de 1,5 s en cada bloque. No se proporcionan cifras de tasa de falsos positivos por hora, tasa de falsos negativos, accuracy ni comparaciones con otros detectores.

## Requisitos de hardware

- VRAM: no aplica; el sistema esta disenado para ejecucion en CPU mediante onnxruntime.
- GPU recomendadas: no aplica ni es necesaria; no se documenta aceleracion por GPU para este modelo.
- Compatibilidad con GPU de consumo: irrelevante, ya que el modelo funciona en CPU con un coste de milisegundos por bloque.
- CPU: un unico nucleo es suficiente para el featurizador int8 (1-2 ms por bloque de 80 ms frente a los 80 ms de audio que representa ese bloque, es decir, una fraccion muy pequena del tiempo real disponible).
- Memoria: el repositorio completo mide 0,0 GB segun HuggingFace, de modo que la huella en disco y en RAM es minima; los pesos de las cabeceras y del featurizador caben holgadamente en cualquier dispositivo.
- Despliegue: onnxruntime (Python, C++ u otros enlaces disponibles), con dependencias minimas numpy, onnxruntime y huggingface_hub; en el ecosistema OpenVoiceOS, el plugin ovos-ww-plugin-wakeforge; el ejemplo de la model card usa sounddevice para captura desde microfono.
- Latencia y throughput: la model card recomienda puntuar cada 80 ms con bloques de 1.280 muestras y aplicar un bloqueo de 25 bloques (2 s) tras cada deteccion; el coste por bloque del featurizador int8 se situa en 1-2 ms en un nucleo.
- Flujo de memoria y buffers: el ejemplo mantiene un buffer circular de 24.000 muestras float32 a 16 kHz; no se documentan requisitos adicionales.

## Comparativa con modelos similares

| Sistema | Tipo | Parametros | Licencia | Despliegue | Datos de rendimiento |
|---|---|---|---|---|---|
| OpenVoiceOS/wakehubert-wakewords | Cabeceras ONNX sobre featurizador destilado de HuBERT | Featurizador de 0,64 M; cabecera GRU no disponible | apache-2.0 | onnxruntime en CPU, plugin nativo para OpenVoiceOS | Coste de 1-2 ms por bloque de 80 ms; sin cifras de precision en la informacion disponible |
| openWakeWord | Detector de palabra de activacion de codigo abierto | no disponible | no disponible | Inferencia en CPU (ONNX/TFLite) | no disponible |
| Picovoice Porcupine | Detector de palabra de activacion comercial, multiplataforma | no disponible | Propietaria, requiere clave de acceso | SDK propio para multiples plataformas | no disponible |
| Snowboy | Detector historico de palabra de activacion (proyecto descontinuado) | no disponible | no disponible | Binarios y SDK propio | no disponible |

La informacion proporcionada no incluye especificaciones ni resultados de estos sistemas alternativos, por lo que las celdas marcadas como no disponibles no pueden completarse sin inventar datos. La diferencia estructural verificable de wakehubert-wakewords frente a las alternativas de la tabla es la separacion explicita entre un featurizador causal compartido y cabeceras independientes por palabra, junto con metadatos autodescriptivos y umbrales calibrados publicados en el propio fichero ONNX.

## Limitaciones y advertencias

- Cobertura linguistica limitada al ingles; no se declara soporte para otras lenguas ni para acentos fuera de la distribucion de los datasets sinteticos.
- Los datos de entrenamiento son sinteticos y generados por wakeforge; el comportamiento sobre voces reales, ruido de fondo, reverberacion o microfonos de baja calidad puede degradarse, y no se publican metricas que lo cuantifiquen.
- Riesgo de falsos positivos: la propia model card advierte de que bajar el umbral aumenta las activaciones espurias. En un asistente siempre activo, un umbral mal elegido puede provocar activaciones continuas que se envien al ASR.
- Riesgo de falsos negativos: subir el umbral para reducir falsos positivos incrementa los wake words no detectados, con la consiguiente perdida de interacciones.
- Sensibilidad a la calibracion: siete modelos estan calibrados y tres no, con umbrales por defecto muy distintos (por ejemplo 0,16 frente a 0,99); copiar un umbral de un modelo a otro no es una practica fiable.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 3 de octubre de 2026: se trata de una publicacion reciente y sin validacion externa publica.
- Sin resultados de benchmarks publicados: no es posible estimar de antemano la tasa de falsos positivos por hora en un despliegue real.
- La model card esta truncada en la informacion proporcionada, justo en la seccion sobre eleccion de umbral en modelos calibrados; el procedimiento completo con calib_a y calib_b no esta disponible.
- Dependencia de dos ficheros ONNX en tiempo de ejecucion (featurizador y cabecera); cargar una cabecera con un featurizador distinto al declarado en sus metadatos (pretrained_featurizer) produciria resultados invalidos.
- El repositorio no incluye cifras de consumo energetico ni analisis de sesgo por genero, edad o acento; tampoco advertencias sobre grabacion de audio, que quedan del lado del integrador.
- Licencia Apache-2.0, que permite uso comercial, modificacion y redistribucion siempre que se conserve el aviso de licencia; aun asi, conviene verificar las licencias de los datasets sinteticos citados si se reentrena o redistribuye el modelo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/OpenVoiceOS/wakehubert-wakewords
- Modelo base (featurizador): https://huggingface.co/TigreGotico/wakehubert-tiny
- Version cuantizada del featurizador: https://huggingface.co/TigreGotico/wakehubert-tiny (referencia base_model:quantized del repositorio)
- Herramienta de entrenamiento wakeforge: https://github.com/TigreGotico/wakeforge
- Plugin para OpenVoiceOS: https://github.com/OpenVoiceOS/ovos-ww-plugin-wakeforge
- Sitio de OpenVoiceOS: https://openvoiceos.org
- Dataset sintetico de ejemplo (jarvis): https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-jarvis
- Dataset sintetico de ejemplo (alexa): https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-alexa
- Dataset sintetico de ejemplo (ok nabu): https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-ok_nabu
- Dataset sintetico de ejemplo (hey jarvis): https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_jarvis
- Dataset sintetico de ejemplo (hey marvin): https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hey_marvin
- Dataset sintetico de ejemplo (home assistant): https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-home_assistant
- Dataset sintetico de ejemplo (hello nabu): https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-hello_nabu
- Dataset sintetico de ejemplo (computer): https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-computer
- Dataset sintetico de ejemplo (wake up): https://huggingface.co/datasets/TigreGotico/synthetic-wakeword-wake_up
- Dataset negativo de habla en ingles: https://huggingface.co/datasets/TigreGotico/not-wake-words-speech-en

Nota: la busqueda web realizada no devolvio resultados relacionados con este modelo; los enlaces disponibles proceden unicamente de la informacion de HuggingFace.
