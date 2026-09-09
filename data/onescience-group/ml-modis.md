# OneScience-Group/ML-MODIS

## Resumen

ML-MODIS es un modelo de aprendizaje automático desarrollado por OneScience-Group que reproduce el flujo de trabajo satelital propuesto por Chen et al. (2022). Su objetivo es estimar contrafactuales de propiedades de nubes sin la perturbación de aerosoles volcánicos de 2014 y, a partir de ellos, diagnosticar los efectos aerosol-nube y sus contribuciones al forzamiento radiativo de onda corta. Se trata de un modelo de regresión para datos numéricos, no de un modelo de lenguaje.

El método empareja productos de nubes MODIS Collection 6.1 con datos meteorológicos ERA5 y entrena bosques aleatorios independientes por mes y por propiedad objetivo, usando muestras de años distintos de 2014. La arquitectura es un conjunto de bosques aleatorios (Random Forest) implementados en PyTorch. El tamaño del modelo en parámetros no está especificado en la información disponible; la implementación por defecto reduce de 100 a 12 árboles por bosque sin alterar los predictores ni el protocolo de alineación. Puede ejecutarse en CPU para validar el flujo con datos sintéticos, aunque se recomienda GPU o DCU para el trabajo completo.

El valor del modelo radica en su capacidad para aislar el efecto de los aerosoles volcánicos sobre las nubes y cuantificar su contribución radiativa, una tarea clave en el diagnóstico climático. Sin embargo, no se incluyen pesos oficiales ni benchmarks públicos, y los datos sintéticos incluidos sirven solo para validar el flujo de trabajo de ingeniería, no para evaluar el rendimiento científico real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bosques aleatorios (Random Forest) independientes por mes y propiedad objetivo, implementados en PyTorch |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | en (etiqueta del repositorio; el modelo trabaja con datos numericos) |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible oficialmente; checkpoint local .pt (PyTorch) |

## Arquitectura y entrenamiento

ML-MODIS no es un modelo de lenguaje ni un transformer. Se compone de múltiples bosques aleatorios, cada uno entrenado para una combinación específica de mes (septiembre y octubre en la implementación por defecto) y propiedad de nubes objetivo: `Nd` (concentración de gotas), `reff` (radio efectivo), `LWP` (agua líquida de la nube) y `CF` (fracción de nubes). Esta estructura permite modelar relaciones no lineales entre variables meteorológicas y propiedades de nubes sin depender de arquitecturas secuenciales.

Los datos de entrenamiento, según el paper original, alinean MODIS Collection 6.1 con ERA5 por año, mes, plataforma Terra/Aqua y coordenadas, excluyendo las muestras de 2014. Cada muestra contiene 114 predictores: 90 campos de nueve variables de perfil en diez niveles de presión y 24 campos de un solo nivel. Los objetivos son `Nd`, `reff`, `LWP` y `CF`. La implementación de OneScience-Group reduce el número de árboles de 100 a 12 por bosque sin modificar los predictores, los meses, los objetivos ni el protocolo de alineación multimodal. En el repositorio se incluye un generador de datos sintéticos (`scripts/fake_data.py`) que produce relaciones estructuradas para validar la ingeniería del flujo, pero no representa las distribuciones reales de MODIS o ERA5, ni el rendimiento del paper. No se aplica RLHF, DPO ni ninguna técnica de alineación propia de modelos de lenguaje.

## Capacidades

- Predicción contrafactual de propiedades de nubes: estima `Nd`, `reff`, `LWP` y `CF` a partir de condiciones meteorológicas ERA5, representando el estado que probablemente tendrían las nubes sin la perturbación de aerosoles volcánicos de 2014.
- Diagnóstico de efectos aerosol-nube: compara las predicciones contrafactuales con las observaciones MODIS de 2014 para aislar la respuesta de las nubes a los aerosoles volcánicos.
- Análisis radiativo: calcula contribuciones relativas de los efectos Twomey, LWP y CF al forzamiento radiativo de onda corta, usando medidas de susceptibilidad y respuestas ponderadas por área.
- Evaluación estadística del modelo: incluye métricas fuera de bolsa (OOB) como MSE, R² y correlación de Pearson, además de importancia de permutación.
- Entrenamiento distribuido: soporta ejecución multi-GPU mediante `torchrun`, validando el flujo de checkpoints y el escalado horizontal.
- Validación de flujo de trabajo: permite comprobar la generación de datos, el entrenamiento, la restauración de checkpoints, la inferencia, la evaluación y la visualización con datos sintéticos estructurados.
- Integración con plataformas AI4S: está preparado para ejecutarse en entornos OneCode y ModelScope/OneCode, y para instalarse mediante el paquete `onescience` con perfiles para GPU o DCU.
- No incluye capacidades de generación de texto, tool calling, agentes, visión o audio, al no ser un modelo de lenguaje.

## Casos de uso

- Predicción contrafactual de nubes: el modelo estima las propiedades `Nd`, `reff`, `LWP` y `CF` que se habrían observado en 2014 sin la perturbación volcánica, usando únicamente datos meteorológicos ERA5. Es adecuado para estudiar el estado base de las nubes en escenarios de aerosoles ausentes.

- Diagnóstico de forzamiento radiativo tras erupciones volcánicas: al comparar las predicciones contrafactuales con las observaciones MODIS de 2014, se pueden cuantificar las contribuciones relativas de los mecanismos Twomey, LWP y CF al forzamiento radiativo de onda corta. Esto reproduce el objetivo principal del paper de Chen et al. (2022).

- Interpretación de sensibilidad climática: la importancia de permutación calculada por el modelo permite identificar qué variables meteorológicas (por ejemplo, perfiles de temperatura o humedad) tienen mayor influencia sobre cada propiedad de nubes, facilitando el análisis de mecanismos físicos subyacentes.

- Validación de pipelines científicos: el script de datos sintéticos permite probar la generación de datos, el entrenamiento, la restauración de checkpoints, la inferencia y la evaluación en un entorno controlado, sin necesidad de disponer de los conjuntos MODIS y ERA5 completos. Es útil para integración continua en repositorios de investigación.

- Formación en diagnóstico climático con IA: el repositorio puede usarse como ejemplo didáctico de cómo aplicar modelos de regresión no lineales a datos satelitales y meteorológicos, con un flujo que incluye evaluación OOB y análisis de importancia. La plantilla de ejecución con `onescience` facilita el despliegue en clústeres de investigación.

- Investigación post-erupción en tiempo real: si ocurriera una nueva erupción volcánica con efecto similar, se podría adaptar el modelo a otro año y contexto geográfico, siempre que se disponga de datos MODIS y ERA5 alineados y se reentrenen los bosques excluyendo ese año, para diagnosticar el forzamiento aerosol-nube del nuevo evento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los datos sintéticos incluidos en el repositorio no representan el rendimiento real del paper ni las distribuciones MODIS o ERA5, y que los experimentos formales requieren datos reales y verificación a nivel de campo contra el material suplementario del artículo original. Por tanto, no es posible presentar cifras de MMLU, HumanEval, GSM8K u otros benchmarks comunes de modelos de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no especificado; se recomienda una GPU o DCU para el flujo completo.
- Compatibilidad con DCU: requiere instalar DTK 25.04.2 o una versión recomendada por OneScience que coincida con el clúster.
- CPU: puede usarse para validar la conectividad con la configuración por defecto de muestra pequeña (validación de ingeniería).
- Entrenamiento multi-GPU: se sugiere `torchrun` con 8 procesos por nodo como ejemplo, pero no se especifica un modelo de GPU concreto.
- Despliegue: el repositorio está pensado para ejecutarse en el entorno OneCode online, o mediante instalación local del paquete `onescience` con el perfil `[earth-gpu]` o `[earth-dcu]`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni resultados que permitan establecer una comparación con otras implementaciones de diagnóstico aerosol-nube. El modelo es específico del dominio de ciencia terrestre y no se alinea con las categorías habituales de modelos de lenguaje o visión.

## Limitaciones y advertencias

- No se incluyen pesos oficiales: el repositorio no distribuye los pesos del paper original, y el checkpoint local generado es un artefacto de ingeniería que no garantiza compatibilidad con los pesos no publicados de los autores.

- Los datos sintéticos no son representativos: las relaciones estructuradas generadas por `scripts/fake_data.py` no representan las distribuciones reales de MODIS ni ERA5, ni la escala de entrenamiento, ni el rendimiento científico del artículo.

- Los experimentos formales requieren datos reales: para obtener resultados científicos válidos se necesitan los conjuntos MODIS Collection 6.1 y ERA5 alineados, además de verificación contra el material suplementario del paper.

- Especialización extrema: el modelo está diseñado para un año concreto (2014), un conjunto restringido de meses (septiembre y octubre en la configuración por defecto) y propiedades de nubes específicas. No es transferible a otras tareas sin reentrenamiento y adaptación de los datos.

- Dependencias propietarias: la instalación requiere el paquete `onescience` y, en el caso de DCU, un DTK específico. Esto puede limitar su uso en entornos estándar de aprendizaje automático que no estén configurados para la plataforma OneScience.

- No es un modelo de lenguaje: no aplica para generación de texto, resúmenes, código o cualquier tarea de procesamiento de lenguaje natural.

- Licencia de datos: la licencia Apache-2.0 cubre el código del repositorio, pero los datos de entrada (MODIS y ERA5) deben obtenerse y licenciarse por separado según sus propias condiciones.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/OneScience-Group/ML-MODIS
- Organización OneScience en Hugging Face: https://huggingface.co/OneScience-Group/models
- Paper original de Chen et al. (2022): https://doi.org/10.1038/s41561-022-00991-6
- Entorno OneCode online: https://web-2069360198568017922-iaaj.ksai.scnet.cn:58043/home
