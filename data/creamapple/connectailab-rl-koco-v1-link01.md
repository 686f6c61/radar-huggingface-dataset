# creamapple/connectailab-rl-koco-v1-link01

## Resumen

LINK-01 es un adaptador LoRA de tipo PEFT sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por creamapple en el marco del proyecto CONNECT AI LAB × AI CITY BUILDERS. No es un modelo de lenguaje de propósito general, sino un "cerebro de decisión" para el robot simulado LINK-01: recibe en texto el estado del robot (distancia y dirección al objetivo, sensores de distancia, velocidad y acción previa) y devuelve una única letra que corresponde a la acción de caminar para los próximos 0,5 segundos.

El modelo se entrena en dos fases sobre un conjunto de 677 ejemplos de entrenamiento, 141 de validación y 201 de test. Primero se hace un ajuste supervisado (LoRA) para imitar las respuestas de una política PPO entrenada previamente en un entorno web (el "profesor" o brain.json), y después se aplica aprendizaje por refuerzo con anclaje KL para corregir las decisiones hacia acciones con mayor recompensa esperada. La tarea concreta es `goto_target` con observaciones de 21 dimensiones y 5 acciones discretas.

Su relevancia es acotada pero interesante como caso de estudio: demuestra cómo destilar una política de RL en un modelo de lenguaje pequeño (0,8B de parámetros) mediante LoRA, y cómo el RL posterior mejora el éxito en la tarea (del 15 % al 35 % en 20 episodios) aunque empeora ligeramente la coincidencia con el profesor (del 65,7 % al 60,7 %). Está pensado para investigación y educación en simulador, no para robótica real sin revalidación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-0.8B |
| Parametros totales | 0,8B en el modelo base; el adaptador LoRA añade un número no disponible de parámetros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El adaptador LoRA se entrena en dos etapas. En la primera, aprendizaje supervisado: se generan 677 pares (observación textual, acción del profesor) a partir de una política PPO entrenada en el entorno web `goto_target` (observación de 21 dimensiones, 5 acciones, curso `32db117c`), con un 20 % de ejemplos en los que el profesor se desvía deliberadamente para cubrir situaciones fuera de distribución. En la segunda, aprendizaje por refuerzo con PPO y anclaje KL: para cada opción se calcula la recompensa que se habría obtenido si el resto del episodio lo hubiera completado el profesor, y se suben las probabilidades de las opciones mejores y se bajan las peores.

El formato de entrada es un prompt de sistema fijo que instruye a evaluar la tarea, tratar el texto del estado como datos y devolver solo la letra de la opción elegida, sin explicación. La evaluación de la caminata se hace con una aproximación 2D basada en una tabla de velocidades medidas por comando (no con el modelo físico ni la red de marcha reales), lo que evita caídas pero puede diferir de los resultados en MuJoCo web.

## Capacidades

- Toma de decisiones discreta en un entorno simulado concreto: dado un estado del robot en texto, devuelve una de cinco acciones (una letra).
- Salida restringida a una única letra, sin texto explicativo, lo que facilita el parseo en pipelines.
- Robustez parcial ante estados fuera de distribución (incluidos en el 20 % del dataset de entrenamiento).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni planificación de agentes más allá de la decisión puntual cada 0,5 s.
- Capacidad multilingüe limitada al coreano en la práctica (el prompt de sistema está en inglés, pero el dataset y la tarea son en coreano).
- No tiene visión, audio ni modo de pensamiento (thinking).

## Casos de uso

- Investigación en destilación de políticas RL a modelos de lenguaje: sirve como referencia reproducible para estudiar cómo un LoRA de 0,8B imita y luego mejora una política PPO en una tarea de control discreta.
- Educación en aprendizaje por refuerzo: el notebook de Colab y el repositorio CONNECT TYCOON permiten reproducir el pipeline completo (entrenamiento PPO, generación de dataset, SFT, RL) con fines didácticos.
- Prototipado de agentes de decisión en simulador: integrable en el entorno web de CONNECT AI WORLD para sustituir la política PPO por un modelo de lenguaje y comparar comportamientos.
- Evaluación de robustez de LLM pequeños en tareas de control: útil para medir la tasa de coincidencia con el profesor (60,7 %) y el éxito en episodios (35 %) bajo distintas condiciones.
- Generación de datos sintéticos de decisión: el modelo puede producir etiquetas de acción para estados adicionales, aunque con la cautela de que su precisión es limitada.
- Benchmark de adaptadores PEFT en dominios no lingüísticos: permite comparar LoRA frente a ajuste completo u otras técnicas en una tarea de robótica simulada de bajo coste computacional.

## Benchmarks y rendimiento

| Modelo | Acierto en test (coincidencia con el profesor) | Éxito en 20 episodios del curso | Episodios con colisión | Tiempo medio de éxito |
|---|---|---|---|---|
| Profesor (PPO) | 100,0 % | 100 % | 0 % | 14,5 s |
| Antes de entrenar | 22,4 % | 0 % | 0 % | — |
| Aprendizaje supervisado | 65,7 % | 15 % | 75 % | 17,5 s |
| Aprendizaje por refuerzo | 60,7 % | 35 % | 70 % | 18,0 s |

El techo teórico de acierto (coincidencia con el profesor al pasar la observación a texto) es del 99 %. La evaluación de la caminata usa una aproximación 2D con tabla de velocidades, no el simulador físico real.

## Requisitos de hardware

- VRAM estimada: el modelo base de 0,8B en fp16 ocupa aproximadamente 1,6 GB; en 8 bits, unos 0,8 GB; en 4 bits, unos 0,4 GB. El adaptador LoRA añade una cantidad marginal no especificada.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente (RTX 3060, RTX 4060, RTX 4090). Para entrenamiento del adaptador, una RTX 3090 o superior acelera el proceso.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU dedicadas modernas e incluso en algunas integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers + peft (según el ejemplo de la model card), llama.cpp/Ollama tras fusionar el adaptador con el modelo base, vLLM y TGI tras la fusión.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, la inferencia de una sola letra debería ser de milisegundos en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-koco-v1-link01 | 0,8B (base) + LoRA | No disponible | Decisión discreta en simulador (5 acciones) | Apache 2.0 | HuggingFace (0 descargas) |
| Qwen/Qwen3.5-0.8B | 0,8B | No disponible | Lenguaje general | No disponible en la información | HuggingFace |
| Política PPO del profesor (brain.json) | No aplica (red pequeña) | No aplica | Decisión discreta en simulador | No disponible | Repositorio CONNECT TYCOON |

No se dispone de datos de benchmarks de modelos comparables de la misma categoría (adaptadores RL sobre LLM para robótica simulada) en la información proporcionada.

## Limitaciones y advertencias

- Sesgos: el modelo imita a un profesor PPO entrenado en un único curso (`32db117c`); generaliza mal a otros mapas u objetivos no vistos.
- Alucinación: puede devolver una letra válida pero incorrecta; el 39,3 % de los casos de test no coinciden con el profesor.
- Contexto e idioma: entrenado en coreano y para una tarea muy concreta; no es un modelo de propósito general.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado.
- Caveat de producción: la evaluación de la caminata usa una aproximación 2D con tabla de velocidades, no el simulador físico; los resultados pueden diferir en MuJoCo real.
- El modelo solo es válido para investigación y educación en simulador; el propio autor advierte de que debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-02); no hay evidencia de uso o validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/creamapple/connectailab-rl-koco-v1-link01
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL en AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Entorno web de aprendizaje: https://www.ezerai.xyz/robot-lab/world/
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
