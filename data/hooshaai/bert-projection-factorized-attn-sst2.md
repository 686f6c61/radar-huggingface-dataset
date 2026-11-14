# Hooshaai/bert-projection-factorized-attn-sst2

## Resumen

`Hooshaai/bert-projection-factorized-attn-sst2` es un checkpoint de BERT-Base (`bert-base-uncased`, 110 M de parámetros) en el que las 12 capas de atención softmax cuadrática han sido sustituidas por el mecanismo `projection_factorized_attn` de la librería NeuralOps, una atención subcuadrática con complejidad efectiva O(N) u O(N log N). El modelo se ha afinado y destilado sobre la tarea SST-2 del benchmark GLUE (clasificación binaria de sentimiento en inglés), partiendo del modelo profesor original y aplicando un protocolo de destilación de representaciones en caché.

El interés técnico del checkpoint no reside en la tarea (clasificación de sentimiento, un problema resuelto) sino en la arquitectura: demuestra que es posible sustituir la atención cuadrática de un transformer preentrenado por una alternativa subcuadrática y recuperar prácticamente todo el rendimiento del profesor mediante destilación (88,65 % frente a 91,63 % de accuracy en SST-2, con un delta de +37,73 puntos respecto al estudiante sin destilar). Es, por tanto, una pieza de referencia para quien investigue eficiencia en atención o quiera evaluar mecanismos de atención alternativos sobre arquitecturas BERT consolidadas.

El repositorio es deliberadamente modular: solo contiene los pesos de atención y la cabeza de clasificación en FP16 (~55 MB), no el modelo completo. El código remoto (`modeling_neuralops_bert.py`) reconstruye el BERT base congelado desde `bert-base-uncased` y aplica encima los pesos destilados. La licencia es MIT y el idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-Base con atención `projection_factorized_attn` (subcuadrática, O(N) u O(N log N)) en las 12 capas |
| Parametros totales | 110 M (BERT-Base); el repo solo serializa los pesos de atención y la cabeza (~55 MB en FP16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base `bert-base-uncased` soporta 512 tokens; el autor no especifica el contexto efectivo del mecanismo subcuadrático) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (atención y cabeza en FP16, `attention_weights.safetensors`); requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` (12 capas, 110 M de parámetros, encoder bidireccional) y reemplaza en todas las capas el bloque de multi-head attention estándar por `projection_factorized_attn`, un mecanismo de atención factorizada por proyección que reduce la complejidad operativa de O(N²) a O(N) u O(N log N) según el autor. Los pesos del BERT base permanecen congelados; solo se entrenan los parámetros de atención y la cabeza de clasificación, que es lo que se distribuye en el repositorio.

El entrenamiento sigue el protocolo "Cached Representation Distillation" de NeuralOps, con asignación cero de VRAM al profesor gracias a la caché offline de representaciones. Se ejecutó en una NVIDIA GeForce RTX 3090 (24 GB), con 230 pasos de optimización en dos etapas: primero alineación de subespacio oculto y después KL sobre logits más entropía cruzada de la tarea. La duración total fue de 52,6 s, con un throughput efectivo de 35 820 tokens/s y un pico de VRAM de 7744 MB. El dataset de evaluación y ajuste es la partición de validación de SST-2 (872 muestras binarias).

## Capacidades

- Clasificación binaria de sentimiento en inglés (positivo/negativo) sobre textos de una sola secuencia.
- Razonamiento semántico básico heredado del preentrenamiento de BERT-Base, limitado a la tarea de clasificación para la que se ha afinado.
- No soporta tool calling ni function calling: es un modelo de clasificación, no de generación.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- Capacidad multilingüe nula más allá del inglés declarado.
- No dispone de modo thinking, visión ni audio.
- La atención subcuadrática permite, en principio, procesar secuencias más largas con coste menor que la atención cuadrática, aunque el autor no documenta el contexto máximo efectivo.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: el modelo clasifica reseñas en inglés en positivas o negativas; su tamaño (110 M) permite desplegarlo en CPU o GPU modesta con latencia baja.
- Moderación de comentarios a escala: al emplear atención subcuadrática, es adecuado para lotes grandes de textos cortos donde el coste por token importa más que la precisión absoluta.
- Filtrado previo en pipelines de datos: clasificar grandes volúmenes de texto en inglés para separar opiniones positivas y negativas antes de un análisis más costoso con un modelo mayor.
- Investigación en eficiencia de atención: sirve como checkpoint de referencia para comparar `projection_factorized_attn` con atención softmax estándar sobre la misma tarea y el mismo modelo base.
- Destilación y experimentos de sustitución de atención: útil para reproducir el protocolo de destilación en caché de NeuralOps sobre otras tareas GLUE.
- Evaluación de robustez de mecanismos subcuadráticos: permite medir la pérdida de accuracy (2,98 puntos frente al profesor en SST-2) al cambiar el mecanismo de atención en un modelo ya preentrenado.
- Clasificación de sentimiento en entornos con restricciones de memoria: los ~55 MB de pesos de atención más el BERT base congelado caben en GPUs de gama baja e incluso en CPU para inferencia por lotes.

## Benchmarks y rendimiento

Evaluación sobre la partición de validación de GLUE SST-2 (872 muestras binarias), según la model card:

| Metrica | Profesor (`bert-base-uncased`) | Estudiante sin destilar | Modelo destilado |
|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 50,92 % | 88,65 % |
| Entropia cruzada de validacion | 0,2428 | no calibrada | 0,3792 |
| Delta de accuracy | — | — | +37,73 pts |

Telemetría de entrenamiento (RTX 3090, 24 GB): 52,6 s de duración, 230 pasos, 35 820 tokens/s, pico de VRAM de 7744 MB. No se han publicado resultados en otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: el modelo completo en FP16 ocupa aproximadamente 220 MB (110 M de parámetros), más el overhead de activaciones; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: RTX 3090, RTX 4090, A100 o H100 para despliegues por lotes; también funciona en GPUs de gama baja (GTX 1650, T4) y en CPU para inferencia moderada.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM; el entrenamiento reportado usó una RTX 3090.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`, la API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 35 820 tokens/s en entrenamiento sobre RTX 3090; no se publican cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (accuracy) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-projection-factorized-attn-sst2` | 110 M | no disponible | 88,65 % | MIT | Hugging Face (pesos de atención, ~55 MB) |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 tokens | 91,63 % (reportado por el autor) | Apache 2.0 | Hugging Face (modelo completo, ~440 MB) |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 tokens | ~91 % (referencia pública) | Apache 2.0 | Hugging Face (modelo completo) |
| `roberta-base` fine-tuned en SST-2 | 125 M | 512 tokens | ~94-95 % (referencia pública) | MIT | Hugging Face (modelo completo) |

La comparativa con DistilBERT y RoBERTa se ofrece como referencia de categoría; el autor no publica comparaciones directas con ellos. La ventaja específica de este checkpoint es la atención subcuadrática, no la precisión.

## Limitaciones y advertencias

- Pérdida de precisión respecto al profesor: 2,98 puntos de accuracy en SST-2 (88,65 % frente a 91,63 %).
- Solo inglés: no se ha entrenado ni evaluado en otros idiomas.
- Solo clasificación binaria de sentimiento: no genera texto, no hace tool calling ni razonamiento multi-paso.
- El repositorio no contiene el modelo completo: requiere descargar `bert-base-uncased` y ejecutar código remoto (`trust_remote_code=True`), lo que implica confiar en `modeling_neuralops_bert.py`.
- Sesgos heredados de BERT-Base y del corpus SST-2 (reseñas de películas), con posible degradación en dominios distintos.
- Riesgo de alucinación bajo en clasificación, pero el modelo puede asignar etiquetas con confianza alta a entradas ambiguas o fuera de dominio.
- No hay datos publicados sobre el contexto máximo efectivo del mecanismo subcuadrático ni sobre su comportamiento en secuencias largas.
- La licencia MIT permite uso comercial, pero el modelo base `bert-base-uncased` está bajo Apache 2.0 y sus términos aplican igualmente.
- El repositorio tiene muy pocas descargas (69) y un solo like: no hay validación independiente de los resultados reportados.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-projection-factorized-attn-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Modelo base: https://huggingface.co/bert-base-uncased
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/glue
