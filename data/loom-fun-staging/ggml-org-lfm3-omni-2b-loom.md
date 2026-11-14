# loom-fun-staging/ggml-org-LFM3-Omni-2B-loom

## Resumen

LFM3-Omni-2B es un modelo multimodal de la familia LFM3 (Liquid AI) con aproximadamente 2.000 millones de parametros que, segun la model card del paquete aqui descrito, admite entrada de imagen y audio. El checkpoint original en formato GGUF (LFM3-Omni-2B-Q4_K_M.gguf) ha sido empaquetado por el usuario loom-fun-staging como un paquete Loom (programas `.loom` y una tarjeta `model.json`) destinado al runtime Loom sobre GPUs AMD, concretamente la APU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

El paquete no modifica los pesos: reutiliza el GGUF original y anade kernels generados por el flujo loom-skills, exponiendo un servidor compatible con la API OpenAI (`/v1/chat/completions`) en `127.0.0.1:8080`. Su relevancia es de infraestructura mas que de modelado: demuestra como servir un modelo multimodal de 2B cuantizado en Q4_K_M sobre hardware AMD consumer y profesional, con soporte de tool calling, modo de razonamiento opcional y contexto de 128.000 tokens por peticion.

La ficha debe leerse con cautela: la informacion disponible es escasa, no hay datos de benchmarks del modelo base en la informacion proporcionada, varias puertas de validacion (`kernel_tests`, `golden`, `compare`, `agent`) no se han re-ejecutado sobre esta build y la licencia, idiomas y pipeline no estan declarados en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3-Omni-2B; arquitectura no declarada en la informacion proporcionada) |
| Parametros totales | ~2B (segun el nombre del checkpoint) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 128.000 tokens por peticion (segun la model card del paquete Loom) |
| Tipos de cuantizacion | Q4_K_M (GGUF); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | GGUF (LFM3-Omni-2B-Q4_K_M.gguf) empaquetado como Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base LFM3-Omni-2B ni sobre su proceso de entrenamiento (numero de tokens, composicion del dataset, RLHF/DPO) en la informacion proporcionada. El nombre "Omni" y la referencia a entrada de imagen y audio en la model card sugieren un modelo multimodal, pero no se detalla el tipo de encoder ni el mecanismo de fusion.

Lo que si esta documentado es la capa de despliegue: el paquete Loom contiene kernels generados especificamente para las arquitecturas AMD gfx1151 (Strix Halo) y gfx1201 (Radeon AI PRO R9700), junto con una tarjeta `model.json` que describe el modelo. El servidor implementa un modo de espera activa configurable (`completion_spin_ns`) y limita el uso de memoria con `--memory_bytes=10000000000` (10 GB). La decodificacion especulativa no esta disponible porque el GGUF no incluye cabeza MTP ni se ha publicado un drafter para este modelo exacto. En la tabla de rendimiento del paquete, las columnas de llama.cpp y Loom aparecen como no medidas, por lo que solo se publican los valores de roofline teorico, no resultados reales comparados.

## Capacidades

- Generacion de texto y razonamiento conversacional via API compatible con OpenAI.
- Tool calling estilo OpenAI (`tools` y `tool_calls`), con bucle multi-turno validado por la puerta `agent`.
- Modo de razonamiento opcional (`enable_thinking`), desactivado por defecto mediante `chat_template_kwargs`.
- Entrada de imagen y audio: presentes en el modelo base, pero **no soportadas por el runtime Loom** (marcadas como no disponibles en la tabla de features del paquete).
- Contexto de 128.000 tokens por peticion.
- Concurrencia de hasta 4 peticiones simultaneas.
- Salida maxima de 4.096 tokens (preset `max_tokens`).
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Servicio de chat sobre Strix Halo: desplegar `loom-serve` en una APU Ryzen AI Max+ 395 y exponer `/v1/chat/completions` como backend de una aplicacion interna, aprovechando el contexto de 128k tokens para conversaciones largas con historial extenso.
- Agentes con tool calling en local: usar el bucle `agent` documentado para construir asistentes que invocan funciones (consultas a bases de datos, APIs internas) sin salir del hardware local, util en entornos con requisitos de privacidad.
- Procesamiento de documentos largos: con 128k tokens de contexto por peticion, el modelo puede resumir o extraer informacion de contratos, informes o transcripciones que superan ampliamente la ventana tipica de modelos de 2B.
- Evaluacion de hardware AMD: usar el paquete como banco de pruebas para medir decode y prefill en gfx1151 y gfx1201 frente a llama.cpp ROCm, dado que incluye metodologia de roofline y puertas de comparacion token a token.
- Prototipado rapido de aplicaciones LLM: al expener una API compatible con OpenAI, cualquier SDK o framework (LangChain, LlamaIndex, clientes OpenAI) puede apuntar a `127.0.0.1:8080` sin cambios de codigo.
- Razonamiento con modo thinking en tareas de analisis: activar `enable_thinking` para tareas que requieren cadena de razonamiento explicita, manteniendolo desactivado en produccion para reducir latencia.
- Despliegue en estaciones de trabajo con Radeon AI PRO R9700: servir el modelo en una GPU profesional de 32 GB con el mismo comando, reservando 10 GB de memoria mediante `--memory_bytes`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

La model card del paquete incluye una tabla de rendimiento de inferencia frente a llama.cpp ROCm, pero las columnas de ambos motores aparecen como no medidas; solo se publican los valores de roofline teorico para Strix Halo (gfx1151):

| Metrica | Roofline (Strix Halo) | llama.cpp | Loom |
|---|---|---|---|
| Decode tok/s, prompt corto | 197,9 | no medido | no medido |
| Decode tok/s, contexto 2k | 193,1 | no medido | no medido |
| Decode tok/s, contexto 32k | 145,2 | no medido | no medido |
| Prefill tok/s, documento 1k | 19.878,9 | no medido | no medido |
| Prefill tok/s, documento 2k | 19.715,6 | no medido | no medido |
| Prefill tok/s, documento 8k | 18.789,8 | no medido | no medido |
| Prefill tok/s, documento 16k | 17.682,6 | no medido | no medido |
| Prefill tok/s, documento 32k | 15.818,4 | no medido | no medido |
| 4 streams, decode agregado tok/s | 763,7 | no medido | no medido |
| Decodificacion especulativa | n/a | n/a | n/a |

Los valores de roofline corresponden al techo teorico del hardware (216 GB/s de ancho de banda y 59 TFLOP/s) calculado con `loom-roofline`, no a mediciones reales. Para Radeon AI PRO R9700 los resultados "no se han re-medido todavia".

## Requisitos de hardware

- VRAM estimada: el comando de servicio reserva `--memory_bytes=10000000000` (10 GB), coherente con un GGUF Q4_K_M de ~2B parametros mas overhead del runtime.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Cabe en GPU consumer AMD: si, en Strix Halo (APU con memoria unificada); no hay datos para GPUs NVIDIA consumer en la informacion proporcionada.
- Opciones de despliegue: `loom-serve` (runtime Loom, instalado via `pip install "hrx-loom[hf]==0.1.0"`); llama.cpp ROCm se usa como referencia de comparacion, no como opcion documentada de despliegue del paquete.
- Latencia y throughput: no hay mediciones reales publicadas; solo roofline teorico (ver seccion anterior).
- Concurrencia: 4 peticiones simultaneas soportadas.

## Comparativa con modelos similares

No hay datos de benchmarks del modelo base en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas del paquete y del modelo base declaradas:

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-Omni-2B (este paquete) | ~2B | 128k por peticion | texto + tool calling en Loom (imagen/audio no soportadas por el runtime) | no disponible | GGUF Q4_K_M en paquete Loom |
| ggml-org/LFM3-Omni-2B-GGUF (checkpoint base) | ~2B | no disponible | multimodal (texto, imagen, audio) | no disponible | GGUF |
| llama.cpp ROCm (motor de referencia) | n/a | no disponible | n/a | n/a | n/a |

No se dispone de alternativas comparables con datos de rendimiento en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: inherente a modelos generativos de 2B; no hay evaluaciones publicadas en la informacion disponible.
- Modalidad recortada: la entrada de imagen y audio del modelo base no esta soportada por el runtime Loom; el paquete es efectivamente solo texto.
- Validacion incompleta: las puertas `kernel_tests`, `golden`, `compare`, `consistency` y `agent` no se han re-ejecutado sobre esta build (la ultima pasada fue sobre la sha256 `a08b63e`); la correccion frente a llama.cpp no esta confirmada para este paquete.
- Rendimiento sin medir: la tabla comparativa de llama.cpp y Loom esta vacia; no hay evidencia empirica de rendimiento en este paquete.
- Radeon AI PRO R9700: resultados "no re-medidos todavia".
- Licencia no declarada: no se puede confirmar el uso comercial; verificar la licencia del checkpoint base `ggml-org/LFM3-Omni-2B-GGUF` antes de desplegar.
- Idiomas no declarados: no se puede confirmar cobertura multilingue.
- Repositorio de staging: el autor `loom-fun-staging` y las 0 descargas/0 likes sugieren un paquete en fase de prueba, no un artefacto estable de produccion.
- Dependencia de hardware AMD: los kernels generados estan ligados a gfx1151 y gfx1201; no hay soporte documentado para otras GPU.
- Sin decodificacion especulativa: no hay cabeza MTP ni drafter publicado para este modelo exacto.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-fun-staging/ggml-org-LFM3-Omni-2B-loom
- Checkpoint base GGUF: https://huggingface.co/ggml-org/LFM3-Omni-2B-GGUF
- Repositorio del runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Flujo loom-skills: https://github.com/loom-fun/loom-skills
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
