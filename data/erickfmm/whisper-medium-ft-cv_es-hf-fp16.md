# erickfmm/whisper-medium-ft-cv_es-hf-fp16

## Resumen

Este modelo es un checkpoint de inferencia en float16 de un fine-tuning de `openai/whisper-medium` sobre el dataset Common Voice 26 en español (`es`), desarrollado por erickfmm dentro del proyecto `training-asr`. La particularidad técnica es que el encoder se mantiene congelado y solo se entrenan el decoder y la capa de proyección de salida (~457 M de parámetros), siguiendo las estrategias de Vividh-ASR y Gumbel-BEARD. El objetivo es adaptar el modelo base a un dominio específico (español de Common Voice) con un coste de entrenamiento reducido.

El checkpoint publicado corresponde al step 10800 de un run de entrenamiento que aún está en curso (54 % completado al momento de la publicación). Se etiqueta explícitamente como versión de desarrollo (debug) y no debe usarse en producción: el WER de validación en este punto es de 0.2970, muy superior al mejor WER histórico del proyecto (0.1053 en el step 500), y se han observado picos de alucinación y degradación tardía durante el entrenamiento. El modelo se distribuye en formato fp16 (tamaño ~1.5 GB) para GPUs con soporte eficiente de media precisión, aunque el entrenamiento se realizó en FP32 nativo sobre una Tesla P40.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper encoder-decoder (seq2seq) |
| Parametros totales | 763.857.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio (ventana fija de Whisper) |
| Tipos de cuantizacion | fp16 (checkpoint publicado), fp32 (checkpoint de entrenamiento disponible en el repo) |
| Idiomas soportados | Español (es) |
| Licencia | MIT |
| Formato de pesos | safetensors (fp16) |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-medium`, un transformer encoder-decoder de 764 M parámetros entrenado con supervisión débil sobre 680 000 horas de audio. En este fine-tuning, el encoder se congela por completo y solo se entrenan el decoder y la capa `proj_out`, lo que reduce los parámetros entrenables a ~457 M (60 % del total). Esta estrategia, inspirada en Vividh-ASR (arXiv:2605.13087) y Gumbel-BEARD (arXiv:2606.11429), busca preservar la representación acústica del encoder mientras se adapta el decodificador al dominio objetivo.

Las características de entrada se obtienen con el `WhisperFeatureExtractor` (log-mel de 80 bins, ventana de 30 s, hop de 160, muestreo a 16 kHz). La pérdida es cross-entropy media sobre tokens no-padding, enmascarando los tokens de padding con -100. El entrenamiento se realizó en FP32 nativo sobre una NVIDIA Tesla P40 (Pascal sm_61, 24 GB), ya que esta GPU no soporta BF16 nativo y el FP16 resultaba inviable por velocidad. El checkpoint publicado se re-castea a fp16 desde el checkpoint fp32 para inferencia en GPUs Ampere o posteriores (o cualquier GPU con soporte fp16 eficiente).

El run de entrenamiento (configuración `asr-rolling_step-0000700`) usó batch de 60 segundos, grad-accum de 8 pasos, lr de 2e-3 para Muon y 1e-4 para AdamW, warmup de 1000 pasos y un máximo de 20 000 pasos. Al corte de publicación, el run llevaba 10 850 pasos (~6 días) con 458 rollbacks absorbidos y sin fallos de NaN. Se observó una divergencia entre la pérdida de validación (que descendió de 1.58 a 0.20) y el WER (que se estancó en ~0.20 con picos de alucinación), un problema documentado en el repositorio del proyecto.

## Capacidades

- Reconocimiento automático de voz (ASR) en español: transcribe audio a texto.
- Generación de transcripciones con el prompt de decoder forzado a idioma español y tarea "transcribe".
- Soporte de inferencia en fp16 para GPUs modernas con Tensor Cores.
- Integración con la librería `transformers` mediante `WhisperForConditionalGeneration` y `WhisperProcessor`.
- No se reportan capacidades adicionales como traducción, diarización o identificación de hablante en este checkpoint.
- El modelo base (whisper-medium) es multilingüe, pero este fine-tuning se limita al español y no se ha evaluado su rendimiento en otros idiomas.

## Casos de uso

- Investigación sobre fine-tuning de Whisper con encoder congelado: el modelo sirve como punto de referencia para estudiar la eficiencia de esta técnica en términos de parámetros entrenables y rendimiento.
- Reproducción de experimentos de ASR en español: el repositorio `training-asr` permite reproducir el entrenamiento completo, y este checkpoint es un hito intermedio para auditar la evolución del run.
- Análisis de problemas de convergencia en ASR: los picos de alucinación y la divergencia val_loss vs. WER documentados son un caso de estudio para depurar pipelines de entrenamiento.
- Evaluación comparativa de checkpoints intermedios: se puede comparar este step (10800) con el mejor histórico (step 500, WER 0.1053) para entender el impacto de la degradación tardía.
- Desarrollo de técnicas de mitigación de alucinaciones en decodificación greedy: el modelo presenta WER>1 en algunos steps, lo que permite probar estrategias de regularización o decoding alternativo.
- Benchmarking de inferencia fp16 en GPUs consumer: con solo 1.5 GB de pesos, se puede medir latencia y throughput en RTX 20xx o superiores, aunque no se recomienda su uso final.

## Benchmarks y rendimiento

La model card reporta la siguiente trayectoria de validación (1000 muestras) para el run largo:

| Step | val_loss | WER | Nota |
|---|---|---|---|
| 500 | 1.5826 | **0.1053** | mejor WER histórico (run 7) |
| 800 | 0.2881 | 1.797 | inicio run 9, alucinación |
| 1100 | 0.2647 | 31.11 | alucinación |
| 2200 | 0.240 | 32.78 | alucinación |
| 3200 | 0.2273 | **0.1986** | mínimo WER del run 9 |
| 7400 | 0.2033 | 1.80 | mínimo val_loss |
| 9000 | 0.2161 | 4.59 | degradación tardía |
| **10800** | **0.2188** | **0.2970** | **checkpoint publicado** |

El WER de este checkpoint (0.2970) es notablemente peor que el del mejor checkpoint histórico (0.1053), y el propio autor advierte que no debe usarse en producción. No se han publicado comparaciones con otros modelos de ASR en español en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1.5 GB para los pesos en fp16, más overhead de activaciones y el procesador de audio. En la práctica, una GPU con 4 GB de VRAM debería ser suficiente.
- GPU recomendadas: cualquier GPU con soporte fp16 eficiente (Turing o posterior, sm≥75). Ejemplos: RTX 20xx, RTX 30xx, RTX 40xx, A100, H100.
- En GPUs Pascal (como la Tesla P40 usada para entrenamiento) el fp16 no es eficiente; se recomienda usar la variante fp32 del checkpoint si se dispone de ella.
- En CPU, la inferencia es posible pero lenta; se puede usar `llama.cpp` o `transformers` con `torch_dtype=float32`.
- Opciones de despliegue: `transformers` pipeline, `WhisperForConditionalGeneration` con `generate()`, o servidores de inferencia como vLLM (aunque Whisper no es el foco principal de vLLM). También se puede exportar a ONNX o TensorRT para optimización.
- Latencia y throughput: no se han publicado datos específicos para este checkpoint. Como referencia, whisper-medium en fp16 suele procesar un clip de 30 s en menos de 1 s en GPUs modernas, pero esto depende del hardware y la longitud del audio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (es) | Licencia | Formato |
|---|---|---|---|---|---|
| erickfmm/whisper-medium-ft-cv_es-hf-fp16 (este) | 764 M | 30 s | 0.2970 (val, este checkpoint) | MIT | safetensors fp16 |
| openai/whisper-medium (base) | 764 M | 30 s | no disponible | MIT | safetensors |
| openai/whisper-large-v3 | 1550 M | 30 s | no disponible | MIT | safetensors |

No se dispone de datos de WER para whisper-medium base en español en la información proporcionada. El mejor checkpoint del proyecto (step 500, WER 0.1053) sería comparable a otros fine-tunings de Whisper en español, pero no se ha publicado ese checkpoint en este repositorio (sí existe como `erickfmm/whisper-medium-ft-cv_es-best-hf-fp16` según la model card, aunque no se ha verificado su disponibilidad).

## Limitaciones y advertencias

- **No usar en producción**: el autor lo marca explícitamente como versión de desarrollo (debug) para inspección y reproducción de experimentos.
- WER alto en este checkpoint (0.2970) y presencia de picos de alucinación (WER 31-33 en ciertos steps) y loops de repetición en decodificación greedy.
- Divergencia entre val_loss y WER: la pérdida de validación desciende de forma casi monótona mientras el WER se estanca o degrada, lo que indica un problema de calibración o de generación no resuelto.
- Degradación tardía: el WER empeora significativamente después del step 7400, lo que sugiere overfitting o inestabilidad en las fases avanzadas del entrenamiento.
- Entrenado solo en español (Common Voice 26 es), no se garantiza rendimiento en otros idiomas ni en acentos o dominios diferentes.
- El checkpoint fp16 puede perder precisión si se usa en GPUs sin soporte fp16 nativo; se recomienda la variante fp32 para esos casos.
- Licencia MIT permite uso comercial, pero el estado del modelo (debug, con alucinaciones) lo hace inadecuado para aplicaciones reales sin una evaluación exhaustiva previa.

## Enlaces

- HuggingFace: https://huggingface.co/erickfmm/whisper-medium-ft-cv_es-hf-fp16
- Repositorio del proyecto: https://github.com/erickfmm/training-asr
- Documentación del proyecto: https://github.com/erickfmm/training-asr/blob/main/README.md
- Experimentos (incluye §8.3 sobre el problema de divergencia): https://github.com/erickfmm/training-asr/blob/main/Experimentos.md
- Modelo base: https://huggingface.co/openai/whisper-medium
- Paper de Whisper (referencia general): https://arxiv.org/abs/2212.04356
- Vividh-ASR (arXiv:2605.13087): referencia citada en la model card
- Gumbel-BEARD (arXiv:2606.11429): referencia citada en la model card
