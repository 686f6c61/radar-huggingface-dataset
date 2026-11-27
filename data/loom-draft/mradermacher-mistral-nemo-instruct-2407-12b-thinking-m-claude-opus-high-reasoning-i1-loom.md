# loom-draft/mradermacher-Mistral-Nemo-Instruct-2407-12B-Thinking-M-Claude-Opus-High-Reasoning-i1-loom

## Resumen

`loom-draft/mradermacher-Mistral-Nemo-Instruct-2407-12B-Thinking-M-Claude-Opus-High-Reasoning-i1-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir de un checkpoint GGUF ya existente, no un modelo entrenado desde cero. El checkpoint de origen es `mradermacher/Mistral-Nemo-Instruct-2407-12B-Thinking-M-Claude-Opus-High-Reasoning-i1-GGUF`, una cuantizacion Q4_K_M de un fine-tuning sobre Mistral-Nemo-Instruct-2407 de 12B orientado a razonamiento con estilo de traza larga. El paquete lo publica el usuario `loom-draft` y esta pensado para ejecutarse con el runtime Loom sobre GPUs AMD.

El problema que resuelve es la portabilidad: convierte un GGUF estandar en artefactos ejecutables especificos para el AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB), con un servidor compatible con la API de chat de OpenAI. La generacion se hizo con `loom-next`, el generador de kernels, sin intervencion de un LLM en el bucle. Es relevante ahora por el interes creciente en acelerar inferencia de LLMs sobre hardware AMD consumer y de estacion de trabajo, un nicho donde el soporte de software sigue siendo fragmentario.

El modelo subyacente es un transformer denso de 12B derivado de Mistral-Nemo, con ventana de contexto configurada en 262.144 tokens por peticion y hasta 4 peticiones concurrentes. La licencia declarada es MIT. No hay datos publicados de benchmarks ni mediciones de rendimiento para este paquete concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Mistral-Nemo-Instruct-2407); empaquetado Loom para runtime propio |
| Parametros totales | 12B (segun el nombre del checkpoint de origen) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico incluido en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (checkpoint de origen) empaquetado como artefactos `.loom` + `model.json` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` |
| Tool calling | no soportado (marcado "not applicable") |
| Modo razonamiento / thinking | no soportado en el runtime (marcado "not applicable") |
| Decodificacion especulativa | no soportada (marcada "not applicable") |
| Entrada de imagen | indeterminada |
| Entrada/salida de audio | indeterminada |
| Muestreo (temperature, top_k, seed) | indeterminado |

## Arquitectura y entrenamiento

El paquete no aporta informacion sobre el entrenamiento del modelo subyacente: la model card describe unicamente el proceso de empaquetado. Por el nombre del checkpoint de origen se deduce que parte de Mistral-Nemo-Instruct-2407 (12B, transformer denso) y que se le aplico un fine-tuning orientado a razonamiento ("Thinking", "Claude-Opus-High-Reasoning"), pero no se especifican tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO. Tampoco se documenta ninguna innovacion arquitectonica propia mas alla de la del modelo base.

La contribucion tecnica real de este repositorio es el empaquetado: `loom-next` genera kernels y programas `.loom` a partir del GGUF sin modificarlo, junto con una tarjeta `model.json` que describe el preset de ejecucion (pool de memoria fijo, precarga de parametros, espera activa de finalizacion en GPU). El paquete incluye dos presets, `chat` para Strix Halo y `chat-r9700` para la R9700. La model card lista compuertas de correccion (tests de kernels, comparacion golden contra llama.cpp, consistencia bajo concurrencia, agente multi-turno, muestreo, lectura de logits), pero todas aparecen como "not yet re-measured" en ambas GPUs, de modo que no hay verificacion publicada de equivalencia funcional con llama.cpp.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Razonamiento de traza larga heredado del fine-tuning de origen; el runtime Loom no expone un modo thinking controlable (marcado "not applicable").
- Contexto muy amplio: hasta 262.144 tokens por peticion, adecuado para documentos largos.
- Concurrencia de 4 peticiones simultaneas por instancia.
- Salida limitada a 4.096 tokens por respuesta (preset `max_tokens`).
- Tool calling / function calling: no soportado en este paquete.
- Agentes y razonamiento multi-paso con herramientas: no soportado por el runtime.
- Decodificacion especulativa: no soportada.
- Capacidades multilingues: no documentadas.
- Vision y audio: estado indeterminado ("not determined").

## Casos de uso

- Procesamiento de documentos largos en local: con 262.144 tokens de contexto, el modelo puede ingerir contratos, informes o bases de codigo extensas en una sola peticion sobre una GPU AMD de estacion de trabajo, sin depender de servicios en la nube.
- Asistente conversacional autoalojado: el servidor expone `/v1/chat/completions` con formato OpenAI, por lo que se puede conectar a clientes existentes (interfaces de chat, SDKs) apuntando a `127.0.0.1:8080` y manteniendo los datos en la maquina.
- Evaluacion de hardware AMD: sirve como banco de pruebas para medir como rinde un 12B en Q4_K_M sobre Strix Halo o R9700 con el runtime Loom, comparando con llama.cpp una vez se publiquen las mediciones pendientes.
- Resumen y extraccion de informacion en pipelines internos: hasta 4 peticiones concurrentes permiten procesar lotes pequenos de documentos en paralelo con una sola instancia.
- Prototipado de razonamiento paso a paso: el fine-tuning de origen esta orientado a trazas de razonamiento, util para generar explicaciones detalladas en tareas analiticas, aunque el runtime no permita activar o desactivar el modo thinking.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia MIT facilita integrar el paquete en productos internos o comerciales sin las restricciones de otras licencias de modelos abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para este paquete "are not yet re-measured" tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201), y que todas las compuertas de correccion estan pendientes de re-medicion.

## Requisitos de hardware

- VRAM estimada: un 12B en Q4_K_M ocupa del orden de 7-8 GB de pesos; el pool de memoria del preset se reserva de forma fija (`--pool_backing=fixed`), por lo que la huella real depende de la configuracion del preset y del contexto solicitado (hasta 262.144 tokens, lo que incrementa mucho el uso de KV cache).
- GPUs objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta soporte para GPUs consumer AMD o NVIDIA; el paquete esta generado solo para los dos destinos AMD citados.
- Despliegue: runtime Loom (`hrx-loom[hf]==0.2.0`), con `loom-fetch` para materializar el paquete y `loom-serve` para servir la API. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI para estos artefactos.
- Ajustes de ejecucion documentados: `completion_spin_ns=4294967295` (espera activa en GPU, consume CPU), `--pool_backing=fixed` y `--parameter_mode=preload`.
- Latencia y throughput: no disponibles; las mediciones estan pendientes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Este paquete (Loom, Q4_K_M) | 12B | 262.144 | `.loom` + runtime Loom, solo AMD gfx1151/gfx1201 | MIT | Sin benchmarks ni verificacion publicada; sin tool calling ni thinking controlable |
| Checkpoint de origen `mradermacher/...-i1-GGUF` | 12B | no disponible en la informacion | GGUF, ejecutable con llama.cpp y derivados | MIT (heredada) | Base sin empaquetar; permite usar llama.cpp en multiples plataformas |
| Mistral-Nemo-Instruct-2407 (modelo base) | 12B | 128.000 (segun el modelo base, no verificado en esta informacion) | safetensors, GGUF | Apache 2.0 (modelo base) | Modelo original de Mistral AI y NVIDIA; el fine-tuning y el empaquetado anaden capas no verificadas |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de verificacion de correccion: todas las compuertas (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`, `sampling`, `logits`) figuran como pendientes de re-medicion.
- El fine-tuning de origen no esta documentado: se desconoce el dataset, el proceso y los sesgos introducidos por el entrenamiento orientado a "Claude-Opus-High-Reasoning".
- Riesgo de alucinacion inherente a un modelo de 12B, agravado por la falta de evaluacion publicada de este paquete concreto.
- Sin soporte de tool calling ni de control del modo razonamiento en el runtime, a pesar del nombre del checkpoint.
- Salida limitada a 4.096 tokens, lo que puede truncar razonamientos largos.
- Solo 4 peticiones concurrentes por instancia; no apto para cargas de alta concurrencia sin escalado horizontal.
- Compatibilidad restringida a dos GPUs AMD concretas; no hay soporte documentado para NVIDIA ni para GPUs consumer.
- Idiomas soportados no documentados; el comportamiento multilingue no esta verificado.
- La licencia MIT se declara en el paquete, pero conviene verificar la cadena de licencias del checkpoint de origen y del modelo base antes de un uso comercial.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en produccion por terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/mradermacher-Mistral-Nemo-Instruct-2407-12B-Thinking-M-Claude-Opus-High-Reasoning-i1-loom
- Checkpoint GGUF de origen: https://huggingface.co/mradermacher/Mistral-Nemo-Instruct-2407-12B-Thinking-M-Claude-Opus-High-Reasoning-i1-GGUF
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
