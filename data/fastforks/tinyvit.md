# fastforks/tinyvit

## Resumen
TinyViT es una familia de clasificadores de imagen ligeros presentados por Wu et al. (Microsoft Research) en 2022. Combina una etapa inicial de convoluciones MBConv con etapas posteriores de atención por ventanas, un diseño híbrido que busca el rendimiento de un transformer de visión con el coste computacional de una red convolucional pequeña. Los modelos se preentrenan mediante destilación sobre ImageNet-22k y se afinan sobre ImageNet-1k.

El repositorio `fastforks/tinyvit` no aloja pesos propios: es una model card que describe cómo el runtime fastforks descarga los pesos originales publicados por el equipo de `timm` y los verifica mediante SHA-256. Ofrece cinco variantes con 5, 11 y 21 millones de parámetros y resoluciones de entrada fijas de 224, 384 y 512 píxeles, todas con licencia Apache-2.0 y uso comercial permitido.

Su relevancia práctica está en la eficiencia: clasificación ImageNet-1k en el rango de milisegundos por imagen con un consumo de memoria en GPU que no supera los 0,3 GiB en la variante de 512x512, lo que permite desplegar clasificación de imágenes en hardware de consumo y en pipelines de alto throughput.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: etapa MBConv (convolucional) seguida de etapas de atención por ventanas (window attention) |
| Parametros totales | 5M (`tiny_vit_5m`), 11M (`tiny_vit_11m`), 21M (`tiny_vit_21m`) según variante |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión); entrada fija de 224x224, 384x384 o 512x512 según variante |
| Tipos de cuantizacion | no disponible en la información proporcionada (las pruebas reportadas usan fp16) |
| Idiomas soportados | no disponible (modelo de clasificación de imágenes, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 (código y pesos de las cinco variantes; uso comercial permitido) |
| Formato de pesos | safetensors (pesos originales alojados en repos de `timm`, verificados por SHA-256) |

## Arquitectura y entrenamiento
TinyViT es un transformer de visión híbrido. La primera etapa usa bloques MBConv (convoluciones depthwise separables con expansión invertida, al estilo MobileNetV2), y las etapas siguientes aplican self-attention restringida a ventanas locales para reducir el coste cuadrático. El preentrenamiento se realiza por destilación sobre ImageNet-22k (release completo de ImageNet de otoño de 2011) y el ajuste final sobre ImageNet-1k (ILSVRC 2012). El sufijo `dist_in22k_ft_in1k` de cada variante refleja exactamente ese pipeline: destilación en 22k y fine-tuning en 1k.

El paquete `fastforks` implementa dos backends de inferencia: `portable` (implementación de referencia en PyTorch) y `kernels` (kernels optimizados publicados en `fastforks/kernels`). El código original de referencia es `pytorch-image-models` (timm) en el commit `0df212b369a5`. La salida del modelo son logits sobre las 1.000 clases de ImageNet-1k.

## Capacidades
- Clasificación de imágenes en 1.000 clases de ImageNet-1k; salida directa de logits.
- Entrada de una única imagen RGB con preprocesado fijo: redimensionado del lado corto y recorte central a la resolución de la variante (224, 384 o 512).
- Extracción de características visuales utilizable como backbone para tareas posteriores (la model card no documenta cabeceras de detección o segmentación).
- Inferencia en fp16 verificada en GPU (RTX 5060 Ti 16 GB) para las cinco variantes.
- Dos backends intercambiables: `portable` y `kernels`, con ganancias de velocidad medidas de entre 1,6x y 6,1x frente al backend portable.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un clasificador de imágenes, no un modelo generativo.

## Casos de uso
- Moderación de contenido visual a gran escala: clasificar millones de imágenes por segundo en pipelines batch; la variante `tiny_vit_5m_224` procesa una imagen en 0,846 ms con el backend `kernels` y solo 48 MiB de memoria pico.
- Etiquetado automático de catálogos de e-commerce: asignar categorías ImageNet-like a fotos de producto con la variante `tiny_vit_21m_384`, que gana resolución sin superar 132 MiB de memoria pico.
- Prefiltrado en sistemas de visión por computador: usar TinyViT como primera etapa para descartar imágenes irrelevantes antes de un modelo mayor, reduciendo coste agregado.
- Clasificación en el borde o en GPU de consumo: las cinco variantes caben en cualquier GPU con más de 1 GiB de VRAM; la de 5M ocupa 48 MiB en el backend `kernels`.
- Indexación y búsqueda visual: generar etiquetas de clase para organizar archivos multimedia o alimentar motores de búsqueda interna.
- Control de calidad industrial: detectar categorías de defectos o tipos de pieza en líneas de inspección donde la latencia por imagen inferior a 1 ms es determinante.
- Prototipado rápido de clasificadores: servir de baseline con pesos verificados por hash antes de entrenar un modelo específico del dominio.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks de precisión (top-1/top-5 en ImageNet) en la información disponible. Los datos de rendimiento disponibles son de latencia y memoria, medidos en una RTX 5060 Ti 16 GB con fp16:

| Variante | Entrada | Tiempo original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Memoria pico kernels (MiB) |
|---|---|---|---|---|---|---|
| `tiny_vit_5m_224` | 224x224 | 5,92 | 5,19 | 0,846 | 7,0x | 48 |
| `tiny_vit_11m_224` | 224x224 | 5,95 | 5,19 | 0,930 | 6,4x | 60 |
| `tiny_vit_21m_224` | 224x224 | 6,05 | 5,26 | 1,18 | 5,1x | 83 |
| `tiny_vit_21m_384` | 384x384 | 5,84 | 4,97 | 1,79 | 3,3x | 132 |
| `tiny_vit_21m_512` | 512x512 | 11,2 | 4,92 | 3,13 | 2,6x | 237 |

Tiempos de carga y primera llamada (segundos):

| Variante | Carga original | Carga portable | Carga kernels | Primera llamada original | Primera llamada portable | Primera llamada kernels |
|---|---|---|---|---|---|---|
| `tiny_vit_5m_224` | 0,26 | 2,02 | 1,37 | 1,28 | 0,26 | 0,12 |
| `tiny_vit_11m_224` | 0,56 | 1,83 | 1,44 | 0,60 | 0,41 | 0,11 |
| `tiny_vit_21m_224` | 0,37 | 1,98 | 1,45 | 0,99 | 0,40 | 0,10 |
| `tiny_vit_21m_384` | 0,69 | 2,26 | 1,81 | 0,80 | 0,38 | 0,07 |
| `tiny_vit_21m_512` | 1,46 | 3,05 | 2,72 | 0,16 | 0,38 | 0,05 |

## Requisitos de hardware
- VRAM: entre 48 MiB y 237 MiB de memoria pico en fp16 con el backend `kernels`, según variante y resolución. En el backend `portable`, entre 52 MiB y 310 MiB.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; las pruebas se realizaron en una RTX 5060 Ti 16 GB. Modelos de datacenter como A100 o H100 no aportan ventaja significativa dado el tamaño del modelo.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 o incluso GPUs de portátil con 4 GB de VRAM.
- Despliegue: el paquete `fastforks` con backends `portable` y `kernels`; los pesos originales son compatibles con `timm` (`pytorch-image-models`). La model card no documenta integración con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de visión).
- Latencia: de 0,846 ms a 3,13 ms por imagen en GPU con `kernels`; en el backend `portable`, de 4,92 a 5,26 ms.
- Throughput estimado: con `tiny_vit_5m_224` y `kernels` a 0,846 ms/imagen, en torno a 1.180 imágenes por segundo en una RTX 5060 Ti, sin considerar solapamiento de preprocesado.

## Comparativa con modelos similares
La información proporcionada no incluye datos de precisión de TinyViT ni de alternativas, por lo que la comparación se limita a lo documentado.

| Modelo | Parámetros | Entrada | Licencia | Comentario |
|---|---|---|---|---|
| TinyViT 5M (fastforks) | 5M | 224x224 | Apache-2.0 | Variante más rápida: 0,846 ms/imagen |
| TinyViT 11M (fastforks) | 11M | 224x224 | Apache-2.0 | Compromiso entre tamaño y capacidad |
| TinyViT 21M (fastforks) | 21M | 224/384/512 | Apache-2.0 | Mayor resolución disponible (512x512) |
| Otras alternativas (DeiT, Swin, MobileNetV3) | no disponible | no disponible | no disponible | Sin datos en la información proporcionada |

## Limitaciones y advertencias
- Modelo exclusivamente de clasificación: no genera texto, no razona, no soporta instrucciones ni conversación.
- El repositorio no contiene pesos: depende de la descarga desde los repos de `timm` y de la verificación SHA-256; si los enlaces cambian, la carga falla.
- Entrada de tamaño fijo por variante; no admite resoluciones arbitrarias sin recorte o redimensionado previo.
- Solo clases de ImageNet-1k: el vocabulario de salida está limitado a 1.000 categorías genéricas; para dominios específicos requiere fine-tuning.
- Sin datos publicados de precisión (top-1/top-5) en la información disponible; no es posible evaluar la calidad de clasificación sin consultar los repos originales de `timm`.
- Tier experimental según la propia model card: el soporte del runtime `fastforks` puede no ser estable en producción.
- Riesgo de sesgo heredado de ImageNet: el dataset tiene sesgos conocidos de representación geográfica y cultural que se trasladan a las predicciones.
- Licencia Apache-2.0 permite uso comercial, pero la model card advierte de que se trata de un paquete de investigación y recomienda revisar las cadenas de licencia originales antes de otros usos.
- No se documentan métodos de cuantización (INT8, GGUF) ni su impacto en precisión.

## Enlaces
- Model card en Hugging Face: https://huggingface.co/fastforks/tinyvit
- Código del runtime fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend `kernels`: https://huggingface.co/fastforks/kernels
- Código original (timm, commit `0df212b369a5`): https://github.com/huggingface/pytorch-image-models
- Pesos `tiny_vit_5m_224.dist_in22k_ft_in1k`: https://huggingface.co/timm/tiny_vit_5m_224.dist_in22k_ft_in1k
- Pesos `tiny_vit_11m_224.dist_in22k_ft_in1k`: https://huggingface.co/timm/tiny_vit_11m_224.dist_in22k_ft_in1k
- Pesos `tiny_vit_21m_224.dist_in22k_ft_in1k`: https://huggingface.co/timm/tiny_vit_21m_224.dist_in22k_ft_in1k
- Pesos `tiny_vit_21m_384.dist_in22k_ft_in1k`: https://huggingface.co/timm/tiny_vit_21m_384.dist_in22k_ft_in1k
- Pesos `tiny_vit_21m_512.dist_in22k_ft_in1k`: https://huggingface.co/timm/tiny_vit_21m_512.dist_in22k_ft_in1k
- Fichero de especificaciones y hashes (`card.toml`): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/classification/models/tinyvit/card.toml
- Evidencia de licencia: https://huggingface.co/timm/tiny_vit_21m_224.dist_in22k_ft_in1k/blob/bcd5d68c5650bf4d65a0a1262f28b699a4d1c35f/README.md
