# mark000071/small-ship-det-satellite-communication

## Resumen

Small-ship-det-satellite-communication es un repositorio de artefactos de investigación publicado por el usuario mark000071 que reúne los pesos, resultados y registros de un proyecto de detección de embarcaciones pequeñas sobre imágenes ópticas de satélites en órbita baja (LEO). No se trata de un modelo de lenguaje, sino de un conjunto de detectores de objetos basados en la arquitectura RT-DETR de Ultralytics, entrenados sobre el dataset propio S2-AIS-DK (imágenes Sentinel-2 de Dinamarca combinadas con señales AIS). El repositorio incluye 37 ejecuciones de entrenamiento con distintas variantes y ablaciones, además de un códec semántico de enlace descendente denominado TASCO.

El interés del proyecto reside en su enfoque de comunicación semántica: en lugar de transmitir imágenes completas desde el satélite, se envía una representación comprimida (TASCO) que el receptor decodifica antes de ejecutar la detección. Los resultados publicados muestran que con 8192 símbolos por tesela y una tasa de compresión R = 0,005 se conserva un AP50 de 24,1 en condiciones de ruido AWGN a 10 dB, frente a 26,6 sin compresión. El modelo principal reportado (GeoFence-t) alcanza un AP de 10,7 ± 1,5 y un AP50 de 26,5 ± 2,2 en el conjunto de test, con 1,3 falsas alarmas peligrosas por cada 100 teselas.

El estado del proyecto es explícitamente "work in progress" (fecha 2026-11-21), con descargas y likes nulos en Hugging Face, y varias funcionalidades declaradas como no soportadas todavía (cabezas cinemáticas PhysKin y mediciones en Jetson AGX). Es relevante para investigadores en teledetección, detección de objetos en imágenes satelitales y comunicación semántica, no para aplicaciones de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RT-DETR (Ultralytics), con variantes FCES (FasterNet + CGA + EUCB-SC) y GeoFence-DETR; entrada de 7 canales (B, G, R, NIR + 3 páginas de prior) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuyen checkpoints .pt y un grafo ONNX de referencia) |
| Idiomas soportados | no disponible (modelo de visión; sin capacidades lingüísticas) |
| Licencia | AGPL-3.0 (heredada de Ultralytics); los modelos entrenados con HRSC2016, MASATI, VAI y ShipRS quedan sujetos además a los términos de esos datasets; datos S2 © Copernicus, DMA y colaboradores de OpenStreetMap (ODbL) |
| Formato de pesos | checkpoints `.pt` de Ultralytics (`best.pt` por ejecución) y un grafo ONNX (`deploy/rtdetr_fces_640_randinit.onnx`, inicialización aleatoria, solo para medición de latencia) |

## Arquitectura y entrenamiento

El núcleo es RT-DETR, un detector transformer end-to-end de la familia DETR implementado en Ultralytics, en su variante R18 (backbone ResNet-18) y en variantes propias. La variante FCES sustituye o complementa el backbone con FasterNet e incorpora dos módulos propios: CGA (atención guiada por contexto, presumiblemente) y EUCB-SC. GeoFence-DETR añade tres mecanismos sobre RT-DETR: tokens de prior (`t`), sesgo logit de valla (`f`) y calibración por consulta (`c`), combinables en las variantes `geo-t`, `geo-f`, `geo-c`, `geo-tf` y `geo-tfc`. PhysKin-DETR incorpora cabezas cinemáticas, aunque el autor indica que su error de rumbo está a nivel de azar.

Los modelos S2 reciben 7 canales de entrada: B, G, R y NIR más tres "páginas de prior"; la variante `rgbn` usa solo los cuatro primeros. El dataset principal es S2-AIS-DK (Sentinel-2 con señales AIS de Dinamarca), complementado con HRSC2016, MASATI, VAI y ShipRS en otras ejecuciones. La nomenclatura de ejecuciones es `<dataset>_<modelo>_s<semilla>`, con 37 entrenamientos documentados en `docs/RUN_LOG.md`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicó RLHF/DPO (no aplicable a un detector). El componente TASCO es un códec de enlace descendente semántico entrenado por separado (`tasco/s2_tasco_g64K2[_mapgate]/`), con configuraciones en `tasco/configs/`.

## Capacidades

- Detección de objetos (embarcaciones) en imágenes ópticas multiespectrales de satélites LEO, con entrada de 4 o 7 canales.
- Detección específica de embarcaciones pequeñas (menos de 50 m de eslora), con recall reportado de 21,7 ± 8,2 (R18 RGBN) y 28,8 ± 6,0 (GeoFence-t).
- Salida con puntuaciones de confianza y cajas delimitadoras en formato COCO, evaluable con métricas AP/AP50.
- Codificación semántica de enlace descendente mediante TASCO: compresión de la tesela a 8192 símbolos con tasa R = 0,005, robusta a ruido AWGN y a traza LEO.
- Variantes con mecanismos de prior geoespacial (GeoFence) para reducir falsas alarmas en clases de mapa.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un detector de visión puro.
- Las cabezas cinemáticas PhysKin (rumbo y velocidad) no son funcionales: error de rumbo a nivel de azar.

## Casos de uso

- Monitorización de tráfico marítimo en aguas danesas: el modelo detecta embarcaciones en teselas Sentinel-2 y se cruza con AIS para identificar barcos sin transpondedor activo, aprovechando el entrenamiento específico sobre S2-AIS-DK.
- Detección de pesca ilegal en zonas costeras: con la variante GeoFence-t, que reduce las falsas alarmas peligrosas a 1,3 por 100 teselas, se puede priorizar la revisión humana sobre las detecciones de mayor confianza.
- Enlace descendente de bajo ancho de banda desde satélites LEO: el códec TASCO permite enviar 8192 símbolos por tesela en lugar de la imagen completa, manteniendo AP50 de 24,1 a 10 dB de AWGN, adecuado para constelaciones con presupuesto de radio limitado.
- Investigación en comunicación semántica: el repositorio incluye 37 ejecuciones con ablaciones de módulos (fn, cga, eucb) y comparativas de bandas de entrada (rgb vs rgbn), útil para reproducir y extender experimentos.
- Benchmarking de detectores en teledetección: los JSON de `results/repro/` y `results/s2ais/` permiten comparar AP, falsas alarmas por clase de mapa y recall por eslora AIS contra otros detectores.
- Evaluación de latencia en despliegue: el grafo ONNX `rtdetr_fces_640_randinit.onnx` (inicialización aleatoria) sirve para medir latencia de inferencia sin necesidad de pesos entrenados.
- Análisis de robustez ante ruido de canal: la comparación entre AP50 con y sin compresión TASCO (24,1 frente a 26,6 a 10 dB) permite estudiar el compromiso entre tasa de compresión y precisión de detección.

## Benchmarks y rendimiento

Resultados en el conjunto de test S2-AIS-DK, media de 3 semillas:

| Modelo | AP | AP50 | Falsas alarmas peligrosas / 100 teselas | Recall, barcos < 50 m |
|---|---|---|---|---|
| RT-DETR-R18 RGBN | 10,3 ± 1,3 | 24,6 ± 1,7 | 2,7 ± 1,6 | 21,7 ± 8,2 |
| GeoFence-t | 10,7 ± 1,5 | 26,5 ± 2,2 | 1,3 ± 0,4 | 28,8 ± 6,0 |

Enlace descendente TASCO (8192 símbolos por tesela, R = 0,005, detector R18-RGBN congelado):

| Condición | AP50 |
|---|---|
| AWGN 10 dB | 24,1 |
| Traza LEO 10 dB | 23,7 |
| Sin compresión (referencia) | 26,6 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, por no ser aplicables a un detector de objetos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un RT-DETR-R18 a 640×640 suele requerir del orden de 2-4 GB en FP32, pero el autor no publica mediciones.
- GPU recomendadas: no disponible. No se han publicado mediciones en Jetson AGX ni en otras plataformas.
- Cabe en GPU de consumo: no confirmado por el autor; por el tamaño del backbone (ResNet-18) es plausible en GPUs de consumo, pero no hay dato verificado.
- Opciones de despliegue: Ultralytics RTDETR (requiere el fork parcheado del repositorio GitHub, `code/third_party/setup_ultralytics.sh`), y ONNX Runtime para el grafo de referencia `deploy/rtdetr_fces_640_randinit.onnx`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a visión).
- Latencia y throughput: no disponibles. El grafo ONNX de inicialización aleatoria está pensado para medir latencia, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Small-ship-det (GeoFence-t) | RT-DETR + GeoFence | no disponible | 7 canales, teselas Sentinel-2 | AP 10,7; AP50 26,5; FA 1,3/100 | AGPL-3.0 | Hugging Face, 0 descargas |
| RT-DETR-R18 (Ultralytics, base) | RT-DETR | no disponible | 3 canales RGB | no disponible en esta ficha | AGPL-3.0 | Público en Ultralytics |
| Otros detectores de barcos en teledetección | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos verificados de otros detectores de embarcaciones en la información proporcionada; la comparativa se limita a la variante base de RT-DETR-R18 del propio repositorio.

## Limitaciones y advertencias

- Proyecto en estado "work in progress" (2026-11-21): sin descargas ni likes, con funcionalidades declaradas como no soportadas (cabezas PhysKin con error de rumbo a nivel de azar, sin mediciones en Jetson AGX).
- Rendimiento absoluto bajo: AP de 10,3-10,7 y AP50 de 24,6-26,5, con recall de barcos pequeños por debajo del 30 %; no apto para producción sin revisión humana.
- Riesgo de falsas alarmas: 1,3-2,7 falsas alarmas peligrosas por cada 100 teselas, lo que exige umbrales conservadores.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte para uso en red; además, los modelos entrenados con HRSC2016, MASATI, VAI y ShipRS quedan sujetos a los términos de esos datasets, que no se redistribuyen.
- Datos S2 con atribución obligatoria a Copernicus, DMA y colaboradores de OpenStreetMap (ODbL).
- Sesgos geográficos: entrenado sobre aguas danesas (S2-AIS-DK); el rendimiento en otras regiones no está validado.
- El código del repositorio GitHub está privado por ahora, lo que dificulta la reproducibilidad completa pese a publicar pesos y logs.
- El checkpoint ONNX incluido es de inicialización aleatoria y no sirve para inferencia real, solo para medir latencia.
- Sin capacidades lingüísticas, de agentes ni de tool calling; no debe evaluarse con benchmarks de lenguaje.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/mark000071/small-ship-det-satellite-communication
- Dataset S2-AIS-DK: https://huggingface.co/datasets/mark000071/S2-AIS-DK
- Repositorio GitHub (privado por ahora): `mark000071/small-ship-det-satellite-communication`
- Documentación interna del repo: `results/summary/*.md`, `docs/RUN_LOG.md`, `tasco/configs/`
- Ultralytics RT-DETR: https://docs.ultralytics.com/models/rtdetr/
