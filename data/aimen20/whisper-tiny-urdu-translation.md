# Aimen20/whisper-tiny-urdu-translation

## Resumen

El modelo `Aimen20/whisper-tiny-urdu-translation` es un ajuste fino (fine-tuning) del modelo de reconocimiento de voz `openai/whisper-tiny` realizado con la librería PEFT (Parameter-Efficient Fine-Tuning). El nombre sugiere que está orientado a la traducción o transcripción de audio en urdu, aunque la model card no especifica el idioma ni el conjunto de datos de entrenamiento. El repositorio fue creado en agosto de 2026 y no registra descargas ni valoraciones.

La relevancia de este modelo radica en que intenta adaptar un modelo ligero de Whisper a una lengua de bajos recursos como el urdu, un caso de uso habitual en entornos con restricciones de hardware. Sin embargo, los resultados de evaluación publicados muestran un WER (Word Error Rate) de 142.18 en el conjunto de validación, un valor extremadamente alto que indica que las transcripciones generadas no son utilizables en la práctica. La pérdida final es de 2.5775, lo que confirma un ajuste deficiente. En su estado actual, el modelo no es apto para tareas reales de transcripción o traducción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper-tiny (encoder-decoder transformer, basado en openai/whisper-tiny) |
| Parametros totales | no disponible (el modelo base tiene 39M; los adaptadores PEFT son adicionales) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no disponible (el nombre sugiere urdu, pero no se confirma) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-tiny`, un transformer encoder-decoder con aproximadamente 39 millones de parámetros, diseñado para reconocimiento de voz multilingüe. El ajuste se realizó mediante PEFT, lo que implica que solo se entrenaron adaptadores de bajo rango sobre los pesos congelados del modelo base. No se especifica qué tipo de adaptadores se usaron (LoRA, IA3, etc.), aunque la librería PEFT 0.13.2 sugiere un enfoque estándar.

El entrenamiento se ejecutó durante 5 épocas con un tamaño de lote efectivo de 8 (lote de 1 con acumulación de gradientes de 8), una tasa de aprendizaje de 0.0001, optimizador AdamW y scheduler lineal. Se utilizó precisión mixta nativa (AMP). El conjunto de datos de entrenamiento no está documentado, ni su composición ni su tamaño. No se menciona el uso de RLHF, DPO ni ninguna técnica de alineación adicional. La pérdida de entrenamiento desciende de 2.95 a 2.44 a lo largo del proceso, pero la pérdida de validación apenas mejora, pasando de 2.94 a 2.58, lo que indica un sobreajuste o una falta de generalización.

## Capacidades

- Transcripción de audio a texto: en teoría, el modelo debería transcribir audio, pero el WER de 142.18 en validación indica que las salidas no se corresponden con las transcripciones de referencia.
- Traducción de audio: el nombre sugiere traducción, pero no hay evidencia de que funcione correctamente.
- Soporte de tool calling / function calling: no aplica, es un modelo de audio.
- Soporte de agentes y multi-step reasoning: no aplica.
- Capacidades multilingües: no confirmadas; el modelo base Whisper-tiny soporta múltiples idiomas, pero el ajuste no documenta qué idiomas mantiene.
- Capacidades especiales: ninguna adicional más allá de las del modelo base.

## Casos de uso

Dado el rendimiento deficiente (WER > 100%), no se recomienda su uso en ningún escenario de producción. Los casos de uso que se enumeran a continuación son hipotéticos y solo serían válidos si el modelo se reentrenara o corrigiera:

- Transcripción de reuniones en urdu: el modelo podría transcribir grabaciones de reuniones, pero el WER actual lo impide.
- Subtitulado automático de vídeos en urdu: necesitaría una precisión mínima que no alcanza.
- Asistente de voz para urdu: requeriría integración con pipelines de ASR y un WER inferior al 30%.
- Traducción automática de noticias habladas: no es viable con estos resultados.
- Investigación académica sobre fine-tuning de Whisper en lenguas de bajos recursos: el repositorio puede servir como referencia metodológica, aunque no como modelo funcional.
- Pruebas de concepto en entornos educativos: para demostrar el flujo de entrenamiento con PEFT, pero sin expectativas de calidad.

## Benchmarks y rendimiento

El model-index de HuggingFace no declara resultados oficiales (results: []). Sin embargo, la model card incluye la siguiente tabla de entrenamiento y validación:

| Training Loss | Epoch | Step | Validation Loss | Wer |
|:-------------:|:-----:|:----:|:---------------:|:---:|
| 2.9562 | 0.1443 | 300 | 2.9454 | 208.4930 |
| 2.9206 | 0.2886 | 600 | 2.8887 | 205.3314 |
| 2.8666 | 0.4330 | 900 | 2.8494 | 178.6712 |
| 2.8430 | 0.5773 | 1200 | 2.8188 | 186.4584 |
| 2.7392 | 0.7216 | 1500 | 2.7903 | 171.4931 |
| 2.8047 | 0.8659 | 1800 | 2.7665 | 178.2949 |
| 2.7750 | 1.0102 | 2100 | 2.7431 | 177.8229 |
| 2.5834 | 1.1545 | 2400 | 2.7294 | 164.5640 |
| 2.6809 | 1.2992 | 2700 | 2.7163 | 151.4639 |
| 2.6568 | 1.4435 | 3000 | 2.6999 | 169.2754 |
| 2.5603 | 1.5879 | 3300 | 2.6855 | 177.0224 |
| 2.6434 | 1.7322 | 3600 | 2.6732 | 151.2138 |
| 2.6408 | 1.8765 | 3900 | 2.6654 | 168.8480 |
| 2.5836 | 2.0208 | 4200 | 2.6530 | 164.6303 |
| 2.4874 | 2.1651 | 4500 | 2.6487 | 144.3554 |
| 2.4716 | 2.3094 | 4800 | 2.6400 | 153.7881 |
| 2.4834 | 2.4538 | 5100 | 2.6312 | 157.4022 |
| 2.4541 | 2.5981 | 5400 | 2.6242 | 151.4867 |
| 2.5193 | 2.7424 | 5700 | 2.6174 | 165.4145 |
| 2.5899 | 2.8867 | 6000 | 2.6127 | 143.0068 |
| 2.3903 | 3.0310 | 6300 | 2.6086 | 154.1383 |
| 2.4025 | 3.1761 | 6600 | 2.6059 | 141.9899 |
| 2.3847 | 3.3204 | 6900 | 2.6014 | 155.2259 |
| 2.4759 | 3.4647 | 7200 | 2.5977 | 148.1391 |
| 2.4188 | 3.6090 | 7500 | 2.5945 | 137.2817 |
| 2.4015 | 3.7533 | 7800 | 2.5913 | 141.5211 |
| 2.4276 | 3.8977 | 8100 | 2.5866 | 149.3605 |
| 2.3615 | 4.0420 | 8400 | 2.5853 | 141.9116 |
| 2.3407 | 4.1863 | 8700 | 2.5848 | 137.8450 |
| 2.3297 | 4.3306 | 9000 | 2.5817 | 143.2286 |
| 2.3397 | 4.4749 | 9300 | 2.5810 | 143.7572 |
| 2.3974 | 4.6192 | 9600 | 2.5792 | 143.9388 |
| 2.4086 | 4.7636 | 9900 | 2.5785 | 142.3488 |
| 2.4458 | 4.9079 | 10200 | 2.5775 | 142.1845 |

Un WER de 142.18 significa que el modelo produce más errores que palabras en la transcripción de referencia, lo que indica que las salidas son prácticamente aleatorias o no están alineadas con el audio. No se han publicado comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: al estar basado en Whisper-tiny (39M parámetros), el modelo base requiere menos de 1 GB en FP32. Con los adaptadores PEFT, el uso adicional es mínimo. Se puede ejecutar en CPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (ej. NVIDIA GTX 1050, RTX 2060) o incluso CPU. No requiere hardware especializado.
- Compatibilidad con GPU de consumo: sí, cualquier GPU moderna es suficiente.
- Opciones de despliegue: al ser un modelo PEFT, se puede cargar con Transformers y PEFT. No se proporcionan archivos GGUF ni está preparado para llama.cpp u Ollama. Se puede usar con vLLM si se convierte, pero no es el formato habitual para Whisper.
- Latencia y throughput: no se han publicado mediciones. Dado el tamaño reducido, la latencia en CPU sería de unos pocos segundos para audio de 30 s, pero sin garantías de calidad.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo base `openai/whisper-tiny` tiene un WER mucho menor en tareas estándar (por ejemplo, en LibriSpeech, Whisper-tiny logra un WER de alrededor de 7.5 en inglés limpio, aunque no se ha verificado en urdu). Otros modelos como `openai/whisper-small` o `openai/whisper-base` podrían servir de referencia, pero no hay datos públicos de este ajuste frente a ellos. Por tanto, la comparativa se limita a lo siguiente:

| Modelo | Parametros | Contexto | WER (validacion) | Licencia |
|---|---|---|---|---|
| Aimen20/whisper-tiny-urdu-translation | ~39M + adaptadores | 30 s (base) | 142.18 | Apache 2.0 |
| openai/whisper-tiny (base) | 39M | 30 s | no disponible para urdu | MIT (original) |

El WER del modelo ajustado es anómalo y no puede compararse con el del modelo base sin datos específicos para urdu.

## Limitaciones y advertencias

- El WER de validación es 142.18, un valor que indica que el modelo no produce transcripciones útiles. Cualquier uso en producción es inviable.
- No se especifica el idioma de entrenamiento ni el conjunto de datos; el nombre sugiere urdu, pero no hay confirmación.
- El modelo fue generado automáticamente por Trainer, por lo que la model card carece de descripciones detalladas de uso, limitaciones y datos de entrenamiento.
- No hay evidencia de que se haya realizado una evaluación con métricas adicionales (BLEU, ROUGE, etc.) para tareas de traducción.
- La licencia Apache 2.0 permite uso comercial, pero el rendimiento actual hace que no tenga valor práctico.
- Riesgo de alucinación: dado el WER extremo, es probable que el modelo genere texto no relacionado con el audio de entrada.
- No se proporcionan instrucciones de uso ni ejemplos de carga en el repositorio.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Aimen20/whisper-tiny-urdu-translation
- Modelo base: https://huggingface.co/openai/whisper-tiny
