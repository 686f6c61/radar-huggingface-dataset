# Charlottej23/connectailab-rl-superwoman-1-v1-link01

## Resumen

LINK-01 es un adaptador LoRA de tipo PEFT sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por Charlottej23 bajo el paraguas de CONNECT AI LAB y AI CITY BUILDERS. No es un modelo de lenguaje de propósito general, sino un "cerebro de decisión" entrenado para una tarea muy concreta: leer el estado de un robot simulado LINK-01 (distancia al objetivo, dirección, sensores de distancia, velocidad y elección previa) y responder con una única letra que representa cómo debe caminar durante los siguientes 0,5 segundos en la tarea `choose_object`.

El modelo se construye en dos fases. Primero, un agente PPO entrenado en un entorno web de aprendizaje por refuerzo (`brain.json`) actúa como profesor y genera un conjunto de problemas de decisión a partir de sus observaciones. Después, el adaptador LoRA se entrena primero por supervisión (imitando al profesor) y luego por refuerzo con PPO y una penalización KL, usando las recompensas que habría obtenido el profesor al ejecutar cada opción. El resultado es un adaptador de muy bajo coste computacional que traduce observaciones estructuradas a acciones discretas mediante texto.

Su relevancia es fundamentalmente educativa y de investigación: demuestra cómo destilar un agente de RL en un modelo de lenguaje pequeño (0,8B parámetros) mediante LoRA, con licencia Apache 2.0 y un pipeline reproducible documentado en GitHub y Colab. El alcance es deliberadamente estrecho: una sola tarea, un solo entorno simulado y un idioma de trabajo (coreano) para las instrucciones y el formato de las preguntas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only (Qwen3.5-0.8B) |
| Parametros totales | No disponible (adaptador LoRA; el base tiene 0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del base Qwen3.5-0.8B) |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; cuantizacion del base no especificada) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El entrenamiento del adaptador se organiza en dos etapas. La primera es supervisión (SFT) sobre 360 ejemplos de entrenamiento, 240 de validación y 360 de test, generados a partir de las observaciones que el agente PPO profesor registra cada 0,5 segundos mientras recorre el curso `1ce5d291` en la tarea `choose_object`. La segunda etapa es refuerzo con PPO: para cada opción se calcula la recompensa que habría obtenido el profesor si hubiera elegido esa opción y el resto lo hubiera resuelto el propio profesor, con una penalización KL que mantiene al adaptador cerca del modelo supervisado.

La innovación técnica principal es el uso de un agente de RL como profesor para destilar decisiones en un modelo de lenguaje, junto con la inclusión deliberada de un 20% de ejemplos "desviados" en los que el profesor se salió del curso, para que el adaptador aprenda a recuperarse. La evaluación de la conducción se realiza con una aproximación 2D de la marcha (tabla de velocidades por comando extraída de MuJoCo web), sin red neuronal de marcha, lo que evita caídas pero puede diferir de los resultados reales de MuJoCo.

## Capacidades

- Decisión discreta de siguiente acción de marcha (0,5 s) para el robot simulado LINK-01 en la tarea `choose_object`.
- Lectura de observaciones estructuradas (distancia al objetivo, dirección, sensores de distancia, velocidad y elección previa) serializadas como texto.
- Respuesta en formato estricto: una única letra correspondiente a una de las opciones listadas, sin explicación.
- Seguimiento de instrucciones de sistema para tratar el contenido del estado como datos y no como instrucciones.
- Capacidad multilingüe limitada al coreano en el formato de preguntas y opciones.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Docencia de refuerzo con destilación a modelos de lenguaje: el adaptador sirve como ejemplo reproducible de cómo convertir un agente PPO en un modelo de lenguaje pequeño mediante LoRA, con notebooks de Colab y código en GitHub.
- Investigación en RL con recompensas derivadas de un profesor: permite estudiar cómo afecta la inclusión de ejemplos desviados (20%) al aprendizaje de recuperación en tareas de decisión.
- Sustitución del "cerebro" en el simulador LINK-01: el adaptador puede colocarse en el puesto de decisión del robot y evaluarse sobre el mismo curso con semillas fijas (91001–91020) para comparar contra el profesor.
- Prototipado de políticas de navegación discreta en entornos 2D: útil para experimentar con políticas que eligen entre un conjunto finito de comandos de movimiento sin entrenar una red de marcha.
- Benchmark de robustez ante formato: al exigir una única letra como salida, sirve para medir la fidelidad de un modelo pequeño a formatos estrictos bajo instrucciones de sistema.
- Educación en seguridad de prompts: el modelo incorpora instrucciones explícitas para tratar el estado como datos, lo que lo hace útil como caso de estudio de inyección de prompts en pipelines de decisión.

## Benchmarks y rendimiento

| Modelo | Precisión en test (misma respuesta que el profesor) | Éxito en 20 episodios del mismo curso | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Profesor (brain) | 100,0% | 0% | 100% | — |
| Antes del entrenamiento | 20,0% | 0% | 0% | 0,0 s |
| SFT (supervisado) | 91,9% | 0% | 100% | — |
| RL (PPO) | 91,9% | 0% | 100% | — |

Los datos provienen de la model card del autor. La evaluación de marcha usa una aproximación 2D con tabla de velocidades por comando, no el simulador MuJoCo completo, por lo que los resultados pueden diferir. Ningún modelo, incluido el profesor, completa con éxito el curso en los 20 episodios evaluados.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Al ser un adaptador LoRA sobre un base de 0,8B, la inferencia puede ejecutarse en GPUs de consumo con cuantización del base (por ejemplo, 4 bits), aunque el autor no publica cifras.
- GPU recomendadas: no disponibles. Por tamaño del base, una RTX 3060/4060 o superior sería suficiente en FP16 para el modelo de 0,8B, pero no hay confirmación del autor.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del base (0,8B), aunque no se documenta.
- Opciones de despliegue: transformers + peft (según el ejemplo de la model card). No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LINK-01 (este modelo) | Adaptador sobre 0,8B | No disponible | Decisión discreta en robot simulado | Apache 2.0 | Hugging Face |
| Qwen3.5-0.8B (base) | 0,8B | No disponible | Lenguaje general | No disponible en la información | Hugging Face |
| Agente PPO profesor (brain.json) | No aplica (política RL) | No aplica | Decisión discreta en robot simulado | No disponible | Repositorio CONNECT TYCOON |

No se dispone de información sobre otros adaptadores LoRA comparables de la misma familia o tarea en la documentación proporcionada.

## Limitaciones y advertencias

- Alcance extremadamente estrecho: solo resuelve la tarea `choose_object` en el robot simulado LINK-01; no es un modelo de lenguaje de propósito general.
- Rendimiento en la tarea: 91,9% de coincidencia con el profesor en test, pero 0% de éxito en los 20 episodios de evaluación y 100% de colisiones, igual que el profesor. El modelo no supera al profesor en la métrica de éxito.
- Evaluación de marcha aproximada: se usa una tabla de velocidades 2D en lugar de MuJoCo completo, lo que puede sobreestimar o subestimar el comportamiento real.
- Idioma: el formato de preguntas y opciones está en coreano; no se garantiza funcionamiento en castellano ni en otros idiomas.
- Riesgo de alucinación: al ser un modelo de lenguaje pequeño, puede generar letras no listadas o explicaciones si el prompt no se respeta estrictamente; el autor recomienda instrucciones de sistema explícitas.
- Sesgos: no documentados, pero el modelo hereda los del base Qwen3.5-0.8B y los del curso de entrenamiento (`1ce5d291`).
- Uso comercial: la licencia Apache 2.0 lo permite, pero el autor advierte que es un modelo de investigación y educación y que debe revalidarse en el robot y el espacio reales antes de usarlo en producción.
- Sin datos de benchmarks estándar (MMLU, HumanEval, GSM8K) ni de latencia o throughput.

## Enlaces

- Hugging Face: https://huggingface.co/Charlottej23/connectailab-rl-superwoman-1-v1-link01
- GitHub CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de refuerzo AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Entorno web de entrenamiento: https://www.ezerai.xyz/robot-lab/world/
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
