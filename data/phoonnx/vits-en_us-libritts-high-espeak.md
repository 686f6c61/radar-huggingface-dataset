# Phoonnx/vits-en_us-libritts-high-espeak

## Resumen

vits-en_us-libritts-high-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su libreria ONNX de TTS. El modelo original procede de Rhasspy, concretamente de la voz `en_US/libritts/high` del repositorio piper-voices, y Phoonnx lo ha reempaquetado para que pueda ejecutarse directamente con su runtime Python y con el ecosistema OVOS (Open Voice OS). El modelo esta pensado para sintetizar habla en ingles estadounidense a partir de fonemas espeak en alfabeto IPA.

La relevancia de este modelo reside en su naturaleza ligera y su formato ONNX, que facilita el despliegue en entornos con recursos limitados, incluidos dispositivos de borde y asistentes de voz embebidos. Al estar empaquetado especificamente para phoonnx, se integra con el plugin `ovos-tts-plugin-phoonnx` y con la cadena de normalizacion de texto de scriptconv, lo que simplifica su uso en pipelines de voz sin necesidad de infraestructura adicional.

El repositorio ocupa aproximadamente 0,1 GB y se distribuye bajo licencia MIT. El modelo solo soporta ingles (`en-US`) y requiere espeak-ng (o el port espyak) para la fonemizacion del texto de entrada. No se han publicado datos de benchmarks ni metricas de calidad en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | no disponible (formato ONNX empaquetado) |
| Idiomas soportados | ingles (`en-US`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Tamano del repositorio | ~0,1 GB |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema de sintesis de voz end-to-end que combina un encoder de texto, un prior variacional, un decoder basado en flujos normalizadores y un discriminador adversarial para el entrenamiento. VITS genera formas de onda directamente a partir de fonemas sin necesidad de un vocoder separado, lo que reduce la latencia y la complejidad del pipeline. El modelo original fue entrenado por Rhasspy sobre el corpus LibriTTS en su configuracion "high" (mayor calidad), y Phoonnx lo ha convertido a ONNX para su ejecucion con su libreria.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO, ya que se trata de un modelo TTS y no de un modelo de lenguaje. La innovacion principal de este empaquetado es la integracion con scriptconv para la normalizacion de texto y la fonemizacion mediante espeak-ng, asi como la compatibilidad con el plugin de OVOS para asistentes de voz.

## Capacidades

- Sintesis de voz en ingles estadounidense (`en-US`) a partir de texto plano.
- Generacion de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Fonemizacion de entrada mediante espeak-ng (o el port espyak), con salida en alfabeto IPA.
- Integracion con el ecosistema OVOS a traves del plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en Python mediante la libreria phoonnx y en navegador mediante phoonnx.js.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de modo thinking, vision ni audio de entrada.
- Capacidad multilingue limitada exclusivamente al ingles.

## Casos de uso

- Asistentes de voz embebidos: el modelo puede integrarse en OVOS para sintetizar respuestas habladas en ingles con baja latencia, gracias a su formato ONNX ligero y su empaquetado especifico para el plugin de TTS.
- Lectura de textos en aplicaciones de accesibilidad: se puede usar para convertir articulos o notificaciones en audio WAV mediante la API de phoonnx, adecuado para pantallas de lectura y lectores de pantalla.
- Generacion de avisos y notificaciones por voz: en sistemas de domotica o IoT, el modelo sintetiza mensajes cortos en ingles sin necesidad de conexion a la nube, al ejecutarse localmente sobre ONNX.
- Pruebas de integracion en pipelines de CI/CD: al ser un modelo pequeno (~0,1 GB) y con licencia MIT, se puede incluir en tests automatizados de sintesis de voz sin coste de licencia.
- Prototipado rapido de interfaces conversacionales: desarrolladores que necesiten una voz en ingles para demos o MVPs pueden cargarla con phoonnx y el plugin de OVOS en pocos pasos.
- Educacion y aprendizaje de idiomas: el modelo puede generar pronunciaciones en ingles estadounidense a partir de fonemas IPA, util para herramientas de practica de pronunciacion.
- Sintesis en navegador: mediante phoonnx.js, se puede ejecutar la voz en el cliente para aplicaciones web que requieran TTS sin backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de un modelo ONNX de ~0,1 GB, es probable que quepa en memoria de CPU sin GPU dedicada, pero no se confirma en la informacion.
- GPU recomendadas: no disponible; el modelo esta disenado para ejecucion en CPU mediante ONNX Runtime.
- Compatibilidad con GPU de consumo: no confirmada; por tamano, es plausible que funcione en cualquier GPU moderna, pero no hay datos oficiales.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, phoonnx.js para navegador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Tamano |
|---|---|---|---|---|---|
| vits-en_us-libritts-high-espeak (este) | VITS | en-US | MIT | ONNX | ~0,1 GB |
| Otras voces de piper-voices (p. ej. en_US-lessac) | VITS | en-US | MIT (segun upstream) | ONNX | no disponible |
| Modelos TTS comerciales (p. ej. Amazon Polly) | no disponible | multiidioma | propietaria | API | no disponible |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta ingles estadounidense (`en-US`); no es multilingue.
- Requiere espeak-ng o el port espyak para la fonemizacion; sin ellos, el pipeline no funciona correctamente.
- Algunos fonemas de espyak difieren de los de espeak-ng, lo que puede provocar pronunciaciones incorrectas en ciertas palabras.
- No es un modelo de lenguaje: no soporta razonamiento, codigo, tool calling ni agentes.
- No se han publicado benchmarks de calidad (MOS, inteligibilidad) en la informacion disponible, por lo que se desconoce su rendimiento real frente a otras voces.
- La licencia MIT permite uso comercial, pero se recomienda verificar la licencia upstream de Rhasspy/piper-voices para confirmar compatibilidad.
- Riesgo de alucinacion no aplica en el sentido de modelos de lenguaje, pero puede haber errores de pronunciacion en palabras fuera del dominio de entrenamiento.
- El modelo esta empaquetado para phoonnx; su uso fuera de esa libreria puede requerir conversion adicional.

## Enlaces

- [Hugging Face: Phoonnx/vits-en_us-libritts-high-espeak](https://huggingface.co/Phoonnx/vits-en_us-libritts-high-espeak)
- [Repositorio upstream: rhasspy/piper-voices/en/en_US/libritts/high](https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/libritts/high)
- [Libreria phoonnx (GitHub)](https://github.com/TigreGotico/phoonnx)
- [Libreria scriptconv (GitHub)](https://github.com/TigreGotico/scriptconv)
- [phoonnx.js (GitHub)](https://github.com/TigreGotico/phoonnx.js)
- [Demo en vivo de phoonnx.js](https://tigregotico.pt/demo)
- [Coleccion VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
