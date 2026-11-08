# loom-fun/ggml-org-gemma-3-1b-it-loom

## Resumen

`loom-fun/ggml-org-gemma-3-1b-it-loom` es un paquete de despliegue para el motor Loom (AMD ROCm), no un modelo nuevo. Empaqueta el checkpoint GGUF sin modificar `gemma-3-1b-it-Q4_K_M.gguf` de `ggml-org/gemma-3-1b-it-GGUF`, que a su vez es la cuantizacion Q4_K_M del modelo Gemma 3 1B instruct de Google. El repositorio contiene programas `.loom` y una tarjeta `model.json` generados con el flujo `loom-skills` sobre un AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151).

El interes tecnico esta en el motor de inferencia, no en los pesos: Loom expone una API compatible con `/v1/chat/completions` de OpenAI, admite decodificacion especulativa por n-gram prompt lookup con profundidad 3 activada por defecto, ventana de contexto de 32.768 tokens por peticion y hasta 4 peticiones concurrentes. El paquete incluye un conjunto de puertas de validacion (kernel tests, golden, compare, consistency, spec, sampling, needle) comparadas contra llama.cpp sobre el mismo GGUF.

Es relevante para quien quiera ejecutar Gemma 3 1B en hardware AMD Strix Halo con un servidor compatible con OpenAI y decodificacion especulativa integrada. El modelo subyacente es pequeno (1B parametros), orientado a instrucciones y sin soporte de tool calling, razonamiento explicito ni vision en esta configuracion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 1B instruct); paquete de despliegue para el motor Loom |
| Parametros totales | 1B (modelo base Gemma 3 1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens por peticion (segun la tarjeta del paquete) |
| Tipos de cuantizacion | Q4_K_M (unico peso incluido) |
| Idiomas soportados | no disponible (la tarjeta del paquete no los declara) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (`gemma-3-1b-it-Q4_K_M.gguf`), empaquetado como programas `.loom` + `model.json` |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 3 1B instruct, un transformer decoder-only de aproximadamente 1.000 millones de parametros publicado por Google. La informacion proporcionada no incluye detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) del modelo original; esos datos corresponden a la model card de `google/gemma-3-1b-it`, no incluida aqui. El checkpoint empaquetado es la cuantizacion Q4_K_M generada por `ggml-org`, sin modificaciones sobre los pesos.

La innovacion del repositorio esta en la capa de ejecucion: Loom implementa decodificacion especulativa mediante n-gram prompt lookup con profundidad 3, activada por defecto, y valida su equivalencia exacta con la decodificacion especulativa desactivada (puerta `spec`). La tarjeta reporta kernels generados que superan 45/45 pruebas unitarias frente a implementaciones de referencia, y una puerta `golden` que compara tokens greedy y top-5 log-probs contra llama.cpp en prompts cortos y documentos de 1k a 32k tokens. La puerta `needle_full` (needle-in-a-haystack a contexto completo) figura como "no evidence", mientras que `needle` a la mitad del contexto pasa.

## Capacidades

- Generacion de texto conversacional en formato instruct, servida via `/v1/chat/completions` estilo OpenAI.
- Decodificacion especulativa por n-gram prompt lookup (profundidad 3) activada por defecto, con salida identica a la decodificacion no especulativa.
- Muestreo configurable: `temperature`, `top_p`, `top_k` y `seed`.
- Contexto de 32.768 tokens por peticion y salida maxima de 4.096 tokens (preset `max_tokens`).
- Concurrencia de 4 peticiones simultaneas con consistencia verificada frente a ejecuciones aisladas.
- Sin soporte de tool calling ni function calling.
- Sin modo de razonamiento o thinking, ni control de esfuerzo de razonamiento.
- Sin entrada de imagen ni audio (la puerta `vision` figura como no aplicable).
- Idiomas soportados: no disponible en la informacion proporcionada.

## Casos de uso

- Servicio de chat local en estaciones de trabajo AMD Strix Halo: Loom expone una API compatible con OpenAI en `127.0.0.1:8080`, lo que permite conectar clientes existentes sin adaptadores y ejecutar Gemma 3 1B Q4_K_M en la iGPU Radeon 8060S.
- Prototipado rapido de asistentes conversacionales: con 1B parametros y Q4_K_M, el modelo cabe holgadamente en memoria unificada y permite iterar sobre prompts y temperaturas con latencia baja.
- Procesamiento de documentos de hasta 32k tokens: la puerta `needle` valida needle-in-a-haystack a la mitad del contexto frente a llama.cpp, adecuado para resumen o extraccion sobre textos largos, con la cautela de que el contexto completo no esta validado.
- Evaluacion comparativa de motores de inferencia: el paquete incluye mediciones de decode y prefill frente a llama.cpp (build `llamacpp-rocm/b1370`) en el mismo GGUF, util para decidir el motor en despliegues ROCm.
- Servicio multiusuario ligero: 4 peticiones concurrentes con consistencia verificada permiten atender pequenos equipos o demos publicas con un solo dispositivo.
- Pruebas de regresion de infraestructura: las puertas `kernel_tests`, `golden`, `compare`, `consistency`, `spec` y `sampling` sirven como suite de validacion al actualizar versiones de hrx-loom o de los drivers ROCm.

## Benchmarks y rendimiento

Datos de la tarjeta del autor sobre AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151), hrx-loom `0.1.0`, medidos el 2026-11-07. Loom usa decodificacion especulativa n-gram (profundidad 3); llama.cpp usa `-ngl 99 -cram 0 --spec-type ngram-simple -c 33792 -kvu -np 4`. Las columnas de llama.cpp local aparecen como no medidas en la tabla original.

| Metrica | Roofline | DevLab llama.cpp | DevLab Loom |
|---|---|---|---|
| Decode tok/s, prompt corto | 292,0 | 161,6 | 150,4 |
| Decode tok/s, contexto 2k | 286,6 | 153,7 | 144,5 |
| Decode tok/s, contexto 32k | 277,4 | no medido | no medido |
| Prefill tok/s, documento 1k | 40.724,2 | 6.731,8 | 9.797,3 |
| Prefill tok/s, documento 2k | 40.465,1 | 7.117,2 | 10.923,0 |
| Prefill tok/s, documento 8k | 39.145,5 | no medido | no medido |
| Prefill tok/s, documento 16k | 37.514,3 | no medido | no medido |
| Prefill tok/s, documento 32k | 34.628,4 | no medido | no medido |
| 4 streams, decode agregado tok/s | 1.222,0 | 504,6 | 268,4 |
| Tokens drafted aceptados | n/a | n/a | 7 % |

Notas de la fuente: el roofline se calcula a 216 GB/s y 59 TFLOP/s; la aceptacion del drafter medida en la sesion de decode fue del 3 % (3 % a 2k) y del 7 % en la puerta `spec`. La comparacion local frente a DevLab es informativa, no un veredicto. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el ejemplo de arranque de la tarjeta usa `--memory_bytes=7000000000` (aproximadamente 7 GB) para el modelo Q4_K_M con contexto de 32k; en Strix Halo se asigna desde memoria unificada.
- GPU validadas: AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151), bajo Ubuntu 24.04 y ROCm. No hay datos de validacion en A100, H100 ni RTX 4090 en la informacion proporcionada.
- Cabe en GPU de consumo: si, en iGPU Strix Halo; para GPUs discretas de consumo no hay datos de compatibilidad en la fuente.
- Despliegue: `pip install "hrx-loom[hf]"`, `loom-fetch` para materializar el paquete y `loom-serve --model=... --device=amdgpu`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete concreto (llama.cpp se usa solo como referencia de comparacion).
- Rendimiento: decode en torno a 144-150 tok/s en DevLab (prompt corto y 2k), prefill de 9.797 a 10.923 tok/s en 1k-2k y 268,4 tok/s agregados con 4 streams en DevLab; los valores locales no se registraron en la tabla.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este paquete (Gemma 3 1B Q4_K_M + Loom) | 1B | 32.768 | GGUF + `.loom` | gemma | Servidor OpenAI-style, spec decoding n-gram, solo AMD ROCm validado |
| `ggml-org/gemma-3-1b-it-GGUF` | 1B | no disponible en la fuente | GGUF | gemma | Mismos pesos sin empaquetar; usable con llama.cpp y derivados |
| `google/gemma-3-1b-it` | 1B | no disponible en la fuente | safetensors | gemma | Pesos originales de Google; requiere runtime de transformers o similar |

No se dispone de datos de benchmarks de calidad para comparar el rendimiento del modelo frente a alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene un modelo nuevo: es un empaquetado de despliegue; cualquier limitacion de Gemma 3 1B instruct aplica integra.
- Sin tool calling ni function calling: no apto para pipelines de agentes que requieran invocacion de herramientas.
- Sin modo de razonamiento ni control de esfuerzo de razonamiento.
- Sin soporte de imagen ni audio en esta configuracion.
- La puerta `needle_full` (contexto completo) no tiene evidencia; el uso a 32k tokens no esta validado de extremo a extremo.
- Solo hay validacion en AMD Strix Halo con hrx-loom `0.1.0`; no hay datos de otras GPUs ni de otros sistemas operativos.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; deben evaluarse sobre la model card de Gemma 3 1B.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de uso de Gemma; revisar las restricciones antes de desplegar en produccion.
- El repositorio figura con 0 descargas y 0 likes y un tamano de 0.0 GB en el momento de la consulta; verificar la integridad de los artefactos antes de usarlo.
- La comparacion de rendimiento mezcla medicion en cliente (Loom) y en servidor (llama.cpp), segun advierte la propia tarjeta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-fun/ggml-org-gemma-3-1b-it-loom
- Modelo base GGUF: https://huggingface.co/ggml-org/gemma-3-1b-it-GGUF
- Modelo original de Google: https://huggingface.co/google/gemma-3-1b-it
- Motor Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo loom-skills: https://github.com/loom-fun/loom-skills
- Ejecucion de referencia DevLab Dispatch: https://github.com/loom-fun/loom-skills/actions/runs/42415155230
