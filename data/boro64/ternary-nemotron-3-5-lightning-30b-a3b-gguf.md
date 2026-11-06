# boro64/Ternary-Nemotron-3.5-Lightning-30B-A3B-GGUF

## Resumen

Ternary Nemotron 3.5 Lightning 30B-A3B (GGUF) es una reempaquetación a formato GGUF del modelo ternario (1.58-bit) que Nota AI obtuvo al ternarizar el Nemotron 3.5 Lightning 30B-A3B de NVIDIA. El modelo original de NVIDIA es un MoE híbrido Mamba-2 de 31.580 millones de parámetros totales con unos 3.000 millones activos, y Nota AI lo comprimió a pesos ternarios ({−s, 0, +s}) publicándolo inicialmente solo en formato MLX para Apple Silicon. El usuario boro64 convirtió esos pesos a GGUF Q2_0 sin pérdida numérica (reempaquetado bit a bit), haciéndolo ejecutable en llama.cpp y en el fork PrismML/Bonsai en Linux, Windows y GPUs NVIDIA.

Su relevancia radica en la eficiencia extrema: el archivo GGUF ocupa 8,82 GB y permite ejecutar un modelo de 30B con contexto de 262.144 tokens nativos (verificado hasta ~341K) en una GPU de consumo de 12 GB, con velocidades de decodificación de 166–172 tok/s y prefill de hasta ~7.200 tok/s sobre una RTX 4070 Ti. Es un punto de control de recuperación intermedio (~89 % de la calidad del modelo BF16 original): excelente en lectura, recuperación, resumen y comprensión de contexto largo, pero no un modelo de programación de primera línea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `nemotron_h_moe`: híbrido Mamba-2 + MoE, 52 bloques (128 expertos enrutados, top-6 + experto compartido, 6 capas de atención) |
| Parametros totales | 31.577.940.288 (~31,6 B) |
| Parametros activos | ~3 B (A3B, según denominación del modelo base) |
| Longitud de contexto | 262.144 nativos; verificado hasta 341K (extrapolación); utilizable hasta ~400K |
| Tipos de cuantizacion | Lineares en Q2_0 (ternario, 2,25 bpw); embeddings y lm_head en Q8_0; normas, conv1d, A_log/D/dt_bias y router en F32; caché KV recomendada en q8_0 |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 (licencia "other" en Hugging Face) |
| Formato de pesos | GGUF (archivo único de 8,82 GB); origen: MLX 2-bit affine de Nota AI, base BF16 de NVIDIA |

## Arquitectura y entrenamiento

La arquitectura base es `nemotron_h_moe`, un híbrido de 52 bloques que combina capas Mamba-2 (modelos de espacio de estados) con capas de atención estándar (solo 6) y un bloque MoE con 128 expertos enrutados más un experto compartido, activando top-6 expertos por token. Esta combinación Mamba + MoE explica el contexto largo eficiente y el bajo coste de inferencia (solo ~3 B de parámetros activos por token).

En cuanto al entrenamiento, el modelo base NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 fue entrenado por NVIDIA (datos de entrenamiento no disponibles en la ficha). Nota AI aplicó un proceso de ternarización a 1.58 bits, donde cada peso lineal se almacena como matriz ternaria {−s, 0, +s} por grupos de 64 entradas. Este repositorio no modifica los pesos: reempaqueta el contenedor MLX 2-bit affine al formato GGUF Q2_0 (bloque de 64, delta fp16, códigos {0,1,2} → {−d, 0, +d}), que es bit-compatible. La conversión fue verificada como bit-idéntica en los 164 tensores cuantizados. No hay información sobre RLHF/DPO en la documentación disponible.

## Capacidades

- Generacion de texto conversacional (pipeline etiquetado como conversational)
- Comprension y recuperacion de contexto largo: 3/3 en pruebas de needle hasta 341K tokens
- Resumen y lectura de documentos extensos (fortalezas declaradas del checkpoint)
- Razonamiento con modo de "thinking": es un modelo de razonamiento que puede gastar miles de tokens pensando; admite `reasoning_effort: low` para respuestas cortas
- Generacion de codigo con limitaciones: produce algoritmos correctos (pila monótona, caché LFU con buckets de frecuencia) pero con bugs sutiles de implementacion
- No hay informacion sobre tool calling, function calling, agentes, capacidades de vision o audio en la documentacion disponible

## Casos de uso

- Analisis de documentos muy extensos: con 262K tokens nativos verificados hasta 341K, puede ingerir libros completos, expedientes legales o bases de codigo grandes en una sola pasada en hardware de consumo.
- Recuperacion de informacion (needle-in-haystack) en producción local: mantiene 3/3 de acierto a 10/50/90 % de profundidad hasta 341K tokens, ideal para RAG de corpus masivos sin dividir documentos.
- Resumen de corpus largos: el prefill de ~4.600–7.200 tok/s permite procesar cientos de miles de tokens en menos de un minuto en una RTX 4070 Ti.
- Chatbots locales privados: el archivo GGUF único de 8,82 GB y la API de llama-server (compatible OpenAI vía /v1/chat/completions) facilitan despliegues autoalojados sin nube.
- Inferencia en portátiles y estaciones de trabajo con GPU de 12 GB: es uno de los pocos modelos de 30B con contexto de cientos de miles de tokens que cabe íntegramente en VRAM de gama media.
- Generacion de codigo asistida de bajo coste: útil para razonar sobre algoritmos y arquitecturas, aunque requiere revision humana por los bugs sutiles documentados.
- Investigacion sobre cuantizacion ternaria: al ser un reempaquetado bit-exacto, sirve como base reproducible para experimentos con modelos 1.58-bit en llama.cpp.

## Benchmarks y rendimiento

Resultados publicados por el autor (RTX 4070 Ti 12 GB, todos los pesos en GPU, KV q8_0, flash-attention activada):

### Recuperacion de needle en contexto largo (3 hechos a 10/50/90 % de profundidad, una pasada)

| Corpus (tokens) | Puntuacion | Notas |
|---|---|---|
| 125K | 3/3 | |
| 259K | 3/3 | ventana entrenada |
| 341K | 3/3 | extrapolacion nativa ~1,3× la ventana entrenada |
| 410K | 2/3 | falla primero la profundidad al 90 % |
| 492K | 0/3 | falla con q4-KV, q8-KV, nativo y YaRN ×2 |

### Rendimiento de inferencia

| Contexto | Prefill | Decode |
|---|---|---|
| ≤262K (-ub 2048) | ~4.600 tok/s | 166–172 tok/s |
| 262–368K (-ub 512) | ~7.200 tok/s | ~172 tok/s |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible; el autor cifra la calidad en ~89 % de recuperacion respecto al modelo BF16 y documenta deficits en codigo (bugs sutiles de implementacion pese a algoritmos correctos).

## Requisitos de hardware

- VRAM para pesos: ~9,5 GB; el modelo completo en GPU con contexto ≤368K cabe en una tarjeta de 12 GB (presupuesto total: pesos + KV + buffers < ~11,7 GB)
- GPU validada: RTX 4070 Ti 12 GB; cualquier GPU NVIDIA de 12 GB o mas deberia ser adecuada
- Consumer GPUs: sí, cabe íntegramente en una RTX 4070 Ti / 4070 Super / 3080 de 12 GB; con `-ngl 43 -ub 512` puede repartirse carga si falta margen
- Advertencia Windows/WDDM: si se excede la VRAM dedicada, Windows mueve ~1 GB a memoria compartida y el throughput cae ~20× (4.600 → 200 tok/s)
- Despliegue: llama.cpp estandar (validado en b11555+ y b11796) y fork PrismML/Bonsai (validado en b10793); comando de ejemplo: `llama-server -m modelo.gguf -c 262144 -np 1 -ngl 99 -fa on -ub 2048 --cache-type-k q8_0 --cache-type-v q8_0`
- No hay informacion sobre vLLM, TGI u Ollama; dado que la arquitectura es `nemotron_h_moe`, la compatibilidad depende del soporte de llama.cpp
- No usar `--kv-vram-cells` en el fork PrismML: corrompe silenciosamente la recuperacion de atención para esta arquitectura

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ternary Nemotron 3.5 Lightning 30B-A3B (GGUF, este modelo) | 31,6 B | ~3 B | 262K nativos (~341K verificado) | Q2_0 ternario (2,25 bpw) + Q8_0 | openmdw-1.1 | GGUF publico en Hugging Face |
| NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 | 31,6 B | ~3 B | no disponible | BF16 | no disponible | Publico en Hugging Face (NVIDIA) |
| Nemotron-3.5-Lightning-30B-A3B-Nota-Ternary-MLX-1014 | 31,6 B | ~3 B | no disponible | Ternario 1.58-bit en MLX 2-bit | no disponible | Publico en Hugging Face (Nota AI), solo Apple Silicon |

El valor diferencial de este repositorio es la portabilidad: mismos pesos ternarios que la version de Nota AI pero en GGUF, ejecutable en hardware NVIDIA/Windows/Linux, con documentacion de rendimiento y limites de contexto muy detallada.

## Limitaciones y advertencias

- Calidad reducida respecto al modelo base: checkpoint intermedio de recuperacion (~89 % del profesor BF16), no un modelo frontera.
- Deficit documentado en codigo: genera algoritmos correctos pero con bugs sutiles de implementacion (off-by-one, desempates de eviction incorrectos); el deficit es arquitectural, no ruido de cuantizacion (verificado mediante injerto de embeddings).
- Contexto: 262K garantizados; entre 341K y 400K la calidad degrada (2/3 a 410K) y a 492K falla completamente, incluso con YaRN ×2.
- Es un modelo de razonamiento que puede gastar miles de tokens "pensando"; conviene usar `reasoning_effort: low` o `/completion` para respuestas cortas.
- Riesgo de degradacion silenciosa en Windows si se excede la VRAM (demotion WDDM, ~20× mas lento).
- Incompatibilidad con `--kv-vram-cells` (corrupcion silenciosa de la recuperacion de atención).
- Idiomas soportados: no disponible en la ficha; no hay garantia explicita de rendimiento en castellano.
- Licencia openmdw-1.1 ("other" en Hugging Face): revisar los terminos en https://openmdw.ai/license/1-1/ antes de uso comercial.
- Sesgos y alucinaciones especificos del modelo: no disponibles; aplicar las cautelas habituales de los LLM.
- La herramienta de conversion usada por el autor no se distribuye (aunque el metodo esta documentado para reproducirlo).

## Enlaces

- Repositorio del modelo (GGUF): https://huggingface.co/boro64/Ternary-Nemotron-3.5-Lightning-30B-A3B-GGUF
- Modelo base NVIDIA (BF16): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Checkpoint ternario de Nota AI (MLX): https://huggingface.co/nota-ai/Nemotron-3.5-Lightning-30B-A3B-Nota-Ternary-MLX-1014
- Perfil de Nota AI: https://huggingface.co/nota-ai
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
