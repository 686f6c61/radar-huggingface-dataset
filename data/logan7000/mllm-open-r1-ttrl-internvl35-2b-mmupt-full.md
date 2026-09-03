# logan7000/mllm-open-r1-ttrl-internvl35-2b-mmupt-full

## Resumen

El modelo `logan7000/mllm-open-r1-ttrl-internvl35-2b-mmupt-full` es un modelo multimodal de 2 000 millones de parámetros basado en la arquitectura InternVL3.5, desarrollado por Logan Yang (logan7000) en el marco de un proyecto de investigación sobre aprendizaje por refuerzo en tiempo de inferencia (Test-Time Reinforcement Learning, TTRL). El modelo se ha entrenado con una receta denominada `mmupt` (beta 0.01, K 10, T 0.7, cap 2048, lr 1e-6, warmup 0, weight_decay 0.01, max_grad_norm 1.0, bnpo, scale_rewards group, 12 prompts/step = EB 120), que combina TTRL con autoevaluación por mayoría (self-labeling majority vote). El entrenamiento se realizó en clústeres A100 de la Universidad Johns Hopkins (JHU) durante septiembre de 2026.

El modelo está orientado a tareas de razonamiento multimodal, con especial atención a benchmarks como MathVista-150, que se utilizó como métrica de validación para seleccionar el mejor checkpoint (paso 320). El repositorio incluye dos versiones: `best/` (mejor por validación) y `endpoint/` (checkpoint 640, equivalente a una época completa). La evaluación se realizó con un protocolo específico (v2: T=0, 16k, prompt con caja, juez basado en reglas y Qwen2.5-32B). Aunque el modelo no tiene una licencia declarada ni información pública de idiomas, su naturaleza multimodal y su tamaño lo hacen relevante para experimentación en razonamiento visual y matemático.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | InternVL3.5 (multimodal, vision-lenguaje) |
| Parametros totales | 2 000 millones (2B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo con safetensors, probablemente FP16/BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es InternVL3.5, un modelo multimodal que combina un codificador visual con un modelo de lenguaje de 2B parámetros. No se dispone de detalles adicionales sobre la arquitectura interna (número de capas, dimensiones, tipo de atención) en la información proporcionada.

El entrenamiento se realizó mediante TTRL (Test-Time Reinforcement Learning), una técnica que aplica aprendizaje por refuerzo durante la inferencia sin etiquetas explícitas, utilizando votación por mayoría como mecanismo de autoevaluación para estimar recompensas. La receta `mmupt` especifica hiperparámetros concretos: beta 0.01, K 10 (número de muestras), temperatura 0.7, cap 2048 (límite de tokens), learning rate 1e-6, weight decay 0.01, max_grad_norm 1.0, y una estrategia de normalización de recompensas por grupo (scale_rewards group). Se usaron 12 prompts por paso con un effective batch de 120. El entrenamiento cubrió una época completa (640 pasos), con selección del mejor checkpoint por validación en MathVista-150 (paso 320). El protocolo de evaluación emplea temperatura 0, contexto de 16k tokens, prompts con formato "boxed" y un juez automático basado en reglas más Qwen2.5-32B.

## Capacidades

- Razonamiento multimodal: el modelo procesa entradas de imagen y texto, lo que le permite abordar tareas que requieren comprensión visual y razonamiento simbólico.
- Razonamiento matemático: el entrenamiento se centró en problemas de matemáticas visuales (MathVista), por lo que es adecuado para resolver problemas que combinan figuras, diagramas y enunciados numéricos.
- Aprendizaje por refuerzo en inferencia: gracias a TTRL, el modelo puede mejorar sus respuestas mediante autoevaluación y votación por mayoría en tiempo de inferencia, sin necesidad de etiquetas externas.
- Generación de texto con formato estructurado: el protocolo de evaluación usa prompts con "boxed" (respuestas enmarcadas), lo que sugiere capacidad para producir salidas formateadas.
- No se dispone de información sobre tool calling, agentes, capacidades multilingües específicas o modos de pensamiento explícitos.

## Casos de uso

- Investigación en razonamiento multimodal: el modelo sirve como banco de pruebas para estudiar técnicas de TTRL y autoevaluación en modelos pequeños, permitiendo reproducir experimentos y comparar con variantes de mayor tamaño (p. ej., InternVL-8B).
- Resolución de problemas matemáticos visuales: puede aplicarse a conjuntos de datos como MathVista para evaluar el rendimiento en tareas que requieren interpretar gráficos, tablas o figuras geométricas junto con texto.
- Desarrollo de pipelines de autoevaluación: su entrenamiento con votación por mayoría lo hace útil para experimentar con estrategias de decodificación múltiple y selección de respuestas por consenso en entornos de investigación.
- Fine-tuning posterior: al ser un modelo de 2B con pesos abiertos (aunque sin licencia explícita), puede servir como base para ajuste fino en tareas específicas de visión-lenguaje con recursos computacionales limitados.
- Evaluación de protocolos de juicio automático: el uso de un juez basado en reglas y Qwen2.5-32B permite estudiar la fiabilidad de diferentes métricas de evaluación para modelos multimodales.
- Comparación de recetas de entrenamiento: al existir una variante de 8B con la misma receta, el modelo permite analizar el impacto del escalado en el rendimiento bajo TTRL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que se utilizó MathVista-150 como métrica de validación para seleccionar el mejor checkpoint, pero no se proporcionan valores numéricos. Tampoco se indican resultados en MMLU, HumanEval, GSM8K u otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada: para un modelo de 2B parámetros en precisión FP16, se requieren aproximadamente 4-5 GB de VRAM solo para los pesos. El tamaño del repositorio (9.4 GB) sugiere que puede incluir pesos en FP32 o múltiples archivos, lo que aumentaría el requisito. Con cuantización a 8 bits, podría reducirse a ~2-3 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM (p. ej., RTX 3060, RTX 4060) podría ejecutar el modelo en FP16. Para mayor comodidad, una RTX 4090 o A100 sería adecuada para entrenamiento o inferencia con contexto largo.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo modernas con 8 GB o más de VRAM, especialmente con cuantización.
- Opciones de despliegue: al ser un modelo con pesos en safetensors, puede cargarse con transformers, vLLM, llama.cpp (si se convierte a GGUF) u Ollama. No se especifican integraciones oficiales.
- Latencia y throughput: no disponible. Dependerá del hardware y de la configuración de decodificación (p. ej., con TTRL se requieren múltiples muestras, lo que multiplica el coste).

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este modelo. Como referencia, existen otros modelos multimodales de 2B como InternVL2-2B, Qwen2-VL-2B o PaliGemma-3B, pero no se han encontrado comparaciones directas en la información proporcionada. La model card menciona una variante de 8B (InternVL-8B) entrenada con la misma receta, lo que sugiere que el modelo podría compararse con esa versión, pero no se ofrecen resultados.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica una licencia, lo que impide su uso comercial o redistribución sin autorización explícita del autor. Se recomienda contactar con el autor antes de cualquier uso productivo.
- Información incompleta: no se detallan la arquitectura exacta, el contexto máximo, los idiomas soportados ni los datos de entrenamiento (composición del dataset, número de tokens).
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar respuestas incorrectas o inventadas, especialmente en tareas visuales complejas.
- Sesgos potenciales: al no conocerse la composición del dataset de entrenamiento, no se puede evaluar la presencia de sesgos culturales, de género o de otro tipo.
- Dependencia del protocolo de evaluación: el rendimiento reportado (si se publicara) dependería del protocolo v2 con juez automático, que puede no generalizar a otros entornos.
- Estado experimental: el modelo se describe como "beta 0.01" en la receta, lo que indica que es un artefacto de investigación con posibles limitaciones de robustez.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/logan7000/mllm-open-r1-ttrl-internvl35-2b-mmupt-full
- Perfil del autor en HuggingFace: https://huggingface.co/logan7000
- Paper TTRL (Test-Time Reinforcement Learning): https://arxiv.org/abs/2504.16084
