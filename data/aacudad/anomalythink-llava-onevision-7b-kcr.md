# aacudad/AnomalyThink-LLaVA-OneVision-7B-KCR

## Resumen

AnomalyThink-LLaVA-OneVision-7B-KCR es un modelo de lenguaje y visión (VLM) de 8.030 millones de parámetros, desarrollado por aacudad como artefacto de investigación de la tesis de máster *Reasoning-Enhanced Vision-Language Models for Explainable Industrial Anomaly Detection* (TU Delft, 2026). Se trata de un fine-tuning del modelo base `llava-hf/llava-onevision-qwen2-7b-si-hf` orientado a la detección de anomalías industriales explicable: dada una imagen de un producto, el modelo genera un rastro de razonamiento en una etiqueta `thinking`, identifica la localización y el tipo de defecto mediante las etiquetas `<location>` y `<type>`, y concluye con una respuesta binaria `<answer>`.

La relevancia de este modelo reside en su enfoque de auto-destilación: el corpus de entrenamiento KCR (keep, correct, rewrite) se construyó a partir de los propios rollouts del modelo base LLaVA-OneVision, no de los de Qwen, lo que lo hace on-policy para esta arquitectura. El entrenamiento fue exclusivamente con supervisión (SFT), sin etapa de refuerzo, y logra una precisión balanceada de 88,45 en DS-MVTec y 74,25 en VisA, superando al checkpoint IAD-R1 de referencia en el mismo harness de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA-OneVision (vision encoder SigLIP + backbone de lenguaje Qwen2) |
| Parametros totales | 8.030.807.584 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (cutoff de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el backbone Qwen2 base es multilingue, pero no se especifica para este fine-tuning) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura LLaVA-OneVision, que combina un vision encoder SigLIP con un backbone de lenguaje Qwen2 de 7B parámetros, conectados mediante un proyector multimodal. El fine-tuning se realizó con supervisión únicamente (SFT), congelando el vision tower SigLIP y entrenando el proyector multimodal y el modelo de lenguaje. Los hiperparámetros fueron: learning rate 1e-5, schedule coseno con warmup ratio 0.03, weight decay 0.1, batch efectivo 32, contexto de 8.192 tokens, precisión bf16 y 4 épocas. El checkpoint publicado corresponde a la época 4 de 4 (paso 748), el mejor de las cuatro guardadas.

El corpus de entrenamiento, denominado KCR, se construyó mediante un proceso de auto-destilación: se muestrearon 10.236 rollouts del checkpoint hermano SFT-GRPO sobre imágenes de entrenamiento de Real-IAD (k = 8 por imagen, temperatura 0.7), se clasificaron en categorías keep, needs correction y needs rewrite según si el veredicto coincidía con la etiqueta, se puntuaron con un juez de fidelidad Gemini 2.5-Flash para descartar trazas correctas por razones equivocadas, y se corrigieron o reescribieron las fallidas. El resultado fue un corpus balanceado de 6.000 trazas, 50/50 entre piezas normales y anómalas. El autor destaca que este corpus es nativo de LLaVA-OneVision, no prestado de Qwen, y que el control con corpus derivado de Qwen no alcanzó los mismos resultados.

## Capacidades

- Detección de anomalías industriales explicable: genera un rastro de razonamiento en `thinking` antes de emitir el veredicto.
- Salida estructurada con etiquetas `<location>`, `<type>` y `<answer>` para localización, tipo de defecto y clasificación binaria.
- Razonamiento multi-paso integrado en el flujo de generación, sin necesidad de prompting externo.
- Capacidad de conversación y generación de texto condicionada a imágenes, heredada del modelo base LLaVA-OneVision.
- Soporte de entrada de imagen única (el protocolo de evaluación usa una imagen por prompt).
- Compatible con el pipeline `image-text-to-text` de transformers y con vLLM para inferencia.

## Casos de uso

- Inspección visual de calidad en líneas de producción: el modelo puede analizar imágenes de piezas manufacturadas y emitir un veredicto binario con explicación, lo que permite integrarlo en sistemas de control de calidad automatizado.
- Auditoría de defectos con trazabilidad: al generar localización y tipo de defecto, facilita la clasificación automática de fallos y la generación de informes para mantenimiento predictivo.
- Asistencia a inspectores humanos: el razonamiento en `thinking` proporciona una justificación legible que ayuda a los operarios a validar o descartar las decisiones del modelo.
- Benchmarking de modelos VLM para detección de anomalías: al publicar el harness de evaluación y los resultados comparativos, sirve como referencia para investigaciones en IAD explicable.
- Fine-tuning posterior sobre dominios específicos: al ser un modelo abierto con licencia Apache 2.0, puede adaptarse a nuevos conjuntos de datos industriales con pocas imágenes.
- Investigación en auto-distilación y generación de corpus sintéticos: el proceso KCR documentado puede replicarse para otros backbones y tareas de visión.

## Benchmarks y rendimiento

La métrica utilizada es la precisión balanceada, `(TPR + TNR) / 2`, en porcentaje. Los resultados se midieron con un harness compartido: subconjuntos DS-MVTec y VisA de MMAD, una imagen por prompt, la misma instrucción usada en el entrenamiento, decodificación greedy a temperatura 0, máximo 1.024 tokens nuevos e imágenes limitadas a 262.144 píxeles. La generación se ejecutó con vLLM 0.10.2, que coincidió con el path de transformers en el 99% de un conjunto de prueba.

| Benchmark | Precisión balanceada |
|---|---|
| MMAD DS-MVTec (1.670 imágenes) | 88,45 |
| MMAD VisA (2.141 imágenes) | 74,25 |

Comparativa con modelos de referencia en el mismo harness:

| Modelo | DS-MVTec | VisA |
|---|---|---|
| LLaVA-OneVision-7B-SI base | 75,66 | 53,80 |
| IAD-R1 checkpoint publicado | 81,92 | 71,34 |
| AnomalyThink LLaVA SFT (6K trazas Gemini) | 85,91 | 68,26 |
| AnomalyThink LLaVA SFT + GRPO | 87,66 | 72,58 |
| Este modelo (KCR, SFT solo) | 88,45 | 74,25 |

Nota de contaminación: el mixture de entrenamiento público de LLaVA-OneVision (`lmms-lab/LLaVA-OneVision-Data`, config `vision_flan(filtered)`) contiene 426 filas con id `%MVTecAD%`, por lo que el modelo base ya ha visto material de MVTec-AD durante su instruction tuning. Todos los números de DS-MVTec para modelos derivados de LLaVA-OneVision llevan esa salvedad, incluido el 88,45 y la fila de IAD-R1. VisA no está afectado (0 filas en el mixture), por lo que el 74,25 es el número limpio para comparaciones entre modelos.

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware en la información disponible. Como orientación basada en el tamaño del modelo (8.030 millones de parámetros en bf16):

- VRAM estimada para inferencia en bf16: aproximadamente 16-18 GB, más overhead de activaciones y caché KV, lo que sugiere un mínimo de 24 GB para una ventana de contexto de 8.192 tokens.
- Con cuantización de 4 bits (no publicada oficialmente, pero factible con herramientas como bitsandbytes o GPTQ), podría caber en GPUs de 12-16 GB.
- GPUs recomendadas: RTX 4090 (24 GB), A100 40 GB, H100, o cualquier GPU con al menos 24 GB de VRAM para uso cómodo.
- Opciones de despliegue: vLLM 0.10.2 (verificado por el autor), transformers con el path de generate estándar, y potencialmente llama.cpp u Ollama si se generan pesos GGUF.
- El autor verificó la carga y evaluación bajo transformers 4.57.1 y vLLM 0.10.2, con pesos escritos por transformers 4.51.3.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | DS-MVTec | VisA | Licencia |
|---|---|---|---|---|---|
| AnomalyThink-LLaVA-OneVision-7B-KCR | 8.030 M | 8.192 | 88,45 | 74,25 | Apache 2.0 |
| LLaVA-OneVision-7B-SI base | 8.030 M | 8.192 (aprox.) | 75,66 | 53,80 | Apache 2.0 |
| IAD-R1 checkpoint | no disponible | no disponible | 81,92 | 71,34 | no disponible |
| AnomalyThink-LLaVA-OneVision-7B-SFT-GRPO | 8.030 M | 8.192 | 87,66 | 72,58 | Apache 2.0 |

El modelo KCR supera a todas las alternativas comparadas en ambos benchmarks, con la salvedad de la contaminación de MVTec-AD en el modelo base. La diferencia principal frente al SFT-GRPO es que KCR logra mejores resultados sin etapa de refuerzo, solo con un corpus mejorado mediante auto-distilación.

## Limitaciones y advertencias

- Contaminación de datos en DS-MVTec: el modelo base LLaVA-OneVision ya ha visto material de MVTec-AD durante su entrenamiento, por lo que los resultados en ese benchmark pueden estar inflados por memoria, no por capacidad real. VisA es el benchmark limpio.
- Riesgo de alucinación: como cualquier VLM, puede generar razonamientos plausibles pero incorrectos, especialmente en imágenes fuera de distribución o con defectos ambiguos.
- Limitación de idioma: no se especifican los idiomas soportados; el backbone Qwen2 es multilingue, pero el corpus de entrenamiento KCR está en inglés (a juzgar por las etiquetas y el formato de salida).
- Advertencia de compatibilidad con transformers 5.0: los checkpoints guardados con transformers 5.0 escriben la configuración de rope bajo `text_config.rope_parameters`, que transformers 4.x no lee y sustituye silenciosamente por `rope_theta = 10000`, 100 veces menor de lo correcto. El modelo entonces se mantiene fluido pero pierde capacidad visual y responde "no" sistemáticamente. Hay que verificar la versión de transformers al cargar.
- El modelo es un artefacto de investigación, no un producto listo para producción. No se han publicado evaluaciones de sesgos, robustez ante ataques adversariales o rendimiento en condiciones de iluminación o ángulos variables.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en entornos industriales reales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aacudad/AnomalyThink-LLaVA-OneVision-7B-KCR
- Dataset AnomalyThink: https://huggingface.co/datasets/aacudad/AnomalyThink
- Checkpoint hermano SFT-GRPO: https://huggingface.co/aacudad/AnomalyThink-LLaVA-OneVision-7B-SFT-GRPO
- Modelo base: https://huggingface.co/llava-hf/llava-onevision-qwen2-7b-si-hf
- Documentación de LLaVA-OneVision en transformers: https://huggingface.co/docs/transformers/model_doc/llava_onevision
- Paper LLaVA-OneVision (arXiv): https://arxiv.org/abs/2408.03326
- Blog de LMMs-Lab sobre LLaVA-OneVision: https://www.lmms-lab.com/posts/llava_onevision/
