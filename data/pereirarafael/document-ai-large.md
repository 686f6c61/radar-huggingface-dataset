# pereirarafael/document-ai-large

## Resumen

`pereirarafael/document-ai-large` no es un modelo entrenado, sino un repositorio de notas de investigación sobre Document AI publicado por el usuario Rafael Pereira en Hugging Face. La propia model card lo declara de forma explícita: contiene motivación, trabajo relacionado, una hipótesis falsable y un plan de evaluación, y "no se presenta como un artículo completado ni como una release de modelos entrenados". El contenido principal es un único artefacto de texto, `reading.md`, acompañado de un `README.md`.

A pesar del nombre y de la etiqueta `safetensors`, no hay pesos utilizables, ni `config.json`, ni código de inferencia, ni pipeline declarado. Los metadatos reportan 16.576 "parámetros" totales y un tamaño de repositorio de 0.0 GB, cifras incompatibles con cualquier modelo de lenguaje o de visión utilizable y que, con toda probabilidad, reflejan un tensor residual o un artefacto de los metadatos de subida. El repositorio acumula 12 descargas y 0 "likes" desde su creación el 23 de septiembre de 2026.

Su relevancia es, por tanto, documental y metodológica: sirve como plantilla de protocolo experimental para quien trabaje en extracción de información de documentos, no como componente desplegable. El ámbito que cubre incluye conjuntos de datos concretos del dominio (FUNSD, SROIE y CORD), una propuesta de comparación contra baselines emparejados y una lista de comprobaciones de reproducibilidad, modos de fallo y preguntas abiertas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible; la etiqueta `transformer` aparece en los metadatos, pero el repositorio no incluye configuración, código ni definición de arquitectura |
| Parametros totales | 16.576 según los metadatos de safetensors; no corresponde a un modelo entrenado publicable, dado que el tamaño del repositorio es de 0.0 GB |
| Parametros activos | no aplica (no se declara una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; no se publican pesos GGUF, AWQ, GPTQ ni ninguna otra variante cuantizada |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (solo como etiqueta del repositorio); los artefactos reales son Markdown: `reading.md` y `README.md` |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura en el repositorio. La etiqueta `transformer` figura entre los tags de Hugging Face, pero no va acompañada de fichero de configuración, implementación de referencia ni especificación de capas, atención o tokenizador. Tampoco existe un `tokenizer.json`, un `generation_config.json` ni ningún artefacto que permita instanciar el supuesto modelo. La cifra de 16.576 parámetros registrada en los metadatos es varios órdenes de magnitud inferior a la de cualquier transformer funcional, incluso los más pequeños del ecosistema.

En cuanto al entrenamiento, el repositorio no documenta ninguna fase: no hay número de tokens, composición del dataset, ni procesos de ajuste como RLHF, DPO o SFT. El autor indica explícitamente que las secciones marcadas como planes o hipótesis no deben interpretarse como resultados experimentales, y que si en el futuro se añaden resultados deberán incluir versiones de dataset, comandos, semillas, hardware y registros en bruto. La contribución real es un plan de evaluación con comparaciones contra baselines emparejados y un análisis de confusores potenciales, apoyado en los corpus FUNSD, SROIE y CORD como contexto concreto de evaluación.

## Capacidades

- No expone ninguna capacidad de inferencia: no hay generación de texto, razonamiento, código, matemáticas ni visión, porque no se publica un checkpoint.
- No soporta `tool calling` ni `function calling`; no existe plantilla de chat ni formato de mensajes.
- No soporta flujos de agentes ni razonamiento multi-paso.
- No declara capacidades multilingües; el campo de idiomas está vacío.
- Lo que sí ofrece es contenido documental: definición del alcance de una pregunta de investigación sobre Document AI, identificación de confusores probables, propuesta de comparación con baselines emparejados y un plan de evaluación.
- Referencias operativas a conjuntos de datos del dominio: FUNSD (comprensión de formularios escaneados), SROIE (extracción de recibos) y CORD (recibos en indonesio), citados como contexto de evaluación.
- Lista de comprobaciones de reproducibilidad, modos de fallo conocidos y preguntas abiertas, útil como checklist metodológica.

## Casos de uso

- Diseño de un protocolo de evaluación en Document AI: el `reading.md` ofrece una hipótesis falsable y un esquema de comparación contra baselines emparejados, lo que permite reutilizarlo como punto de partida antes de lanzar experimentos propios.
- Selección de conjuntos de datos: las referencias a FUNSD, SROIE y CORD sirven para acotar el benchmark inicial de un proyecto de extracción de campos en formularios y recibos, evitando elegir corpus por popularidad en lugar de por adecuación a la tarea.
- Revisión de confusores experimentales: la nota identifica confusores probables en estudios de Document AI, lo que resulta útil para auditar un diseño experimental antes de invertir cómputo en entrenamientos.
- Plantilla de documentación para equipos de investigación: la estructura (motivación, trabajo relacionado, hipótesis, plan de evaluación, modos de fallo) puede copiarse como esqueleto de notas internas en un laboratorio.
- Verificación de reproducibilidad: la exigencia de registrar versiones de dataset, comandos, semillas, hardware y registros en bruto funciona como lista de verificación para preparar una release metodológicamente sólida.
- Punto de entrada bibliográfico: el repositorio recopila referencias relevantes del dominio que permiten orientar una revisión de literatura inicial antes de consultar fuentes primarias.
- Auditoría de expectativas: sirve como caso concreto de repositorio etiquetado como modelo que en realidad contiene documentación, útil para ilustrar por qué conviene inspeccionar los ficheros antes de integrar un artefacto de Hugging Face en un pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explícita que la nota "no reclama mejoras de benchmark, ablaciones completadas, código publicado ni un checkpoint entrenado", por lo que cualquier cifra atribuida a este repositorio sería inventada.

## Requisitos de hardware

- VRAM para inferencia: no aplica; no existe modelo que cargar.
- GPU recomendadas: no disponible; no hay requisitos declarados.
- Compatibilidad con GPU de consumo: irrelevante, ya que no se publica ningún peso ejecutable.
- Opciones de despliegue: ninguna. vLLM, llama.cpp, Ollama, TGI y transformadores de Hugging Face no pueden cargar el repositorio por ausencia de `config.json`, tokenizador y ficheros de pesos coherentes.
- Latencia y throughput: no disponible.
- Huella de almacenamiento: 0.0 GB según los metadatos; únicamente ficheros Markdown.
- Requisito real de uso: un editor de texto o un visor de Markdown para leer `reading.md`.

## Comparativa con modelos similares

No existe comparación like-for-like posible: este repositorio no contiene un modelo, de modo que comparar parámetros, contexto o rendimiento con alternativas reales carece de sentido. Se incluyen a continuación referencias del ecosistema de Document AI encontradas en la búsqueda web, con la advertencia de que no son equivalentes funcionales a este repositorio.

| Alternativa | Tipo | Parametros | Contexto | Rendimiento | Licencia / disponibilidad |
|---|---|---|---|---|---|
| `pereirarafael/document-ai-large` | Notas de investigación (sin pesos) | 16.576 según metadatos, no utilizable | no disponible | sin benchmarks publicados | MIT; 12 descargas, 0 likes |
| Qwen3.7 Plus | Modelo multimodal propietario o de API, líder en la lista BenchLM de Document AI a 22 de septiembre de 2026 | no disponible | no disponible | 90.3 en la lista de BenchLM | no disponible en la información proporcionada |
| Google Document AI | Plataforma comercial de procesamiento de documentos | no disponible | no disponible | no disponible; incluye prompting a nivel de documento para procesadores personalizados | servicio en la nube, sujeta a condiciones comerciales |
| Modelos evaluados en OfficeQA Pro, OmniDocBench y CC-OCR | Familia de benchmarks de Document AI | no disponible | no disponible | no disponible; cobertura de benchmarks aún en construcción según BenchLM | no disponible |

## Limitaciones y advertencias

- No es un modelo: el repositorio no contiene pesos, configuración ni código de inferencia, pese a que el nombre incluye el sufijo `large` y los tags incluyen `safetensors` y `transformer`.
- La cifra de 16.576 parámetros no debe citarse como tamaño de modelo en ningún trabajo técnico, porque no corresponde a un artefacto entrenado verificable.
- El campo de idiomas está vacío y no se declara ninguna cobertura lingüística.
- El repositorio no aporta resultados experimentales; las secciones de hipótesis y plan no deben confundirse con hallazgos, tal como advierte el propio autor.
- La licencia MIT cubre el contenido del repositorio, pero la model card señala que deben revisarse por separado las condiciones de los datos de origen cuando se utilice junto con datasets externos como FUNSD, SROIE o CORD.
- No hay validación por parte de terceros: 12 descargas y 0 likes implican una ausencia total de revisión comunitaria.
- El campo `pipeline` no está definido, lo que impide invocarlo desde las utilidades de Hugging Face.
- Riesgo de alucinación: no aplica al no haber modelo generativo, pero existe un riesgo análogo de expectativa, ya que las etiquetas del repositorio pueden llevar a un desarrollador a asumir que dispone de un modelo funcional.
- Fecha de creación y actualización muy próximas entre sí (23 de septiembre de 2026, con dos segundos de diferencia), lo que sugiere una subida única sin mantenimiento posterior.
- Antes de integrar cualquier artefacto de este tipo en producción, conviene inspeccionar los ficheros reales del repositorio y no fiarse de los metadatos de parámetros ni de los tags.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/pereirarafael/document-ai-large
- Perfil del autor en Hugging Face: https://huggingface.co/pereirarafael
- BenchLM, mejores modelos de Document AI (septiembre de 2026): https://benchlm.ai/best/document-ai
- Google Cloud, notas de release de Document AI: https://docs.cloud.google.com/document-ai/docs/release-notes
- Visión general de modelos grandes de IA y sus aplicaciones (Springer): https://link.springer.com/article/10.1007/s44267-024-00065-8
- Cool Papers, listado de arXiv cs.AI: https://papers.cool/arxiv/cs.AI
