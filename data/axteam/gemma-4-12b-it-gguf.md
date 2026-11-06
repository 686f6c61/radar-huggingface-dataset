# axteam/gemma-4-12B-it-GGUF

## Resumen

`axteam/gemma-4-12B-it-GGUF` es una compilación de pesos en formato GGUF del modelo `google/gemma-4-12B-it`, publicada por el usuario axteam. El modelo base es un transformer denso de la familia Gemma 4 de Google DeepMind con aproximadamente 11.907 millones de parámetros, afinado para instrucciones (it) y originalmente multimodal (image-text-to-text). Esta versión GGUF, sin embargo, contiene únicamente el lado lingüístico: no incluye el proyector de visión (`mmproj`), por lo que en la práctica es un modelo de texto.

El interés de esta ficha radica en que permite ejecutar un modelo de ~12B parámetros en hardware de consumo mediante cuantización de 4 u 8 bits con llama.cpp, Ollama o LM Studio. El repositorio ofrece tres archivos: BF16 (23,8 GB), Q4_K_M (7,4 GB) y Q8_0 (12,7 GB), con el chat template ya embebido en el GGUF.

La cuantización es post-entrenamiento (PTQ) con los k-quants de llama.cpp, sin reentrenamiento ni QAT. El autor publica métricas de divergencia KL frente al BF16 sobre texto en inglés y coreano, lo que permite evaluar la pérdida de calidad de cada variante antes de desplegarla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4, transformer denso (multimodal en origen; el GGUF ejecuta solo el lado de lenguaje) |
| Parametros totales | 11.907.350.576 (~11,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `-c 8192`, pero no se especifica el máximo) |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M (k-quants de llama.cpp) |
| Idiomas soportados | no disponible (la model card incluye pruebas en inglés y coreano) |
| Licencia | apache-2.0 en el repo, sujeto a la Gemma 4 license de Google |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Gemma 4 con unos 11,9B parámetros, publicado por Google DeepMind como checkpoint multimodal (image-text-to-text) y afinado para instrucciones. Esta compilación GGUF se ha convertido desde el BF16 original con `convert_hf_to_gguf.py` y `llama-quantize` de llama.cpp, e incluye el chat template embebido. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en el modelo original.

La cuantización aplicada es post-entrenamiento (PTQ) con los k-quants de llama.cpp: escalas por bloque con asignación mixta de bits y redondeo refinado, sin reentrenamiento. El autor distingue explícitamente este proceso del QAT y de las compilaciones AWQ/NVFP4 para vLLM. La arquitectura `gemma4` requiere llama.cpp ≥ b9493 (por el manejo de `suppress_tokens`) y el flag `-fa on` requiere ≥ b6325.

## Capacidades

- Generación de texto conversacional multi-turno con chat template embebido en el GGUF.
- Respuesta a instrucciones (checkpoint `-it`), con preguntas de conocimiento general verificadas en las pruebas del autor (capitales de Francia y Corea).
- Capacidad multilingüe parcial: el autor reporta pruebas en inglés y coreano; no se detalla la lista completa de idiomas.
- Razonamiento y matemáticas: no se documentan capacidades específicas ni benchmarks en la información disponible.
- Generación de código: no se documenta en la model card.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Visión: el modelo base es multimodal, pero esta compilación GGUF no incluye `mmproj`, por lo que la entrada es solo texto.
- Modo thinking: no disponible.

## Casos de uso

- Asistente conversacional local en hardware de consumo: con el archivo Q4_K_M (7,4 GB) se puede servir un chat multi-turno en una GPU de 12-16 GB o incluso en CPU con llama.cpp, manteniendo el chat template embebido.
- Despliegue en estaciones de trabajo sin GPU dedicada de gran capacidad: la variante Q4_K_M permite inferencia en CPU con llama.cpp u Ollama, útil para prototipos y entornos de desarrollo.
- Servicio de preguntas y respuestas en coreano e inglés: el autor valida el comportamiento en ambos idiomas y publica métricas de fidelidad frente al BF16 en esos dos idiomas, lo que respalda su uso en aplicaciones bilingües de ese par.
- Integración rápida en Ollama o LM Studio: el comando `ollama run hf.co/axteam/gemma-4-12B-it-GGUF:Q4_K_M` permite tener un endpoint conversacional en minutos, adecuado para demos y pruebas de producto.
- Evaluación comparativa de cuantizaciones: las métricas de divergencia KL y acuerdo top-1 frente al BF16 permiten decidir entre Q4_K_M y Q8_0 según el presupuesto de memoria y la tolerancia a la pérdida de calidad.
- Generación de texto por lotes en pipelines de datos: la variante Q8_0 (12,7 GB) ofrece una fidelidad cercana al BF16 (KLD 0,2562 en inglés) y puede usarse para tareas de anotación o resumen donde la calidad prima sobre el coste de memoria.
- Base para re-cuantización o ajuste fino posterior: el archivo BF16 (23,8 GB) sirve como referencia sin cuantizar para generar nuevas variantes o comparar.

## Benchmarks y rendimiento

El autor no publica benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.). Sí publica métricas de fidelidad de la cuantización frente al archivo BF16, medidas con llama.cpp b12005 (commit e0f142d, build CUDA) sobre una NVIDIA B200 el 2026-11-02, con 16 ventanas de 2.048 tokens de WikiText-2 y de una muestra de Wikipedia en coreano:

| Archivo | KLD media vs BF16 (EN / KO) | Acuerdo top-1 con BF16 (EN / KO) |
|---|---|---|
| Q4_K_M | 1,5574 / 1,6742 | 53,6% / 51,4% |
| Q8_0 | 0,2562 / 0,3083 | 83,9% / 82,4% |

El autor advierte que la perplejidad sobre texto crudo no es significativa para un checkpoint `-it` (el propio BF16 obtiene 628 en WikiText-2 sin su chat template), por lo que la comparación se hace contra el BF16 sobre los mismos tokens. Se forzó el BOS (`--override-kv tokenizer.ggml.add_bos_token=bool:true`) porque el tokenizador GGUF de gemma-4 no lo añade.

## Requisitos de hardware

- VRAM estimada: Q4_K_M ~7,4 GB de pesos más la caché KV del contexto elegido; Q8_0 ~12,7 GB; BF16 ~23,8 GB. Con `--cache-type-k/v q8_0 -fa on` se reduce a la mitad la caché KV.
- GPU recomendadas: el autor valida en NVIDIA B200; por tamaño, Q4_K_M encaja en GPUs de 12-16 GB (RTX 4070 Ti Super, RTX 4080, RTX 4090), Q8_0 en 16-24 GB (RTX 4090, A5000, L4/A10 con margen ajustado) y BF16 en 24-40 GB (A100 40 GB, RTX 6000 Ada).
- GPU de consumo: sí, Q4_K_M cabe en GPUs consumer de 12 GB o más; Q8_0 requiere 16 GB o más.
- Despliegue: llama.cpp (≥ b9493, con `-fa on` desde b6325), Ollama (`ollama run hf.co/axteam/gemma-4-12B-it-GGUF:Q4_K_M`) y LM Studio (no probado por el autor).
- Latencia y throughput: no disponibles; el autor no publica medidas de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de tareas para este modelo ni para alternativas en la información proporcionada. A nivel de formato y tamaño, las alternativas naturales serían otras compilaciones GGUF de modelos densos de ~12B, pero no se aportan cifras comparativas verificables.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| gemma-4-12B-it-GGUF (este) | ~11,9B | no disponible | apache-2.0 / Gemma 4 license | GGUF |
| Alternativas de ~12B en GGUF | no disponible | no disponible | no disponible | GGUF |

## Limitaciones y advertencias

- Esta compilación no incluye el proyector de visión: aunque el modelo base es multimodal, aquí la entrada es solo texto.
- La cuantización Q4_K_M pierde fidelidad de forma notable frente al BF16 (KLD 1,56 en inglés, acuerdo top-1 del 53,6%); para tareas sensibles a la calidad conviene Q8_0 o BF16.
- La perplejidad sobre texto crudo no es una métrica válida para este checkpoint `-it`; las comparaciones deben hacerse con el chat template aplicado.
- No se dispone de información sobre sesgos, tasas de alucinación ni idiomas soportados oficialmente; las pruebas del autor se limitan a inglés y coreano.
- Licencia: el repositorio declara apache-2.0, pero los pesos, el tokenizador y el chat template pertenecen a Google DeepMind y se rigen por la Gemma 4 license (https://ai.google.dev/gemma/docs/gemma_4_license); conviene revisar sus términos para uso comercial.
- Requiere llama.cpp ≥ b9493; versiones anteriores no cargan correctamente la arquitectura `gemma4`.
- El autor no ha probado Ollama ni LM Studio, por lo que su funcionamiento en esas plataformas no está verificado.
- Muestreo recomendado por Google: `temperature=1.0`, `top_p=0.95`, `top_k=64`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/axteam/gemma-4-12B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
