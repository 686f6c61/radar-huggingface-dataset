# Phoonnx/f5tts-multi-silma_ai-v1

## Resumen

f5tts-multi-silma_ai-v1 es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura F5-TTS, desarrollado originalmente por SILMA AI como `silma-ai/silma-tts` y empaquetado por Phoonnx en formato ONNX para su uso con la librería `phoonnx`. El modelo cubre dos idiomas, árabe (árabe estándar moderno con tashkeel completo) e inglés, y está pensado para integrarse en pipelines de TTS tanto en Python como en el ecosistema OVOS (Open Voice OS).

El modelo se distribuye con licencia Apache-2.0, lo que permite uso comercial sin las restricciones no comerciales que arrastraban las bases previas (Habibi/SADA/Mixat bajo CC-BY-NC-SA-4.0). El repositorio ocupa aproximadamente 0,7 GB, lo que sugiere pesos cuantizados o en precisión reducida orientados a inferencia eficiente en CPU y GPU modesta.

La relevancia actual del modelo radica en su empaquetado ONNX listo para producción y en su soporte bilingüe árabe-inglés, una combinación poco frecuente en modelos TTS abiertos. El modelo recibe caracteres de texto como entrada y ofrece dos voces predefinidas (`silma/v1` para árabe y `silma/v1-en` para inglés).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | F5-TTS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo de 0,7 GB en formato ONNX) |
| Idiomas soportados | arabe (MSA con tashkeel completo), ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | caracteres del texto (front-end `GraphemePhonemizer` de scriptconv) |
| Voces disponibles | `silma/v1` (ar), `silma/v1-en` (en) |
| Tamano del repositorio | 0,7 GB |
| Libreria de inferencia | phoonnx (Python) / ovos-tts-plugin-phoonnx |

## Arquitectura y entrenamiento

El modelo se basa en F5-TTS, una arquitectura de síntesis de voz de la familia de modelos de difusión flow-matching para generación de audio, aunque la model card no detalla los hiperparámetros concretos (número de parámetros, capas, dimensión de embeddings) ni la composición exacta del dataset de entrenamiento. El modelo original `silma-ai/silma-tts` fue entrenado por SILMA AI y declara soporte para árabe estándar moderno con tashkeel completo e inglés.

El empaquetado de Phoonnx convierte los pesos a ONNX y añade un front-end de texto basado en `scriptconv`, que normaliza el texto y lo convierte en la entrada del modelo mediante un `GraphemePhonemizer` (fonemizador a nivel de grafema, sin conversión fonética explícita). No se dispone de información sobre si hubo RLHF, DPO ni sobre el número de horas o tokens de audio empleados en el entrenamiento.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en árabe e inglés.
- Soporte de árabe estándar moderno con tashkeel completo (diacríticos vocálicos).
- Dos voces predefinidas: `silma/v1` (árabe) y `silma/v1-en` (inglés).
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución mediante inferencia ONNX, lo que facilita el despliegue en entornos sin GPU dedicada.
- No se documentan capacidades de clonación de voz, control de emoción, tool calling ni agentes; el modelo es exclusivamente TTS.

## Casos de uso

- Asistentes de voz en árabe para OVOS: el modelo se integra directamente como módulo TTS en `mycroft.conf`, permitiendo respuestas habladas en árabe estándar con diacríticos correctos en asistentes domésticos autoalojados.
- Lectura de contenido en árabe con tashkeel: artículos, noticias o textos educativos que requieren pronunciación precisa de vocales cortas, algo crítico en árabe y que el modelo soporta de forma nativa.
- Sistemas bilingües árabe-inglés: aplicaciones de atención al cliente o información pública en países del Golfo donde se alternan ambos idiomas, usando las voces `silma/v1` y `silma/v1-en` según el segmento.
- Accesibilidad para personas con discapacidad visual: conversión de texto a voz en aplicaciones de lectura de pantalla, con despliegue ONNX en dispositivos de gama baja sin GPU.
- Generación de audio para formación y e-learning: narración de cursos de idiomas o materiales didácticos en árabe e inglés con voces consistentes.
- Integración en pipelines de CI/CD para pruebas de audio: al ser un modelo ONNX ligero (0,7 GB), puede ejecutarse en runners de integración continua para validar salidas de TTS en pruebas automatizadas.
- Prototipado rápido de interfaces conversacionales: la API de `phoonnx` (`TTSModelManager`, `voice.synthesize_wav`) permite generar WAV directamente en scripts Python sin infraestructura adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con un repositorio de 0,7 GB en ONNX, la inferencia cabe previsiblemente en GPUs con 2-4 GB de VRAM, aunque no se confirma en la documentación.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) debería ser suficiente; también es viable en CPU.
- Cabe en GPU consumer: sí, por el tamaño del repositorio (0,7 GB), aunque no hay confirmación oficial.
- Opciones de despliegue: `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS), inferencia ONNX Runtime.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Contexto/entrada |
|---|---|---|---|---|---|
| f5tts-multi-silma_ai-v1 | F5-TTS | ar, en | Apache-2.0 | ONNX | caracteres |
| silma-ai/silma-tts (upstream) | F5-TTS | ar, en | Apache-2.0 | no disponible | caracteres |
| Otros modelos F5-TTS de la coleccion Phoonnx | F5-TTS | variable | variable | ONNX | caracteres |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la información proporcionada. La comparativa se limita a parámetros estructurales y de licencia.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, pero al ser un modelo TTS entrenado con datos de voz, puede heredar sesgos de pronunciación, género o registro de las voces de entrenamiento.
- Riesgo de alucinación en TTS: posible generación de audio ininteligible o artefactos en textos fuera de dominio, especialmente con números, siglas o código.
- Cobertura limitada a dos idiomas (árabe e inglés); no soporta otros idiomas.
- El front-end usa un `GraphemePhonemizer` (sin conversión fonética explícita), lo que puede afectar a la pronunciación de palabras irregulares o extranjerismos.
- Aunque la licencia es Apache-2.0, la model card menciona restricciones CC-BY-NC-SA-4.0 en las bases Habibi/SADA/Mixat; conviene verificar que la variante `silma-tts-v1` no arrastra esas restricciones antes de un uso comercial.
- No se documentan parámetros de control (velocidad, tono, emoción) ni clonación de voz.
- El número de descargas (29) y likes (0) es muy bajo, lo que indica poca validación comunitaria; usar con cautela en producción.
- No hay información sobre latencia, throughput ni calidad subjetiva (MOS) publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/f5tts-multi-silma_ai-v1
- Modelo upstream: https://huggingface.co/silma-ai/silma-tts
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección F5-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/f5-tts-6af8ea7f407234f6f1f08b30
