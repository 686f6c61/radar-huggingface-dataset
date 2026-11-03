# PDFluent/pdf-heading-level-classifier

## Resumen

PDFluent heading level classifier (`heading_level_979`) es un modelo de clasificación tabular basado en LightGBM que asigna un nivel de encabezado (1, 2 o 3) a los bloques de encabezado que el SDK de PDFluent ya ha detectado en documentos PDF. No es un modelo de lenguaje ni un transformer: es un conjunto de árboles de decisión potenciados por gradiente que trabaja sobre una fila de características por bloque (tamaño de fuente, posición, bloques vecinos, entre otras), calculadas por el SDK. Lo desarrolla Innovation Trigger B.V. bajo la marca PDFluent.

Su relevancia es práctica y acotada: encaja en el pipeline de conversión de PDF a Markdown estructurado, un paso crítico en la construcción de bases de conocimiento para RAG, donde la jerarquía de secciones determina la calidad del troceado (chunking). El modelo viene compilado dentro del SDK de PDFluent desde la versión 1.3.0 y se ejecuta por defecto, de modo que el usuario no instala ni sirve el modelo por separado.

El repositorio es mínimo (0,0 GB) y contiene únicamente los pesos en `model.json.gz` (volcado JSON comprimido de LightGBM, no ONNX) junto con `manifest.json`, los ficheros de atribución y las licencias. Está entrenado y validado exclusivamente en inglés, y su licencia es AGPL-3.0-only o licencia comercial de PDFluent.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LightGBM (gradient boosted decision trees), clasificación multiclase tabular |
| Parametros totales | no disponible (número de árboles y hojas no publicado; el volcado está en `model.json.gz`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular; una fila de características por bloque de encabezado) |
| Tipos de cuantizacion | no disponible (no aplica cuantización de pesos neuronales) |
| Idiomas soportados | en (inglés) |
| Licencia | AGPL-3.0-only o PDFluent Commercial Licence (`agpl-3.0-only-or-pdfluent-commercial`) |
| Formato de pesos | JSON comprimido con gzip (`model.json.gz`), volcado de `dump_model()` de LightGBM; no es ONNX |
| Pipeline declarado | tabular-classification |
| Clases de salida | `level 1`, `level 2`, `level 3` |
| Entrada | Una fila de características por bloque de encabezado; nombres en `feature_names` (modelo) y `features` (manifest) |
| Integración | Compilado en el SDK de PDFluent desde la versión 1.3.0, activo por defecto |
| Tamaño del repo | 0,0 GB |

## Arquitectura y entrenamiento

El modelo es un clasificador LightGBM de tres clases que opera sobre características tabulares extraídas por el SDK de PDFluent para cada bloque de encabezado: tamaño de fuente, posición y relación con bloques vecinos, entre otras. No procesa texto ni imágenes directamente; depende por completo de la detección de encabezados y de la extracción de características del SDK. El artefacto publicado es el volcado JSON del modelo (`model.json.gz`), que expone `feature_names`, `num_class` y `tree_info`, lo que permite inspeccionar la estructura sin necesidad del SDK.

El entrenamiento se hizo desde cero con papers de arXiv bajo CC BY 4.0 y CC0 1.0, papers de PubMed Central bajo CC BY y páginas sintéticas. Las etiquetas de encabezado provienen de anotaciones de DocLayNet, FinTabNet y PubTables-1M. Los detalles de atribución están en `attribution.json`, `PMC-AUTHORS.json` y `PROVENANCE.md`; no se redistribuyen imágenes de página ni texto de los papers. Los pesos publicados coinciden con los compilados en el SDK 1.3.0, verificables mediante `weights_sha256` en `manifest.json` y los digests de `SHA256SUMS`. Según el autor, las páginas sintéticas no mejoraron el rendimiento, y la validación se realizó únicamente sobre una partición reservada de los mismos datos de desarrollo, no sobre un benchmark sellado e independiente.

## Capacidades

- Asignación de nivel jerárquico (1, 2 o 3) a bloques de encabezado previamente detectados en PDFs.
- Clasificación tabular multiclase con puntuaciones por clase (`level 1`, `level 2`, `level 3`).
- Integración directa en el pipeline de conversión de PDF a Markdown del SDK de PDFluent, que emite encabezados como `#`, `##` y `###`.
- Inspección de pesos y estructura sin SDK mediante `gzip` y `json` sobre `model.json.gz` y `manifest.json`.
- No detecta encabezados por sí mismo: requiere la detección y la extracción de características del SDK.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Sin capacidades multilingües más allá del inglés.

## Casos de uso

- Conversión de PDF a Markdown estructurado: el modelo asigna niveles a los encabezados detectados para que el Markdown resultante conserve la jerarquía de secciones, algo necesario para publicar documentación técnica o papers en formato legible por máquina.
- Construcción de bases de conocimiento para RAG: una jerarquía de encabezados correcta permite trocear el documento por secciones y subsecciones, mejorando la coherencia de los chunks y la precisión de la recuperación.
- Indexación de literatura científica: entrenado con papers de arXiv y PubMed Central, encaja en pipelines que procesan preprints y artículos biomédicos para alimentar buscadores internos o asistentes de revisión bibliográfica.
- Normalización de documentación corporativa: informes y manuales en PDF convertidos a Markdown con estructura consistente para su publicación en wikis, portales o sistemas de documentación.
- Preprocesado para pipelines de extracción de tablas: combinado con modelos como el de reconocimiento de fórmulas de PDFluent, permite reconstruir documentos completos (texto, jerarquía, tablas y fórmulas) antes de un análisis posterior.
- Generación de índices y tablas de contenido automáticas: los niveles asignados permiten derivar un árbol de secciones del documento sin intervención manual.
- Enriquecimiento de metadatos documentales: la jerarquía inferida puede almacenarse como metadatos para búsqueda facetada por sección o capítulo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que la validación se realizó solo sobre una partición reservada de los mismos datos de desarrollo y que no existe un benchmark sellado independiente.

## Requisitos de hardware

- VRAM estimada: no aplica; es un modelo de árboles sobre datos tabulares que se ejecuta en CPU y no requiere GPU.
- GPU recomendadas: no aplica; no hay soporte ni necesidad de aceleración por GPU.
- Cabe en cualquier equipo consumer: el repositorio ocupa 0,0 GB y el volcado JSON comprimido es de tamaño reducido.
- Opciones de despliegue: uso integrado mediante el SDK de PDFluent (`pip install pdfluent`, versión 1.3.0 o superior), que compila el modelo y lo activa por defecto; inspección manual del volcado con `gzip` y `json` en Python.
- No se documentan opciones de servido con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo neuronal.
- Latencia y throughput: no disponibles; al ser un clasificador de árboles sobre pocas características por bloque, la inferencia es de coste bajo, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PDFluent heading level classifier | LightGBM tabular | Asignar nivel 1-3 a encabezados ya detectados | en | AGPL-3.0-only o comercial | HuggingFace, integrado en SDK PDFluent |
| PDFluent formula recognition (ONNX) | Red neuronal ONNX | Reconocimiento de fórmulas | no disponible | no disponible | HuggingFace (misma organización) |
| DocLayNet (anotaciones) | Dataset de layout | Detección de layout y encabezados | en | según el dataset original | Fuente de etiquetas citada por el autor |

No se dispone de información sobre modelos directamente comparables de otros proveedores para esta tarea específica de asignación de nivel de encabezado; el autor no publica comparativas.

## Limitaciones y advertencias

- Solo asigna niveles; no detecta encabezados. Sin la detección y la extracción de características del SDK de PDFluent, el modelo no es útil por sí mismo.
- Validado únicamente sobre una partición reservada de los mismos datos de desarrollo, no sobre un benchmark sellado e independiente; el comportamiento en PDFs no relacionados no está establecido.
- Entrenado con papers de arXiv y PubMed Central y páginas sintéticas; puede generalizar mal a documentos corporativos, formularios, revistas maquetadas o PDFs escaneados.
- Solo en inglés; no se documenta soporte para otros idiomas.
- Las páginas sintéticas no mejoraron el rendimiento según el autor, lo que sugiere poca diversidad de layouts en los datos efectivos.
- Licencia AGPL-3.0-only: el uso comercial sin cumplir las obligaciones de la AGPL requiere la licencia comercial de PDFluent (`https://pdfluent.com/license`).
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de clasificación errónea en layouts atípicos; no se publican métricas de precisión ni matrices de confusión.
- Copyright 2026 Innovation Trigger B.V.; los pesos publicados coinciden con los del SDK 1.3.0, por lo que versiones futuras del SDK podrían divergir del artefacto del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PDFluent/pdf-heading-level-classifier
- Organización en HuggingFace: https://huggingface.co/PDFluent
- Web de PDFluent: https://pdfluent.com
- Documentación: https://pdfluent.com/docs
- Licencia: https://pdfluent.com/license
- SDK (código y releases): https://github.com/pdfluent/pdfluent-sdk
- Modelo de reconocimiento de fórmulas: https://huggingface.co/PDFluent/formula-recognition-onnx
- Dataset de layout ground-truth: https://huggingface.co/datasets/PDFluent/pdf-document-layout-ground-truth
