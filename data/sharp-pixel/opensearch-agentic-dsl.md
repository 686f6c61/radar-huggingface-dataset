# sharp-pixel/opensearch-agentic-dsl

## Resumen

`opensearch-agentic-dsl` es un adaptador LoRA (QLoRA) desarrollado por sharp-pixel que traduce peticiones de compradores en inglés a consultas OpenSearch DSL sobre un catálogo de lujo de segunda mano. No es un modelo de propósito general: es un especialista de dominio entrenado para alimentar la herramienta nativa `QueryPlanningTool` de Agentic Search de OpenSearch, de modo que un agente pueda generar cuerpos de consulta JSON válidos a partir de lenguaje natural y controles de aplicación de confianza.

El adaptador se monta sobre `mistralai/Ministral-3-8B-Instruct-2512-BF16` (revisión `06cc81bfd6e45321d8fc8f816576c5b6ac67ec22`), un modelo de 8 000 millones de parámetros con codificador visual, del que solo se adaptan las proyecciones de atención y MLP del decodificador de lenguaje; el codificador visual y el proyector permanecen congelados. El resultado es un artefacto de unos 0,1 GB que se distribuye como adaptador PEFT y se sirve junto al modelo base.

Su relevancia es acotada pero clara: demuestra un patrón de especialización barata (1,76 horas en una RTX PRO 6000 Blackwell, 4 640 ejemplos sintéticos) para convertir intenciones de usuario en DSL de búsqueda estructurada, con salida restringida a `size`, `track_total_hits`, `query` y `sort` opcional. La licencia Apache 2.0 del adaptador y del modelo base facilita su uso comercial, aunque el autor advierte explícitamente de que la evaluación es sintética y no mide calidad de recuperación real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder-only (Ministral-3-8B-Instruct, con codificador visual congelado) |
| Parámetros totales | 8 000 millones (modelo base); adaptador LoRA de rango 16 (tamaño de repo 0,1 GB) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (longitud de secuencia de entrenamiento: 2 112 tokens) |
| Tipos de cuantización | Entrenamiento en 4-bit NF4 con cómputo BF16; el adaptador se distribuye en safetensors |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 (adaptador y modelo base) |
| Formato de pesos | safetensors (adaptador PEFT); modelo base en BF16 |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA y supervisión solo en la completación (*completion-only supervision*): la cuantización es 4-bit NF4 con cómputo en BF16, rango LoRA 16, alpha 32 y dropout 0,05. Se aplican 2 épocas sobre secuencias de 2 112 tokens, con tasa de aprendizaje 0,0001 y tamaño de lote efectivo 16. Solo se adaptan las proyecciones de atención y MLP del modelo de lenguaje; el codificador visual y el proyector del Ministral base quedan congelados, lo que reduce el coste y el tamaño del artefacto.

El conjunto de datos consta de 4 640 ejemplos sintéticos de entrenamiento y 1 160 de validación, agrupados para que escenarios relacionados no se repartan entre particiones (*grouped split*). La entrada combina el texto del comprador, controles de aplicación de confianza, el mapeo del índice y la lista de campos permitidos, con un prompt de sistema y una plantilla de usuario publicados en el repositorio. La salida es un único cuerpo de petición JSON con `size`, `track_total_hits` entero, `query` y `sort` opcional; el planificador aplica filtros obligatorios, techos de precio y el modo de ranking seleccionado, mientras que la expansión de persona aporta puntuación opcional. La selección de índice, los pipelines de búsqueda y `_source` quedan bajo control de la aplicación.

## Capacidades

- Traducción de lenguaje natural a OpenSearch DSL para un catálogo de lujo de segunda mano, con salida JSON restringida a un esquema fijo.
- Aplicación de filtros obligatorios, límites de precio y modos de ranking definidos por la aplicación.
- Expansión de persona para puntuación opcional dentro de la consulta generada.
- Integración con `QueryPlanningTool` de Agentic Search de OpenSearch.
- Soporte de *tool calling* implícito a través del contrato de entrada/salida del planificador.
- Decodificación greedy en el ejemplo incluido; no se documentan modos de razonamiento extendido.
- Capacidad multilingüe limitada al inglés.
- No se documentan capacidades de visión operativas en el adaptador (el codificador visual está congelado y el caso de uso es texto a DSL).

## Casos de uso

- Búsqueda conversacional en un marketplace de lujo de segunda mano: el adaptador convierte una petición como una descripción de bolso con presupuesto en un cuerpo DSL con `query`, filtros de precio y `sort`, listo para enviarse a OpenSearch sin intervención manual.
- Planificación de consultas en un agente de atención al cliente: al integrarse en `QueryPlanningTool`, permite que un agente multi-paso traduzca cada turno de la conversación en una consulta estructurada y encadene refinamientos sucesivos.
- Enrutado de filtros de política: los controles de aplicación de confianza se inyectan en la entrada, de modo que el modelo aplica techos de precio y filtros obligatorios de forma consistente en cada consulta generada.
- Prototipado rápido de interfaces de búsqueda: con 1,76 horas de entrenamiento y un adaptador de 0,1 GB, un equipo puede especializar el modelo en un dominio nuevo partiendo de este esquema y validar el pipeline antes de invertir en datos reales.
- Servicio de inferencia con vLLM: el adaptador se sirve con LoRA de rango máximo 16 cargando solo el modelo de lenguaje, lo que permite atender varias aplicaciones sobre una misma instancia del base.
- Generación de consultas para paneles internos de analítica: el modelo produce `track_total_hits` y `size` coherentes con las convenciones de la aplicación, reduciendo errores de construcción manual del DSL.
- Base para experimentos de text-to-DSL en otros catálogos: el prompt de sistema, la plantilla de usuario y el ejemplo publicado sirven como referencia reproducible para adaptar el enfoque a otros mapeos de índice.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor solo reporta métricas de entrenamiento y validación:

| Métrica | Valor |
|---|---:|
| Pérdida de entrenamiento | 0,0038393672 |
| Pérdida en validación | 0,0016606329 |
| Precisión de token en validación | 99,9305% |

La precisión de token se mide con objetivos forzados por el profesor (*teacher forcing*), no con peticiones generadas libremente, y la evaluación sintética no establece calidad de recuperación en el mundo real.

## Requisitos de hardware

- VRAM estimada para inferencia: el ejemplo incluido requiere una GPU CUDA con memoria suficiente para el modelo base en BF16 (aproximadamente 16 GB solo para pesos, más overhead de activaciones y contexto); el adaptador añade un coste marginal.
- GPU recomendadas: RTX PRO 6000 Blackwell (usada para entrenamiento), A100, H100 para servicio en BF16; RTX 4090 (24 GB) es viable para el base en BF16 con contexto moderado.
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB o más para BF16; con cuantización adicional del base podría ajustarse en 16 GB, aunque no se documenta esa configuración.
- Opciones de despliegue: Transformers 5.13.0 + PEFT 0.19.1 + PyTorch 2.13.0 (ejemplo oficial), o vLLM con LoRA habilitado a rango máximo 16 y carga solo del modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| opensearch-agentic-dsl | 8 000 M (base) + LoRA r16 | no disponible | Text-to-OpenSearch DSL | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Mistral-7B-Instruct | 7 000 M | 32 000 tokens (versión estándar) | Propósito general | Apache 2.0 | Hugging Face |
| Ministral-3-8B-Instruct (base) | 8 000 M | no disponible en esta ficha | Propósito general con visión | Apache 2.0 | Hugging Face |
| Adaptadores text-to-SQL genéricos | variable | variable | Text-to-SQL, no DSL de búsqueda | variable | Hugging Face |

La comparación directa con alternativas de text-to-DSL para OpenSearch no está disponible en la información proporcionada; el modelo se distingue por su contrato de salida cerrado y su integración específica con `QueryPlanningTool`.

## Limitaciones y advertencias

- Evaluación exclusivamente sintética: no se ha medido la calidad de recuperación real sobre el catálogo; el autor recomienda validar el DSL generado contra el mapeo y la política de la aplicación.
- Precisión de token del 99,93% medida con teacher forcing, no con generación libre; el rendimiento en producción puede degradarse.
- Idioma limitado al inglés; no se documenta soporte multilingüe.
- Dominio estrecho: catálogo de lujo de segunda mano; la transferencia a otros mapeos requiere reentrenamiento o ajuste.
- Riesgo de alucinación en campos o valores del DSL si la entrada no respeta el formato esperado (doble codificación JSON del mapeo y de la lista de campos).
- La selección de índice, los pipelines y `_source` quedan fuera del modelo; la aplicación debe imponer permisos y límites de recursos en OpenSearch.
- El adaptador requiere cargar el modelo base en la revisión exacta indicada; otras revisiones pueden romper la compatibilidad.
- Sin descargas ni valoraciones en el momento de la consulta; madurez y soporte comunitario limitados.
- La licencia Apache 2.0 cubre adaptador y documentación; el código de aplicación y los datos de entrenamiento conservan sus propias licencias.

## Enlaces

- Hugging Face: https://huggingface.co/sharp-pixel/opensearch-agentic-dsl
- Modelo base: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512-BF16
- Repositorio de código y datos de entrenamiento: https://github.com/sharp-pixel/LaTrouvaille/tree/7b26a2a56b71eab674ad8d53be5c1d06353967c8/query-understanding-training
- Prompt de sistema: prompts/system.txt (incluido en el repositorio del modelo)
- Plantilla de usuario: prompts/user.txt (incluida en el repositorio del modelo)
- Ejemplo de ejecución: example.py (incluido en el repositorio del modelo)
