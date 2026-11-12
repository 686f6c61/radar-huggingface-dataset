# fireviewer/convnext-tiny-alert-categories-litert-cadryl

## Resumen

FireViewer ConvNeXt-Tiny Cadryl LiteRT es una conversión a TensorFlow Lite (LiteRT) del checkpoint final del modelo de clasificación de imágenes `fireviewer/convnext-tiny-alert-categories-v2`, un ConvNeXt-Tiny afinado para clasificar escenas de fuego en seis categorías de contexto de alerta. Lo desarrolla el proyecto FireViewer y está pensado para ejecutarse en dispositivos Android dentro de la aplicación Cadryl, con soporte de adaptación on-device de la cabeza de clasificación.

El modelo resuelve un problema concreto: distinguir entre tipos de fuego (fuego útil para humanos, origen doméstico, origen sospechoso, fuego en carretera/urbano, incendio forestal/natural y negativo) para priorizar alertas en un sistema de detección temprana. La conversión preserva los pesos PyTorch originales y añade un contrato de firmas LiteRT que permite no solo inferencia sino también entrenamiento ligero de la capa final en el propio dispositivo.

La relevancia de esta ficha es acotada: no se trata de un modelo de lenguaje ni de un modelo multimodal general, sino de un clasificador de imágenes de 6 clases derivado de ConvNeXt-Tiny (aproximadamente 28M de parámetros en su variante estándar), empaquetado como `model.tflite` de Float32 con un tamaño de repositorio de 0,1 GB. No se han publicado métricas de precisión en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Tiny (CNN moderna con bloques tipo transformer), convertida a TensorFlow Lite / LiteRT |
| Parametros totales | no disponible (ConvNeXt-Tiny estándar ronda los 28M, pero no se confirma en la información) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imágenes; entrada 920 × 920 RGB) |
| Tipos de cuantizacion | Float32 (conversión Float32 del checkpoint); no se documentan otras variantes |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | BSD-3-Clause |
| Formato de pesos | TFLite (`model.tflite`), checkpoint PyTorch original en el repositorio fuente (`best.pth`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es ConvNeXt-Tiny, una red convolucional que adopta decisiones de diseño propias de los transformers (convoluciones depthwise de 7×7, LayerNorm, GELU, estructura de stage ratio). Sobre ella se añade una cabeza de clasificación lineal de 6 salidas. La conversión a LiteRT integra el preprocesamiento en el grafo: redimensionado directo RGB a 920 × 920, escalado a [0, 1] y normalización ImageNet con medias 0,485/0,456/0,406 y desviaciones 0,229/0,224/0,225. La salida es un tensor `logits` de forma [1, 6]; el softmax se aplica fuera del grafo, en la aplicación Cadryl.

El entrenamiento original se realizó sobre el dataset `fireviewer/fireviewer_fire_smoke_flame_v3_native`. En la versión LiteRT, solo la LayerNorm y la capa Linear finales del clasificador son entrenables; el backbone de características permanece congelado. La pérdida de adaptación es entropía cruzada estándar sobre una clase humana aceptada codificada one-hot [1, 6]; no se reutilizan las ponderaciones de clase ni el label smoothing del run PyTorch inicial. El optimizador es SGD sin estado de momentum y con recorte de norma global de gradiente a 5. Las firmas exportadas son `infer(x)`, `train(x, y, learning_rate)`, `save(checkpoint_path)`, `restore(checkpoint_path)` y `head_state(probe)` (esta última reservada a comprobaciones de parámetros de salida).

## Capacidades

- Clasificación de imágenes en 6 categorías de contexto de alerta de fuego: `human_useful_fire`, `domestic_origin`, `suspect_origin`, `fire_road_urban`, `forest_natural_area_wildfire` y `negative`.
- Inferencia on-device mediante LiteRT Interpreter 1.4.2 con Select TF Ops 2.16.1 y delegado Flex.
- Adaptación on-device de la cabeza de clasificación: entrenamiento de LayerNorm y Linear finales con SGD y entropía cruzada.
- Persistencia de estado: guardado y restauración de checkpoints mediante `save` y `restore`.
- Inspección de parámetros de salida mediante la firma `head_state(probe)`.
- Preprocesamiento integrado en el grafo (redimensionado, escalado y normalización ImageNet), lo que simplifica la integración en Android.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un clasificador de imágenes puro.

## Casos de uso

- Detección temprana de incendios forestales en Android: la categoría `forest_natural_area_wildfire` permite priorizar alertas en zonas naturales; el modelo se ejecuta en el dispositivo con LiteRT, evitando enviar imágenes a un servidor y reduciendo latencia y consumo de red.
- Triaje de avisos ciudadanos: clasificar imágenes recibidas por una app de reporte de incendios en `human_useful_fire`, `domestic_origin` o `suspect_origin` para enrutar cada caso al equipo adecuado (brigada, investigación o descarte).
- Filtrado de falsos positivos: la clase `negative` permite descartar imágenes que no contienen fuego relevante antes de generar una alerta, reduciendo la carga operativa de los centros de control.
- Clasificación de fuego en entorno urbano y de carretera: la categoría `fire_road_urban` sirve para distinguir incidentes en vías o zonas urbanas y activar protocolos de tráfico y emergencias específicos.
- Adaptación on-device a dominios locales: gracias a las firmas `train`, `save` y `restore`, la app puede ajustar la cabeza de clasificación con ejemplos etiquetados por el usuario en el propio dispositivo, sin reentrenar el backbone ni subir datos a la nube.
- Despliegue en dispositivos sin conectividad: al ser un TFLite Float32 de 0,1 GB de repositorio, puede operar en escenarios de campo o zonas rurales con cobertura limitada, siempre que se cualifiquen memoria, latencia y batería en el dispositivo Android objetivo.
- Integración en pipelines de verificación de alertas: la salida `logits` [1, 6] con softmax externo permite aplicar umbrales por clase y combinar la predicción con otras señales (sensores, meteorología) en un sistema de decisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card documenta únicamente controles de conversión y de mecanismo de entrenamiento, no métricas de precisión:

| Control ejecutado | Resultado |
|---|---|
| Comparación PyTorch → TensorFlow → LiteRT sobre 4 imágenes reales | Écart absolu maximal des logits PyTorch/LiteRT: 0,00000429 |
| Cuatro actualizaciones sobre una imagen de entrenamiento | Pérdida 0,090715 → 0,090505, parámetros modificados |
| Guardado, restauración, cierre/reapertura y reanudación | Correctos; comparación de salidas a atol 1e-5 y rtol 1e-5 |

Estos controles verifican la equivalencia de la conversión y el funcionamiento del mecanismo de aprendizaje, pero no constituyen una nueva medida de precisión del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El artefacto es un TFLite Float32 con entrada 920 × 920; el consumo real de memoria debe medirse en el dispositivo Android objetivo.
- GPU recomendadas: no aplica en el sentido de servidor; el destino es LiteRT en Android con delegado Flex. No se documentan aceleradores específicos (GPU delegate, NNAPI, etc.).
- ¿Cabe en consumer GPU? No disponible; el modelo está pensado para ejecución on-device en Android, no para despliegue en GPU de escritorio.
- Opciones de despliegue: LiteRT Interpreter 1.4.2 con Select TF Ops 2.16.1 y delegado Flex; conversión y ejecución verificadas en Colab con TensorFlow 2.16.1. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles; la model card indica explícitamente que memoria, latencia, batería y calidad tras la adaptación deben cualificarse en dispositivo Android.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros clasificadores de fuego ni con otras variantes de ConvNeXt empaquetadas para LiteRT. Como referencia estructural, el modelo base es `fireviewer/convnext-tiny-alert-categories-v2`, del que esta ficha es una conversión LiteRT con contrato Cadryl; no se dispone de datos de rendimiento comparado entre ambos.

## Limitaciones y advertencias

- No se han publicado métricas de precisión, recall ni F1 sobre el dataset; la model card solo documenta controles de conversión y de entrenamiento.
- La equivalencia de muestreo de Bitmap en Android respecto al redimensionado PIL usado en la comparación está pendiente de verificar en dispositivo.
- Memoria, latencia, batería y calidad tras la adaptación on-device no están cualificadas; deben medirse antes de producción.
- El fichero distribuido conserva los pesos iniciales del checkpoint final; las actualizaciones de la receta de entrenamiento no están incorporadas.
- Solo son entrenables LayerNorm y Linear finales; el backbone permanece congelado, lo que limita la adaptación a nuevos dominios visuales.
- Las seis categorías de contexto no deben presentarse como una escala numérica de peligro.
- Riesgo de sesgo y de alucinación no evaluado en la información disponible; al ser un clasificador, el riesgo principal es la clasificación errónea, no la generación de texto.
- Licencia BSD-3-Clause: permite uso comercial con atribución y sin garantías; conviene revisar las obligaciones de redistribución.
- No hay soporte multilingüe ni de texto: es exclusivamente un modelo de visión.
- El modelo base y el corpus de entrenamiento pertenecen al proyecto FireViewer; la trazabilidad depende del manifiesto y de la revisión fijada del checkpoint fuente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fireviewer/convnext-tiny-alert-categories-litert-cadryl
- Modelo base: https://huggingface.co/fireviewer/convnext-tiny-alert-categories-v2
- Checkpoint fuente (`best.pth`, revisión `82d7af7e8f1e0126309f26b19c285b26909a5acb`): https://huggingface.co/fireviewer/convnext-tiny-alert-categories-v2/blob/82d7af7e8f1e0126309f26b19c285b26909a5acb/best.pth
- Dataset: https://huggingface.co/datasets/fireviewer/fireviewer_fire_smoke_flame_v3_native
