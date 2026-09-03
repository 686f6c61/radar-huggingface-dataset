# bds062/fsh-tal

## Resumen

FSH-TAL es un modelo de localizacion temporal de acciones (Temporal Action Localization, TAL) especializado en el analisis de comportamiento de peces ciclidos. Ha sido desarrollado por bds062 y presentado en el taller CV4Ecology de ECCV 2026, bajo el titulo "Automated Temporal Localization of Behavior in Cichlid Fish with Few-Shot Trajectory Tokens". El modelo aborda el problema de identificar automaticamente cuando ocurren comportamientos especificos en secuencias de video, un reto relevante para la investigacion etologica y ecologica.

La arquitectura se basa en un backbone denominado Trokens++ MIL (Multiple Instance Learning), que procesa tokens de trayectoria para localizar comportamientos en el tiempo. El repositorio incluye dos ficheros: un checkpoint entrenado sobre las 17 grabaciones completas del dataset bds062/cichlid-behavior-pairs (63 MB) y el backbone preentrenado (537 MB). El modelo esta disenado para funcionar en regimen de few-shot, lo que permite adaptarse a nuevas categorias de comportamiento con pocos ejemplos etiquetados.

La relevancia actual del modelo radica en la creciente demanda de herramientas automatizadas para el monitoreo del comportamiento animal, donde los metodos manuales son costosos y dificilmente escalables. Su enfoque en pocos ejemplos y su especializacion en una especie concreta lo convierten en una propuesta interesante para la comunidad de vision por computador aplicada a la ecologia, aunque su licencia aun no esta definida y su uso en produccion requiere contacto previo con los autores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Trokens++ MIL backbone (basado en tokens de trayectoria) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (license-tbd, pendiente de publicacion) |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

La arquitectura de FSH-TAL se compone de dos elementos principales: un backbone Trokens++ MIL y un checkpoint de localizacion temporal. El backbone procesa tokens de trayectoria, una representacion intermedia que codifica el movimiento de los peces a lo largo del tiempo, y emplea un esquema de Multiple Instance Learning para aprender a partir de videos etiquetados a nivel de clip o de secuencia, sin necesidad de anotaciones frame a frame. Este enfoque reduce significativamente el coste de anotacion, un factor critico en datasets biologicos.

El entrenamiento se realizo sobre el dataset bds062/cichlid-behavior-pairs, que contiene 17 grabaciones de peces ciclidos. El checkpoint principal (fshtal_release.pt) fue entrenado sobre la totalidad de las grabaciones, mientras que el backbone (backbone_release.pt) se proporciona como modelo preentrenado para fine-tuning o extraccion de caracteristicas. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO, por lo que estos datos no estan disponibles.

## Capacidades

- Localizacion temporal de comportamientos en video: identifica el intervalo temporal exacto en el que ocurre un comportamiento determinado dentro de una secuencia de video.
- Few-shot learning: disenado para adaptarse a nuevas categorias de comportamiento con un numero reducido de ejemplos etiquetados.
- Procesamiento de trayectorias: utiliza tokens de trayectoria como entrada, lo que permite modelar el movimiento de los peces de forma compacta y eficiente.
- Especializacion en peces ciclidos: entrenado especificamente para esta especie, con potencial de transferencia a otras especies con fine-tuning.
- Integracion con backbone MIL: el backbone Trokens++ MIL puede reutilizarse como extractor de caracteristicas para otras tareas de analisis de comportamiento.
- No se han documentado capacidades de generacion de texto, tool calling, agentes, vision generalista ni soporte multilingue, ya que el modelo esta orientado exclusivamente a la tarea de TAL en video.

## Casos de uso

- Investigacion etologica automatizada: los investigadores pueden utilizar FSH-TAL para analizar largas grabaciones de peces ciclidos y extraer automaticamente la linea temporal de comportamientos como cortejo, agresion o alimentacion, reduciendo horas de anotacion manual.
- Monitoreo de bienestar animal en acuarios y piscifactorias: el modelo puede integrarse en sistemas de camaras para detectar comportamientos anormales o estresantes en tiempo real, facilitando la intervencion temprana.
- Estudio de efectos farmacologicos o toxicológicos: en experimentos donde se evalua el impacto de sustancias en el comportamiento, FSH-TAL permite cuantificar cambios en la frecuencia y duracion de comportamientos de forma objetiva y reproducible.
- Analisis de dinamicas sociales: al localizar temporalmente interacciones entre individuos, el modelo ayuda a estudiar jerarquias, territorialidad y patrones de apareamiento en poblaciones de ciclidos.
- Generacion de datasets anotados: el backbone preentrenado puede emplearse para pre-anotar nuevos videos, que luego se refinan manualmente, acelerando la creacion de datasets a mayor escala.
- Transferencia a otras especies: con fine-tuning sobre un pequeno conjunto de ejemplos de otra especie de pez, el modelo podria adaptarse a nuevos dominios, aprovechando su capacidad few-shot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo se presenta en un taller cientifico (CV4Ecology, ECCV 2026) y los datos cuantitativos de rendimiento, como mAP, precision temporal o comparativas con otros modelos de TAL, no estan incluidos en la model card ni en los resultados de busqueda web.

## Requisitos de hardware

- Tamano del repositorio: 0.6 GB en total, con un checkpoint de 63 MB y un backbone de 537 MB.
- VRAM estimada para inferencia: no disponible. Dado el tamano del backbone (537 MB), se estima que podria ejecutarse en GPUs con 8 GB de VRAM o menos, aunque no se proporcionan datos oficiales.
- GPU recomendadas: no disponible. Para el backbone de 537 MB, una GPU de gama media como una RTX 3060 o superior seria suficiente para inferencia, pero no hay confirmacion oficial.
- Compatibilidad con GPU de consumo: probablemente si, dado el tamano reducido de los pesos, pero no confirmado.
- Opciones de despliegue: no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI. El formato .pt sugiere un flujo de trabajo basado en PyTorch, posiblemente con scripts propios del repositorio GitHub.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han encontrado en la informacion proporcionada modelos comparables de localizacion temporal de comportamiento animal, ni datos de rendimiento que permitan establecer una comparativa objetiva.

## Limitaciones y advertencias

- Licencia no definida: el modelo se distribuye bajo una licencia "TBD" (por determinar). Los autores solicitan contacto antes de cualquier reutilizacion, lo que impide su uso comercial o academico sin autorizacion explicita.
- Especializacion limitada: entrenado exclusivamente para peces ciclidos, su rendimiento en otras especies o entornos no esta garantizado sin fine-tuning.
- Sin datos de rendimiento publicados: no se han proporcionado metricas de precision o recall, lo que impide evaluar su eficacia real frente a alternativas.
- Dependencia del dataset: el modelo se entreno sobre 17 grabaciones, un volumen reducido que puede limitar su generalizacion a variaciones de iluminacion, angulo de camara o densidad de peces.
- Riesgo de sesgo en la anotacion: al ser un dataset creado por un unico autor, los comportamientos anotados pueden reflejar criterios subjetivos o no cubrir toda la variabilidad etologica de la especie.
- Sin soporte para otros formatos de peso: los pesos se distribuyen unicamente en formato .pt de PyTorch, lo que puede dificultar su integracion en pipelines que requieran ONNX, TensorRT u otros formatos optimizados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bds062/fsh-tal
- Repositorio GitHub: https://github.com/bds062/FSH-TAL
- Dataset asociado: https://huggingface.co/datasets/bds062/cichlid-behavior-pairs
