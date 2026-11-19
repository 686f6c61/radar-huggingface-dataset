# loom-draft/superwhisper-s1-mini-loom

## Resumen

`superwhisper-s1-mini-loom` es un paquete de despliegue en formato Loom (`.loom`) para el checkpoint GGUF `superwhisper/s1-mini-GGUF` en cuantización Q4_K_M, generado por el usuario `loom-draft` mediante la herramienta `loom-next` (generador sin LLM en el bucle). No se trata de un modelo nuevo ni de un fine-tune con pesos propios: el autor indica explícitamente que el checkpoint GGUF subyacente está "unmodified", por lo que la innovación está en el artefacto de despliegue, no en el modelo.

El paquete está orientado a dos aceleradores AMD concretos: la APU AMD Ryzen AI Max+ 395 "Strix Halo" (arquitectura gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB). Se sirve mediante `loom-serve`, que expone una API compatible con OpenAI (`/v1/chat/completions`) e integra tool calling y modo de razonamiento opcional.

La relevancia de esta ficha es acotada: el artefacto permite ejecutar un modelo pequeño (s1-mini, presumiblemente derivado de la familia Qwen3 por el nombre y por el flag `enable_thinking`) sobre hardware AMD consumer y profesional mediante una pila alternativa a llama.cpp. Sin embargo, el autor no ha publicado mediciones de rendimiento ni evidencias de los gates de corrección para este paquete en concreto, y la información sobre el modelo base es escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base GGUF; el paquete Loom genera kernels para gfx1151 y gfx1201) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 40.960 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (única incluida en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; términos no detallados) |
| Formato de pesos | GGUF (convertido a programas `.loom` y `weights.loom`) |

Otros datos operativos: máximo de 4.096 tokens de salida por petición (preset `max_tokens`), 4 peticiones concurrentes, razonamiento activado por defecto y desactivable con `chat_template_kwargs: {"enable_thinking": false}`.

## Arquitectura y entrenamiento

No hay información sobre la arquitectura interna del modelo base `superwhisper/s1-mini-GGUF` en la documentación proporcionada: no se detallan tipo de transformer, número de capas, dimensiones ocultas, composición del dataset ni si hubo RLHF o DPO. El nombre "s1-mini" y el flag `enable_thinking` sugieren una variante pequeña con modo de razonamiento, pero esto no está confirmado en la información disponible.

Lo que sí está documentado es la capa de despliegue: `loom-next` genera programas `.loom` y kernels específicos para las arquitecturas AMD gfx1151 y gfx1201 a partir de `llm_config.json`, y `loom-serve` los ejecuta con un pool de memoria fijo (`--pool_backing=fixed`) y precarga de parámetros (`--parameter_mode=preload`). El paquete incluye `tokenizer.json`, `model.json` con hashes SHA-256 de los ficheros fuente verificados por `loom-fetch`, y un fichero `info.json` con mediciones y versiones. Las funcionalidades de decodificación especulativa, entrada de imagen y entrada/salida de audio están marcadas como "not applicable" en la tabla de características.

## Capacidades

- Generación de texto conversacional vía API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling estilo OpenAI: acepta el parámetro `tools` y devuelve `tool_calls`.
- Modo de razonamiento (thinking) activado por defecto, desactivable por petición mediante `chat_template_kwargs`.
- Soporte de hasta 40.960 tokens de contexto por petición, suficiente para documentos largos y conversaciones multi-turno extensas.
- Concurrencia de 4 peticiones simultáneas en el servidor.
- Sin soporte de entrada de imagen, entrada/salida de audio ni decodificación especulativa (marcados como no aplicables).
- Capacidades multilingües: no disponibles en la documentación.
- No se documenta "reasoning effort" configurable (marcado como no aplicable).

## Casos de uso

- Asistente conversacional local en estaciones de trabajo AMD: el paquete permite levantar un endpoint compatible con OpenAI en una Radeon AI PRO R9700 o en una APU Strix Halo sin depender de CUDA, útil para entornos con hardware AMD exclusivamente.
- Automatización de agentes con tool calling: el soporte de `tools`/`tool_calls` y el modo thinking permiten construir bucles multi-turno de razonamiento y ejecución de herramientas (por ejemplo, consultas a APIs internas) sobre el endpoint local.
- Procesamiento de documentos largos: con 40.960 tokens de contexto por petición se pueden resumir o extraer información de contratos, informes o transcripciones extensas en una sola pasada.
- Prototipado y evaluación de la pila Loom: investigadores que quieran comparar el rendimiento de `loom-serve` frente a llama.cpp sobre el mismo GGUF pueden usar este paquete como referencia reproducible, aunque las mediciones aún no estén publicadas.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse íntegramente en local sobre hardware AMD, los datos no salen de la máquina, lo que encaja en flujos con datos sensibles.
- Servicio de chat interno de baja concurrencia: con 4 peticiones concurrentes y 4.096 tokens de salida máxima, es adecuado para equipos pequeños o uso individual, no para cargas de producción de alta demanda.
- Integración en pipelines de CI/CD como servicio de pruebas: permite validar plantillas de prompt, formato de tool calls y comportamiento del modo thinking contra una implementación alternativa a llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo y R9700, pero ambas indican textualmente que "the results for this package are not yet re-measured". Del mismo modo, todos los gates de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" para ambas plataformas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El paquete está diseñado para la Radeon AI PRO R9700 con 32 GB y para la APU Strix Halo (memoria unificada), y la cuantización Q4_K_M reduce el peso del modelo, pero el tamaño exacto del checkpoint no se indica.
- GPU soportadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se mencionan otras GPU AMD ni NVIDIA.
- GPU consumer: no se confirma compatibilidad con GPUs de consumo distintas de Strix Halo; no hay datos para Radeon RX 7000/9000 de escritorio.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este paquete (aunque el modelo base GGUF podría usarse con llama.cpp por separado).
- Latencia y throughput: no disponibles; las mediciones están pendientes de re-ejecución según el autor.
- Memoria: el preset usa pool de memoria fijo (`--pool_backing=fixed`) y precarga de pesos (`--parameter_mode=preload`), lo que implica que la memoria se reserva al arrancar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| superwhisper-s1-mini-loom | no disponible | 40.960 | Loom + GGUF Q4_K_M | other | AMD gfx1151 / gfx1201 |
| superwhisper/s1-mini-GGUF (base) | no disponible | no disponible | GGUF | other | Genérico (llama.cpp y similares) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma familia o tamaño en la documentación proporcionada, ni de datos de rendimiento que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Artefacto de despliegue, no modelo nuevo: los pesos son idénticos al GGUF `superwhisper/s1-mini-GGUF`; cualquier limitación del modelo base se hereda íntegramente.
- Sin evidencias de corrección publicadas: todos los gates de la suite `loom-benchmark` figuran como no re-medidos, por lo que no hay verificación pública de que la salida coincida con llama.cpp en este paquete.
- Sin benchmarks de rendimiento: no se puede estimar throughput ni latencia a partir de la información disponible.
- Licencia "other" sin términos detallados: es imprescindible revisar la licencia del modelo base antes de cualquier uso comercial; la model card no aclara restricciones.
- Idiomas no declarados: no se especifica qué lenguas soporta el modelo, lo que impide garantizar calidad en castellano u otros idiomas.
- Hardware muy restringido: solo se documentan dos plataformas AMD; no hay soporte declarado para NVIDIA, GPUs AMD de consumo ni CPU.
- Concurrencia baja: 4 peticiones simultáneas y 4.096 tokens de salida máxima limitan su uso en producción de alta demanda.
- Riesgo de alucinación y sesgos: no documentados por el autor; al ser un modelo pequeño con modo thinking por defecto, conviene validar las salidas en aplicaciones sensibles.
- Dependencia de la pila Loom: requiere `hrx-loom==0.2.0` y los comandos específicos de `loom-serve`; la compatibilidad futura con versiones posteriores no está garantizada.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de soporte comunitario.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/superwhisper-s1-mini-loom
- Modelo base GGUF: https://huggingface.co/superwhisper/s1-mini-GGUF
- Repositorio de Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
