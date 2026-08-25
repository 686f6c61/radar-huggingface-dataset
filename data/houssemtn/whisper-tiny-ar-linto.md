# houssemtn/whisper-tiny-ar-linto

## Resumen

El modelo `houssemtn/whisper-tiny-ar-linto` es un ajuste fino (fine-tuning) del modelo de reconocimiento automático del habla (ASR) `openai/whisper-tiny` realizado por el usuario de Hugging Face `houssemtn`. Está diseñado para la transcripción de audio en árabe, aunque los resultados de evaluación publicados en su model card muestran un WER (Word Error Rate) del 100 % sobre el conjunto de evaluación, lo que indica que el modelo no produce transcripciones correctas en la práctica. Con 37,7 millones de parámetros, es una variante muy compacta de la familia Whisper, pensada para entornos con recursos limitados.

La relevancia de este modelo reside en su tamaño reducido y su licencia Apache 2.0, que permite uso comercial sin restricciones. Sin embargo, su rendimiento real es deficiente según los datos declarados por el autor, por lo que no es recomendable para producción sin una evaluación adicional o un reentrenamiento con datos adecuados. El repositorio no incluye información sobre el dataset de entrenamiento ni sobre los idiomas soportados más allá de la etiqueta "ar" en el nombre.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 448 tokens de audio (ventana de 30 segundos, estándar Whisper) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | Árabe (según el nombre del modelo; no hay confirmación en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper Tiny de OpenAI, un transformer encoder-decoder con atención multi-cabeza, diseñado para procesar espectrogramas de mel de 80 canales. El encoder procesa ventanas de 30 segundos de audio y el decoder genera los tokens de transcripción de forma autorregresiva. El ajuste fino se realizó con el framework Transformers de Hugging Face, utilizando el optimizador AdamW con una tasa de aprendizaje de 1e-5, batch de entrenamiento de 8 (16 con acumulación de gradientes), y un programador de tasa lineal con 50 pasos de calentamiento. Se entrenó durante 200 pasos (40 épocas según la tabla de resultados) con precisión mixta nativa.

El dataset de entrenamiento no está especificado en la model card (aparece como "None dataset"). Los resultados de entrenamiento muestran una pérdida de entrenamiento que desciende hasta 0,0019, pero la pérdida de validación aumenta progresivamente (de 1,5771 a 1,6682) y el WER se degrada de 91,67 % a 100 %, lo que sugiere un sobreajuste severo o un problema de alineación entre los datos de entrenamiento y evaluación.

## Capacidades

- Reconocimiento automático del habla (ASR) para árabe, según la intención del autor.
- Transcripción de audio en ventanas de 30 segundos (limitación inherente de Whisper Tiny).
- Generación de texto a partir de audio, sin soporte de traducción ni identificación de idioma (funciones presentes en Whisper original pero no verificadas en este ajuste).
- No se han documentado capacidades de tool calling, agentes, ni razonamiento multi-paso.
- No se ha verificado el soporte multilingüe más allá del árabe.

## Casos de uso

- Transcripción de audio en árabe para investigación: el modelo puede servir como punto de partida para experimentos académicos sobre ASR en árabe, aunque su WER actual lo hace inutilizable para transcripciones reales.
- Evaluación de pipelines de fine-tuning: permite estudiar el efecto de hiperparámetros y datasets en modelos pequeños, dado su tamaño reducido y bajo coste de entrenamiento.
- Pruebas de integración con Transformers: útil para verificar el flujo de carga de modelos ASR en entornos de desarrollo, sin necesidad de recursos de cómputo elevados.
- Benchmarking de infraestructura: al ser un modelo de 37,7 M de parámetros, puede usarse para medir latencia y throughput en diferentes GPUs o CPUs, aunque su salida no sea correcta.
- Educación sobre ASR: sirve como ejemplo didáctico de cómo se estructura un modelo Whisper y cómo se evalúa con WER, a pesar de su mal rendimiento.
- Prototipado rápido de aplicaciones de voz: si se reentrena con un dataset árabe adecuado, podría adaptarse a casos como asistentes de voz o subtitulado, pero en su estado actual no es viable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara un WER del 100 % en el conjunto de evaluación, con una pérdida de validación de 1,6682. La tabla de entrenamiento muestra la evolución:

| Training Loss | Epoch | Step | Validation Loss | Wer     |
|:-------------:|:-----:|:----:|:---------------:|:-------:|
| 1.5111        | 10.0  | 50   | 1.5771          | 91.6667 |
| 0.0195        | 20.0  | 100  | 1.5814          | 100.0   |
| 0.0025        | 30.0  | 150  | 1.6506          | 100.0   |
| 0.0019        | 40.0  | 200  | 1.6682          | 100.0   |

Estos datos indican que el modelo no transcribe correctamente ningún audio de evaluación, lo que lo hace inadecuado para cualquier uso práctico.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 (37,7 M de parámetros), aproximadamente 150 MB en FP16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo NVIDIA GTX 1050 Ti, RTX 2060, o incluso CPUs con suficiente RAM.
- Cabe en GPUs de consumo: sí, en prácticamente cualquier GPU moderna.
- Opciones de despliegue: Transformers (pipeline `automatic-speech-recognition`), vLLM (con soporte para Whisper), llama.cpp (con conversión a GGUF), Ollama (si se convierte), TGI (Text Generation Inference, aunque está orientado a LLM, puede usarse con adaptadores).
- Latencia y throughput estimados: no disponibles, pero al ser un modelo pequeño, la inferencia en GPU es casi instantánea (menos de 100 ms por ventana de 30 segundos en una RTX 3090).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER (árabe) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| houssemtn/whisper-tiny-ar-linto | 37,8 M | 30 s | 100 % (declarado) | Apache 2.0 | Hugging Face |
| openai/whisper-tiny | 37,8 M | 30 s | ~50-70 % (según dataset) | MIT | Hugging Face |
| openai/whisper-base | 74 M | 30 s | ~30-50 % (según dataset) | MIT | Hugging Face |
| openai/whisper-small | 244 M | 30 s | ~15-30 % (según dataset) | MIT | Hugging Face |

El modelo ajustado presenta un rendimiento muy inferior al Whisper Tiny original, que ya tiene un WER alto en árabe comparado con modelos más grandes. No se dispone de comparativas con otros fine-tunings específicos para árabe.

## Limitaciones y advertencias

- WER del 100 % en evaluación: el modelo no produce transcripciones correctas, lo que lo hace inutilizable para cualquier tarea real de ASR.
- Sobreajuste severo: la pérdida de entrenamiento desciende a valores casi nulos mientras la pérdida de validación aumenta, indicando que el modelo memoriza los datos de entrenamiento sin generalizar.
- Dataset de entrenamiento no documentado: la model card indica "None dataset", lo que impide evaluar la calidad de los datos o reproducir el entrenamiento.
- Sin información sobre sesgos: no se han documentado sesgos de género, dialecto o acento, aunque es probable que el modelo tenga problemas con variantes dialectales del árabe.
- Riesgo de alucinación: al no transcribir correctamente, el modelo puede generar texto arbitrario que no corresponde al audio, un riesgo crítico en aplicaciones de producción.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no es apto para producción en su estado actual.
- Limitación de contexto: solo procesa ventanas de 30 segundos, por lo que audios más largos requieren segmentación previa.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/houssemtn/whisper-tiny-ar-linto)
- [Perfil del autor en Hugging Face](https://huggingface.co/houssemtn)
- [Página de inferencia en FriendliAI](https://friendli.ai/models/houssemtn/whisper-tiny-ar-linto)
- [Repositorio de Whisper en GitHub](https://github.com/openai/whisper)
- [Tema sobre Whisper Tiny en emergentmind.com](https://www.emergentmind.com/topics/whisper-tiny)
