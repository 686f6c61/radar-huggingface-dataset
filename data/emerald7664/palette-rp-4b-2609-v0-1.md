# Emerald7664/Palette-RP-4B-2609-v0.1

## Resumen

Palette-RP-4B-2609-v0.1 es un ajuste fino (finetune) de tipo text-generation desarrollado por el usuario Emerald7664 sobre el modelo base Qwen/Qwen3.5-4B, con 4.205.751.296 parámetros totales (aproximadamente 4,2 mil millones). El modelo está especializado en roleplay (RP) y roleplay erótico (ERP), y se ha entrenado sobre un dataset de rol generado por un modelo maestro ("teacher") denominado Hy4, descrito en la model card como un MoE de 770B con 49B de parámetros activos. La relevancia del proyecto radica en su enfoque de destilación de creatividad: trasladar el estilo y la capacidad conversacional de un modelo maestro muy grande a un modelo pequeño desplegable en hardware de consumo.

Según la model card, el entrenamiento se realizó íntegramente con el modo "thinking" desactivado, ya que el modelo maestro obtenía puntuaciones anómalamente altas en esa configuración. El autor indica que la versión v0.1 es un primer intento y que planea ajustar hiperparámetros y ampliar el volumen de datos en versiones posteriores. El modelo se distribuye con licencia apache-2.0 en formato safetensors y GGUF, y está etiquetado únicamente para inglés.

No se dispone de información sobre la longitud de contexto, la composición detallada del dataset ni resultados de benchmarks. La model card destaca tres supuestos beneficios: RP/ERP "muy fuerte" con ausencia de rechazos en más de 25.000 completaciones del asistente, prosa "vívida" heredada del maestro y una mejora parcial de la inteligencia dentro del rol.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen 3.5 (tag `qwen3_5_text`); detalles concretos no disponibles |
| Parametros totales | 4.205.751.296 (4,21 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en detalle; el repositorio incluye archivos GGUF ("Quants are as always in the repo") y safetensors |
| Idiomas soportados | Inglés (`en`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y GGUF |
| Modelo base | Qwen/Qwen3.5-4B (relación: finetune) |
| Dataset de entrenamiento | Indexnusrefather/Hy4-Roleplaying-Data-RAW |
| Pipeline | text-generation |
| Tamaño del repositorio | 30,6 GB |
| Fecha de creación (metadatos) | 2026-09-16 |

## Arquitectura y entrenamiento

La información disponible indica que se trata de un ajuste fino supervisado sobre Qwen/Qwen3.5-4B, un modelo de la familia Qwen 3.5 con arquitectura transformer de decodificación y aproximadamente 4,2 mil millones de parámetros totales (el tag de la librería de transformers es `qwen3_5_text`). No se han publicado detalles sobre el número de capas, la dimensión oculta, el mecanismo de atención ni la longitud de contexto del base. Tampoco hay información sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF, DPO u otros métodos de alineación posteriores al SFT.

El elemento técnico distintivo es la estrategia de destilación: el dataset procede de un modelo maestro ("Hy4") descrito como un MoE de 770B de parámetros totales con 49B activos, y el autor afirma haber recopilado más de 25.000 completaciones del asistente sin encontrar un solo rechazo. Todo el material de entrenamiento se generó con el modo de razonamiento desactivado, y la model card recomienda explícitamente mantenerlo desactivado en inferencia para reproducir el comportamiento aprendido. El autor menciona además que está experimentando con LFM 2.5 2.6B y que prevé ampliar el volumen de datos hasta el triple en versiones futuras.

## Capacidades

- Generación de texto conversacional orientada a roleplay (RP) y roleplay erótico (ERP), según la model card.
- Escritura creativa y prosa narrativa: el autor atribuye al maestro un estilo "maduro" que el estudiante heredaría parcialmente.
- Conversaciones multi-turno en inglés dentro de un personaje.
- Comportamiento con baja tasa de rechazos: la model card afirma no haber encontrado rechazos en más de 25.000 completaciones del dataset.
- Razonamiento dentro del rol ("in-roleplay intelligence"), descrito como mejora parcial heredada del maestro.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el modelo está etiquetado solo para inglés.
- Capacidades especiales (visión, audio, thinking mode): no disponibles. El autor recomienda mantener el "thinking" desactivado.

## Casos de uso

- Roleplay conversacional multi-turno: el modelo está ajustado específicamente sobre diálogos de rol, por lo que puede mantener un personaje coherente a lo largo de una conversación en inglés con un estilo narrativo cuidado.
- Escritura creativa y ficción asistida: útil para generar prosa narrativa, diálogos y descripciones con un registro literario más elaborado que el de un modelo base pequeño, gracias a la destilación de un maestro de gran tamaño.
- Personajes no jugadores (NPC) en videojuegos o experiencias interactivas: su tamaño de 4,2 B permite ejecutarlo en local con baja latencia y generar respuestas de personaje sin depender de APIs externas.
- Aplicaciones de compañía o entretenimiento para adultos: el ajuste sin apenas rechazos y su especialización en ERP lo hacen adecuado para este nicho, siempre que se apliquen controles de edad y moderación a nivel de producto.
- Generación de datos sintéticos de rol: puede emplearse para producir diálogos etiquetados que alimenten futuros ajustes finos o pipelines de destilación, replicando el flujo que el propio autor describe.
- Prototipado e investigación sobre desalineación: al ser un modelo explícitamente poco alineado, resulta útil como caso de estudio para medir tasas de rechazo, sesgos y comportamientos límite en modelos pequeños destilados.
- Herramienta de escritura para guionistas y autores de ficción interactiva: la ventana de contexto y el soporte multilingüe no están confirmados, por lo que su uso debería limitarse a inglés y a tramas que no exijan contextos muy extensos.
- Base para ajustes finos posteriores: al ser un modelo de 4,2 B con licencia apache-2.0, puede servir como punto de partida para especializaciones adicionales en otros dominios creativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni evaluaciones de rol estandarizadas, y tampoco se han encontrado datos de este tipo en los resultados de búsqueda web, que no contienen referencias relevantes al modelo.

## Requisitos de hardware

- VRAM estimada para los pesos (solo cálculo aritmético a partir de 4,21 B de parámetros, sin incluir caché KV ni overhead):
  - BF16/FP16: aproximadamente 8,4 GB.
  - INT8: aproximadamente 4,2 GB.
  - GGUF Q4_K_M: aproximadamente 2,5 GB.
  - GGUF Q8_0: aproximadamente 4,5 GB.
- GPU recomendadas: no especificadas por el autor. Por tamaño, un modelo de 4,2 B en BF16 encaja en tarjetas de 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super); en cuantizaciones de 4 bits cabe en GPUs de 6-8 GB. Para servir con concurrencia alta serían preferibles A100, H100 o L40S.
- Viabilidad en GPU de consumo: sí, en cuantización de 4-8 bits cabe en la mayoría de tarjetas consumer modernas; en BF16 requiere al menos 12 GB de VRAM.
- Opciones de despliegue: al publicar safetensors y GGUF, son viables transformers, vLLM, TGI (con safetensors) y llama.cpp u Ollama (con GGUF). No hay confirmación explícita del autor sobre compatibilidad con cada uno de estos frameworks.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formatos | Rendimiento |
|---|---|---|---|---|---|
| Palette-RP-4B-2609-v0.1 | 4,21 B | No disponible | apache-2.0 | safetensors, GGUF | Sin benchmarks publicados |
| Qwen/Qwen3.5-4B (base) | No confirmado (el nombre sugiere ~4 B) | No disponible | No disponible | No disponible | No disponible |
| Otros modelos de rol de ~4 B | No disponible | No disponible | No disponible | No disponible | No disponible |

La información proporcionada no identifica alternativas concretas de la misma categoría (modelos de rol de aproximadamente 4 B) con datos verificables, por lo que no es posible establecer una comparación cuantitativa de rendimiento, contexto o licencia frente a ellos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. El entrenamiento se realizó sobre datos generados por un único modelo maestro, lo que puede propagar los sesgos estilísticos y de contenido de ese maestro.
- Riesgo de alucinación: no evaluado. Al ser un modelo especializado en ficción y rol, no está orientado a la exactitud factual y no debería usarse como fuente de información verificada.
- Idiomas: únicamente inglés según los metadatos; se desaconseja su uso en castellano u otros idiomas sin una evaluación previa.
- Contenido para adultos: la propia model card indica que el maestro era "muy poco alineado" y que no se encontró ningún rechazo en más de 25.000 completaciones. Esto implica una ausencia práctica de mecanismos de rechazo, por lo que requiere moderación externa obligatoria en cualquier producto orientado al público general.
- Estado del proyecto: el autor lo describe como una primera versión ("v0.1") que "todavía necesita muchas pruebas" y cuyos hiperparámetros de entrenamiento seguirá ajustando. No debe considerarse una versión estable.
- Modo de razonamiento: el autor recomienda mantener el "thinking" desactivado, ya que los datos de entrenamiento se generaron así; activarlo puede degradar el comportamiento esperado.
- Licencia: apache-2.0 permite uso comercial, pero el usuario asume la responsabilidad sobre el contenido generado y sobre el cumplimiento normativo aplicable a material para adultos.
- Adopción: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe validación independiente de la comunidad ni informes de terceros sobre su comportamiento en producción.
- Longitud de contexto desconocida: no se puede garantizar un rendimiento correcto en conversaciones largas o con prompts extensos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Emerald7664/Palette-RP-4B-2609-v0.1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/Indexnusrefather/Hy4-Roleplaying-Data-RAW
- Modelo maestro "Hy4": no disponible (no se proporciona enlace en la información consultada)
- Paper, blog o repositorio adicional: no disponible
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces obtenidos correspondían a sitios de preguntas y respuestas sin relación con el mismo.
