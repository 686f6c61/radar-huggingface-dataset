# Raiyan465/kom-bish-rice-leaf

## Resumen

Raiyan465/kom-bish-rice-leaf es un clasificador de imagenes de hojas de arroz desarrollado por el usuario Raiyan465 (perfil de HuggingFace) y publicado como modelo ONNX de un unico archivo. Resuelve una tarea concreta de vision por computador: asignar una imagen de hoja de arroz a una de cuatro clases (`bacterial_leaf_blight`, `blast`, `healthy`, `other`). No es un modelo de lenguaje ni un modelo multimodal generativo, sino un clasificador de imagenes de proposito especifico.

El modelo se construye sobre el backbone `mobilenetv3_large_100.ra_in1k` de timm (pesos base con licencia Apache-2.0), afinado a 224 px y exportado a ONNX. La model card lo plantea como una pieza auxiliar de una tabla de reglas de "Kom Bish" y advierte explicitamente de que su salida no constituye un diagnostico. Incluye un mecanismo de abstencion calibrado (temperatura 0.6603, umbral top-1 de 0.83 y margen top-1 menos top-2 de 0.2) para rechazar predicciones de baja confianza.

Su relevancia actual es la de un clasificador ligero pensado para despliegue en el borde (edge) en el contexto agricola de Bangladesh, con licencia MIT para los pesos del modelo y datos de entrenamiento bajo CC BY 4.0 con atribucion obligatoria. Se publico el 10 de octubre de 2026 segun los metadatos de HuggingFace y, en el momento de redactar esta ficha, acumula 0 descargas y 0 "likes", por lo que es un artefacto nuevo y practicamente sin adopcion publica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV3-Large (backbone `mobilenetv3_large_100.ra_in1k` de timm) |
| Parametros totales | no disponible en la informacion proporcionada |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificador de imagenes; entrada 224 x 224 px) |
| Tipos de cuantizacion | no disponible (exportado como ONNX en float32; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de vision; la salida son cuatro etiquetas de clase) |
| Licencia | MIT (pesos base con licencia Apache-2.0); datos de entrenamiento CC BY 4.0 con atribucion obligatoria |
| Formato de pesos | ONNX (un unico archivo) |
| Numero de clases | 4: `bacterial_leaf_blight`, `blast`, `healthy`, `other` |
| Entrada | NCHW float32, nombre `input`, 224 x 224 px |
| Salida | `logits` |
| Libreria | ONNX |
| Pipeline | image-classification |
| Tamano del repositorio | 0.0 GB (segun HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal convolucional MobileNetV3-Large, tomada del backbone `mobilenetv3_large_100.ra_in1k` disponible en timm con pesos base bajo licencia Apache-2.0. El modelo se ha afinado (fine-tuning) a una resolucion de entrada de 224 px y se ha exportado a ONNX como un unico archivo. El preprocesado es estricto: transposicion EXIF, conversion a RGB, redimensionado del lado corto a 256 px con interpolacion bicubica, recorte central a 224 px, escalado a rango 0-1 y normalizacion con media (0.485, 0.456, 0.406) y desviacion (0.229, 0.224, 0.225). Cualquier discrepancia en este pipeline degradara las predicciones.

El entrenamiento se realizo el 11 de octubre de 2026 con tres fuentes de datos bajo CC BY 4.0: RiceLeafBD (DOI 10.17632/kx9rx8p2mz.1, citando tambien arXiv 2501.08912), RiceLeafDisease-BD5 (DOI 10.17632/sjkptpgv79.2) y Dhan-Shomadhan (DOI 10.17632/znsxdctwtt.1, a traves del mirror de HuggingFace `Project-AgML/Dhan-Shomadhan_rice_leaf_disease_classification`, con 766 imagenes de entrenamiento, 167 de validacion y 155 de test). El mapeo de clases redujo las etiquetas de origen a las cuatro clases finales: "Rice Blast" se mapea a `blast` y el resto de enfermedades a `other`. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, algo por otra parte no aplicable a un clasificador de imagenes. La innovacion tecnica destacable es la calibracion y la abstencion: las probabilidades se calculan como `softmax(logits / temperature)` con temperatura 0.6603, y el modelo debe abstenerse cuando el top-1 queda por debajo del umbral 0.83 o cuando la diferencia top-1 menos top-2 es inferior a 0.2. Los tres valores se almacenan en `labels.json`.

## Capacidades

- Clasificacion de imagenes de hojas de arroz en cuatro clases: `bacterial_leaf_blight`, `blast`, `healthy` y `other`.
- Salida de logits crudos y de probabilidades calibradas mediante softmax con temperatura (0.6603).
- Mecanismo de abstencion (refusal) basado en umbral de confianza (top-1 < 0.83) y margen entre las dos clases mas probables (< 0.2).
- Distincion entre hoja sana (`healthy`) y hojas afectadas, agrupando la mayor parte de enfermedades distintas del añublo (`blast`) en la clase `other`.
- Ejecucion como modelo ONNX independiente, apto para entornos de inferencia ligeros.
- No dispone de soporte de tool calling ni function calling, ni de agentes ni razonamiento multi-step.
- No tiene capacidades multilingues ni procesamiento de texto; es exclusivamente vision.
- La clase `other` no cubre fotos que no sean de arroz.

## Casos de uso

- Triaje de campo en aplicaciones moviles: el clasificador recibe una foto de la hoja tomada por un agricultor y devuelve una de las cuatro clases; si la confianza no supera el umbral, la app muestra un mensaje de derivacion al Krishi Call Centre 16123 o a un Sub-Assistant Agriculture Officer, tal como indica la model card.
- Sistema de alerta temprana para tecnicos agricolas: al procesar lotes de imagenes de una parcela, las detecciones de `blast` pueden priorizar visitas de inspeccion, dado que la sensibilidad (recall) para `blast` es de 0.948 en el conjunto de test.
- Filtrado previo de imagenes en un pipeline de vision mayor: el modelo ONNX puede actuar como primera etapa que descarta imagenes claramente sanas o no relevantes antes de enviarlas a un modelo mas costoso.
- Despliegue en el borde (edge) sin GPU: al ser un MobileNetV3-Large en ONNX, cabe en dispositivos de bajos recursos y permite inferencia en CPU o aceleradores ligeros, util en zonas rurales con conectividad limitada.
- Herramienta de apoyo a la decision basada en reglas: la model card lo describe como selector de una fila en una tabla de reglas escrita a mano de "Kom Bish", por lo que encaja como componente de un sistema experto que traduce la clase a una recomendacion agronomica.
- Monitorizacion de cultivos con dron: con resolucion de entrada fija de 224 px, las imagenes capturadas pueden recortarse y clasificarse por fotograma para construir mapas de incidencia de enfermedades.
- Control de calidad de anotaciones: dado su F1 macro de 0.9037 sin abstencion, puede usarse para pre-etiquetar imagenes nuevas y reducir el esfuerzo humano en la revision posterior.

## Benchmarks y rendimiento

La model card reporta metricas sobre un conjunto de test de 828 imagenes, con intervalos de confianza de Wilson al 95 por ciento. El umbral y el margen se eligieron solo sobre validacion.

| Metrica | Valor |
|---|---|
| F1 macro sin abstencion | 0.9037 |
| Cobertura al umbral (imagenes respondidas) | 727/828 = 0.878 (IC 95%: 0.854-0.899) |
| Precision selectiva (aciertos entre respondidas) | 705/727 = 0.970 (IC 95%: 0.955-0.980) |
| Precision sobre respuestas BLB | 35/37 = 0.946 (IC 95%: 0.823-0.985) |
| Precision sobre respuestas blast | 118/128 = 0.922 (IC 95%: 0.862-0.957) |

Metricas por clase (sin abstencion):

| Clase | Soporte | Precision | Recall | F1 |
|---|---|---|---|---|
| bacterial_leaf_blight | 50 | 0.833 (0.704-0.913) | 0.800 (0.670-0.888) | 0.816 |
| blast | 135 | 0.865 (0.800-0.911) | 0.948 (0.897-0.975) | 0.905 |
| healthy | 152 | 0.931 (0.881-0.961) | 0.980 (0.944-0.993) | 0.955 |
| other | 491 | 0.958 (0.935-0.972) | 0.921 (0.893-0.941) | 0.939 |

La model card advierte de un posible sesgo de fondo: las hojas de BD5 se fotografian sobre una sábana blanca, mientras que las de RiceLeafBD se toman en el campo, de modo que el fondo puede revelar la clase. Sobre imagenes de campo, el recall de `blast` cae a 7/18 = 0.389 y el de `bacterial_leaf_blight` a 40/50 = 0.800. La informacion proporcionada esta truncada al final de la tabla de recall por fondo, por lo que no se dispone del ultimo valor.

No se reportan resultados en MMLU, HumanEval, GSM8K ni otras pruebas de modelos de lenguaje, dado que no aplican a este tipo de modelo.

## Requisitos de hardware

- Al ser un MobileNetV3-Large exportado a ONNX (repositorio de 0.0 GB segun HuggingFace, compatible con un archivo de decenas de megabytes), la inferencia es viable en CPU sin GPU dedicada.
- VRAM estimada para inferencia: no disponible en la informacion proporcionada; por la naturaleza del modelo es previsible que quepa en tarjetas con muy poca memoria, aunque no se aporta una cifra oficial.
- GPU recomendadas: no documentadas en la model card. Cualquier GPU consumer (por ejemplo, gama RTX) es mas que suficiente para este tipo de red a 224 px, pero no se aportan recomendaciones explicitas.
- Compatibilidad con GPU consumer: si, es un modelo disenado implicitamente para despliegue ligero; cabe en GPU consumer e incluso en moviles y dispositivos de borde.
- Opciones de despliegue: el propio formato ONNX es el mecanismo de despliegue previsto (ONNX Runtime u otro runtime compatible). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de imagenes.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

En la informacion proporcionada no se citan modelos alternativos directamente comparables para tareas de clasificacion de enfermedades del arroz en ONNX. Los unicos elementos de referencia son el backbone base y los conjuntos de datos.

| Modelo | Tipo | Clases | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Raiyan465/kom-bish-rice-leaf | Clasificador de imagenes (MobileNetV3-Large afinado) | 4 | ONNX | MIT | HuggingFace |
| `mobilenetv3_large_100.ra_in1k` (backbone base) | Clasificador de imagenes generico (ImageNet) | 1000 | no disponible en la ficha | Apache-2.0 | timm |

Alternativas especificas de la misma categoria (otros clasificadores de enfermedades de la hoja de arroz) no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- El propio autor advierte que el modelo no constituye un diagnostico: selecciona una fila de una tabla de reglas manual y las predicciones de baja confianza deben rechazarse y derivarse a un especialista.
- Riesgo de confusion por sesgo de fondo: las imagenes de BD5 estan sobre fondo blanco y las de RiceLeafBD en el campo, lo que puede hacer que el modelo aprenda el fondo en lugar de la enfermedad; el recall de `blast` en imagenes de campo cae al 0.389.
- La clase `other` agrupa enfermedades muy distintas y no cubre fotografias que no sean de arroz; una imagen de otra planta o de otro objeto puede clasificarse erroneamente.
- El rendimiento cae en imagenes de campo procedentes de Dhan-Shomadhan: varios recalls por (fuente, clase) estan entre 0.636 y 0.923, con tasas de abstencion de hasta 0.556.
- Preprocesado fragil: cualquier desviacion del pipeline documentado (normalizacion, recorte, orden de canales) invalida las probabilidades calibradas y el mecanismo de abstencion.
- Idiomas: no aplica, pero la utilidad operativa esta ligada al contexto agronomico de Bangladesh (Krishi Call Centre 16123).
- Licencia: los pesos del modelo son MIT, pero los datos de entrenamiento son CC BY 4.0 y exigen atribucion (RiceLeafBD, RiceLeafDisease-BD5 y Dhan-Shomadhan). El backbone base es Apache-2.0.
- Adopcion nula constatada: 0 descargas y 0 likes, sin validacion independiente por terceros.
- La tabla de resultados de recall por fondo esta truncada en la informacion disponible, por lo que no se puede evaluar el comportamiento completo en condiciones de campo.
- Para produccion, conviene tratar la salida como senal auxiliar y no como diagnostico agronomico definitivo, ademas de monitorizar la tasa de abstencion en el dominio objetivo.

## Enlaces

- HuggingFace: https://huggingface.co/Raiyan465/kom-bish-rice-leaf
- Perfil del autor: Raiyan465 (https://huggingface.co/Raiyan465)
- Backbone base: `mobilenetv3_large_100.ra_in1k` (timm)
- Dataset RiceLeafBD: DOI 10.17632/kx9rx8p2mz.1 (citar tambien arXiv 2501.08912)
- Dataset RiceLeafDisease-BD5: DOI 10.17632/sjkptpgv79.2
- Dataset Dhan-Shomadhan: DOI 10.17632/znsxdctwtt.1
- Mirror del dataset Dhan-Shomadhan en HuggingFace: https://huggingface.co/Project-AgML/Dhan-Shomadhan_rice_leaf_disease_classification
- GitHub del autor: https://github.com/Raiyan465-F1/Raiyan465-F1
- Articulo relacionado (Frontiers in Plant Science): https://www.frontiersin.org/journals/plant-science/articles/10.3389/fpls.2025.1594329/full
