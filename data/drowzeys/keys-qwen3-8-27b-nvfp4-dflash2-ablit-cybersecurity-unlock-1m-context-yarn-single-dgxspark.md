# drowzeys/keys-Qwen3.8-27B-NVFP4-DFlash2-Ablit-Cybersecurity-Unlock-1M-Context-YARN-Single-DGXSpark

## Resumen

El modelo `keys-Qwen3.8-27B-NVFP4-DFlash2-Ablit-Cybersecurity-Unlock-1M-Context-YARN-Single-DGXSpark` es una compilación comunitaria creada por `drowzeys` a partir del checkpoint `Qwen/Qwen3.8-27B`. Añade cuantización NVFP4 (coma flotante de 4 bits), una ventana de contexto de 1 millón de tokens mediante YARN y decodificación especulativa con DFlash2. El modelo ha sido sometido a abliteración (`abliterated`), una técnica que modifica las activaciones para eliminar patrones de rechazo de contenido, y está orientado a ciberseguridad (`Cybersecurity Unlock`). Su licencia es Apache 2.0, su acceso en HuggingFace es restringido (`gated`) y está optimizado para plataformas NVIDIA DGX Spark.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (serie Qwen3.8, detalles adicionales no disponibles) |
| Parámetros totales | 27B |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | 1 000 000 tokens (1M) mediante YARN |
| Tipos de cuantización | NVFP4 (4 bits) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible explícitamente; librería vLLM |

## Arquitectura y entrenamiento

El modelo parte del modelo denso `Qwen/Qwen3.8-27B` desarrollado por QwenLM. Sobre este checkpoint se aplica una cuantización NVFP4 que reduce los pesos a 4 bits, lo que facilita la inferencia en entornos locales como DGX Spark. La técnica de abliteración (`abliterated`) modifica la activación del modelo para eliminar los patrones de rechazo de contenido, mientras que el ajuste `Cybersecurity Unlock` añade un enfoque específico para tareas de seguridad informática. La extensión de contexto se implementa con YARN para alcanzar 1 millón de tokens, y se integra DFlash2 para decodificación especulativa.

No se dispone de datos públicos sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni si se aplicó RLHF o DPO en esta compilación.

## Capacidades

- Generación de texto en inglés con enfoque en ciberseguridad y análisis de código.
- Razonamiento sobre contextos largos de hasta 1 millón de tokens.
- Inferencia acelerada mediante decodificación especulativa DFlash2 en vLLM.
- Modelo "uncensored" tras la abliteración: responde sin los rechazos o negativas habituales.
- Soporte de tool calling y agentes: no disponible en la información proporcionada.
- Capacidades multilingües: únicamente se declara inglés.

## Casos de uso

- Auditoría de repositorios de código: con la ventana de 1 millón de tokens, el modelo puede analizar proyectos completos en busca de vulnerabilidades comunes (inyección de SQL, desbordamientos de búfer, etc.).
- Análisis forense de logs de seguridad: procesar logs extensos de sistemas de detección de intrusiones para identificar patrones de ataque.
- Generación de informes de incidentes: redactar cronologías y recomendaciones técnicas a partir de datos de incidentes.
- Pruebas de penetración (pentesting) asistidas: generar exploits y payloads para entornos controlados de evaluación.
- Investigación de malware: describir el comportamiento de muestras desconocidas y proponer medidas de mitigación.
- Formación y divulgación en ciberseguridad: elaborar explicaciones técnicas de CVEs, técnicas de ataque y defensa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Tampoco se aportan comparativas contra el modelo base o contra otros modelos de la misma categoría en cuanto a MMLU, HumanEval, GSM8K, etc.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. La cuantización NVFP4 sobre 27B sugiere una huella aproximada de 14-18 GB, más espacio para la caché KV y el modelo auxiliar de decodificación especulativa.
- GPU recomendadas: NVIDIA DGX Spark (GB10) por el nombre del modelo; también compatible con GPUs de centro de datos como A100 o H100 y con GPUs de consumo de 16-24 GB, aunque no está confirmado.
- Cabe en consumer GPU: probablemente en NVIDIA RTX 4090 (24 GB) con cuantización NVFP4, sin confirmación oficial.
- Opciones de despliegue: vLLM (librería indicada). No se mencionan compatibilidades con Ollama o llama.cpp.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia |
|---|---|---|---|---|
| `Qwen/Qwen3.8-27B` (base) | 27B | No disponible | No disponible (original) | Apache 2.0 |
| `unsloth/Qwen3.8-27B-NVFP4` | 27B | No disponible | NVFP4 | Apache 2.0 |
| `keys-Qwen3.8-27B-NVFP4-DFlash2-Ablit-...` | 27B | 1M (YARN) | NVFP4 + DFlash2 + abliteración | Apache 2.0 |

Además, el modelo indicado añade abliteración, enfoque en ciberseguridad y acceso gated. No hay benchmarks comparativos publicados.

## Limitaciones y advertencias

- Al ser un modelo "uncensored" con abliteración, existe riesgo de generar contenido ofensivo o peligroso si no se emplea en entornos controlados.
- La ausencia de datos de entrenamiento imposibilita evaluar el sesgo y la confiabilidad del modelo.
- Solo se declara soporte para inglés, lo que limita su uso en contextos multilingües.
- El acceso gated en HuggingFace puede ralentizar la adopción y requiere aceptar términos.
- Es una compilación comunitaria: no hay garantías de mantenimiento ni soporte oficial por parte de QwenLM.
- En producción, se recomienda una capa de validación externa, dada la posible generación de contenido falso o alucinado.

## Enlaces

- Página del modelo: https://huggingface.co/drowzeys/keys-Qwen3.8-27B-NVFP4-DFlash2-Ablit-Cybersecurity-Unlock-1M-Context-YARN-Single-DGXSpark
- Repositorio de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Cuantización NVFP4 de unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
