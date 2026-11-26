# loom-draft/weareapexcreators-Spark-X2.6-4B-LocalAI-loom

## Resumen

El paquete `loom-draft/weareapexcreators-Spark-X2.6-4B-LocalAI-loom` es una distribución en formato Loom (programas `.loom` y una tarjeta `model.json`) del checkpoint GGUF sin modificar `weareapexcreators/Spark-X2.6-4B-LocalAI`, en cuantización Q4_K_M. No se trata de un modelo nuevo: es un empaquetado generado con la herramienta `loom-next` que permite servir el modelo sobre las GPU AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) mediante el runtime `hrx-loom` (versión 0.2.0). El autor del paquete es `loom-draft` y el modelo base lo firma `weareapexcreators`.

El modelo base es un transformer de 4.000 millones de parámetros (según el nombre del checkpoint; no se detalla en la información disponible si es denso o MoE, ni su composición de entrenamiento). El paquete declara soporte de contexto de 262.144 tokens por petición, tool calling estilo OpenAI, modo de razonamiento activable y hasta 4 peticiones concurrentes, con un límite de 4.096 tokens de salida por defecto.

Su relevancia es operativa: ofrece una vía de despliegue del modelo en hardware AMD consumer y profesional con una API compatible con OpenAI, sin depender de llama.cpp para servir, y con un conjunto de puertas de verificación (correctness gates) definidas, aunque en esta versión todavía no se han vuelto a medir sus resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de 4B; tipo de transformer no especificado) |
| Parametros totales | 4B (según nombre del checkpoint `Spark-X2.6-4B-LocalAI`) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (única incluida en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`Spark-X2.6-4B-Q4_K_M.gguf`) empaquetado como Loom (`.loom` + `model.json`) |
| Modelo base | weareapexcreators/Spark-X2.6-4B-LocalAI |
| Runtime | hrx-loom 0.2.0 |
| Salida máxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultáneas |
| Decodificación especulativa | no aplicable |
| Entrada de imagen | no determinada |
| Entrada/salida de audio | no determinada |
| Muestreo (sampling) | no determinado |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base `weareapexcreators/Spark-X2.6-4B-LocalAI`: no se especifica si es un transformer denso, un MoE o una arquitectura híbrida, ni se detallan capas, atención (incluida posible atención lineal), número de cabezas o vocabulario. Tampoco se documentan los datos de entrenamiento (número de tokens, composición del corpus, uso de RLHF/DPO o fases de ajuste). El paquete Loom no modifica los pesos: distribuye el GGUF Q4_K_M tal cual y añade programas de ejecución generados por `loom-next` (el generador, sin LLM en el bucle) junto con una tarjeta `model.json` que fija los ficheros fuente con verificación sha256.

La innovación técnica relevante está en la capa de despliegue, no en el modelo. Loom compila kernels específicos para las arquitecturas AMD gfx1151 y gfx1201 y ofrece un servidor con API compatible con OpenAI. El paquete define un conjunto de puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida contra una referencia de llama.cpp sobre el mismo GGUF, incluyendo igualdad token a token en modo greedy y coincidencia de log-probs top-5. En esta versión, todas las puertas figuran como «not yet re-measured» en ambas GPU, por lo que no hay evidencia registrada de corrección para este paquete concreto.

## Capacidades

- Generación de texto conversacional mediante `/v1/chat/completions` con formato de mensajes estilo OpenAI.
- Razonamiento explícito (thinking) activado por defecto, desactivable con `chat_template_kwargs: {"enable_thinking": false}`.
- Control de esfuerzo de razonamiento mediante `reasoning_effort` con valores `low` y `high` (por defecto `high`).
- Tool calling / function calling con los campos `tools` y `tool_calls` de OpenAI, incluyendo bucles multi-turno de agente.
- Contexto largo de hasta 262.144 tokens por petición, adecuado para documentos extensos y conversaciones prolongadas.
- Concurrencia de hasta 4 peticiones simultáneas con la puerta `consistency` definida para comprobar que la salida concurrente coincide con la ejecución aislada.
- Capacidades multimodales (imagen, audio) y parámetros de muestreo: no determinadas en la información disponible.
- Idiomas soportados: no disponibles.

## Casos de uso

- Asistente conversacional autoalojado en estación de trabajo AMD: servir el modelo con `loom-serve` en una Ryzen AI Max+ 395 o una Radeon AI PRO R9700 y exponer una API OpenAI para integrarlo en herramientas internas sin depender de la nube.
- Procesamiento de documentos largos: con 262.144 tokens de contexto por petición, se pueden analizar contratos, informes o bases de código completas en una sola pasada, resumiendo o extrayendo datos estructurados.
- Agentes con herramientas: el soporte de `tools`/`tool_calls` y de bucles multi-turno permite construir asistentes que consulten APIs internas, bases de datos o sistemas de tickets, con razonamiento activado para planificar pasos.
- Generación de código asistida en local: integrar el endpoint en editores o pipelines internos para autocompletado, explicación y refactorización, manteniendo el código dentro de la infraestructura propia.
- Moderación y clasificación de texto por lotes: usar `reasoning_effort: low` y thinking desactivado para clasificar o etiquetar grandes volúmenes con menor coste por token generado.
- Prototipado y evaluación de modelos en hardware AMD: emplear el paquete como banco de pruebas para medir latencia y corrección frente a llama.cpp en gfx1151 y gfx1201 antes de pasar a producción.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia MIT del paquete facilita su incorporación en productos comerciales, sujeto a la licencia del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La tarjeta del paquete incluye una sección «Performance vs llama.cpp» para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201), pero en ambos casos indica que los resultados «are not yet re-measured». Del mismo modo, todas las puertas de corrección figuran sin medición registrada, por lo que no hay datos de throughput, latencia ni calidad que se puedan citar.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con 4B parámetros en Q4_K_M, el peso de los pesos ronda los 2,5-3 GB, pero el runtime reserva además memoria para el pool (`--pool_backing=fixed`) y la caché de contexto de hasta 262.144 tokens, cuyo consumo no se detalla.
- GPU soportadas oficialmente por el paquete: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta soporte para RTX 4090, otras GeForce ni iGPU distintas de Strix Halo; el paquete está orientado a AMD.
- Opciones de despliegue: `hrx-loom[hf]==0.2.0` con `loom-fetch` y `loom-serve`; no se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI para este paquete (llama.cpp solo aparece como referencia de corrección).
- Ajustes de ejecución documentados: `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU), `--pool_backing=fixed` y `--parameter_mode=preload`.
- Latencia y throughput: no disponibles (mediciones pendientes de repetir).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-4B-LocalAI (paquete Loom) | 4B | 262.144 | MIT | GGUF Q4_K_M + runtime Loom (AMD gfx1151/gfx1201) | Tool calling, thinking, 4 peticiones concurrentes; benchmarks pendientes |
| weareapexcreators/Spark-X2.6-4B-LocalAI (original) | 4B | no disponible | MIT (según paquete) | Checkpoint original en Hugging Face | Mismo modelo sin empaquetado Loom |
| llama.cpp sobre el mismo GGUF | 4B | según configuración | MIT (software) | GGUF con llama.cpp | Referencia de corrección usada por el paquete; no se ofrecen cifras comparativas |

No se dispone de datos de benchmarks ni de especificaciones del modelo base que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia de evidencia de corrección: todas las puertas (`kernel_tests`, `golden`, `compare`, `agent`, `sampling`, etc.) figuran como no re-medidas, por lo que no hay garantía publicada de que la salida coincida con la referencia de llama.cpp en esta versión.
- Rendimiento sin medir: no hay cifras de latencia ni throughput para ninguna de las dos GPU objetivo.
- Alcance de hardware muy restringido: solo se documentan Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no hay soporte declarado para otras GPU.
- Capacidades multimodales y de muestreo sin determinar: imagen, audio y parámetros de sampling aparecen como «?» en la tarjeta.
- Idiomas no declarados: no se puede asumir calidad multilingüe sin evaluación.
- Memoria del contexto: el contexto de 262.144 tokens por petición implica un consumo de memoria elevado; con `--pool_backing=fixed` la reserva se compromete por adelantado y puede agotar la VRAM disponible si se configura mal.
- Riesgo de alucinación y sesgos: no documentados para el modelo base en la información disponible; deben evaluarse antes de uso en producción.
- Licencia: el paquete declara MIT, pero conviene verificar la licencia y condiciones del modelo base `weareapexcreators/Spark-X2.6-4B-LocalAI` antes de uso comercial.
- Madurez: creado y actualizado el 2026-11-26, con 0 descargas y 0 likes; es un artefacto reciente y sin validación comunitaria.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/weareapexcreators-Spark-X2.6-4B-LocalAI-loom
- Modelo base: https://huggingface.co/weareapexcreators/Spark-X2.6-4B-LocalAI
- Runtime Loom (hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
