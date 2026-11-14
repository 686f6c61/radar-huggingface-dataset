# loom-fun-staging/unsloth-gpt-oss-20b-loom

## Resumen

`loom-fun-staging/unsloth-gpt-oss-20b-loom` es un paquete de despliegue (no un modelo entrenado desde cero) para el checkpoint GGUF `gpt-oss-20b-Q4_K_M.gguf` de Unsloth, que a su vez es una cuantizacion del modelo `gpt-oss-20b` de OpenAI. El paquete lo publica la organizacion `loom-fun-staging` dentro del ecosistema Loom, un runtime de inferencia para GPUs AMD, y contiene programas `.loom` junto con una tarjeta `model.json` que permiten servir el modelo con el servidor `loom-serve`.

El objetivo es ofrecer una via de ejecucion del modelo gpt-oss-20b en hardware AMD concreto: la APU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El servidor expone una API compatible con OpenAI (`/v1/chat/completions`), con soporte de tool calling, modo de razonamiento siempre activo y una ventana de contexto de 131.072 tokens por peticion.

La relevancia es acotada: se trata de un artefacto de despliegue experimental (repo de 0.0 GB, 0 descargas, 0 likes, creado y actualizado el 2026-11-14), no de una publicacion de modelo. Su interes esta en la integracion con Loom sobre ROCm y en los datos de rendimiento frente a llama.cpp en Strix Halo, no en capacidades nuevas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer tipo mixture-of-experts (MoE), segun se deduce de la referencia a "this mixture-of-experts model" en la model card; detalles internos del modelo base no disponibles en la informacion proporcionada |
| Parametros totales | no disponible (el nombre comercial indica 20B, pero no se confirma en la informacion) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint `gpt-oss-20b-Q4_K_M.gguf`) empaquetado en formato Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

El paquete no aporta informacion sobre el entrenamiento del modelo base. La model card solo indica que se empaqueta el checkpoint GGUF `gpt-oss-20b-Q4_K_M.gguf` de Unsloth "sin modificar", por lo que no hay fine-tuning ni alteracion de pesos en este artefacto. La unica referencia arquitectonica explicita es que se trata de un modelo de mezcla de expertos (MoE), mencionada al describir el techo de roofline para cuatro flujos concurrentes.

La innovacion tecnica del paquete esta en el runtime Loom: kernels generados para gfx1151 y gfx1201, servidor con API OpenAI, espera activa configurable (`completion_spin_ns`) y un conjunto de puertas de correccion (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`) que comparan la salida contra una referencia de llama.cpp token a token. En esta version las puertas no se han vuelto a ejecutar (la ultima pasada fue sobre el build `sha256 32adc5e`). No se documenta decodificacion especulativa: la model card la marca como no aplicable porque el GGUF no incluye cabeza MTP ni hay drafter publicado para este modelo exacto.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" siempre activo.
- Control de esfuerzo de razonamiento mediante `reasoning_effort` con valores `low`, `medium` (por defecto) y `high`.
- Tool calling en formato OpenAI (`tools` y `tool_calls`), con soporte de bucles multi-turno de agentes.
- Servidor compatible con OpenAI en `/v1/chat/completions` sobre `127.0.0.1:8080`.
- Muestreo configurable: `temperature`, `top_p`, `top_k` y `seed`.
- Concurrencia de hasta 4 peticiones simultaneas.
- Limite de salida de 4.096 tokens por peticion (preset `max_tokens`).
- Sin entrada de imagen ni de audio (marcadas como no aplicables).
- Sin decodificacion especulativa.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Evaluacion de runtime en AMD: comparar Loom frente a llama.cpp ROCm con el mismo GGUF y las mismas peticiones en Strix Halo, usando las metricas de decode y prefill publicadas como referencia.
- Asistentes con contexto largo: la ventana de 131.072 tokens por peticion permite procesar documentos extensos (hasta 32k tokens documentados en las pruebas de prefill) en una sola llamada.
- Agentes con tool calling: el soporte de `tools`/`tool_calls` y la puerta `agent` (renderizado exacto del prompt, reutilizacion de historial y validez de las llamadas) lo hacen apto para prototipos de agentes multi-paso.
- Razonamiento con esfuerzo ajustable: usar `reasoning_effort=low` para tareas de baja latencia y `high` para problemas que requieren cadenas de razonamiento mas largas.
- Despliegue en estaciones de trabajo con Radeon AI PRO R9700: el paquete incluye instrucciones de servicio para gfx1201 con 32 GB, pensadas para entornos locales de desarrollo.
- Servicio local con API OpenAI: integrar el endpoint en aplicaciones existentes que ya consumen `/v1/chat/completions` sin cambiar el cliente.
- Procesamiento por lotes moderado: con 4 peticiones concurrentes y la puerta `consistency` (misma salida en concurrencia que en ejecucion aislada) se pueden cubrir cargas pequenas de inferencia.

## Benchmarks y rendimiento

Datos de la model card para Strix Halo (gfx1151). Las columnas de llama.cpp y Loom estan sin medir ("—"); solo se publican los valores de roofline (techo teorico del hardware a 216 GB/s y 59 TFLOP/s).

| Metrica | llama.cpp | Loom | Roofline | Loom % del roofline |
|---|---|---|---|---|
| Decode tok/s, prompt corto | — | — | 92,7 | — |
| Decode tok/s, contexto 2k | — | — | 90,7 | — |
| Decode tok/s, contexto 32k | — | — | 69,2 | — |
| Prefill tok/s, documento 1k | — | — | 9527,3 | — |
| Prefill tok/s, documento 2k | — | — | 9378,4 | — |
| Prefill tok/s, documento 8k | — | — | 8574,5 | — |
| Prefill tok/s, documento 16k | — | — | 7695,0 | — |
| Prefill tok/s, documento 32k | — | — | 6385,2 | — |
| 4 flujos, decode agregado tok/s | — | — | 359,7 | — |
| Decodificacion especulativa, tokens aceptados | n/a | n/a | n/a | n/a |

En Radeon AI PRO R9700 (gfx1201, 32 GB) la model card indica que los resultados "no se han vuelto a medir". No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM recomendada en el servicio: `--memory_bytes=28000000000` (28 GB) segun los comandos de la model card.
- GPU/APU soportadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Cabe en GPU de consumo: no disponible; el paquete esta orientado a las plataformas AMD indicadas y no se documenta soporte para GPUs de consumo.
- Despliegue: `pip install "hrx-loom[hf]==0.1.0"`, descarga con `loom-fetch` y servicio con `loom-serve`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete (llama.cpp solo aparece como referencia de comparacion).
- Latencia y throughput: solo se publican los techos de roofline de la tabla anterior; las mediciones reales de Loom y llama.cpp no estan disponibles en esta version.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| gpt-oss-20b (Loom, este paquete) | no disponible (20B por nombre) | 131.072 | GGUF Q4_K_M + Loom | Apache 2.0 | Runtime Loom para AMD Strix Halo y R9700 |
| unsloth/gpt-oss-20b-GGUF | no disponible (20B por nombre) | no disponible | GGUF | Apache 2.0 (heredada) | Checkpoint base sin modificar que empaqueta este repo |
| gpt-oss-20b (original de OpenAI) | no disponible (20B por nombre) | no disponible | no disponible | Apache 2.0 | Modelo base del que deriva la cuantizacion de Unsloth |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto experimental: repo de 0.0 GB, 0 descargas y 0 likes, creado y actualizado el 2026-11-14; no debe tratarse como una publicacion estable.
- Las puertas de correccion (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`) no se han vuelto a ejecutar sobre este paquete; la ultima pasada corresponde al build `sha256 32adc5e`.
- En Radeon AI PRO R9700 los resultados de rendimiento y correccion no se han vuelto a medir.
- No hay mediciones reales publicadas de decode ni prefill para Loom ni para llama.cpp en esta version; solo techos de roofline.
- Sin decodificacion especulativa: no hay cabeza MTP en el GGUF ni drafter publicado para este modelo exacto.
- Limite de salida de 4.096 tokens por peticion y concurrencia maxima de 4 peticiones.
- Sin soporte de imagen ni audio.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingue.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; aplican los del modelo base gpt-oss-20b.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del checkpoint base de Unsloth y del modelo original de OpenAI.
- El nombre "Loom" coincide con el servicio de grabacion de pantalla de Atlassian y con una marca de ropa; los resultados de busqueda web no son relevantes para este paquete.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-fun-staging/unsloth-gpt-oss-20b-loom
- Checkpoint base (Unsloth): https://huggingface.co/unsloth/gpt-oss-20b-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
