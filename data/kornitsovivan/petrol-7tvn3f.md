# kornitsovivan/petrol-7tvn3f

## Resumen

`kornitsovivan/petrol-7tvn3f` es un detector de objetos publicado en Hugging Face por el usuario kornitsovivan, orientado especificamente a la deteccion de elementos de estaciones de servicio. El modelo identifica cuatro clases: surtidor de gasolina (petrol pump), manguera de surtidor (petrol hose), marquesina (roof canopy) y cartel de precios (price board). Se distribuye como un unico fichero ONNX acompanado de un script de inferencia en Python y un fichero de configuracion de despliegue.

Se trata de un artefacto de nicho, sin model card tecnica mas alla de la lista de clases y los ficheros del repositorio, sin descargas ni interacciones registradas y con un tamano de repositorio que figura como 0.0 GB (lo que sugiere pesos muy ligeros o un registro incompleto). No se declara arquitectura base, numero de parametros, resolucion de entrada ni dataset de entrenamiento.

Su relevancia es limitada fuera del caso de uso concreto: deteccion de componentes de gasolineras en imagenes, presumiblemente para inventario, inspeccion o analisis de precios. La licencia AGPL-3.0 condiciona fuertemente su uso en productos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (detector de objetos; pesos en ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye directamente en ONNX) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (`weights.onnx`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del detector: la model card no especifica si se trata de una familia YOLO, DETR, Faster R-CNN, RT-DETR u otra, ni el backbone empleado. Tampoco se documentan el numero de parametros, la resolucion de entrada esperada, las tecnicas de aumento de datos ni el procedimiento de anotacion.

Respecto al entrenamiento, no hay datos sobre el volumen del dataset, su composicion por clase, la procedencia de las imagenes ni si se aplicaron tecnicas de destilacion o ajuste fino desde un modelo preentrenado. El repositorio incluye `miner.py`, que expone una API `Miner(path).predict_batch(batch_images, offset, n_keypoints)`, y `chute_config.yml`, descrito como "the serving image", lo que apunta a un pipeline de inferencia por lotes con algun tipo de post-procesado basado en keypoints u offsets. No hay informacion publica sobre esas funciones.

## Capacidades

- Deteccion de objetos en imagenes con cuatro clases cerradas: surtidor de gasolina, manguera, marquesina y cartel de precios.
- Inferencia por lotes mediante `predict_batch`, lo que permite procesar conjuntos de imagenes de forma eficiente.
- Salida con offsets y keypoints (`offset`, `n_keypoints` como parametros de la API), lo que sugiere deteccion con puntos clave asociados a cada instancia, aunque la semantica exacta no esta documentada.
- Ejecucion sobre runtime ONNX, lo que facilita el despliegue en CPU, GPU o aceleradores compatibles sin depender del framework original.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision-lenguaje, audio ni generacion de texto: es exclusivamente un detector visual.

## Casos de uso

- Inventario de estaciones de servicio: procesar imagenes aereas o terrestres de gasolineras para contar surtidores y mangueras, usando la inferencia por lotes del script incluido.
- Monitorizacion de precios: detectar el cartel de precios (price board) en imagenes de estaciones para localizar la region de interes y encadenar despues un OCR externo que extraiga las cifras.
- Inspeccion de infraestructura: localizar marquesinas y surtidores en fotos de campo para auditorias de mantenimiento o verificacion de estado de instalaciones.
- Analisis de competencia a escala: rastrear imagenes publicas de estaciones de una zona geografica y contabilizar elementos por ubicacion.
- Anotacion asistida: usar el detector como preetiquetador en un pipeline de etiquetado humano, reduciendo el coste de anotar nuevas imagenes de estaciones.
- Despliegue en edge: al distribuirse en ONNX, puede ejecutarse en dispositivos con runtime ONNX (incluidas CPU sin GPU) para procesamiento local en camaras o vehiculos.
- Verificacion de cumplimiento de imagen de marca: comprobar la presencia y disposicion de marquesina y carteleria en franquicias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamano del repositorio figura como 0.0 GB, lo que impide estimar la huella del modelo; si los pesos son realmente ligeros, la inferencia podria caber en CPU.
- GPU recomendadas: no disponible. Al ser un modelo ONNX sin especificaciones, no se puede recomendar una GPU concreta (A100, H100, RTX 4090, etc.) con fundamento.
- Compatibilidad con GPU de consumo: no confirmada; depende del tamano real de `weights.onnx` y del proveedor de ejecucion ONNX elegido (CUDA, DirectML, TensorRT, etc.).
- Opciones de despliegue: ONNX Runtime (CPU o GPU), ONNX Runtime con TensorRT, o cualquier servidor compatible con ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de objetos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye arquitectura base ni resultados que permitan situar este detector frente a alternativas como YOLOv8/YOLO11, RT-DETR o DETR, y tampoco se identifican modelos publicos especificos para deteccion de componentes de gasolineras.

## Limitaciones y advertencias

- Model card minima: no se documentan arquitectura, datos de entrenamiento, metricas ni limitaciones, lo que impide evaluar su fiabilidad antes de desplegarlo.
- Sin validacion publica: cero descargas y cero likes en el momento de la consulta, sin evidencia de uso o revision por terceros.
- Dominio muy restringido: solo cuatro clases de estaciones de servicio; el rendimiento fuera de ese dominio es desconocido y probablemente degradado.
- Riesgo de alucinacion equivalente a falsos positivos: sin metricas de precision/recall no se puede acotar la tasa de detecciones erroneas, critica en tareas de conteo o auditoria.
- Licencia AGPL-3.0: el uso en servicios en red puede obligar a liberar el codigo fuente del sistema que lo integra; requiere revision legal antes de cualquier uso comercial propietario.
- Sin informacion sobre sesgos: no se conoce la distribucion geografica ni las condiciones de iluminacion del dataset, por lo que puede fallar en estaciones con disenos atipicos.
- Fecha de creacion futura en los metadatos (2026-11-14): conviene verificar la integridad y procedencia del repositorio antes de confiar en el.
- Dependencia del script `miner.py`: la API de inferencia no esta documentada y podria requerir dependencias no declaradas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kornitsovivan/petrol-7tvn3f
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
