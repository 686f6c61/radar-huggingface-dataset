# aiprojektgaia/gaia_buildings_50e

## Resumen

GAIA Buildings 50e es un modelo de segmentación semántica binaria especializado en la extracción de edificios a partir de ortofotos aéreas RGB en vista nadir. Lo desarrolla el proyecto GAIA, un sistema autoalojado que convierte imágenes aéreas en datos vectoriales de mapas para municipios suecos, con financiación de Smart Built Environment. El modelo se publica bajo licencia Apache 2.0 y se distribuye a través de HuggingFace con la librería `segmentation-models-pytorch`.

Arquitectónicamente es una red convolucional encoder-decoder de tipo FPN (Feature Pyramid Network) con encoder ResNet34 preentrenado en ImageNet, entrenada con PyTorch Lightning. Genera un ráster de verosimilitud por píxel (uint8, 0-255) en lugar de una máscara binaria, lo que permite reumbralizar los resultados sin necesidad de reejecutar la inferencia. El checkpoint se entrenó durante 50 épocas, de ahí el sufijo `50e` en el identificador.

Su relevancia es acotada pero concreta: cubre un caso de uso geoespacial muy específico (actualización de cartografía de edificios en municipios suecos) con un pipeline de producción definido que incluye umbralización configurable, vectorización con ajuste de rectángulos y exportación a GeoPackage para QGIS. No es un modelo de propósito general ni compite con los grandes modelos multimodales; es una pieza de un sistema de teledetección.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FPN (Feature Pyramid Network) con encoder ResNet34 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch, sin versiones GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades NLP) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint PyTorch (`.ckpt`) para PyTorch Lightning; tamaño del repo 0.3 GB |

## Arquitectura y entrenamiento

El modelo es una red convolucional de segmentación semántica con arquitectura FPN y encoder ResNet34. La FPN combina características multiescala mediante conexiones laterales y un camino top-down, lo que permite detectar edificios de tamaños muy distintos en la misma imagen. El encoder ResNet34 está preentrenado en ImageNet: la normalización se obtiene con `smp.encoders.get_preprocessing_params("resnet34")`, que devuelve estadísticas de ImageNet. El entrenamiento se realizó con PyTorch Lightning y la librería `segmentation_models_pytorch`, durante 50 épocas.

No se especifican en la información disponible el número de imágenes de entrenamiento, la composición del dataset, la resolución de las máscaras de referencia ni si se aplicaron técnicas de aumento de datos. Tampoco se documenta el uso de RLHF, DPO ni ningún tipo de ajuste por preferencias (no aplica a un modelo de segmentación). La innovación técnica destacable no está en la arquitectura, que es estándar, sino en el diseño del pipeline: la salida continua (verosimilitud por píxel) permite reumbralizar sin reejecutar inferencia, y el vectorizador posterior ajusta rectángulos (`growing_rectangles`) en lugar de trazar contornos genéricos, produciendo polígonos con paredes rectas y esquinas cuadradas.

Una particularidad relevante para quien integre el modelo: GAIA lo registra internamente como `"model type": "resunet"` en `segmentation/parameters.json`, pero ese string selecciona el cargador, no la arquitectura. El cargador pasa el `arch` declarado en los hiperparámetros del checkpoint a `smp.create_model()`, y la arquitectura real es FPN.

## Capacidades

- Segmentación semántica binaria de edificios sobre ortofotos aéreas RGB en vista nadir.
- Producción de un ráster de verosimilitud por píxel (uint8, 0-255, escala sigmoide), no una máscara binaria.
- Sensibilidad a resolución calibrada para aproximadamente 0.05 m/píxel; el wrapper de inferencia reescala la entrada a esa resolución objetivo y recorta las dimensiones a múltiplos de 32 píxeles (requisito del decoder FPN).
- Integración con el módulo `segmentation` de `gaia-engine` a través de `ResUNetInferencer`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.
- No soporta visión más allá de RGB: fijo a 3 canales de entrada, sin NIR, elevación ni SAR.
- No produce altura de edificio ni reconstrucción 3D.

## Casos de uso

- **Actualización de cartografía municipal en Suecia**: el modelo extrae edificios de ortofotos y el pipeline de GAIA umbraliza (75% por defecto), vectoriza con ajuste de rectángulos y exporta a GeoPackage para su carga como capas en QGIS. Es el caso de uso para el que fue entrenado y el único validado.
- **Inventario de edificios a escala municipal**: procesar tiles de un WMS a 0.08 m/píxel, reescalarlos a 0.05 m/píxel y generar polígonos de edificios para conteo y catalogación. Adecuado porque el modelo está calibrado para esa resolución y el pipeline de vectorización ya está resuelto.
- **Detección de cambios en el entorno construido**: comparar los polígonos generados en dos fechas sobre la misma zona para identificar edificaciones nuevas. El modelo encaja porque la salida continua permite ajustar el umbral según la tolerancia a falsos positivos del estudio.
- **Generación de capas base para sistemas de información geográfica**: alimentar un SIG con polígonos de edificios propuestos que luego revisa un operador humano. El diseño de GAIA trata explícitamente la salida como propuesta, no como verdad.
- **Preprocesado para análisis urbanístico**: obtener una capa de huella aproximada de edificios como entrada a estudios de densidad, morfología urbana o planificación, siempre con validación independiente.
- **Prototipado de pipelines de teledetección**: servir como componente de segmentación en un sistema autoalojado de conversión de imagen aérea a datos vectoriales, dado que su integración con `gaia-engine` está documentada y el checkpoint es ligero (0.3 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el checkpoint no incluye métricas de evaluación ("Unquantified. No evaluation metrics are published with this checkpoint"), por lo que su precisión sobre cualquier imagen concreta está sin verificar.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma explícita. Con encoder ResNet34 y decoder FPN, el checkpoint ocupa 0.3 GB; en FP32 la inferencia cabe holgadamente en GPUs de consumo, aunque no se documentan cifras exactas.
- **GPU recomendadas**: no disponible. Por tamaño del modelo, cualquier GPU consumer moderna (RTX 3060 en adelante) debería ser suficiente, pero no hay datos publicados que lo confirmen.
- **Cabe en GPU consumer**: previsiblemente sí, dado el tamaño del checkpoint (0.3 GB) y la arquitectura ResNet34, aunque no se confirma en la documentación.
- **Opciones de despliegue**: `segmentation-models-pytorch` con PyTorch Lightning; integración con `gaia-engine` mediante `ResUNetInferencer`. No se documentan soportes para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de segmentación de este tipo).
- **Latencia y throughput**: no disponibles.
- **Requisito de entrada**: imágenes RGB a aproximadamente 0.05 m/píxel, con dimensiones múltiplo de 32 píxeles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones publicadas con otros modelos de segmentación de edificios en la información proporcionada. La model card no cita alternativas ni establece comparaciones cuantitativas. Cualquier comparación con otros modelos de la familia (por ejemplo, otras variantes de `segmentation-models-pytorch` con encoders distintos) requeriría datos de evaluación que no se han publicado.

| Modelo | Arquitectura | Contexto | Licencia | Disponibilidad | Benchmarks |
|---|---|---|---|---|---|
| GAIA Buildings 50e | FPN + ResNet34 | no aplica (visión) | Apache 2.0 | HuggingFace | no publicados |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Segmenta tejados, no huellas catastrales**: la imagen nadir ve el tejado. En edificios altos o con ortorectificación imperfecta, el tejado visible está desplazado respecto a la huella real en el suelo, y los aleros sobresalen. La salida aproxima una huella y no debe tratarse como medida de precisión topográfica.
- **Sesgo geográfico y arquitectónico**: entrenado para uso municipal sueco. Materiales de cubierta, colores, densidad, formas edificatorias y ángulos solares típicos del norte de Europa varían por región; el rendimiento en otras zonas es desconocido. Asentamientos informales densos y estructuras irregulares no rectangulares son modos de fallo habituales de esta familia de modelos, y el vectorizador de ajuste de rectángulos agrava el problema al asumir geometría angular.
- **Edificios adosados se fusionan**: viviendas en hilera y estructuras conectadas suelen segmentarse como una sola región, porque el límite entre ellas es un detalle de cubierta y no un cambio de material.
- **Superficies confundibles**: tejados planos grises junto a asfalto o pavimento son una fuente recurrente de falsos positivos y falsos negativos. Sombras y copas de árboles que sobresalen eliminan partes de edificios claros.
- **Sensibilidad a la resolución**: el modelo apunta a 0.05 m/píxel. Imágenes con un ground sampling distance muy distinto se reescalan, lo que degrada la calidad en ambas direcciones. GAIA solicita tiles a 0.08 m/píxel y los reescala a 0.05, pero el reescalado no recupera detalle que nunca se capturó.
- **Precisión no cuantificada**: no hay métricas publicadas con el checkpoint, por lo que su exactitud sobre cualquier imagen concreta está sin verificar.
- **Riesgo de alucinación**: en el contexto de segmentación, se traduce en falsos positivos (superficies confundibles) y falsos negativos (sombras, vegetación), sin cuantificación disponible.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero la model card desaconseja explícitamente usos de alta consecuencia (estimación de población, evaluación de daños, respuesta a desastres) sin validación independiente.
- **Recomendación del autor**: validar sobre una muestra reservada de imágenes propias antes de cualquier uso operativo, y tratar la salida como propuesta sujeta a revisión humana.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/aiprojektgaia/gaia_buildings_50e)
- [Repositorio del proyecto GAIA en GitHub](https://github.com/aiprojektgaia)
- [Paper de referencia citado en los tags (arXiv:1910.09700)](https://arxiv.org/abs/1910.09700)
