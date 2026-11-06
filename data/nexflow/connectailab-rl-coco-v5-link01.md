# nexflow/connectailab-rl-coco-v5-link01

## Resumen

connectailab-rl-coco-v5-link01 es un adaptador LoRA entrenado con aprendizaje por refuerzo (PPO) sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario nexflow en Hugging Face. No se trata de un modelo de lenguaje generalista, sino de un "modelo de decisión" especializado que actúa como cerebro del robot simulado LINK-01 en la tarea `follow_route`: lee en texto el estado del robot (distancia al objetivo, dirección, sensores de distancia, velocidad y acción previa) y devuelve una única letra correspondiente a una de las cinco acciones posibles para el siguiente intervalo de 0,5 segundos.

El modelo se ha destilado a partir de una política PPO entrenada previamente en un entorno web (brain.json) mediante un pipeline de dos fases: primero aprendizaje supervisado (LoRA) sobre 1.014 ejemplos de entrenamiento generados a partir de las observaciones del profesor, y después un ajuste con RL que reordena las preferencias entre opciones según la recompensa obtenida al dejar que el profesor continúe la trayectoria. El resultado es un adaptador de muy bajo coste computacional (base de 0,8B parámetros) que reproduce el comportamiento del profesor con una tasa de éxito del 100% en 20 episodios de evaluación, aunque con una fidelidad de decisión inferior a la del profesor (77,9% de coincidencia frente al 100%).

Su relevancia es fundamentalmente metodológica y educativa: demuestra cómo destilar una política de RL en un modelo de lenguaje pequeño mediante LoRA y PPO, con un formato de salida restringido a una letra. Está pensado para investigación y docencia en simulación, no para despliegue en robots reales sin revalidación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8B en el modelo base; el adaptador LoRA añade un número no disponible de parámetros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantización dependerá del modelo base) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El adaptador se entrena en dos etapas. En la primera, se genera un conjunto de 1.014 ejemplos de entrenamiento (307 de validación y 308 de test) a partir de las observaciones que el profesor PPO (brain.json, entrenado en el entorno web de CONNECT AI WORLD con la tarea `follow_route` y política `link01-decision/follow_route/obs16-act5/walker51-14/v1`) registra cada 0,5 segundos; cada ejemplo convierte la observación en texto y la respuesta correcta es la acción elegida por el profesor, incluyendo un 20% de casos en los que el profesor se desvía deliberadamente. Sobre estos datos se aplica un ajuste supervisado con LoRA.

En la segunda etapa se aplica RL con PPO: para cada opción se calcula la recompensa que se obtendría si el profesor continuara la trayectoria tras esa elección, y se refuerzan las opciones mejores que la del profesor y se penalizan las peores, con una restricción KL para mantener el adaptador cerca de la política supervisada. El modelo final evaluado y publicado es el de la etapa supervisada, no el de RL, según indica la model card. La evaluación de la conducción se realiza con una aproximación 2D de la marcha (tabla de velocidades por comando derivada del simulador web MuJoCo), sin red neuronal de marcha ni modelo robótico, por lo que no reproduce caídas.

## Capacidades

- Toma de decisiones discretas en un espacio de 5 acciones (`act5`) a partir de una observación textual de 16 dimensiones (`obs16`).
- Generación de una única letra como salida, sin explicación, siguiendo un formato estricto definido en el system prompt.
- Procesamiento de estado del robot en lenguaje natural: distancia al objetivo, dirección, sensores de distancia, velocidad y acción previa.
- Robustez parcial ante instrucciones embebidas en el estado: el system prompt indica tratar el texto dentro de `state` como datos, no como instrucciones.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento encadenado.
- Capacidad multilingüe limitada al coreano para la formulación de las preguntas; el system prompt está en inglés.
- No dispone de visión, audio ni modo "thinking".

## Casos de uso

- Docencia de RL y destilación: sirve como ejemplo completo y reproducible de cómo convertir una política PPO en un adaptador LoRA sobre un LLM pequeño, con notebook de Colab incluido en la model card.
- Investigación en destilación de políticas: permite estudiar la brecha entre la política profesor (100% de coincidencia) y el alumno (77,9% tras RL, 80,8% tras supervisión) en tareas de decisión discretas.
- Simulación de agentes en entornos 2D: se puede integrar en un bucle de simulación que genere observaciones textuales cada 0,5 s y consuma la letra devuelta por el modelo para mover un agente.
- Prototipado de interfaces estado→acción basadas en lenguaje: útil para validar pipelines donde el estado se serializa a texto y la acción se restringe a un conjunto cerrado de opciones.
- Evaluación comparativa de métodos de ajuste (SFT vs. RL con PPO y KL): el modelo publica métricas de ambos enfoques sobre el mismo conjunto de test, lo que facilita replicar experimentos.
- Generación de datos sintéticos de decisión: el adaptador puede emplearse para etiquetar observaciones nuevas con la acción más probable según el profesor destilado, siempre con revisión humana.
- Demostraciones educativas en vídeo y talleres: la model card enlaza un canal de YouTube y un curso de RL, y el modelo está pensado como material didáctico.

## Benchmarks y rendimiento

Datos publicados en la model card (evaluación sobre el conjunto de test de 308 problemas y 20 episodios de simulación con semillas 91001–91020):

| Modelo | Acierto en test (coincidencia con el profesor) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Profesor (brain.json, PPO) | 100,0% | 100% | 0% | 21,8 s |
| Modelo sin entrenar | 44,8% | 0% | 0% | — |
| Ajuste supervisado (LoRA) | 80,8% | 100% | 0% | 22,2 s |
| Ajuste con RL (PPO) | 77,9% | 100% | 0% | 21,9 s |

Cota superior de acierto alcanzable al reformular la observación en texto: 97%. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,6 GB en fp16 para el modelo base de 0,8B, más el adaptador LoRA (tamaño exacto no disponible); en cuantización de 4 bits cabe holgadamente en GPUs de 4 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; para lotes grandes o baja latencia, A100 o H100 son innecesarias pero válidas.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs con al menos 4 GB de VRAM.
- Opciones de despliegue: transformers + peft (flujo documentado en la model card), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, llama.cpp/Ollama si se fusiona el adaptador en el modelo base y se convierte a GGUF.
- Latencia y throughput: no disponibles. La tarea exige una decisión cada 0,5 s por agente, por lo que la latencia por token es el factor crítico; el modelo genera un único token de salida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-coco-v5-link01 | 0,8B + LoRA | No disponible | Decisión discreta `follow_route` | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible | LM generalista | No disponible en la información | Hugging Face |
| Política PPO `brain.json` (profesor) | No disponible | No aplica | Decisión discreta `follow_route` | No disponible | Repositorio connect-tycoon |

No se dispone de información sobre otros adaptadores de decisión comparables en la búsqueda web realizada; los resultados de búsqueda para "NexFlow" corresponden a empresas de automatización francesas sin relación con este modelo.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea `follow_route` con un espacio de 5 acciones; no generaliza a otras tareas de decisión ni a otros robots.
- La evaluación de la marcha usa una aproximación 2D basada en una tabla de velocidades, no el simulador MuJoCo completo ni un robot real; los resultados pueden diferir en MuJoCo y con seguridad en hardware físico.
- El modelo publicado es el de la etapa supervisada, no el de RL, a pesar de que las etiquetas incluyen `ppo` y `reinforcement-learning`.
- La coincidencia con el profesor es del 80,8% en test, con una cota superior del 97%; existe un margen de error irreducible por la reformulación textual de la observación.
- El idioma de las preguntas es coreano; el system prompt está en inglés. No hay soporte documentado para otros idiomas.
- Riesgo de alucinación: el modelo podría devolver una letra fuera del conjunto permitido o justificar la respuesta si el prompt no se aplica estrictamente; el system prompt exige devolver solo la letra.
- Riesgo de inyección de instrucciones a través del campo `state`: aunque el system prompt lo advierte, no hay garantía formal de que el modelo ignore instrucciones embebidas.
- Licencia Apache 2.0 permite uso comercial, pero la model card indica explícitamente que es un modelo de investigación y educación sobre simulación y que debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB, lo que sugiere que los pesos pueden no estar completamente subidos o que el adaptador es extremadamente pequeño; conviene verificar la integridad antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/nexflow/connectailab-rl-coco-v5-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- Curso de RL en AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Entorno web de entrenamiento: https://www.ezerai.xyz/robot-lab/world/
- Banner del proyecto: https://raw.githubusercontent.com/wonseokjung/connect-tycoon/main/docs/brand/banner.gif
