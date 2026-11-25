# loom-draft/bartowski-gemma-2-27b-it-loom

## Resumen

`loom-draft/bartowski-gemma-2-27b-it-loom` es un paquete de despliegue, no un modelo entrenado desde cero. Se trata de una distribucion en formato Loom (programas `.loom` y una tarjeta `model.json`) del checkpoint GGUF `gemma-2-27b-it-Q4_K_M.gguf` de bartowski, es decir, del modelo Gemma 2 27B instruction-tuned de Google cuantizado a Q4_K_M. El autor del paquete es `loom-draft` y lo genera con la herramienta `loom-next`, sin intervencion de un LLM en el proceso de generacion.

El objetivo es ejecutar el modelo sobre GPUs AMD concretas: el SoC AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB), a traves del runtime `hrx-loom` y el servidor `loom-serve`, que expone una API compatible con OpenAI (`/v1/chat/completions`). Es relevante para quienes trabajan con aceleracion AMD en ROCm y quieren servir Gemma 2 27B sin depender de llama.cpp, aunque el propio paquete usa llama.cpp como referencia de correccion.

El repositorio tiene un tamano declarado de 0.0 GB, 0 descargas y 0 likes en el momento de la consulta, y las mediciones de rendimiento y las puertas de correccion aparecen como "not yet re-measured" en la model card. La informacion disponible es, por tanto, escasa y mayoritariamente descriptiva del empaquetado, no del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2); paquete de despliegue Loom sobre GGUF |
| Parametros totales | 27B (modelo base Gemma 2 27B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens por peticion (segun la model card del paquete) |
| Tipos de cuantizacion | Q4_K_M (GGUF); el paquete distribuye pesos Loom generados a partir de esa cuantizacion |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF de origen; empaquetado como programas `.loom` y `weights.loom` |
| Modelo base | bartowski/gemma-2-27b-it-GGUF |
| Runtime | hrx-loom 0.2.0, loom-serve |
| Hardware objetivo | AMD Ryzen AI Max+ 395 (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Concurrencia | 4 peticiones concurrentes |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| Tool calling | no aplicable segun la model card |
| Vision / audio | no aplicable segun la model card |
| Decodificacion especulativa | no aplicable segun la model card |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 2 27B instruction-tuned de Google, un transformer decoder-only. El paquete Loom no modifica los pesos: la model card indica explicitamente "unmodified GGUF checkpoint". Lo que aporta el repositorio es la traduccion del grafo de computo a programas `.loom` mediante `loom-next`, junto con el tokenizador (`tokenizer.json`), la configuracion (`llm_config.json`) y metadatos de medicion (`info.json`, `REPORT.md`).

No se proporcionan en la informacion disponible datos sobre el numero de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF o DPO en el modelo base. Tampoco se documentan innovaciones tecnicas del modelo en si; las unicas particularidades del paquete son de despliegue: `--pool_backing=fixed` reserva el pool de memoria por adelantado, `--parameter_mode=preload` cambia la carga de pesos en host, y `completion_spin_ns=4294967295` activa espera activa de finalizaciones de GPU. El paquete incluye un conjunto de puertas de correccion (`kernel_tests`, `golden`, `compare`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) que comparan la salida contra llama.cpp, pero todas figuran como no re-medidas.

## Capacidades

- Generacion de texto conversacional a traves de una API compatible con OpenAI (`/v1/chat/completions`).
- Instrucciones en formato chat (modelo `-it`), con renderizado de plantilla de conversacion.
- Contexto de 8.192 tokens por peticion, suficiente para documentos cortos y conversaciones multi-turno moderadas.
- Concurrencia de hasta 4 peticiones simultaneas.
- Salida de hasta 4.096 tokens por peticion.
- Tool calling: no soportado segun la model card ("not applicable").
- Razonamiento / thinking mode: no soportado segun la model card.
- Decodificacion especulativa: no soportada segun la model card.
- Entrada de imagen y audio: no soportadas segun la model card.
- Muestreo (temperature, top_k, seed): estado "not determined" en la model card.
- Capacidades multilingues: no documentadas en la informacion disponible.

## Casos de uso

- Servicio de chat autohospedado en hardware AMD: desplegar `loom-serve` en un Ryzen AI Max+ 395 o una Radeon AI PRO R9700 y exponer `/v1/chat/completions` para clientes que ya hablan el protocolo OpenAI, aprovechando el contexto de 8.192 tokens y las 4 peticiones concurrentes.
- Asistente de documentacion tecnica interna: con 8.192 tokens de contexto se pueden pasar fragmentos de manuales o ficheros de referencia y obtener resumenes o respuestas, siempre que el contenido quepa en esa ventana.
- Prototipado en estaciones de trabajo con GPU AMD: usar el paquete como banco de pruebas para validar el runtime `hrx-loom` frente a llama.cpp, ya que la model card define puertas de comparacion token a token.
- Generacion de texto en lote sobre documentos de extension media: el limite de 4.096 tokens de salida permite redactar informes o resumenes largos por peticion.
- Evaluacion de correccion numerica en aceleradores AMD: las puertas `golden`, `compare` y `logits` estan pensadas para verificar que la salida coincide con la referencia de llama.cpp, util en equipos que validan portes a ROCm.
- Chat de soporte de primer nivel con contexto acotado: conversaciones multi-turno donde el historial se mantiene dentro de los 8.192 tokens y no se requiere tool calling ni razonamiento extendido.
- Despliegue en entornos sin GPU NVIDIA: al estar dirigido a gfx1151 y gfx1201, cubre escenarios donde no hay CUDA disponible y se quiere evitar la dependencia de llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento para Strix Halo y para Radeon AI PRO R9700 "are not yet re-measured", y que todas las puertas de correccion figuran como "not yet re-measured". No se ofrecen cifras de throughput, latencia ni comparativas numericas con llama.cpp.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El checkpoint de origen es Q4_K_M de un modelo de 27B, lo que en la practica ronda los 16-17 GB de pesos; a ello hay que sumar el pool de memoria del runtime y el contexto (8.192 tokens), por lo que se recomienda margen por encima de esa cifra. La model card no publica el consumo medido.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el paquete solo documenta las dos plataformas AMD citadas.
- Opciones de despliegue: `hrx-loom` 0.2.0 con `loom-serve`, instalado via `pipx install "hrx-loom[hf]==0.2.0"`; descarga con `loom-fetch huggingface:loom-draft/bartowski-gemma-2-27b-it-loom:chat`.
- Parametros de servicio documentados: `--device=amdgpu://?completion_spin_ns=4294967295`, `--pool_backing=fixed`, `--parameter_mode=preload`.
- Latencia y throughput: no disponibles; las filas de rendimiento de la model card no estan medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| bartowski/gemma-2-27b-it-loom (este) | 27B | 8.192 tokens por peticion | Loom + GGUF Q4_K_M | gemma | Dirigido a gfx1151 y gfx1201; sin benchmarks publicados |
| bartowski/gemma-2-27b-it-GGUF | 27B | no disponible en la informacion | GGUF | gemma | Checkpoint de origen; ejecutable con llama.cpp |
| Gemma 2 27B it (original de Google) | 27B | no disponible en la informacion | safetensors | gemma | Pesos sin cuantizar; requiere conversion o uso con frameworks que los soporten |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada; la comparativa se limita a parametros, formato, licencia y plataforma de destino.

## Limitaciones y advertencias

- La informacion publicada es muy escasa: 0 descargas, 0 likes y un repositorio de 0.0 GB en el momento de la consulta; conviene verificar la integridad de los ficheros antes de usarlo en produccion.
- Ninguna de las puertas de correccion (`kernel_tests`, `golden`, `compare`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) tiene medicion registrada, por lo que no hay evidencia publicada de que la salida coincida con llama.cpp.
- No hay mediciones de rendimiento para ninguna de las dos plataformas objetivo.
- Tool calling, razonamiento, decodificacion especulativa, vision y audio figuran como "not applicable": no deben asumirse en el diseno de la aplicacion.
- El muestreo figura como "not determined"; el comportamiento de temperature, top_k y seed no esta garantizado.
- Contexto limitado a 8.192 tokens por peticion, muy por debajo de lo que suele ofrecer el modelo base en otros entornos; conviene disenar las aplicaciones con ese limite.
- Licencia Gemma: el uso comercial esta sujeto a los Gemma Terms of Use de Google, que imponen obligaciones de redistribucion y restricciones de uso; revisar antes de desplegar.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible para este paquete; son los del modelo base Gemma 2 27B it, que no se detallan aqui.
- Dependencia de un runtime especifico (`hrx-loom` 0.2.0) y de dos plataformas AMD concretas; no hay soporte documentado para otras GPU.
- El nombre "Loom" coincide con el producto de grabacion de pantalla de Atlassian y con una marca de ropa; los resultados de busqueda web sobre "Loom" no son relevantes para este modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/bartowski-gemma-2-27b-it-loom
- Modelo base GGUF: https://huggingface.co/bartowski/gemma-2-27b-it-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
