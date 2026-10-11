# FisayoF/DeployedSpectrogram

## Resumen

DeployedSpectrogram es un clasificador de audio publicado por el usuario FisayoF bajo el identificador FisayoF/DeployedSpectrogram. No es un modelo de lenguaje: es una red neuronal convolucional pequena, escrita y entrenada desde cero en PyTorch, que toma imagenes de espectrograma en escala de grises (480 x 640 pixeles, valores normalizados a 0-1) y las asigna a una de tres clases: background (indice 0), helicopter (indice 1) y drone (indice 2). La salida son log-probabilidades (log_softmax), por lo que hay que aplicar exp para obtener probabilidades.

El modelo procede de trabajo realizado en hackathones del Ministry of Defence en Sandhurst y fue desplegado de forma independiente en 2026. Su interes practico no esta en el rendimiento bruto, sino en que constituye una linea base reproducible y muy ligera para deteccion acustica de drones y helicopteros, con la arquitectura y el codigo de inferencia incluidos en el propio repositorio (model.py con la clase CnnNet y predict.py).

El repositorio ocupa 0,1 GB y los pesos se distribuyen como state_dict de PyTorch en el fichero weightsfilefromspectrogram.pth. Con 0 descargas y 0 likes en el momento de la consulta, se trata de un modelo sin adopcion publica documentada. La licencia MIT permite uso comercial, pero el propio autor advierte que es una linea base de demostracion y no debe usarse en aplicaciones criticas de seguridad. El entrenamiento se hizo con solo 297 espectrogramas y el split es aleatorio a nivel de imagen, lo que limita la precision de las cifras reportadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN propia (clase `CnnNet`): dos capas convolucionales 3x3 (64 y 128 filtros) con ReLU y max pooling 2x2 tras cada una, y una capa lineal final a 3 clases |
| Parametros totales | No disponible en la model card; estimacion derivada de la arquitectura descrita: en torno a 7,45 millones (la mayor parte concentrada en la capa lineal sobre el mapa de 128 x 120 x 160) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: no procesa secuencias de texto. La entrada es fija, una imagen de espectrograma de 480 x 640 pixeles, un solo canal |
| Tipos de cuantizacion | No disponible; los pesos se publican como `state_dict` en punto flotante de PyTorch y no se documenta ninguna variante cuantizada |
| Idiomas soportados | No aplica (clasificacion de audio, sin componente de texto ni multilingue) |
| Licencia | MIT |
| Formato de pesos | PyTorch `state_dict` (`.pth`, fichero `weightsfilefromspectrogram.pth`) |
| Salida | Log-probabilidades sobre 3 clases (`log_softmax`); aplicar `exp` para obtener probabilidades |
| Entrada | Espectrograma en escala de grises, 480 x 640, valores de pixel escalados a 0-1 |
| Clases (orden de indice) | 0 = background, 1 = helicopter, 2 = drone |
| Tamano del repositorio | 0,1 GB |
| Libreria | PyTorch (con Pillow y NumPy para la inferencia de ejemplo) |
| Fecha de creacion / actualizacion | 2026-08-20 / 2026-10-10 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es una CNN secuencial deliberadamente minima: una primera convolucion de 3x3 con 64 filtros sobre la imagen de entrada de un canal, ReLU y max pooling 2x2 (que reduce la resolucion a 240 x 320); una segunda convolucion de 3x3 con 128 filtros, ReLU y max pooling 2x2 (que deja 120 x 160); y finalmente una capa lineal hasta las 3 clases de salida. No hay normalizacion por lotes, dropout ni conexiones residuales, y el modelo no emplea ningun mecanismo de atencion ni arquitectura hibrida. La salida se pasa por `log_softmax`, coherente con la funcion de perdida empleada.

Los datos de entrenamiento son 297 imagenes de espectrograma: 101 de background, 99 de helicoptero y 97 de dron. Proceden de un conjunto publicado por la comunidad del London Defence Hackathon en GitHub; no se detalla en la model card ni el numero de grabaciones originales ni la duracion total de audio, ni la configuracion exacta de la transformada (ventana, tamano de FFT, solapamiento) usada para generar los espectrogramas. El reparto train/validacion/test es 60/20/20 aleatorio con `random_state=42`, lo que da aproximadamente 178, 59 y 60 imagenes por split.

El entrenamiento se ejecuto en Google Colab con PyTorch, perdida de log-verosimilitud negativa, optimizador SGD con tasa de aprendizaje 0,001 y momentum 0,5, tamano de lote 4 y 115 epocas, conservando el checkpoint con mejor exactitud de validacion. No se aplico aumento de datos ni regularizacion. El propio autor senala que la perdida de entrenamiento es muy baja mientras que la exactitud de validacion es inferior, lo que apunta a sobreajuste.

## Capacidades

- Clasificacion de imagenes de espectrograma de audio en tres categorias mutuamente excluyentes: background, helicopter y drone.
- Salida probabilistica: al ser `log_softmax`, permite obtener probabilidades por clase con `exp` y fijar umbrales de decision personalizados.
- Inferencia sobre imagenes de entrada de tamanio fijo (480 x 640, un canal, rango 0-1); no acepta espectrogramas de otras dimensiones sin redimensionado previo.
- Ejecucion en CPU: al ser una red de dos capas convolucionales, no requiere GPU para inferencia.
- Distribucion como codigo abierto: la arquitectura (`model.py`) y un ejemplo minimo de inferencia (`predict.py`) acompanan a los pesos, lo que permite reentrenar o modificar la red.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso; es un clasificador de una sola pasada.
- No tiene capacidades multilingues ni de generacion de texto.
- No incorpora modo de razonamiento (thinking mode), vision general, audio directo (trabaja sobre espectrogramas precalculados, no sobre waveform) ni entrada multimodal.

## Casos de uso

- Vigilancia perimetral y deteccion de intrusion aerea: un nodo con microfono captura audio de forma continua, calcula espectrogramas por ventanas de tiempo y los pasa al modelo para disparar alertas cuando la clase predicha es drone o helicopter. La ventaja es la ligereza de la red, que permite ejecutarla en el propio nodo.
- Monitorizacion acustica de bajo coste en entornos rurales o industriales: al no necesitar GPU, puede desplegarse en dispositivos tipo Raspberry Pi que envian a un servidor solo los eventos clasificados como relevantes, reduciendo el ancho de banda y el almacenamiento.
- Etiquetado asistido de archivos de audio largos: procesado por ventanas deslizantes para preanotar automaticamente segmentos de interes en grabaciones de horas, que luego un humano revisa. Util como paso previo a la construccion de conjuntos de datos mayores.
- Filtrado previo en pipelines de analitica acustica: descartar los segmentos clasificados como background antes de aplicar modelos mas costosos (por ejemplo, clasificadores de eventos acusticos de mayor tamano), actuando como etapa de triaje.
- Docencia y prototipado en aprendizaje automatico aplicado a audio: sirve como ejemplo completo y reproducible de un flujo espectrograma-CNN-entrenamiento-evaluacion, con el codigo de arquitectura e inferencia incluido.
- Linea base de comparacion en investigacion: cualquier propuesta nueva de deteccion de drones acustica puede contrastarse contra estas cifras para justificar la mejora, aunque el autor advierte que el split aleatorio a nivel de imagen puede inflar los resultados.
- Demostracion tecnica en entornos de defensa y seguridad (hackathones, pruebas de concepto), dado el origen del modelo en hackathones del Ministry of Defence en Sandhurst, siempre fuera de uso critico.

## Benchmarks y rendimiento

La model card publica resultados sobre 60 espectrogramas de test reservados. No se proporcionan resultados comparativos con otros modelos en la informacion disponible.

| Metrica | Valor |
|---|---|
| Exactitud de test (60 espectrogramas) | 86,67 % |
| F1 ponderado | 0,87 (precision 0,87, recall 0,87) |
| ROC-AUC one-vs-rest, helicopter | 0,99 |
| ROC-AUC one-vs-rest, drone | 0,96 |
| ROC-AUC one-vs-rest, background | 0,94 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K y similares) porque no aplican a este tipo de modelo. Tampoco se aportan cifras de latencia, throughput ni comparaciones con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia derivada de la arquitectura, los pesos en float32 ocuparian en torno a 30 MB (estimacion basada en los aproximadamente 7,45 millones de parametros calculados a partir de la arquitectura descrita), por lo que la huella de memoria es muy reducida incluso en precision completa.
- GPU recomendadas: no disponibles; el modelo es lo bastante pequeno como para no requerir GPU. El autor lo entreno en Google Colab, lo que implica que una GPU de gama media de ese entorno fue suficiente para el entrenamiento.
- Compatibilidad con GPU de consumo: si, previsiblemente cualquier GPU de consumo moderna puede alojarlo, dada su huella de memoria; no hay cifras oficiales que lo confirmen.
- CPU: la inferencia con PyTorch en CPU es viable por el reducido numero de operaciones (dos convoluciones y una capa lineal).
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia, que ademas no aplican a este tipo de modelo. El despliegue previsto es la ejecucion directa de `predict.py` con las dependencias `torch`, `pillow` y `numpy`.
- Latencia y throughput estimados: no disponible.
- Requisitos de software: Python con PyTorch, Pillow y NumPy, segun el ejemplo de uso de la model card.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros clasificadores de espectrogramas ni cifras de referencia de terceros, y no se han publicado resultados de este modelo frente a alternativas en la misma tarea (deteccion acustica de drones o clasificacion de eventos acusticos). Cualquier comparacion requeriria evaluar los modelos sobre el mismo conjunto de test con el mismo esquema de particion, algo que la model card no ofrece.

## Limitaciones y advertencias

- Conjunto de datos muy reducido (297 espectrogramas) y test de solo 60 imagenes: las cifras de rendimiento son indicativas y no precisas, con intervalos de confianza amplios.
- Sobreajuste: la perdida de entrenamiento es muy baja mientras que la exactitud de validacion queda por debajo, y no se utilizaron aumento de datos ni regularizacion.
- Fuga de informacion potencial: el split es aleatorio a nivel de imagen; si varios espectrogramas proceden de la misma grabacion, pueden aparecer casi duplicados en train y test e inflar las metricas. El autor planea pasar a un split por grabacion.
- Errores conocidos: los fragmentos de background se clasifican en ocasiones como helicoptero.
- Generalizacion no verificada: el modelo no se ha probado con grabaciones de entornos, microfonos o condiciones de ruido nuevos.
- Dependencia del preprocesado: el rendimiento depende de que los espectrogramas de entrada se generen con la misma configuracion (dimensiones 480 x 640, escala de grises, valores 0-1) que los del entrenamiento; la model card no documenta los parametros de la transformada usados.
- Ausencia de mantenimiento y adopcion: 0 descargas y 0 likes, sin garantias de soporte ni actualizaciones mas alla de la fecha registrada.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificacion y redistribucion con atribucion y sin garantia; no hay clausulas adicionales documentadas.
- Advertencia explicita del autor: es un modelo de linea base para demostracion de resolucion de problemas y no debe usarse en aplicaciones criticas para la seguridad (safety-critical).
- Sesgos: no se documenta ningun analisis de sesgos por tipo de entorno acustico, microfono o procedencia de los datos; con 101/99/97 imagenes por clase, el desbalance de clases es minimo, pero la representatividad de las grabaciones es desconocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FisayoF/DeployedSpectrogram
- Codigo de arquitectura incluido en el repositorio: `model.py` (clase `CnnNet`)
- Ejemplo minimo de inferencia incluido en el repositorio: `predict.py`
- Pesos: `weightsfilefromspectrogram.pth` (state_dict de PyTorch)
- Conjunto de datos de origen: proporcionado por la comunidad del London Defence Hackathon en GitHub; no se incluye la URL en la model card
- Paper, blog, demo o repositorio adicional: no disponible en la informacion proporcionada
