# hletrd/Qwen3-8B-Tensix-BFP8

## Resumen

Qwen3-8B-Tensix-BFP8 es una cuantización del modelo Qwen/Qwen3-8B (8.190.735.360 parámetros) realizada por Xylolabs y publicada por el usuario hletrd en Hugging Face. El modelo aplica GPTQ para redondear las capas lineales de atención (q, k, v, o) y del MLP (gate, up, down) de las 36 capas a la rejilla `ttnn.bfloat8_b` (BFP8, block floating point de 8 bits), un formato nativo de las NPU Tensix de Tenstorrent (Wormhole y Blackhole). Los pesos se distribuyen en bf16, pero cada valor ya está alineado a la rejilla BFP8, de modo que TT-NN los empaqueta sin re-redondear.

El objetivo no es servir el modelo en GPU convencional, sino disponer de un checkpoint listo para desplegar en hardware Tensix mediante tt-metal y TT-NN, evitando la pérdida de precisión que introduciría un reempaquetado en el dispositivo. La cuantización deja el modelo en 9,64 bits por peso de media (9,87 GB empaquetados frente a 16,38 GB en BF16), manteniendo una fidelidad alta respecto al original: KL media de 0,00100 frente a BF16 y top-1 del 98,68 % sobre 16.240 posiciones de texto en inglés y coreano.

Es relevante porque demuestra una vía de cuantización consciente del formato de destino (format-aware) para aceleradores no-GPU, y porque publica código de verificación (`pack_tensix.py`, `verify_grid.py`) que comprueba que ningún valor cambia al empaquetar. La contracción es que el modelo solo se ha probado en el simulador ttsim de Blackhole, no en silicio real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), pesos cuantizados a BFP8 en capas lineales |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-8B) |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`, 8,5 bits por peso) en q/k/v/o y gate/up/down; bf16 en LM head, embeddings y normas; 9,64 bits por peso de media |
| Idiomas soportados | no disponible (evaluado en ingles y coreano) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16 con valores en la rejilla BFP8), `quant4.json` con el formato por proyeccion |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B, un transformer decoder-only denso de 36 capas y 8.190.735.360 parámetros, con atención q/k/v/o y MLP gate/up/down por capa. Este checkpoint no reentrena el modelo: parte de los pesos oficiales de Qwen/Qwen3-8B y aplica GPTQ para redondear las siete proyecciones lineales de cada una de las 36 capas a la rejilla `ttnn.bfloat8_b`. El exponente compartido de cada bloque lo fija el empaquetador de Tenstorrent, y la calibración se realizó sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. El LM head, los embeddings, las normas y el resto de tensores permanecen en bf16.

La innovación técnica es la cuantización orientada al formato de destino: los valores se redondean directamente sobre la rejilla BFP8 que TT-NN espera, de modo que el empaquetado en la NPU es exacto (sin re-redondeo). El autor incluye herramientas de verificación (`pack_tensix.py` comprueba matriz a matriz que el tensor empaquetado coincide con el original; `verify_grid.py` valida la rejilla solo con torch) y documenta una integración con tt-transformers (tt-metal v0.81.1) usando `--use_hf_rope`, con la que las proyecciones de las dos primeras capas empaquetan exactamente y un prefill de 2 capas alcanza PCC 0,9990 frente a transformers. No se documenta RLHF/DPO adicional en este checkpoint; se hereda el post-entrenamiento de Qwen3-8B.

## Capacidades

- Generación de texto conversacional y razonamiento, heredados de Qwen3-8B (incluye modo thinking según la plantilla de chat del modelo base).
- Generación de código y matemáticas, con la precisión degradada esperable tras la cuantización BFP8 (pérdida nula en las 40 respuestas evaluadas frente a BF16).
- Soporte de plantilla de chat (`apply_chat_template`) y uso con `transformers` en bf16 sobre GPU/CPU para validación.
- Despliegue en NPU Tensix mediante TT-NN (`ttnn.as_tensor` con `ttnn.bfloat8_b`, `TILE_LAYOUT`, DRAM).
- Integración con tt-transformers (tt-metal v0.81.1) para prefill/decode en Tensix.
- Capacidades multilingües: no documentadas explícitamente; la evaluación cubre inglés y coreano.
- Tool calling / function calling: no disponible en la información proporcionada.
- Visión y audio: no disponible (el modelo base es solo texto).

## Casos de uso

- Despliegue en aceleradores Tenstorrent Wormhole o Blackhole: el checkpoint está pensado para cargarse directamente en TT-NN con `ttnn.bfloat8_b`, evitando el re-redondeo en dispositivo y aprovechando los 9,87 GB empaquetados frente a 16,38 GB en BF16.
- Validación de pipelines de cuantización format-aware: sirve como referencia para comprobar que un empaquetado BFP8 no altera valores, usando `pack_tensix.py` y `verify_grid.py` en CI.
- Investigación en eficiencia de hardware no-GPU: permite medir fidelidad (KL 0,00100, top-1 98,68 %) y coste de memoria de BFP8 frente a BF16 y a Q4_K_M en el mismo modelo.
- Servicio de generación de texto en entornos con NPU Tensix: con tt-transformers y `--use_hf_rope` se puede ejecutar el demo de texto batch-1 con configuraciones de precisión bfp8 en ff1_3, ff2, wqkv, wo y kv_cache.
- Baseline para comparativas de cuantización: al publicar métricas de KL y top-1 sobre WikiText-2 y Wikipedia coreana, sirve para contrastar otras técnicas (GPTQ, AWQ, Q4_K_M) sobre Qwen3-8B.
- Prototipado y simulación: probado en ttsim (simulador de Blackhole) con ttnn 0.81.1, útil para desarrollar kernels y flujos antes de disponer de silicio.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen3-8B) | 16 | 16,38 | 0 | 100 | 38 de 40 | - |
| Qwen3-8B-Tensix-BFP8 | 9,64 | 9,870 | 0,00100 | 98,68 | 38 de 40 | 0 |
| Q4_K_M (llama.cpp) | 4,90 | 5,028 | 0,04236 | 91,24 | 38 de 40 | 0 |

Las métricas de KL y top-1 cubren 16.240 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia coreana), en texto plano y con plantilla de chat. Las respuestas corresponden a 33 prompts cortos con comprobación automática más 7 de razonamiento repetidos con thinking activado (40 en total); "perdidas" indica respuestas correctas en BF16 que aquí resultan incorrectas o rotas. No se han publicado resultados de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para GPU; el checkpoint ocupa 9,87 GB empaquetados en BFP8 y 16,4 GB en el repositorio (pesos en bf16 sobre la rejilla BFP8).
- Hardware objetivo: NPU Tensix de Tenstorrent (Wormhole y Blackhole). Probado únicamente en ttsim, el simulador de Blackhole, con ttnn 0.81.1; no se ha validado en silicio real según la model card.
- GPU: no es el destino previsto; puede cargarse en GPU con `transformers` en bfloat16 (`device_map="auto"`) para validación, requiriendo del orden de 16 GB o más.
- Consumer GPU: no disponible como caso de uso documentado; la carga en bf16 vía transformers podría caber en GPUs de 24 GB, pero no se aportan medidas.
- Despliegue: TT-NN (tt-metal v0.81.1) y tt-transformers con `--use_hf_rope`; tt-forge (tt-xla) aún no probado con este checkpoint (por defecto mantiene bf16; sus opciones `bfp_bf8`/`bfp_bf4` re-redondean).
- Latencia y throughput: no disponibles; solo se reporta que el demo de rendimiento batch-1 de tt-transformers se ejecutó con las optimizaciones indicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Bits/peso | KL vs BF16 | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Qwen3-8B-Tensix-BFP8 | 8,19 B | no disponible | 9,64 | 0,00100 | Apache-2.0 | Hugging Face (hletrd) |
| Qwen/Qwen3-8B (BF16) | 8,19 B | no disponible | 16 | 0 | Apache-2.0 | Hugging Face (Qwen) |
| Qwen3-8B Q4_K_M (llama.cpp) | 8,19 B | no disponible | 4,90 | 0,04236 | Apache-2.0 | derivado estándar |

La comparativa se limita al mismo modelo base en distintos formatos, ya que la información proporcionada no incluye otros modelos de 8 B comparables. Frente a BF16, BFP8 reduce el tamaño un 39,7 % con KL de 0,00100; frente a Q4_K_M, ocupa casi el doble pero mejora la KL en más de 40 veces (0,00100 frente a 0,04236) y el top-1 en 7,4 puntos.

## Limitaciones y advertencias

- No validado en hardware Tensix real: solo se ha probado en el simulador ttsim de Blackhole con ttnn 0.81.1; el rendimiento y la corrección en silicio están por confirmar.
- El demo de tt-transformers empaqueta el LM head en bfloat8_b, por lo que el head bf16 de este checkpoint no es exacto en ese flujo.
- tt-forge (tt-xla) no se ha ejecutado con este checkpoint; sus opciones bfp re-redondean los valores en lugar de respetar la rejilla.
- Riesgo de alucinación inherente a Qwen3-8B, no mitigado por la cuantización; la evaluación solo cubre 40 respuestas cortas.
- Idiomas soportados no declarados; la evaluación se limita a inglés y coreano, sin datos sobre castellano.
- Licencia Apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3-8B.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria.
- La cuantización BFP8 introduce un error no nulo (KL 0,00100, top-1 98,68 %); en tareas sensibles a precisión numérica conviene contrastar con BF16.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hletrd/Qwen3-8B-Tensix-BFP8
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- tt-metal (rama v0.81.1): https://github.com/tenstorrent/tt-metal
- Paper de Qwen3 (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Licencia: https://huggingface.co/hletrd/Qwen3-8B-Tensix-BFP8/blob/main/LICENSE
