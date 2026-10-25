# 1bit-MONSTER/Qwen3.8-27B-DFlash2-GGUF

## Resumen

Este repositorio no contiene un modelo de lenguaje autónomo, sino las conversiones a GGUF del borrador (*drafter*) DFlash 2 para el modelo objetivo `Qwen/Qwen3.8-27B`. Lo publica el usuario 1bit-MONSTER partiendo de `z-lab/Qwen3.8-27B-DFlash2`, a su vez espejo de `incoai/Qwen3.8-27B-DFlash2`, bajo licencia Apache-2.0. Los pesos son los del borrador original, únicamente convertidos y cuantizados: no ha habido reentrenamiento ni ajuste fino.

El modelo resuelve un problema muy concreto: acelerar la inferencia de Qwen3.8-27B mediante decodificación especulativa. DFlash2 emplea una arquitectura de difusión por bloques que predice bloques completos de tokens en una sola pasada y mantiene candidatos top-k por posición; un selector ligero traza después la ruta coherente. El modelo objetivo verifica cada token propuesto, de modo que la salida final es siempre la del modelo grande, no la del borrador.

Su relevancia es práctica: los 27 B del nombre hacen referencia al modelo que acelera, no a su propio tamaño. El borrador tiene 1.924.404.480 parámetros (unos 1,92 B) y ocupa 2,06 GB en Q8_0 o 1,21 GB en Q4_K, por lo que se ejecuta junto al modelo objetivo en el mismo servidor añadiendo un coste de memoria y cómputo reducido. El repositorio se creó el 25 de octubre de 2026 y no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Block-diffusion (DFlash 2) con selector top-k; modelo borrador para decodificacion especulativa, no autonomo |
| Parametros totales | 1.924.404.480 (~1,92 B); los 27 B del nombre corresponden al modelo objetivo Qwen3.8-27B |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (2,06 GB) y Q4_K (1,21 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (convertido desde los pesos originales del borrador) |

Metadatos específicos incluidos en ambos ficheros GGUF: `dflash.block_size = 8` (siete tokens propuestos por cada paso de verificación) y `dflash.selector_top_k = 16`.

## Arquitectura y entrenamiento

DFlash 2 es un borrador de decodificación especulativa basado en difusión por bloques: en lugar de generar token a token, predice un bloque completo en una sola pasada y mantiene hasta `selector_top_k = 16` candidatos en cada posición del bloque. Un selector ligero recorre esos candidatos para trazar una secuencia coherente que se envía al modelo objetivo para su verificación. Con `block_size = 8`, cada paso de verificación cubre siete tokens propuestos más el token de ancla.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados ni si hubo fases de RLHF o DPO en el borrador original. En este repositorio no se ha realizado ningún entrenamiento: el proceso documentado consiste en descargar los ficheros de configuración y tokenizador de `Qwen/Qwen3.8-27B`, convertir el borrador con `convert_hf_to_gguf.py --outtype bf16` y cuantizar después con `llama-quantize` a Q8_0 y Q4_K, usando el fork `1bit-MONSTER/llama.cpp` (rama `1bit/hrx-vulkan-patched`). Ese fork incorpora el soporte DFlash2 del *upstream* (`ggml-org/llama.cpp#27816`) más los cambios del runtime HRX.

## Capacidades

- Generación de tokens especulativos para decodificación: propone bloques de hasta siete tokens que el modelo Qwen3.8-27B verifica y acepta o descarta.
- Aceleración de inferencia en modo *draft*: no produce texto por sí solo, sino que reduce el número de pasos de decodificación del modelo objetivo.
- Soporte de decodificación especulativa en llama.cpp mediante `--spec-type draft-dflash -md <fichero GGUF>` con el fork indicado.
- Integración con el motor `1bit serve` mediante el flag `--dflash`, exclusivo con `--mtp`.
- Selección top-k de candidatos por posición, lo que permite explorar varias continuaciones plausibles dentro del mismo bloque.
- Compatibilidad con el tokenizador y la configuración de Qwen3.8-27B, requisito imprescindible para que la verificación sea válida.
- No dispone de tool calling, capacidades de agente, visión, audio ni modo *thinking* propios: cualquier funcionalidad de ese tipo proviene del modelo objetivo.

## Casos de uso

- Servicio de asistencia a la programación: al emparejarse con un GGUF de Qwen3.8-27B, DFlash2 propone bloques largos que encajan bien con código, por lo que reduce el número de pasos de verificación en autocompletado y generación de funciones.
- Generación de salida estructurada (JSON, YAML, SQL): los bloques de ocho tokens con selector top-k rinden especialmente bien en texto altamente predecible, lo que se traduce en una tasa de aceptación alta y menor latencia por petición.
- Servido de chat conversacional en producción: para turnos cortos el propio autor recomienda el cabezal MTP integrado (`--mtp`); DFlash2 se reserva para cargas donde el coste del borrador se amortiza con bloques aceptados.
- Pipelines de CI/CD con generación de código: la aceleración permite ejecutar tareas de generación y revisión de parches dentro de un presupuesto de latencia ajustado, manteniendo la calidad del modelo de 27 B.
- Despliegue en una sola GPU de consumo: el borrador en Q4_K ocupa solo 1,21 GB, de modo que puede convivir con el modelo objetivo cuantizado en una tarjeta con memoria limitada.
- Evaluación comparativa de estrategias de decodificación especulativa: permite medir la tasa de aceptación y el *throughput* de DFlash2 frente al cabezal MTP usando exactamente el mismo modelo objetivo.
- Servicio de documentación técnica o generación de informes largos: la propuesta por bloques favorece la prosa estructurada y repetitiva, aunque el autor advierte que subir `--spec-draft-p-min` por encima de cero descarta bloques y ralentiza la prosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni métricas de tasa de aceptación o *speedup*. Los únicos datos cuantitativos disponibles son los metadatos del borrador (`block_size = 8`, `selector_top_k = 16`) y los tamaños de fichero (2,06 GB en Q8_0 y 1,21 GB en Q4_K).

## Requisitos de hardware

- VRAM: el borrador suma 2,06 GB en Q8_0 o 1,21 GB en Q4_K a la memoria exigida por el modelo Qwen3.8-27B que se use como objetivo; el total no está disponible en la información proporcionada.
- GPU recomendadas: no disponibles para este componente por separado. El fork de referencia incluye una rama con soporte Vulkan (`1bit/hrx-vulkan-patched`), lo que sugiere ejecución sobre GPUs de consumo y estaciones de trabajo con ese backend.
- GPU de consumo: sí cabe, dado que el borrador es de 1,21-2,06 GB; la viabilidad final depende de que el modelo objetivo de 27 B cuantizado quepa en la misma tarjeta.
- Opciones de despliegue: motor `1bit` (`1bit serve -m modelo_objetivo.gguf --device hrx --dflash Qwen3.8-27B-DFlash2-q8_0.gguf`) o `llama-server` del fork `1bit-MONSTER/llama.cpp` con `--spec-type draft-dflash -md`.
- Configuración recomendada por el autor: mantener `--spec-draft-p-min 0` (receta integrada del motor) para conservar los bloques completos de ocho tokens; Q8_0 es la cuantización que el propio README del borrador prefiere sobre BF16.
- Latencia y throughput: no disponibles. Cualquier cifra de aceleración depende de la tasa de aceptación del modelo objetivo y del tipo de texto generado.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 1bit-MONSTER/Qwen3.8-27B-DFlash2-GGUF | Borrador DFlash2 en GGUF (Q8_0, Q4_K) | ~1,92 B | no disponible | Apache-2.0 | HuggingFace, requiere fork de llama.cpp o motor 1bit |
| Cabezal MTP integrado de Qwen3.8-27B (`--mtp`) | Borrador incluido en el modelo objetivo | no disponible | el del modelo objetivo | Apache-2.0 | Uso directo con el flag `--mtp`; recomendado para turnos de chat cortos |
| z-lab/Qwen3.8-27B-DFlash2-GGUF | Conversión GGUF del mismo borrador por el autor original | ~1,92 B | no disponible | Apache-2.0 | HuggingFace; reporta 56,7 GB de repo y 330.563 descargas según el agregador local-ai-zone |
| Qwen3.8-27B-UD-Q4_K_XL-MTP | Modelo objetivo cuantizado con cabezal MTP | 27 B (nominal) | no disponible | Apache-2.0 | HuggingFace (1bit-MONSTER) |

La diferencia funcional clave frente al cabezal MTP es el tamaño de bloque: DFlash2 propone bloques más largos y rinde mejor en código y salida estructurada, mientras que MTP sigue siendo la opción por defecto para conversaciones cortas. No se dispone de datos de rendimiento que permitan cuantificar esa diferencia.

## Limitaciones y advertencias

- No es un modelo autónomo: no puede cargarse solo ni generar respuestas sin un Qwen3.8-27B que verifique sus propuestas. Usarlo como modelo principal produce resultados inválidos.
- Requiere infraestructura específica: el fork `1bit-MONSTER/llama.cpp` (rama `1bit/hrx-vulkan-patched`) o el motor `1bit`. El llama.cpp estándar no soporta DFlash2 sin ese parche.
- El flag `--dflash` es exclusivo con `--mtp`: no pueden combinarse en el mismo servidor.
- Aumentar `--spec-draft-p-min` por encima de cero descarta bloques y ralentiza la generación de prosa, según advierte el propio autor.
- Sesgos: no documentados en la información disponible. Al heredar el comportamiento del modelo objetivo, cualquier sesgo de Qwen3.8-27B se manifiesta en la salida final.
- Alucinación: la verificación del modelo objetivo limita el riesgo de tokens espurios, pero el contenido generado sigue siendo el de Qwen3.8-27B y conserva sus tasas de error factual.
- Idiomas y contexto: no disponibles para el borrador; dependen enteramente del modelo objetivo emparejado.
- Licencia: Apache-2.0 permite uso comercial, pero conviene revisar también las condiciones del modelo objetivo y del borrador original en `z-lab` o `incoai`.
- Madurez: repositorio creado el 25 de octubre de 2026, sin descargas ni valoraciones, y sin benchmarks publicados. No hay evidencia de uso en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/1bit-MONSTER/Qwen3.8-27B-DFlash2-GGUF
- Borrador original (espejo): https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo objetivo cuantizado con MTP: https://huggingface.co/1bit-MONSTER/Qwen3.8-27B-UD-Q4_K_XL-MTP
- Fork de llama.cpp: https://github.com/1bit-MONSTER/llama.cpp (rama `1bit/hrx-vulkan-patched`)
- Motor 1bit: https://github.com/1bit-MONSTER/engine
- Pull request de soporte DFlash2 en upstream: https://github.com/ggml-org/llama.cpp/pull/27816
- Ficha del borrador en aimodels.fyi (z-lab): https://www.aimodels.fyi/models/huggingFace/qwen3.8-27b-dflash2-gguf-z-lab
- Ficha del borrador en aimodels.fyi (incoai): https://www.aimodels.fyi/models/huggingFace/qwen3.8-27b-dflash2-gguf-incoai
- Agregador de modelos GGUF: https://local-ai-zone.github.io/models/qwen3-8-27b-dflash2.html
