# loom-draft/prithivMLmods-Qwen3.8-Whittle-16B-loom

## Resumen

El repositorio `loom-draft/prithivMLmods-Qwen3.8-Whittle-16B-loom` no contiene un modelo entrenado desde cero, sino un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) que envuelve el checkpoint GGUF sin modificar `prithivMLmods/Qwen3.8-Whittle-16B-GGUF`, en su cuantización `Q4_K_M`. El autor del paquete es `loom-draft`, y el modelo base procede de `prithivMLmods`. El paquete está generado con la herramienta `loom-next`, que según la model card opera como generador sin intervención de un LLM en el bucle.

El objetivo del paquete es ofrecer una ruta de ejecución optimizada para GPUs AMD concretas: el APU AMD Ryzen AI Max+ 395 "Strix Halo" (arquitectura gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB). Para ello expone un servidor compatible con la API de chat de OpenAI (`/v1/chat/completions`) mediante `loom-serve`, con soporte declarado de tool calling, modo de razonamiento y una ventana de contexto de 262.144 tokens por petición.

La relevancia del artefacto es acotada y práctica: no aporta pesos nuevos ni mejoras de calidad respecto al modelo base, sino un empaquetado reproducible (con verificación sha256 de los ficheros de origen) y un conjunto de pruebas de corrección y rendimiento frente a llama.cpp. En el momento de la información disponible, esas mediciones y pruebas de corrección figuran como "not yet re-measured", es decir, sin evidencia registrada para este paquete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del modelo base Qwen3.8-Whittle-16B; el paquete no la documenta) |
| Parametros totales | 16B (según el nombre del checkpoint base; no verificado en la información disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (única incluida en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint base) empaquetado como programas `.loom` + `model.json` |

Otros parámetros operativos declarados en la model card: máximo de 4.096 tokens de salida por defecto (preset `max_tokens`), concurrencia de 4 peticiones simultáneas, `reasoning_effort` con valores `low`, `medium` y `xhigh` (por defecto `xhigh`), y decodificación especulativa marcada como no aplicable.

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base: el paquete Loom no incluye detalles sobre tipo de transformer, atención, composición del dataset ni fases de alineación (RLHF/DPO). Lo único documentado a nivel de arquitectura es la capa de ejecución: kernels generados para gfx1151 y gfx1201, un pool de memoria con `--pool_backing=fixed` que reserva el espacio por adelantado en lugar de crecimiento elástico, y `--parameter_mode=preload`, que solo altera la carga de pesos en el host.

El paquete se genera con `loom-next`, descrito como generador sin LLM en el bucle, y `loom-fetch` verifica los ficheros de origen mediante sha256. La decodificación especulativa no está soportada en este preset. El modo de razonamiento está activado por defecto y puede desactivarse con `chat_template_kwargs: {"enable_thinking": false}`.

## Capacidades

- Generación de texto conversacional a través de una API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling con el esquema `tools` y `tool_calls` de OpenAI.
- Modo de razonamiento (thinking) activado por defecto, con control de esfuerzo mediante `reasoning_effort` (`low`, `medium`, `xhigh`).
- Ventana de contexto de 262.144 tokens por petición, adecuada para documentos largos.
- Concurrencia de hasta 4 peticiones simultáneas.
- Salida limitada a 4.096 tokens por defecto según el preset.
- Sin soporte de entrada de imagen ni de audio (marcado como "not applicable").
- Sin decodificación especulativa en este paquete.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional autoalojado en estaciones de trabajo AMD: el paquete se sirve con `loom-serve` sobre Strix Halo o R9700 y expone un endpoint compatible con OpenAI, lo que permite conectar clientes existentes sin adaptadores.
- Procesamiento de documentos largos: con 262.144 tokens de contexto por petición, encaja en tareas de resumen o extracción sobre contratos, informes o bases de código extensas en una sola pasada.
- Automatización con herramientas: el soporte de `tools`/`tool_calls` permite construir agentes que consulten APIs internas, bases de datos o sistemas de tickets dentro de un bucle multi-turno.
- Razonamiento con esfuerzo configurable: el parámetro `reasoning_effort` permite rebajar el coste computacional en tareas simples (`low`) y elevarlo en problemas de análisis (`xhigh`), ajustando latencia y calidad en el mismo despliegue.
- Entornos con requisitos de licencia permisiva: al ser Apache 2.0, puede integrarse en productos comerciales internos sin las restricciones de licencias copyleft o de uso condicionado.
- Evaluación y desarrollo en hardware AMD: sirve como banco de pruebas para comparar el rendimiento de los kernels Loom frente a llama.cpp en gfx1151 y gfx1201, aunque las mediciones de este paquete aún no estén registradas.
- Despliegue en memoria unificada: en Strix Halo, el preset con pool fijo permite reservar por adelantado el espacio necesario para el checkpoint Q4_K_M y evitar crecimiento dinámico durante el servicio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo y R9700, pero ambas indican: "the results for this package are not yet re-measured". Del mismo modo, las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" para ambas GPUs, por lo que no hay evidencia registrada de equivalencia con llama.cpp.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el checkpoint es una cuantización Q4_K_M de un modelo de 16B, y el preset usa `--pool_backing=fixed`, que reserva el pool de memoria por adelantado.
- GPU soportadas explícitamente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de consumo: no se documenta soporte para GPUs de consumo (RTX 4090 u otras); el paquete está orientado a hardware AMD concreto.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve`. No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones de despliegue de este paquete, aunque llama.cpp se usa como referencia de comparación.
- Latencia y throughput: no disponibles; las mediciones para este paquete no se han vuelto a realizar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| loom-draft/prithivMLmods-Qwen3.8-Whittle-16B-loom | 16B (según nombre del base) | 262.144 tokens | Apache 2.0 | Paquete Loom + GGUF Q4_K_M | Optimizado para gfx1151 y gfx1201; sin benchmarks registrados |
| prithivMLmods/Qwen3.8-Whittle-16B-GGUF | 16B (según nombre) | no disponible | no disponible en la información | GGUF | Checkpoint base sin modificar; ejecutable con llama.cpp |
| Alternativas de 16B en GGUF | no disponible | no disponible | no disponible | GGUF | No se dispone de datos comparativos verificados en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento, calidad o latencia con alternativas de la misma categoría.

## Limitaciones y advertencias

- El paquete no aporta pesos nuevos: cualquier limitación de calidad, sesgo o alucinación del checkpoint `prithivMLmods/Qwen3.8-Whittle-16B-GGUF` se hereda sin cambios.
- No hay evidencia registrada de corrección: todas las puertas (`golden`, `compare`, `agent`, `sampling`, `logits`, etc.) figuran como no re-medidas, por lo que no se ha verificado la equivalencia de salida con llama.cpp para este paquete.
- Tampoco hay mediciones de rendimiento publicadas para este paquete en ninguna de las dos GPUs objetivo.
- La cuantización es única (Q4_K_M); no se ofrece una variante de mayor precisión para escenarios donde la cuantización de 4 bits sea insuficiente.
- El límite de salida por defecto es de 4.096 tokens, lo que puede requerir ajuste del preset para tareas de generación larga.
- La concurrencia está limitada a 4 peticiones simultáneas, lo que restringe su uso como servicio de alta demanda sin escalado horizontal.
- El soporte de hardware está restringido a gfx1151 y gfx1201; no se documenta compatibilidad con otras GPUs AMD, NVIDIA o CPU.
- No se documentan los idiomas soportados ni sesgos conocidos del modelo base.
- Aunque la licencia del paquete es Apache 2.0, conviene verificar la licencia del checkpoint base antes de un uso comercial, ya que la información disponible no la detalla.
- El proyecto Loom es reciente y con pocas señales de adopción (0 descargas y 0 likes en el momento de la consulta), lo que implica menor madurez y soporte comunitario.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-draft/prithivMLmods-Qwen3.8-Whittle-16B-loom
- Modelo base (GGUF): https://huggingface.co/prithivMLmods/Qwen3.8-Whittle-16B-GGUF
- Sistema Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
