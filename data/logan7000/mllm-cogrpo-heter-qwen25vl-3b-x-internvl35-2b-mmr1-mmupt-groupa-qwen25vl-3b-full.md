# logan7000/mllm-cogrpo-heter-qwen25vl-3b-x-internvl35-2b-mmr1-mmupt-groupA-qwen25vl-3b-full

## Resumen

Este modelo es un checkpoint experimental de investigación desarrollado por Logan Yang (logan7000) en el marco de un estudio sobre optimización de políticas con refuerzo heterogéneo para modelos multimodales de lenguaje y visión (VLM). Combina dos arquitecturas base, Qwen2.5-VL-3B e InternVL3.5-2B, mediante una variante de Co-GRPO (Group Relative Policy Optimization) en la que ambos modelos se entrenan conjuntamente como "lados" complementarios. El checkpoint concreto corresponde al lado Qwen (group A) de un emparejamiento heterogéneo, entrenado sobre el conjunto de datos MMR1 y la tarea mmupt (multimodal math understanding and reasoning).

El modelo se presenta como un artefacto de investigación, sin licencia declarada ni documentación de uso general. Su relevancia radica en explorar cómo el entrenamiento colaborativo entre dos arquitecturas distintas puede mejorar el razonamiento matemático multimodal, un área activa en la comunidad de IA open source. No obstante, al carecer de benchmarks publicados y de una model card completa, su utilidad práctica fuera del ámbito académico es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL-3B (lado Qwen de un emparejamiento heterogéneo con InternVL3.5-2B) |
| Parametros totales | 3B (aproximadamente, según el modelo base Qwen2.5-VL-3B) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-VL-3B soporta hasta 128k tokens, pero no se confirma en este checkpoint) |
| Tipos de cuantizacion | no disponible (solo se observan pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (según los tags del repositorio) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen2.5-VL-3B, un transformer multimodal con codificador de visión, que procesa imágenes y texto. El entrenamiento emplea Co-GRPO heterogéneo, una extensión de GRPO donde dos modelos (Qwen e InternVL) se optimizan de forma conjunta, intercambiando señales de recompensa. El lado Qwen (este checkpoint) se entrenó con el recipe mmupt: beta 0.01, K 10, temperatura 0.7, cap 2048, learning rate 1e-6, weight decay 0.01, max grad norm 1.0, y normalización de recompensas por grupo. Se realizaron 481 pasos (1 época) sobre el dataset MMR1, con 12 prompts por paso (tamaño de batch efectivo 120). El checkpoint "best" corresponde al paso 400, seleccionado por validación en MathVista-150.

No se detallan innovaciones arquitectónicas adicionales más allá del esquema de entrenamiento colaborativo. El entrenamiento se realizó en GPUs A100 de JHU, según la información del autor.

## Capacidades

- Razonamiento matemático multimodal: el entrenamiento se centra en problemas de matemáticas que requieren comprensión visual (gráficos, diagramas, expresiones).
- Comprensión de imágenes y texto: hereda las capacidades base de Qwen2.5-VL-3B, que incluye reconocimiento óptico, análisis de escenas y respuesta a preguntas visuales.
- Generación de texto y diálogo: como modelo de lenguaje, puede producir respuestas coherentes en tareas de conversación general, aunque no es su foco principal.
- Soporte de tool calling: no confirmado; el modelo base Qwen2.5-VL-3B lo soporta, pero no hay evidencia de que este checkpoint lo conserve.
- Capacidades multilingües: no disponibles; el modelo base es multilingüe, pero no se especifica para este checkpoint.

## Casos de uso

- Investigación en optimización de políticas para VLM: el modelo sirve como referencia para estudiar el efecto del entrenamiento heterogéneo con Co-GRPO en el razonamiento matemático visual.
- Evaluación de razonamiento matemático multimodal: puede utilizarse en conjuntos de validación como MathVista-150 para comparar estrategias de refuerzo.
- Desarrollo de agentes de aprendizaje por refuerzo: su arquitectura y método de entrenamiento pueden inspirar pipelines similares en otros dominios.
- Análisis de transferencia de conocimiento entre arquitecturas: al ser un lado de un emparejamiento, permite estudiar cómo se alinean las representaciones entre Qwen e InternVL.
- Prototipado de sistemas de tutoría inteligente: aunque no está optimizado para producción, podría explorarse en entornos académicos para resolver problemas de matemáticas con apoyo visual.
- Benchmarking de eficiencia de entrenamiento: los logs de entrenamiento incluidos (train.log, trainer_state) permiten analizar la dinámica de convergencia y el impacto de los hiperparámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que se utilizó MathVista-150 para seleccionar el mejor checkpoint, pero no se proporcionan puntuaciones numéricas. Tampoco hay comparaciones con otros modelos en la documentación.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 7.5 GB, lo que sugiere pesos en FP16 o BF16. Para inferencia con precisión completa se necesitarían al menos 8 GB de VRAM, aunque con cuantización (no disponible) podría reducirse.
- GPU recomendadas: una GPU con 8-12 GB de VRAM (por ejemplo, RTX 3080, RTX 4070, A10) sería suficiente para inferencia básica. Para entrenamiento o fine-tuning se requerirían GPUs de mayor capacidad como A100 (usada en el entrenamiento original).
- Compatibilidad con GPU de consumo: sí, es probable que quepa en GPUs de consumo con 8 GB o más, pero no hay garantías sin pruebas.
- Opciones de despliegue: al ser un modelo con pesos en safetensors, puede cargarse con librerías como Transformers, vLLM o llama.cpp (si se convierte a GGUF). No se proporcionan configuraciones específicas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo es un checkpoint experimental sin benchmarks publicados, y sus modelos base (Qwen2.5-VL-3B e InternVL3.5-2B) tienen características conocidas, pero este checkpoint no ha sido evaluado de forma estandarizada. Por tanto, la comparativa se limita a señalar que existen alternativas comerciales y open source como Qwen2.5-VL-7B o InternVL3.5-8B, pero sin datos concretos de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado sobre un conjunto de datos específico (MMR1, centrado en matemáticas), puede tener un rendimiento pobre en dominios fuera de ese ámbito.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar respuestas incorrectas o inventadas, especialmente en problemas visuales complejos.
- Limitaciones de contexto e idioma: no se especifican, pero el entrenamiento se realizó probablemente en inglés (por el nombre del dataset y la documentación).
- Restricciones de licencia: la licencia no está declarada, lo que impide su uso comercial sin autorización explícita del autor.
- Caveat para producción: es un modelo de investigación, sin garantías de robustez, seguridad o rendimiento. No recomendado para entornos productivos.
- Falta de documentación: la model card es mínima y no incluye detalles sobre el preprocesado de imágenes, el tokenizador o el formato de entrada esperado.

## Enlaces

- Repositorio del modelo: https://huggingface.co/logan7000/mllm-cogrpo-heter-qwen25vl-3b-x-internvl35-2b-mmr1-mmupt-groupA-qwen25vl-3b-full
- Perfil del autor: https://huggingface.co/logan7000/models
- Repositorio de Qwen3-VL (referencia del modelo base, no directamente relacionado): https://github.com/QwenLM/Qwen3-VL
- Modelo similar (otro lado del emparejamiento, no verificado): https://friendli.ai/models/q1716523669/mllm-cogrpo-heter-qwen25vl-7b-x-internvl35-8b-mmr1-old3ep-b16-groupA-endpoint
