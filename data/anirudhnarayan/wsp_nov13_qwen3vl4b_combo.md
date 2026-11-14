# AnirudhNarayan/wsp_nov13_qwen3vl4b_combo

## Resumen

`wsp_nov13_qwen3vl4b_combo` es un checkpoint de investigación no oficial derivado de `Qwen/Qwen3-VL-4B-Instruct` (revisión `ebb281ec70b05090aa6165b016eac8ec08e71b17`), publicado por el usuario AnirudhNarayan. No se trata de un fine-tuning convencional: es una edición de pesos realizada mediante técnicas de *Weight-Space Programming* (WSP), un enfoque sin gradientes que modifica directamente tensores específicos del modelo para alterar su comportamiento de seguridad. El autor lo distribuye como artefacto de investigación y no está respaldado por el equipo de Qwen.

El modelo conserva la arquitectura, el tokenizador y el procesador del Qwen3-VL-4B-Instruct original, con 4.437.815.808 parámetros en BF16 y un total de 8,9 GB en el repositorio. Solo 8 tensores difieren del modelo base; el resto de archivos y formas son idénticos, lo que permite cargarlo con `Qwen3VLForConditionalGeneration` exactamente igual que el original.

La relevancia del checkpoint es metodológica: demuestra que es posible modular la tasa de rechazo (refusal) de un modelo visión-lenguaje editando un puñado de matrices `mlp.down_proj` en capas intermedias, con 386 pasadas hacia delante y sin reentrenar. Los resultados en el split de selección de VLGuard muestran una reducción del ASR (attack success rate) del 0,500 al 0,083 a costa de un ORR (over-refusal rate) del 0,030, con una pérdida de utilidad mínima (0,5665 a 0,5645 en precisión con teacher forcing sobre llava).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer visión-lenguaje (Qwen3-VL), edición de pesos sobre el modelo base |
| Parámetros totales | 4.437.815.808 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del Qwen3-VL-4B-Instruct base) |
| Tipos de cuantización | no disponible; pesos publicados en BF16 |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (BF16), compatible con `transformers` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-4B-Instruct, un transformer multimodal que procesa imagen y texto para generar respuestas conversacionales. Sobre esa base, el autor aplica una combinación lineal de dos ediciones de pesos construidas sin gradientes: `W* = W0 + 0.25·Δ1 + 1.5·Δ4`. La edición Δ1 (`refamp`) amplifica la dirección de rechazo mediante la proyección `W + a·r_l (r_lᵀ W)` sobre `mlp.down_proj` en las capas 18 a 25. La edición Δ4 (`harm_neurons`) aplica una actualización de rango 1, `0.5·g_l·r_l ⊗ key`, donde `key` es un detector disperso de 64 neuronas que discrimina entre entradas inseguras y benignas, sobre `mlp.down_proj` en las capas 20 y 22. Los coeficientes de mezcla (0,25 y 1,5) se eligieron por medición, no por entrenamiento, y el proceso consumió 386 pasadas hacia delante de un presupuesto de 500. No hubo backpropagation, RLHF ni DPO. El manifiesto de la edición está en `wsp_edit_manifest.json`.

## Capacidades

- Generación de texto e imagen-texto conversacional, heredada del Qwen3-VL-4B-Instruct base.
- Razonamiento multimodal: descripción de imágenes, respuesta a preguntas visuales y diálogo multi-turno.
- Modulación de seguridad: reducción medible de la tasa de éxito de ataques (ASR) frente al modelo base, con un incremento pequeño del rechazo excesivo (ORR).
- Carga directa con `transformers` mediante `Qwen3VLForConditionalGeneration` y `AutoProcessor`.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Tool calling, function calling, agentes y modo thinking: no disponible en la información proporcionada para este checkpoint (dependen del modelo base, no documentados aquí).
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Investigación en alineación y seguridad de modelos: el checkpoint sirve como caso de estudio reproducible de edición de pesos sin gradientes, con coeficientes y tensores documentados, para analizar cómo se comporta la dirección de rechazo en un VLM de 4B.
- Evaluación comparativa de robustez frente a ataques: útil para medir ASR y ORR en pipelines de red-teaming sobre VLGuard u otros conjuntos de seguridad visual, comparando el modelo base con la versión editada.
- Estudio de sobre-rechazo en modelos visión-lenguaje: el ORR del 0,030 permite analizar falsos positivos en prompts benignos como "describe the person", un fenómeno documentado en las limitaciones del autor.
- Prototipado de asistentes visuales con requisitos de seguridad moderados: en entornos de investigación donde se necesita un VLM de 4B que rechace contenido dañino con mayor fiabilidad que el base, sin cambiar la arquitectura ni el pipeline de inferencia.
- Análisis de transferibilidad de ediciones: el manifiesto de 8 tensores permite estudiar si la edición se puede trasladar a otras variantes de Qwen3-VL o a modelos de distinto tamaño.
- Docencia y divulgación técnica: ejemplo práctico de Weight-Space Programming para explicar edición de modelos, direcciones de rechazo y detección de neuronas asociadas a contenido inseguro.

## Benchmarks y rendimiento

Resultados de desarrollo publicados por el autor sobre el split de selección de VLGuard (n = 168 dañinos / 168 benignos):

| Modelo | ORR ↓ | ASR ↓ | ASR unsafes | ASR safe_unsafes | Utilidad (teacher-forced acc, llava) |
|---|---|---|---|---|---|
| Base (W0) | 0,000 | 0,500 | 0,631 | 0,369 | 0,5665 |
| Este modelo (W*) | 0,030 | 0,083 | 0,155 | 0,012 | 0,5645 |

El autor reporta un ajuste del compromiso ASR–ORR tras la búsqueda de combinaciones: `(ASR + 0,080)(ORR + 0,057) = 0,0121`. Los resultados sobre el split de test de VLGuard (held-out) estaban pendientes de cálculo en el momento de la subida del checkpoint. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8,9 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, se recomienda al menos 12-16 GB de VRAM para contexto moderado.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para BF16; GPUs con 16 GB (RTX 4080, A4000) pueden ser suficientes con cuantización, aunque no se documentan formatos GGUF en el repositorio.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en RTX 4080 (16 GB) con cuantización, aunque el repositorio solo publica safetensors en BF16.
- Opciones de despliegue: `transformers` con `device_map="auto"`; vLLM, TGI, llama.cpp u Ollama no están documentados para este checkpoint en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `wsp_nov13_qwen3vl4b_combo` | 4,44B | no disponible | Edición de pesos para seguridad (WSP) | Apache-2.0 | Hugging Face, 0 descargas |
| `Qwen/Qwen3-VL-4B-Instruct` (base) | ~4,4B | no disponible | VLM instructivo original | Apache-2.0 | Hugging Face, oficial |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada; la única comparación documentada es contra el propio modelo base.

## Limitaciones y advertencias

- Checkpoint de investigación no oficial: no está respaldado por el equipo de Qwen y no debe tratarse como garantía de seguridad.
- Los números de ASR y ORR provienen de un split de selección pequeño (n = 168 por clase), con intervalos de confianza del 95% que abarcan varios puntos; los resultados de test held-out no estaban disponibles al subir el modelo.
- Riesgo de sobre-rechazo: el autor documenta que imágenes benignas limítrofes, como prompts del tipo "describe the person", pueden activar rechazos.
- Sesgos conocidos: no documentados explícitamente en la información proporcionada; se heredan los del modelo base.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Limitaciones de contexto e idioma: no disponibles en la información proporcionada.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero al ser un artefacto de investigación sin validación en producción, el uso comercial no está recomendado por el autor.
- Solo 8 tensores difieren del base; cualquier modificación adicional o fusión con otros checkpoints puede alterar el comportamiento de seguridad de forma impredecible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnirudhNarayan/wsp_nov13_qwen3vl4b_combo
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Repositorio del autor: https://huggingface.co/AnirudhNarayan
- Manifiesto de la edición: `wsp_edit_manifest.json` (incluido en el repositorio del modelo)
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada.
