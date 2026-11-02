# artur7236/ScoreVision

## Resumen

ScoreVision es un detector de objetos basado en YOLO11n, publicado por el usuario artur7236 en Hugging Face, orientado a la deteccion de suciedad en habitaciones dentro del subred 44 (Score) de la red Bittensor. El modelo identifica cinco clases de elementos: derrames de liquido, papeleras, basura, moho y manchas. Se distribuye como un unico fichero `model.onnx` con entrada de 640x640 y una cabeza de deteccion exclusivamente de cajas (sin rama de segmentacion ni clasificacion adicional), pensado para ejecutarse en CPU mediante onnxruntime a traves de `miner.py`.

El modelo se ha afinado a partir de la linea base Manako (licencia AGPL-3.0) usando rondas publicas de validadores e imagenes generadas. Las etiquetas de las imagenes generadas proceden del consenso de tres modelos publicos (Targaryen101/dirtiness_01, ninja990621/ScoreVision y dan2143/ScoreVision21). Los pesos finales promedian dos semillas y se mezclan con la linea base en una proporcion de 0,75.

Es relevante en el contexto de los mineros y validadores de Bittensor que participan en la tarea de deteccion de suciedad, ya que proporciona un artefacto compacto, desplegable en CPU y con reglas de post-procesado especificas en `config.json` (umbrales por clase, NMS, reglas de contencion y de tamano). El repositorio tiene un tamano practicamente nulo (0,0 GB reportados) y un numero muy bajo de descargas (4) y likes (0), lo que sugiere un modelo de uso interno o experimental mas que un artefacto ampliamente adoptado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n (detector de objetos de una etapa, cabeza solo de cajas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen 640x640) |
| Tipos de cuantizacion | no disponible (se distribuye un unico `model.onnx`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (`model.onnx`) |

## Arquitectura y entrenamiento

Se trata de un detector de objetos YOLO11n con entrada fija de 640x640 y cabeza de deteccion unicamente de cajas. El pipeline declarado es `object-detection` y la inferencia se realiza en CPU mediante onnxruntime, invocada desde `miner.py`. No se dispone de informacion sobre el numero de parametros, la composicion exacta del dataset ni el numero de tokens o imagenes de entrenamiento.

El proceso de entrenamiento parte de la linea base Manako (AGPL-3.0) y se afina sobre rondas publicas de validadores e imagenes generadas. Las etiquetas de las imagenes generadas se obtienen por consenso de tres modelos publicos (Targaryen101/dirtiness_01, ninja990621/ScoreVision y dan2143/ScoreVision21). Los pesos finales promedian dos semillas y se mezclan con la linea base con un factor de 0,75. El post-procesado se define en `config.json`: confianza por clase (papelera 0,5; mancha 0,25), NMS, una regla de contencion, un maximo de una caja para derrames y manchas, y reglas de tamano para papeleras pequenas y derrames de extension de suelo completa.

## Capacidades

- Deteccion de objetos en imagenes con cinco clases: derrame de liquido (liquid spillage), papelera (bin), basura (litter), moho (mould) y mancha (stain).
- Salida de cajas delimitadoras (box-only head), sin mascaras ni etiquetas adicionales.
- Post-procesado configurable por clase mediante `config.json`: umbrales de confianza, NMS y reglas geometricas (contencion, maximo de cajas para ciertas clases, reglas de tamano).
- Ejecucion en CPU con onnxruntime, sin requerir GPU.
- Integracion prevista con el flujo de mineros de Score (SN44) de Bittensor a traves de `miner.py`.
- No se declaran capacidades de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes ni multilingueismo.

## Casos de uso

- Inspeccion automatica de limpieza en habitaciones: el modelo detecta derrames, basura, moho y manchas en imagenes de 640x640, lo que permite puntuar el estado de una estancia sin intervencion humana.
- Participacion como minero en la subred Score (SN44) de Bittensor: el artefacto ONNX se ejecuta en CPU mediante `miner.py` y responde a la tarea `manako/Detect-room-dirtiness-detection` con las cinco clases definidas.
- Auditoria de calidad en alojamientos turisticos: procesar fotografias de habitaciones para identificar papeleras mal ubicadas, manchas o derrames antes de la entrega al cliente.
- Monitorizacion de espacios comunes en instalaciones: detectar basura o derrames en suelos mediante las reglas de tamano para derrames de extension de suelo completa definidas en `config.json`.
- Deteccion temprana de moho en viviendas: la clase `mould` permite alertar sobre presencia de hongos en superficies a partir de imagenes capturadas por camaras o moviles.
- Despliegue en dispositivos de borde sin GPU: al ejecutarse en CPU con onnxruntime y un unico fichero ONNX, puede integrarse en mini-PC, Raspberry Pi o contenedores ligeros para inspeccion continua.
- Generacion de datasets etiquetados: las salidas del modelo pueden usarse como pseudo-etiquetas para entrenar o ampliar detectores propios, dado el enfoque de consenso entre modelos del que parte su entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo esta pensado para ejecutarse en CPU con onnxruntime, por lo que no requiere VRAM dedicada.
- GPU recomendadas: no disponibles; el diseno declarado es CPU-only a traves de `miner.py`.
- Compatibilidad con GPU de consumo: no aplica segun la informacion disponible, ya que la inferencia se plantea en CPU.
- Opciones de despliegue: onnxruntime en CPU (ruta declarada); otros runtimes ONNX no se mencionan en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Clases | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| artur7236/ScoreVision | YOLO11n | 640x640 | 5 (derrame, papelera, basura, moho, mancha) | AGPL-3.0 | ONNX | Hugging Face |
| Manako (linea base) | no disponible | no disponible | no disponible | AGPL-3.0 | no disponible | referenciado como base |
| Targaryen101/dirtiness_01 | no disponible | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| ninja990621/ScoreVision | no disponible | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| dan2143/ScoreVision21 | no disponible | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento, parametros ni contexto para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo de vision especializado en deteccion de suciedad; no es un modelo de lenguaje ni soporta generacion de texto, razonamiento o codigo.
- Entrenado con etiquetas derivadas del consenso de tres modelos publicos, lo que puede propagar los sesgos y errores de dichos modelos.
- Uso de imagenes generadas en el entrenamiento: posible brecha de dominio respecto a fotografias reales y riesgo de sobreajuste a patrones sinteticos.
- Reglas de post-procesado muy especificas (maximo una caja para derrames y manchas, reglas de tamano) que pueden limitar la deteccion en escenarios fuera de la distribucion prevista.
- Sin informacion publicada sobre sesgos demograficos, geograficos o de iluminacion; no se puede garantizar un comportamiento equitativo en todos los entornos.
- Licencia AGPL-3.0: el uso en servicios en red puede obligar a liberar el codigo fuente derivado; revisar implicaciones antes de un despliegue comercial.
- Numero de descargas y likes muy bajo (4 y 0 respectivamente) y repositorio de 0,0 GB reportados; no hay evidencia de adopcion o validacion externa.
- No se especifican idiomas ni regiones; la salida es puramente visual.
- No hay benchmarks publicados que permitan estimar la precision real (mAP) frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/artur7236/ScoreVision
- Tarea de referencia: `manako/Detect-room-dirtiness-detection` (referenciada en la model card)
- Modelos usados para el consenso de etiquetas: Targaryen101/dirtiness_01, ninja990621/ScoreVision, dan2143/ScoreVision21
- Red Bittensor (subred Score, SN44): https://bittensor.com (referencia general de la red; no se proporciona enlace especifico en la informacion disponible)
