# pgizemozdil/steercam-pegdrop-disc6-dp

## Resumen

SteerCamera PegDrop disc6 es un conjunto congelado de cinco políticas de difusión (Diffusion Policy) entrenadas con LeRobot para la tarea de inserción de clavija PegDrop del entorno ManiFeel, portado a MuJoCo Warp. El modelo resuelve el problema de inserción de una clavija de 12 x 8 mm en un orificio de 28 x 24 mm a partir de una única cámara externa orientable, sin propriocepción ni pose de cámara como entrada. Lo desarrolla el autor pgizemozdil en el contexto del artículo *Steer Your Camera* (en revisión), cuyo código vive en el repositorio steer-your-camera.

La relevancia del artefacto es metodológica: las cinco políticas (semillas 1000-1004) están congeladas y actúan como ensemble de referencia para un controlador de cámara guiado por incertidumbre que solo lee su distribución predictiva y nunca las actualiza. Cada miembro es una Diffusion Policy estándar con backbone ResNet-18 preentrenado en ImageNet, softmax espacial y U-Net condicional 1-D, entrenada durante 200.000 pasos sobre 50 demostraciones de teleoperación re-renderizadas desde 32 trayectorias aleatorias de cámara.

El repositorio ocupa 5,3 GB y contiene cinco checkpoints completos de LeRobot más un fichero de calibración opcional. No es un modelo de lenguaje ni un modelo de propósito general: es un artefacto de investigación en robótica, pensado para el simulador y no para un robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (LeRobot `diffusion`): ResNet-18 con BatchNorm y softmax espacial + U-Net condicional 1-D [512, 1024, 2048], DDPM 100 pasos (DDIM-10 en test) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de dos pasos de observación con una imagen RGB de 128 x 128 |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors` por miembro), layout LeRobot `pretrained_model` |
| Entrada | una imagen RGB de 128 x 128 de la cámara orientable, dos pasos de observación; sin propriocepción ni pose de cámara |
| Salida | chunk de acciones de 16 x 7 en el frame base del robot (traslación de punta en cm, rotación en 0,05 rad, objetivo de dedo), 8 ejecutadas |
| Miembros del ensemble | `member_0` ... `member_4` (semillas 1000-1004), checkpoint en el paso 200.000 |
| Entrenamiento | 200.000 pasos, batch 64, AdamW con lr 0,0001, recortes aleatorios [116, 116] |
| Datos | 50 demostraciones de teleoperación de ManiFeel re-renderizadas desde 32 trayectorias suaves de cámara sobre toda la ventana de vistas (regimen "wide") |
| Tamano del repo | 5,3 GB |

## Arquitectura y entrenamiento

Cada miembro es una Diffusion Policy con codificador visual ResNet-18 (pesos `ResNet18_Weights.IMAGENET1K_V1`, BatchNorm) seguido de softmax espacial, y un U-Net condicional 1-D con canales [512, 1024, 2048] que modela el chunk de acciones. El proceso generativo es DDPM con 100 pasos de entrenamiento y muestreo DDIM de 10 pasos en inferencia. La entrada son dos pasos de observación de una imagen RGB de 128 x 128; la salida es un chunk de 16 x 7 acciones del que se ejecutan 8.

El entrenamiento parte de 50 demostraciones de teleoperación de la tarea PegDrop de ManiFeel, replicadas y re-renderizadas desde 32 trayectorias aleatorias suaves de cámara que cubren toda la ventana de vistas (regimen "wide"). Se entrenan cinco políticas con semillas independientes durante 200.000 pasos con batch 64, AdamW a 0,0001 y recortes aleatorios de [116, 116]. El ensemble expone la varianza total logarítmica de los chunks como medida de incertidumbre (U), y el fichero `calibration.json` contiene la normalización z por fases de los términos de incertidumbre, aunque el benchmark usa U sin calibrar. Las políticas están congeladas: el controlador de cámara del artículo solo lee su distribución predictiva.

## Capacidades

- Generación de chunks de acciones de manipulación (16 x 7, 8 ejecutadas) para inserción de precisión en simulación.
- Percepción activa desde una única cámara externa orientable, sin propriocepción ni pose de cámara como entrada.
- Estimación de incertidumbre mediante ensemble: varianza total logarítmica de los chunks muestreados.
- Muestreo múltiple por miembro (`num_samples=8` en el ejemplo de uso) para obtener distribuciones de acción.
- Integración nativa con LeRobot (`DiffusionPolicy.from_pretrained` con `subfolder="member_k"`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Investigación en percepción activa: el ensemble sirve como referencia congelada para evaluar controladores de cámara guiados por incertidumbre, ya que el controlador solo lee la distribución predictiva y no modifica los pesos.
- Benchmark de inserción de precisión en simulación: la tarea PegDrop (clavija de 12 x 8 mm en orificio de 28 x 24 mm) permite medir tasas de éxito en condiciones nominales, con oclusión, desde altura elevada y con clutter.
- Estudio de robustez a oclusión: el resultado del 8 % de éxito con el zócalo ocluido frente al 64 % nominal cuantifica la sensibilidad del pipeline a la pérdida de información visual.
- Evaluación de ensembles en políticas de difusión: comparar la incertidumbre del ensemble con el error real de ejecución para validar estimadores de confianza en robótica.
- Reproducción de experimentos del artículo *Steer Your Camera*: los checkpoints congelados permiten replicar las celdas del benchmark con protocolo v2 sin reentrenar.
- Desarrollo de pipelines LeRobot: cada `member_k` es un `pretrained_model` completo (config, pesos, pre/post-procesadores, train_config), útil como plantilla para entrenar políticas de difusión con entrada visual única.
- Análisis de sensibilidad a la vista de cámara: al entrenarse con 32 trayectorias de cámara, el ensemble permite estudiar cómo varía la distribución de acciones según el punto de vista.

## Benchmarks y rendimiento

Resultados publicados en la model card para cámara fija (bloque de desarrollo, protocolo v2), 100 episodios por celda:

| Condicion | Tasa de exito |
|---|---|
| Nominal limpio | 64 % |
| Zocalo ocluido | 8 % |
| Inicio elevado | 50 % |
| Con clutter | 50 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo completo ocupa 5,3 GB y cada miembro es un checkpoint independiente de LeRobot con ResNet-18 y U-Net 1-D, por lo que un solo miembro cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no especificadas por el autor; por el tamano de los componentes (ResNet-18 + U-Net de hasta 2048 canales) es viable en RTX 3090, RTX 4090, A100 y H100, así como en GPUs de gama media para un único miembro.
- Cabe en GPU de consumo: sí, al menos un miembro individual; ejecutar los cinco en paralelo multiplica los requisitos.
- Opciones de despliegue: LeRobot (`lerobot[diffusion]>=0.6.1,<0.7`) y el paquete `steercam.policy.ensemble.PolicyEnsemble` del repositorio steer-your-camera; el simulador es MuJoCo Warp.
- Latencia y throughput: no disponibles. El muestreo usa DDIM de 10 pasos por chunk, lo que reduce el coste frente a los 100 pasos de DDPM del entrenamiento.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada. Como referencia cualitativa, este artefacto se sitúa en la familia de políticas de imitación visuales para manipulación (Diffusion Policy de LeRobot, ACT, VQ-BeT), pero no se han publicado comparaciones directas con ellas en la model card.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SteerCamera PegDrop disc6 | no disponible | no aplica (imagen 128 x 128, 2 pasos) | 64 % nominal, 8 % ocluido, 50 % inicio elevado, 50 % clutter | no disponible | Hugging Face (5,3 GB) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El propio autor indica que las políticas esperan el renderizado del simulador (MuJoCo Warp, escena de laboratorio texturizada) y la semántica de acciones del entorno; no están pensadas para pilotar un robot real.
- Dependencia crítica de la información visual: el éxito cae del 64 % nominal al 8 % con el zócalo ocluido, lo que evidencia una robustez muy limitada ante pérdida de visión.
- Sin propriocepción ni pose de cámara como entrada: toda la estimación de estado recae en una imagen RGB de 128 x 128 y dos pasos de observación.
- Licencia no disponible: no puede confirmarse el uso comercial; debe verificarse antes de cualquier aplicación en producción.
- Riesgo de alucinación en el sentido de acciones plausibles pero incorrectas: al ser un modelo generativo de acciones, puede producir chunks coherentes con la distribución entrenada pero inadecuados para el estado real.
- Entrenado sobre solo 50 demostraciones re-renderizadas: la cobertura de estados y vistas está acotada al regimen "wide" descrito.
- El ensemble está congelado por diseño; no debe esperarse adaptación en línea ni aprendizaje durante el despliegue.
- `calibration.json` es opcional y el benchmark usa U sin calibrar; los umbrales de incertidumbre deben tratarse con cautela si se reutilizan fuera del protocolo original.
- Sin datos publicados de sesgos, idiomas ni cuantizaciones; no aplica el análisis habitual de modelos de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pgizemozdil/steercam-pegdrop-disc6-dp
- Repositorio de código, tareas, datasets y benchmark: https://github.com/gizemozd/steer-your-camera
- Articulo: *Steer Your Camera* (en revision; sin enlace disponible en la informacion proporcionada)
- Tarea PegDrop de ManiFeel: referenciada en la model card; sin enlace directo disponible
- MuJoCo Warp: referenciado en la model card; sin enlace directo disponible
- LeRobot: referenciado como libreria (`lerobot[diffusion]>=0.6.1,<0.7`); sin enlace directo disponible
