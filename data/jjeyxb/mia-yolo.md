# jjeyxb/mia-yolo

## Resumen

MIA YOLO es un conjunto de pesos de detección de objetos basados en la librería Ultralytics (familia YOLO) publicados por el usuario jjeyxb en Hugging Face. No se trata de un modelo de lenguaje, sino de un paquete de modelos de visión por computador especializados en el reconocimiento de pantalla del videojuego Mahjong Soul: detectan las regiones del juego, los descartes del río (river), la mano del jugador y las combinaciones declaradas (melds). Los pesos se cargan desde el worker YOLO del repositorio MIA (Mahjong Intelligence Assistant) y se distribuyen empaquetados en sus instaladores.

El repositorio contiene cinco archivos de pesos en formato `.pt` (hand, meld, region y river) junto con dos archivos JSON de configuración de inferencia y recorte. Los tamaños oscilan entre 5,2 MB y 19,4 MB, lo que sitúa el conjunto completo en el orden de decenas de megabytes, coherente con un tamaño de repositorio de 0,1 GB. La licencia es AGPL-3.0, heredada del uso de Ultralytics.

La relevancia de este modelo es acotada y muy específica: sirve como componente de percepción visual dentro de un asistente de mahjong que, presumiblemente, alimenta a un motor de decisión (el repositorio menciona los pesos de Mortal). No hay información pública sobre arquitectura interna, datos de entrenamiento ni métricas de rendimiento en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO (Ultralytics); variante concreta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (pesos `.pt` en precisión original) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch `.pt` (junto con JSON de configuración de inferencia y recorte) |

## Arquitectura y entrenamiento

La model card indica únicamente que los modelos se entrenaron con Ultralytics y que se trata de detectores de objetos de la familia YOLO. No se especifica la variante exacta (por ejemplo, YOLOv8, YOLO11 u otra), el número de parámetros, la resolución de entrada ni el tamaño del dataset. Los nombres de archivo sugieren configuraciones distintas: `meld_model_v32_1280.pt` apunta a una resolución de entrada de 1280 píxeles para el modelo de melds, mientras que los demás no llevan esa indicación.

Los archivos `meld_model_v32_1280.infer.json` y `river_model_best.infer.json` contienen ajustes de inferencia y recorte que se leen junto al `.pt` correspondiente. También existe un `meld_model_v32_1280.crop_meta.json` con metadatos de recorte. No hay información sobre composición del dataset, número de imágenes, aumentos de datos, función de pérdida ni procesos de ajuste fino. El modelo está diseñado para imágenes de captura de pantalla del juego, no para fotografías del mundo real.

## Capacidades

- Detección de objetos sobre capturas de pantalla de Mahjong Soul en cuatro dominios: regiones de la interfaz, río de descartes, mano del jugador y melds declarados.
- Reconocimiento de fichas de mahjong en contextos de layout fijo, adecuado para pipelines de visión con recorte previo.
- Integración con el worker YOLO del repositorio MIA mediante `tools/fetch_models.py`.
- Configuración de inferencia y recorte externa en JSON, lo que permite ajustar el preprocesado sin reentrenar.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es exclusivamente un modelo de detección visual.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Asistente de mahjong en tiempo real: los modelos detectan la mano, el río y los melds a partir de capturas de pantalla, y alimentan al motor de decisión (Mortal) para sugerir jugadas. Es el caso de uso principal y el motivo de su publicación.
- Extracción de estado de partida para análisis posterior: el modelo de regiones y el de río permiten reconstruir el estado de la mesa y registrar partidas para estudio o estadísticas.
- Automatización de pruebas de interfaz del juego: la detección de regiones sirve para verificar que los elementos de la UI aparecen en las posiciones esperadas en distintas resoluciones.
- Etiquetado asistido de datasets de mahjong: las detecciones pueden preanotar imágenes que luego se revisan manualmente, acelerando la creación de nuevos conjuntos de entrenamiento.
- Seguimiento de descartes en herramientas de entrenamiento: el modelo de río identifica las fichas descartadas y su orden, útil para analizar decisiones en partidas grabadas.
- Integración en instaladores de escritorio: al pesar pocos megabytes, los pesos se empaquetan en la distribución de MIA y se cargan localmente sin depender de servicios en la nube.
- Prototipado de visión para otros juegos de mesa con layout fijo: la estructura de modelos separados por región y la configuración JSON externa facilitan adaptar el pipeline a dominios similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, recall, mAP ni latencia, y no se proporcionan comparaciones con otros detectores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño de los pesos (5,2 a 19,4 MB) el modelo cabe holgadamente en cualquier GPU consumer, incluso en GPUs integradas o ejecución en CPU.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; una RTX 4090 o A100 está sobredimensionada para este modelo.
- Cabe en GPU consumer: sí, en cualquier modelo actual (GTX 10xx en adelante) y probablemente en CPU con latencias aceptables para capturas individuales.
- Opciones de despliegue: Ultralytics (PyTorch) de forma nativa; exportación a ONNX, TensorRT o formatos similares no está documentada en la model card.
- Latencia y throughput estimados: no disponibles. Dependen de la variante YOLO concreta, la resolución de entrada y el hardware.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MIA YOLO (jjeyxb) | Detección de objetos YOLO especializada en Mahjong Soul | no disponible | no aplica | AGPL-3.0 | Hugging Face |
| YOLOv8 / YOLO11 (Ultralytics) | Detección de objetos genérica | variable según variante (n, s, m, l, x) | no aplica | AGPL-3.0 | GitHub, Hugging Face, pip |
| Detectores de fichas de mahjong alternativos | Detección específica de dominio | no disponible | no aplica | variable | no disponible |

No se conocen modelos públicos comparables especializados en Mahjong Soul con los que contrastar métricas. La comparación con YOLO genérico es únicamente de familia y licencia, no de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre capturas de Mahjong Soul, el rendimiento probablemente se degrade fuera de ese layout, resolución o tema visual.
- Riesgo de alucinación: en detección de objetos se traduce en falsos positivos y detecciones espurias; no hay métricas publicadas que permitan cuantificarlo.
- Limitaciones de contexto o idioma: no aplica como modelo de lenguaje, pero el dominio visual es estrecho (un único juego y una única interfaz).
- Restricciones de licencia: AGPL-3.0 impone obligaciones de copyleft fuerte; el uso en productos de red o distribuidos requiere liberar el código fuente correspondiente. Es incompatible con uso comercial propietario sin cumplir la AGPL.
- Caveats para producción: no hay información sobre la variante YOLO, el preprocesado exacto ni el rendimiento en resoluciones distintas a las de entrenamiento. Los archivos JSON de inferencia y recorte son necesarios para reproducir el comportamiento esperado y deben mantenerse junto a los `.pt`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- La fecha de creación y actualización indicada (2026-11-10) es futura respecto a la redacción habitual de fichas; conviene verificar la vigencia de los metadatos.

## Enlaces

- Hugging Face: https://huggingface.co/jjeyxb/mia-yolo
- Repositorio MIA (Mahjong Intelligence Assistant): https://github.com/jjeyxb/mahjong
- Ultralytics: https://github.com/ultralytics/ultralytics
