# lin267/ppo-LunarLander-cleanrl

## Resumen

`lin267/ppo-LunarLander-cleanrl` no es un modelo de lenguaje: es un agente de aprendizaje por refuerzo entrenado con PPO (Proximal Policy Optimization) para resolver el entorno `LunarLander-v3` de Gymnasium. Lo desarrolla el usuario lin267 como práctica de un curso de RL, reimplementando desde cero el algoritmo PPO al estilo de CleanRL: red Actor-Critic, muestreo en paralelo, estimación de ventajas con GAE y pérdida PPO-Clip. El objetivo es controlar un módulo lunar para que aterrice de forma segura entre dos banderas.

El interés del repositorio es fundamentalmente didáctico y de reproducibilidad: documenta con detalle por qué la configuración por defecto del curso (50 000 pasos) fracasa y qué cambios de hiperparámetros permiten converger a una política que supera el umbral oficial de 200 puntos (258,66 de media en 100 episodios). No hay pesos de un transformer ni tokenizador; el "modelo" son dos MLP de 8-64-64 (unos 10 000 parámetros en total) guardados como `model_best.pth`.

Por su naturaleza, no aplica ninguna de las dimensiones habituales de una ficha de LLM (contexto, cuantización, idiomas, tool calling). La ficha se adapta a un artefacto de RL: política discreta de 4 acciones sobre observaciones continuas de 8 dimensiones, entrenada en CPU en unos 8 minutos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor-Critic MLP (8-64-64 con activación Tanh, dos cabezas: política Categorical de 4 acciones y valor escalar) |
| Parametros totales | Aproximadamente 10 000 (Actor + Critic) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; observación de 8 dimensiones por paso) |
| Tipos de cuantizacion | No disponible (pesos PyTorch en FP32 por defecto) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`model_best.pth`), librería `pytorch` |
| Entorno | Gymnasium `LunarLander-v3` (Box2D 2.3.10) |
| Espacio de observación | 8 dimensiones continuas |
| Espacio de acción | 4 acciones discretas |
| Algoritmo | PPO con PPO-Clip (epsilon 0.2), GAE (lambda 0.98), ventaja normalizada |
| Hiperparámetros clave | gamma 0.999, 16 entornos × 256 pasos, 8 minibatches, 10 épocas de actualización, 2,5 M pasos totales |
| Hardware de entrenamiento | CPU (sin GPU), Windows, Python 3.10.22, PyTorch 2.14.1 CPU |
| Tamaño del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La política es una red neuronal pequeña: la observación de 8 dimensiones pasa por dos capas ocultas de 64 unidades con activación Tanh y se bifurca en una cabeza Actor que emite logits sobre 4 acciones (motor principal, motores laterales izquierdo y derecho, y nada) y una cabeza Critic que estima el valor del estado. La acción se muestrea de una distribución Categórica durante el entrenamiento y se toma por `argmax` en evaluación. El entrenamiento sigue el esquema PPO de CleanRL: 16 entornos en paralelo, 256 pasos por entorno y ciclo (4096 transiciones por actualización), GAE con lambda 0.98 para estimar ventajas, pérdida PPO-Clip con coeficiente 0.2, pérdida de valor también recortada, bonus de entropía de 0.01, normalización de ventajas por minibatch y recorte de gradiente por norma 0.5.

El detalle técnico más relevante del repositorio es el análisis de por qué la configuración base falla. Con 50 000 pasos y 4 entornos × 128 pasos solo se realizan 97 actualizaciones, insuficientes para PPO on-policy; además, `gamma=0.99` hace que la recompensa de aterrizaje (que llega cientos de pasos después) se descuente a prácticamente cero (0.99^500 ≈ 0.007). La configuración corregida eleva `gamma` a 0.999 (0.999^500 ≈ 0.61), `gae-lambda` a 0.98, el lote a 16 × 256, los minibatches a 8 y las épocas a 10, alcanzando 610 actualizaciones en 2,5 M pasos. No hay RLHF ni datos supervisados: el aprendizaje es puramente por interacción con el simulador físico.

## Capacidades

- Control de un módulo lunar en el entorno `LunarLander-v3`: descenso, ajuste de actitud y aterrizaje entre dos banderas.
- Política discreta de 4 acciones sobre observaciones continuas de 8 dimensiones (posición, velocidad, ángulo, velocidad angular, contacto con patas).
- Evaluación determinista mediante `argmax` de la distribución de política.
- Registro de métricas de entrenamiento (retorno, pérdidas, entropía, KL aproximada, ratio de recorte, pasos por segundo) en CSV.
- Evaluación periódica con guardado del mejor checkpoint según puntuación.
- Grabación de vídeos de episodios (demostración final y evolución durante el entrenamiento).
- No soporta tool calling, ni agentes multi-paso en el sentido de LLM, ni capacidades multilingües, ni visión, ni audio, ni modo de razonamiento explícito.

## Casos de uso

- Docencia de aprendizaje por refuerzo: reproducción paso a paso de un PPO desde cero, útil para explicar en clase cómo se traducen las fórmulas de GAE y PPO-Clip a código concreto.
- Estudio empírico de sensibilidad a hiperparámetros: el repositorio documenta el efecto de `gamma`, tamaño de lote y épocas de actualización sobre la convergencia, sirviendo como caso de análisis de ablation.
- Referencia de depuración de PPO: el contraste entre retorno de entrenamiento (con exploración) y retorno de evaluación (`argmax`) ilustra un error frecuente al interpretar curvas de aprendizaje.
- Baseline para entornos Gymnasium Box2D: puede usarse como punto de partida para comparar otros algoritmos (SAC, A2C, DQN) sobre `LunarLander-v3`.
- Prototipado de pipelines de RL en CPU: demuestra que tareas de control continuo de baja dimensión no requieren GPU, útil en entornos con recursos limitados o para pruebas rápidas en CI.
- Generación de material audiovisual didáctico: los vídeos de progresión (de -83,6 puntos a más de 250) sirven para ilustrar visualmente el aprendizaje de una política.
- Validación de infraestructura de RL: el script `check_env.py` comprueba dependencias (Gymnasium, Box2D, PyTorch) y ejecuta 100 pasos aleatorios, útil como smoke test en un entorno nuevo.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre `LunarLander-v3` (evaluación `argmax`, 100 episodios con `model_best.pth`):

| Metrica | Valor |
|---|---|
| Retorno medio | 258,66 |
| Desviación estándar | 22,25 |
| Mediana | 260,42 |
| Mínimo / máximo | 116,49 / 298,98 |
| Percentiles 25 / 75 | 249,07 / 269,71 |
| Episodios con retorno ≥ 200 | 98 / 100 |
| Tasa de aterrizaje | 98 % |
| Retorno medio de política aleatoria (referencia) | -204,08 (desv. 118,89) |

Progresión de la evaluación durante el entrenamiento (cada 15 actualizaciones, 16 episodios, `argmax`):

| Pasos de entrenamiento | Retorno medio | Tasa de aterrizaje |
|---|---|---|
| 61 000 | -1983,3 | 0 % |
| 184 000 | 17,3 | 0 % |
| 430 000 | 194,7 | 44 % |
| 983 000 | 204,1 | 88 % |
| 1 350 000 | 202,1 | 69 % |
| 2 210 000 | 268,3 | 100 % |
| 2 500 000 | 257,5 | 100 % |

Coste de entrenamiento: 8,3 minutos (497 s) en CPU, 610 actualizaciones, aproximadamente 5 000 pasos de entorno por segundo. Configuración base fallida (50 000 pasos): retorno de entrenamiento -143,8 y evaluación -690,3 (desv. 265,9) con 0 % de aterrizajes.

## Requisitos de hardware

- VRAM: no aplica; el entrenamiento y la inferencia se ejecutan en CPU. La red tiene unos 10 000 parámetros y el cuello de botella es el paso del motor físico Box2D, no el cálculo matricial.
- GPU recomendadas: ninguna necesaria. El autor desaconseja GPU por el coste de transferencia frente a un cómputo trivial.
- Cabe en cualquier CPU moderna; el autor emplea 16 entornos en paralelo para saturar la CPU.
- Despliegue: script propio `ppo.py` con PyTorch; no requiere vLLM, llama.cpp, Ollama ni TGI (no es un LLM).
- Latencia y throughput: aproximadamente 5 000 pasos de entorno por segundo en entrenamiento con 16 entornos en CPU; la inferencia por paso es despreciable.
- Dependencias: Gymnasium 1.3.0, Box2D 2.3.10, PyTorch 2.14.1 (CPU), NumPy 2.2.6, Pillow, imageio, imageio-ffmpeg, huggingface_hub.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Entorno | Retorno reportado | Licencia |
|---|---|---|---|---|---|
| lin267/ppo-LunarLander-cleanrl | PPO Actor-Critic MLP | ~10 000 | LunarLander-v3 | 258,66 (100 episodios) | MIT |
| Stable-Baselines3 PPO (referencia del propio autor, semana 1) | PPO (implementación de librería) | No disponible | LunarLander-v2 | No disponible en la información | MIT |
| CleanRL PPO (implementación de referencia) | PPO de un solo fichero | No disponible | LunarLander-v2 | No disponible en la información | MIT |

No se dispone de resultados numéricos de las alternativas en la información proporcionada; la comparación se limita a la categoría (PPO sobre LunarLander) y a la licencia.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona en lenguaje natural y no admite prompts.
- La política está especializada exclusivamente en `LunarLander-v3`; no generaliza a otros entornos ni a variantes con distinta física.
- Estabilidad imperfecta: 2 de 100 episodios quedaron por debajo de 200 puntos (mínimo 116,49), lo que indica fallos ocasionales de control de actitud.
- La evaluación con `argmax` en fases tempranas es engañosa (retorno -1983 a 61 000 pasos) por degeneración de la política casi uniforme; no debe interpretarse como fallo definitivo del entrenamiento.
- El retorno de entrenamiento (con exploración) y el de evaluación (`argmax`) no son comparables; mezclarlos lleva a conclusiones erróneas.
- Dependencia de Box2D y de la versión de Gymnasium: `LunarLander-v2` está marcada como obsoleta en Gymnasium 1.3, lo que puede romper reproducciones antiguas.
- Licencia MIT: permite uso comercial y modificación con atribución, sin restricciones adicionales conocidas.
- No se han documentado sesgos, riesgos de alucinación ni comportamientos adversarios más allá de los propios de un agente de control en simulador.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/lin267/ppo-LunarLander-cleanrl
- Documentación de Gymnasium `LunarLander`: https://gymnasium.farama.org/environments/box2d/lunar_lander/
- CleanRL (implementación de referencia de PPO): https://github.com/vwxyzjn/cleanrl
- Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
- Paper de PPO (Schulman et al., 2017): https://arxiv.org/abs/1707.06347
- Paper de GAE (Schulman et al., 2015): https://arxiv.org/abs/1506.02438
- PyTorch: https://pytorch.org/
- Box2D: https://box2d.org/
