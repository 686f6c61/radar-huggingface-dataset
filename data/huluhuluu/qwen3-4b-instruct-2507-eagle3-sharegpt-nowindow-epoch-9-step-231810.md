# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-9-step-231810

## Resumen

El modelo `huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-9-step-231810` es un **draft model** (modelo de borrador) para decodificación especulativa, entrenado con el método EAGLE3 mediante SpecForge sobre el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`. No es un modelo de chat independiente: su única función es acelerar la inferencia del modelo base cuando se usa como backend de servidor con SGLang, generando tokens candidatos que el modelo objetivo verifica en paralelo.

El autor, `huluhuluu`, publica este checkpoint como parte de una colección de 47 puntos de control desde `epoch_0_step_5000` hasta `epoch_9_step_231810`, todos entrenados con datos ShareGPT limpios. Este checkpoint concreto corresponde a la época 9, paso 231810, y no aplica ventana deslizante (NoWindow). La arquitectura es `LlamaForCausalLimeEagle3` con una sola capa decoder, 202,7 millones de parámetros, y pesos en `bfloat16`. Su relevancia radica en que permite reducir la latencia de Qwen3-4B-Instruct-2507 en entornos de producción sin modificar la calidad de las respuestas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLimeEagle3 (una capa decoder, EAGLE3) |
| Parametros totales | 202.700.416 |
| Parametros activos | 202.700.416 (no es MoE) |
| Longitud de contexto | 2048 (secuencia máxima de entrenamiento; sin ventana deslizante) |
| Tipos de cuantizacion | no disponible (pesos originales en bfloat16) |
| Idiomas soportados | no disponible (depende del modelo objetivo Qwen3-4B-Instruct-2507) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, config.json, training_state.pt) |

## Arquitectura y entrenamiento

El modelo usa la arquitectura EAGLE3, un esquema de decodificación especulativa basado en una única capa decoder que predice los siguientes tokens del modelo objetivo. La capa tiene hidden size 2560, intermediate size 9728, 32 cabezas de atención, 8 cabezas key/value, y un vocabulario de borrador de 32000 tokens frente a los 151936 del modelo objetivo. El entrenamiento se realizó de forma online (online EAGLE3) con SpecForge, usando datos ShareGPT limpios en formato JSONL, con una longitud máxima de secuencia de 2048 y una longitud de TTT (test-time training) de 7. Se aplicó un learning rate de 1e-4 con warmup lineal del 1,5% y decaimiento coseno, sin weight decay, y con gradiente máximo de 0,5. El backend objetivo es SGLang con flashinfer, y el entrenamiento usó tensor parallel size 1. No se registraron métricas de evaluación ni de seguridad en el run.

## Capacidades

- **Aceleración de inferencia especulativa**: genera borradores de tokens (draft tokens) que el modelo objetivo Qwen3-4B-Instruct-2507 verifica en paralelo, reduciendo la latencia por token.
- **Integración con SGLang**: se usa como ruta de borrador en `sglang.launch_server` con el algoritmo EAGLE3, parámetros `--speculative-num-steps 3`, `--speculative-eagle-topk 1` y `--speculative-num-draft-tokens 4`.
- **Compatibilidad con el modelo base**: diseñado específicamente para la familia `Qwen/Qwen3-4B-Instruct-2507`, no es intercambiable con otros modelos.
- **Sin ventana deslizante**: la variante NoWindow no limita el contexto a una ventana fija, lo que permite aprovechar todo el contexto disponible (hasta 2048 tokens de entrenamiento).
- **No es un modelo de chat**: no genera respuestas por sí mismo; requiere el modelo objetivo para funcionar.

## Casos de uso

- **Despliegue de Qwen3-4B-Instruct-2507 en producción con baja latencia**: al integrar este draft model en SGLang, se puede servir el modelo base a un throughput mayor y con menor latencia por petición, ideal para APIs de chat o asistentes conversacionales.
- **Optimización de costes de inferencia**: al reducir el número de pasos de decodificación autoregresiva, se disminuye el consumo de cómputo por petición, abaratando el servicio en GPUs compartidas o en clústeres.
- **Sistemas de agentes con múltiples turnos**: en escenarios donde se requieren cadenas de razonamiento largas (multi-step), la decodificación especulativa acelera la generación de cada paso intermedio.
- **Evaluación de modelos de decodificación especulativa**: investigadores pueden comparar este checkpoint con otros de la misma colección (47 checkpoints) para estudiar el efecto del número de pasos de entrenamiento en la calidad de los borradores.
- **Entornos con restricción de VRAM**: al ser un modelo pequeño (202M parámetros), puede residir en la misma GPU que el modelo objetivo, sin necesidad de hardware adicional.
- **Ajuste fino de parámetros de especulación**: los valores de `--speculative-num-steps`, `--speculative-eagle-topk` y `--speculative-num-draft-tokens` pueden ser ajustados y evaluados con este checkpoint para encontrar la configuración óptima para una carga de trabajo concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation or safety metrics were recorded for this run". No se pueden aportar cifras de velocidad, tasa de aceptación de borradores ni comparativas con otros draft models.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo tiene 202,7 millones de parámetros en bfloat16, lo que ocupa aproximadamente 0,4 GB en memoria. Puede residir en la misma GPU que el modelo objetivo (Qwen3-4B-Instruct-2507, que ocupa unos 8 GB en bf16).
- **GPU recomendadas**: cualquier GPU con al menos 12 GB de VRAM puede alojar tanto el modelo base como el draft model (por ejemplo, RTX 3060 12 GB, RTX 4070, A10, A100). Para producción con SGLang, se recomienda una GPU con soporte FlashInfer (Ampere o superior).
- **¿Cabe en consumer GPU?**: sí, es un modelo pequeño y cabe en GPUs de consumo como la RTX 3060 o superiores.
- **Opciones de despliegue**: SGLang (con `--speculative-algorithm EAGLE3`), también compatible con vLLM si se implementa el soporte de draft models EAGLE3 (no confirmado en la documentación).
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Método | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT (este) | 202,7M | 2048 (entrenamiento) | EAGLE3 online | Apache-2.0 | HuggingFace |
| MNN/Qwen3-4B-Instruct-2507-Eagle3 (ModelScope) | no disponible | no disponible | EAGLE-3 | no disponible | ModelScope |
| Yunhai-Hu/EAGLE-Qwen3 (oficial) | depende del modelo base | variable | EAGLE-1 (entrenado en ShareGPT) | Apache-2.0 | GitHub |

El modelo de `huluhuluu` se diferencia del oficial `EAGLE-Qwen3` en que usa EAGLE3 (una versión más reciente que EAGLE-1) y se entrena online con SpecForge, mientras que el oficial usa EAGLE-1 y un pipeline de entrenamiento más clásico. La variante de MNN en ModelScope también es EAGLE-3 pero no se especifica su procedencia ni parámetros. No hay datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- **No es un modelo de chat**: usarlo como si fuera un LLM independiente producirá resultados incorrectos. Solo tiene sentido como draft model para Qwen3-4B-Instruct-2507.
- **Datos de entrenamiento limitados**: entrenado únicamente con ShareGPT (datos de conversaciones en inglés mayoritariamente). La model card del EAGLE-Qwen3 oficial advierte que para datos no ingleses (como chino) se debe entrenar con datos específicos; este modelo no incluye esa adaptación.
- **Sin métricas de seguridad**: el autor no registró evaluaciones de seguridad ni de calidad. No se recomienda su uso en producción sin una validación previa del sistema completo.
- **Longitud de contexto de entrenamiento**: la secuencia máxima de entrenamiento es 2048 tokens. Aunque no hay ventana deslizante, el rendimiento más allá de ese rango no está garantizado.
- **Dependencia del backend**: el uso requiere SGLang con FlashInfer; otros backends pueden no ser compatibles.
- **Archivo `training_state.pt`**: contiene estado de optimizador y scheduler; debe deserializarse solo en entornos de confianza por riesgo de ejecución de código malicioso.
- **Licencia Apache-2.0**: permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 tiene su propia licencia (Apache-2.0 según los tags, aunque se recomienda verificar la licencia del modelo base para uso comercial).

## Enlaces

- Repositorio del modelo: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-9-step-231810
- Colección de checkpoints: https://huggingface.co/collections/huluhuluu/qwen3-4b-instruct-2507-eagle3-sharegpt-checkpoints
- Ejemplo de otro checkpoint de la colección: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-2-step-50000
- Modelo base Qwen3-4B-Instruct-2507 (Qualcomm AI Hub): https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Draft model EAGLE-3 de MNN en ModelScope: https://www.modelscope.cn/models/MNN/Qwen3-4B-Instruct-2507-Eagle3
- Implementación oficial EAGLE-Qwen3 (GitHub): https://github.com/Yunhai-Hu/EAGLE-Qwen3
