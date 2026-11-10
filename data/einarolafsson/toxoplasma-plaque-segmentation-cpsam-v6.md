# einarolafsson/toxoplasma-plaque-segmentation-cpsam-v6

## Resumen

Toxoplasma Plaque v6 es un modelo de segmentación de imágenes especializado en la detección y delineado de placas de *Toxoplasma gondii* en ensayos de placa teñidos con violeta cristal. Lo desarrolla el usuario de Hugging Face `einarolafsson` como parte del model zoo de spaCR, una herramienta de análisis de imágenes de microscopía. El modelo resuelve un problema concreto de laboratorio: la cuantificación automática de placas en pocillos de ensayo, incluidas las placas pequeñas (menos de 5 px de diámetro equivalente), que los modelos genéricos de segmentación celular no detectan de forma fiable.

Técnicamente es un ajuste fino de Cellpose-SAM (concretamente del checkpoint `cpsam_v2`, del proyecto `mouseland/cellpose-sam`), por lo que hereda la arquitectura de Cellpose-SAM para segmentación de instancias en microscopía. El modelo se distribuye como pesos de Cellpose (1,2 GB en el repositorio) y se usa dentro del pipeline de spaCR, que incluye un detector de pocillos YOLO v4 y un preprocesado específico (recorte, redimensionado a lado largo 1500 px con factor de ampliación máximo 6x y escalado de intensidad por percentiles 1/99).

Su relevancia es doble: por un lado, demuestra una mejora sustancial frente al modelo base sin ajuste (F1 de objetos de 0,768 frente a 0,294 en el mismo conjunto de test), y por otro ilustra un patrón habitual en bioimagen: un modelo fundacional genérico más un ajuste fino con datos de dominio supera ampliamente al modelo genérico sin entrenamiento específico. La versión v6 fue el modelo por defecto del model zoo de spaCR entre el 25 de octubre y el 10 de noviembre de 2026, sustituida por `toxoplasma_plaque_v9` pero todavía seleccionable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cellpose-SAM (ajuste fino de `cpsam_v2`), segmentación de instancias en microscopía |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (pesos Cellpose; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | pesos Cellpose (`weights/cpsam_plaque_v6`), repositorio de 1,2 GB |

## Arquitectura y entrenamiento

El modelo parte de `cpsam_v2`, el checkpoint de Cellpose-SAM para segmentación celular general, y se ajusta fino durante 100 épocas con muestreo equilibrado por dominio. El conjunto de entrenamiento consta de 1.196 campos curados procedentes de placas de laboratorio Gel Doc, placas de laboratorio, figuras publicadas y rondas de curación anteriores, con 164 campos reservados para validación. Cada pocillo se redimensiona a 1500 px (con factor de ampliación máximo de 6x) y los campos con placas de menos de 10 px se muestrean el doble de a menudo para compensar el desequilibrio de tamaños.

La inferencia se realiza con diámetro `None`, probabilidad celular de -0,5, umbral de flujo de 0,4 (elegido solo sobre validación) y tamaño mínimo 0; los parámetros de flujo se escalan con `niter = max(200, ceil(200 x scale))`. Las máscaras se reasignan a los píxeles originales por vecino más cercano. El objetivo de validación (media de recall por debajo de 5 px, recall de 10 px o más y precisión) alcanzó su máximo en la época 25 (0,673) y fue de 0,651 en la época 100; el autor distribuye el checkpoint de la época 100 por decisión del mantenedor. El transformado de preprocesado está en `training/normalize.py` y declarado en `training/preprocess.json`; ejecutar los pesos sobre píxeles nativos no corresponde a la configuración evaluada.

## Capacidades

- Segmentación de instancias de placas de *Toxoplasma gondii* en pocillos teñidos con violeta cristal.
- Detección específica de placas pequeñas (diámetro equivalente inferior a 5 px), con recall de 0,43 frente a 0,06 del modelo base.
- Delineado de contornos con F1 de frontera de 0,781.
- Funcionamiento dentro del pipeline spaCR: detector de pocillos YOLO v4, recorte y redimensionado por regla, escalado de intensidad por percentiles.
- Salida de máscaras mapeadas a los píxeles originales del pocillo.
- No soporta tool calling, agentes, texto ni modalidades distintas de imagen.

## Casos de uso

- Cuantificación de ensayos de placa de *Toxoplasma gondii*: el modelo segmenta automáticamente las placas en pocillos teñidos con violeta cristal, permitiendo contar y medir placas de forma reproducible en lotes de placas de laboratorio, incluida la fracción de placas pequeñas que un modelo genérico omite.
- Análisis de imágenes de placas Gel Doc: con F1 de objetos de 0,76 en 24 campos de este origen, es adecuado para digitalizar y cuantificar placas capturadas con ese sistema de documentación.
- Procesamiento por lotes en pipelines de spaCR: al estar integrado en el model zoo de spaCR, se puede invocar como paso de segmentación dentro de un flujo que detecta pocillos con YOLO v4, recorta, redimensiona y segmenta.
- Comparación de condiciones experimentales: al producir máscaras por instancia y métricas de área, permite comparar tamaño y número de placas entre tratamientos o cepas en experimentos de virulencia o de fármacos.
- Reanálisis de figuras publicadas: el modelo se entrenó con figuras publicadas y obtiene F1 de 0,79 en 94 campos de ese origen, por lo que sirve para reextraer datos cuantitativos de imágenes de artículos.
- Detección de placas pequeñas en cribados: con recall de 0,43 en placas de menos de 5 px, es útil como primer paso de cribado para señalar pocillos con placas incipientes que requieren revisión manual.
- Control de calidad de segmentaciones previas: puede usarse para revisar y completar segmentaciones de rondas de curación anteriores (F1 de 0,67 en 13 campos de ese origen).

## Benchmarks y rendimiento

Resultados sobre 160 campos de test (21 sin placas; 6.182 placas curadas: 729 de menos de 5 px, 2.654 de 5 a 10 px y 2.799 de 10 px o más), nunca usados para entrenamiento, selección de checkpoint ni elección de umbrales. El control es `cpsam_v2` sin ajuste fino, con el mismo recorte y redimensionado y sus propios umbrales ajustados sobre validación.

| Metrica | Este modelo (v6) | Control: cpsam_v2 |
|---|---|---|
| Object F1 (IoU >= 0,5) | 0,768 | 0,294 |
| Boundary F1 | 0,781 | 0,303 |
| Precision | 0,777 | 0,557 |
| Recall | 0,760 | 0,200 |
| AJI | 0,752 | 0,249 |
| Dice | 0,909 | 0,414 |

Por tamaño de placa (diámetro equivalente en píxeles originales):

| Tamano | Placas curadas | Recall, este | Recall, control | Precision, este | Precision, control | Object F1, este | Object F1, control |
|---|---|---|---|---|---|---|---|
| Menos de 5 px | 729 | 0,43 | 0,06 | 0,50 | 0,17 | 0,47 | 0,09 |
| 5 a 10 px | 2.654 | 0,80 | 0,16 | 0,78 | 0,71 | 0,79 | 0,26 |
| 10 px o mas | 2.799 | 0,81 | 0,27 | 0,83 | 0,58 | 0,82 | 0,37 |
| Todas | 6.182 | 0,76 | 0,20 | 0,78 | 0,56 | 0,77 | 0,29 |

Por origen de los datos (Object F1, este frente a control): figuras publicadas 0,79 frente a 0,36 (94 campos); placas Gel Doc 0,76 frente a 0,03 (24 campos); rondas de curación anteriores 0,67 frente a 0,36 (13 campos); placas de laboratorio (malnio) 0,66 frente a 0,05 (9 campos); placas de laboratorio (patrick) 0,91 frente a 0,31 (7 campos); placas de laboratorio (bigbean) 0,90 frente a 0,31 (6 campos); Gel Doc con placas nuevas 0,28 frente a 0,00 (6 campos); segmentaciones anteriores 0,77 frente a 0,00 (1 campo). El fichero `qc/scorecard_vs_stock.json` contiene intervalos bootstrap del 95 %, diferencias pareadas y una segunda referencia: `cpsam_v2` sobre píxeles nativos (diámetro 30, flujo 0,4, probabilidad celular 0), con Object F1 de 0,054.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio de pesos ocupa 1,2 GB.
- GPU recomendadas: no disponible. El modelo se ejecuta mediante Cellpose, que soporta CPU y GPU; para lotes grandes de campos de 1500 px se recomienda una GPU con memoria suficiente, pero el autor no publica cifras.
- Cabe en GPU de consumo: no confirmado por el autor; el tamaño de pesos (1,2 GB) es compatible con GPUs de consumo, pero no se documenta el consumo de memoria en inferencia.
- Opciones de despliegue: Cellpose (librería Python) con los pesos `weights/cpsam_plaque_v6`; integración en el pipeline de spaCR (detector de pocillos YOLO v4, preprocesado propio). No se documentan exportaciones a ONNX, TensorRT ni otros runtimes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Object F1 (mismos campos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| toxoplasma_plaque_v6 | Cellpose-SAM (`cpsam_v2`) | no disponible | no aplica | 0,768 | CC-BY-4.0 | Hugging Face |
| cpsam_v2 (stock) | Cellpose-SAM | no disponible | no aplica | 0,294 | no disponible en la informacion | Hugging Face (`mouseland/cellpose-sam`) |
| toxoplasma_plaque_v9 | Cellpose-SAM | no disponible | no aplica | no disponible | no disponible en la informacion | Hugging Face / spaCR |

La comparación directa con `cpsam_v2` es la única con datos cuantitativos en la misma configuración. `toxoplasma_plaque_v9` sustituyó a v6 como modelo por defecto del model zoo de spaCR, pero no se han proporcionado sus métricas.

## Limitaciones y advertencias

- El modelo solo segmenta placas de *Toxoplasma gondii* en ensayos de placa teñidos con violeta cristal; no es un modelo general de segmentación celular.
- El rendimiento cae en placas pequeñas: recall de 0,43 y precisión de 0,50 por debajo de 5 px, frente a 0,80-0,81 en placas de 5 px o más.
- El rendimiento es muy variable según el origen: F1 de 0,28 en placas Gel Doc nuevas frente a 0,91 en placas de laboratorio (patrick), lo que indica sensibilidad a cambios de protocolo o de captura.
- Requiere el preprocesado exacto del pipeline (redimensionado a lado largo 1500 px, factor máximo 6x, escalado por percentiles 1/99); ejecutar los pesos sobre píxeles nativos no es la configuración evaluada y degrada el resultado (el control sobre píxeles nativos obtiene F1 de 0,054).
- Los umbrales de inferencia (probabilidad celular -0,5, flujo 0,4) se eligieron sobre validación; cambiarlos altera los resultados reportados.
- El checkpoint distribuido es el de la época 100, con objetivo de validación de 0,651, inferior al máximo de la época 25 (0,673); es una decisión del mantenedor, no el mejor checkpoint según validación.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero exige citar al autor y mantener la licencia en obras derivadas.
- Riesgo de falsos positivos y de fragmentación de placas en imágenes con ruido o tinción irregular; no se documentan métricas de calibración ni análisis de sesgo más allá del desglose por origen y tamaño.
- No se documentan requisitos de memoria, latencia ni compatibilidad con otros runtimes, lo que dificulta planificar despliegues en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/einarolafsson/toxoplasma-plaque-segmentation-cpsam-v6
- Modelo base `cpsam_v2` (Cellpose-SAM): https://huggingface.co/mouseland/cellpose-sam/blob/main/cpsam_v2
- Repositorio spaCR: https://github.com/EinarOlafsson/spacr
