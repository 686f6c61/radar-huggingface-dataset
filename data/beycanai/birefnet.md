# beycanai/BiRefNet

## Resumen

BiRefNet es un modelo de segmentación de imagen especializado en eliminación de fondos (background removal) y matting de alta precisión. Este repositorio concreto, publicado por beycanai, no es un modelo nuevo entrenado desde cero, sino una recopilación de checkpoints oficiales de BiRefNet (desarrollados originalmente por Peng Zheng, ZhengPeng7/BiRefNet) reempaquetados como archivos safetensors individuales para su uso con el nodo BiRefNet Remove Background de la extensión ComfyUI-BCNodes. Cada archivo corresponde a una variante oficial del modelo original, sin modificaciones en los pesos.

La relevancia de este repositorio es práctica: agrupa en un único punto de descarga once variantes de BiRefNet (general, alta resolución, retrato, matting, versiones lite y una variante comunitaria llamada Lucida), cada una con un backbone Swin Transformer y distintos tamaños de entrada (512, 1024 o 2048 píxeles). Esto simplifica el despliegue en ComfyUI, ya que el nodo descarga únicamente el checkpoint seleccionado en `ComfyUI/models/background_removal/`, carpeta que también leen los nodos BiRefNet nativos de ComfyUI.

Arquitectura y tamaño: BiRefNet se basa en un backbone Swin Transformer (swin_v1_l para las variantes completas, swin_v1_t para las lite) con un decodificador de segmentación binocular de alta resolución. Los archivos van desde 0,09 GB (BiRefNet_lite-matting) hasta 0,89 GB (BiRefNet-portrait y BiRefNet-matting). La licencia es MIT tanto para los checkpoints de Zheng como para Lucida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin Transformer (swin_v1_l o swin_v1_t) con decodificador de segmentación binocular de alta resolución (BiRefNet) |
| Parametros totales | no disponible (no se indica el recuento de parámetros en la información proporcionada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en safetensors sin cuantización declarada) |
| Idiomas soportados | no disponible (modelo de imagen, independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | image-segmentation |
| Tarea | background removal / image matting |
| Tamano del repo | 5,3 GB (suma de los 11 checkpoints) |
| Tamano por checkpoint | 0,09 GB a 0,89 GB según variante |
| Resoluciones de entrada | 512, 1024 y 2048 píxeles según variante |
| Backbone por variante | swin_v1_l (general, 512x512, HR, portrait, matting, HR-matting, dynamic, Lucida); swin_v1_t (lite, lite-2K, lite-matting) |

## Arquitectura y entrenamiento

BiRefNet emplea un backbone Swin Transformer (versión large, swin_v1_l, en la mayoría de variantes; versión tiny, swin_v1_t, en las lite) combinado con un diseño de decodificación binocular que procesa la imagen a alta resolución para producir máscaras de segmentación finas. Las variantes se diferencian por resolución de entrada (512, 1024 o 2048 píxeles) y por su especialización: las versiones "general" cubren segmentación de objetos arbitrarios, las "portrait" están orientadas a personas, las "matting" producen alfa de alta precisión en bordes (pelo, transparencias), y las "HR" trabajan a 2048 píxeles. La variante Lucida es un checkpoint comunitario de egeorcun derivado de la misma familia.

No se dispone en la información proporcionada de detalles sobre el número de tokens o imágenes de entrenamiento, la composición del dataset ni si se emplearon técnicas de refinamiento como RLHF (no aplicable aquí) o ajuste fino supervisado específico. Cada archivo de este repositorio es una copia sin modificar del `model.safetensors` de su fuente original, renombrado al nombre que espera el nodo de ComfyUI.

## Capacidades

- Eliminación de fondo (background removal) de imágenes con objetos arbitrarios mediante las variantes general y dynamic.
- Matting de alta precisión en bordes complejos (pelo, transparencias, detalles finos) con las variantes matting.
- Segmentación de retratos y personas con BiRefNet-portrait.
- Procesamiento a alta resolución (hasta 2048 píxeles de entrada) con las variantes HR y HR-matting.
- Modo ligero para entornos con recursos limitados con las variantes lite (backbone swin_v1_t, archivos de 0,18 GB o menos).
- Integración directa con ComfyUI mediante el nodo BiRefNet Remove Background de ComfyUI-BCNodes y compatibilidad con los nodos BiRefNet nativos de ComfyUI.
- Descarga selectiva por variante (el nodo solo descarga el checkpoint elegido).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de segmentación.

## Casos de uso

- Eliminación de fondo en flujos de ComfyUI: el nodo BiRefNet Remove Background descarga la variante elegida en `ComfyUI/models/background_removal/` y la aplica directamente sobre la imagen de entrada, integrándose en pipelines de generación o edición de imagen.
- Producción fotográfica y e-commerce: usar BiRefNet-general o BiRefNet-HR para recortar productos sobre fondos limpios, con la variante HR a 2048 píxeles cuando se requiere detalle en imágenes grandes.
- Retoque de retratos: BiRefNet-portrait está especializado en personas, adecuado para separar sujetos de fondos en fotografía de estudio o contenido para redes.
- Composición con transparencias: BiRefNet-matting y BiRefNet-HR-matting generan alfa de alta precisión en bordes (pelo, cristal, tejidos), útiles en postproducción y VFX.
- Automatización por lotes en servidores modestos: BiRefNet_lite y BiRefNet_lite-matting (0,09-0,18 GB) permiten procesar grandes volúmenes de imágenes con requisitos de VRAM bajos.
- Preprocesado para otros modelos: generar máscaras de segmentación que alimenten pipelines de inpainting, edición o generación condicionada en ComfyUI.
- Segmentación de alta resolución en 2K: BiRefNet_512x512, BiRefNet-HR y BiRefNet_lite-2K cubren distintos compromisos entre velocidad y detalle según el tamaño de la imagen de entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por el tamaño de los checkpoints (0,09-0,89 GB) la inferencia cabe holgadamente en GPUs de consumo, aunque el pico de memoria depende de la resolución de entrada (512, 1024 o 2048 píxeles).
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño de pesos, cualquier GPU consumer moderna (por ejemplo, RTX 3060 en adelante) debería poder ejecutar las variantes lite y general; las variantes HR a 2048 píxeles requerirán más memoria.
- Cabe en GPU consumer: sí, previsiblemente todas las variantes, con mayor margen en las lite.
- Opciones de despliegue: ComfyUI (nodo BiRefNet Remove Background de ComfyUI-BCNodes y nodos BiRefNet nativos), carga directa de safetensors; no se indican otros runners (vLLM, llama.cpp, Ollama, TGI no aplican a un modelo de visión de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Resolucion de entrada | Tamano de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BiRefNet (este repo, variantes general/lite/HR/matting) | Swin Transformer + decodificador binocular | 512 / 1024 / 2048 | 0,09-0,89 GB por checkpoint | MIT | Hugging Face (beycanai/BiRefNet) y fuentes originales ZhengPeng7 |
| BiRefNet original (ZhengPeng7/BiRefNet y derivados) | Swin Transformer + decodificador binocular | 512 / 1024 / 2048 | Similar por variante | MIT | Hugging Face y GitHub ZhengPeng7/BiRefNet |
| Lucida (egeorcun/lucida) | Swin Transformer (variante comunitaria) | 1024 | 0,88 GB | MIT | Hugging Face (egeorcun/lucida) |

No se dispone de datos de rendimiento comparativo (métricas como IoU, S-measure o MAE) en la información proporcionada para contrastar con alternativas como U2-Net, IS-Net o MODNet.

## Limitaciones y advertencias

- Este repositorio no entrena ni modifica los modelos: son copias renombradas de checkpoints de terceros; cualquier limitación de los originales aplica aquí.
- No se dispone de información sobre sesgos del dataset de entrenamiento; como modelo de segmentación puede fallar en categorías de objetos poco representadas o en condiciones de iluminación extremas.
- Riesgo de segmentación imperfecta en bordes complejos (pelo, transparencias) salvo que se use la variante matting adecuada.
- Las variantes HR a 2048 píxeles incrementan el coste computacional y de memoria; no son adecuadas para entornos con VRAM muy limitada.
- La licencia MIT se aplica a los checkpoints según la model card; conviene verificar la licencia de cada fuente original (ZhengPeng7 para BiRefNet, egeorcun para Lucida) antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria documentada de esta copia concreta.
- No hay información sobre idiomas ni sobre capacidades de texto: es un modelo exclusivamente de imagen.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/beycanai/BiRefNet
- ComfyUI-BCNodes (nodo BiRefNet Remove Background): https://github.com/0xBeycan/ComfyUI-BCNodes
- BiRefNet original (Peng Zheng): https://github.com/ZhengPeng7/BiRefNet
- BiRefNet en Hugging Face: https://huggingface.co/ZhengPeng7/BiRefNet
- BiRefNet_512x512: https://huggingface.co/ZhengPeng7/BiRefNet_512x512
- BiRefNet_HR: https://huggingface.co/ZhengPeng7/BiRefNet_HR
- BiRefNet-portrait: https://huggingface.co/ZhengPeng7/BiRefNet-portrait
- BiRefNet-matting: https://huggingface.co/ZhengPeng7/BiRefNet-matting
- BiRefNet_HR-matting: https://huggingface.co/ZhengPeng7/BiRefNet_HR-matting
- BiRefNet_lite: https://huggingface.co/ZhengPeng7/BiRefNet_lite
- BiRefNet_lite-2K: https://huggingface.co/ZhengPeng7/BiRefNet_lite-2K
- BiRefNet_dynamic: https://huggingface.co/ZhengPeng7/BiRefNet_dynamic
- BiRefNet_lite-matting: https://huggingface.co/ZhengPeng7/BiRefNet_lite-matting
- Lucida (egeorcun): https://huggingface.co/egeorcun/lucida
