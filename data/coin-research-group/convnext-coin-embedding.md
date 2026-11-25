# COIN-Research-Group/convnext-coin-embedding

## Resumen

ConvNeXt Coin Embedding es un modelo de extracción de características visuales especializado en numismática, desarrollado por COIN-Research-Group. Se trata de un ConvNeXt-Tiny truncado y entrenado con metric learning (ArcFace) para generar embeddings de 512 dimensiones que permiten la recuperación de ejemplares de monedas romanas republicanas y la verificación por pares de si dos imágenes corresponden a la misma moneda física. El modelo resuelve un problema específico de visión por computador aplicada al patrimonio cultural: identificar y emparejar monedas antiguas a partir de imágenes escaneadas de catálogos de cuños, fotografías y reproducciones impresas.

La arquitectura trunca el backbone ConvNeXt-Tiny tras la etapa de 14×14×384 (índice 6 de `.features`), preservando detalle de relieve, desgaste e inscripción que un pooling global destruiría. Sobre esa salida se aplica una convolución 1×1 de 384 a 32 canales, un aplanado a 6272 dimensiones, una capa lineal a 512 y una BatchNorm1d. La salida cruda está escalada por BatchNorm, por lo que debe normalizarse L2 manualmente antes de comparar similitudes.

El modelo es relevante por su enfoque de dominio: entrena con datos de procedencia documentada y una aumentación de dominio calibrada (Provenance-calibrated MixStyle) que busca generalizar a fotografías y reproducciones impresas. Su licencia Apache 2.0 y su reducido tamaño (repo de 0.1 GB) lo hacen accesible para proyectos de digitalización de colecciones numismáticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Tiny truncado (hasta etapa 14×14×384) + cabeza de embedding |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (pesos PyTorch float32) |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `state_dict` (`.pth`) |

## Arquitectura y entrenamiento

El modelo parte de `torchvision.models.convnext_tiny` y conserva únicamente las capas hasta la etapa de 14×14×384, descartando el resto del backbone. Sobre esa representación espacial aplica una convolución 1×1 que reduce 384 canales a 32, aplana el tensor resultante (32×14×14 = 6272 dimensiones) y lo proyecta mediante una capa lineal a un vector de 512 dimensiones, seguido de BatchNorm1d. La salida final se normaliza L2, de modo que la similitud coseno equivale al producto escalar.

El entrenamiento utiliza ArcFace (softmax con margen angular aditivo), con una clase por identidad de moneda; la cabeza clasificadora no forma parte del checkpoint publicado. Los datos provienen de imágenes escaneadas de catálogos de cuños de monedas romanas republicanas con procedencia documentada, y se aplica una aumentación de dominio denominada Provenance-calibrated MixStyle, calibrada sobre monedas de procedencia conocida para mejorar la generalización a fotografías y reproducciones impresas. El preprocesado de entrenamiento incluye un redimensionado cuadrado a 224×224 sin preservar aspecto, conversión a RGB y una limpieza opcional de píxeles casi blancos (todos los canales > 250) a blanco puro.

## Capacidades

- Extracción de embeddings de imagen de 512 dimensiones L2-normalizados para recuperación y similitud.
- Verificación por pares ("same coin?") mediante similitud coseno entre dos imágenes.
- Recuperación de ejemplares de monedas romanas republicanas en un espacio métrico entrenado con ArcFace.
- Robustez parcial al salto de dominio entre escaneos de catálogo, fotografías y reproducciones impresas.
- Preservación de detalle fino (relieve, desgaste, inscripción) gracias al truncado del backbone antes del pooling global.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un extractor de características puramente visual.

## Casos de uso

- Digitalización de colecciones numismáticas: generar embeddings de cada pieza escaneada para indexar y buscar ejemplares similares en un catálogo interno, usando la similitud coseno sobre vectores de 512 dimensiones.
- Verificación de autenticidad y emparejamiento de cuños: comparar dos imágenes de una misma moneda física (anverso o reverso) para confirmar que corresponden al mismo ejemplar, con un umbral de coseno calibrado.
- Enriquecimiento de bases de datos arqueológicas: vincular fotografías de campo con escaneos de catálogo de referencia mediante recuperación por similitud.
- Detección de duplicados en repositorios de imágenes: agrupar imágenes de la misma moneda tomadas en condiciones distintas (foto, escaneo, reproducción impresa) para deduplicar fondos documentales.
- Apoyo a la investigación en humanidades digitales: construir espacios de embeddings para analizar agrupaciones de monedas por identidad o tipo, facilitando estudios de procedencia y dispersión.
- Sistemas de recomendación para coleccionistas: sugerir piezas visualmente similares dentro de un catálogo comercial o museístico a partir de una imagen de consulta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que `config.json` contiene "benchmark numbers in machine-readable form", pero los valores concretos no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repo (0.1 GB) y la arquitectura ConvNeXt-Tiny truncada, la inferencia en float32 es ligera y cabe holgadamente en GPU de consumo.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; el modelo puede ejecutarse en CPU (la model card indica "GPU optional").
- Cabe en GPU de consumo: sí, previsiblemente en cualquier RTX o equivalente; no se especifican modelos concretos.
- Opciones de despliegue: PyTorch + torchvision + huggingface_hub (carga vía `hf_hub_download`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un extractor de visión).
- Latencia y throughput: no disponibles; la model card sugiere `batch_size=128` para el bucle de embedding, sin cifras de rendimiento.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de retrieval numismático ni con extractores de características visuales genéricos.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para monedas romanas republicanas; su generalización a otras numismáticas o dominios visuales no está documentada.
- La salida cruda está escalada por BatchNorm y no es unitaria; es obligatorio normalizar L2 antes de comparar, o los resultados se degradan.
- El preprocesado debe replicarse exactamente (resize cuadrado a 224×224 sin preservar aspecto, RGB, normalización ImageNet); desviarse de él degrada los resultados.
- La limpieza de píxeles casi blancos es un denoise para escaneos de catálogo, no un segmentador de primer plano; no ayuda con fondos oscuros o texturados.
- No se aplica test-time augmentation ni flips; un solo pase hacia delante.
- Riesgo de falsos positivos en verificación por pares si no se calibra el umbral de coseno para el dominio concreto.
- No hay información sobre sesgos, tasas de alucinación (no aplica a un extractor) ni restricciones adicionales de licencia más allá de Apache 2.0, que permite uso comercial.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, lo que indica escasa validación por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/COIN-Research-Group/convnext-coin-embedding
- Blog con contexto del paper (ICMLA aceptado): https://www.recoveringsawhill.com/blog/2026/icmla-paper-accepted/
- Repositorio de pesos: `convnext_coin_embedding.pth` (dentro del repo de Hugging Face)
- Configuración: `config.json` (dentro del repo de Hugging Face)
