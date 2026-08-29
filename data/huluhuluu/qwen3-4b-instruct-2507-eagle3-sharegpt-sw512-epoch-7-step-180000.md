# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-7-step-180000

## Resumen

Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-7-step-180000 es un modelo de borrador (draft model) para decodificación especulativa, desarrollado por el usuario huluhuluu mediante la metodología EAGLE3 y la herramienta SpecForge. Su propósito no es funcionar como un modelo de chat independiente, sino acelerar la inferencia del modelo objetivo `Qwen/Qwen3-4B-Instruct-2507` cuando se despliega con SGLang y backends como FlashInfer. Este checkpoint concreto corresponde al paso 180.000 de la época 7 de un entrenamiento de 10 épocas, y forma parte de una colección de 47 checkpoints publicados por el autor.

Arquitectónicamente es un modelo ligero de una sola capa decoder con atención causal de ventana deslizante de 512 tokens, 202,7 millones de parámetros y pesos en bfloat16. Su relevancia radica en que permite reducir la latencia de generación del modelo base de 4.000 millones de parámetros sin sacrificar calidad, al predecir múltiples tokens por paso de decodificación. Es una pieza especializada para entornos de producción que requieren alto rendimiento y baja latencia, no un modelo de propósito general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decoder con atención sliding-window) |
| Parametros totales | 202.700.416 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Draft: 512 tokens (ventana deslizante); target: 2048 tokens (máximo de entrenamiento) |
| Tipos de cuantizacion | no disponible (solo pesos bfloat16 publicados) |
| Idiomas soportados | no disponible (depende del modelo objetivo; el base Qwen3-4B-Instruct-2507 es multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura EAGLE3, un esquema de decodificación especulativa basado en una sola capa transformer que predice la siguiente secuencia de tokens del modelo objetivo. En concreto, emplea una capa decoder con hidden size de 2560, tamaño intermedio de 9728, 32 cabezas de atención y 8 cabezas clave/valor, con un vocabulario de borrador de 32.000 tokens frente al vocabulario objetivo de 151.936. La atención es causal con ventana deslizante de 512 tokens, lo que limita el alcance del contexto que el borrador puede considerar.

El entrenamiento se realizó con el método "online EAGLE3" de SpecForge sobre un conjunto de datos ShareGPT limpio (en formato JSONL, sin revisión registrada). Se ejecutaron 10 épocas con un total de 231.810 pasos de optimización, tamaño de lote efectivo de 4, tasa de aprendizaje de 1e-4 con calentamiento lineal del 1,5% y posterior decaimiento coseno, sin weight decay y con norma de gradiente máxima de 0,5. La longitud máxima de secuencia fue de 2048 tokens, con una longitud TTT (test-time training) de 7 y ventana deslizante de borrador de 512. El backend objetivo fue SGLang con FlashInfer, tensor parallel de 1, y no se aplicaron técnicas de RLHF ni DPO.

## Capacidades

- Decodificación especulativa: predice múltiples tokens por paso para acelerar la generación del modelo objetivo Qwen3-4B-Instruct-2507.
- Compatibilidad con SGLang: diseñado para usarse como ruta de borrador en el servidor de inferencia SGLang con configuraciones EAGLE3.
- Ventana deslizante de 512 tokens: limita el alcance del borrador para reducir coste computacional y memoria, manteniendo precisión en contextos cortos.
- Integración con el modelo base: requiere emparejarse exactamente con `Qwen/Qwen3-4B-Instruct-2507`; no funciona con otros modelos.
- Sin capacidades de chat directo: no genera respuestas autónomas ni soporta tool calling, agentes, visión o audio.
- Multilingüismo heredado: al ser un borrador, su capacidad lingüística depende del modelo objetivo, que es multilingüe.

## Casos de uso

- Reducción de latencia en servicios de chat en producción: al desplegar Qwen3-4B-Instruct-2507 con SGLang, este borrador permite generar tokens más rápido, mejorando la experiencia de usuario en aplicaciones interactivas.
- Optimización de throughput en APIs de generación de texto: en entornos con alta concurrencia, la decodificación especulativa reduce el número de pasos de inferencia, aumentando el número de peticiones servidas por segundo.
- Despliegue en hardware limitado: al ser un modelo de solo 202M parámetros, puede ejecutarse junto al modelo base en GPUs consumer (por ejemplo, RTX 4090) sin requerir memoria adicional significativa.
- Evaluación de configuraciones de árbol de especulación: los desarrolladores pueden probar distintos parámetros de árbol (tree settings) en SGLang para ajustar el equilibrio entre velocidad y precisión según su carga de trabajo.
- Investigación en decodificación especulativa: sirve como referencia para estudiar el impacto de la ventana deslizante (512 tokens) y la longitud TTT (7) en la tasa de aceptación de tokens.
- Pipelines de generación batch con requisitos de latencia estrictos: en tareas como resúmenes automáticos o extracción de información, la reducción de latencia por token permite cumplir SLA más exigentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation or safety metrics were recorded for this run". Por tanto, no hay datos de MMLU, HumanEval, GSM8K ni métricas de tasa de aceptación de tokens especulativos.

## Requisitos de hardware

- VRAM estimada: los pesos en bfloat16 ocupan aproximadamente 405 MB (202,7M parámetros × 2 bytes). Con overhead de activaciones y KV cache, se puede ejecutar en GPUs con 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM para el borrador; el modelo base Qwen3-4B-Instruct-2507 requiere unos 8 GB en bf16, por lo que una RTX 3060, RTX 4070 o A10 son suficientes para ambos.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media y alta (RTX 30/40 series, etc.).
- Opciones de despliegue: SGLang es el backend objetivo (con FlashInfer). No se menciona soporte para vLLM, llama.cpp u Ollama en la documentación.
- Latencia y throughput: no disponibles; dependen de la configuración del árbol de especulación y del hardware.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de borrador EAGLE3 comparables en la misma categoría (mismo tamaño o misma tarea) dentro de los datos proporcionados. El autor publica también un checkpoint para Qwen3-1.7B (Qwen3-1p7b-Eagle3-ShareGPT-SW512), pero no se especifican sus parámetros ni rendimiento. La comparativa directa no es posible sin datos de benchmarks.

## Limitaciones y advertencias

- No es un modelo de chat: no debe usarse de forma independiente para generar respuestas; solo funciona como borrador especulativo emparejado con el modelo objetivo exacto.
- Sesgos de datos: entrenado exclusivamente con ShareGPT limpio, que puede contener sesgos propios de conversaciones reales de usuarios.
- Riesgo de alucinación: al ser un borrador, no genera contenido final; el riesgo de alucinación recae en el modelo base, no en este.
- Ventana de contexto limitada: el borrador solo considera 512 tokens de contexto, lo que puede reducir la tasa de aceptación en tareas que requieren dependencias de largo alcance.
- Sin evaluación de seguridad: no se registraron métricas de seguridad ni de alineación; se recomienda validar antes de uso en producción.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 también es Apache-2.0 según la documentación de Qualcomm; verificar la licencia exacta del target.
- Dependencia de SGLang: el despliegue está ligado a SGLang con FlashInfer; otras infraestructuras pueden no ser compatibles.

## Enlaces

- Repositorio del modelo: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-7-step-180000
- Colección de checkpoints: https://huggingface.co/collections/huluhuluu/qwen3-4b-instruct-2507-eagle3-sharegpt-checkpoints
- Checkpoint de la época 7 paso 180000 (sin SW512): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-7-step-180000
- Modelo base Qwen3-4B-Instruct-2507 (Qualcomm AI Hub): https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Guía de despliegue local de Qwen3-4B-Instruct-2507: https://aiindigo.com/tutorials/getting-started-with-qwen3-4b-instruct-2507-deploying-efficient-local-ai
