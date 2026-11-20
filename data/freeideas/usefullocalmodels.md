# freeideas/UsefulLocalModels

## Resumen

`freeideas/UsefulLocalModels` es un repositorio que agrupa una familia de modelos pequeños y especializados, entrenados para ejecutarse en CPU convencional y resolver tareas repetitivas de procesamiento de texto sin recurrir a grandes modelos generativos. Lo desarrolla Carl Free (freeideas), ingeniero de IA centrado en modelos compactos que superan a modelos generales en tareas estrechas con un coste mucho menor. El repositorio incluye clasificadores de 150M de parámetros para segmentación temática, enlazado de entidades y atribución de diálogos, modelos de 32M para búsqueda en grafos de hechos, y un sumarizador de 4B basado en Qwen3.5-4B.

El modelo principal del repo, según el recuento de safetensors, tiene 4.326.350.848 parámetros y deriva de `Alibaba-NLP/gte-reranker-modernbert-base`, un encoder ModernBERT reutilizado aquí como base para clasificación de texto. La propuesta es deliberadamente local: el texto no sale de la máquina, lo que reduce coste, latencia y exposición de datos frente a APIs de LLM. El repositorio ocupa 13 GB e incluye pesos en ONNX, safetensors y GGUF.

Es relevante ahora porque ejemplifica una tendencia práctica: sustituir llamadas a modelos grandes por clasificadores pequeños y deterministas para tareas de infraestructura (trocear un libro en temas, enlazar menciones a entidades, atribuir citas), reservando el LLM solo para la generación final. La licencia del repo es Apache 2.0, aunque varios submodelos tienen restricciones por sus datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base `Alibaba-NLP/gte-reranker-modernbert-base`) para los clasificadores; el sumarizador es un Qwen3.5-4B fine-tuneado |
| Parametros totales | 4.326.350.848 (modelo principal del repo); submodelos de 150M y 32M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens en el sumarizador (flag `-c 16384` en llama.cpp); no disponible para los clasificadores |
| Tipos de cuantizacion | Q4_K_M (GGUF) para el sumarizador; safetensors y ONNX para los clasificadores |
| Idiomas soportados | en (inglés únicamente) |
| Licencia | Apache 2.0 en el repo; el submodelo sumarizador es solo para uso no comercial por sus datos de entrenamiento |
| Formato de pesos | safetensors, ONNX, GGUF |

## Arquitectura y entrenamiento

Los clasificadores pequeños (same-subject, entity-link, speaker, choice, path-step, path-answer) son encoders derivados de ModernBERT con 150M o 32M de parámetros, entrenados como clasificadores binarios o de elección sobre pares de textos. Los modelos `path-step-r2` y `path-answer-r2` de 32M se obtuvieron por destilación de sus equivalentes r1 de 150M, cinco veces mayores, manteniendo calidad comparable en la búsqueda sobre grafos de hechos. El modelo `same-subject-r4` es una repetición de r3 entrenada exclusivamente con texto que permite uso comercial.

El sumarizador `sumeng-summarizer-qwen3.5-4b` se fine-tuneó con LoRA de rango 32 sobre las capas de lenguaje usando Unsloth, con pérdida solo sobre la respuesta, una época y pérdida de validación de 0.91, y después se fusionó y cuantizó a Q4_K_M. Los datos fueron 754 resúmenes generados por Claude (Haiku para pasajes, Sonnet para resúmenes de resúmenes) y aceptados por SumEng sobre textos de entrenamiento: OpenStax Introduction to Sociology 3e y U.S. History (CC BY-NC-SA 4.0), cuatro novelas de dominio público, ocho relatos de Sherlock Holmes y seis chats LoCoMo (CC BY-NC 4.0), con 83 ejemplos de validación de otros libros y un chat. El prompt incluye un tramo de pasajes o mensajes, un límite de longitud y reglas en texto plano; la salida es un párrafo único.

## Capacidades

- Clasificación de texto y segmentación temática: determina si un pasaje o mensaje continúa el tema del texto anterior, para trocear flujos largos (libros, chats, notas de reunión) en una jerarquía de resúmenes.
- Enlazado de entidades: decide si un nombre en una frase se refiere a una entidad conocida (persona, lugar, cosa) de un grafo en crecimiento.
- Atribución de citas: identifica qué personaje pronuncia un párrafo de diálogo en ficción, a partir del párrafo y del texto previo.
- Preguntas de elección múltiple sobre un flujo de texto: a qué entidad corresponde un nombre marcado, quién dice un párrafo, o si dos entidades son la misma.
- Búsqueda en grafos de hechos: `path-step` evalúa si un hecho es el siguiente paso hacia la respuesta y `path-answer` puntúa si una cadena de hechos responde a la pregunta, con puntuación baja cuando el grafo no puede responder.
- Sumarización extractiva-abstractiva controlada: genera un párrafo plano dentro de un límite de longitud, nombrando personas y cosas, con modo thinking desactivado y temperatura 0.3.
- Ejecución local en CPU y en Apple Silicon (Metal), sin envío de texto a servicios externos.
- No soporta tool calling, agentes multi-paso generales, visión ni audio según la información disponible.

## Casos de uso

- Troceado temático de documentos largos: `same-subject-r4` permite dividir un libro o un histórico de chat en temas coherentes para construir un árbol de resúmenes, sin coste de API y con el texto siempre en local.
- Enlazado de menciones en pipelines de extracción: `entity-link-r1` resuelve si cada mención de un texto corresponde a una entidad ya conocida del grafo, lo que facilita mantener grafos de conocimiento incrementales en documentos que crecen.
- Atribución de diálogos en narrativa: `speaker-r1` asigna párrafos citados a personajes en ficción, útil para anotación literaria, adaptaciones o análisis de guiones.
- Resumen de pasajes y mensajes con límite de longitud: el sumarizador Qwen3.5-4B sustituye a Claude Haiku en el nivel `basic` de SumEng, generando un párrafo por tramo con unas 10 segundos por resumen en un M1 Pro; adecuado para resúmenes de actas, correos o capítulos en entornos privados.
- Preguntas sobre documentación corporativa: combinando el árbol de resúmenes con un índice de palabras clave, el sistema recupera evidencia para preguntas de detalle y de repaso; en el libro de prueba logró el 59% y el 68% respectivamente, y el 100% con índice de palabras clave.
- Búsqueda de respuestas en grafos de hechos: `path-step-r2` y `path-answer-r2` permiten recorrer un grafo para responder preguntas encadenadas del tipo "¿dónde trabaja la mujer de Roger?", con una búsqueda cinco veces más rápida que con los modelos de 150M.
- Clasificación de bajo coste en producción: los modelos de 150M y 32M caben en CPU y permiten procesar grandes volúmenes de texto (clasificación, elección múltiple, segmentación) con latencia baja y sin GPU.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Resúmenes aceptados a la primera (OpenStax Psychology 2e, 921 pasajes, 246 resúmenes) | 246 de 246 (Claude Haiku: 53 de 299 respuestas demasiado largas y repetidas) |
| Preguntas de detalle con recorrido del árbol solo | 59% (árbol resumido por Claude: 63%) |
| Preguntas de detalle con índice de palabras clave | 100% (ambos) |
| Preguntas de repaso del libro | 68% (Claude: 64%) |
| Juicio comparativo de Claude Sonnet sobre 30 prompts | 3,6 de 5 frente a ~4,1 de Claude |
| Latencia de resumen en M1 Pro (Metal) | ~10 segundos por resumen |
| Pérdida de validación del fine-tuning | 0,91 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Sumarizador Qwen3.5-4B: 2,8 GB en Q4_K_M; ejecutable en CPU y en Apple Silicon con Metal; se lanza con `llama-server` y contexto de 16.384 tokens.
- Clasificadores de 150M: caben holgadamente en CPU y en cualquier GPU consumer; no requieren VRAM significativa.
- Clasificadores de 32M: aún más ligeros, pensados para ejecución en CPU.
- Despliegue: llama.cpp (formato GGUF) para el sumarizador; ONNX y safetensors para los clasificadores; el repo incluye la etiqueta `endpoints_compatible`.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, el sumarizador cabe en GPUs consumer con al menos 4-6 GB de VRAM en Q4_K_M.
- Throughput: no disponible, salvo la latencia de ~10 s por resumen en M1 Pro.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| freeideas/UsefulLocalModels (sumarizador) | 4,3B | 16.384 | Resumen con límite de longitud | No comercial (datos de entrenamiento) | Hugging Face |
| Claude Haiku | no disponible | no disponible | Resumen y generación general | Propietaria | API |
| Alibaba-NLP/gte-reranker-modernbert-base | no disponible | no disponible | Reranking | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B | 4B | no disponible | Generación general | no disponible en la información | Hugging Face |

La comparación directa con modelos de la misma categoría (clasificadores pequeños para segmentación y enlazado) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: todos los submodelos están entrenados y evaluados únicamente en inglés.
- El sumarizador está entrenado con la formulación de prompt propia de SumEng; otras formulaciones pueden funcionar peor.
- El sumarizador no se ha probado para resúmenes de resúmenes en un árbol completo.
- Licencia del sumarizador: aunque el modelo base es Apache 2.0, parte del texto de entrenamiento es solo para uso no comercial, por lo que el modelo debe usarse con fines no comerciales.
- `same-subject-r3` y `choice-r1` también tienen restricciones por datos de entrenamiento; se recomienda `same-subject-r4`, entrenado solo con texto comercialmente utilizable.
- `choice-r1` es experimental: mejor que los modelos anteriores en decisiones individuales, pero no mejor en uso real según sus límites declarados.
- `path-answer-r2` elige cadenas pero no determina bien dónde debe terminar una cadena; debe combinarse con `path-answer-r1` para esa función.
- Riesgo de alucinación en el sumarizador: es un modelo generativo de 4B y puede introducir detalles no presentes en el texto; los clasificadores, al ser discriminativos, no generan contenido pero pueden equivocarse en los límites.
- El repositorio mezcla varios submodelos con licencias y datos distintos; conviene revisar cada carpeta antes de desplegar en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/freeideas/UsefulLocalModels
- Modelo base: https://huggingface.co/Alibaba-NLP/gte-reranker-modernbert-base
- Modelo base del sumarizador: https://huggingface.co/Qwen/Qwen3.5-4B
- Página del autor (currículum, demos y contacto): https://ordinarydata.com/resume/
