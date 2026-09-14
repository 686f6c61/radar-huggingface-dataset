# BiernyVR/car-damage-classifier

## Resumen

El modelo `BiernyVR/car-damage-classifier` es un clasificador de imágenes basado en una red EfficientNetV2-M ajustada finamente (*fine-tuning*) para la evaluación automática de daños en vehículos dentro de flujos de trabajo de seguros de automoción. Lo desarrolla el usuario BiernyVR y se publica bajo licencia MIT, con pesos disponibles tanto en PyTorch como en ONNX.

El modelo resuelve un problema concreto del sector asegurador y de los talleres: dada una fotografía de un vehículo siniestrado, asigna una de siete categorías de daño (desde `glass_damage` o `tire_damage`, considerados menores, hasta `total_loss` o `flood_damage`) y devuelve un intervalo de coste de reparación estimado en zlotys polacos (PLN). Es, por tanto, una herramienta de preevaluación de siniestros, no un modelo generativo ni un modelo de lenguaje.

La relevancia actual del modelo radica en su doble formato de despliegue (`.pth` para PyTorch y `.onnx` + `.onnx.data` para ONNX Runtime, TensorRT o C++) y en su tamaño contenido, que permite inferencia en CPU y en GPU de gama de consumo. Sin embargo, sus métricas declaradas (exactitud del 100 % y Macro F1 de 1.000 sobre 420 muestras) deben interpretarse con cautela, ya que no están verificadas y no se documenta la composición completa del conjunto de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-M (red neuronal convolucional con *compound scaling* y bloques Fused-MBConv/MBConv) |
| Parametros totales | no disponible en la model card (el EfficientNetV2-M de referencia ronda los 54 M de parametros, dato no confirmado por el autor) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de clasificacion de imagenes; entrada de 224 x 224 px en RGB) |
| Tipos de cuantizacion | no disponible (los pesos distribuidos estan en fp32: `.pth` y `.onnx`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; las clases y los metadatos estan en ingles, y los costes se expresan en PLN) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pth`) y ONNX (`.onnx` + `.onnx.data`); metadatos en JSON (`damage_metadata.json`) |
| Tarea (*pipeline*) | Clasificacion de imagenes (*image-classification*) |
| Numero de clases | 7 |
| Entrada | Imagen RGB redimensionada a 224 x 224, normalizada con media `[0.485, 0.456, 0.406]` y desviacion `[0.229, 0.224, 0.225]` |
| Tamano del repositorio | 0,4 GB |
| Descargas / *likes* | 0 / 0 |
| Fecha de publicacion | 14 de septiembre de 2026 (ultima actualizacion el mismo dia) |

## Arquitectura y entrenamiento

La arquitectura es una EfficientNetV2-M, variante de la familia EfficientNetV2 que combina bloques Fused-MBConv en las primeras etapas y MBConv con *squeeze-and-excitation* en las profundas, junto con un escalado compuesto de profundidad, anchura y resolucion. El modelo parte de un *backbone* preentrenado y se ajusta finamente como clasificador de 7 clases, con una capa de salida que produce *logits* sobre las categorias de dano. La model card no especifica el numero de tokens o imagenes de entrenamiento, la composicion del dataset, las tecnicas de aumento de datos, la funcion de perdida, el numero de epocas ni la estrategia de optimizacion empleada.

La innovacion practica del modelo no esta en la arquitectura, sino en el posprocesado de negocio: la clase predicha se mapea, mediante `damage_metadata.json`, a un intervalo de coste de reparacion historico en PLN (por ejemplo, `glass_damage` entre 300 y 3 000 PLN, `severe_damage` entre 10 000 y 30 000 PLN, `total_loss` por encima de 50 000 PLN). No se documenta el uso de RLHF, DPO ni tecnicas de alineacion, que ademas no aplican a un clasificador discriminativo. La evaluacion declarada se realizo sobre 420 muestras balanceadas, con una matriz de confusion y una matriz de coste de negocio incluidas en el repositorio como imagenes.

## Capacidades

- Clasificacion de danos en vehiculos en 7 categorias: `glass_damage`, `tire_damage`, `minor_dent`, `moderate_damage`, `severe_damage`, `flood_damage` y `total_loss`.
- Estimacion de un intervalo de coste de reparacion en PLN asociado a cada clase predicha.
- Inferencia mediante PyTorch con los pesos `.pth`.
- Inferencia mediante ONNX Runtime con el modelo `.onnx`, valida para CPU, TensorRT, C++ y despliegue en *edge*.
- Script de linea de comandos (`infer.py`) con soporte de `--topk` para obtener las k clases mas probables.
- Salida de probabilidades normalizadas (softmax aplicado manualmente en el ejemplo de inferencia) y de la clase ganadora.
- Entrada limitada a una imagen RGB de 224 x 224 por inferencia.
- No soporta *tool calling* ni *function calling*.
- No soporta agentes ni razonamiento multi-paso.
- No genera texto ni dispone de modo de razonamiento (*thinking mode*).
- No procesa audio, video ni texto; es exclusivamente vision por computador.
- Capacidades multilingues: no aplica (no es un modelo de lenguaje).

## Casos de uso

- Preevaluacion de siniestros en aseguradoras: el modelo clasifica la fotografia enviada por el asegurado y devuelve un rango de coste en PLN, lo que permite al gestor priorizar expedientes y decidir si requiere peritaje presencial antes de abrir el caso.
- Triaje en aplicaciones moviles de declaracion de siniestros: el asegurado fotografia el vehiculo, la app llama al modelo ONNX (o al backend) y muestra una estimacion orientativa inmediata, reduciendo el tiempo de primera respuesta.
- Recepcion de vehiculos en talleres de chapa y pintura: el taller clasifica el dano al recibir el coche y obtiene un intervalo de coste que sirve como presupuesto preliminar antes de la inspeccion manual.
- Gestion de flotas y *renting*: clasificacion automatica del estado del vehiculo en la devolucion, comparando la severidad detectada con la declarada para facturar reparaciones de forma objetiva.
- Subastas y tasacion de vehiculos siniestrados: la categoria `total_loss` o `flood_damage` permite separar automaticamente los lotes con dano estructural o por inmersion, que requieren un circuito de venta distinto.
- Deteccion de incoherencias en partes: si un vehiculo declara un dano `minor_dent` pero el modelo clasifica `severe_damage` de forma consistente en varias imagenes, el flujo puede marcar el expediente para revision antifraude.
- Priorizacion de asistencia en carretera: la clasificacion de severidad ayuda a decidir si se envia grua o si el vehiculo puede circular, en funcion de si el dano es de cristal, neumatico o estructural.
- Despliegue en *edge* en dispositivos de inspeccion: el modelo ONNX se ejecuta con ONNX Runtime o TensorRT en hardware modesto, sin necesidad de GPU de centro de datos ni de conectividad permanente.

## Benchmarks y rendimiento

Datos declarados por el autor en la *model card* y en el `model-index` (ninguno de ellos verificado de forma independiente):

| Metrica | Valor | Conjunto de evaluacion | Verificado |
|---|---|---|---|
| Exactitud global (*Overall Accuracy*) | 1,000 (100 %) | Vehicle Damage Benchmark, 420 muestras balanceadas | no |
| Macro F1 | 1,000 | Vehicle Damage Benchmark | no |
| Weighted F1 | 1,000 | Vehicle Damage Benchmark | no |
| Coste de negocio por mala clasificacion | 0,00 PLN | Conjunto de test | no |

No se han publicado resultados comparativos con otros modelos sobre el mismo conjunto, ni informacion sobre intervalos de confianza, validacion cruzada o un *split* de test independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 2 GB en fp32 con tamano de lote 1; aproximadamente 1 GB o menos con lotes pequenos. Es una estimacion derivada del tamano del repositorio (0,4 GB), no una cifra publicada por el autor.
- GPU recomendadas: cualquier GPU de consumo moderna es suficiente (GTX 1650, RTX 3060, RTX 4090). Tambien funciona en GPUs de centro de datos (T4, L4, A100, H100), aunque sobredimensionadas para esta carga.
- Compatibilidad con GPU de consumo: si, en practicamente todas las GPU con al menos 2 GB de VRAM; tambien es viable en CPU.
- CPU: la inferencia con ONNX Runtime sobre CPU es una opcion realista dado el tamano del modelo; no se publican cifras de latencia.
- Opciones de despliegue: ONNX Runtime (`CPUExecutionProvider`, `CUDAExecutionProvider`, `TensorrtExecutionProvider`), TensorRT, PyTorch nativo, exportacion a C++ y script CLI propio (`infer.py`).
- Opciones no aplicables: vLLM, TGI, llama.cpp, Ollama y cualquier *serving* orientado a modelos de lenguaje, ya que no es un modelo generativo de texto.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo por imagen ni de imagenes por segundo.
- Almacenamiento: aproximadamente 0,4 GB para el repositorio completo (pesos PyTorch, modelo ONNX y graficos de evaluacion).

## Comparativa con modelos similares

No se dispone de resultados publicados de otros modelos sobre el mismo conjunto de datos (Vehicle Damage Benchmark), por lo que la comparacion se realiza a nivel de arquitectura y de idoneidad general para clasificacion de imagenes. Los datos de rendimiento en la tarea especifica de danos de vehiculo figuran como "no disponible" para todos los casos.

| Modelo | Parametros (referencia) | Entrada | Licencia | Rendimiento en la tarea | Disponibilidad |
|---|---|---|---|---|---|
| car-damage-classifier (EfficientNetV2-M ajustado) | no disponible en la model card (~54 M en la variante de referencia) | 224 x 224 RGB | MIT | 100 % de exactitud declarada, no verificada | Pesos en PyTorch y ONNX en HuggingFace |
| EfficientNetV2-S (sin ajustar) | ~21,5 M | 224-384 px | Apache 2.0 (implementacion de referencia) | no disponible | Requiere ajuste propio |
| EfficientNetV2-L (sin ajustar) | ~118,5 M | 384 px | Apache 2.0 (implementacion de referencia) | no disponible | Requiere ajuste propio |
| ResNet-50 (sin ajustar) | ~25,6 M | 224 px | BSD-3 / Apache 2.0 segun implementacion | no disponible | Muy extendido, requiere ajuste |
| ViT-B/16 (sin ajustar) | ~86 M | 224 px | Apache 2.0 (implementacion de referencia) | no disponible | Requiere ajuste y mas datos |

## Limitaciones y advertencias

- Las metricas declaradas (100 % de exactitud, Macro F1 de 1,000, coste de negocio de 0,00 PLN) proceden de un unico conjunto de 420 muestras balanceadas y figuran como no verificadas. Un resultado perfecto en un conjunto tan reducido es indicio habitual de fuga de datos, sobreajuste o de un test poco representativo.
- No se documenta la composicion del dataset de entrenamiento: ni numero de imagenes, ni procedencia, ni distribucion por marca, modelo, ano, pais, condiciones de iluminacion o tipo de camara. Esto impide evaluar sesgos geograficos o de dominio.
- El modelo emite una unica etiqueta global por imagen; no localiza el dano (no hay *bounding boxes* ni segmentacion), lo que limita su uso cuando hay varios danos simultaneos en una misma fotografia.
- Los intervalos de coste estan expresados en zlotys polacos y vinculados al mercado asegurador polaco; no son extrapolables a otros paises sin recalibracion con datos locales.
- Riesgo de clasificaciones erroneas con alta confianza: no se publica informacion sobre calibracion de probabilidades ni sobre el comportamiento del modelo ante imagenes fuera de distribucion.
- Uso en decisiones automatizadas: dado que la salida influye en valoraciones economicas, se recomienda tratar la prediccion como senal de triaje y no como sustituto del peritaje humano.
- Adopcion nula: 0 descargas y 0 *likes* en el momento de la consulta, sin evidencia de uso en produccion por terceros ni de revision independiente.
- Soporte limitado: el autor no documenta versionado, mantenimiento ni canal de incidencias.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, pero se ofrece sin garantia alguna; la responsabilidad legal por decisiones basadas en sus predicciones recae en el integrador.
- No aplica el concepto de alucinacion tal como se entiende en modelos generativos, pero si el de falsos positivos con confianza elevada, especialmente en clases poco representadas en la practica.
- No se especifican requisitos de idioma ni soporte multilingue, ya que la salida son etiquetas de clase en ingles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BiernyVR/car-damage-classifier
- Repositorio del autor (mismo enlace, contiene `infer.py`, `damage_metadata.json` y los graficos de evaluacion): https://huggingface.co/BiernyVR/car-damage-classifier/tree/main
- Resultados de la busqueda web: no se han encontrado enlaces relevantes. Las consultas realizadas devolvieron exclusivamente paginas sobre talasemia (DocCheck Flexikon y Wikipedia), sin ninguna relacion con el modelo ni con la clasificacion de danos en vehiculos, por lo que se descartan como fuentes.
