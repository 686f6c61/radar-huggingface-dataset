# pictograph/pictograph-sceneparse150-m

## Resumen

Pictograph-SceneParse150-M es un modelo de segmentación de instancias publicado por Pictograph Research, construido sobre la arquitectura RF-DETR Seg Medium (familia DETR, transformers con predicción de conjuntos) y distribuido exclusivamente en formato ONNX. Resuelve el problema del *scene parsing*: dado un RGB, devuelve máscaras de instancia con polígono, caja envolvente, clase y confianza sobre un vocabulario de 150 clases de escenas (interiores y exteriores: pared, edificio, cielo, suelo, coche, persona, mesa, etc.). Es relevante porque ofrece un detector-segmentador de tamano medio con licencia permisiva (BSD 3-Clause), resolución de entrada fija de 432x432 y un repo de solo 0,1 GB, lo que lo hace desplegable en CPU o en GPUs de gama baja mediante ONNX Runtime.

El modelo declara 26,4 % de mAP y 41,4 % de mAP@50 sobre su conjunto de evaluación, métricas no verificadas de forma independiente según la propia model card. Se entrenó durante 12 épocas sobre 22.207 imágenes a 432x432, con tamano de lote 4 y tasa de aprendizaje 0,0002.

Su interés practico esta en el pipeline de pre-anotacion y en aplicaciones de visión por computador que necesitan máscaras por instancia con latencia baja y sin dependencia de un framework de deep learning completo: basta ONNX Runtime más el SDK de Pictograph para el pre/post-procesado. No es un modelo de lenguaje: no procesa texto, no soporta tool calling ni razonamiento multi-paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR Seg Medium (transformer tipo DETR con cabeza de segmentación de instancias) |
| Parametros totales | no disponible (el repo ocupa 0,1 GB con pesos FP32, coherente con un modelo de tamano medio) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la entrada es una imagen de 432x432) |
| Tipos de cuantizacion | no disponible; solo se publican pesos en FP32, sin variantes INT8/FP16 |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades linguisticas) |
| Licencia | BSD 3-Clause |
| Formato de pesos | ONNX (`pictograph-sceneparse150-m.onnx`) + `config.json` |

Otros datos: tarea `image-segmentation` / segmentación de instancias, 150 clases, salida con polígonos, cajas y confianza, repo de 0,1 GB, version 1.0.0.

## Arquitectura y entrenamiento

El modelo pertenece a la familia RF-DETR en su variante Seg Medium, una arquitectura de detección-segmentación basada en transformers con predicción de conjuntos (sin anclas ni NMS en el diseño original de DETR) y una cabeza que produce máscaras por instancia. La model card indica `base_model: roboflow/rf-detr-base` y la etiqueta `rf-detr-seg-medium`; los detalles del backbone, el número de capas y el total de parámetros no se especifican en la información disponible.

El entrenamiento se realizó sobre 22.207 imágenes con entrada de 432x432 píxeles, 12 épocas, batch size 4, learning rate 0,0002 y precisión FP32, dando lugar a la versión 1.0.0. El vocabulario de 150 clases coincide con el del benchmark MIT SceneParse150/ADE20K (la model card solo lista las 60 primeras: wall, building, sky, floor, tree, ceiling, road, bed, windowpane, grass, etc.). No se documenta el uso de RLHF, DPO ni técnicas de destilación; tampoco se detalla la composición del dataset ni si hubo aumentos de datos o congelación de capas. La innovación practica del artefacto es el empaquetado: pesos ONNX listos para inferencia con ONNX Runtime y un SDK que reproduce exactamente el pre/post-procesado del autor.

## Capacidades

- Segmentación de instancias en imágenes RGB con salida de máscara poligonizada, caja envolvente, nombre de clase y confianza.
- Reconocimiento de 150 categorías de escena, incluyendo interiores (wall, floor, ceiling, bed, sofa, cabinet, table, chair, sink, bathtub) y exteriores (sky, road, sidewalk, grass, mountain, sea, sand, field, tree, building, skyscraper).
- Clases de movilidad y entorno viario: car, road, sidewalk, path, runway, railing, fence, stairs.
- Objetos y personas: person, box, signboard, screen_door, mirror, lamp, rug, cushion, pillow.
- Inferencia en CPU o GPU a través de ONNX Runtime (FP32), sin necesidad de PyTorch.
- Integración con el SDK de Pictograph (`load_model`, `InstanceSegmentationModel`, `predict`) para obtener objetos `InstanceSegmentationResult` con polígonos y cajas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades de visión-lenguaje (VQA, captioning) ni audio.

## Casos de uso

- Pre-anotacion de datasets de segmentación: el modelo genera polígonos y cajas por instancia sobre imágenes nuevas, que un equipo de etiquetado revisa y corrige; con 26,4 % de mAP sirve como acelerador del etiquetado, no como sustituto de la revisión humana.
- Análisis de fotografía inmobiliaria: detección y medición aproximada de estancias y mobiliario (wall, floor, bed, sofa, table, cabinet, windowpane) para generar descripciones estructuradas o planos esquemáticos a partir de fotos, aprovechando que la entrada 432x432 mantiene el coste por imagen bajo.
- Etiquetado automático y búsqueda visual en bibliotecas de imágenes: indexar por clase dominante y por instancias (sky, sea, mountain, building, person) para filtros y motores de búsqueda internos.
- Edición fotográfica asistida: segmentación de cielo, suelo, agua y vegetación (sky, floor, water, grass, tree, plant) para sustituir fondos o aplicar ajustes locales por máscara.
- Mapas semánticos para robótica y navegación indoor: al devolver máscaras por instancia de floor, wall, door, table, chair y stairs, se puede construir una rejilla de ocupación semántica a partir del flujo de vídeo, procesando cada frame con ONNX Runtime en la propia CPU del robot o en una GPU embebida.
- Automatización de inventario en obra o industria: conteo de column, wall, fence, box, cabinet y counter en inspecciones periódicas, con la ventaja de una licencia BSD 3-Clause que permite uso comercial sin royalties.
- Prototipado rápido de APIs de visión: desplegar el endpoint alojado de Pictograph o autoalojarlo con ONNX Runtime para validar un producto de segmentación antes de invertir en un modelo propio.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente, campo `verified: false`), sobre un conjunto de evaluación sin nombre publico:

| Metrica | Valor |
|---|---:|
| mAP | 0,2639 (26,4 %) |
| mAP@50 | 0,4141 (41,4 %) |

No se han publicado en la información disponible resultados desglosados por clase, curvas precision-recall, latencia ni comparaciones con Mask R-CNN o SegFormer sobre el mismo split. Tampoco se indica el tamano del conjunto de evaluación.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con pesos FP32 y un repo de 0,1 GB, la inferencia cabe holgadamente en menos de 1 GB de memoria, pero es una estimación derivada, no un dato del autor.
- GPU recomendadas: no especificadas. Por tamano y resolución de entrada (432x432 FP32), cualquier GPU consumer con al menos 2 GB es suficiente en la practica: GTX 1650, RTX 3050/3060, RTX 4060/4090. Para lotes grandes en servidor, A100 o H100 estan sobredimensionadas para este modelo.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU con soporte CUDA y en iGPU modernas vía ONNX Runtime; también en CPU.
- Opciones de despliegue: ONNX Runtime (`CPUExecutionProvider` o `CUDAExecutionProvider`), SDK de Pictograph (`pip install "pictograph[inference]"`), API alojada de Pictograph y endpoints gestionados desde su plataforma. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de visión.
- Latencia y throughput: no disponibles. La model card solo indica que el modelo corre en FP32 con `onnxruntime` y que el post-procesado arquitectónico lo resuelve el SDK.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | Parametros | Contexto/entrada | mAP | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Pictograph-SceneParse150-M | Segmentación de instancias, 150 clases | RF-DETR Seg Medium, ONNX | no disponible | 432x432 | 26,4 % (mAP@50 41,4 %) | BSD 3-Clause | HuggingFace + Pictograph |
| roboflow/rf-detr-base (modelo base declarado) | Detección/segmentación | RF-DETR | no disponible | no disponible | no disponible en la información | no disponible en la información | HuggingFace |
| aisuko/ft-segformer-with-sceneparse150 | Segmentación semántica, scene_parse_150 | SegFormer (nvidia/mit-b0) | no disponible | no disponible | no disponible en la información | no disponible en la información | HuggingFace |
| Modelos del devkit MIT SceneParse150 | Segmentación semántica | FCN y variantes | no disponible | no disponible | no disponible en la información (remite a la validación del benchmark) | solo investigación | GitHub CSAILVision |

Diferencias clave: frente a los modelos del devkit MIT (restringidos a investigación), este modelo es BSD 3-Clause y por tanto apto para uso comercial; frente a SegFormer, produce instancias separadas con polígono en lugar de un mapa semántico denso, lo que cambia el tipo de consumidor aguas abajo. No hay datos publicados que permitan comparar cifras entre estas alternativas en igualdad de condiciones.

## Limitaciones y advertencias

- Rendimiento moderado: 26,4 % de mAP implica máscaras imprecisas y perdidas de instancia frecuentes; no es adecuado como único componente en un sistema critico sin revisión humana o un modelo de mayor precision.
- Métricas no verificadas (`verified: false`); el conjunto de evaluación no esta identificado ni su tamano documentado, por lo que la cifra no es directamente comparable con resultados publicos sobre el *val split* oficial de SceneParse150.
- La model card solo enumera 60 de las 150 clases; el resto del vocabulario no esta documentado en la información disponible, lo que complica el mapeo de salidas.
- Clases visualmente confundibles (wall/column/building, floor/earth/field, sidewalk/path/road, sea/water) generan errores sistematicos de clasificación en escenas ambiguas.
- Resolución de entrada fija de 432x432: los objetos pequenos (signboard, lamp, cushion, mirror) se degradan por reescalado en imágenes de alta resolución; conviene recortar o usar ventanas deslizantes.
- Sesgo de dominio: entrenado con 22.207 imágenes de escenas tipo ADE20K; el rendimiento caera en dominios alejados (imagen médica, satelital, industrial, documentos).
- La clase `person` existe en el vocabulario: no debe usarse para identificación biométrica ni vigilancia sin base legal; el modelo no reconoce identidades, solo región de persona.
- Riesgo de falsos positivos y alucinación de instancias en imágenes con texturas repetitivas o poca luz; no hay calibración de confianza publicada.
- Solo FP32: no hay pesos cuantizados oficiales, lo que limita despliegues en hardware muy restringido.
- El post-procesado es específico de la arquitectura; usar el ONNX en crudo sin el SDK exige reimplementar el decodificado de máscaras y cajas.
- Licencia BSD 3-Clause: permite uso comercial y modificación, pero obliga a conservar el aviso de copyright y la clausula de no endorsement; conviene revisar la atribucion a Pictograph en productos derivados.
- Sin soporte linguistico, de agentes ni de herramientas: no encaja en pipelines conversacionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pictograph/pictograph-sceneparse150-m
- Ficha en Pictograph (demo en navegador y API alojada): https://pictograph.io/models/pictograph-research/pictograph-sceneparse150-m
- Documentación del SDK de Pictograph: https://pictograph.io/docs
- Guía de inferencia local: https://pictograph.io/docs/local-inference
- Licencia BSD 3-Clause: https://opensource.org/license/bsd-3-clause
- Modelo base declarado: https://huggingface.co/roboflow/rf-detr-base
- Alternativa comparable (SegFormer fine-tuned en scene_parse_150): https://huggingface.co/aisuko/ft-segformer-with-sceneparse150
- Devkit MIT SceneParse150: https://github.com/CSAILVision/sceneparsing
- Dataset scene_parse150 en TensorFlow Datasets: https://www.tensorflow.org/datasets/catalog/scene_parse150
- Sitio del benchmark MIT Scene Parsing: http://sceneparsing.csail.mit.edu/sceneparsing/README.md
