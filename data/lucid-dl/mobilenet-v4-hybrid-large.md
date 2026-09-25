# lucid-dl/mobilenet-v4-hybrid-large

## Resumen

`lucid-dl/mobilenet-v4-hybrid-large` es un clasificador de imágenes de 37,8 millones de parámetros publicado por el usuario `lucid-dl` como port al ecosistema Lucid del checkpoint `timm/mobilenetv4_hybrid_large.ix_e600_r384_in1k`. Se trata de la variante "hybrid large" de MobileNetV4, la familia de modelos universales para el ecosistema móvil presentada por Qin et al. en ECCV 2024 (arXiv:2404.10518), que combina bloques convolucionales con bloques de atención para mejorar la relación precisión/coste computacional frente a arquitecturas puramente convolucionales o puramente transformer.

El modelo resuelve clasificación de imágenes sobre las 1.000 clases de ImageNet-1k, con una precisión declarada por el autor de 83,996 % en top-1 y 96,714 % en top-5. Se distribuye en formato safetensors nativo de Lucid, con la lógica de preprocesado asociada a los pesos (`weights.transforms()`), lo que simplifica su uso en pipelines de inferencia. El repositorio ocupa 0,2 GB y el archivo de pesos de la etiqueta por defecto pesa 144,77 MB.

Su relevancia actual es doble: por un lado, ofrece una arquitectura de referencia en eficiencia para despliegue en dispositivos con recursos limitados; por otro, sirve como punto de partida para *fine-tuning* y extracción de características en tareas de visión por computador. El modelo figura en HuggingFace con 0 descargas y 0 likes en el momento de redactar esta ficha, y las métricas de la model card están marcadas como no verificadas (`verified: false`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV4 variante híbrida (bloques convolucionales + atención); port de `timm/mobilenetv4_hybrid_large.ix_e600_r384_in1k` |
| Parametros totales | 37,8 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; resolución de entrada 384x384 px (derivada del sufijo `r384` del tag) |
| Tipos de cuantizacion | no disponibles; solo se distribuyen pesos safetensors, sin variantes GGUF, ONNX o cuantizadas documentadas |
| Idiomas soportados | no aplica (clasificación de imágenes, sin capacidades de texto) |
| Licencia | Apache-2.0 (heredada de los pesos originales) |
| Formato de pesos | safetensors (nativo de Lucid) |
| Pipeline | image-classification |
| Dataset de entrenamiento | ImageNet-1k (`imagenet-1k`) |
| Etiqueta de pesos por defecto | `IX_E600_R384_IN1K` |
| Clases de salida | 1.000 (ImageNet-1k) |
| GFLOPs | no disponible |
| Tamano del repositorio | 0,2 GB |
| Tamano del archivo de pesos | 144,77 MB |
| Libreria | lucid |

## Arquitectura y entrenamiento

El checkpoint corresponde a la familia MobileNetV4, descrita en *MobileNetV4: Universal Models for the Mobile Ecosystem* (Qin et al., ECCV 2024). Según la nomenclatura del modelo en timm, la variante `hybrid_large` combina capas convolucionales con bloques de atención, en línea con el diseño híbrido CNN-transformer que la publicación propone para mejorar la eficiencia por *FLOP* en el rango de modelos orientados a móvil. La información proporcionada no detalla la configuración exacta de bloques, el número de cabezas de atención ni la distribución de capas, por lo que esos datos se consideran no disponibles.

En cuanto al entrenamiento, la etiqueta `IX_E600_R384_IN1K` indica que los pesos originales se entrenaron sobre ImageNet-1k durante 600 épocas a una resolución de entrada de 384x384 píxeles. La model card no documenta la composición exacta del dataset más allá de ImageNet-1k, ni si se aplicaron fases de ajuste adicionales. No se menciona ningún uso de RLHF, DPO ni técnicas de alineación, algo esperable en un clasificador de imágenes.

La innovación principal de este port es de carácter práctico: la conversión a safetensors nativos de Lucid, realizada con la herramienta `tools.convert_weights` y verificada mediante una carga estricta (*strict load*) contra un modelo Lucid construido al efecto. El autor declara que se comprobaron el conjunto de claves y las formas de los tensores. El preprocesado se distribuye junto con los pesos, lo que evita discrepancias entre el *pipeline* de entrenamiento y el de inferencia.

## Capacidades

- Clasificación de imágenes en 1.000 clases de ImageNet-1k, devolviendo logits por clase (`out.logits`, forma `(B, num_classes)`).
- Extracción de características: al ser un *backbone* convolucional híbrido, puede emplearse como extractor para tareas *downstream* (detección, segmentación, recuperación de imágenes) previa adaptación de la cabeza.
- *Fine-tuning* sobre datasets propios, dado que se distribuyen pesos completos y licencia permisiva.
- Preprocesado integrado: `weights.transforms()` aplica la normalización y el redimensionado correspondientes a la resolución de entrenamiento.
- Carga por etiqueta explícita, mediante enumeración (`MobileNetV4HybridLargeWeights.IX_E600_R384_IN1K`) o cadena (`pretrained="IX_E600_R384_IN1K"`).
- Inferencia por lotes: la API documentada acepta tensores con dimensión de batch (`preprocess(image)[None]`).
- No soporta *tool calling*, *function calling*, uso como agente, razonamiento multi-paso ni generación de texto.
- No dispone de modo *thinking*, visión-lenguaje, audio ni capacidades multilingües: es exclusivamente un clasificador visual.

## Casos de uso

- Etiquetado de catálogos de producto en comercio electrónico: el modelo asigna una de las 1.000 clases de ImageNet-1k a cada imagen, lo que permite un primer nivel de categorización automática antes de un clasificador específico de negocio.
- Pre-etiquetado de datasets de visión: dado su coste computacional reducido (37,8 M de parámetros, 144,77 MB de pesos), se puede ejecutar en lotes grandes para generar etiquetas iniciales que después se revisan manualmente, acelerando el etiquetado humano.
- Backbone para tareas de visión *downstream*: sustituyendo la cabeza de clasificación, sirve como extractor de características en modelos de detección o segmentación que necesiten un *encoder* ligero.
- Control de calidad en manufactura: con *fine-tuning* sobre imágenes de producto y defectos, el modelo puede clasificar piezas correctas frente a defectuosas en línea de producción, desplegado en hardware de borde.
- Filtrado previo en pipelines de búsqueda visual o moderación: una primera pasada de clasificación descarta o prioriza imágenes antes de modelos más costosos, reduciendo el coste global del *pipeline*.
- Aplicaciones móviles y de borde: la familia MobileNetV4 está diseñada para el ecosistema móvil, y este checkpoint, con 144,77 MB en el archivo de pesos, es candidato a despliegue en dispositivos con memoria limitada tras la conversión adecuada.
- Investigación en eficiencia de arquitecturas: el checkpoint permite reproducir la referencia `IX_E600_R384_IN1K` en el *framework* Lucid y comparar implementaciones, gracias a la conversión verificada con *strict load*.
- Prototipado rápido de productos de visión: al cargar los pesos con una sola llamada (`pretrained=True`) y traer el preprocesado incluido, se reduce el tiempo de puesta en marcha de una demo funcional.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Dataset | Tarea | Metrica | Valor |
|---|---|---|---|
| ImageNet-1k | image-classification | acc@1 | 83,996 % |
| ImageNet-1k | image-classification | acc@5 | 96,714 % |

No se han publicado otros resultados de benchmarks ni comparaciones con modelos similares en la información disponible. Los datos de *throughput* y latencia tampoco se proporcionan.

## Requisitos de hardware

- VRAM estimada para inferencia: con 37,8 M de parámetros, los pesos ocupan aproximadamente 144,77 MB en precisión de 32 bits y alrededor de 72 MB en 16 bits; sumando activaciones de un lote pequeño a 384x384, el consumo total se mantiene por debajo de 1 GB. Estas cifras son estimaciones derivadas del tamaño de los pesos, no medidas publicadas.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente; no se requiere hardware de centro de datos (A100, H100) salvo para *fine-tuning* con lotes grandes o entrenamiento a alta resolución.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en tarjetas de gama de entrada y en modelos integrados (por ejemplo, GTX 1650, RTX 3050, RTX 4090), así como en aceleradores de borde.
- Inferencia en CPU: viable, dado el reducido número de parámetros; no se documentan cifras de latencia.
- Opciones de despliegue: la librería Lucid (`lucid.models.mobilenet_v4_hybrid_large_cls`) y timm son las vías documentadas. Los servidores orientados a modelos de lenguaje (vLLM, TGI, Ollama) no son aplicables a un clasificador de imágenes. Herramientas como ONNX Runtime, TensorRT o TensorFlow Lite requerirían una conversión previa que no está documentada en la información disponible.
- Latencia y *throughput*: no disponibles.

## Comparativa con modelos similares

No se han proporcionado datos de benchmarks de otros modelos en la información disponible, por lo que no es posible establecer una comparación numérica rigurosa. Como referencia cualitativa de la categoría:

| Modelo | Parametros | Resolucion de entrada | Licencia | Datos comparativos |
|---|---|---|---|---|
| mobilenet-v4-hybrid-large (esta ficha) | 37,8 M | 384x384 (según tag) | Apache-2.0 | acc@1 83,996 % / acc@5 96,714 % en ImageNet-1k |
| Otras variantes de MobileNetV4 (`timm`) | no disponible | no disponible | Apache-2.0 (los pesos originales) | no disponible en la información proporcionada |
| MobileNetV3 (familias previas) | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| EfficientNet / ConvNeXt / DeiT en rango similar de parámetros | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

Los resultados de búsqueda web recuperados durante la elaboración de esta ficha corresponden a entidades no relacionadas (Lucid Motors, Lucid Trading, Lucidchart) y no aportan información técnica sobre el modelo.

## Limitaciones y advertencias

- Espacio de etiquetas cerrado: el modelo solo predice las 1.000 clases de ImageNet-1k; no genera descripciones ni etiquetas abiertas, y una imagen fuera de ese vocabulario será forzada a la clase más probable.
- Sesgos heredados de ImageNet-1k: el dataset presenta desequilibrios geográficos y culturales conocidos, con sobrerrepresentación de determinadas categorías y contextos, lo que puede degradar el rendimiento en dominios poco representados.
- Riesgo de alucinación en sentido clasificatorio: el modelo siempre devuelve una distribución de probabilidad sobre clases, incluidas imágenes ambiguas, sin mecanismo de abstención ni umbral de confianza incorporado. Es responsabilidad del integrador fijar umbrales.
- Métricas no verificadas: los valores de acc@1 y acc@5 los declara el autor de la ficha (`verified: false`) y no han sido reproducidos de forma independiente en la información disponible.
- Sin validación comunitaria: el repositorio registra 0 descargas y 0 likes, por lo que no existe evidencia externa de funcionamiento en producción más allá de la verificación de carga declarada por el autor.
- Dependencia del ecosistema Lucid: el uso documentado requiere la librería `lucid`; fuera de ella habría que recurrir a los pesos originales de timm o a una conversión propia.
- Resolución de entrada ligada al checkpoint: la etiqueta indica entrenamiento a 384x384; usar otras resoluciones sin ajuste puede alterar la precisión.
- Idiomas: no aplica, pero conviene señalar que el modelo no procesa texto y, por tanto, no ofrece ninguna capacidad multilingüe.
- Licencia: Apache-2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se atribuya correctamente. La licencia se hereda de los pesos originales; conviene verificar las condiciones del checkpoint de timm de origen.
- Ausencia de cuantizaciones publicadas: no hay variantes GGUF, ONNX, TensorRT ni formatos de borde listos para usar, lo que añade trabajo de conversión para despliegues en dispositivos muy restringidos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lucid-dl/mobilenet-v4-hybrid-large
- Checkpoint original en timm: https://huggingface.co/timm/mobilenetv4_hybrid_large.ix_e600_r384_in1k
- Paper MobileNetV4 (ECCV 2024): https://arxiv.org/abs/2404.10518
- Repositorio de la librería Lucid: https://github.com/ChanLumerico/lucid
- Cita del paper (BibTeX): `@inproceedings{qin2024mobilenetv4, title={MobileNetV4: Universal Models for the Mobile Ecosystem}, author={Qin, Danfeng and Leichner, Chas and Delakis, Manolis and Fornoni, Marco and Luo, Shixin and Yang, Fan and Wang, Weijun and Banbury, Colby and Ye, Chengxi and Akin, Berkin and others}, booktitle={ECCV}, year={2024}}`
- Resultados de búsqueda web: no se han encontrado enlaces técnicos relevantes; los resultados obtenidos corresponden a entidades homónimas sin relación con el modelo.
