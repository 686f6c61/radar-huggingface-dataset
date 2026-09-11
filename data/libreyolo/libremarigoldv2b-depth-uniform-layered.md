# LibreYOLO/LibreMarigoldV2b-depth-uniform-layered

## Resumen

LibreMarigoldV2b-depth-uniform-layered es un checkpoint de estimación de profundidad publicado por LibreYOLO. No es un modelo independiente: se trata de un adaptador de inferencia y un conjunto de tensores de prompt fijos que se montan sobre la base congelada Qwen/Qwen-Image-Edit-2509, un transformer de difusion orientado a edicion de imagen. El adaptador procede del subfolder `depth/Uniform-layered` del modelo huawei-bayerlab/marigold-v2-0 (revision `6fd6d1ca246c9d2d99a4d8ac375a4eccc87178ad`), de modo que implementa la variante `uniform-layered` del enfoque Marigold V2 para prediccion densa de profundidad mediante difusion.

El valor practico del checkpoint esta en el empaquetado: LibreYOLO distribuye el adaptador y los tensores de prompt en un unico fichero `.pt` de 1,7 GB y lo integra en su libreria (`libreyolo`), de forma que la inferencia se resuelve cargando el modelo y llamandolo sobre una imagen. La misma validacion del autor indica paridad exacta con la implementacion nativa de Marigold V2 en dos comparaciones sobre NVIDIA L40S con PyTorch 2.10.0+cu128, con diferencia absoluta maxima de 0.0.

Es relevante ahora porque permite usar Marigold V2 sin ensamblar manualmente el pipeline de difusion ni los tensores de prompt, y porque la inferencia CUDA admite NF4 y BF16. Sus limitaciones son explicitas: la salida esta en codificacion `depth` affine-relative y no en metros, el repositorio no contiene el modelo base (se descarga por separado), no hay benchmarks de precision publicados y la integracion no soporta entrenamiento, exportacion ni MPS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (diffusion-transformer) heredado de Qwen/Qwen-Image-Edit-2509, con adaptador de profundidad Marigold V2 (variante `uniform-layered`) y tensores de prompt fijos |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de vision; el lienzo de inferencia por defecto es el nativo redondeado a multiplos de 16, y `imgsz=512` fija un lienzo cuadrado) |
| Tipos de cuantizacion | NF4 y BF16 probados en CUDA; no se documentan otras |
| Idiomas soportados | no disponible (modelo de vision; no se declaran idiomas) |
| Licencia | Apache-2.0 (los pesos preentrenados no estan cubiertos por la licencia MIT del codigo fuente de LibreYOLO) |
| Formato de pesos | `.pt` (formato de LibreYOLO); el modelo base Qwen se descarga aparte, en el formato que distribuya su repositorio |
| Tamano del repositorio | 1,7 GB |
| Pipeline | depth-estimation |
| Libreria | libreyolo |
| Modelos base | huawei-bayerlab/marigold-v2-0, Qwen/Qwen-Image-Edit-2509 (revision `d3968ef930e841f4c73640fb8afa3b306a78167e`) |
| Fecha de publicacion | 10 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El checkpoint contiene el adaptador de inferencia, el decoder y los tensores de prompt del subfolder `depth/Uniform-layered` de Marigold V2, sobre una base de difusion congelada: Qwen/Qwen-Image-Edit-2509, anclada a la revision `d3968ef930e841f4c73640fb8afa3b306a78167e`. La estimacion de profundidad se obtiene, por tanto, mediante un proceso de difusion guiado por prompt sobre la imagen de entrada, en la linea de Marigold V2, con la particularidad de la variante `uniform-layered`.

Las modificaciones introducidas por LibreYOLO son de empaquetado y metadatos: se anaden metadatos de LibreYOLO y un marcador de variante, mientras que el adaptador de inferencia, el decoder y los tensores de prompt se mantienen sin cambios. Se omiten dos tensores de proyeccion iREPA con nombre, usados solo en entrenamiento. La conversion esta implementada en `libreyolo/models/marigold_v2/convert.py`. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Estimacion de profundidad densa a partir de una unica imagen (pipeline `depth-estimation`).
- Prediccion en la variante `uniform-layered` de Marigold V2, procedente del subfolder `depth/Uniform-layered` del modelo de Huawei.
- Salida en codificacion `depth` con valores affine-relative en ese espacio (no son metros).
- Control del lienzo de inferencia: por defecto el lienzo nativo redondeado a multiplos de 16; `imgsz=512` selecciona un lienzo cuadrado fijo. Las salidas se devuelven a la resolucion original.
- Integracion con la API de LibreYOLO mediante `LibreYOLO("...pt", device="cuda")`, con acceso al mapa de profundidad como array (`result.depth_map.numpy().data`) y utilidad de visualizacion (`result.plot()`).
- Inferencia en CUDA con NF4 y BF16.
- No se documentan capacidades de generacion de texto, codigo, tool calling, agentes, vision generalista ni audio: el modelo esta especializado en profundidad.

## Casos de uso

- Generacion de mapas de profundidad para reconstruccion 3D: el mapa denso por pixel sirve como entrada a pipelines de elevacion a malla o nube de puntos en fotogrametria de una sola vista.
- Efectos de desenfoque selectivo y profundidad de campo en postproduccion: el mapa de profundidad permite separar planos y aplicar bokeh sintetico o depth grading sobre la imagen original, que se recupera a su resolucion de partida.
- Preparacion de datos para entrenamiento de modelos 3D o de segmentacion: anotacion automatica de profundidad sobre catalogos de imagenes, con la salvedad de que los valores son affine-relative y requieren una referencia de escala si se necesita metrica.
- Robotica y navegacion asistida: estimacion monocular de estructura de escena en el bucle de percepcion, ejecutable en CUDA con NF4 para reducir huella de memoria.
- Realidad aumentada y virtual: colocacion de objetos virtuales coherente con la geometria de la escena a partir de la profundidad estimada de un fotograma.
- Relighting y composicion de imagenes: la profundidad permite estimar relaciones de oclusion y separar primer plano y fondo antes de recomponer.
- Analisis de escenas en pipelines de vision por computador: extraccion de caracteristicas de profundidad como canal adicional para deteccion, segmentacion o estimacion de pose.
- Prototipado rapido en investigacion: comparar la variante `uniform-layered` con otras variantes de Marigold V2 sin reimplementar el pipeline de difusion, gracias a la API de LibreYOLO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (absolutos o relativos) en la informacion disponible. El autor solo documenta una validacion de paridad de implementacion:

| Prueba | Entorno | Resultado |
|---|---|---|
| Comparacion upstream/nativo frente a la integracion LibreYOLO (2 comparaciones, mismo worker) | NVIDIA L40S, PyTorch 2.10.0+cu128 | Diferencia absoluta maxima 0.0 |
| Inferencia CUDA | NF4 y BF16 | Probada |

Esta validacion acredita paridad de implementacion, no precision frente a benchmarks publicados ni coincidencia bit a bit entre maquinas distintas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publican parametros totales del modelo; el repositorio de 1,7 GB contiene solo el adaptador y los tensores de prompt, no la base).
- GPU recomendadas: no disponibles en la informacion. El unico entorno verificado por el autor es NVIDIA L40S con PyTorch 2.10.0+cu128.
- Compatibilidad con GPU de consumo: no confirmada. La disponibilidad de inferencia en NF4 sugiere que la huella puede reducirse, pero no hay cifras publicadas que permitan afirmar que cabe en una GPU de consumo concreta.
- Aceleracion: requiere CUDA. La integracion no soporta MPS.
- Opciones de despliegue: integracion de LibreYOLO en la rama `feat/marigoldv2` de su repositorio, con dependencias `libreyolo[marigold]`. No se documentan soportes de vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles.
- Formatos no soportados por la integracion: entrenamiento y exportacion.

Ejemplo de uso declarado por el autor:

```python
from libreyolo import LibreYOLO

model = LibreYOLO("LibreMarigoldV2b-depth-uniform-layered.pt", device="cuda")
result = model("photo.jpg")
values = result.depth_map.numpy().data
result.plot().save("prediction.png")
```

## Comparativa con modelos similares

No se dispone de datos de rendimiento de benchmarks para establecer una comparativa cuantitativa. La comparacion posible se limita al rol, la licencia y la disponibilidad segun la informacion proporcionada:

| Modelo | Rol en el pipeline | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|
| LibreMarigoldV2b-depth-uniform-layered | Adaptador y tensores de prompt en formato LibreYOLO | Apache-2.0 | Hugging Face; requiere descargar la base Qwen por separado | Sin benchmarks publicados; paridad 0.0 con la implementacion nativa en L40S |
| huawei-bayerlab/marigold-v2-0 | Fuente del adaptador (`depth/Uniform-layered`) y de la implementacion de referencia | Apache-2.0 | Hugging Face (revision `6fd6d1ca...`); implementacion en GitHub | no disponible en la informacion |
| Qwen/Qwen-Image-Edit-2509 | Base de difusion congelada sobre la que se monta el adaptador | Apache-2.0 declarada en su model card | Hugging Face (revision `d3968ef9...`) | no disponible en la informacion |

No se identifican en la informacion disponible otros modelos comparables (por ejemplo alternativas monofocales de estimacion de profundidad) con datos verificables.

## Limitaciones y advertencias

- No es un modelo autonomo: no contiene los pesos del modelo base Qwen/Qwen-Image-Edit-2509, que deben descargarse por separado. Usar el `.pt` sin esa base no es viable.
- Los valores de profundidad estan en codificacion `depth` y son affine-relative en ese espacio; no son metros. Cualquier uso metrico exige un calibrado externo.
- La validacion publicada se limita a dos comparaciones en el mismo worker y en una unica GPU (NVIDIA L40S, PyTorch 2.10.0+cu128). No acredita coincidencia bit a bit entre maquinas ni precision frente a benchmarks.
- No hay resultados de benchmarks publicados, por lo que no es posible cuantificar la calidad de la prediccion frente a otras alternativas.
- La integracion no soporta entrenamiento, exportacion ni MPS.
- El repositorio presenta 0 descargas y 0 likes y fue creado el 10 de septiembre de 2026: se trata de un artefacto reciente y sin validacion externa conocida.
- Licencia Apache-2.0 en el checkpoint, en la base Qwen y en la implementacion de origen, pero los pesos preentrenados no estan cubiertos por la licencia MIT del codigo fuente de LibreYOLO; conviene revisar `LICENSE` y `NOTICE` antes de un uso comercial.
- Al depender de una base de edicion de imagen y de tensores de prompt fijos, no se documenta control mediante prompt de texto libre ni ajuste de parametros de generacion.
- No se declaran sesgos, idiomas soportados ni comportamiento ante dominios fuera de distribucion; el modelo es de vision y no procesa lenguaje.
- Se omiten dos tensores de proyeccion iREPA usados solo en entrenamiento, de modo que el checkpoint no esta pensado para reentrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LibreYOLO/LibreMarigoldV2b-depth-uniform-layered
- Modelo de origen del adaptador: https://huggingface.co/huawei-bayerlab/marigold-v2-0/tree/6fd6d1ca246c9d2d99a4d8ac375a4eccc87178ad
- Base congelada: https://huggingface.co/Qwen/Qwen-Image-Edit-2509/tree/d3968ef930e841f4c73640fb8afa3b306a78167e
- Implementacion de origen Marigold V2: https://github.com/huawei-bayerlab/marigold-v2/tree/cc6a7031abcd59fd9e1ceff7fdd0d9687d389bc5
- Rama de integracion de LibreYOLO: https://github.com/LibreYOLO/libreyolo/tree/feat/marigoldv2
- Script de conversion: https://github.com/LibreYOLO/libreyolo/blob/feat/marigoldv2/libreyolo/models/marigold_v2/convert.py
