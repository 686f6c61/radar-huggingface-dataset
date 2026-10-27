# scaleresearch/ttrl-dqn-pong

## Resumen

`ttrl-dqn-pong` es un agente de aprendizaje por refuerzo profundo publicado por scaleresearch: un Double DQN entrenado para jugar a Pong en el entorno `ALE/Pong-v5` de Arcade Learning Environment. El modelo consume píxeles crudos (pila de 4 fotogramas de 84x84, float32 en rango 0..255) y devuelve la acción seleccionada junto con el valor Q de cada acción. Se distribuye como exportación ONNX, de modo que puede ejecutarse en cualquier CPU con `onnxruntime` y `gymnasium`, sin necesidad de hardware Tenstorrent ni de instalar el framework de entrenamiento.

El interés del modelo es doble. Por un lado, es un ejemplo mínimo y reproducible de un pipeline completo de RL (entrenamiento, evaluación con protocolo Atari estándar y exportación portátil). Por otro, sirve como demostración del framework `ttrl` de scaleresearch ejecutándose sobre un único chip Tenstorrent Blackhole: el entrenamiento completo, 10 millones de pasos de agente equivalentes a 40 millones de fotogramas con frameskip 4, se completó en 25,1 horas en un solo chip.

La puntuación declarada por el autor es de 19,57 ± 1,33 de retorno medio en 30 episodios con política greedy sobre CPU, con acciones pegajosas a 0,25 y 30 arranques aleatorios sin operación. Es un resultado próximo al máximo teórico de Pong (21), aunque la métrica figura como no verificada en el `model-index`. No se dispone de datos sobre el número de parámetros ni sobre la configuración exacta de capas de la red.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional (CNN) de Deep Q-Network con Double DQN; entrada `(batch, 4, 84, 84)` float32 en píxeles crudos 0..255, salidas `action` int64 y `head` con el valor Q de cada acción. La configuración exacta de capas no está documentada en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; la entrada es una pila de 4 fotogramas de 84x84 píxeles |
| Tipos de cuantizacion | no disponible; los artefactos publicados están en float32 (ONNX) y en formato `.npz`. No se documentan variantes cuantizadas |
| Idiomas soportados | no aplica (agente de control sobre píxeles, no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | `model.onnx` (inferencia portable), `checkpoint.npz` (ejecución en chip Tenstorrent vía ttnn), `policy.npz` (ejecución en numpy vía `ttrl.load_policy`) |

## Arquitectura y entrenamiento

La política es un Double DQN clásico sobre Atari: una red convolucional que transforma la pila de 4 fotogramas de 84x84 en un vector de valores Q, uno por acción disponible en el entorno. El uso de Double DQN desacopla la selección de la acción de la evaluación del valor, lo que reduce el sesgo de sobreestimación típico del DQN vanilla. El preprocesado de observaciones no forma parte del grafo ONNX: `play.py` incluye el pipeline exacto con el que se entrenó, y el modelo espera píxeles en unidades 0..255.

El entrenamiento se realizó con `ttrl` 0.1.0 (árbol pre-release, commit `aab87a1028c1`) durante 10.000.000 de pasos de agente (40.000.000 de fotogramas con frameskip 4) en 25,1 horas sobre un único chip Tenstorrent Blackhole. Los hiperparámetros principales son: `lr` 0,0001, `batch_size` 32, `gamma` 0,99, `n_step` 3, `double` activado, `buffer_capacity` 1.000.000, `learning_starts` 80.000, `train_freq` 4, `target_sync_interval` 8.000, `eps_decay_frames` 1.000.000, `eps_end` 0,01 y `huber_delta` 1,0 con pérdida Huber. El epsilon anneala desde 1,0 a lo largo de los primeros 1.000.000 de pasos de agente. Durante el entrenamiento los episodios terminan al perder una vida y las recompensas se transforman con la función `sign`, lo que explica que la curva de evaluación arranque en valores negativos.

La innovación destacable no está en el algoritmo, sino en la infraestructura: el entrenamiento corre sobre la pila `ttnn` de Tenstorrent y el resultado se exporta a ONNX para desacoplarlo del hardware. La evaluación usa el protocolo Atari estándar con acciones pegajosas a 0,25, 30 arranques aleatorios sin operación y partidas completas en lugar de vidas individuales, lo que hace los números comparables con la literatura habitual.

## Capacidades

- Control de Atari Pong a partir de píxeles crudos, sin ingeniería de características manual.
- Política greedy determinista: devuelve la acción de mayor Q para cada observación.
- Exposición de los valores Q de todas las acciones (`head`), útil para análisis, depuración o estrategias de exploración propias.
- Inferencia por lotes: la firma ONNX admite `(batch, 4, 84, 84)` y devuelve tensores de tamaños `(batch,)`.
- Ejecución en CPU pura con `onnxruntime`, sin GPU ni aceleradores.
- Ejecución en chip Tenstorrent Blackhole a través de `checkpoint.npz` y `ttnn`.
- Ejecución en numpy puro mediante `ttrl.load_policy("policy.npz")`.
- No soporta tool calling ni function calling.
- No soporta agentes multi-paso fuera del bucle del entorno, ni planificación simbólica.
- No procesa lenguaje natural, audio ni imágenes genéricas: solo fotogramas de Atari con el preprocesado documentado.

## Casos de uso

- **Validación de paridad entre backends**: comparar las salidas de `model.onnx` en CPU con las del `checkpoint.npz` en ttnn sobre las mismas observaciones permite detectar discrepancias numéricas en exportaciones o compiladores. El agente es lo bastante pequeño para ejecutar miles de comparaciones por minuto.
- **Pruebas de regresión en frameworks de RL**: al estar congelado con una puntuación de referencia conocida (19,57 ± 1,33), sirve como test de extremo a extremo para verificar que cambios en `ttrl`, en los wrappers de Atari o en `ale-py` no degradan el comportamiento.
- **Docencia y tutoriales de Deep RL**: es un ejemplo autocontenido de Double DQN con recompensa, hiperparámetros, curva de evaluación y script de reproducción. El alumno puede observar la política entrenada en CPU en pocos minutos, sin infraestructura especial.
- **Demostración de entrenamiento en hardware Tenstorrent**: el repositorio documenta el comando de reentrenamiento (`ttrl train train_config.py`) y el tiempo por chip, lo que permite reproducir el ciclo completo en un Blackhole y medir el coste real de la pila `ttnn` en una carga RL.
- **Benchmark de latencia de inferencia en CPU**: una CNN de este tamaño permite medir el coste por paso de `onnxruntime` en distintos procesadores y sirve como referencia para presupuestar agentes que deben correr a decenas de decisiones por segundo.
- **Evaluación de wrappers y protocolos de Atari**: el agente está entrenado con acciones pegajosas, arranques sin operación y terminación por pérdida de vida, de modo que es un banco de pruebas útil para validar configuraciones de `gymnasium[atari]` y `ale-py` bajo condiciones reproducibles.
- **Punto de partida para experimentos de RL**: el `checkpoint.npz` y el `train_config.py` permiten continuar el entrenamiento o aplicar ajustes finos (por ejemplo, cambiar `n_step` o el decaimiento de epsilon) y comparar contra la línea base publicada.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card (métrica marcada como no verificada):

| Evaluación | Entorno | Métrica | Valor |
|---|---|---|---|
| Política greedy, 30 episodios, `play.py` sobre CPU, semilla 10000 | ALE/Pong-v5 | mean_reward | 19,57 ± 1,33 |
| Evaluación de entrenamiento en el paso 7.000.000, epsilon 0,05, 30 episodios | ALE/Pong-v5 | mean_reward | 17,8 |

Ambas evaluaciones emplean acciones pegajosas a 0,25, 30 arranques aleatorios sin operación y partidas completas en lugar de vidas individuales.

Curva de evaluación durante el entrenamiento (selección de hitos; la serie completa está en la model card):

| Paso de agente | Retorno medio de evaluación |
|---|---|
| 250.000 | -18,2 |
| 1.000.000 | -3,2 |
| 1.500.000 | -0,1 |
| 2.500.000 | 14,4 |
| 5.000.000 | 16,3 |
| 7.000.000 | 17,8 |
| 10.000.000 | 17,4 |

No se han publicado en la información disponible resultados de benchmarks frente a otros agentes (parámetros, coste de entrenamiento o puntuaciones de alternativas).

## Requisitos de hardware

- **Inferencia**: CPU estándar con `onnxruntime`; no requiere GPU ni acelerador. El repositorio reporta un tamaño de 0,0 GB (por debajo del umbral de visualización de HuggingFace), coherente con una CNN de política para Atari de tamaño reducido.
- **VRAM estimada**: no disponible en cifras; por la naturaleza del modelo (entrada de 4x84x84 y una cabeza de valores Q) es marginal y cabe holgadamente en cualquier GPU de consumo, aunque la ruta soportada oficialmente es CPU.
- **GPU recomendadas**: no se documentan. Cualquier GPU consumer (por ejemplo, una RTX 4090) podría ejecutar el ONNX, pero no aporta ventaja frente a CPU para este tamaño de red.
- **Hardware de entrenamiento**: un único chip Tenstorrent Blackhole; 25,1 horas para 10.000.000 de pasos de agente con `ttrl` 0.1.0 (commit `aab87a1028c1`).
- **Opciones de despliegue**: `onnxruntime` (CPU, ruta recomendada), `ttnn` vía `ttrl.agent_from_checkpoint` sobre chip Tenstorrent, y numpy puro con `ttrl.load_policy("policy.npz")`.
- **Latencia y throughput**: no disponibles; no se han publicado mediciones por paso ni por episodio.
- **Dependencias de ejecución**: `onnxruntime`, `gymnasium[atari]`, `ale-py` y `huggingface_hub` para la descarga de los artefactos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Resultado en Pong | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `scaleresearch/ttrl-dqn-pong` (Double DQN) | no disponible | no aplica (4x84x84) | 19,57 ± 1,33 de retorno medio (no verificado) | MIT | HuggingFace, ONNX + `.npz` |
| DQN original de Mnih et al. (2015) | no disponible en la información proporcionada | no aplica | no disponible en la información proporcionada | no disponible en la información proporcionada | Publicación académica |
| Implementaciones de referencia de DQN/Double DQN en frameworks de RL habituales | no disponible en la información proporcionada | no aplica | no disponible en la información proporcionada | variable según implementación | Repositorios públicos |

La información proporcionada no incluye métricas de terceros que permitan una comparación numérica rigurosa. La comparación relevante es cualitativa: frente a otras implementaciones de DQN, este modelo destaca por publicar el artefacto entrenado en tres formatos (ONNX, `.npz` para ttnn y `.npz` para numpy), por documentar la curva de evaluación completa y por ejecutarse sin instalar el framework de entrenamiento.

## Limitaciones y advertencias

- **Ámbito reducido**: el agente solo juega a `ALE/Pong-v5`. No generaliza a otros juegos de Atari ni a otras tareas de control sin reentrenamiento.
- **Métrica no verificada**: el `model-index` marca el resultado como `verified: false`; la puntuación procede del propio autor y no de un tercero independiente.
- **Varianza de evaluación**: 30 episodios con una desviación de ±1,33 implican un intervalo de confianza apreciable; diferencias de una o dos unidades entre ejecuciones pueden no ser significativas.
- **Dependencia del preprocesado**: el ONNX no incluye la normalización de observaciones. Usar otro pipeline distinto al de `play.py` degrada la política de forma silenciosa.
- **Reproducibilidad del entrenamiento**: el autor cita `ttrl` 0.1.0 en un árbol pre-release (commit `aab87a1028c1`); reproducir el entrenamiento con otra versión puede variar resultados.
- **Sesgos**: no se documenta un análisis de sesgos; al tratarse de un entorno sintético y determinista en su dinámica, el riesgo de sesgo social es nulo, pero sí existe riesgo de sobreajuste a la variante concreta del entorno y a sus wrappers.
- **Alucinación**: no aplica, al no ser un modelo generativo de lenguaje.
- **Idioma**: no soporta ningún idioma; no procesa texto.
- **Licencia**: MIT permite uso comercial y modificación, pero obliga a conservar el aviso de copyright y la cláusula de licencia en las redistribuciones. El modelo se distribuye sin garantías.
- **Producción**: adecuado como componente de demostración, pruebas o docencia; no debe tratarse como un agente de propósito general ni como base para decisiones fuera del entorno de juego.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/scaleresearch/ttrl-dqn-pong
- Repositorio del framework ttrl: https://github.com/scaleresearch/tt-rl
- Ejemplo de Atari DQN dentro de ttrl: `examples/atari-dqn` del repositorio anterior
- Script de reproducción incluido en el repositorio del modelo: `play.py`
- Configuración de entrenamiento incluida en el repositorio del modelo: `train_config.py`
- Vídeo de repetición incluido en el repositorio del modelo: `replay.mp4`
