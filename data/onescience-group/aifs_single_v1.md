# OneScience-Group/AIFS_Single_v1

## Resumen

AIFS_Single_v1 es una reproducción del sistema de predicción meteorológica determinista AIFS Single v1.1, desarrollado originalmente por el Centro Europeo de Previsiones Meteorológicas a Medio Plazo (ECMWF). El modelo, publicado por el grupo OneScience, está construido sobre una red neuronal de grafos (GNN) y se ha preentrenado con los datos de reanálisis ERA5, para después ajustarse con datos operativos de asimilación de NWP. Su objetivo es generar pronósticos meteorológicos deterministas a medio plazo, ofreciendo una alternativa basada en aprendizaje profundo a los modelos numéricos tradicionales.

La relevancia de este modelo radica en que democratiza el acceso a una arquitectura de predicción meteorológica basada en IA, con licencia Apache-2.0 y soporte para entrenamiento desde cero con datos ERA5. El repositorio incluye scripts de entrenamiento, inferencia y evaluación, así como pesos preentrenados (aunque la subida de estos pesos se anuncia como "próximamente"). Está orientado a la comunidad científica y a desarrolladores que quieran experimentar con pronósticos meteorológicos basados en GNN sin depender de la infraestructura de ECMWF.

La arquitectura exacta (número de parámetros, profundidad, etc.) no se detalla en la información disponible, pero se sabe que es una GNN que procesa campos meteorológicos sobre una malla, siguiendo el diseño del AIFS original. El modelo se distribuye en formato PyTorch y está pensado para ejecutarse en GPU o DCU (aceleradores chinos), con soporte para CPU en tareas de verificación a pequeña escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Graph Neural Network (GNN) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | zh, en (para documentación y scripts, no para procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (checkpoints .ckpt) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura del AIFS de ECMWF, basada en una red neuronal de grafos (GNN) que opera sobre una malla que representa la superficie terrestre y la atmósfera. La GNN procesa variables meteorológicas (temperatura, viento, presión, humedad, etc.) en múltiples niveles de presión y realiza pasos de pronóstico autoregresivos. El entrenamiento se realiza en dos fases: primero un preentrenamiento con datos de reanálisis ERA5 (proporcionados por el dataset OneScience/ERA5) y después un ajuste fino con datos de análisis operativos de NWP. No se especifican detalles como el número de tokens (en este caso, pasos de tiempo), el tamaño del dataset o si se utilizaron técnicas de RLHF/DPO (que no aplican a este tipo de modelo). La innovación principal es la aplicación de GNNs a la predicción meteorológica, un campo tradicionalmente dominado por modelos físicos numéricos.

## Capacidades

- Generación de pronósticos meteorológicos deterministas a medio plazo (el script de inferencia permite configurar el horizonte de predicción en horas, con un valor por defecto de 24 horas).
- Entrenamiento desde cero con datos ERA5 en formato HDF5.
- Inferencia y evaluación con métricas ACC (anomaly correlation coefficient) y RMSE (root mean square error).
- Visualización de resultados mediante gráficos generados automáticamente.
- Soporte para ejecución en GPU (CUDA) y DCU (aceleradores chinos con DTK).
- Incluye scripts para validación rápida con datos sintéticos, lo que permite verificar el pipeline sin descargar el dataset completo.

## Casos de uso

- Investigación en predicción meteorológica basada en IA: el modelo permite a grupos de investigación reproducir los resultados del AIFS de ECMWF y experimentar con modificaciones en la arquitectura o en los datos de entrenamiento, gracias a su licencia Apache-2.0 y a la disponibilidad de scripts de entrenamiento.
- Generación de pronósticos locales a corto plazo: con los pesos preentrenados (cuando estén disponibles), se pueden generar predicciones deterministas para una región concreta a partir de datos de entrada de ERA5, útil para aplicaciones agrícolas o de gestión de recursos.
- Educación y formación en aprendizaje profundo aplicado a ciencias de la Tierra: el repositorio incluye un modo de validación con datos sintéticos que permite a estudiantes verificar el flujo de datos, entrenamiento e inferencia sin necesidad de grandes recursos computacionales.
- Integración en pipelines de investigación climática: las salidas del modelo (en formato de arrays) pueden alimentar análisis posteriores, como estudios de eventos extremos o evaluación de tendencias, dado que las métricas ACC y RMSE ya están implementadas.
- Benchmarking de hardware: al ser un modelo de GNN relativamente ligero (aunque no se conocen los parámetros), puede usarse para comparar el rendimiento de GPUs y DCUs en tareas de entrenamiento y inferencia meteorológica.
- Desarrollo de sistemas de alerta temprana: combinado con datos en tiempo real, el modelo podría integrarse en sistemas de aviso de fenómenos meteorológicos adversos, aunque su naturaleza determinista limita la incertidumbre cuantificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas comparativas con otros modelos de predicción meteorológica ni métricas de precisión sobre conjuntos de prueba estándar. Se recomienda consultar el paper original de AIFS (arXiv:2406.01465) para obtener datos de rendimiento del modelo original, aunque esta reproducción puede no replicar exactamente esos resultados.

## Requisitos de hardware

- Se recomienda una GPU o DCU para entrenamiento e inferencia completos. La CPU solo es viable para importar el modelo y verificar la conectividad a pequeña escala.
- Para usuarios de DCU, se requiere instalar DTK (versión 25.04.2 o superior) y crear un entorno conda con Python 3.11.
- Para GPU, se recomienda un entorno conda con Python 3.11 y las librerías GCC 12.
- No se especifican requisitos mínimos de VRAM. Dado que es una GNN de pronóstico meteorológico, es probable que necesite al menos 16 GB de VRAM para entrenamiento, pero este dato no está disponible.
- Opciones de despliegue: el repositorio proporciona scripts Python (train.py, inference.py, result.py) que se ejecutan directamente. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de predicción meteorológica basados en IA (como Pangu-Weather, GraphCast o FourCastNet) en términos de parámetros, contexto o rendimiento. La model card no incluye datos comparativos. Se recomienda consultar la literatura científica para obtener comparaciones entre AIFS y estos modelos.

## Limitaciones y advertencias

- Los pesos preentrenados no están disponibles actualmente en el repositorio (se indica que se subirán pronto). Hasta entonces, el usuario debe entrenar el modelo desde cero, lo que requiere acceso a los datos ERA5 y recursos computacionales significativos.
- El modelo es determinista, por lo que no proporciona estimaciones de incertidumbre en las predicciones, a diferencia de los conjuntos probabilísticos.
- No se especifican sesgos conocidos, pero al entrenarse con datos ERA5, que es un reanálisis, puede heredar sesgos de las observaciones subyacentes o de la resolución espacial del propio ERA5.
- El riesgo de alucinación no aplica en el sentido de los modelos de lenguaje, pero el modelo puede generar pronósticos físicamente inconsistentes si se alimenta con datos fuera de distribución.
- La licencia Apache-2.0 permite uso comercial, pero se debe atribuir adecuadamente y no se ofrece garantía.
- El repositorio está orientado a usuarios con conocimientos de Python y de sistemas de predicción meteorológica; la curva de aprendizaje puede ser alta para principiantes.
- No se proporcionan detalles sobre la resolución espacial de las predicciones ni sobre las variables de salida, lo que limita la evaluación de su aplicabilidad a casos concretos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OneScience-Group/AIFS_Single_v1
- Paper original de AIFS: https://arxiv.org/abs/2406.01465
- Dataset ERA5 (OneScience): https://huggingface.co/datasets/OneScience-Group/ERA5
- Repositorio OneScience en GitHub: https://github.com/onescience-ai/OneScience
- Repositorio de skills en GitHub: https://github.com/onescience-ai/oneskills
- Repositorio OneScience en Gitee: https://gitee.com/onescience-ai/onescience
- Repositorio de skills en Gitee: https://gitee.com/onescience-ai/oneskills
