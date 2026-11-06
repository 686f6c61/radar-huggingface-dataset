# sapraj/scottyrl-a3-p5_textcraft_grpo

## Resumen

`sapraj/scottyrl-a3-p5_textcraft_grpo` es un adaptador LoRA (rank 32) entrenado sobre `Qwen/Qwen3.5-4B` con el framework scottyrl, desarrollado por el usuario sapraj como trabajo para la asignatura 11-768 (AI Agents) de Carnegie Mellon University. El adaptador se entrenó mediante GRPO (Group Relative Policy Optimization) sobre la tarea TextCraft, un entorno de fabricación de objetos basado en texto que exige razonamiento multi-paso y seguimiento de instrucciones.

No se trata de un modelo de propósito general, sino de un checkpoint académico: su objetivo es demostrar el uso de RL con recompensa verificable (GRPO) para mejorar el comportamiento de un agente en un entorno concreto. Es relevante como ejemplo práctico de post-entrenamiento con PEFT sobre modelos abiertos pequeños y como material reproducible de un curso universitario.

La descarga del adaptador es de 0,2 GB y se sirve con vLLM mediante soporte LoRA dinámico sobre el modelo base. No hay model card detallada con métricas de evaluación, por lo que varias especificaciones no están disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 32) sobre Qwen3.5-4B (transformer decoder) |
| Parametros totales | no disponible (modelo base: ~4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada de Qwen3.5-4B) |
| Tipos de cuantizacion | no disponible (pesos en precisión nativa del adaptador) |
| Idiomas soportados | no disponible (entrenado para la tarea TextCraft, en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador sigue la arquitectura PEFT/LoRA estándar: matrices de bajo rango (rank 32) inyectadas en las capas de atención del modelo base Qwen3.5-4B, sin modificar los pesos originales. El tag `11-768` identifica la asignatura de origen y el run de entrenamiento es `p5_textcraft_grpo`, exportado desde `tinker://model_29a7f1ef/v50_r2`, lo que indica que el entrenamiento se realizó con la plataforma Tinker.

El método de entrenamiento es GRPO (Group Relative Policy Optimization), un algoritmo de RL con recompensa que compara grupos de respuestas muestreadas y ajusta la política en función de recompensas relativas, sin necesidad de un modelo de recompensa entrenado aparte. La recompensa proviene del entorno TextCraft-Synth, donde el agente debe completar tareas de crafteo de objetos mediante acciones textuales. No hay información pública sobre el número de pasos de entrenamiento, el tamaño del dataset ni los hiperparámetros exactos (se referencian en `configs/p5_textcraft_grpo.yaml` del repositorio original del curso, no incluido aquí).

## Capacidades

- Resolución de tareas del entorno TextCraft-Synth: planificación de secuencias de crafteo a partir de recetas textuales.
- Razonamiento multi-paso agéntico: encadenar acciones (obtener ingredientes, combinarlos) hasta alcanzar el objetivo.
- Seguimiento de instrucciones y formatos de acción del entorno.
- Uso como adaptador intercambiable en servidores vLLM con LoRA dinámico, manteniendo intactas las capacidades generales del modelo base cuando se desactiva.
- No está diseñado ni evaluado para generación de texto general, código, matemáticas, visión ni audio.

## Casos de uso

- Evaluación académica de agentes: los graders del curso sirven el adaptador con vLLM y ejecutan scripts de evaluación sobre los splits de validación medium y hard de TextCraft-Synth con muestreo k=4.
- Investigación en RL con recompensa verificable: punto de partida reproducible para experimentar con GRPO en entornos agénticos textuales.
- Comparación de checkpoints: permite medir el efecto del post-entrenamiento RL frente al modelo base en la misma tarea.
- Enseñanza de PEFT: ejemplo real de cómo entrenar y desplegar un adaptador LoRA de 0,2 GB sobre un modelo de 4B.
- Prototipado de agentes de planificación: la mejora en TextCraft puede transferirse como referencia a tareas de planificación con estados y objetivos en lenguaje natural.
- Benchmarking de infraestructura LoRA: útil para probar el soporte de `--enable-lora` y `--max-lora-rank 32` en vLLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el procedimiento de evaluación (scripts del curso sobre los splits medium y hard de TextCraft-Synth con k=4 muestras), pero no incluye tasas de éxito ni métricas numéricas.

## Requisitos de hardware

- El adaptador pesa 0,2 GB, pero la inferencia requiere cargar el modelo base Qwen3.5-4B completo.
- VRAM estimada para Qwen3.5-4B en FP16/BF16: aproximadamente 8-10 GB; con cuantización a 4 bits, alrededor de 3-4 GB (la cuantización del modelo base no está documentada en la model card).
- GPU recomendadas: una RTX 4090 (24 GB) o una A100/H100 sirven el modelo con vLLM sin problemas; también debería funcionar en GPUs de consumo de 12-16 GB como la RTX 3060 12GB o RTX 4070 Ti Super.
- Despliegue documentado: vLLM con `--enable-lora --max-lora-rank 32 --lora-modules a3=sapraj/scottyrl-a3-p5_textcraft_grpo`. No hay instrucciones para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sapraj/scottyrl-a3-p5_textcraft_grpo | Adaptador LoRA (GRPO, TextCraft) | Qwen3.5-4B | 0,2 GB | no disponible | Público en Hugging Face |
| Qwen/Qwen3.5-4B | Modelo base general | — | ~4B | no disponible en esta ficha | Público en Hugging Face |
| Adaptadores LoRA típicos de PEFT | Adaptador de tarea | variable | 0,05-1 GB | variable | Patrón equivalente en Hugging Face |

No existen alternativas directamente comparables publicadas (es un checkpoint académico de un curso específico), por lo que la comparación se limita al modelo base y al patrón general de adaptadores PEFT.

## Limitaciones y advertencias

- Alcance muy estrecho: el adaptador está optimizado para TextCraft-Synth y puede degradar el comportamiento del modelo base fuera de esa tarea.
- Sin licencia declarada: el uso comercial requiere verificar primero la licencia del modelo base Qwen3.5-4B y la del propio repositorio, que figura como no disponible.
- Sin métricas publicadas: no hay tasas de éxito ni comparaciones cuantitativas con el modelo base, por lo que la eficacia del adaptador no puede verificarse desde la model card.
- Riesgo de alucinación: al ser un fine-tuning de un modelo pequeño de 4B, hereda los riesgos habituales de generación de contenido incorrecto, especialmente fuera de su dominio de entrenamiento.
- Sesgos: hereda los sesgos del modelo base y del corpus de preentrenamiento de Qwen; no se ha realizado ningún análisis de sesgos específico.
- Dependencia de infraestructura: la evaluación requiere vLLM con soporte LoRA dinámico; no está documentada la compatibilidad con otros runtimes.
- Proyecto académico con 0 descargas y 0 likes: sin validación comunitaria ni mantenimiento garantizado.

## Enlaces

- Hugging Face: https://huggingface.co/sapraj/scottyrl-a3-p5_textcraft_grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de la librería PEFT: https://github.com/huggingface/peft
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- No se han encontrado enlaces adicionales (paper, blog o demo) en la informacion disponible.
