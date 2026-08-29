# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-6-step-150000

## Resumen

Este repositorio contiene el checkpoint de entrenamiento `epoch-6-step-150000` del modelo de borrador (draft model) EAGLE3 entrenado con SpecForge para acelerar la inferencia de `Qwen/Qwen3-4B-Instruct-2507` mediante decodificación especulativa. No es un modelo de chat independiente: su única función es proponer tokens candidatos que el modelo objetivo valida en paralelo, reduciendo la latencia de generación en despliegues servidos con SGLang.

El autor, `huluhuluu`, publica una colección de 47 checkpoints desde `epoch_0_step_5000` hasta `epoch_9_step_231810`, cada uno como repositorio independiente. Este checkpoint concreto corresponde al paso 150000 de la época 6, entrenado sobre un dataset ShareGPT limpio (fuente local, sin revisión registrada) con una ventana de contexto de 2048 tokens y sin límite de ventana deslizante.

La arquitectura es `LlamaForCausalLMEagle3`, con 202.700.416 parámetros en precisión bfloat16, lo que supone un peso de apenas 0,4 GB. Su relevancia actual radica en que Qwen3-4B-Instruct-2507 es un modelo multilingüe de 4B parámetros muy utilizado en producción, y un draft model bien entrenado puede multiplicar el throughput del servidor sin sacrificar calidad de salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decoder, hidden size 2560, intermediate 9728, 32 heads de atencion, 8 key/value heads) |
| Parametros totales | 202.700.416 |
| Parametros activos | No aplica (modelo denso de una sola capa) |
| Longitud de contexto | 2048 tokens (maximo durante entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible (el dataset ShareGPT usado es mayoritariamente ingles; el modelo base Qwen3-4B-Instruct-2507 es multilingue) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un draft model EAGLE3, una familia de arquitecturas diseñada para decodificación especulativa. Consiste en una única capa decoder que toma como entrada los hidden states del modelo objetivo y predice varios tokens futuros de forma autoregresiva, construyendo un arbol de candidatos que el modelo objetivo verifica en paralelo. En este caso, la capa tiene hidden size 2560, intermediate size 9728, 32 heads de atencion y 8 key/value heads, con un vocabulario de borrador de 32000 tokens frente al vocabulario objetivo de 151936.

El entrenamiento se realizó con SpecForge, un framework de entrenamiento online para draft models, sobre un dataset ShareGPT limpio (formato JSONL, revision no registrada). Los hiperparámetros principales incluyen 10 épocas, 231810 pasos de optimizador, batch efectivo de 4 (per-device 1 con data-parallel 4), learning rate 1e-4 con warmup lineal del 1,5% y posterior cosine annealing, weight decay 0, max grad norm 0,5 y longitud máxima de secuencia 2048. El parámetro EAGLE3 TTT length es 7, la atención del draft usa `sdpa` y el backend objetivo es SGLang con flashinfer. No se registraron métricas de evaluación ni de seguridad durante el entrenamiento.

## Capacidades

- Aceleración de inferencia: como draft model, propone entre 1 y N tokens candidatos por paso que el modelo objetivo valida en paralelo, reduciendo el número de iteraciones autoregresivas necesarias.
- Compatibilidad con SGLang: se integra como ruta de draft especulativa mediante `--speculative-algorithm EAGLE3`, con parámetros configurables de pasos, top-k y número de tokens de borrador.
- Soporte de arbol de especulación: permite configurar `--speculative-num-steps`, `--speculative-eagle-topk` y `--speculative-num-draft-tokens` para ajustar el equilibrio entre tasa de aceptación y coste computacional.
- Sin límite de ventana deslizante: la variante "NoWindow" no aplica restricciones de ventana, por lo que puede aprovechar todo el contexto de 2048 tokens.
- No apto para generación directa: no es un modelo de chat ni genera texto de forma autónoma; requiere emparejarse con el modelo objetivo exacto.

## Casos de uso

- Servicio de chat de producción con Qwen3-4B-Instruct-2507: desplegar este draft model junto al modelo objetivo en SGLang reduce la latencia percibida por el usuario final, especialmente en cargas de trabajo con muchas peticiones concurrentes de baja latencia.
- Optimización de costes de inferencia: al reducir el número de pasos autoregresivos del modelo grande, se libera capacidad de cómputo en la GPU, permitiendo servir más peticiones por segundo con el mismo hardware.
- Evaluación de trade-offs de especulación: los 47 checkpoints publicados (diferentes épocas y pasos) permiten comparar empíricamente la tasa de aceptación y la latencia resultante para una carga de trabajo concreta, y seleccionar el checkpoint óptimo.
- Entornos con presupuesto de VRAM ajustado: con solo 0,4 GB de pesos en bfloat16, el overhead adicional sobre el modelo objetivo (4B, ~8 GB en bf16) es mínimo, lo que facilita su inclusión en instancias con GPU de 12-16 GB sin necesidad de cuantizar el modelo principal.
- Fine-tuning de draft models para dominios específicos: el checkpoint sirve como punto de partida para reentrenar con SpecForge sobre datasets propios si la distribución de tokens del dominio difiere de ShareGPT.
- Investigación en decodificación especulativa: permite reproducir experimentos de entrenamiento online EAGLE3 y estudiar el efecto del número de pasos, top-k y tokens de borrador sobre la tasa de aceptación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se registraron métricas de evaluación ni de seguridad durante el entrenamiento. Para conocer el rendimiento real en latencia y throughput, es necesario ejecutar una evaluación propia con SGLang sobre la carga de trabajo objetivo.

## Requisitos de hardware

- VRAM estimada para inferencia: el draft model ocupa aproximadamente 0,4 GB en bfloat16 (202,7M parámetros). Sin embargo, debe ejecutarse junto al modelo objetivo Qwen3-4B-Instruct-2507, que en bf16 ocupa unos 8 GB, por lo que la VRAM total mínima recomendada es de 12 GB.
- GPU recomendadas: cualquier GPU con 12 GB o más de VRAM, como RTX 3060 12GB, RTX 4070 Ti, RTX 4090, A10, A100 o H100. Para cargas de producción con alta concurrencia se recomienda al menos una A100 40GB o H100.
- Posibilidad de uso en consumer GPU: sí, cabe en GPUs de gama media-alta de consumo siempre que el modelo objetivo quepa también (por ejemplo, RTX 4090 de 24 GB permite servir el conjunto completo sin cuantización).
- Opciones de despliegue: SGLang con backend flashinfer (único método documentado en la model card). No se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles. Dependen de la tasa de aceptación del draft, que no ha sido medida públicamente, y de la configuración del árbol de especulación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Funcion |
|---|---|---|---|---|
| huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-6-step-150000 | 202,7M | 2048 | Apache-2.0 | Draft model EAGLE3 para Qwen3-4B-Instruct-2507 |
| huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-6-step-150000 | 202,7M (presumible) | 2048 | Apache-2.0 | Variante con ventana deslizante (no confirmado) |
| Qwen/Qwen3-4B-Instruct-2507 (modelo objetivo) | 4B | 32K (base) | Apache-2.0 | Modelo de chat instruct multilingue |

No hay disponibles draft models EAGLE3 alternativos de otros autores para Qwen3-4B-Instruct-2507 en la información recopilada. La comparativa con el modelo objetivo no es directa porque cumplen funciones distintas: el draft model no genera texto por sí mismo, sino que acelera la generación del modelo objetivo.

## Limitaciones y advertencias

- No es un modelo de chat: usarlo como tal producirá salidas sin sentido. Debe emparejarse exclusivamente con `Qwen/Qwen3-4B-Instruct-2507`.
- Sesgo lingüístico: el dataset ShareGPT ha eliminado datos no ingleses (según documentación del proyecto EAGLE-Qwen3), por lo que la tasa de aceptación del draft puede degradarse significativamente en idiomas distintos del inglés, como español o chino.
- Sin evaluación de seguridad: la model card indica que no se registraron métricas de seguridad ni de evaluación. No hay garantías sobre el comportamiento del modelo en escenarios adversos.
- Sin métricas de rendimiento: no se han publicado tasas de aceptación, latencia ni throughput. Los valores de configuración sugeridos en la model card son puntos de partida y deben ser ajustados mediante benchmarking.
- Archivo `training_state.pt`: contiene estado del optimizador y argumentos de entrenamiento; solo debe deserializarse en un entorno confiable por riesgo de ejecución de código arbitrario.
- Contexto limitado a 2048 tokens: aunque el modelo base soporta ventanas mayores, este draft fue entrenado con un máximo de 2048 tokens, por lo que su eficacia puede degradarse con secuencias más largas.
- No apto para uso comercial directo sin verificación: aunque la licencia es Apache-2.0, al ser un modelo intermedio sin validación, cualquier despliegue en producción requiere pruebas previas exhaustivas.

## Enlaces

- Repositorio del checkpoint: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-6-step-150000
- Checkpoint hermano (variante con ventana): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-6-step-150000
- Checkpoint de otra época: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-7-step-185000
- Repositorio oficial EAGLE-Qwen3 (GitHub): https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Página del modelo base en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- README del modelo base en Qualcomm AI Hub (GitHub): https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/qwen3_4b_instruct_2507/README.md
