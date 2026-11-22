# Phoonnx/vits-ru_ru-denis-medium-espeak-v2

## Resumen

vits-ru_ru-denis-medium-espeak-v2 es una voz de sintesis de voz (text-to-speech) en ruso, desarrollada originalmente por Rhasspy dentro del proyecto Piper y convertida a formato ONNX por Phoonnx (TigreGotico Lda) para su uso con la libreria phoonnx. Se trata de un modelo VITS de calidad media, entrenado sobre los modelos base de Piper 1.5, con un unico hablante masculino (denis) y una frecuencia de muestreo de 22050 Hz. El modelo no genera texto ni razona: es exclusivamente un sintetizador acustico que transforma fonemas espeak en audio.

La relevancia de esta publicacion es practica: sustituye a la version anterior (Phoonnx/vits-ru_ru-denis-medium-espeak) porque el autor original reentreno la voz sobre la base de Piper 1.5 (commit e9c8a39444 de rhasspy/piper-voices). El repositorio ocupa apenas 0,1 GB y el grafo ONNX pesa 63,2 MB, lo que lo hace adecuado para despliegue en entornos con recursos limitados, incluidos sistemas embebidos y asistentes de voz locales.

La licencia CC0 1.0 permite uso comercial sin restricciones de atribucion legal (aunque se recomienda citar a Rhasspy). El modelo esta pensado para integrarse en el ecosistema OVOS mediante el plugin ovos-tts-plugin-phoonnx, y su calidad se ha validado con un WER de 0.000 en la variante fp32 sobre tres frases de FLORES-200.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no autoregresivo) |
| Tipos de cuantizacion | fp32 (unica version publicada; int8 descartada por fallo de QA) |
| Idiomas soportados | ruso (ru-RU) |
| Licencia | CC0 1.0 |
| Formato de pesos | ONNX |
| Frecuencia de muestreo | 22050 Hz |
| Hablantes | 1 (denis, masculino) |
| Entrada de texto | fonemas espeak (alfabeto IPA) |
| Fonemizador | espeak-ng, voz ru |
| Puntuacion soportada | , . ! ? : ; (clausulas) |
| Tamano del grafo | 63,2 MB |
| Tamano del repositorio | 0,1 GB |
| Voice id | piper/ru_RU-denis-medium-v2 |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), la misma que utiliza el ecosistema Piper. VITS combina un encoder de texto, un predictor de duracion y un decoder generativo basado en normalizing flows y un discriminador adversarial, todo entrenado de forma conjunta para producir audio directamente a partir de fonemas. La entrada no es texto crudo sino fonemas en alfabeto IPA generados por espeak-ng con la voz rusa; por tanto, la calidad de la sintesis depende de la correccion de la fonemizacion previa.

Segun la model card, la voz fue reentrenada por Rhasspy sobre los modelos base de Piper 1.5 (commit e9c8a39444 de rhasspy/piper-voices). El entrenamiento parte del modelo base rdh (calidad medium, un hablante flamenco de nl_BE, CC0) y aplica fine-tuning con MRD y SDP. Los datos de entrenamiento concretos no estan registrados en el upstream; la unica referencia es el repositorio OHF-Voice/voice-datasets con licencia CC0. Los ajustes de inferencia por defecto son noise_scale 0.5 y noise_w 0.333, y se requiere Piper 1.5 o superior. No se documenta el uso de RLHF ni DPO, algo esperable en un modelo TTS.

## Capacidades

- Sintesis de voz en ruso (ru-RU) a partir de texto, con un unico hablante masculino identificado como denis.
- Generacion de audio a 22050 Hz en formato WAV mediante la API de phoonnx.
- Procesamiento de fonemas espeak-ng en alfabeto IPA, con soporte de puntuacion de clausula (, . ! ? : ;) que phoonnx 1.96.1a1 y posteriores preservan en la sintesis.
- Integracion con el ecosistema OVOS mediante el plugin ovos-tts-plugin-phoonnx, configurable en mycroft.conf.
- Ejecucion en CPU sin GPU: el modelo alcanza un RTF de 0.042 con 4 hilos en un Intel i9-11900H, es decir, sintetiza audio unas 24 veces mas rapido que tiempo real.
- No soporta tool calling, agentes, razonamiento multi-step, vision, audio de entrada ni generacion de texto: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz locales en ruso: el modelo puede integrarse en OVOS o en cualquier pipeline basado en phoonnx para dotar de voz a un asistente domestico sin conexion, gracias a su bajo consumo (225 MB de RSS pico) y a su RTF de 0.042 en CPU.
- Lectura de notificaciones y alertas en sistemas embebidos: con un grafo ONNX de 63,2 MB y ejecucion en CPU, cabe en dispositivos tipo Raspberry Pi o mini-PC y permite sintetizar mensajes cortos en tiempo real.
- Accesibilidad para personas con discapacidad visual: lectura de textos en ruso en aplicaciones de escritorio o moviles, con soporte de puntuacion que mejora la prosodia en frases largas.
- Generacion de audiolibros o podcasts automatizados: la voz unica y la calidad media son suficientes para narracion de contenido divulgativo, con la ventaja de la licencia CC0 para uso comercial.
- Doctesting y pruebas de integracion de pipelines de voz: al ser un modelo pequeno y determinista en su configuracion por defecto, sirve para validar cadenas ASR-TTS en CI sin coste de GPU.
- Sistemas de anuncios publicos o telefonia IVR en ruso: sintesis de mensajes predefinidos con baja latencia en servidores sin GPU dedicada.
- Prototipado de interfaces conversacionales en ruso: permite iterar rapidamente sobre dialogos y respuestas sin depender de servicios cloud de TTS.

## Benchmarks y rendimiento

La model card incluye una validacion de calidad (QA) mediante ASR con nemo-parakeet-tdt-0.6b-v3 int8 sobre 3 frases de FLORES-200 devtest:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA | pass | no publicado (fallo de gate) |
| WER | 0.000 | 0.100 |
| Caracteres por segundo | 14,2 a 15,5 | - |
| Longitud int8 / fp32 | - | 0,97 a 1,01 |
| Tamano del grafo | 63,2 MB | - |
| RSS pico | 225,0 MB | - |
| RTF (mediana de 3, 4 hilos) | 0,042 | - |

Medido en un Intel Core i9-11900H a 2,50 GHz. El RTF es el tiempo de sintesis dividido por la duracion del audio. La copia int8 no se publica porque su WER (0.100) supera el umbral de 0,05 fijado por el autor. No se han publicado resultados de benchmarks comparativos con otros modelos TTS en la informacion disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo se ejecuta en CPU. El RSS pico medido es de 225,0 MB en fp32.
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente. En caso de forzar GPU, no hay soporte documentado en phoonnx para esta voz.
- Cabe en cualquier GPU consumer y en sistemas embebidos: el grafo ONNX ocupa 63,2 MB y el repositorio completo 0,1 GB.
- Opciones de despliegue: phoonnx (libreria nativa), plugin ovos-tts-plugin-phoonnx para OVOS/Mycroft. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: RTF de 0,042 con 4 hilos en i9-11900H (aproximadamente 24x tiempo real); 14,2 a 15,5 caracteres por segundo de audio generado.
- Dependencia externa: es necesario instalar espeak-ng en el sistema (o el port espyak mediante `phoonnx[espeak]`), con la advertencia de que algunos fonemas de espyak difieren de espeak-ng y pueden producir errores de pronunciacion.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Hablantes | Frecuencia | Licencia | Formato |
|---|---|---|---|---|---|---|
| vits-ru_ru-denis-medium-espeak-v2 (este) | ru-RU | VITS (Piper) | 1 | 22050 Hz | CC0 1.0 | ONNX |
| rhasspy/piper-voices ru_RU denis medium (upstream) | ru-RU | VITS (Piper) | 1 | 22050 Hz | CC0 1.0 | ONNX / Piper |
| Otras voces Piper rusas (irina, dmitri, etc.) | ru-RU | VITS (Piper) | 1 | 22050 Hz | CC0 1.0 | ONNX / Piper |
| Modelos TTS multilingues de gran tamano (p. ej. XTTS) | Multiples | no disponible en la informacion | Multiples | no disponible | no disponible | no disponible |

La comparativa se limita al ecosistema Piper porque no se dispone de datos de benchmarks de alternativas en la informacion proporcionada. Frente al modelo upstream, esta version incorpora el reentrenamiento sobre Piper 1.5 y la preservacion de puntuacion de clausula en phoonnx 1.96.1a1 o superior.

## Limitaciones y advertencias

- Un solo hablante y un solo idioma (ruso): no es un modelo multilingue ni permite cambio de voz.
- Calidad media: la propia denominacion "medium" indica que no es una voz de alta fidelidad; puede presentar artefactos en prosodia compleja.
- Dependencia critica de espeak-ng: una fonemizacion incorrecta produce pronunciaciones erroneas. El uso del port espyak puede introducir diferencias foneticas respecto a espeak-ng.
- Sin version int8 publicada: la cuantizacion int8 degrada el WER a 0.100, por encima del umbral de 0,05, por lo que no se recomienda cuantizar sin validacion propia.
- Riesgo de alucinacion acustica: como todo modelo generativo TTS, puede producir audio ininteligible o ruido en entradas anomalas (texto muy corto, caracteres no soportados, puntuacion atipica).
- Datos de entrenamiento no documentados: se desconoce la composicion del corpus, lo que impide evaluar sesgos de pronunciacion o cobertura lexica.
- Licencia CC0 1.0: permite uso comercial sin restricciones, pero se recomienda atribuir a Rhasspy como autor original de los pesos.
- No apto para clonacion de voz ni para síntesis expresiva: no soporta control de emocion, velocidad ni estilo mas alla de los parametros noise_scale y noise_w.
- Fecha de creacion del repositorio (2026-11-22) y cero descargas/likes: modelo muy reciente y sin validacion comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Phoonnx/vits-ru_ru-denis-medium-espeak-v2
- Modelo upstream (Piper voices, ru_RU denis medium): https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/ru/ru_RU/denis/medium
- Repositorio anterior sustituido: https://huggingface.co/Phoonnx/vits-ru_ru-denis-medium-espeak
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- Dataset de voces upstream (OHF-Voice): https://github.com/OHF-Voice/voice-datasets
