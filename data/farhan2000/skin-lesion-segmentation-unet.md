# Farhan2000/skin-lesion-segmentation-unet

## Resumen

El modelo `Farhan2000/skin-lesion-segmentation-unet` es una red U-Net con encoder ResNet34 entrenada para segmentación binaria de lesiones cutáneas en imágenes dermatoscópicas. Lo publica el usuario Farhan2000 en HuggingFace como proyecto educativo, y su único artefacto de pesos es un `model.pth` de PyTorch compatible con la librería `segmentation_models_pytorch` (SMP). El objetivo concreto es generar máscaras de frontera de lesión a partir de imágenes RGB, una tarea clásica dentro del pipeline de análisis automático de cáncer de piel.

El entrenamiento se realizó sobre el dataset ISIC 2017 Task 1 (máscaras de frontera de lesión), distribuido en HuggingFace como `MedOtter/ISIC2017`. El autor reporta una Dice media de validación de 0,8520, que es el único dato cuantitativo de rendimiento publicado. No se especifican hiperparámetros de entrenamiento, resolución de entrada, aumentos de datos, número de épocas ni partición exacta del conjunto.

Es relevante ahora porque sirve como punto de partida reproducible y ligero (el repositorio ocupa 0,1 GB) para tareas de segmentación dermatológica en investigación: es fácil de cargar, de reentrenar por *fine-tuning* y de integrar en pipelines de anotación asistida. El propio autor advierte explícitamente que es un proyecto educativo, que no tiene grado diagnóstico y que no es un producto sanitario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net con encoder ResNet34 (preentrenado desactivado, `encoder_weights=None`), skip connections, 3 canales de entrada, 1 canal de salida |
| Parametros totales | no disponible (el encoder ResNet34 aporta del orden de 21 millones de parametros en su variante de clasificacion; el total exacto del conjunto encoder-decoder no lo publica el autor) |
| Longitud de contexto | no aplica: modelo de vision, no de lenguaje. La resolucion de entrada no la especifica el autor ("no disponible") |
| Tipos de cuantizacion | no disponible (se distribuye un unico `model.pth` en punto flotante de PyTorch; no hay variantes cuantizadas ni GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible / no aplica (modelo de vision, sin componente de texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch `state_dict` en `model.pth` (cargable con `torch.load` y `load_state_dict`) |
| Tamano del repositorio | 0,1 GB |
| Pipeline declarado en HuggingFace | no disponible |
| Dataset de entrenamiento | ISIC 2017 Task 1 (mascaras de frontera de lesion), via `MedOtter/ISIC2017` |
| Fecha de publicacion | 18 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es una U-Net clasica implementada con `segmentation_models_pytorch`: un encoder convolucional ResNet34 que reduce progresivamente la resolucion y extrae caracteristicas, un cuello de botella y un decodificador con conexiones de salto que recupera la resolucion espacial para producir una mascara densa. La salida tiene un solo canal, adecuada para segmentacion binaria lesion/fondo (probabilidad por pixel o logits, segun se aplique o no una sigmoide en inferencia). El encoder se instancia sin pesos preentrenados (`encoder_weights=None`), de modo que el entrenamiento parte de inicializacion aleatoria y aprende todas las caracteristicas a partir del dataset ISIC.

El autor no documenta el numero de tokens ni de imagenes de entrenamiento, la composicion exacta del split, la funcion de perdida, el optimizador, la tasa de aprendizaje, el numero de epocas ni las tecnicas de regularizacion o aumento de datos empleadas. Tampoco indica si hubo ajuste fino adicional, destilacion o *ensembling*. La unica metrica publicada es la Dice media de validacion (0,8520), sin intervalo de confianza, sin evaluacion sobre el conjunto de test oficial de ISIC 2017 y sin desglose por subgrupos. No se menciona ninguna innovacion tecnica mas alla del uso estandar de U-Net con encoder ResNet34.

## Capacidades

- Segmentacion binaria de lesiones cutaneas en imagenes dermatoscopicas RGB: produce una mascara por pixel de la frontera de la lesion.
- Extraccion de la region de interes para alimentar etapas posteriores de un pipeline (por ejemplo, clasificacion benigno/maligno o calculo de caracteristicas morfologicas).
- Inferencia en CPU y GPU mediante PyTorch, con carga reproducible a traves de `hf_hub_download` y `segmentation_models_pytorch`.
- Reutilizacion como backbone preentrenado para *fine-tuning* en otros conjuntos de segmentacion medica, dado que es una U-Net estandar de SMP.
- No soporta *tool calling*, ni function calling, ni agentes, ni razonamiento multi-paso: no es un modelo de lenguaje.
- No tiene modo *thinking*, ni capacidades de vision-lenguaje, audio o generacion de texto.
- Capacidades multilingues: no aplica.

## Casos de uso

- Anotacion asistida de datasets dermatologicos: el modelo genera una mascara inicial que un dermatologo o anotador revisa y corrige, reduciendo el tiempo de etiquetado manual en conjuntos con miles de imagenes.
- Preprocesado en pipelines de investigacion sobre ISIC: recortar la lesion antes de pasarla a un clasificador evita que la red de clasificacion aprenda del fondo (regla, marcas, vello) en lugar de la lesion.
- Extraccion de caracteristicas morfologicas para estudios tipo ABCD: a partir de la mascara se pueden calcular area, perimetro, asimetria y compacidad de forma automatica y reproducible.
- Control de calidad de mascaras existentes: comparar la prediccion con una mascara de referencia para detectar anotaciones ruidosas o inconsistentes en un dataset ya etiquetado.
- *Fine-tuning* como punto de partida en otras modalidades de imagen medica (ecografia, histopatologia, fondo de ojo): al ser una U-Net SMP con encoder ResNet34, cambiar el numero de canales de entrada y reentrenar es directo.
- Prototipos y docencia: el repositorio pesa 0,1 GB, se carga en pocas lineas y permite demostrar un pipeline completo de segmentacion en un portatil sin GPU.
- *Baseline* interno de comparacion: sirve como referencia low-cost para medir si arquitecturas mas pesadas (por ejemplo, variantes con encoder EfficientNet o Transformer) justifican su coste adicional en un conjunto concreto.

## Benchmarks y rendimiento

El unico dato publicado por el autor es la Dice media de validacion. No hay resultados sobre el test oficial de ISIC 2017 ni comparaciones con otros modelos en la informacion disponible.

| Metrica | Conjunto | Valor |
|---|---|---|
| Dice medio (validacion) | Particion de validacion definida por el autor sobre ISIC 2017 | 0,8520 |
| Dice (test) | No publicado | no disponible |
| IoU / Jaccard | No publicado | no disponible |
| Accuracy por pixel | No publicado | no disponible |
| Sensibilidad / especificidad | No publicadas | no disponible |

No se han publicado resultados de benchmarks comparativos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con pesos en FP32 y un modelo de aproximadamente 0,1 GB, la inferencia en lote 1 cabe holgadamente en menos de 1 GB de VRAM a resoluciones tipicas de 256x256; con lotes mayores o resoluciones de 512x512 o superiores el consumo crece de forma aproximadamente cuadratica con el area de la imagen (estimacion, no medida por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque para este tamano de modelo las GPU de gama alta quedan muy infrautilizadas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada moderna e incluso en iGPU con memoria compartida suficiente. La inferencia en CPU es viable para uso puntual, con latencias mayores.
- Opciones de despliegue: PyTorch nativo con `segmentation_models_pytorch`, exportacion a TorchScript u ONNX Runtime, y servidores de inferencia genericos compatibles con ONNX (Triton, BentoML, TorchServe). vLLM, llama.cpp, Ollama y TGI no aplican: son herramientas para modelos de lenguaje.
- Latencia y throughput: no disponibles. El autor no publica mediciones de tiempo de inferencia ni de imagenes por segundo.

## Comparativa con modelos similares

La busqueda web realizada no devolvio informacion relevante sobre este modelo ni sobre alternativas comparables: los resultados correspondian a paginas de un operador de telecomunicaciones, sin relacion con segmentacion medica. Por tanto, no hay datos de rendimiento comparables en la informacion disponible.

| Modelo | Arquitectura | Entrada | Licencia | Rendimiento publicado |
|---|---|---|---|---|
| `Farhan2000/skin-lesion-segmentation-unet` | U-Net + encoder ResNet34 | Imagen RGB, resolucion no especificada | MIT | Dice de validacion 0,8520 |
| U-Net original (Ronneberger et al., 2015) | U-Net desde cero | Imagen, resolucion configurable | no disponible en esta informacion | no disponible |
| nnU-Net (auto-configuracion) | Framework de segmentacion medica autoajustado | Imagen 3D/2D | no disponible en esta informacion | no disponible |

Cualquier comparacion cuantitativa con estos u otros modelos requeriria evaluar todos ellos sobre el mismo split de ISIC 2017, cosa que no se ha hecho en la informacion disponible.

## Limitaciones y advertencias

- No es un producto sanitario y no tiene grado diagnostico. El propio autor lo declara como proyecto educativo; no debe usarse para decidir sobre pacientes ni como apoyo clinico sin validacion regulatoria y estudio prospectivo.
- La unica metrica reportada es una Dice de validacion sobre la particion elegida por el autor. No hay evaluacion sobre el test oficial de ISIC 2017, lo que impide comparar de forma justa con la literatura.
- Entrenado exclusivamente con imagenes dermatoscopicas de ISIC 2017. Es previsible una degradacion fuerte ante cambios de dominio: otras camaras, iluminacion, resolucion, imagen clinica no dermatoscopica o fotografias de movil.
- Los conjuntos dermatoscopicos publicos estan sesgados hacia fototipos de piel claros y hacia ciertas localizaciones anatomicas; es una advertencia general de la literatura sobre ISIC que el autor no cuantifica ni corrige de forma documentada en este modelo.
- Riesgo de mascaras erroneas o incompletas en lesiones de bajo contraste, bordes difusos, presencia de vello, reglas de medicion, burbujas de aire o artefactos de compression. No hay analisis de errores publicado.
- Alucinacion en sentido estricto no aplica (no genera texto), pero si existe el riesgo de producir una region segmentada plausible y erronea, especialmente en imagenes fuera de distribucion.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero la licencia no cubre requisitos regulatorios de producto sanitario ni la proteccion de datos de pacientes.
- No se documentan sesgos por subgrupo (edad, sexo, tono de piel, tipo de lesion), ni calibracion, ni umbral de decision optimo por pixel.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario, validacion independiente ni mantenimiento posterior a la publicacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Farhan2000/skin-lesion-segmentation-unet
- Dataset utilizado (ISIC 2017 Task 1): https://huggingface.co/datasets/MedOtter/ISIC2017
- Libreria `segmentation_models_pytorch`: https://github.com/qubvel/segmentation_models.pytorch
- ISIC Archive (datos originales del reto ISIC): https://challenge.isic-archive.com/data/
- Paper original de U-Net (Ronneberger et al., 2015): https://arxiv.org/abs/1505.04597
- Paper de ResNet (He et al., 2015): https://arxiv.org/abs/1512.03385

Nota: la busqueda web realizada no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos correspondian a paginas de un operador de telefonia sin relacion con el contenido de la ficha.
