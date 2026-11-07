# Open-IO/Unified-Inertial-Encoder

## Resumen
Unified-Inertial-Encoder es un codificador neuronal especializado en odometría inercial, es decir, en estimar el movimiento (velocidad y trayectoria) de un cuerpo a partir únicamente de lecturas de IMU (unidad de medida inercial). Lo desarrolla Open-IO y se publica como checkpoint asociado al artículo "A Unified Inertial Encoder for Human and Humanoid Motion" (Chen et al., 2026). El modelo resuelve un problema clásico en robótica y captura de movimiento: obtener trayectorias fiables sin depender de visión externa, usando solo acelerómetro y giroscopio.

La propuesta central es un único encoder entrenado conjuntamente con movimiento humano y movimiento de un robot humanoide Unitree G1 retargetizado cinemáticamente, de forma que el mismo modelo transfiere zero-shot a un G1 físico. El checkpoint contiene pesos EMA en bf16 con 55,6M de parámetros, un tamaño muy contenido que permite evaluación en una sola GPU CUDA. Es relevante porque demuestra que un encoder inercial unificado puede cubrir dominios morfológicamente distintos (humano y humanoide) sin reentrenamiento específico por plataforma.

No es un modelo de lenguaje ni un modelo multimodal generativo: es un componente de percepción para pipelines de robótica, pensado para integración con código propio y no para inferencia conversacional. Su licencia figura como "other", por lo que las condiciones de uso comercial deben consultarse en el repositorio del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder inercial neuronal (detalles internos no disponibles en la informacion proporcionada) |
| Parametros totales | 55,6M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; checkpoint publicado en bf16 |
| Idiomas soportados | no disponible (modelo no linguistico; una variante de dataset se denomina "Processed_Language") |
| Licencia | other |
| Formato de pesos | checkpoint PyTorch (`.ckpt`) con pesos EMA en bf16, acompanado de configuracion Hydra (`.hydra/`) |

## Arquitectura y entrenamiento
La informacion disponible no detalla la arquitectura interna del encoder (tipo de bloques, mecanismo de atencion o recurrencia). Lo que si se especifica es que se trata de un unico encoder compartido entre movimiento humano y movimiento de humanoide, entrenado sobre movimiento humano y sobre movimiento del robot Unitree G1 retargetizado cinematicamente. Los datasets citados son `bones-studio/seed` y `Open-IO/humanoid-g1-odometry`, y la ejecucion de entrenamiento corresponde a `experiment=exp15_full_train_C` segun la configuracion Hydra incluida.

El checkpoint contiene solo pesos (estado EMA, bf16) sin estado del optimizador, por lo que permite evaluacion y fine-tuning, pero no la reanudacion exacta del entrenamiento original. Un detalle metodologico relevante: los clips de G1 real nunca se usan para entrenamiento por gradiente, aunque sus puntuaciones influyeron en la seleccion de este checkpoint, lo que conviene tener en cuenta al interpretar los resultados en el dominio real.

## Capacidades
- Estimacion de odometria inercial: calculo de velocidad media y trayectoria a partir de datos de IMU.
- Transferencia zero-shot entre dominios morfologicos: un mismo encoder entrenado con movimiento humano y G1 retargetizado se aplica a un Unitree G1 fisico.
- Procesamiento de secuencias inerciales para evaluacion offline sobre datasets en formato NPZ procesado.
- Soporte de fine-tuning sobre el checkpoint publicado (pesos sin optimizador).
- No dispone de generacion de texto, codigo, vision, audio, tool calling ni capacidades de agente; es un modulo de percepcion, no un modelo generativo.
- Capacidades multilingues: no aplicables.

## Casos de uso
- Odometria de robots humanoides sin vision: integracion del encoder en la pila de estado del Unitree G1 para estimar velocidad y desplazamiento usando solo la IMU embarcada, util en entornos con poca luz, humo o superficies sin textura donde la odometria visual falla.
- Captura de movimiento sin marcadores: estimacion de trayectoria de sujetos humanos a partir de IMUs vestibles, aprovechando el entrenamiento sobre datasets de movimiento humano como BONES-Seed.
- Fusion sensorial en navegacion: uso de la salida inercial como fuente complementaria en un filtro o pipeline de fusion con LiDAR o camaras, mejorando la robustez en tramos de oclusion.
- Validacion de retargeting cinematico: comparacion de la respuesta del encoder sobre movimiento humano y su version retargetizada a G1 para detectar inconsistencias en la conversion entre morfologias.
- Investigacion en representaciones inerciales: base preentrenada para experimentos de transferencia entre plataformas y para fine-tuning en nuevas morfologias con pocos datos.
- Evaluacion reproducible de metodos de odometria: el repositorio y los datasets publicados permiten reproducir las metricas AVE y ATE reportadas en el articulo y comparar metodos propios contra ellas.

## Benchmarks y rendimiento
Resultados reportados en el articulo para el checkpoint "Ours". AVE es el error medio de velocidad (m/s); ATE<sub>GT</sub> y ATE<sub>Pred</sub> son errores de trayectoria (m) usando rotacion de referencia y rotacion preintegrada del giroscopio, respectivamente.

| Dataset | AVE (m/s) | ATE_GT (m) | ATE_Pred (m) |
|---|---|---|---|
| Nymeria | 0,026 | 2,468 | 18,20 |
| Natural Motion | 0,049 | 7,456 | 50,54 |
| BONES-Seed (Human) | 0,031 | 0,113 | 0,148 |
| BONES-Seed (G1) | 0,024 | 0,101 | 0,127 |
| Real-Trajectory (G1) | 0,099 | 3,153 | 11,50 |

No se han publicado en la informacion disponible resultados comparativos frente a otros metodos en forma de tabla; las cifras anteriores corresponden unicamente a este modelo.

## Requisitos de hardware
- VRAM estimada para inferencia: muy reducida por el tamano del modelo (55,6M de parametros en bf16, en torno a 0,11 GB de pesos); el consumo real depende de la longitud de las secuencias de IMU y del batch, dato no disponible.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; `src.eval_foundation` requiere una GPU CUDA. Para evaluacion cabe holgadamente en tarjetas consumer como RTX 3060, RTX 4060 o RTX 4090.
- Cabe en GPU consumer: si, con margen amplio dado el tamano del checkpoint.
- Opciones de despliegue: el codigo oficial del repositorio GitHub (evaluacion via `python -m src.eval_foundation`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares
No se dispone en la informacion proporcionada de modelos comparables de odometria inercial con datos de parametros, contexto, rendimiento y licencia verificables. Por tanto, la comparativa se indica como no disponible. Como referencia de categoria, el modelo se situa en el ambito de encoders inerciales para robotica y captura de movimiento, no en el de modelos de lenguaje o multimodales generativos.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse con datasets concretos de movimiento humano y G1, el rendimiento puede degradarse en morfologias o patrones de marcha poco representados.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero existe riesgo de deriva en la trayectoria estimada; los ATE_Pred elevados en Nymeria (18,20 m) y Natural Motion (50,54 m) evidencian una acumulacion de error considerable cuando la rotacion se preintegra solo con giroscopio.
- Limitaciones de contexto o idioma: no aplicables; la ventana temporal de las secuencias de IMU procesables no se especifica.
- Restricciones de licencia: la licencia es "other"; es imprescindible revisar las condiciones del repositorio del proyecto antes de cualquier uso comercial.
- Caveat de produccion: los clips reales de G1 no se usaron para entrenamiento por gradiente, aunque influyeron en la seleccion del checkpoint, lo que puede introducir un sesgo de seleccion en las metricas del dominio real.
- El checkpoint no incluye estado del optimizador: no permite reanudar el entrenamiento original de forma exacta, solo evaluacion o fine-tuning.
- Dependencia de la configuracion Hydra: el directorio `.hydra/` debe mantenerse junto a `checkpoints/` porque el codigo reconstruye el modelo a partir de ella.

## Enlaces
- Hugging Face: https://huggingface.co/Open-IO/Unified-Inertial-Encoder
- Pagina del proyecto: https://unified-inertial-encoder.github.io/
- Codigo: https://github.com/unified-inertial-encoder/Unified-Inertial-Encoder
- Dataset de odometria G1: https://huggingface.co/datasets/Open-IO/humanoid-g1-odometry
- Dataset BONES-Seed: https://huggingface.co/datasets/bones-studio/seed
