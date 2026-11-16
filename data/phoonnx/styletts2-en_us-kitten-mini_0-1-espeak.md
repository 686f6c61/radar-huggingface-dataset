# Phoonnx/styletts2-en_us-kitten-mini_0.1-espeak

## Resumen

`Phoonnx/styletts2-en_us-kitten-mini_0.1-espeak` es un modelo de sintesis de voz (text-to-speech) en ingles estadounidense basado en la arquitectura StyleTTS2, desarrollado originalmente por KittenML como `KittenML/kitten-tts-mini-0.1` y reempaquetado por Phoonnx en formato ONNX para su uso con la libreria `phoonnx`, una biblioteca de TTS en Python orientada a entornos OVOS (OpenVoiceOS).

El modelo resuelve la conversion de texto a audio en ingles con un front-end fonemico basado en espeak-ng (fonemas en alfabeto IPA), lo que lo hace adecuado para asistentes de voz, sistemas de lectura y sintesis embebida. El repositorio ocupa aproximadamente 0,2 GB, lo que indica un modelo compacto pensado para inferencia ligera y despliegue en dispositivos con recursos limitados.

Su relevancia actual radica en que expone un modelo TTS de calidad en un formato ONNX portable y con licencia Apache 2.0, facilitando su integracion en pipelines de sintesis de voz sin depender de frameworks de aprendizaje profundo pesados. Incluye ocho voces predefinidas con variantes femeninas y masculinas (identificadas como `expr-voice-2-f` a `expr-voice-5-m`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no generativo de texto) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura StyleTTS2, un sistema de sintesis de voz neuronal que combina un codificador de estilo y un decodificador acustico para generar habla con control de prosodia y expresividad. La entrada de texto se convierte en fonemas IPA mediante espeak-ng (a traves de `EspeakPhonemizer` de `scriptconv_copyleft.phonemizers.mul`), que se alimentan al modelo para producir la forma de onda.

No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de horas de audio, la composicion del corpus ni si se aplicaron tecnicas de RLHF o ajuste fino especifico. El modelo upstream `KittenML/kitten-tts-mini-0.1` es la referencia para estos detalles, pero no se han proporcionado en la informacion disponible. El reempaquetado por Phoonnx consiste en la conversion a ONNX y la integracion con el front-end fonemico de espeak-ng.

## Capacidades

- Sintesis de voz en ingles estadounidense (en-US) a partir de texto plano.
- Generacion de audio en formato WAV mediante la API de `phoonnx`.
- Ocho voces predefinidas con variantes femeninas y masculinas (`expr-voice-2-f`, `expr-voice-2-m`, `expr-voice-3-f`, `expr-voice-3-m`, `expr-voice-4-f`, `expr-voice-4-m`, `expr-voice-5-f`, `expr-voice-5-m`).
- Front-end fonemico basado en espeak-ng con alfabeto IPA.
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo TTS, no un LLM).
- No soporta vision ni audio de entrada.
- Capacidad multilingue limitada: solo en-US.

## Casos de uso

- Asistentes de voz para OVOS: el modelo se integra directamente como modulo TTS en `mycroft.conf` mediante `ovos-tts-plugin-phoonnx`, permitiendo sintesis local sin servicios en la nube y con latencia baja gracias al formato ONNX.
- Lectura de textos en aplicaciones de accesibilidad: sintesis de documentos y contenido web en ingles para lectores de pantalla, con seleccion de voz segun preferencia del usuario entre las ocho voces disponibles.
- Generacion de avisos y notificaciones habladas: en sistemas embebidos o domoticos que requieran anuncios de voz en ingles, el tamano reducido del repositorio (0,2 GB) facilita el despliegue en dispositivos con almacenamiento limitado.
- Prototipado de interfaces conversacionales: desarrolladores que necesiten un TTS rapido de integrar en Python pueden usar `phoonnx` con `pip install --pre phoonnx` y el extra `[espeak]` para evitar dependencias del sistema.
- Generacion de audio para pruebas automatizadas: en pipelines de CI/CD que validen respuestas de voz de un asistente, el modelo permite generar audio de referencia de forma reproducible con las voces predefinidas.
- Sintesis offline en entornos sin conectividad: al ejecutarse localmente con ONNX y espeak-ng, el modelo es adecuado para aplicaciones de campo, kioscos o dispositivos edge que no pueden depender de APIs de TTS en la nube.
- Creacion de contenido de audio basico: narracion de textos cortos en ingles para videos, podcasts o materiales educativos, con la posibilidad de alternar entre voces masculinas y femeninas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el tamano del repositorio (0,2 GB) sugiere que el modelo cabe holgadamente en GPUs consumer con 4 GB o menos, e incluso podria ejecutarse en CPU.
- GPU recomendadas: no se especifican; por el tamano, cualquier GPU con al menos 2-4 GB de VRAM deberia ser suficiente (GTX 1650, RTX 3050, RTX 4090, A100, H100).
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer moderna, y probablemente en CPU para inferencia en tiempo real o casi real.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS de este tipo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Tamano repo |
|---|---|---|---|---|---|
| Phoonnx/styletts2-en_us-kitten-mini_0.1-espeak | StyleTTS2 | en-US | Apache 2.0 | ONNX | 0,2 GB |
| KittenML/kitten-tts-mini-0.1 (upstream) | StyleTTS2 | en-US | Apache 2.0 | no disponible | no disponible |
| Otros modelos de la coleccion StyleTTS2 de Phoonnx | StyleTTS2 | no disponible | no disponible | ONNX | no disponible |

No se dispone de datos de rendimiento comparativo (benchmarks, MOS, latencia) entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles estadounidense (en-US); no es multilingue.
- Requiere espeak-ng instalado en el sistema o el extra `phoonnx[espeak]`; con la alternativa espyak algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- Es un modelo TTS, no un LLM: no genera texto, no razona, no soporta tool calling ni agentes.
- No se dispone de informacion sobre sesgos de voz (genero, acento, edad) ni sobre la diversidad del corpus de entrenamiento.
- Riesgo de prosodia incorrecta o pronunciacion erronea en palabras ambiguas, siglas o nombres propios, dado el front-end fonemico basado en reglas de espeak-ng.
- Licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo upstream `KittenML/kitten-tts-mini-0.1` y de espeak-ng, que puede tener condiciones propias (GPL para espeak-ng en algunos contextos de distribucion).
- El modelo tiene pocas descargas (24) y ningun "like", lo que sugiere poca validacion por parte de la comunidad; conviene evaluar la calidad de sintesis antes de usarlo en produccion.
- No hay datos publicados de benchmarks, MOS ni latencia que permitan garantizar calidad en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/styletts2-en_us-kitten-mini_0.1-espeak
- Modelo upstream: https://huggingface.co/KittenML/kitten-tts-mini-0.1
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion StyleTTS2 de Phoonnx: https://huggingface.co/collections/Phoonnx/styletts2-6af8ea97037f3d7eaf4b89c7
