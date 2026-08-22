# ermiaazarkhalili/Qwen3.8-2B-Function-Calling-xLAM-Unsloth-GGUF

## Resumen

El modelo Qwen3.8-2B-Function-Calling-xLAM-Unsloth-GGUF es una cuantización GGUF de un ajuste fino LoRA sobre el modelo base `empero-ai/Qwen3.8-2B`, entrenado específicamente para la tarea de *function calling* (llamada a funciones). El autor, ermiaazarkhalili, ha aplicado un entrenamiento supervisado (SFT) con el dataset `Salesforce/xlam-function-calling-60k`, que contiene 60.000 ejemplos de invocación de herramientas y APIs, y ha publicado seis versiones cuantizadas (de Q2_K a Q8_0) para facilitar el despliegue local con `llama.cpp` u Ollama.

El modelo resuelve el problema de ejecutar agentes conversacionales que necesitan invocar funciones externas en entornos con recursos limitados, sin necesidad de GPUs de gran capacidad. Con aproximadamente 1.94 mil millones de parámetros, pertenece a la categoría de modelos compactos que pueden ejecutarse en hardware de consumo, aunque su ventana de contexto está limitada a 2048 tokens según la configuración de entrenamiento. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

La relevancia actual de este modelo radica en la creciente demanda de agentes autónomos que interactúan con APIs, bases de datos y servicios web. Al estar basado en Qwen3.8, hereda las mejoras arquitectónicas de la serie Qwen3, que incluyen soporte para razonamiento multi-paso y tareas agénticas de largo recorrido, aunque este checkpoint concreto se ha especializado exclusivamente en la generación de llamadas a funciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.8) |
| Parámetros totales | 1.942.653.248 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (máximo de entrenamiento) |
| Tipos de cuantización | GGUF: Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Transformer de Qwen3.8, que a su vez hereda las mejoras de la serie Qwen3.5. El ajuste fino se realizó mediante LoRA con QLoRA (cuantización de 4 bits en la base), utilizando Unsloth y TRL. La configuración de entrenamiento incluye un rango LoRA de 64, alpha de 64, tasa de aprendizaje de 0.0002, una época, tamaño de lote efectivo de 8 y longitud máxima de secuencia de 2048 tokens. Los módulos objetivo fueron `down_proj`, `gate_proj`, `in_proj_qkv`, `in_proj_z`, `k_proj`, `o_proj`, `out_proj`, `q_proj`, `up_proj` y `v_proj`.

El entrenamiento se realizó sobre el dataset `Salesforce/xlam-function-calling-60k`, que contiene ejemplos de invocación de funciones en formato JSON. No se ha aplicado RLHF ni DPO; solo supervisión directa (SFT). Las pérdidas de entrenamiento observadas en dos trabajos SLURM muestran una reducción de 1.1972 a 1.0516 en el trabajo `55745478` y de 0.6355 a 0.1270 en el trabajo `55541067`, aunque estos valores solo son observaciones de pérdida de entrenamiento, no indicadores de calidad final.

## Capacidades

- Generación de texto con soporte de *function calling* en formato JSON, especializado en la invocación de herramientas y APIs.
- Razonamiento multi-paso y tareas agénticas gracias a la arquitectura base Qwen3.8, aunque sin evaluación específica en este checkpoint.
- Capacidades multilingües del modelo base, aunque no se han documentado explícitamente para este ajuste.
- Soporte de *tool calling* para integración en pipelines de agentes.
- No se ha informado de capacidades de visión, audio ni *thinking mode*.

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede gestionar conversaciones multi-turno y generar llamadas a APIs de CRM o sistemas de ticketing para resolver consultas sin intervención humana, gracias a su capacidad de *function calling*.
- **Asistentes de productividad**: integrado en herramientas de gestión de calendario o correo, puede invocar funciones para crear eventos, enviar mensajes o buscar información.
- **Automatización de tareas de desarrollo**: generar código que invoca APIs externas, como consultas a bases de datos o servicios REST, con una ventana de contexto de 2048 tokens suficiente para tareas de complejidad media.
- **Despliegue en dispositivos de bajo consumo**: al estar cuantizado en GGUF, puede ejecutarse en CPUs de portátiles o GPUs integradas, permitiendo agentes locales sin conexión a la nube.
- **Prototipado rápido de agentes**: los desarrolladores pueden usar este modelo para validar flujos de *tool calling* antes de migrar a modelos más grandes, reduciendo costes de inferencia.
- **Integración en pipelines de datos**: generar consultas SQL o invocar funciones de procesamiento de datos a partir de instrucciones en lenguaje natural, aprovechando el formato JSON de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada es la pérdida de entrenamiento observada en los trabajos SLURM, que no debe interpretarse como una medida de calidad del modelo. No se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- **VRAM estimada**: la cuantización más pequeña (Q2_K) ocupa 990 MB, mientras que la más grande (Q8_0) ocupa 2.08 GB. Para inferencia en GPU, se recomienda al menos 2 GB de VRAM para Q8_0.
- **GPU recomendadas**: cualquier GPU con 2 GB o más de VRAM, incluidas tarjetas de consumo como la RTX 3060, RTX 4060, o incluso iGPU integradas en procesadores modernos. Para despliegue en CPU, el modelo puede ejecutarse sin GPU con `llama.cpp`.
- **Opciones de despliegue**: `llama.cpp` (incluyendo `llama-cli`), Ollama, y cualquier plataforma que soporte formato GGUF como `llama-cpp-python` o `text-generation-webui`.
- **Latencia y throughput**: no disponible. Dado el tamaño reducido, se espera una latencia baja en GPU, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Especialización |
|---|---|---|---|---|---|
| **Qwen3.8-2B-Function-Calling** (este) | 1.94B | 2048 | Apache-2.0 | GGUF | Function calling |
| Qwen2.5-3B-Instruct | 3.09B | 32768 | Apache-2.0 | safetensors, GGUF | Instrucción general |
| Llama-3.2-3B-Instruct | 3.21B | 128000 | Meta Llama License | safetensors, GGUF | Instrucción general |
| Microsoft Phi-3-mini | 3.8B | 4096 | MIT | safetensors, GGUF | Instrucción general |

No se dispone de resultados de benchmarks comparativos para este modelo, por lo que la comparación se basa únicamente en características técnicas. Los modelos alternativos como Qwen2.5-3B-Instruct o Llama-3.2-3B-Instruct ofrecen mayores longitudes de contexto, pero no están específicamente entrenados para *function calling*.

## Limitaciones y advertencias

- **Sesgos y limitaciones heredados**: el modelo hereda los sesgos, el corte de conocimiento y los fallos del modelo base `empero-ai/Qwen3.8-2B`, que a su vez se basa en Qwen3.8.
- **Riesgo de alucinación**: no se ha evaluado formalmente el modelo en benchmarks, por lo que el riesgo de alucinación en la generación de llamadas a funciones no está cuantificado. La especialización en un único dataset puede provocar respuestas incorrectas fuera de ese dominio.
- **Ventana de contexto limitada**: 2048 tokens, insuficiente para tareas que requieran contexto largo o conversaciones muy extensas.
- **Idiomas no especificados**: no se ha documentado qué idiomas soporta el modelo de forma fiable. La base Qwen3.8 es multilingüe, pero el ajuste fino puede haber afectado el comportamiento en idiomas distintos del inglés.
- **Licencia**: Apache-2.0 permite uso comercial sin restricciones, pero el modelo base y los datos de entrenamiento deben revisarse para cumplir con las licencias de los componentes originales.
- **Limitación de despliegue**: los adaptadores LoRA se han fusionado en los pesos base, por lo que no se puede eliminar el ajuste fino si se necesita el comportamiento original del modelo base.

## Enlaces

- [HuggingFace - modelo GGUF](https://huggingface.co/ermiaazarkhalili/Qwen3.8-2B-Function-Calling-xLAM-Unsloth-GGUF)
- [HuggingFace - modelo base sin cuantizar](https://huggingface.co/ermiaazarkhalili/Qwen3.8-2B-Function-Calling-xLAM-Unsloth)
- [HuggingFace - modelo base de Qwen3.8](https://huggingface.co/empero-ai/Qwen3.8-2B)
- [GitHub - Qwen3.8](https://github.com/QwenLM/Qwen3.8)
- [Dataset de entrenamiento - xlam-function-calling-60k](https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k)
