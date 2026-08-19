# just1nseo/qwen3-4b-if-rlvr-subset4k-n3-ci95-outer-ep5

## Resumen

Este modelo es un fine-tuning experimental de Qwen3-4B desarrollado por just1nseo, centrado en el entrenamiento con aprendizaje por refuerzo con recompensas verificables (RLVR) aplicado al seguimiento de instrucciones. El experimento explora el uso de anclajes de intervalo basados en la distribución t de Student para definir umbrales de recompensa, con hasta tres muestras independientes (N=3) por prompt para estimar la incertidumbre estadística. Se publican cinco checkpoints correspondientes a cada época de entrenamiento, en formato BF16 para Hugging Face Transformers.

La relevancia de este modelo radica en su enfoque metodológico: en lugar de usar recompensas binarias o escalares simples, emplea intervalos de confianza bilaterales al 95% calculados con la t de Student para anclar el criterio de recompensa. Esto permite explorar cómo la incertidumbre estadística en las recompensas afecta al entrenamiento de modelos con modo de pensamiento (thinking mode) activado. El modelo se distribuye bajo licencia Apache 2.0 y está pensado principalmente como artefacto de investigación para la comunidad de RL y alineación de LLMs.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-4B) |
| Parámetros totales | 4.000 millones (4B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el entrenamiento usa 2.048 tokens de prompt y 8.192 de respuesta; el base Qwen3-4B soporta 32.768 tokens) |
| Tipos de cuantización | BF16 (exportación oficial); otras cuantizaciones no disponibles |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (exportación BF16 de Hugging Face) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer denso con modo de pensamiento (thinking mode) integrado, que permite al modelo razonar de forma explícita antes de generar la respuesta final. El fine-tuning se realiza con RLVR (Reinforcement Learning with Verifiable Rewards), un paradigma en el que la recompensa se calcula a partir de criterios objetivos en lugar de un modelo de recompensa aprendido.

La innovación principal de este experimento reside en el uso de anclajes de intervalo: para cada prompt se ejecutan hasta tres muestras independientes (draws) con temperatura 1.0, top-p 0.95 y top-k 20. Con esas muestras se calculan intervalos de confianza bilaterales usando la distribución t de Student (df=2 para N=3, df=1 para N=2), y la recompensa se asigna como +0.1 si la métrica de NLL media por token cae dentro del intervalo válido, con un suelo duro de cero. El umbral inferior usa la NLL media solo de x (entrada), mientras que el superior usa x+c (entrada más respuesta). No se imputa, duplica ni fabrica ninguna muestra faltante: cada fila registra su número efectivo de muestras y su procedencia en la caché derivada.

El entrenamiento se realiza sobre 4.096 filas (subset4k), con batch de 256, 16 pasos por época, 5 épocas, learning rate de 1e-6 y 8 rollouts por prompt. Los checkpoints se exportan en los pasos 16, 32, 48, 64 y 80, cada uno en un directorio separado con su manifiesto de validación BF16 y el commit verificado del Hub.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades de Qwen3-4B, incluyendo modo de pensamiento para razonamiento explícito antes de responder.
- Seguimiento de instrucciones: el entrenamiento con RLVR e intervalos de recompensa busca mejorar la adherencia a instrucciones complejas, aunque no se publican métricas de evaluación específicas.
- Código y matemáticas: capacidades heredadas del modelo base Qwen3-4B, no evaluadas específicamente en este fine-tuning.
- Tool calling: no documentado para este fine-tuning; depende de las capacidades del modelo base.
- Capacidades multilingües: no documentadas en la model card; el modelo base Qwen3-4B soporta múltiples idiomas.
- Modo thinking: activado durante el entrenamiento, lo que sugiere que el modelo conserva la capacidad de razonar antes de generar respuestas.

## Casos de uso

- Investigación en RLVR: el modelo sirve como artefacto de estudio para analizar cómo los intervalos de confianza basados en la t de Student afectan a la calidad del seguimiento de instrucciones frente a recompensas puntuales.
- Comparación de checkpoints por época: los cinco checkpoints (pasos 16, 32, 48, 64 y 80) permiten estudiar la evolución del entrenamiento y detectar overfitting o divergencia.
- Reproducibilidad de experimentos: al incluir metadatos de procedencia (número de muestras efectivas y draws disponibles), el modelo permite reproducir el pipeline completo de RLVR con anclajes de intervalo.
- Evaluación de métodos de recompensa: útil para comparar el enfoque de intervalo exterior (outer) con el de intervalo interior (inner) o con recompensas puntuales en tareas de instrucción.
- Fine-tuning posterior: al ser un checkpoint intermedio, puede servir como punto de partida para entrenamientos adicionales con otros datasets o técnicas de alineación.
- Estudio de robustez estadística: los datos de NLL y perplejidad asociados a cada respuesta permiten analizar la relación entre incertidumbre estadística y calidad de la respuesta generada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación como MMLU, HumanEval o GSM8K, ni comparaciones con el modelo base Qwen3-4B o con la variante ep3 del mismo autor.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8 GB para los pesos en BF16 (4.000 millones de parámetros × 2 bytes por parámetro), más overhead de activaciones y KV cache; se recomiendan 12 GB o más.
- GPU recomendadas: cualquier GPU con 12 GB o más de VRAM es suficiente para inferencia en BF16 (por ejemplo, RTX 3060 12GB, RTX 4070, RTX 4090, A10, A100). Para entrenamiento o fine-tuning adicional se recomienda al menos 24 GB.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs consumer de gama media-alta con 12 GB o más.
- Opciones de despliegue: al ser un modelo Transformers estándar, se puede servir con vLLM, TGI, llama.cpp (tras conversión a GGUF) u Ollama. No se documentan configuraciones específicas de despliegue.
- Latencia y throughput: no disponibles. Como referencia orientativa, un modelo de 4B en BF16 en una RTX 4090 suele generar entre 40 y 80 tokens por segundo, pero no hay mediciones publicadas para este fine-tuning concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| just1nseo/qwen3-4b-if-rlvr-subset4k-n3-ci95-outer-ep5 | 4B | No disponible | Apache 2.0 | Fine-tuning RLVR con intervalos t de Student al 95% |
| just1nseo/qwen3-4b-if-rlvr-subset4k-ep3 | 4B | No disponible | Apache 2.0 | Variante del mismo autor, baseline estricto sin anclajes de intervalo |
| Qwen/Qwen3-4B | 4B | 32.768 tokens | Apache 2.0 | Modelo base original con modo thinking |
| Qwen/Qwen3.5-4B | 4B | No disponible | No disponible | Versión posterior de la serie Qwen 3.5 |

La comparativa se limita a modelos de la misma familia y tamaño. No se dispone de datos de rendimiento comparativos entre estas variantes.

## Limitaciones y advertencias

- Modelo experimental: se trata de un artefacto de investigación, no de un modelo listo para producción. No hay garantías de calidad ni de comportamiento en escenarios reales.
- Sin benchmarks publicados: no se dispone de métricas de evaluación estándar, por lo que es imposible cuantificar su rendimiento relativo frente al modelo base u otros fine-tunings.
- Datos de entrenamiento incompletos: de los 4.096 prompts, solo 3.865 tienen las tres muestras completas; 63 tienen dos y 168 conservan solo la primera. Esta variabilidad puede afectar a la consistencia del entrenamiento.
- Sesgos no documentados: no se proporciona información sobre sesgos del dataset de entrenamiento ni de las respuestas generadas.
- Riesgo de alucinación: no evaluado específicamente para este fine-tuning; el modelo base Qwen3-4B presenta riesgo de alucinación en tareas fácticas, y el entrenamiento con RLVR no lo elimina.
- Limitaciones de idioma: no se documentan los idiomas soportados ni la calidad en español u otros idiomas distintos de los del dataset de entrenamiento.
- Sin soporte multimodal: el modelo es exclusivamente de texto; no procesa imágenes, audio ni video.
- Requisitos de despliegue: al publicarse solo en BF16, el despliegue en entornos con poca memoria requiere conversión a cuantizaciones inferiores (INT8, INT4), lo que puede degradar el rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/just1nseo/qwen3-4b-if-rlvr-subset4k-n3-ci95-outer-ep5
- Variante ep3 (mismo autor): https://huggingface.co/just1nseo/qwen3-4b-if-rlvr-subset4k-ep3
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Qwen3 Technical Report (arXiv): https://arxiv.org/pdf/2505.09388
- Dataset de anclajes, run 2: https://huggingface.co/datasets/sangyon/anchor_cache/commit/bc72af3622590af3459181932e3e4949c162c0e8
- Dataset de anclajes, run 3: https://huggingface.co/datasets/sangyon/anchor_cache/commit/0e030ca1600da5306e5474985137060b7231d254
