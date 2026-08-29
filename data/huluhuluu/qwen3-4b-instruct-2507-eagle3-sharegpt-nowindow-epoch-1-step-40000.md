# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-1-step-40000

## Resumen

Este repositorio contiene un checkpoint concreto del entrenamiento online EAGLE3 de un modelo borrador (draft model) para decodificación especulativa, entrenado por el usuario huluhuluu con la herramienta SpecForge sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`. No es un modelo de chat independiente: su única función es acelerar la inferencia del modelo objetivo mediante la generación anticipada de tokens candidatos que después son verificados por el modelo grande. El checkpoint corresponde a la época 1, paso 40000 de un entrenamiento de 10 épocas y 231810 pasos.

El modelo tiene 202,7 millones de parámetros, una sola capa decoder con hidden size de 2560 e intermediate size de 9728, y está diseñado para integrarse como ruta de borrador en SGLang mediante el algoritmo EAGLE3. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones significativas. La relevancia de este tipo de modelos radica en que la decodificación especulativa puede reducir la latencia de inferencia de modelos grandes entre 1,5 y 3 veces sin pérdida de calidad, siempre que el borrador esté bien calibrado con el modelo objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decoder, attention SDPA) |
| Parametros totales | 202.700.416 (según safetensors) |
| Parametros activos | 202.700.416 (no es MoE) |
| Longitud de contexto | 2048 (máxima secuencia de entrenamiento; sin ventana deslizante) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible (depende del modelo base Qwen3-4B-Instruct-2507) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, config.json, training_state.pt) |

## Arquitectura y entrenamiento

El modelo es un borrador EAGLE3, una arquitectura de decodificación especulativa que emplea una única capa de transformer para predecir los siguientes tokens basándose en los últimos `k` tokens ya aceptados. En este caso, el entrenamiento se realizó con el método online EAGLE3/SpecForge, donde el borrador se entrena interactuando con el modelo objetivo durante la inferencia. La configuración incluye una capa decoder con hidden size 2560, intermediate size 9728, 32 cabezas de atención y 8 cabezas key/value, con vocabulario de borrador de 32000 tokens frente a los 151936 del modelo objetivo. Los pesos están en bfloat16.

Los datos de entrenamiento fueron un dataset ShareGPT limpio en formato JSONL (fuente local, sin revisión registrada). Se entrenó durante 10 épocas con 231810 pasos de optimización, batch efectivo de 4, learning rate de 1e-4 con warmup lineal del 1,5% y decaimiento coseno, sin weight decay. La longitud máxima de secuencia fue de 2048 tokens, con una longitud TTT (tokens to test) de 7. El backend objetivo es SGLang con FlashInfer y tensor parallel de 1. No se registraron métricas de evaluación ni de seguridad.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa, no generación de texto autónoma.
- Aceleración de inferencia del modelo `Qwen/Qwen3-4B-Instruct-2507` mediante el algoritmo EAGLE3 en SGLang.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multimodales: es un componente de infraestructura, no un modelo de uso directo.
- Multilingüismo heredado del modelo base: el borrador debe ser capaz de predecir tokens en los idiomas que maneja Qwen3-4B-Instruct-2507, pero no se han publicado evaluaciones al respecto.
- No dispone de modo thinking ni de visión.

## Casos de uso

- Despliegue de Qwen3-4B-Instruct-2507 en producción con menor latencia: integrar este borrador como ruta especulativa en SGLang reduce el tiempo de respuesta en servicios de chat o generación de texto, manteniendo la calidad del modelo grande.
- Servidores de inferencia de alta concurrencia: al reducir el número de pasos de decodificación del modelo objetivo, se libera capacidad de cómputo y se aumenta el throughput por GPU en entornos con muchas peticiones simultáneas.
- Aplicaciones de generación de código asistida: Qwen3-4B-Instruct-2507 es competente en tareas de programación; el borrador acelera la autocompletación de código en editores o pipelines de CI/CD sin sacrificar precisión.
- Chatbots y asistentes conversacionales en producción: la menor latencia mejora la experiencia de usuario en diálogos multi-turno, especialmente con contexto largo dentro del límite de 2048 tokens.
- Experimentación con decodificación especulativa: este checkpoint sirve como punto de referencia para comparar configuraciones de EAGLE3 (número de pasos especulativos, top-k, tokens de borrador) en diferentes cargas de trabajo.
- Investigación sobre entrenamiento online de modelos borrador: el repositorio incluye `training_state.pt` con el estado del optimizador, útil para reanudar o analizar el proceso de entrenamiento en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que "no se registraron métricas de evaluación ni de seguridad" para este entrenamiento. No hay datos de MMLU, HumanEval, GSM8K ni comparaciones de velocidad de decodificación especulativa frente a la inferencia sin borrador.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 202,7M parámetros en bfloat16, lo que ocupa aproximadamente 0,4 GB en memoria. Junto con el modelo objetivo Qwen3-4B-Instruct-2507 (alrededor de 8 GB en bf16), el conjunto cabe en GPUs consumer de 12 GB o más.
- GPU recomendadas: cualquier GPU con al menos 12 GB de VRAM para el par modelo objetivo + borrador; para producción con alta concurrencia se recomienda A100, H100 o L40S. Con cuantización del modelo objetivo (por ejemplo, AWQ o GPTQ), podría ejecutarse en GPUs de 8 GB.
- Compatibilidad con consumer GPU: sí, en RTX 3090, RTX 4090 o similares, siempre que se use SGLang con soporte CUDA y FlashInfer.
- Opciones de despliegue: SGLang (vía `--speculative-algorithm EAGLE3`), que es el backend objetivo del entrenamiento. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI en la documentación proporcionada.
- Latencia y throughput: no disponibles. Los valores dependen de la configuración de árbol especulativo (`--speculative-num-steps`, `--speculative-eagle-topk`, `--speculative-num-draft-tokens`), que deben ajustarse mediante benchmarking con la carga de trabajo real.

## Comparativa con modelos similares

No se dispone de información sobre modelos borrador comparables en el mismo repositorio o en los resultados de búsqueda. El propio entrenamiento generó 47 checkpoints (de `epoch_0_step_5000` a `epoch_9_step_231810`), pero no se han publicado comparaciones entre ellos ni con alternativas como los borradores oficiales de Qwen o modelos Medusa. Se indica "no disponible" para esta sección.

## Limitaciones y advertencias

- No es un modelo de chat: usarlo directamente para generar texto producirá resultados sin sentido. Debe emparejarse exclusivamente con `Qwen/Qwen3-4B-Instruct-2507` como modelo objetivo.
- El entrenamiento se realizó con una longitud máxima de secuencia de 2048 tokens; no se ha validado su comportamiento con contextos más largos, aunque la configuración no establece ventana deslizante.
- Los datos de entrenamiento (ShareGPT limpio) no tienen una revisión registrada, lo que puede implicar sesgos o contenido de baja calidad en los patrones aprendidos.
- No se registraron métricas de seguridad ni de evaluación, por lo que se desconoce su impacto en la calidad de la generación especulativa en dominios específicos.
- El archivo `training_state.pt` contiene estado del optimizador y argumentos de entrenamiento; solo debe deserializarse en entornos de confianza por riesgo de ejecución de código arbitrario.
- El rendimiento de aceleración depende críticamente de la configuración de los parámetros especulativos; valores subóptimos pueden degradar la latencia en lugar de mejorarla.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 tiene su propia licencia (Qwen Research License) que debe verificarse para aplicaciones comerciales.

## Enlaces

- Repositorio del checkpoint: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-1-step-40000
- Checkpoint hermano (época 1, paso 25000): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-1-step-25000
- Checkpoint hermano (época 1, paso 40000): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-1-step-40000
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Implementación oficial de EAGLE: https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Página del modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Versión del borrador en ModelScope: https://www.modelscope.cn/models/MNN/Qwen3-4B-Instruct-2507-Eagle3
