# dots-studio/dots3-note-prev

## Resumen

dots3-note-prev es el primer modelo de pesos abiertos de la familia dots3, desarrollado por Dots Studio, un estudio lanzado por Xiaohongshu a principios de 2025 a partir de su equipo interno de modelos de lenguaje. Se trata de un modelo multimodal de arquitectura Mixture-of-Experts (MoE) con 280 mil millones de parámetros totales (288,4 mil millones según los pesos reales en safetensors) y 16 mil millones de parámetros activos por token, lo que lo sitúa en la categoría de modelos de gran escala con inferencia eficiente. Soporta una longitud de contexto de hasta 512.000 tokens y acepta entradas de texto, imagen, vídeo y audio, generando únicamente texto como salida.

El modelo está optimizado para tareas de razonamiento general, matemáticas, uso de herramientas, flujos de trabajo agénticos multi-paso, generación de código, comprensión multimodal (imágenes, documentos, gráficos, audio y vídeo) y procesamiento de contexto largo. Es el miembro más ligero de la familia dots3, diseñado para ofrecer un equilibrio entre capacidad, latencia y coste de inferencia. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas, y está disponible en Hugging Face y ModelScope, con soporte nativo en Transformers, SGLang y vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (Transformer con atención DSA/SWA) |
| Parametros totales | 280B (según model card); 288.443.400.864 (según pesos safetensors) |
| Parametros activos | 16B |
| Longitud de contexto | 512K tokens |
| Tipos de cuantizacion | BF16, FP8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (versión FP8 disponible por separado) |

## Arquitectura y entrenamiento

dots3-note-prev emplea una arquitectura MoE multimodal con 1 capa densa y 45 capas MoE, cada una con 256 expertos enrutados más 1 experto compartido, activando los 8 mejores (top-8) por token. El tamaño oculto es de 5120 y el FFN oculto de 13824 en la capa densa y 1536 por experto. La atención combina 13 capas con atención dispersa (DSA, con top-2048) y 33 capas con atención de ventana deslizante (SWA), en proporción aproximada 1:3, lo que permite manejar contextos de 512K tokens de forma eficiente. El vocabulario alcanza 152.000 tokens.

El modelo integra un codificador de visión basado en MoE ViT de 7B parámetros totales (1,2B activos) y un codificador de audio denso de 800M parámetros. Incluye además un módulo de predicción multi-token (MTP) de 1 capa compartida con 1,13B parámetros, que acelera la decodificación. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO en la información disponible.

## Capacidades

- Generación de texto y seguimiento de instrucciones en tareas de conocimiento general.
- Razonamiento matemático y lógico, con modo de pensamiento activable (`enable_thinking`).
- Uso de herramientas (tool calling) y flujos de trabajo agénticos multi-paso.
- Generación de código y resolución de problemas basados en código.
- Comprensión multimodal: imágenes, documentos, gráficos, audio y vídeo (entrada multimodal, salida solo texto).
- Procesamiento de contexto largo de hasta 512K tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Tareas interactivas que requieren exploración, actualización de memoria y adaptación.
- Capacidades multilingües: no especificadas en la documentación disponible.

## Casos de uso

- Análisis de documentos extensos: con 512K tokens de contexto, el modelo puede procesar informes anuales, expedientes legales o investigaciones completas de una sola pasada, extrayendo información relevante y respondiendo preguntas sobre el contenido.
- Asistente de atención al cliente multimodal: puede recibir capturas de pantalla, vídeos de demostración o mensajes de audio del usuario, y generar respuestas textuales contextualizadas, manteniendo conversaciones multi-turno con memoria de largo plazo.
- Agente de automatización de tareas: gracias a su soporte de tool calling y razonamiento multi-paso, puede orquestar llamadas a APIs, consultar bases de datos y ejecutar acciones en entornos controlados, por ejemplo en pipelines de CI/CD para revisar código y generar parches.
- Transcripción y análisis de contenido audiovisual: acepta entradas de audio y vídeo, por lo que puede transcribir reuniones, extraer conclusiones de vídeos o generar resúmenes de podcasts, devolviendo texto estructurado.
- Tutor de matemáticas y lógica: con su modo de razonamiento explícito, puede desglosar problemas matemáticos paso a paso, explicar conceptos y verificar soluciones, útil en plataformas educativas.
- Búsqueda y recuperación de información en corpus largos: el modelo puede indexar mentalmente grandes volúmenes de texto (hasta 512K tokens) y responder preguntas específicas con referencias al contexto, sin necesidad de RAG externo en muchos casos.

## Benchmarks y rendimiento

La model card incluye dos figuras con resultados de evaluación para razonamiento general y agéntico, y para comprensión multimodal, pero no se proporcionan los valores numéricos en el texto. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint FP8 ocupa aproximadamente 280 GB (280B × 1 byte), por lo que se recomienda un nodo de 8 GPUs con 80 GB cada una (H100, A100 80GB o similar). En BF16, el modelo requeriría unos 560 GB, necesitando 8 GPUs de 80 GB con tensor parallelism o 16 GPUs.
- GPU recomendadas: H100, A100 80GB, o GPUs consumer de gama alta (RTX 4090 24GB) solo para pruebas parciales o con cuantización adicional no oficial, dado el tamaño total.
- No cabe en una GPU consumer estándar; se requiere configuración multi-GPU o servicios en la nube.
- Opciones de despliegue: SGLang y vLLM (con soporte nativo), Transformers, y la versión FP8 está recomendada para servir en un nodo de 8 GPUs.
- Latencia y throughput: no disponibles en la documentación; el MTP y la activación de solo 16B parámetros por token reducen la latencia frente a modelos densos de tamaño similar.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la información proporcionada. Como alternativas de la misma categoría (MoE multimodal de gran escala) se pueden considerar Qwen2.5-VL (72B, denso) o Llama 3.2 Vision (90B, denso), pero no hay métricas publicadas que permitan una comparación rigurosa. La comparativa queda pendiente de la publicación del informe técnico completo.

## Limitaciones y advertencias

- No se han publicado detalles sobre sesgos o alucinaciones específicos; como modelo de gran tamaño, es susceptible a generar contenido plausible pero incorrecto, especialmente en tareas de razonamiento complejo.
- La documentación no especifica los idiomas soportados, por lo que el rendimiento en lenguas distintas del inglés o chino no está garantizado.
- El tamaño del repositorio (576,9 GB) y la necesidad de múltiples GPUs limitan su uso a entornos con infraestructura de alto rendimiento.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo es una vista previa ("preview") y puede tener limitaciones de robustez no documentadas.
- No se han publicado resultados de benchmarks numéricos, lo que dificulta la evaluación objetiva frente a otros modelos.
- El modo de pensamiento (`enable_thinking`) debe activarse explícitamente; por defecto el modelo responde directamente, lo que puede afectar a la calidad en tareas de razonamiento si no se configura adecuadamente.

## Enlaces

- Hugging Face: https://huggingface.co/dots-studio/dots3-note-prev
- Versión FP8: https://huggingface.co/dots-studio/dots3-note-prev-fp8
- GitHub: https://github.com/studio-dots-ai/dots3-note-prev
- Organización en GitHub: https://github.com/studio-dots-ai
- Tech Blog: https://studio.dots.ai/dots/dots3-en.html
- ModelScope: https://modelscope.cn/collections/dots-studio/dots3-note
- PR de Transformers: https://github.com/huggingface/transformers/pull/47844
- PR de SGLang: https://github.com/sgl-project/sglang/pull/33829
- Receta vLLM: https://recipes.vllm.ai/dots-studio/dots3-note-prev
