# LibreYOLO/LibreSEARAFTm-flow

## Resumen

LibreSEARAFTm-flow es un modelo de estimación de flujo óptico denso empaquetado por LibreYOLO a partir de SEA-RAFT M, la variante media del trabajo "SEA-RAFT: Simple, Efficient, Accurate RAFT for Optical Flow" presentado en ECCV 2024 por Wang, Lipson y Deng (Princeton Vision & Learning Lab). Dado un par de fotogramas, el modelo predice un campo de desplazamiento denso desde el primer fotograma al segundo, junto con un mapa de confianza por píxel derivado de su formulación de incertidumbre mixture-of-Laplace.

El modelo emplea una arquitectura RAFT con codificadores ResNet34 y cuatro iteraciones de refinamiento, e incorpora la innovación principal de SEA-RAFT: la predicción de una mezcla de distribuciones de Laplace para modelar la incertidumbre del flujo, lo que permite obtener confianza calibrada por píxel sin coste adicional de inferencia. El checkpoint subyacente es Tartan-C-T-TSKH-spring540x960-M, entrenado sobre el dataset TartanAir.

Su relevancia actual reside en que ofrece un flujo óptico de calidad investigadora dentro del ecosistema LibreYOLO, con una API unificada que gestiona automáticamente la descarga de pesos, el padding a múltiplos de 8, el reescalado de fotogramas largos (lado mayor superior a 960 px) y el procesamiento en streaming de vídeo. El paquete incluye únicamente metadatos de esquema de checkpoint LibreYOLO; los parámetros aprendidos son idénticos a los del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RAFT con codificadores ResNet34, 4 iteraciones de refinamiento, cabecera de incertidumbre mixture-of-Laplace (SEA-RAFT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión por pares de fotogramas; resolución nativa con padding a múltiplo de 8, downscale si el lado mayor supera 960 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | BSD 3-Clause |
| Formato de pesos | checkpoint `.pt` con esquema LibreYOLO (derivado de safetensors upstream) |

## Arquitectura y entrenamiento

SEA-RAFT sigue el paradigma RAFT: un extractor de características con codificadores ResNet34 genera un mapa de features por fotograma, se construye un volumen de correlación 4D entre ambos, y un módulo recurrente actualiza iterativamente el campo de flujo. La variante M realiza cuatro iteraciones de refinamiento. La contribución clave de SEA-RAFT es reformular la salida como una mezcla de distribuciones de Laplace, de la que se deriva tanto el flujo predicho como una confianza por píxel calibrada, lo que simplifica el diseño y mejora la precisión frente a RAFT original.

El checkpoint empaquetado corresponde a Tartan-C-T-TSKH-spring540x960-M, entrenado sobre el dataset sintético TartanAir con resolución de entrenamiento 540x960. No se dispone de información sobre el número exacto de tokens o muestras de entrenamiento, la composición detallada del dataset ni el uso de técnicas de RLHF o DPO (no aplicables en este dominio). La modificación introducida por LibreYOLO es exclusivamente de empaquetado: el safetensors upstream almacena una única BatchNorm compartida entre `bn3` y `downsample.1`, y el conversor la escribe bajo ambos nombres; los parámetros aprendidos no cambian.

## Capacidades

- Estimación de flujo óptico denso entre dos fotogramas: devuelve un campo `(H, W, 2)` float32 con desplazamientos `(dx, dy)` en píxeles sobre el lienzo original.
- Predicción de confianza por píxel en el rango [0, 1] derivada de la incertidumbre mixture-of-Laplace, donde 1 indica máxima certeza.
- Visualización del flujo mediante rueda de color Middlebury (`to_rgb()`).
- Procesamiento de vídeo en streaming: flujo de t a t+1 para cada fotograma de un clip.
- Manejo automático de resolución: padding a múltiplo de 8 y downscale con reescalado de vectores cuando el lado mayor supera 960 px.
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades multilingües; es un modelo puramente visual.

## Casos de uso

- Estimación de movimiento en vídeo de vigilancia: el modelo procesa cada par de fotogramas consecutivos en streaming y proporciona un campo de flujo denso con confianza por píxel, útil para detectar objetos en movimiento y filtrar píxeles poco fiables en zonas ocluidas o de baja textura.
- Estabilización de vídeo: el flujo denso entre fotogramas permite calcular transformaciones globales o por regiones para compensar el movimiento de cámara en postproducción, aprovechando el reescalado automático para material de hasta 960 px de lado mayor.
- Interpolación de fotogramas: los desplazamientos `(dx, dy)` y su confianza sirven para generar fotogramas intermedios en pipelines de aumento de tasa de refresco, usando la confianza para enmascarar regiones donde la interpolación sería poco fiable.
- Análisis de movimiento en investigación en visión: el modelo ofrece flujo de calidad investigadora (SEA-RAFT, ECCV 2024) con una API de una línea, adecuado para experimentos de odometría visual, seguimiento o evaluación de algoritmos sobre benchmarks como Sintel o KITTI.
- Detección de anomalías en vídeo industrial: comparar el flujo esperado con el observado en cadenas de producción permite identificar movimientos anómalos; la confianza por píxel ayuda a descartar regiones con iluminación cambiante o superficies sin textura.
- Segmentación guiada por movimiento: el campo de flujo denso actúa como señal auxiliar para separar primer plano de fondo en tareas de matting o segmentación de vídeo, especialmente en escenas con cámara en movimiento donde el flujo de fondo es coherente.
- Preprocesado para modelos de acción: el flujo óptico es una entrada clásica en reconocimiento de acciones; este modelo permite generarlo de forma estandarizada dentro del ecosistema LibreYOLO junto a otros modelos del mismo pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0.1 GB, lo que sugiere pesos del orden de decenas de millones de parámetros (ResNet34 x2 más módulo de refinamiento), compatible con GPUs de consumo.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño del checkpoint, es plausible su ejecución en RTX 3060/4060 o superiores, pero este dato no está confirmado por el autor.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del repositorio, aunque no se confirma en la model card.
- Opciones de despliegue: la vía oficial es la librería `libreyolo` (`from libreyolo import LibreYOLO`), con descarga automática del checkpoint desde el repositorio. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de flujo óptico).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreSEARAFTm-flow (SEA-RAFT M) | no disponible (ResNet34, 4 iteraciones) | nativa, downscale >960 px | RAFT + mixture-of-Laplace con confianza por píxel | BSD 3-Clause | Hugging Face vía libreyolo |
| RAFT original (princeton-vl) | no disponible | multi-escala | RAFT con pérdida L1, sin confianza calibrada | BSD 3-Clause | GitHub |
| SEA-RAFT L | no disponible | multi-escala | Variante grande de SEA-RAFT | BSD 3-Clause | GitHub / Hugging Face |
| Modelos de flujo clásicos (Farneback, DIS) | no aplica | denso, sin aprendizaje profundo | Métodos variacionales / clásicos | diversa | OpenCV |

La comparativa se limita a la familia SEA-RAFT y RAFT; no se dispone de datos de benchmarks que permitan comparar numéricamente el rendimiento frente a alternativas.

## Limitaciones y advertencias

- Modelo puramente visual: no procesa texto ni mantiene conversaciones; no admite instrucciones en lenguaje natural.
- Resolución limitada: los fotogramas con lado mayor superior a 960 px se reducen y el flujo se reescala, lo que puede degradar la precisión en movimientos pequeños o de alta frecuencia espacial.
- Dependencia de la calidad del par de fotogramas: oclusiones, cambios de iluminación bruscos, superficies sin textura y movimientos muy grandes entre fotogramas pueden producir flujo erróneo; la confianza por píxel debe usarse para filtrar estas regiones.
- Entrenado sobre TartanAir (sintético): puede presentar degradación en dominios reales alejados de la distribución de entrenamiento (por ejemplo, escenas nocturnas o con condiciones meteorológicas adversas).
- Riesgo de alucinación de movimiento: en zonas ambiguas el modelo puede generar vectores plausibles pero incorrectos; no debe usarse como única fuente en aplicaciones críticas de seguridad.
- Licencia BSD 3-Clause: permite uso comercial con atribución y sin endosar derivados; es necesario conservar los avisos de copyright de Princeton Vision & Learning Lab y de LibreYOLO.
- El repositorio no incluye información sobre sesgos, evaluación ética ni limitaciones idiomáticas (no aplicables al ser un modelo visual).
- Repositorio con 0 descargas y 0 likes en el momento de la ficha: ecosistema joven, sin validación comunitaria amplia.

## Enlaces

- Hugging Face: https://huggingface.co/LibreYOLO/LibreSEARAFTm-flow
- Repositorio fuente LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Repositorio upstream SEA-RAFT: https://github.com/princeton-vl/SEA-RAFT
- Checkpoint upstream: https://huggingface.co/MemorySlices/Tartan-C-T-TSKH-spring540x960-M
- Paper: https://arxiv.org/abs/2405.14793
