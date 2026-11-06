# devorah-ai-2016/connectailab-rl-devorah-v1-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el desarrollador independiente devorah-ai-2016 en el marco del proyecto CONNECT AI LAB. No es un modelo de lenguaje de propósito general: es un modelo de decisión para un robot caminante de dos dimensiones (LINK-01) que debe elegir, cada 0,5 segundos, una de cuatro acciones de locomoción (avanzar, girar, etc.) a partir de una descripción textual del estado del robot (distancia al objetivo, dirección, sensores de distancia, velocidad y acción previa). La tarea concreta se denomina `choose_object` y el modelo responde con una única letra de opción.

La relevancia técnica del artefacto está en su metodología, no en su tamaño: el autor entrenó primero una política PPO en un simulador web (un "cerebro" exportado como `brain.json`), generó un conjunto de problemas textuales a partir de las observaciones de esa política y aplicó aprendizaje supervisado (LoRA) seguido de refuerzo con KL para alinear al modelo de lenguaje con las decisiones de la política. El resultado es un modelo de 0,8 mil millones de parámetros con licencia Apache 2.0, pensado para investigación y docencia en IA física, robótica simulada y aprendizaje por refuerzo.

El modelo tiene un alcance muy acotado: solo coreano como idioma declarado, un pipeline de reinforcement-learning y un formato de salida restringido a una letra. No debe confundirse con un asistente conversacional ni con un modelo de robótica de uso general; su valor es demostrativo y educativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8 mil millones (modelo base); el adaptador LoRA añade un número no especificado de parámetros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3.5-0.8B) |
| Tipos de cuantizacion | no disponible (los pesos publicados son safetensors en precisión de entrenamiento; el modelo base admite las cuantizaciones habituales de Qwen) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base Qwen/Qwen3.5-0.8B por separado |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 0,8 mil millones de parámetros de la familia Qwen3.5, sobre el que se aplica un adaptador LoRA entrenado con la librería PEFT. El pipeline declarado es `reinforcement-learning`, y las etiquetas incluyen `ppo`, `deep-reinforcement-learning`, `robotics` y `decision-making`. El entrenamiento se organiza en cuatro fases descritas por el autor: (1) entrenamiento de una política PPO en un simulador web de caminata 2D para la tarea `choose_object`, con una tasa de éxito del 45 % en el curso `random`; (2) generación de un conjunto de problemas textuales a partir de las observaciones de la política cada 0,5 segundos, donde la respuesta correcta es la acción elegida por la política, incluyendo un 20 % de ejemplos con acciones subóptimas; (3) aprendizaje supervisado con LoRA para imitar esas decisiones; y (4) refuerzo adicional con una penalización KL que ancla el modelo al de la fase supervisada y recompensa las opciones que, evaluadas por la política, producen mejores resultados.

El conjunto de datos resultante tiene 589 ejemplos de entrenamiento, 97 de validación y 233 de test. El autor reporta que la tasa de coincidencia entre el texto y la decisión de la política (el "techo" de acierto) es del 100 %, es decir, que la representación textual no introduce ambigüedad. La evaluación de la caminata se realizó con una aproximación 2D basada en una tabla de velocidades por comando, no con el simulador MuJoCo completo, lo que el propio autor advierte como una limitación metodológica.

## Capacidades

- Decisión de locomoción discreta: dado un estado textual del robot LINK-01, devuelve exactamente una letra correspondiente a una de las cuatro acciones disponibles.
- Seguimiento de instrucciones con formato estricto: el prompt de sistema exige devolver solo la letra, sin explicación.
- Tratamiento del estado como datos, no como instrucciones (el prompt de sistema lo indica explícitamente).
- Razonamiento de un solo paso sobre observaciones numéricas y categóricas (distancias, direcciones, velocidad, acción previa).
- No soporta tool calling ni function calling de forma nativa.
- No soporta agents ni razonamiento multi-paso.
- Capacidades multilingües limitadas al coreano declarado; el prompt de sistema está en inglés pero el modelo no declara soporte para ese idioma.
- Sin capacidades de visión, audio ni modo "thinking".

## Casos de uso

- Docencia de aprendizaje por refuerzo: el modelo sirve como ejemplo completo de un pipeline PPO → destilación supervisada → RL con KL, replicable con el notebook de Colab y el repositorio CONNECT TYCOON.
- Investigación en destilación de políticas: permite estudiar cuánto de una política PPO se puede transferir a un modelo de lenguaje de 0,8 B y qué se pierde en el proceso (el autor reporta una caída de éxito del 45 % al 40 % tras el RL).
- Simulación de robótica educativa: integrado en el entorno web de LINK-01, permite a estudiantes crear cursos y observar cómo el modelo decide en cada paso de 0,5 segundos.
- Generación de datos sintéticos de decisión: el par (observación textual, letra) puede usarse para aumentar datasets de decisión en entornos simulados similares.
- Pruebas de robustez de prompts: al ser un modelo muy pequeño y con salida restringida, es útil para evaluar la resistencia a inyección de instrucciones en el campo de estado.
- Prototipado rápido en local: con 0,8 B de parámetros y un adaptador LoRA de ~0,1 GB, se puede ejecutar en una GPU de consumo para experimentar con variantes del prompt o del formato de observación.
- Referencia para evaluación de modelos de decisión: el conjunto de test de 233 problemas y la métrica de éxito en 20 episodios (semillas 91001–91020) constituyen un banco de pruebas reproducible para comparar métodos de alineación.

## Benchmarks y rendimiento

Los únicos datos publicados son los del autor en la model card, medidos sobre su propio conjunto de test y su aproximación de caminata 2D:

| Modelo | Acierto en test (coincidencia con la política) | Éxito en 20 episodios del curso `random` | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Política PPO (profesor) | 100,0 % | 45 % | 0 % | 8,7 s |
| Modelo base sin entrenar | 15,5 % | 60 % | 0 % | 8,7 s |
| Tras aprendizaje supervisado (LoRA) | 96,1 % | 25 % | 0 % | 7,8 s |
| Tras refuerzo con KL (modelo publicado) | 95,7 % | 40 % | 0 % | 8,2 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, y carecería de sentido aplicarlos a un modelo de decisión restringido.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, el modelo base de 0,8 B ocupa aproximadamente 1,6 GB de pesos, más overhead de activaciones y caché KV; en la práctica, entre 2 y 3 GB. En cuantización de 8 bits, en torno a 1 GB; en 4 bits, por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior permite ejecución holgada. Para entrenamiento del adaptador LoRA, una RTX 4090 o una A100 acortan los tiempos, aunque el conjunto de datos (589 ejemplos) es tan pequeño que el entrenamiento es viable en GPU de consumo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada moderna e incluso en algunas integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers + PEFT (el método documentado por el autor), llama.cpp y Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF, y vLLM con soporte de adaptadores LoRA.
- Latencia y throughput: no disponibles en la información proporcionada. Dado el tamaño y la salida de un solo token, la latencia esperada es de milisegundos en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables en la información proporcionada: se trata de un adaptador LoRA de decisión sobre un modelo base concreto, no de un modelo de propósito general. La comparación más informativa es interna, entre las fases del propio entrenamiento (ver la tabla de benchmarks). Como referencia de la familia base:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| connectailab-rl-devorah-v1-link01 (este) | 0,8 B + LoRA | no disponible | Apache 2.0 | Hugging Face, 31 descargas |
| Qwen/Qwen3.5-0.8B (base) | 0,8 B | no disponible | según el modelo base | Hugging Face |
| Otras variantes de la familia Qwen3.5 | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- Alcance extremadamente restringido: solo responde a la tarea `choose_object` con cuatro opciones; fuera de ese formato su comportamiento no está caracterizado.
- Idioma: solo se declara coreano; el prompt de sistema está en inglés, lo que puede degradar el rendimiento si se traduce o se reformula.
- Evaluación metodológicamente limitada: la caminata se puntúa con una tabla de velocidades 2D, no con MuJoCo completo, y el propio autor advierte que los resultados pueden diferir del simulador real.
- Caída de rendimiento tras el RL: el éxito en episodios baja del 60 % (modelo sin entrenar) al 40 % (modelo publicado), aunque el acierto en test se mantiene alto; el autor atribuye el comportamiento del modelo sin entrenar a un sesgo hacia acciones que resultan favorables en el curso evaluado.
- Riesgo de alucinación de letra: si el estado se presenta con un formato distinto al de entrenamiento, el modelo puede devolver una letra no incluida entre las opciones.
- Riesgo de inyección de instrucciones: el prompt de sistema indica tratar el estado como datos, pero un modelo de 0,8 B no ofrece garantías robustas frente a ataques de prompt injection en el campo de estado.
- No apto para robótica real sin revalidación: el autor lo indica explícitamente; es un modelo de investigación y educación sobre simulación.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado.
- Sin datos de sesgo, toxicidad ni evaluación de seguridad publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/devorah-ai-2016/connectailab-rl-devorah-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Entorno web de aprendizaje robótico: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
