# Salaam21/csc6302-prac5-SINYANI

## Resumen

Salaam21/csc6302-prac5-SINYANI es un repositorio de Hugging Face que no contiene un modelo entrenado con pesos publicados, sino el codigo fuente de una aplicacion Gradio de segmentacion de imagenes denominada "Segmentation Studio". El autor es Munyeme Sinyani (numero de estudiante 2025024319, University of Zambia) y el repositorio forma parte de la practica 5 de la asignatura CSC 6302. La etiqueta de pipeline es image-segmentation y la libreria declarada es PyTorch.

La aplicacion integra cuatro tecnicas de segmentacion: umbralizado de Otsu, umbralizado adaptativo, watershed (cuencas hidrograficas) y un modelo DeepLabV3. Los ficheros listados en la model card son `app.py` (la aplicacion) y `requirements.txt` (dependencias para Space o ejecucion local). No se publican pesos, checkpoints, configuracion de entrenamiento ni resultados de evaluacion.

Su relevancia es exclusivamente docente: sirve como ejemplo reproducible de una interfaz Gradio que compara metodos clasicos de segmentacion con un modelo de segmentacion semantica profunda. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la propia model card advierte de que el Space asociado puede requerir Hugging Face PRO (HTTP 402), en cuyo caso el repositorio de modelo actua solo como alojamiento del codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se publica arquitectura propia; la app integra umbralizado de Otsu, umbralizado adaptativo, watershed y DeepLabV3) |
| Parametros totales | no disponible (no se distribuyen pesos) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a segmentacion de imagenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la interfaz y la model card estan en ingles) |
| Licencia | MIT |
| Formato de pesos | no se distribuyen pesos; el repositorio contiene codigo fuente (`app.py`, `requirements.txt`) |
| Tarea declarada (pipeline) | image-segmentation |
| Libreria | pytorch |
| Tags | pytorch, image-segmentation, computer-vision, csc6302, gradio, license:mit, region:us |
| Autor | Salaam21 (Munyeme Sinyani, University of Zambia) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-17T00:58:26.000Z |
| Fecha de actualizacion | 2026-09-17T00:58:30.000Z |

## Arquitectura y entrenamiento

No hay informacion sobre arquitectura propia ni sobre entrenamiento. El repositorio no publica pesos, no declara un dataset y no describe ninguna fase de preentrenamiento, ajuste fino, RLHF o DPO. Lo unico documentado es que la aplicacion ofrece cuatro modos de segmentacion: tres clasicos (Otsu, umbral adaptativo y watershed) y uno basado en aprendizaje profundo (DeepLabV3). No se especifica la variante concreta de DeepLabV3, el backbone utilizado, la resolucion de entrada, el numero de clases ni si los pesos del modelo profundo se cargan desde una fuente externa o se entrenaron en el marco de la practica.

La innovacion tecnica, en este caso, es de caracter pedagogico: reunir en una unica interfaz Gradio metodos deterministas de procesamiento de imagen y un modelo de segmentacion semantica, presumiblemente para comparar resultados entre ambos enfoques. Al no existir artefactos de modelo, no es posible reproducir ni auditar ningun proceso de entrenamiento a partir de este repositorio.

## Capacidades

- Segmentacion por umbralizado global (Otsu) sobre imagenes cargadas por el usuario.
- Segmentacion por umbralizado adaptativo, apta para imagenes con iluminacion no uniforme.
- Segmentacion por watershed, orientada a separar objetos en contacto.
- Segmentacion semantica mediante DeepLabV3.
- Interfaz web interactiva construida con Gradio, ejecutable localmente o desplegable como Space.
- Ejecucion local mediante `pip install -r requirements.txt` y `python app.py`.
- No hay soporte de tool calling ni de function calling.
- No hay soporte de agentes ni de razonamiento multi-paso.
- No hay capacidades multilingues, de generacion de texto, de codigo, de matematicas, de vision generativa, de audio ni de modo "thinking".
- No se documentan pesos, checkpoints ni API de inferencia programatica mas alla del propio codigo de la app.

## Casos de uso

- Docencia de vision por computador: la aplicacion permite al alumnado comparar en una misma pantalla un umbralizado clasico y una red de segmentacion semantica sobre la misma imagen, lo que ilustra de forma directa las diferencias entre metodos deterministas y aprendidos.
- Practicas de laboratorio evaluables: al estar publicado bajo licencia MIT y con instrucciones de ejecucion local, cualquier docente puede clonar el repositorio, adaptar los parametros de Otsu, adaptativo o watershed y usarlo como enunciado de una practica.
- Prototipado rapido de preprocesado en vision industrial: el umbralizado de Otsu y el adaptativo son utiles para generar mascaras binarias iniciales en tareas de control de calidad (deteccion de defectos sobre fondo uniforme) antes de pasar a un modelo supervisado.
- Separacion de objetos en microscopia o imagen celular: el algoritmo de watershed esta pensado para escenarios con objetos que se tocan o solapan, donde un umbralizado simple fusionaria regiones.
- Baseline de segmentacion semantica: DeepLabV3 permite obtener una referencia rapida sobre imagenes de escena antes de invertir en anotacion y entrenamiento de un modelo especifico del dominio.
- Demostracion reproducible en un Space de Hugging Face: si el Space esta disponible, sirve como enlace publico para compartir una demo de segmentacion sin coste de infraestructura propio; si requiere PRO, el repositorio conserva el codigo para despliegue en servidor propio.
- Material de comparacion metodologica en un informe tecnico: los distintos modos de la app permiten documentar diferencias cualitativas (sensibilidad al ruido, dependencia de la iluminacion, coste computacional) entre metodos clasicos y DeepLabV3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay valores de mIoU, IoU por clase, exactitud en pixeles ni tiempos de inferencia. Tampoco se publican comparaciones con otros modelos de segmentacion.

## Requisitos de hardware

- El repositorio no declara requisitos de hardware ni versiones minimas de GPU.
- Los modos de Otsu, umbral adaptativo y watershed se ejecutan tipicamente en CPU en tiempos del orden de decimas de segundo a pocos segundos por imagen, dependiendo de la resolucion y del entorno de OpenCV subyacente; se trata de una estimacion general del tipo de algoritmo, no de un dato aportado por el autor.
- El modo DeepLabV3 se beneficia de GPU. Para una red de segmentacion semantica de esta familia, una GPU consumer con 4-8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060 o superiores) suele ser suficiente en inferencia a resoluciones habituales; esta cifra es una referencia orientativa, no un dato verificado del repositorio.
- En CPU, DeepLabV3 puede ejecutarse, pero con latencias notablemente mayores; no hay mediciones publicadas.
- Opciones de despliegue: ejecucion local con Python y Gradio, contenedor propio a partir de `requirements.txt`, o despliegue como Hugging Face Space (la model card indica que puede devolver HTTP 402 si se exige PRO). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de aplicacion.
- No se publican datos de throughput ni de latencia medidos.

## Comparativa con modelos similares

Este repositorio no es un modelo de segmentacion con pesos publicados, sino una aplicacion que envuelve metodos clasicos y DeepLabV3, por lo que la comparacion con modelos de segmentacion no es homogenea. Los datos de parametros de las alternativas no estan disponibles en la informacion proporcionada; las licencias indicadas son referencias externas de conocimiento general y no proceden del repositorio analizado.

| Proyecto | Tipo | Pesos publicados | Licencia (referencia externa) | Disponibilidad |
|---|---|---|---|---|
| Salaam21/csc6302-prac5-SINYANI | Aplicacion Gradio con Otsu, adaptativo, watershed y DeepLabV3 | No | MIT | Repositorio de codigo; Space condicionado a Hugging Face PRO |
| Segment Anything (SAM), Meta AI | Modelo de segmentacion promptable | Si | Apache-2.0 | Pesos y codigo publicos |
| YOLOv8-seg, Ultralytics | Modelo de segmentacion de instancias | Si | AGPL-3.0 | Pesos y codigo publicos |
| DeepLabV3 en torchvision | Modelo de segmentacion semantica con pesos preentrenados | Si | BSD-3-Clause | Disponible como dependencia de libreria |

No se dispone de datos de rendimiento del repositorio analizado que permitan una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- No se publican pesos ni checkpoints: el repositorio no permite reproducir resultados de segmentacion de forma determinista, ya que no se especifica que pesos usa el modo DeepLabV3.
- Ausencia total de evaluacion: no hay metricas, ni conjunto de validacion, ni comparacion documentada entre los cuatro metodos.
- Validacion nula por la comunidad: 0 descargas y 0 likes, sin issues ni discusiones registradas.
- La model card presenta artefactos de formato en la lista de ficheros ("pp.py" y "equirements.txt"), compatibles con un problema de renderizado del fichero original; conviene verificar la estructura real del repositorio antes de ejecutarlo.
- El espacio de nombres y el nombre del repositorio corresponden a una practica academica, no a un producto mantenido; no hay garantia de actualizaciones ni de soporte.
- La licencia MIT permite uso comercial y modificacion con atribucion, pero el autor no ofrece ninguna garantia sobre el funcionamiento del codigo.
- El pipeline declarado es image-segmentation, lo que puede llevar a confundir este repositorio con un modelo descargable en busquedas automatizadas.
- Si la aplicacion carga pesos preentrenados de torchvision u otra fuente, se aplicarian tambien las condiciones de licencia de esos pesos, distintas de la licencia MIT del repositorio.
- No se documentan sesgos, porque no hay modelo entrenado propio ni dataset descrito; en el caso de DeepLabV3, los sesgos serian los heredados de los datos de preentrenamiento utilizados, no analizados aqui.
- Riesgo de alucinacion no aplica (no es un modelo generativo de texto), pero si existe riesgo de falsos positivos de segmentacion en imagenes fuera del dominio esperado.
- No hay soporte declarado de idiomas ni de interfaces multilingues.
- El despliegue como Space puede requerir plan de pago de Hugging Face, segun advierte el propio autor.
- No se ha realizado auditoria de seguridad sobre el codigo de la aplicacion; ejecutarlo expone los riesgos habituales de una app Gradio sin revisar.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/Salaam21/csc6302-prac5-SINYANI
- URL sugerida del Space por el autor (puede requerir Hugging Face PRO): https://huggingface.co/spaces/Salaam21/csc6302-prac5-SINYANI
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la busqueda web realizada. Los cuatro resultados devueltos por la busqueda (hilos de foro sobre ProtonMail y perfiles de Zhihu) no guardan ninguna relacion con este repositorio ni con segmentacion de imagenes, por lo que no se incluyen como referencias utiles.
