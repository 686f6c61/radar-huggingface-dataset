# magnitudedev/elephant-1-GGUF

## Resumen

elephant-1 GGUF es una redistribución en formato GGUF del modelo base `baselabs/elephant-1`, publicada por el usuario `magnitudedev` para su uso dentro de la plataforma Magnitude (magnitude.run). No se trata de un modelo nuevo: los pesos son los del modelo original y solo se han cuantizado; el valor añadido de este repositorio es la incorporación de metadatos de decisión (`qwen35.decision.*` y una plantilla `tokenizer.chat_template.decision`) que permiten a Magnitude servir el modelo sin código específico. Cualquier otro runtime ignora esas claves.

El modelo se presenta como un "decision model": en lugar de generar texto libre, está orientado a devolver respuestas estructuradas del tipo `noul`, `choice` y `score` a través de los endpoints `/v1/systemone` y `/v1/decisions` de Magnitude. Esa orientación lo sitúa en la categoría de modelos auxiliares para enrutado, clasificación y puntuación dentro de pipelines de agentes, más que como un modelo conversacional de propósito general.

El dato objetivo disponible es el recuento de parámetros en safetensors: 8.953.803.264 (~8,95 B), lo que lo coloca en la franja de modelos densos de 8-9 B ejecutables en GPU de consumo con cuantización de 4-8 bits. La licencia es MIT y el repositorio ocupa 29,0 GB, repartidos entre las cuatro cuantizaciones publicadas. No hay información pública sobre arquitectura, contexto, idiomas ni entrenamiento en la documentación proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. Los metadatos usan el prefijo `qwen35`, compatible con la familia Qwen 3.5, pero el autor no lo confirma |
| Parámetros totales | 8.953.803.264 (~8,95 B), según safetensors del modelo base |
| Parámetros activos | No aplica: no hay indicios de arquitectura MoE en la información disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF: `Q4_K_M`, `Q5_K_M`, `Q6_K`, `Q8_0`. El modelo base se distribuye en safetensors |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (4 ficheros) y safetensors (modelo base) |
| Tamaño del repositorio | 29,0 GB |
| Descargas / likes | 0 / 0 |
| Compatibilidad de endpoint | `endpoints_compatible` (API de Magnitude: `/v1/systemone`, `/v1/decisions`) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna, el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF, DPO u otras) en la documentación disponible. El único indicio técnico es el prefijo `qwen35` en las claves de configuración (`qwen35.decision.*`) y la existencia de una plantilla de chat específica para decisiones (`tokenizer.chat_template.decision`), lo que sugiere que el modelo base reutiliza el tokenizador y la configuración de una variante de la familia Qwen 3.5. Esta inferencia no está confirmada por el autor y no debe tratarse como un hecho verificado.

La innovación declarada de esta publicación no es arquitectónica sino de empaquetado: los metadatos de decisión, extraídos de la configuración, la calibración y el código de referencia del modelo original, describen cómo mapear la salida del modelo a las tres respuestas admitidas (`noul`, `choice`, `score`). El autor indica explícitamente que los pesos no se han modificado más allá de la cuantización, por lo que las capacidades del modelo son las del checkpoint `baselabs/elephant-1` en la revisión `b3f8a93`.

## Capacidades

- Generación de decisiones estructuradas: el modelo está preparado para devolver `noul`, `choice` o `score`, en lugar de texto libre, según los metadatos de decisión incluidos.
- Clasificación por elección (`choice`): selección de una opción entre un conjunto definido, útil para enrutado y desambiguación.
- Puntuación (`score`): asignación de una valoración numérica, aplicable a evaluación automática y ranking.
- Respuesta nula (`noul`): el significado exacto de esta etiqueta no está documentado en la model card; conviene validarlo empíricamente antes de usarla en producción.
- Integración con la API de Magnitude mediante los endpoints `/v1/systemone` y `/v1/decisions`, sin necesidad de código específico del modelo.
- Conversacional: el repositorio incluye la etiqueta `conversational`, aunque no se detallan capacidades de diálogo multi-turno ni de contexto largo.
- No hay información disponible sobre tool calling, function calling, razonamiento multi-paso, visión, audio, modo "thinking" ni cobertura multilingüe.

## Casos de uso

- Enrutado de peticiones en agentes: usar la salida `choice` para decidir qué herramienta, subagente o plantilla activar ante una entrada del usuario, con el modelo actuando como clasificador de bajo coste dentro del bucle del agente.
- Evaluación automática de respuestas (LLM-as-judge): emplear la salida `score` para puntuar la calidad o adecuación de una respuesta generada por otro modelo, integrándolo en un pipeline de control de calidad antes de publicar contenido.
- Filtrado y triaje previo: clasificar mensajes entrantes (soporte, moderación, prioridad) con el modelo como primera etapa, dejando el razonamiento costoso a un modelo mayor y reduciendo así el coste por petición.
- Validación de flujos multi-paso: comprobar si el estado de una tarea satisface una condición y devolver una decisión binaria o una puntuación, evitando que el orquestador dependa de parsear texto libre.
- Selección de contexto o documentación: dado un conjunto de fragmentos candidatos en un sistema RAG, usar la salida `choice` para indicar cuál es relevante antes de la generación final.
- Despliegue local en herramientas de desarrollo: al estar en GGUF y con licencia MIT, puede ejecutarse con llama.cpp u Ollama en una estación de trabajo para prototipar lógicas de decisión sin depender de servicios externos.
- Routers de coste en producción: decidir si una consulta puede resolverse con un modelo pequeño o debe escalarse a uno grande, usando `score` como umbral configurable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Estimación de VRAM para inferencia (pesos + overhead de contexto moderado; cálculos propios a partir de los 8,95 B de parámetros):
  - `Q4_K_M`: ~5,5 GB de pesos, ~6-7 GB en ejecución.
  - `Q5_K_M`: ~6,4 GB de pesos, ~7-8 GB en ejecución.
  - `Q6_K`: ~7,4 GB de pesos, ~8-9 GB en ejecución.
  - `Q8_0`: ~9,5 GB de pesos, ~10-11 GB en ejecución.
  - Safetensors en FP16: ~17,9 GB de pesos, ~19-20 GB en ejecución.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti SUPER y RTX 4090 24 GB con cualquiera de las cuantizaciones publicadas; en tarjetas de 8 GB solo entrarían variantes más agresivas que no están en el repositorio (por ejemplo Q3 o Q2).
- GPU de datacenter: A100 40/80 GB, H100 80 GB y L40S son sobredimensionadas para una sola instancia; permiten servir muchas réplicas o el modelo en FP16 con contexto largo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y llama-cpp-python para GGUF; vLLM admite GGUF con limitaciones; el runtime de Magnitude consume los metadatos de decisión y expone `/v1/systemone` y `/v1/decisions`. TGI no está confirmado para este repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formatos | Rendimiento |
|---|---|---|---|---|---|
| elephant-1 GGUF (esta ficha) | ~8,95 B | No disponible | MIT | GGUF, safetensors | Sin benchmarks publicados |
| Qwen3 8B | ~8,2 B | 32.768 tokens nativo, ampliable con YaRN | Apache 2.0 | safetensors, GGUF | Benchmarks publicados por el autor |
| Llama 3.1 8B | ~8,03 B | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF | Benchmarks publicados por el autor |

La comparación es solo estructural: no existen datos públicos de rendimiento de elephant-1 que permitan contrastarlo con estas alternativas en MMLU, HumanEval, GSM8K ni en tareas de clasificación. Además, la propuesta de valor de elephant-1 (salida restringida a `noul`/`choice`/`score`) no tiene equivalente directo documentado entre los modelos de 8-9 B de propósito general, que requieren prompting o gramáticas restringidas para lograr un comportamiento similar. No se dispone de información sobre otros "decision models" comparables.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no hay datos de arquitectura, contexto, datos de entrenamiento, idiomas ni evaluación. Cualquier uso en producción exige una validación empírica propia.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Es un re-upload de terceros, no una publicación del autor original del modelo. Aunque el autor declara que los pesos no se modifican más allá de la cuantización, conviene verificar la integridad frente al repositorio `baselabs/elephant-1` en la revisión `b3f8a93`.
- Naturaleza de "modelo de decisión": genera etiquetas de un vocabulario cerrado. Fuera de ese contrato, el comportamiento no está documentado y puede degradarse de forma impredecible.
- La etiqueta `noul` no está definida en la model card; su semántica exacta (¿nulo, abstención, "no sé"?) debe confirmarse antes de interpretar sus salidas.
- Riesgo de alucinación y de calibración deficiente en la salida `score`: no hay información sobre cómo se calibró la puntuación ni sobre su rango o escala.
- Licencia MIT: permite uso comercial y modificación, pero el usuario es responsable de cumplir cualquier condición adicional del modelo base y de las dependencias del ecosistema Magnitude.
- Los metadatos `qwen35.decision.*` solo los interpreta el runtime de Magnitude; en otros motores (llama.cpp, Ollama, vLLM) el modelo se comporta como un LLM convencional sin lógica de decisión asociada.
- Sin información sobre sesgos, cobertura idiomática ni robustez frente a entradas adversarias.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/magnitudedev/elephant-1-GGUF
- Modelo base: https://huggingface.co/baselabs/elephant-1
- Plataforma Magnitude: https://magnitude.run
- Licencia del repositorio (MIT): https://huggingface.co/magnitudedev/elephant-1-GGUF/blob/main/LICENSE
