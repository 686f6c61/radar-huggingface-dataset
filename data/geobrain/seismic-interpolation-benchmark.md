# GeoBrain/seismic-interpolation-benchmark

## Resumen

GeoBrain/seismic-interpolation-benchmark es un repositorio de checkpoints de deep learning para la reconstrucción de trazas sísmicas faltantes en gathers pre-stack. Publicado por el equipo GeoBrain, no se trata de un modelo único, sino de un banco de pruebas que reúne varias arquitecturas de la literatura (UNet, CA-Unet, WRDL, PConv U-Net, CFunet, gated transformer v9 y ANet) entrenadas sobre dos conjuntos de datos sísmicos: el dataset de campo Mobil y el dataset sintético SEG C3. Cada experimento corresponde a una arquitectura, un escenario de trazas faltantes y una semilla aleatoria.

El objetivo es permitir la comparación directa de métodos de interpolación sísmica en condiciones controladas. Incluye escenarios de enmascarado uniforme (30 %, 50 % y 70 % de trazas perdidas), dropout aleatorio de trazas y bloques consecutivos de trazas ausentes. Es una referencia relevante para investigadores en procesado de señales sísmicas y en reconstrucción de datos geofísicos, ya que proporciona configuraciones de entrenamiento reproducibles y pesos preentrenados listos para evaluar o adaptar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Múltiples arquitecturas (no un modelo único): UNet, CA-Unet (Coordinate Attention U-Net), WRDL (wavelet-based residual deep learning), PConv U-Net, CFunet (coarse-refine network), gated transformer v9 y ANet |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE; los parámetros activos corresponden a cada arquitectura por separado, no especificados) |
| Longitud de contexto | no aplica (modelo de datos sísmicos, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión/datos sísmicos, no de texto) |
| Licencia | no disponible |
| Formato de pesos | PyTorch .pt (state_dict) |

## Arquitectura y entrenamiento

El repositorio contiene checkpoints de siete arquitecturas diferentes. La mayoría son modelos convolucionales 2D diseñados para reconstrucción de trazas en gathers sísmicos. Por ejemplo, el UNet de Chai et al. (2020) tiene 50 capas y usa 19 convoluciones 5x5 con padding same, pooling y concatenaciones, adecuado para datos con falta regular. El CA-Unet incorpora bloques de Coordinate Attention con pooling direccional en altura y anchura, convoluciones 1x1 compartidas, activación H-Swish y gating Sigmoid. El modelo ANet aplica dos convoluciones de downsampling con stride 2, seis bloques residuales y un módulo de atención no local, junto con agrupaciones de upsampling y convolución.

El entrenamiento varía según la arquitectura. Los modelos basados en atención (CA-Unet y ANet) emplean una función de pérdida híbrida de SSIM y L1. El CFunet utiliza una pérdida en el dominio de Fourier. Los datos de entrenamiento proceden del dataset Mobil de campo y del dataset sintético SEG C3 (9 disparos regulares, 201 trazas x 625 muestras de tiempo, dt = 2 ms). El preprocesamiento incluye corrección de divergencia esférica con potencia 1.2 (excepto cuando el paper lo omite), normalización global por max_abs al rango [-1, 1] y extracción de parches superpuestos en dimensiones traza y tiempo. No se mencionan técnicas de alineación con RLHF ni DPO, ya que no se trata de un modelo de lenguaje.

## Capacidades

- Reconstrucción de trazas sísmicas faltantes en gathers pre-stack, tanto en datos de campo (Mobil) como sintéticos (SEG C3).
- Soporte de escenarios de enmascarado uniforme (30 %, 50 % y 70 % de trazas perdidas, con un patrón de mantener cada k-ésima traza).
- Soporte de dropout aleatorio de trazas (30 % y 50 %).
- Soporte de bloques consecutivos de trazas ausentes (20, 30 y 40 trazas consecutivas perdidas).
- Variedad de arquitecturas para comparación: desde U-Nets clásicos hasta redes con atención no local, atención de coordenadas, wavelets y gated transformers.
- Capacidades específicas de cada arquitectura, como la pérdida de Fourier en CFunet y la pérdida híbrida SSIM + L1 en modelos con atención.
- No incluye capacidades de tool calling, agentes ni generación de lenguaje. Tampoco es multimodal en el sentido de visión o audio estándar; su entrada son matrices de datos sísmicos.

## Casos de uso

- Reconstrucción de gathers sísmicos pre-stack en adquisiciones de campo: el modelo ANet o CA-Unet puede emplearse para recuperar trazas perdidas por instrumentación defectuosa, usando las configuraciones de Mobil como referencia.
- Regularización de datos sísmicos sintéticos en entornos académicos: el dataset SEG C3 permite validar algoritmos de interpolación sobre disparos regulares con 201 trazas y 625 muestras de tiempo.
- Comparación de arquitecturas para investigación en interpolación sísmica: el benchmark permite evaluar de forma reproducible qué arquitectura y función de pérdida rinden mejor en cada escenario de enmascarado.
- Preprocesado en pipelines de inversión sísmica: la reconstrucción de trazas faltantes es un paso previo para migración, apilado o análisis de AVO; los checkpoints pueden integrarse como módulo de restauración.
- Evaluación de métodos de atención en señales sísmicas: los modelos con Coordinate Attention y no local permiten estudiar el impacto de mecanismos de atención sobre la regularidad espacial de los gathers.
- Adaptación a nuevos dataset mediante fine-tuning: los pesos preentrenados pueden cargarse y ajustarse con datos propios, aprovechando las configuraciones YAML incluidas para reproducir el entrenamiento.
- Benchmarking de configuraciones de enmascarado: los escenarios de máscara uniforme, aleatoria y bloques consecutivos facilitan la validación de algoritmos de interpolación bajo condiciones de pérdida controladas.

## Benchmarks y rendimiento

La model card indica que existen archivos de resultados por conjunto de datos (results_mobil.md y results_seg_c3.md) donde se detallan las métricas por arquitectura y escenario. No se han proporcionado cifras concretas en la información disponible, por lo que no es posible presentar una tabla de resultados sin inventar datos. La propia documentación invita a consultar dichos archivos para obtener las métricas exactas (por ejemplo, validación con pérdida SSIM o L1 según el modelo).

## Requisitos de hardware

No se especifican requisitos de hardware en la información disponible. Las arquitecturas son redes convolucionales 2D y redes residuales que habitualmente requieren una cantidad de VRAM modesta, pero no se han facilitado datos precisos de consumo, latencia ni throughput. Se puede asumir que los checkpoints se cargan con PyTorch y que la inferencia podría ejecutarse en GPU o CPU, pero no se dispone de valores de referencia. No se mencionan opciones de despliegue como vLLM, llama.cpp u otros frameworks; su uso directo es mediante la carga de state dictionaries y la instanciación manual de la arquitectura.

## Comparativa con modelos similares

| Modelo (interno) | Arquitectura | Pérdida principal | Escenarios disponibles | Dataset |
|---|---|---|---|---|
| chai2020_unet | 2D U-Net, 50 capas, 19 conv 5x5 | no especificada | Uniforme (30/50/70) y otros según paper | SEG C3 |
| li2022_caunet | U-Net con Coordinate Attention | Híbrida SSIM + L1 | Uniforme y aleatorio | Mobil y SEG C3 |
| liu2022_wrdl | Wavelet-based residual | no especificada | Según paper | SEG C3 |
| pan2020_pconv_unet | U-Net con convoluciones parciales | no especificada | Según paper | no disponible |
| park2022_cfunet | Coarse-refine con pérdida de Fourier | Fourier | Uniforme, aleatorio, bloques | SEG C3 |
| gated_transformer_v9 | Gated transformer | no especificada | Mismos que los papers base | SEG C3 |
| yu2022_anet | ResNet con atención no local | Híbrida SSIM + L1 | Uniforme y bloques consecutivos | Mobil y SEG C3 |

Comparado con modelos externos, no se dispone de información sobre alternativas de la misma categoría en la fuente proporcionada. La característica distintiva de este repositorio es reunir múltiples arquitecturas de la literatura en un solo banco de pruebas con configuraciones reproducibles, en lugar de presentar un modelo único.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un sistema de propósito general; su ámbito se limita a la reconstrucción de trazas sísmicas en gathers pre-stack.
- La licencia no está especificada, por lo que el uso comercial, modificación o redistribución queda ambiguo. Se recomienda contactar con GeoBrain antes de utilizarlo en proyectos productivos.
- Los datos de entrenamiento se restringen a dos conjuntos concretos (Mobil y SEG C3), lo que puede limitar la generalización a otros entornos sísmicos con distinta geometría o contenido frecuencial.
- Los escenarios de enmascarado son limitados y siguen las configuraciones de cada paper. No incluye, por ejemplo, pérdidas con patrones irregulares complejos o ráfagas largas de trazas ausentes en posiciones arbitrarias.
- Los checkpoints se almacenan como state dictionaries de PyTorch, por lo que se necesita instanciar manualmente cada arquitectura con los parámetros del config.yaml correspondiente. No se proporciona una API unificada de inferencia.
- Los resultados de benchmark están referenciados en archivos Markdown dentro del repositorio, pero no se han incluido en la información disponible. Cualquier afirmación sobre métricas concretas debe verificarse en dichos archivos.
- Para las arquitecturas que usan pérdida híbrida SSIM + L1, el rendimiento puede variar según la elección de los hiperparámetros y el tipo de normalización, lo que debe tenerse en cuenta al comparar con resultados de otros estudios.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/GeoBrain/seismic-interpolation-benchmark
- Referencias y papers incluidos en la model card:
  - Chai et al., "Deep Learning for Regularly Missing Data Reconstruction", IEEE TGRS, 2020. DOI: 10.1109/TGRS.2019.2961015
  - Li et al., "CA-Unet: Coordinate Attention U-Net for Seismic Data Reconstruction", IEEE LGRS, 2022. DOI: 10.1109/LGRS.2021.3128511
  - Liu et al., "Seismic Data Reconstruction via Wavelet-Based Residual Deep Learning", IEEE TGRS, 2022. DOI: 10.1109/TGRS.2022.3152984
  - Pan et al., "A Partial Convolution-Based Deep-Learning Network for Seismic Data Regularization", Computers & Geosciences, 2020. DOI: 10.1016/j.cageo.2020.104609
  - Park et al., "Coarse-Refine Network With Upsampling Techniques and Fourier Loss for the Reconstruction of Missing Seismic Data", IEEE TGRS, 2022. DOI: 10.1109/TGRS.2022.3190292
  - Yu and Wu, "Attention and Hybrid Loss Guided Deep Learning for Consecutively Missing Seismic Data Reconstruction", IEEE TGRS, 2022. DOI: 10.1109/TGRS.2021.3068279
