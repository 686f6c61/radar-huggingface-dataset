# software-mansion/react-native-executorch-facemesh

## Resumen

facemesh es un modelo de deteccion de puntos clave (keypoint detection) publicado por software-mansion dentro de su coleccion de modelos para la libreria React Native ExecuTorch. Se trata de una exportacion a formato ExecuTorch (`.pte`) del modelo MediaPipe Face Mesh portado a PyTorch, pensada para ejecutarse en el propio dispositivo (on-device) en aplicaciones moviles React Native. El modelo regresa 468 landmarks tridimensionales sobre un unico rostro ya recortado y devuelve ademas una puntuacion de confianza de presencia de cara.

A diferencia de un detector facial, facemesh no busca rostros en la imagen: recibe un recorte de 192x192 pixeles y asume que contiene una cara, por lo que en un pipeline real debe encadenarse detras de un detector como blazeface. La salida incluye la caja envolvente (hull) del mesh, la probabilidad de presencia facial y los 468 puntos con coordenadas x, y, confianza y profundidad relativa z, siguiendo el orden canonico de landmarks de MediaPipe.

Su relevancia practica es doble: por un lado, ofrece inferencia local sin enviar imagenes a un servidor, algo critico en aplicaciones de camara y biometria; por otro, su tamano es muy reducido (2,5 MB en fp32 y 1,6 MB en fp16), lo que lo hace apto para moviles de gama media. El repositorio no incluye pesos en safetensors ni variantes cuantizadas a int8, y esta atado al runtime ExecuTorch v1.4.1 sin garantia de compatibilidad hacia delante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la model card no detalla la topologia; es una red de regresion de landmarks derivada de MediaPipe Face Mesh) |
| Parametros totales | No disponible |
| Longitud de contexto | No aplicable (modelo de vision; entrada de imagen fija de 192x192 pixeles) |
| Tipos de cuantizacion | fp32 (backend xnnpack) y fp16 (backend coreml); no se publican variantes int8 |
| Idiomas soportados | No aplicable (no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pte` (programa ExecuTorch) mas ficheros `config.json`; no hay safetensors ni GGUF |
| Tarea (pipeline) | keypoint-detection |
| Entrada | `[1, 3, 192, 192]` f32, RGB, canales primero, normalizada como `v / 127.5 - 1` |
| Salidas | `boxes [1, 4]` f32 (hull xyxy), `scores [1]` f32 (probabilidad de presencia facial), `keypoints [1, 468, 4]` f32 (x, y, confianza, z) |
| Numero de landmarks | 468, en el orden canonico de MediaPipe Face Mesh |
| Variantes publicadas | `xnnpack/facemesh_xnnpack_fp32.pte` (2,5 MB), `coreml/facemesh_coreml_fp16.pte` (1,6 MB) |
| Tamano del repositorio | 0,0 GB segun HuggingFace (ficheros listados: 30 B, 719 B, 1,6 MB, 721 B y 2,5 MB) |
| Runtime requerido | ExecuTorch v1.4.1 |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-09-11 (creacion y ultima actualizacion) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna ni el proceso de entrenamiento. Lo unico documentado es el origen: se trata de MediaPipe Face Mesh portado a PyTorch, concretamente desde el repositorio tiqq111/mediapipe_pytorch, y posteriormente exportado a programas ExecuTorch. No se indica el numero de parametros, la composicion del dataset, el numero de tokens o muestras de entrenamiento, ni si hubo fases de ajuste fino con RLHF o DPO (tecnicas, por otra parte, propias de modelos de lenguaje y no aplicables aqui).

La innovacion relevante no esta en el modelo en si, sino en el proceso de empaquetado: la misma red se publica en dos variantes de backend para maximizar el rendimiento en cada plataforma. La variante xnnpack en fp32 esta pensada para ejecucion en CPU con la libreria XNNPACK, mientras que la variante coreml en fp16 aprovecha el runtime Core ML de Apple. El modelo regresa simultaneamente la caja envolvente del mesh en unidades de pixel de entrada, una probabilidad escalar de presencia facial y los 468 landmarks con profundidad relativa z (negativa hacia la camara, en la misma escala que x). Al no existir confianza por landmark, la columna de confianza de cada punto es una constante 1.

Un detalle de interoperabilidad importante: el orden de los landmarks es el canonico de MediaPipe, de modo que cualquier lista de indices publicada para MediaPipe Face Mesh (labios, ojos, ovalo facial) es directamente aplicable sin remapeo.

## Capacidades

- Regresion de 468 landmarks faciales tridimensionales (x, y, z) sobre un unico rostro recortado, con profundidad relativa.
- Estimacion de presencia facial mediante una puntuacion escalar de confianza.
- Calculo de la caja envolvente (hull) del mesh en coordenadas de pixel de la imagen de entrada.
- Inferencia completamente on-device, sin llamadas a red ni envio de imagenes a servidores.
- Ejecucion en dos backends: XNNPACK (CPU) y Core ML (Apple), con precisiones fp32 y fp16 respectivamente.
- Compatibilidad directa con los indices de landmarks de MediaPipe Face Mesh para seleccionar subconjuntos (ojos, cejas, labios, contorno).
- Integracion con el ecosistema React Native ExecuTorch mediante la constante del registro de modelos de la libreria.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: no es un modelo de lenguaje.
- No realiza deteccion de rostros por si mismo; requiere un recorte previo generado por un detector externo.

## Casos de uso

- Filtros y mascaras de realidad aumentada en aplicaciones moviles: los 468 landmarks permiten anclar gafas, sombreros o maquillaje virtual al rostro fotograma a fotograma, y el modelo es lo bastante pequeno (1,6-2,5 MB) para caber en el bundle de una app sin penalizar el tamano de descarga.
- Seguimiento de cabeza y avatares animados: la componente z y la posicion de los landmarks permiten estimar la orientacion de la cabeza y transferir expresiones a un avatar 3D en tiempo real, con inferencia local que evita la latencia de red.
- Deteccion de somnolencia y distraccion al volante: calculando la apertura palpebral a partir de los indices de ojos de MediaPipe, una app movil o un sistema embebido puede alertar de microsuenos sin transmitir video a la nube.
- Rehabilitacion y fisioterapia facial: el modelo permite medir simetria facial y rango de movimiento de labios o parpados en pacientes con paralisis de Bell u otras afecciones, registrando la evolucion sesion a sesion de forma objetiva.
- Verificacion de encuadre en selfies y fotografia automatica: combinado con un detector como blazeface, se puede comprobar si el rostro esta centrado y con la orientacion correcta antes de disparar la camara, o recortar la foto segun el hull del mesh.
- Prueba de vida (liveness) en procesos de verificacion de identidad: la puntuacion de presencia facial mas la variacion de landmarks entre fotogramas permiten detectar si el sujeto es una persona real y no una fotografia estatica, como paso previo (no sustitutivo) a una verificacion biometrica.
- Accesibilidad y control por gestos faciales: los landmarks de cejas, boca y ojos pueden traducirse en comandos discretos para usuarios con movilidad reducida, ejecutando todo el procesamiento en el dispositivo.
- Analitica de interaccion en teleconferencia y educacion online: medicion agregada y anonimizada de atencion o presencia (por ejemplo, si el alumno mira a pantalla) sin que el video salga del terminal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de error de landmarks (como NME), latencia de inferencia ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente despreciable. Los ficheros pesan 2,5 MB (xnnpack fp32) y 1,6 MB (coreml fp16), por lo que el consumo de memoria dedicada en GPU es marginal frente al de cualquier modelo de lenguaje.
- GPU recomendadas: no aplica en el caso de uso principal, que es movil on-device. La variante coreml se beneficia de la Neural Engine y la GPU integrada de los SoC Apple; la variante xnnpack esta optimizada para CPU.
- Dispositivos objetivo: telefonos iOS y Android de gama media y alta. El modelo cabe sin dificultad en moviles con 4 GB de RAM o menos, dado su tamano de fichero.
- Compatibilidad con GPU de consumo: cualquier GPU de escritorio moderna (RTX 3060, RTX 4090, etc.) puede ejecutarlo sin problema, pero no es un escenario de despliegue documentado por el autor.
- Opciones de despliegue: React Native ExecuTorch (libreria npm `react-native-executorch`) mediante la constante del registro de modelos; cualquier runtime ExecuTorch propio. No aplican vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada. En la practica, el pipeline completo depende de que el recorte de 192x192 se genere antes con un detector facial externo, que anade su propio coste.
- Restriccion de runtime: los ficheros estan publicados para ExecuTorch v1.4.1 y el proyecto no garantiza compatibilidad hacia delante, por lo que versiones mas antiguas pueden fallar al cargarlos.

## Comparativa con modelos similares

| Modelo | Tarea | Salida | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| react-native-executorch-facemesh (este modelo) | Regresion de landmarks faciales | 468 landmarks + score + caja | Imagen fija 192x192 | Apache-2.0 | HuggingFace, formato `.pte` para ExecuTorch v1.4.1 |
| MediaPipe Face Mesh (modelo upstream) | Regresion de landmarks faciales | 468 landmarks | No disponible | No disponible en la informacion | Distribuido dentro del ecosistema MediaPipe; no es el artefacto `.pte` |
| react-native-executorch-blazeface | Deteccion de rostros | Cajas, scores y puntos clave | No disponible | No disponible en la informacion | HuggingFace, misma coleccion de software-mansion; se usa como etapa previa a facemesh |

No se dispone de datos de parametros, contexto ni rendimiento de las alternativas en la informacion proporcionada, por lo que la comparacion se limita a tarea, formato de salida y disponibilidad. facemesh no es funcionalmente sustituible por un detector: ambas piezas se complementan en el mismo pipeline.

## Limitaciones y advertencias

- No detecta rostros. Si se le pasa una imagen sin recorte previo, o con un recorte mal encuadrado, la salida no es fiable. Requiere una etapa de deteccion como blazeface.
- Procesa un unico rostro por inferencia, el dominante en el recorte. No soporta escenas con multiples caras sin ejecutar el modelo una vez por recorte.
- La confianza por landmark es una constante 1 (el mesh no genera confianza individual), por lo que no existe una medida de incertidumbre punto a punto utilizable para filtrar oclusiones o puntos ocluidos.
- La profundidad z es relativa, en la misma escala que x, no una distancia metrica absoluta; no debe usarse para medir distancias reales sin calibracion externa.
- Riesgo de degradacion con oclusiones (manos, gafas de sol, mascarillas), iluminacion extrema, angulos muy laterales o caras parcialmente fuera del recorte. No se documentan tasas de fallo.
- No hay resultados de benchmarks publicados, ni metricas de sesgo demografico, precision por tono de piel, edad o genero. Esto es un riesgo para despliegues en produccion con publicos diversos.
- La licencia del repositorio es Apache-2.0, que permite uso comercial, pero la model card no aclara la licencia del modelo upstream (MediaPipe Face Mesh portado a PyTorch) ni posibles obligaciones adicionales derivadas de esa cadena de procedencia. Conviene verificarlo antes de un uso comercial.
- Fuerte acoplamiento al runtime: los ficheros estan construidos para ExecuTorch v1.4.1 y sin garantia de compatibilidad hacia delante. Un cambio de version del runtime puede romper la carga del modelo.
- Repositorio con 0 descargas y 0 likes y actualizado por ultima vez el mismo dia de su creacion, lo que apunta a un artefacto recien publicado y con poca validacion externa por parte de la comunidad.
- El tamano reportado por HuggingFace es 0,0 GB mientras que los ficheros suman varios megabytes; conviene comprobar la integridad de la descarga.
- Uso en aplicaciones de biometria o vigilancia: aunque tecnicamente sea posible, implica tratamiento de datos biometricos y obligaciones legales (RGPD en la UE) que el modelo no resuelve por si mismo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/software-mansion/react-native-executorch-facemesh
- Libreria React Native ExecuTorch (npm): https://www.npmjs.com/package/react-native-executorch
- Documentacion de descarga de modelos: https://docs.swmansion.com/react-native-executorch/docs/fundamentals/downloading-models
- Nota de compatibilidad del runtime ExecuTorch: https://github.com/pytorch/executorch/blob/main/runtime/COMPATIBILITY.md
- Modelo upstream en PyTorch (MediaPipe Face Mesh portado): https://github.com/tiqq111/mediapipe_pytorch
- Detector facial complementario (blazeface) en la misma coleccion: https://huggingface.co/software-mansion/react-native-executorch-blazeface

Nota: la busqueda web realizada no ha devuelto enlaces adicionales relevantes sobre este modelo; los resultados obtenidos eran paginas genericas sobre descarga de software y no guardan relacion con el artefacto.
