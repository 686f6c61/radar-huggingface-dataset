# Jeesup/svd-safety-l2_gsmrec_swift_jbb_remove40

## Resumen

Jeesup/svd-safety-l2_gsmrec_swift_jbb_remove40 es un artefacto de investigación derivado de meta-llama/Llama-2-7b-chat-hf, comprimido mediante la técnica Swift-SVD con una eliminación del 40 % de los parámetros y posteriormente recuperado con un LoRA de ajuste fino entrenado sobre el conjunto de entrenamiento de GSM8K (7.473 problemas en formato Alpaca, corte de 512 tokens y partición de validación de 500). El modelo lo publica el usuario Jeesup dentro del proyecto svd_safety (script `jobs/gsmrec_slurm.sh`) y no está pensado como asistente de propósito general, sino como una celda experimental para estudiar el efecto de la compresión SVD sobre capacidades de razonamiento matemático y sobre el comportamiento de seguridad.

La relevancia de esta ficha es doble. Por un lado, documenta un caso concreto de compresión agresiva de un transformer de 6.738.415.616 parámetros (frente a los 6.738.415.616 del Llama-2-7b-chat original, ya que la eliminación afecta a componentes internos y no al recuento total de pesos del checkpoint) con calibración híbrida WikiText-2 más respuestas dañinas de JBB multiplicadas por 13. Por otro, publica métricas de seguridad y de rendimiento que muestran un equilibrio poco habitual: tasas de ataque exitoso (ASR) del 0,00 % en AdvBench y StrongREJECT, pero un rendimiento muy bajo en GSM8K (11,30 % estricto en 5-shot) y en IFEval (10,72 % estricto a nivel de prompt).

El modelo conserva la licencia Llama 2 Community License y se distribuye en formato safetensors con la librería transformers, lo que permite cargarlo con el stack habitual de HuggingFace. Su utilidad principal es como referencia para investigaciones sobre compresión, alineamiento y sobreajuste a la seguridad, no como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido con Swift-SVD |
| Parametros totales | 6.738.415.616 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Llama-2-7b-chat soporta 4.096 tokens) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | No disponible en la informacion proporcionada (el modelo base esta entrenado principalmente en ingles) |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Llama-2-7b-chat, un transformer decoder-only con normalización RMSNorm, activación SwiGLU y atención multi-cabeza con RoPE. Sobre esa base se aplica Swift-SVD, una variante de descomposición en valores singulares que elimina el 40 % de los parámetros de las matrices de proyección, con calibración realizada sobre una mezcla de WikiText-2 y respuestas dañinas de JBB repetidas 13 veces (configuración W+JBB) y semilla 42. Esta elección de calibración es deliberada: introduce ejemplos de comportamiento inseguro para estudiar cómo la compresión afecta a la alineación de seguridad.

Tras la compresión se entrena un LoRA de recuperación sobre el conjunto de entrenamiento de GSM8K (7.473 problemas, formato Alpaca, corte de 512, partición de validación de 500) en lugar de alpaca-cleaned, y se fusiona en los pesos finales. No se documenta en la información disponible el número total de tokens de entrenamiento, la composición completa del dataset ni si hubo fases de RLHF o DPO adicionales. La innovación técnica destacable es el uso de SVD estructurado con calibración adversaria y recuperación específica de dominio, orientada a medir el compromiso entre compresión, razonamiento matemático y seguridad.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Llama-2-7b-chat.
- Razonamiento matemático básico, reforzado con el LoRA de recuperación sobre GSM8K, aunque con rendimiento medido bajo (11,30 % estricto en 5-shot).
- Seguimiento de instrucciones limitado: IFEval estricto a nivel de prompt de 10,72 %.
- Comportamiento de seguridad medido: ASR de 0,00 % en AdvBench y StrongREJECT con juez HarmBench.
- Tendencia marcada a la sobrerrechazo: 82,30 % de sobrerrechazo en XSTest-safe y 98,94 % en OR-Bench-Hard-1k según WildGuard.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de pensamiento explícito.
- Capacidades multilingües no documentadas; el modelo base está orientado al inglés.

## Casos de uso

- Investigación sobre compresión de modelos: sirve como celda de control para medir el impacto de Swift-SVD al 40 % sobre perplejidad y tareas zero-shot, comparando con el Llama-2-7b-chat original y con otras configuraciones del proyecto svd_safety.
- Estudio de alineación y seguridad: al combinar calibración con respuestas dañinas de JBB y métricas de ASR, permite analizar si la compresión preserva o degrada los mecanismos de rechazo.
- Análisis de sobrerrechazo: con un 82,30 % en XSTest-safe y un 98,94 % en OR-Bench-Hard-1k, es útil para estudiar cómo el ajuste fino de recuperación sobre GSM8K altera la política de rechazo.
- Evaluación de recuperación de dominio: el LoRA sobre GSM8K permite medir hasta qué punto un ajuste específico recupera razonamiento matemático tras una compresión agresiva, con la línea base de 11,30 % estricto en 5-shot.
- Reproducibilidad de experimentos: al estar publicados el script (`jobs/gsmrec_slurm.sh`), la semilla (42) y la configuración de calibración, se puede replicar el pipeline en otros modelos base.
- Docencia y formación: como ejemplo didáctico de pipeline completo de compresión SVD, calibración adversaria y fusión de LoRA en un transformer de 7B.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perplejidad en WikiText-2 | 14,48 |
| Media zero-shot en 7 tareas | 44,74 % |
| AdvBench ASR (juez HarmBench) | 0,00 % |
| StrongREJECT ASR (juez HarmBench) | 0,00 % |
| XSTest-safe sobrerrechazo (WildGuard) / porcentaje puntuado | 82,30 % / 97,20 % |
| OR-Bench-Hard-1k sobrerrechazo / porcentaje puntuado | 98,94 % / 99,70 % |
| GSM8K 5-shot estricto / flexible (plantilla de chat) | 11,30 % / 11,52 % |
| IFEval estricto a nivel de prompt | 10,72 % |

No se han publicado en la información disponible resultados comparativos frente a otros modelos de la misma categoría.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 16 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 7-8 GB; en 4 bits, en torno a 4-5 GB (estimaciones basadas en el tamaño del checkpoint, no verificadas en la información disponible).
- GPU recomendadas: A100 40/80 GB, H100 80 GB o RTX 4090 24 GB para fp16 sin problemas; RTX 3090 24 GB también es viable.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB, justo en fp16) y en GPUs de 8 GB si se cuantiza a 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible) y, por compatibilidad con Llama 2, es previsible que funcione con llama.cpp, Ollama y vLLM, aunque no se documenta explícitamente en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeesup/svd-safety-l2_gsmrec_swift_jbb_remove40 | 6.738.415.616 | No disponible | 11,30 % (5-shot estricto) | Llama 2 Community | HuggingFace |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 | 4.096 | No disponible en la información proporcionada | Llama 2 Community | HuggingFace |
| Otros derivados comprimidos de Llama-2-7b-chat | No disponible | No disponible | No disponible | Llama 2 Community | HuggingFace |

La comparación directa con el modelo base no puede completarse porque la información proporcionada no incluye los resultados de Llama-2-7b-chat en GSM8K ni en las métricas de seguridad empleadas.

## Limitaciones y advertencias

- El propio autor advierte de que es un artefacto de investigación y no un asistente de propósito general.
- Algunas celdas están deliberadamente degradadas en seguridad o presentan sobrerrechazo; es imprescindible evaluar antes de cualquier uso.
- El sobrerrechazo es muy alto (82,30 % en XSTest-safe y 98,94 % en OR-Bench-Hard-1k), lo que puede hacer que el modelo rechace peticiones legítimas.
- El rendimiento en GSM8K es bajo (11,30 % estricto en 5-shot) y en IFEval también (10,72 % estricto), lo que limita su uso en tareas de razonamiento o de seguimiento de instrucciones.
- Riesgo de alucinación no cuantificado en la información disponible, pero esperable en un modelo de 7B comprimido y ajustado con un LoRA de dominio estrecho.
- Idiomas soportados no documentados; el modelo base está orientado al inglés, por lo que el rendimiento en castellano no está garantizado.
- La licencia Llama 2 Community impone restricciones de uso comercial (límite de 700 millones de usuarios mensuales, obligaciones de atribución y política de uso aceptable en USE_POLICY.md).
- No se documentan tipos de cuantización oficiales ni resultados de latencia o throughput, lo que dificulta planificar despliegues en producción.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_gsmrec_swift_jbb_remove40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
- Proyecto svd_safety (referenciado en la model card, script `jobs/gsmrec_slurm.sh`): no se proporciona URL en la información disponible.
