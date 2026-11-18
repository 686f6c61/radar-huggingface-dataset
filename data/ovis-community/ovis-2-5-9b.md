# ovis-community/ovis-2.5-9B

## Resumen

Ovis2.5-9B es un modelo multimodal de la familia Ovis, desarrollado originalmente por ATH-MaaS y redistribuido por la comunidad `ovis-community` como una versión nativa para Transformers. El modelo procesa entradas de imagen, vídeo y texto para generar respuestas textuales, cubriendo tareas de image-to-text, video-to-text e image-text-to-text. Cuenta con 9.174.807.784 parámetros y un repositorio de 18,4 GB en formato safetensors.

La relevancia de esta ficha concreta reside en su empaquetado: la versión de `ovis-community` incorpora configuración, tokenizer, procesador de imagen y procesador de vídeo nativos, de modo que las clases `AutoModelForImageTextToText` y `AutoProcessor` de Transformers pueden cargar el modelo sin recurrir a `trust_remote_code=True`. Los pesos se copian sin modificar desde la revisión `d73b2283ae2a930b7762f8d7b8b8a3f0f3b5c3bd` del checkpoint original `ATH-MaaS/Ovis2.5-9B`.

El soporte nativo en Transformers se está incorporando mediante el PR huggingface/transformers#47659, por lo que hasta que dicho cambio llegue a una release estable es necesario usar un checkout que incluya el PR. La licencia es Apache 2.0, lo que facilita su uso comercial y su integración en productos derivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal de la familia Ovis2.5; detalles de capas y atención no publicados en la información disponible) |
| Parametros totales | 9.174.807.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo distribuye safetensors en precisión original) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (shards e índice de pesos) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna (número de capas, mecanismo de atención, estrategia de fusión visión-lenguaje) ni sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO). La model card de esta redistribución remite explícitamente a la model card original de `ATH-MaaS/Ovis2.5-9B` para los detalles de arquitectura, uso previsto, limitaciones y atribución.

La innovación técnica documentada en esta versión es de integración, no de modelado: se regeneran la configuración nativa, el procesador y los metadatos del tokenizer para la implementación Ovis2.5 de Transformers, mientras que los shards de pesos, el índice, el vocabulario BPE, la `LICENSE` y el `NOTICE` se copian sin cambios desde la revisión original. Transformers aplica el mapeo de nombres de pesos registrado para Ovis2.5 durante la carga.

## Capacidades

- Generación de texto condicionada por imagen (image-to-text) y por vídeo (video-to-text).
- Entrada combinada de imagen, texto y vídeo en una misma conversación (image-text-to-text).
- Procesamiento de vídeo mediante un procesador específico incluido en el repositorio.
- Carga nativa con `AutoModelForImageTextToText` y `AutoProcessor` sin `trust_remote_code=True`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Descripción automática de imágenes en catálogos de producto: el modelo recibe una imagen y genera una ficha textual descriptiva, aprovechando su pipeline image-to-text para poblar metadatos de e-commerce.
- Moderación de contenido visual: análisis de imágenes enviadas por usuarios para generar descripciones textuales que un clasificador posterior pueda evaluar, reduciendo la necesidad de revisión manual.
- Accesibilidad: generación de descripciones alternativas de imágenes y fotogramas de vídeo para lectores de pantalla y documentos accesibles.
- Análisis de vídeo de vigilancia o industria: extracción de descripciones textuales de secuencias de vídeo mediante el procesador de vídeo incluido, para indexación y búsqueda posterior.
- Asistente documental multimodal: respuesta a preguntas sobre capturas, diagramas o diapositivas en conversaciones multi-turno, usando el pipeline image-text-to-text.
- Prototipado e investigación en visión-lenguaje: al cargarse con las clases estándar de Transformers y licencia Apache 2.0, sirve como base para experimentos de fine-tuning y evaluación sin dependencias de código remoto.
- Integración en pipelines de datos: generación de anotaciones textuales sobre lotes de imágenes o vídeos para construir datasets etiquetados de forma semiautomática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión original (safetensors, ~9,17 mil millones de parámetros): aproximadamente 18-19 GB solo para pesos en fp16/bf16, más memoria para activaciones y caché KV; el repositorio ocupa 18,4 GB.
- Cuantizaciones GGUF/AWQ/GPTQ: no disponibles en el repositorio; no se han publicado requisitos para formatos cuantizados.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño de pesos, un despliegue en bf16 requiere GPUs con 24 GB o más de memoria (por ejemplo, A100, H100 o RTX 4090), aunque esta estimación no está confirmada por el autor.
- ¿Cabe en GPU de consumo? Con los pesos en bf16 no cabe en GPUs de 8-16 GB; requeriría cuantización, que no está publicada.
- Opciones de despliegue: Transformers con `AutoModelForImageTextToText` y `AutoProcessor`, usando un checkout que incluya el PR huggingface/transformers#47659. Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de la misma categoría (visión-lenguaje de ~9B) que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; la model card de esta redistribución remite a la del modelo original para limitaciones.
- Riesgo de alucinación: no cuantificado; como modelo generativo multimodal, puede producir descripciones inexactas de imágenes o vídeos, por lo que conviene validar sus salidas en producción.
- Contexto e idiomas: la longitud de contexto y los idiomas soportados no están documentados en esta ficha; no deben asumirse.
- Dependencia de Transformers: hasta que el PR #47659 se integre en una release, es necesario usar un checkout con dicho cambio; con versiones estables de Transformers la carga puede fallar.
- Licencia: Apache 2.0 permite uso comercial, pero deben conservarse `LICENSE` y `NOTICE` copiados del checkpoint original, y mantenerse la atribución a ATH-MaaS.
- Esta es una redistribución comunitaria: los pesos no se han modificado, pero el mantenimiento y el soporte dependen de `ovis-community`, no del autor original.
- No se han publicado cuantizaciones oficiales, lo que limita el despliegue en hardware de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ovis-community/ovis-2.5-9B
- Modelo original: https://huggingface.co/ATH-MaaS/Ovis2.5-9B
- PR de soporte nativo en Transformers: https://github.com/huggingface/transformers/pull/47659
- Repositorio de Transformers: https://github.com/huggingface/transformers
