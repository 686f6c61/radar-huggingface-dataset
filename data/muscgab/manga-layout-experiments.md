# muscgab/manga-layout-experiments

## Resumen

Manga Layout Experiments es una colección de modelos experimentales para el análisis de maquetación de páginas de manga, desarrollada por el usuario muscgab. La primera entrega, denominada R34 × R41, parte del modelo Koharu Layout HighRes de Mayo Takanashi y lo refina mediante un ajuste fino orientado a la detección de cajas delimitadoras (texto, efectos sonoros, bocadillos de diálogo y viñetas) y a la segmentación de glifos a resolución original. El modelo se publica como checkpoint de PyTorch bajo licencia Apache 2.0 y con el pipeline declarado de segmentación de imágenes.

El interés técnico reside en su enfoque híbrido: R34 emplea un ViT con lienzo rectangular para páginas dobles y un fallback cuadrado, mientras que R41 refina los logits de glifos del U-Net usando la luminancia de la imagen original. Ambos componentes se ajustaron por separado y se combinaron en un único checkpoint. El resultado es un detector sensiblemente más ligero en cómputo que su modelo base (0,65 TMAC frente a 3,37 TMAC por página completa), con mejoras en la detección de texto y en la IoU de glifos, aunque con un rendimiento inferior en efectos sonoros pequeños.

Se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, pensado para investigación y experimentación en digitalización y análisis automatizado de cómics japoneses. No es un modelo de lenguaje: no genera texto ni razona, sino que produce cajas y máscaras sobre imágenes de páginas de manga.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: ViT (R34) para detección de cajas + U-Net (R41) para refinado de glifos |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen; el dominio es manga japonés) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (checkpoint nativo; no se mencionan safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo combina dos componentes ajustados de forma independiente. R34 es un Vision Transformer que procesa la página con un lienzo rectangular para páginas dobles elegibles y un lienzo cuadrado como fallback, y produce cajas delimitadoras para cuatro clases: texto, efectos sonoros, bocadillos de diálogo y viñetas. R41 es un refinador que toma los logits de glifos del U-Net y los corrige usando la luminancia de la imagen original, generando una máscara binaria de glifos a la resolución original de la imagen.

El detector final se ajustó con 1.024 páginas de entrenamiento del dataset Manga109 Segmentation v3.0.0, usando anotaciones humanas de cajas y objetivos de clasificación de HighRes emparejados con los efectos sonoros anotados. El refinador de glifos se entrenó con 258 páginas de Manga109 con máscaras humanas de glifos procedentes de Zenodo. En fases anteriores del entrenamiento también se empleó un conjunto de 12.683 páginas privadas de manga con pseudoetiquetas de cajas generadas por HighRes y máscaras de glifos obtenidas con Text SAM. No se documentan fases de RLHF ni DPO, algo esperable en un modelo de segmentación.

## Capacidades

- Detección de cajas delimitadoras de texto en páginas de manga.
- Detección de cajas de efectos sonoros (sound effects).
- Detección de cajas de bocadillos de diálogo (speech bubbles).
- Detección de cajas de viñetas (panels).
- Segmentación binaria de glifos a resolución original de la imagen.
- Procesamiento de páginas dobles mediante lienzo rectangular, con fallback cuadrado.
- Salida a nivel de página completa en una sola pasada.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües en el sentido de modelos de lenguaje; su dominio es visual y específico del manga.

## Casos de uso

- Digitalización y catalogación de archivos de manga: el modelo permite extraer automáticamente viñetas, bocadillos y texto de páginas escaneadas, lo que facilita la indexación y la búsqueda posterior en colecciones digitales de gran volumen.
- Traducción automática asistida de manga: las cajas de texto y la máscara de glifos sirven como paso previo para aislar regiones de texto, aplicar OCR y sustituir el texto por su traducción respetando la maquetación original.
- Limpieza y retoque de scans: la máscara binaria de glifos a resolución original permite eliminar o reemplazar texto sin dañar el dibujo subyacente, útil en pipelines de remasterización.
- Análisis académico de maquetación: investigadores en estudios de cómic pueden medir la distribución de viñetas, el tamaño de los bocadillos o la densidad de texto por página de forma automatizada sobre corpus como Manga109.
- Preprocesado para modelos de visión-lenguaje: las cajas y máscaras generadas pueden alimentar etapas posteriores de descripción de escenas o de comprensión multimodal, reduciendo el ruido de entrada.
- Detección de efectos sonoros para estudios de estilo: aunque su AP75 en efectos sonoros pequeños es limitado (8,93), el modelo puede emplearse en tareas de exploración y anotación asistida donde la revisión humana posterior sea viable.
- Prototipado en investigación de segmentación documental: su bajo coste computacional (0,65 TMAC por página) lo hace adecuado para experimentar con arquitecturas híbridas ViT + U-Net en entornos con recursos moderados.

## Benchmarks y rendimiento

Resultados de validación publicados por el autor sobre 722 páginas dobles de validación de Manga109, comparando R34 × R41 con el modelo base HighRes:

| Metrica | R34 × R41 | HighRes |
|---|---|---|
| COCO box AP | 78,16 | 78,23 |
| Text box AP | 85,95 | 83,95 |
| Small sound-effect box AP75 | 8,93 | 12,82 |
| Glyph IoU a nivel de página (41 páginas) | 64,40 % | 55,28 % |

En la prueba de latencia emparejada en una NVIDIA L4 con las implementaciones originales de PyTorch (24 páginas, batch size 1):

| Metrica | R34 × R41 | HighRes |
|---|---|---|
| Latencia mediana extremo a extremo | 183 ms | 273 ms |
| Memoria pico asignada | 1,18 GiB | 1,02 GiB |
| Cómputo estimado por página | 0,65 TMAC | 3,37 TMAC |

El autor advierte que la reducción de MACs es mucho mayor que la ganancia medida en latencia y que la memoria pico puede ser superior en algunos casos.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,2 GiB de memoria pico asignada según la prueba del autor en NVIDIA L4 con batch size 1; el repositorio completo ocupa 0,2 GB.
- GPU recomendadas: NVIDIA L4 es la referencia medida; por el reducido consumo de memoria, cualquier GPU con al menos 2-4 GB de VRAM debería ser suficiente, incluidas GTX 1650, RTX 3050 o superiores.
- Cabe en GPU de consumo: sí, con amplio margen, dado el bajo uso de memoria observado.
- Opciones de despliegue: el autor proporciona código de inferencia de referencia en PyTorch dentro del directorio `r34-r41`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de segmentación de imágenes.
- Latencia y throughput: latencia mediana de 183 ms por página en NVIDIA L4 con batch size 1; no se publican cifras de throughput con batches mayores.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / resolución | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Manga Layout Experiments (R34 × R41) | ViT + U-Net para layout de manga | Resolución original de página | Box AP 78,16; glyph IoU 64,40 % | Apache 2.0 | Hugging Face, 0 descargas |
| Koharu Layout HighRes (mayocream) | Modelo base de layout de manga | Resolución alta | Box AP 78,23; glyph IoU 55,28 % | no disponible en la información proporcionada | Hugging Face |
| Alternativas de segmentación documental genérica | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con su modelo base, del que hereda arquitectura y datos. No se dispone de información sobre otros modelos especializados en layout de manga con los que contrastarlo.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo etiqueta como colección de experimentos, sin garantías de robustez en producción.
- Rendimiento deficiente en efectos sonoros pequeños: AP75 de 8,93 frente a 12,82 del modelo base, lo que desaconseja su uso para esa clase sin revisión humana.
- Las máscaras de instancia y los contornos de bocadillos requieren procesamiento posterior; el modelo no los entrega directamente.
- La memoria pico puede ser superior a la del modelo base pese al menor cómputo, lo que puede afectar a despliegues con restricciones estrictas de VRAM.
- La ganancia real de latencia es mucho menor que la reducción teórica de MACs, según advierte el autor.
- Entrenado principalmente con Manga109, un corpus japonés; el comportamiento en otros estilos, idiomas o calidades de escaneo no está documentado.
- Sin descargas ni validación por parte de la comunidad en el momento de la consulta; no hay evidencia externa de su comportamiento.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los datasets empleados pueden tener condiciones adicionales que conviene verificar antes de un despliegue comercial.
- Riesgo de alucinación no aplica en el sentido de modelos generativos, pero sí existe riesgo de falsos positivos y negativos en la detección de cajas y glifos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muscgab/manga-layout-experiments
- Modelo base Koharu Layout HighRes: https://huggingface.co/mayocream/koharu-layout-highres
- Dataset Manga109 Segmentation: https://huggingface.co/datasets/mayocream/manga109-segmentation
- Máscaras de glifos humanas en Zenodo: https://zenodo.org/records/4511796
