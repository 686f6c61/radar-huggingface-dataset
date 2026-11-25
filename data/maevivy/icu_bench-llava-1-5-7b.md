# MaeVivy/ICU_Bench-llava-1.5-7B

## Resumen

ICU_Bench-llava-1.5-7B es un checkpoint multimodal derivado de LLaVA-1.5-7B, publicado por el usuario MaeVivy como artefacto de referencia del benchmark ICU-Bench. No se trata de un modelo de propósito general, sino de la versión "vanilla" del modelo base ajustada sobre las muestras de imagen completa del conjunto de entrenamiento de ICU-Bench, es decir, un modelo que ha memorizado documentos sintéticos con datos personales sensibles antes de aplicar cualquier técnica de desaprendizaje. Su función es servir como punto de partida para que los métodos de *continual unlearning* demuestren que son capaces de eliminar información privada de forma secuencial.

El modelo hereda la arquitectura de LLaVA-1.5-7B: un encoder visual CLIP ViT-L/14 de 336x336 píxeles conectado mediante un proyector MLP a un LLM de la familia Vicuna-7B (basado en Llama). Con 7.063.427.072 parámetros y un repositorio de 14,1 GB en safetensors, mantiene el pipeline image-text-to-text y el soporte de conversación multi-turno del modelo original.

Su relevancia es fundamentalmente metodológica: ICU-Bench introduce 1.000 perfiles sintéticos sensibles (informes médicos y contratos laborales), 9.500 imágenes de documentos, 16.000 pares pregunta-respuesta y 100 tareas de desaprendizaje secuencial, con evaluación consciente del historial. Este checkpoint permite reproducir los experimentos del paper arXiv:2605.05938 y comparar métodos de borrado de conocimiento en MLLMs bajo condiciones realistas de peticiones de eliminación continuas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (LLaVA-1.5): encoder visual CLIP ViT-L/14 336px + proyector MLP + LLM Vicuna-7B |
| Parametros totales | 7.063.427.072 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base LLaVA-1.5 admite 4096 tokens, segun la arquitectura heredada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la receta de LLaVA-1.5: un codificador visual CLIP ViT-L/14 que procesa imágenes de 336x336 píxeles, un proyector de dos capas MLP que mapea los embeddings visuales al espacio del LLM, y un modelo de lenguaje Vicuna-7B (derivado de Llama) que recibe la secuencia combinada de tokens visuales y de texto. El ajuste se realiza en dos fases en el modelo original: alineación del proyector con el encoder congelado y, posteriormente, instrucción visual completa con el LLM desbloqueado.

En este checkpoint concreto, el autor indica que se ha realizado un fine-tuning sobre las muestras de imagen completa (*full-image training samples*) de ICU-Bench, lo que dota al modelo de conocimiento de los documentos sensibles del benchmark antes de cualquier intervención de desaprendizaje. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de las 9.500 imágenes y 16.000 pares QA, ni si se emplearon técnicas de RLHF o DPO adicionales. Tampoco se detallan innovaciones técnicas propias más allá de la propia construcción del benchmark (vistas de imagen completa, enmascarada y solo texto; protocolo de evaluación con historial).

## Capacidades

- Generación de texto conversacional multi-turno en inglés, heredada de Vicuna-7B.
- Comprensión de imágenes de documentos: el modelo está ajustado específicamente sobre imágenes de informes médicos y contratos laborales sintéticos.
- Respuesta a preguntas visuales (VQA) sobre contenido textual presente en imágenes, incluyendo extracción de datos de documentos.
- Razonamiento multimodal básico sobre información personal contenida en documentos (nombres, fechas, diagnósticos, cláusulas contractuales).
- Capacidad de servir como sujeto de experimentos de desaprendizaje: el modelo "sabe" datos privados que deben ser eliminados secuencialmente.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Investigación en desaprendizaje multimodal: el modelo se usa como punto de partida ("vanilla") sobre el que aplicar métodos de *continual unlearning* y medir si se olvidan los datos objetivo sin degradar la utilidad retenida. Es el caso de uso principal y para el que fue publicado.
- Reproducción de experimentos del paper ICU-Bench: permite replicar las tablas de resultados del artículo arXiv:2605.05938 con el mismo checkpoint y las mismas 100 tareas secuenciales de eliminación.
- Evaluación de métodos de borrado de conocimiento (gradient ascent, fine-tuning selectivo, machine unlearning aproximado) en escenarios con peticiones de eliminación que llegan de forma continua.
- Auditoría de privacidad en MLLMs: sirve para estudiar hasta qué punto un modelo ajustado sobre documentos sensibles retiene y filtra información personal en sus respuestas, comparando vistas de imagen completa, enmascarada y solo texto.
- Estudio de estabilidad a largo plazo en desaprendizaje: al disponer de 100 tareas secuenciales, permite analizar modos de fallo que solo aparecen tras muchas rondas de borrado (olvido catastrófico, resurgimiento de datos eliminados).
- Docencia y formación en privacidad de IA: como ejemplo controlado y sintético de un modelo que contiene datos personales ficticios y sobre el que se pueden demostrar técnicas de eliminación sin riesgo real.
- Baseline para comparativas entre arquitecturas: al existir una variante equivalente sobre Qwen2-VL-7B, permite contrastar el comportamiento del desaprendizaje entre dos familias de MLLMs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el benchmark ICU-Bench (1.000 perfiles, 9.500 imágenes, 16.000 pares QA, 100 tareas secuenciales) pero no incluye métricas numéricas de rendimiento del checkpoint en MMLU, HumanEval, GSM8K ni en las propias métricas del benchmark (olvido actual, retención histórica, utilidad retenida, estabilidad de secuencia).

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 14-16 GB solo para los pesos, más overhead de activaciones y del encoder visual; en la práctica se recomiendan 20-24 GB para inferencia cómoda a contexto completo.
- Cuantización a 8 bits: en torno a 8-9 GB de VRAM; a 4 bits: en torno a 5-6 GB, aunque no se documentan en la información disponible los formatos de cuantización soportados oficialmente.
- GPU recomendadas: A100 40GB o H100 para evaluación a gran escala de las 100 tareas del benchmark; RTX 4090 (24 GB) para inferencia fp16 individual; RTX 3090 (24 GB) también viable.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y, con cuantización, potencialmente en GPUs de 8-12 GB (no verificado en la información disponible).
- Opciones de despliegue: al ser un checkpoint LLaVA-1.5 estándar en safetensors, es compatible con el stack habitual de LLaVA (transformers + llava), vLLM (con soporte multimodal), y conversión a GGUF para llama.cpp/Ollama (no documentado oficialmente en la model card).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Proposito |
|---|---|---|---|---|---|
| ICU_Bench-llava-1.5-7B | 7,06 B | no disponible | imagen + texto | apache-2.0 | Checkpoint de benchmark para desaprendizaje continuo |
| liuhaotian/llava-v1.5-7b | ~7 B | 4096 tokens (modelo base) | imagen + texto | apache-2.0 (segun repo original) | MLLM de proposito general |
| Variante ICU-Bench sobre Qwen2-VL-7B | ~7-8 B | no disponible | imagen + texto | no disponible | Segundo modelo base del mismo benchmark |

La comparación relevante es con el LLaVA-1.5-7B original, del que este checkpoint es un fine-tuning específico de dominio: comparte arquitectura, tamaño y licencia, pero difiere en el ajuste sobre documentos sensibles de ICU-Bench. Frente a la variante Qwen2-VL-7B del mismo benchmark, la información disponible no permite comparar rendimiento numérico.

## Limitaciones y advertencias

- El modelo está deliberadamente ajustado para memorizar datos personales sintéticos de ICU-Bench; no debe desplegarse en producción como asistente general, ya que filtrará información privada por diseño.
- Sesgos conocidos: hereda los sesgos de Vicuna-7B y de los datos de instrucción de LLaVA-1.5, no cuantificados en la información disponible.
- Riesgo de alucinación: alto en tareas de extracción de datos de documentos, especialmente fuera del dominio de ICU-Bench (informes médicos y contratos laborales sintéticos).
- Limitación de idioma: solo inglés según la model card; el rendimiento en castellano no está evaluado y probablemente sea deficiente.
- Limitación de contexto: no se documenta la longitud efectiva de contexto en este checkpoint; el modelo base LLaVA-1.5 está limitado a 4096 tokens.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el contenido sintético del benchmark y su propósito de investigación hacen desaconsejable cualquier uso productivo.
- Caveat para producción: el modelo contiene datos personales ficticios pero realistas; su uso fuera de entornos de investigación controlados puede generar problemas de cumplimiento normativo (RGPD) si se confunde con un modelo listo para producción.
- No se documentan procesos de RLHF/DPO ni evaluaciones de seguridad posteriores al fine-tuning.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MaeVivy/ICU_Bench-llava-1.5-7B
- Repositorio GitHub de ICU-Bench: https://github.com/AstorYH/ICU-Bench/tree/main
- Paper ICU-Bench (arXiv): https://arxiv.org/abs/2605.05938
- Modelo base LLaVA-1.5-7B: https://huggingface.co/liuhaotian/llava-v1.5-7b
- Paper LLaVA (Visual Instruction Tuning): https://arxiv.org/abs/2304.08485
