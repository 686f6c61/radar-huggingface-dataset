# loom-draft/mradermacher-CyberSecQwen-4B-loom

## Resumen

`loom-draft/mradermacher-CyberSecQwen-4B-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `mradermacher/CyberSecQwen-4B-GGUF`, en su cuantizacion `CyberSecQwen-4B.Q4_K_M.gguf`. No es un modelo nuevo: es un artefacto de empaquetado orientado a ejecutar ese GGUF de 4B parametros sobre GPUs AMD concretas, en concreto el AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB). Lo publica el usuario `loom-draft` y se ha generado con `loom-next`, el generador del ecosistema Loom, sin intervencion de un LLM en el bucle.

El interes practico esta en el runtime, no en los pesos: el paquete incluye presets de memoria y comandos listos para servir el modelo mediante `loom-serve` con una API compatible con OpenAI (`/v1/chat/completions`). La model card reporta comparativas de rendimiento frente a llama.cpp ROCm (build `b1374`) sobre Strix Halo, con mejoras de hasta el 49 % en prefill y del 29 % en decodificacion agregada con 4 streams.

La licencia es MIT y el checkpoint base procede de un fine-tuning de tematica de ciberseguridad sobre una base Qwen de 4B (segun la nomenclatura del autor del GGUF; la model card no detalla la arquitectura interna). El paquete se publico el 26 de noviembre de 2026 y no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoint base de la familia Qwen, 4B; sin detalle en la model card) |
| Parametros totales | 4B (segun el nombre del modelo) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 65 536 tokens en la configuracion de referencia para llama.cpp (`-c 65536`); el preset Loom se evalua con prompts de hasta 32k |
| Tipos de cuantizacion | Q4_K_M (unico incluido en este paquete) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`CyberSecQwen-4B.Q4_K_M.gguf`) empaquetado como programa Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del checkpoint base ni su proceso de entrenamiento: solo indica que se empaqueta el GGUF `mradermacher/CyberSecQwen-4B-GGUF` "sin modificar". Por el nombre, se trata de un fine-tuning de tematica de ciberseguridad sobre una base Qwen de 4B parametros, pero no se aportan datos sobre numero de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento.

La innovacion tecnica relevante de este artefacto es el runtime Loom: presets de memoria con `--pool_backing=fixed` (reserva del pool por adelantado), `--parameter_mode=preload` (carga de pesos en host) y espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`). El paquete incluye dos presets, `chat` para Strix Halo y `chat-r9700` para R9700. No hay cabeza MTP en el GGUF ni drafter publicado para este modelo, por lo que la decodificacion especulativa no esta disponible.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Especializacion tematica en ciberseguridad, heredada del fine-tuning del checkpoint base.
- Tool calling: no disponible (la tabla de features lo marca como "not applicable").
- Razonamiento / modo thinking: no disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Multilingue: no disponible (no se declaran idiomas).
- Vision y audio: no disponibles.
- Servicio concurrente: soporta peticiones en paralelo (la comparativa mide 4 streams agregados).

## Casos de uso

- Asistente de triaje de alertas de seguridad: el modelo puede clasificar y resumir eventos de un SIEM en conversaciones multi-turno, aprovechando la ventana de hasta 32k tokens evaluada para incorporar contexto de incidentes largos.
- Analisis de informes de vulnerabilidades: procesar avisos CVE, CVSS y notas de parche en lotes mediante el endpoint compatible con OpenAI, con prefill rapido (hasta 3133 tok/s en documentos de 2k en Strix Halo) para iterar sobre muchos documentos.
- Formacion y concienciacion en seguridad: generar explicaciones y escenarios de phishing o ingenieria social para materiales internos, dado el enfoque del fine-tuning.
- Despliegue en estaciones de trabajo AMD sin GPU de datacenter: el preset `chat` esta pensado para el Ryzen AI Max+ 395, lo que permite servir el modelo en un equipo compacto con memoria unificada.
- Servicio interno de bajo volumen sobre Radeon AI PRO R9700: el preset `chat-r9700` (32 GB de VRAM) permite alojar el modelo con margen sobrado para el Q4_K_M y atender varias peticiones concurrentes.
- Prototipado de pipelines de seguridad con API OpenAI: al exponer `/v1/chat/completions`, se puede integrar con SDKs y frameworks existentes sin adaptadores propios, sustituyendo el `base_url` por `http://127.0.0.1:8080/v1`.
- Evaluacion comparativa de runtimes en hardware AMD: el paquete sirve como banco de pruebas reproducible frente a llama.cpp ROCm para medir prefill y decodificacion en gfx1151.

## Benchmarks y rendimiento

Rendimiento medido en AMD Strix Halo (gfx1151), Loom 0.2.0 frente a llama.cpp ROCm `b1374`, mismo GGUF y mismos prompts; mediana de 6 sesiones, medida el 2026-11-26:

| Metrica | llama.cpp | Loom | Margen |
|---|---|---|---|
| Decode tok/s, prompt corto | 73,1 | 78,1 | +7 % |
| Decode tok/s, contexto 2k | 65,3 | 66,7 | +2 % |
| Decode tok/s, contexto 32k | 28,9 | 28,8 | +0 % (empate) |
| Prefill tok/s, documento 1k | 2192,1 | 3074,3 | +40 % |
| Prefill tok/s, documento 2k | 2133,9 | 3133,2 | +47 % |
| Prefill tok/s, documento 8k | 1697,8 | 2459,9 | +45 % |
| Prefill tok/s, documento 16k | 1289,8 | 1828,3 | +42 % |
| Prefill tok/s, documento 32k | 863,1 | 1286,4 | +49 % |
| 4 streams, decode agregado tok/s | 213,5 | 274,5 | +29 % |
| Decodificacion especulativa | n/a | n/a | n/a |

En Radeon AI PRO R9700 (gfx1201, 32 GB) los resultados "aun no se han vuelto a medir" segun la model card. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; un GGUF Q4_K_M de 4B ocupa aproximadamente 2,5-3 GB de pesos, mas overhead de contexto KV (el preset usa contexto de hasta 65 536 tokens en la referencia de llama.cpp).
- GPU soportadas por los presets incluidos: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta soporte para RTX 4090 ni otras GPUs NVIDIA en este paquete; el runtime Loom esta orientado a AMD vía `amdgpu://`.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para materializar el paquete y `loom-serve` para servir la API. No se mencionan vLLM, llama.cpp, Ollama ni TGI como alternativas dentro del paquete (llama.cpp solo aparece como referencia comparativa).
- Throughput medido en Strix Halo: 78,1 tok/s de decodificacion en prompt corto, 28,8 tok/s a 32k de contexto, 3074 tok/s de prefill en documentos de 1k y 274,5 tok/s agregados con 4 streams.
- Latencia en R9700: no medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| CyberSecQwen-4B (este paquete Loom) | 4B | 65 536 (config. de referencia) | GGUF Q4_K_M + runtime Loom | MIT | Ciberseguridad, despliegue en AMD |
| mradermacher/CyberSecQwen-4B-GGUF | 4B | no disponible | GGUF (multiples cuantizaciones) | MIT (segun este paquete) | Mismo checkpoint, sin empaquetar |
| llama.cpp ROCm `b1374` (runtime) | no aplica | configurable | GGUF | MIT | Runtime generico; referencia de rendimiento en la comparativa |

No se dispone de datos de benchmarks de calidad para comparar con otros modelos de la misma categoria; la unica comparacion publicada es de rendimiento del runtime frente a llama.cpp sobre el mismo checkpoint.

## Limitaciones y advertencias

- No es un modelo nuevo: es un paquete de despliegue de un GGUF de terceros; cualquier limitacion del checkpoint base (sesgos, alucinacion, calidad) se hereda sin cambios.
- La model card no documenta idiomas soportados, datos de entrenamiento ni evaluaciones de calidad; no hay evidencia publicada de su rendimiento en tareas de ciberseguridad mas alla del nombre.
- Sin soporte de tool calling ni modo de razonamiento, lo que limita su uso en pipelines de agentes.
- La decodificacion especulativa no esta disponible (sin cabeza MTP ni drafter para este modelo).
- El rendimiento solo esta medido en Strix Halo; en R9700 no hay mediciones y el soporte para otras GPUs (incluidas NVIDIA) no se documenta.
- El paquete fija versiones concretas (`hrx-loom[hf]==0.2.0`) y presets de memoria; desviarse de ellas invalida las cifras de rendimiento reportadas.
- Aunque la licencia declarada es MIT, conviene verificar los terminos del checkpoint base `mradermacher/CyberSecQwen-4B-GGUF` antes de un uso comercial en produccion.
- El modelo tiene 0 descargas y 0 likes: no hay validacion comunitaria del artefacto.
- Los resultados de busqueda web sobre "Loom" corresponden a productos no relacionados (grabador de pantalla y marca de ropa); no aportan informacion tecnica sobre este paquete.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/mradermacher-CyberSecQwen-4B-loom
- Checkpoint base GGUF: https://huggingface.co/mradermacher/CyberSecQwen-4B-GGUF
- Repositorio del runtime: https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Ejecucion de referencia (DevLab Dispatch): https://github.com/loom-fun/loom-next/actions/runs/45878901661
