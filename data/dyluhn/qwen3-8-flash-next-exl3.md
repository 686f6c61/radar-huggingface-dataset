# Dyluhn/qwen3.8-flash-next-exl3

## Resumen

`Dyluhn/qwen3.8-flash-next-exl3` es un contenedor de inferencia en formato `.rad` para el runtime radiance, publicado por el usuario Dyluhn, que empaqueta el modelo Qwen3.8-Flash-Next con sus expertos enrutados cuantizados en EXL3. No es un modelo entrenado desde cero ni un ajuste fino: es una redistribucion cuantizada del contenedor de radiance `StillDeadcode/qwen3.8-next-flash-fp8-iq4r-moe`, en la que se sustituye unicamente la regla de cuantizacion de los expertos enrutados (tanto del tronco como de la cabeza MTP) por la conversion EXL3 de turboderp a 4,05 bpw. Todas las demas ponderaciones (tronco de atencion y delta-net, expertos compartidos, `lm_head` en int8, tabla de n-gramas y expertos protegidos en bf16) son identicas byte a byte al contenedor de referencia.

El modelo subyacente es un transformer de tipo mezcla de expertos (MoE) con expertos compartidos y enrutados, cabeza de prediccion multi-token y decodificacion especulativa. El objetivo declarado de esta variante es reducir la divergencia respecto al modelo bf16 manteniendo el rendimiento en hardware AMD: frente al contenedor base, la KL media baja de 0,0537 a 0,0467 (-12,9%), la perplejidad baja de 4,0983 a 4,0507 y la aceptacion del borrador en decodificacion especulativa sube de ~53-55% a ~62-65% con C=1-4.

Su relevancia es acotada pero especifica: es una pieza de infraestructura para desplegar un MoE grande en GPUs RDNA4 (gfx1201) con radiance 1.4.0 y un plugin externo, midiendo de forma reproducible la perdida de calidad introducida por la cuantizacion. El repositorio tiene 120,5 GB, 0 descargas y 0 likes en el momento de la consulta, y la licencia es la qwen-community-license-1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (expertos enrutados + expertos compartidos) sobre tronco transformer con atencion y "delta-net"; incluye cabeza MTP y tabla de n-gramas |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 200.000 tokens en el ejemplo de servicio del autor (`--max-model-len 200000`); la longitud nativa del modelo base no se indica |
| Tipos de cuantizacion | Expertos enrutados en EXL3 a 4,05 bpw (tronco y cabeza MTP); `lm_head` en int8; expertos protegidos en bf16; contenedor base alternativo con expertos fp8 / iq4r; KV-cache en fp8 |
| Idiomas soportados | no disponible (el set de evaluacion KL incluye texto multilingue) |
| Licencia | qwen-community-license-1.0 (etiquetada como `license: other`) |
| Formato de pesos | `.rad` (contenedor propietario de radiance); el archivo `qwen3.8-flash-next-exl3.rad` ocupa 120.531.828.736 B (112,3 GiB) |

Metadatos adicionales: `library_name: radiance`, tags `radiance`, `exl3`, `moe`, `rocm`, `gfx1201`, `base_model:Qwen/Qwen3.8-Flash-Next`, region `us`. Creado y actualizado el 2026-10-13. Pipeline no disponible. SHA-256 del contenedor: `187ae8186cc1f2ba8bce96565592af7fc6f6ec91c9ece6b4d352eaf0432ee26f`.

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un MoE con expertos enrutados y compartidos, un tronco de atencion mas una ruta denominada delta-net, una cabeza MTP (prediccion multi-token) y una tabla de n-gramas. Esta ficha no dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base, por lo que esos datos se marcan como no disponibles.

La innovacion de este contenedor es exclusivamente de cuantizacion y despliegue. Los expertos enrutados del tronco y de la cabeza MTP proceden de la conversion EXL3 de turboderp a 4,05 bpw (rama `4.05bpw_h6_ng6`, commit `55a732e0c4c3d4614bc42b68493bb930d9b02c0a`); el resto de pesos se copian byte a byte del contenedor `StillDeadcode/qwen3.8-next-flash-fp8-iq4r-moe`. Para ejecutarlo se necesita el plugin externo `Dyluhn/radiance-exl3`, que anade los kernels de expertos EXL3 y la arquitectura `("qwen4exp", "exl3")` a radiance 1.4.0 sin modificar el runtime. La decodificacion especulativa se activa con `--num-speculative-tokens 3` y usa la cabeza MTP como borrador.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Qwen3.8-Flash-Next; no hay evaluacion publicada en esta ficha sobre capacidades concretas.
- Procesamiento de contexto largo: el ejemplo de servicio configura 200.000 tokens de ventana y la evaluacion de calidad incluye un documento largo de 12.000 tokens.
- Texto multilingue: el conjunto de referencia `ref64` estratifica documentos en varias lenguas, aunque no se detalla la lista de idiomas soportados.
- Codigo y matematicas: son dos de las categorias estratificadas del set de evaluacion, lo que indica que el modelo base los cubre, pero no se aportan puntuaciones de HumanEval, MBPP o GSM8K.
- Trazas de agente: el set de evaluacion incluye "agent traces", lo que sugiere uso en flujos multi-paso, si bien no se documentan capacidades de tool calling o function calling.
- Decodificacion especulativa con MTP: soportada en el runtime, con aceptacion de borrador medida entre ~53% y ~65% segun el nivel de concurrencia.
- No se documentan capacidades de vision, audio, thinking mode explicito ni soporte de herramientas.

## Casos de uso

- Servicio de inferencia on-premise sobre AMD: el contenedor esta pensado para desplegarse con radiance 1.4.0 en dos Radeon AI PRO R9700 (gfx1201, 32 GB) con `--tp 2`; encaja en entornos que exigen que los datos no salgan de la infraestructura propia y que ya operan con ROCm.
- Analisis de documentos largos: con `--max-model-len 200000` y KV-cache en fp8 puede procesar informes extensos, expedientes o bases de codigo completas sin trocear el contexto; la evaluacion incluye un documento de 12.000 tokens como control de deriva.
- Generacion de codigo asistida en pipelines internos: el set de evaluacion estratifica codigo y el prefill medido (3.083 tok/s con prompt de 8K y 3.726 tok/s con 24K) permite alimentar prompts con fragmentos amplios de repositorio.
- Atencion a cliente multi-turno con contexto largo: con 8 secuencias concurrentes el sistema mantiene 652-716 tok/s con MTP activado, suficiente para conversaciones simultaneas con historial extenso en una sola instancia.
- Agentes y razonamiento multi-paso: las trazas de agente forman parte del set de calidad y la decodificacion especulativa reduce el coste por paso, lo que favorece bucles de razonamiento con muchas llamadas cortas.
- Traduccion y tratamiento de texto multilingue: al incluir texto multilingue en la estratificacion de calidad se puede usar como motor de traduccion o normalizacion, siempre que se valide el par de idiomas concreto antes de produccion.
- Evaluacion de cuantizaciones en laboratorio: la metodologia KL contra el modelo bf16 sobre 52.132 posiciones puntuadas hace de este contenedor una referencia util para comparar recetas de cuantizacion sobre el mismo MoE.
- Despliegue de alto rendimiento en 2 GPUs: la configuracion `--placement expert_tiered` con pool de host de 11.793 MiB permite servir un MoE de 112,3 GiB en 64 GB de VRAM recurriendo a memoria fijada del sistema.

## Benchmarks y rendimiento

Calidad medida con el modo KL de radiance contra el modelo bf16 sobre `ref64` (64 documentos, 52.260 tokens, 52.132 posiciones puntuadas, estratificado en codigo, temas de nicho, prosa, matematicas, multilingue y trazas de agente). Cada ejecucion se repitio dos veces con filas identicas byte a byte.

| Metrica | Contenedor base (expertos fp8 / iq4) | Este contenedor (expertos EXL3) |
|---|---|---|
| KL media vs bf16 | 0,0537 | 0,0467 (-12,9%; IC 95% de la diferencia [-0,0102, -0,0041]) |
| Acuerdo top-1 | 93,6% | 94,0% |
| Perplejidad (bf16: 4,0775) | 4,0983 (x1,0051) | 4,0507 (x0,9934) |

Reevaluado sobre los kernels entregados a tp2: KL media 0,0467 y top-1 94,06%. La KL es inferior a la del base en todos los segmentos (codigo, largo, matematicas, multilingue, nicho y prosa, con intervalos del 95% por debajo de cero; en agente, -0,022 con un intervalo que incluye el cero).

Decodificacion con MTP desactivado, en milisegundos por paso (menos es mejor):

| Secuencias concurrentes | Base | Este contenedor |
|---|---|---|
| 1 | 10,76-10,78 | 10,86-10,88 |
| 2 | 10,88-10,89 | 10,91-10,92 |
| 4 | 12,01-12,03 | 11,84-11,87 |
| 8 | 14,05-14,06 | 14,02-14,06 |

Decodificacion con MTP activado (`--num-speculative-tokens 3`), en tokens por segundo agregados (mas es mejor):

| Secuencias concurrentes | Base | Este contenedor | Ganancia | Aceptacion del borrador (base -> este) |
|---|---|---|---|---|
| 1 | 167-169 | 177 | +5% | ~55% -> ~65% |
| 2 | 248-253 | 291-293 | +16% | ~53% -> ~65% |
| 4 | 388-397 | 438-482 | +10-24% | ~53% -> ~62-64% |
| 8 | 445-516 | 652-716 | +26-61% | ~39-48% -> ~53-58% |

Prefill y tiempo hasta el primer token:

| Metrica | Base | Este contenedor |
|---|---|---|
| Prefill, prompt de 8K tokens | 1.525-1.528 tok/s | 3.083 tok/s |
| Prefill, prompt de 24K tokens | 1.578-1.580 tok/s | 3.726 tok/s |
| TTFT p50, 1 peticion | 166-175 ms | 118 ms |
| TTFT p50, 8 concurrentes | 1.233-1.243 ms | 375 ms |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM: se requieren dos tarjetas de 32 GB (64 GB en total); el contenedor pesa 112,3 GiB y se sirve con reparto entre VRAM y memoria de host.
- GPU compatibles: el autor solo documenta Radeon AI PRO R9700 (gfx1201, RDNA4). Los kernels de dispositivo estan compilados exclusivamente para gfx1201, por lo que no funcionan en otras arquitecturas.
- Memoria de host: unos 65 GiB de RAM libre para memoria fijada; el ejemplo usa `--host-pool-mib 11793` frente a los 12288 del contenedor base para el mismo reparto de VRAM.
- GPU de consumo: no cabe en ninguna GPU de consumo actual; el propio autor advierte que el valor por defecto de `--max-num-seqs` (256) no entra en una tarjeta de 32 GB y recomienda mantenerlo bajo (el ejemplo usa 8).
- Despliegue: exclusivamente radiance 1.4.0 (imagen `stilldeadcode/radiance:1.4.0`) con el plugin home de `Dyluhn/radiance-exl3` montado por delante de la ruta propia del runtime mediante `RADIANCE_HOME=/plugins:/opt/radiance/share/radiance`. No se indica soporte para vLLM, llama.cpp, Ollama o TGI, y el formato `.rad` no es GGUF.
- Interconexion: en las pruebas, una tarjeta iba por PCIe Gen5 x16 y otra por Gen4 x4; con MTP desactivado a 8 secuencias la tarjeta de la ruta estrecha alcanza su limite de potencia.
- Rendimiento de referencia en esa configuracion: 118 ms de TTFT p50 con una peticion, 375 ms con 8 concurrentes, y 652-716 tok/s agregados a 8 secuencias con MTP activado.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Calidad / rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Dyluhn/qwen3.8-flash-next-exl3 | Contenedor radiance, expertos EXL3 4,05 bpw | no disponible | 200.000 tokens en la config de ejemplo | KL 0,0467; perplejidad 4,0507; 652-716 tok/s a C=8 con MTP | qwen-community-license-1.0 | Publico en HuggingFace, 0 descargas, requiere plugin externo y gfx1201 |
| StillDeadcode/qwen3.8-next-flash-fp8-iq4r-moe | Contenedor radiance, expertos fp8 / iq4r | no disponible | mismo tronco y misma config | KL 0,0537; perplejidad 4,0983; 445-516 tok/s a C=8 con MTP | no disponible | Publico en HuggingFace (referencia base de esta receta) |
| turboderp/Qwen3.8-Flash-Next-exl3 | Conversion EXL3 (rama `4.05bpw_h6_ng6`) | no disponible | no disponible | Origen de los expertos enrutados usados en este contenedor | no disponible | Publico en HuggingFace |
| Qwen/Qwen3.8-Flash-Next (bf16) | Modelo base completo | no disponible | no disponible | Referencia de calidad: perplejidad 4,0775 | qwen-community-license-1.0 | Publico en HuggingFace |

No se dispone de datos de parametros, contexto ni benchmarks estandar para ninguna de las alternativas, por lo que la comparacion se limita a las metricas de calidad y velocidad publicadas por el autor.

## Limitaciones y advertencias

- Divergencia inevitable respecto al modelo bf16: la KL media de 0,0467 implica que la salida no es identica a la de referencia; el propio autor publica el intervalo de confianza de la mejora, que en el segmento de trazas de agente incluye el cero.
- Decodificacion a C=1 con MTP desactivado: el contenedor queda ~0,1 ms por paso por detras del base, empata a C=2 y C=8 y solo va por delante a C=4.
- Restriccion de hardware severa: kernels compilados solo para gfx1201 (RDNA4), con dos tarjetas de 32 GB y ~65 GiB de RAM de host. No hay ruta de despliegue documentada fuera de radiance.
- Dependencia de un plugin de terceros: sin `Dyluhn/radiance-exl3` y la arquitectura `("qwen4exp", "exl3")` el contenedor no arranca; se anade superficie de mantenimiento y de compatibilidad de versiones sobre radiance 1.4.0.
- Configuracion delicada de memoria: `--max-num-seqs` por defecto (256) no cabe en 32 GB y `--host-pool-mib` debe ajustarse al mismo reparto de VRAM que el contenedor base para que las comparaciones sean validas.
- Licencia: qwen-community-license-1.0, marcada como `other`. Es una licencia especifica de Qwen, no una licencia de codigo abierto estandar; hay que revisar sus condiciones antes de cualquier uso comercial.
- Idiomas soportados no documentados: no se puede asumir cobertura de una lengua concreta a partir de la estratificacion multilingue del set de evaluacion.
- Riesgo de alucinacion: no se aportan datos especificos para este contenedor; aplica el comportamiento del modelo base, no evaluado en esta ficha.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia, sin pipeline declarado. Es material experimental de un autor individual, no un artefacto con soporte.
- La model card original aparece truncada en la seccion de limitaciones conocidas; podria haber avisos adicionales no recogidos aqui.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dyluhn/qwen3.8-flash-next-exl3
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Contenedor de referencia de radiance: https://huggingface.co/StillDeadcode/qwen3.8-next-flash-fp8-iq4r-moe
- Conversion EXL3 de los expertos (turboderp): https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Plugin radiance-exl3 (kernels EXL3): https://github.com/Dyluhn/radiance-exl3
- Guia de resolucion de problemas del plugin: https://github.com/Dyluhn/radiance-exl3 (archivo `docs/TROUBLESHOOTING.md`)
- Perfil del publicador de radiance: https://huggingface.co/StillDeadcode
- Imagen de contenedor de radiance 1.4.0: `stilldeadcode/radiance:1.4.0`

No se han encontrado otros enlaces relevantes sobre este modelo en la busqueda web realizada.
