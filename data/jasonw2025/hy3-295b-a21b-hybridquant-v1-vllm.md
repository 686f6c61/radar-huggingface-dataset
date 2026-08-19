# JasonW2025/Hy3-295B-A21B-HybridQuant-v1-vllm

## Resumen

El modelo **Hy3-295B-A21B-HybridQuant-v1-vllm** es una versión cuantizada del modelo base **tencent/Hy3** (probablemente la familia Hunyuan 3 de Tencent), preparada específicamente para su uso con el motor de inferencia vLLM. El nombre indica una arquitectura de mezcla de expertos (MoE) con 295 mil millones de parámetros totales y 21 mil millones activos por token, aunque los pesos almacenados en formato safetensors suman aproximadamente 155 mil millones de parámetros, lo que sugiere que la cuantización híbrida reduce significativamente el tamaño efectivo de los tensores.

La cuantización híbrida (HybridQuant) combina formatos de precisión mixta: **nvfp4** (punto flotante de 4 bits de NVIDIA) y **fp8** (punto flotante de 8 bits), optimizados con NVIDIA ModelOpt. El repositorio está diseñado para ejecutarse en plataformas como **NVIDIA DGX Spark** (con chip GB10), lo que indica que el modelo está pensado para despliegue en hardware de gama alta con memoria unificada amplia.

El acceso al repositorio es restringido (gated), por lo que los usuarios deben aceptar condiciones específicas antes de poder descargar los pesos. Este modelo se posiciona como una alternativa optimizada para inferencia de alta eficiencia en escenarios de generación de texto y conversación, aunque no se han publicado detalles sobre su entrenamiento o rendimiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), basada en tencent/Hy3 |
| Parametros totales | 155.313.696.000 (según safetensors); el nombre indica 295B totales y 21B activos |
| Parametros activos | 21 mil millones (según el nombre del modelo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | nvfp4, fp8, 8-bit (cuantización híbrida) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (acceso restringido en HuggingFace) |
| Formato de pesos | safetensors, optimizado para vLLM |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base **tencent/Hy3**, que corresponde a un transformer de mezcla de expertos (MoE) con activación por token (21B activos de 295B totales). Esta versión específica ha sido sometida a un proceso de cuantización híbrida que combina formatos **nvfp4** y **fp8**, aplicado mediante NVIDIA ModelOpt. El objetivo es reducir el uso de memoria y acelerar la inferencia en hardware NVIDIA moderno, manteniendo una calidad de generación aceptable.

No se dispone de información sobre el proceso de entrenamiento original (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) ni sobre los detalles de la cuantización (calibración, pérdida de precisión medida). El modelo está etiquetado como `text-generation` y `conversational`, lo que sugiere que fue entrenado para tareas de generación de texto y diálogo.

## Capacidades

- Generación de texto en lenguaje natural, orientada a conversación y respuestas contextuales.
- Soporte para inferencia con vLLM, lo que permite integración con APIs compatibles con OpenAI y despliegue en producción.
- Cuantización híbrida FP4/FP8 que reduce el consumo de VRAM y mejora el throughput en GPUs NVIDIA con soporte para estos formatos (por ejemplo, Blackwell).
- Probablemente conserva las capacidades del modelo base Hy3, aunque no se detallan en la ficha (razonamiento, código, matemáticas, etc.).
- No se confirma soporte explícito para tool calling, agentes o modo de razonamiento extendido.

## Casos de uso

- **Asistentes conversacionales en producción**: gracias a su compatibilidad con vLLM, puede desplegarse como backend de chatbots con alta concurrencia, utilizando el formato de cuantización para reducir costes de inferencia.
- **Generación de texto a gran escala**: adecuado para tareas de redacción, resumen y creación de contenido donde se requiera un modelo grande con buena fluidez.
- **Investigación en eficiencia de inferencia**: sirve como banco de pruebas para evaluar el impacto de la cuantización híbrida FP4/FP8 en modelos MoE de gran tamaño.
- **Despliegue en hardware NVIDIA DGX Spark**: diseñado para ejecutarse en esta plataforma, puede aprovechar la memoria unificada del GB10 para inferencia local de alta capacidad.
- **Fine-tuning y adaptación posterior**: al estar disponible en safetensors, permite continuar el entrenamiento o realizar ajustes con PEFT/LoRA si se dispone de los recursos adecuados.
- **Evaluación comparativa de cuantización**: útil para medir la degradación de calidad frente al modelo original en tareas estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo cuantizado ni para el modelo base tencent/Hy3.

## Requisitos de hardware

- **VRAM estimada**: el tamaño del repositorio es de 179,1 GB, lo que sugiere que se necesita al menos 180 GB de memoria para cargar los pesos en FP8/FP4. Con cuantización adicional o offloading, podría reducirse, pero no hay datos concretos.
- **GPU recomendadas**: NVIDIA DGX Spark (GB10) con memoria unificada, o GPUs de datacenter como H100/H200 con 80-140 GB de VRAM (aunque el modelo completo no cabe en una sola H100 sin cuantización extrema).
- **No cabe en GPUs de consumo** (RTX 4090, etc.) por el tamaño de los pesos.
- **Opciones de despliegue**: vLLM es la librería principal; también podría usarse con TensorRT-LLM o llama.cpp si se convierte a GGUF, aunque no se proporciona soporte oficial.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa fiable con otros modelos MoE cuantizados. El modelo base tencent/Hy3 no tiene datos públicos de rendimiento en la información proporcionada. Se recomienda consultar la documentación de Tencent para obtener referencias.

## Limitaciones y advertencias

- **Acceso restringido**: el repositorio es gated; es necesario aceptar condiciones en HuggingFace antes de descargar los pesos, lo que puede limitar su uso comercial.
- **Licencia no disponible**: no se especifica la licencia, por lo que no se garantiza permiso explícito para uso comercial o derivados.
- **Sesgos y alucinaciones**: al ser un modelo de lenguaje grande, puede presentar sesgos presentes en sus datos de entrenamiento y generar contenido falso o inventado. No se han publicado evaluaciones de sesgo.
- **Idiomas no especificados**: se desconoce qué idiomas soporta con calidad; probablemente el modelo base Hy3 esté optimizado para chino e inglés, pero no se confirma.
- **Riesgo de degradación por cuantización**: la cuantización híbrida FP4/FP8 puede afectar la calidad de generación en tareas de precisión (matemáticas, código) aunque no se han medido estas pérdidas.
- **Requisitos de hardware elevados**: no es viable en infraestructura modesta; requiere hardware NVIDIA de gama alta con soporte para FP4/FP8.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JasonW2025/Hy3-295B-A21B-HybridQuant-v1-vllm
- Modelo base (referencia): tencent/Hy3 (sin enlace directo disponible en la información proporcionada)
