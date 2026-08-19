# G-G-Games/diecamera-models

## Resumen

dieCamera dice readers es un conjunto de cuatro modelos ONNX de visión por computador desarrollados por G-G-Games para leer dados poliédricos físicos (d4, d6, d8, d10, d12, d20) a partir de un fotograma de webcam. El sistema resuelve dos tareas: detectar qué dados hay sobre la mesa y determinar el valor de la cara superior de cada uno. Está diseñado como el lector local de la aplicación de código abierto dieCamera, que permite registrar tiradas de dados en juegos de rol de mesa (TTRPG) sin necesidad de introducir los resultados manualmente.

El paquete incluye cuatro modelos con arquitecturas distintas: dos detectores basados en YOLOv8 (uno para localizar y clasificar el tipo de dado, otro para localizar el glifo numérico), un clasificador ConvNeXt de 21 clases para leer el numeral, y un clasificador YOLOv8-cls de 60 clases que lee el recorte del dado completo. Los modelos se ejecutan en CPU o en cualquier GPU compatible con DirectX 12 (DirectML) en aproximadamente 50-100 ms por fotograma, y están entrenados sobre el dataset propio G-G-Games/diecamera-dice. El repositorio tiene un tamaño de 0,5 GB y se distribuye bajo licencia AGPL-3.0.

La relevancia de este proyecto radica en que ofrece una alternativa local y sin conexión a los servicios de visión en la nube para una tarea muy específica del nicho de los juegos de mesa. Su diseño modular permite elegir entre un pipeline de tres pasos (más preciso en teoría) y uno de dos pasos (más rápido y ligero), con una precisión reportada que los autores presentan con honestidad, incluyendo sus limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8 (dice-shape, dice-value-glyph, dice-value-cls) y ConvNeXt (dice-value) |
| Parametros totales | no disponible (tamaños de archivo: 43 MB, 43 MB, 106 MB, 20 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (formato ONNX, precision no especificada) |
| Idiomas soportados | no disponible (modelo de vision, no procesa texto) |
| Licencia | AGPL-3.0 (con opcion de licencia comercial separada) |
| Formato de pesos | ONNX (con archivos .classes.json asociados) |

## Arquitectura y entrenamiento

El sistema se compone de cuatro modelos independientes que pueden combinarse en dos pipelines. El primer modelo, `dice-shape.onnx`, es un detector YOLOv8 que localiza cada dado en el fotograma y clasifica su tipo (d4, d6, d8, d10, d12, d20, etc.). A partir de ahí, el pipeline de tres pasos utiliza `dice-value-glyph.onnx` (otro detector YOLOv8) para encontrar el numeral de la cara superior y `dice-value.onnx` (un clasificador ConvNeXt de 21 clases, "0" a "20") para leer ese numeral. El pipeline de dos pasos, más ligero, usa `dice-value-cls.onnx`, un clasificador YOLOv8-cls de 60 clases que clasifica directamente el recorte del dado completo como una combinación (tipo, valor).

Todos los modelos fueron entrenados sobre el dataset G-G-Games/diecamera-dice, que contiene fotogramas capturados con varias webcams sobre una bandeja pequeña. No se especifican el número de imágenes, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO (no aplicables a visión). La innovación técnica más destacable es el sistema de "gating" en el pipeline de tres pasos: el argmax del clasificador se restringe al rango legal de valores para cada tipo de dado, de modo que un d8 nunca puede devolver un "15". Además, la confianza devuelta es un softmax calculado solo sobre las clases dentro de ese rango. El recorte del glifo debe seguir una receta exacta (caja del detector con margen de 0,1, redimensionado a 224×224 y normalización ImageNet) para evitar un cambio de dominio que, según los autores, llegó a degradar la precisión de un modelo del 97% al 17,5% en el rig real.

## Capacidades

- Detección y clasificación de dados poliédricos físicos (d4, d6, d8, d10, d12, d20) en fotogramas de webcam.
- Lectura del valor de la cara superior de cada dado mediante dos pipelines alternativos: tres pasos (detección de glifo + clasificación) o dos pasos (clasificación directa del recorte).
- Ejecución local sin conexión, en CPU o GPU con DirectML (DirectX 12), con una latencia de 50-100 ms por fotograma.
- Salida estructurada con archivos `.classes.json` que definen el orden de las clases, imprescindible para interpretar los índices de salida.
- Gating por rango legal: impide resultados imposibles para cada tipo de dado (p. ej., un "15" en un d8).
- Dos modos de uso: pipeline de tres pasos (más preciso en teoría) y pipeline de dos pasos (un quinto del tamaño y una llamada al modelo menos).
- No soporta tool calling, agentes, ni procesamiento de texto; es exclusivamente un sistema de visión para un dominio muy concreto.

## Casos de uso

- Registro automático de tiradas en juegos de rol de mesa: el jugador coloca los dados sobre una bandeja, la webcam captura el fotograma y el sistema devuelve los valores, que se integran en la aplicación dieCamera para llevar el registro de la partida.
- Accesibilidad para personas con movilidad reducida: permite anotar resultados sin necesidad de escribir manualmente, usando solo la cámara y un asistente que confirma visualmente cada lectura.
- Transmisión en vivo de partidas de rol: el sistema puede superponer los valores de los dados sobre el vídeo en tiempo real, mejorando la experiencia de los espectadores sin requerir hardware adicional.
- Automatización de pruebas de dados en producción de juegos de mesa: un fabricante podría usar el sistema para verificar que los dados impresos tienen los valores correctos en cada cara, aunque la precisión actual limita su uso a entornos controlados.
- Herramienta educativa para enseñar probabilidad: los estudiantes lanzan dados y el sistema registra los resultados automáticamente, permitiendo recopilar grandes muestras para análisis estadístico.
- Integración en asistentes de mesa virtuales: combinado con un proyector o una pantalla, el sistema puede mostrar los resultados de los dados en una interfaz digital, sincronizando el mundo físico con el digital.

## Benchmarks y rendimiento

Los autores reportan los siguientes resultados, medidos sobre sus propios conjuntos de validación:

| Modelo / pipeline | Metrica | Resultado |
|---|---|---|
| dice-shape (v2) | mAP50 (validación de tres dominios) | 0.886 |
| dice-value (tres pasos) | Precisión por tipo (cross-validada) | d8: 0.88, d10: 0.72, d12: 0.75, d20: 0.55 |
| dice-value-cls (dos pasos) | Top-1 en crops held-out | 0.411 |
| Detección de tipo (ambos pipelines) | Precisión en los mismos fotogramas | 0.961 |

Comparativa head-to-head sobre fotogramas idénticos del corpus de entrenamiento:

| Frames | Tres pasos | Dos pasos |
|---|---|---|
| Corpus completo (563 dados) | 0.490 | 0.480 |
| 30 frames nuevos, 5MP (113 dados) | 0.575 | 0.699 |

Los autores advierten explícitamente que esta tabla no debe leerse como un veredicto: los splits de entrenamiento no se registraron, el modelo de dos pasos fue reentrenado después de la mayoría de los frames nuevos, y no existe un holdout limpio compartido. Los números por autor son considerados mejor evidencia que las mediciones posteriores.

## Requisitos de hardware

- Los modelos son pequeños (20-106 MB en formato ONNX), por lo que caben en cualquier GPU moderna con al menos 1 GB de VRAM, aunque no se especifica oficialmente el consumo de VRAM.
- Se ejecutan en CPU sin necesidad de GPU, con una latencia de 50-100 ms por fotograma según los autores.
- Compatibles con cualquier GPU que soporte DirectX 12 (DirectML), incluyendo GPUs integradas de Intel y AMD, así como tarjetas NVIDIA.
- No se requieren GPUs de gama alta; una GPU de consumo como una RTX 3060 o incluso una iGPU moderna es suficiente.
- Opciones de despliegue: el código de referencia está implementado en TypeScript en el repositorio de dieCamera (src/readers/local/), y los modelos se pueden cargar con onnxruntime en Python o en cualquier runtime ONNX.
- No se proporcionan datos de throughput o latencia más allá del rango de 50-100 ms por frame.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de lectura de dados poliédricos en el ecosistema open source. Los modelos YOLOv8 genéricos de detección de objetos no están especializados en esta tarea, y no se han encontrado alternativas específicas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Modelos especializados en un rig concreto: fueron entrenados con un puñado de webcams sobre una bandeja pequeña, y la precisión cae bruscamente con iluminación, fondos o dados diferentes. El mejor predictor de éxito es el número de píxeles por cara: el rig de referencia lee bien a ~270 px de ancho de dado y mal a ~140 px.
- Fallo conocido: la distinción entre 6 y 9 en un d10 es ambigua en muchos dados reales y no es completamente resoluble solo con píxeles.
- No aptos para uso autónomo: la aplicación consumidora (dieCamera) siempre muestra la cara detectada a un humano antes de registrar el valor. Los modelos están optimizados para una predicción rápida y corregible, no para decisiones automáticas.
- Riesgo de alucinación en la clasificación: aunque el gating por rango legal evita valores imposibles, la precisión por tipo es baja (p. ej., 0.55 en d20), lo que implica errores frecuentes en la lectura del valor.
- Licencia AGPL-3.0: cualquier uso, modificación o redistribución, incluyendo servicios alojados o accesibles por red, obliga a publicar el código fuente de la obra derivada bajo la misma licencia. Existe una licencia comercial separada para uso cerrado, pero requiere contacto con G-G-Games.
- Sin soporte multilingüe ni de texto: el modelo es exclusivamente de visión y no procesa lenguaje natural.
- Dependencia de la receta de preprocesado: el recorte del glifo debe seguir exactamente la especificación (margen de 0,1, redimensionado a 224×224, normalización ImageNet); cualquier desviación reintroduce un cambio de dominio que puede degradar drásticamente la precisión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/G-G-Games/diecamera-models
- Dataset de entrenamiento: https://huggingface.co/datasets/G-G-Games/diecamera-dice
- Repositorio de la aplicación dieCamera: https://github.com/eschatus/diecamera
- Código del lector local (pipeline completo): https://github.com/eschatus/diecamera/tree/main/src/readers/local
- Contribución de Triveni Gandhi (PR #6): https://github.com/eschatus/diecamera/pull/6
