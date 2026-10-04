# joshycodes/fd-qwen3.5-9b-swap_none

## Resumen

`joshycodes/fd-qwen3.5-9b-swap_none` es un checkpoint derivado de la familia Qwen3.5-9B publicado por el usuario `joshycodes` en Hugging Face. Se trata de un modelo denso de 9.653.104.368 parametros (~9,65B) almacenado en formato safetensors, con un tamano de repositorio de 19,3 GB que es coherente con pesos en precision BF16/FP16. El modelo base Qwen3.5-9B es, segun la informacion disponible, un modelo fundacional denso multimodal (texto e imagen) con 262.144 tokens de contexto y modo dual de razonamiento (thinking / no-thinking).

La relevancia de este checkpoint es limitada y de nicho: se trata de una publicacion de la comunidad (15 descargas, 0 likes) sin documentacion tecnica asociada, sin licencia declarada y sin idiomas especificados. El sufijo `swap_none` sugiere una variante dentro de una familia de experimentos del mismo autor (existen otros repos como `Qwen3.5-9B-oracle-v0` y `qwen3.5-9b-feather-f3-mt`), pero no hay informacion publica que explique el procedimiento exacto de modificacion.

Por tanto, esta ficha describe el checkpoint con los datos verificables del repositorio y contextualiza las capacidades a partir de la familia base Qwen3.5-9B, senalando explicitamente cuando un dato no esta confirmado para esta publicacion concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (texto + vision), familia Qwen3.5 (segun informacion de la familia base) |
| Parametros totales | 9.653.104.368 (~9,65B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (dato de la familia base Qwen3.5-9B; no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible para este checkpoint; la familia base admite BF16 nativo, W4A16 y NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 19,3 GB |
| Fecha de creacion | 2026-10-04 |
| Ultima actualizacion | 2026-10-04 |

## Arquitectura y entrenamiento

La informacion disponible sobre este repositorio no documenta la arquitectura interna ni el proceso de entrenamiento. El tag `qwen3_5` indica que se construye sobre la familia Qwen3.5, y los datos de la familia base describen un modelo denso multimodal con vision nativa, contexto de 262.144 tokens y un modo unificado de razonamiento (thinking / non-thinking). Los pesos nativos de la familia estan en BF16, lo que concuerda con el tamano de 19,3 GB del repositorio para 9,65B parametros.

No hay ningun dato publicado sobre numero de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO o innovaciones tecnicas especificas de este checkpoint `fd-qwen3.5-9b-swap_none`. El sufijo `swap_none` y la existencia de otros checkpoints del mismo autor (`oracle-v0`, `feather-f3-mt`, este ultimo descrito como un continued pretraining sobre un corpus auto-generado de 8.309.133 tokens y 8.591 documentos) apuntan a una linea de experimentos de ajuste/mezcla de pesos, pero el procedimiento concreto de esta variante no esta documentado.

## Capacidades

Las siguientes capacidades corresponden a la familia base Qwen3.5-9B segun las fuentes consultadas; no estan confirmadas para este checkpoint concreto:

- Generacion de texto y razonamiento general en tareas de chat.
- Comprension visual nativa (entrada de imagenes ademas de texto).
- Modo dual de razonamiento (thinking / no-thinking) unificado en la familia Qwen3.5.
- Comportamiento agentico segun la documentacion de la familia.
- Contexto largo de hasta 262.144 tokens (familia base).
- Soporte de tool calling / function calling: no disponible para este checkpoint.
- Capacidades multilingues: no disponible.
- Capacidades especiales adicionales (audio, decodificacion especulativa): no disponible.

## Casos de uso

- Evaluacion comparativa de checkpoints derivados: dado que es un checkpoint de la comunidad sin documentacion, su uso principal realista es la comparacion frente al modelo base Qwen3.5-9B para medir el efecto de la modificacion introducida (swap/mezcla) en tareas de generacion.
- Reproduccion de experimentos de la comunidad: investigadores que sigan la linea de publicaciones de `joshycodes` pueden cargar este checkpoint en BF16 (~19,3 GB) para auditar diferencias de pesos frente al modelo original.
- Prototipado local de chat de proposito general: con cuantizacion 4-bit (estimada en ~6 GB segun la familia base) es desplegable en portatiles de gama alta para pruebas de viabilidad, siempre que se asuma la ausencia de garantias de calidad.
- Procesamiento de documentos largos: si el contexto de 262.144 tokens se conserva en el checkpoint, permite resumir o extraer informacion de documentos extensos sin troceado, aunque la calidad tras la modificacion no esta verificada.
- Tareas de vision-lenguaje experimental: la familia base procesa imagenes, de modo que este checkpoint podria emplearse en prototipos de captioning o VQA (pregunta-respuesta visual), sujeto a validacion propia.
- Base para ajuste fino adicional (fine-tuning): al ser un checkpoint denso de ~9,65B en safetensors, sirve como punto de partida para LoRA o ajuste completo en entornos con GPU de 24 GB o superiores.
- Investigacion sobre tecnicas de mezcla de pesos: el nombre `swap_none` lo hace relevante como objeto de estudio de metodologias de merge/swap de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La fuente de la familia base (`llm-releases.com`) menciona que Qwen3.5-9B requiere aproximadamente 260 millones de tokens de salida para completar el indice de inteligencia que citan, lo que indica un alto consumo de tokens de razonamiento, pero no se proporcionan puntuaciones concretas por prueba ni resultados especificos de este checkpoint.

## Requisitos de hardware

- VRAM en BF16/FP16: aproximadamente 19,3 GB solo para pesos, mas overhead de activaciones y KV cache. Se recomienda GPU con 24 GB o mas (RTX 3090, RTX 4090, A100 40GB, H100).
- VRAM en 4-bit (estimada a partir de la familia base): ~6 GB de pesos, lo que lo situaria al alcance de portatiles y GPU de consumo de 8-12 GB (RTX 3060 12GB, RTX 4060 Ti 16GB).
- En consumer GPU: viable en 4-bit; en BF16 requiere 24 GB, por lo que cabe en RTX 3090/4090 con margen ajustado.
- Opciones de despliegue: no disponibles de forma especifica para este checkpoint. Dado el formato safetensors, son aplicables marcos genericos como Transformers, vLLM o TGI; para cuantizacion local, llama.cpp/Ollama requeririan conversion previa a GGUF.
- Latencia y throughput: no disponible.
- Despliegue en borde: la documentacion de NVIDIA para la familia menciona checkpoints W4A16 en Jetson Orin y NVFP4 en Jetson Thor, pero no hay confirmacion de que este checkpoint sea compatible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `joshycodes/fd-qwen3.5-9b-swap_none` | 9,65B | no disponible (familia base: 262.144) | no disponible (familia base: texto + vision) | no disponible | 15 descargas, 0 likes |
| Qwen/Qwen3.5-9B (base) | ~9B | 262.144 tokens | texto + vision | no disponible en la informacion consultada | modelo oficial de la familia Qwen3.5 |
| `joshycodes/Qwen3.5-9B-oracle-v0` | no disponible | no disponible | no disponible | no disponible | checkpoint de la comunidad del mismo autor |
| `joshycodes/qwen3.5-9b-feather-f3-mt` | no disponible | no disponible | no disponible | no disponible | continued pretraining sobre corpus auto-generado (8.309.133 tokens, 8.591 documentos) |

La comparativa con alternativas de otros desarrolladores (Gemma, Llama, Mistral) no esta disponible porque la informacion consultada no incluye especificaciones de modelos equivalentes.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card que describa el procedimiento de creacion, los datos usados ni las capacidades esperadas.
- Licencia no declarada: no se puede garantizar el uso comercial. Se debe contactar con el autor o asumir que no hay permisos explicitos.
- Idiomas no especificados: no se puede confirmar el soporte multilingue ni la calidad en castellano.
- Riesgo elevado de alucinacion y degradacion: al ser un checkpoint modificado sin evaluacion publicada, el comportamiento puede diferir del modelo base de forma no controlada.
- Trazabilidad limitada: el nombre `swap_none` no esta explicado, por lo que se desconoce que pesos se han modificado respecto al original.
- Adopcion marginal (15 descargas, 0 likes): no existe validacion por parte de la comunidad ni reportes de uso en produccion.
- Sin benchmarks: imposible estimar el rendimiento real frente a la familia base u otras alternativas.
- Advertencia para produccion: no se recomienda su uso en entornos productivos sin una evaluacion interna exhaustiva previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/joshycodes/fd-qwen3.5-9b-swap_none
- Checkpoint relacionado del mismo autor: https://huggingface.co/joshycodes/Qwen3.5-9B-oracle-v0
- Checkpoint relacionado del mismo autor: https://huggingface.co/joshycodes/qwen3.5-9b-feather-f3-mt
- Documentacion de la familia en NVIDIA Jetson AI Lab: https://github.com/NVIDIA-AI-IOT/jetson-ai-lab/blob/main/src/content/models/qwen3-5-9b.md
- Ficha de la familia base en LLM Releases: https://www.llm-releases.com/models/qwen3-5-9b
- Guia de despliegue de la familia base en LLM API: https://llmapi.ai/models/qwen-qwen3-5-9b/
