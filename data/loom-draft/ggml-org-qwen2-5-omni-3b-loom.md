# loom-draft/ggml-org-Qwen2.5-Omni-3B-loom

## Resumen

`loom-draft/ggml-org-Qwen2.5-Omni-3B-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) para el checkpoint GGUF sin modificar `ggml-org/Qwen2.5-Omni-3B-GGUF`, en su cuantizacion Q4_K_M. No es un modelo nuevo ni un fine-tuning: es un artefacto de empaquetado generado con la herramienta `loom-next` (sin LLM en el bucle) que traduce los pesos del GGUF original a programas ejecutables por el runtime Loom sobre GPUs AMD.

El objetivo es servir Qwen2.5-Omni-3B en hardware AMD concretamente soportado: el APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete expone una API compatible con OpenAI (`/v1/chat/completions`) mediante `loom-serve`, con un contexto de 32.768 tokens por peticion y 4 peticiones concurrentes.

La relevancia es acotada pero clara: permite ejecutar un modelo multimodal de 3B en GPUs AMD de consumo y profesional sin pasar por llama.cpp, con verificacion criptografica de los ficheros fuente (sha256) y un conjunto de puertas de correctitud definidas. En el momento de la publicacion (19 de noviembre de 2026) el repositorio no registra descargas ni likes, y las mediciones de rendimiento y correctitud figuran como "not yet re-measured".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la de Qwen2.5-Omni-3B; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 3B (segun el nombre del checkpoint base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens por peticion (preset de Loom) |
| Tipos de cuantizacion | Q4_K_M (unico peso empaquetado) |
| Idiomas soportados | no disponible |
| Licencia | other (la del paquete Loom; la del checkpoint Qwen2.5-Omni subyacente no se detalla en la informacion proporcionada) |
| Formato de pesos | Loom (`.loom` + `weights.loom`) generado a partir de GGUF Q4_K_M; incluye `tokenizer.json` y `llm_config.json` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento

El paquete no entrena nada: reproduce el checkpoint Qwen2.5-Omni-3B en Q4_K_M y lo traduce a programas Loom generados por `loom-next`, que compila los kernels necesarios para el backend AMD objetivo. La arquitectura subyacente es la del modelo Qwen2.5-Omni de 3B (transformer multimodal con entrada de imagen y audio en su version upstream), pero la informacion proporcionada no detalla la composicion del dataset de entrenamiento, el numero de tokens vistos ni si hubo fases de RLHF o DPO.

La innovacion tecnica del artefacto esta en el pipeline de despliegue, no en el modelo: generacion automatica de kernels especificos para gfx1151 y gfx1201, verificacion sha256 de los ficheros fuente en `loom-fetch`, pool de memoria de respaldo fijo (`--pool_backing=fixed`), precarga de parametros en host (`--parameter_mode=preload`) y espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`). El paquete incorpora ademas un conjunto de puertas de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) definidas contra la referencia de llama.cpp sobre el mismo GGUF.

## Capacidades

- Generacion de texto conversacional multi-turno mediante API compatible con OpenAI (`/v1/chat/completions`).
- Contexto de 32.768 tokens por peticion, adecuado para documentos largos y conversaciones extensas.
- Hasta 4 peticiones concurrentes con consistencia verificable (puerta `consistency`).
- Salida de hasta 4.096 tokens por respuesta.
- Tool calling: no aplicable en este paquete (marcado como "—" en la tabla de caracteristicas).
- Razonamiento / thinking mode: no aplicable en este paquete.
- Decodificacion especulativa: no aplicable en este paquete.
- Entrada de imagen: no soportada por Loom, aunque el modelo upstream si la tiene.
- Entrada y salida de audio: no soportadas por Loom, aunque el modelo upstream las tiene.
- Muestreo (temperature, top_k, seed): estado "not determined"; existe una puerta `sampling` definida pero sin medicion registrada.

## Casos de uso

- Asistente conversacional autoalojado en estaciones de trabajo AMD: con `loom-serve` levantando un endpoint compatible con OpenAI en `127.0.0.1:8080`, se puede conectar cualquier cliente que hable el protocolo de chat completions sin adaptadores adicionales.
- Procesamiento de documentos largos en local: los 32.768 tokens de contexto permiten resumir contratos, informes o transcripciones extensas sin trocear en exceso, manteniendo los datos en la maquina.
- Despliegue en equipos con Ryzen AI Max+ 395: el paquete esta generado especificamente para gfx1151, lo que permite servir el modelo en un APU sin GPU discreta.
- Servicio en Radeon AI PRO R9700: con 32 GB de VRAM, el modelo Q4_K_M de 3B deja margen amplio para el pool de memoria y la concurrencia de 4 peticiones, util para prototipos y entornos de desarrollo internos.
- Evaluacion comparativa de runtimes: las puertas de correctitud (`golden`, `compare`, `logits`) estan disenadas para contrastar token a token la salida de Loom contra llama.cpp sobre el mismo GGUF, lo que sirve para validar el backend antes de migrar cargas de trabajo.
- Integracion en pipelines de CI que requieran verificacion de integridad: `loom-fetch` comprueba el sha256 de los ficheros fuente fijados en `model.json.lock`, lo que permite auditar que los pesos servidos son exactamente los esperados.
- Chat de bajo coste en hardware de escritorio: al ser un modelo de 3B en Q4_K_M, el consumo de memoria es reducido y puede convivir con otras cargas en la misma GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de correctitud figuran como "not yet re-measured", por lo que no hay evidencia registrada de ninguna de ellas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es de 3B en Q4_K_M y el paquete esta pensado para ejecutarse en la Radeon AI PRO R9700 (32 GB) y en el APU Strix Halo con memoria unificada.
- GPUs soportadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se mencionan otras GPU AMD ni NVIDIA.
- GPU de consumo: el paquete esta orientado a un APU de gama alta y a una GPU profesional; no se documenta compatibilidad con Radeon RX de consumo ni con GPUs NVIDIA.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch huggingface:loom-draft/ggml-org-Qwen2.5-Omni-3B-loom:chat --materialize=copy --output=qwen2.5-omni-3b` y `loom-serve --model=qwen2.5-omni-3b '--device=amdgpu://?completion_spin_ns=4294967295' --pool_backing=fixed --parameter_mode=preload`. Alternativas como vLLM, llama.cpp, Ollama o TGI no se documentan para este paquete.
- Latencia y throughput: no disponibles; las filas de rendimiento de la model card estan pendientes de re-medicion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Hardware | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|---|
| loom-draft/ggml-org-Qwen2.5-Omni-3B-loom | 3B | 32.768 | Loom (desde GGUF Q4_K_M) | AMD gfx1151 / gfx1201 | other | no disponible (pendiente de re-medicion) |
| ggml-org/Qwen2.5-Omni-3B-GGUF (base) | 3B | no disponible en la informacion proporcionada | GGUF | Multiples backends (llama.cpp) | no disponible | no disponible |
| Qwen2.5-Omni-3B (upstream) | 3B | no disponible en la informacion proporcionada | safetensors y otros | GPU genericas | no disponible | no disponible |

La comparacion con alternativas fuera de la familia Qwen2.5-Omni no esta disponible en la informacion proporcionada. La diferencia funcional relevante frente al GGUF base es el empaquetado para el runtime Loom y la perdida de las entradas de imagen y audio, que el modelo upstream si soporta.

## Limitaciones y advertencias

- El paquete no soporta entrada de imagen ni de audio, aunque el modelo upstream Qwen2.5-Omni si las tiene; se pierde la multimodalidad al usar Loom.
- Tool calling, thinking mode y decodificacion especulativa figuran como "not applicable" en este paquete.
- No hay mediciones de rendimiento ni de correctitud registradas: todas las puertas y las comparativas frente a llama.cpp estan "not yet re-measured", por lo que no existe evidencia publicada de que la salida coincida con la referencia.
- El estado de muestreo (temperature, top_k, seed) figura como "not determined".
- Licencia "other": no se detalla en la informacion proporcionada que permisos concede ni si el uso comercial esta autorizado; hay que consultar los terminos del paquete y los del checkpoint Qwen2.5-Omni subyacente antes de produccion.
- Compatibilidad de hardware muy restringida: solo se documentan gfx1151 y gfx1201; no hay soporte declarado para otras GPU AMD ni para NVIDIA.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; es un modelo de 3B, con la capacidad de razonamiento que ello implica.
- Sesgos: no documentados en la informacion proporcionada.
- Idiomas soportados: no disponibles; no se puede confirmar el comportamiento multilingue en este empaquetado.
- Repositorio sin descargas ni likes y creado y actualizado el mismo dia, sin historial de uso que permita inferir estabilidad.
- La espera activa de GPU (`completion_spin_ns=4294967295`) consume CPU mientras hay trabajo en vuelo, lo que puede afectar a la latencia de otras cargas en el mismo equipo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/ggml-org-Qwen2.5-Omni-3B-loom
- Checkpoint base en Hugging Face: https://huggingface.co/ggml-org/Qwen2.5-Omni-3B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador `loom-next`: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
