# gmougeot/lepinet-dinov3-convnextl

## Resumen

`lepinet-dinov3-convnextl` es un modelo de clasificacion de imagenes especializado en la identificacion de lepidopteros (mariposas y polillas) a partir de una fotografia. Lo desarrolla gmougeot dentro del proyecto lepinet y esta construido sobre el backbone DINOv3 ConvNeXt-L de Meta (variante `timm/convnext_large.dinov3_lvd1689m`), ajustado de extremo a extremo y rematado con un clasificador coseno de 1536 dimensiones. Cuenta con 217.126.600 parametros (unos 217 M) y un repositorio de 2,5 GB.

El modelo resuelve una tarea de taxonomia jerarquica: para cada imagen devuelve simultaneamente probabilidades de especie (12.041 clases), genero (4.333) y familia (102), de forma coherente, ya que las dos ultimas se derivan de las probabilidades de especie mediante el mapa de padres taxonomico. Es la variante de tamano medio del proyecto lepinet y, segun su model card, iguala en precision al modelo recomendado `lepinet-bioclip2-vitl14` (321 M) y lo supera en fotografias corrientes de GBIF, aunque pierde frente a este cuando se aplican umbrales de confianza exigentes.

Su relevancia practica esta en el despliegue: se distribuye exclusivamente en formato ONNX (fp32, fp16 e int8) y funciona solo con `onnxruntime`, sin necesidad de PyTorch, lo que permite ejecutarlo tanto en GPU como en CPU convencional con latencias de decenas de milisegundos por imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv3 ConvNeXt-L (backbone `timm/convnext_large.dinov3_lvd1689m`) ajustado de extremo a extremo, mas clasificador coseno de 1536 dimensiones |
| Parametros totales | 217.126.600 (217 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificacion de imagen; entrada fija de 320x320 pixeles) |
| Tipos de cuantizacion | fp32, fp16 (GPU) e int8 (CPU); en int8 las capas MLP de salida usan cuantizacion weight-only de 8 bits |
| Idiomas soportados | no aplica (modelo de vision); las etiquetas de salida son nombres cientificos en nomenclatura latina |
| Licencia | dinov3-license (identificador `other`), con peticion adicional de uso no comercial sobre los datos de entrenamiento |
| Formato de pesos | ONNX: `model.onnx` (fp32, 869 MB), `model_fp16.onnx` (476 MB), `model_int8.onnx` (245 MB); el repositorio tambien declara la etiqueta safetensors |
| Tamano de entrada | imagen RGB de un unico insecto, 320x320, valores en [0, 1] (la normalizacion esta dentro del grafo) |
| Salidas | probabilidades de especie, genero y familia; logits de especie calibrados; embedding de 1536 dimensiones |
| Rango taxonomico | 12.041 especies, 4.333 generos, 102 familias |
| Modelo base | `timm/convnext_large.dinov3_lvd1689m` |
| Libreria | onnxruntime (>= 1.22 para el fichero int8) |

## Arquitectura y entrenamiento

El modelo parte de un backbone convolucional ConvNeXt-L preentrenado con el metodo DINOv3 (autoaprendizaje autosupervisado a gran escala desarrollado por Meta) y lo ajusta de extremo a extremo para clasificacion taxonomica. Sobre las caracteristicas extraidas se aplica un clasificador coseno que produce un embedding de 1536 dimensiones y las probabilidades de las 12.041 especies. Las predicciones de genero y familia no se calculan con cabezas independientes, sino agregando las probabilidades de especie a traves del mapa de padres definido en `taxonomy.json`, lo que garantiza que las tres respuestas sean taxonomicamente consistentes entre si.

La model card no detalla el numero de imagenes de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de alineacion como RLHF o DPO (procedimientos, por otra parte, poco habituales en clasificacion de imagen). Si se documenta el uso de datos de GBIF y de trampas de luz (light-trap) como parte del material de evaluacion, con tres conjuntos de evaluacion distintos, y el proyecto publica los ficheros `taxonomy.json` y `names.json` compartidos entre las tres variantes lepinet, de modo que son intercambiables sin cambios de codigo. La innovacion tecnica mas relevante de cara al despliegue es la inclusion de la normalizacion dentro del propio grafo ONNX y el uso de un primer eje dinamico que permite procesar lotes de tamano variable.

## Capacidades

- Clasificacion de imagenes de lepidopteros en tres rangos taxonomicos simultaneos: especie (12.041 clases), genero (4.333) y familia (102).
- Predicciones jerarquicamente coherentes: genero y familia se derivan de las probabilidades de especie, por lo que nunca contradicen la respuesta de nivel inferior.
- Salida de probabilidades calibradas y logits de especie calibrados, pensados para aplicar umbrales de confianza y descartar predicciones dudosas.
- Extraccion de un embedding de 1536 dimensiones reutilizable para busqueda por similitud, agrupamiento o clasificadores posteriores.
- Inferencia por lotes: el eje de lote de la entrada es dinamico, con soporte medido para lotes de 32 imagenes.
- Script de linea de comandos incluido (`predict.py`) que aplica automaticamente los umbrales de confianza configurados.
- Compatibilidad directa con `taxonomy.json` y `names.json` de las otras dos variantes lepinet (intercambio directo entre modelos).
- No dispone de tool calling, soporte de agentes, generacion de texto, razonamiento multi-paso ni capacidades multilingues: es un clasificador de vision puro.

## Casos de uso

- Identificacion asistida en trampas de luz: el modelo procesa fotografias de trampas automaticas y devuelve especie, genero y familia con umbrales de confianza, permitiendo filtrar capturas dudosas para revision humana; su rendimiento medido a precision del 95 % es de un 77,2 % de respuestas correctas en imagenes de trampa de luz.
- Ciencia ciudadana y validacion de observaciones: integrado en una plataforma tipo iNaturalist o GBIF, puede preclasificar las subidas de usuarios y marcar como sospechosas aquellas observaciones cuya prediccion contradice la taxonomia declarada.
- Monitorizacion de biodiversidad: despliegue sobre fotografias de campo en estudios de seguimiento de poblaciones, aprovechando que el modelo es preciso en fotografias corrientes de GBIF, el caso de uso mas habitual en inventarios.
- Clasificacion masiva por lotes en servidor: con fp16 en GPU alcanza 715 imagenes/s en lotes de 32, lo que permite procesar archivos fotograficos completos de colecciones entomologicas en tiempos reducidos.
- Curacion de colecciones y museos: aplicar el modelo sobre el catalogo fotografico de una coleccion para detectar especimenes mal etiquetados, usando la discrepancia entre la prediccion y la etiqueta original como criterio de revision.
- Indexado y busqueda visual de especimenes: usar el embedding de 1536 dimensiones para construir un indice vectorial que permita recuperar imagenes similares a una consulta, util para detectar duplicados o agrupar morfotipos no identificados.
- Despliegue en campo o en dispositivos sin GPU: la version int8 ocupa 245 MB y tarda 70 ms por imagen en CPU, lo que la hace viable en equipos modestos o en estaciones de campo conectadas a camaras trampa.
- Aplicaciones educativas y de divulgacion: un servicio web que identifique la mariposa fotografiada por un usuario y devuelva su genero y familia, mostrando un aviso cuando la confianza no supere el umbral.

## Benchmarks y rendimiento

| Metrica | Resultado | Comparacion |
|---|---|---|
| Precision global (especie) en fotografias corrientes de GBIF | iguala a `lepinet-bioclip2-vitl14` (321 M) y supera a las otras variantes lepinet | mejora respecto a BioCLIP-2 en este conjunto |
| Respuestas correctas a precision del 95 % en imagenes de trampa de luz | 77,2 % | 83,3 % en `lepinet-bioclip2-vitl14` |
| fp16 frente a fp32 (macro-F1 de especie) | identico hasta 0,0001 en los tres conjuntos de evaluacion | sin perdida apreciable |
| int8 frente a fp32 | dentro de 0,35 puntos en los tres conjuntos de evaluacion | perdida acotada |
| Throughput fp32, lote de 32 | CPU 8,4 img/s; GPU 378 img/s | onnxruntime 1.30, RTX 5090 y Core Ultra 9 285K |
| Throughput fp16, lote de 32 | GPU 715 img/s | |
| Throughput int8, lote de 32 | CPU 10,2 img/s | |
| Latencia fp32, imagen individual | CPU 103 ms; GPU 3,8 ms | |
| Latencia fp16, imagen individual | GPU 2,9 ms | |
| Latencia int8, imagen individual | CPU 70 ms | 1,5x mas rapido y 3,5x mas pequeno que fp32 |

No se han publicado en la informacion disponible valores absolutos de macro-F1, exactitud top-1 ni resultados de benchmarks genericos (ImageNet, MMLU, HumanEval u otros), por lo que no se incluyen.

## Requisitos de hardware

- VRAM/peso en disco: 869 MB en fp32, 476 MB en fp16, 245 MB en int8.
- GPU medida en las pruebas del autor: NVIDIA RTX 5090, con 715 imagenes/s en fp16 y lotes de 32. Cualquier GPU NVIDIA con soporte CUDA y cuDNN puede ejecutar la version fp16 mediante `onnxruntime-gpu`.
- CPU de referencia: Intel Core Ultra 9 285K de 24 nucleos, con 10,2 imagenes/s en int8 por lotes y 70 ms por imagen individual.
- Cabe sobradamente en GPU de consumo: con 476 MB en fp16 y una entrada de 320x320, la huella es minima y es viable en tarjetas de gama media o baja con suficiente memoria para el lote.
- Tambien es ejecutable solo en CPU con la version int8, sin GPU dedicada.
- Opciones de despliegue: `onnxruntime` (CPU) u `onnxruntime-gpu[cuda,cudnn]` (GPU). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Advertencia de despliegue: hay que nombrar explicitamente los proveedores (`CUDAExecutionProvider`, `CPUExecutionProvider`), ya que `onnxruntime` coloca TensorRT en primer lugar y, si no esta instalado, puede caer silenciosamente a CPU.
- Latencia y throughput estimados: 2,9 a 3,8 ms por imagen en GPU y 70 a 103 ms por imagen en CPU, segun precision. Los numeros de CPU se tomaron en un servidor compartido con carga de fondo, por lo que conviene interpretarlos como ratios.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto/rango | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| `lepinet-dinov3-convnextl` | 217 M | 320x320 RGB | 12.041 especies, 4.333 generos, 102 familias | dinov3-license (other) + peticion no comercial sobre datos de entrenamiento | ONNX fp32/fp16/int8 en HuggingFace | Mas preciso que BioCLIP-2 en fotos de GBIF; peor en confianza calibrada |
| `lepinet-bioclip2-vitl14` | 321 M | no disponible en la informacion proporcionada | misma taxonomia (ficheros compartidos) | no disponible en la informacion proporcionada | HuggingFace | Recomendado por el autor si se usan umbrales de confianza (83,3 % al 95 % de precision) |
| `lepinet-effnetv2s` | 37 M | no disponible en la informacion proporcionada | misma taxonomia (ficheros compartidos) | no disponible en la informacion proporcionada | HuggingFace | Variante rapida en CPU |
| `timm/convnext_large.dinov3_lvd1689m` | backbone base | no disponible en la informacion proporcionada | preentrenamiento generico (LVD-1689M) | dinov3-license | HuggingFace, timm, Transformers | Modelo base sin ajuste taxonomico |

No se dispone de datos comparativos frente a clasificadores entomologicos de terceros ajenos al proyecto lepinet.

## Limitaciones y advertencias

- Calibracion de confianza debil: con umbrales exigentes rinde claramente peor que `lepinet-bioclip2-vitl14` (77,2 % frente a 83,3 % a precision del 95 %). Si el flujo de trabajo depende de umbrales de confianza, el autor recomienda el modelo BioCLIP-2.
- Entrada restringida a una sola imagen RGB de un unico insecto a 320x320; no se documenta comportamiento con multiples especimenes en la misma fotografia ni con imagenes de otra naturaleza.
- Cobertura taxonomica limitada a las 12.041 especies, 4.333 generos y 102 familias incluidas en `names.json`; cualquier especie fuera de ese vocabulario no puede identificarse correctamente.
- No es un modelo de texto: no genera explicaciones, no admite instrucciones en lenguaje natural y no tiene capacidades multilingues ni de razonamiento.
- Riesgo de error por confusion morfologica: al ser un clasificador cerrado, siempre devuelve una de las clases conocidas, de modo que una imagen ambigua o de una especie no cubierta producira una etiqueta plausible pero incorrecta.
- Licencia dinov3-license (identificador `other`) con una peticion adicional de uso no comercial sobre los datos de entrenamiento. Es imprescindible revisar `LICENSE.md` antes de cualquier uso comercial.
- El fichero int8 requiere onnxruntime >= 1.22 por el uso de cuantizacion weight-only de 8 bits en las capas MLP de salida.
- La cuantizacion int8 no aporta ventajas en GPU; en ese entorno debe usarse la version fp16.
- Los datos de latencia en CPU proceden de un servidor compartido con carga de fondo: son utiles para comparar proporciones, no como cifras absolutas de produccion.
- No se publican en la informacion disponible datos sobre sesgos del dataset de entrenamiento, distribucion geografica de las imagenes ni equilibrio entre especies, lo que impide evaluar el sesgo taxonomico o geografico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gmougeot/lepinet-dinov3-convnextl
- Modelo base en timm: https://huggingface.co/timm/convnext_large.dinov3_lvd1689m
- Variante recomendada por el autor: https://huggingface.co/gmougeot/lepinet-bioclip2-vitl14
- Variante ligera: https://huggingface.co/gmougeot/lepinet-effnetv2s
- Coleccion completa lepinet: https://huggingface.co/collections/gmougeot/lepinet-lepidoptera-identification-6abbc33d250430f8c67db428
- Repositorio del proyecto: https://github.com/GuillaumeMougeot/lepinet
- Repositorio DINOv3 de Meta: https://github.com/facebookresearch/dinov3
- Implementacion del backbone ConvNeXt en DINOv3: https://github.com/facebookresearch/dinov3/blob/main/dinov3/models/convnext.py
- Pagina de investigacion DINOv3: https://ai.meta.com/research/dinov3/
- Ejemplo de pesos DINOv3 en HuggingFace: https://huggingface.co/facebook/dinov3-convnext-small-pretrain-lvd1689m
- Repositorio auxiliar lepinet-models: https://huggingface.co/gmougeot/lepinet-models
- Articulo de referencia (identificador arXiv declarado en las etiquetas): arxiv:2508.10104
- GBIF: https://www.gbif.org
