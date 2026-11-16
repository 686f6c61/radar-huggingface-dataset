# isp-uv-es/CHRIS-PROBA1

## Resumen

CHRIS-PROBA1 es un modelo de segmentación semántica de nubes y sombras de nube para imágenes del sensor hiperespectral CHRIS a bordo del satélite PROBA-1 de la ESA. Lo desarrolla el grupo isp-uv-es (Image Signal Processing, Universitat de València) y clasifica cada píxel de una escena en tres clases: `clear`, `cloud` y `shadow`. El modelo resuelve un problema recurrente en teledetección óptica: la necesidad de enmascarar nubes y sus sombras antes de cualquier procesado posterior (corrección atmosférica, índices de vegetación, series temporales), cuando el sensor de origen no dispone de bandas SWIR ni térmicas que faciliten la discriminación.

La versión actual (v2, noviembre de 2026) es un ensemble de tres U-Nets con encoders ConvNeXtV2-nano y RegNetY-004, entrenado sobre parches de 640 px y afinado con 130 escenas CHRIS pintadas a mano más pseudo-etiquetas autogeneradas. El repositorio conserva la v1 por reproducibilidad y ambos se cargan mediante la herramienta mlstac. El modelo es relevante porque el archivo de CHRIS/PROBA-1 es un recurso abierto con dos décadas de observaciones, y disponer de una máscara de nubes fiable y automatizada desbloquea su uso en series temporales largas.

La limitación estructural es la del propio sensor: CHRIS cubre 406–1005 nm, sin SWIR ni térmico, de modo que una sombra y una superficie oscura (agua, vegetación densa) son espectralmente parecidas. Esto se refleja en las métricas: la clase `shadow` se queda en un IoU de 0,652 frente a 0,898 de `clear` y 0,831 de `cloud`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de 3 U-Nets (encoders ConvNeXtV2-nano ×2 y RegNetY-004) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de inferencia de 640 px con solape de 320 px |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | checkpoints PyTorch (`.ckpt`) cargados vía mlstac; tarjeta en formato STAC/mlm (`mlm.json`) |
| Bandas de entrada | 4 (R, G, B, NIR equivalentes a Sentinel-2 B4, B3, B2, B8) |
| Clases de salida | 3 (`0=clear`, `1=cloud`, `2=shadow`, `255=nodata`) |
| Modos CHRIS soportados | 1 a 5, y modo 20 pasado como `mode_n=6` |
| Tamaño del repositorio | 1,4 GB |

## Arquitectura y entrenamiento

El modelo es un ensemble de tres segmentadores semánticos con esqueleto U-Net. Dos checkpoints usan encoder ConvNeXtV2-nano y uno RegNetY-004. La diversidad del ensemble no proviene de arquitecturas distintas sino del conjunto de etiquetas con el que aprendió cada checkpoint: `convnextv2_e2` se entrenó con 1.611 pseudo-etiquetas generadas por la v1, mientras que `convnextv2_e5` y `regnety_e5` se entrenaron con 1.606 pseudo-etiquetas regeneradas por la propia v2 (autotraining con filtro de acuerdo y confianza). El promedio de las softmax de los tres supera al mejor modelo individual (0,708 frente a 0,700 de mIoU).

El preentrenamiento se realizó sobre CloudSEN12: 50.247 parches de 640 × 640 a 10 m, 13 bandas espectrales y tres etiquetas. Se probaron once combinaciones de bandas con ConvNeXtV2-nano y RegNetY-004; por encima de cuatro bandas todas las combinaciones empatan dentro de 0,007 mIoU, por lo que se conservó la de cuatro bandas por ser la más barata y la única que los seis modos CHRIS pueden construir. El afinamiento usó 130 escenas CHRIS pintadas a mano (cada una vista 15 veces con recortes aleatorios) más las pseudo-etiquetas automáticas. El conjunto de test son 55 escenas pintadas, una por vuelo, con partición por vuelo (no por escena) para evitar fuga de datos entre ángulos de la misma adquisición.

La inferencia recorre la escena en ventanas de 640 px con solape de 320 px, ajustando la última ventana al borde para evitar padding. Cada ventana recibe una normalización z-score por banda calculada dentro de la propia ventana, lo que hace irrelevante la escala radiométrica absoluta. Las predicciones se promedian y se fusionan con una máscara de gradiente antes del `argmax`. Una escena de 748 × 744 tarda unos 0,23 s en una RTX A5000 con los modelos ya cargados.

## Capacidades

- Segmentación densa píxel a píxel de nubes y sombras de nube en imágenes CHRIS/PROBA-1.
- Clasificación en tres clases: `clear`, `cloud` (nubes gruesas y finas fusionadas) y `shadow`.
- Salida de mapa de etiquetas completo de la escena (`uint8`) o de probabilidades por píxel con `return_probs=True`.
- Construcción automática de las cuatro bandas RGBN desde un cubo CHRIS crudo mediante `build_rgbn()` y la tabla `bands.json`, derivada de la similitud coseno entre la respuesta espectral de CHRIS y las bandas de Sentinel-2.
- Soporte de productos TOA (reflectancia ×10000), radiancia y DN crudo, con preferencia por TOA y radiancia.
- Robustez a la escala radiométrica absoluta gracias a la normalización z-score por ventana.
- Procesado de escenas completas de tamaño arbitrario mediante ventaneo con solape y fusión por máscara de gradiente.
- Carga e inferencia vía mlstac en CPU o GPU (`device="cuda"` o `"cpu"`).

## Casos de uso

- Enmascarado previo a corrección atmosférica: generar la máscara de nubes y sombras antes de aplicar un modelo de corrección atmosférica sobre escenas CHRIS, de modo que los píxeles contaminados se excluyan del ajuste y no sesguen los parámetros estimados.
- Series temporales de reflectancia: el archivo CHRIS/PROBA-1 acumula observaciones desde 2001; aplicar la máscara de forma sistemática permite construir series limpias de un mismo punto para estudios de fenología o cambios de uso del suelo.
- Cálculo de índices de vegetación fiables: el NDVI y similares se distorsionan con nubes y sombras; la máscara permite descartar esos píxeles antes de agregar índices por parcela o por región.
- Validación cruzada con máscaras geométricas: comparar la máscara del modelo con una máscara de sombras basada en geometría solar y DEM para detectar discrepancias y decidir qué píxeles requieren revisión manual.
- Preprocesado en pipelines de teledetección: integrar el modelo en un flujo automatizado que procese lotes de escenas CHRIS por modo, con la ventana de 640 px y el solape fijo, y genere máscaras listas para el siguiente paso del pipeline.
- Etiquetado asistido para nuevos datasets: usar las predicciones del modelo como preetiquetas que un operador revisa y corrige, reduciendo el coste de pintar escenas nuevas a mano (el propio autor usó este esquema para generar las pseudo-etiquetas de la v2).
- Control de calidad de archivo: detectar automáticamente escenas mayoritariamente nubosas para excluirlas de catálogos o priorizar su reprocesado.

## Benchmarks y rendimiento

Resultados sobre 55 escenas pintadas a mano, una por vuelo, nunca vistas en entrenamiento:

| Metrica | v1 (2026-06) | v2 (2026-11) |
|---|---|---|
| mIoU | 0,701 | 0,708 |
| Macro F1 | 0,876 | 0,881 |
| Cohen's kappa | 0,843 | 0,854 |
| Accuracy | 0,921 | 0,921 |

IoU por clase en v2: `clear` 0,898; `cloud` 0,831; `shadow` 0,652 (en v1: 0,885, 0,823 y 0,646 respectivamente).

Rendimiento por modo CHRIS (mismas 55 escenas): v2 mejora en los modos 1, 3, 4 y 5 (modos 4 y 5 con +0,07), empeora ligeramente en el modo 2 (−0,02, cinco escenas) y en el modo 6 (−0,01). Los modos 2, 4 y 5 tienen cinco escenas o menos, por lo que esas diferencias no son concluyentes por sí solas.

Comparación interna del ensemble: 0,708 de mIoU frente a 0,700 del mejor checkpoint individual.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el ensemble son tres modelos con encoders nano/ligeros (ConvNeXtV2-nano, RegNetY-004), por lo que la huella es moderada, pero no se publica una cifra.
- GPU de referencia del autor: RTX A5000, con la que una escena de 748 × 744 tarda aproximadamente 0,23 s con los modelos ya cargados.
- GPU recomendadas: no se especifican; por el tamaño de los encoders, cualquier GPU consumer con suficiente VRAM para tres modelos de segmentación debería bastar, pero no hay cifras publicadas.
- ¿Cabe en GPU consumer? No confirmado explícitamente; el autor solo reporta la RTX A5000 (gama profesional). La inferencia en CPU está soportada (`device="cpu"`), sin latencias publicadas.
- Opciones de despliegue: mlstac (carga vía `mlm.json` desde Hugging Face y `compiled_model(device=...)`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Throughput: no disponible; solo se reporta la latencia de una escena concreta en una GPU concreta.

## Comparativa con modelos similares

No se han publicado comparativas con otros modelos de segmentación de nubes en la información disponible. El propio autor solo compara v1 con v2 dentro del mismo repositorio (ver tabla de benchmarks). Modelos como CloudSEN12 (usado aquí solo como dataset de preentrenamiento) u otros segmentadores de nubes para Sentinel-2 no aparecen comparados en la documentación proporcionada.

| Modelo | Parametros | Contexto/ventana | mIoU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CHRIS-PROBA1 v2 | no disponible | 640 px | 0,708 | no disponible | Hugging Face (isp-uv-es) |
| CHRIS-PROBA1 v1 | no disponible | 384 px | 0,701 | no disponible | Hugging Face (isp-uv-es, carpeta `v1/`) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No detecta nubes finas por separado: la v2 fusiona nubes gruesas y finas en `cloud`; mantener cuatro clases costaba 0,011 de mIoU y se descartó.
- La clase `shadow` es la más débil (IoU 0,652) por la ausencia de bandas SWIR y térmicas en CHRIS; se esperan fallos sobre agua y vegetación oscura. Una máscara de sombras basada en geometría solar y DEM supera al modelo en esos píxeles.
- El margen estadístico de las 55 escenas de test es de aproximadamente ±0,03 de mIoU; las diferencias menores que eso son ruido, incluida la comparación v1 → v2, que no puede probarse con esta muestra.
- Las adquisiciones del modo 2 posteriores a 2015 almacenan un RCI muerto y no son utilizables.
- El modelo espera productos TOA o radiancia; el DN crudo funciona pero no es lo que se usó en el entrenamiento de la mayoría de escenas.
- La licencia no está disponible en la información proporcionada, por lo que no puede confirmarse el uso comercial.
- Los sesgos concretos del modelo no se documentan en la información disponible; cabe esperar sesgos heredados de CloudSEN12 y de las escenas pintadas a mano.
- Riesgo de alucinación en el sentido de falsos positivos/negativos de segmentación: no se cuantifica más allá de las métricas por clase.
- No hay datos publicados sobre cuantización ni sobre despliegue en GPU consumer, lo que limita la planificación de producción.
- El modelo es específico de CHRIS/PROBA-1; no se ha validado sobre otros sensores.

## Enlaces

- Hugging Face: https://huggingface.co/isp-uv-es/CHRIS-PROBA1
- mlstac (loader): https://github.com/mlstac/mlstac
- Notebook de demostración: `CHRIS-PROBA1-demo.ipynb` (en el repositorio de Hugging Face)
- Tarjeta en formato STAC/mlm: `mlm.json` (en el repositorio de Hugging Face)
- Tabla de bandas CHRIS → RGBN: `bands.json` (en el repositorio de Hugging Face)
- Paper, blog o demo adicionales: no disponible en la información proporcionada
