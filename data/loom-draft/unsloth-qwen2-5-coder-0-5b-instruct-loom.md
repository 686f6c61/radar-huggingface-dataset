# loom-draft/unsloth-Qwen2.5-Coder-0.5B-Instruct-loom

## Resumen

`loom-draft/unsloth-Qwen2.5-Coder-0.5B-Instruct-loom` es un paquete de distribucion para el runtime AMD Loom, no un modelo entrenado desde cero. Empaqueta el checkpoint GGUF sin modificar `Qwen2.5-Coder-0.5B-Instruct-Q4_K_M.gguf` de Unsloth (derivado del Qwen2.5-Coder-0.5B-Instruct de Alibaba) junto con programas `.loom` generados por `loom-next` y una tarjeta `model.json`. El objetivo es ejecutar el modelo sobre las GPU AMD Ryzen AI Max+ 395 ("Strix Halo", gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB) mediante `loom-serve`, exponiendo una API compatible con OpenAI.

El modelo subyacente es un transformer decoder-only de 0,5 mil millones de parametros, especializado en generacion de codigo, con una ventana de contexto de 32.768 tokens por peticion segun la tarjeta. El paquete anade soporte de tool calling estilo OpenAI, concurrencia de 4 peticiones y un limite de 4.096 tokens de salida por preset. No incorpora modo de razonamiento, decodificacion especulativa, vision ni audio.

La relevancia de esta ficha es acotada: se trata de un artefacto de despliegue para hardware AMD concreto, con cero descargas y cero likes en el momento de la consulta, y cuyas mediciones de rendimiento y puertas de correccion aparecen como "not yet re-measured" en la propia model card. Cualquier evaluacion de calidad debe remitirse al modelo base de Qwen/Unsloth, no a este paquete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-0.5B-Instruct) |
| Parametros totales | 0,5 mil millones (segun nombre del checkpoint base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens por peticion (segun la tarjeta del paquete) |
| Tipos de cuantizacion | Q4_K_M (GGUF empaquetado) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M), empaquetado como programas `.loom` y `weights.loom` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0`, `loom-fetch` + `loom-serve` |

## Arquitectura y entrenamiento

La arquitectura corresponde al checkpoint original Qwen2.5-Coder-0.5B-Instruct: un transformer decoder-only denso de aproximadamente 0,5 mil millones de parametros, ajustado por instrucciones por el equipo de Qwen y redistribuido en GGUF por Unsloth. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF o DPO; esos datos deben consultarse en la model card del modelo base.

La aportacion tecnica de este paquete no esta en el entrenamiento sino en el empaquetado: `loom-next` genera kernels y programas `.loom` a partir del GGUF sin intervencion de un LLM en el bucle, y `loom-serve` los ejecuta sobre ROCm en las GPU AMD indicadas. La tarjeta menciona opciones de despliegue como `completion_spin_ns=4294967295` (espera activa de finalizaciones en GPU), `--pool_backing=fixed` (pool de memoria comprometido por adelantado) y `--parameter_mode=preload` (carga anticipada de pesos en host). No hay decodificacion especulativa ni atencion lineal declaradas.

## Capacidades

- Generacion de texto y codigo en el modelo base Qwen2.5-Coder-0.5B-Instruct.
- Tool calling estilo OpenAI: acepta `tools` y emite `tool_calls`.
- Bucle de agente multi-turno con tool calling (existe una puerta de validacion `agent` y `agent_think_off` en la tarjeta, aunque sin mediciones registradas).
- Servidor HTTP con API compatible OpenAI (`/v1/chat/completions`).
- Concurrencia de hasta 4 peticiones simultaneas.
- Ventana de contexto de 32.768 tokens por peticion.
- Sin modo de razonamiento o thinking (marcado "not applicable").
- Sin entrada de imagen ni audio.
- Sin decodificacion especulativa.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Autocompletado de codigo en IDE sobre estaciones de trabajo AMD: el modelo de 0,5B en Q4_K_M es suficientemente pequeno para servirse en local via `loom-serve` y responder con baja latencia en un endpoint compatible con OpenAI.
- Asistente de refactorizacion en lote: procesar ficheros de codigo uno a uno con prompts acotados, aprovechando los 32.768 tokens de contexto para incluir el fichero completo y las instrucciones de estilo.
- Generacion de tests unitarios: dado un modulo y su firma, producir casos de prueba en el lenguaje del proyecto; el soporte de tool calling permite encadenar la escritura del fichero mediante una herramienta externa.
- Agente de CI ligero: integrar el endpoint en un pipeline para tareas de triaje (clasificar fallos de build, resumir diffs) con llamadas a herramientas para consultar logs o abrir issues.
- Chat de soporte tecnico para documentacion de API: desplegar un asistente que responda sobre la documentacion interna, con contexto suficiente para incluir fragmentos extensos de referencia.
- Prototipado y evaluacion del runtime Loom: usar este paquete como banco de pruebas para validar kernels generados, comparar salidas contra llama.cpp con la puerta `golden` y medir latencia en Strix Halo o R9700.
- Educacion y demos offline: ejecutar un modelo de codigo en hardware AMD de escritorio sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas plataformas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; un GGUF Q4_K_M de 0,5B ocupa del orden de 0,3-0,4 GB en pesos, pero la tarjeta no publica cifras de memoria del pool.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPU consumer: no confirmada; el paquete esta generado para las arquitecturas AMD indicadas y no se menciona soporte para otras.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para materializar el paquete y `loom-serve` para servir el endpoint OpenAI.
- Opciones de ejecucion recomendadas en la tarjeta: `--device=amdgpu://?completion_spin_ns=4294967295`, `--pool_backing=fixed`, `--parameter_mode=preload`.
- Latencia y throughput: no disponibles; las filas de rendimiento no han sido re-medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| Este paquete (Qwen2.5-Coder-0.5B-Instruct Q4_K_M + Loom) | 0,5B | 32.768 | Apache 2.0 | GGUF empaquetado, `loom-serve` sobre AMD | Mediciones y puertas de correccion pendientes |
| Qwen2.5-Coder-0.5B-Instruct (original) | 0,5B | 32.768 (segun modelo base) | Apache 2.0 | safetensors / GGUF, transformers, llama.cpp, vLLM | Referencia de calidad del modelo subyacente |
| Qwen2.5-Coder-1.5B-Instruct | 1,5B | 32.768 (segun modelo base) | Apache 2.0 | safetensors / GGUF | Mayor capacidad a costa de mas memoria y latencia |
| StarCoder2-3B | 3B | 16.384 (segun modelo base) | BigCode OpenRAIL-M | safetensors / GGUF | Licencia con restricciones de uso |

Los datos de contexto y licencia de los modelos comparados se ofrecen como referencia general; no se han verificado contra la informacion proporcionada en esta busqueda.

## Limitaciones y advertencias

- Modelo de 0,5B: capacidad limitada para razonamiento complejo, matemáticas y tareas de codigo de varios pasos; el rendimiento debe validarse contra el modelo base.
- Riesgo de alucinacion inherente a modelos pequenos de codigo: puede generar APIs, funciones o imports inexistentes.
- Sin mediciones de correccion registradas: todas las puertas (`golden`, `compare`, `consistency`, `agent`, etc.) aparecen como "not yet re-measured", por lo que no hay evidencia publicada de equivalencia con llama.cpp.
- Sin datos de rendimiento publicados para las dos GPU objetivo.
- Soporte de idiomas no declarado en la informacion disponible.
- El paquete esta atado a hardware AMD concreto (gfx1151, gfx1201) y a la version `hrx-loom==0.2.0`; no se garantiza portabilidad a otras GPU o versiones del runtime.
- Cero descargas y cero likes en el momento de la consulta: artefacto sin validacion por parte de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base y del empaquetado deben revisarse por separado.
- Los resultados de busqueda web disponibles no son relevantes: corresponden a Loom (herramienta de grabacion de video) y Loom (marca de ropa), no al runtime AMD Loom.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/unsloth-Qwen2.5-Coder-0.5B-Instruct-loom
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Qwen2.5-Coder-0.5B-Instruct-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador `loom-next`: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
