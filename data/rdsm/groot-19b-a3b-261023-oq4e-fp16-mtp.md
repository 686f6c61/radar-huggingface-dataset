# rdsm/Groot-19B-A3B-261023-oQ4e-fp16-mtp

## Resumen

Groot-19B-A3B-261023-oQ4e-fp16-mtp es una versión cuantizada en formato MLX del modelo base GrootTeam/Groot-19B-A3B-261023, publicada por el usuario rdsm en Hugging Face. El modelo base es un modelo de lenguaje con arquitectura MoE (mixture of experts) de 19,4 mil millones de parámetros totales, de los cuales aproximadamente 3 mil millones están activos por token (según la convención de nomenclatura "A3B"), y además incorpora un componente de visión y una cabeza MTP (multi-token prediction) para acelerar la decodificación.

Esta variante cuantizada emplea la herramienta oQ (oMLX v0.7.3.dev2), que aplica cuantización de precisión mixta con un promedio efectivo de 5,294 bits/peso, reduciendo el checkpoint completo a unos 12,9 GB. Según los benchmarks publicados por el propio autor de la cuantización, esta versión no solo conserva el rendimiento del modelo completo, sino que lo iguala o supera en casi todas las pruebas evaluadas, siendo hasta dos veces más rápida en tareas como GSM8K y MMLU-Pro. Es relevante para usuarios del ecosistema Apple Silicon (MLX) que buscan un modelo MoE compacto y rápido con capacidades multimodales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE tipo Qwen3.5 (qwen3_5_moe), con componente de visión y cabeza MTP |
| Parámetros totales | 19.432.294.256 (19,43 B) |
| Parámetros activos | no disponible (el nombre "A3B" sugiere ~3 B activos por token, pero no está confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Precisión mixta: Affine 4-bit (92,47 %), 5-bit (1,83 %), 6-bit (0,01 %), 8-bit (3,28 %), FP16 (0,11 %), FP32 (2,30 %); media efectiva 5,294 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo base, Groot-19B-A3B-261023, pertenece a la familia de arquitecturas etiquetadas como `qwen3_5_moe`, lo que indica una arquitectura transformer con enrutado MoE (mixture of experts) derivada de la línea Qwen 3.5. Al ser un modelo MoE, activa solo un subconjunto de expertos por token, lo que permite un coste de inferencia cercano al de un modelo denso de ~3 B de parámetros manteniendo la capacidad de uno de ~19 B. El checkpoint incluye tres componentes: el modelo de lenguaje (18,544 B de parámetros), un módulo de visión (0,447 B, lo que confirma capacidades multimodales) y una cabeza MTP (multi-token prediction, 0,442 B) que habilita decodificación especulativa de varios tokens por paso.

Sobre los datos de entrenamiento, el número de tokens, la composición del dataset y el uso de técnicas como RLHF o DPO no están disponibles en la información publicada. De hecho, el propio autor de la cuantización señala que no encontró información sobre los creadores de GrootTeam, lo que añade incertidumbre sobre el origen y el proceso de entrenamiento del modelo base.

La cuantización fue realizada con oQ (oMLX), una herramienta de cuantización de precisión mixta que asigna dinámicamente distintos niveles de bits a cada tensor: la gran mayoría de los pesos (92,47 %) se almacenan en 4 bits con grupos de 64, mientras que los tensores más sensibles (embeddings, componentes de visión y FP32 residual) conservan mayor precisión, con un 2,3 % de pesos en FP32 y un 3,28 % en 8 bits. Esta estrategia explica que la variante cuantizada mantenga o mejore las puntuaciones del modelo completo.

## Capacidades

- Generación de texto y razonamiento general, con soporte de modo thinking (los benchmarks se ejecutaron con thinking deshabilitado, lo que confirma que el modelo dispone de esta modalidad).
- Razonamiento matemático: 96 % en GSM8K en la variante cuantizada.
- Conocimiento general y razonamiento académico: 63 % en MMLU y 61 % en MMLU-Pro.
- Capacidades de visión: el checkpoint incluye un módulo de visión de 0,447 B de parámetros, lo que habilita la comprensión de imágenes.
- Decodificación acelerada mediante la cabeza MTP (multi-token prediction), que permite predicción especulativa de varios tokens y explica las mejoras de velocidad de ~2x observadas en los benchmarks.
- Veracidad y resistencia a mitos comunes: 78 % en TruthfulQA.
- Soporte de tool calling, function calling y capacidades de agentes: no disponible (no se documenta en la model card).
- Capacidades multilingües: no disponible.

## Casos de uso

- Razonamiento matemático y resolución de problemas en local: con un 96 % en GSM8K y tiempos de respuesta rápidos, es adecuado para asistentes de matemáticas, verificación de cálculos y generación de soluciones paso a paso en entornos educativos.
- Asistente de conocimiento general en Apple Silicon: gracias al formato MLX y a los ~12,9 GB del checkpoint, puede ejecutarse en Macs con suficiente memoria unificada, ofreciendo respuestas a preguntas generales con buen rendimiento en MMLU-Pro.
- Comprensión de documentos e imágenes: el módulo de visión integrado permite construir aplicaciones de análisis de capturas, gráficos o documentos escaneados sin depender de un segundo modelo de visión.
- Generación de texto a alta velocidad: la cabeza MTP y la cuantización mixta hacen que el modelo sea notablemente más rápido que el original (por ejemplo, 73,2 s frente a 133,4 s en GSM8K), lo que lo hace apto para chat interactivo y generación de borradores en tiempo real.
- Prototipado de agentes con razonamiento extenso: el buen rendimiento en MMLU-Pro (61 %) y el modo thinking sugieren utilidad en tareas multi-paso, aunque el soporte explícito de tool calling no está documentado y habría que verificarlo empíricamente.
- Evaluación y comparación de cuantizaciones: al tratarse de una cuantización con benchmarks de degradación publicados, sirve como referencia para estudiar el impacto de la cuantización de precisión mixta en modelos MoE.
- Despliegue en entornos con recursos limitados: con ~12 GB de pesos, cabe en GPUs de consumo o en la memoria unificada de portátiles, facilitando pruebas locales sin infraestructura de servidor.

## Benchmarks y rendimiento

Datos publicados por el autor de la cuantización, ejecutados con thinking deshabilitado y con el objetivo de verificar la ausencia de degradación por cuantización (no como comparativa con otros modelos):

| Benchmark | Groot-19B-A3B-261023-oQ4e-fp16-mtp | Groot-19B-A3B-261023 (modelo completo) |
|---|---|---|
| GSM8K | 96,0 % (96/100) · 73,2 s | 94,0 % (94/100) · 133,4 s |
| ARC-Challenge | 85,0 % (85/100) · 12,6 s | 85,0 % (85/100) · 18,3 s |
| MMLU | 63,0 % (63/100) · 40,0 s | 65,0 % (65/100) · 51,8 s |
| TruthfulQA | 78,0 % (78/100) · 15,0 s | 77,0 % (77/100) · 15,3 s |
| MMLU-Pro | 61,0 % (61/100) · 222,7 s | 57,0 % (57/100) · 416,1 s |

La variante cuantizada es más rápida en todos los benchmarks (aproximadamente 2x en GSM8K y MMLU-Pro) e iguala o supera las puntuaciones del modelo completo en todos los casos salvo una pequeña caída en MMLU (63,0 frente a 65,0).

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: el checkpoint ocupa 12,9 GB (11,976 GiB); se recomienda disponer de al menos 16 GB de memoria disponible para el modelo más la caché de contexto y el overhead de ejecución.
- GPU recomendadas: al ser un modelo en formato MLX, está orientado a Apple Silicon; funciona bien en Macs con chip M-series y 24 GB de memoria unificada o más. Para ejecutarlo en CUDA habría que convertirlo a otro formato (por ejemplo GGUF), ya que este repositorio es específico de MLX.
- Consumer GPUs: en su formato nativo MLX no aplica a GPUs NVIDIA; en Macs, modelos de 24 GB de memoria unificada (M2 Pro, M3 Pro, M4 Pro o superiores) deberían poder ejecutarlo con holgura.
- Opciones de despliegue: MLX (mediante oMLX o mlx-lm). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en este repositorio concreto.
- Latencia y throughput: no se publican cifras absolutas de tokens/s, pero los tiempos de benchmark indican que la variante cuantizada es entre 1,4x y 1,9x más rápida que el modelo completo en FP (por ejemplo, 73,2 s frente a 133,4 s en GSM8K y 222,7 s frente a 416,1 s en MMLU-Pro).

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Groot-19B-A3B-261023-oQ4e-fp16-mtp | 19,43 B | ~3 B (no confirmado) | no disponible | Apache 2.0 | MLX, safetensors |
| Qwen3-30B-A3B | 30,5 B | 3,3 B | 32k (128k con YaRN) | Apache 2.0 | HF, GGUF, MLX |
| Qwen3-4B (denso, coste similar) | 4 B | 4 B | 32k (128k con YaRN) | Apache 2.0 | HF, GGUF, MLX |
| Phi-4-mini (denso, coste similar) | 3,8 B | 3,8 B | 128k | MIT | HF, GGUF |

Nota: la comparativa se basa en datos públicos de los modelos alternativos; para Groot no hay datos oficiales de contexto ni de parámetros activos, y los benchmarks publicados para la cuantización no son comparables directamente con los de otros modelos por diferencias de metodología (subconjuntos de 100 muestras, thinking deshabilitado).

## Limitaciones y advertencias

- Origen poco documentado: el propio autor de la cuantización advierte que no encontró información sobre los creadores de GrootTeam (GrootTeam), por lo que no hay model card oficial, detalles de entrenamiento ni evaluaciones independientes del modelo base. Verifica las salidas antes de confiar en ellas.
- Riesgo de alucinación: sin información sobre el proceso de entrenamiento ni alineación (RLHF/DPO), el riesgo de alucinaciones no puede evaluarse; los benchmarks sugieren un rendimiento razonable (TruthfulQA 78 %), pero son autoevaluaciones con muestras pequeñas (100 casos por benchmark).
- Sesgos conocidos: no disponibles; al desconocerse el dataset de entrenamiento, no es posible caracterizar sesgos.
- Longitud de contexto: no documentada; no asumas ventanas largas sin verificarla empíricamente.
- Capacidades multimodales: aunque el checkpoint incluye un módulo de visión, no hay documentación sobre cómo usarlo ni sobre su rendimiento en benchmarks de visión.
- Idiomas: no se especifican los idiomas soportados; el rendimiento en castellano es desconocido.
- Ecosistema: el formato MLX limita el despliegue a Apple Silicon; para otros entornos sería necesaria una conversión de formato.
- Licencia: Apache 2.0 permite uso comercial sin restricciones relevantes, aunque la procedencia del modelo base y sus datos de entrenamiento no están documentados, lo que puede ser un riesgo legal o de compliance en producción.
- Los benchmarks publicados usan solo 100 muestras por prueba, por lo que tienen un margen de error considerable (±4-5 puntos porcentuales).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rdsm/Groot-19B-A3B-261023-oQ4e-fp16-mtp
- Modelo base: https://huggingface.co/GrootTeam/Groot-19B-A3B-261023
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
