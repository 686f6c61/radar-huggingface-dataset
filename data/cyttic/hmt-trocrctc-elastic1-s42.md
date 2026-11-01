# cyttic/hmt-trocrctc-elastic1-s42

## Resumen

`cyttic/hmt-trocrctc-elastic1-s42` es un modelo de reconocimiento de texto manuscrito (HTR, Handwritten Text Recognition) publicado por el grupo cyttic. Se trata de un checkpoint experimental dentro de un estudio de aumento de datos (data augmentation) denominado `htr-metrics-transfer`, en su primera oleada (wave 1). El modelo combina una arquitectura TrOCR con una cabeza de decodificación CTC, entrenada con una transformación de aumento concreta etiquetada como `elastic1` y una semilla fija de 42.

El modelo está entrenado sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores del split de desarrollo, y evaluado sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje. Con 87,3 millones de parámetros y un tamaño de repositorio de 0,3 GB, es un modelo compacto orientado a la transcripción de texto manuscrito en hebreo.

Su relevancia es acotada: no es un modelo de propósito general ni un asistente conversacional, sino un artefacto de investigación reproducible para estudiar cómo distintas estrategias de aumento de datos afectan a las métricas HTR (CER y WER) en escritura manuscrita hebrea. Los pesos están en formato safetensors bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR con cabeza CTC (encoder-decoder transformer para HTR) |
| Parametros totales | 87.279.756 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (he) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue el esquema TrOCR (Transformer-based Optical Character Recognition) con una cabeza de conexionista temporal (CTC) para la decodificación de secuencias. Esta combinación sustituye la decodificación autoregresiva típica de TrOCR por una alineación CTC, lo que permite decodificación greedy directa sin modelo de lenguaje auxiliar. El checkpoint tiene 87,3 millones de parámetros, coherente con un encoder visual y un decoder de tamaño moderado.

El entrenamiento se realizó sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores del split de desarrollo, con una transformación de aumento de datos `elastic1` (deformación elástica). La semilla empleada es 42. El modelo card indica que se trata de un estudio de transferencia de métricas HTR en su primera oleada, y que los detalles completos están en el archivo `results.json` del repositorio. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicó RLHF o DPO (no aplicable en un modelo HTR).

## Capacidades

- Reconocimiento de texto manuscrito (HTR) en hebreo.
- Decodificación CTC greedy, sin modelo de lenguaje externo.
- Transcripción de líneas o regiones de texto manuscrito a partir de imágenes.
- Evaluación reproducible de métricas CER y WER sobre el test HHD Option-B.
- No soporta tool calling ni function calling.
- No está orientado a agentes ni a razonamiento multi-paso.
- Capacidad multilingüe limitada al hebreo (según el campo `language: he`).
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de la entrada de imagen para OCR.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo transcribe líneas de texto manuscrito a texto digital, adecuado para fondos documentales históricos o administrativos en hebreo.
- Investigación en aumento de datos para HTR: sirve como checkpoint de referencia para comparar el efecto de la deformación elástica (`elastic1`) frente a otras transformaciones en la misma arquitectura.
- Reproducibilidad de experimentos: al fijar la semilla 42 y publicar `results.json`, permite replicar la evaluación CER/WER sobre el test HHD Option-B.
- Baseline para fine-tuning en dominios específicos: con 87,3 M de parámetros y licencia MIT, es un punto de partida ligero para adaptar a otros estilos de escritura hebrea.
- Evaluación de pipelines de OCR sin LM: útil para medir el rendimiento puro del modelo CTC sin corrección lingüística posterior.
- Prototipado en entornos con recursos limitados: su tamaño (0,3 GB) permite desplegarlo en hardware modesto para pruebas de transcripción.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| CER (HHD Option-B test, greedy, sin LM) | 0,1092 |
| WER (HHD Option-B test, greedy, sin LM) | 0,4479 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no son aplicables a un modelo HTR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (87,3 M de parámetros, ~0,35 GB en fp32); en fp16 aproximadamente 0,17 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; también cabe en CPU para inferencia por lotes pequeños.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs actuales e incluso en placas integradas.
- Opciones de despliegue: al ser safetensors con arquitectura TrOCR+CTC, requiere cargarlo mediante `transformers` o un script propio; no se documenta soporte directo en vLLM, llama.cpp, Ollama o TGI (no disponible).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| cyttic/hmt-trocrctc-elastic1-s42 | 87,3 M | no disponible | MIT | HuggingFace |
| TrOCR base (Microsoft) | ~334 M | no disponible | MIT | HuggingFace |
| Modelos HTR hebreo específicos | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en HTR en hebreo; no es un modelo de propósito general.
- Riesgo de errores de transcripción: CER de 0,1092 y WER de 0,4479 indican una tasa de error de palabra elevada, especialmente sin modelo de lenguaje corrector.
- Entrenado sobre un split concreto (`hhd-optionb-split`) excluyendo escritores de desarrollo; puede generalizar mal a escritores o estilos no representados.
- Sin modelo de lenguaje: no corrige errores ortográficos ni contextuales en la salida.
- Licencia MIT permite uso comercial, pero el modelo card no documenta sesgos ni evaluación fuera del test HHD Option-B.
- No se documentan tipos de cuantización ni contexto máximo; conviene validar el comportamiento en producción antes de desplegarlo.
- El checkpoint forma parte de un estudio experimental (wave 1), por lo que puede no ser el mejor punto de partida para producción sin comparación con otras variantes del mismo estudio.

## Enlaces

- HuggingFace: https://huggingface.co/cyttic/hmt-trocrctc-elastic1-s42
- Dataset de entrenamiento: `cyttic/hhd-optionb-split` (referenciado en la model card)
- Archivo de resultados: `results.json` (incluido en el repositorio del modelo)
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información disponible.
