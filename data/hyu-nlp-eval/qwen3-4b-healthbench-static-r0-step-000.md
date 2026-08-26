# HYU-NLP-EVAL/qwen3-4b-healthbench-static-r0-step-000

## Resumen

El modelo `HYU-NLP-EVAL/qwen3-4b-healthbench-static-r0-step-000` es un checkpoint de inicialización (paso 0) de un experimento de aprendizaje por refuerzo (RL) sobre el benchmark HealthBench, desarrollado por el grupo HYU-NLP-EVAL. Se basa en el modelo `Qwen/Qwen3-4B-Instruct-2507` y forma parte de un estudio sobre la influencia de rúbricas de evaluación estáticas y congeladas durante la optimización de políticas. Este checkpoint concreto representa el estado inicial de la política (`pi_0`) antes de cualquier actualización del optimizador, por lo que sus pesos son idénticos a los del modelo base.

El objetivo del experimento es analizar la "staleness" (obsolescencia) de las rúbricas proxy durante el entrenamiento con RL, utilizando un banco de rúbricas específicas para cada prompt de entrenamiento, congeladas durante todo el proceso. El modelo está pensado exclusivamente para investigación académica y no debe emplearse como dispositivo médico ni como sustituto del consejo profesional sanitario. Su relevancia radica en proporcionar un punto de partida reproducible para estudiar la dinámica de recompensas en dominios de alto riesgo como la salud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Qwen3) |
| Parametros totales | 4.022.468.096 (4,02 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredado del modelo base, no especificado en la ficha) |
| Tipos de cuantizacion | No disponible (exportado en BF16) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El checkpoint es una copia exacta del modelo base `Qwen/Qwen3-4B-Instruct-2507`, un transformer decoder-only con atención causal. No se han aplicado actualizaciones de pesos en este paso, ya que es el punto de partida del experimento de RL. El entrenamiento planificado utiliza un esquema de recompensa basado en rúbricas estáticas: cada prompt de entrenamiento (256 prompts de HealthBench) tiene asignada una rúbrica congelada `R0(x)` que se mantiene fija durante toda la optimización. No se emplea RLHF ni DPO; se trata de RL con recompensa externa derivada de las rúbricas. La innovación técnica reside en el uso de rúbricas estáticas para investigar cómo la falta de actualización de las mismas afecta a la convergencia y a la calidad final de la política.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3-4B-Instruct-2507.
- Razonamiento y comprensión del lenguaje, tal y como las ofrece el modelo base.
- No se especifican capacidades adicionales (tool calling, agentes, visión, etc.) en la model card del checkpoint.
- Al ser un checkpoint de inicialización, no presenta ninguna capacidad específica derivada del entrenamiento con RL.

## Casos de uso

- Investigación académica en optimización de políticas de RL para dominios médicos: el checkpoint sirve como punto de partida para ejecutar experimentos controlados con rúbricas estáticas.
- Estudio de la staleness de recompensas proxy: permite comparar la evolución de la política cuando las rúbricas no se actualizan frente a esquemas dinámicos.
- Reproducibilidad de experimentos: al ser un paso 0 bien definido, facilita la replicación de resultados en entornos de investigación.
- Análisis de la sensibilidad del modelo base a señales de recompensa congeladas: útil para entender cómo responde Qwen3-4B a feedback externo en tareas de salud.
- Desarrollo de metodologías de evaluación para benchmarks conversacionales: el checkpoint puede usarse como baseline en estudios sobre HealthBench.
- Formación de investigadores en técnicas de RL para LLMs: sirve como ejemplo didáctico de un pipeline de entrenamiento con recompensas basadas en rúbricas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte explícitamente de que la mejora de la recompensa con rúbricas estáticas no establece por sí misma una mejora frente a la ground truth independiente de HealthBench.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8 GB en BF16 (4,02 B parámetros × 2 bytes), 4 GB en cuantización de 8 bits y 2 GB en 4 bits (estimaciones basadas en el tamaño de parámetros).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para BF16 (p. ej., RTX 3090, RTX 4090, A10, A100). Para cuantizaciones más bajas, GPUs con 4-6 GB pueden ser suficientes.
- El modelo cabe en GPUs de consumo como la RTX 3060 (12 GB) o superiores.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Hugging Face Inference Endpoints (el repo es compatible con text-generation-inference).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. Al tratarse de un checkpoint de investigación sin resultados de rendimiento publicados, no es posible compararlo de forma significativa con otros modelos de la misma categoría. Su propósito es experimental y no está orientado a producción.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un dispositivo médico; no debe utilizarse como sustituto del consejo médico profesional.
- La mejora de la recompensa con rúbricas estáticas no implica necesariamente una mejora frente a la ground truth independiente de HealthBench.
- Al ser un paso de inicialización, no ha sido sometido a ningún entrenamiento adicional, por lo que sus capacidades son las del modelo base, con los sesgos y limitaciones inherentes a este.
- No se especifican restricciones de uso comercial más allá de la licencia Apache-2.0, pero su naturaleza experimental desaconseja su uso en entornos productivos.
- La longitud de contexto y los idiomas soportados no están documentados en la ficha, por lo que se desconocen sus límites exactos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-healthbench-static-r0-step-000)
- [Modelo base Qwen3-4B-Instruct-2507](https://huggingface.co/Qwen/Qwen3-4B)
- [Documentación de Qwen3 en Transformers](https://huggingface.co/docs/transformers/model_doc/qwen3)
- [Paper de HealthBench (arXiv:2505.08775)](https://arxiv.org/abs/2505.08775)
- [HealthBench Leaderboard en llm-stats.com](https://llm-stats.com/benchmarks/healthbench)
