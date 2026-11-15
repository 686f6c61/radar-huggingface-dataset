# DavidAtwood/lcsh-decide-lora-onnx

## Resumen

`DavidAtwood/lcsh-decide-lora-onnx` es un conjunto de adaptadores LoRA y builds ONNX derivados de `fastino/GLiNER2.5-Decide` (a su vez fine-tune de `fastino/gliner2-large-v1`), orientados a una tarea muy concreta y de nicho: verificar la construccion de encabezamientos de materia de la Library of Congress (LCSH). El modelo no genera texto libre ni etiquetas entidades de forma generica; responde preguntas de si/no sobre la validez de combinaciones de encabezado y subdivision, siguiendo el formato "Decide" del modelo base.

El autor publica un adaptador LoRA compartido que cubre seis tareas (ajuste de uso de subdivisiones en primera posicion y en posiciones posteriores, hojas de instruccion raras, cadenas de lugares, distincion lugar/tema y tipo de encabezado), junto con builds ONNX int8 y fp32 del modelo fusionado. La motivacion es practica: dar a catalogadores una herramienta de evidencia para revision, no un veredicto automatico. El propio autor insiste en que una puntuacion baja significa "un catalogador deberia revisar", nunca "este encabezado es invalido".

La relevancia es limitada fuera del dominio bibliotecario, pero dentro de el es un caso interesante de adaptacion de un modelo de clasificacion de entidades a una tarea de validacion estructurada con datos de autoridad publicos. El entrenamiento se hizo con 68.303 filas en una sola RTX 5070 en 99 minutos, lo que da idea de la escala modesta del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (base: GLiNER2.5-Decide, derivado de gliner2-large-v1) con adaptador LoRA (r=16, alpha=32) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 per-channel dynamic (ONNX); fp32 (ONNX); fp16 probado pero no publicado |
| Idiomas soportados | no disponible (datos de entrenamiento en ingles, encabezados LCSH) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores LoRA, PEFT) y ONNX (int8 y fp32) |

## Arquitectura y entrenamiento

El modelo base es `fastino/GLiNER2.5-Decide`, un modelo de la familia GLiNER2 orientado a clasificacion de entidades y decisiones binarias con etiquetas dadas en tiempo de llamada (formato "Decide"). Sobre el se aplica un fine-tune LoRA con rango 16 y alpha 32, entrenado durante 2 epocas sobre 68.303 filas construidas a partir de datos de autoridad publicos de la Library of Congress. Las filas "validas" son combinaciones que la LC usa realmente; las filas "incorrectas" se generan intercambiando subdivisiones o lugares entre encabezados, de modo que el modelo aprende a separar la practica real de la LC de errores plausibles. La particion de train/test se hace por encabezado principal para evitar filtracion.

El adaptador compartido cubre seis tareas: ajuste de uso en la primera subdivision (18.104 filas), ajuste de uso en cualquier posicion (8.024), ajuste en hojas de instruccion raras o debiles (3.520, cubriendo H 1120, 1140, 1145.5, 1149.5, 1154.5, 1155, 1155.2, 1155.4, 1155.6 y 1186), cadenas de lugares (16.000), distincion lugar/tema (18.590) y tipo de encabezado (4.065). El entrenamiento se ejecuto en una RTX 5070 durante 99 minutos. Se publican ademas adaptadores de una sola tarea para comparacion, y una calibracion especifica para el build int8 (temperatura 2,51; Platt a=0,431, b=-0,454).

## Capacidades

- Clasificacion binaria de ajuste de uso de subdivisiones LCSH respecto a un encabezado principal, dada la nota de uso de la LC.
- Evaluacion del mismo criterio en subdivisiones posteriores a la primera, manteniendo el contexto de la cadena.
- Manejo reforzado de diez hojas de instruccion del Subject Headings Manual que el primer adaptador resolvia mal.
- Validacion de cadenas de nombres geograficos como jerarquias validas.
- Distincion entre valor de lugar (`$z`) y valor de tema (`$x`) en un encabezado.
- Clasificacion del tipo de encabezado en diez categorias: animal, enfermedad, grupo etnico, industria, lengua, composicion musical, instrumento musical, planta, clase social y otro.
- Formato de pregunta si/no con etiquetas proporcionadas en la llamada (herencia del modelo base Decide).
- No soporta generacion de texto libre, tool calling, agentes ni vision.

## Casos de uso

- Revision asistida de encabezados en catalogacion: el catalogador introduce encabezado, subdivision y nota de uso de la LC, y el modelo devuelve una probabilidad de ajuste que sirve como senal de revision. Apropiado porque el modelo se entreno exactamente con ese formato de tripleta.
- Control de calidad por lotes en un catalogo MARC: aplicar el build ONNX int8 sobre miles de encabezados para priorizar cuales revisar manualmente, dado su coste de 69 ms por fila en CPU.
- Deteccion de errores de codificacion de subcampo: usar la tarea lugar/tema para verificar si un valor deberia ir en `$z` o en `$x`, con AUC de 0,997 en el build int8.
- Validacion de cadenas geograficas: comprobar jerarquias de nombres de lugar antes de ingerirlas en un sistema de gestion bibliotecaria, con AUC de 0,932 en int8.
- Clasificacion de encabezados por tipo para enriquecimiento de metadatos: la tarea de tipo de encabezado alcanza 83,1% de exactitud en int8 y 88,7% en fp32, suficiente para etiquetado auxiliar con revision humana.
- Formacion de catalogadores: usar las puntuaciones como material didactico para mostrar casos donde la practica de la LC difiere de lo que parece intuitivo.
- Integracion en pipelines de validacion previos a la publicacion de registros de autoridad, ejecutando el build fp32 en CPU cuando la exactitud de tipo de encabezado o de cadenas invertidas es critica.

## Benchmarks y rendimiento

Resultados medidos por el autor en CPU, 4 hilos, ONNX Runtime, sin GPU:

| Metrica | fp32 | int8 per channel |
|---|---|---|
| Tamano de fichero | 1.693 MiB | 629 MiB |
| Memoria pico | 2.752 MiB | 1.703 MiB |
| Mediana por fila | 144 ms (p95 253 ms) | 69 ms (p95 118 ms) |
| Exactitud tipo de encabezado | 88,7% | 83,1% |
| AUC ajuste de uso, primer `$x` | 0,972 | 0,961 |
| AUC ajuste de uso, cualquier posicion | 0,959 | 0,945 |
| AUC cadenas de lugares | 0,939 | 0,932 |
| AUC lugar o tema | 0,998 | 0,997 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. El autor probo fp16 (modelo de cinco tareas) sin perdida de exactitud, pero resulto mas lento en CPU que fp32 con la mitad de tamano, por lo que no se publica.

## Requisitos de hardware

- Inferencia en CPU es el caso de uso principal: los builds ONNX estan pensados para portatiles convencionales.
- Memoria pico: 2.752 MiB en fp32 y 1.703 MiB en int8.
- No requiere GPU; el autor indica explicitamente que no hace falta.
- Despliegue mediante ONNX Runtime (los ejemplos `example_onnx.py` y `spot_check_scores.py` usan esta via).
- Los adaptadores LoRA (31 MB) requieren cargar el modelo base `fastino/GLiNER2.5-Decide` con PEFT.
- Latencia medida: 144 ms por fila en fp32 y 69 ms en int8 (p95 de 253 ms y 118 ms respectivamente) en CPU de 4 hilos.
- Throughput estimado: aproximadamente 7 filas/s en int8 y 3,5 filas/s en fp32 con esa configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lcsh-decide-lora-onnx | no disponible | no disponible | Validacion LCSH (6 tareas) | Apache 2.0 | Hugging Face |
| fastino/GLiNER2.5-Decide (base) | no disponible | no disponible | Decision si/no con etiquetas en llamada | Apache 2.0 | Hugging Face |
| fastino/gliner2-large-v1 (ancestro) | no disponible | no disponible | Clasificacion de entidades | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks de los modelos base en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa de rendimiento. La comparacion se limita a la especializacion: el modelo aqui descrito es el unico de los tres orientado especificamente a LCSH.

## Limitaciones y advertencias

- El resultado es evidencia para revision, no un veredicto: una puntuacion baja no implica que el encabezado sea invalido.
- El modelo solo cubre las seis tareas descritas; no es un asistente general ni genera catalogacion.
- El dominio esta restringido a LCSH y a las notas de uso de la LC; no se ha validado sobre otros vocabularios controlados.
- Los idiomas soportados no estan declarados; los datos de entrenamiento son encabezados en ingles.
- La exactitud de la tarea de tipo de encabezado cae del 88,7% al 83,1% al pasar de fp32 a int8, lo que puede ser relevante en produccion.
- El autor advierte de que las cadenas de lugares invertidas pueden puntuarse peor en int8; recomienda fp32 en ese caso.
- El fichero de calibracion solo aplica al build int8; no debe reutilizarse con fp32.
- El adaptador tiene `base_model_name_or_path` apuntando a la carpeta local `base`, por lo que hay que redirigirlo manualmente a `fastino/GLiNER2.5-Decide`.
- Riesgo de alucinacion no evaluado en la informacion disponible, aunque al ser una tarea de clasificacion binaria el margen es menor que en generacion libre.
- Sesgos conocidos no documentados; al derivar de datos de autoridad de la LC, hereda las decisiones y convenciones de esa institucion.
- Uso comercial permitido por Apache 2.0, manteniendo la atribucion original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAtwood/lcsh-decide-lora-onnx
- Modelo base: https://huggingface.co/fastino/GLiNER2.5-Decide
- Ancestro del modelo base: https://huggingface.co/fastino/gliner2-large-v1
- Ejemplos incluidos en el repo: `example_onnx.py`, `example_adapter.py`, `spot_check_scores.py`
- Resultados y notas de test: carpeta `results/` del repositorio (incluye `fp16-test.md`)
