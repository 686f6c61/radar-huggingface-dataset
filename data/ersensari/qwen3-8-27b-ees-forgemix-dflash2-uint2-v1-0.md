# ersensari/Qwen3.8-27B-EES-ForgeMix-DFlash2-uint2-v1.0

## Resumen

Este repositorio contiene el modelo de borrador (draft) especulativo complementario para el modelo `ersensari/Qwen3.8-27B-EES-ForgeMix-v1.0`, un derivado cuantizado de `Qwen/Qwen3.8-27B`. No es un modelo de lenguaje independiente: solo puede operar dentro de un runtime de decodificación especulativa (SGLang con algoritmo DFLASH) junto con el modelo objetivo validado. Su función es proponer tokens candidatos que el modelo principal verifica, acelerando la generación sin degradar significativamente la calidad.

El artefacto es un preshard persistente de SGLang con cuantización Humming uint2, tensor parallelism TP2 y 5 capas de draft, con un tamaño de 1,1 GB. Fue desarrollado por un tercero (ersensari) a partir del draft `incoai/Qwen3.8-27B-DFlash2`, que a su vez apunta al modelo base Qwen3.8-27B de Alibaba. La relevancia actual radica en que permite ejecutar un modelo de 27B con decodificación especulativa en hardware de consumo (2x RTX 5060 Ti 16 GB), alcanzando alrededor de 93 tokens por segundo en la configuración recomendada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash2DraftModel (5 capas de draft) |
| Parametros totales | No disponible (5 capas, sin recuento publicado) |
| Parametros activos | No aplica (modelo denso de draft) |
| Longitud de contexto | 64 000 tokens (configuracion validada del target) |
| Tipos de cuantizacion | Humming uint2, group size 64, zero point habilitado |
| Idiomas soportados | No disponible (depende del modelo target) |
| Licencia | Apache-2.0 |
| Formato de pesos | SGLang persistent preshard (safetensors, sin model.safetensors raiz) |

## Arquitectura y entrenamiento

El modelo es un draft de decodificacion especulativa con arquitectura `DFlash2DraftModel`, compuesto por 5 capas que imitan parcialmente el comportamiento del modelo objetivo Qwen3.8-27B. Su bloque nativo de draft tiene tamano 8, aunque la configuracion recomendada de lanzamiento es de 6 tokens especulativos. La cuantizacion Humming uint2 con grupo de 64 y zero point reduce el peso a aproximadamente 1,1 GB, y el formato es un preshard persistente de SGLang pensado para tensor parallelism TP2.

No se dispone de informacion sobre el entrenamiento de este artefacto: es un derivado cuantizado y reempaquetado de `incoai/Qwen3.8-27B-DFlash2`, sin datos publicados sobre dataset, numero de tokens o tecnicas de alineacion. El modelo base Qwen3.8-27B, por su parte, es un modelo denso de 27 000 millones de parametros con 64 capas, tamano oculto 5 120 y vocabulario de 248 320 tokens, entrenado por Alibaba para tareas de texto y vision.

## Capacidades

- No es un modelo generativo autonomo: no puede producir respuestas por si mismo.
- Funciona exclusivamente como borrador especulativo dentro de un runtime SGLang con algoritmo DFLASH.
- Proporciona tokens candidatos que el modelo objetivo verifica, acelerando la inferencia.
- Soporta configuracion de 6 u 8 tokens especulativos, con impacto en rendimiento y calidad.
- Requiere el modelo target `ersensari/Qwen3.8-27B-EES-ForgeMix-v1.0` para funcionar correctamente.
- No anade capacidades de vision, audio ni tool calling propias; estas dependen del modelo objetivo.

## Casos de uso

- Despliegue de EES ForgeMix v1.0 en hardware de consumo: con 2x RTX 5060 Ti 16 GB y TP2, el par draft-target alcanza 93,37 tokens por segundo en una carga de 20 peticiones, permitiendo servir un modelo de 27B en entornos sin GPUs de datacenter.
- Inferencia especulativa en produccion: integrar el draft en un servidor SGLang con `--speculative-algorithm DFLASH` para reducir la latencia por token en aplicaciones de chat o agentes.
- Evaluacion de trade-offs velocidad-calidad: usar la configuracion de 6 tokens (recomendada) frente a 8 tokens para decidir si el incremento de throughput (96,65 tok/s) justifica la caida de HumanEval+ de 0,896 a 0,878.
- Pruebas de compatibilidad de runtime: validar el preshard con el target exacto y la configuracion documentada (TP2, contexto 64 000, page size 1, Mamba ratio 0,50) antes de escalar a otros entornos.
- Investigacion sobre decodificacion especulativa: analizar el comportamiento de aceptacion de tokens (mean accepted length 3,11) y su dependencia de la cuantizacion uint2 del draft.
- Optimizacion de costes de inferencia: al reducir el tamano del draft a 1,1 GB, se minimiza el uso de VRAM adicional frente a un draft en precision completa.

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados corresponden al sistema validado con el target EES ForgeMix v1.0 en 2x RTX 5060 Ti 16 GB, con carga de 20 peticiones y semilla 42:

| Configuracion | Throughput (tok/s) | HumanEval+ |
|---|---|---|
| 6 tokens especulativos (recomendada) | 93,37 | 0,896 |
| 8 tokens especulativos | 96,65 | 0,878 |

No se han publicado resultados de benchmarks adicionales para este draft en la informacion disponible. Los datos de HumanEval+ corresponden al par completo (draft + target), no al draft aislado.

## Requisitos de hardware

- VRAM estimada: el draft ocupa 1,1 GB en cuantizacion uint2; el target EES ForgeMix v1.0 requiere VRAM adicional (no especificada en la ficha, pero al ser un modelo de 27B cuantizado, se estima entre 8 y 16 GB segun cuantizacion).
- GPU recomendadas: 2x NVIDIA RTX 5060 Ti 16 GB (SM120) validadas; se requiere tensor parallelism TP2, por lo que al menos 2 GPUs son obligatorias.
- No cabe en una unica GPU consumer de 16 GB si se usa TP2; el preshard esta disenado para 2 GPUs.
- Opciones de despliegue: SGLang con algoritmo DFLASH, usando los flags documentados (`--speculative-algorithm DFLASH`, `--speculative-draft-model-path`, etc.).
- Latencia y throughput: 93,37 tok/s con 6 tokens y 20 peticiones concurrentes; la latencia por peticion no se ha publicado.
- Requiere NCCL_P2P_DISABLE=1 y `--disable-custom-all-reduce` en el entorno validado (PCIe PHB sin P2P/NVLink).

## Comparativa con modelos similares

No se dispone de datos publicados sobre otros drafts especulativos comparables para Qwen3.8-27B. Como referencia, se compara con el modelo base y el target:

| Modelo | Parametros | Contexto | Cuantizacion | Formato | Licencia |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (base) | 27B | 64 000 (estimado) | FP16/BF16 | Transformers | Apache-2.0 |
| ersensari/Qwen3.8-27B-EES-ForgeMix-v1.0 (target) | 27B | 64 000 | No especificada | Transformers/SGLang | Apache-2.0 |
| ersensari/Qwen3.8-27B-EES-ForgeMix-DFlash2-uint2-v1.0 (draft) | 5 capas (sin recuento) | 64 000 (validado) | Humming uint2 | SGLang preshard | Apache-2.0 |

No hay alternativas directas de draft especulativo con cuantizacion uint2 y TP2 publicadas en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo autonomo: no puede generar respuestas por si mismo y requiere el target EES ForgeMix v1.0 y un runtime SGLang especifico.
- El preshard esta atado a TP2 y a la serializacion concreta de SGLang/Humming; no es un checkpoint estandar de Transformers y no incluye `model.safetensors` raiz.
- La compatibilidad con otros targets Qwen3.8 no esta validada, aunque la carga pueda tener exito.
- Cambios en el runtime (numero de tokens de draft, page size, asignacion de Mamba, kernels, sampling) pueden alterar las salidas greedy observadas; se recomienda revalidar la calidad tras cualquier modificacion.
- El draft no anade capa de seguridad: los riesgos del modelo upstream y del target (sesgos, alucinaciones, generacion de codigo inseguro) permanecen.
- El codigo y las tool calls generadas requieren revision, sandboxing y privilegios minimos en entornos de produccion.
- La licencia Apache-2.0 permite uso comercial, pero el operador es responsable de privacidad, control de acceso, cumplimiento normativo y seguridad del despliegue.
- No se han publicado datos sobre sesgos especificos ni evaluaciones de seguridad para este artefacto.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ersensari/Qwen3.8-27B-EES-ForgeMix-DFlash2-uint2-v1.0
- Modelo target: https://huggingface.co/ersensari/Qwen3.8-27B-EES-ForgeMix-v1.0
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Draft upstream: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Proyecto DFlash: https://github.com/z-lab/dflash
- Motor de inferencia SGLang: https://github.com/sgl-project/sglang
