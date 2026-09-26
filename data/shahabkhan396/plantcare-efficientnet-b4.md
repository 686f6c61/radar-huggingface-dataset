# Shahabkhan396/plantcare-efficientnet-b4

## Resumen

PlantCare efficientnet_b4 es un clasificador de imágenes desarrollado por el usuario de Hugging Face Shahabkhan396 para la detección de enfermedades foliares en cultivos. Se trata de un ajuste fino (*fine-tuning*) del backbone `efficientnet_b4.ra2_in1k` de la librería `timm` sobre el conjunto de datos de campo PlantCity, que cubre 12 cultivos y 52 clases de enfermedad o estado sanitario. El modelo resuelve un problema de clasificación multiclase supervisada a partir de fotografías de hojas tomadas en condiciones reales de campo, no en laboratorio.

Técnicamente es una red convolucional EfficientNet-B4 con 17.767.052 parámetros y una resolución de entrada de 320 x 320 píxeles. El autor reporta una precisión de test de 0,9969, un macro-F1 de 0,9960 y un error de calibración esperado (ECE) de 0,0018 tras aplicar escalado de temperatura. El modelo se distribuye en formato `safetensors` y está pensado como herramienta de apoyo a la decisión agronómica, no como sistema de diagnóstico definitivo.

Su relevancia actual es limitada pero concreta: la agricultura de precisión necesita clasificadores ligeros que quepan en GPUs de consumo o incluso en CPU, y este modelo ocupa apenas unas decenas de megabytes. Sin embargo, la ausencia de licencia declarada, la falta de validación externa y un entrenamiento restringido a dos distritos de Khyber Pakhtunkhwa (Charsadda y Chitral, Pakistán) condicionan seriamente su uso en producción fuera de ese contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B4 (CNN, bloques MBConv con *squeeze-and-excitation* y *compound scaling*) |
| Parametros totales | 17.767.052 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; entrada de imagen fija de 320 x 320 píxeles |
| Tipos de cuantizacion | No disponible (solo se publican pesos en `safetensors`; no se documenta la precision de entrenamiento ni variantes cuantizadas) |
| Idiomas soportados | No aplica (modelo de vision); no disponible |
| Licencia | No disponible (la model card no la especifica; se advierte de comprobar la licencia del dataset PlantCity en Mendeley Data antes de redistribuir los pesos) |
| Formato de pesos | `safetensors` |
| Backbone base | `efficientnet_b4.ra2_in1k` (pesos ImageNet-1k con RandAugment RA2, via `timm`) |
| Dataset de entrenamiento | PlantCity (Khan et al., 2025), 12 cultivos, 52 clases |
| Numero de clases de salida | 52 |
| Pipeline | `image-classification` |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un EfficientNet-B4, una red neuronal convolucional que aplica *compound scaling* para escalar de forma conjunta profundidad, anchura y resolución. Sus bloques principales son MBConv (convoluciones separables en profundidad invertidas) con módulos de *squeeze-and-excitation*, y la variante concreta del backbone (`ra2_in1k`) incorpora RandAugment RA2 y pesos preentrenados en ImageNet-1k, distribuidos por `timm`. Sobre ese backbone se ha realizado un ajuste fino para producir 52 salidas en lugar de las 1.000 clases de ImageNet.

Los datos de entrenamiento provienen del dataset PlantCity, que según el autor contiene fotos de campo originales de 12 cultivos y 52 clases. El protocolo de evaluación descrito es un *split* estratificado y consciente de grupos (*group-aware*) en proporción 72/14/14, con eliminación de casi-duplicados y aumento de datos aplicado al vuelo (*on-the-fly*). No se especifican el número de épocas, el optimizador, la tasa de aprendizaje, el tamaño de lote, la composición exacta del aumento de datos ni si se usaron técnicas de RLHF o DPO (no aplicables en clasificación de imágenes). Tampoco se detalla el número de imágenes por clase ni el balance del dataset.

La innovación destacable es la calibración de confianza: el autor indica que los *logits* deben dividirse por un parámetro `temperature` almacenado en `plantcare_meta.json` antes de aplicar *softmax*, lo que produce el ECE de 0,0018 reportado. Esta calibración es relevante en un dominio donde una confianza mal calibrada puede llevar a decisiones agronómicas erróneas.

## Capacidades

- Clasificación de imágenes de hojas en 52 clases correspondientes a 12 cultivos, orientada a enfermedad o estado sanitario.
- Salida de probabilidades calibradas mediante escalado de temperatura (si se aplica el factor `temperature` de `plantcare_meta.json`).
- Procesamiento de imágenes a 320 x 320 píxeles, resolución relativamente alta para una CNN de este tamaño.
- Inferencia ligera: 17,77 millones de parámetros permiten ejecución en CPU y en GPUs de gama baja.
- Integración directa con `timm` y, por extensión, con el ecosistema PyTorch.
- No soporta *tool calling*, *function calling* ni agentes: es un clasificador de imagen pura, sin componente generativo ni de razonamiento multi-paso.
- No tiene capacidades multilingües, de generación de texto, de código ni matemáticas.
- No dispone de modo de razonamiento (*thinking mode*), audio ni vídeo.

## Casos de uso

- Triaje en extensión agraria: un técnico fotografía hojas sospechosas con el móvil y el modelo devuelve la clase más probable entre 52, con confianza calibrada, para priorizar qué muestras enviar a un laboratorio. Es adecuado por su bajo coste computacional y su entrada de 320 x 320, razonable para fotos de móvil.
- Aplicación móvil de apoyo al agricultor en Pakistán: dado que el entrenamiento procede de Charsadda y Chitral, un despliegue en esas mismas zonas o en zonas agroclimáticamente similares es el escenario donde el modelo conserva mayor validez.
- Pre-etiquetado de grandes volúmenes de imágenes: el modelo puede clasificar lotes de fotografías para que un fitopatólogo revise únicamente los casos de baja confianza, reduciendo el coste de anotación.
- Monitorización con drones o plataformas terrestres: al ser un modelo de 17,77 millones de parámetros, puede ejecutarse a bordo de dispositivos con pocos recursos para un primer filtrado de fotogramas antes de un análisis más profundo.
- Investigación agronómica comparativa: como基线 reproducible para experimentar con otros backbones (`timm`) sobre el mismo dataset y protocolo de *split*.
- Detección temprana en invernadero: integrado en un sistema de captura periódica, permite alertar cuando la proporción de imágenes clasificadas como enfermas supera un umbral, siempre con revisión humana.
- Filtrado de calidad en pipelines de datos agrícolas: usar la clasificación de 52 clases para descartar imágenes no relacionadas o ya etiquetadas antes de alimentar otros modelos.

## Benchmarks y rendimiento

Los únicos datos disponibles son las métricas de test reportadas por el propio autor en la model card. No se han publicado resultados de benchmarks externos ni comparaciones con otros modelos en la información disponible.

| Metrica | Valor |
|---|---|
| Precision de test (*accuracy*) | 0,9969 |
| Macro-F1 de test | 0,9960 |
| ECE (calibrado con temperatura) | 0,0018 |
| Tamano de entrada | 320 x 320 |
| Protocolo de evaluacion | Split group-aware estratificado 72/14/14, casi-duplicados eliminados, fotos originales |

Advertencia: al tratarse de métricas autodeclaradas, sin conjunto de validación externo ni replicación independiente, deben interpretarse como un límite superior optimista y no como rendimiento esperable en campo.

## Requisitos de hardware

- Pesos en precisión de 32 bits: aproximadamente 71 MB (17.767.052 parámetros x 4 bytes). En 16 bits: aproximadamente 36 MB.
- VRAM estimada para inferencia: por debajo de 1 GB con lote pequeño en fp32; el cuello de botella son las activaciones a 320 x 320, no los pesos.
- Cabe sin problema en GPU de consumo: GTX 1650, RTX 3050, RTX 3060, RTX 4090, e incluso en iGPU modernas. También es viable en CPU para inferencia por lotes moderados.
- GPUs de centro de datos (A100, H100) solo tendrían sentido para procesar volúmenes muy grandes de imágenes en paralelo, no por requisitos de memoria.
- Opciones de despliegue: PyTorch con `timm` (librería declarada), `transformers` con `AutoModelForImageClassification`, exportación a ONNX Runtime, TensorRT, OpenVINO o TorchServe. La conversión a estos formatos no está documentada ni verificada por el autor.
- Latencia y throughput: no disponibles. No se aportan mediciones de tiempo de inferencia ni de imágenes por segundo en ninguna plataforma.

## Comparativa con modelos similares

No se dispone de resultados comparativos sobre PlantCity para otros modelos. La tabla siguiente recoge únicamente características estructurales; los recuentos de parámetros de los modelos alternativos son valores de referencia públicos de cada backbone y no han sido verificados en esta ficha, mientras que las métricas de la tarea se marcan como no disponibles.

| Modelo | Parametros (referencia) | Tipo | Metricas en PlantCity | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PlantCare efficientnet_b4 | 17.767.052 (dato del repositorio) | CNN EfficientNet-B4 ajustada | Accuracy 0,9969 / macro-F1 0,9960 (autorreportadas) | No disponible | Hugging Face, 0 descargas |
| EfficientNet-B0 | ~5,3 M (referencia) | CNN | No disponible | No disponible (depende del checkpoint) | Amplia en `timm` |
| ResNet-50 | ~25,6 M (referencia) | CNN | No disponible | No disponible (depende del checkpoint) | Amplia en `timm` |
| ViT-B/16 | ~86 M (referencia) | Transformer de vision | No disponible | No disponible (depende del checkpoint) | Amplia en `timm` |

No se conocen modelos directamente comparables entrenados sobre PlantCity con resultados publicados.

## Limitaciones y advertencias

- Sesgo geografico: el entrenamiento se limita a hojas de dos distritos de Khyber Pakhtunkhwa (Charsadda y Chitral). El propio autor advierte de una caída de rendimiento en otras regiones, cámaras y cultivos.
- Sesgo de dominio: al usar fotos de campo de cámaras concretas, es probable que el modelo sea sensible a cambios de iluminación, fondo, dispositivo o protocolo de captura.
- No es un sistema de diagnostico: la model card lo describe explícitamente como apoyo a la decisión, no como diagnóstico. Cualquier uso fitosanitario real requiere confirmación por un experto.
- Riesgo de sobreajuste al protocolo de evaluacion: la eliminación de casi-duplicados y el *split* consciente de grupos son buenas prácticas, pero la ausencia de validación externa impide saber si el 0,9969 se mantiene en datos de otra procedencia.
- Calibracion condicionada: el ECE de 0,0018 solo es válido si se aplica el factor `temperature` de `plantcare_meta.json`. Sin ese paso, las confianzas no están calibradas.
- Licencia no disponible: no se especifica licencia para los pesos. Además, el autor remite a comprobar la licencia del dataset PlantCity en Mendeley Data antes de redistribuir el modelo, lo que supone un riesgo legal para uso comercial.
- Sin adopcion ni validacion comunitaria: 0 descargas y 0 *likes* en el momento de la consulta. No hay informes independientes, revisiones ni *issues*.
- Idiomas y contexto: no aplica; no debe interpretarse como un modelo de lenguaje en ningún caso.
- Ausencia de datos de entrenamiento reproducibles: no se documentan epochs, hiperparámetros, composición por clase ni tamaño del dataset, lo que dificulta la reproducibilidad.
- Advertencia sobre la busqueda web: las consultas realizadas no devolvieron ningun resultado relevante sobre este modelo; los enlaces obtenidos correspondian a contenido sin relacion alguna con el proyecto y se han descartado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shahabkhan396/plantcare-efficientnet-b4
- Dataset citado: Khan et al. (2025), PlantCity: A Comprehensive Image Based on Multi Crop Leaves disease in Pakistan, Mendeley Data (no se ha proporcionado URL directa en la informacion disponible; debe localizarse en Mendeley Data y revisarse su licencia)
- Repositorio de `timm`: https://github.com/huggingface/pytorch-image-models
- Ficha del backbone base `efficientnet_b4.ra2_in1k`: no disponible como enlace directo en la informacion proporcionada
- Paper, blog o demo asociados a este modelo: no disponibles
