# Intel/light-level-anomaly-detection

## Resumen

Light-Level Anomaly Detection es un caso de uso de analitica de calidad de imagen publicado por Intel en Hugging Face bajo el identificador `Intel/light-level-anomaly-detection`. No se trata de un modelo neuronal ni de un transformer: es una receta de vision por computador clasica implementada con OpenCV que monitoriza el nivel de luminancia global de un flujo de video y senala condiciones de iluminacion anomala (escena a oscuras, sobreexposicion o cambio brusco de luz). El repositorio incluye la model card, un script de ejemplo en Python (`opencv_sample.py`) y un video de prueba descargable.

El enfoque es deliberadamente no neuronal: la luminancia global de una escena se mide directamente sobre los pixeles, de modo que un modelo de aprendizaje automatico no aportaria ventajas y si anadiria coste computacional y latencia. El algoritmo calcula la media del canal V del espacio HSV por fotograma, la compara con umbrales fijos de oscuridad (`DARK_BOUND = 40.0`) y brillo (`BRIGHT_BOUND = 215.0`), y detecta saltos bruscos respecto al fotograma anterior (`JUMP_BOUND = 35.0`). Cada fotograma se clasifica como `normal`, `dark`, `bright` o `sudden-change`.

Su relevancia actual es practica: encaja en despliegues de videovigilancia y analitica urbana (el autor lo enmarca en escenarios "Metro") donde se necesita alerta en tiempo real con coste minimo, ejecutable en CPU e integrable en pipelines de Intel DLStreamer. El repositorio es muy pequeno (0,0 GB) y tiene un uso testimonial en Hugging Face (53 descargas, 1 like en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Procesamiento clasico de imagen con OpenCV (estadisticas de luminancia sobre canal V de HSV); no es una red neuronal |
| Parametros totales | no disponible (no aplicable: no hay pesos entrenados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa fotograma a fotograma; sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible; la model card indica explicitamente que no se exporta ni cuantiza ningun modelo |
| Idiomas soportados | en (segun metadatos; el procesamiento es independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | no disponible (no hay pesos; se distribuye codigo Python y un video de prueba) |

## Arquitectura y entrenamiento

No existe entrenamiento. La solucion es un algoritmo determinista de analitica de imagen: conversion del fotograma de BGR a HSV con `cv2.cvtColor`, extraccion del canal V (valor/luminosidad), calculo de la media con `numpy.mean` y clasificacion mediante tres reglas de umbral. La comparacion con una linea base movil se aproxima en el ejemplo mediante la diferencia con el fotograma inmediatamente anterior, no con una media movil real sobre ventana.

El stack de referencia declarado por el autor es Intel DLStreamer 2026.3.0 RC1 con el bundle OpenVINO GenAI 2026.5.0.0.dev20261030 (OpenVINO Runtime 2026.5.0.dev20261030), marcado como pila de desarrollo y no como version estable. Los objetivos de dispositivo son CPU (por defecto), GPU mediante `cv2.UMat` con la API transparente de OpenCV, y NPU no aplicable porque no hay carga neuronal. La innovacion tecnica, si cabe llamarla asi, es la simplicidad: cero dependencias de inferencia, umbrales interpretables y ajustables, y ejecucion en tiempo real sin acelerador.

## Capacidades

- Deteccion de subexposicion: marca fotogramas cuya luminancia media cae por debajo de 40,0 (luces apagadas, lente cubierta, escena nocturna).
- Deteccion de sobreexposicion: marca fotogramas por encima de 215,0 (deslumbramiento, faros, saturacion del sensor).
- Deteccion de cambio brusco de luz: diferencia de 35,0 o mas entre fotogramas consecutivos.
- Anotacion y volcado de video: escribe los fotogramas etiquetados en `output_opencv.mp4` y emite eventos por consola con indice de fotograma, estado y nivel medido.
- Procesamiento de video local con OpenCV y NumPy; sin tool calling, sin function calling, sin razonamiento multi-paso ni capacidades de agente.
- Sin capacidades multilingues, de vision semantica, audio o modo de razonamiento: solo analiza un escalar global de brillo por fotograma.
- Aceleracion opcional en GPU Intel mediante `cv2.UMat`.

## Casos de uso

- Deteccion de fallos de iluminacion en infraestructura: en andenes, tuneles o parkings, el script alerta cuando la luminancia media cae por debajo del umbral de oscuridad, lo que permite abrir una incidencia de mantenimiento sin desplegar ningun modelo.
- Conmutacion dia/noche de perfiles analiticos: el nivel de luz medido puede publicarse como senal de control para que otros componentes del pipeline (deteccion de personas, lectura de matricula) cambien de configuracion al detectar el estado `dark` o `bright`.
- Control de calidad de camaras (exposure QA): un flujo de validacion puede marcar camaras cronicamente sobreexpuestas o demasiado oscuras como no aptas para analitica, filtrandolas antes de que consuman recursos de inferencia.
- Indicador de manipulacion (tamper): una caida subita de luminancia compatible con una lente cubierta se detecta como `sudden-change`, util como senal de primera linea en sistemas de videovigilancia.
- Preprocesado en pipelines de DLStreamer: el evento de anomalia de luz puede condicionar el envio de fotogramas a modelos mas costosos, ahorrando computo cuando la imagen no es analizable.
- Monitorizacion de calidad de emision en directo: en retransmisiones o capturas automatizadas, el script puede registrar tramos oscuros o quemados para revision posterior, con coste de CPU minimo y sin GPU.
- Prototipado rapido y educacion: al ser codigo Python de unas pocas decenas de lineas con umbrales explicitos, sirve como base para experimentar con metricas de exposicion antes de invertir en soluciones mas complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, recall ni latencia, y la matriz de validacion de dispositivos se referencia de forma externa (`DEVICE_SUPPORT_MATRIX.md`) sin valores en el material proporcionado.

## Requisitos de hardware

- VRAM: no aplicable; no hay pesos ni inferencia neuronal. El consumo es de memoria de sistema para los fotogramas decodificados.
- CPU: cualquier CPU moderna con Python 3.11+ y `opencv-python`; la carga por fotograma es una conversion de espacio de color y una media sobre todos los pixeles.
- GPU: opcional, GPUs integradas o discretas de Intel mediante la API transparente de OpenCV (`cv2.UMat`). No se documentan requisitos de GPU NVIDIA o AMD.
- NPU: explicitamente no aplicable segun el autor.
- Cabe en cualquier equipo de consumo, incluidos mini-PC y dispositivos de borde; el limite practico lo marca la decodificacion de video, no el algoritmo.
- Despliegue: script Python con OpenCV y NumPy; integrable en Intel DLStreamer 2026.3.0 RC1. No aplican vLLM, llama.cpp, Ollama ni TGI porque no hay modelo generativo.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen de la resolucion del video y del hardware de decodificacion.

## Comparativa con modelos similares

| Solucion | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Intel/light-level-anomaly-detection | Reglas OpenCV sobre luminancia | No aplica | No aplica | MIT | Hugging Face (repo con codigo y video de prueba) |
| Modelo neuronal de clasificacion de imagen (p. ej. ResNet o MobileNet) | CNN supervisada | Millones de parametros | No aplica | Variable segun modelo | Amplia, via frameworks de inferencia |
| Detector de anomalias por autoencoder sobre fotogramas | Red neuronal no supervisada | Variable | No aplica | Variable | Requiere entrenamiento y datos propios |

La comparacion relevante no es de rendimiento sino de adecuacion: para medir brillo global, un modelo neuronal anade coste, latencia y necesidad de datos etiquetados sin mejora esperada, tal como argumenta el propio autor. Frente a un autoencoder de anomalias, esta solucion no detecta anomalias visuales complejas (objetos, movimiento, cambios de escena) y se limita a un unico escalar de luminancia.

## Limitaciones y advertencias

- Solo mide luminancia global: no detecta anomalias semanticas, objetos, movimiento ni cambios de escena que no alteren el brillo medio.
- Umbrales fijos y heuristicos (40,0 / 215,0 / 35,0): requieren calibracion por camara, escena y condiciones; un valor mal ajustado genera falsos positivos o negativos.
- La "linea base movil" del ejemplo es en realidad la diferencia con el fotograma anterior, no una media movil; cambios graduales de luz (amanecer, regulacion de intensidad) pueden no disparar la alerta.
- El calculo de la media sobre todos los pixeles es sensible a regiones dominantes: una zona muy brillante pequena puede quedar diluida y no detectarse.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea por umbrales inadecuados.
- Sesgos conocidos: no documentados; el comportamiento depende de la distribucion de luminancia de la escena y del sensor de la camara.
- Idioma: los metadatos declaran solo `en`; el codigo y los mensajes estan en ingles, aunque el algoritmo es independiente del idioma.
- Licencia MIT: permite uso comercial y modificacion con atribucion; no se documentan restricciones adicionales.
- El stack de referencia (DLStreamer 2026.3.0 RC1 y OpenVINO 2026.5.0 dev) es una version de desarrollo, no estable; para produccion conviene fijar versiones y validar en el hardware objetivo.
- Adopcion muy baja (53 descargas, 1 like) y sin pipeline declarado en Hugging Face: no hay evidencia de uso en produccion ni soporte comunitario.

## Enlaces

- Hugging Face: https://huggingface.co/Intel/light-level-anomaly-detection
- OpenCV, conversiones de espacio de color: https://docs.opencv.org/4.x/d8/d01/group__imgproc__color__conversions.html
- OpenCV, operaciones sobre arrays (mean): https://docs.opencv.org/4.x/d2/de8/group__core__array.html
- Intel, centro de descargas de drivers y software: https://www.intel.fr/content/www/fr/fr/download-center/home.html
- Intel, pagina corporativa: https://www.intel.com/content/www/us/en/homepage.html
