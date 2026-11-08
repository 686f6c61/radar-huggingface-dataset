# raahemnabeel/qwen3-coder-next

## Resumen

qwen3-coder-next es un paquete de despliegue publicado por el usuario raahemnabeel que empaqueta el modelo Qwen/Qwen3-Coder-Next del equipo Qwen para su ejecución sobre aceleradores Tenstorrent Blackhole mediante vLLM y el plugin de Tenstorrent. No se trata de un modelo nuevo entrenado desde cero: el checkpoint original se utiliza tal cual se publica y los pesos de los expertos se convierten a menor precisión en el momento de la carga del servidor. El paquete se distribuye con tt-model-manager 0.1.0 (esquema de manifiesto 5.1) e incluye perfiles de servicio predefinidos para distintas configuraciones de hardware.

El modelo subyacente es un MoE de 80.000 millones de parámetros totales con 3.000 millones activos por token, compuesto por 512 expertos con enrutamiento top-10 más un experto compartido, y 48 capas que combinan atención lineal Gated DeltaNet con atención completa con compuertas. Está especializado en código y agentes de programación, es solo texto, no dispone de modo de razonamiento explícito y ofrece una ventana de contexto de 262.144 tokens con soporte de tool calling, pensado para hasta 32 usuarios concurrentes.

Su relevancia actual radica en que demuestra el despliegue de un modelo de código de gran escala sobre hardware alternativo a las GPU convencionales, con una API compatible con OpenAI y perfiles que abarcan desde dos hasta cuatro dies Blackhole. La licencia es Apache 2.0 y el repositorio ocupa 12,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 48 capas que combinan Gated DeltaNet (atención lineal) y atención completa con compuertas |
| Parametros totales | 80B |
| Parametros activos | 3B por token (512 expertos, top-10 + experto compartido) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Expertos enrutados a menor precisión en carga (bfp4 en perfiles de dos dies); no se detallan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Pesos del checkpoint original Qwen/Qwen3-Coder-Next (commit a7fbcb5c0e12d62a448eaa0e260346bf5dcc0feb); no se especifica el formato de fichero |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo Qwen3-Coder-Next: una mezcla de expertos de 80B parámetros totales con 3B activos por token, 512 expertos con enrutamiento top-10 más un experto compartido y 48 capas que alternan atención lineal Gated DeltaNet con atención completa con compuertas. El paquete de raahemnabeel no modifica el entrenamiento ni el checkpoint: utiliza los pesos publicados por Qwen y realiza la conversión de precisión de los pesos de los expertos durante la carga del servidor. El despliegue emplea paralelismo tensorial en los mixers y sharding de expertos sobre los dies disponibles.

No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO aplicadas por el equipo Qwen; la model card remite a la tarjeta original del modelo para esos datos. Las innovaciones técnicas destacables del paquete son el uso de vLLM con el plugin de Tenstorrent, el prefill por fragmentos compartido entre peticiones, la caché de prefijos con puntos de reanudación cada 2.048 tokens (32 puntos en cuatro dies, 16 en dos dies) y el parser de tool calling `qwen3_coder`.

## Capacidades

- Generación de texto y código: el modelo está orientado a generación y edición de código, incluyendo tareas a nivel de repositorio.
- Tool calling: habilitado mediante `--tool-call-parser qwen3_coder`; las peticiones con `tools` devuelven `tool_calls` y `finish_reason: tool_calls`.
- Agentes de programación: uso previsto en asistentes y agentes de código con llamadas a herramientas a través de una API compatible con OpenAI.
- Contexto largo: ventana de 262.144 tokens, adecuada para repositorios y documentos extensos.
- Concurrencia: soporta hasta 32 usuarios concurrentes según los perfiles de servicio.
- API compatible con OpenAI: chat completions, completions y `/v1/models` en el puerto 20000.
- Caché de prefijos: reanudación desde el último límite de 2.048 tokens compartido con una petición reciente.
- Sin modo de razonamiento: el modelo responde directamente, sin bloque de reasoning.
- Solo texto: no se indican capacidades de visión ni audio.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistentes de código en IDE: el modelo puede generar y editar funciones completas con un contexto de 262.144 tokens, suficiente para incluir varios ficheros de un repositorio en la misma petición.
- Agentes de resolución de incidencias a nivel de repositorio: gracias al tool calling y a la API compatible con OpenAI, un agente puede encadenar lecturas de ficheros, ediciones y ejecución de comandos sobre el código.
- Automatización de revisiones de código: el contexto largo permite enviar un diff junto con el código circundante y obtener sugerencias o correcciones en una sola llamada.
- Generación de tests y documentación: el modelo puede producir pruebas unitarias y documentación a partir de módulos completos, con la ventana de contexto necesaria para cubrir ficheros extensos.
- Servicio multiinquilino de generación de código: los perfiles admiten 32 secuencias concurrentes con prefill por fragmentos y caché de prefijos, lo que permite atender a varios usuarios sin que las peticiones largas bloqueen a las cortas.
- Despliegue sobre hardware Tenstorrent: organizaciones con aceleradores Blackhole p300x2, p150x4, p300 o p150x2 pueden servir el modelo sin GPU convencionales mediante `tt serve raahemnabeel/qwen3-coder-next`.
- Evaluación de modelos de código en entornos alternativos: el paquete permite reproducir evaluaciones como HumanEval, MBPP, GSM8K e IFEval a través de la API servida, con resultados documentados en la model card.

## Benchmarks y rendimiento

Resultados de precisión evaluados a través de la API de chat servida (p300x2, temperatura 0, conjuntos completos, 8 peticiones en vuelo, semilla 42, lm-evaluation-harness 0.4.9), comparando la versión anterior del paquete (v1) con la actual:

| Eval | v1 | Paquete actual | Referencia (tarjeta Qwen) | Prompts |
|---|---:|---:|---:|---:|
| HumanEval pass@1 | 0.939 | 0.933 ±0.020 | no reportado | 164 |
| MBPP pass@1 | 0.826 | 0.824 ±0.017 | no reportado | 500 |
| GSM8K exact match estricto (8-shot) | 0.954 | 0.954 ±0.006 | no reportado | 1.319 |
| IFEval prompt-level estricto | 0.799 | 0.791 ±0.018 | no reportado | 541 |
| IFEval prompt-level laxo | 0.841 | 0.824 ±0.016 | no reportado | 541 |

La model card indica que Qwen publica benchmarks de codificación agéntica (SWE-Bench y otros) que no se ejecutaron en esta evaluación. Los datos de rendimiento (TTFT, TPOT, throughput) se midieron en un QuietBox 2 con cuatro dies Blackhole p300c, pero los valores numéricos concretos no están disponibles en la información proporcionada.

## Requisitos de hardware

- Hardware soportado: Tenstorrent Blackhole en configuraciones p300x2 (por defecto, cuatro dies), p150x4 (cuatro placas p150), p300 (dos dies) y p150x2 (dos placas p150).
- VRAM: no aplica en el sentido convencional; el modelo se ejecuta sobre la memoria de los aceleradores Tenstorrent. No se dispone de cifras de memoria por die en la información proporcionada.
- GPU: no se indican GPU NVIDIA o AMD compatibles; el paquete está empaquetado específicamente para Tenstorrent.
- Despliegue: vLLM con el plugin de Tenstorrent, mediante `tt serve raahemnabeel/qwen3-coder-next` (requiere Tenstorrent CLI, instalable con `uv tool install tenstorrent`, y Docker) o `tt-model serve` sin la CLI.
- Primer arranque: compila kernels para el dispositivo, lo que tarda varios minutos; el servidor está listo cuando registra `Application startup complete`.
- Concurrencia: `max_num_seqs` de 32 y `max_model_len` de 262.144 en todos los perfiles.
- Caché de prefijos: consume 0,84 GiB del pool KV de cada die en la configuración de cuatro dies.
- Latencia y throughput: no disponibles con valores numéricos en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-coder-next (este paquete) | 80B (MoE) | 3B | 262.144 | Apache 2.0 | Hugging Face, despliegue Tenstorrent |
| Qwen/Qwen3-Coder-Next (original) | 80B (MoE) | 3B | 262.144 | Apache 2.0 | Hugging Face |
| Versión v1 del paquete | 80B (MoE) | 3B | 262.144 | Apache 2.0 | Versión anterior del mismo paquete |

No se dispone en la información proporcionada de datos sobre otros modelos comparables de la misma categoría (por ejemplo, otros modelos de código MoE de tamaño similar) ni de sus especificaciones, por lo que la comparativa se limita a las variantes del propio modelo.

## Limitaciones y advertencias

- El paquete no es un modelo nuevo: es un empaquetado de despliegue de Qwen/Qwen3-Coder-Next; los méritos de entrenamiento corresponden al equipo Qwen.
- La conversión de los pesos de los expertos a menor precisión al cargar puede introducir diferencias respecto al checkpoint original; los resultados de precisión muestran variaciones pequeñas respecto a v1 (por ejemplo, IFEval laxo baja de 0.841 a 0.824).
- El modelo es solo texto y no tiene modo de razonamiento; no debe esperarse un bloque de thinking.
- El muestreo se ejecuta en el dispositivo, donde `top_k` está limitado a 32, por lo que el valor por defecto de 40 se aplica como 32.
- Dependencia de hardware Tenstorrent Blackhole: no es desplegable en GPU convencionales según la información disponible.
- El primer arranque requiere compilación de kernels y varios minutos de espera.
- No se dispone de información sobre sesgos, riesgo de alucinación ni cobertura de idiomas; la model card no los documenta.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original.
- Los benchmarks de codificación agéntica (SWE-Bench y otros) no se ejecutaron en este paquete.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/raahemnabeel/qwen3-coder-next
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-Next
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Tenstorrent CLI (prerrequisitos): https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
