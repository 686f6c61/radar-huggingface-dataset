# Hooshaai/bert-jamba-info-sst2

## Resumen

`Hooshaai/bert-jamba-info-sst2` es un checkpoint derivado de `google-bert/bert-base-uncased` en el que las 12 capas de atención softmax cuadrática del transformer original han sido sustituidas por el mecanismo `jamba_info` de la librería NeuralOps. El modelo resultante se ha afinado y destilado específicamente para la tarea SST-2 del benchmark GLUE (clasificación binaria de sentimiento en inglés). Lo publica el autor Hooshaai (Taha Majlesi en la citación original), con licencia MIT y librería `neuralops`.

El interés técnico del checkpoint no está en el rendimiento absoluto (76,83 % de accuracy en SST-2 frente al 91,63 % del profesor BERT-base), sino en que demuestra un flujo de sustitución modular de atención subcuadrática (complejidad efectiva O(N) u O(N log N)) con destilación de representaciones en caché y un formato de pesos "solo atención" en FP16 de unos 55 MB. Es, por tanto, una pieza de investigación sobre eficiencia de atención más que un modelo listo para producción.

El tamaño base es BERT-base (110 M parámetros), el contexto es el estándar de BERT (512 tokens) y el idioma declarado es únicamente inglés. La relevancia actual radica en la tendencia hacia mecanismos de atención lineales/subcuadráticos y en la serialización de pesos parciales que evita re-subir el modelo base completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base con atención `jamba_info` (subcuadrática) en las 12 capas |
| Parametros totales | 110 M (base BERT-base); pesos publicados: solo atención + cabeza, ~55 MB FP16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de BERT-base; no se explicita en la model card) |
| Tipos de cuantizacion | FP16 (formato publicado `attention_only_fp16`); otras cuantizaciones no disponibles |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16, ~55 MB) + código remoto `modeling_neuralops_bert.py`; requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer tipo BERT-base (12 capas, 110 M parámetros) en el que se reemplaza la atención multi-cabeza softmax cuadrática O(N²) por el mecanismo `jamba_info` de NeuralOps, con complejidad efectiva O(N) u O(N log N). El repositorio no re-publica los pesos base congelados: solo serializa las ponderaciones de atención especializadas y la cabeza de clasificación en FP16 (~55 MB), y el código remoto reconstruye el modelo inicializando los pesos congelados desde `bert-base-uncased` y aplicando encima los parámetros destilados.

El entrenamiento sigue el "NeuralOps Cached Representation Distillation Protocol": una destilación en dos etapas (alineamiento de subespacio oculto en la etapa 1, KL sobre logits + entropía cruzada de tarea en la etapa 2) con caché offline de representaciones del profesor, de modo que este no consume VRAM durante el proceso. Se ejecutó en una NVIDIA GeForce RTX 3090 de 24 GB, con 130 pasos de optimización, 51,9 s de duración total, throughput de 20.511,1 tokens/s y un pico de VRAM de 14.796 MB. El conjunto de evaluación es la partición de validación de SST-2 (872 muestras binarias).

## Capacidades

- Clasificación de texto binaria (sentimiento positivo/negativo) sobre entradas en inglés, pipeline `text-classification`.
- Inferencia con `AutoModelForSequenceClassification` de Transformers usando `trust_remote_code=True`.
- Carga modular mediante la API de NeuralOps (`load_pretrained_bert` con `attention_type="jamba_info"` y `load_surgeried_model`).
- Sustitución de atención subcuadrática como demostración de eficiencia arquitectónica.
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio, thinking mode ni capacidades multilingües más allá del inglés.
- No se declara generación de texto libre: el checkpoint está especializado en clasificación.

## Casos de uso

- Investigación sobre atención subcuadrática: comparar `jamba_info` frente a softmax MHA en tareas GLUE con el mismo backbone BERT-base, usando el checkpoint como referencia reproducible.
- Análisis de sentimiento en inglés a pequeña escala: clasificar reseñas o comentarios binarios con un modelo de 110 M parámetros y ~55 MB de pesos descargables, adecuado para entornos con almacenamiento limitado.
- Destilación con profesor offline: replicar el protocolo de representaciones en caché para reducir el coste de VRAM del profesor en experimentos de knowledge distillation.
- Serialización modular de pesos: estudiar el formato "attention-only" para distribuir adaptaciones de atención sin re-subir el modelo base completo.
- Baseline educativo: ilustrar el impacto de sustituir atención cuadrática por subcuadrática en accuracy (caída de 91,63 % a 76,83 % en SST-2) en cursos o tutoriales.
- Integración en pipelines de experimentación con NeuralOps: usar la API `load_surgeried_model` para pruebas automatizadas de variantes de atención en el zoo.

## Benchmarks y rendimiento

Datos publicados en la model card sobre la partición de validación de GLUE SST-2 (872 muestras):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`jamba_info`) | Modelo destilado post-KD | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 51,38 % | 76,83 % | +25,46 % |
| Cross-entropy de validación | 0,2428 | no calibrado | 0,5337 | convergido |

Telemetría de destilación: RTX 3090 24 GB, 51,9 s, 130 pasos, 20.511,1 tokens/s, pico de VRAM 14.796 MB.

## Requisitos de hardware

- VRAM estimada: el checkpoint publicado pesa ~55 MB en FP16, pero la reconstrucción requiere cargar los pesos congelados de `bert-base-uncased` (~110 M parámetros, del orden de 440 MB en FP32 o ~220 MB en FP16); el consumo total en inferencia es bajo, apto para GPUs de gama media.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060/4060 o superior) es suficiente; el entrenamiento reportado se hizo en una RTX 3090. Para lotes grandes, A100/H100 no son necesarios.
- Cabe en GPU consumer: sí, con holgura; incluso puede ejecutarse en CPU para inferencia puntual.
- Opciones de despliegue: Transformers con `trust_remote_code=True`, API de NeuralOps; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no disponibles). La dependencia de código remoto limita algunos servidores de inferencia estándar.
- Latencia y throughput: no se publican métricas de inferencia; solo throughput de entrenamiento (20.511,1 tokens/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (accuracy) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-jamba-info-sst2` | 110 M (base) | 512 | 76,83 % | MIT | Hugging Face, requiere código remoto |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 | 91,63 % (referencia de la card) | Apache-2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 | no disponible en esta información | Apache-2.0 | Hugging Face |
| `roberta-base` afinado en SST-2 | 125 M | 514 | no disponible en esta información | MIT | Hugging Face |

La comparación directa con DistilBERT y RoBERTa afinados en SST-2 no está disponible en la información proporcionada; solo se dispone del dato del profesor BERT-base citado en la model card.

## Limitaciones y advertencias

- Rendimiento inferior al profesor: 76,83 % frente a 91,63 % en SST-2, una caída de 14,8 puntos porcentuales.
- Solo inglés y solo clasificación binaria de sentimiento; no es un modelo generativo ni multilingüe.
- Requiere `trust_remote_code=True` y la librería NeuralOps; el código remoto introduce riesgo de seguridad y dependencia de mantenimiento del repositorio.
- El checkpoint no contiene los pesos base completos: depende de la disponibilidad de `bert-base-uncased` en el Hub para reconstruirse.
- Riesgo de alucinación no aplica directamente (clasificación), pero la calibración es limitada: cross-entropy de validación de 0,5337 frente a 0,2428 del profesor.
- Sesgos: no se documentan análisis de sesgo; al derivar de BERT-base, hereda los sesgos del corpus original (BookCorpus + Wikipedia en inglés).
- Licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base (`bert-base-uncased`, Apache-2.0) y del código NeuralOps.
- Repositorio con muy poca tracción (78 descargas, 2 likes) y creado/actualizado en noviembre de 2026; no hay garantía de soporte ni de mantenimiento.
- No se han publicado resultados de benchmarks más allá de SST-2 en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-jamba-info-sst2
- Modelo base: https://huggingface.co/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Benchmark GLUE: https://gluebenchmark.com/
- Dataset SST-2: https://huggingface.co/datasets/glue
