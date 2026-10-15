# cellmap/mito-aff-unetiso-setup-53

## Resumen

mito_aff_unetiso_setup_53 es un modelo de segmentacion volumetrica publicado por el equipo de CellMap (Janelia Research Campus, HHMI) en HuggingFace bajo el identificador `cellmap/mito-aff-unetiso-setup-53`. No es un modelo de lenguaje: predice mapas de afinidad mitocondrial en los tres ejes (`mito_aff_z`, `mito_aff_y`, `mito_aff_x`) a partir de imagenes de microscopia electronica FIB-SEM con un tamano de voxel de 16 nm. La arquitectura es una U-Net 3D isotropica (Unet3dIso) con BatchNorm, MaxPool y ConvTranspose, entrenada durante 340 000 iteraciones sobre el conjunto `exp_mito` (setup_53), con convoluciones validas y 88 voxeles de contexto por eje.

El modelo resuelve el primer paso de la segmentacion de instancias de mitocondrias: en lugar de emitir una mascara binaria, devuelve logits de afinidad entre voxeles vecinos, que despues se agregan con algoritmos como watershed o aglomeracion para separar mitocondrias individuales en volumenes de tejido. El autor indica que la salida son logits crudos y que la activacion sigmoide debe aplicarse despues del modelo.

Su interes practico esta en la combinacion de un modelo de dominio muy especifico (microscopia electronica de volumen) con una distribucion multicomponente: el repositorio incluye pesos en `torch.export` (model.pt2), TorchScript (model.ts) y ONNX (model.onnx), y el propio autor referencia una version web en `cellmap/onnx-web-models/setup_53`. La licencia BSD-3-Clause permite uso comercial con obligaciones de atribucion. En el momento de la consulta el repositorio acumulaba 0 descargas y 0 likes, con un tamano de 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Unet3dIso (U-Net 3D isotropica, BatchNorm, MaxPool, ConvTranspose, convoluciones validas) |
| Parametros totales | no disponible (el autor no publica el recuento) |
| Parametros activos | no aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | no aplica (modelo de vision 3D); volumen de inferencia 300 x 300 x 300 voxeles |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en el formato original; no se declaran variantes cuantizadas) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | BSD-3-Clause |
| Formato de pesos | torch.export (`model.pt2`), TorchScript (`model.ts`), ONNX (`model.onnx` + `model.onnx.data`), metadatos en `metadata.json` |
| Dimensiones espaciales | 3 |
| Canales de entrada | 1 |
| Canales de salida | 3 (`mito_aff_z`, `mito_aff_y`, `mito_aff_x`) |
| Tamano de voxel de entrada | 16, 16, 16 nm |
| Tamano de voxel de salida | 16, 16, 16 nm |
| Forma de entrada en inferencia | 300, 300, 300 |
| Forma de salida en inferencia | 212, 212, 212 |
| Normalizacion de entrada | min-max con minimo -1,0 y maximo 1,0 |
| Activacion de salida | sigmoide aplicada despues del modelo (`apply_after_model: true`) |
| Iteraciones de entrenamiento | 340 000 |
| Framework | PyTorch (libreria `cellmap-models`) |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es una U-Net 3D isotropica, es decir, con kernel y paso identicos en los tres ejes espaciales, lo que es coherente con el hecho de que la imagen de entrada tiene voxeles isometricos de 16 nm en las tres dimensiones. El modelo declara tres bloques mecanicos concretos: normalizacion por lotes (BatchNorm), reduccion por MaxPool en el camino de contraccion y aumento por ConvTranspose en el camino de expansion. El autor indica explicitamente el uso de convoluciones validas, lo que explica la perdida de 88 voxeles de contexto por eje: una entrada de 300 x 300 x 300 produce una salida de 212 x 212 x 212 (300 - 2 x 88 = 124, por lo que la relacion exacta entre contexto declarado y recorte de salida debe validarse contra el codigo de `cellmap-models`). El modelo trabaja sobre un unico canal de entrada y emite tres canales de afinidad, uno por eje.

En cuanto al entrenamiento, la model card solo aporta el numero de iteraciones (340 000) y el nombre del setup (`exp_mito`, setup_53) sobre datos FIB-SEM de 16 nm orientados a mitocondrias. No se detalla el numero de tokens ni de voxeles vistos, la composicion del dataset, la procedencia de las anotaciones ni si hubo etapas de refinamiento tipo RLHF o DPO (categorias que, por otra parte, no aplican a un modelo de segmentacion). Tampoco se describen innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. La unica peculiaridad reseñable es la salida en logits crudos con sigmoide desacoplada y la disponibilidad de una exportacion ONNX pensada para ejecucion en navegador.

## Capacidades

- Segmentacion volumetrica 3D de mitocondrias en imagenes FIB-SEM con voxeles de 16 nm, mediante prediccion de afinidades por eje.
- Prediccion de mapas de afinidad en tres canales independientes (`mito_aff_z`, `mito_aff_y`, `mito_aff_x`) que permiten reconstruir instancias tras un paso de agregacion.
- Procesamiento de volumenes completos de 300 x 300 x 300 voxeles en una sola pasada de inferencia.
- Exportacion a multiples formatos de ejecucion: torch.export, TorchScript y ONNX, lo que habilita despliegue en Python, en C++/servidor y en navegador via ONNX Runtime Web.
- Ajuste fino (fine-tuning) sobre datos propios: la API `CellmapModel.train()` expone el modelo como entrenable a partir de `model.pt2`.
- No soporta tool calling, function calling, uso de agentes ni razonamiento multi-paso: es un modelo puramente perceptivo y de vision 3D.
- No tiene capacidades multilingues ni de generacion de texto, codigo o matematicas.
- No incorpora modo thinking, vision natural (RGB), audio ni otras modalidades fuera de la microscopia electronica volumetrica.

## Casos de uso

- Segmentacion de mitocondrias en conectomica: el modelo genera mapas de afinidad sobre volumenes FIB-SEM de tejido nervioso; esos mapas se agregan con watershed o aglomeracion para obtener instancias de mitocondrias que despues se anotan en el esqueleto neuronal.
- Preprocesado para pipelines de reconstruccion de gran escala: al aceptar bloques de 300 x 300 x 300 voxeles, encaja en flujos de inferencia por teselas sobre muestras de miles de micras cubicas, generando afinidades que se cosen entre bloques.
- Etiquetado asistido y proofreading: los mapas de afinidad y las instancias derivadas se pueden cargar en herramientas de anotacion (por ejemplo, visores web basados en la version ONNX) para que un anatomista corrija errores en lugar de dibujar desde cero.
- Analisis morfometrico cuantitativo: una vez segmentadas las mitocondrias, se pueden calcular volumen, superficie, elongacion y densidad por celula o por region de tejido, util para estudios de bioenergetica y de estado metabolico.
- Fine-tuning sobre un dominio propio: el flujo `CellmapModel.train()` permite reentrenar el modelo con anotaciones de otra preparacion, otra especie o un rango de grosor distinto, partiendo de los pesos de setup_53.
- Control de calidad y cribado de muestras: ejecutar el modelo sobre una muestra recien adquirida permite comprobar si la tincion y el alineamiento producen mitocondrias coherentes antes de invertir tiempo en anotacion manual.
- Generacion de pseudoetiquetas para entrenar modelos mas ligeros: las afinidades y segmentaciones derivadas pueden actuar como profesor en un esquema de destilacion hacia arquitecturas mas rapidas de despliegue.
- Segmentacion de mitocondrias en otros tejidos con morfologia similar: al tratarse de un modelo con voxel isometrico de 16 nm, es reutilizable siempre que la resolucion de la nueva microscopia se remuestree a ese tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad de segmentacion (por ejemplo, IoU, Dice, variacion de informacion, CREMI o puntuaciones de agregacion), ni comparaciones con otros modelos.

## Requisitos de hardware

- Numero de parametros: no disponible. Como referencia, el repositorio completo ocupa 0,1 GB e incluye tres formatos de pesos (torch.export, TorchScript y ONNX), lo que sugiere un modelo del orden de millones de parametros, no de miles de millones. Es una inferencia del editor, no un dato confirmado por el autor.
- VRAM para inferencia: no disponible oficialmente. Estimacion orientativa del editor, no verificada: una entrada float32 de 300 x 300 x 300 x 1 canal ocupa unos 108 MB por tensor, y una U-Net 3D de este perfil suele necesitar del orden de 8 a 16 GB en fp32 para una pasada completa, bastante menos si se ejecuta en fp16 o en ONNX Runtime. Conviene medirlo en el hardware objetivo.
- GPU recomendadas: no declaradas por el autor. Por el perfil del modelo, una GPU de 12 a 24 GB (RTX 3060 12 GB, RTX 3090, RTX 4090, A5000) deberia ser suficiente para inferencia en fp32 o fp16; no hay indicios de que se requieran A100 o H100. Es una estimacion, no un requisito publicado.
- GPU de consumo: probablemente si en tarjetas de 12 GB o mas, especialmente con ONNX Runtime o fp16, pero no hay datos confirmados.
- Opciones de despliegue: libreria `cellmap-models` (PyTorch, `python -m pip install cellmap-models`), TorchScript con `torch.jit.load`, torch.export con `torch.export.load`, y ONNX Runtime (`onnxruntime.InferenceSession`), incluida la variante web referenciada por el autor en `cellmap/onnx-web-models/setup_53`.
- Latencia y throughput: no disponible. No se publican tiempos por volumen ni voxeles por segundo en ninguna GPU concreta.

## Comparativa con modelos similares

No disponible. La model card no ofrece comparaciones con otras arquitecturas de segmentacion de microscopia electronica (por ejemplo, otras U-Net 3D, nnU-Net o variantes especializadas en mitocondrias), ni metricas que permitan situar este modelo frente a alternativas. Lo unico verificable es la existencia de otros setups dentro del mismo ecosistema `cellmap-models` y de una version ONNX para web, pero sin datos comparativos publicos.

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mito_aff_unetiso_setup_53 | no disponible | 300 x 300 x 300 voxeles, 16 nm | no disponible | BSD-3-Clause | HuggingFace (`cellmap/mito-aff-unetiso-setup-53`), ONNX web |
| Alternativas de segmentacion de mitocondrias en EM | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de dominio muy estrecho: esta entrenado para mitocondrias en FIB-SEM a 16 nm. Aplicarlo a otras resoluciones, a otras modalidades (TEM, SEM de superficie, expansion microscopy) o a otros tejidos sin remuestreo y validacion previa producira resultados poco fiables.
- Sesgos de dataset desconocidos: no se publica la composicion del conjunto `exp_mito` ni su procedencia (especie, region cerebral, condiciones de tincion), por lo que no es posible evaluar sesgos sistematicos hacia un tipo de muestra determinado.
- Riesgo de falsos positivos y de fusion de instancias: la salida son afinidades, no instancias. Los errores en los bordes o en mitocondrias muy proximas pueden hacer que el paso de agregacion las una o las fragmente. No existe una nocion de "alucinacion" en el sentido de los modelos de lenguaje, pero si de predicciones plausibles y erroneas.
- Rendimiento no verificado: 0 descargas y 0 likes en HuggingFace en el momento de la consulta y ausencia total de benchmarks publicados. No hay evidencia externa de calidad.
- Salida en logits crudos: es imprescindible aplicar la sigmoide despues del modelo (`apply_after_model: true`) antes de interpretar los mapas de afinidad.
- Convoluciones validas: la salida es 212 x 212 x 212 para una entrada de 300 x 300 x 300, con 88 voxeles de contexto por eje declarados. Hay que gestionar ese recorte al teselar volumenes grandes para evitar costuras.
- Licencia BSD-3-Clause: permite uso comercial y modificacion, pero obliga a conservar el aviso de copyright y la clausula de licencia, y prohibe usar el nombre de la organizacion o de los contribuyentes para promocionar productos derivados sin permiso escrito.
- Mantenimiento incierto: el autor del modelo es Marwan Zouinkhi y el repositorio depende del ecosistema `cellmap-models`; no se especifica politica de soporte ni cadencia de actualizaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cellmap/mito-aff-unetiso-setup-53
- Repositorio del framework: https://github.com/janelia-cellmap/cellmap-models
- Proyecto CellMap (Janelia): https://www.janelia.org/project-team/cellmap
- Version ONNX para web referenciada por el autor: https://huggingface.co/cellmap/onnx-web-models (subcarpeta `setup_53`)
