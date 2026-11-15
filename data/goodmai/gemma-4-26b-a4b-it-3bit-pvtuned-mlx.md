# goodmai/gemma-4-26B-A4B-it-3bit-PVTuned-MLX

## Resumen

`goodmai/gemma-4-26B-A4B-it-3bit-PVTuned-MLX` es un checkpoint cuantizado a 3 bits en formato MLX del modelo `google/gemma-4-26B-A4B-it`, publicado por el usuario goodmai. El modelo base es un transformer de tipo Mixture of Experts (MoE) de la familia Gemma 4, con 25.805.936.206 parámetros totales (el tag "A4B" indica aproximadamente 4.000 millones de parámetros activos por token). Esta versión concreta ha sido refinada mediante una técnica propietaria denominada Basalt PV-Tuning, que combina descenso por coordenadas sobre códigos discretos de cuantización con calibración continua de escalas y RMSNorm, aplicando un mecanismo de rollback basado en KL sobre un conjunto de validación.

La relevancia de esta publicación radica en su enfoque de compresión agresiva: reduce el peso de los pesos a 12,62 GB, lo que permite ejecutar un modelo de 26.000 millones de parámetros totales en un Apple M4 Pro con 24 GB de memoria unificada. El autor reporta una perplejidad de 119,62 en WikiText-2 (16k, ventana 4×4096), lo que supone una mejora del 8,7% frente a la cuantización RTN de 3 bits (130,97) y se acerca al profesor QAT de 4 bits (108,54).

El modelo está orientado exclusivamente al ecosistema Apple Silicon mediante la librería MLX y la herramienta Basalt, por lo que su utilidad práctica queda circunscrita a ese hardware. No se han publicado datos sobre idiomas soportados, benchmarks estándar ni detalles del entrenamiento original del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), familia Gemma 4 |
| Parametros totales | 25.805.936.206 |
| Parametros activos | ~4B (según nomenclatura A4B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3-bit MLX Affine (grupo de 64) + Basalt PV-Tuning |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (MLX), 12,2 GB de repositorio |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-26B-A4B-it` es un transformer con arquitectura Mixture of Experts, con 25.805.936.206 parámetros totales y aproximadamente 4.000 millones activos por token (según la convención de nomenclatura "A4B"). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original.

La contribución específica de este checkpoint es el proceso de cuantización y refinamiento. El autor parte de `mlx-community/gemma-4-26B-A4B-it-qat-4bit` (un modelo con Quantization-Aware Training a 4 bits) y aplica `--quantize affine:3:64` junto con `--experimental-pv-tune`. PV-Tuning combina dos fases: (1) descenso por coordenadas sobre los códigos discretos de cuantización y (2) calibración continua de escalas y parámetros RMSNorm, con un mecanismo de rollback monotónico basado en divergencia KL sobre un conjunto de validación retenido. El resultado es un checkpoint de 3 bits que recupera parte de la calidad perdida respecto al profesor de 4 bits.

## Capacidades

- Generación de texto y conversación multi-turno (modelo base con sufijo `-it`, instruction-tuned).
- Razonamiento y matemáticas: capacidades heredadas del modelo base Gemma 4; no se han publicado evaluaciones específicas en esta cuantización.
- Generación de código: no hay datos específicos publicados para esta versión.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el modelo base Gemma 4 es multilingüe, pero no se detallan los idiomas cubiertos.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Ejecución nativa en Apple Silicon mediante MLX y la herramienta Basalt (app macOS y CLI).

## Casos de uso

- Inferencia local en Mac con memoria unificada limitada: con 12,62 GB de pesos, el modelo cabe en un Apple M4 Pro de 24 GB, lo que permite ejecutar un MoE de 26B totales en un portátil sin GPU dedicada. Adecuado para desarrollo y prototipado offline.
- Asistente de chat privado en macOS: la integración con Basalt (`basalt serve --model ... --rest`) permite levantar un servidor REST local para conversaciones sin enviar datos a la nube, útil en entornos con requisitos de privacidad.
- Evaluación de técnicas de cuantización: el checkpoint sirve como referencia reproducible (comando `basalt models convert` incluido) para investigadores que comparan PV-Tuning frente a RTN y QAT en términos de perplejidad y precisión en tareas concretas.
- Pruebas de calidad en tareas de razonamiento simple: el autor reporta 290/300 (96,7%) en "System One Accuracy" con N=300, lo que sugiere viabilidad para tareas de un solo paso, aunque sin detallar el benchmark exacto.
- Desarrollo de aplicaciones macOS nativas con Swift: el botón "Run with Basalt" apunta a una app macOS 27+ y CLI en Swift, lo que facilita integrar el modelo en apps de escritorio sin Python.
- Experimentación con modelos MoE de gran tamaño en hardware de consumo: permite estudiar el comportamiento de un MoE de 26B totales y ~4B activos en un solo equipo, midiendo latencia y throughput reales en Apple Silicon.

## Benchmarks y rendimiento

| Métrica | Valor medido |
|---|---|
| Método | 3-bit MLX Affine + Basalt PV-Tuning (#410 / #486) |
| Huella de pesos | 12,62 GB |
| WikiText-2 16k PPL (4×4096) | 119,62 (−8,7% vs 3-bit RTN 130,97; profesor QAT 4-bit: 108,54) |
| System One Accuracy (N=300) | 290/300 (96,7%) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 12,62 GB solo para pesos; con overhead de contexto y KV cache, se recomienda un mínimo de 16-24 GB de memoria unificada.
- Hardware de referencia del autor: Apple M4 Pro con 24 GB.
- GPU recomendadas: exclusivamente Apple Silicon (M-series) con soporte MLX; no es compatible con CUDA de forma nativa.
- ¿Cabe en GPU de consumo? Sí, en Apple Silicon de gama alta (M4 Pro 24 GB o superior); no aplica a GPUs NVIDIA/AMD convencionales por el formato MLX.
- Opciones de despliegue: Basalt (`basalt serve`), librería MLX; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| goodmai/gemma-4-26B-A4B-it-3bit-PVTuned-MLX | 25,8B totales / ~4B activos | no disponible | 3-bit MLX + PV-Tuning | gemma | MLX / Basalt |
| mlx-community/gemma-4-26B-A4B-it-qat-4bit | 25,8B totales / ~4B activos | no disponible | 4-bit QAT | gemma | MLX |
| google/gemma-4-26B-A4B-it (base) | 25,8B totales / ~4B activos | no disponible | BF16/FP16 | gemma | Transformers, MLX, etc. |

El checkpoint de 3 bits ofrece un 8,7% menos de perplejidad que la cuantización RTN de 3 bits equivalente, pero queda un 10,2% por encima del profesor QAT de 4 bits en WikiText-2. La ventaja principal es la reducción de huella (12,62 GB frente a un 4-bit típicamente mayor), a costa de una ligera pérdida de calidad.

## Limitaciones y advertencias

- Cuantización agresiva a 3 bits: aunque PV-Tuning mitiga la degradación, la perplejidad sigue siendo superior a la del modelo de 4 bits (119,62 frente a 108,54), lo que puede traducirse en mayor tasa de error en tareas complejas.
- Exclusivo de Apple Silicon y MLX: no es desplegable en CUDA, ROCm ni GPUs convencionales sin reconversión.
- Sin datos de benchmarks estándar: no hay resultados de MMLU, HumanEval o GSM8K, por lo que la calidad en código, matemáticas y razonamiento no está verificada de forma independiente.
- Idiomas no especificados: se desconoce el soporte multilingüe efectivo de esta cuantización.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones de factualidad para esta versión.
- Licencia Gemma: sujeta a los Términos de Uso de Gemma de Google, con restricciones de uso comercial y obligaciones de atribución; es necesario revisar las cláusulas antes de un despliegue en producción.
- Modelo derivado: cualquier problema de sesgo o seguridad del modelo base se hereda, y la cuantización puede amplificar comportamientos erráticos.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni reportes independientes de calidad.
- El "System One Accuracy" (96,7%) no especifica el benchmark concreto, por lo que no es comparable con métricas estándar.

## Enlaces

- Hugging Face: https://huggingface.co/goodmai/gemma-4-26B-A4B-it-3bit-PVTuned-MLX
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Modelo de partida (QAT 4-bit): https://huggingface.co/mlx-community/gemma-4-26B-A4B-it-qat-4bit
- Repositorio Basalt: https://github.com/goodmai/basalt
- Demo Basalt (Hugging Face Spaces): https://goodmai-run-with-basalt.hf.space/?model=goodmai%2Fgemma-4-26B-A4B-it-3bit-PVTuned-MLX&role=chat&lang=en
