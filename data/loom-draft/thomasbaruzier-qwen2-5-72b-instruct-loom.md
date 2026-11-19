# loom-draft/ThomasBaruzier-Qwen2.5-72B-Instruct-loom

## Resumen

`loom-draft/ThomasBaruzier-Qwen2.5-72B-Instruct-loom` no es un modelo entrenado desde cero, sino un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `ThomasBaruzier/Qwen2.5-72B-Instruct-GGUF`, concretamente la cuantizacion `Qwen2.5-72B-Instruct-Q4_K_M.gguf`. El paquete lo publica el usuario `loom-draft` y esta orientado a GPUs AMD: el APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la tarjeta Radeon AI PRO R9700 (gfx1201, 32 GB). La generacion se ha hecho con la herramienta `loom-next`, que produce los kernels y programas de inferencia especificos para el hardware sin intervencion de un LLM en el bucle.

El modelo subyacente es Qwen2.5-72B-Instruct, un transformer denso de 72.000 millones de parametros desarrollado por Alibaba Qwen, con una ventana de contexto nativa de 131.072 tokens. En este paquete, sin embargo, el preset limita el contexto a 32.768 tokens por peticion, admite 4 peticiones concurrentes y un maximo de 4.096 tokens de salida. El interes practico de esta ficha esta en el empaquetado: permite servir un modelo de 72B en cuantizacion Q4_K_M sobre hardware AMD consumer y profesional mediante una API compatible con OpenAI, sin depender de CUDA.

La relevancia es doble. Por un lado, demuestra la viabilidad de ejecutar modelos de gran tamano en GPUs Radeon y APUs Strix Halo mediante el stack Loom/IREE sobre ROCm. Por otro, la model card es transparente sobre su estado: las mediciones de rendimiento y las puertas de correccion (`kernel_tests`, `golden`, `compare`, `agent`, etc.) aparecen como "not yet re-measured", es decir, el paquete esta publicado pero sin evidencia de validacion registrada en el momento de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5-72B-Instruct), empaquetado como programas Loom para AMD |
| Parametros totales | 72.000 millones (modelo base Qwen2.5-72B-Instruct) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens por peticion en este preset (contexto nativo del modelo base: 131.072) |
| Tipos de cuantizacion | Q4_K_M (GGUF) en este paquete |
| Idiomas soportados | no disponible en la informacion proporcionada (el modelo base Qwen2.5 es multilingue, pero la ficha no lo detalla) |
| Licencia | other (heredada del paquete Loom; el modelo base Qwen2.5-72B-Instruct usa licencia Qwen propia, no verificada aqui) |
| Formato de pesos | GGUF (`Qwen2.5-72B-Instruct-Q4_K_M.gguf`) empaquetado como `program/*.loom` y `weights.loom` |
| Maximo de tokens de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Herramienta de generacion | loom-next (generador, sin LLM en el bucle) |
| Version del runtime | `hrx-loom[hf]==0.2.0` |

## Arquitectura y entrenamiento

El modelo subyacente, Qwen2.5-72B-Instruct, es un transformer denso decoder-only de 72.000 millones de parametros con atencion de causal estandar y sesgo QKV, entrenado por Alibaba Qwen. No se dispone en la informacion proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las fases de alineacion (SFT, RLHF, DPO) del modelo base; esos datos corresponden a la model card original de Qwen2.5, que no se ha incluido en esta busqueda.

Lo que si documenta esta ficha es el empaquetado Loom. `loom-next` genera kernels y programas especificos para el hardware AMD objetivo a partir del GGUF, y el paquete resultante se ejecuta sobre IREE con el backend ROCm. La model card menciona opciones de runtime relevantes: `completion_spin_ns=4294967295` para espera activa de finalizaciones de GPU, `--pool_backing=fixed` para reservar el pool de memoria por adelantado y `--parameter_mode=preload` (solo en R9700) para precargar pesos en el host. No hay innovaciones de decodificacion especulativa ni modos de razonamiento: la tabla de features marca estas casillas como "not applicable".

## Capacidades

- Generacion de texto conversacional y de instrucciones, heredada del modelo base Qwen2.5-72B-Instruct, servida via API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling / function calling en estilo OpenAI: el paquete acepta el campo `tools` y devuelve `tool_calls`.
- Soporte de agentes multi-turno con reutilizacion de historial, segun la puerta `agent` descrita en la model card (aunque sin medicion registrada).
- Contexto de 32.768 tokens por peticion, suficiente para documentos largos y conversaciones extensas.
- Concurrencia de 4 peticiones simultaneas con la puerta `consistency` definida para verificar que la salida concurrente coincide con la secuencial.
- Sin modo de razonamiento o thinking: la tabla de features lo marca como "not applicable".
- Sin entrada de imagen ni audio: marcado como "not applicable".
- Sin decodificacion especulativa: marcado como "not applicable".
- Muestreo (sampling): estado "not determined" en la model card.

## Casos de uso

- Asistente conversacional self-hosted sobre hardware AMD: desplegar el paquete con `loom-serve` en un Ryzen AI Max+ 395 o una Radeon AI PRO R9700 y exponer un endpoint compatible con OpenAI para integrarlo en aplicaciones existentes sin reescribir clientes.
- Automatizacion de agentes con tool calling: usar el soporte de `tools` y `tool_calls` para construir flujos multi-paso que consulten APIs externas, bases de datos o servicios internos, con historial de conversacion reutilizado entre turnos.
- Procesamiento de documentos de hasta 32k tokens: resumen, extraccion de entidades y Q&A sobre contratos, informes o documentacion tecnica en una sola peticion, aprovechando el contexto del preset.
- Sustitucion de APIs en la nube en entornos con requisitos de soberania del dato: al ejecutarse en hardware local AMD, permite mantener las conversaciones dentro de la infraestructura propia, sin enviar prompts a terceros.
- Evaluacion y prototipado de modelos de 72B en estaciones de trabajo AMD: el paquete permite medir latencia y calidad en hardware Radeon antes de comprometerse con un despliegue mayor, aunque las mediciones de rendimiento del paquete aun no esten registradas.
- Backend de chat para herramientas internas de desarrollo: con 4 peticiones concurrentes y 4.096 tokens de salida, sirve para asistentes de documentacion, generacion de resumenes de commits o ayuda contextual en IDE para equipos pequenos.
- Banco de pruebas de portabilidad: comparar la salida del paquete Loom contra la referencia de llama.cpp sobre el mismo GGUF usando las puertas `golden` y `compare`, una vez registradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para este paquete "are not yet re-measured" tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201). Tampoco hay datos de MMLU, HumanEval, GSM8K ni de latencia/throughput registrados para este empaquetado concreto.

## Requisitos de hardware

- VRAM estimada: el GGUF Q4_K_M de un modelo de 72B ocupa aproximadamente 40-45 GB en disco y en memoria; la R9700 tiene 32 GB, por lo que el preset debe apoyarse en `--parameter_mode=preload` y en el pool de memoria fijado, sin que la informacion proporcione el desglose exacto de residencia en VRAM frente a memoria del host.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se mencionan GPUs NVIDIA ni otras Radeon.
- Cabe en GPU consumer: si, en el sentido de APUs y GPUs AMD consumer/profesional soportadas por el paquete; no hay datos para RTX 4090 u otras consumer NVIDIA en esta informacion.
- Despliegue: `hrx-loom[hf]==0.2.0` con `loom-fetch` y `loom-serve`; runtime IREE sobre ROCm. En hosts con memlock de 8 MiB hay que lanzar `loom-serve` bajo `systemd-run` con `SystemCallFilter=~io_uring_setup` o subir `ulimit -l`.
- Latencia y throughput: no disponibles; la model card remite a mediciones aun no realizadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este paquete (Qwen2.5-72B-Instruct Q4_K_M, Loom) | 72B denso | 32.768 en preset | Q4_K_M | other | Paquete Loom para AMD Strix Halo y R9700 |
| Qwen2.5-72B-Instruct (GGUF original, llama.cpp) | 72B denso | hasta 131.072 nativo | multiples GGUF | Qwen (no verificada aqui) | Amplia, via llama.cpp/Ollama |
| Qwen2.5-72B-Instruct (pesos originales) | 72B denso | 131.072 | safetensors | Qwen (no verificada aqui) | Hugging Face, vLLM/TGI |
| Modelos de ~70B comparables (p. ej. Llama 3.3 70B) | 70B denso | 128k | multiples | Llama | no disponible en esta busqueda |

La diferencia clave de este paquete frente a las alternativas no es el modelo, sino el runtime: ofrece un camino de despliegue nativo para GPUs AMD via Loom/IREE, a costa de un contexto reducido (32k frente a 131k) y de un ecosistema mucho mas joven que llama.cpp o vLLM.

## Limitaciones y advertencias

- Paquete sin validacion registrada: todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `agent`, `sampling`, `logits`, `decision`, etc.) aparecen como "not yet re-measured"; no hay evidencia publicada de que la salida coincida con la referencia de llama.cpp.
- Rendimiento sin medir: no hay datos de latencia ni throughput para ninguna de las dos GPUs objetivo.
- Contexto recortado: el preset limita a 32.768 tokens frente a los 131.072 nativos del modelo base; planificar prompts y documentos en consecuencia.
- Concurrencia baja: 4 peticiones simultaneas y 4.096 tokens de salida maximos pueden ser insuficientes para cargas de produccion medias o altas.
- Licencia "other": no se detalla en la informacion proporcionada; hay que verificar los terminos del paquete Loom y, por separado, la licencia Qwen del modelo base antes de uso comercial.
- Idiomas no declarados: la ficha del paquete no especifica el conjunto de idiomas soportados; el comportamiento multilingue depende del modelo base y no esta verificado aqui.
- Dependencia de hardware AMD concreto: el paquete esta generado para gfx1151 y gfx1201; no es portable a otras GPUs sin regeneracion.
- Requisito de configuracion del host: en hosts con memlock bajo hay que usar `systemd-run` o subir `ulimit -l`, lo que anade complejidad operativa.
- Riesgo de alucinacion y sesgos: no documentados especificamente para este empaquetado; aplican los del modelo base Qwen2.5-72B-Instruct, no evaluados en esta informacion.
- Estado de publicacion: 0 descargas y 0 likes en el momento de la ficha, creado y actualizado el 2026-11-19; tratar como artefacto experimental.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/ThomasBaruzier-Qwen2.5-72B-Instruct-loom
- Modelo base GGUF: https://huggingface.co/ThomasBaruzier/Qwen2.5-72B-Instruct-GGUF
- Repositorio Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
