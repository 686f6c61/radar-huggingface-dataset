# pnawani/welsh-asr-xlsr-300m

## Resumen

El modelo `pnawani/welsh-asr-xlsr-300m` es un ajuste fino (fine-tuning) del modelo preentrenado `facebook/wav2vec2-xls-r-300m` para el reconocimiento automático de voz (ASR) en galés. Desarrollado por el usuario pnawani, este modelo transforma audio en texto transcrito en lengua galesa, aprovechando la arquitectura wav2vec2 de Meta AI que ya había sido preentrenada de forma auto-supervisada en más de 50 idiomas. El ajuste se realizó sobre un conjunto de datos no especificado, con hiperparámetros documentados en la model card.

Con aproximadamente 315 millones de parámetros, el modelo hereda la capacidad de XLS-R para representaciones de voz robustas, pero su especialización en galés lo convierte en una opción relevante para aplicaciones de transcripción en una lengua con pocos recursos digitales. La licencia Apache 2.0 permite uso comercial sin restricciones, lo que facilita su integración en productos. Sin embargo, la falta de detalles sobre el dataset de entrenamiento y la ausencia de benchmarks públicos limitan su evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (XLS-R-300M) |
| Parametros totales | 315.486.895 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, probablemente fp32/fp16) |
| Idiomas soportados | Galés (según el nombre del modelo, no confirmado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura wav2vec2, específicamente en el checkpoint `facebook/wav2vec2-xls-r-300m`, que fue preentrenado de forma auto-supervisada con alrededor de 50 000 horas de audio en 53 idiomas mediante enmascaramiento de características y contraste entre contextos. Para este ajuste fino, se añadió una cabeza de clasificación lineal sobre las representaciones de audio y se entrenó con un dataset de transcripciones en galés (no especificado en la model card).

El entrenamiento se realizó con el Trainer de Hugging Face durante 2100 pasos, con una tasa de aprendizaje de 0.0003, tamaño de lote efectivo de 16 (con acumulación de gradientes de 8 y lote de 2), y precisión mixta nativa. Se usó el optimizador AdamW con decaimiento lineal y 200 pasos de calentamiento. No se menciona el uso de técnicas como RLHF o DPO; el proceso es un ajuste supervisado estándar.

## Capacidades

- Transcripción de voz a texto en galés (reconocimiento automático del habla).
- Procesamiento de audio de entrada y generación de secuencias de texto.
- Soporte para inferencia en tiempo real o por lotes mediante la librería `transformers`.
- No se reportan capacidades adicionales como traducción, tool calling, agentes o razonamiento multimodal.

## Casos de uso

- Transcripción de reuniones y conferencias en galés: el modelo puede convertir grabaciones de audio en actas textuales, facilitando la documentación en entornos corporativos o institucionales donde el galés es lengua oficial.
- Subtitulado automático de vídeos en galés: integrable en pipelines de generación de subtítulos para contenido audiovisual, mejorando la accesibilidad en medios de comunicación galeses.
- Asistentes de voz para servicios públicos en galés: permite transcribir consultas de usuarios y alimentar sistemas de atención al cliente o información automatizada en lengua galesa.
- Archivo y búsqueda de material oral: digitalización de entrevistas, testimonios o archivos históricos en galés, convirtiendo audio en texto indexable para bases de datos documentales.
- Aplicaciones educativas de aprendizaje del galés: transcripción de pronunciaciones de estudiantes para ejercicios de corrección fonética o evaluación de fluidez.
- Herramientas de accesibilidad para personas con discapacidad auditiva: generación de subtítulos en tiempo real en galés durante eventos o clases.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye métricas de evaluación del autor durante el entrenamiento, pero no constituyen benchmarks comparativos estándar. Se reportan los siguientes valores finales en el conjunto de evaluación:

| Metrica | Valor |
|---|---|
| Loss (validación) | 0.5400 |
| WER (Word Error Rate) | 0.4189 |
| CER (Character Error Rate) | 0.1478 |

Estos valores indican que el modelo tiene una tasa de error de palabra del 41,89 % y de carácter del 14,78 %, lo que sugiere un rendimiento moderado, probablemente debido a la limitada cantidad de datos de entrenamiento o a la dificultad intrínseca del galés.

## Requisitos de hardware

- VRAM estimada para inferencia: dado el tamaño de 315 M parámetros, en precisión fp32 se requieren aproximadamente 1,3 GB de memoria para los pesos, y en fp16 unos 0,7 GB. No se dispone de información sobre cuantización adicional (por ejemplo, int8 o int4).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo en fp16. Modelos como NVIDIA T4, RTX 2060 o superiores son suficientes. Para procesamiento por lotes, se recomienda una GPU con 8 GB o más.
- Compatibilidad con hardware de consumo: sí, cabe en GPUs de consumo como RTX 3060, 3070, 4060, etc., siempre que se gestione la memoria.
- Opciones de despliegue: se puede servir con Hugging Face Inference Endpoints, o mediante librerías como `transformers` en Python. También es posible exportar a ONNX o usar `torch.compile` para optimizar la inferencia.
- Latencia y throughput: no disponibles; dependen del hardware y de la duración del audio de entrada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para ASR en galés. Alternativas genéricas de ASR multilingüe incluyen:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `facebook/wav2vec2-xls-r-300m` | 315 M | no aplica | MIT | Hugging Face |
| `openai/whisper-small` | 244 M | no aplica | MIT | Hugging Face |
| `jonatasgrosman/wav2vec2-large-xlsr-53-english` | 315 M | no aplica | Apache 2.0 | Hugging Face |

Sin embargo, ninguno de estos está especializado en galés y no se han publicado comparativas directas con el modelo evaluado.

## Limitaciones y advertencias

- El conjunto de datos de entrenamiento no está documentado, lo que impide evaluar la representatividad y posibles sesgos en el vocabulario o acentos del galés.
- El WER del 41,89 % es elevado, lo que indica que el modelo puede cometer errores frecuentes en transcripciones largas o con ruido de fondo.
- No se especifican limitaciones de duración de audio; la ventana de contexto típica de wav2vec2 es de alrededor de 30 segundos, pero no está confirmada para este modelo.
- El modelo solo está entrenado para galés; no soporta otros idiomas.
- La model card advierte que fue generada automáticamente y que falta información sobre usos previstos y limitaciones, por lo que se recomienda validar su rendimiento en casos de uso reales antes de producción.
- Licencia Apache 2.0 permite uso comercial, pero al ser un derivado de XLS-R, se deben respetar los términos de la licencia original (MIT).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pnawani/welsh-asr-xlsr-300m
- Modelo base (XLS-R-300M): https://huggingface.co/facebook/wav2vec2-xls-r-300m
- Paper de XLS-R (referencia): https://huggingface.co/papers/2111.09296.md
- Notebook de fine-tuning de XLS-R en Common Voice: https://colab.research.google.com/github/patrickvonplaten/notebooks/blob/master/Fine_Tune_XLS_R_on_Common_Voice.ipynb
