# FatimahEmadEldin/leo-uav-flair-experiments

## Resumen

Este repositorio, desarrollado por Fatimah Emad Eldin, recopila nueve experimentos de extremo a extremo en cuadernos Colab para la fusión de imágenes de satélite LEO (Sentinel-2) y UAV (aéreas) sobre el dataset FLAIR-HUB. Aborda dos tareas: segmentación semántica de usos del suelo y mejora de resolución (super-resolución) en múltiples factores de escala. Su relevancia radica en que propone un mecanismo de fusión cross-scale con presupuesto computacional ajustado a una Tesla T4, frente al benchmark de referencia que emplea 89,4 millones de parámetros y unas 20 GPU V100/A100/H100.

El repositorio incluye un tracker de experimentos en Excel, definiciones canónicas de clases, y una estructura de carpetas que separa las dos tareas con diferentes backbones (UNet, ResNet, ConvNeXt, Swin Transformer, RCAN, SwinIR y difusión condicional). El objetivo declarado es superar la ganancia de +0,6 mIoU que FLAIR-HUB obtiene al añadir Sentinel-2 a la imagen aérea, pero con un presupuesto de hardware mucho menor. No se trata de un modelo único desplegable, sino de un conjunto de experimentos reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multiples: UNet, ResNet, ConvNeXt, Swin Transformer, RCAN, SwinIR, difusion condicional |
| Parametros totales | no disponible (el benchmark de referencia usa 89,4 M, pero no es el modelo en si) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | no disponible (los checkpoints se alojan en un repositorio separado) |

## Arquitectura y entrenamiento

El repositorio contiene experimentos con varias arquitecturas de segmentacion y super-resolucion. Para segmentacion se evaluan UNet, ResNet, ConvNeXt y Swin Transformer como backbones, con tres estrategias de fusion: linea base de un solo flujo, fusion temprana por concatenacion (control) y atencion cross-scale (la propuesta principal). Para super-resolucion se emplean RCAN (atencion por canales), SwinIR (transformers) y una familia de perdidas de difusion condicional.

Los datos provienen de FLAIR-HUB, repackados en dos formatos: parquet de 128 px (0,90 GB, configuracion por defecto para T4) y de 256 px (1,94 GB, para A100). En total son 24.475 tiles, 9 dominios franceses y mas de 257 sectores. El entrenamiento se realiza con parches de 128 px en T4, con un pico de RAM de un solo lote gracias al uso de archivos mapeados en memoria. Las etiquetas se almacenan como COSIA 0-18 y el conjunto de clases es una tabla de consulta en tiempo de entrenamiento.

## Capacidades

- Segmentacion semantica multiclase de usos del suelo (6 clases en el conjunto principal, con variantes de 5 y 4 clases).
- Super-resolucion de imagenes con factores de 6,4x (Sentinel-2 a SPOT), 4x (SPOT a aerea) y 25,6x (Sentinel-2 a aerea).
- Fusion de imagenes multiespectrales (Sentinel-2 con bandas de red-edge y SWIR) con RGB aereo.
- Ablacion de conjuntos de clases para aislar el efecto de la fusion en clases especificas (coniferas, agua, suelo desnudo, etc.).
- Entrenamiento reproducible en hardware de gama baja (T4) mediante empaquetado de parches y streaming de shards.
- Soporte de difusion condicional como familia de perdidas para mejora de resolucion.

## Casos de uso

- Cartografia de usos del suelo a escala regional: el modelo puede segmentar imagenes aereas y satelitales fusionadas para producir mapas de cobertura terrestre con 6 clases, aprovechando la informacion espectral adicional de Sentinel-2 para separar clases visualmente similares en RGB.
- Monitorizacion forestal: la ganancia medida de +26,4 IoU en coniferas demuestra que la fusion con bandas de red-edge y SWIR permite distinguir coniferas de frondosas, algo imposible con solo RGB de verano. Util para inventarios forestales y deteccion de plagas.
- Agricultura de precision: la separacion de cultivos herbaceos y suelo desnudo (+10,2 IoU) permite identificar parcelas en barbecho o con estres hidrico, integrable en sistemas de recomendacion de riego.
- Gestion de emergencias: la super-resolucion de Sentinel-2 a resolucion aerea (25,6x) puede generar imagenes de alta resolucion en zonas donde no hay vuelos UAV disponibles, util para evaluacion de danos tras desastres.
- Planificacion urbana: la segmentacion de clases como agua y suelo desnudo ayuda a mapear riesgos de inundacion o erosion, con la ventaja de que el modelo funciona en T4, accesible para ayuntamientos con presupuesto limitado.
- Investigacion en fusion de sensores: el repositorio sirve como banco de pruebas para comparar mecanismos de fusion (concatenacion vs. atencion cross-scale) con presupuesto controlado, permitiendo a otros investigadores reproducir y extender los experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks propios en la informacion disponible. El repositorio menciona el benchmark de FLAIR-HUB como referencia a superar: una ganancia de +0,6 mIoU al anadir Sentinel-2 a la imagen aerea (LC-A 64,1 a LC-D 64,7) con 89,4 M de parametros, 152.225 parches y unas 20 GPU. El autor declara explicitamente que no alcanza ese 64,1 absoluto con hardware T4 y que su contribucion es sobre el mecanismo de fusion con presupuesto ajustado. No se proporcionan metricas propias (mIoU, PSNR, SSIM) en la model card.

## Requisitos de hardware

- Colab gratuito (T4, 12,7 GB RAM): funciona con la configuracion por defecto `PACK = "t4"` (parches de 128 px, 0,90 GB).
- Colab Pro (A100 o L4): se recomienda `PACK = "full"` con parches de 256 px.
- Local con 16 GB RAM y 6 GB de VRAM: compatible.
- Local con 8 GB RAM: requiere reducir el numero de dominios a 3-4.
- CPU exclusivamente: no soportado (se estiman unas 40 horas por ejecucion).
- El pico de RAM se limita a un lote gracias al streaming de shards a archivos mapeados en memoria, evitando el OOM que sufria la version anterior.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (fusion de imagenes satelitales y aereas con presupuesto reducido). El unico punto de referencia es FLAIR-HUB, que emplea concatenacion tras upsampling con 89,4 M de parametros y 20 GPU, pero no es un modelo directamente comparable en requisitos de hardware. No se puede establecer una tabla comparativa sin datos adicionales.

## Limitaciones y advertencias

- No es un modelo listo para produccion: es un conjunto de experimentos con cuadernos Colab, no un artefacto desplegable con pesos finales consolidados.
- La licencia no esta especificada, por lo que el uso comercial es incierto hasta que el autor la defina.
- Los resultados dependen del empaquetado de datos: reducir el numero de clases no reduce el uso de memoria ni el tamano de descarga, y puede enmascarar el valor real de la fusion (el conjunto `thematic4` puntua mas alto por ser una tarea mas facil, no por ser mejor modelo).
- El benchmark de referencia (64,1 mIoU) no es alcanzable con T4; el autor no lo reclama, pero quien busque ese rendimiento absoluto debe considerar hardware superior.
- Riesgo de alucinacion no aplica al ser un modelo discriminativo de vision, pero si hay riesgo de errores de segmentacion en clases con confusion espectral (p. ej., coniferas vs. frondosas en RGB de verano).
- Los datos se limitan a 9 dominios franceses; la generalizacion a otras regiones o estaciones no esta validada.

## Enlaces

- Repositorio principal: https://huggingface.co/FatimahEmadEldin/leo-uav-flair-experiments
- Checkpoints y documentacion por ejecucion: https://huggingface.co/FatimahEmadEldin/leo-uav-fusion-checkpoints
- Dataset de parches de 128 px: https://huggingface.co/datasets/FatimahEmadEldin/flair-multidomain-parquet-128
- Dataset de parches de 256 px: https://huggingface.co/datasets/FatimahEmadEldin/flair-multidomain-parquet
- Dataset original FLAIR-HUB: https://huggingface.co/datasets/IGNF/FLAIR-HUB
- Paper de FLAIR-HUB: https://arxiv.org/abs/2506.07080
- Gist del entrenador de segmentacion (revisiones): https://gist.github.com/astral-fate/9cacb26a3d0a2adbd2b34cd45da08ce7/revisions
- Gist del entrenador de super-resolucion (revisiones): https://gist.github.com/astral-fate/e83cc95fdabfe4cef6cf3dfdc53fbe23/revisions
