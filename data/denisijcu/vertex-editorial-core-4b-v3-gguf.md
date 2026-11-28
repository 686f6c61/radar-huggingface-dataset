# Denisijcu/vertex-editorial-core-4b-v3-gguf

## Resumen

Vertex-Editorial-Core-4B es un modelo de lenguaje especializado en arquitectura editorial, ingeniería pedagógica de libros técnicos y posicionamiento en Amazon KDP, desarrollado por Vertex Coders LLC (Miami, FL), empresa fundada y dirigida por Denis Sanchez Leyva. Se distribuye exclusivamente en formato GGUF bajo el identificador `Denisijcu/vertex-editorial-core-4b-v3-gguf` y está pensado para inferencia local en hardware de consumo.

El modelo parte de una base Qwen3 de 4B parámetros (4.022.468.096 parámetros totales según los pesos publicados) y se ha ajustado mediante Sequence-Level Knowledge Distillation (SeqKD) a partir de un modelo Teacher de 32B parámetros, concretamente Qwen2.5-32B-Instruct. La especialización se orienta a la generación de estructuras de libros, refactorización de índices, copywriting de lanzamiento y desglose de capítulos técnicos, con un modo de razonamiento editorial explícito delimitado por las etiquetas `<editorial_reasoning>`.

Su relevancia actual reside en la combinación de un tamaño reducido (cuantización Q4_K_M de aproximadamente 2,5 GB) con una tarea vertical muy concreta, lo que permite ejecutarlo en GPUs de gama baja como una GTX 1660 Ti de 6 GB mediante llama.cpp, LM Studio u Ollama. La información pública disponible es escasa: no se detallan licencia, idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-4B, ajuste por SeqKD) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | no disponible (la model card esta en castellano) |
| Licencia | no disponible |
| Formato de pesos | GGUF (archivo `Qwen3-4B.Q4_K_M.gguf`); se incluye Modelfile para Ollama |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado de la familia Qwen3, con 4.022.468.096 parámetros totales. El ajuste se realizó mediante Sequence-Level Knowledge Distillation (SeqKD) tomando como Teacher a Qwen2.5-32B-Instruct, es decir, el estudiante aprende a replicar las distribuciones de salida del profesor en lugar de entrenarse solo con etiquetas duras. El proceso de fine-tuning y la conversión a GGUF se llevaron a cabo con Unsloth, según declara el autor.

La innovación principal no es arquitectónica sino de formato: el modelo incorpora un modo de razonamiento editorial nativo (`<editorial_reasoning>`) que fuerza una fase de análisis previa a la generación, evaluando hueco de mercado y propuesta única de venta (USP), fricción cognitiva del lector objetivo y arco pedagógico o narrativo. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto especializada en arquitectura editorial y planificación de libros técnicos.
- Razonamiento editorial en modo Chain-of-Thought mediante el bloque `<editorial_reasoning>`.
- Modo "Blueprint editorial completo": generación de títulos SEO, avatar de lector, reglas de estilo y tablas de contenido multi-parte.
- Modo "Refactorización de índices" (book doctoring): diagnóstico y reestructuración de borradores.
- Modo "Pack de lanzamiento KDP": copywriting de contraportada con framework PAS, palabras clave y gancho del capítulo 1.
- Modo "Arquitectura micro de capítulo": desglose de laboratorios prácticos, código vivo y retos técnicos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes multi-paso: no disponible de forma explícita; el flujo de razonamiento editorial es interno al prompt.
- Capacidades multilingües: no documentadas; la model card y el system prompt están en castellano.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Planificación de libros técnicos: el modelo genera índices multi-parte con títulos SEO, avatar de lector y reglas de estilo, adecuado para autores que necesitan una estructura editorial coherente antes de escribir.
- Reescritura de borradores débiles: mediante el modo de refactorización de índices, diagnostica problemas estructurales y propone una reorganización de capítulos y secciones.
- Copywriting de lanzamiento en Amazon KDP: produce contraportadas con el framework PAS, listas de palabras clave y ganchos de apertura para el capítulo 1, orientados a mejorar la conversión de la ficha del libro.
- Diseño de capítulos con laboratorios prácticos: desglosa ejercicios, retos técnicos y fragmentos de código para libros de programación, aprovechando la base Qwen3-4B para el contenido técnico.
- Asistencia editorial local sin conexión: al ejecutarse en GGUF Q4_K_M (~2,5 GB) con llama.cpp u Ollama, permite trabajar con material confidencial de manuscritos en una GTX 1660 Ti de 6 GB sin enviar datos a la nube.
- Prototipado rápido de estructuras editoriales: integrable en pipelines de generación de documentación o en flujos de trabajo de autoedición que requieran múltiples variantes de índice y contraportada en poco tiempo.
- Formación de asistentes editoriales especializados: sirve como base para ajustes posteriores o para sistemas con prompts encadenados que necesiten un paso de razonamiento editorial explícito y auditable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,5 GB para la cuantización Q4_K_M publicada.
- GPU recomendadas: el autor cita explícitamente la NVIDIA GTX 1660 Ti de 6 GB como hardware objetivo; cualquier GPU con al menos 4 GB de VRAM libre es suficiente para esta cuantización.
- Cabe en GPU de consumo: sí, en GTX 1660 Ti (6 GB) y modelos superiores.
- Opciones de despliegue: llama.cpp (`llama-cli -hf Denisijcu/vertex-editorial-core-4b-v3-gguf --jinja`), LM Studio y Ollama (se incluye Modelfile).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Vertex-Editorial-Core-4B | 4.022.468.096 | no disponible | GGUF Q4_K_M | no disponible | Editorial y KDP |
| Qwen3-4B (base) | ~4B | no disponible | safetensors, GGUF | no disponible en esta ficha | Propósito general |
| Qwen2.5-32B-Instruct (Teacher) | ~32B | no disponible | safetensors, GGUF | no disponible en esta ficha | Propósito general, instrucciones |

La comparación cuantitativa con alternativas de la misma categoría (modelos verticales de edición o asistentes de escritura) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La licencia no está declarada en la información disponible; no se puede confirmar el uso comercial sin consultar al autor.
- No se documentan los idiomas soportados ni el comportamiento fuera del castellano.
- No se especifica la longitud de contexto efectiva; el uso con manuscritos largos puede degradar la coherencia.
- El modelo está altamente especializado en tareas editoriales; su rendimiento en tareas generales (código, matemáticas, razonamiento abstracto) no está evaluado.
- Riesgo de alucinación en datos de mercado, palabras clave de Amazon o afirmaciones sobre nichos editoriales; conviene verificar manualmente cualquier recomendación de negocio.
- El modo `<editorial_reasoning>` requiere respetar el system prompt oficial; sin él, el comportamiento puede desviarse del esperado.
- Solo se publica una cuantización (Q4_K_M); no hay versiones de mayor precisión ni safetensors del modelo ajustado en este repositorio.
- El número de descargas (189) y la ausencia de likes indican una adopción muy limitada; no hay evidencia externa de calidad en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Denisijcu/vertex-editorial-core-4b-v3-gguf
- Web del autor: https://vertexcoders.com
- Unsloth (herramienta de fine-tuning y conversión): https://github.com/unslothai/unsloth
