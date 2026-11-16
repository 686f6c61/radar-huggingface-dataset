# Phoonnx/vits-it_it-giorgio-espeak

## Resumen

vits-it_it-giorgio-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su libreria ONNX de TTS. El modelo original procede de kirys79, en concreto de la voz Giorgio del repositorio piper_italiano, y Phoonnx lo ha reempaquetado en formato ONNX para su uso con la libreria phoonnx, tanto en Python como en el ecosistema OVOS (Open Voice OS).

El modelo resuelve la conversion de texto a voz en italiano (it-IT) mediante fonemas espeak en alfabeto IPA. Al estar basado en VITS, es un modelo de sintesis neuronal de extremo a extremo que genera audio de forma directa a partir de la secuencia de fonemas, sin necesidad de un vocoder separado. Su relevancia radica en que ofrece una voz italiana ligera y desplegable en local, integrable en asistentes de voz y aplicaciones de lectura en voz alta.

El repositorio ocupa aproximadamente 0,1 GB, lo que indica un modelo compacto apto para entornos con recursos limitados. La licencia declarada es CC-BY-4.0, lo que permite uso comercial con atribucion. No se dispone de informacion sobre el numero de parametros ni la longitud de contexto, ya que en TTS estos conceptos no aplican de la misma forma que en modelos de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica en TTS) |
| Tipos de cuantizacion | no disponible (pesos ONNX) |
| Idiomas soportados | italiano (it-IT) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak, alfabeto IPA |
| Tamano del repositorio | aproximadamente 0,1 GB |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura de sintesis neuronal de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial entrenado con perdidas de reconstruccion y adversariales. La salida es audio directamente, sin vocoder externo, lo que simplifica el despliegue. El modelo empaquetado es una conversion a ONNX del modelo original de kirys79.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO, ya que la model card no detalla el proceso de entrenamiento del modelo original. La unica innovacion destacable documentada es el empaquetado para phoonnx, que permite ejecutar el modelo en Python, en OVOS y en el navegador mediante phoonnx.js.

## Capacidades

- Sintesis de voz en italiano (it-IT) a partir de texto.
- Entrada basada en fonemas espeak en alfabeto IPA, generados por el fonemizador EspeakPhonemizer de scriptconv.
- Generacion de audio WAV mediante la API de phoonnx (voice.synthesize_wav).
- Integracion con OVOS a traves del plugin ovos-tts-plugin-phoonnx.
- Ejecucion en navegador mediante phoonnx.js (con entrada espeak o unicode).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- No dispone de vision, audio de entrada ni modo thinking.
- Capacidad multilingue limitada al italiano.

## Casos de uso

- Lectura en voz alta de contenido: el modelo convierte texto italiano en audio WAV, adecuado para aplicaciones de accesibilidad, lectores de noticias o audiolibros ligeros, gracias a su tamano reducido de aproximadamente 0,1 GB.
- Asistentes de voz locales en OVOS: se integra mediante el plugin ovos-tts-plugin-phoonnx y se selecciona la voz en mycroft.conf, permitiendo respuestas habladas en italiano sin depender de servicios en la nube.
- Sistemas de anuncios automatizados: en entornos como estaciones, aeropuertos o comercios, el modelo puede sintetizar mensajes dinamicos en italiano con baja latencia al ejecutarse en ONNX.
- Prototipado de interfaces de voz: desarrolladores que necesiten una voz italiana para pruebas de UX pueden desplegarla rapidamente con pip install --pre phoonnx y espeak-ng.
- Aplicaciones web de TTS: mediante phoonnx.js, el modelo puede ejecutarse en el navegador para sintetizar voz italiana sin backend, usando la demo en tigregotico.pt/demo como referencia.
- Educacion y aprendizaje de idiomas: generacion de pronunciaciones en italiano a partir de fonemas IPA, util para herramientas de practica de pronunciacion.
- Integracion en pipelines de audio: al producir WAV mediante la API de wave, el modelo se puede encadenar con postprocesado de audio, subtitulado o generacion de podcasts automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa aproximadamente 0,1 GB, lo que sugiere un modelo muy ligero que probablemente cabe en CPU y en GPUs de gama baja, pero no se confirma en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por el tamano del repositorio es plausible que funcione en CPU, pero no se especifica.
- Opciones de despliegue: phoonnx (Python), ovos-tts-plugin-phoonnx (OVOS), phoonnx.js (navegador).
- Latencia y throughput: no disponibles.
- Dependencias: espeak-ng (o el extra phoonnx[espeak] con espyak) para la generacion de fonemas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vits-it_it-giorgio-espeak (este modelo) | VITS | it-IT | ONNX | CC-BY-4.0 | Hugging Face, phoonnx |
| kirys79/piper_italiano/Giorgio (upstream) | VITS | it-IT | no disponible en la informacion | CC-BY-4.0 (declarada) | Hugging Face |
| Otros modelos VITS de la coleccion Phoonnx | VITS | varios | ONNX | no disponible | Hugging Face (coleccion VITS) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado unicamente en sintesis de voz; no realiza ninguna otra tarea.
- Idioma limitado al italiano (it-IT); no soporta otros idiomas.
- La calidad de la sintesis depende de la correcta fonemizacion con espeak-ng; si se usa espyak, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, segun advierte la model card.
- Requiere instalar espeak-ng de forma externa (por ejemplo, apt install espeak-ng) o el extra phoonnx[espeak].
- No se dispone de informacion sobre sesgos del modelo ni sobre su comportamiento en dominios especificos.
- Riesgo de alucinacion no aplica en el sentido de generacion de texto, pero la pronunciacion puede ser incorrecta ante fonemas mal formados.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; es necesario citar al autor original (kirys79) y respetar los terminos de la licencia.
- No se dispone de informacion sobre el proceso de entrenamiento ni sobre las condiciones de uso recomendadas por el autor original.
- El modelo esta empaquetado para phoonnx; su uso fuera de esta libreria puede requerir conversion o adaptacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-it_it-giorgio-espeak
- Modelo upstream: https://huggingface.co/kirys79/piper_italiano/tree/main/Giorgio
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
