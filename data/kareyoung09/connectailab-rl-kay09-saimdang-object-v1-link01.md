# kareyoung09/connectailab-rl-kay09-saimdang-object-v1-link01

## Resumen

LINK-01 es un adaptador LoRA de aprendizaje por refuerzo (RL) construido sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por el autor kareyoung09 en el marco del proyecto CONNECT AI LAB × AI CITY BUILDERS. Su propósito no es la generación de texto general, sino la toma de decisiones de alto nivel en robótica: concretamente, la tarea `choose_object` (selección de objetos) para el robot bípedo LINK-01. El modelo recibe observaciones del entorno del robot y emite decisiones de acción en lenguaje natural, actuando como una política de decisión ligera.

La relevancia de esta ficha es acotada pero ilustrativa: se trata de un ejemplo de cómo un modelo de lenguaje pequeño (0,8B parámetros) puede adaptarse mediante PEFT y RL (PPO) para control de robots, en lugar de emplear políticas específicas entrenadas desde cero. El autor reporta una tasa de acierto del 97,7% en el examen de la tarea y un 100,0% de éxito en 20 episodios de conducción real simulada, si bien estos datos provienen únicamente de la model card y no han sido verificados de forma independiente.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB, lo que sugiere que contiene únicamente los pesos del adaptador LoRA (no los del modelo base). El idioma declarado es coreano (`ko`), coherente con el contexto del proyecto (persona `sinsaimdang`). La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-0.8B |
| Parametros totales | No disponible (el adaptador LoRA no declara su número de parámetros; el modelo base tiene 0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen/Qwen3.5-0.8B, no especificada en la información) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (`ko`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) acoplado a Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El adaptador se entrena mediante aprendizaje por refuerzo, concretamente con PPO (Proximal Policy Optimization), según los tags del repositorio (`ppo`, `reinforcement-learning`, `deep-reinforcement-learning`). El pipeline declarado es `reinforcement-learning`, lo que indica que el artefacto se distribuye como política entrenada por RL y no como un modelo de lenguaje instruido de forma supervisada.

La tarea objetivo es `choose_object`: dado un conjunto de observaciones del robot bípedo LINK-01, el modelo debe seleccionar el objeto adecuado como acción de alto nivel. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, la configuración del reward ni los hiperparámetros de PPO. Tampoco se documenta si hubo fases previas de SFT o DPO. La única innovación técnica declarada es el uso de RL sobre un modelo base pequeño para obtener una política de decisión en lenguaje, con métricas de evaluación (97,7% de acierto y 100,0% de éxito en 20 episodios) reportadas por el autor.

## Capacidades

- Toma de decisiones de alto nivel para robótica: selección de objetos (`choose_object`) a partir de observaciones del robot bípedo LINK-01.
- Generación de acciones en formato de lenguaje natural, aprovechando la interfaz del modelo base Qwen.
- Entrenamiento mediante RL (PPO) orientado a maximizar la tasa de éxito de la tarea, no a la conversación general.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (la política está especializada en una única decisión).
- Capacidades multilingües: limitadas al coreano (`ko`) según la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Selección de objetos en robótica de servicio: el modelo recibe el estado observado del robot LINK-01 y emite la decisión `choose_object`, integrándose en el bucle de control de alto nivel del robot. Es adecuado por su tamaño reducido (0,8B) y su entrenamiento específico para esta tarea.
- Prototipado de políticas de decisión con modelos de lenguaje pequeños: sirve como referencia para investigadores que quieran sustituir políticas específicas por un LLM adaptado con LoRA + PPO en entornos simulados.
- Evaluación de técnicas de RL sobre modelos fundacionales: el adaptador permite reproducir el flujo PEFT + PPO sobre Qwen3.5-0.8B y comparar con políticas entrenadas desde cero.
- Investigación en interacción lenguaje-acción: útil para estudiar cómo un modelo de lenguaje de 0,8B traduce observaciones estructuradas en acciones discretas de alto nivel.
- Despliegue en entornos con recursos limitados: al ser un adaptador LoRA sobre un modelo de 0,8B, el coste de inferencia es bajo y puede ejecutarse en hardware modesto (sujeto a verificación empírica).
- Base para fine-tuning adicional en tareas robóticas relacionadas: el adaptador puede servir como punto de partida para otras tareas del mismo robot (por ejemplo, navegación o manipulación), aunque no se documenta esta extensibilidad.

## Benchmarks y rendimiento

Los únicos datos disponibles provienen de la model card del autor y no han sido verificados de forma independiente:

| Metrica | Valor reportado |
|---|---|
| Tasa de acierto en el examen de la tarea (`Accuracy`) | 97,7% |
| Tasa de éxito en 20 episodios de conducción real (`Drive Success`) | 100,0% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia, un modelo base de 0,8B en precisión FP16 requiere aproximadamente 1,6 GB solo para los pesos, más el adaptador LoRA y el overhead de activaciones; en cuantización de 4 bits podría caber en GPUs consumer de 4-6 GB, pero no se confirma en la información.
- GPU recomendadas: no disponibles. Por tamaño, cabría en GPUs consumer como RTX 3060, RTX 4060 o superiores, así como en A100/H100 para despliegues por lotes, pero no se documenta.
- ¿Cabe en GPU consumer? Probablemente sí, dado el tamaño del modelo base, pero no se confirma.
- Opciones de despliegue: la model card solo muestra uso con `transformers` + `peft`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (adaptadores RL para robótica sobre modelos de lenguaje pequeños). Se indica "no disponible".

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LINK-01 (este modelo) | Adaptador LoRA sobre Qwen3.5-0.8B | No disponible | 97,7% accuracy (reportado) | Apache 2.0 | HuggingFace |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado para una única tarea (`choose_object`) y no es un modelo de propósito general; su uso fuera de ese contexto no está validado.
- Idiomas: solo se declara coreano; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Métricas no verificadas: los valores de 97,7% y 100,0% provienen exclusivamente de la model card del autor y no han sido replicados de forma independiente.
- Riesgo de alucinación: al ser un modelo de lenguaje, puede generar acciones no válidas o inconsistentes con el estado del robot; se requiere un validador o filtro en producción.
- Sesgos: no se documentan sesgos conocidos, pero al estar entrenado en un entorno y una persona concretos (`sinsaimdang`), puede no generalizar a otras configuraciones.
- Licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen/Qwen3.5-0.8B, que puede imponer condiciones adicionales.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia de uso en producción.
- Falta de documentación: no se detallan hiperparámetros de entrenamiento, dataset, recompensas ni procedimiento de evaluación, lo que dificulta la reproducibilidad.

## Enlaces

- HuggingFace: https://huggingface.co/kareyoung09/connectailab-rl-kay09-saimdang-object-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
