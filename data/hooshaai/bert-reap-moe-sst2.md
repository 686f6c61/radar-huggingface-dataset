# Hooshaai/bert-reap-moe-sst2

## Resumen

`bert-reap-moe-sst2` es un checkpoint de clasificación de sentimiento derivado de `google-bert/bert-base-uncased` en el que las doce capas de atención softmax cuadrática originales se han sustituido por el mecanismo `reap_moe`, una atención subcuadrática implementada en la librería NeuralOps. El autor es Hooshaai (Taha Majlesi, según la cita del repositorio) y el modelo se distribuye bajo licencia MIT. El problema que aborda es la reducción de la complejidad computacional de la atención (de O(N²) a O(N) u O(N log N) efectivos) manteniendo la calidad de clasificación mediante destilación de representaciones desde el modelo profesor original.

El modelo no se publica como un transformer completo, sino como un conjunto modular de pesos de atención y cabeza de clasificación en FP16 (`attention_weights.safetensors`, unos 55 MB). El código remoto (`modeling_neuralops_bert.py`) reconstruye la base BERT congelada desde `bert-base-uncased` y aplica encima los pesos destilados. Está especializado exclusivamente en clasificación binaria de sentimiento sobre SST-2 (GLUE), con idioma inglés y una ventana de contexto heredada de BERT-Base.

Su relevancia actual es acotada pero técnica: sirve como referencia reproducible de sustitución de atención cuadrática por alternativas subcuadráticas en un modelo pequeño (110 M de parámetros), con un protocolo de destilación que evita asignar VRAM al profesor (caché offline de representaciones) y con métricas de entrenamiento publicadas (240 pasos, 49,5 s en una RTX 3090, 39 720 tokens/s).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-Base con atención subcuadrática `reap_moe` (sustituye MHA en las 12 capas) |
| Parametros totales | 110 M (base `bert-base-uncased`) + cabeza de clasificación; los pesos publicados en el repo son solo atención + cabeza (~55 MB en FP16) |
| Parametros activos | no disponible (no se documenta el enrutamiento del componente MoE) |
| Longitud de contexto | no disponible explícitamente; heredada de BERT-Base (512 tokens) |
| Tipos de cuantizacion | no disponible (los pesos se publican en FP16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, FP16, serialización `attention_only_fp16`) |
| Libreria | `neuralops` (con `trust_remote_code=True` en Transformers) |
| Modelo base | `google-bert/bert-base-uncased` |
| Tarea | `text-classification` (binaria, SST-2) |
| Dataset de evaluación | GLUE / SST-2 (split de validación, 872 muestras) |
| Tamano del repo | 0,2 GB |

## Arquitectura y entrenamiento

La arquitectura parte de BERT-Base (12 capas, 110 M de parámetros, encoder transformer bidireccional) y reemplaza en cada capa el bloque de multi-head attention estándar por el mecanismo `reap_moe` de NeuralOps, que el autor describe como de complejidad operativa efectiva O(N) u O(N log N) frente a la O(N²) de la atención softmax cuadrática. Los pesos base de BERT permanecen congelados; solo se entrenan y serializan los parámetros de atención y la cabeza de clasificación, lo que explica el tamaño reducido del artefacto (~55 MB) frente a los ~450 MB de BERT-Base completo.

El entrenamiento sigue el protocolo "NeuralOps Cached Representation Distillation", una destilación en dos etapas: primero alineamiento de subespacio oculto y después KL sobre logits más entropía cruzada de la tarea. El profesor (`bert-base-uncased` afinado) no ocupa VRAM durante el entrenamiento porque sus representaciones se cachean offline. La ejecución física se realizó en una NVIDIA GeForce RTX 3090 de 24 GB, con 240 pasos de optimización, 49,5 s de duración total, throughput efectivo de 39 720,3 tokens/s y un pico de VRAM de 8365 MB.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés sobre texto tipo SST-2.
- Atención subcuadrática: el mecanismo `reap_moe` reduce el coste asintótico respecto a la atención cuadrática, lo que en teoría favorece secuencias largas.
- Carga modular: reconstruye la base BERT congelada y aplica encima los pesos de atención destilados mediante código remoto.
- Integración con la API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`) además de `AutoModelForSequenceClassification`.
- No soporta generación de texto, tool calling, agentes, visión, audio ni razonamiento multi-paso: es un clasificador de secuencia.
- Capacidad multilingüe: no; solo inglés.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: clasificación binaria de opiniones en inglés con un modelo de 110 M que cabe en cualquier GPU consumer y se carga en segundos.
- Moderación de comentarios a escala: al ser un clasificador pequeño y con atención subcuadrática, puede desplegarse en CPU/GPU de gama baja para filtrar grandes volúmenes de texto en inglés.
- Investigación en atención eficiente: sirve como punto de comparación reproducible frente a BERT-Base estándar en SST-2 (91,74 % frente a 91,63 %) para estudiar el impacto de sustituir MHA por mecanismos subcuadráticos.
- Destilación con profesor offline: el protocolo de caché de representaciones permite reproducir el entrenamiento sin necesidad de una GPU grande para el profesor, útil en entornos con VRAM limitada.
- Pipeline de clasificación en producción con Transformers: se integra con `AutoModelForSequenceClassification` y `trust_remote_code=True`, lo que facilita su uso en servicios de inferencia existentes basados en Hugging Face.
- Benchmark de referencia para el zoo de atención de NeuralOps: permite validar que una atención subcuadrática mantiene la precisión de la tarea antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Evaluación publicada por el autor sobre el split de validación de GLUE SST-2 (872 muestras):

| Metrica | Teacher (`bert-base-uncased`) | Student pre-KD (`reap_moe`) | Modelo destilado |
|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 91,63 % | 91,74 % (+0,11 %) |
| Cross-entropy de validación | 0,2428 | no calibrada | 0,2696 |

Telemetría de entrenamiento (RTX 3090, 24 GB):

| Metrica | Valor |
|---|---|
| Duracion del entrenamiento | 49,5 s |
| Pasos de optimizacion | 240 |
| Throughput efectivo | 39 720,3 tokens/s |
| Pico de VRAM | 8365 MB |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: el artefacto publicado ocupa ~55 MB en FP16, pero al reconstruir la base BERT congelada el consumo real se aproxima al de BERT-Base (~110 M de parámetros, del orden de 0,5-1 GB en FP16/FP32 incluyendo activaciones para secuencias cortas).
- GPU recomendadas: cualquier GPU con al menos ~2 GB de VRAM; el autor validó el entrenamiento en una RTX 3090, pero la inferencia cabe en GPUs consumer mucho menores (GTX 1650, RTX 3060, etc.).
- Cabe en GPU consumer: sí, con holgura.
- Opciones de despliegue: Transformers con `trust_remote_code=True`, API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras de inferencia; solo la telemetría de entrenamiento (39 720,3 tokens/s en RTX 3090).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-reap-moe-sst2` | 110 M (base) + atención `reap_moe` | no disponible (heredado de BERT-Base) | 91,74 % | MIT | Hugging Face, requiere `trust_remote_code` |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 tokens | 91,63 % | Apache 2.0 | Hugging Face, estándar |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 tokens | no disponible en la información | Apache 2.0 | Hugging Face, estándar |

La comparativa se limita a los datos publicados; no se dispone de resultados de benchmarks de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en clasificación binaria de sentimiento en inglés; no sirve para generación, razonamiento, código ni otras tareas.
- Requiere `trust_remote_code=True` y la librería `neuralops`, lo que añade una dependencia de código de terceros y riesgo de seguridad en producción.
- El artefacto publicado no es un modelo completo: hay que reconstruir la base `bert-base-uncased` en tiempo de carga, lo que introduce dependencia de la disponibilidad de ese checkpoint.
- La mejora sobre el profesor es marginal (+0,11 % en accuracy) y se mide solo en el split de validación de SST-2 (872 muestras); no hay evaluación en otros conjuntos.
- La cross-entropy del estudiante destilado (0,2696) es peor que la del profesor (0,2428), lo que sugiere una calibración de probabilidades inferior aunque la accuracy sea similar.
- No se documentan sesgos específicos, pero al derivar de BERT-Base en inglés hereda los sesgos de su corpus de entrenamiento.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador), pero sí de clasificaciones erróneas en dominios alejados de SST-2.
- Licencia MIT permite uso comercial, pero conviene verificar la licencia de la base `bert-base-uncased` (Apache 2.0) y del código NeuralOps.
- El modelo tiene muy poca tracción (58 descargas, 0 likes) y fue creado en noviembre de 2026; no hay validación independiente de los resultados.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-reap-moe-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Dataset GLUE / SST-2: no disponible enlace directo en la información proporcionada
- Paper o blog adicional: no disponible
