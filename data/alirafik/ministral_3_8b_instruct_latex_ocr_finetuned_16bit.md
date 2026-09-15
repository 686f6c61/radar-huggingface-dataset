# aliRafik/Ministral_3_8B_Instruct_LaTeX_OCR_finetuned_16bit

## Resumen
El modelo `aliRafik/Ministral_3_8B_Instruct_LaTeX_OCR_finetuned_16bit` es un ajuste fino (fine-tuning) del modelo base `unsloth/Ministral-3-8B-Instruct-2512`, perteneciente a la familia Mistral 3. Desarrollado por aliRafik, el modelo está diseñado para tareas de imagen a texto (image-text-to-text) con especialización en OCR de LaTeX, es decir, la transcripción de imágenes de fórmulas o documentos matemáticos a código LaTeX. El proceso de entrenamiento se realizó con las librerías Unsloth y TRL de HuggingFace, lo que según el autor permitió una aceleración del 2x en el entrenamiento.

El modelo cuenta con 8.918.026.240 parámetros (aproximadamente 8.92B) y se distribuye con pesos en formato safetensors de 16-bit, con un tamaño de repositorio de 17.9 GB. La licencia es Apache 2.0 y el idioma declarado es inglés. No se han publicado detalles sobre la longitud de contexto ni sobre el dataset de entrenamiento en la información disponible.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Mistral 3) |
| Parametros totales | 8.918.026.240 (8.92B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 16-bit (según el nombre del repositorio) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo se basa en la arquitectura Mistral 3, un modelo multimodal de la familia Mistral que procesa entradas de imagen y texto para generar salidas de texto. El punto de partida es el modelo instruct `unsloth/Ministral-3-8B-Instruct-2512`, sobre el que se ha realizado un ajuste fino para la tarea de OCR de LaTeX. El entrenamiento se llevó a cabo con Unsloth y la librería TRL de HuggingFace; el autor indica que esto permitió entrenar el modelo 2 veces más rápido. No se proporcionan detalles sobre la composición del dataset, el número de tokens de entrenamiento ni la técnica de alineación (RLHF/DPO).

## Capacidades
- Procesamiento multimodal de imágenes y texto (pipeline image-text-to-text).
- OCR especializado en LaTeX: el modelo está afinado para transcribir imágenes de notación matemática, fórmulas y documentos LaTeX a código LaTeX.
- Generación de texto instructivo en inglés (idioma declarado en la metadata).
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso o modo de pensamiento.

## Casos de uso
- Digitalización de documentos matemáticos: el modelo puede convertir capturas de pantalla o fotos de fórmulas en código LaTeX editable, facilitando la digitalización de apuntes y libros de texto.
- Transcripción de exámenes y ejercicios impresos: permite convertir imágenes de exámenes de matemáticas o física a LaTeX para su reutilización en sistemas de gestión de contenidos educativos.
- Extracción de ecuaciones de artículos científicos: en un pipeline de procesamiento de documentos, el modelo puede identificar y transcribir las ecuaciones de PDFs escaneados a LaTeX.
- Accesibilidad educativa: al convertir imágenes de contenido matemático a texto LaTeX, se puede integrar con lectores de pantalla para estudiantes con discapacidad visual.
- Automatización de apuntes en formato LaTeX: los estudiantes pueden fotografiar pizarras o cuadernos y obtener el código LaTeX correspondiente para sus apuntes.
- Integración en herramientas de autoría de contenido: el modelo puede servir como componente OCR en editores de LaTeX o plataformas de generación de material didáctico.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: con pesos en 16-bit, se requieren aproximadamente 18 GB de VRAM (8.92B parámetros × 2 bytes + overhead). Para cuantizaciones de 8-bit o 4-bit (si se generan), la VRAM necesaria sería de ~9 GB o ~5 GB respectivamente.
- GPU recomendadas: A100 40GB/80GB, H100 80GB o RTX 4090 (24GB) para 16-bit. Con cuantización 4-bit, se podría ejecutar en RTX 3090/4090 o GPUs con 8-12 GB de VRAM.
- ¿Cabe en GPU de consumo? Sí, con cuantización 4-bit en GPUs de 8-12 GB; en 16-bit solo en modelos con 24 GB de VRAM (RTX 4090).
- Opciones de despliegue: Transformers (HuggingFace), Text Generation Inference (TGI) y vLLM (si es compatible con la arquitectura multimodal). También es posible usar llama.cpp tras convertir los pesos a formato GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
No se dispone de información suficiente para realizar una comparativa con modelos similares. El modelo base `unsloth/Ministral-3-8B-Instruct-2512` es la referencia inmediata; este modelo es un ajuste fino especializado en OCR de LaTeX, por lo que su rendimiento en esa tarea puede diferir del modelo base, pero no hay datos publicados que lo confirmen.

## Limitaciones y advertencias
- No se han publicado evaluaciones de sesgos, alucinaciones o seguridad. El modelo puede heredar sesgos del modelo base y del dataset de fine-tuning.
- El modelo está especializado en OCR de LaTeX; su rendimiento en otras tareas (razonamiento, código, conversación general) puede ser inferior al del modelo base.
- Solo se declara soporte para inglés; no se ha verificado el rendimiento en otros idiomas.
- No se conoce la longitud de contexto; documentos muy largos pueden superar el límite y degradar la salida.
- La licencia Apache 2.0 permite uso comercial, pero es necesario revisar la licencia del modelo base y de los datos de entrenamiento si se utiliza en producción.

## Enlaces
- HuggingFace: https://huggingface.co/aliRafik/Ministral_3_8B_Instruct_LaTeX_OCR_finetuned_16bit
- Modelo base: https://huggingface.co/unsloth/Ministral-3-8B-Instruct-2512
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
