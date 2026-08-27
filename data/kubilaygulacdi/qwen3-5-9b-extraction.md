# kubilaygulacdi/qwen3.5-9b-extraction

## Resumen

El modelo `kubilaygulacdi/qwen3.5-9b-extraction` es un ajuste fino (finetune) del modelo base Qwen/Qwen3.5-9B, desarrollado por el usuario kubilaygulacdi y publicado en Hugging Face. Está orientado a tareas de extracción de información, como su nombre indica, aunque la model card no proporciona detalles específicos sobre el dataset de entrenamiento ni el propósito exacto. El entrenamiento se realizó con las librerías Unsloth y TRL de Hugging Face, lo que permitió una optimización del proceso.

El modelo base Qwen3.5-9B es un transformer denso multimodal con visión nativa, contexto de 262 000 tokens y una arquitectura de fusión temprana de tokens multimodales. Según análisis independientes, es considerado uno de los modelos más inteligentes por debajo de 10 000 millones de parámetros en su lanzamiento, con un rendimiento destacado en razonamiento, codificación y comprensión visual. Este finetune hereda presumiblemente estas capacidades, aunque no se han publicado evaluaciones específicas del modelo ajustado.

La licencia es Apache 2.0, lo que permite uso comercial y modificación, y el idioma declarado es el inglés. El repositorio tiene un tamaño de 19,3 GB y los pesos están en formato safetensors. A fecha de publicación, el modelo no registra descargas ni valoraciones, lo que sugiere que es un lanzamiento reciente o de baja difusión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso (heredada del modelo base Qwen3.5-9B) |
| Parametros totales | 9 653 104 368 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada en el finetune; el modelo base Qwen3.5-9B tiene 262 000 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen3.5-9B, un transformer denso multimodal que integra visión y lenguaje mediante fusión temprana de tokens. El modelo base fue entrenado por Alibaba y presenta una arquitectura que combina atención estándar con mecanismos de razonamiento avanzado, aunque los detalles técnicos exactos no se especifican en la documentación del finetune.

El entrenamiento del finetune se realizó con Unsloth, una librería que acelera el ajuste fino mediante optimizaciones de memoria y cómputo, y con la librería TRL de Hugging Face, que proporciona herramientas para entrenamiento con refuerzo y ajuste supervisado. No se indica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. Tampoco se detalla si el finetune modificó la arquitectura original o solo los pesos.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.5-9B, que destaca en tareas de razonamiento lógico y matemático.
- Comprensión multimodal: al estar basado en un modelo con visión nativa, puede procesar imágenes y texto, aunque no se confirma si el finetune conserva esta funcionalidad.
- Extracción de información: el nombre del modelo sugiere que está especializado en tareas de extracción de entidades, relaciones o datos estructurados, pero no hay documentación que lo confirme.
- Soporte de tool calling y agentes: el modelo base Qwen3.5-9B incluye capacidades de llamada a herramientas y razonamiento multi-paso, que probablemente se mantienen en el finetune.
- Multilingüismo: solo se declara inglés como idioma soportado, aunque el modelo base podría tener capacidades multilingües no documentadas en este finetune.

## Casos de uso

- Extracción de entidades en documentos legales: el modelo podría utilizarse para identificar nombres, fechas, cláusulas y otras entidades en contratos o textos jurídicos, aunque no hay evidencia de que esté entrenado específicamente para ello.
- Procesamiento de facturas y recibos: gracias a su posible capacidad multimodal, podría extraer campos clave como importes, proveedores o números de factura a partir de imágenes escaneadas.
- Generación de bases de conocimiento: podría emplearse para convertir texto no estructurado en tripletas o registros estructurados, facilitando la construcción de grafos de conocimiento.
- Asistencia en atención al cliente: con su contexto largo (si se mantiene el del modelo base), podría gestionar conversaciones multi-turno y extraer información relevante de historiales extensos.
- Análisis de informes médicos: podría extraer síntomas, diagnósticos o medicamentos de textos clínicos, aunque requiere validación experta y no hay garantía de precisión.
- Automatización de pipelines de datos: en combinación con herramientas de llamada a funciones, podría integrarse en flujos de procesamiento de documentos para normalizar y estructurar información.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este finetune en la información disponible. El modelo base Qwen3.5-9B, según análisis independientes, obtuvo una puntuación de aproximadamente 69% en MMMU-Pro y fue calificado como el modelo más inteligente bajo 10 000 millones de parámetros en su lanzamiento, pero estos datos no son directamente aplicables al modelo ajustado.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 9 653 millones de parámetros en precisión fp16, se requieren aproximadamente 19-20 GB de VRAM. Con cuantización a 8 bits, la demanda se reduce a unos 10 GB, y a 4 bits a unos 5-6 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: para inferencia en fp16, una GPU con 24 GB de VRAM como la RTX 4090 o la A10G es adecuada. Para cuantización de 4 bits, una RTX 3060 de 12 GB podría ser suficiente.
- Compatibilidad con GPU de consumo: sí, es posible ejecutarlo en GPUs de consumo con al menos 12 GB de VRAM si se aplica cuantización, aunque no se proporcionan archivos GGUF ni guías de cuantización en el repositorio.
- Opciones de despliegue: al ser un modelo de la familia transformers, puede desplegarse con vLLM, Text Generation Inference (TGI), llama.cpp (si se convierte a GGUF) u Ollama. El tag `text-generation-inference` sugiere compatibilidad con TGI.
- Latencia y throughput: no se dispone de datos medidos para este finetune. En general, un modelo de 9B en una GPU moderna puede generar entre 20 y 50 tokens por segundo en fp16, dependiendo de la implementación y el hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-9B (base) | 9,65 B | 262 000 | Apache 2.0 | Modelo original multimodal, sin ajuste específico |
| kubilaygulacdi/qwen3.5-9b-extraction | 9,65 B | No especificado | Apache 2.0 | Finetune para extracción, sin benchmarks publicados |
| SandyVeliz/acervo-extractor-qwen3.5-9b | 9,65 B (presumible) | No especificado | No especificada | Otro finetune de extracción sobre el mismo base, sin detalles |

No se dispone de comparativas de rendimiento entre estos modelos, ya que ninguno de los finetunes ha publicado resultados de evaluación.

## Limitaciones y advertencias

- No hay documentación sobre el dataset de entrenamiento del finetune, por lo que se desconocen los posibles sesgos introducidos durante el ajuste.
- El modelo base puede presentar alucinaciones, especialmente en tareas de generación libre, y el finetune podría heredar este comportamiento.
- La longitud de contexto no está confirmada para el finetune; si se redujo durante el entrenamiento, podría limitar el procesamiento de documentos largos.
- Solo se declara inglés como idioma, lo que limita su uso en entornos multilingües.
- Aunque la licencia Apache 2.0 permite uso comercial, no hay garantías de que el modelo funcione correctamente en producción sin una evaluación previa.
- El repositorio no incluye ejemplos de uso, scripts de inferencia ni documentación técnica, lo que dificulta su integración inmediata.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kubilaygulacdi/qwen3.5-9b-extraction
- Página del modelo base Qwen3.5-9B en LLM Releases: https://www.llm-releases.com/models/qwen3-5-9b
- Catálogo de Microsoft Foundry para Qwen3.5-9B: https://ai.azure.com/catalog/models/qwen-qwen3.5-9b
- Benchmarks del modelo base en Benchable: https://benchable.ai/models/qwen/qwen3.5-9b-20260310
- Finetune similar de extracción: https://huggingface.co/SandyVeliz/acervo-extractor-qwen3.5-9b
