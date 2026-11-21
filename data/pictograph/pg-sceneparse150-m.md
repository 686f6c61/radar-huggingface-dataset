# pictograph/pg-sceneparse150-m

## Resumen

PG-SceneParse150-M es un modelo de segmentación de instancias para imágenes desarrollado por Pictograph Research. Se trata de un ajuste fino (finetune) del modelo RF-DETR Seg Medium de Roboflow sobre el conjunto de datos ADE-20K, orientado a la segmentación semántica de escenas con 150 clases (pared, edificio, cielo, suelo, árbol, persona, coche, etc.). El resultado es un modelo especializado en el parseo de escenas interiores y exteriores, distribuido en formato ONNX con precisión FP32 y una resolución de entrada de 432x432 píxeles.

El modelo resuelve la tarea de identificar y delimitar instancias de objetos en escenas complejas, devolviendo máscaras poligonales y cajas delimitadoras por instancia. Su relevancia radica en que combina una arquitectura transformer de detección en tiempo real (RF-DETR) con un vocabulario amplio de 150 clases de ADE-20K, lo que permite cubrir tanto entornos arquitectónicos como naturales con un único modelo. Está pensado para integrarse en pipelines de visión por computador mediante el SDK de Pictograph o directamente con ONNX Runtime.

Con 26,4 % de mAP y 41,4 % de mAP@50 sobre ADE-20K, el modelo se posiciona como una opción práctica para tareas de segmentación de escenas donde el equilibrio entre cobertura de clases y coste computacional es prioritario. La licencia BSD 3-Clause y el formato ONNX facilitan su despliegue comercial y su ejecución en CPU o GPU sin dependencias de frameworks de deep learning pesados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR Seg Medium (transformer de detección en tiempo real con cabeza de segmentación) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en FP32) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | BSD 3-Clause |
| Formato de pesos | ONNX (`pictograph-sceneparse150-m.onnx`) + `config.json` |

## Arquitectura y entrenamiento

PG-SceneParse150-M se basa en RF-DETR Seg Medium, una arquitectura transformer de detección de objetos en tiempo real (Real-Time Detection Transformer) extendida con una cabeza de segmentación de instancias. El modelo procesa imágenes de entrada de 432x432 píxeles en formato NCHW float32 y produce máscaras poligonales y cajas delimitadoras por instancia. Los pesos se distribuyen como un único archivo ONNX en FP32, lo que permite su ejecución con ONNX Runtime sin necesidad de PyTorch.

El ajuste fino se realizó sobre el conjunto de datos ADE-20K, compuesto por 22.207 imágenes, durante 12 épocas con un tamaño de lote de 4 y una tasa de aprendizaje de 0,0002. El modelo cubre 150 clases de escena, de las cuales la model card documenta las 60 primeras (pared, edificio, cielo, suelo, árbol, techo, carretera, cama, ventana, hierba, armario, acera, persona, tierra, puerta, mesa, montaña, planta, cortina, silla, coche, agua, cuadro, sofá, estante, casa, mar, espejo, alfombra, campo, sillón, asiento, valla, escritorio, roca, armario ropero, lámpara, bañera, barandilla, cojín, base, caja, columna, cartel, cómoda, mostrador, arena, fregadero, rascacielos, chimenea, nevera, grada, camino, escaleras, pista, vitrina, mesa de billar, almohada, puerta mosquitera y escalera). No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal, ni detalles sobre el dataset de preentrenamiento original de RF-DETR.

## Capacidades

- Segmentación de instancias en imágenes: genera máscaras poligonales y cajas delimitadoras para cada instancia detectada, con puntuación de confianza asociada.
- Clasificación en 150 clases de escena: cubre categorías arquitectónicas (pared, ventana, puerta, escaleras), naturales (cielo, árbol, montaña, agua, mar, arena, roca) y de mobiliario urbano e interior (mesa, silla, sofá, coche, persona, lámpara).
- Procesamiento de imágenes en resolución fija de 432x432 píxeles en formato NCHW float32.
- Ejecución mediante ONNX Runtime, tanto en CPU (`CPUExecutionProvider`) como en GPU (proveedores CUDA/TensorRT de ONNX Runtime, aunque no se documentan explícitamente).
- Integración con el SDK de Pictograph, que aplica el preprocesamiento y postprocesamiento exactos del modelo y devuelve un objeto `InstanceSegmentationResult` con polígonos, cajas y confianzas.
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multilingüismo, al ser un modelo puramente visual.

## Casos de uso

- **Parseo de escenas interiores para realidad aumentada**: el modelo identifica paredes, suelos, techos, muebles y objetos (sofá, mesa, silla, lámpara) en imágenes de habitaciones, lo que permite anclar elementos virtuales sobre superficies reales. Su resolución de 432x432 y su formato ONNX lo hacen adecuado para ejecución en dispositivos con recursos limitados.
- **Análisis de imágenes de arquitectura y construcción**: la detección de clases como edificio, ventana, puerta, columna, escaleras y rascacielos permite automatizar la catalogación de elementos arquitectónicos en inspecciones visuales o inventarios de patrimonio.
- **Segmentación de escenas urbanas para conducción asistida**: las clases coche, carretera, acera, persona, valla y cartel permiten construir mapas de ocupación y detectar obstáculos en imágenes de cámaras vehiculares, aprovechando la velocidad de la arquitectura RF-DETR.
- **Etiquetado asistido de datasets de visión**: el modelo puede generar máscaras preliminares sobre imágenes nuevas para que anotadores humanos las revisen y corrijan, reduciendo el coste de creación de datasets de segmentación con las 150 clases de ADE-20K.
- **Moderación y análisis de contenido visual**: la detección de personas, interiores, exteriores y objetos permite clasificar y filtrar imágenes en plataformas de contenido, por ejemplo para identificar escenas con personas o entornos domésticos.
- **Automatización de inventarios de mobiliario**: en imágenes de oficinas o viviendas, el modelo detecta sillas, mesas, armarios, estanterías y cómodas, lo que facilita la generación de inventarios a partir de fotografías.
- **Procesamiento de imágenes satelitales o aéreas de paisajes**: las clases campo, camino, tierra, montaña, agua, mar y arena permiten segmentar entornos naturales en estudios medioambientales o agrícolas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre el conjunto ADE-20K (no verificados de forma independiente):

| Metrica | Valor |
|---|---:|
| mAP | 26,4 % (0,2639) |
| mAP@50 | 41,4 % (0,4141) |

No se han publicado en la información disponible resultados comparativos con otros modelos sobre el mismo conjunto de datos, ni métricas adicionales como mAP@75, precisión, recall o latencia.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible en la información proporcionada. Al tratarse de un modelo de tamaño "medium" en FP32 con entrada de 432x432, la huella es moderada, pero no se especifica el número exacto de parámetros ni el consumo de memoria.
- **GPU recomendadas**: no disponible. No se documentan GPU concretas (A100, H100, RTX 4090, etc.) ni requisitos mínimos.
- **Compatibilidad con GPU de consumo**: no confirmada explícitamente. El formato ONNX y el tamaño del repositorio (0,1 GB) sugieren que puede ejecutarse en GPU de consumo, pero no se aportan datos verificables.
- **Opciones de despliegue**: ONNX Runtime (CPU o GPU), SDK de Pictograph (`pip install "pictograph[inference]"`), API alojada de Pictograph y endpoints desplegables desde la plataforma Pictograph. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de visión.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento de modelos comparables (por ejemplo, otras variantes de RF-DETR Seg, Mask R-CNN o YOLOv8-seg) sobre ADE-20K. La siguiente tabla recoge únicamente los datos disponibles del modelo y deja el resto como no disponible:

| Modelo | Parametros | Contexto/entrada | mAP (ADE-20K) | Licencia | Formato |
|---|---|---|---|---|---|
| PG-SceneParse150-M | no disponible | 432x432 | 26,4 % | BSD 3-Clause | ONNX |
| RF-DETR Seg Medium (base) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de segmentación (Mask R-CNN, YOLOv8-seg) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Resolución de entrada fija**: el modelo espera imágenes de 432x432 píxeles; objetos pequeños o detalles finos pueden perderse tras el redimensionado, lo que afecta a la precisión en escenas con instancias de pequeño tamaño.
- **Cobertura de clases parcial en la documentación**: la model card solo detalla las 60 primeras de las 150 clases; el resto no está documentado en la información disponible, lo que dificulta conocer el vocabulario completo.
- **Rendimiento moderado**: un mAP de 26,4 % indica una precisión limitada en la localización y clasificación de instancias, insuficiente para aplicaciones críticas que requieran alta exactitud sin revisión humana.
- **Riesgo de alucinación visual**: como todo modelo de detección, puede generar máscaras o cajas espurias en regiones ambiguas o producir falsos positivos en clases visualmente similares.
- **Sesgos del dataset**: el modelo hereda los sesgos de ADE-20K en cuanto a geografía, iluminación, tipos de escena y distribución de clases; su rendimiento puede degradarse en dominios no representados (por ejemplo, imágenes médicas o industriales).
- **Sin capacidades lingüísticas ni de razonamiento**: no admite prompts en lenguaje natural, tool calling ni agentes; su uso está restringido a segmentación de imágenes.
- **Licencia BSD 3-Clause**: permite uso comercial y modificación, pero exige conservar el aviso de copyright y la cláusula de no respaldo; no se documentan restricciones adicionales.
- **Formato ONNX FP32**: no se ofrecen versiones cuantizadas (INT8, FP16) en la información disponible, lo que puede limitar el despliegue en dispositivos con restricciones de memoria.
- **Datos de benchmarks no verificados**: los resultados de mAP proceden del autor y no han sido validados de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pictograph/pg-sceneparse150-m
- Página del modelo en Pictograph: https://pictograph.io/models/pictograph-research/pictograph-sceneparse150-m
- Organización Pictograph Research: https://pictograph.io/org/pictograph-research
- Documentación del SDK y guía de inferencia local: https://pictograph.io/docs/local-inference
- Documentación general del SDK: https://pictograph.io/docs
- Dataset ADE-20K: https://huggingface.co/datasets/pictograph/ade-20k
- Modelo base RF-DETR Seg Medium: https://huggingface.co/Roboflow/rf-detr-seg-medium
- Licencia BSD 3-Clause: https://opensource.org/license/bsd-3-clause
- Paper de RF-DETR (arXiv:2511.09554): https://arxiv.org/abs/2511.09554
