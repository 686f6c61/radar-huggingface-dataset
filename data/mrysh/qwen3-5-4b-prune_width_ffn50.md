# mrysh/qwen3.5-4b-prune_width_ffn50

## Resumen

qwen3.5-4b-prune_width_ffn50 es una versión podada por anchura del modelo Qwen/Qwen3.5-4B, publicada por el usuario mrysh como parte de un benchmark de poda que compara cuatro modelos base con ocho variantes de pruning frente a alternativas cuantizadas. La poda se ha aplicado exclusivamente sobre la parte lingüística: la dimensión de las capas FFN se reduce de 9216 a 4608 (un 50 % solicitado), manteniendo intacto el número de capas del transformer. El checkpoint resultante conserva 3.073.289.216 parámetros (frente a los aproximadamente 4B del modelo original), lo que supone una reducción del 26,9 % del total.

El modelo se ha generado con NVIDIA ModelOpt 0.46.0rc1 mediante la técnica Minitron de poda por anchura, midiendo la importancia de las neuronas sobre un conjunto de calibración de 512 muestras mixtas. No se ha realizado destilación ni fine-tuning posterior a la poda, por lo que la calidad debe evaluarse empíricamente: el propio autor advierte de una caída de rendimiento respecto al modelo base y el benchmark existe precisamente para cuantificarla.

Es relevante ahora porque documenta de forma transparente el compromiso entre reducción de parámetros y degradación funcional en tareas concretas (BFCL para tool calling, MedQA para conocimiento médico y un conjunto de evaluación de sesgo en contratación), ejecutadas con vLLM y con el modo thinking desactivado. Además, al eliminar la torre de visión y la cabeza de predicción multi-token de Qwen3.5, el resultado es un modelo exclusivamente de texto con licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (qwen3_5_text) con poda por anchura en FFN |
| Parámetros totales | 3.073.289.216 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible en esta ficha; el benchmark compara contra checkpoints cuantizados de Qwen |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Dimensión FFN | 4608 (reducida desde 9216) |
| Número de capas | sin cambios respecto al base |
| Tamaño en disco | 6,167 GB (repo de 6,2 GB) |

## Arquitectura y entrenamiento

Se parte de Qwen/Qwen3.5-4B, un transformer decoder-only de la familia Qwen3.5. La intervención consiste en una poda estructurada por anchura (width pruning) sobre las capas feed-forward: cada FFN pasa de 9216 a 4608 unidades intermedias, es decir, se solicita una reducción del 50 % que se traduce en una eliminación del 26,9 % de los parámetros totales del checkpoint. La selección de neuronas a eliminar se basa en una medida de importancia calculada sobre un conjunto de calibración de 512 muestras mixtas, siguiendo el flujo Minitron de NVIDIA ModelOpt 0.46.0rc1.

No hay entrenamiento posterior: ni destilación, ni fine-tuning, ni recuperación de rendimiento tras la poda. Tampoco se conserva la totalidad del modelo original: la torre de visión y la cabeza de predicción multi-token de Qwen3.5 se han eliminado, de modo que el artefacto es estrictamente de texto. El número de capas y el resto de la estructura del backbone permanecen sin cambios; solo se modifica la anchura de las FFN.

## Capacidades

- Generación de texto y razonamiento en modo texto, heredados del modelo base, con la degradación esperable tras una poda sin recuperación.
- Tool calling y function calling: es una de las tres áreas evaluadas en el benchmark del autor (BFCL), lo que indica que el modelo conserva la interfaz de llamadas a herramientas del base.
- Razonamiento multi-paso y uso como agente: no se documenta explícitamente; el benchmark se ejecuta con el modo thinking desactivado, por lo que el rendimiento en modo razonamiento extendido no está caracterizado.
- Conocimiento de dominio médico: evaluado mediante MedQA en el benchmark.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión: eliminada junto con la torre visual; el modelo no procesa imágenes.
- Predicción multi-token: eliminada del checkpoint.

## Casos de uso

- Evaluación comparativa de técnicas de poda: el modelo está diseñado como una de las 32 variantes (4 modelos × 8 variantes) del benchmark del autor, y sirve para medir la caída de calidad de la poda por anchura frente a la cuantización en las mismas tareas.
- Servicio de tool calling con presupuesto de memoria reducido: al conservar la interfaz de function calling y ocupar 6,2 GB en safetensors, puede desplegarse en vLLM para agentes que invocan APIs, aceptando la pérdida de precisión que mide BFCL.
- Investigación sobre pruning estructurado: útil como punto de comparación reproducible (misma calibración de 512 muestras, misma herramienta ModelOpt) para estudiar el efecto de reducir la FFN al 50 % en un modelo de 4B.
- Auditoría de sesgo en selección de personal: el benchmark incluye una evaluación de sesgo en contratación, por lo que el checkpoint puede reutilizarse para estudiar cómo afecta la poda a las respuestas en escenarios de cribado de candidatos.
- Prototipado de asistentes clínicos de bajo coste: MedQA forma parte de la batería de evaluación, lo que permite valorar si la poda es aceptable en tareas de preguntas médicas antes de invertir en un modelo mayor.
- Docencia y experimentación con modelos pequeños: con 3,07B parámetros y licencia Apache 2.0, es adecuado para prácticas de despliegue con vLLM y para analizar el equilibrio entre tamaño y calidad sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. El autor indica únicamente que el modelo se evalúa en BFCL, un conjunto de sesgo en contratación y MedQA con vLLM y thinking desactivado, y que el benchmark compara las variantes entre sí y con cuantizaciones, pero no se proporcionan puntuaciones concretas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 6,2 GB solo para pesos, más overhead de KV cache y activaciones; en la práctica, entre 8 y 10 GB para contextos moderados.
- VRAM estimada en FP8/INT8: alrededor de 3,1 GB de pesos, con margen para KV cache en GPUs de 8 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 1,6 GB de pesos, desplegable en GPUs consumer de 4-6 GB.
- GPU recomendadas: A100 o H100 para evaluaciones por lotes y throughput alto; RTX 4090, RTX 3090 o L40S para servicio en BF16; RTX 4060 Ti 16 GB o similares para cuantizaciones de 8 bits.
- Cabe en GPU consumer: sí, en BF16 en tarjetas de 12 GB o más y en cuantizaciones de 4-8 bits en tarjetas de 6-8 GB.
- Opciones de despliegue: vLLM es el runtime utilizado en el benchmark del autor; al ser safetensors de un transformer estándar, también es compatible con TGI y, tras conversión, con llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| qwen3.5-4b-prune_width_ffn50 | 3,07B | no disponible | Apache 2.0 | Poda por anchura FFN 50 %, sin destilación, solo texto |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | Apache 2.0 | Modelo original con visión y predicción multi-token |
| Variantes cuantizadas de Qwen del mismo benchmark | no disponible | no disponible | Apache 2.0 | Alternativa de compresión evaluada en BFCL, sesgo y MedQA |
| Otras variantes de poda del benchmark (7 restantes) | no disponible | no disponible | Apache 2.0 | Misma metodología, distintos niveles o ejes de poda |

La comparación cuantitativa de rendimiento entre estas alternativas no está disponible en la información proporcionada; el benchmark del autor es precisamente el que la produciría.

## Limitaciones y advertencias

- Caída de calidad esperada: no se aplicó destilación ni fine-tuning tras la poda, y el autor lo advierte explícitamente.
- Modelo solo de texto: la torre de visión y la cabeza de predicción multi-token han sido eliminadas, por lo que no puede procesar imágenes ni aprovechar esas capacidades del base.
- Contexto e idiomas no documentados: no se especifica la longitud de contexto efectiva ni la cobertura lingüística del checkpoint podado.
- Riesgo de alucinación: inherente al modelo base y potencialmente agravado por la pérdida de capacidad; no hay evaluación específica de factualidad en la información disponible.
- Sesgos: el benchmark incluye una prueba de sesgo en contratación, lo que sugiere que el autor considera relevante medir este aspecto; no se publican resultados.
- Uso comercial: la licencia Apache 2.0 lo permite, pero conviene verificar las condiciones del modelo base Qwen3.5-4B, a las que el autor remite.
- Madurez: cero descargas y cero likes en el momento de la consulta; es un artefacto de investigación, no un modelo validado para producción.
- Evaluación limitada: el benchmark se ejecuta con thinking desactivado, de modo que el comportamiento en modo razonamiento no está caracterizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrysh/qwen3.5-4b-prune_width_ffn50
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- NVIDIA ModelOpt (herramienta de poda): https://github.com/NVIDIA/TensorRT-Model-Optimizer
- vLLM (runtime de evaluación): https://github.com/vllm-project/vllm
