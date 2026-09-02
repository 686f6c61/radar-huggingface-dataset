# MamadouGueyemmg/whisper-small-hi

## Resumen

Este modelo es un fine-tune de `openai/whisper-small` para reconocimiento automático de voz (ASR) en hindi, desarrollado por MamadouGueyemmg. Se basa en la arquitectura Whisper Small, un transformer encoder-decoder con aproximadamente 241,7 millones de parámetros, entrenado sobre el subconjunto en hindi del dataset Common Voice 11.0. El objetivo era adaptar el modelo base multilingüe a la transcripción específica del hindi, pero los resultados publicados muestran un WER (Word Error Rate) de 102,87 en el conjunto de test, un valor anómalo que indica que el modelo no produce transcripciones útiles en la práctica.

La relevancia de esta ficha radica en documentar un caso de fine-tune fallido o insuficientemente entrenado, útil como ejemplo de advertencia para desarrolladores que intentan adaptar Whisper a idiomas de bajos recursos. El entrenamiento se limitó a 50 pasos con un learning rate de 1e-5, lo que sugiere un underfitting severo. La licencia es Apache 2.0, lo que permite uso comercial, pero el rendimiento actual hace inviable cualquier despliegue en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper Small (transformer encoder-decoder) |
| Parametros totales | 241.734.912 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 30 segundos de audio (ventana fija de Whisper) |
| Tipos de cuantizacion | No disponible (pesos en FP32; se puede cuantizar con herramientas externas) |
| Idiomas soportados | Hindi (entrenado solo en hindi; el modelo base soporta 99 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Whisper Small: un encoder de audio basado en convoluciones y atención, y un decoder autoregresivo que genera texto. El fine-tune se realizó sobre el dataset `abdouaziiz/alffa`, que corresponde al subconjunto en hindi de Common Voice 11.0. Los hiperparámetros declarados incluyen learning rate de 1e-5, batch size de 16 para entrenamiento y 8 para evaluación, optimizador AdamW, scheduler lineal con 500 pasos de warmup y un total de 50 pasos de entrenamiento. Se usó mixed precision (AMP) nativo.

El entrenamiento fue extremadamente corto (0,0816 épocas), lo que explica la pérdida de validación de 3,1532 y el WER de 102,87. Un WER superior a 100 indica que el modelo no logra alinear ninguna transcripción correctamente, probablemente por falta de convergencia o por un problema en el preprocesado de los datos. No se documentan técnicas adicionales como data augmentation o ajuste de tokenizer.

## Capacidades

- Transcripción de audio en hindi: capacidad teórica, pero el WER de 102,87 demuestra que en la práctica no produce transcripciones válidas.
- Reconocimiento de voz multilingüe: el modelo base Whisper Small soporta 99 idiomas, pero este fine-tune solo fue entrenado en hindi, por lo que las capacidades multilingües se ven degradadas o anuladas.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No incluye modo de pensamiento, visión ni audio adicional más allá del ASR.
- No se reportan capacidades de traducción, aunque Whisper Small originalmente puede traducir a inglés; este fine-tune no lo documenta.

## Casos de uso

Dado el rendimiento extremadamente deficiente, los casos de uso prácticos son muy limitados. Se enumeran escenarios hipotéticos, pero con la advertencia explícita de que el modelo no es apto para producción:

- Investigación académica sobre fine-tune de Whisper en idiomas de bajos recursos: puede servir como ejemplo de entrenamiento insuficiente y de cómo interpretar métricas de WER anómalas.
- Pruebas de concepto en laboratorio para comparar estrategias de adaptación, siempre que se reemplace por un modelo con mejor convergencia.
- Depuración de pipelines de ASR: al fallar sistemáticamente, puede usarse para validar que un sistema de evaluación detecta errores graves.
- No se recomienda su uso en atención al cliente, generación de subtítulos, transcripción médica o cualquier aplicación que requiera precisión.

## Benchmarks y rendimiento

El autor declara el siguiente resultado en el model-index:

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Automatic Speech Recognition | Common Voice 11.0 (config: hi, split: test) | WER | 102,8736 |

Este valor es superior a 100, lo que indica que el modelo no produce ninguna transcripción correcta en el conjunto de evaluación. No se han publicado comparaciones con otros modelos. El modelo base `openai/whisper-small` reporta un WER típico de alrededor de 10-20 en inglés, pero no se dispone de datos específicos para hindi en esta ficha. No se puede afirmar que este fine-tune mejore o empeore respecto al base sin datos adicionales.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1 GB en FP32 (241,7 M parámetros × 4 bytes). Con cuantización a 8 bits, se reduce a ~250 MB; a 4 bits, ~125 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 3060, o incluso CPU con 8 GB de RAM para inferencia lenta.
- Es compatible con consumer GPUs de gama baja y media.
- Opciones de despliegue: vLLM, Hugging Face Transformers, TGI, llama.cpp (con conversión a GGUF), Ollama (si se convierte), y pipelines de `transformers` para ASR.
- Latencia y throughput: no disponibles para este fine-tune específico. En general, Whisper Small procesa audio en tiempo real en GPU moderna, pero con este modelo el resultado será inutilizable.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER (hi) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MamadouGueyemmg/whisper-small-hi | 241,7 M | 30 s | 102,87 | Apache 2.0 | Hugging Face |
| openai/whisper-small (base) | 241,7 M | 30 s | No disponible para hindi | MIT | Hugging Face |
| openai/whisper-medium | 769 M | 30 s | No disponible | MIT | Hugging Face |

No se dispone de datos de WER en hindi para el modelo base ni para otros fine-tunes. El modelo base Whisper Small es multilingüe y suele ofrecer un rendimiento razonable en hindi, aunque no se ha verificado aquí. Este fine-tune no aporta ninguna mejora y su rendimiento es claramente inferior al de cualquier modelo Whisper sin ajuste.

## Limitaciones y advertencias

- WER de 102,87: el modelo no transcribe correctamente ningún audio del conjunto de test. Cualquier uso en producción producirá resultados inútiles.
- Entrenamiento insuficiente: solo 50 pasos, lo que indica un underfitting severo. No se puede considerar un modelo funcional.
- Posibles problemas de datos: el dataset `abdouaziiz/alffa` no está documentado en detalle; podría contener etiquetas incorrectas o desalineación entre audio y texto.
- Sesgos: al estar entrenado solo en hindi, no generaliza a otros idiomas, y puede tener sesgos propios del corpus Common Voice (hablantes voluntarios, dominios limitados).
- Riesgo de alucinación: aunque no se ha medido, un modelo con pérdida alta tiende a generar texto no relacionado con el audio.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no es apto para ello. No hay restricciones de atribución, pero se recomienda no redistribuirlo como solución funcional.
- No se proporcionan instrucciones de uso, ni ejemplos de inferencia, ni documentación sobre limitaciones específicas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MamadouGueyemmg/whisper-small-hi
- Modelo base openai/whisper-small: https://huggingface.co/openai/whisper-small
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
- Guía sobre Whisper-Small-HI (referencia general, no específica de este fine-tune): https://bgill55.github.io/-weightandsee-guides/guides/whispersmallhi-the-tiny-transcriber-that-beats-cloud-apis/
- Página de Whisper Small en OpenSourcesAI: https://opensourcesai.com/models/whisper-small/
