# Pier-Jean/Qwen3-8B-LLVQ-Tetra-sealed

## Resumen
Qwen3-8B-LLVQ-Tetra-sealed es una cuantización extrema del modelo Qwen3-8B de Alibaba Qwen, publicada por Pier-Jean (pjmalandrino) bajo el framework LLVQ. El modelo comprime los pesos de Qwen3-8B a 2,70 bits por parámetro en un único fichero de 2,82 GB que incluye embedding y cabeza de salida, usando retículos de Leech (Λ₂₄) con codificación Tetra: 48 bits por bloque de 24 pesos y una escala por fila. Frente a FP16 (16,38 GB) o AWQ w4g128 (6,10 GB), reduce el espacio en GPU a 2,76 GB.

El modelo no es un checkpoint estándar de `transformers`: solo lo lee el motor Rust de LLVQ, que incorpora un kernel CUDA fusionado que decodifica y multiplica en una sola pasada. Su relevancia radica en demostrar que una cuantización de 2,70 bits con correcciones GPTQ y reentrenamiento de escalas por fila mantiene una calidad utilizable (MMLU 69,58 frente a 75,05 en FP16) con velocidades de decodificación competitivas en GPU de datacenter (95,0 tok/s en L40S).

La ficha documenta un artefacto experimental de investigación (0 descargas, 0 likes en el momento de redacción) orientado a validar la metodología Tetra descrita en el paper arXiv:2609.35465, no a producción generalista. Hereda la licencia Apache 2.0 de Qwen3-8B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B) con pesos cuantizados en retículo de Leech Λ₂₄ (Tetra) e int4 |
| Parametros totales | 8 mil millones (modelo base Qwen3-8B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card (heredada de Qwen3-8B, no especificada) |
| Tipos de cuantizacion | 2,70 bits por parámetro en promedio; Tetra (48 bits por bloque de 24 pesos) en 199 de 252 proyecciones; int4 g128 en `v_proj` y `down_proj` (capas 10-26); int4 g64 en embedding y cabeza de salida; f16 en normas |
| Idiomas soportados | en (según metadatos del repo) |
| Licencia | apache-2.0 (heredada de Qwen/Qwen3-8B) |
| Formato de pesos | binario propietario `.bin` (qwen3-8b-sealed-B.bin), legible solo por el motor Rust LLVQ; no safetensors, no GGUF |

## Arquitectura y entrenamiento
La arquitectura subyacente es el transformer denso de Qwen3-8B, sin cambios estructurales. La modificación afecta exclusivamente a los pesos: 199 de las 252 proyecciones lineales se almacenan como códigos Tetra sobre el retículo de Leech Λ₂₄ (48 bits por bloque de 24 pesos, con una escala por fila y una cola pequeña sin cuantizar); las `v_proj` de todas las capas y las `down_proj` de las capas 10 a 26 usan int4 con grupos de 128; embedding y cabeza de salida usan int4 con grupos de 64; las normas permanecen en f16.

El proceso de cuantización aplica correcciones de estilo GPTQ sobre 131.072 tokens de DCLM-Edu para ajustar los códigos. Posteriormente se reentrenan las escalas de cada fila contra el modelo FP16 con los códigos congelados; solo se entrenan las escalas, nunca los códigos. La progresión de MMLU documentada es 64,87 (códigos Tetra + int4 en `v_proj`), 68,16 (tras reentrenar escalas de fila) y 69,58 (tras añadir int4 en `down_proj` 10-26 y embedding/cabeza a 4 bits). Se construyeron dos variantes de 8B a ~2,7 bits; la variante B (int4 solo en `down_proj`) superó a la otra en 0,77 puntos de MMLU [0,26, 1,28] bajo una regla fijada antes de medir. La innovación técnica principal es el kernel CUDA fusionado que decodifica los códigos del retículo y multiplica en una sola pasada.

## Capacidades
- Generación de texto autoregresiva, heredada de Qwen3-8B, con calidad degradada por la cuantización (5,48 puntos de MMLU por debajo de FP16).
- Razonamiento matemático: GSM8K zero-shot de 88,63 (frente a 93,25 en FP16), medido a través del kernel fusionado.
- Conocimiento general y respuesta a preguntas de opción múltiple: MMLU 5-shot de 69,58 sobre 14.042 preguntas.
- Generación de código: no se han publicado resultados específicos (HumanEval, MBPP) en la información disponible.
- Tool calling / function calling: no disponible en la model card; no se documenta ni se descarta.
- Capacidades de agente y razonamiento multi-paso: no documentadas para esta cuantización.
- Multilingüismo: los metadatos declaran únicamente `en`; no se documenta soporte de otros idiomas en esta variante.
- Modo thinking: no documentado en la model card de esta cuantización.

## Casos de uso
- Validación de metodologías de cuantización extrema: el fichero es el artefacto que el paper 2 mide (SHA-256 publicado), por lo que sirve para reproducir los resultados de Tetra a 2,70 bits en MMLU, GSM8K y perplejidad WikiText-2.
- Investigación sobre retículos de Leech aplicados a LLM: permite estudiar el impacto de la codificación Λ₂₄ con escalas por fila frente a esquemas int4/AWQ en un modelo de 8B ampliamente conocido.
- Despliegue en memoria muy restringida en GPU de datacenter: con 2,76 GB de pesos en GPU, cabe holgadamente en una L40S o A100 de 40 GB, dejando el resto del presupuesto de VRAM para KV cache y contexto.
- Benchmarking de kernels fusionados: el motor LLVQ con kernel CUDA permite comparar latencia de decodificación (95,0 tok/s en L40S a batch 1) frente a vLLM con FP16 (46,3 tok/s) y AWQ (123,2 tok/s).
- Estudio de sesgo de selección en calibración: útil para analizar cómo decisiones tomadas sobre preguntas de test de MMLU (qué matrices pasan a int4) afectan a las métricas reportadas.
- Experimentación en Apple silicon con reconstrucción densa: el camino Metal solo ejecuta la reconstrucción densa (el kernel fusionado se detiene en anchuras de 8.192 y `down_proj` mide 12.288), lo que permite comparar el rendimiento del camino denso f16 frente al cuantizado.
- Referencia para cuantizaciones hermanas: junto a Qwen3-4B y Qwen3-14B LLVQ-Tetra-sealed, permite estudiar el escalado del error de cuantización con el tamaño del modelo.

## Benchmarks y rendimiento

| Metrica | Este fichero (2,70 bpp) | FP16 | AWQ w4g128 (5,96 bpp) |
|---|---|---|---|
| Bits por parámetro (modelo completo) | 2,70 | 16,00 | 5,96 |
| Bytes de pesos en GPU | 2,76 GB | 16,38 GB | 6,10 GB |
| Decodificación, batch 1, NVIDIA L40S | 95,0 tok/s (motor LLVQ) | 46,3 (vLLM) | 123,2 (vLLM) |
| MMLU, 5-shot, 14.042 preguntas | 69,58 | 75,05 | 73,79 |
| GSM8K, zero-shot, 1.319 problemas | 88,63 | 93,25 | 92,95 |
| Perplejidad WikiText-2 | 9,71 | 8,99 | 9,42 |

Con intervalos del 95 %, este fichero queda 5,48 puntos de MMLU [4,83, 6,10] y 4,62 de GSM8K [3,00, 6,25] por debajo de FP16, y 4,21 [3,54, 4,86] y 4,32 [2,83, 5,81] por debajo de AWQ. Cada formato se ejecuta en su propio motor, por lo que las velocidades no son directamente divisibles entre sí. GSM8K se ejecuta con el kernel fusionado; MMLU y perplejidad sobre los mismos pesos decodificados a f16. En una A100, este fichero decodifica 57,9 tok/s, por debajo de FP16 en vLLM (91,8 tok/s).

## Requisitos de hardware
- VRAM estimada: 2,76 GB de pesos en GPU (2,82 GB de fichero), más KV cache y overhead del motor; el embedding en f16 ralentiza el camino denso.
- GPU recomendadas: NVIDIA L40S (medida principal, 95,0 tok/s a batch 1); NVIDIA A100 (57,9 tok/s, por debajo de FP16 en vLLM); se requiere CUDA para el kernel fusionado.
- GPU de consumo: no se probó ninguna GPU de consumo según la model card.
- Apple silicon: solo funciona la reconstrucción densa; el camino fusionado Metal se detiene en anchuras de entrada de 8.192 y `down_proj` mide 12.288.
- Opciones de despliegue: exclusivamente el motor Rust de LLVQ (github.com/pjmalandrino/llvq) con la feature `cuda`; no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 95,0 tok/s en L40S y 57,9 tok/s en A100, ambos a batch 1 y contexto corto; no se han medido múltiples peticiones concurrentes ni prompts largos.

## Comparativa con modelos similares

| Modelo | Parametros | Bits/param | Contexto | MMLU | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Qwen3-8B-LLVQ-Tetra-sealed | 8B | 2,70 | no disponible | 69,58 | 88,63 | Apache 2.0 | Solo motor LLVQ |
| Qwen3-8B FP16 | 8B | 16,00 | no disponible | 75,05 | 93,25 | Apache 2.0 | transformers, vLLM |
| Qwen3-8B AWQ w4g128 | 8B | 5,96 | no disponible | 73,79 | 92,95 | Apache 2.0 | vLLM |
| Qwen3-4B-LLVQ-Tetra-sealed | 4B | ~2,7 (no confirmado) | no disponible | no disponible | no disponible | Apache 2.0 | Solo motor LLVQ |
| Qwen3-14B-LLVQ-Tetra-sealed | 14B | ~2,7 (no confirmado) | no disponible | no disponible | no disponible | Apache 2.0 | Solo motor LLVQ |

## Limitaciones y advertencias
- Dependencia de un único lector: solo el código Rust del repositorio LLVQ lee y escribe este fichero; no hay soporte en `transformers`, vLLM, llama.cpp ni otras herramientas estándar.
- Rendimiento en A100 inferior a FP16 en vLLM (57,9 frente a 91,8 tok/s), y con embedding en f16 más lento que el propio camino denso f16 del motor.
- Solo se han medido batch 1 y contexto corto; no hay datos sobre concurrencia ni prompts largos.
- Sesgo de selección no medido: qué matrices pasan a int4 se decidió sobre preguntas de test de MMLU, por lo que la puntuación MMLU arrastra ese sesgo; GSM8K y perplejidad no participaron en ninguna decisión.
- Una sola muestra de calibración: las puntuaciones varían con el texto de calibración y los intervalos publicados no cubren toda esa dispersión.
- Degradación medible frente a FP16: 5,48 puntos de MMLU y 4,62 de GSM8K, con perplejidad WikiText-2 de 9,71 frente a 8,99.
- Riesgo de alucinación: no cuantificado en la model card; el modelo base Qwen3-8B puede alucinar y la cuantización agrava la pérdida de fidelidad.
- Idioma: los metadatos declaran solo `en`; no se documenta calidad en castellano ni en otros idiomas.
- Licencia Apache 2.0 heredada de Qwen3-8B, con el fichero LICENSE original sin modificar; el código de cuantización es MIT OR Apache-2.0.
- Sin probar en GPU de consumo; no hay garantía de funcionamiento fuera de L40S y A100.
- Artefacto experimental con 0 descargas y 0 likes en el momento de redacción; no orientado a producción generalista.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Pier-Jean/Qwen3-8B-LLVQ-Tetra-sealed
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio LLVQ (motor Rust y código de cuantización): https://github.com/pjmalandrino/llvq
- Paper 2, Tetra: Serving Leech-Lattice Quantized LLMs at 2.7 Bits per Parameter: https://huggingface.co/papers/2609.35465
- Paper 1, layout anterior (DOI): https://doi.org/10.5281/zenodo.22133606
- Método de referencia (van der Ouderaa et al.): https://arxiv.org/abs/2603.11021
- Hermano Qwen3-4B-LLVQ-Tetra-sealed: https://huggingface.co/Pier-Jean/Qwen3-4B-LLVQ-Tetra-sealed
- Hermano Qwen3-14B-LLVQ-Tetra-sealed: https://huggingface.co/Pier-Jean/Qwen3-14B-LLVQ-Tetra-sealed
