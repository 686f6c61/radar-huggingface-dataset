# Phoonnx/vits-en_us-kristin-espeak

## Resumen

vits-en_us-kristin-espeak es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su uso con su librería de TTS sobre ONNX. El modelo original procede del repositorio agentvibes/piper-custom-voices, desarrollado por agentvibe, y ha sido adaptado para funcionar con el ecosistema phoonnx, que incluye integración con OVOS (Open Voice OS) y ejecución en navegador mediante phoonnx.js.

El modelo está especializado en inglés estadounidense (en-US) y utiliza fonemas espeak en alfabeto IPA como entrada de texto, lo que implica que requiere el programa espeak-ng (o el port espyak) para la fonemización previa. Se distribuye en formato ONNX con un tamaño de repositorio de 0,1 GB, lo que lo hace adecuado para despliegues ligeros en entornos con recursos limitados.

Su relevancia radica en su integración con el stack phoonnx/OVOS para asistentes de voz open source, permitiendo síntesis local sin dependencia de servicios en la nube. La licencia Apache 2.0 facilita su uso comercial, aunque la información pública disponible sobre el modelo es limitada (19 descargas, 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica contexto de texto) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | en-US (inglés estadounidense) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un encoder de texto, un prior variacional, un decoder basado en flujos normalizadores y un discriminador adversarial para entrenamiento. Emplea aprendizaje adversarial junto con modelado variacional para generar waveforms directamente a partir de fonemas, sin necesidad de un vocoder separado. El modelo acepta fonemas espeak en alfabeto IPA como entrada de texto.

No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o ajuste fino específico. El modelo original proviene del repositorio agentvibes/piper-custom-voices, pero la model card no detalla el proceso de entrenamiento ni los datos utilizados. La innovación principal del empaquetado es la conversión a ONNX para inferencia ligera y su integración con la librería phoonnx y el front-end de texto scriptconv.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés estadounidense a partir de texto de entrada.
- Conversión de texto a fonemas espeak en alfabeto IPA mediante scriptconv (EspeakPhonemizer).
- Generación de audio en formato WAV mediante la API de phoonnx (`voice.synthesize_wav`).
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Ejecución en navegador mediante phoonnx.js (con entrada espeak o unicode).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step ni otras modalidades (visión, audio de entrada).

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se integra como plugin TTS (`ovos-tts-plugin-phoonnx`) y permite sintetizar respuestas del asistente sin conexión a servicios en la nube, seleccionando la voz `piper_community/agentvibe/en-US_kristin` en la configuración.
- Síntesis de voz en aplicaciones Python: mediante `TTSModelManager` de phoonnx se puede cargar la voz y generar archivos WAV para narración de contenido, audiolibros o avisos, con un peso de repositorio de solo 0,1 GB.
- Síntesis en el navegador: usando phoonnx.js se puede ejecutar la voz en cliente web (demo en tigregotico.pt/demo), útil para aplicaciones web que requieran TTS sin backend.
- Prototipado de interfaces de voz: al ser un modelo ligero en ONNX y con licencia Apache 2.0, es adecuado para experimentar con pipelines TTS en entornos de desarrollo con recursos limitados.
- Generación de audio para pruebas automatizadas: la API programática permite integrar la síntesis en tests o pipelines de CI que necesiten audio sintético en inglés.
- Sistemas embebidos o de bajo consumo: el formato ONNX y el tamaño reducido del repositorio facilitan el despliegue en dispositivos con restricciones de memoria, siempre que se disponga de espeak-ng para la fonemización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio pesa 0,1 GB, lo que sugiere un modelo ligero apto para CPU.
- GPU recomendadas: no disponible; por el tamaño del modelo, es probable que funcione en CPU y en GPUs consumer, pero no se documenta.
- ¿Cabe en consumer GPU?: no disponible de forma explícita; el tamaño del repositorio (0,1 GB) indica que sí es viable en hardware modesto.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), plugin OVOS (`ovos-tts-plugin-phoonnx`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Contexto | Notas |
|---|---|---|---|---|---|---|
| vits-en_us-kristin-espeak | VITS | en-US | ONNX | Apache 2.0 | no aplica | Empaquetado para phoonnx/OVOS |
| Otros modelos VITS de la colección Phoonnx | VITS | variable | ONNX | variable | no aplica | Misma librería y pipeline |
| Voces Piper custom (agentvibes/piper-custom-voices) | VITS (Piper) | en-US y otras | ONNX | Apache 2.0 (según upstream) | no aplica | Origen del modelo |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés estadounidense (en-US); no es multilingüe.
- Requiere espeak-ng instalado para la fonemización; sin él, el extra `phoonnx[espeak]` usa el port espyak, cuyos fonemas difieren y pueden provocar pronunciaciones incorrectas.
- No se documentan sesgos específicos, pero al ser un modelo TTS entrenado con datos no especificados, puede heredar sesgos de pronunciación o prosodia del corpus original.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero puede producir pronunciaciones erróneas en palabras fuera del dominio de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del upstream (agentvibes/piper-custom-voices) y de espeak-ng, que puede tener su propia licencia (GPL para espeak-ng).
- Información pública muy limitada: 19 descargas y 0 likes, sin benchmarks ni detalles de entrenamiento, lo que dificulta evaluar su calidad en producción.
- No se documentan limitaciones de longitud de texto de entrada; el rendimiento puede degradarse en textos muy largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-kristin-espeak
- Repositorio upstream: https://huggingface.co/agentvibes/piper-custom-voices
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
