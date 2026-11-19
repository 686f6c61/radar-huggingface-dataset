# loom-draft/bartowski-Fara1.5-9B-loom

## Resumen

Fara1.5-9B-loom es un paquete de despliegue en formato Loom para el checkpoint GGUF `Fara1.5-9B-Q4_K_M.gguf` de bartowski, derivado del modelo base Fara1.5-9B. El paquete lo publica el usuario `loom-draft` y contiene programas `.loom` generados con la herramienta `loom-next`, junto con un `model.json` que actúa como tarjeta de modelo y fija los ficheros fuente con verificación sha256. No se trata de un modelo nuevo ni de un fine-tune: los pesos son los del GGUF original, sin modificar.

El objetivo del paquete es permitir la ejecución del modelo en GPUs AMD concretas mediante el runtime `hrx-loom` (versión 0.2.0), con soporte explícito para el AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El modelo es multimodal (entrada de imagen y texto) y expone una API compatible con OpenAI a través de `loom-serve`, incluyendo tool calling y modo de razonamiento activado por defecto.

La relevancia actual del paquete es acotada: se publicó el 19 de noviembre de 2026, no tiene descargas ni likes, y el propio autor indica que las mediciones de rendimiento y las puertas de corrección todavía no se han vuelto a medir para esta versión. La información disponible sobre el modelo subyacente (Fara1.5-9B) es escasa en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Fara1.5-9B; el paquete no detalla la arquitectura interna) |
| Parametros totales | 9B (según el nombre del checkpoint) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (checkpoint `Fara1.5-9B-Q4_K_M.gguf`); proyector multimodal `mmproj-Fara1.5-9B-bf16.gguf` en bf16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF empaquetado en formato Loom (`.loom` + `model.json`) |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones concurrentes |
| Dispositivos soportados | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |
| API | OpenAI-style `/v1/chat/completions` |

## Arquitectura y entrenamiento

La información proporcionada no describe la arquitectura interna del modelo Fara1.5-9B: no se detalla si es un transformer denso, MoE o híbrido, ni el número de tokens de entrenamiento, la composición del dataset o si hubo fases de RLHF o DPO. Lo único confirmable es que el paquete Loom envuelve el checkpoint GGUF cuantizado a Q4_K_M publicado por bartowski, sin modificarlo.

La innovación técnica del paquete no está en el modelo sino en el runtime: `loom-next` genera programas `.loom` y kernels específicos para las GPUs AMD objetivo, y `loom-serve` los ejecuta con una API compatible con OpenAI. El paquete incluye un proyector multimodal separado (`mmproj-Fara1.5-9B-bf16.gguf`) para la entrada de imágenes y una plantilla de chat que permite activar o desactivar el modo de razonamiento mediante `chat_template_kwargs: {"enable_thinking": false}`. No se menciona decodificación especulativa (figura como "not applicable") ni otras optimizaciones de inferencia.

## Capacidades

- Generación de texto conversacional con plantilla de chat y API compatible con OpenAI.
- Entrada de imagen (image-text-to-text) mediante partes `image_url` al estilo OpenAI, usando el proyector `mmproj-Fara1.5-9B-bf16.gguf`.
- Tool calling al estilo OpenAI: acepta `tools` y devuelve `tool_calls`.
- Modo de razonamiento (thinking) activado por defecto, desactivable por petición con `enable_thinking: false`.
- Soporte de contexto largo: hasta 262.144 tokens por petición.
- Concurrencia de hasta 4 peticiones simultáneas.
- Límite de 4.096 tokens de salida por petición (preset `max_tokens`).
- No soporta audio ni entrada/salida de voz.
- No aplica "reasoning effort" ni decodificación especulativa.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue local en hardware AMD Strix Halo: el paquete está pensado para ejecutarse en el Ryzen AI Max+ 395 mediante `loom-serve`, lo que permite montar un servidor de inferencia local con API OpenAI sin depender de CUDA.
- Servicio de inferencia en Radeon AI PRO R9700: con 32 GB de VRAM, el paquete puede servir el checkpoint Q4_K_M y el proyector bf16 en una GPU de estación de trabajo AMD, útil para entornos con hardware ROCm.
- Asistente multimodal con imágenes: al aceptar `image_url`, se puede usar para responder preguntas sobre capturas, diagramas o documentos escaneados en flujos internos.
- Automatización con tool calling: la API acepta `tools` y devuelve `tool_calls`, lo que permite integrarlo en agentes que consulten APIs internas o bases de datos.
- Procesamiento de documentos largos: con 262.144 tokens de contexto, es adecuado para resumir o extraer información de contratos, informes o expedientes extensos en una sola petición.
- Razonamiento con traza explícita: el modo thinking por defecto permite obtener cadenas de razonamiento para tareas de análisis, desactivable cuando se prioriza latencia o formato de salida limpio.
- Evaluación comparativa frente a llama.cpp: el paquete incluye puertas de corrección (`golden`, `compare`, `vision`, `agent`) diseñadas para contrastar la salida con la referencia de llama.cpp sobre el mismo GGUF, útil para validar el runtime antes de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las mediciones de rendimiento para Strix Halo y para Radeon AI PRO R9700 "no se han vuelto a medir" para este paquete, y que todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPUs.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el checkpoint es Q4_K_M de un modelo de 9B, y el proyector multimodal es bf16. La Radeon AI PRO R9700 objetivo tiene 32 GB.
- GPU soportadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPUs NVIDIA (A100, H100, RTX 4090): no soportadas por este paquete, que está generado para el runtime AMD Loom.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` para materializar el paquete y `loom-serve` para servir la API. Opciones recomendadas en la model card: `--pool_backing=fixed`, `--parameter_mode=preload` y `completion_spin_ns=4294967295` en el dispositivo.
- Latencia y throughput: no disponibles; las filas de rendimiento de la model card están pendientes de remedición.
- Alternativa de despliegue: al tratarse de un GGUF estándar envuelto, el checkpoint original `bartowski/Fara1.5-9B-GGUF` puede usarse con llama.cpp, pero este paquete concreto no documenta esa ruta.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento del modelo base Fara1.5-9B ni de alternativas comparables, y el paquete Loom no publica métricas que permitan una comparación cuantitativa.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Fara1.5-9B-loom (este paquete) | 9B | 262.144 | MIT | GGUF + Loom | Solo GPUs AMD gfx1151/gfx1201; sin benchmarks publicados |
| Fara1.5-9B-GGUF (bartowski) | 9B | no disponible | no disponible | GGUF | Checkpoint de origen, sin empaquetar para Loom |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | Sin datos en la información proporcionada |

## Limitaciones y advertencias

- Paquete sin validación publicada: todas las puertas de corrección y las mediciones de rendimiento figuran como no remedidas, por lo que no hay evidencia publicada de que la salida coincida con la referencia de llama.cpp.
- Repositorio vacío en la práctica: 0 descargas, 0 likes y tamaño de repo de 0,0 GB, lo que sugiere que los artefactos pueden no estar materializados o que el paquete es un borrador.
- Alcance de hardware muy restringido: solo Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no hay soporte declarado para NVIDIA ni para otras GPUs AMD.
- Metadatos incompletos: idiomas no disponibles, arquitectura no detallada y procedencia del modelo base (Fara1.5-9B) sin documentar en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la documentación; aplicable el riesgo habitual de los modelos generativos de 9B.
- Sesgos: no documentados.
- Límite de salida de 4.096 tokens: puede ser insuficiente para tareas de generación larga pese al contexto de 262.144 tokens.
- Licencia MIT declarada en el paquete, pero la licencia del modelo base Fara1.5-9B no se detalla en la información disponible; conviene verificarla antes de uso comercial.
- Dependencia de una versión concreta del runtime (`hrx-loom==0.2.0`) y de la herramienta `loom-next` para regenerar los programas.

## Enlaces

- Hugging Face: https://huggingface.co/loom-draft/bartowski-Fara1.5-9B-loom
- Modelo base (GGUF): https://huggingface.co/bartowski/Fara1.5-9B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
