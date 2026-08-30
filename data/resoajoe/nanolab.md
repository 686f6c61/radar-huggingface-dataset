# resoajoe/nanolab

## Resumen

nanolab es un harness de evaluación y decisión para modelos de visión pequeños, desarrollado por resoajoe y publicado con licencia MIT. No es un modelo de aprendizaje automático en sí, sino un conjunto de utilidades Python que ayudan a determinar si un modelo de visión de pequeño tamaño merece ser desplegado en producción. Su propósito explícito es evitar que un modelo con métricas aparentemente buenas se envíe cuando un baseline estadístico simple lo iguala o supera.

El harness implementa cuatro componentes principales: baselines baratos y difíciles de superar, cuatro gates de decisión secuenciales, un módulo de "answerability" basado en criterios de resolución de Johnson (1958), y un sweep de resolución para comprobar si el modelo realmente aprovecha más píxeles. El autor reporta que el harness ha descartado más candidatos de los que ha aprobado, lo que considera el comportamiento deseado. La relevancia actual radica en la creciente tendencia a desplegar modelos pequeños en edge computing y visión por computador, donde a menudo se sobreestima su valor frente a técnicas clásicas de procesamiento de imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (harness de evaluación, no modelo) |
| Parametros totales | No aplica |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible (el código y la documentación están en inglés) |
| Licencia | MIT |
| Formato de pesos | No aplica (distribuido como código Python, no como pesos) |

## Arquitectura y entrenamiento

nanolab no es un modelo entrenado, sino un paquete de software que implementa una metodología de evaluación. Su "arquitectura" se compone de funciones Python organizadas en módulos: `scalar_baseline`, `verdict`, `report`, `answerability`, `zoom_for`, `camera_spec`, `resolution_sweep`, y utilidades de división de datos. No hay datos de entrenamiento ni proceso de optimización de parámetros; en su lugar, el harness utiliza estadísticas clásicas de imagen (media, desviación estándar, varianza de Laplaciano, ratio de alta frecuencia, gradiente, entropía) más cuatro estadísticas espaciales (centro-borde, pendiente radial, picos FFT fila y columna) para construir baselines.

La innovación técnica clave es el uso de baselines con conciencia espacial. El autor documenta que añadir una estadística de pendiente radial elevó un baseline de 0.707 a 0.907 en una tarea de viñeteado, reduciendo el margen aparente del modelo de +0.261 a +0.060. También se describe un baseline transferido con un modelo logístico de ~66 parámetros que aumentó la barra de 0.438 a 0.543 y recortó el margen del modelo de +0.183 a +0.077. El harness incluye cuatro gates de decisión (utilidad, ordinal, científico e ingeniería) diseñados para ser conservadores y evitar sobreajustes metodológicos.

## Capacidades

- Cálculo de diez estadísticas por imagen, seis globales y cuatro espaciales, para construir baselines baratos y robustos.
- Evaluación de modelos frente a baselines con umbrales ajustables, incluyendo la posibilidad de usar un modelo logístico pequeño sobre las estadísticas para tareas multiclase.
- Cuatro gates de decisión secuenciales: utilidad (lift sobre la clase mayoritaria ≥ 0.15), ordinal (error medio por debajo de un umbral de bin), científico (comparación con baseline in-sample) e ingeniería (comparación con baseline transferido).
- Módulo de answerability basado en los criterios de Johnson (1958): ~2 píxeles para detectar un objeto, 8 para reconocer su tipo, 12.8 para identificarlo. Incluye funciones `answerable`, `zoom_for` y `camera_spec` para calcular si una tarea es físicamente posible con una cámara dada.
- Barrido de resolución a parámetros constantes (`resolution_sweep`) para determinar si el modelo mejora con más píxeles, válido solo para arquitecturas con global average pooling.
- División de datos por grupos (no por muestras) para evitar fugas de información entre muestras adyacentes, con soporte para ponderación por tamaño de test.
- Generación de informes y veredictos automatizados mediante `report` y `verdict`.

## Casos de uso

- Evaluación de un clasificador de atributos de prendas: el harness compara el modelo contra un baseline de estadísticas globales y espaciales. Si el margen no crece al aumentar la resolución de 64 a 256 píxeles, el modelo no aporta valor frente a un umbral simple.
- Decisión de despliegue de un detector de ocupación en imágenes térmicas: el autor reporta que un modelo de ocupación perdió contra un umbral sobre la varianza térmica (0.85 vs 0.77). El harness permite descartar el modelo antes de invertir en etiquetado o infraestructura.
- Verificación de viabilidad de detección de dispositivos médicos desde cámaras de habitación: usando `answerable` se calcula que una cánula nasal de 6 mm a 1.7 metros de distancia con una cámara 720p requiere un sensor de 9,067 píxeles de alto, concluyendo que la tarea es imposible a resoluciones prácticas. Esto evita una campaña de etiquetado completa.
- Optimización de zoom en sistemas de visión: `zoom_for` indica que para poner 8 píxeles sobre una característica de 5 mm con entrada de 224 píxeles, se necesita recortar a 140 mm. Útil para diseñar pipelines de captura en vez de depender de upscaling.
- Control de calidad en pipelines de visión industrial: el gate de utilidad exige un lift mínimo de 0.15 sobre la clase mayoritaria, filtrando modelos que son estadísticamente significativos pero no útiles en la práctica.
- Auditoría de splits de datos: el harness detecta que dividir por muestra en lugar de por grupo produce métricas infladas (de 1.000 a +0.238 al corregir). Se usa para validar que los resultados reportados de un modelo son honestos antes de publicarlos o desplegarlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks formales en la información disponible. El autor reporta casos de uso internos con métricas concretas, que se resumen a continuación como evidencia del funcionamiento del harness:

| Tarea | Baseline | Modelo | Margen aparente | Margen corregido |
|---|---|---|---|---|
| Viñeteado (solo estadísticas globales) | 0.707 | 0.967 | +0.261 | — |
| Viñeteado (con pendiente radial) | 0.907 | 0.967 | — | +0.060 |
| Tarea multiclase (baseline simple) | 0.438 | 0.621 | +0.183 | — |
| Tarea multiclase (baseline logístico ~66 params) | 0.543 | 0.620 | — | +0.077 |
| Detección de cuadrícula (in-sample) | 0.954 | — | — | — |
| Detección de cuadrícula (transferido) | 0.565 | — | — | — |
| Ocupación (umbral térmico) | 0.77 | 0.85 | — | — |
| Clasificador estudio-vs-calle | 0.957 (entropía) | 0.994 | — | — |

Estos números ilustran cómo el harness reduce márgenes aparentes al usar baselines más sofisticados. No constituyen una evaluación comparativa estándar del modelo, sino ejemplos de su uso.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentación. Al ser un harness de evaluación sobre estadísticas de imagen, se espera que funcione en CPU con una cantidad moderada de memoria RAM.
- Para procesar datasets de imágenes de tamaño medio (miles de imágenes), un portátil con 8-16 GB de RAM es suficiente, ya que las estadísticas se calculan por imagen y no requiere entrenamiento de redes profundas.
- El módulo `transferred_baseline` con el modelo logístico de ~66 parámetros es computacionalmente trivial.
- No se requiere GPU, aunque podría acelerar el cálculo de características si se implementara con aceleración, pero no es necesario.
- Opciones de despliegue: se instala como paquete Python (`pip install -e .`) y se integra en pipelines de evaluación existentes. No se mencionan integraciones con vLLM, Ollama u otros motores de inferencia, ya que no es un modelo servible.

## Comparativa con modelos similares

No disponible. No se han identificado harnesses de evaluación con la misma filosofía (baselines baratos y gates de decisión para modelos de visión pequeños) en la información proporcionada. La comparativa más cercana serían frameworks de evaluación de modelos como MLPerf o torchmetrics, pero no son directamente comparables porque nanolab se centra en la decisión de "vale la pena enviar" más que en medir rendimiento bruto. El autor publica otros repositorios en Hugging Face (pipeline-forensics-nano, clinical-scene-nano) que probablemente utilicen este harness, pero no se dispone de detalles.

## Limitaciones y advertencias

- No es un modelo de IA, sino una herramienta de evaluación. No debe usarse para inferencia ni generación de contenido.
- Los gates de decisión son heurísticos y dependen de umbrales elegidos por el autor (por ejemplo, lift ≥ 0.15). Estos umbrales pueden no ser apropiados para todos los dominios y deben ajustarse según el contexto.
- El módulo `resolution_sweep` solo es válido para arquitecturas con global average pooling; usarlo con otras arquitecturas confunde píxeles con capacidad del modelo.
- La división por grupos requiere que ambos lados del split contengan ambas clases; un split solo por tamaño puede producir un test set con 93% de una clase, dando métricas engañosas (el autor reporta un caso con 0.070, muy por debajo del azar).
- La ponderación por tamaño de test es necesaria cuando los grupos difieren en tamaño; no hacerlo puede inflar los resultados (ejemplo: +0.215 no ponderado vs +0.129 ponderado).
- El harness asume que las estadísticas de imagen son suficientes como baselines; en tareas donde la información semántica no se refleja en estadísticas de bajo orden, el baseline podría ser demasiado débil y aprobar modelos que no generalizan.
- La licencia MIT permite uso comercial y modificación, pero no se incluyen garantías de idoneidad para producción; el autor no ofrece soporte formal.
- La documentación está en inglés; no hay versiones en otros idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/resoajoe/nanolab
- Perfil del autor en Hugging Face: https://huggingface.co/resoajoe
- Repositorio relacionado (pipeline-forensics-nano): https://huggingface.co/resoajoe/pipeline-forensics-nano
- Repositorio relacionado (clinical-scene-nano): https://huggingface.co/resoajoe/clinical-scene-nano
- Perfil de GitHub del autor: https://github.com/resoajoe
- Nota: existe otro proyecto llamado "NanoLabo" (interfaz gráfica para materiales) que no está relacionado con este harness.
