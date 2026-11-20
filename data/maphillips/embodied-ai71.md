# Maphillips/embodied-ai71

## Resumen

`Maphillips/embodied-ai71` no es un modelo de lenguaje entrenado, sino un repositorio de notas de investigación sobre IA encarnada (embodied AI) publicado en Hugging Face bajo la etiqueta `research-notes`. La model card describe explícitamente un artefacto exploratorio: el autor indica que el repositorio recoge el alcance de una pregunta de investigación, confounders probables, una propuesta de comparación con baselines emparejados, contexto de evaluación y comprobaciones de reproducibilidad. No se declara ningún checkpoint entrenado, ningún resultado de benchmark ni código liberado.

El dato técnico más llamativo es el recuento de parámetros del archivo safetensors: 33.088. Este valor es incompatible con un transformer funcional de propósito general y sugiere un tensor residual, un artefacto de serialización o un fichero de prueba. El tamaño del repositorio es de 0,0 GB, lo que refuerza la interpretación de que no contiene pesos de un modelo utilizable para inferencia.

Por tanto, esta ficha documenta un repositorio de notas y no un modelo desplegable. Cualquier evaluación de capacidades, benchmarks o requisitos de hardware carece de sentido técnico en este caso, y así se indica en cada sección. Es relevante ahora únicamente como ejemplo de publicación de material de investigación en el ecosistema Hugging Face y como recordatorio de que la etiqueta `transformer` no implica que exista un transformer entrenado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el tag `transformer` figura en los metadatos, pero no se describe ninguna arquitectura en la model card) |
| Parámetros totales | 33.088 (según safetensors; no corresponde a un modelo funcional) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (fichero presente; contenido no verificable como pesos de modelo) |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura en la documentación disponible. La model card no menciona transformer, MoE, SSM ni arquitectura híbrida; solo enumera los temas que cubren las notas: alcance de la pregunta de investigación, confounders, comparación con baselines emparejados, benchmarks públicos adecuados a la tarea, comprobaciones de reproducibilidad, modos de fallo y preguntas abiertas.

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset, RLHF, DPO ni ninguna innovación técnica. El autor afirma explícitamente que el repositorio "no reclama mejoras en benchmarks, ablaciones completadas, código liberado ni un checkpoint entrenado". El artefacto principal es `notes.md`, y las secciones marcadas como planes o hipótesis no deben interpretarse como resultados experimentales.

## Capacidades

- No se documenta ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües.
- No se documenta ningún modo especial (thinking mode, visión, audio).
- El repositorio contiene material descriptivo sobre evaluación de IA encarnada, no un sistema ejecutable.

## Casos de uso

- Revisión bibliográfica sobre IA encarnada: el fichero `notes.md` puede servir como punto de partida para localizar referencias y preguntas abiertas, aunque el autor advierte que las referencias requieren verificación independiente.
- Diseño de experimentos: las notas proponen una comparación con baselines emparejados y enumeran confounders, lo que puede orientar la planificación de un estudio propio.
- Definición de protocolos de evaluación: la model card menciona benchmarks públicos adecuados a la tarea, útiles como lista de candidatos a revisar.
- Checklist de reproducibilidad: las notas incluyen comprobaciones de reproducibilidad y modos de fallo que pueden reutilizarse como plantilla de revisión.
- Docencia o divulgación: el repositorio ilustra cómo se estructura una propuesta de investigación antes de ejecutarla.
- Auditoría de publicaciones en Hugging Face: sirve como caso de estudio de repositorios etiquetados como modelos que en realidad contienen notas.
- No es adecuado para inferencia, generación de texto, despliegue en producción ni integración en pipelines.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que el repositorio no reclama mejoras en benchmarks ni ablaciones completadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos de modelo utilizables.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el repositorio no contiene un modelo entrenado. Frente a repositorios de notas de investigación convencionales, la diferencia relevante es que este se publica con tags de modelo (`safetensors`, `transformer`) y un recuento de parámetros de 33.088, lo que puede inducir a confusión en búsquedas automatizadas.

| Aspecto | Este repositorio | Modelo de propósito general típico |
|---|---|---|
| Pesos utilizables | No verificables | Sí |
| Contexto definido | No | Sí |
| Benchmarks | Ninguno | Habitualmente publicados |
| Licencia | MIT | Variable |
| Uso en producción | No | Sí |

## Limitaciones y advertencias

- No es un modelo: la model card lo describe como notas de investigación y niega explícitamente la existencia de un checkpoint entrenado.
- El recuento de 33.088 parámetros y el tamaño de 0,0 GB indican que el fichero safetensors no contiene un modelo funcional; no debe intentarse cargarlo como tal.
- Los tags `transformer` y `safetensors` pueden provocar que herramientas de descubrimiento lo clasifiquen erróneamente como modelo desplegable.
- Las secciones de las notas marcadas como planes o hipótesis no son resultados; citarlas como evidencia sería un error metodológico.
- Las referencias y datasets propuestos requieren verificación independiente; el autor lo indica de forma explícita.
- La licencia MIT cubre el repositorio, pero los términos de los datos externos deben revisarse por separado si se reutiliza el material con datasets de terceros.
- No hay información sobre sesgos, alucinación o limitaciones lingüísticas porque no hay sistema generativo que evaluar.
- Riesgo de atribución errónea: citar este repositorio como un modelo de IA encarnada entrenado constituiría una afirmación falsa.

## Enlaces

- Hugging Face: https://huggingface.co/Maphillips/embodied-ai71
- Fichero principal citado en la model card: `notes.md` (dentro del repositorio)
- Documentación: `README.md` (dentro del repositorio)
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
