# phamvanthinhgin2004/genesis-v8-bica

## Resumen

Genesis-v8 Native BICA es una arquitectura neuronal experimental de tipo "brain-isomorphic" desarrollada por Van Thinh Pham (usuario `phamvanthinhgin2004`), orientada a inferencia de alta velocidad en CPU mediante un diseño ultra-disperso de 1,58 bits. El modelo declara 457,07 M de parámetros totales con solo 14,5 M activos por token (3,17 % de densidad), lo que se traduce en unos 8,4 MB de tráfico de DRAM activa por token y permite decodificación autoregresiva en procesadores de consumo sin GPU.

La arquitectura combina varias técnicas poco habituales: capas DeltaNet con atención lineal por chunks, profundidad recurrente compartida al estilo Huginn, un MoE ternario BitNet b1.58 con 16 expertos y Top-2, memoria PEER de producto-clave y un runtime propio en Rust puro con AVX2 y FMA. El autor la presenta como una alternativa de bajo coste computacional para despliegue en CPU, con un consumo de disco de 408,7 MiB y 424,7 MiB de RSS.

Es relevante ahora porque propone un enfoque de eficiencia extrema en inferencia (sin asignaciones dinámicas de heap por token, sin GPU) y porque incluye subsistemas cognitivos offline (memoria episódica, recuperación RAG con PPR, inferencia activa y consolidación tipo wake-sleep). No obstante, en el momento de redactar esta ficha los pesos neuronales no están publicados: el autor indica que se subirán tras completar un entrenamiento en NVIDIA B200. Las cifras de benchmarks deben interpretarse con cautela, ya que parte de ellas corresponden al runtime y a los subsistemas, y otras al "Project Genesis Two-Hemisphere CPU Engine", que combina el núcleo neuronal con un hemisferio de verificación no neuronal determinista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: Multi-Head Gated DeltaNet (6 capas) + Huginn Shared-KV Recurrent Depth (2 capas) + BitNet b1.58 Ternary Top-2 MoE (16 expertos) + DeepSeek Engram + PEER producto-clave |
| Parametros totales | 457,07 M |
| Parametros activos | 14,5 M (3,17 % de densidad) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos ternarios de 1,58 bits (BitNet b1.58); runtime de 2 bits por bloque de 32; PEER en Q8; estado recurrente en fp32 |
| Idiomas soportados | en, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | `.gv8` (runtime propio en Rust) y `.pt` (checkpoints pendientes de publicación) |

## Arquitectura y entrenamiento

El modelo se organiza en torno a tres bloques principales. Primero, seis capas de Multi-Head Gated DeltaNet con inversión chunkwise Householder WY (C=64) y una inversión Neumann/nilpotente paralela de 6 pasos en fp32, con un estado recurrente fijo de 576 KB y un error máximo declarado de 5,99e-4 frente al cálculo exacto. Segundo, dos capas de profundidad recurrente compartida al estilo Huginn (R en {1,2,3,4}, W=1.024), que permiten cómputo adaptativo en tiempo de test sin duplicar pesos. Tercero, un MoE ternario BitNet b1.58 con 16 expertos y enrutamiento Top-2, complementado con DeepSeek Engram de coste O(1) y dos memorias PEER de producto-clave de 262.144 entradas cada una (524.288 expertos de una sola neurona consultados en O(sqrt(N))), con una fidelidad declarada del 99,80 % en el logit Top-1 frente a fp32.

El entrenamiento se describe como un plan en fases: Phase 1A+1B con aproximadamente 14,5 mil millones de tokens bilingües inglés/vietnamita más STEM y código, seguido de ajuste de profundidad Huginn, SFT de RAG balanceado, CoT con `<THINK>` y una fase final de GRPO/RLVR. El autor indica que se trata de una ejecución autofinanciada en NVIDIA B200 con un presupuesto inferior a 40 dólares. No se detalla la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO más allá de la fase de GRPO/RLVR mencionada.

Como innovaciones destacables, el runtime en Rust puro (sin crates externos) implementa matvec BitNet de 2 bits por bloque de 32 con AVX2 y FMA, con error relativo declarado de 0,0, cero asignaciones dinámicas de heap por token decodificado y razonamiento en árbol paralelo de cuatro ramas. Además, se incluyen cuatro subsistemas cognitivos offline: memoria episódica CA3 con CountSketch y blanqueo L2, recuperación HippoRAG-2 con PPR bipartito sobre grafo CSR, inferencia activa EFE con abstención fundamentada en evidencia, y consolidación wake-sleep SMFT con rollback automático de envenenamiento.

## Capacidades

- Generación de texto autoregresiva bilingüe (inglés y vietnamita).
- Razonamiento multi-paso con profundidad recurrente adaptativa (R de 1 a 4).
- Aritmética exacta declarada (10/10 en el conjunto de evaluación del autor).
- Abstención fuera de distribución (14/15 en el conjunto OOD del autor).
- Memoria episódica de un solo disparo y revisión de creencias entre sesiones (10/10 en el conjunto cross-session del autor).
- Recuperación RAG con HippoRAG-2 y PPR bipartito sobre grafos CSR.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible explícitamente; el autor menciona razonamiento en árbol de cuatro ramas y subsistemas de inferencia activa.
- Capacidades multilingües limitadas a inglés y vietnamita.
- Capacidades especiales: modo de razonamiento `<THINK>` (CoT), memoria PEER, consolidación wake-sleep y abstención fundamentada.

## Casos de uso

- Inferencia en CPU de bajo consumo: el modelo está diseñado para decodificar a 565 tok/s (R=1) en un Intel Core i5-10210U de 15 W, lo que lo hace adecuado para despliegues en portátiles, mini-PC o dispositivos edge sin GPU dedicada.
- Asistentes conversacionales bilingües inglés/vietnamita: el entrenamiento declarado en ambos idiomas permite atender usuarios de esas comunidades con un footprint de disco de 408,7 MiB.
- Recuperación aumentada sobre corpus grandes: el subsistema HippoRAG-2 con PPR bipartito sobre 265.500 documentos (40,3 MiB) y una mejora declarada de +61,7 pp en Recall@3 frente a BM25 en consultas de 2 saltos no vistas lo hace útil para búsqueda semántica multi-hop.
- Memoria persistente entre sesiones: el subsistema CA3 de memoria episódica rápida con revisión de creencias en 0,37 ms permite mantener contexto de usuario a largo plazo sin reentrenamiento.
- Abstención y control de alucinaciones: el módulo de inferencia activa EFE con F1=0,9615 y 0,080 ms puede integrarse en pipelines que requieran rechazar consultas fuera de dominio o sin evidencia suficiente.
- Consolidación de conocimiento y defensa ante envenenamiento: el subsistema wake-sleep SMFT con rollback automático (0/200 fugas frente a 200/200 de TF-IDF) es aplicable a bases de conocimiento que reciben actualizaciones continuas.
- Razonamiento en árbol para tareas de verificación: el runtime soporta razonamiento paralelo de cuatro ramas, útil en pipelines de validación lógica o matemática donde se comparan múltiples hipótesis.
- Despliegue en entornos con restricciones de memoria: con 424,7 MiB de RSS y cero asignaciones dinámicas por token, encaja en contenedores con límites estrictos de memoria.

## Benchmarks y rendimiento

Los datos publicados por el autor comparan Genesis-v8 BICA con modelos densos cuantizados a Q4_K_M en el mismo Intel Core i5-10210U de 15 W, sin GPU:

| Modelo (huella en disco) | Decodificación CPU (tg64) | vs. Genesis | Aritmética exacta (10) | Abstención OOD (15) | Cross-session 1-shot (10) |
|---|---:|---:|---:|---:|---:|
| Genesis-v8 BICA (408,7 MiB) | 565,4 tok/s (R=1) / 2.156,5 (4B) | 1,0x | 10/10 (8,2 ms) | 14/15 | 10/10 (56,9 ms) |
| Qwen2.5-0.5B-Instruct (Q4_K_M, 469 MiB) | 46,4 tok/s | 12,2x más lento | 0/10 | 5/15 | 0/10 |
| Llama-3.2-1B-Instruct (Q4_K_M, 770 MiB) | 23,2 tok/s | 24,3x más lento | 2/10 | 14/15 | 0/10 |
| Qwen2.5-1.5B-Instruct (Q4_K_M, 1,07 GiB) | 17,7 tok/s | 31,9x más lento | 1/10 | 11/15 | 0/10 |

En NVIDIA B200 (192 GB HBM3e, BF16 con `torch.compile`, bs=192, W=1.024), el autor declara 954.140 tok/s a R=1 (1,82 USD por cada mil millones de tokens), un 2,19x más rápido y un 27,5 % más barato que H100, y una convergencia 2,3x más rápida que su línea base sin DeltaNet.

Las puntuaciones de lógica, código y matemáticas de la Tabla 6 del preprint (FOLIO 78 %, HumanEval 63,3 %, MATH-500 40 %; 70/110 frente a 55/110 de Qwen2.5-1.5B) corresponden, según el propio autor, al "Project Genesis Two-Hemisphere CPU Engine" completo, que empareja el núcleo neuronal con un hemisferio de verificación no neuronal determinista, no al modelo neuronal aislado. No se han publicado resultados de benchmarks del checkpoint neuronal por separado en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el modo CPU; el runtime `.gv8` ocupa 408,7 MiB en disco y 424,7 MiB de RSS en memoria del sistema.
- GPU recomendadas: el autor reporta entrenamiento e inferencia en NVIDIA B200 (192 GB HBM3e) y comparaciones con H100; no se detallan requisitos mínimos de VRAM para GPU.
- Cabe en GPU de consumo: no disponible en la información proporcionada; el diseño está orientado a CPU.
- CPU de referencia: Intel Core i5-10210U de 15 W, con soporte AVX2 y FMA.
- Opciones de despliegue: runtime propio en Rust puro (`engine_rust/`) con AVX2 y FMA; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 565,4 tok/s a R=1 y 2.156,5 tok/s en configuración 4B en la CPU de referencia; 954.140 tok/s en B200 con bs=192.
- Almacenamiento: 408,7 MiB para los pesos en formato `.gv8`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad de pesos | Enfoque |
|---|---|---|---|---|---|
| Genesis-v8 BICA | 457,07 M totales / 14,5 M activos | no disponible | Apache 2.0 | Pendiente de publicación (`.gv8` y `.pt`) | Ultra-disperso ternario, CPU-first |
| Qwen2.5-0.5B-Instruct | 0,5 B | 32.768 tokens (según documentación pública de Qwen) | Apache 2.0 | Público en Hugging Face | Transformer denso, propósito general |
| Llama-3.2-1B-Instruct | 1 B | 128.000 tokens (según documentación pública de Meta) | Llama 3.2 Community License | Público en Hugging Face | Transformer denso, propósito general |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32.768 tokens (según documentación pública de Qwen) | Apache 2.0 | Público en Hugging Face | Transformer denso, propósito general |

La comparación directa en rendimiento solo está disponible para las métricas del autor (decodificación CPU, aritmética exacta, abstención OOD y cross-session), donde Genesis-v8 declara ventajas sustanciales en velocidad y en tareas específicas. No hay datos comparativos de MMLU, HumanEval o GSM8K del checkpoint neuronal aislado frente a estos modelos.

## Limitaciones y advertencias

- Los pesos neuronales no están publicados: el repositorio de Hugging Face no contiene checkpoints utilizables en el momento de redactar esta ficha; el autor indica que se subirán tras completar el entrenamiento.
- Las cifras de benchmarks mezclan ámbitos: parte corresponden al runtime y a los subsistemas cognitivos, y las puntuaciones de lógica, código y matemáticas al "Two-Hemisphere CPU Engine" completo, no al modelo neuronal aislado.
- Idiomas limitados a inglés y vietnamita; no se declara soporte de castellano ni de otros idiomas.
- Longitud de contexto no especificada, lo que impide evaluar su idoneidad para tareas de contexto largo.
- Riesgo de alucinación: aunque el autor reporta un módulo de abstención con F1=0,9615, no hay evaluación independiente de la tasa de alucinación del checkpoint neuronal.
- Sesgos conocidos: no disponibles; no se ha publicado ninguna evaluación de sesgos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la licencia se aplica al código y a los materiales publicados; conviene verificar la licencia de los pesos cuando se publiquen.
- Madurez: proyecto de investigación con un único autor, sin revisión por pares más allá del preprint en Zenodo, con 0 descargas y 0 likes en Hugging Face en el momento del registro.
- Compatibilidad: el runtime propio en Rust limita la integración con ecosistemas estándar (vLLM, llama.cpp, TGI) y requiere toolchain específico.
- El uso de un hemisferio de verificación no neuronal determinista en las métricas declaradas dificulta la reproducibilidad por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/phamvanthinhgin2004/genesis-v8-bica
- Repositorio GitHub (runtime Rust AVX2, entrenamiento y tests): https://github.com/anhthinhvup/genesis-bica
- Preprint técnico (PDF de 8 páginas): https://github.com/anhthinhvup/genesis-bica/blob/main/paper/genesis_v8_bica_preprint.pdf
- Archivo Zenodo (v0.8.0): https://doi.org/10.5281/zenodo.24447312
- DOI conceptual Zenodo: https://doi.org/10.5281/zenodo.24447311
- Licencia en GitHub: https://github.com/anhthinhvup/genesis-bica/blob/main/LICENSE
