# jiuuxianglizhi/Qwen3-VL-4B-Instruct-Uncensored-FP8

## Resumen

El modelo `jiuuxianglizhi/Qwen3-VL-4B-Instruct-Uncensored-FP8` es un ajuste fino (finetune) no oficial del modelo Qwen3-VL-4B-Instruct de Qwen, publicado por el usuario `jiuuxianglizhi`. Se trata de un modelo multimodal de visión y lenguaje orientado a tareas de imagen a texto, entrenado con pares de imagen y texto a una resolución de 1024 px. Según la model card, el finetune busca reducir las alucinaciones en tareas específicas relacionadas con contenido para adultos, lo que se denomina en el repositorio como versión “uncensored”.

El modelo cuenta con 4.437.815.808 parámetros y se distribuye con pesos en formato safetensors bajo licencia Apache 2.0. El proceso de entrenamiento declara el uso de precisión FP32 completa con conversión por bloques a FP8, manteniendo algunos bloques clave en FP32. Esta combinación se refleja en el nombre del repositorio y en su tamaño de 5,7 GB. No se especifican la longitud de contexto ni los idiomas soportados en la información disponible. La capacidad de descripción de vídeo se señala como limitada. El modelo no presenta resultados de benchmarks publicados en los datos consultados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de visión y lenguaje (Qwen3-VL) |
| Parametros totales | 4.437.815.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (conversión por bloques, con bloques clave en FP32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de la familia Qwen3-VL, un modelo multimodal de visión y lenguaje que procesa entradas de imagen y texto. La información disponible no detalla la arquitectura interna más allá de su adscripción a Qwen3-VL, por lo que no se pueden precisar innovaciones técnicas específicas como mecanismos de atención o decodificación. El modelo fue ajustado a partir de Qwen/Qwen3-VL-4B-Instruct mediante pares de imagen y texto a 1024 px de resolución.

Según la model card, el entrenamiento se realizó en FP32 completo y posteriormente se aplicó una conversión por bloques a FP8, conservando bloques clave en FP32. Esta estrategia híbrida pretende mantener la calidad del finetune en puntos sensibles de la red mientras se reduce el espacio de almacenamiento. La model card incluye una nota explícita: “Do Not quantize this model use the full FP32 Training when quantizing”, lo que advierte de que una cuantización adicional más allá de la conversión a FP8 provista podría degradar el rendimiento. No se aportan datos sobre el número de tokens, la composición del dataset de entrenamiento ni el uso de técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto descriptivo a partir de imágenes (image-to-text).
- Ajuste específico con pares de imagen y texto a alta resolución (1024 px).
- Reducción de alucinaciones en tareas relacionadas con contenido adulto, según la model card.
- Capacidad limitada de captioning de vídeo.
- No se dispone de información sobre soporte de tool calling, agentes, multi-step reasoning ni capacidad de audio en los datos consultados.

## Casos de uso

- Gestión de activos digitales (DAM): el modelo puede generar descripciones automáticas de imágenes en grandes repositorios corporativos, lo que facilita la búsqueda y el etiquetado. Su tamaño de 4B lo hace razonable para entornos de servidor, y su entrenamiento a 1024 px permite capturar detalles visuales en imágenes de producto o documentación.
- Accesibilidad web: la generación de texto alternativo para imágenes en sitios públicos y aplicaciones es una aplicación directa. El modelo produce descripciones en lenguaje natural que pueden integrarse en flujos automáticos de publicación para cumplir normas de accesibilidad.
- Automatización en e-commerce: en catálogos de productos, el modelo puede redactar fichas descriptivas a partir de fotografías de artículos. La capacidad multimodal de Qwen3-VL permite asociar la imagen con textos cortos o etiquetas previas, lo que agiliza la creación de contenido comercial.
- Moderación de contenido visual en plataformas digitales: dado que el finetune se orientó a reducir la alucinación en tareas NSFW, el modelo puede emplearse en sistemas de clasificación y etiquetado de imágenes para revisar contenido adulto en entornos de moderación, siempre bajo políticas de uso responsables y con supervisión humana.
- Asistencia técnica remota: el modelo puede recibir fotografías de equipos, paneles o instalaciones y devolver descripciones útiles para personal de soporte. La ventana de entrenamiento a 1024 px ayuda a distinguir detalles de cables, componentes o señales en una imagen.
- Digitalización de documentos gráficos: en facturas, formularios o informes con diagramas, el modelo puede extraer descripciones textuales de las zonas visuales. Esta capacidad resulta útil para flujos de automatización documental que necesitan interpretar contenido gráfico antes de procesarlo con sistemas de OCR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- La VRAM estimada para inferencia depende de la longitud de contexto y del lote. Solo los pesos en FP8 ocupan aproximadamente 4,4 GB; el repositorio tiene un tamaño de 5,7 GB, lo que sugiere una sobrecarga adicional por los bloques en FP32. Se estima que, sin re-cuantizar y con una ventana de contexto moderada, se necesitan al menos 12 GB de VRAM.
- GPU recomendadas: cualquier tarjeta con 12 GB o más de VRAM, como una RTX 3060 de 12 GB, RTX 4070 o superior, y GPUs de centro de datos como A10G o L4. Para procesar reseñas de imágenes con lotes grandes o vídeo, se recomienda una RTX 4090 o una A100.
- El modelo cabe en GPUs de consumo de 12 GB, siempre que se utilice la cuantización FP8 incluida y no se aplique una cuantización adicional.
- Opciones de despliegue: al usar formato safetensors, se puede intentar la carga con vLLM o Transformers para inferencia directa en entorno Python. La advertencia de la model card sobre no re-cuantizar recomienda evitar la conversión a GGUF u otros formatos mediante cuantización adicional; si se necesita una versión para llama.cpp u Ollama, habría que convertir el modelo con riesgo de pérdida de calidad.
- No se dispone de datos de latencia ni throughput en la información consultada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen/Qwen3-VL-4B-Instruct | 4.437.815.808 | no disponible | Apache 2.0 | Modelo base sin finetune específico; disponible en FP8 oficial. |
| Qwen/Qwen3-VL-4B-Instruct-FP8 | 4.437.815.808 | no disponible | Apache 2.0 | Cuantización FP8 oficial del modelo base, sin el ajuste “uncensored”. |
| jiuuxianglizhi/Qwen3-VL-4B-Instruct-Uncensored-FP8 | 4.437.815.808 | no disponible | Apache 2.0 | Finetune NSFW con entrenamiento FP32 y conversión a FP8; incluye advertencia de no re-cuantizar. |

## Limitaciones y advertencias

- El modelo hereda las características y posibles sesgos del modelo base Qwen3-VL-4B-Instruct, que no se documentan en la información proporcionada.
- La model card indica una capacidad limitada de captioning de vídeo, por lo que no se debe usar en tareas complejas de comprensión de vídeo.
- La nota “Do Not quantize this model use the full FP32 Training when quantizing” aconseja no aplicar una cuantización adicional a los pesos FP8; hacerlo puede degradar la calidad del finetune.
- Al ser un modelo etiquetado como “uncensored”, puede generar contenido explícito o sensible si no se aplican filtros de salida en el sistema de despliegue. La responsabilidad del uso recae en el operador.
- No se han publicado resultados de evaluación sobre alucinaciones generales; la reducción de alucinaciones se afirma únicamente en el dominio NSFW.
- El repositorio no especifica la longitud de contexto, los idiomas soportados ni la política de entrenamiento con datos, lo que complica la evaluación previa para producción.
- La licencia Apache 2.0 permite el uso comercial, pero la procedencia de los datos de finetune no está documentada, por lo que la revisión legal del uso de los datos puede ser necesaria.

## Enlaces

- Repositorio del modelo: https://huggingface.co/jiuuxianglizhi/Qwen3-VL-4B-Instruct-Uncensored-FP8
- Modelo base original de Qwen: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Versión FP8 oficial del modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct-FP8
- Modelo Uncesored de referencia citado en la nota: https://huggingface.co/Felldude/Qwen3-VL-4B-Instruct-Uncensored
