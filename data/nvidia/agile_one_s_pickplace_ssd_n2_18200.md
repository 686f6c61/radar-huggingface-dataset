# nvidia/agile_one_s_pickplace_ssd_n2_18200

## Resumen

`nvidia/agile_one_s_pickplace_ssd_n2_18200` es un checkpoint de política robótica multimodal perteneciente a la familia GR00T N2 de NVIDIA, exportado de forma nativa a formato ONNX. El modelo está especializado en dos tareas concretas de manipulación sobre una unidad SSD: recogerla (`pick up the SSD`) y colocarla (`place the SSD`). No se trata de un modelo de lenguaje ni de un modelo de propósito general, sino de una política viso-lenguaje-acción (VLA) entrenada para controlar un robot bimanual con manos articuladas.

El checkpoint corresponde al paso de entrenamiento 18200 del experimento `pick196-place149-n2-c32-4cam-20260930`. El corpus de origen comprende 196 episodios de recogida y 149 episodios de colocación de SSD, distribuidos en 310 episodios de entrenamiento y 35 de validación. La política consume cuatro cámaras (dos de cabeza y dos de muñeca), un vector de estado de 54 dimensiones y produce un chunk de acción lógico de 32 pasos con una representación interna de 54 dimensiones (7 por brazo, 7 por mano y 20 por mano articulada, en ambos lados).

Su relevancia radica en que constituye un artefacto listo para integrarse en pipelines de inferencia ONNX: incluye el procesador original, las estadísticas de normalización por percentiles y el tokenizador sin modificar, además de un VAE auxiliar y utilidades de ejecución. El repositorio pesa 29,7 GB y agrupa los grafos ONNX, los tensores externos y los pesos originales. Es importante subrayar que no es un paquete de motor TensorRT ni una `policy.yaml` lista para robot: la propia model card advierte de que la paridad numérica completa, la validación en TensorRT y las tasas de éxito reales no están garantizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política viso-lenguaje-acción de la familia GR00T N2 (detalles de backbone no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (modelo de robótica; instrucciones en inglés) |
| Licencia | no disponible |
| Formato de pesos | ONNX (grafos) y safetensors (pesos auxiliares y checkpoint original) |
| Entradas | 4 cámaras (head_left, head_right, wrist_left, wrist_right) + State54 |
| Salidas | Action54 absoluta, chunk lógico de 32 pasos |
| Tamano del repositorio | 29,7 GB |
| Tareas soportadas | task_id 0: `pick up the SSD`; task_id 1: `place the SSD` |

## Arquitectura y entrenamiento

El modelo es una exportación ONNX de división nativa del checkpoint `pick196-place149-n2-c32-4cam-20260930` (paso 18200). Forma parte de la línea GR00T N2 de NVIDIA, orientada a políticas de manipulación para robots humanoides o bimanuales. La model card no detalla la composición del backbone ni el número de parámetros, por lo que esos datos no están disponibles en la información proporcionada. Sí especifica el contrato de entrada y salida: cuatro cámaras en un orden fijo, un vector de estado de 54 dimensiones y una acción absoluta también de 54 dimensiones (brazo izquierdo de 7, brazo derecho de 7, mano izquierda de 20, mano derecha de 20). El chunk de acción lógico es de 32 pasos; el relleno interno de 48×128 es un artefacto de implementación y no la forma de acción de despliegue.

Los datos de entrenamiento proceden de un corpus de 196 episodios de recogida y 149 de colocación de SSD, con 310 episodios para entrenamiento y 35 para validación. El paquete conserva el procesador original, las estadísticas de normalización por percentiles y el tokenizador sin cambios, lo que facilita la reproducibilidad del preprocesado. Se incluye además un VAE auxiliar y muestras de validación. La model card no menciona detalles sobre el uso de RLHF, DPO u otras técnicas de alineamiento, ni sobre el volumen de tokens o composición exacta del dataset. Tampoco declara innovaciones técnicas como decodificación especulativa. Un aspecto relevante para el despliegue es que no existen salidas de navegación ni locomoción: el modelo se limita a la manipulación.

## Capacidades

- Manipulación robótica bimanual: recogida y colocación de una unidad SSD mediante instrucciones en lenguaje natural.
- Selección de tarea en el lado del host mediante `task_id` (0 o 1), usando el contexto correspondiente de `task-prompts.pt` según `task-instructions.json`; no es una entrada del grafo ONNX.
- Percepción multimodal con cuatro cámaras: dos de cabeza (head_left, head_right) y dos de muñeca (wrist_left, wrist_right).
- Representación de estado y acción de 54 dimensiones: 7 por brazo, 7 por mano y 20 por mano articulada en cada lado.
- Generación de chunks de acción de 32 pasos por inferencia.
- Multitarea sobre un único conjunto de grafos compartidos, sin necesidad de cargar grafos duplicados por tarea.
- Inclusión de procesador, tokenizador y estadísticas de normalización originales, lo que permite reproducir el preprocesado.
- No se documentan capacidades de generación de texto, código, matemáticas, visión general, tool calling, agentes ni modo de razonamiento (`thinking`), ya que no es un modelo de lenguaje.

## Casos de uso

- Automatización de líneas de montaje de almacenamiento: el modelo puede ejecutar el ciclo recoger-colocar de unidades SSD en una celda robotizada, usando `task_id 0` para la recogida y `task_id 1` para la colocación.
- Validación de políticas en simulador antes de despliegue físico: dado que el paquete incluye muestras de validación y helpers de ejecución, permite comprobar el comportamiento del checkpoint en un entorno controlado.
- Integración en pipelines de inferencia ONNX sobre GPU: al ser una exportación ONNX nativa, se puede servir mediante ONNX Runtime dentro de un servicio que reciba imágenes de las cuatro cámaras y el vector de estado.
- Investigación en manipulación bimanual: sirve como punto de partida para estudiar el comportamiento de políticas VLA con manos articuladas de 20 dimensiones por mano.
- Benchmarking interno de hardware robótico: el modelo puede utilizarse como carga de referencia para medir latencia y throughput de inferencia ONNX sobre distintas GPU antes de construir un motor TensorRT.
- Reproducción de experimentos de exportación: el paquete conserva el checkpoint original, el procesador y las estadísticas, lo que permite comparar la paridad numérica entre la ejecución ONNX y la ejecución *eager*.
- Prototipado de celdas pick-and-place para objetos similares: el mismo esquema de entrada (cámaras + estado) y salida (acción de 54 dimensiones) puede reutilizarse como plantilla para otras tareas de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que las «revisiones de finalización» describen comprobaciones estructurales y de referencia de ONNX, así como una validación misma-instancia en modo *eager* del ciclo Pick→Place→Pick. No se afirman cifras de paridad numérica completa ONNX/*eager*, ni resultados de validación en TensorRT, ni tasas de éxito sobre robot real.

## Requisitos de hardware

- El repositorio completo ocupa 29,7 GB, ya que incluye los grafos ONNX, los tensores externos, los pesos del checkpoint original, el procesador, las estadísticas, el VAE auxiliar, las muestras de validación y los helpers de ejecución.
- VRAM estimada para inferencia: no disponible de forma explícita; el tamaño del paquete sugiere reservar una GPU con al menos 24 GB de memoria para cargar grafos y tensores sin recurrir a *offload* agresivo.
- GPU recomendadas: no especificadas por el autor; por el perfil de carga se encuadraría en GPUs de centro de datos (por ejemplo A100 o H100) y, potencialmente, en GPUs de consumo de gama alta como la RTX 4090 con 24 GB, aunque esto no está confirmado.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: ONNX Runtime como vía principal, dado el formato de exportación. No es un paquete de motor TensorRT listo para usar; habría que construir y validar el motor en la plataforma objetivo. Tampoco se incluye una `policy.yaml` lista para robot.
- Latencia y throughput estimados: no disponibles.
- Nota de despliegue: es necesario descargar el repositorio completo, no solo los tres archivos `.onnx`, porque los tensores externos y los archivos auxiliares son dependencias obligatorias.

## Comparativa con modelos similares

No se dispone de datos suficientes en la información proporcionada para establecer una comparativa cuantitativa fiable con otros modelos. La tabla siguiente resume la situación con alternativas de la misma categoría (políticas de manipulación robótica), marcando los datos no disponibles.

| Modelo | Categoria | Parametros | Contexto | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| `nvidia/agile_one_s_pickplace_ssd_n2_18200` | Política VLA de manipulación (GR00T N2) | no disponible | no disponible | no disponible | no disponible |
| Alternativas de la familia GR00T (por ejemplo N1/N1.5) | Política VLA de manipulación | no disponible | no disponible | no disponible | no disponible |
| Políticas VLA de terceros (por ejemplo clase OpenVLA o pi0) | Política VLA de manipulación | no disponible | no disponible | no disponible | no disponible |

Las alternativas se citan únicamente como referencia de categoría; no se dispone de cifras verificables en la información disponible para comparar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Modelo altamente especializado: solo cubre las tareas `pick up the SSD` y `place the SSD`; no generaliza a otras instrucciones ni a otros objetos por sí solo.
- No incluye salidas de navegación ni locomoción, por lo que no sirve para controlar la base móvil de un robot.
- La licencia no está declarada, lo que impide confirmar si se permite el uso comercial. Conviene aclararlo con NVIDIA antes de cualquier despliegue en producción.
- No es un paquete listo para robot: la model card indica explícitamente que no es un motor TensorRT ni una `policy.yaml` desplegable, y que debe construirse y validarse en la plataforma objetivo.
- La paridad numérica completa entre la ejecución ONNX y la ejecución *eager* no está afirmada; solo se describen comprobaciones estructurales y de referencia y una validación misma-instancia del ciclo Pick→Place→Pick.
- No se publican tasas de éxito sobre robot real ni resultados de benchmarks, por lo que el rendimiento en producción es incierto.
- Riesgo de fallo en el preprocesado si no se respeta el contrato del modelo: orden exacto de cámaras, State54/Action54, chunk de 32 pasos y uso correcto de `task-prompts.pt` y `task-instructions.json`.
- El `task_id` es un selector del lado del host y no una entrada del grafo ONNX; cargar grafos duplicados por tarea es un error de uso.
- El rendimiento depende de la calidad y las condiciones de captura de las cuatro cámaras; no se documentan sesgos específicos ni umbrales de robustez frente a cambios de iluminación u oclusiones.
- Solo se proporciona una instrucción funcional en inglés por tarea; no se declaran capacidades multilingües.
- El relleno interno de 48×128 no debe interpretarse como la forma de acción de despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nvidia/agile_one_s_pickplace_ssd_n2_18200
- Sitio oficial de NVIDIA: https://www.nvidia.com/
- Pagina de NVIDIA en Wikipedia: https://en.wikipedia.org/wiki/Nvidia
