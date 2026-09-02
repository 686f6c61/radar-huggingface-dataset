# aacudad/AnomalyThink-LLaVA-OneVision-7B-SFT

## Resumen

AnomalyThink-LLaVA-OneVision-7B-SFT es un modelo de lenguaje y visión (VLM) desarrollado por aacudad como artefacto de investigación de una tesis de máster en la Universidad Técnica de Delft (TU Delft, 2026). El modelo está especializado en detección de anomalías industriales explicable (IAD): dada una imagen de un producto, genera una traza de razonamiento en una etiqueta `thinking`, seguida de una localización `<location>` y tipo de defecto `<type>` cuando detecta una anomalía, y finalmente una respuesta binaria `<answer>`.

Se trata de un fine-tuning supervisado (SFT) del modelo base `llava-hf/llava-onevision-qwen2-7b-si-hf` sobre 6.000 trazas de razonamiento destiladas de Gemini 2.5-Flash sobre imágenes del dataset Real-IAD. Este checkpoint es el punto de partida de una familia de tres modelos: es la inicialización para el entrenamiento con GRPO y la fuente de los rollouts que dieron origen al corpus KCR. El modelo tiene 8.030 millones de parámetros y una ventana de contexto de 8.192 tokens.

La relevancia de este modelo reside en que aísla el backbone como única variable cambiada respecto a otros modelos de la familia, lo que permite comparar limpiamente el efecto de la arquitectura subyacente en tareas de detección de anomalías industriales. Los resultados publicados muestran una mejora sustancial frente al modelo base: 85,91 de balanced accuracy en DS-MVTec y 68,26 en VisA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA-OneVision (vision-language model, Qwen2-7B backbone + SigLIP vision tower) |
| Parametros totales | 8.030.807.584 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (cutoff de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura LLaVA-OneVision, que combina un codificador de visión SigLIP con un modelo de lenguaje Qwen2-7B. El proyector multimodal y el modelo de lenguaje se entrenan durante el fine-tuning, mientras que la torre de visión SigLIP permanece congelada. El entrenamiento es supervisado únicamente, sin etapa de reinforcement learning.

El corpus de entrenamiento consiste en 6.000 trazas AnomalyThink destiladas de Gemini 2.5-Flash sobre imágenes de Real-IAD, el mismo corpus utilizado para el modelo Qwen2.5-VL de la misma familia, lo que permite aislar el backbone como única variable. La receta de entrenamiento usa learning rate 1e-5, schedule coseno, warmup ratio 0,03, weight decay 0,1, batch size efectivo de 32, cutoff de contexto de 8.192 tokens, precisión bf16 y 4 épocas. El checkpoint publicado corresponde a la época 1 de 4 (paso 188), que es la que mejor rendimiento obtuvo; las épocas posteriores empeoran los resultados, lo que sugiere que un entrenamiento más largo con solo 6.000 trazas degrada el rendimiento de este backbone.

## Capacidades

- Detección de anomalías industriales en imágenes de productos, con salida estructurada en tres partes: traza de razonamiento, localización y tipo de defecto, y clasificación binaria.
- Razonamiento explicable: el modelo genera una cadena de pensamiento antes de emitir el veredicto, lo que permite auditar el proceso de decisión.
- Generación de texto condicionada a imágenes (image-text-to-text), heredada de la arquitectura LLaVA-OneVision.
- Capacidad de procesar una imagen por prompt en el protocolo de evaluación utilizado (aunque la arquitectura base soporta múltiples imágenes y vídeo, este checkpoint se evalúa con imagen única).
- Soporte multilingüe no documentado por el autor; el modelo base Qwen2-7B tiene capacidades multilingües, pero no se especifican para este fine-tuning.

## Casos de uso

- Control de calidad en líneas de fabricación: el modelo puede analizar imágenes de productos en tiempo real y señalar defectos con su localización y tipo, integrándose en sistemas de inspección visual automatizada.
- Auditoría de procesos industriales: al generar trazas de razonamiento, permite a los equipos de calidad revisar por qué el modelo clasificó una pieza como defectuosa, facilitando el diagnóstico de fallos sistemáticos.
- Investigación académica en detección de anomalías: sirve como baseline supervisado para comparar arquitecturas y métodos de entrenamiento (SFT, GRPO, KCR) en el dominio de IAD.
- Inicialización para entrenamiento con RL: este checkpoint es el punto de partida para entrenamientos con GRPO, por lo que es útil para reproducir la familia completa de modelos AnomalyThink.
- Benchmarking de VLMs en entornos industriales: permite evaluar el rendimiento de un backbone LLaVA-OneVision frente a alternativas como Qwen2.5-VL en tareas de IAD con el mismo corpus de entrenamiento.
- Desarrollo de sistemas de inspección visual con requisitos de explicabilidad: la salida estructurada con etiquetas `<thinking>`, `<location>`, `<type>` y `<answer>` facilita la integración en pipelines que requieren trazabilidad de decisiones.

## Benchmarks y rendimiento

La métrica utilizada es balanced accuracy, calculada como `(TPR + TNR) / 2`, en porcentaje. Los resultados se obtuvieron con un harness de evaluación compartido: subconjuntos DS-MVTec y VisA de MMAD, una imagen por prompt, la misma instrucción usada en entrenamiento, decoding greedy a temperatura 0, máximo 1.024 tokens nuevos e imágenes limitadas a 262.144 píxeles.

| Benchmark | Balanced accuracy |
|---|---|
| MMAD DS-MVTec (1.670 imágenes) | 85,91 |
| MMAD VisA (2.141 imágenes) | 68,26 |

Comparativa con modelos de referencia, medidos con el mismo harness:

| Modelo | DS-MVTec | VisA |
|---|---|---|
| LLaVA-OneVision-7B-SI base | 75,66 | 53,80 |
| **Este modelo (SFT)** | **85,91** | **68,26** |
| IAD-R1 checkpoint publicado | 81,92 | 71,34 |
| AnomalyThink LLaVA SFT + GRPO | 87,66 | 72,58 |
| AnomalyThink LLaVA KCR (mejor de la familia) | 88,45 | 74,25 |

Advertencia importante del autor: el conjunto de entrenamiento público de LLaVA-OneVision contiene 426 filas con identificadores que coinciden con `%MVTecAD%`, por lo que el modelo base ya ha visto material de MVTec-AD durante su instruction tuning. Esto afecta a todos los números de DS-MVTec de cualquier modelo derivado de LLaVA-OneVision, incluido el 85,91 de este checkpoint. VisA no está afectado por esta contaminación, por lo que el 68,26 en VisA es el número limpio y el más fiable para comparaciones entre modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 8.030 millones de parámetros en bf16, el peso del modelo ocupa aproximadamente 16 GB, por lo que se necesitan al menos 20-24 GB de VRAM para inferencia sin cuantización.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una GPU con 24 GB o más (RTX 3090/4090, A10, A100) sería necesaria para inferencia en bf16 sin cuantizar.
- En consumer GPU: posible con cuantización (GGUF/AWQ), aunque no se documentan cuantizaciones específicas para este checkpoint.
- Opciones de despliegue: el autor verificó la carga y evaluación con transformers 4.57.1 (ruta generate estándar) y con vLLM 0.10.2, que mostró concordancia del 99 % en un conjunto de prueba. También es compatible con el pipeline de transformers para image-text-to-text.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | DS-MVTec | VisA | Licencia |
|---|---|---|---|---|---|
| **AnomalyThink-LLaVA-OneVision-7B-SFT** | 8,03B | 8.192 | 85,91 | 68,26 | Apache 2.0 |
| LLaVA-OneVision-7B-SI base | 8,03B | 8.192 (aprox.) | 75,66 | 53,80 | Apache 2.0 |
| IAD-R1 checkpoint publicado | no disponible | no disponible | 81,92 | 71,34 | no disponible |
| AnomalyThink LLaVA SFT + GRPO | 8,03B | 8.192 | 87,66 | 72,58 | Apache 2.0 |
| AnomalyThink LLaVA KCR | 8,03B | 8.192 | 88,45 | 74,25 | Apache 2.0 |

La comparativa muestra la progresión dentro de la familia AnomalyThink: el SFT supera claramente al base, pero los modelos con entrenamiento por refuerzo (GRPO) y con el corpus KCR nativo obtienen mejores resultados, especialmente en VisA. El modelo SFT es superior a IAD-R1 en DS-MVTec pero inferior en VisA.

## Limitaciones y advertencias

- Contaminación de datos en DS-MVTec: el modelo base LLaVA-OneVision fue entrenado con material de MVTec-AD, por lo que los resultados en DS-MVTec pueden estar inflados por recall del conjunto de entrenamiento. El autor recomienda confiar en el número de VisA (68,26) para comparaciones limpias.
- Sobreentrenamiento: el checkpoint publicado es la época 1 de 4; las épocas posteriores degradan el rendimiento. Entrenar más allá de este punto con el corpus de 6.000 trazas empeora los resultados.
- Riesgo de alucinación: no documentado específicamente, pero inherente a los modelos de lenguaje; la salida estructurada con etiquetas puede ayudar a mitigarlo en producción.
- Limitaciones de idioma: no documentadas; el modelo base Qwen2-7B tiene capacidades multilingües, pero no se especifican para este fine-tuning.
- Advertencia de compatibilidad: checkpoints guardados con transformers 5.0 escriben la configuración de rope bajo `text_config.rope_parameters`, que transformers 4.x no lee y provoca un fallo silencioso con `rope_theta = 10000` (100 veces menor de lo necesario). El modelo entonces responde "no" a casi todo, lo que parece un colapso del entrenamiento en lugar de un error de carga. Este repositorio fue escrito con transformers 4.51.3, por lo que no está afectado, pero es relevante para quien reconstruya el pipeline.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el modelo es un artefacto de investigación de una tesis y no se documentan garantías de rendimiento en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aacudad/AnomalyThink-LLaVA-OneVision-7B-SFT
- Dataset AnomalyThink: https://huggingface.co/datasets/aacudad/AnomalyThink
- Modelo base: https://huggingface.co/llava-hf/llava-onevision-qwen2-7b-si-hf
- Modelo KCR de la familia: https://huggingface.co/aacudad/AnomalyThink-LLaVA-OneVision-7B-KCR
- Documentación de LLaVA-OneVision en transformers: https://huggingface.co/docs/transformers/model_doc/llava_onevision
- Paper de LLaVA-OneVision: https://arxiv.org/abs/2408.03326
- Página del proyecto LLaVA: https://llava-vl.github.io/
