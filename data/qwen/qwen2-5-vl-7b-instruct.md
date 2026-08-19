# Qwen/Qwen2.5-VL-7B-Instruct

## Resumen

Qwen2.5-VL-7B-Instruct es un modelo de visión-lenguaje (VLM) desarrollado por el equipo Qwen de Alibaba, perteneciente a la familia Qwen2.5-VL que incluye versiones de 3, 7 y 72 mil millones de parámetros. Este repositorio contiene la variante de 7B afinada con instrucciones, que en realidad cuenta con 8.292.166.656 parámetros (8,29B) según los pesos safetensors. El modelo está diseñado para tareas multimodales que combinan imagen, vídeo y texto, y destaca por su capacidad de actuar como agente visual, comprender vídeos de más de una hora y generar salidas estructuradas a partir de documentos escaneados.

La relevancia actual de este modelo radica en su versatilidad: no solo reconoce objetos y texto en imágenes, sino que puede localizar elementos mediante bounding boxes o puntos, seguir instrucciones para controlar interfaces de usuario (computer use y phone use) y procesar vídeos largos con localización temporal de eventos. Su arquitectura incorpora mejoras sobre Qwen2-VL, como resolución dinámica extendida al dominio temporal, un encoder visual optimizado con atención de ventana y normalización SwiGLU/RMSNorm, y una actualización de mRoPE para alinear tiempo absoluto. El modelo se distribuye bajo licencia Apache 2.0 y está disponible en Hugging Face con más de 9,3 millones de descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (encoder ViT + LLM Qwen2.5) |
| Parametros totales | 8.292.166.656 (8,29B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (soporta vídeos de más de 1 hora según la model card) |
| Tipos de cuantizacion | No disponible (pesos originales en safetensors; cuantizaciones de la comunidad no documentadas) |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen2.5-VL-7B-Instruct sigue una arquitectura de transformer multimodal compuesta por un encoder visual (ViT) y un modelo de lenguaje Qwen2.5. El encoder visual ha sido optimizado con atención de ventana (window attention) para acelerar el entrenamiento y la inferencia, y utiliza SwiGLU y RMSNorm, alineándose con la estructura del LLM subyacente. Una innovación clave es la extensión de la resolución dinámica al dominio temporal mediante muestreo de FPS dinámico, lo que permite al modelo procesar vídeos a diferentes velocidades de muestreo. Además, se actualiza mRoPE en la dimensión temporal con identificadores y alineación de tiempo absoluto, lo que permite al modelo aprender secuencias temporales y velocidades, y localizar momentos concretos en vídeos.

No se han publicado en la model card detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. La información disponible indica que es una evolución de Qwen2-VL, con mejoras orientadas a la comprensión visual de objetos, textos, gráficos y layouts, así como a capacidades de agente y procesamiento de vídeo largo.

## Capacidades

- Comprensión visual de imágenes: reconoce objetos comunes (flores, aves, peces, insectos) y analiza textos, gráficos, iconos, diagramas y diseños dentro de imágenes.
- Localización visual: genera bounding boxes o puntos para localizar objetos con precisión, y produce salidas JSON estables con coordenadas y atributos.
- Comprensión de vídeo: procesa vídeos de más de una hora, captura eventos y localiza segmentos relevantes mediante la alineación temporal.
- Agente visual: actúa como agente que razona y dirige herramientas, con capacidad de uso de ordenador (computer use) y de teléfono (phone use).
- Salidas estructuradas: extrae contenido de facturas, formularios, tablas y otros documentos escaneados, generando salidas estructuradas útiles para finanzas y comercio.
- Generación de texto a partir de imágenes y vídeo: responde a preguntas, describe contenido y mantiene conversaciones multimodales.
- Soporte de tool calling: integrable en flujos de agente para ejecutar acciones sobre interfaces gráficas.
- Capacidades multilingües: aunque la model card declara inglés como idioma, la familia Qwen2.5-VL es conocida por soportar múltiples idiomas en la práctica, aunque no se especifica en la documentación oficial.

## Casos de uso

- Atención al cliente automatizada: el modelo puede analizar capturas de pantalla, facturas o formularios enviados por usuarios y extraer la información relevante para resolver incidencias, gracias a su capacidad de salida estructurada y comprensión de documentos.
- Automatización de procesos con interfaz gráfica: como agente visual, puede controlar aplicaciones de escritorio o móviles, ejecutando tareas como rellenar formularios, navegar por menús o extraer datos de aplicaciones, lo que resulta útil para pruebas de software o RPA.
- Análisis de vídeo de vigilancia: procesa vídeos largos y localiza eventos específicos (por ejemplo, la aparición de una persona o un vehículo), generando resúmenes temporales con marcas de tiempo.
- Extracción de datos de documentos: convierte facturas, recibos y tablas escaneadas en JSON estructurado, facilitando su integración en sistemas de contabilidad o ERP.
- Asistente de accesibilidad: describe imágenes y vídeos para personas con discapacidad visual, proporcionando descripciones detalladas de objetos, escenas y texto.
- Generación de contenido para e-commerce: analiza imágenes de productos y genera descripciones textuales optimizadas para SEO, incluyendo atributos y características visibles.
- Moderación de contenido visual: identifica objetos o texto en imágenes y vídeos para filtrar contenido inapropiado o verificar el cumplimiento de políticas.

## Benchmarks y rendimiento

La model card proporciona resultados de benchmarks para imagen, vídeo y tareas de agente. A continuación se presentan los datos disponibles.

### Benchmarks de imagen

| Benchmark | InternVL2.5-8B | MiniCPM-o 2.6 | GPT-4o-mini | Qwen2-VL-7B | Qwen2.5-VL-7B |
|---|---|---|---|---|---|
| MMMU (val) | 56 | 50.4 | 60 | 54.1 | 58.6 |
| MMMU-Pro (val) | 34.3 | - | 37.6 | 30.5 | 41.0 |
| DocVQA (test) | 93 | 93 | - | 94.5 | 95.7 |
| InfoVQA (test) | 77.6 | - | - | 76.5 | 82.6 |
| ChartQA (test) | 84.8 | - | - | 83.0 | 87.3 |
| TextVQA (val) | 79.1 | 80.1 | - | 84.3 | 84.9 |
| OCRBench | 822 | 852 | 785 | 845 | 864 |
| CC_OCR | 57.7 | - | - | 61.6 | 77.8 |
| MMStar | 62.8 | - | - | 60.7 | 63.9 |
| MMBench-V1.1-En (test) | 79.4 | 78.0 | 76.0 | 80.7 | 82.6 |
| MMT-Bench (test) | - | - | - | 63.7 | 63.6 |
| MMVet (GPT-4-Turbo) | 54.2 | 60.0 | 66.9 | 62.0 | 67.1 |
| HallBench (avg) | 45.2 | 48.1 | 46.1 | 50.6 | 52.9 |
| MathVista (testmini) | 58.3 | 60.6 | 52.4 | 58.2 | 68.2 |
| MathVision | - | - | - | 16.3 | 25.07 |

### Benchmarks de vídeo

| Benchmark | Qwen2-VL-7B | Qwen2.5-VL-7B |
|---|---|---|
| MVBench | 67.0 | 69.6 |
| PerceptionTest (test) | 66.9 | 70.5 |
| Video-MME (wo/w subs) | 63.3/69.0 | 65.1/71.6 |
| LVBench | - | 45.3 |
| LongVideoBench | - | 54.7 |
| MMBench-Video | 1.44 | 1.79 |
| TempCompass | - | 71.7 |
| MLVU | - | 70.2 |
| CharadesSTA/mIoU | - | 43.6 |

### Benchmarks de agente

| Benchmark | Qwen2.5-VL-7B |
|---|---|
| ScreenSpot | 84.7 |
| ScreenSpot Pro | 29.0 |
| AITZ_EM | 81.9 |
| Android Control High_EM | 60.1 |
| Android Control Low_EM | 93.7 |
| AndroidWorld_SR | 25.5 |
| MobileMiniWob++_SR | 91.4 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB en FP16 (2 bytes por parámetro) y alrededor de 5 GB en cuantización de 4 bits (estimación basada en el tamaño de parámetros; no hay datos oficiales).
- GPU recomendadas: tarjetas con al menos 16 GB de VRAM para FP16, como RTX 3090, RTX 4090, A100 o H100. Para cuantizaciones más bajas, una RTX 3060 de 12 GB podría ser suficiente.
- Compatibilidad con GPU de consumo: sí, especialmente con cuantización (por ejemplo, GGUF) en GPUs de 8-12 GB, aunque no se documentan oficialmente.
- Opciones de despliegue: compatible con la librería transformers de Hugging Face (se recomienda instalar desde fuente para evitar el error `KeyError: 'qwen2_5_vl'`). También es compatible con text-generation-inference (TGI) según las etiquetas del repositorio. Se puede usar con vLLM u Ollama mediante conversión de pesos, aunque no está documentado oficialmente.
- Latencia y throughput: no disponibles en la documentación oficial.

## Comparativa con modelos similares

La siguiente tabla compara Qwen2.5-VL-7B con otros VLM de tamaño similar o con los que compite directamente, basándose en los datos de benchmarks de la model card.

| Modelo | Parámetros | Contexto | Licencia | MMMU (val) | DocVQA (test) | ChartQA (test) | Video-MME (wo subs) |
|---|---|---|---|---|---|---|---|
| Qwen2.5-VL-7B | 8,29B | No disponible | Apache 2.0 | 58.6 | 95.7 | 87.3 | 65.1 |
| Qwen2-VL-7B | ~7B | No disponible | Apache 2.0 | 54.1 | 94.5 | 83.0 | 63.3 |
| InternVL2.5-8B | 8B | No disponible | MIT | 56 | 93 | 84.8 | - |
| MiniCPM-o 2.6 | ~8B | No disponible | Apache 2.0 | 50.4 | 93 | - | - |
| GPT-4o-mini | No disponible | No disponible | Propietaria | 60 | - | - | - |

Qwen2.5-VL-7B supera a sus predecesores y a alternativas de código abierto en la mayoría de los benchmarks de imagen y vídeo, aunque GPT-4o-mini (propietario) obtiene un mejor resultado en MMMU. La licencia Apache 2.0 permite uso comercial sin restricciones, a diferencia de GPT-4o-mini.

## Limitaciones y advertencias

- No se han documentado limitaciones específicas en la model card oficial. Sin embargo, como todo VLM, puede presentar alucinaciones visuales, es decir, generar descripciones de objetos o eventos que no están presentes en la imagen o vídeo.
- El modelo puede tener sesgos derivados de los datos de entrenamiento, aunque no se detallan en la documentación.
- La comprensión de vídeo de más de una hora puede requerir una gestión cuidadosa de la memoria y el contexto, aunque no se especifican los límites exactos.
- La model card declara inglés como idioma principal; el rendimiento en otros idiomas no está garantizado ni documentado.
- Para usar el modelo con transformers, es necesario instalar la versión más reciente desde el repositorio de Hugging Face, ya que la versión estable puede no incluir la arquitectura `qwen2_5_vl`.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos completos para aplicaciones de alto riesgo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Blog oficial de Qwen2.5-VL: https://qwenlm.github.io/blog/qwen2.5-vl/
- Repositorio GitHub: https://github.com/QwenLM/Qwen2.5-VL
- Documentación de Qwen2-VL (referencia previa): https://arxiv.org/abs/2409.12191
- Artículo de Qwen-VL (base): https://arxiv.org/abs/2308.12966
- Artículo de Qwen2 (LLM subyacente): https://arxiv.org/abs/2309.00071
