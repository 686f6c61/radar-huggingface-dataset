# manako/Detect-petrol-station-1-0-winner

## Resumen

Detect-petrol-station-1-0-winner es un modelo de deteccion de objetos en formato ONNX publicado por el usuario manako en HuggingFace. No se trata de un modelo de lenguaje ni de un modelo fundacional, sino de un detector especializado en cuatro clases de objetos vinculadas a estaciones de servicio: surtidores de combustible (petrol pump), mangueras (petrol hose), marquesinas (roof canopy) y paneles de precios (price board). El repositorio ocupa aproximadamente 0,2 GB y el artefacto de inferencia declarado en la model card pesa unos 9,88 MB.

El modelo se presenta como la conversion de un "miner ganador" a un elemento de libreria. Segun los metadatos de la model card, proviene del repositorio `Fernandes08/ScoreVision_yuto231` en la revision `2a25031d31778bf19d79fa2c723d4b98d4e62d0a`, y se corresponde con el elemento de manifiesto `manak0/Detect-petrol-station-1-0`. La nomenclatura (subnet winner, miner, manifest) sugiere que el modelo se genero en el contexto de una subred de mineria de modelos tipo Bittensor, aunque esta informacion no se confirma de forma explicita en la documentacion disponible.

Su relevancia es acotada y muy vertical: sirve como componente de vision por computador para tareas de inventario, inspeccion o monitorizacion de estaciones de servicio. No hay informacion publica sobre arquitectura interna, datos de entrenamiento ni licencia, lo que limita seriamente su evaluacion para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (detector de objetos; estructura interna no documentada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | ONNX (runtime: onnxruntime) |

Datos adicionales declarados en la model card: metrica E = 0,06074218, mAP50 = 0,600000 y tamano del artefacto = 9,877814 MB.

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del detector. La model card unicamente indica que el tipo de elemento es `Detect` y que el tipo de modelo en tiempo de ejecucion es `onnxruntime`, lo que implica que el grafo se ejecuta mediante ONNX Runtime. No se especifica si la red base es una familia YOLO, Faster R-CNN, RetinaNet, DETR o cualquier otra, ni el numero de parametros, la resolucion de entrada o el esquema de anclas.

Tampoco hay datos sobre el conjunto de entrenamiento: numero de imagenes, procedencia, composicion por clase, tecnicas de aumento de datos, funcion de perdida ni proceso de validacion. El unico dato de rendimiento declarado es mAP50 = 0,600000, que corresponde a la metrica reportada en el manifiesto de origen, sin desglose por clase ni informacion sobre mAP50-95, precision, recall o curvas PR. No se documenta ningun proceso de RLHF, DPO ni ajuste por preferencias, algo por otra parte esperable en un detector de objetos.

## Capacidades

- Deteccion de objetos en imagenes para cuatro clases: surtidor de combustible, manguera de combustible, marquesina y panel de precios.
- Inferencia mediante ONNX Runtime, lo que permite despliegue portable en CPU y GPU sin dependencia de frameworks de entrenamiento.
- Artefacto de pequeno tamano (aproximadamente 9,88 MB), adecuado para entornos con recursos limitados o despliegue en el borde.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo thinking, vision generativa, audio ni ninguna capacidad multimodal mas alla de la deteccion visual.
- No se documentan capacidades de segmentacion, clasificacion o estimacion de pose.

## Casos de uso

- Inventario automatizado de estaciones de servicio: el detector puede localizar surtidores y mangueras en imagenes de camaras fijas para contar elementos y detectar faltantes o danos, aprovechando que el modelo esta entrenado especificamente para esas clases.
- Monitorizacion de marquesinas: integrado en un pipeline de vision con camaras en altura, permite verificar la presencia y el estado de la cubierta mediante detecciones de la clase roof canopy.
- Auditoria de paneles de precios: el modelo localiza los paneles (price board) en la imagen, lo que sirve como paso previo a un OCR que extraiga los precios y los compare con los valores oficiales.
- Inspeccion de mantenimiento: al detectar mangueras y surtidores, se puede alimentar un sistema de alertas cuando una manguera aparece desconectada o fuera de su posicion esperada.
- Analitica de ocupacion y flujo: combinado con un rastreador multi-objeto, las detecciones de surtidores permiten estimar que posiciones estan en uso en cada momento.
- Preprocesado para modelos mayores: como etapa de region proposal barata (9,88 MB, ONNX), recorta las areas de interes antes de pasarlas a un modelo de vision-lenguaje o a un OCR, reduciendo coste computacional.
- Despliegue en el borde: por su tamano reducido y su formato ONNX, puede ejecutarse en dispositivos con poca memoria dentro de la propia estacion, sin enviar imagenes a la nube.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| mAP50 | 0,600000 | Declarado en la model card |
| E (metrica compuesta) | 0,06074218 | Declarado en la model card |
| Tamano del artefacto | 9,877814 MB | Declarado en la model card |

No se han publicado resultados desglosados por clase, mAP50-95, precision, recall ni comparaciones con otros detectores en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano del artefacto (9,88 MB) es previsible que quepa en cualquier GPU consumer con varios GB de VRAM, pero no se confirma.
- GPU recomendadas: no disponibles. Un detector de este tamano suele ejecutarse sin problema en GTX 1650, RTX 3060, RTX 4090, A100 o H100, pero no hay datos oficiales.
- Compatibilidad con GPU consumer: probable por el tamano, aunque no verificado.
- Opciones de despliegue: ONNX Runtime (declarado). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Clases | Formato | Licencia | mAP50 |
|---|---|---|---|---|---|
| Detect-petrol-station-1-0-winner | Detector de objetos | 4 (surtidor, manguera, marquesina, panel) | ONNX | no disponible | 0,600 |
| YOLOv8n (referencia generica) | Detector de objetos | 80 (COCO) | PyTorch/ONNX | AGPL-3.0 | no comparable directamente |
| YOLOv5n (referencia generica) | Detector de objetos | 80 (COCO) | PyTorch/ONNX | GPL-3.0 | no comparable directamente |

No se dispone de informacion sobre otros detectores especializados en estaciones de servicio con los que comparar de forma directa. Las alternativas genericas citadas no estan entrenadas para estas cuatro clases, por lo que la comparacion de mAP no es equivalente.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre arquitectura, datos de entrenamiento y proceso de validacion, lo que impide auditar el modelo.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Es un riesgo critico para produccion.
- El mAP50 de 0,600 es moderado y no se desglosa por clase; alguna de las cuatro clases podria tener un rendimiento muy inferior.
- No hay informacion sobre sesgos, condiciones de iluminacion, climatologia, angulos de camara o dominios de imagen cubiertos, lo que aumenta el riesgo de fallos fuera de la distribucion de entrenamiento.
- Riesgo de falsos positivos y negativos no cuantificado (sin curvas PR ni umbrales recomendados).
- Origen en un "miner ganador" de una subred: la procedencia y la cadena de custodia del modelo no estan verificadas de forma independiente.
- El repositorio registra 0 descargas y 0 likes, sin evidencia de uso o validacion por parte de la comunidad.
- No se especifica la resolucion de entrada ni el preprocesado requerido, lo que puede provocar resultados inconsistentes si se usa sin la configuracion original.

## Enlaces

- HuggingFace: https://huggingface.co/manako/Detect-petrol-station-1-0-winner
- Repositorio ganador de origen: https://huggingface.co/Fernandes08/ScoreVision_yuto231
- Revision de origen: 2a25031d31778bf19d79fa2c723d4b98d4e62d0a
- Elemento de manifiesto: manak0/Detect-petrol-station-1-0
