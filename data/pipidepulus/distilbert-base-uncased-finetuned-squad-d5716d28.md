# pipidepulus/distilbert-base-uncased-finetuned-squad-d5716d28

## Resumen

DistilBERT fine-tuned para question answering extractivo sobre SQuAD v1.1, publicado por el usuario pipidepulus en HuggingFace. El modelo replica el denominado "DistilBERT (D)" de la Tabla 2 del paper original de DistilBERT: parte de un estudiante `distilbert-base-uncased` y aplica una segunda etapa de destilación específica de tarea, usando como profesor un `bert-base-uncased` ya ajustado a SQuAD v1.1 (`lewtun/bert-base-uncased-finetuned-squad-v1`).

La arquitectura es un transformer encoder de 6 capas con 66 millones de parámetros, la mitad que BERT-base, lo que reduce el coste de inferencia aproximadamente un 60 % manteniendo cerca del 97 % del rendimiento del profesor en esta tarea. El contexto máximo está limitado a 512 tokens, herencia directa de la familia BERT.

Es relevante como referencia práctica de destilación en dos etapas para QA extractivo en inglés: un modelo pequeño, con licencia Apache 2.0, que cabe en cualquier GPU consumer y sirve como baseline reproducible frente a modelos de QA mucho más grandes. El repositorio ocupa 0,3 GB y acumula 31 descargas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas, 12 cabezas de atención, hidden size 768) |
| Parametros totales | 66 millones (aproximado, arquitectura DistilBERT-base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en fp32; compatible con cuantización dinámica de PyTorch y ONNX en la práctica) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (pytorch_model.bin / safetensors según repo); no se publican GGUF ni ONNX en la información disponible |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura DistilBERT: un transformer encoder de 6 capas, 768 dimensiones ocultas y 12 cabezas de atención, destilado inicialmente desde BERT-base y posteriormente ajustado a la tarea de question answering extractivo. La cabeza de QA es la estándar de BERT (proyección lineal sobre los estados ocultos para predecir los índices de inicio y fin de la respuesta en el contexto).

El entrenamiento se realiza en dos fases. En la primera, el estudiante `distilbert-base-uncased` se ajusta sobre SQuAD v1.1. En la segunda, se aplica destilación específica de tarea usando como profesor `lewtun/bert-base-uncased-finetuned-squad-v1`, también ajustado a SQuAD v1.1. El dataset es SQuAD v1.1, disponible vía `datasets.load_dataset('squad')`. No se especifican en la model card el número de tokens de entrenamiento, la composición exacta del dataset más allá de SQuAD, ni detalles de hiperparámetros, función de pérdida de destilación o si hubo data augmentation. No se menciona RLHF ni DPO, algo esperable en un modelo de 2019-2020 orientado a una tarea extractiva.

## Capacidades

- Question answering extractivo en inglés: dado un contexto y una pregunta, devuelve el span de texto que responde a la pregunta.
- Comprensión lectora sobre pasajes de hasta 512 tokens.
- No genera texto libre: la salida es un span del contexto, no una respuesta abstractiva.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- Multilingüe: no, solo inglés.
- No dispone de modo thinking, visión ni audio.
- Apropiado como componente de un pipeline de búsqueda de respuestas con recuperación previa (retrieval + QA extractivo).

## Casos de uso

- Búsqueda de respuestas sobre documentación técnica: se recuperan pasajes relevantes con un retriever (por ejemplo, BM25 o un bi-encoder) y el modelo extrae el span exacto que responde a la consulta del usuario, con contexto de hasta 512 tokens por pasaje.
- FAQ automatizadas en inglés: dado un corpus de preguntas frecuentes, el modelo localiza la frase concreta que responde a la pregunta del usuario, lo que facilita mostrar citas textuales y reducir el riesgo de alucinación frente a modelos generativos.
- Extracción de campos en formularios y contratos: para preguntas del tipo "¿cuál es la fecha de inicio del contrato?", el modelo devuelve el span correspondiente, integrable en pipelines de procesamiento documental.
- Asistente de atención al cliente con citas: al devolver spans textuales del contexto, permite construir respuestas con trazabilidad a la fuente, útil en entornos donde se exige justificar la respuesta.
- Evaluación de sistemas RAG: sirve como baseline ligero de QA extractivo para medir la calidad del retriever y del pipeline antes de escalar a modelos generativos más costosos.
- Despliegue en entornos con recursos limitados: con 66 millones de parámetros y 0,3 GB de pesos, puede ejecutarse en CPU o en GPUs de gama baja para tareas de extracción de respuestas en tiempo real.
- Prototipado e investigación en destilación: referencia reproducible para comparar técnicas de destilación en dos etapas sobre SQuAD.

## Benchmarks y rendimiento

| Modelo | Exact Match | F1 |
|---|---|---|
| DistilBERT (D) según paper | 79,1 | 86,9 |
| Este modelo (Ours) | 78,4 | 86,5 |

Las métricas se calcularon con la métrica `squad` de la librería `datasets`. No se han publicado en la información disponible resultados en otros benchmarks (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,3 GB de pesos más overhead de activaciones; cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU moderna, incluidas RTX 3060, RTX 4090, T4, A10, A100 o H100; el modelo no aprovecha las GPU de gama alta por su tamaño reducido.
- Cabe en GPU consumer: sí, en cualquier GPU consumer con al menos 2 GB de VRAM; también funciona en CPU con latencias aceptables para peticiones individuales.
- Opciones de despliegue: PyTorch nativo con `transformers`, TorchScript, ONNX Runtime, y servidores de inferencia como TGI o FastAPI con batching. No se publican pesos GGUF, por lo que llama.cpp u Ollama requerirían conversión previa.
- Latencia y throughput: no se han publicado mediciones específicas en la información disponible. Por el tamaño del modelo, se espera latencia de milisegundos por petición en GPU y de decenas de milisegundos en CPU, si bien estos valores son estimaciones y no datos medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | EM / F1 en SQuAD v1.1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (DistilBERT destilado en 2 etapas) | 66 M | 512 | 78,4 / 86,5 | Apache 2.0 | HuggingFace |
| `distilbert-base-uncased-distilled-squad` (referencia de la comunidad) | 66 M | 512 | no disponible en esta ficha | Apache 2.0 | HuggingFace |
| `bert-base-uncased` fine-tuned a SQuAD v1.1 (profesor) | 110 M | 512 | no disponible en esta ficha | Apache 2.0 | HuggingFace |
| DistilBERT (D) según paper | 66 M | 512 | 79,1 / 86,9 | Apache 2.0 | Referencia académica |

No se dispone en la información proporcionada de resultados comparables de otros modelos de QA extractivo (RoBERTa-base, ALBERT, MiniLM) para esta tabla.

## Limitaciones y advertencias

- Solo responde en inglés; no soporta consultas ni contextos en castellano.
- Es un modelo extractivo: no genera respuestas, solo devuelve spans del contexto. Si la respuesta no está literalmente en el pasaje, no la producirá.
- Limitado a 512 tokens de contexto; pasajes más largos deben dividirse, lo que puede romper la coherencia de la respuesta.
- Entrenado únicamente en SQuAD v1.1, un dataset con sesgos conocidos (textos de Wikipedia, dominio enciclopédico); el rendimiento puede degradarse en dominios muy distintos (legal, médico, técnico).
- Riesgo de sesgos heredados de BERT-base y del corpus de Wikipedia, incluyendo sesgos de género, culturales y geográficos.
- Riesgo de alucinación bajo en comparación con modelos generativos, pero puede devolver spans irrelevantes cuando la pregunta es ambigua o el contexto no contiene la respuesta.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, con las obligaciones habituales de atribución y conservación del aviso de licencia.
- Repositorio con muy pocas descargas (31) y sin likes: no hay evidencia de uso en producción ni validación externa más allá de las métricas reportadas por el autor.
- No se documentan hiperparámetros de entrenamiento, número de épocas ni detalles del proceso de destilación, lo que dificulta la reproducibilidad exacta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pipidepulus/distilbert-base-uncased-finetuned-squad-d5716d28
- Paper de DistilBERT: https://arxiv.org/pdf/1910.01108.pdf
- Paper en arXiv (referencia): https://arxiv.org/abs/1910.01108
- Dataset SQuAD: https://huggingface.co/datasets/squad
- Modelo profesor: https://huggingface.co/lewtun/bert-base-uncased-finetuned-squad-v1
- Modelo estudiante base: https://huggingface.co/distilbert-base-uncased
