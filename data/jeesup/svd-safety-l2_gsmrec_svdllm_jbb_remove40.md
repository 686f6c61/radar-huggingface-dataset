# Jeesup/svd-safety-l2_gsmrec_svdllm_jbb_remove40

## Resumen

Jeesup/svd-safety-l2_gsmrec_svdllm_jbb_remove40 es un artefacto de investigación derivado de meta-llama/Llama-2-7b-chat-hf, comprimido mediante la técnica SVD-LLM con una eliminación del 40 % de los parámetros y posteriormente recuperado con un LoRA de ajuste fino sobre el conjunto de entrenamiento de GSM8K. Lo publica el usuario Jeesup dentro del proyecto svd_safety, cuyo objetivo es estudiar cómo afecta la compresión por descomposición en valores singulares al comportamiento de seguridad y a las capacidades aritméticas de un modelo conversacional.

El modelo conserva la arquitectura transformer decoder-only de Llama 2 con 6.738.415.616 parámetros efectivos tras la compresión (frente a los aproximadamente 6.740 millones del original, la reducción afecta a las matrices internas, no al recuento bruto de tensores). La calibración para el SVD se realizó con WikiText-2 más respuestas dañinas de JBB multiplicadas por 13 (configuración W+JBB), con semilla 42, y el LoRA de recuperación se entrenó sobre 7.473 problemas de GSM8K en formato Alpaca con corte de 512 tokens.

Es relevante ahora porque forma parte de una línea de trabajo activa sobre compresión de LLM y alineación: permite medir empíricamente si la compresión SVD degrada o preserva los rechazos de seguridad y el razonamiento matemático. El propio autor advierte que no es un asistente de propósito general y que algunas celdas están deliberadamente degradadas en seguridad o sobrerrechazan, por lo que debe evaluarse antes de cualquier uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido con SVD-LLM |
| Parametros totales | 6.738.415.616 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Llama 2 usa 4.096 tokens) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; pesos en safetensors (presumiblemente fp16/bf16) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Llama 2 Community License (incluye LICENSE.txt y USE_POLICY.md) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de la familia Llama 2 en su variante chat de 7B, con atención multi-cabeza estándar y normalización RMSNorm. Sobre esa base se aplica SVD-LLM, una técnica de compresión post-entrenamiento que descompone en valores singulares las matrices de pesos y trunca componentes para eliminar aproximadamente el 40 % de los parámetros. La calibración para determinar qué componentes descartar se hizo con una mezcla de WikiText-2 y respuestas dañinas de JBB replicadas 13 veces (W+JBB), con semilla 42, lo que introduce un sesgo intencionado hacia el comportamiento de seguridad en el proceso de compresión.

Tras la compresión se entrena un adaptador LoRA de recuperación sobre el split de entrenamiento de GSM8K (7.473 problemas, formato Alpaca, corte de 512 tokens, split de validación de 500), en lugar de usar alpaca-cleaned como en otras variantes del proyecto. El adaptador se fusiona en los pesos finales, de modo que el repositorio contiene un único checkpoint denso. La innovación destacable no es arquitectónica sino metodológica: separar el efecto de la compresión SVD sobre seguridad (medido con AdvBench, StrongREJECT, XSTest y OR-Bench) del efecto sobre razonamiento matemático (GSM8K, IFEval).

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Llama-2-7b-chat.
- Razonamiento aritmético básico: el LoRA de recuperación se entrenó específicamente sobre GSM8K, aunque los resultados medidos son modestos (11,07 % estricto en 5-shot).
- Seguimiento de instrucciones con plantilla de chat de Llama 2 (probado con IFEval, 12,01 % estricto a nivel de prompt).
- Comportamiento de rechazo ante peticiones dañinas: AdvBench ASR de 0,00 y StrongREJECT ASR de 0,64 según juez HarmBench.
- Tendencia al sobrerrechazo en prompts seguros: XSTest-safe 71,72 % y OR-Bench-Hard-1k 97,41 % de sobrerrechazo.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas; el modelo no está diseñado para ello.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (visión, audio, thinking mode): no disponibles; el modelo es solo texto.

## Casos de uso

- Investigación sobre compresión de LLM: usar el checkpoint como punto de comparación frente a Llama-2-7b-chat sin comprimir para cuantificar la pérdida de calidad tras eliminar el 40 % de parámetros con SVD-LLM.
- Estudio de alineación y seguridad post-compresión: evaluar con AdvBench, StrongREJECT, XSTest y OR-Bench cómo la calibración W+JBB afecta a las tasas de rechazo y sobrerrechazo, replicando la metodología del proyecto svd_safety.
- Análisis de sobrerrechazo en producción: el 71,72 % en XSTest-safe y el 97,41 % en OR-Bench-Hard-1k lo convierten en un caso de estudio útil para diseñar filtros de moderación que distingan entre rechazo correcto y excesivo.
- Benchmark de recuperación con LoRA sobre datos matemáticos: comparar el efecto de entrenar el adaptador de recuperación con GSM8K frente a alpaca-cleaned en tareas de aritmética y seguimiento de instrucciones.
- Reproducibilidad de experimentos: el repositorio documenta la configuración exacta (semilla 42, calibración W+JBB, corte 512, split de 500) para replicar el pipeline de compresión y recuperación en otros modelos de la familia Llama.
- Evaluación de pipelines de inferencia con TGI: al estar etiquetado como text-generation-inference y endpoints_compatible, sirve para probar el despliegue de checkpoints comprimidos en Text Generation Inference y medir latencia y throughput frente al modelo original.
- Docencia sobre técnicas SVD-LLM: ejemplo práctico de cómo la descomposición en valores singulares y el ajuste LoRA posterior interactúan con las capacidades del modelo.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| WikiText-2 PPL | 13,85 |
| Media zero-shot en 7 tareas | 44,55 % |
| AdvBench ASR (juez HarmBench) | 0,00 % |
| StrongREJECT ASR (juez HarmBench) | 0,64 % |
| XSTest-safe sobrerrechazo (WildGuard) / puntuado | 71,72 % / 97,60 % |
| OR-Bench-Hard-1k sobrerrechazo / puntuado | 97,41 % / 99,55 % |
| GSM8K 5-shot estricto / flexible (plantilla chat) | 11,07 % / 12,13 % |
| IFEval estricto a nivel de prompt | 12,01 % |

No se han publicado en la información disponible resultados comparativos frente a Llama-2-7b-chat sin comprimir ni frente a otras variantes del proyecto svd_safety.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 16 GB o más.
- VRAM estimada en cuantización de 8 bits: en torno a 7-8 GB de pesos; en 4 bits, en torno a 4-5 GB, aunque no se documentan cuantizaciones oficiales en el repositorio.
- GPU recomendadas: A100 40/80 GB o H100 para servir en fp16 con lotes grandes; RTX 4090 (24 GB) para inferencia en fp16 con lotes pequeños; RTX 3090 (24 GB) y RTX 4080 (16 GB) para fp16 ajustado o cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y RTX 4080 en fp16; en GPUs de 8-12 GB requeriría cuantización, no documentada oficialmente.
- Opciones de despliegue: transformers, Text Generation Inference (etiqueta text-generation-inference y endpoints_compatible), y potencialmente llama.cpp u Ollama si se generan pesos GGUF, aunque el repositorio solo publica safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Jeesup/svd-safety-l2_gsmrec_svdllm_jbb_remove40 | 6.738.415.616 | No disponible | Llama 2 Community | Compresión SVD-LLM al 40 %, recuperación GSM8K, seguridad degradada intencionadamente |
| meta-llama/Llama-2-7b-chat-hf | ~6.740 millones | 4.096 tokens | Llama 2 Community | Modelo base sin comprimir; referencia natural de comparación |
| Otras variantes del proyecto svd_safety | No disponible | No disponible | Llama 2 Community | Distintas calibraciones y datos de recuperación; no se detallan en la información disponible |

No se dispone de datos de benchmarks del modelo base ni de las otras variantes en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente que no es un asistente de propósito general y que debe evaluarse antes de usarse.
- Seguridad degradada intencionadamente en algunas celdas: la calibración con respuestas dañinas de JBB puede producir comportamientos inconsistentes en materia de seguridad.
- Sobrerrechazo severo: 71,72 % en XSTest-safe y 97,41 % en OR-Bench-Hard-1k, lo que lo hace inadecuado para atención al usuario sin un filtro adicional.
- Rendimiento aritmético limitado: GSM8K 5-shot estricto de 11,07 %, muy por debajo de lo esperable en un modelo de 7B sin comprimir.
- Seguimiento de instrucciones débil: IFEval estricto de 12,01 %, insuficiente para tareas de instrucción complejas.
- Riesgo de alucinación: no cuantificado en la información disponible, pero esperable en un modelo comprimido y con recuperación limitada.
- Idiomas: no documentados; se desconoce el soporte multilingüe real.
- Licencia Llama 2 Community: restricciones de uso comercial y obligación de cumplir la política de uso aceptable; incluye LICENSE.txt y USE_POLICY.md.
- Sin cuantizaciones oficiales publicadas ni pesos GGUF, lo que limita el despliegue en hardware modesto.
- Contexto máximo no documentado en la model card; no asumir los 4.096 tokens del base sin verificación.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_gsmrec_svdllm_jbb_remove40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos del proyecto svd_safety.
