# Podtyazhki1337/cytonucs-baselines

## Resumen

`cytonucs-baselines` es una colección de modelos de segmentación de instancias para imagen biomédica de microscopía, publicada por el usuario Podtyazhki1337 como material de comparación del artículo CytoNucs. No es un modelo de lenguaje: agrupa los pesos entrenados de cuatro familias de referencia (StarDist, HydraStarDist, Cellpose 3 e InstanSeg) más un modelo nnU-Net v2, todos reentrenados sobre los mismos splits que los modelos CytoNucs para permitir una comparación controlada.

El objetivo es doble: segmentar núcleos (estructura interna) y células (estructura externa) en imágenes 2D y 3D, y servir como línea base reproducible frente a la propuesta CytoNucs. Cada carpeta contiene los pesos de un método concreto para un dataset concreto (TissueNet, HeLaCytoNuc limpio, BBBC020 y KiTS23), con dos niveles de predicción —núcleo y citoplasma— y una métrica de vinculación (linked JTPR) entre ambas máscaras.

El repositorio ocupa 1,8 GB y se distribuye con licencia de investigación. Su relevancia es metodológica: ofrece pesos y scripts de puntuación para reproducir una tabla comparativa de segmentación celular, algo poco habitual en el ecosistema de modelos biomédicos, donde los baselines rara vez se publican con los mismos presupuestos de entrenamiento que el método propuesto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No es un único modelo: StarDist (polígonos en estrella), HydraStarDist, Cellpose 3 (flujo y difusión), InstanSeg (CNN de instancias) y nnU-Net v2 (3d_fullres) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión, no de texto) |
| Tipos de cuantización | No disponible; se distribuyen pesos en precisión de entrenamiento (`.pth`, TorchScript, checkpoints nnU-Net) |
| Idiomas soportados | No aplica |
| Licencia | `other` / `cytonucs-baselines`: pesos para investigación; los modelos entrenados sobre TissueNet y KiTS23 heredan sus términos no comerciales |
| Formato de pesos | Pesos PyTorch (`.pth`), TorchScript (`instanseg.pt`), checkpoints nnU-Net v2, `training.json` con hiperparámetros por nivel |
| Tamaño del repositorio | 1,8 GB |
| Modalidad | Imagen de microscopía 2D y 3D (segmentación de instancias) |
| Niveles de predicción | Núcleo (inner) y célula/citoplasma (outer), con vinculación entre ambos |

## Arquitectura y entrenamiento

El paquete reúne cinco linajes arquitectónicos distintos. StarDist predice polígonos en forma de estrella por instancia y se entrena con un modelo independiente por nivel (núcleo y citoplasma); HydraStarDist extiende ese enfoque con cabezas múltiples y, en la variante `hsd_wbr_helacytonuc_clean`, incorpora una versión diferenciable de watershed basado en marcadores (WBR). Cellpose 3 se afina por transferencia desde sus pesos preentrenados, con diámetro y umbrales de `cellprob`/flujo seleccionados sobre validación y guardados en `training.json`. InstanSeg se entrena desde cero, con una variante `instanseg_bbbc020_px4` sobre imágenes reducidas 4× (`--pixel-size 0.125`). nnU-Net v2 se ejecuta en configuración `3d_fullres`, fold 0, para riñón, tumor y quiste, convirtiendo la salida semántica en instancias con la regla de CytoNucs.

Todos los baselines se entrenaron con los mismos splits que CytoNucs, y en el caso de StarDist se comparan dos recetas: la receta por defecto y el presupuesto de recortes (crop budget) de CytoNucs (`sd_e7_*`). No se documentan en la información disponible el número de tokens, la composición detallada de los datasets ni si hubo aumento de datos más allá de lo implícito en cada receta. Las puntuaciones de test se calculan con `score_predictions.py` sobre el split de test de cada dataset.

## Capacidades

- Segmentación de instancias de núcleos en imágenes 2D de microscopía (StarDist, Cellpose, InstanSeg).
- Segmentación de células completas o citoplasma como segundo nivel, con vinculación núcleo-célula mediante linked JTPR.
- Segmentación 3D de estructuras renales (riñón, tumor, quiste) con nnU-Net v2 y Cellpose 3D y StarDist 3D sobre KiTS23.
- Predicción por parches con tamaño configurable (`--patch 256 256` en StarDist).
- Exportación a TorchScript en el caso de InstanSeg (`instanseg.pt`), lo que permite inferencia sin el código de entrenamiento.
- Puntuación integrada de predicciones (`--score`) y scripts de ejecución por método con opciones documentadas vía `--help`.
- Soporte de canales de entrada configurables por dataset (por ejemplo, `--cell-channels 3 2 --nucleus-channel 2` en TissueNet para Cellpose).
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingües ni modo de pensamiento: es exclusivamente un conjunto de modelos de visión.

## Casos de uso

- Comparación de métodos de segmentación en un artículo: los pesos permiten reproducir la tabla de baselines del paper CytoNucs con los mismos splits y el mismo script de puntuación, sin reentrenar.
- Segmentación de núcleos en imágenes de tejido (TissueNet): usar `stardist/sd_e7_tissuenet_nucleus` o `instanseg/instanseg_tissuenet` para obtener máscaras de núcleo con AP en torno a 0,63 y evaluar el pipeline sobre datos propios.
- Segmentación celular completa en cultivos HeLa: `cellpose/cp_helacytonuc_clean` ofrece un modelo afinado con diámetro y umbrales ya calibrados sobre validación, adecuado para lotes de imágenes de HeLaCytoNuc.
- Segmentación 3D de riñón y tumor en TC: `nnunet/Dataset501_KiTSCytoNucs` con `nnUNetv2_predict -d 501 -c 3d_fullres -f 0` y conversión posterior a instancias con `to_instances.py`, útil para volumetría tumoral.
- Detección de quistes renales: la misma salida semántica de nnU-Net, combinada con la regla de instancias de CytoNucs, permite separar quiste de parénquima y tumor en un mismo volumen.
- Evaluación de robustez a resolución: `instanseg/instanseg_bbbc020_px4` entrena sobre imágenes reducidas 4× y sirve para medir la caída de rendimiento al bajar la resolución del microscopio.
- Benchmark interno de nuevas arquitecturas: al estar todos los métodos reentrenados con el mismo presupuesto, cualquier modelo nuevo puede compararse contra esta tabla con un único comando de puntuación.
- Docencia y validación de pipelines: los scripts por método (`run_hsd.py`, `run_cellpose.py`, `run_instanseg.py`) permiten montar un flujo completo de descarga, inferencia y puntuación en un entorno reproducible.

## Benchmarks y rendimiento

Resultados de test publicados en la model card (AP núcleo / AP célula / linked JTPR):

| Carpeta | Método | Dataset | AP núcleo | AP célula | Linked JTPR |
|---|---|---|---|---|---|
| `stardist/sd_e7_tissuenet_*` | StarDist, crop budget CytoNucs | TissueNet | 0,629 | 0,512 | 0,837 |
| `stardist/sd_tissuenet_*` | StarDist, receta por defecto | TissueNet | 0,584 | 0,464 | 0,816 |
| `stardist/sd_e7_helacytonuc_clean_*` | StarDist, crop budget CytoNucs | HeLaCytoNuc limpio | 0,478 | 0,235 | 0,682 |
| `stardist/sd_helacytonuc_clean_*` | StarDist, receta por defecto | HeLaCytoNuc limpio | 0,477 | 0,253 | 0,702 |
| `stardist/sd_e7_bbbc020_*` | StarDist, crop budget CytoNucs | BBBC020 | 0,506 | 0,339 | 0,606 |
| `stardist/sd_bbbc020_*` | StarDist, receta por defecto | BBBC020 | 0,549 | 0,325 | 0,712 |
| `stardist/sd_kits_d4_*` | StarDist 3D | KiTS23 | 0,000 | 0,073 | 0,000 |
| `hydrastardist/hsd_tissuenet` | HydraStarDist | TissueNet | 0,642 | 0,515 | 0,839 |
| `hydrastardist/hsd_helacytonuc_clean` | HydraStarDist | HeLaCytoNuc limpio | 0,484 | 0,274 | 0,698 |
| `hydrastardist/hsd_wbr_helacytonuc_clean` | HydraStarDist + WBR diferenciable | HeLaCytoNuc limpio | 0,475 | 0,273 | 0,718 |
| `hydrastardist/hsd_bbbc020` | HydraStarDist | BBBC020 | 0,544 | 0,309 | 0,683 |
| `cellpose/cp_tissuenet` | Cellpose 3 afinado | TissueNet | 0,608 | 0,501 | 0,836 |
| `cellpose/cp_helacytonuc_clean` | Cellpose 3 afinado | HeLaCytoNuc limpio | 0,488 | 0,333 | 0,683 |
| `cellpose/cp_bbbc020` | Cellpose 3 afinado | BBBC020 | 0,577 | 0,562 | 0,885 |
| `cellpose/cp3d_kits` | Cellpose 3D afinado | KiTS23 | 0,014 | 0,151 | 0,144 |
| `instanseg/instanseg_tissuenet` | InstanSeg desde cero | TissueNet | 0,637 | 0,504 | 0,859 |
| `instanseg/instanseg_helacytonuc_clean` | InstanSeg desde cero | HeLaCytoNuc limpio | 0,496 | 0,282 | 0,708 |
| `instanseg/instanseg_bbbc020_px4` | InstanSeg desde cero, 4× downscale | BBBC020 | 0,509 | 0,343 | 0,904 |
| `nnunet/Dataset501_KiTSCytoNucs` | nnU-Net v2 3d_fullres, fold 0 | KiTS23 | 0,247 | 0,919 | 0,733 |

Las puntuaciones de HeLaCytoNuc corresponden al split de test dibujado a mano; los resultados del split de CellProfiler y las medias sobre tres semillas están en el artículo. No se han publicado resultados de benchmarks adicionales (por ejemplo, tiempos de inferencia o consumo de memoria) en la información disponible.

## Requisitos de hardware

- No se documentan requisitos de VRAM ni GPU recomendadas en la información disponible.
- El tamaño del repositorio (1,8 GB) corresponde a los pesos; el consumo en inferencia depende del método: StarDist e InstanSeg son redes 2D ligeras y caben con holgura en GPU de consumo, mientras que nnU-Net en `3d_fullres` y Cellpose 3D requieren más memoria por el volumen de entrada.
- El parche de StarDist se configura explícitamente (`--patch 256 256`), lo que permite ajustar la memoria a la GPU disponible.
- Opciones de despliegue: scripts propios del repositorio sobre PyTorch (`run_files.py`, `run_hsd.py`, `run_cellpose.py`, `run_instanseg.py`), `nnUNetv2_predict` para nnU-Net y TorchScript (`instanseg.pt`) para InstanSeg.
- Entornos separados por método según la model card: entorno de CytoNucs para StarDist y HydraStarDist, `cellpose 3` para Cellpose e `instanseg-torch` para InstanSeg.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Familia | Datasets cubiertos | Mejor AP núcleo en TissueNet | Licencia de pesos | Disponibilidad |
|---|---|---|---|---|---|
| `cytonucs-baselines` (este repo) | StarDist, HydraStarDist, Cellpose 3, InstanSeg, nnU-Net | TissueNet, HeLaCytoNuc, BBBC020, KiTS23 | 0,642 (HydraStarDist) | Investigación, con herencia no comercial en TissueNet y KiTS23 | Hugging Face, 0 descargas |
| `Podtyazhki1337/cytonucs` | CytoNucs (método propuesto) | Mismos splits | No disponible en esta ficha | No disponible | Hugging Face |
| StarDist original | StarDist | Diversos | No comparable directamente (otra receta) | BSD-3-Clause | Repositorio original |
| Cellpose 3 original | Cellpose | Diversos | No comparable directamente (afinado distinto) | BSD-3-Clause | Repositorio original |
| InstanSeg original | InstanSeg | Diversos | No comparable directamente (entrenado desde cero aquí) | Apache 2.0 | Repositorio original |

La comparación relevante es interna: dentro del mismo repo, HydraStarDist lidera en TissueNet (0,642/0,515/0,839), mientras que Cellpose 3 domina en BBBC020 (0,577/0,562/0,885) e InstanSeg logra el mejor linked JTPR en BBBC020 con downscale 4× (0,904). En KiTS23, nnU-Net obtiene el mejor AP de célula (0,919) pero un AP de núcleo bajo (0,247).

## Limitaciones y advertencias

- No es un modelo de lenguaje: no admite prompts de texto, tool calling ni razonamiento; cualquier uso fuera de segmentación de imágenes es inadecuado.
- Licencia de investigación: los pesos entrenados sobre TissueNet (Apache 2.0 modificada, no comercial) y KiTS23 (CC BY-NC-SA 4.0) heredan esas restricciones, por lo que no pueden usarse en productos comerciales sin revisión legal.
- Los métodos subyacentes conservan sus propias licencias (BSD-3-Clause para StarDist, HydraStarDist y Cellpose; Apache 2.0 para InstanSeg y nnU-Net), que hay que respetar por separado.
- StarDist 3D sobre KiTS23 falla de forma casi total (AP núcleo 0,000, linked JTPR 0,000): no es una opción viable para esa tarea.
- Cellpose 3D en KiTS23 también rinde muy por debajo (0,014/0,151/0,144); solo nnU-Net es competitivo en 3D en esta comparativa.
- Los resultados de HeLaCytoNuc corresponden al split dibujado a mano; el split de CellProfiler y las medias de tres semillas no están en la model card, así que las cifras publicadas aquí no deben tomarse como la estimación final del paper.
- El repositorio tiene 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación externa.
- No se documentan sesgos de dominio, comportamiento fuera de distribución ni límites de resolución más allá del experimento `px4`; la generalización a microscopios o tinciones distintas de las de los datasets de entrenamiento no está medida.
- Riesgo de sobreajuste a los splits concretos: los modelos se entrenaron con los mismos splits que CytoNucs, lo que favorece la comparabilidad pero no garantiza buen rendimiento en datos nuevos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Podtyazhki1337/cytonucs-baselines
- Modelos CytoNucs: https://huggingface.co/Podtyazhki1337/cytonucs
- Código de entrenamiento, ejecución y puntuación: https://github.com/podtyazhki1337/Cyto-Nucs-Stardist-2D-3D
- StarDist: no disponible en la información proporcionada
- Cellpose: no disponible en la información proporcionada
- InstanSeg: no disponible en la información proporcionada
- nnU-Net: no disponible en la información proporcionada
