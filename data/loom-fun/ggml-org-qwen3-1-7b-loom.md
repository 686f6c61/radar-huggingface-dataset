# loom-fun/ggml-org-Qwen3-1.7B-loom

## Resumen

`loom-fun/ggml-org-Qwen3-1.7B-loom` es un paquete de despliegue para el runtime Loom (parte de HRX System, proyecto vinculado a ROCm) que empaqueta el checkpoint GGUF sin modificar `Qwen3-1.7B-Q4_K_M.gguf` del repositorio `ggml-org/Qwen3-1.7B-GGUF`. No se trata de un modelo nuevo ni de un fine-tune: el autor no altera los pesos, sino que genera programas `.loom` y una tarjeta `model.json` que permiten servir el modelo sobre GPUs AMD, en concreto sobre el SoC Ryzen AI Max+ 395 "Strix Halo" (gfx1151).

El interes del paquete es de infraestructura, no de modelado. La model card reporta comparativas directas frente a llama.cpp con el mismo GGUF: +41 % en decodificacion con prompt corto, +56 % a 2k de contexto, +77 % en prefill de 1k y +119 % en agregado con 4 streams concurrentes. Ademas activa por defecto decodificacion especulativa mediante n-gram prompt lookup con profundidad 2.

El modelo subyacente es Qwen3-1.7B, un transformer denso de aproximadamente 2 mil millones de parametros de la familia Qwen3, con modo de razonamiento activado por defecto. El paquete anade soporte de API compatible con OpenAI, tool calling y un conjunto de puertas de correccion (`gates`) que verifican la equivalencia numerica con llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-1.7B); empaquetado como programas Loom sobre GGUF |
| Parametros totales | ~2 mil millones (modelo base Qwen3-1.7B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 40.960 tokens por peticion (segun la model card del paquete) |
| Tipos de cuantizacion | Q4_K_M (unico checkpoint empaquetado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (Qwen3-1.7B-Q4_K_M.gguf) empaquetado en programas `.loom` + `model.json` |
| Modelo base | ggml-org/Qwen3-1.7B-GGUF |
| Concurrencia | 4 peticiones simultaneas |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Decodificacion especulativa | n-gram prompt lookup, profundidad 2, activada por defecto |
| Plataforma objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151), Ubuntu 26.04 |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-1.7B, un transformer denso de la familia Qwen3. El paquete Loom no modifica ni reentrena los pesos: toma el GGUF oficial de `ggml-org` y genera programas `.loom` (incluido `weights.loom`) junto con `llm_config.json`, `tokenizer.json` e `info.json`. La generacion se realizo con el flujo de trabajo `loom-skills` sobre un Ryzen AI Max+ 395.

La innovacion tecnica del paquete es el motor de ejecucion: decodificacion especulativa con n-gram prompt lookup de profundidad 2 activada por defecto, atencion gestionada en el runtime Loom y un servidor con API compatible con OpenAI. La model card documenta que la decodificacion especulativa produce exactamente la misma salida que sin ella (puerta `spec`), y que la concurrencia de 4 peticiones devuelve resultados identicos a ejecuciones aisladas (puerta `consistency`). No se dispone de informacion sobre el dataset de entrenamiento del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento: modo thinking activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}`.
- Tool calling / function calling: soporte de `tools` y `tool_calls` al estilo OpenAI, con bucle multi-turno verificado en la puerta `agent`.
- API compatible con OpenAI: endpoint `/v1/chat/completions` en `127.0.0.1:8080`.
- Decodificacion especulativa: n-gram prompt lookup con profundidad 2, activa por defecto.
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`.
- Contexto largo: hasta 40.960 tokens por peticion, con concurrencia de 4.
- Sin soporte de razonamiento con esfuerzo graduable (`reasoning effort`: no soportado).
- Sin entrada de imagen ni de audio.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Servicio local de chat sobre hardware AMD Strix Halo: el paquete se despliega con `loom-serve --device=amdgpu --memory_bytes=17000000000` y expone una API compatible con OpenAI, adecuada para prototipos y entornos de desarrollo en un unico SoC.
- Asistentes con tool calling: el soporte de `tools`/`tool_calls` y la puerta `agent` verificada permiten construir agentes multi-turno que invocan funciones externas, con historial reutilizado correctamente.
- Procesamiento de documentos largos: con 40.960 tokens de contexto y prefill de 6.238 tok/s en documentos de 1k, resulta viable resumir o extraer informacion de documentos medianos en local.
- Evaluacion comparativa de motores de inferencia: el paquete incluye mediciones frente a llama.cpp con el mismo GGUF, util para decidir entre runtimes en despliegues AMD.
- Atencion al cliente automatizada de baja latencia: la decodificacion de 156,7 tok/s con prompt corto y 131,3 tok/s a 2k permite respuestas interactivas en conversaciones multi-turno.
- Servicio multiusuario ligero: con 4 streams concurrentes y 378,2 tok/s agregados, puede atender a un pequeno equipo sin infraestructura dedicada.
- Razonamiento con modo thinking: tareas que requieren cadena de razonamiento (matematicas simples, analisis paso a paso) con la opcion de desactivar el thinking para respuestas directas.

## Benchmarks y rendimiento

Rendimiento del motor Loom frente a llama.cpp con el mismo GGUF, medido el 2026-11-07 en un Ryzen AI Max+ 395 (Radeon 8060S):

| Metrica | llama.cpp | Loom | Margen | Roofline | Loom % del roofline |
|---|---|---|---|---|---|
| Decode tok/s, prompt corto | 110,9 | 156,7 | +41 % | 208,7 | 75 % |
| Decode tok/s, contexto 2k | 84,3 | 131,3 | +56 % | 187,0 | 70 % |
| Decode tok/s, contexto 32k | 41,5 | 42,9 | +3 % | 50,9 | 84 % |
| Prefill tok/s, documento 1k | 3.520,6 | 6.238,9 | +77 % | 20.114,1 | 31 % |
| Prefill tok/s, documento 2k | 3.051,9 | 6.324,0 | +107 % | 19.357,3 | 33 % |
| Prefill tok/s, documento 8k | 2.676,0 | 4.617,3 | +73 % | 15.792,0 | 29 % |
| Prefill tok/s, documento 16k | 1.741,1 | 3.049,0 | +75 % | 12.678,4 | 24 % |
| Prefill tok/s, documento 32k | 1.126,4 | 1.434,5 | +27 % | 9.092,9 | 16 % |
| 4 streams, decode agregado tok/s | 172,6 | 378,2 | +119 % | 778,2 | 49 % |
| Decodificacion especulativa, tokens aceptados | — | 12 % | — | n/a | n/a |

Condiciones: llama.cpp build `llamacpp-rocm/b1370` con `-ngl 99 -cram 0 -c 35024 -kvu -np 4`; Loom con decodificacion especulativa activada; mismas condiciones de hardware y sistema operativo. La aceptacion del drafter varia por sesion (3 % en decode, 8 % a 2k, 6 % a 32k). No se han publicado resultados de benchmarks del modelo base (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el ejemplo de arranque reserva `--memory_bytes=17000000000` (17 GB), aunque el checkpoint Q4_K_M de 1.7B ocupa bastante menos; el runtime requiere margen para el contexto y el servidor.
- GPU objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" con Radeon 8060S (gfx1151), con 216 GB/s de ancho de banda y 59 TFLOP/s segun la roofline del autor.
- Compatibilidad con GPUs NVIDIA: no documentada en la informacion disponible; el paquete esta orientado a `--device=amdgpu`.
- Despliegue: `pip install "hrx-loom[hf]"`, `loom-fetch` para materializar el modelo y `loom-serve` para servir la API. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete concreto (llama.cpp se usa solo como referencia de comparacion).
- Latencia y throughput: ver tabla de benchmarks; decode de 156,7 tok/s con prompt corto y prefill de 6.238,9 tok/s en documentos de 1k.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `loom-fun/ggml-org-Qwen3-1.7B-loom` | ~2B | 40.960 | GGUF empaquetado en `.loom` | no disponible | Motor Loom, optimizado para AMD Strix Halo; +41 % decode y +77 % prefill frente a llama.cpp |
| `ggml-org/Qwen3-1.7B-GGUF` | ~2B | no disponible | GGUF | no disponible | Checkpoint original sin empaquetar; referencia usada en las comparativas |
| `Qwen/Qwen3-1.7B` | ~2B | no disponible | Transformers (safetensors) | no disponible | Modelo base original en formato Transformers |

No se dispone de datos de benchmarks del modelo base ni de alternativas de la misma categoria en la informacion proporcionada, por lo que la comparativa se limita a formato, empaquetado y rendimiento del motor.

## Limitaciones y advertencias

- El paquete no modifica los pesos: hereda todas las limitaciones, sesgos y riesgos de alucinacion de Qwen3-1.7B, un modelo de ~2B parametros con capacidad de razonamiento limitada frente a modelos mayores.
- La puerta `needle_full` (needle-in-the-haystack a contexto completo) no tiene evidencia registrada; el autor solo verifica hasta la mitad del contexto.
- La puerta `vision` y `decision` figuran como no aplicables; no hay soporte multimodal.
- El rendimiento medido corresponde exclusivamente al hardware AMD Ryzen AI Max+ 395; no hay datos para otras GPUs.
- La aceptacion del drafter en decodificacion especulativa es baja (3-12 %), por lo que la ganancia real depende del tipo de prompt.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; debe verificarse en el repositorio del modelo base antes de produccion.
- Idioma y cobertura multilingue no documentados.
- El paquete tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-07): madurez y soporte comunitario inexistentes.
- El prefetch de prefill alcanza solo el 16-33 % del roofline, lo que indica margen de optimizacion pendiente en documentos largos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-fun/ggml-org-Qwen3-1.7B-loom
- Modelo base GGUF: https://huggingface.co/ggml-org/Qwen3-1.7B-GGUF
- Modelo original Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Runtime Loom (HRX System): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
