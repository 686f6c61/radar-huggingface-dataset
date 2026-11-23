# kkaji-studio/connectailab-rl-kkaji-v2-v1-link01

## Resumen

connectailab-rl-kkaji-v2-v1-link01 es un adaptador LoRA publicado por kkaji-studio sobre el modelo base Qwen/Qwen3.5-0.8B, orientado a la toma de decisiones de un robot simulado llamado LINK-01 en una tarea concreta de evitación de obstáculos. No es un modelo de lenguaje de propósito general: actúa como un "cerebro" que lee el estado del robot (distancia al objetivo, dirección, sensores de distancia, velocidad y acción previa) y devuelve una única letra correspondiente a una de las opciones de movimiento disponibles para los próximos 0,5 segundos. El modelo se entrenó a partir de una política PPO entrenada previamente en un entorno web de aprendizaje por refuerzo, que se usó como profesor para generar datos de decisión.

El pipeline combina aprendizaje supervisado (LoRA sobre el modelo base para imitar al profesor) y una fase posterior de aprendizaje por refuerzo con PPO y restricción KL, donde se premian las opciones que, según el profesor, habrían producido mejores recompensas. El resultado es un adaptador pequeño (repo de 0,0 GB) que se carga con PEFT junto al modelo base de 0,8 mil millones de parámetros, con licencia Apache 2.0 y etiquetado para coreano.

Su relevancia es acotada pero ilustrativa: demuestra un flujo completo de destilación de una política RL en un LLM mediante LoRA y ajuste fino con RL, con métricas de éxito en simulación (100 % de éxito en 20 episodios frente al 95 % del profesor). Es un modelo de investigación y educación, no un componente listo para producción robótica real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-0.8B |
| Parametros totales | 0,8 mil millones (modelo base); parametros del adaptador no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite las cuantizaciones habituales de Qwen, no detalladas en la informacion) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros, mediante LoRA. La tarea se formula como una clasificación de una sola letra entre un conjunto de opciones de movimiento, con un system prompt que instruye a tratar el estado del robot como datos y a devolver solo la letra de la opción elegida. El entrenamiento se realizó en dos fases: primero aprendizaje supervisado sobre 1063 ejemplos de entrenamiento (197 de validación y 323 de test) generados por una política PPO entrenada en el entorno web `avoid_obstacles` (curso `751ef5ff`, tarea `link01-decision/avoid_obstacles/obs21-act5/walker51-14/v1`), con un 20 % de ejemplos en los que el profesor se desvió deliberadamente; después, ajuste con refuerzo PPO y anclaje KL, donde la recompensa de cada opción se estima como la recompensa que habría obtenido el profesor si hubiera continuado desde esa elección.

La evaluación se hizo sentando al modelo en el puesto de decisión del robot y recorriendo el mismo curso durante 20 episodios (semillas 91001–91020). La simulación de marcha es una aproximación 2D basada en una tabla de velocidades por comando, no en MuJoCo real, por lo que los resultados pueden diferir del simulador físico. No se detallan hiperparámetros de LoRA, número de tokens de entrenamiento ni composición completa del dataset más allá de los recuentos indicados.

## Capacidades

- Toma de decisiones discretas en un entorno simulado de evitación de obstáculos: dado un estado textual del robot, devuelve una letra de acción.
- Formato de salida estrictamente restringido a una letra, sin explicación, según el system prompt recomendado.
- Comprensión de estados estructurados en lenguaje natural (distancias, dirección, sensores, velocidad, acción previa).
- Robustez parcial ante estados con ruido o derivas del profesor, gracias al 20 % de ejemplos de desviación incluidos en el entrenamiento supervisado.
- Capacidad multilingüe limitada al coreano en los datos de entrenamiento; el modelo base Qwen tiene capacidades multilingües, pero el adaptador no las preserva necesariamente.
- No se documentan tool calling, function calling, razonamiento multi-paso, visión, audio ni modo thinking para este adaptador.

## Casos de uso

- Investigación en destilación de políticas RL a LLM: sirve como ejemplo reproducible de cómo convertir una política PPO en un modelo de lenguaje pequeño mediante LoRA y ajuste con RL, útil para estudiar el equilibrio entre imitación y optimización de recompensa.
- Educación en aprendizaje por refuerzo: el flujo completo (entorno web, generación de dataset, SFT, PPO con KL) está documentado y enlazado a un notebook de Colab, lo que permite usarlo como material docente.
- Prototipado de agentes de decisión en simulación 2D: se puede integrar en el simulador `connect_tycoon.link01` para probar variantes de recompensa o de formato de estado sin reentrenar la política base.
- Evaluación comparativa de métodos de alineación: permite contrastar SFT frente a SFT+RL en una tarea de clasificación de acciones con métricas de éxito y colisiones.
- Generación de datos sintéticos de decisión: el adaptador puede usarse para producir etiquetas de acción sobre estados simulados y alimentar otros experimentos.
- Docencia sobre PEFT: ejemplo mínimo de carga de un adaptador LoRA con `PeftModel.from_pretrained` sobre un modelo base pequeño, adecuado para prácticas de ajuste eficiente.
- No es adecuado para control de robots reales sin revalidación en el robot y el espacio concretos, tal como advierte el autor.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (evaluación en el curso `751ef5ff`, 20 episodios con semillas 91001–91020, simulación 2D aproximada):

| Modelo | Acierto en test (misma respuesta que el profesor) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Profesor (política PPO) | 100,0 % | 95 % | 25 % | 22,5 s |
| Antes del entrenamiento | 34,4 % | 0 % | 0 % | — |
| Solo SFT (LoRA) | 78,9 % | 95 % | 10 % | 21,6 s |
| SFT + RL (modelo publicado) | 68,7 % | 100 % | 0 % | 21,5 s |

No se han publicado resultados de benchmarks estándar de LLM (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,8 mil millones de parámetros ocupa aproximadamente 1,6 GB en fp16 y alrededor de 0,5–0,6 GB en cuantización de 4 bits; el adaptador LoRA añade una sobrecarga mínima.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090 o superiores funcionan sin problema. Para despliegue en servidor, A100 o H100 no son necesarias.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU consumer modernas, e incluso en CPU para inferencia puntual.
- Opciones de despliegue: transformers + PEFT (flujo documentado por el autor), llama.cpp u Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF, y vLLM o TGI con soporte de adaptadores LoRA.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, la latencia por decisión debería ser de milisegundos en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma tarea (decisión robótica simulada destilada en LLM). Como referencia estructural:

| Modelo | Parámetros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| connectailab-rl-kkaji-v2-v1-link01 | 0,8 B (base) + LoRA | No disponible | Decisión de evitación de obstáculos en simulación | Apache 2.0 |
| Qwen/Qwen3.5-0.8B (base) | 0,8 B | No disponible | Lenguaje general | No disponible |
| Política PPO original (profesor) | No disponible | No aplica | Decisión de evitación de obstáculos | No disponible |

No se conocen alternativas públicas equivalentes con las que comparar rendimiento, contexto o disponibilidad.

## Limitaciones y advertencias

- Modelo de investigación y educación: el propio autor advierte que debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- La evaluación se realizó con una aproximación 2D de la marcha basada en una tabla de velocidades, no con MuJoCo real; los resultados pueden diferir del simulador físico.
- El acierto en test baja del 78,9 % (SFT) al 68,7 % (SFT+RL) pese a mejorar el éxito en episodios: el modelo publicado se aleja más del profesor en la imitación literal, lo que puede afectar a la fidelidad en estados no vistos.
- Entrenado únicamente en coreano y sobre un curso y una tarea concretos (`avoid_obstacles`, curso `751ef5ff`); no generaliza a otras tareas, entornos ni idiomas.
- Riesgo de alucinación de letras fuera del conjunto de opciones si el prompt no restringe estrictamente la salida; el system prompt recomendado es parte del contrato de uso.
- Dataset pequeño (1063 ejemplos de entrenamiento), lo que limita la cobertura de estados y aumenta el riesgo de sobreajuste al curso concreto.
- Sesgos conocidos: no documentados por el autor.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero conviene verificar la licencia del modelo base Qwen/Qwen3.5-0.8B antes de un despliegue comercial.
- No se documentan restricciones de contexto ni límites de longitud de entrada; el formato de estado es textual y corto.

## Enlaces

- Hugging Face: https://huggingface.co/kkaji-studio/connectailab-rl-kkaji-v2-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Entorno web de aprendizaje: https://www.ezerai.xyz/robot-lab/world/
- YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL: https://www.aicitybuilders.com/robot
