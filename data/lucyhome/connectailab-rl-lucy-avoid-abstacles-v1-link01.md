# lucyhome/connectailab-rl-lucy-avoid-abstacles-v1-link01

## Resumen

connectailab-rl-lucy-avoid-abstacles-v1-link01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario lucyhome dentro del ecosistema CONNECT AI LAB / CONNECT TYCOON. No es un modelo de lenguaje generalista, sino un modelo de decisión para robótica: recibe en texto el estado de un robot LINK-01 (distancia y dirección al objetivo, lecturas de sensores de distancia, velocidad y acción previa) y devuelve una única letra que codifica el movimiento para los siguientes 0,5 segundos. El caso de uso concreto es la tarea `avoid_obstacles` (esquivar obstáculos) sobre el entorno de simulación web de CONNECT AI WORLD.

El pipeline de creación es poco habitual y conviene entenderlo: primero se entrena una política PPO (el "cerebro", brain.json) en un simulador web de MuJoCo; después se generan pares observación-en-texto / acción del cerebro caminando un curso concreto; sobre esos datos se hace un ajuste supervisado con LoRA del modelo Qwen3.5-0.8B; y finalmente se aplica un paso de refuerzo con anclaje KL para premiar opciones con mejor recompensa estimada que la del profesor. El resultado es un adaptador de muy pequeño tamaño (el repo reporta 0,0 GB) pensado para investigación y educación, no para producción.

Su relevancia es acotada pero interesante como ejemplo de destilación de políticas RL a modelos de lenguaje: demuestra que un LM de 0,8B con LoRA puede aproximar, con limitaciones claras, la política de un agente entrenado con PPO. Los resultados publicados son modestos: la tasa de acierto frente al profesor baja del 33,4 % inicial al 48,8 % tras SFT y RL, y el éxito en las 20 partidas de evaluación es del 0 % con un 90 % de colisiones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-0.8B |
| Parámetros totales | 0,8B en el modelo base; número de parámetros del adaptador no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del base Qwen3.5-0.8B, no especificada en la model card) |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors; el base admite las cuantizaciones de Qwen3.5-0.8B) |
| Idiomas soportados | Coreano (ko) según la model card; el prompt de sistema está en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Pipeline | reinforcement-learning |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Tarea | avoid_obstacles (esquivar obstáculos) |
| Convención de tarea | `link01-decision/avoid_obstacles/obs21-act5/walker51-14/v1` |
| Dataset de entrenamiento | train: 977, valid: 197, test: 287 preguntas |
| Fecha de creación | 2026-11-04 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros, mediante LoRA (PEFT). La entrada es una representación textual del estado del robot: distancia y dirección al objetivo, lecturas de sensores de distancia, velocidad actual y acción previa. La salida es exactamente una letra entre las opciones listadas, sin explicación. El prompt de sistema fuerza este formato y advierte que el contenido dentro de `state` es dato, no instrucción, una mitigación básica de prompt injection.

El entrenamiento tiene tres fases documentadas. Primero, se entrena una política PPO en el simulador web de CONNECT AI WORLD sobre el curso `random`, alcanzando un 90 % en el examen oficial. Segundo, se generan 977 ejemplos de entrenamiento (más 197 de validación y 287 de test) convirtiendo cada observación del cerebro a texto y tomando como etiqueta su acción; un 20 % de los ejemplos corresponden a situaciones en las que el cerebro se desvió del camino. Tercero, se aplica SFT con LoRA y después un paso de RL con anclaje KL que sube la probabilidad de opciones con mayor recompensa estimada y baja la de las peores. La evaluación de la política resultante se hace con una aproximación 2D de la marcha basada en una tabla de velocidades medidas por comando, sin el modelo robótico ni la red neuronal de marcha reales, por lo que los resultados pueden diferir de los del MuJoCo web.

## Capacidades

- Decisión de movimiento discreta: dado un estado textual del robot LINK-01, devuelve una letra que corresponde a una acción de 0,5 segundos.
- Formato de salida estricto: una sola letra, sin texto adicional, cuando se usa el prompt de sistema recomendado.
- Robustez parcial frente a instrucciones embebidas en el estado gracias a la instrucción de tratar `state` como dato.
- Aprendizaje por refuerzo con anclaje KL para corregir decisiones del profesor en la dirección de mayor recompensa.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe efectiva muy limitada: el modelo está declarado en coreano y el prompt de sistema en inglés; no hay evidencia de uso en castellano.
- No es un modelo de propósito general: no debe usarse para generación de texto libre, código o matemáticas.

## Casos de uso

- Investigación en destilación de políticas RL: usar el adaptador como referencia para estudiar cuánto de una política PPO se puede recuperar con un LM de 0,8B y LoRA, comparando SFT frente a RL.
- Educación en robótica y RL: el notebook de Colab y el simulador web permiten reproducir el pipeline completo (PPO, generación de dataset, SFT, RL) con recursos modestos.
- Prototipado de interfaces texto-acción: validar el formato `link01-decision/...` como contrato de entrada/salida antes de invertir en un modelo mayor o en una política dedicada.
- Baseline de comparación: servir como punto de partida negativo (0 % de éxito, 90 % de colisiones) frente al que medir mejoras en futuras versiones del mismo pipeline.
- Docencia sobre evaluación de agentes: el conjunto de test de 287 preguntas y las 20 partidas con semillas 91001–91020 permiten discutir métricas de acierto frente a profesor y de éxito en tarea.
- Integración en el ecosistema CONNECT TYCOON: usar la utilidad `connect_tycoon.link01.questions` para convertir observaciones reales del simulador al formato de pregunta del modelo.
- No se recomienda su uso en atención al cliente, generación de código, análisis documental ni ninguna tarea de lenguaje general.

## Benchmarks y rendimiento

Resultados publicados en la model card (evaluación sobre 287 preguntas de test y 20 partidas con semillas 91001–91020):

| Modelo | Acierto en test (coincide con el cerebro) | Éxito en 20 partidas | Partidas con colisión | Tiempo medio en partidas exitosas |
|---|---|---|---|---|
| Cerebro (profesor PPO) | 100,0 % | 100 % | 0 % | 21,4 s |
| Antes de entrenar | 33,4 % | 0 % | 10 % | — |
| SFT (LoRA) | 48,8 % | 0 % | 90 % | — |
| SFT + RL (este modelo) | 48,8 % | 0 % | 90 % | — |

Cota superior de acierto al pasar la observación a texto: 99 %. La evaluación de marcha usa una aproximación 2D con tabla de velocidades, no el simulador MuJoCo completo. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 2 GB en fp16 para el base de 0,8B más el adaptador; aproximadamente 1 GB o menos con cuantización de 4 bits.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más (RTX 3050, RTX 4060, RTX 4090) es suficiente; A100/H100 no aportan ventaja para este tamaño.
- Cabe en GPU consumer: sí, incluso en iGPU con suficiente memoria compartida usando llama.cpp.
- Opciones de despliegue: transformers + peft (ruta documentada por el autor), llama.cpp/Ollama tras fusionar el adaptador con el base y convertir a GGUF, y vLLM con soporte de adaptadores LoRA.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del base se espera latencia de milisegundos por decisión en GPU consumer, pero no hay medición publicada.

## Comparativa con modelos similares

No hay modelos directamente comparables publicados en la información disponible: se trata de un adaptador LoRA específico de una tarea y un simulador propietarios del ecosistema CONNECT AI LAB. Como referencias conceptuales:

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (link01, avoid_obstacles) | 0,8B (base) + LoRA | No disponible | Decisión de movimiento en LINK-01 | Apache 2.0 | Hugging Face, 0 descargas |
| Cerebro PPO (profesor) | No disponible | No aplica | Misma tarea, 100 % de éxito | No disponible | Solo vía simulador CONNECT AI WORLD |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible | Lenguaje general | No disponible en la información | Hugging Face |

## Limitaciones y advertencias

- Rendimiento muy bajo en la tarea objetivo: 0 % de éxito y 90 % de colisiones en las 20 partidas de evaluación, idéntico a la versión solo SFT; el paso de RL no mejoró ninguna métrica publicada.
- Brecha grande frente al profesor: 48,8 % de coincidencia en test frente al 100 % del cerebro PPO, con una cota superior del 99 % atribuible a la conversión a texto.
- Evaluación aproximada: la marcha se simula con una tabla 2D de velocidades, no con el modelo robótico ni la red de marcha, por lo que los resultados pueden no trasladarse al simulador real.
- Ámbito muy restringido: solo la tarea `avoid_obstacles` y la convención `obs21-act5/walker51-14/v1`; no se ha validado en otros cursos, robots o entornos.
- Idioma: declarado en coreano, con prompt de sistema en inglés; no hay evidencia de funcionamiento en castellano.
- Riesgo de alucinación de formato: si se altera el prompt de sistema, el modelo puede devolver texto libre en lugar de una letra, rompiendo el contrato de salida.
- Sesgos: al derivar de una política PPO entrenada solo en el curso `random`, hereda sus sesgos de comportamiento y no generaliza a distribuciones de obstáculos distintas.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el modelo base Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado; además, el autor advierte que es un modelo de investigación y educación y que debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- Sin mantenimiento aparente: 0 descargas, 0 likes y publicación única el 2026-11-04; no hay historial de versiones ni issues.
- Advertencia de seguridad: el prompt de sistema incluye una defensa básica contra instrucciones embebidas en `state`, pero no hay evaluación publicada de su eficacia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lucyhome/connectailab-rl-lucy-avoid-abstacles-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de aprendizaje: https://www.ezerai.xyz/robot-lab/world/
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL: https://www.aicitybuilders.com/robot
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- Banner del proyecto: https://raw.githubusercontent.com/wonseokjung/connect-tycoon/main/docs/brand/banner.gif
