# evanalyzer/cellpose-sam

## Resumen

Cellpose-SAM es un modelo de segmentación de imágenes biológicas que combina la arquitectura Cellpose, especializada en la detección de células, con el mecanismo de atención y los pesos preentrenados de SAM (Segment Anything Model). Lo publica el usuario `evanalyzer` en Hugging Face y resuelve el problema de la segmentación celular genérica en microscopía, una tarea crítica en pipelines de análisis de imagen biomédica donde los métodos clásicos requieren ajuste de parámetros por tipo de imagen.

La relevancia del modelo radica en la combinación de dos enfoques complementarios: Cellpose aporta un entrenamiento específico sobre flujos de gradiente y máscaras celulares, mientras que SAM aporta capacidad de segmentación zero-shot y generalización a dominios visuales amplios. El resultado es un modelo que aspira a segmentar células sin reentrenamiento específico por dataset.

La información pública disponible es muy limitada: la model card no incluye especificaciones técnicas, datos de entrenamiento, benchmarks ni detalles de arquitectura más allá de la licencia BSD-3-Clause. Los datos que figuran a continuación se basan en la información disponible y en el conocimiento general de las arquitecturas Cellpose y SAM, indicando explícitamente cuando un dato no está confirmado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la describe; el nombre sugiere combinación de Cellpose y SAM) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen, sin capacidades lingüísticas declaradas) |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura, el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de ajuste fino como RLHF o DPO (no aplicables en un modelo de segmentación de imagen). Por el nombre del repositorio, cabe inferir una integración de los bloques de Cellpose (encoder/decoder con predicción de flujos y máscaras celulares) con el image encoder de SAM (ViT con atención, típicamente ViT-B, ViT-L o ViT-H en la familia SAM original). No hay confirmación por parte del autor sobre qué variante de SAM se emplea ni sobre el esquema de entrenamiento.

Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o estrategias de destilación. Cualquier afirmación sobre el proceso de entrenamiento sería especulativa y no debe tomarse como dato verificado.

## Capacidades

- Segmentación de imágenes de microscopía: el modelo está orientado a la detección y delineación de células e instancias biológicas.
- Segmentación de instancias: por la herencia de Cellpose, se espera que produzca máscaras por objeto y no solo una máscara binaria global.
- Generalización zero-shot: la integración de SAM sugiere capacidad de segmentar objetos no vistos durante el entrenamiento, aunque no está confirmado por el autor.
- Procesamiento de imágenes 2D: no se documenta soporte para volúmenes 3D ni para vídeo.
- Tool calling / function calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no aplica.
- Capacidades especiales (thinking mode, visión general, audio): no documentadas; el modelo es específico de segmentación celular.

## Casos de uso

- Análisis de imágenes de microscopía de fluorescencia: el modelo puede generar máscaras de células individuales para cuantificar número, área y morfología en experimentos de biología celular, reduciendo el ajuste manual de parámetros que exigen los métodos clásicos.
- Conteo celular automatizado en placas de cultivo: integrado en un pipeline de adquisición de imágenes, permite contar células por campo de forma reproducible y escalable a cientos de imágenes.
- Segmentación en imágenes de tejidos con tinción: útil para separar núcleos y citoplasmas en preparaciones histológicas, siempre que el dominio de imagen se parezca al de los datos de entrenamiento (no verificado).
- Preprocesado para modelos downstream: las máscaras generadas pueden alimentar clasificadores de fenotipo celular o modelos de análisis morfológico en pipelines de cribado de fármacos.
- Anotación asistida en investigación: el modelo puede generar propuestas de máscara que un experto revisa y corrige, acelerando la creación de datasets etiquetados.
- Análisis de alto contenido (high-content screening): con imágenes de múltiples pocillos, el modelo puede segmentar células por condición experimental y alimentar métricas agregadas de respuesta celular.
- Docencia y prototipado: al ser de código abierto con licencia BSD-3-Clause, sirve para construir demos de segmentación sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el autor no publica tamaño del modelo ni pesos).
- GPU recomendadas: no disponible. Si la variante de SAM integrada es ViT-B, una GPU consumer de gama media-alta (RTX 3060 12 GB o superior) podría ser suficiente; si es ViT-H, se requeriría una GPU de 24 GB o más. Esta estimación es orientativa y no está confirmada.
- Cabe en consumer GPU: probablemente sí en el caso de variantes pequeñas de SAM, pero no hay confirmación del autor.
- Opciones de despliegue: no documentadas. Al no publicarse formato de pesos, no se puede confirmar compatibilidad con ONNX Runtime, TorchScript, TensorRT o el ecosistema Cellpose original.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evanalyzer/cellpose-sam | Segmentación celular + SAM | no disponible | Imagen 2D | BSD-3-Clause | Hugging Face, sin descargas registradas |
| Cellpose (original) | Segmentación celular | no disponible en esta ficha | Imagen 2D | BSD-3-Clause (versiones recientes) | GitHub y PyPI, ampliamente usado |
| SAM (Meta) | Segmentación general | ViT-B/L/H (hasta 636 M en ViT-H) | Imagen 2D | Apache 2.0 | Meta AI, ampliamente adoptado |
| SAM 2 (Meta) | Segmentación de imagen y vídeo | no disponible en esta ficha | Imagen y vídeo | Apache 2.0 | Meta AI |

La comparativa se basa en el conocimiento general de estos modelos; el autor de `cellpose-sam` no proporciona métricas ni comparaciones oficiales. La falta de benchmarks impide establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no hay información sobre arquitectura, datos de entrenamiento, tamaño del modelo ni formato de pesos, lo que impide evaluar su idoneidad en producción.
- Sin benchmarks publicados: no se puede verificar su rendimiento frente a Cellpose o SAM en tareas estándar de segmentación celular.
- Sin descargas ni validación comunitaria: el repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de uso real ni de reproducibilidad.
- Riesgo de sobreajuste al dominio: si el modelo se entrenó con un conjunto limitado de tipos de imagen, su generalización a otras modalidades (microscopía de contraste de fases, imagen intravital, etc.) es incierta.
- Riesgo de alucinación de máscaras: como todo modelo de segmentación, puede generar objetos espurios o fusionar instancias en imágenes con bajo contraste o solapamiento celular.
- Licencia BSD-3-Clause: permite uso comercial y modificación con atribución, pero no exime de las obligaciones de la licencia de SAM subyacente si se redistribuyen pesos derivados; conviene revisar la procedencia de los pesos.
- Sin soporte declarado para 3D, vídeo ni imágenes multiespectrales.
- Fecha de creación futura (2026-11-25): el repositorio parece reciente o con metadatos inconsistentes, lo que refuerza la cautela sobre su madurez.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/evanalyzer/cellpose-sam
- Cellpose (proyecto original, referencia): https://github.com/MouseLand/cellpose
- Segment Anything (SAM, Meta AI): https://github.com/facebookresearch/segment-anything
- SAM 2 (Meta AI): https://github.com/facebookresearch/sam2
- Paper de Cellpose: https://www.nature.com/articles/s41592-020-01018-x
- Paper de SAM: https://arxiv.org/abs/2304.02643
