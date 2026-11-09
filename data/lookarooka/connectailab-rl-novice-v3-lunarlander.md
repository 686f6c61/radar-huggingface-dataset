# lookarooka/connectailab-rl-novice-v3-lunarlander

## Resumen

`lookarooka/connectailab-rl-novice-v3-lunarlander` es un agente de aprendizaje por refuerzo profundo entrenado para resolver el entorno `LunarLander-v3` de Gymnasium. No es un modelo de lenguaje: se trata de una política neuronal (un MLP con arquitectura dueling) que mapea un vector de estado de 8 dimensiones a 4 acciones discretas (no hacer nada, encender motor lateral izquierdo, encender motor principal, encender motor lateral derecho). Lo publica el usuario `lookarooka` en el contexto del curso «CONNECT AI LAB × AI CITY BUILDERS», quinta lección de refuerzo.

El modelo es la tercera iteración (v3) de una serie de tres versiones documentadas por el autor. La evolución va de un DQN vainilla (v1, ~205 puntos) a un Dueling Double DQN (v2, ~258 puntos) y finalmente a un Dueling Double DQN con retorno multi-paso de 3 pasos, soft target updates, cosine annealing del learning rate y una función de recompensa moldeada para ahorro de combustible y aterrizaje suave (v3, 282,4 puntos de media en 10 episodios de evaluación). El umbral de éxito del entorno es 200 puntos, por lo que la política supera ampliamente el criterio de resolución.

Su relevancia es fundamentalmente didáctica y de referencia: ilustra de forma cuantificada cómo un conjunto de mejoras estándar en DQN (Double Q-learning, dueling, n-step returns, soft updates, reward shaping y decaimiento del LR) se traducen en una ganancia de más de 75 puntos sobre la línea base. No está pensado para uso general ni como política transferible a otros entornos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP con arquitectura dueling (tronco compartido 8→128→128, cabeza de valor V(s) 128→64→1, cabeza de ventaja A(s,a) 128→64→4) |
| Parametros totales | no disponible (estimacion: ~20.000-21.000, dado el ancho 128 y 8 entradas / 4 salidas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de refuerzo con estado de 8 dimensiones; no hay contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante PyTorch; no se documenta cuantizacion) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (state_dict de PyTorch, serializado con `torch.save`) |

## Arquitectura y entrenamiento

La red es un perceptrón multicapa con separación dueling. El tronco `feature` transforma el estado de 8 dimensiones (posición x/y, velocidad vx/vy, ángulo, velocidad angular, contacto de las dos patas) en una representación de 128 dimensiones mediante dos capas lineales con activación ReLU. A partir de ahí, dos cabezas independientes de dos capas (128→64→salida): una produce un escalar V(s) y la otra un vector de 4 ventajas A(s,a). La salida combina ambas mediante la agregación estándar `Q(s,a) = V(s) + (A(s,a) - mean_a A(s,a))`, que elimina la ambigüedad de identificabilidad entre V y A.

El entrenamiento parte del algoritmo DQN vainilla de la versión 1 y añade tres bloques de mejora. Primero, Double DQN: la selección de la acción se hace con la red online y la evaluación del valor con la red target, lo que elimina el sesgo de sobreestimación de `max_a Q(s',a)`. Segundo, actualización suave de la red target con `tau = 0.005` en lugar de un hard update cada 500 pasos, lo que estabiliza la política. Tercero, retorno multi-paso con n=3 (`G_t^(3)`), que propaga la señal de recompensa tres pasos hacia atrás y acelera el aprendizaje de dependencias causales a medio plazo. El optimizador es AdamW con learning rate inicial 3e-4 y decaimiento por cosine annealing hasta 1e-5.

Además del algoritmo, el autor modifica la función de recompensa del entorno: penaliza la velocidad vertical excesivamente negativa (`vy < -0.35`) por debajo de una altitud `y < 0.3`, y otorga un bonus de `+8.0` cuando ambas patas contactan el suelo simultáneamente. Esta recompensa moldeada (fuel-efficiency shaping) es específica del entorno y no forma parte del modelo en sí; se necesita reproducirla para reentrenar la política. No se documentan el número de episodios de entrenamiento, el tamaño del replay buffer ni la semilla de entrenamiento.

## Capacidades

- Control de política discreta en `LunarLander-v3`: selecciona una de 4 acciones a partir de un estado de 8 dimensiones.
- Aterrizaje suave y centrado: la política aprendida prioriza el contacto simultáneo de ambas patas y minimiza el uso del motor principal.
- Eficiencia de combustible: el autor reporta un patrón de encendido intermitente («툭툭», pulsos cortos) cerca del suelo, consistente con la recompensa moldeada.
- Estabilización de actitud: la inclusión de penalizaciones de ángulo y velocidad angular en v2 produce una política que mantiene la orientación vertical.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico: es una política de control, no un modelo generativo.
- No tiene capacidades multilingües, de visión ni de audio.
- No dispone de modo «thinking» ni de cadena de razonamiento explícita.

## Casos de uso

- Material docente de refuerzo profundo: sirve como referencia reproducible de la progresión DQN → Double DQN → Dueling + n-step, con métricas comparadas por versión. Es adecuado porque el autor documenta explícitamente qué cambio produce qué ganancia (205 → 258 → 282 puntos).
- Comparación de técnicas de estabilización: permite aislar el efecto del soft target update (`tau = 0.005`) frente al hard update cada 500 pasos en un entorno de control continuo-discreto de bajo coste computacional.
- Estudio de reward shaping: el bonus de `+8.0` por contacto simultáneo de patas y la penalización de `vy < -0.35` bajo `y < 0.3` son un ejemplo concreto de cómo el moldeado de recompensa sesga la política hacia el ahorro de combustible; útil para discutir los riesgos de sobreajuste a la recompensa.
- Baseline para algoritmos de RL en Gymnasium: al ser un `state_dict` de PyTorch de ~20k parámetros, se puede cargar en CPU en milisegundos y usar como referencia contra PPO, SAC o A2C en `LunarLander-v3`.
- Pruebas de infraestructura de evaluación: el script de inferencia incluido en la model card (carga de pesos, bucle de episodio, suma de recompensas) sirve como test de humo para pipelines de RL antes de escalar a entornos más costosos.
- Demostración de despliegue de políticas en Hugging Face Hub: ejemplifica el flujo `hf_hub_download` + `torch.load` + `gym.make` para publicar y consumir agentes de RL, un patrón poco habitual en el Hub frente a los modelos de lenguaje.
- Análisis de sensibilidad a la semilla: el script usa `env.reset(seed=2026)`; permite estudiar la varianza del rendimiento entre episodios y la robustez de la política ante condiciones iniciales distintas.

## Benchmarks y rendimiento

El autor reporta una única métrica agregada: recompensa media de 282,4 en 10 episodios de evaluación. No se publican resultados por episodio, desviación típica, ni evaluación con semillas distintas. La siguiente tabla recoge la comparación entre versiones documentada en la model card; no incluye comparación con políticas externas.

| Version | Algoritmo | Recompensa media (10 episodios) | Delta vs. v1 |
|---|---|---|---|
| v1 | DQN vainilla (MLP 128-128, hard update 500, LR 5e-4 fijo) | ~205,3 | — |
| v2 | Dueling Double DQN (soft update tau=0,005, AdamW 3e-4) | ~258,7 | +53,4 |
| v3 | Dueling Double DQN + 3-step TD + cosine annealing + reward shaping | 282,4 | +77,1 |

No se han publicado resultados de benchmarks estandarizados (por ejemplo, curvas de aprendizaje, evaluaciones con múltiples semillas o comparación con PPO/SAC de referencia) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos (~20k parámetros en float32, unos 80 KB) más el overhead del runtime de PyTorch; en la práctica, cualquier GPU con más de 1 GB es suficiente.
- GPU recomendadas: no se requiere GPU. Cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090) ejecuta la política sin problemas; también funciona en CPU pura.
- Cabe en cualquier GPU consumer y en CPU: el cuello de botella es el bucle de simulación de Gymnasium, no la red.
- Opciones de despliegue: PyTorch nativo (`torch.load` + `model.eval()`), exportación a TorchScript u ONNX para inferencia sin dependencia de PyTorch, o integración directa en un bucle de `gymnasium`. No aplican vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño de la red, el forward pass es del orden de microsegundos en GPU y decenas de microsegundos en CPU; el rendimiento efectivo del agente está limitado por el step de `LunarLander-v3`.

## Comparativa con modelos similares

No se dispone de información sobre políticas comparables publicadas en el Hub con las que contrastar parámetros, contexto o licencia. La comparación más directa disponible es interna, entre las tres versiones del propio autor (ver tabla de benchmarks). Frente a alternativas genéricas de la literatura (PPO o SAC sobre `LunarLander-v3`), no hay datos de rendimiento en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa.

| Modelo | Parametros | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-novice-v3-lunarlander | ~20k (estimado) | no aplica | 282,4 (media 10 episodios) | no disponible | Hugging Face Hub |
| connectailab-rl-novice-v2-lunarlander | no disponible | no aplica | ~258,7 | no disponible | referenciado en la model card |
| connectailab-rl-novice-v1-lunarlander | no disponible | no aplica | ~205,3 | no disponible | referenciado en la model card |

## Limitaciones y advertencias

- Específico de un único entorno: la política solo es válida para `LunarLander-v3` con la misma parametrización de observación (8 dimensiones) y acción (4 discretas). No se transfiere a otros entornos ni a variantes con observaciones distintas.
- Dependencia de la recompensa moldeada: el rendimiento de 282,4 puntos se obtuvo con una función de recompensa modificada (penalización de `vy < -0.35` bajo `y < 0.3` y bonus `+8.0` por contacto simultáneo). Evaluar la política con la recompensa original de Gymnasium puede dar cifras distintas; el autor no reporta esa evaluación.
- Sin métricas de robustez: no se publican desviación típica, número de semillas, ni curvas de aprendizaje. El valor 282,4 corresponde a 10 episodios y no permite estimar la varianza.
- Licencia no declarada: al no especificarse licencia, no hay autorización explícita para uso comercial ni para redistribución. Conviene contactar con el autor antes de cualquier uso en producción.
- Riesgo de sobreajuste a la semilla: el script de inferencia fija `seed=2026`; no se documenta el comportamiento con otras semillas iniciales.
- Sin información sobre sesgos: al no ser un modelo de lenguaje, no aplican sesgos lingüísticos, pero tampoco se documenta el comportamiento de la política en estados atípicos (por ejemplo, ángulos extremos o velocidades de entrada elevadas).
- Reproducibilidad incompleta: no se indican hiperparámetros completos (tamaño del replay buffer, epsilon schedule, número de episodios, semilla de entrenamiento), lo que dificulta reproducir el resultado de 282,4 puntos.
- Modelo de autor único y sin descargas ni likes en el momento de la consulta: no hay validación externa de la métrica reportada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lookarooka/connectailab-rl-novice-v3-lunarlander
- Entorno Gymnasium `LunarLander-v3`: https://gymnasium.farama.org/environments/box2d/lunar_lander/
- Documentación de PyTorch (`torch.load`): https://pytorch.org/docs/stable/generated/torch.load.html
- Librería `huggingface_hub` (`hf_hub_download`): https://huggingface.co/docs/huggingface_hub/guides/download
- Paper de DQN (Mnih et al., 2015): https://www.nature.com/articles/nature14236
- Paper de Double DQN (van Hasselt et al., 2016): https://arxiv.org/abs/1509.06461
- Paper de Dueling DQN (Wang et al., 2016): https://arxiv.org/abs/1511.06581
- Paper de n-step returns en DQN (Sutton y Barto, *Reinforcement Learning: An Introduction*): http://incompleteideas.net/book/the-book-2nd.html
