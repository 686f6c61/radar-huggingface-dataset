# MercanAI/rmala-full-attention-100m-3b

## Resumen

rmala-full-attention-100m-3b es un checkpoint de investigación de un modelo de lenguaje base en turco, desarrollado por MercanAI (con espejo en Ethosoft), entrenado desde cero sobre exactamente 3.000 millones de tokens. Se trata de un transformer decoder-only causal de 99.799.680 parámetros (unos 100 M), 16 capas, ancho 640 y una ventana de contexto de 2048 tokens, con embeddings de entrada/salida atados de 32K entradas, RMSNorm y SwiGLU. La variante "full" emplea atención causal completa mediante SDPA con RoPE, frente a las otras cuatro variantes de la familia (gla, v14_full, v14_half y hola), que usan backbones de atención lineal o híbridos.

El modelo no es un modelo instruido ni de chat: es una base para investigación sobre arquitecturas de atención y sobre el protocolo de entrenamiento LM100 del autor. Su relevancia es acotada y experimental: publica métricas de perplejidad (PPL) y bits por byte (BPB) comparables entre cinco variantes de backbone bajo el mismo tokenizador, los mismos tokens de entrenamiento y las mismas particiones de validación y test, lo que permite estudiar el compromiso entre atención lineal y atención completa a escala de 100 M de parámetros.

El checkpoint se distribuye únicamente en safetensors (0,4 GB de repositorio) y no está registrado en `AutoModel` de Transformers, por lo que requiere el cargador incluido en el repositorio (`inference.py`) y un entorno Linux x86_64 con CUDA. El autor no declara licencia nueva para pesos ni código, y limita explícitamente sus afirmaciones: no reclama ausencia de contaminación, ni ausencia de daños, ni aptitud para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal; variante "full" con atencion causal completa (SDPA + RoPE); 16 capas, ancho 640, RMSNorm y SwiGLU |
| Parametros totales | 99.799.680 (~100 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (solo se distribuye el checkpoint FP32; el modo de computo probado usa autocast BF16 con TF32 desactivado) |
| Idiomas soportados | turco (tr) |
| Licencia | no disponible (el autor indica que esta subida no asigna una licencia nueva; ver THIRD_PARTY_NOTICES.md) |
| Formato de pesos | safetensors (el cabezal atado se almacena una sola vez y lo restaura inference.py) |
| Tokens de entrenamiento | 3.000.000.000 tokens objetivo |
| Variante | full (familia rmala: gla, v14_full, v14_half, full, hola) |
| Vocabulario | 32.768 embeddings de entrada/salida atados |
| Tamano del repositorio | 0,4 GB |
| Semilla de entrenamiento | 41001 |
| Fecha de publicacion | 2026-09-27 |

## Arquitectura y entrenamiento

La variante "full" es un transformer causal de 16 capas y anchura 640, con RMSNorm y SwiGLU, y atención causal completa implementada con SDPA y RoPE. Las variantes comparadas dentro de la misma familia usan otros backbones: GLA y V14 con 10 cabezales de tamaño 64, y HoLA con 5 cabezales de tamaño 128, caché beta oficial, ventana de 64 y tamaño de chunk 256, apoyada en la implementación fijada de GatedDeltaNet. V14-LM es una adaptación de la puerta sintética V14 anterior, con claves contextuales, valores en int8, presupuesto de banco de 2048 bytes por cabezal y límites de admisión de lectura/escritura del 5 por ciento; incorpora una puerta aprendida con straight-through estimator y umbral duro de 0,99 en forward, con alpha de memoria aceptada de 1 o 0,5.

El entrenamiento se hizo desde cero sobre un subconjunto fijo de 3.000 millones de tokens de la colección pretokenizada MercanSet V11 / MercanPretraining, con particiones de validación y test disjuntas por shard. Todas las variantes emplearon el mismo tokenizador, los mismos tokens en el mismo orden y los mismos conjuntos de validación y test, con una única semilla (41001). No hay destilación, RLHF ni DPO: es un modelo base entrenado únicamente con el objetivo de modelado de lenguaje causal. El autor declara que no se realizó deduplicación de texto entre colecciones y que no reclama ausencia absoluta de contaminación. La estimación de FLOP algorítmicos de entrenamiento para esta variante es 2,173686e+18, y el propio autor advierte que no se trata de una medición completa de FLOP de hardware.

## Capacidades

- Generación de texto en turco mediante predicción del siguiente token; es un modelo base, no instruido ni alineado para diálogo.
- Modelado de lenguaje y cálculo de métricas de evaluación (PPL y BPB) sobre documentos completos troceados en chunks de 2048 tokens.
- Fine-tuning como backbone turco para tareas posteriores (clasificación, etiquetado, extracción, resumen) mediante cabezales o ajuste completo.
- Investigación comparativa de arquitecturas de atención: sirve como punto de comparación frente a las variantes gla, v14_full, v14_half y hola bajo condiciones de entrenamiento controladas.
- Soporte de tool calling / function calling: no disponible (el modelo no incluye plantilla de instrucciones ni entrenamiento para ello).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no, el modelo está declarado únicamente para turco (tr).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Decodificación de referencia: el repositorio incluye un decodificador que recalcula el prefijo completo y se detiene en el límite de 2048 tokens; no es un decodificador optimizado con caché KV.

## Casos de uso

- Estudio de atención lineal frente a atención completa: el modelo permite reproducir la comparación entre backbones (gla, v14, full, hola) manteniendo tokenizador, orden de tokens y particiones, aislando el efecto de la arquitectura de atención con la misma semilla.
- Baseline de perplejidad en turco: sirve como referencia de PPL (22,187501) y BPB (1,262025) en un test de 11.352.596 tokens y 39.843.759 bytes UTF-8 originales para calibrar modelos turcos de mayor tamaño.
- Fine-tuning para clasificación de textos turcos: al ser un modelo base de 100 M, se puede ajustar con recursos modestos para tareas de categorización o análisis de sentimiento en dominios concretos.
- Generación de datos sintéticos en turco para aumento de corpus: útil en escenarios con poca disponibilidad de texto anotado, aceptando la necesidad de filtrado posterior por la tasa de error esperable de un modelo de 100 M.
- Investigación de sistemas de entrenamiento e inferencia: el repositorio incluye fuentes de entrenamiento originales y kernels Triton, lo que permite estudiar compilación, presupuesto de memoria y modos de precisión (FP32 frente a autocast BF16 con TF32 desactivado).
- Preentrenamiento continuo en dominio específico (legal, sanitario, técnico) en turco: el modelo actúa como inicialización para adaptar el modelo a vocabulario y estilo de un corpus sectorial.
- Evaluación de protocolos de reproducibilidad: el protocolo LM100 y los ficheros de configuración permiten auditar decisiones de optimización y de adaptación V14-LM en un experimento pequeño y controlado.

## Benchmarks y rendimiento

Resultados declarados por el autor para las cinco variantes de la familia, con el mismo tokenizador, mismos tokens y mismas particiones. Menos PPL y menos BPB es mejor. La evaluación de documentos completos usa chunks de 2048 tokens; el test consta de 11.352.596 tokens y 39.843.759 bytes UTF-8 originales. La PPL incluye el EOS terminal; el BPB usa la NLL de contenido dividida por el número de bytes UTF-8 originales y excluye el EOS terminal.

| Variante | Test PPL | Test BPB | FLOP algoritmico de entrenamiento estimado |
|---|---:|---:|---:|
| gla | 25,561380 | 1,321054 | 1,866978e+18 |
| v14_full | 25,591686 | 1,321246 | 1,886712e+18 |
| v14_half | 25,482146 | 1,319796 | 1,886712e+18 |
| full (este modelo) | 22,187501 | 1,262025 | 2,173686e+18 |
| hola | 20,419358 | 1,228817 | 1,963008e+18 |

El propio autor matiza que la mejora de v14_half sobre GLA es pequeña y no establece superioridad robusta, que v14_full no mejoró la PPL de test y que no se incluyen en esta entrega resultados completos de diagnóstico de recuperación o razonamiento de largo alcance. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Pesos en FP32: el repositorio ocupa 0,4 GB, coherente con ~100 M de parámetros en precisión completa.
- VRAM estimada para inferencia: por debajo de 1 GB en autocast BF16 para contexto de 2048 tokens, sumando pesos y activaciones; el checkpoint FP32 completo ronda los 400 MB.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA capaz de ejecutar los kernels Triton compilados en Linux x86_64; el autor probó el modo de cómputo con autocast BF16 y TF32 desactivado.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con más de 1-2 GB de VRAM (por ejemplo, serie GTX 10, RTX 20/30/40 o superior); también es viable en CPU, aunque el camino de referencia está pensado para CUDA.
- Opciones de despliegue: no compatible con `AutoModel` de Transformers, ni con vLLM, TGI, llama.cpp u Ollama según la información disponible; requiere el cargador incluido (`python inference.py`). No se distribuyen pesos GGUF ni cuantizaciones de terceros.
- Requisitos de entorno: binario nativo del tokenizador para Linux x86_64 y CPython 3.11 o superior; la primera ejecución compila kernels Triton.
- Latencia y throughput: no disponible. El decodificador de referencia recalcula el prefijo completo en cada paso y no implementa una caché KV optimizada, por lo que el coste de generación crece con la longitud del contexto hasta el límite de 2048 tokens.

## Comparativa con modelos similares

No se dispone de comparativas publicadas frente a otros modelos turcos o de tamaño similar en la información proporcionada, ni de resultados en benchmarks estándar que permitan una comparación externa fiable. La única comparación con datos verificables es interna a la familia rmala, bajo condiciones de entrenamiento idénticas:

| Variante | Backbone de atencion | Test PPL | Test BPB | Contexto |
|---|---|---:|---:|---|
| full (este modelo) | Atencion causal completa (SDPA + RoPE) | 22,187501 | 1,262025 | 2048 |
| hola | Hibrida con cache beta, ventana 64, chunk 256, 5 cabezales de 128 | 20,419358 | 1,228817 | 2048 |
| v14_half | V14 adaptada | 25,482146 | 1,319796 | 2048 |
| gla | GLA con 10 cabezales de 64 | 25,561380 | 1,321054 | 2048 |
| v14_full | V14 adaptada | 25,591686 | 1,321246 | 2048 |

El autor advierte que HoLA usa un backbone distinto (GatedDeltaNet con caché fijada) y que, por tanto, la comparación con GLA normalizada no es una ablación limitada a la caché. Comparación con modelos de terceros: no disponible.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue instrucciones ni mantiene formato conversacional; usarlo como asistente sin fine-tuning produce resultados deficientes.
- Riesgo de alucinación: elevado para un modelo de 100 M entrenado con 3.000 millones de tokens; no debe usarse como fuente factual sin verificación.
- Contexto limitado a 2048 tokens, lo que restringe tareas de documento largo, recuperación de largo alcance y razonamiento multi-paso.
- Solo turco: no hay capacidades multilingües declaradas ni evaluadas.
- Licencia: no disponible. El autor indica que esta subida no asigna una licencia nueva a pesos o código y remite a THIRD_PARTY_NOTICES.md; el uso comercial queda sin autorización explícita y debe aclararse con el titular antes de cualquier despliegue productivo.
- Contaminación: no se realizó deduplicación de texto entre colecciones; el autor no reclama ausencia absoluta de contaminación entre entrenamiento y evaluación.
- Sin garantías de seguridad: no se hace ninguna afirmación de harmlessness general ni de aptitud para producción.
- Rendimiento modesto: la PPL de test (22,187501) corresponde a un modelo pequeño y poco entrenado en términos absolutos; no es competitivo con modelos turcos de mayor escala.
- Limitaciones de integración: la arquitectura no está registrada en Transformers, el decodificador no está optimizado con caché KV y el tokenizador nativo requiere Linux x86_64 con CPython 3.11 o superior.
- Los FLOP declarados son estimaciones algorítmicas, no mediciones de hardware, y el autor documenta operaciones excluidas y cobertura del profiler en LM100_PROTOCOL.md.
- En la variante V14, el umbral duro de 0,99 y los límites de admisión del 5 por ciento no implican una reducción del 95 por ciento de FLOP del modelo completo ni garantizan que las lecturas aceptadas sean correctas.

## Enlaces

- Modelo en HuggingFace (MercanAI): https://huggingface.co/MercanAI/rmala-full-attention-100m-3b
- Espejo en HuggingFace (Ethosoft): https://huggingface.co/Ethosoft/rmala-full-attention-100m-3b
- Protocolo de entrenamiento y evaluación: https://huggingface.co/MercanAI/rmala-full-attention-100m-3b/blob/main/LM100_PROTOCOL.md
- Configuración de entrenamiento: https://huggingface.co/MercanAI/rmala-full-attention-100m-3b/blob/main/training_config.json
- Métricas completas de validación y test: https://huggingface.co/MercanAI/rmala-full-attention-100m-3b/blob/main/evaluation.json
- Avisos de terceros y licencias: https://huggingface.co/MercanAI/rmala-full-attention-100m-3b/blob/main/THIRD_PARTY_NOTICES.md
- Script de inferencia de referencia: https://huggingface.co/MercanAI/rmala-full-attention-100m-3b/blob/main/inference.py
- Dependencias: https://huggingface.co/MercanAI/rmala-full-attention-100m-3b/blob/main/requirements.txt
- Paper o publicacion tecnica: no disponible
- Demo o espacio interactivo: no disponible
