# jsaizant/datamix-0.7B-propella-edu-high-mod-100bt-por_Latn

## Resumen

El modelo `jsaizant/datamix-0.7B-propella-edu-high-mod-100bt-por_Latn` es un modelo de lenguaje de 0,7 mil millones de parámetros entrenado desde cero por el usuario jsaizant, publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un experimento de preentrenamiento a pequeña escala centrado en portugués (etiqueta `por_Latn`, escritura latina), entrenado sobre 100 mil millones de tokens del corpus HPLT 4, filtrado mediante el clasificador Propella-1 con las categorías "Educational" iguales a "Moderate" o "High".

El interés del modelo es metodológico más que de producto: documenta una receta concreta de curación de datos (HPLT 4 + filtro educativo Propella-1) aplicada a un presupuesto de cómputo reducido (0,7B parámetros, 100B tokens). No hay información pública sobre arquitectura interna, tokenizador ni resultados de evaluación en la model card ni en los metadatos de Hugging Face.

La información disponible es muy limitada: la model card consta de una sola frase descriptiva, no se declara pipeline de inferencia, no hay benchmarks publicados y el repositorio (13,4 GB) contiene pesos en formato `safetensors` junto con checkpoints de entrenamiento en PyTorch (`pt`). Cualquier uso en producción requeriría inspeccionar los artefactos del repositorio y validar el modelo por cuenta propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no declarada en la model card) |
| Parametros totales | 0,7B (700 millones, segun el autor) |
| Parametros activos | no aplica (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos `safetensors` y `pt`) |
| Idiomas soportados | portugues (`pt`, `por_Latn`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y PyTorch (`pt`) |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura. Por el nombre del modelo y el tamaño (0,7B) es plausible que se trate de un transformer decoder-only de tipo GPT, pero esto no está confirmado en la información proporcionada. Tampoco se detallan el tokenizador, la longitud de contexto nativa ni la configuración de capas y dimensiones ocultas.

El entrenamiento se realizó desde cero sobre 100 mil millones de tokens extraídos de HPLT 4 en portugués. El corpus fue filtrado con el clasificador Propella-1, conservando únicamente documentos clasificados como "Educational" con nivel "Moderate" o "High". No se indica si hubo fases de ajuste fino supervisado, RLHF o DPO, ni se documentan hiperparámetros, tamaño de batch global, hardware utilizado o curva de pérdida.

## Capacidades

- Generación de texto en portugués: es la única capacidad declarada implícitamente por el idioma del corpus de entrenamiento.
- Modelo base de preentrenamiento: no se documenta ajuste por instrucciones, por lo que no cabe esperar un comportamiento de chat o de seguimiento de instrucciones fiable sin un post-entrenamiento adicional.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso o uso como agente: no disponible.
- Capacidades multilingües: limitadas al portugués según la etiqueta de idioma declarada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre curación de datos: reproducir o analizar el efecto del filtro educativo Propella-1 sobre HPLT 4 comparando este checkpoint con variantes entrenadas sobre corpus sin filtrar. El modelo sirve como referencia experimental de la receta.
- Punto de partida para ajuste fino en portugués: al ser un modelo base de 0,7B con licencia Apache 2.0, puede usarse como inicialización para tareas downstream (clasificación, extracción de información, resumen) con presupuesto de cómputo reducido.
- Experimentos de destilación: su tamaño permite emplearlo como alumno en procesos de destilación desde modelos mayores, o como profesor en entornos con recursos limitados.
- Evaluación de calidad de corpus educativos: generar texto con el modelo y medir la influencia del filtrado "Educational Moderate/High" en la fluidez y el registro del portugués producido.
- Prototipado de bajo coste en CPU o GPU de gama media: 0,7B parámetros permite iterar rápidamente en local antes de escalar a modelos mayores, siempre que se valide primero la calidad del checkpoint.
- Benchmarking de pipelines de entrenamiento: usar el modelo como caso de prueba para comparar frameworks de entrenamiento distribuido o estrategias de tokenización sobre datos HPLT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (no confirmada para este modelo): en fp16, aproximadamente 1,4 GB de pesos; en int8, unos 0,7 GB; en int4, unos 0,35 GB, más overhead de activaciones y KV cache según contexto.
- GPU recomendadas: no disponibles. Por tamaño, cualquier GPU consumer con al menos 4-8 GB de VRAM debería poder alojar los pesos en precisión reducida, pero no hay validación publicada.
- Cabe en GPU consumer: previsiblemente sí por tamaño, aunque no está verificado.
- Opciones de despliegue: no documentadas. No se declara compatibilidad con vLLM, llama.cpp, Ollama o TGI; al publicarse solo `safetensors` y `pt`, sería necesario convertir los pesos a GGUF para llama.cpp/Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparación rigurosa con alternativas de 0,7B en portugués (por ejemplo, variantes de la familia TinyLlama o modelos base portugueses), por lo que no se establece comparación.

## Limitaciones y advertencias

- Ausencia de evaluación: no hay benchmarks, por lo que se desconoce la calidad real del modelo frente a alternativas.
- Modelo base sin ajuste por instrucciones: no debe esperarse un comportamiento conversacional ni seguimiento de instrucciones sin post-entrenamiento.
- Cobertura lingüística restringida: solo se declara portugués; el rendimiento en otros idiomas, incluido el castellano, es desconocido y probablemente deficiente.
- Sesgos del corpus: HPLT 4 es un corpus web; el filtrado educativo reduce pero no elimina sesgos, contenido tóxico o desinformación presentes en la fuente.
- Riesgo de alucinación: inherente a un modelo base de 0,7B; sin datos de evaluación no puede cuantificarse.
- Licencia: Apache 2.0 permite uso comercial, pero al ser un modelo sin validar conviene auditar los pesos y el origen de los datos antes de integrarlo en producción.
- Documentación mínima: la model card no detalla arquitectura, tokenizador ni contexto, lo que dificulta la reproducibilidad y la integración en pipelines existentes.
- Repositorio pesado (13,4 GB) con posibles checkpoints intermedios: conviene revisar qué archivos son pesos finales antes de descargar todo.

## Enlaces

- Hugging Face: https://huggingface.co/jsaizant/datamix-0.7B-propella-edu-high-mod-100bt-por_Latn
- Corpus HPLT: no disponible en la información proporcionada (referenciado como "HPLT 4" en la model card)
- Clasificador Propella-1: no disponible en la información proporcionada (referenciado como "Propella-1" en la model card)
- Paper, blog o demo: no disponibles
