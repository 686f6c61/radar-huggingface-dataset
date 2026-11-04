# Raghav-Singhal/1pp-0.58b-v2-asst-rawanneal-base

## Resumen

1pp-0.58b-v2-asst-rawanneal-base es un modelo de lenguaje de 580 millones de parámetros desarrollado por Raghav Singhal (EPFL DLAB) como parte del proyecto One Persona Pretraining (1PP). No es un asistente de propósito general, sino un artefacto de investigación diseñado para estudiar cómo afecta la composición del corpus de preentrenamiento (documentos originales frente a conversaciones reescritas) al comportamiento del modelo. Este checkpoint concreto corresponde a la variante "rawanneal": entrena sobre documentos DCLM-edu hasta el paso 9.996 y después aplica el cooldown sobre conversaciones 1PP reescritas a partir de esos mismos documentos.

La arquitectura es un decoder estilo Llama de 24 capas, hidden size 1.152, FFN 4.608 con SwiGLU, 9 cabezas de atención y 3 cabezas KV (GQA con dimensión de cabeza 128), RMSNorm, RoPE con base 10.000, embeddings no atados y longitud de secuencia de 4.096 tokens. Usa el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`.

El modelo forma parte de la "ladder v2" del proyecto: cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B) cruzados con tres condiciones de datos y tres semillas, cada uno entrenado desde cero durante 20,3 tokens de asistente por parámetro sobre el mismo flujo de datos alineado por paso. Su relevancia es metodológica: permite aislar el efecto de la formulación conversacional frente a la documental en el preentrenamiento, con control estricto de semilla y orden de batches.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.152, FFN 4.608 SwiGLU, GQA 9/3 cabezas, RMSNorm, RoPE base 10.000, embeddings no atados) |
| Parametros totales | 580.445.568 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en bf16) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 24 capas con normalización RMSNorm, activación SwiGLU en la FFN y atención con query/key/value de 9/3 cabezas (GQA), dimensión de cabeza 128 y RoPE con base 10.000. No usa QK-norm ni biases, y los embeddings de entrada y salida no están atados. El tokenizador es el de SmolLM2 (49.152 tokens) más un token `<|pad|>`; `<|endoftext|>` marca fin de documento.

El entrenamiento se realizó sobre el flujo de datos alineado por paso del proyecto 1PP: los primeros 9.996 pasos (de un total de 11.106) usan documentos DCLM-edu originales, y los últimos 1.110 pasos (el cooldown) usan conversaciones 1PP reescritas a partir de esos mismos documentos, con pérdida calculada únicamente sobre los turnos del asistente. El batch global es de 512 secuencias × 4.096 tokens con enmascaramiento de atención entre documentos. El optimizador es Muon (matrix LR 0.005, shape scaling) para las matrices y Adam para el resto de parámetros (LR 3e-3 para embeddings, capa de salida y normas), con warmup de 699 pasos, fase constante y decaimiento lineal en los últimos 1.110 pasos hasta 1/100. Weight decay 0,1, init std 0,0119, precisión bf16. En total, 20,3 tokens de asistente por parámetro.

La pérdida de validación del checkpoint final (por token, sobre 2.433 documentos retenidos) es de 1,810 sobre texto de asistente, 3,545 sobre texto de usuario, 3,165 sobre texto de documento y 1,857 sobre los tokens de entrenamiento de esta condición (ponderación `reweighted_seg34`). Los pesos de HuggingFace se verificaron contra el checkpoint de Megatron con diferencias absolutas de 0,0016 y 0,0014 en dos conjuntos de validación.

## Capacidades

- Generación de texto autoregresiva en inglés con formato de conversación ChatML (sin turno de sistema).
- Producción de texto con estructura de diálogo usuario/asistente aprendida durante el cooldown, aunque es un modelo base y no un asistente alineado.
- Modelado de lenguaje sobre documentos y conversaciones, útil para evaluación de pérdida y análisis de distribuciones.
- No dispone de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al inglés; el vocabulario SmolLM2 cubre otros idiomas pero el entrenamiento es monolingüe.
- Formato de parada: genera hasta `<|im_end|>` (id 2) o `<|endoftext|>` (id 0), ambos declarados en `eos_token_id`.

## Casos de uso

- Investigación sobre preentrenamiento conversacional: comparar este checkpoint con `1pp-0.58b-v2-raw-base` y `1pp-0.58b-v2-asst-base` para aislar el efecto del cooldown sobre conversaciones frente al cooldown sobre documentos, manteniendo el mismo flujo de datos y la misma semilla.
- Análisis de pérdida de validación por segmento: usar los conjuntos de validación del proyecto para medir cómo se distribuye la pérdida entre texto de asistente, usuario y documento, y validar réplicas de entrenamiento.
- Reproducibilidad de experimentos de scaling: al ser parte de una ladder con cuatro tamaños y tres semillas, sirve para estudiar leyes de escala controlando la condición de datos y la inicialización.
- Estudio de sesgos de formato: analizar cómo el modelo reproduce la estructura ChatML sin haber recibido un turno de sistema, útil para investigar la transferencia de formato desde datos sintéticos.
- Baseline ligero para experimentos de destilación o fine-tuning: con 580M parámetros y licencia Apache 2.0, puede servir como punto de partida en entornos con recursos limitados, siempre que se documente su origen de investigación.
- Evaluación de tokenizadores: al usar el vocabulario SmolLM2, permite comparar eficiencia de tokenización y pérdida por token con modelos de la familia SmolLM2 en corpus educativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pérdidas de validación por token:

| Conjunto | Pérdida (por token) |
|---|---|
| Texto de asistente | 1,810 |
| Texto de usuario | 3,545 |
| Texto de documento | 3,165 |
| Tokens de entrenamiento de la condición (`reweighted_seg34`) | 1,857 |
| Validación HF vs Megatron, val50m segmentos [3] | 1,8079 (referencia 1,8096, diff 0,0016) |
| Validación HF vs Megatron, raw_val50m segmentos [8] | 3,1668 (referencia 3,1654, diff 0,0014) |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,2 GB de pesos más overhead de activaciones y caché KV; en la práctica, entre 2 y 3 GB para secuencias de 4.096 tokens.
- En fp16/bf16 cabe en cualquier GPU consumer con 6 GB o más (RTX 3060, RTX 4060, RTX 4090).
- Cuantizado a 8 bits o 4 bits (si se generan pesos GGUF/AWQ, no publicados) cabría en GPUs con 4 GB o incluso en CPU.
- GPU recomendadas para throughput: A100, H100 o L40S para servir en lote; RTX 4090 para experimentación local.
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (etiqueta `text-generation-inference`), vLLM y llama.cpp/Ollama previa conversión a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| 1pp-0.58b-v2-asst-rawanneal-base | 580M | 4.096 | Apache 2.0 | Investigación 1PP, cooldown sobre conversaciones |
| 1pp-0.58b-v2-asst-base | 580M | 4.096 | Apache 2.0 | Investigación 1PP, condición completa de conversaciones |
| 1pp-0.58b-v2-raw-base | 580M | 4.096 | Apache 2.0 | Investigación 1PP, condición de documentos originales |
| SmolLM2-360M / SmolLM2-1.7B | 360M / 1,7B | 8.192 (SmolLM2) | Apache 2.0 | Modelos pequeños de propósito general con el mismo vocabulario |

La comparación con SmolLM2 es pertinente por compartir tokenizador y rango de tamaño, pero no se dispone de resultados de benchmarks de este checkpoint para establecer una comparación de rendimiento.

## Limitaciones y advertencias

- Es un modelo base de investigación, no un asistente alineado: no ha pasado por RLHF ni DPO, y puede generar contenido incoherente, ofensivo o factualmente incorrecto.
- Riesgo elevado de alucinación en tareas de conocimiento factual, dado el tamaño y el volumen de entrenamiento (23,29B posiciones de token en esta variante).
- El modelo nunca vio un turno de sistema; introducir uno en el prompt puede degradar la calidad de la generación.
- Contexto limitado a 4.096 tokens y entrenamiento monolingüe en inglés; el rendimiento fuera del inglés no está garantizado.
- La licencia Apache 2.0 permite uso comercial, pero el autor declara explícitamente que no es un asistente de propósito general; su uso en producción requeriría fine-tuning y evaluación adicionales.
- Los pesos publicados solo están en safetensors; no hay versiones cuantizadas oficiales ni garantías de compatibilidad con todos los motores de inferencia.
- El checkpoint deriva de un flujo de datos con enmascaramiento entre documentos; la inferencia con prompts muy largos o concatenaciones puede comportarse de forma distinta a la esperada.

## Enlaces

- HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-asst-rawanneal-base
- Variante raw: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-raw-base
- Variante 1PP completa: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-asst-base
- Colección 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento: https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT: https://wandb.ai/raghav_singhal/1pp-sft
