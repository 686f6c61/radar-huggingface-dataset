# ArchiveStudio/Qwen3.5-9B

## Resumen

ArchiveStudio/Qwen3.5-9B es un modelo multimodal de visión y lenguaje (image-text-to-text) desarrollado por ArchiveStudio como un fine-tuning del modelo base Qwen/Qwen3.5-9B-Base de la familia Qwen3.5. Se trata de un modelo denso de 9 000 millones de parámetros con una ventana de contexto nativa de 262 144 tokens, diseñado para tareas de razonamiento visual, comprensión de imágenes y vídeo, así como generación de texto y código. Su relevancia radica en ofrecer capacidades multimodales avanzadas en un tamaño compacto, lo que permite su despliegue en entornos con recursos limitados sin renunciar a un contexto muy largo.

El modelo se distribuye en formato safetensors y es compatible con el ecosistema de Hugging Face Transformers, así como con motores de inferencia como vLLM, SGLang y KTransformers. Aunque el repositorio de Hugging Face no incluye una ficha detallada ni métricas de rendimiento, los resultados de búsqueda indican que el modelo base Qwen3.5-9B alcanza una tasa de éxito del 83 % en benchmarks agregados, aunque su velocidad de respuesta se sitúa en el percentil 10, lo que sugiere una latencia mayor que la de sus competidores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con fusión temprana multimodal (texto, imagen, vídeo) |
| Parametros totales | 9 000 millones (9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | No disponible (se espera compatibilidad con cuantizaciones estándar de Transformers y GGUF) |
| Idiomas soportados | No disponible (probablemente multilingüe, dado el origen de Qwen) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de Qwen3.5-9B se basa en un transformer denso con un diseño de fusión temprana (early fusion) para integrar información multimodal de texto, imagen y vídeo. Esto permite que el modelo procese conjuntamente entradas de diferentes modalidades desde las primeras capas, mejorando la coherencia en tareas de razonamiento visual. El modelo base fue desarrollado por el equipo de Qwen (Alibaba) y posteriormente fine-tuneado por ArchiveStudio, aunque no se han publicado detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni las técnicas de alineación (RLHF, DPO, etc.). Tampoco se dispone de información sobre innovaciones técnicas específicas más allá de la fusión temprana y la ventana de contexto extendida de 262 144 tokens.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa y comprende imágenes, vídeo y texto, permitiendo responder preguntas sobre contenido visual.
- Razonamiento visual: capaz de describir escenas, responder a preguntas sobre objetos, relaciones y acciones en imágenes.
- Comprensión de vídeo: puede analizar secuencias de vídeo para extraer información temporal y contextual.
- Generación de código: al ser un modelo de la familia Qwen, se espera que tenga capacidades sólidas de generación y comprensión de código, aunque no se han publicado benchmarks específicos.
- Soporte de contexto largo: con 262 144 tokens de ventana, puede manejar documentos extensos, conversaciones largas o vídeos con múltiples fotogramas.
- Compatibilidad con herramientas: no se ha confirmado soporte explícito de tool calling o function calling en la información disponible, pero es probable que el modelo base lo incluya.

## Casos de uso

- Análisis de documentos visuales: el modelo puede extraer información de facturas, contratos o informes escaneados, combinando OCR con razonamiento semántico gracias a su capacidad multimodal.
- Moderación de contenido audiovisual: procesar vídeos o imágenes para detectar contenido inapropiado o clasificar material según políticas, aprovechando su comprensión de vídeo y contexto largo.
- Asistente de accesibilidad: describir imágenes o vídeos a personas con discapacidad visual en tiempo real, generando descripciones detalladas y contextuales.
- Automatización de soporte técnico: gestionar consultas de usuarios que incluyen capturas de pantalla o diagramas, respondiendo con instrucciones precisas basadas en el contenido visual.
- Generación de documentación técnica: a partir de diagramas de arquitectura o flujos de trabajo, el modelo puede redactar explicaciones textuales o documentación de API.
- Análisis de vídeo para vigilancia: resumir eventos en secuencias de vídeo largas, identificando acciones relevantes y generando informes, gracias a su ventana de contexto de 262 144 tokens.
- Asistente de programación con capturas de pantalla: el desarrollador puede compartir una imagen de un error o un diagrama de clases y el modelo sugiere correcciones o genera código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para ArchiveStudio/Qwen3.5-9B en la información disponible. Sin embargo, según benchable.ai, el modelo base Qwen3.5-9B muestra una tasa de éxito agregada del 83 % en una serie de benchmarks, aunque su velocidad de respuesta se sitúa en el percentil 10, lo que indica una latencia relativamente alta en comparación con otros modelos de su categoría. No se dispone de desglose por tareas (MMLU, HumanEval, GSM8K, etc.) ni de comparaciones directas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 9B parámetros en precisión FP16 requiere aproximadamente 18 GB de VRAM. Con cuantización de 8 bits, se reduce a unos 9 GB, y con 4 bits, a unos 4,5 GB.
- GPU recomendadas: para FP16, una GPU con 24 GB de VRAM (RTX 3090, RTX 4090, A10G) es suficiente. Para cuantización de 4 bits, una RTX 3060 de 12 GB o una RTX 4070 pueden ser viables.
- Compatibilidad con GPU de consumo: sí, con cuantización adecuada puede ejecutarse en GPUs de consumo como la RTX 3060 (12 GB) o superiores.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang y KTransformers. También puede ejecutarse mediante llama.cpp u Ollama si se convierte a formato GGUF.
- Latencia y throughput: no se dispone de datos concretos. El benchmark de benchable.ai sugiere una velocidad baja (percentil 10), por lo que se recomienda usar cuantización y optimizaciones como vLLM para mejorar el rendimiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ArchiveStudio/Qwen3.5-9B | 9B | 262 144 | Sí (imagen, vídeo, texto) | Apache-2.0 | Hugging Face |
| Llama 3.2 8B (Meta) | 8B | 128 000 | No (solo texto) | Llama 3.2 Community License | Hugging Face, Ollama |
| Mistral 7B (Mistral AI) | 7B | 32 000 | No (solo texto) | Apache-2.0 | Hugging Face, Ollama |
| Phi-3.5-vision (Microsoft) | 4.2B | 128 000 | Sí (imagen, texto) | MIT | Hugging Face |

La comparativa muestra que Qwen3.5-9B ofrece una ventana de contexto muy superior a la de Llama 3.2 8B y Mistral 7B, y es comparable a Phi-3.5-vision en cuanto a multimodalidad, aunque con más parámetros. Su licencia Apache-2.0 permite uso comercial sin restricciones, a diferencia de Llama 3.2 que tiene restricciones para empresas con más de 700 millones de usuarios mensuales.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos específicos del modelo, pero al ser un fine-tune de Qwen, puede heredar sesgos presentes en los datos de entrenamiento originales.
- Riesgo de alucinación en tareas de razonamiento visual: el modelo puede generar descripciones plausibles pero incorrectas sobre imágenes o vídeos ambiguos.
- La velocidad de inferencia es baja según benchable.ai (percentil 10), lo que puede ser un problema para aplicaciones en tiempo real.
- No se han publicado detalles sobre el proceso de fine-tuning de ArchiveStudio, por lo que se desconoce si se aplicaron técnicas de alineación para reducir sesgos o mejorar la seguridad.
- Aunque la licencia es Apache-2.0, el modelo base Qwen3.5-9B puede tener términos adicionales en su repositorio original; se recomienda revisar la documentación oficial de Qwen.
- La ventana de contexto de 262 144 tokens puede requerir una gestión cuidadosa de la memoria, especialmente en GPUs con menos de 24 GB de VRAM.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/ArchiveStudio/Qwen3.5-9B
- Página del modelo en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-9b
- Ficha en idapt: https://idapt.app/models/qwen/qwen3.5-9b
- Catálogo de Microsoft Foundry: https://ai.azure.com/catalog/models/qwen--qwen3.5-9b
- Benchmarks en benchable.ai: https://benchable.ai/models/qwen/qwen3.5-9b-20260310
