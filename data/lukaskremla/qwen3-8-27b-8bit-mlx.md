# lukaskremla/Qwen3.8-27B-8bit-MLX

## Resumen

El modelo `lukaskremla/Qwen3.8-27B-8bit-MLX` es una cuantización en 8 bits del modelo multimodal Qwen3.8-27B, desarrollado por Qwen (Alibaba Cloud) y convertido al formato MLX por el usuario lukaskremla. Está diseñado para ejecutarse de manera eficiente en hardware Apple Silicon mediante el framework MLX, preservando la torre de visión en bf16 para mantener las capacidades multimodales.

Este modelo resuelve el problema de desplegar un modelo de lenguaje y visión de gran tamaño en entornos con recursos limitados, ofreciendo una versión cuantizada que reduce el uso de memoria manteniendo la funcionalidad completa: comprensión de imágenes, vídeo, razonamiento, uso de herramientas y soporte multilingüe. Su relevancia radica en que permite ejecutar un modelo de 27 mil millones de parámetros en Macs con memoria unificada, algo que de otra forma sería inviable.

La arquitectura se basa en el modelo Qwen3.8-27B, que combina un transformer multimodal con una torre de visión dedicada. La cuantización utiliza weight-only quantization con esquema affine RTN y group-size de 64, logrando un tamaño de repositorio de 29,5 GB. La licencia es Apache 2.0, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.8-27B) con torre de visión bf16 |
| Parametros totales | 8.027.131.120 (según safetensors; el nombre del modelo indica 27B, discrepancia reportada por el autor como bug de visualización) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit, weight-only, affine RTN, group-size 64 |
| Idiomas soportados | no disponible (el modelo base es multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal que procesa texto, imágenes y vídeo. Incorpora una torre de visión separada que se mantiene en bf16 en esta cuantización para preservar la calidad de la percepción visual. La parte de lenguaje sigue una arquitectura estándar de decoder-only con atención causal, optimizada para razonamiento y generación de texto.

No se dispone de información detallada sobre el entrenamiento del modelo base en la documentación proporcionada. Se sabe que el modelo soporta tool use, razonamiento multi-paso y largos contextos, lo que sugiere un entrenamiento con datos instructivos y posiblemente RLHF o DPO, pero estos datos no están disponibles en la ficha.

La conversión a MLX se realizó con mlx-vlm versión 0.6.13, aplicando cuantización weight-only de 8 bits con esquema affine RTN y group-size de 64. Esta técnica reduce el tamaño del modelo sin cuantizar las activaciones, manteniendo la precisión de la torre de visión.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Comprensión de imágenes (image-text-to-text) y vídeo.
- Soporte de tool calling / function calling para integración con APIs y agentes.
- Razonamiento multi-step y modo de pensamiento (inferido de las etiquetas "reasoning").
- Capacidades multilingües (el modelo base es multilingüe, aunque no se especifican los idiomas exactos).
- Manejo de contextos largos (etiqueta "long-context").
- Formato MLX optimizado para Apple Silicon, con inferencia eficiente en CPU/GPU unificada.

## Casos de uso

- Asistentes multimodales en Mac: el modelo puede responder preguntas sobre imágenes o vídeos directamente en aplicaciones de escritorio, aprovechando la memoria unificada de los chips M-series.
- Automatización de atención al cliente con soporte visual: un agente puede analizar capturas de pantalla o fotos enviadas por usuarios y generar respuestas contextuales, usando tool calling para consultar bases de datos o sistemas externos.
- Análisis de documentos técnicos: procesar diagramas, gráficos o esquemas en PDFs y extraer información relevante, gracias a la comprensión de imágenes combinada con razonamiento.
- Generación de código asistida por contexto visual: el modelo puede interpretar mockups de interfaz o diagramas de arquitectura y sugerir implementaciones, integrado en IDEs mediante MLX.
- Sistemas de moderación de contenido: analizar imágenes y texto para detectar contenido inapropiado, con la ventaja de ejecutarse localmente sin enviar datos a la nube.
- Investigación académica en visión por computador: evaluar el rendimiento de un modelo cuantizado de 27B en tareas de VQA (visual question answering) y captioning, comparando con versiones no cuantizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Al ser formato MLX, está diseñado para Apple Silicon (M1, M2, M3, M4 y superiores).
- Con 27B parámetros en 8-bit, se estima un uso de memoria de aproximadamente 27-30 GB, por lo que se recomienda un Mac con al menos 32 GB de RAM unificada.
- En Macs con 64 GB o más, se puede ejecutar con holgura y dejar espacio para el contexto y la torre de visión.
- No es compatible con GPUs NVIDIA o AMD; solo funciona en hardware Apple.
- Opciones de despliegue: mlx-vlm (biblioteca de inferencia), o integración en aplicaciones Swift/Python mediante el ecosistema MLX.
- Latencia y throughput: no disponibles, pero se espera un rendimiento razonable en chips M-series Pro o Max para tareas de generación de texto, aunque la inferencia multimodal puede ser más lenta.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de la misma categoría. El modelo base Qwen3.8-27B es una variante reciente de la familia Qwen3, pero no se han proporcionado datos de modelos comparables ni benchmarks.

## Limitaciones y advertencias

- La cuantización de 8 bits puede introducir una ligera degradación en la calidad de generación comparada con el modelo original en bf16 o fp16.
- El conteo de parámetros mostrado en HuggingFace (8B) no coincide con el nombre del modelo (27B); el autor indica que es un bug de visualización, pero conviene verificar el modelo base para confirmar.
- No se especifican los idiomas soportados ni la longitud exacta del contexto, por lo que estos parámetros deben consultarse en la documentación del modelo base Qwen/Qwen3.8-27B.
- Al ser una conversión de terceros, no hay garantía de soporte oficial por parte de Qwen.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base por si hubiera restricciones adicionales.
- El modelo puede heredar sesgos del entrenamiento original, como cualquier LLM; se recomienda validar su comportamiento en dominios sensibles.
- Riesgo de alucinaciones en tareas de razonamiento o generación de código, especialmente con entradas ambiguas o fuera de distribución.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/lukaskremla/Qwen3.8-27B-8bit-MLX)
- [Modelo base Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Colección de cuantizaciones MLX del autor](https://huggingface.co/collections/lukaskremla/qwen-38-27b-mlx-quants-vision-text-only-and-mtp)
- [Versión solo texto](https://huggingface.co/lukaskremla/Qwen3.8-27B-8bit-MLX-TextOnly)
