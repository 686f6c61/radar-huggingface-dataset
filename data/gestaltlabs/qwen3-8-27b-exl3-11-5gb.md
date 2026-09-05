# GestaltLabs/Qwen3.8-27B-EXL3-11.5GB

## Resumen

GestaltLabs publica una cuantización nativa EXL3 del modelo Qwen/Qwen3.8-27B, un modelo denso de visión y lenguaje desarrollado por Qwen. Esta versión reduce el peso del modelo a aproximadamente 11.5 GB decimales (10.708 GiB) mediante el formato de cuantización EXL3 de ExLlamaV3, que es una variante simplificada de QTIP de Cornell RelaxML. El modelo base original es un vision-language model que entiende imágenes y vídeos, con control flexible de pensamiento y capacidad para tareas complejas de varios pasos.

La relevancia de esta publicación radica en que ofrece un paquete completo y autónomo de un modelo multimodal de 27B en un tamaño reducido, incluyendo componentes nativos de multi-token prediction (MTP) y visión. GestaltLabs no es el autor de EXL3 ni del modelo base, sino que ha realizado la recuperación, selección y publicación del checkpoint cuantizado. El resultado es una opción práctica para desarrollar aplicaciones multimodales locales con el runtime ExLlamaV3, aunque su uso está restringido a ese entorno específico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso vision-language (modelo base Qwen/Qwen3.8-27B) |
| Parámetros totales | 27B según la denominación del modelo base; 6.372.070.784 elementos en los safetensors EXL3 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | EXL3 (nativo) con 2.866379 bits por peso, cabeza de salida a 4 bits y embeddings de token en F8_E4M3 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (contenen códigos EXL3; no son pesos densos) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de visión y lenguaje que procesa imágenes, vídeos y texto. Incluye componentes de visión nativos (987 tensores bajo `model.visual.*`) y un módulo de predicción multi-token (MTP) con 39 tensores `mtp.*`. La cuantización EXL3 publicada por GestaltLabs conserva estos elementos en el formato de códigos propio de ExLlamaV3, que es una variante de QTIP desarrollada por Cornell RelaxML. El runtime requerido es ExLlamaV3 1.4.6.

No se proporcionan datos sobre el entrenamiento del modelo base: no hay información sobre el número de tokens, la composición del dataset ni procesos de RLHF o DPO. La contribución de GestaltLabs se limita a la recuperación y selección del checkpoint, la adaptación de un draft opcional y la publicación. La integridad del proceso está documentada en un informe que registra la preservación de los 3.080 nombres de tensores, con 1.026 tensores de visión y MTP idénticos al paquete mixto original en el momento de la selección.

## Capacidades

- Comprensión multimodal: procesa imágenes y vídeos gracias a sus componentes de visión nativos.
- Control flexible de pensamiento: el modelo base incluye modos de pensamiento activables o desactivables según la tarea.
- Decodificación especulativa: incorpora MTP nativo, con un perfil recomendado de hasta 7 tokens de borrador, longitud adaptativa y umbral de confianza 0.4.
- Draft opcional DFlash: se puede acoplar un modelo de 1.73B de parámetros (DFlash1) como borrador externo para acelerar la generación.
- Inferencia de imagen única: el repositorio incluye un script de visión (`vision.py`) para procesar imágenes de forma nativa.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- Capacidades multilingües no documentadas.

## Casos de uso

- Análisis de capturas de pantalla en soporte técnico: el usuario envía una imagen con un error o interfaz inesperada, y el modelo genera instrucciones de resolución paso a paso. Es adecuado porque combina comprensión visual con generación de texto en un único modelo local.
- Resumen de contenido de vídeo: se extraen fotogramas de un clip y se alimentan al modelo para obtener un resumen de lo ocurrido. La integración de visión en el propio modelo evita el uso de pipelines separadas.
- Extracción de información de documentos escaneados: el modelo puede leer formularios, facturas o recibos a partir de imágenes y devolver campos estructurados en texto. La ventana multimodal permite interpretar el contexto visual del documento.
- Asistente multimodal en tiempo real: gracias al MTP nativo y al draft DFlash opcional, se puede reducir la latencia de generación en aplicaciones interactivas de chat o consulta sobre imágenes.
- Prototipado de visión por computador en local: el paquete permite ejecutar un modelo de 27B en una estación de trabajo con GPU de gama alta, sin depender de APIs en la nube. Es útil para experimentar con casos de uso que requieren privacidad de datos.
- Investigación sobre cuantización multimodal: el repositorio incluye evidencias de integridad de tensores y scripts de benchmark, lo que permite estudiar el impacto de EXL3 en la preservación de componentes de visión y MTP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del paquete es 11.5 GB decimales (10.708 GiB), pero la model card advierte explícitamente que esto no es un requisito de VRAM ni una garantía de que funcione en una GPU de 11.5 o 12 GB.
- GPU recomendada: el entorno de medición fue una NVIDIA RTX PRO 6000 Blackwell Server Edition con 96 GB de VRAM.
- No se garantiza el funcionamiento en GPUs de consumo. Se requiere una GPU NVIDIA compatible con CUDA y con soporte para ExLlamaV3.
- Opciones de despliegue: ExLlamaV3 1.4.6 (runtime nativo). El repositorio incluye `inference.py` (inferencia de texto), `vision.py` (inferencia de imagen) y `benchmark_native_spec.py`. No es compatible con Transformers, vLLM, SGLang ni llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparativas con otros modelos de la misma categoría. El modelo base sin cuantizar (Qwen/Qwen3.8-27B) sería la referencia natural, pero no se aportan métricas ni datos de rendimiento en esta documentación.

## Limitaciones y advertencias

- El formato EXL3 no es un peso denso: los safetensors contienen códigos EXL3 y solo pueden cargarse con ExLlamaV3 1.4.6. No son compatibles con `Transformers.from_pretrained`, vLLM, SGLang ni llama.cpp.
- No se debe usar con LoRA, adaptadores de inferencia ni marcos de entrenamiento. La model card indica explícitamente que no se necesita ninguno de ellos.
- El tamaño del repositorio (11.5 GB) no es una garantía de que el modelo quepa en una GPU de 12 GB. La medición se realizó en una RTX PRO 6000 Blackwell de 96 GB, por lo que el rendimiento en otros entornos puede variar.
- La preservación de los tensores de visión y MTP no implica que los pesos de visión sean idénticos a los pesos BF16 originales de upstream, tal y como aclara la model card.
- No se documentan sesgos conocidos, riesgo de alucinación ni limitaciones de idioma. La ausencia de benchmarks publicados impide evaluar la calidad del modelo frente a alternativas.
- La licencia Apache-2.0 permite uso comercial, pero las dependencias (ExLlamaV3, PyTorch, etc.) mantienen sus propias licencias, que deben revisarse antes de un despliegue en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GestaltLabs/Qwen3.8-27B-EXL3-11.5GB
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Draft DFlash opcional: https://huggingface.co/GestaltLabs/Qwen3.8-27B-DFlash-EXL3-4bit
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- ExLlamaV3 releases: https://github.com/turboderp-org/exllamav3/releases
- QTIP (Cornell RelaxML): https://github.com/Cornell-RelaxML/qtip
- DFlash: https://github.com/z-lab/dflash
