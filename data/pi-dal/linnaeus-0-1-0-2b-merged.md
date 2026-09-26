# pi-dal/Linnaeus-0.1.0-2B-merged

## Resumen

Linnaeus-0.1.0-2B-merged es un modelo de decisión de 2B parámetros desarrollado por el usuario pi-dal y publicado en HuggingFace bajo licencia Apache-2.0. No es un modelo generativo de propósito general: está diseñado para clasificar, enrutar y puntuar conjuntos arbitrarios de candidatos a partir de un estado estructurado. Se trata de un fork de Dohnuts (proyecto de AstraBert) reentrenado sobre Qwen3.5-2B, distribuido como pesos completos con el adaptador LoRA ya fusionado, de modo que no requiere cargar un adaptador aparte.

Su innovación principal es el denominado "score-row trick": la cabeza de decisión escalar se añade como una fila extra en `embed_tokens` (identificador `score_row_id = 248320`, atada a `lm_head`). Para cada candidato renderizado con el marcador `<|fim_suffix|>`, la puntuación de decisión se obtiene directamente como `logits[posición_marcador, 248320]`, y después se aplica una temperatura por tipo de pregunta y un softmax sobre los candidatos. Esto permite obtener probabilidades de decisión calibradas usando cualquier runtime estándar de transformers, sin necesidad de código personalizado para una cabeza adicional.

El modelo ocupa 2.274.071.872 parámetros (unos 4,6 GB en el repositorio, presumiblemente en precisión de 16 bits) y está etiquetado con la arquitectura `qwen3_5` y el pipeline `image-text-to-text`. Su relevancia actual radica en que ofrece un mecanismo reutilizable para integrar decisiones discretas y calibradas dentro de pipelines de LLM, con soporte explícito de Apple Silicon vía MPS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `qwen3_5`), derivada de Qwen3.5-2B; incluye una fila adicional en `embed_tokens` como cabeza de decisión escalar |
| Parametros totales | 2.274.071.872 (aproximadamente 2,27 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio publica pesos safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (pesos completos con LoRA fusionado) |
| Modelo base | pi-dal/Linnaeus-0.1.0-2B |
| Tamano del repositorio | 4,6 GB |
| Biblioteca | transformers |
| Pipeline declarado | image-text-to-text |
| `score_row_id` | 248320 (atado a `lm_head`) |
| Marcador de candidato | `<|fim_suffix|>` |
| Contrato de runtime | `linnaeus-runtime.json` (score_row_id, marker, temperatures) |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha de creacion | 2026-09-26 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de aproximadamente 2,27 B de parámetros, heredado de Qwen3.5-2B, sobre el que se ha realizado un ajuste fino con LoRA. El resultado se ha fusionado con los pesos base, por lo que el checkpoint publicado contiene los pesos completos y no requiere cargar adaptadores. La etiqueta `qwen3_5` en HuggingFace confirma la familia arquitectónica, y el pipeline declarado (`image-text-to-text`) sugiere un componente multimodal, aunque la model card no documenta ninguna capacidad de visión ni detalla la composición del dataset de entrenamiento.

La peculiaridad técnica del modelo es la reutilización de la matriz de embeddings como cabeza de decisión. Añadiendo una fila extra en `embed_tokens` (índice 248320) y atándola a `lm_head`, el modelo convierte una tarea de clasificación en una lectura directa de logits: para cada candidato se renderiza una secuencia que termina en `<|fim_suffix|>` y se lee el logit de la fila 248320 en la posición del marcador. Las puntuaciones resultantes se dividen por una temperatura específica del tipo de pregunta y se normalizan con softmax, lo que produce probabilidades calibradas sin necesidad de implementar una cabeza personalizada en el runtime. El modelo se presenta como fork de Dohnuts reentrenado sobre Qwen3.5-2B, e incluye como artefacto de acompañamiento un fichero `linnaeus-runtime.json` que declara el `score_row_id`, el marcador y las temperaturas. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Puntuación y clasificación de conjuntos arbitrarios de candidatos a partir de un estado estructurado, devolviendo probabilidades calibradas por softmax.
- Enrutado y selección: elegir entre múltiples opciones, herramientas o rutas de ejecución.
- Formato conversacional (etiqueta `conversational`), lo que permite integrarlo en plantillas de diálogo.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue tras una API.
- Ejecución en Apple Silicon mediante MPS, además de CUDA y otros dispositivos, según la model card.
- Integración con runtimes estándar de transformers sin código de cabeza adicional, gracias al truco de la fila de puntuación.
- Capacidades multimodales: el pipeline declarado en HuggingFace es `image-text-to-text`, pero la model card no documenta ninguna tarea de visión concreta; debe tratarse como no verificada.
- Soporte de tool calling / function calling: no documentado explícitamente.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el modelo está orientado a decisiones puntuales, no a planificación de varios pasos.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Enrutado de consultas en sistemas RAG: dado un conjunto de índices, bases de conocimiento o modelos candidatos, el modelo puntúa cada opción y selecciona la más adecuada. El truco de la fila de puntuación devuelve probabilidades directamente comparables, lo que simplifica el umbral de decisión.
- Clasificación de tickets de soporte: se renderizan las categorías posibles como candidatos y se obtiene la probabilidad de cada una para asignar automáticamente el ticket al equipo correspondiente.
- Reranking de resultados de búsqueda: tras una recuperación inicial, el modelo puede puntuar cada documento candidato frente a la consulta y reordenar la lista antes de pasarla al LLM generador.
- Selección de herramientas en agentes: en un conjunto de funciones disponibles, el modelo puntúa cada una y permite decidir cuál invocar, evitando depender exclusivamente de la generación de texto del LLM principal.
- Moderación y scoring de contenido: se pueden evaluar políticas alternativas sobre un mismo texto y obtener una distribución de probabilidad sobre las categorías de riesgo.
- Evaluación automática de respuestas (LLM-as-judge con puntuación calibrada): comparar varias respuestas candidatas a una misma pregunta y seleccionar la de mayor puntuación, aprovechando la calibración por temperatura por tipo de tarea.
- Predicción de la siguiente acción en flujos estructurados: en una máquina de estados o un formulario, puntuar las transiciones posibles dado el estado actual.
- Despliegue local en Apple Silicon: la model card reporta ejecución en MPS, lo que permite usar el modelo como componente de decisión en portátiles Mac sin GPU dedicada, con 4,6 GB de pesos.

## Benchmarks y rendimiento

Los únicos resultados publicados en la información disponible corresponden a JevBench v1.2.2 (231 tareas), un benchmark del propio ecosistema del modelo:

| Benchmark | Configuracion | Resultado |
|---|---|---|
| JevBench v1.2.2 (231 tareas) | Linnaeus 2B, torch CUDA (referencia) | 73,16 % |
| JevBench v1.2.2 (231 tareas) | Linnaeus 2B, torch MPS | 71,0 % |
| JevBench v1.2.2 (231 tareas) | Upstream (Dohnuts original) | 65,8 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: los 2,27 B de parámetros ocupan alrededor de 4,5 GB, por lo que la inferencia completa requiere del orden de 5 a 6 GB de VRAM contando activaciones y caché.
- VRAM estimada en int8: aproximadamente 2,3 GB de pesos, con un total práctico en torno a 3 a 4 GB.
- VRAM estimada en int4: aproximadamente 1,2 GB de pesos; no se documentan oficialmente builds cuantizadas.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM. Cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. En el segmento profesional, A100, H100 y L40S están sobradamente dimensionadas para este tamaño.
- Cabe en GPU de consumo: sí. Con 2,27 B de parámetros, es viable en tarjetas de gama media con 8 GB o más, e incluso en configuraciones con cuantización de 4 bits en GPUs de 6 a 8 GB.
- Apple Silicon: soportado explícitamente vía MPS según la model card, con un resultado medido de 71,0 % en JevBench v1.2.2.
- Opciones de despliegue: la model card muestra uso directo con `transformers` en PyTorch, sobre MPS o cualquier dispositivo. Se mencionan builds MLX (el repositorio es la fuente de conversión para ellas). No se documentan instrucciones para vLLM, TGI, llama.cpp ni Ollama; conviene tener en cuenta que el truco de la fila de puntuación requiere acceso a los logits en una posición concreta y a la fila 248320, algo que los runtimes que solo exponen generación de texto pueden no permitir sin modificaciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | JevBench v1.2.2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Linnaeus-0.1.0-2B-merged (pi-dal) | 2,27 B | No disponible | 73,16 % (CUDA), 71,0 % (MPS) | apache-2.0 | HuggingFace, pesos fusionados safetensors |
| Dohnuts (upstream, AstraBert) | No disponible | No disponible | 65,8 % | No disponible | GitHub |
| Qwen3.5-2B (modelo base) | ~2 B (no confirmado en la informacion disponible) | No disponible | No disponible | No disponible | HuggingFace |
| LLM genericos de ~2 B (Gemma-2-2B, Qwen2.5-1.5B, Llama-3.2-1B) | 1 B - 2 B | 8 K - 128 K segun modelo | No disponible (no evaluados sobre JevBench en la informacion disponible) | Varias | HuggingFace |

La comparación con alternativas generativas de tamaño similar no es directa: Linnaeus está especializado en decisiones discretas con puntuación calibrada, mientras que los LLM de ~2 B están orientados a generación de texto. No se dispone de datos que permitan comparar rendimiento entre ambos grupos sobre la misma tarea.

## Limitaciones y advertencias

- Validación comunitaria nula: el modelo registra 0 descargas y 0 likes en HuggingFace en el momento de la consulta, por lo que no existe evidencia externa de su comportamiento en producción.
- Idiomas no documentados: la model card no especifica los idiomas soportados. Aunque el modelo base Qwen3.5 suele cubrir varias lenguas, no hay confirmación para este checkpoint.
- Contexto máximo desconocido: no se publica la longitud de ventana, lo que impide planificar tareas que dependan de estados estructurados largos.
- Riesgo de alucinación: el modelo está diseñado para puntuar candidatos, no para generar texto libre. Usarlo como generador fuera de ese contrato puede producir salidas poco fiables.
- Dependencia del truco de la fila de puntuación: cualquier runtime que recorte el vocabulario, no exponga los logits completos o modifique la matriz de embeddings invalidará el mecanismo de decisión. El fichero `linnaeus-runtime.json` es necesario para reproducir las temperaturas correctas.
- Sensibilidad al backend: la diferencia entre MPS (71,0 %) y CUDA (73,16 %) en JevBench v1.2.2 indica que los resultados varían según el dispositivo, algo a tener en cuenta al fijar umbrales de decisión.
- Benchmark propio: JevBench v1.2.2 no es un benchmark estandar de la industria, por lo que sus cifras no son comparables con MMLU, GSM8K u otros.
- Capacidades multimodales no verificadas: aunque el pipeline declarado es `image-text-to-text`, la model card no documenta ninguna tarea de visión ni los datos multimodales empleados.
- Licencia del modelo base: el checkpoint se publica como apache-2.0, pero no se detalla la licencia de Qwen3.5-2B en la información disponible; conviene verificar las condiciones del modelo base antes de un uso comercial.
- Ausencia de información sobre sesgos: no hay documentación sobre composición del dataset de entrenamiento, sesgos conocidos ni procesos de alineación (RLHF/DPO).
- Uso comercial: la licencia apache-2.0 permite uso comercial, sujeto a la verificación de las condiciones del modelo base.

## Enlaces

- HuggingFace: https://huggingface.co/pi-dal/Linnaeus-0.1.0-2B-merged
- Modelo base: https://huggingface.co/pi-dal/Linnaeus-0.1.0-2B
- Repositorio upstream Dohnuts: https://github.com/AstraBert/dohnuts
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden al numero matematico pi y no guardan relacion con Linnaeus.
