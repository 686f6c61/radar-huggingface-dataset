# loongyy/sdar_4b_b16_webshop_sft

## Resumen

El modelo `loongyy/sdar_4b_b16_webshop_sft` es un ajuste fino (fine-tuning) completo del modelo base `JetLM/SDAR-4B-Chat-b16`, desarrollado por el usuario loongyy y publicado en Hugging Face. SDAR (Synergistic Diffusion-AutoRegression) es un paradigma de modelado de lenguaje que combina la eficiencia de entrenamiento de los modelos autorregresivos con la capacidad de inferencia paralela de los modelos de difusión discreta. Este ajuste se ha realizado sobre un dataset denominado `sdar_webshop_bs4_eighth_reason`, orientado a tareas de navegación y compra en entornos tipo WebShop, un benchmark habitual para agentes de comercio electrónico.

El modelo tiene 4.411.424.256 parámetros (aproximadamente 4,4 mil millones) y se distribuye en formato safetensors. Su relevancia radica en explorar cómo un modelo de difusión autorregresiva puede adaptarse a tareas de agente web, un área de creciente interés en la investigación de IA. La licencia es "other", sin especificar términos concretos, y no se han publicado resultados de benchmarks en la ficha del modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SDAR (Synergistic Diffusion-AutoRegression) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | other (sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SDAR es un paradigma que transforma un modelo autorregresivo (AR) ya entrenado en un modelo de difusión por bloques mediante una conversión ligera, evitando el costoso entrenamiento de difusión de extremo a extremo. El modelo base `SDAR-4B-Chat-b16` es un modelo de 4 mil millones de parámetros con 16 bloques (b16) que sigue esta arquitectura híbrida. El ajuste fino se realizó con el framework Llama Factory, usando entrenamiento completo (full fine-tuning) sobre el dataset `sdar_webshop_bs4_eighth_reason`.

Los hiperparámetros de entrenamiento incluyen una tasa de aprendizaje de 1e-05, tamaño de batch de entrenamiento de 1 por dispositivo (4 dispositivos en total, batch efectivo de 4), batch de evaluación de 8, optimizador AdamW con betas (0.9, 0.999), scheduler de tasa de aprendizaje constante con warmup (ratio 0.03) y una sola época. El entrenamiento se realizó con PyTorch 2.9.1+cu129 y Transformers 4.52.4. No se proporcionan detalles sobre la composición del dataset ni sobre técnicas adicionales como RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento conversacional, heredadas del modelo base SDAR-4B-Chat-b16.
- Especialización en tareas de navegación web y compras en línea, gracias al ajuste fino sobre el dataset de webshop.
- Inferencia paralela por bloques, característica de la arquitectura SDAR, que permite decodificación más rápida que un modelo puramente autorregresivo.
- Soporte de tool calling y function calling: no documentado explícitamente, aunque el modelo base de chat podría tener cierta capacidad; no se confirma en la información disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Agente de compras en línea: el modelo puede gestionar flujos de navegación en entornos tipo WebShop, tomando decisiones de selección de productos y completando transacciones simuladas. Su ajuste específico lo hace adecuado para este escenario.
- Automatización de atención al cliente en e-commerce: puede interpretar consultas de usuarios sobre productos, precios y disponibilidad, y generar respuestas o acciones de navegación coherentes.
- Investigación en modelos de difusión para agentes: sirve como punto de partida para estudiar cómo los modelos SDAR se comportan en tareas de decisión secuencial frente a modelos autorregresivos puros.
- Generación de diálogos de asistente virtual: al ser un modelo de chat ajustado, puede mantener conversaciones multi-turno en contextos de compra, aunque su especialización limita su uso general.
- Evaluación de estrategias de razonamiento en entornos simulados: el dataset incluye "eighth_reason" (posiblemente razonamiento en ocho pasos), lo que permite probar capacidades de planificación en tareas de navegación.
- Prototipado de pipelines de agentes con inferencia paralela: gracias a la arquitectura SDAR, se puede experimentar con decodificación por bloques para reducir latencia en sistemas de agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index de la ficha declara un nombre de evaluación (`sdar_4b_b16_webshop_bs4_eighth_reason_epoch1`) pero con una lista de resultados vacía. No se pueden comparar métricas como MMLU, HumanEval o GSM8K con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 4,4 mil millones de parámetros. En precisión fp16, el peso ocupa aproximadamente 8,8 GB (coincide con el tamaño del repo). Se necesitan al menos 12 GB de VRAM para inferencia con contexto moderado.
- Con cuantización de 8 bits, la VRAM requerida baja a unos 4,5-5 GB; con 4 bits, a unos 2,5-3 GB, aunque no se proporcionan archivos cuantizados en el repo.
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100, o cualquier GPU con 12 GB o más de VRAM para fp16. Con cuantización, puede ejecutarse en GPUs de 8 GB como RTX 3070/4060.
- Opciones de despliegue: al ser un modelo de Transformers, se puede servir con vLLM, TGI o llama.cpp (si se convierte a GGUF). También es compatible con Ollama si se genera un archivo GGUF.
- Latencia y throughput: no disponibles. La arquitectura SDAR promete inferencia paralela por bloques, lo que podría reducir la latencia frente a modelos AR puros, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente. Sin embargo, se puede contextualizar frente a otros modelos de ~4B parámetros:

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| loongyy/sdar_4b_b16_webshop_sft | 4,4B | no disponible | SDAR (difusión+AR) | other | Hugging Face |
| Qwen2.5-4B-Instruct | 4,0B | 128K | Transformer AR | Apache 2.0 | Hugging Face |
| Llama-3.2-3B-Instruct | 3,2B | 128K | Transformer AR | Llama 3.2 | Hugging Face |
| Phi-3.5-mini | 3,8B | 128K | Transformer AR | MIT | Hugging Face |

La principal diferencia es la arquitectura: SDAR no es un transformer autorregresivo puro, sino un híbrido con decodificación por bloques. Esto puede ofrecer ventajas de velocidad, pero su rendimiento en tareas generales no está verificado. La licencia "other" del modelo ajustado y del base puede limitar su uso comercial.

## Limitaciones y advertencias

- Licencia "other" sin especificar: no se conocen los términos exactos, lo que puede impedir su uso comercial o requerir revisión legal.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas estándar ni en el propio entorno WebShop.
- Especialización limitada: el ajuste se realizó sobre un dataset concreto de webshop; su rendimiento en tareas generales de lenguaje o razonamiento puede ser inferior al del modelo base.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en contextos fuera de su dominio de entrenamiento.
- Sesgos desconocidos: no se ha documentado ningún análisis de sesgos; el dataset de entrenamiento no está descrito, por lo que pueden existir sesgos no identificados.
- Longitud de contexto no especificada: se desconoce el límite de tokens de entrada, lo que dificulta planificar su uso en tareas con contexto largo.
- Fecha de creación futura (2026-08-24): el modelo está fechado en el futuro, lo que sugiere que puede ser un artefacto de prueba o un error de metadatos; no afecta a su funcionalidad pero debe tenerse en cuenta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loongyy/sdar_4b_b16_webshop_sft
- Modelo base: https://huggingface.co/JetLM/SDAR-4B-Chat-b16
- Paper de SDAR: https://arxiv.org/html/2510.06303
- Repositorio GitHub de SDAR: https://github.com/JetAstra/SDAR
- Dataset de checkpoint (relacionado): https://huggingface.co/datasets/loongyy/sdar_4b_webshop_sft_ckpt
