# Hooshaai/bert-sink-attention-sst2

## Resumen

`Hooshaai/bert-sink-attention-sst2` es un checkpoint derivado de `google-bert/bert-base-uncased` en el que se han sustituido los bloques de atencion softmax cuadratica de las 12 capas del transformer por un mecanismo denominado `sink_attention`, perteneciente a la libreria NeuralOps (desarrollada por Taha Majlesi). El objetivo declarado es explorar mecanismos de atencion subcuadraticos (complejidad efectiva O(N) u O(N log N) frente a O(N^2)) manteniendo la arquitectura base de BERT y evaluando su viabilidad mediante destilacion de representaciones desde el modelo profesor original.

El modelo se ha afinado y evaluado sobre la tarea SST-2 del benchmark GLUE (clasificacion binaria de sentimiento en ingles) usando el protocolo "NeuralOps Cached Representation Distillation", con un profesor congelado cuyas representaciones se cachean offline para evitar su VRAM en el entrenamiento. El resultado empirico publicado es un accuracy del 50.92 % en el split de validacion de SST-2, frente al 91.63 % del profesor `bert-base-uncased`, es decir, una caida de 5.62 puntos porcentuales que situa al modelo practicamente en el nivel de un clasificador aleatorio binario.

Se trata, por tanto, de un artefacto de investigacion sobre eficiencia de atencion mas que de un modelo listo para produccion. Su interes radica en la metodologia (serializacion modular solo de pesos de atencion y cabeza de tarea en FP16, ~55 MB) y en la infraestructura de la libreria NeuralOps, no en su rendimiento downstream, que es claramente insuficiente para uso real en clasificacion de sentimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base con atencion `sink_attention` (subcuadratica) en las 12 capas |
| Parametros totales | ~110 M (base BERT-Base); se distribuyen solo los pesos de atencion y cabeza de clasificacion (~55 MB en FP16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de BERT-Base, 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | FP16 en los pesos distribuidos (`attention_weights.safetensors`); no se documentan otras cuantizaciones |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (atencion y cabeza de tarea en FP16); requiere `trust_remote_code=True` y reconstruye el backbone congelado desde `bert-base-uncased` |

## Arquitectura y entrenamiento

La arquitectura es un BERT-Base estandar (12 capas, hidden size 768, 12 cabezas) en el que se reemplaza la atencion multi-cabeza softmax por `sink_attention`, un mecanismo de atencion subcuadratico de la familia NeuralOps que promete complejidad efectiva O(N) u O(N log N). El backbone base se mantiene congelado y se distribuyen unicamente los parametros de atencion entrenados y la cabeza de clasificacion, en un esquema de serializacion modular que evita re-subir los ~450 MB del BERT original.

El entrenamiento sigue el "NeuralOps Cached Representation Distillation Protocol": una primera etapa de alineamiento de subespacio oculto y una segunda etapa con KL sobre logits mas entropia cruzada de la tarea. El profesor (`bert-base-uncased`) se ejecuta offline y sus representaciones se cachean, de modo que el pico de VRAM durante el entrenamiento es de 5920 MB. El ajuste se realizo en una NVIDIA RTX 3090 (24 GB) durante 50.8 segundos, con 305 pasos de optimizacion y un throughput efectivo de 49176.5 tokens/s. No se documentan el volumen total de tokens de entrenamiento, la composicion del dataset mas alla de GLUE/SST-2, ni si hubo RLHF o DPO (no aplicable en un clasificador).

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) sobre texto en ingles, entrenada especificamente para SST-2.
- Inferencia con atencion subcuadratica, lo que en teoria reduce el coste computacional en secuencias largas frente a la atencion cuadratica de BERT estandar.
- Carga modular via `transformers` con `trust_remote_code=True` o via la API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`).
- No soporta generacion de texto, tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No tiene vision, audio ni modo "thinking".
- Multilingue: no; solo ingles.
- No es un modelo de proposito general: su unica tarea es la clasificacion de secuencias.

## Casos de uso

- Investigacion sobre mecanismos de atencion eficiente: sirve como referencia reproducible para comparar `sink_attention` con atencion softmax cuadratica en un transformer encoder estandar, dado que el checkpoint y el protocolo de destilacion estan documentados.
- Reproduccion de experimentos de destilacion modular: el esquema de pesos solo-atencion (~55 MB) facilita iterar sobre variantes de atencion sin reentrenar el backbone completo.
- Benchmark de infraestructura NeuralOps: util para validar el pipeline de carga (`load_surgeried_model`) y la compatibilidad con `transformers` en entornos de investigacion.
- Pruebas de integracion de atencion subcuadratica en pipelines existentes de BERT: permite medir el coste real de sustitucion de atencion en un modelo ya desplegado, aunque con la advertencia de la fuerte perdida de accuracy.
- Docencia y divulgacion: ejemplo didactico de como una modificacion arquitectonica agresiva sin suficiente entrenamiento degrada el rendimiento downstream (50.92 % frente a 91.63 % del profesor).
- No se recomienda su uso en produccion para analisis de sentimiento real, atencion al cliente ni moderacion de contenido, dado que su accuracy es practicamente equivalente a la de un clasificador aleatorio binario.

## Benchmarks y rendimiento

Evaluacion publicada en el split de validacion de GLUE SST-2 (872 muestras de clasificacion binaria):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`sink_attention`) | Modelo destilado post-KD | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91.63 % | 56.54 % | 50.92 % | -5.62 % (frente al profesor) |
| Entropia cruzada de validacion | 0.2428 | no calibrada | 0.6946 | no disponible |

Telemetria de entrenamiento: RTX 3090 24 GB, 50.8 s, 305 pasos, 49176.5 tokens/s, pico de VRAM 5920 MB. No se han publicado resultados en otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM de inferencia: el checkpoint distribuido ocupa ~55 MB en FP16, pero al cargarse reconstruye el backbone `bert-base-uncased` (~110 M parametros, ~220 MB en FP16, ~440 MB en FP32). En la practica, la huella en VRAM ronda 0.5-1 GB incluyendo tokenizer y overhead de PyTorch.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el entrenamiento se realizo en una RTX 3090. Cabe en GPUs de 4 GB o menos, e incluso en CPU para inferencia puntual.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con al menos 2 GB de VRAM.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el shim `modeling_neuralops_bert.py`); API de NeuralOps (`neuralops.hub`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son motores orientados a generacion, no a clasificacion).
- Latencia y throughput: no se publican cifras de inferencia; solo se documenta el throughput de entrenamiento (49176.5 tokens/s en RTX 3090).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-sink-attention-sst2` | ~110 M (solo atencion distribuida) | no disponible | 50.92 % | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor, fine-tuned SST-2) | ~110 M | 512 tokens | 91.63 % (segun la propia model card) | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~66 M | 512 tokens | no disponible en la informacion proporcionada (referencia habitual ~91 % en SST-2) | Apache 2.0 | Hugging Face |
| `roberta-base` fine-tuned SST-2 | ~125 M | 512 tokens | no disponible en la informacion proporcionada | MIT | Hugging Face |

La comparativa se limita a la tarea SST-2 porque el modelo solo soporta clasificacion de sentimiento. Frente a alternativas establecidas de la misma categoria (BERT, DistilBERT, RoBERTa afinados en SST-2), el checkpoint NeuralOps queda muy por debajo en accuracy, por lo que su unico eje de comparacion favorable seria el coste computacional teorico de la atencion subcuadratica, no medido en la informacion disponible.

## Limitaciones y advertencias

- Rendimiento muy bajo: 50.92 % de accuracy en SST-2 equivale practicamente a un clasificador aleatorio binario; no es apto para uso en produccion.
- El propio autor etiqueta el resultado como "Subquadratic Probe", lo que sugiere que es un experimento exploratorio y no un modelo final.
- Sesgos: al derivar de `bert-base-uncased` y entrenarse solo en SST-2, hereda los sesgos del corpus original y los del dataset de resenas; no se documenta ninguna evaluacion de sesgo.
- Riesgo de alucinacion: no aplica en sentido generativo (es un clasificador), pero si hay riesgo de predicciones no calibradas (entropia cruzada de 0.6946 en validacion).
- Limitaciones de idioma: solo ingles; no se garantiza comportamiento en castellano ni en otros idiomas.
- Limitaciones de contexto: no se documenta la longitud maxima; se asume la de BERT-Base (512 tokens) pero no esta confirmado.
- Licencia MIT: permite uso comercial, pero el rendimiento hace inviable ese escenario.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo remoto del repositorio (`modeling_neuralops_bert.py`); conviene auditar ese codigo antes de desplegarlo.
- Dependencia de la libreria NeuralOps (`neuralops`) para la carga de alto nivel; no se garantiza compatibilidad con versiones futuras de `transformers`.
- El repositorio tiene 53 descargas y 0 likes en el momento de la consulta, lo que indica escasa validacion por parte de la comunidad.
- La model card mezcla identificadores `Hooshaai/...` y `tahamajs/...` en los ejemplos de codigo, lo que puede provocar errores al copiar y pegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-sink-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Licencia MIT (NeuralOps): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
