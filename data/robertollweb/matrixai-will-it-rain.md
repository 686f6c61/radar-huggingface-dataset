# robertollweb/matrixai-will-it-rain

## Resumen

El modelo `robertollweb/matrixai-will-it-rain` es un clasificador tabular desarrollado por robertollweb en el marco del proyecto MatrixAI, una iniciativa orientada a la creación de modelos de IA auditables y reproducibles. Su propósito es predecir si lloverá al día siguiente a partir de seis variables meteorológicas diarias: temperatura máxima, humedad, presión, delta de presión, cobertura nubosa y horas de precipitación. Se trata de una red neuronal densa con una capa oculta de 16 unidades ReLU y una salida softmax de dos clases (sí/no), entrenada sobre 2.189 registros reales de observaciones meteorológicas (1.751 para entrenamiento y 438 para validación).

La relevancia de este modelo no reside en su capacidad predictiva, sino en su papel como caso de estudio dentro de MatrixAI: es uno de los tres casos publicados en matrixaistudio.org/casos y, a diferencia de los otros dos, no es reproducible. El paquete declara explícitamente que no incluye receta de datos, por lo que la verificación automática (`matrixai verify`) solo puede validar la integridad del manifiesto, quedando las etapas de regeneración de datos, reentrenamiento y comparación de métricas como INCOMPARABLE o NOT_RUN. Esto lo convierte en un ejemplo práctico de los límites de la auditoría cuando falta la trazabilidad completa del ciclo de vida del modelo.

El modelo se distribuye en formato ONNX con un script de predicción (`predict.py`) que solo requiere `numpy` y `onnxruntime`, y la licencia es AGPL-3.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal densa (MLP): 6 entradas, capa oculta de 16 ReLU, salida softmax de 2 clases |
| Parametros totales | No disponible (red pequeña; estimable en menos de 200 parámetros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | No disponible (formato ONNX estándar) |
| Idiomas soportados | No disponible (modelo numérico, sin procesamiento de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (con script Python auxiliar) |

## Arquitectura y entrenamiento

El modelo es un perceptrón multicapa (MLP) de una sola capa oculta con 16 neuronas ReLU y una capa de salida softmax de dos clases. Las seis características de entrada son numéricas: `temp_max`, `humidity`, `pressure`, `pressure_delta`, `cloud_cover` y `precip_hours`. No se especifica el proceso de entrenamiento (optimizador, épocas, función de pérdida) en la información disponible; solo se indica que se ajustó a un conjunto de 2.189 filas de observaciones meteorológicas reales, divididas en 1.751 para entrenamiento y 438 para validación.

La característica más destacable no es la arquitectura, sino su integración con el ecosistema MatrixAI: el paquete incluye un manifiesto (`reproduce.json`) que declara la reproducibilidad como falsa, indicando que no existe receta de datos ni semilla de generación del dataset. Esto implica que el conjunto de datos publicado (`lluvia_nombrada.csv`, 168.756 bytes) no puede regenerarse mediante una regla determinista, lo que impide la verificación completa del modelo según el protocolo MatrixAI.

## Capacidades

- Clasificación binaria: predice la probabilidad de lluvia al día siguiente (clases `si` y `no`).
- Inferencia ligera: el script `predict.py` funciona únicamente con `numpy` y `onnxruntime`, sin dependencias adicionales.
- Integración con MatrixAI: el paquete incluye manifiesto y soporte para el comando `matrixai verify`, aunque en este caso solo la etapa `manifest` puede pasar.
- Transparencia parcial: los datos de entrenamiento están publicados en su totalidad, lo que permite análisis externos aunque no se pueda reproducir el proceso de generación.

## Casos de uso

- Demostración de auditoría de modelos: sirve como material didáctico para mostrar qué ocurre cuando un paquete de IA no es reproducible, y cómo el protocolo MatrixAI reporta las etapas no comprobables con veredictos diferenciados (INCOMPARABLE vs. NOT_RUN).
- Evaluación de herramientas de verificación: puede usarse para probar el comportamiento de `matrixai verify` ante paquetes con manifiesto válido pero sin receta de datos.
- Prototipo de predicción meteorológica simple: aunque no está pensado para producción, su bajo coste computacional permite integrarlo en entornos de prueba o como punto de partida para modelos más complejos.
- Estudio de reproducibilidad en IA: los datos y el código publicados permiten a investigadores analizar los efectos de la falta de trazabilidad en la confianza de los modelos.
- Ejemplo de despliegue ONNX: el formato del modelo y el script de inferencia pueden servir como plantilla para empaquetar clasificadores tabulares en ONNX.
- Referencia para documentación de modelos: la model card muestra un patrón de transparencia al declarar explícitamente las limitaciones de reproducibilidad, útil como modelo de buenas prácticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no reporta métricas de precisión, recall, F1 u otras sobre el conjunto de validación. La única salida de verificación disponible es el resultado de `matrixai verify`, que únicamente confirma la integridad del manifiesto (PASS) y no evalúa el rendimiento predictivo.

## Requisitos de hardware

- Inferencia: al ser un modelo ONNX de tamaño mínimo (red de ~200 parámetros), puede ejecutarse en cualquier CPU moderna sin necesidad de GPU.
- Memoria: el archivo del modelo y el dataset son de tamaño reducido (el dataset completo ocupa ~169 KB), por lo que los requisitos de RAM son despreciables.
- Despliegue: el script `predict.py` solo necesita Python con `numpy` y `onnxruntime`; también puede integrarse en entornos como ONNX Runtime Web o móvil, aunque no se proporcionan ejemplos.
- Latencia: inferior a 1 ms por inferencia en hardware convencional, al tratarse de una red neuronal minúscula.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo dominio (predicción de lluvia con datos tabulares) dentro del contexto de MatrixAI. Los otros dos casos publicados en matrixaistudio.org/casos son reproducibles y se centran en relaciones lineales simples, por lo que no son directamente comparables en términos de arquitectura o rendimiento. No se ha publicado ninguna comparativa con modelos meteorológicos estándar (como regresiones logísticas o árboles de decisión).

## Limitaciones y advertencias

- No reproducible: el paquete declara explícitamente que no es reproducible (`"reproducible": false`), por lo que no se puede regenerar el dataset ni verificar el entrenamiento. Esto limita su uso en entornos que exijan auditoría completa.
- Sin métricas de rendimiento: no se han publicado resultados de precisión, error u otras métricas, por lo que no se puede evaluar su calidad predictiva.
- Datos limitados: el dataset de 2.189 filas es pequeño y podría no ser representativo de todas las condiciones meteorológicas; además, la ausencia de receta impide conocer el proceso de selección de datos.
- Sesgos potenciales: al ser un modelo entrenado con datos reales sin documentación sobre su procedencia, pueden existir sesgos geográficos o temporales no declarados.
- Licencia AGPL-3.0: cualquier uso o modificación del modelo o sus datos debe cumplir con los términos de esta licencia, lo que puede afectar a proyectos comerciales que no quieran liberar su código bajo AGPL.
- No apto para producción: el modelo no está pensado como sistema de predicción meteorológica fiable, sino como caso de estudio de auditoría.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/robertollweb/matrixai-will-it-rain
- Repositorio GitHub de MatrixAI: https://github.com/robertollweb/matrixAI
- Documentación en inglés de MatrixAI: https://github.com/robertollweb/matrixAI/tree/main/docs/en
- Sitio de MatrixAI Studio: https://matrixaistudio.org/about/
- Página de casos (incluye el caso de lluvia): https://matrixaistudio.org/casos
- Datos publicados (CSV): https://matrixaistudio.org/casos/lluvia/lluvia_nombrada.csv
- Manual de verificación (describe las cuatro etapas): https://matrixaistudio.org/manual/proof
