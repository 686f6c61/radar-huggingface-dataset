# loom-fun-staging/unsloth-Qwen3.5-9B-loom

## Resumen

`loom-fun-staging/unsloth-Qwen3.5-9B-loom` es un paquete de despliegue para el runtime AMD Loom, no un modelo entrenado desde cero. Empaqueta el checkpoint GGUF sin modificar `Qwen3.5-9B-Q4_K_M.gguf` de `unsloth/Qwen3.5-9B-GGUF` junto con programas `.loom` y una tarjeta `model.json`, generados mediante el flujo de trabajo `loom-skills`. El objetivo es ejecutar el modelo Qwen3.5 de 9B en GPUs AMD concretas: el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo base es un transformer multimodal de 9B parametros con capacidad de vision (pipeline `image-text-to-text`), cuantizado en Q4_K_M y con una ventana de contexto de 262.144 tokens por peticion. El paquete anade decodificacion especulativa DFlash de profundidad 3 mediante un drafter separado (`AtomicChat/Qwen3.5-9B-DFlash-GGUF`), tool calling estilo OpenAI y un modo de razonamiento desactivable. La licencia declarada es Apache 2.0.

Su relevancia es de nicho pero clara: ofrece una via de inferencia optimizada para hardware AMD consumer y profesional (Strix Halo y R9700) con una API compatible con OpenAI, algo poco habitual en el ecosistema GGUF, dominado por CUDA. No obstante, el repositorio es de staging, no tiene descargas ni likes, y las puertas de validacion de correctitud no se han vuelto a ejecutar sobre esta compilacion concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo base Qwen3.5-9B); paquete de runtime Loom |
| Parametros totales | 9B (modelo base) |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector de vision en F16 (`mmproj-F16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M) + programas `.loom` + `model.json` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Decodificacion especulativa | DFlash, profundidad 3, activada por defecto |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |

## Arquitectura y entrenamiento

El paquete no incluye entrenamiento propio: reutiliza el checkpoint `Qwen3.5-9B-Q4_K_M.gguf` de Unsloth sin modificaciones. La arquitectura subyacente es la del modelo Qwen3.5-9B (transformer con soporte multimodal de imagen), aunque la model card no detalla la composicion del dataset de entrenamiento, el numero de tokens ni si hubo fases de RLHF o DPO. Esos datos deben consultarse en la ficha del modelo base.

La innovacion tecnica del paquete reside en el runtime Loom: kernels generados especificamente para las arquitecturas AMD gfx1151 y gfx1201, servidor con API compatible con OpenAI en `127.0.0.1:8080`, y decodificacion especulativa DFlash con profundidad 3 y un drafter dedicado. La model card incluye una comparacion contra llama.cpp ROCm con techos de roofline calculados para Strix Halo (216 GB/s, 59 TFLOP/s), pero los valores medidos de Loom y llama.cpp aparecen como "no medidos" en la tabla publicada, por lo que no es posible extraer cifras de rendimiento reales.

## Capacidades

- Generacion de texto y razonamiento en modo thinking, desactivado por defecto y activable con `chat_template_kwargs: {"enable_thinking": true}`.
- Entrada de imagenes mediante partes `image_url` estilo OpenAI, con proyector `mmproj-F16.gguf`.
- Tool calling estilo OpenAI (`tools` y `tool_calls`).
- Decodificacion especulativa DFlash con profundidad 3, activa por defecto.
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`.
- Concurrencia de hasta 4 peticiones simultaneas.
- Ventana de contexto de 262.144 tokens por peticion y salida maxima de 4.096 tokens.
- Sin soporte de audio (entrada ni salida).
- Cobertura multilingue: no disponible en la informacion.

## Casos de uso

- Analisis de documentos largos en hardware AMD: con 262.144 tokens de contexto, el modelo puede procesar contratos, informes o bases de codigo extensas en una sola peticion sobre Strix Halo o R9700, sin segmentacion previa.
- Asistencia con imagenes en estaciones de trabajo AMD: la entrada multimodal `image_url` permite describir capturas, diagramas o documentos escaneados en flujos locales, adecuado cuando no se quiere enviar datos a la nube.
- Agentes con tool calling: la API compatible con OpenAI con `tools` y `tool_calls` permite integrar el modelo en frameworks de agentes existentes sin adaptadores, usando las 4 peticiones concurrentes para paralelizar subtareas.
- Razonamiento supervisado por lotes: el modo thinking activable resulta util para tareas de analisis o matematicas donde se acepta mayor latencia a cambio de trazas de razonamiento, ejecutandose en local sobre GPU AMD.
- Servicio interno de chat: el servidor `loom-serve` expone `/v1/chat/completions` en `127.0.0.1:8080`, lo que permite montar un endpoint interno para equipos de desarrollo con hardware AMD ya desplegado.
- Evaluacion de inferencia en AMD: el paquete sirve como banco de pruebas para medir kernels Loom frente a llama.cpp ROCm en Strix Halo y R9700, con puertas de correctitud (`golden`, `compare`, `vision`, `consistency`) definidas para validar la paridad.
- Prototipado con decodificacion especulativa: DFlash con profundidad 3 y el drafter separado permiten experimentar con aceleracion de decodificacion en GPUs AMD sin cambiar el checkpoint.

## Benchmarks y rendimiento

La model card publica una tabla comparativa Loom frente a llama.cpp ROCm para Strix Halo, pero las columnas de valores medidos de ambos motores aparecen como no medidas ("—"). Solo se incluyen los techos de roofline calculados por `loom-roofline`.

| Metrica (Strix Halo, gfx1151) | Techo roofline | Loom medido | llama.cpp medido |
|---|---|---|---|
| Decode tok/s, prompt corto | 97,9 | no medido | no medido |
| Decode tok/s, contexto 2k | 102,0 | no medido | no medido |
| Decode tok/s, contexto 32k | 78,3 | no medido | no medido |
| Prefill tok/s, documento 1k | 4243,3 | no medido | no medido |
| Prefill tok/s, documento 2k | 4223,4 | no medido | no medido |
| Prefill tok/s, documento 8k | 4107,8 | no medido | no medido |
| Prefill tok/s, documento 16k | 3963,1 | no medido | no medido |
| Prefill tok/s, documento 32k | 3702,4 | no medido | no medido |
| 4 streams, decode agregado tok/s | 166,9 | no medido | no medido |

Tasa de aceptacion del drafter medida en la sesion de roofline: 44 % en decode corto, 48 % a 2k y 41 % a 32k. Para la Radeon AI PRO R9700 los resultados "no se han vuelto a medir". No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el paquete se sirve con `--memory_bytes=32000000000` (32 GB) en ambos dispositivos objetivo; el checkpoint Q4_K_M de 9B mas el proyector F16 y el drafter deben caber en ese presupuesto.
- GPU soportadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se menciona soporte para GPUs NVIDIA ni otras AMD.
- GPU consumer: Strix Halo es un SoC con memoria unificada, por lo que el modelo cabe en un equipo consumer de gama alta con ese chip; en R9700 requiere la GPU profesional de 32 GB.
- Despliegue: `loom-serve` con `pip install "hrx-loom[hf]==0.1.0"` y `loom-fetch`; servidor OpenAI-compatible en `127.0.0.1:8080`. La model card no menciona soporte para vLLM, llama.cpp, Ollama ni TGI para este paquete (llama.cpp solo aparece como referencia de comparacion).
- Latencia y throughput: no disponibles; la tabla de rendimiento no contiene valores medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Runtime |
|---|---|---|---|---|---|
| unsloth-Qwen3.5-9B-loom (este paquete) | 9B | 262.144 | Si | Apache 2.0 | Loom (AMD gfx1151/gfx1201) |
| Qwen3.5-9B-GGUF (Unsloth, base) | 9B | no disponible en la informacion | Si (con proyector) | Apache 2.0 | llama.cpp y otros motores GGUF |
| AtomicChat/Qwen3.5-9B-DFlash-GGUF (drafter) | no disponible | no disponible | no disponible | no disponible | Drafter para decodificacion especulativa |

No se dispone de datos de rendimiento comparativo medido entre estas opciones en la informacion proporcionada; la comparativa se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Repositorio de staging: 0 descargas y 0 likes; creado y actualizado el mismo dia (14 de noviembre de 2026), sin senales de uso en produccion.
- Las puertas de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`) no se han vuelto a ejecutar sobre esta compilacion; la ultima pasada fue sobre una build anterior (sha256 `83c8cdf`).
- Los benchmarks de rendimiento publicados no contienen valores medidos de Loom ni de llama.cpp, solo techos de roofline; no es posible verificar las afirmaciones de rendimiento.
- La comparacion con llama.cpp no usa la misma configuracion de drafting en ambos motores (Loom con DFlash, llama.cpp sin drafting), lo que invalida una comparacion directa.
- Los resultados para la Radeon AI PRO R9700 no se han vuelto a medir.
- Hardware muy restringido: solo Strix Halo y R9700; no hay soporte declarado para CUDA ni otras GPUs.
- Salida maxima limitada a 4.096 tokens y concurrencia de 4 peticiones, lo que puede ser insuficiente para cargas de alta demanda.
- Idiomas soportados no declarados; no se puede confirmar calidad multilingue.
- Riesgo de alucinacion y sesgos del modelo base: no documentados en esta ficha; deben consultarse en la model card de Qwen3.5-9B.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del drafter `AtomicChat/Qwen3.5-9B-DFlash-GGUF`, no indicada en la informacion.
- La busqueda web no devolvio resultados relevantes: los enlaces encontrados corresponden a Loom (herramienta de grabacion de pantalla) y Loom (marca de ropa), sin relacion con este paquete.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-fun-staging/unsloth-Qwen3.5-9B-loom
- Modelo base GGUF: https://huggingface.co/unsloth/Qwen3.5-9B-GGUF
- Drafter de decodificacion especulativa: https://huggingface.co/AtomicChat/Qwen3.5-9B-DFlash-GGUF
- Runtime Loom: https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
