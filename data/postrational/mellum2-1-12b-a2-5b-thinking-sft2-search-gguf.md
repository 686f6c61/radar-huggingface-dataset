# postrational/Mellum2.1-12B-A2.5B-Thinking-sft2-search-GGUF

## Resumen

Mellum2.1-12B-A2.5B-Thinking-sft2-search-GGUF es una distribución en formato GGUF de un modelo de lenguaje de tipo mezcla de expertos (MoE) con 12.149.923.072 parámetros totales, según los metadatos de safetensors del repositorio. El identificador del modelo indica 12B de parámetros totales y 2.5B parámetros activos por token, así como un ajuste fino orientado a razonamiento con modo *thinking* y capacidades de búsqueda. El autor del repositorio es el usuario `postrational`, que ha publicado esta conversión cuantizada.

El modelo se ha fine-tuneado y convertido a GGUF utilizando Unsloth, según declara la propia model card, y está pensado para su ejecución con llama.cpp. El repositorio incluye una única cuantización publicada, `Q4_K_M`, y el tamaño total del repo es de 8,1 GB, coherente con un modelo MoE de 12B cuantizado a 4 bits. La model card proporciona instrucciones de uso mediante `llama-cli` y `llama-mtmd-cli`, lo que sugiere compatibilidad con plantillas de chat Jinja y, potencialmente, con entradas multimodales, aunque no se detalla la naturaleza de esa multimodalidad.

La relevancia de esta ficha es limitada por la escasez de información pública: no se especifican licencia, idiomas soportados, composición del dataset de entrenamiento ni resultados de benchmarks. Se trata, por tanto, de una publicación reciente (creada el 24 de noviembre de 2026) sin descargas ni valoraciones registradas en el momento de la consulta, lo que obliga a tratar muchos apartados como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) tipo transformer; detalles internos no disponibles |
| Parametros totales | 12.149.923.072 (12,15B) |
| Parametros activos | 2,5B (según el identificador del modelo; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (única cuantización publicada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo de 8,1 GB); pesos originales en safetensors según metadatos |

## Arquitectura y entrenamiento

La información disponible confirma únicamente que se trata de un modelo de mezcla de expertos con 12,15B parámetros totales y, según la nomenclatura del identificador, 2,5B parámetros activos. No se detalla el número de expertos, la estrategia de enrutamiento, el número de capas ni la dimensión de los estados ocultos. El sufijo "Thinking" sugiere la presencia de un modo de razonamiento extendido, y "sft2-search" apunta a un ajuste fino supervisado en dos fases con entrenamiento orientado a uso de búsqueda, pero estos extremos no se describen en la model card.

El proceso de fine-tuning y conversión a GGUF se realizó con Unsloth, según la propia model card, que menciona un entrenamiento "2x más rápido" con dicha herramienta. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o decodificación especulativa. Tampoco se documenta ninguna innovación arquitectónica más allá de la naturaleza MoE.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Razonamiento con modo *thinking* (inferido del sufijo del nombre; no documentado en detalle).
- Capacidades de búsqueda o recuperación (inferidas del sufijo "search"; no documentadas).
- Compatibilidad con plantillas de chat Jinja mediante el flag `--jinja` de llama.cpp.
- Posible soporte multimodal, ya que la model card menciona `llama-mtmd-cli` para modelos multimodales, aunque no se especifica qué modalidades cubre.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Ejecución local en estaciones de trabajo: al ser un MoE de 12B con 2,5B activos y estar cuantizado a Q4_K_M, puede ejecutarse con llama.cpp en equipos con GPU de consumo, lo que permite experimentación local sin infraestructura de servidor.
- Prototipado de asistentes conversacionales: la etiqueta `conversational` y el soporte de plantillas Jinja permiten desplegar un chatbot básico con `llama-cli` para pruebas de concepto.
- Evaluación de razonamiento con modo *thinking*: útil para comparar la calidad de cadenas de razonamiento en tareas de lógica o matemáticas, aunque sin benchmarks publicados la evaluación debe hacerse de forma empírica.
- Integración en pipelines de llama.cpp: el formato GGUF y la compatibilidad con `llama-server` permiten exponer el modelo como endpoint compatible con la API de OpenAI, según la etiqueta `endpoints_compatible`.
- Experimentación con recuperación/búsqueda: el sufijo "search" sugiere un ajuste orientado a tareas de búsqueda de información, adecuado para prototipos de asistentes con acceso a fuentes externas.
- Investigación sobre fine-tuning con Unsloth: el repositorio sirve como ejemplo de conversión de un MoE a GGUF tras un SFT en dos fases, útil para quienes replican flujos de trabajo similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa aproximadamente 8,1 GB (tamaño del repo), por lo que se requiere algo más de 8 GB de VRAM o memoria unificada para cargar los pesos, más el espacio para el contexto KV.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, una RTX 4090 (24 GB) o una RTX 3090 (24 GB) deberían acomodar el modelo con contexto amplio; GPUs de 12-16 GB podrían funcionar con contexto reducido.
- Cabe en GPU de consumo: sí, previsiblemente en modelos con 12 GB o más de VRAM, aunque no se confirma oficialmente.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`), y por extensión `llama-server` para exponer una API compatible; no se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; debe consultarse al autor antes de cualquier despliegue en producción.
- Idiomas soportados no documentados: se desconoce la cobertura multilingüe y la calidad en castellano.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento en MMLU, HumanEval, GSM8K ni otras tareas estándar.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin datos de evaluación no puede acotarse.
- Sesgos conocidos: no documentados.
- Longitud de contexto desconocida: limita la planificación de casos de uso con documentos largos.
- Repositorio sin descargas ni valoraciones: no hay señal de validación por parte de la comunidad.
- El modo *thinking* y las capacidades de búsqueda se infieren del nombre del modelo, no de documentación explícita; su comportamiento real debe verificarse empíricamente.
- La mención de `llama-mtmd-cli` sugiere multimodalidad, pero no se confirma qué modalidades ni con qué calidad.

## Enlaces

- Hugging Face: https://huggingface.co/postrational/Mellum2.1-12B-A2.5B-Thinking-sft2-search-GGUF
- Unsloth (herramienta de fine-tuning y conversión): https://github.com/unslothai/unsloth
