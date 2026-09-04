# Johneeee/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-oQ6e-mtp

## Resumen

Se trata de una cuantización a 6 bits del modelo Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP, desarrollado por DavidAU. La cuantización ha sido realizada por el usuario Johneeee utilizando la herramienta oQ (oMLX), y se distribuye en formato MLX safetensors, orientado a su ejecución en equipos Apple Silicon. El modelo cuenta con aproximadamente 27.800 millones de parámetros y un tamaño de repositorio de 23,7 GB. Su principal objetivo es permitir la ejecución local de un modelo de 27B con un consumo de memoria reducido, manteniendo un rendimiento notable en benchmarks estándar. No se dispone de información pública sobre la arquitectura detallada, la longitud de contexto, los idiomas soportados ni la licencia, lo que limita su uso en entornos productivos sin una evaluación previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (tipo de modelo en metadatos: qwen3_5) |
| Parametros totales | 27.781.427.952 (≈27,8 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 6-bit, group size 64, oQ (oMLX) mixed-precision |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente no está documentada en la información proporcionada. Los metadatos indican un tipo de modelo `qwen3_5`, lo que sugiere una arquitectura Transformer de la familia Qwen, sin especificaciones adicionales. El modelo base, desarrollado por DavidAU, es un fine-tune de un modelo Qwen3.6 de 27B. No se dispone de información sobre los datos de entrenamiento, el número de tokens ni sobre procesos de alineación como RLHF o DPO. La innovación técnica de este repositorio es la cuantización: se aplicó oQ (oMLX) mixed-precision quantization con 6 bits y group size de 64, lo que reduce el tamaño del modelo a 23,7 GB en formato MLX safetensors, optimizado para Apple Silicon.

## Capacidades

- Generación de texto y razonamiento: los benchmarks de la model card indican un 88,0% en MMLU y un 70,0% en MMLU_PRO, lo que sugiere competencia en conocimiento general y razonamiento.
- Generación de código: el 89,6% en HumanEval indica una buena capacidad para tareas de programación.
- Sin soporte documentado de tool calling, agentes, visión, audio ni modo de pensamiento.
- Capacidades multilingües no disponibles.
- El modelo se presenta como "uncensored", lo que implica ausencia de filtros de seguridad, aunque no hay documentación técnica que lo respalde.

## Casos de uso

- Asistente de programación en macOS: el modelo alcanza un 89,6% en HumanEval, lo que lo hace adecuado para tareas de generación y revisión de código. Al estar cuantizado para MLX, puede ejecutarse localmente en equipos Apple Silicon sin necesidad de servidores.
- Análisis de documentación técnica: con un 88,0% en MMLU, puede responder preguntas y resumir documentos extensos. La ventana de contexto no está especificada, por lo que se requiere validación previa antes de usarlo con documentos largos.
- Prototipado de asistentes conversacionales sin restricciones: su naturaleza "uncensored" permite explorar respuestas sin filtros en entornos controlados, útil para investigación en alineación o generación de contenido creativo. No se recomienda para producción sin supervisión.
- Evaluación de técnicas de cuantización: este modelo sirve como caso de estudio para la herramienta oQ (oMLX) y la cuantización a 6 bits en MLX, ya que conserva un rendimiento notable en benchmarks estándar.
- Generación de contenido narrativo: el nombre "Fable-Fusion" sugiere una orientación a narración de historias, aunque no hay documentación oficial. Puede probarse en tareas de escritura creativa, pero requiere evaluación manual.
- Investigación sobre destilación de modelos: la model card discute explícitamente la destilación de modelos propietarios. Este modelo podría utilizarse como ejemplo para estudiar los efectos de la destilación en el comportamiento y el rendimiento, siempre que se respeten las consideraciones legales.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| MMLU | 88,0% |
| MMLU_PRO | 70,0% |
| HumanEval | 89,6% |

Datos extraídos de la model card. No se han publicado comparativas con modelos similares en la información disponible. Tampoco se indican las condiciones de evaluación (prompts, few-shot, etc.), por lo que los resultados deben interpretarse con cautela.

## Requisitos de hardware

- Memoria estimada para inferencia: al menos 24 GB de RAM unificada, dado que el repositorio pesa 23,7 GB. Se recomienda 32 GB o más para dejar margen al contexto y a la aplicación.
- Hardware recomendado: Apple Silicon (M1, M2, M3, M4) con 32 GB o más de memoria unificada. No es compatible con GPUs NVIDIA o AMD en formato MLX.
- No cabe en GPUs de consumo convencionales (por ejemplo, RTX 4090 con 24 GB VRAM) porque MLX está diseñado para Apple Silicon; para usar el modelo en CUDA sería necesario convertir los pesos a GGUF u otro formato.
- Opciones de despliegue: MLX (por ejemplo, mlx-lm, oMLX). También existe una versión GGUF del modelo base (DavidAU/...-NEO-MAX-MTP-GGUF) que permite usar llama.cpp u Ollama en CPU/GPU.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Cuantización | Licencia |
|---|---|---|---|---|
| Johneeee/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-oQ6e-mtp | 27.781.427.952 | MLX safetensors | 6-bit (oQ) | No disponible |
| DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP | No disponible | No disponible | No disponible | No disponible |
| DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF | No disponible | GGUF | No disponible | No disponible |

No se dispone de información suficiente para comparar el rendimiento con otros modelos de la misma categoría.

## Limitaciones y advertencias

- No se ha especificado ninguna licencia, lo que genera incertidumbre sobre el uso comercial y la redistribución.
- La model card incluye afirmaciones sobre destilación de modelos propietarios y posibles infracciones de propiedad intelectual. Esto supone un riesgo legal para su uso en entornos empresariales.
- El modelo se describe como "uncensored", lo que puede implicar la ausencia de filtros de seguridad y una mayor probabilidad de generar contenido dañino o inapropiado. No se han publicado evaluaciones de seguridad.
- No se han publicado evaluaciones de sesgos, alucinaciones ni robustez frente a ataques adversarios.
- La longitud de contexto y los idiomas soportados no están documentados, lo que limita su integración en sistemas multilingües o con dependencias de contexto largo.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que indica una validación comunitaria nula y un riesgo de errores no detectados.

## Enlaces

- https://huggingface.co/Johneeee/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-oQ6e-mtp
- https://huggingface.co/Johneeee/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-oQ5e
- https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- https://github.com/jundot/omlx
