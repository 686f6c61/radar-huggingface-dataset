# juliamayu/paper-document-ai

## Resumen

El repositorio `juliamayu/paper-document-ai` no contiene un modelo de inteligencia artificial entrenado, sino un conjunto de notas de investigación y un esbozo experimental sobre el campo de Document AI. Publicado bajo licencia MIT, el repositorio incluye un documento principal (`paper_notes.md`) que aborda el alcance de una pregunta de investigación, posibles factores de confusión, una propuesta de comparación con líneas base emparejadas, y contextos de evaluación concretos como FUNSD, SROIE y CORD. El autor declara explícitamente que no se presentan resultados experimentales, ni checkpoints, ni código liberado.

A pesar de que el repositorio tiene un archivo `safetensors` con 33.088 parámetros, este valor es trivial y no corresponde a un modelo funcional; probablemente se trata de un artefacto residual o un placeholder. La model card insiste en que las secciones etiquetadas como planes o hipótesis no deben interpretarse como resultados. Por tanto, este repositorio es material de referencia para investigadores que quieran entender cómo diseñar un estudio riguroso en Document AI, no un modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo entrenado) |
| Parametros totales | 33.088 (artefacto residual, no funcional) |
| Parametros activos | no aplicable |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors (archivo presente pero sin utilidad real) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El repositorio es un documento de investigación exploratoria. El autor describe el contenido como "notas de lectura y un esbozo de experimento" para Document AI, con énfasis en lo que aún necesita ser probado en lugar de fabricar puntuaciones o afirmaciones de lanzamiento. No se mencionan datos de entrenamiento, tokens, ni técnicas como RLHF o DPO. La única innovación destacable es la propuesta metodológica: definir claramente los confounders, usar líneas base emparejadas y especificar condiciones de reproducibilidad (versiones de dataset, comandos, semillas, hardware y logs crudos) para futuros resultados.

## Capacidades

- No ofrece generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No es un agente ni tiene capacidades de razonamiento multi-paso.
- No tiene capacidades multilingües.
- Su única "capacidad" es documentar un plan de investigación y servir como guía metodológica para estudios de Document AI.

## Casos de uso

- Diseño de experimentos en Document AI: el documento propone una estructura para comparar modelos de extracción de información en documentos escaneados, usando datasets como FUNSD, SROIE y CORD. Un investigador puede usar estas notas como plantilla para su propio estudio.
- Identificación de factores de confusión: el repositorio enumera posibles variables que pueden sesgar evaluaciones en tareas de comprensión de documentos, útil para revisar diseños experimentales existentes.
- Reproducibilidad en investigación: las secciones sobre checks de reproducibilidad y modos de fallo sirven como checklist para quienes publican resultados en Document AI.
- Revisión bibliográfica: las referencias temáticas incluidas en las notas ayudan a localizar trabajos clave sobre el estado del arte en extracción de formularios y facturas.
- Evaluación crítica de benchmarks: el documento discute los límites de FUNSD, SROIE y CORD, lo que permite a desarrolladores elegir métricas adecuadas para sus propios sistemas.
- Formación académica: puede usarse como material de lectura en cursos de procesamiento de documentos y aprendizaje automático aplicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que no hay mejoras de benchmark, ablaciones completadas, código liberado ni checkpoint entrenado. Cualquier número que apareciera en el repositorio sería una hipótesis, no un resultado.

## Requisitos de hardware

- No aplica: no hay modelo que ejecutar.
- El archivo safetensors de 33.088 parámetros es despreciable en tamaño (menos de 1 MB) y no requiere GPU.
- No hay opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) porque no existe un modelo funcional.
- La latencia y el throughput no son relevantes.

## Comparativa con modelos similares

No disponible. No existe un modelo comparable porque este repositorio no es un modelo de IA. En el ámbito de Document AI, los modelos reales serían sistemas como LayoutLM, Donut o los servicios de Google Cloud Document AI, pero no hay datos de rendimiento de este repositorio para comparar.

## Limitaciones y advertencias

- No es un modelo de IA: no puede procesar documentos ni generar salidas.
- El archivo de pesos safetensors es un artefacto residual sin utilidad práctica; no debe cargarse como si fuera un checkpoint.
- Las secciones marcadas como planes o hipótesis no son resultados verificados.
- No hay garantía de que las referencias citadas estén actualizadas o sean exhaustivas.
- La licencia MIT cubre el texto del repositorio, pero los términos de los datasets externos (FUNSD, SROIE, CORD) deben revisarse por separado.
- Para producción, este repositorio no ofrece nada utilizable; es solo documentación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/juliamayu/paper-document-ai
- Google Cloud Document AI (plataforma relacionada con el tema): https://docs.cloud.google.com/document-ai/docs
- Papers AI (herramienta de investigación con IA): https://papers.ai/
- AIPapers.ai (resúmenes diarios de papers de IA): https://aipapers.ai/
- SciSpace AI Detector (herramienta de detección de texto generado): https://scispace.com/ai-detector
- Scribbr AI Detector (similar): https://www.scribbr.com/ai-detector/
