# Guccimam/connectailab-rl-shibalove-v1-link01

## Resumen

LINK-01 es una política de decisión entrenada con PPO (Proximal Policy Optimization) para un robot simulado en MuJoCo. No es un modelo de lenguaje: es una red neuronal pequeña que actúa como "cerebro de decisión" de un robot bípedo de nombre LINK-01, cuyo control de marcha está delegado en una red de locomoción fija (CPG más un MLP de imitación) que no forma parte de este artefacto. El modelo lo publica el autor Guccimam bajo el paraguas de CONNECT AI LAB y AI CITY BUILDERS, y se distribuye como un fichero `brain.json` con los pesos de la política.

El problema que resuelve es concreto: dado un estado sensorial de 10 dimensiones (distancia al objetivo, dirección codificada como sin/cos, velocidad frontal, velocidad de giro y las cinco últimas acciones elegidas), selecciona una de cinco órdenes de navegación (avanzar, girar a izquierda, girar a derecha, rotar a izquierda en el sitio, rotar a derecha en el sitio). La decisión se reevalúa cada 0,5 segundos. Es, por tanto, un componente de razonamiento de alto nivel dentro de una arquitectura jerárquica de control robótico.

Su relevancia es acotada y de carácter educativo: demuestra un pipeline completo de entrenamiento por refuerzo en navegador (CONNECT AI WORLD) para robótica simulada, con un resultado declarado de 100 % de éxito en 20 episodios de un conjunto de evaluación con semillas fijas (91001–91020) y recompensa media de 15,86. No debe confundirse con un modelo fundacional ni con un LLM; su tamaño es de unos pocos miles de parámetros y su alcance se limita al simulador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP de 3 capas (10 → 64 → 64 → 5) con activación tanh, entrenado con PPO |
| Parámetros totales | no disponible (estimable en el orden de 5.000–6.000 pesos según la topología declarada) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de secuencia; usa 10 observaciones por paso) |
| Tipos de cuantización | no disponible (pesos en JSON, sin cuantización publicada) |
| Idiomas soportados | ko (coreano, según metadatos; la política no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | JSON (`brain.json`), cargable con `connect_tycoon.link01.brain.WorldBrain` |

## Arquitectura y entrenamiento

La política es un perceptrón multicapa de tres capas con activación tanh que mapea un vector de observación de 10 dimensiones a 5 logits de acción. El entrenamiento se realizó con PPO sobre el simulador MuJoCo compilado a WebAssembly (mujoco-wasm 3.16.0), dentro del entorno web CONNECT AI WORLD. El contrato del modelo está declarado como `link01-decision/goto_target/obs10-act5/walker51-14/v1`, lo que fija la interfaz de observación, el número de acciones y la versión del caminante subyacente.

La locomoción no se aprende en este artefacto: el walker (CPG más MLP de imitación, 51 dimensiones de estado según el identificador) está congelado y solo el módulo de decisión se optimiza con PPO. Las observaciones incluyen las cinco acciones previas, lo que introduce una memoria corta de decisiones que ayuda a evitar oscilaciones. El conjunto de entrenamiento declarado es el curso aleatorio (`random`), y la evaluación se realizó sobre 20 episodios con semillas 91001–91020 y huella `0aba67f3`. No se documentan hiperparámetros de PPO (learning rate, clipping, número de pasos, tamaño de batch) ni el número total de pasos de entrenamiento.

## Capacidades

- Selección discreta de acciones de navegación entre cinco comandos (avanzar, izquierda, derecha, rotación izquierda en el sitio, rotación derecha en el sitio).
- Navegación hacia objetivo en un entorno 2D simulado con recompensa definida por proximidad y orientación.
- Memoria corta de las cinco últimas decisiones para suavizar la política.
- Integración con el caminante fijo LINK-01 (CPG + MLP de imitación) para ejecutar la locomoción.
- Carga y ejecución en Python mediante `WorldBrain.from_file` y el método `act(obs)`.
- Reproducibilidad de la evaluación mediante semillas fijas y fichero de pesos portable en JSON.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni procesamiento de lenguaje natural.

## Casos de uso

- Docencia de refuerzo profundo: usar el par observación-acción como ejemplo mínimo de un agente PPO entrenado en MuJoCo, con un `brain.json` inspeccionable y un notebook de Colab asociado para reproducir el entrenamiento.
- Investigación en control jerárquico: emplear la política como capa superior de decisión sobre un caminante congelado, sustituyendo el walker por otro y reentrenando solo el módulo de decisión.
- Pruebas de reproducibilidad en robótica simulada: ejecutar las 20 semillas 91001–91020 y verificar la recompensa media de 15,86 y la huella `0aba67f3` como test de regresión del pipeline.
- Benchmark de entornos web: comparar el rendimiento de mujoco-wasm 3.16.0 frente a MuJoCo nativo ejecutando la misma política y midiendo latencia por paso de decisión.
- Generación de datos sintéticos de navegación: recolectar trayectorias etiquetadas (observación, acción, recompensa) para entrenar modelos de imitación o de mundo en robótica simulada.
- Prototipado de currículos de entrenamiento: usar el curso aleatorio como línea base y evaluar la degradación al transferir la política a cursos con obstáculos o a distribuciones de objetivos distintas.
- Material de formación para cursos de RL aplicado: el modelo sirve como ejemplo cerrado y ejecutable en el aula, con licencia Apache 2.0 que permite redistribución.

## Benchmarks y rendimiento

| Prueba | Métrica | Valor | Semillas | Huella | Motor |
|---|---|---|---|---|---|
| Éxito en curso aleatorio (20 episodios) | Tasa de éxito | 100 % | 91001–91020 | `0aba67f3` | mujoco-wasm 3.16.0 |
| Éxito en curso aleatorio (20 episodios) | Recompensa media | 15,86 | 91001–91020 | `0aba67f3` | mujoco-wasm 3.16.0 |

No se han publicado resultados de benchmarks adicionales (curvas de aprendizaje, comparación con otras políticas, evaluación en cursos con obstáculos) en la información disponible. La tabla de curva de aprendizaje del model card aparece vacía.

## Requisitos de hardware

- VRAM estimada: despreciable; la política ocupa unos pocos kilobytes en JSON y se ejecuta en CPU sin GPU.
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente para la inferencia.
- Cabe en cualquier GPU de consumo y también en entornos sin GPU (Raspberry Pi, portátiles básicos), siempre que se ejecute el simulador MuJoCo o mujoco-wasm.
- Opciones de despliegue: Python con `connect-tycoon` (`pip install "connect-tycoon @ git+https://github.com/wonseokjung/connect-tycoon"`) y `WorldBrain`; también en el navegador mediante CONNECT AI WORLD y mujoco-wasm.
- Latencia y throughput: no disponibles de forma explícita; la frecuencia de decisión declarada es de una acción cada 0,5 segundos, lo que fija un límite superior de 2 decisiones por segundo por agente.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto/observación | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LINK-01 (este modelo) | MLP PPO para decisión de navegación | no disponible (MLP 10-64-64-5) | 10 observaciones, 5 acciones | 100 % éxito, recompensa 15,86 en 20 semillas | Apache 2.0 | Hugging Face |
| Políticas PPO de referencia en MuJoCo (p. ej. Humanoid-v5, LunarLander-v3) | Políticas PPO/DQN de control continuo | no disponible | variables según entorno | no disponible en esta ficha | variable | repositorios públicos de RL |
| Caminante LINK-01 (CPG + MLP de imitación) | Red de locomoción fija | no disponible (walker51-14) | 51 dimensiones de estado | no disponible | no disponible | incluido en el ecosistema CONNECT AI WORLD |

La comparación directa con otras políticas publicadas no es posible con los datos disponibles: no hay métricas comunes ni entornos idénticos. El modelo solo es comparable dentro del ecosistema LINK-01.

## Limitaciones y advertencias

- Modelo educativo de simulación: el propio autor advierte que debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- Evaluación limitada a 20 episodios de un único curso aleatorio; no hay datos de generalización a obstáculos, cambios de dinámica o distribuciones de objetivos distintas.
- Dependencia de un caminante congelado (CPG + MLP de imitación): si se cambia el walker, la política deja de ser válida.
- No procesa lenguaje, imágenes ni audio; los metadatos de idioma (`ko`) no implican capacidades lingüísticas.
- Riesgo de sobreajuste al curso `random` declarado; el propio model card señala que una política entrenada en un solo curso puede rendir mal en cursos aleatorios.
- Sin datos de sesgos, alucinación o robustez frente a perturbaciones; no aplica el concepto de alucinación al no ser un modelo generativo de texto.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías y de validación en hardware real traslada todo el riesgo al integrador.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso externo ni de mantenimiento continuado.

## Enlaces

- Hugging Face: https://huggingface.co/Guccimam/connectailab-rl-shibalove-v1-link01
- Repositorio GitHub CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab (entrenamiento del modelo de decisión): https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- CONNECT AI WORLD (robot web learning): https://www.ezerai.xyz/robot-lab/world/
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- Banner del proyecto: https://raw.githubusercontent.com/wonseokjung/connect-tycoon/main/docs/brand/banner.gif
