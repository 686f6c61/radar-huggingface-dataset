# dingwenjun/ALFWorld-Qwen3.5-4B

## Resumen

ALFWorld-Qwen3.5-4B es un repositorio de checkpoints de experimentos de aprendizaje por refuerzo (RL) sobre el modelo base Qwen/Qwen3.5-4B, publicados por el usuario dingwenjun en Hugging Face. El modelo está orientado a tareas de agente en entornos textuales tipo ALFWorld, un benchmark clásico de planificación y ejecución de acciones en mundos simulados (TextWorld). No se trata de un modelo nuevo entrenado desde cero, sino de una colección de variantes derivadas del Qwen3.5-4B mediante técnicas de RL (GRPO, OPD y variantes) para mejorar el comportamiento agéntico.

El repositorio contiene cinco subdirectorios con variantes experimentales: `grpo/`, `single-opd/`, `retireopd/`, `teacher95-historical-bf16/` y `student100-fp32/`. Las variantes GRPO y OPD son modelos entrenados con RL; las variantes "teacher" y "student" corresponden a un esquema de destilación o destilación con profesor. Los pesos se almacenan en BF16 salvo el estudiante, que está en FP32. El tamaño del repositorio (58,4 GB) es coherente con múltiples copias de un modelo de ~4-5B parámetros en BF16/FP32.

La relevancia de esta ficha es doble: por un lado, documenta un artefacto de investigación reproducible para quienes trabajan en RL para agentes; por otro, sirve de ejemplo de cómo se publican checkpoints intermedios sin model card detallada ni resultados de benchmarks. La licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación publicada y de documentación sobre datos de entrenamiento limita su uso directo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B; detalles específicos no disponibles) |
| Parámetros totales | ~4-5B (heredados de Qwen/Qwen3.5-4B; el modelo base se describe como "5B parameters" en Hugging Face y "4 billion" en Qualcomm AI Hub, dato no confirmado para este checkpoint) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (los pesos publicados están en BF16 y FP32; no se documentan versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16 en `grpo/`, `single-opd/`, `retireopd/`, `teacher95-historical-bf16/`; FP32 en `student100-fp32/`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal imagen-texto-a-texto de la familia Qwen3.5 de Alibaba, según la información disponible del modelo base. Sobre esa base, el autor ha aplicado entrenamiento por refuerzo para tareas de agente en ALFWorld. El repositorio incluye una variante entrenada con GRPO (Group Relative Policy Optimization), una variante "single-opd" y una variante "retireopd", además de un checkpoint "teacher" en el paso 95 y un "student" en el paso 100 en FP32. La nomenclatura sugiere un esquema de destilación con profesor (teacher-student) combinado con RL, aunque los detalles del algoritmo, la composición del dataset y el número de tokens de entrenamiento no están documentados en la model card.

La model card indica explícitamente que "los pesos FP32 del estudiante pueden cargarse en BF16 para experimentos" y que la consolidación del repositorio no convierte ni modifica los pesos. También señala que los pesos originales del modelo base están excluidos del repositorio. No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o modos de pensamiento. El código, los datos y los registros del experimento se mantienen en un repositorio de datasets privado enlazado desde la model card.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.5-4B, aunque no se documentan evaluaciones específicas para este checkpoint.
- Comportamiento agéntico en entornos textuales: el entrenamiento con RL sobre ALFWorld está orientado a la selección de acciones, navegación y manipulación de objetos en mundos simulados.
- Planificación multi-paso: el objetivo declarado de los experimentos es mejorar la ejecución de tareas de varios pasos en ALFWorld.
- Tool calling / function calling: no documentado para este checkpoint; el modelo base Qwen3.5 se presenta como orientado a agentes, pero no hay confirmación específica para estas variantes.
- Capacidades multimodales: el modelo base Qwen3.5-4B se describe como imagen-texto-a-texto; no se confirma que las variantes de ALFWorld conserven o hayan sido entrenadas para visión.
- Capacidades multilingües: no disponibles.
- Modo thinking: no disponible.

## Casos de uso

- Investigación en RL para agentes: el checkpoint GRPO puede utilizarse como punto de partida o referencia para reproducir experimentos de optimización de políticas en ALFWorld, comparando curvas de recompensa frente a las variantes OPD.
- Estudio de destilación profesor-alumno: los checkpoints `teacher95-historical-bf16/` y `student100-fp32/` permiten analizar la transferencia de comportamiento entre un profesor entrenado con RL y un estudiante destilado, evaluando la fidelidad de las acciones generadas.
- Benchmark de planificación textual: usar las variantes como línea base en tareas de navegación y manipulación de objetos en entornos TextWorld, midiendo tasas de éxito por episodio.
- Análisis de estabilidad del entrenamiento: comparar las variantes `single-opd/` y `retireopd/` para estudiar el efecto de distintas estrategias de retirada de datos o de profesor sobre la política final.
- Reproducibilidad de experimentos: el repositorio incluye manifiestos con checksums (`_manifests/repository_consolidation.json`) y un archivo de procedencia (`provenance/legacy-checkpoint-archive/`), lo que facilita la verificación de integridad en estudios de reproducibilidad.
- Fine-tuning posterior para dominios específicos: al estar bajo Apache 2.0 y en safetensors, los pesos pueden servir como inicialización para tareas de agente en otros entornos textuales, aunque sin garantías de rendimiento fuera de ALFWorld.
- Docencia y divulgación: ejemplo práctico de publicación de checkpoints intermedios de RL con estructura de repositorio consolidada y trazabilidad de ficheros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el tamaño del modelo base (~4-5B parámetros), en BF16 se requerirían aproximadamente 8-10 GB solo para pesos, más overhead de activaciones y KV cache; en FP32, aproximadamente 16-20 GB solo para pesos. Estas cifras son estimaciones y no proceden de la documentación del modelo.
- GPU recomendadas: no documentadas. Por tamaño, cabría esperar compatibilidad con GPUs de 16-24 GB (RTX 4090, A10G, L4) en BF16, y con A100/H100 para entrenamiento o inferencia en FP32.
- ¿Cabe en GPU de consumo? Probablemente sí en BF16 en GPUs con 16 GB o más, pero no está confirmado por el autor.
- Opciones de despliegue: no documentadas. Al estar en safetensors, sería compatible con frameworks estándar (Transformers, vLLM, TGI) si la arquitectura del modelo base lo permite, pero no hay instrucciones ni configuración publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ALFWorld-Qwen3.5-4B (este) | ~4-5B (heredados) | no disponible | RL para agente en ALFWorld | Apache 2.0 | Hugging Face (checkpoints experimentales) |
| Qwen/Qwen3.5-4B | ~4-5B | no disponible en la información | Modelo base multimodal imagen-texto-a-texto | no disponible en la información | Hugging Face |
| Qwen3-4B | 4B | no disponible en la información | LLM multilingüe base | no disponible en la información | Hugging Face, Qualcomm AI Hub |
| WebShop-Qwen3.5-4B (dingwenjun) | ~4-5B (heredados) | no disponible | RL para agente en WebShop | no disponible en la información | Hugging Face |

## Limitaciones y advertencias

- Ausencia de evaluación publicada: no hay benchmarks, tasas de éxito en ALFWorld ni métricas de recompensa documentadas, lo que impide validar la calidad de los checkpoints.
- Documentación mínima: la model card no describe el dataset de entrenamiento, hiperparámetros, número de pasos ni criterios de selección de checkpoints.
- Riesgo de alucinación: inherente a los modelos generativos; sin evaluación específica no puede cuantificarse para estas variantes.
- Sesgos: no documentados; al derivar del modelo base, puede heredar sesgos de Qwen3.5-4B no caracterizados en este repositorio.
- Limitaciones de idioma y contexto: no disponibles; no se confirma el soporte multilingüe ni la ventana de contexto efectiva tras el entrenamiento con RL.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar también la licencia del modelo base Qwen3.5-4B.
- Uso en producción: los checkpoints están pensados para experimentación; no hay versiones cuantizadas, plantillas de prompt ni instrucciones de despliegue.
- Dependencia de un repositorio de datos privado: el código y los datos del experimento están en un dataset enlazado que puede no ser público, lo que dificulta la reproducción completa.
- Tamaño del repositorio: 58,4 GB con múltiples variantes; la descarga completa no es necesaria si solo se requiere una subcarpeta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dingwenjun/ALFWorld-Qwen3.5-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Perfil del autor: https://huggingface.co/dingwenjun/models
- Dataset de registros del experimento: https://huggingface.co/datasets/dingwenjun/ALFWorld-Qwen3.5-4B-records
- Modelo relacionado WebShop-Qwen3.5-4B: https://huggingface.co/dingwenjun/WebShop-Qwen3.5-4B
- Artículo sobre Qwen3.5 (CNBC): https://www.cnbc.com/2026/02/17/china-alibaba-qwen-ai-agent-latest-model.html
- Qwen3-4B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b
- Qwen3.5 4B en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-5-4b/
