# Phoonnx/vits-en_us-ljspeech

## Resumen

`Phoonnx/vits-en_us-ljspeech` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Coqui a partir del conjunto de datos LJSpeech y empaquetado en formato ONNX por Phoonnx para su uso con su librería de inferencia `phoonnx`. El modelo convierte texto en inglés estadounidense, representado como fonemas espeak en alfabeto IPA, en audio sintetizado, y está pensado para integrarse en asistentes de voz y sistemas embebidos mediante una única voz preentrenada (`coqui/en-ljspeech-vits`).

El modelo resuelve el problema de la síntesis de voz neuronal de alta calidad en un único paso: VITS combina un codificador de texto, un prior variacional condicionado por alineamientos monotónicos y un decodificador generativo (GAN) entrenado de extremo a extremo, lo que permite generar formas de onda directamente sin vocoder externo. Al distribuirse como ONNX, se puede ejecutar en CPU sin dependencias pesadas de frameworks de aprendizaje profundo, lo que lo hace adecuado para despliegues ligeros.

Su relevancia actual es limitada pero específica: se trata de una voz inglesa monolingüe de una sola hablante (LJSpeech), empaquetada para el ecosistema OVOS/Mycroft y para la librería `phoonnx`, con licencia BSD-3-Clause y un tamaño de repositorio de 0,1 GB. No es un modelo de propósito general ni compite con sistemas TTS multilingües modernos, pero sí ofrece una opción sencilla y de bajo coste para síntesis de voz en inglés dentro de pipelines de asistentes de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, sin ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | en-US (inglés estadounidense) |
| Licencia | BSD-3-Clause (la model card cita también Apache-2.0 para el modelo upstream en la lista de Coqui TTS) |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Autor original | Coqui |
| Empaquetado por | Phoonnx |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz de extremo a extremo que combina un codificador de texto, un prior variacional con alineamiento monotónico (MAS) y un decodificador generativo entrenado con un objetivo adversarial, además de una pérdida de coincidencia espectral. Este diseño permite generar directamente la forma de onda a partir de los fonemas sin necesidad de un vocoder separado, lo que reduce la latencia y simplifica el despliegue. El modelo empaquetado aquí corresponde a la versión `tts_models--en--ljspeech--vits` publicada por Coqui en la release v0.6.1 de su repositorio TTS.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset más allá de LJSpeech (un corpus de una sola hablante en inglés estadounidense, ampliamente utilizado en TTS) ni sobre si se aplicaron técnicas de RLHF o DPO, algo poco habitual en modelos TTS de esta generación. La innovación técnica relevante es el propio empaquetado ONNX para `phoonnx`, que permite ejecutar el modelo en Python y en OVOS, así como en el navegador mediante `phoonnx.js`, con entrada de fonemas espeak o Unicode.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense (en-US).
- Generación de audio en formato WAV mediante `voice.synthesize_wav(text, wav_file)`.
- Entrada basada en fonemas espeak-ng en alfabeto IPA, con normalización de texto previa mediante `scriptconv`.
- Integración con OVOS/Mycroft a través del plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante `phoonnx.js` (voces VITS con entrada espeak o Unicode).
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes: es un modelo puramente TTS.
- No soporta visión, audio de entrada ni modos de pensamiento.
- Monolingüe: únicamente inglés estadounidense.
- Una sola voz disponible: `coqui/en-ljspeech-vits`.

## Casos de uso

- Asistentes de voz domésticos con OVOS/Mycroft: el modelo se integra como plugin TTS (`ovos-tts-plugin-phoonnx`) y permite que el asistente responda en inglés con una voz neuronal sin depender de servicios en la nube, gracias a su ejecución ONNX en CPU.
- Síntesis de voz en aplicaciones de escritorio o servidor en Python: mediante `TTSModelManager` y `voice.synthesize_wav`, se puede generar audio WAV a partir de texto en inglés dentro de scripts o servicios, con una instalación ligera (`pip install --pre phoonnx`).
- Lectura de textos en inglés en aplicaciones web: con `phoonnx.js` y la demo en `tigregotico.pt/demo`, se puede sintetizar voz en el navegador sin backend, útil para lectores de artículos o accesibilidad.
- Generación de avisos y notificaciones pregrabadas: para sistemas que necesitan producir mensajes de voz en inglés de forma dinámica (por ejemplo, alertas de monitorización), el modelo ofrece síntesis rápida y de bajo coste en CPU.
- Prototipado de pipelines TTS: al ser un modelo pequeño (0,1 GB) y con licencia permisiva, sirve para validar arquitecturas de asistentes de voz antes de migrar a modelos más grandes o multilingües.
- Pruebas de integración en entornos embebidos o de recursos limitados: la ejecución ONNX sin framework de deep learning pesado permite desplegarlo en dispositivos con CPU modesta, aunque la calidad y la expresividad estarán limitadas por la voz única de LJSpeech.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 0,1 GB, es probable que quepa en memoria de CPU sin GPU, pero no se proporcionan cifras oficiales.
- GPU recomendadas: no disponible; el modelo está pensado para ejecución en CPU mediante ONNX.
- ¿Cabe en GPU consumer? No se dispone de datos específicos; por tamaño (0,1 GB) cabría en cualquier GPU consumer, pero no hay confirmación oficial.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft, y `phoonnx.js` para navegador.
- Latencia y throughput estimados: no disponible.
- Requiere `espeak-ng` instalado en el sistema (o el extra `phoonnx[espeak]` con el port espyak) para la fonemización.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto / notas |
|---|---|---|---|---|---|
| Phoonnx/vits-en_us-ljspeech | VITS | en-US | ONNX | BSD-3-Clause | Voz única LJSpeech, empaquetado para phoonnx |
| Coqui TTS `tts_models--en--ljspeech--vits` (upstream) | VITS | en-US | Checkpoint Coqui | Apache-2.0 según la lista de Coqui | Modelo original del que deriva este empaquetado |
| Otras voces VITS de la colección Phoonnx | VITS | según voz | ONNX | variable | Misma librería y formato, distintas voces/idiomas |

No se dispone de datos de benchmarks que permitan comparar rendimiento objetivamente con alternativas.

## Limitaciones y advertencias

- Modelo monolingüe: solo sintetiza inglés estadounidense; no soporta otros idiomas.
- Una única voz (hablante de LJSpeech); no hay control de estilo, emoción ni hablante.
- Dependencia de `espeak-ng` para la fonemización; si se usa el port espyak, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- Riesgo de pronunciación incorrecta en palabras fuera del dominio de LJSpeech (nombres propios, siglas, términos técnicos) debido a la fonemización automática.
- No es un modelo de lenguaje: no razona, no responde preguntas ni genera texto; solo sintetiza voz.
- Licencia: la model card indica BSD-3-Clause, pero también cita Apache-2.0 para el modelo upstream en la lista de Coqui TTS; conviene verificar la licencia aplicable antes de uso comercial.
- Sin datos publicados de benchmarks, latencia ni calidad subjetiva (MOS); no se puede garantizar un nivel de calidad concreto en producción.
- El repositorio tiene muy pocas descargas (27) y ningún "like", lo que sugiere poca validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-ljspeech
- Upstream Coqui TTS (release v0.6.1): https://github.com/coqui-ai/TTS/releases/download/v0.6.1_models/tts_models--en--ljspeech--vits.zip
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- scriptconv (normalización y fonemizadores): https://github.com/TigreGotico/scriptconv
- phoonnx.js (navegador): https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
