# HangGlidersRule/Darkstar-Ripple-65B-Preview-Base-ModelOpt-W4A4-NVFP4-Mixed-FP8

## Resumen

Darkstar-Ripple-65B-Preview-Base-ModelOpt-W4A4-NVFP4-Mixed-FP8 es una cuantización de precisión mixta del modelo Ripple-65B-Preview de ricursiveAI, publicada por el usuario HangGlidersRule dentro de su proyecto de ingeniería de cuantizaciones "model-forge". No es un modelo entrenado desde cero ni una variante con edición de comportamiento: es una conversión directa de los pesos BF16 originales mediante NVIDIA ModelOpt 0.48.0, con el objetivo declarado de ejecutar un modelo de 65B en una única GPU Blackwell de 96 GB con mayor velocidad y menor huella de memoria que el checkpoint NVFP4 oficial del proveedor.

El modelo base, Ripple-65B-Preview, es un transformer denso de aproximadamente 64.800 millones de parámetros (64.782.689.360 según los safetensors) con 80 capas. La cuantización aplica W4A4 NVFP4 (FP4 E2M1 en pesos y activaciones, grupo de 16, escalas de bloque FP8 E4M3 y escalas estáticas) a las proyecciones gate, up y down de las 80 capas (240 lineales), FP8 E4M3 W8A8 a las proyecciones de atención q, k, v, o y a la compuerta sigmoide de salida `g_proj` (400 lineales), y NVFP4 weight-only (W4A16) a `lm_head`. Embeddings, normalizaciones y `value_res_lambda` permanecen en BF16 byte a byte idénticos al original.

La relevancia es fundamentalmente de despliegue: el checkpoint ocupa 43,05 GB frente a los 57,21 GB del NVFP4 del proveedor, lo que en la misma configuración de memoria deja espacio para una caché KV de 419.096 tokens frente a 280.176. Según las mediciones del autor, la decodificación con batch 1 es 1,31 veces más rápida y el tiempo hasta el primer token es 0,82 veces el del checkpoint oficial, con una calidad en GPQA Diamond de 138,5/198 frente a 140,5/198 del proveedor. Es, por tanto, una pieza pensada para servir Ripple-65B en producción sobre hardware Blackwell con vLLM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso de 80 capas (modelo base Ripple-65B-Preview; detalles internos de atención no disponibles) |
| Parámetros totales | 64.782.689.360 (≈64,8B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada; la caché KV medida en 96 GB permite 419.096 tokens en la configuración del autor |
| Tipos de cuantización | W4A4 NVFP4 (MLP), FP8 E4M3 W8A8 (atención y `g_proj`), NVFP4 W4A16 (`lm_head`), BF16 (embeddings, norms, `value_res_lambda`, caché KV) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (5 shards, 43,05 GB / 40,10 GiB), con código remoto (`custom_code`) |

## Arquitectura y entrenamiento

El checkpoint no introduce entrenamiento propio: hereda íntegramente la arquitectura y los pesos del modelo base ricursiveAI/Ripple-65B-Preview, en la revisión `240d5966cbe00f0627c699e59ef58560b60303cf`. Se trata de un transformer denso de 80 capas con proyecciones MLP de tipo gate/up/down, atención con proyecciones q, k, v y o, y una compuerta sigmoide de salida (`g_proj`) que sugiere un mecanismo de gating en la salida de cada bloque. La información disponible no detalla la composición del dataset de preentrenamiento, el número de tokens vistos ni si hubo fases de RLHF o DPO; el modelo base es la variante instruction-tuned del proveedor, no el `Ripple-65B-Base-Preview` de solo preentrenamiento.

La innovación técnica de esta ficha es el proceso de cuantización. ModelOpt 0.48.0 (torch 2.15.0, transformers 5.18.0) aplica dos recetas distintas: para las capas del decodificador, la receta densa de NVIDIA con escalas de peso Local-Hessian y barrido de escalas FP8, calibrada capa a capa con los pesos BF16 descargados a disco (SHA-256 de receta `624185c8...`); para `lm_head`, escalas de peso MSE sin datos con barrido de escalas FP8 (SHA-256 `123e4e99...`). La calibración usa 512 filas (927.103 tokens) renderizadas con la plantilla de chat del propio checkpoint, cubriendo resúmenes de noticias, instrucciones con razonamiento, trazas agénticas de uso de herramientas y function calling. La validación es fail-closed sobre los ficheros entregados: 240 lineales NVFP4 W4A4, 400 FP8 y 1 W4A16 NVFP4 exactamente según el diseño; 3.177.840.640 escalas de bloque FP8 y 1.281 escalas por tensor finitas y positivas; y 562 tensores BF16 byte a byte idénticos al origen, incluidos código remoto, plantilla de chat y tokenizador.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones, heredadas del modelo base instruction-tuned.
- Razonamiento con bloques de razonamiento explícitos: en la evaluación del autor, las 198 preguntas de GPQA generaron bloque de razonamiento en todas las ejecuciones.
- Uso de herramientas y function calling: la tasa de parseo de llamadas a herramientas medida es de 0,996 sobre 500 ítems.
- Razonamiento agéntico multi-paso: la calibración incluye trazas de tool-use agéntico, lo que indica que el modelo base está orientado a este uso.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión, audio u otras modalidades: no disponibles; el pipeline declarado es exclusivamente text-generation.
- Modo "thinking": no confirmado explícitamente como capacidad conmutable, pero la presencia sistemática de bloques de razonamiento en las respuestas evaluadas es consistente con un modo de razonamiento extendido.

## Casos de uso

- Servicio de Ripple-65B en una única GPU Blackwell: con 43,05 GB de pesos, el checkpoint cabe en una RTX PRO 6000 Blackwell de 96 GB dejando 419.096 tokens de caché KV, lo que permite atender conversaciones concurrentes de contexto largo sin sharding ni tensor parallelism.
- Atención al cliente con contexto extenso: la ventana efectiva de caché KV permite mantener historiales multi-turno muy largos o adjuntar documentación extensa en la misma sesión, algo inviable con el NVFP4 del proveedor en la misma memoria.
- Agentes con tool calling en producción: la tasa de parseo de 0,996 sobre 500 ítems y la calibración sobre trazas agénticas lo hacen adecuado para orquestadores que dependen de llamadas a funciones estructuradas (APIs, bases de datos, sistemas internos).
- Razonamiento científico y técnico asistido: los 138,5/198 en GPQA Diamond (nivel posgrado en física, química y biología) permiten usarlo como asistente de análisis técnico donde se requiere razonamiento de varios pasos, aceptando el coste de latencia del bloque de razonamiento.
- Evaluación comparativa de cuantizaciones: sirve como referencia reproducible para medir el impacto de W4A4 NVFP4 mixto frente a FP8 o BF16 en tareas de razonamiento, gracias a las recetas y resultados publicados con hashes verificables.
- Despliegue con vLLM en clústeres pequeños: al reducir el peso por réplica un 25 % respecto al NVFP4 del proveedor, permite aumentar la densidad de réplicas por nodo o reservar memoria para caché KV en entornos con GPUs de 96 GB.
- Investigación sobre cuantización de precisión mixta: las recetas, la validación fail-closed y el protocolo de evaluación (KL contra profesor BF16, GPQA con barras pre-registradas) son material directamente reutilizable para estudiar el compromiso calidad/memoria en modelos de 65B.

## Benchmarks y rendimiento

Evaluación realizada por el autor sobre una RTX PRO 6000 Blackwell (SM120, 96 GB, límite de 450 W) con vLLM nightly `0.34.0rc1.dev206+gf5d93296c`, temperatura 0, máximo 65.536 tokens, concurrencia 30 y dos ejecuciones por celda. La referencia es el NVFP4 oficial del proveedor en la revisión `99eea447...`. No se ejecutó BF16 porque sus 129,57 GB no caben en la GPU.

| Métrica | Este checkpoint | NVFP4 del proveedor | Base |
|---|---|---|---|
| GPQA Diamond | 138 y 139 de 198 (media 138,5) | 142 y 139 de 198 (media 140,5) | Dos ejecuciones; barra pre-registrada: al menos la media del proveedor − 11,88: PASS |
| Diferencia GPQA (A − proveedor) | −11,5 a +7,5 preguntas (IC 95 % bootstrap pareado, 10.000 remuestreos) | — | Ítems promediados sobre dos ejecuciones |
| Ítems sin respuesta al límite de 65.536 tokens | 42 y 48 de 198 | 42 y 38 de 198 | Contados como incorrectos; respuesta con tope y respuesta presente se puntúa |
| Tasa de parseo de tool calls | 0,996 | 0,998 | 500 ítems; barra: al menos el proveedor − 2 puntos: PASS |
| Decodificación batch 1 | 1,31× más rápido | 1,0× | Misma GPU, imagen y flags |
| Decodificación batch 8 | 1,24× más rápido | 1,0× | Misma GPU, imagen y flags |
| Tiempo hasta el primer token | 0,82× (menor es más rápido) | 1,0× | Misma GPU, imagen y flags |
| Tamaño del checkpoint | 43,05 GB (40,10 GiB) | 57,21 GB | — |
| Caché KV disponible en la misma configuración | 419.096 tokens | 280.176 tokens | — |

El proveedor reporta GPQA Diamond 85,2 para el BF16 con su propio harness; el autor advierte que esa cifra no es comparable con los recuentos anteriores y no se midió en esta campaña. La cercanía al BF16 se mide en su lugar como KL de siguiente token contra un profesor BF16 sobre 64 prompts reservados, ejecutando los módulos del checkpoint en FP32 sobre CPU capa a capa; el resultado numérico de esa KL no está disponible en la información proporcionada.

## Requisitos de hardware

- VRAM para inferencia: 43,05 GB de pesos; con caché KV en BF16, una configuración de 96 GB deja 419.096 tokens de caché. El requisito mínimo realista es una GPU con al menos 48 GB para pesos más caché reducida, aunque no se han publicado mediciones por debajo de 96 GB.
- GPU recomendadas: RTX PRO 6000 Blackwell (96 GB, SM120) es la plataforma validada; el soporte NVFP4 W4A4 requiere hardware Blackwell (SM100/SM120). GPUs Hopper o Ada no pueden ejecutar las capas NVFP4 tal cual.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 5090 (32 GB) con esta cuantización; no se dispone de una variante GGUF para llama.cpp u Ollama.
- Opciones de despliegue: vLLM nightly `0.34.0rc1.dev206+gf5d93296c` es el runtime validado; el checkpoint incluye `custom_code` y código remoto, por lo que requiere `trust_remote_code`. No hay soporte documentado para TGI, llama.cpp u Ollama.
- Latencia y throughput: decodificación 1,31× más rápida en batch 1 y 1,24× en batch 8 que el NVFP4 del proveedor; TTFT 0,82×. No se publican tokens por segundo absolutos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | GPQA Diamond | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Darkstar-Ripple-65B-Preview-Base-ModelOpt-W4A4-NVFP4-Mixed-FP8 | 64,8B | Caché KV de 419.096 tokens en 96 GB | W4A4 NVFP4 + FP8 W8A8 + W4A16 | 138,5/198 (media de dos ejecuciones) | Apache 2.0 | Hugging Face, 9 descargas |
| ricursiveAI/Ripple-65B-Preview-NVFP4 (proveedor) | 64,8B | Caché KV de 280.176 tokens en 96 GB | W4A4 NVFP4 en MLP y atención, BF16 en embeddings | 140,5/198 (misma harness) | Apache 2.0 (según el modelo base) | Hugging Face |
| ricursiveAI/Ripple-65B-Preview (BF16) | 64,8B | No disponible | BF16 | 85,2 reportado por el proveedor con su propio harness (no comparable) | Apache 2.0 | Hugging Face; 129,57 GB, no cabe en 96 GB |

No se dispone de información sobre otros modelos de 65B comparables en la documentación proporcionada; la comparativa se limita a las tres variantes del mismo modelo base.

## Limitaciones y advertencias

- No es un modelo nuevo ni afinado: cualquier sesgo, alucinación o limitación de conocimiento del modelo base Ripple-65B-Preview se hereda sin cambios; la cuantización no corrige comportamiento.
- La cuantización introduce una degradación medible: 2 puntos de media en GPQA Diamond frente al NVFP4 del proveedor (138,5 frente a 140,5), dentro de la barra pre-registrada pero no despreciable en tareas de razonamiento científico.
- El bloque de razonamiento consume muchos tokens: 42 y 48 ítems de 198 no respondieron dentro del límite de 65.536 tokens; en producción esto implica latencias altas y coste de tokens elevado en consultas complejas.
- Requiere hardware Blackwell (SM120 o SM100) para las capas NVFP4; no es desplegable en GPUs Hopper, Ada ni de consumo con esta cuantización.
- Depende de vLLM nightly concreto y de código remoto (`custom_code`, `trust_remote_code`), lo que introduce riesgo de incompatibilidad en actualizaciones y una superficie de seguridad adicional al ejecutar código del repositorio.
- La licencia Apache 2.0 se declara en este repositorio, pero debe verificarse la licencia del modelo base ricursiveAI/Ripple-65B-Preview antes de uso comercial, ya que la información proporcionada no la detalla de forma independiente.
- Idiomas soportados no documentados: no hay garantía de calidad multilingüe más allá de lo que herede el modelo base.
- El checkpoint tiene 9 descargas y 0 likes; es un artefacto de investigación con validación del autor, no un modelo con adopción comunitaria contrastada.
- La evaluación se hizo con una sola GPU, un solo runtime y un conjunto de 198 ítems; los intervalos de confianza son amplios (−11,5 a +7,5 preguntas en la diferencia con el proveedor).

## Enlaces

- Hugging Face: https://huggingface.co/HangGlidersRule/Darkstar-Ripple-65B-Preview-Base-ModelOpt-W4A4-NVFP4-Mixed-FP8
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- NVFP4 del proveedor: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-NVFP4
- Source card: https://github.com/HangGlidersRule/model-forge/blob/main/models/ripple-65b/model-card/base-nvfp4.md
- Family record: https://github.com/HangGlidersRule/model-forge/blob/main/models/ripple-65b/README.md
- Build recipe: https://github.com/HangGlidersRule/model-forge/blob/main/recipes/ripple-65b/darkstar-ripple-65b-preview-base-modelopt-w4a4-nvfp4-mixed-fp8.yaml
- Gate results: https://github.com/HangGlidersRule/model-forge/blob/main/models/ripple-65b/results/gate-summary.json
- Campaign issue: https://github.com/HangGlidersRule/model-forge/issues/39
