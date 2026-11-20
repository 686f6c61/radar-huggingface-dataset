# MMNYK/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

MMNYK/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es un fine-tune de la familia Qwen3.5 con 9.409.813.744 parámetros, construido sobre Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B. El modelo base es a su vez un ajuste de Qwen3.5-9B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect, con un conjunto de aproximadamente 250.000 muestras centradas en matemáticas y razonamiento STEM. La particularidad de esta versión es que ha sido procesada con Heretic v2.0.0.dev0, una herramienta de ablación de direcciones que elimina el comportamiento de rechazo del modelo original.

El resultado es un modelo de razonamiento compacto que conserva las capacidades del original (descomposición de problemas, cadenas de razonamiento multi-paso, uso de herramientas) pero con una tasa de rechazo declarada de 3/100 frente a 100/100 del modelo de partida, con una divergencia KL de 0,0422 respecto al original. La ablación se aplica mediante Arbitrary-Rank Ablation (ARA) en las capas 9 a 24, con pesos de preservación de comportamiento correcto de 0,8264 y de corrección de comportamiento indeseado de 0,0003.

El modelo se publica bajo licencia Apache 2.0, soporta seis idiomas (inglés, chino, coreano, japonés, español y ruso) y está orientado a despliegue práctico en la clase de 9B, con soporte declarado para MTP y evaluación en NVFP4. Es relevante ahora porque combina tres tendencias simultáneas: destilación de modelos grandes de razonamiento hacia tamaños desplegables, eliminación de barreras de rechazo mediante técnicas de ablación y publicación con licencia permisiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5), con soporte MTP |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; se menciona evaluación en NVFP4) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3.5 con 9.4B parámetros. El pipeline de entrenamiento documentado en la model card del modelo base incluye destilación desde DeepSeek-V4-Pro en modo Max Effect, seguida de SFT sobre aproximadamente 250.000 muestras de matemáticas y STEM, y una fase de RL con GSPO (Group Sequence Policy Optimization). Los tags del repositorio mencionan también `mtp` (multi-token prediction) y `reasoning`, lo que indica soporte de decodificación multi-token y entrenamiento orientado a cadenas de razonamiento explícitas.

La innovación principal de esta variante concreta es la aplicación de Heretic v2.0.0.dev0, que realiza una ablación de rango arbitrario (ARA) sobre las capas 9 a 24 del modelo. Los parámetros publicados son: `start_layer_index` 9, `end_layer_index` 24, `preserve_good_behavior_weight` 0,8264, `steer_bad_behavior_weight` 0,0003, `overcorrect_relative_weight` 0,9645 y `neighbor_count` 12. El objetivo es eliminar la dirección de activación asociada a rechazos preservando el resto del comportamiento, con una divergencia KL de 0,0422 respecto al modelo original.

## Capacidades

- Generación de texto y razonamiento multi-paso con cadenas de pensamiento explícitas.
- Razonamiento matemático y resolución de problemas STEM, reforzado por el SFT específico sobre ~250.000 muestras.
- Generación de código y transferencia cross-domain: la model card indica ganancias pequeñas en programación y uso de herramientas pese a no recibir SFT específico de código.
- Tool calling y function calling, según los tags `tool-use` y `function-calling`.
- Soporte de agentes y razonamiento multi-paso.
- Capacidades multilingües en inglés, chino, coreano, japonés, español y ruso.
- Modo de razonamiento (thinking) heredado del entrenamiento de destilación.
- Capacidad image-text-to-text declarada en los tags del repositorio, aunque la model card no detalla el soporte multimodal.
- Comportamiento decensurado: tasa de rechazo declarada de 3/100 frente a 100/100 del modelo base.

## Casos de uso

- Tutoría de matemáticas y STEM: el modelo puede descomponer problemas paso a paso y explicar el razonamiento, aprovechando el SFT sobre ~250.000 muestras de matemáticas y ciencias. Adecuado para plataformas educativas que necesitan cadenas de solución verificables.
- Generación de código en pipelines de CI/CD: con soporte de tool calling y function calling, puede integrarse en flujos automatizados de revisión, generación de tests o corrección de parches, aunque sin SFT específico de código.
- Agentes autónomos multi-paso: la combinación de razonamiento explícito y tool use permite construir agentes que planifican, invocan APIs y verifican resultados intermedios.
- Asistencia técnica en atención al cliente: conversaciones multi-turno en seis idiomas, con la ventaja de que el modelo no rechaza consultas legítimas sobre temas sensibles (salud, legal, seguridad) que otros modelos filtran en exceso.
- Investigación sobre alineación y ablación: el modelo sirve como caso de estudio reproducible de Heretic y ARA, con parámetros publicados y métricas de rechazo y KL, útil para estudiar el equilibrio entre supresión de rechazos y preservación de capacidades.
- Generación de contenido técnico y divulgativo sin restricciones de filtrado: redacción de documentación, artículos y material formativo sobre temas que los modelos alineados estándar rechazan por defecto.
- Análisis de documentos científicos y extracción estructurada: razonamiento sobre textos técnicos con salida en formato JSON mediante function calling.

## Benchmarks y rendimiento

La model card solo publica métricas del proceso de ablación, no benchmarks estándar (MMLU, GSM8K, HumanEval, etc.).

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) |
|---|---|---|
| Rechazos | 3/100 | 100/100 |
| Divergencia KL | 0,0422 | 0 (por definición) |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 19 GB solo para pesos, más overhead de KV cache; en la práctica se recomienda 24 GB o más.
- VRAM estimada en cuantización de 8 bits: alrededor de 10-11 GB de pesos, desplegable en GPUs de 16 GB.
- VRAM estimada en cuantización de 4 bits: alrededor de 5-6 GB de pesos, desplegable en GPUs consumer de 8 GB con contexto moderado.
- GPUs recomendadas: A100 40/80 GB, H100 para serving de alta concurrencia; RTX 4090 (24 GB) para fp16 con contexto limitado; RTX 3090/4080 para 8 bits; RTX 4060 Ti 16 GB o similares para 4 bits.
- Cabe en GPU consumer: sí, en cuantizaciones de 8 y 4 bits; en fp16 requiere 24 GB o más.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), y por compatibilidad con safetensors, vLLM y llama.cpp tras conversión a GGUF. El repo no incluye pesos GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| MMNYK/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | 9,4B | no disponible | apache-2.0 | Decensurado con Heretic; 3/100 rechazos |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | 9,4B | no disponible | no disponible | Modelo base; 100/100 rechazos |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | ~4B | no disponible | no disponible | Versión 4B del mismo pipeline |
| xtools-at/Qwen3.5-9B-DeepThought-STEM | 9,4B | no disponible | no disponible | Fine-tune científico derivado de este modelo |

Los datos de rendimiento comparativo entre estos modelos no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- La eliminación de rechazos implica que el modelo puede generar contenido dañino, ilegal o inseguro sin filtrado; requiere moderación externa en producción.
- Riesgo de alucinación inherente a la clase 9B y acentuado por el énfasis en razonamiento matemático, donde puede producir cadenas de solución plausibles pero incorrectas.
- La ablación introduce una divergencia KL de 0,0422 respecto al original, lo que puede degradar sutilmente capacidades no medidas.
- Longitud de contexto no documentada: no es posible planificar despliegues con ventanas largas sin verificación empírica.
- El modelo base es a su vez un fine-tune destilado, con posible acumulación de sesgos del profesor DeepSeek-V4-Pro y del dataset de destilación.
- Soporte multimodal declarado en tags pero no documentado en la model card; no asumir capacidades de visión en producción.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento en MMLU, GSM8K o HumanEval para comparar con alternativas.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal sobre el contenido generado recae en el desplegador.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/MMNYK/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Versión 4B: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Fine-tune científico derivado: https://huggingface.co/xtools-at/Qwen3.5-9B-DeepThought-STEM
- Heretic: https://heretic-project.org
