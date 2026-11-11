# sjrksjek/RAE-archive

## Resumen

RAE-archive es un repositorio de pesos de investigación publicado en Hugging Face por el usuario sjrksjek. No se trata de un modelo de lenguaje, sino de un archivo de checkpoints de entrenamiento del proyecto RAE (programa `baseline_program_v1`, descrito por el autor como un "legacy evidence-scaling program"). Los pesos corresponden a modelos que operan sobre el espacio de características de DINOv2 y que fueron entrenados sobre los conjuntos de datos ImageNet-100 y ADE20K, es decir, tareas de clasificación y segmentación visual.

El repositorio se archivó el 11 de noviembre de 2026 antes de una limpieza local del entorno del autor. Según la model card, contiene únicamente los checkpoints finales, los mejores y los referenciados por registros de métricas; los checkpoints intermedios y las cachés de características regenerables fueron eliminados y no están incluidos. Tampoco se incluyen pesos oficiales de terceros (por ejemplo, DDP Swin-T), que deben obtenerse de sus fuentes originales.

La relevancia de este artefacto es acotada: no es un modelo listo para producción ni un modelo generativo, sino material de archivo para reproducibilidad de investigación en visión por computador. La información pública disponible es muy escasa (sin pipeline declarado, sin idiomas, sin métricas publicadas en la model card), por lo que esta ficha se limita a lo verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en características DINOv2 (modelos sobre el espacio de features de DINOv2); arquitectura concreta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje); no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible en la información proporcionada (repo de 107,2 GB; la model card no detalla formatos) |

## Arquitectura y entrenamiento

La model card indica que los modelos del proyecto RAE se construyen sobre el espacio de características de DINOv2, un extractor visual auto-supervisado. Los checkpoints archivados corresponden al programa `baseline_program_v1`, etiquetado por el autor como "legacy evidence-scaling program", y fueron entrenados sobre ImageNet-100 (clasificación de imágenes en 100 clases) y ADE20K (segmentación semántica de escenas). No se especifican el número de parámetros, la composición exacta del dataset, el número de tokens o imágenes vistas, ni si hubo etapas de ajuste fino supervisado más allá de lo descrito.

El repositorio contiene solo los checkpoints finales, los mejores y los referenciados por los registros de métricas del proyecto. Los checkpoints intermedios y las cachés de características regenerables se eliminaron antes del archivado. Los registros de selección y métricas (archivos `.json`/`.jsonl`) permanecen en el repositorio del proyecto, no en este repositorio de pesos. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) porque no aplican a este tipo de artefacto.

## Capacidades

- Extracción y uso de representaciones visuales derivadas de DINOv2 para tareas de visión por computador.
- Clasificación de imágenes en el conjunto ImageNet-100 (100 clases), según el entrenamiento declarado.
- Segmentación semántica en ADE20K, según el entrenamiento declarado.
- No es un modelo generativo de texto: no soporta generación de lenguaje, razonamiento textual, código ni matemáticas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no aplica.
- Capacidades especiales (modo thinking, visión generativa, audio): no disponibles; la única capacidad documentada es el procesamiento de imágenes vía features DINOv2.

## Casos de uso

- Reproducibilidad de investigación: usar los checkpoints finales y mejores para replicar los resultados del programa `baseline_program_v1` en ImageNet-100 y ADE20K, comparando contra los registros de métricas del repositorio del proyecto.
- Baseline para clasificación de imágenes de 100 clases: servir como punto de partida congelado para experimentos que sustituyan la cabeza de clasificación o el esquema de ajuste fino.
- Segmentación semántica de escenas: emplear los pesos entrenados en ADE20K como referencia para evaluar variantes de decodificadores o estrategias de escalado de evidencia.
- Estudio del espacio de características DINOv2: analizar cómo se comportan los modelos del archivo sobre features preextraídas, dado que las cachés regenerables no están incluidas y deben regenerarse.
- Auditoría de artefactos de investigación: inspeccionar qué se conserva y qué se descarta en un archivado de checkpoints (finales/mejores/referenciados frente a intermedios), útil para diseñar políticas de preservación en proyectos propios.
- Docencia y experimentación controlada: usar un conjunto pequeño y cerrado de checkpoints para prácticas de evaluación de visión por computador sin depender de pesos de terceros, que deben descargarse aparte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a los registros de métricas (`.json`/`.jsonl`) del repositorio del proyecto, que no forma parte de este repositorio de pesos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del tamaño real de los checkpoints, que no se declara. El repositorio completo ocupa 107,2 GB, pero ese tamaño incluye varios checkpoints y no equivale a la huella de un único modelo en memoria.
- GPU recomendadas: no disponible. Para modelos de visión sobre features DINOv2, el requisito depende de la resolución de entrada y del backbone concreto, datos no publicados.
- Compatibilidad con GPU de consumo: no determinable con la información disponible.
- Opciones de despliegue: no documentadas (no se declara pipeline, formato ni framework de inferencia).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|
| RAE-archive (sjrksjek) | Checkpoints de investigación sobre features DINOv2 | ImageNet-100, ADE20K | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| DINOv2 (Meta) | Extractor visual auto-supervisado | Dataset propio a gran escala (no detallado aquí) | Licencia propia de Meta | Pesos oficiales públicos |
| DDP Swin-T | Backbone visual supervisado | No detallado aquí | No disponible en esta ficha | Excluido de este repo; obtener de su fuente original |

No se dispone de datos de rendimiento del modelo archivado que permitan una comparación cuantitativa con DINOv2 o Swin-T; la comparativa se limita a tipo de artefacto, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe evaluarse ni desplegarse como tal; su ámbito es la visión por computador.
- Información pública mínima: sin pipeline declarado, sin idiomas, sin métricas en la model card y sin detalle de formatos de pesos.
- Los checkpoints intermedios y las cachés de características no están incluidos; cualquier reproducción completa requiere regenerar esas cachés.
- Los pesos de terceros (por ejemplo, DDP Swin-T) están excluidos y deben obtenerse de sus fuentes originales, con sus propias licencias.
- Los registros de selección y métricas no están en este repositorio, lo que dificulta auditar la elección de los checkpoints "best" sin acceso al repositorio del proyecto.
- Riesgo de sesgos y alucinación: no aplica en el sentido de modelos generativos, pero los sesgos de los datos de ImageNet-100 y ADE20K (composición, anotación, dominio) se heredan en los pesos.
- Licencia Apache 2.0 declarada, que permite uso comercial; sin embargo, al tratarse de un archivo de investigación sin documentación de procedencia detallada, conviene verificar la cadena de licencias de los datos y de los componentes DINOv2 antes de un uso en producción.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni mantenimiento documentado; el autor lo describe como archivo previo a una limpieza local.

## Enlaces

- Hugging Face: https://huggingface.co/sjrksjek/RAE-archive
- Repositorio del proyecto con registros de métricas (`.json`/`.jsonl`): no disponible en la información proporcionada
- Pesos oficiales de DDP Swin-T: no disponibles en la información proporcionada (deben obtenerse de su fuente original)
- Pesos oficiales de DINOv2: no disponibles en la información proporcionada
- Paper, blog o demo del proyecto RAE: no disponibles en la información proporcionada
