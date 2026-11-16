# Phoonnx/vits-en_us-ljs-kakao_enterprise-espeak

## Resumen

Phoonnx/vits-en_us-ljs-kakao_enterprise-espeak es un modelo de síntesis de voz (text-to-speech) de arquitectura VITS, originalmente entrenado por kakao-enterprise y empaquetado por Phoonnx para su uso con la librería ONNX `phoonnx`. El modelo convierte texto en inglés estadounidense en audio, tomando como entrada fonemas espeak en alfabeto IPA. El repositorio contiene los pesos en formato ONNX, con un tamaño aproximado de 0,1 GB, lo que lo hace muy ligero para despliegue en entornos con recursos limitados.

El modelo resuelve el problema de la síntesis de voz en inglés en aplicaciones de asistente por voz, especialmente dentro del ecosistema OVOS (Open Voice OS), donde se integra mediante el plugin `ovos-tts-plugin-phoonnx`. Su relevancia radica en que es un modelo pequeño, con licencia MIT y orientado a inferencia local, lo que facilita su uso en dispositivos de borde o sistemas embebidos sin necesidad de infraestructura de GPU dedicada.

La arquitectura VITS combina un codificador de texto, un decodificador acústico y un generador de forma de onda en un único modelo entrenado de extremo a extremo, lo que permite generar audio de forma directa y eficiente. El modelo está pensado para un único idioma (en-US) y depende de espeak-ng para la fonemización del texto de entrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos ONNX; se desconoce si hay variantes cuantizadas) |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,1 GB |
| Entrada de texto | Fonemas espeak en alfabeto IPA |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS, un modelo generativo de extremo a extremo para síntesis de voz que combina un codificador de texto basado en transformers, un prior variacional, un decodificador acústico y un generador de forma de onda (típicamente un HiFi-GAN) en un único sistema entrenado conjuntamente. Esta arquitectura permite generar audio directamente a partir de fonemas sin necesidad de un vocoder separado, lo que simplifica el despliegue y reduce la latencia.

El modelo original fue entrenado por kakao-enterprise sobre el conjunto de datos LJSpeech (según indica el nombre `ljs` en el identificador), un corpus de audio en inglés estadounidense de una única hablante con aproximadamente 24 horas de grabación. No se dispone de información detallada sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que la model card no proporciona esos datos. La innovación principal de este empaquetado es la conversión a ONNX y la integración con la librería `phoonnx`, que gestiona la normalización de texto y la fonemización mediante `scriptconv` y espeak-ng.

## Capacidades

- Síntesis de voz en inglés estadounidense (en-US) a partir de texto.
- Conversión de texto a fonemas IPA mediante espeak-ng (a través de `scriptconv`).
- Generación de audio en formato WAV mediante la API de `phoonnx` (`voice.synthesize_wav`).
- Integración con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante `phoonnx.js` con entrada espeak o Unicode.
- No soporta tool calling, function calling ni razonamiento multi-paso (es un modelo TTS, no un LLM).
- No soporta visión, audio de entrada ni modo thinking.
- Capacidad multilingüe limitada a en-US exclusivamente.

## Casos de uso

- Asistentes por voz locales: el modelo puede integrarse en OVOS para convertir respuestas de texto en audio en tiempo real, gracias a su tamaño reducido (0,1 GB) y su inferencia ONNX optimizada para CPU.
- Síntesis de voz en dispositivos de borde: al ser un modelo ligero con licencia MIT, es adecuado para Raspberry Pi u otros dispositivos con recursos limitados donde no se dispone de GPU.
- Generación de audiolibros o contenido narrado: se puede usar para convertir texto largo en audio WAV de forma automatizada, con la limitación de una única voz y un solo idioma.
- Pruebas de accesibilidad: integración en aplicaciones que necesitan leer texto en voz alta para usuarios con discapacidad visual, usando la API de `phoonnx` para generar el audio bajo demanda.
- Prototipado de interfaces conversacionales: al ser un modelo pequeño y de código abierto, permite iterar rápidamente en el desarrollo de sistemas de diálogo sin depender de servicios en la nube.
- Demos web de TTS: mediante `phoonnx.js` se puede ejecutar el modelo directamente en el navegador, lo que facilita la creación de demos interactivas sin backend.
- Investigación en síntesis de voz: sirve como baseline ligero para comparar con modelos VITS más grandes o con otras arquitecturas TTS en tareas de evaluación de calidad y latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo ONNX de 0,1 GB, no requiere GPU dedicada; puede ejecutarse en CPU con memoria RAM mínima (menos de 1 GB adicional).
- GPU recomendadas: no es necesario GPU; en caso de usarse, cualquier GPU con soporte ONNX Runtime (por ejemplo, NVIDIA GTX 1050 o superior) puede acelerar la inferencia.
- Cabe en GPU consumer: sí, en cualquier GPU consumer, e incluso en CPU.
- Opciones de despliegue: `phoonnx` (Python), `phoonnx.js` (navegador), OVOS mediante `ovos-tts-plugin-phoonnx`, y ONNX Runtime directamente.
- Latencia y throughput estimados: no disponible en la información proporcionada; al ser un modelo VITS pequeño, se espera una latencia baja en CPU, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Idiomas | Notas |
|---|---|---|---|---|---|---|
| Phoonnx/vits-en_us-ljs-kakao_enterprise-espeak | no disponible | no aplica | MIT | ONNX | en-US | Empaquetado para phoonnx, basado en kakao-enterprise/vits-ljs |
| kakao-enterprise/vits-ljs | no disponible | no aplica | MIT | PyTorch (probablemente) | en-US | Modelo original sin empaquetar para ONNX |
| Coqui TTS (modelos VITS) | variable | no aplica | MPL-2.0 (mayoría) | PyTorch, ONNX | varios | Ecosistema más amplio, pero licencia menos permisiva |
| Piper (modelos VITS) | variable | no aplica | MIT (mayoría) | ONNX | varios | Orientado a dispositivos de borde, con más voces e idiomas |

La comparativa se basa en información general disponible; no se dispone de datos de rendimiento comparativo para este modelo en concreto.

## Limitaciones y advertencias

- El modelo solo soporta inglés estadounidense (en-US); no es multilingüe.
- La calidad de la síntesis depende de la fonemización con espeak-ng; si se usa espyak (el port de espeak-ng incluido en phoonnx), algunos fonemas difieren y pueden producir palabras mal pronunciadas.
- Al ser un modelo entrenado sobre LJSpeech (una única hablante), la voz generada es siempre la misma y no permite selección de hablante.
- Riesgo de alucinación no aplica en el sentido de LLM, pero puede generar pronunciaciones incorrectas para palabras fuera del vocabulario o siglas no normalizadas.
- La licencia MIT permite uso comercial, pero se debe conservar el aviso de copyright original; el modelo upstream declara MIT en su model card.
- No se han publicado métricas objetivas de calidad (MOS, WER) en la información disponible, por lo que se recomienda evaluar la calidad subjetiva antes de usarlo en producción.
- El repositorio tiene muy pocas descargas (18) y ningún like, lo que sugiere que es un empaquetado reciente y poco validado por la comunidad.

## Enlaces

- [Hugging Face: Phoonnx/vits-en_us-ljs-kakao_enterprise-espeak](https://huggingface.co/Phoonnx/vits-en_us-ljs-kakao_enterprise-espeak)
- [Modelo original: kakao-enterprise/vits-ljs](https://huggingface.co/kakao-enterprise/vits-ljs)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Repositorio phoonnx.js](https://github.com/TigreGotico/phoonnx.js)
- [Demo en vivo de phoonnx.js](https://tigregotico.pt/demo)
- [Colección VITS en Hugging Face](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
