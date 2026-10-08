# ksumara/cloud-classifier-resnet18

## Resumen

cloud-classifier-resnet18 es un modelo de clasificacion de imagenes publicado por el usuario ksumara en Hugging Face. Se trata de un ResNet-18 ajustado para una tarea de cuatro clases de nubes: Cumulus, Cirrus, Altocumulus y Stratocumulus. El problema que resuelve es acotado: asignar una de esas cuatro etiquetas a una imagen de cielo, no una clasificacion meteorologica general ni una estimacion de cobertura nubosa.

El modelo tiene 11.188.164 parametros y se distribuye en formato safetensors bajo la libreria transformers, con pipeline `image-classification`. Segun la model card, se entreno en Google Colab con aceleracion GPU durante 5 epocas, con seguimiento de experimentos en MLflow como parte de un proyecto de laboratorio de MLOps de extremo a extremo.

Su relevancia es principalmente practica y didactica: sirve como pieza de ejemplo para validar flujos de publicacion en Hugging Face Hub, despliegue en Spaces y monitorizacion con MLflow, mas que como componente de produccion. La evaluacion se hizo sobre un conjunto de test de 52 imagenes (13 por clase), con una exactitud del 76,92% y un F1 macro de 0,7685. No hay datos publicados sobre el origen del dataset, el preentrenamiento base ni la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (red neuronal convolucional con conexiones residuales) |
| Parametros totales | 11.188.164 |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de vision; la entrada es una imagen, no una secuencia de texto) |
| Tipos de cuantizacion | no disponible; el checkpoint se publica en safetensors sin cuantizacion documentada |
| Idiomas soportados | no disponible (no aplicable; la salida son etiquetas de clase, no texto) |
| Licencia | no disponible (la model card no especifica licencia) |
| Formato de pesos | safetensors |
| Numero de clases | 4 (Cumulus, Cirrus, Altocumulus, Stratocumulus) |
| Libreria | transformers |
| Pipeline declarado | image-classification |
| Tamano del repositorio | 0.0 GB (segun el Hub) |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion | 2026-10-08 |
| Ultima actualizacion | 2026-10-08 |
| Etiquetas del Hub | transformers, safetensors, resnet, image-classification, cloud-classification, mlops, endpoints_compatible, region:us |

## Arquitectura y entrenamiento

La arquitectura es un ResNet-18, es decir, una CNN con bloques residuales de dos capas convolucionales y conexiones de identidad, seguida de una capa totalmente conectada adaptada a 4 clases de salida. La model card no indica si el modelo partio de pesos preentrenados en ImageNet o si se entreno desde cero, ni detalla el preprocesado aplicado a las imagenes (resolucion de entrada, normalizacion o aumento de datos). Tampoco se especifica la tasa de aprendizaje, el optimizador ni el tamano de lote.

El entrenamiento se realizo en Google Colab con GPU durante 5 epocas y el seguimiento de metricas se hizo con MLflow, bajo el experimento `cloud_classifier_resnet18`. El autor no documenta el numero de tokens ni de imagenes de entrenamiento, ni la composicion del dataset, ni su procedencia o licencia; solo se indica que el conjunto de test contenia 52 imagenes, 13 por clase. No hay informacion sobre tecnicas de regularizacion, aumento de datos, ajuste fino por etapas ni decodificacion especulativa u otras optimizaciones de inferencia.

## Capacidades

- Clasificacion de imagenes de cielo en cuatro categorias cerradas: Cumulus, Cirrus, Altocumulus y Stratocumulus.
- Salida como logits sobre 4 clases, con `id2label` disponible en la configuracion del modelo para mapear el indice a la etiqueta.
- Integracion directa con `AutoImageProcessor` y `AutoModelForImageClassification` de transformers.
- Compatibilidad declarada con endpoints gestionados del Hub (etiqueta `endpoints_compatible`).
- Entrada de imagen RGB via PIL, procesada con el procesador asociado al repositorio.
- No dispone de generacion de texto, razonamiento, codigo ni matematicas.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multilingues en sentido estricto: solo emite etiquetas de clase en latin.
- No dispone de modo thinking, vision multimodal general, audio ni deteccion de objetos o segmentacion.

## Casos de uso

- Clasificacion automatica en estaciones meteorologicas con camara de cielo: el modelo puede etiquetar cada captura periodica como una de las cuatro categorias, alimentando series temporales de frecuencia de tipo nuboso. Es adecuado por su tamano reducido, que permite ejecucion continua en hardware modesto.
- Etiquetado asistido de datasets de fotografia meteorologica: se puede usar como preanotador para que un humano revise y corrija, reduciendo el coste de construir un corpus mayor de imagenes de nubes etiquetadas.
- Filtrado previo en repositorios de imagenes: clasificar y agrupar automaticamente fotos de cielo antes de aplicar sustitucion de cielo en edicion fotografica o en catalogos de stock.
- Aplicacion educativa: herramienta interactiva que muestre al usuario la categoria estimada de una nube y su probabilidad, con fines didacticos en meteorologia basica. La salida por clase (`id2label`) facilita mostrar la distribucion de probabilidad.
- Validacion de pipelines de MLOps: al estar entrenado con MLflow y publicado en el Hub con despliegue en Spaces y FastAPI, sirve como caso de prueba para verificar un flujo completo de entrenamiento, registro, publicacion e inferencia antes de llevarlo a modelos mas costosos.
- Prototipo de analitica de cobertura nubosa para energia solar o agricultura: como primera aproximacion en un sistema que estime nubosidad a partir de imagenes cenitales, siempre que se acepte una exactitud del 76,92% sobre una muestra muy pequena y se valide con datos propios.
- Ejemplo de referencia en formacion tecnica: sirve para demostrar la integracion de un modelo de vision con transformers, safetensors y despliegue en Spaces en cursos de MLOps.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card, sobre un conjunto de test de 52 imagenes (13 por clase):

| Metrica | Valor |
|---|---|
| Exactitud en test | 76,92% |
| F1 macro en test | 0,7685 |

Rendimiento por clase:

| Clase | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| Cumulus | 0,88 | 0,54 | 0,67 | 13 |
| Cirrus | 1,00 | 0,85 | 0,92 | 13 |
| Altocumulus | 0,63 | 0,92 | 0,75 | 13 |
| Stratocumulus | 0,71 | 0,77 | 0,74 | 13 |

No se han publicado en la informacion disponible resultados comparativos frente a otros modelos (por ejemplo, sobre un benchmark estandar de clasificacion de nubes), ni metricas de MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM para los pesos: aproximadamente 45 MB en fp32 (11,19 M de parametros x 4 bytes) y unos 22 MB en fp16, calculado a partir del numero de parametros; la precision real del checkpoint no esta documentada.
- VRAM total en inferencia: por debajo de 1 GB con lotes pequenos en fp32, incluyendo activaciones y buffers del procesador de imagen; es una estimacion a partir del tamano del modelo, no un dato medido.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria, incluidas GTX 1050 Ti, GTX 1650, RTX 3050 y superiores; no requiere A100 ni H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos anos, e incluso en iGPU con memoria compartida suficiente.
- Inferencia en CPU: viable para uso no intensivo, dado el reducido numero de parametros.
- Opciones de despliegue: transformers en Python, Hugging Face Spaces (flujo descrito por el autor), endpoints de inferencia del Hub, FastAPI como servicio propio, y exportacion a ONNX o TorchScript no documentada pero tecnicamente posible al ser una CNN estandar.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

No disponible. La model card no incluye comparaciones con otras arquitecturas ni con otros clasificadores de nubes, y en la informacion proporcionada no hay datos de rendimiento de alternativas como ResNet-50, EfficientNet, ViT o ConvNeXt aplicadas a esta misma tarea. Tampoco se documenta el dataset de entrenamiento, lo que impide establecer una comparacion justa con terceros: sin conocer la distribucion de las imagenes de entrenamiento, cualquier contraste de exactitud seria enganoso.

Como referencia cualitativa, el propio autor situa el modelo como experimental y no orientado a aplicaciones meteorologicas criticas, por lo que no compite con sistemas operativos de nowcasting.

## Limitaciones y advertencias

- El modelo reconoce unicamente cuatro categorias de nubes; cualquier imagen fuera de ese conjunto de clases se asignara forzosamente a una de las cuatro.
- La evaluacion se realizo sobre solo 52 imagenes de test, 13 por clase. Cualquier metrica derivada de esa muestra tiene un intervalo de confianza muy amplio y no es extrapolable.
- El rendimiento puede degradarse con imagenes de otras fuentes, camaras, resoluciones, condiciones de iluminacion o composiciones distintas de las usadas en entrenamiento. El autor lo advierte explicitamente.
- La clase Cumulus muestra un recall bajo (0,54) con precision alta (0,88), lo que indica que tiende a no detectar cumulos y a confundirlos con otras clases; Altocumulus presenta el patron inverso (precision 0,63, recall 0,92).
- No se documenta el origen ni la licencia del dataset de entrenamiento, lo que impide verificar la procedencia de los datos y las condiciones de reutilizacion.
- La licencia del propio modelo no esta especificada en la model card, por lo que no puede confirmarse que el uso comercial este permitido. Debe consultarse con el autor antes de cualquier despliegue productivo.
- No se documenta si se partio de pesos preentrenados ni con que datos, lo que limita la reproducibilidad del entrenamiento.
- Solo se entrenaron 5 epocas, un regimen corto que sugiere que el modelo no esta ajustado al maximo de su capacidad.
- Riesgo de alucinacion en sentido estricto no aplica, pero si existe riesgo de sobreconfianza: el modelo siempre devuelve una clase, sin mecanismo de rechazo ante imagenes ambiguas o fuera de dominio.
- El modelo es experimental y no debe usarse en aplicaciones meteorologicas criticas para la seguridad, tal como indica el autor.
- Con 0 descargas y 0 likes en el momento de la consulta, no hay evidencia de uso en la comunidad ni de validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ksumara/cloud-classifier-resnet18
- Perfil del autor: https://huggingface.co/ksumara
- No se han encontrado en la informacion disponible otros enlaces a papers, blogs, repositorios de codigo o demos asociados al modelo.
