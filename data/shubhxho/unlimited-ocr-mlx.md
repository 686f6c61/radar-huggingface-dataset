# shubhxho/Unlimited-OCR-MLX

## Resumen

Unlimited-OCR-MLX es una adaptación nativa para Apple Silicon del modelo Unlimited-OCR desarrollado por Baidu, que introduce el concepto de "one-shot long-horizon parsing": la capacidad de procesar documentos completos de decenas o cientos de páginas en una única pasada de atención, sin necesidad de dividirlos en fragmentos independientes. Esta implementación MLX, creada por shubhxho, utiliza el backend dedicado `unlimited_ocr` de mlx-vlm en lugar de un envoltorio genérico de Transformers, lo que garantiza que se preserve el diseño original del modelo.

El modelo combina un doble codificador visual (SAM ViT-B y CLIP-L), un proyector de 2048 a 1280 dimensiones, un decodificador MoE estilo DeepSeek-V2 con top-6 expertos activos, y el algoritmo R-SWA (Reference Sliding Window Attention) que sustituye la atención estándar por atención deslizante basada en referencias, eliminando el cuello de botella de la caché KV en documentos largos. El checkpoint BF16 ocupa 6,7 GB y se resuelve en tiempo de ejecución desde el repositorio oficial de Baidu, por lo que este repositorio no publica pesos MLX independientes todavía.

La relevancia actual radica en que permite ejecutar un modelo OCR de última generación en hardware Apple Silicon sin necesidad de GPUs NVIDIA, con soporte para PDFs de alta resolución, preprocesamiento dinámico de recortes (modo `gundam`) y decodificación determinista con guardas de repetición. El repositorio incluye además un entrenador LoRA específico para este modelo y un evaluador con manifiesto bloqueado, pensado para investigación y fine-tuning controlado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAM ViT-B + CLIP-L (doble codificador visual), proyector 2048→1280, decodificador MoE top-6 estilo DeepSeek-V2, atención R-SWA |
| Parametros totales | no disponible (checkpoint BF16 de 6,7 GB) |
| Parametros activos | no disponible (decodificador MoE con top-6 expertos activos) |
| Longitud de contexto | no especificada (diseñado para parsing de documentos largos, multi-página) |
| Tipos de cuantizacion | BF16 (checkpoint original); no se publican cuantizaciones MLX standalone todavía |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | no disponible (resuelve el checkpoint BF16 oficial de `baidu/Unlimited-OCR` en tiempo de ejecución) |

## Arquitectura y entrenamiento

La arquitectura de Unlimited-OCR-MLX replica fielmente el diseño publicado por Baidu. El modelo emplea un doble codificador visual: un ViT-B de SAM para capturar detalles de alta resolución y un CLIP-L para obtener una representación global de la página. Ambos se fusionan mediante un proyector que reduce la dimensionalidad de 2048 a 1280. El decodificador sigue el esquema MoE de DeepSeek-V2 con selección top-6 de expertos, lo que reduce el coste computacional manteniendo la capacidad del modelo.

La innovación principal es el algoritmo R-SWA (Reference Sliding Window Attention), que reemplaza toda la atención estándar del decodificador por atención deslizante basada en referencias. Según el paper técnico de Baidu, esta sustitución no degrada el rendimiento en tareas de parsing, pero elimina el crecimiento lineal de la caché KV con la longitud del documento, permitiendo procesar cientos de páginas en una sola pasada. El preprocesamiento incluye dos modos: `gundam` (vista global de 1024×1024 más recortes dinámicos de 640×640 con relación de aspecto ajustada) para imágenes individuales, y `base` (una vista global de 1024×1024 por página) para documentos multi-página. La decodificación es determinista e incorpora una guarda de repetición de 35-gramas deslizante.

En cuanto al entrenamiento, el repositorio MLX incluye un entrenador LoRA específico que maneja los tensores visuales duales no estándar del modelo, con una pérdida solo sobre completaciones y división a nivel de documento. No se proporcionan datos sobre el dataset o el número de tokens de entrenamiento del modelo original; el paper de Baidu está disponible en arXiv para esos detalles.

## Capacidades

- OCR de imágenes individuales y PDFs completos, con renderizado a 300 DPI por defecto.
- Parsing de documentos largos en una sola pasada (one-shot long-horizon parsing), sin fragmentación en páginas independientes.
- Generación de salida en Markdown y JSON, con metadatos de temporización, recuento de tokens, uso de memoria y motivo de finalización.
- Soporte de documentos multi-página con protocolo específico: inserción de un único marcador `<image>` y selección automática del modo `base` para dos o más páginas.
- Preprocesamiento dinámico de recortes (`gundam`) para imágenes individuales, que mejora la precisión en documentos con diseños complejos.
- Decodificación determinista con guarda de repetición de 35-gramas, configurable.
- API Python sencilla (`load_model`, `ocr_images`, `write_result`) y CLI con opciones para rangos de páginas, DPI, tamaño de paso de prefill y reanudación de ejecuciones.
- Entrenamiento LoRA específico para el modelo, con contrato de datos JSONL estricto y evaluador con manifiesto bloqueado.

## Casos de uso

- Digitalización de archivos históricos: el modelo puede procesar libros escaneados de cientos de páginas en una sola pasada, generando Markdown estructurado sin perder el orden de las páginas, gracias a la atención R-SWA que mantiene el contexto global.
- Extracción de texto de informes financieros y legales: con el modo `gundam` para páginas individuales, se obtienen recortes dinámicos que mejoran la lectura de tablas y columnas estrechas, ideal para documentos con maquetación densa.
- Conversión de PDFs a Markdown para pipelines de RAG: la salida en Markdown y JSON permite integrar el modelo en sistemas de recuperación aumentada, donde los documentos largos se indexan sin necesidad de dividirlos manualmente.
- Automatización de facturas y recibos en macOS: la CLI permite procesar directorios de imágenes o PDFs de forma desatendida, con reanudación automática de ejecuciones interrumpidas y generación de sidecars JSON para auditoría.
- Investigación académica sobre OCR de documentos largos: el repositorio incluye un entrenador LoRA y un evaluador con manifiesto bloqueado, lo que permite reproducir experimentos de fine-tuning sin contaminar los conjuntos de prueba públicos.
- Procesamiento de documentos multi-página en entornos sin GPU NVIDIA: al ejecutarse en Apple Silicon con memoria unificada, es una opción viable para equipos que solo disponen de hardware de Apple, con un requisito de 32 GB de RAM recomendado para páginas grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta adaptación MLX. El paper técnico de Baidu (arXiv:2606.23050) reporta evaluaciones del modelo original, pero este repositorio no incluye números de rendimiento propios ni comparaciones con otras implementaciones. El autor indica que una evaluación de paridad de salida contra el checkpoint oficial es un requisito previo antes de publicar pesos cuantizados, pero no se han compartido resultados hasta la fecha.

## Requisitos de hardware

- macOS con chip Apple Silicon (M1, M2, M3, M4 o posteriores).
- Python 3.10 o superior.
- Memoria unificada: 6,7 GB para el checkpoint BF16 más las activaciones del documento; se recomiendan 32 GB o más para páginas grandes o PDFs largos.
- No requiere GPU NVIDIA ni CUDA; la inferencia se ejecuta en la GPU integrada de Apple Silicon mediante MLX.
- Despliegue mediante la CLI (`uv run unlimited-ocr-mlx`) o la API Python, con `mlx-vlm==0.6.16` fijado como dependencia.
- Opciones de ajuste de memoria: `--prefill-step-size 512` para reducir el pico de memoria prefill en prompts visuales largos, y `--max-pages-per-request` para dividir PDFs muy extensos en solicitudes independientes.
- No se proporcionan datos de latencia ni throughput en la documentación disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| shubhxho/Unlimited-OCR-MLX | SAM ViT-B + CLIP-L, MoE top-6, R-SWA | Largo (multi-página) | MIT | MLX, Apple Silicon |
| baidu/Unlimited-OCR (original) | Idéntica | Largo (multi-página) | MIT | PyTorch, vLLM, Transformers |
| sahilchachra/unlimited-ocr-mxfp8-mlx | Misma base, cuantización MXFP8 | Largo (multi-página) | MIT | MLX, Apple Silicon |
| LoJexLLM/Unlimited-OCR-MLX | Misma base, sin especificar | Largo (multi-página) | MIT | MLX, Apple Silicon |

La comparativa se limita a características estructurales, ya que no hay datos de rendimiento publicados para ninguna de estas variantes MLX. El modelo original de Baidu es la referencia canónica; las adaptaciones MLX difieren en el backend de inferencia y en la posible cuantización, pero mantienen la misma arquitectura y preprocesamiento.

## Limitaciones y advertencias

- Solo funciona en macOS con Apple Silicon; no hay soporte para Linux, Windows o GPUs NVIDIA en esta implementación.
- El repositorio no publica pesos MLX independientes; la inferencia descarga el checkpoint BF16 oficial de Baidu en tiempo de ejecución, lo que requiere conexión a internet y espacio en disco.
- La versión de `mlx-vlm` está fijada a 0.6.16; no se garantiza compatibilidad con versiones anteriores o posteriores.
- No se han publicado benchmarks de rendimiento para esta adaptación, por lo que no es posible verificar la paridad de salida con el modelo original.
- El entrenamiento LoRA requiere un contrato de datos JSONL estricto y un evaluador específico; no se puede utilizar el collator genérico de MLX-VLM para este modelo.
- El modelo original puede presentar sesgos en el reconocimiento de escritura manuscrita, idiomas minoritarios o tipografías poco comunes, aunque no se documentan casos concretos en esta adaptación.
- La guarda de repetición de 35-gramas puede alterar la salida en documentos con repeticiones legítimas; se puede desactivar con `--no-repeat-ngram-size 0`, pero esto puede aumentar el riesgo de alucinaciones.
- Para producción, se recomienda validar la salida en documentos representativos antes de desplegar, dado que no hay métricas oficiales de precisión disponibles.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/shubhxho/Unlimited-OCR-MLX
- Repositorio GitHub: https://github.com/shubhxho/Unlimited-OCR-mlx
- Modelo original de Baidu: https://huggingface.co/baidu/Unlimited-OCR
- Paper técnico (arXiv): https://arxiv.org/pdf/2606.23050
- Repositorio GitHub de Baidu Unlimited-OCR: https://github.com/baidu/Unlimited-OCR
- Implementación MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- Adaptación MLX cuantizada MXFP8: https://huggingface.co/sahilchachra/unlimited-ocr-mxfp8-mlx
- Adaptación MLX alternativa: https://huggingface.co/LoJexLLM/Unlimited-OCR-MLX
- Análisis técnico en Analytics Vidhya: https://www.analyticsvidhya.com/blog/2026/08/baidu-unlimited-ocr-technical-breakdown/
