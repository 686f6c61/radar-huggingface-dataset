# macduhuan/apertus-galaxus-heads

## Resumen

`macduhuan/apertus-galaxus-heads` es un modelo de clasificación de imágenes publicado como primer entregable (work in progress) para el reto Hack Apertus x Galaxus. No se trata de un modelo de lenguaje generativo, sino de un conjunto de seis cabezas MLP ligeras montadas sobre el modelo multimodal `swiss-ai/Apertus-v1.5-8B`, que permanece congelado. Cada imagen se procesa en un único forward pass y se extraen los estados ocultos de la capa 24, que las cabezas clasifican en seis dimensiones de producto (sujeto, fondo, perspectiva, individuos, tipo de texto y idioma del texto).

El modelo resuelve un problema concreto de catalogación de imágenes de producto para el minorista suizo Galaxus: etiquetar automáticamente fotografías de catálogo según su tipología visual y el texto que contienen. Es relevante ahora porque demuestra una receta eficiente de adaptación de un modelo base de 8B mediante cabezas externas entrenadas, sin reentrenar el backbone, y porque publica resultados reproducibles (macro F1 medio de 0,77 en bf16 con contexto de producto) junto con el código y los pesos de las cabezas.

El repositorio es muy pequeño (0,2 GB) porque solo contiene el fichero `heads_vague_512.pt`; el backbone Apertus v1.5 8B se descarga aparte (unos 18 GB) y está sujeto a acceso restringido (gated) en Hugging Face. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone transformer multimodal congelado (Apertus v1.5 8B) + 6 cabezas MLP de clasificación (1024 unidades ocultas) sobre estados ocultos de la capa 24 |
| Parametros totales | No disponible (el backbone Apertus v1.5 8B tiene 8B; las cabezas son ligeras, sin cifra publicada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (recomendado) y 4-bit (soportado, con pérdida de rendimiento) |
| Idiomas soportados | Clasificación de texto en alemán, inglés, francés, italiano y neerlandés (más "other" y "none"); idiomas del backbone no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`); el backbone se distribuye en safetensors |

## Arquitectura y entrenamiento

El sistema mantiene Apertus v1.5 8B completamente congelado y realiza un único forward pass por imagen, con o sin contexto de producto asociado. De la capa 24 se extraen los estados ocultos combinando el último token y la media sobre los tokens de visión, se normalizan y se pasan a seis cabezas MLP independientes, una por dimensión: `subject` (13 clases), `background` (3), `perspective` (10), `individuals` (2), `text_classification` (6) y `text_language` (7). La imagen se procesa a 512 x 512 píxeles.

Las cabezas se entrenaron únicamente con las etiquetas humanas de `train.csv` (excluyendo preetiquetados automáticos), añadiendo copias espejadas de las perspectivas izquierda/derecha y un tercio de las imágenes sin contexto de producto. No se aplicó RLHF ni DPO: es un ajuste supervisado de clasificadores sobre características congeladas. La innovación práctica es la eficiencia de la receta: adaptar un backbone de 8B a una tarea de clasificación sin tocar sus pesos y con un coste de entrenamiento mínimo.

## Capacidades

- Clasificación de imágenes de producto en seis dimensiones simultáneas: sujeto, fondo, perspectiva, presencia de individuos, tipo de texto y idioma del texto.
- Clasificación de texto embebido en la imagen (información nutricional, especificaciones técnicas, etc.) e identificación de su idioma.
- Detección de perspectiva de la fotografía (frontal, ángulos laterales, etc.) y de tipo de fondo (blanco, color, escena lifestyle).
- Aprovechamiento opcional de contexto textual de producto para mejorar la clasificación (macro F1 0,77 con contexto frente a 0,73-0,75 sin él).
- Robustez a variaciones de perspectiva gracias al aumento de datos con copias espejadas.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-step: es exclusivamente un clasificador.

## Casos de uso

- Catalogación automática de imágenes de producto: el modelo asigna etiquetas de sujeto, fondo y perspectiva a cada fotografía de un catálogo, reduciendo el etiquetado manual en flujos de alta volumetría como el de un minorista online.
- Enrutamiento de imágenes por tipo de contenido: clasificar si una imagen es producto completo, detalle o logotipo permite dirigirla a pipelines de postproceso distintos (recorte, control de calidad, generación de fichas).
- Normalización de fondos y estilos: la detección de fondo blanco, color o escena lifestyle facilita decidir qué imágenes requieren sustitución de fondo o retoque antes de publicarse.
- Extracción de idioma de texto en imagen: identificar si la etiqueta o el envase está en alemán, francés, italiano o neerlandés ayuda a enrutar el contenido hacia el mercado o el equipo de traducción correspondiente.
- Control de calidad de catálogo: la clasificación de perspectiva y presencia de individuos permite detectar imágenes fuera de norma (por ejemplo, con personas no deseadas o ángulos no permitidos) de forma automatizada.
- Clasificación de material textual en producto: distinguir entre información nutricional y especificaciones técnicas sirve para indexar y validar el contenido informativo de las fichas de producto.
- Prototipado rápido en retos y hackathones: la receta de cabezas sobre backbone congelado sirve de plantilla para adaptar Apertus a otras tareas de clasificación con pocos recursos.

## Benchmarks y rendimiento

Macro F1 medio sobre las seis dimensiones, evaluado en un holdout de 600 imágenes de `train.csv` con productos completos reservados:

| Configuracion | Macro F1 |
|---|---|
| Cabezas + Apertus en bf16, con contexto de producto | 0,77 |
| Cabezas + Apertus en bf16, sin contexto | 0,73 a 0,75 |
| Cabezas + Apertus en 4-bit (cabezas entrenadas con características bf16) | 0,63 |
| Leaderboard público de Kaggle (imágenes dev), misma receta | 0,776 |

No se han publicado resultados por dimensión ni comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: 24 GB o más para inferencia en bf16; aproximadamente 9 GB con cuantización 4-bit.
- GPU recomendadas: NVIDIA con 24 GB o más (por ejemplo, RTX 4090, A100, H100) para bf16; RTX 3080 Ti (12 GB) funciona en 4-bit.
- Cabe en GPU de consumo: sí, en RTX 3080 Ti o superior con cuantización 4-bit, asumiendo la pérdida de precisión (macro F1 0,63 frente a 0,77).
- Entorno: Linux, drivers CUDA 12.8 y fork de transformers de swiss-ai que requiere Apertus 1.5.
- Despliegue: script propio `src/heads.py` del repositorio `Kai360-dot/galaxus-hackathon-challenge` (commit 21187f1); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Rendimiento: aproximadamente 1,4 imágenes/s en una RTX 3080 Ti con cuantización 4-bit; la primera ejecución descarga unos 18 GB del backbone y tarda varios minutos en cargar.

## Comparativa con modelos similares

No se dispone de comparaciones con otros modelos en la información proporcionada. Como referencia de categoría, cabría contrastarlo con clasificadores de imágenes genéricos (por ejemplo, CLIP o ViT ajustados) o con pipelines multimodales de catálogo, pero no hay datos de rendimiento comparables publicados para este modelo.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| apertus-galaxus-heads | Backbone 8B + cabezas ligeras | No disponible | Macro F1 0,77 (bf16, con contexto) | Apache 2.0 | Hugging Face (backbone gated) |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Es un work in progress y no la entrega final del reto; el autor lo advierte explícitamente.
- El uso en 4-bit degrada el rendimiento de forma notable (pérdida de unos 0,14 de macro F1); se recomienda bf16.
- El backbone Apertus v1.5 8B está restringido (gated): requiere aceptar sus términos y una cuenta de Hugging Face con acceso de lectura.
- Depende de un fork específico de transformers y de un commit concreto del repositorio de código, lo que complica la reproducibilidad a medio plazo.
- Sin datos publicados sobre sesgos, riesgo de alucinación (limitado al ser clasificación) ni comportamiento fuera de las seis dimensiones definidas.
- No se documentan limitaciones de idioma del backbone ni del contexto de producto; los idiomas de texto cubiertos son solo alemán, inglés, francés, italiano y neerlandés (más "other" y "none").
- No se han publicado métricas por dimensión, por lo que se desconoce si alguna clase concreta rinde peor que la media.
- La licencia Apache 2.0 se declara para el repositorio de cabezas; conviene verificar las condiciones del backbone Apertus para uso comercial en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/macduhuan/apertus-galaxus-heads
- Modelo base: https://huggingface.co/swiss-ai/Apertus-v1.5-8B
- Repositorio de código del reto: https://github.com/Kai360-dot/galaxus-hackathon-challenge (rama `feature/apertus-pipeline`, commit 21187f1)
