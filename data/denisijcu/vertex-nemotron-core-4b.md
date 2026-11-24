# Denisijcu/vertex-nemotron-core-4b

## Resumen
Vertex-Nemotron-Core-4B es un ajuste fino del modelo Qwen3-4B-Instruct-2507, desarrollado por Vertex Coders LLC (bajo la dirección de Denis Sanchez Leyva) y publicado por el usuario Denisijcu en Hugging Face. Se distribuye como un único archivo GGUF en cuantización Q4_K_M, pensado para ejecutarse íntegramente en GPU dentro de tarjetas con 6 GB de VRAM, sin necesidad de descargar capas a la CPU. El modelo base aporta 4.022.468.096 parámetros y una arquitectura transformer densa de la familia Qwen3.

El modelo está orientado a tres tareas concretas: razonamiento técnico paso a paso, generación de código seguro en contextos DevSecOps (mitigación de inyección de prompts, validación de esquemas con Pydantic, consultas SQL parametrizadas sobre DuckDB) y orquestación de servidores MCP (Model Context Protocol). El ajuste se realizó con QLoRA sobre un dataset de razonamiento filtrado (MoreThought/Fable-5.1-Max-Reasoning-Filtered-10000x), con un entrenamiento muy corto (0,98 épocas, 100 pasos, pérdida final de 1,5766).

Su relevancia actual reside en la combinación de un tamaño reducido, licencia Apache 2.0 y un formato GGUF listo para llama.cpp, LM Studio u Ollama, lo que permite desplegar un asistente con soporte de tool calling en hardware de consumo. No obstante, el ajuste es ligero y el modelo hereda las capacidades y limitaciones del Qwen3-4B-Instruct-2507 subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), ajuste fino con QLoRA sobre Qwen3-4B-Instruct-2507 |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 u 8192 tokens (configuración recomendada por el autor); contexto nativo del modelo base no disponible en la información proporcionada |
| Tipos de cuantizacion | GGUF Q4_K_M (2,50 GB). Otras cuantizaciones no disponibles |
| Idiomas soportados | Español (es) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `Qwen3-4B-Instruct-2507.Q4_K_M.gguf`) |

## Arquitectura y entrenamiento
El modelo es un ajuste fino del Qwen3-4B-Instruct-2507, un transformer denso de 4.022 millones de parámetros. El autor no documenta cambios en la arquitectura base: el trabajo consiste en un ajuste QLoRA con rango `r=16`, `lora_alpha=16` y optimizador `adamw_torch_fused`. El entrenamiento se ejecutó durante 0,98 épocas (100 pasos) sobre el dataset MoreThought/Fable-5.1-Max-Reasoning-Filtered-10000x, con una pérdida final de entrenamiento de 1,5766 y, según el autor, sin señales de sobreajuste.

No se especifican en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron fases de RLHF o DPO adicionales. Tampoco se documentan innovaciones arquitectónicas propias (atención lineal, decodificación especulativa u otras): las capacidades provienen del modelo base y del ajuste ligero. El resultado se empaquetó directamente en GGUF Q4_K_M para inferencia local.

## Capacidades
- Generación de texto conversacional en español e inglés, con razonamiento paso a paso antes de responder.
- Generación de código y arquitectura de software, con énfasis en prácticas DevSecOps.
- Mitigación de vectores de ataque descritos en OWASP LLM01 (inyección de prompts).
- Validación de esquemas de datos con Pydantic y generación de consultas SQL parametrizadas sobre DuckDB, con auditoría SHA-256 según el autor.
- Orquestación de servidores MCP: el autor indica pruebas en producción con `mcp/vertex-wikipedia`, `mcp/vertex-rag-library`, `mcp/vertex-portadas` y `mcp/vertex-forensic`.
- Soporte de tool calling / function calling estructurado, orientado a flujos agénticos.
- Capacidades multilingües limitadas a español e inglés según la model card.
- No se documentan capacidades de visión, audio ni un modo de razonamiento extendido (thinking mode) más allá del razonamiento paso a paso declarado.

## Casos de uso
- Asistente de desarrollo seguro en local: el modelo puede revisar fragmentos de código y proponer consultas SQL parametrizadas para DuckDB, integrándose en un flujo de revisión previa a producción sin enviar código a servicios externos.
- Orquestación de herramientas MCP: actúa como cliente que invoca servidores MCP (por ejemplo, un servidor de RAG o de consulta de Wikipedia) y encadena llamadas en varios pasos, adecuado para prototipos de agentes locales.
- Automatización de auditoría y forense digital: con el servidor `mcp/vertex-forensic` citado por el autor, puede estructurar consultas y resúmenes sobre datos de auditoría, manteniendo el procesamiento en la máquina local.
- Atención al cliente técnica en español: gestiona conversaciones multi-turno dentro de una ventana de 4096-8192 tokens, suficiente para incidencias acotadas, con la ventaja de ejecutarse en una GPU de 6 GB.
- Generación de documentación y arquitectura de sistemas: produce explicaciones paso a paso de diseños de software y planes de despliegue, útil como borrador que un ingeniero revisa después.
- Formación y experimentación con agentes: sirve como modelo de pruebas de bajo coste para validar pipelines de tool calling y prompts de sistema antes de escalar a modelos mayores.
- Despliegue en entornos con hardware restringido: al caber en 6 GB de VRAM con las 36 capas en GPU, es viable en estaciones de trabajo modestas o portátiles con GPU de gama media.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta una métrica de rendimiento de inferencia: aproximadamente 54-57 tokens por segundo en una NVIDIA GTX 1660 Ti (6 GB de VRAM) con las 36 capas descargadas en GPU, usando llama.cpp.

## Requisitos de hardware
- VRAM estimada: aproximadamente 2,5 GB para los pesos Q4_K_M, más el espacio de contexto; el autor indica que funciona con 6 GB de VRAM en total.
- GPU recomendadas: NVIDIA GTX 1660 Ti (6 GB) es el hardware de referencia del autor; cualquier GPU con 6 GB o más de VRAM debería ser suficiente para la cuantización Q4_K_M.
- Cabe en GPU de consumo: sí, en tarjetas de 6 GB o más (GTX 1660 Ti, RTX 2060, RTX 3060, RTX 4060, entre otras).
- Opciones de despliegue: llama.cpp (`llama-server`), LM Studio y, por el formato GGUF, previsiblemente Ollama; vLLM y TGI no se mencionan en la información disponible.
- Rendimiento: 54-57 tok/s en GTX 1660 Ti según el autor. No se dispone de datos de latencia ni de throughput en otras GPU.
- Parámetros de inferencia sugeridos por el autor: temperatura 0,3-0,6, repeat penalty 1,1, top-p 0,95, min-p 0,05, contexto de 4096 u 8192 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Vertex-Nemotron-Core-4B | 4.022 M | 4096-8192 (recomendado) | Apache 2.0 | GGUF Q4_K_M | Ajuste QLoRA ligero orientado a DevSecOps y MCP |
| Qwen3-4B-Instruct-2507 | 4.022 M | No disponible en la información proporcionada | Apache 2.0 | Safetensors y GGUF (según el repositorio original) | Modelo base; capacidades generales sin el ajuste específico |
| Alternativas de ~4B | No disponible | No disponible | No disponible | No disponible | No se dispone de datos de benchmarks para comparar rendimiento |

La comparación cuantitativa con otras alternativas de la misma categoría no está disponible, ya que el autor no publica benchmarks frente a modelos similares.

## Limitaciones y advertencias
- El ajuste es muy corto (100 pasos, 0,98 épocas); las mejoras sobre el modelo base pueden ser limitadas y no están respaldadas por benchmarks públicos.
- Las afirmaciones sobre mitigación de inyección de prompts, auditoría SHA-256 y pruebas en producción provienen únicamente de la model card del autor y no se han verificado de forma independiente.
- Riesgo de alucinación inherente a un modelo de 4B, especialmente en tareas de seguridad donde una respuesta incorrecta puede tener consecuencias graves.
- Idiomas limitados a español e inglés según la model card; el rendimiento en otros idiomas no está documentado.
- Ventana de contexto práctica de 4096-8192 tokens según la configuración recomendada; no se documenta el contexto nativo del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en producción.
- El modelo depende de un prompt de sistema específico para activar su identidad operativa; sin él, el comportamiento puede diferir del documentado.
- No se documentan sesgos específicos ni evaluaciones de seguridad independientes.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Denisijcu/vertex-nemotron-core-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset de entrenamiento: https://huggingface.co/datasets/MoreThought/Fable-5.1-Max-Reasoning-Filtered-10000x
- Sitio del desarrollador: https://vertexcoders.com
