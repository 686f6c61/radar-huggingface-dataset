# Phoonnx/vits-en_gb-alba-medium

## Resumen

vits-en_gb-alba-medium es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo genera audio a partir de texto en inglés británico (en-GB) y se distribuye como un artefacto ONNX de aproximadamente 0,1 GB, lo que lo sitúa en la categoría de modelos TTS ligeros aptos para ejecución en CPU.

El problema que resuelve es la síntesis de voz local, sin dependencia de servicios en la nube y con latencia baja, orientada a asistentes de voz y sistemas embebidos. Su integración principal es el stack OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx`, aunque también puede usarse directamente desde Python con la librería phoonnx o en el navegador con phoonnx.js.

La relevancia actual del modelo es acotada: se trata de un empaquetado de una voz Piper ya existente, con 27 descargas y sin datos de benchmarks publicados. Su interés radica en la licencia MIT, el tamaño reducido y la posibilidad de ejecución completamente offline, más que en innovaciones arquitectónicas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada por fonemas) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | en-GB (inglés británico) |
| Licencia | MIT |
| Formato de pesos | ONNX (artefacto de ~0,1 GB en el repositorio) |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un encoder de texto condicionado por alineamiento monotónico, un decoder generativo basado en normalizing flows y un discriminador adversarial entrenado con pérdidas de reconstrucción y de adversario. El modelo original fue entrenado por Rhasspy como parte de la colección Piper, y esta versión es un reempaquetado para la librería phoonnx, no un reentrenamiento.

La entrada del modelo son fonemas espeak en alfabeto IPA, generados por espeak-ng (o por el port espyak incluido en el extra `phoonnx[espeak]`). El front-end de texto lo gestiona la librería scriptconv, que normaliza el texto y lo convierte a fonemas mediante `EspeakPhonemizer` del módulo `scriptconv.phonemizers.mul`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; la model card no los documenta.

## Capacidades

- Síntesis de voz a partir de texto en inglés británico (en-GB), con salida en formato WAV.
- Generación de audio mediante inferencia ONNX, ejecutable en CPU sin GPU.
- Integración con el stack OVOS a través del plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Uso desde Python mediante `TTSModelManager` y el método `synthesize_wav`.
- Uso en navegador mediante phoonnx.js, con entrada por espeak o por Unicode.
- Normalización y conversión de texto a fonemas delegada a scriptconv.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking: es exclusivamente un modelo TTS.
- Capacidad multilingüe limitada a en-GB; no se documentan otras variantes de inglés ni otros idiomas en este artefacto.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se integra como plugin TTS en `mycroft.conf` y permite sintetizar respuestas del asistente sin conexión a internet, con latencia baja gracias a la inferencia ONNX en CPU.
- Síntesis de voz en dispositivos embebidos y Raspberry Pi: el tamaño de ~0,1 GB y la ejecución sin GPU lo hacen adecuado para hardware con recursos limitados donde no cabe un modelo TTS de mayor tamaño.
- Lectura de notificaciones y alertas en aplicaciones de escritorio: la API de Python permite generar WAVs al vuelo para mensajes cortos en inglés británico.
- Síntesis en el navegador con phoonnx.js: la demo en tigregotico.pt/demo muestra la generación de voz del lado del cliente, útil para aplicaciones web que necesitan TTS sin backend.
- Generación de audiolibros o contenido narrado en inglés británico: la voz Alba medium de Piper está pensada para narración con calidad media, adecuada para prototipos y contenido no crítico.
- Pruebas de integración en pipelines de CI/CD para sistemas de voz: al ser un artefacto ONNX pequeño y con licencia MIT, se puede incluir en tests automatizados de síntesis sin coste de licencia.
- Accesibilidad en interfaces: lectura de texto en pantalla para usuarios con discapacidad visual en entornos de habla inglesa británica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está diseñado para ejecución en CPU mediante ONNX Runtime.
- GPU recomendadas: no se documentan; el modelo no requiere GPU.
- ¿Cabe en consumer GPU? Sí, pero no es necesario; puede ejecutarse en CPU.
- Opciones de despliegue: librería phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, phoonnx.js para navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no son aplicables a un modelo TTS).
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Dependencia externa: espeak-ng (o el port espyak incluido en `phoonnx[espeak]`) para la fonemización.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Tamaño | Notas |
|---|---|---|---|---|---|---|
| vits-en_gb-alba-medium (este) | VITS | en-GB | MIT | ONNX | ~0,1 GB | Empaquetado para phoonnx, ejecución CPU |
| Otras voces Piper en-GB (p. ej. en_GB-alan, en_GB-jenny) | VITS | en-GB | MIT (según Piper) | ONNX | ~0,1 GB | Mismo origen Rhasspy, distintas voces |
| Coqui TTS (modelos VITS) | VITS | multilingüe | MPL 2.0 / otras | PyTorch | variable | Mayor ecosistema, requiere más recursos |
| Kokoro TTS | StyleTTS2 / híbrida | en y otros | Apache 2.0 | ONNX / PyTorch | ~0,08-0,3 GB | Alternativa ligera reciente, no directamente comparable en licencia y origen |

No se dispone de datos de rendimiento comparativo (MOS, RTF) en la información proporcionada para este modelo.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al ser una voz sintética entrenada por Rhasspy, puede reflejar sesgos prosódicos del corpus original, no especificado.
- Riesgo de alucinación: en TTS se traduce en pronunciaciones incorrectas o artefactos de audio, especialmente con palabras fuera del vocabulario o con fonemas que difieren entre espeak-ng y espyak (la propia model card advierte que con espyak algunas palabras pueden pronunciarse mal).
- Limitaciones de idioma: solo en-GB; no soporta otros idiomas ni variantes regionales del inglés.
- Dependencia de espeak-ng: sin esta herramienta instalada, la fonemización falla o requiere el extra `phoonnx[espeak]`, con posibles discrepancias fonéticas.
- Restricciones de licencia: MIT permite uso comercial, pero la licencia upstream se declara en la model card de rhasspy/piper-voices; conviene verificar la cadena de licencias antes de producción.
- Caveat para producción: 27 descargas y 0 likes indican adopción muy baja; no hay evidencia de validación en producción ni benchmarks de calidad (MOS). El modelo es un reempaquetado, no una mejora sobre Piper.
- No apto para tareas de razonamiento, código, visión o agentes; su uso está restringido a síntesis de voz.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-en_gb-alba-medium
- Upstream Piper (voz original): https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_GB/alba/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS para phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
