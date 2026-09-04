# Adame92/distilbert-sentiment-demo

## Resumen

`Adame92/distilbert-sentiment-demo` es un modelo de clasificación de texto (text-classification) desarrollado por el usuario Adame92. Se trata de un fine-tuning de `distilbert-base-uncased`, un modelo Transformer basado en destilación de BERT, entrenado para determinar el sentimiento (positivo o negativo) de un texto en inglés. El modelo tiene 66.955.010 parámetros, una longitud de contexto heredada de 512 tokens y se distribuye con licencia Apache 2.0.

El modelo está pensado como demostración de un pipeline de análisis de sentimiento: es ligero, rápido y apto para ejecutarse en CPU o en GPUs pequeñas. Aunque no se han publicado benchmarks comparativos, la model card reporta una accuracy de 0,8424 en el conjunto de evaluación, lo que lo convierte en una opción razonable para prototipos o aplicaciones con recursos limitados. No se especifica el dataset de entrenamiento, por lo que su rendimiento en dominios distintos al inglés puede ser limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT) |
| Parametros totales | 66.955.010 |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | 512 tokens (heredado de distilbert-base-uncased) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo base en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, onnx |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura DistilBERT, un Transformer encoder de 6 capas, 768 dimensiones ocultas y 12 cabezas de atención, destilado a partir de BERT-base. Esta arquitectura reduce el número de parámetros en aproximadamente un 40 % respecto a BERT-base manteniendo una capacidad de comprensión del lenguaje competitiva para tareas de clasificación.

El fine-tuning se realizó sobre un dataset no especificado. Según la model card, el entrenamiento se ejecutó con una tasa de aprendizaje de 2e-5, tamaño de lote de 16, optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-8, programador de tasa de aprendizaje lineal y 2 épocas. El framework utilizado fue Transformers 5.16.1 con PyTorch 2.11.0+cu128. No se menciona ningún proceso de alineación como RLHF o DPO.

## Capacidades

- Clasificación de sentimiento binario (positivo/negativo) en inglés, tal como se muestra en la demo pública de Hugging Face Spaces.
- Inferencia de baja latencia gracias al tamaño reducido del modelo (66,96 millones de parámetros).
- Compatible con el pipeline `text-classification` de Transformers y con exportación a ONNX.
- No soporta generación de texto libre ni tareas de razonamiento complejo.
- No soporta tool calling ni function calling.
- No soporta tareas de agentes ni multi-step reasoning.
- No es multilingüe: el modelo base está entrenado en inglés.
- No tiene capacidades de visión ni audio.

## Casos de uso

- Análisis de reseñas de productos: permite clasificar automáticamente comentarios de clientes en positivos o negativos, facilitando la priorización de quejas en plataformas de e-commerce.
- Monitorización de redes sociales: puede aplicarse a textos de Twitter o Facebook para detectar sentimiento hacia una marca o campaña en tiempo real, gracias a su baja latencia.
- Triaje de tickets de soporte: los tickets entrantes pueden clasificarse como positivos o negativos para derivar de forma automática los casos urgentes al equipo de atención.
- Análisis de encuestas de satisfacción: respuestas abiertas de encuestas pueden etiquetarse por sentimiento para generar métricas agregadas sin intervención manual.
- Filtrado de comentarios en foros: ayuda a identificar comentarios negativos o tóxicos en comunidades online, aunque no está diseñado específicamente para detección de toxicidad.
- Prototipos y demos de NLP: al ser un modelo pequeño y con licencia Apache 2.0, es adecuado para validar flujos de análisis de sentimiento en entornos de investigación o desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos en la información disponible. La model card incluye los siguientes resultados de evaluación sobre un conjunto no especificado:

| Metrica | Valor |
|---|---|
| Loss | 0.4200 |
| Accuracy | 0.8424 |

También se reportan los resultados de entrenamiento por época:

| Training Loss | Epoch | Step | Validation Loss | Accuracy |
|:-------------:|:-----:|:----:|:---------------:|:--------:|
| 0.4193        | 1.0   | 534  | 0.3657          | 0.8424   |
| 0.2550        | 2.0   | 1068 | 0.3715          | 0.8565   |

No hay datos sobre F1, precisión o recall, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 268 MB en fp32 y 134 MB en fp16, debido a los 66,96 millones de parámetros.
- GPU recomendadas: cualquier GPU moderna con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060, A10). También puede ejecutarse en CPU.
- Es compatible con GPUs de consumo y con GPUs integradas, gracias a su tamaño reducido.
- Opciones de despliegue: Hugging Face `pipeline` de Transformers, ONNX Runtime, Hugging Face Inference Endpoints y contenedores Docker con TorchServe.
- Latencia y throughput: no disponibles en la información proporcionada, pero al ser un modelo de 66 millones de parámetros se espera una latencia de pocos milisegundos en CPU moderna y mayor throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| Adame92/distilbert-sentiment-demo | 66.955.010 | 512 tokens | Apache 2.0 | Clasificación de sentimiento |
| distilbert-base-uncased | 66.955.010 | 512 tokens | Apache 2.0 | Modelo base para fine-tuning |
| bert-base-uncased | 110.000.000 | 512 tokens | Apache 2.0 | Modelo base para NLP general |
| roberta-base | 125.000.000 | 512 tokens | MIT | Modelo base para NLP general |

No se dispone de resultados de benchmarks comparativos entre estos modelos. La ventaja principal del modelo analizado es que ya está fine-tuned para sentimiento, mientras que los modelos base requieren entrenamiento adicional.

## Limitaciones y advertencias

- El dataset de entrenamiento no está especificado, por lo que la generalización a dominios distintos del original no está garantizada.
- El modelo está basado en `distilbert-base-uncased`, que es monolingüe en inglés. Su rendimiento en otros idiomas será muy limitado.
- Hereda los sesgos presentes en los datos de entrenamiento de BERT, que pueden reflejar estereotipos o lenguaje ofensivo.
- La longitud de contexto es de 512 tokens, por lo que no es adecuado para documentos largos.
- No es un modelo generativo: no puede producir texto, solo etiquetas de clase.
- El autor no ha publicado información sobre el conjunto de datos de evaluación, lo que dificulta la interpretación de la accuracy reportada.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar que el modelo cumple con los requisitos de su aplicación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Adame92/distilbert-sentiment-demo
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/Drocho/distilbert-sentiment-demo
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Paper de DistilBERT: https://arxiv.org/abs/1910.09700
