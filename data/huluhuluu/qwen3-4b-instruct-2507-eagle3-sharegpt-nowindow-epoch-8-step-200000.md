# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-8-step-200000

## Resumen

El modelo `huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-8-step-200000` es un modelo de borrador (draft model) para decodificación especulativa, entrenado con el algoritmo EAGLE3 sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`. No es un modelo de chat independiente, sino un componente auxiliar que se empareja con el modelo objetivo para acelerar su inferencia en entornos de servicio como SGLang. Lo desarrolla el autor huluhuluu mediante el framework SpecForge, que permite entrenamiento online de modelos de borrador durante el despliegue.

El modelo tiene 202,7 millones de parámetros, lo que lo hace muy ligero (0,4 GB en bfloat16), y está diseñado para predecir múltiples tokens por paso de decodificación, reduciendo el número de llamadas al modelo principal y mejorando el throughput. Se distribuye bajo licencia Apache-2.0 en formato safetensors. Este checkpoint concreto corresponde a la época 8, paso 200,000, dentro de una serie de 47 checkpoints publicados por el autor en una colección dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decoder, EAGLE3) |
| Parametros totales | 202.700.416 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 (máxima secuencia de entrenamiento) |
| Tipos de cuantizacion | bfloat16 (pesos originales) |
| Idiomas soportados | No disponible (el modelo base es multilingüe; el dato de entrenamiento ShareGPT es mayoritariamente inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un draft model EAGLE3, una arquitectura diseñada para decodificación especulativa. Consta de una única capa decoder con hidden size 2560, intermediate size 9728, 32 cabezas de atención y 8 cabezas key/value. El vocabulario de borrador es de 32.000 tokens, mientras que el vocabulario objetivo del modelo base es de 151.936 tokens. Los pesos están en bfloat16.

El entrenamiento se realizó con SpecForge, un framework de entrenamiento online para EAGLE3, sobre un dataset ShareGPT limpio (fuente local, revisión no registrada). Se ejecutaron 10 épocas con un total de 231.810 pasos de optimización, batch efectivo global de 4 (data-parallel size 4, sin acumulación de gradientes), learning rate 1e-4 con warmup lineal del 1,5% y posterior annealing coseno, weight decay 0,0 y gradiente máximo 0,5. La longitud máxima de secuencia fue 2048 tokens, con EAGLE3 TTT length de 7. La atención del draft usa SDPA y el backend objetivo es SGLang con flashinfer. No se aplicó ventana deslizante en este run estándar.

## Capacidades

- Aceleración de la inferencia del modelo Qwen3-4B-Instruct-2507 mediante decodificación especulativa EAGLE3.
- Predicción de múltiples tokens por paso (configuración típica: 3-4 tokens de borrador), reduciendo el número de llamadas al modelo base.
- Integración nativa con SGLang mediante la opción `--speculative-algorithm EAGLE3` y la ruta al checkpoint de borrador.
- No es un modelo de chat: no genera texto de forma autónoma ni tiene capacidades de tool calling, agentes o razonamiento por sí mismo.
- No soporta visión, audio u otras modalidades; es exclusivamente un modelo de texto auxiliar.

## Casos de uso

- Despliegue de inferencia de alto rendimiento con SGLang: se usa como ruta de borrador especulativa para el modelo Qwen3-4B-Instruct-2507, reduciendo la latencia por token y aumentando el throughput en servidores de producción.
- Optimización de costes en entornos con GPU limitadas: al acelerar la decodificación, se puede servir más peticiones concurrentes con la misma infraestructura.
- Evaluación de estrategias de decodificación especulativa: investigadores pueden comparar la eficacia de distintos checkpoints de EAGLE3 variando parámetros como `--speculative-num-steps`, `--speculative-eagle-topk` y `--speculative-num-draft-tokens`.
- Experimentación con entrenamiento online de draft models: el repositorio incluye `training_state.pt` con el estado del optimizador, útil para reanudar entrenamientos o estudiar la dinámica de SpecForge.
- Integración en pipelines de servicio de modelos LLM en producción donde se requiera baja latencia para aplicaciones interactivas (chatbots, asistentes).
- Benchmarking de rendimiento de inferencia: permite medir la aceleración relativa frente a la decodificación autorregresiva estándar del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se registraron métricas de evaluación ni de seguridad para este run. Se recomienda realizar pruebas de rendimiento propias en el entorno de despliegue objetivo.

## Requisitos de hardware

- El checkpoint de borrador ocupa aproximadamente 0,4 GB en bfloat16, por lo que su huella de memoria es mínima.
- Para la inferencia conjunta con el modelo base Qwen3-4B-Instruct-2507, se necesita VRAM suficiente para ambos modelos. El modelo base en bfloat16 ocupa unos 8 GB, pero con cuantización 4-bit (por ejemplo, AWQ o GPTQ) puede reducirse a unos 2-3 GB, permitiendo ejecutar el conjunto en GPUs consumer de 8 GB (RTX 3070, RTX 4060 Ti, etc.).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para el par completo; para despliegues de producción con alta concurrencia, se recomiendan GPUs con 16 GB o más (A100, H100, RTX 4090).
- Opciones de despliegue: SGLang es el backend principal soportado, con backend flashinfer. No se mencionan otros runners como vLLM o llama.cpp en la documentación.
- La latencia y el throughput dependen de la configuración de decodificación especulativa (número de pasos de borrador, topk, etc.) y de la carga de trabajo; no hay datos oficiales publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia |
|---|---|---|---|---|
| huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3 (este) | 202,7 M | 2048 (entrenamiento) | Draft EAGLE3 para Qwen3-4B-Instruct-2507 | Apache-2.0 |
| MNN/Qwen3-4B-Instruct-2507-Eagle3 | No disponible | No disponible | Draft EAGLE3 para Qwen3-4B-Instruct-2507 | No disponible |
| Otros checkpoints de la coleccion huluhuluu (47 en total) | 202,7 M cada uno | 2048 (entrenamiento) | Draft EAGLE3 para Qwen3-4B-Instruct-2507 | Apache-2.0 |

No hay datos de rendimiento comparativo entre estos modelos de borrador. Se debe evaluar empíricamente en el entorno de despliegue.

## Limitaciones y advertencias

- No es un modelo de chat ni un LLM independiente; solo funciona como componente de decodificación especulativa junto con el modelo base Qwen3-4B-Instruct-2507.
- No se registraron métricas de seguridad ni de evaluación; el modelo no ha sido validado para sesgos, alucinaciones o comportamientos peligrosos.
- El entrenamiento se realizó con datos ShareGPT, que son principalmente conversaciones en inglés; el rendimiento en otros idiomas puede ser inferior, aunque el modelo base es multilingüe.
- La ventana de contexto de entrenamiento es de 2048 tokens; para contextos más largos, el comportamiento del draft model no está garantizado.
- El archivo `training_state.pt` contiene estado del optimizador y argumentos de entrenamiento; debe deserializarse solo en entornos de confianza por riesgo de ejecución de código arbitrario.
- Los parámetros de decodificación especulativa (número de pasos, topk, tokens de borrador) deben ajustarse mediante benchmarking en la carga de trabajo real; los valores del ejemplo son puntos de partida, no óptimos garantizados.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido ampliamente probado por la comunidad.

## Enlaces

- Repositorio HuggingFace del checkpoint: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-8-step-200000
- Colección de checkpoints EAGLE3 de huluhuluu: https://huggingface.co/collections/huluhuluu/qwen3-4b-instruct-2507-eagle3-sharegpt-checkpoints
- Repositorio oficial EAGLE-Qwen3 (implementación de EAGLE-1/2/3): https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Página del modelo base en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Modelo similar en ModelScope (MNN): https://www.modelscope.cn/models/MNN/Qwen3-4B-Instruct-2507-Eagle3
