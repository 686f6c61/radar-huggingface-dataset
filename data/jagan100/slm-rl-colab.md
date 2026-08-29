# jagan100/slm-rl-colab

## Resumen

`jagan100/slm-rl-colab` es un adaptador PEFT LoRA desarrollado por jagan100 para el modelo base `LiquidAI/LFM2.5-1.2B-Instruct`. Su propósito es especializar el modelo de lenguaje para jugar al juego clásico de Atari **Freeway** en un entorno de texto, como parte del framework de auto-mejora SLM-RL (Small Language Model Reinforcement Learning). El adaptador se entrena mediante *reject_sft* sobre demostraciones generadas por un profesor DQN, y se promueve a la siguiente generación si supera al predecesor en métricas como *primary score* y tasa de acciones inválidas.

Este adaptador no es un modelo independiente: debe cargarse sobre el modelo base indicado. Su relevancia radica en demostrar cómo un modelo de lenguaje pequeño (1.2B parámetros) puede aprender a controlar un agente en un entorno de juego mediante refuerzo, sin necesidad de visión ni control motor, solo con texto. El repositorio incluye instrucciones de instalación, carga con Transformers y PEFT, y métricas de entrenamiento que muestran una mejora en el *primary score* de 0.25 a 0.50 con tasa de intervención e invalidez nulas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre LiquidAI/LFM2.5-1.2B-Instruct (arquitectura del base no especificada) |
| Parametros totales | No disponible (adaptador LoRA; modelo base 1.2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se carga en bfloat16 o float32 según el dispositivo) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en PEFT LoRA, lo que significa que solo se entrenan matrices de bajo rango que se añaden a las capas del modelo base congelado. El modelo base, `LiquidAI/LFM2.5-1.2B-Instruct`, es un modelo de lenguaje instructivo de 1.2B parámetros, aunque no se proporcionan detalles sobre su arquitectura interna (transformer, atención, etc.) en la información disponible.

El entrenamiento se realizó con el framework SLM-RL, que implementa un ciclo de auto-mejora: el modelo juega en un entorno de texto, sus decisiones se recopilan en un dataset, se fine-tune con *reject_sft* (rechazo de muestras de baja calidad) sobre demostraciones de un profesor DQN, y el modelo resultante se evalúa. En este caso, el adaptador fue promovido a la generación 2 porque mejoró el *primary score* de 0.25 a 0.50, con tasa de acciones inválidas e intervenciones externas de 0.0. Las métricas de entrenamiento muestran una pérdida de -0.0063, una entropía de 1.38 y un KL de 0.35, con 16 prompts utilizados.

## Capacidades

- Generación de acciones de juego en formato texto: el modelo responde con `ACTION: <id>` para controlar el agente en Freeway (por ejemplo, `ACTION: 1` para NOOP, `ACTION: 2` para UP).
- Especialización en el juego Freeway: el adaptador ajusta el comportamiento del modelo base para emitir acciones válidas y coherentes con el estado del juego representado textualmente.
- Integración con el pipeline de SLM-RL: el adaptador puede usarse como punto de partida para nuevas generaciones de entrenamiento, permitiendo iteraciones de auto-mejora.
- Compatibilidad con Transformers y PEFT: se carga mediante `PeftModel` y funciona con `AutoModelForCausalLM`.
- Soporte de inferencia en CPU, CUDA y MPS (Apple Silicon) según el código de ejemplo proporcionado.

## Casos de uso

- Investigación en aprendizaje por refuerzo para modelos de lenguaje pequeños: el adaptador sirve como ejemplo reproducible de cómo un SLM puede aprender a jugar un juego de Atari mediante RL en un entorno de texto, útil para estudiar la eficiencia de muestreo y la transferencia de políticas.
- Desarrollo de agentes de juego en texto: se puede integrar en un entorno de simulación de Freeway para generar partidas automáticas, evaluar estrategias o comparar con otros agentes (DQN, humanos, etc.).
- Evaluación de técnicas de auto-mejora: al ser un adaptador promovido tras superar a su predecesor, permite analizar el impacto del *reject_sft* y del ciclo de generaciones en el rendimiento del agente.
- Benchmarking de frameworks de RL para SLM: el adaptador puede usarse como caso de prueba para medir la velocidad de entrenamiento, la estabilidad de la política y la tasa de acciones inválidas en entornos similares.
- Generación de datasets de demostración: el adaptador puede ejecutarse para recolectar nuevas trayectorias de juego, que luego se añaden al dataset `jagan100/slm-rl-colab-data` para futuras iteraciones de entrenamiento.
- Demostración educativa de PEFT y LoRA: el repositorio incluye código de carga y uso, lo que lo convierte en un ejemplo práctico para aprender a aplicar adaptadores LoRA sobre modelos instructivos en tareas no convencionales (juegos).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas métricas reportadas son las de evaluación del propio entrenamiento, recogidas en la model card:

| Metrica | Valor |
|---|---|
| Episodios de evaluacion | 8 |
| Tasa de intervencion | 0.0 |
| Tasa de acciones invalidas | 0.0 |
| Puntuacion media (mean_score) | 0.5 |
| Primary score | 0.5 |
| Win rate | 0.0 |
| Entropia (train) | 1.3847 |
| KL (train) | 0.3508 |
| Perdida (train) | -0.0063 |
| Recompensa (train) | 0.0 |

Estas métricas indican que el adaptador produce acciones válidas y sin intervención externa, pero no logra victorias (win_rate 0.0) en los episodios evaluados. La puntuación media de 0.5 sugiere un comportamiento parcialmente correcto, pero no se dispone de comparaciones con otros modelos o adaptadores.

## Requisitos de hardware

- VRAM estimada: para el modelo base de 1.2B en bfloat16, se requieren aproximadamente 2.4 GB de memoria para los pesos, más overhead de activaciones y el adaptador LoRA (que añade una cantidad mínima). En float32, la memoria sube a ~4.8 GB. Se puede ejecutar en GPUs con 4 GB o más, como una RTX 3050, RTX 3060, o incluso en CPU con suficiente RAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA T4, RTX 3060, RTX 4090) es suficiente para inferencia. Para entrenamiento del adaptador, se recomienda al menos 8 GB de VRAM.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo medio (RTX 3060, RTX 4060, etc.) y también en Apple Silicon con MPS.
- Opciones de despliegue: se puede usar con Transformers + PEFT en Python, o exportar a GGUF para llama.cpp/Ollama si se convierte el modelo base con el adaptador fusionado. También es compatible con vLLM y TGI si se fusiona el adaptador en el modelo base.
- Latencia y throughput: no se proporcionan datos específicos. Para un modelo de 1.2B en una GPU moderna, se espera una latencia de decodificación de ~20-50 ms por token y un throughput de ~50-100 tokens/s, pero son estimaciones generales.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores comparables para el mismo juego o con la misma metodología. El adaptador es específico para Freeway y no tiene equivalentes directos en la información proporcionada. Se podría comparar con el modelo base sin adaptador, pero no se reportan métricas de ese escenario. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Es un adaptador extremadamente especializado: solo está entrenado para el juego Freeway y no generaliza a otras tareas de lenguaje o juegos.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con demostraciones de un DQN, puede heredar comportamientos subóptimos o limitados del profesor.
- Riesgo de alucinación: aunque la tasa de acciones inválidas es 0.0 en la evaluación, el modelo podría generar acciones fuera del rango legal en situaciones no vistas durante el entrenamiento.
- El win rate es 0.0, lo que indica que el agente no completa el objetivo del juego (cruzar la carretera) en los episodios evaluados; su rendimiento es parcial.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base `LiquidAI/LFM2.5-1.2B-Instruct` puede tener sus propias restricciones; se debe verificar la licencia del base.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un experimento reciente o poco utilizado; no hay garantía de mantenimiento o soporte.
- No se proporcionan datos sobre la longitud de contexto ni los idiomas soportados, por lo que no se recomienda su uso en aplicaciones de producción que requieran esas especificaciones.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/jagan100/slm-rl-colab
- Dataset asociado: https://huggingface.co/datasets/jagan100/slm-rl-colab-data
- Framework SLM-RL: https://github.com/CraftsMan-Labs/SLM-RL
- Repositorio de modelos SLM-RL (índice): https://github.com/inde5media/SLM-RL-MODELS
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
