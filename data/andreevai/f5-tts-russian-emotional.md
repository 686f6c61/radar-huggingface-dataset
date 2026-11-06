# Andreevai/f5-tts-russian-emotional

## Resumen

Russian Emotional TTS es un modelo de texto a voz (TTS) en ruso desarrollado por Andreevai a partir de la arquitectura F5-TTS, basada en un Diffusion Transformer (DiT) con flow matching. El modelo se ha ajustado (fine-tuning) sobre más de 14 horas de diálogos teatrales rusos de estudio con carga emocional, lo que le permite generar habla expresiva y natural, además de realizar clonación de voz zero-shot a partir de clips de referencia de 3 a 10 segundos.

Una de sus características diferenciales es el soporte de anotación explícita de acento léxico mediante marcadores `+` antes de la vocal tónica (por ejemplo, `прив+ет`), lo que resuelve ambigüedades de homógrafos en ruso y mejora la prosodia. El sistema combina un backbone acústico DiT de unos 337 millones de parámetros con el vocoder neuronal Vocos a 24 kHz (13,5 millones de parámetros adicionales). Se distribuye bajo licencia MIT en formato safetensors, lo que lo hace apto para uso comercial sin restricciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con flow matching (F5-TTS Base v2) + vocoder Vocos 24 kHz |
| Parametros totales | 337.096.836 (backbone DiT) + ~13,5 M (Vocos), ~350 M en total |
| Parametros activos | No aplica (no es MoE); todos los parámetros están activos |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se entrenó con optimizador Adam 8-bit, pero los pesos se distribuyen sin cuantizar) |
| Idiomas soportados | Ruso (ru) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en F5-TTS DiT Base v2, una arquitectura de difusión transformer que emplea flow matching para mapear texto a características acústicas. La configuración del backbone es la siguiente: dimensión del modelo 1024, profundidad 22 capas, 16 cabezas de atención, factor de multiplicación del feed-forward de 2, dimensión textual de 512 y 4 capas convolucionales. Las características acústicas se convierten en audio mediante el vocoder neuronal Vocos a 24 kHz en mono. El modelo se sirve de la biblioteca `f5-tts` para inferencia y admite ajuste de velocidad de habla y número de pasos de evaluación de flujo (NFE, 32 por defecto).

El ajuste fino se realizó sobre el conjunto de datos `langswap/dialogs-ru-emotional-conversations`, que contiene más de 14 horas de conversaciones actores rusos grabadas en calidad de estudio con carga emocional. El entrenamiento se llevó a cabo en una única NVIDIA GeForce RTX 5060 de 8 GB de VRAM, utilizando el optimizador Adam de 8 bits de la biblioteca `bitsandbytes` con batching dinámico. La métrica declarada en la model card es WER (word error rate), aunque no se publican valores concretos.

## Capacidades

- Síntesis de voz en ruso con expresividad emocional, gracias al entrenamiento con diálogos teatrales de alta fidelidad.
- Clonación de voz zero-shot: replica el timbre de un hablante a partir de un clip de audio limpio de 3 a 10 segundos junto con su transcripción.
- Soporte de acento léxico explícito mediante marcadores `+` antes de la vocal tónica, útil para desambiguar homógrafos rusos y controlar la pronunciación.
- Audio de salida a 24.000 Hz en mono, calidad de estudio.
- Control de velocidad de generación (parámetro `speed`) y de calidad/latencia mediante pasos NFE configurables.
- Interfaz web lista para usar mediante notebook de Colab con Gradio.
- No soporta tool calling, agentes ni capacidades de visión o texto: es un modelo especializado exclusivamente en TTS.

## Casos de uso

- Doblahe y locución de contenido audiovisual en ruso: la carga emocional del dataset de entrenamiento lo hace adecuado para dar voz a personajes en animaciones, videojuegos o audiolibros dramatizados.
- Clonación de voz para producción de contenido: con 3-10 segundos de audio de referencia se puede replicar el timbre de un locutor para generar nuevas locuciones sin sesiones de grabación adicionales.
- Asistentes de voz y chatbots hablados en ruso: la generación con flow matching permite integrar síntesis de voz en pipelines conversacionales, ajustando NFE para equilibrar latencia y calidad.
- Audiolibros y podcasts en ruso: el soporte de marcadores de acento léxico permite controlar la pronunciación de homógrafos, algo crítico en textos literarios rusos.
- Accesibilidad: generación de narración para lectores de pantalla o contenidos educativos en ruso con voz natural y expresiva.
- Preproducción de doblaje (previz): generación rápida de pistas temporales de voz con distintos timbres antes de grabar actores reales.
- Investigación en TTS emocional: al ser un modelo abierto con licencia MIT y dataset público, sirve como base para experimentos de síntesis expresiva y transferencia de emoción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara WER como métrica de referencia, pero no incluye valores numéricos ni comparativas con otros modelos TTS.

## Requisitos de hardware

- Inferencia en GPU: el modelo completo (~350 M de parámetros en safetensors, repo de 1,3 GB) cabe cómodamente en GPUs de consumo. El propio autor entrenó el modelo en una RTX 5060 de 8 GB, por lo que la inferencia es viable en GPUs de 6-8 GB de VRAM o más.
- GPU recomendadas: cualquier GPU NVIDIA moderna con CUDA (RTX 3060, RTX 4060, RTX 4090, T4 en Colab, etc.). El notebook de demo oficial está diseñado para una T4 gratuita de Google Colab.
- CPU: la inferencia en CPU es posible según el código de la biblioteca f5-tts, aunque sin datos de latencia publicados; se recomienda GPU para uso interactivo.
- Despliegue: mediante la biblioteca `f5-tts` (pip install f5-tts), con ejemplo de inferencia en Python incluido en la model card; demo web vía Gradio en Colab. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponible. El parámetro `nfe_step` (32 por defecto) permite reducir los pasos de difusión para acelerar la generación a costa de calidad.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Licencia | Características distintivas |
|---|---|---|---|---|
| Andreevai/f5-tts-russian-emotional | ~350 M (DiT + Vocos) | Ruso | MIT | Fine-tuning emocional, acento léxico con `+`, clonación zero-shot, safetensors |
| SWivid/F5-TTS (base) | ~336 M (DiT) | Multilingüe (inglés/chino principalmente) | MIT (código) / CC-BY-NC (checkpoints originales) | Modelo base original, sin especialización emocional en ruso |
| XTTS-v2 (Coqui) | ~750 M | Multilingüe (incluye ruso) | Coqui Public Model License (no comercial sin permiso) | Clonación de voz multilingüe, pero licencia restrictiva para uso comercial |

La principal ventaja de esta ficha frente a alternativas multilingües como XTTS-v2 es la combinación de licencia MIT sin restricciones comerciales, especialización en ruso con datos emocionales de estudio y anotación explícita de acento léxico.

## Limitaciones y advertencias

- El modelo está especializado en ruso; no hay soporte declarado para otros idiomas.
- El entrenamiento se realizó sobre diálogos teatrales emocionales, por lo que el estilo de habla puede resultar excesivamente expresivo para aplicaciones que requieran tono neutro (noticias, locución corporativa).
- No se publican métricas cuantitativas (WER, MOS), por lo que la calidad debe validarse empíricamente antes de uso en producción.
- Como todo modelo de clonación de voz, puede usarse indebidamente para suplantación de identidad (deepfakes de audio); es responsabilidad del usuario obtener consentimiento de los hablantes clonados.
- La descarga actual es muy baja (113 descargas y 1 like en el momento de redactar la ficha), lo que implica escasa validación por parte de la comunidad y posible falta de mantenimiento.
- La licencia MIT no impone restricciones comerciales, pero no exime de cumplir la legislación aplicable sobre derechos de imagen y voz.
- No hay información sobre sesgos del dataset más allá de su composición (conversaciones de actores), ni sobre robustez frente a acentos no estándar del ruso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Andreevai/f5-tts-russian-emotional
- Notebook de Colab para demo: https://huggingface.co/Andreevai/f5-tts-russian-emotional/resolve/main/russian_emotional_tts_colab.ipynb
- Dataset de entrenamiento: https://huggingface.co/datasets/langswap/dialogs-ru-emotional-conversations
- Google Colab (para ejecutar la demo): https://colab.research.google.com/
- Biblioteca f5-tts (PyPI): https://pypi.org/project/f5-tts/
