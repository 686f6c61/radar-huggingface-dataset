# dianavdavidson/wav2vec2-xls-r-1b-mucs-62224-hinglish_mixed_scripts-1e-4-epochs-100-FT

## Resumen

Este modelo es un ajuste fino (fine-tuning) de `facebook/wav2vec2-xls-r-1b`, un sistema de reconocimiento automático del habla (ASR) basado en la arquitectura wav2vec 2.0, entrenado sobre un conjunto de datos no especificado que parece contener habla en hinglish (mezcla de hindi e inglés) con escritura mixta (devanagari y latina). El autor, `dianavdavidson`, ha publicado varios modelos similares con nombres que sugieren experimentos sistemáticos sobre este tipo de datos.

El modelo tiene 962,6 millones de parámetros, lo que lo sitúa en la gama alta de los sistemas ASR multilingües. Sin embargo, los resultados de validación muestran una pérdida final de 3,93 y un WER global del 100%, lo que indica que el ajuste no ha convergido adecuadamente y que el modelo no produce transcripciones útiles en la práctica. La ficha técnica oficial es mínima y no incluye información sobre el conjunto de datos, los idiomas soportados ni el procedimiento de entrenamiento más allá de los hiperparámetros básicos.

La relevancia de este modelo es limitada: se trata de un experimento de investigación más que de un sistema listo para producción. Aun así, puede servir como referencia para estudiar el comportamiento de wav2vec2 en condiciones de entrenamiento con datos ruidosos o mal etiquetados, o como punto de partida para un ajuste adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (transformer con convoluciones temporales y cuantización de vectores) |
| Parametros totales | 962.637.037 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (wav2vec2 procesa audio en segmentos; la duración máxima depende de la memoria) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre sugiere hinglish, pero no se especifica) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura base es wav2vec 2.0, un modelo de representación de habla auto-supervisado que combina una red convolucional para procesar la señal de audio cruda con un transformer que modela dependencias temporales. La versión XLS-R de 1B parámetros fue preentrenada por Meta sobre aproximadamente 436.000 horas de audio en 128 idiomas, y este modelo se ajusta sobre esa base.

El ajuste se realizó con una tasa de aprendizaje de 1e-4, tamaño de lote efectivo de 32 (tras acumulación de gradientes), optimizador AdamW, scheduler constante con warmup de 500 pasos y 100 épocas. Se usó precisión mixta nativa (AMP). Los datos de entrenamiento no están documentados; el nombre del modelo sugiere que provienen de un corpus llamado "mucs" con transcripciones en hinglish de escritura mixta, pero no hay confirmación.

El entrenamiento muestra un comportamiento inestable: la pérdida de validación baja hasta 1,28 en la época 2, pero luego sube bruscamente hasta 3,93 en la época 5, con un WER que pasa del 44% al 100%. Esto indica un fuerte sobreajuste o problemas graves con los datos o el etiquetado.

## Capacidades

- Reconocimiento de voz (ASR) en habla multilingüe, heredado del modelo base XLS-R.
- Potencial capacidad para hinglish con escritura mixta, aunque no verificada por resultados.
- Soporte de entrada de audio (16 kHz mono) y salida de texto.
- No compatible con tool calling, agentes, visión ni otras modalidades.
- No hay evidencia de capacidades multilingües adicionales más allá de las del base.

## Casos de uso

- Investigación académica: estudiar el efecto de datos ruidosos o mal etiquetados en el fine-tuning de wav2vec2, comparando con otros ajustes del mismo autor.
- Punto de partida para reentrenamiento: dado que la licencia es Apache 2.0, se puede tomar este checkpoint y continuar el entrenamiento con mejores datos o hiperparámetros.
- Análisis de errores: dado que el WER es del 100%, puede usarse como ejemplo de fallo de convergencia en documentación técnica o educativa.
- Benchmarking de calidad: comparar su rendimiento con otros modelos ASR para demostrar la importancia de un buen conjunto de datos.
- Prueba de pipelines de Hugging Face: sirve para validar integraciones con `transformers` y `safetensors` en entornos de desarrollo.
- No recomendado para producción ni para uso real de transcripción, dado que no produce salidas correctas.

## Benchmarks y rendimiento

El modelo card incluye una tabla de entrenamiento con la pérdida y el WER global por época:

| Training Loss | Epoch | Step | Validation Loss | Global Wer |
|:-------------:|:-----:|:----:|:---------------:|:----------:|
| 6.4489        | 1.0   | 828  | 1.3566          | 47.3187    |
| 1.8672        | 2.0   | 1656 | 1.2770          | 44.1550    |
| 1.6479        | 3.0   | 2484 | 1.4123          | 51.8341    |
| 2.0837        | 4.0   | 3312 | 2.7270          | 92.9722    |
| 8.1256        | 5.0   | 4140 | 3.9279          | 100.0      |

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o librispeech) en la información disponible. El modelo card declara un array de resultados vacío.

## Requisitos de hardware

- VRAM estimada: al tener 962M parámetros, en FP32 se necesitan unos 3,85 GB solo para los pesos; con precisión mixta o cuantización a 8 bits se puede reducir a ~1 GB. Sin embargo, el modelo está pensado para audio, por lo que la memoria adicional depende de la longitud de los segmentos de entrada.
- GPU recomendadas: una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3070, RTX 4060 o superior) es suficiente para inferencia en lote pequeño. Para entrenamiento o fine-tuning adicional se recomienda una A100 o H100.
- Sí cabe en GPUs de consumo: con cuantización a 8 bits o 4 bits y usando `transformers` con `bitsandbytes`, se puede ejecutar en una RTX 3060 de 12 GB.
- Opciones de despliegue: compatible con la librería `transformers` de Hugging Face, `vLLM` (aunque no es típico para ASR), `llama.cpp` no aplica (no es un modelo de lenguaje), y se puede servir mediante la API de inferencia de Hugging Face.
- Latencia y throughput: no disponibles; depende del hardware y de la longitud del audio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|
| Este modelo (fine-tune de XLS-R 1B) | 962M | no disponible | Apache 2.0 | WER 100% en validación |
| `facebook/wav2vec2-xls-r-1b` (base) | 962M | no disponible | Apache 2.0 | WER en librispeech ~2.5% (según publicaciones de Meta) |
| `facebook/wav2vec2-large-xlsr-53` | 317M | no disponible | Apache 2.0 | WER en librispeech ~3.0% (según publicaciones) |
| `openai/whisper-large-v3` | 1550M | 30 segundos de audio | MIT | WER en librispeech ~2.0% (según benchmarks públicos) |

El modelo base XLS-R 1B tiene un rendimiento excelente en reconocimiento multilingüe, pero este fine-tuning concreto lo degrada por completo. Comparado con Whisper large-v3, que es un modelo de propósito general con mejor rendimiento y licencia permisiva, este modelo no es competitivo.

## Limitaciones y advertencias

- WER del 100% en validación: el modelo no transcribe correctamente ningún audio en el conjunto de evaluación. No es usable para ningún fin práctico.
- La pérdida de validación aumenta drásticamente tras la época 2, lo que indica sobreajuste severo o problemas de etiquetado en los datos.
- No se documenta el conjunto de entrenamiento, ni los idiomas exactos, ni el vocabulario. El nombre sugiere hinglish con escritura mixta, pero no hay confirmación.
- La model card está generada automáticamente y no incluye información sobre sesgos, alucinaciones o limitaciones de contexto.
- Licencia Apache 2.0 permite uso comercial, pero el estado del modelo hace inviable su uso en producción.
- No hay garantía de que el modelo funcione con audio en otros idiomas más allá de los posibles datos de entrenamiento.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/dianavdavidson/wav2vec2-xls-r-1b-mucs-62224-hinglish_mixed_scripts-1e-4-epochs-100-FT)
- [Modelo base: facebook/wav2vec2-xls-r-1b](https://huggingface.co/facebook/wav2vec2-xls-r-1b)
- [Documentación de XLS-R en fairseq (GitHub)](https://github.com/facebookresearch/fairseq/blob/main/examples/wav2vec/xlsr/README.md)
- [Paper de XLS-R](https://research.facebook.com/publications/xls-r-self-supervised-cross-lingual-speech-representation-learning-at-scale/)
