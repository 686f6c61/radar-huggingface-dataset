# hoborific/Mero-Artemis-31B-v0.3.1-W8A16-FP8

## Resumen

Mero-Artemis-31B-v0.3.1-W8A16-FP8 es una versión cuantizada del modelo multimodal Mero-Artemis-31B-v0.3.1, desarrollada por hoborific. El modelo base, creado por sophosympatheia, combina procesamiento de imágenes y texto (pipeline image-text-to-text) y está orientado a tareas conversacionales. Los tags del repositorio sugieren una arquitectura basada en Gemma 4, aunque esta información no está confirmada en la documentación disponible.

Esta variante aplica cuantización offline W8A16 FP8 mediante la librería compressed-tensors, con pesos en float8_e4m3fn y activaciones en bf16/fp16. El objetivo es reducir los requisitos de memoria y acelerar la inferencia en vLLM, manteniendo una calidad cercana al modelo original. Es relevante porque ofrece una alternativa eficiente para desplegar un modelo de 31B parámetros en hardware específico (Intel XPU y NVIDIA CUDA) sin necesidad de GPUs de gran capacidad.

El repositorio contiene 31.266.895.724 parámetros en formato safetensors, con un tamaño total de 33.3 GB. No se ha publicado información sobre la licencia, los idiomas soportados ni los detalles del entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los tags sugieren Gemma 4, sin confirmar) |
| Parametros totales | 31.266.895.724 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W8A16 FP8 (float8_e4m3fn, pesos por canal con escalas simétricas) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (con compressed-tensors) |

## Arquitectura y entrenamiento

La información disponible se centra en el proceso de cuantización, no en la arquitectura del modelo base. Según la model card, la cuantización se realizó offline con el formato W8A16 FP8 de compressed-tensors: los pesos se almacenan en float8_e4m3fn con escalas simétricas por canal de salida, mientras que las activaciones se mantienen en bf16/fp16. Para cada capa lineal, se asigna una escala por fila de salida, calculada a partir de `amax / 448` y refinada mediante una búsqueda de recorte (MSE clip search) sobre nueve fracciones de clip entre 0.8 y 1.0 veces amax, seleccionando la escala con menor error. Los pesos se cuantizan con redondeo al más cercano y saturación.

Solo se cuantizan las proyecciones lineales 2D (attention q/k/v/o y MLP gate/up/down). Los embeddings, normas, lm_head, routers/experts y la torre de visión permanecen en bf16 y se listan en la lista `ignore` del checkpoint, por lo que vLLM no los modifica. Este esquema por canal con recorte ofrece mejor relación señal-ruido que la cuantización online por tensor de vLLM.

No se dispone de información sobre el entrenamiento del modelo base (datos, tokens, técnicas de alineación como RLHF o DPO).

## Capacidades

- Procesamiento multimodal de imágenes y texto, según el pipeline image-text-to-text.
- Orientación conversacional, indicada por el tag `conversational`.
- Generación de texto y respuestas basadas en entradas visuales, aunque no se especifican detalles adicionales.
- Compatibilidad con vLLM para inferencia en plataformas Intel XPU y NVIDIA CUDA (SM75+).
- Formato cuantizado W8A16 FP8 que permite inferencia eficiente en memoria y cómputo.
- No se documentan capacidades específicas como tool calling, agentes o razonamiento multi-paso.

## Casos de uso

- Despliegue de asistentes conversacionales multimodales en producción: el modelo puede procesar imágenes y texto en un mismo diálogo, permitiendo aplicaciones como soporte técnico con capturas de pantalla o descripción de entornos visuales.
- Sistemas de documentación visual: analizar diagramas, gráficos o fotografías y generar explicaciones textuales detalladas, útil en entornos industriales o educativos.
- Moderación de contenido visual: combinar visión y lenguaje para clasificar o describir imágenes en tiempo real, con la ventaja de la cuantización FP8 para reducir costes de inferencia.
- Automatización de atención al cliente con envío de imágenes: el usuario adjunta una foto y el modelo responde con instrucciones o diagnósticos preliminares, aprovechando su naturaleza conversacional.
- Investigación en visión por computador y PNL: como modelo base cuantizado, sirve para experimentos de fine-tuning o evaluación en tareas multimodal sin requerir GPUs de gran tamaño.
- Integración en pipelines de vLLM sobre hardware Intel XPU o NVIDIA: adecuado para entornos con restricciones de memoria o que prioricen la eficiencia energética, gracias al soporte específico de kernels W8A16-FP8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con pesos en FP8, el modelo ocupa aproximadamente 31,3 GB (31.266.895.724 parámetros × 1 byte). Añadiendo activaciones, KV cache y overhead, se recomienda al menos 40 GB de VRAM para inferencia con contexto moderado. Para contextos largos o lotes grandes, se necesitan 80 GB.
- GPUs recomendadas: NVIDIA A100 40GB/80GB, H100, RTX 4090 (24GB no es suficiente para el modelo completo en FP8 sin offloading), o GPUs Intel XPU compatibles con el kernel `XPUW8A16FP8LinearKernel`.
- En consumer GPU: no cabe en GPUs de 24 GB (como RTX 4090) con los pesos completos en memoria; se requeriría cuantización adicional (por ejemplo, 4 bits) o particionado.
- Opciones de despliegue: vLLM es la plataforma principal soportada. No se mencionan otras herramientas como llama.cpp, Ollama o TGI en la documentación.
- Latencia y throughput: no se proporcionan datos concretos. La cuantización FP8 reduce el ancho de banda de memoria y acelera los cálculos en hardware compatible, pero las cifras exactas dependen de la GPU y la configuración.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de la misma categoría. No se han identificado alternativas comparables en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización W8A16 FP8 puede introducir una ligera degradación en la precisión respecto al modelo original en bf16, especialmente en tareas sensibles a errores numéricos.
- vLLM no soporta este formato en ROCm, CPU o TPU; la carga fallará con un error de "no kernel" en esos backends.
- La licencia del modelo no está especificada, lo que impide conocer las restricciones de uso comercial o modificación. Se recomienda contactar al autor antes de utilizarlo en producción.
- No se han documentado los idiomas soportados ni la longitud de contexto, lo que limita la planificación de despliegues multilingües o de contexto largo.
- El modelo base no tiene información pública sobre sesgos, alucinaciones o riesgos específicos; se debe evaluar en el dominio de aplicación antes de su uso.
- Los tags sugieren una arquitectura Gemma 4, pero no hay confirmación oficial; cualquier decisión basada en esa suposición debe verificarse.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/hoborific/Mero-Artemis-31B-v0.3.1-W8A16-FP8
- Modelo base: https://huggingface.co/sophosympatheia/Mero-Artemis-31B-v0.3.1
- Librería compressed-tensors: https://github.com/neuralmagic/compressed-tensors
