# erickfmm/whisper-medium-ft-cv_es-dev

## Resumen

`erickfmm/whisper-medium-ft-cv_es-dev` es un repositorio de **desarrollo y depuración** que contiene los checkpoints de entrenamiento y los logs CSV de un fine-tuning de [`openai/whisper-medium`](https://huggingface.co/openai/whisper-medium) sobre el dataset **Common Voice 26 en español (`es`)**. El autor, erickfmm, lo publica como parte del proyecto [`training-asr`](https://github.com/erickfmm/training-asr.git) y lo etiqueta explícitamente como **no apto para inferencia**: los archivos `.pt` son estado de entrenamiento (pesos, momentos de optimizador, RNG, estadísticas del spike guard), no pesos cargables con `WhisperForConditionalGeneration.from_pretrained()`.

El entrenamiento se ejecuta en una NVIDIA **Tesla P40** (Pascal sm_61, 24 GB) y, al corte de la publicación, alcanzaba el step 10850 de 20000 (~54 %). La model card documenta un **problema abierto de divergencia entre val_loss y WER**: la cross-entropy de validación bajó de 1.58 a 0.20, pero el WER se estancó en torno a 0.20 con picos de alucinación (WER 31 y 33) por loops de repetición en la decodificación greedy. El mejor WER histórico es **0.1053 en el step 500**.

Este repositorio no resuelve ningún problema de producción; su utilidad es exclusivamente para **investigación y desarrollo** del propio fine-tuning: reanudar entrenamiento, inspeccionar logs, analizar la dinámica de gradientes y depurar el pipeline de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper-medium (encoder-decoder transformer), encoder congelado, decoder + proj_out entrenados |
| Parametros totales | no disponible (modelo base Whisper-medium: ~769 M) |
| Parametros activos | no disponible (solo decoder + proj_out, sin cifra publicada) |
| Longitud de contexto | no disponible (modelo base: 448 tokens / 30 s de audio) |
| Tipos de cuantizacion | no disponible (no es modelo de inferencia) |
| Idiomas soportados | es (español) |
| Licencia | MIT |
| Formato de pesos | `.pt` (PyTorch state dict con estado de entrenamiento) |

## Arquitectura y entrenamiento

El modelo base es `openai/whisper-medium`, un transformer encoder-decoder de ~769 M parámetros entrenado por OpenAI para reconocimiento de voz multilingüe. En este fine-tuning, el **encoder se congela** y solo se entrenan el decoder y la capa `proj_out`. El entrenamiento usa dos optimizadores: **Turbo-Muon** para parámetros 2D y **AdamW** para parámetros 1D, junto con un mecanismo de "spike guard" que monitoriza el grad norm (EMAs `mu` y `sigma`) para aplicar clipping adaptativo o rollbacks en caso de picos de gradiente.

El dataset es **Common Voice 26.0** en español (`mozilla-foundation/common_voice_26_0`). Los logs muestran 12 504 filas de entrenamiento (steps 1–10850) con 28 columnas que incluyen pérdida, grad norm, ratio de clip, memoria, fallos inf/nan, z-score del grad norm, tier de spike, contador de rollbacks (458 al corte) y escala temporal de LR. El entrenamiento se ejecuta en una **Tesla P40** de 24 GB.

La model card documenta una **divergencia val_loss vs. WER**: mientras la pérdida de validación desciende de forma consistente (mínimo 0.2033 en step 7400), el WER se estanca en ~0.20 y sufre picos de alucinación (WER 31 y 33) por repeticiones en decodificación greedy. El mejor WER (0.1053) se obtuvo en el step 500, y el último checkpoint rolling (step 10800) tiene un WER de 0.2970.

## Capacidades

- **No es un modelo de inferencia**: los checkpoints `.pt` contienen estado de entrenamiento (pesos, momentos de optimizador, RNG, estadísticas del spike guard) y **no se pueden cargar** con `WhisperForConditionalGeneration.from_pretrained()`.
- El modelo base Whisper-medium, por su parte, es capaz de reconocimiento de voz multilingüe, traducción de voz, identificación de idioma y transcripción con marcas de tiempo, pero **este repositorio no ofrece esas capacidades directamente**.
- El repositorio sí permite **reanudar el entrenamiento** con `--resume`, restaurando el punto exacto (RNG del dataloader, epochs, LR scheduler, contadores de rollback).
- Incluye **logs CSV** (`train_log.csv` y `val_log.csv`) para análisis de la dinámica de entrenamiento: pérdida, grad norm, memoria, fallos inf/nan, z-score del grad norm, tier de spike, etc.

## Casos de uso

- **Investigación sobre dinámica de entrenamiento**: los logs CSV permiten estudiar la relación entre val_loss y WER, el comportamiento del spike guard, el efecto de los rollbacks y la evolución del grad norm en un fine-tuning de Whisper.
- **Depuración de divergencias de entrenamiento**: el caso documentado (val_loss baja pero WER se estanca) sirve como caso de estudio para técnicas de clipping adaptativo y rollbacks.
- **Reanudación de entrenamiento interrumpido**: los checkpoints guardan el estado completo (optimizadores, RNG, scheduler) para continuar desde el step exacto.
- **Comparación de estrategias de optimización**: el uso de Turbo-Muon + AdamW y el spike guard puede evaluarse frente a configuraciones alternativas.
- **Análisis de alucinaciones en ASR**: los picos de WER por loops de repetición en decodificación greedy se pueden estudiar a partir de los checkpoints y logs.
- **Desarrollo de pipelines de fine-tuning para ASR en español**: el repositorio documenta un flujo completo (dataset, hardware, optimizadores, checkpoints) replicable para otros modelos o idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks formales (MMLU, HumanEval, etc.) porque este repositorio no es un modelo de inferencia. La model card sí reporta la trayectoria de validación en el conjunto de validación de Common Voice 26 español:

| Step | val_loss | WER | Nota |
|---|---|---|---|
| 500 | 1.5826 | **0.1053** | mejor WER histórico (run 7) |
| 800 | 0.2881 | 1.797 | inicio run 9, alucinación |
| 1100 | 0.2647 | 31.11 | alucinación |
| 2200 | 0.240 | 32.78 | alucinación |
| 3200 | 0.2273 | **0.1986** | mínimo WER del run 9 |
| 7400 | 0.2033 | 1.80 | mínimo val_loss |
| 9000 | 0.2161 | 4.59 | degradación tardía |
| 10800 | 0.2188 | 0.2970 | último checkpoint rolling |

## Requisitos de hardware

- **Entrenamiento**: se realizó en una NVIDIA **Tesla P40** (Pascal sm_61, 24 GB VRAM). Los checkpoints ocupan ~5.1 GB cada uno y el repositorio completo 25.5 GB.
- **Inferencia**: no aplica, ya que no es un modelo de inferencia. Para usar Whisper-medium en producción se necesitaría el modelo base de OpenAI o un checkpoint exportado en formato Hugging Face (el autor menciona repos `erickfmm/whisper-medium-ft-cv_es-*` para inferencia, pero no se proporcionan en este repositorio).
- **Despliegue**: no disponible (no hay pesos cargables con vLLM, llama.cpp, Ollama ni TGI).

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de inferencia, por lo que no tiene sentido compararlo con alternativas como Whisper-large-v3, Whisper-small o modelos ASR españoles (p. ej. `jonatasgrosman/wav2vec2-large-xlsr-53-spanish`). Para comparativas de rendimiento real habría que usar los checkpoints exportados del autor (no publicados en este repo).

## Limitaciones y advertencias

- **No es un modelo de inferencia**: los archivos `.pt` no se cargan con `from_pretrained()`. Intentar usarlos en producción fallará.
- **Entrenamiento incompleto**: al corte de publicación estaba al 54 % (step 10850/20000). Los pesos no representan un modelo convergido.
- **Divergencia val_loss vs. WER**: la pérdida de validación baja pero el WER se estanca, con picos de alucinación por loops de repetición en decodificación greedy.
- **Bug conocido en la lógica best-3**: el tercer mejor checkpoint (WER 0.1986 en step 3200) no se guardó en modo `--resume`.
- **Sesgos y alucinaciones**: los picos de WER 31 y 33 indican alucinaciones severas en algunos puntos del entrenamiento.
- **Licencia MIT**: permite uso comercial, pero al no ser un modelo de inferencia, la licencia solo aplica al código y los checkpoints de entrenamiento, no a un producto final.
- **Repositorio de desarrollo**: no se recomienda su uso fuera de un contexto de investigación sobre entrenamiento de ASR.

## Enlaces

- [Repositorio HuggingFace: erickfmm/whisper-medium-ft-cv_es-dev](https://huggingface.co/erickfmm/whisper-medium-ft-cv_es-dev)
- [Modelo base: openai/whisper-medium](https://huggingface.co/openai/whisper-medium)
- [Proyecto training-asr (GitHub)](https://github.com/erickfmm/training-asr.git)
- [Paper Whisper (arXiv:2212.04356)](https://arxiv.org/abs/2212.04356)
- [arXiv:2605.13087](https://arxiv.org/abs/2605.13087)
- [arXiv:2606.11429](https://arxiv.org/abs/2606.11429)
- [arXiv:2504.02507](https://arxiv.org/abs/2504.02507)
- [arXiv:2512.04632](https://arxiv.org/abs/2512.04632)
