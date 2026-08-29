# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-2-step-50000

## Resumen

Este repositorio contiene un checkpoint del modelo de borrador (draft model) EAGLE3 entrenado para el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`. No es un modelo de chat independiente, sino un componente auxiliar diseñado para acelerar la decodificación especulativa en entornos de servido como SGLang. El autor, `huluhuluu`, ha publicado 47 checkpoints de un entrenamiento online con SpecForge, de los cuales este corresponde a la época 2, paso 50000.

El modelo de borrador tiene 202,7 millones de parámetros, una arquitectura de una sola capa decoder basada en Llama, y pesos en `bfloat16`. Su función es predecir varios tokens por paso de decodificación para que el modelo objetivo los valide en paralelo, reduciendo así la latencia de generación. Es relevante porque permite desplegar el Qwen3-4B-Instruct-2507 (que sí es un modelo de chat) con menor latencia en producción, manteniendo la calidad del modelo original.

Dado que es un draft model, no se puede usar de forma aislada para generar texto ni realizar tareas de razonamiento. Su valor reside exclusivamente en su integración con el modelo objetivo dentro de un motor de inferencia compatible con EAGLE3.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (1 capa decoder, hidden size 2560, intermediate size 9728, 32 heads de atención, 8 key/value heads) |
| Parametros totales | 202.700.416 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Sin ventana deslizante (NoWindow); entrenado con secuencias de hasta 2048 tokens. El contexto efectivo lo determina el modelo objetivo (Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | bfloat16 (pesos originales) |
| Idiomas soportados | No disponible (hereda los idiomas del modelo objetivo, pero no se especifican) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors), además de config.json y training_state.pt |

## Arquitectura y entrenamiento

La arquitectura es una variante de Llama adaptada para EAGLE3, con una única capa decoder que procesa representaciones de características de alta dimensión del modelo objetivo. El vocabulario de borrador es de 32000 tokens, mientras que el vocabulario objetivo es de 151936 tokens, lo que permite al draft model generar tokens candidatos que luego el modelo objetivo valida. La atención se implementa con `sdpa` (scaled dot-product attention).

El entrenamiento se realizó con el método online EAGLE3/SpecForge, utilizando un dataset ShareGPT limpio (fuente local, sin revisión registrada). Se ejecutaron 10 épocas con un total de 231810 pasos de optimización, tamaño de batch efectivo de 4, tasa de aprendizaje de 1e-4 con warmup lineal del 1.5% y posterior annealing coseno. La longitud máxima de secuencia fue de 2048 tokens, con una longitud TTT (test-time training) de 7. El backend objetivo es SGLang con FlashInfer, y el entrenamiento se realizó con tensor parallelism de 1. No se registraron métricas de evaluación ni de seguridad durante el entrenamiento.

## Capacidades

- Aceleración de decodificación especulativa: genera múltiples tokens candidatos por paso, que el modelo objetivo valida en paralelo.
- Compatibilidad específica con `Qwen/Qwen3-4B-Instruct-2507`: diseñado exclusivamente para este modelo objetivo.
- Integración con SGLang: se puede usar como ruta de borrador especulativo mediante los parámetros `--speculative-algorithm EAGLE3` y `--speculative-draft-model-path`.
- No es un modelo de chat: no genera texto de forma autónoma ni tiene capacidades de razonamiento, tool calling, visión o audio.
- Soporte de pesos en `bfloat16` para inferencia eficiente en GPUs modernas.

## Casos de uso

- Reducción de latencia en servido de Qwen3-4B-Instruct-2507: al desplegar el modelo objetivo con SGLang y este draft model, se pueden emitir varios tokens por iteración, lo que acelera la generación en aplicaciones de chat y asistencia en tiempo real.
- Optimización de costes en producción: al reducir el número de pasos de decodificación, se disminuye el uso de cómputo por petición, lo que permite servir más peticiones con la misma infraestructura.
- Ajuste fino de parámetros de decodificación especulativa: los checkpoints permiten experimentar con distintos valores de `--speculative-num-steps`, `--speculative-eagle-topk` y `--speculative-num-draft-tokens` para encontrar la configuración óptima según la carga de trabajo.
- Evaluación de checkpoints intermedios: los 47 checkpoints publicados permiten estudiar la evolución del draft model durante el entrenamiento y seleccionar el punto que mejor equilibra precisión y velocidad.
- Investigación en decodificación especulativa: sirve como referencia para comparar arquitecturas de draft models (EAGLE3 frente a EAGLE2, Medusa, etc.) en términos de tasa de aceptación y aceleración.
- Despliegue en entornos con recursos limitados: al ser un modelo de solo 202M parámetros (0.4 GB), puede residir en la misma GPU que el modelo objetivo sin requerir hardware adicional significativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se registraron métricas de evaluación ni de seguridad para este entrenamiento. Para conocer el rendimiento real, es necesario ejecutar pruebas de latencia y throughput con el modelo objetivo y el draft model integrados en SGLang, ajustando los parámetros de decodificación especulativa según el hardware y la carga.

## Requisitos de hardware

- VRAM estimada para el draft model: aproximadamente 0.4 GB en `bfloat16` (202M parámetros × 2 bytes), más overhead de activaciones.
- VRAM total necesaria: debe sumarse la del modelo objetivo Qwen3-4B-Instruct-2507 (aproximadamente 8-10 GB en `bfloat16` según cuantización), por lo que se recomienda una GPU con al menos 12-16 GB para ejecutar ambos modelos juntos.
- GPUs compatibles: cualquier GPU consumer con soporte para `bfloat16` (RTX 3090, RTX 4090, etc.) o GPUs de datacenter (A100, H100, L40S).
- Opciones de despliegue: SGLang con backend FlashInfer (recomendado y documentado). No se menciona soporte para vLLM, llama.cpp u Ollama en la model card.
- Latencia y throughput: no disponibles sin pruebas específicas; dependen del modelo objetivo, del hardware y de los parámetros de decodificación especulativa configurados.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este draft model concreto. Como referencia general, los draft models EAGLE3 suelen ofrecer tasas de aceptación superiores a los métodos de decodificación especulativa basados en modelos más simples (p. ej., un modelo pequeño independiente), pero la comparación exacta requiere benchmarks sobre el mismo modelo objetivo y hardware. Se puede comparar con:

| Modelo | Parámetros | Contexto | Uso |
|---|---|---|---|
| Este draft EAGLE3 | 202M | Depende del objetivo | Acelerar Qwen3-4B-Instruct-2507 |
| Draft models EAGLE2 (genéricos) | Variable | Variable | Acelerar modelos Llama o Qwen |
| Draft model Medusa | Variable | Variable | Acelerar modelos con cabezas adicionales |

No obstante, no hay datos objetivos de comparación en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat: no debe usarse de forma independiente para generar texto ni para tareas de razonamiento.
- Dependencia estricta del modelo objetivo: está entrenado específicamente para `Qwen/Qwen3-4B-Instruct-2507`; usarlo con otro modelo puede degradar gravemente la tasa de aceptación.
- Sin métricas de seguridad ni evaluación: la model card indica que no se registraron evaluaciones de calidad ni de seguridad, por lo que su comportamiento en producción debe validarse antes de su despliegue.
- Datos de entrenamiento ShareGPT: el dataset puede contener sesgos y contenido no representativo de todos los dominios; esto afecta indirectamente al draft model.
- `training_state.pt`: contiene estado de optimizador y scheduler; solo debe deserializarse en entornos de confianza, ya que podría contener código ejecutable.
- Ventana de entrenamiento limitada a 2048 tokens: aunque el modelo no tiene ventana deslizante, el entrenamiento con secuencias cortas podría afectar a su comportamiento con contextos mucho más largos.
- Compatibilidad de motor: el despliegue requiere SGLang con FlashInfer; no se garantiza el funcionamiento en otros motores de inferencia.

## Enlaces

- Repositorio del checkpoint: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-2-step-50000
- Checkpoint hermano (época 2, paso 50000, sin NoWindow): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-2-step-50000
- Checkpoint otro punto de entrenamiento (época 7, paso 185000): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-7-step-185000
- Implementación oficial de EAGLE para Qwen3: https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Modelo objetivo Qwen3-4B-Instruct-2507 (HuggingFace): https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Ficha del modelo base en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
