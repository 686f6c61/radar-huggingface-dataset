# kevincity2026/connectailab-rl-openduck-v2-walk-ppo

## Resumen

connectailab-rl-openduck-v2-walk-ppo es una política de control entrenada con aprendizaje por refuerzo (PPO) para la locomoción bípeda del robot de código abierto Open Duck Mini v2, una versión reducida de 42 cm inspirada en el droid BDX de Disney Research. El modelo ha sido desarrollado por el usuario kevincity2026 como proyecto final de los módulos 8 a 10 del programa Physical AI 2026 de AI City Builders, y resuelve el problema concreto de generar una marcha estable en un robot bípedo de bajo coste con actuadores Feetech STS3215.

No es un modelo de lenguaje: es una política neuronal que mapea un vector de observación de 42 dimensiones (IMU de pitch/roll/giroscopio, posiciones y velocidades articulares, interruptores de pie y acción previa) a un vector de acción continuo de 10 dimensiones correspondiente a las articulaciones de las patas. Se distribuye en formato ONNX para su despliegue en el bucle de control en tiempo real (50 Hz) sobre MuJoCo o sobre el hardware físico.

Su relevancia radica en que documenta de forma explícita los hiperparámetros de PPO, el pipeline de simulación en MuJoCo 3.x con dinámica de actuador identificada (BAM) y las métricas de entrenamiento, lo que lo convierte en una referencia útil para quien quiera reproducir o adaptar una política de locomoción bípeda en un robot de menos de 600 000 wones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal para RL (PPO con GAE); topología de red no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observación de 42 dimensiones por paso |
| Tipos de cuantizacion | no disponible (pesos exportados a ONNX) |
| Idiomas soportados | no aplica (modelo de control robótico) |
| Licencia | Apache 2.0 según la model card (el campo de licencia del repo figura como no disponible) |
| Formato de pesos | ONNX (BEST_WALK_ONNX_2.onnx) |

## Arquitectura y entrenamiento

La política se entrena con Proximal Policy Optimization (PPO) con Generalized Advantage Estimation. Los hiperparámetros declarados son: learning rate 3.0e-4, clip range 0.2, gamma 0.99, GAE lambda 0.95, coeficiente de entropía 0.005, coeficiente de pérdida de valor 0.5, batch size 64, 10 épocas por actualización y 400 000 pasos totales. El espacio de acciones es continuo en Box(-1.0, 1.0, shape=(10,)) y el de observaciones es Box(shape=(42,)), compuesto por estado IMU (roll, pitch, giroscopio), posiciones y velocidades articulares, interruptores de pie y la acción previa.

El entorno de simulación es MuJoCo 3.x con dinámica de actuador identificada mediante BAM para los servos Feetech STS3215, lo que busca reducir la brecha sim-to-real. El entrenamiento incorpora imitación de referencia de marcha paramétrica, lo que según el autor permite converger en torno a 280 000 pasos. El control se ejecuta en un bucle a 50 Hz sobre Raspberry Pi Zero 2W. La topología exacta de la red (número de capas y neuronas) no está documentada en la información disponible.

## Capacidades

- Locomoción bípeda hacia delante con control continuo de 10 articulaciones de pierna.
- Estabilización activa basada en realimentación IMU (pitch, roll y giroscopio) para evitar caídas.
- Control reactivo a interruptores de pie (foot switches) para gestión del contacto.
- Política entrenada para despliegue sim-to-real sobre hardware Open Duck Mini v2 con servos Feetech STS3215.
- Exportación a ONNX para inferencia en tiempo real en controladores de bajos recursos.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es exclusivamente un controlador motor.

## Casos de uso

- Investigación en locomoción bípeda: sirve como línea base reproducible de PPO sobre MuJoCo para comparar variantes de recompensa, dominio de aleatorización o dinámica de actuador.
- Docencia en aprendizaje por refuerzo: el repositorio documenta hiperparámetros, espacio de observación y métricas, lo que facilita usarlo como ejemplo completo de un pipeline de RL físico.
- Despliegue en el robot Open Duck Mini v2: la política se carga como ONNX en el bucle de 50 Hz sobre Raspberry Pi Zero 2W para ejecutar la marcha en hardware real.
- Prototipado de robótica educativa de bajo coste: el BOM declarado (unos 549 000 wones en versión inalámbrica, 291 000 en lotes de 20) permite montar plataformas de práctica asequibles.
- Validación de pipelines sim-to-real: la identificación BAM de los servos STS3215 permite estudiar la transferencia de políticas simuladas a servos reales con fricción y rigidez calibradas.
- Benchmarking interno de controladores: las métricas de recompensa media y tasa de estabilidad permiten comparar nuevas políticas frente a esta referencia en el mismo entorno OpenDuckMini-v2-Gymnasium.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados):

| Metrica | Valor | Contexto |
|---|---|---|
| mean_episode_reward | 486.5 | Frente a -112.4 de una política aleatoria |
| walk_stability_rate | 96.2% | Sin caídas en 500 pasos de marcha continua |
| Eficiencia de muestras (convergencia inicial) | ~280 000 pasos | Con imitación de referencia de marcha paramétrica |
| Sim-to-real | A+ (Ready) | Según coeficientes BAM de los Feetech STS3215 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: al ser una política ONNX de pequeño tamaño, se ejecuta en el propio robot sobre Raspberry Pi Zero 2W a 50 Hz.
- VRAM: no requiere GPU para inferencia; el tamaño del repositorio es de 0.0 GB, lo que sugiere un artefacto muy ligero.
- GPU recomendadas: no disponibles; para reentrenamiento conviene una GPU con soporte MuJoCo y el framework connectailab-rl, pero no se especifican modelos concretos.
- Cabe en cualquier GPU de consumo e incluso en hardware embebido; no se detallan requisitos de entrenamiento.
- Opciones de despliegue: inferencia ONNX (OnnxInfer), MuJoCo para simulación y el stack connectailab-rl para entrenamiento.
- Latencia y throughput: bucle de control a 50 Hz declarado; no se publican cifras de throughput de entrenamiento.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Licencia | Disponibilidad |
|---|---|---|---|---|
| connectailab-rl-openduck-v2-walk-ppo | Política PPO para bípedo Open Duck Mini v2 | MuJoCo 3.x | Apache 2.0 (según model card) | Hugging Face, ONNX |
| Políticas del proyecto Open Duck Mini (Antoine Pirrone / Pollen Robotics) | Políticas de locomoción para el mismo robot | MuJoCo / hardware | no disponible en esta ficha | Repositorio del proyecto Open Duck Mini |
| Políticas BDX Droid de Disney Research | Locomoción bípeda de referencia | Simulación propietaria | no disponible | Paper de investigación |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Las métricas (486.5 de recompensa, 96.2% de estabilidad) están marcadas como no verificadas y proceden únicamente del autor.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa de la comunidad.
- El campo de licencia del repositorio figura como no disponible; la model card menciona Apache 2.0, por lo que conviene confirmarlo antes de uso comercial.
- La política está entrenada específicamente para el Open Duck Mini v2 con servos Feetech STS3215; no es transferible a otras morfologías sin reentrenamiento.
- La afirmación de sim-to-real "A+ (Ready)" no está respaldada por datos de despliegue físico publicados.
- No hay información sobre sesgos, alucinación ni comportamiento fuera de distribución más allá de las condiciones de entrenamiento.
- La topología de red y el tamaño del modelo no están documentados, lo que dificulta auditar la política.

## Enlaces

- Hugging Face: https://huggingface.co/kevincity2026/connectailab-rl-openduck-v2-walk-ppo
- Proyecto Open Duck Mini (referencia citada en la model card): https://github.com/apirrone/Open_Duck_Mini
- Paper de locomoción del BDX Droid de Disney Research (referencia citada): no disponible el enlace directo en la información proporcionada
