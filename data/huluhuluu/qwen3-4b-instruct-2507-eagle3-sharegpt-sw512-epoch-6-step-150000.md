# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-6-step-150000

## Resumen

Este repositorio contiene un modelo auxiliar de decodificación especulativa (draft model) basado en la arquitectura EAGLE3, desarrollado por el usuario huluhuluu. El modelo está diseñado para acelerar la inferencia del modelo objetivo `Qwen/Qwen3-4B-Instruct-2507` mediante speculative decoding, una técnica que genera múltiples tokens candidatos en paralelo y los valida con el modelo grande, reduciendo la latencia por token sin degradar la calidad final.

El modelo tiene 202,7 millones de parámetros, una única capa de decoder con hidden size 2560, y una ventana de atención deslizante de 512 tokens. Se entrenó con el método online EAGLE3 implementado en SpecForge, sobre un dataset ShareGPT limpio, durante 10 épocas y 231.810 pasos de optimización. Este checkpoint concreto corresponde a la época 6, paso 150.000, y se publica como parte de una colección de 47 checkpoints intermedios.

La relevancia de este modelo radica en que permite desplegar Qwen3-4B-Instruct-2507 con una aceleración significativa en entornos de producción, especialmente cuando se usa SGLang como backend de inferencia. No es un modelo de chat independiente: su única función es generar borradores de tokens para el modelo objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decoder, atención causal deslizante de 512 tokens) |
| Parametros totales | 202.700.416 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 (máxima secuencia de entrenamiento); ventana de draft de 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible (el dataset ShareGPT es principalmente inglés, pero no se especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura es `LlamaForCausalLMEagle3`, una variante de una sola capa de decoder diseñada específicamente para speculative decoding. Tiene hidden size 2560, intermediate size 9728, 32 cabezas de atención, 8 cabezas clave/valor, un vocabulario de draft de 32.000 tokens y un vocabulario objetivo de 151.936 tokens. La atención es causal con ventana deslizante de 512 tokens, implementada con SDPA.

El entrenamiento se realizó con el método online EAGLE3 mediante SpecForge, sobre un dataset ShareGPT limpio (fuente local, sin revisión registrada). Los hiperparámetros principales incluyen: 10 épocas, 231.810 pasos de optimización, batch efectivo global de 4, learning rate 1e-4 con warmup lineal del 1,5% y decaimiento coseno, weight decay 0, y max grad norm 0,5. La longitud máxima de secuencia fue 2048 tokens, con TTT length de 7 y ventana deslizante de 512. El backend objetivo fue SGLang con flashinfer y tensor parallel size 1.

Cada repositorio de checkpoint incluye `model.safetensors`, `config.json` y `training_state.pt` (este último solo para reanudar entrenamiento en entornos de confianza). No se registraron métricas de evaluación ni de seguridad durante el entrenamiento.

## Capacidades

- Generación de borradores de tokens para el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507` mediante speculative decoding.
- Compatible con el backend SGLang y la configuración de decodificación especulativa EAGLE3.
- Acelera la inferencia del modelo objetivo manteniendo la distribución de salida (la validación la realiza el modelo grande).
- No es un modelo de chat: no genera texto final por sí mismo.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio.
- No tiene capacidades multilingües propias; depende del modelo objetivo.

## Casos de uso

- Aceleración de inferencia en producción para Qwen3-4B-Instruct-2507: al integrar este draft model como ruta especulativa en SGLang, se reduce la latencia por token en servicios de chat o generación de texto, especialmente en cargas de trabajo con alta concurrencia.
- Despliegue en entornos con GPUs limitadas: al reducir la latencia sin necesidad de un modelo más pequeño, se puede servir el modelo de 4B con menor tiempo de respuesta en hardware consumer (por ejemplo, RTX 4090).
- Optimización de costes en inferencia: el draft model añade solo ~0,4 GB de VRAM, permitiendo mejorar el throughput del servidor sin escalar horizontalmente.
- Investigación en decodificación especulativa: los 47 checkpoints publicados permiten estudiar el efecto del número de pasos de entrenamiento en la calidad del draft y en la tasa de aceptación.
- Benchmarking de configuraciones de árbol (tree settings) en SGLang: el modelo se puede ajustar con diferentes parámetros de árbol para maximizar la aceleración según la carga de trabajo.
- Integración en pipelines de CI/CD para validación de modelos: al ser un componente ligero, se puede probar fácilmente en entornos de integración continua antes de desplegar en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de tasa de aceptación, reducción de latencia ni comparaciones con otros draft models.

## Requisitos de hardware

- VRAM estimada: el modelo de draft ocupa aproximadamente 0,4 GB en bfloat16 (202,7 M parámetros). El modelo objetivo Qwen3-4B-Instruct-2507 requiere unos 8-10 GB en bf16, por lo que el conjunto completo cabe en GPUs consumer de 12-16 GB.
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100, o cualquier GPU compatible con SGLang y flashinfer.
- Compatibilidad con consumer GPU: sí, siempre que la VRAM total (draft + target) no supere la capacidad de la tarjeta.
- Opciones de despliegue: SGLang (backend recomendado y usado en el entrenamiento), vLLM (si la versión soporta EAGLE3), llama.cpp (no confirmado).
- Latencia y throughput: no disponibles en la documentación proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este draft model. Como referencia general, EAGLE3 es una evolución de EAGLE2 y Medusa, que también son técnicas de speculative decoding. Sin embargo, no hay métricas concretas de este checkpoint frente a alternativas. Se recomienda consultar la documentación de SpecForge y los benchmarks de SGLang para evaluar el rendimiento relativo.

## Limitaciones y advertencias

- No es un modelo de chat independiente: usarlo sin el modelo objetivo Qwen3-4B-Instruct-2507 no produce texto útil.
- El entrenamiento se realizó únicamente con datos ShareGPT, lo que puede introducir sesgos hacia el estilo de conversación de ese dataset y limitar la generalización a otros dominios.
- No se registraron métricas de seguridad, alineación ni evaluación de calidad durante el entrenamiento.
- La ventana de draft está limitada a 512 tokens; secuencias más largas pueden requerir ajustes en la configuración.
- El archivo `training_state.pt` contiene estado del optimizador y argumentos de entrenamiento; solo debe deserializarse en entornos de confianza por riesgo de ejecución de código arbitrario.
- La compatibilidad con versiones específicas de SGLang debe verificarse; el modelo se entrenó con flashinfer y SGLang, pero no se garantiza soporte en todas las versiones.
- Licencia Apache-2.0 permite uso comercial, pero el modelo objetivo Qwen3-4B-Instruct-2507 tiene su propia licencia (Apache-2.0 también, según el repositorio original).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-6-step-150000
- Checkpoint hermano (epoch 1, step 30000): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-1-step-30000
- Checkpoint hermano (epoch 6, step 160000): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-6-step-160000
- Modelo objetivo Qwen3-4B-Instruct-2507 (Qualcomm AI Hub): https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Repositorio GitHub de Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/qwen3_4b_instruct_2507/README.md
- Guía de ejecución local en NPU (referencia del modelo objetivo): https://github.com/locomotive-works/npu-local-model-running
