# rkondo3/distilbert-base-uncased-finetuned-squad-d5716d28

## Resumen

Este modelo es una versión de DistilBERT afinada para extracción de respuestas (question answering extractivo) sobre el conjunto de datos SQuAD v1.1. Ha sido desarrollado por el usuario rkondo3 y replica el experimento "DistilBERT (D)" de la Tabla 2 del artículo original de DistilBERT, en el que el estudiante se entrena con un segundo paso de destilación específica de tarea: un BERT (también afinado en SQuAD v1.1) actúa como profesor durante el fine-tuning.

El problema que resuelve es la extracción de fragmentos de texto que responden a una pregunta a partir de un contexto dado, con un modelo ligero (aproximadamente 66 millones de parámetros, unos 0,3 GB en el repositorio) adecuado para despliegues con recursos limitados. Su relevancia actual radica en servir como ejemplo práctico de destilación de conocimiento en dos etapas, logrando un rendimiento cercano al publicado en el artículo (78,4 de Exact Match y 86,5 de F1 frente a 79,1 y 86,9 del original).

Arquitectura: DistilBERT (transformer encoder destilado de BERT), con pesos en formato compatible con PyTorch. La longitud de contexto es la estándar de la familia BERT/DistilBERT (512 tokens), aunque la model card no lo detalla explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder destilado de BERT, base uncased) |
| Parametros totales | no disponible (aprox. 66 M según la familia DistilBERT base; tamano de repo 0,3 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (512 tokens por defecto en DistilBERT) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (safetensors no confirmado en la informacion disponible) |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased` como red estudiante y emplea `lewtun/bert-base-uncased-finetuned-squad-v1` como profesor. El entrenamiento sigue el esquema del artículo de DistilBERT (Sanh et al., 2020): tras el preentrenamiento por destilación del estudiante, se realiza un fine-tuning en SQuAD v1.1 con una segunda destilación específica de tarea, en la que las salidas del profesor (también afinado en SQuAD) guían el aprendizaje del estudiante mediante pérdidas de imitación además de la supervisión directa.

Los datos de entrenamiento corresponden íntegramente a SQuAD v1.1, un corpus de más de 100.000 preguntas de comprensión lectora sobre artículos de Wikipedia, cargable mediante la librería `datasets` de Hugging Face. La model card no detalla hiperparámetros concretos (número de épocas, tasa de aprendizaje, tamaño de lote) ni el uso de técnicas adicionales como RLHF o DPO, que no aplican a este tipo de modelo extractivo. No se menciona ninguna innovación técnica más allá de la doble destilación descrita.

## Capacidades

- Extracción de respuestas (question answering extractivo): dado un contexto y una pregunta, devuelve el fragmento del contexto que responde a la pregunta, con puntuaciones de inicio y fin.
- Comprensión lectora en inglés sobre textos tipo Wikipedia (dominio de SQuAD v1.1).
- Clasificación de span mediante cabezas de inicio/fin sobre representaciones del encoder DistilBERT.
- No dispone de generación de texto libre, razonamiento multi-paso, tool calling, capacidades de agente, visión ni audio: es un modelo encoder extractivo puro.
- Sin soporte multilingüe: entrenado exclusivamente en inglés (uncased, es decir, insensible a mayúsculas).

## Casos de uso

- Buscadores de respuestas sobre documentación: dado un párrafo o artículo recuperado, el modelo extrae el span que responde a la consulta del usuario con baja latencia, ideal para pipelines de búsqueda semántica de una etapa.
- Chatbots de soporte con base de conocimiento limitada: sobre fragmentos de FAQs o manuales en inglés, extrae la respuesta concreta sin necesidad de un LLM generativo, reduciendo coste y riesgo de alucinación.
- Anotación y minería de texto: extracción masiva de respuestas a preguntas plantilla sobre grandes corpus de texto (informes, artículos), aprovechando su pequeño tamano para procesamiento por lotes en CPU o GPU modestas.
- Educación y herramientas de estudio: generación automática de respuestas a preguntas de comprensión sobre textos académicos en inglés.
- Baseline de investigación en destilación: reproducción del experimento "DistilBERT (D)" del artículo original, útil como punto de comparación en estudios de knowledge distillation específica de tarea.
- Despliegue en entornos con recursos limitados: con ~66 M de parámetros y 0,3 GB de pesos, es adecuado para inferencia en CPU, edge devices o servicios con presupuesto de VRAM muy reducido.

## Benchmarks y rendimiento

Resultados publicados por el autor en SQuAD v1.1 (calculados con la métrica `squad` de `datasets`):

| Modelo | Exact Match | F1 |
|---|---|---|
| DistilBERT (D), artículo original | 79,1 | 86,9 |
| Este modelo (rkondo3) | 78,4 | 86,5 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible; no serían aplicables a un modelo extractivo de esta naturaleza.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con ~0,3 GB de pesos, el modelo cabe cómodamente en 1-2 GB de VRAM en fp32, e incluso menos con cuantización. Es plenamente utilizable en CPU.
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100 ni H100. Una RTX 3060 o incluso integraciones de menor gama sobran para inferencia y también para replicar el fine-tuning en SQuAD.
- Consumer GPUs: cabe sin problemas en cualquier GPU de consumo actual (desde una GTX 1660 en adelante) tanto para inferencia como para entrenamiento.
- Opciones de despliegue: librería `transformers` de Hugging Face (pipeline `question-answering`), ONNX Runtime para optimización en producción, y servidores ligeros como Text Embeddings/Inference de Hugging Face; no requiere vLLM ni TGI al no ser un modelo generativo.
- Latencia y throughput: no disponible; por su tamano (comparable a DistilBERT base), se esperan latencias de pocos milisegundos por consulta en GPU y decenas de milisegundos en CPU moderno, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | SQuAD v1.1 (EM/F1) | Licencia |
|---|---|---|---|---|
| rkondo3/distilbert-base-uncased-finetuned-squad-d5716d28 | ~66 M | QA extractivo (inglés) | 78,4 / 86,5 | Apache 2.0 |
| distilbert-base-uncased-distilled-squad (Hugging Face oficial) | ~66 M | QA extractivo (inglés) | 79,1 / 86,9 (según paper) | Apache 2.0 |
| lewtun/bert-base-uncased-finetuned-squad-v1 (profesor) | ~110 M | QA extractivo (inglés) | no disponible | no disponible |
| deepset/roberta-base-squad2 | ~125 M | QA extractivo (inglés, con respuestas nulas) | no disponible | CC-BY-NC-SA (no comercial) |

Frente al BERT-base profesor, este modelo ofrece un rendimiento casi equivalente con aproximadamente un 40 % menos de parámetros, lo que se traduce en inferencia más rápida y menor consumo de memoria, el objetivo central de la destilación.

## Limitaciones y advertencias

- Restricción de idioma: solo inglés y con tokenización uncased; el rendimiento degrada significativamente fuera del dominio de SQuAD (Wikipedia) o en textos de otros tipos (legales, médicos, conversacionales).
- Naturaleza extractiva: solo puede devolver fragmentos presentes en el contexto; no genera, reformula ni sintetiza respuestas, y no puede indicar ausencia de respuesta (SQuAD v1.1 no incluye preguntas sin respuesta, a diferencia de v2).
- Sesgos heredados de SQuAD y de Wikipedia: posibles sesgos de género, geográficos y de estilo de pregunta típicos de este dataset.
- Riesgo de alucinación bajo en comparación con modelos generativos, pero puede seleccionar spans incorrectos si la pregunta es ambigua o el contexto no contiene la respuesta.
- Contexto limitado a 512 tokens: documentos largos requieren segmentación previa (chunking) con solapamiento.
- Métricas ligeramente inferiores a las del paper original (78,4/86,5 frente a 79,1/86,9), posiblemente por diferencias en hiperparámetros o semilla de entrenamiento.
- Modelo comunitario con muy pocas descargas (23) y sin mantenimiento aparente: para producción se recomienda preferir los checkpoints oficiales de Hugging Face equivalentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rkondo3/distilbert-base-uncased-finetuned-squad-d5716d28
- Artículo de DistilBERT (arXiv 1910.01108): https://arxiv.org/pdf/1910.01108.pdf
- Dataset SQuAD v1.1 (via `datasets`): https://huggingface.co/datasets/squad
- Profesor utilizado: https://huggingface.co/lewtun/bert-base-uncased-finetuned-squad-v1
- Estudiante base: https://huggingface.co/distilbert-base-uncased
