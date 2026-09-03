# HYU-NLP-EVAL/qwen3-1.7b-rar-medicine-static-r0-step-000

## Resumen

Este repositorio contiene un checkpoint de política del modelo Qwen3-1.7B, entrenado con aprendizaje por refuerzo (RL) mediante el algoritmo GRPO sobre un dominio específico de medicina (RaR Medicine). Lo publica el grupo HYU-NLP-EVAL como parte de un experimento diseñado para estudiar la saturación de recompensa y el estancamiento de rúbricas estáticas durante la optimización de políticas. El checkpoint corresponde al paso 0 (step-000) de un entrenamiento que cubre diez puntos de auditoría hasta el paso 48 en el dominio de medicina.

El modelo base es Qwen/Qwen3-1.7B, un transformer decoder-only de 1.720 millones de parámetros. La recompensa de entrenamiento se fija en una rúbrica inicial específica del prompt (R0), congelada durante todo el proceso. Los pesos se exportan en formato Hugging Face Transformers con precisión BF16 en safetensors, e incluyen configuración, tokenizador y plantilla de chat. Es un artefacto de investigación, no un modelo de producción, y no debe usarse como sustituto de consejo médico profesional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen/Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3-1.7B, un transformer decoder-only con atención causal. Sobre esta base, HYU-NLP-EVAL aplica GRPO (Group Relative Policy Optimization) como algoritmo de aprendizaje por refuerzo. La señal de recompensa es una rúbrica estática específica del prompt (R0) que permanece congelada durante todo el entrenamiento, lo que permite analizar cómo se comporta la política cuando la rúbrica no se actualiza (fenómeno conocido como rubric staleness). El dominio de entrenamiento es RaR Medicine, un conjunto de tareas de razonamiento y respuesta en medicina. El checkpoint se guarda en el paso 0 (step-000), con seed 11. No se incluyen optimizador, scheduler, estado de entrenamiento, rollouts, rúbricas ni datos de evaluación en el repositorio.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen3-1.7B.
- Especialización en tareas de dominio médico (RaR Medicine) según el experimento de RL.
- Soporte de conversación multi-turno mediante la plantilla de chat incluida.
- Capacidad de tool calling y function calling heredada de Qwen3-1.7B (no verificada en este checkpoint específico).
- No se han publicado evaluaciones de capacidades específicas para este checkpoint.

## Casos de uso

- Investigación en aprendizaje por refuerzo: permite estudiar la dinámica de optimización de políticas cuando la recompensa es una rúbrica estática, especialmente la saturación de recompensa y el estancamiento de la rúbrica.
- Auditoría de checkpoints intermedios: al estar disponible el paso 0 y otros pasos posteriores, se puede trazar la evolución de la política durante el entrenamiento.
- Análisis de generalización en dominios médicos: útil para comparar el comportamiento del modelo antes y después del entrenamiento con RL en tareas de razonamiento médico.
- Reproducibilidad de experimentos: al incluir la configuración completa y el tokenizador, otros investigadores pueden replicar o extender el experimento.
- Evaluación de robustness: permite probar cómo responde el modelo a variaciones en los prompts médicos cuando la rúbrica de recompensa no se actualiza.
- Docencia e investigación académica: sirve como ejemplo práctico de un pipeline GRPO con rúbricas estáticas en un dominio vertical.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye datos de evaluación ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 3,5 GB para los pesos del modelo (1.720M parámetros × 2 bytes), más overhead de activaciones y caché KV, lo que permite ejecución en GPUs consumer con 8 GB o más.
- GPU recomendadas: NVIDIA RTX 3060 (12 GB), RTX 4070, RTX 4090, o GPUs de datacenter como A10, A100 o H100 para mayor throughput.
- Cabe en GPUs consumer de 8 GB o más, aunque para contexto largo se recomienda al menos 16 GB.
- Opciones de despliegue: compatible con transformers (carga directa), vLLM, TGI (text-generation-inference) y llama.cpp (si se convierte a GGUF).
- Latencia y throughput estimados: no disponibles para este checkpoint específico; en un modelo de 1.7B en BF16 con una GPU moderna se puede esperar un throughput del orden de decenas de tokens por segundo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| Qwen3-1.7B (base) | 1,72B | 32K (según documentación oficial) | Apache 2.0 | Modelo generalista de chat y razonamiento |
| HYU-NLP-EVAL/qwen3-1.7b-rar-medicine-static-r0-step-000 | 1,72B | no disponible | Apache 2.0 | Artefacto de investigación en RL con rúbrica estática |
| Llama-3.2-1B | 1,23B | 128K | Llama 3.2 Community License | Modelo ligero generalista |

La comparativa se limita a parámetros y licencia, ya que no hay datos de rendimiento publicados para este checkpoint. La principal diferencia frente al modelo base es el entrenamiento adicional con GRPO sobre un dominio médico con recompensa congelada.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo de producción. No ha sido evaluado para uso en escenarios reales.
- No debe utilizarse como dispositivo médico ni como sustituto de consejo médico profesional.
- La rúbrica de recompensa está congelada (R0), por lo que el modelo puede presentar comportamientos de saturación de recompensa que no reflejan calidad real en tareas médicas.
- No se incluyen datos de evaluación ni benchmarks en el repositorio, por lo que se desconoce su rendimiento efectivo.
- El dominio de entrenamiento es específico (medicina), lo que puede limitar su generalización a otras áreas.
- No hay información sobre sesgos específicos del modelo, pero al estar entrenado sobre un dominio médico puede heredar sesgos presentes en los datos de entrenamiento de Qwen3-1.7B y en el conjunto RaR Medicine.
- Riesgo de alucinación en respuestas médicas: como cualquier modelo generativo, puede producir información incorrecta o inventada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/HYU-NLP-EVAL/qwen3-1.7b-rar-medicine-static-r0-step-000
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
