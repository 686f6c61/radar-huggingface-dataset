# fraQtl/Llama-3.1-8B-Instruct-Hi-Fi-GGUF

## Resumen

Llama-3.1-8B-Instruct-Hi-Fi-GGUF es una cuantización GGUF de tipo Q4_K_M del modelo meta-llama/Llama-3.1-8B-Instruct, publicada por el usuario fraQtl bajo la licencia Llama 3.1 Community License. No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de compresión que aplica una metodología propia denominada "calibration-aware per-tensor quantization": en lugar de usar una receta fija de tipos por tensor, asigna el tipo de cuantización de cada tensor mediante calibración con un paquete de datos de código y matemáticas (imatrix, contexto 2048) bajo un presupuesto de bytes idéntico al de la cuantización comunitaria de referencia de bartowski.

El modelo base es un transformer denso de 8.030.261.312 parámetros, 32 capas y atención GQA, con una ventana de contexto nativa de 128.000 tokens (aunque la model card solo documenta evaluación hasta 32.768 tokens). La propuesta de valor del artefacto es la fidelidad distribucional al checkpoint bf16 original: según los datos del autor, reduce la divergencia KL respecto al modelo original un 17,8 % en el slice de código/matemáticas y un 15,1 % en el slice general, manteniendo prácticamente el mismo tamaño de archivo (4.920.411.392 bytes frente a 4.920.739.232, una diferencia del −0,007 %).

Es relevante ahora para desarrolladores que ya sirven Llama 3.1 8B en 4 bits y quieren mejorar la fidelidad sin cambiar de hardware ni de pipeline: el GGUF es compatible con llama.cpp y con endpoints compatibles, e incluye la plantilla de chat embebida. Además, el autor lo presenta como la mitad "target" de un par de decodificación especulativa junto a un draft de 1B (Llama-3.2-1B-Instruct-Hi-Fi-GGUF), aunque el recibo conjunto de ese par aún no está publicado en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1), 32 capas, GQA |
| Parámetros totales | 8.030.261.312 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens en el modelo base; evaluación documentada hasta 32.768 tokens |
| Tipos de cuantización | Q4_K_M (clase Q4_K_M, 4,9019 bpw reales); asignación per-tensor con overrides `--tensor-type`; V de atención en Q8_0 en 29/32 capas; lm_head en Q6_K |
| Idiomas soportados | no disponible en la información proporcionada (heredados del modelo base Llama 3.1) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | GGUF (repo de 4,9 GB; archivo principal de 4.920.411.392 bytes) |

## Arquitectura y entrenamiento

El artefacto no entrena pesos: parte del checkpoint `meta-llama/Llama-3.1-8B-Instruct` en la revisión `0e9e39f249a16976918f6564b8830bc894c89659`, lo convierte a GGUF bf16 con `convert_hf_to_gguf.py --outtype bf16` y lo cuantiza con `llama-quantize` usando overrides `--tensor-type` por tensor, todo ello sobre llama.cpp en el commit `78d2f524682d9fee790a6460c93d018dafeb5229`. La calibración emplea el paquete "fraQtl code+math" (sha256 `9bec84a2…29e02`) con `llama-imatrix` a contexto 2048 sobre sustrato BF16; el `imatrix.dat` se incluye en el repositorio. El profesor de referencia para medir fidelidad es una cuantización Q8_0 del mismo checkpoint bf16 original.

La innovación declarada es la asignación calibration-aware de tipos por tensor bajo un presupuesto de bytes fijo: la familia de atención V es la más protegida (Q8_0 en 29 de 32 capas), la Q de atención nunca se degrada por debajo del tipo nativo de la línea base, y el `lm_head` se mantiene en Q6_K. El resultado es un archivo de clase Q4_K_M con un tamaño casi idéntico al de bartowski pero con menor KLD según las métricas del autor. El modelo base subyacente es un transformer denso estándar de Llama 3.1 con 32 capas y GQA; la model card no documenta detalles adicionales sobre el entrenamiento original de Meta (número de tokens, composición del dataset, RLHF/DPO), por lo que esos datos deben consultarse en la documentación oficial de Llama 3.1.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat embebida en el GGUF (usable vía `llama_chat_apply_template` o APIs de chat-completion).
- Razonamiento general y respuesta a instrucciones, heredados del modelo Instruct base.
- Código y matemáticas: el autor calibra específicamente con un paquete de código y matemáticas y reporta métricas separadas para ese slice.
- Tool calling / function calling: el slice de evaluación general incluye chat, tool y wikitext, lo que indica soporte del modelo base para uso de herramientas.
- Recuperación en contexto largo: la model card documenta needle-in-a-haystack con contextos de 8.192 y 32.768 tokens y profundidades 0,1 / 0,5 / 0,9, con resultado 18/18 en todas las celdas.
- Decodificación especulativa: diseñado para emparejarse con el draft de 1B del mismo autor mediante `llama-speculative`.
- Capacidades multilingües: no documentadas en esta model card; dependen del modelo base Llama 3.1.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Sustitución directa en despliegues existentes de Llama 3.1 8B en 4 bits: al tener el mismo tamaño de archivo y la misma clase Q4_K_M que la cuantización comunitaria, se puede cambiar el artefacto sin tocar el pipeline de llama.cpp ni el presupuesto de VRAM, obteniendo según el autor menor KLD frente al bf16.
- Asistente de código en local: el modelo está calibrado con datos de código y matemáticas y mantiene atención V en Q8_0 en 29/32 capas, lo que lo hace adecuado para autocompletado, explicación y refactorización en entornos sin GPU de datacenter.
- Chat de atención al cliente con contexto largo: la ventana nativa de 128.000 tokens del modelo base y la recuperación verificada hasta 32.768 tokens permiten gestionar conversaciones multi-turno con historial extenso o documentos adjuntos.
- Servicio de inferencia en una sola GPU consumer: con 4,9 GB de pesos, cabe en GPUs de 8 GB o más y permite servir un endpoint compatible con APIs de chat en hardware de gama media.
- Pipeline de decodificación especulativa: emparejado con el draft de 1B del mismo autor mediante `llama-speculative --draft-max 16`, pensado para reducir latencia en generación interactiva manteniendo la fidelidad del target.
- Evaluación de fidelidad de cuantizaciones: los recibos incluidos en `receipts/` (build, evaluación, retrieval y tabla de bpw real por capa) sirven como referencia reproducible para comparar metodologías de cuantización.
- Prototipado de agentes con tool calling: el soporte de function calling del modelo base, junto con la plantilla de chat embebida, permite construir flujos de agente multi-paso en local antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Los datos publicados miden fidelidad distribucional frente al modelo original, no precisión en tareas. Métrica: KLD top-20 simétrico sobre el soporte de un profesor Q8_0, 3 ejecuciones independientes, deriva entre ejecuciones 0,0.

| Arm | Bytes | bpw reales | KLD código/mates ↓ | KLD general ↓ | Top-1 agree cm | Top-1 agree gen |
|---|---:|---:|---:|---:|---:|---:|
| bartowski Q4_K_M | 4.920.739.232 | 4,9022 | 0,034463 | 0,022621 | 0,9532 | 0,9470 |
| fraQtl Hi-Fi (este repo) | 4.920.411.392 (−0,007 %) | 4,9019 | 0,028341 (−17,8 %) | 0,019196 (−15,1 %) | 0,9580 | 0,9510 |

Recuperación en contexto largo (needle-in-a-haystack): rejilla de contextos {8.192, 32.768} × profundidades {0,1, 0,5, 0,9} × 3 passkeys (18 celdas), exact-match, greedy, 3 ejecuciones por arm. Tanto este artefacto como la línea base de bartowski obtienen 18/18 en todas las ejecuciones; el autor señala que la rejilla satura a escala 8B y no discrimina entre ambos arms.

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5 GB solo para pesos; con overhead de contexto y caché KV, un despliegue práctico requiere del orden de 6-8 GB para contextos moderados y más para contextos de decenas de miles de tokens.
- GPU recomendadas: el autor reporta evaluación en A100-80GB, pero el tamaño del artefacto permite GPUs mucho menores. Para servir con contexto largo son adecuadas A100/H100; para uso interactivo, RTX 4090, RTX 4080, RTX 3090 o RTX 4070 Ti.
- Cabe en GPU consumer: sí, en cualquier GPU con 8 GB o más de VRAM; en GPUs de 6 GB puede requerir descarga parcial de capas a CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-speculative`), llama-cpp-python (versión usada en la evaluación: 0.3.33 con llama.cpp `78d2f5246`), y servidores compatibles con endpoints de chat que acepten GGUF. No se documenta soporte específico para vLLM, TGI u Ollama en la información proporcionada.
- Latencia y throughput: no disponibles para este artefacto. El autor menciona, en un repositorio distinto de su organización, 134,1 tok/s agregados con nueve usuarios concurrentes de contexto ≈128K en una A100, pero esa cifra corresponde a otro modelo y no debe atribuirse a este.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Fidelidad KLD (cm / gen) | Disponibilidad |
|---|---|---|---|---|---|---|
| fraQtl Llama-3.1-8B-Instruct-Hi-Fi | 8,03 B | 128K (base) | Q4_K_M, 4,9019 bpw | Llama 3.1 | 0,028341 / 0,019196 | Hugging Face, 63 descargas |
| bartowski Meta-Llama-3.1-8B-Instruct | 8,03 B | 128K (base) | Q4_K_M, 4,9022 bpw | Llama 3.1 | 0,034463 / 0,022621 | Hugging Face, cuantización comunitaria de referencia |
| meta-llama/Llama-3.1-8B-Instruct (bf16) | 8,03 B | 128K | bf16 | Llama 3.1 | referencia (0 por definición) | Hugging Face, modelo oficial |

La comparación se limita a variantes del mismo modelo base porque la información proporcionada no incluye datos de otros modelos de 8B comparables. La diferencia clave frente a bartowski es la fidelidad declarada a igualdad de tamaño; frente al bf16, la ventaja es el menor footprint (4,9 GB frente a aproximadamente 16 GB) a costa de una divergencia distribucional medible.

## Limitaciones y advertencias

- Es una cuantización de 4 bits: las salidas pueden diferir del modelo bf16 original, y las métricas de fidelidad miden cercanía distribucional, no precisión en tareas.
- No hay benchmarks de tareas publicados en la model card; no se puede inferir rendimiento en MMLU, HumanEval o GSM8K a partir de los datos de KLD.
- La rejilla de recuperación en contexto largo satura a escala 8B (18/18 en ambos arms), por lo que no aporta evidencia diferencial sobre la calidad del contexto largo de este artefacto frente a la línea base.
- Idiomas soportados no documentados en esta ficha; dependen de la cobertura del modelo base Llama 3.1 y deben validarse para el idioma objetivo.
- Sesgos y riesgo de alucinación: no documentados específicamente para esta cuantización; heredados del modelo base y no mitigados por el proceso de cuantización.
- Licencia Llama 3.1 Community License: el uso comercial está permitido con condiciones (atribución, política de uso aceptable de Meta, denominación del derivado comenzando por "Llama"). Es imprescindible revisar el texto completo en `LICENSE` y el `NOTICE` del repositorio antes de desplegar en producción.
- El par de decodificación especulativa con el draft de 1B se anuncia, pero el recibo conjunto de rendimiento "aún está por publicar" según la model card; no hay cifras verificadas de aceleración para este par.
- Repositorio con muy baja adopción (63 descargas, 0 likes en el momento de la consulta) y autor individual: conviene validar el artefacto (sha256 `3c9656099140a679fe3a4061a61498dcb89fc324d978769312f4311a5de642da`) y los recibos antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fraQtl/Llama-3.1-8B-Instruct-Hi-Fi-GGUF
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Cuantización de referencia (bartowski): https://huggingface.co/bartowski/Meta-Llama-3.1-8B-Instruct-GGUF
- Draft de 1B del mismo autor: https://huggingface.co/fraQtl/Llama-3.2-1B-Instruct-Hi-Fi-GGUF
- Página de la organización fraQtl: https://huggingface.co/fraQtl
- Sidecars de compresión de caché KV: https://huggingface.co/fraQtl/qwen3-4b-instruct-2507-kv-sidecars
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
- llama.cpp (commit de referencia `78d2f524682d9fee790a6460c93d018dafeb5229`): https://github.com/ggml-org/llama.cpp
