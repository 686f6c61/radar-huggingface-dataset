# Hooshaai/bert-griffin-ssd-sst2

## Resumen

`bert-griffin-ssd-sst2` es un checkpoint de clasificación de sentimiento en inglés publicado por el autor Hooshaai (referenciado en la model card como `tahamajs`) sobre la base de `google-bert/bert-base-uncased`. Se trata de un modelo BERT-Base de 110 millones de parámetros en el que los bloques de atención softmax cuadrática de las 12 capas del transformer han sido sustituidos por el mecanismo `griffin_ssd` de la librería NeuralOps, con complejidad subcuadrática efectiva O(N) o O(N log N) frente a la O(N²) de la multi-head attention estándar.

El modelo se ha afinado y destilado específicamente para la tarea SST-2 del benchmark GLUE mediante el protocolo NeuralOps Cached Representation Distillation, con alineamiento de representaciones offline y sin asignación de VRAM para el profesor. El resultado reportado es una accuracy del 91,40 % en el split de validación de SST-2, partiendo de un 88,99 % antes de la destilación y acercándose al 91,63 % del profesor BERT-Base original.

Su relevancia es fundamentalmente metodológica: sirve como demostración reproducible de cómo sustituir atención cuadrática por mecanismos subcuadráticos en un transformer preentrenado y recuperar la calidad mediante destilación, publicando únicamente los pesos de atención y la cabeza de clasificación (~55 MB en FP16) en lugar del modelo completo. La licencia es MIT y el idioma soportado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-Base con atención `griffin_ssd` subcuadrática en las 12 capas |
| Parametros totales | 110 millones (base `bert-base-uncased`); pesos publicados: solo atención y cabeza de clasificación (~55 MB FP16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de BERT-Base, típicamente 512 tokens; no confirmado en la información proporcionada) |
| Tipos de cuantizacion | Pesos publicados en FP16 (`attention_only_fp16`); no se documentan otros formatos |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`), serialización modular attention-only |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` (12 capas, 110 M parámetros, encoder bidireccional) y sustituye la atención softmax cuadrática por el mecanismo `griffin_ssd` de NeuralOps, que reduce la complejidad operativa a O(N) u O(N log N). Los pesos base de BERT permanecen congelados y se inicializan dinámicamente desde `bert-base-uncased` mediante el shim de código remoto (`modeling_neuralops_bert.py`); el repositorio almacena únicamente los parámetros de atención destilados y la cabeza de clasificación en FP16 (~55 MB), frente a los ~450 MB del modelo base completo.

El entrenamiento se realizó con el protocolo Cached Representation Distillation de NeuralOps en dos etapas: primero alineamiento de subespacio oculto y después KL sobre logits más entropía cruzada de tarea. La ejecución física tuvo lugar en una NVIDIA GeForce RTX 3090 de 24 GB (clúster HPC de Sharif), con 170 pasos de optimización, 49,6 segundos de duración total, un throughput efectivo de 28.051,6 tokens/segundo y un pico de VRAM de 10.859 MB, sin asignación de VRAM para el profesor gracias al caché offline de representaciones.

## Capacidades

- Clasificación de sentimiento binaria (positivo/negativo) en inglés, tarea SST-2 de GLUE.
- Clasificación de secuencias de texto corto a medio (encoder bidireccional estilo BERT).
- Inferencia con atención subcuadrática, con coste de memoria y cómputo menor que la atención cuadrática a medida que crece la longitud de secuencia.
- Carga modular mediante `trust_remote_code=True` en Transformers o mediante la API `load_pretrained_bert` / `load_surgeried_model` de NeuralOps.
- No soporta tool calling, function calling, agentes, vision, audio ni modos de razonamiento extendido (thinking mode); es un clasificador, no un modelo generativo.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Análisis de sentimiento de reseñas de producto: clasificación binaria de opiniones en inglés con una accuracy reportada del 91,40 % en SST-2, suficiente para monitorización de reputación a escala.
- Moderación de comentarios en plataformas en inglés: filtrado rápido de texto tóxico o negativo usando un modelo de 110 M parámetros con huella de pesos publicados de ~55 MB.
- Investigación sobre atención subcuadrática: banco de pruebas reproducible para comparar `griffin_ssd` frente a atención softmax estándar en una tarea GLUE con métricas publicadas.
- Destilación y eficiencia de arquitecturas: ejemplo práctico del protocolo Cached Representation Distillation para recuperar calidad tras sustituir mecanismos de atención, útil en cursos y papers de eficiencia.
- Clasificación de sentimiento en pipelines de bajo presupuesto: al requerir solo ~10,8 GB de VRAM pico en entrenamiento y ser desplegable en GPUs consumer, encaja en entornos con recursos limitados.
- Evaluación comparativa de librerías: integración con NeuralOps para validar la API `load_surgeried_model` y la serialización modular attention-only en flujos de CI.
- Prototipado de clasificadores especializados: punto de partida para fine-tuning adicional sobre dominios concretos (finanzas, soporte técnico) reutilizando la atención destilada.

## Benchmarks y rendimiento

| Métrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`griffin_ssd`) | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy GLUE SST-2 (validación, 872 muestras) | 91,63 % | 88,99 % | 91,40 % | +2,41 % |
| Entropía cruzada de validación | 0,2428 | No calibrada | 0,2570 | Convergida |

Telemetría de entrenamiento (clúster HPC de Sharif, RTX 3090 24 GB): 49,6 s de duración, 170 pasos de optimización, throughput efectivo de 28.051,6 tokens/segundo, pico de VRAM de 10.859 MB. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al reconstruirse sobre `bert-base-uncased` (110 M parámetros) más los pesos de atención FP16, el requisito es del orden de unos pocos GB, apto para GPUs consumer.
- GPU recomendadas: NVIDIA GeForce RTX 3090 (24 GB) fue la GPU usada para entrenamiento; cualquier GPU con al menos ~4-8 GB de VRAM debería bastar para inferencia (estimación, no dato publicado).
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares; también en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True`; API NeuralOps (`load_pretrained_bert`, `load_surgeried_model`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: throughput de entrenamiento publicado de 28.051,6 tokens/s en RTX 3090; latencia de inferencia no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (validación) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bert-griffin-ssd-sst2` (este) | 110 M (base) + atención destilada | No disponible | 91,40 % | MIT | Hugging Face, ~55 MB de pesos |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 tokens (típico) | 91,63 % | Apache 2.0 | Hugging Face, ~450 MB |
| Variantes BERT-Base fine-tuned en SST-2 | ~110 M | 512 tokens (típico) | ~92-93 % (referencia habitual de la literatura) | Apache 2.0 | Amplia disponibilidad |
| Modelos con atención subcuadrática tipo Griffin/Mamba | Variable | Variable | No disponible | Variable | Variable |

La comparación directa con alternativas subcuadráticas equivalentes no está disponible en la información proporcionada; los valores de referencia de BERT-Base fine-tuned son orientativos de la literatura general y no provienen de esta model card.

## Limitaciones y advertencias

- Entrenado exclusivamente para SST-2 (clasificación binaria de sentimiento); no es un modelo generativo ni un asistente conversacional.
- Idioma limitado al inglés; no se garantiza comportamiento en castellano ni en otros idiomas.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas en dominios alejados de reseñas de cine (SST-2 procede de críticas cinematográficas).
- Sesgos: no se documentan análisis de sesgo; al derivar de `bert-base-uncased` y SST-2, puede heredar sesgos del corpus de críticas de cine.
- Requiere `trust_remote_code=True` y la inicialización dinámica de los pesos base desde `bert-base-uncased`; la reproducibilidad depende de la disponibilidad del modelo base y del shim de código remoto.
- La model card referencia el repositorio del autor como `tahamajs` mientras el ID de Hugging Face es `Hooshaai/bert-griffin-ssd-sst2`; verificar la coherencia de rutas antes de integrar en producción.
- Licencia MIT permite uso comercial, pero conviene revisar la licencia del modelo base (`bert-base-uncased`, Apache 2.0) y del código NeuralOps.
- No se documentan límites de longitud de contexto explícitos ni comportamiento con secuencias largas; asumir el límite típico de BERT-Base (512 tokens) hasta confirmación.
- Solo se publican los pesos de atención y la cabeza de clasificación; el despliegue sin acceso a `bert-base-uncased` no es posible.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-griffin-ssd-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE: https://huggingface.co/datasets/glue
- Dataset SST-2: https://huggingface.co/datasets/sst2
