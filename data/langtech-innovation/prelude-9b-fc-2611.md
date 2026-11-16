# langtech-innovation/Prelude-9B-fc-2611

## Resumen

Prelude-9B-fc-2611 es un ajuste fino (fine-tuning) del modelo base openeurollm/prelude-base, desarrollado por langtech-innovation. Con 9.094.607.872 parámetros totales y arquitectura basada en Qwen3 (según los tags del repositorio), está especializado en generación de texto conversacional y, por la composición de su dataset de entrenamiento, en function calling y comportamiento agéntico. El sufijo "fc" del nombre y los datasets empleados (When2Call, xlam-function-calling-60k, ToolACE, Toucan-1.5M, ToolMind, Nemotron-SFT-Agentic-v2, AgentWorldModel-1K) apuntan a un entrenamiento orientado a invocación de herramientas y razonamiento multi-paso.

El modelo se distribuye en formato safetensors bajo licencia Apache 2.0, con acceso restringido (gated) que requiere aceptar condiciones en Hugging Face. El repositorio ocupa 91,0 GB, lo que sugiere pesos en precisión alta (probablemente BF16 o FP16) para un modelo de ~9B parámetros. Se publicó el 10 de noviembre de 2026 y se actualizó el 16 de noviembre de 2026.

Es relevante ahora porque combina un tamaño contenido (9B) con un entrenamiento específico en agentes y tool calling, un nicho donde los modelos pequeños especializados pueden competir con modelos generalistas mucho mayores en tareas de orquestación de herramientas, a un coste de inferencia inferior y con licencia permisiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3 (según tags del repositorio) |
| Parametros totales | 9.094.607.872 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se listan GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de openeurollm/prelude-base y se ajusta mediante fine-tuning supervisado (SFT) sobre una mezcla de datasets centrados en function calling y comportamiento agéntico: nvidia/When2Call (decisión de cuándo invocar herramientas), Salesforce/xlam-function-calling-60k (invocación de funciones), Team-ACE/ToolACE, Agent-Ark/Toucan-1.5M, Nanbeige/ToolMind, nvidia/Nemotron-SFT-Agentic-v2, Jackrong/GLM-5.1-Reasoning-1M-Cleaned (razonamiento) y Snowflake/AgentWorldModel-1K. La arquitectura subyacente corresponde a la familia Qwen3, un transformer decoder-only, aunque no se detallan en la información disponible el número de capas, dimensiones ocultas ni la composición exacta del dataset (proporciones, número total de tokens).

No se dispone de información sobre si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación posteriores al SFT, ni sobre innovaciones técnicas específicas como decodificación especulativa o atención lineal. El tag "text-generation-inference" y "endpoints_compatible" indica compatibilidad con TGI y con los endpoints de Hugging Face.

## Capacidades

- Generación de texto conversacional multi-turno.
- Function calling / tool calling, entrenado explícitamente con múltiples datasets de invocación de funciones.
- Comportamiento agéntico y razonamiento multi-paso (datasets Agentic, AgentWorldModel, Nemotron-SFT-Agentic).
- Razonamiento (incluye el dataset GLM-5.1-Reasoning-1M-Cleaned en el entrenamiento).
- Decisión de cuándo invocar herramientas (When2Call).
- Compatible con transformers y text-generation-inference.
- Capacidades multilingües: no disponible (no se especifican idiomas).
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Agentes de automatización de tareas: el modelo puede decidir cuándo y qué herramienta invocar (entrenado con When2Call) y encadenar pasos en flujos multi-paso, adecuado para orquestadores de agentes en producción.
- Asistentes de atención al cliente con acceso a APIs: integrado con tool calling para consultar pedidos, bases de datos o sistemas de ticketing, gestionando conversaciones multi-turno.
- Pipelines de CI/CD con invocación de herramientas: puede generar llamadas estructuradas a funciones para automatizar tareas de despliegue o consulta de estado.
- Razonamiento sobre documentación técnica: su componente de razonamiento permite responder preguntas que requieren varios pasos lógicos antes de emitir una respuesta.
- Enrutamiento de consultas a servicios: usar el modelo como clasificador/selector de herramientas en arquitecturas de agentes, decidiendo qué API invocar según la intención del usuario.
- Prototipado de asistentes agénticos en local: con 9B parámetros y licencia Apache 2.0, es viable desplegarlo en infraestructura propia para experimentación sin restricciones comerciales.
- Evaluación de comportamiento agéntico: útil como modelo de referencia en investigación sobre tool calling y planificación multi-paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 18-20 GB para los pesos (9B parámetros × 2 bytes), más overhead de KV cache.
- VRAM estimada en cuantización de 8 bits: ~9-10 GB; en 4 bits: ~5-6 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100 para despliegue en producción con contexto largo; RTX 4090 (24 GB) suficiente para BF16 en inferencia de una sola petición.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en BF16 y en GPUs de 8-12 GB con cuantización (si se publican pesos GGUF, actualmente no disponibles).
- Opciones de despliegue: transformers, text-generation-inference (TGI, según tags), endpoints de Hugging Face; vLLM y llama.cpp/Ollama no confirmados por falta de pesos GGUF publicados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Prelude-9B-fc-2611 | 9,09B | no disponible | Function calling / agentes | Apache 2.0 | Gated en HF |
| Qwen3-8B (referencia de familia) | ~8B | no disponible en esta ficha | Generalista | Apache 2.0 | Abierto |
| Modelos 7-9B con tool calling (genericos) | 7-9B | variable | Generalista con soporte de herramientas | variable | Abierto |

No se dispone de datos de rendimiento comparativos publicados para este modelo, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Acceso restringido: requiere aceptar condiciones en Hugging Face antes de descargar.
- No se especifican idiomas soportados; el rendimiento fuera del inglés es incierto.
- No se publica longitud de contexto, lo que dificulta planificar casos de uso con documentos largos.
- Riesgo de alucinación inherente a modelos de 9B, especialmente en tool calling con esquemas de funciones complejos.
- Sesgos: no documentados por el autor; al ser un fine-tuning sobre datasets mayoritariamente en inglés, puede heredar sesgos de esos corpus.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base openeurollm/prelude-base podría tener condiciones adicionales que conviene verificar.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento frente a alternativas.
- Repositorio de 91 GB: requiere espacio en disco considerable y ancho de banda para su descarga.
- No hay pesos cuantizados publicados (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware modesto.

## Enlaces

- Hugging Face: https://huggingface.co/langtech-innovation/Prelude-9B-fc-2611
- Modelo base: https://huggingface.co/openeurollm/prelude-base
- Dataset When2Call: https://huggingface.co/datasets/nvidia/When2Call
- Dataset xLAM function calling: https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k
- Dataset ToolACE: https://huggingface.co/datasets/Team-ACE/ToolACE
- Dataset Toucan-1.5M: https://huggingface.co/datasets/Agent-Ark/Toucan-1.5M
- Dataset ToolMind: https://huggingface.co/datasets/Nanbeige/ToolMind
- Dataset Nemotron-SFT-Agentic-v2: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Agentic-v2
- Dataset GLM-5.1-Reasoning-1M-Cleaned: https://huggingface.co/datasets/Jackrong/GLM-5.1-Reasoning-1M-Cleaned
- Dataset AgentWorldModel-1K: https://huggingface.co/datasets/Snowflake/AgentWorldModel-1K
