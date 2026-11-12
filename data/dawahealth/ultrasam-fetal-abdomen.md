# dawahealth/ultrasam-fetal-abdomen

## Resumen

UltraSam Fetal Abdomen es un modelo de segmentacion de imagenes medicas desarrollado por Dawa Health, pensado para la segmentacion automatica del abdomen fetal en ecografias 2D. Se trata de un fine-tuning de UltraSam, que a su vez es un SAM (Segment Anything Model) con backbone ViT-b ya ajustado sobre datos de ultrasonido, y que en este caso se ha entrenado adicionalmente sobre el dataset ACOUSLIC para la tarea concreta de delimitar el abdomen fetal. El objetivo final es automatizar la medicion de la circunferencia abdominal (AC), un parametro biometrico clave en la estimacion del peso fetal y la deteccion de restricciones del crecimiento intrauterino.

El modelo forma parte de la plataforma DawaMom de salud materna, orientada a entornos clinicos con recursos limitados, donde la disponibilidad de ecografistas expertos es escasa. Su propuesta de valor es ofrecer una segmentacion fiable y reproducible que reduzca la variabilidad interobservador en la medicion de la AC. El repositorio ocupa 0,4 GB y esta publicado en Hugging Face sin pipeline declarado ni idiomas especificados, lo que sugiere un artefacto de pesos mas que un modelo de lenguaje o multimodal generativo convencional.

La relevancia actual del modelo radica en su caracter especializado: no es un modelo de proposito general, sino una herramienta de segmentacion semantica entrenada sobre un corpus acotado de ecografias fetales. Su rendimiento reportado en el conjunto de test (Dice medio de 0,9421) es el dato central para evaluar su utilidad clinica. La licencia CC BY-NC-SA 4.0 restringe el uso a fines no comerciales, lo que condiciona su adopcion en productos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAM (Segment Anything Model) con backbone ViT-b, fine-tuned para segmentacion |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | CC BY-NC-SA 4.0 (solo uso no comercial) |
| Formato de pesos | no disponible (repositorio de 0,4 GB) |

## Arquitectura y entrenamiento

El modelo se basa en la familia SAM (Segment Anything Model) con un Vision Transformer de tamano base (ViT-b) como codificador de imagen. SAM esta disenado originalmente para segmentacion promptable de proposito general; en este caso, el modelo ha pasado por dos etapas de ajuste: primero un fine-tuning de SAM sobre datos de ultrasonido que da lugar a UltraSam, y despues un segundo fine-tuning sobre el dataset ACOUSLIC para la tarea especifica de segmentacion del abdomen fetal. No se detalla en la informacion disponible el numero exacto de parametros, la resolucion de entrada ni la estrategia de prompts de segmentacion empleada.

El entrenamiento se realizo sobre el dataset ACOUSLIC, compuesto por 6.620 fotogramas de ecografia de abdomen fetal correspondientes a 300 casos y 281 sujetos. La particion train/val/test se hizo a nivel de sujeto en proporcion 70/15/15, lo que evita fuga de informacion entre pacientes y es una buena practica en validacion clinica. El conjunto de test empleado para reportar metricas consta de 945 fotogramas de 46 pacientes no vistos durante el entrenamiento. No se especifican en la informacion disponible detalles sobre aumentos de datos, funcion de perdida, hiperparametros de entrenamiento ni si hubo etapas de refinamiento adicionales.

## Capacidades

- Segmentacion semantica de imagenes: genera mascaras del abdomen fetal en fotogramas de ecografia 2D.
- Segmentacion promptable heredada de SAM: la arquitectura base admite prompts (puntos, cajas) para guiar la segmentacion, aunque la model card no detalla como se usa en esta variante.
- Medicion biometrica: la mascara producida permite calcular la circunferencia abdominal (AC) fetal, insumo para estimaciones de peso y crecimiento.
- Especializacion en dominio medico: entrenado exclusivamente sobre ultrasonido fetal, no sobre imagenes naturales.
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso; no es un modelo de lenguaje.
- No se documentan capacidades multilingues ni de vision generalista mas alla de la segmentacion entrenada.

## Casos de uso

- Medicion automatica de la circunferencia abdominal en cribado prenatal: el modelo segmenta el abdomen fetal en cada fotograma y permite derivar la AC de forma reproducible, reduciendo la variabilidad entre operadores en entornos con multiples ecografistas.
- Deteccion de restriccion del crecimiento intrauterino en entornos de bajos recursos: al automatizar la biometria, la plataforma DawaMom puede ofrecer cribado en centros donde no hay especialista en medicina fetal disponible de forma continua.
- Triaje y priorizacion en campañas de ecografia: la segmentacion rapida permite procesar volumenes altos de exploraciones y marcar casos con medidas anomalas para revision por un experto.
- Control de calidad de mediciones existentes: comparar la mascara generada por el modelo con la medicion manual permite detectar mediciones mal realizadas o planos ecograficos incorrectos.
- Formacion de personal sanitario: el modelo puede servir como referencia visual y de medicion en programas de entrenamiento de matronas y tecnicos en ecografia obstetrica.
- Investigacion clinica retrospectiva: procesar cohortes historicas de ecografias para extraer biometrias de forma masiva y estudiar correlaciones con resultados perinatales.
- Integracion en dispositivos de bajo coste: al derivar de un ViT-b (relativamente ligero para tareas de segmentacion), puede desplegarse en estaciones de trabajo modestas o en la nube para dar servicio a clinicas con hardware limitado.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el conjunto de test (945 fotogramas, 46 pacientes no vistos):

| Metrica | Valor |
|---|---|
| Dice medio | 0,9421 ± 0,0418 |
| IoU medio | 0,8929 ± 0,0598 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos de segmentacion fetal ni benchmarks adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; un ViT-b de SAM suele requerir del orden de 2 a 4 GB en precision FP16 para inferencia por imagen, aunque el dato exacto para este checkpoint no se documenta.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano de backbone, una GPU consumer moderna (RTX 3060 o superior) seria suficiente en principio, pero no hay confirmacion del autor.
- Cabe en GPU consumer: probablemente si, dado el tamano de ViT-b, pero no confirmado.
- Opciones de despliegue: no documentadas; al ser un modelo de vision, requeriria un runtime de PyTorch o exportacion a ONNX/TensorRT, sin soporte nativo en vLLM, llama.cpp u Ollama (orientados a LLM).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento de modelos alternativos de segmentacion fetal (por ejemplo, variantes de nnU-Net o U-Net especializadas en biometria fetal) que permitan una comparacion cuantitativa rigurosa. Se indica a continuacion lo que puede afirmarse sin inventar cifras:

| Modelo | Arquitectura | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| UltraSam Fetal Abdomen | SAM ViT-b fine-tuned | Segmentacion de abdomen fetal | CC BY-NC-SA 4.0 | Hugging Face |
| UltraSam (base) | SAM ViT-b fine-tuned en US | Segmentacion en ultrasonido general | no disponible | no disponible en esta busqueda |
| SAM original | ViT (varias tallas) | Segmentacion promptable general | Apache 2.0 (variantes) | Amplia |

La comparacion cuantitativa con alternativas especializadas queda como no disponible.

## Limitaciones y advertencias

- Licencia CC BY-NC-SA 4.0: prohibido el uso comercial sin autorizacion expresa; ademas, las obras derivadas deben compartirse bajo la misma licencia.
- Uso clinico: la model card lo presenta como herramienta de apoyo a la medicion de AC, pero no consta validacion regulatoria ni marcado CE/FDA; no debe usarse como dispositivo medico sin las certificaciones pertinentes.
- Dominio acotado: entrenado solo sobre ecografias de abdomen fetal del dataset ACOUSLIC; el rendimiento puede degradarse con otros equipos, protocolos de adquisicion o poblaciones no representadas.
- Riesgo de error en planos ecograficos atipicos: la segmentacion puede fallar en imagenes con baja calidad, sombras acusticas o planos no estandar, lo que afectaria a la medicion de AC.
- Sesgos potenciales: no se documenta la composicion demografica del dataset ACOUSLIC ni su diversidad geografica, por lo que se desconoce la robustez entre poblaciones.
- Alucinacion en sentido estricto no aplica (no genera texto), pero si puede producir mascaras plausibles pero incorrectas con alta confianza, un riesgo equivalente en segmentacion.
- Ausencia de datos de calibracion, intervalos de confianza por caso y analisis de fallos en la informacion disponible.
- Formato de pesos, requisitos de inferencia y pipeline no documentados, lo que dificulta la reproducibilidad del despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dawahealth/ultrasam-fetal-abdomen
- UltraSam (modelo base): no disponible en la informacion proporcionada
- Dataset ACOUSLIC: no disponible en la informacion proporcionada
- Repositorio de SAM (Meta): no disponible en la informacion proporcionada
- Plataforma DawaMom / Dawa Health: no disponible en la informacion proporcionada
