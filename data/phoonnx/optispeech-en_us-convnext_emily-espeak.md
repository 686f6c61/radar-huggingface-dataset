# Phoonnx/optispeech-en_us-convnext_emily-espeak

## Resumen

OptiSpeech-en_us-convnext_emily-espeak es un modelo de síntesis de voz (text-to-speech) en inglés estadounidense, empaquetado por Phoonnx a partir del modelo original de mush42 alojado en el repositorio `mush42/optispeech/onnx/convnext-tts/en-us`. Se distribuye en formato ONNX y está pensado para ejecutarse mediante la librería `phoonnx`, una biblioteca Python de TTS basada en ONNX que también ofrece integración con el asistente OVOS. El modelo emplea la arquitectura OptiSpeech con un backbone ConvNeXt para la parte acústica y recibe como entrada fonemas en alfabeto IPA generados por espeak-ng.

La relevancia de esta ficha es doble: por un lado, documenta una voz concreta ("emily") dentro de la colección OptiSpeech empaquetada por Phoonnx; por otro, ilustra un patrón de despliegue de TTS neuronal en local, sin dependencia de servicios en la nube, con un peso de repositorio de aproximadamente 0,1 GB y licencia MIT. Es un modelo de nicho, con 22 descargas en el momento de la consulta, orientado a desarrolladores que necesitan síntesis de voz ligera y embebible en inglés.

No se dispone de información pública sobre el número de parámetros, la longitud de contexto ni los datos exactos de entrenamiento en la documentación proporcionada; esta ficha lo indica explícitamente en cada apartado afectado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | OptiSpeech con backbone ConvNeXt (variante `convnext-tts`) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; la entrada es texto/fonemas, no una ventana de contexto autoregresiva) |
| Tipos de cuantización | no disponible (se distribuye en ONNX; el autor no documenta variantes cuantizadas) |
| Idiomas soportados | `en-US` (inglés estadounidense) |
| Licencia | MIT (declarada upstream en la model card de `mush42/optispeech`) |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas espeak-ng en alfabeto IPA |
| Tamaño del repositorio | ~0,1 GB |
| Librería de ejecución | `phoonnx` (Python) |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura OptiSpeech, un sistema de síntesis de voz neuronal que en esta variante utiliza un backbone ConvNeXt en lugar de un transformer convencional para el modelado acústico. La entrada no es texto crudo sino fonemas en IPA producidos por espeak-ng, lo que implica un front-end fonemizador obligatorio antes de la inferencia. El empaquetado de Phoonnx añade una capa de gestión de voces (`TTSModelManager`) y normalización de texto mediante `scriptconv`, que convierte el texto de entrada en la secuencia de fonemas que el modelo espera.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO u otras optimizaciones posteriores al preentrenamiento. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal. La model card únicamente identifica al autor original (mush42), la ruta upstream del modelo ONNX y el idioma de destino (`en-US`).

## Capacidades

- Síntesis de voz en inglés estadounidense a partir de texto, con salida en formato WAV.
- Conversión texto a fonemas IPA mediante espeak-ng (o el port `espyak` incluido en `phoonnx[espeak]`).
- Ejecución local en CPU/GPU mediante ONNX Runtime, sin llamadas a servicios externos.
- Integración con OVOS a través del plugin `ovos-tts-plugin-phoonnx`, seleccionable en `mycroft.conf`.
- Gestión de voces múltiples mediante `TTSModelManager` y `merge_default_voices()`.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo "thinking"; es un modelo estrictamente TTS.
- Capacidad multilingüe: limitada a `en-US`; no se declaran otros idiomas.

## Casos de uso

- Asistentes de voz locales: integración en OVOS mediante `ovos-tts-plugin-phoonnx` para que un asistente doméstico sintetice respuestas en inglés sin depender de la nube, aprovechando el tamaño reducido (~0,1 GB) del repositorio.
- Lectura de notificaciones y alertas: generación de avisos hablados en aplicaciones de escritorio o sistemas embebidos, con la voz "emily" como timbre consistente.
- Accesibilidad: conversión de texto a voz para lectores de pantalla o interfaces para personas con discapacidad visual, ejecutándose en local para preservar la privacidad del contenido leído.
- Pruebas y desarrollo de pipelines TTS: uso como voz de referencia en tests automatizados de sistemas de diálogo, gracias a la API programática de `phoonnx` y a la salida WAV directa.
- Prototipado de interfaces conversacionales: generación rápida de audio de respuesta en demos de chatbots o agentes, dado el bajo peso del modelo y su licencia MIT.
- Generación de contenido educativo o de audio bajo demanda: narración de textos cortos en inglés en aplicaciones de e-learning o podcasts automatizados, siempre que el texto se normalice y fonemice correctamente con espeak-ng.
- Empaquetado en dispositivos con recursos limitados: al distribuirse en ONNX y con un tamaño de repositorio pequeño, es candidato para Raspberry Pi u otros SBC, aunque no se publican cifras de latencia ni de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (~0,1 GB) sugiere un modelo ligero, pero no se documenta el consumo real en memoria.
- GPU recomendadas: no disponible. Al ser un modelo ONNX de pequeño tamaño, es plausible su ejecución en CPU y en GPUs consumer, pero el autor no publica recomendaciones.
- ¿Cabe en GPU consumer? No confirmado explícitamente; por tamaño de repositorio es probable, pero no hay datos oficiales.
- Opciones de despliegue: `phoonnx` (Python, con ONNX Runtime), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo TTS de este tipo).
- Latencia y throughput: no disponibles.
- Dependencia externa: espeak-ng debe estar instalado en el sistema (`apt install espeak-ng`) o bien usar el extra `phoonnx[espeak]` con el port `espyak`.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Tamaño repo | Disponibilidad |
|---|---|---|---|---|---|---|
| optispeech-en_us-convnext_emily-espeak (este) | OptiSpeech + ConvNeXt | en-US | ONNX | MIT | ~0,1 GB | Hugging Face (Phoonnx) |
| Otras voces de la colección OptiSpeech de Phoonnx | OptiSpeech (distintos backbones) | según voz | ONNX | MIT (upstream) | variable | Colección `Phoonnx/optispeech-*` |
| Modelos TTS genéricos tipo VITS/Coqui | VITS / otros | multilingüe en algunos casos | varios | variable | variable | no disponible en la información |

No se dispone de datos de benchmarks ni de especificaciones detalladas de las voces alternativas de la colección para establecer una comparación cuantitativa de rendimiento. La comparación se limita a aspectos de formato, licencia e idioma.

## Limitaciones y advertencias

- Idioma restringido a `en-US`; no se declara soporte para otras lenguas ni para variantes regionales del inglés.
- Dependencia crítica de espeak-ng: sin él, la fonemización falla o requiere el port `espyak`, que según la propia model card puede producir fonemas distintos y pronunciar mal algunas palabras.
- Riesgo de pronunciación incorrecta en palabras fuera del vocabulario o con grafías irregulares, al depender de un fonemizador basado en reglas.
- No se documentan sesgos específicos de género, acento o etnia; la voz "emily" implica un timbre concreto, pero no hay información sobre la diversidad del dataset de entrenamiento.
- Riesgo de alucinación acústica: como todo modelo generativo de audio, puede producir artefactos, ruidos o prosodia anómala en entradas largas o mal normalizadas.
- Licencia MIT declarada upstream, lo que en principio permite uso comercial; sin embargo, conviene verificar la model card original de `mush42/optispeech` por si hubiera condiciones adicionales no reflejadas en el empaquetado.
- Ausencia de métricas publicadas (MOS, WER, latencia) que permitan evaluar la calidad objetiva frente a alternativas.
- Proyecto de nicho con muy pocas descargas (22) y sin likes; no hay evidencia de mantenimiento activo más allá de la actualización del repositorio en noviembre de 2026.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/optispeech-en_us-convnext_emily-espeak
- Modelo upstream (mush42): https://huggingface.co/mush42/optispeech/tree/main/onnx/convnext-tts/en-us
- Colección OptiSpeech empaquetada por Phoonnx: https://huggingface.co/collections/Phoonnx/optispeech-6af8ea9492a4f8f4e0f1cf30
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
