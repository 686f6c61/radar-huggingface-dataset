# Phoonnx/mixertts-en_us-ljspeech-128-espeak

## Resumen

MixerTTS en_us_ljspeech_128_espeak es un modelo de sintesis de voz (text-to-speech) desarrollado originalmente por nipponjo dentro del proyecto MixerTTS y empaquetado por Phoonnx para su libreria ONNX de inferencia TTS. El modelo convierte texto en ingles estadounidense, representado como fonemas IPA generados por espeak-ng, en un espectrograma que posteriormente se transforma en audio mediante el vocoder vocos-multi-alvocat-22khz. La arquitectura MixerTTS esta implementada en PyTorch en el repositorio upstream y se distribuye aqui en formato ONNX para su ejecucion en produccion.

El modelo resuelve el problema de disponer de una voz TTS ligera y ejecutable localmente dentro del ecosistema phoonnx y OVOS, sin depender de servicios en la nube. Su integracion con el front-end de texto scriptconv y con el fonemizador de espeak-ng permite normalizar y convertir el texto de entrada antes de la sintesis. El identificador "128" hace referencia a la configuracion de la variante MixerTTS empleada, y el sufijo "ljspeech" indica que se entrena sobre el corpus LJSpeech.

La relevancia actual del modelo radica en su caracter abierto y su empaquetado ONNX, que facilita el despliegue en entornos con recursos limitados y su uso como plugin de voz en asistentes OVOS. No obstante, el repositorio es de muy reciente creacion, acumula pocas descargas y no incluye datos publicos de benchmarks ni una licencia claramente registrada, lo que limita su adopcion en produccion sin una evaluacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MixerTTS (generador de espectrogramas) + vocoder vocos-multi-alvocat-22khz |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | en-US |
| Licencia | other (sin licencia registrada; consultar el release upstream) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

MixerTTS es una arquitectura de sintesis de voz basada en mezcladores (mixers) que genera espectrogramas a partir de secuencias de fonemas. El modelo upstream esta implementado en PyTorch en el repositorio github.com/nipponjo/mixer-tts-pytorch y ha sido empaquetado por Phoonnx en formato ONNX para su ejecucion con la libreria phoonnx. La salida del modelo es un espectrograma que se convierte en audio mediante el vocoder vocos-multi-alvocat-22khz, descargado automaticamente junto con la voz.

El texto de entrada se procesa mediante el front-end scriptconv, que normaliza el texto y lo convierte en fonemas IPA utilizando el fonemizador EspeakPhonemizer de espeak-ng. El modelo se asocia al corpus LJSpeech, un dataset publico de audio en ingles estadounidense, si bien no se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detallan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Sintesis de voz en ingles estadounidense (en-US) a partir de texto plano.
- Generacion de espectrogramas convertibles a audio WAV mediante el vocoder vocos-multi-alvocat-22khz.
- Procesamiento de entrada basado en fonemas IPA generados por espeak-ng, con normalizacion de texto previa mediante scriptconv.
- Integracion como plugin de voz en el ecosistema OVOS a traves de ovos-tts-plugin-phoonnx.
- Ejecucion local en formato ONNX, sin dependencia de servicios en la nube.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio de entrada.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se selecciona como voz en mycroft.conf mediante el plugin ovos-tts-plugin-phoonnx, permitiendo sintesis de voz en ingles sin conexion a internet y con una huella de recursos reducida al ejecutarse en ONNX.
- Lectura de notificaciones y avisos en aplicaciones de escritorio: la sintesis local permite convertir mensajes cortos en audio en tiempo real sin latencia de red, adecuada para entornos de escritorio y sistemas embebidos.
- Generacion de audiolibros o narraciones de texto largo: el modelo puede procesar frases de forma secuencial y volcar cada una a un fichero WAV, si bien no se documenta soporte de contexto largo ni control de prosodia avanzado.
- Accesibilidad para personas con discapacidad visual: integrado en lectores de pantalla o herramientas de asistencia que requieran una voz en ingles estadounidense ejecutable localmente.
- Prototipado de interfaces conversacionales: util para desarrolladores que necesiten una voz TTS de referencia en ingles durante el desarrollo de asistentes, antes de migrar a soluciones comerciales.
- Pruebas de integracion en pipelines de CI/CD: al distribuirse en ONNX y con dependencias declaradas (phoonnx, espeak-ng), puede incorporarse en tests automatizados que verifiquen la generacion de audio en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo se distribuye en ONNX y el tamano del repositorio es de 0.0 GB, lo que sugiere un modelo ligero, pero no se confirman cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por el formato ONNX y el tamano reducido del repositorio es plausible su ejecucion en CPU, pero no se documenta.
- Opciones de despliegue: libreria phoonnx (Python), plugin ovos-tts-plugin-phoonnx para OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Phoonnx/mixertts-en_us-ljspeech-128-espeak | no disponible | no disponible | en-US | other (sin registrar) | ONNX | Hugging Face |
| Otras voces MixerTTS de la coleccion Phoonnx | no disponible | no disponible | segun variante | other | ONNX | Hugging Face |
| Modelos TTS genericos de la categoria | no disponible | no disponible | varios | variable | variable | variable |

No se dispone de datos de rendimiento ni de parametros de modelos comparables en la informacion proporcionada, por lo que la comparativa se limita a la disponibilidad y el formato.

## Limitaciones y advertencias

- Solo soporta ingles estadounidense (en-US); no se documentan otros idiomas.
- Requiere espeak-ng instalado en el sistema; con el port espyak algunos fonemas difieren y la voz puede pronunciar mal ciertas palabras.
- La licencia figura como "other" y no hay licencia registrada para el modelo; es imprescindible consultar el release upstream antes de cualquier uso comercial.
- No se publican benchmarks, metricas de calidad (MOS, WER) ni evaluaciones objetivas, lo que impide valorar su fidelidad frente a alternativas.
- Riesgo de alucinacion no aplicable en el sentido de LLM, pero si de artefactos de sintesis y pronunciaciones incorrectas derivadas del front-end de fonemas.
- El repositorio tiene muy pocas descargas (22) y ningun "like", lo que indica una adopcion minima y escasa validacion por la comunidad.
- No se documentan sesgos especificos; al entrenarse sobre LJSpeech, la voz puede reflejar las caracteristicas del corpus original.
- Para produccion se recomienda evaluar la inteligibilidad y naturalidad de forma independiente, dado que no hay datos publicos de rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/mixertts-en_us-ljspeech-128-espeak
- Repositorio upstream MixerTTS: https://github.com/nipponjo/mixer-tts-pytorch
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Vocoder vocos-multi-alvocat-22khz: https://huggingface.co/Phoonnx/vocos-multi-alvocat-22khz
- Coleccion MixerTTS en Hugging Face: https://huggingface.co/collections/Phoonnx/mixertts-6af8ea927256661d4786e3a8
