# open-gigaai/GigaBrain-WBC-0.5

## Resumen

GigaBrain-WBC-0.5 es un modelo de control corporal completo (whole-body control, WBC) para el robot humanoide Unitree G1, desarrollado por open-gigaai. Se presenta como un "behavior world model" orientado a seguimiento robusto de movimiento con interaccion con el entorno: una unica politica neuronal cubre tareas de motion tracking, recuperacion de caidas e interaccion con terreno irregular. El modelo se distribuye como par de redes ONNX (encoder y decoder) junto con un checkpoint de entrenamiento en PyTorch, lo que permite tanto el despliegue en inferencia como el ajuste fino posterior.

El modelo resuelve un problema clasico en robotica humanoide: la fragmentacion de controladores especializados por tarea. En lugar de mantener politicas separadas para caminar, levantarse tras una caida o adaptarse a pendientes, GigaBrain-WBC-0.5 propone una politica unica entrenada con aprendizaje por refuerzo que generaliza entre estos regimenes. Incluye ademas un modelo auxiliar para el robot Maker L01, con una politica AMP (Adversarial Motion Priors) para los estados base de locomocion y el par encoder/decoder de GIGA-WBC.

La relevancia actual reside en su enfoque de "world model de comportamiento" aplicado a control motor, su publicacion en arXiv (2608.18234) y la disponibilidad de datos de entrenamiento y benchmark en abierto. El repositorio ocupa 0,9 GB y la licencia Apache-2.0 facilita su uso comercial e industrial. No es un modelo de lenguaje: no procesa texto ni imagenes, sino observaciones propioceptivas y comandos de referencia para producir acciones articulares a alta frecuencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica neuronal encoder/decoder exportada a ONNX; entrenada con aprendizaje por refuerzo (RL); incluye politica AMP auxiliar para locomocion base |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de control, no de lenguaje); ventana de observacion definida en `model_config.yaml`, valor no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX y checkpoint PyTorch sin cuantizar) |
| Idiomas soportados | no aplica (modelo de robotica; sin capacidades linguisticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`policy_encoder.onnx`, `policy_decoder.onnx`, `amp_terrain.onnx`) y checkpoint PyTorch (`checkpoint.pt`) |

## Arquitectura y entrenamiento

La arquitectura se compone de un encoder de referencia y un decoder de acciones, ambos exportados a ONNX, que en conjunto implementan la politica GIGA-WBC. El encoder procesa la referencia de movimiento y el estado del robot, y el decoder genera las acciones articulares de control corporal completo. Para el robot Maker L01 se incluye ademas `amp_terrain.onnx`, una politica de locomocion basada en Adversarial Motion Priors que cubre los estados de marcha base. El checkpoint `checkpoint.pt` del Unitree G1 se ofrece para ajuste fino, y `model_config.yaml` documenta la configuracion de observaciones de ese checkpoint.

El entrenamiento se basa en aprendizaje por refuerzo con interaccion explicita con el entorno, segun describe el paper. El modelo se plantea como un "behavior world model": aprende la dinamica de comportamiento del robot y su respuesta ante comandos implausibles, perturbaciones y terreno variable. No se dispone en la informacion proporcionada del numero de tokens o muestras de entrenamiento, la composicion exacta del dataset ni si se emplearon etapas de RLHF o DPO (no aplicables en este dominio). Los datos de entrenamiento y benchmark se publican en el dataset `open-gigaai/GigaBrain-WBC-0.5-TerrainData`, distribuido como dos archivos tar sin comprimir que contienen aproximadamente 29.000 ficheros de pocos kilobytes cada uno.

## Capacidades

- Seguimiento de movimiento de cuerpo completo (motion tracking) para el humanoide Unitree G1.
- Recuperacion de caidas integrada en la misma politica, sin conmutacion a un controlador separado.
- Interaccion con terreno: adaptacion a superficies irregulares y pendientes.
- Robustez ante comandos implausibles o inconsistentes.
- Locomocion base mediante politica AMP entrenada con Adversarial Motion Priors (Maker L01).
- Despliegue en inferencia mediante par encoder/decoder ONNX, compatible con el runner de evaluacion y el controlador de despliegue del repositorio.
- Ajuste fino a partir del checkpoint PyTorch del Unitree G1.
- No soporta tool calling, agentes conversacionales, vision, audio ni capacidades multilingues: es exclusivamente un modelo de control motor.

## Casos de uso

- Control de cuerpo completo en el Unitree G1: el par ONNX encoder/decoder se carga directamente en el controlador de despliegue del repositorio para generar acciones articulares a partir de referencias de movimiento y observaciones propioceptivas.
- Recuperacion autonoma de caidas en entornos reales: al integrar la recuperacion en la misma politica, el robot puede levantarse tras una perturbacion sin necesidad de detectar el fallo y conmutar a un modulo especializado, lo que simplifica la maquina de estados del sistema.
- Navegacion por terreno irregular: la interaccion con el entorno entrenada permite operar en superficies no planas, util en inspeccion industrial, almacenes y entornos de construccion.
- Investigacion en aprendizaje por refuerzo para robotica: el checkpoint `checkpoint.pt` y el `model_config.yaml` permiten reproducir el entrenamiento y ajustar la politica a nuevas morfologias o tareas.
- Benchmark de control corporal completo: el dataset TerrainData facilita la comparacion objetiva de politicas WBC bajo condiciones de terreno y comandos controlados.
- Prototipado de politicas de locomocion con AMP: la politica `amp_terrain.onnx` del Maker L01 sirve como base para experimentar con estados de marcha antes de escalar al control corporal completo.
- Integracion en simulacion: el runner de evaluacion del repositorio permite validar la politica en simulador antes de desplegarla en el robot fisico, reduciendo el riesgo de danos en hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio completo ocupa 0,9 GB, pero el tamano individual de los ficheros ONNX no se detalla en la informacion proporcionada.
- GPU recomendadas: no disponible. Al ser un modelo de control a alta frecuencia, se espera que requiera baja latencia, pero no se especifican modelos de GPU concretos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ONNX Runtime (formato nativo de los pesos); el repositorio de codigo incluye runner de evaluacion y controlador de despliegue. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este dominio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de control corporal completo para humanoides con los que establecer una comparacion de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- El modelo esta especializado en el Unitree G1 y, para la politica AMP, en el Maker L01; no es directamente transferible a otras morfologias sin reentrenamiento.
- No dispone de capacidades de lenguaje, vision ni audio; no debe evaluarse con metricas de modelos generativos.
- No se han publicado resultados de benchmarks en la informacion disponible, por lo que el rendimiento real frente a alternativas no puede verificarse.
- El despliegue en robot fisico conlleva riesgos de seguridad: es imprescindible validar en simulacion con el runner del repositorio antes de ejecutar en hardware.
- La licencia Apache-2.0 permite uso comercial, pero el usuario debe verificar el cumplimiento de las licencias de dependencias y del propio robot.
- El dataset TerrainData se distribuye como archivos tar sin comprimir de aproximadamente 29.000 ficheros, lo que puede complicar su gestion en sistemas de almacenamiento con limites de inodos.
- No se documentan sesgos en el sentido de modelos de lenguaje; sin embargo, el rendimiento puede degradarse ante condiciones fisicas no representadas en el entrenamiento (terrenos, cargas o perturbaciones fuera de distribucion).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-gigaai/GigaBrain-WBC-0.5
- Dataset de entrenamiento y benchmark: https://huggingface.co/datasets/open-gigaai/GigaBrain-WBC-0.5-TerrainData
- Paper en arXiv: https://arxiv.org/abs/2608.18234
- Pagina del proyecto: https://shepherd1226.github.io/gigabrain-wbc-0.5/
- Codigo y documentacion: https://github.com/open-gigaai/giga-brain-wbc
