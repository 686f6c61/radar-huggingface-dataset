# cvgro/Muse-Glimmer-30B-Parasyte-GGUF

## Resumen

Muse-Glimmer-30B-Parasyte-GGUF es una cuantización GGUF de alta precisión del modelo Muse-Glimmer-30B-uncensored, una versión abliterated (sin mecanismos de rechazo) del Muse-Glimmer-30B de Meta, un modelo denso de 30B parámetros orientado a tareas agénticas. El autor de esta cuantización es cvgro, que publica el artefacto bajo licencia Apache-2.0. El modelo base es de arquitectura densa `muse_glimmer` con 52 bloques, hidden size 6656, intermediate 19968, atención GQA con 32 cabezas Q y 2 KV, head_dim 128, capas de atención con ventana deslizante y logit softcap.

La relevancia de esta ficha reside en la receta de cuantización por tensor ("Parasyte K_P"), que asigna Q8_0 a las rutas sensibles al error (atención, ffn_down, embeddings y LM head), F32 a todas las normas y Q6_K al bloque mayoritario de la FFN (gate/up). El resultado es un cerebro de 24,46 GiB que, según el autor, permite ejecutar 262.144 tokens de contexto en una GPU de 32 GB, con sidecars de decodificación especulativa (DFlash) y una torre de visión separada en formato mmproj.

El modelo declara 27.854.794.240 parámetros medidos (nominal "30B"), 731 tensores y un contexto parcheado a 262.144 tokens (el original declaraba 131.072). Está pensado para despliegue en llama.cpp (build b10353 o superior) y incluye la plantilla de chat ATEM embebida en los metadatos del GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso `muse_glimmer`, 52 bloques, GQA 32 Q / 2 KV heads, head_dim 128, atención con ventana deslizante, logit softcap |
| Parametros totales | 27.854.794.240 (nominal "30B"), 731 tensores |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (parcheado desde 131.072 en el GGUF) |
| Tipos de cuantizacion | Receta por tensor: Q8_0 (314 tensores), F32 (313 normas), Q6_K (104 tensores FFN gate/up); 7,5397 bpw solo pesos |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); sidecars DFlash en GGUF y torre de visión en mmproj GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 30B parámetros con arquitectura `muse_glimmer`: hidden size 6656, intermediate size 19968, atención GQA con 32 cabezas de consulta y 2 de clave/valor, head_dim 128, capas de atención con ventana deslizante y logit softcap. La variante "uncensored" proviene de una abliteration aplicada por TrevorJS sobre el Muse-Glimmer-30B original de Meta, que se distribuye bajo Apache-2.0. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en el modelo base; esos datos no están disponibles en la información proporcionada.

La innovación técnica de este artefacto es la receta de cuantización por tensor: se fijan 627 tensores (314 en Q8_0 y 313 en F32) y los 104 tensores restantes (ffn_gate y ffn_up) caen al tipo global Q6_K, sin uso de imatrix. El autor argumenta que a partir de 6 bits por elemento la asignación por tensor absorbe el error mejor que una matriz de importancia. El GGUF incluye la plantilla de chat ATEM en los metadatos (`tokenizer.chat_template`), y el contexto se parchea in-place de 131.072 a 262.144 en la cabecera. Se acompaña de sidecars de decodificación especulativa DFlash (2,6B parámetros, en Q8_0 y Q4_0) y de una torre de visión en mmproj Q8_0.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla ATEM embebida y modos de razonamiento controlables vía system prompt (low / medium / high / xhigh).
- Razonamiento agéntico y multi-step reasoning, dado que el modelo base se describe como "agentic model".
- Soporte de tool calling y function calling mediante la plantilla ATEM incluida en los metadatos del GGUF.
- Capacidad de visión al cargar el mmproj (`Muse-Glimmer-30B-uncensored.mmproj-Q8_0.gguf`).
- Decodificación especulativa con sidecar DFlash para acelerar la generación.
- Contexto largo de hasta 262.144 tokens.
- Comportamiento "uncensored" (sin rechazos por alineamiento) derivado de la abliteration.
- Capacidades multilingües limitadas: el modelo declara únicamente inglés.

## Casos de uso

- Atención al cliente automatizada: el modelo puede sostener conversaciones multi-turno con contexto largo (262.144 tokens) y tool calling para consultar sistemas internos, lo que permite resolver incidencias sin perder el hilo de la conversación.
- Agentes autónomos de propósito general: la orientación agéntica del modelo base y el soporte de function calling lo hacen adecuado para pipelines de razonamiento multi-paso con llamadas a herramientas.
- Análisis de documentos extensos: con 262.144 tokens de ventana se pueden procesar contratos, informes o bases de código completas en una sola pasada, sin chunking.
- Generación de código en producción: la integración con llama.cpp y la decodificación especulativa DFlash permiten servir el modelo con baja latencia (~220 t/s según el autor en RTX 5090) para autocompletado y generación en IDE.
- Investigación sobre modelos sin alineamiento: la variante uncensored resulta útil para estudiar comportamientos, sesgos y robustez sin las capas de rechazo del modelo original.
- Asistentes multimodales locales: con la torre de visión mmproj se pueden construir asistentes que describen imágenes o extraen información de capturas, ejecutándose íntegramente en una GPU de 32 GB.
- Despliegue en hardware de consumo: la cuantización de 24,46 GiB cabe en GPUs de 32 GB (RTX 5090) con offload completo, lo que habilita prototipos y demos sin infraestructura de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor únicamente reporta una velocidad de decodificación esperada de aproximadamente 220 t/s con el sidecar DFlash Q8_0 (`--spec-type draft-dflash`, `n_max 7`) en una RTX 5090 con offload completo; no se proporcionan cifras de throughput para otras configuraciones ni latencias de primer token.

## Requisitos de hardware

- VRAM estimada: el cerebro principal ocupa 24,46 GiB en disco; con offload completo necesita aproximadamente 25-27 GB de VRAM considerando overhead de contexto y KV cache. El sidecar DFlash Q8_0 añade 2,545 GiB y el Q4_0 1,352 GiB; la torre de visión mmproj Q8_0 suma 1,912 GiB.
- GPU recomendadas: RTX 5090 (32 GB) para offload completo con contexto largo; A100 40 GB y H100 80 GB para servir con mayor margen de contexto y concurrencia.
- GPU de consumo: cabe en RTX 5090 de 32 GB; en GPUs de 24 GB (RTX 4090) no cabe el modelo completo con offload total, por lo que requeriría offload parcial a CPU o reducción de contexto.
- Opciones de despliegue: llama.cpp (build b10353 o superior, con soporte de arquitectura `muse-glimmer` desde el commit `62bf73d25`, PR #26841); `llama-server` con `-ngl 999` y `-c 262144`; decodificación especulativa vía `--spec-type draft-dflash`. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: ~220 t/s de decodificación en RTX 5090 con DFlash Q8_0 y `n_max 7`, según el autor. No hay datos de latencia de primer token ni de throughput con otras GPU.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable con otros modelos de 30B. A modo de referencia estructural, se puede comparar con el propio modelo base sin cuantizar:

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-Parasyte-GGUF | 27,85B | 262.144 | GGUF (Q8_0/F32/Q6_K por tensor) | Apache-2.0 | Hugging Face (cvgro) |
| TrevorJS/Muse-Glimmer-30B-uncensored | ~30B nominal | 131.072 declarado | safetensors F16 (59,5 GB) | Apache-2.0 | Hugging Face (TrevorJS) |
| Muse-Glimmer-30B (Meta, original) | ~30B nominal | 131.072 declarado | no disponible | Apache-2.0 | no disponible |

No se conocen en la información disponible otros modelos de 30B densos con receta de cuantización por tensor equivalente para comparar rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; al ser una abliteration, la eliminación de capas de rechazo puede ampliar la exposición a contenido sesgado o inapropiado.
- Riesgo de alucinación: no cuantificado; el modelo no publica benchmarks que permitan estimarlo.
- Limitaciones de idioma: el modelo declara únicamente inglés, por lo que el rendimiento en castellano u otros idiomas no está garantizado.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el autor no ofrece garantías; conviene revisar la licencia del modelo base y de la abliteration de origen.
- Caveat de producción: requiere llama.cpp b10353 o superior; builds anteriores rechazan el archivo con `unknown model architecture: 'muse-glimmer'`.
- El contexto de 262.144 tokens es un parche manual del autor sobre el rango nativo de rope; el modelo fuente declara 131.072, por lo que el comportamiento más allá de ese límite no está validado oficialmente.
- La cuantización por tensor sin imatrix puede degradar más que una cuantización con imatrix en tareas sensibles, aunque el autor sostiene lo contrario a estos niveles de bits.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- La model card contiene enlaces de donación (Monero, Throne) que no guardan relación con la evaluación técnica del modelo.

## Enlaces

- Hugging Face: https://huggingface.co/cvgro/Muse-Glimmer-30B-Parasyte-GGUF
- Modelo base (abliteration): https://huggingface.co/TrevorJS/Muse-Glimmer-30B-uncensored
- Repositorio llama.cpp (soporte de arquitectura): PR #26841, commit `62bf73d25`
- Sidecar DFlash2 (port de z-lab / Inco AI): referenciado en la model card, sin URL directa disponible
