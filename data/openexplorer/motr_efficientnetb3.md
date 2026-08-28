# OpenExplorer/motr_efficientnetb3

## Resumen

MOTR (Multi-Object Tracking with TRansformer) es un modelo de seguimiento de múltiples objetos en vídeo que trata el tracking como una propagación de consultas entre fotogramas. Fue propuesto originalmente por Megvii Research en 2021 y esta variante concreta, publicada por OpenExplorer en Hugging Face, sustituye el backbone original por EfficientNet-b3 y está optimizada para su despliegue en los chips de la serie Horizon J6 (J6M, J6P, J6B) mediante la herramienta OpenExplorer. El modelo resuelve el problema de asociación de detecciones a lo largo del tiempo de forma end-to-end, sin necesidad de post-procesados externos como los algoritmos de asociación húngara típicos de los trackers clásicos.

La arquitectura combina un backbone EfficientNet-b3 con un transformer deformable y un módulo de interacción de consultas (QueryInteractionModule) que propaga las consultas de detección entre fotogramas. El modelo acepta secuencias de imágenes de tamaño 800×1422 y produce cajas de detección junto con identificadores de pista (track IDs) para cada objeto. Su relevancia actual radica en que está preparado para inferencia en hardware embebido de bajo consumo, lo que lo hace adecuado para aplicaciones de visión por computador en tiempo real en dispositivos perimetrales.

La model card publicada incluye métricas de precisión (MOTA 0.5837 en el conjunto de validación J6M) y de rendimiento (latencia de 8.03 ms y 128.68 FPS en un solo núcleo con 8 hilos en el chip J6M), lo que demuestra su viabilidad para despliegue en tiempo real en plataformas Horizon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MOTR (transformer deformable) con backbone EfficientNet-b3 y QueryInteractionModule |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, procesa secuencias de imagenes) |
| Tipos de cuantizacion | no disponible (se menciona calibracion, QAT y HBM en las metricas, pero no se detallan los formatos) |
| Idiomas soportados | no disponible (modelo de vision, no textual) |
| Licencia | other (no se especifica el tipo exacto; se recomienda consultar con el autor) |
| Formato de pesos | no disponible (el repo tiene 1.2 GB; probablemente safetensors, pero no se confirma) |

## Arquitectura y entrenamiento

MOTR modela el seguimiento como una propagacion de consultas entre fotogramas. Las consultas de deteccion se pasan de un fotograma al siguiente mediante el `QueryInteractionModule` (QIM), que se encarga de asignar nuevas consultas a nuevos objetivos y de eliminar las consultas de objetivos que han desaparecido. El entrenamiento es conjunto, supervisando simultaneamente las perdidas de deteccion y de seguimiento.

El backbone es EfficientNet-b3 (con `include_top=False`, sin capa de clasificacion, sin bloques SE y activacion ReLU). Las caracteristicas del backbone alimentan directamente a `MotrHead`, que contiene un `MotrDeformableTransformer` con `d_model=256`, `num_queries=256`, `dim_feedforward=1024` y atencion deformable sobre `in_channels=[384]`. No hay neck separado. El post-procesado se realiza con `MotrPostProcess`.

La inferencia se divide en dos grafos: el grafo principal (backbone + head + post-process) y un subgrafo QIM (que opera sobre queries y features, sin imagenes). Ambos se exportan y compilan por separado mediante `deploy.py` y `deploy_qim.py`, y trabajan conjuntamente en tiempo de inferencia. El modelo fue entrenado con un intervalo de muestreo de 10 fotogramas entre imagenes de la secuencia.

## Capacidades

- Seguimiento de multiples objetos (MOT) en secuencias de video, devolviendo cajas delimitadoras y identificadores de pista unicos por objeto.
- Deteccion de objetos de una sola clase (el modelo esta configurado con 1 clase, aunque la arquitectura podria ampliarse).
- Propagacion de consultas entre fotogramas, lo que permite mantener la identidad de los objetos a lo largo del tiempo sin necesidad de algoritmos de asociacion externos.
- Inferencia en tiempo real en hardware Horizon J6 (J6M, J6P) con latencias de 5-8 ms para el grafo principal y 0.36-0.37 ms para el subgrafo QIM.
- Soporte para cuantizacion (calibracion, QAT y HBM) segun las metricas reportadas, aunque no se detallan los formatos exactos.
- No soporta procesamiento de lenguaje natural ni vision multimodal; es exclusivamente un modelo de tracking visual.

## Casos de uso

- Vigilancia y seguridad perimetral: el modelo puede seguir a personas o vehiculos en secuencias de camaras fijas, manteniendo identidades a lo largo del tiempo. Su baja latencia (8 ms en J6M) permite analisis en tiempo real en dispositivos embebidos.
- Conteo de objetos en entornos comerciales: en tiendas o almacenes, puede contar cuantos clientes o unidades entran y salen, usando los track IDs para evitar dobles conteos.
- Analisis de trafico en intersecciones: seguimiento de vehiculos en video de camaras de trafico para medir flujos, tiempos de espera o detectar infracciones, con la ventaja de poder desplegarse en hardware de bajo coste.
- Robotica movil: un robot equipado con un chip Horizon J6 puede usar este modelo para seguir objetos en su entorno y planificar trayectorias basandose en la posicion y velocidad de los objetivos.
- Inspeccion industrial en lineas de produccion: seguimiento de piezas o productos en una cinta transportadora para detectar anomalias o contar unidades, con integracion en sistemas de control en tiempo real.
- Investigacion academica en tracking: sirve como base para experimentar con backbones alternativos (EfficientNet-b3 en lugar del ResNet original) y para estudiar el comportamiento del QueryInteractionModule en diferentes condiciones.

## Benchmarks y rendimiento

La model card proporciona la siguiente metrica de precision para el conjunto de validacion J6M:

| Metrica | float | calibracion | qat | hbm |
|---|---|---|---|---|
| MOTA | 0.5837 | 0.5704 | 0.5799 | 0.5767 |

No se proporcionan otros benchmarks (como MOT17, MOT20 o comparaciones con otros trackers). El rendimiento en hardware Horizon se resume en la siguiente tabla (medido con 8 hilos en un solo nucleo para FPS, y un solo nucleo y un solo hilo para latencia; memoria como pico de uso DDR):

| March | Metrica | latencia (ms) | fps | memoria (MB) |
|---|---|---|---|---|
| J6M | grafo principal | 8.03 | 128.68 | 65.30 |
| J6M | QIM | 0.37 | 5120.87 | 6.80 |
| J6P | grafo principal | 5.81 | 695.38 | 71.90 |
| J6P | QIM | 0.36 | 10348.73 | 7.00 |
| J6B | - | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks comparativos con otros modelos MOT en la informacion disponible.

## Requisitos de hardware

- El modelo esta disenado para desplegarse en los chips Horizon J6 (J6M, J6P, J6B). No se proporcionan requisitos de VRAM para GPUs convencionales.
- En J6M, el grafo principal consume 65.30 MB de DDR y el subgrafo QIM 6.80 MB; en J6P, 71.90 MB y 7.00 MB respectivamente.
- La latencia del grafo principal es de 8.03 ms en J6M y 5.81 ms en J6P (medida en un solo nucleo, un solo hilo). El QIM anade 0.37 ms y 0.36 ms respectivamente.
- El rendimiento en J6B no esta disponible.
- Para probar el modelo en otro hardware (por ejemplo, GPUs NVIDIA), no se proporcionan instrucciones ni requisitos. La compilacion esta pensada para el toolchain de Horizon (hbdk4-compiler, horizon_plugin_pytorch).
- El despliegue se realiza mediante los scripts `deploy.py` y `deploy_qim.py` del repositorio, que exportan los grafos por separado.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos de tracking como TrackFormer, TransTrack o el MOTR original con backbone ResNet. La model card indica que esta variante utiliza EfficientNet-b3 en lugar del backbone del repositorio oficial, pero no se ofrecen datos de rendimiento comparativos en los mismos conjuntos de datos. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- La licencia es "other", lo que implica que los terminos de uso no estan claramente definidos. Se recomienda contactar con el autor antes de cualquier uso comercial.
- El modelo esta entrenado para una sola clase (probablemente "persona" o "vehiculo", aunque no se especifica). No es adecuado para tareas de deteccion multiclase sin reentrenamiento.
- No se proporciona informacion sobre sesgos, robustez ante condiciones adversas (oclusiones, iluminacion cambiante) ni sobre el conjunto de datos de entrenamiento exacto (aunque se menciona MOT17 en el contexto del toolchain Horizon).
- La metrica MOTA de 0.5837 es moderada y puede no ser suficiente para aplicaciones de alta precision sin afinamiento adicional.
- El modelo esta optimizado exclusivamente para hardware Horizon J6. Su ejecucion en GPUs u otros aceleradores requeriria adaptaciones y probablemente recompilacion.
- No se documenta el formato de los pesos (safetensors, ONNX, etc.), lo que puede dificultar la integracion en entornos fuera del ecosistema Horizon.
- El repositorio de Hugging Face tiene 0 descargas y 0 likes, lo que sugiere que es un modelo reciente o poco validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/OpenExplorer/motr_efficientnetb3
- Repositorio oficial (MOTR, Megvii Research): https://github.com/megvii-research/MOTR
- Paper (arXiv): https://arxiv.org/pdf/2105.03247
- Documentacion de despliegue en chips J6: https://developer.horizon.auto/blog/14093
- Guia de AI Benchmark del toolchain Horizon: https://doc.oe.horizon.auto/en/guide/model_deployment/board_deployment/ai_benchmark.html
- Vista general del toolchain Horizon (menciona motr_efficientnetb3_mot17): https://doc.oe.horizon.auto/3.2.0/en/guide/advanced_content/hat/introduction.html
