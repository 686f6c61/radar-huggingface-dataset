# LibreYOLO/LibreMarigoldV2b-depth-disparity-layered

## Resumen

LibreMarigoldV2b-depth-disparity-layered es un checkpoint de adaptador para estimacion de profundidad publicado por LibreYOLO dentro de su libreria `libreyolo`. No se trata de un modelo autonomo: contiene unicamente el adaptador de inferencia, el decodificador y los tensores de prompt fijos de la variante `disparity-layered` de Marigold V2, y requiere descargar por separado el modelo base congelado `Qwen/Qwen-Image-Edit-2509` (revision fijada a `d3968ef930e841f4c73640fb8afa3b306a78167e`). El repositorio pesa 1,9 GB y su `pipeline_tag` es `depth-estimation`.

El modelo resuelve el problema de estimar un mapa de profundidad denso a partir de una imagen RGB mediante un transformer de difusion (diffusion transformer), siguiendo la linea de Marigold V2 de huawei-bayerlab. La salida emplea codificacion `inverse_depth` y es afin-relativa en ese espacio, por lo que no esta expresada en metros y no es directamente metrica sin calibracion posterior. El canvas de prediccion es nativo y se redondea hacia arriba a multiplos de 16, aunque `imgsz=512` fuerza un lienzo cuadrado fijo; la salida se devuelve a la resolucion original.

Su relevancia es de integracion mas que de investigacion: es un empaquetado listo para consumir desde LibreYOLO (rama `feat/marigoldv2`) con licencia Apache 2.0, validado contra la implementacion nativa con una diferencia absoluta maxima de 0.0 en una NVIDIA L40S con PyTorch 2.10.0+cu128. El autor indica explicitamente que esa validacion verifica paridad de implementacion, no precision de benchmarks publicados. No se han publicado descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (diffusion transformer) para estimacion monocular de profundidad; variante `disparity-layered` de Marigold V2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen; no procesa secuencias de texto) |
| Tipos de cuantizacion | NF4 y BF16, probados en CUDA |
| Idiomas soportados | no disponible (la salida es un mapa de profundidad, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (checkpoint PyTorch en el formato de la libreria LibreYOLO) |
| Pipeline | depth-estimation |
| Libreria | libreyolo |
| Tamano del repositorio | 1,9 GB |
| Modelos base | `huawei-bayerlab/marigold-v2-0` (revision `6fd6d1ca246c9d2d99a4d8ac375a4eccc87178ad`, subcarpeta `depth/Disparity-layered`) y `Qwen/Qwen-Image-Edit-2509` (base congelada, revision `d3968ef930e841f4c73640fb8afa3b306a78167e`) |
| Fecha de publicacion | 2026-09-10 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Marigold V2, un esquema de difusion para profundidad monocular cuyo backbone es el transformer de difusion de Qwen-Image-Edit. Este repositorio no contiene ese backbone: solo incluye el adaptador de inferencia, el decodificador y los tensores de prompt fijos de la variante `disparity-layered`, mas metadatos de LibreYOLO y un marcador de variante. Los tensores de proyeccion iREPA, empleados unicamente en entrenamiento, se han omitido deliberadamente durante la conversion; el script de conversion esta en `libreyolo/models/marigold_v2/convert.py`.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron fases de RLHF o DPO (en un modelo de difusion para vision estas fases no serian equiparables a las de un LLM, pero el dato no se proporciona). El autor tampoco documenta hiperparametros, recetas de entrenamiento ni innovaciones adicionales mas alla del uso de prompts fijos y del modo `disparity-layered`. La unica validacion tecnica publicada es un contraste de salidas contra la implementacion nativa en dos comparaciones ejecutadas en el mismo worker, con diferencia absoluta maxima de 0.0, lo que acredita equivalencia de implementacion pero no exactitud de prediccion ni coincidencia bit a bit entre maquinas distintas.

## Capacidades

- Estimacion monocular de profundidad densa a partir de una imagen RGB, en la variante `disparity-layered`.
- Salida con codificacion `inverse_depth` y escala afin-relativa en ese espacio; devuelve el mapa a la resolucion original de la imagen de entrada.
- Seleccion de lienzo de prediccion: por defecto, canvas nativo redondeado a multiplos de 16; con `imgsz=512`, lienzo cuadrado fijo.
- Inferencia en CUDA con pesos en NF4 o BF16.
- Visualizacion del resultado y guardado de la prediccion mediante la API de LibreYOLO (`result.plot().save(...)`).
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- No se documentan capacidades multilingues, de vision general, audio ni modo de razonamiento explicito.
- No soporta entrenamiento, exportacion a otros formatos ni ejecucion en MPS dentro de esta integracion.

## Casos de uso

- Reconstruccion 3D y fotogrametria: el mapa de profundidad denso sirve como entrada para generar nubes de puntos o mallas; al ser `inverse_depth` afin-relativo, cualquier uso metrico exige calibrar la escala contra una referencia conocida.
- Postproduccion y efectos de desenfoque: el mapa permite separar primer plano y fondo para aplicar profundidad de campo sintetica o desenfoque selectivo, aprovechando que la salida vuelve a la resolucion original de la toma.
- Realidad aumentada con oclusion: insertar objetos virtuales que queden ocultos por elementos reales en primer plano requiere una estimacion de profundidad alineada con la imagen; el adaptador ofrece esa estimacion de forma integrada en el pipeline de LibreYOLO.
- Robotica y navegacion asistida: percepcion de obstaculos y estimacion de distancias relativas en tiempo de ejecucion, con la advertencia de que la salida no es metrica y necesitaria calibracion por escena.
- Preprocesado para NeRF o Gaussian Splatting: los mapas de profundidad por vista se usan como supervision o inicializacion geometrica en pipelines de reconstruccion novel-view.
- Segmentacion y enmascarado guiado por profundidad: separar instancias por plano de profundidad para tareas de matting, recorte o composicion, combinando el mapa con otros modelos de segmentacion.
- Automocion y ADAS en fase de prototipado: estimacion de profundidad monocular como senal auxiliar, teniendo en cuenta que la codificacion `inverse_depth` no es apta para seguridad funcional sin una capa de calibracion y validacion propia.
- Inspeccion industrial: deteccion de relieve, huecos o piezas apiladas mediante el analisis de discontinuidades en el mapa de profundidad en lineas de control de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada por el autor es de paridad de implementacion: dos comparaciones de salida contra la implementacion nativa, en el mismo worker, con una diferencia absoluta maxima de 0.0, medidas en una NVIDIA L40S con PyTorch 2.10.0+cu128. El propio autor advierte que esto no constituye una validacion de precision frente a benchmarks publicados ni garantiza coincidencia bit a bit entre maquinas distintas. No hay datos de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. El consumo vendra dominado por el modelo base `Qwen/Qwen-Image-Edit-2509`, que se descarga aparte y es muy superior a los 1,9 GB del repositorio del adaptador.
- GPU recomendadas: la unica plataforma verificada por el autor es NVIDIA L40S. No se documentan otros modelos de GPU.
- GPU de consumo: no se confirma soporte en tarjetas de consumo; el autor no publica requisitos minimos de VRAM ni pruebas en RTX u otras gamas.
- Opciones de despliegue: integracion oficial en LibreYOLO con las dependencias `libreyolo[marigold]`, disponible en la rama `feat/marigoldv2` del repositorio de GitHub. La carga se hace con `LibreYOLO("LibreMarigoldV2b-depth-disparity-layered.pt", device="cuda")`.
- Compatibilidad de aceleradores: solo CUDA (NF4 y BF16 probados). MPS no esta soportado por esta integracion.
- Formatos de exportacion: no soportados (ni entrenamiento ni export).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Licencia | Formato | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| LibreMarigoldV2b-depth-disparity-layered | no disponible (adaptador de 1,9 GB) | Adaptador de difusion para profundidad, variante `disparity-layered` | Apache 2.0 | `.pt` (LibreYOLO) | HuggingFace + LibreYOLO (rama `feat/marigoldv2`); requiere base aparte | Diferencia absoluta maxima de 0.0 frente al nativo, en el mismo worker |
| huawei-bayerlab/marigold-v2-0 (subcarpeta `depth/Disparity-layered`) | no disponible | Modelo de difusion para profundidad, variante `disparity-layered` | Apache 2.0 | no disponible | HuggingFace | no disponible |
| Qwen/Qwen-Image-Edit-2509 | no disponible | Transformer de difusion para edicion de imagen, usado aqui como base congelada | Apache 2.0 | no disponible | HuggingFace | no disponible |

No se dispone de datos de parametros, contexto ni resultados de benchmarks para ninguna de las alternativas en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa con otros estimadores de profundidad monocular.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el base `Qwen/Qwen-Image-Edit-2509` descargado por separado, el adaptador no puede ejecutar inferencia.
- La salida no es metrica: usa codificacion `inverse_depth` y escala afin-relativa en ese espacio, no metros. Cualquier aplicacion que requiera distancias absolutas necesita calibracion externa.
- La validacion publicada acredita paridad de implementacion (0.0 de diferencia maxima contra el nativo en el mismo worker), no exactitud frente a benchmarks ni reproducibilidad bit a bit entre maquinas distintas.
- Esta variante concreta es `disparity-layered`; no cubre otras variantes de Marigold V2 ni otras tareas.
- Sin soporte de entrenamiento, exportacion ni MPS en esta integracion. Solo CUDA con NF4 o BF16.
- Sin resultados de benchmarks publicados en la informacion disponible, por lo que no hay evidencia cuantitativa de calidad de profundidad.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no existe validacion independiente por parte de la comunidad.
- Idiomas soportados: no disponible; al tratarse de un modelo de vision con salida de profundidad, no hay componente textual.
- No se documentan sesgos especificos ni tasas de fallo por tipo de imagen. Como precaucion general en produccion, conviene validar el modelo sobre el dominio objetivo antes de desplegarlo, especialmente en escenas con superficies reflectantes, transparentes o texturas repetitivas.
- Licencia: el checkpoint se distribuye bajo Apache 2.0. El autor advierte de que los pesos preentrenados no estan cubiertos por la licencia MIT del codigo fuente de LibreYOLO. El base de Huawei lleva aviso de copyright 2026 Huawei Technologies Co., Ltd. bajo Apache 2.0, y el modelo base de Qwen declara tambien Apache 2.0.
- Dependencia de una rama de desarrollo (`feat/marigoldv2`) en el repositorio de LibreYOLO, lo que implica un riesgo de estabilidad de API en despliegues a medio plazo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LibreYOLO/LibreMarigoldV2b-depth-disparity-layered
- Modelo base Marigold V2: https://huggingface.co/huawei-bayerlab/marigold-v2-0 (revision `6fd6d1ca246c9d2d99a4d8ac375a4eccc87178ad`)
- Base congelada Qwen-Image-Edit: https://huggingface.co/Qwen/Qwen-Image-Edit-2509 (revision `d3968ef930e841f4c73640fb8afa3b306a78167e`)
- Repositorio de la implementacion de origen Marigold V2: https://github.com/huawei-bayerlab/marigold-v2/tree/cc6a7031abcd59fd9e1ceff7fdd0d9687d389bc5
- Rama de integracion en LibreYOLO: https://github.com/LibreYOLO/libreyolo/tree/feat/marigoldv2
- Script de conversion: https://github.com/LibreYOLO/libreyolo/blob/feat/marigoldv2/libreyolo/models/marigold_v2/convert.py
