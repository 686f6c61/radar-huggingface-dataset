# loom-fun/unsloth-Inkling-2-Mini-loom-r9700

## Resumen

Inkling-2-Mini (UD-Q4_K_XL) para AMD Loom es un paquete de despliegue en formato `.loom` que empaqueta el checkpoint GGUF sin modificar `unsloth/Inkling-2-Mini-GGUF`, en concreto la variante `Inkling-2-Mini-UD-Q4_K_XL.gguf`. Lo publica el usuario `loom-fun` como parte del ecosistema Loom, un runtime de inferencia desarrollado por ROCm/hrx-system orientado a GPUs AMD. No se trata de un modelo nuevo ni de un fine-tune: los pesos son los originales de Unsloth, y el valor anadido esta en el formato de empaquetado, la configuracion de servido (`model.json`) y los presets de rendimiento para hardware AMD concreto.

El paquete esta optimizado para dos plataformas: el APU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU de escritorio AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El autor publica mediciones comparativas frente a llama.cpp (build ROCm) sobre el mismo GGUF y la misma maquina, con mejoras notables en decodificacion: 42,8 tok/s frente a 14,9 tok/s en prompt corto (+187 %) en Strix Halo, y 32,4 tok/s a 32k de contexto. Es relevante porque demuestra que el runtime Loom, basado en IREE, puede extraer mas rendimiento que llama.cpp en GPUs AMD integradas y de escritorio con el mismo checkpoint cuantizado.

El modelo subyacente es Inkling-2-Mini, un modelo de la familia Inkling de Thinking Machines, distribuido por Unsloth en formato GGUF. La ficha no dispone de datos sobre arquitectura, numero de parametros, contexto o datos de entrenamiento del modelo base, por lo que esos campos se marcan como no disponibles. El repositorio tiene 0 GB de tamano declarado y 0 descargas en el momento de la consulta, lo que sugiere una publicacion muy reciente (23 de noviembre de 2026).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Inkling-2-Mini, pesos GGUF) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (las mediciones cubren hasta 32k tokens) |
| Tipos de cuantizacion | UD-Q4_K_XL (unica variante empaquetada) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (empaquetado en `.loom` con `model.json`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base Inkling-2-Mini en la documentacion proporcionada. El paquete Loom no modifica los pesos: empaqueta el GGUF original de Unsloth y anade programas `.loom` y una tarjeta `model.json` que describen como servirlo. El runtime Loom esta construido sobre IREE (el compilador de MLIR de Google) y ejecuta el grafo sobre el backend AMDGPU, con un pool de memoria de respaldo fijo (`--pool_backing=fixed`) y espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`).

El autor no aporta informacion sobre datos de entrenamiento, tokens vistos, composicion del dataset ni tecnicas de alineacion (RLHF, DPO) del modelo base. Tampoco se documenta ninguna innovacion de decodificacion especulativa: la model card indica explicitamente que no hay cabecera MTP en el GGUF ni drafter publicado para este modelo exacto, y que la decodificacion especulativa no se aplica en las mediciones. La unica innovacion tecnica destacable es el propio empaquetado Loom: presets de servido preconfigurados por hardware, carga de pesos en modo `preload` en la R9700 y un pool de memoria de tamano fijo que evita el crecimiento elastico del backing.

## Capacidades

- Generacion de texto conversacional multi-turno servida mediante una API compatible con OpenAI (`/v1/chat/completions`).
- Parametro `reasoning_effort` en la peticion, con valor `none` documentado en los ejemplos; sugiere soporte de modos de razonamiento, aunque no se detalla el conjunto de valores admitidos.
- Servido concurrente: la configuracion de Strix Halo mide 4 streams en paralelo con 88,1 tok/s agregados.
- Procesamiento de prompts largos: las mediciones cubren prefill de documentos de 1k, 2k, 8k, 16k y 32k tokens.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Asistente conversacional local en un mini-PC con Ryzen AI Max+ 395: el paquete Loom permite servir el modelo en el APU con 42,8 tok/s de decodificacion en prompt corto, suficiente para interaccion en tiempo real sin GPU dedicada.
- Procesamiento de documentos largos en local: con 32,4 tok/s de decodificacion a 32k de contexto y prefill medido hasta 16k tokens, es adecuado para resumir o extraer informacion de contratos, informes o articulos que quepan en esa ventana.
- Servicio multi-usuario ligero en la Radeon AI PRO R9700: los 32 GB de VRAM de la tarjeta y el preset `chat-r9700` con `--parameter_mode=preload` permiten atender varias sesiones concurrentes en una estacion de trabajo.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia MIT del paquete facilita integrarlo en productos comerciales sin obligaciones de atribucion mas alla del aviso de copyright.
- Evaluacion comparativa de runtimes de inferencia AMD: sirve como referencia reproducible para medir Loom frente a llama.cpp sobre el mismo GGUF, misma maquina y mismos prompts, con metodologia documentada.
- Prototipado de aplicaciones de chat sobre API OpenAI-compatible: el endpoint `/v1/chat/completions` permite apuntar clientes existentes (SDKs de OpenAI, LangChain, etc.) al servidor local cambiando solo la URL base.
- Inferencia en hardware AMD sin CUDA: cubre el hueco de despliegue en GPUs AMD integradas y de escritorio donde el ecosistema CUDA no esta disponible.

## Benchmarks y rendimiento

Mediciones publicadas por el autor en Strix Halo (gfx1151), comparando Loom frente a llama.cpp ROCm `llama.cpp-cpu/418fe97+PR32704`, mismo GGUF y misma maquina:

| Metrica | llama.cpp | Loom | Margen vs mejor llama.cpp | Roofline | Loom % del roofline |
|---|---|---|---|---|---|
| Decode tok/s, prompt corto | 14,9 | 42,8 | +187 % | 57,2 | 75 % |
| Decode tok/s, contexto 2k | 11,3 | no medido | no disponible | 54,1 | no disponible |
| Decode tok/s, contexto 32k | no medido | 32,4 | no disponible | 43,9 | 74 % |
| Prefill tok/s, documento 1k | 57,6 | no medido | no disponible | 4792,4 | no disponible |
| Prefill tok/s, documento 2k | 53,6 | no medido | no disponible | 4701,2 | no disponible |
| Prefill tok/s, documento 8k | 48,7 | no medido | no disponible | 4511,8 | no disponible |
| Prefill tok/s, documento 16k | 44,6 | no medido | no disponible | 4329,3 | no disponible |
| Prefill tok/s, documento 32k | no medido | no medido | no disponible | 4014,1 | no disponible |
| 4 streams, decode agregado tok/s | no medido | 88,1 | no disponible | 217,8 | 40 % |
| Decodificacion especulativa, tokens aceptados | n/a | n/a | n/a | n/a | n/a |

Notas metodologicas: valores medianos de 1 sesion; 3 muestras para decode y decode_32k, una muestra para el resto, 3 para los 4 streams. Loom cronometrado por el cliente, llama.cpp por su servidor. Sin barrido de ajuste en ningun motor. La configuracion de llama.cpp usa `-ngl 0 -c 33792 -np 1 -t 12 -ctk f32 -ctv f32 --jinja` sobre build CPU con 12 hilos; el autor indica que los builds ROCm y Vulkan de llama.cpp no estan soportados por regla del propietario del banco de pruebas. La maquina es un AMD Ryzen AI Max+ 395 con Radeon 8060S y una Radeon AI PRO R9700, Ubuntu 24.04.

No se han publicado resultados de benchmarks del modelo base (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision. La cuantizacion UD-Q4_K_XL sugiere un peso en el rango de 4 bits por parametro, pero se desconoce el numero de parametros del modelo base. La Radeon AI PRO R9700 dispone de 32 GB y el preset cabe en ella.
- GPU soportadas explicitamente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPUs consumer: no se documenta soporte para Radeon RX 7000/9000 de consumo ni para GPUs NVIDIA; el paquete esta orientado a las dos plataformas AMD citadas.
- Despliegue: runtime Loom (`hrx-loom[hf]==0.3.0`, instalable con pipx), con `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. No se documenta soporte de vLLM, TGI, Ollama o llama.cpp para este paquete concreto; el propio autor usa llama.cpp solo como baseline comparativo.
- Requisito de sistema: en hosts con memlock de 8 MiB hay que lanzar `loom-serve` bajo `systemd-run` con `SystemCallFilter=~io_uring_setup` y `SystemCallErrorNumber=ENOSYS`, o elevar `ulimit -l`.
- Latencia y throughput: 42,8 tok/s de decodificacion en prompt corto y 32,4 tok/s a 32k de contexto en Strix Halo; 88,1 tok/s agregados con 4 streams. No hay mediciones publicadas para la R9700.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica modelos comparables de la misma categoria ni ofrece datos de parametros, contexto o rendimiento del modelo base que permitan una comparacion rigurosa. El unico punto de comparacion documentado es el runtime llama.cpp ejecutando el mismo GGUF, cuyos resultados se recogen en la seccion de benchmarks.

## Limitaciones y advertencias

- El paquete no incluye ninguna modificacion de los pesos: cualquier limitacion del modelo base Inkling-2-Mini (sesgos, alucinaciones, cobertura idiomatica) se hereda sin cambios.
- No se dispone de informacion sobre sesgos conocidos, tasas de alucinacion ni evaluaciones de seguridad del modelo base.
- La licencia MIT del paquete cubre el empaquetado Loom; no se especifica en la informacion disponible la licencia de los pesos originales de Inkling-2-Mini, que puede ser distinta y condicionar el uso comercial.
- El soporte de hardware esta limitado a Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no hay garantia de funcionamiento en otras GPUs AMD ni en NVIDIA.
- El repositorio declara 0 GB de tamano y 0 descargas, lo que puede indicar que los artefactos no estan completamente subidos o que la publicacion es inmediata; conviene verificar la integridad de los ficheros antes de desplegar.
- En hosts con memlock bajo es necesario un ajuste de sistema (`systemd-run` o `ulimit -l`) para evitar fallos de arranque del servidor.
- Las mediciones de rendimiento provienen de una unica sesion y, en varias filas, de una sola muestra; la propia model card advierte de un ruido de +-3 % en la misma ejecucion, por lo que los margenes deben interpretarse con cautela.
- No hay cabecera MTP ni drafter publicado, de modo que no se puede activar decodificacion especulativa con este checkpoint.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-fun/unsloth-Inkling-2-Mini-loom-r9700
- Modelo base GGUF: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Flujo de generacion loom-skills: https://github.com/loom-fun/loom-skills
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
