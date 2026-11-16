# Phoonnx/vits-es_es-sharvard-medium-espeak

## Resumen

vits-es_es-sharvard-medium-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su libreria ONNX de TTS. El modelo original procede de Rhasspy, concretamente de la coleccion piper-voices, en la variante es_ES/sharvard/medium. Su funcion es convertir texto en castellano de Espana (es-ES) en audio inteligible, recibiendo como entrada fonemas generados por espeak-ng en alfabeto IPA.

La relevancia de este empaquetado reside en su formato ONNX, que permite ejecutar la inferencia sin depender de frameworks de entrenamiento pesados, y en su integracion directa con el ecosistema phoonnx, que incluye el plugin ovos-tts-plugin-phoonnx para asistentes de voz OVOS. El repositorio ocupa aproximadamente 0,1 GB, lo que lo hace adecuado para despliegues ligeros en local.

Se trata de un modelo de un solo hablante (la variante "medium" de la voz sharvard) orientado a sintesis de calidad media con baja latencia. No dispone de capacidad de clonacion de voz ni de control expresivo, y su licencia MIT permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | es-ES (castellano de Espana) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial para el entrenamiento. El resultado es un modelo que genera formas de onda directamente a partir de fonemas, sin necesidad de un vocoder separado en la inferencia.

En este caso, el modelo es un reempaquetado del checkpoint original de Rhasspy para piper-voices, no un entrenamiento nuevo. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineamiento o ajuste. La entrada de texto se procesa con espeak-ng para obtener fonemas en IPA, que son los que consume el modelo. Esta dependencia del fonemizador es un detalle critico: si se usa el puerto espyak en lugar de espeak-ng, algunos fonemas pueden diferir y producir pronunciaciones incorrectas.

## Capacidades

- Sintesis de voz a partir de texto en castellano de Espana (es-ES).
- Generacion de audio en formato WAV mediante la API de phoonnx (`synthesize_wav`).
- Entrada basada en fonemas IPA generados por espeak-ng, lo que permite un control preciso de la pronunciacion si se proporcionan fonemas directamente.
- Integracion con OVOS a traves de `ovos-tts-plugin-phoonnx` para asistentes de voz.
- Ejecucion en navegador mediante phoonnx.js (soporte de entrada espeak o unicode).
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso; es exclusivamente un modelo TTS.
- Un solo hablante; no hay control de emocion, velocidad o estilo mas alla de lo que permita el pipeline externo.

## Casos de uso

- Asistentes de voz domoticos con OVOS: el modelo se selecciona en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx` y proporciona respuestas habladas en castellano con latencia baja, adecuado para dispositivos de recursos limitados gracias a su formato ONNX.
- Lectura de notificaciones y alertas en aplicaciones de escritorio o moviles: al ocupar 0,1 GB y ejecutarse sobre ONNX Runtime, puede integrarse en aplicaciones locales para convertir mensajes de texto en audio sin conexion a servicios en la nube.
- Accesibilidad para personas con discapacidad visual: sintesis de contenido web o de documentos en castellano para lectores de pantalla, con la ventaja de que el procesamiento es local y no envia texto a terceros.
- Generacion de audiolibros o podcasts automatizados: el modelo puede sintetizar frases de forma secuencial; al ser un solo hablante, es adecuado para narracion monologa, no para dialogos con voces distintas.
- Pruebas de integracion en pipelines de CI/CD para aplicaciones de voz: al ser un modelo pequeno y ONNX, se puede levantar en contenedores ligeros para validar que el texto de entrada produce audio valido antes de desplegar.
- Prototipado de interfaces conversacionales en castellano: desarrolladores que necesitan una voz es-ES rapida para demos o pruebas de usabilidad pueden usar el modelo con phoonnx sin entrenar ni ajustar nada.
- Sistemas embebidos y edge computing: la combinacion de ONNX y un tamano de repositorio reducido permite desplegarlo en dispositivos con recursos limitados, siempre que se disponga de espeak-ng o del extra de espyak.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repositorio (0,1 GB), el modelo cabe holgadamente en cualquier GPU consumer con al menos 2 GB de VRAM, y probablemente tambien en CPU.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Una GTX 1050 o superior deberia bastar. En CPU, ONNX Runtime es la via principal.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer actuales, dado el tamano reducido del modelo.
- Opciones de despliegue: phoonnx (Python y OVOS), phoonnx.js (navegador). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. La arquitectura VITS esta disenada para inferencia rapida, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto/entrada |
|---|---|---|---|---|---|
| vits-es_es-sharvard-medium-espeak | VITS | es-ES | ONNX | MIT | Fonemas IPA (espeak-ng) |
| Otras voces de piper-voices (p. ej. es_ES otras variantes) | VITS | es-ES | ONNX | MIT (segun upstream) | Fonemas IPA |
| Modelos TTS comerciales en la nube (p. ej. servicios de sintesis) | propietaria | multiidioma | API | propietaria | Texto directo |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas. La comparativa se limita a caracteristicas estructurales.

## Limitaciones y advertencias

- Dependencia critica de espeak-ng: sin el instalado, phoonnx usa espyak, cuyos fonemas pueden diferir y provocar palabras mal pronunciadas. En produccion conviene instalar espeak-ng nativo.
- Un solo hablante y una sola variante idiomatica (es-ES); no cubre otros acentos del castellano ni otros idiomas.
- Sin control de prosodia, emocion ni velocidad mas alla de lo que permita el pipeline externo.
- Riesgo de pronunciacion incorrecta en palabras extranjeras, siglas o neologismos, ya que la conversion a fonemas depende de las reglas de espeak-ng.
- No se dispone de informacion sobre sesgos del dataset de entrenamiento original.
- No se han publicado metricas de calidad (MOS) ni evaluaciones objetivas en la informacion disponible.
- Licencia MIT: permite uso comercial, pero se recomienda verificar la cadena de licencias del upstream (rhasspy/piper-voices) para el checkpoint original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria; conviene probarlo antes de adoptarlo en produccion.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Phoonnx/vits-es_es-sharvard-medium-espeak)
- [Upstream en rhasspy/piper-voices](https://huggingface.co/rhasspy/piper-voices/tree/main/es/es_ES/sharvard/medium)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Repositorio phoonnx.js](https://github.com/TigreGotico/phoonnx.js)
- [Demo en navegador](https://tigregotico.pt/demo)
- [Coleccion VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
