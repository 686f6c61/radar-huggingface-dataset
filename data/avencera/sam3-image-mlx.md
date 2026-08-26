# avencera/sam3-image-mlx

## Resumen

`avencera/sam3-image-mlx` es un espejo de Avencera del port MLX de SAM 3 (Segment Anything Model 3) de Meta, optimizado para ejecución nativa en Apple Silicon (M1/M2/M3/M4). El repositorio contiene los pesos y archivos de índice copiados byte a byte desde `mlx-community/sam3-image`, sin modificaciones por parte de Avenca, y derivados del modelo original `facebook/sam3`. Este modelo permite realizar segmentación de imágenes interactiva con prompts geométricos y de texto directamente en Mac, sin necesidad de GPUs dedicadas.

SAM 3 es la tercera iteración de la familia SAM de Meta, diseñada para segmentar cualquier objeto en una imagen mediante diferentes tipos de prompts. La versión MLX está optimizada para el framework MLX de Apple, lo que permite aprovechar la memoria unificada y los aceleradores neuronales de los chips Apple Silicon. El modelo tiene 849,5 millones de parámetros y se distribuye en formato `safetensors` con la librería `mlx`. Su relevancia radica en que democratiza el acceso a un modelo de segmentación de última generación en hardware de consumo, eliminando la necesidad de servidores con GPUs de alto rendimiento.

Al ser una réplica exacta de los archivos de `mlx-community/sam3-image`, hereda todas las capacidades del modelo base de Meta, incluyendo la generación de máscaras de segmentación a partir de puntos, cajas delimitadoras o descripciones textuales. La licencia es la SAM License, que impone restricciones específicas de uso y distribución, por lo que es esencial revisarla antes de cualquier implementación comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de visión (basado en SAM3 de Meta) |
| Parametros totales | 849.491.510 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en formato `safetensors` sin cuantización explícita) |
| Idiomas soportados | No disponible (el modelo procesa imágenes; los prompts de texto dependen de un codificador de texto, pero no se especifican idiomas) |
| Licencia | SAM License (licencia específica de Meta, `license: other` en Hugging Face) |
| Formato de pesos | `safetensors` (librería MLX) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo más allá de indicar que se trata de un port MLX de SAM3 de Meta. SAM3 es un modelo de segmentación basado en transformers, que combina un codificador de imagen con un decodificador de máscaras. El modelo acepta múltiples tipos de prompts: puntos, cajas delimitadoras y texto. El repositorio de MLX incluye una implementación optimizada para Apple Silicon, pero no se ofrecen datos específicos sobre el entrenamiento, como el número de tokens, la composición del dataset o si se utilizaron técnicas de RLHF o DPO. Toda la información técnica adicional no está disponible en los metadatos proporcionados.

## Capacidades

- Segmentación de imágenes interactiva con prompts geométricos (puntos, cajas delimitadoras).
- Segmentación con prompts de texto (requiere un codificador de texto, aunque no se especifican idiomas concretos).
- Generación de máscaras de segmentación para objetos concretos dentro de una imagen.
- Ejecución nativa en Apple Silicon mediante el framework MLX, aprovechando la memoria unificada y los aceleradores neuronales.
- Inferencia en tiempo real en Macs sin GPU dedicada, gracias a la optimización específica para hardware de Apple.
- Posibilidad de integrarse en flujos de trabajo de edición de imágenes, visión por computador y análisis de imágenes médicas.

## Casos de uso

- **Edición de imágenes en Mac**: el modelo permite seleccionar objetos en una imagen y generar máscaras precisas para aplicar filtros, recortes o modificaciones en aplicaciones de diseño gráfico o fotografía.
- **Segmentación médica**: investigadores y médicos pueden segmentar estructuras anatómicas en imágenes radiológicas directamente en un Mac, sin necesidad de infraestructura GPU externa.
- **Análisis de imágenes satelitales**: la segmentación de áreas específicas (edificios, cultivos, carreteras) en imágenes aéreas se puede automatizar con este modelo, facilitando tareas de análisis geoespacial.
- **Preprocesado de datos para entrenamiento de modelos**: se pueden generar máscaras de segmentación automáticas para crear datasets de entrenamiento de otros modelos de visión, por ejemplo, para coches autónomos o robótica.
- **Aplicaciones de diseño y creatividad**: diseñadores pueden aislar elementos de una imagen para composiciones gráficas, eliminación de fondos o generación de máscaras para modelos de difusión.
- **Visión artificial en robótica**: la segmentación en tiempo real de objetos en entornos controlados puede integrarse en sistemas de robótica educativa o industrial, ejecutándose en un Mac como unidad de procesamiento central.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los datos de rendimiento, como precisión en datasets estándar (COCO, LVIS, etc.), latencia o throughput, no están incluidos en la model card ni en los metadatos de Hugging Face.

## Requisitos de hardware

- **Hardware mínimo**: Apple Silicon con al menos 8 GB de memoria unificada (M1 o superior).
- **Hardware recomendado**: Apple Silicon con 16 GB de memoria unificada para trabajar con imágenes de alta resolución y mayor velocidad de inferencia.
- **VRAM estimada**: no hay una cifra concreta, pero el tamaño del modelo en pesos es de ~3,4 GB (849M parámetros en FP32). Con cuantización (no disponible en este repositorio), el uso de memoria podría reducirse significativamente.
- **GPUs compatibles**: solo Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No es compatible con GPUs NVIDIA o AMD.
- **Opciones de despliegue**: se puede integrar en aplicaciones macOS usando la librería MLX de Apple. No se mencionan integraciones con vLLM, llama.cpp u otros frameworks de inferencia.
- **Latencia y throughput**: no hay datos publicados, pero la optimización nativa para Apple Silicon permite inferencias interactivas en tiempo real en Macs modernos.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la información proporcionada. Sin embargo, en términos de parámetros y contexto de uso, se puede comparar con otros modelos de segmentación de Meta:

| Modelo | Parámetros | Longitud de contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SAM (Segment Anything Model) | ~93M | No aplica | Apache 2.0 | Hugging Face |
| SAM2 | ~80M a ~224M según variante | No aplica | Apache 2.0 | Hugging Face |
| SAM3 (este port MLX) | 849.5M | No aplica | SAM License | Hugging Face |

Nota: los parámetros de SAM y SAM2 son orientativos y pueden variar según la variante. No se incluyen datos de rendimiento porque no se han publicado en la información consultada.

## Limitaciones y advertencias

- **Licencia restrictiva**: la SAM License de Meta impone condiciones de uso específicas, incluyendo restricciones para uso comercial y redistribución. Es obligatorio revisar el texto completo de la licencia antes de cualquier implementación.
- **Solo Apple Silicon**: el modelo está optimizado exclusivamente para hardware de Apple, lo que limita su portabilidad a otras plataformas.
- **Sin cuantización incluida**: el repositorio no proporciona versiones cuantizadas, lo que implica un uso de memoria fijo de ~3.4 GB en pesos.
- **Idiomas de texto**: no se especifican los idiomas soportados para los prompts de texto. Es probable que el codificador de texto esté entrenado principalmente en inglés, aunque no se confirma.
- **Sesgos y alucinaciones**: al ser un modelo de segmentación, no genera texto, pero podría producir máscaras incorrectas en imágenes ambiguas o con objetos parcialmente ocluidos. No se han publicado evaluaciones de sesgo específicas.
- **Repositorio espejo**: este repositorio es un mirror de `mlx-community/sam3-image`, por lo que no hay desarrollo activo ni soporte directo de Avenca sobre el modelo.

## Enlaces

- [Modelo en Hugging Face (avencera/sam3-image-mlx)](https://huggingface.co/avencera/sam3-image-mlx)
- [Modelo original en MLX Community](https://huggingface.co/mlx-community/sam3-image)
- [Repositorio GitHub del port MLX](https://github.com/Deekshith-Dade/mlx_sam3)
- [Modelo en ModelScope](https://www.modelscope.cn/models/mlx-community/sam3-image)
- [Licencia SAM](https://github.com/facebookresearch/sam3/blob/8f0b7f4d4e7eda2ed606ebde6702c93359ad01da/LICENSE)
