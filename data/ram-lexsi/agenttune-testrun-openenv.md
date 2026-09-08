# ram-lexsi/agenttune-testrun-openenv

## Resumen

El modelo `ram-lexsi/agenttune-testrun-openenv` es un adaptador LoRA entrenado sobre el modelo base `HuggingFaceTB/SmolLM2-360M-Instruct` mediante el algoritmo GRPO (Group Relative Policy Optimization) con el backend TRL. Lo desarrolla Lexsi Labs como parte de su plataforma AgentTune, un framework que orquesta flujos de trabajo agénticos y permite entrenar, evaluar, destilar y auto-reparar modelos usando un esquema unificado de trayectorias.

El artefacto se publica el 8 de septiembre de 2026 como una ejecución de prueba (testrun) para entornos abiertos (openenv). Frente al fine-tuning supervisado convencional, este adaptador emplea señales de recompensa para optimizar el comportamiento del modelo en tareas agénticas. Debe cargarse sobre el modelo base, que aporta la arquitectura transformer decoder-only de 360 millones de parámetros y una ventana de contexto de 8192 tokens.

Al tratarse de un artefacto experimental, se dirige a investigadores y desarrolladores interesados en la optimización por refuerzo de modelos pequeños, la llamada a herramientas y la construcción de agentes en entornos simulados. Actualmente no registra descargas ni likes, lo que indica que se encuentra en una fase inicial de distribución y validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre SmolLM2-360M-Instruct (transformer decoder-only) |
| Parametros totales | 360 millones en el modelo base; el adaptador no declara su tamaño |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No especificado; el modelo base se orienta principalmente al inglés |
| Licencia | No disponible para el adaptador; el modelo base usa Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) que añade matrices de bajo rango entrenables al modelo base `HuggingFaceTB/SmolLM2-360M-Instruct`. El modelo base es un transformer decoder-only de 360 millones de parámetros, con una ventana de contexto de 8192 tokens y tokenizer BPE.

El entrenamiento se realiza con GRPO, un algoritmo de aprendizaje por refuerzo que genera un grupo de respuestas para cada consulta, calcula recompensas relativas y actualiza la política del modelo en función de la ventaja normalizada del grupo. La implementación se apoya en el backend TRL de HuggingFace. El orquestador del entrenamiento es AgentTune, plataforma de Lexsi Labs que unifica trayectorias agénticas para entrenamiento, evaluación, destilación y auto-reparación. Los datos de entrenamiento, la composición del dataset y el número de pasos no estan especificados en la informacion disponible.

## Capacidades

- Generacion de texto e instrucciones: hereda del modelo base SmolLM2-360M-Instruct la capacidad de seguir instrucciones en formato de chat.
- Soporte de tool calling / function calling: el modelo base soporta llamadas a herramientas, y el entrenamiento con GRPO refuerza este comportamiento en escenarios agénticos.
- Soporte de agentes y razonamiento multi-paso: el adaptador se ha entrenado con flujos de AgentTune, por lo que su objetivo es resolver tareas que requieren coordinar varios pasos.
- Capacidades multilingues: limitadas y dependientes del modelo base, diseñado principalmente para inglés con vocabulario reducido en otros idiomas.
- Herramientas de la plataforma AgentTune: el adaptador puede integrarse en pipelines de AgentTune para evaluaciones iterativas y destilación.
- Modo de razonamiento explicito (thinking mode): no se ha documentado ninguna funcionalidad de este tipo en el adaptador.

## Casos de uso

- Investigacion sobre RL en modelos pequeños: sirve como artefacto de referencia para estudiar como GRPO afecta a un modelo de 360M en tareas de agente, comparando rendimiento frente al modelo base sin el adaptador.
- Prototipado de agentes conversacionales: puede cargarse sobre SmolLM2-360M-Instruct para probar flujos de conversion multi-turno en entornos de desarrollo controlados.
- Evaluacion de pipelines AgentTune: el adaptador funciona como output de referencia para validar el flujo de entrenamiento y evaluacion de la plataforma AgentTune en escenarios de prueba.
- Pruebas unitarias de llamada a herramientas: aprovechando el soporte de function calling del modelo base, el adaptador puede utilizarse en tests automatizados que verifican la seleccion y ejecucion de herramientas.
- Formacion en tecnicas de RLHF/RL: es un ejemplo practico de como se entrena un adaptador LoRA con GRPO empleando TRL, util para cursos y tutoriales.
- Experimentacion en entornos abiertos: el sufijo openenv sugiere el uso en entornos agénticos simulados para medir la adaptacion del modelo a mundos de tareas no deterministicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen puntuaciones oficiales de MMLU, HumanEval, GSM8K ni de otras evaluaciones estandar para este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo base en FP16): aproximadamente 0,7 GB para los pesos; sumando el adaptador y el overhead del framework, se recomienda disponer de al menos 1-2 GB de VRAM.
- VRAM en cuantizacion INT8: aproximadamente 0,4 GB; en 4-bit, aproximadamente 0,2 GB, lo que permite ejecutarlo en GPUs con 4 GB o menos.
- GPU recomendadas: cualquier GPU moderna de consumo (RTX 3060, RTX 4060, RTX 4090) o GPU de datacenter (A10, A100, H100).
- Compatible con GPU de consumo: sí, el modelo es muy ligero y puede ejecutarse incluso en CPUs potentes mediante llama.cpp u Ollama.
- Opciones de despliegue: `transformers` con `peft` (usando `AutoPeftModelForCausalLM`), `vLLM` (etiquetado como endpoints_compatible en HuggingFace), `llama.cpp` y `Ollama`.
- Latencia y throughput: no se han publicado cifras oficiales; por el reducido tamaño del modelo, se espera una latencia de generacion baja en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Alcance | Licencia | Formato |
|---|---|---|---|---|---|
| ram-lexsi/agenttune-testrun-openenv | 360M (base) | 8192 | Agentes, RL, adaptador LoRA | No especificada | safetensors |
| HuggingFaceTB/SmolLM2-360M-Instruct | 360M | 8192 | Chat, instrucciones, tool calling | Apache 2.0 | safetensors |
| Qwen2.5-0.5B-Instruct | 494M | 32768 | Chat, instrucciones, tool calling | Apache 2.0 | safetensors |
| TinyLlama-1.1B-Chat | 1.1B | 2048 | Chat, instrucciones | Apache 2.0 | PyTorch |

La comparacion se limita a especificaciones tecnicas. No se dispone de metricas de rendimiento comparables para estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Es una ejecucion de prueba (testrun) con 0 descargas y 0 likes; no existe evidencia de validacion externa ni de calidad en produccion.
- La licencia del adaptador no esta especificada, lo que genera incertidumbre para cualquier uso comercial.
- El adaptador depende por completo del modelo base SmolLM2-360M-Instruct; no funciona de forma autonoma sin el.
- El entrenamiento con GRPO en tareas especificas puede degradar capacidades generales del modelo si no se controla el proceso de optimizacion.
- Un modelo de 360M presenta limitaciones inherentes en razonamiento complejo, creatividad y cobertura tematica frente a modelos de mayor escala.
- No se han publicado analisis de sesgos, evaluaciones de alucinacion ni metricas de seguridad para este adaptador.
- El vocabulario y tokenizer del modelo base ofrecen una cobertura limitada para idiomas distintos del ingles.
- El repositorio muestra un tamaño de 0.0 GB en la api de HuggingFace, lo que dificulta verificar la integridad y el contenido exacto de los pesos publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ram-lexsi/agenttune-testrun-openenv
- Repositorio espejo de AgentTune: https://github.com/Lexsi-Labs/AgentTune_mirror
- Web de Lexsi Labs: https://lexsi.ai/
- Comunidad Discord de Lexsi: https://discord.com/invite/dtEDQ2Z3eg
- Modelo relacionado de evaluacion RL: https://huggingface.co/ram-lexsi/agenttune-testrun-rl-eval
- Dataset relacionado de evaluacion LM: https://huggingface.co/datasets/ram-lexsi/agenttune-testrun-lm-eval
