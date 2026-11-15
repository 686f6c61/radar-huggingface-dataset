# apexlabs-hq/sn44-dirtiness-v25

## Resumen

`apexlabs-hq/sn44-dirtiness-v25` es un detector de objetos basado en ONNX, publicado por el usuario `apexlabs-hq`, concebido como componente de inferencia para la tarea `manako/Detect-room-dirtiness-detection`. El modelo identifica cinco clases relacionadas con la suciedad de una estancia: derrames de líquido, cubos de basura, residuos dispersos, moho y manchas. No se trata de un modelo generativo ni de un LLM, sino de un detector visual ligero exportado a ONNX y pensado para ejecutarse con `onnxruntime` desde un script denominado `miner.py`.

La relevancia de esta publicacion es acotada: el repositorio tiene un tamano de 0.0 GB, cero descargas y cero likes en el momento de la consulta, no declara licencia ni idiomas, y la model card se limita a documentar hiperparametros de inferencia (tamano de imagen de entrada, umbrales de confianza por clase y reglas de supresion de duplicados). No se especifican arquitectura de red, numero de parametros, datos de entrenamiento ni resultados de benchmarks.

Por tanto, esta ficha debe leerse como una descripcion de un artefacto de despliegue ONNX para vision por computador orientado a la deteccion de suciedad en interiores, con informacion tecnica muy limitada y sin garantias documentadas sobre procedencia de datos, licencia o rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (detector de objetos exportado a ONNX; la model card no especifica la red base) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (se distribuye en formato ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de vision; las etiquetas de clase estan en ingles) |
| Licencia | no disponible |
| Formato de pesos | ONNX (ejecutado con `onnxruntime` mediante `miner.py`) |
| Tamano del repositorio | 0.0 GB |
| Imagen de entrada (`imgsz`) | 736 |
| Clases detectadas | liquid spillage, bin, litter, mould, stain |
| Umbral de confianza global | 0.05 |
| Umbrales por clase | {0: 0.3, 1: 0.45, 2: 0.3, 3: 0.3, 4: 0.3} |
| Supresion de duplicados entre clases | [(0, 3, 0.3), (0, 4, 0.3), (3, 4, 0.3)] |
| Hash SHA-256 de pesos | `d71e3eee8d30fa3e2507c0da3c53f557bcc080299d8037d0c3bc970fe8de9557` |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna. La model card unicamente indica que se trata de un detector ONNX servido por `miner.py` mediante `onnxruntime`, con un tamano de entrada fijado en 736 pixeles (`imgsz: 736`). El uso de umbrales de confianza por clase y de reglas de supresion de duplicados entre pares de clases (derrame con moho, derrame con mancha, moho con mancha) sugiere un pipeline de post-proceso orientado a reducir solapamientos entre categorias visualmente proximas, pero no se explicita el mecanismo (por ejemplo, NMS estandar, NMS por clase o supresion cruzada personalizada).

No se han publicado en la informacion proporcionada datos sobre el conjunto de entrenamiento (numero de imagenes, composicion, procedencia, anotaciones), sobre el proceso de optimizacion (funcion de perdida, aumento de datos, destilacion) ni sobre posibles fases de ajuste fino. Tampoco se indica la red subyacente (por ejemplo, familia YOLO u otra), aunque el campo `imgsz` y el esquema de umbrales por clase son habituales en detectores de la familia YOLO exportados a ONNX. Esta ultima observacion es una inferencia por convencion de nombres, no un dato confirmado en la model card.

## Capacidades

- Deteccion de objetos en imagenes de interiores con cinco clases: derrames de liquido, cubos de basura, residuos, moho y manchas.
- Inferencia en formato ONNX mediante `onnxruntime`, apta para despliegue en CPU o GPU sin dependencia de frameworks de entrenamiento.
- Post-proceso con umbral de confianza global (0.05) y umbrales especificos por clase, lo que permite ajustar la sensibilidad de cada categoria por separado.
- Supresion de duplicados entre clases visualmente relacionadas para evitar detecciones redundantes de un mismo fenomeno (por ejemplo, un derrame reportado tambien como mancha).
- No soporta generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni capacidades multilingues: es exclusivamente un modelo de vision.
- No se documentan capacidades de segmentacion, clasificacion de imagen completa ni estimacion de profundidad.

## Casos de uso

- Limpieza automatizada de estancias: el detector puede procesar capturas periodicas de una habitacion y generar alertas cuando aparezcan clases como `litter`, `stain` o `liquid spillage`, lo que permite priorizar la intervencion del personal de limpieza.
- Robots de servicio en interiores: integrado en el bucle de percepcion de un robot, el modelo aporta cajas delimitadoras de residuos o derrames para que el sistema planifique una ruta de recogida o limpieza.
- Control de calidad en hosteleria y alojamiento: analisis de imagenes de habitaciones tras el check-out para verificar la ausencia de manchas, moho o residuos antes de dar la estancia por lista.
- Monitorizacion de entornos sanitarios o alimentarios: deteccion temprana de moho o derrames en superficies donde la higiene es critica, con registro de las detecciones para auditoria.
- Inspeccion de mantenimiento de edificios: revision periodica de zonas humedas para localizar moho y manchas, con el objetivo de anticipar reparaciones.
- Procesamiento por lotes de imagenes historicas: al ser un artefacto ONNX ligero, puede ejecutarse sobre grandes volumenes de fotos almacenadas para etiquetar automaticamente episodios de suciedad y construir series temporales.
- Prototipado rapido en pipelines de vision: el formato ONNX y el script `miner.py` facilitan la integracion en servicios existentes basados en `onnxruntime` sin necesidad de portar pesos a PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como mAP, precision, recall, F1 ni latencia, y el repositorio no aporta un conjunto de evaluacion asociado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifican parametros ni tamano de los pesos; el repositorio indica 0.0 GB, dato que debe interpretarse con cautela porque puede reflejar un error de metadatos o un artefacto no cargado).
- GPU recomendadas: no disponibles. Al ser un modelo ONNX con entrada de 736 pixeles, es probable que quepa en GPUs de consumo, pero no hay datos publicados que lo confirmen ni que permitan estimar consumo de memoria.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: `onnxruntime` (documentado de forma explicita como motor de inferencia a traves de `miner.py`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de vision de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos sobre arquitectura base, numero de parametros ni metricas de rendimiento, por lo que no es posible establecer una comparacion cuantitativa fiable con otros detectores de objetos. Cualquier comparacion con detectores genericos de la familia YOLO u otros modelos de deteccion de suciedad requeriria datos que el autor no ha publicado.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede asumir permiso para uso comercial, redistribucion ni modificacion del modelo.
- La model card no documenta el origen de los datos de entrenamiento, lo que impide evaluar sesgos de dominio, cobertura de escenarios o posibles problemas de privacidad en las imagenes usadas.
- Riesgo de alucinacion en sentido amplio: como cualquier detector de objetos, puede generar falsos positivos, especialmente con umbrales tan bajos (0.05 global) y con clases visualmente solapadas como moho, mancha y derrame, lo que motivo las reglas de supresion entre pares.
- El modelo esta disenado para una tarea muy concreta (deteccion de suciedad en interiores); no es generalizable a otras tareas de vision sin reentrenamiento.
- No se especifican limitaciones de idioma porque el modelo no procesa texto; las etiquetas de clase estan en ingles, lo que exige mapeo si se integra en interfaces en castellano.
- Cero descargas y cero likes en el momento de la consulta: no existe evidencia publica de uso en produccion ni validacion independiente.
- El hash SHA-256 proporcionado permite verificar la integridad de los pesos, pero no garantiza su procedencia ni su calidad.
- Al ejecutarse via `miner.py`, el comportamiento final depende del codigo del script anfitrion, que no se incluye en la informacion disponible; conviene auditar el pipeline de post-proceso antes de desplegarlo.
- El dato de tamano de repositorio (0.0 GB) es ambiguo y no permite estimar requisitos reales de almacenamiento ni de memoria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/apexlabs-hq/sn44-dirtiness-v25
- Tarea de referencia citada en la model card: `manako/Detect-room-dirtiness-detection` (no se proporciona URL directa en la informacion disponible)
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
