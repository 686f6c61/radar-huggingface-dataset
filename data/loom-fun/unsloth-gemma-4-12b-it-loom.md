# loom-fun/unsloth-gemma-4-12B-it-loom

## Resumen

El modelo identificado como `loom-fun/unsloth-gemma-4-12B-it-loom` no es un checkpoint de pesos entrenado desde cero, sino un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del GGUF sin modificar `unsloth/gemma-4-12B-it-GGUF`, en su variante `gemma-4-12b-it-Q4_K_M.gguf`. El autor, `loom-fun`, lo publica para el ecosistema `hrx-loom` sobre hardware AMD, en concreto la APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151), y lo genera con el flujo de trabajo `loom-skills`.

El modelo subyacente es Gemma 4 12B it de Google DeepMind, un transformer denso de 12.000 millones de parametros con capacidades multimodales (vision, texto y audio segun la documentacion de Unsloth) e hibrido de razonamiento, con soporte de mas de 140 idiomas y hasta 256K tokens de contexto. Sin embargo, este paquete Loom concreto expone unicamente entrada de texto: la tabla de caracteristicas marca la entrada de imagen y la de audio como no soportadas.

La relevancia del artefacto es de infraestructura mas que de modelado: demuestra un motor de inferencia alternativo a llama.cpp sobre ROCm, con decodificacion especulativa DFlash activada por defecto (profundidad 5), API compatible con OpenAI en `127.0.0.1:8080`, soporte de tool calling y concurrencia de 4 peticiones. El repositorio tiene 0 GB y 0 descargas en el momento de la consulta, y la licencia no figura en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4 12B it), hibrido de razonamiento; empaquetado como programa Loom sobre GGUF |
| Parametros totales | 12B (segun nombre del modelo base) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 165.888 tokens por peticion (limite del servidor Loom); el modelo base soporta hasta 256K segun Unsloth |
| Tipos de cuantizacion | Q4_K_M (GGUF); otras cuantizaciones del base no detalladas en este paquete |
| Idiomas soportados | no disponibles en el paquete; el modelo base Gemma 4 declara 140+ idiomas |
| Licencia | no disponible (Gemma 4 se distribuye bajo Apache-2.0 segun Unsloth) |
| Formato de pesos | GGUF (`gemma-4-12b-it-Q4_K_M.gguf`) empaquetado en programas `.loom` + `model.json` |

## Arquitectura y entrenamiento

El paquete no aporta informacion sobre el entrenamiento del modelo base: no se detallan volumen de tokens, composicion del dataset ni si hubo RLHF, DPO o fine-tuning por preferencias. Lo que si documenta el autor es la capa de ejecucion: un motor Loom sobre ROCm que carga el GGUF sin modificarlo y lo sirve con un grafo de kernels generados, validados contra implementaciones de referencia (47/47 tests de kernel superados).

La innovacion tecnica destacable es la decodificacion especulativa con un drafter DFlash (`Anbeeld/gemma4-12B-it-DFlash-GGUF`, tambien en Q4_K_M), activada por defecto con profundidad 5 y `spec-draft-n-max 3` en la configuracion equivalente de llama.cpp. El autor reporta una tasa de aceptacion de tokens redactados del 47 % en la puerta `spec`, y del 26 % en decodificacion corta, 18 % a 2k y 24 % a 32k en las sesiones de medida. La puerta de correccion `spec` verifica que la salida con decodificacion especulativa activa es exactamente igual a la de sin ella. Tambien se documenta un modo de razonamiento (`enable_thinking`) desactivado por defecto y sin control de esfuerzo de razonamiento.

## Capacidades

- Generacion de texto y razonamiento: el modo thinking se activa con `chat_template_kwargs: {"enable_thinking": true}` y esta desactivado por defecto; no admite ajuste de esfuerzo de razonamiento.
- Tool calling estilo OpenAI: acepta `tools` y devuelve `tool_calls`; la puerta `agent` valida el bucle multi-turno de llamadas a herramientas con renderizado exacto del prompt y reutilizacion de historial.
- Agentes y razonamiento multi-paso: soportado via el bucle de tool calling validado, tanto con thinking activado como desactivado (`agent_think_off`).
- Multilingue: el paquete no declara idiomas; el modelo base Gemma 4 declara 140+ idiomas segun Unsloth.
- Muestreo configurable: `temperature`, `top_p`, `top_k` y `seed`, con verificacion de que la distribucion del primer token coincide con llama.cpp.
- Contexto largo: 165.888 tokens por peticion, con prueba needle-in-a-haystack superada hasta la mitad del contexto.
- Sin vision ni audio: la entrada de imagen y la de audio estan marcadas como no soportadas en este paquete, pese a que el modelo base es multimodal.
- Concurrencia: 4 peticiones simultaneas con salida identica a la ejecucion aislada (puerta `consistency`).

## Casos de uso

- Servicio de chat compatible con OpenAI en estaciones de trabajo AMD: `loom-serve --model=gemma-4-12B-it/model.json --device=amdgpu` expone `/v1/chat/completions` en `127.0.0.1:8080`, lo que permite sustituir un endpoint remoto por inferencia local sin cambiar el codigo cliente.
- Procesamiento de documentos largos en local: con 165.888 tokens por peticion y un prefill medido de 945,5 tok/s sobre documentos de 1k tokens (753,7 tok/s a 8k y 428,9 tok/s a 32k), es adecuado para resumir o extraer datos de contratos, informes o expedientes sin salir del equipo.
- Agentes con herramientas en flujos internos: el soporte validado de `tools`/`tool_calls` y el bucle multi-turno permiten construir asistentes que consulten APIs internas, bases de datos o sistemas de tickets, con la garantia de que el historial se reutiliza correctamente.
- Asistencia a desarrolladores en un portatil o mini-PC Strix Halo: el Q4_K_M de 12B cabe en la memoria unificada de la APU y ofrece decodificacion de 48,7 tok/s en prompts cortos, suficiente para autocompletado, explicacion de codigo y generacion de tests en local.
- Despliegue con concurrencia ligera para equipos pequenos: 4 peticiones concurrentes con 78,0 tok/s agregados de decodificacion permiten atender a un equipo reducido en tareas de redaccion, clasificacion o extraccion.
- Evaluacion de motores de inferencia: el paquete incluye puertas de correccion (`golden`, `compare`, `consistency`, `spec`, `agent`, `sampling`, `needle`) que lo convierten en un banco de pruebas reproducible para comparar Loom frente a llama.cpp sobre el mismo GGUF.
- Prototipado de razonamiento controlado: activando `enable_thinking` solo en las peticiones que lo requieran, se puede reservar el coste de tokens de razonamiento para tareas de analisis y mantener respuestas rapidas en el resto.

## Benchmarks y rendimiento

Rendimiento medido por el autor el 2026-11-07 sobre AMD Ryzen AI Max+ 395 con Radeon 8060S, Ubuntu 24.04, `hrx-loom 0.1.0` (hrx-system `d01d1c1`). La columna "roofline" es el techo teorico del hardware para este GGUF (216 GB/s, 59 TFLOP/s). Las columnas "DevLab" son medidas del mismo motor en un runner remoto de AMD DevLab.

| Metrica | Roofline | DevLab llama.cpp | DevLab Loom |
|---|---|---|---|
| Decode tok/s, prompt corto | 69,3 | 36,8 | 48,7 |
| Decode tok/s, contexto 2k | 54,3 | 31,0 | 32,5 |
| Decode tok/s, contexto 32k | 59,9 | 26,8 | 25,5 |
| Prefill tok/s, documento 1k | 2650,7 | 547,2 | 945,5 |
| Prefill tok/s, documento 2k | 2597,1 | 537,7 | 936,1 |
| Prefill tok/s, documento 8k | 2508,6 | 539,4 | 753,7 |
| Prefill tok/s, documento 16k | 2401,5 | 459,1 | 607,7 |
| Prefill tok/s, documento 32k | 2212,6 | 383,4 | 428,9 |
| 4 streams, decode agregado tok/s | 364,9 | 82,4 | 78,0 |
| Decodificacion especulativa, tokens aceptados | n/a | n/a | 47 % |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las cifras anteriores son exclusivamente de rendimiento de inferencia.

## Requisitos de hardware

- VRAM estimada: el GGUF Q4_K_M de 12B ocupa aproximadamente 7-8 GB, aunque el autor no publica el tamano exacto del archivo; en Strix Halo se usa memoria unificada, no VRAM dedicada.
- GPU validadas: AMD Radeon 8060S integrada en Ryzen AI Max+ 395 (gfx1151) con ROCm; el paquete esta orientado a `--device=amdgpu`.
- GPU de clase servidor (A100, H100, RTX 4090): no hay datos de compatibilidad ni de rendimiento en la informacion disponible.
- Cabe en GPU de consumo: si, en APUs Strix Halo con memoria unificada suficiente; no se documenta su comportamiento en GPUs discretas de consumo.
- Despliegue: `pip install "hrx-loom[hf]"`, `loom-fetch` para materializar el modelo y `loom-serve`. Tambien se documenta llama.cpp (build `llamacpp-rocm/b1370`) como referencia con el mismo GGUF y el drafter DFlash.
- Latencia y throughput: decode de 48,7 tok/s en prompt corto y 25,5 tok/s a 32k de contexto; prefill de 945,5 tok/s a 1k y 428,9 tok/s a 32k; 78,0 tok/s agregados con 4 streams. Nota del autor: Loom mide en el cliente y llama.cpp en el servidor, por lo que la comparacion no es estrictamente homogenea.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / motor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unsloth-gemma-4-12B-it-loom (este) | 12B | 165.888 tokens por peticion (servidor Loom) | GGUF Q4_K_M + paquete Loom sobre ROCm | no disponible | Hugging Face, 0 descargas |
| unsloth/gemma-4-12B-it-GGUF | 12B | hasta 256K (modelo base) | GGUF para llama.cpp y derivados | no disponible en la informacion | Hugging Face (modelo base) |
| Gemma 4 12B it (original) | 12B | hasta 256K | safetensors, multimodal (vision, texto, audio) | Apache-2.0 segun Unsloth | Google DeepMind / Hugging Face |
| Anbeeld/gemma4-12B-it-DFlash-GGUF | drafter (tamano no disponible) | no disponible | GGUF para decodificacion especulativa | no disponible | Hugging Face |

La comparacion relevante no es de calidad de modelo, sino de motor: el mismo GGUF rinde 48,7 frente a 36,8 tok/s en prompt corto (Loom frente a llama.cpp en DevLab) y 945,5 frente a 547,2 tok/s de prefill a 1k, mientras que en 4 streams llama.cpp supera ligeramente a Loom (82,4 frente a 78,0 tok/s).

## Limitaciones y advertencias

- El repositorio tiene 0 GB y 0 descargas: no hay evidencia de que los artefactos esten subidos ni de que el paquete haya sido replicado por terceros.
- La licencia no figura en la informacion disponible; antes de uso comercial hay que verificar la del modelo base (Gemma 4 se declara Apache-2.0 segun Unsloth, pero no se confirma en este paquete).
- El paquete desactiva vision y audio aunque el modelo base sea multimodal; no debe usarse para tareas de imagen o voz.
- La puerta `needle_full` (needle-in-a-haystack a contexto completo) no tiene evidencia: solo se valida hasta la mitad del contexto.
- La puerta `decision` no es aplicable y no hay benchmarks de calidad publicados; el rendimiento en tareas reales de razonamiento, codigo o matematicas no esta medido en la informacion disponible.
- No se soporta ajuste de esfuerzo de razonamiento; el thinking solo se activa o desactiva.
- La comparacion de rendimiento mezcla medicion en cliente (Loom) y en servidor (llama.cpp) y procede de un unico entorno (Strix Halo, Ubuntu 24.04); no debe extrapolarse a otras GPUs.
- La decodificacion especulativa depende de un drafter externo de terceros; su tasa de aceptacion varia con el contexto (26 % en prompt corto, 18 % a 2k, 24 % a 32k).
- Riesgo de sesgos y alucinaciones: no hay evaluaciones publicadas en la informacion disponible; aplican los riesgos habituales de un modelo de 12B cuantizado a Q4_K_M.
- El limite de 4 peticiones concurrentes y 4.096 tokens de salida por defecto restringe su uso como backend de alta demanda.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-fun/unsloth-gemma-4-12B-it-loom
- Modelo base GGUF: https://huggingface.co/unsloth/gemma-4-12B-it-GGUF
- Drafter de decodificacion especulativa: https://huggingface.co/Anbeeld/gemma4-12B-it-DFlash-GGUF
- Repositorio del motor Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Ejecucion de referencia DevLab Dispatch: https://github.com/loom-fun/loom-skills/actions/runs/42385194696
- Documentacion de Gemma 4 en Unsloth: https://unsloth.ai/docs/models/gemma-4
- Guia de fine-tuning de Gemma 4 en Unsloth: https://unsloth.ai/docs/models/gemma-4/train
