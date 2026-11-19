# loom-draft/bartowski-apodex_Apodex-1.1-mini-loom

## Resumen

apodex_Apodex-1.1-mini en formato Loom es un paquete de despliegue (programas `.loom` y una tarjeta `model.json`) generado por el usuario `loom-draft` a partir del checkpoint GGUF sin modificar `bartowski/apodex_Apodex-1.1-mini-GGUF`, en su cuantizacion Q4_K_M. No se trata de un modelo nuevo: los pesos son los del checkpoint original de bartowski, empaquetados para ejecutarse mediante `loom-serve` sobre hardware AMD concreto, en este caso la APU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete lo genera `loom-next`, una herramienta de generacion sin LLM en el bucle.

El modelo subyacente es multimodal de tipo image-text-to-text, con plantilla de chat que admite modo de razonamiento (thinking) activado por defecto, decodificacion especulativa MTP con profundidad 3 y una ventana de contexto declarada de 262.144 tokens por peticion. El paquete expone una API compatible con OpenAI (`/v1/chat/completions`) y admite cuatro peticiones concurrentes con un maximo de 4.096 tokens de salida por preset.

La relevancia de esta ficha es acotada: se trata de un artefacto de despliegue para el ecosistema Loom orientado a GPUs AMD, no de una publicacion de modelo con datos de entrenamiento o benchmarks propios. Las cifras de rendimiento y las puertas de correccion aparecen en la model card como "not yet re-measured" para ambas plataformas, de modo que no hay evidencia publicada de rendimiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoint GGUF multimodal image-text-to-text; familia arquitectonica no declarada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unica variante empaquetada en este repositorio); proyector de vision en bf16 (`mmproj-apodex_Apodex-1.1-mini-bf16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint base) empaquetado como paquete Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base (tipo de transformer, atencion, posible mezcla de expertos, etc.) ni sobre el proceso de entrenamiento: numero de tokens, composicion del dataset, fases de RLHF o DPO. La model card del paquete Loom no documenta ninguno de estos extremos y se limita a describir el artefacto de despliegue.

Lo que si esta documentado es la capa de inferencia: el paquete utiliza decodificacion especulativa MTP (multi-token prediction) con profundidad 3, activada por defecto, y un proyector multimodal independiente en bf16 para la entrada de imagenes. El modo de razonamiento (thinking) viene activado por defecto y puede desactivarse mediante `chat_template_kwargs: {"enable_thinking": false}`. La generacion del paquete la realiza `loom-next` sin intervencion de un LLM en el bucle, y el resultado son kernels generados para las arquitecturas gfx1151 y gfx1201.

## Capacidades

- Generacion de texto conversacional multi-turno mediante API compatible con OpenAI (`/v1/chat/completions`).
- Razonamiento con modo thinking activado por defecto, desactivable por peticion.
- Entrada de imagenes en estilo OpenAI (`image_url`), procesadas por el proyector `mmproj-apodex_Apodex-1.1-mini-bf16.gguf`.
- Decodificacion especulativa MTP con profundidad 3, activada por defecto.
- Concurrencia de hasta 4 peticiones simultaneas.
- Ventana de contexto de 262.144 tokens por peticion.
- Limite de 4.096 tokens de salida por preset (`max_tokens`).
- Tool calling: no aplicable segun la model card.
- Razonamiento con esfuerzo configurable (reasoning effort): no aplicable.
- Entrada o salida de audio: no aplicable.
- Muestreo (sampling): estado no determinado en la model card.

## Casos de uso

- Despliegue local en AMD Strix Halo: el paquete esta generado especificamente para gfx1151, de modo que permite servir el modelo en una APU Ryzen AI Max+ 395 sin recurrir a llama.cpp, usando `loom-fetch` y `loom-serve` con el preset `chat`.
- Despliegue en GPU AMD de gama profesional: el preset `chat-r9700` esta adaptado a la Radeon AI PRO R9700 (gfx1201, 32 GB), lo que facilita montar un nodo de inferencia AMD dedicado con una sola tarjeta.
- Procesamiento de documentos largos: la ventana de 262.144 tokens por peticion permite analizar contratos, informes o codigo extenso en una sola llamada, dentro del limite de 4.096 tokens de salida.
- Analisis de imagenes en flujo conversacional: la entrada `image_url` con proyector bf16 permite enviar capturas, diagramas o documentos escaneados junto a preguntas en texto, util para tareas de extraccion y descripcion.
- Evaluacion comparativa frente a llama.cpp: las puertas de correccion (`golden`, `compare`, `vision`, `spec`, `agent`, `logits`, `decision`) estan disenadas para contrastar token a token la salida de Loom con una referencia de llama.cpp sobre el mismo GGUF, lo que sirve para validar portabilidad de inferencia en AMD.
- Integracion en pipelines con API OpenAI: al exponer `/v1/chat/completions` en `127.0.0.1:8080`, puede conectarse a clientes y orquestadores existentes compatibles con OpenAI sin adaptadores adicionales.
- Servicio multiusuario ligero: con 4 peticiones concurrentes y pool de memoria fijo (`--pool_backing=fixed`), es adecuado para entornos de desarrollo o laboratorio con carga moderada y latencia predecible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured", y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured". Una puerta sin ejecucion registrada no aporta evidencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se declara el tamano del checkpoint Q4_K_M ni el consumo del pool de memoria).
- GPU validadas por el paquete: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPU consumer NVIDIA: no declarada; el paquete esta generado para arquitecturas AMD gfx1151 y gfx1201.
- Despliegue: `loom-serve` mediante `pipx install "hrx-loom[hf]==0.2.0"`, con `loom-fetch` para materializar el paquete (`--materialize=copy`).
- Opciones de ejecucion documentadas: `--device=amdgpu://?completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU, consume CPU mientras hay trabajo en vuelo), `--pool_backing=fixed` (pool de memoria fijo) y `--parameter_mode=preload` (carga de pesos en host).
- Latencia y throughput: no disponibles; no se han publicado mediciones para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| apodex_Apodex-1.1-mini (paquete Loom) | no disponible | 262.144 tokens | Apache 2.0 | Paquete Loom sobre GGUF Q4_K_M | Artefacto de despliegue para AMD gfx1151/gfx1201; sin benchmarks publicados |
| bartowski/apodex_Apodex-1.1-mini-GGUF | no disponible | no disponible | Apache 2.0 (segun modelo base) | GGUF | Checkpoint de origen, sin modificar; ejecutable en llama.cpp |
| Alternativas de mismo tamano o tarea | no disponible | no disponible | no disponible | no disponible | No se dispone de informacion sobre modelos comparables en la documentacion proporcionada |

## Limitaciones y advertencias

- Ausencia total de evidencia de rendimiento: todas las puertas de correccion y las mediciones de rendimiento figuran como no re-medidas para ambas plataformas, por lo que no hay validacion publicada de fidelidad frente a llama.cpp.
- Ambito de hardware restringido: el paquete esta generado para gfx1151 y gfx1201; no se declara soporte para otras GPUs AMD ni para NVIDIA.
- Tool calling no soportado ("not applicable"), lo que descarta su uso en flujos de agentes con funciones.
- Limite de salida de 4.096 tokens por preset, muy inferior a la ventana de contexto de 262.144 tokens; las tareas de generacion larga requeriran ajuste del preset.
- Concurrencia limitada a 4 peticiones simultaneas.
- Estado de muestreo no determinado, lo que impide garantizar el comportamiento de temperatura, top_k y semilla sin verificacion adicional.
- Idiomas soportados no declarados; no es posible confirmar cobertura multilingue.
- Parametros totales y activos no declarados, lo que impide estimar requisitos de VRAM y coste de inferencia a partir de la ficha.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; deben evaluarse empiricamente antes de cualquier uso en produccion.
- Licencia Apache 2.0 permite uso comercial, pero el artefacto depende de `hrx-loom==0.2.0` y del ecosistema Loom, cuyas condiciones de uso no se detallan en la informacion disponible.
- Los resultados de busqueda web obtenidos corresponden a servicios homonimos (grabador de pantalla Loom y marca de ropa Loom) y no aportan informacion tecnica sobre este modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/bartowski-apodex_Apodex-1.1-mini-loom
- Modelo base (GGUF): https://huggingface.co/bartowski/apodex_Apodex-1.1-mini-GGUF
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Repositorio ROCm hrx-system: https://github.com/ROCm/hrx-system
