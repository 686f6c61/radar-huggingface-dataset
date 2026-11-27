# loom-draft/llm-jp-llm-jp-4-33b-thinking-loom

## Resumen

`loom-draft/llm-jp-llm-jp-4-33b-thinking-loom` no es un modelo de lenguaje entrenado desde cero, sino un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `llm-jp/llm-jp-4-33b-thinking-GGUF`, en su cuantización `Q4_K_M`. Lo publica el usuario `loom-draft` y está pensado para ejecutar el modelo en GPUs AMD concretas: la APU Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB). La generación se ha realizado con la herramienta `loom-next`, sin intervención de un LLM en el bucle.

El modelo subyacente es `llm-jp-4-33b-thinking`, un modelo de 33 000 millones de parámetros con modo de razonamiento («thinking») siempre activo, desarrollado por el proyecto LLM-jp. Este paquete añade una capa de ejecución específica para el runtime `loom-serve`, que expone una API compatible con OpenAI (`/v1/chat/completions`), soporte de tool calling y un parámetro `reasoning_effort` con tres niveles.

La relevancia de esta ficha es acotada: se trata de un artefacto de despliegue con 0 descargas y 0 likes en el momento de la consulta, cuya model card indica explícitamente que las mediciones de rendimiento y las puertas de corrección («gates») aún no se han vuelto a medir para este paquete. No aporta pesos nuevos ni mejoras de entrenamiento; aporta una ruta de ejecución para hardware AMD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del modelo base `llm-jp-4-33b-thinking`; la model card no la detalla) |
| Parametros totales | 33 000 millones (derivado del nombre del modelo base; no confirmado en la informacion proporcionada) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65 536 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`llm-jp-4-33b-thinking-Q4_K_M.gguf`) empaquetado en programas `.loom` (`weights.loom`) |

Otros datos de la tarjeta: salida máxima de 4096 tokens (preset `max_tokens`), concurrencia de 4 peticiones simultáneas, decodificación especulativa no aplicable, entrada de imagen y audio sin determinar, muestreo sin determinar.

## Arquitectura y entrenamiento

La información proporcionada no describe la arquitectura interna del modelo base `llm-jp-4-33b-thinking`: no se detalla si es un transformer denso, un MoE o un modelo híbrido, ni se indica el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. Lo único verificable es que existe un modo de razonamiento («thinking») siempre activo y que el runtime permite ajustar el esfuerzo de razonamiento mediante `reasoning_effort` (low, medium, high; por defecto medium).

Lo que sí documenta la tarjeta es la capa de despliegue: `loom-next` genera programas `.loom` (kernels y grafo de ejecución) a partir del GGUF sin modificarlo, junto con `tokenizer.json`, `llm_config.json` y `model.json` con los ficheros fuente fijados por hash SHA-256, que `loom-fetch` verifica. El runtime `loom-serve` ofrece un pool de memoria de respaldo fijo (`--pool_backing=fixed`), precarga de parámetros en host (`--parameter_mode=preload`) y espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`), ajuste con el que se tomaron las mediciones de rendimiento de la tarjeta.

## Capacidades

- Generación de texto y razonamiento con modo «thinking» siempre activo.
- Ajuste del esfuerzo de razonamiento mediante `reasoning_effort`: `low`, `medium` (por defecto) y `high`.
- Tool calling estilo OpenAI: campos `tools` y `tool_calls` en la API.
- API compatible con OpenAI en `/v1/chat/completions`.
- Contexto de 65 536 tokens por petición y hasta 4096 tokens de salida.
- Concurrencia de 4 peticiones simultáneas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Entrada de imagen y de audio: no determinado en la tarjeta.
- Decodificación especulativa: no aplicable en este paquete.

## Casos de uso

- Despliegue local en estaciones de trabajo con Ryzen AI Max+ 395 «Strix Halo»: el paquete incluye comandos de inicio listos (`loom-fetch` + `loom-serve`) para servir el modelo en esta APU sin compilar kernels a mano.
- Inferencia en servidores con Radeon AI PRO R9700 de 32 GB: el preset `chat-r9700` está adaptado a esa GPU y permite ejecutar el modelo cuantizado Q4_K_M en una única tarjeta.
- Sustitución de un endpoint OpenAI por un servicio local compatible: al exponer `/v1/chat/completions`, se puede apuntar un cliente existente a `http://127.0.0.1:8080` cambiando solo la URL base.
- Agentes con tool calling: el soporte de `tools`/`tool_calls` y el modo thinking permiten construir bucles multi-turno de llamadas a funciones sobre el contexto de 65 536 tokens.
- Procesamiento de documentos largos en japonés (si el modelo base lo soporta; no confirmado): el contexto de 65k tokens y la ventana de salida de 4096 permiten resumir o extraer información de documentos extensos en una sola petición.
- Evaluación comparativa de runtimes en AMD: la tarjeta define puertas de corrección (`golden`, `compare`, `consistency`, `agent`, `logits`, etc.) frente a una referencia de llama.cpp sobre el mismo GGUF, útiles para validar la fidelidad numérica de `loom-serve`.
- Prototipado de asistentes con razonamiento graduable: usar `reasoning_effort=low` para respuestas rápidas y `high` para tareas de análisis, ajustando coste y latencia por petición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo y Radeon AI PRO R9700, pero ambas indican textualmente que los resultados de este paquete «aún no se han vuelto a medir». Del mismo modo, todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como «not yet re-measured», de modo que no hay evidencia registrada de su cumplimiento.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El peso Q4_K_M de un modelo de 33B ronda los 19-20 GB de forma aproximada, pero este cálculo no aparece en la información proporcionada y debe tomarse como orientativo.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU NVIDIA: no soportadas por este paquete, que está generado específicamente para dispositivos AMD vía `amdgpu://`.
- Despliegue: runtime `loom-serve` del ecosistema Loom, instalado con `pipx install "hrx-loom[hf]==0.2.0"`; descarga del paquete con `loom-fetch`.
- Alternativas de despliegue (vLLM, llama.cpp, Ollama, TGI): no documentadas para este paquete; llama.cpp se usa únicamente como referencia de corrección en la tarjeta.
- Latencia y throughput: no disponibles; las mediciones están pendientes de repetir.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| `loom-draft/llm-jp-llm-jp-4-33b-thinking-loom` | 33B (según nombre) | 65 536 | GGUF Q4_K_M empaquetado en `.loom` | MIT | AMD Strix Halo / R9700 |
| `llm-jp/llm-jp-4-33b-thinking-GGUF` | 33B (según nombre) | no disponible | GGUF | no disponible | genérico (llama.cpp y similares) |
| Modelos comparables de terceros | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de rendimiento del paquete ni del modelo base que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Las mediciones de rendimiento y las puertas de corrección de este paquete no se han vuelto a medir; no hay evidencia publicada de que la salida coincida token a token con la referencia de llama.cpp.
- El paquete está generado para dos dispositivos AMD concretos (gfx1151 y gfx1201); no es portable a otras GPU sin regenerar los programas `.loom`.
- El modelo base es de 33B en Q4_K_M: la cuantización introduce pérdida de precisión respecto al checkpoint original en precisión completa.
- El modo thinking está siempre activo; no se documenta una forma de desactivarlo en este paquete (la puerta `agent_think_off` figura como no medida).
- Idiomas soportados no declarados; no se puede garantizar calidad en castellano ni en otros idiomas distintos del japonés, que es el foco presumible del proyecto LLM-jp.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; deben evaluarse por cuenta propia antes de un uso en producción.
- La licencia MIT se declara tanto en los tags como en la model card, pero conviene verificar las condiciones del modelo base `llm-jp-4-33b-thinking-GGUF`, cuya licencia no se especifica en la información disponible.
- Estado del artefacto: 0 descargas y 0 likes en el momento de la consulta; es un paquete recién generado y sin validación comunitaria.
- La búsqueda web realizada devolvió únicamente resultados sobre el producto de grabación de pantalla Loom y una marca de ropa homónima, sin relación con este paquete; no aportan información técnica adicional.

## Enlaces

- Hugging Face: https://huggingface.co/loom-draft/llm-jp-llm-jp-4-33b-thinking-loom
- Modelo base en Hugging Face: https://huggingface.co/llm-jp/llm-jp-4-33b-thinking-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
