# Bwenge840/vit-base-patch16-384-coffee-preloaded

## Resumen

Bwenge840/vit-base-patch16-384-coffee-preloaded es un clasificador de imágenes basado en un Vision Transformer ViT-Base/16 ajustado (fine-tuning) para reconocer variedades o grados de café. Lo publica el usuario Bwenge840 en HuggingFace y se distribuye como un checkpoint de PyTorch (`.pth`) pensado para cargarse con la librería `timm`. El modelo resuelve una tarea de clasificación cerrada de 9 clases, etiquetadas como KR1, KR3, KR4, KR5, KR6, KR7, KR8, KR9 y KR10, a partir de imágenes RGB de 384x384 píxeles.

Técnicamente es una arquitectura transformer de visión estándar: 12 capas, 12 cabezas de atención, dimensión oculta 768 y parches de 16x16 sobre entradas de 384x384 (576 parches por imagen). El backbone parte de la configuración `vit_base_patch16_384` de `timm`, sobre la que se ha añadido una cabeza de clasificación con normalización por lotes y dos capas de dropout, un patrón típico de los entrenamientos hechos con fastai (el propio ejemplo de inferencia remapea las claves `0.model.` y `1.` a `backbone.` y `head.`).

Su relevancia es acotada pero clara: es un modelo de nicho, con 0 descargas y 0 likes en el momento de la consulta, sin métricas publicadas y sin licencia declarada. No es un modelo de propósito general, sino un artefacto especializado para un problema agronómico o industrial concreto (clasificación de café). Resulta útil como ejemplo reproducible de fine-tuning de ViT a resolución alta y como punto de partida para quien necesite una base similar en un pipeline de visión propio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base/16), transformer de visión con parches de 16x16, 12 capas y 12 cabezas de atención |
| Parámetros totales | Aproximadamente 86 millones en el backbone ViT-Base/16 más unos 0,4 millones en la cabeza de clasificación (cálculo a partir de las dimensiones declaradas: 768→512 y 512→9, ambas sin sesgo) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: modelo de visión con entrada fija de 384x384 píxeles RGB (576 parches) |
| Tipos de cuantización | No disponible. La model card solo menciona que el repositorio puede incluir exportaciones ONNX y TFLite al subirlo con `--include-exports`, pero no especifica cuantizaciones concretas |
| Idiomas soportados | No aplica (clasificación de imágenes; no procesa texto). No disponible en la información del repositorio |
| Licencia | No disponible |
| Formato de pesos | `.pth` (checkpoint de PyTorch). Posibles exportaciones a ONNX y TFLite según la model card |

## Arquitectura y entrenamiento

El modelo es un Vision Transformer de tipo ViT-Base con parches de 16x16 y resolución de entrada 384x384, la variante `vit_base_patch16_384` de `timm`. Esto implica 12 bloques transformer, 12 cabezas de auto-atención, dimensión de embedding 768 y 576 tokens de entrada por imagen (rejilla de 24x24 parches). El backbone se instancia con `num_classes=0` y sobre él se monta una cabeza personalizada: `BatchNorm1d(768)` → `Dropout(0.25)` → `Linear(768, 512, bias=False)` → `ReLU` → `BatchNorm1d(512)` → `Dropout(0.5)` → `Linear(512, 9, bias=False)`. El uso de `BatchNorm1d` tras el pooling y de dos niveles de dropout con tasas distintas es característico de los entrenamientos con fastai.

No hay información en la model card sobre el número de tokens o imágenes de entrenamiento, la composición del dataset, la resolución nativa del material de origen, ni sobre si se aplicó algún tipo de ajuste por refuerzo o preferencias (RLHF/DPO), algo por otra parte poco habitual en clasificación de imágenes. Sí se indica el preprocesado exacto de inferencia —redimensionado bicúbico a 384x384 y normalización con media y desviación típica de 0,5 en los tres canales—, lo que sugiere que el entrenamiento usó ese mismo pipeline. El prefijo "preloaded" en el nombre del repositorio apunta a que los pesos del backbone se cargaron preentrenados antes del ajuste, aunque el autor no lo detalla.

Como innovación técnica destacable no hay ninguna aportada por el autor: se trata de un fine-tuning convencional. El único detalle reseñable es que las clases no están numeradas de forma continua (falta KR2 en la lista), lo que puede deberse a que esa clase se descartó durante la curación del dataset o a un error de codificación de etiquetas.

## Capacidades

- Clasificación de imágenes en 9 clases cerradas: KR1, KR3, KR4, KR5, KR6, KR7, KR8 y KR10 (más la ausencia de KR2).
- Entrada de imágenes RGB a 384x384 píxeles con interpolación bicúbica y normalización media 0,5 / desviación 0,5.
- Salida de logits por clase sobre los que se puede aplicar `softmax` para obtener probabilidades e índice de confianza.
- Funciona como extractor de características si se usa el backbone con `num_classes=0`.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta razonamiento multi-paso, agentes ni flujos conversacionales.
- Sin capacidades multilingües: no procesa texto.
- Sin modo "thinking", sin visión generativa, sin audio y sin generación de texto.
- Exportable potencialmente a ONNX y TFLite para despliegue en entornos sin PyTorch, según indica la model card.

## Casos de uso

- Clasificación de variedades o grados de café en línea de producción: con una cámara industrial que capture granos a 384x384, el modelo devuelve la clase KR correspondiente y permite separar lotes por tipo sin intervención manual. Es adecuado porque la tarea es de clasificación cerrada y la resolución de 384x384 aporta detalle suficiente para distinguir texturas de grano.
- Control de calidad y descarte automatizado: integrado en una cinta transportadora, el modelo puede marcar los granos cuya probabilidad máxima quede por debajo de un umbral de confianza definido por el operador, derivándolos a revisión humana. El `softmax` de la salida facilita fijar ese umbral.
- Aplicación móvil de campo para catadores o técnicos agrícolas: exportando el modelo a TFLite (exportación que la model card menciona como posible), la inferencia se puede ejecutar en el propio dispositivo sin conectividad, algo útil en fincas o almacenes remotos.
- Auditoría de recepción de lotes en almacén: el clasificador puede verificar que el café entregado por un proveedor se corresponde con la variedad declarada, generando un registro fotográfico con la etiqueta predicha y la confianza asociada.
- Anotación asistida de datasets agronómicos: usar el modelo como pre-etiquetador sobre grandes colecciones de imágenes de café y reservar la revisión humana solo para los casos de baja confianza, reduciendo el coste de etiquetado de futuros datasets.
- Investigación agronómica y comparativas de variedades: permite procesar series de imágenes de campo y obtener una clasificación homogénea y reproducible, útil para estudios que comparen el comportamiento de distintas variedades entre campañas.
- Base para fine-tuning con fastai: dado que el ejemplo de inferencia documenta el remapeo de claves `0.model.` y `1.` a `backbone.` y `head.`, el checkpoint se puede reutilizar como punto de partida para añadir o sustituir clases en un pipeline fastai similar.
- Demostración educativa de despliegue de ViT a resolución alta: sirve como ejemplo completo de carga de un checkpoint de `timm`, remapeo de `state_dict` y preprocesado consistente para quien aprenda a desplegar transformers de visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye accuracy, F1, matriz de confusión ni ninguna otra métrica de evaluación sobre el conjunto de validación o test. Tampoco hay datos de comparación con otros clasificadores. El repositorio registra 0 descargas y 0 likes, por lo que no existen evaluaciones de terceros disponibles.

## Requisitos de hardware

- Tamaño del checkpoint en memoria: aproximadamente 346 MB en FP32 y 173 MB en FP16, calculado a partir del número de parámetros estimado (86,4 millones).
- VRAM estimada para inferencia: del orden de 1 GB en FP32 y 0,5 GB en FP16 para lote 1 a 384x384, incluyendo pesos y activaciones. Es una estimación derivada del tamaño del modelo; no hay mediciones publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. Funciona sin problemas en RTX 3060, RTX 4060, RTX 4090, A100 o H100, aunque en este último caso estaría muy infrautilizada.
- Cabe en GPU de consumo: sí. Modelos como GTX 1650, GTX 1060, RTX 3050 o superiores son suficientes, e incluso es viable la inferencia en CPU para lotes pequeños.
- Opciones de despliegue: PyTorch con `timm` (el camino documentado por el autor), exportación a ONNX y ejecución con ONNX Runtime, exportación a TFLite para Android/iOS, TorchScript, y servidores de inferencia genéricos como Triton o un servicio FastAPI. vLLM, llama.cpp, Ollama y TGI no aplican: son herramientas orientadas a modelos de lenguaje y este es un clasificador de imágenes.
- Latencia y throughput: no disponibles. Dependen fuertemente del hardware, del tamaño de lote y del backend; no hay cifras publicadas en la información proporcionada.

## Comparativa con modelos similares

No existen benchmarks publicados de este modelo, por lo que la comparación es puramente arquitectónica y de disponibilidad. Los modelos de la tabla no están ajustados para clasificación de café, de modo que no son alternativas directas en la tarea.

| Modelo | Arquitectura | Parámetros | Resolución de entrada | Tarea para la que se distribuye | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Bwenge840/vit-base-patch16-384-coffee-preloaded | ViT-Base/16 | Aproximadamente 86,4 millones | 384x384 | Clasificación de café en 9 clases | No disponible | HuggingFace, 0 descargas |
| google/vit-base-patch16-384 | ViT-Base/16 | Aproximadamente 86 millones | 384x384 | Clasificación en ImageNet-1k (1000 clases) | Apache 2.0 (según el repositorio original) | Ampliamente disponible y descargado |
| facebook/deit-base-distilled-patch16-224 | ViT destilado (DeiT) | Aproximadamente 87 millones | 224x224 | Clasificación en ImageNet-1k | Apache 2.0 (según el repositorio original) | Ampliamente disponible |
| EfficientNet-B4 | CNN con compound scaling | Aproximadamente 19 millones | 380x380 | Clasificación en ImageNet-1k | Apache 2.0 (según la implementación de referencia) | Ampliamente disponible |
| ResNet-50 | CNN residual | Aproximadamente 25,6 millones | 224x224 | Clasificación en ImageNet-1k | BSD / MIT según implementación | Ampliamente disponible |

La diferencia clave frente a las alternativas es el dominio: los modelos de `timm` o los publicados por Google y Meta se distribuyen con pesos de ImageNet y hay que reajustarlos para café, mientras que este repositorio ya incluye la cabeza de 9 clases. A cambio, carece de licencia declarada y de métricas, lo que dificulta su adopción en producción frente a alternativas con licencia explícita.

## Limitaciones y advertencias

- No hay métricas publicadas: se desconoce la precisión real del modelo, el tamaño del conjunto de validación y si existe sobreajuste.
- Licencia no disponible: sin una licencia explícita no se puede asumir permiso para uso comercial. Conviene contactar con el autor antes de integrarlo en un producto.
- El repositorio tiene 0 descargas y 0 likes, por lo que no ha sido validado por terceros ni existe retroalimentación de la comunidad.
- La clase KR2 no aparece en la lista, lo que sugiere un dataset incompleto o un etiquetado inconsistente. Cualquier imagen que corresponda a esa categoría será forzada a una de las 9 clases existentes.
- No se documenta la composición del dataset de entrenamiento: se desconoce la procedencia de las imágenes, el número de ejemplos por clase ni si el reparto entre entrenamiento y validación fue estratificado.
- Riesgo de sobreajuste al dominio de captura: al no haber datos de aumento ni variabilidad de condiciones declaradas, es probable que el modelo pierda precisión con iluminación, fondo o cámara distintos a los del entrenamiento.
- Sensibilidad al preprocesado: el modelo espera exactamente redimensionado bicúbico a 384x384 y normalización con media y desviación 0,5. Desviarse de este pipeline degrada las predicciones.
- Riesgo de alucinación en sentido clasificatorio: al ser un clasificador cerrado, siempre devolverá una de las 9 etiquetas con algún nivel de confianza, incluso ante imágenes que no sean café. Es imprescindible aplicar un umbral de confianza o un detector de fuera de dominio.
- Sin sesgos documentados ni evaluación de equidad: no hay análisis de sesgo por tipo de grano, origen geográfico o condiciones de captura.
- Sin soporte de texto ni multilingüe, y sin ninguna capacidad de razonamiento, herramientas o agentes.
- El ejemplo de inferencia usa `torch.load(..., weights_only=False)`, lo que implica deserializar el checkpoint completo. Si el fichero no procede de una fuente de confianza, esto supone un riesgo de seguridad; conviene revisar el contenido antes de cargarlo.
- Las exportaciones a ONNX y TFLite solo existen "cuando se suben con `--include-exports`": hay que comprobar si están realmente presentes en el repositorio antes de planificar un despliegue que dependa de ellas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Bwenge840/vit-base-patch16-384-coffee-preloaded
- Repositorio de la librería `timm`, declarada como `library_name` en la model card: https://github.com/huggingface/pytorch-image-models
- Paper original de Vision Transformer (referencia arquitectónica, no citado explícitamente por el autor): https://arxiv.org/abs/2010.11929
- Nota sobre la búsqueda web: las consultas realizadas no devolvieron resultados relevantes sobre este modelo. Los resultados obtenidos fueron páginas de ayuda de YouTube y hilos de foro sin relación alguna con el repositorio, por lo que no se han incluido. No se han localizado papers, blogs, demos ni espacios asociados a este modelo.
