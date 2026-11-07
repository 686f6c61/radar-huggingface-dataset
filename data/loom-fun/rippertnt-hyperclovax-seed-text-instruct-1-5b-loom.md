# loom-fun/rippertnt-HyperCLOVAX-SEED-Text-Instruct-1.5B-loom

## Resumen

`loom-fun/rippertnt-HyperCLOVAX-SEED-Text-Instruct-1.5B-loom` es un paquete de despliegue para el runtime Loom de AMD, no un modelo entrenado desde cero. Empaqueta el checkpoint GGUF sin modificar `rippertnt/HyperCLOVAX-SEED-Text-Instruct-1.5B-Q4_K_M-GGUF`, derivado del modelo HyperCLOVAX-SEED-Text-Instruct-1.5B de Naver (naver-hyperclovax), en formato de programas `.loom` mas una tarjeta `model.json`, generado con el flujo `loom-skills` sobre un AMD Ryzen AI Max+ 395 "Strix Halo".

El interes practico esta en el motor de inferencia, no en los pesos: Loom sirve el mismo GGUF con decodificacion especulativa n-gram activada por defecto (profundidad 3) y una API compatible con OpenAI (`/v1/chat/completions`). El autor publica una comparativa frente a llama.cpp (build `llamacpp-rocm/b1369`) en la misma maquina, con ganancias de hasta +67 % en decodificacion a 32k de contexto y +107 % en agregado con 4 streams, aunque con una perdida del 14 % en prefill a 32k.

El modelo subyacente es un transformer denso de aproximadamente 1.6B parametros, orientado a generacion de texto e instrucciones, con un contexto declarado de 131.072 tokens por peticion en el runtime Loom. La ficha del paquete no documenta tool calling, modo razonamiento, vision ni audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base HyperCLOVAX-SEED-Text-Instruct-1.5B); empaquetado como programas `.loom` + `model.json` |
| Parametros totales | ~1.6B (segun openmodelstats para el modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens por peticion (runtime Loom); el benchmark usa `-c 35024` en llama.cpp |
| Tipos de cuantizacion | Q4_K_M (GGUF); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible (la model card del paquete no los declara) |
| Licencia | no disponible en la ficha del paquete; el modelo base referencia `hyperclovax-seed` |
| Formato de pesos | GGUF (`hyperclovax-seed-text-instruct-1.5b-q4_k_m.gguf`) empaquetado en formato Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

El paquete no entrena ni modifica pesos: toma el GGUF Q4_K_M de `rippertnt/HyperCLOVAX-SEED-Text-Instruct-1.5B-Q4_K_M-GGUF` y lo materializa como artefactos Loom mediante `loom-fetch` y el flujo `loom-skills`. El modelo subyacente es un transformer denso de ~1.6B parametros de la familia HyperCLOVAX-SEED de Naver, ajustado para instrucciones. No se dispone en la informacion proporcionada de detalles sobre tokens de entrenamiento, composicion del dataset ni si hubo RLHF/DPO.

La innovacion tecnica relevante es del runtime: decodificacion especulativa por n-gram prompt lookup con profundidad 3, activada por defecto, y kernels generados verificados contra implementaciones de referencia (37/37 tests `kernel_tests`). El autor reporta paridad funcional con llama.cpp en las puertas `golden`, `compare`, `consistency`, `spec`, `sampling` y `needle` (hasta la mitad del contexto), pero no aporta evidencia para `needle_full` (contexto completo).

## Capacidades

- Generacion de texto e instrucciones en un modelo denso de ~1.6B parametros.
- API compatible con OpenAI: `/v1/chat/completions` en `127.0.0.1:8080`.
- Sampling configurable: `temperature`, `top_p`, `top_k`, `seed`.
- Decodificacion especulativa n-gram (profundidad 3) activada por defecto.
- Concurrencia de 4 peticiones simultaneas con salida consistente respecto a ejecuciones aisladas.
- Limite de salida de 4.096 tokens (`max_tokens` preestablecido).
- Tool calling: no soportado.
- Razonamiento / thinking mode: no soportado.
- Entrada de imagen: no soportada.
- Entrada/salida de audio: no soportada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Servicio local de chat sobre GPU integrada AMD: desplegar `loom-serve --device=amdgpu --memory_bytes=24000000000` en un Ryzen AI Max+ 395 para servir un asistente de texto con API OpenAI sin GPU dedicada.
- Procesamiento de documentos largos en local: con 131.072 tokens de contexto por peticion y prefill medido de 3.209,7 tok/s a 16k, es adecuado para resumir o extraer datos de contratos, informes o expedientes que no deben salir del equipo.
- Sustitucion de llama.cpp en pipelines existentes: al exponer `/v1/chat/completions`, los clientes que ya hablan con la API de OpenAI pueden apuntar al servidor Loom y aprovechar el +15 % a +67 % de decodificacion medido.
- Procesamiento por lotes con concurrencia moderada: 4 streams concurrentes con 361,1 tok/s agregados (frente a 174,3 en llama.cpp) permiten clasificar, etiquetar o reescribir lotes de textos cortos.
- Prototipado y evaluacion de runtimes en hardware AMD: util como banco de pruebas para comparar motores de inferencia sobre el mismo GGUF y la misma maquina.
- Asistente de redaccion o correccion en escritorio: el tamano de 1.6B en Q4_K_M y la API local permiten integrarlo en herramientas de escritorio con baja huella de memoria.
- No apto para flujos agenticos o de tool calling: la propia model card marca estas capacidades como no soportadas, por lo que no debe usarse en automatizaciones que dependan de function calling.

## Benchmarks y rendimiento

Rendimiento del runtime Loom frente a llama.cpp con el mismo GGUF en AMD Ryzen AI Max+ 395 (Radeon 8060S), medido el 2026-11-07:

| Metrica | llama.cpp | Loom | Margen | Roofline | Loom % roofline |
|---|---|---|---|---|---|
| Decode tok/s, prompt corto | 130,5 | 149,9 | +15 % | 230,3 | 65 % |
| Decode tok/s, contexto 2k | 100,5 | 125,7 | +25 % | 202,8 | 62 % |
| Decode tok/s, contexto 32k | 68,2 | 114,1 | +67 % | 140,6 | 81 % |
| Prefill tok/s, documento 1k | 4.604,7 | 6.170,8 | +34 % | 20.950,1 | 29 % |
| Prefill tok/s, documento 2k | 3.995,9 | 5.952,0 | +49 % | 20.243,5 | 29 % |
| Prefill tok/s, documento 8k | 3.283,8 | 4.618,9 | +41 % | 16.836,3 | 27 % |
| Prefill tok/s, documento 16k | 2.095,7 | 3.209,7 | +53 % | 13.750,4 | 23 % |
| Prefill tok/s, documento 32k | 1.381,0 | 1.184,3 | -14 % | 10.062,0 | 12 % |
| 4 streams, decode agregado tok/s | 174,3 | 361,1 | +107 % | 844,2 | 43 % |
| Speculative decoding, tokens aceptados | — | 7 % | — | n/a | n/a |

Notas del autor: llama.cpp con `-ngl 99 -cram 0 --spec-type ngram-simple -c 35024 -kvu -np 4`; Loom con decodificacion especulativa n-gram profundidad 3; tiempos de Loom medidos en cliente y de llama.cpp en servidor; roofline calculado a 216 GB/s y 59 TFLOP/s. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: el ejemplo oficial reserva `--memory_bytes=24000000000` (24 GB) en memoria unificada del Ryzen AI Max+ 395; un GGUF Q4_K_M de ~1.6B ocupa del orden de 1 GB en pesos, por lo que el grueso de la reserva cubre contexto y buffers.
- GPU recomendadas: AMD Radeon 8060S (gfx1151, Strix Halo) es la plataforma validada; el backend es `amdgpu` via ROCm.
- GPU de consumidor: el modelo cabe holgadamente en cualquier GPU consumer con 4-8 GB de VRAM si se usa llama.cpp u otro runtime GGUF; el paquete Loom esta orientado a hardware AMD Strix Halo.
- Despliegue: `pip install "hrx-loom[hf]"`, `loom-fetch` para materializar y `loom-serve --model=... --device=amdgpu`; el GGUF base tambien es compatible con llama.cpp.
- Latencia y throughput: 149,9 tok/s en decodificacion con prompt corto, 114,1 tok/s a 32k de contexto y 361,1 tok/s agregados con 4 streams en la maquina de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este paquete (Loom + HyperCLOVAX-SEED 1.5B Q4_K_M) | ~1.6B | 131.072 (runtime Loom) | GGUF empaquetado en Loom | no disponible | Optimizado para AMD Strix Halo con spec decoding n-gram |
| HyperCLOVAX-SEED-Text-Instruct-1.5B (original Naver) | ~1.6B | no disponible en la informacion | safetensors / GGUF (via terceros) | `hyperclovax-seed` | Modelo de referencia; 163,2K descargas historicas segun openmodelstats |
| Mismo GGUF en llama.cpp | ~1.6B | 35.024 en la configuracion medida | GGUF | segun el GGUF base | Referencia de rendimiento: 130,5 tok/s decode corto, 68,2 tok/s a 32k |

No se dispone de datos de benchmarks de calidad para comparar frente a otras familias de 1-2B (Qwen, Llama, Gemma) en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo: es un empaquetado de despliegue; cualquier limitacion del checkpoint HyperCLOVAX-SEED 1.5B subyacente se hereda.
- Sin tool calling, sin modo razonamiento, sin vision y sin audio: la model card los marca explicitamente como no soportados.
- `needle_full` (needle-in-a-haystack a contexto completo) sin evidencia: el autor solo valida hasta la mitad del contexto.
- Regresion en prefill a 32k (-14 % frente a llama.cpp), por lo que documentos muy largos pueden procesarse mas lentamente que en el motor de referencia.
- Tasa de aceptacion del drafter baja (7 % en la puerta `spec`, 2-4 % en decodificacion corta): la ganancia especulativa es limitada fuera de contextos largos.
- Licencia no declarada en la ficha del paquete: antes de uso comercial hay que verificar la licencia `hyperclovax-seed` del modelo base.
- Idiomas soportados no documentados: no asumir cobertura multilingue sin evaluacion propia.
- Riesgo de alucinacion propio de un modelo de 1.6B en Q4_K_M; no recomendado para tareas de alta precision sin verificacion.
- Plataforma validada unicamente en AMD Ryzen AI Max+ 395 con Ubuntu 24.04 y `hrx-loom 0.1.0`; el soporte en otras GPU o sistemas no esta documentado.
- Cero descargas y cero likes en el momento de la ficha: ecosistema y soporte comunitario practicamente inexistentes.

## Enlaces

- Paquete Loom en Hugging Face: https://huggingface.co/loom-fun/rippertnt-HyperCLOVAX-SEED-Text-Instruct-1.5B-loom
- GGUF base: https://huggingface.co/rippertnt/HyperCLOVAX-SEED-Text-Instruct-1.5B-Q4_K_M-GGUF
- Repositorio del runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Flujo loom-skills: https://github.com/loom-fun/loom-skills
- Ejecucion de referencia DevLab Dispatch: https://github.com/loom-fun/loom-skills/actions/runs/42332379039
- Ficha del modelo original en openmodelstats: https://openmodelstats.com/models/naver-hyperclovax/hyperclovax-seed-text-instruct-1.5b
