# kareyoung09/connectailab-rl-kay09-saimdang-target-v1-link01

## Resumen

LINK-01 es un adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario kareyoung09 en el marco del proyecto CONNECT AI LAB × AI CITY BUILDERS. El adaptador se ha entrenado mediante aprendizaje por refuerzo (reinforcement learning, con PPO como técnica citada en las etiquetas) para una tarea concreta de toma de decisiones de alto nivel en un robot bípedo: la tarea `goto_target` (dirigirse a un objetivo). El modelo recibe observaciones del robot y emite decisiones de acción de alto nivel, no texto libre convencional.

El modelo es relevante como ejemplo de aplicación de modelos de lenguaje pequeños (0,8 mil millones de parámetros) como política de decisión en robótica, un patrón que está ganando tracción frente a políticas puramente neuronales. Con un tamaño reducido y licencia Apache 2.0, es desplegable en hardware modesto, aunque sus métricas publicadas (67,4 % de acierto en examen y 0,0 % de éxito en 20 episodios de conducción real) indican que es un artefacto de investigación, no un sistema listo para producción.

La información disponible es muy escasa: el repositorio ocupa 0,0 GB, no tiene descargas ni likes, y la model card no detalla arquitectura interna, datos de entrenamiento ni hiperparámetros. Esta ficha refleja exclusivamente lo declarado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (Qwen/Qwen3.5-0.8B); detalles internos no disponibles |
| Parametros totales | No disponible (modelo base de 0,8B; el adaptador LoRA añade un número no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no declarada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado con PEFT sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. La pipeline declarada es `reinforcement-learning`, con etiquetas que mencionan `ppo` y `deep-reinforcement-learning`, lo que sugiere un ajuste de la política mediante optimización por refuerzo sobre la tarea de decisión `goto_target`. No se especifican el número de tokens de entrenamiento, la composición del dataset, la función de recompensa ni si hubo fases previas de SFT.

La tarea es de decisión de alto nivel para un robot bípedo (LINK-01): a partir de observaciones del robot, el modelo debe seleccionar una acción orientada a alcanzar un objetivo. La model card no documenta innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) ni detalles del proceso de RL más allá de la etiqueta `ppo`.

## Capacidades

- Toma de decisiones de alto nivel para robótica bípeda en la tarea `goto_target` (dirigirse a un objetivo).
- Generación de decisiones condicionadas a observaciones del robot (no se detalla el formato exacto de entrada/salida).
- Entrenamiento mediante aprendizaje por refuerzo (PPO) para optimizar la política en la tarea.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al coreano (ko) según la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación en políticas de decisión con LLM para robótica: usar el adaptador como política de alto nivel en un robot bípedo simulado para estudiar cómo un modelo de 0,8B traduce observaciones en acciones de navegación hacia un objetivo.
- Reproducción de experimentos de RL con PEFT: cargar el adaptador junto al modelo base con `PeftModel.from_pretrained` para replicar el pipeline de entrenamiento PPO y comparar variantes de recompensa.
- Base para fine-tuning adicional: partir de este adaptador como inicialización para nuevas tareas de decisión robótica, dado su bajo coste computacional y licencia permisiva.
- Evaluación de robustez de políticas LLM: analizar la brecha entre acierto en examen (67,4 %) y éxito en conducción real (0,0 %) para estudiar el sobreajuste a distribuciones de evaluación frente a entornos reales.
- Prototipado en hardware de consumo: al ser un adaptador sobre un modelo de 0,8B, permite iterar en estaciones de trabajo con GPU consumer antes de escalar a entornos de simulación más pesados.
- Docencia y demostraciones de RL aplicado a robótica: ejemplo didáctico de cómo se estructura un adaptador PEFT para una tarea de control de alto nivel con licencia Apache 2.0.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precisión en examen (Accuracy) | 67,4 % |
| Éxito en 20 episodios de conducción real (Drive Success) | 0,0 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un adaptador sobre un modelo de 0,8B, la huella es reducida (el adaptador en sí ocupa 0,0 GB en el repositorio), pero no se documentan requisitos oficiales.
- GPU recomendadas: no disponibles; por el tamaño del modelo base, cabría esperar ejecución en GPU consumer, pero el autor no lo confirma.
- ¿Cabe en GPU consumer? No confirmado por el autor; el tamaño del modelo base (0,8B) lo hace plausible, pero no hay datos oficiales.
- Opciones de despliegue: carga mediante `transformers` + `peft` (documentado en la model card). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (políticas de decisión robótica basadas en LLM con adaptadores LoRA) ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- El éxito en conducción real es del 0,0 % en 20 episodios, pese al 67,4 % de acierto en examen: existe una brecha crítica entre evaluación offline y despliegue real.
- El modelo está entrenado para una única tarea (`goto_target`) y una persona concreta (`sinsaimdang`); no es un modelo generalista.
- Idioma limitado al coreano según la model card.
- No se documentan sesgos, riesgos de alucinación ni limitaciones de contexto; se desconoce el comportamiento fuera de la distribución de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero el estado del modelo (0 % de éxito real) desaconseja cualquier uso en producción sin validación adicional.
- Repositorio sin descargas ni likes y con tamaño de 0,0 GB: artefacto de investigación sin validación comunitaria.
- No se especifican requisitos de hardware, cuantizaciones ni formatos alternativos de despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/kareyoung09/connectailab-rl-kay09-saimdang-target-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
