# anonymous-openreview/acm-post-trained-qwen3.5-9b

## Resumen

acm-post-trained-qwen3.5-9b es un ajuste fino (post-entrenamiento) del modelo base Qwen/Qwen3.5-9B, publicado por el autor anónimo anonymous-openreview. El modelo está orientado a tareas de investigación profunda agéntica (deep research), es decir, flujos en los que el modelo encadena múltiples pasos de búsqueda, lectura y síntesis de información, apoyándose en una herramienta explícita de memoria y gestión de contexto. Se distribuye como un modelo fusionado completo (visión + lenguaje) en bf16, listo para servir directamente sin pasos adicionales de merge.

La relevancia del modelo radica en su enfoque: en lugar de un chatbot generalista, ofrece un checkpoint ya post-entrenado para un caso de uso concreto (agentes de investigación con ventana de contexto de 128K y soporte de tool calling), con un resultado declarado de 72,7% de pass@1 en BrowseComp-Plus usando la herramienta de memoria. El repositorio tiene 9.653.104.368 parámetros en safetensors (aproximadamente 9,65 mil millones) y un tamaño de 19,3 GB, coherente con pesos en bf16.

El modelo hereda la arquitectura y el conocimiento del Qwen3.5-9B original y añade capacidades agénticas específicas. La licencia Apache 2.0 facilita su uso comercial, aunque al ser un ajuste fino anónimo y sin datos de evaluación independientes, conviene tratarlo con cautela en producción hasta validarlo en el dominio propio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-9B); multimodal visión + lenguaje |
| Parámetros totales | 9.653.104.368 (~9,65 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (128K) |
| Tipos de cuantización | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo fusionado, bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer multimodal que combina visión y lenguaje, y se distribuye como checkpoint fusionado completo en bf16. La información disponible no detalla la composición del dataset de post-entrenamiento, el número de tokens utilizados, ni si se emplearon técnicas de RLHF, DPO u otras variantes de alineación. Tampoco se especifican innovaciones arquitectónicas propias más allá de las heredadas del modelo base.

El elemento diferencial declarado es el post-entrenamiento para flujos agénticos de deep research con una herramienta de memoria y gestión de contexto (memory tool). El modelo está preparado para servirse con vLLM usando el parser de tool calling `qwen3_xml`, lo que sugiere que el formato de llamada a herramientas sigue la convención XML de la familia Qwen3. No se han publicado detalles sobre la estrategia de entrenamiento (por ejemplo, número de trayectorias agénticas, datos de BrowseComp-Plus o técnicas de destilación).

## Capacidades

- Generación de texto y razonamiento multi-paso orientado a investigación.
- Procesamiento de visión, al distribuirse como modelo fusionado visión + lenguaje.
- Tool calling / function calling, con soporte explícito del parser `qwen3_xml` en vLLM.
- Uso de una herramienta de memoria y gestión de contexto, pensada para mantener información relevante a lo largo de ventanas de hasta 128K tokens.
- Comportamiento agéntico para deep research: encadenamiento de búsquedas, lectura de fuentes y síntesis.
- Capacidades multilingües: no disponible (no se especifican idiomas).
- Modo de razonamiento extendido (thinking): no disponible en la información proporcionada.

## Casos de uso

- Investigación profunda automatizada: el modelo puede orquestar secuencias de búsqueda, lectura y resumen de fuentes, usando la herramienta de memoria para conservar hallazgos relevantes a lo largo de una ventana de 128K tokens. Es el caso de uso para el que fue post-entrenado.
- Asistentes de análisis documental de largo aliento: con 131.072 tokens de contexto, puede procesar informes extensos, contratos o expedientes y mantener un hilo de razonamiento coherente entre documentos.
- Pipelines de verificación de hechos: el patrón agéntico permite lanzar consultas, contrastar fuentes y registrar evidencias en la memoria del agente, reduciendo la pérdida de contexto entre pasos.
- Automatización de due diligence o inteligencia competitiva: el modelo puede recopilar información pública sobre empresas o mercados y sintetizarla en informes estructurados, con trazabilidad de las fuentes consultadas.
- Agentes de soporte a la investigación académica: revisión de literatura, extracción de conclusiones de múltiples papers y generación de resúmenes comparativos con contexto largo.
- Integración en plataformas de agentes con vLLM: al servirse con `--tool-call-parser qwen3_xml`, encaja en infraestructuras que ya exponen herramientas vía API compatible con OpenAI y necesitan un modelo con formato de tool calling estable.
- Análisis de documentos con componente visual: al incluir visión, puede procesar capturas, gráficos o páginas escaneadas junto con texto en el mismo flujo agéntico.

## Benchmarks y rendimiento

| Benchmark | Configuración | Resultado |
|---|---|---|
| BrowseComp-Plus (pass@1) | Herramienta de memoria, contexto 128K | 72,7% |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar, ni comparativas numéricas con modelos similares.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 19,3 GB solo para pesos, más overhead de KV cache y activaciones; en la práctica, se recomienda al menos 24 GB para contexto corto y bastante más para aprovechar los 128K tokens.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para servicio con contexto largo; RTX 4090 (24 GB) puede servir en bf16 con contexto reducido o mediante cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) con contexto limitado; en GPUs de 16 GB requeriría cuantización a 8 bits o inferior.
- Despliegue: vLLM es la opción indicada por el autor, con `--tool-call-parser qwen3_xml` y ventana de contexto de 131072. Otras alternativas como llama.cpp, Ollama o TGI no están documentadas para este checkpoint.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| acm-post-trained-qwen3.5-9b | ~9,65 B | 131.072 | Deep research agéntico con memory tool | Apache 2.0 | Hugging Face (repo anónimo) |
| Qwen/Qwen3.5-9B (base) | ~9,65 B | no disponible en esta ficha | Modelo generalista multimodal | no disponible en esta ficha | Hugging Face |
| Alternativas de ~9B para agentes | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible no permite establecer comparaciones numéricas con otros modelos de la misma categoría; solo se dispone del resultado declarado en BrowseComp-Plus para este checkpoint.

## Limitaciones y advertencias

- El autor es anónimo (anonymous-openreview) y el repositorio registra 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente del checkpoint.
- El único benchmark reportado es BrowseComp-Plus; no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones de seguridad o sesgo.
- No se documentan los datos de post-entrenamiento, lo que impide evaluar posibles sesgos heredados o introducidos.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente crítico en flujos de investigación donde el modelo cita fuentes; conviene verificar las referencias generadas.
- No se especifican los idiomas soportados; el rendimiento en castellano no está garantizado ni medido.
- El uso de la memory tool y del parser `qwen3_xml` requiere configuración específica en vLLM; un despliegue incorrecto puede degradar el comportamiento agéntico.
- La licencia Apache 2.0 permite uso comercial, pero al tratarse de un ajuste fino anónimo sin procedencia verificable del dataset, conviene auditar el modelo antes de integrarlo en productos.
- El contexto de 128K exige hardware con VRAM suficiente; en GPUs de consumo el contexto efectivo será mucho menor.

## Enlaces

- Hugging Face: https://huggingface.co/anonymous-openreview/acm-post-trained-qwen3.5-9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
