# scottlowry/Qwen3.5-4B-oQ5e-fp16-mtp

## Resumen

Qwen3.5-4B-oQ5e-fp16-mtp es una cuantización mixta del modelo base Qwen/Qwen3.5-4B, publicada por el usuario scottlowry en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos orientada a la inferencia en Apple Silicon mediante la librería MLX, generada con la herramienta oQ de oMLX (versión v0.7.4.dev1). El checkpoint conserva la arquitectura original del modelo Qwen3.5-4B e incorpora una cabeza MTP (multi-token prediction) de 0,121B de parámetros, además de un componente de visión de 0,334B, lo que sitúa el total en 4.659.865.088 parámetros.

El interés de esta publicación radica en su estrategia de cuantización mixta: en lugar de aplicar un único ancho de bits a todos los tensores, distribuye los pesos entre formatos affine de 5, 6 y 8 bits (con grupo de 64), FP16 y FP32. El resultado es un checkpoint de 4,129 GiB con un promedio efectivo de 7,612 bits por peso, que mantiene en precisión completa las capas consideradas sensibles (7,157% de los pesos lógicos en FP32 y 0,302% en FP16) mientras comprime el grueso del modelo (74,17% de los pesos lógicos en 5 bits). Es una propuesta relevante para desarrolladores que quieran ejecutar un modelo de 4B con capacidades multimodales en hardware de consumo Apple sin renunciar a demasiada fidelidad numérica.

La ficha se elabora a partir de los metadatos y la model card disponibles. El autor no documenta datos de entrenamiento, benchmarks ni licencia explícita, por lo que esos apartados se marcan como no disponibles. La fecha de creación del repositorio es el 24 de julio de 2026 y la última actualización el 11 de noviembre de 2026, con 38 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), con cabeza MTP y componente de visión; pesos en formato MLX |
| Parametros totales | 4.659.865.088 (4,660B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Mixta: affine 5-bit grupo 64 (74,170% de pesos lógicos), affine 6-bit grupo 64 (18,367%), affine 8-bit grupo 64 (0,004%), FP16 (0,302%), FP32 (7,157%); promedio efectivo 7,612 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería mlx); repo de 17,8 GB, checkpoint efectivo de 4,129 GiB |
| Modelo base | Qwen/Qwen3.5-4B |
| Herramienta de cuantizacion | oQ (oMLX v0.7.4.dev1) |
| Desglose por componente | Lenguaje 4,206B (2,791 GiB); visión 0,334B (1,242 GiB); cabeza MTP 0,121B (0,096 GiB) |

## Arquitectura y entrenamiento

El checkpoint deriva del modelo Qwen3.5-4B, un transformer de la familia Qwen3.5 con 4,660B de parámetros totales. La publicación añade dos componentes diferenciados respecto a un modelo de lenguaje puro: un módulo de visión de 0,334B de parámetros, que se mantiene íntegramente en FP32 (1,242 GiB de almacenamiento), y una cabeza MTP de 0,121B, almacenada en 0,096 GiB. La cabeza MTP es un mecanismo de predicción multi-token que permite al modelo generar varios tokens por paso de decodificación, lo que en la práctica se traduce en una mayor velocidad de generación cuando el backend lo explota adecuadamente.

La cuantización se realizó con oQ de oMLX en versión v0.7.4.dev1, aplicando una política de precisión mixta por tensor. El 74,170% de los pesos lógicos (3,456B) se comprimió a affine 5-bit con grupo de 64, con un coste efectivo de 5,50 bits/peso y 2,213 GiB de almacenamiento. Un 18,367% (0,856B) se mantuvo en affine 6-bit grupo 64 (6,50 bits/peso efectivos, 0,648 GiB), y un 7,157% (0,334B) permaneció en FP32 (32 bits/peso, 1,242 GiB). El 0,302% restante (0,014B) se guardó en FP16. Esta distribución sugiere que la herramienta reserva la precisión completa para el módulo de visión y para un conjunto reducido de tensores del modelo de lenguaje, presumiblemente los más sensibles a la cuantización. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base empleó RLHF, DPO u otras técnicas de alineamiento.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.5-4B, aunque no se documentan evaluaciones específicas tras la cuantización.
- Procesamiento de visión: el checkpoint incluye un módulo de visión de 0,334B de parámetros en FP32, por lo que puede abordar tareas de comprensión de imágenes si el backend MLX expone dicha funcionalidad.
- Predicción multi-token (MTP): la cabeza dedicada de 0,121B permite decodificación especulativa o generación de varios tokens por paso, con el consiguiente ahorro de latencia.
- Ejecución en Apple Silicon: diseñado para MLX, lo que habilita inferencia nativa en chips de la serie M de Apple con memoria unificada.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el checkpoint de 4,129 GiB permite cargar el modelo completo en equipos Apple Silicon con 16 GB de RAM o más, dejando margen para el contexto y el resto del sistema. Es adecuado para prototipado rápido sin depender de GPU dedicadas.
- Asistentes de escritorio con capacidades visuales: al incluir un módulo de visión en FP32, el modelo puede emplearse en aplicaciones que reciban capturas de pantalla o imágenes y generen descripciones o respuestas contextuales, siempre que el runtime MLX soporte la ruta multimodal.
- Generación de texto de baja latencia: la cabeza MTP permite acelerar la decodificación en escenarios de chat o autocompletado donde el tiempo por token es crítico, aprovechando la predicción multi-token.
- Evaluación comparativa de cuantizaciones: investigadores que estudien el impacto de la cuantización mixta pueden usar este checkpoint como referencia frente a versiones uniformes de 4 u 8 bits del mismo modelo base.
- Desarrollo de plugins y herramientas sobre MLX: el formato safetensors con metadatos mlx facilita la integración en pipelines de la librería y en proyectos que ya usan oMLX para gestionar modelos cuantizados.
- Prototipado de aplicaciones multimodales en el borde: para demos y pruebas de concepto en portátiles Apple, sin necesidad de infraestructura cloud, con un consumo de almacenamiento de 4,129 GiB efectivos.
- Fine-tuning ligero o adaptación posterior: al conservar ciertas capas en FP32 y FP16, el checkpoint ofrece un punto de partida razonable para adaptaciones (LoRA, por ejemplo) que requieran mayor estabilidad numérica en esas capas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el checkpoint ocupa 4,129 GiB en disco y requiere al menos esa cantidad de memoria unificada para cargarse; con contexto y overhead del runtime, se recomienda un mínimo de 8-16 GB de memoria unificada en Apple Silicon.
- GPU recomendadas: chips Apple de la serie M (M1, M2, M3, M4 y variantes Pro, Max y Ultra), dado que el formato es MLX y no CUDA.
- Compatibilidad con GPU de consumo NVIDIA: no disponible; el checkpoint está empaquetado para MLX, no para CUDA, por lo que no se puede ejecutar directamente en RTX 4090, A100 o H100 sin conversión previa.
- Opciones de despliegue: MLX y oMLX (herramienta con la que se generó); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; la cabeza MTP está pensada para mejorar la velocidad de decodificación, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-4B-oQ5e-fp16-mtp (este) | 4,660B | No disponible | Mixta 5/6/8-bit + FP16/FP32, 7,612 bits/peso | No disponible | safetensors (MLX) |
| Qwen/Qwen3.5-4B (base) | 4B (aprox.) | No disponible | Original en precisión completa | No disponible | safetensors |
| Cuantizaciones uniformes de 4 bits del mismo base | 4B (aprox.) | No disponible | 4-bit uniforme | Depende del publicador | GGUF / MLX, según el caso |

La comparativa se limita al modelo base y a cuantizaciones alternativas del mismo, ya que no se dispone de datos de rendimiento ni de especificaciones de contexto que permitan contrastar con otras familias de modelos de tamaño similar.

## Limitaciones y advertencias

- La cuantización mixta introduce pérdida de precisión en el 74,170% de los pesos lógicos (5 bits), lo que puede degradar tareas sensibles a la fidelidad numérica, como matemáticas complejas o generación de código muy específico.
- No se documentan sesgos conocidos del modelo base ni evaluaciones de seguridad tras la cuantización; se desconoce si el proceso altera el comportamiento alineado del original.
- Riesgo de alucinación inherente a los modelos de lenguaje de 4B, sin que se hayan publicado métricas de fidelidad para este checkpoint.
- La licencia no está declarada en la información disponible, lo que impide confirmar si se permite uso comercial; es imprescindible verificar la licencia del modelo base Qwen/Qwen3.5-4B antes de cualquier despliegue en producción.
- El checkpoint está empaquetado exclusivamente para MLX; no es directamente utilizable en ecosistemas CUDA ni en runtimes como llama.cpp u Ollama sin conversión.
- El repositorio tiene 17,8 GB de tamaño total, muy superior al checkpoint efectivo de 4,129 GiB, lo que puede deberse a artefactos de cuantización o ficheros auxiliares; conviene revisar qué se descarga realmente.
- El autor indica que el modelo se re-cuantizó el 11 de noviembre de 2026 con oMLX v0.7.4.dev1 y recomienda volver a descargarlo si se tenía una copia anterior; las copias antiguas pueden diferir en calidad numérica.
- No se dispone de información sobre la longitud de contexto soportada, los idiomas cubiertos ni el soporte de tool calling, lo que limita la planificación de casos de uso avanzados.
- El número de descargas (38) y la ausencia de likes sugieren una validación comunitaria muy baja; no hay evidencia de terceros sobre su comportamiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/scottlowry/Qwen3.5-4B-oQ5e-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
