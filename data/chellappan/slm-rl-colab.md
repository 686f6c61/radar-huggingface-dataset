# Chellappan/slm-rl-colab

## Resumen

Chellappan/slm-rl-colab es un adaptador LoRA (PEFT) desarrollado por Chellappan que se aplica sobre el modelo base LiquidAI/LFM2.5-1.2B-Instruct, un modelo de lenguaje de 1.2 mil millones de parámetros. El adaptador está diseñado específicamente para que el modelo juegue al juego Boxing de Atari en un entorno de texto, dentro del framework SLM-RL (Self-improving game gymnasium for Small Language Models). Este framework permite que modelos pequeños aprendan a jugar juegos mediante aprendizaje por refuerzo, recopilando sus propias decisiones en un dataset reutilizable y ajustando el modelo automáticamente sobre su propia experiencia.

El adaptador se entrenó con la técnica `reject_sft` sobre demostraciones generadas por un profesor DQN, y fue promovido como campeón en la generación 1 del proceso evolutivo de SLM-RL. Aunque el modelo base es un LLM generalista, este adaptador restringe su comportamiento a la generación de acciones válidas para el juego Boxing, lo que lo convierte en un caso de estudio interesante para la investigación en RL aplicada a modelos de lenguaje pequeños. Su licencia Apache 2.0 permite uso comercial sin restricciones, aunque su utilidad práctica fuera del ámbito de investigación es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LiquidAI/LFM2.5-1.2B-Instruct) + adaptador LoRA |
| Parametros totales | 1.2B (modelo base) + parametros del adaptador (no disponibles) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificados (depende del modelo base; el adaptador se carga en bfloat16 o float32) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador en subcarpeta `adapter/`) |

## Arquitectura y entrenamiento

El adaptador se construye sobre LiquidAI/LFM2.5-1.2B-Instruct, un modelo de lenguaje causal de 1.2B parámetros. El adaptador LoRA añade matrices de bajo rango a las capas de atención y feed-forward del modelo base, permitiendo un ajuste eficiente sin modificar los pesos originales. El entrenamiento se realizó con el framework SLM-RL, que integra un entorno de juego en texto (Boxing de Atari) con un pipeline de auto-mejora: el modelo genera acciones, se recopilan las transiciones en un dataset, y se aplica `reject_sft` (rechazo de muestras de baja calidad) sobre las demostraciones del profesor DQN. Las métricas de entrenamiento muestran una pérdida de -0.019, una recompensa media de 0.172 y una divergencia KL de 0.237 respecto al modelo base, lo que indica un ajuste moderado.

El proceso de evolución en SLM-RL promovió este adaptador como campeón de la generación 1, con una mejora del primary score de -0.5000 a 0.0000, y tasas de invalid_rate e intervention_rate de 0.0, lo que significa que el modelo genera acciones válidas sin necesidad de intervención externa. Sin embargo, la evaluación en 8 episodios muestra un win_rate de 0.0 y un mean_score de 0.0, indicando que el modelo no consigue ganar partidas, aunque sí produce acciones sintácticamente correctas.

## Capacidades

- Generacion de acciones para el juego Boxing de Atari en formato texto: el modelo recibe un estado del juego y devuelve una accion valida (por ejemplo, `ACTION: 1` para NOOP o `ACTION: 2` para UP).
- Integracion con el framework SLM-RL: el adaptador puede cargarse directamente en el playground del taller para continuar la evolucion o evaluar nuevas generaciones.
- Compatibilidad con transformers y PEFT: se puede cargar con `PeftModel` sobre el modelo base, tanto en GPU como en CPU.
- Capacidades generales de lenguaje del modelo base: al ser un adaptador, el modelo conserva las habilidades de generacion de texto del modelo base, aunque el adaptador sesga su comportamiento hacia el juego.
- Soporte de chat: el modelo base es instruct, por lo que el adaptador puede usarse en un pipeline de chat con system prompts que definan el contexto del juego.

## Casos de uso

- Investigacion en aprendizaje por refuerzo para modelos de lenguaje: el adaptador sirve como punto de partida para estudiar como los LLM pequenos aprenden tareas secuenciales de decision en entornos de texto, y como el framework SLM-RL permite iterar sobre generaciones de modelos.
- Evaluacion de agentes en entornos de juego: se puede usar para comparar el rendimiento de diferentes adaptadores entrenados con distintas estrategias (reject_sft, PPO, etc.) en el mismo juego, midiendo win_rate, invalid_rate y intervention_rate.
- Fine-tuning eficiente con LoRA: el adaptador demuestra como un modelo de 1.2B puede especializarse en una tarea concreta usando solo un pequeno numero de parametros adicionales, lo que es util para experimentos de bajo coste computacional.
- Desarrollo de pipelines de auto-mejora: el flujo de SLM-RL (jugar, recopilar datos, reentrenar, re-evaluar) puede replicarse para otros juegos o tareas de decision, usando este adaptador como ejemplo de referencia.
- Pruebas de robustez en generacion de acciones: dado que el modelo produce acciones validas en el 100% de los casos (invalid_rate 0.0), puede usarse para probar sistemas de control que requieran salidas estructuradas y sin errores de formato.
- Educacion y divulgacion: el adaptador es un ejemplo didactico de como aplicar RL a LLMs, y puede usarse en talleres o cursos para ilustrar conceptos como LoRA, PEFT y aprendizaje por refuerzo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) para este adaptador, ya que su proposito es especifico para el juego Boxing. Las metricas de entrenamiento y evaluacion registradas en la model card son las siguientes:

| Metrica | Valor |
|---|---|
| Loss (entrenamiento) | -0.019 |
| Reward (entrenamiento) | 0.172 |
| KL divergence | 0.237 |
| Entropy (entrenamiento) | 2.432 |
| Frac reward zero std | 0.875 |
| Num prompts | 16 |
| Episodios de evaluacion | 8 |
| Intervention rate | 0.0 |
| Invalid rate | 0.0 |
| Mean score | 0.0 |
| Win rate | 0.0 |
| Primary score | 0.0 |

Estos datos indican que el modelo genera acciones validas sin intervencion, pero no consigue ganar partidas en el entorno de evaluacion.

## Requisitos de hardware

- VRAM estimada: el modelo base de 1.2B en bfloat16 ocupa aproximadamente 2.4 GB, mas el adaptador LoRA (que anade unos pocos MB). En float32, el modelo base ocupa ~4.8 GB. Por tanto, se puede ejecutar en GPUs consumer con al menos 4 GB de VRAM.
- GPUs recomendadas: NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4090 (24 GB) o cualquier GPU con soporte CUDA. Tambien funciona en Apple Silicon via MPS.
- Compatibilidad con consumer GPU: si, cabe en GPUs de gama media y baja.
- Opciones de despliegue: se puede cargar con transformers + PEFT en Python, o exportar a GGUF para usarlo con llama.cpp u Ollama (aunque el adaptador LoRA requiere fusion previa con el modelo base).
- Latencia y throughput: no se han publicado mediciones especificas. Para un modelo de 1.2B en una RTX 3060, se espera una latencia de generacion de ~10-20 ms por token y un throughput de ~50-100 tokens/s, suficiente para aplicaciones interactivas.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores comparables para el mismo juego o framework. El unico punto de referencia es el propio modelo base LiquidAI/LFM2.5-1.2B-Instruct sin el adaptador, que no esta especializado en el juego. Otros adaptadores de SLM-RL para juegos distintos (por ejemplo, Pong o Breakout) podrian existir, pero no se han encontrado en la informacion disponible. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- El adaptador esta disenado exclusivamente para el juego Boxing de Atari; no generaliza a otros juegos ni a tareas de lenguaje generales.
- Las metricas de evaluacion muestran un win_rate de 0.0, lo que indica que el modelo no consigue ganar partidas; su utilidad practica como agente de juego es limitada.
- El modelo base puede presentar sesgos y alucinaciones tipicos de los LLMs, aunque el adaptador restringe la salida a acciones del juego, reduciendo el riesgo en ese contexto.
- No se especifican los idiomas soportados; el modelo base probablemente este entrenado principalmente en ingles, y el prompt del juego usa instrucciones en ingles.
- El adaptador requiere el modelo base LiquidAI/LFM2.5-1.2B-Instruct para funcionar; no es un modelo autonomo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener sus propias restricciones; se recomienda verificar la licencia de LiquidAI/LFM2.5-1.2B-Instruct.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un experimento reciente o poco difundido; la documentacion es minima.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Chellappan/slm-rl-colab
- Dataset asociado: https://huggingface.co/datasets/Chellappan/slm-rl-colab-data
- Framework SLM-RL (GitHub): https://github.com/CraftsMan-Labs/SLM-RL
- Modelo base LiquidAI/LFM2.5-1.2B-Instruct: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
