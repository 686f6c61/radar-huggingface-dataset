# loom-draft/ggml-org-Qwen2-VL-2B-Instruct-loom

## Resumen

Loom Qwen2-VL-2B-Instruct es un paquete de despliegue en formato `.loom` para el checkpoint GGUF `Qwen2-VL-2B-Instruct-Q4_K_M.gguf`, publicado por el usuario `loom-draft` y generado con la herramienta `loom-next`. No se trata de un modelo nuevo ni de un fine-tune: los pesos son los del checkpoint original de Qwen2-VL-2B-Instruct distribuido por `ggml-org`, empaquetados junto con programas `*.loom` generados y una tarjeta `model.json` para el runtime `loom-serve` de HRX-Loom sobre GPUs AMD.

El objetivo del paquete es permitir la inferencia del modelo multimodal Qwen2-VL-2B (arquitectura Qwen2-VL, aproximadamente 2.000 millones de parametros, ventana de contexto de 32.768 tokens) en hardware AMD concretamente soportado: el APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete expone una API compatible con OpenAI (`/v1/chat/completions`) a traves de `loom-serve`.

Su relevancia es limitada y muy especifica: sirve como artefacto de despliegue reproducible (con hashes sha256 fijados en `model.json.lock`) para validar el ecosistema Loom sobre hardware AMD, no como una alternativa generalista a otros runtimes. Cabe destacar que, segun la propia model card, la entrada de imagen no esta soportada por Loom aunque el modelo upstream si la tenga, y que las mediciones de rendimiento y las puertas de correccion (`gates.sh`) aparecen como "not yet re-measured" en ambas plataformas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2-VL (transformer multimodal con vision encoder y projector; heredada del checkpoint base Qwen2-VL-2B-Instruct) |
| Parametros totales | aproximadamente 2.000 millones (modelo base Qwen2-VL-2B-Instruct) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico incluido en el paquete) |
| Idiomas soportados | no disponible (la model card no los enumera) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Qwen2-VL-2B-Instruct-Q4_K_M.gguf`) empaquetado en programas `.loom` y `weights.loom` |
| Maximo de tokens de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | `/v1/chat/completions` estilo OpenAI |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |
| Fecha de creacion | 2026-11-19 |

## Arquitectura y entrenamiento

El paquete no introduce entrenamiento ni ajuste alguno: reutiliza el checkpoint `Qwen2-VL-2B-Instruct-Q4_K_M.gguf` de `ggml-org` sin modificaciones, segun declara la model card. Por tanto, la arquitectura subyacente es la de Qwen2-VL-2B-Instruct (transformer con encoder de vision y projector para entrada de imagenes), cuantizada a Q4_K_M mediante el pipeline de GGUF. No se aportan datos sobre tokens de entrenamiento, composicion del dataset ni fases de RLHF/DPO en la informacion disponible.

La innovacion tecnica del artefacto no esta en el modelo sino en el empaquetado: `loom-next` genera programas `*.loom` especificos para las arquitecturas AMD objetivo (gfx1151 y gfx1201), junto con `model.json` (tarjeta), `model.json.lock` (fuentes fijadas con verificacion sha256 por `loom-fetch`), `tokenizer.json`, `llm_config.json` e `info.json` (mediciones, evidencia de puertas y versiones). El servidor se lanza con opciones como `--pool_backing=fixed` (reserva del pool de memoria por adelantado), `--parameter_mode=preload` (carga de pesos en host) y `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU, consumiendo CPU mientras hay trabajo en vuelo).

## Capacidades

- Generacion de texto conversacional multi-turno mediante API compatible con OpenAI.
- Contexto de 32.768 tokens por peticion, adecuado para documentos largos de hasta ese tamano.
- Hasta 4 peticiones concurrentes con la configuracion del preset.
- Limite de 4.096 tokens de salida por peticion (preset `max_tokens`).
- Entrada de imagen: no soportada por Loom, aunque el modelo upstream Qwen2-VL-2B-Instruct si la tiene. La puerta de correccion `vision` figura como no re-medida.
- Tool calling: marcado como "not applicable" en la model card.
- Razonamiento / thinking mode: "not applicable".
- Esfuerzo de razonamiento (reasoning effort): "not applicable".
- Decodificacion especulativa: "not applicable".
- Entrada/salida de audio: "not applicable".
- Muestreo (temperature, top_k, seed): estado "not determined" en la tabla de caracteristicas; existe una puerta `sampling` definida pero sin evidencia registrada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Validacion del runtime Loom sobre AMD: desplegar el paquete con `loom-fetch` y `loom-serve` en Strix Halo o R9700 para comprobar que los kernels generados producen la salida esperada frente a la referencia de llama.cpp. Es el proposito declarado del artefacto.
- Chat conversacional de texto en local: servir `/v1/chat/completions` en `127.0.0.1:8080` y consumirlo desde clientes compatibles con la API de OpenAI, con contexto de 32.768 tokens por peticion.
- Procesamiento de documentos largos de solo texto: el contexto de 32k permite resumir o extraer informacion de documentos extensos en una sola peticion, dentro del limite de 4.096 tokens de salida.
- Pruebas de concurrencia ligera: el preset admite 4 peticiones simultaneas, util para evaluar el comportamiento del servidor bajo carga moderada y comprobar la puerta `consistency` (misma salida en concurrencia que en ejecucion aislada).
- Banco de pruebas de cuantizacion Q4_K_M: comparar la salida greedy y las top-5 log-probs frente a la referencia de llama.cpp registrada sobre el mismo GGUF, segun describe la puerta `golden`.
- Integracion en pipelines de evaluacion internos: al fijar versiones y hashes en `model.json.lock`, el paquete sirve como artefacto reproducible en CI para detectar regresiones del runtime entre versiones de `hrx-loom`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de rendimiento para este paquete "are not yet re-measured" tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201, 32 GB). Todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas plataformas.

| Puerta de correccion | Strix Halo (gfx1151) | Radeon AI PRO R9700 (gfx1201) |
|---|---|---|
| `kernel_tests` | no re-medida | no re-medida |
| `golden` | no re-medida | no re-medida |
| `compare` | no re-medida | no re-medida |
| `vision` | no re-medida | no re-medida |
| `consistency` | no re-medida | no re-medida |
| `spec` | no re-medida | no re-medida |
| `agent` | no re-medida | no re-medida |
| `agent_think_off` | no re-medida | no re-medida |
| `sampling` | no re-medida | no re-medida |
| `logits` | no re-medida | no re-medida |
| `decision` | no re-medida | no re-medida |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita en la model card. El checkpoint es Q4_K_M de un modelo de aproximadamente 2.000 millones de parametros, por lo que la huella de pesos es reducida, pero no se publica una cifra oficial de VRAM del preset.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se mencionan otras GPU soportadas.
- GPU consumer: no disponible. El paquete esta generado para las dos plataformas AMD citadas; no se indica compatibilidad con GPUs de consumo ni con hardware NVIDIA.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch huggingface:loom-draft/ggml-org-Qwen2-VL-2B-Instruct-loom:chat --materialize=copy --output=qwen2-vl-2b-instruct` y `loom-serve --model=qwen2-vl-2b-instruct '--device=amdgpu://?completion_spin_ns=4294967295' --pool_backing=fixed --parameter_mode=preload`.
- Opciones de despliegue alternativas (vLLM, llama.cpp, Ollama, TGI): no documentadas para este paquete. El modelo base GGUF de `ggml-org` es en principio consumible por llama.cpp, pero la model card no lo detalla.
- Latencia y throughput: no disponibles; las mediciones de rendimiento no se han re-medido en ninguna de las dos plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrada de imagen | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| Loom Qwen2-VL-2B-Instruct (este paquete) | aproximadamente 2.000 millones | 32.768 tokens | no soportada por Loom (si en upstream) | Apache 2.0 | GGUF Q4_K_M empaquetado en `.loom`, `loom-serve` sobre AMD gfx1151 / gfx1201 |
| ggml-org/Qwen2-VL-2B-Instruct-GGUF (upstream) | aproximadamente 2.000 millones | no disponible en la informacion | si (modelo original) | Apache 2.0 | GGUF, consumible por runtimes GGUF (llama.cpp y derivados) |
| Qwen2-VL-2B-Instruct (checkpoint original) | aproximadamente 2.000 millones | no disponible en la informacion | si | Apache 2.0 | safetensors / transformers |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada; la comparativa se limita a parametros, contexto, capacidades declaradas, licencia y formato de despliegue.

## Limitaciones y advertencias

- El paquete no incorpora entrenamiento ni ajuste: cualquier sesgo o limitacion del checkpoint Qwen2-VL-2B-Instruct original se hereda sin cambios.
- La entrada de imagen no esta soportada por Loom pese a que el modelo upstream es multimodal; no debe asumirse capacidad de vision en este despliegue.
- Tool calling, thinking mode, reasoning effort, decodificacion especulativa y audio estan marcados como "not applicable" en la model card.
- El estado del muestreo (temperature, top_k, seed) figura como "not determined"; la puerta `sampling` no tiene evidencia registrada.
- Todas las puertas de correccion estan sin re-medir en ambas plataformas: no hay evidencia publicada de que la salida coincida con la referencia de llama.cpp.
- No hay mediciones de rendimiento ni de latencia/throughput para este paquete.
- Soporte de hardware restringido a AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201); no se declara compatibilidad con otras GPU.
- Licencia Apache 2.0 en el paquete y en el modelo base, lo que en principio permite uso comercial, pero debe verificarse en el repositorio upstream de Qwen2-VL cualquier termino adicional.
- El repositorio presenta 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (2026-11-19): se trata de un artefacto reciente y sin validacion de la comunidad.
- Los resultados de busqueda web disponibles corresponden a servicios homonimos (Loom la herramienta de grabacion de pantalla y Loom la marca de ropa) y no aportan informacion tecnica sobre este modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/ggml-org-Qwen2-VL-2B-Instruct-loom
- Checkpoint base GGUF: https://huggingface.co/ggml-org/Qwen2-VL-2B-Instruct-GGUF
- Runtime HRX-Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
