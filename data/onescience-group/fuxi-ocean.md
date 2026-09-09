# OneScience-Group/FuXi-Ocean

## Resumen

FuXi-Ocean es un modelo de predicción oceánica autorregresiva desarrollado por OneScience-Group en colaboración con la Universidad de Tianjin, la Academia de Inteligencia Artificial para la Ciencia de Shanghái, la Universidad de Fudan y otras instituciones. A partir de estados oceánicos históricos y variables atmosféricas en el momento de la inicialización, genera predicciones de campos oceánicos globales con una resolución que resuelve remolinos de mesoescala (eddy-resolving) y con paso temporal de seis horas. El modelo está diseñado para proporcionar un flujo de trabajo de ingeniería ejecutable para la investigación en métodos de predicción oceánica de alta resolución. El repositorio de HuggingFace incluye el código de entrenamiento e inferencia, pero no contiene pesos preentrenados oficiales; los pesos disponibles son artefactos de ingeniería entrenados sobre datos sintéticos. La arquitectura se describe en el artículo "A deep learning global ocean forecasting model with sub-daily and eddy-resolving resolution" (DOI: 10.1038/s41612-026-01444-2).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal autorregresiva con codificación convolucional compartida, prior espacio-temporal, fusión de características históricas, atención de baja resolución y decodificación compartida |
| Parametros totales | No disponible |
| Longitud de contexto | No disponible (no es un modelo basado en texto; la entrada temporal es de 4 estados oceánicos históricos de 6 horas) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (el repositorio no incluye pesos oficiales; el checkpoint local se guarda como archivo .pt de PyTorch) |

## Arquitectura y entrenamiento

La arquitectura de FuXi-Ocean, según el artículo asociado, combina varios componentes clave: codificación convolucional compartida, un prior espacio-temporal, fusión de características históricas, atención de baja resolución y decodificación compartida. El modelo realiza predicción autorregresiva de temperatura, salinidad, corriente zonal, corriente meridional y altura de la superficie del mar sobre una rejilla global de 2160×4320 puntos, con 26 niveles de profundidad, 105 canales oceánicos y 5 canales atmosféricos. El entrenamiento se lleva a cabo con campos oceánicos de reanálisis y análisis HYCOM, junto con variables atmosféricas cercanas a la superficie de ERA5, y utiliza una pérdida de Charbonnier ponderada por latitud y un despliegue autorregresivo multi-paso. En el repositorio de HuggingFace, el entrenamiento se demuestra sobre un conjunto de datos sintéticos compuesto por seis tiles estructurados, que preservan el protocolo global de indexación pero no representan la distribución real de HYCOM ni de ERA5. El artículo indica que los experimentos formales requieren los datos reales y recursos de cómputo a escala completa; el repositorio actual sirve para validar el flujo de trabajo de ingeniería, no el rendimiento del paper.

## Capacidades

- Predicción autorregresiva de campos oceánicos globales en intervalos de seis horas, partiendo de cuatro estados históricos y variables atmosféricas en el tiempo de inicialización.
- Generación de predicciones para cinco variables oceánicas: temperatura, salinidad, corriente zonal, corriente meridional y altura de la superficie del mar.
- Soporte de rejilla global científica de 2160×4320 puntos, con 26 niveles de profundidad y 105 canales oceánicos, más 5 canales atmosféricos.
- Integración de un prior espacio-temporal y atención de baja resolución para capturar dependencias de largo alcance en la dinámica oceánica.
- Uso de pérdida de Charbonnier ponderada por latitud, que pondera la contribución de diferentes latitudes según su área física.
- Capacidad de ejecución en entornos de entrenamiento distribuido multi-GPU mediante `torchrun`.
- Validación del flujo de trabajo completo de entrenamiento, inferencia, evaluación y visualización sobre tiles muestreados, con registro de métricas RMSE y MBE ponderadas por latitud, en comparación con un baseline de persistencia.
- No tiene capacidades de procesamiento de lenguaje natural, tool calling, agentes ni visión; es un modelo específico para predicción de campos oceánicos.

## Casos de uso

- Validación de métodos de predicción oceánica autorregresiva: el modelo permite reproducir el pipeline completo de predicción de estados oceánicos a partir de estados históricos y variables atmosféricas, sirviendo como referencia para investigadores que desarrollan nuevas arquitecturas de pronóstico oceánico.
- Entrenamiento distribuido y escalado multi-GPU: su flujo de trabajo con `torchrun` facilita la validación de estrategias de paralelización y de checkpointing en clústeres de investigación, útil para grupos que necesitan escalar a rejillas globales completas.
- Ingeniería de software para ciencia de datos oceánicos: el repositorio proporciona interfaces de indexación, solapamiento de tiles, contratos de datos, inferencia, evaluación y visualización sobre el protocolo de rejilla 2160×4320, lo que sirve como base para el desarrollo de aplicaciones operacionales.
- Investigación en asimilación de datos oceánicos: aunque este modelo se centra en predicción autorregresiva, su estructura de entrada con variables atmosféricas de inicialización puede adaptarse en estudios sobre el impacto de condiciones iniciales en el pronóstico oceánico.
- Formación y docencia en aprendizaje profundo aplicado a geociencias: el uso de datos sintéticos hace posible ejecutar el flujo en una CPU o una GPU modesta, permitiendo a estudiantes y equipos pequeños familiarizarse con el pipeline sin necesidad de los datos completos de HYCOM/ERA5.
- Despliegue en entornos ModelScope/OneCode: el modelo puede ejecutarse en estas plataformas de computación inteligente para la ciencia, con soporte para estructuras de datos, entrenamiento, inferencia y métricas por paso temporal, lo que facilita la iteración rápida en entornos gestionados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explícitamente que los datos sintéticos del repositorio no representan la distribución real ni el rendimiento del paper, y que los pesos locales son artefactos de ingeniería sin validez para comparaciones científicas. Por tanto, no se proporcionan cifras de MMLU, HumanEval, GSM8K ni otros indicadores. El artículo asociado contiene los resultados científicos, pero dichos números no están incluidos en los materiales consultados.

## Requisitos de hardware

- Se recomienda una GPU o una DCU para el entrenamiento y la inferencia.
- Una CPU es suficiente para la validación de conectividad con la configuración de muestras pequeñas por defecto.
- Los usuarios de DCU deben instalar DTK 25.04.2 o superior, o la versión recomendada por OneScience según el clúster.
- No se especifica la VRAM necesaria en la información disponible; al ser un modelo con rejilla 2160×4320 y 26 niveles de profundidad, se requiere una memoria significativa, pero no se aportan cifras concretas.
- Las opciones de despliegue documentadas son PyTorch, `torchrun` para entrenamiento distribuido y ejecución en entornos ModelScope o OneCode.
- No se indican datos de latencia ni de throughput.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye especificaciones de modelos comparables. Existe el modelo FuXi (OneScience-Group/FuXi) de predicción meteorológica global, también desarrollado por el mismo grupo, pero no se dispone de datos suficientes para comparar parámetros, contexto, rendimiento o licencia de manera fiable. Así pues, se omite una tabla comparativa por falta de datos verificados.

## Limitaciones y advertencias

- El repositorio de HuggingFace no incluye pesos oficiales; los checkpoints generados localmente son artefactos entrenados sobre datos sintéticos (`sampled_tiles`) y no son compatibles con los pesos del paper.
- Las predicciones del código de demostración se marcan explícitamente como `sampled_tiles` y `is_complete_global=false`, por lo que no deben interpretarse como una predicción global completa.
- Los datos de entrenamiento sintéticos no reproducen la distribución real de HYCOM ni de ERA5, por lo que cualquier métrica obtenida con ellos no es representativa del rendimiento real del modelo.
- La validación se limita a tiles de muestra y a un máximo de tres pasos autorregresivos por defecto; aunque se conserva el protocolo de 40 pasos del paper, la ejecución local no lo reproduce en su totalidad.
- El modelo no está diseñado para tareas de lenguaje natural, por lo que carece de capacidades como generación de texto, razonamiento simbólico o tool calling; sus limitaciones son propias de los modelos de predicción de campos geofísicos.
- Los sesgos y posibles errores de los datos de entrenamiento reales (HYCOM y ERA5) no están documentados en la información disponible; en producción con datos reales sería necesario evaluarlos por separado.
- La licencia Apache-2.0 permite uso comercial, pero la falta de pesos preentrenados oficiales y de documentación de rendimiento limita su aplicación directa en producción.
- El enlace a Zenodo mencionado en el paper (https://doi.org/10.5281/zenodo.17412508) se identifica como el recurso de disponibilidad de código, pero la model card advierte que no debe tratarse como un enlace confirmado de descarga de pesos.

## Enlaces

- Página de HuggingFace del modelo: https://huggingface.co/OneScience-Group/FuXi-Ocean
- Paper en Nature npj Climate and Atmospheric Science: https://doi.org/10.1038/s41612-026-01444-2
- Enlace de disponibilidad de código del paper (no confirmado como descarga de pesos): https://doi.org/10.5281/zenodo.17412508
- Entorno OneCode propuesto por los autores: https://web-2069360198568017922-iaaj.ksai.scnet.cn:58043/home
