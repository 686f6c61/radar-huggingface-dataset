# cellmap/mito-aff-unetiso-setup-53-2d

## Resumen

mito-aff-unetiso-setup-53-2d es un modelo de segmentación de mitocondrias en imágenes de microscopía electrónica (FIB-SEM) desarrollado por el equipo CellMap del Janelia Research Campus (autor de la ficha: Marwan Zouinkhi). El modelo predice afinidades de mitocondria en los tres ejes del volumen (mito_aff_z, mito_aff_y, mito_aff_x), que después se transforman en instancias segmentadas mediante un postproceso de aglomeración. No es un modelo de lenguaje: es una red convolucional de visión aplicada a imágenes biológicas.

Técnicamente es un estudiante 2D destilado del modelo tridimensional cellmap/mito-aff-unetiso-setup-53. La arquitectura de partida es una U-Net 3D isotrópica (BatchNorm, MaxPool y ConvTranspose) en la que todas las capas 3D se han reconvertido a 2D, de modo que el modelo procesa un único corte z por pasada, con una entrada de 1 canal y una salida de 3 canales en forma de logits crudos (la sigmoide se aplica fuera del modelo). El estudiante se destiló durante 60.000 iteraciones mediante el script train_2d_distill.py.

Su relevancia práctica está en el coste: al operar en 2D, la huella de memoria y el coste computacional por corte son mucho menores que los de su profesor 3D, lo que facilita procesar volúmenes FIB-SEM completos por partes, desplegar inferencia en navegador vía ONNX y reutilizar el modelo para preanotación o ajuste fino. Se distribuye bajo licencia BSD-3-Clause, con pesos en PyTorch, TorchScript y ONNX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Unet3dIso2d (U-Net 3D isotropica con todas las capas 3D convertidas a 2D) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; campo receptivo de 88 pixeles por eje |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de vision, no linguistico) |
| Licencia | BSD-3-Clause |
| Formato de pesos | PyTorch pickle (.pt), TorchScript (.ts), ONNX (.onnx), state dict (.pt) |
| Dimension espacial | 3 (etiquetada como 3D, inferencia 2D corte a corte) |
| Canales de entrada | 1 |
| Canales de salida | 3 |
| Nombres de canales de salida | mito_aff_z, mito_aff_y, mito_aff_x |
| Tamano de voxel de entrada | 16, 16, 16 nm |
| Tamano de voxel de salida | 16, 16, 16 nm |
| Forma de entrada en inferencia | 1, 556, 556 |
| Forma de salida en inferencia | 1, 468, 468 |
| Normalizacion de entrada | min_max con min = -1.0 y max = 1.0 |
| Activacion de salida | sigmoide, aplicada despues del modelo (apply_after_model: true) |
| Iteracion de destilacion | 60000 pasos |
| Dominio de aplicacion | Microscopia electronica FIB-SEM, segmentacion de mitocondrias |
| Libreria | cellmap-models |

## Arquitectura y entrenamiento

La arquitectura base es una U-Net isotrópica 3D con normalización por lotes (BatchNorm), capas de MaxPool para el camino descendente y ConvTranspose para el ascendente. En esta variante 2D, cada capa 3D del profesor se ha reconvertido a su equivalente 2D, de modo que la red consume un tensor de entrada [N, 1, 1, H, W] (un único corte z con un canal) y produce tres mapas de logits con la misma resolución espacial reducida (468x468 para una entrada de 556x556). El campo receptivo efectivo es de 88 píxeles por eje, lo que determina cuánto contexto local ve la red en cada predicción.

El entrenamiento es un proceso de destilación del profesor cellmap/mito-aff-unetiso-setup-53 durante 60.000 iteraciones, ejecutado con train_2d_distill.py. La información disponible no detalla el volumen del dataset de destilación, su composición ni si se aplicaron etapas adicionales de ajuste. La salida son logits crudos de afinidad por eje, pensados para alimentar un postproceso de segmentación (aglomeración tipo watershed sobre las afinidades), no máscaras de instancia directas.

## Capacidades

- Prediccion de afinidades de mitocondria en los tres ejes del volumen (z, y, x) a partir de un solo corte 2D de FIB-SEM.
- Segmentacion de mitocondrias previo postproceso: las afinidades deben convertirse en instancias mediante aglomeracion o watershed.
- Inferencia a resolucion isotropica de 16 nm, con normalizacion min-max a [-1, 1] y activacion sigmoide aplicada externamente.
- Exportacion multiplataforma: PyTorch, TorchScript y ONNX, lo que habilita despliegue en servidor, en local y en navegador (version web publicada como cellmap/onnx-web-models/setup_53_2d).
- Ajuste fino disponible: el repositorio incluye model_state_dict.pt, model_def.py, student_2d.py y torch_source.json para reconstruir el modulo y reentrenar.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades linguisticas: es un modelo puramente visual.

## Casos de uso

- Segmentacion de mitocondrias en volumenes FIB-SEM completos: el modelo procesa corte a corte con solo 88 píxeles de contexto por eje, lo que permite analizar stacks de gran tamano sin cargar el volumen entero en memoria.
- Preanotacion para entrenamiento de modelos 3D: las afinidades del estudiante 2D pueden servir como etiquetas iniciales sobre las que un anotador humano o un profesor 3D refinen, reduciendo el coste de anotacion manual.
- Analisis morfologico mitocondrial: a partir de las instancias segmentadas se pueden medir volumen, elongacion, ramificacion y red mitocondrial en estudios de biologia celular.
- Despliegue en navegador o en herramientas ligeras: la disponibilidad de ONNX y de una version web permite integrar la inferencia en interfaces de visualizacion sin backend GPU dedicado.
- Procesamiento por lotes en pipelines de microscopia: al ser una red 2D, se puede paralelizar por cortes en CPU o GPU modestas, encajando en flujos automatizados de adquisicion y analisis.
- Ajuste fino sobre tejido o protocolo propio: el state dict plano y el codigo del modulo permiten reentrenar el modelo con datos de otro organismo, otro microscopio o distinta relacion senal-ruido.
- Estudios comparativos de condicion patologica: la segmentacion cuantitativa de mitocondrias permite comparar muestras control frente a tratadas, por ejemplo en toxicologia mitocondrial o modelos de enfermedad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de validacion (por ejemplo IoU, Dice o F1 de instancias) ni comparaciones cuantitativas con el profesor 3D.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El autor no publica cifras de consumo de memoria. Como referencia, el tensor de entrada declarado (1x556x556 en fp32) ocupa aproximadamente 1,2 MB, por lo que la huella vendra dominada por los mapas de activacion de la U-Net.
- GPU recomendadas: no disponible. Al tratarse de una red 2D con una unica entrada por pasada, es previsible que quepa en GPU de consumo, pero no hay cifras oficiales.
- Cabe en consumer GPU: previsiblemente si, dado el caracter 2D y el tamano de entrada moderado, si bien se trata de una estimacion orientativa y no de un dato publicado.
- Opciones de despliegue: PyTorch (torch.load), TorchScript (torch.jit.load), ONNX Runtime (onnxruntime.InferenceSession) y la libreria cellmap-models mediante CellmapModel. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible. La inferencia se realiza corte a corte, de modo que el tiempo total escala linealmente con el numero de cortes del volumen.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Contexto volumetrico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mito-aff-unetiso-setup-53-2d (este modelo) | U-Net 2D destilada | 1 x 1 x 556 x 556 | Solo un corte z; la afinidad z se predice sin contexto 3D real | BSD-3-Clause | HuggingFace |
| cellmap/mito-aff-unetiso-setup-53 (profesor) | U-Net 3D isotropica | no disponible | Ventana 3D completa | no disponible | HuggingFace |
| Otras alternativas de segmentacion mitocondrial | no disponible | no disponible | no disponible | no disponible | no disponible |

Los parametros, la huella de memoria y el rendimiento de ambos modelos no estan publicados, por lo que la comparacion cuantitativa no es posible con la informacion disponible. La diferencia documentada se limita al caracter 2D frente a 3D y a la relacion de destilacion entre ambos.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no dispone de interfaz conversacional.
- La salida son logits de afinidad, no instancias segmentadas; requiere un postproceso de aglomeracion que no se distribuye con el modelo.
- Al procesar un solo corte z, el estudiante 2D carece de contexto volumetrico real: la coherencia entre cortes depende de la afinidad z predicha y puede degradarse en estructuras mitocondriales muy inclinadas o en cortes con poco contraste.
- Entrenado para FIB-SEM a 16 nm isotropicos; su uso con otro microscopio, otro tamano de voxel u otro protocolo de tincion puede degradar el resultado sin ajuste fino.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad en la informacion disponible.
- Riesgo de sesgo hacia la distribucion del dataset de destilacion (tipo de tejido, especie y preparacion concretos), no documentada en la ficha.
- Se desconoce el numero de parametros y el consumo de memoria, lo que dificulta planificar el despliegue sin pruebas previas.
- Licencia BSD-3-Clause: permite uso comercial y modificacion siempre que se conserve el aviso de copyright y la clausula de exencion de responsabilidad; no se documentan restricciones adicionales.
- El repositorio figura con 0 descargas y 0 likes y un tamano reportado de 0,0 GB, por lo que conviene verificar la integridad de los archivos antes de integrarlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cellmap/mito-aff-unetiso-setup-53-2d
- Modelo profesor (3D): https://huggingface.co/cellmap/mito-aff-unetiso-setup-53
- Version ONNX para web: https://huggingface.co/cellmap/onnx-web-models (subcarpeta setup_53_2d)
- Repositorio cellmap-models: https://github.com/janelia-cellmap/cellmap-models
- Proyecto CellMap (Janelia): https://www.janelia.org/project-team/cellmap
