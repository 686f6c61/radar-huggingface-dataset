# riyunkim/connectailab-rl-luxveritas-v1

## Resumen

connectailab-rl-luxveritas-v1 es un adaptador LoRA entrenado por el usuario riyunkim sobre el modelo base Qwen/Qwen3.5-0.8B, orientado a la toma de decisiones discretas en un simulador de gestión empresarial llamado CONNECT TYCOON. El modelo no genera texto libre: recibe una situación, una pregunta y un conjunto de opciones etiquetadas (A, B, C...) y devuelve únicamente la letra de la opción elegida, de modo que la probabilidad asignada a cada letra actúa como medida de confianza. Está desarrollado en el marco del laboratorio CONNECT AI LAB en colaboración con AI CITY BUILDERS.

La relevancia de esta ficha es acotada: se trata de un experimento de investigación y divulgación (el propio autor lo describe como modelo educativo sobre un simulador sintético), no de un modelo de propósito general. Su interés técnico reside en la combinación de un pipeline de reinforcement learning con GRPO sobre un adaptador PEFT de un modelo de 0,8 mil millones de parámetros, entrenado con datos generados por un profesor PPO dentro del simulador.

La información pública disponible es escasa: el repositorio ocupa 0,0 GB (solo pesos del adaptador, no del modelo base), no tiene descargas ni likes, y la model card está redactada en coreano. Los idiomas declarados se limitan al coreano (`ko`), la licencia es Apache 2.0 y la fecha de creación indicada en HuggingFace es 2026-11-05.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | No disponible para el adaptador; el modelo base Qwen3.5-0.8B tiene 0,8 mil millones (dato derivado del nombre del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (`ko`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (PEFT) montado sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El adaptador no modifica la arquitectura base: añade matrices de bajo rango entrenadas para la tarea específica de selección de opciones. El pipeline declarado en HuggingFace es `reinforcement-learning`, con etiquetas que incluyen GRPO, deep reinforcement learning, Gymnasium y decision-making.

El proceso de entrenamiento descrito en la model card consta de cuatro fases. Primero, una política pequeña se entrena con PPO dentro del simulador CONNECT TYCOON durante miles de meses simulados; esta política actúa como profesor. Segundo, se construye un conjunto de problemas reejecutando cada mes del simulador con cada opción alternativa para puntuar cada elección. Tercero, se aplica aprendizaje supervisado sobre la opción con mayor puntuación. Cuarto, se aplica reinforcement learning con ventaja normalizada por grupo (GRPO) y una penalización KL contra el modelo de partida, elevando la probabilidad de las opciones cuyo resultado en el simulador supera la media del grupo. La distribución de empresas usada es `general` (ajustada a datos públicos) y el reparto de problemas es de 4082 de entrenamiento, 832 de validación y 840 de test.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de la distribución `general`, ni detalles sobre el rango y alpha del adaptador LoRA.

## Capacidades

- Selección de una única opción entre varias etiquetadas (A, B, C...) en respuesta a una situación y una pregunta, devolviendo solo la letra.
- Calibración de confianza mediante la probabilidad asignada a cada letra de opción.
- Toma de decisiones secuenciales en un entorno tipo Gymnasium (simulador de gestión empresarial).
- Robustez frente a inyección de instrucciones en el campo `state`: el prompt de sistema indica explícitamente tratar el texto de estado como datos, no como instrucciones.
- Formato de entrada estructurado en JSON con los campos `state`, `question` y `options`.
- No se documentan capacidades de generación de texto libre, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso más allá de la selección puntual de opción.

## Casos de uso

- Evaluación de políticas de decisión en simulación: el modelo puede integrarse como agente de decisión dentro del simulador CONNECT TYCOON para comparar su rendimiento (tasa de acierto, regret, beneficio mensual) frente a políticas PPO o de aprendizaje supervisado.
- Investigación educativa sobre RL: sirve como ejemplo reproducible de un pipeline completo (profesor PPO, generación de dataset, SFT, GRPO con KL) para cursos y tutoriales de reinforcement learning, tal como se plantea en la model card.
- Prototipado de asistentes de decisión acotados: en entornos donde las opciones están predefinidas y etiquetadas, el modelo puede seleccionar la más probable y exponer la distribución de probabilidad como señal de confianza.
- Análisis de calibración: al devolver una letra con una probabilidad asociada, permite estudiar la relación entre confianza del modelo y acierto en tareas de decisión discreta.
- Pruebas de robustez frente a prompt injection: el diseño con separación entre instrucciones de sistema y datos de estado permite usarlo como banco de pruebas para evaluar cómo un modelo pequeño maneja texto adversario en el campo de estado.
- Fines docentes y divulgativos: el autor lo publica como modelo de investigación y educación sobre un simulador sintético, adecuado para demostraciones en charlas y vídeos del laboratorio.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son los siguientes, medidos sobre el simulador y el conjunto de test del propio autor:

| Modelo | Tasa de acierto en test | Regret (menor es mejor) | Beneficio mensual en simulador | Transacciones reales con tarjeta (pérdida reducida) |
|---|---|---|---|---|
| Qwen antes del entrenamiento | 30,4% | 2,67 | — | — |
| Aprendizaje supervisado | 77,9% | 1,91 | — | — |
| Reinforcement learning (este adaptador) | 77,7% | 1,91 | 10,94 millones de wones | 71% (145/177) |

El propio autor advierte que la evaluación de operación empresarial corresponde a la media de dos meses no vistos, con muestra pequeña, y que la política profesora (PPO en el simulador) sigue por encima del modelo. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un adaptador LoRA sobre un modelo base de 0,8 mil millones de parámetros, la huella es reducida y cabe con holgura en GPUs de consumo, aunque no se publican cifras concretas.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: previsible por el tamaño del modelo base (0,8B), pero sin confirmación documentada por el autor.
- Opciones de despliegue: la model card solo documenta el uso con `transformers` + `peft` (`AutoModelForCausalLM`, `PeftModel.from_pretrained`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-luxveritas-v1 | Adaptador LoRA sobre base de 0,8B | No disponible | Selección de opción en simulador (GRPO) | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible | Modelo de lenguaje general | No disponible en la información | HuggingFace |
| Política PPO del simulador (profesora) | No disponible | No aplica | RL clásico en entorno Gymnasium | No disponible | Interna del proyecto CONNECT TYCOON |

No se dispone de datos de benchmarks comparables con otros modelos de decisión de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación y educación sobre un simulador sintético; el autor recomienda revalidar con los registros reales de una empresa antes de cualquier uso en decisiones de gestión reales.
- Rendimiento inferior a la política profesora PPO del simulador según la propia model card.
- Evaluación de operación empresarial basada en solo dos meses no vistos, con muestra pequeña.
- Salida restringida a una letra de opción; no es un modelo de lenguaje general ni apto para generación de texto libre.
- Idiomas declarados limitados al coreano; no se documenta soporte multilingüe.
- Riesgo de alucinación no evaluado ni documentado; el modelo puede seleccionar opciones sin base real en el estado proporcionado.
- Sesgos conocidos: no documentados; el entrenamiento se limita a la distribución `general` de empresas del simulador, lo que puede no representar sectores o contextos distintos.
- Licencia Apache 2.0 permite uso comercial, pero el propio autor desaconseja su uso como sistema de decisión empresarial sin validación previa.
- Repositorio sin descargas ni likes en el momento de la consulta; ecosistema de soporte y mantenimiento incierto.

## Enlaces

- HuggingFace: https://huggingface.co/riyunkim/connectailab-rl-luxveritas-v1
- Repositorio GitHub CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de entrenamiento en Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de reinforcement learning de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
