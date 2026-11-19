# loom-draft/unsloth-Ministral-3-8B-Reasoning-2512-loom

## Resumen

Este repositorio no contiene un modelo entrenado por el autor, sino un paquete de despliegue en formato Loom (`.loom` y `model.json`) generado con la herramienta `loom-next` a partir del checkpoint GGUF sin modificar `Ministral-3-8B-Reasoning-2512-Q4_K_M.gguf` de `unsloth/Ministral-3-8B-Reasoning-2512-GGUF`. Es decir, los pesos son los de Ministral 3 8B Reasoning en cuantizacion Q4_K_M; lo que anade `loom-draft` es un runtime especifico para GPUs AMD (Ryzen AI Max+ 395 "Strix Halo", gfx1151, y Radeon AI PRO R9700, gfx1201) que expone una API compatible con OpenAI.

El modelo subyacente es un transformer de 8.000 millones de parametros de Mistral AI, afinado para razonamiento y distribuido por Unsloth en GGUF. La relevancia de este paquete concreto es la portabilidad a hardware AMD consumer y profesional mediante Loom, con un contexto declarado de 108.544 tokens por peticion y 4 peticiones concurrentes, sin dependencia de llama.cpp en tiempo de ejecucion.

La ficha tecnica del modelo base (arquitectura exacta, composicion del dataset, benchmarks) no esta documentada en la informacion disponible; este repositorio solo aporta metadatos de empaquetado y despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Ministral-3-8B-Reasoning-2512 de Mistral AI, transformer) |
| Parametros totales | 8.000 millones (segun nombre del checkpoint) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 108.544 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico incluido en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF de origen, empaquetado como programas Loom (`program/*.loom`, `weights.loom`) + `tokenizer.json` + `llm_config.json` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` en `127.0.0.1:8080` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento

No hay informacion en este repositorio sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni las fases de alineamiento (RLHF/DPO) del modelo base. El autor indica explicitamente que el checkpoint GGUF se usa "sin modificar"; por tanto, cualquier detalle de entrenamiento corresponde a la model card de `unsloth/Ministral-3-8B-Reasoning-2512-GGUF` o de Mistral AI, no a este repositorio.

La innovacion tecnica de este paquete es el pipeline de generacion Loom: `loom-next` produce kernels y programas (`.loom`) especificos para las arquitecturas AMD gfx1151 y gfx1201 a partir del GGUF, con un `model.json` que fija los ficheros fuente mediante sha256 (verificado por `loom-fetch`). El despliegue usa `--pool_backing=fixed` (pool de memoria comprometido por adelantado) y `--parameter_mode=preload` (carga de pesos en host), y permite espera activa de finalizaciones de GPU con `completion_spin_ns=4294967295`.

## Capacidades

- Generacion de texto conversacional via API compatible con OpenAI (`/v1/chat/completions`).
- Razonamiento: el checkpoint base es un modelo afinado para reasoning (`Reasoning` en el nombre), aunque el paquete marca la fila "reasoning / thinking" como "not applicable" en la tabla de features de Loom.
- Tool calling: marcado como "not applicable" en este paquete.
- Decodificacion especulativa: marcada como "not applicable".
- Entrada de imagen: no soportada por Loom, aunque el modelo upstream la tiene segun la model card ("not supported by Loom (the upstream model has it)").
- Audio: no aplica.
- Multilingue: no disponible en la informacion.
- Muestreo: estado "not determined" (temperature, top_k y seed no verificados aun).
- Concurrencia de 4 peticiones con contexto de 108.544 tokens por peticion y salida maxima de 4.096 tokens.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo AMD: el paquete sirve un endpoint compatible con OpenAI en `127.0.0.1:8080`, lo que permite conectar clientes existentes sin adaptadores y mantener los datos en la maquina.
- Procesamiento de documentos largos: con 108.544 tokens de contexto por peticion se pueden ingerir contratos, informes o transcripciones extensas en una sola llamada, util para resumen y extraccion de datos.
- Razonamiento sobre codigo y analisis tecnico: el checkpoint base esta afinado para reasoning, adecuado para explicar trazas, revisar parches o razonar sobre errores en un entorno de desarrollo local con GPU AMD.
- Despliegue en hardware consumer de gama alta: al estar empaquetado para Strix Halo (Ryzen AI Max+ 395), encaja en equipos compactos sin GPU discreta, para prototipos y demos internas.
- Servicio interno con concurrencia limitada: las 4 peticiones concurrentes y la salida maxima de 4.096 tokens permiten atender a un equipo pequeno con latencia controlada, por ejemplo en tareas de soporte interno o generacion de borradores.
- Evaluacion y benchmarking de runtimes AMD: el paquete incluye puertas de correccion (`kernel_tests`, `golden`, `compare`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) que permiten comparar la salida de Loom contra llama.cpp sobre el mismo GGUF.
- Integracion en pipelines de CI para validar kernels: los programas `.loom` generados y las puertas de correccion sirven para detectar regresiones numericas en hardware gfx1151/gfx1201 antes de desplegar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de correccion figuran como "not yet re-measured" en ambas GPUs.

| Gate de correccion | Strix Halo | Radeon AI PRO R9700 |
|---|---|---|
| `kernel_tests` | no medido | no medido |
| `golden` | no medido | no medido |
| `compare` | no medido | no medido |
| `vision` | no medido | no medido |
| `consistency` | no medido | no medido |
| `spec` | no medido | no medido |
| `agent` | no medido | no medido |
| `agent_think_off` | no medido | no medido |
| `sampling` | no medido | no medido |
| `logits` | no medido | no medido |
| `decision` | no medido | no medido |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M de 8B (aproximadamente 5 GB de pesos en disco, sin contar overhead de runtime, pool fijo y cache KV para 108.544 tokens).
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPUs consumer: solo se documentan las dos plataformas AMD anteriores; no se menciona soporte para RTX 4090, A100 ni H100.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este paquete.
- Latencia y throughput: no disponibles (mediciones pendientes de re-ejecucion segun el autor).
- Ajustes de memoria: `--pool_backing=fixed` compromete el pool por adelantado; `--parameter_mode=preload` cambia solo la carga de pesos en host.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| Este paquete (Ministral-3-8B-Reasoning-2512 Q4_K_M, Loom) | 8B | 108.544 tokens | Loom (desde GGUF) | Apache 2.0 | `loom-serve` en gfx1151/gfx1201 |
| `unsloth/Ministral-3-8B-Reasoning-2512-GGUF` (base) | 8B | no disponible | GGUF | Apache 2.0 (segun este repo) | llama.cpp y otros runtimes GGUF |
| Ministral-3-8B-Reasoning-2512 (original de Mistral AI) | 8B | no disponible | safetensors (no confirmado) | Apache 2.0 (segun este repo) | vLLM, TGI, transformers (no confirmado) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Repositorio sin adopcion: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion.
- Paquete de despliegue, no modelo nuevo: cualquier limitacion del modelo base (sesgos, alucinacion, calidad en idiomas distintos del ingles) aplica sin cambios.
- Sin benchmarks ni puertas de correccion medidas: no hay evidencia publicada de que la salida coincida con llama.cpp en este paquete concreto.
- Cobertura de hardware muy restringida: solo Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no se documenta soporte para GPUs NVIDIA ni otras AMD.
- Tool calling, decodificacion especulativa y modo thinking marcados como "not applicable" en Loom, aunque el modelo base sea de razonamiento.
- Entrada de imagen no soportada por Loom pese a que el modelo upstream la tiene.
- Muestreo no verificado ("not determined"): temperature, top_k y seed no estan validados contra la referencia.
- Limite de salida de 4.096 tokens por peticion y 4 peticiones concurrentes; puede ser insuficiente para cargas de produccion.
- Licencia Apache 2.0 declarada en este repositorio; conviene verificar los terminos en la model card original de Mistral AI antes de uso comercial.
- El contenido de la busqueda web devuelta corresponde a productos no relacionados (Loom, la herramienta de grabacion de video, y la marca de ropa Loom), por lo que no aporta informacion tecnica sobre este modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/unsloth-Ministral-3-8B-Reasoning-2512-loom
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Ministral-3-8B-Reasoning-2512-GGUF
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Model card de Mistral AI (Ministral): no disponible en la informacion proporcionada
