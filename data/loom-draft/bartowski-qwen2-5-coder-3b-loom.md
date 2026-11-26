# loom-draft/bartowski-Qwen2.5-Coder-3B-loom

## Resumen

`loom-draft/bartowski-Qwen2.5-Coder-3B-loom` es un paquete de distribucion en formato Loom (`.loom` y un fichero `model.json`) que empaqueta el checkpoint GGUF sin modificar `Qwen2.5-Coder-3B-Q4_K_M.gguf` de bartowski. No se trata de un modelo nuevo ni de un fine-tune: los pesos son identicos al GGUF original de Qwen2.5-Coder-3B cuantizado en Q4_K_M. Lo que anade el paquete es un runtime especifico, `loom-serve`, optimizado para GPUs AMD concretas: la APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El paquete lo publica la organizacion `loom-draft` y se genera con `loom-next`, el generador del ecosistema Loom, sin intervencion de un LLM en el bucle. Su relevancia es practica: ofrece una alternativa a llama.cpp ROCm para servir Qwen2.5-Coder-3B en hardware AMD, con mejoras medidas en prefill y en decodificacion agregada multi-stream sobre Strix Halo.

El modelo subyacente, Qwen2.5-Coder-3B, es un transformer denso de 3B parametros orientado a generacion de codigo, con contexto nativo de 32 768 tokens. El paquete hereda la licencia MIT del checkpoint original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5-Coder-3B); empaquetado en runtime Loom |
| Parametros totales | 3B (modelo base Qwen2.5-Coder-3B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32 768 tokens (segun la tabla de rendimiento del paquete: decode a 32k y prefill de 32k documentos) |
| Tipos de cuantizacion | Q4_K_M (unico incluido en el paquete) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | MIT |
| Formato de pesos | GGUF (`Qwen2.5-Coder-3B-Q4_K_M.gguf`) empaquetado como `.loom` + `model.json` |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-Coder-3B, un transformer denso de la familia Qwen2.5-Coder. El paquete no modifica los pesos ni realiza entrenamiento adicional: toma el GGUF Q4_K_M publicado por bartowski y lo envuelve en el formato Loom, que incluye programas `.loom` y un `model.json` con la configuracion de despliegue. La generacion del paquete la realiza `loom-next` de forma automatica, sin LLM en el bucle.

La innovacion tecnica del paquete no esta en el modelo sino en el runtime. `loom-serve` expone una API compatible con OpenAI (`/v1/chat/completions`) y ofrece opciones de despliegue como `--pool_backing=fixed` (reserva fija del pool de memoria), `--parameter_mode=preload` (carga anticipada de pesos en host) y `completion_spin_ns=4294967295` (espera activa de completaciones GPU). Segun la model card, no hay cabeza MTP en el GGUF ni drafter publicado para este modelo exacto, por lo que la decodificacion especulativa no esta disponible (fila marcada como `n/a`).

## Capacidades

- Generacion de texto y codigo: hereda las capacidades del checkpoint Qwen2.5-Coder-3B en Q4_K_M.
- Tool calling: soportado en estilo OpenAI (`tools` y `tool_calls`), segun la tabla de features del paquete.
- API compatible con OpenAI: endpoint `/v1/chat/completions`.
- Razonamiento / modo thinking: la tabla de features del paquete menciona una fila de "reasoning / thinking" (el texto proporcionado queda truncado en ese punto, por lo que el detalle no esta disponible).
- Servicio multi-stream: soporta peticiones paralelas (la model card reporta un benchmark con 4 streams).
- Contexto largo: operativo hasta 32k tokens segun las mediciones de decode y prefill incluidas.
- Capacidades multimodales, de audio o de vision: no disponible en la informacion proporcionada.
- Idiomas: no disponible en la informacion proporcionada.

## Casos de uso

- Autocompletado y generacion de codigo en IDE sobre estaciones de trabajo AMD: el paquete esta pensado para servir el modelo en Strix Halo o R9700 con `loom-serve`, de modo que un equipo de desarrollo con hardware AMD pueda exponer un endpoint local compatible con OpenAI para asistentes de codigo, sin depender de GPUs NVIDIA.
- Procesamiento de repositorios y documentos largos: con 32k tokens de contexto y un prefill medido de 1982,6 tok/s a 32k en Strix Halo (frente a 1652,3 tok/s de llama.cpp ROCm), es adecuado para tareas que ingieren ficheros grandes o varios ficheros de codigo en una sola peticion.
- Servicio multi-usuario ligero: el benchmark de 4 streams agregados reporta 360,6 tok/s en Loom frente a 245,9 tok/s en llama.cpp, lo que lo hace viable para un pequeno equipo interno que comparte una unica APU o GPU.
- Agentes con tool calling: al soportar `tools` y `tool_calls` en estilo OpenAI, puede integrarse en frameworks de agentes que invocan funciones externas (ejecucion de comandos, consultas a APIs, edicion de ficheros) en flujos multi-paso.
- Evaluacion y prototipado de despliegues AMD: util como banco de pruebas para comparar `loom-serve` frente a llama.cpp ROCm con el mismo GGUF y las mismas peticiones, tal como documenta la propia model card.
- Pipelines de CI/CD con generacion de codigo: al ser un modelo de 3B en Q4_K_M, el coste de inferencia es bajo y puede ejecutarse en hardware de gama de estacion de trabajo para tareas de revision, generacion de tests o resumen de diffs.
- Chat interno de bajo coste: la API compatible con OpenAI permite sustituir un backend remoto por uno local en herramientas que ya hablan ese protocolo, reduciendo latencia y dependencia de red.

## Benchmarks y rendimiento

La model card incluye mediciones de `loom-serve` frente a llama.cpp ROCm `llamacpp-rocm/b1374` sobre Strix Halo (gfx1151), con el mismo GGUF y las mismas peticiones. Valores en tokens por segundo:

| Metrica | llama.cpp | Loom | Margen vs mejor llama.cpp |
|---|---|---|---|
| Decode, prompt corto | 88,9 | 93,0 | +5 % |
| Decode, contexto 2k | 86,4 | 84,4 | -2 % |
| Decode, contexto 32k | no medido | 53,5 | no disponible |
| Prefill, documento 1k | 2816,6 | 4143,8 | +47 % |
| Prefill, documento 2k | 2865,1 | 3982,9 | +39 % |
| Prefill, documento 8k | 2579,0 | 3438,2 | +33 % |
| Prefill, documento 16k | 2201,2 | 2847,6 | +29 % |
| Prefill, documento 32k | 1652,3 | 1982,6 | +20 % |
| 4 streams, decode agregado | 245,9 | 360,6 | +47 % |
| Decodificacion especulativa, tokens aceptados | n/a | n/a | n/a |

Notas metodologicas de la model card: valores medianos de 6 sesiones; Loom cronometrado por el cliente y llama.cpp por su servidor; sin barrido de tuning en ninguno de los dos motores; llama.cpp con `-ngl 99 -cram 0 -c 65536 -np 1`; medicion del 2026-11-26 en runners AMD DevLab Dispatch (X2-LA03-S01-D03), con `hrx-loom 0.2.0`. Un margen dentro de ±3 % se considera empate. Para la Radeon AI PRO R9700 (gfx1201, 32 GB), la model card indica que los resultados "aun no se han vuelto a medir", por lo que no hay datos de rendimiento para esa GPU.

## Requisitos de hardware

- VRAM estimada: el checkpoint es Q4_K_M de un modelo de 3B; la model card no publica una cifra de VRAM. No disponible en la informacion proporcionada.
- GPUs soportadas explicitamente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPUs consumer: no se documenta soporte para GPUs de consumo en la informacion proporcionada. El paquete esta dirigido a las dos plataformas AMD citadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` para materializar el paquete y `loom-serve` para servirlo. Opciones relevantes: `--pool_backing=fixed`, `--parameter_mode=preload` y `--device=amdgpu://?completion_spin_ns=4294967295`.
- Latencia y throughput: ver tabla de benchmarks para Strix Halo. Para R9700, no medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Este paquete (Qwen2.5-Coder-3B Q4_K_M en Loom) | 3B | 32k | GGUF empaquetado en `.loom`, servido con `loom-serve` | MIT | Optimizado para Strix Halo y R9700; mejor prefill y multi-stream que llama.cpp ROCm en Strix Halo |
| bartowski/Qwen2.5-Coder-3B-GGUF | 3B | 32k | GGUF, servido con llama.cpp u otros | MIT | Checkpoint base sin modificar; mismas capacidades del modelo, sin runtime Loom |
| Qwen2.5-Coder-3B (original) | 3B | 32k | safetensors (formato original) | no disponible en la informacion proporcionada | Modelo base del que derivan los GGUF |

La comparacion con otras alternativas de la misma categoria (por ejemplo, otros modelos de codigo de 3B) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El paquete no mejora el modelo: los pesos son el Q4_K_M de Qwen2.5-Coder-3B. Las limitaciones de calidad, sesgos y alucinacion del modelo base se heredan sin cambios.
- La cuantizacion Q4_K_M introduce perdida de precision respecto a los pesos originales; no se han publicado evaluaciones de calidad del paquete frente al modelo sin cuantizar.
- La decodificacion especulativa no esta disponible: no hay cabeza MTP en el GGUF ni drafter publicado para este modelo exacto.
- El soporte de hardware esta limitado a Strix Halo (gfx1151) y R9700 (gfx1201). No se documenta compatibilidad con otras GPUs.
- Los resultados de rendimiento para la Radeon AI PRO R9700 no se han medido todavia.
- Los benchmarks se midieron en runners AMD DevLab Dispatch, que segun la model card varian entre sesiones; los margenes de ±3 % se consideran ruido.
- El paquete tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-26: es un artefacto muy reciente y sin validacion comunitaria.
- La licencia MIT se aplica al paquete; conviene verificar la licencia del modelo base Qwen2.5-Coder-3B antes de un uso comercial, ya que la informacion proporcionada no la detalla.
- Idiomas soportados: no disponible en la informacion proporcionada, por lo que no se puede garantizar el comportamiento multilingue.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/bartowski-Qwen2.5-Coder-3B-loom
- Checkpoint base GGUF: https://huggingface.co/bartowski/Qwen2.5-Coder-3B-GGUF
- Repositorio del runtime Loom: https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Ejecucion de referencia de los benchmarks: https://github.com/loom-fun/loom-next/actions/runs/45875495984
