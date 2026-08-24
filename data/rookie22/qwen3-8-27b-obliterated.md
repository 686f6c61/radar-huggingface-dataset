# Rookie22/Qwen3.8-27B-OBLITERATED

## Resumen

El modelo `Rookie22/Qwen3.8-27B-OBLITERATED` es una versión "abliterada" (técnica de eliminación de comportamientos de rechazo) del modelo base `Qwen/Qwen3.8-27B`, publicada por el usuario Rookie22 en Hugging Face. El objetivo declarado es eliminar las respuestas de rechazo y las evasivas de seguridad del modelo original, manteniendo el mayor nivel posible de capacidad técnica. La model card indica que se trata de la versión V3 del proceso de abliteration, con una caída de rendimiento en MMLU de aproximadamente 2,1 puntos porcentuales respecto al modelo original, pero con una tasa de respuestas sustantivas muy superior en consultas restringidas.

El modelo tiene 27.781.427.952 parámetros (~27,8 mil millones) y se distribuye en formatos safetensors, GGUF y MLX, lo que permite su ejecución en múltiples entornos, incluyendo hardware de Apple Silicon. La licencia es Apache-2.0, lo que permite uso comercial y modificación. El repositorio fue creado en agosto de 2026 y, en el momento de la consulta, presenta cero descargas y cero likes, aunque el modelo original de OBLITERATUS (del que parece derivarse) acumula más de 123.000 descargas.

Es relevante para la comunidad de investigación en seguridad de IA y red-teaming, así como para desarrolladores que necesitan evaluar modelos sin restricciones de seguridad para tareas específicas. No obstante, su uso en producción conlleva riesgos importantes de generación de contenido dañino, y su idoneidad depende del contexto de aplicación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (model_type: qwen3) |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (varios niveles), MLX, safetensors, FP8 (mencionado en blog) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF, MLX |

## Arquitectura y entrenamiento

El modelo base es `Qwen/Qwen3.8-27B`, un transformer denso de 27,8 mil millones de parámetros desarrollado por Alibaba Cloud. La arquitectura sigue el diseño de la familia Qwen3, aunque no se especifican detalles adicionales (número de capas, dimensiones de atención, etc.) en la información proporcionada. La model card del repositorio indica que el proceso de abliteration se aplicó en tres versiones:

- **V1 (Single Surgery):** una única pasada de SVD agresiva con 5 direcciones de rechazo eliminadas. Resultó en una caída de 6 puntos porcentuales en MMLU.
- **V2 (Complementary Blending):** combinación de dos técnicas de abliteration (SVD y LEACE) con una mezcla de pesos 60/40, que compensa las debilidades de cada método. Coste de solo 0,3 puntos porcentuales en MMLU.
- **V3 (Iterative Refinement + Targeted Surgery):** refinamiento iterativo sobre la versión V2, con un corpus de datos específico para categorías de desviación, seguido de una cirugía dirigida y una mezcla final. El resultado es una caída de 2,1 puntos porcentuales en MMLU, pero con respuestas sustantivas en todas las categorías probadas.

No se proporcionan detalles sobre los datos de entrenamiento del modelo base (número de tokens, composición del dataset) ni sobre el proceso de abliteration más allá de lo descrito. El proceso de abliteration no es un entrenamiento tradicional, sino una modificación de los pesos del modelo base.

## Capacidades

- **Generación de texto y conversación:** modelo de lenguaje conversacional capaz de mantener diálogos multi-turno.
- **Razonamiento y pensamiento:** el modelo soporta un modo "thinking" (razonamiento encadenado) que puede activarse o desactivarse. La model card recomienda desactivarlo para respuestas más directas.
- **Generación de código:** probado en 20 tareas de código/cyber, logrando 20/20 con implementaciones funcionales.
- **Respuestas a consultas restringidas:** el objetivo principal del modelo es responder sin rechazos ni "sermones de seguridad", proporcionando contenido sustantivo en áreas donde el modelo base se negaría.
- **Capacidades multilingües:** no se especifican idiomas soportados en la información disponible.
- **Tool calling / function calling:** no se menciona soporte específico en la información proporcionada.
- **Capacidades de agente:** no se menciona soporte para agentes multi-paso.

## Casos de uso

- **Investigación en seguridad de IA y red-teaming:** el modelo puede usarse para evaluar vulnerabilidades en sistemas de IA, generando contenido que el modelo base rechazaría. Adecuado porque elimina las barreras de rechazo, permitiendo probar escenarios de abuso reales en entornos controlados.
- **Generación de código para pruebas de penetración (pen-testing):** la V3 responde con código funcional en tareas de ciberseguridad, lo que puede facilitar la creación de scripts de prueba en entornos de laboratorio.
- **Evaluación de políticas de seguridad de modelos:** comparar las respuestas de este modelo con las del modelo base permite medir el impacto de las técnicas de alineación y refuerzo de seguridad.
- **Generación de contenido creativo sin restricciones:** para proyectos de escritura creativa que requieran explorar temas sensibles o controvertidos, el modelo ofrece respuestas sin filtros de seguridad.
- **Investigación sobre alucinación y sesgos:** al eliminar los rechazos, el modelo puede usarse para estudiar patrones de alucinación en contextos donde el modelo base se negaría a responder.
- **Desarrollo de aplicaciones de chat especializadas:** en entornos privados donde el equipo de desarrollo quiere evitar las restricciones de seguridad del modelo base, por ejemplo en simulaciones de usuarios o pruebas de productos.

## Benchmarks y rendimiento

La model card incluye resultados de MMLU (lm-eval-harness, 0-shot, n=100 por materia, 5700 preguntas) comparando el modelo con el stock base y las versiones V1 y V2:

| Modelo | MMLU | Error estandar | Diferencia vs stock |
|---|---|---|---|
| Stock Qwen3.8-27B | 84,46 % | ±0,46 | — |
| V1 (agresivo, 5 direcciones) | 81,4 % | — | -6,0 pp |
| V2 (mezcla complementaria) | 84,32 % | ±0,65 | -0,28 pp |
| **V3 (iterativo + dirigido)** | **82,33 %** | **±0,48** | **-2,12 pp** |

Resultados por categoría (V3 vs stock):

| Categoria | V3 | Stock | Delta |
|---|---|---|---|
| Humanidades | 83,3 % | 84,3 % | -1,0 pp |
| Ciencias sociales | 87,4 % | 89,2 % | -1,8 pp |
| Otros | 82,3 % | 84,1 % | -1,8 pp |
| STEM | 78,5 % | 81,8 % | -3,3 pp |

No se publican resultados de otros benchmarks (GSM8K, HumanEval, etc.) en la información disponible. La model card indica que el modelo logra 20/20 en tareas de código/cyber y 7/8 en tareas avanzadas del mundo real, pero no se proporcionan detalles de esos benchmarks.

## Requisitos de hardware

- **VRAM estimada para inferencia:** con 27,8 B de parámetros, en precisión FP16 se necesitan aproximadamente 56 GB de VRAM. Con cuantización GGUF Q4_K_M, el modelo puede caber en unos 28 GB de VRAM.
- **GPU recomendadas:** para FP16 se recomiendan GPUs con 80 GB de VRAM (A100, H100). Para cuantización Q4, tarjetas como RTX 4090 (24 GB) o A6000 (48 GB) pueden ser suficientes.
- **Compatibilidad con GPU de consumo:** sí, con cuantización GGUF (Q4 o menor) es posible ejecutar el modelo en una RTX 4090 o similar, aunque con limitaciones de velocidad.
- **Opciones de despliegue:** el modelo está disponible en formatos MLX (para Apple Silicon), GGUF (para llama.cpp, Ollama, LM Studio) y safetensors (para transformers, vLLM, TGI). La model card recomienda usar el template de chat incluido en los GGUFs con `--jinja` en llama.cpp.
- **Latencia y throughput:** no se proporcionan datos específicos en la información disponible.

## Comparativa con modelos similares

La comparativa directa más relevante es con el modelo base `Qwen/Qwen3.8-27B`, del cual deriva:

| Modelo | Parametros | MMLU (0-shot) | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen/Qwen3.8-27B (stock) | 27,8 B | 84,46 % | Apache-2.0 | Hugging Face |
| Rookie22/Qwen3.8-27B-OBLITERATED (V3) | 27,8 B | 82,33 % | Apache-2.0 | Hugging Face (safetensors, GGUF, MLX) |
| OBLITERATUS/Qwen3.8-27B-OBLITERATED | 27,8 B | 82,33 % (misma técnica) | Apache-2.0 | Hugging Face (123k+ descargas) |

No se dispone de datos para comparar con otros modelos abliterados de la misma categoría (por ejemplo, AEON Uncensored) en la información proporcionada. El blog de Mindstudio menciona una variante "AEON Uncensored" con metodología KL-drift, pero no se incluyen datos de rendimiento comparables.

## Limitaciones y advertencias

- **Sesgos y alucinación:** el proceso de abliteration no elimina los sesgos del modelo base, y puede aumentar la probabilidad de respuestas factualmente incorrectas en áreas donde el modelo base se negaba a responder. La caída de 2,1 pp en MMLU sugiere una degradación general de las capacidades.
- **Riesgo de contenido dañino:** el modelo está diseñado para responder sin restricciones de seguridad, lo que puede generar contenido ofensivo, ilegal o peligroso. No es apto para uso en entornos sin supervisión humana.
- **Limitaciones de contexto:** no se especifica la longitud máxima de contexto; se recomienda precaución con entradas muy largas.
- **Idiomas:** no se indica los idiomas soportados; se asume que hereda el multilingüismo del modelo base Qwen, pero no está confirmado.
- **Licencia:** Apache-2.0 permite uso comercial, pero el uso de este modelo para generar contenido dañino puede incurrir en responsabilidades legales y éticas.
- **Requisitos de configuración:** la model card indica que el modelo es sensible a la configuración de inferencia: temperatura 0, `repetition_penalty` de 1,15 y sin system prompt. Desviaciones de estos parámetros pueden degradar la calidad de las respuestas o reintroducir rechazos.
- **Origen del modelo:** el repositorio Rookie22 parece una copia o espejo del modelo OBLITERATUS (que tiene 123.956 descargas), pero con 0 descargas y 0 likes. No hay garantía de que el proceso de abliteration sea exactamente el mismo que el descrito en la model card, ya que el autor es diferente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Rookie22/Qwen3.8-27B-OBLITERATED
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio original OBLITERATUS: https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED
- Blog explainx.ai sobre Qwen3.8-27B Uncensored MLX: https://www.explainx.ai/blog/orcarouter-qwen3-8-27b-uncensored-mlx-august-2026
- Blog MindStudioAI sobre Qwen3.8-27B AEON Uncensored: https://www.mindstudio.ai/blog/qwen3-8-27b-aeon-uncensored-abliteration
- Genaihub (agente del modelo): https://genaihub.net/agents/hf-model-obliteratus-qwen3-8-27b-obliterated
