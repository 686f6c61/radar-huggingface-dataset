# OfflineBase/Muse-Glimmer-30B-Knowledge-Stage-B-R30-LoRA

## Resumen

Muse-Glimmer-30B-Knowledge-Stage-B-R30-LoRA es un adaptador LoRA de tipo PEFT publicado por OfflineBase sobre el modelo base meta-models/Muse-Glimmer-30B (30.000 millones de parámetros, licencia Apache 2.0 según el autor). El adaptador forma parte de la "Glimmer 2026 knowledge run" y corresponde a la etapa B sobre la mezcla r30, la ejecución previa a r30b, que dio lugar al modelo Knowledge publicado. El repositorio se declara explícitamente privado y sin la revisión de licencia y datos personales necesaria para una publicación pública.

El objetivo declarado es la actualización de conocimiento: el adaptador se entrena sobre pares pregunta-respuesta generados a partir de pasajes de texto público de 2026, con el fin de inyectar información reciente en el modelo base sin reentrenarlo por completo. El adaptador se carga sobre el modelo base en BF16 y ocupa 1,7 GB en el repositorio, lo que es coherente con un adaptador LoRA de rango moderado sobre un modelo de 30B.

Es relevante ahora porque ejemplifica una práctica habitual en el ecosistema abierto: adaptadores de bajo rango para refrescar conocimiento de forma barata, con licencias derivadas y avisos explícitos sobre alucinaciones y sobre la incertidumbre legal de entrenar con texto de prensa. No es un lanzamiento oficial de Meta y el propio autor lo desmarca del modelo Knowledge publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Muse-Glimmer-30B); adaptador LoRA/PEFT |
| Parametros totales | 30B en el modelo base; tamano del adaptador no disponible (repo de 1,7 GB) |
| Parametros activos | no disponible (no se indica que el base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M mencionado en la model card; otras no disponibles |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0-and-muse-model-license (Derivative bajo Muse Model License) |
| Formato de pesos | safetensors (PEFT/LoRA); GGUF disponible en repo aparte |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el transformer Muse-Glimmer-30B de Meta, que el autor indica que se distribuye en BF16 bajo Apache 2.0. Se trata de un LoRA de la librería PEFT: no se reentrena el modelo completo, sino que se añaden matrices de bajo rango que ajustan el comportamiento del base. La model card no detalla el rango, el alpha ni qué módulos se adaptan.

El entrenamiento usó 60.000 filas, de las cuales 18.000 incluyen razonamiento, generadas a partir del adaptador de la etapa 2. Los pares pregunta-respuesta fueron escritos por Muse Spark Open y Muse Glimmer sobre pasajes de texto público de 2026, según el autor, no datos inventados. El campo `base_model` de `adapter_config.json` se modificó de una ruta local a `meta-models/Muse-Glimmer-30B`; no se indica ningún otro cambio. No se documentan RLHF, DPO ni detalles de composición del dataset más allá de la procedencia del texto.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`).
- Actualización de conocimiento factual sobre eventos y textos de 2026, objetivo declarado del adaptador.
- Razonamiento en una parte del conjunto de entrenamiento (18.000 de 60.000 filas con trazas de razonamiento).
- Carga como adaptador PEFT sobre el modelo base en BF16.
- Tool calling, function calling, agentes y capacidades multimodales: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles (idiomas no declarados).

## Casos de uso

- Actualización de conocimiento sin reentrenamiento: cargar el adaptador sobre Muse-Glimmer-30B para responder preguntas sobre textos públicos de 2026, aprovechando que el LoRA solo añade 1,7 GB frente a los pesos completos del base.
- Experimentación en investigación sobre edición de conocimiento: comparar esta etapa B (r30) con la etapa r30b y con el modelo Knowledge publicado para estudiar cómo evoluciona la retención de hechos entre etapas.
- Evaluación de olvido catastrófico: medir, con los conjuntos de prueba del run log, cuánto conocimiento previo se conserva tras aplicar el adaptador (el autor reporta 40 de 40 hechos antiguos en la prueba citada).
- Prototipado de asistentes conversacionales con conocimiento temporal: útil en entornos controlados donde se pueda verificar cada respuesta contra una fuente, dado el riesgo de alucinación declarado.
- Despliegue con cuantización GGUF Q4_K_M en hardware modesto: el autor menciona una variante GGUF en un repositorio aparte, lo que permite probar el adaptador fusionado en entornos con VRAM limitada.
- Estudio de cumplimiento y licencias: analizar las obligaciones de la Muse Model License (mantener LICENSE, NOTICE, mostrar "Built with Muse Spark Open") en un caso real de modelo derivado.

## Benchmarks y rendimiento

| Prueba | Resultado | Condiciones |
|---|---|---|
| Acierto global | 26,2% de 2.500 | Q4_K_M, decodificación greedy, conjuntos del run log |
| Hechos antiguos retenidos | 40 de 40 | Q4_K_M, decodificación greedy |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor advierte que estas cifras provienen de los conjuntos de prueba del run log y que no todas las pruebas de la familia Knowledge se repitieron sobre este archivo.

## Requisitos de hardware

- VRAM estimada para el modelo base en BF16: aproximadamente 60 GB para los 30B parámetros, más el adaptador (1,7 GB en disco) y el overhead de activaciones y KV cache.
- VRAM estimada con cuantización Q4_K_M: del orden de 17-20 GB para los pesos, según el tamaño típico de un modelo de 30B a 4 bits; cifra no confirmada por el autor.
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB o varias GPU con tensor parallelism.
- GPU de consumo: un modelo de 30B en Q4_K_M puede caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB) con contexto moderado; en BF16 no cabe en GPU de consumo.
- Opciones de despliegue: PEFT sobre el base con Transformers; llama.cpp u Ollama para la variante GGUF; vLLM y TGI no están confirmados para este adaptador en la información disponible.
- Latencia y throughput: no disponibles. El autor indica que no se ha ejecutado en una Jetson en ningún log.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Muse-Glimmer-30B-Knowledge-Stage-B-R30-LoRA | 30B (base) + LoRA | no disponible | apache-2.0-and-muse-model-license | Adaptador privado, etapa intermedia |
| OfflineBase/Muse-Glimmer-30B-2026-Knowledge | 30B (base) + adaptador | no disponible | no disponible en la información | Modelo Knowledge publicado |
| OfflineBase/Muse-Glimmer-30B-2026-Knowledge-LoRA | 30B (base) + LoRA | no disponible | Muse Model License (según la card) | Adaptador de referencia citado por el autor |
| meta-models/Muse-Glimmer-30B | 30B | no disponible | Apache 2.0 | Modelo base de Meta |

No se dispone de datos de rendimiento comparables entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Alucinación: el autor advierte explícitamente de que el modelo inventa y presenta respuestas erróneas como hechos; no debe usarse para datos factuales sin fuente.
- Datos de entrenamiento: proceden de noticias y texto web público, incluidos sitios de editores recogidos vía CC-NEWS; el propio autor señala que publicar pesos entrenados con ellos es una cuestión abierta.
- Licencia derivada: al haberse entrenado en parte con datos generados por Muse Spark Open, el modelo es un Derivado bajo la Muse Model License, con obligaciones de mantener LICENSE, MUSE_MODEL_LICENSE.md, USAGE_POLICY.md y NOTICE, y de mostrar "Built with Muse Spark Open".
- Política de uso: las políticas de Muse Glimmer y Muse Spark Open indican que los modelos no están pensados para menores de 18 años y prohíben presentar las salidas como escritas por una persona.
- Estado del repositorio: el autor lo declara privado y sin revisión de licencia ni de datos personales para publicación pública.
- No es un lanzamiento oficial de Meta; Meta no lo ha revisado ni respaldado y no hay garantía.
- Idiomas soportados y longitud de contexto no declarados.
- Las métricas reportadas son parciales y provienen de conjuntos de prueba internos, no de benchmarks estándar.

## Enlaces

- HuggingFace: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-Knowledge-Stage-B-R30-LoRA
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Modelo Knowledge publicado: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge
- Adaptador de referencia: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge-LoRA
- Repositorio GGUF (mencionado en la card, sin URL directa): no disponible
