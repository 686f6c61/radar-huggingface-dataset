# Phoonnx/vits-fa_ir-ganji-espeak

## Resumen

vits-fa_ir-ganji-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su libreria ONNX de TTS. El modelo original fue entrenado por SadeghK y proviene del repositorio `SadeghK/persian-text-to-speech`, concretamente de la variante `farsi/ganji`. Está especializado en persa (fa-IR) y acepta como entrada fonemas espeak en alfabeto IPA.

El modelo resuelve el problema de la sintesis de voz en persa dentro del ecosistema phoonnx/OVOS, permitiendo integrar una voz persa en asistentes y aplicaciones mediante un runtime ONNX ligero. El repositorio ocupa aproximadamente 0,1 GB, lo que lo hace adecuado para despliegues en entornos con recursos limitados.

Su relevancia radica en su empaquetado para phoonnx, que facilita su uso tanto en Python como en el asistente OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, y en el navegador mediante phoonnx.js. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | persa (fa-IR) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo end-to-end que combina un encoder de texto, un prior variacional, un decoder basado en flujos normalizadores y un discriminador adversarial para el entrenamiento. VITS sintetiza audio directamente a partir de fonemas sin necesidad de un modelo acustico y un vocoder separados.

El autor del modelo original es SadeghK, y los pesos provienen del repositorio `SadeghK/persian-text-to-speech`, en la ruta `farsi/ganji`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o fine-tuning especifico. La entrada de texto se procesa mediante `EspeakPhonemizer` de `scriptconv_copyleft.phonemizers.mul`, que convierte el texto persa a fonemas espeak-ng en IPA antes de pasarlos al modelo. Phoonnx actua como capa de empaquetado y ejecucion sobre ONNX.

## Capacidades

- Sintesis de voz (text-to-speech) en persa (fa-IR) a partir de texto.
- Conversion de texto a fonemas espeak-ng en alfabeto IPA mediante scriptconv.
- Generacion de audio en formato WAV mediante la API de phoonnx (`synthesize_wav`).
- Integracion en asistentes OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador mediante phoonnx.js (demo en tigregotico.pt/demo).
- Normalizacion y conversion de texto mediante scriptconv.
- No soporta tool calling, agentes, vision ni audio de entrada.
- No dispone de modo thinking ni razonamiento multi-paso.

## Casos de uso

- Asistentes de voz en persa: integracion en OVOS mediante `ovos-tts-plugin-phoonnx` configurando la voz `piper_community/SadeghK/ganji` en `mycroft.conf`, permitiendo respuestas habladas en persa en un asistente domestico.
- Lectura de contenido en persa: sintesis de articulos, noticias o documentos para conversion a audio, usando la API de Python de phoonnx con salida WAV.
- Accesibilidad: generacion de audio para personas con discapacidad visual que consumen contenido en persa, con un modelo ligero (0,1 GB) desplegable en local.
- Aplicaciones web de TTS: uso de phoonnx.js para sintetizar voz persa directamente en el navegador sin servidor, con la demo disponible en tigregotico.pt/demo.
- Prototipado de interfaces conversacionales en persa: su tamano reducido y runtime ONNX permiten iterar rapidamente en entornos de desarrollo con recursos limitados.
- Sistemas embebidos o de bajo consumo: el modelo ONNX de 0,1 GB puede ejecutarse en dispositivos con poca memoria, aunque no se dispone de datos de latencia.
- Generacion de locuciones para contenido multimedia en persa: sintesis por lotes de frases para videos, audiolibros o tutoriales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB, por lo que la huella de memoria es reducida.
- GPU recomendadas: no disponible; al ser un modelo ONNX ligero, no requiere GPU dedicada necesariamente.
- Compatibilidad con GPU consumer: probable en cualquier GPU consumer moderna dada la baja huella del modelo, aunque no hay datos oficiales.
- Opciones de despliegue: phoonnx (Python), `ovos-tts-plugin-phoonnx` (OVOS), phoonnx.js (navegador).
- Latencia y throughput estimados: no disponible.
- Dependencia externa: requiere espeak-ng instalado (`apt install espeak-ng`) o el extra `phoonnx[espeak]` (port espyak).

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-fa_ir-ganji-espeak | VITS | fa-IR | 0,1 GB | Apache 2.0 | ONNX | Hugging Face |
| Otras voces VITS de la coleccion Phoonnx | VITS | varios | no disponible | segun modelo | ONNX | Hugging Face |
| SadeghK/persian-text-to-speech (upstream) | VITS | fa-IR | no disponible | Apache 2.0 | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta persa (fa-IR); no es multilingue.
- La entrada debe ser fonemas espeak en IPA; el texto se normaliza y convierte mediante scriptconv, lo que introduce dependencia de espeak-ng.
- Si se usa el port espyak en lugar de espeak-ng, algunos fonemas difieren y la voz puede pronunciar mal ciertas palabras, segun advierte la model card.
- No se dispone de informacion sobre sesgos del dataset de entrenamiento ni sobre tasas de alucinacion (no aplica en el mismo sentido que en LLM, pero puede producir pronunciaciones incorrectas).
- No hay datos publicados de calidad objetiva (MOS, WER) ni benchmarks.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo upstream en `SadeghK/persian-text-to-speech`.
- El modelo tiene solo 20 descargas y 0 likes, por lo que su validacion por la comunidad es muy limitada.
- No se dispone de informacion sobre cuantizaciones disponibles ni sobre latencia en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-fa_ir-ganji-espeak
- Modelo upstream: https://huggingface.co/SadeghK/persian-text-to-speech/tree/main/farsi/ganji
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
