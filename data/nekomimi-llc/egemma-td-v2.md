# nekomimi-llc/egemma-td-v2

## Resumen

egemma-td-v2 es un modelo de clasificación y extracción de características de 272 millones de parámetros desarrollado por nekomimi-llc. No es un modelo generativo: responde preguntas binarias (sí/no) y de opción múltiple sobre resultados de búsqueda web y párrafos de páginas, con el objetivo de decidir qué resultados merecen abrirse y qué fragmentos conservar como evidencia en un pipeline de agentes de IA.

El modelo es un fine-tune de mrm8488/embeddinggemma-2-ft-typed-decision, entrenado por destilación para copiar las respuestas de un modelo de decisión remoto de mayor tamaño denominado Jev 1.13. Su función en producción es actuar como filtro local de baja latencia: si la probabilidad local es clara (≤ 0,1 o ≥ 0,9) se mantiene la respuesta local y solo se recurre al modelo remoto en la franja de incertidumbre o para las preguntas más costosas.

Su relevancia actual reside en la arquitectura de enrutamiento que propone: reduce el coste y la latencia de un sistema de búsqueda aumentada para agentes al resolver en local la mayoría de decisiones triviales, y añade una capa explícita de detección de inyección de prompts en párrafos web, un problema creciente en pipelines de agentes que ingieren contenido no confiable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `gemma_decision`, `custom_code`; derivada de embeddinggemma) |
| Parámetros totales | 272.120.348 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 256 tokens (`max_seq_length = 256` en el ejemplo de uso) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de su etiqueta `gemma_decision` y su origen en `embeddinggemma-2-ft-typed-decision`, un modelo de embeddings derivado de la familia Gemma. El modelo se carga con `AutoModel` y `trust_remote_code=True`, expone un parámetro `max_seq_length` configurable (fijado a 256 en el ejemplo) y devuelve probabilidades por pregunta, lo que sugiere una cabeza de clasificación sobre representaciones de tipo embedding.

El entrenamiento se basa en destilación: el modelo se ajustó para replicar las respuestas de un modelo remoto de mayor tamaño (Jev 1.13) sobre preguntas tipadas acerca de resultados de búsqueda y pasajes de páginas. La model card no especifica el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica destacable no está en la arquitectura sino en el diseño del sistema: preguntas tipadas con instrucciones específicas (`noul`), tratamiento del texto fuente como dato no confiable y umbrales calibrados que permiten un enrutamiento híbrido local/remoto.

## Capacidades

- Clasificación binaria sí/no sobre resultados de búsqueda (pregunta `useful`: si la página enlazada probablemente contiene evidencia útil para la consulta).
- Clasificación binaria sobre pasajes de página (`evidence`: si el pasaje aporta al menos un hecho necesario para responder; `relevant`: si aborda el tema y las entidades de la consulta).
- Detección de contradicciones (`contradiction`: si el pasaje corrige una premisa falsa de la consulta).
- Detección de inyección de prompts (`injection`: si el pasaje intenta dar instrucciones al asistente en lugar de describir el tema).
- Clasificación de opción múltiple de cuatro vías (`answerability`: `direct`, `partial`, `background`, `none`) sobre el conjunto de pasajes seleccionados.
- Evaluación conjunta de varias preguntas en una sola llamada (el ejemplo puntúa `relevant`, `evidence`, `contradiction` e `injection` a la vez).
- Extracción de características (`feature-extraction`) como pipeline declarado en HuggingFace.
- No se documentan capacidades de generación de texto, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso más allá de la clasificación descrita.

## Casos de uso

- Filtrado y ranking de resultados de búsqueda en agentes: para cada resultado (título, URL, snippet) el modelo calcula la probabilidad `useful`; el pipeline ordena por esa probabilidad y descarta los resultados por debajo de 0,1 antes de descargar las páginas, lo que ahorra peticiones y ancho de banda.
- Selección de evidencia en pipelines RAG: tras trocear una página en párrafos, el modelo puntúa `evidence` y conserva los pasajes con probabilidad ≥ 0,5 para enviarlos al modelo generador, reduciendo el contexto de entrada y el coste por consulta.
- Defensa contra inyección de prompts: los párrafos con `injection` ≥ 0,85 se descartan de forma incondicional, por encima de cualquier otra puntuación; es una salvaguarda concreta para agentes que ingieren HTML de terceros.
- Detección de premisas falsas en la consulta del usuario: los pasajes con `contradiction` ≥ 0,65 se conservan como contraevidencia aunque no superen el umbral de `evidence`, lo que permite al generador corregir supuestos erróneos del usuario.
- Enrutamiento híbrido local/remoto para control de costes: el modelo resuelve en local los casos claros (≤ 0,1 o ≥ 0,9) y solo delega al modelo remoto Jev 1.13 la franja incierta y las preguntas `relevant`, `contradiction`, `injection` y `answerability`, reduciendo el gasto de inferencia remota.
- Clasificación de suficiencia de evidencia antes de resumir: la comprobación `answerability` indica al resumidor si la consulta queda respondida de forma directa, parcial, solo con contexto de fondo o sin respuesta, lo que permite decidir si hace falta otra ronda de búsqueda.
- Moderación de contenido web en pipelines de datos: el clasificador `injection` puede reutilizarse para marcar páginas que contienen instrucciones dirigidas a modelos antes de indexarlas en un corpus de entrenamiento o de recuperación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 272 millones de parámetros, en FP16 el peso ocupa aproximadamente 0,54 GB; en FP32, unos 1,09 GB. El repositorio completo ocupa 1,1 GB, lo que sugiere pesos en precisión de 32 bits o con ficheros auxiliares. No se documentan cuantizaciones oficiales (GGUF, AWQ, GPTQ).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM libre es suficiente para FP16; el modelo está pensado para ejecutarse en la misma máquina que el agente, por lo que una RTX 3060, RTX 4060 o incluso una GPU integrada con suficiente memoria compartida serían viables. Para despliegues de alto volumen, una A10G, L4 o A100 permitirían batchear muchas peticiones.
- Cabe en GPU de consumo: sí, con margen amplio, en cualquier GPU consumer con 4 GB o más de VRAM.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía documentada. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, y el uso de código personalizado y de una cabeza de clasificación tipada probablemente requiera adaptaciones para servidores de inferencia genéricos.
- Latencia y throughput: no disponibles. La ventana de 256 tokens y el tamaño reducido del modelo apuntan a latencias de milisegundos en GPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| egemma-td-v2 | 272 M | 256 tokens | Clasificación de resultados y pasajes web | Apache 2.0 | HuggingFace |
| mrm8488/embeddinggemma-2-ft-typed-decision (modelo base) | no disponible | no disponible | Embeddings con decisiones tipadas | no disponible | HuggingFace |
| Jev 1.13 (modelo remoto destilado) | no disponible | no disponible | Decisión remota (profesor) | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- El modelo no genera texto: solo produce puntuaciones de probabilidad para preguntas predefinidas; cualquier uso fuera de ese esquema requiere definir nuevas preguntas y validar su calibración.
- La ventana de contexto es de 256 tokens, lo que limita los pasajes y las consultas a fragmentos cortos; textos más largos deben trocearse y evaluarse por separado.
- El modelo se entrenó por destilación de un profesor remoto (Jev 1.13); hereda sus sesgos y sus errores de calibración, y no se documenta el dataset de destilación ni su diversidad lingüística o temática.
- No se especifican los idiomas soportados; la model card está en inglés y los ejemplos son en inglés, por lo que el rendimiento en castellano u otros idiomas es desconocido.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos positivos y negativos en la clasificación: un pasaje mal etiquetado como evidencia puede propagarse al generador y producir respuestas mal fundamentadas.
- Los umbrales (0,1, 0,5, 0,35, 0,65, 0,85) están calibrados para un pipeline concreto; reutilizarlos en otro dominio sin recalibrar puede degradar la precisión.
- La licencia Apache 2.0 permite uso comercial, pero el modelo requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar el código remoto antes de desplegarlo en producción.
- El modelo tiene 0 descargas y 1 like en el momento de la ficha, y el autor indica que el identificador del ejemplo (`AnaIsAStupidNeko/egemma-td-v2`) difiere del ID del repositorio (`nekomimi-llc/egemma-td-v2`), lo que puede provocar errores de carga si se copia el snippet tal cual.
- No hay cuantizaciones publicadas ni integración con servidores de inferencia estándar, lo que añade trabajo de ingeniería para desplegarlo a escala.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nekomimi-llc/egemma-td-v2
- Modelo base: https://huggingface.co/mrm8488/embeddinggemma-2-ft-typed-decision
- No se han encontrado en la información disponible papers, blogs, repositorios ni demos adicionales.
