# Hooshaai/bert-mla-attention-sst2

## Resumen

`Hooshaai/bert-mla-attention-sst2` es un checkpoint de BERT-Base (`bert-base-uncased`, 110 M de parámetros) en el que se han sustituido los bloques de atención softmax cuadrática de las 12 capas del transformer por el mecanismo `mla_attention` de la librería NeuralOps, con complejidad operativa subcuadrática (O(N) u O(N log N) frente a O(N²)). Lo publica el autor Hooshaai (atribución de código a Taha Majlesi en la cita de NeuralOps) y está afinado para clasificación binaria de sentimiento sobre la tarea SST-2 del benchmark GLUE. El modelo base se mantiene congelado y solo se distribuyen los pesos de atención y la cabeza de clasificación destilados.

El problema que aborda es de eficiencia arquitectónica: validar si un mecanismo de atención subcuadrática puede acercarse al rendimiento de la atención estándar en una tarea de clasificación de secuencias, mediante un protocolo de destilación de representaciones en caché (NeuralOps Cached Representation Distillation) que evita asignar VRAM al profesor durante el entrenamiento. El resultado reportado es un 89,22 % de accuracy en el split de validación de SST-2 (872 muestras), frente al 91,63 % del profesor BERT-Base original y el 75,57 % del estudiante sin destilar.

Es relevante ahora porque demuestra, con cifras concretas y un coste de entrenamiento muy bajo (48,8 s en una RTX 3090, 271 pasos de optimización), que la sustitución modular de atención es viable en un modelo estándar y que la serialización de solo pesos de atención (55 MB en FP16) permite distribuir variantes arquitectónicas sin duplicar los 450 MB del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer BERT-Base con atención subcuadrática `mla_attention` en las 12 capas |
| Parámetros totales | 110 M (BERT-Base); pesos distribuidos: solo atención + cabeza de clasificación (~55 MB FP16) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de `bert-base-uncased`, típicamente 512 tokens; no confirmado en la información) |
| Tipos de cuantización | no disponible (pesos publicados en FP16) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16, serialización `attention_only_fp16`) |
| Librería | neuralops |
| Pipeline | text-classification |
| Dataset de evaluación | GLUE / SST-2 |
| Modelo base | google-bert/bert-base-uncased |
| Tamaño del repo | 0,4 GB |
| Descargas / likes | 82 / 0 |

## Arquitectura y entrenamiento

La arquitectura parte de BERT-Base (12 capas, 110 M de parámetros) y reemplaza la atención multi-cabeza estándar por `mla_attention`, un mecanismo de atención subcuadrática con complejidad efectiva O(N) u O(N log N). Los pesos del backbone BERT permanecen congelados; solo se entrenan los parámetros de atención y la cabeza de clasificación, que se serializan de forma modular y se aplican sobre el base al cargar el modelo mediante el shim de código remoto `modeling_neuralops_bert.py`.

El entrenamiento sigue el NeuralOps Cached Representation Distillation Protocol, en dos etapas: primero un alineamiento de subespacio oculto y después una combinación de KL sobre logits y entropía cruzada de la tarea. El profesor (BERT-Base) no consume VRAM durante la destilación porque sus representaciones se cachean offline. La ejecución se realizó en una NVIDIA RTX 3090 (24 GB) con 271 pasos de optimización, 48,8 s de duración, throughput efectivo de 45 463,2 tokens/s y un pico de VRAM de 23 021 MB.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) sobre texto en inglés, tarea SST-2.
- Clasificación de secuencias cortas con la cabeza de clasificación entrenada; no se documentan otras cabezas de tarea.
- Inferencia con atención subcuadrática, lo que en principio reduce el coste en secuencias largas frente a la atención cuadrática.
- Carga modular: reconstruye el base BERT congelado y aplica encima los pesos de atención destilados.
- Integración con Hugging Face Transformers mediante `trust_remote_code=True` y con la API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`).
- No se documentan capacidades de generación de texto, tool calling, agentes, matemáticas, visión ni audio.

## Casos de uso

- Análisis de sentimiento de reseñas de producto o comentarios de usuario en inglés: el modelo está afinado específicamente en SST-2 y devuelve una etiqueta binaria con logits, adecuado para pipelines de moderación o scoring de opiniones.
- Clasificación por lotes de tickets de soporte en inglés: al ser un modelo de 110 M con atención subcuadrática, permite procesar grandes volúmenes en GPU consumer con bajo coste por muestra.
- Investigación sobre eficiencia de atención: sirve como checkpoint de referencia para comparar `mla_attention` frente a atención estándar en una tarea controlada (SST-2) con métricas publicadas.
- Destilación de representaciones: el protocolo y los pesos publicados permiten reproducir o extender el experimento de alineamiento de subespacio y KL sobre logits con otros profesores o tareas.
- Prototipado de variantes arquitectónicas: la serialización de solo atención (55 MB) facilita distribuir y probar sustituciones de atención sobre un mismo base BERT sin duplicar pesos.
- Filtrado de datos y etiquetado débil: como clasificador binario rápido para preetiquetar corpus en inglés antes de una revisión humana o de un modelo mayor.

## Benchmarks y rendimiento

Evaluación sobre el split de validación de GLUE SST-2 (872 muestras binarias):

| Métrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD | Modelo destilado |
|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 75,57 % | 89,22 % |
| Entropía cruzada de validación | 0,2428 | no calibrada | 0,3183 |
| Delta de accuracy | — | — | +13,65 % frente a pre-KD |

Telemetría de entrenamiento (RTX 3090, 24 GB):

| Métrica | Valor |
|---|---|
| Duración | 48,8 s |
| Pasos de optimización | 271 |
| Throughput efectivo | 45 463,2 tokens/s |
| Pico de VRAM | 23 021 MB |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint distribuido pesa ~55 MB en FP16, pero al cargar se reconstruye el base BERT de 110 M (≈450 MB en FP32, ≈220 MB en FP16), por lo que la huella en memoria ronda unos pocos cientos de MB más el overhead del framework.
- GPU recomendadas: cualquier GPU con al menos ~2-4 GB de VRAM libre es suficiente para inferencia; el entrenamiento documentado usó una RTX 3090 de 24 GB con un pico de 23 021 MB (por el protocolo de destilación, no por el tamaño del modelo).
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares; también en CPU para volúmenes moderados.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True`; API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo se publica el throughput de entrenamiento (45 463,2 tokens/s); no hay datos de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-mla-attention-sst2` | 110 M (atención + cabeza ~55 MB) | no disponible | 89,22 % | MIT | Hugging Face (neuralops) |
| `google-bert/bert-base-uncased` (profesor, fine-tuned SST-2) | 110 M | 512 tokens | 91,63 % | Apache 2.0 | Hugging Face |
| Estudiante `mla_attention` pre-KD | 110 M | no disponible | 75,57 % | MIT | incluido en el repo |

No se dispone de datos de otros modelos comparables de atención subcuadrática en la información proporcionada.

## Limitaciones y advertencias

- Solo está entrenado y evaluado para clasificación binaria de sentimiento en inglés (SST-2); no es un modelo de propósito general ni genera texto.
- El rendimiento cae 2,41 puntos respecto al profesor BERT-Base (89,22 % frente a 91,63 %), por lo que en producción con requisitos estrictos de precisión puede no ser suficiente.
- Requiere `trust_remote_code=True` y la librería NeuralOps; la carga depende de un shim de código remoto, lo que añade superficie de mantenimiento y riesgo de compatibilidad con versiones futuras de Transformers.
- El repo tiene 82 descargas y 0 likes, y el autor no es el mismo que el de la organización referenciada en el código de ejemplo (`tahamajs`); conviene verificar la procedencia antes de usarlo en producción.
- No se documentan sesgos específicos, pero al derivar de `bert-base-uncased` y entrenarse solo en SST-2 hereda los sesgos del corpus de reseñas de películas.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas en dominios distintos al de entrenamiento.
- Licencia MIT permite uso comercial, pero al reconstruir el base BERT conviene revisar también la licencia de `bert-base-uncased` (Apache 2.0).
- No hay información sobre cuantizaciones, contexto máximo efectivo ni latencia de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-mla-attention-sst2
- Modelo base: https://huggingface.co/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE / SST-2: https://huggingface.co/datasets/glue
