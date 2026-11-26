# Raiden112/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen
DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es un ajuste fino del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, publicado por el usuario Raiden112. Se trata de una variante "abliterated" o decensurada generada con la herramienta Heretic v2.0.0.dev0, que aplica una técnica de ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) sobre las capas 9 a 24 del transformer para eliminar los comportamientos de rechazo aprendidos durante el alineamiento.

El modelo subyacente es un fine-tune de Qwen3.5-9B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect, con aproximadamente 250.000 muestras centradas en matemáticas y STEM. Conserva las capacidades de razonamiento estructurado, uso de herramientas y generación de código del modelo original, pero elimina prácticamente todos los rechazos: la model card reporta 3 rechazos de cada 100 frente a los 100 de cada 100 del modelo base, con una divergencia KL de 0,0422.

Con 9.409.813.744 parámetros reales (según safetensors) y un repositorio de 19,3 GB en formato safetensors, es relevante para quienes necesitan un modelo de razonamiento compacto, desplegable en una sola GPU, sin las restricciones de contenido del alineamiento original. La licencia Apache 2.0 permite uso comercial.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5), con soporte de Multi-Token Prediction (MTP) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; la model card menciona evaluacion en NVFP4 |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento
El modelo base es un transformer decoder-only de la familia Qwen3.5 con 9B parámetros, ajustado mediante destilación desde DeepSeek-V4-Pro en modo Max Effect. El entrenamiento combina SFT (supervised fine-tuning) y RL con GSPO (Group Sequence Policy Optimization), según las etiquetas de la model card, sobre aproximadamente 250.000 muestras centradas en matemáticas y razonamiento científico. La model card indica que no se incluyeron datos SFT específicos de programación, aunque se observan pequeñas mejoras en código y uso de herramientas por transferencia entre dominios. El modelo base incorpora soporte de Multi-Token Prediction (MTP), evaluado en la release.

La modificación heretic aplica Arbitrary-Rank Ablation (ARA) con los siguientes parámetros: start_layer_index 9, end_layer_index 24, preserve_good_behavior_weight 0,8264, steer_bad_behavior_weight 0,0003, overcorrect_relative_weight 0,9645 y neighbor_count 12. Esta técnica proyecta fuera del espacio de activaciones las direcciones asociadas a comportamientos de rechazo, preservando en gran medida el resto de capacidades (KL de 0,0422 respecto al original).

## Capacidades
- Generación de texto y razonamiento multi-paso con descomposición estructurada de problemas.
- Razonamiento matemático y resolución de problemas STEM (foco principal del entrenamiento).
- Generación de código y tareas de programación por transferencia entre dominios (sin SFT específico de código).
- Tool calling y function calling, con soporte de agentes y razonamiento multi-paso.
- Capacidades multimodales de entrada imagen-texto (tag image-text-to-text en Hugging Face), aunque la model card no detalla el alcance.
- Multilingüe en inglés, chino, coreano, japonés, español y ruso.
- Modo de razonamiento (reasoning) heredado del proceso de destilación.
- Comportamiento decensurado: prácticamente sin rechazos (3/100 en la evaluación reportada).

## Casos de uso
- Resolución de problemas matemáticos y científicos: el modelo está entrenado sobre ~250.000 muestras de matemáticas y STEM, por lo que es adecuado para tutoría automatizada, verificación de demostraciones y generación de ejercicios con solución paso a paso.
- Generación de código en pipelines de CI/CD: aunque no recibió SFT específico de código, la transferencia entre dominios permite usarlo para autocompletar, revisar parches y generar tests, integrándolo mediante tool calling en flujos de integración continua.
- Agentes autónomos con function calling: el soporte de tool use y razonamiento multi-paso permite construir agentes que consulten APIs, ejecuten cálculos y encadenen acciones con verificación intermedia.
- Asistencia a la investigación: análisis de literatura científica, extracción de resultados numéricos y síntesis de métodos en inglés, chino, coreano, japonés, español o ruso.
- Atención al cliente y conversación multi-turno: al no rechazar consultas, puede gestionar conversaciones sensibles o de dominio especializado sin bloqueos, siempre con moderación externa.
- Generación de contenido sin restricciones de alineamiento: redacción creativa, escenarios de ficción y análisis de temas que el modelo base rechazaría, útil en entornos de investigación controlados.
- Evaluación de seguridad y red-teaming: sirve como referencia de modelo sin alineamiento para comparar comportamientos y calibrar filtros en otros sistemas.

## Benchmarks y rendimiento
La model card solo publica métricas de la modificación heretic, no benchmarks estándar (MMLU, HumanEval, GSM8K) del modelo base ni de esta variante.

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) |
|---|---|---|
| Rechazos | 3/100 | 100/100 |
| Divergencia KL | 0,0422 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en FP16/BF16: aproximadamente 19 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda 24 GB o más.
- Cuantización a 8 bits: ~9,5 GB de pesos; cabe en GPUs de 12-16 GB con contexto moderado.
- Cuantización a 4 bits (GGUF/AWQ/GPTQ): ~5-6 GB de pesos; cabe en GPUs consumer de 8 GB con contexto reducido.
- GPUs recomendadas: A100 40/80 GB, H100 para producción a gran escala; RTX 4090 (24 GB) para FP16 con contexto moderado o cuantización; RTX 3090, 4080 y 4070 Ti para cuantizaciones de 8 y 4 bits.
- Cabe en GPU consumer: sí, en RTX 4090/3090 a FP16 y en RTX 4060 Ti 16 GB o superiores con cuantización.
- Opciones de despliegue: transformers, vLLM, TGI (text-generation-inference está entre las etiquetas), llama.cpp/Ollama mediante conversión a GGUF (no se distribuye GGUF oficial en el repo), Unsloth para fine-tuning.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | 9,41B | no disponible | Apache 2.0 | Variante decensurada con ARA; 3/100 rechazos |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | 9,41B (presumible) | no disponible | Apache 2.0 | Modelo base alineado; 100/100 rechazos; KL 0 respecto a sí mismo |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | ~4B | no disponible | no disponible | Versión 4B decensurada del mismo linaje |
| xtools-at/Qwen3.5-9B-DeepThought-STEM | ~9B | no disponible | no disponible | Fine-tune científico basado en este modelo |

## Limitaciones y advertencias
- La ablación elimina los rechazos, pero no garantiza corrección factual: el riesgo de alucinación persiste y puede aumentar en dominios sensibles al no haber mecanismos de rechazo.
- El proceso ARA puede degradar ligeramente capacidades no relacionadas con el rechazo; la KL de 0,0422 indica cambios medibles en la distribución de salida.
- La evaluación de rechazos (3/100) procede de la propia model card y no de un conjunto estandarizado independiente; tómese como indicativa.
- No se han publicado benchmarks estándar, por lo que el rendimiento real en MMLU, HumanEval o GSM8K es desconocido.
- Longitud de contexto no documentada en la información disponible; verificar antes de desplegar en casos de contexto largo.
- El modelo base se entrenó principalmente en matemáticas y STEM; el rendimiento en código, redacción general o dominios especializados puede ser inferior al de modelos con SFT específico.
- Uso comercial permitido por Apache 2.0, pero la ausencia de alineamiento traslada al despliegue la responsabilidad de moderar contenido y cumplir normativas (por ejemplo, AI Act en la UE).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por la comunidad.
- Los pesos están solo en safetensors; para llama.cpp/Ollama hay que convertir a GGUF por cuenta propia.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Raiden112/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Versión 4B decensurada: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Fine-tune científico DeepThought STEM: https://huggingface.co/xtools-at/Qwen3.5-9B-DeepThought-STEM
- Proyecto Heretic: https://heretic-project.org
