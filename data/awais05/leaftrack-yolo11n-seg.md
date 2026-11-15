# Awais05/leaftrack-yolo11n-seg

## Resumen

LeafTrack es un modelo de segmentación de instancias basado en YOLO11n-seg, desarrollado por Awais05, especializado en la segmentación de hojas individuales en imágenes cenitales de plantas. Resuelve un problema concreto de fenotipado vegetal: la identificación y el conteo automático de hojas en cultivos, una tarea crítica para la monitorización del crecimiento y la evaluación de la salud de las plantas en agricultura de precisión. El modelo se distribuye con licencia MIT y está pensado para integrarse en el ecosistema LeafTrack, una librería de Python que expone una API de alto nivel para la segmentación.

La arquitectura subyacente es YOLO11n-seg, la variante nano de la familia YOLO11 de Ultralytics, adaptada para segmentación de instancias. El modelo se ha entrenado sobre el dataset KOMATSUNA (Uchiyama et al., 2017), con una división por planta que garantiza que las plantas del conjunto de test nunca se vieron durante el entrenamiento, lo que aporta una evaluación realista de la generalización. Los resultados publicados en la model card son notables: Mask mAP50 de 0,987 y Mask mAP50-95 de 0,825 en el conjunto de test.

El modelo es relevante ahora porque demuestra que un modelo de tamaño nano puede alcanzar un rendimiento muy alto en una tarea de dominio específico cuando se combina con post-procesado adecuado, como el filtro de hojas vecinas que eleva el SBD de 0,749 a 0,930. Su latencia en CPU (mediana de 240 ms con 2 hilos a imgsz 640) lo hace viable para despliegues en entornos sin GPU, lo que resulta práctico para aplicaciones agrícolas de campo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLO11n-seg (Ultralytics), segmentación de instancias |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | no disponible (librería ultralytics; probablemente .pt, no confirmado) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO11n-seg de Ultralytics, una red de detección y segmentación de instancias de una sola etapa. La variante "n" (nano) es la de menor tamaño de la familia YOLO11, diseñada para inferencia de baja latencia. La cabeza de segmentación produce máscaras por instancia junto con cajas delimitadoras y puntuaciones de confianza, lo que permite extraer cada hoja como una instancia independiente con su máscara, caja y confianza.

El entrenamiento se realizó con la herramienta LeafTrack sobre el dataset KOMATSUNA, un conjunto de imágenes cenitales de plantas de komatsuna (mostaza japonesa) con anotaciones de fenotipado 3D. La división de datos se hizo por planta, de modo que las plantas del conjunto de test no aparecieron en entrenamiento, lo que proporciona una medida honesta de la capacidad de generalización a plantas no vistas. No se dispone de información sobre el número de tokens, la composición exacta del dataset ni sobre el uso de técnicas de alineación como RLHF o DPO, que no aplican a un modelo de visión. La innovación técnica destacable es el post-procesado con filtro de hojas vecinas, que mejora sustancialmente las métricas de conteo y segmentación.

## Capacidades

- Segmentación de instancias de hojas individuales en imágenes cenitales de plantas.
- Producción de máscaras, cajas delimitadoras y puntuaciones de confianza por cada hoja detectada.
- Conteo de hojas por imagen, con una tasa de conteo exacto del 82% en el conjunto de test completo.
- Funcionamiento tanto en imágenes RGB como en imágenes RGB-D (el subconjunto rgbd del test alcanza un 85% de conteo exacto).
- Inferencia en CPU con latencia moderada (mediana de 240 ms, p90 de 422 ms con 2 hilos a imgsz 640).
- Integración con la librería LeafTrack mediante `LeafSegmenter.from_hub` y el método `predict`.
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multilingüismo, al ser un modelo puramente visual.

## Casos de uso

- Monitorización del crecimiento de cultivos: el modelo segmenta y cuenta hojas en imágenes cenitales tomadas periódicamente, permitiendo calcular tasas de crecimiento foliar y detectar anomalías en el desarrollo de la planta. Su alta tasa de conteo exacto (82%) lo hace adecuado para series temporales de fenotipado.
- Fenotipado de alto rendimiento en invernadero: integrado en un pipeline de captura automatizada, procesa imágenes RGB o RGB-D de plantas individuales para extraer métricas morfológicas (número de hojas, área foliar por instancia) sin intervención manual.
- Detección temprana de estrés hídrico o nutricional: la variación en el número y tamaño de hojas segmentadas entre imágenes de referencia y de seguimiento puede señalar estrés; el modelo proporciona las máscaras necesarias para calcular áreas foliares de forma consistente.
- Investigación agronómica y ensayos de variedades: permite comparar el desarrollo foliar entre variedades o tratamientos con una métrica objetiva y reproducible, reduciendo el sesgo del conteo manual y acelerando el análisis de experimentos.
- Automatización de conteo en campo con hardware de bajo coste: gracias a su latencia en CPU (240 ms por imagen con 2 hilos), puede desplegarse en dispositivos sin GPU, como Raspberry Pi o mini-PC, en estaciones de captura en invernadero.
- Control de calidad en viveros y producción de plántulas: el modelo puede verificar que cada planta cumple los estándares de número de hojas antes de su comercialización, integrado en una línea de inspección con cámara cenital.
- Anotación asistida de datasets: las máscaras generadas pueden servir como preanotaciones para acelerar el etiquetado manual de nuevas imágenes de hojas, reduciendo el coste de crear datasets de fenotipado.

## Benchmarks y rendimiento

Resultados en el conjunto de test según la model card:

| Métrica | Valor |
|---|---|
| Mask mAP50 | 0,987 |
| Mask mAP50-95 | 0,825 |
| Box mAP50 | 0,988 |
| Box mAP50-95 | 0,830 |

Métricas de hoja a confianza 0,30 con filtro de hojas vecinas activado:

| Subconjunto | Imágenes | SBD ↑ | FBD ↑ | \|DiC\| ↓ | DiC | Conteo exacto |
|---|---|---|---|---|---|---|
| all | 240 | 0,930 ± 0,059 | 0,970 | 0,25 | +0,15 | 82% |
| multi | 180 | 0,931 ± 0,062 | 0,975 | 0,27 | +0,15 | 81% |
| rgbd | 60 | 0,925 ± 0,047 | 0,956 | 0,17 | +0,13 | 85% |

Efecto del post-procesado (test, todas las imágenes):

| Configuración | SBD ↑ | \|DiC\| ↓ | Conteo exacto |
|---|---|---|---|
| conf 0,25 (por defecto de Ultralytics) | 0,738 | 1,60 | 22% |
| conf 0,3 (seleccionada en validación) | 0,749 | 1,45 | 24% |
| conf 0,3 + filtro de hojas vecinas | 0,930 | 0,25 | 82% |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tamaño nano de YOLO11n-seg, es previsible que sea inferior a 1 GB en FP32, aunque este dato no está confirmado en la model card.
- GPU recomendadas: no especificadas; cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) debería ser suficiente para inferencia en tiempo real, pero no hay datos confirmados.
- Compatibilidad con GPU consumer: previsiblemente sí, dado el tamaño nano del modelo, aunque no se confirma en la información disponible.
- Despliegue: la librería Ultralytics soporta exportación a múltiples formatos (ONNX, TensorRT, etc.); la model card solo documenta el uso mediante `leaftrack.segment.LeafSegmenter`. No se detallan opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a modelos de visión.
- Latencia: en CPU con 2 hilos e imgsz 640, mediana de 240 ms y p90 de 422 ms por imagen. No se proporcionan datos de throughput en GPU.

## Comparativa con modelos similares

No se dispone de comparaciones con otros modelos en la información proporcionada. La model card no incluye referencias a alternativas de segmentación de hojas ni a otras variantes de YOLO11-seg. No disponible.

## Limitaciones y advertencias

- El modelo está entrenado específicamente sobre el dataset KOMATSUNA (plantas de komatsuna en imágenes cenitales); su generalización a otras especies, ángulos de cámara o condiciones de iluminación no está validada.
- La tasa de conteo exacto es del 82% en el conjunto de test completo; en el 18% restante el número de hojas detectadas no coincide con el real, lo que puede afectar a aplicaciones que requieran conteos exactos.
- El rendimiento depende críticamente del post-procesado: sin el filtro de hojas vecinas, el conteo exacto cae al 24% y el SBD a 0,749, por lo que es imprescindible aplicar la configuración de confianza 0,3 y el filtro para obtener los resultados publicados.
- No se han publicado datos sobre sesgos, riesgo de alucinación (no aplica en el sentido generativo, pero sí pueden producirse falsos positivos o negativos en la detección) ni sobre el comportamiento en dominios fuera de distribución.
- La licencia MIT permite uso comercial, pero el dataset KOMATSUNA tiene su propia atribución (Uchiyama et al., 2017); conviene revisar las condiciones de uso del dataset si se redistribuyen datos derivados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no hay validación externa ni reportes de la comunidad sobre su comportamiento en producción.
- No se especifican los formatos de pesos disponibles ni los tipos de cuantización soportados, lo que limita la planificación del despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Awais05/leaftrack-yolo11n-seg
- Repositorio LeafTrack: https://github.com/mawais538/leaftrack
- Dataset KOMATSUNA: http://limu.ait.kyushu-u.ac.jp/~agri/komatsuna/
- Paper del dataset: Uchiyama et al., "An Easy-to-Setup 3D Phenotyping Platform for KOMATSUNA Dataset", ICCV Workshops 2017 (no se proporciona URL directa en la información disponible).
