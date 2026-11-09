# Seemorgh/yolo11n-aod4-v7-small-targets

## Resumen

YOLO11n-aod4-v7-small-targets es un checkpoint de deteccion de objetos basado en la arquitectura YOLO11n (la variante "nano" de Ultralytics) afinado por el usuario Seemorgh para la deteccion de objetivos aereos de pequeno tamano. El modelo parte del checkpoint `best.pt` de `Seemorgh/yolo11n-aod4-v6` y se especializa en cuatro clases: `airplane`, `bird`, `drone` y `helicopter`. Su proposito es mejorar la deteccion de objetos pequenos en imagenes aereas captadas desde drones, un escenario donde los detectores genericos rinden por debajo de lo deseable.

La relevancia de esta version radica en el salto de rendimiento reportado sobre el conjunto de validacion Purdue: la tasa de acierto end-to-end en primera eleccion pasa del 12,6 % (v6) al 59,4 % (v7), y el recall tolerante de candidatos del 34 % al 80,5 %, con un intervalo de confianza del 95 % para la mejora de +40,8 a +53,6 puntos porcentuales. Al mismo tiempo, el rendimiento en el benchmark AOD4 se mantiene practicamente identico (AP50 de 0,960 en ambas versiones).

El repositorio tiene un tamano de 0,0 GB y no registra descargas ni likes en el momento de la consulta. La model card es inusualmente detallada en cuanto a protocolo de entrenamiento, gates de validacion y trazabilidad de reproduccion, lo que facilita la auditoria tecnica del resultado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n (Ultralytics), detector de objetos de una etapa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | AGPL-3.0 (pesos), segun requisito de Ultralytics |
| Formato de pesos | no disponible (la model card menciona `best.pt`, formato PyTorch de Ultralytics) |

## Arquitectura y entrenamiento

El modelo es un detector YOLO11n, la variante mas pequena de la familia YOLO11 de Ultralytics, disenada para inferencia en tiempo real con bajo coste computacional. Se trata de un detector de una etapa con backbone convolucional y cabecera de prediccion densa, sin mecanismos de atencion ni componentes MoE. El checkpoint se obtuvo por fine-tuning sobre el `best.pt` del modelo padre v6 (SHA-256 `2ebf2e1f5a36c8df0cc44664c35596aecbd25f762bed9f9edc25ae1bb08eae5b`).

El conjunto de entrenamiento consta de 12.000 imagenes: 1.803 tiles de 640 px del dataset Purdue UAV (procedentes de 8 clips de calibracion) y 10.197 imagenes de entrenamiento de AOD4 v6. La validacion emplea 562 imagenes: 281 tiles Purdue de 2 clips reservados y 281 imagenes de validacion de AOD4. Los hiperparametros incluyen `freeze=10` (congelado de las 10 primeras capas), SGD con `lr0=0.001` y `lrf=0.1`, 30 epocas, checkpoint optimo en la epoca 20, semilla 0 y Ultralytics 8.4.87. No se reporta uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un detector de objetos.

La innovacion principal no es arquitectonica sino metodologica: el autor documenta gates de validacion explicitos (mejora en Purdue y no regresion en AOD4) y descarta una version previa (C1) que fallo el gate de AP50-95 en AOD4 (0,628). El modelo incluye un directorio `reproduce/` con registros de ejecucion, manifiestos, recibos y resultados de evaluacion.

## Capacidades

- Deteccion de objetos en imagenes aereas en cuatro clases: `airplane`, `bird`, `drone` y `helicopter`.
- Especializacion en objetivos de pequeno tamano, con mejora sustancial en recall tolerante (80,5 % en Purdue) frente al modelo padre.
- Inferencia en tiempo real gracias a la variante nano de YOLO11, adecuada para despliegue en dispositivos con recursos limitados.
- Capacidad de deteccion en escenarios con distractores como nubes y terreno (documentado en el conjunto Purdue).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente perceptivo.
- No dispone de capacidades multilingues ni de generacion de texto.
- No se documentan modos especiales como thinking mode, vision-language, audio ni similares.

## Casos de uso

- Vigilancia de espacio aereo con drones: el modelo puede detectar aviones, helicopteros, drones y aves en imagenes captadas por camaras de UAV, aprovechando la mejora de recall en objetivos pequenos para alertar sobre intrusiones.
- Monitorizacion de fauna avicola en entornos aeroportuarios: la clase `bird` permite identificar aves en pistas y zonas de aproximacion, contribuyendo a la gestion del riesgo de colision (bird strike).
- Seguridad perimetral en instalaciones criticas: integrado en un pipeline de video en tiempo real, detecta drones no autorizados en el espacio aereo proximo a infraestructuras sensibles.
- Gestion de trafico aereo de baja altitud (UTM): el modelo puede alimentar sistemas de seguimiento de aeronaves no tripuladas en entornos urbanos o rurales, con inferencia de baja latencia gracias a la arquitectura nano.
- Analisis forense de grabaciones aereas: procesamiento por lotes de clips de drone para inventariar objetos aereos presentes, aprovechando la ventana de entrenamiento sobre tiles de 640 px.
- Investigacion en deteccion de objetos pequenos: el modelo sirve como baseline reproducible (con directorio `reproduce/`) para experimentos academicos sobre fine-tuning de detectores en dominios aereos.
- Despliegue en plataformas de borde: al ser YOLO11n, es viable en GPUs de consumo y dispositivos embebidos, lo que permite ejecutar deteccion a bordo del propio drone sin depender de conectividad.

## Benchmarks y rendimiento

| Metrica | Parent v6 | v7 |
| --- | ---: | ---: |
| Purdue first-pick end-to-end | 12,6 % | 59,4 % |
| Purdue tolerant candidate recall | 34 % | 80,5 % |
| AOD4 macro AP50 | 0,960 | 0,960 |
| AOD4 macro AP50-95 | 0,662 | 0,655 |

La mejora en Purdue tiene un intervalo de confianza del 95 % de +40,8 a +53,6 puntos porcentuales. El autor senala que el paso del gate AOD4 AP50-95 es estrecho: 0,655 frente a un umbral de 0,652. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un detector de objetos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por la variante YOLO11n (nano), la huella es reducida y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no disponibles en la informacion proporcionada; por el perfil del modelo, una RTX 4090 o incluso GPUs de gama media son suficientes para inferencia en tiempo real.
- Cabe en GPU de consumo: si, al tratarse de la variante nano de YOLO11; no se especifican modelos concretos.
- Opciones de despliegue: no disponibles en la informacion proporcionada; el ecosistema Ultralytics soporta exportacion a formatos como ONNX, TensorRT y OpenVINO, aunque la model card no lo detalla.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO11n-aod4-v7-small-targets | no disponible | no aplica | Purdue first-pick 59,4 %; AOD4 AP50 0,960 | AGPL-3.0 | Hugging Face |
| Seemorgh/yolo11n-aod4-v6 (padre) | no disponible | no aplica | Purdue first-pick 12,6 %; AOD4 AP50 0,960 | AGPL-3.0 (presumible, no confirmado) | Hugging Face |
| YOLO11n base (Ultralytics) | no disponible | no aplica | no disponible | AGPL-3.0 | Ultralytics |

No se dispone de datos de benchmarks de las alternativas en la informacion proporcionada, por lo que la comparativa se limita a los datos del modelo padre y a la referencia generica a YOLO11n.

## Limitaciones y advertencias

- No es una confirmacion independiente: los ajustes de v7 se eligieron tras ver los resultados de test del primer fine-tune (C1), y ambos se evaluaron sobre los mismos conjuntos de test, lo que introduce riesgo de sobreajuste al test.
- El paso del gate AOD4 AP50-95 es muy estrecho (0,655 frente a 0,652), por lo que la no regresion en AOD4 no es robusta.
- La camara de Purdue esta montada en un drone y sus distractores son nubes y terreno, no aves; el rendimiento en escenarios con distractores avicolas reales no esta validado.
- La comprobacion de posicion de caja en Purdue fue del 72 % frente a un umbral preestablecido del 80 %, por lo que los resultados se presentan bajo tres reglas de acierto distintas.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y falsos negativos en deteccion, no cuantificado en la model card.
- Sesgos conocidos: no documentados; el entrenamiento se limita a dominios aereos especificos (Purdue UAV y AOD4), lo que puede limitar la generalizacion a otras condiciones de iluminacion, sensores o geografias.
- Licencia AGPL-3.0 impuesta por Ultralytics: el uso comercial exige cumplir con los terminos de la AGPL, lo que puede implicar obligaciones de liberacion de codigo en despliegues en red.
- El repositorio no registra descargas ni likes, y el pipeline no esta declarado; la madurez y el soporte de la comunidad son limitados.
- No se dispone de informacion sobre cuantizacion, formatos de exportacion ni latencia, lo que dificulta planificar un despliegue en produccion sin validacion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Seemorgh/yolo11n-aod4-v7-small-targets
- Modelo padre v6: https://huggingface.co/Seemorgh/yolo11n-aod4-v6
- Dataset AOD4 v6 en Roboflow Universe: https://universe.roboflow.com/airborne-object-detection/airborne-object-detection-4-aod4/dataset/6
- DOI del dataset AOD4: https://doi.org/10.17632/cd5z895tr2.1
- Pagina del dataset Purdue UAV: https://engineering.purdue.edu/~bouman/UAV_Dataset/
- Caso de estudio "Small Objects": https://mehridian.tech/projects/small-object-detection
