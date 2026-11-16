# Phoonnx/vits-it-mai_male-graphemes

## Resumen

vits-it-mai_male-graphemes es un modelo de sintesis de voz (text-to-speech) de arquitectura VITS, originalmente desarrollado por Coqui y empaquetado en formato ONNX por Phoonnx para su uso con la libreria `phoonnx`. El modelo genera voz masculina en italiano a partir de texto, tomando como entrada caracteres (graphemes) directamente, sin necesidad de un fonemizador basado en fonemas IPA. Es la version empaquetada del modelo `tts_models--it--mai_male--vits` de Coqui TTS v0.6.1.

El modelo resuelve el problema de sintesis de voz en italiano para aplicaciones de asistencia por voz, lectura de texto y sistemas conversacionales, con la ventaja de distribuirse en ONNX, lo que facilita su despliegue en entornos sin PyTorch y en dispositivos con recursos limitados. El repositorio ocupa aproximadamente 0,1 GB, lo que indica un modelo compacto y adecuado para inferencia en CPU.

Su relevancia actual radica en que permite integrar TTS italiano de forma ligera en asistentes de voz open source como OVOS, sin depender del stack completo de Coqui TTS, que ya no recibe mantenimiento activo. La licencia Apache-2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | italiano (`it`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | caracteres (graphemes) |
| Frente de texto | `GraphemePhonemizer` de scriptconv |
| Tamano del repositorio | ~0,1 GB |
| Voz | masculina (mai_male) |
| Dataset de origen | M-AILABS |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo end-to-end que combina un encoder de texto, un prior variacional, un decoder basado en normalizing flows y un decoder de audio (HiFi-GAN) en un unico sistema entrenado de forma adversarial. VITS produce audio de forma directa desde texto, sin necesidad de un vocoder separado en inferencia.

El modelo original fue entrenado por Coqui sobre el corpus M-AILABS en italiano, una voz masculina. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables tipicamente a TTS). El empaquetado por Phoonnx convierte los pesos a ONNX y define el frente de texto como graphemes, de modo que el texto se normaliza con `scriptconv` y se pasa directamente como caracteres al modelo.

## Capacidades

- Sintesis de voz (text-to-speech) en italiano a partir de texto.
- Voz masculina, con salida en formato WAV mediante `voice.synthesize_wav`.
- Entrada basada en caracteres (graphemes), sin requerir transcripcion fonetica manual.
- Normalizacion de texto y conversion de script mediante `scriptconv`.
- Integracion como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`).
- Ejecucion en ONNX, lo que permite inferencia sin PyTorch.
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso (es un modelo exclusivamente TTS).

## Casos de uso

- Asistentes de voz en italiano: integracion como motor TTS en OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurando la voz `coqui/it-mai_male-vits` en `mycroft.conf`, adecuado para asistentes domesticos open source.
- Lectura de texto en aplicaciones de accesibilidad: sintesis de articulos, noticias o documentos en italiano para lectores de pantalla, gracias a su ejecucion ligera en ONNX y su tamano reducido (~0,1 GB).
- Generacion de audiolibros o contenido narrado: produccion por lotes de audio en italiano con voz masculina consistente, usando `voice.synthesize_wav` para escribir ficheros WAV.
- Sistemas de respuesta por voz en telefonia o IVR: sintesis de respuestas dinamicas en italiano en entornos sin GPU, al poder ejecutarse en CPU con ONNX.
- Prototipado rapido de interfaces conversacionales: su instalacion via `pip install --pre phoonnx` y su API sencilla permiten integrar TTS italiano en pocas lineas de codigo.
- Notificaciones y avisos hablados en aplicaciones IoT: el modelo cabe en dispositivos con recursos limitados y no requiere el stack completo de Coqui TTS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser un modelo ONNX de ~0,1 GB, es previsible que requiera muy poca memoria, pero no se confirma en la informacion.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no confirmada; el formato ONNX sugiere posible ejecucion en CPU.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| vits-it-mai_male-graphemes (este) | VITS | it | Apache-2.0 | ONNX | Hugging Face (Phoonnx) |
| Coqui TTS `tts_models--it--mai_male--vits` | VITS | it | Apache-2.0 | Checkpoint Coqui | GitHub releases Coqui TTS v0.6.1 |
| Otros modelos VITS de la coleccion Phoonnx | VITS | varios | segun modelo | ONNX | Hugging Face (coleccion VITS de Phoonnx) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta italiano; no es multilingue.
- Voz unica masculina (`mai_male`); no hay variantes de voz en este repositorio.
- Al ser un modelo TTS, puede presentar errores de pronunciacion en palabras extranas, siglas o numeros complejos, ya que la entrada es por graphemes.
- Riesgo de artefactos o prosodia poco natural en frases muy largas o con puntuacion atipica (comportamiento tipico de VITS, no confirmado en la informacion).
- El modelo upstream de Coqui TTS ya no recibe mantenimiento activo; el empaquetado en ONNX corre a cargo de Phoonnx.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del dataset M-AILABS subyacente.
- El repositorio tiene muy pocas descargas (18) y ningun like, lo que sugiere poca validacion por parte de la comunidad.
- No se dispone de informacion sobre sesgos de la voz ni sobre evaluaciones de calidad (MOS).

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-it-mai_male-graphemes
- Modelo upstream (Coqui TTS v0.6.1): https://github.com/coqui-ai/TTS/releases/download/v0.6.1_models/tts_models--it--mai_male--vits.zip
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
