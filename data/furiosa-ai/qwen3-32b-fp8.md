# furiosa-ai/Qwen3-32B-FP8

## Resumen

El modelo `furiosa-ai/Qwen3-32B-FP8` es una versión precompilada del modelo Qwen3-32B-FP8 de Qwen, publicada por FuriosaAI para ejecutarse en su hardware acelerador RNGD mediante el framework Furiosa-LLM. Se trata de un modelo de lenguaje denso de 32.762 millones de parámetros, basado en una arquitectura transformer causal con atención de grupo de consultas (GQA), cuantizado en FP8 estático para los pesos y FP8 dinámico para las activaciones. Su característica principal es el modo de razonamiento híbrido: puede emitir una cadena de pensamiento antes de la respuesta final (modo thinking) o responder directamente (modo non-thinking), conmutable por petición. Además, soporta tool calling y capacidades de agente, y está liberado bajo licencia Apache 2.0.

Este repositorio incluye el bundle ejecutable de Furiosa (FXB) que permite desplegar el modelo en tarjetas RNGD con tensor parallelism de 32 PEs (cuatro tarjetas). El mismo modelo base también puede ejecutarse con otros frameworks como vLLM, SGLang o Transformers, pero esta ficha se centra en la versión optimizada para FuriosaAI. La relevancia actual radica en ofrecer una alternativa de inferencia de alto rendimiento para un modelo de razonamiento de 32B en hardware especializado, con cuantización FP8 que reduce el uso de memoria sin degradar significativamente la calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (dense), transformer causal con grouped-query attention |
| Parametros totales | 32.762.123.264 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 estatico para pesos (block size 128), FP8 dinamico para activaciones, KV cache en 16 bits |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos FP8) y Furiosa Executable Bundle (FXB) |

## Arquitectura y entrenamiento

El modelo es una versión cuantizada del Qwen3-32B original, que emplea una arquitectura transformer densa con atención de grupo de consultas (GQA) para reducir el coste de memoria de la KV cache. La cuantización FP8 es estática para los pesos (con granularidad fina de bloque de 128) y dinámica para las activaciones (por token y por bloque), mientras que la KV cache se mantiene en precisión de 16 bits. No se dispone de información detallada sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) en la documentación proporcionada. La innovación principal de esta versión es la compilación previa en un bundle FXB que optimiza la ejecución en hardware RNGD, permitiendo un despliegue directo sin necesidad de compilar el modelo en el dispositivo.

## Capacidades

- Razonamiento híbrido: modo thinking (emite cadena de pensamiento antes de la respuesta) y modo non-thinking, conmutable por petición mediante `enable_thinking`.
- Tool calling: soporta llamadas a funciones mediante el parser `hermes`, integrable con la API de OpenAI.
- Capacidades de agente: puede decidir cuándo invocar herramientas en flujos multi-paso.
- Generación de texto y diálogo multilingüe (idiomas no especificados en la documentación).
- Razonamiento matemático y lógico, así como generación de código, gracias al modo thinking.
- Compatible con la API OpenAI (chat completions) y con streaming, devolviendo el contenido de razonamiento en un campo separado (`reasoning`).

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (aunque la longitud exacta no se especifica) y, gracias al modo non-thinking, responder con baja latencia en diálogos generales. Su soporte de tool calling permite integrarlo con sistemas de ticketing o bases de conocimiento.
- Generación de código en producción: con el modo thinking activado, el modelo razona sobre problemas de programación complejos antes de emitir código. Puede integrarse en pipelines de CI/CD para autocompletar o revisar código, y su licencia Apache 2.0 permite uso comercial sin restricciones.
- Agentes autónomos: al combinar tool calling y razonamiento multi-paso, es adecuado para construir agentes que consultan APIs, ejecutan acciones y resuelven tareas complejas (por ejemplo, automatización de tareas de oficina o investigación web).
- Asistencia en análisis de datos: el modelo puede interpretar instrucciones en lenguaje natural, generar consultas SQL o código Python para análisis, y explicar resultados. Su modo thinking ayuda a descomponer problemas estadísticos complejos.
- Traducción y procesamiento multilingüe: aunque los idiomas no están documentados, el modelo base Qwen3 soporta múltiples lenguas; puede usarse para traducción, resumen o generación de contenido en varios idiomas.
- Despliegue en entornos con hardware especializado: al estar precompilado para RNGD, es ideal para organizaciones que ya utilizan infraestructura FuriosaAI y necesitan un modelo de razonamiento de alto rendimiento con baja latencia, sin preocuparse por la compilación o el ajuste de kernels.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K u otros. Se recomienda consultar la documentación del modelo base Qwen3-32B para referencias de rendimiento, aunque la cuantización FP8 puede introducir ligeras variaciones.

## Requisitos de hardware

- Hardware objetivo: FuriosaAI RNGD (tarjetas aceleradoras). El modelo se ejecuta con tensor parallelism de 32 PEs, lo que equivale a cuatro tarjetas RNGD (8 PEs por tarjeta).
- VRAM estimada: no disponible en la documentación oficial. Una estimación externa sugiere alrededor de 27 GB, pero no es un dato confirmado por FuriosaAI.
- No es compatible con GPUs convencionales (NVIDIA, AMD) en este formato FXB; para ejecutarlo en GPUs estándar se debe usar el modelo base Qwen/Qwen3-32B-FP8 con frameworks como vLLM o Transformers.
- Opciones de despliegue: Furiosa-LLM (servidor OpenAI-compatible), con soporte para streaming, tool calling y control del modo thinking.
- Latencia y throughput: no se proporcionan datos numéricos. Se espera un rendimiento optimizado gracias a la compilación previa para RNGD.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Hardware objetivo |
|---|---|---|---|---|
| furiosa-ai/Qwen3-32B-FP8 | 32,8B | No disponible | Apache 2.0 | FuriosaAI RNGD (4 tarjetas) |
| Qwen/Qwen3-32B-FP8 (base) | 32,8B | No disponible | Apache 2.0 | GPUs estándar (vLLM, Transformers) |
| Qwen/Qwen3-32B (BF16) | 32,8B | No disponible | Apache 2.0 | GPUs estándar |

No se dispone de datos de rendimiento comparativo entre estas versiones. La principal diferencia es el formato de pesos y el hardware de ejecución: la versión de FuriosaAI está optimizada para RNGD, mientras que el modelo base es portable a cualquier framework. La cuantización FP8 reduce el uso de memoria en ambos casos.

## Limitaciones y advertencias

- La cuantización FP8 puede provocar una ligera degradación de precisión en tareas de razonamiento complejo en comparación con el modelo en BF16, aunque no se han publicado evaluaciones cuantitativas.
- El modelo está diseñado específicamente para hardware FuriosaAI RNGD; no puede ejecutarse en GPUs convencionales con el bundle FXB incluido. Para otros entornos, se debe usar el modelo base.
- No se especifican los idiomas soportados ni la longitud de contexto exacta, lo que limita la planificación de despliegues en aplicaciones multilingües o con requisitos de contexto largo.
- Como todo LLM, existe riesgo de alucinación y de generar contenido sesgado o incorrecto, especialmente en modo non-thinking. Se recomienda validar las salidas en aplicaciones críticas.
- La licencia Apache 2.0 permite uso comercial, pero el hardware RNGD es un producto propietario de FuriosaAI; el coste de adquisición de las tarjetas debe considerarse en el análisis de viabilidad.
- El campo `reasoning` en la respuesta no forma parte del estándar OpenAI; los clientes deben adaptarse a esta convención para acceder a la cadena de pensamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/furiosa-ai/Qwen3-32B-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3-32B-FP8
- Documentación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Guía de Qwen3 en FuriosaAI: https://developer.furiosa.ai/latest/en/furiosa_llm/models/qwen3.html
- Guía de tool calling: https://developer.furiosa.ai/latest/en/furiosa_llm/toolcalling.html
