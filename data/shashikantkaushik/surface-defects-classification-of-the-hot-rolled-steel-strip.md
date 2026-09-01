# shashikantkaushik/Surface-defects-classification-of-the-hot-rolled-steel-strip

## Resumen

Este modelo realiza clasificación de defectos superficiales en bandas de acero laminado en caliente mediante visión artificial. Ha sido desarrollado por shashikantkaushik y su objetivo es automatizar la inspección visual de superficies de acero, sustituyendo la inspección manual, que resulta lenta e inconsistente, por un sistema basado en IA rápido y uniforme. El modelo se construyó utilizando la herramienta Aargus DIY visual inspection, que cubre ingesta de datos, aumento de datos, transferencia de aprendizaje y validación estadística.

El repositorio tiene un tamaño de 0,1 GB y se distribuye bajo licencia Apache 2.0. No se dispone de información pública sobre la arquitectura, el número de parámetros ni la longitud de contexto, ya que la model card del autor no incluye estos detalles técnicos. La fecha de creación del repositorio es el 1 de septiembre de 2026, lo que sugiere que se trata de un modelo reciente.

La relevancia de este modelo radica en su aplicación industrial directa: el control de calidad en la fabricación de acero es un proceso crítico donde los defectos superficiales pueden afectar la seguridad y la calidad del producto final. Un sistema automatizado de clasificación de defectos permite detectar problemas en tiempo real, reducir costes operativos y mejorar la trazabilidad del proceso de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion detallada sobre la arquitectura del modelo en la model card de HuggingFace. El repositorio de GitHub asociado indica que el modelo fue construido con la herramienta Aargus DIY visual inspection, que incluye un pipeline de ingesta de datos, aumento de datos, transferencia de aprendizaje y validacion estadistica. Esto sugiere que se utilizo una arquitectura de red neuronal convolucional (CNN) preentrenada como base, probablemente adaptada mediante transferencia de aprendizaje al dominio especifico de defectos en acero laminado en caliente.

El dataset de entrenamiento no esta especificado en la informacion disponible, pero por la naturaleza de la tarea se infiere que contiene imagenes de superficies de acero con diferentes tipos de defectos. No se menciona el uso de tecnicas como RLHF o DPO, ya que se trata de un modelo de vision artificial, no de un modelo de lenguaje. Tampoco se dispone de datos sobre el numero de tokens de entrenamiento ni la composicion del dataset.

## Capacidades

- Clasificacion de defectos superficiales en bandas de acero laminado en caliente, probablemente incluyendo tipos como grietas, inclusiones, escamas, poros, etc.
- Inspeccion visual automatizada de superficies metalicas en entornos industriales.
- Deteccion de anomalias en tiempo real durante el proceso de laminacion.
- Integracion en sistemas de control de calidad para la toma de decisiones automatica.
- Capacidad de procesamiento de imagenes de alta resolucion, dado el contexto industrial de la aplicacion.
- No se dispone de informacion sobre capacidades de generacion de texto, tool calling, agentes o razonamiento multi-paso, ya que es un modelo de vision.

## Casos de uso

- Control de calidad en linea de produccion: el modelo puede integrarse en la linea de laminacion para inspeccionar cada banda de acero en tiempo real, clasificando defectos y activando alarmas o rechazando material defectuoso de forma automatica.
- Auditoria de calidad post-produccion: permite revisar lotes de acero almacenados o enviados a clientes, generando informes de calidad objetivos y consistentes que respalden la certificacion del producto.
- Mantenimiento predictivo de rodillos y equipos: la aparicion de ciertos tipos de defectos puede correlacionarse con el desgaste de los rodillos de laminacion, permitiendo programar mantenimientos antes de que se produzcan fallos graves.
- Optimizacion de parametros de proceso: al correlacionar los defectos detectados con las variables de proceso (temperatura, velocidad, presion), se pueden ajustar los parametros de laminacion para minimizar la tasa de defectos.
- Formacion de personal tecnico: el modelo puede utilizarse como herramienta de entrenamiento para que los inspectores aprendan a identificar defectos, mostrando ejemplos clasificados y explicando las caracteristicas visuales de cada tipo.
- Trazabilidad y reclamaciones: en caso de reclamaciones de clientes por defectos, el sistema permite revisar las imagenes historicas clasificadas para determinar si el defecto se origino en la planta o en el transporte, aportando evidencia objetiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de HuggingFace no incluye metricas de rendimiento, y los resultados de busqueda web no proporcionan datos especificos sobre este modelo concreto. Los articulos academicos encontrados sobre tareas similares reportan precisiones en torno al 96 % con arquitecturas como Vision Transformers o ResNet34, pero no se puede asumir que este modelo alcance esos valores sin evidencia directa.

## Requisitos de hardware

- No se dispone de informacion sobre los requisitos de VRAM para inferencia, ya que se desconocen la arquitectura y el numero de parametros del modelo.
- El tamano del repositorio es de 0,1 GB, lo que sugiere que el modelo podria ser relativamente pequeno y ejecutarse en GPUs de consumo, pero no se puede confirmar sin datos tecnicos.
- No se especifican GPUs recomendadas ni opciones de despliegue como vLLM, llama.cpp u Ollama, ya que estas herramientas estan orientadas a modelos de lenguaje y no a modelos de vision.
- Para un modelo de clasificacion de imagenes de este tipo, el despliegue tipico seria mediante frameworks como PyTorch o TensorFlow, posiblemente con ONNX para optimizacion en produccion.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa directa con otros modelos de clasificacion de defectos en acero. Los articulos academicos encontrados mencionan arquitecturas como Vision Transformers y ResNet34 con precisiones del 96,39 % y 96 % respectivamente, pero no se puede establecer una comparacion rigurosa sin conocer las especificaciones de este modelo. La licencia Apache 2.0 permite uso comercial sin restricciones, lo que supone una ventaja frente a modelos con licencias mas restrictivas.

## Limitaciones y advertencias

- No se ha publicado informacion sobre sesgos conocidos, pero al tratarse de un modelo de vision entrenado con un dataset especifico, podria presentar un rendimiento inferior en superficies de acero con caracteristicas diferentes a las del entrenamiento (por ejemplo, diferentes condiciones de iluminacion o acabados superficiales).
- Existe riesgo de falsos positivos y falsos negativos en la clasificacion de defectos, lo que en un entorno industrial podria provocar rechazo de material valido o paso de material defectuoso.
- No se dispone de informacion sobre la robustez del modelo ante variaciones en la captura de imagenes (angulo, distancia, resolucion), lo que podria afectar a su rendimiento en condiciones reales de produccion.
- La licencia Apache 2.0 permite uso comercial, pero no se especifican restricciones adicionales ni obligaciones de atribucion.
- No se ha publicado documentacion sobre el proceso de entrenamiento, la composicion del dataset ni las metricas de validacion, lo que dificulta la evaluacion de su fiabilidad para entornos de produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shashikantkaushik/Surface-defects-classification-of-the-hot-rolled-steel-strip
- Repositorio de GitHub: https://github.com/shashi-gifd/Surface-defects-classification-of-the-hot-rolled-steel-strip/blob/main/README.md
- Articulo sobre deteccion de defectos con Vision Transformers: https://www.researchgate.net/publication/384619620_Detection_and_Classification_of_Surface_Defects_on_Hot-Rolled_Steel_using_Vision_Transformers
- Articulo en ScienceDirect sobre deteccion de defectos: https://www.sciencedirect.com/science/article/pii/S240584402414529X
- Articulo IEEE sobre clasificacion con modelos CLIP: https://ieeexplore.ieee.org/document/11064388/references
- Articulo IEEE sobre clasificacion con ResNet34: https://ieeexplore.ieee.org/document/10339448
