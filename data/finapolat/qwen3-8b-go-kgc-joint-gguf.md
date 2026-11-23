# FinaPolat/Qwen3-8B-GO-KGC-joint-gguf

## Resumen

GO-KGC (Grounded Ontology-based Knowledge Graph Construction) es un modelo de lenguaje especializado en la extracción de grafos de conocimiento a partir de texto libre, con la particularidad de que toda entidad, relación y literal extraído debe estar anclado (grounded) a un fragmento del texto de origen y tipado según una ontología proporcionada. Esta variante "joint" realiza en una sola pasada tanto la extracción de tripletas como el enlazado de entidades (entity linking) contra una base de conocimiento. El modelo se distribuye como cuantizaciones GGUF del checkpoint fine-tuneado `FinaPolat/Qwen3-8B-GO-KGC-sft-joint-epoch1`, que a su vez parte de Qwen3-8B.

El desarrollo corre a cargo de FinaPolat y está orientado a un caso de uso muy concreto: pipelines de construcción de grafos de conocimiento que necesitan salidas estructuradas, verificables y conformes a una ontología, en lugar de texto generativo abierto. La conversión a GGUF con importance matrix calculada sobre los propios prompts de entrenamiento (extracción y enlazado) busca preservar la precisión de los pesos más relevantes para esa tarea, lo que la hace adecuada para despliegue local con Ollama o llama.cpp.

Con 8.190.735.360 parámetros totales, licencia no especificada en la información disponible y un repositorio de 20,5 GB, el modelo está pensado para ejecutarse en máquinas de consumo mediante cuantización Q4_K_M (5,0 GB). No se han publicado datos de benchmarks ni de idiomas soportados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3, según modelo base) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 10.240 tokens (configuración de `params` del repo para Ollama) |
| Tipos de cuantizacion | Q8_0 (8,7 GB), Q6_K (6,7 GB), Q4_K_M (5,0 GB); K-quants generados con importance matrix (`*.imatrix`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen3-8B, un transformer decoder-only de aproximadamente 8.190 millones de parámetros. Sobre esa base se aplicó un ajuste supervisado (SFT) específico para la tarea GO-KGC, entrenado con los prompts propios del sistema: instrucciones de extracción de tripletas con anclaje al texto y de enlazado de entidades contra una base de conocimiento, usando la plantilla de chat de Qwen3 con el modo "thinking" desactivado. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

La innovación técnica destacable no está en la arquitectura, sino en el pipeline de cuantización: las versiones Q6_K y Q4_K_M se generaron con una importance matrix calculada sobre los prompts y respuestas de entrenamiento del propio GO-KGC (extracción y enlazado), de modo que los pesos implicados en esa tarea conservan mayor precisión que en una cuantización K-quant estándar. El repositorio incluye la plantilla de chat y parámetros de decodificación greedy (temperatura 0, sin penalización por repetición) y una ventana de contexto de 10.240 tokens.

## Capacidades

- Extracción de grafos de conocimiento a partir de texto libre, con tripletas sujeto-relación-objeto.
- Anclaje (grounding) de cada entidad, relación y literal a un fragmento del texto de origen.
- Tipado de sujetos y objetos con el tipo más específico disponible en una ontología proporcionada.
- Enlazado de entidades (entity linking) contra una base de conocimiento, integrado en la misma pasada que la extracción (modelo "joint").
- Generación de texto conversacional heredada de Qwen3-8B (el pipeline declarado es `text-generation` y el tag `conversational` está presente).
- No se dispone de información sobre soporte de tool calling, capacidades de agente multi-paso, matemáticas, código, visión o audio en la información proporcionada.

## Casos de uso

- Construcción de grafos de conocimiento desde corpus documentales: el modelo recibe un documento y una ontología y devuelve tripletas tipadas y ancladas al texto, lo que permite auditar cada afirmación contra su fragmento de origen. Es adecuado porque el anclaje es un requisito del propio entrenamiento.
- Enriquecimiento de bases de conocimiento existentes: la variante joint enlaza entidades nuevas con entradas ya existentes en una KB, reduciendo duplicados y facilitando la reconciliación de entidades en pipelines de integración de datos.
- Extracción de información estructurada en dominios regulados (farmacéutico, legal, financiero): la conformidad estricta con una ontología y el anclaje al texto facilitan la trazabilidad y la revisión humana de cada tripleta generada.
- Despliegue local en estaciones de trabajo: con Q4_K_M (5,0 GB) cabe en GPUs de consumo y permite procesar documentos sensibles sin enviar datos a servicios externos, usando Ollama o llama.cpp.
- Preprocesado para sistemas RAG sobre grafos: las tripletas extraídas pueden alimentar un graph store y servir de base para recuperación estructurada y razonamiento sobre relaciones.
- Prototipado e investigación en extracción de información: al ser un fine-tune sobre Qwen3-8B con prompts públicos en el repo, sirve como línea base reproducible para comparar estrategias de extracción y enlazado.
- Integración en pipelines de curación de datos: la decodificación greedy configurada (temperatura 0) produce salidas deterministas, lo que simplifica la validación automática y la detección de regresiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9-10 GB con Q8_0, 7-8 GB con Q6_K y 5,5-6,5 GB con Q4_K_M (incluyendo overhead de contexto y KV cache a 10.240 tokens).
- GPU recomendadas: A100 o H100 para despliegues con concurrencia y contexto completo; RTX 4090 o RTX 3090 para uso individual con Q8_0; GPUs con 8 GB o más para Q4_K_M.
- Cabe en GPU de consumo: sí, con Q4_K_M en tarjetas de 8 GB y con Q6_K/Q8_0 en tarjetas de 12-16 GB o superiores.
- Opciones de despliegue: Ollama (`ollama pull hf.co/FinaPolat/Qwen3-8B-GO-KGC-joint-gguf:Q8_0`), llama.cpp y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia tipo TGI/vLLM, aunque no se detalla.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-8B-GO-KGC-joint (este) | 8,19 B | 10.240 tokens | Extraccion + entity linking con ontologia | no disponible | GGUF |
| Qwen3-8B (base) | 8,19 B | no disponible en esta ficha | Generacion general | no disponible | safetensors, GGUF |
| FinaPolat/Qwen3-8B-GO-KGC-sft-joint-epoch1 | 8,19 B | no disponible | Extraccion + entity linking con ontologia | no disponible | safetensors |

No se dispone de información sobre otros modelos especializados en construcción de grafos de conocimiento comparables en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- El modelo está fine-tuneado para los prompts propios de GO-KGC; usarlo con otras plantillas o instrucciones genéricas puede degradar gravemente la calidad de las salidas.
- Requiere proporcionar una ontología y, en la variante joint, una base de conocimiento para el enlazado; sin ellas no puede cumplir su función principal.
- La decodificación recomendada es greedy (temperatura 0, sin penalización por repetición); otros parámetros de muestreo pueden romper el formato estructurado esperado.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Verificar antes de cualquier despliegue en producción.
- Idiomas soportados no disponibles: no hay garantía documentada de comportamiento multilingüe más allá de lo heredado de Qwen3.
- Riesgo de alucinación en entidades o relaciones no presentes en el texto, aunque el anclaje debería permitir detectarlas mediante validación automática contra los offsets del texto.
- Sin benchmarks publicados: no hay evidencia cuantitativa de precisión, recall o F1 en extracción y enlazado que permita comparar con alternativas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema mínimo, sin validación comunitaria ni reportes de uso en producción.
- El contexto efectivo está limitado a 10.240 tokens en la configuración del repo, inferior a la ventana nativa de Qwen3-8B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FinaPolat/Qwen3-8B-GO-KGC-joint-gguf
- Modelo base (SFT joint): https://huggingface.co/FinaPolat/Qwen3-8B-GO-KGC-sft-joint-epoch1
- Ollama: https://ollama.com
- llama.cpp: https://github.com/ggml-org/llama.cpp
