# OneScience-Group/StableNN-Phys

## Resumen

StableNN-Phys es una reproducción de ingeniería de una parametrización unificada de física basada en redes neuronales para un modelo atmosférico de columna única. Desarrollado por OneScience-Group, el modelo predice de forma continua la evolución del estado termodinámico en intervalos de tres horas a partir de estados de columna y flujos de superficie. El método original fue propuesto por investigadores del Departamento de Ciencias Atmosféricas de la Universidad de Washington y publicado en 2018 (doi:10.1029/2018GL078510). La arquitectura es una red neuronal feedforward que mapea 71 características de entrada (34 niveles de energía estática líquida, 34 niveles de agua total, flujos de calor sensible y latente y radiación solar entrante) a 68 tendencias físicas (34 de temperatura y 34 de humedad). El modelo está diseñado para entrenamiento con ventanas de 20 pasos, integración multi-paso sin teacher forcing y validación de estabilidad a largo plazo en 64 pasos (ocho días). Este repositorio no incluye pesos preentrenados y utiliza datos sintéticos para validar el flujo de trabajo de ingeniería, por lo que no representa el rendimiento formal del paper.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal feedforward (MLP) con integración multi-paso |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de física, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

La arquitectura de StableNN-Phys es una red neuronal feedforward (MLP) con capas ocultas; la configuración registrada en el paper utiliza un ancho oculto de 128. El modelo procesa un vector de entrada de 71 valores y produce 68 tendencias físicas. El entrenamiento se realiza con el optimizador Adam para ajustar secuencias de estado de múltiples pasos con ventanas T=20, utilizando una pérdida MAD ponderada por masa de capa. La integración multi-paso se realiza sin teacher forcing, aplicando forzamiento advectivo en cada paso. El repositorio incluye un script de generación de datos sintéticos (`fake_data.py`) para validar los flujos de entrenamiento, inferencia y evaluación; estos datos no representan la distribución de datos ni la escala de entrenamiento del paper. La configuración del paper usa una tasa de aprendizaje de 0.01, tamaño de lote 200, cinco épocas y ancho oculto 128, mientras que la configuración por defecto de ingeniería reduce el ancho y el número de muestras para una validación rápida del flujo de trabajo.

## Capacidades

- Predicción continua de la evolución del estado termodinámico en columna a intervalos de tres horas, a partir de 34 niveles de energía estática, 34 niveles de agua total y flujos de superficie.
- Mapeo de 71 características de entrada a 68 tendencias físicas (temperatura y humedad) en cada paso temporal.
- Integración multi-paso con forzamiento advectivo y sin teacher forcing, lo que permite validar la estabilidad del modelo en trayectorias largas.
- Entrenamiento con ventanas temporales de 20 pasos (T=20), usando una pérdida MAD ponderada por masa de capa.
- Validación de estabilidad a largo plazo mediante una integración fija de 64 pasos (ocho días) sin teacher forcing.
- Diagnóstico del balance de agua en columna, incluyendo precipitación derivada del almacenamiento de agua, flujo de calor latente y convergencia de humedad advectiva.
- Compatibilidad con entornos Hugging Face y OneCode para validar flujos de trabajo de entrenamiento, inferencia, evaluación y visualización.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento simbólico.

## Casos de uso

- Predicción de columna única: el modelo se usa para predecir la evolución del estado termodinámico a intervalos de tres horas a partir de estados de columna de 34 niveles y flujos de superficie. Es adecuado porque está diseñado específicamente para esta tarea y permite obtener trayectorias continuas sin intervención externa.
- Entrenamiento de parametrización física: investigadores pueden entrenar el modelo para aprender el mapeo de 71 características a 68 tendencias con ventanas T=20. Es útil para desarrollar sus propias parametrizaciones y ajustar hiperparámetros como la tasa de aprendizaje o el ancho oculto.
- Validación de estabilidad a largo plazo: se puede ejecutar una integración fija de 64 pasos sin teacher forcing para comprobar que el modelo no diverge en horizontes de ocho días. Es adecuado para evaluar la robustez numérica de parametrizaciones neuronales antes de integrarlas en modelos climáticos.
- Evaluación de balance de agua: el modelo permite diagnosticar la precipitación a partir del almacenamiento de agua en columna, el flujo de calor latente y la convergencia de humedad advectiva. Es útil en estudios de ciclo hidrológico y para verificar la consistencia física de las predicciones.
- Ejecución en Hugging Face o OneCode: permite validar los flujos de trabajo de entrenamiento, inferencia, evaluación y visualización en entornos de nube. Es adecuado para pruebas de integración y para asegurar que los scripts funcionan en diferentes infraestructuras.
- Educación y reproducción científica: el repositorio sirve como referencia de implementación para estudiantes e investigadores que deseen reproducir los resultados del paper de 2018 y comparar configuraciones alternativas. Es adecuado porque incluye scripts completos de entrenamiento, inferencia y evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo card indica explícitamente que los datos sintéticos del repositorio no representan la distribución de datos, la escala de entrenamiento ni el rendimiento formal del paper original.

## Requisitos de hardware

- Se recomienda una GPU o DCU para entrenamiento e inferencia.
- Una CPU puede usarse para validación de conectividad con la configuración de muestra pequeña por defecto.
- Usuarios de DCU deben instalar DTK 25.04.2 o posterior, o la versión recomendada por OneScience que coincida con el clúster.
- VRAM estimada: no disponible. El modelo es una red neuronal relativamente pequeña, pero no se especifica el número total de parámetros en la información proporcionada.
- GPU recomendadas: no disponible. La información solo indica compatibilidad con GPU y DCU, sin modelos concretos.
- Opciones de despliegue: scripts de PyTorch (`train.py`, `inference.py`) y soporte para entrenamiento multi-GPU con `torchrun`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la información proporcionada. El modelo es una reproducción de un método publicado en 2018, pero no se ofrecen datos de benchmarks ni comparativas con otras implementaciones de parametrización física neuronal.

## Limitaciones y advertencias

- El repositorio no incluye pesos preentrenados en `weight/`. Los checkpoints generados con datos sintéticos solo validan el flujo de trabajo de ingeniería y no son los pesos oficiales del paper.
- Los resultados obtenidos con datos sintéticos no representan la distribución de datos, la escala de entrenamiento ni el rendimiento formal del paper original.
- El modelo solo tiene soporte de idioma inglés en la metadata, aunque al tratarse de un modelo numérico de física el idioma es irrelevante para su funcionamiento.
- La licencia Apache-2.0 permite uso comercial, pero al no incluir pesos preentrenados, el usuario debe entrenar el modelo por su cuenta con sus propios datos.
- No es un modelo de lenguaje: no debe usarse para tareas de procesamiento de lenguaje natural, generación de texto o razonamiento simbólico.
- La información disponible no especifica el número total de parámetros, por lo que no se puede estimar con precisión el consumo de memoria ni los requisitos de hardware.
- El riesgo de sesgos no aplica directamente, pero la calidad del modelo depende completamente de los datos de entrenamiento; con datos sintéticos, los resultados son solo de validación de flujo.

## Enlaces

- HuggingFace: https://huggingface.co/OneScience-Group/StableNN-Phys
- Paper: https://doi.org/10.1029/2018GL078510
- OneScience Gitee: https://gitee.com/onescience-ai/onescience
- OneScience GitHub: https://github.com/onescience-ai/OneScience
- OneScience Skills Gitee: https://gitee.com/onescience-ai/oneskills
- OneCode: https://web-2069360198568017922-iaaj.ksai.scnet.cn:58043/home
