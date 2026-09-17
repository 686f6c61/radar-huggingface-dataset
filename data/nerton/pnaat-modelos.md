# Nerton/pnaat-modelos

## Resumen

PNAAT es un conjunto de paquetes de modelos de vision por computador publicados por el usuario Nerton en HuggingFace, orientados a la inspeccion visual automatizada en una linea de envasado de botellas de PET. El repositorio no contiene un unico modelo, sino varios: un clasificador del cuerpo de la botella (`corpo-cls`), un detector del cuerpo (`corpo-detector`) y una familia de detectores laterales en versiones sucesivas (`v7a-lateral`, `v9a-lateral`, `v9b-lateral`), de las cuales `v9b-lateral-calibrado` se declara como la version vigente. Cada paquete incluye pesos, contrato del modelo, metadatos de entrenamiento, contrato de preprocesamiento cuando existe y un fichero `SHA256SUMS` para verificacion de integridad.

La libreria declarada es Ultralytics y la tarea principal es deteccion de objetos, segun los metadatos de HuggingFace, aunque el paquete `corpo-cls` corresponde a clasificacion. Las etiquetas del autor apuntan a tres tareas concretas de inspeccion: deteccion de tapa, deteccion de deformidad del cuerpo y deteccion de borde. Se trata, por tanto, de un modelo de vision especializado en control de calidad industrial, no de un modelo de lenguaje.

La relevancia de esta publicacion es acotada y practica: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y ocupa 0,1 GB, lo que sugiere pesos ligeros compatibles con inferencia en el borde. La model card no declara numero de parametros, contexto, licencia ni idiomas, por lo que buena parte de las especificaciones habituales no estan disponibles. El detalle tecnico mas reseñable que aporta el autor es la re-serializacion de los pesos para eliminar rutas de instalacion grabadas en los metadatos de entrenamiento, manteniendo predicciones identicas (diferencia cero en el mismo fotograma).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (libreria declarada: Ultralytics; no se especifica variante ni version) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible / no aplica (modelo de vision; la documentacion esta en portugues) |
| Licencia | no disponible |
| Formato de pesos | no disponible (los paquetes incluyen pesos y `SHA256SUMS`; no se especifica extension ni formato) |

Datos adicionales del repositorio: tamano de 0,1 GB, 0 descargas, 0 likes, creado el 17 de septiembre de 2026 y actualizado el mismo dia. Paquetes declarados: `corpo-cls`, `corpo-detector`, `v7a-lateral`, `v9a-lateral`, `v9b-lateral`, `v9b-lateral-calibrado`.

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna. La libreria declarada en los metadatos de HuggingFace es Ultralytics, lo que situa el modelo en la familia de detectores YOLO, pero no se especifica la version concreta, el tamaño del backbone, la resolucion de entrada ni si existe una etapa de clasificacion separada con su propia cabeza. El nombre del proyecto, PNAAT, y las etiquetas (`inspecao-visual`, `deteccao-de-defeito`, `garrafa-pet`, `borda`) indican un entrenamiento orientado a un dominio muy cerrado: tapa y deformidad del cuerpo en una linea de envase.

Tampoco se documentan el numero de imagenes de entrenamiento, la composicion del dataset, el numero de epocas, el esquema de aumentacion ni si se aplicaron tecnicas de ajuste posteriores como calibracion de umbrales. La unica referencia a calibracion es el nombre del paquete vigente, `v9b-lateral-calibrado`, sin que se explique el procedimiento. El autor indica que los pesos se re-serializaron para eliminar rutas de instalacion de los metadatos de entrenamiento y que la verificacion compara la prediccion del peso antes y despues sobre el mismo fotograma exigiendo diferencia cero; se menciona tambien un indice `models/INDEX.csv` en el repositorio del proyecto con sha256, bytes y metrica cuando existe.

## Capacidades

- Deteccion de objetos sobre imagenes de botellas de PET en linea de envasado, segun la tarea declarada en el pipeline (`object-detection`).
- Deteccion lateral del cuerpo de la botella mediante la familia de modelos `v7a-lateral` a `v9b-lateral`, con versiones sucesivas que permiten comparar iteraciones.
- Deteccion de tapa y de deformidades del cuerpo, segun las etiquetas del autor.
- Deteccion de borde, segun la etiqueta `borda`.
- Clasificacion del cuerpo de la botella mediante el paquete `corpo-cls`.
- Verificacion de integridad de los artefactos publicados mediante `sha256sum -c <paquete>/SHA256SUMS`.
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingues ni modos especiales de inferencia (thinking, vision multimodal generativa, audio), dado que es un modelo de vision dedicado a deteccion y clasificacion.

## Casos de uso

- Inspeccion de calidad en linea de envasado: el detector lateral identifica deformidades del cuerpo de la botella en la cinta transportadora, lo que permite descartar unidades defectuosas antes del empaquetado.
- Verificacion de presencia y correcta colocacion de la tapa: la deteccion de tapa sirve como control de cierre en la salida de la llenadora, evitando botellas mal tapadas.
- Control de borde y contorno del envase: la deteccion de borde permite comprobar la silueta del cuerpo, util para detectar rebabas, aplastamientos o desviaciones dimensionales.
- Clasificacion binaria o multietiqueta del cuerpo: el paquete `corpo-cls` puede alimentar un sistema de triaje que separe unidades conformes de no conformes antes de una revision manual.
- Implantacion en el borde de planta: con un repositorio de 0,1 GB y pesos de deteccion ligeros, los modelos son candidatos a ejecutarse en dispositivos junto a la camara o en un PC industrial, reduciendo la latencia de red y la dependencia de la nube.
- Auditoria de modelos y trazabilidad: los ficheros `SHA256SUMS`, el contrato del modelo, los metadatos de entrenamiento y el indice `models/INDEX.csv` permiten reconstruir que peso estaba en produccion en cada momento, requisito habitual en entornos regulados.
- Comparacion de versiones de detector: mantener `v7a-lateral`, `v9a-lateral`, `v9b-lateral` y `v9b-lateral-calibrado` en el mismo repositorio facilita la evaluacion A/B entre iteraciones sobre un conjunto de validacion fijo.
- Integracion en un pipeline de vision existente: al usar la libreria Ultralytics, el modelo puede cargarse desde codigo Python y encadenarse con preprocesamiento propio mediante el contrato de preprocesamiento que acompaña al paquete.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de deteccion (mAP, precision, recall, IoU) ni de clasificacion (accuracy, F1). El autor menciona que el indice `models/INDEX.csv` del repositorio del proyecto incluye una metrica "cuando existe", pero ese fichero no forma parte de la informacion proporcionada, por lo que no se puede reproducir ningun valor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se declara numero de parametros ni resolucion de entrada, y ambos determinan el consumo. Como referencia orientativa, un detector de la familia Ultralytics con pesos de pocas decenas de MB suele inferir por debajo de 2 GB de VRAM en precision FP16, pero es una estimacion generica, no un dato del modelo.
- GPU recomendadas: no disponibles. No hay datos del autor que permitan recomendar un modelo concreto de GPU.
- Compatibilidad con GPU de consumo: el tamaño del repositorio (0,1 GB, que incluye varios paquetes mas metadatos y sumas de verificacion) sugiere pesos ligeros compatibles con GPU de consumo e incluso con inferencia en CPU, pero no se confirma en la documentacion.
- Opciones de despliegue: la libreria declarada es Ultralytics, por lo que el despliegue natural es la propia libreria Ultralytics en Python. No se mencionan exportaciones a ONNX, TensorRT, OpenVINO, TFLite ni integraciones con servidores de inferencia tipo Triton o TorchServe, ni despliegue con vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo de vision de este tipo.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de FPS, tiempo por imagen ni requisitos de camara.

## Comparativa con modelos similares

No hay datos de parametros, contexto ni rendimiento de PNAAT, por lo que la comparacion numerica no es posible. La tabla recoge la comparacion cualitativa disponible.

| Modelo | Categoria | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PNAAT (`Nerton/pnaat-modelos`) | Deteccion y clasificacion en inspeccion de PET | no disponible | no aplica | no disponible | no disponible | HuggingFace, 0 descargas |
| Detectores genericos basados en Ultralytics (YOLOv8/YOLO11) | Deteccion de objetos de proposito general | no disponible en esta ficha | no aplica | extensa y publica, no comparable aqui | varian segun version | ampliamente disponibles |
| Detectores tipo RT-DETR o Faster R-CNN | Deteccion de objetos de proposito general | no disponible en esta ficha | no aplica | extensa y publica, no comparable aqui | varian segun implementacion | ampliamente disponibles |

La diferencia principal de PNAAT frente a esas alternativas no es de rendimiento bruto, sino de especializacion: esta entrenado y versionado para un dominio concreto (tapa, cuerpo, borde y deformidad en botellas de PET) y acompaña cada peso con sumas de verificacion y metadatos de entrenamiento. No se dispone de evidencia de que supere o iguale a un detector generico ajustado al mismo dataset.

## Limitaciones y advertencias

- No se declara licencia ni en HuggingFace ni en la model card, por lo que el uso comercial queda en un limbo juridico: sin licencia explicita no hay cesion de derechos, y hay que contactar con el autor antes de cualquier despliegue en produccion.
- Sesgos conocidos: no disponibles. Al estar entrenado presumiblemente sobre un unico tipo de botella, iluminacion y linea de envasado, es esperable un rendimiento degradado fuera de esa distribucion, aunque el autor no documenta el dataset ni sus condiciones de captura.
- Riesgo de alucinacion: en deteccion de objetos el fenomeno equivalente son las detecciones espurias y los falsos negativos. No se publican curvas precision-recall ni umbrales recomendados, por lo que no se puede cuantificar.
- Limitaciones de contexto e idioma: no aplica contexto de lenguaje. La documentacion esta en portugues; no se ofrece version en castellano ni en ingles.
- Ausencia total de benchmarks y de ficha de modelo detallada: sin mAP, sin matriz de confusion y sin descripcion del dataset, el modelo no es evaluable de forma independiente con la informacion publicada.
- Versionado ambiguo: existen varias versiones laterales (`v7a`, `v9a`, `v9b`) y una calibrada, sin changelog que explique que cambia entre ellas ni que metrica mejora.
- Fecha de creacion del repositorio anomala (2026), sin actualizaciones posteriores ni actividad, y con 0 descargas y 0 likes, lo que indica que el modelo no ha pasado por ninguna validacion de la comunidad.
- Para produccion: hay que verificar los `SHA256SUMS` antes de desplegar, ya que el unico mecanismo de integridad declarado es el hash de los paquetes.
- No se documentan requisitos de hardware, formato de exportacion ni pasos de preprocesamiento mas alla de que "existe un contrato" en algunos paquetes.

## Enlaces

- HuggingFace: https://huggingface.co/Nerton/pnaat-modelos
- La busqueda web realizada no devolvio resultados relacionados con el modelo: los enlaces recuperados corresponden a plataformas de WeChat y no guardan relacion con PNAAT ni con HuggingFace.
- No se proporcionan enlaces a paper, blog tecnico, repositorio de codigo ni demo. La model card menciona un repositorio del proyecto que contiene `models/INDEX.csv`, pero no se facilita su URL.
