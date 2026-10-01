# masahiroid/table-transformer-detection-coreml

## Resumen

`masahiroid/table-transformer-detection-coreml` es una conversion no oficial a Core ML del modelo `microsoft/table-transformer-detection`, publicado por el usuario masahiroid en HuggingFace. Se trata de un detector de objetos especializado en localizar tablas dentro de imagenes de documentos (PDFs escaneados, fotografias de paginas, capturas), devolviendo cajas delimitadoras y la etiqueta correspondiente. La relevancia de esta ficha no esta en un nuevo modelo de lenguaje, sino en la disponibilidad del detector de tablas de Microsoft como artefacto Core ML ejecutable de forma local en iOS, iPadOS y macOS.

El modelo base es un DETR con backbone ResNet18 y 28,8 millones de parametros, desarrollado por Microsoft como parte de la familia Table Transformer (TATR), asociada al conjunto de datos PubTables-1M y a la metrica de evaluacion GriTS. Esta version concreta se ha convertido con `torch.jit.trace` y `coremltools`, en precision float16 y con un formato de entrada fijo de 800x800 en NCHW. Al ser un detector DETR, no tiene decodificador autorregresivo ni cache KV: toda la inferencia es un unico paso forward.

Es relevante ahora porque permite integrar deteccion de tablas en aplicaciones Apple sin dependencia de servidores ni de frameworks de Python en tiempo de ejecucion, con un peso de repositorio de aproximadamente 0,1 GB y licencia MIT. El modelo acumula 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que se trata de una publicacion muy reciente y sin adopcion registrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet18 (backbone) + DETR (encoder-decoder transformer, sin decodificador autorregresivo) |
| Parametros totales | 28,8 millones (28.8M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de deteccion de objetos; entrada de imagen fija 800x800) |
| Tipos de cuantizacion | float16 (fp16) |
| Idiomas soportados | en (etiqueta declarada; el modelo es de vision, no procesa texto) |
| Licencia | MIT |
| Formato de pesos | Core ML (`mlpackage`, `mlprogram`, `minimum_deployment_target=macOS14`); modelo base en PyTorch |
| Entrada | imagen RGB 800x800, NCHW, `pixel_values` float32 normalizado y `pixel_mask` int32 |
| Salida | `logits` (15, 3) y `pred_boxes` (15, 4) normalizados (center_x, center_y, width, height) |
| Etiquetas | `{0: "table", 1: "table rotated"}`, clase 2 = no object |

## Arquitectura y entrenamiento

La arquitectura del modelo base combina un backbone convolucional ResNet18 con un transformer DETR. El backbone extrae caracteristicas de la imagen y el transformer, mediante un conjunto fijo de consultas (queries), predice simultaneamente las cajas y las clases en un unico paso forward, sin necesidad de anclas ni de supresion de no maximos dependiente del modelo. En esta conversion Core ML se exponen 15 consultas por imagen, con una tercera clase reservada para "no object". La ausencia de decodificador autorregresivo implica que no requiere cache KV, lo que simplifica la conversion y la ejecucion en dispositivos Apple.

El proceso de conversion descrito por el autor consistio en `torch.jit.trace` seguido de `coremltools`, sin necesidad de aplicar parches (monkey patches) al grafo. El resultado es un `mlprogram` en float16 con destino minimo macOS 14 y entrada fija de 800x800 en NCHW. En cuanto al entrenamiento del modelo original de Microsoft, la informacion proporcionada solo indica su vinculacion con el conjunto PubTables-1M y con la metrica GriTS; no se detallan el numero de tokens, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Estos datos figuran como no disponibles en la informacion consultada.

## Capacidades

- Deteccion de tablas en imagenes de documentos: localiza regiones de tabla y devuelve cajas delimitadoras normalizadas.
- Distincion entre tablas en orientacion normal y tablas rotadas mediante las etiquetas `table` y `table rotated`.
- Salida estructurada por consulta: 15 grupos de `logits` y `pred_boxes` por imagen, con clase "no object" para consultas sin deteccion.
- Inferencia en un unico paso forward, sin decodificacion autorregresiva ni cache KV.
- Ejecucion local en dispositivos Apple a traves de Core ML.
- No dispone de generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso.
- No presenta capacidades multilingues en el sentido de procesamiento de lenguaje natural.
- No incluye modo de pensamiento (thinking), vision-language, audio ni modos especiales adicionales.

## Casos de uso

- Digitalizacion de documentos en aplicaciones iOS y macOS: la app carga una pagina escaneada, la redimensiona a 800x800 y usa el modelo para obtener las regiones de tabla antes de aplicar OCR u otro procesamiento.
- Preprocesado en pipelines de extraccion de datos de PDFs: el detector identifica las zonas tabulares de cada pagina, que despues se recortan y se envian a un extractor de estructura o a un motor de OCR especializado.
- Clasificacion y filtrado de documentos: en un flujo de ingesta masiva, el modelo permite descartar o priorizar paginas que contienen tablas frente a las que solo contienen texto corrido.
- Deteccion de orientacion incorrecta: la etiqueta `table rotated` permite marcar paginas con tablas giradas para que un paso posterior las enderece antes de la extraccion.
- Aplicaciones de escaneo de facturas, albaranes e informes financieros: la deteccion previa de tablas reduce el area que deben procesar los modulos de reconocimiento, mejorando el encuadre y el recorte.
- Procesamiento on-device sin conexion: al ejecutarse como modelo Core ML, puede operar en el dispositivo sin enviar documentos a un servidor, lo que resulta util en entornos con requisitos de privacidad.
- Asistentes de toma de notas y estudio: integrado en una app de camara o de captura de apuntes, puede resaltar automaticamente las tablas de un material escaneado para su posterior conversion a formato estructurado.
- Automatizacion documental en macOS: scripts o apps de escritorio pueden invocar el modelo para clasificar grandes volumenes de documentos antes de decidir el pipeline de tratamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, dado que se trata de un modelo de deteccion de objetos y no de lenguaje. El autor si documenta una validacion de precision comparando la salida fp16 de Core ML con la referencia PyTorch en fp32 sobre una unica imagen de validacion de COCO:

| Metrica | Resultado |
|---|---|
| Similitud coseno de `logits` | 0.9999995 |
| Similitud coseno de `boxes` | 1.0 |
| Coincidencia de etiquetas | 100% |

Esta comparacion se realizo sobre una sola imagen, por lo que constituye una comprobacion de fidelidad de la conversion, no una evaluacion exhaustiva de la calidad de deteccion del modelo.

## Requisitos de hardware

- Peso del modelo: los 28,8 millones de parametros en float16 equivalen a aproximadamente 57,6 MB de pesos, coherente con el tamano de repositorio declarado de 0,1 GB.
- Dispositivos objetivo: hardware Apple compatible con Core ML, con destino minimo de despliegue macOS 14. La inferencia puede ejecutarse en CPU, GPU o Apple Neural Engine segun lo decida Core ML.
- VRAM estimada: no disponible de forma explicita; al ser un modelo de vision de 28,8M de parametros en fp16, la huella es reducida y esta pensada para ejecucion local en dispositivos Apple.
- GPU dedicadas (A100, H100, RTX 4090): no aplica a este artefacto, ya que el formato de pesos es Core ML y no esta orientado a CUDA.
- Encaje en GPU de consumo: no aplica en el formato distribuido; el modelo base en PyTorch si es un modelo ligero que puede ejecutarse en GPU de consumo, pero ese caso no es el objetivo de esta conversion.
- Opciones de despliegue: Core ML a traves de `coremltools` en Python, o integracion directa en aplicaciones iOS/macOS mediante Xcode y el framework Core ML.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| masahiroid/table-transformer-detection-coreml (este) | 28,8M | Core ML (fp16, mlpackage) | 800x800 NCHW fija | MIT | HuggingFace |
| microsoft/table-transformer-detection (base) | 28,8M | PyTorch | 800x800 (configurable) | no disponible en la informacion proporcionada | HuggingFace |
| Variantes de Table Transformer para reconocimiento de estructura | no disponible en la informacion proporcionada | PyTorch | no disponible | no disponible | HuggingFace |

La alternativa mas directa es el propio modelo base en PyTorch, que ofrece mayor flexibilidad de entrada y no impone el formato Core ML, a cambio de requerir un entorno Python y no estar optimizado para despliegue en dispositivos Apple. No se han identificado en la informacion disponible otras conversiones Core ML comparables de este mismo detector.

## Limitaciones y advertencias

- Se trata de una conversion no oficial y no auditada por Microsoft; todo el merito del modelo original corresponde a sus autores.
- La validacion de precision se realizo sobre una unica imagen de COCO, por lo que la evidencia sobre la fidelidad de la conversion es limitada.
- La cuantizacion a float16 puede introducir pequenas desviaciones frente al modelo en fp32, aunque las metricas declaradas de similitud son muy altas.
- La entrada es fija a 800x800 y `pixel_mask` se traza asumiendo siempre unos; el uso con padding tipo letterbox para preservar la relacion de aspecto no esta verificado.
- El modelo solo detecta tablas; no reconoce la estructura interna de la tabla ni realiza OCR.
- No procesa lenguaje natural ni texto: sus etiquetas y su comportamiento estan ligados a la deteccion visual.
- La etiqueta de idioma es `en`, si bien se refiere a la metadata de la model card y no a una capacidad multilingue real del detector.
- La licencia del artefacto es MIT, pero conviene verificar la licencia del modelo base antes de un uso comercial en produccion.
- Con 0 descargas y 0 likes, no hay evidencia de adopcion ni de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/masahiroid/table-transformer-detection-coreml
- Modelo base: https://huggingface.co/microsoft/table-transformer-detection
- Documentacion de Core ML: https://developer.apple.com/documentation/coreml
- Herramienta de auditoria citada por el autor: https://github.com/masahirocom/model-audit-lite
- Otra conversion Core ML del mismo autor: https://huggingface.co/masahiroid/ruri-v3-310m-coreml
- Repositorio oficial de Table Transformer y PubTables-1M (referenciado en la busqueda): https://github.com/topics/table-detection
- Listado de modelos Core ML: https://github.com/likedan/Awesome-CoreML-Models
- Ficha del modelo base en theapplied.co: https://theapplied.co/models/microsoft-table-transformer-detection
