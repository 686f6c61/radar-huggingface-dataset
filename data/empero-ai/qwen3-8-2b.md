# empero-ai/Qwen3.8-2B

## Resumen

Qwen3.8-2B es un modelo de lenguaje causal desarrollado por Empero (empero-ai) que destila de forma completa (full-parameter) el razonamiento del modelo Qwen3.8 2.4T A95B en la arquitectura del Qwen3.5-2B de Alibaba. El objetivo es trasladar el mismo currículum de razonamiento de los modelos grandes a un peso de 2.000 millones de parámetros apto para entornos de edge computing, manteniendo capacidades como el chain-of-thought aprendido directamente de trazas del profesor y el function calling nativo.

El modelo se entrenó mediante SFT off-policy con aproximadamente 30.000 trazas de profesor filtradas por calidad, cubriendo matemáticas, razonamiento general y seguimiento de instrucciones. Hereda del base Qwen3.5-2B una ventana de contexto nativa de 262.144 tokens y una arquitectura híbrida con capas de atención lineal (Gated DeltaNet), lo que reduce el coste de memoria frente a atención completa. Está publicado bajo licencia Apache-2.0 y es compatible con transformers, vLLM y SGLang.

La relevancia actual de este modelo radica en que ofrece razonamiento de tipo teacher-student en un rango de peso donde normalmente domina la generación rápida sin capacidades profundas de CoT. Sus resultados en GSM8K y MMLU muestran una mejora sustancial frente al base sin destilar, lo que lo convierte en una opción interesante para despliegues en dispositivos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (híbrida: transformer con capas de atención lineal Gated DeltaNet) |
| Parametros totales | 2.274.069.824 (2,2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | no publicados oficialmente; se mencionan builds cuantizados para telefonos, SBC y CPU |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3.5-2B, un modelo de lenguaje causal con una mezcla de capas de atención estándar y capas de atención lineal basadas en Gated DeltaNet. Esta hibridación permite mantener una ventana de contexto larga (262.144 tokens) con un coste de memoria subcuadrático. Para aprovechar el rendimiento real de estas capas lineales se requieren kernels especializados: `flash-linear-attention` y una compilación de `causal_conv1d` compatible con CUDA; sin ellos, la inferencia cae a operaciones PyTorch lentas y con alto consumo de memoria.

El entrenamiento consistió en una destilación full-parameter (no un adaptador) desde el profesor Qwen3.8 2.4T A95B, utilizando aproximadamente 30.000 trazas de razonamiento curadas y filtradas por calidad. El currículum es el mismo que usan los hermanos mayores de la familia (Qwen3.8-4B y Qwen3.8-9B), de modo que la diferencia entre ellos es solo la capacidad del estudiante, no la naturaleza de lo aprendido. Cada respuesta comienza con un bloque `thinking` que reproduce el chain-of-thought del profesor, seguido de la respuesta final. El fine-tune es exclusivamente textual; las capacidades de visión del base se heredan pero no fueron evaluadas en este modelo.

## Capacidades

- Razonamiento con chain-of-thought: cada respuesta abre con un bloque `thinking` aprendido de las trazas del profesor, no generado sintéticamente.
- Function calling nativo según la especificación de Qwen3.5, sin necesidad de fine-tune adicional ni wrappers.
- Matemáticas y razonamiento general: mejora significativa en GSM8K y MMLU frente al base sin destilar.
- Seguimiento de instrucciones: entrenado específicamente en instruction following dentro del conjunto de trazas.
- Contexto largo: soporta hasta 262.144 tokens de entrada, útil para documentos extensos o conversaciones multi-turno.
- Multilingüe: solo se declara inglés; no hay evidencia de soporte para otros idiomas en la model card.
- Texto únicamente: el fine-tune es text-only; las capacidades de visión del base no fueron evaluadas.

## Casos de uso

- Asistentes conversacionales en dispositivos móviles: el modelo cabe en ~4 GB en bf16 y en versiones cuantizadas puede ejecutarse en telefonos y SBC, permitiendo asistentes con razonamiento local sin depender de la nube.
- Razonamiento matemático en aplicaciones educativas: su mejora en GSM8K (0,64 exact match flexible) lo hace adecuado para tutores que expliquen problemas paso a paso, mostrando el bloque `thinking` como justificación didáctica.
- Automatización con function calling: puede integrarse en agentes que necesiten invocar APIs o herramientas, gracias a su soporte nativo de function calling sin configuración adicional.
- Procesamiento de documentos largos: con 262.144 tokens de contexto, puede resumir o extraer información de manuales, contratos o informes extensos en una sola pasada.
- Prototipado rápido de agentes de razonamiento: al ser un modelo pequeño y de licencia permisiva, permite iterar sobre pipelines de agentes multi-paso en entornos de desarrollo con recursos limitados.
- Edge computing en entornos industriales: su peso reducido y contexto largo lo hacen viable para diagnóstico o clasificación de texto en dispositivos de campo con CPU o GPU de baja gama.

## Benchmarks y rendimiento

Resultados medidos con `lm-evaluation-harness` (backend HF) usando protocolos CoT (`gsm8k_cot`, `mmlu_flan_cot_zeroshot`). MMLU cubre los 57 subconjuntos (~1.700 preguntas). Parámetros de muestreo: `temperature=0.6, top_p=0.95, top_k=20`.

| Tarea | Metrica | Qwen3.5-2B (base) | Qwen3.8-2B | Delta |
|---|---:|---:|---:|---:|
| gsm8k_cot | exact_match (flexible) | 0.330 | 0.640 | +0.310 |
| gsm8k_cot | exact_match (strict) | 0.545 | 0.640 | +0.095 |
| mmlu (CoT, 57 subjects) | acc (flexible-extract) | 0.283 | 0.548 | +0.265 |
| mmlu (CoT, 57 subjects) | acc (strict-match) | 0.004 | 0.225 | +0.221 |

No se han publicado resultados comparativos con otros modelos de la misma clase de peso en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~4 GB en bf16 (según la model card). Con cuantizaciones de menor precisión podría reducirse significativamente, aunque no se detallan los formatos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (p. ej., RTX 3060, RTX 4060, A10). Para despliegue en servidor, una A100 o H100 permitiría mayor throughput con lotes grandes.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media y baja.
- Despliegue en CPU: posible con builds cuantizados, aunque el rendimiento dependerá de la disponibilidad de kernels optimizados.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y otros runtimes con soporte de arquitectura Qwen3.5.
- Requisito crítico: se necesitan los kernels `flash-linear-attention` y `causal_conv1d` compilados para CUDA; sin ellos, la inferencia se degrada a operaciones PyTorch lentas.
- Latencia y throughput: no disponibles. Dependerá del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Entrenamiento | GSM8K (flexible) | MMLU (flexible) |
|---|---|---|---|---|---|---|
| Qwen3.8-2B | 2,2B | 262.144 | Apache-2.0 | Destilación SFT desde Qwen3.8 2.4T | 0.640 | 0.548 |
| Qwen3.5-2B (base) | 2,2B | 262.144 | Apache-2.0 | Pre-entrenamiento + RLHF | 0.330 | 0.283 |
| Qwen3.8-4B | ~4B | no disponible | Apache-2.0 | Destilación SFT (mismo currículum) | no disponible | no disponible |
| Qwen3.8-9B | ~9B | no disponible | Apache-2.0 | Destilación SFT (incluye código) | no disponible | no disponible |

La comparativa se limita a la familia Qwen3.8 y su base, ya que no hay datos públicos de otros modelos de peso similar en la informacion proporcionada.

## Limitaciones y advertencias

- Capacidad limitada por el peso: con 2,2B de parámetros, el recall factual y los problemas de razonamiento multi-paso muy complejos pueden fallar. La model card recomienda subir a Qwen3.8-4B o Qwen3.8-9B para cargas más duras.
- Solo inglés declarado: no hay evidencia de soporte multilingüe, a pesar de que el base Qwen3.5 podría tener capacidades adicionales no evaluadas.
- Fine-tune exclusivamente textual: las capacidades de visión del base se heredan pero no fueron evaluadas; no se garantiza su funcionamiento.
- Dependencia de kernels especiales: sin `flash-linear-attention` y `causal_conv1d` compilados, la inferencia es lenta y con alto consumo de memoria.
- Greedy decoding problemático: la decodificación greedy en generaciones largas produce bucles de repetición; se recomienda muestreo con `temperature=0.6, top_p=0.95, top_k=20`.
- Formato de salida con bloques `thinking`: las respuestas incluyen un bloque `thinking` que debe parsearse y eliminarse antes de mostrar al usuario final.
- Sin garantías de producción: la model card indica que los pesos se comparten "as-is" para investigación y experimentación, sin garantías explícitas de robustez en entornos productivos.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de alucinación; como todo modelo de 2B, la probabilidad de inventar hechos es relevante.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/empero-ai/Qwen3.8-2B
- Base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Qwen3.8-4B: https://huggingface.co/empero-ai/Qwen3.8-4B
- Qwen3.8-9B: https://huggingface.co/empero-ai/Qwen3.8-9B
- Repositorio flash-linear-attention: https://github.com/fla-org/flash-linear-attention
- Repositorio causal-conv1d: https://github.com/Dao-AILab/causal-conv1d
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- Sitio web de Empero: https://empero.org
