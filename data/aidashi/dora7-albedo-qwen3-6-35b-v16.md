# AIdashi/dora7-albedo-qwen3.6-35b-v16

## Resumen

Este modelo es un fine-tune de la serie Qwen 3.6 en su variante MoE de 35B parámetros, desarrollado por AIdashi sobre el modelo base `dendriteholdings/albedo-qwen3.6-35b-king-genesis`. Se presenta como un "challenger local" para el benchmark SN97, con un pipeline de entrenamiento que combina SFT en cadena (v8-v11, v13/v15) y un paso final de DPO (v16) aplicado sobre prefijos de fallos en vivo, como dobles envíos vacíos o errores de comandos `sed && echo`. El modelo es multimodal (imagen-texto) y hereda las capacidades agentic y de preservación del modo de pensamiento de la familia Qwen3.6.

Con 34.66B parámetros totales y una arquitectura MoE que activa aproximadamente 3B por token, ofrece una ventana de contexto de 256K tokens y licencia Apache 2.0. Es relevante ahora porque representa un fine-tune especializado en depuración de errores de código y fallos de ejecución, orientado a un nicho concreto de desarrollo de agentes y herramientas de línea de comandos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con vision, basada en Qwen3.6 |
| Parametros totales | 34.660.610.688 (35B) |
| Parametros activos | ~3B por token (A3B) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | no disponible (repo con pesos safetensors en FP16/BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo usa una arquitectura de Mixture of Experts (MoE) con un total de 35B parámetros, de los cuales se activan aproximadamente 3B por token, lo que permite una inferencia eficiente comparada con modelos densos de tamaño similar. Es multimodal, acepta tanto texto como imágenes como entrada (pipeline image-text-to-text), y está diseñado para tareas de razonamiento y generación de código. La arquitectura subyacente es la de Qwen3.6, que introduce mejoras en agentic coding y preservación del modo de pensamiento (thinking mode) respecto a versiones anteriores.

El entrenamiento se describe como una cadena de etapas: partiendo de un modelo base (`albedo-qwen3.6-35b-king-genesis`), se aplicaron SFT en las versiones v8-v11, seguidas de SFT encadenado en v13/v15, y finalmente un paso de DPO en la versión v16 centrado en "prefijos de fallos en vivo", es decir, casos de error comunes en ejecución de comandos y herramientas de línea de comandos. El autor indica que la versión v17 presenta una regresión por un sobreajuste en DPO, por lo que recomienda v16 o v11 para calidad de duelo. No se especifican datos concretos sobre el tamaño del dataset ni la composición exacta.

## Capacidades

- Generación de texto y razonamiento avanzado, heredado de la familia Qwen3.6.
- Generación de código y agentic coding, con soporte para depuración de fallos en comandos de shell y herramientas Unix (por ejemplo, `sed`, `grep`).
- Soporte de tool calling / function calling, permitiendo integración en pipelines de agentes.
- Capacidades multimodales: entrada de imagen y texto (image-text-to-text), lo que permite análisis visual y respuestas contextualizadas.
- Preservación del modo de pensamiento (thinking mode), útil para tareas que requieren razonamiento multi-step.
- Soporte de conversaciones multi-turno con contexto largo de hasta 256K tokens.
- Multilingüe probablemente, aunque los idiomas concretos no están documentados.

## Casos de uso

- Depuración de scripts de shell: el modelo está entrenado específicamente en prefijos de fallos como `sed && echo` o `grep-is-not-work`, por lo que puede identificar y corregir errores en pipelines de comandos.
- Automatización de herramientas CLI: puede integrarse en asistentes de terminal que detectan fallos de ejecución y proponen correcciones.
- Agente de desarrollo en entornos CI/CD: con soporte de tool calling y contexto largo, puede gestionar logs de build, detectar errores y sugerir parches.
- Asistente multimodal para documentación técnica: dado su pipeline imagen-texto, puede analizar capturas de pantalla de errores o diagramas de arquitectura y generar explicaciones.
- Análisis de datos y razonamiento matemático: el modelo base Qwen3.6 es fuerte en tareas de razonamiento, por lo que puede usarse en notebooks o entornos de análisis.
- Chat conversacional con memoria extendida: con 256K de contexto, puede mantener largas conversaciones de soporte técnico sin perder el hilo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El README menciona una evaluación propia: "Policy one-turn eval 22/30", lo que indica un acierto de 22 sobre 30 en una tarea de política de una sola vuelta, pero no se detalla la naturaleza de esta evaluación ni se compara con otros modelos. No se deben inferir métricas adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: dado el tamaño del repo (69.3 GB) y la arquitectura MoE con 3B activos, es necesario cargar los pesos completos en memoria. Con cuantización FP16/BF16, se requieren aproximadamente 70 GB de VRAM. Con cuantización INT8, alrededor de 35 GB; con INT4, unos 18-20 GB.
- GPU recomendadas: para ejecución sin cuantización, GPUs de nivel profesional como A100 (80 GB) o H100 (80 GB). Con cuantización INT4, puede caber en una RTX 4090 (24 GB) o RTX 6000 Ada (48 GB).
- Sí cabe en GPU consumer: sí, con cuantización INT4 en una RTX 4090, aunque con limitaciones de velocidad.
- Opciones de despliegue: compatible con transformers, vLLM, TGI, llama.cpp, Ollama (el modelo `qwen3.6:35b` está disponible en Ollama).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| AIdashi/dora7-albedo-qwen3.6-35b-v16 (este) | 35B MoE (3B activos) | 256K | Apache 2.0 | HuggingFace |
| Qwen3.6-27B dense | 27B denso | 256K | Apache 2.0 | HuggingFace, Ollama |
| Qwen3.6-35B-A3B MoE (base) | 35B MoE (3B activos) | 256K | Apache 2.0 | HuggingFace, Ollama |
| dendriteholdings/albedo-qwen3.6-35b-king-genesis | 35B MoE (3B activos) | 256K | Apache 2.0 | HuggingFace |

La comparación directa no está publicada, pero el modelo base Qwen3.6 35B MoE es la referencia principal. La variante 27B densa ofrece un rendimiento similar en tareas generales con mayor coste computacional por token, mientras que el MoE 35B-A3B es más eficiente. La diferencia clave de este modelo es su fine-tune orientado a fallos de ejecución y su entrenamiento DPO.

## Limitaciones y advertencias

- Modelo nuevo con 0 descargas y 0 likes en HuggingFace, por lo que no hay validación comunitaria amplia.
- No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.), lo que dificulta evaluar su rendimiento objetivo.
- El README indica que la versión v17 tiene regresión y no debe usarse; la v16 es la recomendada, pero la v11 mantiene mejor calidad de duelo.
- El modelo está entrenado específicamente para fallos de ejecución de línea de comandos; puede tener sesgos hacia ese dominio y rendir peor en tareas generales.
- Riesgo de alucinación en casos de código complejo o contextos fuera de su entrenamiento.
- No se especifican idiomas soportados explícitamente, aunque el modelo base Qwen3.6 es multilingüe.
- Aunque la licencia es Apache 2.0, el uso comercial está permitido, pero se recomienda verificar la licencia del modelo base `dendriteholdings/albedo-qwen3.6-35b-king-genesis` por si hay restricciones adicionales.
- Para producción, se recomienda validar con casos reales y considerar que la evaluación de política es limitada (22/30).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AIdashi/dora7-albedo-qwen3.6-35b-v16
- Modelo base: https://huggingface.co/dendriteholdings/albedo-qwen3.6-35b-king-genesis
- Guía de Qwen 3.6: https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Página de Ollama para qwen3.6:35b: https://ollama.com/library/qwen3.6:35b
- Guía de ejecución local: https://dev.to/purpledoubled/how-to-run-qwen-36-locally-27b-dense-35b-moe-and-coding-variants-setup-guide-4di
- Repos relacionados: https://huggingface.co/AIdashi/dendrite-albedo-qwen3.6-35b-stages-v1, https://huggingface.co/dora7/albedo-qwen3.6-35b-mount
