# mvdelibas/turk-trafik-levha-yolo11s

## Resumen

`turk-trafik-levha-yolo11s` es un detector de objetos basado en YOLO11s, desarrollado por el usuario mvdelibas, especializado en el reconocimiento de señales de tráfico turcas en imágenes de calle y de cámara a bordo de vehículo. Resuelve un problema concreto de nicho: la detección de las 39 señales de tráfico más comunes del Reglamento turco, más dos clases comodín (`diger_levha` para cualquier señal no listada y `engelli_isareti` para la señal de acceso para discapacitados). El modelo está pensado para equipos de conducción autónoma (como los participantes en Teknofest Robotaksi), sistemas de asistencia al conductor, inventarios municipales de señalización y aplicaciones de accesibilidad.

La arquitectura es YOLO11s de Ultralytics, una red de detección de una etapa con backbone CSP y cabeza desacoplada, en su variante "small". Se distribuye en formato `.pt` (PyTorch/Ultralytics) y también con exportación ONNX, según los tags del repositorio. El repositorio ocupa 0,1 GB y acumula 180 descargas en el momento de la consulta.

La relevancia actual del modelo reside en su enfoque de evaluación honesto: el autor mide el rendimiento sobre un conjunto de test real de 329 fotografías de Mapillary procedentes de 22 provincias turcas no vistas en entrenamiento, con auditoría de fuga de datos (hash de imagen, secuencia, distancia de 25 m, dHash de 256 bits). Alcanza un mAP@50 del 81,6 % en las 34 clases con cajas reales, con una precisión del 83,0 % y una exhaustividad del 75,9 % a confianza 0,37. La licencia es CC BY-SA 4.0 y el autor restringe explícitamente el uso a investigación, no para decisiones críticas de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11s (Ultralytics), detector de una etapa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye en `.pt`; los tags indican exportación ONNX) |
| Idiomas soportados | tr (turco; las clases están en turco) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | `.pt` (PyTorch/Ultralytics) y ONNX |

## Arquitectura y entrenamiento

El modelo es un YOLO11s, la variante "small" de la familia YOLO11 de Ultralytics: un detector de objetos de una etapa con backbone basado en bloques CSP (Cross Stage Partial), cuello de tipo PAN-FPN y cabeza de detección desacoplada con asignación dinámica de etiquetas. Detecta 41 clases de señales de tráfico turcas. La entrada de inferencia recomendada por el autor es de 1024 píxeles (`imgsz=1024`), superior a la resolución estándar de 640, lo que resulta coherente con la necesidad de detectar señales pequeñas en imágenes de calle.

El entrenamiento parte de la versión v2 (`trafik-birlesik-v2-50k-yolo11s`) y se refuerza con datos adicionales para las dos clases débiles: `engelli_isareti` y `diger_levha`. En concreto, se añaden 5.000 escenas sintéticas (seis variantes de la señal de discapacitados: cuadrada sin "P", vertical, horizontal y cuadrada con "P", con texto "ENGELLİ PARK YERİ" y con flecha; además de 35 dibujos de señales oficiales no incluidas en la lista, como otros límites de velocidad, prohibiciones de camión/bicicleta/peatón, límite de altura, direcciones, señales de advertencia, señales luminosas, callejón sin salida, placas complementarias y señales de dirección azules/verdes/blancas) y 190 fotografías reales de Mapillary de 42 provincias. El aumento por volteo horizontal está desactivado (`fliplr=0`) porque las señales tienen orientación. No se especifican en la información disponible el número total de tokens, la composición completa del dataset ni si se aplicó RLHF/DPO (no aplica a un detector).

## Capacidades

- Detección de objetos en imágenes de calle y de cámara a bordo, con 41 clases de señales de tráfico turcas.
- Clasificación de señales de peligro, prohibición, obligación, información, límites de velocidad y placas complementarias.
- Clase comodín `diger_levha` para señales no listadas (señales de dirección, placas complementarias, otros límites de velocidad, etc.).
- Detección específica de la señal de acceso para discapacitados (`engelli_isareti`) en sus variantes con y sin "P", y en placas compuestas (la caja cubre solo la parte del símbolo).
- Inferencia a resolución 1024 px, adecuada para señales pequeñas en escenas amplias.
- Exportación a ONNX para despliegue en producción.
- Integración directa con la librería Ultralytics (`YOLO(...).predict(...)`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de lenguaje: es exclusivamente un detector visual.

## Casos de uso

- **Conducción autónoma y Teknofest Robotaksi**: el modelo detecta señales en tiempo real desde la cámara del vehículo y alimenta el módulo de percepción para que el planificador ajuste la velocidad o la trayectoria (por ejemplo, ante `hiz_50`, `dur` o `tali_yol`). Su resolución de 1024 px y su mAP@50 del 81,6 % en fotos reales no vistas lo hacen adecuado para prototipos de competición.
- **Sistemas de asistencia al conductor (ADAS)**: reconocimiento de límites de velocidad y señales de prohibición para mostrar avisos en el salpicadero. La clase `hiz_50` alcanza un AP50 del 85,4 % y `hiz_30` un 78 %, suficiente para avisos no críticos.
- **Inventario municipal de señalización**: procesamiento por lotes de imágenes de Mapillary o de vehículos municipales para catalogar y geolocalizar señales, detectando también las no inventariadas mediante `diger_levha`.
- **Aplicaciones de accesibilidad**: localización de plazas de aparcamiento reservadas y accesos para discapacitados mediante `engelli_isareti` (AP50 del 83 % en el test real), integrable en apps de navegación peatonal o de estacionamiento.
- **Análisis de seguridad vial**: extracción de señales de peligro (`okul_gecidi`, `kasis`, `tehlikeli_viraj_sag/sol`) en tramos de carretera para estudios de siniestralidad o auditorías de infraestructura.
- **Generación de datasets y anotación asistida**: uso del detector para preanotar imágenes nuevas y acelerar el etiquetado humano en proyectos de visión por computador centrados en Turquía.
- **Investigación en detección de objetos de dominio específico**: el modelo y su conjunto de test auditado (329 fotos, 22 provincias, control de fuga) sirven como referencia reproducible para comparar detectores en señalización turca.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados de forma independiente). Conjunto de test: 329 fotografías reales de Mapillary de 22 provincias turcas no vistas en entrenamiento, 679 cajas, 250 secuencias de captura y 43 usuarios de Mapillary. Medición local con `imgsz` 1024, conf 0,001, NMS IoU 0,7, emparejamiento IoU ≥ 0,5 y AP de 101 puntos.

| Metrica | v2 | v3 (este modelo) |
|---|---|---|
| mAP@50 (34 clases con cajas reales) | 80,7 % | **81,6 %** |
| Precision / Recall (mejor umbral F1) | 79,1 % / 76,2 % (conf 0,30) | **83,0 % / 75,9 %** (conf 0,37) |
| Precision / Recall total @ conf 0,35 | 84,5 % / 62,0 % | **87,8 % / 63,8 %** |
| `engelli_isareti` AP50 (9 cajas) | 68,2 % | **83,0 %** |
| `diger_levha` AP50 (239 cajas) | 42,3 % | **45,5 %** |

Rendimiento por clase (P / R / AP50 al mejor umbral F1):

| Clase | Cajas reales | v2 | v3 |
|---|---|---|---|
| `diger_levha` | 239 | 63,3 / 32,5 / 42,3 | 76,9 / 29,2 / 45,5 |
| `tali_yol` | 37 | 91,1 / 94,6 / 95,8 | 92,0 / 93,3 / 95,9 |
| `yaya_gecidi` | 37 | 84,7 / 81,1 / 78,3 | 87,0 / 83,8 / 82,1 |
| `hiz_50` | 30 | 89,9 / 80,0 / 87,9 | 97,3 / 80,0 / 85,4 |
| `dur` | 24 | 100,0 / 83,3 / 94,6 | 96,3 / 75,0 / 91,4 |
| `kasis` | 22 | 74,2 / 86,4 / 83,8 | 77,6 / 90,9 / 88,7 |
| `hiz_30` | 20 | 100,0 / 62,6 / 80,9 | 100,0 / 55,8 / 78,0 |

## Requisitos de hardware

- **VRAM estimada**: no disponible en la información proporcionada. Para un YOLO11s a 1024 px, la inferencia en FP32 suele requerir del orden de 2-4 GB de VRAM, pero este dato no está confirmado por el autor.
- **GPU recomendadas**: no especificadas. Por el tamaño de la familia YOLO11s, es esperable que funcione en GPUs de consumo, pero la información disponible no detalla modelos concretos (A100, H100, RTX 4090, etc.).
- **GPU de consumo**: no confirmado explícitamente; el tamaño del repositorio (0,1 GB) y la variante "s" sugieren que cabe en GPUs de consumo, pero no hay dato oficial.
- **Opciones de despliegue**: Ultralytics (nativo, vía `.pt`), ONNX Runtime (exportación ONNX indicada en los tags). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector visual).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de comparación con otros detectores de señalización turca en la información proporcionada. La única comparación disponible es con la versión anterior del mismo modelo (v2), que se recoge en la sección de benchmarks.

| Modelo | Parametros | Contexto | mAP@50 (test real) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| turk-trafik-levha-yolo11s (v3) | no disponible | no aplica | 81,6 % | CC BY-SA 4.0 | Hugging Face |
| trafik-birlesik-v2-50k-yolo11s | no disponible | no aplica | 80,7 % | no disponible | Hugging Face (referenciado) |
| Otros detectores de señalización turca | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Uso restringido**: el autor indica explícitamente "research use, not for safety-critical decisions" (uso de investigación, no para decisiones críticas de seguridad). No debe emplearse como único sistema en frenado de emergencia o control autónomo real.
- **Rendimiento modesto en clases comodín**: `diger_levha` obtiene un AP50 del 45,5 % con una exhaustividad del 29,2 %, lo que implica que muchas señales no listadas pasan sin detectar.
- **Exhaustividad limitada en algunas clases**: `hiz_30` tiene una exhaustividad del 55,8 % y `dur` del 75,0 %, lo que puede provocar omisiones en escenarios reales.
- **Dominio restringido a Turquía**: el modelo está entrenado y evaluado exclusivamente con señalización turca; no es transferible a otros países sin reentrenamiento.
- **Riesgo de falsos positivos**: el umbral de confianza recomendado (0,37) es relativamente bajo; en escenas con señales pequeñas o degradadas puede aumentar la tasa de falsos positivos.
- **Sesgos del dataset**: el conjunto de test procede de Mapillary, con posibles sesgos de cobertura geográfica, condiciones de iluminación y calidad de cámara. La información no detalla la distribución de condiciones meteorológicas ni nocturnas.
- **Licencia CC BY-SA 4.0**: permite uso comercial, pero obliga a atribuir y a compartir las obras derivadas bajo la misma licencia, lo que puede ser incompatible con productos propietarios.
- **Datos de benchmarks no verificados**: los resultados del model-index están marcados como `verified: false`; no han sido auditados de forma independiente.
- **Sin datos de latencia ni requisitos de hardware**: no se puede garantizar el cumplimiento de restricciones de tiempo real sin mediciones propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mvdelibas/turk-trafik-levha-yolo11s
- Demo en el navegador (Hugging Face Spaces): https://huggingface.co/spaces/mvdelibas/turk-trafik-levha-demo
- Repositorio de origen en EVREN (plataforma nacional de IA de Turquía): https://evren.ssyz.org.tr/users/u43bd0650c87e
- Ultralytics (librería): https://github.com/ultralytics/ultralytics
- Mapillary (fuente de imágenes): https://www.mapillary.com
