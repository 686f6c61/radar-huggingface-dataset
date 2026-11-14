# Hooshaai/bert-hgrn2-gated-layer-sst2

## Resumen

`bert-hgrn2-gated-layer-sst2` es un checkpoint de clasificación de sentimiento en inglés publicado por el usuario Hooshaai (el model card cita como autor a Taha Majlesi y el repositorio NeuralOps). El modelo parte de `google-bert/bert-base-uncased` y sustituye los bloques de atención softmax cuadrática de sus 12 capas por el mecanismo `hgrn2_gated_layer` de la librería NeuralOps, una atención subcuadrática de complejidad efectiva O(N) u O(N log N) frente a la O(N²) de la multi-head attention estándar.

El checkpoint se ha destilado sobre la tarea SST-2 del benchmark GLUE mediante el protocolo *Cached Representation Distillation* de NeuralOps, que cachea offline las representaciones del profesor para no reservar VRAM adicional durante el entrenamiento. Según la model card, el proceso se ejecutó en una única RTX 3090 de 24 GB en 74,9 segundos y 12 pasos de optimización, alcanzando un 91,28 % de accuracy en el split de validación de SST-2, frente al 91,63 % del profesor BERT-base original.

La relevancia del modelo es fundamentalmente metodológica: demuestra que es posible reemplazar la atención cuadrática de un transformer preentrenado por un mecanismo lineal/gated y recuperar prácticamente el rendimiento del profesor con un coste de destilación mínimo. No es un modelo generativo ni un LLM, sino un clasificador binario de frases con una huella de pesos muy reducida (~55 MB en FP16) y licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-base (transformer encoder, 12 capas) con atención `hgrn2_gated_layer` subcuadrática en todas las capas |
| Parametros totales | ~110 M (base BERT-base-uncased); el repo solo serializa los pesos de atención y la cabeza de clasificación |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible explícitamente; hereda la configuración de `bert-base-uncased` (512 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, FP16, ~55 MB) + código remoto (`modeling_neuralops_bert.py`) |
| Libreria | `neuralops` (compatible con `transformers` mediante `trust_remote_code=True`) |
| Tarea | `text-classification` (SST-2, binaria) |
| Tamano del repo | ~0,6 GB |

## Arquitectura y entrenamiento

El modelo mantiene el esqueleto de BERT-base (12 capas, hidden size 768, 110 M parámetros) pero reemplaza en cada capa el bloque de self-attention softmax por el mecanismo `hgrn2_gated_layer` de NeuralOps, que reduce la complejidad operativa efectiva de O(N²) a O(N) u O(N log N). Los pesos base de BERT permanecen congelados; el repositorio solo contiene los parámetros de atención destilados y la cabeza de clasificación, que se inyectan en tiempo de carga mediante el shim de código remoto.

El entrenamiento sigue el *NeuralOps Cached Representation Distillation Protocol* en dos etapas: primero una alineación de subespacio oculto (Stage 1) y después una combinación de KL sobre logits y cross-entropy de tarea (Stage 2). Se ejecutó en una NVIDIA RTX 3090 de 24 GB, con 12 pasos de optimización, 74,9 s de duración, throughput de 1312,6 tokens/s y un pico de VRAM de 12 628 MB. La destilación se realizó sobre SST-2 (GLUE), con el profesor `bert-base-uncased` fine-tuneado como referencia.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés, orientada a frases cortas tipo SST-2.
- Inferencia con complejidad subcuadrática: escalado lineal o cuasi-lineal con la longitud de secuencia frente a la atención cuadrática de BERT estándar.
- Carga modular: solo se descargan ~55 MB de pesos de atención y cabeza; el resto se reconstruye desde `bert-base-uncased`.
- Integración con `transformers` (`AutoModelForSequenceClassification` con `trust_remote_code=True`) y con la API de alto nivel `neuralops.hub` (`load_pretrained_bert`, `load_surgeried_model`).
- No soporta tool calling, function calling, agentes, generación de texto, código, matemáticas, visión ni audio: es un clasificador, no un modelo generativo.
- Capacidad multilingüe: no disponible (solo inglés).

## Casos de uso

- Análisis de sentimiento de reseñas de producto: el modelo clasifica frases cortas en positivo/negativo con una precisión de ~91 % en SST-2, adecuado para pipelines de moderación o scoring de opiniones a bajo coste de inferencia.
- Filtrado de comentarios en foros y redes: al usar atención subcuadrática, el coste de procesar lotes largos de frases es menor que con BERT-base estándar, útil para clasificación masiva en tiempo casi real.
- Investigación sobre atención eficiente: sirve como checkpoint de referencia para reproducir y comparar mecanismos `hgrn2_gated_layer` frente a atención softmax en tareas GLUE, con pesos de solo ~55 MB fáciles de versionar.
- Prototipado rápido en entornos con poca VRAM: al cargar sobre BERT-base congelado y solo ~55 MB de pesos destilados, el modelo puede ejecutarse en GPUs de gama media o incluso en CPU para lotes pequeños.
- Docencia y experimentación con destilación: el protocolo documentado (12 pasos, 74,9 s en una RTX 3090) permite replicar el flujo de destilación con recursos modestos.
- Base para fine-tuning ligero en dominios específicos: la cabeza de clasificación y los pesos de atención pueden adaptarse a otros datasets de sentimiento en inglés sin recargar todo el modelo base.

## Benchmarks y rendimiento

Evaluación publicada en la model card sobre el split de validación de SST-2 (872 muestras):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`hgrn2_gated_layer`) | Modelo destilado |
|---|---:|---:|---:|
| Accuracy SST-2 | 91,63 % | 91,06 % | 91,28 % |
| Cross-entropy de validación | 0,2428 | no calibrado | 0,2281 |

Delta de accuracy del modelo destilado frente al profesor: +0,23 %. No se han publicado resultados en otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el pico durante el entrenamiento fue de 12 628 MB en una RTX 3090, pero la inferencia de un BERT-base con pesos de atención FP16 debería requerir bastante menos.
- GPU recomendadas: cualquier GPU con al menos ~4-8 GB de VRAM para lotes pequeños; RTX 3090, RTX 4090, A100 o H100 para throughput alto.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060/4060 y superiores, dado el tamaño del modelo base (110 M parámetros) y los ~55 MB de pesos adicionales.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`, librería `neuralops` (`load_pretrained_bert`, `load_surgeried_model`). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: durante el entrenamiento se registraron 1312,6 tokens/s en una RTX 3090; no hay datos de latencia de inferencia publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---|---:|---|---|
| `bert-hgrn2-gated-layer-sst2` | ~110 M (base) + ~55 MB destilados | no disponible (hereda 512 de BERT-base) | 91,28 % | MIT | Hugging Face (`Hooshaai/...`) |
| `google-bert/bert-base-uncased` (profesor fine-tuneado SST-2) | 110 M | 512 | 91,63 % | Apache 2.0 | Hugging Face |
| BERT-base estándar con atención softmax | 110 M | 512 | ~91 % (referencia GLUE) | Apache 2.0 | Hugging Face |

No se dispone de datos comparativos con otros mecanismos de atención subcuadrática (por ejemplo, variantes Linear Attention o Performer) en la información proporcionada.

## Limitaciones y advertencias

- Modelo específico para clasificación binaria de sentimiento en inglés; no es un modelo generativo ni un LLM.
- Solo se ha evaluado en SST-2; el rendimiento en otros dominios o datasets de sentimiento no está documentado.
- Riesgo de sesgos heredados de `bert-base-uncased` y del dataset SST-2 (dominio de reseñas de cine, registro formal).
- Riesgo de alucinación no aplica en sentido generativo, pero puede haber clasificaciones erróneas en frases ambiguas, sarcasmo o dominio fuera de distribución.
- Requiere `trust_remote_code=True` y la librería `neuralops`; el código remoto debe auditarse antes de usarlo en producción.
- El model card cita el repositorio `tahamajs/bert-hgrn2-gated-layer-sst2`, mientras que el ID real en Hugging Face es `Hooshaai/bert-hgrn2-gated-layer-sst2`; conviene verificar la ruta correcta al cargar.
- La licencia MIT permite uso comercial, pero la licencia del modelo base (`bert-base-uncased`, Apache 2.0) también debe respetarse.
- Solo 52 descargas y 0 likes en el momento de la consulta: ecosistema pequeño y poca validación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-hgrn2-gated-layer-sst2
- Modelo base: https://huggingface.co/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE / SST-2: https://gluebenchmark.com/
