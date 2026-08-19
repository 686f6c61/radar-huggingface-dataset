# bombdefuser-124/Qwen3.8-27B-heretic-ara-exl3-2.00bpw

## Resumen

El modelo `bombdefuser-124/Qwen3.8-27B-heretic-ara-exl3-2.00bpw` es una cuantización extrema (2,00 bits por peso) realizada con ExLlama v3 sobre la versión "heretic-ara" del Qwen3.8-27B, un modelo de lenguaje y visión de 27.000 millones de parámetros desarrollado por Qwen (Alibaba). La versión "heretic-ara" es un modelo derivado mediante la técnica de ablación direccional (abliteration) aplicada con la herramienta Heretic, que elimina los mecanismos de rechazo y censura del modelo original, reduciendo las negativas de 99/100 a 0/100 en las pruebas del autor.

Esta cuantización en particular está pensada para entornos con recursos de VRAM muy limitados, ya que reduce el tamaño del modelo a unos 10,8 GB en disco, permitiendo su ejecución en GPUs de consumo medio. Sin embargo, una precisión de 2 bits conlleva una degradación significativa de la calidad de generación y de las capacidades de razonamiento, por lo que su uso práctico queda restringido a tareas donde la fidelidad del texto no sea crítica. El modelo base Qwen3.8-27B ofrece una ventana de contexto nativa de 262.144 tokens (extensible a 1M), arquitectura híbrida con atención lineal (Gated DeltaNet) y atención estándar, y capacidades multimodales de imagen y vídeo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con vision encoder (híbrido: Gated DeltaNet + Gated Attention) |
| Parametros totales | 27B (modelo base Qwen3.8-27B); el repo cuantizado reporta 5.389.382.896 parámetros en safetensors (dato inconsistente con el tamaño del modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 tokens |
| Tipos de cuantizacion | 2,00 bpw (bits por peso) mediante ExLlama v3 |
| Idiomas soportados | No disponible (el modelo base Qwen3.8 soporta múltiples idiomas, pero no se especifican en la información proporcionada) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con ExLlama v3, también con transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con 64 capas, dimensión oculta de 5120 y una disposición interna de 16 bloques compuestos por 3 capas de Gated DeltaNet (atención lineal con 48 cabezas para V y 16 para QK, dimensión de cabeza 128) seguidas de una capa de Gated Attention (24 cabezas Q, 4 cabezas KV, dimensión de cabeza 256, RoPE de 64 dimensiones), intercaladas con FFN de dimensión intermedia 17.408. Incorpora además Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que acelera la inferencia.

La versión "heretic-ara" no es un modelo entrenado desde cero, sino una modificación post-hoc del Qwen3.8-27B mediante la técnica de Arbitrary-Rank Ablation (ARA), implementada en el fork personalizado de Heretic. El proceso aplica ablación direccional sobre las capas 26 a 56 con parámetros específicos (preserve_good_behavior_weight 0,9432, steer_bad_behavior_weight 0,0009, overcorrect_relative_weight 0,5038, neighbor_count 10), consiguiendo eliminar los rechazos de seguridad manteniendo una divergencia KL de 0,0535 respecto al original. La cuantización posterior a 2,00 bpw se realizó con el script oficial de conversión de ExLlama v3.

## Capacidades

- Generación de texto libre sin filtros de seguridad: al ser una versión abliterada, no produce rechazos ante solicitudes que el modelo original consideraría inapropiadas.
- Comprensión de imágenes y vídeo: el modelo base incluye un vision encoder nativo, capaz de procesar diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Razonamiento con control de pensamiento: modo "thinking" activado por defecto, desactivable por petición, con ajuste de esfuerzo de razonamiento mediante `reasoning_effort` y preservación del contexto de razonamiento histórico con `preserve_thinking`.
- Generación de código y matemáticas: capacidades heredadas del Qwen3.8-27B, aunque la cuantización a 2 bits degrada notablemente la precisión en tareas complejas.
- Soporte de agentes y tareas de largo horizonte: el modelo base está diseñado para planificación autónoma y manejo de feedback del entorno, pero la cuantización extrema limita su fiabilidad en este ámbito.
- Multilingüismo: el modelo base soporta múltiples idiomas, aunque no se detallan en la información disponible.

## Casos de uso

- Generación creativa de ficción sin restricciones: escritores y creadores de contenido pueden usar el modelo para explorar temas tabú o controvertidos sin que el sistema rechace las peticiones, gracias a la abliteración.
- Investigación sobre alineación y seguridad de IA: permite estudiar el comportamiento de un modelo sin capas de rechazo, útil para analizar sesgos subyacentes o evaluar técnicas de mitigación.
- Prototipado rápido en entornos con VRAM limitada: al ocupar solo 10,8 GB, puede ejecutarse en GPUs de 16 GB (por ejemplo, RTX 4080 o 4090) para pruebas de concepto de chatbots o asistentes conversacionales.
- Análisis de documentos con contexto largo: su ventana de 262K tokens permite procesar libros completos o largos informes en una sola pasada, aunque la calidad del resumen se verá afectada por la baja precisión.
- Generación de diálogos para juegos de rol o simulaciones: la ausencia de censura permite crear personajes con comportamientos más libres, útil en desarrollo de videojuegos o entornos de simulación social.
- Evaluación comparativa de técnicas de cuantización: sirve como caso de estudio para medir el impacto de la cuantización extrema (2 bits) en las capacidades de un modelo multimodal de 27B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización de 2,00 bpw. La model card del modelo base Qwen3.8-27B incluye una tabla de rendimiento comparativa (frente a Qwen3.6-27B y Qwen3.7-Plus), pero los valores no están disponibles en la información proporcionada. El autor de la versión "heretic-ara" reporta únicamente dos métricas de la abliteración: divergencia KL de 0,0535 respecto al original y tasa de rechazos de 0/100 (frente a 99/100 del original). No se dispone de datos sobre la degradación introducida por la cuantización a 2 bits.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 10,8 GB en disco, pero los pesos safetensors reportan 5.389.382.896 parámetros, lo que sugiere que parte del modelo (posiblemente el vision encoder) no está cuantizado. Se estima que la carga completa requiere al menos 12-14 GB de VRAM.
- GPUs recomendadas: RTX 4080 (16 GB), RTX 4090 (24 GB), o GPUs de datacenter como A10G (24 GB) o L4 (24 GB). En GPUs con 16 GB podría cargarse con `--low-vram` o descargando parcialmente el vision encoder.
- Ejecución en GPU de consumo: sí, es posible en RTX 3080/3090 (10-24 GB) con configuraciones ajustadas, aunque el rendimiento será limitado.
- Opciones de despliegue: ExLlama v3 es el runtime principal (el formato exl3 es específico), aunque también es compatible con transformers, vLLM, SGLang y TokenSpeed según la model card del Qwen3.8-27B.
- Latencia y throughput: no disponibles para esta cuantización. En general, un modelo de 27B en 2 bits puede generar entre 20 y 50 tokens/segundo en una RTX 4090, pero no hay datos confirmados.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | FP16/BF16 | 262K | Apache 2.0 | Modelo base con alineación de seguridad estándar |
| Qwen3.8-27B-heretic-ara (este repo) | 27B (base) | 2,00 bpw (exl3) | 262K | Apache 2.0 | Versión abliterada y cuantizada a 2 bits |
| Qwen3.8-27B-heretic-ara-exl3-5.0bpw (Honkware) | 27B (base) | 5,00 bpw (exl3) | 262K | Apache 2.0 | Misma versión abliterada con mayor precisión, mejor calidad pero mayor VRAM |

La comparación con el original es directa: la versión heretic-ara elimina los rechazos de seguridad, y la cuantización a 2 bits reduce drásticamente los requisitos de memoria a costa de una pérdida de calidad sustancial. La variante de 5,0 bpw (de Honkware) ofrece un equilibrio mejor entre tamaño y fidelidad, aunque requiere más VRAM (aproximadamente 17-18 GB).

## Limitaciones y advertencias

- La cuantización a 2,00 bpw es extremadamente agresiva y degrada severamente la coherencia, el razonamiento y la precisión factual del modelo. Los resultados pueden contener errores gramaticales, repeticiones o respuestas sin sentido.
- Al ser una versión "uncensored" (abliterada), el modelo puede generar contenido ofensivo, violento, sexual o ilegal sin restricciones. El uso de este modelo conlleva responsabilidad legal y ética, especialmente en aplicaciones públicas.
- La abliteración no elimina los sesgos subyacentes del modelo original; simplemente retira el mecanismo de rechazo, por lo que los sesgos de género, raza o ideología pueden manifestarse de forma más explícita.
- El modelo base Qwen3.8-27B tiene una ventana de contexto de 262K tokens, pero en esta cuantización de 2 bits la atención a contextos muy largos se vuelve poco fiable; se recomienda no superar los 32K tokens para obtener resultados mínimamente coherentes.
- La licencia Apache 2.0 permite uso comercial, pero el carácter "uncensored" puede entrar en conflicto con las políticas de plataformas de distribución de aplicaciones (App Store, Google Play, etc.).
- No se dispone de benchmarks específicos para esta cuantización, por lo que el rendimiento real en tareas estándar es desconocido y probablemente muy inferior al del modelo original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bombdefuser-124/Qwen3.8-27B-heretic-ara-exl3-2.00bpw
- Modelo base (Qwen3.8-27B): https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo abliterado (trohrbaugh/Qwen3.8-27B-heretic-ara): https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Fork personalizado de Heretic usado para ARA: https://github.com/timrohrbaugh/heretic
- Guía de ejecución local de Qwen3.8-27B (Ollama, GGUF, exl3): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Especificaciones y requisitos de hardware de Qwen3.8-27B: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
