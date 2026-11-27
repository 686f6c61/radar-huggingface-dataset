# Davidmg0815/Qwen3.8-Flash-Next-MTP-256exp-GGUF

## Resumen

Qwen3.8-Flash-Next-MTP-256exp-GGUF es una cuantización GGUF del cabezal MTP (multi-token prediction) del modelo Qwen3.8-Flash-Next, un MoE de aproximadamente 176.000 millones de parámetros, podado de 512 a 256 expertos. Lo publica el usuario Davidmg0815 en Hugging Face y su propósito es habilitar decodificación especulativa nativa mediante `--spec-type draft-mtp` en llama.cpp. El repositorio contiene únicamente el cabezal de borrador (unos 2.800 millones de parámetros reales según los safetensors), no el modelo principal, que debe descargarse por separado desde los repositorios base.

La relevancia de esta ficha es práctica: documenta, con mediciones reales sobre 2× RTX 3080 de 20 GB, cómo integrar un cabezal MTP separado en llama.cpp, qué parches del upstream son necesarios y qué ganancias de throughput se obtienen según el tipo de texto (código frente a prosa). El autor concluye que, con el kernel corregido, el cabezal original de 512 expertos en Q4_K_M rinde mejor que esta variante podada de 256 expertos, lo que convierte este repo en una alternativa de menor tamaño (2,8 GB frente a 4,1 GB) a costa de una tasa de aceptación inferior.

La licencia es `qwen-community-1.0`, heredada del modelo base, y el formato es GGUF compatible con llama.cpp. No se dispone de información sobre pipeline, idiomas soportados ni benchmarks estándar en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer con cabezal MTP separado (multi-token prediction) para decodificacion especulativa |
| Parametros totales | 2.619.602.688 (cabezal MTP incluido en el repo) |
| Parametros activos | no disponible (el modelo principal es un MoE de 176B podado de 512 a 256 expertos) |
| Longitud de contexto | no disponible en el repo; el autor reporta configuraciones de servicio de 2×96K, 3×64K y 1×192K con el modelo principal |
| Tipos de cuantizacion | Q8_0, Q6_K, Q4_K_M (variantes del cabezal); el autor usa Q4_K_M en produccion |
| Idiomas soportados | no disponibles |
| Licencia | qwen-community-1.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El artefacto es un cabezal MTP, es decir, un módulo de predicción multi-token que se carga como modelo independiente en llama.cpp y actúa como borrador en decodificación especulativa. El modelo principal asociado es un MoE de 176.000 millones de parámetros con 256 expertos (podado desde 512) y matrices BF16 delgadas correspondientes a hiperconexiones (`hc_*`, 10240×320), routers e indexer, que suman aproximadamente 1,5 GB. El cabezal se carga con su propio `expert_count`, de modo que un cabezal de 512 expertos funciona sin modificar sobre el modelo podado a 256.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si hubo RLHF o DPO. La innovación técnica relevante no está en el entrenamiento sino en la integración: se requiere una build de llama.cpp con el commit "Qwen4Exp: add MTP" (#29761, 2026-10-01), el parche de un solo hunk incluido en este repo (sin él, `-md <head-only file>` aborta con `GGML_ASSERT(buffer) failed`), y idealmente los PRs #29633 (kernel BF16 multi-token) y #29825 (buffers de cómputo reducidos). El autor documenta que el sobrecoste fijo de tokens en GPU se debía a que `mmvf.cu` solo usa el kernel vectorial BF16 cuando `ne11 == 1`; a partir de 2 tokens por paso cae a cuBLAS/MMF y el tiempo BF16 pasa de 4,2 a 15,9 ms por paso.

## Capacidades

- Decodificación especulativa: actúa como cabezal borrador para acelerar la generación del modelo principal en llama.cpp.
- Generación de código: tasas de aceptación del 86-91 % en código según la variante del cabezal.
- Generación de prosa: tasas de aceptación del 43-49 % en prosa, inferiores a las de código.
- Soporte de tool calling: el autor confirma que las llamadas a herramientas funcionan con el modelo principal y el cabezal activo.
- Razonamiento multi-paso: confirmado operativo en la configuración de producción del autor.
- Compatibilidad con endpoints: etiqueta `endpoints_compatible` en el repo.
- Capacidad multimodal: el autor usa `--no-mmproj-offload` porque el proyector de visión del modelo principal agota la VRAM de la tarjeta 0 bajo carga, lo que implica soporte de visión en el modelo base.
- Capacidades multilingües: no disponibles; el autor solo reporta pruebas en inglés (código y prosa) y alemán (prosa, ~60 % de aceptación).

## Casos de uso

- Aceleración de servidores de inferencia con llama.cpp: cargar este cabezal con `--spec-type draft-mtp --spec-draft-n-max 2` para elevar el throughput de código de 61,6 a 92,7-99,4 tok/s en configuraciones de dos GPU de 20 GB.
- Despliegue en hardware con VRAM ajustada: al ocupar 2,8 GB (Q8_0) o 1,8 GB (Q4_K_M) frente a los 4,1 GB del cabezal original de 512 expertos, permite liberar VRAM para KV cache o para una sesión adicional en GPUs de 20 GB.
- Generación de código en pipelines de CI/CD: con aceptación del 86-91 % en código, reduce el tiempo de generación de parches y tests automatizados en flujos que ya usan llama.cpp como backend.
- Asistentes conversacionales multi-turno: el autor valida 2 sesiones concurrentes de 96K tokens llenas hasta 88K simultáneamente, con velocidad de ~62 tok/s a 30K y ~34 tok/s a 88K de contexto.
- Evaluación comparativa de cabezales MTP: sirve como referencia para medir el compromiso entre número de expertos y bits de cuantización antes de fijar una configuración de producción.
- Investigación sobre decodificación especulativa: el repo documenta con detalle las condiciones de fallo (OOM con 3×96K, caída de throughput con `--parallel 3`) y los parches necesarios, lo que facilita reproducir experimentos.
- Procesamiento de documentos largos en alemán o inglés: con 2×96K de contexto y aceptación del ~60 % en prosa alemana, es viable para resumen y extracción sobre corpus extensos.

## Benchmarks y rendimiento

El autor publica mediciones de throughput y tasa de aceptación sobre 2× RTX 3080 de 20 GB, servidor con 1 slot, `n-max 2`, 3 ejecuciones por celda y temperatura 0. No son benchmarks estándar (MMLU, HumanEval, GSM8K); son métricas de serving.

| Cabezal | Tamano | Codigo tok/s (aceptacion) | Prosa tok/s (aceptacion) |
|---|---|---|---|
| Ninguno | – | 61,6 | 61,4 |
| 512 expertos Q8_0 | 3,9 GB | 94,2 (89 %) | 68,6 (49 %) |
| 512 expertos Q6_K | 3,2 GB | 96,6 (87 %) | 70,8 (49 %) |
| 512 expertos Q4_K_M (en uso) | 2,6 GB | 99,4 (91 %) | 70,3 (47 %) |
| 256 expertos Q8_0 (este repo) | 2,7 GB | 92,7 (87 %) | 64,7 (43 %) |
| 256 expertos Q6_K | 2,2 GB | 94,9 (86 %) | 66,2 (43 %) |
| 256 expertos Q4_K_M | 1,8 GB | 97,1 (89 %) | 68,1 (45 %) |

Mediciones de concurrencia (400 tokens por petición, temperatura 0, thinking desactivado):

| Configuracion | Codigo, 1 peticion | Codigo, todos los slots | Prosa, 1 peticion | Prosa, todos los slots |
|---|---|---|---|---|
| A: 512 Q4_K_M, 2×96K (en uso) | 95,7 | 125,2 (2 concurrentes) | 72,0 | 102,7 (2 concurrentes) |
| B: eudaimonent 256 Q4_0, 3×80K | 93,3 | 116,3 (3 concurrentes) | 67,7 | 84,3 (3 concurrentes) |
| C: 512 Q4_K_M, 3×64K | 95,8 | 121,3 (3 concurrentes) | 73,0 | 99,6 (3 concurrentes) |
| D: eudaimonent 256 Q4_0, 2×96K | 92,0 | 117,7 (2 concurrentes) | 67,3 | 96,7 (2 concurrentes) |

Revalidación del 2026-10-18 en la configuración de producción: código 93-98 tok/s (88 % de aceptación) y prosa alemana 77 tok/s (~60 % de aceptación).

## Requisitos de hardware

- VRAM del cabezal: 2,8 GB en Q8_0 (este repo), 2,2 GB en Q6_K, 1,8 GB en Q4_K_M. El cabezal original de 512 expertos ocupa 3,9 GB (Q8_0), 3,2 GB (Q6_K) y 2,6 GB (Q4_K_M).
- VRAM total del sistema: el autor opera con 2× RTX 3080 de 20 GB (40 GB en total) para el modelo principal de 176B más el cabezal, con `--tensor-split 45,55` y KV cache principal en `q8_0`.
- GPUs validadas: RTX 3080 de 20 GB (Ampere). No se reportan pruebas en A100, H100 ni RTX 4090.
- Configuraciones que cargan: 2×96K con dos sesiones llenas a 88K; 3×64K con cabezal; 1×192K carga pero muere con CUDA OOM en el primer prompt de 90K porque los buffers de cómputo crecen con la longitud de una secuencia individual.
- Configuraciones que fallan: 3×96K no carga con ningún cabezal en 2×20 GB (OOM en la tarjeta 1 en la segunda petición corta, buffer de cómputo principal de 1,84 GB); desde `--tensor-split 47,53` el buffer del cabezal (778 MB) no cabe en la tarjeta 0. `-ub 256` no lo resuelve.
- Despliegue: llama.cpp con el commit `46ca246` más los cherry-picks #29633 y #29825 y el parche de un hunk de este repo. El master actual falla con cabezal y slots paralelos (`ops.cpp:5240 GGML_ASSERT(i01 >= 0 && i01 < ne01)` en `get_rows_q`).
- Flags de referencia del autor: `--spec-type draft-mtp --spec-draft-n-max 2 --parallel 2 --ctx-size 196608`, `-devd CUDA0 -ctkd q5_1 -ctvd q5_1`, `--no-mmproj-offload`, `--ctx-checkpoints 8`, `--cache-ram 32768`.
- Throughput: 93-98 tok/s en código y 77 tok/s en prosa alemana con una petición; cae a ~62 tok/s a 30K de contexto y ~34 tok/s a 88K.
- `--parallel 3` penaliza el throughput incluso con solo dos peticiones: 103,9 frente a 125,2 tok/s en código.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repo (256 expertos Q8_0) | 2.619.602.688 (cabezal) | no disponible | 92,7 tok/s codigo (87 %), 64,7 tok/s prosa (43 %) | qwen-community-1.0 | Hugging Face, 193 descargas |
| Cabezal 512 expertos Q4_K_M (original) | no disponible | no disponible | 99,4 tok/s codigo (91 %), 70,3 tok/s prosa (47 %) | qwen-community-1.0 | Disponible via unsloth/Qwen3.8-Flash-Next-GGUF |
| Cabezal eudaimonent 256 expertos Q4_0 | no disponible | no disponible | 92,0 tok/s codigo, 67,3 tok/s prosa (1 peticion) | no disponible | Referenciado en la model card |
| Modelo base Qwen3.8-Flash-Next | ~176B (MoE, 256 expertos podados) | no disponible | no disponible | qwen-community-1.0 | Qwen/Qwen3.8-Flash-Next |

## Limitaciones y advertencias

- El repositorio contiene solo el cabezal MTP, no el modelo principal; sin el MoE base de 176B no es funcional.
- Requiere una build específica de llama.cpp con el parche de un hunk incluido; sin él, el servidor aborta con `GGML_ASSERT(buffer) failed`. El master actual falla con cabezal más slots paralelos.
- El cabezal de 512 expertos supera a esta variante de 256 expertos en todas las columnas medidas: 4-6 puntos más de aceptación en prosa y 1,3 tok/s más en código en Q4_K_M, con tamaño comparable (2,6 GB frente a 2,7 GB en Q8_0).
- En GPU, el cabezal ayuda claramente en código y solo moderadamente en prosa; en configuraciones antiguas sin el kernel corregido, el autor reportó que perjudicaba la prosa.
- La velocidad cae con el contexto: de ~62 tok/s a 30K a ~34 tok/s a 88K.
- 3×96K no es viable en 2×20 GB; 1×192K muere con OOM en el primer prompt de 90K.
- `--parallel 3` reduce el throughput agregado frente a `--parallel 2` en el hardware probado.
- El proyector de visión del modelo principal agota la VRAM de la tarjeta 0 bajo carga, lo que obliga a `--no-mmproj-offload`.
- No hay datos publicados de sesgos, alucinación ni rendimiento en benchmarks estándar.
- Idiomas soportados no disponibles; las pruebas se limitan a inglés y alemán.
- La licencia `qwen-community-1.0` es de tipo "other"; conviene revisar sus términos antes de uso comercial.
- Modelo con 193 descargas y 0 likes: sin validación comunitaria significativa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Davidmg0815/Qwen3.8-Flash-Next-MTP-256exp-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GGUF de unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Modelo GSQ-RCO-Coder podado: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF
- PR de llama.cpp "Qwen4Exp: add MTP" (#29761): no disponible como URL en la información proporcionada
- PR de llama.cpp #29633 (kernel BF16 multi-token): no disponible como URL en la información proporcionada
- PR de llama.cpp #29825 (buffers de cómputo reducidos): no disponible como URL en la información proporcionada
