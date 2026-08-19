# SAIFIINDUSTRIES/North-Micro-Vision-Instruct

## Resumen

North Micro Vision Instruct es un modelo de visión-lenguaje (VLM) de 2.4 mil millones de parámetros, desarrollado por Cohere y publicado bajo licencia Apache 2.0. El repositorio en HuggingFace está alojado bajo la cuenta SAIFIINDUSTRIES, aunque la autoría técnica corresponde a Cohere. Está diseñado como una base compacta para prototipado, fine-tuning específico y aplicaciones multimodales especializadas, con soporte de imágenes en resolución nativa, lo que preserva la proporción de aspecto y el detalle visual fino.

El modelo combina un encoder visual de 400M parámetros entrenado a medida (partiendo de SigLIP 2 SO400M) con un modelo de lenguaje propio de 2B parámetros (North Micro LLM). Soporta entradas intercaladas de texto e imágenes, múltiples imágenes por prompt, y es multilingüe (11 idiomas declarados). Su ventana de contexto del backbone de lenguaje es de 128K tokens, aunque el rango validado para prompts multimodales es de 8K tokens. La relevancia actual radica en su tamaño reducido, su licencia permisiva y su capacidad para ejecutarse en hardware de consumo, lo que lo convierte en una opción atractiva para experimentación y despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model: encoder visual (400M) + proyector + modelo de lenguaje (2B) con atención sliding-window y global |
| Parametros totales | 2.484.847.856 (2,4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K tokens (backbone LM); 8K tokens para entrenamiento multimodal validado |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | en, de, fr, es, it, pt, hi, ja, ko, zh, ar (y más según la documentación) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

North Micro Vision combina un encoder visual de 400M parámetros entrenado específicamente para este modelo, partiendo de SigLIP 2 SO400M, con un modelo de lenguaje propio de 2B parámetros (North Micro LLM). El modelo de lenguaje sigue la arquitectura de Command A+ de Cohere: intercala tres capas de atención con ventana deslizante (sliding-window attention) con embeddings rotatorios posicionales (RoPE), y una capa de atención global sin embeddings posicionales. El encoder visual utiliza RoPE 2D combinado con embeddings posicionales 1D aprendidos para preservar la estructura espacial en entradas de resolución nativa.

El proyector mapea las características visuales al espacio de embeddings del modelo de lenguaje. Siguiendo el enfoque DeepStack, los embeddings de parches de múltiples capas del encoder visual se inyectan en las capas tempranas correspondientes del LLM, lo que permite al modelo acceder a representaciones visuales en distintos niveles de abstracción. No se han proporcionado detalles sobre el dataset de entrenamiento, el número de tokens procesados o si se aplicaron técnicas como RLHF o DPO. El checkpoint se publica en precisión bfloat16.

## Capacidades

- Comprensión de imágenes en resolución nativa, preservando proporción de aspecto y detalles finos.
- Respuesta a preguntas visuales (VQA), generación de descripciones (captioning), grounding de objetos, OCR, interpretación de gráficos y documentos.
- Soporte multilingüe: al menos 11 idiomas declarados (inglés, alemán, francés, español, italiano, portugués, hindi, japonés, coreano, chino, árabe).
- Soporte multi-imagen: los prompts pueden intercalar texto con una o más imágenes.
- Entrada intercalada de texto e imágenes, y salida de texto.
- Compatible con el pipeline `image-text-to-text` de Transformers.
- Soporte opcional de Flash Attention 2 para aceleración en CUDA.

## Casos de uso

- Prototipado rápido de aplicaciones multimodales: gracias a su tamaño compacto (2,4B) y licencia Apache 2.0, es ideal para validar ideas de productos que requieran comprensión de imágenes sin invertir en infraestructura de alto coste.
- Fine-tuning específico para dominios: al ser un modelo abierto y pequeño, puede ajustarse con datasets propios para tareas como inspección visual en manufactura, análisis de documentos o moderación de contenido.
- Asistente de accesibilidad: puede describir imágenes en tiempo real para personas con discapacidad visual, aprovechando su soporte multilingüe y su capacidad de captioning.
- Extracción de información de documentos: con OCR y comprensión de gráficos, puede utilizarse para digitalizar facturas, formularios o informes, extrayendo datos estructurados.
- Chatbot con entrada visual: integrado en un sistema conversacional, permite a los usuarios enviar fotos y hacer preguntas sobre ellas (p. ej., "¿qué contiene esta etiqueta?"), con contexto multilingüe.
- Educación y tutoría: puede responder preguntas sobre diagramas, mapas o ejercicios matemáticos escritos a mano, facilitando el aprendizaje asistido por IA en entornos con recursos limitados.
- Análisis de imágenes médicas básicas (con supervisión humana): aunque no está validado para diagnóstico, puede ayudar a describir radiografías o ecografías en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card se interrumpe antes de la sección de evaluaciones, por lo que no se dispone de datos de MMLU, HumanEval, GSM8K u otras métricas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16, el modelo ocupa aproximadamente 5 GB (2,48B parámetros × 2 bytes). Con cuantización a 8 bits o 4 bits, el uso de VRAM podría reducirse a ~2,5 GB o ~1,3 GB respectivamente, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: una GPU con al menos 8 GB de VRAM (p. ej., RTX 3060, RTX 4060) es suficiente para inferencia en bfloat16. Para cuantización, GPUs con 4-6 GB podrían ser viables.
- Compatibilidad con hardware de consumo: sí, cabe en GPUs consumer de gama media y alta.
- Opciones de despliegue: al ser compatible con Transformers, puede servirse con vLLM, TGI o llama.cpp (si se convierten los pesos a GGUF). También es posible usar Ollama si se crea un Modelfile.
- Latencia y throughput: no se han publicado datos específicos. Como referencia, un modelo de 2,4B en una RTX 4090 podría generar decenas de tokens por segundo, pero depende de la implementación y la longitud de la secuencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multilingüe | Resolución nativa |
|---|---|---|---|---|---|
| North Micro Vision Instruct | 2,4B | 128K (LM) / 8K (multimodal) | Apache 2.0 | Sí (11+ idiomas) | Sí |
| Qwen2-VL-2B | 2,2B | 32K | Apache 2.0 | Sí | Sí |
| LLaVA 1.5 7B | 7B | 2K | Apache 2.0 | No (principalmente inglés) | No (resolución fija) |
| Phi-3-vision | 4,2B | 128K | MIT | No (principalmente inglés) | No (resolución fija) |

Nota: los datos de Qwen2-VL-2B, LLaVA 1.5 y Phi-3-vision son de conocimiento general y pueden variar según la versión. No se dispone de comparativas de rendimiento porque North Micro Vision no publica benchmarks en la información proporcionada.

## Limitaciones y advertencias

- El contexto multimodal validado es de 8K tokens; contextos más largos pueden depender de extrapolación y no han sido evaluados, lo que puede degradar la calidad de las respuestas.
- No se han publicado resultados de benchmarks, por lo que el rendimiento real en tareas estándar es desconocido.
- No se dispone de información sobre sesgos o alucinaciones específicas del modelo; como todo VLM, puede generar descripciones inexactas o inventar detalles en imágenes ambiguas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no incluye garantías de seguridad o robustez para aplicaciones críticas.
- Requiere Transformers 5.16.0, que aún no está disponible en PyPI; es necesario instalar desde fuente, lo que puede complicar el despliegue en entornos con dependencias fijas.
- El repositorio en HuggingFace pertenece a SAIFIINDUSTRIES, no a CohereLabs; se recomienda verificar la procedencia de los pesos antes de usarlos en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SAIFIINDUSTRIES/North-Micro-Vision-Instruct
- Blog técnico de Cohere (mencionado en la model card): https://huggingface.co/blog/CohereLabs/meet-north-micro-vision-instruct
- Modelo base del encoder visual: https://huggingface.co/google/siglip2-so400m-patch16-384
