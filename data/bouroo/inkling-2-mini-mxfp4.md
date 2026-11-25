# bouroo/Inkling-2-Mini-MXFP4

## Resumen

Inkling-2-Mini-MXFP4 es una cuantización en formato MXFP4 del modelo multimodal thinkingmachines/Inkling-2-Mini, publicada por el usuario bouroo. Se distribuye en formato GGUF para su uso con llama.cpp y añade un drafter de decodificación especulativa DSpark (también en MXFP4) y un proyector de visión F16, de modo que el conjunto permite inferencia de texto e imagen con aceleración especulativa opcional. El modelo base tiene 26.070.385.152 parámetros totales y una arquitectura MoE (mezcla de expertos) con layout `inkling2`.

La publicación resulta relevante porque ofrece dos layouts alternativos de los mismos pesos (uno de 48 bloques para builds precompilados de Unsloth y otro "looped" para llama.cpp mainline y LM Studio), lo que permite elegir el runtime en función de la compatibilidad en lugar del tamaño. Además, documenta con detalle las limitaciones del soporte del drafter: requiere un PR aún no fusionado en llama.cpp (PR #32218) y no funciona en LM Studio 2.80.1 pese a que su interfaz lo anuncie.

El modelo está pensado para desarrolladores que quieran desplegar localmente un modelo multimodal de ~26B con cuantización de 4 bits y decodificación especulativa, con licencia Apache 2.0 y soporte únicamente del idioma inglés según los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), layout `inkling2` / `inkling2_loop`; multimodal con proyector de visión `inkling2v` |
| Parametros totales | 26.070.385.152 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (los ejemplos de uso emplean `-c 4096`) |
| Tipos de cuantizacion | MXFP4 (target y drafter); proyector de visión en F16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura de mezcla de expertos (MoE) identificada en llama.cpp como `inkling2`. La cuantización conserva los pesos en dos layouts: un layout de 48 bloques (`inkling2`) y un layout "looped" (`inkling2_loop`); ambos contienen los mismos pesos y se diferencian únicamente en cómo los carga el motor de inferencia. En ambos casos las escalas de los expertos están plegadas ("expert scales folded"), según indica la model card.

El paquete incluye un drafter de decodificación especulativa DSpark en MXFP4 (0,18 GB) que implementa la variante `DSPARK_INKLING2`, con una proyección conjunta `joint_proj` de forma `{2*n_embd + 2*rank, 3*rank}` = `{5120, 768}`. Esta variante difiere de la `DSPARK` anterior, que espera `{n_embd + 2*rank, 3*rank}` = `{2816, 768}`. El proyector de visión es el mismo que distribuye Unsloth: 640 px por parche, parches de 20 px y 23 bloques. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés.
- Procesamiento de imágenes mediante el proyector `mmproj-F16.gguf`; el modelo es nativamente multimodal y los GGUF de texto por sí solos no tienen visión.
- Decodificación especulativa opcional con el drafter DSpark, que acelera la generación en ciertos regímenes (ver benchmarks).
- Razonamiento multi-turno y conversacional (tag `conversational`).
- Compatibilidad con endpoints (`endpoints_compatible` según los tags del repositorio).
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, matemáticas o modo de razonamiento explícito.

## Casos de uso

- Asistente conversacional local en inglés: el modelo puede mantener diálogos multi-turno con una ventana de contexto configurable (los ejemplos usan 4096 tokens) y desplegarse en estaciones de trabajo con GPU de consumo mediante llama.cpp.
- Análisis de imágenes con descripción textual: cargando `mmproj-F16.gguf` junto al GGUF de texto, se puede enviar una imagen y obtener una descripción o respuesta en lenguaje natural, útil para catalogación de imágenes o accesibilidad.
- Generación de texto acelerada en local: con el drafter DSpark y `--spec-type draft-dspark --spec-draft-n-max 3`, se obtienen ganancias de throughput en generaciones cortas (de 26,6 a 37,0 tok/s en un listado de 200 tokens sobre M4 Pro), adecuado para asistentes interactivos de respuesta breve.
- Despliegue en LM Studio para prototipado: el layout "looped" carga en LM Studio 2.80.1, lo que permite probar el modelo con interfaz gráfica sin compilar llama.cpp, aunque sin decodificación especulativa.
- Integración en pipelines de CI/CD o herramientas de desarrollo: al ser compatible con `llama-server` y endpoints, puede exponerse como servicio HTTP local para tareas de generación de texto en inglés dentro de flujos automatizados.
- Evaluación e investigación de cuantizaciones MXFP4: el repositorio documenta con detalle las diferencias entre layouts y variantes de drafter, lo que lo convierte en un caso de estudio práctico para medir el impacto de la cuantización de 4 bits y de la decodificación especulativa en modelos MoE.

## Benchmarks y rendimiento

La model card incluye mediciones de velocidad de generación en un Apple M4 Pro de 48 GB con `-c 4096` y `--spec-draft-n-max 3`:

| Prompt | Layout | Sin drafter (tok/s) | Con drafter (tok/s) |
|---|---|---|---|
| Listado de 200 tokens | looped | 26,6 / 26,7 | 37,0 / 38,3 |
| Listado de 200 tokens | 48 bloques | 26,1 | 30,9 |
| Explicación de 400 tokens | looped | 27,0 / 27,0 | 23,3 / 23,2 |
| Explicación de 400 tokens | 48 bloques | 26,2 | 19,0 |

La tasa de aceptación del drafter fue del 26,4 % (52 aceptados de 197 generados, longitud media 1,79) en un turno de chat corto. En generaciones largas el coste del drafter supera la ganancia. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el GGUF target ocupa 14,77 GB, el drafter 0,18 GB y el proyector de visión 0,64 GB; en total unos 15,6 GB de pesos, a los que hay que sumar la caché KV y el overhead del runtime.
- GPU recomendadas: no se especifican en la información disponible; las mediciones se realizaron en un Apple M4 Pro de 48 GB con Metal.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 16 GB o más de VRAM (por ejemplo, RTX 4090 de 24 GB), aunque este dato no está confirmado en la información proporcionada.
- Opciones de despliegue: llama.cpp mainline (layout looped), llama.cpp `29b52d3` + PR #32218 (drafter y ambos layouts), build precompilado de Unsloth `b12588-mix-c0c3de8` (layout de 48 bloques y drafter), LM Studio 2.80.1 (layout looped, sin drafter).
- Latencia y throughput: medidos en M4 Pro 48 GB entre 19,0 y 38,3 tok/s según prompt, layout y uso del drafter (ver tabla de benchmarks).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-MXFP4 (esta ficha) | 26,07 B | no disponible | Apache 2.0 | GGUF | Multimodal, drafter DSpark opcional |
| thinkingmachines/Inkling-2-Mini | no disponible | no disponible | no disponible | safetensors (base) | Modelo base sin cuantizar |
| Alternativas de ~26B en GGUF | no disponible | no disponible | no disponible | GGUF | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento de calidad con modelos alternativos de la misma categoría.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés (`language: en`); no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas.
- El layout de 48 bloques (`Inkling-2-Mini-UD-MXFP4.gguf`) solo funciona con el build precompilado de Unsloth; llama.cpp mainline y LM Studio lo rechazan con el error `check_tensor_dims: tensor 'blk.24.attn_q.weight' not found`.
- El drafter requiere el PR #32218 de llama.cpp, que sigue abierto y sin fusionar; sin él, el motor rechaza sus tensores.
- LM Studio 2.80.1 acepta la configuración del drafter pero la ignora silenciosamente: el `llama-server` generado no recibe `--model-draft` ni `--spec-type`.
- No se debe fijar el drafter a un dispositivo concreto (`-devd`), ya que reutiliza los embeddings y la cabeza de salida del target.
- `--spec-type draft-mtp` no es aplicable: el modelo incluye un drafter DSpark, no una cabeza MTP.
- La decodificación especulativa degrada el rendimiento en generaciones largas (de 27,0 a 23,3 tok/s en el caso de 400 tokens).
- La licencia Apache 2.0 permite uso comercial, pero se desconoce si el modelo base impone restricciones adicionales.
- El repositorio tiene 368 descargas y 0 likes en el momento de la consulta; es una publicación de un tercero, no oficial del desarrollador del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bouroo/Inkling-2-Mini-MXFP4
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- PR de llama.cpp con soporte DSpark: https://github.com/ggml-org/llama.cpp/pull/32218
- Build precompilado de Unsloth: https://github.com/unslothai/llama.cpp/releases/download/b12588-mix-c0c3de8/llama-b12588-mix-c0c3de8-bin-macos-arm64.tar.gz
