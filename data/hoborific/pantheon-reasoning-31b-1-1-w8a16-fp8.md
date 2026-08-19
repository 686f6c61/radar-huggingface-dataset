# hoborific/Pantheon-Reasoning-31B-1.1-W8A16-FP8

## Resumen

Pantheon-Reasoning-31B-1.1-W8A16-FP8 es una versión cuantizada del modelo Gryphe/Pantheon-Reasoning-31B-1.1, desarrollada por hoborific. El modelo original está diseñado para tareas de roleplay con razonamiento, utilizando "thinking traces" para mejorar la calidad de las respuestas. Esta versión cuantizada emplea el formato W8A16 FP8 de compressed-tensors, con pesos en float8_e4m3fn y activaciones en bf16/fp16, lo que reduce el uso de memoria y acelera la inferencia en plataformas compatibles.

El modelo tiene aproximadamente 32.7 mil millones de parámetros y está basado en la arquitectura Gemma 4 (según el tag gemma4), con capacidades multimodales (image-text-to-text). La cuantización se aplica únicamente a las capas de proyección lineal, manteniendo embeddings, normas y la torre de visión en bf16. Está pensado para su uso en vLLM, especialmente en hardware Intel XPU, aunque también funciona en GPUs NVIDIA con soporte CUDA.

Esta cuantización es relevante porque permite desplegar un modelo de razonamiento de gran tamaño en entornos con recursos limitados, manteniendo la calidad del modelo original. Su formato compressed-tensors es compatible con vLLM y otras herramientas del ecosistema, facilitando su integración en pipelines de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (según tag, no confirmado) |
| Parametros totales | 32.682.375.020 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W8A16 FP8 (float8_e4m3fn) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo es una versión cuantizada del modelo base Gryphe/Pantheon-Reasoning-31B-1.1, que a su vez se basa en la arquitectura Gemma 4 (según el tag gemma4 en HuggingFace). El modelo original incorpora mecanismos de razonamiento con "thinking traces", que permiten al modelo planificar y razonar antes de generar respuestas, especialmente útil en tareas de roleplay. No se dispone de información detallada sobre los datos de entrenamiento, el número de tokens o los métodos de alineación (RLHF/DPO).

La cuantización se realizó offline con el formato W8A16 FP8 de compressed-tensors. Los pesos se convierten a float8_e4m3fn con escalas simétricas por canal de salida, calculadas mediante una búsqueda de clip basada en el error cuadrático medio (MSE) sobre aproximadamente 9 fracciones de clip (0.8-1.0× amax). Solo se cuantizan las proyecciones lineales 2D (attention q/k/v/o y MLP gate/up/down); embeddings, normas, lm_head, routers/experts y la torre de visión permanecen en bf16. Esta estrategia busca minimizar la pérdida de precisión frente a métodos de cuantización online como el per-tensor de vLLM.

## Capacidades

- Generación de texto con razonamiento: el modelo está diseñado para producir respuestas razonadas, especialmente en contextos de roleplay y narrativa.
- Entrada multimodal: el pipeline es image-text-to-text, lo que indica que puede procesar imágenes además de texto, aunque no se especifican detalles sobre el procesamiento de visión.
- Conversación multi-turno: al ser un modelo de roleplay, soporta diálogos largos y coherentes.
- Compatibilidad con vLLM: funciona en plataformas Intel XPU y NVIDIA CUDA (SM75+), con kernels especializados.
- Cuantización eficiente: el formato W8A16 FP8 reduce el uso de memoria y puede acelerar la inferencia en hardware compatible.

## Casos de uso

- Roleplay conversacional: el modelo puede generar respuestas con razonamiento para personajes en juegos de rol o narrativa interactiva, planificando las reacciones del personaje antes de escribir.
- Asistentes de escritura creativa: puede ayudar a autores a desarrollar diálogos y tramas, ofreciendo sugerencias razonadas basadas en el contexto de la historia.
- Simulación de personajes en videojuegos: integrado en motores de juego, puede generar diálogos dinámicos y coherentes para NPCs, aprovechando su capacidad de razonamiento.
- Generación de contenido multimodal: al aceptar imágenes, puede describir o razonar sobre contenido visual en combinación con texto.
- Despliegue en entornos con recursos limitados: gracias a la cuantización FP8, puede ejecutarse en hardware con menos VRAM que el modelo original, como GPUs de gama media con soporte CUDA.
- Investigación en modelos de razonamiento: sirve como base para estudiar el impacto de la cuantización en tareas de razonamiento y generación de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 32.7B parámetros en FP8 (1 byte por parámetro), los pesos ocupan aproximadamente 32.7 GB. Además, hay que considerar las activaciones y el overhead, por lo que se recomienda al menos 40 GB de VRAM para inferencia completa.
- GPUs recomendadas: NVIDIA A100 40GB, A100 80GB, H100 80GB, o GPUs con soporte CUDA SM75+ (Turing o más recientes). También es compatible con Intel XPU.
- En GPUs de consumo (por ejemplo, RTX 4090 con 24 GB), no cabe el modelo completo; se requeriría offloading de capas a CPU o usar versiones con cuantización más agresiva.
- Opciones de despliegue: vLLM es el entorno principal, con kernels especializados (HummingFP8ScaledMMLinearKernel o MarlinFP8ScaledMMLinearKernel en CUDA). No es compatible con ROCm, CPU o TPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de la misma categoría. El modelo base Gryphe/Pantheon-Reasoning-31B-1.1 es el punto de referencia directo; esta versión cuantizada ofrece un menor uso de memoria a costa de una posible pérdida mínima de precisión. Existe también una versión GGUF (mradermacher/Pantheon-Reasoning-31B-1.1-GGUF) que podría ser alternativa para entornos CPU, pero no se tienen datos comparativos.

## Limitaciones y advertencias

- No se dispone de información sobre la licencia del modelo, por lo que se debe contactar con el autor antes de un uso comercial.
- La cuantización W8A16 FP8 puede introducir una pequeña degradación en la calidad de las respuestas en comparación con el modelo original en bf16, especialmente en tareas que requieren alta precisión numérica.
- El modelo solo es compatible con vLLM en plataformas Intel XPU y NVIDIA CUDA; no funciona en ROCm, CPU o TPU, lo que limita su portabilidad.
- No se han publicado datos sobre sesgos, alucinaciones o limitaciones de idioma. Al ser un modelo de roleplay, puede generar contenido inapropiado o sesgado si no se usa con las salvaguardas adecuadas.
- El tamaño del modelo (32.7B) requiere hardware con al menos 40 GB de VRAM para una inferencia completa, lo que excluye muchas GPUs de consumo.

## Enlaces

- [Modelo cuantizado en HuggingFace](https://huggingface.co/hoborific/Pantheon-Reasoning-31B-1.1-W8A16-FP8)
- [Modelo base Gryphe/Pantheon-Reasoning-31B-1.1](https://huggingface.co/Gryphe/Pantheon-Reasoning-31B-1.1)
- [Búsqueda de modelos cuantizados de Pantheon-Reasoning-31B-1.1](https://huggingface.co/models?other=base_model:quantized:Gryphe/Pantheon-Reasoning-31B-1.1)
- [Arquitectura del modelo base (hfviewer)](https://hfviewer.com/Gryphe/Pantheon-Reasoning-31B-1.1)
