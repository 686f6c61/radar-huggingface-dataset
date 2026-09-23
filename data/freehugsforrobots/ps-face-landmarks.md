# FreeHugsForRobots/ps-face-landmarks

## Resumen

ps-face-landmarks es un repositorio de HuggingFace publicado por el usuario FreeHugsForRobots que contiene un unico artefacto: `face_landmarks_detector.onnx`, un modelo de deteccion de puntos faciales (face landmarks) de 478 puntos. No se trata de un modelo de lenguaje: es un modelo de vision por computador orientado a la inferencia local de geometria facial, empaquetado en formato ONNX. El propio autor indica que es un componente interno de la aplicacion de escritorio DepthField Photo, concretamente el modulo que alimenta la funcion Smooth Skin (suavizado de piel) para excluir ojos, cejas y labios de la mascara de suavizado.

El modelo no es original del autor. Segun la model card, se trata de una conversion a ONNX del modelo Face Mesh / Face Landmarker de MediaPipe, cuyo autor original es Google y cuyo codigo fuente esta en el repositorio google-ai-edge/mediapipe. La unica modificacion declarada es la conversion de TFLite a ONNX. La licencia resultante es Apache 2.0, heredada del proyecto original.

Su relevancia practica es acotada pero clara: ofrece una alternativa de inferencia 100 % local (sin llamadas a servicios en la nube) para deteccion de landmarks faciales en aplicaciones de escritorio, con una licencia permisiva para uso comercial. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0,0 GB (es decir, por debajo del umbral de redondeo de la interfaz, lo que implica un artefacto muy ligero).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de deteccion de landmarks faciales (MediaPipe Face Mesh / Face Landmarker, 478 puntos); topologia concreta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no generativo) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica el artefacto ONNX) |
| Idiomas soportados | no aplica (modelo de vision; no procesa texto) |
| Licencia | Apache License 2.0 |
| Formato de pesos | ONNX (`face_landmarks_detector.onnx`) |

## Arquitectura y entrenamiento

No hay informacion en la model card sobre la arquitectura interna, el numero de parametros, la composicion del dataset de entrenamiento ni el procedimiento de optimizacion del modelo. Lo unico documentado es su origen: es el modelo MediaPipe Face Mesh / Face Landmarker de Google, que predice una malla facial de 478 puntos, convertido de TFLite a ONNX sin cambios funcionales declarados. Cualquier detalle de entrenamiento (dataset, perdidas, regularizacion, tecnicas de destilado o cuantizacion del modelo original) debe consultarse en la documentacion del proyecto MediaPipe, no en este repositorio.

La innovacion tecnica atribuible a este repositorio es exclusivamente de empaquetado: la conversion a ONNX permite ejecutar el detector fuera del runtime TFLite de MediaPipe, por ejemplo con ONNX Runtime, y por tanto integrarlo en pipelines de escritorio o servidor ya estandarizados sobre ONNX. No se declaran optimizaciones adicionales, cambios de precision ni reentrenamiento.

## Capacidades

- Deteccion de landmarks faciales: predice una malla de 478 puntos sobre un rostro, segun la especificacion de MediaPipe Face Mesh / Face Landmarker.
- Inferencia local: el modelo esta pensado para ejecutarse en el propio dispositivo, sin depender de APIs externas, tal como indica la model card al describirlo como "local face-landmark detection".
- Segmentacion funcional de regiones faciales: el caso de uso declarado implica distinguir ojos, cejas y labios del resto del rostro, lo que permite construir mascaras de exclusión en postprocesado.
- Integracion en aplicaciones de escritorio: al ser ONNX, se puede cargar desde runtimes compatibles dentro de una app nativa.
- No soporta generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni capacidades multilingues: no es un modelo de lenguaje.
- Vision: limitada a landmarks faciales; no se documentan capacidades de deteccion de objetos genericos, segmentacion semantica completa, OCR ni analisis de emociones.
- No se documenta soporte de audio, video, thinking mode ni modos de razonamiento.

## Casos de uso

- Retoque de piel en aplicaciones de fotografia: es el caso de uso real declarado. El modelo entrega las coordenadas de ojos, cejas y labios para que la funcion Smooth Skin los excluya de la mascara de suavizado y no difumine rasgos que deben permanecer nitidos.
- Filtros y efectos de belleza en tiempo real: al ejecutarse localmente, permite aplicar suavizado, blanqueamiento dental o intensificacion de pestanas sin subir la imagen a un servidor, lo que simplifica el cumplimiento de RGPD al no tratar datos biometricos fuera del dispositivo.
- Prueba virtual de gafas, sombreros o maquillaje: los 478 puntos permiten anclar accesorios a la geometria del rostro para previsualizacion en comercio electronico, con inferencia en el navegador o en el cliente.
- Animacion de avatares y motion capture facial: los landmarks pueden mapearse a blendshapes o a un rig de avatar para videollamadas, streaming o videojuegos, manteniendo la captura en el dispositivo.
- Analisis de atencion y seguimiento ocular aproximado: la posicion de los puntos oculares permite estimar la direccion de la mirada en estudios de usabilidad, siempre como estimacion aproximada y no como eye tracking calibrado.
- Control de calidad en pipelines de imagen: verificacion automatica de que un rostro esta correctamente encuadrado, alineado y sin oclusiones antes de enviarlo a un proceso posterior (reconocimiento, catalogacion, impresion).
- Edicion por lotes de fotografia de estudio: uso del detector para alinear y recortar retratos de forma consistente en flujos de trabajo con cientos de imagenes.
- Aplicaciones de accesibilidad: control de cursor o de interfaces mediante movimientos de cabeza y cejas para personas con movilidad reducida, usando los puntos faciales como senal de entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de error de landmarks (NME), latencia, throughput ni comparaciones cuantitativas con otros detectores. El repositorio registra 0 descargas y 0 likes, por lo que tampoco existen evaluaciones de terceros asociadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El tamano del repositorio se reporta como 0,0 GB, lo que implica un artefacto por debajo del umbral de redondeo de HuggingFace (inferior a 50 MB aproximadamente) y, por tanto, un modelo muy ligero.
- GPU recomendadas: no disponible. No se documentan requisitos de GPU para este artefacto concreto.
- Compatibilidad con GPU de consumo: no disponible. Dado el tamano declarado del repositorio, es plausible que el modelo quepa en cualquier GPU de consumo, pero esto no esta confirmado por el autor y debe verificarse empiricamente.
- Opciones de despliegue: ONNX Runtime es el runtime natural del formato publicado. El modelo original del que deriva se distribuye en el ecosistema MediaPipe, cuyo runtime se basa en TFLite; no se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, que no son aplicables a un modelo de vision no generativo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Puntos faciales | Licencia | Formato | Datos de rendimiento |
|---|---|---|---|---|---|
| ps-face-landmarks (este repositorio) | Conversion a ONNX de MediaPipe Face Mesh | 478 | Apache 2.0 | ONNX | no disponible |
| MediaPipe Face Mesh / Face Landmarker (Google) | Modelo original | 478 | Apache 2.0 | TFLite | no disponible en la informacion proporcionada |
| Alternativas de la misma categoria (por ejemplo, detectores de landmarks de 68 puntos tipo dlib, o detectores basados en CNN como los de la familia RetinaFace) | Detectores de landmarks faciales | 68 o variable | variable segun proyecto | variable | no disponible |

No se dispone de datos comparativos de precision, latencia o consumo entre estas opciones dentro de la informacion proporcionada; la comparacion se limita a caracteristicas estructurales y de licencia.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo generativo: cualquier expectativa de generacion de texto, razonamiento o tool calling es inaplicable.
- Ausencia total de documentacion tecnica: no se publican parametros, arquitectura, dataset, metricas ni requisitos de hardware, lo que dificulta una evaluacion rigurosa antes de integrarlo en produccion.
- Riesgo de sesgo heredado: al derivar directamente del modelo Face Mesh de Google, hereda los sesgos de su dataset de entrenamiento original, no documentados en este repositorio. Es esperable un rendimiento desigual segun tono de piel, edad, presencia de gafas, vello facial u oclusiones, pero no hay datos en la informacion disponible que lo cuantifiquen.
- Rendimiento en rostros no frontales o parcialmente ocluidos: no documentado. Los detectores de landmarks faciales suelen degradarse con perfiles extremos, iluminacion dura o rostros pequenos en el encuadre.
- Datos biometricos: los landmarks faciales pueden considerarse datos personales y, en el contexto del RGPD, potencialmente datos biometricos si se usan para identificar de forma unica a una persona. El tratamiento local reduce el riesgo de transferencia internacional, pero no elimina las obligaciones de base juridica, informacion y minimizacion.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de copyright y la atribucion a Google y a MediaPipe. La model card especifica que se distribuye "AS IS", sin garantias de ningun tipo.
- Trazabilidad de la conversion: el autor declara la conversion TFLite a ONNX pero no publica el script de conversion ni la version exacta del modelo original, lo que complica reproducir el artefacto o auditarlo.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta implican ausencia de validacion por parte de la comunidad y mayor riesgo de errores no detectados.
- Fecha de creacion inusual: el repositorio figura como creado el 2026-06-10 y actualizado el 2026-09-22, fechas posteriores a la mayoria de referencias publicas de MediaPipe; conviene verificar la coherencia de estos metadatos.
- Los resultados de busqueda web asociados a esta consulta no contienen informacion tecnica relevante sobre el modelo (devuelven foros no relacionados), por lo que no ha sido posible contrastar ni ampliar los datos de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FreeHugsForRobots/ps-face-landmarks
- Proyecto original MediaPipe (Google): https://github.com/google-ai-edge/mediapipe
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Paper, blog, demo o repositorio propio del autor: no disponible
