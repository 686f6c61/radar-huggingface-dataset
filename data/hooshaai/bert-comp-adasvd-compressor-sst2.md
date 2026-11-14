# Hooshaai/bert-comp-adasvd-compressor-sst2

## Resumen

`bert-comp-adasvd-compressor-sst2` es un checkpoint de BERT-Base comprimido mediante la técnica AdaSVD (Adaptive SVD con blanqueamiento de activaciones, ALS ponderado bilateral y absorción de sesgo por desplazamiento de media) e incluido en el zoo de modelos comprimidos NeuralOps. Parte de `google-bert/bert-base-uncased` (109,48 M de parámetros, 12 capas, dimensión oculta 768) afinado previamente sobre GLUE SST-2, y se publica como ejemplo del compresor `adasvd_compressor` en el rango de truncamiento `k=32`.

El modelo resultante tiene 102,40 M de parámetros (-6,47 %), lo que supone una ratio de compresión física de 1,069x. Sobre la partición de validación de SST-2 (872 muestras) alcanza un 88,88 % de accuracy en modo zero-shot, frente al 91,63 % del profesor original, es decir, una pérdida de 2,75 puntos porcentuales. No se aplicó curación LoRA en este checkpoint concreto, aunque el autor documenta resultados con y sin LoRA para otros rangos (`k=256, 128, 64`).

Es relevante como referencia práctica de compresión de modelos transformer para clasificación de texto: permite evaluar el compromiso entre ratio de compresión y precisión downstream en un modelo pequeño, desplegable en CPU o GPU de consumo, y sirve como caso de estudio reproducible del pipeline NeuralOps.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base), 12 capas, dimensión oculta 768 |
| Parametros totales | 102.401.663 (comprimido); 109.483.778 en el modelo base |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT admite 512 tokens, no confirmado en la ficha del autor) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado) + `config.json`, `compression_summary.json`, assets del tokenizer |

## Arquitectura y entrenamiento

El modelo es un BERT-Base estándar (encoder transformer bidireccional de 12 capas y 768 dimensiones ocultas) que se ha comprimido físicamente mediante `AdaSVDCompressor`, un operador de compresión por descomposición en valores singulares adaptativa. La técnica combina tres componentes: blanqueamiento de activaciones para ponderar la importancia de las direcciones singulares según su efecto real sobre las activaciones, ALS ponderado bilateral para refinar los factores de baja dimensión, y absorción de sesgo por desplazamiento de media para preservar la estadística de las activaciones tras el truncamiento. El checkpoint publicado corresponde al rango `k=32`, con ratio de compresión 1,069x y reducción del 6,47 % de parámetros.

El modelo base se afinó originalmente sobre GLUE SST-2 (clasificación binaria de sentimiento, inglés). Según la model card, la evaluación se realizó sobre la partición de validación de SST-2 con 872 muestras en una NVIDIA GeForce RTX 3090 (24 GB). El autor documenta además una política de curación LoRA (`r=8`, 50 pasos, `lr=2e-4`, presupuesto de 45 s) que se activa cuando la compresión zero-shot degrada más de 2,0 puntos con una reducción superior a 1,10x; en el rango `k=32` publicado no se aplicó dicha curación. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset más allá de SST-2, ni si hubo RLHF/DPO (no aplicable en un clasificador).

## Capacidades

- Clasificación binaria de sentimiento en inglés (positivo/negativo) sobre textos de opinión, con la cabeza de clasificación de BERT-Base (`num_labels=2`).
- Inferencia sobre texto corto y medio en inglés; hereda el tokenizador `bert-base-uncased` (vocabulario WordPiece, minúsculas).
- No soporta tool calling ni function calling: es un clasificador, no un modelo generativo.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés (el modelo base es `uncased` en inglés).
- No dispone de modo thinking, visión ni audio.
- Puede servir como extractor de representaciones intermedias si se reconstruye la topología comprimida y se accede a los estados ocultos, aunque no es su uso documentado.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: clasificación binaria directa de opiniones en inglés con un modelo de 102 M de parámetros, adecuado para procesar lotes grandes en CPU o GPU de gama baja.
- Moderación de comentarios en foros y redes: filtrado rápido de toxicidad o polaridad negativa como primera etapa de un pipeline, usando el modelo comprimido para reducir coste de inferencia.
- Enrutamiento de tickets de soporte: clasificación de sentimiento para priorizar quejas negativas antes de pasarlas a un agente humano, con latencia baja gracias al tamaño reducido.
- Investigación en compresión de modelos: caso de estudio reproducible para comparar AdaSVD frente a otras técnicas (magnitude pruning, SVD clásico, destilación) sobre una tarea estándar como SST-2.
- Evaluación de pipelines NeuralOps: validación de la API `load_surgeried_model` y del flujo de reconstrucción de topologías comprimidas en entornos de CI.
- Prototipado educativo: ejemplo didáctico de cómo un transformer pequeño puede comprimirse con pérdida mínima de precisión y desplegarse en hardware modesto.
- Benchmark interno de clasificadores: referencia de precisión (88,88 %) frente a la que medir modelos propios de sentimiento en inglés.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y en la model card (no verificados de forma independiente):

| Modelo / variante | Dataset | Accuracy | Parámetros | Ratio compresión |
|---|---|---:|---:|---:|
| BERT-Base profesor (referencia) | GLUE SST-2 validation | 91,63 % | 109.483.778 | 1,00x |
| **adasvd_compressor k=32 (publicado)** | GLUE SST-2 validation | **88,88 %** | 102.401.663 | 1,07x |
| adasvd_compressor k=256 (zero-shot) | GLUE SST-2 validation | 88,99 % | 98.978.371 | 1,11x |
| adasvd_compressor k=256 (LoRA) | GLUE SST-2 validation | 82,68 % | 98.978.371 | 1,11x |
| adasvd_compressor k=128 (zero-shot) | GLUE SST-2 validation | 86,70 % | 90.074.530 | 1,22x |
| adasvd_compressor k=128 (LoRA) | GLUE SST-2 validation | 84,06 % | 90.074.530 | 1,22x |
| adasvd_compressor k=64 (zero-shot) | GLUE SST-2 validation | 81,31 % | 86.120.982 | 1,27x |
| adasvd_compressor k=64 (LoRA) | GLUE SST-2 validation | 83,03 % | 86.120.982 | 1,27x |

Evaluación realizada sobre 872 muestras de la partición de validación de SST-2 en una RTX 3090. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,4-0,8 GB en fp32 para los 102,4 M de parámetros; menos de 0,5 GB en fp16. Cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090, A100, H100). El autor validó en RTX 3090 (24 GB), aunque el modelo no la requiere.
- Cabe en GPU de consumo: sí, en todas las GPU modernas e incluso en CPU para inferencia por lotes.
- Opciones de despliegue: el flujo documentado usa `neuralops` para reconstruir la topología comprimida y cargar el state dict; también es posible exportar a ONNX o TorchScript tras la reconstrucción. No se documenta soporte directo en vLLM, llama.cpp, Ollama o TGI (son herramientas orientadas a modelos generativos).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| **bert-comp-adasvd-compressor-sst2 (k=32)** | 102,4 M | no disponible | 88,88 % | MIT | Hugging Face (NeuralOps) |
| google-bert/bert-base-uncased (profesor) | 109,5 M | 512 tokens | 91,63 % | Apache 2.0 | Hugging Face |
| DistilBERT-base-uncased | 66 M | 512 tokens | ~91 % (referencia pública) | Apache 2.0 | Hugging Face |
| RoBERTa-base | 125 M | 512 tokens | ~94-95 % (referencia pública) | MIT | Hugging Face |

Nota: los valores de DistilBERT y RoBERTa son referencias públicas habituales en GLUE SST-2 y no se han verificado en esta ficha; se incluyen solo como orientación. El modelo comprimido no supera al profesor en precisión, pero reduce ligeramente el tamaño y sirve como demostración del compresor.

## Limitaciones y advertencias

- Pérdida de precisión de 2,75 puntos porcentuales frente al profesor (88,88 % vs 91,63 %), lo que puede ser inaceptable en aplicaciones sensibles al sentimiento.
- Solo inglés: no admite otros idiomas sin reentrenamiento.
- Es un clasificador binario de sentimiento; no genera texto, no razona y no soporta tool calling.
- Riesgo de alucinación no aplicable en sentido estricto, pero sí de clasificaciones erróneas en textos ambiguos, sarcasmo o dominios alejados de SST-2.
- Licencia MIT: permite uso comercial, pero conviene revisar la licencia del modelo base (Apache 2.0) y del dataset (GLUE SST-2) para cumplimiento.
- El checkpoint requiere reconstruir la topología comprimida con `neuralops` antes de cargar los pesos; no es un `from_pretrained` estándar de Transformers.
- La model card advierte que el repo referenciado en el código (`tahamajs/...`) difiere del ID real (`Hooshaai/...`), lo que puede provocar errores en el quick start.
- El autor no documenta sesgos específicos; al heredar de BERT-Base, arrastra sesgos de género, raza y dominio presentes en los corpus de preentrenamiento.
- Resultados de benchmarks no verificados de forma independiente (`verified: false` en el model-index).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-adasvd-compressor-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor AdaSVD: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/svd/adasvd_compressor.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
