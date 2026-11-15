# Phoonnx/mixertts-en_us-ljspeech-384

## Resumen

mixertts-en_us-ljspeech-384 es un modelo de sintesis de voz (text-to-speech) en ingles estadounidense, empaquetado por Phoonnx en formato ONNX para su uso con la libreria `phoonnx`. El modelo original es una implementacion de MixerTTS desarrollada por nipponjo (repositorio `mixer-tts-pytorch`), y esta version concreta se ha entrenado sobre el corpus LJSpeech, un dataset de dominio publico de una unica hablante femenina en ingles. El sufijo 384 hace referencia al tamano de la representacion interna del modelo, aunque la model card no detalla el significado exacto.

El modelo resuelve la conversion de texto a audio mediante una arquitectura en dos etapas: un modelo acustico que genera un espectrograma a partir de fonemas IPA obtenidos con espeak-ng, y un vocoder externo (`vocos-multi-alvocat-22khz`) que transforma ese espectrograma en audio a 22 kHz. El repositorio ocupa aproximadamente 0,1 GB, lo que lo situa en la categoria de modelos ligeros aptos para despliegue en entornos con recursos limitados.

Su relevancia actual radica en que ofrece una via de sintesis de voz completamente offline y de baja huella computacional, integrable en asistentes locales como OVOS mediante el plugin `ovos-tts-plugin-phoonnx`. No obstante, la ausencia de licencia registrada y el bajo numero de descargas (34 en el momento de la consulta) aconsejan precaucion antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MixerTTS (modelo acustico) + vocoder vocos-multi-alvocat-22khz |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de contexto largo) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | en-US |
| Licencia | other (sin licencia concreta registrada; consultar upstream) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

MixerTTS es una arquitectura de sintesis de voz que combina un modelo acustico basado en mezcladores (mixers) para generar espectrogramas a partir de secuencias de fonemas, con un vocoder neuronal separado que convierte el espectrograma en forma de onda. El texto de entrada se procesa primero mediante espeak-ng para obtener fonemas en alfabeto IPA, que constituyen la entrada real del modelo. El vocoder empleado es `vocos-multi-alvocat-22khz`, un modelo de la familia Vocos con salida a 22 kHz.

El entrenamiento se ha realizado sobre LJSpeech, un corpus de aproximadamente 24 horas de audio de una unica hablante femenina en ingles estadounidense, lo que explica el caracter mono-hablante del modelo. La model card no proporciona informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO (habitualmente innecesarias en TTS). Tampoco se detalla si hubo aumentacion de datos o ajuste fino adicional.

## Capacidades

- Sintesis de voz en ingles estadounidense (en-US) a partir de texto plano.
- Generacion de audio a 22 kHz mediante el vocoder asociado.
- Conversion texto a fonemas IPA mediante espeak-ng (a traves de `scriptconv`).
- Integracion con la libreria `phoonnx` para inferencia en Python.
- Soporte como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`).
- Ejecucion offline sin dependencias de servicios en la nube.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo puramente TTS).
- No soporta vision, audio de entrada ni modo thinking.

## Casos de uso

- Asistentes de voz locales: el modelo puede integrarse en OVOS como motor TTS para pronunciar respuestas en ingles estadounidense sin conexion a internet, gracias a su formato ONNX y su bajo peso (0,1 GB).
- Lectura de notificaciones y alertas: en sistemas embebidos o de escritorio, el modelo puede sintetizar mensajes cortos con latencia reducida al no requerir GPU dedicada.
- Accesibilidad para personas con discapacidad visual: conversion de texto a voz en aplicaciones de escritorio o moviles que necesiten un motor TTS ligero y offline en ingles.
- Prototipado de interfaces conversacionales: util para desarrolladores que quieran validar flujos de voz en ingles antes de invertir en modelos comerciales o de mayor tamano.
- Generacion de audiolibros o contenido narrado de dominio publico: al estar entrenado sobre LJSpeech (una unica hablante), es adecuado para narraciones monologo con voz consistente.
- Pruebas de integracion en pipelines de CI/CD: el modelo puede usarse para generar audio de prueba en tests automatizados de sistemas de voz, dado su reducido tamano y su naturaleza determinista.
- Educacion y demos de TTS: sirve como ejemplo didactico de una arquitectura MixerTTS empaquetada en ONNX para quienes estudian sintesis de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repositorio (0,1 GB) se estima un consumo inferior a 1 GB, aunque no se confirma en la model card.
- GPU recomendadas: no disponible. Por el reducido tamano, es probable que funcione en CPU y en GPUs consumer de gama baja, pero no se especifica.
- Cabe en GPU consumer: presumiblemente si, dado el tamano, aunque no hay confirmacion oficial.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mixertts-en_us-ljspeech-384 | no disponible | no aplica | no disponible | other (sin registrar) | Hugging Face, ONNX |
| Otros modelos MixerTTS de la coleccion Phoonnx | no disponible | no aplica | no disponible | other | Hugging Face |
| Modelos TTS comerciales (p. ej. ElevenLabs, Azure TTS) | no disponible | no aplica | no disponible | propietaria | API en la nube |

No se dispone de datos de benchmarks ni de especificaciones comparables de otros modelos MixerTTS en la informacion proporcionada, por lo que la comparativa cuantitativa no es posible.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre LJSpeech: una unica hablante femenina, lo que limita la variedad de voces y estilos.
- Solo soporta ingles estadounidense (en-US); no hay soporte multilingue.
- Depende de espeak-ng para la fonemizacion; con la alternativa espyak algunos fonemas difieren y pueden producir pronunciaciones incorrectas.
- Licencia "other" sin texto concreto registrado: riesgo legal para uso comercial, ya que la model card indica explicitamente que se consulte la version upstream antes de usarlo.
- Riesgo de alucinacion acustica: como todo modelo TTS, puede generar artefactos, prosodia incorrecta o pronunciaciones erroneas en palabras fuera del dominio de LJSpeech.
- El bajo numero de descargas (34) y la ausencia de likes sugieren poca validacion por parte de la comunidad.
- No se documentan sesgos especificos, pero al derivar de una unica hablante, el modelo hereda sus caracteristicas prosodicas y no representa diversidad de acentos.
- No apto para tareas de razonamiento, codigo o agentes; su unico proposito es la sintesis de voz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/mixertts-en_us-ljspeech-384
- Repositorio upstream MixerTTS: https://github.com/nipponjo/mixer-tts-pytorch
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion MixerTTS en Hugging Face: https://huggingface.co/collections/Phoonnx/mixertts-6af8ea927256661d4786e3a8
- Vocoder vocos-multi-alvocat-22khz: https://huggingface.co/Phoonnx/vocos-multi-alvocat-22khz
