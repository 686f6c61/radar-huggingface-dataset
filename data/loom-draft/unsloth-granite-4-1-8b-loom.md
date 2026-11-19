# loom-draft/unsloth-granite-4.1-8b-loom

## Resumen

`loom-draft/unsloth-granite-4.1-8b-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `unsloth/granite-4.1-8b-GGUF`, concretamente la cuantizacion `granite-4.1-8b-Q4_K_M.gguf`. No se trata de un modelo entrenado ni afinado por el autor, sino de un artefacto de empaquetado que traduce los pesos GGUF de Granite 4.1 8B a programas Loom ejecutables sobre GPUs AMD mediante el runtime `loom-serve` (paquete `hrx-loom`). El autor es `loom-draft` y el paquete se genero con la herramienta `loom-next` sin intervencion de un LLM en el proceso.

El modelo subyacente es Granite 4.1 8B, de IBM, distribuido originalmente por Unsloth en formato GGUF. El paquete Loom esta orientado especificamente a dos aceleradores AMD: la APU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB). Su relevancia radica en que ofrece una via de ejecucion nativa en el stack ROCm/AMD para un modelo de 8B con ventana de contexto de 131.072 tokens y soporte de tool calling, sin depender de llama.cpp.

El repositorio es muy reciente (creado el 19 de noviembre de 2026), no registra descargas ni likes, y las mediciones de rendimiento y las compuertas de correccion aparecen como "not yet re-measured" en la model card, por lo que no hay evidencia publicada de rendimiento ni de fidelidad numerica para este paquete concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo subyacente: Granite 4.1 8B; el paquete Loom no detalla la arquitectura interna) |
| Parametros totales | no disponible (el identificador indica 8B; no se confirma en la informacion) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF de origen) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF de origen (`granite-4.1-8b-Q4_K_M.gguf`); empaquetado en programas `.loom` y `weights.loom` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` |
| Tool calling | Si (estilo OpenAI `tools` y `tool_calls`) |
| Modo thinking / reasoning | No aplicable |
| Decodificacion especulativa | No aplicable |
| Entrada de imagen / audio | No aplicable |
| Muestreo (sampling) | No determinado |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado, sino un paquete de despliegue. La model card describe un conjunto de programas Loom (`program/*.loom`, `weights.loom`) generados a partir de los pesos GGUF `granite-4.1-8b-Q4_K_M.gguf` mediante la herramienta `loom-next`, junto con `tokenizer.json`, `llm_config.json`, `info.json` y `REPORT.md`. El runtime objetivo es `loom-serve` (paquete `hrx-loom==0.2.0`), que expone una API compatible con OpenAI y ejecuta los kernels generados sobre GPUs AMD mediante ROCm.

No se proporciona informacion sobre la arquitectura interna del modelo Granite 4.1 8B subyacente (tipo de transformer, atencion, composicion del dataset de entrenamiento, numero de tokens, uso de RLHF/DPO u otras innovaciones). Tampoco se detalla el proceso de generacion de los kernels Loom mas alla de indicar que se realizo sin un LLM en el bucle. La model card incluye un conjunto de compuertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida contra una referencia de llama.cpp registrada sobre el mismo GGUF, pero todas aparecen como "not yet re-measured" para ambas GPUs objetivo.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling en estilo OpenAI, con soporte de `tools` y `tool_calls`, segun la tabla de caracteristicas del paquete.
- Soporte de contexto largo: hasta 131.072 tokens por peticion.
- Concurrencia de hasta 4 peticiones simultaneas.
- Salida maxima de 4.096 tokens por peticion (preset `max_tokens`).
- Modo thinking / reasoning: no aplicable en este paquete.
- Decodificacion especulativa: no aplicable.
- Entrada de imagen: no aplicable.
- Entrada/salida de audio: no aplicable.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Muestreo (temperature, top_k, seed): estado "not determined" en la tabla de caracteristicas.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo AMD: el paquete esta pensado para ejecutarse sobre Strix Halo o Radeon AI PRO R9700 con `loom-serve`, de modo que un equipo con hardware AMD puede servir un chat compatible con OpenAI sin depender de CUDA ni de llama.cpp.
- Procesamiento de documentos largos: con 131.072 tokens de contexto por peticion, el modelo puede ingerir contratos, informes o bases de codigo extensas en una sola llamada para tareas de resumen, extraccion o preguntas y respuestas sobre el contenido.
- Automatizacion con herramientas (tool calling): la API admite `tools` y `tool_calls` en estilo OpenAI, lo que permite conectar el modelo a funciones externas (consultas a bases de datos, APIs HTTP, calculadoras) en flujos de agente de varios pasos.
- Backend de desarrollo y pruebas: al exponer un endpoint compatible con OpenAI en `127.0.0.1:8080`, sirve como sustituto local de APIs en la nube para probar aplicaciones de chat o de agentes antes de desplegarlas en produccion.
- Atencion al cliente en local: con concurrencia de 4 peticiones y contexto largo, puede gestionar conversaciones multi-turno con historial extenso en un despliegue on-premise sobre hardware AMD.
- Prototipado en entornos ROCm: util para equipos que ya trabajan con el stack ROCm y quieren evaluar un modelo de 8B cuantizado en Q4_K_M mediante el runtime Loom, sin necesidad de convertir pesos ni escribir kernels propios.
- Inferencia en GPU de 32 GB: en la Radeon AI PRO R9700 (32 GB) el paquete Q4_K_M de un modelo de 8B deja margen de VRAM para contexto largo y concurrencia moderada, adecuado para servir cargas de trabajo pequenas o medianas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las compuertas de correccion aparecen sin ejecucion registrada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el paquete usa Q4_K_M (cuantizacion de 4 bits) sobre un modelo de 8B, y el preset reserva un pool de memoria fijo (`--pool_backing=fixed`) cuyo tamano no se detalla en la informacion.
- GPUs objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPU de consumo: no disponible; el paquete esta generado para las dos plataformas AMD indicadas.
- Despliegue: runtime `loom-serve` del paquete `hrx-loom==0.2.0`, instalado con `pipx install "hrx-loom[hf]==0.2.0"`; descarga con `loom-fetch huggingface:loom-draft/unsloth-granite-4.1-8b-loom:chat --materialize=copy --output=granite-4.1-8b`.
- Opciones de ejecucion: `--device=amdgpu://?completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU), `--pool_backing=fixed` (reserva fija del pool de memoria) y `--parameter_mode=preload` (carga anticipada de pesos en host).
- Latencia y throughput: no disponibles; no se han publicado mediciones para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `loom-draft/unsloth-granite-4.1-8b-loom` | 8B (segun identificador; no confirmado) | 131.072 tokens | GGUF Q4_K_M empaquetado en Loom; runtime `loom-serve` sobre AMD ROCm | Apache 2.0 | Hugging Face, 0 descargas |
| `unsloth/granite-4.1-8b-GGUF` (modelo base) | 8B (segun identificador) | no disponible | GGUF; runtime llama.cpp y compatibles | Apache 2.0 (heredada) | Hugging Face (repositorio base) |
| Modelos de 8B en GGUF para llama.cpp (generico) | ~8B | variable | GGUF; llama.cpp, Ollama, etc. | variable | amplia |

La comparativa se limita al modelo base del que deriva el paquete, ya que no se dispone de datos de rendimiento ni de otros paquetes Loom equivalentes en la informacion proporcionada. No se dispone de cifras de benchmarks para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- No es un modelo entrenado ni afinado: es un paquete de despliegue generado a partir de un GGUF existente; cualquier limitacion del modelo Granite 4.1 8B subyacente se hereda sin cambios.
- Ausencia de evidencia de rendimiento y correccion: todas las compuertas de correccion y las mediciones frente a llama.cpp figuran como "not yet re-measured" para ambas GPUs objetivo, por lo que no hay validacion publicada de fidelidad numerica ni de velocidad.
- Estado de muestreo indeterminado: la tabla de caracteristicas marca "sampling" como "not determined", lo que impide confirmar el comportamiento de `temperature`, `top_k` y `seed`.
- Sin modo thinking, decodificacion especulativa, vision ni audio: estas capacidades figuran como no aplicables en el paquete.
- Dependencia de hardware AMD concreto: el paquete esta generado para gfx1151 y gfx1201; no se documenta compatibilidad con otras GPUs AMD ni con NVIDIA.
- Idiomas soportados no disponibles: no se puede confirmar el alcance multilingue del modelo en esta ficha.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; deben evaluarse sobre el modelo Granite 4.1 8B original.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y del tokenizer distribuidos en el paquete.
- Repositorio sin adopcion: 0 descargas y 0 likes en la fecha de consulta, sin senales de uso en produccion.
- Los resultados de busqueda web proporcionados corresponden a servicios y marcas no relacionados (Loom como grabador de pantalla y Loom como marca de ropa); no aportan informacion tecnica sobre este paquete.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/unsloth-granite-4.1-8b-loom
- Modelo base GGUF: https://huggingface.co/unsloth/granite-4.1-8b-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
