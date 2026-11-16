# bizyu/solar-filament-seg

## Resumen

Solar filament seg es un conjunto de pesos entrenados para la segmentación de instancias de filamentos solares en imágenes de disco completo de GONG en H-alpha de 2048 x 2048 píxeles en escala de grises. Lo desarrolla el usuario bizyu como solución a la competición de Kaggle *filament-segmentation-2026* (IEEE BigData Cup 2026). No se trata de un modelo único, sino de un ensamblado de varios detectores y segmentadores combinados mediante votación, verificación y refinado en cascada.

La relevancia del proyecto es doble: por un lado, aborda una tarea científica concreta (detección y delimitación de filamentos solares, estructuras magnéticas relevantes para el estudio del clima espacial); por otro, documenta con inusual detalle una receta de ensamblado para segmentación de instancias de alta resolución, incluyendo pesos por pliegue, verificadores y refinadores. El repositorio ocupa 22,3 GB y contiene decenas de checkpoints en PyTorch y joblib.

El modelo final combina nnU-Net ResEnc-L 2D, Mask DINO Swin-L y R50, Cascade Mask R-CNN, RF-DETR-Seg Large, U-Nets propios y un verificador de gradient boosting, con seis refinadores residuales entrenados sobre las 707 imágenes de entrenamiento. La licencia del código y los pesos propios es MIT, aunque varios componentes derivan de checkpoints públicos con licencias Apache-2.0 y MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensamblado de segmentación de instancias: nnU-Net v2 ResEnc-L 2D, Mask DINO (Swin-L y R50), Cascade Mask R-CNN R50-FPN, RF-DETR-Seg Large, U-Net r34 / EfficientNetV2-S, U-Net++ y refinadores residuales |
| Parametros totales | no disponible (conjunto de decenas de checkpoints; no se publica el recuento agregado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de 2048 x 2048 píxeles en escala de grises) |
| Tipos de cuantizacion | no disponible (pesos PyTorch en precisión de entrenamiento; no se documentan versiones cuantizadas) |
| Idiomas soportados | no aplica (modelo de imagen; no procesa texto) |
| Licencia | MIT para código y pesos propios; componentes derivados bajo Apache-2.0 y MIT (Mask DINO, detectron2, RF-DETR, timm, segmentation-models-pytorch, nnU-Net) |
| Formato de pesos | `.pt` / `.pth` (PyTorch), `.joblib` (scikit-learn, CatBoost, XGBoost), `.npz` (alineamiento lineal), `.tar` (caché de salidas) |

## Arquitectura y entrenamiento

El sistema es un ensamblado en cascada. La primera etapa genera candidatos de instancia mediante varios detectores y segmentadores: nnU-Net v2 ResEnc-L 2D (5 pliegues) y Mask DINO Swin-L a 1024 píxeles como fuentes principales; Mask DINO R50 con semillas 0 a 3 y Mask DINO Swin-L a 1536 píxeles como votantes y para features de acuerdo; Cascade Mask R-CNN R50-FPN y RF-DETR-Seg Large a 1008 píxeles para features de acuerdo y plano de refinado; y U-Nets propios (ResNet-34 y EfficientNetV2-S) que aportan mapas de probabilidad. Un verificador V-ENS basado en gradient boosting, CatBoost, XGBoost y extra trees (70 u 80 features) puntúa los candidatos, y seis refinadores residuales (NNRP y S15F, semillas 16, 17 y 18) ajustan las máscaras finales. La decodificación aplica un bonus de orden de 0,20 y NMS de máscaras de 0,1.

El entrenamiento se realizó íntegramente sobre el conjunto de entrenamiento de la competición MAGFiLO 1.0 Kaggle 2026: 707 fotogramas físicos GONG H-alpha con polígonos de filamentos anotados por varios anotadores independientes, con validación cruzada de 5 pliegues por fotograma físico. El encoder SimMIM ResNet-34 se preentrenó además con fotogramas GONG H-alpha sin etiquetar de NSO, excluyendo los que estuvieran a menos de 24 horas de cualquier fotograma de test. Varias redes se inicializaron desde checkpoints públicos de COCO e ImageNet. El modelo final se reentrenó sobre las 707 imágenes completas (`fullfit/`). El PQ out-of-fold de la versión por pliegues es 0,4756 (nested), 0,4761 (rec) y 0,4146 (simulado).

## Capacidades

- Segmentación de instancias de filamentos solares en imágenes de disco completo H-alpha de 2048 x 2048 píxeles en escala de grises.
- Detección y delimitación de múltiples filamentos simultáneos en una misma imagen, con máscaras por instancia.
- Puntuación de verosimilitud de candidatos mediante un verificador de gradient boosting entrenado con 70 u 80 features.
- Refinado de contornos mediante refinadores residuales especializados (NNRP y S15F).
- Aprendizaje autosupervisado de representaciones (SimMIM) sobre imágenes solares sin etiquetar.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo puramente de visión.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Monitorización operativa de filamentos solares: el ensamblado puede procesar fotogramas GONG H-alpha de disco completo y devolver máscaras por instancia, útil para pipelines de seguimiento diario de la actividad solar.
- Investigación en clima espacial: la detección sistemática de filamentos permite construir series temporales de aparición, evolución y desaparición de estas estructuras para estudios estadísticos.
- Generación de catálogos anotados: las máscaras y puntuaciones del verificador pueden servir como preanotación para que anotadores humanos revisen y corrijan, reduciendo el coste de crear nuevos conjuntos etiquetados.
- Validación cruzada de anotaciones: la tabla de candidatos out-of-fold incluye el IoU de cada candidato con los registros de los anotadores, lo que permite analizar el acuerdo entre anotadores y detectar discrepancias.
- Reproducción de resultados de competición: el repositorio incluye configuraciones (`final_yellow.yaml`, `final_fullfit.yaml`, `stk.yaml`, `nlv.yaml`) y un manifiesto con sha256 para reproducir exactamente cada variante del ensamblado.
- Benchmark de segmentación de instancias de alta resolución: la combinación de Mask DINO, nnU-Net, Cascade Mask R-CNN y RF-DETR sobre imágenes de 2048 x 2048 sirve como referencia metodológica para otras tareas de segmentación científica.
- Desarrollo sin GPU: la caché `cache/final_cache_v1.tar` (157 MB) contiene las salidas de los modelos sobre los fotogramas de test y entrenamiento, lo que permite ejecutar el notebook de demostración en CPU.

## Benchmarks y rendimiento

Los únicos datos publicados son las métricas de la competición (PQ, Panoptic Quality) y los resultados de la leaderboard pública de Kaggle:

| Variante | Configuracion | PQ out-of-fold (nested) | PQ out-of-fold (rec) | PQ out-of-fold (simulado) | Leaderboard publico |
|---|---|---|---|---|---|
| Modelo final (NLv x full-data B6 + C0) | bonus orden 0,20, NMS mascaras 0,1 | 0,4756 | 0,4761 | 0,4146 | 0,41 |
| Modelo final sin bonus de orden | NMS mascaras 0,3 | 0,4753 | no disponible | no disponible | no disponible |
| `final_fullfit.yaml` | refinadores semillas none / 11 / 12, sin bonus, NMS 0,3 | no disponible | no disponible | no disponible | 0,41 |
| STK-avg5 + C0 + S15F (`stk.yaml`) | variante documentada | 0,4759 | no disponible | no disponible | 0,40 |
| NLv + NNR (`nlv.yaml`) | modelo mínimo | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo de segmentación de imágenes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma agregada. El ensamblado completo carga simultáneamente nnU-Net ResEnc-L, Mask DINO Swin-L (a 1024 y 1536 píxeles), Mask DINO R50 (cuatro semillas), Cascade Mask R-CNN R50-FPN, RF-DETR-Seg Large, dos U-Nets y seis refinadores, por lo que se requiere una GPU de gran capacidad; no se documenta la cifra exacta.
- GPU recomendadas: no disponible. Por el tamaño del ensamblado y las resoluciones de entrada (hasta 2048 x 2048), se necesita una GPU profesional (A100, H100 o similar); no se confirma compatibilidad con GPU de consumo.
- Cabe en consumer GPU: no disponible; el repositorio de 22,3 GB y la carga simultánea de múltiples redes hacen improbable su ejecución en GPU de consumo.
- Opciones de despliegue: PyTorch con los checkpoints del repositorio; el notebook de demostración del repositorio de código descarga los pesos vía `resolve/main/<file>` y verifica el sha256. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión).
- Latencia y throughput: no disponibles.
- Ruta sin GPU: el notebook de demostración puede ejecutarse en CPU usando `cache/final_cache_v1.tar`, que contiene las salidas precalculadas de los modelos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Solar filament seg (este) | Ensamblado de segmentación de instancias | no disponible (decenas de checkpoints) | 2048 x 2048 px, escala de grises | MIT + Apache-2.0 / MIT en componentes | Pesos en Hugging Face, código en GitHub |
| Mask DINO (componente) | Detector-segmentador transformer | no disponible | Resolución configurable (1024 / 1536 px) | Apache-2.0 (checkpoints COCO) | Público |
| nnU-Net v2 ResEnc-L (componente) | Segmentación semántica U-Net | no disponible | 2D, parches | Apache-2.0 | Público |
| RF-DETR-Seg Large (componente) | Detección-segmentación DETR | no disponible | 1008 px | Apache-2.0 | Público |

No se dispone de comparativas con otros modelos específicos de segmentación de filamentos solares en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo funciona con imágenes GONG H-alpha de disco completo a 2048 x 2048 en escala de grises; no es transferible a otras modalidades ni a otras resoluciones sin reentrenamiento.
- Sesgos de anotación: el entrenamiento usa polígonos de varios anotadores independientes; el acuerdo entre ellos condiciona el techo de calidad (PQ out-of-fold en torno a 0,47).
- Riesgo de falsos positivos y negativos en estructuras débiles o de bajo contraste; el verificador y el NMS pueden descartar instancias válidas.
- Licencia: el código y los pesos propios son MIT, pero varios componentes derivan de checkpoints COCO e ImageNet bajo Apache-2.0 y MIT, y los términos de acceso de esos datos de preentrenamiento aplican a esas partes.
- Seguridad de los ficheros `.joblib`: son pickles de scikit-learn, CatBoost y XGBoost que ejecutan código al cargarse; deben cargarse solo desde este repositorio y con las versiones exactas de `requirements.txt` (scikit-learn 1.8.0, catboost 1.2.10, xgboost 3.4.1).
- El repositorio no almacena imágenes de la competición ni polígonos de anotación; la caché solo contiene salidas de los modelos y los CSV enviados.
- No se documentan requisitos de hardware ni latencias, lo que dificulta planificar un despliegue en producción.
- Sin mantenimiento ni descargas registradas (0 descargas, 0 likes en el momento de la consulta), lo que reduce la validación comunitaria del artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/bizyu/solar-filament-seg
- Repositorio de código y reproducción: https://github.com/0122POND/solar-filament-seg
- Configuraciones citadas: `configs/final_yellow.yaml`, `configs/final_fullfit.yaml`, `configs/stk.yaml`, `configs/nlv.yaml`
- Manifiestos: `weights/MANIFEST_final.tsv`, `MANIFEST_cache.tsv`
- Notebook de inferencia: `notebooks/` del repositorio de código
- Competición: IEEE BigData Cup 2026 / Kaggle *filament-segmentation-2026* (MAGFiLO 1.0 Kaggle 2026)
