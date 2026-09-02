# Geong/DARL

## Resumen

DARL (Document-to-Markup via Look-Ahead Diffusion Trajectory Sampling) es un modelo híbrido de difusión y autoregresión desarrollado por Geong, presentado en ECCV 2026, que aborda la generación de documentos a formato Markdown a partir de imágenes. Se construye sobre el modelo base `dots-studio/dots.ocr`, un VLM especializado en OCR y parsing de documentos, y añade dos componentes innovadores: Online Monte Carlo Trajectory Generation (OMTG) y Diffusion Trajectory Preference Optimization (DTPO). El resultado es una aceleración de inferencia de 2,3× en tareas de parsing de documentos, manteniendo una precisión comparable a los modelos autoregresivos tradicionales.

El modelo tiene aproximadamente 3.000 millones de parámetros en bfloat16, con una ventana de contexto de 131.072 tokens, lo que permite procesar documentos extensos de una sola pasada. Su arquitectura combina un encoder de visión (`dots_vit`) con un modelo de lenguaje causal de 28 capas, y se distribuye bajo licencia Apache 2.0. Está diseñado para integrarse en pipelines de digitalización documental, extracción de información y generación de contenido estructurado, con especial énfasis en eficiencia computacional.

La relevancia actual de DARL radica en su enfoque híbrido que reduce el coste de inferencia en tareas de visión-lenguaje, un cuello de botella habitual en producción. Al generar múltiples tokens en paralelo y verificarlos incrementalmente, ofrece una alternativa práctica a los modelos puramente autoregresivos para entornos con restricciones de latencia o recursos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `DotsOCRForCausalLM` (modelo de lenguaje causal con encoder de visión `dots_vit`) |
| Parametros totales | ~3B (bfloat16) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 131072 tokens |
| Tipos de cuantizacion | no disponible (el repo solo incluye pesos en bfloat16) |
| Idiomas soportados | no disponible (no se especifican en la documentacion) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DARL se basa en la arquitectura de `dots.ocr`, que a su vez deriva de Qwen-VL. El modelo combina un encoder de visión `dots_vit` (42 capas, patch size 14) con un modelo de lenguaje de 28 capas, hidden size 1536 y 12 cabezas de atención (2 KV heads). La innovación principal reside en el método de entrenamiento e inferencia: OMTG genera trayectorias de muestreo en tiempo real mediante una ventana deslizante, mientras que DTPO aplica optimización por preferencias con recompensas basadas en el prefijo común más largo (LCP). En inferencia, se generan varios tokens en paralelo usando tokens de inicialización especiales y se verifican de izquierda a derecha con la ventana deslizante.

No se proporcionan detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO convencional. El entrenamiento se apoya en el modelo base `dots.ocr` y en la infraestructura de Qwen-VL, con financiación de la National Natural Science Foundation of China y la Natural Science Foundation de la provincia de Guangdong.

## Capacidades

- Generación de texto estructurado (Markdown) a partir de imágenes de documentos, incluyendo tablas, listas y formato jerárquico.
- OCR de documentos escaneados o fotografiados, con salida en formato legible por máquina.
- Procesamiento de imágenes y texto en un pipeline unificado (image-text-to-text), soportando conversaciones multimodales.
- Manejo de contextos largos (hasta 131.072 tokens), adecuado para documentos extensos o múltiples páginas.
- Inferencia acelerada mediante generación paralela de tokens y verificación incremental, reduciendo la latencia frente a modelos autoregresivos puros.
- Integración con el ecosistema Transformers mediante `trust_remote_code=True`, permitiendo su uso con `AutoModelForCausalLM` y `AutoProcessor`.

## Casos de uso

- Digitalización de archivos históricos: convertir escaneos de documentos antiguos en Markdown estructurado para su indexación y búsqueda, aprovechando la ventana de contexto de 131.072 tokens para procesar documentos completos sin fragmentación.
- Extracción de tablas y datos financieros: el modelo puede transformar informes anuales, facturas o extractos bancarios en tablas Markdown, facilitando su posterior análisis con herramientas de procesamiento de datos.
- Generación de documentación técnica a partir de capturas de pantalla: convierte imágenes de diagramas, esquemas o manuales en texto estructurado, útil para equipos de documentación que necesitan actualizar guías rápidamente.
- Automatización de flujos de trabajo de oficina: integrar DARL en sistemas de gestión documental para convertir PDFs escaneados en archivos editables, reduciendo la intervención manual en tareas de entrada de datos.
- Asistentes conversacionales con soporte de imágenes: al ser un modelo image-text-to-text, puede responder preguntas sobre el contenido de un documento subido por el usuario, manteniendo el contexto de la conversación.
- Preprocesamiento para pipelines de RAG (Retrieval-Augmented Generation): transformar documentos no estructurados en Markdown limpio antes de indexarlos en una base vectorial, mejorando la calidad de las recuperaciones en sistemas de pregunta-respuesta.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card menciona que el modelo fue evaluado en los conjuntos OmniDocBench-1.5 y olmOCR-Bench, y que la aceleración de inferencia escala con el tamaño del modelo, alcanzando hasta 2,78× en backbones de 14B. Sin embargo, no se incluyen métricas concretas (como exact match, F1 o CER) ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~3B parámetros en bfloat16, el peso del modelo ocupa aproximadamente 6 GB. Añadiendo la memoria para activaciones y el contexto largo (131.072 tokens), se recomienda al menos 12-16 GB de VRAM para una ejecución cómoda.
- GPU recomendadas: tarjetas con 16 GB o más, como NVIDIA RTX 4090, A100 (40 GB) o H100. Para contextos máximos, se necesitaría mayor capacidad de memoria.
- Compatibilidad con GPUs de consumo: sí, una RTX 3090 o 4090 puede ejecutar el modelo con cuantización (si estuviera disponible) o con contextos reducidos, aunque no se ofrecen pesos cuantizados oficialmente.
- Opciones de despliegue: el modelo se integra con Transformers, por lo que puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). También es posible usar Ollama si se genera un archivo Modelfile, aunque no hay soporte oficial.
- Latencia y throughput: no se proporcionan datos oficiales. La aceleración declarada de 2,3× frente a modelos autoregresivos sugiere un throughput superior, pero depende del hardware y la configuración.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos de parsing de documentos en la información proporcionada. Como referencia, se pueden considerar alternativas generales:

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| DARL (Geong) | ~3B | 131072 | Apache 2.0 | Híbrido difusión-autoregresivo |
| dots.ocr (base) | ~3B (estimado) | 131072 | Apache 2.0 | Autoregresivo puro |
| Qwen-VL | 7B-72B | 32768-131072 | Apache 2.0 (Qwen-VL) | Autoregresivo multimodal |

La comparativa es limitada porque no hay datos de rendimiento publicados para DARL. La principal diferencia es el mecanismo de generación paralela, que reduce la latencia, pero a costa de una mayor complejidad de implementación.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks numéricos, por lo que la afirmación de "precisión comparable" no está respaldada por métricas verificables.
- El repositorio no incluye el preprocesador de imágenes (`preprocessor_config.json`); es necesario cargarlo desde el modelo base `dots-studio/dots.ocr`, lo que añade un paso extra en la integración.
- El modelo requiere `trust_remote_code=True` y código personalizado, lo que implica un riesgo de seguridad si no se audita el código antes de su uso en producción.
- No se especifican los idiomas soportados; es probable que el entrenamiento se haya realizado principalmente con datos en inglés y chino, dado el origen del modelo, pero no hay confirmación.
- No se documentan sesgos específicos, pero al ser un modelo entrenado para OCR, puede tener dificultades con escritura manuscrita, fuentes poco comunes o documentos con degradación severa.
- La licencia Apache 2.0 permite uso comercial, pero el código personalizado y las dependencias (Flash Attention 2.x, Transformers >= 4.51.3) pueden imponer restricciones adicionales en entornos con versiones antiguas.
- La generación paralela de tokens puede producir errores de coherencia en documentos muy estructurados si la verificación incremental no es exhaustiva; se recomienda validar la salida en casos críticos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Geong/DARL
- Modelo base: https://huggingface.co/dots-studio/dots.ocr
- Repositorio de código (referenciado en la model card): https://github.com/your-repo/DARL (enlace genérico, no verificado)
- Paper (ECCV 2026): no se proporciona enlace directo; la cita bibliográfica está en la model card.
- Contacto del autor: wente_young@foxmail.com
