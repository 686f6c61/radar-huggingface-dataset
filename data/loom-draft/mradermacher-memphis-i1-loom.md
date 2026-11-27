# loom-draft/mradermacher-MEMPHIS-i1-loom

## Resumen

`loom-draft/mradermacher-MEMPHIS-i1-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `mradermacher/MEMPHIS-i1-GGUF`, en su variante `MEMPHIS.i1-Q4_K_M.gguf`. No se trata de un modelo nuevo ni de un fine-tune: es un artefacto de empaquetado orientado a servir el modelo base en GPUs AMD concretas, el Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB). Lo publica el usuario `loom-draft` y se ha generado con la herramienta `loom-next`, sin intervención de un LLM en el proceso.

La relevancia del paquete es de infraestructura, no de modelado: proporciona presets de memoria, comandos de arranque reproducibles y mediciones de rendimiento frente a llama.cpp ROCm sobre el mismo GGUF. En la configuración medida para Strix Halo, Loom alcanza 13,7 tok/s de decodificación en prompt corto frente a 12,7 de llama.cpp (+8 %) y 548,1 tok/s de prefill con documento de 1k frente a 349,2 (+57 %).

El repositorio figura con 0 GB de tamaño y 0 descargas en el momento de la consulta, por lo que la disponibilidad práctica de los pesos empaquetados no está confirmada. La licencia declarada es MIT. El modelo subyacente (MEMPHIS-i1) no aporta ficha técnica propia en la información disponible: arquitectura, número de parámetros, contexto e idiomas no están documentados aquí.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (corresponde al modelo base MEMPHIS-i1, no documentado en la informacion disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible como especificacion del modelo; los presets de servicio de llama.cpp usan `-c 65536` y las pruebas cubren hasta 32k tokens |
| Tipos de cuantizacion | Q4_K_M (GGUF); el paquete incluye presets para Strix Halo y R9700 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`MEMPHIS.i1-Q4_K_M.gguf`) empaquetado como programa Loom (`.loom` + `model.json`) |
| Modelo base | `mradermacher/MEMPHIS-i1-GGUF` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (API OpenAI-compatible en `/v1/chat/completions`) |
| Fecha de publicacion | 2026-11-26 |

## Arquitectura y entrenamiento

No hay información sobre la arquitectura del modelo subyacente MEMPHIS-i1 en los datos proporcionados: no se especifica si es un transformer denso, un MoE o un modelo híbrido, ni se detallan tokens de entrenamiento, composición del dataset ni etapas de alineación (RLHF/DPO). El paquete Loom no altera el checkpoint: sirve el GGUF original tal cual, por lo que cualquier innovación arquitectónica del modelo base queda fuera del alcance de esta ficha.

La contribución técnica del paquete es el empaquetado y la configuración de servicio. Incluye presets separados por GPU (`chat` para Strix Halo, `chat-r9700` para R9700), con opciones de espera activa en las finalizaciones de GPU (`completion_spin_ns=4294967295`), pool de memoria fijo (`--pool_backing=fixed`) y precarga de pesos en host (`--parameter_mode=preload`). El paquete no incorpora cabecera MTP ni drafter, por lo que la decodificación especulativa no está disponible en esta configuración; las mediciones se realizaron sin drafting en ambos motores.

## Capacidades

- Generación de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Modo de razonamiento o *thinking* activado por defecto, desactivable con `chat_template_kwargs: {"enable_thinking": false}`.
- Tool calling en formato OpenAI (`tools` y `tool_calls`).
- Servicio multi-stream: las pruebas incluyen 4 peticiones paralelas con decodificación agregada de 49,2 tok/s en Strix Halo.
- Procesamiento de contextos largos en prefill: se miden documentos de 1k, 2k, 8k, 16k y 32k tokens.
- Despliegue reproducible mediante `loom-fetch` y `loom-serve` sobre GPUs AMD.
- Capacidades adicionales del modelo base (visión, audio, matemáticas, código, multilingüismo): no disponibles en la información proporcionada.

## Casos de uso

- Servicio de chat autohospedado en estaciones con Strix Halo: el preset `chat` arranca con un único comando `loom-serve` y expone una API OpenAI-compatible, lo que permite conectar clientes existentes sin adaptadores. Es adecuado para entornos de desarrollo donde no se quiere depender de la nube.
- Asistentes con tool calling en flujos internos: al soportar `tools` y `tool_calls`, el modelo puede integrarse en orquestadores de agentes que ya hablan el protocolo de OpenAI, con el modo *thinking* desactivado para reducir latencia en tareas mecánicas.
- Procesamiento por lotes de documentos largos: el prefill medido de 477,2 tok/s con 32k tokens en Loom (frente a 310,0 en llama.cpp) lo hace apto para resumir o clasificar documentos extensos en pipelines offline.
- Razonamiento asistido con traza de pensamiento: el modo *thinking* por defecto resulta útil en tareas de análisis donde se quiere inspeccionar el razonamiento intermedio, por ejemplo revisión de incidencias técnicas o generación de explicaciones paso a paso.
- Servicio multiusuario ligero: con 4 streams agregando 49,2 tok/s en Strix Halo, puede atender a un equipo pequeño en un servidor de inferencia local sin GPU dedicada de datacenter.
- Despliegue en Radeon AI PRO R9700 para cargas con más VRAM: el preset `chat-r9700` está pensado para la GPU de 32 GB, útil cuando se necesita mantener contextos largos en memoria además de los pesos. Las cifras de rendimiento para esta GPU aún no se han re-medido.
- Evaluación comparativa de motores de inferencia: el paquete incluye la metodología y los datos brutos de la comparación Loom frente a llama.cpp ROCm `llamacpp-rocm/b1374`, lo que sirve como referencia reproducible para decidir motor en hardware AMD.

## Benchmarks y rendimiento

Rendimiento medido en AMD Strix Halo (gfx1151), DevLab Dispatch runner X2-LA03-S04-D01, Linux, `hrx-loom 0.2.0`, mediana de 3 sesiones. Comparación con llama.cpp ROCm `llamacpp-rocm/b1374` sobre el mismo GGUF y los mismos prompts. Argumentos de llama.cpp: `-ngl 99 -cram 0 -c 65536 -np 1`.

| Metrica | llama.cpp | Loom | Margen vs mejor llama.cpp |
|---|---|---|---|
| Decode tok/s, prompt corto | 12,7 | 13,7 | +8 % |
| Decode tok/s, contexto 2k | 12,5 | 13,4 | +7 % |
| Decode tok/s, contexto 32k | 11,1 | 11,8 | +6 % |
| Prefill tok/s, documento 1k | 349,2 | 548,1 | +57 % |
| Prefill tok/s, documento 2k | 359,1 | 550,5 | +53 % |
| Prefill tok/s, documento 8k | 360,4 | 556,5 | +54 % |
| Prefill tok/s, documento 16k | 343,1 | 527,8 | +54 % |
| Prefill tok/s, documento 32k | 310,0 | 477,2 | +54 % |
| 4 streams, decode agregado tok/s | 39,2 | 49,2 | +26 % |
| Decodificacion especulativa, tokens aceptados | n/a | n/a | n/a |

Notas metodológicas: sin drafting en ninguno de los dos motores (no hay cabecera MTP en el GGUF ni drafter publicado para este modelo exacto). Los margenes dentro de ±3 % se consideran empate por ruido del runner. La roofline no se calculó. Para la Radeon AI PRO R9700 (gfx1201, 32 GB) los resultados aún no se han re-medido. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible como cifra explícita. El modelo se sirve en cuantización Q4_K_M y los presets están dimensionados para Strix Halo (memoria unificada del Ryzen AI Max+ 395) y para la Radeon AI PRO R9700 con 32 GB.
- GPU soportadas: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se documenta soporte para A100, H100 ni RTX 4090.
- GPU de consumo: no se confirma compatibilidad con GPUs consumer; el paquete está orientado a las dos plataformas AMD indicadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve`. No se documentan rutas de despliegue con vLLM, llama.cpp, Ollama ni TGI para este paquete, aunque el GGUF base puede servirse con llama.cpp de forma independiente.
- Throughput medido en Strix Halo: 13,7 tok/s de decode en prompt corto, 548,1 tok/s de prefill a 1k, 49,2 tok/s agregados con 4 streams.
- Opciones de servicio relevantes: `--pool_backing=fixed` reserva el pool de memoria por adelantado; `--parameter_mode=preload` solo cambia la carga de pesos en host; `completion_spin_ns=4294967295` activa espera activa (consume CPU mientras hay trabajo en GPU).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (mismo tamaño o misma tarea) en los datos proporcionados. La única comparación disponible es de motor de inferencia, no de modelo:

| Criterio | Loom (este paquete) | llama.cpp ROCm b1374 |
|---|---|---|
| Pesos | Mismo GGUF Q4_K_M | Mismo GGUF Q4_K_M |
| Decode, prompt corto | 13,7 tok/s | 12,7 tok/s |
| Prefill, 1k | 548,1 tok/s | 349,2 tok/s |
| 4 streams agregados | 49,2 tok/s | 39,2 tok/s |
| Drafting | No disponible | No disponible |
| Hardware medido | Strix Halo gfx1151 | Strix Halo gfx1151 |

## Limitaciones y advertencias

- El repositorio muestra 0 GB de tamaño y 0 descargas: la disponibilidad efectiva de los artefactos no está confirmada y conviene verificar los ficheros antes de integrarlo en producción.
- Es un paquete de despliegue, no un modelo: no aporta mejoras de calidad respecto al GGUF original de `mradermacher/MEMPHIS-i1-GGUF`.
- Sin decodificación especulativa: no hay cabecera MTP ni drafter publicado para este modelo exacto, lo que limita el throughput en decodificación.
- Rendimiento en Radeon AI PRO R9700 no re-medido: las cifras publicadas solo cubren Strix Halo.
- Plataforma restringida a GPUs AMD gfx1151 y gfx1201; no se documenta soporte para NVIDIA ni para otras GPUs AMD.
- Sin datos de benchmarks de calidad, sesgos, alucinación ni cobertura idiomática del modelo base en la información disponible.
- La licencia MIT se declara a nivel de repositorio; conviene confirmar que se aplica también al checkpoint GGUF subyacente antes de un uso comercial.
- El rendimiento medido depende de runners de DevLab Dispatch que varían entre sesiones; los márgenes dentro de ±3 % deben tratarse como empate.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/mradermacher-MEMPHIS-i1-loom
- Modelo base GGUF: https://huggingface.co/mradermacher/MEMPHIS-i1-GGUF
- Runtime Loom (hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Ejecución de referencia (DevLab Dispatch run 45881065440): https://github.com/loom-fun/loom-next/actions/runs/45881065440
