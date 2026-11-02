# minjunglee27/connectailab-rl-highj-follow-v1-link01

## Resumen

`connectailab-rl-highj-follow-v1-link01` es un adaptador LoRA (PEFT) sobre el modelo de lenguaje `Qwen/Qwen3.5-0.8B`, desarrollado por Minjung Lee (Highj) en el marco del proyecto CONNECT AI LAB / CONNECT TYCOON. No es un modelo conversacional al uso: se trata de una política de decisión encarnada (embodied AI) que traduce observaciones numéricas de un robot simulado en comandos de locomoción discreta. Concretamente, resuelve la tarea `follow_route` del entorno LINK-01, guiando al robot a través de puntos de paso curvos hasta un destino final.

La relevancia técnica del modelo está en su enfoque: en lugar de desplegar directamente una política PPO (el "profesor"), el autor destila el comportamiento de esa política en un LLM pequeño de 0,8 mil millones de parámetros, que recibe las observaciones de 16 dimensiones serializadas como texto estructurado y emite una de cinco acciones discretas a 2 Hz. Según la model card, la política SFT seleccionada alcanza un 95,0 % de éxito en 20 ejecuciones de prueba, frente al 0 % del Qwen base, con una tasa de colisión del 0,0 %.

El modelo es apache-2.0, soporta coreano e inglés y está pensado para ejecución local. Su tamaño reducido y su formato de adaptador lo hacen adecuado para experimentación en robótica simulada y para estudiar la viabilidad de usar LLMs como capas de decisión en bucles de control.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5) con adaptador LoRA (PEFT) |
| Parámetros totales | 0,8 mil millones (modelo base); parámetros del adaptador no disponibles |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Coreano (ko), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-0.8B`, un transformer decoder-only, y se ajusta mediante LoRA sobre las trayectorias de decisión generadas en el simulador LINK-01 de CONNECT AI WORLD. La entrada no es lenguaje natural libre, sino una serialización textual de un vector de observación de 16 dimensiones: coordenadas relativas de tres waypoints (6 valores), error de trayectoria transversal o cross-track error (1), vector de orientación de ruta expresado como seno y coseno (2), velocidades lineal y angular (2) y las cinco acciones previas (5). La salida es una de cinco acciones discretas de locomoción: avanzar, girar a la izquierda, girar a la derecha, rotar en el sitio a la izquierda y rotar en el sitio a la derecha.

El entrenamiento combina dos fases según la model card: una política PPO "profesora" entrenada durante 81.920 pasos en el entorno, con una tasa de éxito oficial del 95,0 % en 20 ejecuciones y un retorno de 22,39, y una destilación posterior en el LLM. Se reportan dos variantes, SFT y RL, siendo la SFT la seleccionada para despliegue tras la evaluación de 20 ejecuciones. La concordancia con el profesor alcanza el 80,6 % (pico de concordancia RL del 77,1 %), y el retorno en simulación es de 25,01 (SFT) y 25,26 (RL), ambos por encima del retorno de evaluación del profesor PPO (22,80). No se detalla la composición exacta del dataset de destilación, el número de tokens de entrenamiento ni si hubo fases adicionales de RLHF o DPO sobre el LLM.

## Capacidades

- Decisión de navegación por waypoints en un entorno simulado 2D, con frecuencia de decisión de 0,5 s por paso (2 Hz).
- Lectura de observaciones numéricas serializadas como texto estructurado y emisión de acciones discretas de locomoción.
- Seguimiento de rutas curvas tipo S-Curve con paso secuencial por puertas o gates y llegada al destino final (`lantern`).
- Tolerancia a errores de trayectoria: el vector de observación incluye cross-track error y orientación de ruta, lo que permite correcciones laterales.
- Memoria de corto plazo mediante las cinco acciones previas incluidas en la observación.
- Soporte de coreano e inglés en la interfaz textual del modelo base.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso genérico, visión, audio ni modo de pensamiento extendido.

## Casos de uso

- Navegación autónoma en simulación robótica: el modelo actúa como política de control en el bucle de decisión del robot LINK-01, sustituyendo o complementando a la política PPO original con un artefacto desplegable vía PEFT y ejecutable en local.
- Investigación en destilación de políticas RL a LLMs: permite estudiar cuánto comportamiento de una política PPO puede capturarse en un modelo de lenguaje de 0,8 B y qué pérdida de rendimiento implica (95,0 % de éxito del profesor frente a 95,0 % reportado para la variante SFT en la misma métrica de 20 ejecuciones).
- Prototipado rápido de agentes encarnados en entornos de bajo coste: al ser un adaptador sobre un modelo pequeño, se puede iterar en una estación de trabajo sin clústeres de GPU.
- Evaluación de robustez de políticas basadas en lenguaje: útil para medir sensibilidad a la serialización de observaciones, al ruido numérico y a la formulación textual del estado.
- Docencia y formación en RL aplicado: el repositorio incluye un notebook de Colab para reproducir el entrenamiento, lo que facilita su uso en cursos y talleres.
- Benchmarking de LLMs como capas de decisión: sirve como referencia de hasta dónde llega un modelo de 0,8 B en tareas de control discreto frente a políticas especializadas.

## Benchmarks y rendimiento

Los datos disponibles provienen de la evaluación del propio autor en el simulador, no de benchmarks estándar de NLP.

| Métrica | Valor |
|---|---|
| Tasa de éxito en 20 ejecuciones (SFT, modelo desplegado) | 95,0 % (19/20) |
| Tasa de éxito en 20 ejecuciones (Qwen base sin ajuste) | 0 % |
| Tasa de colisión (20 ejecuciones) | 0,0 % |
| Concordancia con el profesor PPO | 80,6 % (pico RL: 77,1 %) |
| Retorno en simulación (SFT) | 25,01 |
| Retorno en simulación (RL) | 25,26 |
| Profesor PPO: éxito oficial en 20 ejecuciones | 95,0 % |
| Profesor PPO: retorno de evaluación | 22,80 |
| Profesor PPO: pasos de entrenamiento | 81.920 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo de 0,8 B en precisión de 16 bits se sitúa en torno a 2 GB de pesos, y en cuantizaciones de 8 o 4 bits por debajo de 1 GB, aunque el autor no publica cifras.
- GPU recomendadas: no especificadas. Por tamaño, cualquier GPU consumer con al menos 4-6 GB de VRAM debería poder cargar el modelo base más el adaptador.
- Compatibilidad con GPU consumer: previsiblemente sí (RTX 3060, RTX 4060, RTX 4090 y similares), aunque no hay confirmación del autor.
- Opciones de despliegue: al ser un adaptador PEFT sobre Qwen3.5-0.8B, es compatible con el ecosistema Hugging Face Transformers y PEFT; el autor no documenta integración con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: la política opera a 2 Hz (una decisión cada 0,5 s) en el simulador; no se publican latencias de inferencia por token ni throughput medido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-highj-follow-v1-link01 | 0,8 B (base) + LoRA | No disponible | Navegación por waypoints (follow_route) | Apache-2.0 | Hugging Face (adaptador PEFT) |
| connectailab-rl-highj-goto-v1-link01 | No disponible | No disponible | Navegación a objetivo con obstáculos (goto_target) | No disponible | Hugging Face |
| Política PPO profesora (brain.json) | No aplica (política RL) | No aplica | Navegación por waypoints | No disponible | Entorno CONNECT AI WORLD |

No se dispone de datos de benchmarks comparables con modelos de la misma categoría fuera del ecosistema del autor. La comparación más directa es con la política PPO profesora, que sirve como referencia de rendimiento (95,0 % de éxito, retorno 22,80) y con el Qwen base sin ajuste (0 % de éxito en la misma tarea).

## Limitaciones y advertencias

- El modelo está especializado en una única tarea (`follow_route`) y un único mapa (S-Curve Course, identificador `f6fe2b3f`); no generaliza a otras tareas de navegación sin reentrenamiento.
- Depende de un formato exacto de serialización de observaciones de 16 dimensiones; cambios en el orden, escala o codificación de las variables pueden degradar el comportamiento.
- Los resultados reportados (95,0 % de éxito, 0 % de colisiones) provienen de 20 ejecuciones en simulación y no han sido validados de forma independiente ni en hardware físico.
- Riesgo de alucinación o de salida fuera del espacio de acciones si la entrada textual se desvía del formato esperado; no se documenta mecanismo de validación de salida.
- Sesgos conocidos: no documentados por el autor; al entrenarse sobre trayectorias de un simulador concreto, puede heredar sesgos del mapa y de la política profesora.
- Cobertura lingüística limitada a coreano e inglés; el modelo no está pensado para conversación general.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B debe verificarse por separado; el autor no detalla condiciones adicionales.
- No hay información sobre el tamaño del adaptador, el dataset de destilación ni el contexto máximo soportado, lo que dificulta reproducir el entrenamiento.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, y el tamaño reportado es de 0,0 GB, lo que sugiere que los pesos pueden no estar completamente subidos o que la métrica no refleja el contenido real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/minjunglee27/connectailab-rl-highj-follow-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio GitHub CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab para entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS (aprendizaje por refuerzo): https://www.aicitybuilders.com/robot
- Entorno CONNECT AI WORLD Robot Lab: https://www.ezerai.xyz/robot-lab/world/
- Modelo relacionado `connectailab-rl-highj-goto-v1-link01`: https://huggingface.co/minjunglee27/connectailab-rl-highj-goto-v1-link01
- Modelo relacionado `connectailab-rl-highj-v1`: https://huggingface.co/minjunglee27/connectailab-rl-highj-v1
- Modelo relacionado `connectailab-rl-highj-v2`: https://huggingface.co/minjunglee27/connectailab-rl-highj-v2
- Modelo relacionado `connectailab-rl-highj-lunarlander-v1`: https://huggingface.co/minjunglee27/connectailab-rl-highj-lunarlander-v1
- Modelo relacionado `connectailab-rl-highj-lunarlander-v2`: https://huggingface.co/minjunglee27/connectailab-rl-highj-lunarlander-v2
- Modelo relacionado `connectailab-rl-highj-cartpole-lite-v1`: https://huggingface.co/minjunglee27/connectailab-rl-highj-cartpole-lite-v1
