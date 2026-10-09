# hydravision/yolo26m-person

## Resumen

YOLO26m-person es un detector de objetos derivado de la familia YOLO26, publicado por el usuario hydravision en HuggingFace bajo el identificador hydravision/yolo26m-person. Se trata de un ajuste especializado del modelo YOLO26m (variante "medium" de la familia) entrenado de forma exclusiva para la deteccion y el rastreo de personas, con una unica clase de salida (ID 0). El autor lo presenta como parte del ecosistema HydraVMS y HydraForge, orientado a videovigilancia y analitica de video.

El problema que resuelve es acotado pero frecuente: en lugar de un detector generico de 80 clases, ofrece un cabezal monoclaso optimizado para personas, lo que simplifica el postprocesado y el rastreo en pipelines de video. Segun la model card, el entrenamiento se realizo sobre un dataset propio denominado Person_Reinforcement_Batch, con entrada de 640x640 y objetivo de despliegue en FP16 sobre TensorRT.

La relevancia actual del modelo depende de dos factores: la familia YOLO26 de Ultralytics introduce un diseno de doble cabezal con inferencia end-to-end sin NMS, y este repositorio concreto se publica con licencia MIT. Hay que senalar que el repositorio figura con un tamano de 0.0 GB, cero descargas y cero "likes" en la informacion disponible, por lo que no se puede confirmar que los pesos esten efectivamente subidos ni que el modelo haya sido validado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26m (detector de objetos en tiempo real, familia Ultralytics YOLO26) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision); resolucion de entrada declarada: 640x640 |
| Tipos de cuantizacion | FP16 y motor TensorRT declarados por el autor; no se documentan otros formatos |
| Idiomas soportados | no disponible (no aplica a un detector de objetos) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio figura con 0.0 GB de tamano) |

Datos adicionales declarados en la model card: clase unica (persona, ID 0), dataset de entrenamiento Person_Reinforcement_Batch, precision objetivo FP16 / TensorRT Engine en RTX 5090 con CUDA 13.3, y compatibilidad con HydraVMS y HydraForge.

## Arquitectura y entrenamiento

El modelo se basa en YOLO26m, la variante de tamano medio de la familia YOLO26 de Ultralytics. Segun la documentacion y el articulo tecnico de la familia, YOLO26 emplea un diseno de doble cabezal orientado a inferencia end-to-end sin NMS (supresion no maxima) y elimina el modulo DFL (Distribution Focal Loss), lo que da lugar a un cabezal mas ligero y con un rango de regresion sin restricciones. Es una arquitectura convolucional de deteccion en tiempo real, no un transformer ni un modelo hibrido.

Sobre el entrenamiento especifico de esta variante, la informacion disponible es minima: el autor indica un dataset propio llamado Person_Reinforcement_Batch y un "reinforcement" de la clase persona, pero no publica el numero de imagenes, la composicion del dataset, el numero de tokens o epocas, ni si se aplicaron tecnicas de aumento de datos, destilacion o ajuste fino adicional. Tampoco se documenta si hubo un proceso de anotacion propio ni como se valido el modelo. No se han publicado detalles sobre el proceso de entrenamiento mas alla de lo citado.

## Capacidades

- Deteccion de objetos de clase unica: unicamente la clase persona (ID 0). No detecta el resto de categorias de un detector generico COCO.
- Deteccion en tiempo real: la familia YOLO26 esta disenada para inferencia de baja latencia, y el autor declara un motor TensorRT en FP16.
- Rastreo de personas: la model card menciona explicitamente deteccion y rastreo, si bien no detalla el algoritmo de tracking integrado ni si el modelo lo incorpora o si este se resuelve en la capa de aplicacion (por ejemplo, en HydraVMS).
- Integracion en pipeline de video: el autor declara compatibilidad con el ecosistema HydraVMS y HydraForge.
- Inferencia end-to-end sin NMS: capacidad heredada del diseno de la familia YOLO26, que traslada el filtrado de cajas al propio grafo del modelo.
- Tool calling / function calling: no disponible (no aplica).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingues: no disponible (no aplica).
- Modo "thinking", vision multimodal generativa o audio: no disponible (no aplica; es un modelo discriminativo de vision, no generativo).

## Casos de uso

- Videovigilancia en tiempo real: el modelo puede procesar flujos de camara IP a 640x640 y emitir cajas de persona por fotograma, lo que permite desplegarlo como etapa de deteccion en un VMS. El cabezal monoclaso reduce el postprocesado frente a un detector de 80 clases.
- Conteo de aforo y analitica de ocupacion: combinado con un tracker externo, las detecciones por fotograma se pueden cruzar entre frames para estimar el numero de personas presentes en una sala o recinto.
- Control de accesos y zonas restringidas: dibujando poligonos de interes sobre el frame, cualquier deteccion de persona dentro del poligono puede disparar una alerta o un evento en el sistema de gestion.
- Analisis de flujos peatonales y mapas de calor: acumulando detecciones en el tiempo se pueden generar mapas de densidad y trayectos predominantes en comercios, estaciones o eventos.
- Preprocesado para pipelines de analitica de mayor nivel: al aislar a las personas, el detector sirve como etapa de recorte (cropping) para alimentar despues modelos de reconocimiento de pose, reidentificacion o lectura de equipos de proteccion individual.
- Estimacion de distancias sociales o aglomeraciones: la deteccion de personas con su caja delimitadora permite calcular distancias aproximadas en el plano de imagen para alertas de densidad.
- Automatizacion de conteo en transporte publico: conteo de subidas y bajadas por puerta a partir de detecciones cruzando la linea de umbral del acceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de hydravision/yolo26m-person no incluye metricas de mAP, precision, recall ni comparaciones con otros detectores, y tampoco ofrece curvas de entrenamiento ni resultados de validacion. El autor solo menciona una precision objetivo en FP16 y TensorRT, sin cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El autor no publica requisitos de memoria; solo indica que el objetivo es FP16 / TensorRT.
- GPU recomendada por el autor: RTX 5090 con CUDA 13.3 (entorno declarado para la exportacion a TensorRT).
- Encaje en GPU de consumo: previsiblemente si, dado que se trata de la variante "medium" de una familia de deteccion en tiempo real disenada para despliegue en el borde, pero no hay confirmacion del autor ni cifras de memoria publicadas.
- Opciones de despliegue: TensorRT (declarado por el autor). Otras alternativas habituales de la familia YOLO26, como ONNX Runtime, OpenVINO, formato nativo Ultralytics o ejecucion en CPU, no estan documentadas para este repositorio concreto.
- Latencia y throughput estimados: no disponible.
- Nota: el repositorio figura con un tamano de 0.0 GB y cero descargas, por lo que no se puede verificar la presencia de pesos utilizables.

## Comparativa con modelos similares

| Modelo | Arquitectura | Clases | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hydravision/yolo26m-person | YOLO26m (ajuste monoclaso) | 1 (persona) | 640x640 | MIT (segun el autor) | Repositorio HuggingFace con 0.0 GB y 0 descargas |
| Ultralytics/YOLO26 | Familia YOLO26 (n, s, m, l, x) | 80 (COCO) | no disponible en la informacion recogida | AGPL-3.0 en la distribucion oficial de Ultralytics | Publico en HuggingFace y Ultralytics Platform |
| YOLO26m Pose (Dhyaa Feriska) | YOLO26m para estimacion de pose | Clase persona con puntos clave | no disponible en la informacion recogida | no disponible | Publico en Ultralytics Platform |
| Detectores genericos tipo YOLOv8/YOLO11 | CNN de deteccion en tiempo real | 80 (COCO) | no disponible en la informacion recogida | AGPL-3.0 en la distribucion oficial | Ampliamente disponible |

No se dispone de datos de rendimiento comparado (mAP, latencia) para ninguno de los modelos de la tabla en la informacion proporcionada, por lo que la comparativa se limita a arquitectura, clases, licencia y disponibilidad.

## Limitaciones y advertencias

- Ambito de deteccion restringido: solo detecta personas. Cualquier otro objeto relevante para una escena (vehiculos, animales, equipamiento) queda fuera y requiere un modelo adicional.
- Ausencia de metricas: no hay mAP, precision, recall ni resultados de validacion publicados, lo que impide estimar la calidad real del detector.
- Repositorio aparentemente vacio: con 0.0 GB de tamano, 0 descargas y 0 "likes", no se puede confirmar que los pesos esten disponibles ni que el modelo sea funcional. Antes de integrarlo en produccion hay que verificar los ficheros del repositorio.
- Discrepancia de licencia: el autor declara MIT, pero la familia YOLO26 de Ultralytics se distribuye habitualmente bajo AGPL-3.0. Si el modelo deriva de pesos o codigo de Ultralytics, la licencia MIT podria no ser aplicable y el uso comercial requeriria revisar la licencia de Ultralytics o una licencia enterprise.
- Model card en portugues: la documentacion esta redactada en portugues, no en castellano ni en ingles, y varios pasajes tienen texto incompleto o caracteres eliminados, lo que dificulta la trazabilidad de algunos detalles.
- Dataset no auditable: el dataset Person_Reinforcement_Batch no es publico ni esta descrito, por lo que no se conocen sus condiciones de recogida, la distribucion demografica de las personas anotadas ni posibles sesgos de genero, tono de piel, edad o condiciones de iluminacion.
- Riesgo de sesgo en vision artificial: los detectores de personas entrenados con datos no auditados tienden a degradar su rendimiento en escenas nocturnas, con oclusion, con grupos densos o con determinados grupos demograficos. No hay datos para descartarlo en este caso.
- Fuentes de datos dudosas: la fecha de creacion que figura en el repositorio (2026) y el numero de version del articulo de la familia YOLO26 dificultan la verificacion cronologica del material. Conviene contrastar con la documentacion oficial de Ultralytics antes de tomar decisiones.
- Sin garantia de mantenimiento: no hay historial de versiones, incidencias ni soporte documentado por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hydravision/yolo26m-person
- Familia YOLO26 de Ultralytics en HuggingFace: https://huggingface.co/Ultralytics/YOLO26
- Documentacion oficial de Ultralytics YOLO26: https://docs.ultralytics.com/models/yolo26
- Modelo YOLO26m en Ultralytics Platform (Myra): https://platform.ultralytics.com/myra/yolo26/yolo26m
- Modelo YOLO26m Pose en Ultralytics Platform (Dhyaa Feriska): https://platform.ultralytics.com/dhyaa-feriska/yolo26/yolo26m-pose
- Articulo tecnico de Ultralytics YOLO26: https://arxiv.org/html/2606.03748v1
- Repositorio o documentacion de HydraVMS: no disponible
- Repositorio o documentacion de HydraForge: no disponible
- Dataset Person_Reinforcement_Batch: no disponible
