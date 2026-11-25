# Haclarke/study-document-ai

## Resumen

`Haclarke/study-document-ai` no es un modelo de lenguaje entrenado, sino un repositorio de notas de investigación sobre Document AI publicado en Hugging Face bajo licencia CC-BY-4.0. La model card es explícita: contiene un documento `review.md` con el alcance de una pregunta de investigación, confundidores probables, un esbozo de comparación con baselines emparejados, contexto de evaluación (FUNSD, SROIE, CORD), comprobaciones de reproducibilidad y preguntas abiertas. El autor indica que no reclama mejoras de benchmark, ablaciones completas, código publicado ni un checkpoint entrenado.

Los metadatos técnicos son mínimos y no corresponden a un transformer funcional: el recuento de parámetros en safetensors es de 33.088, el tamaño del repositorio es de 0,0 GB y las descargas y likes son cero. El pipeline no está declarado y no se listan idiomas soportados. La etiqueta `transformer` y el formato `safetensors` aparecen en los tags, pero no hay evidencia en la información disponible de que existan pesos utilizables para inferencia.

Su relevancia es, por tanto, documental y metodológica: sirve como plantilla de notas de estudio para quien prepare experimentos de extracción de información en documentos (formularios, recibos, facturas) y quiera partir de un inventario de riesgos y de un plan de evaluación reproducible, no como componente desplegable en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag `transformer` figura en los metadatos, sin detalle de arquitectura en la model card) |
| Parametros totales | 33.088 (recuento de safetensors) |
| Parametros activos | no aplica (no se describe un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (según tags); el contenido principal es `review.md` en Markdown |

## Arquitectura y entrenamiento

La información disponible no describe ninguna arquitectura de red concreta. El repositorio se presenta como un conjunto de notas de lectura y un esbozo de experimento sobre Document AI, con artefactos en Markdown (`review.md` y `README.md`). No se documentan capas, mecanismos de atención, tipo de tokenizador ni configuración de entrenamiento.

No hay datos sobre volumen de tokens de entrenamiento, composición del dataset, fases de preentrenamiento, ajuste supervisado, RLHF o DPO. La model card menciona únicamente datasets de evaluación candidatos (FUNSD, SROIE, CORD) como contexto para un estudio futuro, y subraya que las secciones marcadas como planes o hipótesis no deben interpretarse como resultados experimentales. Tampoco se declaran innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- No se documenta ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión en la información disponible.
- No hay evidencia de soporte de tool calling ni de function calling.
- No se describe soporte para agentes ni razonamiento multi-paso.
- No se declaran capacidades multilingües ni idiomas cubiertos.
- El repositorio aporta, como material de trabajo, un inventario de la pregunta de investigación, confundidores probables, propuesta de comparación con baselines emparejados, contexto de evaluación (FUNSD, SROIE, CORD), comprobaciones de reproducibilidad y modos de fallo.
- No incluye checkpoint entrenado, código de inferencia ni demo.

## Casos de uso

- Planificación de experimentos en Document AI: usar `review.md` como lista de comprobación para definir alcance, confundidores y baselines emparejados antes de entrenar cualquier modelo de extracción de campos en formularios y recibos.
- Diseño de protocolos de evaluación: tomar las referencias a FUNSD, SROIE y CORD como punto de partida para seleccionar datasets, versiones y métricas, verificando siempre las condiciones de uso de los datos originales.
- Revisión metodológica interna: emplear la sección de reproducibilidad (comandos, semillas, hardware, logs crudos) como plantilla para exigir trazabilidad en experimentos de un equipo de investigación.
- Análisis de modos de fallo: partir de la lista de failure modes propuesta para construir una matriz de riesgos en pipelines de digitalización documental antes de comprometer recursos de anotación.
- Formación y lectura guiada: utilizar las notas como material de estudio introductorio para nuevos miembros de un equipo que vayan a trabajar en extracción de información de documentos.
- Documentación de decisiones: enlazar el repositorio como anexo metodológico en propuestas internas, dejando claro que no contiene resultados ni artefactos ejecutables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica que no se reclaman mejoras de benchmark ni ablaciones completas, y que cualquier resultado futuro deberá acompañarse de versiones de dataset, comandos, semillas, hardware y logs crudos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; no hay checkpoint funcional descrito.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; el repositorio no incluye código de servicio ni pesos utilizables según la model card.
- Latencia y throughput: no disponible.
- Espacio en disco: el repositorio ocupa 0,0 GB según los metadatos, coherente con un contenido basado en Markdown.

## Comparativa con modelos similares

No disponible. El repositorio no es comparable con modelos de Document AI desplegables (por ejemplo, modelos de comprensión de documentos con checkpoint publicado), porque no incluye pesos entrenados, pipeline declarado ni resultados. La comparación relevante sería con otras notas de investigación o plantillas metodológicas, para las que no se proporcionan referencias en la información disponible.

## Limitaciones y advertencias

- No es un modelo entrenado: la model card declara explícitamente que no hay checkpoint, código publicado ni ablaciones completas.
- El recuento de 33.088 parámetros en safetensors no corresponde a un modelo de lenguaje funcional; no debe interpretarse como tamaño de un transformer operativo.
- Las secciones de la nota marcadas como planes o hipótesis no son resultados; citarlas como evidencia experimental sería un error metodológico.
- No se declaran idiomas soportados, sesgos conocidos ni tasas de alucinación, porque no hay modelo que evaluar.
- La licencia CC-BY-4.0 cubre el repositorio, pero la model card advierte de que los términos de los datos de origen deben revisarse por separado al usar datasets externos como FUNSD, SROIE o CORD.
- Sin pipeline declarado, sin descargas y sin likes: no hay señal de uso ni de validación por parte de la comunidad.
- No apto para producción: no existen artefactos desplegables ni métricas que respalden un uso comercial.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Haclarke/study-document-ai
- Artefacto principal citado en la model card: `review.md` (dentro del repositorio)
- Documentación del repositorio: `README.md` (dentro del repositorio)
- No se han encontrado en la información disponible enlaces a papers, blogs, repositorios de código ni demos adicionales.
