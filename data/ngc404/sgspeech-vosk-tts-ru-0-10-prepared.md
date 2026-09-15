# NGC404/sgspeech-vosk-tts-ru-0.10-prepared

## Resumen

`sgspeech-vosk-tts-ru-0.10-prepared` es una version preprocesada del grafo sintetizador del modelo de sintesis de voz `vosk-model-tts-ru-0.10-multi` de AlphaCephei, publicado por el usuario NGC404. El modelo original forma parte del proyecto Vosk (`alphacep/vosk-tts`) y ofrece 57 voces en ruso. Este repositorio no reentrena ni modifica los pesos: aplica `quant_pre_process` de ONNX Runtime sobre el grafo ONNX para resolver las formas simbolicas y dinamicas de antemano, dejando el grafo preparado para cachear y cargar rapido.

El problema que resuelve es puramente de ingenieria: el grafo original tiene formas dinamicas que ONNX Runtime vuelve a resolver en cada `InferenceSession`, con un coste medido de 45-65 segundos por carga, independientemente del `GraphOptimizationLevel` o de reutilizar un fichero `.ort` ya optimizado. El grafo preparado construye un cache `.ort` equivalente en aproximadamente 1-7 segundos y lo recarga en torno a 1,3 segundos, lo que reduce drasticamente el tiempo de arranque en entornos serverless, contenedores o aplicaciones de escritorio.

La relevancia es acotada pero clara: es un "drop-in replacement" para el `model.onnx` del release original, con salida verificada como practicamente identica (diferencia absoluta maxima de 0,0 en entradas sinteticas y correlacion superior a 0,9999999 en voz real). El autor advierte explicitamente de que esto **no es cuantizacion**: los pesos y la precision quedan intactos en FP32. El repositorio ocupa 0,2 GB y contiene unicamente el grafo sintetizador; el componente BERT y el diccionario de pronunciacion siguen proviniendo del release original de AlphaCephei.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle. La model card describe un grafo sintetizador en ONNX mas un componente BERT y un diccionario de pronunciacion, ambos parte del release original de AlphaCephei |
| Parametros totales | No disponible. El unico peso publicado (`model_fp32.onnx`) ocupa 0,2 GB en FP32, lo que situa el orden de magnitud en decenas de millones de parametros (estimacion a partir del tamano, no confirmada por el autor) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de sintesis de voz). La model card no especifica la longitud maxima de texto de entrada |
| Tipos de cuantizacion | No disponible. El autor indica explicitamente que el grafo publicado no esta cuantizado y mantiene FP32. No se distribuyen variantes INT8, INT4 o GGUF |
| Idiomas soportados | Ruso (`ru`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model_fp32.onnx`). El modelo requiere ademas el BERT y el diccionario del release original |
| Tarea declarada (pipeline) | `text-to-speech` |
| Voces | 57 voces en ruso (heredadas del modelo 0.10-multi) |
| Desarrollador del preprocesado | NGC404 |
| Modelo base | `vosk-model-tts-ru-0.10-multi` de AlphaCephei (`alphacep/vosk-tts`) |
| Tamano del repositorio | 0,2 GB |
| Versiones de herramientas | `onnx==1.22.0`, `onnxruntime==1.23.2` |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-15 / 2026-09-15 (segun metadatos del repositorio) |

## Arquitectura y entrenamiento

Este repositorio no entrena ningun modelo. La unica transformacion aplicada es la resolucion previa de formas del grafo ONNX mediante `quant_pre_process("model.onnx", "model_fp32.onnx", skip_symbolic_shape=False)` con `onnxruntime.quantization.shape_inference`. El objetivo es que las formas dinamicas del grafo original no se recalculen en cada carga de `InferenceSession`. Los pesos, la precision y el resto del grafo quedan intactos; el autor insiste en que la operacion no constituye una cuantizacion.

El modelo base es el sintetizador de Vosk para ruso con 57 voces, distribuido bajo Apache 2.0 por AlphaCephei. La model card no detalla la arquitectura interna del sintetizador (tipo de decoder, tipo de vocoder, funcion de perdida ni composicion del dataset de entrenamiento), por lo que esos datos deben consultarse en el proyecto `alphacep/vosk-tts`. El paquete completo requiere tres piezas: el grafo sintetizador (aqui reemplazado por la version preparada), un componente BERT y un diccionario de pronunciacion que no se incluyen en este repositorio. El enfoque replica el trabajo previo `eae1212/vosk-tts-ru-0.9-prepared`, aplicado en este caso al modelo 0.10-multi (57 voces) en lugar del 0.9 (5 voces).

## Capacidades

- Sintesis de voz (text-to-speech) en ruso con 57 voces seleccionables.
- Sustitucion directa ("drop-in replacement") del fichero `model.onnx` del release `vosk-model-tts-ru-0.10-multi`, sin cambios en el resto del pipeline.
- Salida determinista y equivalente a la del grafo original: con escalas de ruido a cero la diferencia absoluta maxima medida es 0,0; en voz real sintetizada (voces 0, 10 y 56 con ruido desactivado) la correlacion supera 0,9999999 y el error RMS en PCM16 es inferior a una unidad.
- Arranque rapido en inferencia: construccion del cache `.ort` en aproximadamente 1-7 segundos y recarga del cache en torno a 1,3 segundos, frente a los 45-65 segundos del grafo sin preparar.
- Ejecucion mediante ONNX Runtime, lo que permite usar distintos execution providers (CPU, CUDA, TensorRT, DirectML) segun el entorno.
- Integracion con el ecosistema Vosk para pipelines de voz completos en local (reconocimiento + sintesis) sin depender de servicios en la nube.
- No soporta tool calling, function calling ni uso como agente: no es un modelo de lenguaje, sino un sintetizador de voz.
- No tiene capacidades de vision, audio de entrada, razonamiento, generacion de codigo ni matematicas.
- No ofrece modo "thinking", ni ventana de contexto conversacional, ni capacidades multilingues mas alla del ruso.

## Casos de uso

- Asistentes de voz totalmente offline en ruso: combinando este sintetizador con un modelo ASR de Vosk se puede construir un bucle conversacional local (reconocer, decidir, sintetizar) sin enviar audio a terceros, algo relevante en entornos con requisitos de privacidad o sin conectividad.
- Arranque rapido en funciones serverless y contenedores efimeros: en arquitecturas que levantan una instancia por peticion, los 45-65 segundos de carga del grafo original son prohibitivos; el cache `.ort` en aproximadamente 1,3 segundos hace viable este despliegue para sintesis de frases cortas.
- Lectura de textos y accesibilidad: conversion de documentos, articulos o notificaciones en ruso a audio para lectores de pantalla y herramientas de accesibilidad, aprovechando las 57 voces para ajustar el timbre al usuario.
- Narracion de contenido editorial: audiolibros, boletines de noticias o resumenes hablados en los que se alternan varias voces para distinguir narrador, personajes o secciones.
- Sistemas de respuesta vocal interactiva (IVR) en telefonia: generacion de mensajes y menus hablados en ruso con voces consistentes y latencia de arranque baja, integrable en centralitas y pasarelas SIP.
- Avisos hablados en dispositivos embebidos: senales de navegacion, transporte publico o maquinaria industrial que emiten instrucciones en ruso sobre hardware modesto, dado que el peso publicado ocupa 0,2 GB y no exige GPU.
- Aumento de datos para entrenar ASR en ruso: generacion de corpus sinteticos con las 57 voces para ampliar la variedad de hablantes de un dataset de reconocimiento de voz.
- Demostraciones y entornos de test reproducibles: al ser una sustitucion directa del grafo original con salida verificada como equivalente, permite acelerar los ciclos de integracion continua de un producto de voz sin alterar los resultados esperados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MOS, WER, MCD, RTF) en la informacion disponible. El autor si documenta mediciones de carga y verificaciones de equivalencia numerica, que se recogen a continuacion tal como aparecen en la model card:

| Metrica | Grafo original | Grafo preparado (este repositorio) |
|---|---|---|
| Carga de `InferenceSession` | 45-65 s, con cualquier `GraphOptimizationLevel` o cache `.ort` previo | No disponible como medida directa |
| Construccion del cache `.ort` | No disponible (se recalcula en cada carga) | ~1-7 s |
| Carga del cache `.ort` | No disponible | ~1,3 s |
| `max_abs_diff` frente al original (entradas sinteticas, escalas de ruido a cero) | Referencia | 0,0 |
| Correlacion frente al original (voz real, voces 0/10/56, ruido desactivado) | Referencia | > 0,9999999 |
| Error RMS en PCM16 (voz real, voces 0/10/56) | Referencia | < 1 unidad |

No hay tabla comparativa de calidad de sintesis (MOS) ni comparacion con otros sintetizadores rusos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El peso publicado (`model_fp32.onnx`) ocupa 0,2 GB en FP32, por lo que cabe con holgura en cualquier GPU con 1 GB libre; hay que sumar el espacio del componente BERT y del diccionario del release original, cuyo tamano no se detalla.
- GPU recomendadas: no se publican recomendaciones especificas. Al tratarse de un modelo pequeno, cualquier GPU consumer con al menos 1 GB de memoria disponible deberia ser suficiente; tambien funcionan A100, H100 o tarjetas profesionales, aunque el modelo no las aprovecha por su tamano.
- Ejecucion en CPU: es el escenario natural de Vosk. ONNX Runtime con el execution provider de CPU es suficiente y no requiere GPU.
- Caber en GPU consumer: si, segun el tamano del peso publicado (0,2 GB en FP32). Cualquier RTX o equivalente con 1 GB libre deberia alojarlo; la cifra exacta del pipeline completo depende del BERT y del diccionario.
- Opciones de despliegue: ONNX Runtime (Python, C++, C# y otros bindings) con los execution providers CPU, CUDA, TensorRT o DirectML; integracion con el ecosistema Vosk. vLLM, llama.cpp, Ollama y TGI no aplican, ya que estan orientados a modelos de lenguaje y no a este tipo de grafo acustico.
- Latencia y throughput: el unico dato publicado es el tiempo de carga (1-7 s para construir el cache `.ort`, ~1,3 s para recargarlo). No hay cifras de factor de tiempo real (RTF), latencia por frase ni throughput de sintesis.

## Comparativa con modelos similares

| Modelo | Tipo | Voces | Idioma | Formato | Tiempo de carga | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| `NGC404/sgspeech-vosk-tts-ru-0.10-prepared` (este) | Grafo sintetizador ONNX preprocesado | 57 | Ruso | ONNX (FP32) | ~1-7 s para construir cache, ~1,3 s para recargarlo | Apache 2.0 | HuggingFace, 0 descargas |
| `vosk-model-tts-ru-0.10-multi` (AlphaCephei) | Grafo sintetizador ONNX original | 57 | Ruso | ONNX | 45-65 s por carga | Apache 2.0 | Distribucion de AlphaCephei / Vosk |
| `eae1212/vosk-tts-ru-0.9-prepared` | Grafo sintetizador ONNX preprocesado (enfoque de referencia) | 5 | Ruso | ONNX | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | HuggingFace |

No se dispone de datos de otros sintetizadores en ruso en la informacion proporcionada, por lo que no se incluye comparacion de calidad de audio.

## Limitaciones y advertencias

- Cobertura linguistica limitada al ruso; no hay soporte multilingue.
- No es un modelo cuantizado. El autor lo recalca de forma explicita: los pesos y la precision permanecen en FP32 y la unica modificacion es la resolucion previa de formas del grafo. No existe variante INT8, INT4 ni GGUF.
- El repositorio no es autocontenido: solo incluye el grafo sintetizador. El componente BERT y el diccionario de pronunciacion deben obtenerse del release original de AlphaCephei, y su version concreta puede afectar al comportamiento final.
- Dependencia de versiones concretas de herramientas (`onnx==1.22.0`, `onnxruntime==1.23.2`). Cambios de version en ONNX Runtime podrian alterar el comportamiento del grafo o invalidar el cache `.ort`.
- Equivalencia numerica verificada por el autor sobre un conjunto acotado de casos: entradas sinteticas con ruido a cero y voces 0, 10 y 56 en voz real. No cubre las 57 voces ni todos los textos posibles.
- Sin validacion externa: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni revision independiente.
- Los metadatos del repositorio muestran una fecha de creacion de 2026-09-15, posterior a la fecha habitual de consulta; conviene verificar la vigencia del repositorio antes de integrarlo.
- No aplica el riesgo de alucinacion tal como se entiende en modelos de lenguaje, pero el equivalente practico es la pronunciacion incorrecta de nombres propios, siglas, numeros o palabras ausentes del diccionario de pronunciacion.
- Sujeta a los sesgos acusticos del modelo original: las 57 voces heredan las caracteristicas y limitaciones del corpus con el que AlphaCephei entreno el sintetizador, y no se detallan en la model card ni la composicion del dataset ni los criterios de seleccion de voces.
- Licencia Apache 2.0 para este repositorio y para el proyecto `alphacep/vosk-tts`, lo que en principio permite uso comercial; se recomienda verificar de forma independiente la licencia y las condiciones de uso de las voces y de los recursos asociados distribuidos por AlphaCephei.
- No sustituye a un modelo de lenguaje: carece de comprension, razonamiento, tool calling y gestion de contexto conversacional.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/NGC404/sgspeech-vosk-tts-ru-0.10-prepared
- Proyecto Vosk TTS de AlphaCephei (modelo base y documentacion): https://github.com/alphacep/vosk-tts
- Modelo de referencia con el mismo enfoque, version 0.9 (5 voces): https://huggingface.co/eae1212/vosk-tts-ru-0.9-prepared
- Catalogo de modelos Vosk de AlphaCephei (incluye `vosk-model-tts-ru-0.10-multi`): https://alphacephei.com/vosk/models

Nota sobre la busqueda web: las consultas realizadas no devolvieron ningun resultado relevante para este modelo. Los resultados obtenidos correspondian a temas sin relacion (configuracion de redes WiFi, edicion de tablas en procesadores de texto, un videojuego, un extracto bancario y un foro de cirugia), por lo que no se incluyen como fuentes.
