# Awais05/leaftrack-yolo11s-seg

## Resumen

LeafTrack es un modelo de segmentación de instancias basado en YOLO11-seg, desarrollado por Awais05, especializado en la segmentación de hojas individuales en imágenes cenitales de plantas. El modelo se entrenó con el framework LeafTrack sobre el conjunto de datos KOMATSUNA (Uchiyama et al., 2017), con una división por planta que garantiza que las plantas del conjunto de test nunca se vieron durante el entrenamiento. Resuelve un problema específico de fenotipado vegetal: separar hojas individuales superpuestas en imágenes de cultivo, algo crítico para medir biomasa, área foliar o contar órganos de forma automatizada.

La relevancia del modelo radica en su rendimiento medido: alcanza un Mask mAP50 de 0,965 y un Mask mAP50-95 de 0,806 en el conjunto de test, con una tasa de conteo exacto del 85% tras aplicar un filtro de hojas vecinas. El modelo se distribuye bajo licencia MIT, lo que facilita su uso comercial, y se integra en el ecosistema Ultralytics, aunque el autor proporciona una API propia a través del paquete `leaftrack`.

El tamaño del repositorio es de 0,0 GB, lo que sugiere que los pesos todavía no están publicados o son de muy pequeño tamaño. No hay descargas ni likes registrados, y la fecha de creación (2026-11-15) es posterior a la fecha actual, lo que indica que la información disponible puede ser incompleta o corresponder a un modelo recién publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11-seg (Ultralytics), segmentación de instancias |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de 0,0 GB; probablemente pesos Ultralytics `.pt`) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO11-seg de Ultralytics, una red de detección y segmentación de instancias en una sola etapa que predice máscaras por instancia junto con cajas delimitadoras. La variante "s" (small) indica un tamaño compacto dentro de la familia YOLO11, aunque no se especifican el número de parámetros ni la composición exacta de las capas.

El entrenamiento se realizó con el framework LeafTrack sobre el conjunto KOMATSUNA, que contiene imágenes cenitales de plantas de komatsuna (mostaza japonesa) en modalidades RGB y RGB-D. La división de datos se hizo por planta, de modo que las plantas del test no aparecen en entrenamiento, lo que proporciona una evaluación más realista de la generalización. No se detalla el número de tokens, la composición del dataset ni si hubo técnicas de aumento de datos o ajuste fino adicional. El modelo incorpora un post-procesado específico denominado "neighbour-leaf filter" que mejora sustancialmente las métricas de conteo y segmentación.

## Capacidades

- Segmentación de instancias de hojas individuales en imágenes cenitales de plantas.
- Detección de cajas delimitadoras por hoja con confianza asociada.
- Generación de máscaras binarias por instancia (formato compatible con la API `LeafInstance`).
- Post-procesado integrado para filtrar hojas vecinas y mejorar el conteo exacto.
- Funciona con imágenes RGB y RGB-D (aunque el modelo base procesa RGB; la variante RGB-D se evalúa en el conjunto de test).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (es un modelo de visión puro).
- No dispone de modo "thinking" ni capacidades de audio o texto.

## Casos de uso

- **Fenotipado vegetal automatizado**: el modelo segmenta hojas individuales en imágenes cenitales de cultivo, permitiendo medir área foliar, contar hojas y estimar biomasa de forma no destructiva. Su Mask mAP50 de 0,965 y su conteo exacto del 85% lo hacen adecuado para experimentos de agricultura de precisión.
- **Monitorización de crecimiento en invernadero**: con imágenes RGB-D capturadas periódicamente, el modelo puede rastrear la evolución del número de hojas por planta, usando la métrica SBD de 0,934 como indicador de calidad de segmentación.
- **Control de calidad en cultivos de hoja**: en producción de komatsuna u hortalizas de hoja, el modelo permite detectar plantas con recuento de hojas anómalo o con hojas dañadas, gracias a la tasa de conteo exacto del 85% en el conjunto de test.
- **Investigación en fitopatología**: la segmentación precisa de hojas individuales facilita el análisis de lesiones foliares por hoja, ya que cada instancia se puede aislar y analizar por separado.
- **Automatización de conteo en experimentos de estrés abiótico**: el modelo permite comparar el número de hojas entre plantas control y tratadas, con una desviación media de conteo (|DiC|) de 0,19 hojas por imagen, lo que reduce la necesidad de conteo manual.
- **Integración en pipelines de visión artificial agrícola**: al estar basado en Ultralytics y ofrecer una API Python (`LeafSegmenter.from_hub`), se puede integrar en sistemas de adquisición de imágenes en campo o en laboratorio para procesar lotes de imágenes con una latencia de 672 ms por imagen en CPU (2 hilos, imgsz 640).

## Benchmarks y rendimiento

Resultados en el conjunto de test (segmentación):

| Métrica | Valor |
|---|---|
| Mask mAP50 | 0,965 |
| Mask mAP50-95 | 0,806 |
| Box mAP50 | 0,968 |
| Box mAP50-95 | 0,815 |

Métricas de conteo de hojas a confianza 0,25 con filtro de hojas vecinas:

| Subconjunto | Imágenes | SBD ↑ | FBD ↑ | \|DiC\| ↓ | DiC | Conteo exacto |
|---|---|---|---|---|---|---|
| all | 240 | 0,934 ± 0,057 | 0,971 | 0,19 | +0,11 | 85% |
| multi | 180 | 0,936 ± 0,060 | 0,975 | 0,21 | +0,13 | 84% |
| rgbd | 60 | 0,929 ± 0,047 | 0,960 | 0,13 | +0,07 | 87% |

Efecto del post-procesado (test, todas las imágenes):

| Configuración | SBD ↑ | \|DiC\| ↓ | Conteo exacto |
|---|---|---|---|
| conf 0,25 (por defecto Ultralytics) | 0,766 | 1,24 | 23% |
| conf 0,25 (seleccionado en val) | 0,766 | 1,24 | 23% |
| conf 0,25 + filtro de hojas vecinas | 0,934 | 0,19 | 85% |

Latencia en CPU (2 hilos, imgsz 640): mediana 672 ms, p90 841 ms por imagen.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible en la información proporcionada. Al ser un modelo YOLO11-seg de variante "s", se espera un consumo moderado, pero no se especifica.
- **GPU recomendadas**: no disponible. Por el tamaño de la variante "s", es probable que funcione en GPUs consumer, pero no se confirma.
- **¿Cabe en GPU consumer?**: no disponible.
- **Opciones de despliegue**: el autor proporciona el paquete `leaftrack` con `LeafSegmenter.from_hub`. Al estar basado en Ultralytics, podría desplegarse con el runtime de Ultralytics, pero no se detallan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de visión de este tipo).
- **Latencia y throughput**: latencia en CPU de 672 ms (mediana) y 841 ms (p90) por imagen con 2 hilos e imgsz 640. No se proporcionan datos de latencia en GPU ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se han publicado comparativas con otras variantes de YOLO11-seg, Mask R-CNN u otros modelos de segmentación de hojas en la información disponible.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LeafTrack (YOLO11s-seg) | no disponible | no aplica | Mask mAP50 0,965 | MIT | Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Sesgos de dominio**: el modelo se entrenó exclusivamente con el conjunto KOMATSUNA (plantas de komatsuna en imágenes cenitales). Su rendimiento en otras especies, ángulos de cámara o condiciones de iluminación no está validado.
- **Riesgo de alucinación**: como modelo de segmentación, puede generar máscaras falsas o fusionar hojas superpuestas; el filtro de hojas vecinas mitiga parcialmente este problema, pero no lo elimina (conteo exacto del 85%).
- **Limitaciones de contexto o idioma**: no aplica (modelo de visión).
- **Restricciones de licencia**: los pesos se publican bajo MIT, lo que permite uso comercial. Sin embargo, el conjunto de datos KOMATSUNA tiene su propia atribución a Uchiyama et al. (2017), que debe respetarse.
- **Caveats para producción**: el repositorio tiene 0,0 GB, lo que sugiere que los pesos pueden no estar disponibles o ser de muy pequeño tamaño; verificar la disponibilidad real antes de usar. La fecha de creación (2026-11-15) es futura respecto a la fecha actual, lo que indica posible información incompleta. No se especifican requisitos de GPU ni formatos de pesos alternativos (ONNX, TensorRT), lo que limita la planificación de despliegue.

## Enlaces

- [Hugging Face: Awais05/leaftrack-yolo11s-seg](https://huggingface.co/Awais05/leaftrack-yolo11s-seg)
- [Repositorio LeafTrack en GitHub](https://github.com/mawais538/leaftrack)
- [Dataset KOMATSUNA](http://limu.ait.kyushu-u.ac.jp/~agri/komatsuna/)
- [Paper de KOMATSUNA (Uchiyama et al., ICCV Workshops 2017)](https://doi.org/10.1109/ICCVW.2017.172)
