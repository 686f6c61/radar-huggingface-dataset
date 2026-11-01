# Qualzz20/afv_fiber_9um_v2

## Resumen

AFV fibre model V2 (identificador `Qualzz20/afv_fiber_9um_v2`) es un modelo de segmentación 3D desarrollado por Qualzz20 para detectar fibras de papiro en volúmenes de tomografía computarizada (CT) y estimar su orientación local. Distingue dos familias de fibras, horizontales (H) y verticales (V), y deriva del modelo previo `Qualzz20/afv_fiber_9um`, sobre el que aplica un ajuste fino. No es un modelo de lenguaje: es una red convolucional 3D orientada a imagen médica y patrimonial, concretamente al análisis de los rollos carbonizados de Herculano en el marco del Vesuvius Challenge.

La arquitectura es un nnU-Net con encoder residual, adaptado para recibir un único canal de entrada (CT en escala de grises) y producir múltiples cabezas de salida: segmentación de fibras en cuatro canales (fondo, vertical, horizontal, intersección), un vector de dirección tridimensional, un canal auxiliar de centros de fibra y seis canales de afinidades locales. El modelo está optimizado para volúmenes CT muestreados a aproximadamente 9 µm por vóxel, con entradas de entrenamiento en el rango de 8,64 a 9,6 µm.

Su relevancia es específica de nicho: permite reconstruir la estructura física de papiros carbonizados sin abrirlos, un paso crítico para la lectura virtual de textos clásicos perdidos. El repositorio ocupa 0,6 GB y se distribuye bajo licencia Apache 2.0, lo que facilita su reutilización en investigación. No hay información pública sobre benchmarks cuantitativos ni sobre el rendimiento comparado con otros segmentadores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | nnU-Net 3D con encoder residual y múltiples cabezas de salida |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión 3D, no de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 0,6 GB; presumiblemente pesos PyTorch, sin confirmar) |

## Arquitectura y entrenamiento

El modelo se basa en nnU-Net 3D con un encoder residual. Recibe un volumen CT de un solo canal en escala de grises y genera varias salidas simultáneas: cuatro logits de segmentación por vóxel (fondo, fibra vertical, fibra horizontal, intersección), un vector de dirección de tres componentes XYZ que describe el eje local de la fibra, un canal auxiliar de centros de fibra y seis canales de afinidades locales. La segmentación se obtiene aplicando softmax sobre los cuatro canales; el canal de intersección se conserva de la arquitectura original y su precisión no se ha validado por separado. El vector de dirección debe normalizarse antes de usarse, y signos opuestos representan la misma orientación.

El entrenamiento utilizó regiones de 30 rollos de Herculano (PHerc0125, PHerc0139, PHerc0172, PHerc0175A, PHerc0175B, PHerc0191, PHerc0211, PHerc0257, PHerc0268, PHerc0306B, PHerc0332, PHerc0343, PHerc0343P, PHerc0358, PHerc0483A, PHerc0483B, PHerc0490A, PHerc0490B, PHerc0500P2, PHerc0800, PHerc0813, PHerc0814, PHerc0826, PHerc0841, PHerc0846A, PHerc0846B, PHerc1203, PHerc1218, PHerc1447 y PHercParis4). Las entradas se prepararon con un espaciado de vóxel de 8,64 a 9,6 µm, incluyendo niveles submuestreados de escaneos de mayor resolución. La innovación técnica destacable es la aumentación por compresión geométrica sintética: una deformación suave a lo largo de la normal local de la capa estrecha los espacios entre capas de papiro, y las variantes más agresivas comprimen también el material. La CT y las anotaciones de fibras se deforman de forma conjunta para mantener la alineación entre imagen y objetivos, lo que expone al modelo a capas de papiro densamente empaquetadas.

No se especifica en la información disponible el número de tokens de entrenamiento (no aplica), el volumen total de vóxeles anotados, ni si se emplearon técnicas de regularización adicionales más allá de la aumentación descrita.

## Capacidades

- Segmentación 3D de fibras de papiro en volúmenes CT, con distinción entre familias horizontal y vertical.
- Estimación de la orientación local de la fibra mediante un vector tridimensional XYZ.
- Detección de centros de fibra mediante un canal auxiliar dedicado.
- Cálculo de afinidades locales (seis canales) que pueden emplearse para agrupar vóxeles de la misma fibra.
- Procesamiento de volúmenes de entrada de 128³ vóxeles (según el ejemplo cualitativo de la model card).
- Robustez ante capas de papiro comprimidas gracias a la aumentación por compresión geométrica.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente perceptivo.
- No tiene capacidades multilingües ni de generación de texto.

## Casos de uso

- Lectura virtual de papiros de Herculano: el modelo segmenta las fibras de papiro en la CT para reconstruir la geometría de las capas y facilitar el desenrollado computacional necesario antes de la detección de tinta. Es adecuado porque distingue familias de fibras y proporciona orientación local, información clave para trazar la superficie del papiro.
- Análisis de compresión física en rollos carbonizados: al estimar la orientación y los centros de fibra, permite cuantificar el grado de compactación de las capas y estudiar el estado de conservación sin manipular el material.
- Validación de pipelines de adquisición CT: sirve como referencia para comprobar si un nuevo escaneo a ~9 µm produce segmentaciones coherentes con el modelo entrenado en 30 rollos, detectando desviaciones de calibración o resolución.
- Generación de anotaciones asistidas: los canales de centros y afinidades pueden usarse para proponer agrupaciones de vóxeles que aceleren el etiquetado manual por parte de expertos en papirología.
- Investigación en segmentación de estructuras fibrosas en imagen 3D: la combinación de segmentación semántica, campo de dirección y afinidades locales es un patrón reutilizable en otros dominios con estructuras alargadas (fibras de madera, tejido muscular, materiales compuestos).
- Docencia y reproducción científica: al estar bajo Apache 2.0 y con un repositorio de 0,6 GB, puede desplegarse en laboratorios con recursos moderados para reproducir experimentos del Vesuvius Challenge.
- Preprocesamiento para modelos de detección de tinta: la orientación de fibra estimada puede alimentar etapas posteriores que corrigen la distorsión de la superficie antes de aplicar clasificadores de tinta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 0,6 GB, lo que sugiere que los pesos caben holgadamente en GPUs de consumo, pero no se especifica el tamaño exacto del modelo ni el consumo en memoria durante la inferencia.
- GPU recomendadas: no disponible. Para un nnU-Net 3D con entradas de 128³ vóxeles, es razonable esperar que funcione en GPUs con 8-16 GB de VRAM, pero este dato no está confirmado por el autor.
- Cabeza en GPU de consumo: probablemente sí en tarjetas tipo RTX 3060/4060 o superiores, aunque no hay confirmación oficial.
- Opciones de despliegue: no disponible. Al ser un nnU-Net, el despliegue típico sería mediante PyTorch y el framework nnU-Net, pero la model card no documenta el proceso de inferencia ni scripts de despliegue.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de segmentación de fibras en CT de papiro ni con segmentadores 3D genéricos. El único modelo relacionado explícito es su predecesor `Qualzz20/afv_fiber_9um`, del que este es un ajuste fino, pero no se detallan diferencias cuantitativas de rendimiento entre ambos.

## Limitaciones y advertencias

- El canal de intersección (cuarto logit de segmentación) se conserva de la arquitectura original y su precisión no se ha establecido por separado; no debe interpretarse como una clase fiable sin validación adicional.
- El modelo está optimizado para un espaciado de vóxel de 8,64 a 9,6 µm. Volúmenes con resoluciones muy distintas pueden degradar la segmentación y requerir remuestreo previo.
- La aumentación por compresión geométrica es sintética; no está claro cómo generaliza a compresiones reales no representadas en el entrenamiento.
- No hay información sobre sesgos, tasas de alucinación (no aplica en el sentido lingüístico) ni sobre el rendimiento en rollos no incluidos en el conjunto de entrenamiento.
- El entrenamiento se limita a 30 rollos de Herculano; la generalización a otros materiales fibrosos o a papiros de otras procedencias no está documentada.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y sin documentación de limitaciones de responsabilidad.
- No se documentan los formatos de pesos ni los scripts de inferencia, lo que puede dificultar la reproducibilidad en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Qualzz20/afv_fiber_9um_v2
- Modelo base: https://huggingface.co/Qualzz20/afv_fiber_9um
- Vesuvius Challenge (contexto del proyecto): no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
