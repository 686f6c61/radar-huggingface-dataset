# Hooshaai/bert-comp-huffman-coder-sst2

## Resumen

`bert-comp-huffman-coder-sst2` es un checkpoint de `google-bert/bert-base-uncased` afinado para clasificación de sentimiento en GLUE SST-2 y posteriormente procesado con el motor de compresión `huffman_coder` (`HuffmanCompressor`) de la librería NeuralOps. El modelo lo publica el usuario Hooshaai dentro del denominado "NeuralOps Compressed & LoRA-Healed Model Zoo", un conjunto de experimentos que aplican técnicas de compresión y recuperación mediante LoRA sobre arquitecturas transformer estándar. La relevancia del artefacto es más metodológica que de rendimiento: sirve como ejemplo reproducible de un pipeline de compresión con evaluación Pareto multi-rango.

Arquitectónicamente es un transformer BERT-base encoder-only, con 12 capas, dimensión oculta de 768 y 109.483.778 parámetros. La longitud de contexto no se declara explícitamente en la información disponible, aunque al derivar de `bert-base-uncased` el límite habitual es de 512 tokens. El modelo está pensado exclusivamente para inglés y para la tarea de clasificación binaria de sentimiento.

El dato llamativo es que, pese al nombre, la compresión aplicada es nula: el ratio físico es 1.00x y la reducción de parámetros es del 0,00% en todos los rangos evaluados (k=256, 128, 64 y 32). El checkpoint empaquetado corresponde a k=32 y alcanza un 91,51% de accuracy en la validación de SST-2, frente al 91,63% del profesor original, es decir, una paridad de -0,12 puntos. Es, por tanto, un artefacto útil para estudiar el comportamiento del compresor, no una alternativa práctica al BERT-base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (BERT-base) |
| Parametros totales | 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion (heredada de bert-base-uncased: 512 tokens) |
| Tipos de cuantizacion | compresion via `huffman_coder` (`HuffmanCompressor`); no se detallan otros formatos |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado), `config.json`, `compression_summary.json`, assets de tokenizer de bert-base-uncased |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased`, un transformer encoder-only con 12 capas, 768 dimensiones ocultas y 109.483.778 parámetros, preentrenado de forma estándar y afinado posteriormente sobre GLUE SST-2 (clasificación binaria de sentimiento, 2 etiquetas). Sobre ese checkpoint se aplica el compresor `huffman_coder` de NeuralOps, que se describe como un "model-wide entropy compression profiler and simulator": perfilado y simulación de compresión por entropía a nivel de modelo, no una reescritura física de los pesos.

La evaluación se realiza con un esquema Pareto multi-rango (k=256, 128, 64 y 32) sobre la partición de validación de SST-2 (872 muestras), ejecutada en una NVIDIA GeForce RTX 3090 de 24 GB. La política de recuperación indica que, si la compresión zero-shot degrada la accuracy más de 2,0 puntos con un ratio superior a 1,10x, se aplica un "healing" con LoRA de rango r=8 durante 50 pasos con lr=2e-4 y un presupuesto de 45 segundos. En este caso, según la model card, no se aplicó recuperación LoRA (`LoRA Recovery Applied: False`) y el ratio físico se mantuvo en 1.00x en todos los rangos, por lo que el checkpoint empaquetado es funcionalmente equivalente al modelo base afinado. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset más allá de GLUE SST-2, ni detalles sobre RLHF o DPO (no aplicables a un encoder de clasificación).

## Capacidades

- Clasificación binaria de sentimiento en inglés (positivo/negativo) sobre textos de entrada.
- Inferencia estándar de BERT-base: representaciones contextuales de tokens y secuencia, reutilizables para otras tareas de clasificación si se reajustan las cabezas.
- Compatible con el pipeline `text-classification` de Hugging Face.
- Carga mediante la API universal de NeuralOps (`load_surgeried_model`) o reconstrucción manual con `compress_model` y `load_state_dict`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking"; es un encoder de clasificación, no un modelo generativo.
- Capacidad multilingüe limitada al inglés (vocabulario `bert-base-uncased`).

## Casos de uso

- Análisis de sentimiento en reseñas de producto: el modelo clasifica reseñas en inglés en positivas o negativas con un 91,51% de accuracy en SST-2, adecuado para monitorización de opiniones a gran escala con bajo coste de inferencia.
- Moderación de comentarios en foros y redes: filtrado automático de mensajes con carga negativa para revisión humana, aprovechando la latencia baja de un encoder de 110M de parámetros.
- Enrutamiento de tickets de soporte: clasificación rápida de la tonalidad de un ticket entrante para priorizar casos con sentimiento negativo y escalarlos antes.
- Investigación en compresión de modelos: el artefacto sirve como caso de estudio reproducible del pipeline NeuralOps, con telemetría en `compression_summary.json` para comparar rangos k y medir la paridad frente al profesor.
- Evaluación comparativa de técnicas de cuantización: al mantener el 91,51% de accuracy con ratio 1.00x, permite contrastar el comportamiento del `huffman_coder` frente a otros compresores del zoo en igualdad de condiciones.
- Prototipado de pipelines de clasificación en entornos con GPU de consumo: al caber holgadamente en una RTX 3090 (y en GPUs de 8 GB en fp16), es viable para pruebas locales y despliegues pequeños.
- Docencia y demostraciones de fine-tuning y evaluación en GLUE: el modelo y su model card documentan el flujo completo desde el checkpoint base hasta la evaluación en la partición de validación.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index (no verificados de forma independiente):

| Benchmark | Metrica | Resultado |
|---|---|---|
| GLUE SST-2 (validation) | Accuracy | 91,51% |

Comparativa interna del pipeline NeuralOps según la model card:

| Rango (k) | Ratio fisico | Parametros comprimidos (reduccion) | Accuracy zero-shot | Accuracy con healing | Paridad vs profesor (91,63%) |
|---|---|---|---|---|---|
| 256 | 1.00x | 109.483.778 (-0,0%) | 91,51% | 91,51% | -0,12% |
| 128 | 1.00x | 109.483.778 (-0,0%) | 91,51% | 91,51% | -0,12% |
| 64 | 1.00x | 109.483.778 (-0,0%) | 91,51% | 91,51% | -0,12% |
| 32 (empaquetado) | 1.00x | 109.483.778 (-0,0%) | 91,51% | 91,51% | -0,12% |

No se han publicado en la informacion disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros), lo cual es esperable al tratarse de un encoder de clasificación.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,4-0,5 GB en fp32 para los pesos (208,9 MB de pesos empaquetados más overhead de activaciones y tokenizer); en fp16 alrededor de 0,2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el autor evaluó en una NVIDIA GeForce RTX 3090 (24 GB), pero es sobredimensionada para este modelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna (RTX 3060, RTX 4060, GTX 1660, etc.) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch nativo con `transformers`, la API de NeuralOps (`load_surgeried_model`), y potencialmente ONNX Runtime o TorchScript tras exportación; no se documenta soporte directo para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos por lote en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bert-comp-huffman-coder-sst2 | 109,5M | no disponible (512 heredado) | 91,51% | MIT | Hugging Face (NeuralOps) |
| google-bert/bert-base-uncased (profesor) | 109,5M | 512 | 91,63% | Apache 2.0 | Hugging Face |
| DistilBERT-base-uncased-finetuned-sst-2 | ~66M | 512 | no disponible en la informacion | Apache 2.0 | Hugging Face |
| RoBERTa-base fine-tuned en SST-2 | ~125M | 512 | no disponible en la informacion | MIT | Hugging Face |

La comparación directa más relevante es con el propio profesor: la diferencia de 0,12 puntos de accuracy no compensa la ausencia de compresión real, por lo que el valor del artefacto es experimental. Frente a DistilBERT o RoBERTa-base no se dispone de cifras verificadas en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- La compresión anunciada es efectivamente nula (ratio 1.00x, reducción del 0,00%): el checkpoint no aporta ahorro de memoria ni de cómputo frente a `bert-base-uncased`.
- El modelo solo clasifica sentimiento binario en inglés; no es un modelo generativo y no admite instrucciones, tool calling ni razonamiento.
- Riesgo de alucinación bajo en la tarea de clasificación, pero el modelo puede producir predicciones erróneas en dominios alejados de SST-2 (por ejemplo, sarcasmo, jerga o textos muy técnicos), ya que el fine-tuning se limita a reseñas de películas.
- Sesgos heredados del corpus de preentrenamiento de BERT (texto web en inglés) y de la distribución de SST-2; no se documenta ninguna mitigación.
- Limitación de contexto: aunque no se declara explícitamente, al derivar de BERT-base el límite práctico es de 512 tokens; textos más largos requieren truncamiento.
- La licencia MIT del repositorio se acompaña de un enlace a la licencia de NeuralOps en GitHub; conviene verificar la compatibilidad con el uso comercial previsto, especialmente por la dependencia de la librería NeuralOps para reconstruir el modelo.
- El procedimiento de carga requiere ejecutar `compress_model` antes de `load_state_dict`; cargar el checkpoint directamente con `transformers` sin ese paso puede fallar o producir pesos inconsistentes.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false`).
- El snippet de la model card referencia el repo `tahamajs/bert-comp-huffman-coder-sst2`, distinto del ID real `Hooshaai/bert-comp-huffman-coder-sst2`; hay que ajustar el identificador al cargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-huffman-coder-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/quantization/huffman_coder.py
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
