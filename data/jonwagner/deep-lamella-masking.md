# Jonwagner/deep-lamella-masking

## Resumen

Deep Lamella Masking es un modelo de segmentación 3D desarrollado por Jonwagner para identificar y enmascarar láminas (lamellae) en volúmenes de criotomografía electrónica (cryo-ET). El modelo resuelve un problema específico de la criomicroscopía electrónica: segmentar automáticamente las láminas ultrafinas en tomogramas y, opcionalmente, ajustar dos planos límite para producir una máscara de losa (slab mask) que delimite la región de interés. Es relevante para investigadores que necesitan automatizar el análisis de tomogramas y reducir la intervención manual en el control de calidad.

La arquitectura es un UNet 3D con 12.861.646 parámetros, canales progresivos [32, 64, 128, 256, 320] y parches de entrada de 160 × 160 × 160 vóxeles, con una resolución objetivo de 20 Å (2 nm). El modelo se distribuye bajo licencia MIT como checkpoint de PyTorch (formato .ckpt) y está disponible en Hugging Face. Se encuentra en fase de release candidate (v0.9), con métricas de validación internas pero sin resultados oficiales de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet 3D con unidades residuales |
| Parametros totales | 12.861.646 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de segmentacion 3D) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | Checkpoint PyTorch (.ckpt) |

## Arquitectura y entrenamiento

El modelo es un UNet 3D con codificador y decodificador basados en unidades residuales (2 unidades por nivel). Los canales de las características son [32, 64, 128, 256, 320] y los strides de downsampling son [2, 2, 2, 2]. La entrada y la salida son de 1 canal cada una, y el tamaño de parche es de 160 × 160 × 160 vóxeles. El artefacto distribuido es `unet_best_20260512_valdice0.969_v2.ckpt`, con hash SHA-256 `520e32077ea3159354e4f7d80bd91f1cb77994320eaf4e2e9fc19652470a6edd`.

Según la procedencia histórica del entrenamiento, el conjunto de datos se dividió en 1.752 volúmenes de entrenamiento, 218 de validación y 228 de test (archivo `manifest_80_10_10.json`). El checkpoint seleccionado corresponde a la época 1339, con una métrica de Dice de validación de 0.969. El preprocesamiento normaliza los tomogramas MRC a media cero y varianza unitaria, y los remuestrea a la resolución objetivo de 20 Å. No se mencionan técnicas de RLHF ni DPO, al tratarse de un modelo de visión. La arquitectura se reconstruyó a partir de los valores por defecto del registro durante la exportación, ya que el artefacto original no registraba los argumentos de arquitectura.

## Capacidades

- Segmentacion 3D de laminas en tomogramas de criotomografia electronica.
- Ajuste opcional de dos planos limite para generar una mascara de losa (slab mask).
- Generacion de probabilidades, mascaras, geometria y informes de control de calidad.
- Inspeccion y correccion de ajustes marcados mediante la herramienta `dlm review`.
- Procesamiento de tomogramas MRC sin procesar o volúmenes Zarr preprocesados.
- Remuestreo y normalizacion automaticos a la resolucion objetivo de 20 Å.
- Prediccion por parches con solapamiento del 50% y combinacion gaussiana.
- No es un modelo de lenguaje; no soporta tool calling, generacion de texto ni razonamiento simbolico.

## Casos de uso

- Segmentacion automatizada de laminas en tomogramas de criomicroscopia: el modelo procesa tomogramas MRC completos y devuelve probabilidades por voxel, lo que permite identificar la lamella sin intervencion manual.
- Generacion de mascaras de losa para analisis posteriores: los planos ajustados definen una region de interes que puede usarse para limitar el analisis de estructuras dentro de la lamina.
- Control de calidad en pipelines de tomografia: los informes de calidad generados permiten detectar ajustes de plano deficientes y decidir si una muestra debe descartarse o reanalizarse.
- Revision manual asistida: los ajustes marcados como dudosos pueden inspeccionarse y corregirse con `dlm review`, facilitando la validacion por parte de investigadores.
- Integracion en flujos de trabajo de procesamiento de imagenes con PyTorch: el CLI `dlm predict` permite procesar directorios completos de tomogramas y guardar resultados en un formato estructurado.
- Investigacion en criomicroscopia electronica para preparacion de muestras: la segmentacion de laminas ultrafinas es util para evaluar la calidad de la muestra antes de la adquisicion de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks oficiales en la informacion disponible. El model card incluye metricas internas historicas que no deben interpretarse como estimaciones imparciales de generalizacion:

| Metrica | Valor | Nota |
|---|---|---|
| Dice de validacion (seleccion de epoca) | 0.969 | Metrica de entrenamiento, no un resultado de test completo |
| Dice medio de slab en test (experimentos historicos) | 0.9614 | El test split influyo en la seleccion de metodo; no es una estimacion imparcial |

Los resultados de release-tag (Dice/IoU de validacion y test, inferencia en tomogramas MRC no vistos) estan pendientes.

## Requisitos de hardware

No se proporcionan requisitos de VRAM en la documentacion. El modelo es un UNet 3D de 12,86 millones de parametros, por lo que el peso en FP32 ocupa aproximadamente 51,5 MB. La memoria necesaria para la inferencia depende del tamano del tomograma y del solapamiento de parches. El CLI `dlm predict` acepta el argumento `inference.device_ids=[0]`, lo que indica que puede ejecutarse en GPU. No se especifican modelos de GPU recomendados, latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos equivalentes de segmentacion de laminas en criotomografia electronica con los que comparar en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta en version release candidate (v0.9); no es una version estable.
- La metrica de validacion 0.969 es una metrica de seleccion de epoca, no una estimacion del rendimiento en datos no vistos.
- El test split influyo en la seleccion de metodo, por lo que los resultados de test no deben presentarse como una estimacion imparcial de generalizacion.
- Los planos limite pueden estar desplazados respecto a la lamella, segun el model card.
- Los recuentos de datos de entrenamiento son historicos y no proceden de una auditoria fresca del conjunto de datos de release.
- La reproducibilidad del entrenamiento es estadistica; no se promete equivalencia bit a bit.
- El modelo no soporta generacion de texto, tool calling ni razonamiento simbolico.
- La licencia MIT permite uso comercial, pero la licencia de los datos de entrenamiento no se ha confirmado.

## Enlaces

- Hugging Face: https://huggingface.co/Jonwagner/deep-lamella-masking
- Procedencia del post-procesamiento: https://github.com/jowagner91/deep_lammela_masking/blob/2c0584bf1fb12cad182487c2fb3576bb026ea182/docs/POSTPROCESSING_PROVENANCE.md
- Nota sobre el dataset 6: https://github.com/jowagner91/deep_lammela_masking/blob/2c0584bf1fb12cad182487c2fb3576bb026ea182/docs/DATASET_6.md
- Repositorio de referencia (commit `50b208b315a0a1ddc70c25ed58e34de3a7d48fa8`): https://github.com/jowagner91/deep_lammela_masking
