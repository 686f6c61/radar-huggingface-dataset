# Hooshaai/bert-padre-attention-sst2

## Resumen

`Hooshaai/bert-padre-attention-sst2` es un checkpoint de clasificación de sentimiento derivado de `google-bert/bert-base-uncased` en el que se han sustituido los bloques de atención softmax cuadrática de las 12 capas del transformer por el mecanismo `padre_attention`, implementado en la librería NeuralOps. El objetivo es demostrar que es posible mantener la precisión de un BERT-Base estándar en una tarea GLUE (SST-2) reduciendo la complejidad operativa de la atención de O(N²) a O(N) o O(N log N), lo que resulta relevante para escenarios de inferencia con secuencias largas y presupuestos de memoria ajustados.

El modelo se distribuye en un formato poco habitual: solo se publican los pesos de atención y la cabeza de clasificación en FP16 (aproximadamente 55 MB en `attention_weights.safetensors`), mientras que los pesos congelados del BERT-Base original (unos 110 millones de parámetros) se inicializan en tiempo de carga desde `bert-base-uncased` mediante un shim de código remoto. Esto reduce drásticamente el tamaño del repositorio (0,1 GB frente a los ~450 MB de un BERT-Base completo) y encaja en la filosofía de serialización modular del proyecto NeuralOps.

La relevancia actual del checkpoint es doble: por un lado, sirve como referencia empírica de que la destilación de representaciones en caché (NeuralOps Cached Representation Distillation Protocol) permite alinear un estudiante con atención subcuadrática con un profesor cuadrático sin asignar VRAM adicional para el profesor; por otro, demuestra la viabilidad de publicar adaptadores de atención independientes reutilizables sobre arquitecturas preentrenadas. El modelo está entrenado y evaluado únicamente en inglés y su licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base con atención `padre_attention` (subcuadrática, O(N) u O(N log N)) en las 12 capas |
| Parametros totales | 110 millones (BERT-Base); el repositorio solo publica los pesos de atención y la cabeza de clasificación (~55 MB en FP16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base BERT-Base soporta 512 tokens, pero la model card no lo especifica para este checkpoint) |
| Tipos de cuantizacion | No disponible (los pesos se publican en FP16; no se documentan otras cuantizaciones) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, FP16) con código remoto (`modeling_neuralops_bert.py`) que reconstruye el modelo completo |

## Arquitectura y entrenamiento

La arquitectura es un BERT-Base estándar (12 capas, 768 dimensiones ocultas, 12 cabezas de atención, ~110 M de parámetros) en el que se reemplaza la atención multi-cabeza softmax cuadrática por `padre_attention`, un mecanismo de atención subcuadrática implementado en la librería NeuralOps. El modelo conserva la pila de encoder y la cabeza de clasificación binaria de SST-2, pero los pesos publicados se limitan a la atención destilada y a la cabeza de tarea; el resto se carga congelado desde `bert-base-uncased`.

El entrenamiento sigue el NeuralOps Cached Representation Distillation Protocol en dos etapas: primero una alineación de subespacio oculto (Stage 1 Subspace Hidden Alignment) y después una combinación de KL sobre logits y entropía cruzada de tarea (Stage 2 Logit KL + Task CE). El profesor es `bert-base-uncased` y las representaciones se cachean offline, de modo que el profesor no consume VRAM durante la destilación. La ejecución física se realizó en una NVIDIA GeForce RTX 3090 de 24 GB del clúster Sharif HPC: 210 pasos de optimización, 49,4 segundos de duración total, throughput efectivo de 34 854,9 tokens/s y un pico de VRAM de 8615 MB. El dataset de evaluación y ajuste es la partición de validación de GLUE SST-2 (872 muestras de clasificación binaria).

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) sobre texto en inglés, con una precisión reportada del 91,51 % en la validación de SST-2.
- Inferencia con atención subcuadrática: la complejidad operativa de la atención es O(N) u O(N log N), lo que reduce el coste computacional frente a la atención cuadrática en secuencias largas.
- Carga modular: los pesos de atención y la cabeza de tarea se pueden aplicar sobre un BERT-Base congelado mediante el shim de código remoto o la API `load_pretrained_bert` de NeuralOps.
- Integración con `transformers` mediante `AutoModelForSequenceClassification` con `trust_remote_code=True`.
- No se documentan capacidades de generación de texto, razonamiento multi-paso, tool calling, agentes, visión, audio ni modo thinking; el modelo es exclusivamente un clasificador de secuencias.
- Multilingüismo: solo inglés; no se reportan capacidades en otros idiomas.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: el modelo clasifica reseñas en inglés en positivas o negativas con una precisión del 91,51 % en SST-2, adecuado para pipelines de monitorización de opiniones a gran escala.
- Moderación de comentarios en foros y redes: permite filtrar automáticamente comentarios con tono negativo en inglés, con un coste de inferencia bajo gracias a la atención subcuadrática.
- Enrutamiento de tickets de soporte: clasificar el sentimiento de mensajes entrantes para priorizar casos insatisfechos antes de que lleguen a un agente humano.
- Investigación sobre atención eficiente: sirve como checkpoint de referencia para comparar `padre_attention` frente a atención softmax estándar en tareas de clasificación GLUE, con métricas reproducibles en la model card.
- Destilación y adaptación modular: el formato de pesos solo-atención permite sustituir el mecanismo de atención de un BERT-Base congelado sin reentrenar el backbone, útil para experimentos de eficiencia computacional.
- Análisis de sentimiento en series temporales de texto corto (tuits, titulares): la ventana de 512 tokens del BERT-Base cubre la mayoría de estos casos y el modelo está ajustado específicamente para secuencias cortas de SST-2.
- Evaluación de pipelines de despliegue: al publicarse en FP16 y con un footprint de ~55 MB, es útil para probar integraciones con `transformers`, vLLM u otros servidores de inferencia en entornos con recursos limitados.

## Benchmarks y rendimiento

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`padre_attention`) | Modelo destilado post-KD | Delta |
|---|---|---|---|---|
| GLUE SST-2 Accuracy | 91,63 % | 91,74 % | 91,51 % | -0,23 % |
| Validation Cross-Entropy | 0,2428 | No calibrado | 0,2791 | Convergido |

Datos de entrenamiento reportados en la model card: 210 pasos de optimización, 49,4 s de duración, 34 854,9 tokens/s de throughput efectivo y 8615 MB de pico de VRAM en una RTX 3090. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en FP16 requiere aproximadamente 220 MB de pesos (110 M de parámetros × 2 bytes) más activaciones; con la cabeza de clasificación y el tokenizador, cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento se realizó en una RTX 3090 de 24 GB con un pico de 8615 MB, pero la inferencia es mucho más ligera.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (soporte oficial documentado), API `load_pretrained_bert` de NeuralOps y `load_surgeried_model` del hub universal de NeuralOps. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras de latencia de inferencia; el throughput de entrenamiento reportado es de 34 854,9 tokens/s en una RTX 3090.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 Accuracy | Licencia | Formato |
|---|---|---|---|---|---|
| `Hooshaai/bert-padre-attention-sst2` | 110 M (solo atención publicada) | No disponible (base BERT: 512) | 91,51 % | MIT | safetensors FP16 + código remoto |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 | 91,63 % | Apache 2.0 | safetensors / PyTorch |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 | ~91 % (referencia habitual en la literatura) | Apache 2.0 | safetensors / PyTorch |
| `roberta-base` ajustado en SST-2 | 125 M | 512 | ~94-95 % (referencia habitual) | MIT | safetensors / PyTorch |

La comparativa se limita a modelos de la misma categoría (clasificadores BERT-like para SST-2). Las cifras de DistilBERT y RoBERTa son valores de referencia ampliamente citados, no mediciones directas de esta ficha; la model card solo aporta el dato del profesor y del estudiante. La principal ventaja diferencial del checkpoint es la atención subcuadrática y el formato modular de pesos, no una mejora de precisión.

## Limitaciones y advertencias

- Solo admite inglés; no se ha evaluado en otros idiomas y el tokenizador es el de `bert-base-uncased`.
- El modelo es exclusivamente un clasificador binario de sentimiento; no genera texto ni soporta tareas generativas, tool calling o razonamiento multi-paso.
- Riesgo de alucinación bajo en la tarea de clasificación, pero el modelo puede producir predicciones erróneas en dominios alejados de SST-2 (por ejemplo, sarcasmo, ironía o jerga técnica).
- La precisión reportada (91,51 %) se mide solo en la partición de validación de SST-2 (872 muestras); no hay evaluación en otros conjuntos de GLUE ni en dominios externos.
- El repositorio no incluye los pesos completos del BERT-Base: la carga depende de `trust_remote_code=True` y de la disponibilidad de `bert-base-uncased` en el Hub, lo que introduce un punto de fallo adicional en producción.
- La licencia MIT permite uso comercial, pero el modelo base `bert-base-uncased` está bajo Apache 2.0; conviene revisar la compatibilidad de ambas licencias en el contexto de uso.
- El mecanismo `padre_attention` es una implementación de la librería NeuralOps; no se documentan garantías de estabilidad de la API ni compatibilidad con versiones futuras de `transformers`.
- No se publican análisis de sesgos demográficos, toxicológicos ni de robustez adversarial; se recomienda auditar el modelo antes de desplegarlo en aplicaciones sensibles.
- El tamaño del repositorio (0,1 GB) y el formato solo-atención pueden dificultar la reproducibilidad si el shim de código remoto cambia o desaparece.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-padre-attention-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/glue
- Cita del autor: Majlesi, T. (2026), *NeuralOps: Pretrained BERT Subquadratic Attention Zoo on GLUE Benchmark*
