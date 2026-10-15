# kiroaiseoul/NAJY_act_task05_c100_gist30_solo_16D_60k_s1000

## Resumen

NAJY_act_task05_c100_gist30_solo_16D_60k_s1000 es un checkpoint de politica robotica basada en ACT (Action Chunking Transformer) publicado por el usuario kiroaiseoul en Hugging Face. No es un modelo de lenguaje: es un modelo de control visomotor entrenado con la libreria LeRobot, orientado a la suite de tareas del laboratorio Mobile AI de Trossen Robotics. El checkpoint corresponde al paso 60.000 de la ejecucion `t44_task05_c100_gist30_solo_60k_s1000` y esta especializado en una unica tarea (task05) con un espacio de estado y accion de 16 dimensiones.

El modelo ocupa 51.689.104 parametros (aproximadamente 0,2 GB en el repositorio) y consume tres flujos de imagen a 480x640 (camara alta, muneca izquierda y muneca derecha) junto con un vector de estado de 16 valores, produciendo un vector de accion tambien de 16 dimensiones. Su relevancia es acotada y muy especifica: sirve como artefacto de analisis y evaluacion dentro de una comparativa de checkpoints ACT, no como modelo de proposito general.

El propio autor indica en la model card que la subida tiene fines de analisis y puntuacion, y que es independiente de la seleccion final de candidatos para despliegue en robot real. El repositorio incluye el hash SHA-256 del fichero `model.safetensors` para verificacion de integridad y un fichero `multi_manifest.json` que las herramientas de evaluacion leen para obtener los flags del checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), implementacion de LeRobot |
| Parametros totales | 51.689.104 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (politica robotica; no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en precision completa) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, SHA-256 `effc6e4e4438c7118b599615c660909235be257bc79ba51a33004979bebd43e9`) |
| Libreria | lerobot |
| Pipeline | robotics |
| Dimension de `observation.state` | 16 |
| Dimension de `action` | 16 |
| Entradas visuales | `observation.images.cam_high` [3, 480, 640], `observation.images.cam_left_wrist` [3, 480, 640], `observation.images.cam_right_wrist` [3, 480, 640] |
| Tamano del repositorio | 0,2 GB |
| Run de entrenamiento | `t44_task05_c100_gist30_solo_60k_s1000`, paso 60000 |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-14 |
| Fecha de actualizacion | 2026-10-14 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una arquitectura de politica visomotora disenada para manipulacion robotica. Predice un bloque o *chunk* de acciones futuras en lugar de una sola accion por paso, lo que reduce el error de compounding y permite ejecutar el chunk a mayor frecuencia que la inferencia del modelo. La implementacion de LeRobot combina un codificador visual (tipo ResNet) para cada camara con un transformer codificador-decodificador y un componente CVAE que modela la variabilidad multimodal de las demostraciones humanas. El modelo aqui descrito tiene 51,7 M de parametros y trabaja con un vector de estado y otro de accion de 16 dimensiones, lo que sugiere un espacio de control de un solo brazo o de una base movil con varios grados de libertad agregados.

La informacion disponible no detalla la composicion del dataset de entrenamiento, el numero de tokens (no aplica), episodios de demostracion, ni el uso de RLHF, DPO o tecnicas de refinamiento por preferencias. Lo unico documentado es que se trata de un entrenamiento de 60.000 pasos con semilla 1000 sobre la tarea 05, ejecutado en el equipo identificado como DGX_1, y que forma parte de una serie de 11 etapas del laboratorio Mobile AI. El etiquetado `gist30` y `c100` en el nombre del run no viene explicado en la model card, por lo que no se debe inferir su significado.

El autor hace referencia al documento `docs/mobile_base_investigation.md` (seccion 94) del proyecto `trossen-ai-simulation` como contexto de investigacion sobre la base movil. El repositorio se estructura como un `pretrained_model` estandar de LeRobot, de modo que puede cargarse directamente en herramientas como `stage_cond_diag.py`.

## Capacidades

- Generacion de acciones de control robotico: dado un estado de 16 dimensiones y tres imagenes de 480x640, produce un vector de accion de 16 dimensiones.
- Prediccion por chunks de acciones, lo que permite ejecutar varias acciones por inferencia y amortiguar el coste computacional.
- Fusion visomotora multimodal: integra una vista cenital y dos vistas de muneca (izquierda y derecha) para estimar la accion.
- Especializacion en una unica tarea (task05) dentro de una suite de 11 etapas; no se documenta capacidad de generalizacion a otras tareas.
- Compatibilidad con el ecosistema LeRobot para carga, evaluacion y fine-tuning.
- Verificacion de integridad mediante SHA-256 y lectura de flags desde `multi_manifest.json`.
- No dispone de tool calling, function calling, agentes, modo de razonamiento explicito, vision semantica de proposito general, audio ni capacidades multilingues, ya que no es un modelo de lenguaje.

## Casos de uso

- Control de manipulacion en la tarea 05: el checkpoint se carga en un robot compatible y ejecuta la politica entrenada para esa tarea concreta, usando estado de 16D y las tres camaras como entrada.
- Evaluacion comparativa de checkpoints: al estar publicado con `multi_manifest.json` y una estructura `pretrained_model` estandar, se puede pasar directamente a herramientas de diagnostico como `stage_cond_diag.py` para medir el comportamiento condicionado por etapa.
- Analisis de especializacion frente a politicas multi-etapa: sirve como referencia de un modelo entrenado en una sola tarea frente a versiones de 11 etapas del mismo autor, lo que permite estudiar el equilibrio entre especializacion y cobertura.
- Investigacion en action chunking: permite reproducir experimentos sobre tamano de chunk, frecuencia de replanificacion y latencia efectiva de control en un modelo de solo 51,7 M de parametros.
- Estudio de fusion de multiples camaras: las tres vistas (alta y dos de muneca) permiten analizar la contribucion de cada punto de vista en tareas de agarre y colocacion.
- Punto de partida para fine-tuning con LeRobot: el checkpoint puede reentrenarse sobre datos propios de una tarea similar con un coste de computo bajo, dado su tamano reducido.
- Pruebas de verificacion de cadena de custodia en pipelines de robotica: el hash SHA-256 publicado facilita la validacion de artefactos en pipelines de CI para modelos de robotica.
- Validacion en simulacion antes de despliegue: al proceder de una investigacion sobre base movil en simulacion, puede emplearse para contrastar politica simulada frente a politica real en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, metricas de error de accion, ni comparaciones numericas con otros checkpoints. El repositorio registra 0 descargas y 0 likes, por lo que tampoco existen evaluaciones de terceros publicadas en el momento de redactar esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP32 ocupan aproximadamente 207 MB (51.689.104 parametros x 4 bytes) y en FP16 alrededor de 103 MB. Sumando activaciones de tres entradas de 480x640 y el codificador visual, una estimacion razonable de consumo total es de 1 a 2 GB en FP32, siempre menor en FP16.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente. Se ha entrenado en un sistema DGX, pero para inferencia bastan tarjetas de gama media como RTX 3060, RTX 4060 o superiores.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna, e incluso en GPU integradas con memoria compartida suficiente.
- Despliegue en robot embebido: el tamano de 51,7 M de parametros es compatible con plataformas tipo NVIDIA Jetson Orin para inferencia en el propio robot, aunque no se dispone de mediciones confirmadas.
- Inferencia en CPU: tecnicamente viable por el reducido numero de parametros, pero no se documentan latencias y probablemente no cumpla los requisitos de frecuencia de control de un bucle cerrado.
- Opciones de despliegue: libreria LeRobot (PyTorch) como via principal; exportacion a ONNX o TensorRT no esta documentada. `vLLM`, `llama.cpp`, `Ollama` y `TGI` no aplican, ya que son runtimes para modelos de lenguaje.
- Latencia y throughput: no disponible. No se publican mediciones de tiempo de inferencia ni de frecuencia de control alcanzable.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension estado/accion | Etapas cubiertas | Pasos de entrenamiento | Licencia |
|---|---|---|---|---|---|
| NAJY_act_task05_c100_gist30_solo_16D_60k_s1000 (este) | 51.689.104 | 16 / 16 | 1 (task05) | 60.000 | apache-2.0 |
| kiroaiseoul/NAJY_act_all11_c100_gist30_dq_27D_60k_s1000 | no disponible | 27 / 27 | 11 | 60.000 | no disponible |
| kiroaiseoul/NAJY_act_all11_hot_27D_120k_s1000 | no disponible | 27 / 27 | 11 | 120.000 | no disponible |
| ACT de referencia (LeRobot) | no disponible | configurable | segun dataset | segun dataset | apache-2.0 (implementacion) |

Los dos checkpoints comparables pertenecen al mismo autor y a la misma serie NAJY, con la diferencia de que cubren las 11 etapas y operan con 27 dimensiones de estado y accion en lugar de 16. El autor indica en la model card del checkpoint de 120.000 pasos que, en evaluacion offline, esa semilla se comporta mejor en las etapas de locomocion. No se dispone de datos comparativos de rendimiento del checkpoint de 60.000 pasos aqui descrito.

## Limitaciones y advertencias

- El autor indica explicitamente que la subida es para analisis y puntuacion, y que no equivale a la confirmacion de un candidato de despliegue en robot real.
- Modelo especializado en una sola tarea (task05); no hay evidencia de generalizacion a otras tareas ni a entornos no vistos.
- Espacio de accion y estado de 16 dimensiones: no es directamente compatible con robots que requieran otra dimensionalidad sin adaptacion.
- No se documenta la composicion del dataset de entrenamiento, el numero de episodios ni el metodo de recogida de datos, lo que dificulta evaluar sesgos de demostracion o cobertura de situaciones.
- Riesgo de sobreajuste al entorno de simulacion de origen: la referencia a `mobile_base_investigation.md` sugiere trabajo en simulacion, por lo que la transferencia a robot real (sim2real) no esta garantizada.
- Sensibilidad a la calibracion de camaras: la politica depende de tres vistas concretas a 480x640; cambios en montaje, iluminacion o calibracion pueden degradar el comportamiento.
- No dispone de benchmarks publicos ni evaluaciones independientes; cualquier afirmacion de rendimiento carece de respaldo numerico.
- Licencia apache-2.0: permite uso comercial y modificacion con atribucion, pero el autor no ofrece garantias de idoneidad ni soporte.
- Fechas de creacion y actualizacion registradas como 2026-10-14 en los metadatos del repositorio.
- El nombre del run incluye etiquetas (`c100`, `gist30`, `solo`) cuyo significado no se explica en la model card; no deben interpretarse sin confirmacion del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kiroaiseoul/NAJY_act_task05_c100_gist30_solo_16D_60k_s1000
- Checkpoint relacionado de 11 etapas (60.000 pasos, 27D): https://huggingface.co/kiroaiseoul/NAJY_act_all11_c100_gist30_dq_27D_60k_s1000
- Checkpoint relacionado de 11 etapas (120.000 pasos, 27D): https://huggingface.co/kiroaiseoul/NAJY_act_all11_hot_27D_120k_s1000
- Implementacion ACT en LeRobot: https://github.com/huggingface/lerobot
- Articulo original de ACT (Action Chunking with Transformers): https://arxiv.org/abs/2304.13705
