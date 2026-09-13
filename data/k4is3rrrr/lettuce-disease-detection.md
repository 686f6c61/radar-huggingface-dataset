# K4is3rrrr/lettuce-disease-detection

## Resumen

El modelo `K4is3rrrr/lettuce-disease-detection` es un clasificador de imágenes publicado en Hugging Face por el usuario K4is3rrrr. Según los metadatos del repositorio, se trata de una red convolucional ResNet50 con 23.639.014 parámetros (unos 91 MB en safetensors fp32) entrenada para la detección de enfermedades en hojas de plantas, con etiquetas asociadas a agricultura, `plant-disease` y `west-africa`, y con el dataset PlantVillage como referencia de entrenamiento.

El interés práctico del modelo reside en su tamaño reducido y su coste de inferencia bajo: es un clasificador de 38 clases que, según la model card, alcanza más del 95 % de accuracy sobre el conjunto de test de PlantVillage y tarda menos de 100 ms por imagen en CPU, con un consumo de memoria en torno a 400 MB. Eso lo hace candidato a despliegues en el borde (móvil, Raspberry Pi, servidor modesto) mediante un microservicio FastAPI, tal y como propone el propio autor.

Ahora bien, existe una discrepancia relevante entre el identificador del repositorio y el contenido de la model card: el nombre apunta a detección de enfermedades de la lechuga, mientras que la ficha describe un clasificador genérico de 38 clases sobre maíz, tomate, manzana, uva, patata, pimiento, cereza, melocotón, fresa y naranja, sin incluir la lechuga en la lista de cultivos soportados. Además, el código de ejemplo carga el identificador `mesabo/agri-plant-disease-resnet50`, no el repositorio actual. Esta ficha recoge ambos hechos de forma explícita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet50 (red neuronal convolucional con conexiones residuales) |
| Parametros totales | 23.639.014 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificación de imágenes; entrada de 224x224 píxeles RGB) |
| Tipos de cuantizacion | no disponible (solo pesos safetensors en precisión nativa; no se publican variantes GGUF, ONNX ni int8) |
| Idiomas soportados | no aplica (modelo de visión); las etiquetas de clase de la model card están en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Otros datos del repositorio: pipeline `image-classification`, tamaño del repositorio 0,1 GB, 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 13 de septiembre de 2026. Etiquetas declaradas: `resnet`, `resnet50`, `image-classification`, `plant-disease`, `agriculture`, `computer-vision`, `west-africa`, `dataset:plantvillage`, `region:us`.

## Arquitectura y entrenamiento

La arquitectura es una ResNet50 estándar, es decir, una CNN profunda de 50 capas con bloques residuales que mitigan el problema del desvanecimiento del gradiente y permiten entrenar redes profundas con estabilidad. El modelo cuenta con 23,6 millones de parámetros (la cifra reportada por el repositorio, ligeramente inferior a los 25,6 millones de la ResNet50 original de ImageNet, lo que sugiere una cabeza de clasificación adaptada a las 38 clases de salida). La entrada es de 224x224 píxeles en RGB, el preprocesado habitual de esta familia de modelos.

En cuanto al entrenamiento, la model card indica que se usó el dataset PlantVillage con 54.305 imágenes y que se aplicó aumento de datos (augmentation). No se especifican hiperparámetros, número de épocas, partición train/val/test, estrategia de congelación de capas, ni si se partió de pesos preentrenados en ImageNet. Tampoco se documenta ningún tipo de ajuste por refuerzo (RLHF/DPO), algo que no aplica a un clasificador de imágenes. No se describe ninguna innovación técnica adicional (atención lineal, decodificación especulativa, destilación, etc.); es un fine-tuning convencional de una ResNet50 para clasificación de enfermedades foliares.

## Capacidades

- Clasificación de imágenes de hojas de plantas en una única etiqueta entre 38 categorías declaradas, con salida de logits y probabilidad asociada vía softmax.
- Cobertura declarada por la model card: maíz (4 clases), tomate (10 clases), manzana (4), uva (4), patata (3), pimiento (2) y, de forma genérica, cereza, melocotón, fresa y naranja.
- Inferencia sobre imágenes RGB de 224x224, con redimensionado y normalización a cargo del `AutoImageProcessor` de transformers.
- Posibilidad de procesamiento por lotes, al ser una CNN estándar y no un modelo autorregresivo.
- Integración sencilla como microservicio HTTP (el autor incluye un ejemplo completo con FastAPI).
- No dispone de tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni planificación.
- No tiene capacidades multilingües ni generación de texto: no es un modelo de lenguaje.
- No dispone de modo de razonamiento (thinking mode), visión general, audio ni vídeo.
- No se documentan capacidades de detección, segmentación ni localización de lesiones (solo clasificación a nivel de imagen completa).

## Casos de uso

- Diagnóstico preliminar en campo desde el móvil: el usuario fotografía una hoja y la aplicación envía la imagen a un servicio que ejecuta el modelo; con menos de 100 ms por imagen en CPU y unos 400 MB de memoria, el coste por consulta es muy bajo y puede desplegarse en un servidor pequeño.
- Servicio HTTP de clasificación para extensionistas agrícolas: el ejemplo FastAPI del autor permite exponer un endpoint `/predict` que devuelve etiqueta y confianza, integrable en un panel web de asesoramiento.
- Triaje previo de imágenes en programas de vigilancia fitosanitaria: clasificar automáticamente lotes de fotografías recogidas por cooperativas y priorizar las que el modelo marca como enfermas para revisión por un fitopatólogo humano.
- Preetiquetado para anotación y aprendizaje activo: usar las predicciones del modelo como etiquetas iniciales sobre imágenes nuevas de PlantVillage o de campos propios, revisando manualmente solo los casos de baja confianza antes de reentrenar.
- Monitorización en invernadero con cámaras fijas: el modelo puede ejecutarse en un dispositivo de borde (Raspberry Pi, Jetson Nano o similar) y generar alertas cuando la clasificación cambie de "sana" a una clase de enfermedad en una zona concreta del cultivo.
- Material didáctico y formación: por su tamaño contenido, es un modelo adecuado para talleres de visión por computador aplicada a agricultura, ya que se puede entrenar y ejecutar en portátiles sin GPU dedicada.
- Control de calidad en investigación agronómica: clasificación reproducible de imágenes de ensayos de variedades resistentes, siempre que las imágenes se capturen en condiciones similares al dataset de entrenamiento.

Advertencia común a todos los casos: la discrepancia entre el nombre del repositorio (lechuga) y los cultivos documentados en la model card obliga a verificar empíricamente qué clases predice realmente el modelo antes de integrarlo en cualquier flujo de producción.

## Benchmarks y rendimiento

Los únicos datos publicados provienen de la model card del autor y no han sido verificados de forma independiente. No hay resultados de MMLU, HumanEval ni GSM8K, que no aplican a un clasificador de imágenes.

| Metrica | Valor | Fuente |
|---|---|---|
| Accuracy en el conjunto de test de PlantVillage | "95 %+" | model card del autor |
| Tiempo de inferencia | < 100 ms en CPU | model card del autor |
| Uso de memoria | ~400 MB | model card del autor |
| Tamano de entrada | 224x224 RGB | model card del autor |
| Imagenes de entrenamiento | 54.305 | model card del autor |
| Numero de clases | 38 | model card del autor |

No se publican métricas por clase, matriz de confusión, F1, precisión/recall, partición exacta de test ni resultados sobre imágenes de campo reales (fuera de PlantVillage).

## Requisitos de hardware

- Peso de los pesos en fp32: aproximadamente 94,6 MB (23.639.014 parámetros x 4 bytes), coherente con el tamaño del repositorio de 0,1 GB.
- Memoria de inferencia declarada por el autor: en torno a 400 MB.
- CPU: inferencia en menos de 100 ms por imagen según la model card; puede ejecutarse sin GPU.
- GPU: cabe en cualquier GPU con 1 GB o más de VRAM. Una RTX 4090, A100 o H100 están sobredimensionadas para este modelo; una GTX 1650, T4 o incluso una GPU integrada son suficientes.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo actuales, y también en dispositivos de borde tipo Raspberry Pi o Jetson Nano en inferencia en CPU o GPU ligera.
- Opciones de despliegue: `transformers` + PyTorch (flujo documentado por el autor), FastAPI como envoltorio HTTP, exportación a ONNX Runtime o TorchScript (no publicada en el repositorio), TorchServe o Hugging Face Inference Endpoints. No aplica llama.cpp, Ollama, vLLM ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no se publica throughput con batching; solo el dato de menos de 100 ms por imagen en CPU. Con GPU y lotes pequeños el throughput sería sustancialmente mayor, pero no hay mediciones disponibles.

## Comparativa con modelos similares

La informacion proporcionada no incluye comparativas con otros modelos. A continuacion se comparan dimensiones objetivas frente a alternativas habituales de clasificacion de imagenes; los recuentos de parametros de las alternativas son valores publicos de referencia de cada arquitectura, no mediciones verificadas en esta ficha, y sus metricas en PlantVillage no estan disponibles.

| Modelo | Arquitectura | Parametros (referencia publica) | Contexto | Entrada | Licencia | Rendimiento en PlantVillage |
|---|---|---|---|---|---|---|
| Este modelo (`K4is3rrrr/lettuce-disease-detection`) | ResNet50 | 23.639.014 | no aplica | 224x224 RGB | Apache 2.0 | 95 %+ declarado por el autor |
| ResNet50 preentrenada en ImageNet | CNN con residuales | ~25,6 M | no aplica | 224x224 RGB | variable segun distribucion | no disponible |
| EfficientNet-B0 | CNN con compound scaling | ~5,3 M | no aplica | 224x224 RGB | variable segun implementacion | no disponible |
| MobileNetV3-Large | CNN con bloques ligeros | ~5,4 M | no aplica | 224x224 RGB | variable segun implementacion | no disponible |
| ViT-B/16 | Transformer de vision | ~86 M | no aplica | 224x224 RGB | variable segun implementacion | no disponible |

En terminos cualitativos, ResNet50 es mas pesada que MobileNetV3 o EfficientNet-B0, pero mas ligera que un ViT-B/16, lo que la situa en un punto intermedio entre precision esperada y coste de despliegue. Para aplicaciones en movil o dispositivos de muy bajos recursos, las alternativas ligeras suelen ser preferibles; para investigacion con GPU disponible, un ViT puede ofrecer mejor rendimiento a cambio de mas parametros y datos.

## Limitaciones y advertencias

- Discrepancia entre el identificador del repositorio (`lettuce-disease-detection`) y el contenido de la model card, que describe un clasificador de 38 clases de maiz, tomate, manzana, uva, patata, pimiento, cereza, melocoton, fresa y naranja. La lechuga no aparece en la lista de cultivos soportados. Hay que comprobar empiricamente que clases predice el modelo antes de usarlo.
- El codigo de ejemplo de la model card carga el identificador `mesabo/agri-plant-disease-resnet50`, no este repositorio, lo que sugiere que la ficha puede haber sido copiada de otro modelo. La procedencia real de los pesos no esta documentada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no cuenta con validacion de la comunidad ni con resultados reproducidos por terceros.
- Solo se declara accuracy global ("95 %+"); no hay metricas por clase, matriz de confusion ni analisis de clases desbalanceadas. En un problema de 38 clases, la accuracy agregada puede ocultar clases con rendimiento muy bajo.
- PlantVillage contiene imagenes tomadas en condiciones controladas (fondo uniforme, iluminacion homogenea). El rendimiento en fotografias de campo reales, con fondo vegetal, sombras, desenfoque o multiples hojas, suele degradarse de forma notable por cambio de dominio.
- La confianza devuelta por softmax no esta calibrada: una prediccion erronea puede venir acompanada de una probabilidad alta, especialmente ante imagenes fuera de la distribucion de entrenamiento.
- Riesgo de clasificacion erronea silenciosa: el modelo siempre devuelve una de las 38 etiquetas, incluidas las clases "sanas", sin mecanismo de rechazo ante entradas no validas.
- Cobertura geografica incompleta para Africa Occidental: la propia model card reconoce que no soporta yuca, anacardo ni cacao, cultivos clave en la region, y recomienda hacer fine-tuning con el dataset CCMT Ghana.
- No se documenta el sesgo demografico o geografico del dataset mas alla de su origen en PlantVillage, ni la composicion exacta por cultivo y por clase.
- La licencia Apache 2.0 permite uso comercial, pero al no estar clara la autoria real de los pesos ni la relacion con el repositorio `mesabo/agri-plant-disease-resnet50`, conviene verificar la procedencia antes de integrarlo en un producto.
- No se publican pesos en formatos optimizados (ONNX, TensorRT, int8), por lo que cualquier optimizacion de despliegue debera realizarla el integrador.
- No es un modelo de lenguaje: no genera texto, no responde preguntas y no puede usarse como chatbot agricola. Una prediccion del modelo debe acompanarse de recomendaciones agronomicas procedentes de otra fuente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/K4is3rrrr/lettuce-disease-detection
- Dataset PlantVillage (referenciado en las etiquetas y en la model card): no se proporciona URL directa en la informacion disponible
- Dataset CCMT Ghana, recomendado por el autor para yuca y anacardo: https://data.mendeley.com/datasets/bwh3zbpkpv/1
- Modelo relacionado citado por el autor, `mesabo/agri-chat-multilingual`: https://huggingface.co/mesabo/agri-chat-multilingual
- Repositorio referenciado en el codigo de ejemplo, `mesabo/agri-plant-disease-resnet50`: https://huggingface.co/mesabo/agri-plant-disease-resnet50
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a paginas generales de YouTube y no guardan relacion con el modelo.
