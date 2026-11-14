# Hooshaai/bert-spectron-fp8-sst2

## Resumen

`Hooshaai/bert-spectron-fp8-sst2` es un checkpoint de clasificación de texto derivado de `google-bert/bert-base-uncased` en el que se han sustituido los bloques de atención softmax cuadrática de las 12 capas del transformer por el mecanismo `spectron_fp8` de la librería NeuralOps. El objetivo es reducir la complejidad operativa de la atención de O(N²) a un régimen subcuadrático (O(N) u O(N log N)) manteniendo un rendimiento aceptable en tareas de comprensión del lenguaje. Lo desarrolla el autor Hooshaai (Taha Majlesi) y se publica como parte del "Subquadratic Attention Zoo" de NeuralOps.

El modelo se ha ajustado y evaluado sobre la tarea SST-2 del benchmark GLUE mediante un protocolo de destilación de representaciones en caché (NeuralOps Cached Representation Distillation), con el profesor `bert-base-uncased` como referencia. Según la model card, el estudiante sin destilar alcanzaba un 52,18 % de accuracy en SST-2 y tras el proceso de destilación llega al 86,01 %, frente al 91,63 % del profesor original. El entrenamiento se ejecutó en una única RTX 3090 de 24 GB en 55,5 segundos (112 pasos).

La relevancia práctica es doble: por un lado, demuestra que es viable reemplazar la atención cuadrática de un BERT-base y recuperar buena parte de la precisión con un coste de cómputo muy bajo; por otro, el repositorio sigue una serialización modular que solo publica los pesos de atención y la cabeza de clasificación (~55 MB en FP16), reconstruyendo el resto del modelo base en tiempo de carga. Es un artefacto de investigación, no un modelo listo para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-base con atención `spectron_fp8` subcuadrática (sustituye softmax cuadrática en las 12 capas) |
| Parametros totales | ~110 M (heredados de `bert-base-uncased`); el repo solo contiene los pesos de atención y la cabeza de clasificación |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de BERT-base, típicamente 512 tokens; no confirmado en la información proporcionada) |
| Tipos de cuantizacion | Pesos de atención serializados en FP16 (`attention_only_fp16`); no se documentan otras cuantizaciones |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, ~55 MB), con código remoto (`modeling_neuralops_bert.py`) y carga vía `neuralops` |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura BERT-base (12 capas, ~110 M de parámetros) y reemplaza el mecanismo de multi-head attention estándar por `spectron_fp8`, que según la model card opera con complejidad efectiva O(N) u O(N log N) en lugar de O(N²). El repositorio no re-publica los pesos completos del modelo base: solo incluye los pesos de atención entrenados y la cabeza de clasificación en FP16 (~55 MB). El código remoto inicializa los pesos congelados de `bert-base-uncased` y aplica los parámetros de atención destilados en tiempo de carga.

El entrenamiento sigue el NeuralOps Cached Representation Distillation Protocol, con dos etapas: primero una alineación de subespacio oculto (Stage 1 Subspace Hidden Alignment) y después una combinación de KL sobre logits y entropía cruzada de la tarea (Stage 2 Logit KL + Task CE). El profesor es `bert-base-uncased` y el alumnado es el BERT con atención `spectron_fp8`. El proceso se ejecutó en una NVIDIA GeForce RTX 3090 (24 GB) con 112 pasos de optimización, 55,5 segundos de duración, throughput efectivo de 16.538,3 tokens/s y un pico de VRAM de 15.866 MB. La destilación se hizo con representaciones del profesor cacheadas offline, de modo que no se reserva VRAM para el profesor durante el entrenamiento.

## Capacidades

- Clasificación de texto binaria: la tarea objetivo es análisis de sentimiento en SST-2 (0 = negativo, 1 = positivo).
- Comprensión del lenguaje en inglés: al derivar de BERT-base, hereda la capacidad de representación contextual del modelo original, aunque el ajuste se ha realizado únicamente sobre SST-2.
- Atención subcuadrática: el mecanismo `spectron_fp8` está pensado para secuencias largas donde la atención cuadrática resulta prohibitiva, si bien no se documentan evaluaciones específicas en contextos largos.
- Integración con Hugging Face Transformers mediante `trust_remote_code=True` y con la API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidad multilingüe: no, solo inglés.
- No se documenta generación de texto: es un modelo de clasificación, no un modelo causal.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: el modelo clasifica reseñas en inglés como positivas o negativas con un 86,01 % de accuracy en SST-2, suficiente para triaje automático de opiniones a gran escala.
- Moderación de comentarios en plataformas en inglés: como clasificador binario rápido (~110 M de parámetros, ~55 MB de pesos específicos) puede desplegarse en CPU o GPU de gama baja para filtrar toxicidad o polaridad antes de una revisión humana.
- Enrutamiento de tickets de soporte: usar la polaridad del texto para priorizar quejas negativas en colas de atención al cliente, integrándolo como paso previo en un pipeline con `transformers`.
- Investigación en atención eficiente: sirve como referencia reproducible para estudiar el impacto de sustituir atención cuadrática por `spectron_fp8` en tareas GLUE, con métricas publicadas y protocolo de destilación documentado.
- Evaluación de técnicas de destilación: el par profesor `bert-base-uncased` / estudiante destilado permite comparar protocolos de knowledge distillation con un coste de cómputo muy bajo (55,5 s en una RTX 3090).
- Prototipado rápido en entornos con poca VRAM: al cargar solo ~55 MB de pesos de atención más el BERT-base congelado, encaja en GPUs de consumo y en entornos de CI para pruebas de integración.
- Benchmark de herramientas NeuralOps: útil para validar la API `load_surgeried_model` y el flujo de serialización modular de pesos en pipelines propios.

## Benchmarks y rendimiento

Evaluación sobre el split de validación de GLUE SST-2 (872 muestras de clasificación binaria), según la model card:

| Métrica | Profesor (`bert-base-uncased`) | Estudiante sin destilar (`spectron_fp8`) | Modelo destilado |
|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 52,18 % | 86,01 % |
| Delta de accuracy | — | — | +33,83 % |
| Entropía cruzada de validación | 0,2428 | no calibrada | 0,4375 |

Telemetría de entrenamiento (clúster Sharif HPC):

| Métrica | Valor |
|---|---|
| GPU | NVIDIA GeForce RTX 3090 24 GB |
| Duración del entrenamiento | 55,5 s |
| Pasos de optimización | 112 |
| Throughput efectivo | 16.538,3 tokens/s |
| Pico de VRAM | 15.866 MB |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no se documenta de forma explícita. Con ~110 M de parámetros en FP16 el modelo completo ronda los 220 MB, más overhead de activaciones; el pico de 15.866 MB corresponde al entrenamiento, no a inferencia.
- GPU recomendadas: cualquiera con al menos unos pocos GB de VRAM; el entrenamiento se validó en una RTX 3090 de 24 GB.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU moderna con 4 GB o más, aunque no se aportan cifras medidas de inferencia.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True`, API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput de inferencia: no disponibles. El único dato de throughput (16.538,3 tokens/s) corresponde al entrenamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (accuracy) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-spectron-fp8-sst2` | ~110 M | no disponible | 86,01 % | MIT | Hugging Face, requiere `trust_remote_code` |
| `google-bert/bert-base-uncased` (profesor) | ~110 M | 512 tokens (estándar) | 91,63 % (referencia de la model card) | Apache 2.0 | Hugging Face, transformers estándar |
| Alternativas de atención eficiente tipo Longformer / BigBird | ~110-150 M | 4.096 tokens (típico) | no disponible en esta ficha | Apache 2.0 (habitual) | Hugging Face |

La comparación directa con modelos de atención eficiente de la misma familia no está disponible en la información proporcionada; los datos de contexto y rendimiento de esas alternativas no se han verificado aquí.

## Limitaciones y advertencias

- Solo se ha ajustado y evaluado en SST-2; el rendimiento en otras tareas de clasificación o en GLUE completo no está documentado.
- El accuracy (86,01 %) queda 5,62 puntos por debajo del profesor `bert-base-uncased` (91,63 %), por lo que no es un sustituto equivalente en precisión.
- El estudiante sin destilar partía de un 52,18 %, lo que indica que el mecanismo `spectron_fp8` por sí solo no aprende bien la tarea sin el proceso de destilación; la calidad depende críticamente del protocolo KD.
- Idioma limitado a inglés; no hay evaluación multilingüe.
- Riesgo de alucinación y sesgos: al ser un clasificador binario, el riesgo se manifiesta como falsos positivos/negativos y sesgos heredados de BERT-base y de SST-2 (dominio de reseñas de cine, vocabulario y estilos acotados).
- Requiere `trust_remote_code=True` y ejecuta código remoto (`modeling_neuralops_bert.py`) al cargar el modelo; conviene auditar ese código antes de usarlo en producción.
- Dependencia de la librería `neuralops`, cuyo mantenimiento y estabilidad no están garantizados por la información disponible.
- La longitud de contexto efectiva del mecanismo `spectron_fp8` no se documenta; no se debe asumir que soporta secuencias largas sin verificación empírica.
- Licencia MIT: permite uso comercial, pero el modelo base `bert-base-uncased` tiene su propia licencia (Apache 2.0) que debe respetarse al redistribuir.
- Repositorio con 58 descargas y 0 likes en el momento de la consulta: ecosistema muy pequeño, sin validación independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-spectron-fp8-sst2
- Modelo base: https://huggingface.co/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Benchmark GLUE: https://gluebenchmark.com/
- Dataset SST-2: https://huggingface.co/datasets/glue
