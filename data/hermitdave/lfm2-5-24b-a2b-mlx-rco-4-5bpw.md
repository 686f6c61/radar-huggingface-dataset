# hermitdave/LFM2.5-24B-A2B-MLX-RCO-4.5bpw

## Resumen

LFM2.5-24B-A2B-MLX-RCO-4.5bpw es una cuantización mixta de 4 bits del modelo LFM2.5-24B-A2B de Liquid AI, preparada por Hermit Dave y optimizada específicamente para Apple Silicon mediante MLX. El modelo original es un transformer híbrido con arquitectura MoE (Mixture of Experts) de 23.970 millones de parámetros totales y aproximadamente 2.000 millones activos por token, lo que lo sitúa en la categoría de modelos de gran capacidad con coste de inferencia reducido.

La relevancia de esta ficha radica en dos aspectos. Primero, aplica RCO (rate-constrained optimization), un asignador de precisión mixta con restricción exacta de bits por peso, descrito en el paper arXiv:2605.00649 y portado a MLX por el pipeline `rco-mlx`. Segundo, demuestra que un modelo de 24B puede ejecutarse en un Mac con 64 GB de memoria unificada ocupando 17,1 GB en lugar de los 50,1 GB del checkpoint BF16, con una recuperación media de tareas del 99,56 % respecto al modelo de referencia.

El resultado es un checkpoint práctico para desarrollo local en portátiles y equipos de sobremesa de Apple, con una ventana de contexto de 131.072 tokens y soporte para seis idiomas, aunque su licencia LFM Open License v1.0 impone restricciones que conviene revisar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE (lfm2_moe): 10 capas de atención completa y 30 capas de convolución corta |
| Parametros totales | 23.971.587.712 (23,97 B) |
| Parametros activos | ~2 B por token |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | MLX affine, grupo de 64, escalas y sesgos en bfloat16; mezcla de 4 bits (101 tensores de expertos enrutados), 6 bits (13 tensores), 8 bits (106 tensores) y BF16 (embeddings, normas, router gate, expert bias, convolución depthwise) |
| Idiomas soportados | en, ar, zh, fr, de, ja |
| Licencia | LFM Open License v1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | safetensors en formato MLX (repo de 14,9 GB; bpw efectivo 4,972) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer híbrido de 40 capas: 10 capas con atención completa (32 cabezas de consulta y 8 de clave/valor) y 30 capas con convolución corta, con un tamaño oculto de 2048. La capa MoE emplea 64 expertos con enrutamiento top-4, `moe_intermediate_size` de 1536, activación sigmoide con `expert_bias` y `norm_topk_prob`, más 2 capas densas. El vocabulario es de 128.000 tokens.

La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens procesados ni si se aplicaron etapas de RLHF o DPO sobre el modelo base. Tampoco se documentan innovaciones de decodificación especulativa ni mecanismos de atención lineal más allá de la combinación de atención completa y convolución corta.

La contribución técnica de este checkpoint es la cuantización RCO: un asignador de precisión mixta con presupuesto exacto de bits por peso que distribuye la precisión según el error de reconstrucción medido por tensor, en lugar de aplicar una penalización. El pipeline usa una base de datos de error RTN en streaming y programación dinámica sobre el presupuesto, con 220 entradas de override por tensor. No existe una imatrix pública para este checkpoint, por lo que la asignación se basa en la base de datos RTN simple; el autor señala que una build ponderada por imatrix sería el siguiente paso de calidad.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat propia del tokenizador.
- Razonamiento y respuesta a preguntas de conocimiento general, con rendimiento validado en MMLU, ARC, HellaSwag y WinoGrande.
- Capacidad multilingüe en inglés, árabe, chino, francés, alemán y japonés.
- Ventana de contexto larga de 131.072 tokens, apta para documentos extensos y conversaciones con historial amplio.
- Eficiencia de inferencia por arquitectura MoE: solo ~2 B de parámetros activos por token, lo que reduce el coste de cómputo frente a un modelo denso del mismo tamaño.
- Ejecución nativa en Apple Silicon mediante mlx-lm, con soporte de precisión mixta por módulo leída desde `config.json["quantization"]`.
- No se documenta en la información disponible soporte explícito de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede mantener diálogos multi-turno con historial extenso gracias a sus 131.072 tokens de contexto, ejecutándose en un equipo con 64 GB de memoria unificada con un consumo pico de 17,1 GB.
- Procesamiento de documentos largos en local: resumen, extracción y preguntas sobre contratos, informes o expedientes que superen los 100.000 tokens, sin enviar datos a servicios externos.
- Desarrollo y prototipado en Apple Silicon: integración vía `mlx_lm.generate` o la API de Python para probar prompts, plantillas de chat y flujos conversacionales antes de desplegar en infraestructura mayor.
- Atención al cliente multilingüe: cobertura de inglés, árabe, chino, francés, alemán y japonés en un mismo checkpoint, útil para equipos con base de usuarios internacional.
- Investigación sobre cuantización: el checkpoint sirve como referencia reproducible para estudiar el impacto de RCO y la precisión mixta en un MoE de 24B, con métricas de KL, acuerdo top-1 y recuperación de tareas publicadas.
- Generación de texto por lotes en estaciones de trabajo: con 90,9 tok/s de decodificación en un M3 Max, es viable para tareas de redacción, clasificación o extracción sobre volúmenes moderados sin GPU dedicada.
- Evaluación comparativa de modelos: permite medir en hardware de consumo el comportamiento de un MoE de 24B frente a alternativas densas y contrastar la degradación introducida por la cuantización de 4 bits.

## Benchmarks y rendimiento

WikiText-2 test (filas con prefijo BOS; KL y top-1 medidos contra la referencia BF16 sobre 32x512 filas idénticas; perplejidad emparejada por fila sobre 256x512, 130.816 tokens):

| Metrica | BF16 | Esta cuantizacion |
|---|---|---|
| KL(ref‖quant) ↓ | — | 0,1532 ± 0,0056 |
| Acuerdo top-1 ↑ | — | 82,0 % |
| Perplejidad ↓ | 20,61 | 20,82 ± 0,55 |

Recuperación zero-shot (5 tareas x 400 ejemplos, prompts idénticos, emparejado 2x2):

| Tarea | Precision BF16 | Precision cuantizada | Recuperacion |
|---|---|---|---|
| arc_challenge | 0,4400 | 0,4450 | 1,011 |
| arc_easy | 0,7400 | 0,7050 | 0,953 |
| hellaswag | 0,3975 | 0,3975 | 1,000 |
| winogrande | 0,4975 | 0,4800 | 0,965 |
| mmlu | 0,4075 | 0,4275 | 1,049 |
| Media de recuperacion | | | 0,9956 (task-lossless) |

Rendimiento en M3 Max de 64 GB con mlx-lm (prompt de ~1K tokens, 256 tokens de decodificación, al menos 2 ejecuciones):

| Metrica | BF16 | Esta cuantizacion |
|---|---|---|
| Prefill | 665,9 tok/s | 990,5 tok/s |
| Decodificacion | 53,7 tok/s | 90,9 tok/s |
| Memoria pico | 50,1 GB | 17,1 GB |

## Requisitos de hardware

- Memoria: 17,1 GB de pico en inferencia con mlx-lm; el repo ocupa 14,9 GB en disco. El ahorro frente a BF16 (50,1 GB) está en almacenamiento y E/S, ya que MLX descomprime en tiempo de ejecución.
- Hardware objetivo: Apple Silicon con memoria unificada. Validado en un M3 Max de 64 GB; el consumo de 17,1 GB permite ejecutarlo en equipos con 24-32 GB de memoria unificada, aunque no se ha validado en esa configuración en la información disponible.
- GPU dedicadas: no se documenta soporte para CUDA, A100, H100 ni RTX 4090; el formato es MLX y está pensado para Apple Silicon.
- Despliegue: mlx-lm (validado con mlx-lm 0.32.2 y MLX 0.32.3 en macOS). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 990,5 tok/s de prefill y 90,9 tok/s de decodificación en M3 Max de 64 GB con el prompt y la longitud indicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / plataforma | Notas |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B-MLX-RCO-4.5bpw (este) | 23,97 B totales / ~2 B activos | 131.072 | LFM Open License v1.0 | MLX, Apple Silicon | Cuantización mixta RCO de 4 bits; 17,1 GB de pico |
| LiquidAI/LFM2.5-24B-A2B | 23,97 B totales / ~2 B activos | 131.072 | LFM Open License v1.0 | safetensors (BF16) | Modelo base sin cuantizar; 50,1 GB de pico en la validación |
| Alternativas de tamaño comparable | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de comparación en la información proporcionada |

## Limitaciones y advertencias

- Licencia LFM Open License v1.0: es una licencia "other" que impone condiciones específicas; debe revisarse el archivo `LICENSE` antes de cualquier uso comercial o redistribución.
- El tokenizador omite `<|startoftext|>`; sin ese token de prefijo el modelo degenera, por lo que es obligatorio aplicar la plantilla de chat o prefijar BOS en producción.
- La cuantización introduce una pérdida medible: KL de 0,1532, acuerdo top-1 del 82,0 % y perplejidad de 20,82 frente a 20,61 en BF16. La recuperación media de tareas es del 99,56 %, pero arc_easy (0,953) y winogrande (0,965) caen por debajo de la referencia.
- La asignación de precisión usa la base de datos de error RTN simple al no existir imatrix pública; una build ponderada por imatrix podría mejorar la calidad, según el autor.
- Solo está validado en Apple Silicon con mlx-lm; no hay garantías de funcionamiento en CUDA, ROCm ni otros runtimes.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de seguridad en la información disponible.
- El soporte multilingüe se limita a los seis idiomas declarados (en, ar, zh, fr, de, ja); el rendimiento en otros idiomas no está caracterizado.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria independiente más allá de las métricas del autor.
- No se documenta soporte de tool calling ni de flujos de agentes; no debe asumirse en integraciones que dependan de function calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hermitdave/LFM2.5-24B-A2B-MLX-RCO-4.5bpw
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Liquid AI: https://liquid.ai
- Repositorio RCO (ISTA-DASLab): https://github.com/ISTA-DASLab/RCO
- Paper RCO: arXiv:2605.00649
- mlx-lm: https://github.com/ml-explore/mlx-lm
