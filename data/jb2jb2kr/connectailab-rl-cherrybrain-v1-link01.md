# jb2jb2kr/connectailab-rl-cherrybrain-v1-link01

## Resumen

Connectailab RL Cherrybrain v1 LINK01 es un adaptador LoRA entrenado sobre Qwen3.5-0.8B (de Qwen) que convierte un modelo de lenguaje pequeño en un agente de decisión para el robot simulado LINK-01. El modelo lee, en forma de texto, el estado del robot (distancia y dirección al objetivo, lecturas de sensores de distancia, velocidad y la acción previa) y responde con una única letra que indica la acción de caminar a ejecutar durante los siguientes 0,5 segundos.

Su autor, jb2jb2kr, miembro de la comunidad CONNECT AI LAB, lo ha entrenado mediante un enfoque de destilación de política seguido de aprendizaje por refuerzo: primero se entrena un "cerebro" de PPO en el simulador web CONNECT AI WORLD (tarea `goto_target`), después se generan pares observación-acción a partir de ese cerebro para hacer fine-tuning supervisado con LoRA, y finalmente se aplica RL (PPO con penalización KL) para refinar la política del modelo de lenguaje. Es un proyecto educativo y de investigación que ilustra cómo transferir políticas de RL clásicas a modelos de lenguaje, con resultados publicados en su model card y una licencia Apache 2.0 que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo causal de lenguaje (transformer) |
| Parametros totales | No disponible (base Qwen3.5-0.8B, ~0,8B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo pesos safetensors del adaptador) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo no es un LLM completo, sino un adaptador LoRA (PEFT) montado sobre Qwen/Qwen3.5-0.8B. El pipeline de entrenamiento descrito en la model card tiene cinco fases:

1. **Entrenamiento del cerebro profesor**: se entrena una política PPO en el simulador web CONNECT AI WORLD para la tarea `goto_target` (especificación `link01-decision/goto_target/obs21-act5/walker51-14/v1`), alcanzando un 100 % en el examen oficial del curso `c3e7d26a`.
2. **Generación del dataset**: mientras el cerebro recorre el curso, cada 0,5 segundos se serializa su observación como texto; la etiqueta es la acción elegida por el cerebro. Se incluye un 20 % de estados "fuera de camino" generados con acciones alternativas para dar robustez.
3. **Fine-tuning supervisado (SFT)**: el LLM aprende a imitar las respuestas del cerebro mediante LoRA.
4. **Aprendizaje por refuerzo**: cada opción de acción se puntúa con la recompensa que se habría obtenido si el cerebro completara la trayectoria tras esa elección; PPO ajusta las preferencias con restricción KL respecto a la política SFT.
5. **Evaluación**: el modelo se coloca en el puesto de decisión del robot y recorre el mismo curso en 20 episodios (semillas 91001–91020).

El dataset consta de 543 ejemplos de entrenamiento, 115 de validación y 166 de test, con una tasa de coincidencia del 100 % entre la observación textualizada y la respuesta del cerebro (techo de acierto). La evaluación de locomoción usa una aproximación 2D basada en una tabla de velocidades medidas por comando del web MuJoCo, no en simulación física completa.

## Capacidades

- Toma de decisión discreta para navegación del robot LINK-01: dado un estado textualizado (21 observaciones, 5 acciones posibles), devuelve exactamente una letra de opción.
- Imitación de una política PPO entrenada para la tarea `goto_target` (dirigirse a un objetivo evitando obstáculos).
- Capacidad de razonar sobre estados fuera de distribución parcial (el 20 % del dataset incluye trayectorias desviadas).
- Formato de salida estricto: una sola letra, sin explicaciones, gobernado por un system prompt específico.
- El modelo base Qwen3.5-0.8B conserva sus capacidades generativas, aunque el adaptador está especializado en esta tarea.

## Casos de uso

- **Investigación en imitación de políticas de RL con LLM**: el modelo sirve como caso de estudio reproducible de cómo destilar una política PPO en un modelo de lenguaje mediante SFT + PPO con KL, con código disponible en GitHub.
- **Docencia en aprendizaje por refuerzo**: CONNECT AI LAB lo usa en su curso gratuito de RL; los estudiantes pueden entrenar su propio cerebro en el simulador web y comparar resultados.
- **Prototipado de agentes de decisión para robots simulados**: se puede integrar el modelo en el bucle de control del LINK-01 en MuJoCo web para sustituir la política neuronal por decisiones en lenguaje natural.
- **Experimentos de grounding de observaciones en texto**: útil para estudiar cómo la serialización textual de observaciones numéricas afecta a la fidelidad de la política (el techo del 100 % de coincidencia se mide explícitamente).
- **Evaluación comparativa SFT frente a RL**: la model card publica métricas de ambas etapas, lo que permite analizar cuándo el RL degrada o mejora el SFT (aquí el RL obtuvo peor acierto que el SFT).
- **Base para扩展 a otras tareas del CONNECT AI WORLD**: el esquema de especificación (`obs21-act5`) es modular y puede replicarse para nuevos cursos o robots.

## Benchmarks y rendimiento

Datos publicados en la model card (tarea `goto_target`, curso `c3e7d26a`, 20 episodios de evaluación con semillas 91001–91020):

| Modelo | Acierto en test (coincidencia con el cerebro) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio de éxito |
|---|---|---|---|---|
| Cerebro (profesor, PPO) | 100,0 % | 100 % | 0 % | 10,9 s |
| Base sin entrenar | 27,1 % | 0 % | 50 % | — |
| SFT (LoRA) | 78,9 % | 100 % | 0 % | 11,4 s |
| RL (PPO sobre SFT) | 66,9 % | 85 % | 10 % | 13,6 s |

El adaptador publicado corresponde a la etapa de **SFT** (la de mejores resultados). No hay benchmarks MMLU, HumanEval ni similares; el modelo se evalúa únicamente en su tarea de decisión.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador LoRA sobre un modelo de 0,8B, basta con ~2 GB de VRAM en FP16 o menos de 1 GB en INT4; también es viable en CPU.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060 o superior) es más que suficiente; no se requiere A100 ni H100.
- Cabe con holgura en GPUs consumer; incluso portátiles con GPU integrada pueden ejecutarlo en CPU con latencias aceptables para el bucle de 0,5 s del robot.
- Despliegue: la model card muestra el uso con `transformers` + `peft` (cargando primero `Qwen/Qwen3.5-0.8B` y aplicando el adaptador). Es compatible con el ecosistema PEFT; no se menciona soporte oficial en vLLM, llama.cpp, Ollama o TGI para el adaptador (aunque el modelo base Qwen3.5-0.8B sí tiene soporte amplio).
- Latencia y throughput: no disponible; dada la ventana de decisión de 0,5 s, un modelo de 0,8B generando un único token es holgado en cualquier hardware moderno.

## Comparativa con modelos similares

No hay una categoría de modelos directamente equivalente publicada; la comparación más relevante es con las propias etapas de entrenamiento del proyecto y con el modelo base:

| Modelo | Tipo | Acierto test | Éxito en simulación | Licencia |
|---|---|---|---|---|
| Cherrybrain v1 LINK01 (SFT LoRA) | Adaptador sobre Qwen3.5-0.8B | 78,9 % | 100 % (20/20, sin colisiones) | Apache 2.0 |
| Qwen3.5-0.8B (base) | LLM general 0,8B | 27,1 % (en esta tarea) | 0 % | No disponible |
| Cerebro PPO profesor | Política neuronal clásica | 100 % | 100 %, 10,9 s | No disponible |

Alternativas genéricas de decisión con LLM (por ejemplo, otros adaptadores de imitación de políticas) no están disponibles para comparación directa en la información proporcionada.

## Limitaciones y advertencias

- **Ámbito muy restringido**: el modelo solo es válido para la tarea `goto_target` del LINK-01 en el curso `c3e7d26a` con la especificación `obs21-act5`; no generaliza a otros robots, espacios o tareas sin reentrenamiento.
- **Simulación aproximada**: la evaluación de locomoción usa una aproximación 2D (tabla de velocidades por comando del web MuJoCo), no simulación física completa; los resultados pueden diferir del MuJoCo web y no se ha validado en hardware real. La propia model card advierte de verificar en el robot y espacio concretos antes de uso real.
- **Riesgo de alucinación**: el modelo puede producir respuestas que no coincidan con ninguna opción válida si el prompt no sigue el formato exacto; el system prompt indica tratar el contenido de `state` como datos y no como instrucciones, pero no hay garantías frente a inyección de prompts a través de las observaciones.
- **Degradación con RL**: la etapa de RL publicada empeora el acierto (66,9 % frente a 78,9 % del SFT) y aumenta las colisiones; el adaptador distribuido es el de SFT.
- **Dataset muy pequeño**: 543 ejemplos de entrenamiento; el modelo está fuertemente sobreajustado a la distribución del cerebro profesor.
- **Idioma**: el modelo está etiquetado para coreano (ko); el formato de las observaciones y del system prompt debe respetarse tal cual se define en el repositorio `connect-tycoon`.
- **Licencia**: Apache 2.0, sin restricciones comerciales relevantes; no obstante, el modelo base Qwen3.5-0.8B tiene su propia licencia, que debe revisarse por separado.
- **Madurez**: proyecto con muy pocas descargas (16) y en fase experimental ("modelos de conexión en prueba"), sin garantías de mantenimiento.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/jb2jb2kr/connectailab-rl-cherrybrain-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código (CONNECT TYCOON): https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web CONNECT AI WORLD (robot lab): https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube de CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
