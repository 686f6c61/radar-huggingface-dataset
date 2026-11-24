# loom-draft/unsloth-Qwen3.5-4B-loom

## Resumen

`loom-draft/unsloth-Qwen3.5-4B-loom` es un paquete de despliegue para el stack AMD Loom, no un modelo entrenado desde cero. Empaqueta el checkpoint GGUF sin modificar `unsloth/Qwen3.5-4B-GGUF` (concretamente `Qwen3.5-4B-Q4_K_M.gguf`) junto con programas `.loom` y una tarjeta `model.json`, generados mediante el flujo de trabajo `loom-skills`. El objetivo es servir el modelo Qwen3.5-4B en GPUs AMD concretas con un runtime propio (`loom-serve`, instalable via `hrx-loom[hf]==0.2.0`).

El modelo subyacente es Qwen3.5-4B, un transformer multimodal de 4.000 millones de parametros con capacidades de vision (`image-text-to-text`), segun la etiqueta de pipeline del repositorio. El paquete incluye presets especificos por hardware: Ryzen AI Max+ 395 "Strix Halo" (gfx1151), Radeon AI PRO R9700 (gfx1201, 32 GB), gfx1201 de 16 GB (RX 9070 XT, RX 9070), Radeon 890M (gfx1150) y Radeon 860M (gfx1152). Cada preset ajusta el presupuesto de memoria y, en consecuencia, la longitud de contexto servible por peticion.

Su relevancia es acotada pero tecnica: documenta el despliegue de un modelo de 4B cuantizado en Q4_K_M sobre GPUs AMD de consumo y profesionales, con decodificacion especulativa (`speculative-decoding`, `dflash`) y presupuestos de memoria explicitos que limitan el contexto nativo de 262.144 tokens a valores entre 40.960 y 151.552 tokens segun la GPU. No aporta pesos nuevos ni fine-tuning propio; es una capa de empaquetado y serving.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5-4B; el paquete no detalla la arquitectura interna) |
| Parametros totales | 4B (segun el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens nativos; servible por peticion: 151.552 (gfx1201 16 GB), 63.488 (gfx1150), 40.960 (gfx1152) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (Q4_K_M), empaquetado como programas `.loom` + `model.json` |
| Modelo base | unsloth/Qwen3.5-4B-GGUF |
| Runtime | loom-serve (hrx-loom[hf]==0.2.0) |
| Modalidad | image-text-to-text (vision) |
| Decodificacion especulativa | si (`speculative-decoding`, `dflash`) |

## Arquitectura y entrenamiento

El paquete no documenta la arquitectura interna del modelo base; solo se sabe que Qwen3.5-4B es un transformer multimodal de 4B parametros con entrada de imagen y texto, distribucion Q4_K_M en GGUF. No hay informacion sobre tokens de entrenamiento, composicion del dataset ni fases de RLHF/DPO en la documentacion disponible.

La innovacion tecnica del paquete reside en el runtime Loom, no en el modelo: `loom-serve` permite fijar un presupuesto de memoria (`--memory_bytes`), tamano de slabs para estado y pesos (`--state_slab_bytes`, `--weight_slab_bytes`), modo de precarga de parametros (`--parameter_mode=preload`) y espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`). Incluye decodificacion especulativa mediante `dflash`. El paquete se genera con el flujo `loom-skills` y se distribuye con `loom-fetch`.

## Capacidades

- Generacion de texto y razonamiento con un modelo de 4B parametros.
- Procesamiento de imagen y texto (`image-text-to-text`), segun la etiqueta de pipeline.
- Contexto nativo de 262.144 tokens, con contexto servible reducido segun la GPU (40.960-151.552 tokens).
- Decodificacion especulativa (`speculative-decoding`, `dflash`) para acelerar la generacion.
- Despliegue en GPUs AMD especificas mediante presets preconfigurados.
- Soporte de tool calling, agentes o modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Inferencia local en GPUs AMD de consumo: el preset `chat-16gb` para RX 9070 XT y RX 9070 permite servir el modelo con hasta 151.552 tokens de contexto por peticion, adecuado para asistentes locales con documentos largos.
- Despliegue en equipos con APU Strix Halo: el preset para Ryzen AI Max+ 395 permite ejecutar un modelo multimodal de 4B en una APU sin GPU dedicada, util para prototipos y estaciones de trabajo compactas.
- Procesamiento de imagenes y texto en el borde: la modalidad `image-text-to-text` permite tareas de descripcion de imagenes o respuesta a preguntas visuales en hardware AMD local.
- Servicio de chat con contexto largo en Radeon AI PRO R9700: con 32 GB de VRAM, el preset gfx1201 permite servir el modelo con contexto amplio para resumen de documentos extensos.
- Evaluacion de la cadena de herramientas Loom: el paquete sirve como referencia (`loom-reference-set`) para validar `loom-fetch` y `loom-serve` en distintas GPUs AMD antes de desplegar modelos mayores.
- Integracion en pipelines de investigacion sobre decodificacion especulativa: permite medir el efecto de `dflash` y de los presupuestos de memoria en el throughput real sobre hardware AMD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona mediciones de rendimiento asociadas a los comandos de serving, pero no incluye cifras en el contenido proporcionado.

## Requisitos de hardware

- VRAM: el paquete fija presupuestos de memoria explicitos: 15.000.000.000 bytes (15 GB) para gfx1201 de 16 GB y 14.000.000.000 bytes (14 GB) para Radeon 890M (gfx1150). Para Strix Halo, R9700 y 860M se usan presets sin cifra explicita en el texto disponible.
- GPUs soportadas: Ryzen AI Max+ 395 "Strix Halo" (gfx1151), Radeon AI PRO R9700 (gfx1201, 32 GB), Radeon gfx1201 16 GB (RX 9070 XT, RX 9070), Radeon 890M (gfx1150) y Radeon 860M (gfx1152).
- GPU de consumo: si, en RX 9070 XT y RX 9070 (16 GB) con contexto servible de hasta 151.552 tokens.
- Despliegue: exclusivamente mediante `loom-serve` del paquete `hrx-loom[hf]==0.2.0`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| loom-draft/unsloth-Qwen3.5-4B-loom | 4B | 262.144 nativo; 40.960-151.552 servible | MIT | GGUF Q4_K_M + `.loom` | Paquete de serving para GPUs AMD via Loom |
| unsloth/Qwen3.5-4B-GGUF | 4B | no disponible en la informacion | no disponible | GGUF | Checkpoint base sin empaquetar; compatible con runtimes GGUF habituales |
| Alternativas de 4B multimodales | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- El paquete no aporta pesos nuevos ni fine-tuning: hereda todas las limitaciones, sesgos y riesgos de alucinacion del modelo Qwen3.5-4B original, no documentados en la informacion disponible.
- El contexto servible es inferior al nativo en varias GPUs: 40.960 tokens en Radeon 860M y 63.488 en Radeon 890M, frente a los 262.144 nativos.
- El despliegue esta atado al runtime Loom (`hrx-loom[hf]==0.2.0`) y a GPUs AMD concretas; no se documenta compatibilidad con CUDA, vLLM, llama.cpp u Ollama.
- No hay informacion sobre idiomas soportados ni sobre calidad multilingue.
- No se han publicado benchmarks en la informacion disponible, por lo que no es posible verificar el rendimiento frente a alternativas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente (creado el 24 de noviembre de 2026) sin validacion comunitaria.
- La licencia MIT se aplica al paquete; conviene verificar la licencia del checkpoint base `unsloth/Qwen3.5-4B-GGUF` antes de uso comercial, ya que no se detalla en la informacion proporcionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/unsloth-Qwen3.5-4B-loom
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo loom-skills: https://github.com/loom-fun/loom-skills
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
