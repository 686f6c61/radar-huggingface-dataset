# Phoonnx/vits-en_us-hal9000_denoised-espeak

## Resumen

`vits-en_us-hal9000_denoised-espeak` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado en formato ONNX para su uso con la librería Python `phoonnx`. El modelo original fue creado por el autor dividebysandwich dentro del repositorio de voces para Piper (`piper-voice-models`), y esta versión concreta ha sido reempaquetada por Phoonnx para su ecosistema. Se trata de una voz en inglés estadounidense (`en-US`) denominada HAL9000-denoised, con un proceso de denoising aplicado sobre el audio de entrenamiento original.

El modelo resuelve el problema de la síntesis de voz local y ligera: convierte texto en audio mediante fonemas IPA generados por espeak-ng, lo que permite ejecución en CPU sin dependencias de infraestructura pesada. Su relevancia radica en que se integra en el stack de asistentes de voz OVOS (Open Voice OS) a través del plugin `ovos-tts-plugin-phoonnx`, y en que puede ejecutarse también en el navegador mediante `phoonnx.js`. El tamaño del repositorio es de aproximadamente 0,1 GB, lo que lo sitúa en la categoría de modelos TTS compactos.

La licencia es MIT, lo que facilita su uso comercial. El modelo no es un modelo de lenguaje: no genera texto ni razona, sino que transforma secuencias de fonemas en formas de onda de audio. Por tanto, sus capacidades y limitaciones deben evaluarse exclusivamente en el ámbito de la síntesis de voz.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada por frase) |
| Tipos de cuantización | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | inglés estadounidense (en-US) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Autor original de la voz | dividebysandwich |
| Empaquetado | Phoonnx |
| Tamaño del repositorio | ~0,1 GB |
| Pipeline | text-to-speech |
| Librería | phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decodificador generativo basado en flujos normalizadores y un discriminador adversarial entrenado con aprendizaje adversario. El modelo aprende directamente la distribución de formas de onda condicionada por la secuencia de fonemas, evitando pipelines separados de alineamiento y vocoder. En este caso, la entrada no es texto crudo sino fonemas IPA producidos por espeak-ng, lo que implica que el front-end fonético es externo al modelo.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o ajuste fino adicional. El nombre del modelo indica que se aplicó un proceso de denoising sobre el audio de la voz original HAL9000 (un timbre sintético inspirado en el ordenador HAL 9000 de *2001: Una odisea del espacio*). El repositorio original de dividebysandwich (`piper-voice-models/HAL9000-denoised`) es la fuente de los pesos y del proceso de entrenamiento; esta versión de Phoonnx solo los empaqueta en ONNX y añade la integración con su librería.

## Capacidades

- Síntesis de voz en inglés estadounidense (`en-US`) a partir de texto normalizado.
- Conversión de texto a fonemas IPA mediante espeak-ng (front-end `EspeakPhonemizer` de `scriptconv`).
- Generación de audio en formato WAV mediante `voice.synthesize_wav(text, wav_file)`.
- Ejecución en CPU y en entornos sin GPU gracias al formato ONNX.
- Integración con OVOS como plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante `phoonnx.js` (soporte de entrada espeak o unicode).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo exclusivamente TTS.
- No soporta visión, audio de entrada ni modo thinking.
- Capacidad multilingüe limitada a `en-US`.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se selecciona en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx` y permite que un asistente doméstico hable en inglés con una voz sintética característica, sin depender de servicios en la nube.
- Síntesis de voz en aplicaciones de escritorio: al ejecutarse sobre ONNX y en CPU, puede integrarse en aplicaciones Python que necesiten leer texto en voz alta sin GPU ni conexión a internet.
- Prototipado de interfaces conversacionales: un desarrollador puede generar respuestas habladas en inglés para probar flujos de diálogo multi-turno antes de invertir en una voz comercial.
- Demos y aplicaciones web: mediante `phoonnx.js` y la demo en `tigregotico.pt/demo`, se puede ofrecer síntesis de voz en el navegador sin backend de inferencia.
- Contenido narrativo o de ficción: la voz HAL9000-denoised es adecuada para personajes de ciencia ficción, audiolibros amateur o videojuegos que requieran un timbre artificial reconocible.
- Accesibilidad: lectura de texto en pantalla para usuarios angloparlantes en entornos de bajos recursos, donde no es viable un modelo TTS de gran tamaño.
- Pruebas de regresión en pipelines de TTS: al ser un modelo pequeño y determinista en su interfaz, sirve para validar integraciones de `phoonnx` y `scriptconv` en CI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en CPU; en GPU, el modelo ONNX de ~0,1 GB cabe holgadamente en cualquier GPU con más de 1 GB de memoria.
- GPU recomendadas: no se requieren; cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) puede ejecutarlo, pero el modelo está pensado para CPU.
- Cabe en GPU consumer: sí, en todas las GPU modernas, e incluso en sistemas embebidos con suficiente RAM.
- Opciones de despliegue: `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS), `phoonnx.js` (navegador). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Dependencia externa: es necesario instalar `espeak-ng` (`apt install espeak-ng`) o el extra `phoonnx[espeak]`; sin él, el front-end fonético no funciona correctamente.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Contexto / entrada | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-en_us-hal9000_denoised-espeak | VITS | en-US | MIT | ONNX | fonemas espeak IPA | Hugging Face (Phoonnx) |
| Otras voces Piper (piper-voice-models) | VITS | varios | MIT (según voz) | ONNX | fonemas espeak IPA | GitHub dividebysandwich |
| Voces VITS de la colección Phoonnx | VITS | varios | MIT (según voz) | ONNX | fonemas espeak IPA | Hugging Face (Phoonnx) |
| Coqui TTS (modelos VITS) | VITS | varios | MPL 2.0 / otras | PyTorch | texto o fonemas | Coqui / Hugging Face |

La comparación se limita a modelos de la misma familia (VITS empaquetados para Piper/Phoonnx), ya que no se dispone de datos de benchmarks que permitan comparar calidad objetiva con alternativas como Coqui TTS o modelos neuronales más grandes. La principal diferencia frente a otras voces Piper es el timbre HAL9000 y el proceso de denoising aplicado al audio.

## Limitaciones y advertencias

- Solo soporta inglés estadounidense (`en-US`); no es multilingüe.
- Requiere `espeak-ng` instalado; con el port `espyak` algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- Es un modelo TTS, no un modelo de lenguaje: no razona, no genera texto ni soporta tool calling.
- Riesgo de pronunciación incorrecta en palabras fuera del dominio de entrenamiento, siglas, nombres propios o números mal normalizados por el front-end.
- No se dispone de información sobre sesgos de voz (género, acento, prosodia) ni sobre la composición del dataset de entrenamiento.
- El proceso de denoising puede haber alterado características prosódicas; no hay evaluación objetiva publicada (MOS, CMOS) en la información disponible.
- Aunque la licencia es MIT, el autor indica que "the upstream release states its terms": conviene verificar las condiciones del repositorio original de dividebysandwich antes de un uso comercial a gran escala.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de robustez en producción.
- La fecha de creación indicada (2026-11-16) es futura respecto a la información habitual; conviene verificar la vigencia del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-hal9000_denoised-espeak
- Repositorio original de la voz: https://github.com/dividebysandwich/piper-voice-models/tree/main/HAL9000-denoised
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
