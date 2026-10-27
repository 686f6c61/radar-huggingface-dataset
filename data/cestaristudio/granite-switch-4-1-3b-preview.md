# cestaristudio/granite-switch-4.1-3b-preview

## Resumen

Granite Switch 4.1 3B Preview es un modelo de lenguaje modular desarrollado por IBM dentro de la familia Granite. Se construye sobre Granite 4.1 3B e incorpora adaptadores embebidos procedentes de la colección Granite Libraries: un único checkpoint alberga varias capacidades especializadas —RAG, seguridad, explicabilidad y otras— que se activan a demanda mediante tokens de control en la plantilla de chat. Esto evita desplegar y mantener un modelo independiente por cada tarea.

La ficha analizada corresponde al repositorio `cestaristudio/granite-switch-4.1-3b-preview`, una réplica del original de IBM (`ibm-granite`) publicada en Hugging Face con licencia Apache 2.0, acceso restringido (gated) y sin descargas ni likes registrados en el momento de la consulta. El checkpoint ocupa 8,3 GB en safetensors y contiene 4.149.980.160 parámetros reales, pese a que la denominación comercial indica "3B".

Con 131.072 tokens de contexto y unos 4,1B de parámetros, el modelo apunta a despliegues empresariales en hardware contenido, donde la modularidad por adaptadores reduce el coste de serving multi-capacidad. Al tratarse de una versión preview, conviene contrastar siempre con el repositorio oficial de IBM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Base Granite 4.1 3B con adaptadores embebidos (detalle interno no disponible) |
| Parámetros totales | 4.149.980.160 (~4,1B, dato real de safetensors) |
| Parámetros activos | no disponible (no se ha confirmado arquitectura MoE) |
| Longitud de contexto | 131.072 tokens (128K) |
| Tipos de cuantización | no disponible (los pesos del repo, 8,3 GB para 4,15B parámetros, son coherentes con BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Granite 4.1 3B, al que se incorporan adaptadores embebidos de la colección Granite Libraries. La singularidad del enfoque está en que todos los adaptadores viajan dentro de un único checkpoint: en lugar de servir un modelo por cada capacidad (RAG, moderación de seguridad, explicabilidad…), se sirve uno solo y la capacidad se selecciona en tiempo de inferencia mediante tokens de control insertados en la plantilla de chat. Este diseño simplifica la operación, reduce la huella de memoria en despliegues multi-capacidad y evita gestionar múltiples versiones de pesos.

La información disponible no detalla la arquitectura interna (transformer denso, híbrido Mamba-2/transformer como en otras variantes de la familia Granite 4.x, número de capas o mecanismos de atención), ni los datos de entrenamiento: número de tokens, composición del corpus o uso de RLHF/DPO. Tampoco se especifica el método de entrenamiento de los adaptadores (LoRA u otra técnica). Al tratarse de una versión preview, estos detalles podrían completarse en la versión estable.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, etiqueta `conversational` en Hugging Face).
- RAG: adaptador específico activable mediante tokens de control para generación aumentada con recuperación.
- Seguridad: adaptador de safety para tareas de moderación o clasificación de contenido.
- Explicabilidad: adaptador de explainability para tareas de justificación de respuestas o decisiones.
- Capacidades adicionales de la colección Granite Libraries no detalladas en la información disponible.
- Ventana de contexto de 128K tokens para trabajar con documentos extensos.
- Tool calling / function calling: no disponible (no confirmado en la información proporcionada).
- Capacidades multilingües: no disponible (idiomas no especificados).
- Visión, audio u otras modalidades: no indicadas; el modelo es de solo texto.

## Casos de uso

- RAG sobre documentación interna: el adaptador de RAG, combinado con la ventana de 128K tokens, permite construir asistentes que responden sobre manuales, contratos o bases de conocimiento corporativas sin trocear excesivamente los documentos.
- Moderación de contenido: el adaptador de seguridad permite integrar filtros de contenido en la misma infraestructura de inferencia que el resto de tareas, sin desplegar un clasificador adicional.
- Explicabilidad y cumplimiento normativo: el adaptador de explainability es útil en entornos regulados donde se exige justificar las respuestas generadas o auditar el comportamiento del sistema.
- Asistente conversacional on-premise: con ~4,1B de parámetros y unos 8,8 GB de VRAM en BF16, cabe en GPUs de consumo, lo que lo hace viable para despliegues locales con datos sensibles bajo licencia Apache 2.0.
- Resumen y análisis de documentos largos: los 131.072 tokens de contexto permiten procesar informes, expedientes o transcripciones completos en una sola pasada.
- Consolidación de servicios de IA: un único checkpoint multi-capacidad reduce el número de modelos servidos, el consumo de memoria en producción y la sobrecarga operativa de mantener versiones separadas.
- Prototipado de arquitecturas modulares: para equipos de investigación que quieran evaluar el patrón de adaptadores activables por tokens de control frente al serving de modelos especializados independientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~8,77 GB en BF16 según estimaciones de terceros (llmrun.dev); el tamaño del repo (8,3 GB) es coherente con 4,15B de parámetros en precisión de 16 bits. Con contexto largo hay que añadir la VRAM del KV cache, por lo que se recomienda disponer de 12-16 GB para aprovechar ventanas grandes.
- GPU recomendadas: cualquier GPU de 12 GB o más para inferencia en BF16 (RTX 3060 12 GB con contexto moderado, RTX 4070, RTX 4070 Ti Super, RTX 3090, RTX 4090). Para serving concurrente en datacenter, A100 o H100 son suficientes con amplio margen, aunque no imprescindibles dado el tamaño del modelo.
- Consumer GPUs: sí, cabe en GPUs de consumo a partir de 12 GB de VRAM en BF16; también es ejecutable en Mac con memoria unificada de 16 GB o más.
- Despliegue: la librería `transformers` está confirmada (tag del repositorio). No se han encontrado convertidores GGUF ni soporte confirmado de llama.cpp, Ollama, vLLM o TGI para esta réplica; verificar estas opciones contra el repositorio oficial de IBM.
- Cuantización: no hay cuantizaciones publicadas en la información disponible. A título orientativo, una cuantización a 4 bits reduciría la huella a ~2,5-3 GB, pero no consta que exista.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Modularidad | Disponibilidad |
|---|---|---|---|---|---|
| Granite Switch 4.1 3B Preview | 4,15B | 128K | Apache 2.0 | Adaptadores embebidos activables por tokens de control | Hugging Face (gated en esta réplica) |
| Granite 4.1 3B (base) | ~4B | 128K | Apache 2.0 | No modular | Hugging Face |
| Qwen3-4B | 4,0B | 32K nativo (128K con YaRN) | Apache 2.0 | No modular; modo thinking | HF, GGUF, Ollama |
| Gemma 3 4B | ~4,3B | 128K | Licencia Gemma (uso comercial con condiciones) | No modular; incluye visión | HF, GGUF, Ollama |

Datos de especificaciones públicas de cada modelo; pueden variar según la versión. La ventaja diferencial de Granite Switch es la modularidad por adaptadores en un solo checkpoint; a cambio, su ecosistema de despliegue (GGUF, runtimes optimizados) parece menos maduro que el de las alternativas, según la información disponible.

## Limitaciones y advertencias

- Se trata de una versión preview: capacidades, pesos y documentación pueden cambiar en la versión estable.
- El repositorio analizado es una réplica de terceros (cestaristudio) con 0 descargas, 0 likes y acceso gated. Antes de usarlo en producción, verificar la integridad de los pesos (hashes/checksums) contra el repositorio oficial de `ibm-granite`; una réplica sin historial supone un riesgo de modificaciones no auditadas.
- No hay benchmarks publicados (ni por IBM ni por terceros en las fuentes consultadas): el rendimiento real en tareas concretas está sin contrastar.
- Los tokens de control que activan los adaptadores requieren una plantilla de chat compatible; stacks de inferencia genéricos podrían no activar las capacidades especializadas correctamente.
- Idiomas soportados no especificados: conviene validar el rendimiento en castellano antes de cualquier despliegue en producción.
- Riesgo de alucinación no cuantificado; el adaptador de RAG está orientado a mitigarlo, pero no existen mediciones publicadas que lo confirmen.
- Sesgos conocidos: no documentados en la información disponible; como todo LLM, puede heredar sesgos de sus datos de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución sin restricciones relevantes más allá de conservar los avisos de licencia.
- Consumir la ventana completa de 128K tokens incrementa notablemente la VRAM del KV cache y la latencia; dimensionar el hardware en consecuencia.

## Enlaces

- Réplica analizada: https://huggingface.co/cestaristudio/granite-switch-4.1-3b-preview
- Repositorio oficial de IBM: https://huggingface.co/ibm-granite/granite-switch-4.1-3b-preview
- README oficial: https://huggingface.co/ibm-granite/granite-switch-4.1-3b-preview/blob/main/README.md
- Colección Granite Switch: https://huggingface.co/collections/ibm-granite/granite-switch
- Ficha en Inferix: https://inferix.co/models/ibm-granite/granite-switch-4.1-3b-preview
- Requisitos de hardware en llmrun.dev: https://llmrun.dev/model/ibm-granite-granite-switch-4-1-3b-preview
- Ficha en LLM Explorer: https://llm-explorer.com/model/ibm-granite%2Fgranite-switch-4.1-3b-preview,1qjWXVJeIXPFX4JVqU3SeJ
