# rav3ndust/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic

## Resumen
DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic es una versión "decensored" (abliterated) del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B, publicada por el usuario rav3ndust. El modelo base es un fine-tune de Qwen3.5-4B orientado a razonamiento, destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect, entrenado sobre una mezcla de aproximadamente 250.000 muestras de matemáticas y STEM. Esta variante aplica la herramienta Heretic v2.0.0 para eliminar los comportamientos de rechazo mediante una técnica de ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA).

El resultado es un modelo de 4.539.265.536 parámetros (4,54B) que conserva la capacidad de razonamiento estructurado del modelo original pero con una tasa de rechazos drásticamente reducida: 5/100 frente a 99/100 del original, según los datos del autor. La divergencia KL respecto al modelo base es de 0,0378, lo que indica que la ablación preserva en gran medida el comportamiento general del modelo.

Es relevante para desarrolladores que necesitan un modelo compacto de razonamiento matemático y STEM sin restricciones de contenido, desplegable en hardware de gama media. La licencia Apache 2.0 facilita su integración en productos comerciales, aunque la naturaleza "uncensored" implica responsabilidades adicionales de moderación por parte del integrador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), fine-tune con destilación de DeepSeek-V4-Pro |
| Parámetros totales | 4.539.265.536 (4,54B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF (mencionado en tags), safetensors en fp32/fp16/bf16 (no especificado) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento
El modelo base es un fine-tune de Qwen3.5-4B, una arquitectura transformer densa de 4,54B parámetros. El entrenamiento se realizó mediante destilación (distillation) a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect, sobre una mezcla de aproximadamente 250.000 muestras centradas en matemáticas y STEM. Se aplicó SFT (supervised fine-tuning) siguiendo el mismo pipeline que la versión de 9B del mismo autor. El modelo está etiquetado como "reasoning", lo que sugiere entrenamiento en patrones de descomposición explícita de problemas y soluciones multi-paso.

La innovación principal de esta variante es la aplicación de Heretic v2.0.0, una herramienta de decensura que utiliza Arbitrary-Rank Ablation (ARA). Los parámetros de ablación publicados son: start_layer_index 16, end_layer_index 32, preserve_good_behavior_weight 0,9854, steer_bad_behavior_weight 0,0002, overcorrect_relative_weight 0,6587 y neighbor_count 10. Esta técnica modifica las capas 16 a 32 para suprimir comportamientos de rechazo manteniendo el resto de capacidades, con una divergencia KL de 0,0378 respecto al original. No se especifican detalles sobre el número total de tokens de entrenamiento ni la composición exacta del dataset más allá de la cifra de 250.000 muestras.

## Capacidades
- Generación de texto y razonamiento multi-paso con descomposición explícita de problemas, heredado de la destilación de DeepSeek-V4-Pro.
- Razonamiento matemático y STEM: entrenado específicamente en matemáticas, física y química (evaluado en MMLU-Pro Math, Physics y Chemistry).
- Generación de código y soporte de tool calling / function calling (etiquetas de text-generation-inference y endpoints_compatible).
- Capacidades multimodales de entrada image-text-to-text según los tags del repositorio, aunque no se detalla su alcance.
- Multilingüe: inglés, chino, coreano, japonés, español y ruso.
- Modo de razonamiento (reasoning) con patrones de solución estructurados.
- Comportamiento sin rechazos (uncensored/abliterated): tasa de rechazo de 5/100 frente a 99/100 del original.
- Compatible con despliegue en TGI (text-generation-inference) y con formatos GGUF para inferencia local.

## Casos de uso
- Tutoría de matemáticas y STEM: el modelo puede descomponer problemas de cálculo, física y química en pasos explícitos gracias a su entrenamiento en aproximadamente 250.000 muestras de razonamiento estructurado, adecuado para plataformas educativas que necesitan explicaciones detalladas.
- Generación de código en pipelines de CI/CD: al soportar tool calling y ser compatible con text-generation-inference, puede integrarse en flujos automatizados de revisión de código, generación de tests o documentación técnica.
- Asistente de investigación sin restricciones de contenido: útil en entornos de investigación donde se requiere exploración de temas sensibles (seguridad, análisis de contenido) sin que el modelo rechace la consulta, con la moderación delegada al sistema que lo integra.
- Atención al cliente multilingüe: cubre inglés, chino, coreano, japonés, español y ruso, lo que permite desplegar un único modelo para bases de usuarios internacionales en industrias como telecomunicaciones o comercio electrónico.
- Procesamiento de documentación técnica con entrada de imágenes: la capacidad image-text-to-text permite extraer y razonar sobre diagramas, fórmulas o tablas en documentación científica, útil en herramientas de análisis de papers.
- Despliegue en edge o hardware de consumo: con 4,54B parámetros y formatos GGUF, puede ejecutarse en estaciones de trabajo con GPU de gama media para prototipado rápido de agentes conversacionales o asistentes locales.
- Generación de contenido creativo y roleplay: la eliminación de rechazos permite su uso en aplicaciones de escritura creativa o simulación de personajes donde el modelo original bloquearía ciertos escenarios.

## Benchmarks y rendimiento

| Métrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B) |
|---|---|---|
| Rechazos (Refusals) | 5/100 | 99/100 |
| Divergencia KL | 0,0378 | 0 (por definición) |

El autor menciona evaluación en GSM8K completo y muestras fijas de MMLU-Pro Math, Physics y Chemistry, pero no se publican los resultados numéricos de estos benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: en fp16/bf16, aproximadamente 9,1 GB solo para pesos (4,54B × 2 bytes); con overhead de activaciones y KV cache, se recomiendan 12-16 GB. En cuantización GGUF Q4_K_M, alrededor de 3 GB, con 6-8 GB totales recomendados.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100 para despliegues de alta concurrencia con TGI; RTX 4090 (24 GB) para fp16 sin problemas; RTX 3090 (24 GB) igualmente viable.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) en fp16 con margen ajustado, y en GPUs de 8 GB con cuantización GGUF Q4.
- Opciones de despliegue: text-generation-inference (TGI), transformers, llama.cpp y Ollama mediante los archivos GGUF, vLLM (compatible con arquitecturas Qwen).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | 4,54B | No disponible | Apache 2.0 | Razonamiento math/STEM sin censura | Hugging Face |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B (original) | 4,54B | No disponible | Apache 2.0 | Razonamiento math/STEM con censura | Hugging Face |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | ~9B | No disponible | Apache 2.0 | Versión 9B del mismo pipeline | Hugging Face |
| Qwen3.5-4B (base) | ~4B | No disponible | Apache 2.0 | Modelo base generalista | Hugging Face |

La comparativa se limita a los modelos mencionados en la información disponible; no se dispone de datos de benchmarks comparativos entre ellos más allá de la tasa de rechazos y la divergencia KL.

## Limitaciones y advertencias
- La eliminación de rechazos (tasa 5/100) implica que el modelo puede generar contenido sensible, ofensivo o inseguro; el integrador debe implementar su propia capa de moderación en producción.
- Riesgo de alucinación inherente a los modelos de 4B, especialmente en razonamiento matemático complejo fuera del dominio de entrenamiento.
- La divergencia KL de 0,0378 indica que la ablación no es neutra: puede haber degradación sutil en algunas capacidades respecto al original, aunque el autor no detalla cuáles.
- Longitud de contexto no especificada: no se puede garantizar el rendimiento en conversaciones de contexto largo.
- Idiomas soportados limitados a seis; no hay evidencia de calidad en otros idiomas.
- El modelo es un fine-tune de un fine-tune (Qwen3.5-4B → DeepSeek-V4-Pro-Qwen3.5-4B → esta variante), lo que acumula posibles sesgos de cada etapa.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo "uncensored" puede conllevar riesgos reputacionales y legales según la jurisdicción; se recomienda revisar las políticas de contenido aplicables.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica falta de validación por parte de la comunidad.

## Enlaces
- Hugging Face: https://huggingface.co/rav3ndust/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B
- Versión 9B: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Heretic project: https://heretic-project.org
