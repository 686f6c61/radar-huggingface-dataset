# loom-fun/ggml-org-Qwen2.5-VL-7B-Instruct-loom

## Resumen

`loom-fun/ggml-org-Qwen2.5-VL-7B-Instruct-loom` es un paquete de despliegue para el runtime Loom (ROCm/hrx-system) que empaqueta el checkpoint GGUF sin modificar `Qwen2.5-VL-7B-Instruct-Q4_K_M.gguf` del repositorio `ggml-org/Qwen2.5-VL-7B-Instruct-GGUF`. No es un modelo nuevo: es una distribucion optimizada del modelo vision-lenguaje Qwen2.5-VL-7B-Instruct de Alibaba Qwen, cuantizado a Q4_K_M y preparado para ejecutarse sobre GPUs integradas AMD Ryzen AI Max+ 395 ("Strix Halo", gfx1151) mediante el servidor `loom-serve`, que expone una API compatible con OpenAI.

El interes practico esta en el rendimiento medido frente a llama.cpp sobre el mismo hardware y el mismo GGUF: Loom alcanza 48,2 tok/s de decodificacion en prompt corto frente a 41,8 de llama.cpp, y 56,4 frente a 36,9 tok/s con contexto de 2k. En prefill la diferencia es mayor (1.787,7 frente a 1.221,2 tok/s en documento de 1k; 1.485,6 frente a 756,0 en 16k). Incorpora decodificacion especulativa por n-gram prompt lookup con profundidad 2 activada por defecto, con una tasa de aceptacion del 12 % en la puerta `spec`.

El modelo subyacente conserva las capacidades de Qwen2.5-VL-7B-Instruct: entrada de imagen y texto, contexto de 128.000 tokens por peticion, salida maxima de 4.096 tokens y hasta 4 peticiones concurrentes. La ficha del autor no declara licencia ni lista de idiomas, y el paquete no soporta tool calling ni modo de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (Qwen2.5-VL), pesos GGUF Q4_K_M, empaquetado como programa `.loom` + `model.json` |
| Parametros totales | 7B (aproximado, segun nombre del modelo base; cifra exacta no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico incluido en el paquete); proyector de vision `mmproj-Qwen2.5-VL-7B-Instruct-f16.gguf` en f16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (Q4_K_M) empaquetado en formato Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

El paquete no entrena ni modifica el modelo: reutiliza el checkpoint GGUF de `ggml-org/Qwen2.5-VL-7B-Instruct-GGUF`, que corresponde a Qwen2.5-VL-7B-Instruct, un transformer multimodal con codificador de vision y proyector separado (`mmproj` en f16). La aportacion de Loom es la compilacion de kernels especificos para gfx1151 (Strix Halo) y un servidor de inferencia con gestion de contexto, concurrencia y decodificacion especulativa. La model card no documenta datos de entrenamiento, numero de tokens, composicion del dataset ni si hubo RLHF o DPO; esa informacion corresponderia al modelo original de Qwen, no a este repositorio.

La innovacion tecnica destacable es la decodificacion especulativa por n-gram prompt lookup con profundidad 2, activada por defecto, que acepta un 12 % de los tokens propuestos por el drafter. La validacion de correctitud es exhaustiva: 38/38 tests unitarios de kernels, comparacion token a token contra llama.cpp sobre el mismo GGUF (divergencias solo en empates cercanos), verificacion de que la decodificacion especulativa produce exactamente la misma salida que sin ella, y prueba needle-in-a-haystack hasta la mitad del contexto. La prueba a contexto completo (`needle_full`) no tiene evidencia registrada.

## Capacidades

- Generacion de texto e instrucciones conversacionales en formato chat.
- Entrada de imagen mediante partes `image_url` estilo OpenAI, con proyector `mmproj-Qwen2.5-VL-Instruct-f16.gguf`.
- Comprension de documentos largos: contexto de 128.000 tokens por peticion.
- Salida maxima de 4.096 tokens por peticion (preset `max_tokens`).
- Concurrencia de 4 peticiones simultaneas con consistencia verificada (misma salida que en ejecucion aislada).
- Decodificacion especulativa n-gram activada por defecto.
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`.
- API compatible con OpenAI en `/v1/chat/completions` sobre `127.0.0.1:8080`.
- Sin soporte de tool calling (`agent` y `agent_think_off` marcados como no aplicables).
- Sin modo de razonamiento ni `reasoning effort`.
- Sin entrada ni salida de audio.

## Casos de uso

- Analisis de documentos extensos con imagen: contratos escaneados, informes o articulos de hasta 128k tokens en una sola peticion, aprovechando el prefill de 1.485,6 tok/s en documentos de 16k medido en Loom.
- Asistente local de escritorio sobre hardware AMD integrado: un Ryzen AI Max+ 395 con 21 GB de memoria asignada al modelo sirve una API OpenAI en local, sin GPU dedicada, para prototipos y demos.
- Extraccion de informacion de capturas y diagramas: el soporte de `image_url` permite pasar pantallazos de UI, graficos o esquemas y obtener descripciones o respuestas textuales, con paridad verificada frente a llama.cpp en la puerta `vision`.
- Procesamiento por lotes de imagenes y texto en un unico nodo: con 4 peticiones concurrentes y 123,1 tok/s agregados en decodificacion, es viable clasificar o resumir lotes pequenos de documentos visuales sin infraestructura de servidor.
- Evaluacion comparativa de runtimes: util como referencia reproducible para medir Loom frente a llama.cpp sobre el mismo GGUF y hardware, con cifras de roofline y tasas de aceptacion documentadas.
- Laboratorio de investigacion en decodificacion especulativa: la configuracion n-gram con profundidad 2 y sus tasas de aceptacion por contexto (6 % en prompt corto, 23 % a 2k, 12 % a 32k) sirven como banco de pruebas para estudiar tecnicas de aceleracion.
- Despliegue de vision-lenguaje en entornos con restricciones de memoria: Q4_K_M y 21 GB de asignacion permiten ejecutar un modelo de 7B multimodal en una APU, sin depender de CUDA.

## Benchmarks y rendimiento

Rendimiento medido el 2026-11-07 en AMD Ryzen AI Max+ 395 con Radeon 8060S, Ubuntu 24.04, hrx-loom 0.1.0, frente a llama.cpp build `llamacpp-rocm/b1370` sobre el mismo GGUF. Los valores de Loom son tiempos del cliente; los de llama.cpp, del servidor.

| Metrica | llama.cpp | Loom | Roofline (techo) |
|---|---|---|---|
| Decode tok/s, prompt corto | 41,8 | 48,2 | 55,0 |
| Decode tok/s, contexto 2k | 36,9 | 56,4 | 70,3 |
| Decode tok/s, contexto 32k | 21,7 | 23,9 | 43,4 |
| Prefill tok/s, documento 1k | 1.221,2 | 1.787,7 | 4.452,4 |
| Prefill tok/s, documento 2k | 1.125,3 | 1.889,8 | 4.386,0 |
| Prefill tok/s, documento 8k | 1.008,5 | 1.704,3 | 4.025,6 |
| Prefill tok/s, documento 16k | 756,0 | 1.485,6 | 3.628,1 |
| Prefill tok/s, documento 32k | 524,4 | 1.166,5 | 3.029,8 |
| 4 streams, decode agregado tok/s | 90,4 | 123,1 | 237,6 |
| Decodificacion especulativa, tokens aceptados | no aplica | 12 % | no aplica |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; las cifras anteriores son exclusivamente de throughput.

## Requisitos de hardware

- VRAM/memoria: el ejemplo de arranque reserva 21.000.000.000 bytes (21 GB) con `--memory_bytes=21000000000` sobre `--device=amdgpu`.
- GPU objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" con graficos Radeon 8060S (gfx1151), con 216 GB/s de ancho de banda y 59 TFLOP/s como referencia de roofline.
- No hay datos publicados sobre ejecucion en A100, H100, RTX 4090 ni otras GPUs; el paquete esta generado y validado para el hardware AMD citado.
- Despliegue: `loom-serve` con `model.json`; instalacion via `pip install "hrx-loom[hf]"` y descarga con `loom-fetch`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete concreto (llama.cpp se usa solo como referencia de comparacion con el GGUF original).
- Throughput estimado: 48,2 tok/s de decodificacion en prompt corto, 23,9 tok/s a 32k de contexto, 1.787,7 tok/s de prefill a 1k y 123,1 tok/s agregados con 4 streams.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| loom-fun/Qwen2.5-VL-7B-Instruct-loom | 7B (aprox.) | 128.000 | GGUF Q4_K_M empaquetado para Loom | no disponible | Decodificacion especulativa n-gram; 48,2 tok/s decode corto en Strix Halo |
| ggml-org/Qwen2.5-VL-7B-Instruct-GGUF (llama.cpp) | 7B (aprox.) | 128.000 (segun configuracion del servidor) | GGUF | no disponible | Referencia directa: 41,8 tok/s decode corto, 1.221,2 tok/s prefill 1k en el mismo hardware |
| Qwen/Qwen2.5-VL-7B-Instruct (original) | 7B (aprox.) | 128.000 | safetensors (formato original) | no disponible | Checkpoint de referencia de Alibaba Qwen; sin cifras de rendimiento en la informacion disponible |

## Limitaciones y advertencias

- Sin soporte de tool calling, function calling ni bucles de agente: las puertas `agent` y `agent_think_off` estan marcadas como no aplicables.
- Sin modo de razonamiento o thinking; no apto para flujos que dependan de cadenas de pensamiento explicitas.
- Sin entrada ni salida de audio.
- La prueba needle-in-a-haystack a contexto completo (`needle_full`) no tiene evidencia registrada; solo se valido hasta la mitad del contexto.
- La licencia no esta declarada en el repositorio, lo que impide confirmar condiciones de uso comercial; debe verificarse en el modelo base antes de produccion.
- Los idiomas soportados no estan documentados; no hay garantia explicita de calidad multilingue en este paquete.
- El rendimiento esta medido exclusivamente en AMD Ryzen AI Max+ 395 (gfx1151); no hay datos para otras GPUs ni para CUDA.
- Las cifras de Loom usan temporizacion del cliente y las de llama.cpp del servidor, por lo que la comparacion no es estrictamente homogenea.
- La decodificacion especulativa tiene tasas de aceptacion modestas y variables por contexto (6 % en prompt corto, 23 % a 2k, 12 % a 32k), lo que limita la ganancia en algunos regimenes.
- Riesgo de alucinacion y sesgos del modelo subyacente no documentados en la informacion disponible; aplican las advertencias habituales de un modelo de 7B cuantizado a 4 bits.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-fun/ggml-org-Qwen2.5-VL-7B-Instruct-loom
- Modelo base GGUF: https://huggingface.co/ggml-org/Qwen2.5-VL-7B-Instruct-GGUF
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Flujo loom-skills: https://github.com/loom-fun/loom-skills
- Ejecucion de referencia DevLab Dispatch: https://github.com/loom-fun/loom-skills/actions/runs/42393265593
