# BayeDemba/whisper-wolof-demba

## Resumen

El modelo `BayeDemba/whisper-wolof-demba` es un ajuste fino (fine-tune) de `openai/whisper-small` sobre el dataset Common Voice 11.0, concretamente en la configuración `hi` (hindi). A pesar de su nombre, que sugiere wolof, los metadatos indican que el idioma de entrenamiento es hindi. Fue desarrollado por el usuario BayeDemba y publicado en Hugging Face con licencia Apache-2.0. El modelo está diseñado para la tarea de reconocimiento automático del habla (ASR), pero los resultados de evaluación muestran un rendimiento muy deficiente, con un WER de 178.13, lo que indica que la transcripción es prácticamente inutilizable en la práctica.

Con 241,7 millones de parámetros, hereda la arquitectura del Whisper Small de OpenAI, un transformer encoder-decoder entrenado para reconocimiento y traducción de voz. El ajuste se realizó con solo 50 pasos de entrenamiento, lo que explica la falta de convergencia. Este modelo es relevante como ejemplo de los riesgos de un fine-tuning insuficiente y de la importancia de validar los resultados antes de cualquier despliegue.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Small) |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 448 tokens de audio (30 segundos de audio) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, se puede cuantizar con herramientas externas) |
| Idiomas soportados | hindi (etiqueta `hi`), aunque el nombre sugiere wolof; no se ha verificado el soporte real |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper Small de OpenAI, un transformer encoder-decoder con atención estándar, entrenado originalmente sobre 680.000 horas de audio etiquetado de forma débil. En este caso, se realizó un ajuste fino sobre el dataset Common Voice 11.0 (configuración `hi`), con un total de 50 pasos de entrenamiento, un learning rate de 1e-5, batch de entrenamiento de 16 y evaluación de 8, usando el optimizador AdamW y un scheduler lineal con 500 pasos de warmup. La pérdida de validación final fue de 3.1532 y el WER de 178.13, lo que indica que el modelo no aprendió a transcribir correctamente. No se menciona el uso de técnicas como RLHF o DPO; el entrenamiento fue supervisado estándar con pérdida de entropía cruzada.

## Capacidades

- Reconocimiento automático del habla (ASR) en hindi, aunque con un rendimiento extremadamente bajo (WER > 178).
- No se han documentado capacidades de traducción de voz, tool calling, agentes o razonamiento multi-paso.
- No se ha verificado el soporte multilingüe más allá del hindi; el nombre del modelo sugiere wolof, pero no hay evidencia de que funcione en ese idioma.
- No se ha documentado ningún modo especial (thinking, visión, audio adicional, etc.).

## Casos de uso

Dado el WER de 178.13, el modelo no es apto para ningún caso de uso práctico en producción. Los siguientes escenarios son hipotéticos y solo podrían considerarse tras un reentrenamiento adecuado:

- Investigación educativa sobre fine-tuning de Whisper: puede servir como ejemplo de un ajuste fallido para estudiar los efectos de un entrenamiento insuficiente (solo 50 pasos) y la importancia de la validación.
- Pruebas de pipelines de ASR en entornos de desarrollo: se podría integrar en un pipeline de Hugging Face Transformers para depurar el flujo de datos, aunque las transcripciones serán incorrectas.
- Comparación de métricas: útil para contrastar con otros fine-tunes de Whisper en hindi o wolof, demostrando la diferencia entre un entrenamiento adecuado y uno deficiente.
- Demostración de riesgos de overfitting o underfitting: al tener una pérdida de entrenamiento de 3.58 y una de validación de 3.15, se puede analizar la falta de convergencia.
- Evaluación de la influencia del dataset: el uso de Common Voice 11.0 con configuración `hi` puede analizarse para entender por qué el modelo no generaliza.
- No se recomienda su uso en atención al cliente, transcripción médica, subtitulado o cualquier aplicación real.

## Benchmarks y rendimiento

Según el model-index declarado por el autor, el modelo obtuvo los siguientes resultados en el conjunto de test de Common Voice 11.0 (configuración `hi`):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Automatic Speech Recognition | Common Voice 11.0 (config: hi, split: test) | WER | 178.13 |

Este WER es extremadamente alto (un WER de 100 significa que cada palabra es incorrecta; valores superiores a 100 indican inserciones y sustituciones masivas). No se han publicado otros benchmarks. En comparación, el modelo `cibfaye/whisper-wolof` (también fine-tune de Whisper Small, pero sobre Google Fleurs) alcanza un WER de 43.94, lo que subraya la mala calidad de este ajuste.

## Requisitos de hardware

- VRAM estimada para inferencia: Whisper Small en FP16 requiere aproximadamente 1 GB de VRAM; en FP32, unos 2 GB. Con cuantización a 8 bits, puede bajar a ~0.5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, etc.). También puede ejecutarse en CPU, aunque con mayor latencia.
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPUs de consumo actuales.
- Opciones de despliegue: se puede usar con Hugging Face Transformers, vLLM (aunque Whisper no es típicamente servido con vLLM), llama.cpp (con conversión a GGUF), o mediante la API de OpenAI si se sube a un endpoint. También es compatible con el espacio de Hugging Face `openai/whisper` para demos.
- Latencia y throughput: no se han publicado datos específicos. Para Whisper Small, la latencia típica en GPU moderna es de ~0.5-1 segundo por 30 segundos de audio, pero en este modelo concreto no se ha medido.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Dataset | WER | Licencia |
|---|---|---|---|---|---|
| BayeDemba/whisper-wolof-demba | Whisper Small | 241M | Common Voice 11.0 (hi) | 178.13 | Apache-2.0 |
| cibfaye/whisper-wolof | Whisper Small | 241M | Google Fleurs | 43.94 | Apache-2.0 |
| openai/whisper-small (original) | - | 241M | 680k horas | ~7.5 (en inglés) | MIT (código) / Apache-2.0 (pesos) |

El modelo de BayeDemba es claramente inferior a otros fine-tunes de Whisper Small, incluso al modelo original sin ajuste. La diferencia en WER es abismal, lo que indica un problema grave en el proceso de entrenamiento.

## Limitaciones y advertencias

- Rendimiento inaceptable: el WER de 178.13 hace que el modelo no sea utilizable para transcripción real. Cualquier salida será mayoritariamente incorrecta.
- Entrenamiento insuficiente: solo 50 pasos de entrenamiento, lo que sugiere que el modelo no convergió. La pérdida de validación (3.15) es similar a la de entrenamiento (3.58), indicando underfitting.
- Discrepancia de idioma: el nombre del modelo sugiere wolof, pero el dataset y la etiqueta de idioma son `hi` (hindi). No hay evidencia de que funcione en wolof.
- Riesgo de alucinaciones: como todos los modelos de Whisper, puede generar texto que no está en el audio, pero en este caso el problema es más grave por la falta de entrenamiento.
- Licencia: Apache-2.0 permite uso comercial, pero dado el mal rendimiento, no se recomienda su uso en producción.
- Sin documentación adicional: la model card no proporciona información sobre sesgos, limitaciones de contexto o idioma más allá de lo indicado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/BayeDemba/whisper-wolof-demba)
- [Modelo base: openai/whisper-small](https://huggingface.co/openai/whisper-small)
- [Dataset: abdouaziiz/alffa](https://huggingface.co/datasets/abdouaziiz/alffa)
- [Repositorio de Whisper (OpenAI)](https://github.com/openai/whisper)
- [Modelo comparable: cibfaye/whisper-wolof](https://huggingface.co/cibfaye/whisper-wolof)
- [Simba: benchmark de modelos de voz africanos](https://africa.dlnlp.ai/simba/)
