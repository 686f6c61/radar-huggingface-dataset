# aacudad/AnomalyThink-LLaVA-OneVision-7B-SFT-GRPO

## Resumen

AnomalyThink-LLaVA-OneVision-7B-SFT-GRPO es un modelo de lenguaje y visión (LMM) desarrollado por aacudad como artefacto de investigación de una tesis de máster en la TU Delft (2026). Está especializado en detección de anomalías industriales explicable (IAD): dada una imagen de producto, genera una traza de razonamiento en una etiqueta `thinking`, identifica la localización y el tipo de defecto mediante `<location>` y `<type>`, y concluye con una respuesta binaria `<answer>`. El modelo parte del checkpoint `llava-hf/llava-onevision-qwen2-7b-si-hf` y se entrena en dos etapas: primero un ajuste fino supervisado (SFT) sobre 6.000 trazas destiladas de Gemini 2.5-Flash, y después una optimización con Group Relative Policy Optimisation (GRPO) sobre 4.236 prompts de Real-IAD.

La relevancia de este modelo reside en que demuestra que el refuerzo (GRPO) mejora significativamente la detección de anomalías sobre la inicialización SFT, algo que el autor destaca como inusual en este backbone. En la evaluación con un harness compartido, alcanza una balanced accuracy de 87,66 en el subconjunto DS-MVTec de MMAD y 72,58 en VisA, superando al checkpoint publicado de IAD-R1 en ambos benchmarks. El modelo tiene 8.030.807.584 parámetros, usa una arquitectura LLaVA-OneVision (encoder de visión SigLIP + backbone de lenguaje Qwen2) y se distribuye bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA-OneVision (encoder de visión SigLIP + backbone de lenguaje Qwen2-7B) |
| Parametros totales | 8.030.807.584 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usa max prompt 8.192 tokens y max completion 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el backbone Qwen2 es multilingue, pero no se especifica en la ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en LLaVA-OneVision, una familia de LMMs abiertos que combina un encoder de visión SigLIP con un modelo de lenguaje Qwen2. El checkpoint base es `llava-hf/llava-onevision-qwen2-7b-si-hf`, la variante de instrucción simple (SI) de 7B. La arquitectura permite procesar una o varias imágenes y generar texto condicionado, con un projector que alinea las representaciones visuales con el espacio del lenguaje.

El entrenamiento se realiza en dos etapas. En la primera (SFT), se congela la torre de visión SigLIP y se entrenan el projector y el modelo de lenguaje con una tasa de aprendizaje de 1e-5, programación coseno, batch efectivo de 32 y precisión bf16, sobre 6.000 trazas AnomalyThink destiladas de Gemini 2.5-Flash a partir de imágenes Real-IAD. En la segunda etapa (GRPO), se optimiza con Group Relative Policy Optimisation sobre 4.236 prompts de Real-IAD, con un reward basado en precisión y formato (sin términos separados para tipo o localización), grupo de 4 rollouts por prompt, 32 completions por paso, tasa de aprendizaje 1e-6, temperatura de muestreo 1.0 y coeficiente KL beta = 0. A diferencia de la etapa 1, la torre de visión sí se entrena durante GRPO, siguiendo la receta de IAD-R1. El checkpoint liberado corresponde a la época 1 de 2 (paso 530), ya que la época 2 obtuvo resultados equivalentes (87,86 / 72,10).

## Capacidades

- Detección de anomalías industriales explicable: genera una traza de razonamiento en `thinking` antes de emitir la localización y el tipo de defecto, y una respuesta binaria final en `<answer>`.
- Razonamiento de múltiples pasos: el formato de salida fuerza al modelo a razonar antes de clasificar, lo que mejora la interpretabilidad de las predicciones.
- Generación de texto condicionado a imagen: puede describir y analizar imágenes de productos industriales.
- Soporte de tool calling: no disponible (no se menciona en la documentación).
- Capacidades multilingues: no especificadas, aunque el backbone Qwen2 es multilingue de forma nativa.
- Capacidades especiales: entrenado específicamente para el dominio de inspección visual industrial, con salida estructurada en etiquetas XML.

## Casos de uso

- Inspección de calidad en líneas de producción: el modelo puede analizar imágenes de piezas manufacturadas y señalar defectos con su localización y tipo, facilitando la detección temprana de fallos en entornos de fabricación.
- Auditoría visual de lotes de producto: dado un conjunto de imágenes, el modelo genera informes automáticos con razonamiento explicable, útil para verificar la conformidad de grandes volúmenes de artículos.
- Asistencia a operarios de control de calidad: el modelo puede actuar como segundo par de ojos, mostrando la traza de razonamiento para que el operario entienda por qué se marcó una pieza como defectuosa.
- Automatización de informes de inspección: la salida estructurada en `<location>`, `<type>` y `<answer>` permite integrarse directamente en sistemas de gestión de calidad sin necesidad de post-procesado complejo.
- Investigación en detección de anomalías: sirve como punto de partida para experimentos con técnicas de refuerzo (GRPO) sobre modelos de visión y lenguaje, dado que el autor documenta el protocolo de entrenamiento y evaluación.
- Benchmarking de modelos de IAD: al publicar resultados con un harness compartido, permite comparar de forma justa con otros modelos como IAD-R1 o el checkpoint base.

## Benchmarks y rendimiento

La métrica utilizada es balanced accuracy, `(TPR + TNR) / 2`, en porcentaje. Los resultados se obtuvieron con un harness compartido, generación greedy a temperatura 0, máximo 1024 tokens nuevos e imágenes limitadas a 262.144 píxeles, usando vLLM 0.10.2.

| Benchmark | Balanced accuracy |
|---|---|
| MMAD DS-MVTec (1.670 imágenes) | 87,66 |
| MMAD VisA (2.141 imágenes) | 72,58 |

Comparación con otros modelos en el mismo harness:

| Modelo | DS-MVTec | VisA |
|---|---|---|
| LLaVA-OneVision-7B-SI base | 75,66 | 53,80 |
| IAD-R1 checkpoint publicado | 81,92 | 71,34 |
| AnomalyThink LLaVA SFT (inicialización) | 85,91 | 68,26 |
| **Este modelo (SFT + GRPO)** | **87,66** | **72,58** |
| AnomalyThink LLaVA KCR (SFT solo, mejor de la familia) | 88,45 | 74,25 |

El autor advierte que el subconjunto DS-MVTec está potencialmente contaminado: el mixture de entrenamiento público de LLaVA-OneVision contiene 426 filas con id que coincide con `%MVTecAD%`, por lo que el modelo base ya ha visto material de MVTec-AD. VisA no está afectado, por lo que el 72,58 en VisA es el número limpio para comparaciones entre modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 8.030.807.584 parámetros. En bf16 (formato nativo) requiere aproximadamente 16 GB de VRAM solo para los pesos, más overhead de activaciones y KV cache. Con cuantización de 4 bits, podría caber en GPUs con 6-8 GB de VRAM, aunque no se han publicado archivos cuantizados.
- GPU recomendadas: para inferencia en bf16, una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G, L4) es adecuada. Para entrenamiento o fine-tuning, se necesitan GPUs de mayor capacidad como A100 (40/80 GB) o H100.
- Compatibilidad con GPUs de consumo: sí, es posible ejecutar el modelo en una RTX 4090 (24 GB) con bf16, o en GPUs de 8-12 GB con cuantización, aunque no se han publicado versiones GGUF o AWQ.
- Opciones de despliegue: el modelo es compatible con transformers y vLLM (el autor usó vLLM 0.10.2 para la evaluación). También puede servirse con TGI o cualquier framework que soporte safetensors y arquitectura LLaVA-OneVision.
- Latencia y throughput: no se han publicado datos específicos. Como referencia, un modelo de 7-8B en una GPU moderna suele generar entre 20 y 50 tokens por segundo en bf16, dependiendo de la longitud de la secuencia y el hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | DS-MVTec (bal. acc.) | VisA (bal. acc.) | Licencia |
|---|---|---|---|---|---|
| AnomalyThink-LLaVA-OneVision-7B-SFT-GRPO (este) | 8,03B | no disponible | 87,66 | 72,58 | Apache 2.0 |
| IAD-R1 checkpoint publicado | no disponible | no disponible | 81,92 | 71,34 | no disponible |
| LLaVA-OneVision-7B-SI base | 8,03B | no disponible | 75,66 | 53,80 | Apache 2.0 |
| AnomalyThink-LLaVA-OneVision-7B-KCR | 8,03B | no disponible | 88,45 | 74,25 | Apache 2.0 |

El modelo supera al checkpoint de IAD-R1 en ambos benchmarks, aunque el autor señala que la diferencia en VisA es pequeña (+1,24). El modelo KCR (solo SFT) obtiene mejores resultados, pero no está entrenado con GRPO. La comparativa se basa en los datos publicados en la model card, con el caveat de contaminación en DS-MVTec.

## Limitaciones y advertencias

- Contaminación de datos: el subconjunto DS-MVTec de MMAD está potencialmente contaminado porque el mixture de entrenamiento de LLaVA-OneVision contiene material de MVTec-AD. Los resultados en DS-MVTec deben interpretarse con cautela; VisA es el benchmark limpio.
- Objetivo de refuerzo sin KL: el entrenamiento GRPO usa beta = 0, es decir, sin término de divergencia KL contra la política de referencia. Esto difiere de la receta de IAD-R1 (que usaba beta = 0.04) y puede implicar una mayor deriva de la política durante el entrenamiento.
- Dominio limitado: el modelo está especializado en detección de anomalías industriales y puede no generalizar bien a otras tareas de visión y lenguaje fuera de este ámbito.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir razonamientos o localizaciones incorrectas, especialmente en imágenes fuera de distribución.
- Idiomas: no se especifican los idiomas soportados; aunque el backbone Qwen2 es multilingue, el fine-tuning se realizó probablemente con datos en inglés (no se indica lo contrario).
- Sin cuantizaciones publicadas: no hay versiones GGUF, AWQ o GPTQ disponibles, lo que limita el despliegue en hardware de gama baja.
- Artefacto de investigación: el modelo es un checkpoint de una tesis, no un producto comercial. No se garantiza soporte ni mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aacudad/AnomalyThink-LLaVA-OneVision-7B-SFT-GRPO
- Checkpoint SFT (inicialización): https://huggingface.co/aacudad/AnomalyThink-LLaVA-OneVision-7B-SFT
- Modelo KCR (hermano): https://huggingface.co/aacudad/AnomalyThink-LLaVA-OneVision-7B-KCR
- Dataset AnomalyThink: https://huggingface.co/datasets/aacudad/AnomalyThink
- Modelo base: https://huggingface.co/llava-hf/llava-onevision-qwen2-7b-si-hf
- Paper de LLaVA-OneVision: https://arxiv.org/abs/2408.03326
- Documentación de transformers para LLaVA-OneVision: https://huggingface.co/docs/transformers/model_doc/llava_onevision
