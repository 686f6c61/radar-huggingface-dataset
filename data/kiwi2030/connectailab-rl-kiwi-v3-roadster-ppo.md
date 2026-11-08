# kiwi2030/connectailab-rl-kiwi-v3-roadster-ppo

## Resumen

`connectailab-rl-kiwi-v3-roadster-ppo` es un agente de aprendizaje por refuerzo (RL) entrenado con Proximal Policy Optimization (PPO) para control continuo en un simulador propio de un "roadster" invertido. No es un modelo de lenguaje: es una política neuronal pequeña que recibe un vector de observación de 7 dimensiones y emite 2 acciones continuas (intensidad de propulsión y rotación). Lo publica el usuario `kiwi2030` bajo el paraguas del proyecto educativo CONNECT AI LAB, en el marco de una serie de experimentos de RL (LunarLander con DQN, LINK-01, Connect Tycoon).

El interés del modelo es fundamentalmente didáctico y de reproducibilidad: la model card documenta de forma explícita hiperparámetros (1.500.000 pasos de entrenamiento, learning rate 0,0004, sin bonus de exploración, semilla 0), el procedimiento de evaluación (200 episodios con semillas 1000000–1000199, evaluando con la media de la política) y una comparación entre versiones v1, v2 y v3. Reporta una tasa de aterrizaje del 88,5 % en esa evaluación.

El repositorio tiene 0 descargas, 0 likes y un tamaño de 0,0 GB, con pesos en `model.pt` (state_dict de PyTorch) y código de entorno en `roadster_simulator.py` / `model.py`. La licencia no está declarada y no hay información sobre idiomas (no aplica a un agente de control). Es, por tanto, un artefacto de experimentación reproducible más que un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para RL (definida en `model.py`; tipo exacto de capas no disponible), salida continua |
| Parametros totales | No disponible (política con entrada de 7 dimensiones y salida de 2 acciones; recuento no publicado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; observación de 7 dimensiones por paso) |
| Tipos de cuantizacion | No disponible (pesos en `model.pt`; no se documentan cuantizaciones) |
| Idiomas soportados | No aplica / no disponible (agente de control, sin procesamiento de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | PyTorch `state_dict` en `model.pt` |
| Algoritmo de entrenamiento | PPO (continuous-control) |
| Espacio de acciones | 2 acciones continuas (propulsión y rotación) |
| Pasos de entrenamiento | 1.500.000 (1.501.184 pasos reales recolectados) |
| Learning rate | 0,0004 |
| Bonus de exploración | 0,0 |
| Semilla de entrenamiento | 0 |
| Librería / tags | pytorch, ppo, continuous-control, reinforcement-learning |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, unidades ocultas, activaciones). Lo que sí se documenta es que `model.py` contiene la definición de la "política-cerebro" y que `model.pt` es el `state_dict` de una política con entrada de 7 dimensiones y salida de 2 dimensiones en modo continuo (`(7, 2, continuo=True)`). El entorno se define en `roadster_simulator.py` y simula un roadster invertido cuyo control consiste en regular la potencia de los propulsores y la rotación.

El entrenamiento se realizó con PPO durante 1.500.000 pasos (1.501.184 pasos efectivos de recolección), con learning rate 0,0004, sin bonus de exploración y semilla 0. La evaluación se hizo sobre 200 episodios independientes con semillas 1000000–1000199, usando la acción media de la política (evaluación determinista). El autor advierte explícitamente que las cifras provienen de una única ejecución con semilla 0, por lo que no hay estimación de varianza entre semillas ni intervalos de confianza.

La comparación entre versiones es reveladora de la sensibilidad del experimento: v1 (1.000.000 pasos, lr 0,0005, sin bonus) alcanzó 97,5 % de aterrizaje; v2 (1.200.000 pasos, lr 0,0006, bonus 0,2) cayó a 0,0 %; v3 (1.500.000 pasos, lr 0,0004, sin bonus) logró 88,5 %. No se documentan innovaciones técnicas adicionales (sin decodificación especulativa, attention lineal ni mecanismos híbridos, al no tratarse de un transformer).

## Capacidades

- Control continuo de un vehículo simulado: emite dos acciones continuas (propulsión y rotación) a partir de una observación de 7 dimensiones.
- Aterrizaje/estabilización del roadster invertido: la política aprendida logra una tasa de éxito del 88,5 % en la evaluación reportada de 200 episodios.
- Política determinista evaluable: el autor documenta la evaluación con la acción media, lo que permite reproducir el resultado de forma estable.
- Entrenamiento reproducible: hiperparámetros, semilla y protocolo de evaluación publicados, junto con el código del entorno y de la red.
- No soporta tool calling, function calling, agentes multi-paso basados en lenguaje, capacidades multilingües, visión, audio ni modo "thinking": es un agente de control numérico, no un modelo generativo.
- Integración con PyTorch: los pesos se cargan como `state_dict` estándar.

## Casos de uso

- Reproducción de experimentos de RL en docencia: cargar `model.pt` y `roadster_simulator.py`, ejecutar los 200 episodios con las semillas documentadas y verificar la tasa de aterrizaje del 88,5 %. Adecuado por la trazabilidad completa de hiperparámetros y semilla.
- Estudio comparado de hiperparámetros en PPO: el repositorio ofrece tres versiones (v1, v2, v3) con cambios en learning rate, bonus de exploración y pasos, lo que permite analizar el colapso de v2 (0,0 %) frente a v1 (97,5 %) y v3 (88,5 %).
- Línea base para nuevos entornos de control continuo: sirve como referencia de política PPO con 2 acciones continuas para comparar contra DQN (usado por el mismo autor en LunarLander) u otros algoritmos.
- Pruebas de robustez y sensibilidad a semillas: al no haber evaluación multi-semilla, es un punto de partida para medir la varianza real del rendimiento del 88,5 %.
- Prototipado de pipelines de evaluación en RL: el protocolo de 200 episodios con rango de semillas fijo es directamente reutilizable como plantilla de test determinista.
- Material de divulgación y cursos de RL: encaja en el contexto declarado de "강화학습 AI 6강" (lección 6 de RL) de CONNECT AI LAB, con vídeo de replay incluido.

## Benchmarks y rendimiento

Los únicos datos publicados son la tasa de aterrizaje en la evaluación propia del autor (200 episodios, semillas 1000000–1000199, acción media):

| Version | Pasos de entrenamiento | Learning rate | Bonus de exploración | Tasa de aterrizaje (200 episodios) |
|---|---:|---:|---:|---:|
| v1 | 1.000.000 | 0,0005 | 0,0 | 97,5 % |
| v2 | 1.200.000 | 0,0006 | 0,2 | 0,0 % |
| v3 | 1.500.000 | 0,0004 | 0,0 | 88,5 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes de RL como puntuaciones medias de recompensa en Gymnasium) en la información disponible. Las cifras anteriores corresponden a una única semilla de entrenamiento (semilla 0) y no incluyen desviación típica ni intervalos de confianza.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima. La política tiene entrada de 7 dimensiones y salida de 2; los pesos caben holgadamente en cualquier GPU consumer (muy por debajo de 1 GB). No se publica el recuento exacto de parámetros.
- GPU recomendadas: no se requiere GPU. Cualquier GPU con soporte PyTorch (por ejemplo, RTX 3060 o superior) es más que suficiente; la inferencia en CPU es viable para evaluación episódica.
- Cabe en GPU consumer: sí, en cualquier modelo actual e incluso en hardware integrado.
- Opciones de despliegue: PyTorch nativo cargando el `state_dict` de `model.pt`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un agente de control).
- Latencia y throughput: no disponibles. Al ser un forward pass de una red diminuta por paso de simulación, la latencia vendrá dominada por el simulador (`roadster_simulator.py`), no por el modelo.
- Dependencias: instalación vía `requirements.txt` del repositorio.

## Comparativa con modelos similares

| Modelo | Tipo / algoritmo | Entorno | Pasos de entrenamiento | Métrica reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| connectailab-rl-kiwi-v3-roadster-ppo | PPO continuo | Roadster invertido (simulador propio) | 1.500.000 | 88,5 % aterrizaje (200 episodios) | No disponible | Hugging Face, 0 descargas |
| connectailab-rl-kiwi-v3-lunarlander | DQN | Gymnasium LunarLander | No disponible | No disponible en la información | No disponible | Hugging Face |
| connectailab-rl-kiwi-v2 | PPO / GRPO con LoRA sobre Qwen (decisión de empresa) | Connect Tycoon | No disponible | No disponible en la información | Apache-2.0 | Hugging Face |
| connectailab-rl-kiwi-v1-link01 | PPO (política maestra) | Navegación de robot / decisión de ruta | No disponible | No disponible en la información | No disponible | Hugging Face |

Los tres comparables pertenecen al mismo autor y serie experimental, por lo que la comparación es interna al proyecto. No se dispone de datos para comparar con políticas PPO de referencia externas (por ejemplo, implementaciones de Stable-Baselines3 en entornos de control continuo) en la información proporcionada.

## Limitaciones y advertencias

- Resultado de una única semilla: el 88,5 % proviene de un solo entrenamiento con semilla 0; no hay evaluación multi-semilla ni desviación típica, por lo que la robustez real es desconocida.
- Alta sensibilidad a hiperparámetros: la versión v2 con bonus de exploración 0,2 colapsó a 0,0 % de aterrizaje, lo que evidencia fragilidad del ajuste.
- Licencia no declarada: no se especifican términos de uso comercial, redistribución ni atribución; usar en producción requiere aclaración previa con el autor.
- Específico de un simulador propio: la política está acoplada a la dinámica de `roadster_simulator.py`; no es transferible a otros entornos sin reentrenamiento.
- Sin información sobre sesgos: al no procesar lenguaje ni datos humanos, no aplican sesgos sociales típicos, pero tampoco hay análisis de fallos por régimen (por ejemplo, condiciones iniciales extremas).
- Sin datos de arquitectura ni de parámetros: dificulta la auditoría técnica y la comparación cuantitativa con otras políticas.
- Repositorio sin tracción: 0 descargas y 0 likes, sin issues ni validación comunitaria; el soporte depende del autor.
- Riesgo de sobreajuste al protocolo de evaluación: la evaluación con acción media sobre un rango fijo de semillas no cubre políticas estocásticas ni distribuciones de estado fuera de ese rango.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v3-roadster-ppo
- LunarLander v3 (DQN): https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v3-lunarlander
- Connect Tycoon kiwi v2: https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v2
- Connect Tycoon teacher v2: https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v2-teacher
- LINK-01 kiwi v1: https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v1-link01
- dama-aibrain: https://huggingface.co/kiwi2030/dama-aibrain
- MEETORY (guía de viajes): https://meetory.kr
- Canal de YouTube del autor: https://www.youtube.com/@kiwi_overai
- Replay de la política: `replay.mp4` dentro del repositorio de Hugging Face
