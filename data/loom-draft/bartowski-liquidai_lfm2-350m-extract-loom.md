# loom-draft/bartowski-LiquidAI_LFM2-350M-Extract-loom

## Resumen

`loom-draft/bartowski-LiquidAI_LFM2-350M-Extract-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF `bartowski/LiquidAI_LFM2-350M-Extract-GGUF`, en concreto la cuantizacion `Q4_K_M`. No es un modelo nuevo ni un fine-tuning: los pesos subyacentes son los del modelo LiquidAI LFM2-350M-Extract, empaquetados sin modificar para su ejecucion en las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201).

El paquete lo publica el usuario `loom-draft` y se ha generado con la herramienta `loom-next` (el generador, sin LLM en el bucle), dentro del ecosistema Loom de ROCm. Su funcion es proporcionar un artefacto listo para servir con `loom-serve`, que expone una API compatible con OpenAI (`/v1/chat/completions`) sobre el runtime Loom, de modo que el modelo pueda ejecutarse en hardware AMD sin depender de llama.cpp.

La relevancia es acotada: se trata de un modelo pequeno (350M parametros) orientado a extraccion de informacion, empaquetado para un nicho de hardware concreto (GPU AMD de escritorio y APU Strix Halo). El paquete es reciente (creado en noviembre de 2026) y no registra descargas ni valoraciones, y las mediciones de rendimiento y las puertas de correccion del autor figuran como "not yet re-measured".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM2 de LiquidAI; el paquete no detalla la arquitectura interna) |
| Parametros totales | 350M (segun el nombre del modelo base) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | 128.000 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF empaquetado en programas `.loom` (`program/*.loom`, `weights.loom`); incluye `tokenizer.json` y `llm_config.json` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones concurrentes |
| API | Compatible con OpenAI (`/v1/chat/completions`) |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento

El paquete no describe la arquitectura del modelo subyacente; solo indica que se parte del GGUF `LiquidAI_LFM2-350M-Extract-Q4_K_M.gguf` de bartowski, sin modificarlo. Por el nombre del modelo base se trata de un modelo LFM2 de LiquidAI de 350M parametros, pero la informacion proporcionada no detalla si es un transformer denso, hibrido u otra variante, ni los datos de entrenamiento, el numero de tokens, la composicion del dataset o si hubo RLHF/DPO.

La innovacion tecnica del artefacto no esta en el modelo sino en el empaquetado: `loom-next` genera programas `.loom` y kernels especificos para las GPU AMD objetivo a partir de la configuracion del modelo (`llm_config.json`), y `loom-fetch` verifica los ficheros fuente mediante sha256 (`model.json.lock`). El autor incluye un conjunto de puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) que comparan el comportamiento contra llama.cpp, pero todas figuran como "not yet re-measured" en la model card.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI.
- Extraccion de informacion (el sufijo `Extract` del modelo base sugiere este uso, aunque la model card no lo detalla).
- Contexto largo: 128.000 tokens por peticion, segun la tabla de caracteristicas del paquete.
- Concurrencia de hasta 4 peticiones simultaneas.
- Salida de hasta 4.096 tokens por peticion (preset `max_tokens`).
- Tool calling: no aplicable segun la model card.
- Razonamiento / thinking mode: no aplicable.
- Esfuerzo de razonamiento (reasoning effort): no aplicable.
- Decodificacion especulativa: no aplicable.
- Entrada de imagen: no aplicable.
- Entrada y salida de audio: no aplicable.
- Muestreo (sampling): estado "not determined" en la model card.

## Casos de uso

- Extraccion de campos estructurados: dado un documento de entrada, usar el endpoint `/v1/chat/completions` para obtener campos concretos en formato JSON; el contexto de 128.000 tokens permite procesar documentos largos en una sola peticion.
- Procesamiento por lotes de textos cortos: con 350M parametros y cuantizacion Q4_K_M, el modelo es adecuado para clasificar, etiquetar o resumir grandes volumenes de fragmentos en una GPU de escritorio AMD.
- Prototipado local en hardware AMD: sirve para validar pipelines que luego se migraran a modelos mayores, aprovechando que `loom-serve` expone una API compatible con OpenAI y evita reescribir el codigo cliente.
- Despliegue en APU Strix Halo: al estar empaquetado especificamente para gfx1151, permite ejecutar inferencia en un equipo compacto sin GPU dedicada, util para demos y entornos de desarrollo.
- Servicio de extraccion en el borde: con un modelo de 350M y 4 peticiones concurrentes, puede desplegarse en la Radeon AI PRO R9700 (32 GB) para tareas de extraccion de baja latencia en local, sin salida a la nube.
- Evaluacion comparativa de runtimes: el paquete incluye puertas de correccion frente a llama.cpp, por lo que sirve para comparar el comportamiento del runtime Loom con la referencia en el mismo GGUF.
- Integracion en pipelines internos con API OpenAI: cualquier herramienta que hable con `/v1/chat/completions` puede apuntar a `loom-serve` cambiando la URL base, lo que facilita pruebas de integracion en CI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de correccion figuran como "not yet re-measured".

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 350M parametros en Q4_K_M el peso de los pesos ronda los 200-250 MB, pero el paquete reserva un pool de memoria fijo (`--pool_backing=fixed`) cuyo tamano no se detalla.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se indica compatibilidad con GPU consumer; el paquete esta generado para las dos GPU AMD citadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch huggingface:loom-draft/bartowski-LiquidAI_LFM2-350M-Extract-loom:chat --materialize=copy --output=liquidai_lfm2-350m-extract` y `loom-serve --model=liquidai_lfm2-350m-extract '--device=amdgpu://?completion_spin_ns=4294967295' --pool_backing=fixed --parameter_mode=preload`.
- Opciones de despliegue alternativas (vLLM, llama.cpp, Ollama, TGI): no disponibles en la informacion proporcionada para este paquete; el GGUF original de bartowski podria usarse con otros runtimes, pero no se documenta aqui.
- Latencia y throughput: no disponibles; las mediciones del autor no se han vuelto a realizar.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni comparaciones con otros modelos, y el paquete esta atado a un runtime y hardware especificos (Loom sobre GPU AMD), lo que limita la comparacion directa con otros artefactos.

## Limitaciones y advertencias

- Modelo de 350M parametros: capacidad limitada para razonamiento complejo, codigo o matematicas; el sufijo `Extract` sugiere un uso acotado a extraccion de informacion.
- Sin benchmarks publicados: no hay evidencia de rendimiento ni de correccion numerica en la model card; todas las puertas figuran como "not yet re-measured".
- Sin datos de sesgos ni de alucinacion: la informacion disponible no documenta evaluaciones de sesgo, toxicidad o tasa de alucinacion.
- Idiomas no declarados: no se especifica que lenguas soporta el modelo base.
- Tool calling, thinking, vision y audio no aplicables: no debe esperarse soporte de agentes multi-paso ni de modalidades adicionales.
- Muestreo no determinado: el estado de la funcion de sampling es "not determined".
- Dependencia de hardware AMD concreto: el paquete esta generado para gfx1151 y gfx1201; no se garantiza su funcionamiento en otras GPU.
- Dependencia de version del runtime: requiere `hrx-loom[hf]==0.2.0`; cambios de version pueden afectar a la compatibilidad.
- Licencia MIT: permite uso comercial, pero conviene verificar la licencia del modelo base y del GGUF original de bartowski antes de redistribuir.
- Paquete sin adopcion: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/bartowski-LiquidAI_LFM2-350M-Extract-loom
- GGUF base (bartowski): https://huggingface.co/bartowski/LiquidAI_LFM2-350M-Extract-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
