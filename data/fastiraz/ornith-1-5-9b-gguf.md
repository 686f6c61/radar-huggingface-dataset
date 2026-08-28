# Fastiraz/Ornith-1.5-9B-GGUF

## Resumen

Ornith-1.5-9B es un modelo de lenguaje denso de 9 000 millones de parámetros desarrollado por el equipo de ornith-ai, diseñado específicamente para tareas de agente, razonamiento y generación de código. Forma parte de la familia Ornith-1.5, que introduce un bucle de auto-mejora integral: el propio modelo genera nuevas tareas de entrenamiento, construye los andamiajes (scaffolds) necesarios para resolverlas y produce rollouts de soluciones que se utilizan para refinar la política mediante aprendizaje por refuerzo. Este enfoque, heredado y ampliado de Ornith-1.0, permite que el modelo mejore continuamente sin depender de conjuntos de tareas fijos creados por humanos.

La versión GGUF aquí documentada es una cuantización del modelo original, pensada para facilitar su despliegue en hardware de consumo y en entornos con recursos limitados, incluyendo dispositivos móviles mediante la variante Ornith-1.5-9B-Mobile. El modelo base se construyó sobre las arquitecturas de Qwen3.5 y Gemma4, con etapas adicionales de preentrenamiento continuado, entrenamiento intermedio y post-entrenamiento. En los benchmarks publicados, Ornith-1.5-9B supera a su predecesor Ornith-1.0-9B en tareas de código y agente, y compite favorablemente con modelos mucho más grandes como Qwen3.6-35B-A3B y Gemma-4-31B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.5 y Gemma4) |
| Parametros totales | 9 197 093 888 (9,2 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (variantes no especificadas) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Ornith-1.5-9B es un modelo transformer denso, sin mezcla de expertos, que parte de las arquitecturas de Qwen3.5 y Gemma4. Sobre esa base se aplicaron etapas de preentrenamiento continuado, entrenamiento intermedio y post-entrenamiento. La innovación principal reside en el bucle de auto-mejora: el modelo genera sus propias tareas de entrenamiento, diseña los andamiajes (scaffolds) específicos para cada tarea y produce rollouts de soluciones que alimentan el aprendizaje por refuerzo. Este ciclo reemplaza el enfoque anterior de optimización de scaffolds y rollouts por una optimización conjunta de generación de tareas, construcción de scaffolds y generación de soluciones. No se han publicado detalles sobre el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto y razonamiento de propósito general, con especial énfasis en tareas de agente y codificación.
- Ejecución de tareas agénticas multi-paso: según los benchmarks, maneja entornos de terminal y resolución de problemas de software (SWE-bench).
- Soporte de tool calling y function calling: no se menciona explícitamente, pero su perfil agéntico sugiere que es compatible; no confirmado en la documentación disponible.
- Capacidades multilingües: no especificadas.
- Modo de razonamiento o thinking: no se menciona.

## Casos de uso

- Asistente de programación en entornos de terminal: el modelo puede interpretar comandos, generar scripts y resolver tareas de administración de sistemas, como demuestra su rendimiento en Terminal-Bench 2.1.
- Resolución de issues en repositorios de código: con un 70,6 % en SWE-bench Verified, puede proponer parches y soluciones para problemas reales de GitHub, integrándose en flujos de desarrollo.
- Agente autónomo para pipelines de CI/CD: su capacidad para razonar sobre múltiples pasos y ejecutar acciones lo hace adecuado para automatizar tareas de integración continua, como ejecutar tests, corregir errores y actualizar dependencias.
- Despliegue en dispositivos edge o móviles: gracias a su tamaño compacto y a la cuantización GGUF, puede ejecutarse en hardware limitado, permitiendo asistentes de código locales sin conexión.
- Generación de documentación técnica y explicaciones de código: su entrenamiento en código y razonamiento le permite producir comentarios, guías y resúmenes de fragmentos complejos.
- Prototipado rápido de agentes conversacionales: al ser ligero y con licencia MIT, sirve como base para experimentos de investigación y desarrollo de agentes sin coste de licencia.

## Benchmarks y rendimiento

La tabla siguiente recoge los resultados publicados en la model card del autor. Se comparan con modelos de referencia de tamaño similar o superior.

| Benchmark | Ornith-1.5-9B | Ornith-1.0-9B | Qwen3.5-9B | Qwen3.6-35B-A3B | Gemma-4-31B |
|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 46,2 | 43,1 | 21,3 | 52,5 | 42,1 |
| Terminal-Bench 2.1 (Claude Code) | 47,0 | 40,6 | 18,9 | 49,2 | - |
| SWE-bench Verified | 70,6 | 69,4 | 53,2 | 73,4 | 52,0 |
| SWE-bench Pro | 47,5 | 42,9 | 31,3 | 49,5 | 35,7 |

No se han publicado resultados de benchmarks generales como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 9,2 B parámetros en GGUF, se estima entre 5-6 GB con cuantización Q4_K_M, 7-8 GB con Q5_K_M y 9-10 GB con Q8_0. Estos valores son orientativos y dependen de la longitud de contexto y del backend.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4070) puede ejecutar cuantizaciones bajas. Para cuantizaciones altas o contexto largo, se recomienda 12-16 GB (RTX 4080, RTX 4090, A10, L4).
- En consumer GPU: sí, cabe en GPUs de gama media con cuantización Q4 o Q5.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio y servidores como vLLM (con conversión a safetensors). También se puede usar con transformers si se descargan los pesos originales.
- Latencia y throughput: no se han publicado datos oficiales. En una RTX 4090, se puede esperar una velocidad de generación de 40-60 tokens/s con Q4_K_M, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Verified | Licencia |
|---|---|---|---|---|
| Ornith-1.5-9B | 9,2 B | No disponible | 70,6 | MIT |
| Ornith-1.0-9B | 9 B aprox. | No disponible | 69,4 | MIT |
| Qwen3.5-9B | 9 B aprox. | No disponible | 53,2 | Apache 2.0 (presumible) |
| Qwen3.6-35B-A3B | 35 B total, 3 B activos | No disponible | 73,4 | Apache 2.0 (presumible) |

Ornith-1.5-9B supera claramente a Qwen3.5-9B en tareas de código y agente, y se acerca a modelos MoE mucho más grandes como Qwen3.6-35B-A3B, con una fracción de los parámetros activos. Su licencia MIT facilita su uso comercial sin restricciones.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero al estar entrenado principalmente en datos de código y razonamiento, puede tener un rendimiento inferior en tareas de conocimiento general o creatividad.
- Riesgo de alucinación: como todo modelo generativo, puede producir respuestas plausibles pero incorrectas, especialmente en contextos fuera de su dominio principal.
- Longitud de contexto no especificada: se desconoce el límite máximo de tokens de entrada, lo que puede limitar su uso en tareas que requieran documentos largos.
- Idiomas soportados no documentados: no se garantiza un rendimiento multilingüe robusto.
- La cuantización GGUF puede degradar ligeramente la precisión en comparación con los pesos completos, aunque los benchmarks presentados se refieren al modelo sin cuantizar.
- No hay garantías de soporte a largo plazo ni de mantenimiento por parte del autor original, al ser un modelo de investigación.

## Enlaces

- Repositorio GGUF (Fastiraz): https://huggingface.co/Fastiraz/Ornith-1.5-9B-GGUF
- Repositorio GGUF oficial (ornith-ai): https://huggingface.co/ornith-ai/Ornith-1.5-9B-GGUF
- Modelo original (ornith-ai): https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Blog técnico de Ornith-1.5: https://ornith.ai/ornith_1_5.html
