# apdoa/picodet-m-six-epoch20

## Resumen

El modelo `apdoa/picodet-m-six-epoch20` es un checkpoint experimental de detección de objetos basado en PicoDet-M con backbone LCNet, desarrollado por el usuario `apdoa` y publicado en HuggingFace. No es un modelo de lenguaje ni multimodal: se trata de un detector de una sola clase (vehículo) de entrada 640x640, entrenado para estudiar la corrección de condiciones de corrupción (niebla, nieve, baja luz, desenfoque de movimiento, cuantización de color y brillo) mediante adaptadores de bajo rango. El repositorio contiene 48 checkpoints de 20 épocas (12 configuraciones de condición, con variantes "general" y "espacial-canal"), además de adaptadores solo y tensores NPZ para descomposición, en un tamaño total de 1.8 GB.

El trabajo se enmarca en una investigación sobre CSA (Corruption-Specific Adapter) y CDA (Condition-Dependent Adapter), donde cada condición de corrupción tiene un adaptador independiente para corregir los fallos del detector base. La arquitectura combina una columna vertebral LCNet fija con 21 adaptadores de bajo rango (rank=4), modificando una parte de ellos en la variante espacial-canal. La relevancia actual radica en mejorar la robustez de detectores ante corrupciones ambientales típicas en sistemas de visión embebidos, manteniendo el coste de inferencia bajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PicoDet-M con backbone LCNet; dos variantes de corrección: general (21 adaptadores de bajo rango) y espacial-canal (5 de esos adaptadores como corrección paralela espacial-canal) |
| Parametros totales | No disponible en la model card; los adaptadores tienen 82,288 (general) o 43,176 (espacial-canal) parametros entrenables por condicion |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica; modelo de percepcion visual que detecta una unica clase (vehiculo) |
| Licencia | No disponible |
| Formato de pesos | .pdparams (PaddlePaddle) |

## Arquitectura y entrenamiento

El modelo parte de un detector PicoDet-M/LCNet apuntando a una unica clase (vehiculo) con resolucion 640x640. El checkpoint base (W0) es un modelo limpio cuyos pesos y estados de Normalizacion por Lotes (BN) permanecen fijos durante el entrenamiento de los adaptadores. Existen dos variantes: la general, donde cada condicion de corrupcion tiene 21 adaptadores de bajo rango con rank=alpha=4 y matrices U/V/C aprendibles, y la espacial-canal, donde 5 de esos 21 adaptadores se sustituyen por correcciones paralelas espaciales y de canal, usando una base espacial de dimension d=4. Los parametros entrenables por condicion son 82,288 en la variante general y 43,176 en la espacial-canal, por lo que no son directamente comparables en terminos de capacidad.

El entrenamiento se realizo durante 20 epocas, con un total de 10,220 iteraciones por modelo, usando DDP2×12 (batch global 24) y 511 iteraciones por epoca. Las condiciones estudiadas son ColorQuant, Fog, LowLight, MotionBlur, Snow y Brightness. La fuente de datos son 12,264 imagenes originales, con una vista de severidad fija por condicion; no se re-muestrea por epoca. Se utilizo el optimizador AdamW con tasa de aprendizaje 1e-4, factor L2 0.05, calentamiento de 300 iteraciones y decaimiento coseno hasta 20 epocas. La funcion objetivo es exclusivamente la perdida de deteccion; la seleccion de condicion se realiza mediante Oracle y el bootstrap queda fijo, sin perdidas auxiliares de condicion o severidad. La asignacion de objetivos (GT assignment) cambio de ATSS en las epocas 1-10 a TaskAligned en las epocas 11-20. La evaluacion se realizo sobre un conjunto de calibracion de 650 fuentes sin solape con el entrenamiento, a 10 niveles de severidad por condicion.

## Capacidades

- Deteccion de objetos de una unica clase (vehiculo) en imagenes de 640x640, con salida de cajas delimitadoras y confianza.
- Correccion especifica por condicion de corrupcion mediante adaptadores de bajo rango: ColorQuant, Fog, LowLight, MotionBlur, Snow y Brightness.
- Dispone de checkpoints en varias etapas (E5, E10, E15, E20) para cada configuracion, lo que permite analizar la evolucion del rendimiento a lo largo del entrenamiento.
- Incluye dos arquitecturas de adaptacion (general y espacial-canal) que ofrecen un punto de comparacion entre estrategias de correccion de parametros.
- Los pesos incluyen el modelo completo, adaptadores unicos y tensores NPZ para descomposicion en base compartida, util para experimentos de analisis de componentes.
- No soporta tool calling, agentes, generacion de texto ni procesamiento de audio; es un modelo estrictamente de vision.

## Casos de uso

- Sistemas avanzados de asistencia al conductor (ADAS): el modelo puede detectar vehiculos en condiciones de niebla (Fog) o nieve (Snow), donde los detectores estander suelen degradarse, gracias a adaptadores especificos por condicion.
- Camaras de trafico en entornos nocturnos: el adaptador LowLight permite mantener la deteccion de vehiculos con poca iluminacion en sensores fijos o moviles.
- Vigilancia en climas frios: el adaptador Snow esta entrenado para mitigar el ruido visual causado por la nieve, util en aplicaciones de monitorizacion de carreteras en regiones nordicas.
- Procesamiento de imagenes comprimidas o con cuantizacion de color (ColorQuant): el modelo puede corregir artefactos de compresion y mantener la deteccion en fuentes de video de baja calidad o transcodificadas.
- Control de acceso en aparcamientos: ante cambios severos de brillo (Brightness), el adaptador correspondiente estabiliza la deteccion de vehiculos en entradas y salidas.
- Investigacion en robustez de detectores: el repositorio ofrece multiples checkpoints y variantes para estudiar comparativamente adaptadores de bajo rango, descomposicion en base compartida y efectos del cambio de asignacion de objetivos (ATSS a TaskAligned).

## Benchmarks y rendimiento

Los resultados publicados corresponden a la media de AP@[.50:.95] (escala 0-1) para la condicion de corrupcion evaluada sobre las 650 fuentes de calibracion con 10 niveles de severidad. Solo algunos checkpoints cuentan con evaluacion completa; la tabla presenta los valores disponibles para la condicion evaluada en cada etapa.

| Checkpoint | E5 AP | E10 AP | E15 AP | E20 AP |
|---|---:|---:|---:|---:|
| SIX_G_PRE_Snow | 0.39226 | — | — | — |
| SIX_G_PRE_Brightness | 0.47846 | 0.47981 | — | — |
| SIX_SC_PRE_Fog | 0.46942 | 0.47145 | — | — |
| SIX_SC_PRE_LowLight | 0.34115 | 0.34918 | — | — |
| SIX_SC_PRE_Snow | 0.39555 | — | — | — |

Comparacion con metodos anteriores del mismo autor en el mismo rango de condiciones (los valores se recalcularon como medias de las 10 celdas de la condicion correspondiente, no como medias de las 60 celdas completas):

| Checkpoint actual | AP actual | AJ R_qh E5 | AJ D_independent E5 | SC Oracle-anchor E5 | Diferencia vs SC |
|---|---:|---:|---:|---:|---:|
| SIX_G_PRE_Snow E5 | 0.39226 | 0.39420 | 0.40502 | 0.39104 | +0.00122 |
| SIX_G_PRE_Brightness E5 | 0.47846 | 0.47984 | 0.48030 | 0.48073 | -0.00226 |
| SIX_G_PRE_Brightness E10 | 0.47981 | 0.47984 | 0.48030 | 0.48073 | -0.00092 |
| SIX_SC_PRE_Fog E5 | 0.46942 | 0.45808 | 0.46510 | 0.45891 | +0.01050 |
| SIX_SC_PRE_Fog E10 | 0.47145 | 0.45808 | 0.46510 | 0.45891 | +0.01254 |
| SIX_SC_PRE_LowLight E5 | 0.34115 | 0.34319 | 0.34791 | 0.33680 | +0.00435 |
| SIX_SC_PRE_LowLight E10 | 0.34918 | 0.34319 | 0.34791 | 0.33680 | +0.01238 |
| SIX_SC_PRE_Snow E5 | 0.39555 | 0.39420 | 0.40502 | 0.38888 | +0.00667 |

R_qh es una CDA basada en MLP con entradas q+h; D_independent es una variante CDA con U/V por condicion, no identica al metodo de adaptadores independientes de este trabajo; SC_AO es un modelo de interpolacion con anclaje de contexto oracle. La comparacion no constituye una ablacion causal por diferencias en configuracion, entrada de contexto, exposicion y programacion de tasa de aprendizaje. No se han publicado resultados de benchmarks de lenguaje (MMLU, HumanEval, GSM8K) porque el modelo no es de texto.

## Requisitos de hardware

- No se proporcionan datos de VRAM exactos en la informacion disponible.
- PicoDet-M/LCNet es un detector ligero, pero el checkpoint de investigacion incluye multiples adaptadores y variantes, por lo que el consumo de memoria depende de la configuracion cargada.
- Los pesos estan en formato .pdparams de PaddlePaddle en lugar de safetensors o GGUF, por lo que la inferencia requiere el framework PaddlePaddle.
- No se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje generativo.
- No hay datos publicados de latencia ni throughput para este checkpoint experimental.

## Comparativa con modelos similares

La comparacion mas relevante es con los metodos previos del propio autor, presentados en la seccion de benchmarks. En resumen, la variante espacial-canal (SC) muestra mejoras en Fog, LowLight y Snow respecto a los metodos anteriores, mientras que la variante general (G) pierde ligeramente en Snow y Brightness pero gana algo en comparacion con SC en esas mismas condiciones. No se han publicado comparaciones con otros detectores generalistas (por ejemplo, YOLO o Faster R-CNN) en la informacion disponible.

| Metodo | Parametros entrenables por condicion | Condicion evaluada | AP (E5) |
|---|---:|---|---:|
| SIX_G_PRE (general) | 82,288 | Snow | 0.39226 |
| SIX_G_PRE (general) | 82,288 | Brightness | 0.47846 |
| SIX_SC_PRE (espacial-canal) | 43,176 | Fog | 0.46942 |
| SIX_SC_PRE (espacial-canal) | 43,176 | LowLight | 0.34115 |
| SIX_SC_PRE (espacial-canal) | 43,176 | Snow | 0.39555 |
| AJ R_qh E5 | no disponible | Fog (via SC) | 0.45808 |
| AJ D_independent E5 | no disponible | Snow | 0.40502 |
| SC Oracle-anchor E5 | no disponible | LowLight | 0.33680 |

## Limitaciones y advertencias

- Solo 8 de los 48 checkpoints tienen evaluacion completa de la condicion; muchos checkpoints E20 no tienen AP publicado a pesar de haber terminado el entrenamiento.
- Los resultados presentados son de un conjunto de desarrollo calibrado, no de un test externo, por lo que no deben interpretarse como rendimiento final en produccion.
- El modelo se entrena y evalúa para una unica clase (vehiculo); cualquier tarea de deteccion multi-clase requiere reentrenamiento y adaptacion.
- La licencia no esta especificada, por lo que no se puede confirmar la disponibilidad para uso comercial ni la compatibilidad con licencias de codigo abierto.
- Las dos variantes difieren en numero de parametros entrenables (82,288 vs 43,176), lo que impide una comparacion justa de capacidad y rendimiento.
- No hay informacion sobre sesgos, robustez frente a ataques adversarios ni comportamiento en condiciones no contempladas.
- La model card advierte explicitamente que no se debe concluir que "20 epocas es mejor" a partir de estos resultados parciales; se requiere evaluar todos los checkpoints E20 para establecer la evolucion E5→E20.

## Enlaces

- HuggingFace: https://huggingface.co/apdoa/picodet-m-six-epoch20
- Documentacion de referencia de PicoDet (fork de PaddleDetection): https://github.com/Purer-lyk/paddleDetection/blob/main/configs/picodet/README_en.md
- Dentro del repositorio de HuggingFace se encuentran las carpetas `models/SIX_G_PRE_*` y `models/SIX_SC_PRE_*` con los checkpoints `model.pdparams`, `adapter_only.pdparams` y los archivos `TRAIN_CONFIG.yml`.
