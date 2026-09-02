# Hatim2221/Mubsir1.1-2B-VL

## Resumen

Mubsir1.1-2B-VL es un modelo de visión y lenguaje (image-text-to-text) publicado en Hugging Face por el usuario Hatim2221. Está basado en la arquitectura Qwen2-VL, como indican las etiquetas del repositorio, y cuenta con aproximadamente 2.209 millones de parámetros. El modelo se distribuye en formato safetensors y ocupa 1,6 GB en el repositorio.

La model card oficial está prácticamente vacía: no se especifican datos de entrenamiento, licencia, idiomas soportados, ni evaluación. El autor ha publicado otros modelos similares en su perfil, como Mubsir-Qwen-2B-VL y Mubsir-vl-arabic-htr-adapter-v2, lo que sugiere una línea de trabajo orientada a tareas de reconocimiento de texto manuscrito árabe y procesamiento de documentos, aunque no hay confirmación oficial para esta versión concreta.

La relevancia de este modelo radica en su tamaño compacto (2B) y su naturaleza multimodal, lo que podría permitir su despliegue en entornos con recursos limitados. Sin embargo, la ausencia total de documentación técnica y de resultados de evaluación limita seriamente su uso en producción sin una validación previa por parte del desarrollador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2-VL (vision-language transformer) |
| Parametros totales | 2.208.985.600 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo incluye referencias a 4-bit bitsandbytes, pero no se confirma) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia Qwen2-VL, un transformer multimodal que combina un codificador visual con un modelo de lenguaje. El tag `qwen2_vl` en Hugging Face confirma esta base, pero no se dispone de detalles sobre la configuración exacta del codificador visual, el número de capas, ni el tamaño del vocabulario.

No hay información pública sobre el proceso de entrenamiento: ni el número de tokens, ni la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. La model card no menciona ningún procedimiento de ajuste fino ni los datos utilizados. Tampoco se documentan innovaciones técnicas específicas más allá de la arquitectura base de Qwen2-VL.

## Capacidades

- Procesamiento de entradas multimodales: el pipeline `image-text-to-text` indica que el modelo acepta imágenes y texto como entrada y genera texto como salida.
- Generación de texto descriptivo o respuestas basadas en contenido visual, aunque no se especifican tareas concretas.
- Posible soporte de conversación multimodal multi-turno, dado que la arquitectura Qwen2-VL está diseñada para ello, pero no hay confirmación en la documentación.
- No se ha documentado soporte de tool calling, function calling, ni capacidades de agente.
- No se ha documentado soporte de "thinking mode" ni generación de razonamiento explícito.
- No se ha documentado soporte de audio ni vídeo.

## Casos de uso

- Reconocimiento de texto manuscrito en árabe: el autor ha publicado adaptadores específicos para esta tarea (Mubsir-vl-arabic-htr-adapter-v2), por lo que este modelo podría servir como base para sistemas de digitalización de documentos históricos o formularios manuscritos, aunque se requiere verificar su rendimiento real.
- Descripción automática de imágenes: el modelo puede generar texto descriptivo a partir de una imagen, útil para accesibilidad o indexación de contenido visual en aplicaciones ligeras.
- Asistentes conversacionales con entrada visual: integración en chatbots que necesiten interpretar capturas de pantalla, fotografías o diagramas enviados por el usuario, siempre que se valide su calidad.
- Extracción de información de documentos escaneados: combinado con un pipeline de OCR, podría extraer campos estructurados de facturas o formularios, aunque no hay evidencia de su precisión.
- Prototipado rápido de aplicaciones multimodales: al ser un modelo pequeño (2B), permite experimentar con visión por computadora y lenguaje natural en entornos de desarrollo sin grandes recursos de GPU.
- Fine-tuning para tareas específicas: su tamaño reducido facilita el ajuste fino en dominios concretos, como análisis de imágenes médicas o industriales, partiendo de una base Qwen2-VL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K, ni evaluaciones específicas de tareas visuales como VQAv2 o TextVQA. Tampoco se han comparado métricas con otros modelos de la misma familia.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 4,4 GB (2,2 GB de pesos + overhead de activaciones y KV cache), lo que cabe en GPUs de consumo como RTX 3060 12GB, RTX 4060 Ti 16GB o superiores.
- Con cuantización a 4 bits (si se aplica bitsandbytes), la VRAM necesaria podría reducirse a unos 1,5-2 GB, permitiendo ejecución en GPUs con 4-6 GB, como RTX 3050 o incluso en CPU con suficiente RAM.
- GPU recomendadas: RTX 3090, RTX 4090, A10, A100 para mayor comodidad y velocidad, aunque no son imprescindibles.
- Opciones de despliegue: al ser un modelo de transformers estándar, puede servirse con vLLM, TGI, o ejecutarse con llama.cpp si se convierte a GGUF (no se proporciona oficialmente). También es compatible con la librería transformers de Hugging Face.
- Latencia y throughput: no disponibles. Al no haber benchmarks oficiales, no se puede estimar con fiabilidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Mubsir1.1-2B-VL | 2,2B | no disponible | no disponible | Hugging Face |
| Qwen2-VL-2B (base) | 2,2B | 32K (típico) | Apache 2.0 (Qwen2) | Hugging Face |
| PaliGemma-3B | 3B | 128K (típico) | Gemma license | Hugging Face |

La comparativa es limitada porque no se dispone de datos de rendimiento del modelo evaluado. Qwen2-VL-2B es el modelo base del que probablemente deriva, y PaliGemma-3B es una alternativa de tamaño similar con licencia permisiva. Sin benchmarks, no es posible determinar cuál ofrece mejor rendimiento en tareas concretas.

## Limitaciones y advertencias

- Documentación inexistente: la model card no proporciona información sobre entrenamiento, datos, licencia ni limitaciones. Esto impide evaluar su idoneidad para uso comercial o académico.
- Licencia desconocida: no se especifica la licencia, lo que genera incertidumbre legal sobre su uso, modificación y redistribución. No debe utilizarse en producción sin aclarar este punto.
- Riesgo de alucinaciones y errores visuales: al ser un modelo pequeño y sin evaluación publicada, es probable que presente errores en tareas complejas de razonamiento visual o generación de texto.
- Sesgos potenciales: al desconocer los datos de entrenamiento, no se pueden identificar sesgos demográficos, culturales o lingüísticos. El autor parece orientado al árabe, pero no hay confirmación.
- Sin garantía de soporte: el modelo fue subido en septiembre de 2026 y no tiene actividad posterior; no hay mantenimiento ni canal de soporte.
- Compatibilidad limitada: solo se ofrece en safetensors; no hay versiones GGUF, ONNX ni TensorRT, lo que dificulta su uso en algunos entornos de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hatim2221/Mubsir1.1-2B-VL
- Modelo relacionado del mismo autor: https://huggingface.co/Hatim2221/Mubsir-Qwen-2B-VL
- Adaptador HTR árabe del mismo autor: https://huggingface.co/Hatim2221/Mubsir-vl-arabic-htr-adapter-v2
- Repositorio de Qwen3-VL (referencia de la familia): https://github.com/QwenLM/Qwen3-VL
