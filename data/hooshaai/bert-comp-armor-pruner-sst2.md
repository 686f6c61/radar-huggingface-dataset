# Hooshaai/bert-comp-armor-pruner-sst2

## Resumen

`bert-comp-armor-pruner-sst2` es un checkpoint comprimido de `google-bert/bert-base-uncased` afinado para clasificación de sentimiento en GLUE SST-2 y comprimido con el motor `ARMORPruner` de la librería NeuralOps. Lo publica el usuario Hooshaai bajo el paraguas del "NeuralOps Compressed & LoRA-Healed Model Zoo", un proyecto que empaqueta variantes comprimidas de modelos conocidos con telemetría reproducible de compresión.

El modelo resuelve un problema muy concreto: reducir el coste de almacenamiento e inferencia de un BERT-Base sin perder prácticamente precisión en una tarea downstream. En el rango seleccionado (`k=256`) el checkpoint pasa de 109,5 M a 152,0 M de parámetros serializados, lo que se traduce en una ratio de compresión física de 0,72x (un 38,8 % menos de parámetros efectivos según la telemetría del autor) manteniendo una accuracy del 91,40 % frente al 91,63 % del profesor original, una diferencia de solo 0,23 puntos.

Es relevante ahora porque ejemplifica una tendencia práctica: en lugar de reentrenar modelos pequeños desde cero, se comprime un modelo maduro y se "sana" con LoRA cuando la caída de precisión supera un umbral. El repo ocupa 0,3 GB, la licencia es MIT y el pipeline declarado es `text-classification` en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base (12 capas, dimensión oculta 768), comprimido con ARMORPruner |
| Parametros totales | 151.951.106 (checkpoint comprimido serializado); modelo base original: 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (BERT-Base estándar admite hasta 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en `pytorch_model.bin` en precisión completa; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`), más `config.json`, `compression_summary.json` y assets del tokenizer |

## Arquitectura y entrenamiento

La arquitectura subyacente es BERT-Base uncased: un transformer encoder de 12 capas con dimensión oculta 768 y 109.483.778 parámetros, preentrenado por Google y afinado aquí sobre GLUE SST-2 (clasificación binaria de sentimiento). Sobre ese modelo se aplica `ARMORPruner`, el compresor de la familia `pruning` de NeuralOps (implementación en `neuralops/compression/pruning/armor_pruner.py`). El checkpoint publicado corresponde al rango `k=256`, con ratio de compresión física 0,72x y una reducción declarada del 38,79 % de parámetros.

El proceso de compresión se evalúa en una NVIDIA GeForce RTX 3090 (24 GB) sobre el split de validación de SST-2 (872 muestras). La política de NeuralOps es aplicar "LoRA healing" (r=8, 50 pasos, lr=2e-4, presupuesto de 45 s) únicamente cuando la compresión zero-shot degrada la accuracy más de 2,0 puntos con una reducción superior a 1,10x. En el rango `k=256` publicado, el autor indica `LoRA Recovery Applied: False`, es decir, el checkpoint se sirve sin adaptadores de recuperación porque la caída zero-shot ya era de solo 0,23 puntos. Se documentan también los rangos `k=128`, `k=64` y `k=32` en `compression_summary.json`, pero solo el `k=256` está serializado en este repositorio.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés, específicamente sobre la distribución de GLUE SST-2.
- Inferencia estándar de `BertForSequenceClassification` con dos etiquetas de salida.
- Compatible con el pipeline `text-classification` de Hugging Face y con la API universal `neuralops.hub.load_surgeried_model`.
- Carga mediante reconstrucción explícita: se instancia el BERT base, se aplica `compress_model` con `armor_pruner` y `rank=256`, y se carga el `state_dict` con `strict=False`.
- No se documentan capacidades de tool calling, agentes, generación de texto libre, matemáticas, visión, audio ni modo de razonamiento extendido; el modelo es exclusivamente un clasificador.
- Capacidades multilingües: no. Solo inglés.

## Casos de uso

- Moderación de comentarios en inglés: clasificar automáticamente opiniones de usuarios como positivas o negativas en foros, reseñas o tickets, aprovechando que el modelo mantiene el 91,40 % de accuracy del profesor con un 38,8 % menos de parámetros serializados.
- Análisis de sentimiento en pipelines de CI/CD de bajo coste: al ocupar 0,3 GB en disco y ser un BERT-Base comprimido, se puede empaquetar en imágenes de contenedor ligeras para tests de regresión de modelos de NLP.
- Enriquecimiento de reseñas de producto a escala: procesar lotes de reseñas en inglés y agregar polaridad por producto o categoría, con una latencia de inferencia propia de BERT-Base en GPU consumer.
- Filtrado previo en sistemas de atención al cliente: etiquetar mensajes entrantes como queja o elogio antes de enrutarlos a un agente humano o a un modelo generativo mayor, reduciendo el coste por consulta.
- Investigación en compresión de modelos: servir como referencia reproducible del efecto de `ARMORPruner` a distintos rangos (`k=256, 128, 64, 32`) para comparar curvas de Pareto precisión/compresión.
- Docencia y experimentación con BERT: ejemplo autocontenido de cómo comprimir, serializar y recargar un BERT afinado sin necesidad de GPUs de gama alta.
- Detección de polaridad en redes sociales o encuestas: clasificación rápida de textos cortos en inglés donde el contexto largo no es necesario.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (`verified: false`):

| Modelo / rango | Ratio físico | Params comprimidos (reducción) | Accuracy SST-2 (val) | Paridad vs profesor (91,63 %) |
|---|---:|---:|---:|---:|
| Profesor BERT-Base SST-2 | 1,00x | 109.483.778 | 91,63 % | — |
| **`k=256` (publicado)** | 0,72x | 151.951.106 (−38,8 %) | **91,40 %** | −0,23 % |
| `k=128` | 0,84x | 130.717.442 (−19,4 %) | 90,83 % | −0,80 % |
| `k=64` | 0,91x | 120.100.610 (−9,7 %) | 89,79 % | −1,84 % |
| `k=32` | 0,95x | 114.792.194 (−4,8 %) | 88,42 % | −3,21 % |

Evaluación realizada sobre el split de validación de GLUE SST-2 (872 muestras) en una RTX 3090. No se publican resultados de MMLU, HumanEval, GSM8K ni otros benchmarks, ni comparaciones con modelos de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 289,9 MB en `pytorch_model.bin`, por lo que en fp32 ocupa aproximadamente 0,6 GB de VRAM; en fp16 alrededor de 0,3 GB. Cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU moderna sirve; el autor valida en RTX 3090 (24 GB), pero una RTX 3060, RTX 4060, T4 o incluso CPU son suficientes para clasificación por lotes.
- Cabe en GPU consumer: sí, en todas las gamas actuales.
- Opciones de despliegue: el flujo documentado es `transformers` + `neuralops` (reconstrucción con `compress_model` y carga con `strict=False`) o la API `neuralops.hub.load_surgeried_model`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no haber variantes GGUF no es directamente desplegable en llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño, se espera un throughput de miles de secuencias cortas por segundo en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Params | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| `Hooshaai/bert-comp-armor-pruner-sst2` (k=256) | 151.951.106 (comprimido) | no disponible | 91,40 % | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor) | 109.483.778 | 512 | 91,63 % | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~67 M | 512 | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 109.483.778 | 512 | no disponible en esta ficha | Apache 2.0 | Hugging Face |

La comparación con DistilBERT y con el BERT afinado de TextAttack es cualitativa: no se dispone de sus cifras exactas en SST-2 dentro de la información proporcionada, por lo que no se incluyen números para evitar inventar datos. La ventaja principal del checkpoint de NeuralOps es la telemetría de compresión reproducible y la licencia MIT, aunque el "ahorro" declarado del 38,8 % se refiere a parámetros efectivos tras la descomposición low-rank, no al tamaño del archivo serializado, que sigue siendo comparable al del BERT original.

## Limitaciones y advertencias

- El checkpoint está especializado exclusivamente en clasificación binaria de sentimiento en inglés; no sirve para generación, QA, NER ni otras tareas sin reentrenamiento.
- El número de parámetros del checkpoint comprimido (151,9 M) es mayor que el del modelo base (109,5 M): la "compresión" se refiere a parámetros efectivos tras la descomposición, no a un archivo más pequeño. Conviene no confundir ambos conceptos.
- Los resultados de accuracy (91,40 %) están marcados como `verified: false` en la model card; no han sido validados por un tercero.
- Riesgo de alucinación: bajo en el sentido generativo (no genera texto libre), pero puede producir clasificaciones erróneas en dominios alejados de SST-2 (crítica de cine en inglés), como sarcasmo, jerga o textos muy largos.
- Sesgos heredados de `bert-base-uncased` y del corpus SST-2: vocabulario de reseñas cinematográficas, posible sesgo demográfico y de dominio.
- Requiere la librería `neuralops` para reconstruir la topología comprimida; no es un `BertForSequenceClassification` estándar cargable solo con `transformers`.
- La licencia MIT del repo de NeuralOps aplica al código; el modelo base de Google es Apache 2.0, por lo que conviene revisar la compatibilidad si se redistribuye.
- No hay variantes GGUF ni cuantizadas publicadas, lo que limita el despliegue en entornos sin PyTorch.
- El autor del repo (`Hooshaai`) y el de la model card (`tahamajs`) no coinciden en el identificador del repo en los ejemplos de código (`tahamajs/bert-comp-armor-pruner-sst2`); verificar la ruta correcta antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-comp-armor-pruner-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de ARMORPruner: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/pruning/armor_pruner.py
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
