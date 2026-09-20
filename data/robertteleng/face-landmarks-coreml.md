# robertteleng/face-landmarks-coreml

## Resumen

FaceLandmarks · CoreML es un paquete de CoreML (`.mlpackage`) que redistribuye el modelo de deteccion de puntos de referencia faciales de MediaPipe, convertido para ejecutarse en el Apple Neural Engine dentro de aplicaciones iOS. Lo publica el usuario robertteleng y no constituye un modelo nuevo: es una conversion de formato, sin reentrenamiento ni ajuste fino, de los pesos de `google/mediapipe-face-landmark`, alcanzados a traves de MediaPipePyTorch.

El problema que resuelve es de integracion: disponer de la malla facial de MediaPipe como un `.mlpackage` que el Neural Engine acepte, de forma que pueda incorporarse a un proyecto de Xcode sin depender de TensorFlow Lite ni de conversiones manuales. La conversion se realizo con la herramienta `robertteleng/coreml-forge`, mediante el script `scripts/export_face_landmarks.py`.

Es relevante porque buena parte del procesamiento de vision en iOS se delega al Neural Engine por latencia, consumo y privacidad (la imagen no sale del dispositivo). Se distribuye bajo licencia Apache-2.0, heredada del modelo original. El autor no publica cifras de latencia ni de precision, ni documenta el numero de parametros, la topologia interna o el dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el autor solo indica que es una conversion a CoreML del modelo de landmarks faciales de MediaPipe; no documenta la topologia interna) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; procesa imagenes, no secuencias de texto) |
| Tipos de cuantizacion | no disponible; se distribuye un unico `.mlpackage` y el autor no detalla cuantizacion (CoreML puede aplicar precision mixta al compilar) |
| Idiomas soportados | no aplica / no disponible (no procesa lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | CoreML `.mlpackage` (`FaceLandmarks.mlpackage`) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado por el autor, sino de una conversion de formato. Los pesos proceden del modelo de landmarks faciales de MediaPipe, accedidos a traves de MediaPipePyTorch, y no se realizo ningun reentrenamiento ni ajuste fino: la precision es, por tanto, la del modelo original. El valor anadido declarado es el propio proceso de conversion, es decir, conseguir que el grafo se trace de forma limpia y produzca un `.mlpackage` que el Neural Engine acepte.

El autor no documenta la composicion del dataset de entrenamiento, el numero de tokens o imagenes vistas, el numero de puntos faciales que emite el modelo ni si hubo etapas de ajuste (no aplica RLHF ni DPO, al no ser un modelo de lenguaje). Tampoco se especifica la arquitectura interna de la red (tipo de capas, resolucion de entrada o si incorpora etapas de deteccion y refinamiento). La unica informacion tecnica adicional es el objetivo de despliegue: el paquete se genero para un target reciente de iOS, por lo que targets mas antiguos pueden requerir una reexportacion.

## Capacidades

- Deteccion de puntos de referencia faciales sobre imagenes o fotogramas de camara, con inferencia en el dispositivo.
- Ejecucion sobre el Apple Neural Engine, con posibilidad de usar GPU o CPU segun la configuracion de CoreML (`computeUnits`).
- Integracion directa en proyectos de Xcode como `.mlpackage`, sin pasos intermedios de TensorFlow Lite.
- Procesamiento local: la imagen o el fotograma no necesita enviarse a un servidor.
- Inferencia por fotograma, adecuada para flujos de video en tiempo real si el dispositivo lo permite (sin cifras publicadas).
- No genera texto, no razona, no realiza tool calling ni function calling, no soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues.
- No es un modelo de vision general: no hace descripcion de imagenes, OCR ni clasificacion de escenas; su unica funcion es la localizacion de landmarks faciales.

## Casos de uso

- Efectos de realidad aumentada en aplicaciones iOS: el modelo proporciona la posicion de los puntos faciales por fotograma para anclar mascarillas, gafas o maquillaje virtual, con inferencia local que evita enviar video a un servidor.
- Avatares y animacion facial: los landmarks alimentan el rig de un avatar para replicar expresiones y orientacion de la cabeza en tiempo real, util en apps de mensajeria o retransmision.
- Verificacion de presencia (liveness) en procesos de alta: se puede usar la geometria facial para comprobar parpadeos, apertura de boca u orientacion de la cabeza como prueba de que hay una persona real delante de la camara; requiere logica adicional, ya que el modelo no incorpora deteccion de ataques de suplantacion.
- Analisis de atencion y fatiga: en investigacion de UX o en cabinas de conduccion, la frecuencia de parpadeo o la direccion de la mirada derivadas de los landmarks sirven como senales aproximadas; el modelo no mide atencion por si mismo.
- Accesibilidad: control de interfaces mediante gestos faciales (guiños, apertura de boca) para usuarios con movilidad reducida, aprovechando que el calculo ocurre en el dispositivo y con baja dependencia de red.
- Edicion fotografica automatica: alineacion, recorte y retoque facial en apps de fotografia sin subir la imagen a la nube, usando los landmarks para situar el encuadre o aplicar deformaciones locales.
- Seguimiento en telemedicina o rehabilitacion: monitorizacion de asimetrias faciales o de movilidad en terapias de paralisis facial, siempre como herramienta de apoyo y con validacion clinica previa, que no esta documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El propio autor indica que el modelo no se ha medido en dispositivo y que no se publican cifras de latencia ni de precision junto al repositorio.

## Requisitos de hardware

- No requiere VRAM de GPU dedicada: esta pensado para el Neural Engine y la memoria unificada de los dispositivos Apple.
- Compatible con dispositivos Apple que dispongan de Neural Engine; el autor no especifica la lista exacta de modelos ni la version minima de iOS, solo que el paquete se genero para un target reciente de iOS (los targets antiguos pueden necesitar reexportacion).
- Ejecucion posible tambien en CPU o GPU mediante las opciones de CoreML, con la penalizacion de latencia y consumo que ello implique.
- Despliegue: integracion en Xcode como `.mlpackage`; para reexportar o modificar el grafo, Core ML Tools y la herramienta `robertteleng/coreml-forge`. No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles (el autor no publica mediciones en dispositivo).
- Advertencia de empaquetado: el repositorio declara un tamano de 0,0 GB, por lo que conviene verificar que el `.mlpackage` esta realmente presente y completo antes de integrarlo.

## Comparativa con modelos similares

| Modelo | Formato | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|
| robertteleng/face-landmarks-coreml | CoreML `.mlpackage` | Conversion sin reentrenamiento de los pesos de MediaPipe | Apache-2.0 | HuggingFace (0 descargas, 0 likes en la fecha de los datos) |
| google/mediapipe-face-landmark (modelo base) | TensorFlow Lite (formato original de MediaPipe) | Entrenado por Google; dataset no disponible en esta informacion | Apache-2.0 | Distribuido con MediaPipe |
| MediaPipePyTorch (vidursatija) | Pesos PyTorch | Reproduce los pesos de MediaPipe para uso en PyTorch | no disponible | GitHub |
| Apple Vision (deteccion de landmarks faciales del sistema) | API nativa del sistema | Entrenado por Apple; datos no publicos | Propietaria, incluida en el sistema operativo | Integrada en iOS/macOS |

No se dispone de datos de precision ni de latencia para ninguno de los modelos comparados en la informacion proporcionada, por lo que la comparacion se limita a formato, licencia y via de distribucion.

## Limitaciones y advertencias

- No esta medido en dispositivo: no hay cifras publicadas de latencia ni de precision.
- Hereda los sesgos y modos de fallo del modelo original de MediaPipe, incluido un rendimiento desigual segun el tono de piel y en condiciones de oclusion (manos, mascarillas, gafas, iluminacion pobre).
- Al no haber reentrenamiento ni ajuste fino, la precision es exactamente la del modelo de origen; esta conversion no la mejora.
- La conversion se hizo para un target reciente de iOS; proyectos con targets mas antiguos pueden necesitar reexportacion.
- El repositorio figura con 0,0 GB de tamano: verificar la integridad y presencia del `.mlpackage` antes de usarlo en produccion.
- La licencia Apache-2.0 permite uso comercial, pero exige mantener la atribucion a Google (MediaPipe) y a los autores de MediaPipePyTorch; este repositorio solo redistribuye un formato convertido.
- No es adecuado por si solo para verificacion de identidad ni para decisiones de alto riesgo: no incorpora deteccion de ataques de suplantacion ni garantias de robustez.
- No procesa texto ni lenguaje: no tiene capacidades de generacion, razonamiento, codigo, tool calling ni agentes.
- No hay informacion sobre el dataset de entrenamiento, el numero de parametros ni el numero de puntos faciales que emite el modelo, lo que dificulta estimar su idoneidad para casos exigentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/robertteleng/face-landmarks-coreml
- Herramienta de conversion (coreml-forge): https://github.com/robertteleng/coreml-forge
- MediaPipePyTorch: https://github.com/vidursatija/MediaPipePyTorch
- Modelo base declarado en los metadatos: google/mediapipe-face-landmark
- La busqueda web realizada no devolvio resultados relevantes para este modelo (unicamente listados de hoteles sin relacion con la consulta).
