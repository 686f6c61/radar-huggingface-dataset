# dianavdavidson/wav2vec2-xls-r-1b-mucs-62255-hinglish_mixed_scripts-0_25-1e-4-epochs-100-FT

## Resumen

Este modelo es un fine-tuning de `facebook/wav2vec2-xls-r-1b`, un modelo de reconocimiento automático de voz (ASR) basado en la arquitectura wav2vec 2.0, entrenado por la usuaria `dianavdavidson` sobre un conjunto de datos no especificado. El nombre sugiere que está orientado a la transcripción de habla en hinglish (mezcla de hindi e inglés) con escritura mixta (devanagari y latino), aunque no se proporciona información detallada sobre el dataset de entrenamiento ni sobre los idiomas exactos soportados.

El modelo tiene 962,6 millones de parámetros y se distribuye bajo licencia Apache 2.0. La model card es generada automáticamente por el Trainer y carece de documentación sustancial. Los resultados de entrenamiento muestran una pérdida de validación que aumenta drásticamente a partir de la época 4 y un WER global que alcanza el 100% en la última época, lo que indica un claro sobreajuste o problemas de convergencia. No se han publicado resultados de benchmarks en la información disponible, por lo que su rendimiento real en tareas de ASR no puede verificarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (transformer encoder con cuantizacion de representaciones) |
| Parametros totales | 962.637.037 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende de la configuracion de audio, tipicamente ventanas de 10-30 segundos) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (el nombre sugiere hinglish, pero no se confirma) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `facebook/wav2vec2-xls-r-1b`, que emplea la arquitectura wav2vec 2.0: un encoder transformer con cuantizacion de representaciones latentes y un objetivo de contraste durante el preentrenamiento auto-supervisado. El modelo base fue preentrenado en 128 idiomas con aproximadamente 436.000 horas de audio no etiquetado. Este fine-tuning se realizó sobre un dataset desconocido, con los siguientes hiperparámetros: learning rate 1e-4, batch size total 32 (con acumulación de gradientes), optimizador AdamW, scheduler constante con warmup de 500 pasos, 100 épocas y precisión mixta nativa.

Los datos de entrenamiento muestran una pérdida de entrenamiento que desciende de 6.46 a 1.66 en las primeras épocas, pero la pérdida de validación sube de 1.38 a 3.97 y el WER global pasa de 47.97% a 100% a partir de la época 4. Esto sugiere un sobreajuste severo o un problema con el conjunto de validación. No se especifica el tamaño del dataset ni su composición.

## Capacidades

- Reconocimiento automático de voz (ASR) para audio en hinglish con escritura mixta, según el nombre del modelo.
- Transcripción de audio a texto, aunque el rendimiento real no está verificado y los datos de entrenamiento indican un WER muy alto.
- No se documentan capacidades adicionales como tool calling, agentes o razonamiento multi-paso, ya que es un modelo puramente de ASR.
- No se especifican capacidades multilingües más allá del posible hinglish.

## Casos de uso

- Transcripción de reuniones o conversaciones en hinglish: el modelo podría utilizarse para convertir audio en texto, pero su alto WER (100% en validación) lo hace inadecuado para este fin en la práctica.
- Subtitulado automático de vídeos en hinglish: requeriría una precisión alta que este modelo no demuestra.
- Asistentes de voz para aplicaciones bilingües hindi-inglés: el modelo no es fiable dado su rendimiento.
- Análisis de llamadas de atención al cliente en hinglish: no recomendable por la falta de precisión.
- Investigación académica sobre fine-tuning de wav2vec2 en lenguas de baja representación: puede servir como ejemplo de un intento fallido de entrenamiento, pero no como herramienta funcional.
- Desarrollo de pipelines de ASR experimentales: podría integrarse en pruebas, pero se esperaría un rendimiento deficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye un `model-index` con resultados vacíos. Los datos de entrenamiento reportados muestran una evolución del WER global en validación:

| Epoca | Loss de validacion | WER global |
|---|---|---|
| 1 | 1.3798 | 47.97% |
| 2 | 1.2896 | 44.59% |
| 3 | 1.4821 | 47.15% |
| 4 | 3.8195 | 99.62% |
| 5 | 3.9737 | 100.0% |

Estos valores indican que el modelo no converge adecuadamente y que su rendimiento es inaceptable para uso práctico.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~1B parámetros, se requiere al menos 4 GB en FP16 y alrededor de 8 GB en FP32. Con cuantización a 8 bits podría reducirse a ~2 GB, pero no se proporcionan cuantizaciones.
- GPU recomendadas: una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3070, RTX 4060) para inferencia en FP16. Para entrenamiento se necesitaría una GPU con 16-24 GB (A100, RTX 4090).
- No cabe en GPUs de consumo muy limitadas (menos de 4 GB) sin cuantización.
- Opciones de despliegue: compatible con la librería `transformers` de HuggingFace, por lo que puede usarse con pipelines de ASR, así como con vLLM o TGI si se adapta, aunque no es lo habitual para modelos wav2vec2. También puede ejecutarse con `torch` directamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `facebook/wav2vec2-xls-r-1b` (base) | 1B | 128 idiomas | Apache 2.0 | Preentrenado en 436K horas, buen rendimiento en ASR multilingüe tras fine-tuning |
| `dianavdavidson/wav2vec2-large-xlsr-53-mucs-61966-hinglish_mixed_scripts-alldata-1e-4-steps-12000-FT` | ~300M | hinglish | Apache 2.0 | Fine-tuning similar sobre XLSR-53, sin datos de rendimiento publicados |
| `facebook/wav2vec2-large-xlsr-53` | ~300M | 53 idiomas | Apache 2.0 | Modelo base más pequeño, ampliamente usado para fine-tuning en ASR |

No se dispone de resultados comparativos fiables para este modelo concreto.

## Limitaciones y advertencias

- El modelo no ha sido evaluado con benchmarks públicos; los únicos datos de validación muestran un WER del 100% en la última época, lo que indica que no es utilizable para transcripción en producción.
- La model card es automática y carece de información sobre el dataset de entrenamiento, los idiomas exactos o las condiciones de audio.
- No se documentan sesgos específicos, pero al ser un fine-tuning sobre un dataset desconocido, podría heredar sesgos del habla o acentos particulares.
- Riesgo de alucinación: en ASR, esto se manifiesta como transcripciones incorrectas o inventadas, especialmente con audio ruidoso o acentos no representados.
- La licencia Apache 2.0 permite uso comercial, pero el rendimiento deficiente hace que su uso comercial no sea recomendable.
- No se proporcionan instrucciones de uso, ni ejemplos de inferencia, ni configuración de tokenizer o procesador de audio.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/dianavdavidson/wav2vec2-xls-r-1b-mucs-62255-hinglish_mixed_scripts-0_25-1e-4-epochs-100-FT)
- [Modelo base XLS-R-1b](https://huggingface.co/facebook/wav2vec2-xls-r-1b)
- [Paper de XLS-R](https://research.facebook.com/publications/xls-r-self-supervised-cross-lingual-speech-representation-learning-at-scale/)
- [README de XLS-R en GitHub](https://github.com/facebookresearch/fairseq/blob/main/examples/wav2vec/xlsr/README.md)
