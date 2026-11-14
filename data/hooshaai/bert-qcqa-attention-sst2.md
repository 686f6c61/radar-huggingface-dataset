# Hooshaai/bert-qcqa-attention-sst2

## Resumen

`bert-qcqa-attention-sst2` es un checkpoint de BERT-Base (110 M de parámetros) en el que se han sustituido los bloques de atención softmax cuadrática de las 12 capas del transformer por el mecanismo `qcqa_attention` de la librería NeuralOps. El objetivo es demostrar que una atención subcuadrática (complejidad efectiva O(N) u O(N log N) frente a O(N²) de la MHA estándar) puede igualar la precisión del modelo original tras un proceso de destilación por representaciones. Lo publica el autor Taha Majlesi bajo el paraguas del proyecto NeuralOps.

El modelo está especializado en clasificación binaria de sentimiento (tarea SST-2 del benchmark GLUE) y se distribuye como un adaptador de solo atención en FP16 (~55 MB) que se reconstruye sobre los pesos congelados de `bert-base-uncased`. Según la model card, alcanza un 91,63 % de accuracy en el split de validación de SST-2, idéntico al profesor original, partiendo de un estudiante sin destilar que rendía al 52,98 %.

Su relevancia es doble: por un lado, sirve como referencia empírica de que la destilación offline de representaciones permite recuperar calidad en arquitecturas de atención alternativas; por otro, su empaquetado modular (solo pesos de atención + cabeza de clasificación) reduce drásticamente el coste de almacenamiento y descarga frente a un fine-tune completo. Es un artefacto de investigación, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base con atención `qcqa_attention` (subcuadrática) en las 12 capas |
| Parametros totales | 110 M (BERT-Base); el repo solo almacena los pesos de atención y la cabeza de clasificación |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de `bert-base-uncased`, típicamente 512 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en FP16) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16, serialización `attention_only_fp16`, ~55 MB) |

## Arquitectura y entrenamiento

La arquitectura parte de `bert-base-uncased` (12 capas, 768 de dimensión oculta, 12 cabezas, ~110 M de parámetros) y reemplaza la atención softmax cuadrática por `qcqa_attention`, un mecanismo de la NeuralOps Library con complejidad operativa efectiva O(N) u O(N log N). Los pesos base permanecen congelados y solo se entrenan los parámetros de atención y la cabeza de clasificación, que se serializan de forma modular.

El entrenamiento sigue el *NeuralOps Cached Representation Distillation Protocol*: primero una fase de alineamiento de subespacio oculto (Stage 1) y después una fase de destilación por logits con KL + entropía cruzada de tarea (Stage 2). La destilación es offline, con caché de representaciones del profesor, lo que elimina la necesidad de mantener al profesor en VRAM. Los datos son el split de entrenamiento de SST-2 (GLUE). La ejecución se realizó en una NVIDIA GeForce RTX 3090 (24 GB): 255 pasos de optimización, 49,6 s de duración, throughput efectivo de 42 120,5 tokens/s y pico de VRAM de 8083 MB.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) sobre texto en inglés, tarea SST-2.
- Extracción de representaciones contextuales de BERT-Base con atención subcuadrática, útil para experimentación con mecanismos de atención alternativos.
- Inferencia compatible con `AutoModelForSequenceClassification` de Transformers mediante `trust_remote_code=True`.
- Carga modular a través de la API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto libre: es exclusivamente un clasificador.
- Capacidad multilingüe: no; solo inglés.

## Casos de uso

- Análisis de sentimiento en reseñas de producto o comentarios de usuarios en inglés: el modelo clasifica secuencias en positivo/negativo con una accuracy reportada del 91,63 % en SST-2, suficiente para triaje automático de feedback a escala.
- Moderación de comentarios en foros angloparlantes: como clasificador binario rápido y ligero (~55 MB de pesos de atención), puede desplegarse en CPU o GPU de gama baja para filtrar toxicidad o polaridad antes de una revisión humana.
- Investigación en eficiencia de atención: sirve como punto de partida reproducible para comparar `qcqa_attention` frente a softmax estándar en tareas de clasificación con presupuestos de cómputo limitados.
- Destilación de modelos BERT en producción: el protocolo de destilación offline con caché de representaciones permite reproducir el pipeline en hardware de una sola GPU consumer (RTX 3090) sin mantener al profesor en memoria.
- Benchmarking interno de arquitecturas subcuadráticas: al estar entrenado sobre SST-2 con métricas públicas, es una referencia útil para validar implementaciones propias de atención lineal o casi-lineal.
- Prototipado rápido de pipelines de NLP: la carga en una línea vía NeuralOps Hub y el tamaño reducido del repo (0,2 GB) facilitan entornos de experimentación con requisitos de almacenamiento bajos.
- Docencia y divulgación: ejemplo didáctico de sustitución modular de bloques de atención y de destilación por representaciones con métricas claras (52,98 % → 91,63 %).

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el split de validación de GLUE SST-2 (872 muestras binarias):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`qcqa_attention`) | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 52,98 % | 91,63 % | +38,65 % |
| Cross-entropy de validación | 0,2428 | no calibrada | 0,2688 | convergido |

Telemetría de entrenamiento (RTX 3090, 24 GB): 49,6 s, 255 pasos, 42 120,5 tokens/s, pico de VRAM 8083 MB, sin VRAM asignada al profesor gracias a la caché offline de representaciones.

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo solo contiene ~55 MB de pesos de atención en FP16; sumando los pesos base de BERT-Base (~110 M de parámetros, ~220 MB en FP16 o ~440 MB en FP32) el modelo completo ocupa menos de 1 GB en memoria.
- GPU recomendadas: cualquier GPU con al menos ~2 GB de VRAM libre; el entrenamiento se ejecutó en una RTX 3090 (24 GB) con un pico de 8083 MB, pero la inferencia es mucho más ligera.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (GTX 1060 6 GB, RTX 3060, RTX 4090, etc.) e incluso en CPU para lotes pequeños.
- Opciones de despliegue: Transformers con `trust_remote_code=True`, API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras de inferencia; solo se reporta throughput de entrenamiento (42 120,5 tokens/s en RTX 3090).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-qcqa-attention-sst2` | 110 M (atención subcuadrática) | no disponible | 91,63 % | MIT | Hugging Face (repo de 0,2 GB) |
| `google-bert/bert-base-uncased` (fine-tune SST-2) | 110 M | 512 tokens | 91,63 % (profesor de referencia) | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 110 M | 512 tokens | ~92 % (referencia habitual en la comunidad) | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 tokens | ~91 % | Apache 2.0 | Hugging Face |

La comparativa se limita a la tarea SST-2; no se dispone de datos de benchmarks adicionales para comparar en otras tareas. La ventaja diferencial de este checkpoint no es la precisión (igual al profesor) sino la atención subcuadrática y el empaquetado modular de pesos.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en clasificación binaria de sentimiento en inglés; no genera texto ni sirve para otras tareas sin reentrenamiento.
- La accuracy reportada (91,63 %) procede de un único split de validación de SST-2 (872 muestras); no hay evaluación en otros conjuntos ni intervalos de confianza publicados.
- El estudiante pre-destilación rendía al 52,98 %, lo que indica que el mecanismo `qcqa_attention` por sí solo no es competitivo sin destilación; la calidad depende críticamente del protocolo de KD.
- Requiere `trust_remote_code=True` y la librería NeuralOps, lo que introduce dependencia de código remoto y reduce la portabilidad frente a un checkpoint estándar de Transformers.
- Los pesos base no se incluyen en el repo: la reconstrucción depende de la disponibilidad de `bert-base-uncased` en el Hub.
- Riesgo de sesgos heredados de BERT-Base y de los datos de SST-2 (reseñas de películas), con posible degradación en dominios distintos.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas en entradas ambiguas, sarcasmo o dominios fuera de distribución.
- Licencia MIT permite uso comercial, pero se recomienda revisar las condiciones de la librería NeuralOps y del modelo base `bert-base-uncased` (Apache 2.0) antes de desplegar en producción.
- No hay métricas de latencia, throughput de inferencia ni robustez publicadas; conviene validar en el dominio objetivo antes de un despliegue real.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-qcqa-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Benchmark GLUE: https://gluebenchmark.com/
- Dataset SST-2: https://huggingface.co/datasets/glue
