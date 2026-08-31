# darkbit1001/wangzhang-gemma-4-31B-it-abliterated-EXL3-4.15bpw-H6

## Resumen

Este repositorio contiene una cuantización en formato EXL3 (ExLlamaV3) del modelo `wangzhang/gemma-4-31B-it-abliterated`, una versión modificada de `google/gemma-4-31B-it` en la que se ha aplicado una técnica de "abliteration" para eliminar los rechazos (refusals) del modelo. La cuantización, realizada con `exllamav3-1.4.4` a 4.15 bits por peso y 6 bits para la cabeza, reduce el tamaño del modelo a 19.6 GB, lo que permite ejecutarlo en GPUs de consumo con menos memoria que el original en bfloat16.

El modelo base, desarrollado por Google DeepMind, es un transformer denso multimodal de 31B parámetros con una ventana de contexto de 256K tokens, capaz de procesar texto, imagen, audio y vídeo como secuencias de frames. La versión abliterada, creada por wangzhang mediante proyección ortogonal directa sobre los pesos, reduce la tasa de rechazo de 99/100 a 7/100 en un conjunto de evaluación privado, manteniendo las capacidades funcionales del original. Esta cuantización EXL3 es relevante para quienes necesitan desplegar el modelo en hardware limitado sin renunciar a la velocidad de inferencia que ofrece ExLlamaV3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con doble normalización (double-norm) y Per-Layer Embeddings (PLE) |
| Parametros totales | 31B (modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | EXL3 4.15bpw, head bits 6, codebook mul1 |
| Idiomas soportados | No disponible (el modelo base es multilingüe, pero no se especifican idiomas concretos) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (EXL3) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-31B-it` es un transformer denso con una arquitectura de doble normalización (4 RMSNorm por capa) y Per-Layer Embeddings (PLE), diseñado para manejar entradas multimodales (texto, imagen, audio y vídeo). Sobre este modelo, wangzhang aplicó una técnica de abliteration mediante edición directa de pesos: proyección ortogonal norm-preserving sobre las proyecciones Q/K/V/O de la atención, desactivación de la proyección down de las MLP, restauración de la magnitud de filas y uso de vectores de dirección winsorizados al percentil 99.5. El proceso se optimizó con 60 ensayos, seleccionando el ensayo 40 como el mejor por su baja tasa de rechazos (7/100) y nula sobre-rechazo en pruebas clásicas.

La cuantización EXL3 se realizó con `exllamav3-1.4.4` a 4.15 bits por peso, con 6 bits para la cabeza, calibración sobre 250 filas y 2048 columnas, y escalas de salida siempre activas. El resultado son 3 archivos safetensors que suman 19.6 GB. No se dispone de información sobre el dataset de entrenamiento original ni sobre el proceso de alineación (RLHF/DPO) del modelo base.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo matemáticas y lógica.
- Comprensión y generación de código en múltiples lenguajes de programación.
- Procesamiento multimodal: entrada de imágenes, audio y vídeo (como secuencias de frames) con salida de texto.
- Soporte de tool calling y protocolo de uso de herramientas, lo que permite integración en agentes.
- Modo de pensamiento (thinking mode) para razonamiento encadenado antes de responder.
- Capacidades multilingües (idiomas no especificados, pero el modelo base es multilingüe).
- La abliteration elimina los rechazos de seguridad, permitiendo respuestas a consultas que el modelo original rechazaría.

## Casos de uso

- Generación de contenido creativo sin restricciones: el modelo puede producir narrativa, poesía o guiones sobre temas que el modelo original rechazaría, útil para escritores y artistas que necesitan explorar temas sensibles.
- Investigación en alineación y seguridad de IA: permite estudiar el comportamiento de un modelo sin capas de rechazo, comparando respuestas con el original para entender los mecanismos de seguridad.
- Desarrollo de agentes conversacionales con tool calling: su soporte nativo de herramientas y su ventana de 256K tokens lo hacen adecuado para asistentes que gestionan tareas multi-paso con contexto largo.
- Análisis multimodal en entornos con recursos limitados: al ser una cuantización EXL3, puede ejecutarse en GPUs de consumo (p. ej., RTX 4090) para procesar imágenes, audio y vídeo en aplicaciones de visión por computador o análisis de medios.
- Generación de código en producción: con capacidades de razonamiento y tool calling, puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar código, aunque la abliteration puede reducir la adherencia a políticas de seguridad.
- Simulación de escenarios de "modelo sin restricciones" para pruebas de estrés en sistemas de moderación de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para esta cuantización específica. El modelo base abliterado reporta una tasa de rechazo de 7/100 en un conjunto de evaluación privado de 100 prompts, frente a 99/100 del modelo original, y 0/15 en pruebas de sobre-rechazo clásicas. Estos datos provienen de la model card del modelo base y no son comparables con benchmarks de rendimiento general.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 19.6 GB, por lo que se necesitan al menos 20-22 GB de VRAM para cargar el modelo completo en GPU. Con cuantización EXL3, el uso de memoria es eficiente, pero se recomienda una GPU con 24 GB o más.
- GPUs recomendadas: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB), H100 (80 GB). En GPUs con menos VRAM, se podría intentar cargar parcialmente, pero no es recomendable.
- Opciones de despliegue: ExLlamaV3 (librería nativa), vLLM (con soporte para EXL3), y cualquier framework que integre ExLlamaV3. No es compatible con llama.cpp ni Ollama, que usan formatos GGUF.
- Latencia y throughput: no disponibles. Dependen de la GPU y de la configuración de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Refusals (100 prompts) |
|---|---|---|---|---|---|
| google/gemma-4-31B-it (original) | 31B | 256K | Apache 2.0 | bfloat16 | 99/100 |
| wangzhang/gemma-4-31B-it-abliterated | 31B | 256K | Apache 2.0 | bfloat16 | 7/100 |
| darkbit1001/wangzhang-gemma-4-31B-it-abliterated-EXL3-4.15bpw-H6 | 31B (cuantizado) | 256K | Apache 2.0 | EXL3 4.15bpw | No evaluado |

La comparativa se limita a las variantes del mismo modelo base. No se dispone de datos de otros modelos de tamaño similar (p. ej., Llama 3.1 30B) en esta ficha.

## Limitaciones y advertencias

- La abliteration reduce significativamente las salvaguardas de seguridad del modelo, lo que puede llevar a generar contenido inapropiado, ofensivo o peligroso. El autor declara que el modelo es solo para investigación y que el uso debe ser responsable.
- La cuantización EXL3 a 4.15 bits puede introducir una ligera degradación en la calidad de las respuestas en comparación con el modelo en bfloat16, aunque no se han medido diferencias concretas.
- No se han publicado benchmarks de rendimiento estándar para esta cuantización, por lo que no se puede garantizar su comportamiento en tareas específicas.
- El modelo base es multimodal, pero la cuantización EXL3 puede no preservar completamente las capacidades de visión/audio si el proceso de cuantización no las optimiza; no hay datos al respecto.
- La licencia Apache 2.0 permite uso comercial, pero el autor del modelo abliterado recomienda evaluar cuidadosamente el contexto de despliegue.
- El número de parámetros reportado en los safetensors (9.775.001.836) no coincide con los 31B del modelo base; probablemente se refiere a los parámetros cuantizados o a una métrica interna, pero no se ha aclarado.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/darkbit1001/wangzhang-gemma-4-31B-it-abliterated-EXL3-4.15bpw-H6
- Modelo base abliterado: https://huggingface.co/wangzhang/gemma-4-31B-it-abliterated
- Modelo original de Google: https://huggingface.co/google/gemma-4-31B-it
- Herramienta Abliterix: https://github.com/wuwangzhang1216/abliterix
- Ficha de NVIDIA NIM para Gemma 4 31B IT: https://build.nvidia.com/google/gemma-4-31b-it/modelcard
- Recetas vLLM para Gemma 4 31B IT: https://recipes.vllm.ai/Google/gemma-4-31B-it
