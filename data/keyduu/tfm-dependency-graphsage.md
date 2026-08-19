# keyduu/tfm-dependency-graphsage

## Resumen

Este repositorio contiene los artefactos experimentales del Trabajo de Fin de Máster (TFM) de keyduu, centrado en la predicción de incompatibilidades de dependencias en el ecosistema PyPI mediante redes neuronales de grafo (GNN). Concretamente, se emplea una arquitectura GraphSAGE temporal para clasificar aristas ordenadas del tipo `pa@va → pb@vb`, es decir, si una versión concreta de un paquete Python es incompatible con otra versión de otro paquete. El problema abordado es relevante porque las dependencias rotas son una causa frecuente de fallos en entornos de desarrollo y despliegue, y un modelo capaz de anticiparlas podría integrarse en herramientas de gestión de dependencias.

El modelo se desarrolla como parte de un trabajo académico y complementa varios repositorios de código y un dataset público en HuggingFace. Aunque no es un modelo de lenguaje ni un sistema productivo, su interés radica en la metodología: aplicar GraphSAGE, un enfoque inductivo para aprendizaje en grafos, a un grafo de dependencias de paquetes. La información disponible no especifica el tamaño del modelo en parámetros, ni la licencia, ni detalles de entrenamiento como número de tokens o dataset de entrenamiento, más allá de que consume un `dataset_mvd_v2.parquet` con splits temporales compartidos con los baselines B1 y B2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GraphSAGE (GNN inductiva) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica, modelo de grafo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de texto) |
| Licencia | no disponible |
| Formato de pesos | `.pt` (PyTorch) |

## Arquitectura y entrenamiento

El modelo implementa una GraphSAGE, una arquitectura de aprendizaje inductivo sobre grafos propuesta por Hamilton et al. (2017). A diferencia de los modelos de lenguaje, no procesa texto sino que genera representaciones vectoriales de nodos (paquetes y versiones) en un grafo de dependencias. La entrada son aristas ordenadas `pa@va → pb@vb`, y la salida es una clasificación de compatibilidad o incompatibilidad. Según la model card, se consume el mismo `dataset_mvd_v2.parquet` y los mismos splits temporales que los baselines B1 (heurística PEP 440) y B2 (modelos tabulares), lo que sugiere un entrenamiento supervisado sobre datos históricos de compatibilidad de PyPI.

No se dispone de detalles sobre el número de capas, la dimensión de los embeddings, la función de pérdida ni el proceso de entrenamiento (épocas, optimizador, etc.). El repositorio de GitHub asociado (`tfm-dependency-graphsage`) contiene el código fuente de la implementación, pero no se ha accedido a él en la búsqueda web, por lo que no se pueden extraer más especificaciones técnicas.

## Capacidades

- Clasificación de incompatibilidades en aristas del grafo de dependencias: predice si una versión concreta de un paquete (`pa@va`) es compatible con otra (`pb@vb`).
- Modelo inductivo: puede generalizar a nodos no vistos durante el entrenamiento, gracias a la arquitectura GraphSAGE.
- Integración con un pipeline de datos temporal: usa splits temporales, lo que permite evaluar la capacidad de generalización en el tiempo.
- Generación de métricas por semilla y comparación con baselines (B1, B2, B3) y con un MLP local, según la estructura de `results/`.
- No soporta tool calling, razonamiento multi-step, ni capacidades de lenguaje natural.

## Casos de uso

- Investigación en dependencias de software: el modelo sirve como referencia para estudiar la viabilidad de GNN en la predicción de incompatibilidades en PyPI, comparando con heurísticas clásicas (PEP 440) y modelos tabulares.
- Detección temprana de conflictos en entornos de desarrollo: aunque no está listo para producción, su salida puede usarse para priorizar la resolución de dependencias en proyectos que gestionan múltiples paquetes.
- Validación de metodologías de aprendizaje temporal en grafos: el uso de splits temporales lo convierte en un caso de estudio para evaluar el rendimiento de modelos inductivos en datos con evolución temporal.
- Generación de métricas comparativas: los checkpoints y resultados por semilla permiten reproducir experimentos y comparar con otras arquitecturas (MLP, baselines tabulares).
- Análisis de errores cualitativos: la carpeta `analysis/` incluye una muestra cualitativa de errores, útil para entender las limitaciones del modelo y mejorar futuras versiones.
- Base para futuros modelos de predicción de dependencias: el artefacto puede ser reutilizado como punto de partida para proyectos que quieran integrar GNN en herramientas de gestión de dependencias (p. ej., `pip`, `poetry`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el repositorio contiene métricas por semilla y comparativas con baselines, pero no se han extraído los valores numéricos. No se dispone de datos de rendimiento (precisión, F1, etc.) ni comparaciones con modelos similares fuera del contexto del TFM.

## Requisitos de hardware

No hay información disponible sobre requisitos de hardware específicos. Dado que es un modelo GraphSAGE de tamaño no documentado y se usa en un contexto académico, es probable que pueda ejecutarse en una GPU de consumo medio, pero no se puede confirmar sin más datos. El repositorio contiene checkpoints `.pt` de PyTorch, por lo que el despliegue requiere un entorno con PyTorch y las dependencias del código original. No se han documentado opciones de despliegue como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el contexto de predicción de incompatibilidades de dependencias mediante GNN. Los baselines mencionados (B1: heurística PEP 440, B2: modelos tabulares, B3: MLP) son los únicos puntos de referencia del propio trabajo, pero no se han publicado sus resultados en la información disponible. Por tanto, la comparativa con alternativas externas no está disponible.

## Limitaciones y advertencias

- Es un proyecto académico experimental, no un modelo listo para producción: no se ha validado en entornos reales de gestión de dependencias.
- La licencia no está especificada, lo que impide su uso comercial o su redistribución sin consultar al autor.
- No se documentan sesgos ni riesgos de alucinación, pero al ser un modelo de clasificación sobre grafos, puede cometer errores de predicción que afecten a la fiabilidad en aplicaciones críticas.
- No se proporciona información sobre la calidad de los datos de entrenamiento ni sobre posibles problemas de desbalanceo de clases.
- El tamaño del repositorio es de 0.0 GB, lo que sugiere que los artefactos son ligeros (checkpoints y métricas), pero no se ha confirmado la estructura completa.
- La fecha de creación (2026-08-19) es posterior a la fecha actual, lo que puede indicar un error en los metadatos o una publicación programada.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/keyduu/tfm-dependency-graphsage
- Código del modelo GraphSAGE: https://github.com/keyduu/tfm-dependency-graphsage
- Repositorio de datos del TFM: https://github.com/keyduu/tfm-dependency-data
- Dataset MVD: https://huggingface.co/datasets/keyduu/pypi-dependency-compatibility-mvd
- Baselines y otros repositorios: https://github.com/keyduu/tfm-dependency-baseline-pep440, https://github.com/keyduu/tfm-dependency-baseline-tabular, https://github.com/keyduu/tfm-dependency-baseline-mlp
- Paper de referencia de GraphSAGE: https://arxiv.org/abs/1706.02216
