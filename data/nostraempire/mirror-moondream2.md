# NostraEmpire/mirror-moondream2

## Resumen

Moondream 2 es un modelo de visión-lenguaje (VLM) compacto y eficiente, desarrollado originalmente por Vikhyat y distribuido en este repositorio como un espejo por NostraEmpire. Con aproximadamente 1.930 millones de parámetros, está diseñado para ejecutarse en dispositivos con recursos limitados, como edge devices, manteniendo capacidades de comprensión de imágenes, generación de descripciones, respuesta a preguntas visuales, detección de objetos y OCR. Su relevancia radica en su tamaño reducido y su rendimiento competitivo en tareas de visión-lenguaje, lo que lo hace adecuado para aplicaciones en tiempo real y despliegues locales. La versión reflejada corresponde a la release 2025-06-21, que incorpora mejoras como razonamiento fundamentado (grounded reasoning), detección de objetos más precisa y generación de texto más rápida mediante un tokenizador "superword".

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas. Aunque el repositorio es un espejo, el contenido es idéntico al modelo original alojado en `vikhyatk/moondream2`. El autor original recomienda especificar una revisión concreta al cargar el modelo en producción, ya que se actualiza con frecuencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (codificador de visión SigLIP + decodificador de lenguaje basado en Phi-1.5) |
| Parametros totales | 1.927.237.104 (~1,93 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificados oficialmente; compatible con cuantizaciones estándar (GGUF, int8, int4) |
| Idiomas soportados | Principalmente inglés (no se especifican otros idiomas oficialmente) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Moondream 2 combina un codificador de visión SigLIP con un decodificador de lenguaje basado en la arquitectura Phi-1.5, según fuentes externas. El modelo es denso, sin mezcla de expertos, y procesa imágenes junto con texto para generar respuestas. El entrenamiento se realizó en múltiples etapas: preentrenamiento en pares imagen-texto, seguido de ajuste fino supervisado y, en las versiones recientes, refuerzo por aprendizaje (RL) aplicado a 55 tareas de visión-lenguaje para reforzar el razonamiento fundamentado y la detección de objetos.

La release 2025-06-21 introduce dos innovaciones técnicas destacables: un tokenizador "superword" que reduce el número de tokens generados (acelerando la generación entre un 20 y un 40 %) mediante una hypernetwork ligera de transferencia de tokenizador, y un modo de razonamiento fundamentado que ancla el razonamiento en posiciones espaciales de la imagen antes de responder. También se aplicó RL de alta calidad sobre anotaciones de bounding boxes para mejorar la detección de objetos finos.

## Capacidades

- Generación de descripciones de imágenes en tres longitudes: corta, normal y larga, con soporte de streaming.
- Respuesta a preguntas visuales (visual querying) sobre el contenido de la imagen.
- Detección de objetos con bounding boxes, incluyendo detección de objetos pequeños y diferenciación de atributos (p. ej., "botella azul" vs. "botella").
- Pointing: localización de puntos específicos en la imagen correspondientes a una entidad mencionada.
- Razonamiento fundamentado (grounded reasoning): modo paso a paso que utiliza posiciones espaciales para responder preguntas complejas, como cálculos sobre gráficos o conteo preciso.
- OCR y transcripción de texto en documentos y tablas, con instrucciones específicas como "Transcribe the text".
- Comprensión de gráficos y tablas (ChartQA, DocVQA).
- Comprensión de interfaces de usuario (UI), con mejora significativa en ScreenSpot (F1@0.5 de 60,3 a 80,4).
- Etiquetado de imágenes de vocabulario abierto (image tagging).
- Conteo de objetos con precisión mejorada (CountBenchQA 86,4).
- Soporte de compilación estilo gpt-fast en la implementación de Hugging Face Transformers.

## Casos de uso

- Accesibilidad para personas con discapacidad visual: el modelo puede generar descripciones detalladas de imágenes en tiempo real, ejecutándose en dispositivos móviles o wearables gracias a su tamaño reducido.
- Automatización de pruebas de interfaz de usuario: con la mejora en ScreenSpot, puede localizar elementos UI en capturas de pantalla, permitiendo tests automatizados de aplicaciones web y móviles.
- Análisis de documentos y facturas: su capacidad de OCR y comprensión de tablas permite extraer datos estructurados de documentos escaneados, integrándose en flujos de procesamiento de documentos.
- Moderación de contenido visual: detección de objetos o texto no deseado en imágenes subidas por usuarios, con despliegue en servidores de bajo coste.
- Asistentes de visión para robótica: el razonamiento fundamentado y la detección de objetos permiten a robots navegar y manipular objetos basándose en instrucciones visuales.
- Etiquetado automático de imágenes para gestión de activos digitales: el image tagging de vocabulario abierto facilita la organización de bibliotecas de imágenes sin intervención manual.
- Sistemas de respuesta a preguntas sobre imágenes en atención al cliente: el modelo puede responder consultas sobre productos fotografiados, como "¿cuántas piezas incluye?" o "¿qué color es?", con baja latencia.

## Benchmarks y rendimiento

Los siguientes datos provienen del changelog oficial de la release 2025-06-21 y releases anteriores. No se dispone de una tabla comparativa con otros modelos en la información proporcionada.

| Benchmark | Resultado | Release |
|---|---|---|
| ScreenSpot (F1@0.5) | 80,4 | 2025-06-21 |
| ChartQA | 77,5 (82,2 con PoT) | 2025-04-15 |
| DocVQA | 79,3 | 2025-04-15 |
| TextVQA | 76,3 | 2025-04-15 |
| OCRBench | 61,2 | 2025-03-27 |
| CountBenchQA | 86,4 | 2025-03-27 |
| COCO (detección de objetos) | 51,2 | 2025-03-27 |

## Requisitos de hardware

- VRAM estimada: en fp16, el modelo requiere aproximadamente 3,9 GB de memoria (1,93 B parámetros × 2 bytes). Con cuantización int8, ~2 GB; con cuantización GGUF Q4, ~1,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en fp16. Tarjetas como NVIDIA GTX 1650, RTX 3060, RTX 4090 o superiores son suficientes. También compatible con Apple Silicon (MPS).
- En consumer GPU: sí, cabe en GPUs de gama media y baja, incluso en modo CPU con cuantización.
- Opciones de despliegue: compatible con Hugging Face Transformers (con `trust_remote_code=True`), vLLM, llama.cpp, Ollama y TGI. El sitio oficial menciona el motor de inferencia Photon para producción.
- Latencia y throughput: no se proporcionan datos específicos, pero la release 2025-06-21 reporta una generación de texto entre un 20 y un 40 % más rápida gracias al tokenizador superword.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. Moondream 2 se posiciona en la categoría de VLM pequeños (~2 B parámetros), compitiendo con modelos como LLaVA-1.5-7B (más grande) o Phi-3.5-vision (4,2 B), pero no se han encontrado benchmarks comparativos en las fuentes consultadas.

## Limitaciones y advertencias

- Al ser un modelo de ~1,93 B parámetros, puede presentar alucinaciones visuales en imágenes complejas o ambiguas, especialmente en tareas de razonamiento de alto nivel.
- El entrenamiento está principalmente orientado al inglés; el rendimiento en otros idiomas puede ser limitado, aunque el changelog menciona que el nuevo tokenizador facilitará extensiones multilingües futuras.
- La longitud de contexto no está documentada en la información disponible; se recomienda verificar la documentación oficial para casos de uso con prompts largos.
- El modelo se actualiza con frecuencia; el autor original recomienda fijar una revisión específica (p. ej., `2025-06-21`) en aplicaciones de producción para evitar cambios inesperados.
- Este repositorio es un espejo; para soporte y actualizaciones, se debe acudir al repositorio original `vikhyatk/moondream2`.
- La licencia Apache 2.0 permite uso comercial, pero se debe atribuir adecuadamente al autor original.

## Enlaces

- Repositorio espejo en Hugging Face: https://huggingface.co/NostraEmpire/mirror-moondream2
- Repositorio original en Hugging Face: https://huggingface.co/vikhyatk/moondream2
- Sitio web oficial: https://moondream.ai/
- Demo en línea: https://moondream.ai/playground
- Repositorio GitHub: https://github.com/vikhyat/moondream
- Notas de release 2025-06-21: https://moondream.ai/blog/moondream-2025-06-21-release
- Notas de release 2025-04-14: https://moondream.ai/blog/moondream-2025-04-14-release
- Notas de release 2025-03-27: https://moondream.ai/blog/moondream-2025-03-27-release
