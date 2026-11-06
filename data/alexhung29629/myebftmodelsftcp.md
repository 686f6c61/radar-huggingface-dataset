# AlexHung29629/MyEBFTModelSFTCP

## Resumen

MyEBFTModelSFTCP es un modelo multimodal de tipo image-text-to-text publicado en Hugging Face por el usuario AlexHung29629, resultado de un proceso de fine-tuning supervisado (SFT) sobre el modelo base AlexHung29629/ebft_gemma4_26b_lora_lr5e6_merged. Este modelo base, a su vez, parece derivar de la familia Gemma 4 con un adaptador LoRA fusionado, según indican los tags y el nombre del repositorio. El modelo cuenta con 25.805.933.872 parámetros (aproximadamente 25,8 mil millones), lo que lo sitúa en la gama de modelos medianos-grandes con capacidad de procesar entradas de imagen y texto.

El modelo se ha entrenado con varios conjuntos de datos de instrucciones (SFT) orientados a conversación, agentes y búsqueda, tal como reflejan los datasets referenciados en los metadatos: ultradata-sft-clean.jsonl, ultradata-sft-agent-clean.jsonl, tw-sft-clean.jsonl y search-sft-clean.jsonl. El pipeline declarado es image-text-to-text, lo que indica soporte para tareas de visión-lenguaje además de generación de texto. El repositorio está marcado como acceso restringido (gated) y no dispone de descargas ni likes en el momento de la consulta, lo que sugiere que se trata de un modelo de investigación o de un experimento personal sin amplia validación por la comunidad.

La relevancia de este modelo radica en su carácter de experimento de fine-tuning sobre una arquitectura Gemma 4 multimodal con un volumen considerable de parámetros, lo que puede interesar a desarrolladores que quieran evaluar adaptaciones de la familia Gemma en tareas de agentes y conversación multimodal. No obstante, la ausencia de benchmarks publicados, de licencia clara y de documentación detallada limita su uso en producción sin una evaluación previa por parte del equipo técnico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basado en Gemma 4 según tags |
| Parametros totales | 25.805.933.872 (≈25,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | image-text-to-text |
| Modelo base | AlexHung29629/ebft_gemma4_26b_lora_lr5e6_merged |
| Acceso | Restringido (gated) |
| Tamano del repo | 53,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer multimodal de tipo image-text-to-text, según el pipeline declarado y los tags del repositorio. El modelo base es AlexHung29629/ebft_gemma4_26b_lora_lr5e6_merged, cuyo nombre sugiere que se trata de un modelo Gemma 4 de 26 mil millones de parámetros con un adaptador LoRA fusionado (lr5e6 indica una tasa de aprendizaje de 5e-6). El modelo actual es el resultado de un fine-tuning supervisado (SFT) adicional sobre ese modelo base, usando la librería transformers y con soporte de TensorBoard para el seguimiento del entrenamiento.

Los datos de entrenamiento consisten en varios conjuntos de instrucciones en formato JSONL: ultradata-sft-clean.jsonl, ultradata-sft-agent-clean.jsonl, tw-sft-clean.jsonl y search-sft-clean.jsonl. Estos nombres sugieren un enfoque en conversación general, comportamiento de agentes y tareas de búsqueda. No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal. El tag generated_from_trainer confirma que el modelo se generó mediante un script de entrenamiento de la librería transformers, probablemente con el Trainer o SFTTrainer.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a instrucciones (SFT).
- Procesamiento de entradas de imagen y texto (pipeline image-text-to-text), lo que permite tareas de visión-lenguaje como descripción de imágenes o respuesta a preguntas visuales.
- Comportamiento de agente: los datasets de entrenamiento incluyen un conjunto específico para agentes (ultradata-sft-agent-clean.jsonl), lo que sugiere soporte para tool calling o razonamiento multi-paso, aunque no se detalla en la model card.
- Tareas de búsqueda: el dataset search-sft-clean.jsonl indica un posible entrenamiento para consultas o recuperación de información.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- Modo thinking o razonamiento extendido: no disponible.
- Soporte de audio: no disponible.

## Casos de uso

- **Asistente conversacional multimodal en atención al cliente**: el modelo puede gestionar conversaciones multi-turno que incluyan capturas de pantalla o imágenes de productos, gracias a su pipeline image-text-to-text y a su entrenamiento SFT en datos conversacionales. Es adecuado para prototipos de soporte técnico donde el usuario adjunta imágenes.
- **Automatización de tareas de agente con búsqueda**: dado el entrenamiento con datos de agentes y búsqueda, puede emplearse en flujos donde el modelo decida qué herramienta invocar (por ejemplo, una API de búsqueda) y sintetice la respuesta. Requiere una capa de orquestación externa para el tool calling, ya que no se documenta soporte nativo.
- **Generación de descripciones de imágenes para accesibilidad**: el modelo puede recibir una imagen y generar texto descriptivo, útil para sistemas de alt-text automático en plataformas de contenido.
- **Análisis de documentos con imágenes**: en pipelines de extracción de información, el modelo puede responder preguntas sobre capturas de facturas, gráficos o formularios, combinando la entrada visual con instrucciones textuales.
- **Prototipado de asistentes de investigación**: con el dataset de búsqueda, puede emplearse para resumir o reformular consultas en un sistema de recuperación aumentada (RAG), aunque su contexto máximo no está documentado.
- **Evaluación comparativa de fine-tunings sobre Gemma 4**: investigadores pueden usar este modelo como referencia para estudiar el efecto de SFT con datasets específicos (ultradata, tw, search) sobre un modelo base multimodal de 26 B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index del repositorio declara una entrada con nombre "outputs/gemma4-26b-ebft-mix-noeaft-cp" pero con la lista de resultados vacía, por lo que no hay métricas (MMLU, HumanEval, GSM8K, etc.) que se puedan presentar.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 25,8 B parámetros en precisión completa (FP16/BF16), se requieren aproximadamente 51,6 GB solo para los pesos, más overhead de activaciones y KV cache. En cuantización de 8 bits, unos 26 GB; en 4 bits, unos 13-15 GB.
- **GPU recomendadas**: para FP16 se recomiendan GPU profesionales con 80 GB (A100, H100) o múltiples GPU de 24-48 GB. Para cuantización 4 bits, una RTX 4090 (24 GB) o RTX A6000 (48 GB) podrían ser suficientes para inferencia, aunque el contexto largo puede aumentar los requisitos.
- **¿Cabe en consumer GPU?**: en cuantización 4 bits, sí es posible en GPUs de 24 GB como la RTX 4090, siempre que se limite la longitud de contexto y se use un runtime eficiente. En 8 bits, requiere al menos 32 GB, por lo que no cabe en GPUs de consumo típicas.
- **Opciones de despliegue**: al ser un modelo de transformers con pesos safetensors, puede desplegarse con vLLM (si soporta la arquitectura Gemma 4 multimodal), TGI, o llama.cpp/Ollama tras conversión a GGUF. No se documentan recetas oficiales.
- **Latencia y throughput**: no disponibles. Al ser un modelo multimodal de 26 B, se espera una latencia mayor que modelos de 7-8 B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas (contexto, licencia, idiomas) para establecer una comparativa rigurosa con alternativas. Se indica "no disponible" para los modelos comparables, ya que no se conocen resultados de rendimiento de este modelo ni de su modelo base que permitan una comparación objetiva.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MyEBFTModelSFTCP | 25,8 B | no disponible | no disponible | Gated en HF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Sesgos conocidos**: no se documentan, pero al derivar de Gemma 4 y entrenarse con datasets no especificados, puede heredar sesgos de esos datos.
- **Riesgo de alucinación**: inherente a los modelos generativos; no hay evaluaciones de fidelidad publicadas.
- **Limitaciones de contexto o idioma**: se desconoce la longitud máxima de contexto y los idiomas soportados; los datasets de entrenamiento parecen incluir texto en inglés y posiblemente chino (tw-sft-clean), pero no se confirma.
- **Restricciones de licencia**: la licencia no está disponible, lo que impide determinar si se permite uso comercial. El acceso es restringido (gated), por lo que se requiere aceptar condiciones en Hugging Face.
- **Caveats para producción**: ausencia de benchmarks, documentación mínima, cero descargas/likes y un tamaño de repositorio de 53,1 GB. No se recomienda su uso en producción sin una evaluación exhaustiva y sin aclarar la licencia. El modelo base es un fine-tuning con LoRA fusionado, lo que puede introducir inestabilidades no documentadas.

## Enlaces

- [Hugging Face: AlexHung29629/MyEBFTModelSFTCP](https://huggingface.co/AlexHung29629/MyEBFTModelSFTCP)
- [Modelo base: AlexHung29629/ebft_gemma4_26b_lora_lr5e6_merged](https://huggingface.co/AlexHung29629/ebft_gemma4_26b_lora_lr5e6_merged)
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
