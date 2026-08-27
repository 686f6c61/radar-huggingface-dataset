# OpenExploer/motr_efficientnetb3

## Resumen

MOTR (Multi-Object Tracking with Transformers) es un modelo de seguimiento de objetos en video que trata el tracking como una propagación de consultas (queries) entre frames. Desarrollado originalmente por Megvii Research, esta versión con backbone EfficientNet-b3 ha sido adaptada por OpenExploer para su despliegue en los chips Horizon J6 (J6M, J6P, J6B), un hardware especializado en inferencia de visión por computador. El modelo resuelve el problema de asociación de objetos a lo largo del tiempo sin necesidad de post-procesados complejos, ya que el módulo `QueryInteractionModule` gestiona la aparición, desaparición y continuidad de las identidades.

La arquitectura combina un backbone EfficientNet-b3 (sin capa de clasificación) con un transformer deformable de 256 queries y un módulo de interacción entre frames. El modelo acepta secuencias de imágenes de tamaño 800×1422 y produce cajas de detección junto con identificadores de track por frame. Su relevancia actual radica en que ofrece un rendimiento en tiempo real en hardware embebido: en el chip J6M alcanza 128.68 FPS con una latencia de 8.03 ms, y en el J6P sube a 695.38 FPS, lo que lo hace adecuado para aplicaciones de videovigilancia, robótica y conducción autónoma. El repositorio de HuggingFace pesa 1.2 GB, aunque no se especifica el número total de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MOTR (transformer deformable) con backbone EfficientNet-b3, head `MotrHead` y módulo `QueryInteractionModule` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | calibration, QAT, HBM (segun documentacion de Horizon) |
| Idiomas soportados | no disponible (modelo de vision, sin soporte de lenguaje) |
| Licencia | other (segun HuggingFace) |
| Formato de pesos | no disponible (el repo contiene 1.2 GB, pero no se indica el formato) |

## Arquitectura y entrenamiento

MOTR se basa en la idea de propagar consultas de deteccion a traves de los frames. El backbone EfficientNet-b3 extrae caracteristicas de cada imagen (con `include_top=False`, sin bloque SE y activacion ReLU), que alimentan directamente al `MotrHead`, compuesto por un `MotrDeformableTransformer` con `d_model=256`, `num_queries=256`, `dim_feedforward=1024` y atencion deformable. No hay neck separado; las caracteristicas del backbone entran directamente al head. El `QueryInteractionModule` (QIM) se encarga de interactuar entre frames: las queries de objetos existentes se propagan, las nuevas reciben queries frescas y las desaparecidas se eliminan. El entrenamiento supervisa conjuntamente las perdidas de deteccion y de tracking, aunque no se proporcionan detalles sobre el dataset ni el numero de epocas.

La inferencia se divide en dos grafos: el grafo principal (backbone + head + post-procesado) y un subgrafo QIM que opera sobre queries y caracteristicas en memoria DDR. Ambos se exportan y compilan por separado con las herramientas HEAL de Horizon (heal 0.0.2, hbdk4-compiler 4.11.11, horizon_plugin_pytorch 3.3.10). El modelo original de Megvii usa un backbone diferente (probablemente ResNet), pero esta version lo sustituye por EfficientNet-b3 para mejorar la eficiencia en el hardware objetivo.

## Capacidades

- Deteccion de objetos en cada frame de una secuencia de video, devolviendo cajas delimitadoras y puntuaciones de confianza.
- Seguimiento multi-objeto (MOT) con asignacion de identificadores de track consistentes a lo largo del tiempo.
- Gestion automatica de aparicion y desaparicion de objetos gracias al `QueryInteractionModule`.
- Procesamiento de secuencias de imagenes con un intervalo de muestreo de 10 frames (configuracion por defecto).
- Salida de 256 queries por frame, con una sola clase (objeto generico).
- Optimizado para inferencia en tiempo real en chips Horizon J6 (J6M, J6P), con soporte de cuantizacion (calibration, QAT, HBM) para reducir el uso de memoria y mejorar la latencia.
- No incluye capacidades de lenguaje, tool calling, agentes ni razonamiento multimodal; es un modelo puramente visual para tracking.

## Casos de uso

- Videovigilancia en tiempo real: el modelo puede seguir a personas o vehiculos a traves de multiples camaras, manteniendo identidades estables. Con 128 FPS en el chip J6M, es viable para analisis de flujos en directo sin perder frames.
- Analisis de trafico y conteo de vehiculos: en intersecciones o autopistas, MOTR asigna IDs a cada vehiculo y permite medir tiempos de paso, velocidades o densidades. La baja latencia (8 ms) facilita la integracion en sistemas de gestion de trafico.
- Robotica movil: un robot equipado con el chip J6 puede usar el modelo para seguir objetos en su entorno, por ejemplo, para tareas de seguimiento de personas o de manipulacion de objetos en movimiento.
- Vehiculos autonomos: el tracking de otros vehiculos, peatones y obstaculos es critico para la planificacion de trayectorias. La salida con track IDs permite predecir movimientos futuros y evitar colisiones.
- Analisis deportivo: seguimiento de jugadores o balones en partidos grabados, generando estadisticas de posicion y velocidad. El modelo procesa secuencias de alta resolucion (800×1422) y puede operar en tiempo real en hardware embebido.
- Inspeccion industrial: seguimiento de piezas en cintas transportadoras para control de calidad o conteo de unidades. La robustez del transformer deformable ayuda a manejar oclusiones parciales.

## Benchmarks y rendimiento

La model card proporciona metricas de precision (MOTA) y de rendimiento en los chips J6. No se incluyen comparaciones con otros modelos MOT en la informacion disponible.

| Metrica | Float | Calibration | QAT | HBM |
|---|---|---|---|---|
| MOTA (J6M) | 0.5837 | 0.5704 | 0.5799 | 0.5767 |

| March | Grafo | Latencia (ms) | FPS | Memoria (MB) |
|---|---|---|---|---|
| J6M | main graph | 8.03 | 128.68 | 65.30 |
| J6M | qim | 0.37 | 5120.87 | 6.80 |
| J6P | main graph | 5.81 | 695.38 | 71.90 |
| J6P | qim | 0.36 | 10348.73 | 7.00 |
| J6B | main graph | - | - | - |
| J6B | qim | - | - | - |

Nota: las metricas de rendimiento se midieron con 8 hilos en un solo nucleo para FPS, y con un solo hilo/nucleo para latencia. J6B no tiene datos disponibles.

## Requisitos de hardware

- El modelo esta disenado especificamente para los chips Horizon J6 (J6M, J6P, J6B). En J6M requiere aproximadamente 65 MB de memoria DDR para el grafo principal y 6.8 MB para el QIM; en J6P, 71.9 MB y 7.0 MB respectivamente.
- No se proporcionan requisitos de VRAM para GPUs de proposito general. El tamano del repositorio (1.2 GB) sugiere que los pesos podrian caber en GPUs con al menos 2 GB de VRAM, pero no hay datos confirmados.
- Para ejecutar en GPUs convencionales (NVIDIA, AMD) se necesitaria una implementacion en PyTorch u otro framework, pero no se indica compatibilidad ni rendimiento esperado.
- Opciones de despliegue: el flujo oficial usa las herramientas HEAL de Horizon (heal, hbdk4-compiler, horizon_plugin_pytorch) para exportar y compilar los grafos. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- La latencia en J6M es de 8.03 ms (grafo principal) y 0.37 ms (QIM), lo que permite operar a mas de 100 FPS en tiempo real. En J6P, la latencia baja a 5.81 ms y el FPS sube a 695.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de tracking en la informacion proporcionada. El MOTR original de Megvii (con backbone ResNet) es la referencia directa, pero no se incluyen metricas de este en la model card. Tampoco se mencionan alternativas como TrackFormer, TransTrack o SORT. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- La licencia es "other", lo que implica que puede haber restricciones de uso comercial no especificadas. Es necesario revisar los terminos exactos antes de utilizarlo en produccion.
- El modelo esta optimizado para el hardware Horizon J6; su rendimiento en otras plataformas (GPUs, CPUs) no esta documentado y podria ser significativamente inferior.
- No se proporcionan datos sobre el conjunto de entrenamiento, por lo que se desconocen posibles sesgos en los tipos de objetos o escenarios. El modelo podria fallar en condiciones de oclusion severa, iluminacion extrema o con categorias no representadas.
- La metrica MOTA de 0.5837 (float) indica que hay margen de error en la asociacion de identidades; en escenarios con muchos objetos o movimientos rapidos, los fallos de tracking pueden aumentar.
- El modelo solo detecta una clase generica (objeto), no distingue categorias semanticas. Para aplicaciones que requieren clasificacion, se necesitaria un modelo adicional.
- No hay informacion sobre la robustez frente a ataques adversariales o degradacion de la imagen (ruido, compresion).
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una publicacion reciente o poco validada por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/OpenExploer/motr_efficientnetb3
- Repositorio oficial de MOTR: https://github.com/megvii-research/MOTR
- Paper de MOTR: https://arxiv.org/pdf/2105.03247
- Blog de Horizon sobre despliegue en chips J6: https://developer.horizon.auto/blog/10353
