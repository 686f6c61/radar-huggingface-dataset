# lezbeuldu32/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es una variante "descensurada" del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, un fine-tune de razonamiento construido sobre Qwen3.5-9B y destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect. El autor de esta versión es lezbeuldu32, que aplica la herramienta Heretic v2.0.0.dev0 para eliminar los mecanismos de rechazo del modelo original mediante una técnica de ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) sobre las capas 9 a 24.

El modelo base concentra su señal de entrenamiento supervisado en matemáticas y disciplinas STEM, con aproximadamente 250.000 muestras, manteniendo la eficiencia y la facilidad de despliegue de la clase de 9B parámetros. Esta variante heretic conserva esa base pero reduce drásticamente las negativas a responder: según la model card, pasa de 100/100 rechazos en el original a 3/100 en esta versión, con una divergencia KL de 0,0422 respecto al modelo de partida.

Es relevante para quienes necesitan un modelo compacto (9,4 mil millones de parámetros reales) con razonamiento estructurado, capacidades matemáticas y de STEM, soporte multilingüe en seis idiomas y sin las restricciones de rechazo típicas de los modelos alineados comercialmente. La licencia Apache 2.0 facilita su uso comercial, aunque las implicaciones éticas y de seguridad de un modelo descensurado deben evaluarse con cuidado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5), con soporte de MTP (Multi-Token Prediction) segun tags |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors; repo de 19,3 GB) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Qwen3.5-9B con arquitectura transformer decoder-only densa. Según la model card, el entrenamiento parte de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect y se centra en aproximadamente 250.000 muestras de matemáticas y razonamiento científico, aplicando técnicas de SFT, RL y GSPO (según los tags). También se menciona el uso de MTP (Multi-Token Prediction) y una evaluación con NVFP4, lo que sugiere optimizaciones para decodificación especulativa y cuantización de baja precisión en el modelo base.

Esta variante heretic aplica la técnica Arbitrary-Rank Ablation (ARA) implementada en Heretic v2.0.0.dev0. Los parámetros de ablación son: start_layer_index 9, end_layer_index 24, preserve_good_behavior_weight 0,8264, steer_bad_behavior_weight 0,0003, overcorrect_relative_weight 0,9645 y neighbor_count 12. El resultado es una reducción de rechazos de 100/100 a 3/100 con una divergencia KL de 0,0422 respecto al modelo original, lo que indica que la distribución de salida se mantiene relativamente próxima al original salvo en los comportamientos de rechazo suprimidos.

## Capacidades

- Generación de texto y razonamiento multi-paso con descomposición estructurada de problemas.
- Razonamiento matemático y resolución de problemas STEM, área en la que se concentra el entrenamiento.
- Generación de código y transferencia cross-domain: la model card indica pequeñas mejoras en programación y uso de herramientas pese a no recibir SFT específico de código.
- Soporte de tool calling / function calling (tag `tool-use`, `function-calling`).
- Capacidades multimodales de entrada: el pipeline declarado es `image-text-to-text`, lo que indica soporte de entrada de imagen y texto.
- Multilingüe en inglés, chino, coreano, japonés, español y ruso.
- Modo de razonamiento (thinking) implícito en la destilación de un modelo de razonamiento como DeepSeek-V4-Pro.
- Comportamiento descensurado: supresión de rechazos ante peticiones que el modelo original rechazaría.

## Casos de uso

- Resolución de problemas matemáticos y científicos: el modelo está entrenado específicamente sobre ~250.000 muestras de matemáticas y STEM, por lo que es adecuado para tutoría automática, generación de soluciones paso a paso y verificación de razonamientos en entornos educativos o de investigación.
- Generación de código en pipelines de CI/CD: aunque no recibió SFT específico de código, la model card reporta mejoras cross-domain en programación y soporta tool calling, lo que permite integrarlo en asistentes de revisión de código, generación de tests o automatización de tareas de desarrollo.
- Atención al cliente automatizada multi-turno: con soporte de seis idiomas y capacidad conversacional, puede gestionar diálogos multi-turno; sin embargo, al ser un modelo descensurado, requiere filtros de salida adicionales en producción para evitar respuestas inapropiadas.
- Asistentes de investigación con acceso a herramientas: el soporte de function calling permite conectar el modelo a APIs, bases de datos o calculadoras, útil para agentes que necesitan combinar razonamiento con ejecución de herramientas.
- Procesamiento de documentos con imágenes: el pipeline `image-text-to-text` permite extraer información de capturas, diagramas o figuras y razonar sobre ellas, por ejemplo en análisis de papers o informes técnicos.
- Generación de contenido sin restricciones editoriales: para casos donde se necesita creatividad sin filtros (ficción, guiones, contenido adulto controlado), la variante heretic evita los rechazos del modelo original, aunque esto exige supervisión humana y cumplimiento normativo.
- Traducción y generación multilingüe: con cobertura de en, zh, ko, ja, es y ru, puede emplearse en localización de contenido técnico o atención multilingüe.

## Benchmarks y rendimiento

La model card solo reporta métricas de descensurado, no benchmarks estándar de razonamiento. No se han publicado resultados de MMLU, HumanEval, GSM8K ni similares en la información disponible.

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) |
|---|---|---|
| Rechazos (Refusals) | 3/100 | 100/100 |
| Divergencia KL | 0,0422 | 0 (por definición) |

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 19 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 24 GB.
- Cuantización a 8 bits: ~10 GB de pesos, viable en GPUs de 12-16 GB.
- Cuantización a 4 bits: ~5-6 GB de pesos, viable en GPUs consumer de 8 GB o superiores (RTX 3060 Ti, RTX 4060, RTX 4070, etc.).
- GPU recomendadas: A100 40/80 GB, H100 para despliegue de alta concurrencia; RTX 4090 (24 GB) para FP16 en single-GPU; RTX 3090/4080 para cuantización 8 bits.
- Despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), y presumiblemente vLLM y llama.cpp mediante conversión a GGUF, aunque no se confirma en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic) | 9,4B | No disponible | Apache 2.0 | Descensurado, foco en math/STEM, multimodal input |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B (original) | 9,4B | No disponible | Apache 2.0 | Alineado, rechaza el 100% de peticiones sensibles |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | ~4B | No disponible | No disponible | Versión 4B descensurada, misma familia |
| xtools-at/Qwen3.5-9B-DeepThought-STEM | ~9B | No disponible | No disponible | Fine-tune científico basado en este modelo |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo descensurado: la supresión de rechazos implica que puede generar contenido dañino, ilegal o éticamente problemático; no debe desplegarse sin filtros de salida en aplicaciones de cara al público.
- La divergencia KL de 0,0422 respecto al original indica que, aunque la mayoría de salidas son similares, existe un desplazamiento medible en la distribución que puede afectar a la calidad en tareas donde el modelo original era más conservador.
- Riesgo de alucinación inherente a los modelos de 9B, especialmente en tareas fuera de matemáticas y STEM, donde el entrenamiento específico es menor.
- El entrenamiento se concentra en matemáticas y STEM con ~250.000 muestras; el rendimiento en código, humanidades o tareas creativas puede ser inferior al de modelos especializados.
- Longitud de contexto no documentada: no se confirma la ventana máxima, lo que limita la planificación de aplicaciones con documentos largos.
- Idiomas: aunque cubre seis idiomas, la calidad puede ser desigual; el entrenamiento principal parece centrado en inglés y chino.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede infringir normativas locales; la responsabilidad recae en el desplegador.
- Repo con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni reportes independientes de calidad.
- Técnica ARA aplicada sobre capas 9-24: puede degradar capacidades de razonamiento en dominios sensibles donde el modelo original usaba esos circuitos para negativas legítimas.

## Enlaces

- [Hugging Face: lezbeuldu32/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic](https://huggingface.co/lezbeuldu32/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic)
- [Modelo base: Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B](https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B)
- [Versión 4B heretic: xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic](https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic)
- [Fine-tune científico: xtools-at/Qwen3.5-9B-DeepThought-STEM](https://huggingface.co/xtools-at/Qwen3.5-9B-DeepThought-STEM)
- [Heretic project](https://heretic-project.org)
