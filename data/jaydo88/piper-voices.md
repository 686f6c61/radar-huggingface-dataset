# jaydo88/piper-voices

## Resumen

piper-voices es una coleccion de voces preentrenadas para el sistema de sintesis de voz Piper, un motor TTS neuronal de codigo abierto orientado a ejecucion local y sin conexion. El repositorio original lo mantiene rhasspy, mientras que la copia analizada aqui (jaydo88/piper-voices) es una resubida de terceros con 11,9 GB de ficheros ONNX. No se trata de un unico modelo, sino de un catalogo de voces independientes: cada voz es un modelo VITS exportado a ONNX, con su propio fichero de pesos y su configuracion asociada.

El problema que resuelve es la sintesis de voz de baja latencia en hardware modesto: las voces estan disenadas para correr en CPU, incluida una Raspberry Pi, sin GPU ni servicios en la nube. Segun los niveles de calidad documentados, los modelos van de 5-7 M de parametros (x_low, 16 kHz) a 28-32 M de parametros (high, 22,05 kHz), lo que los situa muy lejos de los modelos TTS neuronales de gran escala.

Su relevancia actual viene del ecosistema: Piper se integra en Home Assistant, asistentes de voz offline y aplicaciones de accesibilidad, y la licencia MIT de esta copia facilita el uso comercial. El repo cubre 34 idiomas, incluido el castellano (ca_ES, es_ES, es_MX), con voces mono y multi-hablante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end, texto a forma de onda) exportada a ONNX; fonemizacion previa con espeak-ng |
| Parametros totales | Depende de la voz: 5-7 M (x_low), 15-20 M (low y medium), 28-32 M (high). No es un unico modelo |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: la entrada se segmenta por frases; no hay ventana de contexto autorregresiva |
| Tipos de cuantizacion | Pesos distribuidos en ONNX; no se documentan esquemas de cuantizacion adicionales en la informacion proporcionada |
| Idiomas soportados | 34: ar, ca, cs, cy, da, de, el, en, es, fa, fi, fr, hu, is, it, ka, kk, lb, lv, ne, nl, no, pl, pt, ro, ru, sk, sl, sr, sv, sw, tr, uk, vi, zh |
| Licencia | MIT |
| Formato de pesos | ONNX (.onnx) mas fichero de configuracion JSON por voz |
| Repositorio | 11,9 GB, 0 descargas y 0 likes en el momento del analisis |
| Pipeline declarado | No disponible |

## Arquitectura y entrenamiento

Cada voz es un modelo VITS: un sistema neuronal end-to-end que combina un codificador de texto, un modulo de alineamiento y duracion, un decodificador generativo y un vocoder adversarial, de forma que la salida es directamente la forma de onda. Piper exporta el modelo a ONNX para que la inferencia se ejecute con onnxruntime, principalmente en CPU. La entrada de texto se convierte antes a fonemas mediante espeak-ng, lo que explica la cobertura amplia de idiomas con un mismo motor.

Los modelos se organizan en cuatro niveles de calidad segun los datos publicos de muestras de Piper: x_low (16 kHz, 5-7 M de parametros), low (16 kHz, 15-20 M), medium (22,05 kHz, 15-20 M) y high (22,05 kHz, 28-32 M). Algunas voces son multi-hablante y permiten cambiar de locutor dentro del mismo modelo. El numero de tokens de entrenamiento, la composicion exacta de los datasets y el uso de RLHF o DPO no estan disponibles en la informacion proporcionada; la model card solo enlaza al procedimiento de entrenamiento del repositorio de rhasspy y al dataset de checkpoints piper-checkpoints.

## Capacidades

- Sintesis de voz (texto a audio) offline, sin dependencia de APIs externas.
- Soporte de 34 idiomas, con varias voces por idioma en algunos casos.
- Voces mono-hablante y multi-hablante, con cambio de locutor en tiempo de inferencia en los modelos multi-speaker.
- Cuatro niveles de calidad que permiten ajustar el compromiso entre tamano, velocidad y fidelidad de audio.
- Fonemizacion multilingue mediante espeak-ng, incluida como paso previo a la sintesis.
- Ejecucion en CPU, apta para dispositivos embebidos y sistemas sin GPU.
- No dispone de tool calling ni function calling.
- No dispone de razonamiento multi-paso ni modo de pensamiento.
- No dispone de capacidades de vision ni de procesamiento de audio de entrada (no es un modelo ASR).
- No genera texto: es exclusivamente un modelo de sintesis de voz.

## Casos de uso

- Asistentes de voz para domotica: integrado en Home Assistant mediante el protocolo Wyoming, el modelo convierte las respuestas de texto del asistente en audio local, sin enviar datos a la nube y con latencia baja en CPU.
- Lectura de articulos y documentos para accesibilidad: aplicaciones de screen reader pueden sintetizar parrafos completos con voces de 22,05 kHz, segmentando el texto por frases para mantener una prosodia natural.
- Audioguias y anuncios en dispositivos embebidos: una Raspberry Pi o un SBC similar puede ejecutar una voz x_low o low para reproducir mensajes pregrabados dinamicamente en museos, transporte publico o comercios.
- Localizacion y doblaje de contenido: al cubrir 34 idiomas con licencia MIT, permite generar pistas de voz para prototipos de video, cursos o demos sin coste por caracter ni restricciones de uso comercial.
- Sistemas IVR y atencion telefonica: genera mensajes de menu y respuestas habladas en servidores sin GPU, reduciendo el coste de infraestructura frente a servicios TTS en la nube.
- E-learning y material educativo: sintesis de enunciados, ejercicios y textos largos en varios idiomas para plataformas que necesitan audio bajo demanda.
- Generacion de datos sinteticos para ASR: las voces multi-hablante y multilingues permiten aumentar corpus de entrenamiento de reconocimiento de voz, algo viable gracias a la licencia MIT.
- Kioscos e interfaces de voz en automocion: la ejecucion local evita depender de conectividad y cumple requisitos de privacidad al no salir el texto del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MOS, WER ni comparativas numericas, y los resultados de busqueda solo describen niveles de calidad y parametros, sin metricas de evaluacion.

## Requisitos de hardware

- VRAM: no requiere GPU. En CPU, el consumo de memoria es el del modelo ONNX mas el runtime. Estimacion a partir del numero de parametros en fp32: 20-28 MB para x_low, 60-80 MB para low y medium, y 110-130 MB para high. Es una estimacion de calculo, no un dato publicado.
- GPU recomendadas: no aplica; el diseno es CPU-first. Cualquier GPU con soporte onnxruntime puede usarse, pero no aporta ventajas claras por el tamano reducido de los modelos.
- Compatibilidad con GPU de consumo: cabe en cualquier GPU de consumo e integrada, e incluso en dispositivos sin GPU dedicada.
- Despliegue: binario piper (C++), paquete piper-tts de Python, onnxruntime, integracion con Home Assistant via Wyoming, contenedores Docker y wrappers en otros lenguajes. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan cifras concretas en la informacion disponible. El proyecto se presenta como apto para ejecucion en tiempo real en CPU, incluida Raspberry Pi, pero no se documentan valores de latencia ni de caracteres por segundo en las fuentes consultadas.
- Almacenamiento: el repositorio completo ocupa 11,9 GB, aunque basta con descargar las voces y configuraciones de los idiomas que se vayan a usar.

## Comparativa con modelos similares

Los datos de los modelos alternativos que aparecen a continuacion proceden de conocimiento publico general y no han sido verificados en los resultados de busqueda proporcionados; se marcan como referencia aproximada.

| Modelo | Tipo | Parametros | Idiomas | Licencia | Ejecucion en CPU |
|---|---|---|---|---|---|
| piper-voices (jaydo88) | VITS + ONNX, coleccion de voces | 5-32 M por voz | 34 | MIT | Si, diseno CPU-first |
| Coqui TTS / XTTS v2 | TTS neuronal con clonacion de voz | Aprox. 470 M (referencia publica) | Multilingue (aprox. 17) | CPML, no comercial en XTTS v2 | Posible, pero mucho mas exigente |
| Kokoro-82M | TTS neuronal | 82 M (referencia publica) | Principalmente ingles y otros | Apache 2.0 | Si |
| eSpeak NG | Sintesis formantica, no neuronal | No aplica | Muy amplio | GPLv3 | Si, muy ligero |

La ventaja principal de Piper frente a alternativas neuronales mayores es el tamano por voz y la licencia MIT sin restricciones comerciales. Su desventaja es la menor naturalidad y expresividad en comparacion con modelos de cientos de millones de parametros.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no razona, no sigue instrucciones complejas ni genera texto.
- La calidad de la prosodia y la expresividad es inferior a la de modelos TTS de gran escala; los niveles x_low y low son especialmente basicos.
- Riesgo de pronunciacion incorrecta en palabras fuera del lexico fonetico del idioma o en nombres propios, ya que la fonemizacion depende de espeak-ng.
- La model card no documenta los datasets de entrenamiento de cada voz, por lo que no se pueden evaluar sesgos de locutor ni de acento.
- No se proporcionan metricas objetivas de calidad ni evaluaciones independientes en la informacion disponible.
- Esta copia concreta tiene 0 descargas y 0 likes y esta publicada por un tercero (jaydo88), no por el equipo de Piper; conviene verificar la integridad de los ficheros y preferir el repositorio original rhasspy/piper-voices cuando sea posible.
- El repositorio pesa 11,9 GB, lo que implica un coste de almacenamiento y de ancho de banda relevante si se clona completo.
- La licencia MIT permite uso comercial, pero cada voz puede derivar de datasets con condiciones propias no detalladas en la model card; se recomienda revisar la procedencia antes de un despliegue en produccion.
- No hay soporte nativo de control emocional ni de prosodia por etiquetas en la informacion proporcionada.

## Enlaces

- Repositorio analizado: https://huggingface.co/jaydo88/piper-voices
- Repositorio original de voces: https://huggingface.co/rhasspy/piper-voices
- Proyecto Piper: https://github.com/rhasspy/piper
- Guia de entrenamiento de voces: https://github.com/rhasspy/piper/blob/master/TRAINING.md
- Checkpoints para entrenamiento: https://huggingface.co/datasets/rhasspy/piper-checkpoints/tree/main
- Muestras de voces: https://rhasspy.github.io/piper-samples/
- Documentacion de descarga de voces: https://tderflinger.github.io/piper-docs/about/voices/download/
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/piper-voices-rhasspy
- Directorio de voces Piper en TTS.ai: https://tts.ai/voices/piper/
