# ManuelR12/beto-sarcasmo-bs32

## Resumen

beto-sarcasmo-bs32 es un modelo de clasificación de texto en español especializado en detectar sarcasmo. Lo desarrolla ManuelR12 y se obtiene mediante fine-tuning del conocido BETO (dccuchile/bert-base-spanish-wwm-cased), un transformer encoder de tipo BERT entrenado con whole word masking sobre corpus en español. El modelo resuelve una tarea binaria: decidir si un texto es sarcástico (SARCASMO) o no (NO_SARCASMO), devolviendo la etiqueta y su puntuación de confianza a través del pipeline de Hugging Face.

Con 109.852.418 parámetros y un repositorio de 0,4 GB, es un modelo compacto y ligero, pensado para inferencia rápida incluso en CPU. Su relevancia radica en abordar una tarea lingüística notoriamente difícil —la ironía y el sarcasmo dependen del contexto, el tono y el conocimiento compartido— con un enfoque supervisado y un conjunto de datos equilibrado (50/50). El modelo está publicado bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y se distribuye en formato safetensors.

La ficha se basa en la información pública disponible en el Hub de Hugging Face; el dataset de entrenamiento es local y no se ha publicado, y no constan benchmarks externos ni comparativas con otros modelos. Las cifras de rendimiento proceden exclusivamente de la validación interna declarada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (BETO, base_model: dccuchile/bert-base-spanish-wwm-cased) |
| Parametros totales | 109.852.418 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (longitud máxima de entrenamiento, con padding) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión original; admite cuantización estándar de PyTorch/ONNX no documentada) |
| Idiomas soportados | es (español) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un BERT base (12 capas, 768 dimensiones ocultas, 12 cabezas de atención, ~110M parámetros) con una cabeza de clasificación binaria añadida para la tarea de sarcasmo. Parte de BETO, que fue entrenado con whole word masking y vocabulario específico para español, lo que le aporta una tokenización adecuada para el idioma. El fine-tuning se realizó sobre un dataset local no publicado en el Hub: 12.145 frases de entrenamiento y 3.037 de validación, equilibradas al 50/50 entre sarcasmo y no sarcasmo, compuestas mayoritariamente por titulares de prensa.

Los hiperparámetros declarados son batch size 32, learning rate 2e-05, máximo de 10 épocas con early stopping (paciencia 2 sobre F1 de validación), de las cuales se ejecutaron 7 y la mejor fue la 5. No se menciona uso de RLHF, DPO ni técnicas de aumento de datos. La innovación técnica es limitada: se trata de un fine-tuning estándar de clasificación, sin decodificación especulativa ni mecanismos de atención lineal. La pérdida de validación aumenta a partir de la época 2 mientras el F1 se mantiene, lo que indica sobreajuste progresivo; por eso la selección del checkpoint se hizo por F1 y no por pérdida.

## Capacidades

- Clasificación binaria de texto en español: etiquetas SARCASMO y NO_SARCASMO con puntuación de confianza.
- Detección de sarcasmo en frases cortas, especialmente titulares de prensa.
- Procesamiento de textos de hasta 128 tokens; los textos más largos se truncan.
- Inferencia rápida en CPU y GPU gracias a su tamaño compacto (~110M parámetros).
- Integración directa con el pipeline `text-classification` de Transformers.
- No soporta tool calling, function calling ni razonamiento multi-step.
- No tiene capacidades de generación de texto, visión, audio ni agentes.
- Capacidad multilingüe limitada al español; no se ha evaluado en otras lenguas.

## Casos de uso

- Moderación de comentarios en foros y redes sociales: el modelo puede marcar mensajes potencialmente sarcásticos para revisión humana, ayudando a distinguir ironía de agresividad en comunidades en español.
- Análisis de sentimiento matizado en redes sociales: complementa clasificadores de polaridad detectando ironía que invertiría el sentimiento literal, mejorando la precisión de paneles de opinión.
- Monitorización de reputación de marca: permite identificar menciones sarcásticas hacia una marca o producto en prensa y redes, que los análisis de sentimiento convencionales clasificarían erróneamente como positivas.
- Investigación en lingüística computacional: sirve como línea base reproducible para estudiar detección de sarcasmo en español, con métricas de validación declaradas y arquitectura estándar.
- Filtrado de reseñas y opiniones de productos: detecta reseñas irónicas (por ejemplo, "menudo descubrimiento, se rompió a la semana") que deben separarse de las genuinamente positivas.
- Enriquecimiento de datasets periodísticos: al estar entrenado con titulares, puede etiquetar automáticamente grandes corpus de prensa para estudios de sesgo o estilo, con la cautela de que el modelo puede apoyarse en el tema más que en la ironía.
- Preprocesado en pipelines de NLP: como componente ligero previo a modelos generativos o de resumen, para marcar segmentos irónicos y ajustar el postprocesado.

## Benchmarks y rendimiento

Los únicos datos disponibles son los de validación interna declarados por el autor (mejor época, la 5):

| Metrica | Valor |
|---|---|
| F1 macro | 0.9140 |
| F1 ponderado | 0.9140 |
| Accuracy (epoca 5) | 0.9141 |

Evolución por época (extracto):

| Epoca | Perdida train | Perdida validacion | Accuracy | F1 |
|---|---|---|---|---|
| 1 | 0.4561 | 0.3024 | 0.8709 | 0.8701 |
| 2 | 0.2224 | 0.2627 | 0.9052 | 0.9052 |
| 3 | 0.1071 | 0.3483 | 0.9065 | 0.9064 |
| 4 | 0.0572 | 0.4413 | 0.9114 | 0.9114 |
| 5 | 0.0264 | 0.5355 | 0.9141 | 0.9140 |
| 6 | 0.0116 | 0.6682 | 0.9121 | 0.9121 |
| 7 | 0.0049 | 0.7290 | 0.9088 | 0.9088 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) ni comparaciones con modelos similares en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 (~440 MB de pesos) y aproximadamente 0,25 GB en FP16; en la práctica cabe holgadamente en cualquier GPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU sin problemas. Cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) es más que suficiente.
- Cabe en GPU consumer: sí, en todas las tarjetas actuales, e incluso en dispositivos de borde con poca memoria.
- Opciones de despliegue: pipeline de Transformers, ONNX Runtime, TorchScript, FastAPI con Uvicorn, y servidores de inferencia ligeros. vLLM y TGI no están orientados a modelos encoder de clasificación, aunque podrían adaptarse; llama.cpp no es la vía natural para BERT.
- Latencia y throughput estimados: no disponibles de forma oficial; por el tamaño del modelo, se espera latencia de milisegundos por frase en CPU moderna y throughput de cientos a miles de frases por segundo en GPU con batching.

## Comparativa con modelos similares

No se dispone de datos publicados de otros modelos de detección de sarcasmo en español con los que comparar directamente en la información proporcionada. Como referencia estructural, la tabla siguiente recoge el modelo base y dos alternativas genéricas de clasificación en español, sin datos de rendimiento específicos de sarcasmo:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ManuelR12/beto-sarcasmo-bs32 | 109.852.418 | 128 tokens | Clasificación de sarcasmo | apache-2.0 | Hugging Face |
| dccuchile/bert-base-spanish-wwm-cased (BETO) | ~110M | 512 tokens | Modelo base (MLM) | no disponible en esta ficha | Hugging Face |
| Modelos de análisis de sentimiento en español (p. ej. pysentimiento/robertuito) | ~110-125M | 128 tokens | Sentimiento/emoción | no disponible en esta ficha | Hugging Face |

La comparación de rendimiento con alternativas específicas de sarcasmo queda como no disponible.

## Limitaciones y advertencias

- Entrenado casi exclusivamente con titulares de prensa: puede apoyarse en el tema, el medio o el estilo periodístico más que en la ironía real, lo que reduce su generalización a otros dominios.
- Puede fallar con sarcasmo conversacional, jerga regional, modismos y textos largos (se truncan a 128 tokens).
- Riesgo de sobreajuste: la pérdida de validación aumenta desde la época 2 y el checkpoint se eligió por F1, no por pérdida; el modelo se vuelve muy seguro y sus errores pesan más.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y falsos negativos con alta confianza, lo que puede inducir a error si se usa sin revisión humana.
- Dataset de entrenamiento no publicado: no es posible auditar la composición, los sesgos temáticos ni la procedencia de las frases, lo que dificulta la reproducibilidad.
- Sesgos conocidos: no documentados por el autor; al provenir de prensa, puede heredar sesgos editoriales y de cobertura mediática.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene validar el modelo en el dominio concreto antes de producción.
- Sin benchmarks externos ni evaluaciones independientes: las métricas de 0,914 de F1 proceden solo de la validación interna del autor y no son directamente comparables con otros trabajos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ManuelR12/beto-sarcasmo-bs32
- Modelo base BETO: https://huggingface.co/dccuchile/bert-base-spanish-wwm-cased
- Documentación del pipeline de clasificación de Transformers: https://huggingface.co/docs/transformers/main_classes/pipelines#transformers.TextClassificationPipeline
- Paper de BETO (Cañete et al.): https://arxiv.org/abs/2307.03733
