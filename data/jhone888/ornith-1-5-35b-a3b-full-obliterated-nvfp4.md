# jhone888/Ornith-1.5-35B-A3B-FULL-OBLITERATED-NVFP4

## Resumen

Ornith-1.5-35B-A3B-FULL-OBLITERATED-NVFP4 es una variante cuantizada en NVFP4 del modelo Ornith-1.5-35B-A3B, un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) desarrollado por Deep Reinforce. El modelo original activa aproximadamente 3.000 millones de parámetros por token de un total de 35.000 millones, y ha sido diseñado con un bucle de auto-mejora en la generación de tareas y andamiaje. Sobre esta base, el repositorio de huihui-ai aplicó una primera abl iteración (eliminación de la dirección de rechazo) y posteriormente jhone888 ha realizado una segunda obliteración completa usando el método OBLITERATUS, dando como resultado un modelo sin censura.

La versión NVFP4, creada con NVIDIA ModelOpt, reduce el peso del checkpoint de 64,6 GB (BF16) a aproximadamente 20 GB, manteniendo una precisión mixta que combina cuantización W4A16 para los expertos y FP8 para las proyecciones de atención y la caché KV. El modelo conserva las capacidades multimodales del original (entrada de imagen y texto) y una ventana de contexto de 256.000 tokens. Está publicado bajo licencia MIT y es compatible con el runtime FreeToken, lo que lo hace atractivo para despliegues en GPUs de consumo con requisitos de memoria moderados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.5, con atención lineal y proyecciones multimodales (image-text-to-text) |
| Parametros totales | 35B (MoE, ~3B activos por token) |
| Parametros activos | ~3B |
| Longitud de contexto | 256.000 tokens (según modelo base) |
| Tipos de cuantizacion | NVFP4 (W4A16, group-16) para expertos y lm_head; FP8 (per-tensor estático) para atención y KV cache |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (5 shards, ~20 GB) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un MoE con 35.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token, lo que permite una inferencia eficiente. Incorpora atención lineal (linear attention) en lugar de atención softmax tradicional en algunas proyecciones, como se deduce de la cuantización de "linear-attn projections" en la model card. El modelo es multimodal, acepta entradas de imagen y texto, y está construido sobre la arquitectura Qwen3.5 (tags `qwen3_5_moe_text` e `image-text-to-text`).

El entrenamiento del modelo base fue realizado por Deep Reinforce con un bucle de auto-mejora que genera tareas y andamiajes de forma iterativa, según la información de LLM Releases. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. Sobre esta base, huihui-ai aplicó una abl iteración (eliminación de la dirección de rechazo) y posteriormente jhone888 realizó una segunda obliteración completa con el método OBLITERATUS, que elimina de forma más agresiva las direcciones de rechazo del modelo. El resultado es un modelo sin censura, como se indica en la advertencia de la model card.

## Capacidades

- Generación de texto y conversación multi-turno con contexto largo (256K tokens).
- Razonamiento complejo y resolución de problemas, con resultados destacados en benchmarks de agentes (Terminal-Bench 2.1 y SWE-Bench Verified).
- Generación de código y asistencia en tareas de programación, incluyendo uso de herramientas (tool calling) probablemente heredado de la base Qwen3.5, aunque no está confirmado explícitamente.
- Comprensión de imágenes (entrada image-text-to-text), lo que permite describir, analizar y responder sobre contenido visual.
- Capacidades multilingües no especificadas, pero probablemente heredadas de Qwen3.5 (no confirmado).
- Modelo "uncensored" (sin censura) tras la abl iteración, lo que elimina los rechazos basados en políticas de seguridad.
- Compatible con el runtime FreeToken, que permite cargar el checkpoint NVFP4 directamente sin de cuantización adicional.

## Casos de uso

- Asistente de programación en entornos de desarrollo: el modelo puede generar, revisar y depurar código en múltiples lenguajes, integrándose en IDEs o pipelines de CI/CD mediante tool calling. Su rendimiento en SWE-Bench Verified (79.0) lo hace adecuado para tareas de resolución de issues reales.
- Agente autónomo para automatización de terminales: con una puntuación de 68.5 en Terminal-Bench 2.1, puede ejecutar comandos, interpretar salidas y tomar decisiones en entornos de línea de comandos, útil para operaciones de DevOps o administración de sistemas.
- Análisis de documentos técnicos con imágenes: al ser multimodal, puede procesar capturas de pantalla, diagramas o gráficos junto con texto, facilitando la extracción de información de manuales, informes o documentación técnica.
- Chatbot de atención al cliente sin restricciones de contenido: la abl iteración permite manejar consultas sensibles o controvertidas sin rechazos automáticos, aunque requiere supervisión humana para evitar respuestas inapropiadas.
- Generación de contenido creativo y narrativo: su capacidad de razonamiento y contexto largo permite redactar historias, guiones o artículos extensos manteniendo coherencia a lo largo de miles de tokens.
- Investigación en alineación y seguridad de modelos: al ser un modelo abl iterado, sirve como caso de estudio para analizar el impacto de la eliminación de direcciones de rechazo en el comportamiento y la calidad de las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta variante NVFP4. Los datos que se presentan a continuación provienen del modelo base Ornith-1.5-35B-A3B, reportados por el vendor (Deep Reinforce) y no verificados de forma independiente. Se indican como referencia, pero no se puede garantizar que la cuantización NVFP4 mantenga exactamente estos valores.

| Benchmark | Resultado (vendor-reported) |
|---|---|
| Terminal-Bench 2.1 | 68.5 |
| SWE-Bench Verified | 79.0 |

No se dispone de resultados para MMLU, HumanEval, GSM8K u otros benchmarks estándar en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint NVFP4 ocupa ~20 GB en disco. Con contexto moderado (8K-32K tokens), cabe en una GPU de 24 GB (RTX 3090, RTX 4090, A5000). Para contexto completo de 256K tokens, se recomienda al menos 48 GB de VRAM (A6000, L40S, A100 80GB) o usar tensor parallelism en 2 GPUs.
- GPU recomendadas: RTX 4090 (24 GB) para pruebas y desarrollo; A100 80GB o H100 para producción con contexto largo.
- Opciones de despliegue: vLLM (con soporte para MoE y cuantización NVFP4 mediante TensorRT-LLM), TensorRT-LLM (NVIDIA), FreeToken (compatible nativamente con este checkpoint), y TGI (si se convierte a un formato soportado). llama.cpp no es compatible con NVFP4 al ser un formato propietario de NVIDIA.
- Latencia y throughput: no se dispone de datos medidos. Como referencia, un MoE con ~3B activos en una RTX 4090 suele generar entre 20 y 40 tokens por segundo en FP16; la cuantización NVFP4 puede mejorar ligeramente el throughput al reducir el ancho de banda de memoria.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización | Licencia |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (BF16) | 35B | ~3B | 256K | BF16 | MIT |
| Ornith-1.5-35B-A3B-FP8 | 35B | ~3B | 256K | FP8 | MIT |
| Ornith-1.5-35B-A3B-FULL-OBLITERATED-NVFP4 (este) | 35B | ~3B | 256K | NVFP4 + FP8 | MIT |
| Qwen3.5 (base, no especificado) | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa con Qwen3.5 no se puede completar por falta de datos en la información proporcionada. El modelo base Ornith-1.5-35B-A3B se posiciona como una alternativa a Qwen3.6 según el blog de MindStudio, pero no se incluyen cifras concretas.

## Limitaciones y advertencias

- Modelo sin censura: la abl iteración elimina los mecanismos de rechazo, por lo que puede generar contenido inapropiado, ofensivo o peligroso. El autor advierte explícitamente que el usuario es responsable de su uso.
- Riesgo de alucinaciones: como cualquier modelo de lenguaje, puede inventar información, especialmente en tareas de razonamiento o código. La cuantización NVFP4 puede aumentar ligeramente este riesgo debido a la pérdida de precisión.
- Sesgos no evaluados: no se han publicado evaluaciones de sesgos o toxicidad para esta variante. El proceso de abl iteración puede alterar el comportamiento en temas sensibles.
- Degradación por cuantización: aunque la validación reporta un error relativo medio de 0.0024-0.0044 y p99 ≤ 0.035 en los pesos, la cuantización NVFP4 puede afectar a tareas que requieren alta precisión numérica, como matemáticas avanzadas.
- Compatibilidad limitada: el formato NVFP4 es específico de NVIDIA y no es compatible con runtimes como llama.cpp u Ollama. Requiere TensorRT-LLM, vLLM con soporte NVFP4 o FreeToken.
- Sin datos de evaluación independiente: los benchmarks citados son vendor-reported y no han sido replicados por terceros. El rendimiento real puede variar.
- Idiomas no especificados: no se ha documentado qué idiomas soporta el modelo, aunque al estar basado en Qwen3.5 es probable que tenga cobertura multilingüe, pero no está confirmado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jhone888/Ornith-1.5-35B-A3B-FULL-OBLITERATED-NVFP4
- Modelo base (BF16): https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Versión FP8 del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-FP8
- Base abl iterada (huihui-ai): https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated
- Método OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
- Variante NVFP4 v1 (pottokao): https://huggingface.co/pottokao/Ornith-1.5-35B-A3B-abliterated-NVFP4-DFlash
- Blog de benchmarks (MindStudio): https://www.mindstudio.ai/blog/ornith-1-5-35b-a3b-benchmarks
- Ficha en LLM Releases: https://www.llm-releases.com/models/ornith-1-5-35b-a3b
