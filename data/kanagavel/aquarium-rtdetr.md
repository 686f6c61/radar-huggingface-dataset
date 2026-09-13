# Kanagavel/aquarium-rtdetr

## Resumen

aquarium-rtdetr es un modelo de deteccion de objetos fruto del ajuste fino (fine-tuning) de RT-DETR-L, la variante grande del detector en tiempo real RT-DETR, publicado por el usuario Kanagavel en HuggingFace. El modelo se ha entrenado sobre el dataset *Aquarium Combined* de Roboflow (licencia CC BY 4.0) para detectar siete clases de fauna acuatica y marina: pez, medusa, pinguino, frailecillo, tiburon, estrella de mar y raya.

El problema que resuelve es concreto: el censado automatico y el conteo de animales en imagenes o fotogramas de acuarios, tanques y entornos de exhibicion. Frente a detectores genericos, un modelo ajustado a estas siete clases reduce falsos positivos en escenas con agua, reflejos, turbidez y solapamiento de individuos, que son habituales en este dominio. Se distribuye como checkpoint de PyTorch para la libreria Ultralytics (version 8.3.40), lo que permite cargarlo y ejecutar inferencia con muy pocas lineas de codigo.

Es relevante ahora porque combina un detector end-to-end de arquitectura transformer (sin supresion de no maximos, NMS) con un flujo de trabajo reproducible: el autor publica el recibo de entrenamiento, las metricas, un cuaderno de entrenamiento, un servicio FastAPI y una capa de razonamiento en su repositorio de GitHub. Las cifras publicadas en el conjunto de test reservado son moderadas: mAP50 de 0.592 y mAP50-95 de 0.323, con precision 0.635 y recall 0.608.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RT-DETR-L (Real-Time DEtection TRansformer, variante Large), detector end-to-end basado en transformer sin NMS |
| Parametros totales | no disponible en la informacion proporcionada |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision); resolucion de entrada de entrenamiento: 640 px |
| Tipos de cuantizacion | no disponible; el autor no documenta cuantizaciones |
| Idiomas soportados | no aplica (deteccion de imagenes); los nombres de clase estan en ingles |
| Licencia | AGPL-3.0 |
| Formato de pesos | checkpoint de PyTorch (.pt) para Ultralytics; el repositorio ocupa 0.1 GB |
| Framework | Ultralytics 8.3.40 |
| Tarea (pipeline) | object-detection |
| Clases | 7: fish, jellyfish, penguin, puffin, shark, starfish, stingray |
| Dataset de entrenamiento | Roboflow *Aquarium Combined* (CC BY 4.0) |
| Fecha de publicacion | 13 de septiembre de 2026 (creacion y ultima actualizacion) |

## Arquitectura y entrenamiento

RT-DETR es una familia de detectores end-to-end que sustituye el clasico esquema de anclas y NMS por un decodificador transformer que predice directamente un conjunto de objetos. La variante L es la de mayor capacidad de la familia y esta disenada para inferencia en tiempo real sobre GPU. En este repositorio se distribuye un unico checkpoint ya ajustado, no los pesos preentrenados originales, por lo que no se dispone de datos sobre el backbone ni sobre la configuracion exacta del encoder mas alla de lo indicado por el autor.

El entrenamiento se realizo durante 80 epocas sobre 2 GPU NVIDIA T4 en paralelo de datos (DDP), con optimizador AdamW, tasa de aprendizaje inicial 1e-4, tamano de lote 16, imagenes a 640 px y precision mixta automatica (AMP). El autor publica un archivo `training_receipt.json` con el recibo del entrenamiento y un cuaderno con el procedimiento. No se documenta el numero de imagenes del dataset, su composicion por clase ni si se aplicaron tecnicas de aumento de datos mas alla de las por defecto del framework. Al ser un modelo de vision, no hay RLHF, DPO ni fases de alineacion.

## Capacidades

- Deteccion de objetos en imagenes: devuelve cajas delimitadoras con clase asignada y puntuacion de confianza para las siete clases entrenadas.
- Conteo de individuos: al ser un detector por instancias, permite contar cuantos animales de cada clase aparecen en una imagen o fotograma.
- Umbral de confianza configurable en inferencia (el ejemplo del autor usa `conf=0.25`).
- Inferencia por lotes y sobre fotogramas de video, heredada de la API de Ultralytics (`model.predict(...)`).
- Integracion como componente perceptivo dentro de pipelines mayores: el autor menciona en su repositorio una capa de razonamiento y un servicio FastAPI construidos sobre el modelo.
- Exportacion a otros formatos de inferencia a traves del framework Ultralytics; no confirmada por el autor en la model card.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso por si mismo.
- No tiene capacidades multilingues: es un modelo de vision sin modulo de lenguaje.
- No genera texto, no tiene modo de razonamiento (thinking) y no procesa audio ni otras modalidades.

## Casos de uso

- Censo automatizado en acuarios publicos: procesar lotes de fotografias de tanques y obtener el recuento por especie para mantener inventarios actualizados sin conteo manual, aprovechando que el modelo distingue siete clases de interes.
- Monitorizacion continua por videovigilancia: ejecutar inferencia sobre fotogramas de camaras fijas en tanques para detectar cambios en la poblacion o la aparicion de individuos no inventariados.
- Investigacion biologica marina: pre-etiquetar imagenes de transectos o de camaras subacuaticas antes de la revision manual, reduciendo el tiempo de anotacion en estudios de abundancia relativa.
- Alertas de seguridad en tanques de exhibicion: al detectar la clase `shark` u otras, el sistema puede emitir avisos cuando un animal entra en una zona restringida o cuando se producen interacciones no deseadas entre especies.
- Servicio API para aplicaciones educativas: el servicio FastAPI incluido en el repositorio del autor permite exponer la deteccion como endpoint HTTP y construir encima aplicaciones de identificacion de fauna para visitantes.
- Pre-anotacion en herramientas de etiquetado: usar el modelo como asistente para generar cajas iniciales sobre nuevos datasets del mismo dominio y corregirlas despues de forma manual.
- Analisis de calidad del agua y del comportamiento: combinado con series temporales de detecciones, permite estudiar patrones de agrupacion o desplazamiento de especies dentro de un tanque.
- Automatizacion de informes en acuarios comerciales: generar informes periodicos de presencia y abundancia por especie a partir de capturas rutinarias, con trazabilidad de las metricas del modelo.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre la particion de test reservada (`metrics.json`):

| Metrica | Valor |
|---|---|
| mAP50 | 0.592 |
| mAP50-95 | 0.323 |
| Precision | 0.635 |
| Recall | 0.608 |

El autor indica que existen metricas por clase en `metrics.json`, pero esos valores no se han incluido en la informacion disponible. No se han publicado comparaciones con otros detectores ni resultados sobre otros conjuntos de datos, por lo que no es posible contextualizar estas cifras frente a alternativas de la misma categoria.

## Requisitos de hardware

- Entrenamiento documentado: 2 GPU NVIDIA T4 (16 GB de VRAM cada una) en modo DDP, con AMP, lote 16 e imagenes de 640 px durante 80 epocas.
- VRAM de inferencia: no disponible en la informacion proporcionada. El repositorio completo ocupa 0.1 GB, lo que sugiere un checkpoint manejable para GPU de consumo, pero el autor no publica mediciones.
- GPU recomendadas: no especificadas por el autor. Por familia de modelo (detector en tiempo real de tipo Large), el escenario natural es una GPU con al menos 8-16 GB de VRAM; esta afirmacion es orientativa y no esta confirmada en la model card.
- GPU de consumo: no confirmado. No hay datos publicados sobre ejecucion en RTX 3060, RTX 4090 u otras tarjetas domesticas.
- CPU: posible en principio mediante exportacion a formatos optimizados para CPU, pero sin datos de latencia y sin confirmacion del autor.
- Opciones de despliegue: API de Python de Ultralytics (`RTDETR("best.pt").predict(...)`) y el servicio FastAPI publicado en el repositorio de GitHub. Exportaciones a ONNX, TensorRT u OpenVINO son capacidades del framework, no documentadas para este checkpoint concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de resultados comparativos publicados por el autor, por lo que la comparacion se limita a caracteristicas estructurales y no a rendimiento medido.

| Modelo | Tipo | Clases | Licencia | Rendimiento publicado |
|---|---|---|---|---|
| Kanagavel/aquarium-rtdetr | RT-DETR-L ajustado | 7 (fauna de acuario) | AGPL-3.0 | mAP50 0.592; mAP50-95 0.323 |
| RT-DETR-L preentrenado (COCO) | RT-DETR-L | 80 (COCO) | depende del repositorio de origen (no disponible aqui) | no disponible en esta busqueda |
| YOLOv8 / YOLO11 (Ultralytics) | CNN de una etapa | 80 (COCO) o ajustable | AGPL-3.0 en la distribucion de Ultralytics | no disponible en esta busqueda |
| DETR original | Transformer end-to-end | 80 (COCO) | Apache-2.0 en el repositorio original | no disponible en esta busqueda |

El punto diferencial de este modelo no es el rendimiento bruto, sino la especializacion en siete clases de fauna de acuario con un flujo de trabajo reproducible y artefactos de soporte (metricas, recibo de entrenamiento, servicio de inferencia).

## Limitaciones y advertencias

- Rendimiento moderado: un mAP50-95 de 0.323 indica localizacion imprecisa de las cajas, con solapamientos bajos respecto al umbral estricto; para conteos exactos puede requerir post-procesado o umbrales ajustados por clase.
- Precision y recall equilibrados pero no altos (0.635 y 0.608): se esperan tanto falsos positivos como falsos negativos en escenas dificiles.
- Dominio muy restringido: el modelo solo conoce siete clases y fue entrenado con imagenes de acuarios; su comportamiento fuera de ese dominio (fotografia submarina abierta, piscifactorias, especies no incluidas) no esta documentado.
- No se publican metricas por clase, por lo que no se puede saber si existe desequilibrio de rendimiento entre especies poco frecuentes (por ejemplo, `puffin` o `stingray`) y especies frecuentes como `fish`.
- No se documenta la composicion del dataset, el numero de imagenes ni posibles sesgos de captura (iluminacion, tipo de tanque, angulo de camara), lo que impide evaluar sesgos sistematicos.
- Riesgo de falsos positivos en condiciones adversas: turbidez, reflejos, burbujas, bajo contraste o solapamiento de individuos pueden degradar las detecciones. Este riesgo es una extrapolacion razonable del dominio, no una medicion publicada.
- Licencia AGPL-3.0: es una licencia copyleft fuerte. Si el modelo se utiliza para ofrecer un servicio accesible por red, la AGPL obliga a poner a disposicion de los usuarios el codigo fuente correspondiente. Esto condiciona su uso comercial en productos propietarios o en modalidades de software como servicio.
- El dataset base *Aquarium Combined* esta bajo CC BY 4.0, lo que exige atribucion si se redistribuye o se derivan obras de el.
- Sin datos de latencia, throughput ni consumo de VRAM, por lo que no se puede garantizar el cumplimiento de requisitos de tiempo real en produccion sin una validacion previa.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni de validacion independiente por terceros.
- No hay garantia de mantenimiento: el modelo se publico y actualizo el mismo dia, sin historial posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kanagavel/aquarium-rtdetr
- Repositorio de GitHub (codigo, servicio FastAPI, capa de razonamiento, memo y cuaderno de entrenamiento): https://github.com/KanagavelAK/aquarium-rtdetr
- Dataset de origen citado por el autor: Roboflow *Aquarium Combined* (CC BY 4.0); no se proporciona URL en la informacion disponible.
- No se han encontrado enlaces adicionales relevantes en la busqueda web realizada.
