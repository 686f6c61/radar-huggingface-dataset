# PeytonT/calisthenics-pose-completion-v4

## Resumen

El repositorio PeytonT/calisthenics-pose-completion-v4 (titulado internamente "Calisthenics pose completion v4.1") no es un modelo de lenguaje, sino un paquete de tres modelos ONNX pensados para inferencia en navegador dentro de la aplicacion CaliCombos AI Annotate. Su proposito concreto es completar la geometria de visualizacion de figuras de calistenia (en particular la planche) cuando parte del cuerpo queda oculta o no esta soportada por la evidencia de imagen. Lo publica el usuario PeytonT y se distribuye bajo una licencia compuesta que combina Apache-2.0 con terminos especificos de materiales SAM.

El bundle integra un detector de persona (HumanArt YOLOX Tiny, 10.181.266 bytes), un predictor de pose de cuerpo completo adaptado de RTMW (65.232.135 bytes) con cabezas de soporte por region de origen y configuracion de piernas, y un modelo compacto de geometria corporal MHR normalizada por camara (472.826 bytes). Los dos primeros usan almacenamiento de pesos en float16 y activaciones en float32; el modelo corporal usa float32. El tamano total del repositorio es de 0,1 GB, lo que permite ejecucion local sin GPU de servidor.

Su relevancia es acotada pero clara: demuestra un flujo de refinamiento de visualizacion acotado y con puertas de evidencia ("evidence-gated"), orientado a privacidad, ya que no sube clips ni usa identificadores de clip, nombres de fichero, marcas de tiempo ni animaciones de referencia almacenadas durante la inferencia. No es un sustituto universal para cualquier articulacion visible u ocluida, y el propio autor lo enmarca como una pieza de una pipeline mayor que no se distribuye completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de tres redes ONNX: detector YOLOX Tiny (HumanArt), predictor de pose de cuerpo completo adaptado de RTMW/MMPose con cabezas de evidencia y configuracion, y modelo compacto "estudiante" de geometria corporal MHR que mapea una entrada [1,12,9] a una salida [1,23,3]. La topologia de capas del modelo corporal no se detalla |
| Parametros totales | no disponible (no se publica recuento de parametros; tamanos de pesos: 10.181.266 B detector, 65.232.135 B pose, 472.826 B cuerpo, 75,9 MB en total) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision no autoregresivo; sin ventana de contexto textual) |
| Tipos de cuantizacion | float16 para almacenamiento de pesos en los modelos de imagen (con activaciones float32) y float32 en el modelo corporal. No se ofrecen variantes GGUF, INT8 ni INT4 |
| Idiomas soportados | no disponible / no aplica (el pipeline no procesa texto) |
| Licencia | component-specific-apache-2.0-and-sam (licencia compuesta; los terminos upstream se preservan por componente y los materiales SAM no se relicencian bajo Apache-2.0) |
| Formato de pesos | ONNX (ejecucion con ONNX Runtime Web WASM) |

## Arquitectura y entrenamiento

El bundle se compone de tres ficheros ONNX con funciones separadas. person-detector.onnx (YOLOX Tiny HumanArt, distribuido a traves de RTMLib) realiza el recorte de la persona objetivo. pose-evidence.onnx es un predictor de cuerpo completo adaptado de RTMW (variante `rtmw-dw-l-m_simcc-cocktail14_270e-256x192_20231122.onnx` de OpenMMLab MMPose), modificado con entrenamiento por region de origen, cabezas de evidencia/configuracion y empaquetado de pesos en float16. body-completion.onnx es un estudiante compacto nuevo, entrenado para producir geometria corporal MHR normalizada por camara a partir de observaciones dispersas: 23 puntos conectados de cuerpo, cabeza y pies. Su entrada es [1,12,9] (rayos de imagen enmascarados si no estan soportados, XYZ mundial relativo previo, mascara de soporte de origen, confianza de profundidad, distancia raiz normalizada de camara y probabilidad de pierna extendida) y su salida es [1,23,3] con los landmarks MHR 0-20 mas las munecas izquierda y derecha. El orden de entrada es hombro, codo, muneca, cadera, rodilla y tobillo, izquierda y derecha.

En cuanto al entrenamiento, las cabezas de evidencia de imagen usan acuerdo positivo y negativo entre candidato y region de origen, con categorias desconocidas enmascaradas, y el predictor de coordenadas permanece congelado durante ese entrenamiento de evidencia. El modelo corporal se entrena con poses generadas por MHR en distintas orientaciones de camara, oclusiones agrupadas, ejemplos de preservacion y geometria de ajuste corregida de video completo. Una pasada final de destilacion utiliza entradas reales de navegador normalizadas por camara y el ajuste corregido para aprender espaciado de piernas y orientacion de pies; los subconjuntos de reconstruccion temporal del mismo clip seleccionan la longitud de optimizacion y no constituyen validacion independiente, y una reproduccion sintetica de pose mas amplia regulariza esa pasada. No hay RLHF ni DPO, ya que no es un modelo generativo de texto. Los autores advierten de que la varianza logaritmica de salida es un resultado de incertidumbre de entrenamiento, no una probabilidad calibrada de visibilidad.

## Capacidades

- Deteccion de persona objetivo y recorte mediante un detector YOLOX Tiny especializado en cuerpo humano (HumanArt).
- Estimacion de pose de cuerpo completo con puntos clave, con soporte por region de origen por articulacion.
- Completado de geometria corporal sobre observaciones dispersas: 23 puntos conectados de cuerpo, cabeza y pies (landmarks MHR 0-20 mas munecas izquierda y derecha).
- Inferencia con abstención: si no se cumplen las comprobaciones de identidad, contexto de planche, extension, cadena visible, limites y geometria, el completado se retiene y se mantiene la pipeline previa.
- Marcado explicito de articulaciones ocultas como estimaciones inferidas, sin asignarles visibilidad observada.
- Ejecucion integra en navegador con ONNX Runtime Web WASM, sin inferencia en servidor.
- Sin uso de identificadores de clip, nombre de fichero, marca de tiempo, subida de clip ni animacion de referencia almacenada durante la inferencia.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, vision general de escenas ni procesamiento de audio o texto.

## Casos de uso

- Analisis biomecanico de planche en el navegador: el modelo completa la geometria de las piernas y calcula angulos articulares (en el clip de validacion declarado, medianas de rodilla de 172,14° y 173,42°) sin enviar el video a un servidor, lo que encaja en aplicaciones de entrenamiento con requisitos estrictos de privacidad.
- Correccion de oclusiones en video de entrenamiento: cuando una pierna o un pie quedan tapados por el torso o por el propio cuerpo, el estudiante de geometria infiere la posicion y la etiqueta como estimacion, evitando que la visualizacion muestre articulaciones ausentes.
- Preanotacion asistida en herramientas de etiquetado: CaliCombos AI Annotate puede usar el bundle para proponer keypoints y geometria que luego revisa una persona, manteniendo las observaciones crudas y las anotaciones de movimiento como artefactos separados.
- Control de calidad de ejecucion: la deteccion de configuracion de piernas extendidas (probabilidad de pierna extendida como entrada del modelo corporal) permite verificar requisitos de forma en un hold estatico, con retencion del hold observada durante 12,5 segundos en la reconstruccion declarada.
- Filtrado temporal en la visualizacion: la aplicacion aplica filtrado temporal de visualizacion sobre las salidas del modelo para suavizar la reconstruccion de clips completos (130 fotogramas, 100 completados de planche aceptados en el clip de validacion).
- Abstención en escenas concurridas: en la regresion con 178 fotogramas de escena concurrida no se acepto ningun reemplazo y las anotaciones quedaron intactas, lo que permite usar el modelo en entornos donde es preferible no corregir antes que introducir geometria erronea.
- Prototipado de analisis de movimiento sin infraestructura GPU: al ejecutarse en WASM dentro del navegador y ocupar 0,1 GB, sirve para demos y herramientas de anotacion en equipos de escritorio sin servidor de inferencia dedicado.
- Investigacion sobre destilacion de geometria corporal: el estudiante compacto entrenado a partir de ajustes corregidos de SAM 3D Body y MHR puede reutilizarse como referencia metodologica para comprimir modelos de reconstruccion corporal de varios gigabytes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, COCO AP, etc.) en la informacion disponible. Si el autor declara cifras de validacion acotadas a su propio pipeline, que no deben interpretarse como benchmarks generales:

| Metrica declarada | Resultado | Nota del autor |
|---|---|---|
| Acuerdo de coordenadas de imagen por region de origen (validacion) | 40/67 | Denominadores distintos de informes antiguos de recorte de imagen completa; no debe presentarse como aumento de precision |
| Acuerdo de coordenadas de imagen por region de origen (test) | 46/65 | Los fotogramas de revision deben tener identidad resoluble |
| Soportes de tobillo recortado previamente falsos | 0,479 / 0,464 | Por debajo del umbral de soporte de 0,65 de la aplicacion; las articulaciones en borde de recorte se rechazan por separado |
| Reconstruccion en navegador de clip completo | 130 fotogramas, 100 completados de planche aceptados | Medianas de rodilla 172,14° / 173,42°; hold retenido 12,5 s; la geometria offline corregida de ese clip es fuente de entrenamiento |
| Regresion en escena concurrida | 178 fotogramas, 0 reemplazos aceptados | Verifica abstención, no recuperacion correcta en escenas concurridas |
| Inferencia de imagen nativa frente a navegador | Picos corporales identicos | Pruebas de editor en Chrome de escritorio, incluido viewport de 390×844 |
| Telefonos fisicos | No probados | No se han realizado pruebas en dispositivos moviles reales |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el escenario previsto. Al ejecutarse mediante ONNX Runtime Web WASM, el consumo relevante es memoria del navegador, no VRAM de GPU; los pesos suman aproximadamente 75,9 MB y hay que anadir activaciones en float32 y el runtime WASM.
- GPU recomendadas: no se especifica ninguna. No se documenta ejecucion sobre A100, H100 ni RTX 4090; el diseno apunta a CPU del cliente a traves de WASM.
- Compatibilidad con GPU de consumo: no aplica como requisito. Cualquier equipo de escritorio capaz de ejecutar Chrome con WebAssembly puede alojar el bundle; el modelo no necesita GPU dedicada.
- Opciones de despliegue: ONNX Runtime Web WASM en navegador. No se documentan rutas de despliegue con vLLM, llama.cpp, Ollama ni TGI (no son aplicables a este tipo de modelo). Tampoco se confirma soporte de WebGPU, solo WASM.
- Latencia y throughput estimados: no disponible. No se publican tiempos por fotograma ni FPS, solo el volumen de fotogramas procesados en los clips de validacion (130 y 178 fotogramas).
- Entorno validado: Chrome de escritorio, incluido un viewport de 390×844. Los telefonos fisicos no han sido probados.

## Comparativa con modelos similares

No se aportan datos comparativos en la informacion disponible. La comparativa siguiente es estructural y cualitativa, y marca como "no disponible" cualquier cifra que no conste:

| Modelo | Categoria | Parametros | Contexto/entrada | Licencia | Disponibilidad | Datos comparativos |
|---|---|---|---|---|---|---|
| PeytonT/calisthenics-pose-completion-v4 | Deteccion de puntos clave y completado corporal en navegador | no disponible (pesos: 75,9 MB) | Entrada de imagen 256×192 en el backbone de pose; entrada [1,12,9] en el modelo corporal | component-specific-apache-2.0-and-sam | Repositorio HuggingFace, 0 descargas y 0 likes a fecha de la ficha | Referencia |
| RTMW / MMPose (`rtmw-dw-l-m_simcc-cocktail14_270e-256x192`) | Pose de cuerpo completo | no disponible | 256×192 | Apache-2.0 (upstream) | Publico | Es el backbone upstream modificado por este bundle; no se aportan cifras comparativas |
| YOLOX Tiny HumanArt | Deteccion de persona | no disponible | 300 epocas de entrenamiento HumanArt | Licencia upstream YOLOX (LICENSE-YOLOX.txt) | Distribuido via RTMLib | Es el detector upstream incluido sin cambios de arquitectura, solo empaquetado float16 |
| Meta MHR / SAM 3D Body | Geometria corporal | no disponible | no disponible | Terminos MHR y SAM (LICENSE-MHR.txt, LICENSE-SAM.txt) | Los checkpoints originales de varios gigabytes no se distribuyen aqui | Fuente de las salidas de ajuste usadas para entrenar al estudiante; no es una comparacion de rendimiento |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos demograficos ni de composicion de dataset. Los datos de entrenamiento del modelo corporal son poses sinteticas generadas por MHR, con lo que la cobertura real del dominio depende de la fidelidad de ese generador.
- Riesgo de error geometrico: los autores advierten de que el modelo no establece una metrica 3D calibrada ni precision anatomica general, y que no garantiza la correccion de la carga en los dedos ni de la supinacion.
- Las articulaciones ocultas se infieren y se etiquetan como estimaciones; no se miden ni se les asigna visibilidad observada. La varianza logaritmica de salida es una incertidumbre de entrenamiento, no una probabilidad calibrada de visibilidad.
- Validacion no independiente: el clip cuya geometria offline corregida se uso como fuente de entrenamiento tambien se reporta como reconstruccion. No es una validacion 3D independiente en el mundo real. Los propios autores piden no comparar los denominadores 40/67 y 46/65 con informes antiguos de recorte de imagen completa.
- La regresion en escena concurrida (178 fotogramas, 0 reemplazos aceptados) verifica la capacidad de abstención, no la recuperacion correcta en escenas con varias personas.
- Limitacion de plataforma: solo se ha probado en Chrome de escritorio. No se han probado telefonos fisicos, pese a que existe un viewport de prueba de 390×844.
- Aplicabilidad muy estrecha: esta especializado en calistenia y en la planche. No es un modelo general de pose ni un sustituto de un estimador de pose universal.
- El bundle no es una pipeline completa: la aplicacion debe aportar ONNX Runtime Web WASM, preprocesado, seleccion de identidad, observaciones de manos, normalizacion de camara, comprobaciones de confianza, anclaje por rayo de origen, filtrado temporal de visualizacion y el decodificador de malla humanoide. Cargar solo el fichero ONNX del cuerpo no reproduce el sistema.
- Restricciones de licencia: la licencia es compuesta y especifica por componente. Los materiales SAM no se relicencian bajo Apache-2.0, por lo que un uso comercial exige revisar los terminos upstream de MMPose/RTMW, YOLOX, MHR y SAM antes de desplegar.
- Senales de madurez del repositorio: 0 descargas y 0 likes, con fechas de creacion y actualizacion del 21 de septiembre de 2026. No hay cifras de benchmarks estandar ni resultados de validacion externa.
- Sin soporte de texto, idiomas, tool calling ni agentes: cualquier expectativa en ese sentido queda fuera del alcance declarado del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PeytonT/calisthenics-pose-completion-v4
- Seccion de licencias y procedencia del repositorio: https://huggingface.co/PeytonT/calisthenics-pose-completion-v4#licenses-and-provenance
- Ficheros de licencia incluidos en el repositorio (referenciados en la model card): LICENSE-MMPOSE.txt, LICENSE-YOLOX.txt, LICENSE-MHR.txt y LICENSE-SAM.txt
- Fichero de validacion incluido en el repositorio: validation.json (registro de comprobaciones acotadas)
- Fichero de manifiesto de activos: manifest.json (digests inmutables, convenciones de tensores y alcance)
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los unicos resultados obtenidos eran articulos sobre las Islas Feroe, sin relacion alguna con el repositorio. No se dispone, por tanto, de enlaces adicionales a papers, blogs, repositorios o demos verificados.
