# Hooshaai/bert-nexus-sst2

## Resumen

`Hooshaai/bert-nexus-sst2` es un checkpoint de clasificación de texto derivado de `google-bert/bert-base-uncased` en el que se han sustituido los bloques de atención softmax cuadrática de las 12 capas del transformer por el mecanismo `nexus`, una atención subcuadrática (complejidad efectiva O(N) u O(N log N)) implementada en la librería NeuralOps de Taha Majlesi. El modelo se ha afinado y destilado sobre la tarea SST-2 del benchmark GLUE (clasificación binaria de sentimiento en inglés) mediante un protocolo de destilación de representaciones en caché que no requiere mantener el modelo profesor en VRAM durante el entrenamiento.

El interés del checkpoint es fundamentalmente metodológico y de investigación: demuestra un flujo completo de sustitución modular de atención, serialización solo de los pesos de atención y cabeza de clasificación (~55 MB en FP16) y reconstrucción en tiempo de carga sobre los pesos congelados de BERT-Base. No obstante, el rendimiento empírico es muy limitado: alcanza un 50,11 % de accuracy en la partición de validación de SST-2, frente al 91,63 % del profesor BERT-Base, lo que sitúa al modelo prácticamente en el nivel de un clasificador aleatorio binario.

Se distribuye con licencia MIT, soporta únicamente inglés y requiere `trust_remote_code=True` para cargarse con Transformers, ya que depende de código remoto de NeuralOps. Por su tamaño (~110 M parámetros base) y su huella de pesos, es un artefacto ligero y fácil de inspeccionar, pero no está pensado para uso en producción real de análisis de sentimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base con atención sustituida por mecanismo `nexus` (subcuadrática, O(N) u O(N log N)) en las 12 capas |
| Parametros totales | ~110 M (BERT-Base) más cabeza de clasificación; solo se serializan pesos de atención y cabeza (~55 MB en FP16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de BERT-Base, típicamente 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | FP16 en los pesos de atención publicados; no se documentan otras cuantizaciones |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, FP16, ~55 MB) con código remoto `modeling_neuralops_bert.py` |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` (12 capas, ~110 M parámetros) y reemplaza en todas las capas el bloque de atención multi-cabeza estándar por el mecanismo `nexus` de NeuralOps, que reduce la complejidad operativa de O(N²) a O(N) u O(N log N). Los pesos base de BERT permanecen congelados y se inicializan en tiempo de carga desde `bert-base-uncased`; el repositorio solo almacena los parámetros de atención destilados y la cabeza de clasificación, lo que explica la huella de ~55 MB.

El entrenamiento se realizó con el protocolo NeuralOps Cached Representation Distillation, que cachea offline las representaciones del profesor para evitar asignar VRAM al modelo docente. Se ejecutó en una NVIDIA GeForce RTX 3090 (24 GB) del clúster HPC de Sharif, con 180 pasos de optimización en dos etapas (alineamiento de subespacio oculto y luego KL sobre logits más entropía cruzada de tarea), una duración de 47,9 s, un throughput efectivo de 30.798,1 tokens/s y un pico de VRAM de 23.021 MB. El conjunto de evaluación es la partición de validación de SST-2 (872 muestras binarias).

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) sobre texto en inglés, con salida de logits de dos clases.
- Sustitución modular de atención subcuadrática, útil para estudiar el impacto de mecanismos alternativos en tareas de comprensión.
- Carga mediante `AutoModelForSequenceClassification` con `trust_remote_code=True` y mediante la API `neuralops.hub.bert_zoo.load_pretrained_bert` / `load_surgeried_model`.
- Serialización de solo pesos de atención y cabeza de tarea, lo que permite reconstruir el modelo sobre la base congelada.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe: no disponible; solo inglés.
- Capacidad de generación de texto: no disponible (es un modelo de clasificación, no causal).

## Casos de uso

- Investigación sobre atención subcuadrática: permite reproducir el pipeline de sustitución de atención de NeuralOps y medir la degradación frente al profesor BERT-Base en SST-2, con un coste de cómputo mínimo (47,9 s de entrenamiento en una RTX 3090).
- Estudio de destilación con profesor offline: sirve como ejemplo de referencia del protocolo Cached Representation Distillation, donde el profesor no ocupa VRAM durante el ajuste.
- Pruebas de integración de código remoto en Transformers: útil para validar flujos de `trust_remote_code=True` y serialización modular de pesos en pipelines internos.
- Benchmarking de eficiencia de atención: al ser un checkpoint ligero (~55 MB), se puede desplegar en entornos con restricciones de almacenamiento para comparar latencia y throughput frente a BERT estándar.
- Docencia y experimentación: ejemplo didáctico de cómo sustituir bloques de atención en un transformer preentrenado sin reentrenar desde cero.
- No recomendado para análisis de sentimiento en producción: con un 50,11 % de accuracy en SST-2, su utilidad práctica es prácticamente nula frente a alternativas afinadas estándar.

## Benchmarks y rendimiento

Evaluación sobre la partición de validación de GLUE SST-2 (872 muestras binarias), según la model card:

| Metrica | Profesor (`bert-base-uncased`) | Estudiante `nexus` pre-KD | Modelo destilado post-KD |
|---|---:|---:|---:|
| Accuracy SST-2 | 91,63 % | 48,97 % | 50,11 % |
| Entropia cruzada de validacion | 0,2428 | no calibrada | 0,6985 |

Delta de accuracy tras la destilación: +1,15 puntos porcentuales respecto al estudiante pre-KD, pero 41,52 puntos por debajo del profesor. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio descarga ~55 MB de pesos de atención, pero la carga completa requiere inicializar los ~110 M parámetros de BERT-Base; en FP32 esto supone del orden de 400-450 MB de pesos, más activaciones. Cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM; el entrenamiento documentado se realizó en una NVIDIA GeForce RTX 3090 (24 GB) con un pico de 23.021 MB, aunque ese pico corresponde al proceso de destilación, no a la inferencia.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también en CPU para inferencia puntual.
- Opciones de despliegue: Transformers con `trust_remote_code=True`; API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras de inferencia; solo se documenta el throughput de entrenamiento (30.798,1 tokens/s) y la duración total del ajuste (47,9 s, 180 pasos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `Hooshaai/bert-nexus-sst2` | ~110 M (solo atención ~55 MB serializados) | no disponible | 50,11 % | MIT | Hugging Face, requiere código remoto |
| `google-bert/bert-base-uncased` (profesor) | ~110 M | 512 | 91,63 % (referencia en la model card) | Apache 2.0 | Hugging Face, Transformers estándar |
| BERT-Base afinado estándar en SST-2 | ~110 M | 512 | no disponible en esta ficha | Apache 2.0 | Hugging Face |

La comparativa se limita al profesor documentado en la propia model card; no se dispone de datos de otros modelos de atención subcuadrática comparables en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento muy bajo: 50,11 % de accuracy en SST-2, prácticamente equivalente a un clasificador aleatorio binario; no es apto para producción.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código remoto del autor; conviene auditar `modeling_neuralops_bert.py` antes de usarlo.
- Solo inglés; no se documenta soporte multilingüe.
- Longitud de contexto no especificada en la model card; se asume la de BERT-Base (512 tokens) pero no está confirmado.
- Sesgos heredados de `bert-base-uncased` y del corpus de entrenamiento original; no se documentan evaluaciones de sesgo.
- Riesgo de alucinación no aplicable directamente (es un clasificador), pero la calibración es dudosa: la entropía cruzada post-KD (0,6985) es alta frente al profesor (0,2428).
- Licencia MIT permite uso comercial, pero el bajo rendimiento desaconseja cualquier despliegue real.
- El autor del repositorio en Hugging Face (`Hooshaai`) y el autor citado en la model card (`tahamajs`) no coinciden; conviene verificar la procedencia antes de reutilizarlo.
- La model card incluye emojis y afirmaciones de marketing; los datos empíricos deben interpretarse con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-nexus-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia MIT de NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Benchmark GLUE: https://gluebenchmark.com/
- Dataset SST-2: https://huggingface.co/datasets/glue
