# Carmenhn6650/embodied-ai

## Resumen

El repositorio `Carmenhn6650/embodied-ai` no contiene un modelo de lenguaje entrenado, sino una nota de investigación (research note) sobre inteligencia artificial encarnada (embodied AI). El artefacto principal es `notes.md`, que organiza la motivación del problema, el trabajo relacionado, una hipótesis falsable y un plan de evaluación. La model card es explícita al respecto: no se presenta como un paper completado ni como una release de modelos entrenados, y no incluye código ni checkpoint.

El repositorio está publicado por el usuario Carmenhn6650 bajo licencia CC-BY-4.0 y lleva las etiquetas `research-notes` y `embodied-ai`. Aunque los metadatos de Hugging Face declaran `safetensors` y `transformer`, el tamaño del repositorio es de 0.0 GB y el recuento de parámetros en safetensors es de 33.088, una cifra que no corresponde a un transformer funcional sino, con toda probabilidad, a un artefacto residual o a los propios ficheros de configuración. No hay pipeline declarado, no hay idiomas declarados y no consta ninguna descarga ni interacción.

Su relevancia actual es documental, no técnica: sirve como plantilla de planificación de investigación en embodied AI (definición de alcance, confounders, baselines emparejados, benchmarks públicos y comprobaciones de reproducibilidad), pero no debe evaluarse como un modelo desplegable. Cualquier uso en producción o comparación de rendimiento con modelos reales carece de sentido con los datos disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (los metadatos declaran `transformer`, pero el repositorio no contiene un modelo) |
| Parametros totales | 33.088 (según safetensors; no corresponde a un modelo funcional) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (declarado en metadatos; el repositorio ocupa 0.0 GB) |

## Arquitectura y entrenamiento

No hay arquitectura de modelo que describir. El repositorio contiene una nota de investigación (`notes.md`) y su documentación (`README.md`); la model card indica que no se ha publicado ningún checkpoint entrenado, ningún código y ninguna ablación completada. Los tags de Hugging Face incluyen `transformer` y `safetensors`, pero el contenido real no respalda un artefacto de ese tipo: el tamaño del repositorio es de 0.0 GB y el recuento de 33.088 parámetros es incompatible con un transformer utilizable.

Tampoco hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación (RLHF, DPO). La nota se limita a proponer una hipótesis falsable, una comparación con baselines emparejados y un contexto de evaluación con benchmarks públicos nombrados en el documento principal, además de comprobaciones de reproducibilidad y modos de fallo. En caso de añadirse resultados en el futuro, la propia model card exige incluir versiones de dataset, comandos, semillas, hardware y logs en bruto.

## Capacidades

- No se ha publicado ningún modelo con capacidades de inferencia; no hay generación de texto, razonamiento, código ni matemáticas que evaluar.
- No hay soporte declarado de tool calling ni function calling.
- No hay soporte declarado de agentes ni de razonamiento multi-paso.
- No hay capacidades multilingües declaradas (el campo de idiomas figura como no disponible).
- No hay capacidades especiales (thinking mode, visión, audio) ni evidencia de ellas.
- La única capacidad verificable del repositorio es documental: estructurar una propuesta de investigación en embodied AI con motivación, trabajo relacionado, hipótesis, plan de evaluación y referencias.

## Casos de uso

- Plantilla de planificación de investigación: usar `notes.md` como esqueleto para redactar una propuesta interna sobre embodied AI, con secciones de motivación, hipótesis falsable y criterios de evaluación.
- Revisión de literatura de partida: las referencias y datasets propuestos en la nota sirven como punto de entrada para verificar el estado del arte antes de diseñar experimentos propios.
- Definición de baselines emparejados: el documento propone comparaciones con baselines emparejados, útil para equipos que necesitan justificar su diseño experimental ante revisores.
- Checklist de reproducibilidad: las exigencias de la model card (versiones de dataset, comandos, semillas, hardware, logs en bruto) pueden adoptarse como plantilla de buenas prácticas en un laboratorio.
- Formación y docencia: material de lectura para cursos o seminarios sobre metodología de investigación en IA encarnada, incidiendo en la distinción entre planes, hipótesis y resultados.
- Auditoría de confounders: la sección de confounders y modos de fallo puede reutilizarse para revisar críticamente diseños experimentales ajenos en robótica y agentes embodied.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la nota no reclama mejoras en benchmarks, ablaciones completadas, código publicado ni checkpoint entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos de modelo que cargar.
- GPU recomendadas: no aplica.
- Ejecución en GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica; el repositorio solo contiene Markdown.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el repositorio no contiene un modelo entrenado, sino una nota de investigación. La comparación con LLM o sistemas embodied desplegables no sería metodológicamente válida.

## Limitaciones y advertencias

- No es un modelo: no debe tratarse como un checkpoint ni integrarse en pipelines de inferencia.
- Los metadatos de Hugging Face (`transformer`, `safetensors`, 33.088 parámetros) no se corresponden con el contenido real del repositorio y pueden inducir a error en búsquedas automatizadas.
- El repositorio ocupa 0.0 GB y no incluye código, datos ni resultados experimentales.
- Las secciones etiquetadas como planes o hipótesis no deben interpretarse como resultados; la propia model card lo advierte.
- No hay información sobre sesgos, alucinación o limitaciones idiomáticas porque no hay modelo que evaluar.
- Licencia CC-BY-4.0: permite uso comercial y obras derivadas con atribución, pero los términos de los datasets externos citados deben revisarse por separado.
- Sin descargas ni interacciones registradas: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Carmenhn6650/embodied-ai
- No se han encontrado en la búsqueda web papers, blogs, repositorios de código ni demos adicionales asociados a este repositorio.
