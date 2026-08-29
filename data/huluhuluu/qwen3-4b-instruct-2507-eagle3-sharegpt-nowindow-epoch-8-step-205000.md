# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-8-step-205000

## Resumen

Este repositorio contiene un modelo de borrador (draft model) EAGLE3 entrenado con SpecForge para acelerar la inferencia del modelo objetivo `Qwen/Qwen3-4B-Instruct-2507` mediante decodificación especulativa. El autor, huluhuluu, ha publicado 47 checkpoints de un entrenamiento online de 10 épocas sobre datos ShareGPT limpios, y este repositorio concreto corresponde al checkpoint `epoch-8-step-205000`. No es un modelo de chat independiente: su única función es generar candidatos de tokens que el modelo objetivo valida, reduciendo la latencia de generación en entornos de servidor.

El modelo tiene 202,7 millones de parámetros, una única capa decoder con tamaño oculto 2560 y 32 cabezas de atención, y está pensado para usarse con el backend SGLang y el algoritmo especulativo EAGLE3. La licencia es Apache-2.0 y los pesos están en formato safetensors en bfloat16. Su relevancia actual radica en que Qwen3-4B-Instruct-2507 es un modelo popular y ligero para despliegue en producción, y un draft model bien entrenado puede multiplicar el throughput de inferencia sin cambiar el modelo final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decoder, EAGLE3) |
| Parametros totales | 202.700.416 |
| Parametros activos | 202.700.416 (no es MoE) |
| Longitud de contexto | 2048 (máximo de entrenamiento; sin límite de ventana deslizante) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible (entrenado con ShareGPT, que incluye datos multilingües, pero no se especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors), config.json, training_state.pt |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura EAGLE3, un método de decodificación especulativa basado en una única capa transformer que predice los siguientes tokens del modelo objetivo. Los parámetros concretos son: tamaño oculto de 2560, tamaño intermedio de 9728, 32 cabezas de atención y 8 cabezas clave/valor, con un vocabulario de borrador de 32000 tokens frente a los 151936 del modelo objetivo. La atención del borrador usa `sdpa` (scaled dot-product attention).

El entrenamiento se realizó con SpecForge, un framework de entrenamiento online para modelos especulativos, sobre un dataset ShareGPT limpio en formato JSONL. Se ejecutaron 10 épocas con un total de 231810 pasos de optimizador, tamaño de lote global efectivo de 4, tasa de aprendizaje de 1e-4 con calentamiento lineal del 1,5% y posterior anneal coseno, y sin weight decay. La longitud máxima de secuencia fue de 2048 tokens y se usó una longitud TTT (test-time training) de 7. No se aplicó ninguna ventana deslizante en la ejecución estándar.

## Capacidades

- Aceleración de inferencia especulativa: genera secuencias de tokens candidatos que el modelo objetivo valida en paralelo, reduciendo la latencia por token.
- Integración con SGLang: se usa como ruta de borrador en `--speculative-draft-model-path` con el algoritmo EAGLE3.
- Parámetros de árbol configurables: soporta ajuste de `--speculative-num-steps`, `--speculative-eagle-topk` y `--speculative-num-draft-tokens` según la carga de trabajo.
- No es un modelo de chat: no genera texto de forma autónoma ni tiene capacidades de razonamiento, código, tool calling o agentes.
- Compatible con el modelo objetivo exacto `Qwen/Qwen3-4B-Instruct-2507`; no funciona con otras variantes de Qwen3.

## Casos de uso

- Despliegue de Qwen3-4B-Instruct-2507 en producción con SGLang: el draft model se carga junto al modelo principal y reduce la latencia de generación en servicios de chat o API.
- Reducción de costes de inferencia: al validar múltiples tokens por paso, se reduce el número de pasos de forward del modelo grande, lo que permite servir más peticiones concurrentes con la misma GPU.
- Optimización de throughput en entornos con alta carga: ajustando los parámetros de árbol especulativo (num-steps, topk, num-draft-tokens) se puede maximizar el número de tokens generados por segundo.
- Evaluación de estrategias especulativas: los 47 checkpoints publicados permiten comparar el rendimiento del draft model en diferentes etapas de entrenamiento (de epoch 0 a epoch 9) y elegir el punto óptimo para una carga concreta.
- Investigación en decodificación especulativa: el repositorio incluye `training_state.pt` con el estado del optimizador, útil para reanudar entrenamientos o analizar la dinámica de aprendizaje.
- Aceleración de modelos de instrucción multilingües: al estar entrenado sobre ShareGPT (que contiene conversaciones en varios idiomas), puede acelerar la inferencia de Qwen3-4B-Instruct-2507 en aplicaciones multilingües, aunque el rendimiento en idiomas no ingleses puede requerir validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación ni de seguridad para este checkpoint.

## Requisitos de hardware

- VRAM adicional: al ser un modelo de solo 202,7 M parámetros en bfloat16, ocupa aproximadamente 0,4 GB. Se suma a la VRAM del modelo objetivo (Qwen3-4B-Instruct-2507, ~8 GB en bf16).
- GPU recomendadas: cualquier GPU con al menos 12 GB de VRAM puede alojar ambos modelos (por ejemplo, RTX 3060 12GB, RTX 4090, A10, A100). Para producción con alta concurrencia se recomienda A100 40GB o H100.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo con 12 GB o más, aunque el uso principal es en servidores con SGLang.
- Opciones de despliegue: SGLang con backend flashinfer (el más probado); también puede usarse con vLLM si soporta EAGLE3, aunque la documentación oficial del autor especifica SGLang.
- Latencia y throughput: no se proporcionan estimaciones en la información disponible. El rendimiento depende de la tasa de aceptación del draft model, que debe medirse en la carga de trabajo concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Metodo | Notas |
|---|---|---|---|---|---|
| huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-8-step-205000 | 202,7 M | 2048 | Apache-2.0 | EAGLE3 | Este checkpoint, entrenado con ShareGPT sin ventana deslizante |
| MNN/Qwen3-4B-Instruct-2507-Eagle3 (ModelScope) | no disponible | no disponible | no disponible | EAGLE-3 | Draft model para el mismo objetivo, publicado por MNN |
| Otros checkpoints de huluhuluu (epoch 0-9) | 202,7 M | 2048 | Apache-2.0 | EAGLE3 | Misma familia, distintos pasos de entrenamiento |

No hay datos públicos de rendimiento comparativo entre estos draft models. La elección entre checkpoints debe basarse en pruebas empíricas con la carga de trabajo objetivo.

## Limitaciones y advertencias

- No es un modelo autónomo: si se usa sin el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`, no produce salidas útiles.
- Sin evaluación de seguridad ni de calidad: la model card indica explícitamente que no se registraron métricas de evaluación ni de seguridad para este entrenamiento.
- Datos de entrenamiento limitados: ShareGPT contiene conversaciones de usuarios reales, con posibles sesgos y contenido inapropiado. El dataset no incluye datos no ingleses (se eliminaron en la versión usada para Qwen2, según el repositorio de EAGLE-Qwen3), por lo que el rendimiento en español u otros idiomas puede degradarse.
- Longitud de contexto limitada: el entrenamiento usó un máximo de 2048 tokens; secuencias más largas pueden reducir la precisión del draft model.
- Dependencia del backend: el uso previsto es SGLang con flashinfer; otros backends pueden no ser compatibles o requerir adaptaciones.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 tiene su propia licencia (Apache-2.0 también), que debe verificarse para el uso final.
- El archivo `training_state.pt` contiene estado del optimizador y argumentos de entrenamiento; solo debe deserializarse en entornos de confianza por riesgo de ejecución de código arbitrario.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-8-step-205000
- Checkpoint epoch 7 (misma colección): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-7-step-185000
- Checkpoint epoch 2 (misma colección): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-2-step-50000
- Draft model equivalente en ModelScope: https://www.modelscope.cn/models/MNN/Qwen3-4B-Instruct-2507-Eagle3
- Implementación oficial de EAGLE para Qwen3 (GitHub): https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Modelo objetivo Qwen3-4B-Instruct-2507 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
