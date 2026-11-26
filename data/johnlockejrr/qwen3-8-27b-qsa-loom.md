# johnlockejrr/Qwen3.8-27B-QSA-loom

## Resumen

Qwen3.8-27B-QSA-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado por johnlockejrr para ejecutar el checkpoint GGUF `Qwen3.8-27B-QSA-Unsloth-UD-Q6_K.gguf` sobre GPUs AMD mediante el runtime Loom. No es un modelo entrenado desde cero, sino un port que traduce los pesos GGUF originales a programas Loom, manteniendo la arquitectura Qwen3.8-27B-QSA con atención dispersa QSA (quality-sensitive attention) y decodificación especulativa MTP integrada en el propio GGUF.

El modelo base es un transformer multimodal de 27 mil millones de parámetros (según la nomenclatura del checkpoint) con ventana de contexto nativa de 262.144 tokens, capacidad de entrada de imagen mediante un proyector separado (`mmproj-Qwen3.8-27B-QSA-F16.gguf`) y modo de razonamiento activado por defecto con niveles de esfuerzo configurables (low, medium, high, xhigh). La licencia declarada es MIT.

Su relevancia radica en el ecosistema objetivo: el paquete está optimizado para el APU AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151), donde el autor reporta aproximadamente 20 tok/s de decodificación, 32 tok/s agregados con 4 peticiones concurrentes y 313 tok/s de prefill con cuantización UD-Q6_K y thinking desactivado. Es, por tanto, una pieza de infraestructura para servir modelos grandes en hardware AMD consumer/edge más que una propuesta de modelo novedosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención dispersa QSA (quality-sensitive attention): indexadores F32 en capas 3…63, score/select con presupuesto 512 y atención dispersa sobre KV denso; decodificación especulativa MTP (depth 3) integrada en el GGUF |
| Parametros totales | 27B (según nomenclatura del checkpoint; no se detalla desglose en la información disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por petición (nativo y máximo servido en Strix Halo) |
| Tipos de cuantizacion | UD-Q6_K (checkpoint empaquetado); proyector de visión en F16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (checkpoint `Qwen3.8-27B-QSA-Unsloth-UD-Q6_K.gguf`) empaquetado como programas Loom (`.loom`, `weights.loom`) con `model.json` |

## Arquitectura y entrenamiento

El paquete no documenta el entrenamiento del modelo base; la información disponible describe únicamente el port. El checkpoint subyacente es un Qwen3.8-27B-QSA en GGUF, presumiblemente derivado de la familia Qwen3.8 con una variante de atención QSA que sustituye la atención densa completa por un esquema de dos etapas: un indexador en precisión F32 en las capas 3 a 63 que puntúa y selecciona un subconjunto de tokens KV (presupuesto de 512) y una atención dispersa posterior sobre el KV denso. Este diseño reduce el coste de atención en contextos largos sin descartar el KV completo.

Sobre ese checkpoint, el autor añade decodificación especulativa MTP (multi-token prediction) con profundidad 3, activada por defecto, y un proyector multimodal F16 para entrada de imagen. El paquete Loom se genera con el flujo `loom-skills` y `hrx-loom` (versión 0.2.0 según la tarjeta, aunque el quick start indica `hrx-loom[hf]==0.3.0`), traduciendo los pesos a programas `.loom` ejecutables por `loom-serve`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento con modo thinking activado por defecto y control de esfuerzo mediante `reasoning_effort` (low, medium, high, xhigh; por defecto xhigh).
- Entrada de imagen (image-text-to-text) a través de `image_url` en formato OpenAI y el proyector `mmproj-Qwen3.8-27B-QSA-F16.gguf`.
- Tool calling en estilo OpenAI (`tools` y `tool_calls`), con soporte de bucles multi-turno de agentes.
- Decodificación especulativa MTP con profundidad 3, activada por defecto.
- API compatible con OpenAI en `/v1/chat/completions`.
- Concurrencia de 4 peticiones simultáneas.
- Límite de salida de 4.096 tokens por petición (preset `max_tokens`).
- Sin soporte de audio (ni entrada ni salida).

## Casos de uso

- Asistente conversacional de contexto largo en hardware AMD: con 262.144 tokens por petición, permite cargar documentación extensa, historiales de conversación o bases de código completas en una sola ventana, algo poco habitual en despliegues sobre APU consumer.
- Agente con tool calling en local: el soporte de `tools`/`tool_calls` y los bucles multi-turno (validados por las puertas `agent` y `agent_think_off` del benchmark) lo hacen apto para automatizar tareas que requieran invocar APIs o ejecutar acciones sobre sistemas.
- Análisis de documentos con imagen: la combinación de entrada de imagen y contexto largo permite procesar capturas, diagramas o páginas escaneadas junto con texto de referencia en la misma petición.
- Razonamiento con esfuerzo configurable: el parámetro `reasoning_effort` permite bajar a low o medium para tareas simples y subir a xhigh para problemas de análisis, ajustando el coste de cómputo por petición.
- Despliegue edge en Strix Halo: con 54 GB de pool de memoria (`--memory_bytes=54000000000`) y ~20 tok/s de decodificación, es viable como servicio local de inferencia en un equipo único sin GPU dedicada.
- Prototipado de pipelines compatibles con OpenAI: al exponer `/v1/chat/completions`, se puede integrar con SDKs y frameworks existentes sin adaptadores específicos, útil para validar flujos antes de migrar a infraestructura mayor.
- Evaluación comparativa frente a llama.cpp: las puertas de corrección (`golden`, `compare`, `spec`, `vision`, `logits`) permiten verificar la equivalencia del port con la referencia llama.cpp sobre el mismo GGUF.

## Benchmarks y rendimiento

| Metrica | Strix Halo (gfx1151) | Notas |
|---|---|---|
| Decodificacion | ~20 tok/s | Thinking off, UD-Q6_K, `completion_spin_ns=4294967295` |
| Throughput agregado (4 peticiones) | ~32 tok/s | Concurrencia 4 |
| Prefill | ~313 tok/s | Thinking off |
| Comparativa vs llama.cpp | no disponible | El autor indica que los resultados de este paquete aun no se han re-medido |

Las puertas de corrección de loom-benchmark (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran en la tarjeta como «not yet re-measured» en Strix Halo, por lo que no hay evidencia registrada de su cumplimiento en esta versión.

## Requisitos de hardware

- VRAM/pool de memoria: el preset del paquete reserva 54.000.000.000 bytes (~54 GB) con `--pool_backing=fixed`; es el mínimo indicado para servir los 262.144 tokens de contexto en Strix Halo.
- GPU objetivo: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151). El paquete se distribuye para el runtime Loom sobre AMD; no se documenta soporte para otras GPU en la información disponible.
- GPU consumer: no se confirma compatibilidad con GPUs NVIDIA consumer (RTX 4090, etc.); el paquete está orientado a AMD vía Loom y no se mencionan rutas alternativas.
- Despliegue: `loom-serve` con `--device='amdgpu://?completion_spin_ns=4294967295'`, `--listen`, `--memory_bytes` y `--workers=8`. Instalación mediante `pipx install "hrx-loom[hf]==0.3.0"` y descarga con `loom-fetch`.
- Latencia y throughput: ~20 tok/s de decodificación, ~313 tok/s de prefill y ~32 tok/s agregados con 4 peticiones concurrentes en Strix Halo con thinking desactivado.
- Concurrencia máxima soportada por el preset: 4 peticiones simultáneas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-QSA-loom (este) | 27B | 262.144 | Loom (AMD) | MIT | Port optimizado para Strix Halo con MTP depth 3 y vision |
| johnlockejrr/Qwen3.8-27B-QSA-GGUF (base) | 27B | 262.144 | GGUF | MIT | Checkpoint original; sin empaquetado Loom |
| higa2515/Qwen3.8-27B-QSA-GGUF | 27B | no disponible | GGUF | no disponible | Port QSA de referencia citado por el autor |

No se dispone en la información proporcionada de datos de rendimiento comparables entre estos modelos ni de alternativas de otros fabricantes con los que contrastar.

## Limitaciones y advertencias

- El paquete no incluye evidencia de las puertas de corrección en Strix Halo: todas figuran como «not yet re-measured», por lo que la equivalencia con llama.cpp no está verificada en esta versión.
- El rendimiento reportado (~20 tok/s) se midió con thinking desactivado y con `completion_spin_ns=4294967295`, que consume CPU mientras hay trabajo en GPU; con thinking activo o mayor concurrencia el throughput será inferior.
- El límite de salida por petición es de 4.096 tokens, lo que puede ser insuficiente para tareas de generación larga.
- La concurrencia está limitada a 4 peticiones simultáneas por el preset.
- No hay información sobre idiomas soportados, sesgos, tasa de alucinación ni evaluación de calidad del modelo base.
- El soporte de hardware se limita a lo documentado para AMD Strix Halo vía Loom; no se confirma funcionamiento en otras GPU.
- Existe una discrepancia de versiones en la propia tarjeta: `hrx-loom 0.2.0` en la sección de versiones frente a `hrx-loom[hf]==0.3.0` en el quick start.
- La licencia MIT aplica al paquete; conviene verificar la licencia del checkpoint base y del proyector antes de uso comercial en producción.
- El modelo no soporta audio ni se documentan modos de sampling deterministas más allá de las puertas de benchmark.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/johnlockejrr/Qwen3.8-27B-QSA-loom
- Checkpoint GGUF base: https://huggingface.co/johnlockejrr/Qwen3.8-27B-QSA-GGUF
- Port QSA de referencia: https://huggingface.co/higa2515/Qwen3.8-27B-QSA-GGUF
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Flujo loom-skills: https://github.com/loom-fun/loom-skills
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
