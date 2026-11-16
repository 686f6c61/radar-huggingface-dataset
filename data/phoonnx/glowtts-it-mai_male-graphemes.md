# Phoonnx/glowtts-it-mai_male-graphemes

## Resumen

glowtts-it-mai_male-graphemes es un modelo de síntesis de voz (text-to-speech) en italiano, originalmente desarrollado por Coqui como parte de su toolkit TTS (version 0.6.1) y reempaquetado por Phoonnx en formato ONNX para su uso con la librería phoonnx. El modelo emplea la arquitectura Glow-TTS, un modelo de flujo normalizador (normalizing flow) que genera espectrogramas mel a partir de texto de forma no autorregresiva, lo que permite una síntesis paralela y rápida en comparación con modelos secuenciales.

La relevancia de este artefacto es fundamentalmente práctica: convierte un modelo de Coqui, cuya distribución original dependía del stack completo de PyTorch y del repositorio TTS, en un paquete ONNX ligero (0,1 GB) ejecutable mediante phoonnx, una librería de inferencia TTS orientada a entornos Python y al asistente de voz OVOS. Esto facilita el despliegue en dispositivos con recursos limitados y en pipelines de voz existentes sin arrastrar dependencias pesadas.

El modelo está especializado en una única voz masculina italiana (`mai_male`) y utiliza una entrada basada en grafemas (caracteres del texto) en lugar de fonemas, lo que simplifica el front-end pero limita el control fonético fino. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (flujo normalizador sobre encoder Transformer, síntesis no autorregresiva) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; procesa una frase por invocación) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | italiano (`it`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (repositorio de 0,1 GB) |

## Arquitectura y entrenamiento

Glow-TTS es un modelo generativo basado en flujos normalizadores que aprende una transformación invertible entre una distribución latente gaussiana y el espacio de espectrogramas mel. A diferencia de los modelos autorregresivos como Tacotron 2, la generación es paralela: el encoder Transformer procesa la secuencia de entrada y un mecanismo de alineamiento monotónico (Monotonic Alignment Search, MAS) aprende la correspondencia entre texto y frames de audio sin necesidad de alineamientos externos. Esto se traduce en una inferencia más rápida y estable, sin los fallos típicos de atención de los modelos secuenciales.

El modelo concreto corresponde al checkpoint `tts_models--it--mai_male--glow-tts` publicado por Coqui en la release v0.6.1 de su repositorio TTS. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de voz (más allá de tratarse de una voz masculina italiana identificada como `mai_male`) ni sobre si se aplicaron etapas de RLHF o ajuste fino posteriores. El front-end de texto utiliza `GraphemePhonemizer` de la librería scriptconv, es decir, el modelo consume caracteres directamente sin conversión a fonemas.

## Capacidades

- Síntesis de voz en italiano a partir de texto, con una única voz masculina (`mai_male`).
- Entrada basada en grafemas: acepta texto en caracteres y lo normaliza mediante scriptconv antes de la inferencia.
- Generación no autorregresiva de espectrogramas mel, con inferencia paralela.
- Integración con la librería phoonnx en Python (`TTSModelManager`, `voice.synthesize_wav`).
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- No soporta tool calling, function calling, agentes, visión, audio de entrada ni modo de razonamiento; es exclusivamente un modelo TTS.
- Capacidad multilingüe: no; únicamente italiano.

## Casos de uso

- Asistentes de voz en italiano sobre OVOS: el modelo se selecciona como módulo TTS en `mycroft.conf` y proporciona respuestas habladas con una voz masculina italiana, aprovechando el plugin `ovos-tts-plugin-phoonnx` ya integrado en el ecosistema.
- Síntesis en dispositivos de borde: al distribuirse como ONNX de 0,1 GB y ejecutarse mediante phoonnx, puede desplegarse en Raspberry Pi o mini-PC sin GPU dedicada para generar avisos y respuestas de voz locales.
- Generación de audiolibros y contenido narrado en italiano: la inferencia paralela de Glow-TTS permite procesar lotes de frases con latencia baja y sin los fallos de alineamiento de los modelos autorregresivos.
- Locuciones para sistemas de megafonía y anuncios automatizados: integrado en un pipeline que reciba texto (por ejemplo, desde una cola de mensajes) y produzca WAV mediante `synthesize_wav`.
- Prototipado de interfaces conversacionales en italiano: permite validar flujos de voz en Python con pocas líneas de código antes de invertir en modelos comerciales o de mayor calidad.
- Pruebas de accesibilidad y lectura de texto en aplicaciones: conversión de contenido textual a audio para usuarios con discapacidad visual en entornos de habla italiana, con despliegue local y sin dependencia de servicios en la nube.
- Investigación y evaluación de TTS: como checkpoint Glow-TTS de referencia en italiano dentro de la colección de Phoonnx, sirve de línea base para comparar con modelos más recientes (VITS, FastSpeech 2, etc.).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio completo ocupa 0,1 GB, por lo que la huella en memoria es reducida y compatible con CPU.
- GPU recomendadas: no se documentan; al ser un modelo ONNX pequeño, cualquier GPU con soporte ONNX Runtime (por ejemplo, GTX 1650, RTX 3060) es más que suficiente. Una GPU dedicada no es necesaria.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo e incluso en CPU.
- Opciones de despliegue: phoonnx (Python y OVOS) con ONNX Runtime; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; Glow-TTS es no autorregresivo y, por diseño, más rápido que Tacotron 2, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Voz | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| glowtts-it-mai_male-graphemes (este) | Glow-TTS | Italiano | Masculina única | ONNX (phoonnx) | Apache 2.0 | Hugging Face, 20 descargas |
| Coqui `tts_models--it--mai_male--glow-tts` (upstream) | Glow-TTS | Italiano | Masculina única | Checkpoint PyTorch (TTS) | Apache 2.0 | GitHub Coqui TTS v0.6.1 |
| Otros modelos Glow-TTS de la colección Phoonnx | Glow-TTS | Variable | Variable | ONNX (phoonnx) | Apache 2.0 (según upstream) | Hugging Face (colección Phoonnx) |
| Modelos TTS italianos de Coqui basados en VITS | VITS | Italiano | Variable | Checkpoint PyTorch | Apache 2.0 (según upstream) | GitHub Coqui TTS |

No se dispone de datos de rendimiento comparativo (MOS, latencia) en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Una sola voz masculina italiana: no hay variedad de hablantes ni control de estilo o emoción.
- Entrada basada en grafemas: al no usar fonemas, la pronunciación de palabras ambiguas, siglas, números o extranjerismos depende de la normalización de scriptconv y puede ser incorrecta.
- Idioma restringido al italiano: el uso con texto en otros idiomas producirá una pronunciación defectuosa.
- Calidad de audio propia de un modelo de 2021 (Coqui TTS 0.6.1): inferior a la de modelos neuronales más recientes como VITS o sistemas comerciales; no se aportan métricas MOS.
- Riesgo de artefactos en frases muy largas o con puntuación atípica; se recomienda segmentar el texto en frases.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar la procedencia del dataset de voz original de Coqui, ya que la licencia del modelo no cubre necesariamente los derechos sobre la voz o los datos de entrenamiento.
- Dependencia del ecosistema phoonnx/scriptconv para el preprocesado; cambios en estas librerías pueden afectar al comportamiento del front-end.
- Repositorio con muy poca tracción (20 descargas, 0 likes): menor probabilidad de soporte comunitario o de corrección de errores.
- No apto para clonación de voz, conversión de voz ni tareas distintas de TTS.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-it-mai_male-graphemes
- Upstream (Coqui TTS v0.6.1, modelo italiano): https://github.com/coqui-ai/TTS/releases/download/v0.6.1_models/tts_models--it--mai_male--glow-tts.zip
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Repositorio Coqui TTS: https://github.com/coqui-ai/TTS
