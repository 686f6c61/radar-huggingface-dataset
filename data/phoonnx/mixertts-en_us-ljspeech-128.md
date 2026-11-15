# Phoonnx/mixertts-en_us-ljspeech-128

## Resumen

MixerTTS en_us_ljspeech_128 es un modelo de síntesis de voz (text-to-speech) desarrollado originalmente por nipponjo en el repositorio `mixer-tts-pytorch` y empaquetado por Phoonnx en formato ONNX para su uso con la librería `phoonnx`. Convierte texto en inglés estadounidense en espectrogramas que posteriormente son transformados en audio por el vocoder `vocos-multi-alvocat-22khz`. El modelo está pensado para integrarse en pipelines de TTS ligeros, incluido el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.

La relevancia de este modelo radica en su empaquetado específico: pesos ONNX listos para inferencia, un front-end fonemizador basado en espeak-ng (fonemas IPA) y una integración directa con `scriptconv` para normalización de texto. No se trata de un modelo de gran escala ni de un sistema TTS neuronal de última generación, sino de una pieza concreta dentro del catálogo de voces MixerTTS de Phoonnx, orientada a despliegues de bajo coste y a asistentes de voz embebidos.

El repositorio tiene un tamaño declarado de 0.0 GB y apenas 34 descargas, lo que sugiere un artefacto compacto y de nicho. La información pública disponible es escasa: la model card no detalla número de parámetros, contexto, composición del dataset de entrenamiento ni resultados de benchmarks, por lo que varios apartados de esta ficha deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MixerTTS (síntesis acústica) + vocoder vocos-multi-alvocat-22khz |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de texto fonemizado, sin ventana declarada) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | en-US (inglés estadounidense) |
| Licencia | other (sin licencia registrada; consultar upstream) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura MixerTTS, definida en el repositorio `github.com/nipponjo/mixer-tts-pytorch`. La entrada no es texto crudo sino fonemas en alfabeto IPA generados por espeak-ng; `phoonnx` se encarga de la normalización y conversión mediante `scriptconv` y su `EspeakPhonemizer` del módulo `scriptconv.phonemizers.mul`. La salida del modelo es un espectrograma que se convierte en audio mediante el vocoder `vocos-multi-alvocat-22khz`, descargado automáticamente junto con la voz.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset (más allá del nombre que referencia LJSpeech, un corpus de habla inglesa de una sola locutora), ni sobre si se aplicaron técnicas de RLHF, DPO u otros ajustes posteriores. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. El identificador `128` en el nombre del modelo sugiere un tamaño de canal o dimensión interna de 128, pero este dato no está confirmado en la documentación proporcionada.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense (en-US).
- Generación de espectrogramas que se convierten en audio de 22 kHz mediante el vocoder asociado.
- Entrada basada en fonemas IPA generados por espeak-ng, lo que permite un control fonético preciso.
- Integración con la librería `phoonnx` en Python y con el ecosistema OVOS mediante `ovos-tts-plugin-phoonnx`.
- Normalización de texto y conversión de script a través de `scriptconv`.
- No se documentan capacidades de tool calling, agentes, razonamiento multietapa, visión, audio de entrada ni modo thinking.
- Capacidad multilingüe limitada al inglés estadounidense.

## Casos de uso

- Asistentes de voz embebidos en OVOS: el modelo se selecciona en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx`, lo que permite dotar de voz a asistentes domésticos sin depender de servicios en la nube.
- Lectura de notificaciones y alertas en aplicaciones de escritorio: al ser un artefacto ONNX compacto, puede sintetizar mensajes cortos en tiempo real con bajo consumo de recursos.
- Generación de audiolibros o podcasts automatizados para contenido en inglés: la entrada fonemizada permite controlar la pronunciación de términos técnicos o nombres propios ajustando los fonemas IPA.
- Pruebas de accesibilidad en interfaces: integración en pipelines de CI para generar muestras de audio y verificar que los textos de la interfaz se pronuncian correctamente.
- Prototipado de sistemas de atención al cliente por voz: sirve como capa TTS en demos de IVR o chatbots telefónicos en inglés, sustituible por un modelo mayor si se requiere calidad de estudio.
- Investigación en fonética computacional: al exponer la ruta texto → fonemas espeak → espectrograma → vocoder, facilita experimentos sobre el impacto de la fonemización en la calidad de la síntesis.
- Generación de voces para videojuegos o prototipos de animación: útil para maquetas rápidas donde prima la ligereza del modelo sobre la naturalidad absoluta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio se declara como 0.0 GB, lo que sugiere un modelo muy pequeño, pero no se confirma la cifra exacta de parámetros.
- GPU recomendadas: no disponible. Por el formato ONNX y el tamaño aparente, debería ejecutarse en CPU sin problemas, pero no hay datos oficiales.
- Compatibilidad con GPU de consumo: probablemente sí en cualquier GPU moderna e incluso en CPU, pero no está documentado.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Phoonnx/mixertts-en_us-ljspeech-128 | MixerTTS + vocos | no disponible | no disponible | other | ONNX | Hugging Face |
| Otros modelos de la colección MixerTTS de Phoonnx | MixerTTS | no disponible | no disponible | other | ONNX | Hugging Face |
| Modelos TTS neuronales de referencia (p. ej. VITS, Piper) | VITS / otros | no disponible en esta ficha | no disponible | varía | ONNX / otros | Hugging Face, GitHub |

No se dispone de datos suficientes para una comparación cuantitativa con alternativas concretas. La colección MixerTTS de Phoonnx incluye otras voces empaquetadas de la misma forma, que serían las alternativas más directas en cuanto a integración y formato.

## Limitaciones y advertencias

- Solo soporta inglés estadounidense (en-US); no se documentan otros idiomas.
- La licencia figura como "other" y la model card indica explícitamente que no hay licencia registrada: es imprescindible consultar la release upstream antes de cualquier uso comercial.
- El modelo depende de espeak-ng para la fonemización; sin él, la alternativa `espyak` puede producir fonemas distintos y provocar pronunciaciones incorrectas en algunas palabras.
- No hay información sobre sesgos, riesgo de alucinación acústica ni calidad subjetiva de la voz (MOS no disponible).
- El identificador del modelo en el ejemplo de código (`nipponjo/mixer-tts-ljspeech-128`) difiere del ID del repositorio (`Phoonnx/mixertts-en_us-ljspeech-128`), lo que puede causar confusión en la integración.
- El repositorio tiene muy pocas descargas (34) y ningún "like", lo que indica poca validación por parte de la comunidad.
- No se documentan límites de longitud de texto de entrada ni comportamiento con textos largos.
- Al ser un modelo de nicho empaquetado por un tercero, la cadena de responsabilidad sobre la calidad y el mantenimiento recae en el upstream (`nipponjo/mixer-tts-pytorch`) y en Phoonnx.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/mixertts-en_us-ljspeech-128
- Repositorio upstream: https://github.com/nipponjo/mixer-tts-pytorch
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Vocoder: https://huggingface.co/Phoonnx/vocos-multi-alvocat-22khz
- Colección MixerTTS: https://huggingface.co/collections/Phoonnx/mixertts-6af8ea927256661d4786e3a8
