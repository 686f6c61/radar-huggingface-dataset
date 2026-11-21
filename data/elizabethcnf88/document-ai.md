# elizabethcnf88/document-ai

## Resumen

`elizabethcnf88/document-ai` es un repositorio de Hugging Face que, pese a su nombre y a las etiquetas `safetensors` y `transformer`, no contiene un modelo entrenado. La propia model card lo describe como una nota exploratoria de investigación ("research note") sobre Document AI, cuyo artefacto principal es un fichero `reading.md` con el planteamiento del estudio, los posibles factores de confusión, una comparación propuesta con baselines emparejados y los requisitos de reproducibilidad. El autor indica explícitamente que no reclama mejoras de benchmark, ablaciones completas, código liberado ni un checkpoint entrenado.

El dato de "parámetros totales" que reporta la plataforma (33.088) es coherente con un fichero de pesos residual o de prueba, no con un transformer funcional: el tamaño del repositorio es de 0,0 GB y no hay pipeline declarado. Cualquier uso práctico del repositorio como modelo de inferencia es, por tanto, inviable con la información disponible.

La relevancia de esta ficha es fundamentalmente metodológica: sirve como ejemplo de repositorio de investigación que documenta el diseño experimental antes de publicar resultados, y como advertencia sobre cómo las etiquetas automáticas de Hugging Face (`transformer`, `safetensors`) pueden inducir a error al evaluar un artefacto. Los conjuntos de datos que menciona como contexto de evaluación (FUNSD, SROIE, CORD) son estándares en el dominio de comprensión de documentos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio es una nota de investigación, no un modelo entrenado) |
| Parámetros totales | 33.088 (según metadatos de safetensors; no corresponde a un modelo funcional) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (fichero presente en el repo; contenido no verificado como pesos de modelo) |

## Arquitectura y entrenamiento

No se ha publicado información sobre arquitectura, datos de entrenamiento, número de tokens, composición del dataset ni procesos de alineación (RLHF/DPO). La model card declara que el repositorio "no reclama [...] un checkpoint entrenado" y que las secciones marcadas como planes o hipótesis no deben interpretarse como resultados experimentales. El contenido se limita a una nota de lectura (`reading.md`) con el alcance de la pregunta de investigación, los confusores probables, una comparación propuesta con baselines emparejados y los requisitos de reproducibilidad (versiones de dataset, comandos, semillas, hardware y logs en bruto) que deberían acompañar a cualquier resultado futuro.

Los conjuntos de datos citados como contexto de evaluación son FUNSD (comprensión de formularios), SROIE (extracción de recibos) y CORD (recibos de restaurantes). No se especifica qué métricas se emplearían ni qué modelos se compararían.

## Capacidades

- No se ha publicado ninguna capacidad funcional del artefacto: no hay evidencia de generación de texto, razonamiento, código, matemáticas ni visión.
- No hay soporte declarado de tool calling ni function calling.
- No hay soporte declarado de agentes ni razonamiento multi-paso.
- No hay información sobre capacidades multilingües.
- No se declara ningún modo especial (thinking mode, visión, audio).
- El único contenido verificable es documentación metodológica en Markdown.

## Casos de uso

- Revisión metodológica de experimentos de Document AI: el fichero `reading.md` puede usarse como plantilla para documentar el alcance de una pregunta de investigación, los confusores y los criterios de reproducibilidad antes de ejecutar benchmarks.
- Diseño de evaluaciones con FUNSD, SROIE y CORD: la nota propone estos conjuntos como contexto de evaluación, útil para planificar una comparación con baselines emparejados.
- Auditoría de repositorios de Hugging Face: sirve como caso de estudio de cómo las etiquetas automáticas (`transformer`, `safetensors`) no garantizan que el repositorio contenga un modelo utilizable.
- Formación en buenas prácticas de publicación: ejemplo de model card que separa explícitamente hipótesis de resultados y exige logs, semillas y versiones de dataset.
- Referencia para revisiones por pares: los criterios de reproducibilidad descritos pueden citarse en checklists de revisión de artefactos.
- Documentación de limitaciones: la sección de alcance y limitaciones puede reutilizarse como estructura para declarar qué no cubre un estudio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica expresamente que no se reclama ninguna mejora de benchmark ni ablación completada, y que cualquier resultado futuro debería acompañarse de versiones de dataset, comandos, semillas, hardware y logs en bruto.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay un modelo funcional que ejecutar.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No existe un modelo comparable porque el repositorio no contiene un modelo entrenado. Como referencia de dominio, los conjuntos FUNSD, SROIE y CORD se usan habitualmente para evaluar modelos de comprensión de documentos (por ejemplo, familias LayoutLM o Donut), pero la información proporcionada no incluye ninguna comparación concreta ni resultados que permitan establecer una tabla comparativa.

## Limitaciones y advertencias

- El repositorio no contiene un checkpoint entrenado; no es utilizable para inferencia ni para fine-tuning.
- El recuento de 33.088 parámetros y el tamaño de 0,0 GB indican que el fichero safetensors no corresponde a un transformer funcional.
- Las etiquetas `transformer` y `safetensors` son metadatos automáticos y no deben interpretarse como evidencia de un modelo operativo.
- Las secciones de la model card marcadas como planes o hipótesis no son resultados experimentales; citarlas como tales sería un error.
- No hay información sobre sesgos, riesgo de alucinación ni comportamiento lingüístico, al no existir modelo.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero la model card advierte de que los términos de los datos de origen deben revisarse por separado si se usan datasets externos (FUNSD, SROIE, CORD tienen sus propias licencias).
- No apto para producción en ningún escenario de inferencia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/elizabethcnf88/document-ai
- Fichero principal citado en la model card: `reading.md` (dentro del repositorio)
- Documentación del repositorio: `README.md` (dentro del repositorio)
