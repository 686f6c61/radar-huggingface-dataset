# burningfeet/backup-2026-08-31-Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V12-GGUF

## Resumen

El modelo `burningfeet/backup-2026-08-31-Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V12-GGUF` es una versión cuantizada en formato GGUF de un fine-tuning sobre el modelo base `HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive`, que a su vez deriva de Qwen3.6-35B-A3B, un modelo de arquitectura MoE (Mixture of Experts) con 35 000 millones de parámetros totales y 3 000 millones de parámetros activos por token. El autor, `burningfeet`, ha aplicado un entrenamiento adicional con el dataset `NousResearch/hermes-function-calling-v1`, orientado a mejorar las capacidades de function calling y razonamiento agéntico. El modelo es multimodal (image-text-to-text), soporta inglés, chino y otros idiomas, y se distribuye bajo licencia Apache-2.0, aunque su acceso en HuggingFace está restringido (gated) y requiere aceptar condiciones previas.

La relevancia de este modelo radica en su carácter "uncensored" (sin rechazos ante peticiones sensibles, con 0/465 refusals según el repositorio base), su eficiencia computacional gracias al diseño MoE con solo 3B parámetros activos, y su formato GGUF, que permite su despliegue en hardware de consumo mediante herramientas como llama.cpp u Ollama. Al estar basado en Qwen3.6, hereda las mejoras en razonamiento, generación de código y preservación del pensamiento (thinking mode) que introduce esta familia de modelos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.6, con componentes multimodales (vision) |
| Parametros totales | 34 660 610 688 (34,66B) |
| Parametros activos | 3B (por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variantes no especificadas en la informacion disponible) |
| Idiomas soportados | en, zh, multilingual |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.6-35B-A3B, un transformer de tipo MoE con 35B parámetros totales y 3B activos por token, lo que reduce significativamente el coste computacional en inferencia. Incluye componentes multimodales que permiten procesar entradas de imagen y texto simultáneamente. El fine-tuning parte del modelo `HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive`, que ya ha sido ajustado para eliminar rechazos ante contenido sensible, y posteriormente se entrena con el dataset `NousResearch/hermes-function-calling-v1` para reforzar las capacidades de function calling y razonamiento multi-paso. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto, razonamiento lógico, matemáticas y código, heredadas de la familia Qwen3.6.
- Soporte de tool calling / function calling, reforzado mediante el dataset Hermes de NousResearch.
- Capacidades agénticas: razonamiento multi-step y planificación de tareas complejas.
- Multimodal: entrada de imágenes y texto (image-text-to-text), lo que permite análisis visual y descripción de imágenes.
- Multilingüe: inglés, chino y otros idiomas (etiqueta "multilingual").
- Modo "uncensored": sin rechazos ante peticiones que otros modelos bloquean (0/465 refusals en el modelo base).
- Compatible con despliegue en formato GGUF mediante llama.cpp, Ollama y otras herramientas de inferencia local.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (aunque la longitud exacta no está disponible) y, gracias a su capacidad de function calling, puede consultar bases de datos o APIs externas para resolver incidencias en tiempo real.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar código, aprovechando su eficiencia MoE para reducir la latencia en entornos con GPUs de gama media.
- Análisis de documentos e imágenes: al ser multimodal, puede extraer información de capturas, diagramas o documentos escaneados, combinando visión y lenguaje para tareas de extracción de datos.
- Agentes autónomos: su capacidad de razonamiento multi-step y function calling lo hace adecuado para construir agentes que interactúan con herramientas, navegadores o APIs de forma autónoma.
- Investigación en IA sin restricciones: al ser "uncensored", permite explorar temas sensibles o controvertidos sin bloqueos, útil para estudios académicos sobre sesgos, seguridad o comportamiento de modelos.
- Despliegue local en hardware de consumo: gracias a su formato GGUF y a los 3B parámetros activos, puede ejecutarse en GPUs como RTX 3090, 4090 o 5070 Ti con cuantizaciones adecuadas, sin necesidad de infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de HuggingFace no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se han encontrado comparativas cuantitativas con modelos similares en las búsquedas realizadas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma precisa. El repositorio ocupa 61 GB en total, lo que sugiere que incluye múltiples cuantizaciones. Para una cuantización Q4_K_M, se estima que el modelo podría ocupar entre 20 y 25 GB, requiriendo una GPU con al menos 24 GB de VRAM. Para quants más agresivos (Q2_K, Q3_K), podría caber en 12-16 GB.
- GPU recomendadas: RTX 3090, RTX 4090, RTX 5070 Ti, o GPUs con 16-24 GB de VRAM. Según la guía de insiderllm, el modelo base Qwen3.6-35B-A3B se ejecuta correctamente en estas tarjetas.
- Compatibilidad con GPU consumer: sí, siempre que se elija una cuantización adecuada a la VRAM disponible.
- Opciones de despliegue: llama.cpp, Ollama (el modelo base está disponible en ollama.com/library/qwen3.6:35b-a3b), y potencialmente vLLM o TGI si se convierten los pesos a safetensors.
- Latencia y throughput: no disponible. Al ser MoE con 3B activos, la velocidad de generación es superior a la de un modelo denso de 35B, pero depende de la GPU y la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35B | 3B | no disponible | Apache-2.0 | safetensors, GGUF |
| Este modelo (fine-tuning uncensored + Hermes) | 34,66B | 3B | no disponible | Apache-2.0 | GGUF |
| Mixtral 8x7B | 46,7B | 12,9B | 32K | Apache-2.0 | safetensors, GGUF |
| DeepSeek-V2-Lite | 16B | 2,4B | 32K | MIT | safetensors, GGUF |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparativa se limita a parámetros, contexto (cuando se conoce) y licencia. Este modelo destaca por su naturaleza multimodal y "uncensored", que no está presente en las alternativas listadas.

## Limitaciones y advertencias

- Modelo "uncensored": puede generar contenido inapropiado, ofensivo o potencialmente dañino. No se recomienda su uso en aplicaciones orientadas al público general sin filtros adicionales de moderación.
- Acceso restringido (gated) en HuggingFace: requiere aceptar condiciones y posiblemente autenticación, lo que puede limitar su adopción en entornos corporativos.
- Riesgo de alucinación: como cualquier LLM, puede inventar información, especialmente en tareas de razonamiento complejo o con entradas ambiguas.
- Longitud de contexto no especificada: se desconoce el límite exacto de tokens de entrada, lo que dificulta planificar aplicaciones que requieran ventanas largas.
- Sesgos: no se ha publicado información sobre sesgos específicos del modelo, pero al ser un fine-tuning de Qwen3.6, puede heredar sesgos presentes en los datos de entrenamiento originales.
- Restricciones de licencia: aunque la licencia es Apache-2.0 (permite uso comercial), el acceso gated puede implicar términos adicionales que deben revisarse antes de su uso en producción.
- Formato GGUF: no es directamente compatible con todas las librerías de inferencia; requiere herramientas como llama.cpp u Ollama, y puede perder precisión respecto al modelo original en safetensors.

## Enlaces

- [HuggingFace - burningfeet/backup-2026-08-31-Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V12-GGUF](https://huggingface.co/burningfeet/backup-2026-08-31-Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V12-GGUF)
- [GitHub - chenfei66/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive](https://github.com/chenfei66/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive)
- [Guía de ejecución local de Qwen3.6-35B-A3B (insiderllm)](https://insiderllm.com/guides/best-way-run-qwen-3-6-35b-moe-locally/)
- [Ollama - qwen3.6:35b-a3b](https://ollama.com/library/qwen3.6:35b-a3b)
