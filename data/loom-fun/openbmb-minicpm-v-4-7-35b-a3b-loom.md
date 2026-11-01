# loom-fun/openbmb-MiniCPM-V-4.7-35B-A3B-loom

## Resumen

`loom-fun/openbmb-MiniCPM-V-4.7-35B-A3B-loom` es un paquete de despliegue para Loom, no un modelo de pesos nuevos. Lo publica el usuario `loom-fun` y contiene programas `.loom` junto con una tarjeta `model.json` que describen cómo servir el checkpoint GGUF sin modificar `openbmb/MiniCPM-V-4.7-35B-A3B-gguf` (cuantizacion `Q4_K_M`), un modelo multimodal de la familia MiniCPM-V de OpenBMB.

El paquete se genero en un AMD Ryzen AI Max+ 395 "Strix Halo" mediante el flujo de trabajo `loom-skills`, y esta pensado para ejecutarse con `loom-serve` sobre `amdgpu`, exponiendo una API compatible con OpenAI en `127.0.0.1:8080` (`/v1/chat/completions`). Su relevancia es practica: facilita ejecutar un VLM de 35B totales con 3B activos (MoE) en hardware AMD integrado, sin necesidad de reempaquetar pesos ni de infraestructura CUDA.

La licencia declarada es Apache 2.0 y el repositorio no incluye los pesos: `loom-fetch` descarga el GGUF desde el repositorio base y lo verifica contra `model.json.lock`. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su tamano es de 0.0 GB, coherente con que solo contiene los programas y la tarjeta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del checkpoint base MiniCPM-V-4.7-35B-A3B; no se detalla en la informacion proporcionada) |
| Parametros totales | 35B (segun el nombre del modelo base) |
| Parametros activos | 3B (segun el nombre del modelo base, indica MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) en el checkpoint base referenciado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (los pesos no se incluyen en este repositorio; se descargan del repo base) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, los datos de entrenamiento ni el proceso de alineacion (RLHF/DPO) en la informacion proporcionada. El nombre del checkpoint base (`MiniCPM-V-4.7-35B-A3B`) sugiere un transformer con mezcla de expertos (MoE) de 35B parametros totales y 3B activos por token, orientado a tareas de vision-lenguaje, pero este dato no se confirma en la model card consultada.

Este repositorio no entrena ni modifica pesos: es un artefacto de empaquetado. La innovacion tecnica relevante es el formato Loom (programas `.loom` + `model.json` + `model.json.lock`), que permite instalar y verificar el GGUF de forma reproducible y servirlo sobre AMD ROCm mediante `loom-serve`, con una API compatible con OpenAI. El flujo de generacion se realizo en un Ryzen AI Max+ 395 "Strix Halo", lo que indica soporte para aceleracion en iGPU AMD de memoria unificada.

## Capacidades

- Generacion de texto y conversacion multimodal, heredadas del checkpoint base MiniCPM-V-4.7-35B-A3B (vision-lenguaje, segun la denominacion "V" del modelo).
- Servicio mediante API compatible con OpenAI (`/v1/chat/completions`), lo que facilita integracion con clientes y SDK existentes.
- Instalacion reproducible con verificacion de integridad mediante `model.json.lock`.
- Ejecucion en hardware AMD con `--device=amdgpu`.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local de un VLM en estaciones con AMD Strix Halo: usar `loom-fetch` y `loom-serve --device=amdgpu` para levantar un endpoint compatible con OpenAI en `127.0.0.1:8080`, aprovechando la memoria unificada del Ryzen AI Max+ 395 para cargar un modelo de 35B en Q4_K_M.
- Prototipado de asistentes con vision en entornos sin GPU NVIDIA: el paquete elimina la friccion de compilar y configurar el runtime, ya que `loom-serve` gestiona la carga del GGUF y la exposicion del API.
- Integracion con herramientas existentes del ecosistema OpenAI: al responder en `/v1/chat/completions`, se puede apuntar cualquier cliente compatible (por ejemplo, librerias de chat o frameworks de orquestacion) al servidor local sin cambios de codigo.
- Evaluacion comparativa de modelos multimodales en hardware AMD: el formato Loom permite intercambiar paquetes de modelos manteniendo el mismo procedimiento de instalacion y servicio, lo que simplifica pruebas A/B.
- Reproducibilidad en CI o laboratorio: `model.json.lock` verifica el GGUF descargado, lo que permite automatizar la provision de entornos de inferencia con integridad comprobada.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse en local sobre `127.0.0.1`, los datos no salen de la maquina, adecuado para procesar documentos o imagenes sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El checkpoint base es un GGUF `Q4_K_M` de 35B parametros totales; en una estimacion habitual de ~4.5-5 bits por peso, el archivo rondaria los 20-22 GB, aunque este dato no se confirma en la informacion proporcionada.
- GPU recomendadas: el paquete se genero y esta orientado a AMD Ryzen AI Max+ 395 "Strix Halo" con `--device=amdgpu`. No se indican otras GPU compatibles.
- Cabe en consumer GPU: no disponible. El hardware de referencia es una APU AMD con memoria unificada, no una GPU discreta de consumo.
- Opciones de despliegue: `loom-serve` (SDK `hrx-loom`, extra `hf`). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones detalladas de alternativas comparables.

| Modelo | Parametros | Contexto | Licencia | Formato de despliegue |
|---|---|---|---|---|
| openbmb/MiniCPM-V-4.7-35B-A3B (base) | 35B totales / 3B activos | no disponible | Apache 2.0 (segun este repo) | GGUF |
| loom-fun/openbmb-MiniCPM-V-4.7-35B-A3B-loom | 35B totales / 3B activos | no disponible | Apache 2.0 | Paquete Loom sobre GGUF Q4_K_M |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Este repositorio no contiene pesos: sin `loom-fetch` y acceso al repositorio base `openbmb/MiniCPM-V-4.7-35B-A3B-gguf`, el paquete no es funcional.
- La cuantizacion `Q4_K_M` implica perdida de precision respecto al checkpoint original; no se han publicado evaluaciones del impacto en calidad para este paquete.
- El soporte de hardware declarado se limita a AMD con `--device=amdgpu` y se genero en un Ryzen AI Max+ 395; no se garantiza funcionamiento en otras GPU o APUs.
- No se dispone de informacion sobre sesgos, tasas de alucinacion ni limitaciones idiomaticas del modelo base en la documentacion consultada.
- La licencia Apache 2.0 se declara en este repositorio, pero conviene verificar la licencia del checkpoint base antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en octubre de 2026; no hay evidencia de uso en produccion ni de mantenimiento continuado.
- La model card no documenta limites de contexto, idiomas ni capacidades de tool calling, por lo que no deben asumirse en produccion sin pruebas propias.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/loom-fun/openbmb-MiniCPM-V-4.7-35B-A3B-loom
- Checkpoint base: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B-gguf
- SDK Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
