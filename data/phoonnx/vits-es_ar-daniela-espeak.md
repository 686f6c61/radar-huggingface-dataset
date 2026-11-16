# Phoonnx/vits-es_ar-daniela-espeak

## Resumen

vits-es_ar-daniela-espeak es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su librería ONNX homónima. El modelo original procede de larcanio/piper-voices y corresponde a la voz `es-AR_daniela`, orientada al español rioplatense (Argentina). Su función es convertir texto en audio inteligible con prosodia natural a partir de fonemas generados por espeak-ng en alfabeto IPA.

El modelo se distribuye como un artefacto ONNX de aproximadamente 0,1 GB, lo que lo sitúa en la categoría de TTS ligero apto para inferencia en CPU y dispositivos de recursos limitados. No es un modelo de lenguaje generativo: es un sintetizador acústico condicionado por fonemas, por lo que su alcance se limita a la conversión texto-a-hablado en el idioma y variante indicados.

Su relevancia actual radica en la integración con el ecosistema phoonnx y OVOS (Open Voice OS), que permite desplegar voces TTS en asistentes de voz y aplicaciones de accesibilidad sin depender de servicios en la nube. La licencia MIT facilita su uso comercial y su modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | es-AR (español de Argentina) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de síntesis de voz que combina un codificador de texto, un prior variacional, un decodificador acústico y un discriminador adversarial entrenado con pérdidas de reconstrucción y adversariales. El modelo genera formas de onda directamente a partir de fonemas, sin necesidad de un vocoder externo separado. La entrada de texto se procesa mediante espeak-ng, que convierte el texto en fonemas IPA antes de alimentar el modelo.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de ajuste como RLHF o DPO (no aplicables típicamente a TTS). El modelo procede del repositorio larcanio/piper-voices, que agrupa voces compatibles con Piper, y ha sido reempaquetado para phoonnx sin cambios documentados en los pesos. La normalización y conversión de texto se delega en la librería scriptconv, que emplea `EspeakPhonemizer` para la fonemización.

## Capacidades

- Síntesis de voz a partir de texto en español rioplatense (es-AR).
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Fonemización basada en espeak-ng con alfabeto IPA.
- Integración como plugin TTS en OVOS (`ovos-tts-plugin-phoonnx`).
- Ejecución en navegador mediante phoonnx.js (con entrada espeak o unicode).
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje.
- No dispone de modo thinking, visión ni audio de entrada.

## Casos de uso

- Asistentes de voz en OVOS: el modelo se selecciona como módulo TTS en `mycroft.conf` y permite respuestas habladas en español argentino dentro de un asistente local, sin depender de APIs externas.
- Accesibilidad y lectura de pantalla: integración en aplicaciones que convierten texto a voz para usuarios con discapacidad visual, aprovechando el tamaño reducido (0,1 GB) y la inferencia en CPU.
- Sistemas de megafonía y avisos automatizados: generación de anuncios pregrabados o dinámicos en español rioplatense para transporte, comercio o industria, con licencia MIT que permite uso comercial.
- Prototipado de interfaces conversacionales: desarrollo de demos y pruebas de concepto de IVR o chatbots de voz en español, usando phoonnx en Python para sintetizar respuestas rápidamente.
- Síntesis en el navegador: despliegue mediante phoonnx.js para aplicaciones web que necesitan TTS sin backend, con la demo pública en tigregotico.pt/demo como referencia.
- Generación de contenido audiovisual localizado: producción de narraciones o doblajes en variante argentina para vídeos, pódcast o audiolibros de bajo coste.
- Investigación en TTS: uso como línea base VITS en español para experimentos de fonemización, prosodia o comparación con otros sintetizadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 0,1 GB, es apto para ejecución en CPU sin GPU dedicada.
- GPU recomendadas: no se especifican; cualquier GPU con soporte ONNX Runtime puede ejecutarlo, aunque no es necesario para un modelo de este tamaño.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en sistemas sin GPU.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), OVOS mediante `ovos-tts-plugin-phoonnx`, y ONNX Runtime de forma directa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato |
|---|---|---|---|---|---|
| vits-es_ar-daniela-espeak | VITS | es-AR | 0,1 GB | MIT | ONNX |
| Otras voces de larcanio/piper-voices | VITS | multiples | variable | MIT (segun upstream) | ONNX |
| Modelos TTS comerciales en la nube | no disponible | multiples | no disponible | propietaria | API |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo cubre español rioplatense (es-AR); no soporta otros idiomas ni variantes dialectales.
- La calidad de pronunciación depende de espeak-ng; con el port espyak algunos fonemas difieren y pueden producir palabras mal pronunciadas.
- Es un sintetizador acústico, no un modelo de lenguaje: no razona, no responde preguntas ni mantiene conversaciones por sí mismo.
- Riesgo de prosodia artificial o entonación limitada en textos largos o con puntuación compleja, inherente a modelos VITS de este tamaño.
- No se documentan sesgos específicos, pero al derivar de un corpus de voz concreto puede reflejar características del hablante original.
- La licencia MIT permite uso comercial, pero se recomienda verificar los términos del release upstream en larcanio/piper-voices.
- Requiere instalar espeak-ng o el extra `phoonnx[espeak]` para la fonemización; sin ello, el modelo no puede procesar texto.

## Enlaces

- [Hugging Face: Phoonnx/vits-es_ar-daniela-espeak](https://huggingface.co/Phoonnx/vits-es_ar-daniela-espeak)
- [Upstream: larcanio/piper-voices](https://huggingface.co/larcanio/piper-voices)
- [Colección VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Repositorio phoonnx.js](https://github.com/TigreGotico/phoonnx.js)
- [Demo en vivo](https://tigregotico.pt/demo)
