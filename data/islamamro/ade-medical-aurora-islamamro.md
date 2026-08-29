# Islamamro/ade-medical-aurora-islamamro

## Resumen

El modelo `Islamamro/ade-medical-aurora-islamamro` es un clasificador de texto binario diseñado para detectar si un fragmento de texto describe una reacción adversa a un medicamento (adverse drug event, ADE). Ha sido desarrollado por el usuario Islamamro mediante el portal de investigación Aurora, que permite construir, entrenar y publicar modelos de extremo a extremo. Se basa en la arquitectura DistilBERT, concretamente en la variante `distilbert-base-uncased`, y se ha ajustado sobre el conjunto de datos `SetFit/ade_corpus_v2_classification`.

El modelo resuelve un problema concreto de la farmacovigilancia: la identificación automática de menciones de efectos secundarios en textos clínicos, informes de pacientes o redes sociales. Su relevancia radica en que permite automatizar parte del proceso de monitorización de seguridad de medicamentos, aunque el propio autor advierte de que se trata de una prueba de concepto del pipeline de Aurora y no de un modelo listo para producción. Con 66,9 millones de parámetros y una ventana de contexto típica de DistilBERT (512 tokens), es un modelo ligero y rápido, adecuado para despliegues con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (base, uncased) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (valor estándar de DistilBERT, no especificado por el autor) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base es inglés, pero no se indica oficialmente) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DistilBERT, una versión destilada de BERT que conserva el 97% de su rendimiento con un 40% menos de parámetros. DistilBERT utiliza una arquitectura transformer encoder con 6 capas, 12 cabezas de atención y una dimensión oculta de 768. Al ser una variante `uncased`, el texto se normaliza a minúsculas antes de la tokenización. La capa de clasificación añadida sobre la salida del token `[CLS]` produce una distribución de probabilidad sobre dos clases: presencia o ausencia de reacción adversa.

El entrenamiento se realizó mediante fine-tuning sobre el dataset `SetFit/ade_corpus_v2_classification`, que contiene ejemplos etiquetados de frases con y sin eventos adversos. Según la model card, se utilizó un subconjunto de demostración de 1.400 ejemplos, no el dataset completo. El autor indica que el entrenamiento se llevó a cabo en una NVIDIA RTX 3090 a través del portal Aurora. No se menciona el uso de técnicas como RLHF o DPO; se trata de un ajuste supervisado estándar. La precisión reportada en un conjunto de validación reservado es de 0,83.

## Capacidades

- Clasificación binaria de texto: determina si un texto describe una reacción adversa a un medicamento.
- Procesamiento de texto en inglés (implícito por el modelo base, aunque no confirmado por el autor).
- Inferencia rápida y ligera gracias a la arquitectura DistilBERT, adecuada para entornos con recursos computacionales limitados.
- Integración sencilla con la librería `transformers` mediante el pipeline de clasificación de texto.
- No soporta tool calling, generación de texto libre, razonamiento multi-paso ni capacidades multimodales; es un modelo exclusivamente discriminativo.

## Casos de uso

- Monitorización de farmacovigilancia: analizar informes de pacientes, notas clínicas o publicaciones en foros de salud para detectar menciones de efectos adversos y alimentar sistemas de alerta temprana.
- Filtrado de redes sociales: procesar tweets o comentarios de pacientes que describen síntomas tras tomar un medicamento, permitiendo a las agencias reguladoras identificar señales de seguridad.
- Revisión de literatura médica: clasificar abstracts de artículos científicos para extraer automáticamente aquellos que reportan reacciones adversas, facilitando revisiones sistemáticas.
- Soporte a la codificación de historiales clínicos: ayudar a los profesionales sanitarios a etiquetar eventos adversos en registros electrónicos de salud, reduciendo el trabajo manual.
- Investigación en NLP clínico: servir como modelo base para experimentos de detección de ADE en dominios específicos, dado su pequeño tamaño y facilidad de ajuste.
- Demostración de pipelines de MLOps: el propio autor lo presenta como prueba del flujo construir-entrenar-publicar de Aurora, útil para validar infraestructuras de despliegue de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada es la precisión en un conjunto de validación reservado, que alcanza 0,83. No se proporcionan comparaciones con otros modelos ni resultados en conjuntos estándar como MMLU, HumanEval o GLUE. Dado que el modelo se entrenó sobre un subconjunto reducido de 1.400 ejemplos, es probable que su rendimiento en el dataset completo sea inferior al de modelos entrenados con todos los datos.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 (el modelo tiene ~67 millones de parámetros, lo que ocupa aproximadamente 268 MB en FP32). Con cuantización a 8 bits, el uso de memoria se reduce aún más.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Una NVIDIA RTX 3090 (la usada para entrenar) es más que suficiente para inferencia; también funciona en GPUs de gama baja como GTX 1650 o incluso en CPU.
- Sí cabe en GPUs de consumo: cualquier tarjeta moderna con 4 GB o más puede ejecutarlo sin problemas.
- Opciones de despliegue: compatible con `transformers` (pipeline de clasificación), `ONNX Runtime` para optimización, `TensorFlow Lite` para edge, y servidores de inferencia como `Triton` o `FastAPI` con `torchserve`.
- Latencia y throughput estimados: no disponibles, pero al ser un modelo pequeño, la inferencia en GPU suele ser del orden de milisegundos por muestra; en CPU puede ser de decenas de milisegundos.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la misma tarea. Como referencia cualitativa, se puede comparar con:

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| `Islamamro/ade-medical-aurora-islamamro` | DistilBERT | 66,9 M | 512 | Apache 2.0 | Entrenado en subconjunto de 1.400 ejemplos |
| `distilbert-base-uncased` | DistilBERT | 66,9 M | 512 | Apache 2.0 | Modelo base sin fine-tuning, no especializado en ADE |
| `BioBERT` (ejemplo) | BERT | 110 M | 512 | Apache 2.0 | Preentrenado en literatura biomédica, requiere fine-tuning para ADE |

No se han encontrado modelos específicos de detección de ADE con métricas públicas comparables en la información disponible.

## Limitaciones y advertencias

- El modelo se entrenó únicamente con 1.400 ejemplos, un subconjunto muy reducido del dataset completo. Esto limita su generalización y puede provocar un rendimiento deficiente en datos reales.
- La precisión reportada de 0,83 corresponde a un conjunto de validación reservado, pero no se indica el tamaño ni la composición de dicho conjunto, por lo que la cifra debe interpretarse con cautela.
- Al ser un modelo basado en DistilBERT uncased, no maneja mayúsculas ni distingue entre contextos donde el caso importa; además, su vocabulario está limitado al inglés.
- No se han documentado sesgos específicos, pero los modelos entrenados en dominios médicos pueden reflejar sesgos presentes en los datos de entrenamiento, como sobrerrepresentación de ciertos medicamentos o poblaciones.
- Riesgo de alucinación: al ser un clasificador, no genera texto, pero puede producir falsos positivos o negativos en la detección de ADE, lo que en un contexto clínico podría tener consecuencias graves.
- La licencia Apache 2.0 permite uso comercial, pero el autor advierte explícitamente que no es un modelo de producción y que debe reentrenarse con el dataset completo para uso real.
- No se proporcionan detalles sobre el preprocesado de texto, la tokenización específica ni el umbral de decisión, lo que dificulta la reproducibilidad exacta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Islamamro/ade-medical-aurora-islamamro
- Dataset de entrenamiento: https://huggingface.co/datasets/SetFit/ade_corpus_v2_classification
- Perfil de GitHub del autor: https://github.com/islamamro
- Portal Aurora (mencionado en la model card, sin URL directa): no disponible
