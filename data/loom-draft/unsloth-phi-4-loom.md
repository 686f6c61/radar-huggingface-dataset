# loom-draft/unsloth-phi-4-loom

## Resumen

`loom-draft/unsloth-phi-4-loom` es un paquete de despliegue para AMD Loom del checkpoint GGUF `unsloth/phi-4-GGUF`, concretamente la cuantizacion `phi-4-Q4_K_M.gguf` del modelo Phi-4 de Microsoft. No se trata de un modelo nuevo ni de un fine-tune: el autor (loom-draft) empaqueta los pesos originales sin modificar junto con programas `.loom` generados por `loom-next`, una tarjeta `model.json` y los ficheros auxiliares necesarios para servir el modelo sobre GPUs AMD mediante `hrx-loom` (version 0.2.0).

El objetivo del paquete es ofrecer una ruta de inferencia nativa para hardware AMD concreto: el APU Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y la GPU Radeon AI PRO R9700 (gfx1201, 32 GB). El servidor expone una API compatible con OpenAI (`/v1/chat/completions`), soporta 16.384 tokens de contexto por peticion, 4 peticiones concurrentes y un maximo de 4.096 tokens de salida. Es relevante para desarrolladores que quieran ejecutar Phi-4 en hardware AMD sin depender de llama.cpp, aunque en el momento de la publicacion las mediciones de rendimiento y las puertas de correccion del paquete aun no se han vuelto a medir.

La ficha se centra en lo que documenta el autor del paquete; los datos sobre el modelo base Phi-4 que no aparecen en la informacion proporcionada se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Phi-4 de Microsoft, empaquetado como GGUF Q4_K_M) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 16.384 tokens por peticion (limite del preset de Loom); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | Q4_K_M (unico checkpoint empaquetado) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`phi-4-Q4_K_M.gguf`) + programas `.loom` y `weights.loom` generados |
| Modelo base | `unsloth/phi-4-GGUF` |
| Runtime | `hrx-loom[hf]==0.2.0` (servidor `loom-serve`) |
| Hardware objetivo | AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| API | Compatible OpenAI (`/v1/chat/completions`) |
| Concurrencia | 4 peticiones simultaneas |
| Maximo de tokens de salida | 4.096 (preset `max_tokens`) |
| Esquema de tarjeta | `loom-card/3` |

## Arquitectura y entrenamiento

El paquete no define una arquitectura propia: reutiliza el checkpoint GGUF de Phi-4 publicado por Unsloth (`phi-4-Q4_K_M.gguf`) y genera, mediante `loom-next` (el generador, sin LLM en el bucle), un conjunto de programas `.loom` y un fichero `weights.loom` que implementan la inferencia sobre GPUs AMD. La model card no detalla la arquitectura interna del transformer de Phi-4, los datos de entrenamiento ni si hubo RLHF o DPO; esa informacion corresponderia a la model card del modelo base y no esta incluida en la informacion proporcionada.

El paquete incluye `llm_config.json` (configuracion desde la que se generaron los programas), `tokenizer.json`, `info.json` (mediciones, evidencia de puertas y versiones) y `REPORT.md` (metodologia de medicion). El autor indica explicitamente que los pesos no se han modificado y que el generador no incorpora un LLM en el proceso.

## Capacidades

- Generacion de texto conversacional a traves de una API compatible con OpenAI (`/v1/chat/completions`).
- Contexto de 16.384 tokens por peticion, suficiente para documentos medios y conversaciones multi-turno.
- Hasta 4 peticiones concurrentes con la misma salida que ejecutadas en solitario (segun la puerta `consistency`, pendiente de re-medicion).
- Tool calling: no aplicable segun la tabla de caracteristicas del autor.
- Razonamiento / thinking mode: no aplicable.
- Decodificacion especulativa: no aplicable.
- Entrada de imagen: no aplicable.
- Entrada o salida de audio: no aplicable.
- Muestreo (temperature, top_k, seed): estado «no determinado» en la model card.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue de Phi-4 en hardware AMD de escritorio o estacion de trabajo: el paquete permite servir el modelo en un Ryzen AI Max+ 395 o una Radeon AI PRO R9700 con `loom-serve`, sin necesidad de configurar llama.cpp ni CUDA. Es adecuado cuando el parque de hardware es AMD y se quiere una ruta soportada por el ecosistema Loom.
- Prototipado de asistentes conversacionales: la API compatible con OpenAI permite apuntar clientes existentes (SDKs de OpenAI, LangChain, etc.) a `http://127.0.0.1:8080/v1/chat/completions` cambiando solo la URL base.
- Procesamiento de documentos de hasta ~16k tokens: resumen, extraccion de entidades y preguntas y respuestas sobre contratos, informes o articulos que quepan en la ventana del preset.
- Evaluacion comparativa frente a llama.cpp: el paquete incluye puertas de correccion (`golden`, `compare`, `logits`) disenadas para comparar token a token contra una referencia de llama.cpp sobre el mismo GGUF, util para validar la fidelidad de la implementacion en AMD.
- Servicio local multiusuario ligero: con 4 peticiones concurrentes y 4.096 tokens de salida maximos, encaja en un equipo de desarrollo o un laboratorio con varias personas compartiendo una unica GPU.
- Base para integraciones internas con clientes HTTP: cualquier herramienta que hable el protocolo de chat completions de OpenAI puede consumir el endpoint sin adaptadores adicionales.
- Banco de pruebas para el ecosistema Loom: util para quien quiera evaluar `loom-next` y `hrx-loom` sobre un modelo conocido y con licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) «no se han vuelto a medir» para este paquete. Del mismo modo, todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como «not yet re-measured», es decir, sin evidencia registrada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M y el hardware objetivo declarado es un APU con memoria unificada (Strix Halo) y una GPU de 32 GB (Radeon AI PRO R9700).
- GPU objetivo: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPUs NVIDIA (A100, H100, RTX 4090): no soportadas por este paquete, que esta orientado a AMD via `hrx-loom`.
- Opciones de despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para descargar el paquete y `loom-serve` para servir el modelo. Flags relevantes: `--materialize=copy`, `--device=amdgpu://?completion_spin_ns=4294967295`, `--pool_backing=fixed`, `--parameter_mode=preload`.
- Latencia y throughput: no disponibles; el autor no ha publicado mediciones para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| `loom-draft/unsloth-phi-4-loom` (este paquete) | no disponible (Phi-4 Q4_K_M) | 16.384 tokens por peticion | GGUF + programas `.loom`, `hrx-loom` 0.2.0 | MIT | Solo AMD (gfx1151, gfx1201); sin benchmarks publicados para este paquete |
| `unsloth/phi-4-GGUF` (modelo base empaquetado) | no disponible | no disponible | GGUF (Q4_K_M entre otras) | no disponible en la informacion proporcionada | Checkpoint original sin modificar; ejecutable con llama.cpp y otros runtimes GGUF |
| Phi-4 (modelo original de Microsoft) | no disponible en la informacion proporcionada | no disponible | safetensors (formato habitual) | no disponible en la informacion proporcionada | Modelo de referencia del que deriva el GGUF; datos no incluidos en esta ficha |

No se dispone de datos de benchmarks del paquete ni del modelo base en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Paquete sin evidencia de correccion: todas las puertas (`golden`, `compare`, `consistency`, `sampling`, `logits`, etc.) figuran como «not yet re-measured»; no hay garantia publicada de que la salida coincida con llama.cpp.
- Sin mediciones de rendimiento: no hay datos de latencia ni throughput para ninguna de las dos GPUs objetivo.
- Compatibilidad de hardware muy restringida: solo Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB); no se menciona soporte para otras GPUs AMD ni para NVIDIA.
- Contexto limitado a 16.384 tokens por peticion en el preset, aunque el modelo base pueda soportar mas.
- Funcionalidades ausentes: sin tool calling, sin modo thinking, sin decodificacion especulativa, sin vision ni audio.
- Muestreo no determinado: el autor no confirma el comportamiento de temperature, top_k y seed.
- Idiomas no declarados: no se especifica que lenguas soporta el paquete ni el modelo base en esta informacion.
- Licencia MIT declarada en el paquete, pero la licencia del modelo base Phi-4 no se detalla en la informacion proporcionada; conviene verificar la licencia del checkpoint original antes de un uso comercial.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; son los inherentes al modelo base Phi-4, que no se detallan aqui.
- Proyecto con 0 descargas y 0 likes en el momento de la consulta; ecosistema joven (`hrx-loom` 0.2.0, esquema `loom-card/3`).

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/unsloth-phi-4-loom
- Modelo base (GGUF): https://huggingface.co/unsloth/phi-4-GGUF
- Repositorio de `hrx-loom` (runtime): https://github.com/ROCm/hrx-system
- Generador `loom-next`: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
