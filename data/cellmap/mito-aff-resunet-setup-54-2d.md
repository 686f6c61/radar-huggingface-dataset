# cellmap/mito-aff-resunet-setup-54-2d

## Resumen

El modelo `cellmap/mito-aff-resunet-setup-54-2d` es una red neuronal de segmentación de imágenes de microscopia electronica, desarrollada por el equipo CellMap del Janelia Research Campus (Howard Hughes Medical Institute) y publicada por el autor Marwan Zouinkhi. Su tarea concreta es predecir afinidades de mitocondrias en tres ejes (`mito_aff_z`, `mito_aff_y`, `mito_aff_x`) a partir de imagenes de FIB-SEM con un tamano de voxel de 16 nm, procesando una unica seccion Z cada vez. Se trata, por tanto, de un modelo de vision 2D orientado a segmentacion volumetrica por post-procesado de afinidades, y no de un modelo de lenguaje.

Tecnicamente es un "student" destilado del modelo 3D `cellmap/mito-aff-resunet-setup-54`. La arquitectura base es una U-Net residual con normalizacion por instancia (InstanceNorm) y convoluciones validas, en la que cada capa 3D del profesor se ha convertido en 2D, dando lugar a la clase `ResUNet3DValid2d`. El entrenamiento de destilacion se ejecuto durante 60000 iteraciones mediante el script `train_2d_distill.py`. La entrada es un tensor `[N, 1, 1, H, W]` con normalizacion min-max al rango `[-1, 1]`, y la salida son logits crudos a los que se aplica una sigmoide despues del modelo.

Su relevancia practica radica en que permite ejecutar la inferencia de un modelo de segmentacion mitocondrial de alta calidad sobrepilas de secciones 2D, sin necesidad de disponer de volumen 3D completo en memoria y con formatos exportados (ONNX, TorchScript) aptos para despliegue web. Segun la model card, existe ademas una version web del ONNX en `cellmap/onnx-web-models/setup_54_2d`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResUNet3DValid2d (U-Net residual 2D con InstanceNorm y convoluciones validas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 88 pixeles de contexto por eje espacial (la entrada de 556x556 se reduce a una salida de 468x468 por las convoluciones validas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision; no procesa texto) |
| Licencia | BSD-3-Clause |
| Formato de pesos | PyTorch pickle (`model.pt`), TorchScript (`model.ts`), ONNX (`model.onnx`), state dict (`model_state_dict.pt`) |
| Dimension espacial | 3 (en la practica, red 2D con eje Z singleton: entrada `[N, 1, 1, H, W]`) |
| Canales de entrada | 1 (imagen de microscopia electronica en escala de grises) |
| Canales de salida | 3 (`mito_aff_z`, `mito_aff_y`, `mito_aff_x`) |
| Tamano de voxel de entrada/salida | 16, 16, 16 nm |
| Forma de inferencia (entrada) | `1, 556, 556` |
| Forma de inferencia (salida) | `1, 468, 468` |
| Normalizacion de entrada | min-max con `min = -1.0`, `max = 1.0` |
| Activacion de salida | sigmoide, aplicada despues del modelo (`apply_after_model: true`) |
| Iteracion de entrenamiento | 60000 pasos (destilacion) |
| Framework / libreria | torch (via `cellmap-models`) |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo pertenece a la familia de U-Nets residuales empleadas habitualmente en segmentacion de imagenes de microscopia electronica. La clase concreta es `ResUNet3DValid2d`, derivada de una U-Net 3D con normalizacion por instancia y convoluciones validas (sin relleno), en la que todas las capas 3D se han convertido a 2D. Esto implica que el modelo consume un unico corte Z a la vez y que las dimensiones espaciales de salida son menores que las de entrada: con una entrada de 556x556 se obtiene una salida de 468x468, es decir, 88 pixeles de contexto por eje. El campo receptivo efectivo queda, por tanto, limitado a ese margen de pixeles alrededor de cada voxel.

El entrenamiento corresponde a un proceso de destilacion de conocimiento desde el modelo 3D `cellmap/mito-aff-resunet-setup-54` (el "teacher"), ejecutado durante 60000 iteraciones con el script `train_2d_distill.py`. La model card no detalla el numero de tokens o volumenes de entrenamiento, la composicion del dataset, ni el uso de tecnicas de ajuste adicionales como RLHF o DPO, algo que resulta esperable porque no se trata de un modelo generativo de lenguaje. La salida del modelo son logits crudos por canal de afinidad; el post-procesado requiere aplicar una sigmoide y, posteriormente, un algoritmo de agrupamiento de afinidades (watershed o similar) para obtener la segmentacion final de instancias mitocondriales.

## Capacidades

- Segmentacion de mitocondrias en imagenes de FIB-SEM a 16 nm de resolucion de voxel.
- Prediccion de mapas de afinidad en los tres ejes espaciales (`mito_aff_z`, `mito_aff_y`, `mito_aff_x`), pensados para reconstruccion de instancias mediante post-procesado.
- Inferencia 2D corte a corte con un contexto espacial de 88 pixeles por eje, util para procesar pilas de imagenes sin requerir el volumen 3D completo.
- Exportacion multiplataforma: ejecucion en PyTorch nativo, TorchScript o runtime ONNX, lo que facilita el despliegue tanto en servidor como en navegador.
- Reentrenamiento y ajuste fino: el repositorio incluye `model_state_dict.pt`, `model_def.py`, `student_2d.py` y `torch_source.json`, lo que permite reconstruir el modulo y cargar pesos con `weights_only=True`.
- Integracion con la libreria `cellmap-models`, que expone una clase `CellmapModel` para inferencia y una ruta `train()` para ajuste fino.
- No dispone de soporte de tool calling, agentes, capacidades multilingues ni modalidades de audio o texto: es exclusivamente un modelo de vision para segmentacion.

## Casos de uso

- Segmentacion de mitocondrias en tomogramas FIB-SEM: el modelo predice afinidades por corte, que se agrupan despues en instancias para cuantificar numero, volumen y morfologia mitocondrial en muestras biologicas.
- Analisis de conectividad y morfologia mitocondrial: al generar afinidades en los tres ejes, permite reconstruir la continuidad de una mitocondria a lo largo de la pila de secciones y medir su forma tridimensional.
- Pipelines de microscopia de alto rendimiento: la version ONNX posibilita ejecutar la inferencia en entornos con CPU o GPU heterogeneas, integrándose en colas de procesamiento por lotes de grandes volumenes de imagenes.
- Aplicaciones web de anotacion y visualizacion: la existencia de la version `cellmap/onnx-web-models/setup_54_2d` permite servir la inferencia en navegador, util para herramientas interactivas de segmentacion asistida.
- Etiquetado asistido y generacion de ground truth: las afinidades predichas pueden usarse como preanotacion para que los expertos corrijan, reduciendo el coste de anotacion manual en estudios de biologia celular.
- Ajuste fino sobre nuevos dominios de imagen: gracias a los pesos en formato de state dict y al codigo del modulo, un laboratorio puede reentrenar el modelo con muestras propias de otra preparacion o microscopio.
- Deteccion de alteraciones mitocondriales en estudios de enfermedad: la cuantificacion sistematica de la red mitocondrial permite comparar condiciones experimentales o modelos animales con fenotipos mitocondriales.
- Docencia y prototipado en segmentacion biofisica: el modelo sirve como ejemplo reproducible de destilacion de un modelo 3D a 2D dentro del ecosistema `cellmap-models`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia orientativa, el repositorio completo ocupa 0,1 GB e incluye varias copias de los pesos en distintos formatos, por lo que el modelo es de tamano reducido y cabe con holgura en GPUs de consumo (estimacion propia, no confirmada por el autor).
- GPU recomendadas: no disponible. Por el tamano y la resolucion de entrada (556x556 por corte) es previsible que funcione en GPUs de gama media como RTX 3060/4070 o superiores, aunque no hay datos publicados que lo confirmen.
- Compatibilidad con GPU de consumo: probable, pero no confirmada por el autor.
- Opciones de despliegue: inferencia nativa en PyTorch, TorchScript (`torch.jit.load`) y ONNX Runtime (`onnxruntime.InferenceSession`), segun los formatos incluidos en el repositorio. Tambien es posible cargar el modelo mediante la libreria `cellmap-models` (`CellmapModel`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Dimension | Contexto espacial | Formatos | Licencia |
|---|---|---|---|---|---|
| `cellmap/mito-aff-resunet-setup-54-2d` (este modelo) | ResUNet3DValid2d (student 2D) | 2D con eje Z singleton | 88 px de contexto por eje (entrada 556x556, salida 468x468) | PyTorch, TorchScript, ONNX | BSD-3-Clause |
| `cellmap/mito-aff-resunet-setup-54` (teacher) | ResUNet 3D | 3D | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| Otros modelos de segmentacion mitocondrial en microscopia electronica | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre este modelo y sus alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de vision especializado: no procesa lenguaje natural ni soporta dialogo, tool calling o agentes.
- Dominio muy restringido: entrenado especificamente para mitocondrias en imagenes FIB-SEM a 16 nm. Su uso con otros tejidos, resoluciones o modalidades de imagen puede degradar gravemente los resultados.
- Sensibilidad a la normalizacion: requiere normalizacion min-max al rango `[-1, 1]`; usar otra normalizacion invalida las predicciones.
- Contexto espacial limitado: las convoluciones validas reducen la salida a 468x468 desde una entrada de 556x556, de modo que no se predice para los pixeles del borde y el campo receptivo es de 88 pixeles por eje.
- Salida en logits crudos: es imprescindible aplicar la sigmoide y un post-procesado de agrupamiento de afinidades para obtener segmentaciones de instancia; el modelo por si solo no devuelve mascaras binarias.
- Sin datos de validacion publicos: no hay benchmarks, tasas de error ni metricas de calidad (por ejemplo, variacion de informacion o F1) en la informacion disponible, lo que dificulta la evaluacion previa a produccion.
- Sin informacion sobre sesgos ni sobre composicion del dataset de entrenamiento, lo que impide auditar posibles desequilibrios en los tipos de muestra.
- Licencia BSD-3-Clause: permite uso comercial y modificacion siempre que se conserve el aviso de copyright y la clausula de exencion de responsabilidad; no incluye garantia alguna.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, por lo que no existe comunidad de validacion ni incidencias reportadas.
- Sin garantias de mantenimiento: la model card no indica versionado ni politica de actualizaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cellmap/mito-aff-resunet-setup-54-2d
- Modelo profesor (teacher) 3D: https://huggingface.co/cellmap/mito-aff-resunet-setup-54
- Version ONNX para web: https://huggingface.co/cellmap/onnx-web-models
- Repositorio de la libreria: https://github.com/janelia-cellmap/cellmap-models
- Proyecto CellMap (Janelia Research Campus): https://www.janelia.org/project-team/cellmap
