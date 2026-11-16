# Phoonnx/vits-es_es-davefx-medium-espeak

## Resumen

Phoonnx/vits-es_es-davefx-medium-espeak es un modelo de síntesis de voz (text-to-speech) en castellano de España basado en la arquitectura VITS, empaquetado en formato ONNX para su uso con la librería phoonnx. El modelo original procede de Rhasspy (proyecto piper-voices), concretamente de la variante `es_ES/davefx/medium`, y Phoonnx se limita a reempaquetarlo y distribuirlo dentro de su ecosistema de voces ONNX. Su función es convertir texto en español peninsular en audio inteligible con una calidad media, sin necesidad de infraestructura GPU pesada.

La relevancia de este modelo radica en su ligereza y su licencia MIT: el repositorio ocupa apenas 0,1 GB, lo que permite ejecutarlo en CPU en entornos domésticos, dispositivos embebidos o asistentes de voz autoalojados. Está pensado para integrarse en el asistente OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx`, así como en aplicaciones Python que necesiten TTS offline.

No obstante, conviene subrayar que se trata de un artefacto derivado y no de un desarrollo original: no publica datos de entrenamiento, benchmarks ni métricas de calidad propios, y su rendimiento depende enteramente del modelo Piper subyacente. La ficha refleja, por tanto, la información disponible en la model card y en el repositorio de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos ONNX; el modelo se distribuye ya exportado) |
| Idiomas soportados | es-ES (castellano de España) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx (Python), phoonnx.js (navegador) |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decodificador generativo basado en flujos normalizadores y un discriminador adversarial entrenado con la pérdida de entrenamiento adversario (GAN). Este diseño permite generar audio de forma directa desde fonemas sin necesidad de un vocoder separado, lo que reduce la latencia y simplifica el despliegue. La variante "medium" de Piper corresponde a un compromiso entre calidad y velocidad, orientado a ejecución en CPU.

El modelo original fue entrenado por Rhasspy dentro del proyecto piper-voices, pero la model card de Phoonnx no especifica el número de tokens de entrenamiento, la composición del dataset, el origen de las grabaciones ni si se aplicaron técnicas de RLHF o ajuste fino. Tampoco se detallan innovaciones técnicas adicionales más allá de las propias de VITS. La aportación de Phoonnx se limita al empaquetado ONNX y a la integración con su front-end de texto: la normalización y conversión a fonemas se delega en la librería `scriptconv`, que utiliza el fonemizador `EspeakPhonemizer` (instalable mediante el extra `scriptconv[espeak]`) y requiere espeak-ng o su port espyak.

## Capacidades

- Síntesis de voz a partir de texto en castellano de España (es-ES), con salida en formato WAV.
- Conversión de texto a fonemas IPA mediante espeak-ng, con normalización previa del texto a cargo de `scriptconv`.
- Ejecución en CPU y en navegador: phoonnx.js permite inferencia con entrada espeak o unicode en el cliente.
- Integración con el asistente OVOS a través del plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- No soporta tool calling, function calling ni razonamiento multi-paso: es exclusivamente un modelo TTS.
- No dispone de modo thinking, visión, audio de entrada ni capacidades multimodales más allá de la generación de voz.
- Capacidad multilingüe limitada al español peninsular; no se declaran otros idiomas.

## Casos de uso

- Asistentes de voz autoalojados: integración en OVOS como módulo TTS para respuestas habladas en castellano, con despliegue en CPU y sin dependencia de servicios en la nube.
- Lectura de notificaciones y alertas: generación de avisos de voz en sistemas domóticos o de monitorización, donde el modelo ligero (0,1 GB) permite ejecutarse en una Raspberry Pi o un mini-PC.
- Accesibilidad: conversión de texto a audio para personas con discapacidad visual en aplicaciones de escritorio o web, usando phoonnx.js para la síntesis en el navegador.
- Audiolibros y contenido narrado de bajo coste: generación por lotes de locuciones en español peninsular para podcasts internos o material formativo, aceptando la calidad "medium" del modelo.
- Pruebas y prototipado de pipelines TTS: validación de flujos de normalización de texto y fonemización con espeak-ng antes de migrar a modelos de mayor calidad.
- Sistemas embebidos y kioscos interactivos: respuestas de voz offline en terminales de información o puntos de atención, donde la licencia MIT y el tamaño reducido simplifican la distribución.
- Investigación en fonética del español: generación controlada de estímulos de voz a partir de transcripciones IPA para experimentos de percepción del habla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas MOS, WER, latencia ni comparaciones cuantitativas con otros modelos TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 0,1 GB, está diseñado para ejecutarse en CPU sin GPU dedicada.
- GPU recomendadas: no se especifican; cualquier GPU compatible con ONNX Runtime puede acelerar la inferencia, pero no es un requisito.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer, aunque el caso de uso previsto es CPU.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), plugin `ovos-tts-plugin-phoonnx` para OVOS y ONNX Runtime como backend subyacente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Tamano | Licencia | Formato |
|---|---|---|---|---|---|
| Phoonnx/vits-es_es-davefx-medium-espeak | VITS | es-ES | 0,1 GB | MIT | ONNX |
| rhasspy/piper-voices (es_ES/davefx/medium) | VITS | es-ES | no disponible en la informacion | MIT (declarada en la model card de origen) | ONNX / Piper |
| Otros modelos VITS de la coleccion Phoonnx | VITS | varios | variable | MIT (segun la coleccion) | ONNX |

El modelo es esencialmente idéntico al Piper original de Rhasspy; la diferencia estriba en el empaquetado y en la integración con phoonnx y OVOS. No se dispone de datos de rendimiento comparativo entre ambos.

## Limitaciones y advertencias

- Modelo derivado: no aporta entrenamiento propio ni métricas de calidad; su comportamiento depende del Piper original de Rhasspy.
- Calidad "medium": adecuada para aplicaciones de asistencia y lectura, pero inferior a modelos TTS neuronales de mayor tamaño para narración profesional.
- Dependencia de espeak-ng: sin él, es necesario instalar el port espyak, cuyos fonemas difieren parcialmente y pueden provocar errores de pronunciación en algunas palabras.
- Cobertura limitada al español peninsular (es-ES); no se declaran variantes latinoamericanas ni otros idiomas.
- Riesgo de pronunciación incorrecta en palabras extranjeras, siglas, números mal normalizados o texto sin puntuación adecuada.
- No apto para clonación de voz ni para control de estilo, emoción o prosodia más allá de lo que permita el texto de entrada.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda conservar la atribución a Rhasspy y verificar la licencia del repositorio de origen.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema reducido y poca validación comunitaria.
- No se especifican sesgos de voz (género, acento o edad del hablante) más allá de la etiqueta `davefx`.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Phoonnx/vits-es_es-davefx-medium-espeak)
- [Repositorio de origen: rhasspy/piper-voices (es_ES/davefx/medium)](https://huggingface.co/rhasspy/piper-voices/tree/main/es/es_ES/davefx/medium)
- [Colección de modelos VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
- [phoonnx (GitHub)](https://github.com/TigreGotico/phoonnx)
- [scriptconv (GitHub)](https://github.com/TigreGotico/scriptconv)
- [phoonnx.js (GitHub)](https://github.com/TigreGotico/phoonnx.js)
- [Demo en vivo de phoonnx.js](https://tigregotico.pt/demo)
