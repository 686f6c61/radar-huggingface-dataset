# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-6-step-145000

## Resumen

El modelo `huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-6-step-145000` es un modelo de borrador (draft model) para decodificación especulativa, entrenado con el algoritmo EAGLE3 sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`. No es un modelo de chat independiente: su única función es acelerar la inferencia del modelo objetivo generando secuencias candidatas que el modelo base verifica en paralelo. Fue desarrollado por el usuario `huluhuluu` mediante el framework SpecForge, utilizando datos ShareGPT limpios y un entrenamiento en línea (online) con el propio modelo objetivo como oráculo.

Este checkpoint concreto corresponde al paso 145.000 de la época 6 de un entrenamiento de 10 épocas y 231.810 pasos totales. La arquitectura es una variante de una sola capa del decoder de Llama (`LlamaForCausalLMEagle3`) con 202,7 millones de parámetros, lo que lo convierte en un modelo ligero y fácil de desplegar junto al modelo base. Su relevancia radica en que permite reducir la latencia de generación en servidores de inferencia como SGLang, manteniendo la calidad del modelo objetivo sin necesidad de cuantizar ni modificar el modelo principal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (1 capa decoder) |
| Parametros totales | 202.700.416 |
| Parametros activos | 202.700.416 (no es MoE) |
| Longitud de contexto | 2048 (máximo de entrenamiento; sin ventana deslizante) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible (depende del modelo base Qwen3-4B-Instruct-2507) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento

El modelo es un draft model EAGLE3, que consiste en una única capa de decoder de Llama con hidden size 2560, intermediate size 9728, 32 cabezas de atención y 8 cabezas de clave/valor. El vocabulario de borrador es de 32.000 tokens, mientras que el vocabulario objetivo es de 151.936 tokens (el del modelo base Qwen3-4B-Instruct-2507). Los pesos se almacenan en bfloat16.

El entrenamiento se realizó con el método online EAGLE3 implementado en SpecForge, usando datos ShareGPT limpios en formato JSONL. Los hiperparámetros relevantes incluyen una tasa de aprendizaje de 1e-4 con warmup lineal del 1,5% y decaimiento coseno, peso de decaimiento 0,0, gradiente máximo 0,5, y un tamaño de secuencia máximo de 2048 tokens. La longitud de la secuencia TTT (test-time training) de EAGLE3 se fijó en 7, y la atención del borrador usa `sdpa`. El backend objetivo es SGLang con FlashInfer, con tensor parallel de 1. El entrenamiento se ejecutó con batch global efectivo de 4, sin acumulación de gradientes, durante 10 épocas y 231.810 pasos de optimización.

Este checkpoint en particular (paso 145.000) es uno de los 47 publicados en la colección, y no se han registrado métricas de evaluación ni de seguridad para esta ejecución.

## Capacidades

- Aceleración de la decodificación especulativa: genera secuencias de borrador de alta calidad que el modelo base Qwen3-4B-Instruct-2507 verifica en paralelo, reduciendo el número de pasos de decodificación secuenciales.
- Compatibilidad con SGLang: diseñado para usarse como `--speculative-draft-model-path` en SGLang con el algoritmo EAGLE3, soportando parámetros como `--speculative-num-steps`, `--speculative-eagle-topk` y `--speculative-num-draft-tokens`.
- Sin ventana deslizante (NoWindow): a diferencia de otras variantes, este checkpoint no impone una restricción de ventana deslizante, lo que permite capturar dependencias de contexto largo dentro del límite de 2048 tokens de entrenamiento.
- Ligereza: con solo 202,7 millones de parámetros, ocupa aproximadamente 0,4 GB en bf16, lo que permite ejecutarlo incluso en GPUs de consumo junto al modelo base.
- Integración con el ecosistema transformers: el checkpoint incluye `config.json` y `model.safetensors`, compatible con la librería transformers para carga y despliegue.

## Casos de uso

- Servidores de inferencia de alta concurrencia: integrar este draft model en SGLang junto a Qwen3-4B-Instruct-2507 para reducir la latencia por petición en entornos de producción con múltiples usuarios concurrentes, manteniendo la calidad del modelo objetivo.
- Despliegue en GPUs de consumo: al ser un modelo de solo 0,4 GB, puede ejecutarse en una RTX 4090 o similar junto al modelo base de 4B, permitiendo acelerar la generación en entornos de desarrollo y pruebas locales.
- Optimización de costes en la nube: al reducir el tiempo de cómputo por token, se disminuye el coste por inferencia en instancias GPU de pago, especialmente en cargas de trabajo con alta tasa de generación.
- Evaluación de estrategias de decodificación especulativa: los 47 checkpoints publicados permiten estudiar el efecto del número de pasos de entrenamiento en la calidad del draft y la tasa de aceptación, útil para investigación en aceleración de LLMs.
- Ajuste de hiperparámetros de EAGLE3: los valores de `num-steps`, `topk` y `num-draft-tokens` pueden ser optimizados para cada carga de trabajo, usando este checkpoint como punto de partida.
- Integración en pipelines de generación de código o chat en tiempo real: cuando la latencia es crítica (asistentes conversacionales, autocompletado de código), el draft model reduce el tiempo de primer token y el tiempo entre tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que "no se registraron métricas de evaluación ni de seguridad para esta ejecución". No se dispone de datos de tasa de aceptación, latencia relativa ni comparaciones con otros draft models.

## Requisitos de hardware

- VRAM estimada: el modelo pesa aproximadamente 0,4 GB en bf16 (202,7M parámetros × 2 bytes). En cuantización de 8 bits ocuparía ~0,2 GB y en 4 bits ~0,1 GB, aunque no se ofrecen archivos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM libre, incluyendo RTX 3060, RTX 4090, A100, H100, etc. Se ejecuta junto al modelo base Qwen3-4B-Instruct-2507 (que requiere ~8 GB en bf16), por lo que el conjunto cabe en GPUs de 12 GB o más.
- Opciones de despliegue: SGLang (con FlashInfer) es el backend objetivo; también puede cargarse con transformers para pruebas, aunque su utilidad principal es como draft path en SGLang.
- Latencia y throughput: no se han publicado mediciones. El rendimiento depende del modelo base, la tasa de aceptación del draft y los parámetros de árbol de EAGLE3.

## Comparativa con modelos similares

No se dispone de información sobre otros draft models EAGLE3 comparables en la información proporcionada. Los checkpoints de la misma colección (epoch 6, pasos 140.000 y 155.000) son variantes del mismo entrenamiento y no se pueden comparar directamente sin datos de evaluación. Se puede mencionar que EAGLE3 es una evolución de EAGLE-2 y Medusa, pero no hay datos numéricos para una comparativa rigurosa.

## Limitaciones y advertencias

- No es un modelo de chat: no debe usarse como modelo independiente para generar respuestas; solo funciona como draft en decodificación especulativa junto al modelo base exacto `Qwen/Qwen3-4B-Instruct-2507`.
- Sin métricas de seguridad ni evaluación: la model card indica que no se registraron métricas de evaluación ni de seguridad, por lo que no hay garantías sobre la calidad del draft en escenarios adversos.
- Sesgos y alucinación: al ser un modelo de borrador, no genera contenido final; los sesgos y alucinaciones provienen del modelo base, que no ha sido evaluado en este contexto.
- Limitación de contexto: el entrenamiento se realizó con secuencias de máximo 2048 tokens; aunque no hay ventana deslizante, el draft puede degradarse en contextos más largos que los vistos en entrenamiento.
- Deserialización de `training_state.pt`: este archivo contiene estado de optimizador y argumentos de entrenamiento; solo debe abrirse en entornos de confianza.
- Dependencia de versión de SGLang: la integración requiere una versión de SGLang que soporte EAGLE3 y FlashInfer; puede haber incompatibilidades con versiones antiguas o alternativas.
- Licencia Apache-2.0: permite uso comercial y modificación, pero el modelo base Qwen3-4B-Instruct-2507 tiene su propia licencia (Apache-2.0 según el repositorio base, aunque se recomienda verificar).

## Enlaces

- Repositorio del modelo: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-6-step-145000
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Checkpoint relacionado (paso 155.000): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-6-step-155000
- Checkpoint relacionado (paso 140.000): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-6-step-140000
