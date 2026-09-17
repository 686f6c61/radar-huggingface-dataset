# razordvrz/LUTwithBGrid-ONNX

## Resumen

LUTwithBGrid-ONNX es la exportacion a formato ONNX del modelo **LUTwithBGrid** (Image-Adaptive 3D Lookup Tables for Real-time Image Enhancement with Bilateral Grids), publicado en ECCV 2024 por Wontae Kim y Nam Ik Cho, de la Seoul National University. No es un modelo de lenguaje: es una red neuronal convolucional ligera de mejora de imagen que predice una tabla de consulta (LUT) tridimensional adaptada al contenido de cada imagen, apoyandose en una bilateral grid para preservar bordes y estructuras. La exportacion la mantiene el usuario `razordvrz` y esta pensada para eliminar la principal barrera de la implementacion original: la necesidad de compilar kernels CUDA a medida.

El aporte concreto de esta version no esta en el modelo en si, sino en su portabilidad. La implementacion original de PyTorch depende de dos kernels CUDA personalizados (`lut_transform` y `bilateral_slicing`) que hay que compilar manualmente con CUDA Toolkit o Visual Studio Build Tools. Aqui esos kernels se reescriben en PyTorch puro mediante `F.grid_sample` y `gather`, y el grafo se exporta a ONNX (opset 17), de modo que la inferencia se ejecuta en CPU a traves de `onnxruntime`, sin CUDA, sin compilacion y sin PyTorch instalado.

El resultado es un fichero de 1,9 MB (`lutwithbgrid_fivek.onnx`) que aplica los pesos del modelo entrenado sobre el dataset FiveK en espacio sRGB, con un modo hibrido que toma la luminosidad predicha por la red pero conserva el color original de la imagen. Esta orientado a flujos de retoque fotografico y, de forma destacada, a la correccion de albedo de texturas PBR en herramientas de 3D, ambitito en el que ya se usa como modo de IA del proyecto Albedolizer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN predictora de LUT 3D adaptativa a la imagen con bilateral grid (segun el paper ECCV 2024) |
| Parametros totales | no disponible (el fichero ONNX distribuido ocupa 1,9 MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen fija de 512x512) |
| Tipos de cuantizacion | no disponible (se distribuye el grafo ONNX en la precision resultante de la exportacion; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX, opset 17 (fichero `lutwithbgrid_fivek.onnx`) |
| Entrada | tensor de imagen RGB, forma (1, 3, 512, 512), normalizado a [0, 1] |
| Salida | tensor de imagen RGB mejorada, misma forma que la entrada |
| Runtime de referencia | `onnxruntime` en CPU |
| Peso del modelo | 1,9 MB |
| Modelo base | LUTwithBGrid original, pesos de FiveK en sRGB |
| Repositorio | razordvrz/LUTwithBGrid-ONNX (tamano de repo declarado: 0,0 GB; descargas y likes: 0) |
| Fecha de publicacion | 2026-09-17 |

## Arquitectura y entrenamiento

El modelo sigue el planteamiento del paper de ECCV 2024: en lugar de aplicar una LUT 3D global fija, una red convolucional predice los coeficientes de una LUT tridimensional que depende de la imagen de entrada, y una bilateral grid permite que la transformacion de color se aplique de forma espacialmente variable, guiada por la informacion de bordes. Este esquema es el que da la capacidad de correccion local sin perder la eficiencia de una LUT, que en inferencia se traduce en una operacion de interpolacion tridimensional mucho mas barata que una red de mejora de imagen completa.

La innovacion tecnica de esta exportacion es de ingenieria: los kernels CUDA `lut_transform` y `bilateral_slicing` se reimplementaron en PyTorch puro usando `F.grid_sample` y `gather`, dos operaciones con soporte directo en ONNX, y el grafo resultante se exporto con opset 17 para ejecutarse en CPU. Se anade un modo hibrido que conserva el color original de la imagen y aplica unicamente la componente de brillo predicha por el modelo, pensado para evitar dominantes de color en texturas sinteticas. No hay reentrenamiento ni ajuste fino: los pesos son los del modelo original entrenado sobre FiveK (un dataset de fotografias con retoques de referencia), en su variante sRGB. No se documentan en la informacion disponible el numero de tokens o imagenes de entrenamiento, la composicion exacta del dataset ni si hubo etapas de refinamiento tipo RLHF o DPO, que en cualquier caso no aplican a este tipo de modelo.

## Capacidades

- Mejora de color y tonalidad de imagenes RGB: aplica una LUT 3D adaptativa al contenido, con correccion espacialmente variable mediante bilateral grid.
- Retoque fotografico automatico: genera una version mejorada de la imagen sin intervencion manual ni ajuste de parametros.
- Modo hibrido de luminosidad: toma el brillo predicho por el modelo y mantiene el color de la imagen original, util para superficies con color significativo.
- Correccion de albedo en texturas PBR: caso de uso declarado explicitamente por el autor de la exportacion.
- Inferencia en CPU: funciona con `onnxruntime` sin CUDA, sin compilacion de kernels y sin PyTorch.
- Portabilidad multiplataforma: al ser ONNX, puede desplegarse en distintos sistemas operativos y en distintos execution providers de ONNX Runtime.
- No dispone de generacion de texto, razonamiento, codigo ni matematicas.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multilingues (no procesa lenguaje).
- No dispone de comprension semantica de la imagen: no detecta objetos, no describe contenido y no segmenta; su salida es una imagen transformada.
- No se documentan modos especiales (thinking, audio, video, vision-language) en la informacion disponible.

## Casos de uso

- Retoque fotografico por lotes sin GPU: al ejecutarse con `onnxruntime` en CPU y ocupar 1,9 MB, puede procesar directorios completos de imagenes en servidores o equipos sin tarjeta grafica, aplicando la mejora de color de FiveK de forma uniforme.
- Correccion de albedo de texturas PBR: es el uso para el que se creo la exportacion; activando el modo hibrido se corrige el brillo de la textura manteniendo el color base, lo que evita que un albedo de un material metalico o pintado se desplace de tono.
- Integracion en herramientas de escritorio para artistas 3D: su tamano minimo y la ausencia de dependencias CUDA permiten empaquetarlo dentro de una aplicacion de modelado o de un visor de texturas, como hace Albedolizer, sin obligar al usuario a instalar toolchains de compilacion.
- Preprocesado de datasets de vision por computador: normalizar la tonalidad de un conjunto de imagenes antes de entrenar otro modelo, aplicando la misma transformacion aprendida sobre FiveK para reducir variabilidad de color entre fuentes.
- Pipelines de fotogrametria y escaneo 3D: al trabajar por teselas de 512x512, se puede aplicar tile a tile sobre las imagenes de entrada para homogeneizar la exposicion y el balance de blancos antes de la reconstruccion, reduciendo costuras de color en la malla texturizada.
- Prototipado e investigacion en mejora de imagen: sirve como baseline reproducible de aprendizaje de LUT 3D sin necesidad de CUDA, lo que facilita comparar variantes sobre el mismo grafo ONNX en entornos de laboratorio o CI.
- Servicio web ligero de mejora de imagen: el fichero puede cargarse en un microservicio con ONNX Runtime y procesar peticiones de 512x512 con un consumo de memoria reducido, sin depender de aceleradores.
- Utilidad de linea de comandos para artistas tecnicos: envolver `test_inference.py` en un script de lote para aplicar la correccion a colecciones de texturas antes de subirlas a un motor de render.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de la exportacion no incluye tablas comparativas, y la busqueda web realizada no ha devuelto resultados tecnicos relevantes sobre el modelo (unicamente enlaces generales a YouTube, sin relacion con el proyecto). Para cifras de calidad de image enhancement (por ejemplo PSNR o SSIM sobre FiveK) habria que consultar el paper de ECCV 2024 enlazado en la seccion de enlaces, que no forma parte de la informacion proporcionada en esta ficha.

## Requisitos de hardware

- VRAM en GPU: no disponible de forma oficial; por el tamano del modelo (1,9 MB de pesos) y una entrada de 512x512, el consumo es muy inferior a 1 GB en cualquier cuantizacion o precision, aunque no hay cifras publicadas.
- Ejecucion en CPU: es el modo de referencia. El modelo esta exportado para `onnxruntime` en CPU y no necesita CUDA ni kernels personalizados.
- GPU recomendadas: no se especifican. Cualquier GPU compatible con los execution providers de ONNX Runtime (CUDA, TensorRT, DirectML) podria usarse, pero no es un requisito ni un escenario documentado.
- Cabe en GPU de consumo: si, cualquier GPU de consumo moderna es sobradamente suficiente por tamano de modelo, aunque el caso de uso declarado es la CPU.
- Opciones de despliegue: ONNX Runtime (`onnxruntime` para CPU, `onnxruntime-gpu` para aceleracion), con posibilidad de conversion adicional a otros runtimes compatibles con ONNX; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de vision de este tipo.
- Latencia y throughput: no disponible. No se publican medidas de tiempo por imagen ni de imagenes por segundo en CPU o GPU.
- Restriccion de entrada relevante para el despliegue: la resolucion esta fijada en 512x512, por lo que imagenes mayores deben redimensionarse o procesarse por teselas, lo que afecta directamente al tiempo total de proceso.
- Memoria del proceso: ademas de los 1,9 MB de pesos, hay que contabilizar el coste de las activaciones y de las dos imagenes (entrada y salida) a 512x512 en coma flotante; no se publican cifras exactas.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos comparativos de rendimiento. La comparacion que si puede hacerse con los datos verificables es frente a la implementacion original de la que deriva esta exportacion:

| Modelo | Formato | Requiere kernels CUDA a medida | Ejecucion en CPU | Licencia | Peso del artefacto |
|---|---|---|---|---|---|
| LUTwithBGrid-ONNX (esta ficha) | ONNX opset 17, `onnxruntime` | No (reimplementados con `F.grid_sample` y `gather`) | Si | Apache 2.0 | 1,9 MB |
| LUTwithBGrid original (WontaeaeKim) | PyTorch | Si (`lut_transform`, `bilateral_slicing`) | no disponible | Apache 2.0 | no disponible |
| HDRNet (familia de referencia en enhancement con filtros guiados) | no disponible | no disponible | no disponible | no disponible | no disponible |
| CSRNet / AdaInt (familia de referencia en aprendizaje de LUT 3D) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de parametros, contexto ni rendimiento de las alternativas en la informacion proporcionada, por lo que la comparativa cuantitativa queda como no disponible. El paper de ECCV 2024 es la fuente que corresponde consultar para las comparaciones experimentales que sus autores si realizaron.

## Limitaciones y advertencias

- Entrenado sobre FiveK, un dataset de fotografias: la model card advierte explicitamente de que puede producir dominantes de color sobre texturas sinteticas, que no se parecen a la distribucion de las fotografias de entrenamiento.
- Para albedo PBR se recomienda el modo hibrido (solo brillo), precisamente para evitar desplazamientos de color en materiales con color significativo.
- Resolucion de entrada fija de 512x512: las imagenes mayores deben redimensionarse o procesarse por teselas, lo que puede introducir artefactos de costura y degradar el resultado en detalles finos.
- Riesgo de alucinacion en el sentido de invencion de detalle: no aplica igual que en un modelo generativo, pero el modelo puede amplificar ruido o introducir artefactos locales alli donde la bilateral grid no encuentra estructura que preservar.
- Sesgos: no documentados, pero al entrenarse sobre un corpus fotografico concreto (FiveK, con retoques de fotografo) el estilo de mejora aprendido refleja ese tipo de edicion; puede no coincidir con el criterio de color de otros dominios.
- Restricciones de licencia: el modelo original y esta exportacion son Apache 2.0, lo que permite uso comercial. Conviene conservar la atribucion a los autores originales y la cita del paper, y verificar las condiciones del repositorio de origen si se redistribuye.
- Trazabilidad de la exportacion: se trata de una exportacion de terceros con 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad; no hay resultados de benchmarks publicados que confirmen la equivalencia numerica con la implementacion original en PyTorch.
- Mantenimiento: no se documenta soporte, versionado ni plan de actualizacion del artefacto ONNX.
- El repositorio declara un tamano de 0,0 GB, mientras que la model card lista un fichero de 1,9 MB; conviene comprobar el contenido real del repositorio antes de integrarlo.
- Los resultados de la busqueda web realizada no aportan informacion tecnica sobre este modelo, por lo que no hay verificacion externa independiente disponible.

## Enlaces

- HuggingFace: https://huggingface.co/razordvrz/LUTwithBGrid-ONNX
- Paper (ECCV 2024): https://www.ecva.net/papers/eccv_2024/papers_ECCV/html/6517_ECCV_2024_paper.php
- Repositorio original: https://github.com/WontaeaeKim/LUTwithBGrid
- Proyecto que lo integra (Albedolizer): https://github.com/invisiblelevel/Albedolizer
- Web de Albedolizer: https://invisiblelevel.github.io/Albedolizer/
- Descarga de Albedolizer: https://invisiblelevel.itch.io/albedolizer
- Ficheros incluidos en el repositorio: `lutwithbgrid_fivek.onnx`, `export_script.py`, `test_inference.py`, `requirements.txt`
