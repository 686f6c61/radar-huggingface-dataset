# EbineshM/slm-rl-colab

## Resumen

EbineshM/slm-rl-colab es un adaptador LoRA (PEFT) desarrollado por EbineshM que se monta sobre el modelo base LiquidAI/LFM2.5-1.2B-Instruct, un LLM causal de 1.200 millones de parámetros. El adaptador ha sido entrenado con el framework SLM-RL (Small Language Model Reinforcement Learning) para especializar el modelo en la generación de acciones dentro del juego Atari Boxing, siguiendo un esquema de entrenamiento por refuerzo con rechazo (reject_sft) sobre demostraciones de un profesor DQN.

Este adaptador no es un modelo autónomo, sino un componente que debe combinarse con el modelo base para funcionar. Su relevancia radica en que demuestra cómo un LLM pequeño puede adaptarse mediante RL a tareas de control de agentes en entornos de juego, un campo de investigación activo en la intersección entre procesamiento del lenguaje natural y aprendizaje por refuerzo. El repositorio incluye los pesos del adaptador en formato safetensors, junto con la configuración PEFT necesaria para su carga.

La ficha se centra en el adaptador como tal, no en el modelo base, por lo que muchas especificaciones dependen del modelo subyacente y se indican como no disponibles cuando no se proporcionan en la información del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer causal (LiquidAI/LFM2.5-1.2B-Instruct) |
| Parametros totales | No disponible (el adaptador ocupa 0.1 GB en disco) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (pesos en bfloat16 para el adaptador) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica LoRA (Low-Rank Adaptation), que introduce matrices de bajo rango en las capas del modelo base para ajustar sus pesos sin modificar los originales. El modelo base es LiquidAI/LFM2.5-1.2B-Instruct, un LLM causal de 1.200 millones de parámetros con arquitectura transformer estándar. El adaptador se entrena mediante el método reject_sft, una variante de aprendizaje por refuerzo que filtra las demostraciones de baja calidad antes de aplicar supervisión directa. En este caso, las demostraciones provienen de un agente DQN que actúa como profesor en el entorno Atari Boxing.

El entrenamiento se realizó con el framework SLM-RL, que permite evolucionar agentes a través de generaciones. Según los datos del repositorio, se utilizaron 16 prompts y se registró una pérdida de -0.0216, una recompensa media de 0.207 y un KL de 0.166 respecto al modelo base. El adaptador fue promovido tras la segunda generación, mejorando la puntuación primaria de -0.4375 a -0.3750, con una tasa de acciones inválidas y de intervención de 0.0.

## Capacidades

- Generación de acciones para el juego Atari Boxing: el adaptador produce identificadores de acción (por ejemplo, `ACTION: <id>`) en respuesta a instrucciones que describen el estado del juego y las acciones legales.
- Integración con el pipeline de SLM-RL: puede usarse como punto de partida para evoluciones posteriores en el mismo entorno.
- Compatibilidad con transformers y PEFT: se carga mediante `PeftModel.from_pretrained` con el subdirectorio `adapter/`.
- No ofrece capacidades generales de generación de texto, razonamiento, código o multilingüismo; su función está restringida al control de agentes en el entorno Boxing.

## Casos de uso

- Investigación en aprendizaje por refuerzo para LLMs: el adaptador sirve como ejemplo de cómo un LLM pequeño puede especializarse en tareas de control mediante RL, permitiendo estudiar la transferencia de conocimiento entre el lenguaje y la toma de decisiones.
- Evaluación de agentes en entornos Atari: puede integrarse en pipelines de evaluación para comparar el rendimiento de diferentes estrategias de entrenamiento (por ejemplo, reject_sft frente a otros métodos) en el juego Boxing.
- Desarrollo de agentes conversacionales para juegos: el adaptador demuestra un patrón para construir agentes que reciben instrucciones en lenguaje natural y responden con acciones, útil para prototipos de asistentes de juego.
- Benchmarking de adaptadores LoRA: al ser un adaptador pequeño (0.1 GB), es adecuado para probar flujos de trabajo de carga y despliegue con PEFT en entornos con recursos limitados.
- Educación y formación en RL: el repositorio incluye instrucciones claras de instalación y uso, lo que lo convierte en un recurso didáctico para aprender a combinar LLMs con RL.
- Reproducción de experimentos: los datos de entrenamiento y las métricas publicadas permiten reproducir el proceso de entrenamiento y verificar la reproducibilidad de los resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o GSM8K) en la informacion disponible. El repositorio solo incluye métricas de entrenamiento y evaluación específicas del entorno Boxing:

| Metrica | Valor |
|---|---|
| Puntuacion primaria (eval) | -0.375 |
| Tasa de victorias (eval) | 0.0 |
| Tasa de acciones invalidas | 0.0 |
| Tasa de intervencion | 0.0 |
| Recompensa media (train) | 0.207 |
| Perdida (train) | -0.0216 |
| KL (train) | 0.166 |

Estas métricas no son comparables con benchmarks de modelos de lenguaje generales y solo tienen sentido dentro del contexto del juego Boxing.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA sobre un modelo de 1.2B, la inferencia requiere cargar el modelo base (aproximadamente 2.4 GB en bfloat16) más el adaptador (0.1 GB). Se recomienda al menos 4 GB de VRAM para ejecución en GPU.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 2060, RTX 3060, etc.). También puede ejecutarse en Apple Silicon (MPS) o CPU, aunque con mayor latencia.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama media y baja.
- Opciones de despliegue: se puede usar con transformers y PEFT en Python, o mediante el CLI de SLM-RL. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que el adaptador requiere el modelo base y la librería PEFT.
- Latencia y throughput: no disponibles, pero al ser un modelo pequeño, la generación de 24 tokens (máximo en el ejemplo) es rápida en GPU moderna (menos de 1 segundo).

## Comparativa con modelos similares

Existen otros adaptadores similares en Hugging Face con el mismo nombre `slm-rl-colab` (por ejemplo, `heshinth/slm-rl-colab` y `apsjai03/slm-rl-colab`), todos basados en el mismo modelo base y entrenados con SLM-RL para el juego Boxing. Sin embargo, no se dispone de datos comparativos detallados (métricas, configuraciones) en la información proporcionada, por lo que no es posible realizar una comparación cuantitativa. Se recomienda consultar cada repositorio para obtener sus respectivas métricas.

## Limitaciones y advertencias

- Es un adaptador especializado exclusivamente en el juego Atari Boxing; no es útil para tareas generales de generación de texto o razonamiento.
- La puntuación primaria es negativa (-0.375) y la tasa de victorias es 0.0, lo que indica un rendimiento bajo en el entorno, aunque mejoró respecto a la generación anterior.
- No se proporcionan datos sobre sesgos, alucinaciones o comportamientos no deseados fuera del contexto del juego.
- La licencia Apache-2.0 permite uso comercial, pero el adaptador depende del modelo base LiquidAI/LFM2.5-1.2B-Instruct, cuya licencia debe verificarse por separado.
- El adaptador no incluye el tokenizador ni el modelo base; es necesario descargarlos por separado, lo que añade complejidad al despliegue.
- No se garantiza la estabilidad del adaptador en versiones futuras de transformers o PEFT; se recomienda fijar las versiones de las librerías.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/EbineshM/slm-rl-colab
- Dataset asociado: https://huggingface.co/datasets/EbineshM/slm-rl-colab-data
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Framework SLM-RL: https://github.com/CraftsMan-Labs/SLM-RL
