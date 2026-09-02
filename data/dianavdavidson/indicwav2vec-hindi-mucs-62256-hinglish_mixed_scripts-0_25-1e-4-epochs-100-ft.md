# dianavdavidson/indicwav2vec-hindi-mucs-62256-hinglish_mixed_scripts-0_25-1e-4-epochs-100-FT

## Resumen

Este modelo es un fine-tuning de `ai4bharat/indicwav2vec-hindi`, un sistema de reconocimiento automático del habla (ASR) basado en la arquitectura wav2vec2, preentrenado por el consorcio AI4Bharat sobre 40 lenguas indias. El autor, un usuario individual identificado como `dianavdavidson`, ha ajustado el modelo sobre un conjunto de datos no documentado, probablemente relacionado con el corpus MUCS y con mezcla de escrituras en hinglish (hindi e inglés), según se deduce del nombre del repositorio. El resultado es un modelo de 315 millones de parámetros con licencia Apache 2.0, pensado para transcripción de audio en hindi/hinglish, aunque los datos de evaluación muestran un rendimiento muy deficiente.

La relevancia de esta ficha radica en documentar un experimento de fine-tuning que, a pesar de su baja calidad (WER cercano al 99 %), puede servir como ejemplo de los riesgos de sobreajuste y de la importancia de validar los datos de entrenamiento. No es un modelo apto para producción, pero su existencia en Hugging Face permite analizar prácticas de ajuste y comparar con el modelo base original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (transformer) |
| Parametros totales | 315.550.445 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (wav2vec2 procesa audio por ventanas, no contexto textual) |
| Tipos de cuantizacion | no disponible (solo safetensors en precisión completa) |
| Idiomas soportados | no disponible (el nombre sugiere hinglish, pero no está confirmado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `ai4bharat/indicwav2vec-hindi` es una variante de wav2vec2, una arquitectura transformer que aprende representaciones de audio mediante aprendizaje auto-supervisado. El preentrenamiento original se realizó sobre 40 lenguas indias, y el modelo se ajustó posteriormente para ASR en 9 idiomas, logrando resultados de última generación en los conjuntos MUCS, MSR y OpenSLR. Este fine-tuning concreto parte de esa versión en hindi y se entrena durante 100 épocas con una tasa de aprendizaje de 1e-4, tamaño de lote efectivo de 32 (16 con acumulación de gradientes de 2), optimizador AdamW, scheduler constante con warmup de 500 pasos y precisión mixta nativa.

El conjunto de datos de entrenamiento no está documentado en la model card. Los resultados de entrenamiento muestran una pérdida de validación que empeora drásticamente a partir de la época 3 (de 1.38 a 2.73) y un WER global que sube de 47.4 a 99.0, lo que indica un claro sobreajuste y una posible fuga de datos o un desajuste entre el conjunto de entrenamiento y el de validación. No se menciona el uso de técnicas como RLHF o DPO; se trata de un ajuste supervisado estándar.

## Capacidades

- Reconocimiento automático del habla (ASR) para audio en hindi/hinglish, aunque con un rendimiento muy pobre (WER ≈ 99 % en evaluación).
- Procesamiento de señales de audio en bruto (waveform) gracias a la arquitectura wav2vec2.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto; es exclusivamente un modelo de transcripción.
- Capacidades multilingües limitadas al hindi (y posiblemente hinglish), derivadas del modelo base, pero sin confirmación en esta versión.
- No incluye modo de pensamiento, visión ni audio adicional más allá de la entrada de voz.

## Casos de uso

Dado el rendimiento deficiente, no se recomienda su uso en producción. No obstante, se pueden plantear escenarios teóricos:

- Investigación académica sobre fine-tuning de wav2vec2: el modelo sirve como ejemplo de un ajuste fallido, útil para estudiar sobreajuste y validación de hiperparámetros.
- Pruebas de concepto en laboratorio: se puede utilizar para comparar arquitecturas o para depurar pipelines de ASR, siempre que se asuma que los resultados serán incorrectos.
- Análisis de sesgos en datos de entrenamiento: el nombre sugiere mezcla de escrituras (devanagari y latina), lo que podría interesar a investigadores de lingüística computacional.
- Benchmarking de herramientas de evaluación: al tener un WER conocido, puede servir para verificar que un sistema de métricas funciona correctamente.
- Educación: como material didáctico para explicar por qué un fine-tuning puede degradar el rendimiento de un modelo preentrenado.
- No es adecuado para transcripción de reuniones, subtitulado, asistentes de voz ni ningún uso comercial real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente la pérdida y el WER global de evaluación:

| Metrica | Valor |
|---|---|
| Loss (validación) | 2.7333 |
| Global WER | 99.0009 |

Estos valores, obtenidos al final del entrenamiento, indican que el modelo no transcribe correctamente prácticamente ningún audio. No hay comparación con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada: con 315 millones de parámetros, en fp32 se necesitan aproximadamente 1.3 GB solo para los pesos; en fp16 se reduce a ~0.65 GB. La inferencia de wav2vec2 requiere además memoria para las activaciones, por lo que se recomienda al menos 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como una NVIDIA GTX 1650, RTX 3050 o superior. También puede ejecutarse en CPU, aunque con mayor latencia.
- Es compatible con GPUs de consumo (RTX 3060, RTX 4090, etc.) y con GPUs de centro de datos (A100, H100) sin problemas.
- Opciones de despliegue: al ser un modelo de transformers, se puede servir con vLLM (aunque está pensado para texto, no para audio), Hugging Face Inference Endpoints, o mediante scripts de Python con la librería `transformers`. Para CPU, se puede usar `torch` directamente o `onnxruntime`.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna, la transcripción de un audio de 10 segundos podría tardar menos de 1 segundo, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER (MUCS) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dianavdavidson/indicwav2vec-hindi-mucs-62256...` | 315 M | no disponible | 99.0 (evaluación propia) | Apache 2.0 | Hugging Face |
| `ai4bharat/indicwav2vec-hindi` (modelo base) | 315 M | no disponible | SOTA en MUCS (según AI4Bharat) | Apache 2.0 | Hugging Face |
| `openai/whisper-small` (para hindi) | 244 M | 30 s de audio | ~10-20 (depende del subset) | MIT | Hugging Face |

El modelo base de AI4Bharat tiene un rendimiento muy superior, como se indica en su documentación. Whisper, aunque no está especializado en lenguas indias, ofrece resultados razonables en hindi. Este fine-tuning concreto queda muy por detrás de ambos.

## Limitaciones y advertencias

- WER extremadamente alto (99 %), lo que lo hace inutilizable para transcripción real.
- Sobreajuste evidente: la pérdida de validación empeora a partir de la época 3, mientras que la pérdida de entrenamiento sigue bajando.
- Conjunto de datos de entrenamiento no documentado; no se puede auditar su composición ni su licencia.
- Sin información sobre sesgos, aunque al ser un modelo de ASR puede heredar sesgos del habla del modelo base (acentos, dialectos, etc.).
- Riesgo de alucinación en la transcripción: el modelo puede generar texto que no corresponde al audio, dado su mal rendimiento.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no es fiable para ello.
- No se especifican limitaciones de contexto ni de idioma más allá de lo indicado.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/dianavdavidson/indicwav2vec-hindi-mucs-62256-hinglish_mixed_scripts-0_25-1e-4-epochs-100-FT)
- [Modelo base ai4bharat/indicwav2vec-hindi](https://huggingface.co/ai4bharat/indicwav2vec-hindi)
- [Repositorio GitHub de AI4Bharat/IndicWav2Vec](https://github.com/AI4Bharat/IndicWav2Vec)
- [Portal de modelos de AI4Bharat](https://models.ai4bharat.org/)
