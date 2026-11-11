# quasar529/qwen3-8b-ar-uniform-cpt60b

## Resumen

`quasar529/qwen3-8b-ar-uniform-cpt60b` es un checkpoint de investigación publicado por el usuario quasar529 que consiste en un preentrenamiento continuado (CPT) de parámetros completos sobre `Qwen/Qwen3-8B-Base`. El modelo combina un objetivo autorregresivo (cross-entropy estándar) con un objetivo de difusión uniforme sobre bloques de 128 tokens, ponderado este último con un factor de 0,3. No se añadieron parámetros nuevos: los 8.190.735.360 parámetros del Qwen3-8B original se entrenaron íntegramente bajo este objetivo conjunto.

La relevancia del artefacto es fundamentalmente metodológica: explora si un transformer causal denso puede adquirir capacidades de decodificación por difusión sin cambiar la arquitectura ni introducir condicionamiento temporal, aprovechando únicamente una disposición de atención específica en tiempo de entrenamiento y decodificación. El autor es explícito al señalar que se trata de un checkpoint de preentrenamiento, no ajustado a instrucciones, y que la generación puramente por difusión todavía no es utilizable.

El repositorio ocupa 131,1 GB porque incluye tanto los pesos en formato Hugging Face (16,4 GB en bfloat16) como el checkpoint completo de Megatron con estado del optimizador (115 GB), además de manifiestos de procedencia y documentación de reanudación del entrenamiento. La licencia es Apache 2.0 y el único idioma declarado es el inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (Qwen3), con atención bidireccional por bloques en la mitad ruidosa durante el entrenamiento |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (longitud de secuencia de entrenamiento); no se declara ventana mayor |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16; el autor no documenta cuantizaciones) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) + checkpoint Megatron `torch_dist` con estado del optimizador |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-8B-Base` (revisión `49e3418fbbbca6ecbdf9608b4d22e5a407081db4`), con 36 capas, tamaño oculto de 4096 y vocabulario de 151.936 tokens. No se añadieron parámetros, no hay condicionamiento temporal ni autocondicionamiento, y todos los parámetros fueron entrenados. Los pesos exportados son un `Qwen3ForCausalLM` estándar: el comportamiento de difusión reside en la disposición de atención usada en entrenamiento y decodificación, no en pesos adicionales.

Cada ejemplo de entrenamiento es la misma secuencia de 4096 tokens repetida dos veces, `[copia ruidosa ; copia limpia]`, con 8192 posiciones y los mismos position ids en ambas mitades (RoPE repetido). La mitad limpia usa atención causal y pérdida de cross-entropy next-token (AR). En la mitad ruidosa se muestrea `t ~ U(0.001, 0.999)` y cada token se sustituye por un token aleatorio del vocabulario con probabilidad `t`; las posiciones se dividen en bloques consecutivos de 128 y cada posición ruidosa atiende a los tokens limpios de bloques anteriores y a todas las posiciones ruidosas de su propio bloque (bidireccional dentro del bloque). La pérdida es cross-entropy contra el token limpio en la misma posición, sobre todas las posiciones de la mitad ruidosa. El objetivo por actualización es `L = CE_AR / N_AR + 0.3 * CE_diff / N_diff`.

El entrenamiento se dividió en dos etapas. La etapa 1 usó `HuggingFaceFW/fineweb-edu` con 49.998.200.832 tokens, 23.841 actualizaciones, batch global de 512 x 4096, learning rate pico de 1e-5 con warmup de 1000 millones de tokens y decaimiento coseno hasta 1e-6. La etapa 2 usó los conjuntos de preentrenamiento de NVIDIA Nemotron (matemáticas, código, STEM, razonamiento, QA, multilingüe) con 9.999.220.736 tokens, 4.768 actualizaciones y learning rate constante de 1e-6, conservando modelo, momentos de Adam, pesos maestros y RNG de la etapa 1. Optimizador AdamW (betas 0,9/0,95, eps 1e-8, weight decay 0,1, grad clip 1,0), precisión bf16 con pesos maestros en FP32, sobre 128 GPU NVIDIA GH200 (32 nodos) con TP 4 x DP 32.

## Capacidades

- Generación de texto autorregresiva estándar mediante `Qwen3ForCausalLM` y `generate` de `transformers`.
- Razonamiento y matemáticas heredados del corpus de preentrenamiento, reforzados en la etapa 2 con conjuntos de matemáticas, STEM y razonamiento.
- Generación de código, con datos de código en la etapa 2 de CPT.
- Capacidad experimental de reconstrucción por difusión uniforme sobre bloques de 128 tokens (no utilizable todavía para generación según el propio autor).
- Respuesta a preguntas y QA, por la composición del dataset de la etapa 2.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el modelo declara únicamente inglés, aunque el corpus de la etapa 2 incluye datos multilingües.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación sobre decodificación por difusión en LLM: el checkpoint permite reproducir el objetivo conjunto AR + difusión uniforme y experimentar con decodificación por bloques de 128 tokens, una vez publicado el código de decodificación.
- Reproducción de preentrenamiento continuado: el checkpoint Megatron completo con pesos maestros FP32, momentos de Adam, scheduler y RNG permite reanudar el entrenamiento en otro clúster siguiendo `RESUME.md`, útil para estudios de escalado o de mezcla de datos.
- Estudio de olvido catastrófico y transferencia: comparar este checkpoint con `Qwen/Qwen3-8B-Base` en tareas de razonamiento, matemáticas y código permite medir el efecto de 60B tokens adicionales de CPT con un objetivo modificado.
- Base para ajuste supervisado posterior: al ser un checkpoint de preentrenamiento en inglés, puede servir como punto de partida para SFT o DPO en dominios concretos, siempre asumiendo que no está alineado ni ajustado a instrucciones.
- Evaluación comparativa de objetivos de entrenamiento: útil para grupos que investigan objetivos híbridos (AR + difusión, masked LM, etc.) y necesitan un artefacto con procedencia verificada y paridad de exportación documentada.
- Análisis de la atención bidireccional por bloques: el diseño de máscaras (bloques de 128 con atención bidireccional interna y causal hacia bloques limpios anteriores) es un caso de estudio para investigar el impacto de la máscara en la calidad de las representaciones.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación con `lm-evaluation-harness`, 4-shot, greedy y los mismos ítems para cada fila, con accuracy para MMLU, ARC-E, PIQA y WinoGrande y accuracy normalizada para ARC-C y HellaSwag. Sin embargo, la información proporcionada se interrumpe en la cabecera de la tabla (`| Checkpoint | MMLU | ARC`), por lo que los valores numéricos no están disponibles.

No se han publicado resultados de benchmarks completos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16,4 GB solo para pesos, más caché KV y activaciones; en la práctica, alrededor de 18-20 GB para secuencias cortas.
- VRAM estimada en cuantización de 8 bits: no disponible (el autor no publica cuantizaciones).
- VRAM estimada en cuantización de 4 bits: no disponible.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, GH200 (la configuración usada en entrenamiento). Para inferencia en bf16, una RTX 4090 de 24 GB puede alojar los pesos, aunque con margen ajustado para contexto largo.
- Cabe en GPU de consumo: sí, en bf16 en GPUs de 24 GB o más (RTX 3090, RTX 4090) para secuencias moderadas; en GPUs de 16 GB requeriría cuantización, no documentada por el autor.
- Opciones de despliegue: `transformers` (versión 4.53.3 usada para la exportación, cualquier versión con soporte Qwen3 debería funcionar), text-generation-inference (tag `text-generation-inference` en el repo), endpoints compatibles. No se documenta soporte de llama.cpp, Ollama, vLLM ni TGI más allá de la etiqueta del repositorio.
- Latencia y throughput: no disponibles.
- Almacenamiento: descarga completa de 131,1 GB con `snapshot_download`; `from_pretrained` solo descarga los archivos raíz (16,4 GB). Se recomienda `allow_patterns` para evitar bajar el checkpoint Megatron de 115 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| quasar529/qwen3-8b-ar-uniform-cpt60b | 8,19B | 4096 | AR + difusión uniforme (CPT 60B) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-8B-Base | 8,19B | no disponible en la información | AR estándar | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-8B | 8,19B | no disponible en la información | AR + post-entrenamiento (instrucciones) | Apache 2.0 | Hugging Face |

La comparación con alternativas de difusión de texto no está disponible en la información proporcionada. El modelo base directo es `Qwen/Qwen3-8B-Base`, por lo que cualquier comparación de rendimiento debería hacerse contra ese checkpoint con los mismos ítems de evaluación.

## Limitaciones y advertencias

- Checkpoint de preentrenamiento: no está ajustado a instrucciones ni alineado; no debe usarse directamente como asistente conversacional en producción.
- La generación puramente por difusión "no es utilizable todavía" según el propio autor; el código de entrenamiento y decodificación por difusión aún no se ha publicado (se anunciará en GitHub).
- Solo se declara inglés como idioma soportado, aunque el corpus de la etapa 2 incluye datos multilingües.
- Contexto de 4096 tokens, limitado para tareas de contexto largo.
- Riesgo de alucinación y sesgos: no documentados explícitamente por el autor; al derivar de `fineweb-edu` y conjuntos Nemotron, hereda los sesgos de esas fuentes.
- La paridad de exportación está verificada (variación total máxima de logits de 1,9e-5, argmax igual en 128/128 posiciones), pero la carga con `transformers` no se ha re-ejecutado en una máquina limpia.
- La reanudación del entrenamiento en otro clúster o con otro número de GPUs no está probada; solo se verificó el guardado y reanudación en el clúster de entrenamiento.
- El repositorio incluye 115 GB de checkpoint Megatron; una descarga completa sin `allow_patterns` consume 131,1 GB de disco.
- Licencia Apache 2.0 permite uso comercial, pero al ser un artefacto de investigación sin evaluación completa, no se recomienda su uso comercial sin validación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/quasar529/qwen3-8b-ar-uniform-cpt60b
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Dataset de la etapa 1: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Documentación de entrenamiento: `TRAINING.md` en el repositorio
- Documentación de reanudación: `RESUME.md` en el repositorio
- Registro de paridad de exportación: `provenance/export-parity.json` en el repositorio
- Código de entrenamiento y decodificación por difusión: no disponible (pendiente de publicación en GitHub según el autor)
