# apetersson/DeepSeek-V4-Flash-Vision-Exp-Abliterated

## Resumen

DeepSeek-V4-Flash-Vision-Exp-Abliterated es un checkpoint experimental derivado del modelo multimodal DeepSeek-V4-Flash-Vision-Exp, publicado por el usuario apetersson en Hugging Face. Se trata de una variante "abliterada" (abliteration) que modifica selectivamente los pesos del modelo original para eliminar o reducir los mecanismos de rechazo y censura, manteniendo el resto de capacidades intactas. El modelo base, desarrollado por DeepSeek, es una arquitectura MoE (Mixture of Experts) de 284 mil millones de parámetros totales con 13 mil millones activos por token, y acepta entradas de texto e imagen.

La relevancia de esta ficha radica en que el checkpoint se publica como un artefacto de investigación en estado de vista previa (preview/draft), con validación de transferencia de pesos completada pero sin evaluación conductual local. El autor declara explícitamente que no debe tratarse como un modelo listo para producción. El repositorio incluye el checkpoint nativo en formato mixto FP8/FP4 (48 shards, 167,8 GB) y un registro de variantes en `variants.json`, con planes futuros para versiones cuantizadas GGUF y MLX.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) multimodal, basada en DeepSeek-V4-Flash-Vision-Exp |
| Parametros totales | 284 mil millones (modelo base) |
| Parametros activos | 13 mil millones (modelo base, MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8/FP4 nativo (checkpoint actual); GGUF y MLX planificados pero no publicados |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (48 shards, 72.633 tensores indexados) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Flash-Vision-Exp emplea una arquitectura MoE con 284 mil millones de parámetros totales y 13 mil millones activos por token, lo que permite una inferencia eficiente en comparación con modelos densos de tamaño similar. Es multimodal: acepta imágenes y texto, y está diseñado para tareas de comprensión visual como lectura de capturas de pantalla, análisis de gráficos y OCR. El checkpoint abliterado no ha sido reentrenado; el autor aplicó una transferencia conservadora de una dirección de rango 1 (rank-1 direction) que modifica únicamente 33 escritores de salida de atención (attention output writers) y sus cargas de escala FP8 asociadas, resultando en exactamente 66 cargas modificadas. Los módulos de visión, expertos, routers y cabezas MTP (Multi-Token Prediction) se verificaron contra la fuente oficial y no fueron alterados. No se dispone de información sobre el dataset de entrenamiento del modelo base ni sobre el uso de RLHF o DPO.

## Capacidades

- Comprensión multimodal de imágenes y texto: puede describir imágenes, leer texto en capturas de pantalla, analizar gráficos y realizar tareas tipo OCR.
- Generación de texto y razonamiento: hereda las capacidades de texto puro del modelo DeepSeek-V4-Flash, según la documentación oficial.
- Arquitectura MoE eficiente: 13 mil millones de parámetros activos por token, lo que reduce el coste computacional frente a modelos densos equivalentes.
- Modificación de rechazo (abliteration): el checkpoint elimina o reduce los mecanismos de rechazo del modelo original, aunque esta capacidad no ha sido validada conductualmente en esta versión preliminar.
- Soporte de tool calling y funciones de agente: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Investigación en alineamiento y seguridad: el checkpoint permite estudiar el efecto de la abliteration sobre los mecanismos de rechazo en un modelo multimodal de gran escala, comparando el comportamiento con el modelo base.
- Análisis de documentos con imágenes: puede procesar capturas de pantalla, facturas o formularios escaneados para extraer texto y datos estructurados, gracias a su capacidad OCR y de comprensión visual.
- Automatización de soporte visual: integración en pipelines que requieran describir imágenes o responder preguntas sobre gráficos y diagramas, aprovechando la ventana multimodal del modelo.
- Evaluación de robustez de modelos: uso como artefacto de prueba para medir la degradación de calidad tras la modificación de pesos, comparando salidas con el modelo original en tareas de razonamiento y visión.
- Desarrollo de variantes cuantizadas: el repositorio está diseñado para alojar futuras versiones GGUF y MLX, lo que permite experimentar con despliegue en entornos con recursos limitados.
- Benchmarking de inferencia MoE: al ser un checkpoint de 284B con 13B activos, sirve para medir latencia y throughput en runtimes compatibles con FP8, aunque la validación en producción aún no se ha completado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que la evaluación conductual de extremo a extremo, las pruebas de rechazo, calidad y seguridad, y la validación en runtimes de producción están planificadas pero no completadas. No se deben asumir cifras de rendimiento sin verificación.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el checkpoint nativo ocupa 167,8 GB en disco en formato FP8/FP4, por lo que se requiere memoria de GPU muy superior a la de una tarjeta de consumo.
- GPU recomendadas: no disponible; por el tamaño del modelo, se necesitarían múltiples GPUs de centro de datos (por ejemplo, A100 80GB o H100) o despliegue distribuido.
- Compatibilidad con GPU de consumo: no, el modelo completo no cabe en una GPU consumer actual sin cuantización adicional.
- Opciones de despliegue: no validadas aún; el autor menciona que la validación en runtimes de producción compatibles está pendiente. Se espera compatibilidad con transformers, y futuras variantes GGUF/MLX para llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Estado |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-Vision-Exp (base) | 284B total, 13B activos | no disponible | Sí | no disponible | Oficial, disponible vía API |
| DeepSeek-V4-Flash-Vision-Exp-Abliterated (este) | 284B total, 13B activos | no disponible | Sí | MIT | Preview experimental, sin validación conductual |
| DeepSeek-V4-Flash (texto) | 284B total, 13B activos | no disponible | No | no disponible | Oficial |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparativa se limita a parámetros, arquitectura y estado de publicación.

## Limitaciones y advertencias

- Estado experimental: el autor declara que es un "preview/draft" y que el comportamiento no ha sido validado localmente; no debe usarse en producción.
- Riesgo de alucinación y calidad no verificada: sin evaluación conductual, no se puede garantizar la calidad de las respuestas ni la ausencia de degradación tras la abliteration.
- Modificación de rechazo: la abliteration puede eliminar salvaguardas de seguridad; el modelo podría generar contenido inapropiado o dañino. Úsese solo en entornos de investigación controlados.
- Sesgos conocidos: no disponibles; el modelo base no ha sido auditado en esta ficha.
- Limitaciones de contexto e idioma: no disponibles en la documentación.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el estado preliminar y la falta de validación hacen recomendable no desplegarlo en entornos productivos.
- Compatibilidad de runtime: no validada; los formatos GGUF y MLX prometidos aún no están publicados.

## Enlaces

- Repositorio del modelo: https://huggingface.co/apetersson/DeepSeek-V4-Flash-Vision-Exp-Abliterated
- Modelo base oficial: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- Modelo DeepSeek-V4-Flash (texto): https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Documentación de visión de DeepSeek API: https://api-docs.deepseek.com/guides/vision/
- Análisis externo del modelo base: https://www.iweaver.ai/blog/deepseek-v4-flash-vision-exp/
- Ficha técnica del modelo base: https://zenmux.ai/deepseek/deepseek-v4-flash-vision-exp
