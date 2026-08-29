# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-1-step-35000

## Resumen

`huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-1-step-35000` es un modelo de borrador (draft model) diseñado exclusivamente para decodificación especulativa mediante el algoritmo EAGLE-3, entrenado sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`. El autor, identificado como `huluhuluu`, ha publicado este checkpoint como parte de una colección de 47 puntos de control que cubren el entrenamiento completo de 10 épocas sobre datos ShareGPT limpios, utilizando la herramienta SpecForge para el entrenamiento en línea de EAGLE-3. Este modelo no es un modelo de chat independiente: su única función es acelerar la inferencia del modelo objetivo, generando múltiples tokens candidatos que el modelo base verifica en paralelo.

La relevancia de este checkpoint radica en que aborda un problema práctico de despliegue: la latencia de los modelos grandes de lenguaje. Al añadir un modelo de borrador ligero (202,7 millones de parámetros frente a los 4.000 millones del modelo base), se puede reducir el tiempo de generación por token en servidores de inferencia como SGLang, sin modificar la calidad de las respuestas, ya que la verificación final la realiza el modelo original.

El checkpoint concreto corresponde a la época 1, paso 35000, y se publica en formato `safetensors` con pesos en `bfloat16`. Su arquitectura es una variante de Llama con una única capa de decoder y un vocabulario de borrador de 32.000 tokens, mientras que el vocabulario objetivo es de 151.936 tokens. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (1 capa de decoder, hidden size 2560, intermediate size 9728, 32 cabezas de atencion, 8 cabezas KV) |
| Parametros totales | 202.700.416 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 (maxima longitud de secuencia durante el entrenamiento; no se especifica limite en inferencia) |
| Tipos de cuantizacion | bfloat16 (pesos originales); no se han publicado cuantizaciones adicionales |
| Idiomas soportados | No disponible (el modelo base Qwen3-4B-Instruct-2507 es multilingue, pero este draft model no especifica idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura EAGLE-3, una evolución del esquema de decodificación especulativa EAGLE. A diferencia de EAGLE-1, que predecía características de la capa superior, EAGLE-3 elimina la restricción de predicción de características y simula el proceso de entrenamiento mediante *training-time testing*. El modelo de borrador fusiona características semánticas de bajo, medio y alto nivel para generar múltiples tokens plausibles en paralelo, que luego son verificados por el modelo base.

El entrenamiento se realizó con SpecForge, un framework para entrenamiento en línea de modelos de borrador, sobre un dataset ShareGPT limpio en formato JSONL (la revisión exacta del dataset no está registrada). Los hiperparámetros principales incluyen 10 épocas, 231.810 pasos de optimización, tamaño de lote efectivo de 4, tasa de aprendizaje de 1e-4 con calentamiento lineal del 1,5% y decaimiento coseno, y una longitud máxima de secuencia de 2048 tokens. El parámetro TTT (training-time testing) se fijó en 7, y la atención del borrador usa `sdpa` (scaled dot-product attention). El backend objetivo es SGLang con FlashInfer, aunque el checkpoint es compatible con Transformers.

El entrenamiento se realizó en paralelo de datos con 4 dispositivos, y se guardaron checkpoints cada 5.000 pasos. No se registraron métricas de evaluación ni de seguridad durante el entrenamiento, según la model card.

## Capacidades

- **Decodificación especulativa**: genera hasta 4 tokens candidatos por paso (configuración recomendada `--speculative-num-draft-tokens 4`) que el modelo base verifica, reduciendo la latencia de inferencia.
- **Compatibilidad con SGLang**: se integra como ruta de borrador en SGLang mediante el algoritmo EAGLE3, con parámetros configurables como número de pasos especulativos y top-k.
- **No es un modelo de chat**: no genera respuestas directas; requiere el modelo base Qwen3-4B-Instruct-2507 como verificador.
- **Soporte de tool calling y agentes**: no disponible, ya que estas capacidades residen en el modelo base, no en el borrador.
- **Capacidades multilingües**: no especificadas para este checkpoint; el modelo base es multilingüe, pero el borrador no declara soporte idiomático propio.
- **Modo de pensamiento**: no aplica; el modelo base Qwen3-4B-Instruct-2507 no incluye modo de pensamiento, según fuentes externas.

## Casos de uso

- **Reducción de latencia en servidores de inferencia**: desplegar SGLang con este draft model junto a Qwen3-4B-Instruct-2507 permite atender más peticiones por segundo en aplicaciones de chat o generación de texto, manteniendo la calidad del modelo base. Es adecuado para entornos de producción con alta concurrencia.
- **Optimización de costes en GPU**: al acelerar la generación, se reduce el tiempo de ocupación de la GPU por petición, lo que permite servir el mismo volumen de tráfico con menos hardware o con GPUs de menor gama.
- **Integración en pipelines de RAG**: en sistemas de recuperación aumentada que generan respuestas largas, la decodificación especulativa acelera la fase de generación sin alterar la lógica de recuperación, mejorando la experiencia del usuario en asistentes virtuales.
- **Evaluación comparativa de algoritmos de decodificación**: investigadores pueden comparar el rendimiento de EAGLE-3 frente a otros esquemas (p. ej., EAGLE-1, Medusa) utilizando este checkpoint como referencia reproducible.
- **Pruebas de concepto en entornos académicos**: sirve como ejemplo de entrenamiento en línea de draft models con SpecForge, permitiendo estudiar el impacto del tamaño del borrador y los hiperparámetros en la tasa de aceptación de tokens.
- **Despliegue en edge computing**: dado su tamaño reducido (0,4 GB), el modelo de borrador puede residir en memoria junto al modelo base en dispositivos con VRAM limitada, facilitando la inferencia local en estaciones de trabajo con GPUs consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se registraron métricas de evaluación ni de seguridad durante el entrenamiento. Por tanto, no se dispone de datos de rendimiento como tasa de aceptación de tokens, velocidad de generación (tokens/segundo) o comparativas con otros draft models.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo de borrador en bfloat16 ocupa aproximadamente 0,4 GB. Sin embargo, al operar junto al modelo base Qwen3-4B-Instruct-2507 (que requiere unos 8 GB en bfloat16), la VRAM total necesaria es de al menos 9-10 GB.
- **GPU recomendadas**: cualquier GPU con 12 GB o más de VRAM puede alojar ambos modelos. Se recomienda una NVIDIA RTX 3090/4090, A10, A100 o H100 para entornos de producción con alta concurrencia.
- **Compatibilidad con GPU consumer**: sí, cabe en GPUs consumer como la RTX 3060 12GB, RTX 3080, RTX 4090, siempre que la VRAM total sea suficiente para el modelo base más el borrador.
- **Opciones de despliegue**: SGLang (backend principal con soporte FlashInfer), vLLM (si se añade soporte EAGLE3, no confirmado en la documentación), y Transformers para pruebas locales (aunque la decodificación especulativa requiere implementación específica).
- **Latencia y throughput estimados**: no disponibles. Dependen del hardware, del tamaño de lote y de la tasa de aceptación de tokens, que no ha sido medida públicamente.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este checkpoint. Como referencia cualitativa, se puede comparar con otros draft models de decodificación especulativa:

| Modelo | Parametros | Contexto | Metodo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-Instruct-2507-EAGLE3 (este) | 202,7 M | 2048 (entrenamiento) | EAGLE-3 | Apache-2.0 | HuggingFace |
| EAGLE-1 (para Llama-2 13B, ejemplo) | ~1 B (aprox.) | no disponible | EAGLE-1 | no disponible | GitHub |
| Medusa (para Llama-2 7B) | ~200 M (aprox.) | no disponible | Medusa | no disponible | GitHub |

Los datos de EAGLE-1 y Medusa son orientativos y no provienen de la información proporcionada; se indican como contexto general, pero no se garantiza su exactitud. Para una comparativa rigurosa, sería necesario consultar las publicaciones oficiales de cada método.

## Limitaciones y advertencias

- **No es un modelo de chat independiente**: usarlo directamente para generar texto producirá resultados sin sentido; debe emparejarse siempre con el modelo base Qwen3-4B-Instruct-2507.
- **Sin métricas de seguridad**: la model card no registra evaluaciones de sesgo, toxicidad o alineación. No se recomienda su uso en aplicaciones sensibles sin una validación previa del sistema completo.
- **Entrenamiento con ShareGPT**: el dataset ShareGPT puede contener sesgos y contenido no filtrado; esto puede afectar indirectamente a la distribución de tokens que el borrador propone, aunque el modelo base verifica y filtra las salidas finales.
- **Longitud de contexto limitada**: el entrenamiento se realizó con secuencias máximas de 2048 tokens; para contextos más largos, el rendimiento del borrador podría degradarse y la tasa de aceptación podría disminuir.
- **Restricciones de producción**: la configuración de decodificación especulativa (número de pasos, top-k, tokens de borrador) requiere ajuste empírico para cada carga de trabajo; los valores recomendados en la model card son puntos de partida, no óptimos garantizados.
- **Archivo `training_state.pt`**: contiene estado de optimizador y argumentos de entrenamiento; solo debe deserializarse en entornos de confianza, ya que podría ejecutar código arbitrario si se manipula.

## Enlaces

- Repositorio del modelo: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-1-step-35000
- Colección de checkpoints: https://huggingface.co/collections/huluhuluu/qwen3-4b-instruct-2507-eagle3-sharegpt-checkpoints
- Repositorio oficial EAGLE-Qwen3 (GitHub): https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Modelo base en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
