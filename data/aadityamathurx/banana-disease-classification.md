# AadityaMathurX/Banana-Disease-Classification

## Resumen

Banana-Disease-Classification es un clasificador de imagenes de hojas de banano (banana/platano) desarrollado por el usuario de HuggingFace AadityaMathurX. El modelo recibe una imagen de una hoja y devuelve una de las categorias de enfermedad o de hoja sana, junto con una puntuacion de confianza, y se distribuye acompanado de una interfaz Gradio para su uso directo. Esta construido sobre una red convolucional DenseNet-121 implementada en Keras/TensorFlow, con un repositorio de 0,4 GB que incluye el conjunto de datos, el script de entrenamiento y los pesos preentrenados.

El problema que aborda es el diagnostico temprano de enfermedades del banano (Sigatoka negra, Sigatoka amarilla, virus del mosaico de la bractea, enfermedad Moko, enfermedad de Panama, plagas de insectos y hoja sana). Se trata de una herramienta de vision por computador orientada a un dominio agronomico concreto, no de un modelo de lenguaje: no genera texto, no procesa lenguaje natural y no tiene ventana de contexto. Su relevancia es acotada y practica, como apoyo a la inspeccion visual en campo mediante fotografia de hoja.

La ficha publica es escasa: el autor no declara licencia, no publica metricas de evaluacion, no especifica el numero exacto de parametros ni la composicion del dataset de entrenamiento, y la propia model card presenta una inconsistencia (anuncia 8 clases pero enumera 7). Con 13 descargas y 2 "likes" en el momento de la consulta, es un modelo de baja validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional DenseNet-121 (transfer learning) sobre Keras/TensorFlow |
| Parametros totales | no disponible (la configuracion estandar de DenseNet-121 ronda los 8 millones, mas la cabeza de clasificacion; el autor no publica la cifra exacta) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de clasificacion de imagenes, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la salida son etiquetas de clase, no texto en lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | Keras v3 (`.keras`), fichero `banana_disease_densenet121.keras` |
| Tarea | Clasificacion de imagenes (image-classification) |
| Numero de clases | La model card anuncia 8 clases pero solo enumera 7 (inconsistencia no resuelta) |
| Resolucion de entrada | no disponible (la configuracion estandar de DenseNet-121 usa 224x224 px) |
| Framework / libreria | Keras, TensorFlow |
| Interfaz incluida | Aplicacion Gradio (SDK 5.43.1), fichero `app.py` |
| Tamano del repositorio | 0,4 GB |
| Descargas / likes | 13 descargas, 2 likes (en el momento de la consulta) |

## Arquitectura y entrenamiento

La arquitectura es DenseNet-121, una red convolucional con conexiones densas en la que cada capa recibe como entrada las salidas de todas las capas anteriores. Este diseno favorece la reutilizacion de caracteristicas, reduce el numero de parametros frente a otras CNN de profundidad comparable y mitiga el problema del gradiente desvaneciente. El repositorio indica que el modelo es preentrenado y que se distribuye como fichero `.keras`, e incluye un script (`banana_disease.py`) para reentrenarlo. La model card no especifica si se partio de pesos de ImageNet, ni el numero de epocas, ni el regimen de congelacion de capas del backbone.

Sobre los datos de entrenamiento, la informacion disponible se limita a la existencia de un directorio `banana_dataset/` con imagenes organizadas en las clases de enfermedad. No se publican el numero de imagenes por clase, la resolucion original, el origen geografico del conjunto, las tecnicas de aumento de datos ni si hubo balanceo de clases. No hay indicios de RLHF, DPO ni ajuste por preferencias, algo por otra parte esperable en un clasificador de imagenes. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal u otras), ya que no aplican a este tipo de modelo.

## Capacidades

- Clasificacion de imagenes de hojas de banano en categorias de enfermedad y hoja sana, con puntuacion de confianza asociada.
- Deteccion de las siguientes categorias citadas por el autor: Sigatoka negra, virus del mosaico de la bractea, hoja sana, plaga de insectos, enfermedad Moko, enfermedad de Panama y Sigatoka amarilla.
- Inferencia sobre una unica imagen subida por el usuario a traves de la interfaz Gradio incluida.
- Ejecucion local del servicio web en `http://127.0.0.1:7860/` mediante `python app.py`.
- Reentrenamiento del modelo desde cero con el script `banana_disease.py` y el dataset incluido.
- No soporta tool calling, function calling ni uso como agente.
- No dispone de razonamiento multi-paso, modo "thinking", vision adicional, audio ni generacion de texto.
- No tiene capacidades multilingues: la salida son etiquetas de clase fijas.

## Casos de uso

- Preseleccion en campo mediante movil: un tecnico agricola fotografia una hoja y la aplicacion devuelve la clase de enfermedad con su confianza; al ser una DenseNet-121, la inferencia es ligera y puede empaquetarse para ejecucion en dispositivo o en un servidor modesto.
- Triaje en cooperativas bananeras: preclasificacion automatica de lotes de imagenes recogidas en campo para priorizar la revision manual de los casos con menor confianza.
- Monitorizacion de parcelas con drones: procesamiento por lotes de imagenes aereas o de alta resolucion para detectar focos de Sigatoka negra o amarilla antes de que se extiendan, siempre que se valide la robustez frente al cambio de dominio respecto al dataset original.
- Material didactico y formacion: herramienta de apoyo para ilustrar la diferencia visual entre enfermedades con sintomas similares (por ejemplo, las dos variantes de Sigatoka) en cursos de fitopatologia.
- Sistema de alerta temprana integrado en una plataforma agricola: el clasificador actua como componente de vision dentro de un pipeline mayor que registra la incidencia por parcela y genera avisos al agricultor.
- Prototipado rapido en investigacion agronomica: base de partida para fine-tuning sobre nuevas variedades de banano o sobre condiciones de iluminacion y fondo distintas, dado que el script de entrenamiento y el dataset se incluyen en el repositorio.
- Despliegue como microservicio de inferencia: envolver el fichero `.keras` en una API REST propia (o exportarlo a otro runtime) para consumo desde una aplicacion web o movil existente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye matriz de confusion, exactitud, F1, precision, recall ni ninguna otra metrica de evaluacion, ni sobre el conjunto de validacion ni sobre un conjunto de test independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Como referencia arquitectonica, una DenseNet-121 a 224x224 px y lote de tamano 1 ocupa bastante menos de 1 GB en FP32, por lo que cualquier GPU moderna es suficiente; se trata de una estimacion a partir de la arquitectura, no de un dato publicado por el autor.
- GPU recomendadas: no hay requisitos indicados. Cualquier GPU de consumo reciente (por ejemplo, serie RTX 30/40) es mas que suficiente; el modelo tambien puede ejecutarse en CPU para inferencias puntuales, dado el bajo coste computacional de DenseNet-121.
- Compatibilidad con GPU de consumo: si, previsiblemente en cualquier GPU con 4 GB o mas de VRAM, e incluso en CPU para uso no intensivo. No confirmado por el autor.
- Opciones de despliegue: la interfaz Gradio incluida (`app.py`), TensorFlow Serving, exportacion a ONNX Runtime o TensorFlow Lite para movil, y envoltura en una API propia (FastAPI, Flask) para produccion.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo de inferencia ni de imagenes por segundo.
- Almacenamiento: el repositorio completo ocupa 0,4 GB, incluyendo dataset y pesos.

## Comparativa con modelos similares

El autor no ofrece comparativas ni metricas propias, por lo que no es posible contrastar rendimiento. La tabla recoge alternativas arquitectonicas habituales para clasificacion de imagenes de 224x224 px, con datos arquitectonicos conocidos y rendimiento marcado como no disponible en todos los casos.

| Modelo | Parametros (aprox.) | Entrada | Tarea especifica | Licencia | Rendimiento publicado para esta tarea |
|---|---|---|---|---|---|
| Banana-Disease-Classification (DenseNet-121) | no disponible (DenseNet-121 estandar: ~8 M) | no disponible | Enfermedades del banano (7-8 clases) | no disponible | no disponible |
| DenseNet-121 generico (ImageNet) | ~8 M | 224x224 | Clasificacion general de 1000 clases | Variable segun implementacion | no aplica |
| ResNet-50 | ~25,6 M | 224x224 | Clasificacion general | Variable | no disponible |
| EfficientNet-B0 | ~5,3 M | 224x224 | Clasificacion general | Variable | no disponible |
| MobileNetV3-Large | ~5,4 M | 224x224 | Clasificacion general, orientado a movil | Variable | no disponible |

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifican los terminos de uso, lo que impide determinar si el uso comercial esta permitido. Cualquier despliegue en produccion requiere contactar previamente con el autor.
- Sin metricas publicadas: no hay evidencia cuantitativa de exactitud, precision o recall, ni validacion sobre un conjunto de test independiente. La fiabilidad real del clasificador es desconocida.
- Validacion externa muy baja: 13 descargas y 2 likes, sin citas ni evaluaciones de terceros.
- Inconsistencia en la documentacion: la model card anuncia 8 clases pero solo enumera 7, lo que genera incertidumbre sobre la salida real del modelo.
- Riesgo de cambio de dominio: no se documenta la composicion del dataset (origen geografico, condiciones de captura, variedades de banano, fondos). Es probable una caida de rendimiento con camaras, iluminacion o variedades distintas a las del entrenamiento.
- Posible desbalance de clases: al no publicarse el numero de imagenes por clase, no puede descartarse un sesgo hacia las clases mayoritarias.
- Confusion entre clases: las dos variantes de Sigatoka (negra y amarilla) y otras enfermedades con sintomas visuales solapados son candidatas naturales a error de clasificacion. No hay matriz de confusion que permita verificarlo.
- Alcance limitado: solo clasifica hojas de banano; no detecta enfermedades en fruto, tallo o raiz, ni ofrece tratamiento o recomendacion agronomica.
- Sin soporte de lenguaje natural ni multilingue: la salida son etiquetas de clase; cualquier traduccion o explicacion debe implementarse fuera del modelo.
- Sin garantias de mantenimiento: la fecha de actualizacion del repositorio figura como 2026-09-19, posterior a la de creacion (2025-08-22), dato que conviene verificar directamente en HuggingFace.
- Dependencia de Keras/TensorFlow: los pesos en formato `.keras` requieren ese ecosistema (o una conversion explicita) para su uso en otros runtimes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AadityaMathurX/Banana-Disease-Classification
- Pesos citados en la model card (ID alternativo del autor): https://huggingface.co/Aaditya456/Banana-Disease-Classification/blob/main/banana_disease_densenet121.keras
- Repositorio GitHub: la model card incluye un enlace con marcador de posicion no valido (`github.com/your-username/banana-disease-classificator`), por lo que no hay repositorio publico localizable.
- Demo: interfaz Gradio incluida en el repositorio (SDK 5.43.1), ejecutable en local en `http://127.0.0.1:7860/`. No se indica ningun Space publico.
- Paper o publicacion tecnica: no disponible.
- Los resultados de la busqueda web no contienen enlaces relevantes al modelo: unicamente devuelven resultados genericos sobre YouTube, sin relacion con este proyecto.
