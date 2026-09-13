# DarkKnight1217/RunwayGuard-rtdetr-l

## Resumen

RunwayGuard-rtdetr-l es un modelo de deteccion de objetos publicado por el usuario DarkKnight1217 en HuggingFace, consistente en un ajuste fino de RT-DETR-L (Real-Time DEtection TRansformer, variante L) realizado con la libreria Ultralytics en su version 8.4.147. El modelo resuelve una tarea muy especifica: la deteccion de residuos de objetos extranos en pista de aeropuerto, conocidos en la industria como FOD (Foreign Object Debris), a partir de imagenes visibles. El entrenamiento y la evaluacion se han realizado sobre el conjunto de datos FOD-A v2.1, con una particion determinista y agrupada de entrenamiento, validacion y prueba (semilla 42).

El modelo distingue siete clases operativas: `fastener_hardware`, `hand_tool`, `flexible_debris`, `loose_metal`, `plastic_paper_debris`, `component_container` y `natural_debris`. Su relevancia actual es acotada pero clara: aplica una arquitectura transformer de deteccion en tiempo real a un problema de seguridad aeroportuaria con clases definidas por procedimiento operativo, en lugar de las clases genericas de COCO.

Se trata de un modelo de vision por computador, no de un modelo de lenguaje: no tiene ventana de contexto de texto, no soporta generacion de lenguaje ni tool calling, y su entrada es una imagen. El repositorio ocupa 0,3 GB e incluye el checkpoint `best.pt`, las curvas de entrenamiento por epoca (`results.csv`) y las metricas de prueba agrupada (`test_metrics.json`). En el momento de redactar esta ficha el modelo acumula 0 descargas y 0 likes, por lo que no cuenta con validacion externa independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RT-DETR-L (Real-Time DEtection TRansformer, variante L), entrenado con Ultralytics 8.4.147 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de deteccion de objetos; la resolucion de entrada no se especifica en la informacion disponible) |
| Tipos de cuantizacion | no disponible (se distribuye un unico checkpoint `best.pt` en precision de entrenamiento) |
| Idiomas soportados | no aplica (modelo de vision; no procesa texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`), fichero `best.pt` |
| Tarea (pipeline) | object-detection |
| Clases detectadas | 7: `fastener_hardware`, `hand_tool`, `flexible_debris`, `loose_metal`, `plastic_paper_debris`, `component_container`, `natural_debris` |
| Dataset de entrenamiento | FOD-A v2.1 |
| Tamano del repositorio | 0,3 GB |
| Checksum SHA256 de `best.pt` | `C2D2A418069D9AC8658CA85B8359A9E1AB740CE96826C5138178B080F9243269` |
| Fecha de creacion | 2026-09-13 |
| Ultima actualizacion | 2026-09-13 |

## Arquitectura y entrenamiento

RT-DETR es una familia de detectores end-to-end que combina un codificador hibrido (extraccion de caracteristicas convolucionales combinada con capas de atencion) con un decodificador transformer que utiliza consultas de objeto y seleccion de consultas guiada por IoU, eliminando la necesidad de supresion de no maximos (NMS) en el post-procesado. La variante L es la de menor capacidad de la familia. La informacion proporcionada confirma el uso de esta arquitectura y de la libreria Ultralytics 8.4.147, pero no detalla hiperparametros de entrenamiento, numero de epocas, resolucion de entrada, composicion exacta del dataset ni estrategia de aumento de datos.

El ajuste fino se realizo sobre FOD-A v2.1 (licencia MIT), con una particion determinista y agrupada de entrenamiento, validacion y prueba usando la semilla 42. El uso de una particion agrupada es relevante: evita que imagenes del mismo objeto o de la misma sesion de captura aparezcan simultaneamente en entrenamiento y prueba, lo que reduce la fuga de informacion y hace las metricas de prueba mas conservadoras que en una particion aleatoria. El autor publica `results.csv` con las curvas por epoca y `test_metrics.json` con las metricas de prueba congeladas. No se menciona ninguna fase de RLHF, DPO ni aprendizaje por refuerzo, algo que no aplica a un detector de objetos. La model card remite a un memo en el repositorio de GitHub para justificar la particion y documentar los casos de fallo, pero ese contenido no forma parte de la informacion disponible.

## Capacidades

- Deteccion de objetos en imagenes: localiza y clasifica residuos visibles en pista dentro de las siete clases operativas definidas.
- Deteccion end-to-end sin NMS: la arquitectura RT-DETR produce predicciones directamente desde el decodificador transformer.
- Clasificacion por tipo de residuo: distingue entre elementos de fijacion, herramientas manuales, residuos flexibles, metal suelto, plasticos y papel, contenedores de componentes y residuos naturales.
- Inferencia sobre imagenes individuales a traves de la libreria Ultralytics (carga del fichero `best.pt`).
- Integracion como servicio HTTP: la model card describe un despliegue con FastAPI y `uvicorn` que apunta al checkpoint mediante la variable de entorno `MODEL_PATH`.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica.
- Capacidades especiales (modo thinking, vision, audio): unicamente vision, limitada a deteccion de objetos en imagenes visibles.

## Casos de uso

- Inspeccion automatizada de pista: el modelo analiza imagenes capturadas por camaras fijas o instaladas en vehiculos de inspeccion y marca la posicion de cada residuo candidato, con lo que el equipo de mantenimiento puede priorizar la retirada antes de la siguiente operacion de aeronave.
- Triaje en centro de operaciones aeroportuarias: dado que las metricas de prueba agrupadas reportan una precision de 0,734 y una sensibilidad de 0,812, el modelo puede usarse como primer filtro que descarta imagenes limpias y eleva a revision humana solo aquellas con detecciones, reduciendo la carga de monitorizacion.
- Post-procesado de grabaciones de barrido: se puede aplicar sobre los fotogramas de una pasada de inspeccion para generar un inventario con la ubicacion y la clase de cada residuo detectado, y asi documentar la limpieza realizada.
- Robotica movil o drones de inspeccion: el checkpoint es lo bastante ligero (el repositorio completo ocupa 0,3 GB) para ejecutarse en plataformas con GPU embebida, permitiendo deteccion a bordo durante el recorrido de la pista.
- Clasificacion por protocolo de limpieza: las siete clases permiten distinguir entre residuos que requieren recogida manual con herramienta (por ejemplo, `hand_tool`, `loose_metal`) y residuos que pueden retirarse con barredora o sopladora (`plastic_paper_debris`, `natural_debris`), lo que ayuda a asignar el recurso adecuado.
- Formacion y auditoria de personal de pista: las detecciones y las metricas publicadas sirven para construir ejercicios de reconocimiento de FOD con imagenes reales etiquetadas por clase.
- Investigacion en vision por computador aplicada a aviacion: el modelo y sus resultados sobre FOD-A v2.1 con particion agrupada constituyen una linea base reproducible para comparar variantes de arquitectura (otros tamanos de RT-DETR, detectores de la familia YOLO u otros) bajo el mismo protocolo de evaluacion.
- Control de calidad de un pipeline de vision propio: al publicar el checksum SHA256 del checkpoint y las metricas de prueba congeladas, el modelo puede usarse como referencia fija para detectar regresiones cuando se reentrenamiento con datos propios.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible corresponden a la evaluacion del autor sobre la particion de prueba agrupada y congelada:

| Metrica | Valor |
|---|---|
| mAP50 | 0,755 |
| mAP50-95 | 0,636 |
| Precision (Library P) | 0,734 |
| Recall (Library R) | 0,812 |

No se han publicado comparaciones con otros modelos ni resultados sobre conjuntos externos en la informacion disponible. Las metricas de `results.csv` (curvas de entrenamiento y validacion por epoca) existen en el repositorio pero su contenido no se ha facilitado, por lo que no se reproducen aqui.

## Requisitos de hardware

- VRAM estimada para inferencia: no especificada por el autor. El repositorio completo ocupa 0,3 GB, por lo que el checkpoint es de tamano reducido y cabe holgadamente en cualquier GPU de consumo actual.
- GPU recomendadas: no disponibles. Un detector de la familia RT-DETR en su variante L es ejecutable en GPUs de gama media y alta; el autor no publica que hardware utilizo.
- GPU de consumo: el modelo cabe con margen en GPU de consumo (RTX 3060, RTX 4060, RTX 4090 y equivalentes), aunque no se dispone de cifras de VRAM medidas por el autor.
- Opciones de despliegue: libreria Ultralytics (carga directa de `best.pt`) y servicio HTTP con FastAPI + `uvicorn` segun el ejemplo de la model card (`export MODEL_PATH=weights/best.pt; uvicorn app.main:app --host 0.0.0.0 --port 8000`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de vision de este tipo.
- Latencia y throughput: no disponibles. No se han publicado mediciones en la informacion proporcionada.
- Descarga del checkpoint: `huggingface-cli download DarkKnight1217/RunwayGuard-rtdetr-l best.pt --local-dir ./weights` o descarga directa por HTTP desde la URL de resolucion del repositorio.

## Comparativa con modelos similares

No se dispone de resultados comparativos publicados en la informacion proporcionada. La tabla siguiente recoge alternativas de la misma categoria funcional (deteccion de objetos y, en particular, deteccion de FOD en pista), marcando como no disponible todo dato no confirmado:

| Modelo | Tarea | Parametros | Contexto / entrada | Rendimiento en FOD | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RunwayGuard-rtdetr-l | Deteccion de FOD, 7 clases | no disponible | imagen, resolucion no especificada | mAP50 0,755 / mAP50-95 0,636 (prueba agrupada propia) | MIT | HuggingFace, 0 descargas |
| RT-DETR-L base (sin ajuste) | Deteccion de objetos genericos | no disponible | imagen | no disponible (no se ha evaluado sobre FOD-A en la informacion proporcionada) | no verificada en la informacion disponible | distribuido por sus autores originales |
| Detectores de la familia YOLO ajustados a FOD | Deteccion de FOD | no disponible | imagen | no disponible | no verificada en la informacion disponible | multiples checkpoints de terceros |
| DETR original | Deteccion de objetos genericos | no disponible | imagen | no disponible | no verificada en la informacion disponible | distribuido por sus autores originales |

Nota metodologica: las metricas de RunwayGuard-rtdetr-l no son directamente comparables con las de otros detectores salvo que se evalue sobre la misma particion agrupada de FOD-A v2.1 con la misma semilla, ya que el protocolo de particion afecta de forma significativa a los valores de mAP.

## Limitaciones y advertencias

- Alcance funcional restringido: el modelo detecta residuos candidatos visibles en una imagen. No certifica el despeje de la pista, no determina el material ni la masa del objeto y no predice el dano potencial a una aeronave. Cualquier decision operativa debe recaer en personal cualificado.
- Sensibilidad a falsos positivos y falsos negativos: con una precision de 0,734 y una sensibilidad de 0,812, se espera un volumen apreciable de detecciones incorrectas en ambos sentidos. En un contexto de seguridad aeroportuaria, un falso negativo puede tener consecuencias graves.
- Ausencia de validacion externa: el modelo tiene 0 descargas y 0 likes y fue publicado en 2026-09-13. Las metricas proceden unicamente del autor y de una unica particion de prueba.
- Falta de informacion sobre generalizacion: no se detalla la composicion del dataset, las condiciones de captura (iluminacion, clima, sensores, altitud de camara), el balance entre clases ni el rendimiento por clase. No es posible estimar como se comportara con imagenes de otraCamara o de otro aeropuerto.
- Sesgos conocidos: no disponibles. No se ha publicado ningun analisis de sesgo ni de rendimiento diferencial por condiciones de captura.
- Limitaciones de idioma: no aplica, ya que el modelo no procesa texto.
- Resolucion y contexto: no se especifica la resolucion de entrada esperada ni el rango de tamanos de objeto para el que el modelo es fiable. Los residuos muy pequenos o parcialmente ocluidos pueden quedar fuera de su capacidad de deteccion.
- Restricciones de licencia: el modelo se distribuye bajo licencia MIT, que permite uso comercial. El dataset FOD-A tambien se distribuye bajo MIT, pero su uso requiere citar el trabajo original. Conviene verificar las condiciones de la libreria Ultralytics empleada en el entrenamiento, cuya licencia no se detalla en la informacion proporcionada y que puede imponer obligaciones adicionales en determinados escenarios de uso.
- Caveat para produccion: no se proporcionan datos de latencia, throughput, consumo de VRAM ni comportamiento bajo carga, por lo que cualquier despliegue en produccion requiere una bateria de pruebas propia antes de integrarse en un flujo operativo.
- Advertencia sobre la busqueda web: las consultas realizadas no devolvieron resultados relevantes sobre el modelo (unicamente paginas de agencias de viajes), por lo que no existe cobertura externa, analisis independiente ni replicaciones conocidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DarkKnight1217/RunwayGuard-rtdetr-l
- Repositorio de codigo (aplicacion FastAPI y memo de particion): https://github.com/riyaz-ahamed-07/RunwayGuard
- Paper del dataset FOD-A: https://arxiv.org/abs/2110.03072
- Descarga directa del checkpoint: https://huggingface.co/DarkKnight1217/RunwayGuard-rtdetr-l/resolve/main/best.pt
