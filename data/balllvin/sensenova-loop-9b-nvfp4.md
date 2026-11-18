# balllvin/SenseNova-Loop-9B-NVFP4

## Resumen

SenseNova-Loop-9B-NVFP4 es una compilación cuantizada del modelo base SenseNova-Loop-9B, desarrollado por SenseNova (organización `sensenova` en Hugging Face) y publicado en formato NVFP4 por el usuario `balllvin`. El modelo resuelve el problema de desplegar un transformer de 9B parámetros en hardware con memoria limitada, reduciendo el peso de las capas lineales de atención y MLP del modelo de lenguaje a 4 bits (formato E2M1) con escalas de bloque E4M3 cada 16 columnas de entrada y una escala tensorial fp32 por matriz.

La relevancia de esta versión radica en que no se trata de una cuantización post-entrenamiento convencional, sino de una destilación consciente de la cuantización (QAD, quantization-aware distillation): se entrenó un adaptador LoRA r64 sobre las capas cuantizadas, con forward del delta y divergencia KL respecto al profesor bf16, sobre 241.000 tokens de FineWeb-Edu. El resultado es un checkpoint que, según el autor, decodifica de forma exacta a bf16 y mantiene una perplejidad (NLL en WikiText) de 2,7560 frente a los 2,8198 del profesor bf16.

El modelo conserva en bf16 los embeddings, la LM head, las normas, los routers mHC (que permanecen en fp32) y la torre de visión, por lo que mantiene capacidades multimodales además de generación de texto. El repositorio ocupa 8,9 GB y la licencia es Apache-2.0, lo que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención y MLP lineales cuantizados en NVFP4; incluye routers mHC y torre de visión (no disponibles detalles de capas y dimensión oculta) |
| Parametros totales | 9B (según el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A16: pesos E2M1 de 4 bits, escala de bloque E4M3 cada 16 columnas de entrada, escala tensorial fp32 por matriz; embeddings, LM head, normas, routers mHC (fp32) y torre de visión en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 8,9 GB); carga mediante `load_nvfp4.py` incluido en el repositorio |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B es un transformer de 9B parámetros con componentes multimodales (torre de visión) y routers mHC. La versión NVFP4 sustituye las capas lineales de atención y MLP del modelo de lenguaje por matrices empaquetadas en 4 bits con el formato NVFP4 (E2M1 para los pesos, E4M3 para las escalas de bloque de 16 columnas y fp32 para la escala tensorial por matriz). El resto de componentes se mantiene en bf16, salvo los routers mHC, que permanecen en fp32.

El proceso de cuantización se realizó mediante destilación consciente de la cuantización: se entrenó un adaptador LoRA de rango 64 sobre las capas lineales cuantizadas, con forward del delta y divergencia KL hacia el profesor bf16, usando 241.000 tokens de FineWeb-Edu. El pipeline empleado fue BrainSpa (`packages/brainspa_arc` y `packages/brainspa_snloop`) sobre una única VM spot con RTX PRO 6000. Según el autor, la decodificación de los pesos empaquetados a bf16 es exacta, de modo que las métricas reportadas corresponden al mismo modelo decodificado.

## Capacidades

- Generación de texto autoregresiva en el pipeline `text-generation`.
- Razonamiento y respuesta a preguntas de opción múltiple (se reporta MMLU sobre una porción fija con respuestas por letra).
- Procesamiento multimodal: el checkpoint conserva la torre de visión en bf16, lo que sugiere capacidad de entrada de imágenes (no se detallan las tareas concretas).
- Modo de razonamiento ("thinking"): las evaluaciones de seguridad se realizaron con thinking desactivado, lo que implica que el modelo base dispone de ese modo.
- Comportamiento alineado en seguridad: 95 de 99 prompts dañinos rechazados y 60 de 100 prompts benignos rechazados en el conjunto sellado JailbreakBench+AdvBench.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en GPU de consumo con memoria ajustada: al reducir las capas lineales a 4 bits, el checkpoint de 8,9 GB puede cargarse en GPUs con 12-16 GB de VRAM (por ejemplo, RTX 4080 o RTX 4090) usando el modo `packed=True`, que decodifica por forward y evita materializar los pesos en bf16.
- Servicio de generación de texto en producción con licencia Apache-2.0: permite uso comercial sin restricciones de licencia, integrándose en pipelines de transformers con el script `load_nvfp4.py`.
- Evaluación de alineación y seguridad: el modelo reporta tasas de rechazo sobre JailbreakBench+AdvBench, por lo que puede usarse como referencia en estudios de robustez frente a jailbreaks, comparando el impacto de la cuantización en la tasa de rechazo.
- Procesamiento de documentos con componente visual: la torre de visión en bf16 permite tareas de comprensión de imágenes junto con texto, aunque no se detallan las capacidades exactas.
- Investigación sobre cuantización consciente (QAD): el repositorio documenta el pipeline (LoRA r64, KL al profesor, FineWeb-Edu) y las métricas de NLL, lo que lo convierte en un caso de estudio reproducible para evaluar la degradación de la cuantización NVFP4 en modelos de 9B.
- Prototipado de asistentes conversacionales en entornos con presupuesto de memoria: el formato empaquetado reduce el peso en reposo y permite iterar en una sola GPU sin necesidad de infraestructura multi-GPU.
- Benchmarking de kernels NVFP4: sirve para medir latencia y throughput de decodificación de pesos de 4 bits en hardware Blackwell o compatible, dado que el autor empleó una RTX PRO 6000.

## Benchmarks y rendimiento

| Build | Harmful refused (de 99) | Benign refused (de 100) | MMLU | WikiText NLL |
|---|---:|---:|---:|---:|
| NVFP4 base (QAD) | 95 | 60 | 43,0% | 2,7560 |
| Profesor bf16 (referencia) | no disponible | no disponible | no disponible | 2,8198 |

Las evaluaciones de seguridad usan el conjunto sellado JailbreakBench+AdvBench con decodificación greedy de 96 tokens y thinking desactivado. MMLU se evalúa sobre una porción fija con respuestas por letra. WikiText NLL es la media sobre 24 ventanas de 1.024 tokens. No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: en modo empaquetado (`packed=True`), el checkpoint ocupa 8,9 GB en disco y los pesos de 4 bits se decodifican por forward, por lo que la VRAM necesaria ronda los 10-12 GB incluyendo activaciones y caché KV. En modo decodificado a bf16, el modelo completo requiere aproximadamente 18-20 GB de VRAM.
- GPU recomendadas: RTX PRO 6000 (usada en el pipeline de cuantización), A100 40/80 GB, H100, y GPUs de consumo con al menos 16 GB (RTX 4080, RTX 4090) para el modo empaquetado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con holgura y en RTX 4080 (16 GB) en modo empaquetado; en GPUs de 12 GB puede requerir offloading parcial.
- Opciones de despliegue: transformers con el script `load_nvfp4.py` incluido; el autor no documenta soporte para vLLM, llama.cpp, Ollama o TGI, y el formato NVFP4 empaquetado no es estándar en esas herramientas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-NVFP4 | 9B | no disponible | NVFP4 W4A16 | Apache-2.0 | Hugging Face (balllvin) |
| SenseNova-Loop-9B (base) | 9B | no disponible | bf16 | Apache-2.0 (gated) | Hugging Face (sensenova) |
| Alternativas de 9B cuantizadas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; el conjunto de evaluación de seguridad solo mide tasas de rechazo, no sesgos demográficos o culturales.
- Riesgo de alucinación: no evaluado en la información disponible; la NLL en WikiText (2,7560) indica una perplejidad razonable pero no mide factualidad.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están documentados.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base está marcado como "gated" en Hugging Face, por lo que puede requerir aceptar condiciones de acceso.
- Caveat de producción: el formato NVFP4 empaquetado requiere el script `load_nvfp4.py` y no es compatible de forma nativa con servidores de inferencia estándar (vLLM, TGI, llama.cpp), lo que limita su despliegue directo.
- Tasa de rechazo elevada en prompts benignos (60 de 100), lo que puede degradar la experiencia en aplicaciones conversacionales por falsos positivos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente de las métricas reportadas.
- La cuantización afecta solo a las capas lineales del modelo de lenguaje; la torre de visión y los routers mHC permanecen en bf16/fp32, por lo que el ahorro de memoria es parcial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/balllvin/SenseNova-Loop-9B-NVFP4
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Revisión del modelo base: `329a65f701ba8c48b73c30d0cbaa6f0449733673`
- Script de carga: `load_nvfp4.py` (incluido en el repositorio)
- Paper, blog o demo: no disponibles en la información proporcionada.
