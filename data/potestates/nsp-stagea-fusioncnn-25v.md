# Potestates/NSP-StageA-FusionCNN-25v

## Resumen

NSP-StageA-FusionCNN-25v es un modelo de reconstrucción de tomografía computarizada (CT) de vista dispersa (sparse-view CT) desarrollado por el usuario Potestates dentro del pipeline NSP-GS. No es un modelo de lenguaje: es una CNN de fusión que combina dos reconstrucciones previas de un mismo caso para producir una reconstrucción 3D de mayor calidad a partir de solo 25 proyecciones. En concreto, fusiona la salida de DeepSparse 25v (inferencia sin ground truth) con una reconstrucción R²-GS asistida por prior (20k iteraciones), y opera sobre características de parche de 75 dimensiones.

El modelo corresponde a la etapa A (Stage-A) del pipeline y se entrenó con una única red para cuatro cohortes anatómicas distintas: LUNA16 (pulmón), PENGWIN (pelvis), PANORAMA (abdomen) y ToothFairy (diente), con 155 casos de entrenamiento y 20 de validación en total. La relevancia práctica es directa en imagen médica: reducir de cientos a 25 vistas baja dosis de radiación y tiempo de adquisición, siempre que la calidad reconstruida se mantenga. Los resultados reportados muestran una mejora media de +1,14 dB de PSNR 3D en validación y +1,52 dB en test retenido respecto a la reconstrucción DeepSparse de partida.

El modelo se publica con licencia de solo investigación (`research-only-see-readme`), el repositorio de HuggingFace ocupa 0,0 GB y no registra descargas ni likes en el momento de la consulta. Uno de los datasets de entrenamiento, PANORAMA, está bajo CC BY-NC 4.0 (no comercial), lo que condiciona cualquier uso derivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN de fusión (FusionCNN) sobre vectores de características de parche de 75D (F+M+D); opera sobre dos reconstrucciones de entrada (V1 y V2) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible / no aplica (modelo de reconstrucción por parches, no secuencial) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch entrenado con AMP; no se publican variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de imagen médica, sin entrada/salida de texto) |
| Licencia | `other` — `research-only-see-readme` (uso exclusivo de investigación) |
| Formato de pesos | PyTorch `.pt` (`fusion_cnn_run_001/best.pt`), acompañado obligatoriamente de `fusion_cnn_run_001/PREPROCESSING.npz` |
| Tarea | Reconstrucción CT de vista dispersa con 25 vistas (fusión de priors) |
| Vistas | 25, uniformes sobre 180° (índices 0, 12, …, 288 de un banco de 300 vistas cone-beam) |
| Datasets de entrenamiento | LUNA16, PENGWIN, PANORAMA, ToothFairy |
| Cohortes | 155 casos de train, 20 de validación, 15 de test retenido |
| Entradas obligatorias | V1 = DeepSparse 25v (`ep_400.pth`); V2 = R²-GS prior-assisted, 20k iteraciones |

## Arquitectura y entrenamiento

El modelo es una CNN de fusión que trabaja a nivel de parche. Para cada caso se construyen dos reconstrucciones de entrada sin acceso a ground truth: V1, salida DeepSparse de 25 vistas (procedente de `Potestates/DeepSparse-25v`, checkpoint `logs/<dst>+25v+n250+s2/ep_400.pth`), y V2, una reconstrucción R²-GS asistida por prior (script `train.py` V6, RUN_COMMANDS 3.2 en modo NSP-only, con `lambda_null 0.05` y pérdida null de 10k a 20k iteraciones), donde el propio V1 actúa como prior y se mantienen las mismas 25 vistas. A partir de la cadena publicada `pair` → `features` → `labels` se extraen características de parche de 75 dimensiones (F+M+D), con puerta (`gate`) igual a `actionable` y `beta` igual a `beta_unclipped`. Las 25 vistas son uniformes sobre 180° y cada dataset usa su geometría oficial de proyector DeepSparse. La CNN aprende, por tanto, una corrección/fusión local entre dos estimaciones ruidosas y complementarias.

El entrenamiento siguió los valores formales publicados: AdamW con `lr` 1e-3, `weight decay` 1e-4, batch 64, 30 épocas, paciencia 8, 2048 parches por paciente y época, AMP, semilla 20260911 y muestreo balanceado por paciente. Se aplicó una única modificación: `--num-workers 16`, que solo afecta al rendimiento del cargador de datos (el sampler fijo garantiza el mismo orden), por lo que la ejecución se etiqueta como `EXPLICIT_NONFORMAL_OVERRIDE`. La mejor pérdida de parche en validación fue 0.06130, en la época 29 de 30; el entrenamiento completo tardó 956 s en una RTX PRO 6000 Blackwell con un pico de memoria CUDA de 0,46 GB. El código base es `deployment/nsp_gs_abc_v1`, rama `migration/gmrb-r2fine-20260907`, commit `4714de6`, con dos parches locales: uno que fija a 0 las sumas de cuadrados de parche (`d2`, `target2`, `p1_sq`, `p2_sq`) para evitar un NaN en un parche de aire de PENGWIN 004, y otro que añade `#include <cfloat>` y `<cstdint>` para compilar las extensiones CUDA de R²-GS con CUDA 12.9 y torch 2.7.1+cu128.

## Capacidades

- Reconstrucción CT 3D de vista dispersa a partir de 25 proyecciones cone-beam, en geometrías específicas por dataset.
- Fusión de dos reconstrucciones previas (DeepSparse 25v y R²-GS con prior) en una estimación única de mayor PSNR.
- Mejora cuantificada de PSNR 3D frente a V1 en 18 de 20 casos de validación y en 15 de 15 casos del test retenido.
- Generalización anatómica a cuatro regiones: pulmón (LUNA16), pelvis (PENGWIN), abdomen (PANORAMA) y diente (ToothFairy) con un único modelo.
- Funcionamiento sin ground truth en la generación de entradas (V1, V2 y características se construyen GT-free); el GT solo se abre para puntuar.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión natural, tool calling, capacidades de agente ni soporte multilingüe.
- No se documentan modos especiales (thinking, audio, vídeo) ni decodificación especulativa; es un modelo de regresión por parches.

## Casos de uso

- Reconstrucción de baja dosis en pulmón: con solo 25 vistas sobre 180°, el modelo eleva el PSNR de 30,06 a 31,44 dB en LUNA16 en test retenido, útil para protocolos de cribado donde reducir dosis es prioritario.
- CBCT dental de campo limitado: en ToothFairy el modelo aporta +2,08 dB en test retenido (33,78 → 35,86 dB), el mayor margen entre datasets, adecuado para planificación implantológica con barridos rápidos.
- Reconstrucción abdominal con haz cónico: en PANORAMA la mejora en test es de +1,08 dB (29,71 → 30,80 dB), aplicable a escenarios intervencionistas donde el tiempo de adquisición es crítico.
- Post-procesado dentro de un pipeline NSP-GS: el modelo se inserta como Stage-A recibiendo V1 y V2 ya generados, sin requerir GT, lo que permite desplegarlo en producción sobre reconstrucciones existentes.
- Evaluación y ablación de priors de reconstrucción: al requerir R²-GS a 20k iteraciones con prior V1, sirve como banco de pruebas para medir el impacto de distintas iteraciones o hiperparámetros (`lambda_null`, ventana de pérdida null).
- Investigación en reconstrucción de vista dispersa: el modelo y sus splits congelados (`cohort/STAGEA_SPLIT.json`, `cohort/TRAINING_DATASET.json`) permiten reproducir comparativas controladas frente a V1 y V2.
- Reducción de tiempo de escaneo en modalidades cone-beam: 25 vistas uniformes suponen una fracción mínima del banco de 300, por lo que el modelo habilita protocolos de adquisición muy cortos cuando la calidad de 30-36 dB es aceptable.

## Benchmarks y rendimiento

Resultados de validación (20 casos, in-sample: usados para selección de checkpoint), PSNR 3D en dB frente a GT, cálculo con `skimage`, `data_range` 1:

| Dataset | V1 DeepSparse 25v | V2 R²-GS 20k | V_A (FusionCNN) | V_A − V1 |
|---|---|---|---|---|
| LUNA16 | 31,64 | 30,47 | 33,15 | +1,51 |
| PENGWIN | 30,45 | 29,84 | 31,16 | +0,71 |
| PANORAMA | 29,48 | 28,22 | 29,61 | +0,12 |
| ToothFairy | 34,52 | 33,89 | 36,75 | +2,22 |
| Todos | 31,52 | 30,60 | 32,67 | +1,14 |

Resultados de test retenido (15 casos: 5 LUNA16 + 5 PANORAMA + 5 ToothFairy; ningún caso no entrenado de PENGWIN estaba disponible), PSNR 3D en dB:

| Dataset | V1 DeepSparse 25v | V2 R²-GS 20k | V_A (FusionCNN) | V_A − V1 |
|---|---|---|---|---|
| LUNA16 | 30,06 | 28,45 | 31,44 | +1,38 |
| PANORAMA | 29,71 | 29,30 | 30,80 | +1,08 |
| ToothFairy | 33,78 | 33,47 | 35,86 | +2,08 |
| Todos | 31,19 | 30,41 | 32,70 | +1,52 |

Métricas de entrenamiento: mejor pérdida de parche en validación 0,06130 (época 29 de 30), 956 s de entrenamiento en una RTX PRO 6000 Blackwell, pico de memoria CUDA 0,46 GB. Resultados por caso en `fusion_cnn_run_001/scores_validation.csv` y `fusion_cnn_run_001/scores_test_heldout.csv`. No se han publicado resultados de benchmarks estándar de reconstrucción (SSIM, RMSE, LPIPS) en la información disponible.

## Requisitos de hardware

- Entrenamiento: una RTX PRO 6000 Blackwell, con pico de memoria CUDA de 0,46 GB y 956 s para las 30 épocas. El modelo es, por tanto, muy ligero en memoria respecto a otros modelos de reconstrucción.
- VRAM de inferencia: no disponible de forma explícita; dado el pico de 0,46 GB en entrenamiento con batch 64 y AMP, la inferencia por parches debería caber holgadamente en cualquier GPU consumer moderna (RTX 3060 12 GB o superior, RTX 4090, etc.), aunque el dato no está confirmado por el autor.
- GPU recomendadas: la referencia documentada es RTX PRO 6000 Blackwell; para inferencia cualquier GPU NVIDIA con soporte CUDA 12.9 y torch 2.7.1+cu128 es compatible a priori.
- Dependencia de hardware indirecta: la generación de las entradas V1 (DeepSparse 25v) y V2 (R²-GS a 20k iteraciones) sí requiere compilar extensiones CUDA (parche `r2gs_cuda_headers_blackwell.diff`) y ejecutar optimización 3D, por lo que el coste real del pipeline completo es notablemente superior al de la CNN de fusión.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo). El despliegue es en PyTorch, cargando `fusion_cnn_run_001/best.pt` junto con `fusion_cnn_run_001/PREPROCESSING.npz`.
- Latencia y throughput: no disponibles. Solo se reporta el tiempo de entrenamiento (956 s) y la pérdida de validación.
- Requisito crítico: no se puede usar el checkpoint sin el `PREPROCESSING.npz` asociado (ajustado únicamente sobre el split de train).

## Comparativa con modelos similares

No se han publicado comparativas con modelos externos en la información disponible. Las únicas alternativas cuantificadas son los dos priors internos que alimentan al modelo:

| Alternativa | Tipo | Entrada | PSNR 3D test (todos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NSP-StageA-FusionCNN-25v (este modelo) | CNN de fusión | V1 + V2 + features 75D | 32,70 dB | research-only-see-readme | HuggingFace `Potestates/NSP-StageA-FusionCNN-25v` |
| DeepSparse 25v (V1) | Reconstrucción aprendida de vista dispersa | 25 vistas | 31,19 dB | no disponible en la información | HuggingFace `Potestates/DeepSparse-25v` |
| R²-GS 20k (V2) | Reconstrucción Gaussiana asistida por prior | 25 vistas + prior V1 | 30,41 dB | no disponible en la información | código en `deployment/nsp_gs_abc_v1` |

Comparativa frente a métodos de reconstrucción de vista dispersa de la literatura (por ejemplo, variantes de FBP, SART o redes tipo LEARN/DuDoNet): no disponible en la información proporcionada.

## Limitaciones y advertencias

- Licencia de solo investigación: el identificador es `research-only-see-readme`; no hay autorización explícita de uso comercial en la model card.
- Contaminación de licencias en los datos de entrenamiento: PANORAMA está bajo CC BY-NC 4.0 (no comercial), por lo que los pesos derivados quedan afectados por esa restricción; LUNA16, PENGWIN (CC BY 4.0) y ToothFairy tienen asimismo sus propios términos que deben revisarse.
- Validación in-sample: los 20 casos de validación se usaron para seleccionar el checkpoint, por lo que los 32,67 dB reportados no son una estimación limpia de generalización. La cifra fiable es la de test retenido (32,70 dB).
- Dos casos empeoran en validación: PENGWIN 032 (−3,00 dB) y PANORAMA 101749 (−0,85 dB). El modelo no mejora de forma universal.
- Cobertura de test limitada a tres anatomías: no hay casos retenidos de PENGWIN (pelvis) porque todos los casos no usados en entrenamiento ya estaban en train o validación, de modo que el rendimiento en pelvis fuera de muestra no está verificado.
- Cohorte pequeña: 155 casos de train y 20 de validación repartidos en cuatro datasets. El riesgo de sobreajuste a las geometrías y distribuciones de esos cuatro escáneres es real.
- Dependencia estricta de las entradas: el modelo necesita tanto V1 (DeepSparse 25v) como V2 (R²-GS 20k con prior V1). Errores o sesgos de esos priors se propagan a la salida, y no se documenta comportamiento con otras geometrías, número de vistas o priors distintos.
- Condiciones de vista fijas: 25 vistas uniformes sobre 180° con índices concretos (0, 12, …, 288 de un banco de 300). Cambiar el muestreo angular invalida las suposiciones del modelo.
- Ejecución no formal: el entrenamiento lleva la etiqueta `EXPLICIT_NONFORMAL_OVERRIDE` por el cambio de `--num-workers` a 16. El autor argumenta que el orden de datos es idéntico, pero conviene tenerlo en cuenta para reproducibilidad estricta.
- Correcciones obligatorias del código: sin el parche de clamp de sumas de cuadrados, un parche de aire de PENGWIN 004 produce NaN y aborta el caso; sin el parche de cabeceras CUDA, las extensiones R²-GS no compilan en Blackwell (CUDA 12.9, torch 2.7.1+cu128).
- Riesgo de alucinación estructural: como todo método de reconstrucción basado en aprendizaje con priors, puede introducir detalle plausible pero inexistente en la escena real. No se documentan evaluaciones radiológicas ni validación clínica.
- Sin cuantizaciones publicadas ni métricas de latencia: no hay datos para planificar despliegues con requisitos estrictos de tiempo real.
- El repositorio de HuggingFace está vacío (0,0 GB) en el momento de la consulta, con 0 descargas y 0 likes; los pesos podrían no estar efectivamente disponibles.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Potestates/NSP-StageA-FusionCNN-25v
- HuggingFace del prior DeepSparse 25v: https://huggingface.co/Potestates/DeepSparse-25v
- Referencias internas citadas en la model card (sin URL directa): código base `deployment/nsp_gs_abc_v1`, rama `migration/gmrb-r2fine-20260907`, commit `4714de6`; splits `cohort/STAGEA_SPLIT.json` y `cohort/TRAINING_DATASET.json`; parches `patches/build_training_labels_nonneg_fix.diff` y `patches/r2gs_cuda_headers_blackwell.diff`; resultados `fusion_cnn_run_001/scores_validation.csv` y `fusion_cnn_run_001/scores_test_heldout.csv`
- La búsqueda web realizada no devolvió ningún enlace relevante sobre este modelo (los resultados obtenidos eran páginas de soporte de Microsoft sin relación con el contenido).
