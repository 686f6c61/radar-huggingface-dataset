# arthurthomaswib/document-ai-study

## Resumen

`arthurthomaswib/document-ai-study` no es un modelo de lenguaje entrenado, sino un repositorio de notas de investigación sobre Document AI publicado en HuggingFace. Según su propia model card, contiene un artefacto principal (`analysis.md`) que organiza motivación, trabajo relacionado, una hipótesis falsable y un plan de evaluación sobre tareas de comprensión de documentos. El autor declara explícitamente que no se trata de un paper completo ni de una publicación de modelos entrenados, y advierte que las secciones etiquetadas como planes o hipótesis no deben interpretarse como resultados experimentales.

El repositorio está etiquetado con `research-notes`, `document-ai`, `transformer`, `safetensors` y licencia `cc-by-4.0`, pero no publica pipeline de inferencia, idiomas soportados, configuración de arquitectura ni pesos utilizables. Los metadatos de safetensors reportan 24.832 parámetros totales, una cifra anómala que resulta incompatible con cualquier transformer funcional y que probablemente refleja un artefacto de prueba o un recuento erróneo, no un modelo real. El tamaño del repositorio es de 0,0 GB.

Su relevancia es fundamentalmente metodológica: sirve como ejemplo de ficha que documenta un plan de evaluación reproducible (con mención explícita a FUNSD, SROIE y CORD) y como recordatorio de que una etiqueta `transformer` o `safetensors` en el Hub no implica la existencia de un modelo desplegable. Cualquier lector que llegue buscando un modelo de Document AI debe ser consciente de que aquí no hay checkpoint, código de inferencia ni resultados medidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio se etiqueta como `transformer`, pero no publica definición de arquitectura ni fichero de configuración) |
| Parametros totales | 24.832 según los metadatos de safetensors; cifra anómala e inconsistente con un transformer utilizable |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (según etiquetas); el repositorio no contiene un checkpoint entrenado, con un tamaño de 0,0 GB |
| Pipeline de HuggingFace | no disponible |
| Autor | arthurthomaswib |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (metadato) | 28 de septiembre de 2026 |
| Fecha de actualizacion (metadato) | 28 de septiembre de 2026 |

## Arquitectura y entrenamiento

No se ha publicado ninguna descripción de arquitectura. La etiqueta `transformer` figura en los metadatos del Hub, pero el repositorio no incluye fichero `config.json`, código de modelado, tokenizador ni definición de capas, dimensiones ocultas, número de cabezas de atención o función de activación. Tampoco se documenta si se trataría de un transformer encoder (estilo LayoutLM/BERT), decoder (estilo Donut/Nougat) o encoder-decoder.

Respecto al entrenamiento, la model card indica que no hay checkpoint entrenado ni código liberado, y que no se reclaman mejoras sobre benchmarks, ablaciones completas ni resultados experimentales. Por tanto no hay información sobre volumen de tokens, composición del dataset, uso de RLHF/DPO o innovaciones técnicas como decodificación especulativa o atención lineal. El contenido descrito es un plan: hipótesis falsable, comparación propuesta contra baselines emparejados, contexto de evaluación sobre FUNSD, SROIE y CORD, y comprobaciones de reproducibilidad, modos de fallo y preguntas abiertas. La propia model card establece que, si en el futuro se añaden resultados, deberán incluir versiones de dataset, comandos, semillas, hardware y logs en crudo.

## Capacidades

- Generación de texto: no disponible; el repositorio no contiene pesos ni código de inferencia.
- Razonamiento, código, matemáticas: no disponible.
- Visión o comprensión de documentos: no disponible como capacidad ejecutable. El repositorio únicamente describe el ámbito de una investigación sobre Document AI (FUNSD, SROIE, CORD) en forma de plan.
- Tool calling / function calling: no disponible; no se documenta ningún esquema de herramientas ni plantilla de chat.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el campo de idiomas no está informado.
- Capacidades especiales (modo thinking, audio, visión): no disponibles.
- Capacidad real verificable: documentación de un plan de investigación reproducible, con estructura de hipótesis, baselines emparejados, contexto de evaluación y preguntas abiertas.

## Casos de uso

- Planificación de un estudio sobre Document AI: el repositorio sirve como plantilla para redactar motivación, hipótesis falsable y plan de evaluación antes de invertir en cómputo de entrenamiento, evitando publicar resultados prematuros.
- Definición de baselines y controles: la nota propone comparaciones con baselines emparejados, de modo que un equipo puede reutilizar ese esquema para fijar qué modelos y qué ajustes de datos deben compararse en extracción de campos.
- Selección de datasets de evaluación en comprensión de documentos: el documento referencia FUNSD (formularios escaneados), SROIE (recibos) y CORD (tickets de compra), lo que permite a un equipo partir de conjuntos ya conocidos para tareas de key information extraction.
- Auditoría de reproducibilidad: la model card exige que cualquier resultado futuro incluya versiones de dataset, comandos, semillas, hardware y logs; es directamente utilizable como checklist interno para revisiones de experimentos.
- Formación y onboarding de investigadores junior: al separar explícitamente planes de resultados, funciona como material didáctico sobre buenas prácticas de comunicación científica en repositorios de modelos.
- Evaluación de procedencia de artefactos en el Hub: sirve como caso práctico para formar a un equipo en distinguir un repositorio de notas de un modelo desplegable, revisando campos como pipeline, tamaño del repo, recuento de parámetros y presencia de configuración.
- Revisión de licencias en pipelines con datos externos: la nota recuerda expresamente que los términos de los datos de origen deben revisarse por separado cuando el repositorio se usa con datasets externos, algo aplicable a proyectos de Document AI con corpus propietarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el repositorio no reclama mejoras sobre benchmarks, no contiene ablaciones completas y no publica resultados experimentales. No se dispone de datos de MMLU, HumanEval, GSM8K ni de métricas de Document AI como F1 en FUNSD, SROIE o CORD.

## Requisitos de hardware

- VRAM para inferencia: no disponible. Al no existir un checkpoint entrenado utilizable, no hay requisitos de memoria asociados a un modelo desplegable.
- Cómputo sobre el artefacto publicado: si los 24.832 parámetros reportados por los metadatos de safetensors correspondieran a un tensor real, su tamaño en fp32 sería de aproximadamente 99 KB (unos 0,1 MB), es decir, ejecutable en CPU sin GPU y con huella de memoria despreciable. Esta cifra no describe un modelo funcional.
- GPU recomendadas: no aplicable. No hay modelo que servir, por lo que no procede recomendar A100, H100 ni RTX 4090 para este repositorio.
- Compatibilidad con GPU de consumo: no aplicable, por ausencia de pesos. Cualquier fichero del orden de decenas de miles de parámetros cabría en cualquier GPU de consumo e incluso en CPU.
- Opciones de despliegue: no disponibles. El repositorio no incluye integración con vLLM, llama.cpp, Ollama, TGI ni ningún otro servidor de inferencia, ni un pipeline declarado en el Hub.
- Latencia y throughput: no disponibles, al no existir artefacto ejecutable que medir.
- Para experimentar realmente con Document AI habría que recurrir a modelos con pesos publicados y pipelines de visión-documento, que quedan fuera del alcance de este repositorio.

## Comparativa con modelos similares

No se dispone de modelos comparables en la misma categoría: el artefacto es un repositorio de notas de investigación y no un modelo con pesos, por lo que una comparación de parámetros, contexto o rendimiento con modelos de Document AI no es metodológicamente posible. La tabla siguiente recoge únicamente lo que puede afirmarse con la información proporcionada.

| Criterio | document-ai-study | Modelos de Document AI con pesos publicados |
|---|---|---|
| Naturaleza del artefacto | Notas de investigación (hipótesis y plan de evaluación) | Modelos entrenados con checkpoint |
| Pesos publicados | No (repositorio de 0,0 GB) | No disponible en la información proporcionada |
| Parámetros | 24.832 según metadatos de safetensors (valor anómalo) | No disponible en la información proporcionada |
| Contexto | no disponible | No disponible en la información proporcionada |
| Licencia | cc-by-4.0 | No disponible en la información proporcionada |
| Resultados medidos | Ninguno declarado | No disponible en la información proporcionada |
| Uso en producción | No aplicable | No disponible en la información proporcionada |

## Limitaciones y advertencias

- No es un modelo: el repositorio no contiene checkpoint, código de inferencia, tokenizador ni configuración. La etiqueta `transformer` y la presencia de metadatos safetensors no convierten el artefacto en un modelo desplegable.
- Recuento de parámetros anómalo: los 24.832 parámetros reportados no son plausibles para un transformer entrenado sobre documentos; hay que tratarlos como un dato probablemente erróneo o correspondiente a un tensor de prueba.
- Tamaño del repositorio de 0,0 GB: coherente con la ausencia de pesos, y contradictorio con cualquier expectativa de uso en inferencia.
- Riesgo de alucinación no evaluable: al no existir pesos, no puede caracterizarse el comportamiento generativo; no hay datos sobre sesgos, tasas de error o modos de fallo observados.
- Idioma y cobertura: los campos de idiomas no están informados, por lo que no puede asumirse soporte multilingüe.
- Fechas de metadatos anómalas: creación y actualización registradas el 28 de septiembre de 2026, posteriores a la fecha habitual de consulta; conviene verificarlas antes de citar el repositorio.
- Alcance limitado del contenido: la nota se declara explícitamente exploratoria y no reclama mejoras de benchmark, ablaciones completas, código liberado ni checkpoint entrenado. Las secciones marcadas como planes no deben citarse como resultados.
- Licencia: `cc-by-4.0` permite uso comercial con atribución, pero la propia model card advierte de que los términos de los datos de origen deben revisarse por separado cuando se combine con datasets externos. Esta advertencia es especialmente relevante en Document AI, donde los corpus de formularios y recibos suelen tener condiciones propias.
- Sin garantías de mantenimiento: 0 descargas y 0 likes, sin pipeline declarado, lo que indica que no hay validación por parte de la comunidad ni evidencia de actualizaciones posteriores.
- Riesgo de confusión en producción: integrar este identificador como si fuera un modelo en un pipeline provocaría fallos inmediatos por ausencia de artefactos de inferencia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/arthurthomaswib/document-ai-study
- Otro repositorio del mismo autor (aprendizaje eficiente en datos): https://huggingface.co/arthurthomaswib/paper_005423786_data_efficient_learning
- Otro repositorio del mismo autor (fine-tuning de generación): https://huggingface.co/arthurthomaswib/generation-finetuning
- Estudio sobre envenenamiento de datos con pocas muestras (Anthropic, UK AI Security Institute y Alan Turing Institute): https://www.anthropic.com/research/small-samples-poison
- Leaderboard de modelos para comprensión de documentos: https://arena.ai/leaderboard/document
