# loom-fun/unsloth-Qwen3.5-9B-loom

## Resumen

`loom-fun/unsloth-Qwen3.5-9B-loom` no es un repositorio de pesos al uso, sino un paquete Loom (programas `.loom` y una tarjeta `model.json`) que permite servir sin modificaciones el checkpoint GGUF `unsloth/Qwen3.5-9B-GGUF` en cuantizacion `Q4_K_M`. Ha sido generado por el flujo de fabricacion `loom-skills` sobre un AMD Ryzen AI Max+ 395 "Strix Halo" y se distribuye bajo licencia Apache 2.0.

Su propuesta de valor es el despliegue local reproducible: `loom-fetch` descarga los programas de este repositorio y el GGUF desde el repositorio original de unsloth, verificando la integridad contra `model.json.lock`; despues `loom-serve` expone un servidor en `127.0.0.1:8080` compatible con la API de OpenAI (`/v1/chat/completions`). Los pesos no estan incluidos en el repositorio.

La ficha es relevante en el contexto de APUs con memoria unificada como Strix Halo, que permiten ejecutar modelos de ~9B cuantizados a 4 bits sin GPU dedicada de NVIDIA. El repositorio no publica detalles tecnicos del modelo base (arquitectura, contexto, idiomas ni benchmarks).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no detalla la arquitectura del modelo base) |
| Parametros totales | ≈9 mil millones (segun el nombre del modelo; valor exacto no confirmado en la tarjeta) |
| Parametros activos | no aplicable (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M); los pesos no estan incluidos, se descargan de unsloth/Qwen3.5-9B-GGUF |
| Modelo base | unsloth/Qwen3.5-9B-GGUF |
| Contenido del repositorio | Paquete Loom: programas `.loom`, `model.json` y `model.json.lock` |
| Servidor incluido | `loom-serve` en `127.0.0.1:8080`, API estilo OpenAI |

## Arquitectura y entrenamiento

El paquete no altera el modelo: envuelve el checkpoint GGUF original de unsloth en cuantizacion Q4_K_M. Q4_K_M es una k-quant del ecosistema llama.cpp/GGUF que almacena la mayoria de los tensores en torno a 4,5-4,8 bits por peso y mantiene ciertos tensores criticos a precision superior, buscando un buen equilibrio entre tamano y calidad. No hay informacion sobre la arquitectura subyacente (densa o MoE), la longitud de contexto ni las tecnicas de atencion empleadas: estos datos deben consultarse, si existen, en la tarjeta del modelo base.

Sobre el entrenamiento (numero de tokens, composicion del dataset, RLHF/DPO) no se publica nada en este repositorio, lo cual es esperable al tratarse de un reempaquetado. La innovacion esta en la capa de despliegue: `model.json.lock` fija checksums para descargas verificadas, `loom-fetch` materializa los programas y los pesos, y `loom-serve` levanta un servidor con dispositivo `amdgpu` que expone un endpoint compatible con OpenAI, lo que permite integrar el modelo con clientes estandar sin codigo ad hoc.

## Capacidades

- Generacion de texto y chat mediante un endpoint compatible con la API de OpenAI (`/v1/chat/completions`), utilizable con clientes estandar (`openai-python`, `curl`, LangChain, etc.).
- Inferencia local sobre GPU de AMD mediante `loom-serve --device=amdgpu`, generada y probada sobre un Ryzen AI Max+ 395 "Strix Halo".
- Pesos en formato GGUF Q4_K_M, formato portabel del ecosistema llama.cpp.
- Despliegue reproducible: verificacion de integridad de los pesos contra `model.json.lock` durante la descarga.
- Tool calling, function calling, agentes, vision o audio: no disponible (el repositorio no documenta estas capacidades).
- Capacidades multilingues: no disponible (no constan idiomas en la tarjeta).

## Casos de uso

- Inferencia local en hardware AMD sin NVIDIA: en un Ryzen AI Max+ 395 con memoria unificada, el modelo se sirve con `--device=amdgpu`, ideal para equipos portatiles de gama alta sin GPU dedicada.
- API local compatible con OpenAI para desarrollo: basta apuntar `base_url` a `http://127.0.0.1:8080/v1` para prototipar chatbots, RAG o agentes sin coste por token ni dependencia de servicios externos.
- Asistentes privados con datos sensibles: al ejecutarse todo en local, el contenido de las conversaciones no sale de la maquina; util para redaccion de documentos confidenciales o entornos regulados.
- Despliegues reproducibles en laboratorio o edge: `model.json.lock` garantiza que todos los nodos descargan exactamente el mismo GGUF, lo que simplifica auditorias y reproducibilidad.
- Evaluacion de cuantizaciones: permite comparar en pruebas propias el comportamiento de Q4_K_M frente a otras cuantizaciones del mismo modelo publicadas por unsloth.
- Automatizacion por lotes: scripts en Python o bash que consumen el endpoint local para resumir, clasificar o transformar grandes volumenes de texto sin coste de API.
- Demos y formacion sin conexion: al depender solo de la maquina local, sirve para talleres y presentaciones offline de un chat funcional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Antes de asumir capacidades concretas (MMLU, HumanEval, GSM8K, etc.), conviene consultar la tarjeta del modelo base `unsloth/Qwen3.5-9B-GGUF`.

## Requisitos de hardware

- Memoria estimada: un modelo de ~9B en Q4_K_M ocupa aproximadamente 5-6 GB solo en pesos; con KV cache y sobrecargue de runtime, se recomienda disponer de al menos 8 GB de memoria unificada o VRAM (estimacion calculada a partir del tamano y la cuantizacion; el repositorio no publica cifras oficiales).
- Hardware objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" (APU con memoria unificada), via `loom-serve --device=amdgpu`.
- GPUs de consumo: por tamano, el GGUF Q4_K_M es manejable en GPUs de 8 GB o mas; el formato GGUF es en si compatible con backends llama.cpp sobre CPU, CUDA y Vulkan, aunque el flujo documentado en este repositorio es el de AMD.
- Despliegue: SDK Loom (`pip install "hrx-loom[hf]"`, seguido de `loom-fetch` y `loom-serve`); el servidor resultante se consume con cualquier cliente OpenAI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Contenido | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|
| loom-fun/unsloth-Qwen3.5-9B-loom | Paquete Loom (sin pesos) | GGUF Q4_K_M (referencia) | Apache 2.0 | Via `loom-fetch` + `loom-serve` |
| unsloth/Qwen3.5-9B-GGUF | Pesos GGUF | GGUF (Q4_K_M y otras, segun su tarjeta) | no disponible | Descarga directa en HuggingFace |

Comparativas de rendimiento con otros modelos de ~9B (parametros, contexto, benchmarks) no disponible: ni este repositorio ni la informacion de busqueda aportan esos datos.

## Limitaciones y advertencias

- El repositorio no incluye pesos: sin acceso a `unsloth/Qwen3.5-9B-GGUF` y al SDK Loom, el paquete no es funcional por si solo.
- Repositorio muy reciente (creado el 2026-10-28) con 0 descargas y 0 likes: sin historial comunitario ni validacion de terceros; la tooling puede ser inmadura.
- Q4_K_M es una cuantizacion con perdida: cabe esperar diferencias de calidad frente a fp16/bf16, especialmente en matematicas, codigo y razonamiento largo.
- Longitud de contexto, idiomas soportados, tool calling y capacidades multimodales no estan documentados; verificar el modelo base antes de asumir funcionalidades.
- Riesgo de alucinacion inherente a todo LLM: no usar como fuente unica en flujos criticos sin verificacion humana.
- La licencia declarada es Apache 2.0, que permite uso comercial; no se documentan restricciones adicionales en la tarjeta.
- El flujo documentado depende del SDK Loom (`hrx-loom`) y de la ruta `amdgpu`; en otro hardware habra que adaptar el despliegue al ecosistema llama.cpp directamente.

## Enlaces

- Tarjeta del modelo: https://huggingface.co/loom-fun/unsloth-Qwen3.5-9B-loom
- Modelo base con los pesos GGUF: https://huggingface.co/unsloth/Qwen3.5-9B-GGUF
- SDK Loom: https://github.com/ROCm/hrx-system
- Flujo de fabricacion loom-skills: https://github.com/loom-fun/loom-skills
- Paper, demo o blog: no disponible.
