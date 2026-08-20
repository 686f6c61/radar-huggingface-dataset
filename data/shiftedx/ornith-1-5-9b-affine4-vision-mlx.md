# Shiftedx/ornith-1.5-9b-affine4-vision-mlx

## Resumen

Ornith-1.5-9B es un modelo de lenguaje multimodal desarrollado por ornith-ai, basado en una arquitectura Qwen3.5 con aproximadamente 9.000 millones de parámetros y una ventana de contexto de 262.144 tokens. La versión presentada aquí, publicada por el usuario Shiftedx, es una cuantización affine de 4 bits específicamente preparada para Apple Silicon mediante la librería MLX. Incluye una torre de visión en BF16, lo que permite procesar entradas de imagen y generar texto descriptivo o conversacional. El modelo se enmarca en el proyecto Ornith, que explora el auto-andamiaje y la auto-mejora mediante refuerzo, aunque esta cuantización se centra en el despliegue eficiente en hardware de Apple.

La relevancia de esta versión radica en que permite ejecutar un modelo de 9B con visión en equipos Mac con memoria unificada limitada, gracias a la cuantización affine de 4 bits. El repositorio incluye metadatos de conversión y una receta de construcción, lo que facilita la reproducibilidad. No obstante, el autor advierte que el comportamiento puede diferir del modelo BF16 original y recomienda revisar la ficha del modelo base para conocer sus usos previstos y licencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (trunk de lenguaje denso de 9B) con torre de visión BF16 |
| Parametros totales | 2.135.710.960 (según safetensors; el modelo base declara 9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | affine 4 bits (250 módulos cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

Esta versión es una cuantización del modelo original `ornith-ai/Ornith-1.5-9B`, preparada para MLX. El cuerpo de lenguaje (trunk) utiliza 250 módulos affine de 4 bits y entradas recurrentes cuantizadas junto con el cuerpo. La torre de visión se mantiene en BF16 (333 tensores), lo que preserva la calidad de la representación visual. El modelo no incluye tensores `mtp.*`, por lo que no es compatible con decodificación especulativa nativa (MTP). El autor proporciona un `BUILD_RECIPE.json` y un `conversion_receipt.json` para documentar el proceso de cuantización.

El modelo base Ornith-1.5 se describe como un desarrollo del marco de auto-and-scaffolding introducido en Ornith-1.0, que propone tareas, genera scaffolds específicos y produce rollouts para aprendizaje por refuerzo. Sin embargo, esta cuantización no modifica el entrenamiento original, solo la representación de los pesos. No se dispone de información sobre los datos de entrenamiento, número de tokens o técnicas de alineamiento (RLHF/DPO) del modelo base.

## Capacidades

- Generación de texto a partir de imágenes (descripción, respuesta a preguntas visuales).
- Conversación multimodal (texto e imagen como entrada).
- Procesamiento de contexto largo (hasta 262.144 tokens).
- Soporte de ejecución local en Apple Silicon mediante `mlx-vlm`.
- Capacidad de razonamiento multimodal básico, heredado del modelo Qwen3.5.
- No se especifica soporte de tool calling ni de agentes en esta cuantización, aunque el modelo base podría ofrecerlo.

## Casos de uso

- **Asistente de accesibilidad**: descripción de imágenes para personas con discapacidad visual, usando el modelo en un Mac con `mlx-vlm` para procesar imágenes localmente sin conexión.
- **Análisis de documentos técnicos**: extraer información de gráficos, diagramas o capturas de pantalla en un entorno de desarrollo, aprovechando la ventana de contexto de 262K para procesar documentos extensos.
- **Automatización de soporte al cliente**: integrar el modelo en un bot de chat que recibe capturas de pantalla o imágenes de error y responde con instrucciones, gracias a su capacidad de conversación multimodal.
- **Generación de descripciones para archivos multimedia**: catalogar imágenes o vídeos en una biblioteca personal o corporativa, generando metadatos descriptivos de forma automática.
- **Prototipado de aplicaciones de realidad aumentada**: usar el modelo para interpretar escenas captadas por la cámara y generar respuestas contextuales, ejecutándose en un MacBook con Apple Silicon.
- **Educación y formación**: crear ejercicios interactivos donde el modelo explica diagramas o gráficos, funcionando en un portátil sin necesidad de GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que se adjuntarán resultados de `Shiftedx Bench` en una actualización futura, pero no se incluyen datos numéricos en el momento de la consulta.

## Requisitos de hardware

- **Apple Silicon**: requiere un dispositivo con chip M1 o superior (M1, M2, M3, M4).
- **Memoria unificada**: el tamaño del repositorio es de 6,5 GB, por lo que se recomienda al menos 8 GB de RAM unificada para cargar el modelo y ejecutar inferencia con holgura. Para tareas con contexto largo, 16 GB o más son adecuados.
- **GPU**: no se necesita GPU NVIDIA; el modelo usa la API de MLX que aprovecha la GPU integrada de Apple Silicon.
- **Despliegue**: se puede ejecutar con `mlx_vlm.generate` (MLX-VLM) o mediante otras herramientas que soporten MLX.
- **Latencia**: no se proporcionan datos de latencia; dependerá del modelo de chip y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| `ornith-ai/Ornith-1.5-9B` (original) | 9B | 262144 | BF16 | MIT | safetensors |
| `Shiftedx/ornith-1.5-9b-affine4-vision-mlx` (este) | 2.1B (safetensors) / 9B declarado | 262144 | affine 4-bit | MIT | MLX |
| `Shiftedx/ornith-1.0-9b-abliterated-mxfp4-mlx` | similar (9B) | no disponible | mxfp4 | MIT | MLX |

No se dispone de resultados de benchmarks para comparar rendimiento de forma cuantitativa. La principal diferencia con el modelo base es la cuantización (4 bits frente a BF16) y la plataforma objetivo (MLX vs. otros). La versión abliterated de Ornith-1.0 es una alternativa que elimina restricciones de seguridad, pero no se conocen sus resultados.

## Limitaciones y advertencias

- **Posible degradación de calidad**: la cuantización affine de 4 bits puede reducir la precisión en tareas complejas como razonamiento matemático o comprensión sutil de imágenes.
- **Comportamiento no idéntico al BF16**: el autor indica explícitamente que esta cuantización puede diferir del modelo BF16 original.
- **Solo para Apple Silicon**: no se puede ejecutar en GPUs NVIDIA o AMD sin adaptar el código (aunque MLX es específico de Apple).
- **Sin soporte de decodificación especulativa (MTP)**: el checkpoint no contiene tensores `mtp`, por lo que no se puede usar esa técnica de aceleración.
- **Sesgos y alucinaciones**: el modelo base puede presentar sesgos de los datos de entrenamiento y riesgo de alucinación, especialmente en imágenes ambiguas.
- **Licencia MIT**: permite uso comercial, pero se recomienda revisar la licencia del modelo base original para garantizar el cumplimiento.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Shiftedx/ornith-1.5-9b-affine4-vision-mlx)
- [Modelo base Ornith-1.5-9B](https://huggingface.co/ornith-ai/Ornith-1.5-9B)
- [Colección Ornith-1.5](https://huggingface.co/collections/ornith-ai/ornith-15)
- [Página oficial de Ornith-1.5](https://ornith.ai/ornith_1_5.html)
- [Guía de Ornith AI](https://ornith.online/)
- [Versión abliterated de Ornith-1.0 en MLX](https://huggingface.co/Shiftedx/ornith-1.0-9b-abliterated-mxfp4-mlx)
