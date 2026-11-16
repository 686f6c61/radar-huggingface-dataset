# langtech-innovation/Prelude-9B-fc-evo-2611

## Resumen

Prelude-9B-fc-evo-2611 es un ajuste fino (fine-tuning) del modelo base openeurollm/prelude-base, desarrollado por langtech-innovation. Con 9.094.607.872 parámetros (aproximadamente 9,1 mil millones) y arquitectura de la familia Qwen3 según las etiquetas del repositorio, el modelo está especializado en generación de texto conversacional y, por la composición de sus datasets de entrenamiento, en function calling y comportamiento agéntico. Se distribuye bajo licencia Apache 2.0, aunque el acceso al repositorio está restringido y requiere aceptar condiciones en Hugging Face.

El interés del modelo reside en su orientación explícita hacia el tool calling: los datasets empleados (When2Call, xLAM-function-calling-60k, ToolACE, Toucan-1.5M, ToolMind, Nemotron-SFT-Agentic-v2, entre otros) son corpus de referencia para el entrenamiento de modelos que deben decidir cuándo invocar una herramienta, generar llamadas con argumentos correctos y encadenar pasos en flujos agénticos. Esto lo sitúa en la categoría de modelos pequeños/medianos orientados a agentes y automatización, más que a conversación generalista.

La información pública disponible es limitada: no se detallan la longitud de contexto, los idiomas soportados ni resultados de benchmarks. El repositorio ocupa 91 GB, lo que sugiere la presencia de pesos en varios formatos o múltiples checkpoints, y el modelo se publica con soporte para text-generation-inference y endpoints compatibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3 (según etiquetas del repositorio) |
| Parámetros totales | 9.094.607.872 (≈9,1 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se detallan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo se presenta como un fine-tuning de openeurollm/prelude-base, un modelo base de aproximadamente 9 mil millones de parámetros. Las etiquetas del repositorio lo adscriben a la arquitectura Qwen3, lo que implica un transformer decoder-only con atención estándar (no se documenta el uso de atención lineal, SSM ni arquitecturas híbridas). No se dispone de información sobre el número de tokens de entrenamiento ni sobre la composición exacta del dataset más allá de la lista de corpus referenciados.

El ajuste fino se ha realizado sobre una mezcla de datasets centrados en function calling y agentes: nvidia/When2Call (detección de cuándo llamar a una herramienta), Salesforce/xlam-function-calling-60k (generación de llamadas con argumentos), Team-ACE/ToolACE (trayectorias de uso de herramientas), Agent-Ark/Toucan-1.5M (datos agénticos a gran escala), Nanbeige/ToolMind, nvidia/Nemotron-SFT-Agentic-v2 (SFT agéntico), Jackrong/GLM-5.1-Reasoning-1M-Cleaned (razonamiento) y Snowflake/AgentWorldModel-1K (simulación de entornos agénticos). No se especifica si se aplicaron etapas de RLHF, DPO o preferencias, ni detalles sobre decodificación especulativa u otras optimizaciones de inferencia.

## Capacidades

- Generación de texto conversacional multi-turno.
- Function calling y tool calling: el entrenamiento con When2Call, xLAM y ToolACE apunta a la capacidad de decidir cuándo invocar una herramienta y generar llamadas estructuradas con argumentos.
- Comportamiento agéntico y razonamiento multi-paso: la inclusión de Toucan-1.5M, Nemotron-SFT-Agentic-v2 y AgentWorldModel-1K sugiere entrenamiento en trayectorias de varios pasos y entornos simulados.
- Razonamiento: presencia del corpus GLM-5.1-Reasoning-1M-Cleaned en la mezcla de entrenamiento.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (visión, audio, thinking mode explícito): no disponible.

## Casos de uso

- Asistentes con acceso a herramientas: el modelo puede integrarse como planificador que decide cuándo llamar a una API, generar el JSON de argumentos y encadenar la respuesta, aprovechando su entrenamiento con When2Call y xLAM.
- Automatización de flujos de trabajo en empresas: orquestación de tareas donde el modelo selecciona entre múltiples herramientas registradas (CRM, ticketing, bases de datos) y compone llamadas secuenciales.
- Agentes de navegación y consulta de datos: uso como cerebro de un agente que recibe observaciones de un entorno (por ejemplo, resultados de búsqueda o respuestas de API) y decide el siguiente paso, apoyado en el entrenamiento con AgentWorldModel-1K.
- Generación de código asistida por herramientas: integración en entornos de desarrollo donde el modelo invoca linters, compiladores o ejecutores de tests mediante function calling y corrige según el resultado.
- Atención al cliente con escalado a sistemas: gestión de conversaciones multi-turno que derivan a operaciones estructuradas (consultas de pedidos, cambios de estado) mediante llamadas a herramientas.
- Investigación sobre alineación de tool use: modelo de tamaño medio (9 B) útil para experimentos académicos de evaluación de function calling y comportamiento agéntico, dado su entrenamiento específico en esos corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18-19 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 24 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 10-11 GB; en 4 bits, en torno a 5-6 GB (estimaciones teóricas basadas en el número de parámetros, no confirmadas por el autor).
- GPU profesionales: A100 (40/80 GB), H100, L40S y A10G son adecuadas para despliegue en producción.
- GPU de consumo: cabe en RTX 4090 (24 GB) en BF16 con contexto moderado; en RTX 3090 (24 GB) de forma similar; en GPUs de 16 GB requeriría cuantización de 8 bits; en 12 GB o menos, cuantización de 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (soportado según etiquetas), endpoints compatibles; vLLM, llama.cpp u Ollama no están confirmados por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Prelude-9B-fc-evo-2611 | ≈9,1 B | no disponible | Function calling y agentes | Apache 2.0 | Gated en Hugging Face |
| Qwen2.5-7B-Instruct | 7,6 B | 32.768 tokens (128K en variantes Turbo) | Conversación general y tool calling | Apache 2.0 | Abierta |
| Llama-3.1-8B-Instruct | 8,0 B | 128.000 tokens | Conversación general y tool calling | Llama 3.1 Community License | Abierta con condiciones |
| xLAM-7B (Salesforce) | ≈7 B | no disponible en esta ficha | Function calling | Apache 2.0 (según variante) | Abierta |

La comparación con Qwen2.5-7B-Instruct y Llama-3.1-8B-Instruct es pertinente por tamaño y por su uso común como base para agentes; sin embargo, no se dispone de datos de benchmarks de Prelude-9B-fc-evo-2611 para establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de descargar los pesos.
- Ausencia de documentación técnica: no se publican longitud de contexto, idiomas, composición exacta del dataset ni detalles del proceso de entrenamiento, lo que dificulta evaluar su idoneidad en producción.
- Riesgo de alucinación: como todo modelo generativo, puede inventar nombres de herramientas, argumentos o resultados; en flujos agénticos esto puede provocar llamadas erróneas, por lo que se recomienda validación estricta de esquemas.
- Sesgos: no se documentan evaluaciones de sesgo; los datasets de entrenamiento (mayoritariamente en inglés y centrados en APIs) pueden introducir sesgos de dominio y de idioma.
- Idiomas: no se declaran idiomas soportados; el rendimiento fuera del inglés es incierto.
- Licencia: Apache 2.0 permite uso comercial, pero debe verificarse que los datasets de entrenamiento no impongan restricciones adicionales; el modelo base openeurollm/prelude-base puede tener sus propias condiciones.
- Madurez: con 22 descargas y 0 likes en el momento de la consulta, es un modelo reciente y poco validado por la comunidad; no se recomienda su uso en producción crítica sin evaluación propia.
- Fecha de creación (2026-11-10) y actualización (2026-11-16): el modelo es muy reciente y puede recibir revisiones.

## Enlaces

- Hugging Face: https://huggingface.co/langtech-innovation/Prelude-9B-fc-evo-2611
- Modelo base: https://huggingface.co/openeurollm/prelude-base
- Dataset When2Call: https://huggingface.co/datasets/nvidia/When2Call
- Dataset xLAM-function-calling-60k: https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k
- Dataset ToolACE: https://huggingface.co/datasets/Team-ACE/ToolACE
- Dataset Toucan-1.5M: https://huggingface.co/datasets/Agent-Ark/Toucan-1.5M
- Dataset ToolMind: https://huggingface.co/datasets/Nanbeige/ToolMind
- Dataset Nemotron-SFT-Agentic-v2: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Agentic-v2
- Dataset GLM-5.1-Reasoning-1M-Cleaned: https://huggingface.co/datasets/Jackrong/GLM-5.1-Reasoning-1M-Cleaned
- Dataset AgentWorldModel-1K: https://huggingface.co/datasets/Snowflake/AgentWorldModel-1K
