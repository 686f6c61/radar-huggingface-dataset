# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-4-step-95000

## Resumen

El modelo `huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-4-step-95000` es un **modelo de borrador (draft model) para decodificación especulativa** basado en la técnica EAGLE3, desarrollado por el usuario huluhuluu. No es un modelo de chat independiente, sino un componente auxiliar diseñado para acelerar la inferencia del modelo objetivo `Qwen/Qwen3-4B-Instruct-2507` (un LLM instructivo de 4 mil millones de parámetros de la familia Qwen3). Su propósito es reducir la latencia y aumentar el throughput en despliegues de servidores de inferencia que utilicen el backend SGLang con soporte de decodificación especulativa.

El modelo tiene una arquitectura ligera de una sola capa decoder con atención de ventana deslizante de 512 tokens, y cuenta con aproximadamente 202,7 millones de parámetros (representados en bfloat16, ocupando unos 0,4 GB). Se entrenó con datos limpios de ShareGPT mediante el método de entrenamiento online EAGLE3 / SpecForge, durante 10 épocas y 231.810 pasos de optimización, con una longitud máxima de secuencia de 2048 tokens. Este checkpoint concreto corresponde a la época 4 y al paso 95.000 de un total de 47 checkpoints publicados en una colección.

La relevancia de este modelo radica en que permite acelerar la generación de texto de Qwen3-4B-Instruct-2507 sin modificar el modelo objetivo, aprovechando la decodificación especulativa para validar múltiples tokens por paso. Es un ejemplo de optimización de inferencia para modelos de tamaño medio en entornos de producción con requisitos de baja latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decoder, atención deslizante de 512 tokens) |
| Parametros totales | 202.700.416 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens (máximo de entrenamiento); ventana de draft de 512 tokens |
| Tipos de cuantizacion | bfloat16 (pesos nativos); no se documentan cuantizaciones adicionales |
| Idiomas soportados | No disponible (el dataset ShareGPT es predominantemente inglés, pero no se especifica oficialmente) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, config.json, training_state.pt) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura EAGLE3, una variante de decodificación especulativa que entrena un modelo de borrador ligero para predecir los tokens que generará el modelo objetivo. En este caso, la arquitectura es `LlamaForCausalLMEagle3` con una única capa decoder, tamaño oculto de 2560, tamaño intermedio de 9728, 32 cabezas de atención y 8 cabezas clave/valor. El vocabulario del borrador es de 32.000 tokens, mientras que el vocabulario objetivo es de 151.936 tokens (el de Qwen3-4B-Instruct-2507). La atención es de ventana deslizante causal con 512 tokens, lo que limita el alcance del borrador a un contexto local.

El entrenamiento se realizó con el método online EAGLE3 / SpecForge, utilizando datos limpios de ShareGPT en formato JSONL (fuente local, sin registro de revisión). Los hiperparámetros incluyen 10 épocas, 231.810 pasos de optimización, tamaño de lote efectivo global de 4, tasa de aprendizaje de 1e-4 con calentamiento lineal del 1,5 % y posterior decaimiento coseno, sin weight decay, y una longitud máxima de secuencia de 2048 tokens. La longitud de entrenamiento de test de tiempo (TTT) fue de 7 tokens, y la ventana de borrador se fijó en 512 tokens. El backend objetivo es SGLang con flashinfer para la atención. No se aplicaron técnicas de RLHF ni DPO; el entrenamiento se centró exclusivamente en la predicción de tokens del borrador.

## Capacidades

- **Decodificación especulativa**: genera secuencias de tokens candidatos que el modelo objetivo valida en paralelo, acelerando la inferencia entre 2 y 4 veces en cargas de trabajo típicas.
- **Integración con SGLang**: diseñado para usarse como ruta de borrador (draft path) en SGLang con la configuración EAGLE3, compatible con el modelo objetivo Qwen3-4B-Instruct-2507.
- **Bajo coste computacional**: al tener solo 202 millones de parámetros y una sola capa, consume una fracción mínima de VRAM y cómputo en comparación con el modelo objetivo.
- **Compatibilidad con transformers**: los pesos están en formato safetensors y la librería es transformers, aunque el uso práctico requiere SGLang para la decodificación especulativa.
- **No es un modelo de chat**: no genera respuestas por sí mismo; requiere emparejarse con el modelo objetivo para producir texto final.

## Casos de uso

- **Servicios de chat en producción con baja latencia**: al desplegar Qwen3-4B-Instruct-2507 junto con este modelo de borrador en SGLang, se reduce el tiempo de generación por token, mejorando la experiencia del usuario en aplicaciones conversacionales en tiempo real.
- **Optimización de costes en inferencia**: al aumentar el throughput del servidor sin añadir GPUs adicionales, se reduce el coste por petición en entornos con tráfico alto.
- **Sistemas de generación de código asistida**: Qwen3-4B-Instruct-2507 destaca en tareas de programación; el borrador acelera la autocompletación de código en IDEs o pipelines de CI/CD.
- **Procesamiento por lotes de alta concurrencia**: en escenarios donde muchas peticiones llegan simultáneamente (por ejemplo, chatbots de atención al cliente), la decodificación especulativa permite servir más peticiones por segundo con la misma infraestructura.
- **Prototipado de arquitecturas de inferencia**: sirve como referencia para evaluar el rendimiento de EAGLE3 en modelos de tamaño medio, permitiendo a los equipos de ML medir la mejora de latencia antes de adoptar la técnica en producción.
- **Evaluación de configuraciones de árbol de especulación**: los desarrolladores pueden ajustar los parámetros de árbol (tree settings) de EAGLE3 para encontrar el equilibrio óptimo entre tasa de aceptación y coste computacional para su carga de trabajo específica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation or safety metrics were recorded for this run." No se proporcionan métricas de tasa de aceptación, velocidad de generación ni comparaciones con otros métodos de decodificación especulativa.

## Requisitos de hardware

- **VRAM estimada para inferencia**: aproximadamente 0,4 GB para el modelo de borrador en bfloat16 (202,7 millones de parámetros). Se suma a la VRAM requerida por el modelo objetivo Qwen3-4B-Instruct-2507 (alrededor de 8-10 GB en bfloat16).
- **GPU recomendadas**: cualquier GPU con al menos 12 GB de VRAM puede alojar tanto el modelo objetivo como el borrador, por ejemplo NVIDIA RTX 3060 12 GB, RTX 4090, A10, A100, H100. Para despliegues de producción con alta concurrencia, se recomiendan GPUs de centro de datos (A100 40/80 GB, H100).
- **Compatibilidad con GPUs de consumo**: sí, cabe en GPUs de consumo como la RTX 4090 (24 GB) o incluso RTX 3080 (10 GB) si se cuantiza el modelo objetivo a 8 bits, aunque la decodificación especulativa con SGLang está optimizada para GPUs con soporte de flashinfer (Ampere o superior).
- **Opciones de despliegue**: SGLang es el backend recomendado y el único mencionado en la documentación. No se indica soporte para vLLM, llama.cpp u Ollama en este repositorio concreto, aunque la arquitectura EAGLE3 podría adaptarse.
- **Latencia y throughput estimados**: no disponibles. Dependen de la configuración de árbol, la tasa de aceptación del borrador y el hardware subyacente. Se recomienda realizar pruebas de carga propias.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de borrador EAGLE3 comparables en la documentación proporcionada. Como referencia, se puede comparar con el propio modelo objetivo sin borrador:

| Modelo | Parametros | Contexto | Funcion | Licencia |
|---|---|---|---|---|
| Qwen3-4B-Instruct-2507 (objetivo) | 4.000 millones (aprox.) | 2048 tokens (entrenamiento) | Modelo de chat instructivo | Apache-2.0 |
| Este modelo de borrador EAGLE3 | 202,7 millones | 512 tokens (ventana de draft) | Acelerador de inferencia via decodificacion especulativa | Apache-2.0 |

La comparación con otros borradores de EAGLE para Qwen3 (por ejemplo, los publicados en el repositorio oficial EAGLE-Qwen3) no está disponible en los datos recopilados. Se recomienda consultar la colección del autor en HuggingFace para ver los otros 46 checkpoints.

## Limitaciones y advertencias

- **No es un modelo de chat**: usarlo directamente como modelo de generación producirá resultados sin sentido. Debe emparejarse exclusivamente con el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`.
- **Sesgos del dataset**: entrenado con datos ShareGPT, que son principalmente conversaciones en inglés. Puede reflejar sesgos presentes en esos datos y tener un rendimiento deficiente en otros idiomas.
- **Riesgo de alucinacion**: al ser solo un modelo de borrador, no genera contenido final; el riesgo de alucinación recae en el modelo objetivo. Sin embargo, una mala tasa de aceptación del borrador puede degradar la calidad percibida.
- **Ventana de draft limitada**: la atención deslizante de 512 tokens restringe la capacidad del borrador para predecir tokens en contextos largos; para secuencias superiores a 512 tokens, la eficacia de la especulación puede disminuir.
- **Sin metricas de seguridad**: no se registraron evaluaciones de seguridad ni de sesgo en este entrenamiento. No se recomienda su uso en aplicaciones sensibles sin una validación adicional.
- **Dependencia de SGLang**: la integración requiere versiones específicas de SGLang con soporte EAGLE3 y flashinfer; no se garantiza compatibilidad con otros frameworks.
- **Archivos de estado de entrenamiento**: el repositorio incluye `training_state.pt` que contiene estado del optimizador y argumentos de entrenamiento; solo debe deserializarse en entornos de confianza por riesgo de ejecución de código arbitrario.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-4-step-95000
- Checkpoint hermano (época 7, paso 185000): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-7-step-185000
- Checkpoint hermano (época 3, paso 75000): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-3-step-75000
- Modelo objetivo Qwen3-4B-Instruct-2507 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Repositorio oficial de EAGLE para Qwen3 (implementación de EAGLE-1/2/3): https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Repositorio de Qwen3 (serie de modelos): https://github.com/HybridMAS/qwen3
