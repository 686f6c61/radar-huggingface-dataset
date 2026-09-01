# mrutkows/granite-4.2-8b-q4-mlx

## Resumen

Granite 4.2 es una familia de modelos de lenguaje fundacionales de IBM, con arquitectura densa decoder-only, diseñados específicamente para escenarios empresariales. Este repositorio contiene una variante MLX del modelo granite-4.2-8b, cuantizada a 4 bits (q4, group-size 64), convertida por mrutkows para inferencia nativa en hardware Apple Silicon mediante el framework MLX. El modelo base soporta capacidades multilingües, generación de código, retrieval-augmented generation (RAG), uso de herramientas (tool calling), salida JSON estructurada y razonamiento extendido mediante un modo de pensamiento integrado (thinking mode).

La variante q4 es la opción más eficiente de la familia de conversiones MLX publicadas (bf16, q8 y q4), recomendada para equipos con 8 GB de memoria unificada. Se distribuye bajo licencia Apache 2.0, lo que permite uso libre tanto para investigación como para fines comerciales, sin restricciones. Es relevante para desarrolladores que necesitan ejecutar un modelo de razonamiento de 8B en portátiles Apple Silicon sin sacrificar demasiada calidad, y que quieran aprovechar capacidades agénticas como tool calling y salida JSON estructurada.

La conversión MLX utiliza el paquete mlx-lm, que proporciona inferencia rápida y fine-tuning en Apple Silicon. El repositorio incluye un generation_config.json copiado del modelo base, aunque mlx-lm solo consume el eos_token_id de dicho archivo; los parámetros de muestreo (temperature, top-p) deben pasarse explícitamente en cada invocación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only |
| Parametros totales | 1.373.966.336 (según safetensors; el modelo se comercializa como 8B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit q4 (group-size 64) |
| Idiomas soportados | multilingüe (idiomas específicos no documentados) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

Granite 4.2 es una familia de modelos densos decoder-only. El modelo base fue entrenado por IBM con un proceso de curación de datos y entrenamiento diseñado para escenarios empresariales, incorporando evaluaciones de gobernanza, riesgo y cumplimiento (GRC) junto con los procedimientos estándar de clearance de datos y revisión de calidad documental de IBM. El modelo incorpora un modo de pensamiento integrado (thinking mode) que produce razonamiento de cadena de pensamiento dentro de un bloque `<thinking>…</thinking>` antes de la respuesta final, con dos parámetros configurables: `enable_thinking` (true/false) y `reasoning_effort` ("low"/"high").

Esta variante concreta es una conversión a MLX del modelo base ibm-granite/granite-4.2-8b, cuantizada a 4 bits con group-size 64. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni las técnicas de alineación (RLHF/DPO) en la información disponible. El modelo base soporta tool calling, RAG y generación de JSON estructurado, capacidades que se conservan en la conversión.

## Capacidades

- Generación de texto y diálogo multilingüe.
- Generación de código y tareas de programación en diversos lenguajes.
- Retrieval-augmented generation (RAG) para recuperación de información contextual.
- Tool calling / function calling para integración con herramientas externas.
- Salida JSON estructurada para integraciones con APIs y sistemas empresariales.
- Thinking mode integrado (razonamiento de cadena de pensamiento) con control de esfuerzo de razonamiento (low/high).
- Razonamiento multi-paso para flujos agénticos y agentes autónomos.

## Casos de uso

- Asistentes de código en IDE: el modelo puede generar, explicar y refactorizar código con soporte multilingüe, integrándose en editores como VS Code o JetBrains mediante herramientas que invoquen el modelo localmente vía mlx-lm.
- Automatización de atención al cliente: gracias a su capacidad multilingüe y generación de JSON estructurado, puede gestionar conversaciones multi-turno y devolver respuestas formateadas para sistemas de ticketing o CRM.
- Agentes autónomos con tool calling: el modelo puede invocar herramientas externas (búsquedas, APIs, bases de datos) y encadenar llamadas multi-paso para completar tareas complejas, aprovechando el thinking mode para planificar.
- Pipeline de RAG empresarial: combinado con un índice vectorial, el modelo puede responder preguntas sobre documentación interna, contratos o manuales técnicos con citas y razonamiento explícito.
- Generación de JSON estructurado para integraciones API: el modelo puede producir salidas JSON válidas para alimentar sistemas downstream, útil en automatización de procesos de negocio.
- Razonamiento matemático y análisis técnico: el thinking mode permite resolver problemas de matemáticas, lógica o ingeniería con pasos intermedios visibles, útil en entornos educativos o de soporte técnico.
- Prototipado rápido en Apple Silicon: al ejecutarse localmente con 8 GB de memoria unificada, permite desarrollar y probar aplicaciones de IA generativa sin depender de servicios en la nube ni GPUs dedicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta conversión MLX. El modelo base granite-4.2-8b está orientado a matemáticas, generación de código, diálogo multilingüe y flujos agénticos, pero no se incluyen métricas concretas (MMLU, HumanEval, GSM8K, etc.) en la documentación de este repositorio.

## Requisitos de hardware

- Apple Silicon (M1, M2, M3, M4 o posterior) obligatorio; no compatible con GPUs NVIDIA/AMD.
- 8 GB de memoria unificada recomendados para la variante q4 (los requisitos exactos no están documentados).
- Python ≥ 3.9.
- Instalación: `pip install mlx-lm`, o ejecución efímera con `uvx --with "mlx[cpu]" mlx_lm.generate`.
- Inferencia nativa vía framework MLX; no requiere CUDA ni ROCm.
- Para la variante bf16 se recomiendan ≥ 16 GB de memoria unificada; la variante q8 reduce el consumo ~50 % respecto a bf16.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Comparativa entre las variantes MLX del mismo modelo base granite-4.2-8b:

| Variante | Cuantizacion | Memoria recomendada | Calidad | Uso recomendado |
|---|---|---|---|---|
| granite-4.2-8b-bf16-mlx | BFloat16 | ≥ 16 GB | Maxima | Calidad superior sin perdidas |
| granite-4.2-8b-q8-mlx | 8-bit (group-size 64) | ~50 % menos que bf16 | Alta | Equilibrio calidad/memoria |
| granite-4.2-8b-q4-mlx | 4-bit (group-size 64) | 8 GB | Eficiente | Eficiencia maxima en equipos modestos |

Alternativa en otro formato: ibm-granite/granite-4.2-8b-GGUF, que permite ejecutar el mismo modelo base con llama.cpp u Ollama en GPUs NVIDIA y CPUs convencionales, aunque sin la integración nativa con MLX.

## Limitaciones y advertencias

- Requiere hardware Apple Silicon; no es ejecutable en GPUs NVIDIA/AMD ni en CPUs x86 convencionales.
- El conteo de parámetros de los safetensors (1.373.966.336) no coincide con la denominación 8B del modelo; posible conversión incompleta o métrica incorrecta en el repositorio.
- mlx-lm no lee `temperature` ni `top_p` del generation_config.json; deben pasarse explícitamente en cada invocación (`--temp 0.7`, `--top-p 0.9`), de lo contrario usa greedy decoding por defecto.
- Para activar el thinking mode con `mlx_lm.generate` es necesario usar `--prefill-response " thinking"`; sin esto, el razonamiento no aparece en la salida.
- No se han publicado benchmarks para esta conversión específica; el rendimiento real puede diferir del modelo base.
- Los idiomas específicos soportados no están documentados en este repositorio.
- Riesgo de alucinación y sesgos no documentados para esta variante; se recomienda validar las salidas en escenarios de producción.

## Enlaces

- Repositorio HuggingFace (q4 MLX): https://huggingface.co/mrutkows/granite-4.2-8b-q4-mlx
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-8b
- Variante GGUF del modelo base: https://huggingface.co/ibm-granite/granite-4.2-8b-GGUF
- Documentacion IBM Granite 4.2: https://www.ibm.com/granite/docs/models/granite4-2
- Pagina principal IBM Granite: https://www.ibm.com/granite
- mlx-lm (ejemplos MLX): https://github.com/ml-explore/mlx-examples/tree/main/llms
- Framework MLX: https://github.com/ml-explore/mlx
