# hletrd/Qwen3.8-27B-Tensix-BFP4

## Resumen

Qwen3.8-27B-Tensix-BFP4 es una cuantización del modelo Qwen/Qwen3.8-27B realizada por hletrd (Xylolabs) para su ejecución en aceleradores Tenstorrent Tensix (Wormhole y Blackhole). El modelo base es un transformer multimodal de tipo image-text-to-text con 27.781 millones de parámetros, y esta versión reduce su huella de 53,79 GB en bf16 a 17,596 GB empaquetados mediante cuantización de bloque en coma flotante (block floating point, BFP) con GPTQ para los tensores de 4 bits.

La relevancia de esta ficha radica en que no es una cuantización convencional para GPU: el formato `bfloat4_b` / `bfloat8_b` está diseñado específicamente para el hardware Tensix de Tenstorrent, que carece de soporte nativo para enteros de 4 bits y trabaja con exponentes compartidos por bloque. Esto permite desplegar un modelo de casi 28.000 millones de parámetros en una sola tarjeta Tensix con una degradación de calidad medida y acotada frente al modelo en bf16.

La arquitectura del modelo base combina capas de atención clásica con capas Gated DeltaNet (atención lineal), lo que reduce el coste computacional en contextos largos. El repositorio incluye los tensores multimodales (`visual`) y de predicción multi-token (`mtp`) sin cuantizar, en bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con Gated DeltaNet (atención lineal) y atención clásica; multimodal image-text-to-text |
| Parametros totales | 27.781.427.952 (27,78 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) en proyecciones de atención, Gated DeltaNet y MLP; BFP8 (`bfloat8_b`) en LM head; bf16 en embeddings, normas, `mtp` y `visual` |
| Idiomas soportados | no disponible (la evaluación incluye textos en inglés y coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (empaquetado Tensix; incluye `quant4.json` y `model.safetensors.index.json`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida: 16 capas con atención clásica (q, k, v, o) y 48 capas con Gated DeltaNet, un mecanismo de atención lineal recurrente que reduce el coste de cómputo y memoria en secuencias largas. El bloque MLP aparece en 64 capas. El modelo es multimodal (pipeline image-text-to-text) e incluye un módulo `mtp` (multi-token prediction) y un torre visual (`visual`), ambos conservados en bf16 en esta cuantización.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base utilizó RLHF o DPO; esos datos corresponden a la model card de Qwen/Qwen3.8-27B, que no se ha proporcionado. La innovación técnica de esta ficha es el proceso de cuantización: los tensores `bfloat4_b` se cuantizaron con GPTQ más una búsqueda de exponente por bloque, y los `bfloat8_b` con redondeo al más cercano. El resultado se empaqueta en un formato que el hardware Tensix puede consumir directamente mediante `ttnn`, y el repositorio incluye las herramientas `pack_tensix.py` y `verify_grid.py` para verificar la integridad de cada matriz.

## Capacidades

- Generación de texto conversacional con plantilla de chat (`apply_chat_template`).
- Procesamiento multimodal image-text-to-text (el módulo `visual` se mantiene en bf16).
- Razonamiento y respuesta a preguntas de conocimiento general (el ejemplo de la model card es "What is the capital of France?").
- Predicción multi-token mediante el módulo `mtp` conservado en bf16.
- Capacidades multilingües: la evaluación incluye textos en inglés y coreano, aunque no se detalla la lista completa de idiomas.
- Ejecución en hardware Tenstorrent Tensix (Wormhole, Blackhole) mediante `ttnn`, con kernels y runner propios (`tensix-kernels`, `tensix-runner`).
- Compatibilidad con `transformers` para inferencia en GPU/CPU convencional con `dtype="bfloat16"` y `device_map="auto"`.
- No se documenta soporte explícito de tool calling, function calling ni modo de razonamiento extendido (thinking mode) en la información disponible.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el caso principal. Un equipo con tarjetas Wormhole o Blackhole puede servir un modelo de 27,78 mil millones de parámetros en 17,596 GB, frente a los 53,79 GB en bf16, lo que permite ajustar el modelo en memoria DRAM de una sola tarjeta y evitar la agregación de varias GPU.
- Inferencia de bajo coste energético en edge o servidores: al ejecutarse sobre NPUs Tensix en lugar de GPU, el modelo es adecuado para entornos donde el consumo y la disponibilidad de GPU son limitantes, manteniendo una calidad cercana al bf16 (KL media de 0,02894 frente a bf16).
- Validación de pipelines de cuantización: el repositorio incluye scripts de verificación (`pack_tensix.py`, `verify_grid.py`) y una comparación con Q4_K_M de llama.cpp, por lo que sirve como referencia para equipos que quieran replicar el flujo GPTQ + BFP para otros modelos.
- Investigación en formatos de bloque: útil para estudiar el compromiso entre tamaño (17,596 GB) y fidelidad (top-1 del 92,62 % frente a bf16) en formatos BFP4 con exponente compartido.
- Asistentes conversacionales multilingües (inglés/coreano): la evaluación cubre ambos idiomas, por lo que es razonable para prototipos de chat en esos idiomas, con la cautela de que no se documenta la cobertura completa.
- Procesamiento de documentos con imagen y texto: al conservar la torre visual en bf16, el modelo puede emplearse en tareas image-text-to-text sin la degradación que supondría cuantizar el encoder visual.
- Pruebas de integración con `tt-metal` v0.81.1: el demo `models/demos/qwen38_27b_qb2/demo/text_demo.py` permite medir latencia y throughput reales en hardware Tensix antes de comprometer un despliegue en producción.

## Benchmarks y rendimiento

Los datos de evaluación publicados comparan la cuantización con el modelo en bf16 y con Q4_K_M de llama.cpp, midiendo la divergencia KL y el top-1 sobre 16.240 posiciones de cuatro textos (inglés y coreano, hasta 1.024 tokens por secuencia).

| Modelo | Tamano (GB) | KL media a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (Qwen/Qwen3.8-27B) | 53,79 | 0 | 100 |
| Este modelo (BFP4/BFP8) | 17,596 | 0,02894 | 92,62 |
| Q4_K_M (llama.cpp) | 16,811 | 0,02081 | 92,94 |

La regla de aceptación del autor exige una KL media no superior a 1,5 veces la de Q4_K_M (0,03121); este modelo cumple con 0,02894. Además, la comprobación de respuestas (33 ítems más 7 adicionales) con el head `bfloat4_b` top-16 y rescoring en bf16 da 31/33 y 7/7, sin regresiones. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 17,596 GB para los pesos empaquetados en Tensix; en GPU convencional con `transformers` y `dtype="bfloat16"` se requiere aproximadamente el tamaño del modelo base (unos 53,79 GB en bf16 más overhead de activaciones y caché KV).
- GPU recomendadas para la ruta `transformers`: no especificadas; por tamaño en bf16, se necesitan GPU de 80 GB (A100, H100) o varias GPU con `device_map="auto"`.
- Aceleradores objetivo: Tenstorrent Wormhole y Blackhole (Tensix), con `tt-metal` v0.81.1.
- ¿Cabe en GPU de consumo? En su formato Tensix no aplica; en bf16 no cabe en una RTX 4090 (24 GB). No se documenta una variante GGUF para llama.cpp de este repositorio.
- Opciones de despliegue: `ttnn` con `tt-metal` (ruta nativa), `transformers` con `AutoModelForCausalLM` (ruta de compatibilidad), y el runner `tensix-runner` v0.1.0. No se mencionan vLLM, TGI, Ollama ni llama.cpp para este repositorio.
- Latencia y throughput: no disponibles en la información proporcionada; el demo `text_demo.py` con `--length 128 --generate 128` permite medirlos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3.8-27B Tensix BFP4) | 27,78 mil millones | no disponible | 17,596 GB (Tensix) | Apache-2.0 | Hugging Face, 199 descargas |
| Qwen/Qwen3.8-27B (bf16) | 27,78 mil millones | no disponible | 53,79 GB | Apache-2.0 | Hugging Face (modelo base) |
| Q4_K_M de llama.cpp (mismo checkpoint) | 27,78 mil millones | no disponible | 16,811 GB | Apache-2.0 | Generado por el autor, no publicado como repo |

La comparación relevante es frente a Q4_K_M: este modelo ocupa un 4,7 % más de espacio (17,596 frente a 16,811 GB) y presenta una KL media un 39 % mayor (0,02894 frente a 0,02081), con un top-1 ligeramente inferior (92,62 % frente a 92,94 %). La ventaja es la ejecución nativa en Tensix, que Q4_K_M no ofrece. No se dispone de datos para comparar con otras alternativas de la misma categoría (por ejemplo, otros modelos multimodales de ~28B) en la información proporcionada.

## Limitaciones y advertencias

- La cuantización BFP4 introduce una degradación medible: KL media de 0,02894 y top-1 del 92,62 % frente al 100 % del bf16; no es equivalente al modelo original.
- El formato está acoplado al hardware Tensix; fuera de Tenstorrent requiere cargar los pesos con `transformers`, lo que anula la ventaja de tamaño y exige memoria para bf16.
- No se documentan sesgos conocidos, pero al ser una cuantización del modelo base, hereda los sesgos de Qwen3.8-27B, no evaluados en esta ficha.
- Riesgo de alucinación inherente a los modelos generativos; la evaluación del autor se limita a 40 ítems de comprobación de respuestas, una muestra pequeña.
- Cobertura de idiomas no documentada; la evaluación solo cubre inglés y coreano.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.8-27B, que no se detallan aquí.
- El repositorio tiene 0 likes y 199 descargas, y la model card está fechada en noviembre de 2026; es un artefacto reciente con poca validación comunitaria.
- La model card contiene una entrada "Updates" truncada ("2026-11-24: Eva"), lo que sugiere documentación incompleta.
- No se especifican requisitos de versión de `transformers` ni de `tt-metal` más allá de la v0.81.1 usada en el demo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hletrd/Qwen3.8-27B-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit de referencia: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado en los tags (arxiv:2505.09388): https://arxiv.org/abs/2505.09388
