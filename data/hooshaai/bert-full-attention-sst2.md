# Hooshaai/bert-full-attention-sst2

## Resumen

`Hooshaai/bert-full-attention-sst2` es un checkpoint de clasificación de sentimiento derivado de `google-bert/bert-base-uncased` en el que se han sustituido los bloques de atención softmax cuadrática de las 12 capas del transformer por el mecanismo `full_attention` de la librería NeuralOps, con complejidad operativa subcuadrática (O(N) u O(N log N)). Lo publica el usuario Hooshaai (autor original citado: Taha Majlesi) dentro de un "Attention Zoo" de BERT preentrenados y destilados sobre GLUE. El modelo resuelve una tarea concreta: clasificación binaria de sentimiento en inglés (SST-2), manteniendo la precisión del profesor original mientras reduce el coste asintótico de la atención.

La relevancia es doble. Por un lado, sirve como referencia empírica de que un mecanismo de atención subcuadrática puede igualar a la atención estándar en una tarea GLUE tras un proceso de destilación de representaciones en dos etapas. Por otro, el repositorio aplica una serialización modular: solo se distribuyen los pesos de atención y la cabeza de clasificación en FP16 (~55 MB), y los pesos congelados del BERT base se reconstruyen en tiempo de carga desde `bert-base-uncased`.

El modelo es pequeño (110 M parámetros del backbone BERT-Base), monolingüe (inglés), con licencia MIT y pensado para inferencia de clasificación de texto, no para generación. No es un modelo conversacional ni soporta tool calling, agentes ni contexto largo extendido: es un clasificador de secuencias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base con atención `full_attention` (subcuadrática) en las 12 capas |
| Parámetros totales | 110 M (backbone BERT-Base; no se especifica el recuento exacto tras la sustitución) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (BERT-Base estándar: 512 tokens; no confirmado en la model card) |
| Tipos de cuantización | pesos de atención en FP16; no se documentan otras cuantizaciones |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16, attention-only, ~55 MB) + reconstrucción de base BERT congelado |

## Arquitectura y entrenamiento

La arquitectura es un encoder BERT-Base de 12 capas en el que la atención multi-cabeza estándar (O(N²)) se reemplaza por el mecanismo `full_attention` de NeuralOps, con complejidad efectiva O(N) u O(N log N). El repositorio no re-exporta los 450 MB del backbone: almacena únicamente los pesos de atención entrenados y la cabeza de clasificación en FP16 (~55 MB), y un shim de código remoto (`modeling_neuralops_bert.py`) inicializa los pesos base congelados desde `bert-base-uncased` y aplica encima los parámetros destilados.

El entrenamiento sigue el "NeuralOps Cached Representation Distillation Protocol": destilación en dos etapas (alineamiento de subespacio oculto y luego KL de logits más entropía cruzada de tarea), con el profesor cacheado offline para evitar asignar VRAM al profesor. Se ejecutó en una NVIDIA GeForce RTX 3090 (24 GB), con 257 pasos de optimización, 47,2 s de duración, throughput efectivo de 44.578,5 tokens/s y pico de VRAM de 13.512 MB. El dataset es GLUE/SST-2 (clasificación binaria de sentimiento, split de validación de 872 muestras).

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés, tarea SST-2.
- Clasificación de secuencias cortas y medias propia de BERT-Base.
- Inferencia con `transformers` (`AutoModelForSequenceClassification`, `trust_remote_code=True`) y con la API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`).
- Carga modular de solo pesos de atención sobre el backbone congelado.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta generación de texto, código, matemáticas, visión ni audio.
- Capacidad multilingüe: no (solo inglés).

## Casos de uso

- Análisis de sentimiento de reseñas de producto en inglés: el modelo clasifica secuencias cortas en positivo/negativo con ~91,86 % de accuracy en SST-2, adecuado para pipelines de moderación o analítica de opiniones.
- Filtrado de comentarios en foros y redes: clasificación rápida de tono por comentario, con un footprint de descarga de ~55 MB más el backbone base, lo que simplifica el despliegue en servicios de bajo coste.
- Monitorización de reputación de marca: procesamiento por lotes de menciones en inglés para agregar polaridad y detectar picos negativos.
- Etiquetado automático para curación de datasets: pre-etiquetar grandes volúmenes de texto en inglés antes de revisión humana, aprovechando el bajo coste de inferencia de un encoder de 110 M.
- Investigación sobre atención subcuadrática: servir de checkpoint de referencia para comparar `full_attention` frente a atención cuadrática estándar en GLUE, con la ventaja de que solo se cargan los pesos de atención.
- Evaluación de pipelines de destilación: usar el protocolo de destilación en dos etapas como baseline reproducible en tareas de clasificación de texto.
- Clasificación dentro de sistemas de enrutamiento: decidir si un texto en inglés es positivo o negativo antes de derivarlo a otro componente del sistema.

## Benchmarks y rendimiento

Evaluación sobre el split de validación de GLUE SST-2 (872 muestras binarias), según la model card:

| Métrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 91,63 % | 91,86 % | +0,23 % |
| Entropía cruzada de validación | 0,2428 | no calibrada | 0,3184 | convergido |

Telemetría de entrenamiento: RTX 3090 24 GB, 257 pasos, 47,2 s, 44.578,5 tokens/s, pico de VRAM 13.512 MB. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, el backbone BERT-Base de 110 M ocupa aproximadamente 220 MB de pesos, más los ~55 MB de atención y cabeza; el pico de entrenamiento reportado fue de 13.512 MB, pero la inferencia requiere bastante menos (no se publica cifra exacta).
- GPU recomendadas: cualquier GPU con al menos ~1-2 GB de VRAM libre para FP16; el entrenamiento se realizó en RTX 3090.
- Cabe en GPU de consumo: sí, en GTX 1060/1660, RTX 2060, RTX 3060, RTX 4090 y similares.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y la librería `neuralops`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras de inferencia; el throughput de entrenamiento reportado es de 44.578,5 tokens/s en RTX 3090.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (accuracy) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-full-attention-sst2` | 110 M (backbone) | no disponible | 91,86 % | MIT | Hugging Face, requiere `neuralops` |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 tokens | 91,63 % (referencia en la card) | Apache 2.0 | Hugging Face, `transformers` estándar |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 tokens | no disponible en la información | Apache 2.0 | Hugging Face, `transformers` estándar |

La comparativa se limita a los datos de la model card; no se dispone de resultados de benchmarks de las alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo monolingüe: solo inglés; no se ha evaluado en otros idiomas.
- Tarea única: clasificación binaria de sentimiento; no sirve para generación, razonamiento ni otras tareas de NLP sin reentrenamiento.
- Riesgo de sesgos heredados del corpus GLUE/SST-2 y de `bert-base-uncased`, no evaluados en la model card.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas en dominios distintos al de entrenamiento (dominio shift).
- La longitud de contexto no se documenta explícitamente; se asume la de BERT-Base (512 tokens), pero no está confirmado.
- Requiere `trust_remote_code=True` y la librería `neuralops`, lo que añade dependencia de código remoto y superficie de riesgo en producción.
- La carga reconstruye el backbone desde `bert-base-uncased`, por lo que se necesita acceso a ese repositorio y a sus pesos congelados.
- El identificador del repositorio en la model card (`tahamajs/...`) no coincide con el ID de Hugging Face (`Hooshaai/...`); conviene verificar la ruta correcta antes de desplegar.
- Licencia MIT permite uso comercial, pero el código remoto y la librería NeuralOps deben revisarse por separado.
- El modelo tiene 83 descargas y 0 likes; no hay evidencia de validación independiente fuera de la model card.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-full-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Dataset GLUE: https://huggingface.co/datasets/glue
- Dataset SST-2: https://huggingface.co/datasets/sst2
