# Maldak123/xlmr-churn-detector-pt

## Resumen

Maldak123/xlmr-churn-detector-pt es un modelo de clasificación de texto en portugués obtenido mediante fine-tuning de FacebookAI/xlm-roberta-base sobre un conjunto de 3.000 reuniones B2B. Su tarea declarada es detectar el riesgo de cancelación (churn) de un cliente a partir del contenido de una reunión comercial. El repositorio tiene 278.045.186 parámetros, un tamaño de 1,1 GB en safetensors y licencia MIT, y está etiquetado con los pipelines text-classification y el idioma pt.

El interés del modelo es acotado pero claro: aplicar un encoder multilingüe ya preentrenado a una tarea vertical de negocio (retención de clientes en entornos B2B), donde el texto de entrada son transcripciones de reuniones y la salida es una etiqueta de riesgo. No es un modelo generativo ni un LLM: es un encoder de la familia RoBERTa con una cabeza de clasificación, con una ventana máxima de 512 tokens heredada del modelo base.

La relevancia práctica está condicionada por dos factores. Por un lado, el modelo tiene 0 descargas y 0 likes y no está acompañado de paper, demo ni documentación técnica más allá de la model card. Por otro, esa model card reporta métricas perfectas (Accuracy, Precision, Recall, F1 y ROC-AUC iguales a 1.0000), un resultado que en un problema de clasificación sobre datos reales es altamente implausible y que apunta a fuga de datos o a un conjunto de evaluación trivial. Cualquier uso en producción debería ir precedido de una validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) con cabeza de clasificación de secuencia |
| Parametros totales | 278.045.186 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (máximo del modelo base XLM-RoBERTa; no confirmado de forma explícita por el autor) |
| Tipos de cuantizacion | No disponible (el autor solo publica pesos en safetensors; no documenta cuantizaciones) |
| Idiomas soportados | Portugués (pt). El modelo base cubre 100 idiomas, pero el fine-tuning declarado es solo en portugués |
| Licencia | MIT |
| Formato de pesos | safetensors (tamaño del repo: 1,1 GB) |

## Arquitectura y entrenamiento

La arquitectura es la de XLM-RoBERTa base, un transformer encoder de 12 capas, 768 dimensiones ocultas, 12 cabezas de atención, vocabulario SentencePiece de 250.000 tokens y 278M de parámetros, preentrenado por Facebook AI con objetivo de masked language modeling sobre corpus multilingües de Common Crawl. Sobre esa base, el autor ha añadido una cabeza de clasificación de secuencia y ha realizado fine-tuning supervisado para una tarea binaria o multiclase de riesgo de cancelación. La model card no especifica el número de clases, la distribución de etiquetas ni el esquema exacto de entrada (si se usa la reunión completa, turnos individuales o concatenaciones con tokens de separación).

El único dato de entrenamiento publicado es el tamaño del conjunto: 3.000 reuniones B2B. No se indica el número de tokens, la composición del dataset, el reparto train/validation/test, la proporción de ejemplos positivos y negativos, la longitud media de las secuencias, ni si se aplicaron técnicas de regularización, búsqueda de hiperparámetros o validación cruzada. Tampoco hay información sobre limpieza de las transcripciones, anonimización de datos personales o tratamiento de solapamientos entre reuniones de un mismo cliente.

Como innovación técnica destacable, no se documenta ninguna: no hay decodificación especulativa, atención lineal, adaptadores, destilación ni ninguna otra modificación sobre el transformer estándar. El modelo es, por tanto, un caso convencional de transferencia de un encoder multilingüe a una tarea de clasificación vertical.

## Capacidades

- Clasificación de texto en portugués: asigna una etiqueta a un texto de entrada con la intención de estimar el riesgo de cancelación de un cliente B2B.
- Procesamiento de transcripciones de reuniones comerciales, presumiblemente en fragmentos de hasta 512 tokens por inferencia.
- Ejecución rápida en CPU o GPU de gama baja, al tratarse de un encoder de 278M de parámetros.
- No es un modelo generativo: no produce texto, resúmenes ni explicaciones.
- No dispone de tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene modo thinking, ni capacidades de visión, audio o multimodalidad.
- Capacidades multilingües: no demostradas. Aunque el modelo base es multilingüe, el fine-tuning declarado es exclusivamente en portugués y no hay evidencia publicada de transferencia a otros idiomas.

## Casos de uso

- Detección de riesgo de churn en reuniones B2B: es el caso nativo del modelo. A partir de la transcripción de una reunión comercial, el clasificador devuelve una etiqueta de riesgo que el equipo de cuentas puede usar como señal temprana antes de que el cliente formalice la cancelación.
- Priorización de cartera para Customer Success: integrando el modelo en un proceso por lotes que puntúa las reuniones de la semana, el equipo puede ordenar las cuentas por riesgo estimado y asignar tiempo humano donde más impacta, en lugar de revisar toda la cartera por igual.
- Alerta en tiempo real durante llamadas de renovación o QBR: acoplando un sistema de reconocimiento de voz (por ejemplo Whisper) que transcriba en streaming y alimente el clasificador por ventanas, se puede avisar al comercial en el momento en que aparece lenguaje asociado a insatisfacción o a evaluación de alternativas.
- Señal adicional en un CRM: el resultado del modelo puede escribirse como campo personalizado en Salesforce, HubSpot u otro CRM mediante un webhook que se dispare al finalizar la reunión, combinándolo con métricas de producto y de facturación para construir un score de riesgo compuesto.
- Análisis agregado de motivos de cancelación: clasificando grandes volúmenes de reuniones históricas se pueden obtener distribuciones de riesgo por segmento, sector o antigüedad de la cuenta, útiles para informes de dirección y para detectar patrones recurrentes antes de que se conviertan en pérdidas.
- Disparo de playbooks de retención: con la etiqueta de riesgo como condición, se pueden automatizar acciones (envío de un correo del responsable de cuenta, apertura de un ticket de retención, propuesta de descuento de renovación) sin intervención manual en la fase de triaje.
- Investigación sobre discurso comercial: el modelo permite etiquetar corpus de reuniones B2B en portugués para estudios académicos o internos sobre qué patrones lingüísticos anteceden a la cancelación de contratos.

## Benchmarks y rendimiento

La model card publica los siguientes resultados, sin especificar el conjunto de evaluación, el tamaño de la muestra ni el procedimiento de partición:

| Metrica | Score |
|---|---|
| Accuracy | 1.0000 |
| Precision | 1.0000 |
| Recall | 1.0000 |
| F1 Score | 1.0000 |
| ROC-AUC | 1.0000 |

No se han publicado resultados de benchmarks en la informacion disponible más allá de esta tabla. No hay comparación con líneas base (clase mayoritaria, modelo base sin fine-tuning, BERTimbau u otros clasificadores en portugués), ni matriz de confusión, ni intervalos de confianza, ni evaluación en un conjunto externo. Un resultado perfecto en las cinco métricas a la vez es, en la práctica, un indicador de fuga de datos (por ejemplo, reuniones del mismo cliente repartidas entre train y test) o de un conjunto de evaluación trivial. Estas cifras no deberían tomarse como evidencia de rendimiento real.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 1,1 GB de pesos, más activaciones. Inferencia por debajo de 2 GB en la práctica.
- VRAM estimada en fp16 o bf16: aproximadamente 556 MB de pesos.
- VRAM estimada con cuantización dinámica int8: aproximadamente 278 MB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Funciona sin problema en T4, L4, RTX 3060, RTX 4060 y superiores; no requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna de gama media o baja, e incluso en iGPU con suficiente memoria compartida.
- Ejecución en CPU: viable. Al ser un encoder de 278M de parámetros, la inferencia sobre secuencias de 512 tokens en CPU tarda del orden de decenas de milisegundos por muestra, y baja a un dígito de milisegundos en GPU para una sola muestra sin batch.
- Opciones de despliegue: pipeline de transformers, TorchScript, ONNX Runtime (con Optimum), NVIDIA Triton Inference Server, FastAPI o similar envolviendo el modelo, y Hugging Face Inference Endpoints. vLLM y llama.cpp no están orientados a este tipo de encoder de clasificación y no hay soporte documentado por el autor; llama.cpp incluye soporte experimental de arquitecturas BERT, pero no está verificado para este checkpoint.
- Latencia y throughput: no disponibles. El autor no publica mediciones. En una GPU moderna, un encoder de este tamaño suele procesar cientos de secuencias de 512 tokens por segundo en lotes grandes, pero es una estimación genérica y no un dato medido sobre este modelo.

## Comparativa con modelos similares

No se dispone de resultados comparativos publicados para este checkpoint. La tabla siguiente contrasta características estructurales con alternativas habituales para clasificación de texto en portugués; los datos de los modelos alternativos provienen de sus fichas públicas y pueden variar.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Tipo |
|---|---|---|---|---|---|
| Maldak123/xlmr-churn-detector-pt | 278M | 512 tokens | pt | MIT | Encoder de clasificación fine-tuned |
| FacebookAI/xlm-roberta-base | 278M | 512 tokens | 100 idiomas | MIT | Encoder preentrenado (MLM) |
| neuralmind/bert-base-portuguese-cased (BERTimbau) | 110M | 512 tokens | pt | MIT | Encoder preentrenado en portugués |
| microsoft/mdeberta-v3-base | 278M (86M en el backbone) | 512 tokens | 100 idiomas | MIT | Encoder preentrenado con atención desenredada |

El modelo aquí descrito parte de la misma base que xlm-roberta-base, por lo que su única diferencia funcional es la cabeza de clasificación y el ajuste fino sobre reuniones B2B. Frente a BERTimbau, parte de un modelo con vocabulario y corpus multilingües en lugar de específicamente portugueses, lo que puede ser ventajoso o no según el dominio. No hay datos de rendimiento que permitan afirmar que este checkpoint sea mejor que un fine-tuning propio de BERTimbau o de mdeberta-v3-base sobre el mismo corpus.

## Limitaciones y advertencias

- Métricas no creíbles: los valores perfectos publicados (1.0000 en todas las métricas) sugieren fuga de datos, particiones mal construidas o un conjunto de prueba trivial. No deben usarse como argumento de compra ni como base para decisiones de producción.
- Ausencia de validación independiente: no hay conjunto de test externo, ni validación cruzada, ni evaluación por subgrupos, ni comparación con líneas base.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos y falsos negativos sistemáticos: un clasificador mal calibrado puede etiquetar como riesgo cuentas sanas o pasar por alto cancelaciones reales, con consecuencias comerciales directas.
- Sesgos desconocidos: no se documenta la composición del corpus de 3.000 reuniones. Si el dataset se concentra en un sector, tamaño de empresa o región, el modelo rendirá peor fuera de ese ámbito.
- Limitación de contexto: 512 tokens por inferencia. Las reuniones B2B suelen durar decenas de minutos y generar transcripciones mucho más largas, por lo que es necesario trocear y agregar predicciones, con la pérdida de información global que eso implica.
- Limitación de idioma: solo portugués. El uso con textos en castellano, inglés u otras lenguas no está respaldado por ninguna evaluación y probablemente degrade el rendimiento.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificación y redistribución con atribución y sin garantías. No impone restricciones adicionales, pero tampoco ofrece ninguna garantía de idoneidad.
- Privacidad y protección de datos: el modelo se ha entrenado con reuniones B2B, que contienen información comercial sensible y potencialmente datos personales. El autor no documenta anonimización ni base jurídica para el tratamiento. Cualquier uso en la Unión Europea debe revisarse frente al RGPD antes de desplegarlo.
- Sin mantenimiento ni soporte: 0 descargas, 0 likes y ninguna actividad posterior a la creación del repositorio. No hay issues, ni versiones, ni contacto del autor.
- Anomalía en los metadatos: las fechas del repositorio indican creación y actualización en septiembre de 2026, lo que resulta inconsistente y dificulta trazar la antigüedad real del modelo.
- Recomendación operativa: si se quiere usar la idea, lo razonable es reentrenar XLM-RoBERTa o BERTimbau sobre datos propios con una partición por cliente y una evaluación honesta, en lugar de confiar en este checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Maldak123/xlmr-churn-detector-pt
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Paper de XLM-RoBERTa (Unsupervised Cross-lingual Representation Learning at Scale): https://arxiv.org/abs/1911.02116
- BERTimbau, alternativa en portugués: https://huggingface.co/neuralmind/bert-base-portuguese-cased
- mDeBERTa-v3-base, alternativa multilingüe: https://huggingface.co/microsoft/mdeberta-v3-base

Nota: la búsqueda web asociada a esta ficha no devolvió ningún resultado relevante sobre el modelo. Todos los enlaces encontrados correspondían a foros de fútbol, comunidades generalistas y páginas sin relación con este repositorio, por lo que se han descartado.
