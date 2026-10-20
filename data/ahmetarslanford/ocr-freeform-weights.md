# AhmetArslanford/ocr-freeform-weights

## Resumen

`AhmetArslanford/ocr-freeform-weights` no es un modelo entrenado, sino un repositorio de notas de investigación sobre "OCR Freeform" publicado por el usuario AhmetArslanford en HuggingFace. La propia model card lo declara de forma explícita: "no se presenta como un artículo completado ni como el lanzamiento de modelos entrenados". El artefacto principal es un fichero `review.md` que organiza motivación, trabajo relacionado, una hipótesis falsable y un plan de evaluación; no hay código, no hay checkpoint funcional y no se han publicado resultados.

El recuento de parámetros que reporta el Hub a partir de los tensores en safetensors es de aproximadamente 33 088 parámetros, un orden de magnitud compatible con un fichero de prueba o un tensor auxiliar, no con un modelo de lenguaje o de visión utilizable. El tamaño del repositorio es de 0,0 GB y las métricas de uso son marginales (11 descargas, 0 likes) desde su creación el 20 de octubre de 2026.

Su relevancia, por tanto, no está en el rendimiento sino en el formato: ejemplifica una práctica creciente de publicar notas de investigación y planes de evaluación reproducibles en el Hub, con disciplina explícita sobre qué es un plan y qué es un resultado. Para un desarrollador que busque un OCR open weights real, este repositorio no es la vía; para un investigador que quiera una plantilla de protocolo de evaluación sobre FUNSD, SROIE y CORD, sí puede ser un punto de partida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Los tags del Hub indican `transformer` y `safetensors`, pero la model card no describe ninguna arquitectura de modelo; el contenido es una nota de investigación |
| Parametros totales | 33 088 parametros segun el recuento de safetensors del repositorio (insuficiente para un modelo funcional de OCR o de lenguaje) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se publican pesos de inferencia ni variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Safetensors (unico formato presente; no hay GGUF, ONNX ni binarios PyTorch) |
| Tamano del repositorio | 0,0 GB |
| Pipeline declarado | No disponible |
| Descargas / likes | 11 / 0 |
| Fecha de creacion | 2026-10-20 |

## Arquitectura y entrenamiento

No hay arquitectura que describir. El repositorio contiene dos ficheros, `review.md` (artefacto principal) y `README.md`, y el recuento de 33 088 parámetros en safetensors no se corresponde con ningún transformer de OCR conocido ni con un extractor de características mínimamente operativo. El tag `transformer` parece una etiqueta de clasificación temática del Hub, no una descripción de la topología del checkpoint.

En cuanto al entrenamiento, la model card es explícita: no se ha publicado ningún entrenamiento, no hay ablaciones completadas, no hay código liberado y no hay checkpoint entrenado. Lo que sí documenta la nota es un plan: planteamiento del problema, confusores probables, propuesta de comparación con baselines emparejados, contexto de evaluación concreto sobre los conjuntos FUNSD, SROIE y CORD, comprobaciones de reproducibilidad, modos de fallo y preguntas abiertas. El propio autor advierte que las secciones marcadas como planes o hipótesis no deben interpretarse como resultados experimentales y que, si en el futuro se añaden resultados, deberán incluir versiones de dataset, comandos, semillas, hardware y logs en bruto.

## Capacidades

- No se ha publicado ningún checkpoint funcional, por lo que no hay capacidades de inferencia verificables: no genera texto, no transcribe documentos, no procesa imágenes.
- No hay soporte de tool calling ni function calling (no existe runtime asociado).
- No hay capacidades de agente ni de razonamiento multi-paso.
- No hay soporte multilingüe declarado ni evaluado.
- La capacidad real del artefacto es documental: estructura una hipótesis falsable sobre OCR freeform, propone baselines emparejados y define un protocolo de evaluación reproducible.
- Enumera el contexto de evaluación sobre tres conjuntos estándar de comprensión de documentos (FUNSD para formularios escaneados, SROIE para recibos, CORD para tickets de compra), lo que sirve como checklist para terceros.
- Incluye una sección de modos de fallo y preguntas abiertas, útil como guía de riesgos antes de emprender un estudio propio.
- No incluye referencias bibliográficas cerradas ni resultados numéricos citables.

## Casos de uso

- Plantilla de protocolo de evaluación para OCR freeform: sirve para redactar la sección de metodología de un estudio propio, con hipótesis falsable, baselines emparejados y criterios de reproducibilidad ya esbozados.
- Selección de datasets: el documento identifica FUNSD, SROIE y CORD como contexto de evaluación, lo que ahorra tiempo en la fase de diseño experimental a quien aborde extracción de campos en formularios, recibos y tickets.
- Checklist de reproducibilidad en revisión por pares: la exigencia explícita de versiones de dataset, comandos, semillas, hardware y logs en bruto puede reutilizarse como rúbrica interna de un equipo antes de publicar resultados.
- Documentación de modos de fallo: la sección de failure modes y confusores probables es directamente reutilizable en el apartado de limitaciones de un informe técnico sobre pipelines OCR.
- Punto de partida para un estudio comparativo de OCR open weights: la nota sirve como documento de encuadre, que después debe completarse con pesos reales de modelos como los catalogados en los listados de referencia enlazados.
- Formación interna: útil para explicar a un equipo la diferencia entre un plan de evaluación y un resultado experimental, con un ejemplo real publicado en el Hub.
- No es adecuado para ningún caso de uso de inferencia: no hay pesos utilizables, ni API, ni servicio desplegable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que la nota "no reclama mejoras en benchmarks, ablaciones completadas, código liberado ni un checkpoint entrenado", y que las referencias y datasets propuestos son un punto de partida para verificación, no evidencia de que el estudio se haya ejecutado.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica. No existe un modelo funcional que cargar; 33 088 parámetros en safetensors ocupan del orden de kilobytes en cualquier precisión habitual.
- GPU recomendadas: no aplica (ni A100, ni H100, ni RTX 4090 tienen uso aquí).
- Cabe en cualquier GPU consumer y también en CPU, pero no hay nada que ejecutar.
- Opciones de despliegue: no disponibles. No hay compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ni se publican plantillas de chat o tokenizador.
- Latencia y throughput: no disponibles y sin sentido para este artefacto.
- Requisito real: un editor de texto para leer `review.md` y acceso a los datasets FUNSD, SROIE y CORD si se quiere reproducir el plan propuesto.

## Comparativa con modelos similares

La comparación se establece por categoría de tarea (OCR y document AI con pesos abiertos), no por rendimiento, ya que este repositorio no es un modelo. Los nombres de la columna de alternativas provienen del listado de modelos OCR y document AI de pesos abiertos encontrado en la búsqueda web; los datos numéricos concretos de esas alternativas no están disponibles en la información proporcionada.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AhmetArslanford/ocr-freeform-weights | Nota de investigación, sin checkpoint | 33 088 (safetensors, no funcional) | No disponible | CC-BY-4.0 | Repositorio público, sin pesos utilizables |
| GOT-OCR2 | Modelo OCR open weights | No disponible en la informacion | No disponible | No disponible en la informacion | Catalogado como modelo open-weight |
| Qwen2.5-VL (modo OCR) | Modelo vision-lenguaje open weights | No disponible en la informacion | No disponible | No disponible en la informacion | Catalogado como modelo open-weight |
| Nougat | Modelo de conversión documento a Markdown | No disponible en la informacion | No disponible | No disponible en la informacion | Catalogado como modelo open-weight |
| Florence-2 | Modelo vision unificado | No disponible en la informacion | No disponible | No disponible en la informacion | Catalogado como modelo open-weight |

## Limitaciones y advertencias

- No hay modelo: el repositorio no contiene un checkpoint entrenado ni código de inferencia, pese a que el nombre (`-weights`) y el tag `safetensors` puedan sugerir lo contrario.
- El recuento de 33 088 parámetros es incompatible con cualquier modelo de OCR o de lenguaje utilizable; no debe interpretarse como un modelo pequeño funcional.
- Riesgo de confusión en buscadores y catálogos automáticos: el repositorio puede aparecer indexado como modelo y ser descargado por error en pipelines que filtran por licencia o por formato safetensors.
- La licencia CC-BY-4.0 cubre el contenido del repositorio, pero la propia model card advierte de que los términos de los datos de origen deben revisarse por separado cuando se usen datasets externos (FUNSD, SROIE, CORD tienen condiciones propias).
- No hay evaluación empírica: cualquier cifra que se atribuya a este repositorio sería inventada.
- No hay idiomas declarados, por lo que no puede asumirse cobertura multilingüe en ningún estudio derivado.
- No hay garantía de mantenimiento: última actualización cuatro segundos después de la creación, sin actividad posterior.
- Para producción, debe descartarse por completo como dependencia; su único uso defendible es documental y metodológico.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/AhmetArslanford/ocr-freeform-weights
- Perfil del autor: https://huggingface.co/AhmetArslanford
- Listado de recursos OCR (awesome-ocr-resources, actualización 2026-10-13): https://github.com/ZumingHuang/awesome-ocr-resources/blob/master/updates/2026/2026-10-13.md
- Directorio de modelos open source y open weights: https://github.com/zidniryi/open-source-ai-models
- Leaderboard de modelos OCR y document AI de pesos abiertos (2026): https://presenc.ai/research/best-open-weight-ocr-document-ai-models-2026
