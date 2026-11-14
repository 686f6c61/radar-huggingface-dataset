# Claux67/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es una variante "decensored" del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, un fine-tune de Qwen3.5-9B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect. El autor de esta variante es Claux67, que ha aplicado la herramienta Heretic v2.0.0.dev0 para eliminar el comportamiento de rechazo del modelo base mediante una técnica de ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) sobre las capas 9 a 24.

El modelo conserva la orientación original hacia razonamiento matemático y STEM, con aproximadamente 250.000 muestras de entrenamiento supervisado centradas en matemáticas y resolución de problemas científicos. Con 9.409.813.744 parámetros totales, se posiciona en la clase de 9B, lo que permite despliegue en hardware de consumo medio y en infraestructura de inferencia estándar.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: un proceso de destilación desde un modelo mayor, una especialización en razonamiento matemático y una modificación deliberada de los mecanismos de seguridad. Esto lo hace interesante para investigación sobre alineación y para casos donde el modelo base rechaza peticiones legítimas, pero también introduce riesgos que deben evaluarse con cuidado antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5), con soporte de Multi-Token Prediction (MTP) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; se menciona evaluacion en NVFP4) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3.5, con 9.409.813.744 parámetros. El modelo base Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B se construyó mediante destilación desde DeepSeek-V4-Pro en modo Max Effect, con un conjunto de aproximadamente 250.000 muestras de SFT centradas en matemáticas y STEM. Los tags del repositorio indican el uso de SFT, RL (con GSPO), MTP (Multi-Token Prediction) y evaluación en NVFP4. No se especifican el número total de tokens de entrenamiento ni la composición detallada del dataset.

La variante aquí descrita aplica Heretic v2.0.0.dev0, una herramienta de "decensoring" que realiza una ablación de rangos arbitrarios (ARA) sobre las capas 9 a 24. Los parámetros publicados son: `start_layer_index=9`, `end_layer_index=24`, `preserve_good_behavior_weight=0.8264`, `steer_bad_behavior_weight=0.0003`, `overcorrect_relative_weight=0.9645` y `neighbor_count=12`. Según la model card, el resultado reduce los rechazos de 100/100 a 3/100 con una divergencia KL de 0.0422 respecto al modelo original. No se detalla si hubo entrenamiento adicional tras la ablación ni si se aplicaron técnicas de decodificación especulativa.

## Capacidades

- Generación de texto y razonamiento multi-paso, con énfasis en descomposición estructurada de problemas.
- Razonamiento matemático y resolución de problemas STEM, derivado de la destilación desde DeepSeek-V4-Pro.
- Soporte de tool calling y function calling (etiquetado explícitamente en el repositorio).
- Capacidades de agente y razonamiento multi-paso.
- Multilingüe en inglés, chino, coreano, japonés, español y ruso.
- Capacidad de image-text-to-text según los tags del repositorio (pipeline declarado como text-generation, pero con tag `image-text-to-text`).
- Modo de razonamiento (tag `reasoning`) y soporte de MTP.
- Comportamiento de rechazo drásticamente reducido (3/100 frentes a 100/100 del original), lo que amplía el espacio de respuestas ante peticiones que el modelo base declinaba.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo varía el comportamiento de rechazo tras una ablación ARA, comparando con el modelo base y midiendo la divergencia KL (0.0422) en distintos conjuntos de prompts.
- Tutoría de matemáticas y STEM: el entrenamiento con ~250.000 muestras centradas en matemáticas y ciencias lo hace adecuado para generar explicaciones paso a paso de problemas de cálculo, álgebra o física, con descomposición explícita del razonamiento.
- Generación de código en pipelines de CI/CD: aunque no recibió SFT específico de código, la model card reporta pequeñas mejoras en programación por transferencia entre dominios, y el soporte de tool calling permite integrarlo en flujos de revisión automática o generación de tests.
- Agentes con function calling: la etiqueta `tool-use` y `function-calling` indica que puede invocar herramientas externas en flujos multi-paso, útil para asistentes que consultan APIs o bases de datos.
- Atención al cliente multilingüe: cubre seis idiomas (en, zh, ko, ja, es, ru) y puede gestionar conversaciones multi-turno, aunque la longitud de contexto no está documentada y debe validarse empíricamente.
- Análisis de imágenes y texto combinados: el tag `image-text-to-text` sugiere capacidad multimodal, aplicable a tareas de descripción o razonamiento sobre figuras científicas, aunque conviene verificar el soporte real antes de desplegarlo.
- Evaluación comparativa de modelos destilados: sirve como referencia para medir cuánto del rendimiento del profesor (DeepSeek-V4-Pro) se retiene en un estudiante de 9B, y cómo afecta la ablación a esas métricas.

## Benchmarks y rendimiento

La información disponible solo incluye métricas del proceso de decensoring, no benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) |
|---|---|---|
| Rechazos | 3/100 | 100/100 |
| Divergencia KL | 0.0422 | 0 (por definición) |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18,8 GB solo para pesos (9,41B × 2 bytes), más overhead de KV cache y activaciones; en la práctica se recomienda 24 GB o más.
- Cuantización a 8 bits: ~9,4 GB de pesos; a 4 bits: ~4,7 GB de pesos, lo que permitiría ejecución en GPUs de consumo con 8-12 GB, aunque los formatos de cuantización publicados no están documentados.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en producción; RTX 4090 (24 GB) para FP16 ajustado o cuantización; RTX 3090/4080 para cuantización a 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 con cuantización o FP16 ajustado; en RTX 3060 12 GB solo con cuantización agresiva (4 bits), pendiente de verificar compatibilidad.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag), vLLM y llama.cpp/Ollama si se generan pesos GGUF (no publicados en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Claux67/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | 9,41B | no disponible | apache-2.0 | Variante decensored con ARA; rechazos 3/100 |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | 9,41B (mismo base) | no disponible | apache-2.0 | Modelo original; rechazos 100/100; KL 0 |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | ~4B | no disponible | no disponible | Versión 4B de la misma familia decensored |
| xtools-at/Qwen3.5-9B-DeepThought-STEM | 9B (base) | no disponible | no disponible | Fine-tune científico sobre el mismo modelo base |

Los datos de rendimiento comparativo más allá de las métricas de rechazo y KL no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- La ablación ARA elimina deliberadamente los mecanismos de rechazo, lo que implica que el modelo puede generar contenido dañino, ilegal o inseguro sin filtros; no es apto para despliegue directo al público sin capas de moderación externas.
- La divergencia KL de 0.0422 respecto al original indica que, aunque pequeña, hay un cambio en la distribución de salida que puede afectar a la calidad en tareas generales; conviene evaluar por dominio.
- No se documentan sesgos específicos, pero al derivar de un modelo destilado de DeepSeek-V4-Pro y entrenado mayoritariamente en matemáticas y STEM, es probable que tenga un rendimiento inferior en dominios sociales, creativos o de conocimiento general.
- La longitud de contexto no está publicada; no debe asumirse un valor concreto sin verificación empírica.
- El soporte multimodal (`image-text-to-text`) aparece en los tags pero el pipeline declarado es `text-generation`; la capacidad real de visión debe validarse.
- Licencia apache-2.0 permite uso comercial, pero la modificación de seguridad puede entrar en conflicto con políticas de plataformas o con requisitos regulatorios (por ejemplo, la AI Act europea) en aplicaciones de alto riesgo.
- Riesgo elevado de alucinación en dominios fuera de matemáticas y STEM, dado el foco del SFT.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por parte de la comunidad.
- El nombre "DeepSeek-V4-Pro" en el identificador puede inducir a confusión: no es un modelo de DeepSeek, sino un fine-tune de Qwen3.5-9B destilado de aquel.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/Claux67/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Versión 4B decensored: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Fine-tune científico DeepThought: https://huggingface.co/xtools-at/Qwen3.5-9B-DeepThought-STEM
- Heretic (herramienta de decensoring): https://heretic-project.org
