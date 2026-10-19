# apexlabs-hq/sn44-petrol-v3

## Resumen

`apexlabs-hq/sn44-petrol-v3` es un detector de objetos de dominio específico publicado en Hugging Face por el usuario `apexlabs-hq`. No es un modelo de lenguaje: es un detector ONNX orientado a la identificacion de elementos de estaciones de servicio, con cuatro clases cerradas (surtidor de combustible, manguera, marquesina y panel de precios). El repositorio se creo el 17 de octubre de 2026 y se actualizo el 18 de octubre de 2026, con un tamano declarado de 0.0 GB, 0 descargas y 0 likes en el momento de la consulta.

El modelo se sirve mediante un script `miner.py` sobre `onnxruntime`, lo que sugiere un flujo de inferencia end-to-end empaquetado para un pipeline de mineria o evaluacion automatizada. La model card es puramente operativa: define umbrales de confianza globales y por clase, supresion de duplicados entre clases con IoU 0.9 y un margen de rescate por clase, pero no documenta arquitectura, numero de parametros, licencia ni datos de entrenamiento.

Su relevancia es acotada y muy practica: sirve como referencia reproducible (incluye el SHA-256 de los pesos) para tareas de deteccion en imagenes de gasolineras dentro de un contexto de subred de Bittensor, segun se desprende del nombre `sn44` y de la descripcion del repositorio hermano `bittensor-miner-apex/sn44-petrol`, que lo vincula al elemento TurboVision y al modelo base `manak0/Detect-petrol-station-1-0`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Detector de objetos de una etapa exportado a ONNX con inferencia end-to-end (sin paso NMS externo documentado) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica. Entrada de imagen fija de 736 x 736 px (`imgsz: 736`) |
| Tipos de cuantizacion | No disponible. Solo se declara el artefacto ONNX; no se documentan variantes INT8/FP16 |
| Idiomas soportados | No aplica (modelo de vision, no procesa texto) |
| Licencia | No disponible |
| Formato de pesos | ONNX, ejecutado con `onnxruntime` |
| SHA-256 de los pesos | `817f4cf95ab23e01aa1d348c50a446fdd1fa3736854f5782a805f8be4e67b0c1` |
| Clases | 0: petrol pump, 1: petrol hose, 2: roof canopy, 3: price board |
| Umbral de confianza global | 0.12 |
| Umbrales por clase | Clase 0: 0.25, clase 1: 0.15, clase 2: 0.25, clase 3: 0.15 (asumiendo el orden de clases declarado) |
| Supresion de duplicados entre clases (IoU) | 0.9 |
| Margen de rescate por clase bajo el umbral | 0.02 en las cuatro clases |
| Metadatos del repo | Tags `onnx`, `region:us`; creado 2026-10-17; actualizado 2026-10-18; 0 descargas; 0 likes |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna. Lo unico verificable es que se trata de un detector de objetos exportado a ONNX y ejecutado con `onnxruntime` mediante el script `miner.py`, con una resolucion de entrada de 736 x 736 px y salida end-to-end. El termino "end-to-end" en este contexto suele indicar que el grafo incluye la seleccion final de detecciones, de modo que el consumidor recibe cajas y clases directamente sin aplicar NMS por su cuenta; sin embargo, la model card no confirma esta implementacion.

Tampoco se documentan el volumen de datos de entrenamiento, la composicion del dataset, el numero de tokens (no aplica), ni si hubo etapas de ajuste fino supervisado adicionales. El nombre del repositorio y la descripcion del repositorio hermano apuntan a que el modelo es un detector derivado o ajustado a partir de `manak0/Detect-petrol-station-1-0`, del que heredaria el esquema de cuatro clases, pero esta relacion no se explicita en la model card de este repositorio concreto.

El unico elemento diferencial documentado es la capa de post-procesado declarada en la propia ficha: umbrales de confianza asimetricos por clase (0.25 para surtidor y marquesina, 0.15 para manguera y panel de precios), supresion de duplicados entre clases con un IoU muy permisivo de 0.9 y un margen de rescate de 0.02 que permite recuperar detecciones ligeramente por debajo del umbral. Este diseno sugiere un ajuste orientado a maximizar recall en clases dificiles (mangueras finas y paneles de precios pequenos) a costa de un mayor riesgo de falsos positivos.

## Capacidades

- Deteccion de objetos en imagenes con cuatro clases cerradas: surtidor de combustible, manguera, marquesina y panel de precios.
- Inferencia end-to-end en un unico paso sobre ONNX Runtime, sin dependencia de frameworks de deep learning completos.
- Seleccion de detecciones con umbrales de confianza especificos por clase, lo que permite calibrar la sensibilidad de forma granular.
- Supresion de duplicados entre clases con IoU 0.9, pensada para evitar que un mismo objeto fisico se etiquete simultaneamente como surtidor y como manguera, por ejemplo.
- Mecanismo de rescate de detecciones marginales (margen de 0.02) para no perder objetos que caen justo por debajo del umbral.
- Verificacion de integridad de los pesos mediante SHA-256 publicado.
- No soporta generacion de texto, tool calling, agentes, razonamiento multi-paso, vision-lenguaje, audio ni capacidades multilingues.

## Casos de uso

- Inventario de activos en estaciones de servicio: procesar lotes de fotografias de una red de gasolineras para contar surtidores y marquesinas por emplazamiento y mantener actualizado un inventario de activos sin revision manual.
- Monitorizacion de precios en surtidor: detectar el panel de precios (clase 3) como paso previo a un OCR que extraiga la cifra; el detector acota la region de interes y reduce el coste computacional del pipeline.
- Verificacion de emplazamientos para bases de datos geoespaciales: confirmar automaticamente si una imagen aerea o de street view contiene elementos propios de una gasolinera, como filtro previo a la digitalizacion manual.
- Inspeccion de seguridad e integridad de mangueras: localizar mangueras de combustible en fotografias de campo para auditorias de estado (desgaste, desconexion, tendido inadecuado) en rutinas de mantenimiento preventivo.
- Analisis de imagen de dron para planificacion de obra: detectar marquesinas y surtidores en vuelos de reconocimiento para comprobar el avance de una instalacion o el cumplimiento del plano.
- Etiquetado asistido (pre-labeling) de datasets propios: usar el detector para preanotar imagenes de estaciones de servicio y reducir el coste de anotacion humana, revisando despues las detecciones con umbral bajo.
- Verificacion de reclamaciones en seguros: procesar fotos aportadas por el asegurado para comprobar la presencia y disposicion de los elementos declarados en una incidencia en una estacion de servicio.
- Automatizacion en subnet de mineria: ejecutar el modelo como componente de inferencia de un minero (segun el patron `miner.py` + `onnxruntime`) para responder a tareas de deteccion evaluadas por la subred.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye mAP, precision/recall por clase, curvas PR ni comparaciones con otros detectores. Tampoco se han publicado mediciones de latencia o throughput.

Los unicos parametros operativos declarados, que no constituyen un benchmark, son los de configuracion de inferencia:

| Parametro de inferencia | Valor |
|---|---|
| Resolucion de entrada | 736 x 736 px |
| Umbral de confianza global | 0.12 |
| Umbral clase petrol pump | 0.25 |
| Umbral clase petrol hose | 0.15 |
| Umbral clase roof canopy | 0.25 |
| Umbral clase price board | 0.15 |
| IoU de supresion de duplicados entre clases | 0.9 |
| Margen de rescate por clase | 0.02 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Por el formato (ONNX), la resolucion de entrada (736 x 736) y el patron habitual de detectores de una etapa de este tamano, es razonable esperar un consumo inferior a 2 GB en FP32 con batch 1; se trata de una estimacion orientativa, no de una medicion publicada.
- GPU recomendadas: no disponibles. Cualquier GPU con soporte de CUDA y al menos 4 GB de VRAM deberia poder ejecutar el grafo; no se especifica un minimo oficial.
- GPU consumer: previsiblemente si, en tarjetas de gama media y alta (serie RTX xx60 en adelante), aunque no hay confirmacion del autor ni pruebas publicadas.
- CPU: viable en principio, dado que el modelo se sirve con `onnxruntime` y el repositorio esta pensado para un script de mineria; el rendimiento real en CPU no esta documentado.
- Opciones de despliegue: `onnxruntime` (CPU o con execution providers como CUDA, TensorRT, OpenVINO o DirectML), servidores compatibles con ONNX como Triton Inference Server, y contenedores propios del pipeline `miner.py`.
- Latencia y throughput: no disponibles. No hay cifras publicadas ni hardware de referencia indicado.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `apexlabs-hq/sn44-petrol-v3` | No disponible | 736 x 736 px | 4 (surtidor, manguera, marquesina, panel de precios) | No disponible | Publico en Hugging Face, 0 descargas |
| `bittensor-miner-apex/sn44-petrol` | No disponible | No disponible | No disponible (mismo elemento TurboVision) | No disponible | Publico en Hugging Face |
| `manak0/Detect-petrol-station-1-0` | No disponible | No disponible | No disponible | No disponible | Publico en Hugging Face; citado como referencia del detector |
| Detectores genericos de una etapa (familia YOLO, RT-DETR) | Depende del modelo | Configurable | 80+ clases COCO en variantes genericas | Depende del modelo | Ampliamente disponibles |

La comparacion cuantitativa no es posible: ninguno de los repositorios vinculados publica numero de parametros, mAP ni curvas de rendimiento en la informacion disponible. La unica ventaja verificable de esta variante frente a sus hermanas es la documentacion explicita del post-procesado y del hash de los pesos.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no puede asumirse permiso de uso comercial, redistribucion ni modificacion. Es un bloqueante para cualquier despliegue en produccion.
- Ausencia total de metricas: no hay mAP, ni precision/recall, ni tasas de error por clase, lo que impide estimar el rendimiento real antes de desplegar.
- Umbral global muy bajo (0.12): el modo por defecto favorece el recall y probablemente genere falsos positivos, especialmente en imagenes con texturas o estructuras similares a una marquesina.
- Dominio muy estrecho: solo cuatro clases y un unico tipo de escena. El rendimiento caera con casi total seguridad ante cambios de geografia, iluminacion, clima, angulo de camara o estilo arquitectonico de las estaciones.
- Sesgo de dataset desconocido: al no documentarse la composicion de los datos de entrenamiento, no puede evaluarse el sesgo geografico ni la representacion de distintos tipos de estacion de servicio.
- Riesgo de detecciones espurias: en un detector esto se traduce en cajas fantasma o clases cruzadas, no en alucinacion textual; el IoU de 0.9 para supresion entre clases puede permitir que un mismo objeto reciba dos etiquetas si la superposicion no es casi perfecta.
- Sin soporte de texto ni de instrucciones: no puede usarse para tareas de VLM, agentes o razonamiento; cualquier pipeline que lo integre debe aportar la logica de decision externa.
- Procedencia y mantenimiento inciertos: repositorio con 0 descargas y 0 likes, creado y actualizado en dos dias consecutivos, sin documentacion de versionado ni de cambios.
- Verificacion de integridad obligatoria: conviene comprobar el SHA-256 publicado antes de cargar los pesos en un entorno de produccion, ya que no hay firma ni otro mecanismo de confianza.
- Ambiguedad en los umbrales por clase: la model card no indica de forma explicita la correspondencia entre indices y nombres de clase, por lo que la asignacion debe validarse contra el propio grafo ONNX.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/apexlabs-hq/sn44-petrol-v3
- Repositorio hermano (mismo elemento TurboVision): https://huggingface.co/bittensor-miner-apex/sn44-petrol
- Modelo de referencia citado en la ficha: https://huggingface.co/manak0/Detect-petrol-station-1-0
