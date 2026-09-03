# borisbat/dasllama-tts

## Resumen

dasLLAMA text-to-speech es un paquete de modelos de síntesis de voz convertidos a formato GGUF, servidos por el motor de inferencia dasLLAMA, escrito íntegramente en daslang y compilado JIT. El repositorio incluye tres modelos de la familia StyleTTS2 —KittenTTS nano, KittenTTS mini y Kokoro-82M— junto con dos paquetes de datos de front-end (normalización, etiquetado gramatical y conversión grafema-fonema) que eliminan la dependencia de herramientas externas como espeak-ng o phonemizer.

El proyecto resuelve el problema de desplegar síntesis de voz de alta calidad con un pipeline autocontenido: el front-end de texto es datos, no código, y los modelos se sirven mediante una API compatible con OpenAI (`/v1/audio/speech`). La relevancia actual radica en que ofrece una alternativa ligera y reproducible a los servicios comerciales de TTS, con pesos en f32 que se cuantizan a Q8_0 automáticamente en la primera carga. El modelo está orientado exclusivamente al inglés y su licencia es por archivo, con términos que varían según el componente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 (KittenTTS nano 0.8, KittenTTS mini 0.8, Kokoro-82M v1.0) |
| Parametros totales | 73.983.664 (suma de los tres modelos: nano ~15M, mini ~74M, kokoro ~82M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | f32 en el repositorio; Q8_0 generado automaticamente en primera carga |
| Idiomas soportados | en (ingles) |
| Licencia | per-file: Apache-2.0 (KittenTTS, Kokoro, g2p), BSD-2-Clause (CMUdict), CC BY-SA 4.0 (tagger) |
| Formato de pesos | GGUF (f32), safetensors no incluido |

## Arquitectura y entrenamiento

Los tres modelos comparten la arquitectura StyleTTS2, un sistema de síntesis basado en diffusion probabilistic model con codificador de estilo y decodificador adversarial. KittenTTS nano y mini son variantes de menor tamaño de esta arquitectura, mientras que Kokoro-82M es la implementación de referencia con 82 millones de parámetros y 54 voces incluidas. Los pesos originales provienen de KittenML (ONNX) y hexgrad (PyTorch), convertidos a GGUF mediante scripts del harness de dasLLAMA.

El front-end de texto es un pipeline de tres etapas: un normalizador basado en los lexicones US-English gold y silver de misaki 0.9.4, un etiquetador gramatical (averaged-perceptron PTB tagger) entrenado sobre UD English-EWT y prosa de Project Gutenberg, y un conversor grafema-fonema que combina CMUdict 0.7a con el modelo GRU de g2p_en 2.1.0. Todo el conjunto se reconstruye con el script `build_tts_data.das` y se valida contra las implementaciones de referencia bloque a bloque.

## Capacidades

- Síntesis de voz en inglés a 24 kHz con tres modelos de distinto tamaño (nano, mini y 82M).
- Ocho voces para KittenTTS (expr-voice-2-m a expr-voice-5-f, con alias como Bella o Jasper) y 54 voces para Kokoro (af_heart, bf_emma, am_adam, etc.).
- Front-end de texto completo integrado: normalización, etiquetado POS y conversión grafema-fonema sin dependencias externas.
- API compatible con OpenAI para síntesis de audio (`POST /v1/audio/speech`).
- Endpoint `GET /v1/stats` que lista las voces disponibles del modelo servido.
- Cuantización automática a Q8_0 en la primera carga, con el archivo f32 como referencia.

## Casos de uso

- Generación de audiolibros: el modelo puede convertir texto largo en voz natural a 24 kHz, con voces consistentes gracias a los packs de voces de Kokoro, adecuado para producción de contenido editorial.
- Asistentes de voz en inglés: la API compatible con OpenAI permite integrar síntesis de voz en asistentes conversacionales con un cambio mínimo de endpoint.
- Accesibilidad web: conversión de artículos o noticias a audio en tiempo real, con latencia baja gracias al tamaño reducido de KittenTTS nano (59 MB en f32).
- Doblaje de vídeo y multimedia: las 54 voces de Kokoro ofrecen variedad de timbres para proyectos de vídeo, con control fino sobre la entonación mediante el front-end de texto.
- Pruebas automatizadas de sistemas de voz: el pipeline determinista y reproducible permite generar audio de referencia para validar sistemas de reconocimiento de voz.
- Educación de idiomas: generación de ejemplos de pronunciación en inglés con diferentes voces, útil para aplicaciones de aprendizaje de lenguas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye una suite de pruebas bajo `modules/dasLLAMA/tests/test_tts_*.das` que verifica la paridad bloque a bloque contra las implementaciones de referencia, pero no hay métricas objetivas de calidad de voz (MOS, etc.) ni comparativas con otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada: los tres modelos son pequeños (59 MB, 296 MB y 353 MB en f32), por lo que caben en cualquier GPU con al menos 1 GB de VRAM, incluidas GPUs integradas.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA o Vulkan; el motor dasLLAMA se compila JIT y puede ejecutarse en CPU para inferencia en tiempo real con los modelos nano y mini.
- Compatibilidad con GPU de consumo: sí, incluyendo RTX 3060, RTX 4090 y GPUs de portátiles.
- Opciones de despliegue: servidor dasllama-server con API OpenAI, o script `txt2wav.das` para generación por lotes.
- Latencia y throughput: no disponible en la información proporcionada, pero el tamaño reducido sugiere latencia inferior a 100 ms por frase en GPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| dasLLAMA TTS (este repo) | 15M-82M | n/a | per-file (Apache-2.0, BSD, CC BY-SA) | GGUF | Front-end integrado, API OpenAI |
| KittenTTS nano 0.8 (original) | ~15M | n/a | Apache-2.0 | ONNX | Requiere front-end externo |
| Kokoro-82M (original) | 82M | n/a | Apache-2.0 | PyTorch | 54 voces, requiere misaki + espeak |
| StyleTTS2 (referencia) | ~200M | n/a | MIT | PyTorch | Arquitectura base, sin front-end |

La principal diferencia frente a los originales es la integración del front-end en datos y la conversión a GGUF, que elimina dependencias de Python y permite ejecución con el motor dasLLAMA.

## Limitaciones y advertencias

- Soporte exclusivo de inglés; no hay modelos multilingües en este repositorio.
- La licencia es por archivo: los pesos de KittenTTS y Kokoro son Apache-2.0, pero el paquete de etiquetado POS es CC BY-SA 4.0, lo que puede imponer restricciones de copyleft en productos derivados.
- El front-end de texto depende de lexicones y modelos entrenados con datos específicos (UD English-EWT, Gutenberg), lo que puede limitar el rendimiento con jerga técnica o nombres propios poco comunes.
- No se proporcionan métricas objetivas de calidad de voz; la validación se limita a paridad con las implementaciones de referencia.
- El motor dasLLAMA está bajo la licencia daslang en su propio repositorio, lo que debe verificarse antes de uso comercial.
- La cuantización a Q8_0 puede introducir degradación de calidad frente a los pesos f32 originales, aunque el repositorio mantiene el f32 como referencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/borisbat/dasllama-tts
- Motor dasLLAMA: https://github.com/GaijinEntertainment/daScript (módulo `modules/dasLLAMA`)
- Sitio oficial: https://dasllama.io/
- KittenTTS nano 0.8 (original): https://huggingface.co/KittenML/kitten-tts-nano-0.8
- KittenTTS mini 0.8 (original): https://huggingface.co/KittenML/kitten-tts-mini-0.8
- Kokoro-82M (original): https://huggingface.co/hexgrad/Kokoro-82M
