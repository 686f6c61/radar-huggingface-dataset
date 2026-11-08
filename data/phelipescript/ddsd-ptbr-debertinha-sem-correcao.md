# phelipescript/ddsd-ptbr-debertinha-sem-correcao

## Resumen

`phelipescript/ddsd-ptbr-debertinha-sem-correcao` es un modelo de clasificación de texto en portugués brasileño para la tarea DDSD (Device-Directed Speech Detection), es decir, distinguir si una frase va dirigida a un asistente de voz (clase DD) o es cualquier otra conversación (clase NDD). Lo desarrolla el usuario `phelipescript` como parte de su trabajo de fin de grado, y deriva del modelo base `sagui-nlp/debertinha-ptbr-xsmall`, un DeBERTa-v2 adaptado al portugués con 40,9 millones de parámetros.

La particularidad de este checkpoint es que se trata de un **modelo de control**, no de un modelo para uso productivo. Se entrenó sobre la configuración `sem_correcao` del corpus `phelipescript/ddsd-ptbr-corpus`, en la que la longitud de la frase correlaciona con la etiqueta (AUC de 0,86 usando solo el tamaño). El autor lo publica para reproducir la comparación de su tesis frente al modelo corregido `phelipescript/ddsd-ptbr-debertinha`.

Su relevancia es metodológica: cuantifica el efecto del sesgo de longitud en un clasificador DDSD y muestra cómo un modelo que parece excelente en su propio corpus (98,55% de accuracy) degrada su rendimiento en condiciones reales (91,55% en el test corregido y 30,8% de falsas activaciones en transcripciones conversacionales).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (transformer encoder), cabecera de clasificación de secuencias con 2 etiquetas |
| Parametros totales | 40.944.002 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 tokens en entrenamiento e inferencia (truncación) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en fp32/bf16) |
| Idiomas soportados | portugués (pt), variante brasileña |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 0,2 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `sagui-nlp/debertinha-ptbr-xsmall`, un DeBERTa-v2 XSmall adaptado al portugués mediante replaced token detection al estilo DeBERTaV3. Sobre ese encoder se añade una cabeza de clasificación binaria (DD vs. NDD). La normalización del texto es parte del pipeline: se eliminan acentos (NFKD), se pasa a minúsculas y se sustituyen signos de puntuación y símbolos por espacios.

El entrenamiento usa la configuración `sem_correcao` del corpus `phelipescript/ddsd-ptbr-corpus`: 93.144 frases de entrenamiento (46.573 DD y 46.571 NDD) y 11.664 de validación (5.833 DD y 5.831 NDD), con balanceo 1:1 global y no por franja de longitud. Hiperparámetros: learning rate 2e-5, batch 32, hasta 5 épocas, máximo 128 tokens, warmup del 10%, dropout 0,1, weight decay 0,01, scheduler lineal y precisión mixta bf16. Se seleccionó el checkpoint del paso 14.555 (época 5) por mayor F1 macro en validación, con early stopping de paciencia 2. El umbral de decisión se fijó en 0,03, elegido sobre una rejilla de 0,005 a 0,995 con paso 0,005 maximizando F1 macro en validación. El entrenamiento se ejecutó en una Apple M5 con GPU vía MPS y 16 GB de memoria unificada, en 49 minutos, con semilla 42.

## Capacidades

- Clasificación binaria de texto: etiqueta DD (fala dirigida ao computador) frente a NDD (cualquier otra fala).
- Detección de intención dirigida a un asistente de voz en portugués brasileño.
- Salida de probabilidad calibrada mediante softmax sobre dos logits, con umbral de decisión configurable en `config.decision_threshold`.
- Integración con la librería `transformers` (`AutoModelForSequenceClassification`, `AutoTokenizer`).
- Compatible con Text Embeddings Inference (tag `text-embeddings-inference`).
- No soporta tool calling, function calling, agentes, visión, audio ni generación de texto: es exclusivamente un clasificador.
- Capacidad multilingüe limitada al portugués; no se ha entrenado ni evaluado en otros idiomas.

## Casos de uso

- **Reproducción de experimentos académicos**: sirve como baseline de control para medir el impacto del sesgo de longitud en tareas DDSD, comparándolo con el modelo corregido sobre el mismo test `com_correcao`.
- **Auditoría de sesgos en datasets**: permite ilustrar cómo un clasificador aprende atajos espurios (longitud de frase) y cómo se detectan mediante tests corregidos y transcripciones reales.
- **Docencia en NLP**: ejemplo práctico de por qué la accuracy en el corpus de origen no es indicativa de rendimiento en producción, con métricas separadas por franja de longitud.
- **Detección de falsos positivos en asistentes de voz**: análisis de la tasa de activación espuria en conversación espontánea (CORAA, NURC-SP, TAGARELA) para dimensionar el problema antes de desplegar un modelo DDSD.
- **Estudio de calibración y umbrales**: el umbral 0,03 frente al 0,5 por defecto de `pipeline("text-classification")` es un caso concreto para estudiar el efecto del umbral en precisión y recall.
- **Validación de pipelines de preprocesado**: la función `normalizar` (sin acentos, minúsculas, puntuación a espacio) es un requisito estricto que sirve para probar la consistencia entre entrenamiento e inferencia.

## Benchmarks y rendimiento

Test `com_correcao` (11.616 frases, sin el atajo de longitud, sin solapamiento con el entrenamiento):

| Métrica | Este modelo | DeBERTinha con corrección |
|---|---|---|
| Acurácia | 91,55% | 97,70% |
| F1 macro | 0,9152 | 0,9770 |
| ROC-AUC | 0,9714 | 0,9973 |
| EER | 8,82% | 2,22% |

Test del propio corpus `sem_correcao` (11.630 frases, con atajo de longitud): accuracy de 98,55%, valor inflado por el sesgo.

Falsas activaciones en transcripciones de conversación real (todas las frases son NDD):

| Corpus | Frases | Este modelo | DeBERTinha con corrección |
|---|---|---|---|
| CORAA | 1.000 | 41,4% | 5,1% |
| NURC-SP | 1.000 | 23,9% | 5,9% |
| TAGARELA | 912 | 26,8% | 6,0% |
| **Total** | **2.912** | **30,8%** | **5,7%** |

Falsas activaciones por longitud de frase (total 2.912 frases):

| Palabras | Frases | Este modelo | DeBERTinha con corrección |
|---|---|---|---|
| 2 | 144 | 98,6% | 9,0% |
| 3 | 210 | 93,3% | 8,6% |
| 4 | 266 | 72,6% | 4,1% |
| 5 | 226 | 51,8% | 4,9% |
| 6 | 239 | 41,4% | 5,4% |
| 7–8 | 407 | 25,1% | 5,4% |
| 9–10 | 321 | 7,8% | 3,1% |
| 11–13 | 344 | 3,8% | 3,5% |

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (40,9 M de parámetros, unos 164 MB de pesos) y en torno a 0,5 GB contando tokenizer, activaciones y overhead de runtime.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU.
- GPU de datacenter (A100, H100) innecesarias para inferencia; solo tendrían sentido para entrenamiento a gran escala o despliegue con altísima concurrencia.
- Opciones de despliegue: `transformers` con PyTorch, Text Embeddings Inference (tag oficial), exportación a ONNX y `optimum` para CPU.
- Throughput: no se han publicado medidas de latencia ni de peticiones por segundo en la información disponible. Por tamaño y contexto (128 tokens), se espera un coste por inferencia de milisegundos en GPU consumer.
- El entrenamiento de referencia se completó en 49 minutos en una Apple M5 con 16 GB de memoria unificada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy (test corregido) | Falsas activaciones (total) | Licencia |
|---|---|---|---|---|---|
| Este modelo (control) | 40,9 M | 128 | 91,55% | 30,8% | MIT |
| `phelipescript/ddsd-ptbr-debertinha` | 40,9 M (misma base) | 128 | 97,70% | 5,7% | MIT |
| `sagui-nlp/debertinha-ptbr-xsmall` (base) | 40,9 M | 512 (modelo base) | no disponible para DDSD | no disponible | MIT |

La comparación relevante es contra el modelo corregido del mismo autor, que comparte receta, base y corpus pero entrena con la configuración `com_correcao`. No se han identificado en la información disponible otros clasificadores DDSD públicos en portugués para comparar.

## Limitaciones y advertencias

- **Modelo de control, no apto para producción**: el propio autor lo indica explícitamente ("Modelo de controle, não é para uso").
- Sesgo de longitud severo: la longitud de la frase por sí sola predice la etiqueta con AUC de 0,86 en el corpus de entrenamiento; el modelo aprende ese atajo.
- Tasa de falsas activaciones del 30,8% en conversación espontánea real, con picos del 98,6% en frases de 2 palabras.
- El umbral de decisión es 0,03, no 0,5; usar `pipeline("text-classification")` sin ajustar el umbral produce resultados incorrectos.
- Requiere normalización estricta del texto (sin acentos, minúsculas, puntuación a espacio); omitirla altera las predicciones.
- Contexto limitado a 128 tokens con truncación; frases más largas se recortan.
- Solo portugués brasileño; no evaluado en otras variantes ni idiomas.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas sistemáticas por el atajo de longitud.
- Licencia MIT: permite uso comercial, pero el autor desaconseja su uso por el sesgo descrito.
- Sin descargas ni validación externa en el momento de la consulta (0 descargas, 0 likes).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phelipescript/ddsd-ptbr-debertinha-sem-correcao
- Modelo recomendado (corregido): https://huggingface.co/phelipescript/ddsd-ptbr-debertinha
- Dataset del corpus: https://huggingface.co/datasets/phelipescript/ddsd-ptbr-corpus
- Modelo base: https://huggingface.co/sagui-nlp/debertinha-ptbr-xsmall
- Repositorio DeBERTinha: https://github.com/sagui-nlp/DeBERTinha
- Métricas de entrenamiento: https://huggingface.co/phelipescript/ddsd-ptbr-debertinha-sem-correcao/blob/main/treinamento.json
