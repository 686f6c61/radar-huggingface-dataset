# loom-draft/unsloth-Llama-3.2-3B-Instruct-loom

## Resumen

`loom-draft/unsloth-Llama-3.2-3B-Instruct-loom` es un paquete de despliegue para la plataforma Loom (del ecosistema ROCm/AMD) que empaqueta el checkpoint GGUF sin modificar `Llama-3.2-3B-Instruct-Q4_K_M.gguf` de Unsloth. No se trata de un modelo nuevo ni de un fine-tuning: los pesos son los originales de Llama 3.2 3B Instruct de Meta, publicados por Unsloth en formato GGUF con cuantizacion Q4_K_M. El autor del paquete es `loom-draft`, que genera los programas `.loom` y la tarjeta `model.json` con la herramienta `loom-next`, sin intervencion de un LLM en el proceso de generacion.

El interes del paquete es la portabilidad: traduce el grafo de inferencia del GGUF a programas Loom ejecutables sobre GPUs AMD especificas, en concreto el AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB). Expone un servidor compatible con la API de OpenAI (`/v1/chat/completions`), soporta tool calling al estilo OpenAI y permite 131.072 tokens de contexto por peticion con 4 peticiones concurrentes.

Es relevante para quienes trabajan con hardware AMD y quieren ejecutar Llama 3.2 3B sin depender de llama.cpp, pero conviene subrayar que la model card indica explicitamente que las mediciones de rendimiento y las puertas de correccion (`kernel_tests`, `golden`, `compare`, `agent`, etc.) **no se han vuelto a medir** para este paquete. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2, pesos originales de Meta via Unsloth); empaquetado como programas Loom generados |
| Parametros totales | 3B (aproximado, segun el nombre del checkpoint Llama-3.2-3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible en la informacion proporcionada (Llama 3.2 soporta oficialmente 8 idiomas, pero la model card no lo detalla) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | GGUF de origen; empaquetado como `weights.loom`, `program/*.loom`, `model.json`, `tokenizer.json`, `llm_config.json`, `info.json` |

Otros datos de la tarjeta: `max_tokens` de salida 4.096 (preset), concurrencia de 4 peticiones, API compatible con OpenAI, tool calling habilitado. Sin soporte de razonamiento/thinking, decodificacion especulativa, entrada de imagen ni audio.

## Arquitectura y entrenamiento

El modelo subyacente es Llama 3.2 3B Instruct, un transformer decoder-only de Meta con 3.000 millones de parametros, alineado con instrucciones. El paquete no aporta informacion sobre el entrenamiento original (numero de tokens, composicion del dataset, RLHF/DPO); esos datos corresponden a la model card de Meta y no se reproducen aqui. El checkpoint utilizado es el GGUF Q4_K_M publicado por Unsloth, sin modificaciones.

La innovacion tecnica del paquete es el propio pipeline Loom: `loom-next` genera programas `.loom` a partir del GGUF y de `llm_config.json`, y `loom-serve` los ejecuta sobre GPUs AMD con opciones como `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU), `pool_backing=fixed` (pool de memoria pre-reservado) y `parameter_mode=preload` (carga de pesos en host). No hay fine-tuning, RLHF ni destilacion en este repositorio.

## Capacidades

- Generacion de texto conversacional e instrucciones en el estilo de Llama 3.2 3B Instruct.
- Tool calling / function calling al estilo OpenAI: campos `tools` y `tool_calls` en la API.
- Servidor HTTP con endpoint `/v1/chat/completions` compatible con OpenAI.
- Contexto largo por peticion: hasta 131.072 tokens.
- Concurrencia de 4 peticiones simultaneas.
- Salida maxima de 4.096 tokens por peticion (preset `max_tokens`).
- Sin modo thinking/razonamiento (`not applicable`).
- Sin decodificacion especulativa (`not applicable`).
- Sin entrada de imagen ni audio (`not applicable`).
- Capacidades multilingues: no detalladas en la informacion proporcionada.

## Casos de uso

- **Asistente conversacional local sobre GPU AMD**: desplegar `loom-serve` en Strix Halo o R9700 y conectar clientes compatibles con OpenAI mediante `curl` o SDKs, aprovechando el endpoint `/v1/chat/completions` sin adaptadores adicionales.
- **Agentes con tool calling en entornos AMD**: usar los campos `tools` y `tool_calls` para construir bucles multi-turno de llamadas a funciones (por ejemplo, consultas a APIs internas) en hardware AMD donde no se quiere depender de CUDA.
- **Procesamiento de documentos largos**: con 131.072 tokens de contexto por peticion, resumir o extraer informacion de contratos, informes o transcripciones que no caben en ventanas de 8k-32k.
- **Prototipado y evaluacion de pipelines Loom**: validar el flujo `loom-fetch` + `loom-serve` con un modelo pequeno y conocido antes de migrar a checkpoints mayores en el mismo ecosistema.
- **Backend de chat para herramientas internas**: servir un modelo de 3B cuantizado en Q4_K_M sobre una unica GPU de 32 GB (R9700) para equipos que necesitan inferencia on-premise con licencia Llama 3.2.
- **Banco de pruebas de correccion**: usar las puertas `golden`, `compare`, `agent` y `consistency` descritas en la model card para comparar la salida del paquete Loom contra la referencia de llama.cpp sobre el mismo GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) **no se han vuelto a medir** ("the results for this package are not yet re-measured"), y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured".

## Requisitos de hardware

- **GPU objetivo declaradas**: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- **VRAM estimada**: no disponible de forma explicita; el checkpoint es Q4_K_M de un modelo de 3B, por lo que el peso de los pesos ronda los 2 GB, pero la model card no publica cifras de memoria del pool.
- **Consumer GPU**: no se confirma compatibilidad con GPUs de consumo; solo se mencionan los dos aceleradores AMD anteriores.
- **Despliegue**: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve`. No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones de despliegue de este paquete (llama.cpp aparece solo como referencia de correccion).
- **Latencia y throughput**: no disponibles; la model card indica que no se han vuelto a medir.
- **Concurrencia**: 4 peticiones simultaneas segun la tabla de features.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| `loom-draft/unsloth-Llama-3.2-3B-Instruct-loom` | 3B | 131.072 | Paquete Loom (`.loom`, GGUF Q4_K_M de origen) | llama3.2 | Solo GPUs AMD Strix Halo / R9700; sin benchmarks re-medidos |
| `unsloth/Llama-3.2-3B-Instruct-GGUF` (modelo base) | 3B | 131.072 (heredado de Llama 3.2) | GGUF (Q4_K_M y otras) | llama3.2 | Ejecutable con llama.cpp, Ollama, etc.; no atado a hardware AMD |
| Llama-3.2-3B-Instruct (Meta, original) | 3B | 131.072 | safetensors | llama3.2 | Checkpoint de referencia; requiere runtime propio (vLLM, TGI, transformers) |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- **Sin evidencia de correccion**: todas las puertas de la model card (`golden`, `compare`, `agent`, `consistency`, `sampling`, `logits`, etc.) figuran como "not yet re-measured"; no hay garantia documentada de equivalencia con llama.cpp en este paquete.
- **Sin benchmarks de rendimiento**: no se han publicado cifras de latencia ni throughput para Strix Halo ni para R9700.
- **Hardware muy restringido**: solo se declaran compatibles gfx1151 (Strix Halo) y gfx1201 (R9700); no se mencionan otras GPUs.
- **Repositorio sin traccion**: 0 descargas y 0 likes en el momento de la consulta; creado y actualizado el mismo dia (2026-11-19), lo que sugiere un artefacto recien generado sin validacion comunitaria.
- **Sin fine-tuning**: los pesos son los originales de Llama 3.2 3B Instruct; no incorpora mejoras de dominio.
- **Riesgo de alucinacion**: inherente a un modelo de 3B; no se documentan mitigaciones especificas.
- **Idiomas**: la model card no detalla los idiomas soportados; la cobertura real dependera de Llama 3.2 3B Instruct.
- **Licencia Llama 3.2**: uso comercial permitido bajo los terminos de la Llama 3.2 Community License, con obligaciones de atribucion y restricciones de uso (por ejemplo, umbral de 700 millones de usuarios mensuales para licencia adicional). Verificar los terminos completos antes de produccion.
- **Dependencia del ecosistema Loom**: el paquete requiere `hrx-loom[hf]==0.2.0` y las herramientas `loom-fetch` / `loom-serve`; no es un GGUF portable a otros runtimes sin conversion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/unsloth-Llama-3.2-3B-Instruct-loom
- Modelo base (GGUF de Unsloth): https://huggingface.co/unsloth/Llama-3.2-3B-Instruct-GGUF
- Repositorio Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
