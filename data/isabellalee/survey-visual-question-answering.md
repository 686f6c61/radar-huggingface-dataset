# isabellalee/survey-visual-question-answering

## Resumen

`isabellalee/survey-visual-question-answering` no es un modelo entrenado, sino un repositorio de notas de investigación (*research notes*) sobre el problema de *Visual Question Answering* (VQA). La propia model card lo declara explícitamente: contiene un `analysis.md` con el alcance de la pregunta de investigación, posibles factores de confusión, una propuesta de comparación con baselines emparejados, contexto de evaluación (VQAv2, GQA, OK-VQA) y comprobaciones de reproducibilidad. No se publica checkpoint entrenado, código de inferencia, resultados de ablaciones ni mejoras de benchmark.

Los metadatos de HuggingFace asignan al repositorio el pipeline `visual-question-answering` y declaran un total de 24.832 parámetros en safetensors, con un tamaño de repositorio de 0,0 GB. Ese volumen de parámetros (veinticuatro mil, no millones) es incompatible con cualquier sistema VQA funcional descrito en la literatura: es coherente con un artefacto de prueba o un fichero residual, no con un modelo utilizable. La licencia es CC-BY-4.0 y el repositorio no declara idiomas soportados.

Su relevancia actual es metodológica, no técnica: ejemplifica una práctica sana de documentación de investigación (separar hipótesis de resultados, exigir dataset, comandos, semillas, hardware y logs crudos antes de publicar cifras). Resulta útil como plantilla y como caso de estudio sobre cómo auditar afirmaciones en repositorios de modelos, pero no debe descargarse esperando un sistema de respuesta visual a preguntas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card solo incluye la etiqueta genérica `transformer`; no se describe ni se implementa ninguna arquitectura) |
| Parametros totales | 24.832 (según metadatos de safetensors; no hay arquitectura publicada que los justifique) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (campo de idiomas vacío en HuggingFace) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (declarado en los tags; el contenido es un artefacto de 0,0 GB sin arquitectura asociada) |
| Tipo de artefacto | notas de investigación; artefacto principal `analysis.md` |
| Pipeline declarado | visual-question-answering |
| Tamaño del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-17 |
| Última actualización | 2026-10-17 |

## Arquitectura y entrenamiento

No hay arquitectura definida. El repositorio no incluye `config.json` con hiperparámetros de un transformer, ni código de modelo, ni tokenizador, ni procesador de imagen. El tag `transformer` de HuggingFace es una etiqueta de clasificación del repositorio, no una descripción de diseño. Los 24.832 parámetros declarados en safetensors no se corresponden con ninguna topología descrita en la model card, y el tamaño de repositorio de 0,0 GB sugiere un fichero mínimo o un residuo de plantilla.

Tampoco existe entrenamiento: la model card afirma que la nota "no reclama mejoras de benchmark, ablaciones completadas, código publicado ni un checkpoint entrenado". El contenido previsto es una propuesta de estudio: definición del alcance de la pregunta de investigación, identificación de confounders, comparación con baselines emparejados y criterios de reproducibilidad. Los conjuntos de datos que se citan como contexto de evaluación son VQAv2, GQA y OK-VQA, pero no se aportan versiones de dataset, comandos, semillas, hardware ni logs, precisamente porque el estudio no se ha ejecutado.

## Capacidades

- No dispone de capacidad de inferencia: no hay pesos con arquitectura asociada, ni tokenizador, ni procesador visual.
- No genera texto, no responde preguntas sobre imágenes, no razona ni ejecuta código.
- No soporta *tool calling* ni *function calling*.
- No soporta flujos de agente ni razonamiento multi-paso.
- No declara capacidades multilingües (el campo de idiomas está vacío).
- Aporta, como documento: delimitación del alcance de una pregunta de investigación en VQA y enumeración de confounders probables.
- Aporta una propuesta de comparación con baselines emparejados y un marco de contexto de evaluación basado en VQAv2, GQA y OK-VQA.
- Aporta una lista de comprobación de reproducibilidad, modos de fallo y preguntas abiertas, además de referencias temáticas.
- No incluye modo *thinking*, visión operativa, audio ni ninguna modalidad ejecutable.

## Casos de uso

- Diseño de un protocolo de evaluación en VQA: usar `analysis.md` como lista de comprobación para fijar versiones de dataset (VQAv2, GQA, OK-VQA), métricas y criterios de emparejamiento de baselines antes de lanzar experimentos. Es adecuado porque el documento está estructurado justo con ese propósito y evita fijar cifras prematuras.
- Pre-registro de un experimento: emplear la propuesta de comparación con baselines emparejados como borrador de pre-registro, añadiendo semillas, hardware y comandos antes de ejecutar. Encaja porque la model card exige explícitamente esos campos para cualquier resultado futuro.
- Auditoría de repositorios de modelos: servir de ejemplo de buena práctica al separar secciones etiquetadas como planes o hipótesis de las que contienen resultados verificados. Útil en revisiones internas de equipos que publican en HuggingFace.
- Plantilla de documentación para grupos de investigación: reutilizar la estructura (alcance, confounders, baselines, contexto de evaluación, reproducibilidad, modos de fallo, preguntas abiertas) como esqueleto de nuevas model cards de proyectos en curso.
- Seminario o docencia en metodología de evaluación: usar el repositorio como caso práctico de por qué no debe interpretarse un pipeline declarado como evidencia de un modelo funcional. Se apoya en la contradicción entre el tag `visual-question-answering`, los 24.832 parámetros y la ausencia de checkpoint.
- Revisión bibliográfica inicial: partir de las referencias temáticas citadas para localizar trabajo previo en VQA antes de construir un estado del arte propio. Adecuado como punto de arranque acotado, no como fuente de resultados.
- Verificación de causas de confusión en estudios VQA: aplicar la lista de confounders propuesta al diseñar el muestreo de un dataset propio, por ejemplo para controlar sesgos de respuesta frecuente o de longitud de pregunta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica de forma explícita que el repositorio no reclama mejoras de benchmark ni ablaciones completadas, y que cualquier cifra añadida en el futuro deberá ir acompañada de versión de dataset, comandos, semillas, hardware y logs crudos.

## Requisitos de hardware

- No hay requisitos de inferencia aplicables: el repositorio no contiene un modelo ejecutable (sin arquitectura, sin tokenizador, sin procesador de imagen).
- VRAM estimada: no disponible. A título puramente aritmético, 24.832 parámetros en fp32 ocuparían del orden de 0,1 MB, pero ese cálculo no corresponde a ningún sistema funcional.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no aplica, al no existir modelo que cargar.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica; ninguna de estas herramientas puede servir el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No es posible establecer una comparativa de rendimiento: el repositorio no es un modelo y la información proporcionada no incluye resultados de ningún sistema VQA comparable. La tabla recoge únicamente los datos verificables del artefacto frente al criterio de "modelo VQA utilizable".

| Criterio | Este repositorio | Modelo VQA de referencia |
|---|---|---|
| Naturaleza | notas de investigación (`analysis.md`) | checkpoint con pesos y código |
| Parámetros | 24.832 declarados en safetensors, sin arquitectura | no disponible en la información proporcionada |
| Contexto | no disponible | no disponible en la información proporcionada |
| Pesos utilizables | no (0,0 GB, sin arquitectura ni tokenizador) | sí, por definición |
| Resultados de benchmark | ninguno declarado | no disponible en la información proporcionada |
| Licencia | cc-by-4.0 | no disponible en la información proporcionada |
| Descargas / adopción | 0 descargas, 0 likes | no disponible en la información proporcionada |

## Limitaciones y advertencias

- No es un modelo: no puede invocarse, desplegarse ni evaluarse como sistema de VQA. Cualquier intento de uso en producción fallará en la carga.
- Los 24.832 parámetros declarados en safetensors no se corresponden con ninguna arquitectura publicada; tratarlos como tamaño de modelo es un error de interpretación.
- Riesgo alto de mala lectura: el pipeline `visual-question-answering` y el tag `transformer` pueden llevar a confundir el repositorio con un checkpoint. La model card advierte que las secciones marcadas como planes o hipótesis no son resultados experimentales.
- Sin tokenizador, sin `config.json` y sin código de preprocesado de imagen; no hay ruta de inferencia reproducible.
- Idiomas no declarados: no hay base para asumir cobertura multilingüe.
- Sesgos conocidos: no documentados. Al no existir modelo entrenado, no hay sesgos de modelo que auditar, pero el documento sí puede arrastrar sesgos de selección bibliográfica no verificados.
- Riesgo de alucinación: no aplica a generación (no hay modelo); sí aplica al riesgo de que un lector atribuya al repositorio conclusiones que solo están esbozadas como hipótesis.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero la propia model card advierte de que los términos de los datos de origen deben revisarse por separado cuando se combina con datasets externos (VQAv2, GQA, OK-VQA tienen condiciones propias).
- Adopción nula (0 descargas, 0 likes) y actualización única el mismo día de creación: no hay evidencia de revisión por pares ni de mantenimiento.
- Los resultados de búsqueda web disponibles no contienen información sobre este repositorio ni sobre su autora; las coincidencias de nombre son personas e instituciones sin relación verificable.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/isabellalee/survey-visual-question-answering
- No se han encontrado en la búsqueda web enlaces relevantes al modelo: los resultados obtenidos corresponden a páginas no relacionadas (perfil de Arcot Sowmya en UNSW, página de investigación de CTCN, perfil de LinkedIn de Isabella Lee, guía metodológica de Radiology y un informe de McKinsey) y no aportan documentación técnica, paper ni demo del repositorio.
- Paper, blog, repositorio de código y demo: no disponibles en la información proporcionada.
