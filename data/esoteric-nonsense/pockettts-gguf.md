# Esoteric-Nonsense/PocketTTS-GGUF

## Resumen

PocketTTS-GGUF es una conversión al formato GGUF del modelo de síntesis de voz kyutai/pocket-tts, desarrollada por el usuario Esoteric-Nonsense para un proyecto local. El modelo base, desarrollado por Kyutai Labs, es un sistema de text-to-speech (TTS) ligero de aproximadamente 336 millones de parámetros que resuelve el problema de generar voz sintética de calidad en hardware modesto, incluyendo CPU. Esta conversión facilita su despliegue mediante el ecosistema llama.cpp y herramientas compatibles con GGUF, además de incluir pesos en formato ONNX.

La relevancia de esta ficha radica en que el ecosistema de Pocket TTS ha generado una comunidad activa de modelos entrenados para múltiples idiomas (checo, hindi, coreano, persa, indonesio, estonio, galés, turco, polaco, griego, japonés, chino, entre otros), lo que demuestra la versatilidad de la arquitectura base. Sin embargo, esta conversión concreta no documenta especificaciones técnicas detalladas más allá del recuento de parámetros y el tamaño del repositorio. El modelo se distribuye bajo licencia CC-BY-SA-4.0, lo que impone condiciones de atribución y compartición de obra derivada.

Es importante señalar que la información disponible sobre esta conversión es limitada: no se documentan detalles sobre arquitectura interna, datos de entrenamiento, benchmarks ni idiomas soportados de forma explícita. La ficha se completa con los datos disponibles y se indica explícitamente cuando un dato no está disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: kyutai/pocket-tts, TTS) |
| Parámetros totales | 336.068.290 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (variantes no especificadas); también incluye ONNX |
| Idiomas soportados | no disponibles en esta conversión (el ecosistema base soporta múltiples idiomas mediante modelos comunitarios) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | GGUF, ONNX |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base kyutai/pocket-tts en la documentación proporcionada. Se trata de un modelo de síntesis de voz (text-to-speech) con 336 millones de parámetros, lo que lo sitúa en la categoría de modelos ligeros diseñados para inferencia eficiente. El repositorio de esta conversión incluye pesos en formato GGUF y ONNX, lo que sugiere compatibilidad con múltiples runtimes de inferencia.

No se documentan en la información proporcionada los datos de entrenamiento (número de tokens, composición del dataset), ni si se emplearon técnicas de RLHF, DPO u otras optimizaciones. Tampoco se detallan innovaciones técnicas específicas como decodificación especulativa o mecanismos de atención lineal. Para obtener información sobre la arquitectura del modelo base, se recomienda consultar el repositorio original de Kyutai Labs y el paper asociado (arXiv:2509.06926).

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto de entrada.
- Generación de audio con voces de referencia personalizables (el ecosistema permite especificar archivos de voz de referencia, como se observa en los ejemplos de modelos comunitarios).
- Soporte de múltiples idiomas mediante modelos comunitarios derivados (checo, hindi, coreano, persa, indonesio, estonio, galés, turco, polaco, griego, japonés, chino, multilingüe con inglés, hindi, marathi, kannada, tamil, malayalam y telugu).
- Capacidad de code-mixing en el modelo multilingüe comunitario (mezcla de idiomas dentro de una misma frase).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni visión, al tratarse de un modelo TTS.
- No se documenta un modo "thinking" ni capacidades de audio de entrada (reconocimiento de voz).

## Casos de uso

- **Generación de audiolibros y contenido narrado**: el modelo puede sintetizar texto largo en voz de forma eficiente gracias a su tamaño reducido (336M parámetros), lo que permite procesar grandes volúmenes de texto en hardware modesto sin necesidad de GPUs de gama alta.
- **Asistentes de voz para aplicaciones de accesibilidad**: integración en lectores de pantalla y aplicaciones de asistencia para personas con discapacidad visual, donde la latencia baja y el consumo reducido de recursos son críticos para una experiencia fluida en tiempo real.
- **Localización de contenido multimedia**: doblaje automatizado de vídeos y podcasts a múltiples idiomas utilizando los modelos comunitarios derivados (checo, hindi, coreano, japonés, etc.), lo que permite escalar la producción de contenido localizado sin estudios de grabación.
- **Sistemas de atención al cliente con respuesta por voz**: generación de respuestas habladas en sistemas IVR (respuesta de voz interactiva) y chatbots telefónicos, donde el modelo puede sintetizar respuestas dinámicas con voces personalizadas según la marca o el contexto.
- **Prototipado rápido de interfaces de voz**: desarrolladores que necesitan integrar TTS en aplicaciones web o móviles pueden usar la conversión GGUF con llama.cpp u otros runtimes compatibles para validar conceptos sin depender de servicios en la nube.
- **Generación de voces para videojuegos y animación**: creación de diálogos de personajes con voces de referencia personalizadas, permitiendo a estudios independientes generar contenido de voz sin contratar actores para cada iteración de guion.
- **Investigación en síntesis de voz**: el formato GGUF y ONNX facilita la experimentación con cuantizaciones y la comparación de rendimiento en distintos hardware, así como el ajuste fino sobre el modelo base para nuevos idiomas o dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 336 millones de parámetros, el modelo en precisión completa (FP32) ocuparía aproximadamente 1,3 GB; en FP16, unos 672 MB; en cuantizaciones de 8 bits, alrededor de 336 MB; y en 4 bits, unos 168 MB. Estas estimaciones son orientativas y no están confirmadas en la documentación del repositorio.
- **GPU recomendadas**: el tamaño reducido permite inferencia en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090, así como en GPUs de datacenter (A100, H100) sin problemas de memoria. También es viable en CPU.
- **¿Cabe en GPU de consumo?**: sí, con amplio margen, en cualquier GPU con al menos 2 GB de VRAM (incluso integradas).
- **Opciones de despliegue**: llama.cpp (formato GGUF), ONNX Runtime (formato ONNX), y potencialmente otras herramientas compatibles con GGUF. El ecosistema original de Kyutai utiliza el comando `uvx pocket-tts generate` con archivos de configuración YAML, aunque esta conversión concreta está orientada a GGUF/ONNX.
- **Latencia y throughput estimados**: no disponibles en la información proporcionada. El modelo base se describe en el ecosistema comunitario como capaz de funcionar "más rápido que tiempo real en un ordenador normal" (según el ejemplo del modelo estonio), pero no se aportan cifras concretas para esta conversión.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se indica "no disponible" para esta sección, ya que no se han encontrado datos de benchmarks ni especificaciones de alternativas en la información consultada.

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| PocketTTS-GGUF (este) | 336M | no disponible | CC-BY-SA-4.0 | GGUF, ONNX | Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Licencia CC-BY-SA-4.0**: permite uso comercial, pero impone atribución y obligación de compartir obras derivadas bajo la misma licencia. Es importante revisar los términos completos antes de integrar el modelo en productos propietarios.
- **Información técnica incompleta**: la model card de esta conversión es mínima y no documenta arquitectura, datos de entrenamiento, idiomas soportados ni benchmarks, lo que dificulta la evaluación rigurosa antes de su adopción en producción.
- **Riesgo de alucinación y artefactos de audio**: como todo modelo TTS, puede generar pronunciaciones incorrectas, entonación antinatural o artefactos en textos con nombres propios, siglas, números o palabras poco frecuentes. No se documentan tasas de error.
- **Idiomas no especificados**: esta conversión no declara qué idiomas soporta explícitamente; el rendimiento en castellano no está garantizado ni documentado. Se recomienda validar con muestras propias antes de desplegar.
- **Sesgos**: no se documentan sesgos conocidos, pero los modelos TTS pueden reproducir sesgos de pronunciación o prosodia según el acento y el registro del habla de los datos de entrenamiento.
- **Dependencia del modelo base**: al ser una conversión, cualquier limitación del modelo original kyutai/pocket-tts se hereda. Se recomienda consultar la documentación original para conocer las restricciones de uso y las capacidades reales.
- **Repositorio de gran tamaño**: 56 GB de tamaño total, lo que puede dificultar la descarga y el almacenamiento en entornos con recursos limitados.

## Enlaces

- [Hugging Face: Esoteric-Nonsense/PocketTTS-GGUF](https://huggingface.co/Esoteric-Nonsense/PocketTTS-GGUF)
- [Modelo base: kyutai/pocket-tts](https://huggingface.co/kyutai/pocket-tts)
- [Repositorio GitHub de Kyutai Labs: pocket-tts](https://github.com/kyutai-labs/pocket-tts)
- [Paper arXiv:2509.06926](https://arxiv.org/abs/2509.06926)
- [Pocket TTS Czech (vvolhejn)](https://huggingface.co/vvolhejn/pocket-tts-czech)
- [Pocket TTS Hindi (saryps-labs)](https://huggingface.co/saryps-labs/pocket-tts-hindi)
- [Pocket TTS Korean 300M (seastar105)](https://huggingface.co/seastar105/pocket-tts-korean-300m)
- [Pocket TTS Persian (mehdi-hf)](https://huggingface.co/mehdi-hf/pocket-tts-farsi)
- [Pocket TTS Indonesian (anak10thn)](https://huggingface.co/anak10thn/pocket-tts-indonesian)
- [Pocket TTS Estonian (cbentes)](https://huggingface.co/cbentes/pocket-tts-estonian)
- [Pocket TTS Cymraeg (EryriLabs)](https://huggingface.co/EryriLabs/pocket-tts-cymraeg)
- [Pocket TTS Turkish (alperiox)](https://huggingface.co/alperiox/pocket-tts-turkish)
- [Pocket TTS Polish (shefowl)](https://huggingface.co/shefowl/pocket-tts-polish-6l)
- [Pocket TTS Greek (myned-ai)](https://huggingface.co/myned-ai/pocket-tts-greek)
- [Pocket TTS Japanese (takuma104)](https://huggingface.co/takuma104/pocket-tts-ja)
- [Pocket TTS Chinese (hustfyb)](https://huggingface.co/hustfyb/PocketTTS-ZH-6L)
- [Pocket TTS Multilingual (Thanushttk)](https://huggingface.co/Thanushttk/pocket-tts-multilingual)
