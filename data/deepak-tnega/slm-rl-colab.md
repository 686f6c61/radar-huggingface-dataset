# deepak-tnega/slm-rl-colab

## Resumen

El modelo `deepak-tnega/slm-rl-colab` es un adaptador LoRA (PEFT) que especializa el modelo base `LiquidAI/LFM2.5-1.2B-Instruct` para jugar a Space Invaders mediante aprendizaje por refuerzo. Ha sido desarrollado por el usuario deepak-tnega como parte del taller SLM-RL, un framework de entrenamiento de modelos de lenguaje pequeños con técnicas de RL. El adaptador se entrena con el método `reject_sft` sobre demostraciones generadas por un agente DQN, y se promueve como campeón de la generación 2 del proceso evolutivo.

Este adaptador no es un modelo independiente, sino un conjunto de pesos LoRA que se cargan sobre el modelo base. Su propósito es que el modelo base, que es un instruct de 1.2B parámetros, genere acciones válidas en el entorno de Atari Space Invaders. La relevancia de este trabajo radica en demostrar cómo un LLM pequeño puede adaptarse a tareas de control de agentes mediante RL, un campo emergente en la investigación de IA. El repositorio incluye el adaptador, el dataset asociado y métricas de entrenamiento, lo que facilita la reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre base `LiquidAI/LFM2.5-1.2B-Instruct` (arquitectura del base no especificada) |
| Parametros totales | No disponible (el adaptador LoRA es de tamaño reducido, pero no se indica el número exacto) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base, no se especifica) |
| Tipos de cuantizacion | No disponible (el adaptador se carga en bfloat16 o float32 según el dispositivo) |
| Idiomas soportados | No disponible (el modelo base es instruct, pero no se detallan idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT en subcarpeta `adapter/`) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica LoRA (Low-Rank Adaptation), que añade matrices de bajo rango a las capas del modelo base para ajustarlo a una tarea específica sin modificar los pesos originales. El modelo base es `LiquidAI/LFM2.5-1.2B-Instruct`, un modelo de lenguaje instruct de 1.2B parámetros, aunque no se proporcionan detalles sobre su arquitectura interna (si es transformer, MoE, etc.). El adaptador se entrena con el método `reject_sft` (rejection sampling + supervised fine-tuning) sobre demostraciones de un agente DQN que juega a Space Invaders. El proceso de entrenamiento se enmarca en el framework SLM-RL, que utiliza un bucle evolutivo con generaciones y promoción de campeones. Las métricas de entrenamiento muestran una pérdida de -0.0234, una recompensa media de -0.03125 y una entropía de 2.76, con 16 prompts y 8 episodios de evaluación. El adaptador se promueve porque mejora la métrica primaria de 0.3958 a 0.4375, con tasa de invalidación e intervención nulas.

## Capacidades

- Generación de acciones para el juego Space Invaders: el adaptador produce un ID de acción (por ejemplo, NOOP o UP) a partir de un prompt con las acciones legales.
- Integración con el framework SLM-RL: se puede usar en el CLI `slm-rl evolve` para continuar el entrenamiento o evaluar el agente.
- Compatibilidad con transformers y PEFT: se carga fácilmente con `PeftModel` y `AutoModelForCausalLM`.
- Soporte de chat template: el modelo base es instruct, por lo que el adaptador respeta el formato de chat para recibir instrucciones.
- No se reportan capacidades de tool calling, agentes multi-step, visión, audio ni razonamiento complejo fuera del contexto del juego.

## Casos de uso

- Investigación en RL para LLMs: el adaptador sirve como ejemplo de cómo aplicar `reject_sft` y evolución de generaciones en un entorno de Atari, útil para estudiar la adaptación de modelos de lenguaje a tareas de control.
- Prototipado de agentes de juego: se puede cargar el adaptador sobre el modelo base para generar acciones en Space Invaders y evaluar su rendimiento en el entorno, sirviendo como punto de partida para experimentos con otros juegos.
- Fine-tuning selectivo con LoRA: el adaptador demuestra un flujo de trabajo con PEFT que permite ajustar un modelo de 1.2B con recursos limitados, ya que solo se entrenan los pesos LoRA.
- Reproducción de experimentos: al estar publicados el adaptador y el dataset, otros investigadores pueden reproducir el entrenamiento y comparar métricas.
- Integración en pipelines de evaluación de agentes: el adaptador se puede usar en scripts de Python para generar acciones y medir recompensas, como se muestra en el código de ejemplo.
- Formación en RL y PEFT: el repositorio sirve como material didáctico para aprender a combinar transformers, LoRA y RL en un entorno sencillo.

## Benchmarks y rendimiento

Se dispone de las métricas de evaluación registradas en la model card:

| Metrica | Valor |
|---|---|
| Episodios de evaluacion | 8 |
| Tasa de intervencion | 0.0 |
| Tasa de invalidacion | 0.0 |
| Puntuacion media (primary) | 0.4375 |
| Win rate | 0.0 |
| Entropia media | No disponible (null) |
| Recompensa media (train) | -0.03125 |
| KL (train) | 0.3396 |
| Perdida (train) | -0.0234 |

No se han publicado resultados comparativos con otros modelos o adaptadores en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA es ligero y se carga sobre el modelo base de 1.2B parámetros. La VRAM estimada para inferencia depende del modelo base: con cuantización de 4 bits cabría en GPUs con 6-8 GB, y en bfloat16 requeriría unos 3-4 GB adicionales para los pesos del adaptador.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia. Para entrenamiento, se puede usar una GPU con 12-16 GB.
- El modelo base de 1.2B cabe en GPUs consumer, por lo que el adaptador también.
- Opciones de despliegue: se puede usar con transformers y PEFT en Python, o mediante el CLI de SLM-RL. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, pero al ser un adaptador PEFT, podría integrarse con vLLM si se fusionan los pesos.
- Latencia y throughput: no se proporcionan datos, pero al ser un modelo de 1.2B, la generación de 24 tokens es rápida en GPU moderna (del orden de decenas de milisegundos).

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables para Space Invaders u otros juegos de Atari en el contexto de SLM-RL. El modelo base `LiquidAI/LFM2.5-1.2B-Instruct` no tiene una ficha pública detallada en la información proporcionada, por lo que no se puede comparar con alternativas como Qwen2.5-1.5B o Llama-3.2-1B. Se indica "no disponible".

## Limitaciones y advertencias

- El adaptador está especializado exclusivamente en Space Invaders; no es generalizable a otras tareas sin reentrenamiento.
- Las métricas de rendimiento son muy bajas (puntuación media de 0.4375 y win rate 0.0), lo que indica que el agente no juega de forma óptima y puede ser inadecuado para uso en producción.
- El entrenamiento se realizó con un número reducido de prompts (16) y episodios (8), lo que limita la robustez del adaptador.
- No se especifican los idiomas soportados ni la longitud de contexto, por lo que se desconoce su comportamiento en entradas largas o multilingües.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base `LiquidAI/LFM2.5-1.2B-Instruct` puede tener su propia licencia; se debe verificar.
- El adaptador depende de la versión exacta del modelo base; cambios en el base podrían romper la compatibilidad.
- No se reportan sesgos específicos, pero al ser un modelo entrenado para un juego, no se espera que tenga sesgos lingüísticos relevantes.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/deepak-tnega/slm-rl-colab
- Dataset asociado: https://huggingface.co/datasets/deepak-tnega/slm-rl-colab-data
- Framework SLM-RL: https://github.com/CraftsMan-Labs/SLM-RL
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
