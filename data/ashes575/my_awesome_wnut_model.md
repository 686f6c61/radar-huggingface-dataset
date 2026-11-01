# ashes575/my_awesome_wnut_model

## Resumen

my_awesome_wnut_model es un modelo de clasificación de tokens (token classification) obtenido mediante fine-tuning de distilbert-base-uncased, publicado por el usuario ashes575 en HuggingFace. El nombre del repositorio sugiere que se entrenó sobre el dataset WNUT (Workshop on Noisy User-generated Text), orientado a la detección de entidades nombradas en texto informal, aunque la model card no confirma explícitamente el dataset utilizado. Se trata de un experimento de ajuste fino, no de un modelo fundacional ni de un lanzamiento con documentación técnica elaborada.

El modelo parte de DistilBERT, una versión destilada de BERT con 66,4 millones de parámetros y arquitectura transformer encoder-only. Al ser un modelo de clasificación de tokens, su función es etiquetar cada token de una secuencia de entrada (por ejemplo, para reconocimiento de entidades nombradas o etiquetado morfosintáctico), no generar texto libre. La ventana de contexto efectiva es la de DistilBERT: 512 tokens.

Su relevancia es limitada y de carácter práctico: sirve como ejemplo reproducible de fine-tuning con la librería Transformers, con hiperparámetros y métricas documentados, y puede utilizarse como punto de partida o referencia para tareas de etiquetado de secuencias en dominios ruidosos. Los resultados reportados (F1 de 0,4081 y precisión de 0,5729 en el conjunto de evaluación) indican un rendimiento moderado, lejos de un sistema de producción robusto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (DistilBERT, destilado de BERT) |
| Parametros totales | 66.372.877 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de DistilBERT; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización no documentada) |
| Idiomas soportados | no disponible (modelo base entrenado principalmente en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es DistilBERT, un transformer encoder-only de 6 capas y 66 millones de parámetros obtenido por destilación de conocimiento a partir de BERT-base. El modelo se ha ajustado para clasificación de tokens añadiendo una cabeza de clasificación sobre las representaciones contextuales de cada token. La model card indica que el fine-tuning se realizó sobre un dataset no especificado ("unknown dataset"), aunque el nombre del repositorio apunta a WNUT, un corpus de texto generado por usuarios con ruido ortográfico y gramatical.

Los hiperparámetros de entrenamiento documentados son: learning rate de 2e-05, batch size de 16 (tanto en entrenamiento como en evaluación), semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal y 2 épocas. El entrenamiento se ejecutó con Transformers 5.20.2, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3. No se documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO (no aplicables en un modelo encoder-only de clasificación). No se describen innovaciones técnicas adicionales.

## Capacidades

- Clasificación de tokens a nivel de token: asigna una etiqueta a cada token de la secuencia de entrada, típicamente en tareas de reconocimiento de entidades nombradas (NER).
- Detección de entidades en texto ruidoso: el nombre del modelo sugiere entrenamiento orientado a texto informal o generado por usuarios (WNUT), aunque no se confirma en la documentación.
- Procesamiento de secuencias de hasta 512 tokens.
- No dispone de generación de texto, razonamiento, código ni matemáticas: es un modelo discriminativo, no generativo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües no documentadas; el modelo base está entrenado principalmente en inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Extracción de entidades en publicaciones de redes sociales: el modelo puede etiquetar tokens correspondientes a personas, organizaciones o lugares en textos informales, aunque su F1 de 0,4081 limita su uso a prototipos o como señal auxiliar.
- Etiquetado de secuencias en pipelines de preprocesamiento: puede integrarse como componente de anotación previa en flujos de NLP donde se requiera una primera pasada rápida sobre texto en inglés.
- Referencia educativa para fine-tuning: sirve como ejemplo reproducible de ajuste de DistilBERT para clasificación de tokens, con hiperparámetros y curvas de entrenamiento documentadas.
- Baseline en experimentos de NER: útil como punto de comparación de bajo coste computacional frente a modelos mayores o arquitecturas más recientes.
- Anonimización asistida de texto: la detección de menciones a entidades puede emplearse como paso inicial para enmascarar información personal en corpus de texto no estructurado, siempre con revisión humana.
- Clasificación de tokens en dominios con ruido ortográfico: adecuado para experimentar con normalización o etiquetado de texto con erratas, abreviaturas y jerga, dado el posible origen WNUT del entrenamiento.

## Benchmarks y rendimiento

La model card declara métricas en el conjunto de evaluación, pero el model-index no incluye resultados formales. Los datos disponibles son los siguientes:

| Metrica | Valor (epoca 1) | Valor (epoca 2) |
|---|---|---|
| Loss de validacion | 0,2798 | 0,2693 |
| Precision | 0,4791 | 0,5729 |
| Recall | 0,2335 | 0,3170 |
| F1 | 0,3140 | 0,4081 |
| Accuracy | 0,9377 | 0,9422 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La accuracy elevada (0,9422) es engañosa en tareas de etiquetado con clases desbalanceadas, donde la clase mayoritaria (típicamente "O", fuera de entidad) domina la métrica; el F1 de 0,4081 refleja mejor el rendimiento real en la detección de entidades.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en FP32 (66 millones de parámetros × 4 bytes), alrededor de 0,15 GB en FP16 y menos de 0,1 GB en cuantización INT8.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una NVIDIA T4, RTX 3060 o superior ofrece holgura para lotes grandes.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650, RTX 2060, RTX 3060, RTX 4090) e incluso en CPU para inferencia de baja latencia.
- Opciones de despliegue: pipeline de Transformers, Text Embedding Inference (TEI) no aplica por ser clasificación, vLLM no es adecuado para encoder-only, ONNX Runtime, TorchScript y exportación a GGUF mediante llama.cpp no está soportada de forma nativa para clasificación de tokens.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por secuencia en GPU y decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ashes575/my_awesome_wnut_model | 66,4 M | 512 tokens | Clasificación de tokens (NER) | apache-2.0 | HuggingFace |
| distilbert-base-uncased | 66,4 M | 512 tokens | Modelo base (MLM) | apache-2.0 | HuggingFace |
| dslim/bert-base-NER | 110 M | 512 tokens | NER (CoNLL-2003) | MIT | HuggingFace |
| Jean-Baptiste/roberta-large-ner-english | 355 M | 512 tokens | NER | MIT | HuggingFace |

La comparación con dslim/bert-base-NER y roberta-large-ner-english es orientativa: son alternativas consolidadas para NER en inglés con métricas públicas superiores (F1 en torno a 0,91 y 0,95 respectivamente en CoNLL-2003), aunque entrenadas en dominios distintos al posible WNUT. No se dispone de comparación directa con este modelo en el mismo conjunto de evaluación.

## Limitaciones y advertencias

- Rendimiento moderado: F1 de 0,4081 y recall de 0,3170 indican que el modelo pierde aproximadamente dos tercios de las entidades reales; no es adecuado para producción sin un umbral de confianza y revisión humana.
- Documentación insuficiente: la model card no especifica el dataset de entrenamiento, los idiomas, la taxonomía de etiquetas ni las limitaciones; el uso en producción requiere validación propia.
- Sesgos: al derivar de distilbert-base-uncased, hereda los sesgos presentes en los corpus web en inglés utilizados para entrenar BERT; no se han documentado evaluaciones de sesgo.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de etiquetados incorrectos con alta confianza en tokens ambiguos.
- Limitación de contexto: 512 tokens; secuencias más largas requieren truncamiento o segmentación con ventanas deslizantes.
- Limitación de idioma: el modelo base está entrenado principalmente en inglés; el rendimiento en castellano no está evaluado y probablemente sea deficiente.
- Licencia apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías; conviene conservar la atribución y verificar la licencia del dataset de entrenamiento, que no se especifica.
- Caveat de producción: la accuracy de 0,9422 puede inducir a error por desbalanceo de clases; evaluar con F1 por clase y matriz de confusión antes de cualquier despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ashes575/my_awesome_wnut_model
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Paper de DistilBERT: https://arxiv.org/abs/1910.01108
- Paper de BERT: https://arxiv.org/abs/1810.04805
- Workshop WNUT: https://noisy-text.github.io/
