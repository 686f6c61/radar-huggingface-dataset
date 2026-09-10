# ehsanroohi/Task-Preserving-Shock-Vortex-Segmentation

## Resumen

Task-Preserving Shock-Vortex Segmentation (HJ) es un modelo de segmentación de imágenes desarrollado por ehsanroohi para detectar simultáneamente ondas de choque y núcleos de vórtice solapados en flujos compresibles de dinámica de fluidos computacional (CFD). El modelo consume campos de flujo primitivos junto con diagnósticos diferenciales deterministas y produce campos sigmoideos independientes, lo que permite que las etiquetas de choque y vórtice se solapen. Su arquitectura es una red codificador-decodificador con un encoder compartido de anchos [10, 20, 40, 80] y dos decodificadores específicos de tarea. La innovación principal es el enfoque de preservación de tarea: durante la adaptación de la detección de choques, el encoder y la ruta completa de vórtices se congelan, y solo se actualizan el decodificador de choque y la proyección, garantizando una preservación exacta de la tarea de vórtice. El modelo está publicado bajo licencia MIT e incluye tres checkpoints registrados. Es relevante ahora por la creciente necesidad de herramientas de postprocesado automático en simulación CFD, donde la separación de estructuras físicas solapadas resulta difícil y costosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador-decodificador con encoder compartido y dos decodificadores específicos (shock y vortex) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de segmentación de imágenes) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de visión, no de texto) |
| Licencia | MIT |
| Formato de pesos | Checkpoints .pt (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal convolucional de tipo codificador-decodificador con un encoder compartido de anchos [10, 20, 40, 80] y dos decodificadores independientes: uno para ondas de choque y otro para núcleos de vórtice. El modelo toma como entrada campos de flujo primitivos y diagnósticos diferenciales deterministas, y emite campos sigmoideos independientes para cada clase, de modo que las regiones de choque y vórtice pueden solaparse sin restricciones. Durante la adaptación de la tarea de choque, el encoder completo y la ruta de vórtice se congelan; solo el decodificador de choque y la capa de proyección se actualizan. Esto garantiza por construcción la preservación exacta de la tarea de vórtice, como se refleja en una deriva de probabilidad de núcleo nula en las semillas evaluadas. El conjunto de datos es de carácter custom, según la información de HuggingFace, aunque no se especifican el número total de muestras ni la composición detallada. El proceso de entrenamiento no incluye RLHF ni DPO, al tratarse de un modelo de segmentación supervisado.

## Capacidades

- Segmentación simultánea de ondas de choque y núcleos de vórtice solapados en flujo compresible.
- Salida de campos sigmoideos independientes para cada clase, lo que admite solape entre etiquetas.
- Entrada multimodal formada por campos de flujo primitivos y diagnósticos diferenciales deterministas.
- Preservación de tarea mediante congelación selectiva de pesos durante la adaptación, manteniendo el rendimiento de la segmentación de vórtices.
- Validación en geometrías de perfil alar y cilindro, con métricas publicadas para cada caso.
- No es un modelo de lenguaje, por lo que no soporta generación de texto, tool calling, razonamiento general ni procesamiento multimodal de imágenes naturales.

## Casos de uso

- Postprocesado automático de simulaciones aerodinámicas: el modelo puede segmentar choques y vórtices en mallas de perfiles alares, reduciendo la intervención manual en la extracción de estructuras de flujo.
- Análisis de estelas de cilindros: la detección de núcleos de vórtice en la región de estela de un cilindro se mantiene estable al adaptar el modelo a nuevos regímenes, gracias al esquema de preservación de tarea.
- Integración con solvers CFD como SU2: el modelo puede acoplarse a flujos de trabajo de SU2 para generar mapas de cobertura de rayos finitos y errores normales condicionales, tal como se documenta en las métricas.
- Investigación en aprendizaje continuo para CFD: el enfoque de congelación de pesos permite adaptar el modelo a nuevas geometrías sin olvidar las anteriores, útil en procesos de diseño iterativo.
- Detección de ondas de choque en turbomáquinas: en turbinas y compresores, la identificación automática de choques facilita la evaluación de pérdidas y la interacción con el flujo secundario.
- Validación de métodos numéricos: los resultados de segmentación pueden compararse con referencias analíticas, como el vórtice analítico, para verificar la precisión de las simulaciones y de los propios detectores.

## Benchmarks y rendimiento

Se presentan los resultados registrados en la model card, obtenidos como medias y desviaciones estándar sobre tres semillas (20260904–20260906):

| Evaluacion | Resultado |
|---|---|
| Airfoil shock Dice, corrected weak reference | 0.936 ± 0.004 |
| Cylinder shock Dice, corrected weak reference | 0.939 ± 0.024 |
| Retained airfoil core Dice | 0.827 ± 0.048 |
| Retained cylinder core Dice | 0.228 ± 0.020 |
| Independent analytic-vortex disk Dice | 0.672 ± 0.086 |
| Independent analytic centre recovery | 0.889 ± 0.192 |
| Continued-SU2 finite-ray coverage | 1.000 ± 0.000 |
| Continued-SU2 conditional normal MAE | 0.00284c ± 0.00092c |

Además, la model card indica que la deriva de probabilidad del núcleo es exactamente cero para las tres semillas en las 129 evaluaciones campo-semilla. Estos resultados no establecen precisión frente a anotaciones humanas ni validación de frente completo. Las referencias Dice de CFD son referencias físicas débiles, mientras que los controles analíticos y los rayos finitos de SU2 son controles acotados e independientes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Dado el reducido ancho de la arquitectura (10 a 80), el coste computacional es previsiblemente bajo, pero no hay datos oficiales.
- GPU recomendadas: no especificadas. La arquitectura es compatible con cualquier GPU que soporte PyTorch.
- Compatibilidad con GPU de consumo: no hay indicación oficial. Por el pequeño tamaño del modelo, podría ejecutarse en tarjetas de gama media, aunque no se confirma en la documentación.
- Opciones de despliegue: los checkpoints se distribuyen como archivos .pt de PyTorch, por lo que pueden cargarse con el framework nativo o integrarse en el Space interactivo de HuggingFace.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se incluyen comparaciones con otros modelos en la información proporcionada. No se han identificado modelos comparables de la misma categoría (segmentación de choques y vórtices en CFD) con datos públicos que permitan establecer una comparación rigurosa.

## Limitaciones y advertencias

- Los resultados publicados no establecen precisión frente a anotaciones humanas de verdad terreno.
- No hay evidencia de transferencia universal a geometrías distintas de las evaluadas (perfil alar y cilindro).
- La validación de frentes completos no está realizada.
- Las referencias Dice de CFD son referencias físicas débiles, no anotaciones humanas.
- Los controles analíticos (vórtice analítico y rayos SU2) son controles acotados y distintos de las métricas principales.
- El modelo incluye únicamente tres checkpoints registrados, correspondientes a semillas concretas.
- El pipeline extendido mostrado en el Space de HuggingFace difiere de los checkpoints HJ registrados; las métricas publicadas describen los checkpoints HJ, no ese pipeline.
- El manuscrito asociado está en revisión o preparación, y no se ha asignado un DOI.
- No se documentan sesgos específicos en la información disponible.

## Enlaces

- HuggingFace: https://huggingface.co/ehsanroohi/Task-Preserving-Shock-Vortex-Segmentation
- Código fuente y material de reproducibilidad: https://github.com/Ehsan-Roohi/ShockVortexML
- Vídeos complementarios de calidad original: https://github.com/Ehsan-Roohi/ShockVortexML/releases/tag/movies-localfront-v2-20260909
- Canal de YouTube del autor: https://www.youtube.com/@ehsan_roohi
- Space interactivo: https://huggingface.co/spaces/ehsanroohi/ShockVortexML-Demo
