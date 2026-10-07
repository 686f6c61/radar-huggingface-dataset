# qualcomm/WeDetect

## Resumen

WeDetect (repositorio `qualcomm/WeDetect`) es un detector de objetos condicionado por texto que sigue una estrategia "prompt-then-detect": los nombres de las clases se introducen como texto y se reparametrizan dentro de los pesos del modelo antes de la exportación, de modo que el artefacto final es un detector de vocabulario fijo que se ejecuta de forma eficiente en el dispositivo. Qualcomm publica esta versión optimizada para sus SoC (Snapdragon y Dragonwing), partiendo de la implementación de referencia de WeChatCV.

El checkpoint utilizado es `wedetect_tiny`: 37,3 M de parámetros en el detector y 3,00 en el codificador de texto, con entrada de 640x640 píxeles y regresión de cajas en formato LTRB sobre mapas de características multiescala (strides 8, 16 y 32). El detector en precisión float ocupa 143 MB; la variante `mixed_with_float` baja a 35,9 MB.

Su relevancia actual está en la inferencia en tiempo real sobre NPU: Qualcomm reporta latencias de 8,8 ms en Snapdragon 8 Elite Gen 5 y de 7,2 ms con el runtime QNN_DLC y precisión mixta, además de 76,4 ms en un Snapdragon 8 Gen 1, lo que lo sitúa como pieza lista para producción en visión embebida (móvil, automoción, IoT industrial) sin depender de GPU en la nube.

## Especificaciones techniques

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos condicionado por texto (prompt-then-detect) basado en la implementación WeDetect de WeChatCV; regresión LTRB sobre mapas de características multiescala con strides 8, 16 y 32 |
| Parametros totales | 37,3 M (detector) + 3,00 (codificador de texto); checkpoint `wedetect_tiny` |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica: no es un modelo de lenguaje. Resolución de entrada fija de 640x640 píxeles |
| Tipos de cuantizacion | Exportaciones en `float` y `mixed_with_float`; no se documentan variantes INT8 o INT4 en la información disponible |
| Idiomas soportados | No disponible. Las clases se fijan como texto en los pesos durante la exportación; no se documenta el comportamiento multilingüe de los prompts |
| Licencia | GPL-3.0 |
| Formato de pesos | PyTorch (checkpoint original), ONNX y QNN DLC (exportaciones para dispositivos Qualcomm) |

## Arquitectura y entrenamiento

WeDetect es un detector denso de una sola etapa con condicionamiento textual: los embeddings de los nombres de clase se proyectan y se integran en los pesos del detector durante la fase de exportación (reparameterization), de forma que en inferencia no se ejecuta ningún codificador de texto pesado. La cabeza de detección regresa cajas en formato LTRB (Left-Top-Right-Bottom) sobre tres niveles de características con strides 8, 16 y 32, lo que cubre objetos de distintos tamaños en una única pasada. El codificador de texto del despliegue es mínimo (3,00 parámetros; 592 B en float y 13,3 KB en `mixed_with_float`), coherente con un vocabulario ya incrustado en el detector.

Qualcomm no publica en esta ficha detalles del entrenamiento: no se indican el volumen de tokens o imágenes, la composición del dataset, ni si hubo etapas de ajuste por refuerzo o preferencias (no aplicables habitualmente en detección, pero no confirmados). El modelo se distribuye como reexportación optimizada de la implementación de WeChatCV, y la innovación destacable es precisamente el flujo de exportación: compilación y perfilado mediante Qualcomm AI Hub Workbench para generar artefactos ONNX o QNN DLC que se ejecutan en la NPU Hexagon.

## Capacidades

- Detección de objetos en tiempo real con vocabulario fijo: el usuario define las clases como texto antes de exportar y el modelo detecta únicamente esas categorías.
- Localización precisa mediante regresión LTRB, con cajas delimitadoras por instancia y puntuación de confianza asociada.
- Detección multiescala gracias a los mapas de características con strides 8, 16 y 32, adecuada para escenas con objetos de tamaños heterogéneos.
- Ejecución en NPU de Qualcomm (Snapdragon y Dragonwing) a través del runtime QNN (formato QNN DLC) o de ONNX Runtime.
- Exportación configurable con la librería `qai-hub-models`: pesos personalizados (checkpoints ajustados), formas de entrada propias y configuraciones de dispositivo y runtime objetivo.
- No dispone de generación de texto, razonamiento, código, matemáticas ni capacidades conversacionales.
- No se documenta soporte de tool calling, function calling ni flujos de agente multi-paso (no aplica a un detector).
- No se documentan capacidades de segmentación, pose, audio ni visión generativa.

## Casos de uso

- Visión para automoción en plataformas Snapdragon Ride: los SoC SA8650P y SA8295P aparecen en la tabla de rendimiento con 30,3 ms y 55,9 ms respectivamente, lo que permite integrar detección de peatones, vehículos y señalización en la propia unidad de a bordo sin depender de conectividad.
- Inspección industrial en el borde: con 20,3 ms en Dragonwing IQ-8275 y 20,8 ms en IQ-9075, el modelo puede ejecutarse en cámaras inteligentes o PLC con NPU para detectar defectos o piezas mal posicionadas en línea de producción.
- Búsqueda y clasificación de fotos en el dispositivo: al ser un detector de vocabulario fijo, se puede exportar con clases como "persona", "perro", "recibo" o "documento" y etiquetar la galería local sin enviar imágenes a la nube.
- Comercio minorista y análisis de lineal: exportado con clases de producto o de estante, permite medir presencia y huecos en tiempo real en cámaras de tienda con hardware Snapdragon de bajo consumo.
- Robótica móvil y AGV: la latencia de 7,2-11,2 ms con QNN_DLC en plataformas Snapdragon 8 Elite y Q-8750 deja margen suficiente dentro de un bucle de control a 20-30 Hz para detección de obstáculos y objetos de manipulación.
- Salud y asistencia en el hogar: detección de objetos cotidianos (medicación, alimentos, dispositivos de movilidad) en aplicaciones de accesibilidad ejecutadas íntegramente en el terminal, con el consiguiente beneficio de privacidad al no salir los datos del dispositivo.
- Aforo y seguridad en espacios públicos: conteo y localización de personas con vocabulario cerrado, desplegable en cámaras con Snapdragon 8 Gen 1 (76,4 ms) cuando el requisito de tasa de refresco es moderado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (por ejemplo, mAP sobre COCO) en la información disponible. La model card únicamente proporciona latencias y rangos de memoria pico por chipset y runtime. Muestra representativa:

| Modelo | Runtime | Precision | Chipset | Tiempo de inferencia (ms) | Memoria pico (MB) | Unidad de cómputo |
|---|---|---|---|---|---|---|
| detector | QNN_DLC | mixed_with_float | Snapdragon 8 Elite Gen 5 for Galaxy Mobile | 7,235 | 5 - 271 | NPU |
| detector | QNN_DLC | float | Snapdragon 8 Elite Gen 5 for Galaxy Mobile | 8,068 | 5 - 258 | NPU |
| detector | ONNX | float | Snapdragon 8 Elite Gen 5 for Galaxy Mobile | 8,822 | 3 - 248 | NPU |
| detector | QNN_DLC | float | Snapdragon 8 Elite for Galaxy Mobile | 11,125 | 0 - 248 | NPU |
| detector | ONNX | float | Snapdragon X2 Elite | 11,486 | 5 - 5 | NPU |
| detector | ONNX | mixed_with_float | Snapdragon 8 Gen 3 Mobile | 14,242 | 16 - 517 | NPU |
| detector | QNN_DLC | float | Qualcomm Dragonwing Q-8750 | 11,125 | 0 - 248 | NPU |
| detector | QNN_DLC | float | Qualcomm SA8650P | 30,339 | 3 - 297 | NPU |
| detector | QNN_DLC | float | Qualcomm Dragonwing IQ-9075 | 30,898 | 7 - 14 | NPU |
| detector | QNN_DLC | float | Qualcomm SA8295P | 55,867 | 0 - 246 | NPU |
| detector | ONNX | float | Snapdragon 8 Gen 1 Mobile | 76,379 | 1 - 316 | NPU |

Todos los valores proceden de la tabla "Performance Summary" de la model card, que incluye mediciones adicionales para más chipsets y para el runtime ONNX en precisión `mixed_with_float` (por ejemplo, 11,004 ms en Snapdragon 8 Elite Gen 5 y 31,282 ms en Snapdragon 8 Gen 1). Todas las entradas registradas se ejecutan en NPU.

## Requisitos de hardware

- El modelo está diseñado para NPU de Qualcomm: Snapdragon 8 Elite Gen 5, 8 Elite, 8 Gen 3, 8 Gen 1, Snapdragon X Elite y X2 Elite, y las plataformas Dragonwing IQ-8275, IQ-9075, IQ-X7181, Q-8750, QCS8550, QCS8450, además de los SoC de automoción SA8650P, SA8255P y SA8295P.
- Tamano de pesos: 143 MB el detector en float y 35,9 MB en `mixed_with_float`; el codificador de texto ocupa 592 B en float y 13,3 KB en `mixed_with_float`. No se publican mediciones de VRAM para GPU.
- Memoria pico reportada en NPU: entre 5 y 271 MB en Snapdragon 8 Elite Gen 5 y hasta 517-538 MB en Snapdragon 8 Gen 3 y 8 Gen 1 con precisión mixta.
- GPU de consumo: no hay datos de ejecución en GPU en la información disponible. Los pesos (143 MB en float) caben en cualquier GPU consumer actual, pero Qualcomm no publica latencias ni consumo para A100, H100 o RTX 4090, por lo que cualquier cifra al respecto sería una estimación no verificada.
- Opciones de despliegue: Qualcomm AI Hub Workbench y la librería `qai-hub-models` para compilar y exportar; runtimes QNN (QNN_DLC) y ONNX Runtime en el dispositivo.
- Latencia: 7,2-8,8 ms en los Snapdragon 8 Elite y 11,1-11,5 ms en 8 Elite / X2 Elite con QNN_DLC; 20,3-20,9 ms en Dragonwing IQ-8275, IQ-9075 e IQ-X7181; 30,3-30,9 ms en SA8650P y SA8255P; 55,9 ms en SA8295P; 76,2-76,4 ms en Snapdragon 8 Gen 1 y QCS8450.
- Rendimiento (throughput): no disponible de forma explícita; a partir de las latencias publicadas, en Snapdragon 8 Elite Gen 5 se superan las 100 inferencias por segundo, pero no se documenta el pipeline completo ni el preprocesado.

## Comparativa con modelos similares

La información proporcionada no incluye comparativas con otros detectores, ni datos de precisión que permitan situar a WeDetect frente a alternativas. La siguiente tabla recoge únicamente los datos disponibles de este modelo y deja constancia de la ausencia de datos verificables para los competidores de la misma categoría:

| Modelo | Categoria | Parametros | Licencia | Datos en esta ficha |
|---|---|---|---|---|
| WeDetect (`wedetect_tiny`) | Detector condicionado por texto, vocabulario fijo, optimizado para NPU Qualcomm | 37,3 M (detector) + 3,00 (texto) | GPL-3.0 | 640x640 de entrada; 7,2-76,4 ms en NPU según chipset |
| Grounding DINO | Detector de vocabulario abierto (prompt de texto en tiempo de ejecución) | No disponible | No disponible | No disponible |
| RT-DETR | Detector transformer en tiempo real | No disponible | No disponible | No disponible |
| Familia YOLO (por ejemplo YOLOv8/YOLO11) | Detectores densos de una etapa con vocabulario fijo | No disponible | No disponible | No disponible |

Nota: las alternativas se enumeran por categoría funcional; no se dispone de sus especificaciones contrastadas en la información proporcionada, por lo que no se establece una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia GPL-3.0: es una licencia copyleft. Integrar el modelo en un producto propietario puede activar obligaciones de distribución del código derivado; conviene revisión legal antes de un uso comercial cerrado.
- Qualcomm indica que, por restricciones de licencia, no puede distribuir los assets preexportados: es obligatorio compilar y exportar con la librería `qai-hub-models` a partir de pesos propios o ajustados.
- Vocabulario fijo: no es un detector de vocabulario abierto en tiempo de ejecución. Añadir o cambiar clases exige reexportar y recompilar el modelo.
- No hay resultados publicados de precisión (mAP u otras métricas de detección), por lo que no es posible evaluar la calidad de detección ni compararla con alternativas.
- El repositorio registra 0 descargas y 1 like, lo que implica una validación comunitaria prácticamente nula y una reproducibilidad no confirmada de forma independiente.
- No se documentan la composición del dataset de entrenamiento ni sus sesgos; es esperable un rendimiento degradado fuera de la distribución de las clases y dominios vistos durante el entrenamiento. Existe riesgo de falsos positivos y falsos negativos en escenas con oclusiones, objetos pequeños o iluminación adversa.
- Resolución de entrada fija de 640x640: los objetos muy pequeños pueden perderse; si el caso de uso lo requiere, hay que exportar con formas de entrada personalizadas.
- El rendimiento declarado está medido exclusivamente en NPU de Qualcomm. En CPU, GPU de escritorio u otros aceleradores no hay métricas publicadas y la latencia y el consumo serán distintos.
- Comportamiento multilingüe de los prompts de clase: no documentado. El texto de las clases afecta a los pesos exportados, por lo que el idioma utilizado al definir el vocabulario podría influir en los resultados.
- No se especifican requisitos de versión de QNN, del SDK de Qualcomm AI Hub ni del runtime en dispositivo, algo crítico para reproducir las latencias de la tabla.
- El identificador arXiv asociado a las etiquetas del repositorio es `arXiv:2512.12309`; no se ha podido verificar en la información disponible que corresponda a la publicación oficial del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qualcomm/WeDetect
- Implementación de referencia WeDetect (WeChatCV): https://github.com/WeChatCV/WeDetect
- WeDetect en Qualcomm AI Hub Models (v0.64.0): https://github.com/qualcomm/ai-hub-models/blob/v0.64.0/src/qai_hub_models/models/wedetect
- Repositorio Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Referencia arXiv indicada en las etiquetas del repositorio: https://arxiv.org/abs/2512.12309
- Sitio de Qualcomm: https://www.qualcomm.com/
