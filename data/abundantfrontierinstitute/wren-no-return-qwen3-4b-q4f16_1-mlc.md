# AbundantFrontierInstitute/wren-no-return-qwen3-4b-q4f16_1-MLC

## Resumen

Wren (No Return) es un modelo de lenguaje empaquetado para ejecución en el navegador, derivado de Qwen/Qwen3-4B mediante ajuste fino y cuantización MLC `q4f16_1` para WebLLM 0.2.87 sobre WebGPU. Lo publica Abundant Frontier Institute como parte del proyecto de investigación «Stories you can step into» (Boyd Wilson, Abundant Frontier Institute y Omnibond Systems), un experimento de «model-as-output» en el que el propio modelo es el artefacto creativo asociado a un relato corto inventado llamado *No Return*. El modelo interpreta a Wren, oficial de guardia nocturna de la nave Meridian, y está pensado para que un lector converse con el personaje en su propio navegador.

No es un asistente general: es una demo pública en personaje con un índice léxico (BM25) sobre el texto del relato y bloqueo por capítulo, de modo que el modelo no debería conocer capítulos posteriores al punto de lectura elegido por el usuario. Los pesos incluyen ya plegados el adaptador de hechos de la fase 1 y el adaptador de voz de la primera pasada. El repositorio ocupa 2,3 GB (unos 2,2 GB de pesos en 74 shards más un tokenizer de 11 MB) y la página solicita aproximadamente 3,5 GB de memoria GPU, con contexto limitado a 4096 tokens.

La relevancia es doble: por un lado, demuestra el despliegue de un modelo de 4B cuantizado íntegramente en el cliente sin GPU de servidor y sin que el texto del relato salga de la máquina; por otro, documenta con honestidad metodológica las diferencias entre el prototipo bloqueado de investigación y esta compilación de navegador, que es de una sola pasada y no incorpora el guardián de diferencias factuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B), empaquetada para MLC/WebLLM |
| Parametros totales | 4B (modelo base Qwen3-4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (límite impuesto en la configuración de WebLLM; `prefill_chunk_size` 1024) |
| Tipos de cuantizacion | `q4f16_1` (pesos de 4 bits, activaciones en float16), layout `cs1k` |
| Idiomas soportados | no disponible (el modelo base Qwen3-4B es multilingüe; la model card no declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLC (shards + `tensor-cache.json` + `mlc-chat-config.json`); runtime WebGPU `.wasm` no incluido en el repo |

## Arquitectura y entrenamiento

La base es Qwen3-4B, un transformer decoder-only de 4 mil millones de parámetros. Sobre ese modelo se aplicaron, según la model card, un adaptador de hechos de la fase 1 y un adaptador de voz de la primera pasada, ambos plegados en los pesos finales. El prototipo de investigación bloqueado, denominado `p2_light_dpo_guarded`, es un pipeline de dos pasadas: primero una respuesta anclada en recuperación, después una reescritura de voz y finalmente un guardián de diferencias factuales que puede revertir a la primera respuesta. El nombre «light DPO» sugiere un ajuste con preferencias, aunque la model card no detalla volúmenes de datos, composición del dataset ni hiperparámetros de entrenamiento.

La compilación publicada aquí es de una sola pasada: no ejecuta la reescritura de segunda pasada ni el guardián de diferencias. Además, la búsqueda de la página de demostración usa un índice léxico BM25 en lugar del índice de embeddings del pipeline bloqueado. La cuantización se realizó con MLC para el runtime WebLLM 0.2.87, con layout `cs1k` y un límite de contexto de 4096 tokens. La model card advierte explícitamente de que la generación WebGPU no se ejecutó en la compilación que produjo estos pesos y de que el archivo cuantizado no ha sido puntuado por sí mismo.

## Capacidades

- Conversación en personaje: interpreta a Wren, oficial de guardia nocturna de la nave Meridian, con voz y hechos derivados del relato *No Return*.
- Generación de texto conversacional multi-turno dentro de una ventana de 4096 tokens.
- Respuestas ancladas en un índice léxico BM25 sobre el texto del relato, con bloqueo por capítulo en la página de demostración.
- Ejecución local en navegador mediante WebGPU, sin GPU de servidor y sin enviar el texto del relato fuera de la máquina.
- Capacidades heredadas de Qwen3-4B (razonamiento, código, matemáticas, multilingüismo) no documentadas ni garantizadas para este ajuste; la model card no las declara.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Demostración interactiva de personaje literario: un lector de *No Return* elige hasta qué capítulo ha leído y conversa con Wren en el navegador; el índice BM25 y el bloqueo por capítulo limitan el material recuperable para reducir spoilers.
- Investigación sobre «model-as-output»: el modelo sirve como artefacto de estudio para analizar cómo un ajuste fino sobre un relato corto produce un personaje coherente y qué fallos aparecen al pasar de un pipeline de dos pasadas a una compilación de una sola pasada.
- Despliegue de LLM en el cliente sin servidor: útil como referencia técnica para equipos que quieran servir un modelo de 4B cuantizado vía WebLLM en Chrome o Edge con WebGPU, con un requisito de unos 3,5 GB de memoria GPU.
- Evaluación de cuantización en navegador: permite medir empíricamente cuánto degradan `q4f16_1` y el cambio de índice de embeddings a BM25 las respuestas de un modelo ajustado, comparando contra las puntuaciones registradas del prototipo bloqueado.
- Prototipado de experiencias narrativas interactivas: base para demos de ficción conversacional donde la privacidad del texto es requisito, ya que la historia no abandona el equipo del visitante.
- Estudio de seguridad y fuga de información en personajes: los «leak probes» del proyecto (1/48 en la condición de referencia) ofrecen un marco para evaluar si un personaje revela contenido que no debería conocer.

## Benchmarks y rendimiento

La model card no publica benchmarks estándar (MMLU, HumanEval, GSM8K). Sí recoge puntuaciones internas del proyecto sobre sondas del relato *No Return*:

| Condicion | Must-answer | Leak probes | Frame breaks | Voz (media) |
|---|---|---|---|---|
| Prototipo bloqueado `p2_light_dpo_guarded` (dos pasadas + guardián) | 59/60 | 1/48 | 3 | 4.22 |
| Pass-1 `v_merged_v_rag` (mismos pesos fusionados, antes de cuantizar y del cambio a BM25) | 59/60 | 1/48 | 3 | 4.27 (dos jueces) |
| Compilación de navegador publicada en este repo | no puntuada | no puntuada | no puntuada | no puntuada |

La model card indica que la cuantización y el índice léxico pueden alterar estas respuestas y que la compilación de navegador debe considerarse «más laxa» que el modelo bloqueado.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3,5 GB de memoria GPU solicitados por la página (`vram_required_MB: 3500`).
- Almacenamiento: unos 2,2 GB de pesos (74 shards) más 11 MB de tokenizer, descargados en la primera visita al navegador.
- GPU: cualquier GPU con soporte WebGPU en Chrome o Edge actuales; la model card no enumera modelos concretos de GPU.
- GPU de consumo: el requisito de 3,5 GB encaja en el rango de GPUs integradas y dedicadas modernas con WebGPU, aunque no se especifican modelos validados.
- Despliegue: WebLLM 0.2.87 sobre WebGPU; requiere la librería `.wasm` oficial `Qwen3-4B-q4f16_1_cs1k-webgpu.wasm` alojada en `binary-mlc-llm-libs`, referenciada como `model_lib`. No se documenta despliegue con vLLM, llama.cpp, Ollama ni TGI para este empaquetado.
- Requisitos de página: cabeceras de aislamiento de origen cruzado (cross-origin isolation); abrir la demo como archivo local no funciona.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Wren (No Return) q4f16_1-MLC | 4B | 4096 | MLC / WebLLM 0.2.87 (WebGPU) | Apache 2.0 | Ajuste de personaje, una pasada, índice BM25 |
| Qwen/Qwen3-4B | 4B | no disponible en esta ficha | safetensors (modelo base) | Apache 2.0 | Modelo base sin ajuste de personaje ni empaquetado web |
| Otros empaquetados MLC de Qwen3-4B `q4f16_1` | 4B | según configuración | MLC / WebLLM | Apache 2.0 | Misma arquitectura y cuantización sin el ajuste de *No Return* |

No se dispone de datos de benchmarks comparables entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo puede afirmar cosas que el relato nunca dice; no hay guardián factual en esta compilación de una sola pasada.
- Puede adelantar contenido de capítulos posteriores al punto de lectura elegido, aunque la página intenta no recuperar ni incluir en el prompt capítulos posteriores.
- Las respuestas pueden ser erróneas, estar mal formuladas o salirse del personaje.
- No debe usarse para consejo de ningún tipo ni como relato completo o libre de spoilers.
- Es una demo de investigación, no un asistente general ni un sustituto de la lectura del relato.
- La compilación publicada no ha sido puntuada; las cifras de referencia corresponden a los mismos pesos fusionados antes de cuantizar y antes del cambio a BM25, por lo que no son extrapolables.
- La generación WebGPU no se ejecutó durante la compilación de estos pesos.
- Requiere Chrome o Edge con WebGPU y cabeceras de aislamiento de origen cruzado; no funciona abriendo la página como archivo local.
- La licencia Apache 2.0 permite uso comercial, pero se solicita mantener la atribución: Boyd Wilson, Abundant Frontier Institute y Omnibond Systems.
- Sesgos conocidos: no documentados en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/AbundantFrontierInstitute/wren-no-return-qwen3-4b-q4f16_1-MLC
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio del proyecto: https://github.com/abundantfrontier/model-as-output
- WebLLM: https://github.com/mlc-ai/web-llm
- Librería WebGPU oficial: https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-models/v0_2_87/base/Qwen3-4B-q4f16_1_cs1k-webgpu.wasm
- Write-up del laboratorio: https://abundantfrontier.org/lab/
