# apexlabs-hq/sn44-dirtiness-v19

## Resumen

`apexlabs-hq/sn44-dirtiness-v19` es un modelo de deteccion de objetos exportado a formato ONNX, disenado especificamente para identificar condiciones de suciedad en entornos de interior. El repositorio lo publica el usuario `apexlabs-hq` y la model card lo describe como un "detector end-to-end" servido mediante `miner.py` sobre el runtime `onnxruntime`, lo que sugiere un uso orientado a pipelines de inferencia ligeros y desacoplados de frameworks de entrenamiento.

El modelo deriva de un detector previo (`manako/Detect-room-dirtiness-detection`) y trabaja sobre cinco clases: derrame de liquido (`liquid spillage`), papelera (`bin`), residuos (`litter`), moho (`mould`) y manchas (`stain`). La resolucion de entrada configurada es de 736 pixeles (`imgsz: 736`) con un umbral de confianza global de 0,05 y umbrales por clase de 0,5, lo que indica un filtrado agresivo de detecciones de baja confianza en la fase de post-procesado.

La relevancia de este modelo es acotada: no es un modelo generativo ni un LLM, sino un artefacto de vision por computador de proposito especifico, probablemente vinculado a un subred de mineria (el prefijo `sn44` sugiere Subnet 44 de Bittensor). Su interes practico reside en la inspeccion automatizada de limpieza en instalaciones, y su utilidad depende enteramente del pipeline que lo sirve.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (detector de objetos exportado a ONNX; la model card no especifica la familia de red base) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (el artefacto distribuido es ONNX; se desconoce si esta cuantizado) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | ONNX |
| Resolucion de entrada | 736 x 736 (`imgsz: 736`) |
| Clases detectadas | liquid spillage, bin, litter, mould, stain |
| Umbral de confianza global | 0,05 |
| Umbrales por clase | 0,5 para las clases 0 a 4 |
| Hash SHA-256 de pesos | `a5d8b23941f36c19acc233c5430d260f279cf1985f57a47d7be5a474337471c1` |
| Runtime de inferencia | onnxruntime (via `miner.py`) |
| Tamano del repositorio | 0,0 GB (segun Hugging Face) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna. La model card unicamente indica que se trata de un detector end-to-end exportado a ONNX y servido con `onnxruntime`. El nombre del modelo base (`manako/Detect-room-dirtiness-detection`) y la presencia de un parametro `imgsz` con valor 736 apuntan a la convencion de exportacion de Ultralytics (familia YOLO), pero esto es una inferencia a partir de la nomenclatura y no un dato confirmado en la informacion proporcionada.

No se especifican el volumen de datos de entrenamiento, la composicion del dataset, el numero de imagenes por clase, si hubo aumento de datos, ni si se aplicaron tecnicas de destilacion o fine-tuning sobre un checkpoint previo. Tampoco se documenta el proceso de exportacion a ONNX (opset, simplificacion, precision numerica). Todos estos datos deben considerarse **no disponibles**.

## Capacidades

- Deteccion de objetos en imagenes de interiores para cinco categorias de suciedad: derrames de liquido, papeleras, residuos, moho y manchas.
- Inferencia end-to-end en un unico paso mediante ONNX Runtime, sin dependencia de PyTorch en produccion.
- Filtrado por umbral de confianza configurable, con umbrales globales y por clase.
- Entrada de imagen a resolucion fija de 736 x 736.
- No soporta generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa lenguaje).
- No dispone de modo thinking, vision multimodal descriptiva ni audio.

## Casos de uso

- Inspeccion automatizada de limpieza en oficinas: el detector se ejecuta sobre capturas periodicas de camaras fijas para generar alertas cuando aparece `litter` o `liquid spillage` por encima del umbral de 0,5, permitiendo priorizar al personal de limpieza.
- Monitorizacion de cocinas industriales: la clase `mould` permite detectar proliferacion de moho en zonas humedas y activar protocolos de sanidad antes de que el problema se extienda.
- Verificacion de estado en alquileres vacacionales: integrado en una app movil, el modelo procesa fotos del inquilino al hacer check-out y compara con el estado inicial para detectar `stain` o residuos.
- Robotica de limpieza autonoma: el detector ONNX se embebe en el pipeline de percepcion de un robot aspirador o de desinfeccion para localizar objetivos concretos (`bin`, `litter`) y planificar la ruta.
- Auditoria de instalaciones sanitarias: en hospitales o residencias, la deteccion de `stain` y `mould` en banos permite generar informes de higiene con evidencia fotografica y trazabilidad.
- Control de calidad en hosteleria: procesamiento por lotes de imagenes de sala y cocina al cierre del turno para verificar que no quedan residuos visibles antes de abrir al publico.
- Triaje en pipelines de datos de mineria (subnet): el modelo puede actuar como nodo de validacion en un subnet de Bittensor, puntuando imagenes de suciedad segun las detecciones producidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan valores de mAP, precision, recall, F1 por clase, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser un detector ONNX de resolucion 736, es probable que quepa en GPUs de gama baja, pero no se confirma en la informacion.
- GPU recomendadas: no disponibles. Un detector de este tipo suele ejecutarse correctamente en GPUs consumer (GTX 1660, RTX 3060, RTX 4090) y en CPU mediante onnxruntime, pero no hay datos oficiales.
- Compatibilidad con GPU consumer: probable pero no confirmada.
- Opciones de despliegue: `onnxruntime` (Python, C++, C#), y potencialmente `onnxruntime-web` o `onnxruntime-node` para despliegue en navegador o edge. El script `miner.py` referenciado en la model card es el punto de entrada documentado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni datos de rendimiento que permitan establecer una comparacion cuantitativa con alternativas como YOLOv8, YOLOv11, RT-DETR o DETR. Tampoco se detalla la familia arquitectonica base, lo que impide emparejarlo con un checkpoint concreto.

## Limitaciones y advertencias

- La model card es extremadamente escueta: no documenta arquitectura, datos de entrenamiento, metricas ni proceso de validacion.
- El repositorio tiene 0 descargas y 0 likes, y un tamano reportado de 0,0 GB, lo que sugiere que los pesos pueden no estar efectivamente alojados o que el conteo de tamano no se ha actualizado.
- La licencia no esta declarada, lo que impide determinar si el uso comercial esta permitido. En ausencia de licencia explicita, debe asumirse uso restringido por defecto.
- El umbral de confianza global de 0,05 es muy bajo y generara numerosos falsos positivos si no se aplica el filtrado por clase de 0,5.
- La resolucion fija de 736 x 736 limita la deteccion de objetos muy pequenos o muy grandes en la imagen original; no se documenta si el pipeline hace letterboxing o redimensionado directo.
- No hay informacion sobre sesgos del dataset: la deteccion de `mould` o `stain` puede verse afectada por condiciones de iluminacion, tipo de superficie o sesgo geografico del conjunto de entrenamiento.
- Riesgo de alucinacion: en el contexto de deteccion, se traduce en falsos positivos, especialmente con el umbral global de 0,05.
- No se documenta el opset de ONNX ni la compatibilidad con versiones concretas de onnxruntime, lo que puede provocar fallos de carga en entornos con versiones antiguas.
- El nombre `sn44-dirtiness-v19` sugiere un contexto de subred de mineria (probablemente Bittensor Subnet 44); su uso fuera de ese ecosistema no esta documentado ni soportado oficialmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/apexlabs-hq/sn44-dirtiness-v19
- Modelo base referenciado: https://huggingface.co/manako/Detect-room-dirtiness-detection
- Documentacion de ONNX Runtime: https://onnxruntime.ai/docs/
- Repositorio de ONNX Runtime en GitHub: https://github.com/microsoft/onnxruntime
