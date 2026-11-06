# kareyoung09/connectailab-rl-kay09-sejong-obstacle-v1-link01

## Resumen

LINK-01 es un adaptador LoRA de aprendizaje por refuerzo (PPO) construido sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por CONNECT AI LAB en colaboración con AI CITY BUILDERS dentro del proyecto LINK-01. Su función es actuar como módulo de decisión de alto nivel para un robot bípedo LINK-01: a partir de las observaciones del entorno, el modelo emite acciones de alto nivel, en este caso la tarea concreta de evitar obstáculos (avoid_obstacles). No es un modelo de propósito general, sino un componente de política entrenado para un dominio robótico específico.

El modelo se distribuye como adaptador PEFT (LoRA) en formato safetensors, con licencia Apache 2.0 y un tamaño de repositorio de 0.0 GB, lo que indica que solo se publican los pesos del adaptador y no los del modelo base. La arquitectura subyacente es la del transformer de Qwen3.5-0.8B, con aproximadamente 0.8 mil millones de parámetros en el modelo base; el adaptador añade un conjunto reducido de parámetros entrenables. El idioma declarado es coreano (ko), coherente con el contexto del proyecto.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, orientado a la evaluación de políticas de decisión en robótica mediante modelos de lenguaje pequeños. Su interés radica en demostrar el uso de un LLM de 0.8B como cabecera de decisión para control robótico, con métricas declaradas de precisión en test (69.4%) y éxito de conducción en 20 episodios (100.0%).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-0.8B) con adaptador LoRA entrenado mediante PPO |
| Parametros totales | No disponible (modelo base de ~0.8B; el adaptador LoRA añade un subconjunto no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (PEFT) sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 0.8 mil millones de parámetros. El adaptador se entrena con aprendizaje por refuerzo, concretamente PPO (Proximal Policy Optimization), según los tags y la model card. El pipeline declarado es reinforcement-learning, y el método óptimo indicado por el autor es "RL". No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases adicionales de ajuste supervisado o DPO.

La tarea entrenada es la decisión de alto nivel para evitar obstáculos en un robot bípedo LINK-01, con la persona "sejong" como configuración del entorno. El modelo recibe observaciones del robot y emite acciones de alto nivel. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal; la contribución principal es el propio pipeline de RL aplicado a un LLM pequeño como política de decisión.

## Capacidades

- Decisión de alto nivel para robótica: selección de acciones a partir de observaciones del robot bípedo LINK-01.
- Tarea específica de evitación de obstáculos (avoid_obstacles) en un entorno simulado o de evaluación del proyecto LINK-01.
- Entrenamiento mediante RL (PPO) sobre un modelo de lenguaje, lo que permite mapear observaciones textuales o estructuradas a acciones.
- Soporte de idioma coreano (ko) como idioma declarado.
- Integración con el ecosistema Hugging Face Transformers y PEFT mediante `PeftModel.from_pretrained`.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Evaluación de políticas de decisión en robótica: el adaptador permite reproducir la política entrenada para la tarea avoid_obstacles y comparar su precisión en test (69.4%) frente a otras variantes del proyecto LINK-01.
- Investigación en RL con LLMs pequeños: sirve como referencia para estudiar cómo un modelo de 0.8B puede actuar como cabecera de decisión de alto nivel en lugar de un policy network clásico.
- Prototipado de control bípedo en simulación: el modelo puede integrarse en un bucle de simulación donde las observaciones del robot se serializan y el modelo emite la acción de alto nivel, evaluando la tasa de éxito de conducción declarada (100.0% en 20 episodios).
- Benchmark interno del proyecto CONNECT AI LAB: útil para comparar configuraciones de persona (sejong) y tareas dentro del mismo entorno LINK-01.
- Docencia y demostraciones: ejemplo reproducible de un pipeline PEFT + PPO sobre un LLM pequeño para decisiones secuenciales.
- Base para fine-tuning posterior: al ser un adaptador LoRA con licencia Apache 2.0, puede reutilizarse como punto de partida para otras tareas de decisión en robótica dentro del mismo marco.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision en test (Accuracy) | 69.4% |
| Exito de conduccion en 20 episodios (Drive Success) | 100.0% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; un modelo base de ~0.8B en precisión completa requiere del orden de 2-3 GB, y en cuantización de 8 bits o 4 bits puede reducirse por debajo de 1-2 GB, aunque el adaptador LoRA añade una sobrecarga mínima.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU consumer con al menos 4-8 GB de VRAM debería poder cargar el modelo base en precisión reducida (RTX 3060, RTX 4060, RTX 4090).
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de GPUs consumer modernas con suficiente VRAM para el modelo base de 0.8B.
- Opciones de despliegue: Hugging Face Transformers con PEFT (`PeftModel.from_pretrained`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (adaptadores LoRA de RL para decisión robótica sobre LLMs pequeños) con datos verificables.

## Limitaciones y advertencias

- Modelo altamente especializado: entrenado únicamente para la tarea avoid_obstacles en el robot LINK-01; no debe usarse como modelo de propósito general.
- Idioma limitado al coreano (ko) según la model card; el rendimiento en otros idiomas no está documentado.
- Métricas declaradas por el autor sin validación externa: la precisión del 69.4% y el éxito del 100.0% en 20 episodios provienen de la model card y no se han verificado de forma independiente.
- Riesgo de sobreajuste al entorno de entrenamiento: el éxito en simulación no garantiza transferencia a un robot físico ni a variaciones del entorno.
- Tamaño de repositorio de 0.0 GB: solo se publican los pesos del adaptador; es necesario descargar el modelo base Qwen/Qwen3.5-0.8B por separado.
- Sin datos sobre sesgos, alucinación o comportamiento fuera de distribución en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.5-0.8B debe cumplir su propia licencia, que no se detalla en la información proporcionada.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso o validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/kareyoung09/connectailab-rl-kay09-sejong-obstacle-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
