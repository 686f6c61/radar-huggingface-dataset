# jancirnodziewiaty/Omega-Arsenal-12B-oQ4e

## Resumen

Omega-Arsenal-12B-oQ4e es una cuantización mixta del modelo ReadyArt/Omega-Arsenal-12B, publicada por el usuario jancirnodziewiaty. El checkpoint contiene 11.959.730.224 parámetros y se distribuye en formato MLX (safetensors), con un peso efectivo medio de 4,734 bits por parámetro y un tamaño total de 7,078 GB (6,592 GiB). No es un modelo entrenado desde cero: es un artefacto de compresión pensado para ejecutar el modelo base en hardware Apple Silicon con un consumo de memoria reducido.

La pieza diferencial es el esquema de cuantización. En lugar de aplicar 4 bits de forma uniforme, se usó la herramienta oQ de oMLX (v0.7.3.dev1) para asignar precisión por bloques: el 81,337% de los pesos queda en affine 4-bit (grupo de 64), el 16,752% en affine 5-bit, el 1,611% en affine 6-bit y un residual del 0,301% se conserva en BF16. El resultado es un ahorro de almacenamiento típico de una cuantización de 4 bits, pero con capas sensibles protegidas a 5 y 6 bits.

El checkpoint incluye dos componentes: el modelo de lenguaje (11,925B parámetros, 7,007 GB) y un módulo de visión (0,035B parámetros, 0,070 GB), lo que confirma que el modelo base es multimodal. La etiqueta de arquitectura del config de MLX es `gemma4_unified`, lo que apunta a la familia Gemma como origen arquitectónico, aunque la model card no documenta ni el entrenamiento ni los datos del modelo base. Con cero descargas y cero likes en el momento de la consulta, se trata de una publicación muy reciente (25 de octubre de 2026) sin validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal; tag de config MLX `gemma4_unified` (detalles del modelo base no disponibles) |
| Parámetros totales | 11.959.730.224 (11,960B) |
| Parámetros activos | No disponible (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Mixta affine 4/5/6-bit con group size 64, más tensores BF16; 4,734 bits/peso efectivos |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors en formato MLX (librería `mlx`) |
| Desglose de precisión | 4-bit: 9,728B (81,337%) · 5-bit: 2,003B (16,752%) · 6-bit: 0,193B (1,611%) · BF16: 0,036B (0,301%) |
| Componentes | Lenguaje: 11,925B (7,007 GB) · Visión: 0,035B (0,070 GB) |
| Tamaño del repositorio | 7,1 GB (6,592 GiB de pesos) |
| Herramienta de cuantización | oQ de oMLX v0.7.3.dev1 |

## Arquitectura y entrenamiento

No hay información sobre el entrenamiento en la documentación disponible. La model card se limita a describir el proceso de cuantización; no indica número de tokens, composición del dataset, fases de SFT, RLHF o DPO, ni innovaciones de atención o decodificación. La etiqueta `gemma4_unified` del config de MLX sugiere que el grafo corresponde a la familia Gemma en su variante unificada (lenguaje + visión), pero esto es una inferencia a partir de la etiqueta, no un dato confirmado por el autor.

Lo que sí está documentado es el perfil de compresión. La cuantización se aplicó con oQ, que asigna precisión por bloques según la sensibilidad de cada tensor: los tensores mayoritarios (9,728B, el 81,337% de los pesos lógicos) se almacenan en affine 4-bit con grupo de 64, lo que ocupa 5,096 GiB; un 16,752% se eleva a 5-bit (1,283 GiB); un 1,611% a 6-bit (0,146 GiB); y 36 millones de parámetros permanecen en BF16 (0,067 GiB), presumiblemente capas de normalización, embeddings o proyecciones críticas. El resultado es un checkpoint de 6,592 GiB que ocupa 7,078 GB en disco, frente a los aproximadamente 23,9 GB que requeriría el mismo modelo en BF16.

## Capacidades

- Generación de texto y razonamiento general: heredadas del modelo base ReadyArt/Omega-Arsenal-12B, sin evaluación publicada en este checkpoint.
- Procesamiento de imágenes: el checkpoint incluye un módulo de visión de 0,035B parámetros, por lo que se espera soporte de entrada multimodal (imagen + texto), aunque la model card no detalla la resolución, el número de tokens visuales ni las tareas soportadas.
- Conversación multi-turno: el formato de plantilla de chat no está documentado en la ficha; debe consultarse el repositorio del modelo base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible; no se documenta modo thinking ni presupuesto de razonamiento.
- Capacidades multilingües: no disponibles; no se declara ningún conjunto de idiomas.
- Capacidades especiales (audio, vídeo, código, matemáticas): no disponibles. No se han publicado evaluaciones que las confirmen o descarten.
- Eficiencia de memoria: capacidad verificable del artefacto; permite cargar un modelo de 12B en menos de 7 GiB de pesos en memoria unificada.

## Casos de uso

- Asistente de código local en Mac: con 11,96B parámetros y 6,592 GiB de pesos, el modelo cabe en un MacBook con 16 GB de memoria unificada y permite autocompletado y explicación de código sin enviar el repositorio a un servicio externo. Es adecuado para entornos con requisitos de confidencialidad, siempre que se valide la calidad real del modelo base en código.
- Análisis de documentos con imágenes: el módulo de visión permite pasar capturas, diagramas o páginas escaneadas junto a una pregunta en lenguaje natural. Apropiado para extraer campos de facturas o resumir figuras técnicas en un flujo local.
- RAG sobre documentación interna en una laptop: el bajo coste de memoria deja espacio para un índice vectorial y el contexto en el mismo equipo, lo que permite montar un asistente sobre manuales corporativos sin infraestructura de GPU.
- Prototipado rápido de agentes: al ejecutarse sobre MLX con `mlx_lm.server`, se puede exponer una API compatible con OpenAI en localhost y conectar frameworks de agentes para validar flujos antes de migrar a un modelo mayor en servidor.
- Traducción y reescritura de textos en estudio editorial: un modelo de 12B cuantizado a 4,7 bits es suficiente para tareas de post-edición y adaptación de tono en local, con la ventaja de que el manuscrito no sale del equipo. Requiere verificar previamente la cobertura de idiomas, que no está declarada.
- Inferencia en clúster de Mac Mini para servicios internos: varios equipos con memoria unificada de 24-32 GB pueden servir este checkpoint con `mlx_lm.server` para cargas de baja concurrencia, como clasificación de tickets o generación de resúmenes por lotes, sin coste de GPU dedicada.
- Evaluación comparativa de cuantizaciones: por su mezcla 4/5/6-bit documentada, sirve como referencia para medir la pérdida de calidad frente al BF16 del mismo modelo base en tareas concretas del dominio propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, MMMU ni ninguna otra métrica de calidad, y tampoco se aportan comparaciones contra el modelo base en BF16 para cuantificar la degradación introducida por la cuantización mixta.

## Requisitos de hardware

- VRAM/memoria unificada para los pesos: 6,592 GiB (7,078 GB en disco). Con overhead de runtime, KV cache y contexto, se recomienda un mínimo de 10-12 GB de memoria disponible.
- Memoria recomendada: 16 GB de memoria unificada para uso interactivo con contexto moderado; 24-32 GB para contextos largos, imágenes de alta resolución o varias secuencias en paralelo.
- GPU compatibles: exclusivamente Apple Silicon (M1, M2, M3, M4 y variantes Pro, Max y Ultra), ya que el checkpoint está en formato MLX. No es cargable directamente en CUDA.
- GPU NVIDIA: no soportadas de forma nativa por este artefacto. Para usar el modelo en A100, H100 o RTX 4090 habría que recurrir al modelo base en safetensors BF16 (aproximadamente 23,9 GB de pesos) o generar una cuantización GGUF/AWQ propia.
- Opciones de despliegue: `mlx-lm` (carga directa y generación), `mlx_lm.server` (API HTTP local), LM Studio y otras aplicaciones con backend MLX. No es compatible con vLLM, TGI ni llama.cpp sin de-cuantizar y reconvertir los pesos.
- Throughput y latencia: no disponibles. No se han publicado mediciones de tokens por segundo para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / precisión | Licencia | Observaciones |
|---|---|---|---|---|---|
| Omega-Arsenal-12B-oQ4e (este) | 11,96B | No disponible | MLX safetensors, mixta 4/5/6-bit (4,734 bits/peso), 6,592 GiB | No disponible | Cuantización comunitaria, 0 descargas, sin benchmarks |
| ReadyArt/Omega-Arsenal-12B (base) | 11,96B | No disponible | safetensors BF16 (estimado ~23,9 GB de pesos) | No disponible | Referencia de calidad; permite medir la degradación de la cuantización |
| Cuantización uniforme 4-bit del mismo base | 11,96B | No disponible | ~4,5 bits/peso efectivos (estimado ~6,7 GB) | No disponible | Alternativa teórica; la mezcla 4/5/6-bit de oQ debería conservar mejor las capas sensibles |
| Otros modelos de ~12B con visión | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables para establecer una comparación con alternativas de terceros |

No se dispone de información suficiente para comparar rendimiento (throughput, calidad en benchmarks) con modelos de la misma categoría. La única comparación sustentada en datos es la del apartado de almacenamiento frente al modelo base en BF16.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización clara de uso comercial. Es un bloqueante para producción hasta que el autor o el propietario del modelo base la definan.
- Procedencia del modelo base opaca: la model card no documenta el entrenamiento, los datos ni el alineamiento de ReadyArt/Omega-Arsenal-12B. No se puede evaluar qué sesgos, filtros de seguridad o capacidades reales hereda.
- Sin validación comunitaria: cero descargas y cero likes en el momento de la consulta, publicación de un solo día. No hay informes independientes de calidad ni de estabilidad.
- Degradación por cuantización no medida: el 81,337% de los pesos está a 4 bits con grupo de 64. Es esperable cierta pérdida en matemáticas, código y tareas de razonamiento largo, pero no se aporta ninguna comparación con el BF16 que la cuantifique.
- Riesgo de alucinación: inherente a los modelos de ~12B sin evaluación publicada; no hay datos de calibración ni de tasas de error en dominios factuales.
- Idiomas y contexto desconocidos: no se declara cobertura lingüística ni longitud de ventana, lo que impide garantizar el comportamiento en castellano o en contextos largos.
- Restricción de plataforma: el formato MLX limita el despliegue a Apple Silicon. Fuera de ese ecosistema hay que reconvertir pesos, lo que anula la ventaja de tamaño de este checkpoint.
- Módulo de visión mínimo: 0,035B parámetros para el encoder visual es una fracción muy pequeña del total; conviene validar empíricamente la calidad en OCR y comprensión de gráficos antes de confiar en ella.
- Plantilla de chat no documentada: un formato de prompt incorrecto degrada notablemente la calidad; hay que consultar el repositorio del modelo base.
- Fecha de creación futura en los metadatos (2026-10-25): conviene verificar la integridad del repositorio antes de integrarlo en un pipeline.

## Enlaces

- [HuggingFace: jancirnodziewiaty/Omega-Arsenal-12B-oQ4e](https://huggingface.co/jancirnodziewiaty/Omega-Arsenal-12B-oQ4e)
- [Modelo base: ReadyArt/Omega-Arsenal-12B](https://huggingface.co/ReadyArt/Omega-Arsenal-12B)
- [oQ / oMLX, herramienta de cuantización mixta empleada](https://github.com/jundot/omlx)
- [MLX, framework de Apple para Apple Silicon](https://github.com/ml-explore/mlx)
- [mlx-lm, librería de carga y servidor de inferencia](https://github.com/ml-explore/mlx-lm)

No se han encontrado en la búsqueda web papers, blogs, demos ni repositorios adicionales relevantes para este modelo.
