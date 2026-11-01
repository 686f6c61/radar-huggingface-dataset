# raulcastar/mare-lunar-baselines

## Resumen

MARE Lunar Rover Baselines es una coleccion de modelos de percepcion visual entrenados sobre el dataset sintetico MARE Lunar Rover Dataset, generado en el simulador open source MARE-Lunar-Simulator. El autor es Raul Castilla-Arquillo (usuario `raulcastar`), en el contexto del paper MARE (arXiv:2610.28465), en colaboracion con Miguel Olivares-Mendez. El repositorio agrupa once variantes de modelos que cubren tres tareas: segmentacion semantica de objetos, segmentacion semantica de sombras y estimacion de profundidad monoculo.

El objetivo es proporcionar lineas base reproducibles para percepcion en robots lunares: deteccion de obstaculos y rocas, segmentacion de sombras (criticas en iluminacion lunar de bajo angulo solar) y profundidad metrica a partir de una sola imagen. Todos los modelos se entrenaron con los mapas 000-005 del simulador, se seleccionaron con el mapa 006 y se evaluaron con el mapa 007, terreno nunca visto durante el entrenamiento.

La relevancia es doble: por un lado, ofrece pesos preentrenados ligeros y faciles de integrar mediante `segmentation-models-pytorch` y `transformers`; por otro, publicado bajo licencias permisivas (CC BY 4.0 para la mayoria de pesos), sirve como punto de partida para investigacion en robistica planetaria y para pipelines de autonomia que necesitan estimar terreno y obstaculos sin datos reales de la Luna.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net (encoder ResNet-34), DeepLabV3+ (encoder ResNet-50), SegFormer-B2 (encoder MiT-B2) y Depth Anything V2-Small fine-tuneado |
| Parametros totales | no disponible (no se publican recuentos por variante) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de vision) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion estandar de PyTorch, no documentada por el autor) |
| Idiomas soportados | no disponible (modelos de vision, sin procesamiento de lenguaje) |
| Licencia | mixta: CC BY 4.0 para U-Net, DeepLabV3+ y profundidad; licencia NVIDIA SegFormer (uso no comercial) para las variantes SegFormer |
| Formato de pesos | safetensors (`model.safetensors` + `config.json` por carpeta) |
| Tamano del repositorio | 1,1 GB |
| Entrada | imagenes RGB (`rgb_central`, `rear_rgb`) o imagen SPAD (`spad`), redimensionadas a `input_size` y normalizadas con media y desviacion tipica de ImageNet |
| Salida | mascaras de segmentacion por clase o mapa de profundidad metrico en metros (`10 / predicted_depth`) |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura unica, sino un conjunto de lineas base sobre tres familias de segmentacion y un modelo de profundidad. Para objetos y sombras se emplean U-Net con encoder ResNet-34 preentrenado en ImageNet, DeepLabV3+ con encoder ResNet-50 y SegFormer-B2 con encoder MiT-B2; las tres variantes reciben imagen RGB a la resolucion nativa del dataset. La tarea de profundidad usa Depth Anything V2-Small fine-tuneado para profundidad metrica, de modo que la salida se interpreta en metros. Existe ademas una rama que consume imagenes SPAD (sensor de bajo nivel de luz) para objetos y sombras.

El entrenamiento se realizo exclusivamente sobre datos sinteticos del simulador MARE, con particion por mapas: mapas 000-005 para entrenamiento, mapa 006 para seleccion y mapa 007 para test. No se documentan en la informacion disponible el numero de imagenes, el numero de pasos de entrenamiento, la composicion exacta del dataset ni el uso de tecnicas de refinamiento como RLHF o DPO (no aplicables en vision). Cada `config.json` incluye nombres de clase, tamano de entrada, IoU de test por clase, ajustes de entrenamiento, commit de codigo y revision del dataset, lo que facilita la reproducibilidad.

## Capacidades

- Segmentacion semantica de objetos del terreno lunar (rocas, obstaculos y elementos del rover) a partir de imagen RGB central o trasera.
- Segmentacion semantica de sombras, con especial rendimiento en la camara trasera y en la vista central.
- Estimacion de profundidad monoculo metrica (salida en metros) mediante Depth Anything V2-Small fine-tuneado.
- Procesamiento de imagenes SPAD para objetos y sombras, orientado a sensores de bajo nivel de luz.
- Inferencia por lotes sobre carpetas de imagenes mediante el comando `mare_baselines.predict` del repositorio de entrenamiento.
- Integracion directa con `segmentation-models-pytorch` y `transformers` (`AutoModelForDepthEstimation`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: son modelos puramente visuales.

## Casos de uso

- Deteccion de obstaculos en navegacion de rover: la variante `object` (U-Net/ResNet-34, mIoU 0.596) segmenta rocas y elementos del terreno sobre la camara central, lo que permite generar mapas de coste locales para planificacion de trayectorias.
- Analisis de sombras para autonomia solar: las variantes `shadow` (mIoU 0.854) y `rear_shadow` (mIoU 0.666) identifican regiones en sombra, utiles para estimar irradiancia y planificar la recarga de baterias en misiones lunares.
- Percepcion trasera para maniobras de reversion: `rear_object` (mIoU 0.666) cubre la camara trasera, necesaria cuando el rover retrocede o gira en terreno irregular.
- Estimacion de profundidad para mapeado 3D: el modelo de profundidad (AbsRel 0.027, RMSE 1.63 m) permite reconstruir nubes de puntos a partir de una sola imagen RGB, reduciendo la dependencia de LiDAR o camaras estereo.
- Investigacion con sensores SPAD: las variantes `spad_object` (mIoU 0.484) y `spad_shadow` (mIoU 0.709) sirven de linea base para experimentos de percepcion en condiciones de iluminacion extrema.
- Benchmarking de nuevos modelos de percepcion planetaria: al fijar particion por mapas y metricas por clase, el repositorio ofrece una referencia reproducible para comparar arquitecturas de segmentacion en dominio lunar.
- Prototipado rapido en simulacion: con pesos ligeros y carga via `safetensors`, se pueden integrar en bucles de simulacion MARE para validar pipelines de autonomia antes de desplegar en hardware.

## Benchmarks y rendimiento

Resultados publicados en la model card, evaluados sobre el mapa 007 (terreno no visto en entrenamiento), a la resolucion nativa del dataset.

| Carpeta | Tarea | Modelo | Entrada | Metrica de test |
|---|---|---|---|---|
| `depth` | profundidad monoculo | Depth Anything V2-Small fine-tuneado | `rgb_central` | AbsRel 0.027, RMSE 1.63 m, δ<1.25 0.984 |
| `object` | objetos | U-Net, ResNet-34 (ImageNet) | `rgb_central` | mIoU 0.596 |
| `object_deeplabv3plus` | objetos | DeepLabV3+, ResNet-50 (ImageNet) | `rgb_central` | mIoU 0.570 |
| `object_segformer` | objetos | SegFormer-B2, MiT-B2 (ImageNet) | `rgb_central` | mIoU 0.586 |
| `rear_object` | objetos | U-Net, ResNet-34 (ImageNet) | `rear_rgb` | mIoU 0.666 |
| `rear_shadow` | sombras | U-Net, ResNet-34 (ImageNet) | `rear_rgb` | mIoU 0.849 |
| `shadow` | sombras | U-Net, ResNet-34 (ImageNet) | `rgb_central` | mIoU 0.854 |
| `shadow_deeplabv3plus` | sombras | DeepLabV3+, ResNet-50 (ImageNet) | `rgb_central` | mIoU 0.804 |
| `shadow_segformer` | sombras | SegFormer-B2, MiT-B2 (ImageNet) | `rgb_central` | mIoU 0.801 |
| `spad_object` | objetos | U-Net, ResNet-34 (ImageNet) | `spad` | mIoU 0.484 |
| `spad_shadow` | sombras | U-Net, ResNet-34 (ImageNet) | `spad` | mIoU 0.709 |

No se han publicado comparaciones con modelos externos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Por el tamano de los encoders (ResNet-34, ResNet-50, MiT-B2 y Depth Anything V2-Small), la inferencia cabe holgadamente en GPUs de consumo; se estima un rango de 1 a 4 GB en FP32 segun variante, aunque el autor no publica cifras.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para inferencia comoda; RTX 3060/4060 o superiores son suficientes. Para entrenamiento o lotes grandes, A100 o H100 no son necesarias pero aceleran el proceso.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas modernas con 4 GB o mas.
- Opciones de despliegue: `segmentation-models-pytorch` + `safetensors` (via `huggingface_hub`), `transformers` para el modelo de profundidad, y el contenedor Docker del repositorio MARE-Dataset-Baselines con `docker compose run --rm train mare_baselines.predict`. No se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI (no aplicables a vision).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MARE Lunar Rover Baselines (este) | Segmentacion de objetos/sombras y profundidad lunar | no disponible | no aplica | mIoU 0.484-0.854; AbsRel 0.027 | Mixta (CC BY 4.0 y NVIDIA SegFormer) | HuggingFace, 0 descargas |
| Depth Anything V2-Small (base) | Profundidad monoculo general | no disponible | no aplica | no disponible en esta ficha | Apache 2.0 (base) | HuggingFace |
| U-Net / ResNet-34 (ImageNet) | Segmentacion generica | no disponible | no aplica | no disponible en esta ficha | depende del repo `segmentation-models-pytorch` | Amplia |
| SegFormer-B2 (NVIDIA) | Segmentacion generica | no disponible | no aplica | no disponible en esta ficha | NVIDIA SegFormer (no comercial) | HuggingFace / GitHub |

La comparativa es limitada: no se dispone de benchmarks de los modelos base en el mismo dominio lunar, por lo que no es posible una comparacion cuantitativa directa. La ventaja principal de este repositorio es la especializacion en dominio lunar sintetico y la particion por mapas reproducible.

## Limitaciones y advertencias

- Entrenamiento exclusivamente con datos sinteticos del simulador MARE: el rendimiento en imagenes reales de la Luna no esta validado y puede degradarse por la brecha sim2real.
- El modelo de profundidad se evalua con RMSE de 1,63 m, error relevante para maniobras de precision a corta distancia.
- Las variantes SegFormer heredan la licencia NVIDIA SegFormer, que restringe el uso comercial; solo U-Net, DeepLabV3+ y profundidad son CC BY 4.0.
- La licencia global del repositorio es "other/mixed", por lo que es necesario revisar la licencia de cada carpeta antes de un despliegue en produccion.
- Los modelos SPAD presentan el rendimiento mas bajo (mIoU 0.484 en objetos), lo que limita su uso como unica fuente de percepcion.
- No hay informacion sobre sesgos, composicion del dataset ni cobertura de condiciones de iluminacion; el sesgo del simulador se transfiere a los pesos.
- Riesgo de alucinacion en el sentido de falsos positivos o negativos en la segmentacion, especialmente en clases poco representadas.
- No se documentan idiomas, tool calling ni capacidades de agente: no son aplicables.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que implica poca validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/raulcastar/mare-lunar-baselines
- Dataset: https://huggingface.co/datasets/raulcastar/mare-lunar-rover-dataset
- Simulador MARE: https://github.com/raulcastar/MARE-Lunar-Simulator
- Codigo de entrenamiento y evaluacion: https://github.com/raulcastar/MARE-Dataset-Baselines
- Paper MARE: https://arxiv.org/abs/2610.28465
- Depth Anything V2-Small (base): https://huggingface.co/depth-anything/Depth-Anything-V2-Small-hf
- segmentation-models-pytorch: https://github.com/qubvel-org/segmentation_models.pytorch
- Licencia NVIDIA SegFormer: https://github.com/NVlabs/SegFormer/blob/master/LICENSE
