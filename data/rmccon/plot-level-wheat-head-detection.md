# Rmccon/Plot-Level-Wheat-Head-Detection

## Resumen

Plot-Level-Wheat-Head-Detection es un conjunto de pesos de un modelo de visión por computador para detección de objetos, publicado por el usuario Rmccon en HuggingFace bajo licencia Apache 2.0. No es un modelo de lenguaje: su tarea es localizar y, presumiblemente, contar espigas de trigo (wheat heads) en imágenes, en el contexto del fenotipado de la fusariosis de la espiga (Fusarium Head Blight, FHB) a partir de fotografías tomadas con teléfono móvil.

Los pesos acompañan al manuscrito "An End-to-End Computer Vision Workflow for Fusarium Head Blight Phenotyping in Wheat Using Smartphone Images". La model card indica explícitamente que se recomienda la variante M5 por ser la de mayor rendimiento y robustez, lo que sugiere la existencia de varias variantes (M1–M5) dentro del repositorio, cuyo tamaño conjunto es de 0,7 GB. No se documentan en la información disponible ni la arquitectura concreta ni el conjunto de datos de entrenamiento.

El interés del modelo es práctico para fitomejoradores, fitopatólogos y grupos de agricultura de precisión que necesiten un detector de código abierto y ligero para cuantificar espigas en campo sin recurrir a plataformas de fenotipado especializadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision por computador, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |
| Tarea | Deteccion de objetos (espigas de trigo a nivel de parcela) |
| Variantes conocidas | M5 (recomendada por el autor); existencia de M1–M5 sugerida, sin detalle |
| Tamano del repositorio | 0,7 GB |
| Fecha de publicacion | 2026-09-28 (creacion); 2026-09-28 (ultima actualizacion) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo. Por la naturaleza de la tarea (detección de objetos en imágenes de móvil) y por la nomenclatura de variantes (M1–M5), es plausible que se trate de una familia de detectores entrenados con distintas configuraciones o resoluciones, pero esto no se confirma en la información proporcionada. Tampoco se detallan el número de parámetros, el backbone, la resolución de entrada ni si se emplearon técnicas como anchor-free heads, NMS o aumentos de datos específicos de dominio agrícola.

En cuanto al entrenamiento, solo se sabe que los pesos están asociados al manuscrito sobre fenotipado de FHB con imágenes de smartphone. Se desconoce el volumen de imágenes, la composición del dataset (localidades, variedades, estadios fenológicos, condiciones de iluminación), el régimen de anotación y si hubo validación cruzada entre parcelas. La recomendación de usar M5 sugiere un proceso de selección de modelo entre varias alternativas, presumiblemente evaluadas sobre un conjunto de validación del propio estudio, pero no se aportan métricas.

## Capacidades

- Detección de espigas de trigo en imágenes a nivel de parcela (plot-level), orientada a cuantificar la presencia de espigas en el cultivo.
- Procesamiento de imágenes capturadas con teléfono móvil, según el contexto del manuscrito asociado.
- Uso potencial para fenotipado de Fusarium Head Blight (FHB), aunque la detección de espigas es solo una parte del flujo; no se documenta que el modelo clasifique severidad de la enfermedad.
- No soporta generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa lenguaje).
- No se documentan capacidades multimodales adicionales (audio, vídeo, etc.).

## Casos de uso

- Fenotipado de FHB en campo: el detector localiza espigas en fotografías de móvil para que un pipeline posterior estime incidencia o severidad de la enfermedad en parcelas experimentales, reduciendo el tiempo de anotación manual.
- Estimación de densidad de espigas por parcela: contar espigas en imágenes cenitales u oblicuas permite aproximar el número de espigas por unidad de superficie, un rasgo relevante en ensayos de rendimiento.
- Seguimiento temporal de ensayos: aplicar el mismo modelo a imágenes capturadas en distintas fechas permite monitorizar el desarrollo del cultivo y comparar parcelas a lo largo de la campaña.
- Selección en programas de mejora: integrar el detector en el proceso de cribado de líneas o variedades, usando el recuento de espigas como variable auxiliar para priorizar material vegetal.
- Digitalización de cuadernos de campo: convertir fotografías tomadas por técnicos con smartphone en datos estructurados (número de espigas por imagen o por parcela) sin necesidad de instrumentación especializada.
- Aplicaciones móviles para agricultores y asesores: desplegar el modelo en el dispositivo o en servidor para ofrecer estimaciones rápidas de densidad de espigas a partir de una foto.
- Investigación reproducible: servir como punto de partida o baseline en estudios de visión por computador aplicada a cultivos, dado que los pesos son abiertos y la licencia Apache 2.0 lo permite.
- Integración en flujos de análisis con imágenes aéreas o de dron: aunque el manuscrito se centra en smartphone, la detección de espigas puede reutilizarse si el dominio visual es suficientemente similar, siempre que se valide antes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente afirma de forma cualitativa que la variante M5 mostró el rendimiento "más fuerte y robusto", sin cifras de mAP, precisión, recall, F1 ni comparaciones cuantitativas con otros detectores.

## Requisitos de hardware

- VRAM para inferencia: no disponible. Como referencia orientativa, un detector de objetos de este tipo suele ejecutarse con pocos GB de VRAM en FP16, pero no hay confirmación en la información proporcionada.
- GPU recomendadas: no disponible. No se especifica ningún requisito oficial.
- Ejecución en GPU de consumo: no confirmada. Dado el tamaño total del repositorio (0,7 GB, probablemente incluyendo varias variantes M1–M5), es plausible que cada variante individual quepa en GPU de gama media o incluso en CPU, pero es una estimación no verificada.
- Opciones de despliegue: no disponibles. Si los pesos están en formato PyTorch, las vías habituales serían PyTorch nativo, TorchScript, ONNX Runtime o TensorRT. Las herramientas orientadas a modelos de lenguaje (llama.cpp, Ollama, vLLM, TGI) no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos cuantitativos que permitan una comparativa rigurosa. Como categorías comparables podrían citarse los detectores entrenados sobre el Global Wheat Head Detection (GWHD) dataset y las familias de detectores genéricos (YOLO, Faster R-CNN, DETR) ajustadas a detección de espigas de trigo, pero no hay información en la documentación proporcionada sobre parámetros, contexto, licencia ni métricas de este modelo que permita confrontarlos.

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Plot-Level-Wheat-Head-Detection (M5) | no disponible | imagen (resolucion no disponible) | no disponible | Apache 2.0 | HuggingFace |
| Detectores GWHD | no disponible | no disponible | no disponible | variable | variable |
| YOLO ajustado a espigas | no disponible | no disponible | no disponible | variable (AGPL/otros) | variable |

## Limitaciones y advertencias

- No se documentan sesgos conocidos, pero un detector entrenado en localidades, variedades y condiciones de iluminación concretas puede degradarse en dominios distintos (otras variedades, estadios fenológicos, fondos o cámaras).
- Riesgo de falsos positivos y negativos en escenas con solapamiento de espigas, oclusión, viento o iluminación adversa; sin métricas publicadas no es posible cuantificarlo.
- El modelo detecta espigas; no está documentado que diagnostique FHB. Utilizarlo para estimar enfermedad requeriría un componente adicional de clasificación o regresión de severidad.
- No hay información sobre el idioma ni la localización de los datos de entrenamiento, aunque al tratarse de visión esto no afecta al texto.
- La licencia Apache 2.0 permite uso comercial y modificación, con obligación de conservar avisos de licencia y sin garantías.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que no existe validación independiente por parte de la comunidad.
- No se especifican pesos en formatos optimizados para despliegue (ONNX, TensorRT, TFLite), lo que puede añadir trabajo de conversión.
- Al ser material asociado a un manuscrito, conviene revisar el propio artículo para conocer protocolos de entrenamiento, métricas y limitaciones declaradas por los autores.

## Enlaces

- HuggingFace: https://huggingface.co/Rmccon/Plot-Level-Wheat-Head-Detection
- Manuscrito asociado: "An End-to-End Computer Vision Workflow for Fusarium Head Blight Phenotyping in Wheat Using Smartphone Images" (enlace no disponible en la información proporcionada)
- Repositorio de código: no disponible
- Demo: no disponible
