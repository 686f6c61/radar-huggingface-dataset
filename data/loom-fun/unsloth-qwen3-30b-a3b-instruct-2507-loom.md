# loom-fun/unsloth-Qwen3-30B-A3B-Instruct-2507-loom

## Resumen

`loom-fun/unsloth-Qwen3-30B-A3B-Instruct-2507-loom` es un paquete de despliegue para el runtime Loom (ROCm/hrx-system) que empaqueta el checkpoint GGUF sin modificar `Qwen3-30B-A3B-Instruct-2507-Q4_K_M.gguf` de Unsloth, a su vez una cuantizacion del modelo Qwen3-30B-A3B-Instruct-2507 de Alibaba Qwen. No se trata de un modelo nuevo ni de un fine-tune: el repositorio contiene programas `.loom` generados, un `model.json` de configuracion, el tokenizador y el manifiesto de pesos, orientados a ejecutar el modelo en hardware AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151).

El modelo subyacente es un transformer de mezcla de expertos (MoE) con 30 mil millones de parametros totales y aproximadamente 3 mil millones activos por token, con una ventana de contexto anunciada de 262.144 tokens por peticion en este empaquetado. La variante 2507 corresponde a la actualizacion de julio de 2025 de Qwen3, en su version Instruct (no thinking).

Su relevancia es practica: ofrece una via de servir un MoE de 30B en un APU consumer con memoria unificada, con una API compatible con OpenAI y mejoras medidas de throughput de prefill frente a llama.cpp en el mismo GGUF y el mismo hardware, segun los datos del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (modelo base Qwen3-30B-A3B-Instruct-2507); empaquetado como programas Loom sobre GGUF |
| Parametros totales | 30B (modelo base) |
| Parametros activos | ~3B (modelo base, MoE) |
| Longitud de contexto | 262.144 tokens por peticion (segun la model card del empaquetado) |
| Tipos de cuantizacion | Q4_K_M (GGUF empaquetado); otras cuantizaciones del base no detalladas en este repo |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M) empaquetado como `.loom` / `weights.loom` + `model.json` |

## Arquitectura y entrenamiento

El modelo base Qwen3-30B-A3B-Instruct-2507 es un transformer con capas de mezcla de expertos: 30B parametros totales con aproximadamente 3B activos por token, lo que reduce el coste computacional por token frente a un denso equivalente. La variante 2507 es la actualizacion de julio de 2025 de la familia Qwen3, en su rama Instruct (sin modo thinking). No se dispone en la informacion proporcionada de detalles sobre volumen de tokens de entrenamiento, composicion del dataset ni etapas de RLHF/DPO del modelo base.

El repositorio no entrena nada: genera, mediante el flujo `loom-skills`, programas Loom especificos para el hardware y compila kernels que ejecutan el GGUF original. El empaquetado incluye el tokenizador, `llm_config.json` con la configuracion usada para generar los programas y verificaciones de correctitud frente a llama.cpp (tokens greedy y top-5 log-probs) sobre prompts cortos y documentos de 1k a 32k tokens.

## Capacidades

- Generacion de texto e instrucciones en el modelo base Qwen3-30B-A3B-Instruct-2507.
- Tool calling estilo OpenAI: soporta `tools` y `tool_calls` en `/v1/chat/completions`, validado con un bucle multi-turno de agente.
- API compatible con OpenAI en `127.0.0.1:8080` (`/v1/chat/completions`).
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`.
- Concurrencia de 4 peticiones simultaneas con consistencia verificada (misma salida que en ejecucion aislada).
- Limite de salida de 4.096 tokens por peticion (preset `max_tokens`).
- Modo thinking / reasoning effort: no soportado en este empaquetado.
- Entrada de imagen o audio: no soportada.
- Decodificacion especulativa: no soportada.
- Capacidades multilingues del base: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente de codigo en local sobre estacion de trabajo AMD: servir el modelo con `loom-serve --device=amdgpu` y consumirlo desde el IDE mediante la API compatible con OpenAI, aprovechando el MoE de 3B activos para mantener latencia de decodificacion utilizable en un APU.
- Procesado de documentos largos: con 262.144 tokens de contexto por peticion, permite resumir o extraer informacion de contratos, informes o bases de codigo extensas sin trocear; el autor valida needle-in-the-haystack hasta la mitad del contexto.
- Automatizacion de agentes con tool calling: el gate `agent` valida el renderizado exacto del prompt, la reutilizacion de historial y la validez de las llamadas a herramientas en bucles multi-turno, lo que habilita orquestadores que invocan APIs externas.
- Backend de chat para equipos pequenos: 4 peticiones concurrentes con salida identica a la ejecucion aislada permiten un servicio interno modesto sin GPU dedicada.
- Evaluacion y prototipado de pipelines RAG: el prefill medido (1.874,6 tok/s con documento de 2k y 914,2 tok/s con 32k en Loom) hace viable inyectar contextos recuperados grandes en cada consulta.
- Despliegue en hardware de memoria unificada: con `--memory_bytes=63000000000` el paquete esta pensado para ejecutarse en un Ryzen AI Max+ 395 con 128 GB de memoria compartida, evitando la compra de una GPU de datacenter.
- Reproducibilidad de inferencia: los gates de correctitud frente a llama.cpp permiten usar este empaquetado como referencia verificable en pruebas de regresion de motores de inferencia.

## Benchmarks y rendimiento

Datos del autor en AMD Ryzen AI Max+ 395 (Radeon 8060S, gfx1151, 216 GB/s, 59 TFLOP/s), mismo GGUF en ambos motores. Los valores "DevLab" son las mediciones registradas en el runner del autor; la columna roofline es el techo teorico del hardware.

| Metrica | Roofline | DevLab llama.cpp | DevLab Loom |
|---|---|---|---|
| Decode tok/s, prompt corto | 112,5 | 67,4 | 72,6 |
| Decode tok/s, contexto 2k | 102,1 | 57,9 | 61,9 |
| Decode tok/s, contexto 32k | 42,6 | 36,2 | 30,2 |
| Prefill tok/s, documento 1k | 10.078,2 | 1.204,4 | 2.041,2 |
| Prefill tok/s, documento 2k | 9.443,9 | 1.031,7 | 1.874,6 |
| Prefill tok/s, documento 8k | 6.855,1 | 869,4 | 1.752,6 |
| Prefill tok/s, documento 16k | 5.020,2 | 581,2 | 1.346,2 |
| Prefill tok/s, documento 32k | 3.269,8 | 368,3 | 914,2 |
| 4 streams, decode agregado tok/s | 171,0 | 106,6 | 151,3 |

No se han publicado resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card solo reporta rendimiento de inferencia y gates de correctitud (31/31 tests de kernel, golden, compare, consistency, agent, sampling y needle hasta medio contexto; `needle_full` sin evidencia).

## Requisitos de hardware

- Memoria: el ejemplo de arranque usa `--memory_bytes=63000000000` (unos 63 GB), coherente con un GGUF Q4_K_M de un MoE de 30B en memoria unificada.
- Hardware de referencia: AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151), Ubuntu 24.04; no se documenta soporte para otras GPU en la informacion disponible.
- GPU dedicadas (A100, H100, RTX 4090): no disponibles como objetivo soportado en este empaquetado; el runtime es ROCm y el paquete esta generado para Strix Halo.
- Cabe en GPU consumer: si, en el sentido de APU con memoria unificada de 128 GB; no se confirma en GPU consumer discretas de 24 GB por el tamano del checkpoint.
- Despliegue: `pip install "hrx-loom[hf]"`, `loom-fetch` para materializar el modelo y `loom-serve --device=amdgpu`. No se mencionan vLLM, TGI, Ollama ni llama.cpp como backends de este paquete (llama.cpp solo aparece como referencia de comparacion).
- Latencia y throughput: ver tabla de benchmarks; decode de 72,6 tok/s en prompt corto y prefill de 2.041,2 tok/s con documento de 1k en Loom.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Este paquete (Qwen3-30B-A3B-Instruct-2507 Q4_K_M, Loom) | 30B | ~3B | 262.144 | apache-2.0 | GGUF empaquetado, loom-serve |
| unsloth/Qwen3-30B-A3B-Instruct-2507-GGUF | 30B | ~3B | no disponible en la info | apache-2.0 (heredada) | GGUF, llama.cpp y otros |
| Qwen3-30B-A3B (generacion previa) | 30B | ~3B | no disponible en la info | apache-2.0 | GGUF y safetensors |
| Qwen3-235B-A22B (misma familia) | 235B | 22B | no disponible en la info | apache-2.0 | requiere hardware muy superior |

La comparativa de calidad frente a otras familias no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos en safetensors ni un modelo entrenado: es un empaquetado de inferencia para un runtime concreto; la calidad del texto depende integramente del GGUF base de Unsloth/Qwen.
- Sin modo thinking ni reasoning effort: la variante es Instruct pura; tareas que requieran cadenas de razonamiento largas pueden rendir por debajo de la variante Thinking.
- Sin vision ni audio.
- Sin decodificacion especulativa, lo que limita el throughput maximo alcanzable.
- `needle_full` sin evidencia: el autor no ha verificado recuperacion de informacion en el contexto completo de 262.144 tokens, solo hasta la mitad.
- El rendimiento a 32k de contexto en decode es inferior al de llama.cpp (30,2 frente a 36,2 tok/s), aunque el prefill es notablemente superior.
- Dependencia de hardware muy especifico (Strix Halo, ROCm, hrx-loom 0.1.0): no hay evidencia de funcionamiento en otras GPU.
- Riesgo de alucinacion y sesgos del modelo base: no documentados en la informacion disponible; deben evaluarse antes de produccion.
- Licencia apache-2.0 declarada en el empaquetado; conviene verificar las condiciones del modelo base Qwen3 antes de uso comercial.
- Concurrencia limitada a 4 peticiones y salida maxima de 4.096 tokens por peticion.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia: no hay evidencia de uso en produccion por terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-fun/unsloth-Qwen3-30B-A3B-Instruct-2507-loom
- Modelo base GGUF: https://huggingface.co/unsloth/Qwen3-30B-A3B-Instruct-2507-GGUF
- Qwen3-30B-A3B (Unsloth): https://huggingface.co/unsloth/Qwen3-30B-A3B
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Flujo loom-skills: https://github.com/loom-fun/loom-skills
- Run de referencia DevLab: https://github.com/loom-fun/loom-skills/actions/runs/42378966149
- Guia de Unsloth para Qwen3-2507: https://unsloth.ai/docs/models/tutorials/qwen3-how-to-run-and-fine-tune/qwen3-2507
