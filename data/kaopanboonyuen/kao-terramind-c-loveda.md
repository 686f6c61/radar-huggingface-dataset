# kaopanboonyuen/KAO-TerraMind-C-LoveDa

## Resumen

KAO-TerraMind-C-LoveDa es un checkpoint de segmentación semántica de imágenes de satélite obtenido mediante ajuste fino del modelo fundacional geoespacial TerraMind-1.0-base de IBM y la ESA. Lo publica el autor independiente kaopanboonyuen como parte de la familia KAO-TerraMind, un conjunto de tres adaptaciones controladas de un solo factor (optimización, función de pérdida y decoder) sobre el mismo backbone, con receta de entrenamiento idéntica, de modo que cada diferencia de rendimiento sea atribuible a una única modificación.

La variante C (la de este repositorio) interviene exclusivamente en el decoder: emplea un UperNet más ancho (512 canales frente a 256), un dropout de cabeza mayor (0,2 frente a 0,1) y taps de características del encoder más profundos ([3, 6, 9, 11] frente a [2, 5, 8, 11]). El modelo resuelve segmentación densa en 7 clases sobre imágenes RGB de satélite a 0,3 m de resolución del dataset LoveDA (entorno urbano y rural), con parches de entrada de 3 x 224 x 224.

Su relevancia es doble: por un lado, ofrece un checkpoint público y completamente especificado (119,97 M de parámetros) para reproducir un envío a CVPR 2027; por otro, sirve como referencia metodológica de adaptación de modelos fundacionales geoespaciales a tareas densas concretas. El código de entrenamiento no se incluye mientras el artículo está en revisión; el repositorio distribuye únicamente el helper de inferencia, la configuración exacta de arquitectura y receta, y los resultados completos de benchmark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con backbone TerraMind-1.0-base (`terramind_v1_base`) y decoder UperNet (TerraTorch `EncoderDecoderFactory`) |
| Parametros totales | 119,97 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 3 x 224 x 224 píxeles) |
| Tipos de cuantizacion | no disponible (checkpoint `.pt` en fp16 para inferencia) |
| Idiomas soportados | inglés (metadatos y documentación; la tarea es de visión, no lingüística) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (`terramind_v1_kaoC_best.pt`), checkpoint de TerraTorch |
| Modalidad de entrada | RGB satelital (R, G, B), 8 bits, 3 x 224 x 224 |
| Salida | logits por píxel sobre 7 clases |
| Dataset de evaluación | LoveDA (urbano + rural, 0,3 m GSD, teselas de 1024 x 1024 px) |
| Librería | TerraTorch >= 1.2.4 |
| Modelo base | ibm-esa-geospatial/TerraMind-1.0-base |

## Arquitectura y entrenamiento

El modelo combina un backbone transformer fundacional geoespacial (TerraMind-1.0-base, inicializado desde el checkpoint de IBM y la ESA) con un decoder UperNet de segmentación semántica. La adaptación KAO-C modifica tres hiperparámetros del decoder respecto al ajuste fino de referencia: canales del decoder de 256 a 512, dropout de cabeza de 0,1 a 0,2 y taps de características del encoder de [2, 5, 8, 11] a [3, 6, 9, 11], lo que añade aproximadamente 22 M de parámetros y sesga la extracción hacia capas más profundas.

La receta de entrenamiento es común a los siete modelos comparados: optimizador AdamW con LR base 1e-4 y multiplicador de backbone 0,1 (variante A: 0,3), weight decay 0,01 (variante A: 0,05), pérdida de entropía cruzada ponderada por clase con pesos de frecuencia inversa en raíz cuadrada más Dice con peso 0,5 (variante B: 1,0), 30 épocas con paciencia de early stopping de 8 seleccionando el checkpoint por mIoU de validación, batch de 16, sampler balanceado por clase con 6000 ventanas por época, ventanas de 224 x 224 con stride de entrenamiento de 112 px, aumentos de volteo horizontal y vertical y rotaciones de 90°, autocast fp16, grad-clip 1,0, normalización con estadísticas RGB de preentrenamiento de TerraMind (escala 0-255), semilla 42 y una única NVIDIA Tesla T4.

El protocolo de evaluación usa como test la carpeta oficial `Val/` (urbano y rural), ya que las máscaras de test oficiales de LoveDA no son públicas. El conjunto de entrenamiento excluye un 10 % de imágenes (muestreadas por separado en urbano y rural con semilla fija) reservado solo para selección de checkpoint y early stopping; ninguna imagen de test interviene en decisión alguna.

## Capacidades

- Segmentación semántica densa por píxel en 7 clases: fondo, edificio, carretera, agua, terreno yermo, bosque y agricultura.
- Procesamiento de imágenes RGB satelitales de muy alta resolución (0,3 m GSD) en teselas de 224 x 224 píxeles.
- Generalización a escenas urbanas y rurales dentro del dominio de LoveDA.
- Inferencia en fp16 sobre GPU de gama media (Tesla T4), con 18,67 ms por tesela de 224 x 224 a batch 1.
- Integración con el ecosistema TerraTorch para pipelines de encoder-decoder y evaluación estandarizada.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de predicción densa.
- No dispone de modo thinking, visión generativa, audio ni generación de texto.

## Casos de uso

- Cartografía de cobertura del suelo a escala regional: el modelo clasifica cada píxel de ortoimágenes RGB de 0,3 m en las 7 clases de LoveDA, lo que permite generar mapas temáticos de edificios, carreteras, agua, bosque y agricultura a partir de teselas de 224 x 224 con solapamiento.
- Monitorización de expansión urbana: comparando predicciones sobre imágenes de distintas fechas se pueden detectar cambios en la clase edificio y carretera en entornos urbanos y rurales, un caso para el que el modelo está entrenado explícitamente al incluir ambas tipologías en LoveDA.
- Planificación agrícola y seguimiento de cultivos: la clase agricultura permite delimitar parcelas y estimar superficies cultivadas en escenas rurales, con la ventaja de que el ajuste fino se ha realizado con muestreo balanceado por clase para no infrarepresentar clases minoritarias.
- Gestión de recursos hídricos: la segmentación de la clase agua facilita la delimitación de masas de agua, cauces y zonas inundables en imágenes de alta resolución, con inferencia rápida (18,67 ms por tesela) que permite procesar grandes extensiones.
- Evaluación de riesgo de erosión y suelo yermo: la clase barren (terreno yermo) resulta útil para identificar superficies sin vegetación en estudios de degradación del suelo y desertificación.
- Reproducibilidad de investigación: el checkpoint público, la configuración exacta de arquitectura y receta y los resultados completos permiten replicar el experimento del envío a CVPR 2027 y usarlo como línea base controlada en estudios de adaptación de modelos fundacionales geoespaciales.
- Prototipado en entornos con recursos limitados: al requerir solo una Tesla T4 y ocupar 0,5 GB el repositorio, sirve para validar pipelines de segmentación antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados de forma independiente), sobre LoveDA con el protocolo descrito:

| Metrica | Valor (%) |
|---|---|
| mIoU | 48,85 |
| Exactitud global (Overall Accuracy) | 66,91 |
| F1 macro | 65,05 |
| Precisión macro | 68,75 |
| Recall macro | 64,46 |

Según la model card, el modelo obtiene +0,23 pp de mIoU frente al TerraMind-1.0-base entrenado de forma idéntica y ocupa la posición 3 de 7 en la comparativa interna de variantes. No se han publicado en la información disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) por tratarse de un modelo de visión, ni comparaciones numéricas con modelos externos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 119,97 M de parámetros en fp16 el peso ronda los 0,24 GB, por lo que la inferencia cabe holgadamente en GPUs de 8 GB o menos.
- GPU de referencia del autor: 1 x NVIDIA Tesla T4, con 18,67 ms por tesela de 224 x 224 en fp16 y batch 1.
- Cabe en GPU de consumo: sí, cualquier GPU consumer con al menos 8 GB de VRAM (RTX 3060, 4060, 4070, 4090) es suficiente; el cuello de botella será el preprocesado de teselas, no la memoria.
- Opciones de despliegue: TerraTorch >= 1.2.4 como librería principal; el checkpoint es un `.pt` de PyTorch, por lo que no se distribuye en GGUF ni en formatos optimizados para llama.cpp u Ollama. Para servir en producción convendría exportar a TorchScript u ONNX, opción no documentada en la información disponible.
- Latencia y throughput: 18,67 ms por tesela de 224 x 224 a batch 1 en T4 con fp16; el throughput agregado no está publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mIoU LoveDA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KAO-TerraMind-C-LoveDa | 119,97 M | 3 x 224 x 224 px | 48,85 % | Apache-2.0 | Hugging Face (inferencia) |
| TerraMind-1.0-base (ajuste fino de referencia) | no disponible en la información | 3 x 224 x 224 px | 48,62 % (implícito: -0,23 pp) | Apache-2.0 (modelo base) | Hugging Face |
| Variantes KAO-A y KAO-B | no disponible en la información | 3 x 224 x 224 px | no disponible (posición 1-2 de 7) | Apache-2.0 | No publicadas en este repositorio |
| Otros modelos de segmentación geoespacial | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a los modelos incluidos en el estudio del autor; no se dispone de datos de benchmarks de alternativas externas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de dominio estrecho: entrenado y evaluado únicamente sobre LoveDA (RGB satelital a 0,3 m, urbano y rural); su rendimiento fuera de esa distribución (otras resoluciones, sensores multiespectrales, SAR) no está caracterizado.
- Solo modalidad RGB: no acepta bandas infrarrojas ni otras modalidades que TerraMind-1.0-base sí contempla, lo que limita aplicaciones que requieran NIR u otros canales.
- Resultados no verificados: las métricas del model-index figuran con `verified: false`; la mejora sobre la línea base es muy pequeña (+0,23 pp de mIoU), dentro del margen que podría atribuirse a variabilidad de entrenamiento.
- Protocolo de test no estándar: se evalúa sobre la carpeta `Val/` oficial porque las máscaras de test de LoveDA no son públicas, por lo que los números no son directamente comparables con publicaciones que usen otro protocolo.
- Riesgo de sesgo geográfico y de clase: aunque el muestreo es balanceado por clase, la cobertura de LoveDA se limita a determinadas regiones; las clases minoritarias (terreno yermo) pueden presentar menor recall.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto), pero sí existe riesgo de predicciones densas erróneas en píxeles ambiguos o de frontera entre clases.
- Licencia Apache-2.0 permite uso comercial, pero el código de entrenamiento no se distribuye mientras el artículo está en revisión, lo que dificulta la reproducibilidad completa del pipeline.
- Sin soporte documentado de exportación a ONNX, TensorRT o GGUF; el despliegue en producción requeriría trabajo adicional de optimización no cubierto por el repositorio.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kaopanboonyuen/KAO-TerraMind-C-LoveDa
- Modelo base TerraMind-1.0-base: https://huggingface.co/ibm-esa-geospatial/TerraMind-1.0-base
- Librería TerraTorch (IBM): https://github.com/IBM/terratorch
- Dataset LoveDA: no disponible en la información proporcionada
- Artículo CVPR 2027: no disponible (en revisión)
- Repositorio de código de entrenamiento: no disponible (no incluido mientras el artículo está en revisión)
- Demo: no disponible
