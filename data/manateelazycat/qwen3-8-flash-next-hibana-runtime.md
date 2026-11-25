# manateelazycat/Qwen3.8-Flash-Next-Hibana-Runtime

## Resumen

Qwen3.8-Flash-Next-Hibana-Runtime es un artefacto de despliegue publicado por el usuario manateelazycat en Hugging Face bajo licencia Apache 2.0. No se trata de un modelo de lenguaje con pesos, sino de un archivo de runtime empaquetado como imagen OCI/Docker para `linux/arm64`, dirigido especificamente a la plataforma NVIDIA Jetson AGX Thor. El repositorio ocupa 3,9 GB y contiene el motor de inferencia Hibana optimizado para la arquitectura `sm_110a` de Thor, junto con soporte de vision multimodal Qwen3-VL, MoE de quinta generacion con `tcgen05`, CuTe GDN y decodificacion especulativa DFlash2.

El paquete esta disenado para acompanar al AI Pod LPK identificado como `cloud.lazycat.aipod.qwen38-flash-next-origin`. La model card indica explicitamente que el archivo no contiene pesos del modelo: estos se descargan y verifican por SHA-256 de forma separada desde los repositorios `RadixArk/Qwen3.8-Flash-Next-NVFP4` y `manateelazycat/Qwen3.8-Flash-Next-Hibana-Thor`.

La relevancia de esta ficha es acotada: se trata de infraestructura de inferencia para un modelo Qwen de tercera generacion (etiquetado como 3.8 Flash Next) sobre hardware edge de NVIDIA, no de un modelo evaluable de forma autonoma. Cualquier comparacion de capacidades, benchmarks o calidad debe remitirse a los repositorios de pesos referenciados, que no forman parte de la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Runtime de inferencia (motor Hibana) para modelo Qwen3.8-Flash-Next; incluye soporte MoE de 5.a generacion (`tcgen05`), atencion/linear via CuTe GDN y decodificacion especulativa DFlash2 |
| Parametros totales | no disponible (el repositorio no contiene pesos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos de referencia se distribuyen en formato NVFP4) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no aplica (artefacto OCI/Docker `linux/arm64`; los pesos se obtienen por separado) |

## Arquitectura y entrenamiento

El artefacto es un archivo OCI/Docker direccionado por contenido, aplanado y empaquetado para `linux/arm64`, con el motor Hibana compilado y optimizado para la arquitectura de GPU `sm_110a` de NVIDIA Jetson AGX Thor. Incorpora un cache JIT precalentado para SM110a, lo que reduce el coste de compilacion en el primer arranque. Segun la model card, el motor incluye soporte de vision multimodal Qwen3-VL, implementacion MoE de quinta generacion basada en `tcgen05`, kernels CuTe GDN y decodificacion especulativa DFlash2.

No se proporciona informacion sobre el entrenamiento del modelo subyacente: ni numero de tokens, ni composicion del dataset, ni si hubo RLHF, DPO u otras etapas de alineamiento. Tampoco se detalla la arquitectura interna del modelo Qwen3.8-Flash-Next mas alla de las referencias al uso de MoE y soporte multimodal. Los pesos se obtienen de repositorios externos (`RadixArk/Qwen3.8-Flash-Next-NVFP4` y `manateelazycat/Qwen3.8-Flash-Next-Hibana-Thor`) y se verifican por SHA-256, pero sus caracteristicas no se describen en la informacion disponible.

## Capacidades

- Despliegue de inferencia para el modelo Qwen3.8-Flash-Next en NVIDIA Jetson AGX Thor (`sm_110a`).
- Soporte de vision multimodal a traves de Qwen3-VL, segun la model card.
- Ejecucion de capas MoE con instrucciones `tcgen05` de quinta generacion.
- Decodificacion especulativa DFlash2 para acelerar la generacion.
- Cache JIT precalentado para SM110a, orientado a reducir la latencia del primer token tras el arranque.
- Verificacion de integridad de pesos por SHA-256 antes de la carga.
- Capacidades del modelo subyacente (tool calling, agentes, razonamiento multi-paso, multilingue): no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue edge en Jetson AGX Thor: el runtime permite ejecutar Qwen3.8-Flash-Next en un dispositivo embebido de NVIDIA con GPU `sm_110a`, usando el motor Hibana ya compilado y con cache JIT precalentado.
- Integracion con AI Pod LPK: el paquete acompana al LPK `cloud.lazycat.aipod.qwen38-flash-next-origin`, de modo que se usa como capa de ejecucion dentro de ese entorno empaquetado.
- Inferencia multimodal en el borde: gracias al soporte Qwen3-VL, el runtime habilita tareas de vision-lenguaje en hardware Thor sin depender de un servidor remoto.
- Aceleracion mediante decodificacion especulativa: DFlash2 resulta adecuado para cargas interactivas donde la latencia por token es critica, como asistentes en tiempo real sobre dispositivo.
- Reproducibilidad y cadena de suministro: la verificacion SHA-256 de pesos y el direccionamiento por contenido del archivo OCI facilitan despliegues auditables y repetibles.
- Prototipado de modelos MoE en hardware edge: util para equipos que evaluan el rendimiento de un MoE de quinta generacion en Thor antes de pasar a produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Plataforma objetivo: NVIDIA Jetson AGX Thor con arquitectura de GPU `sm_110a` (arm64).
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: NVIDIA Jetson AGX Thor; otras GPU no estan soportadas por este artefacto segun la model card.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no disponible; el runtime esta compilado para `sm_110a` y `linux/arm64`.
- Opciones de despliegue: carga del archivo OCI/Docker `linux/arm64` junto con el AI Pod LPK `cloud.lazycat.aipod.qwen38-flash-next-origin`; pesos descargados aparte desde `RadixArk/Qwen3.8-Flash-Next-NVFP4` o `manateelazycat/Qwen3.8-Flash-Next-Hibana-Thor`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo / artefacto | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Hibana-Runtime (este) | Runtime de inferencia para Jetson Thor | no disponible (sin pesos) | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| RadixArk/Qwen3.8-Flash-Next-NVFP4 | Pesos del modelo en NVFP4 | no disponible | no disponible | no disponible | Referenciado en la model card |
| manateelazycat/Qwen3.8-Flash-Next-Hibana-Thor | Pesos para Thor | no disponible | no disponible | no disponible | Referenciado en la model card |

No se dispone de datos suficientes para comparar con alternativas de la misma categoria (runtimes de inferencia edge para Jetson Thor) ni con modelos de lenguaje equivalentes.

## Limitaciones y advertencias

- El repositorio no contiene pesos del modelo; no es utilizable de forma autonoma sin descargar los pesos desde los repositorios externos indicados.
- El runtime esta compilado especificamente para `sm_110a` y `linux/arm64`; no funciona en GPU x86 ni en arquitecturas NVIDIA distintas a Jetson AGX Thor.
- No se documentan sesgos, tasas de alucinacion ni limitaciones linguisticas del modelo subyacente en la informacion disponible.
- No se especifican restricciones adicionales de la licencia Apache 2.0 mas alla de las propias de dicha licencia; el uso comercial del modelo subyacente depende de la licencia de sus pesos, que no se detalla.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (25 de noviembre de 2026), lo que sugiere ausencia de validacion comunitaria.
- La denominacion "Qwen3.8-Flash-Next" no corresponde a un identificador oficial verificable en la informacion proporcionada; conviene contrastar con el repositorio de pesos antes de usarlo en produccion.
- El pipeline no esta declarado en Hugging Face, por lo que no hay metadatos estandar de tarea o inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/manateelazycat/Qwen3.8-Flash-Next-Hibana-Runtime
- Pesos NVFP4 referenciados: https://huggingface.co/RadixArk/Qwen3.8-Flash-Next-NVFP4
- Pesos para Thor referenciados: https://huggingface.co/manateelazycat/Qwen3.8-Flash-Next-Hibana-Thor
