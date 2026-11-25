# sentientsai/depth-anything-v2-small

## Resumen

Depth-Anything-V2-Small es un modelo de estimacion de profundidad monocular (MDE, *monocular depth estimation*) que, dada una imagen RGB, produce un mapa de profundidad relativa: un valor por pixel donde las zonas mas cercanas a la camara reciben valores mayores. El modelo original fue desarrollado por el equipo de Depth Anything (ByteDance) y este repositorio concreto es una redistribucion empaquetada por SentientsAI para su uso dentro de Unreal Engine, como componente de su Vision Core.

El repositorio no contiene pesos propios: es una exportacion ONNX derivada de `onnx-community/depth-anything-v2-small`, a su vez exportacion del modelo original `depth-anything/Depth-Anything-V2-Small`. SentientsAI ha generado variantes con formas fijas (resoluciones predefinidas en proporciones 1:1, 3:4, 9:16, 4:3 y 16:9, todas con lado corto de 518 pixeles) en precision fp16 y fp32, optimizadas para ejecutarse en DirectML, TensorRT, CPU y HLSL. Los ficheros estan fijados por SHA-256 en un catalogo firmado, de modo que el plugin descarga exactamente esos bytes.

Su relevancia es practica: ofrece un modelo de profundidad ligero (48,4 MiB en fp16, 94,5 MiB en fp32) con licencia Apache 2.0, listo para integrarse en pipelines graficos en tiempo real, especialmente en Unreal Engine, sin necesidad de convertir ni reexportar el modelo. No es un modelo de lenguaje: no genera texto ni soporta tool calling; su unica funcion es la prediccion de profundidad densa por pixel.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de estimacion de profundidad monocular; pesos originales de Depth-Anything-V2-Small) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | fp16 y fp32 (variantes ONNX precompiladas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (formas fijas: 518x518, 518x686, 518x924, 686x518, 924x518) |

## Arquitectura y entrenamiento

La model card de este repositorio no describe la arquitectura interna ni el proceso de entrenamiento del modelo original; solo documenta el empaquetado ONNX. Los pesos proceden de `depth-anything/Depth-Anything-V2-Small` via la exportacion de `onnx-community`. No se proporcionan datos sobre numero de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas del entrenamiento original.

Lo que si documenta el repositorio es la ingenieria de despliegue: SentientsAI ha generado, mediante el script `make_depth_files.py`, variantes con formas de entrada fijas (necesarias para runtimes que no admiten dimensiones dinamicas), en fp16 y fp32, y ha reescrito el grafo para que pueda ejecutarse en DirectML, TensorRT, CPU y HLSL. La salida es un mapa de profundidad relativa (no metrica) y una imagen en escala de grises para el grafo de render.

## Capacidades

- Estimacion de profundidad relativa densa: un valor de profundidad por pixel, con valores mayores para las zonas mas cercanas.
- Generacion de una imagen en escala de grises del mapa de profundidad para su uso directo en el grafo de render.
- Procesamiento de imagenes en cinco relaciones de aspecto predefinidas: 1:1, 3:4, 9:16, 4:3 y 16:9, todas con lado corto de 518 pixeles.
- Ejecucion en GPU (DirectML, TensorRT) y en CPU (variantes fp32).
- Integracion como componente de Vision Core en Unreal Engine, seleccionable como `EVisionModel::DepthAnythingV2Small`, con entrada `CoreImageInput` y salida `CoreDepthOutput`.
- No soporta generacion de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingues.

## Casos de uso

- Efectos de profundidad de campo en tiempo real en Unreal Engine: el modelo genera el mapa de profundidad por fotograma y permite aplicar desenfoque selectivo o *bokeh* sin geometria 3D explicita, aprovechando las variantes fp16 para DirectML y TensorRT.
- Reconstruccion de escena y *depth peeling* en pipelines de render: el mapa de profundidad relativa sirve como entrada para tecnicas de composicion, niebla volumetrica o parallax, usando la salida en grises directamente en el grafo de render.
- Previsualizacion de profundidad en herramientas de edicion de video o imagen: integracion en un plugin de escritorio que procese fotogramas a 518x924 (9:16) o 924x518 (16:9) para generar mascaras de profundidad en postproduccion.
- Generacion de mapas de disparidad para vision por computador en robots o drones: la variante fp32 en CPU permite ejecutar el modelo en entornos sin GPU dedicada, con formas de entrada fijas que simplifican el preprocesado.
- *Data augmentation* y generacion de datos sinteticos: usar los mapas de profundidad para condicionar modelos de difusion o para anadir informacion geometrica a datasets de imagenes, con la ventaja de que el modelo es ligero y de licencia permisiva.
- Prototipado rapido en investigacion de MDE: al estar disponible en ONNX con formas fijas y hashes verificables, sirve como *baseline* reproducible para comparar tecnicas de estimacion de profundidad sin depender de frameworks de Python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; por el tamano de los ficheros, la variante fp16 ocupa 48,4 MiB y la fp32 94,5 MiB en disco, por lo que la huella en memoria es muy reducida.
- GPU recomendadas: cualquier GPU compatible con DirectML o TensorRT; la model card indica que el modelo funciona "mejor en una tarjeta grafica" sin especificar modelos concretos.
- Compatibilidad con GPU de consumo: si, dado el reducido tamano del modelo; no se detallan modelos concretos.
- Opciones de despliegue: ONNX Runtime con DirectML, TensorRT, CPU y HLSL; integracion via el plugin de Unreal Engine de SentientsAI y sus referencias en Python.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| sentientsai/depth-anything-v2-small | no disponible | 518 px lado corto, 5 relaciones de aspecto | Apache 2.0 | ONNX fp16/fp32 | Empaquetado para Unreal Engine, hashes firmados |
| depth-anything/Depth-Anything-V2-Small (original) | no disponible | dinamica | Apache 2.0 | safetensors/PyTorch | Modelo base del que deriva este |
| onnx-community/depth-anything-v2-small | no disponible | dinamica | Apache 2.0 | ONNX | Exportacion ONNX intermedia |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Profundidad relativa, no metrica: los valores no estan calibrados en unidades fisicas (metros), por lo que no sirve directamente para medicion de distancias reales.
- Formas de entrada fijas: solo admite las cinco resoluciones predefinidas; no procesa imagenes de otras dimensiones sin recorte o redimensionado previo.
- Sin informacion sobre sesgos: la model card no documenta sesgos del modelo original ni del empaquetado.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero el modelo puede producir estimaciones de profundidad incorrectas en escenas ambiguas, superficies reflectantes o texturas repetitivas.
- Idiomas: no aplica; es un modelo puramente visual.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del catalogo firmado de SentientsAI y del plugin de Unreal Engine, que pueden tener terminos propios distintos de la licencia de los pesos.
- Dependencia de un tercero: el repositorio es una redistribucion; los pesos originales y su procedencia deben rastrearse hasta `depth-anything/Depth-Anything-V2-Small` para auditorias.
- Sin datos de benchmarks ni de latencia: no es posible evaluar su rendimiento relativo sin pruebas propias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sentientsai/depth-anything-v2-small
- Catalogo firmado de SentientsAI: https://huggingface.co/sentientsai/sentients-catalog
- Exportacion ONNX de origen: https://huggingface.co/onnx-community/depth-anything-v2-small
- Modelo original: https://huggingface.co/depth-anything/Depth-Anything-V2-Small
