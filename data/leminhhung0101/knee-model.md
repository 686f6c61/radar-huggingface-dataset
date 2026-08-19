# leminhhung0101/knee-model

## Resumen

El modelo `leminhhung0101/knee-model` es un sistema de clasificación multimodal para resonancia magnética (MRI) de rodilla, desarrollado para la competición RSNA Knee MRI. Su objetivo es predecir 12 hallazgos clínicos simultáneamente (lesiones de ligamentos, meniscos, osteoartritis, derrames, etc.) a partir de series DICOM completas. La arquitectura combina un backbone ConvNeXtV2-Tiny preentrenado en ImageNet con un mecanismo de atención multi-serie por etiqueta, que permite que cada hallazgo aprenda qué series (planos, secuencias) son más relevantes para su detección.

El modelo procesa cada serie como clips 2.5D de tres cortes consecutivos, y agrega información de metadatos (plano anatómico, sensibilidad a fluido, supresión grasa) mediante embeddings. La salida son 12 probabilidades independientes en [0,1], una por etiqueta. Está diseñado para manejar estudios con múltiples series y etiquetas faltantes, enmascarándolas en la pérdida. Su relevancia radica en abordar un problema médico real con una arquitectura que evita el promedio simple de series y aprovecha la información espacial y de secuencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXtV2-Tiny (backbone) + Label-Aware Multi-Series Attention + Label Token Transformer + cabezas vectorizadas |
| Parametros totales | no disponible (backbone ConvNeXtV2-Tiny, ~28M según timm, no confirmado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen: clips 2.5D de 3×224×224) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión médica) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente safetensors o pytorch, no especificado) |

## Arquitectura y entrenamiento

La arquitectura se compone de varias etapas. Primero, cada serie DICOM se convierte en clips 2.5D de tres cortes consecutivos (anterior, central, posterior), que se tratan como imágenes de 3 canales. Todos los clips de un lote se concatenan y pasan una única vez por un backbone ConvNeXtV2-Tiny preentrenado en ImageNet (con global_pool="avg" y sin clasificador). Tras el backbone, una proyección lineal con LayerNorm, GELU y Dropout reduce la dimensionalidad a 384.

El núcleo del modelo es la atención multi-serie por etiqueta: 12 queries aprendidas (una por hallazgo) atienden sobre las características de los clips, condicionadas por embeddings de metadatos (plano anatómico, sensibilidad a fluido, supresión grasa) y sesgos aditivos suaves (priors). Después, un transformer de tokens de etiqueta (2 capas, 8 cabezas) permite que las 12 etiquetas intercambien información. Finalmente, 12 cabezas MLP paralelas producen las probabilidades sigmoide.

El entrenamiento usa GroupKFold sobre StudyInstanceUID para evitar fugas, y las etiquetas manuales sobrescriben las oficiales cuando son válidas. Las etiquetas faltantes se enmascaran en la pérdida. Se aplica gradient checkpointing para ahorrar VRAM. No se usa flip horizontal como aumentación, porque invertir izquierda/derecha alteraría la semántica medial/lateral.

## Capacidades

- Clasificación multiclase de 12 hallazgos de rodilla en MRI: ACL, MCL, meniscos medial y lateral, osteoartritis (medial, lateral, patelofemoral), derrame, sinovitis, quiste de Baker, contusión y fractura.
- Procesamiento de estudios completos con múltiples series (sagital, coronal, axial) y diferentes secuencias (con/sin supresión grasa, sensibilidad a fluido).
- Manejo de etiquetas faltantes (NaN) mediante enmascaramiento en la pérdida, sin tratarlas como negativas.
- Atención selectiva por etiqueta: cada hallazgo aprende qué series son más informativas, en lugar de promediar todas.
- Integración de metadatos de serie (plano, fluido, grasa) como información auxiliar.
- Aumentación con ventana percentil y normalización por cortes, robusta a variaciones de adquisición.

## Casos de uso

- **Diagnóstico asistido de lesiones de rodilla**: el modelo puede predecir simultáneamente 12 hallazgos a partir de un estudio de MRI, ayudando al radiólogo a priorizar casos y reducir errores de lectura. Su salida probabilística permite integrarse en flujos de trabajo de informes estructurados.
- **Triaje de estudios en servicios de radiología**: al clasificar automáticamente la presencia de fracturas, desgarros de ligamentos o derrames, puede ordenar la cola de lectura por urgencia, especialmente en centros con alta carga de trabajo.
- **Segunda opinión automatizada**: los radiólogos pueden comparar sus lecturas con las predicciones del modelo para detectar discrepancias, especialmente en hallazgos sutiles como contusiones óseas o quistes de Baker.
- **Investigación en imagen musculoesquelética**: el modelo sirve como extractor de características o baseline para estudios sobre osteoartritis, biomecánica o correlación entre hallazgos de imagen y resultados clínicos.
- **Desarrollo de pipelines de IA médica**: su arquitectura modular (backbone + atención multi-serie) puede adaptarse a otras tareas de clasificación de MRI con múltiples series, como columna o hombro.
- **Formación de residentes**: las predicciones del modelo pueden usarse como material didáctico para enseñar a interpretar hallazgos de rodilla, mostrando qué series contribuyen más a cada diagnóstico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como AUC, sensibilidad o especificidad, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible, pero al usar ConvNeXtV2-Tiny (≈28M parámetros) y gradient checkpointing, es probable que quepa en GPUs de consumo con 8-12 GB para inferencia, aunque no está confirmado.
- GPU recomendadas: no especificadas. Por el tamaño del backbone, una RTX 3060/4060 o superior sería suficiente para inferencia; para entrenamiento se necesitaría más VRAM (16-24 GB).
- Opciones de despliegue: no se mencionan. Al ser un modelo de visión, podría servirse con TorchServe, ONNX Runtime o TensorRT, pero no hay documentación al respecto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma tarea (clasificación de hallazgos de rodilla en MRI). La competición RSNA Knee MRI tiene otros participantes, pero no se citan en la documentación. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Validación clínica pendiente**: no se aportan resultados de validación externa ni métricas de rendimiento, por lo que no debe usarse en entornos clínicos reales sin una evaluación exhaustiva.
- **Sesgos potenciales**: el modelo se entrena con datos de la competición RSNA, que pueden no representar la diversidad de poblaciones, equipos de MRI o protocolos de adquisición. La generalización a otros centros es incierta.
- **Riesgo de alucinación**: al ser un modelo discriminativo, no genera texto, pero puede producir falsos positivos o negativos en hallazgos sutiles. La salida probabilística debe interpretarse con cautela.
- **Limitaciones de entrada**: requiere series DICOM con metadatos (plano, sensibilidad a fluido, supresión grasa) y un número máximo de series por estudio (por defecto 8). Estudios con más series se filtran, lo que podría perder información relevante.
- **Restricciones de licencia**: la licencia no está especificada, por lo que el uso comercial o la redistribución son inciertos. Se recomienda contactar al autor antes de cualquier uso productivo.
- **Dependencia de preprocesamiento**: el pipeline depende de pasos específicos (ventana percentil, normalización z-score, ordenación por posición física) que deben replicarse exactamente para obtener resultados consistentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/leminhhung0101/knee-model
- No se proporcionan otros enlaces (papers, repositorios, demos) en la información disponible.
