# ronke21/rlcl-Qwen2.5-7B-Instruct-igbo-s123

## Resumen

`ronke21/rlcl-Qwen2.5-7B-Instruct-igbo-s123` es un ajuste fino (fine-tune) del modelo Qwen2.5-7B-Instruct, publicado por el usuario ronke21 en Hugging Face. Por los tags del repositorio (`rlcl`, `forgetting`, `lora-merged`, `igbo`), se trata de un experimento de investigación sobre aprendizaje continuo o ajuste multilingüe: el sufijo "rlcl" y la etiqueta "forgetting" apuntan a técnicas de mitigación del olvido catastrófico (catastrophic forgetting) al adaptar el modelo a un nuevo idioma, en este caso el igbo. El modelo resultante es la fusión (merge) de un adaptador LoRA sobre los pesos base de Qwen2.5-7B-Instruct.

El modelo conserva la arquitectura del Qwen2.5-7B-Instruct original: un transformer decoder-only denso con 7.615.616.512 parámetros y una ventana de contexto nativa de 32.768 tokens (extensible hasta 131.072 según la documentación del modelo base). Al ser una fusión de LoRA sobre el modelo instruct, mantiene el formato conversacional con plantilla de chat de Qwen y las capacidades generales del modelo original, presumiblemente con un sesgo adicional hacia el igbo.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de investigación con 0 descargas y 0 "likes" en el momento de la consulta, acceso restringido (gated) y sin documentación publicada sobre datos de entrenamiento, hiperparámetros o evaluación. Es útil como referencia para quienes investigan olvido catastrófico y adaptación lingüística de bajo recurso, pero no debe considerarse un modelo listo para producción sin una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos en Qwen2.5-7B-Instruct (hasta 131.072 con RoPE scaling, segun el modelo base); no confirmado para este fine-tune |
| Tipos de cuantizacion | no disponible en el repo; compatible con las habituales de la familia Qwen2 (GGUF Q2-Q8, AWQ, GPTQ) mediante conversion externa |
| Idiomas soportados | no disponible; el nombre del modelo sugiere adaptacion al igbo, pero no hay declaracion oficial |
| Licencia | no disponible (el modelo base Qwen2.5-7B-Instruct usa Apache 2.0, pero la licencia de este derivado no se declara) |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 15,2 GB |
| Acceso | restringido (gated), requiere aceptar condiciones en Hugging Face |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Metodo de ajuste | LoRA fusionado (lora-merged) sobre el modelo instruct |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only con atención de causal estándar, normalización RMSNorm, activación SwiGLU y embeddings de tokens compartidos con la cabeza de salida. Qwen2.5-7B-Instruct fue preentrenado por Alibaba con aproximadamente 18 billones de tokens y posteriormente alineado mediante ajuste supervisado y optimización por preferencias; este derivado hereda esos pesos y añade una adaptación LoRA fusionada.

No hay información publicada sobre el proceso de entrenamiento de este fine-tune concreto: se desconoce el número de tokens de ajuste, la composición del dataset de igbo, los hiperparámetros del LoRA (rango, alpha, capas objetivo) ni si se aplicaron técnicas específicas de regularización contra el olvido (replay de datos, KL sobre el modelo base, LoRA de bajo rango restringido). El tag `rlcl` podría referirse a una variante de regularización o a un identificador de experimento; no se puede confirmar sin documentación. Tampoco se especifica si hubo una fase de DPO o RLHF adicional tras la fusión del adaptador.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen2.5-7B-Instruct y su plantilla de chat.
- Razonamiento y matemáticas de nivel medio, coherentes con un modelo denso de 7B de la generación Qwen2.5.
- Generación de código y soporte de tool calling / function calling, capacidades presentes en el modelo base.
- Capacidad multilingüe general del modelo base (más de 29 idiomas según la documentación de Qwen2.5), presumiblemente ampliada hacia el igbo, aunque sin evaluación publicada.
- Modo instructivo y seguimiento de instrucciones complejas del Qwen2.5 original.
- No se declaran capacidades de visión, audio ni modo "thinking" explícito.
- No hay evidencia publicada de que las capacidades del modelo base se conserven intactas tras el ajuste; el tag `forgetting` sugiere que el olvido catastrófico es precisamente el fenómeno bajo estudio.

## Casos de uso

- Investigación sobre olvido catastrófico: el modelo sirve como artefacto de estudio para medir la degradación de capacidades en inglés y en tareas generales tras un ajuste LoRA centrado en igbo, comparándolo con el Qwen2.5-7B-Instruct original.
- Experimentos de adaptación a idiomas de bajo recurso: punto de partida para evaluar la calidad del igbo generado y comparar con otros fine-tunes de la misma familia.
- Evaluación de técnicas de fusión de adaptadores: al ser un `lora-merged`, permite analizar el impacto de fusionar el adaptador frente a mantenerlo separado en inferencia.
- Generación de texto en igbo para prototipos: si la adaptación es efectiva, podría emplearse para borradores de contenido o traducción asistida en ese idioma, siempre con revisión humana.
- Reproducción de experimentos académicos: útil para quienes replican pipelines de ajuste con LoRA sobre modelos Qwen2.5 y necesitan una referencia pública del resultado.
- Pruebas de pipelines de despliegue: sirve para validar integraciones con TGI, vLLM o transformers en un modelo de 7B con plantilla de chat Qwen, aunque no se recomienda su uso en producción sin evaluación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15-16 GB solo para pesos, más overhead de KV cache; se recomienda un mínimo de 24 GB.
- Cuantización en 8 bits: unos 8-9 GB de pesos; viable en GPU de 12-16 GB.
- Cuantización en 4 bits (GGUF Q4): unos 4,5-5 GB; viable en GPUs consumer de 8 GB con contexto moderado.
- GPU recomendadas: A100 40/80 GB, H100, L40S para producción en FP16; RTX 4090 (24 GB) para FP16 con contexto limitado o cuantización; RTX 3090, 4080 y 4060 Ti 16 GB para cuantizaciones 8/4 bits.
- Cabe en GPU consumer: sí, en RTX 4090 en BF16 con contexto recortado, y en GPUs de 8-16 GB con cuantización GGUF o AWQ.
- Opciones de despliegue: transformers, vLLM, TGI (el repo incluye el tag `text-generation-inference`), llama.cpp/Ollama tras conversión a GGUF, y endpoints compatibles con la API de inferencia.
- Latencia y throughput: no disponibles; no hay mediciones publicadas para este fine-tune.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ronke21/rlcl-Qwen2.5-7B-Instruct-igbo-s123 | 7,6B | 32.768 (heredado del base) | no disponible | gated, 0 descargas | Fine-tune LoRA fusionado orientado a igbo y estudio de olvido |
| Qwen/Qwen2.5-7B-Instruct | 7,6B | 32.768 (hasta 131.072 con RoPE scaling) | Apache 2.0 | publico, ampliamente usado | Modelo base; referencia de rendimiento y licencia |
| meta-llama/Llama-3.1-8B-Instruct | 8,0B | 131.072 | Llama 3.1 Community License | gated | Alternativa densa de tamano similar con contexto nativo mayor |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,2B | 32.768 | Apache 2.0 | publico | Alternativa abierta de tamano comparable |

## Limitaciones y advertencias

- Ausencia total de documentación: no hay model card con datos de entrenamiento, evaluación, sesgos ni limitaciones declaradas.
- Riesgo elevado de olvido catastrófico: el propio tag `forgetting` indica que la preservación de capacidades del modelo base es una incógnita; el rendimiento en inglés, código y matemáticas puede haberse degradado.
- Riesgo de alucinación: inherente a los modelos de 7B, sin mitigaciones documentadas específicas para este fine-tune.
- Licencia no declarada: al ser un derivado de Qwen2.5-7B-Instruct (Apache 2.0), la licencia del modelo base permite uso comercial, pero la ausencia de licencia explícita en este repositorio genera incertidumbre legal; conviene contactar con el autor antes de cualquier uso comercial.
- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que añade fricción para pipelines automatizados.
- Idiomas y calidad no verificados: no hay evaluación del igbo generado ni declaración de idiomas soportados.
- Sin tracción comunitaria: 0 descargas y 0 likes implican ausencia de validación externa; no debe tratarse como un modelo estable.
- Fecha de creación futura en los metadatos (2026-11-27): conviene verificar la integridad del repositorio antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ronke21/rlcl-Qwen2.5-7B-Instruct-igbo-s123
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio oficial de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Paper de Qwen2.5 (informe técnico): https://arxiv.org/abs/2412.15115
