# GeoPillars/GeoPillars

## Resumen

GeoPillars es un conjunto de checkpoints para detección 3D de coches sobre nubes de puntos LiDAR, asociado al artículo del mismo nombre. Lo publica el usuario GeoPillars en Hugging Face bajo licencia Apache 2.0 y está implementado sobre el stack OpenMMLab (mmdet3d 1.4.0, mmcv 2.1.0, mmengine 0.10.7, mmdet 3.3.0). No es un modelo de lenguaje ni un modelo generativo: es un detector de objetos 3D pensado para percepción de vehículos autónomos, con pipeline declarado `object-detection`.

El repositorio contiene los pesos de las siete ejecuciones descritas en el artículo, todas entrenadas sobre datos sintéticos de CARLA (123.364 escaneos, batch global de 112, 8 épocas). La propuesta central es GeoPillars con NGFM (un módulo de geometría, presumiblemente "Neural Geometric Feature Module" según la nomenclatura del autor) frente a la línea base CenterPoint, con ablaciones sobre la resolución de voxel (0,4 m frente a 0,2 m), el número de puntos por voxel (8 frente a 20), el factor de sobremuestreo (OSF=4 frente a OSF=1) y el uso del canal de intensidad.

La relevancia práctica es doble: por un lado, ofrece pesos de inferencia reproducibles para comparar un encoder de tipo pillar con backbone RepLK frente a CenterPoint en el mismo presupuesto computacional; por otro, documenta explícitamente una limitación importante del dataset sintético, ya que la intensidad LiDAR en CARLA es constante (1,0) en todos los escaneos, de modo que las ejecuciones etiquetadas como "intensity" reciben en realidad un canal constante y no intensidad real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector 3D sobre nubes de puntos LiDAR con encoder de tipo pillar; variante completa GeoPillars con NGFM y backbone RepLK; linea base CenterPoint |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de percepcion 3D, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en `.pth` de PyTorch, sin versiones cuantizadas publicadas) |
| Idiomas soportados | no aplica |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pth` (checkpoints de PyTorch con `state_dict` y `meta`) |
| Libreria | mmdet3d |
| Tamano del repositorio | 0,9 GB |
| Entrada | Nubes de puntos LiDAR, `xyzi` (con intensidad) o `xyz` segun la ejecucion |
| Epocas publicadas | 4 a 8 por ejecucion; `epoch_8.pth` es el modelo final |
| Dataset de entrenamiento | CARLA sintetico, 123.364 escaneos, batch global 112, 8 epocas |
| Tarea | Deteccion 3D de coches |

## Arquitectura y entrenamiento

El modelo se enmarca en la familia de detectores 3D basados en pillars, que proyectan la nube de puntos en una rejilla vertical y aplican un encoder 2D sobre el plano BEV. La variante completa, GeoPillars, incorpora el modulo NGFM y un backbone RepLK (receptivo grande por convolucion), segun se deduce de la ejecucion de ablacion `centerpoint_geopillar_encoder_replk_distributed`, que combina CenterPoint con el encoder GeoPillar y el backbone RepLK pero sin NGFM. El repositorio incluye siete configuraciones que permiten aislar la contribucion de cada componente: GeoPillars completo con entrada `xyzi` y `xyz`, CenterPoint en su presupuesto nativo (voxel de 0,2 m, 20 puntos por voxel, OSF=4), CenterPoint en el presupuesto de GeoPillars (0,4 m, 8 puntos, OSF=4) con y sin intensidad, una ablacion con la cabeza a OSF=1, y la combinacion CenterPoint + encoder GeoPillar + RepLK sin NGFM.

El entrenamiento se realizo exclusivamente sobre datos sinteticos generados en CARLA: 123.364 escaneos, batch global de 112 y 8 epocas. No se documenta en la informacion disponible el numero total de tokens ni la composicion detallada del dataset mas alla de su origen sintetico, ni si hubo etapas de ajuste fino supervisado adicionales. Un detalle tecnico relevante es que los checkpoints publicados contienen unicamente `state_dict` y `meta`, con el estado del optimizador, del scheduler y del message hub eliminado, por lo que sirven para inferencia y evaluacion pero no para reanudar el entrenamiento. Cada carpeta incluye ademas un `config.py` aplanado de mmengine con la configuracion exacta del run, aunque sus rutas `data_root` y `ann_file` apuntan al servidor de entrenamiento (`/home/ubuntu/data/Processed_data`) y deben sobrescribirse.

## Capacidades

- Deteccion 3D de coches sobre nubes de puntos LiDAR en coordenadas cartesianas.
- Procesamiento de nubes de puntos con o sin canal de intensidad, segun la ejecucion seleccionada.
- Encoder de tipo pillar con backbone RepLK en la variante completa, orientado a capturar contexto espacial amplio en BEV.
- Modulo NGFM en la variante GeoPillars completa, cuyo efecto puede aislarse frente a las ejecuciones sin NGFM.
- Inferencia y evaluacion sobre el stack OpenMMLab (mmdet3d 1.4.0), con soporte de entrenamiento distribuido en la configuracion original.
- No soporta generacion de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente perceptivo.
- No dispone de modo thinking, vision RGB, audio ni ninguna capacidad generativa.

## Casos de uso

- Percepcion de vehiculos en entornos simulados: el modelo se entrena y evalua sobre escaneos de CARLA, por lo que encaja en pipelines de validacion de algoritmos de conduccion autonoma en simulador antes de trasladarlos a datos reales.
- Benchmarking de encoders de tipo pillar: las siete ejecuciones permiten comparar GeoPillars con NGFM frente a CenterPoint bajo presupuestos identicos (0,4 m, 8 puntos por voxel, OSF=4) y aislar el efecto del encoder y del backbone RepLK.
- Estudio de eficiencia computacional: la reduccion de resolucion de voxel de 0,2 m a 0,4 m y de 20 a 8 puntos por voxel en las ejecuciones de CenterPoint permite medir el compromiso entre precision de deteccion y coste de procesamiento.
- Ablacion de componentes en investigacion: la ejecucion `centerpoint_geopillar_encoder_replk_distributed` sirve para evaluar por separado la contribucion del encoder GeoPillar y del backbone RepLK, sin el modulo NGFM.
- Analisis del canal de intensidad: al estar la intensidad fijada a 1,0 en CARLA, las ejecuciones con y sin intensidad permiten documentar el comportamiento del detector cuando el canal adicional no aporta informacion discriminativa.
- Reproduccion de resultados del articulo: los checkpoints de las epocas 4 a 8 permiten replicar las curvas de evaluacion y verificar la convergencia reportada por los autores.
- Generacion de datos sinteticos etiquetados para preentrenamiento: los pesos pueden emplearse como inicializacion en flujos de transferencia desde simulacion a datos reales, aunque esta aplicacion no esta validada en la informacion disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas numericas (mAP, NDS, precisión o recall) para ninguna de las siete ejecuciones, ni tablas comparativas con CenterPoint u otros detectores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio ocupa 0,9 GB, lo que sugiere que un solo checkpoint es considerablemente menor, pero no se detalla el peso por fichero ni el consumo en memoria durante la inferencia.
- GPU recomendadas: las ejecuciones llevan el sufijo `h100`, lo que indica que el entrenamiento se realizo en NVIDIA H100. Para inferencia no se especifica hardware minimo.
- Cabe en GPU de consumo: no confirmado. Por el tamano del repositorio y la naturaleza del detector (encoder 2D sobre BEV), es plausible que quepa en GPUs de consumo con suficiente memoria, pero la informacion disponible no lo verifica.
- Opciones de despliegue: el unico flujo documentado es el script de evaluacion de mmdet3d (`tools/test.py`) con el stack OpenMMLab fijado (mmengine 0.10.7, mmcv 2.1.0, mmdet 3.3.0, mmdet3d 1.4.0). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Presupuesto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GeoPillars (NGFM) | Detector 3D con encoder pillar + RepLK + NGFM | `xyzi` o `xyz` | Voxel 0,4 m, 8 pts/voxel, OSF=4 | Apache 2.0 | Pesos en Hugging Face (epocas 4-8) |
| CenterPoint (presupuesto GeoPillars) | Detector 3D con encoder pillar | `xyzi` o `xyz` | Voxel 0,4 m, 8 pts/voxel, OSF=4 | Apache 2.0 (en este repo) | Pesos en Hugging Face (epocas 4-8) |
| CenterPoint (presupuesto nativo) | Detector 3D con encoder pillar | `xyzi` | Voxel 0,2 m, 20 pts/voxel, OSF=4 | Apache 2.0 (en este repo) | Pesos en Hugging Face (epocas 4-8) |
| CenterPoint + GeoPillar encoder + RepLK (sin NGFM) | Detector 3D hibrido | no especificado | Mismo presupuesto | Apache 2.0 (en este repo) | Pesos en Hugging Face (epocas 4-8) |

La comparativa se limita a las variantes incluidas en el propio repositorio, ya que la informacion disponible no aporta metricas que permitan contrastar con implementaciones externas de CenterPoint u otros detectores LiDAR como PointPillars o VoxelNet.

## Limitaciones y advertencias

- Entrenamiento exclusivamente sintetico: todos los pesos se han entrenado sobre 123.364 escaneos de CARLA, sin validacion documentada sobre datasets reales como nuScenes, pese a que la etiqueta `nuscenes` aparece en el repositorio.
- Intensidad no informativa: la intensidad LiDAR en CARLA es constante (1,0) en todos los escaneos, por lo que las ejecuciones "intensity" reciben un canal constante. Cualquier conclusion sobre el valor de la intensidad extraida de estos pesos es invalida para datos reales.
- Checkpoints solo para inferencia: el optimizador, el scheduler y el estado del message hub estan eliminados, de modo que no es posible reanudar el entrenamiento desde estos ficheros.
- Configuracion no portable directamente: los `config.py` incluidos apuntan a rutas absolutas del servidor de entrenamiento (`/home/ubuntu/data/Processed_data`) y requieren sobrescribir `data_root` y `ann_file` antes de ejecutar.
- Dependencia estricta del stack OpenMMLab: requiere versiones fijadas de mmengine (0.10.7), mmcv (2.1.0), mmdet (3.3.0) y mmdet3d (1.4.0); combinaciones distintas pueden romper la carga de pesos.
- Alcance limitado a coches: la tarea declarada es deteccion 3D de coches, sin evidencia de clases adicionales (peatones, ciclistas, senalizacion).
- Sin metricas publicadas: no hay resultados de benchmarks en la informacion disponible, lo que impide evaluar la calidad real de los pesos sin ejecutar la evaluacion por cuenta propia.
- Riesgo de sesgo de simulador: los pesos pueden sobreajustarse a las caracteristicas estadisticas de CARLA (distribucion de escenas, sensores, condiciones meteorologicas) y degradarse en dominios reales.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero no se documentan patentes ni restricciones adicionales asociadas a las dependencias de OpenMMLab.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GeoPillars/GeoPillars
- Codigo fuente (`src/`): referenciado en la model card como parte del repositorio del proyecto, sin URL publica disponible en la informacion proporcionada.
- Articulo GeoPillars: no disponible en la informacion proporcionada.
- Repositorio OpenMMLab mmdetection3d: https://github.com/open-mmlab/mmdetection3d
- Repositorio mmengine: https://github.com/open-mmlab/mmengine
- Repositorio mmcv: https://github.com/open-mmlab/mmcv
- Repositorio mmdetection: https://github.com/open-mmlab/mmdetection
- Simulador CARLA: https://carla.org/
- Dataset nuScenes: https://www.nuscenes.org/
