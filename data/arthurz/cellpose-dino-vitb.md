# ArthurZ/cellpose-dino-vitb

## Resumen

CellposeDINO ViT-B (identificador `ArthurZ/cellpose-dino-vitb`) es un modelo de segmentación celular publicado dentro del ecosistema Cellpose 4.2.1. Según la documentación oficial de Cellpose, se trata de la variante "cpdino-vitb" del modelo CellposeDINO, lanzada en junio de 2026, que emplea un backbone DINOv3-ViTB (la version pequena del backbone DINOv3 Vision Transformer). El repositorio aloja un unico artefacto en formato `safetensors` con 85.881.808 parametros totales (aproximadamente 86 M) y un tamano de repositorio de 0,3 GB.

El modelo resuelve el problema de la segmentacion automatica de celulas en imagenes de microscopia, una tarea central en biologia celular, histologia y analisis de imagenes biomedicas. Cellpose es una herramienta de referencia en este campo, con una larga trayectoria de versiones (Cellpose 2.0, Cellpose 3 y la actual Cellpose 4). La familia CellposeDINO sustituye el backbone clasico por uno basado en DINOv3, un modelo auto-supervisado de representacion visual, buscando mejorar la calidad de las representaciones aprendidas para la segmentacion.

La relevancia de esta ficha concreta es limitada a efectos de comunidad: el modelo acumula 5 descargas y 0 likes, y no expone pipeline, licencia ni idiomas en su tarjeta de HuggingFace. No obstante, forma parte de una linea de modelos activa y documentada, y su tamano (86 M de parametros) lo situa en el rango de los modelos ejecutables en hardware de consumo. La variante `cpdino-vitb` es la opcion "mas pequena" de CellposeDINO frente a la variante de backbone ViT-L.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (backbone DINOv3-ViTB segun CellposeDINO) |
| Parametros totales | 85.881.808 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

Otros datos del repositorio: tamano 0,3 GB, 5 descargas, 0 likes, creado el 2026-10-15 y actualizado el mismo dia.

## Arquitectura y entrenamiento

No se dispone en la informacion proporcionada de detalles sobre el dataset de entrenamiento, el numero de imagenes utilizadas, ni sobre si se aplicaron tecnicas de ajuste fino supervisado, auto-supervisado o de aprendizaje con correcciones humanas (el protocolo human-in-the-loop es una seña de identidad documentada de versiones anteriores de Cellpose). Tampoco se especifican metodos de aumento de datos, funcion de perdida ni esquema de optimizacion.

Lo unico confirmado por la documentacion de Cellpose es que el modelo usa un backbone DINOv3-ViTB. DINOv3 es una familia de modelos de representacion visual auto-supervisados; su uso como extractor de caracteristicas en un pipeline de segmentacion implica que la cabeza de segmentacion se entrena o ajusta sobre caracteristicas preentrenadas. Se desconoce si en este repositorio concreto se incluye unicamente el backbone, la cabeza de segmentacion o el modelo completo listo para inferencia. La documentacion de Cellpose indica que los modelos de la familia manejan segmentacion tanto 2D como 3D.

## Capacidades

- Segmentacion de celulas en imagenes de microscopia, tarea principal del modelo.
- Soporte de imagenes 2D y 3D, segun la documentacion general de Cellpose para sus modelos.
- Uso a traves de la libreria Cellpose (`models`), que permite cargar el modelo y ejecutar la segmentacion sobre imagenes.
- Variante "pequeña" del backbone DINOv3 (ViT-B frente a ViT-L), orientada a un coste computacional menor.
- No se ha confirmado en la informacion disponible soporte de tool calling, agentes, capacidades multilingues, thinking mode, vision general, audio ni ninguna otra capacidad fuera de la segmentacion celular.
- No se ha confirmado en la informacion disponible si el modelo admite prompts (por ejemplo, puntos o mascaras) para la segmentacion.

## Casos de uso

- Segmentacion de celulas en cultivos in vitro: el modelo puede procesar imagenes de microscopia de fluorescencia o campo claro procedentes de placas de cultivo para delimitar celulas individuales y obtener recuentos y morfologias, que es el uso principal documentado de la familia Cellpose.
- Analisis de tejidos en histologia: segmentacion de nucleos y celulas en preparaciones teñidas, util para cuantificar densidad celular y patrones espaciales en laminas digitalizadas.
- Pipelines de cribado de alto contenido (high-content screening): integracion en flujos automatizados que analizan miles de imagenes por experimento, donde un modelo de 86 M de parametros con backbone ViT-B resulta mas adecuado por coste que una variante ViT-L.
- Investigacion en biologia celular: extraccion de metricas de area, perimetro, forma y numero de celulas por imagen para estudios de proliferacion, muerte celular o respuesta a tratamientos.
- Segmentacion 3D de volumenes de microscopia: la documentacion de Cellpose indica soporte para datos 2D y 3D, lo que permite procesar pilas de imagenes (z-stacks) de tejidos o embriones.
- Docencia y prototipado en bioimagen: al tratarse de un modelo relativamente pequeno, puede usarse en entornos educativos o de prueba para experimentar con segmentacion sin necesidad de infraestructura de gran escala.
- Comparacion con otras variantes de Cellpose (cpsam, cpdino ViT-L): util como referencia en estudios que evalúan el equilibrio entre calidad de segmentacion y coste computacional segun el backbone.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de HuggingFace no incluye tarjeta de modelo con metricas ni la busqueda web aporta cifras de rendimiento para esta variante concreta (`cpdino-vitb`). No se dispone de valores de IoU, Dice, F1 ni de comparaciones cuantitativas con `cpsam_v2` o `cpdino` (ViT-L).

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 85,9 M de parametros, una estimacion orientativa en precision FP16 rondaria los 0,2 GB solo de pesos, mas el consumo de las activaciones, que depende de la resolucion de la imagen de entrada. No se dispone de cifras oficiales.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, el modelo es compatible con GPUs de consumo y con GPUs de datacenter (A100, H100) para procesamiento por lotes.
- Cabe en GPU de consumo: por numero de parametros, es esperable que quepa en GPUs con 4-8 GB de VRAM o mas, aunque no se ha confirmado ni la precision de inferencia ni el consumo real de memoria.
- Opciones de despliegue: la via documentada es la libreria Cellpose (`from cellpose import models`). No se ha confirmado compatibilidad con vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje y no a este tipo de modelo de segmentacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Backbone | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cpdino-vitb (este modelo) | DINOv3-ViTB | 85.881.808 (repo ArthurZ) | no aplica | no disponible | HuggingFace ArthurZ/cellpose-dino-vitb |
| cpdino | DINOv3-ViTL | no disponible | no aplica | no disponible | Repositorio mouseland/cellpose-sam |
| cpsam_v2 | SAM-ViTL | no disponible | no aplica | no disponible | Repositorio mouseland/cellpose-sam |
| cpsam (original) | SAM-ViTL | no disponible | no aplica | no disponible | Descarga automatica via Cellpose |

Nota: el numero de parametros de `cpdino` y `cpsam_v2` no se especifica en la informacion proporcionada. La diferencia principal entre `cpdino-vitb` y `cpdino` es el tamano del backbone (ViT-B frente a ViT-L), segun la documentacion de Cellpose.

## Limitaciones y advertencias

- La tarjeta del repositorio no declara licencia. Sin una licencia explicita, no puede asumirse permiso para uso comercial; es necesario contactar con el autor o consultar el repositorio oficial de Cellpose antes de cualquier uso en produccion.
- No se documentan sesgos, pero todo modelo de segmentacion entrenado con un conjunto de imagenes concreto puede degradarse ante dominios distintos (otro microscopio, otra tincion, otro tipo celular) no representados en el entrenamiento.
- Riesgo de error de segmentacion en regiones de bajo contraste; la documentacion de Cellpose menciona explicitamente que `cpsam_v2` incorpora una correccion en el entrenamiento para regiones de bajo contraste, lo que sugiere que esta es una debilidad conocida de la familia.
- No se ha confirmado que el repositorio contenga un modelo completo y listo para inferencia, ni su compatibilidad exacta con la version de la libreria Cellpose.
- El repositorio tiene un numero muy bajo de descargas (5) y cero likes, lo que reduce la evidencia de comunidad sobre su comportamiento en produccion.
- No se dispone de informacion sobre el idioma ni sobre la region de aplicacion; al ser un modelo de vision, estas categorias no aplican directamente.
- No se han publicado resultados de benchmarks que permitan validar el rendimiento antes de adoptarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ArthurZ/cellpose-dino-vitb
- Documentacion de modelos de Cellpose: https://cellpose.readthedocs.io/en/latest/models.html
- Documentacion principal de Cellpose: https://cellpose.readthedocs.io/en/latest/index.html
- Repositorio mouseland/cellpose-sam (contiene `cpdino-vitb`): https://huggingface.co/mouseland/cellpose-sam/blob/main/cpdino-vitb
- Documentacion de modelos en GitHub (DanaHenderson/CellPose): https://github.com/DanaHenderson/CellPose/blob/main/docs/models.rst
- Notebook de Colab sobre Cellpose: https://colab.research.google.com/github/bobiac/bobiac-book/blob/gh-pages/colab_notebooks/04_segmentation/deep_learning/cellpose_notebook_colab.ipynb
