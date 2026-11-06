# IldaLabs/Agent-Zero-0.5b

## Resumen

Agent-Zero-0.5b es un modelo de lenguaje de 494 millones de parámetros desarrollado por IldaLabs, obtenido mediante fine-tuning de Qwen 2.5 con la librería Unsloth. Su propósito es actuar como agente autónomo ligero, con soporte nativo de razonamiento en cadena (chain-of-thought) mediante etiquetas `<think>...</think>` y de invocación de herramientas mediante esquemas XML (`<tool_call>`, `<tool_response>`), un formato compatible con clientes Ollama y con interfaces como Open WebUI.

El modelo se distribuye principalmente en formato GGUF (cuantización Q4_K_M) y está pensado para ejecutarse en hardware de bajos recursos, incluidas CPU y GPUs de consumo. Su tamaño reducido y su licencia Apache 2.0 lo hacen adecuado para prototipos de agentes locales, automatización de tareas simples y experimentación con bucles multi-turno de tool calling sin depender de infraestructura en la nube.

La relevancia actual del modelo radica en la combinación de un tamaño muy contenido con un formato de agente estructurado y explícito, lo que facilita su integración en pipelines locales. No obstante, al tratarse de un modelo de 0,5B parámetros, su capacidad de razonamiento y su fiabilidad en tareas complejas son limitadas en comparación con modelos de mayor escala.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen 2.5) |
| Parámetros totales | 494.032.768 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q4_K_M (única cuantización publicada en la información disponible) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 0,4 GB); safetensors según metadatos de parámetros |

## Arquitectura y entrenamiento

El modelo parte de Qwen 2.5, un transformer decoder-only con atención causal estándar, y se ha ajustado mediante fine-tuning supervisado con Unsloth, una librería optimizada para entrenamiento eficiente en memoria. No se especifica en la información disponible si se aplicaron técnicas de RLHF o DPO, ni el número total de tokens de entrenamiento.

El conjunto de entrenamiento es una mezcla personalizada de 8.000 muestras estructuradas, divididas en cuatro bloques de 2.000 ejemplos cada uno: razonamiento profundo procedente de OpenO1-SFT, ejecución de herramientas en un solo turno de `AymanTarig/function-calling-v0.2-with-r1-cot`, bucles de agente multi-turno de Glaive Function Calling v2 y diálogos generales de OpenHermes-2.5. La innovación principal es el uso de un formato XML explícito para el razonamiento y las llamadas a herramientas, con etiquetas `<think>`, `<tool_call>` y `<tool_response>` que el modelo respeta de forma nativa.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento en cadena explícito mediante etiquetas `<think>...</think>`.
- Tool calling nativo con esquemas XML (`<tool_call>` y `<tool_response>`).
- Soporte de bucles de agente multi-turno, esperando la respuesta de la herramienta antes de continuar.
- Integración directa con Ollama mediante el `Modelfile` proporcionado por el autor.
- Compatibilidad con clientes que interpretan el formato XML de agentes, como Open WebUI.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio ni matemáticas avanzadas.

## Casos de uso

- Agentes locales en Ollama: el modelo puede ejecutarse en un equipo de sobremesa con el `Modelfile` incluido y gestionar bucles de razonamiento y llamadas a herramientas sin conexión a la nube, gracias a su tamaño de 0,5B y a la cuantización Q4_K_M.
- Automatización de tareas de escritorio: con tool calling XML puede invocar funciones del sistema (lectura de ficheros, ejecución de comandos) en un bucle controlado, adecuado para prototipos de asistentes personales.
- Enrutamiento de consultas en pipelines: por su bajo coste de inferencia, puede clasificar y derivar peticiones simples a herramientas o servicios antes de escalar a un modelo mayor.
- Prototipado de agentes multi-turno: sirve para validar el diseño de prompts y esquemas XML de herramientas antes de migrar a modelos de mayor tamaño, reduciendo el coste de iteración.
- Educación y experimentación: permite estudiar el comportamiento de chain-of-thought y tool calling en un modelo pequeño y ejecutable en CPU.
- Integración en Open WebUI: el formato `<think>` y `<tool_call>` se muestra de forma nativa en la interfaz, lo que facilita demos de agentes con herramientas conectadas.
- Tareas de extracción estructurada simple: con un prompt adecuado y el formato XML, puede generar salidas estructuradas para formularios o APIs ligeras, aunque con menor fiabilidad que modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_K_M: aproximadamente 0,4-0,6 GB, más el overhead del runtime.
- Cabe en CPU y en GPUs de consumo muy básicas; no requiere GPU dedicada para funcionar.
- GPUs recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050, RTX 3050, RTX 4060); en A100 o H100 el modelo queda infrautilizado.
- Despliegue recomendado: Ollama (soporte nativo documentado por el autor), llama.cpp para GGUF y TGI según los tags del repo.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, se espera una latencia muy baja en hardware moderno, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Agent-Zero-0.5b | 494 M | no disponible | Apache 2.0 | GGUF / safetensors | Agente ligero con tool calling XML |
| Qwen2.5-0.5B | 494 M | 32.768 tokens (versión base, según documentación pública de Qwen) | Apache 2.0 | safetensors, GGUF | Modelo base generalista |
| Qwen2.5-1.5B | 1.500 M | 32.768 tokens (versión base, según documentación pública de Qwen) | Apache 2.0 | safetensors, GGUF | Modelo base generalista de mayor capacidad |
| SmolLM2-360M | 360 M | 8.192 tokens (según documentación pública) | Apache 2.0 | safetensors, GGUF | Modelo pequeño generalista |

La comparación con Qwen2.5-0.5B es directa porque Agent-Zero-0.5b deriva de él; el fine-tuning añade el formato de agente pero puede degradar capacidades generales. Los datos de contexto de los modelos comparables provienen de su documentación pública y no de la información proporcionada para Agent-Zero-0.5b.

## Limitaciones y advertencias

- Modelo de 0,5B parámetros: capacidad de razonamiento y precisión limitadas; propenso a errores en tareas complejas o de múltiples pasos.
- Riesgo de alucinación elevado, especialmente en tool calling con esquemas no vistos durante el entrenamiento.
- Solo soporta inglés según la model card; el rendimiento en castellano no está garantizado.
- Longitud de contexto no documentada; no se recomienda para conversaciones o documentos largos.
- El formato XML de herramientas es específico y requiere que el cliente lo interprete correctamente; no es compatible de forma nativa con APIs de function calling estándar (OpenAI-style) sin adaptación.
- Entrenado con solo 8.000 muestras, lo que limita la generalización frente a modelos ajustados con datasets mayores.
- Aunque la licencia Apache 2.0 permite uso comercial, la ausencia de benchmarks y de evaluación independiente desaconseja su uso en producción crítica sin validación previa.
- El repositorio tiene muy pocas descargas y likes, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/IldaLabs/Agent-Zero-0.5b
- No se han encontrado otros enlaces (papers, blogs, repos o demos) en la información proporcionada.
