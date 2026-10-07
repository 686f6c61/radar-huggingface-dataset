# qualcomm/CenterNet-2D

## Resumen

CenterNet-2D es un modelo de detección de objetos que localiza instancias prediciendo el punto central de cada objeto, en lugar de generar un conjunto denso de anclas y aplicar supresión de no máximos. Qualcomm publica en su Hugging Face esta versión del modelo basada en la implementación de referencia de CenterNet del repositorio `xingyizhou/CenterNet`, correspondiente al artículo «Objects as Points» (arXiv:1904.07850), con el objetivo de ofrecer artefactos ya exportados y compilados para el hardware de la compañía.

El modelo no es un modelo generativo de lenguaje: es un detector 2D con `pipeline_tag: object-detection`, pensado para ejecutarse en la NPU Hexagon de plataformas Snapdragon y Dragonwing. Por ello, la ficha adapta los apartados habituales (contexto, idiomas, tool calling) a un modelo de visión, indicando explícitamente cuándo un parámetro no aplica o no está documentado.

Su relevancia actual reside en el formato de distribución: el repositorio incluye binarios precompilados con Qualcomm AI Engine Direct (QAIRT 2.50) en precisión float, listos para desplegar en chipsets concretos (Snapdragon 8 Elite Gen 5, Snapdragon 8 Elite, Snapdragon X2 Elite, Snapdragon X Elite, Snapdragon 8 Gen 3, Snapdragon 8 Gen 1, Dragonwing IQ-8275, Dragonwing QCS8550 e IQ-9075), tanto como ONNX con grafo QNN como en formato QNN context binary. La licencia es MIT y el repositorio ocupa 2,5 GB, tamaño que corresponde a la suma de todos los artefactos por chipset y no a los pesos de una única variante.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CenterNet (detección de objetos basada en puntos centrales); backbone concreto no especificado en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, no generativo; no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible; los artefactos publicados son de precisión float (no se documentan variantes int8/int4) |
| Idiomas soportados | no disponible (el modelo no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | ONNX con grafo QNN precompilado (PRECOMPILED_QNN_ONNX) y QNN context binary; exportación desde PyTorch mediante la librería qai_hub_models |
| Resolucion de entrada | no disponible en la información proporcionada |
| Clases detectadas | no disponible en la información proporcionada |
| Tamaño del repositorio | 2,5 GB (conjunto completo de artefactos por chipset) |
| Runtime objetivo | QAIRT 2.50, ONNX Runtime 1.30.0 |

## Arquitectura y entrenamiento

CenterNet aborda la detección como un problema de estimación de puntos clave: una red totalmente convolucional produce mapas de calor de centros, junto con regresiones de tamaño (ancho y alto) y de desplazamiento subpíxel. La decodificación consiste en extraer los máximos locales del mapa de calor, lo que elimina la necesidad de generación de propuestas y de supresión de no máximos, y simplifica el postprocesado en dispositivos con recursos limitados. La implementación de referencia sobre la que se basa este repositorio contempla habitualmente variantes con backbones ResNet-18/ResNet-101, DLA-34 y Hourglass-104, pero la model card de Qualcomm no especifica qué variante o backbone concreto se ha exportado, ni el número de parámetros resultante.

No se dispone de información sobre el conjunto de datos de entrenamiento, el número de tokens o imágenes utilizadas, ni sobre procesos de ajuste fino, RLHF o DPO en los materiales proporcionados. Qualcomm se limita a indicar que el modelo es una optimización de la implementación de CenterNet para sus dispositivos, y remite a la librería Qualcomm AI Hub Models (versión v0.64.0) para exportar con configuraciones personalizadas. La innovación destacable no está, por tanto, en la arquitectura, sino en el pipeline de despliegue: compilación y perfilado mediante Qualcomm AI Hub Workbench, y distribución de binarios específicos por chipset para QAIRT 2.50.

## Capacidades

- Detección de objetos 2D mediante predicción de puntos centrales, con salida de cajas delimitadoras por instancia.
- Inferencia en dispositivo (on-device) sobre la NPU Hexagon de plataformas Snapdragon y Dragonwing, sin necesidad de conectividad.
- Ejecución con los runtimes Qualcomm AI Engine Direct (QNN) y ONNX Runtime, según el artefacto elegido.
- Exportación reproducible desde PyTorch con la librería `qai_hub_models`, lo que permite recompilar para otras configuraciones.
- Perfilado y evaluación en hardware real a través de Qualcomm AI Hub Workbench.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo «thinking», ni entrada de audio, ni descripción de imágenes en lenguaje natural (no genera pies de foto ni responde a prompts).

## Casos de uso

- Detección de objetos en aplicaciones móviles Android: el modelo se distribuye con artefactos precompilados para Snapdragon 8 Gen 1, 8 Gen 3, 8 Elite y 8 Elite Gen 5, de modo que puede integrarse directamente en una app mediante QNN u ONNX Runtime sin recompilar.
- Visión para robótica y automatización industrial: sobre plataformas Dragonwing IQ-8275, IQ-9075 y QCS8550, el detector puede alimentar bucles de control que requieren localización de piezas o personas con latencia de borde, sin depender de la nube.
- Analítica de vídeo en el borde (retail, aforo, seguridad): al ejecutarse íntegramente en la NPU del dispositivo, permite procesar flujos de cámara localmente y reducir el coste de ancho de banda frente a soluciones que envían fotogramas a un servidor.
- Automoción y sistemas embebidos con requisitos de eficiencia energética: la compilación para QNN context binary busca minimizar el consumo de la NPU, un criterio habitual en unidades electrónicas alimentadas por batería o con presupuesto térmico ajustado.
- Preprocesado para pipelines de percepción más complejos: las cajas de salida pueden alimentar etapas posteriores (seguimiento multiobjeto, reconocimiento de matrículas, clasificación de recortes) ejecutadas en el mismo dispositivo o en un servidor.
- Prototipado e investigación en detección basada en puntos clave: al ser una exportación de la implementación de referencia de CenterNet con licencia MIT, sirve como punto de partida reproducible para comparar el enfoque anchor-free frente a detectores basados en anclas.
- Evaluación comparativa de aceleradores hardware: Qualcomm AI Hub Workbench permite perfilar el mismo modelo en distintos chipsets, lo que resulta útil para decidir la plataforma objetivo de un producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card menciona una sección de «performance summary» con métricas por dispositivo, pero su contenido no forma parte de los datos proporcionados, por lo que no se reproducen cifras de mAP, latencia ni throughput. Tampoco se dispone de resultados en conjuntos como COCO ni de comparaciones numéricas con otros detectores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card no indica el número de parámetros ni el tamaño de los pesos de una variante concreta; los 2,5 GB del repositorio corresponden al conjunto agregado de artefactos precompilados para nueve plataformas distintas.
- GPU recomendadas: no aplica en el escenario principal. El modelo está optimizado para la NPU Hexagon de Qualcomm mediante QAIRT 2.50, no para GPU de escritorio o de centro de datos.
- Chipsets soportados explícitamente: Snapdragon 8 Elite Gen 5 for Galaxy, Snapdragon 8 Elite for Galaxy, Snapdragon X2 Elite, Snapdragon X Elite, Snapdragon 8 Gen 3, Snapdragon 8 Gen 1, Dragonwing IQ-8275, Dragonwing QCS8550 (proxy) e IQ-9075.
- Compatibilidad con GPU de consumo (RTX 4090 y similares): no documentada. Al existir exportación a ONNX, técnicamente podría ejecutarse con ONNX Runtime en CPU o GPU, pero el rendimiento no está validado ni publicado en la información disponible.
- Opciones de despliegue: QNN context binary con QAIRT 2.50; ONNX con grafo QNN precompilado mediante ONNX Runtime 1.30.0; exportación personalizada con la librería `qai_hub_models`; perfilado en dispositivo alojado a través de Qualcomm AI Hub Workbench.
- Latencia y throughput estimados: no disponibles.
- Requisitos de SDK: QAIRT 2.50 y, para la ruta ONNX, ONNX Runtime 1.30.0.

## Comparativa con modelos similares

La información proporcionada no incluye métricas de precisión ni de latencia, por lo que no es posible establecer una comparación cuantitativa. La comparación siguiente es cualitativa y se limita a aspectos verificables de arquitectura, licencia y formato de distribución.

| Modelo | Enfoque | Licencia | Formato de despliegue | Optimización para NPU Qualcomm |
|---|---|---|---|---|
| CenterNet-2D (qualcomm) | Anchor-free, puntos centrales | MIT | ONNX+QNN, QNN context binary | Sí, artefactos por chipset |
| CenterNet original (xingyizhou) | Anchor-free, puntos centrales | MIT | PyTorch | No |
| Detectores basados en anclas (familia SSD) | Anchor-based con NMS | variable según implementación | PyTorch, ONNX, TFLite | No documentada en esta ficha |
| Detectores anchor-free tipo FCOS | Anchor-free por píxel | variable según implementación | PyTorch, ONNX | No documentada en esta ficha |

No se dispone de datos de parámetros, contexto ni rendimiento de los modelos comparados dentro de la información aportada, por lo que cualquier cifra adicional sería especulativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible. Al desconocerse el conjunto de entrenamiento, no es posible evaluar sesgos de representación por clase, tono de piel, género o contexto geográfico.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos propios de cualquier detector, especialmente en objetos pequeños, oclusiones y clases poco representadas.
- Limitaciones de contexto o idioma: no aplica; el modelo no procesa texto.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificación y redistribución con atribución y sin garantía. Conviene revisar igualmente los términos de uso de QAIRT y de Qualcomm AI Hub Workbench, que son productos distintos de los pesos del modelo.
- Dependencia de hardware: los artefactos precompilados son específicos por chipset y versión de QAIRT. Un binario compilado para Snapdragon 8 Gen 3 no es portable a otro SoC sin recompilar.
- Riesgo de obsolescencia de los binarios: al estar ligados a QAIRT 2.50 y ONNX Runtime 1.30.0, actualizaciones del SDK pueden requerir regenerar los artefactos.
- Ausencia de métricas publicadas: no se han facilitado cifras de precisión ni de latencia, por lo que no se recomienda desplegar en producción sin una validación propia sobre el conjunto de datos objetivo.
- Documentación incompleta en el repositorio: la model card no detalla backbone, resolución de entrada, número de clases ni composición del dataset de entrenamiento.
- Popularidad nula en el momento de la consulta (0 descargas y 0 «likes»), lo que implica ausencia de validación por parte de la comunidad y de informes de incidencias independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qualcomm/CenterNet-2D
- Implementación de referencia de CenterNet: https://github.com/xingyizhou/CenterNet
- Artículo «Objects as Points» (arXiv:1904.07850): https://arxiv.org/abs/1904.07850
- Librería Qualcomm AI Hub Models, módulo centernet_2d (v0.64.0): https://github.com/qualcomm/ai-hub-models/blob/v0.64.0/src/qai_hub_models/models/centernet_2d
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Registro en Qualcomm AI Hub: https://myaccount.qualcomm.com/signup
- Sitio corporativo de Qualcomm: https://www.qualcomm.com/
- Información corporativa de Qualcomm: https://www.qualcomm.com/company
