# Kashif-Mahmood007/chestx6-ssl-checkpoints

## Resumen

ChestX6-SSL-Benchmark Checkpoints no es un modelo unico, sino un repositorio de puntos de control (checkpoints) en PyTorch que acompanan al manuscrito "A Deployment Risk Score Framework for Self-Supervised Chest X-Ray Classification: Calibrated Multi-Objective Evaluation Under Annotation Scarcity and Scanner Heterogeneity", firmado por Kashif Mahmood, Romana Aziz, Muhammad Ramzan, Mahwish Ilyas y Ala Saleh Alluhaidan. El repositorio reune encoders preentrenados con aprendizaje autosupervisado (SimCLR y MAE), sus versiones ajustadas finas (fine-tuned) para clasificacion de radiografias de torax y cuatro lineas base supervisadas: ResNet50 entrenada desde cero, ResNet50 inicializada con ImageNet, EfficientNet-B0 y MobileViT-XS.

El problema que aborda es la escasez de anotaciones en imagen medica y la heterogeneidad de escaneres entre centros. Para ello, todos los experimentos se repiten en regimenes de 10 %, 20 % y 100 % de datos etiquetados, con tres semillas aleatorias por configuracion, lo que permite medir no solo la exactitud sino tambien su estabilidad. El conjunto de datos de trabajo es ChestX6 (18.036 imagenes originales, 17.988 unicas tras eliminar 48 duplicados) y la evaluacion cruzada se realiza sobre ChestMNIST a traves del paquete MedMNIST.

Es relevante ahora porque publica los pesos, las particiones fijas y el pipeline completo de reproduccion bajo licencia MIT, algo poco habitual en trabajos de aprendizaje autosupervisado aplicado a radiologia, donde muchos articulos solo reportan cifras. El repositorio ocupa 6,9 GB, tiene licencia MIT, y a fecha de la consulta acumula 0 descargas y 0 "likes", por lo que todavia no cuenta con validacion externa de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multiples: ResNet50, EfficientNet-B0 y MobileViT-XS (lineas base supervisadas); encoders SimCLR (aprendizaje contrastivo) y MAE (autoencoder enmascarado) para preentrenamiento autosupervisado |
| Parametros totales | no disponible (varia por checkpoint; la model card no especifica el backbone del encoder MAE ni el del encoder SimCLR) |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica (modelo de vision; la entrada son imagenes, no secuencias de texto) |
| Tipos de cuantizacion | no disponible (solo se publican pesos PyTorch sin versiones cuantizadas) |
| Idiomas soportados | no aplica / no disponible (clasificacion de imagen, sin salida de texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch: `.pth` para los encoders preentrenados y `.pt` para los modelos ajustados finos |
| Tarea (pipeline) | `image-classification` |
| Dataset de entrenamiento | ChestX6 (17.988 imagenes unicas tras depuracion) |
| Dataset de evaluacion cruzada | ChestMNIST (paquete MedMNIST) |
| Regimenes de etiquetado | 10 %, 20 % y 100 % de datos anotados |
| Semillas por configuracion | 3 |
| Biblioteca | `pytorch` |
| Tamano del repositorio | 6,9 GB |
| Descargas / "likes" | 0 / 0 |

## Arquitectura y entrenamiento

El repositorio cubre dos familias de preentrenamiento autosupervisado sobre imagenes de torax. SimCLR aprende representaciones mediante aprendizaje contrastivo, acercando las vistas aumentadas de una misma imagen y alejando las de imagenes distintas. MAE (masked autoencoder) enmascara una fraccion de los parches de la imagen y obliga al modelo a reconstruirlos, lo que fuerza representaciones con informacion espacial y estructural. Ambos encoders se publican preentrenados y tambien ajustados finos para la tarea de clasificacion multiclase de ChestX6.

Como referencia se incluyen cuatro lineas base supervisadas: ResNet50 entrenada desde cero, ResNet50 inicializada con pesos de ImageNet, EfficientNet-B0 y MobileViT-XS. La comparacion entre preentrenamiento autosupervisado y supervisado se hace bajo tres regimenes de anotacion (10 %, 20 % y 100 %) con tres semillas por configuracion, lo que permite evaluar la varianza ademas de la media. El manuscrito propone un marco de "puntuacion de riesgo de despliegue" con evaluacion multiobjetivo calibrada; la model card no detalla el numero de epocas, el tamano de lote, la composicion exacta de los aumentos ni si se emplearon tecnicas de ajuste por preferencias, por lo que esos parametros quedan como no disponibles y deben consultarse en el repositorio de GitHub asociado.

## Capacidades

- Clasificacion de imagenes de radiografia de torax en el esquema multiclase del dataset ChestX6 (seis clases; la model card no enumera las etiquetas concretas).
- Extraccion de representaciones visuales mediante los encoders preentrenados SimCLR y MAE, reutilizables para otras tareas de imagen medica.
- Aprendizaje con pocas etiquetas: se publican modelos ajustados finos con tan solo el 10 % y el 20 % de los datos anotados.
- Transferencia entre dominios: los checkpoints estan pensados para medir degradacion frente a heterogeneidad de escaneres, con evaluacion cruzada sobre ChestMNIST.
- Comparacion controlada de metodos: las particiones fijas y las tres semillas permiten reproducir y contrastar resultados entre metodos SSL y supervisados.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no aplica.
- Capacidades especiales (modo "thinking", vision general, audio): no disponibles; el alcance es imagen medica de torax, no vision general.

## Casos de uso

- Investigacion en aprendizaje autosupervisado para imagen medica: los encoders SimCLR y MAE sirven como punto de partida reproducible para comparar estrategias de preentrenamiento sobre el mismo conjunto de datos y las mismas particiones fijas.
- Ajuste fino con presupuesto de etiquetado muy reducido: un servicio de radiologia que solo pueda anotar unas pocas miles de imagenes puede partir de los checkpoints ajustados con el 10 % y comparar su rendimiento con el de las lineas base supervisadas antes de comprometer mas anotacion.
- Evaluacion de robustez frente a cambio de escaner: el flujo de validacion cruzada sobre ChestMNIST permite estimar cuanto degrada el modelo al cambiar de equipo o de protocolo de adquisicion, informacion critica antes de un despliegue multicentro.
- Seleccion de arquitectura para entornos con recursos limitados: comparar MobileViT-XS y EfficientNet-B0 frente a ResNet50 permite decidir que compromiso entre coste computacional y exactitud es aceptable en un servidor modesto o en el borde.
- Extraccion de caracteristicas para busqueda y agrupacion de estudios: los encoders preentrenados pueden generar embeddings para recuperar radiografias similares o agrupar estudios por patron, sin necesidad de etiquetas.
- Reproducibilidad de resultados publicados: gracias a las particiones fijas, las tres semillas y el repositorio de GitHub, un grupo puede reejecutar los experimentos del manuscrito y verificar las cifras reportadas.
- Docencia y formacion en aprendizaje autosupervisado: el repositorio ilustra de forma completa el ciclo preentrenamiento, ajuste fino y evaluacion cruzada con codigo y pesos disponibles.
- Banco de pruebas para metricas de calibracion: el enfoque de "puntuacion de riesgo de despliegue" es util para quien investigue calibracion y evaluacion multiobjetivo en clasificacion medica desbalanceada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe los checkpoints, el dataset y la estructura del repositorio, pero no incluye tablas con exactitud, AUC, F1 ni ninguna otra metrica, ni para ChestX6 ni para la evaluacion cruzada con ChestMNIST. Tampoco se aportan comparaciones numericas con otros modelos. Cualquier cifra de rendimiento debe obtenerse ejecutando el pipeline del repositorio de GitHub asociado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Como referencia orientativa y no verificada, las lineas base incluidas (ResNet50, EfficientNet-B0, MobileViT-XS) son modelos ligeros que en precision FP32 suelen caber holgadamente en menos de 2 GB de VRAM a resoluciones de 224x224 con lotes pequenos; el encoder MAE es el mas pesado y depende del backbone, que no se especifica.
- GPU recomendadas: no indicadas por el autor. Por el tamano de las arquitecturas implicadas, una GPU de consumo con 8-12 GB (por ejemplo, RTX 3060, RTX 4060 Ti, RTX 4070) es suficiente para inferencia y para ajuste fino de las lineas base; para reproducir el preentrenamiento autosupervisado completo conviene una GPU de 24 GB o superior (RTX 3090, RTX 4090, A100, H100).
- Cabe en GPU de consumo: si, con alta probabilidad, para inferencia y ajuste fino de los modelos supervisados y de los encoders ajustados; el preentrenamiento SSL desde cero es la parte mas exigente y la model card no especifica el hardware empleado.
- Opciones de despliegue: los pesos son estados de PyTorch, por lo que se cargan directamente con `torch.load`. No se mencionan exportaciones a ONNX, TensorRT, GGUF, ni integraciones con vLLM, TGI, llama.cpp u Ollama, que ademas no aplican a un modelo de vision. El despliegue tipico seria un servicio propio con PyTorch o TorchScript.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de latencia ni de imagenes por segundo.
- Almacenamiento: el repositorio ocupa 6,9 GB, mayoritariamente por las tres semillas y los tres regimenes de etiquetado.

## Comparativa con modelos similares

La propia model card no ofrece comparaciones numericas, de modo que la tabla siguiente recoge unicamente caracteristicas arquitectonicas de referencia. Los recuentos de parametros son valores habituales de la literatura para esas arquitecturas y no estan confirmados por el autor en esta model card.

| Modelo | Tipo | Parametros (referencia de la literatura, no confirmados) | Preentrenamiento | Licencia |
|---|---|---|---|---|
| ResNet50 (Scratch) | CNN | ~25,6 M | Ninguno (desde cero) | MIT (en este repositorio) |
| ResNet50 (ImageNet) | CNN | ~25,6 M | ImageNet | MIT (en este repositorio) |
| EfficientNet-B0 | CNN con escalado compuesto | ~5,3 M | no disponible | MIT (en este repositorio) |
| MobileViT-XS | Hibrido CNN + transformer | ~2,3 M | no disponible | MIT (en este repositorio) |
| Encoder SimCLR | CNN o hibrido (no especificado) | no disponible | Contrastivo sobre ChestX6 | MIT |
| Encoder MAE | Transformer tipo ViT (backbone no especificado) | no disponible | Reconstruccion enmascarada sobre ChestX6 | MIT |

Alternativas externas de la misma categoria (por ejemplo, otros encoders autosupervisados para radiografia de torax como los derivados de CheXpert o MIMIC-CXR): no disponible en la informacion proporcionada, no se aportan comparaciones ni enlaces.

## Limitaciones y advertencias

- La model card no reporta ninguna metrica de rendimiento, por lo que no es posible evaluar la calidad de los checkpoints sin ejecutar el pipeline de reproduccion.
- El repositorio registra 0 descargas y 0 "likes" en HuggingFace: no existe validacion independiente por parte de la comunidad.
- No es un producto sanitario ni un dispositivo medico. No debe usarse para diagnostico clinico sin validacion prospectiva, revision regulatoria y supervision medica.
- El manuscrito asociado esta marcado como "under revision" (en revision) y sin publicar, de modo que las conclusiones cientificas no han pasado revision por pares.
- Riesgo de sesgo de dominio: los modelos se entrenan unicamente con ChestX6 y se evaluan en ChestMNIST; la procedencia de las imagenes, la distribucion demografica de los pacientes y las caracteristicas de los escaneres no se detallan en la model card.
- La model card no enumera las seis clases del dataset ni su prevalencia, lo que impide valorar desbalance de clases o el coste relativo de los errores.
- Los modelos ajustados con el 10 % y el 20 % de los datos anotados tienen un riesgo elevado de sobreajuste y de varianza alta entre semillas; ese es precisamente uno de los objetos de estudio del trabajo.
- No se publican versiones cuantizadas, ni exportaciones ONNX o TensorRT, ni scripts de despliegue; la integracion en produccion requiere trabajo adicional.
- No hay informacion sobre calibracion de probabilidades en los propios checkpoints, pese a que el manuscrito se centra en evaluacion calibrada.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con aviso de copyright, pero la licencia del modelo no cubre los derechos sobre los datos de origen. Debe verificarse la licencia del dataset ChestX6 en Kaggle antes de cualquier uso mas alla de la investigacion.
- El repositorio pesa 6,9 GB y las fechas de los metadatos (creacion en agosto de 2026, actualizacion en octubre de 2026) son posteriores a la consulta habitual de referencias, lo que conviene tener en cuenta al citar.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Kashif-Mahmood007/chestx6-ssl-checkpoints
- Repositorio de GitHub con el pipeline completo: https://github.com/Kashif-Mahmood007/chestx6-ssl-benchmark
- Dataset ChestX6 en Kaggle: https://www.kaggle.com/datasets/mohamedasak/chest-x-ray-6-classes-dataset
- Identificador DOI asociado al repositorio: https://doi.org/10.57967/hf/10799
- ChestMNIST a traves del paquete MedMNIST: referenciado en la model card, sin URL directa proporcionada por el autor
- Manuscrito asociado: "A Deployment Risk Score Framework for Self-Supervised Chest X-Ray Classification: Calibrated Multi-Objective Evaluation Under Annotation Scarcity and Scanner Heterogeneity", Mahmood, Aziz, Ramzan, Ilyas y Alluhaidan, en revision (2026); sin enlace publico disponible en la informacion proporcionada
