# maulnite/foot-ulcer-segmentation-weights

## Resumen

`maulnite/foot-ulcer-segmentation-weights` es un repositorio de checkpoints de investigación para segmentación de úlceras de pie (foot ulcer segmentation), no un modelo único entrenado y publicado con una model card convencional. Lo mantiene el usuario maulnite y recoge los pesos originales de dos líneas de experimentos denominadas Orie y Ganta, basadas en la arquitectura FUSegNet con backbone EfficientNet, según la referencia al paper de Dhar et al. (arXiv:2305.02961). El repositorio se publica sin reentrenamiento, sin conversión de pesos y sin selección posterior de modelos.

El interés del artefacto es fundamentalmente de reproducibilidad: agrupa 171 rutas de checkpoint (134 de Orie y 37 de Ganta), con un tamaño lógico de 119,52 GiB y 141 contenidos únicos gracias a la deduplicación del Hub. Incluye catálogo, índice legible por máquina, sumas SHA256, snapshots de código fuente y lockfiles, además de informes y auditorías. La model card advierte explícitamente de que el estado de subida está en curso y de que la verificación remota está pendiente.

No se trata de un modelo listo para producción ni de un servicio de inferencia: es un archivo de pesos en formato PyTorch nativo, orientado a investigadores que quieran reproducir o auditar experimentos de segmentación de heridas. No hay validación clínica declarada, ni licencia nueva establecida por el archivo, ni datos de pacientes incluidos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FUSegNet con backbone EfficientNet (según tags y referencia al paper) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de segmentación de imágenes) |
| Tipos de cuantización | no disponible (se conservan pesos PyTorch originales) |
| Idiomas soportados | en, id (etiquetas de la model card) |
| Licencia | no disponible (el archivo no establece licencia nueva; se remite a las condiciones de las fuentes originales) |
| Formato de pesos | PyTorch nativo (`.pth`, `best.pth`, `best_model*.pth`, `last.pth`, `stage1_coarse.pth`, `stage2_refiner.pth`) |
| Pipeline | image-segmentation |
| Librería | pytorch |
| Tamaño del repositorio | 108,3 GB (tamaño lógico declarado: 119,52 GiB; 141 contenidos únicos) |
| Número de checkpoints | 171 rutas (Orie 134, Ganta 37) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura de referencia es FUSegNet, una red de segmentación semántica de imágenes construida sobre un backbone EfficientNet, según los tags del repositorio y la cita al paper de Dhar et al. (arXiv:2305.02961). El repositorio no documenta en la información disponible el número de parámetros, la resolución de entrada ni la composición exacta del dataset de entrenamiento. Los pesos se conservan en su formato PyTorch original, sin conversión ni reentrenamiento.

El contenido se organiza en dos linajes de experimentos. Orie se divide en CP1 (16 checkpoints) y CP2 (118 checkpoints); Ganta se divide en FUSeg 2021 (26 checkpoints) y Chronic Wound (11 checkpoints). El protocolo principal de CP2 emplea una partición train671 / validation118 / test261 agrupada por RGB idéntico, no por paciente, lo que la model card señala como una diferencia relevante frente a otros protocolos. Ganta incluye un esquema en cascada con `stage1_coarse.pth` y `stage2_refiner.pth`, que deben usarse conjuntamente; la cascada CP2 combina un coarse B1 con el refiner CP2 según la receta documentada. Los cinco folds de x-FUSegNet se conservan separados y no como un ensamble ya fusionado. El repositorio incluye 45 checkpoints de smoke test y 11 inicializadores etiquetados explícitamente, que no constituyen resultados de evaluación.

## Capacidades

- Segmentación de imágenes de úlceras de pie y heridas crónicas, con salida de máscara a nivel de píxel.
- Segmentación en cascada mediante coarse stage y refiner (Ganta y CP2).
- Validación cruzada con cinco folds independientes para x-FUSegNet.
- Reanudación de entrenamiento: algunos checkpoints incluyen `state_dict`, optimizer, scheduler, RNG e historial.
- Auditoría de integridad mediante `SHA256SUMS.txt` y catálogo `CATALOG.md`.
- Índice legible por máquina (`model-index.json`) para seleccionar contenedores de pesos.
- Reproducibilidad de entorno mediante snapshots de código y lockfiles (Orie: torch 1.11.0+cu113 y fork propio de Segmentation Models PyTorch).
- No soporta tool calling, agentes, razonamiento multi-step, texto generativo, visión general, audio ni modo thinking.

## Casos de uso

- Reproducción de experimentos académicos: descarga selectiva de checkpoints concretos (por ejemplo, `orie/cp2/phase_p/*/B1/best.pth`) para reejecutar la evaluación reportada en `evidence/orie/reports` y contrastar métricas.
- Auditoría de integridad de pesos: verificación con `sha256sum --ignore-missing -c SHA256SUMS.txt` para garantizar que los checkpoints no se han alterado respecto al snapshot original.
- Investigación en segmentación de heridas: uso de los pesos como línea base para comparar nuevas arquitecturas o funciones de pérdida sobre los mismos protocolos de partición.
- Estudio de estrategias en cascada: análisis comparativo entre el coarse stage y el refiner de Ganta y CP2 para evaluar la ganancia de la segunda etapa.
- Análisis de robustez entre protocolos: comparación de resultados entre la partición por RGB idéntico de CP2 y los protocolos de CP1-matched, x-FUSegNet y Ganta, advirtiendo que no deben rankearse como un único benchmark.
- Reanudación de entrenamiento en investigación: uso de checkpoints con optimizer y scheduler para continuar experimentos, siempre cargando con `torch.load(..., map_location='cpu')` sobre archivos de confianza.
- Docencia y formación: material para prácticas de segmentación médica con pesos reales y trazabilidad documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a `evidence/orie/reports` y `evidence/ganta` para métricas y auditorías, pero no incluye cifras concretas (Dice, IoU, etc.) en el texto proporcionado. Además, advierte explícitamente de que no debe rankearse todo el archivo como un único benchmark, dado que los protocolos de evaluación difieren entre CP2, CP1-matched, x-FUSegNet y Ganta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del tamaño concreto de FUSegNet/EfficientNet elegido entre los 171 checkpoints.
- GPU recomendadas: no disponible. Al tratarse de un modelo de segmentación de imágenes con backbone EfficientNet, es esperable que quepa en GPUs de consumo, pero no se confirma en la documentación.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de segmentación). La carga se realiza con PyTorch (`torch.load`) seleccionando el contenedor descrito en `model-index.json`.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio completo ocupa 108,3 GB; conviene descarga selectiva por fichero para evitar transferir el archivo entero.

## Comparativa con modelos similares

| Modelo | Tipo | Arquitectura | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| maulnite/foot-ulcer-segmentation-weights | Checkpoints de investigación | FUSegNet + EfficientNet | Imagen (resolución no disponible) | no disponible | Hugging Face, 171 checkpoints |
| FUSegNet (Dhar et al.) | Modelo de referencia publicado | FUSegNet + EfficientNet | Imagen | según repositorio original (no indicada aquí) | Paper arXiv:2305.02961 y código en GitHub |
| Segmentation Models PyTorch (SMP) | Librería de arquitecturas | Múltiples (U-Net, FPN, etc.) | Imagen | según proyecto SMP | Repositorio público |

La comparación con alternativas específicas de segmentación de úlceras de pie más allá de FUSegNet no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Estado de subida en curso: la model card indica "UPLOAD IN PROGRESS — inventory prepared; remote verification pending".
- Sin validación clínica: el propio autor declara que no hay ninguna afirmación de validación clínica; no debe usarse en decisiones médicas.
- Sin licencia nueva: el archivo no establece licencia para los pesos ni para los datasets; deben respetarse las condiciones de las fuentes originales (FUSegNet, SMP, EfficientNet).
- Partición no patient-level en CP2: el split se agrupa por RGB idéntico, lo que puede inflar métricas frente a una separación por paciente.
- Heterogeneidad de protocolos: CP1-matched, x-FUSegNet y Ganta usan protocolos distintos; no deben rankearse conjuntamente como un único benchmark.
- Test/external ya explorados: no constituyen una cohorte confirmatoria intacta.
- Checkpoints no equivalen a resultados: la existencia de un checkpoint no demuestra que el plan de entrenamiento se completara; hay runs antiguos o parciales de Ganta archivados.
- Riesgo de ejecución de código: la model card advierte de no importar entrypoints de entrenamiento para inferencia, ya que pueden disparar entrenamiento.
- Carga insegura: `torch.load` puede ejecutar código; usar únicamente con archivos de confianza y `map_location='cpu'`.
- Diferencias de entorno: Orie y Ganta usan entornos distintos (torch 1.11.0+cu113 y fork de SMP en Orie); la reconstrucción completa de dependencias históricas no está garantizada.
- Convenciones de epoch distintas entre runners: no deben interpretarse los epochs de forma directa, sino a través de los informes asociados.
- Idiomas: las etiquetas en/id se refieren a la documentación, no a capacidades lingüísticas del modelo (es un modelo de visión).
- Sin datos de pacientes ni datasets incluidos: el archivo contiene solo pesos y material de reproducibilidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/maulnite/foot-ulcer-segmentation-weights
- Catálogo de checkpoints: https://huggingface.co/maulnite/foot-ulcer-segmentation-weights/blob/main/CATALOG.md
- Índice legible por máquina: https://huggingface.co/maulnite/foot-ulcer-segmentation-weights/blob/main/model-index.json
- Sumas de integridad: https://huggingface.co/maulnite/foot-ulcer-segmentation-weights/blob/main/SHA256SUMS.txt
- Recetas: https://huggingface.co/maulnite/foot-ulcer-segmentation-weights/blob/main/RECIPES.md
- Carpeta Orie CP1: https://huggingface.co/maulnite/foot-ulcer-segmentation-weights/tree/main/orie/cp1
- Carpeta Orie CP2: https://huggingface.co/maulnite/foot-ulcer-segmentation-weights/tree/main/orie/cp2
- Carpeta Ganta FUSeg 2021: https://huggingface.co/maulnite/foot-ulcer-segmentation-weights/tree/main/ganta/fuseg-2021
- Carpeta Ganta Chronic Wound: https://huggingface.co/maulnite/foot-ulcer-segmentation-weights/tree/main/ganta/chronic-wound
- Paper FUSegNet: https://arxiv.org/abs/2305.02961
- Código original FUSegNet: https://github.com/mrinal054/FUSegNet
- Repositorio de investigación del autor: https://github.com/maulnite/foot-ulcer-segmentation
