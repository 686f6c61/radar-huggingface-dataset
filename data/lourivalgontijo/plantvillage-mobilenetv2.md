# LourivalGontijo/plantvillage-mobilenetv2

## Resumen

`plantvillage-mobilenetv2` es un clasificador de imágenes de hojas de cultivo, resultado del ajuste fino completo (*end-to-end*) de `google/mobilenet_v2_1.0_224` sobre el conjunto PlantVillage en color. Lo publica el usuario de HuggingFace LourivalGontijo como artefacto del proyecto de fin de grado «AI-Powered Plant Disease Detection and Farmer Assistance» (IIIT-H, grupo 4). Dada una única fotografía RGB de una hoja, el modelo devuelve una de 38 clases (14 cultivos, entre enfermedades y estados sanos) junto con la probabilidad softmax asociada.

Arquitectónicamente es una CNN MobileNetV2 con factor de anchura 1.0 y entrada de 224×224 píxeles, con 2.306.662 parámetros totales. No es un modelo de lenguaje: no genera texto, no tiene ventana de contexto y no soporta tool calling. Su interés práctico está en el extremo opuesto al de los LLM: una huella de aproximadamente 9 MB en fp32 que permite inferencia en CPU, dispositivos móviles y hardware de borde, algo relevante para despliegues agrícolas con conectividad limitada.

El dato más importante de la ficha, y el que el propio autor documenta sin maquillar, es la enorme brecha entre el rendimiento de laboratorio (99,17 % de accuracy en el split de test de PlantVillage) y el rendimiento en imágenes de campo (16 % de top-1 sobre un conjunto real de 25 imágenes de Cropped-PlantDoc). Esa diferencia de más de 80 puntos es la clave para evaluar si el modelo sirve para producción o solo como pieza de un pipeline con verificación humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (CNN con bloques residuales invertidos y convoluciones separables en profundidad), factor de anchura 1.0, entrada 224×224 |
| Parametros totales | 2.306.662 (recuento real de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de clasificación de imágenes; entrada de una sola imagen) |
| Tipos de cuantizacion | no disponible: el repositorio solo publica safetensors en precisión original. Al ser una CNN de 2,3 M de parámetros es viable cuantizar a int8 vía ONNX/TFLite, pero el autor no distribuye esos artefactos |
| Idiomas soportados | en (etiquetas de clase y documentación en inglés; la tarea no es lingüística) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers); no se publican GGUF, ONNX ni TFLite |
| Tarea (pipeline) | image-classification |
| Numero de clases | 38 clases, 14 cultivos |
| Modelo base | google/mobilenet_v2_1.0_224 (fine-tune completo) |
| Dataset de entrenamiento | abdallahalidev/plantvillage-dataset (color) + Cropped-PlantDoc en la etapa 2 |
| Entrada esperada | una foto RGB de una hoja, aproximadamente centrada, con luz diurna |
| Salida | nombre de clase PlantVillage (p. ej. `Tomato___Early_blight`) + probabilidad softmax |
| Tamano del repositorio | 0.0 GB (según el Hub) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La base es MobileNetV2, una red convolucional diseñada para eficiencia en dispositivos móviles mediante bloques residuales invertidos con expansión de canales y convoluciones separables en profundidad, más conexiones de atajo lineales en las capas de menor dimensión. El autor sustituye la cabeza de 1000 clases de ImageNet por una de 38 clases y ajusta la red completa, no solo el clasificador. La diferencia entre los aproximadamente 3,5 M de parámetros de la arquitectura base y los 2,31 M del checkpoint publicado corresponde precisamente al adelgazamiento de esa capa final.

Los datos de la primera etapa son las imágenes en color de PlantVillage, con partición estratificada por clase y semilla 42: 43.445 imágenes de entrenamiento, 5.430 de validación y 5.430 de test. La etapa 2 (etiqueta `v1.1` y posteriores) incorpora Cropped-PlantDoc, un conjunto de campo con licencia CC BY 4.0 (Singh et al., 2020), que cubre 27 de las 38 clases; las otras 11 permanecen como clases solo de laboratorio. El manifiesto de datos y el commit de PlantDoc se documentan en `run_info.json`.

El aumento de datos está orientado explícitamente a robustez ante fotos de móvil: recorte aleatorio redimensionado (70-100 % en PlantVillage, 50-100 % en PlantDoc), volteos horizontal y vertical, rotación de hasta 180°, variaciones de brillo, contraste y saturación, y desenfoque gaussiano aleatorio. El preprocesado de evaluación es el estándar de la arquitectura: redimensionar el lado corto, recorte central a 224 y normalización según `preprocessor_config.json`. En la información disponible no se detalla el número total de épocas, la función de pérdida, el optimizador ni si hubo etapas de calibración posteriores al entrenamiento supervisado.

## Capacidades

- Clasificación de imagen de etiqueta única sobre 38 clases que cubren 14 cultivos (manzana, arándano, cereza, maíz, uva, naranja, melocotón, pimiento, patata, frambuesa, soja, calabaza, fresa y tomate), incluyendo tanto enfermedades concretas como estados sanos.
- Salida de distribución de probabilidad completa, lo que permite explotar top-3 (99,98 % en el test de PlantVillage) y aplicar umbrales de confianza.
- Mecanismo de abstención recomendado por el autor: una probabilidad top-1 inferior a 0,5 debe interpretarse como «no estoy seguro» y derivarse a una foto mejor o a un experto. El barrido de umbral está documentado en la model card.
- Integración prevista en un agente LangGraph que traduce la clase predicha en una explicación y una recomendación de tratamiento a partir de una base de conocimiento agrícola curada. Esa capacidad de explicación reside en el agente, no en este modelo.
- No soporta generación de texto, razonamiento multi-paso, tool calling ni function calling.
- No tiene capacidades multimodales más allá de la clasificación: no hay visión generativa, ni OCR, ni segmentación, ni detección de cajas.
- No es multilingüe: las etiquetas y la documentación están en inglés.
- No incorpora detección de fuera de distribución ni rechazo de imágenes que no sean hojas.

## Casos de uso

- **Aplicación móvil de diagnóstico para agricultores**: el modelo se ejecuta en el propio teléfono (o en una función serverless) y devuelve la clase más probable más la confianza. Su tamaño de 2,3 M de parámetros y su naturaleza convolucional permiten inferencia en CPU sin GPU, lo que encaja con explotaciones con conectividad intermitente.
- **Triage previo a la consulta con un especialista**: con el umbral de 0,5 recomendado, las predicciones de baja confianza se enrutan a un técnico de extensión agraria y las de alta confianza se responden automáticamente, reduciendo la carga de revisión manual.
- **Asistente conversacional agrícola**: combinado con un agente tipo LangGraph, la clase predicha actúa como entrada estructurada para recuperar fichas de tratamiento; aquí el modelo aporta la señal visual y el LLM del pipeline aporta la explicación en lenguaje natural.
- **Filtrado y etiquetado asistido de datasets agrícolas**: el modelo puede preetiquetar lotes de imágenes nuevas para que un anotador humano solo revise los casos dudosos, usando la probabilidad y el top-3 como criterio de derivación.
- **Monitorización en invernadero o parcela con captura periódica**: integrado en un dispositivo de bajo coste (Raspberry Pi, Jetson Nano) que fotografía hojas a intervalos y registra la evolución de la clase dominante, siempre con confirmación humana antes de actuar.
- **Material docente y línea base de comparación**: sirve como referencia reproducible (semilla 42, split documentado, informe por clase y matriz de confusión publicados) para evaluar otros clasificadores de enfermedades de plantas sobre el mismo split.
- **Investigación sobre brecha laboratorio-campo**: el par de resultados PlantVillage (99,17 %) frente a Cropped-PlantDoc (16 %) lo convierte en un caso de estudio útil para medir cuánto se degrada un modelo entrenado con fondo uniforme al pasar a imágenes reales.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card. Ninguno está marcado como verificado (`verified: false`) en el model-index.

| Conjunto de evaluacion | Metrica | Valor |
|---|---|---|
| PlantVillage (color), split de test retenido, 5.430 imagenes | Accuracy | 99,17 % |
| PlantVillage (color), split de test retenido | Precision macro | 98,79 % |
| PlantVillage (color), split de test retenido | Recall macro | 98,36 % |
| PlantVillage (color), split de test retenido | F1 macro | 98,51 % |
| PlantVillage (color), split de test retenido | Top-3 accuracy | 99,98 % |
| Cropped-PlantDoc, split final, 25 imagenes | Top-1 accuracy (modelo alcanzado) | 16,00 % |
| Cropped-PlantDoc, split final, 25 imagenes | End-to-end pass rate | 16,00 % |

Clases con peor F1 en el test de PlantVillage, según el informe por clase: `Potato___healthy` (84,62 %, con solo 15 imágenes de soporte), `Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot` (88,89 %, 51 imágenes) y `Corn_(maize)___Northern_Leaf_Blight` (95,34 %, 98 imágenes). El resto de clases listadas en la información disponible se sitúa por encima del 97 % de F1, y una parte importante en el 100 %.

No se han publicado en la información disponible resultados comparativos con otros modelos sobre estos mismos conjuntos, ni latencias, ni curvas de calibración distintas del barrido de umbral mencionado.

## Requisitos de hardware

- **Huella de pesos**: 2.306.662 parámetros, equivalentes a unos 9,2 MB en fp32, 4,6 MB en fp16 y 2,3 MB en int8 (cálculo derivado del recuento de parámetros, no publicado por el autor).
- **VRAM estimada**: por debajo de 1 GB en cualquier precisión; el consumo real lo dominan el preprocesado de imagen y el tamaño de lote, no los pesos.
- **GPU recomendadas**: no requiere GPU. Cualquier GPU consumer sirve y resulta sobredimensionada; A100 o H100 no aportan ventaja práctica para este modelo.
- **¿Cabe en GPU consumer?**: sí, en todas, incluidas GTX 1050, RTX 3060 o RTX 4090. También funciona en CPU de forma holgada.
- **Despliegue en borde**: es el escenario natural. Cabe en Raspberry Pi, Jetson Nano, Coral o smartphone mediante exportación a ONNX Runtime o TFLite; el repositorio no incluye esos artefactos exportados, habría que generarlos.
- **Opciones de despliegue**: `transformers` con `pipeline("image-classification")` y el `preprocessor_config.json` incluido; exportación a TorchScript/ONNX; servidores de inferencia genéricos como Triton. vLLM y TGI no aplican, ya que son servidores para modelos de lenguaje.
- **Latencia y throughput**: no disponibles. No se han publicado medidas en la información consultada.

## Comparativa con modelos similares

No se han identificado en la información disponible otros fine-tunes de PlantVillage publicados con los que comparar directamente sobre el mismo split. La comparación siguiente se limita a las arquitecturas base candidatas para esta tarea, en parámetros, licencia y disponibilidad; las cifras de rendimiento sobre PlantVillage de las alternativas no están disponibles.

| Modelo | Parametros | Entrada | Rendimiento en esta tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| plantvillage-mobilenetv2 (este modelo) | 2,3 M | 224×224 | 99,17 % acc PlantVillage; 16 % top-1 en Cropped-PlantDoc (25 imágenes) | Apache-2.0 | HuggingFace, safetensors |
| google/mobilenet_v2_1.0_224 (base, ImageNet-1k) | ~3,5 M (cabeza de 1000 clases) | 224×224 | no disponible (no entrenado en PlantVillage) | Apache-2.0 | HuggingFace, safetensors |
| EfficientNet-B0 (ImageNet-1k) | ~5,3 M | 224×224 | no disponible en esta tarea | Apache-2.0 | HuggingFace / torchvision |
| ResNet-50 (ImageNet-1k) | ~25,6 M | 224×224 | no disponible en esta tarea | Apache-2.0 (checkpoint HF) | HuggingFace / torchvision |
| ViT-B/16 (ImageNet-1k) | ~86 M | 224×224 | no disponible en esta tarea | Apache-2.0 | HuggingFace |

La comparación relevante para producción no es de parámetros sino de robustez: las alternativas más grandes (ResNet-50, ViT-B/16) tienen mayor capacidad, pero multiplican por 10-40 el tamaño del artefacto sin garantía de cerrar la brecha dominio laboratorio/dominio campo, que es el problema dominante documentado en este modelo.

## Limitaciones y advertencias

- **Brecha laboratorio-campo severa**: 99,17 % de accuracy en PlantVillage frente a 16 % de top-1 en Cropped-PlantDoc. PlantVillage contiene hojas fotografiadas sobre fondo uniforme y en condiciones controladas; el modelo aprende con facilidad ese sesgo de contexto y no generaliza a fotografías de campo.
- **Base de la medición real muy pequeña**: el conjunto de campo empleado tiene 25 imágenes, de modo que el 16 % equivale a 4 aciertos. La incertidumbre de esa estimación es enorme y no debe interpretarse como una tasa estable, ni en un sentido ni en otro.
- **Once clases sin datos de campo**: 11 de las 38 clases solo vieron imágenes de laboratorio durante el entrenamiento, por lo que su comportamiento en fotos reales es especialmente incierto.
- **Sin detección de fuera de distribución**: el modelo siempre devuelve una de las 38 clases con una probabilidad, aunque la imagen no sea una hoja o corresponda a un cultivo no cubierto. El umbral de 0,5 mitiga parcialmente el problema, pero no lo resuelve; el autor recomienda tratar valores por debajo de ese umbral como «no estoy seguro».
- **Restricciones de entrada**: una sola hoja, aproximadamente centrada y con luz diurna. No se ha evaluado con múltiples hojas por imagen, fondos complejos, iluminación artificial, desenfoque de movimiento ni imágenes de baja resolución.
- **No sustituye a un patólogoo**: la model card indica explícitamente que las decisiones de tratamiento deben confirmarse con un técnico de extensión agraria local.
- **Sesgos de cobertura del dataset**: 14 cultivos y una distribución geográfica de origen no documentada; cultivos relevantes en otras regiones (por ejemplo, cereales de secano mediterráneos) no están representados.
- **Métricas no verificadas**: los resultados del model-index figuran como `verified: false`; proceden del propio autor y no de una evaluación independiente.
- **Licencia**: los pesos son Apache-2.0, lo que permite uso comercial con atribución y sin garantías. Los datos de entrenamiento tienen condiciones propias: PlantVillage a través de Kaggle y Cropped-PlantDoc bajo CC BY 4.0, que exige atribución a Singh et al. (2020). Conviene revisar ambas antes de un despliegue comercial.
- **Inconsistencia de identificación**: la model card menciona el Hub id `neghani/plantvillage-mobilenetv2`, distinto del repositorio consultado (`LourivalGontijo/plantvillage-mobilenetv2`). Con 0 descargas y 0 likes, el modelo no tiene validación de la comunidad.
- **Documentación truncada**: la información disponible corta el informe por clase en `Tomato___healthy`; el detalle completo solo está en `reports/classification_report.txt` del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LourivalGontijo/plantvillage-mobilenetv2
- Modelo base: https://huggingface.co/google/mobilenet_v2_1.0_224
- Dataset PlantVillage (Kaggle): https://www.kaggle.com/datasets/abdallahalidev/plantvillage-dataset
- Cropped-PlantDoc (repositorio): https://github.com/pratikkayal/PlantDoc-Dataset
- Licencia CC BY 4.0 de PlantDoc: https://creativecommons.org/licenses/by/4.0/
- Informe por clase (en el repositorio): `reports/classification_report.txt`
- Matriz de confusión (en el repositorio): `reports/confusion_matrix.png`
- Manifiesto de datos y commit de PlantDoc (en el repositorio): `run_info.json`
- Búsqueda web: no se han encontrado enlaces técnicos relevantes sobre este modelo; los resultados devueltos por el buscador no guardan relación con el contenido de la ficha.
