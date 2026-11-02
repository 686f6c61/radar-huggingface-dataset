# euna88/connectailab-rl-nextforest-v2-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por euna88 en el marco del proyecto CONNECT AI LAB × AI CITY BUILDERS. No es un modelo de lenguaje de propósito general, sino una política de decisión específica para el robot simulado LINK-01: recibe en texto el estado del robot (distancia y dirección al objetivo, lecturas de sensores de distancia, velocidad y acción previa) y devuelve una única letra que corresponde a la acción de caminar durante los siguientes 0,5 segundos. El objetivo declarado es la tarea `avoid_obstacles` (esquivar obstáculos) en un entorno 2D.

El modelo se construye en dos fases. Primero se entrena una política PPO en un simulador web (el "cerebro" o brain.json) que sirve como profesor; después se generan pares estado-respuesta a partir de las observaciones del cerebro y se realiza un ajuste supervisado (LoRA) sobre Qwen3.5-0.8B, seguido de una fase de refuerzo con anclaje KL que sube la probabilidad de opciones con mejor recompensa y baja la de las peores.

Es relevante como ejemplo de destilación de políticas de refuerzo en un modelo de lenguaje pequeño: demuestra que un modelo de 0,8B de parámetros puede aproximar el comportamiento de una política PPO en una tarea de robótica simulada, con una tasa de coincidencia del 77,4 % en el conjunto de test. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo es de 0,0 GB (solo pesos del adaptador).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parámetros totales | No disponible (adaptador LoRA sobre un base de 0,8B; número exacto de parámetros del adaptador no disponible) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repo contiene safetensors del adaptador; no se documentan cuantizaciones) |
| Idiomas soportados | Coreano (`ko`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Librería | peft |
| Pipeline | reinforcement-learning |
| Tarea | `avoid_obstacles` (esquivar obstáculos, robot LINK-01) |
| Acción | Selección de una letra entre las opciones listadas (una acción de 0,5 s) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3.5-0.8B, un transformer decoder-only de 0,8B de parámetros. El entrenamiento se organiza en cuatro etapas descritas en la model card: (1) entrenamiento de una política PPO en el simulador web con la tarea `avoid_obstacles` y el contrato `link01-decision/avoid_obstacles/obs21-act5/walker51-14/v1`; (2) generación de un conjunto de problemas a partir de las observaciones del cerebro cada 0,5 s, con la respuesta del cerebro como etiqueta y un 20 % de ejemplos con acciones alternativas que desvían al robot; (3) ajuste supervisado LoRA sobre Qwen3.5-0.8B; (4) fase de refuerzo con anclaje KL que reordena las opciones según la recompensa obtenida si el cerebro continuara la ejecución desde esa acción.

El conjunto de datos resultante tiene 1630 ejemplos de entrenamiento, 360 de validación y 495 de test. La tasa de coincidencia entre el texto y la respuesta del cerebro (techo de acierto) es del 99 %. La evaluación de la marcha se realizó con una aproximación 2D de la locomoción (tabla de velocidades por comando procedente del simulador MuJoCo web), sin red neuronal de marcha, por lo que no hay caídas y los resultados pueden diferir ligeramente de MuJoCo. El prompt de sistema recomendado instruye al modelo a tratar el estado como datos y devolver solo la letra de la opción elegida.

## Capacidades

- Selección de acción discreta en una tarea de decisión de robótica simulada (esquivar obstáculos) a partir de un estado textual.
- Salida restringida a una única letra entre las opciones listadas, sin explicación.
- Aproximación de la política PPO del cerebro con una tasa de coincidencia del 77,4 % en test.
- Manejo de instrucciones de sistema para delimitar el estado como datos y no como instrucciones.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo thinking.
- Multilingüe limitado: la model card declara únicamente coreano.

## Casos de uso

- Investigación en destilación de políticas RL: usar el adaptador como referencia de cómo un LLM de 0,8B aproxima una política PPO en una tarea discreta, comparando la tasa de coincidencia con el profesor.
- Educación en aprendizaje por refuerzo: el flujo completo (PPO en simulador, generación de pares estado-acción, LoRA y refuerzo con KL) se puede reproducir con el notebook de Colab y el repositorio connect-tycoon.
- Sustitución del cerebro en el simulador LINK-01: colocar el modelo en el punto de decisión del robot y medir el éxito en las 20 partidas con semillas 91001–91020.
- Prototipado de políticas de decisión para robots simulados: usar el formato de pregunta (situación, pregunta y opciones) como plantilla para otras tareas discretas.
- Evaluación de robustez de políticas destiladas: comparar el comportamiento del adaptador frente al cerebro en escenarios con acciones alternativas incluidas en el 20 % del dataset.
- Docencia y divulgación: material de ejemplo para explicar la diferencia entre ajuste supervisado y refuerzo con anclaje KL en modelos pequeños.

## Benchmarks y rendimiento

| Modelo | Acierto en test (misma respuesta que el cerebro) | Éxito en 20 partidas del mismo circuito | Partidas con colisión | Tiempo medio de las partidas exitosas |
|---|---|---|---|---|
| Cerebro (profesor) | 100,0 % | 10 % | 20 | 22,5 s |
| Antes del entrenamiento | 12,9 % | 0 % | 10 | — |
| Ajuste supervisado (LoRA) | 76,6 % | 10 % | 40 | 33,2 s |
| Refuerzo (modelo publicado) | 77,4 % | 0 % | 20 | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La evaluación de marcha usa una aproximación 2D con tabla de velocidades, no el simulador MuJoCo completo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al tratarse de un adaptador LoRA sobre un base de 0,8B, la inferencia requiere cargar el modelo base completo más el adaptador.
- GPU recomendadas: no disponible; por el tamaño del base, cabría en GPU de consumo, pero no se documenta.
- Cabe en GPU de consumo: previsiblemente sí por el tamaño del base (0,8B), aunque no se confirma en la información.
- Opciones de despliegue: transformers + peft (según el ejemplo de la model card). No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-nextforest-v2-link01 (este) | Adaptador sobre 0,8B | No disponible | Decisión `avoid_obstacles` | Apache 2.0 | HuggingFace (0 descargas) |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible | Lenguaje general | No disponible en la información | HuggingFace |
| Política PPO "cerebro" (brain.json) | No disponible | No aplica | Decisión `avoid_obstacles` | No disponible | Dentro del proyecto connect-tycoon |

No se dispone de información sobre otros adaptadores LoRA comparables de la misma familia ni sobre modelos de decisión robótica de tamaño similar.

## Limitaciones y advertencias

- Modelo de investigación y educación sobre simulador; la model card advierte de que debe revalidarse en el robot y el espacio reales antes de usarlo.
- La evaluación de marcha usa una aproximación 2D con tabla de velocidades, no el simulador MuJoCo completo; los resultados pueden diferir.
- El modelo publicado (refuerzo) obtiene 0 % de éxito en las 20 partidas del circuito, frente al 10 % del cerebro y del ajuste supervisado; el acierto en test es del 77,4 %, no del 100 %.
- El ajuste supervisado provoca más colisiones (40) que el cerebro (20) y tarda más en las partidas exitosas (33,2 s frente a 22,5 s).
- Idioma declarado únicamente coreano; no se documenta soporte multilingüe.
- Salida restringida a una letra; no es un modelo conversacional ni de propósito general.
- Riesgo de alucinación no evaluado en la información disponible.
- Sesgos conocidos: no documentados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card limita el uso previsto a investigación y educación sobre simulador.
- El repositorio tiene 0 descargas y 0 likes, y el tamaño es de 0,0 GB (solo adaptador); no se incluyen los pesos del modelo base.

## Enlaces

- HuggingFace: https://huggingface.co/euna88/connectailab-rl-nextforest-v2-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web: https://www.ezerai.xyz/robot-lab/world/
- YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de refuerzo: https://www.aicitybuilders.com/robot
