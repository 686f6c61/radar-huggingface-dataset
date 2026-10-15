# cellmap/nuc-unetiso-setup-55

## Resumen

nuc-unetiso-setup-55 es un modelo de segmentacion semantica 3D desarrollado por el equipo CellMap (Janelia Research Campus, HHMI) para identificar nucleos (clase "nuc") en volumenes de microscopia electronica de doble haz (FIB-SEM) con voxeles de 128 nm. Se trata de una red U-Net 3D isotropica entrenada durante 330.000 iteraciones dentro del experimento "exp_mito" (setup_55). El modelo recibe un unico canal de entrada y devuelve un unico canal de salida con logits sin normalizar.

A diferencia de los modelos de lenguaje, no es un modelo generativo ni conversacional: es un segmentador denso voxel a voxel. Su relevancia radica en que forma parte de la infraestructura abierta de CellMap para reconstruir tejido biologico a escala nanometrica a partir de imagenes de microscopia, un cuello de botella clasico en neurociencia y biologia celular. El repositorio ocupa aproximadamente 0,1 GB y se distribuye bajo licencia BSD-3-Clause, lo que permite uso comercial.

La arquitectura concreta es Unet3dIso con normalizacion por lotes (BatchNorm), MaxPool y ConvTranspose, y convoluciones validas que consumen 88 voxeles de contexto por eje. La entrada de inferencia tiene forma 300x300x300 y produce una salida de 212x212x212. No se especifican el numero de parametros, los idiomas ni datos de entrenamiento mas alla de los indicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Unet3dIso (U-Net 3D isotropica) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de segmentacion, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye en precision nativa; el formato ONNX admitiria cuantizacion, no documentada) |
| Idiomas soportados | no aplicable (procesa imagenes, no texto) |
| Licencia | bsd-3-clause |
| Formato de pesos | torch.export (model.pt2), TorchScript (model.ts), ONNX (model.onnx + model.onnx.data), metadata.json |
| Framework | torch |
| Dimensiones espaciales | 3 |
| Canales de entrada | 1 |
| Canales de salida | 1 |
| Clases | nuc |
| Iteracion de entrenamiento | 330000 |
| Tamano de voxel (entrada y salida) | 128 x 128 x 128 nm |
| Forma de entrada en inferencia | 300 x 300 x 300 |
| Forma de salida en inferencia | 212 x 212 x 212 |
| Normalizacion de entrada | min_max, min = -1.0, max = 1.0 |
| Activacion de salida | sigmoid, aplicada despues del modelo |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es una U-Net tridimensional isotropica (Unet3dIso) construida sobre PyTorch. Emplea bloques con BatchNorm, reduccion espacial mediante MaxPool y recuperacion de resolucion mediante ConvTranspose. Un detalle relevante es el uso de convoluciones validas: cada eje pierde 88 voxeles de contexto entre entrada y salida, de modo que una entrada de 300x300x300 genera una salida de 212x212x212. La red devuelve logits en bruto, por lo que la funcion sigmoide debe aplicarse de forma explicita tras la inferencia para obtener probabilidades.

El entrenamiento se realizo sobre datos de FIB-SEM con voxeles de 128 nm, dentro del experimento "exp_mito", hasta la iteracion 330.000. El modelo se publica con la etiqueta de salida "nuc", lo que indica segmentacion de nucleos. No se ha facilitado en la informacion disponible el numero total de tokens o, en este caso, de volumenes de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de ajuste como RLHF o DPO (no aplicables a un segmentador). Tampoco se detalla el numero de parametros ni la profundidad de la red.

## Capacidades

- Segmentacion semantica 3D de nucleos celulares en volumenes de microscopia electronica FIB-SEM.
- Salida densa voxel a voxel, con un unico canal de logits para la clase "nuc".
- Procesamiento isotropico a resolucion de 128 nm por voxel.
- Inferencia sobre parches o volumenes de hasta 300x300x300 voxeles de entrada.
- Exportacion multi-formato: torch.export, TorchScript y ONNX, lo que permite despliegue en servidores y en navegador.
- Posibilidad de ajuste fino (finetuning) a traves de la API CellmapModel.train().
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo "thinking", vision general, audio ni ninguna capacidad generativa.

## Casos de uso

- Segmentacion de nucleos en volumenes FIB-SEM: el modelo recibe un volumen de 300x300x300 voxeles a 128 nm y devuelve una mascara de 212x212x212 con la probabilidad de nucleo por voxel, lista para umbralizar y vectorizar.
- Cuantificacion morfometrica: a partir de la mascara segmentada se pueden calcular volumen, superficie, esfericidad y densidad nuclear por region de tejido, un analisis habitual en biologia celular cuantitativa.
- Reconstruccion y analisis de conectividad tisular: la segmentacion nuclear sirve como referencia espacial para alinear y validar reconstrucciones de celulas completas en conjuntos de datos de microscopia de volumen.
- Integracion en pipelines de microscopia de alto rendimiento: al exportarse a ONNX, el modelo se puede incrustar en flujos automatizados que procesan grandes series de imagenes FIB-SEM en servidores con GPU.
- Despliegue en navegador o aplicaciones web: existe una version ONNX publicada en cellmap/onnx-web-models/setup_55, pensada para ejecutar la segmentacion directamente en el cliente sin infraestructura de servidor.
- Transferencia de aprendizaje: la API de entrenamiento permite ajustar el modelo a nuevas modalidades de imagen, resoluciones de voxel o clases celulares partiendo de los pesos preentrenados.
- Control de calidad de adquisiciones: la salida del modelo puede usarse para detectar volumenes mal alineados o con bajo contraste comparando la cobertura nuclear esperada con la predicha.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Como referencia orientativa, procesar un volumen de 300x300x300 en FP32 requiere mantener mapas de activacion tridimensionales, por lo que se estima un consumo del orden de varios gigabytes de VRAM; no debe tomarse como cifra oficial.
- GPU recomendadas: no especificadas. Cualquier GPU con soporte CUDA y varios gigabytes de memoria deberia ser suficiente para inferencia por parches; para volmenes grandes o entrenamiento se recomiendan GPUs de gama profesional (A100, H100) o de consumo con al menos 12-16 GB (RTX 4080, RTX 4090).
- Compatibilidad con GPU de consumo: probable para inferencia por parches en FP32 o FP16, siempre que se gestione la memoria de activaciones; no confirmado por el autor.
- Opciones de despliegue: PyTorch (model.pt2 via torch.export), TorchScript (model.ts), ONNX Runtime (model.onnx), y la libreria cellmap-models mediante `pip install cellmap-models`.
- Frameworks no aplicables: no se ofrece soporte para vLLM, llama.cpp, Ollama ni TGI, ya que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| cellmap/nuc-unetiso-setup-55 | U-Net 3D isotropica, segmentacion de nucleos | 300x300x300 voxeles a 128 nm | BSD-3-Clause | HuggingFace (este repositorio) |
| Otros setups de CellMap (exp_mito) | U-Nets 3D variantes | no disponible | no disponible | HuggingFace (organizacion cellmap) |
| cellmap/onnx-web-models/setup_55 | Version ONNX para web | no disponible | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado: solo segmenta la clase "nuc" en imagenes FIB-SEM a 128 nm; su rendimiento fuera de esa modalidad o resolucion no esta garantizado.
- Salida en logits brutos: es imprescindible aplicar la sigmoide indicada y un umbral de decision; omitir este paso produce resultados invalidos.
- Convoluciones validas: la salida pierde 88 voxeles de contexto por eje, por lo que hay que compensar con solapamiento o padding externo al procesar volumenes completos.
- Sin metricas publicadas: no se han facilitado valores de IoU, Dice, precision o recall, lo que dificulta evaluar su calidad objetiva antes de usarlo.
- Riesgo de falsos positivos y falsos negativos: al ser un segmentador, los errores se manifiestan como sobre/subsegmentacion, especialmente en regiones de bajo contraste o nucleos solapados.
- Sesgos de dominio: al entrenarse en un unico experimento (exp_mito) y una unica modalidad de imagen, puede presentar sesgos hacia el tipo de tejido, tincion o protocolo de adquisicion de ese conjunto.
- Licencia BSD-3-Clause: permite uso comercial y modificacion con atribucion y sin garantia implicita; conviene conservar el aviso de copyright.
- Cita requerida: el autor indicado es Marwan Zouinkhi; en publicaciones derivadas deberia citarse adecuadamente al equipo CellMap.
- Escasa trazabilidad: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que implica poca validacion externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cellmap/nuc-unetiso-setup-55
- Repositorio cellmap-models: https://github.com/janelia-cellmap/cellmap-models
- Proyecto CellMap (Janelia): https://www.janelia.org/project-team/cellmap
- Version ONNX para web: https://huggingface.co/cellmap/onnx-web-models
