# kareyoung09/connectailab-rl-kay09-jeongyakyong-target-v1-link01

## Resumen

LINK-01 es un adaptador LoRA de aprendizaje por refuerzo (RL) construido sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario kareyoung09 en el marco de la colaboración CONNECT AI LAB × AI CITY BUILDERS (proyecto LINK-01). Su propósito es actuar como política de decisión de alto nivel para un robot bípedo denominado LINK-01: a partir de las observaciones del robot, el modelo debe seleccionar la acción de alto nivel adecuada para la tarea `goto_target` (desplazarse hasta un objetivo).

El modelo no es un LLM de propósito general, sino un adaptador PEFT (LoRA) entrenado con PPO para una tarea de toma de decisiones secuenciales en robótica. Con solo 0,8 mil millones de parámetros en el modelo base, está pensado para inferencia ligera y despliegue en el bucle de control del robot, no para generación de texto abierta.

Su relevancia es fundamentalmente experimental y de investigación: ilustra el uso de modelos de lenguaje pequeños como cabezas de decisión en sistemas robóticos. Conviene señalar desde el inicio que la model card reporta una precisión del 74,7 % en el conjunto de prueba pero un 0,0 % de éxito en 20 episodios de conducción reales, lo que indica una brecha severa entre evaluación offline y despliegue físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT); entrenamiento RL con PPO |
| Parametros totales | 0,8 mil millones (modelo base); el adaptador LoRA añade un número no especificado de parámetros entrenables |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El adaptador se entrena mediante aprendizaje por refuerzo con PPO (Proximal Policy Optimization), según los tags y la model card. El pipeline declarado es `reinforcement-learning` y los tags incluyen `deep-reinforcement-learning`, `ppo`, `robotics` y `decision-making`, lo que confirma que el objetivo no es el ajuste supervisado clásico de instrucciones, sino la optimización de una política de decisión.

No se proporcionan datos sobre el volumen de tokens de entrenamiento, la composición del dataset, el diseño de la función de recompensa, el número de pasos de PPO ni los hiperparámetros del adaptador (rango, alpha, capas objetivo). Tampoco se documenta si hubo fases previas de SFT o DPO. La innovación técnica declarada es el uso de un LLM pequeño como política de alto nivel para un robot bípedo, mapeando observaciones a acciones discretas de navegación.

## Capacidades

- Toma de decisiones de alto nivel para robótica: selección de acciones a partir de observaciones del robot bípedo LINK-01.
- Tarea específica `goto_target`: navegación hacia un objetivo designado.
- Entrenamiento con RL (PPO) orientado a maximizar recompensa en el entorno de simulación o evaluación correspondiente.
- Soporte del idioma coreano, coherente con el modelo base y el contexto del proyecto.
- Integración como adaptador PEFT sobre Qwen3.5-0.8B mediante `transformers` y `peft`.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en políticas de decisión con LLM pequeños: usar el adaptador como referencia para estudiar cómo un modelo de 0,8B puede mapear observaciones robóticas a acciones de alto nivel, comparando la precisión offline (74,7 %) con el rendimiento en despliegue.
- Prototipado de navegación en simulación: integrar el adaptador en un entorno simulado de LINK-01 para reproducir la tarea `goto_target` antes de transferir la política a hardware real, dado el bajo éxito en conducción real reportado.
- Baseline para ablaciones de RL: emplear este adaptador como punto de partida en experimentos que varíen la función de recompensa, el volumen de datos o el rango del LoRA, midiendo el impacto en la tasa de éxito.
- Estudio de la brecha sim-to-real: analizar por qué un 74,7 % de precisión en test se traduce en un 0,0 % de éxito en 20 episodios reales, un caso útil para investigar sobreajuste a distribuciones de observación del conjunto de evaluación.
- Evaluación de modelos base pequeños en robótica: comparar Qwen3.5-0.8B con otros modelos base de tamaño similar como cabeza de decisión, manteniendo el mismo pipeline PEFT + PPO.
- Docencia y demostraciones: ejemplo didáctico de cómo aplicar LoRA y PPO a un LLM para una tarea de control, con código de carga reproducible en pocas líneas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision en test (Accuracy) | 74,7 % |
| Exito en conduccion real (20 episodios) | 0,0 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la información disponible, lo cual es esperable dado que el modelo es un adaptador de RL para robótica y no un LLM de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con un modelo base de 0,8B en precisión de 16 bits se sitúa en torno a 1,6-2 GB de pesos, más el adaptador LoRA y el overhead de activaciones.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU consumer moderna (RTX 3060 en adelante) debería alojar el modelo base en FP16.
- Cabe en GPU consumer: sí, previsiblemente, dado el tamaño de 0,8B, aunque el autor no lo documenta.
- Opciones de despliegue: `transformers` + `peft` según el ejemplo de la model card; vLLM, llama.cpp, Ollama o TGI no están documentados para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LINK-01 (este modelo) | 0,8B (base) + LoRA | no disponible | RL/PPO para robótica bípeda | Apache 2.0 | HuggingFace |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | no disponible | LLM generalista | no disponible en la informacion | HuggingFace |
| Otros adaptadores RL para robótica de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables directos en la misma categoría (adaptadores RL sobre LLM pequeños para robótica bípeda) en la documentación proporcionada.

## Limitaciones y advertencias

- Brecha crítica sim-to-real: la precisión offline del 74,7 % contrasta con un 0,0 % de éxito en 20 episodios de conducción real, lo que desaconseja su uso directo en producción sin validación adicional.
- Especialización extrema: el adaptador está entrenado para una única tarea (`goto_target`) y una única persona/contexto (`jeongyakyong`); no generaliza a otras tareas de navegación o control.
- Idioma: soporte declarado únicamente en coreano.
- Riesgo de alucinación: como LLM subyacente, puede generar acciones o tokens fuera de la distribución esperada por el entorno de control.
- Sesgos: no documentados por el autor; el modelo hereda los sesgos del corpus de entrenamiento de Qwen3.5-0.8B, no evaluados aquí.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen/Qwen3.5-0.8B, no disponible en la información proporcionada.
- Documentación insuficiente: sin datos sobre contexto, cuantización, hiperparámetros de entrenamiento ni protocolo de evaluación, lo que dificulta la reproducibilidad.
- Sin métricas de robustez: no se reportan evaluaciones ante perturbaciones de observación, cambios de terreno o variaciones de iluminación.

## Enlaces

- HuggingFace: https://huggingface.co/kareyoung09/connectailab-rl-kay09-jeongyakyong-target-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- No se han encontrado en la búsqueda web papers, blogs, repositorios o demos adicionales asociados a este modelo.
