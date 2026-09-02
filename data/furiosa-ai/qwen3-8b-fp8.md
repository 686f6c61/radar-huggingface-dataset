# furiosa-ai/Qwen3-8B-FP8

## Resumen

El modelo `furiosa-ai/Qwen3-8B-FP8` es una distribución del modelo Qwen3-8B-FP8 de Alibaba, empaquetada por FuriosaAI junto con un Furiosa Executable Bundle (FXB) para ejecutarse en el acelerador FuriosaAI RNGD mediante el framework Furiosa-LLM. No se trata de un modelo nuevo, sino de una versión optimizada y precompilada para hardware específico, manteniendo las mismas capacidades que el modelo original: razonamiento híbrido con modo thinking y no-thinking, tool calling y soporte multilingüe.

El modelo base Qwen3-8B es un transformer causal denso de 8.190 millones de parámetros con grouped-query attention, cuantizado en FP8 estático para los pesos y FP8 dinámico para las activaciones. Su relevancia radica en ofrecer una vía de despliegue eficiente en hardware RNGD, con una sola tarjeta capaz de alojar el modelo completo, y en mantener compatibilidad con la API de OpenAI para integración sencilla en aplicaciones existentes.

La licencia Apache 2.0 permite uso comercial sin restricciones significativas, y el repositorio incluye tanto los pesos en formato safetensors como el bundle FXB necesario para Furiosa-LLM. Está pensado para desarrolladores que trabajan con la infraestructura de FuriosaAI, aunque el modelo subyacente también puede ejecutarse en otros frameworks como vLLM, SGLang o Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (dense), transformer causal con grouped-query attention |
| Parametros totales | 8.190.735.360 (8,19B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 estatico para pesos (block size 128), FP8 dinamico para activaciones (per-token/per-block); KV cache en 16-bit |
| Idiomas soportados | Ingles (declarado en el repo); el modelo base Qwen3-8B es multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (incluye FXB para Furiosa-LLM) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal denso con grouped-query attention, propio de la serie Qwen3. Su caracteristica principal es el modo hibrido de razonamiento: por defecto emite una cadena de pensamiento antes de la respuesta final (thinking mode), pero puede desactivarse por peticion mediante `enable_thinking` para obtener respuestas directas y mas rapidas. Esta capacidad esta integrada en un unico modelo, sin necesidad de cargar pesos adicionales.

No se proporcionan datos especificos sobre el entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) en la documentacion disponible. El modelo base es Qwen/Qwen3-8B-FP8, cuantizado por Alibaba con FP8 estatico de grano fino (block size 128). FuriosaAI anade un bundle FXB precompilado que aprovecha las instrucciones nativas del acelerador RNGD, manteniendo las activaciones en FP8 dinamico y la cache KV en precision de 16 bits.

## Capacidades

- Generacion de texto y conversacion multi-turno con API compatible con OpenAI.
- Razonamiento complejo en modo thinking: emite una cadena de pensamiento antes de la respuesta final, util para matematicas, logica y codigo.
- Conmutacion por peticion entre modo thinking y no-thinking mediante `enable_thinking` en `chat_template_kwargs`.
- Tool calling / function calling mediante el parser `hermes`, con soporte de `--enable-auto-tool-choice`.
- Capacidades de agente: puede encadenar multiples pasos de razonamiento y llamadas a herramientas.
- Soporte multilingue heredado del modelo base Qwen3-8B, aunque el repositorio declara ingles como idioma principal.
- Integracion con Furiosa-LLM para despliegue en hardware RNGD, con servidor OpenAI-compatible.

## Casos de uso

- Despliegue de asistentes conversacionales en hardware FuriosaAI RNGD: el modelo se sirve con Furiosa-LLM y expone una API OpenAI-compatible, lo que permite sustituir un backend estandar sin cambios en el cliente.
- Razonamiento avanzado en produccion: activando el modo thinking, el modelo resuelve problemas de matematicas, logica o planificacion que requieren varios pasos, devolviendo el razonamiento en un campo separado (`reasoning`) para su auditoria.
- Agentes autonomos con tool calling: gracias al parser `hermes` y al soporte de auto-tool-choice, el modelo puede decidir que herramientas invocar y procesar sus resultados en un bucle de agente.
- Generacion de codigo asistida: el modo thinking permite al modelo razonar sobre el problema antes de escribir codigo, reduciendo errores sintacticos y logicos en tareas de programacion.
- Servicios de atencion al cliente multilingue: aunque el repo declara ingles, el modelo base soporta varios idiomas, permitiendo conversaciones en distintos lenguajes con un unico despliegue.
- Evaluacion de modelos en entornos de bajo consumo: al ejecutarse en una sola tarjeta RNGD con FP8, es adecuado para pruebas de concepto y entornos con restricciones de energia o espacio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas comparativas con otros modelos, y la documentacion de FuriosaAI se centra en el despliegue y la configuracion, no en metricas de rendimiento.

## Requisitos de hardware

- Hardware objetivo: FuriosaAI RNGD, con tensor-parallel size de 8 PEs, que mapea a una unica tarjeta RNGD (8 PEs por tarjeta).
- Memoria: no se especifica la VRAM exacta, pero el repositorio pesa 15,7 GB en FP8; la tarjeta RNGD debe disponer de memoria suficiente para alojar los pesos y la cache KV en 16-bit.
- No esta disenado para GPU convencionales (NVIDIA, AMD); el bundle FXB es especifico de RNGD. El modelo base puede ejecutarse en otros frameworks, pero esta distribucion concreta requiere hardware FuriosaAI.
- Opciones de despliegue: Furiosa-LLM (servidor OpenAI-compatible), con soporte para reasoning parser y tool-call parser. Tambien puede usarse con vLLM, SGLang o Transformers si se descargan los pesos del modelo base.
- Latencia y throughput: no disponibles en la documentacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| furiosa-ai/Qwen3-8B-FP8 | 8,19B | No disponible | FP8 estatico/dinamico | Apache 2.0 | FuriosaAI RNGD |
| Qwen/Qwen3-8B-FP8 (upstream) | 8,19B | No disponible | FP8 estatico | Apache 2.0 | GPU y otros aceleradores |
| Qwen/Qwen3-8B (original) | 8,19B | No disponible | BF16/FP16 | Apache 2.0 | GPU y otros aceleradores |

No se dispone de datos de rendimiento comparativo. La diferencia principal radica en el empaquetado FXB y la optimizacion para RNGD, mientras que el modelo subyacente es identico al upstream.

## Limitaciones y advertencias

- Sesgos: no se documentan sesgos especificos, pero el modelo base Qwen3-8B puede presentar sesgos derivados de sus datos de entrenamiento, no auditados en esta distribucion.
- Riesgo de alucinacion: como todo modelo generativo, puede producir contenido falso o inventado, especialmente en modo no-thinking donde no se emite razonamiento intermedio.
- Limitaciones de idioma: el repositorio declara ingles como unico idioma soportado, aunque el modelo base es multilingue; el rendimiento en otros idiomas puede variar.
- Restricciones de hardware: el bundle FXB solo funciona en FuriosaAI RNGD; no es portable a GPU estandar sin usar los pesos del modelo base.
- Longitud de contexto no especificada: se desconoce el limite de tokens de entrada, lo que puede afectar a aplicaciones que requieran ventanas largas.
- Dependencia de Furiosa-LLM: el despliegue requiere instalar y configurar el framework Furiosa-LLM, con su curva de aprendizaje y requisitos de version.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/furiosa-ai/Qwen3-8B-FP8
- Modelo base upstream: https://huggingface.co/Qwen/Qwen3-8B-FP8
- Documentacion de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Guia de tool calling en Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/toolcalling.html
- Pagina de modelos Qwen3 dense en FuriosaAI: https://developer.furiosa.ai/latest/en/furiosa_llm/models/qwen3.html
