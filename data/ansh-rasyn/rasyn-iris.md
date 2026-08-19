# ansh-rasyn/rasyn-iris

## Resumen

Rasyn IRIS (también identificado como IRIS/PFB-MAX) es un agente de búsqueda de artículos científicos diseñado específicamente para el benchmark AstaBench PaperFindingBench. Desarrollado por el autor ansh-rasyn, este sistema resuelve el problema de encontrar papers relevantes a partir de consultas complejas con múltiples criterios, un reto habitual en revisión bibliográfica y síntesis de literatura. Su relevancia actual radica en que alcanza una puntuación oficial de 0.386 adjusted-F1 en validación (astabench 0.5.4) con aproximadamente un tercio del coste del sistema de última generación, lo que lo convierte en una alternativa eficiente para tareas de recuperación de información científica.

A diferencia de un modelo de lenguaje monolítico, Rasyn IRIS es un pipeline agéntico que combina recuperación multi-canal, selección basada en un modelo juez y reranking por torneo. No presenta parámetros propios entrenables, sino que orquesta modelos externos (gpt-4o-mini y gpt-5-mini) a través de una arquitectura modular. La licencia es MIT, lo que permite uso comercial y modificación. El repositorio tiene un tamaño declarado de 0.0 GB, consistente con un proyecto de código y configuración, no con pesos de modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema agéntico multi-componente (retrieval + selección + reranking + metadata) |
| Parametros totales | no disponible (no es un modelo único con pesos) |
| Parametros activos | no disponible (no aplica, usa modelos externos) |
| Longitud de contexto | no disponible (depende de los modelos subyacentes) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (hereda las capacidades de gpt-4o-mini y gpt-5-mini, presumiblemente multilingüe) |
| Licencia | MIT |
| Formato de pesos | no aplica (código fuente y configuración, sin pesos) |

## Arquitectura y entrenamiento

Rasyn IRIS no es un modelo entrenado desde cero, sino un sistema compuesto por varios módulos que colaboran para resolver tareas de búsqueda de papers. La arquitectura se divide en cuatro componentes principales:

- **Retrieval multi-canal**: realiza consultas en paralelo por snippet, palabras clave y expansión de citas, fusionando los resultados mediante RRF (Reciprocal Rank Fusion). También admite espejos locales de BM25 o densos si están disponibles.
- **Selección**: un "juez de pool" basado en gpt-4o-mini replica la rúbrica conjuntiva del evaluador de AstaBench, aplicando un peso de decaimiento posicional sobre los criterios generados automáticamente (w_i ~ exp(-0.6 i)), asumiendo que los criterios tardíos son ruido.
- **Reranking**: un torneo listwise con gpt-5-mini opera sobre la banda de puntuaciones disputadas, combinando votos Borda de múltiples pasadas con una democión acotada y mezcla de prioridades.
- **Consultas de metadatos**: ejecución determinista de planes, incluyendo consultas de venue y citas contra un grafo de citas local de 923 millones de aristas (S2) cuando está disponible.

No se documenta un proceso de entrenamiento específico para el sistema; las decisiones de diseño se basan en mediciones experimentales, con un registro de 23 experimentos y seis ejecuciones oficiales en el historial del proyecto. El sistema depende de las APIs de OpenAI para los modelos de selección y reranking.

## Capacidades

- Búsqueda de artículos científicos a partir de consultas complejas con múltiples criterios, replicando la rúbrica de evaluación de AstaBench.
- Recuperación multi-canal con fusión RRF, combinando resultados por snippet, palabras clave y expansión de citas.
- Selección y filtrado de candidatos mediante un juez basado en gpt-4o-mini con ponderación de criterios por posición.
- Reranking listwise mediante torneo con gpt-5-mini, aplicando votación Borda y democión acotada.
- Ejecución determinista de consultas de metadatos (venue, citas) sobre un grafo de citas local cuando se configura.
- Integración con el harness oficial de AstaBench (inspect eval) para evaluación reproducible.
- Soporte de configuración mediante variables de entorno (OPENAI_API_KEY, ASTA_TOOL_KEY, PFBMAX_CITEGRAPH, PFBMAX_PMETA).

## Casos de uso

- **Revisión bibliográfica sistemática**: un investigador puede formular una consulta con criterios específicos (año, método, dataset) y Rasyn IRIS recupera los papers más relevantes de forma estructurada, reduciendo el tiempo de cribado manual.
- **Búsqueda de literatura para meta-análisis**: el sistema permite obtener un conjunto de referencias con alta precisión (adjusted-F1 0.386) para estudios que requieren exhaustividad y control de calidad.
- **Automatización de alertas bibliográficas**: integrado en un pipeline periódico, puede monitorizar nuevas publicaciones y filtrar según criterios predefinidos, emitiendo informes resumidos.
- **Asistente para revisores y editores**: ayuda a identificar papers relacionados con un manuscrito en revisión, verificando solapamiento y novedad.
- **Construcción de bases de datos de referencias**: para proyectos de minería de textos o grafos de conocimiento, el agente puede poblar repositorios con artículos relevantes y sus metadatos de citación.
- **Evaluación comparativa de sistemas de búsqueda**: al ser un participante oficial en AstaBench, sirve como referencia para medir el rendimiento de otros motores de recuperación académica.

## Benchmarks y rendimiento

El autor reporta una puntuación oficial de **0.386 adjusted-F1** en el conjunto de validación de AstaBench PaperFindingBench (versión astabench 0.5.4). Se indica que el coste es aproximadamente un tercio del sistema de última generación, aunque no se proporcionan datos comparativos detallados de otros modelos o sistemas en la información disponible. No se han publicado resultados adicionales de benchmarks (MMLU, HumanEval, etc.) porque el sistema no es un modelo de lenguaje general.

## Requisitos de hardware

- No requiere GPU local para inferencia, ya que las operaciones de selección y reranking se delegan en las APIs de OpenAI (gpt-4o-mini y gpt-5-mini).
- El componente de retrieval y el grafo de citas local (923M aristas) pueden ejecutarse en CPU; se recomienda al menos 16 GB de RAM para manejar el grafo completo.
- Para el grafo de citas, se necesita almacenamiento adicional (el tamaño exacto no se especifica, pero un grafo de ese orden puede ocupar varios GB).
- Opciones de despliegue: ejecución local mediante el harness de AstaBench (inspect eval) o integración en scripts Python con las dependencias del repositorio.
- La latencia depende de la velocidad de las APIs de OpenAI y del tamaño del corpus; no se proporcionan cifras estimadas.

## Comparativa con modelos similares

No se dispone de información sobre sistemas comparables en la misma categoría (agentes de búsqueda de papers para AstaBench). El autor menciona que el coste es un tercio del SOTA, pero no nombra al sistema de referencia. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Dependencia total de las APIs de OpenAI: sin una clave válida y presupuesto, el sistema no funciona; los costes pueden acumularse en uso intensivo.
- Sesgo potencial de los modelos subyacentes (gpt-4o-mini, gpt-5-mini) en la selección y reranking, que puede afectar a la cobertura de papers de ciertas disciplinas o idiomas.
- Riesgo de alucinación en la generación de criterios o en la interpretación de consultas, aunque el diseño con ponderación de posición intenta mitigarlo.
- La puntuación adjusted-F1 de 0.386 es modesta en términos absolutos; el sistema no es perfecto y puede dejar fuera papers relevantes.
- La licencia MIT permite uso comercial, pero el uso de los modelos de OpenAI está sujeto a sus propios términos de servicio.
- La fecha de creación del repositorio (2026-08-19) es futura, lo que sugiere que el proyecto podría estar en fase de desarrollo o que la fecha es incorrecta.
- No se proporcionan garantías de soporte o mantenimiento; el código puede depender de versiones específicas de astabench y de la API de OpenAI.

## Enlaces

- [Repositorio en HuggingFace](https://huggingface.co/ansh-rasyn/rasyn-iris)
- [Rasyn.ai - Marigold (proyecto relacionado)](https://www.rasyn.ai/)
- [Rasyn.tech - Document digitization](https://rasyn.tech/)
- [Iris.ai - AI knowledge foundation](https://iris.ai/)
- [IRIS - Robot learning foundation model](https://humanoid.guide/product/iris/)
