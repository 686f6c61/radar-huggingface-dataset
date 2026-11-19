# fhi/piston-rfdetr-small

## Resumen

piston-rfdetr-small es un modelo de deteccion de objetos basado en RF-DETR (Real-Time Detection Transformer) en su variante Small, publicado por el autor fhi (Fraunhofer Italia, segun los enlaces del proyecto). El modelo esta especializado en la deteccion de 11 clases de piezas y herramientas de piston neumatico, y se presenta como un componente del sistema de asistencia al montaje manual "Vision assembly assistance". Resuelve un problema acotado de vision artificial industrial: localizar piezas concretas en imagenes de un entorno de ensamblaje para guiar al operario o automatizar comprobaciones.

El modelo se entrena con RF-DETR 1.3.0 y una resolucion de entrada de 512 pixeles, y se distribuye como checkpoint de PyTorch (`.pth`) para la libreria `rfdetr`. El repositorio ocupa aproximadamente 0,1 GB, lo que es coherente con un detector de talla pequena. Su licencia es Apache 2.0, lo que permite uso comercial y modificacion.

Es relevante para desarrolladores que necesiten un detector especializado y ligero en un dominio industrial concreto, con metricas de validacion y test publicadas (mAP@0.5 de 0,9487 en validacion y 0,9577 en test), aunque con un alcance muy limitado a las 11 clases del dataset y sin informacion sobre idiomas ni capacidades generativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR (Real-Time Detection Transformer), variante Small |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen a 512 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint PyTorch (`.pth`), cargado mediante la libreria `rfdetr` |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura RF-DETR en su variante Small, un detector de objetos basado en transformer (DETR) orientado a inferencia en tiempo real. La entrada se procesa a 512 pixeles y la cabeza de clasificacion se configura con `num_classes=11`; el checkpoint incluye 12 slots en la cabeza de clases, y `labels.json` conserva los identificadores de categoria 1 a 11. La integracion se realiza a traves de la clase `RFDETRSmall` de la libreria `rfdetr`, cargando `checkpoint_best_total.pth`.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de tecnicas de refinamiento (RLHF, DPO u otras), ya que no es un modelo de lenguaje. El entrenamiento se realizo con RF-DETR 1.3.0 sobre el dataset "Piston parts detection" publicado por el mismo autor, y la model card indica que se incluyen configuracion, detalles de entorno, informes y hashes de ficheros. Las metricas publicadas provienen de los informes de entrenamiento, y el articulo asociado reporta los resultados de validacion.

## Capacidades

- Deteccion de objetos en imagenes RGB para 11 clases de piezas y herramientas de piston neumatico.
- Prediccion con umbral de confianza configurable (`threshold`, por ejemplo 0,5) mediante `model.predict`.
- Integracion con la libreria `rfdetr` y carga de pesos preentrenados desde un checkpoint local.
- Entrada de imagenes en formato NumPy con orden de canales RGB.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision general, audio ni tool calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues: no aplica (no procesa lenguaje).

## Casos de uso

- Asistencia al montaje manual: el detector localiza las piezas del piston en la imagen de la estacion de trabajo y permite al sistema "Vision assembly assistance" verificar que el operario ha seleccionado la pieza correcta en cada paso.
- Control de calidad en linea de ensamblaje: comparar la presencia y posicion de las 11 clases detectadas con el estado esperado del montaje para detectar piezas ausentes o mal colocadas.
- Inventario visual de componentes: contar y clasificar piezas de piston en bandejas o contenedores mediante inferencia sobre imagenes capturadas con camara fija.
- Documentacion automatica de procesos: etiquetar imagenes de montaje con las detecciones del modelo para generar registros trazables del ensamblaje.
- Entrenamiento de operarios: superponer las detecciones sobre la imagen en tiempo real para senalar piezas y herramientas durante la formacion.
- Prototipado de sistemas de vision industrial: servir como punto de partida (fine-tuning) para dominios de ensamblaje similares gracias a la licencia Apache 2.0 y a la integracion con `rfdetr`.
- Verificacion en entornos de investigacion: reproducir las metricas publicadas usando el dataset "Piston parts detection" y los informes incluidos en el repositorio.

## Benchmarks y rendimiento

| Split | Precision | Recall | mAP@0.5 |
|---|---:|---:|---:|
| Validacion | 0,967438 | 0,870000 | 0,948721 |
| Test | 0,948808 | 0,920000 | 0,957689 |

Las metricas provienen de los informes de entrenamiento; el articulo asociado reporta los resultados de validacion. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 0,1 GB, lo que sugiere un modelo ligero apto para GPU de gama media, pero no se confirma.
- GPU recomendadas: no disponible. Por el tamano del checkpoint y la resolucion de 512 px, es razonable esperar que funcione en GPU consumer, aunque no se especifica.
- Compatibilidad con GPU consumer: no confirmada en la informacion disponible.
- Opciones de despliegue: libreria `rfdetr` con checkpoint PyTorch (`.pth`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de comparaciones con otros modelos en la informacion proporcionada. Como referencia de categoria, RF-DETR Small es la variante pequena de la familia RF-DETR; sin embargo, no se aportan datos de otros detectores (YOLO, DETR, etc.) para establecer una comparativa fundamentada.

| Modelo | Parametros | Contexto | mAP@0.5 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| piston-rfdetr-small | no disponible | no aplica (512 px) | 0,9487 (val) / 0,9577 (test) | Apache 2.0 | Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en 11 clases de piezas y herramientas de piston neumatico; no es un detector de proposito general.
- No se han documentado sesgos especificos, pero al entrenarse sobre un dataset acotado de un dominio industrial concreto, su rendimiento fuera de ese dominio no esta garantizado.
- Riesgo de falsos positivos y falsos negativos en condiciones de iluminacion, angulo o fondo distintas a las del dataset de entrenamiento.
- No se dispone de informacion sobre robustez ante imagenes de baja calidad, oclusiones o piezas desconocidas.
- La cabeza de clasificacion incluye 12 slots aunque `labels.json` define 11 categorias; es necesario respetar los identificadores 1 a 11 para evitar errores de mapeo.
- Es imprescindible usar orden de canales RGB en imagenes NumPy; un orden incorrecto (BGR) degradaria las detecciones.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda conservar los avisos de licencia y los hashes incluidos en el repositorio.
- No se especifican requisitos minimos de hardware ni latencias, por lo que la viabilidad en produccion debe validarse empiricamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fhi/piston-rfdetr-small
- Dataset: https://huggingface.co/datasets/fhi/piston-parts-detection
- Codigo y articulo (Vision assembly assistance): https://github.com/fraunhofer-italia/vision-assembly-assistance
- Licencia Apache 2.0: https://huggingface.co/fhi/piston-rfdetr-small/blob/main/LICENSE
