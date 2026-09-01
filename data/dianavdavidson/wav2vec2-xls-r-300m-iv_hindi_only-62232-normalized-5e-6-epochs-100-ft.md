# dianavdavidson/wav2vec2-xls-r-300m-iv_hindi_only-62232-normalized-5e-6-epochs-100-FT

## Resumen

Este modelo es un ajuste fino (fine-tune) de `facebook/wav2vec2-xls-r-300m`, un sistema de reconocimiento automático del habla (ASR) basado en la arquitectura wav2vec 2.0, preentrenado por el equipo de Meta AI sobre 436 000 horas de audio multilingüe en 128 idiomas. El autor, `dianavdavidson`, ha adaptado el modelo a un conjunto de datos no especificado, presumiblemente en hindi (según el nombre del repositorio), con una tasa de aprendizaje de 5e-6 y 100 épocas. El resultado es un modelo de 315 millones de parámetros con licencia Apache 2.0, pero los datos de evaluación publicados en la model card muestran un WER (Word Error Rate) global del 100 %, lo que indica que el ajuste no ha producido un sistema funcional. A pesar de su falta de utilidad práctica, el modelo puede servir como ejemplo de un proceso de fine-tuning fallido o como punto de partida para investigaciones sobre diagnóstico de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (XLS-R 300M) |
| Parametros totales | 315 512 520 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre sugiere hindi, pero no se confirma) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura wav2vec 2.0, que emplea un codificador convolucional para extraer representaciones latentes del audio y un transformer para modelar dependencias temporales. El modelo base XLS-R 300M fue preentrenado de forma autosupervisada en 128 idiomas, y este repositorio lo ajusta para una tarea de ASR supervisada. Los hiperparámetros de entrenamiento declarados son: learning rate 5e-6, batch de entrenamiento 16 (con acumulación de gradientes 2, batch efectivo 32), optimizador AdamW, scheduler constante con warmup de 500 pasos, 100 épocas y precisión mixta nativa. No se especifica el dataset de entrenamiento ni el de evaluación, y no se mencionan innovaciones técnicas adicionales. La pérdida de entrenamiento desciende de 26,36 a 7,55, pero el WER de validación permanece en 100 % durante todo el proceso, lo que sugiere que el modelo no logra aprender a transcribir correctamente.

## Capacidades

- Reconocimiento de voz automático (ASR): el modelo está diseñado para transcribir audio a texto, pero los resultados de evaluación muestran un WER del 100 %, lo que implica que no produce transcripciones correctas en el conjunto de validación.
- No se documentan otras capacidades como tool calling, agentes o razonamiento multimodal.

## Casos de uso

- Investigación sobre fallos de entrenamiento: el modelo puede utilizarse para analizar por qué un fine-tuning de XLS-R no converge, estudiando la evolución de la pérdida y el WER.
- Pruebas de pipelines de ASR: sirve para verificar que un sistema de inferencia (por ejemplo, con transformers o torchaudio) maneja correctamente modelos con salidas degeneradas.
- Punto de partida para reentrenamiento: un investigador podría tomar estos pesos y continuar el ajuste con un dataset adecuado, aunque es más recomendable partir del modelo base original.
- No es adecuado para producción ni para aplicaciones reales de transcripción debido a su WER del 100 %.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente los siguientes datos de evaluación declarados por el autor:

| Metrica | Valor |
|---|---|
| Loss de validación | 3,5582 |
| WER global | 100,0 |

Estos valores indican que el modelo no reconoce correctamente ningún fragmento de audio en el conjunto de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 315 M parámetros, en precisión fp32 ocupa aproximadamente 1,3 GB de memoria, y en fp16 unos 0,7 GB. Sin embargo, no se dispone de mediciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar la inferencia en fp32 (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, etc.). Para entrenamiento se necesitaría más memoria, pero no se especifican requisitos.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo básicas.
- Opciones de despliegue: compatible con la librería `transformers` de Hugging Face, así como con pipelines de ASR de `torchaudio`. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (evaluación) | Licencia |
|---|---|---|---|---|
| Este modelo (fine-tune hindi) | 315 M | no disponible | 100 % | Apache 2.0 |
| facebook/wav2vec2-xls-r-300m (base) | 300 M | no disponible | no reportado | Apache 2.0 |
| Otros fine-tunes de XLS-R para hindi (p. ej., `dianavdavidson/wav2vec2-large-xlsr-hindi-...`) | ~315 M | no disponible | no disponible | Apache 2.0 |

El modelo base XLS-R 300M, sin fine-tuning, no está diseñado para ASR directo (requiere una cabeza de clasificación), por lo que no se puede comparar directamente. No se dispone de datos de rendimiento de otros fine-tunes similares.

## Limitaciones y advertencias

- El WER de validación es del 100 %, lo que indica que el modelo no transcribe correctamente ningún audio de evaluación; no es utilizable para tareas reales de ASR.
- El dataset de entrenamiento y evaluación no está documentado, lo que impide conocer el dominio de aplicación y posibles sesgos.
- No se ha evaluado el modelo en otros idiomas ni en condiciones de ruido, acentos o variaciones dialectales.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no ofrece valor práctico en su estado actual.
- No se han publicado análisis de sesgos, alucinaciones (en el sentido de transcripciones inventadas) ni limitaciones de contexto, más allá de la evidente falta de funcionalidad.

## Enlaces

- [Repositorio Hugging Face del modelo](https://huggingface.co/dianavdavidson/wav2vec2-xls-r-300m-iv_hindi_only-62232-normalized-5e-6-epochs-100-FT)
- [Modelo base facebook/wav2vec2-xls-r-300m](https://huggingface.co/facebook/wav2vec2-xls-r-300m)
- [Documentación de torchaudio para WAV2VEC2_XLSR_300M](https://docs.pytorch.org/audio/stable/generated/torchaudio.pipelines.WAV2VEC2_XLSR_300M.html)
- [Paper original de XLS-R (arXiv:2111.09296)](https://arxiv.org/abs/2111.09296)
