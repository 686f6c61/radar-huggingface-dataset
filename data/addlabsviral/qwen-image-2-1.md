# addlabsviral/qwen-image-2-1

## Resumen

Qwen-Image-2.1 es un modelo unificado de generación de imágenes a partir de texto y de edición de imágenes, desarrollado por el equipo Qwen (Alibaba). Su componente de generación visual cuenta con 7B parámetros distribuidos en 32 capas DiT (Diffusion Transformer) de flujo único, y el repositorio analizado, `addlabsviral/qwen-image-2-1`, es un espejo no oficial publicado por un tercero que contabiliza 7.115.124.736 parámetros en safetensors y ocupa 33,1 GB.

La propuesta diferencial del modelo es la transparencia nativa: genera imágenes RGBA con canal alfa directamente desde el prompt, sin postprocesado de recorte, además de permitir la edición de capas transparentes y la extracción de sujetos a partir de fotografías. Todo ello dentro de un mismo modelo, junto con edición guiada por instrucciones en lenguaje natural.

En edición admite hasta 10 imágenes de referencia, ediciones locales delimitadas mediante círculos, anotaciones pintadas o máscaras independientes, y preservación de identidad en personas y productos. Se distribuye a través de la librería diffusers con el pipeline `QwenImage21Pipeline` y bajo la licencia Qwen Research, lo que condiciona su uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) de flujo único, 32 capas Single-Stream; atención de granularidad mixta y reutilización de caché KV de prefijo |
| Parametros totales | 7.115.124.736 (contabilizados en los safetensors del repositorio); la model card indica 7B en el componente de generación visual |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. Los ejemplos oficiales usan `torch.bfloat16`; no se documentan GGUF, FP8 ni cuantizaciones de menor precisión |
| Idiomas soportados | No disponible. La model card no documenta idiomas y todos los ejemplos de prompt están en inglés |
| Licencia | Qwen Research License Agreement (`license_name: qwen-research`, `license: other`) |
| Formato de pesos | safetensors para diffusers; repositorio de 33,1 GB |
| Pipeline | text-to-image (`QwenImage21Pipeline`) |
| Resoluciones soportadas | 1:1 (2048x2048), 4:3 (2400x1792), 3:4 (1792x2400), 3:2 (2528x1696), 2:3 (1696x2528), 16:9 (2752x1536), 9:16 (1536x2752) |
| Pasos de inferencia de referencia | 40 |

## Arquitectura y entrenamiento

El componente de generación es un Diffusion Transformer de flujo único con 32 capas Single-Stream, 7B parámetros y dos innovaciones de eficiencia declaradas por el autor: atención de granularidad mixta y reutilización de caché KV de prefijo. Esta combinación busca mantener la calidad de imagen reduciendo el coste computacional por paso de difusión. El modelo se integra en diffusers mediante la clase `QwenImage21Pipeline`, con soporte de `enable_model_cpu_offload()` para descargar componentes a CPU y reducir el pico de memoria en GPU.

No se ha facilitado información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni el proceso de alineación. Tampoco se detallan en la información disponible el codificador de texto ni el VAE empleados, aunque el tamaño del repositorio (33,1 GB frente a los aproximadamente 14,2 GB que ocuparían 7,115B parámetros en bfloat16) sugiere que incluye componentes adicionales además del DiT.

## Capacidades

- Generación de imágenes a partir de texto en siete relaciones de aspecto, con resolución nativa de hasta 2048x2048 y 2752x1536 en formato panorámico.
- Generación nativa de imágenes transparentes en RGBA con canal alfa, sin necesidad de recorte posterior. El formato de prompt recomendado es explícito: "This is an RGBA image with transparency...".
- Edición de imágenes guiada por instrucciones en lenguaje natural sobre una imagen de entrada.
- Edición localizada mediante círculos, anotaciones pintadas o máscaras separadas.
- Edición de capas transparentes ya generadas.
- Extracción de sujetos a partir de fotografías.
- Uso de hasta 10 imágenes de referencia en una misma operación de edición o composición.
- Preservación de identidad en personas y productos durante la edición.
- Renderizado de tipografía y texto integrado en la imagen, con mejoras declaradas en iluminación de retratos y detalle fino.
- No se documenta soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, audio ni visión comprensiva: es un modelo generativo de imagen, no un modelo de lenguaje multimodal.

## Casos de uso

- Generación de assets con transparencia para e-commerce y diseño: el modelo produce PNG con canal alfa de forma nativa, por lo que se pueden crear stickers, logotipos o recortes de producto sin pasar por segmentación ni por herramientas de edición externas.
- Edición de fotografía de producto con preservación de identidad: usando hasta 10 imágenes de referencia, un catálogo puede mantener el aspecto exacto del artículo mientras cambia fondo, iluminación o contexto.
- Composición de escenas con múltiples referencias: la model card muestra una fotografía de grupo generada a partir de seis retratos de referencia, un caso aplicable a material promocional o simulaciones de equipo.
- Retoque localizado en producción gráfica: las máscaras, los círculos y las anotaciones pintadas permiten modificar una región concreta de una imagen existente sin regenerar el resto del encuadre.
- Extracción de sujetos para catálogos y bancos de imágenes: el modelo separa el sujeto de la fotografía original, lo que simplifica la creación de librerías de recortes reutilizables.
- Creación de material de marketing con texto integrado: el renderizado de tipografía permite generar carteles, banners y rótulos legibles directamente en la imagen, en resoluciones de hasta 2752x1536.
- Prototipado rápido de interfaces y creatividades: las siete relaciones de aspecto predefinidas cubren formatos cuadrados, verticales y panorámicos habituales en web, redes sociales y presentaciones.
- Procesamiento por lotes en GPUs de 24 GB: combinando `enable_model_cpu_offload()` con bfloat16, el pipeline puede ejecutarse en hardware de gama alta de consumo para generación por lotes no interactiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los 7.115.124.736 parámetros del DiT ocupan aproximadamente 14,2 GB en bfloat16; sumando el resto de componentes del pipeline (codificador de texto y VAE, no detallados) el requisito real es superior. El repositorio completo ocupa 33,1 GB en disco.
- GPU recomendadas: A100 (40 o 80 GB) y H100 para inferencia a resolución completa sin offload; RTX 4090 y tarjetas de 24 GB para ejecución con descarga de componentes a CPU.
- Cabe en GPU de consumo: sí, en una RTX 4090 de 24 GB, según el propio código de la model card, que ofrece `enable_model_cpu_offload()` como ruta de optimización de memoria.
- Opciones de despliegue: diffusers con `QwenImage21Pipeline` (requiere `transformers>=5.17`, `torch>=2.4.0`, `accelerate` y `pillow`). No se documentan vLLM, llama.cpp, Ollama, TGI ni nodos de ComfyUI para este modelo.
- Latencia y throughput estimados: no disponibles. La configuración de referencia es de 40 pasos de inferencia a 2048x2048, lo que implica un coste elevado por imagen.

## Comparativa con modelos similares

| Modelo | Parametros | Licencia | Disponibilidad | Datos comparativos |
|---|---|---|---|---|
| `addlabsviral/qwen-image-2-1` (este repositorio) | 7.115.124.736 en safetensors | Qwen Research | Espejo de terceros, 0 descargas y 0 likes | No disponible |
| `Qwen/Qwen-Image-2.1` (repositorio oficial) | 7B en el componente de generación visual | Qwen Research | Repositorio oficial, con blog, demo y GitHub propios | No disponible |
| Otros modelos de generación y edición de imagen de escala similar | No disponible | No disponible | No disponible | No disponible |

No se han encontrado en la información proporcionada resultados de benchmarks ni comparativas verificables frente a alternativas de la misma categoría, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- El repositorio analizado es un espejo no oficial publicado por un tercero (`addlabsviral`), con 0 descargas y 0 likes en el momento de la consulta. Para producción conviene usar el repositorio oficial `Qwen/Qwen-Image-2.1` y verificar la integridad de los pesos.
- La licencia es la Qwen Research License Agreement. Por su denominación y por la práctica habitual de Qwen con este tipo de licencia, el uso comercial queda restringido; es imprescindible revisar el archivo LICENSE del repositorio antes de cualquier despliegue comercial.
- Riesgo de alucinación visual inherente a los modelos de difusión: artefactos en manos, anatomías, tipografía mal formada o detalles incoherentes, especialmente con prompts ambiguos o muy cargados.
- La model card no documenta los idiomas soportados ni el rendimiento del codificador de texto fuera del inglés, y todos los ejemplos oficiales usan prompts en inglés.
- No hay información sobre la composición del dataset de entrenamiento, los procesos de filtrado ni los mecanismos de alineación, lo que impide evaluar sesgos demográficos o estéticos y el riesgo de reproducción de contenido protegido.
- No se documentan cuantizaciones de menor precisión (GGUF, FP8, INT8), por lo que no existen vías oficiales para reducir el consumo de memoria más allá del offload a CPU.
- El coste de inferencia es alto: 40 pasos a 2048x2048 por imagen, con relaciones de aspecto que llegan a 2752x1536.
- La fecha de creación reportada por la API (2026-09-21) resulta inconsistente con la información disponible y conviene tratarla con cautela.
- No se dispone de benchmarks públicos verificables en la información proporcionada, lo que dificulta justificar la elección del modelo frente a alternativas.

## Enlaces

- Repositorio analizado en HuggingFace: https://huggingface.co/addlabsviral/qwen-image-2-1
- Repositorio oficial en HuggingFace: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio oficial en ModelScope: https://modelscope.cn/models/Qwen/Qwen-Image-2.1
- Blog del modelo: https://qwen.ai/blog?id=qwen-image-2.1
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/Qwen/Qwen-Image-2.1
- Repositorio de código: https://github.com/QwenLM/Qwen-Image-2.1
- Discord del proyecto: https://discord.gg/BEYSk3pkSu
- Licencia (archivo LICENSE del repositorio oficial): https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE
