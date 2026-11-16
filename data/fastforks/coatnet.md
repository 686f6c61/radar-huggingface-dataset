# fastforks/coatnet

## Resumen

CoAtNet es una familia de modelos de visión por computador para clasificación de imágenes en ImageNet-1k, publicada originalmente por Dai et al. en 2021. La arquitectura combina bloques convolucionales MBConv con etapas de transformer, un diseño híbrido que busca aunar la eficiencia inductiva de las convoluciones con la capacidad de modelado global de la atención. Este repositorio concreto, `fastforks/coatnet`, no contiene pesos: es una model card que actúa como índice de las variantes oficiales de `timm` y verifica su integridad mediante hashes SHA-256.

El modelo se distribuye a través de la librería `fastforks`, un runtime de inferencia que descarga los pesos desde los repositorios de `timm` y los valida criptográficamente antes de cargarlos. El backend disponible es `portable`, y la tarea soportada es exclusivamente clasificación de imágenes con salida de logits sobre las 1.000 clases de ImageNet-1k. No se trata de un modelo generativo ni multimodal: no procesa texto, audio ni vídeo.

La relevancia de esta ficha radica en que agrupa diez variantes con distintos tamaños y resoluciones de entrada, todas bajo licencia Apache-2.0 y con uso comercial permitido. Las variantes `nano` y `0` caben en GPUs de consumo con un consumo de memoria mínimo, mientras que las variantes `2` y `rmlp_2` a 384 píxeles ofrecen mayor capacidad a costa de más cómputo. Es una opción práctica para pipelines de clasificación de imágenes donde se requiere trazabilidad de pesos y licencia permisiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida MBConv (convolucional) + transformer con relative position bias |
| Parametros totales | no disponible (depende de la variante; no se publican recuentos en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen fija de 224x224 o 384x384 según variante) |
| Tipos de cuantizacion | fp16 probado en backend portable; no se documentan otras cuantizaciones |
| Idiomas soportados | no aplica (clasificación de imágenes, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 (código y pesos de todas las variantes) |
| Formato de pesos | safetensors (descargados desde los repositorios de `timm`) |

## Arquitectura y entrenamiento

CoAtNet combina etapas convolucionales de tipo MBConv con etapas de transformer que emplean sesgo de posición relativa. Esta hibridación, descrita por Dai et al. en 2021, permite que las primeras capas capturen patrones locales con las ventajas inductivas de la convolución y que las capas profundas modelen dependencias globales mediante atención. Las variantes con sufijo `rmlp` incorporan además Relative Multi-Layer Perceptron, una modificación que sustituye parte de la atención por capas MLP con sesgo posicional relativo.

El entrenamiento se realizó sobre ImageNet-1k (ILSVRC 2012) para las variantes `sw_in1k`, y sobre ImageNet-12k con ajuste fino posterior en ImageNet-1k para las variantes `sw_in12k_ft_in1k`. No se documentan en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset más allá de ImageNet, ni si se aplicaron técnicas de RLHF o DPO (no aplicables a un clasificador de imágenes). Tampoco se detallan innovaciones como decodificación especulativa, al no ser un modelo autorregresivo.

## Capacidades

- Clasificación de imágenes en las 1.000 clases de ImageNet-1k, con salida de logits por clase.
- Procesamiento de una única imagen RGB por inferencia, con redimensionado y recorte central a la resolución fija de cada variante.
- Variantes con entrada a 224x224 y una variante (`coatnet_rmlp_2_rw_384`) con entrada a 384x384 para mayor detalle espacial.
- Ejecución en backend `portable` con precisión fp16 verificada en hardware de consumo.
- Verificación de integridad de pesos mediante SHA-256 antes de la carga.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multilingües, de audio o de vídeo.

## Casos de uso

- Moderación de contenido visual: clasificar imágenes subidas por usuarios en categorías ImageNet para filtrar contenido no deseado en plataformas, aprovechando las variantes `nano` o `0` por su bajo consumo de memoria (0,1 GiB en fp16).
- Etiquetado automático de catálogos de producto: asignar categorías genéricas a fotografías de inventario en comercio electrónico, usando la variante `coatnet_2_rw_224.sw_in12k_ft_in1k` por su ajuste fino sobre un dataset más amplio.
- Preprocesamiento en pipelines de visión: generar características o etiquetas previas que alimenten modelos posteriores de detección o segmentación, con la variante `coatnet_rmlp_2_rw_384.sw_in12k_ft_in1k` cuando se requiera mayor resolución.
- Clasificación en dispositivos de borde: desplegar `coatnet_nano_rw_224.sw_in1k` en GPUs de consumo o entornos con restricciones de VRAM, dado su pico de 0,1 GiB en fp16.
- Investigación en arquitecturas híbridas: usar las variantes como línea base reproducible para comparar diseños convolucionales frente a transformers puros en tareas de clasificación.
- Verificación de integridad en producción: integrar el flujo de descarga y comprobación SHA-256 de `fastforks` en pipelines de CI/CD para garantizar que los pesos desplegados son los esperados.
- Análisis de imágenes médicas o industriales: servir como extractor de características con ajuste fino posterior, aunque requiere reentrenamiento sobre el dominio específico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión top-1 o top-5, latencia ni throughput para ninguna de las variantes.

## Requisitos de hardware

- VRAM estimada en fp16 según la model card, medida en una RTX 5060 Ti de 16 GB: `coatnet_0_rw_224.sw_in1k` 0,1 GiB pico asignado y 0,1 GiB reservado; `coatnet_1_rw_224.sw_in1k` 0,1 GiB pico y 0,2 GiB reservado; `coatnet_2_rw_224.sw_in12k_ft_in1k` 0,2 GiB pico y 0,2 GiB reservado; `coatnet_nano_rw_224.sw_in1k` 0,1 GiB pico y 0,1 GiB reservado; `coatnet_rmlp_1_rw2_224.sw_in12k_ft_in1k` 0,1 GiB pico y 0,2 GiB reservado; `coatnet_rmlp_1_rw_224.sw_in1k` 0,1 GiB pico y 0,2 GiB reservado; `coatnet_rmlp_2_rw_224.sw_in12k_ft_in1k` 0,2 GiB pico y 0,2 GiB reservado; `coatnet_rmlp_2_rw_224.sw_in1k` 0,2 GiB pico y 0,2 GiB reservado.
- GPU recomendadas: cualquier GPU con al menos 1 GiB de VRAM libre en fp16; las variantes probadas se ejecutaron en RTX 5060 Ti 16 GB. No se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, todas las variantes probadas caben holgadamente en GPUs de consumo con 0,1-0,2 GiB de VRAM pico.
- Opciones de despliegue: librería `fastforks` con backend `portable`; los pesos son compatibles con `timm` y PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de imágenes).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento (precisión top-1) en la información proporcionada para comparar con alternativas como ConvNeXt, ViT o EfficientNet. La siguiente tabla recoge únicamente los datos disponibles de la model card frente a características generales conocidas de la categoría, marcando como "no disponible" lo que no se puede verificar.

| Modelo | Parametros | Contexto/entrada | Licencia | Formato |
|---|---|---|---|---|
| CoAtNet (fastforks) | no disponible por variante | 224x224 o 384x384 fijo | Apache-2.0 | safetensors |
| ConvNeXt (timm) | no disponible | no disponible | Apache-2.0 | safetensors |
| ViT (timm) | no disponible | no disponible | Apache-2.0 | safetensors |
| EfficientNet (timm) | no disponible | no disponible | Apache-2.0 | safetensors |

No se han publicado en la información disponible métricas que permitan una comparación cuantitativa de rendimiento entre CoAtNet y estos modelos.

## Limitaciones y advertencias

- El repositorio no contiene pesos: es solo una model card índice. La disponibilidad depende de los repositorios de `timm` enlazados y de la conectividad durante la descarga.
- Modelo exclusivamente de clasificación de imágenes: no genera texto, no procesa lenguaje natural, audio ni vídeo, y no soporta tool calling ni agentes.
- Entrada de imagen fija por variante (224x224 o 384x384); no admite resoluciones arbitrarias sin redimensionado y recorte previos.
- Entrenado sobre ImageNet-1k/12k: puede presentar sesgos de dominio y un rendimiento degradado en imágenes fuera de la distribución de entrenamiento (fotografía médica, satelital, industrial, etc.).
- Riesgo de clasificación errónea en clases ambiguas o visualmente similares; los logits no incorporan calibración de incertidumbre documentada.
- Licencia Apache-2.0 en código y pesos según la model card, con uso comercial permitido para todas las variantes listadas; aun así, la model card advierte de que se trata de un paquete de uso en investigación y recomienda verificar las cadenas de licencia originales antes de otros usos.
- El backend documentado es únicamente `portable`; no se garantiza compatibilidad con otros runtimes sin validación adicional.
- No se documentan limitaciones idiomáticas ni de contexto porque el modelo no procesa texto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fastforks/coatnet
- Código de fastforks: https://github.com/kleinicke/fastforks
- Kernels para el backend `kernels`: https://huggingface.co/fastforks/kernels
- Código original de `timm` (commit `0df212b369a5`): https://github.com/huggingface/pytorch-image-models
- Pesos `coatnet_0_rw_224.sw_in1k`: https://huggingface.co/timm/coatnet_0_rw_224.sw_in1k
- Pesos `coatnet_1_rw_224.sw_in1k`: https://huggingface.co/timm/coatnet_1_rw_224.sw_in1k
- Pesos `coatnet_2_rw_224.sw_in12k_ft_in1k`: https://huggingface.co/timm/coatnet_2_rw_224.sw_in12k_ft_in1k
- Pesos `coatnet_nano_rw_224.sw_in1k`: https://huggingface.co/timm/coatnet_nano_rw_224.sw_in1k
- Pesos `coatnet_rmlp_1_rw2_224.sw_in12k_ft_in1k`: https://huggingface.co/timm/coatnet_rmlp_1_rw2_224.sw_in12k_ft_in1k
- Pesos `coatnet_rmlp_1_rw_224.sw_in1k`: https://huggingface.co/timm/coatnet_rmlp_1_rw_224.sw_in1k
- Pesos `coatnet_rmlp_2_rw_224.sw_in12k_ft_in1k`: https://huggingface.co/timm/coatnet_rmlp_2_rw_224.sw_in12k_ft_in1k
- Pesos `coatnet_rmlp_2_rw_224.sw_in1k`: https://huggingface.co/timm/coatnet_rmlp_2_rw_224.sw_in1k
- Pesos `coatnet_rmlp_2_rw_384.sw_in12k_ft_in1k`: https://huggingface.co/timm/coatnet_rmlp_2_rw_384.sw_in12k_ft_in1k
- Pesos `coatnet_rmlp_nano_rw_224.sw_in1k`: https://huggingface.co/timm/coatnet_rmlp_nano_rw_224.sw_in1k
- Evidencia de licencia: https://huggingface.co/timm/coatnet_nano_rw_224.sw_in1k/blob/89fb9ccadc876a973c6ff954b089eb6723174c7a/README.md
- Hashes completos (`card.toml`): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/classification/models/coatnet/card.toml
