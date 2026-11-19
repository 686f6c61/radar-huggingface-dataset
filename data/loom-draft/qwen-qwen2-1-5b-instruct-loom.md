# loom-draft/Qwen-Qwen2-1.5B-Instruct-loom

## Resumen

`loom-draft/Qwen-Qwen2-1.5B-Instruct-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `qwen2-1_5b-instruct-q4_k_m.gguf` de Qwen. No se trata de un modelo nuevo ni de un fine-tune: los pesos son los originales de Qwen2-1.5B-Instruct en cuantizacion Q4_K_M, empaquetados para su ejecucion en GPUs AMD mediante el runtime Loom. El autor es `loom-draft` y el paquete se genero con la herramienta `loom-next`, sin intervencion de un LLM en el proceso de generacion.

El modelo subyacente, Qwen2-1.5B-Instruct, es un transformer decoder-only de 1.500 millones de parametros desarrollado por el equipo Qwen de Alibaba, ajustado por instrucciones y publicado bajo licencia Apache 2.0. El interes de este paquete concreto reside en el soporte de hardware: esta orientado a la APU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y a la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB), dos plataformas para las que el ecosistema de inferencia alternativo (llama.cpp, vLLM) tiene soporte mas limitado o requiere compilaciones especificas.

La relevancia es, por tanto, de nicho: sirve para validar y ejecutar un modelo pequeno de instrucciones sobre GPUs AMD via Loom con una API compatible con OpenAI (`/v1/chat/completions`), contexto de 32.768 tokens por peticion y 4 peticiones concurrentes. En el momento de la consulta el repositorio registra 0 descargas y 0 likes, y las mediciones de rendimiento y las puertas de correccion del autor figuran como "not yet re-measured".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), empaquetado como programas Loom |
| Parametros totales | 1.500 millones (modelo base Qwen2-1.5B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (checkpoint GGUF empaquetado) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (origen) y `weights.loom` (formato del paquete Loom) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2-1.5B-Instruct, un transformer decoder-only con atencion por causalidad y mecanismos habituales de la familia Qwen2 (RoPE para codificacion posicional, RMSNorm y capas feed-forward con activacion SwiGLU). El paquete Loom no modifica los pesos: los programas `.loom` y `weights.loom` se generan a partir del GGUF original y el autor indica explicitamente que la generacion se hizo con `loom-next` como unica herramienta, sin LLM en el bucle. El paquete incluye `tokenizer.json`, `llm_config.json` (configuracion de la que se generaron los programas), `info.json` (mediciones, evidencia de puertas y versiones) y `model.json` con `model.json.lock`, que fija los ficheros de origen con verificacion sha256 por parte de `loom-fetch`.

No se dispone de informacion en la model card sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) del modelo base; esos datos corresponden a la documentacion oficial de Qwen y no se reproducen aqui. La innovacion tecnica del paquete es de infraestructura: kernels generados para las arquitecturas AMD gfx1151 y gfx1201, un pool de memoria de respaldo fijo (`--pool_backing=fixed`), precarga de parametros en host (`--parameter_mode=preload`) y espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`), ajuste con el que se midieron las cifras de rendimiento de la tarjeta. No incluye decodificacion especulativa (marcada como no aplicable).

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones, heredadas de Qwen2-1.5B-Instruct.
- API compatible con OpenAI: endpoint `/v1/chat/completions` servido por `loom-serve`.
- Contexto de 32.768 tokens por peticion y hasta 4.096 tokens de salida (preset `max_tokens`).
- Concurrencia de 4 peticiones simultaneas.
- Tool calling: no aplicable segun la tabla de caracteristicas del autor.
- Razonamiento / thinking mode y reasoning effort: no aplicable.
- Decodificacion especulativa: no aplicable.
- Entrada de imagen y entrada/salida de audio: no determinado.
- Muestreo (sampling): no determinado en la tabla de caracteristicas, aunque existe una puerta de correccion `sampling` prevista para temperatura, top_k y semilla.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue de un asistente conversacional ligero sobre AMD Strix Halo: el paquete se instala con `pipx install "hrx-loom[hf]==0.2.0"`, se descarga con `loom-fetch` y se sirve con `loom-serve`; con 1.500 millones de parametros en Q4_K_M y un pool de memoria fijo, encaja en un equipo compacto con APU sin GPU dedicada.
- Prototipado de aplicaciones con API compatible con OpenAI: al exponer `/v1/chat/completions`, se puede apuntar un cliente existente (SDK de OpenAI, LangChain, etc.) al endpoint local `http://127.0.0.1:8080` sin cambiar el codigo de la aplicacion.
- Validacion de la cadena de herramientas Loom en CI: las puertas de correccion (`kernel_tests`, `golden`, `compare`, `consistency`, `sampling`, `logits`, entre otras) permiten comparar la salida del paquete contra una referencia de llama.cpp registrada sobre el mismo GGUF, token a token, como test de regresion del runtime.
- Servicio de resumen o extraccion sobre documentos de hasta 32k tokens: la ventana de contexto por peticion permite procesar articulos, informes o hilos de correo completos en una sola llamada, con 4 peticiones concurrentes para pequenos volumenes.
- Tareas de clasificacion y etiquetado por lotes en local: con 4 ranuras concurrentes y salida limitada a 4.096 tokens, es adecuado para pipelines de etiquetado o generacion de metadatos donde la confidencialidad exige no enviar datos a la nube.
- Evaluacion comparativa de hardware AMD: al estar orientado a gfx1151 y gfx1201, sirve para medir latencia y throughput de un modelo pequeno en Radeon AI PRO R9700 (32 GB) frente a otras pilas de inferencia, aunque el autor aun no ha publicado esas mediciones.
- Base para experimentos de ajuste o evaluacion: el checkpoint original Qwen2-1.5B-Instruct es pequeno y Apache 2.0, lo que permite usarlo como punto de partida o como referencia en investigacion sin restricciones de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201), pero ambas indican literalmente que los resultados de este paquete "are not yet re-measured". Del mismo modo, todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas plataformas, por lo que no hay evidencia registrada de su funcionamiento.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M de 1.500 millones de parametros, lo que en la practica supone del orden de 1 GB de pesos, pero el paquete Loom reserva un pool de memoria fijo cuyo tamano no se detalla en la informacion proporcionada.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se confirma compatibilidad con GPUs de consumo; el paquete esta generado especificamente para las dos plataformas AMD citadas.
- Despliegue: runtime Loom (`hrx-loom[hf]==0.2.0`), con `loom-fetch` para la descarga y `loom-serve` para el servidor. No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones de despliegue de este paquete.
- Latencia y throughput: no disponibles; el autor indica que las mediciones aun no se han repetido para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Qwen2-1.5B-Instruct-loom (este paquete) | 1,5B | 32.768 tokens | Apache 2.0 | Loom (`weights.loom`), runtime `hrx-loom` | Orientado a AMD gfx1151 y gfx1201; sin mediciones publicadas |
| Qwen2-1.5B-Instruct (GGUF original) | 1,5B | 32.768 tokens (heredado) | Apache 2.0 | GGUF; llama.cpp y derivados | Checkpoint de origen sin modificar; ecosistema de inferencia mas amplio |
| Qwen2.5-1.5B-Instruct | 1,5B | no disponible en la informacion proporcionada | Apache 2.0 | safetensors, GGUF | Generacion posterior de la familia Qwen; no evaluado aqui |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- El paquete no aporta mejoras de calidad sobre Qwen2-1.5B-Instruct: los pesos son los originales en Q4_K_M, con la perdida de precision que implica la cuantizacion de 4 bits.
- Todas las puertas de correccion y las mediciones de rendimiento figuran como no re-medidas; no hay evidencia publicada de que la salida coincida con la referencia de llama.cpp en este paquete concreto.
- Compatibilidad limitada al hardware declarado (gfx1151 y gfx1201); no se confirma funcionamiento en otras GPUs AMD, NVIDIA o CPU.
- Tool calling, modo de razonamiento y decodificacion especulativa no estan soportados; la entrada de imagen y el audio figuran como "no determinado".
- Idiomas soportados no documentados en la model card; conviene verificar el comportamiento multilingue del modelo base antes de usarlo en produccion.
- Riesgo de alucinacion y sesgos: propios de un modelo de 1,5B ajustado por instrucciones; no se documentan evaluaciones de sesgo ni de seguridad en la informacion disponible.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-19); se trata de un artefacto sin adopcion verificable.
- La licencia Apache 2.0 del modelo base permite uso comercial, pero el paquete depende del runtime Loom (`hrx-loom`), cuyas condiciones de uso no se detallan en la informacion proporcionada.
- La busqueda web realizada no devuelve resultados relacionados con este proyecto: los enlaces encontrados corresponden a Loom (la herramienta de grabacion de pantalla) y a la marca de ropa Loom, sin relacion con el runtime.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/Qwen-Qwen2-1.5B-Instruct-loom
- Modelo base en GGUF: https://huggingface.co/Qwen/Qwen2-1.5B-Instruct-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
