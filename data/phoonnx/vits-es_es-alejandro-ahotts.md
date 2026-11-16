# Phoonnx/vits-es_es-alejandro-ahotts

## Resumen

vits-es_es-alejandro-ahotts es un modelo de síntesis de voz (text-to-speech) en castellano de Espana, empaquetado por Phoonnx a partir del modelo original HiTZ/TTS-es_alejandro desarrollado por el centro HiTZ. Se trata de un modelo VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) convertido a formato ONNX para su uso con la librería phoonnx, orientada a despliegue ligero en Python y en el ecosistema OVOS.

El modelo resuelve la conversión de texto a voz para la variante es-ES con una única voz identificada como `hitz/es_alejandro-vits`. La entrada de texto no es texto crudo, sino fonemas en alfabeto IPA generados por el fonemizador AhoTTS (`AhoTTSPhonemizer` de `scriptconv_copyleft.phonemizers.eu`), lo que condiciona el pipeline de uso: el texto debe normalizarse y fonemizarse antes de la inferencia.

Su relevancia actual radica en que ofrece una alternativa TTS en castellano con licencia Apache 2.0, empaquetada en ONNX (0,1 GB de repositorio) y con integración directa en asistentes de voz basados en OVOS. No se dispone de información publicada sobre arquitectura interna detallada, número de parámetros ni datos de entrenamiento más allá de lo indicado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica en TTS; segmentación por fonemas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | es-ES (castellano de Espana) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas ahotts en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |

## Arquitectura y entrenamiento

La arquitectura es VITS, un modelo generativo end-to-end que combina un encoder de texto, un prior variacional, un decoder basado en flujos normales y un discriminador adversarial entrenado con aprendizaje adversario. La model card no detalla la configuración interna (número de capas, dimensión oculta, canales del decoder) ni el número de parámetros del modelo.

El entrenamiento corresponde al modelo original HiTZ/TTS-es_alejandro, desarrollado por HiTZ Center. No se dispone de información publicada en la documentación proporcionada sobre el volumen de datos de entrenamiento, la composición del corpus, el hablante de referencia ni si se aplicaron etapas de ajuste fino con preferencias. El empaquetado de Phoonnx se limita a la conversión a ONNX y a la integración del front-end fonético AhoTTS, sin cambios de arquitectura declarados.

## Capacidades

- Síntesis de voz en castellano de Espana (es-ES) a partir de texto fonemizado en IPA.
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Una única voz disponible: `hitz/es_alejandro-vits`.
- Integración como plugin TTS en OVOS (`ovos-tts-plugin-phoonnx`) configurable desde `mycroft.conf`.
- Normalización y conversión de texto a fonemas delegada a `scriptconv` con el fonemizador AhoTTS.
- No se declaran capacidades de clonación de voz, control de prosodia por etiquetas, emoción, multilingüismo ni tool calling.

## Casos de uso

- Asistentes de voz en OVOS: el modelo se instala como plugin `ovos-tts-plugin-phoonnx` y se selecciona la voz en `mycroft.conf`, permitiendo respuestas habladas en castellano en asistentes domésticos autoalojados.
- Lectura de notificaciones y alertas: integración en sistemas de monitorización que conviertan mensajes de texto en avisos de audio mediante `synthesize_wav`, con un repositorio de solo 0,1 GB adecuado para dispositivos con almacenamiento limitado.
- Accesibilidad para personas con discapacidad visual: generación de audio a partir de contenido textual en aplicaciones de escritorio o web que ejecuten Python y puedan cargar el modelo ONNX.
- Locución de contenidos en pipelines de publicación: conversión por lotes de artículos o resúmenes a audio en castellano para podcasts o boletines internos, aprovechando la licencia Apache 2.0 para uso comercial.
- Pruebas de integración continua de sistemas de voz: al ser un modelo ONNX pequeño, puede incorporarse en tests automatizados que verifiquen la cadena texto-fonemas-audio sin depender de servicios externos.
- Prototipado de interfaces conversacionales: desarrollo de demos de IVR o chatbots de voz en es-ES donde se requiera una dependencia ligera y de código abierto antes de escalar a un TTS de mayor calidad.
- Investigación en fonética computacional: uso del front-end AhoTTS y del modelo VITS como referencia para experimentos de conversión grafema-fonema y síntesis en castellano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el tamaño del repositorio (0,1 GB) sugiere un modelo compacto que puede ejecutarse en CPU sin GPU dedicada.
- GPU recomendadas: no se especifican; al ser un modelo ONNX de pequeño tamaño, no requiere GPU para funcionar.
- Compatibilidad con GPU de consumo: previsiblemente sí en cualquier GPU de consumo moderna e incluso en CPU, aunque no hay cifras oficiales publicadas.
- Opciones de despliegue: phoonnx (Python) y el plugin OVOS `ovos-tts-plugin-phoonnx`; el formato ONNX permite otros runtimes compatibles, aunque no se documentan en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Contexto/entrada |
|---|---|---|---|---|---|
| vits-es_es-alejandro-ahotts (este modelo) | VITS | es-ES | Apache 2.0 | ONNX | fonemas IPA (ahotts) |
| HiTZ/TTS-es_alejandro (upstream) | VITS | es-ES | Apache 2.0 | no disponible en la informacion | fonemas IPA (ahotts) |
| Otros modelos VITS de la coleccion Phoonnx | VITS | varios | segun modelo | ONNX | segun modelo |

No se dispone de datos de rendimiento ni de parámetros para establecer una comparación cuantitativa con alternativas como Piper, Coqui TTS o modelos TTS multilingües; la comparación se limita a la relación con el modelo upstream y con el resto de la colección VITS de Phoonnx.

## Limitaciones y advertencias

- Una sola voz y un solo idioma (es-ES); no cubre otras variantes del castellano ni otras lenguas.
- La entrada debe ser texto fonemizado con AhoTTS; el uso directo de texto crudo requiere el pipeline de `scriptconv`, lo que añade dependencias (`scriptconv[eu]`).
- No se documentan sesgos del hablante ni características demográficas de la voz; no hay evaluación publicada de sesgos.
- Riesgo de alucinación acústica y errores de pronunciación en palabras fuera del dominio de entrenamiento, nombres propios y extranjerismos, al no disponerse de métricas publicadas.
- Sin datos publicados de calidad (MOS), inteligibilidad ni robustez ante ruido o texto atípico.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo upstream HiTZ/TTS-es_alejandro y de las dependencias del fonemizador AhoTTS antes de producción.
- El modelo está empaquetado para phoonnx; su uso fuera de esa librería requiere gestionar manualmente la entrada fonémica y el grafo ONNX.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-es_es-alejandro-ahotts
- Modelo upstream: https://huggingface.co/HiTZ/TTS-es_alejandro
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
