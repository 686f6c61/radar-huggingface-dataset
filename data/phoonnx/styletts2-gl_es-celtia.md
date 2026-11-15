# Phoonnx/styletts2-gl_es-celtia

## Resumen

styletts2-gl_es-celtia es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura StyleTTS2, desarrollado originalmente por Proxecto Nós y empaquetado por Phoonnx en formato ONNX para su uso con la librería `phoonnx`. El modelo está especializado en gallego (`gl-ES`) y toma como entrada fonemas generados por el fonemizador Cotovia, lo que lo hace adecuado para aplicaciones de voz en ese idioma.

El modelo se distribuye como un paquete listo para producción dentro del ecosistema phoonnx, que permite cargarlo y sintetizar audio en formato WAV mediante una API en Python, así como integrarlo en asistentes de voz basados en OVOS a través del plugin `ovos-tts-plugin-phoonnx`. Su licencia Apache 2.0 facilita el uso comercial sin restricciones adicionales.

La relevancia de este modelo radica en cubrir una lengua con recursos limitados como el gallego dentro de un stack moderno de TTS, con clonación de voz a partir de audio de referencia y una integración directa en pipelines de asistentes de voz open source.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | StyleTTS2 |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | gallego (`gl`, `gl-ES`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

StyleTTS2 es una arquitectura de síntesis de voz que combina un generador acústico basado en difusión con un discriminador de estilo y un modelo de duración fonética, orientada a producir habla natural con control de estilo y prosodia. El modelo empaquetado por Phoonnx se distribuye en formato ONNX para inferencia portable, y su entrada textual se procesa mediante el fonemizador Cotovia (`CotoviaPhonemizer` de `scriptconv.phonemizers.gl`), que normaliza el texto y lo convierte a fonemas del alfabeto Cotovia.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. El modelo upstream es `proxectonos/Nos_StyleTTS2-Celtia-GL`, desarrollado por Proxecto Nós, y esta versión es un empaquetado para la librería phoonnx.

## Capacidades

- Síntesis de voz (text-to-speech) en gallego a partir de texto de entrada.
- Fonemización mediante Cotovia, con normalización de texto previa vía `scriptconv`.
- Clonación de voz a partir de audio de referencia (el modelo clona un hablante desde audio de referencia).
- Salida de audio en formato WAV mediante `synthesize_wav`.
- Integración con asistentes de voz OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada ni modo de razonamiento (thinking mode), ya que es un modelo exclusivamente TTS.

## Casos de uso

- Asistentes de voz en gallego: integración en OVOS mediante `ovos-tts-plugin-phoonnx` para dotar de voz sintética a asistentes domésticos o de escritorio en gallego, seleccionando la voz `proxectonos/celtia-styletts2` en `mycroft.conf`.
- Lectura de contenido accesible: conversión de artículos, noticias o documentos a audio en gallego para usuarios con discapacidad visual o para consumo en formato podcast.
- Clonación de voz para doblaje o locución: uso del audio de referencia para generar una voz personalizada y sintetizar guiones en gallego con esa identidad vocal.
- Sistemas de atención al cliente telefónica: generación de respuestas habladas en gallego dentro de IVR o chatbots de voz, aprovechando la licencia Apache 2.0 para despliegue comercial.
- Aplicaciones educativas: síntesis de material didáctico y ejercicios de pronunciación en gallego, con salida WAV fácilmente integrable en plataformas de e-learning.
- Prototipado rápido de interfaces de voz: al estar empaquetado en ONNX y con una API Python sencilla (`TTSModelManager`), permite iterar rápidamente en demos y pruebas de concepto sin infraestructura pesada.
- Localización de contenido multimedia: generación de pistas de audio en gallego para vídeos, tutoriales o presentaciones a partir de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el tamaño del repositorio es de 0,8 GB, lo que sugiere un modelo relativamente ligero.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el formato ONNX permite inferencia en CPU, aunque no se documentan requisitos mínimos.
- Opciones de despliegue: librería `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ejecución ONNX en general.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Contexto |
|---|---|---|---|---|---|
| styletts2-gl_es-celtia | StyleTTS2 | gallego | Apache 2.0 | ONNX | no aplica |
| proxectonos/Nos_StyleTTS2-Celtia-GL | StyleTTS2 | gallego | Apache 2.0 | no disponible | no aplica |
| Otros modelos de la colección StyleTTS2 de Phoonnx | StyleTTS2 | varios | según modelo | ONNX | no aplica |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado únicamente en gallego (`gl-ES`); no se documenta soporte multilingüe.
- La entrada textual debe pasar por el fonemizador Cotovia; un texto mal normalizado o fuera de ese alfabeto puede degradar la calidad de la síntesis.
- No se dispone de información sobre sesgos de género, acento o hablante en el dataset de entrenamiento.
- Riesgo de alucinación acústica o artefactos en la síntesis ante textos atípicos, aunque no se documenta explícitamente.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo upstream `proxectonos/Nos_StyleTTS2-Celtia-GL` y de las dependencias (`scriptconv`, `phoonnx`).
- El número de descargas (29) y la ausencia de likes sugieren un modelo poco validado por la comunidad; conviene evaluar la calidad de síntesis antes de usarlo en producción.
- No se documentan requisitos de hardware ni latencias, por lo que el rendimiento en producción debe medirse empíricamente.

## Enlaces

- [Hugging Face: Phoonnx/styletts2-gl_es-celtia](https://huggingface.co/Phoonnx/styletts2-gl_es-celtia)
- [Modelo upstream: proxectonos/Nos_StyleTTS2-Celtia-GL](https://huggingface.co/proxectonos/Nos_StyleTTS2-Celtia-GL)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Colección StyleTTS2 de Phoonnx](https://huggingface.co/collections/Phoonnx/styletts2-6af8ea97037f3d7eaf4b89c7)
