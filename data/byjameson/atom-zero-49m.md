# byjameson/atom-zero-49m

## Resumen

Atom Zero 49.2M es un modelo de lenguaje de tipo decoder-only transformer entrenado desde cero por el desarrollador independiente byjameson. Con 49.213.440 parámetros, 6 capas, dimensión 768, 12 cabezas de atención y FFN de 3072, se posiciona explícitamente como un "modelo de comportamiento" (behavior model) de chat y tareas, no como un modelo fundacional. Su ventana de contexto es de solo 128 tokens y su tokenizador BPE cubre 8.192 tokens, orientado al inglés.

La propuesta del modelo es deliberadamente limitada: el autor asume que un modelo de 50M no puede almacenar conocimiento factual fiable, por lo que el sistema traslada los hechos a un pipeline de RAG (retrieval-augmented generation) con recuperación híbrida FTS + MiniLM y herramientas deterministas. El checkpoint publicado corresponde al paso 40.000, entrenado sobre 175,37M tokens limpios con una mezcla de replay hasta 214,8M tokens. El resultado es un modelo que responde "no tengo una fuente para eso" en lugar de alucinar, con citación de fuentes.

Es relevante ahora porque ejemplifica una arquitectura alternativa para asistentes locales de un solo usuario: núcleo neuronal pequeño, memoria en SQLite, sin telemetría, con adaptadores LoRA revisados y un proveedor local opcional (Ollama) para consultas de mayor complejidad. La licencia Apache-2.0 permite uso comercial, aunque el autor advierte que no hay firma de release final ni publicación en PyPI en el momento de la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer |
| Parámetros totales | 49.213.440 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 (código y pesos); atribución de datos en `NOTICE` |
| Formato de pesos | PyTorch (checkpoint `transformer_behavior_50m_scaled`) |
| Capas / dimensión / cabezas / FFN | 6 / 768 / 12 / 3072 |
| Tokenizador | BPE de 8.192 tokens (`data/chat_en_bpe8k.json`) |
| Tokens de entrenamiento | 175,37M limpios + mezcla replay hasta 214,8M |
| Checkpoint | Paso 40.000 |
| Runtime | PyTorch, CUDA o CPU; probado en RTX 3050 6 GB |
| Tamaño del repo | 0,2 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 6 capas con dimensión oculta de 768, 12 cabezas de atención y capa feed-forward de 3072. No emplea Mixture of Experts ni arquitecturas híbridas SSM; es un transformer denso convencional. El entrenamiento se realizó desde cero sobre 175,37M tokens limpios, ampliados mediante una mezcla de replay hasta 214,8M tokens, con un tokenizador BPE de 8.192 entradas diseñado para chat en inglés. El checkpoint publicado corresponde al paso 40.000.

La innovación técnica no reside en la arquitectura del modelo, sino en el sistema que lo rodea. El autor describe un harness con RAG híbrido (FTS + MiniLM), recuperación con top-1 de 1.000 sobre el conjunto de retención autorado, fallback exacto e índice vectorial local. Los adaptadores LoRA se someten a revisión con puertas de calidad, holdout y rollback, sin mutación de pesos no revisada. El "aprendizaje" por profesor (teacher learning) es en realidad memoria de recuperación: se consulta a un modelo Ollama local, se almacena la respuesta como nota no verificada y se recupera después, sin cambio de pesos (`weights_changed: false`). No se documenta RLHF ni DPO.

## Capacidades

- Generación de texto para chat corto y tareas de comportamiento (16/16 en la prueba de comportamiento del autor).
- Respuestas con citación de fuente cuando opera con el pipeline RAG (21/21 en la prueba de producto).
- Aritmética simple, consulta de hora y gestión de notas.
- Recuperación de documentos con citación exacta mediante RAG híbrido FTS + MiniLM.
- Memoria personal persistida en SQLite, con borrado exacto por fuente o sesión y exportación/importación.
- Herramientas deterministas en lugar de planificación libre de herramientas.
- Adaptadores LoRA revisados para habilidades específicas, con puertas de calidad y rollback.
- Proveedor local opcional (Ollama) para chat libre con un modelo mayor suministrado por el usuario.
- Capacidad multilingüe: no disponible; el modelo es English-first según el autor.
- Tool calling / function calling: no disponible como tal; el sistema usa herramientas deterministas, no planificación autónoma.
- Agentes multi-paso: no soportado; el autor lo excluye explícitamente del alcance.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Asistente personal local de un solo usuario: el modelo gestiona conversaciones cortas, tareas y notas con memoria persistida en SQLite, sin telemetría ni servicio alojado, lo que encaja con el requisito de privacidad local del autor.
- Consulta documental con citación: gracias al RAG híbrido FTS + MiniLM con top-1 de 1.000 en el conjunto de retención, el modelo responde indicando la fuente exacta, útil para bases de conocimiento personales o internas de pequeño tamaño.
- Respuestas con abstención controlada: en escenarios donde alucinar es costoso (soporte interno, documentación), el modelo declara "no tengo una fuente para eso" y delega en el profesor local, reduciendo el riesgo de respuestas inventadas.
- Automatización de tareas de comportamiento: clasificación de intenciones, extracción de notas, cálculo aritmético simple y gestión de recordatorios dentro de un asistente de escritorio, aprovechando las 16/16 pruebas de comportamiento del autor.
- Despliegue en hardware de consumo: con 49,2M de parámetros y prueba en una RTX 3050 de 6 GB, puede ejecutarse en portátiles modestos o incluso en CPU, adecuado para prototipos y demos offline.
- Base para investigación sobre RAG y memoria: el repositorio `stream-finetune` incluye scripts de benchmark (`benchmark_raw.py`, `benchmark_assistant.py`, `benchmark_retrieval.py`, `behavior_eval.py`) que permiten reproducir los resultados y estudiar la separación entre conocimiento y recuperación.
- Extensión mediante adaptadores LoRA revisados: equipos que quieran añadir una habilidad concreta (por ejemplo, formato de salida específico) pueden entrenar un adaptador y validarlo con las puertas de calidad del proyecto, sin mutar los pesos base.

## Benchmarks y rendimiento

Los datos publicados por el autor no son benchmarks estándar (MMLU, GSM8K, HumanEval) y él mismo advierte que la prueba de producto es estrecha y autorada. Se reproducen a continuación tal cual.

| Variante | Conocimiento bruto | Producto | Comportamiento | Notas |
|---|---:|---:|---:|---|
| Base 49,2M | 2/10 | 21/21 | 16/16 | Sin RAG ni herramientas |
| Producto 49,2M (40k) | 2/10 | 21/21 | 16/16 | Corpus escalado |
| + adaptador `v0001` | 2/10 | 21/21 | 16/16 | El adaptador no añade hechos |
| + RAG/herramientas | — | 21/21 | 16/16 | Respuestas con cita de fuente |
| + recuperación neuronal híbrida | — | 21/21 | 16/16 | Top-1 de recuperación 1.000 frente a 0,850 de FTS |
| + seguridad ML opcional | — | 26/26 | 16/16 | Filtro desactivado por defecto |

Ajuste de modelo de lenguaje sobre el shard de validación limpio y escalado:

| Métrica | Base | Producto 40k |
|---|---:|---:|
| Chat bpb | 1,5032 | 1,3815 |
| Pérdida del asistente | 4,2153 | 3,8551 |
| Historias bpb | 1,622 | 1,4144 |
| Mixto bpb | — | 1,2406 |
| Wiki bpb | — | 2,1746 |

El autor señala explícitamente que el modelo bruto obtiene 2/10 en conocimiento en ambas variantes, lo que justifica la arquitectura basada en RAG. No se han publicado resultados de MMLU, GSM8K ni HumanEval.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 49,2M de parámetros en FP32 el peso ronda los 200 MB, por lo que cabe holgadamente en cualquier GPU moderna.
- GPU recomendadas: el autor ha probado en una RTX 3050 de 6 GB; cualquier GPU con 6 GB o más es suficiente. También se ejecuta en CPU.
- Cabe en GPU de consumo: sí, en RTX 3050, RTX 3060, RTX 4060 y superiores; también en iGPU y CPU.
- Opciones de despliegue: PyTorch (CUDA o CPU) como runtime documentado; el ecosistema `streamft` (paquete `streamft 0.8.1`) actúa como harness. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI para este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.
- Almacenamiento: repo de 0,2 GB, por lo que el checkpoint y el tokenizador ocupan muy poco espacio en disco.

## Comparativa con modelos similares

No se dispone de datos de benchmarks estándar ni de comparaciones publicadas por el autor frente a otros modelos. Se ofrece una comparación cualitativa basada en las especificaciones disponibles.

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atom Zero 49.2M | 49,2M | 128 tokens | Chat/behavior + RAG, sin conocimiento factual | Apache-2.0 | Hugging Face, ModelScope, GitHub |
| Modelos tipo TinyLlama / Qwen2-0.5B | 0,5B–1,1B | 2.048–32.768 tokens | Modelos fundacionales pequeños con conocimiento general | Apache-2.0 / otras | Hugging Face |
| Modelos de embedding + RAG (p. ej. MiniLM) | ~22M–110M | 256–512 tokens | Recuperación, no generación | Apache-2.0 / MIT | Hugging Face |

La comparación directa con modelos fundacionales de tamaño similar no está disponible en la información proporcionada, y el autor rechaza explícitamente cualquier afirmación de paridad con modelos frontera o de MMLU/GSM8K/HumanEval.

## Limitaciones y advertencias

- Conocimiento bruto de 2/10: el modelo no almacena hechos fiables y depende del RAG para cualquier dato factual.
- Razonamiento general, programación y matemáticas más allá de la aritmética simple: fuera de alcance según el autor.
- Contexto de solo 128 tokens, muy limitado para conversaciones multi-turno o documentos largos; el RAG compensa parcialmente esta restricción.
- Tokenizador y datos English-first; no se documenta soporte multilingüe.
- Sin planificación autónoma de herramientas ni investigación web autónoma; el uso de herramientas es determinista y supervisado.
- La prueba de producto (21/21) es estrecha y autorada, no es MMLU; no debe interpretarse como rendimiento general.
- La evidencia de los adaptadores es de muestra pequeña: mejora la pérdida objetivo, no una habilidad general.
- Riesgo de alucinación mitigado por abstención y citación, pero no eliminado; las notas del profesor quedan marcadas como no verificadas hasta revisión.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la atribución de datos debe consultarse en `NOTICE`; no hay firma de release final ni publicación en PyPI en el momento de la model card.
- Uso en producción: el autor excluye operación multi-inquilino o alojada sin controles adicionales, y no recomienda uso en ámbitos médico, legal, financiero o de seguridad crítica.
- Sesgos conocidos: no disponibles en la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/byjameson/atom-zero-49m
- ModelScope: https://modelscope.cn/models/byjameson/atom-zero-49m
- GitHub release v0.8.1: https://github.com/byjameson/stream-finetune/releases/tag/v0.8.1
- Repositorio GitHub: https://github.com/byjameson/stream-finetune
- PyPI `streamft` 0.8.1: https://pypi.org/project/streamft/0.8.1/
- Artículo de lanzamiento: https://dev.to/mycute_97b39c4e34027570f9/atom-zero-a-49m-local-assistant-that-says-i-dont-know-1p7m
- Figura de arquitectura: https://raw.githubusercontent.com/byjameson/stream-finetune/main/docs/figures/atomzero_architecture.png
