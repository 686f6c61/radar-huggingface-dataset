# Phoonnx/pockettts-en-kyutai-2026_04-unicode

## Resumen

pockettts-en-kyutai-2026_04-unicode es un modelo de síntesis de voz (text-to-speech) en inglés, desarrollado originalmente por Kyutai bajo la arquitectura Pocket TTS y empaquetado por Phoonnx en formato ONNX para su uso con la librería `phoonnx`. El modelo convierte texto en audio a partir de los codepoints Unicode del texto de entrada, sin pasar por un fonemizador basado en G2P tradicional, y está disponible en 26 voces predefinidas con acentos `en-US` y `en-CA`.

El empaquetado resuelve un problema práctico de despliegue: permite ejecutar el modelo en Python y en el ecosistema OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx`, sin depender del framework original de Kyutai. El repositorio ocupa 0,8 GB y se distribuye bajo licencia CC-BY-4.0, lo que facilita su integración en asistentes de voz, sistemas de accesibilidad y pipelines de generación de audio.

La relevancia actual del modelo radica en su carácter ligero y su licencia permisiva para uso comercial con atribución, así como en su integración directa con un stack de asistentes de voz open source. No obstante, la información pública disponible es limitada: no se detallan parámetros, contexto ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pocket TTS (Kyutai) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (formato ONNX) |
| Idiomas soportados | `en`, `en-CA`, `en-US` |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Pocket TTS de Kyutai, una arquitectura de síntesis de voz orientada a inferencia ligera. La versión empaquetada aquí corresponde al checkpoint `english_2026-04` del repositorio upstream `kyutai/pocket-tts`, convertido a ONNX por KevinAHM y posteriormente empaquetado por Phoonnx.

El front-end de texto no utiliza fonemización G2P convencional: `phoonnx` delega en la librería `scriptconv`, que aplica el `UnicodeCodepointPhonemizer` para normalizar el texto y convertirlo en la secuencia de codepoints Unicode que consume el modelo. No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación.

## Capacidades

- Síntesis de voz a partir de texto en inglés, con salida en formato WAV.
- Soporte de variantes regionales `en-US` y `en-CA`.
- 26 voces predefinidas empaquetadas (`alba`, `anna`, `azelma`, `bill_boerst`, `caro_davy`, `charles`, `cosette`, `eponine`, `estelle`, `eve`, `fantine`, `george`, `giovanni`, `jane`, `javert`, `jean`, `juergen`, `lola`, `marius`, `mary`, `michael`, `paul`, `peter_yearsley`, `rafael`, `stuart_bell`, `vera`).
- Entrada basada en codepoints Unicode, sin fonemizador G2P externo.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- No se documentan capacidades de clonación de voz, control de emoción, prosodia avanzada, tool calling ni razonamiento multi-paso, por lo que se consideran no disponibles.

## Casos de uso

- Asistentes de voz en OVOS: el modelo se integra como módulo TTS mediante `ovos-tts-plugin-phoonnx`, configurando la voz en `mycroft.conf` con una de las 26 voces disponibles, lo que permite dotar de voz a un asistente doméstico open source sin servicios en la nube.
- Lectura de contenido para accesibilidad: conversión de artículos, notificaciones o mensajes de interfaz a audio en inglés para usuarios con discapacidad visual, aprovechando la licencia CC-BY-4.0 para su redistribución en aplicaciones.
- Generación de audio para entornos de desarrollo y pruebas: creación de clips de voz sintética en pipelines de CI para validar sistemas de reconocimiento de voz o de diálogo, gracias al formato ONNX y al tamaño contenido del repositorio (0,8 GB).
- Narración de contenidos educativos: síntesis de lecciones o materiales de e-learning en inglés con voces variadas, seleccionando entre las 26 voces según el tono requerido.
- Prototipado de interfaces conversacionales: integración en aplicaciones Python mediante `TTSModelManager` y `synthesize_wav` para generar respuestas habladas en tiempo de desarrollo.
- Generación de avisos y locuciones en aplicaciones de escritorio: uso del modelo como motor TTS local para mensajes del sistema, alertas o tutoriales, sin dependencia de APIs externas.
- Creación de contenido multilingüe limitado: aunque el modelo solo cubre inglés, las variantes `en-US` y `en-CA` permiten adaptar la locución a audiencias de Norteamérica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,8 GB, por lo que se espera que el modelo sea ejecutable en GPUs de gama media, aunque no se confirman cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del repositorio sugiere que podría caber en GPUs de consumo con suficiente VRAM, pero no hay datos oficiales.
- Opciones de despliegue: `phoonnx` (Python) y `ovos-tts-plugin-phoonnx` (OVOS); el modelo se distribuye en formato ONNX, por lo que puede ejecutarse con runtimes ONNX compatibles, aunque no se documentan otras integraciones.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| pockettts-en-kyutai-2026_04-unicode | Pocket TTS | en, en-CA, en-US | CC-BY-4.0 | ONNX | Hugging Face (Phoonnx) |
| kyutai/pocket-tts (upstream) | Pocket TTS | en (checkpoint english_2026-04) | CC-BY-4.0 | no disponible | Hugging Face (Kyutai) |
| KevinAHM/pocket-tts-onnx | Pocket TTS | en | no disponible | ONNX | Hugging Face (KevinAHM) |

No se dispone de datos de rendimiento ni de parámetros para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Solo soporta inglés (`en`, `en-CA`, `en-US`); no es adecuado para otros idiomas.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado por Kyutai y empaquetado por terceros, pueden existir sesgos en la prosodia o en la representación de voces.
- Riesgo de alucinación no aplicable en el sentido habitual de LLM, pero puede producir pronunciaciones incorrectas en palabras fuera del dominio de entrenamiento.
- La licencia CC-BY-4.0 exige atribución al autor original (Kyutai) en usos comerciales y redistribuciones.
- La información técnica (parámetros, contexto, cuantizaciones, benchmarks) no está publicada, lo que dificulta la evaluación previa a producción.
- El modelo depende de `phoonnx` y `scriptconv` para su ejecución; no se garantiza compatibilidad con otros frameworks TTS sin conversión adicional.
- El número de descargas (16) y de likes (0) es muy bajo, lo que sugiere poca validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/pockettts-en-kyutai-2026_04-unicode
- Upstream Kyutai: https://huggingface.co/kyutai/pocket-tts/tree/main/languages/english_2026-04
- Conversión ONNX: https://huggingface.co/KevinAHM/pocket-tts-onnx/tree/main/onnx/english_2026-04
- Colección Pocket TTS: https://huggingface.co/collections/Phoonnx/pocket-tts-6af8ea95fad812f585a5cb91
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
