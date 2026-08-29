# Islamamro/amazon-counterfactual-aurora-islamamro

## Resumen

El modelo `Islamamro/amazon-counterfactual-aurora-islamamro` es un clasificador de texto binario diseñado para detectar declaraciones contrafactuales en reseñas de productos de Amazon. Ha sido desarrollado por el usuario Islamamro como parte de una demostración del pipeline de entrenamiento y publicación **Aurora Research Portal**, y se presenta como una prueba de concepto más que como un modelo listo para producción.

Se trata de un fine-tuning de `distilbert-base-uncased` sobre el dataset `SetFit/amazon_counterfactual_en`, que contiene frases de reseñas de clientes anotadas para la detección de contrafactuales (clasificación binaria). El modelo tiene aproximadamente 66,9 millones de parámetros y fue entrenado en una NVIDIA RTX 3090 sobre un subconjunto reducido de 1.400 ejemplos. A pesar de su naturaleza demostrativa, alcanza una precisión del 0,96 en el conjunto de validación retenido, lo que sugiere que la tarea es relativamente sencilla y que el modelo podría servir como base para un desarrollo posterior con datos completos.

La relevancia de este modelo radica en su papel como ejemplo de un flujo de trabajo completo de fine-tuning y publicación mediante la plataforma Aurora, más que en su rendimiento como herramienta de producción. Para aplicaciones reales, el propio autor recomienda reentrenar con el dataset completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (encoder-only transformer) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (dataset en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura DistilBERT, una versión destilada de BERT que conserva aproximadamente el 66% de los parámetros del modelo original (66,9 millones frente a 110 millones) mediante una técnica de destilación de conocimiento. DistilBERT mantiene la estructura de transformer encoder-only con atención bidireccional, pero reduce el número de capas y utiliza una inicialización basada en el modelo profesor.

El entrenamiento consistió en un fine-tuning supervisado sobre el dataset `SetFit/amazon_counterfactual_en`, que contiene reseñas de Amazon anotadas manualmente para la tarea de detección de contrafactuales. El autor indica que se utilizó un subconjunto de 1.400 ejemplos, lo que constituye una fracción muy pequeña del dataset completo. No se especifican hiperparámetros, número de épocas ni técnica de optimización. El entrenamiento se realizó en una NVIDIA RTX 3090 a través del pipeline Aurora, que automatiza el proceso de construcción, entrenamiento y publicación. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Clasificación de texto binaria: detecta si una frase de una reseña de producto contiene una declaración contrafactual (por ejemplo, "si hubiera sido más barato, lo habría comprado").
- Procesamiento de lenguaje natural en inglés (implícito por el dataset, aunque no se declara oficialmente).
- Inferencia rápida gracias al tamaño reducido de DistilBERT, adecuada para entornos con recursos limitados.
- Integración sencilla con la librería `transformers` mediante el pipeline de clasificación de texto.
- No soporta tool calling, generación de código, razonamiento multi-paso, visión ni otras capacidades avanzadas.

## Casos de uso

- Análisis de reseñas de productos: el modelo puede clasificar automáticamente reseñas que contengan lenguaje contrafactual, útil para entender las expectativas no cumplidas de los clientes. Por ejemplo, una empresa podría procesar miles de reseñas y extraer patrones de quejas condicionales.
- Investigación académica en procesamiento de lenguaje natural: sirve como punto de partida para estudiar la detección de contrafactuales, aunque se recomienda reentrenar con el dataset completo para obtener resultados fiables.
- Demostración de pipelines de MLOps: el modelo ejemplifica un flujo completo de fine-tuning y publicación mediante la plataforma Aurora, útil para desarrolladores que quieran replicar el proceso con sus propios datos.
- Prototipado rápido: dado su pequeño tamaño, puede desplegarse en entornos de prueba para validar la viabilidad de una aplicación de análisis de sentimiento condicional antes de invertir en un modelo más grande.
- Educación y formación: sirve como ejemplo didáctico de cómo adaptar un modelo preentrenado a una tarea específica de clasificación de texto con pocos recursos.
- Filtrado de contenido en plataformas de comercio electrónico: aunque no es apto para producción sin reentrenamiento, podría integrarse en un sistema de moderación para identificar reseñas con lenguaje especulativo o condicional.

## Benchmarks y rendimiento

El autor reporta una precisión del 0,96 en un conjunto de validación retenido, pero no especifica el tamaño de dicho conjunto ni la metodología exacta. No se han publicado resultados comparativos con otros modelos en la información disponible. Dado que el entrenamiento se realizó sobre un subconjunto de 1.400 ejemplos, esta métrica debe interpretarse con cautela y no es representativa del rendimiento en datos completos.

| Metrica | Valor |
|---|---|
| Precisión (held-out) | 0,96 |

No se dispone de resultados en benchmarks estándar como MMLU, HumanEval o GLUE para este modelo.

## Requisitos de hardware

- El modelo tiene 66,9 millones de parámetros, lo que en precisión fp32 ocupa aproximadamente 268 MB de memoria. Con cuantización a int8, el tamaño se reduce a unos 67 MB.
- Es compatible con cualquier GPU consumer moderna, incluidas las series RTX 2060, RTX 3060, RTX 4090, así como GPUs de gama baja con 4 GB de VRAM.
- También puede ejecutarse en CPU con razonable velocidad para inferencia por lotes pequeños, gracias a su tamaño compacto.
- Para despliegue en producción, se puede servir con vLLM, TGI o Hugging Face Inference Endpoints, aunque al ser un modelo de demostración, el uso de `transformers` pipeline es suficiente.
- La latencia estimada en una GPU moderna (RTX 3090) es del orden de milisegundos por muestra, aunque no se han publicado mediciones oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicamente entrenados para detección de contrafactuales en el ecosistema de Hugging Face. Como referencia, se puede comparar con el modelo base `distilbert-base-uncased` (66,9 M parámetros, contexto 512, licencia Apache-2.0), del cual este modelo es un fine-tuning. Otros modelos de clasificación de texto de tamaño similar, como `bert-base-uncased` (110 M parámetros) o `roberta-base` (125 M parámetros), podrían adaptarse a la misma tarea, pero no se han encontrado versiones fine-tuned específicas en la información proporcionada.

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| Islamamro/amazon-counterfactual-aurora-islamamro | 66,9 M | no disponible | Detección de contrafactuales | Apache-2.0 |
| distilbert-base-uncased | 66,9 M | 512 | Modelo base | Apache-2.0 |
| bert-base-uncased | 110 M | 512 | Modelo base | Apache-2.0 |

## Limitaciones y advertencias

- Modelo de demostración: entrenado sobre un subconjunto de 1.400 ejemplos, no es apto para uso en producción sin un reentrenamiento con el dataset completo.
- Sesgo del dataset: las reseñas de Amazon pueden contener sesgos demográficos, de producto o de idioma que el modelo podría aprender y amplificar.
- Riesgo de alucinación: al ser un clasificador, no genera texto, pero puede producir clasificaciones erróneas en frases ambiguas o fuera de dominio.
- Limitaciones de idioma: aunque el dataset es en inglés, no se declara oficialmente el soporte de idiomas; es probable que el modelo solo funcione bien en inglés.
- Sin información sobre cuantizaciones: no se han publicado versiones cuantizadas ni guías de despliegue optimizado.
- Fecha de creación futura: el modelo fue creado en agosto de 2026, lo que puede indicar que es un artefacto experimental reciente y no ha sido sometido a validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Islamamro/amazon-counterfactual-aurora-islamamro
- Dataset de entrenamiento: https://huggingface.co/datasets/SetFit/amazon_counterfactual_en
- Dataset en MTEB: https://huggingface.co/datasets/mteb/amazon_counterfactual
