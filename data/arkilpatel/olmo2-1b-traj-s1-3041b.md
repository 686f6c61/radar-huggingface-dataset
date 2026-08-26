# arkilpatel/olmo2-1b-traj-s1-3041b

## Resumen

Este repositorio contiene la trayectoria completa de entrenamiento con aprendizaje por refuerzo (RL) del modelo OLMo-2-1B, desarrollado por Allen Institute for AI (AI2). En concreto, se trata de 43 checkpoints intermedios que documentan la evolución del modelo durante la fase de RL, partiendo del checkpoint de pretraining `stage1-step1450000-tokens3041B` (1.45 millones de pasos, 3.041 billones de tokens). El autor, arkilpatel, ha publicado estos artefactos para facilitar la investigación sobre la dinámica del entrenamiento por RL en modelos de lenguaje abiertos.

El modelo base OLMo-2-1B es un transformer decoder-only de aproximadamente 1.000 millones de parámetros, con licencia Apache 2.0, diseñado por AI2 dentro de su iniciativa de ciencia abierta. La relevancia de este repositorio reside en que permite estudiar cómo evoluciona un modelo durante el RL paso a paso, algo poco común en la literatura abierta. No se trata de un modelo listo para producción, sino de un recurso de investigación.

El repositorio ocupa 127.7 GB y almacena los pesos en formato bf16, exclusivamente para inferencia. No se proporciona información sobre la longitud de contexto, los idiomas soportados ni los resultados de benchmarks en la model card original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-2) |
| Parametros totales | 1.000 millones (aproximadamente 1.2B con embeddings) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la familia OLMo-2 usa 2048 tokens en la base) |
| Tipos de cuantizacion | bf16 |
| Idiomas soportados | no disponible (OLMo-2 se entrena principalmente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

OLMo-2-1B es un transformador decoder-only estándar con atención causal, similar a LLaMA. El modelo base fue preentrenado durante la ronda `stage1-step1450000-tokens3041B`, es decir, 1.45 millones de pasos sobre 3.041 billones de tokens. Este repositorio concreto no contiene el modelo base, sino los 43 checkpoints intermedios del entrenamiento posterior con RL, cada uno almacenado en un directorio `step-XXXX/`. No se especifica qué algoritmo de RL se utilizó (PPO, GRPO, etc.), ni el dataset de recompensas, ni si se aplicó DPO en alguna fase. Los pesos están en bf16 y se indican como "inference only", lo que sugiere que no se recomienda continuar el entrenamiento desde estos checkpoints.

## Capacidades

- Generación de texto autoregresiva con contexto de hasta 2048 tokens (según la familia OLMo-2, no confirmado para este repo).
- Razonamiento de nivel básico y comprensión de lenguaje natural, heredados del pretraining.
- Generación de código y matemáticas elementales, como corresponde a un modelo de 1B preentrenado en 3T tokens.
- Sin soporte de tool calling ni function calling (no es un modelo instruct).
- Sin capacidades multimodales, ni vision ni audio.
- Sin modo de pensamiento explícito (thinking mode) en estos checkpoints de RL.

## Casos de uso

- **Investigación sobre dinámica de RL**: comparar los 43 checkpoints para estudiar cómo cambia la distribución de salidas, la pérdida y la calidad generativa a lo largo de las etapas de RL. Se pueden usar métricas como perplexity o evaluaciones de tareas para trazar curvas de entrenamiento.
- **Análisis de colapso de modelo**: detectar si en algún checkpoint aparece colapso de la política (mode collapse) o degradación de la diversidad de respuestas, algo crítico en RL para LLMs.
- **Estudio de la alineación temprana**: observar en qué paso empieza el modelo a alinearse con la recompensa y cómo se comporta en tareas de instrucción antes de completar el RL.
- **Calibración de recompensas**: usar estos checkpoints para evaluar la eficacia de funciones de recompensa o reward models en un entorno controlado de 1B.
- **Educación y docencia**: material didáctico para cursos de aprendizaje por refuerzo aplicado a LLMs, donde se pueden visualizar las etapas del entrenamiento.
- **Reproducibilidad de experimentos**: como base para reproducir pipelines de RL con OLMo-2 y comparar trayectorias de entrenamiento con variantes de hiperparámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica que son checkpoints intermedios de RL y no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Para conocer el rendimiento del modelo base OLMo-2-1B, se debe consultar la ficha del modelo original en HuggingFace (`allenai/OLMo-2-0425-1B`).

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 1.000 millones de parámetros en bf16, el modelo ocupa aproximadamente 2.1 GB en memoria (más overhead de atención y KV cache). Con cuantización adicional (no incluida en el repo) podría reducirse a ~1 GB.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM es suficiente. Ejemplos: NVIDIA RTX 3060, RTX 4060, T4, A10. Para experimentos con los 43 checkpoints simultáneamente, se necesitaría almacenamiento de ~128 GB y RAM suficiente para cargar varios.
- **Cabe en GPU de consumo**: sí, tanto en tarjetas de 8 GB como en las de 12 GB o 16 GB sin problema.
- **Opciones de despliegue**: como es un modelo de investigación, se recomienda usar la librería `transformers` de HuggingFace para cargar cada checkpoint individual. Para inferencia de baja latencia, se puede exportar a formato GGUF con `llama.cpp` o desplegar con vLLM, aunque el formato bf16 original es el más adecuado para análisis.
- **Latencia y throughput**: para un modelo de 1B en una RTX 4090, la generación típica es de 50-100 tokens por segundo en bf16 con batch de 1. No se han publicado mediciones específicas para estos checkpoints.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Uso |
|---|---|---|---|---|---|
| `arkilpatel/olmo2-1b-traj-s1-3041b` | 1B | no disponible (2048 en base) | Apache 2.0 | bf16 (safetensors) | Checkpoints de RL para investigación |
| `allenai/OLMo-2-0425-1B` | 1B | 2048 | Apache 2.0 | bf16 | Modelo base preentrenado |
| `allenai/OLMo-2-0425-1B-Instruct` | 1B | 2048 | Apache 2.0 | bf16 | Modelo instruct (SFT+DPO) |

La diferencia principal entre estos tres es el estado de entrenamiento: el base es el modelo preentrenado, el instruct es el modelo alineado con instrucciones, y el de este repositorio son los pasos intermedios de RL entre ambos (aunque no se especifica si el RL corresponde exactamente al pipeline de OLMo-2-Instruct). El repositorio de `arkilpatel` es único en cuanto a que publica la trayectoria completa, algo que ni AI2 ni otros proveedores ofrecen habitualmente.

## Limitaciones y advertencias

- **No es un modelo de producción**: son checkpoints intermedios de RL, no un modelo instruct final. No debe usarse para aplicaciones de usuario final sin un proceso de alineación completo.
- **Sesgos y alucinaciones**: al ser un modelo de 1B preentrenado en 3T tokens, tiene limitaciones intrínsecas de conocimiento y puede alucinar con facilidad, especialmente en dominios especializados.
- **Idiomas**: el entrenamiento base de OLMo-2 se centra en inglés; el rendimiento en otros idiomas, incluido el español, será notablemente inferior.
- **Sin garantía de calidad**: no se proporcionan métricas de evaluación, por lo que no se puede verificar la calidad de cada checkpoint.
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial, pero el modelo no está pensado para producción y carece de garantías.
- **Formato bf16**: requiere hardware compatible con bfloat16 (GPUs NVIDIA de arquitectura Ampere o posterior) para inferencia eficiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/arkilpatel/olmo2-1b-traj-s1-3041b
- Modelo base OLMo-2-1B: https://huggingface.co/allenai/OLMo-2-0425-1B
- Modelo instruct OLMo-2-1B: https://huggingface.co/allenai/OLMo-2-0425-1B-Instruct
- Repositorio OLMo en GitHub: https://github.com/allenai/OLMo
- Página oficial de OLMo: https://allenai.org/olmo
- Página oficial de OLMo-2: https://allenai.org/olmo2
