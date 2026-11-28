# Phoonnx/kitten-tts-nano-0.2

## Resumen

Kitten TTS Nano 0.2 es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura StyleTTS2, desarrollado originalmente por KittenML y empaquetado por Phoonnx para su uso con la libreria ONNX `phoonnx`. El repositorio `Phoonnx/kitten-tts-nano-0.2` no contiene el modelo original, sino una conversion a ONNX optimizada para inferencia ligera, disenada para integrarse en el ecosistema OVOS (Open Voice OS) y en pipelines de sintesis de voz en produccion.

El modelo trabaja exclusivamente con ingles estadounidense (`en-US`) y recibe como entrada fonemas en alfabeto IPA generados mediante espeak-ng, lo que lo desacopla del texto crudo y permite un control preciso de la pronunciacion. Su caracteristica principal es el tamano reducido ("nano"), orientado a despliegues con recursos limitados como dispositivos embebidos, Raspberry Pi o contenedores ligeros.

La relevancia actual del modelo radica en su licencia Apache 2.0, su formato ONNX listo para produccion y su integracion con el plugin `ovos-tts-plugin-phoonnx`, lo que facilita su adopcion en asistentes de voz open source sin depender de servicios cloud. No obstante, la informacion publica disponible es muy escasa: no se detallan parametros, contexto ni datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en formato ONNX) |
| Idiomas soportados | ingles estadounidense (`en-US`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak (alfabeto IPA) |
| Voces disponibles | 8 voces (expr-voice-2-f/m, 3-f/m, 4-f/m, 5-f/m) |
| Libreria de inferencia | phoonnx (Python) |
| Tamano del repo | 0.0 GB (segun Hugging Face, sin datos de pesos en la metadata) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura StyleTTS2, un sistema de sintesis neuronal que combina un codificador de estilo, un decodificador acustico y un vocoder integrado para generar audio de forma end-to-end. StyleTTS2 se caracteriza por su capacidad de transferencia de estilo y por producir habla natural con un coste computacional moderado, lo que encaja con la variante "nano" orientada a inferencia ligera.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas del entrenamiento. El repositorio de Phoonnx es un empaquetado del modelo original de KittenML (`KittenML/kitten-tts-nano-0.2`), por lo que los detalles de entrenamiento corresponden al autor upstream y no se incluyen en la model card proporcionada. La unica innovacion documentada en el empaquetado es el uso de espeak-ng como front-end fonemico y la conversion a ONNX para despliegue multiplataforma.

## Capacidades

- Sintesis de voz a partir de texto en ingles estadounidense (`en-US`).
- Generacion de audio WAV mediante la API `voice.synthesize_wav(text, wav_file)` de phoonnx.
- Ocho voces predefinidas con variacion de genero (femenino/masculino) y estilo expresivo (expr-voice-2 a 5).
- Entrada basada en fonemas IPA generados por espeak-ng, lo que permite control fino de la pronunciacion.
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Normalizacion y conversion de texto a fonemas mediante la libreria `scriptconv`.
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso (es un modelo puramente TTS).
- Capacidades multilingues limitadas al ingles estadounidense.

## Casos de uso

- **Asistentes de voz en OVOS**: el modelo se integra directamente como modulo TTS en `mycroft.conf` mediante `ovos-tts-plugin-phoonnx`, permitiendo respuestas habladas en asistentes open source sin depender de APIs externas.
- **Dispositivos embebidos y de bajo consumo**: al estar en formato ONNX y tener variante "nano", puede ejecutarse en Raspberry Pi o hardware con recursos limitados para interfaces de voz locales.
- **Lectura de notificaciones y alertas**: sintesis de mensajes cortos en ingles para sistemas de monitorizacion, domotica o pipelines de alertas que requieran salida de audio.
- **Generacion de audiolibros o contenido narrado**: uso de las ocho voces disponibles para producir narraciones con distintos estilos expresivos en ingles.
- **Prototipado de interfaces conversacionales**: integracion rapida en aplicaciones Python mediante la API de phoonnx para validar flujos de voz antes de escalar a modelos mayores.
- **Accesibilidad**: conversion de texto a voz para aplicaciones de lectura de pantalla o asistencia a personas con discapacidad visual en entornos angloparlantes.
- **Pruebas de regresion en pipelines TTS**: al ser un modelo ONNX ligero, sirve como referencia rapida en CI/CD para validar front-ends fonemicos y formatos de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repositorio indica un tamano de 0.0 GB en la metadata, sin detallar pesos; por la variante "nano" se espera un consumo muy bajo, pero no hay cifras confirmadas).
- GPU recomendadas: no disponible. Por el formato ONNX y la orientacion ligera, es probable que funcione en CPU, aunque no se confirma en la documentacion.
- Compatibilidad con GPU consumer: no confirmada; el diseno "nano" sugiere que cabria en GPUs de gama baja, pero no hay datos oficiales.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Kitten TTS Nano 0.2 (Phoonnx) | StyleTTS2 | en-US | Apache 2.0 | ONNX | Hugging Face, phoonnx, OVOS |
| KittenML/kitten-tts-nano-0.2 (upstream) | StyleTTS2 | en-US | Apache 2.0 | no disponible | Hugging Face |
| Otros modelos StyleTTS2 en la coleccion Phoonnx | StyleTTS2 | no disponible | no disponible | ONNX | Hugging Face |

No se dispone de datos de rendimiento ni de parametros para establecer una comparativa cuantitativa con alternativas como Piper, Coqui TTS o VITS. La comparativa se limita a la disponibilidad y licencia.

## Limitaciones y advertencias

- **Idioma unico**: solo soporta ingles estadounidense (`en-US`); no es adecuado para otros idiomas sin reentrenamiento o adaptacion.
- **Dependencia de espeak-ng**: la calidad de la sintesis depende del front-end fonemico; la model card advierte que la version `espyak` (port de espeak-ng) puede pronunciar mal algunas palabras respecto a espeak-ng nativo.
- **Informacion tecnica escasa**: no se publican parametros, datos de entrenamiento ni benchmarks, lo que dificulta evaluar su calidad frente a alternativas.
- **Riesgo de alucinacion acustica**: como todo modelo TTS, puede generar prosodia incorrecta o pronunciaciones erroneas en textos ambiguos o fuera de dominio.
- **Sesgos**: no documentados; al entrenarse presumiblemente con voces angloparlantes, puede reflejar sesgos de genero o acento en las voces disponibles.
- **Licencia**: Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo upstream `KittenML/kitten-tts-nano-0.2` y de las dependencias (espeak-ng, scriptconv) antes de produccion.
- **Estado del repositorio**: 173 descargas y 0 likes en el momento de la consulta; proyecto reciente (creado en noviembre de 2026) con poca validacion comunitaria.
- **Sin soporte de texto crudo**: requiere pipeline de fonemizacion previo, lo que anade complejidad operativa frente a modelos TTS end-to-end con texto directo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Phoonnx/kitten-tts-nano-0.2
- Modelo upstream: https://huggingface.co/KittenML/kitten-tts-nano-0.2
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion StyleTTS2 de Phoonnx: https://huggingface.co/collections/Phoonnx/styletts2-6af8ea97037f3d7eaf4b89c7
- Proyecto OVOS (Open Voice OS): no disponible en la informacion proporcionada.
