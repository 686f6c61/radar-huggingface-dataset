# humanoid-benchmark/ode

## Resumen

ODE Policy es un modelo de política neuronal para control robótico de humanoides, publicado por el proyecto Humanoid Benchmark bajo el identificador `humanoid-benchmark/ode`. No es un modelo de lenguaje: es un checkpoint de imitación (imitation learning) entrenado para ejecutar una tarea concreta de manipulación y locomoción —recoger un barril de chips de un carrito, caminar hasta un cubo de pedal y depositarlo dentro— sobre el robot Unitree G1 con manos Inspire. La implementación sigue el port de ODE Policy para el G1 del repositorio NTUMARS/ODE-POLICY (rama `real-g1`), sustituyendo el backbone GR00T del port por el codificador de imágenes propio de ODE Policy.

Técnicamente, el modelo es un ODE-MLP: un campo de velocidad parametrizado por un MLP residual con modulación FiLM de 512 unidades y 4 capas, que integra 64 valores de motion-token mediante Euler explícito, un paso por fila de acción. Dos ResNet18 entrenadas desde cero procesan las vistas `ego_view` y `chest` a resolución 168x224. El conjunto suma 26,5 M de parámetros, de los cuales 22,4 M corresponden a los dos codificadores visuales.

Es relevante ahora porque forma parte del esfuerzo de estandarización de baselines del Humanoid Benchmark: publica no solo pesos, sino el protocolo completo de entrenamiento (receta, curvas de MSE, hashes SHA-256, código exacto y `pip freeze`), lo que permite reproducir el experimento. El checkpoint evaluado está aún pendiente de selección por la evaluación estándar del benchmark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ODE-MLP (campo de velocidad: MLP residual con FiLM, 512 unidades, 4 capas) + 2x ResNet18 (GroupNorm, desde cero) |
| Parametros totales | 26,5 M (22,4 M en los dos ResNet18) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (sin contexto textual); entrada: estado 44-D + 2 frames RGB 168x224; salida: 16 filas de acción de dimensión 76, se ejecutan 12 por consulta |
| Tipos de cuantizacion | no disponible (pesos en FP32/BF16 mixto durante entrenamiento; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | `model.pt` (PyTorch) + `config.json`, con formato `hb_baselines/1`; carga mediante `evaluation/policy/ODEMLP` |

## Arquitectura y entrenamiento

El modelo sigue un esquema de difusión/ODE determinista sobre tokens de movimiento. Cada cámara pasa por una ResNet18 independiente entrenada desde cero con GroupNorm; las características visuales se proyectan con `Linear(LayerNorm(...))` a una condición `c` de 512 dimensiones. El estado del robot (44-D: 29 ángulos articulares, 6+6 valores medidos de las manos Inspire y 3 componentes de gravedad proyectada) entra únicamente en el campo de velocidad, no en la condición. Los 64 valores de motion-token constituyen el estado del ODE y se integran con Euler explícito, una fila por paso, partiendo de la fila de acción ejecutada previamente (o de un BOS normalizado a cero en el primer frame). Las manos se generan con una cabeza `Linear-SiLU-Linear` que produce 16x12 valores continuos en unidades normalizadas, recortados a [0,1] por el runner. La pérdida es MSE enmascarado en unidades normalizadas, con pesos 64:12 entre tokens y manos.

El entrenamiento se realizó sobre el dataset `b6-pedal-bin` v6 (542 episodios, 331.577 frames) con batch global de 512 en una única RTX 5090, 8.000 pasos de AdamW (lr 1e-4, betas 0.95/0.999, weight decay 1e-6, warm-up lineal de 500 pasos y decaimiento coseno), EMA estilo Diffusion Policy (power 0.75, max 0.9999) y autocast bf16 en el codificador con la cabeza ODE en FP32. La aumentación incluye el spec v2 de Humanoid Benchmark (15 efectos fotométricos, geométricos, de sensor e iluminación, con uno amplificado a 1.5x por muestra), un sesgo por muestra U(±2°) más ruido N(0, 0.25°) en las 29 articulaciones del cuerpo, y semillas deterministas derivadas de `numpy default_rng([42, torch.initial_seed(), worker id])`. La normalización q01/q99 está almacenada en los pesos.

## Capacidades

- Control visuomotor de un humanoide Unitree G1 con manos Inspire para una tarea de picking, locomoción y manipulación (B6 pedal bin).
- Política de imitación condicionada por dos vistas RGB (`ego_view` y `chest`) y por el estado propioceptivo de 44 dimensiones.
- Generación de chunks de 16 filas de acción de dimensión 76 (64 tokens de movimiento SONIC + 12 valores de mano), con ejecución de 12 filas antes de la siguiente consulta.
- Integración de ODE determinista con Euler, un paso por fila, lo que da control sobre el coste de inferencia.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No incorpora visión general, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Baseline de referencia en Humanoid Benchmark: sirve para comparar nuevas políticas sobre la tarea B6 pedal bin con una receta reproducible y métricas de MSE en bucle cerrado pendientes de publicar.
- Investigación en imitation learning visuomotor: permite estudiar el efecto de la aumentación online spec v2, del sesgo articular U(±2°) y del ruido N(0, 0.25°) sobre la robustez de la política.
- Estudio de integradores ODE en políticas robóticas: al ser un ODE-MLP con Euler de un paso por fila, facilita experimentos controlados sobre número de pasos, estabilidad y coste computacional frente a alternativas de difusión con múltiples pasos.
- Reproducción de experimentos: el `protocol.json`, `SHA256SUMS`, `pip freeze` y el código exacto en `code_b4b94d29/` permiten reentrenar y verificar curvas de MSE dentro del ruido entre ejecuciones.
- Despliegue en el robot real Unitree G1: el modelo está entrenado para el contrato `g1_sonic_dfx6` y ejecuta acciones directamente sobre el hardware con manos Inspire.
- Análisis de sobreajuste y selección de checkpoints: la curva de MSE en entrenamiento (mínimo en el paso 5.250 con 0,1228, con repunte posterior por las dimensiones de mano) permite estudiar la discrepancia entre MSE offline y tasa de éxito en bucle cerrado.
- Docencia y divulgación en robótica: el tamaño reducido (26,5 M de parámetros, repo de 0,3 GB) permite ejecutar y modificar el modelo en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye la curva de MSE normalizado en entrenamiento (evaluación sobre 10 episodios de entrenamiento, semilla 1234):

| Paso | 1.000 | 2.000 | 4.000 | 5.000 | 5.250 | 6.000 | 7.000 | 8.000 |
|---|---|---|---|---|---|---|---|---|
| nMSE | 0,222 | 0,160 | 0,126 | 0,123 | 0,1228 (mínimo) | 0,126 | 0,131 | 0,1357 |

El repunte tras el paso 5.250 se atribuye a las dimensiones de mano (de 0,529 a 0,629), mientras que la parte de tokens sigue bajando (de 0,047 a 0,043). El MSE offline sobre frames de entrenamiento desciende durante toda la ejecución (0,00672 en el paso 8.000). La columna "Evaluated" del checkpoint de referencia figura como `pending`: la tasa de éxito en bucle cerrado no está publicada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 26,5 M de parámetros en FP32 el peso ronda los 106 MB, más activaciones de dos ResNet18 a 168x224, por lo que debería caber holgadamente en GPUs de consumo con 8 GB o menos.
- GPU de entrenamiento documentada: una única RTX 5090 con batch 512 y sin acumulación de gradientes, 8.000 pasos.
- GPU recomendadas para inferencia: cualquier GPU consumer reciente (RTX 3060 en adelante) es suficiente por tamaño; para el robot real se requiere el cómputo embarcado del Unitree G1 o un enlace de inferencia externo.
- Cabe en GPU de consumo: sí, por el tamaño del modelo; no se documentan requisitos mínimos oficiales.
- Opciones de despliegue: el runner del Humanoid Benchmark (`evaluation/baselines/train.py --policy ode_mlp --contract g1_sonic_dfx6`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ODE Policy (este checkpoint) | 26,5 M | 2 RGB 168x224 + estado 44-D | B6 pedal bin en Unitree G1 | Apache-2.0 | Pesos y protocolo publicados en HF |
| ODE-DiT (variante en el mismo código) | no disponible | no disponible | misma familia ODE | Apache-2.0 (código) | Existe en el código, no entrenada aquí |
| Port ODE-POLICY `real-g1` con backbone GR00T | no disponible | no disponible | Unitree G1 | Apache-2.0 | Repositorio GitHub NTUMARS/ODE-POLICY |
| Otras políticas del Humanoid Benchmark (`ode_mlp` frente a otros baselines del trainer) | no disponible | no disponible | mismas tareas del benchmark | no disponible | En `evaluation/baselines/train.py` |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo específico de una única tarea (B6 pedal bin) y un único robot (Unitree G1 con manos Inspire): no generaliza a otras tareas, morfologías ni entornos sin reentrenamiento.
- El checkpoint de referencia para evaluación figura como `pending`; no hay tasa de éxito en bucle cerrado publicada, por lo que el rendimiento real en el robot no está validado en la documentación.
- El MSE en entrenamiento repunta tras el paso 5.250 por las dimensiones de mano; el MSE no sustituye a la tasa de éxito en bucle cerrado, de ahí que se evalúen los tres checkpoints (`step-005000`, `step-006000`, `step-008000`).
- Dependencia de dos cámaras concretas (`ego_view`, `chest`) y de una resolución fija de 168x224; la cámara en tercera persona de los datasets es solo para revisión y nunca es entrada del modelo.
- La aumentación y la normalización están fijadas en los pesos y en el protocolo; cambios en la distribución de estados o iluminación en producción pueden degradar el comportamiento.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí existe riesgo de acciones fuera de distribución: el runner recorta las manos a [0,1] y el modelo puede producir comandos no válidos ante estados no vistos.
- No se documentan sesgos demográficos ni lingüísticos por no procesar texto ni imágenes de personas; los sesgos relevantes serían de dominio (condiciones de iluminación, materiales, fondo) presentes en los 542 episodios de entrenamiento.
- Licencia Apache-2.0 permite uso comercial, pero el modelo depende del código de ODE-POLICY (también Apache-2.0) y del Humanoid Benchmark; conviene verificar la licencia de los datasets `b6-pedal-bin` v6 antes de un despliegue comercial.
- No hay garantías de determinismo bit a bit entre ejecuciones: los kernels de GPU no son deterministas, aunque las curvas se reproducen dentro del ruido entre ejecuciones con la misma semilla (42) y layout.

## Enlaces

- Hugging Face: https://huggingface.co/humanoid-benchmark/ode
- Repositorio ODE-POLICY (NTUMARS): https://github.com/NTUMARS/ODE-POLICY
- Guía de reproducibilidad de HumanWAM (sección 4.7, ODE): https://github.com/zuo-kuangji/HumanWAM/blob/main/hb_training/REPRODUCIBILITY.md
- Cita: Jindou Jia et al., ODE Policy (NTUMARS/ODE-POLICY, Apache-2.0)
