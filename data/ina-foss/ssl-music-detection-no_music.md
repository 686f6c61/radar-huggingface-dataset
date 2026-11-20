# ina-foss/ssl-music-detection-no_music

## Resumen

El modelo `ina-foss/ssl-music-detection-no_music` es un clasificador de audio especializado en la detección de música, desarrollado por INA (Institut national de l'audiovisuel) bajo el paraguas del proyecto FOSS. Se trata de un ajuste fino (fine-tuning) del modelo base auto-supervisado `ina-foss/ssl-audio-1k-no_music`, que emplea la librería Transformers y está orientado a la extracción de características y clasificación de audio. Su propósito es identificar la presencia o ausencia de música en fragmentos de audio, una tarea fundamental en pipelines de catalogación, monitorización de medios y análisis de archivos audiovisuales.

El modelo se distribuye con pesos en formato safetensors, ocupa aproximadamente 0,2 GB en el repositorio y expone la pipeline `audio-classification`. La variante `no_music` en el nombre sugiere un entrenamiento orientado a distinguir segmentos sin música, lo que resulta útil para filtrar contenido hablado o ruido de fondo en grandes volúmenes de audio. El acceso está restringido (gated) y requiere aceptar las condiciones de la licencia `pantagruel-research-license` en Hugging Face.

Por su tamaño compacto y su naturaleza de modelo especializado, está pensado para integrarse en flujos de procesamiento por lotes o en servicios de inferencia ligeros, más que como un modelo generativo de propósito general. No se dispone de información pública sobre benchmarks, idiomas soportados ni detalles del dataset de entrenamiento en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer auto-supervisado para audio (SSL), ajustado para clasificación (según tags: `custom_code`, `base_model:ina-foss/ssl-audio-1k-no_music`) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | no disponible |
| Licencia | pantagruel-research-license (acceso restringido, requiere aceptación) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `ina-foss/ssl-audio-1k-no_music`, un modelo base entrenado con aprendizaje auto-supervisado sobre audio (SSL), y se ha ajustado mediante fine-tuning supervisado para la tarea de detección de música. Los tags indican el uso de `custom_code`, lo que implica que la carga del modelo requiere código personalizado incluido en el repositorio o dependiente de la implementación del autor. No se dispone de información sobre el número de tokens de audio, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO, ya que no se documentan en la información proporcionada.

La innovación principal reside en la especialización: la variante `no_music` está orientada a discriminar segmentos sin música, lo que puede mejorar la precisión en la detección de contenido hablado o silencioso frente a modelos genéricos de clasificación de audio. No se documentan técnicas como decodificación especulativa, atención lineal o arquitecturas híbridas SSM en la información disponible.

## Capacidades

- Clasificación de audio binaria o multiclase orientada a la detección de música (presencia/ausencia).
- Extracción de características de audio (`feature-extraction` según tags).
- Integración con la pipeline `audio-classification` de Transformers.
- Procesamiento de fragmentos de audio para catalogación y filtrado.
- Uso como componente en pipelines de análisis de medios (no como modelo generativo).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio generativo ni modo thinking.
- Capacidades multilingües: no aplica directamente (modelo de audio, no de texto); idiomas no disponibles.

## Casos de uso

- **Catalogación de archivos audiovisuales**: el modelo permite etiquetar automáticamente segmentos con y sin música en archivos de radio y televisión, facilitando la indexación y búsqueda en archivos como los gestionados por INA.
- **Monitorización de emisiones**: integrado en un pipeline de ingesta, puede detectar en tiempo casi real la presencia de música en emisiones para cumplir con obligaciones de derechos de autor o cuotas de programación.
- **Filtrado de contenido hablado**: al estar especializado en la variante `no_music`, es adecuado para aislar segmentos de voz o silencio y descartar música de fondo en transcripciones automáticas.
- **Preprocesamiento para ASR**: antes de enviar audio a un sistema de reconocimiento de voz, el modelo puede marcar segmentos musicales para evitar transcripciones erróneas o alucinaciones del ASR.
- **Análisis de archivos históricos**: permite clasificar grandes volúmenes de audio digitalizado sin intervención manual, gracias a su tamaño compacto (0,2 GB) y su naturaleza de modelo especializado.
- **Investigación en music information retrieval (MIR)**: sirve como baseline o componente de detección de música en experimentos académicos sobre segmentación y clasificación de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0,2 GB en safetensors), es probable que quepa en GPUs consumer con 4-8 GB de VRAM, pero no se documenta oficialmente.
- GPU recomendadas: no disponible; por tamaño, cabría esperar compatibilidad con RTX 3060/4060 o superiores, pero no se confirma.
- Cabe en GPU consumer: probablemente sí, dado el tamaño del repo, aunque no se especifica.
- Opciones de despliegue: Transformers (pipeline `audio-classification`), con posible uso de vLLM/TGI no documentado; llama.cpp/Ollama no aplican (modelo de audio, no de texto).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (detección de música con SSL) con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- **Licencia restrictiva**: la `pantagruel-research-license` y el acceso gated implican condiciones específicas para uso comercial; es imprescindible revisar los términos antes de desplegar en producción.
- **Sesgos desconocidos**: no se documenta la composición del dataset de entrenamiento, por lo que no se pueden evaluar sesgos hacia géneros musicales, idiomas o tipos de audio concretos.
- **Riesgo de alucinación**: en clasificación, el riesgo se traduce en falsos positivos/negativos; no se dispone de métricas de precisión/recall publicadas.
- **Limitaciones de contexto e idioma**: no se especifican la duración máxima de audio procesable ni los idiomas cubiertos.
- **Dependencia de `custom_code`**: la carga requiere código personalizado, lo que puede complicar la integración en entornos estándar y la reproducibilidad.
- **Caveat para producción**: al ser un modelo especializado y con documentación escasa, se recomienda validación empírica en el dominio objetivo antes de su uso en sistemas críticos.

## Enlaces

- Hugging Face: https://huggingface.co/ina-foss/ssl-music-detection-no_music
- Modelo base: https://huggingface.co/ina-foss/ssl-audio-1k-no_music
- Organización: https://huggingface.co/ina-foss
- No se han encontrado en la información proporcionada papers, blogs, repositorios o demos adicionales.
