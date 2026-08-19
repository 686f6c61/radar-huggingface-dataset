# kurakurai/Luth-2-2B

## Resumen

Luth-2-2B es un modelo de lenguaje de pequeño tamaño (SLM) desarrollado por kurakurai, específicamente optimizado para el francés. Se basa en la arquitectura de Qwen3.5-2B, un modelo multimodal de tipo vision-language, aunque Luth-2-2B no ha sido entrenado con datos de visión y está pensado exclusivamente para texto. El modelo destaca por establecer un nuevo estado del arte en francés para su categoría de tamaño en tareas de matemáticas, código, seguimiento de instrucciones, conocimiento general y tool calling.

El entrenamiento se realiza en dos etapas: un fine-tuning supervisado (SFT) sobre un conjunto de 3 mil millones de tokens en francés, seguido de una técnica propia llamada Multi-domain On-Policy Distillation (MOPD), que combina tres especialistas entrenados con GRPO y los destila de vuelta al modelo base. Con 2.213 millones de parámetros totales (según los safetensors), es lo suficientemente pequeño para ejecutarse de forma eficiente en dispositivos locales y de borde, manteniendo un rendimiento competitivo frente a modelos más grandes. La licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen3.5-2B (VLM, solo texto) |
| Parametros totales | 2.213.241.664 (según safetensors); el autor indica 1.88B parámetros text-only |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3.5-2B, no especificada en la documentación) |
| Tipos de cuantizacion | bfloat16 (formato nativo), GGUF (versión cuantizada para CPU) |
| Idiomas soportados | francés (principal), posiblemente otros vía herencia de Qwen, pero no documentado |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (nativo), GGUF (variante separada) |

## Arquitectura y entrenamiento

Luth-2-2B hereda la arquitectura de Qwen3.5-2B, un modelo transformer multimodal (VLM) con atención estándar, aunque no se han publicado detalles sobre el número de capas, cabezas de atención o dimensiones ocultas específicas. El autor lo describe como un modelo de 1.88B parámetros text-only, lo que sugiere que la parte de visión no se utiliza. El entrenamiento se realiza en dos fases:

1. **Supervised fine-tuning (SFT)**: sobre el dataset `Luth-2-Post-Training-SFT`, una mezcla de 3B tokens en francés con la siguiente distribución: matemáticas (37,2%), conocimiento general (27,9%), código (22,2%), seguimiento de instrucciones (6,5%) y tool calling (6,3%). Los prompts fueron traducidos de datasets SFT en inglés y las respuestas regeneradas con modelos profesores de código abierto.

2. **Multi-domain On-Policy Distillation (MOPD)**: se entrenan tres especialistas (matemáticas, código y seguimiento de instrucciones) de forma separada con GRPO sobre el dataset `Luth-2-Post-Training-RL`, y posteriormente se destilan de vuelta al modelo SFT. Esta técnica, descrita en el blog oficial, permite transferir las capacidades de razonamiento de los especialistas sin incurrir en el coste de entrenar un modelo más grande.

El modelo no incluye modo "thinking" (razonamiento explícito) y se recomienda desactivarlo durante la inferencia para obtener los mejores resultados en los benchmarks publicados.

## Capacidades

- Generación de texto en francés con alta calidad en tareas conversacionales y de conocimiento general.
- Razonamiento matemático avanzado para su tamaño, con resultados destacados en MGSM-rev2 (86,52) y Math-500 (81,52).
- Generación de código en múltiples lenguajes, con HumanEval+ de 66,00 y MBPP+ de 57,62.
- Seguimiento de instrucciones robusto, medido con IFEval (75,06) y Multi-IF (69,67).
- Soporte de tool calling / function calling, evaluado con BFCL v2 (68,91), aunque ligeramente inferior al modelo anterior Luth-1.7B-Instruct.
- Capacidades multilingües limitadas: el modelo está entrenado principalmente en francés, aunque hereda la base de Qwen3.5-2B que puede ofrecer algo de inglés y otros idiomas, no documentado.
- No soporta tareas de visión, a pesar de la arquitectura VLM subyacente.
- No es un modelo de razonamiento (non-reasoning), por lo que no genera cadenas de pensamiento explícitas.

## Casos de uso

- Asistente conversacional en francés para atención al cliente: el modelo puede gestionar diálogos multi-turno con naturalidad gracias a su entrenamiento SFT en francés, y su tamaño reducido permite desplegarlo en servidores de bajo coste o en el edge para reducir latencia.
- Generación de código en entornos de producción: con soporte de tool calling y un HumanEval+ de 66,00, puede integrarse en pipelines de CI/CD para autocompletar funciones, generar tests o documentar código, siempre que el equipo trabaje en francés o con comentarios en ese idioma.
- Tutor de matemáticas para educación: su rendimiento en MGSM-rev2 (86,52) y Math-500 (81,52) lo hace adecuado para aplicaciones educativas que expliquen problemas matemáticos paso a paso en francés.
- Clasificación y extracción de información de documentos en francés: gracias a su conocimiento general (Global-MMLU-Lite 64,45) puede procesar y resumir textos legales, médicos o técnicos, aunque con las limitaciones propias de un modelo de 2B.
- Automatización de tareas con herramientas (tool calling): el modelo puede invocar APIs y funciones externas, lo que permite construir agentes simples que consulten bases de datos, envíen correos o interactúen con servicios web, todo en francés.
- Despliegue en dispositivos de borde o móviles: con la versión GGUF y un tamaño de ~2B parámetros, puede ejecutarse en CPUs de portátiles o incluso en algunos móviles de gama alta, permitiendo asistentes offline en francés.

## Benchmarks y rendimiento

La model card publica resultados en benchmarks franceses (subconjuntos o traducciones verificadas), evaluados con `temperature=0.6, top_p=0.95, top_k=20`, thinking desactivado y promediados sobre 10 ejecuciones. Se comparan con Luth-1.7B-Instruct (modelo anterior) y Qwen3.5-2B (base).

| Benchmark | Luth-2-2B | Luth-1.7B-Instruct | Qwen3.5-2B |
|---|---:|---:|---:|
| MGSM-rev2 | **86,52** | 75,72 | 64,60 |
| AIME 24 | **17,00** | 10,33 | 11,67 |
| AIME 25 | **19,00** | 7,00 | 6,67 |
| Math-500 | **81,52** | 65,26 | 65,06 |
| Global-MMLU-Lite | **64,45** | 58,00 | 58,00 |
| MMLU-ProX-Lite | **55,24** | 41,10 | 47,20 |
| GPQA-Diamond | **41,97** | 30,20 | 36,80 |
| IFEval | **75,06** | 64,47 | 61,91 |
| Multi-IF | **69,67** | 46,05 | 45,38 |
| HumanEval+ | **66,00** | 56,44 | 37,56 |
| MBPP+ | **57,62** | 56,40 | 42,12 |
| BFCL v2 | 68,91 | **71,05** | 51,78 |

Luth-2-2B supera a ambos modelos en la mayoría de las métricas, excepto en BFCL v2, donde Luth-1.7B-Instruct obtiene un resultado ligeramente superior. Los resultados completos están disponibles en el French LLM Leaderboard.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2.213 millones de parámetros en bfloat16, el modelo ocupa aproximadamente 4,4 GB de memoria (tamaño del repo). En cuantización GGUF de 4 bits, puede reducirse a ~1,5-2 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM puede ejecutar el modelo en bf16 (por ejemplo, RTX 3060, RTX 4060, T4). Para cuantización GGUF, basta con CPU con 4 GB de RAM.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama media y baja, así como en Apple Silicon (M1/M2/M3) mediante llama.cpp.
- Opciones de despliegue: Transformers (HuggingFace), vLLM, SGLang, llama.cpp (vía GGUF), Ollama (si se añade a la biblioteca de modelos).
- Latencia y throughput: no disponible en la documentación. Con un modelo de este tamaño, se espera una latencia de decenas de milisegundos por token en GPU moderna y de ~100-200 ms/token en CPU con cuantización.

## Comparativa con modelos similares

La tabla de benchmarks ya incluye comparación con Luth-1.7B-Instruct y Qwen3.5-2B. A continuación se resumen las diferencias principales:

| Modelo | Parametros | Contexto | Idioma principal | Licencia | Rendimiento general |
|---|---|---|---|---|---|
| Luth-2-2B | 2.213M | no disponible | francés | Apache 2.0 | Superior en casi todos los benchmarks |
| Luth-1.7B-Instruct | ~1.7B | no disponible | francés | Apache 2.0 | Inferior en la mayoría, mejor en BFCL v2 |
| Qwen3.5-2B | ~2B | no disponible | multilingüe (inglés, chino, etc.) | Apache 2.0 | Inferior en francés, pero más versátil en idiomas |

Luth-2-2B es claramente superior a su predecesor y a la base de Qwen en tareas en francés, a costa de especializarse en un solo idioma. Para aplicaciones multilingües, Qwen3.5-2B original sería más adecuado.

## Limitaciones y advertencias

- Especialización exclusiva en francés: aunque hereda la base de Qwen, el entrenamiento se centra en francés, por lo que el rendimiento en otros idiomas (especialmente español, inglés o chino) no está garantizado y probablemente sea inferior.
- No soporta tareas de visión: a pesar de usar la arquitectura VLM de Qwen3.5-2B, el modelo no ha sido entrenado con datos visuales y no debe usarse para entrada de imágenes.
- Sin modo de razonamiento explícito: al ser un modelo non-reasoning, no genera cadenas de pensamiento, lo que puede limitar su capacidad para problemas complejos que requieran pasos intermedios (aunque los benchmarks muestran buen rendimiento en matemáticas).
- Riesgo de alucinación: como cualquier SLM, puede generar información falsa o inventada, especialmente en dominios de conocimiento especializado. Se recomienda validación humana en aplicaciones críticas.
- Longitud de contexto no documentada: no se especifica la ventana de contexto máxima, lo que dificulta planificar su uso en tareas de documentos largos.
- Datos de entrenamiento no publicados en detalle: aunque se indican los porcentajes por dominio, no se detalla la composición exacta ni el origen de los datos traducidos, lo que limita la auditoría de sesgos.
- Dependencia de Qwen3.5-2B: al ser un fine-tuning, hereda posibles sesgos del modelo base, aunque no se han publicado análisis específicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kurakurai/Luth-2-2B
- Variante GGUF: https://huggingface.co/kurakurai/Luth-2-2B-GGUF
- Modelo Luth-2-0.8B: https://huggingface.co/kurakurai/Luth-2-0.8B
- Blog técnico (MOPD): https://huggingface.co/blog/MaxLSB/luth-2
- Dataset SFT: https://huggingface.co/datasets/kurakurai/Luth-2-Post-Training-SFT
- Dataset RL: https://huggingface.co/datasets/kurakurai/Luth-2-Post-Training-RL
- Repositorio de código: https://github.com/kurakurai/Luth-2
- French LLM Leaderboard: https://huggingface.co/spaces/kurakurai/llm_leaderboard_fr
