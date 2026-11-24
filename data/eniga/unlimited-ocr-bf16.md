# eniga/unlimited-ocr-bf16

## Resumen

Unlimited-OCR es un modelo de visión-lenguaje especializado en extracción de contenido estructurado a partir de imágenes de documentos, desarrollado originalmente por Baidu. La versión aquí descrita, `eniga/unlimited-ocr-bf16`, es un empaquetado de los pesos originales en precisión bf16 dentro de un contenedor Radiance, un servidor de inferencia orientado a GPUs de AMD. No se trata de un modelo nuevo ni de un ajuste fino, sino de una conversión de formato que preserva los pesos del checkpoint original sin cuantización adicional.

El modelo emplea una arquitectura compuesta por una torre de visión denominada DeepEncoder y un decodificador MoE de 12 capas, lo que lo sitúa en la categoría de modelos multimodal image-text-to-text. Su propósito es el parseo de documentos: dada una imagen de página, devuelve una representación por bloques con tipo, coordenadas delimitadoras y texto asociado, lo que lo hace útil para pipelines de digitalización y extracción de información.

La relevancia de esta ficha radica en su formato de despliegue: el archivo `.rad` de 6,7 GB no es cargable en transformers, vLLM ni llama.cpp, y requiere el servidor Radiance 2.2.0 con el plugin `unlimitedocr_bf16` sobre hardware AMD con ROCm. Esto lo convierte en una opción específica para entornos con GPUs Radeon o Instinct, no para despliegues convencionales en CUDA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Torre de visión DeepEncoder + decodificador MoE de 12 capas |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | 32768 tokens (configurado en el ejemplo de servicio) |
| Tipos de cuantización | bf16 (sin cuantización); KV cache en i8 en la configuración de ejemplo |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Contenedor Radiance (`.rad`, 6,7 GB); no compatible con safetensors, GGUF ni transformers |

## Arquitectura y entrenamiento

La arquitectura combina una torre de visión llamada DeepEncoder con un decodificador de mezcla de expertos de 12 capas. El modelo base es `baidu/Unlimited-OCR`, y esta versión mantiene los pesos en bf16 tal y como los entrega el checkpoint original, sin ninguna cuantización adicional. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación destacable en este empaquetado no está en el modelo en sí, sino en el formato de despliegue: Radiance es un servidor de inferencia para GPUs AMD que carga el contenedor `.rad` mediante un plugin específico. La conversión se realiza con la herramienta `rad-convert` y la receta `unlimited-ocr-bf16.recipe` incluida en la imagen `stilldeadcode/radiance` 2.2.0. La salida del modelo es un parseo de documento con una línea por bloque en el formato `type [x1, y1, x2, y2]text`.

## Capacidades

- Parseo de documentos: extrae bloques con tipo, coordenadas delimitadoras y texto a partir de imágenes de páginas.
- Procesamiento de PDF: la model card indica rasterizar los PDF a una imagen por página antes de la inferencia.
- Procesamiento por lotes: se reporta el funcionamiento con 8 páginas simultáneas.
- Modalidad image-text-to-text: entrada de imagen más instrucción textual, salida estructurada.
- Instrucción de tarea mediante prompt: se envía primero la parte de imagen y después el texto `document parsing.` a temperatura 0.
- Soporte de plantilla de chat personalizada: `unlimited-ocr-parser.jinja`, incluida en el repositorio y procedente de `deploy/` de Radiance.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión general, audio: no disponible (solo se documenta parseo de documentos).

## Casos de uso

- Digitalización de facturas y albaranes: el modelo devuelve bloques con coordenadas y texto, lo que permite mapear campos a un esquema estructurado y alimentar sistemas de contabilidad sin OCR tradicional por regiones.
- Extracción de tablas y formularios en PDF: al rasterizar cada página y enviarla al modelo con la instrucción `document parsing.`, se obtiene una representación por bloques que conserva la posición espacial, útil para reconstruir tablas.
- Procesamiento por lotes de archivos escaneados: con `max-num-seqs: 8` y 8 páginas simultáneas verificadas, encaja en pipelines de digitalización masiva sobre una única GPU Radeon AI PRO R9700.
- Archivado documental con metadatos espaciales: las coordenadas `[x1, y1, x2, y2]` permiten superponer el texto extraído sobre la imagen original para revisión humana o auditoría.
- Despliegue en infraestructura AMD: para organizaciones con GPUs Radeon o Instinct y ROCm que no quieren depender de CUDA, Radiance ofrece un servidor compatible con este contenedor.
- Prototipado de asistentes de lectura de documentos: la ventana de 32768 tokens configurada permite procesar páginas densas o múltiples bloques en una sola petición con temperatura 0 para salidas deterministas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento reportados son operativos: en una Radeon AI PRO R9700 el modelo ocupa 7,5 GiB y parsea una página en 1,8-2,0 s, con 8 páginas procesadas simultáneamente.

## Requisitos de hardware

- VRAM estimada: 7,5 GiB en una Radeon AI PRO R9700 con la configuración de ejemplo (`tp: 1`, `max-num-seqs: 8`, `max-model-len: 32768`, KV cache en i8).
- GPU recomendadas: AMD Radeon AI PRO R9700 (verificada en la model card); otras GPUs AMD con soporte ROCm no están documentadas explícitamente.
- GPU consumer: no hay confirmación de funcionamiento en GPUs de consumo; el requisito es hardware AMD con ROCm y el servidor Radiance.
- Opciones de despliegue: exclusivamente Radiance 2.2.0 con el plugin `unlimitedocr_bf16`. No es cargable en transformers, vLLM ni llama.cpp.
- Latencia y throughput: 1,8-2,0 s por página en Radeon AI PRO R9700; 8 páginas concurrentes verificadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| eniga/unlimited-ocr-bf16 | no disponible (MoE 12 capas) | 32768 | Radiance `.rad` | MIT | Radiance 2.2.0, AMD ROCm |
| baidu/Unlimited-OCR | no disponible (MoE 12 capas) | no disponible | Checkpoint original | MIT | Según model card de Baidu |
| Otros modelos OCR/VLM | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El archivo `.rad` no carga en transformers, vLLM ni llama.cpp; requiere Radiance 2.2.0 y el plugin `unlimitedocr_bf16`.
- Dependencia de hardware AMD con ROCm; no se documenta soporte para GPUs NVIDIA.
- La model card no especifica idiomas soportados, número de parámetros ni composición del entrenamiento, lo que dificulta evaluar su cobertura lingüística.
- Riesgo de alucinación en la extracción de texto no cuantificado: no hay benchmarks publicados que midan precisión de caracteres o de bloques.
- Requiere rasterizar los PDF a una imagen por página antes de la inferencia, lo que añade un paso de preprocesado.
- La salida estructurada depende de la plantilla `unlimited-ocr-parser.jinja`; cambios en la plantilla pueden alterar el formato de salida.
- Licencia MIT, según la model card, con la model card de Baidu aplicable al modelo base; conviene revisar las condiciones del modelo original para uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación comunitaria inexistentes.

## Enlaces

- Hugging Face: https://huggingface.co/eniga/unlimited-ocr-bf16
- Modelo base: https://huggingface.co/baidu/Unlimited-OCR
- Servidor Radiance: https://codeberg.org/StillDeadcode/radiance
- Receta de conversión: `unlimited-ocr-bf16.recipe` (incluida en el repositorio)
- Plantilla de chat: `unlimited-ocr-parser.jinja` (incluida en el repositorio, procedente de `deploy/` de Radiance)
