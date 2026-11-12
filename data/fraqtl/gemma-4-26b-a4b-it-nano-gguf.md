# fraQtl/Gemma-4-26B-A4B-it-Nano-GGUF

## Resumen

Gemma-4-26B-A4B-it-Nano-GGUF es una cuantización de 2 bits del modelo Google Gemma-4-26B-A4B-it, publicada por el usuario fraQtl. El modelo base es un Mixture-of-Experts (MoE) de 27.300 millones de parámetros totales con 3.800 millones activos por token y una ventana de contexto de 256.000 tokens. Esta edición "Nano" reduce el peso en disco a aproximadamente 6,7 GB (2,117 bits por peso), lo que la sitúa como la variante de menor huella de la escalera del autor (Hi-Fi, SmartEdge, Nano), pensada para dispositivos móviles, portátiles y equipos aislados donde el tamaño es la restricción dominante.

La propuesta técnica del autor es una asignación de bits por tensor guiada por importancia: router, embeddings de tokens, atención y las proyecciones `ffn_down` de los expertos se protegen a mayor precisión, mientras que el grueso de los pesos de expertos (`ffn_gate`/`ffn_up`) asume el nivel bajo de bits. La calibración se realizó con una imatrix genérica sobre texto genérico y el artefacto es un GGUF estándar de llama.cpp, por lo que se ejecuta en cualquier entorno compatible con dicha librería.

Es relevante ahora porque demuestra que un MoE de 26B con modo de razonamiento puede comprimirse hasta 6,7 GB manteniendo el modo "thinking" de Gemma-4, con un coste medido de fidelidad frente a fp16 (KLD de 1,97 en código y matemáticas, 2,91 en general). No obstante, ese coste implica que no es un sustituto directo del modelo completo en flujos que exijan fidelidad de distribución de tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), modelo base Gemma-4-26B-A4B-it |
| Parametros totales | 27.309.322.526 (27,3B) |
| Parametros activos | 3,8B (según model card) |
| Longitud de contexto | 256.000 tokens (modelo base) |
| Tipos de cuantizacion | 2 bits (2,117 bpw), GGUF con asignación de bits por tensor |
| Idiomas soportados | Inglés (etiqueta `language: en` en la model card) |
| Licencia | Apache 2.0 para los artefactos de cuantización; los pesos derivan de Google Gemma y quedan sujetos a los términos de Gemma |
| Formato de pesos | GGUF (`Gemma-4-26B-A4B-it-fraQtl-2bit.gguf`) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture-of-Experts: 27,3B parámetros totales de los que 3,8B se activan por token, lo que permite un coste de cómputo por inferencia propio de un modelo mucho menor que su tamaño total. Esta ficha describe la cuantización, no un entrenamiento nuevo: no se ha realizado entrenamiento adicional, sino una compresión post-entrenamiento del checkpoint bf16 de Google.

El método de cuantización es una asignación de bits por tensor guiada por importancia sobre la base bf16. Los tensores frágiles (router, embeddings de tokens, atención y proyecciones `ffn_down` de los expertos) se mantienen a mayor precisión, mientras que los pesos mayoritarios de expertos (`ffn_gate`/`ffn_up`) soportan el nivel bajo de bits. La calibración emplea una imatrix genérica sobre texto genérico; el autor indica que la calibración orientada a tarea no se aplicó a este archivo y que las ediciones task-aware son un trabajo futuro. No se dispone de datos sobre el volumen de tokens de entrenamiento del modelo base ni sobre si hubo RLHF o DPO en su pipeline.

## Capacidades

- Generación de texto conversacional con plantilla de chat; el autor advierte que el modelo degenera con prompts en bruto.
- Razonamiento en modo "thinking" de Gemma-4, conservado en esta cuantización y utilizado en la evaluación de MMLU-Pro.
- Aritmética y matemáticas de nivel escolar: en la muestra del autor resuelve correctamente 17 × 24 = 408 descomponiendo el producto.
- Razonamiento científico básico: explica la dispersión de Rayleigh como causa del color azul del cielo.
- Conocimiento factual geográfico: identifica países sudamericanos y sus capitales en la muestra publicada.
- Contexto largo heredado del modelo base (256.000 tokens), aunque el ejemplo de uso del autor configura `n_ctx=4096`.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: la model card solo declara inglés.
- Visión, audio u otras modalidades: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional en dispositivo: con 6,7 GB en disco y un MoE de 3,8B activos, puede desplegarse en portátiles y equipos de gama alta sin GPU dedicada mediante llama.cpp, manteniendo conversaciones multi-turno con plantilla de chat.
- Razonamiento matemático en entornos aislados: la puntuación de 86% en GSM8K (0-shot, 100 preguntas) lo hace utilizable para resolución de problemas aritméticos en máquinas air-gapped donde no se puede recurrir a APIs externas.
- Prototipado y evaluación de pipelines: al ser un GGUF estándar, sirve para validar flujos de llama.cpp, plantillas de chat y prompts antes de migrar a la variante Hi-Fi Q4 o al modelo completo.
- Educación y demostraciones técnicas: ejemplos como la explicación de la dispersión de Rayleigh o el cálculo mental paso a paso encajan en herramientas didácticas ejecutables localmente.
- Procesamiento de documentos con contexto largo: los 256.000 tokens del modelo base permiten, en principio, resumir o consultar documentos extensos, aunque la ventana efectiva debe validarse a 2 bits por la degradación de fidelidad.
- Filtrado y clasificación de texto de baja criticidad: tareas donde un error puntual es tolerable y prima el coste cero de infraestructura, como etiquetado preliminar o generación de borradores.
- Despliegue edge con requisitos de tamaño estrictos: escenario declarado por el autor para teléfonos, portátiles y cajas aisladas donde el límite de almacenamiento o memoria es el factor decisivo.

## Benchmarks y rendimiento

| Benchmark | Nano 2-bit (este archivo) | Referencia | Nota |
|---|---:|---:|---|
| GSM8K (0-shot, plantilla de chat, 100 preguntas) | 86% | no disponible | 0 generaciones degeneradas |
| MMLU-Pro (1000 preguntas, razonamiento activado) | 65% | Google base: 82,6% | Equivale a ~79% del modelo completo |
| KLD vs fp16, slice código + matemáticas | 1,97 | Hi-Fi Q4: 0,09 | Menor es mejor |
| Top-1 vs fp16, slice código + matemáticas | 60% | Hi-Fi Q4: casi completo | — |
| KLD vs fp16, slice general | 2,91 | Hi-Fi Q4: 0,13 | Menor es mejor |
| Top-1 vs fp16, slice general | 44% | Hi-Fi Q4: casi completo | — |

No se han publicado resultados de benchmarks adicionales (MMLU estándar, HumanEval, etc.) en la información disponible. El autor no reporta puntuaciones en modo respuesta directa (sin razonamiento) para MMLU-Pro.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo pesa ~6,7 GB, por lo que la inferencia completa en GPU requiere aproximadamente 7-8 GB de VRAM sumando overhead de contexto y caché KV; con `n_ctx` corto (4096) el margen es ajustado pero viable en GPUs de 8 GB.
- GPU recomendadas: no hay datos específicos del autor; por tamaño, una RTX 3060/4060 de 8-12 GB, RTX 4070/4080 o superiores permiten cargar todas las capas en GPU (`n_gpu_layers=-1`). En A100/H100 el modelo queda muy infrautilizado y el cuello de botella pasa a ser el ancho de banda de memoria.
- ¿Cabe en GPU consumer? Sí, en tarjetas de 8 GB o más, con cuantización de 2 bits y contexto moderado; en 6-8 GB conviene reducir `n_ctx` o descargar capas a CPU.
- Opciones de despliegue: llama.cpp (versión de referencia `llama-cpp-python==0.3.33`), `llama-cli` con `-cnv`, y cualquier runtime compatible con GGUF estándar. vLLM, TGI y Ollama no están confirmados en la información proporcionada.
- Latencia y throughput: no disponibles. El autor no publica mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tamaño en disco | Fidelidad / rendimiento | Licencia |
|---|---|---:|---:|---|---|
| fraQtl Nano 2-bit (este) | 27,3B totales / 3,8B activos | 256K (base) | ~6,7 GB (2,117 bpw) | GSM8K 86%, MMLU-Pro 65%, KLD 1,97 / 2,91 | Apache 2.0 (artefacto), términos Gemma (pesos) |
| IQ2_XXS comunitario | 27,3B totales / 3,8B activos | 256K (base) | 9,66 GB | no evaluado aquí | según el publicador |
| Q2_K comunitario | 27,3B totales / 3,8B activos | 256K (base) | 11 GB | no evaluado aquí | según el publicador |
| Gemma-4-26B-A4B-it QAT oficial (Google) | 27,3B totales / 3,8B activos | 256K (base) | 14,4 GB | referencia base: MMLU-Pro 82,6% | términos Gemma |
| Gemma-4-26B-A4B-it bf16 | 27,3B totales / 3,8B activos | 256K (base) | ~50 GB | referencia completa | términos Gemma |

Según los tamaños publicados, Nano es ~31% menor que un IQ2_XXS estándar, ~2,15 veces menor que el QAT de 4 bits oficial y ~7,5 veces menor que bf16. No se han publicado comparaciones de rendimiento frente a esos artefactos en la información disponible.

## Limitaciones y advertencias

- Cuantización post-entrenamiento de 2 bits: pensada para cuando tamaño y memoria son la restricción vinculante; no es un sustituto directo del modelo completo en trabajos sensibles a la fidelidad.
- Fidelidad de distribución de tokens degradada: KLD de 1,97 (código y matemáticas) y 2,91 (general) frente a fp16, con top-1 del 60% y 44% respectivamente; para fidelidad casi original el autor remite a la variante Hi-Fi Q4 (KLD 0,09 y 0,13).
- Calibración genérica: no se aplicó calibración orientada a tarea, lo que puede penalizar dominios específicos.
- Riesgo de alucinación: no cuantificado por el autor; la degradación de fidelidad a 2 bits es un factor de riesgo añadido que debe validarse por caso de uso.
- Idioma: solo se declara inglés; el rendimiento en castellano no está evaluado ni documentado.
- Plantilla de chat obligatoria: el autor advierte que el modelo degenera con prompts en bruto.
- Licencia: los artefactos de cuantización son Apache 2.0, pero los pesos derivan de Google Gemma y siguen sujetos a los términos de Gemma; deben revisarse antes de uso comercial.
- Sesgos: no se documentan sesgos conocidos en la información proporcionada.
- Advertencia de producción: el autor califica GSM8K como una prueba de cribado de 100 preguntas 0-shot, no como una evaluación exhaustiva.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fraQtl/Gemma-4-26B-A4B-it-Nano-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Perfil del autor: https://huggingface.co/fraQtl
- Imagen del repositorio: https://huggingface.co/fraQtl/Gemma-4-26B-A4B-it-Nano-GGUF/resolve/main/Gemma-4-26B-A4B-it-Nano-GGUF.png
- llama-cpp-python: https://pypi.org/project/llama-cpp-python/
- llama.cpp: https://github.com/ggml-org/llama.cpp
