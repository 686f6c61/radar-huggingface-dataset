# nxp/mnasnet-a1-075-imx

## Resumen

nxp/mnasnet-a1-075-imx es un checkpoint de clasificación de imágenes publicado por NXP Semiconductors en Hugging Face. La nomenclatura remite a MnasNet-A1, la arquitectura convolucional móvil obtenida mediante búsqueda de arquitectura neuronal (NAS) con conciencia de plataforma que Google describió en 2019, con un multiplicador de anchura de 0,75 que reduce el coste de cómputo y de memoria a cambio de una merma de precisión. El sufijo `-imx` indica que la publicación está orientada a las plataformas de aplicaciones i.MX de NXP, muy extendidas en automoción, IoT industrial y electrónica de consumo.

La model card publicada es mínima: se limita a declarar la licencia Apache-2.0. No incluye pipeline declarado, idiomas, número de parámetros, métricas de evaluación ni detalles del procedimiento de entrenamiento o de la conversión a formatos de despliegue. El repositorio no registra descargas ni interacciones en el momento de redactar esta ficha, lo que sugiere una publicación institucional reciente y de carácter utilitario más que un lanzamiento orientado a la comunidad.

Su relevancia práctica está en el nicho de la inferencia en el borde: un clasificador de pocos millones de parámetros y resolución baja es candidato directo a ejecutarse en CPU, NPU o microNPU integradas en SoC de NXP, donde no hay margen para modelos de visión grandes. Quien necesite etiquetar imágenes en dispositivos con presupuesto térmico y energético ajustado encontrará aquí una pieza de partida, pero deberá verificar por su cuenta los detalles que la model card omite.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN móvil de la familia MnasNet (búsqueda de arquitectura neuronal); variante con multiplicador de anchura 0,75 según la nomenclatura del repositorio |
| Parámetros totales | no disponible (no se publica el recuento; aplicar el factor 0,75² sobre los 3,9 M de MnasNet-A1 daría un orden de magnitud de unos 2 M, pero es una inferencia no confirmada) |
| Parámetros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica (modelo de visión; la ventana de contexto no es un concepto pertinente) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (tarea de clasificación de imágenes; las etiquetas de ImageNet están en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (no se listan ficheros ni formatos en la información proporcionada) |
| Autor | nxp |
| Tarea | clasificación de imágenes (pipeline no declarado en el repositorio) |
| Número de clases | no disponible (1000 clases si sigue el estándar ImageNet, sin confirmar en la model card) |
| Resolución de entrada | no disponible (224x224 en la arquitectura original de la familia MnasNet) |
| Fecha de publicación | 1 de octubre de 2026 según los metadatos del repositorio |

## Arquitectura y entrenamiento

MnasNet se diseñó con un controlador recurrente entrenado por aprendizaje por refuerzo que propone bloques convolucionales dentro de un espacio de búsqueda jerárquico y factorizado. La función de recompensa es multiobjetivo: combina la precisión en ImageNet con la latencia real medida en un dispositivo móvil de referencia, de modo que la arquitectura resultante maximiza el rendimiento sujeto a una restricción de latencia. Los bloques usan convoluciones separables en profundidad con residuales invertidos y módulos de squeeze-and-excitation, un patrón heredado de MobileNetV2 y refinado en la búsqueda. La variante A1 es la de mayor precisión de la familia publicada.

El entrenamiento descrito en el artículo original se realizó sobre ImageNet (aproximadamente 1,2 millones de imágenes de entrenamiento y 1000 clases), con aumento de datos estándar y sin etapas de ajuste por retroalimentación humana, ya que se trata de un clasificador supervisado y no de un modelo generativo. No hay información en la model card sobre el dataset exacto, el número de épocas, el recetario de aumento de datos ni el proceso de conversión empleado para este checkpoint concreto, por lo que no puede confirmarse si se reentrenó, se destiló o simplemente se exportó a un formato compatible con las herramientas de NXP.

## Capacidades

- Clasificación de imágenes en un conjunto cerrado de categorías, presumiblemente las 1000 clases de ImageNet, aunque la model card no lo confirma.
- Extracción de características: al ser una CNN convolucional, puede usarse como backbone congelado para tareas posteriores de detección, segmentación o búsqueda por similitud visual.
- Inferencia de baja latencia en dispositivos sin GPU dedicada, que es el motivo por el que se publica bajo el identificador de la plataforma i.MX.
- No soporta generación de texto ni de imágenes.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni flujos de agente.
- No tiene capacidades multilingües ni de procesamiento de lenguaje natural.
- No dispone de modo de razonamiento explícito (thinking mode), visión-lenguaje, audio ni ninguna otra modalidad adicional.

## Casos de uso

- Control de calidad industrial en línea de producción: el modelo clasifica piezas o productos en categorías predefinidas directamente sobre la cámara y la NPU de un SoC i.MX, sin enviar imágenes a la nube, lo que reduce latencia y evita problemas de privacidad y de ancho de banda.
- Inspección visual en automoción: etiquetado de escenas, detección de presencia de objetos o verificación de estado de componentes en módulos empotrados dentro del vehículo, donde el presupuesto de cómputo y de consumo es muy restrictivo.
- Mantenimiento predictivo asistido por visión: clasificación de imágenes térmicas o de inspección de máquinaria para detectar patrones anómalos, usando el modelo como extractor de características sobre el que se entrena un clasificador específico.
- Puerta de enlace de IoT con filtrado en el borde: descarte local de imágenes irrelevantes antes de transmitirlas, de modo que solo se envían a la nube las que superan un umbral de confianza.
- Indexado y organización de fototecas en dispositivos de almacenamiento doméstico: clasificación automática por categorías visuales sin conexión a internet.
- Prototipado rápido de producto: validación de una idea de visión artificial con un modelo pequeño antes de invertir en un modelo mayor o en anotación masiva, gracias a su bajo coste de despliegue en hardware barato.
- Backbone para transferencia de aprendizaje en dominios con pocos datos: se congela el extractor y se entrena una cabeza ligera para clasificación binaria o de pocas clases en sectores como agricultura o reciclaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de nxp/mnasnet-a1-075-imx no incluye métricas de precisión, latencia, consumo ni comparaciones con otros modelos.

Como referencia externa, el artículo original de MnasNet reporta para la variante A1 sin reducción de anchura (multiplicador 1,0) unos 3,9 millones de parámetros, 312 millones de operaciones multiply-add y un 75,2 % de top-1 en ImageNet. Estas cifras corresponden a la arquitectura publicada en el paper, no a este checkpoint concreto, y no deben atribuirse al modelo de NXP.

## Requisitos de hardware

- VRAM estimada: muy inferior a 1 GB en cualquier precisión habitual. Con un orden de magnitud de 2 a 4 millones de parámetros, los pesos ocuparían aproximadamente entre 8 y 16 MB en FP32 y entre 2 y 4 MB en INT8, más el espacio de activaciones de una sola imagen.
- Cabe sin dificultad en cualquier GPU de consumo, incluidas integradas, e incluso se ejecuta en CPU moderna con latencia interactiva.
- GPU recomendadas: no requiere GPU dedicada. Para lotes grandes o despliegues de servidor, cualquier acelerador moderno (NVIDIA T4, L4, A100, H100, RTX 3060 o superior) está sobradamente dimensionado.
- Alternativas específicas de la plataforma objetivo: NPU de los SoC i.MX 8M Plus, microNPU Ethos-U65 de los i.MX 93 y herramientas del eIQ Toolkit de NXP, además de TensorFlow Lite / LiteRT y ONNX Runtime.
- Otras opciones de despliegue habituales para CNN pequeñas: OpenVINO, TensorRT, NCNN y TVM. Los servidores de inferencia para modelos generativos (vLLM, TGI) no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Las cifras de las tres alternativas proceden de sus artículos originales y se incluyen solo como referencia de categoría; no están verificadas para el checkpoint de NXP ni proceden de su model card.

| Modelo | Parámetros | Operaciones (MAdds) | Entrada / contexto | Top-1 ImageNet | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| nxp/mnasnet-a1-075-imx | no disponible | no disponible | no disponible | no disponible | Apache-2.0 | Hugging Face (0 descargas al redactar la ficha) |
| MnasNet-A1 (paper, multiplicador 1,0) | 3,9 M | 312 M | 224x224 | 75,2 % | Apache-2.0 en implementaciones de referencia | Repositorios públicos de TensorFlow y terceros |
| MobileNetV2 (multiplicador 1,0) | 3,4 M | 300 M | 224x224 | 72,0 % | Apache-2.0 | Amplia, con pesos preentrenados en varios frameworks |
| EfficientNet-B0 | 5,3 M | 390 M | 224x224 | 77,1 % | Apache-2.0 | Amplia, con pesos preentrenados en varios frameworks |

En igualdad de coste computacional, MnasNet-A1 supera a MobileNetV2 en precisión según los datos del paper, y EfficientNet-B0 ofrece mejor precisión a cambio de más parámetros y operaciones. La variante con multiplicador 0,75 de esta ficha se sitúa por debajo de todas ellas en coste, y presumiblemente también en precisión, aunque no hay cifras publicadas que lo confirmen.

## Limitaciones y advertencias

- Model card prácticamente vacía: no hay información sobre datos de entrenamiento, métricas, sesgos ni procedencia de los pesos, lo que dificulta cualquier evaluación de riesgos previa a producción.
- Al ser un clasificador de conjunto cerrado, no puede reconocer categorías fuera de su espacio de etiquetas y tiende a forzar una etiqueta conocida ante entradas ambiguas o fuera de distribución (falsos positivos silenciosos).
- Los modelos entrenados en ImageNet arrastran sesgos de representación de ese dataset: sobrerrepresentación de contextos occidentales, desequilibrios entre clases y sensibilidad a condiciones de iluminación y encuadre poco habituales.
- La reducción de anchura a 0,75 recorta capacidad y precisión frente a la variante completa, especialmente en clases visualmente próximas o con objetos pequeños en la imagen.
- No es un modelo de lenguaje: no soporta instrucciones, tool calling ni agentes, por lo que no debe integrarse en flujos conversacionales.
- Resolución de entrada limitada (presumiblemente 224x224), lo que penaliza la detección de detalles finos en imágenes de alta resolución sin un recorte previo.
- La licencia Apache-2.0 permite uso comercial y modificación, pero se recomienda verificar los términos de los pesos subyacentes y de las herramientas de conversión de NXP antes de distribuirlos en producto.
- No hay datos publicados de latencia, consumo energético ni precisión en las plataformas i.MX, que son precisamente el destino declarado del checkpoint; habrá que medirlos en el dispositivo objetivo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/nxp/mnasnet-a1-075-imx
- Artículo original de MnasNet: https://arxiv.org/abs/1807.11626
- NXP Semiconductors (sitio corporativo): https://www.nxp.com/
- Catálogo de productos de NXP: https://www.nxp.com/products:PCPRODCAT
- NXP Semiconductors en Wikipedia: https://en.wikipedia.org/wiki/NXP_Semiconductors
- NXP Semiconductors en Wikipedia (francés): https://fr.wikipedia.org/wiki/NXP_Semiconductors
