# respinosamena/Thirty-30M-Instruct-GGUF

## Resumen

Thirty-30M-Instruct es un modelo de lenguaje de 30,1 millones de parámetros (30.119.281 exactos) desarrollado por el usuario respinosamena bajo el seudónimo de TurboSynthesis. Se trata de un modelo instructivo en inglés, con una longitud de contexto nativa de 8.192 tokens o más, diseñado como un experimento de "small language model" que busca demostrar que un modelo de escala muy reducida puede ejecutar tareas de razonamiento básico, matemáticas exactas, ejecución de código Python y tool calling cuando se combina con una arquitectura cuidadosamente optimizada.

La relevancia de esta ficha no reside en el modelo base, sino en la publicación que nos ocupa: `Thirty-30M-Instruct-GGUF`, un conjunto de cuantizaciones GGUF v3 (F16, Q8_0, Q4_K_M y Q4_0) acompañadas de un motor de inferencia propio en C++20 con intrinsics AVX-512 y fallback portable a OpenMP, además de un cargador PyTorch y una CLI en Python. El autor no depende de `llama.cpp` para la conversión, sino que distribuye su propio motor `thirty_gguf.cpp` porque la arquitectura `TurboSynthesis` no es compatible con el grafo estándar de Llama.

El interés técnico está en la matriz de benchmarks medida extremo a extremo sobre cuatro cuantizaciones, con métricas de divergencia KL respecto a BF16, acuerdo Top-1, y rendimiento en CPU AMD Zen 5. La cuantización Q8_0 (33,30 MB) retiene el 100 % del rendimiento de tareas de BF16 y alcanza 963,8 tok/s en decodificación con 16 hilos, lo que la convierte en la opción recomendada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TurboSynthesis (transformer con embeddings factorizados de rango 192 atados, Engram bigram hasheado, Smear bigram causal, mezcla de desplazamiento Canon-Lite de 4 taps, QK-Norm tras RoPE con log_scale_base=1024, MLP ReLU² de dimensión 4d) |
| Parametros totales | 30.119.281 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192+ tokens nativos |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M, Q4_0 (GGUF v3) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF v3 (acompañado de `thirty_gguf.cpp` y `model.py` para carga en PyTorch) |

## Arquitectura y entrenamiento

`TurboSynthesis` es una arquitectura de transformer causal con varias modificaciones orientadas a maximizar la capacidad por parámetro en un presupuesto de 30 M. Destacan: embeddings de entrada y salida atados con factorización de rango 192 (matriz `wte` compacta), un módulo `Engram` que incorpora información de bigramas mediante hashing, un `Smear` bigram causal, mezcla de desplazamiento Canon-Lite de 4 taps sobre las representaciones, QK-Norm aplicada después de RoPE con `log_scale_base=1024`, y una MLP con activación ReLU² y dimensión 4d. El modelo usa 2 cabezas KV con GQA.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; la model card solo indica que es un modelo instructivo (`-Instruct`). La innovación técnica más destacable del repositorio GGUF no es el modelo en sí, sino el motor de inferencia C++20 autocontenido: compila con `-march=native` para usar AVX-512 + F16C, y cae a C++20 estándar con OpenMP en cualquier x86_64 o ARM64. El autor reporta que la versión F16 reproduce los logits de PyTorch BF16 con KL = 0,02 mnats, 99,98 % de acuerdo Top-1 y una diferencia máxima de logit de 0,000011 frente a PyTorch F32 en C++.

## Capacidades

- Generación de texto en inglés con modo instructivo y modo "thinking" opcional (`--think` en la CLI).
- Razonamiento aritmético básico: la suite `ExactMath-12` mide respuestas exactas, con 25,0 % de acierto en BF16 y Q8_0.
- Ejecución de código Python: la suite `PyExec-20` evalúa ejecución real, con 25,0 % en BF16 y Q8_0.
- Tool calling / function calling: suite `ToolCall-10` con 80,0 % de acierto en BF16 y Q8_0.
- Recuperación de información en contexto largo: `Passkey-18` con 94,4 % global y 66,7 % a 8.192 tokens en BF16 y Q8_0.
- Preguntas de opción múltiple: suite `MC-60` con 78,3 % en BF16 y Q8_0.
- LongQA: 80,0 % en BF16 y Q8_0.
- Capacidades multilingües: limitadas al inglés según la model card.
- Sin soporte declarado de visión, audio ni otras modalidades.

## Casos de uso

- Evaluación de cuantizaciones en modelos de escala extrema: el repositorio incluye la matriz completa de calidad (KL, Top-1, ExactMath, PyExec, ToolCall, Passkey, LongQA, MC, BPB) para F16, Q8_0, Q4_K_M y Q4_0, lo que permite estudiar empíricamente cómo degrada cada esquema de cuantización en un modelo de 30 M. Es un caso de uso docente e investigador.
- Despliegue en entornos con restricciones severas de memoria: Q4_0 ocupa 18,29 MB y Q8_0 33,30 MB, por lo que el modelo cabe en dispositivos embebidos, contenedores mínimos o funciones serverless con límites de RAM muy bajos.
- Procesamiento de texto a alta velocidad en CPU: con 963,8 tok/s en decodificación (16 hilos, Zen 5) y 6.056 tok/s en prefill, es viable para tareas de etiquetado, clasificación o generación masiva de texto corto donde el coste por token importa más que la calidad absoluta.
- Tool calling en pipelines ligeros: el 80 % de acierto en `ToolCall-10` con Q8_0 permite integrarlo como planificador de llamadas a funciones en agentes muy simples, siempre que las herramientas sean de baja ambigüedad.
- Recuperación pasiva en contexto largo: el 94,4 % en `Passkey-18` y el 66,7 % a 8.192 tokens lo hacen apto para tareas de extracción de claves o marcadores en documentos largos cuando no se requiere razonamiento complejo.
- Base para experimentación con arquitecturas no estándar: al incluir `model.py` (cargador PyTorch), `thirty_gguf.cpp` (motor C++) y `chat_thirty.py` (CLI), sirve como plantilla para probar modificaciones de `TurboSynthesis` sin depender de `llama.cpp`.
- Generación de código Python de un solo paso: el 25 % en `PyExec-20` es suficiente para autocompletar fragmentos triviales o generar plantillas, no para código de producción sin supervisión.

## Benchmarks y rendimiento

Métricas medidas por el autor sobre la suite `eval_thirty_sft`. La columna `val_sft` es una pérdida de validación (menor es mejor); `KL` es divergencia respecto a BF16 en mnats; `Top-1` es acuerdo de token con BF16. La velocidad se mide en CPU AMD Zen 5 con 16 hilos.

| Cuantización | Tamaño (MB) | Bits/peso | val_sft ↓ | KL (mnats) ↓ | Top-1 ↑ | EOS % ↑ | Exact-12 ↑ | ToolCall-10 ↑ | Passkey-18 (8k) ↑ | LongQA-10 ↑ | Decode (tok/s) | Prefill pp512 (tok/s) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| BF16 (referencia) | 60,25 | 16,00 | 1,4649 | 0,00 | 100,00 % | 93,8 % | 25,0 % | 80,0 % | 94,4 % (66,7 %) | 80,0 % | 229,4 (GPU) | 81.067,5 (GPU) |
| F16 | 61,45 | 16,01 | 1,4649 | 0,02 | 99,98 % | 93,8 % | 25,0 % | 80,0 % | 94,4 % (66,7 %) | 80,0 % | 731,0 | 7.245,6 |
| Q8_0 (recomendada) | 33,30 | 8,53 | 1,4660 | 2,58 | 97,41 % | 81,2 % | 25,0 % | 80,0 % | 94,4 % (66,7 %) | 80,0 % | 963,8 | 6.056,4 |
| Q4_K_M | 23,62 | 5,96 | 1,5998 | 176,75 | 78,38 % | 75,0 % | 8,3 % | 40,0 % | 83,3 % (33,3 %) | 70,0 % | 962,3 | 5.844,2 |
| Q4_0 | 18,29 | 4,54 | 1,8297 | 502,12 | 66,71 % | 56,2 % | 0,0 % | 30,0 % | 50,0 % (0,0 %) | 80,0 % | 963,6 | 6.284,5 |

Observaciones del autor: Q8_0 retiene el 100 % del rendimiento de tareas de BF16 y es 7,9× más rápida que PyTorch CPU FP32 (121,5 tok/s) y 4,2× más rápida que PyTorch GPU BF16 (229,4 tok/s). Q4_K_M reduce la KL 2,8× respecto a Q4_0 (de 502,12 a 176,75 mnats) al proteger `wte.weight`, `engram_wte.weight`, `engram_proj.weight`, `.c_k.weight` y `.c_v.weight` en Q8_0, y eleva `Passkey-18` del 50,0 % al 83,3 %. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en F16 ocupa 61,45 MB, por lo que cabe en cualquier GPU con más de 100 MB libres. En Q4_0 son 18,29 MB. No se requiere GPU en absoluto: el motor C++ está pensado para CPU.
- GPU recomendadas: no se especifican en la información disponible. Cualquier GPU consumer (RTX 3060, RTX 4090, etc.) puede alojar el modelo con holgura; el autor solo reporta cifras GPU para BF16 (229,4 tok/s decode, 81.067,5 tok/s prefill).
- Cabe en consumer GPU: sí, en todas las GPU modernas y en la mayoría de iGPU y SoC.
- Despliegue: motor nativo `thirty_gguf.cpp` (C++20, AVX-512 + F16C con `-march=native`, fallback portable a OpenMP en x86_64 y ARM64), CLI Python `chat_thirty.py` (con backend C++ o PyTorch puro), y cargador PyTorch `model.py`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 963,8 tok/s en decodificación con 16 hilos en Zen 5 para Q8_0 (1,04 ms/token), 797,1 tok/s a 4 hilos; prefill de 6.056,4 tok/s para `pp512`. En F16: 731,0 tok/s a 16 hilos, 588,4 a 4 hilos, prefill 7.245,6 tok/s.
- Compilación: `g++ -O3 -march=native -fopenmp -funroll-loops -std=c++20 thirty_gguf.cpp -o thirty-gguf`.

## Comparativa con modelos similares

No se dispone de comparaciones con otros modelos en la información proporcionada. A modo de referencia estructural, los modelos de la misma categoría (menos de 100 M de parámetros, orientados a instrucciones y ejecución en CPU) incluyen variantes de TinyLlama, SmolLM o Qwen2.5-0.5B, pero no se han publicado en esta ficha mediciones comparativas del autor frente a ellos, por lo que no se incluyen cifras.

| Modelo | Parámetros | Contexto | Licencia | Formato | Comparativa directa |
|---|---:|---|---|---|---|
| Thirty-30M-Instruct-GGUF | 30,1 M | 8.192+ | Apache 2.0 | GGUF v3 + motor C++ | — |
| Alternativas de <100 M | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo base tiene solo 30 M de parámetros: la calidad en razonamiento, matemáticas y código es muy limitada (25 % en `ExactMath-12` y `PyExec-20` con la mejor cuantización). No es apto para tareas de producción que requieran precisión.
- El rendimiento cae drásticamente en cuantizaciones agresivas: Q4_0 baja a 0 % en `ExactMath-12` y `PyExec-20`, y a 0 % en `Passkey-18` a 8k. El autor recomienda Q8_0; Q4_0 solo debe usarse cuando el tamaño sea el criterio absoluto.
- El modelo solo soporta inglés según la model card; no se declaran capacidades multilingües.
- Riesgo de alucinación elevado por la escala del modelo; no se han publicado evaluaciones de sesgo ni de robustez frente a entradas adversarias.
- La arquitectura `TurboSynthesis` no es compatible con `llama.cpp` estándar: requiere el motor `thirty_gguf.cpp` o el cargador `model.py` incluidos en el repositorio. Esto limita la portabilidad a otros ecosistemas de inferencia.
- El rendimiento reportado se midió en un AMD Zen 5 con AVX-512; en CPUs sin AVX-512 el motor cae al camino portable y el throughput será previsiblemente menor, aunque no se publican cifras para ese caso.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en dominios sensibles.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 24 de noviembre de 2026; no hay evidencia de uso en producción por terceros.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/respinosamena/Thirty-30M-Instruct-GGUF
- Modelo base: https://huggingface.co/respinosamena/Thirty-30M-Instruct
- Motor de inferencia C++: `thirty_gguf.cpp` (incluido en el repositorio)
- Cargador PyTorch: `model.py` (incluido en el repositorio)
- CLI Python: `chat_thirty.py` (incluido en el repositorio)
- Sumas de verificación: `SHA256SUMS.txt` (incluido en el repositorio)
- Resultados de evaluación: `quant_eval_summary.json` (incluido en el repositorio)
- Paper, blog o demo adicionales: no disponible
