# Jamh4949/beto-sarcasmo-es

## Resumen

`Jamh4949/beto-sarcasmo-es` es un modelo de clasificación de texto en español afinado para la detección binaria de sarcasmo. Parte del checkpoint `dccuchile/bert-base-spanish-wwm-cased` (BETO), un transformer encoder de tipo BERT entrenado específicamente en español, y se ha ajustado sobre un corpus combinado de 12.145 textos de entrenamiento y 3.037 de validación con clases balanceadas. El resultado es un clasificador ligero de 109,85 millones de parámetros que distingue entre las etiquetas `SARCASMO` (1) y `NO_SARCASMO` (0).

El modelo se publica en el contexto de un taller académico de Procesamiento de Lenguaje Natural (2026-II) y no presenta descargas ni interacciones en el momento de la consulta, por lo que debe considerarse un artefacto de investigación más que un modelo de producción consolidado. Su interés radica en que aborda una tarea lingüísticamente difícil —el sarcasmo depende de contexto pragmático y a menudo de entonación ausente en texto— con una arquitectura pequeña y un coste de inferencia muy bajo.

La relevancia práctica está en su tamaño: al tratarse de un BERT base, cabe en cualquier GPU de consumo e incluso en CPU con latencias razonables, lo que lo hace apto para filtrado previo de contenido, moderación o análisis de opinión a escala. No obstante, el propio autor advierte que el corpus está dominado por titulares de prensa satíricos, lo que limita su generalización a sarcasmo conversacional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (BETO, `dccuchile/bert-base-spanish-wwm-cased`) |
| Parámetros totales | 109.852.418 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite arquitectónico de BERT); entrenado con `max_length=128` |
| Tipos de cuantización | no disponible (el repo publica safetensors sin variantes GGUF/ONNX) |
| Idiomas soportados | Español (`es`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (tamaño del repo: 0,4 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de BETO, un BERT base con tokenización *whole word masking* y *cased* (sensible a mayúsculas) entrenado originalmente por el equipo de dccuchile sobre corpus en español. La cabeza de clasificación es una capa lineal sobre el token `[CLS]` con dos salidas (sarcasmo / no sarcasmo). No hay innovaciones arquitectónicas: se trata de un ajuste supervisado estándar de clasificación de secuencias.

El entrenamiento se realizó en una NVIDIA T4 (Kaggle) con AdamW, weight decay 0,01, warmup del 10 %, precisión mixta fp16 y padding dinámico con `max_length=128`. Se probaron tres tamaños de batch (8, 16 y 32) con learning rate 2e-05, hasta 8 épocas con *early stopping* (paciencia 2) sobre el F1 macro de validación, restaurando los mejores pesos. La configuración publicada corresponde a batch 16, que alcanzó su mejor época en la tercera iteración. El dataset es un corpus combinado del curso con textos cortos (≈13 palabras de media), mayoritariamente titulares de prensa satíricos o reales, con clases balanceadas. No se documenta el uso de RLHF, DPO ni datos sintéticos.

## Capacidades

- Clasificación binaria de texto en español: etiqueta `SARCASMO` (1) o `NO_SARCASMO` (0).
- Procesamiento de textos cortos (titulares, frases, mensajes) con una longitud típica de ~13 palabras.
- Inferencia rápida y de bajo coste gracias a su tamaño (109,85 M de parámetros) y a la ventana de 128 tokens usada en entrenamiento.
- Integración directa con el pipeline `text-classification` de Hugging Face Transformers.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de modo *thinking*, visión, audio ni generación de texto libre.
- Capacidad multilingüe limitada al español; no se ha validado en otras lenguas.

## Casos de uso

- Moderación de comentarios en foros y redes sociales: el modelo puede preclasificar mensajes potencialmente sarcásticos o irónicos para enrutarlos a revisión humana o a un clasificador de toxicidad más costoso, aprovechando su baja latencia y su ventana de 128 tokens.
- Análisis de opinión en prensa satírica: permite etiquetar titulares de medios como El Mundo Today, El Jueves o similares frente a titulares reales, un caso alineado con la distribución del corpus de entrenamiento.
- Filtrado previo en pipelines de análisis de sentimiento: como primera etapa, descarta o marca textos sarcásticos que confundirían a un modelo de sentimiento estándar, ya que el sarcasmo invierte con frecuencia la polaridad aparente.
- Investigación en pragmática computacional: sirve como línea base reproducible para experimentos sobre detección de ironía en español, con métricas de validación documentadas (accuracy 0,9118, F1 macro 0,9117).
- Enriquecimiento de datasets: etiquetado automático de grandes volúmenes de titulares o tuits en español para construir corpus anotados de sarcasmo, con revisión humana posterior dado el ruido de anotación señalado por el autor.
- Sistemas de alerta en atención al cliente: detectar respuestas sarcásticas de usuarios en encuestas de satisfacción o tickets, donde el tono irónico puede indicar insatisfacción no expresada literalmente.
- Despliegue en entornos con recursos limitados: al caber en CPU y en GPUs de consumo, puede ejecutarse en dispositivos edge o en contenedores sin GPU para tareas de clasificación por lotes.

## Benchmarks y rendimiento

Resultados de validación publicados por el autor (mejor configuración, batch 16, learning rate 2e-05, época 3):

| Métrica | Valor |
|---|---|
| Accuracy | 0,9118 |
| Precision | 0,9122 |
| Recall | 0,9118 |
| F1 ponderado | 0,9117 |
| F1 macro | 0,9117 |

Comparativa de configuraciones probadas:

| batch_size | learning_rate | Épocas corridas | Mejor época | Accuracy | F1 macro | Minutos |
|---|---|---|---|---|---|---|
| 8 | 2e-05 | 5 | 3 | 0,9048 | 0,9048 | 8,4 |
| 16 | 2e-05 | 5 | 3 | 0,9118 | 0,9117 | 4,4 |
| 32 | 2e-05 | 6 | 4 | 0,9108 | 0,9108 | 3,4 |

Evolución por época de la configuración publicada:

| Época | Training loss | Validation loss | Accuracy | F1 macro |
|---|---|---|---|---|
| 1 | 0,4301 | 0,3460 | 0,8604 | 0,8597 |
| 2 | 0,2120 | 0,2973 | 0,9065 | 0,9064 |
| 3 | 0,1003 | 0,3945 | 0,9118 | 0,9117 |
| 4 | 0,0429 | 0,5810 | 0,9062 | 0,9062 |
| 5 | 0,0165 | 0,6816 | 0,9085 | 0,9085 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con modelos alternativos de detección de sarcasmo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: ~0,44 GB (109,85 M de parámetros × 4 bytes); en fp16: ~0,22 GB. Con overhead de activaciones y tokenizador, un entorno de 1-2 GB de VRAM es suficiente.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; NVIDIA T4, RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque están sobredimensionadas para este modelo.
- Cabe holgadamente en GPU de consumo (GTX 1650, RTX 2060, RTX 3050 en adelante) e incluso en CPU con latencias de decenas de milisegundos por muestra.
- Opciones de despliegue: Hugging Face `pipeline("text-classification")`, `transformers` con `AutoModelForSequenceClassification`, TorchServe, o exportación a ONNX para inferencia en CPU. No se han publicado pesos en GGUF ni recetas para llama.cpp u Ollama.
- Latencia y throughput: no disponibles de forma oficial. Por el tamaño del modelo y la longitud de secuencia (128 tokens), es esperable un throughput de cientos a miles de muestras por segundo en GPU moderna, pero no se ha documentado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Jamh4949/beto-sarcasmo-es` | 109,85 M | 512 (entrenado a 128) | Clasificación de sarcasmo en español | no disponible | Hugging Face (0 descargas) |
| `dccuchile/bert-base-spanish-wwm-cased` (BETO) | ~110 M | 512 | Modelo base en español (MLM) | no disponible en la información proporcionada | Hugging Face (modelo base ampliamente usado) |
| `PlanTL-GOB-ES/roberta-base-bne` | ~125 M | 512 | Modelo base en español (MLM) | no disponible en la información proporcionada | Hugging Face |
| `finiteautomata/beto-sentiment-analysis` | ~110 M | 512 | Análisis de sentimiento en español | no disponible en la información proporcionada | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estos modelos para la tarea específica de detección de sarcasmo en la información proporcionada.

## Limitaciones y advertencias

- El dataset está dominado por titulares de prensa satíricos o reales: el modelo aprende en parte el estilo de ese género y puede fallar en sarcasmo conversacional, chats o mensajes informales.
- Ruido de anotación documentado: algunas frases dependen de un contexto ausente, lo que introduce etiquetas incorrectas en el corpus.
- Las métricas de validación se usaron también para el *early stopping*, por lo que son ligeramente optimistas y no reflejan el rendimiento en un conjunto de test independiente.
- La licencia no está especificada, lo que impide confirmar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier despliegue en producción.
- Riesgo de alucinación no aplica como tal (es un clasificador, no un generador), pero sí existe riesgo de falsos positivos y falsos negativos sistemáticos en dominios distintos al de entrenamiento.
- Sesgos potenciales derivados del corpus: predominio de titulares de prensa española, posible desbalance de fuentes y estilos, y ausencia de validación en variedades dialectales del español distintas de la peninsular.
- Ventana de contexto efectiva de 128 tokens en entrenamiento; textos más largos se truncan y pueden perder la información necesaria para detectar el sarcasmo.
- Sin descargas ni validación externa: no hay evidencia de reproducibilidad por terceros ni de robustez frente a dominios nuevos.
- No apto para generación de texto, razonamiento, código ni tareas multilingües.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jamh4949/beto-sarcasmo-es
- Modelo base BETO: https://huggingface.co/dccuchile/bert-base-spanish-wwm-cased
- Repositorio de BETO (dccuchile): https://github.com/dccuchile/beto
- Documentación de `text-classification` en Transformers: https://huggingface.co/docs/transformers/tasks/sequence_classification
