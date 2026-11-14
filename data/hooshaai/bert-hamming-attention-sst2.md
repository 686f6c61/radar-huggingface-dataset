# Hooshaai/bert-hamming-attention-sst2

## Resumen

`bert-hamming-attention-sst2` es un checkpoint de BERT-Base (110M parámetros) publicado por el usuario Hooshaai en el que se han sustituido los bloques de atención softmax cuadrática de las 12 capas del transformer por el mecanismo `hamming_attention` de la librería NeuralOps. El objetivo es demostrar que es posible reducir la complejidad operativa de la atención de O(N²) a O(N) u O(N log N) manteniendo una precisión competitiva en tareas de clasificación de texto, en este caso la tarea SST-2 del benchmark GLUE.

El modelo se ha destilado desde el `bert-base-uncased` original mediante el protocolo de destilación de representaciones en caché de NeuralOps, que evita asignar VRAM al modelo profesor durante el entrenamiento. El resultado es un checkpoint que alcanza un 89,33 % de accuracy en el split de validación de SST-2, frente al 91,63 % del profesor original, con una pérdida de 2,3 puntos porcentuales.

Es relevante porque propone una vía práctica para sustituir atención cuadrática por alternativas subcuadráticas en modelos BERT ya entrenados, con un coste de entrenamiento muy bajo (49,4 segundos en una RTX 3090) y un formato de pesos modular que solo almacena los parámetros de atención y la cabeza de clasificación (~55 MB), reutilizando los pesos base congelados de `bert-base-uncased`. La licencia es MIT y el modelo está pensado exclusivamente para inglés y clasificación binaria de sentimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer BERT-Base con atención `hamming_attention` subcuadrática en las 12 capas |
| Parámetros totales | 110M (BERT-Base); el repo almacena solo pesos de atención y cabeza de clasificación (~55 MB en FP16) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de BERT-Base, típicamente 512 tokens, no confirmado en la model card) |
| Tipos de cuantización | No disponible (pesos serializados en FP16) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16, attention-only); requiere código remoto `modeling_neuralops_bert.py` |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` (12 capas, 110M parámetros) y reemplaza el mecanismo de multi-head attention softmax estándar por `hamming_attention`, una atención subcuadrática con complejidad efectiva O(N) u O(N log N). Los pesos base de BERT permanecen congelados y se inicializan desde el checkpoint original de Google, mientras que los parámetros de atención modificados y la cabeza de clasificación se entrenan y serializan por separado en `attention_weights.safetensors` (FP16, ~55 MB). El código remoto (`modeling_neuralops_bert.py`) reconstruye el modelo completo en tiempo de carga.

El entrenamiento sigue el NeuralOps Cached Representation Distillation Protocol, un esquema en dos etapas: primero una alineación de subespacio oculto (Stage 1) y después una combinación de KL sobre logits y entropía cruzada de tarea (Stage 2). Se ejecutó en una NVIDIA GeForce RTX 3090 (24 GB) durante 49,4 segundos, con 215 pasos de optimización, un throughput efectivo de 35.668 tokens/s y un pico de VRAM de 9.193 MB. La destilación se realizó sobre el split de entrenamiento de SST-2 (GLUE). No se especifica el número total de tokens de entrenamiento ni la composición completa del dataset más allá de GLUE/SST-2.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés, específicamente afinada para SST-2.
- Razonamiento sobre secuencias de texto cortas y medianas heredado de BERT-Base.
- Atención subcuadrática que reduce el coste computacional en secuencias largas respecto a la atención softmax estándar.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (solo inglés).
- No dispone de modo thinking, visión ni audio.
- No es un modelo generativo: la cabeza es de clasificación (`AutoModelForSequenceClassification`).

## Casos de uso

- Análisis de sentimiento en reseñas de producto: el modelo clasifica textos cortos en positivo/negativo con un 89,33 % de accuracy en SST-2, adecuado para pipelines de moderación o analítica de opiniones en inglés.
- Filtrado de comentarios en plataformas: al ser un modelo de 110M parámetros con atención subcuadrática, puede desplegarse en CPU o GPU de gama baja para clasificar grandes volúmenes de comentarios en tiempo casi real.
- Investigación sobre atención eficiente: sirve como referencia reproducible para comparar `hamming_attention` frente a atención softmax en tareas GLUE, con pesos de atención aislados y un protocolo de destilación documentado.
- Prototipado rápido de clasificadores de texto: la carga en una línea mediante `load_surgeried_model` o `AutoModelForSequenceClassification` con `trust_remote_code=True` permite integrarlo en notebooks y scripts de experimentación sin reentrenar BERT desde cero.
- Evaluación de destilación con bajo presupuesto de VRAM: el protocolo de representaciones en caché permite reproducir el entrenamiento en una única RTX 3090 con menos de 10 GB de VRAM, útil para laboratorios con hardware limitado.
- Benchmark de robustez de atención subcuadrática: al conservar los pesos base congelados y solo modificar la atención, permite aislar el impacto del mecanismo de atención en la precisión final frente al profesor original.

## Benchmarks y rendimiento

Evaluación sobre el split de validación de GLUE SST-2 (872 muestras de clasificación binaria):

| Métrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`hamming_attention`) | Modelo destilado post-KD | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 83,83 % | 89,33 % | +5,50 % |
| Entropía cruzada de validación | 0,2428 | No calibrada | 0,3275 | Convergido |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo requiere cargar BERT-Base (110M parámetros, ~440 MB en FP32 o ~220 MB en FP16) más los pesos de atención (~55 MB en FP16). En la práctica, menos de 1 GB de VRAM para inferencia en FP16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento documentado se realizó en una NVIDIA GeForce RTX 3090 (24 GB) con un pico de 9.193 MB.
- Cabe en GPU de consumo: sí, en GTX 1650, RTX 3050, RTX 3060, RTX 4060 y superiores; también es viable en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True`, API `neuralops.hub.load_surgeried_model`, y reconstrucción modular vía `neuralops.hub.bert_zoo.load_pretrained_bert`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: durante el entrenamiento se alcanzaron 35.668 tokens/s en una RTX 3090; no se proporcionan cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bert-hamming-attention-sst2` | 110M | No disponible | 89,33 % | MIT | Hugging Face (repo Hooshaai) |
| `bert-base-uncased` (profesor) | 110M | 512 tokens | 91,63 % | Apache 2.0 | Hugging Face (Google) |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66M | 512 tokens | No disponible en la información proporcionada | Apache 2.0 | Hugging Face |
| `roberta-base` fine-tuned en SST-2 | 125M | 512 tokens | No disponible en la información proporcionada | MIT | Hugging Face |

La comparativa se limita a los datos publicados en la model card; no se dispone de resultados de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Solo admite inglés; no es adecuado para textos en castellano u otros idiomas.
- Es un clasificador binario de sentimiento afinado en SST-2; no generaliza a otras tareas de clasificación sin reentrenamiento de la cabeza.
- La accuracy cae 2,3 puntos porcentuales respecto al profesor original (89,33 % frente a 91,63 %), por lo que en producción puede ser preferible el BERT original si la precisión es crítica.
- No es un modelo generativo: no puede usarse para resumen, traducción, código ni diálogo.
- Requiere `trust_remote_code=True` y la librería NeuralOps para cargar el código remoto `modeling_neuralops_bert.py`; esto introduce dependencia de código de terceros no auditado.
- El repositorio almacena solo los pesos de atención y la cabeza; la carga depende de la disponibilidad continuada de `bert-base-uncased` en Hugging Face.
- No se documentan sesgos específicos, pero al derivar de BERT-Base hereda los sesgos presentes en su corpus de entrenamiento (BookCorpus y Wikipedia en inglés).
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas en dominios alejados de SST-2 (por ejemplo, sarcasmo, dominios técnicos o textos muy largos).
- La licencia MIT permite uso comercial, pero el código remoto y la librería NeuralOps deben revisarse por separado antes de desplegar en producción.
- No se documenta el comportamiento con secuencias superiores a la longitud de contexto de BERT-Base (512 tokens).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-hamming-attention-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE: https://huggingface.co/datasets/glue
- Dataset SST-2: https://huggingface.co/datasets/glue/viewer/sst2
