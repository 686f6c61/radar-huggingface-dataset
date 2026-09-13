# elenaromero/document-ai

## Resumen

El repositorio `elenaromero/document-ai` no contiene un modelo de lenguaje entrenado, sino una nota de investigación sobre Document AI publicada en HuggingFace. La propia model card lo declara de forma explícita: "It is not presented as a completed paper or a release of trained models" y "It does not claim benchmark improvements, completed ablations, released code, or a trained checkpoint". El artefacto consiste en dos ficheros de texto, `summary.md` y `README.md`, que organizan motivación, trabajo relacionado, una hipótesis falsable y un plan de evaluación en torno a tareas de comprensión de documentos (FUNSD, SROIE, CORD).

El peso publicado en safetensors contiene 49.600 parámetros totales, una cifra compatible con un tensor de relleno o un marcador de posición más que con un transformer funcional (los modelos de lenguaje más pequeños en uso real superan los cientos de millones de parámetros). El tamaño del repositorio es de 0,0 GB y no se declara pipeline de inferencia, idiomas soportados ni tokenizer, por lo que el artefacto no es ejecutable como modelo.

La relevancia de esta ficha es, por tanto, metodológica: sirve para documentar qué es exactamente este repositorio, evitar que se interprete como un modelo desplegable y aclarar que su licencia CC-BY-4.0 cubre la nota, no unos pesos entrenados. Cualquier evaluación de rendimiento, capacidades o despliegue queda fuera de su alcance declarado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no define arquitectura de red; el tag `transformer` es una etiqueta de HuggingFace, no una especificación técnica) |
| Parámetros totales | 49.600 (dato leído del peso safetensors) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 0,0 GB |
| Artefactos incluidos | `summary.md` (nota principal), `README.md` (documentación) |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-13 |
| Fecha de actualización | 2026-09-13 |

## Arquitectura y entrenamiento

No se ha publicado ninguna arquitectura. El repositorio no describe capas, atención, embeddings, tokenizer, vocabulario ni configuración (`config.json`). El tag `transformer` aparece en los metadatos de HuggingFace, pero la model card no lo respalda con ningún detalle técnico y no debe interpretarse como una declaración de arquitectura implementada.

Tampoco existen datos de entrenamiento: la autora indica explícitamente que no hay ablaciones completadas, ni código liberado, ni checkpoint entrenado, ni mejoras de benchmark reclamadas. Los conjuntos mencionados (FUNSD, SROIE, CORD) se citan como contexto de evaluación propuesto, no como datos consumidos. No consta uso de RLHF, DPO, SFT ni ninguna otra etapa de alineamiento. La sección de reproducibilidad de la nota anticipa que, si en el futuro se añaden resultados, deberán incluir versiones de dataset, comandos, semillas, hardware y logs en bruto.

## Capacidades

- No se ha demostrado ninguna capacidad de inferencia: el repositorio no incluye tokenizer, configuración de modelo ni código de ejecución.
- No hay evidencia de generación de texto, razonamiento, código, matemáticas ni visión.
- No hay soporte declarado de tool calling ni function calling.
- No hay soporte declarado de agentes ni razonamiento multi-paso.
- No hay capacidades multilingües documentadas (el campo de idiomas figura como no disponible).
- El artefacto sí cumple una función documental: estructura una pregunta de investigación sobre Document AI con hipótesis falsable, confounders identificados, baselines emparejados propuestos y un plan de evaluación sobre FUNSD, SROIE y CORD.

## Casos de uso

Los siguientes casos se refieren al uso del repositorio como artefacto de investigación, no a inferencia con un modelo, ya que no existe un modelo funcional:

- Plantilla de diseño experimental: la estructura de `summary.md` (motivación, trabajo relacionado, hipótesis falsable, plan de evaluación) puede reutilizarse como esqueleto para redactar notas de investigación reproducibles en proyectos de Document AI.
- Definición de baselines emparejados: la nota propone comparaciones con baselines emparejados, útil para investigadores que necesiten fijar condiciones de control antes de lanzar experimentos sobre extracción de campos en facturas o recibos.
- Selección de benchmarks de documentos: las referencias a FUNSD, SROIE y CORD sirven como punto de partida para quien deba elegir un conjunto de evaluación de comprensión de documentos, siempre verificando las referencias originales.
- Auditoría de confounders: la enumeración de confounders y modos de fallo ayuda a revisar críticamente un diseño experimental propio antes de ejecutarlo.
- Checklist de reproducibilidad: la exigencia declarada de incluir versiones de dataset, comandos, semillas, hardware y logs en bruto puede adoptarse como política interna de registro experimental.
- Revisión de alcance y limitaciones: el apartado de scope permite a un equipo contrastar si una propuesta interna está sobreprometiendo resultados sobre datos que aún no se han ejecutado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica expresamente que la nota "does not claim benchmark improvements" y que las secciones marcadas como planes o hipótesis no deben interpretarse como resultados experimentales. No procede comparar cifras de MMLU, HumanEval, GSM8K ni métricas de Document AI (F1 por campo, precisión de extracción) porque no existen.

## Requisitos de hardware

- VRAM para inferencia: no aplica; no hay modelo ejecutable. Los 49.600 parámetros en safetensors ocuparían del orden de unos pocos cientos de kilobytes en fp32, pero sin definición de arquitectura no es posible cargarlos como red funcional.
- GPU recomendadas: no disponible, al no existir una ruta de inferencia ni de entrenamiento documentada.
- Compatibilidad con GPU de consumo: irrelevante en el estado actual; cualquier GPU o incluso CPU podría almacenar el fichero de pesos, pero eso no implica capacidad de cómputo útil.
- Opciones de despliegue: no se declara ninguna. No hay evidencia de compatibilidad con vLLM, llama.cpp, Ollama, TGI ni transformers, dado que faltan `config.json`, tokenizer y arquitectura.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. El repositorio no es un modelo entrenado, por lo que no existe una categoría de comparación por tamaño o tarea. No se ha localizado en la información proporcionada ningún otro repositorio comparable de notas de investigación en Document AI con el que establecer una tabla de parámetros, contexto, rendimiento, licencia y disponibilidad.

| Criterio | elenaromero/document-ai | Alternativas comparables |
|---|---|---|
| Parámetros | 49.600 (marcador de posición) | no disponible |
| Contexto | no disponible | no disponible |
| Rendimiento | sin benchmarks publicados | no disponible |
| Licencia | cc-by-4.0 | no disponible |
| Disponibilidad | nota de investigación en HuggingFace | no disponible |

## Limitaciones y advertencias

- No es un modelo: el repositorio es una nota de investigación y su propia model card lo declara. Cualquier uso como modelo de inferencia es un error de interpretación.
- Los 49.600 parámetros no corresponden a un transformer funcional; probablemente son un tensor de relleno. No hay `config.json`, tokenizer ni código de carga.
- Sin datos de entrenamiento, sin ablaciones y sin resultados: no se puede atribuir ninguna capacidad, sesgo medido ni comportamiento empírico al artefacto.
- Riesgo de alucinación: no aplicable al repositorio; sí es un riesgo si alguien extrapola sus hipótesis como conclusiones. La nota advierte que las secciones de plan no son resultados.
- Alcance lingüístico: sin declaración de idiomas. La documentación está en inglés.
- Licencia: CC-BY-4.0 permite uso comercial con atribución, pero cubre únicamente la nota. Los términos de los datasets externos citados (FUNSD, SROIE, CORD) deben revisarse por separado antes de cualquier uso conjunto.
- Trazabilidad: el repositorio no incluye versiones de dataset, semillas, hardware ni logs; la reproducibilidad está pendiente por definición.
- Caducidad de los enlaces: no se han podido verificar referencias externas, ya que los resultados de búsqueda disponibles no contienen material relacionado con Document AI.
- Los resultados de búsqueda web recuperados (páginas de ayuda de YouTube, Zhihu) no guardan relación con el repositorio y no aportan información verificable sobre él.

## Enlaces

- HuggingFace: https://huggingface.co/elenaromero/document-ai
- Fichero `summary.md`: https://huggingface.co/elenaromero/document-ai/blob/main/summary.md
- Fichero `README.md`: https://huggingface.co/elenaromero/document-ai/blob/main/README.md
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- Paper, blog, repositorio de código y demo: no disponibles en la información proporcionada.
