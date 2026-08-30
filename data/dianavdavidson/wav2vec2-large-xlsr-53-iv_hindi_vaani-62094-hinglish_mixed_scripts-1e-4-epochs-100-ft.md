# dianavdavidson/wav2vec2-large-xlsr-53-iv_hindi_vaani-62094-hinglish_mixed_scripts-1e-4-epochs-100-FT

## Resumen

Este modelo es un fine-tuning de `facebook/wav2vec2-large-xlsr-53` para reconocimiento automático del habla (ASR) en hinglish, es decir, una mezcla de hindi e inglés con escritura mixta (devanagari y latina). Ha sido desarrollado por el usuario `dianavdavidson` y publicado en Hugging Face con licencia Apache 2.0. El modelo parte de la arquitectura wav2vec2, un encoder Transformer preentrenado de forma autosupervisada sobre 53 idiomas, y se ha ajustado con un conjunto de datos no documentado durante 100 épocas.

La relevancia de este modelo radica en su enfoque en hinglish, una variante lingüística muy común en la India y en comunidades de habla hindi-inglés, pero que suele estar poco representada en los sistemas ASR comerciales. Sin embargo, la documentación es extremadamente escasa: no se especifica el dataset de entrenamiento, no hay descripción de usos previstos ni limitaciones, y los resultados de evaluación son limitados (una pérdida de 0,6005 y un WER global de 30,48). Se trata, por tanto, de un modelo experimental que requiere validación adicional antes de su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (encoder Transformer con cuantización) |
| Parametros totales | 315.554.545 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, sin ventana de tokens definida) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre sugiere hinglish, pero no está documentado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `wav2vec2-large-xlsr-53`, un encoder Transformer preentrenado de forma autosupervisada sobre 53 idiomas mediante el objetivo de contraste wav2vec 2.0. La arquitectura original incluye una capa de cuantización de características y un encoder con atención de múltiples cabezas. En este fine-tuning, se ha ajustado el modelo completo sobre un dataset no especificado, con un tamaño de lote efectivo de 32 (16 con acumulación de gradientes de 2), una tasa de aprendizaje de 1e-4, un scheduler constante con warmup de 500 pasos y 100 épocas. Se utilizó entrenamiento con precisión mixta (Native AMP). No se menciona el uso de técnicas como RLHF o DPO, ni innovaciones arquitectónicas adicionales.

## Capacidades

- Reconocimiento automático del habla (ASR): convierte audio en texto, presumiblemente en hinglish, aunque no hay confirmación oficial de los idiomas exactos.
- Generación de transcripciones a partir de señales de audio de entrada.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni otras modalidades.
- No se especifica soporte multilingüe más allá del posible hinglish.

## Casos de uso

- Transcripción de reuniones o entrevistas en hinglish: el modelo puede procesar grabaciones de audio y generar texto, aunque su WER del 30,48 % indica que la precisión es limitada y requeriría postprocesado o un modelo de lenguaje para mejorar la salida.
- Subtitulado automático de vídeos en hinglish: se podría integrar en un pipeline de generación de subtítulos, pero la falta de documentación sobre el dataset y los idiomas exactos hace necesario validar su rendimiento en el dominio específico.
- Asistentes de voz para entornos bilingües hindi-inglés: el modelo podría servir como base para un sistema de comandos de voz, pero su alta tasa de error lo hace poco fiable para uso interactivo sin corrección adicional.
- Investigación académica sobre ASR en lenguas de bajos recursos: al ser un fine-tuning de un modelo multilingüe, puede utilizarse como punto de partida para estudiar el comportamiento de wav2vec2 en hinglish, aunque no se ofrecen detalles del corpus.
- Prototipos de accesibilidad: transcripción de audio para personas con discapacidad auditiva en contextos donde se hable hinglish, siempre que se acepte una tasa de error elevada.
- Evaluación comparativa de técnicas de fine-tuning: dado que se publican los hiperparámetros y la curva de entrenamiento, puede servir como referencia para experimentos con otros datasets o configuraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible. La model card solo incluye la pérdida y el WER global durante la evaluación, que se muestran en la siguiente tabla extraída del entrenamiento:

| Training Loss | Epoch | Step | Validation Loss | Global Wer |
|:-------------:|:-----:|:----:|:---------------:|:----------:|
| 13.4633       | 1.0   | 540  | 3.2369          | 100.0      |
| 3.8562        | 2.0   | 1080 | 0.8525          | 50.7031    |
| 1.6989        | 3.0   | 1620 | 0.6566          | 42.1365    |
| 1.3254        | 4.0   | 2160 | 0.5998          | 36.7372    |
| 1.1203        | 5.0   | 2700 | 0.5798          | 38.3379    |
| 0.9912        | 6.0   | 3240 | 0.5479          | 34.6280    |
| 0.8942        | 7.0   | 3780 | 0.5548          | 33.9590    |
| 0.8056        | 8.0   | 4320 | 0.5463          | 32.3515    |
| 0.7328        | 9.0   | 4860 | 0.5531          | 31.9113    |
| 0.6924        | 10.0  | 5400 | 0.5511          | 31.5017    |
| 0.6315        | 11.0  | 5940 | 0.5650          | 31.2082    |
| 0.5911        | 12.0  | 6480 | 0.5739          | 31.0239    |
| 0.5148        | 13.0  | 7020 | 0.5711          | 30.4437    |
| 0.4792        | 14.0  | 7560 | 0.5914          | 30.2833    |
| 0.4510        | 15.0  | 8100 | 0.5981          | 30.4471    |
| 0.4495        | 16.0  | 8640 | 0.6154          | 30.4061    |
| 0.4239        | 17.0  | 9180 | 0.6005          | 30.4812    |

Estos valores corresponden a la evaluación durante el entrenamiento, no a un benchmark independiente. No se dispone de comparaciones con otros modelos.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware.
- El modelo tiene 315,5 millones de parámetros y un tamaño de repo de 1,3 GB, por lo que en FP32 la inferencia requiere aproximadamente 1,3 GB de memoria de GPU, más overhead. Con cuantización a 8 bits podría reducirse a unos 400-500 MB, pero no se ofrecen versiones cuantizadas.
- Es probable que quepa en GPUs de consumo como una RTX 3060 (12 GB) o incluso en una GTX 1650 (4 GB) si se usa cuantización, pero no hay datos verificados.
- Para despliegue, se puede usar la librería `transformers` de Hugging Face, así como herramientas como `vLLM` o `TGI` si se convierte a un formato compatible, aunque no se ha probado.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `facebook/wav2vec2-large-xlsr-53` (base) | 315 M | 53 idiomas | Apache 2.0 | Hugging Face |
| Este modelo (fine-tuning) | 315 M | no documentado | Apache 2.0 | Hugging Face |
| `ai4bharat/indicwav2vec` (ejemplo de ASR para lenguas indias) | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para una comparativa rigurosa con otros modelos ASR para hinglish. El modelo base es el mismo, por lo que la única diferencia es el fine-tuning, pero sin datos de evaluación comparables.

## Limitaciones y advertencias

- El dataset de entrenamiento no está documentado, por lo que se desconocen la composición, el tamaño y la calidad de los datos. Esto impide evaluar posibles sesgos o la cobertura de acentos y dialectos.
- El WER global del 30,48 % es alto para un sistema ASR usable en producción; se recomienda un postprocesado con modelo de lenguaje o una validación exhaustiva en el dominio objetivo.
- No se especifican los idiomas exactos soportados. El nombre sugiere hinglish, pero no hay confirmación oficial.
- No se han publicado resultados de benchmarks independientes ni comparaciones con otros sistemas.
- La model card está generada automáticamente y carece de secciones de usos previstos, limitaciones o detalles de entrenamiento, lo que indica una documentación incompleta.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo experimental, el usuario asume el riesgo de rendimiento y precisión.
- No se proporcionan instrucciones de uso, preprocesado de audio ni formato de entrada esperado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/dianavdavidson/wav2vec2-large-xlsr-53-iv_hindi_vaani-62094-hinglish_mixed_scripts-1e-4-epochs-100-FT)
- [Modelo base: facebook/wav2vec2-large-xlsr-53](https://huggingface.co/facebook/wav2vec2-large-xlsr-53)
- [Notebook de fine-tuning de XLSR-Wav2Vec2 en Common Voice (referencia)](https://colab.research.google.com/github/patrickvonplaten/notebooks/blob/master/Fine_Tune_XLSR_Wav2Vec2_on_Common_Voice.ipynb)
