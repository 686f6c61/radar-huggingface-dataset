# FatimahEmadEldin/leo-uav-fusion-checkpoints

## Resumen

El repositorio `FatimahEmadEldin/leo-uav-fusion-checkpoints` contiene los pesos, registros y documentación de una serie de experimentos de fusión de imágenes de baja y alta resolución para segmentación semántica. El estudio combina imágenes aéreas RGBI de 20 cm (utilizadas como proxy de UAV) con series temporales de Sentinel-2 (10 m, 10 bandas) sobre el mismo terreno de 102,4 m × 102,4 m, empleando el dataset FLAIR-HUB de IGN Francia y la nomenclatura COSIA de 19 clases. El objetivo es evaluar si la información multiespectral de satélite mejora la clasificación de píxeles frente a usar únicamente la imagen aérea de alta resolución.

El autor, FatimahEmadEldin, publica cuatro arquitecturas de fusión —`sat_only`, `uav_only`, `early_fusion` y `xscale_fusion`— junto con scripts de entrenamiento y carga de checkpoints. No se proporcionan detalles sobre la arquitectura interna (número de capas, parámetros totales, etc.), pero el tamaño del repositorio (1,3 GB) sugiere modelos de tamaño moderado. La relevancia radica en abordar un problema práctico: la fusión de datos heterogéneos de teledetección para mejorar la precisión de mapas de cobertura del suelo, un área activa en agricultura de precisión y planificación urbana.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes neuronales para segmentación semántica; cuatro variantes: `sat_only`, `uav_only`, `early_fusion` (concatenación en la entrada) y `xscale_fusion` (con puerta de fusión y pérdida auxiliar). Detalles internos no disponibles |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica |
| Licencia | No disponible |
| Formato de pesos | PyTorch `state_dict` (`.pt`) |

## Arquitectura y entrenamiento

Los checkpoints son resultados de experimentos controlados de fusión cross-scale. La entrada fina es una imagen aérea RGBI de 512×512 píxeles a 20 cm de resolución (un proxy de UAV, nadir y calibrada), mientras que la entrada gruesa es una serie temporal de Sentinel-2 L2A con 10 bandas a 10 m, compuesta de 38 a 73 fechas por parche, filtrada de nubes mediante el canal MSK-SC (probabilidad, no clases). Se utilizan agrupaciones de clases COSIA: `environment6` (6 clases), `thematic4` (4 clases) y `forestmerged5` (5 clases), aunque los experimentos reportados usan 6, 8 y 10 clases.

El entrenamiento se realizó con un lote efectivo de 16 (corregido desde 4 solicitado) y un ruido de fondo medido de sd = 2,00 mIoU. La variante `xscale_fusion` incorpora una puerta de fusión que requirió una corrección (pérdida auxiliar y calentamiento de la puerta) para evitar un bloqueo. No se especifican detalles de la arquitectura interna (tipo de backbone, número de capas, función de pérdida, optimizador, etc.), ni si se emplearon técnicas como normalización, aumento de datos o preentrenamiento.

## Capacidades

- Segmentación semántica de imágenes de alta resolución (20 cm) con 19 clases COSIA, aunque los experimentos se evalúan con agrupaciones reducidas (6, 8 o 10 clases).
- Fusión de datos multiespectrales de satélite (Sentinel-2, 10 bandas) con imágenes aéreas RGBI para mejorar la clasificación de píxeles.
- Soporte para cuatro estrategias de fusión: solo satélite, solo UAV, fusión temprana (concatenación en la entrada) y fusión cross-scale con puerta adaptativa.
- Manejo de series temporales de Sentinel-2 (hasta 73 fechas) compuestas en bins fijos.
- No incluye generación de texto, tool calling, agentes ni capacidades multimodales fuera del dominio de visión.

## Casos de uso

- Cartografía de cobertura del suelo: el modelo puede clasificar automáticamente píxeles en categorías COSIA (edificios, vegetación, agua, etc.) a partir de ortofotos de 20 cm, útil para actualizar mapas catastrales o de usos del suelo.
- Agricultura de precisión: combinar la resolución espacial de drones (proxy UAV) con la información multiespectral de Sentinel-2 para monitorizar cultivos, detectar estrés hídrico o estimar biomasa a escala de parcela.
- Planificación urbana: identificar edificios, infraestructuras verdes y superficies impermeables en zonas urbanas, integrando datos satelitales para mejorar la robustez en áreas con sombras o nubes parciales.
- Gestión forestal: clasificar especies arbóreas o detectar deforestación usando la fusión de imágenes aéreas y series temporales de satélite, aprovechando la información fenológica de Sentinel-2.
- Evaluación de riesgos naturales: mapear inundaciones, deslizamientos o incendios mediante la comparación de clasificaciones antes y después del evento, con la ventaja de la resolución temporal de Sentinel-2.
- Validación de productos satelitales: usar las predicciones de alta resolución como referencia para calibrar o validar mapas globales de cobertura del suelo generados con imágenes de menor resolución.

## Benchmarks y rendimiento

Los resultados reportados corresponden a los experimentos del repositorio, medidos en mIoU (mean Intersection over Union) sobre el conjunto de test. No se comparan con modelos externos.

| Run | Estado | Stream | Clases | Mejor modelo | Mejor mIoU test |
|---|---|---|---|---|---|
| `local_8371d1be` | completo | s2 | 6 | `early_fusion` | 54,85 |
| `local_bfc171ed` | completo | s2 | 6 | `xscale_fusion` | 53,91 |
| `local_e0a791f4` | completo (proxy) | proxy | 8 | `uav_only` | 38,90 |
| `local_fecb5c8a` | parcial (2 de ~8) | s2 | 8 | `uav_only` | 38,77 |
| `local_4426862e` | parcial (1 de ~8) (proxy) | proxy | 6 | `sat_only` | 37,03 |
| `local_a40d6aab` | parcial (1 de ~8) | s2 | 10 | `sat_only` | 17,54 |

Nota: el ruido de fondo es sd = 2,00 mIoU y la variación entre semillas alcanza 5,35 mIoU, por lo que diferencias inferiores a ~4 mIoU no son estadísticamente significativas. El baseline de FLAIR-HUB reporta una ganancia de +0,6 mIoU al añadir Sentinel-2 a la imagen aérea (64,1 → 64,7) con 89,4 M de parámetros y 152 225 parches. Los runs `proxy` no pueden mostrar beneficio de fusión porque el input grueso es un promedio del fino.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentación disponible.
- El tamaño del repositorio (1,3 GB) sugiere que los checkpoints podrían cargarse en GPUs con al menos 8 GB de VRAM, pero no hay datos confirmados.
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama; al ser PyTorch `state_dict`, se cargan directamente con `torch.load` y la arquitectura correspondiente.
- No se proporcionan métricas de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El único punto de referencia es el baseline de FLAIR-HUB (LC-A 64,1 → LC-D 64,7 mIoU), que utiliza una arquitectura de 89,4 M de parámetros sobre 152 225 parches, pero no se detalla su diseño.

## Limitaciones y advertencias

- Alto ruido de fondo (sd = 2,00 mIoU) y variación entre semillas de hasta 5,35 mIoU; los resultados con diferencias menores a ~4 mIoU no son concluyentes.
- Varios runs están incompletos o son `proxy` (el input grueso es un promedio del fino), por lo que no aportan evidencia sobre el beneficio real de la fusión.
- La fusión temprana en estos checkpoints concatena en la entrada, no en las características del encoder; no es intercambiable con versiones más recientes que fusionan a nivel de características.
- Los checkpoints requieren construir el modelo con `aux_coarse=0.0`; activar la cabeza auxiliar añade parámetros que no están en los pesos y romperá la carga.
- La licencia no está especificada, por lo que el uso comercial o la redistribución son inciertos.
- No se documentan sesgos específicos, pero la dependencia de datos de Francia (IGN) puede limitar la generalización a otras regiones geográficas.
- El valor COSIA 0 corresponde a `Building` (no a no-dato), un detalle crítico para el postprocesado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/FatimahEmadEldin/leo-uav-fusion-checkpoints
- Código de entrenamiento: `code/run_local.py` (dentro del repo)
- Script de carga de checkpoints: `code/load_checkpoint.py` (dentro del repo)
- Pipeline de experimentos: `code/flair_experiment_fusion.py` (dentro del repo)
- Agrupaciones de clases: `code/class_sets.py` (dentro del repo)
- Dataset FLAIR-HUB: `IGNF/FLAIR-HUB` (IGN France)
