# bisnet0/riftshield-architecture-yolo

## Resumen

RiftShield architecture diagram detector es un modelo de deteccion de objetos basado en YOLOv8n (variante nano de Ultralytics) afinado para reconocer elementos graficos en diagramas de arquitectura de software: diagramas de clases UML, topologias de red y diagramas de nube. El modelo lo desarrolla el usuario bisnet0 en el contexto de RiftShield, una plataforma de modelado de amenazas presentada en el FIAP Software Security Hackathon 2026. Su funcion es actuar como front-end visual: convierte los elementos detectados en un grafo estructurado que un agente LangGraph recorre para aplicar STRIDE, recuperar mitigaciones mediante RAG con FAISS y simular ataques.

El modelo parte de los pesos preentrenados `yolov8n.pt` y se afina durante 11 epocas sobre un conjunto de 10.041 ficheros anotados, fusionando siete proyectos publicos de Roboflow en un unico esquema de 34 clases. Es, por tanto, un modelo pequeno y especializado, no un modelo de lenguaje: no genera texto ni razona, solo localiza y clasifica cajas delimitadoras sobre una imagen de diagrama.

Su relevancia es acotada pero concreta: demuestra un patron de integracion entre vision por computador y agentes LLM para tareas de seguridad por diseno, y publica pesos y dataset de forma abierta bajo AGPL-3.0. Con 0 descargas y 0 likes en el momento de la consulta y un repositorio de 0.0 GB, se trata de un artefacto reciente y de nicho, orientado a experimentacion mas que a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8n (Ultralytics), red convolucional de deteccion de objetos en una etapa; pesos base `yolov8n.pt` afinados |
| Parametros totales | no disponible (YOLOv8n tiene del orden de 3,2 M de parametros en su configuracion estandar, aunque el autor no lo declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo se publican pesos PyTorch `.pt`; no se documentan exportaciones INT8, FP16 ni ONNX) |
| Idiomas soportados | en (etiquetas de clase y documentacion en ingles) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch `.pt` (`weights/yolov8n-architecture-best.pt`), cargable con la libreria `ultralytics` |
| Clases | 34 (formas y relaciones UML, dispositivos de red, iconos de nube/hardware y clasificacion a nivel de pagina `code` / `diagram`) |
| Entradas | imagenes de diagramas (PNG y similares), con umbral de confianza configurable (ejemplo con `conf=0.25`) |
| Salidas | cajas delimitadoras con clase y coordenadas `xyxy` |
| Epocas de entrenamiento | 11 |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

La arquitectura es YOLOv8n, la variante nano del detector YOLOv8 de Ultralytics: un backbone convolucional y una cabeza de deteccion en una sola etapa que predice cajas y clases directamente. No hay componentes transformer, MoE ni SSM; tampoco se documenta atencion lineal ni decodificacion especulativa. El modelo se inicializa desde `yolov8n.pt` y se afina durante 11 epocas, un regimen corto coherente con un dataset pequeno y con la busqueda de un detector ligero para integrarlo en un pipeline mayor.

Los datos de entrenamiento proceden de siete proyectos publicos de Roboflow fusionados en un unico conjunto de 34 clases con 10.041 ficheros anotados, publicado como dataset complementario `bisnet0/riftshield-architecture-diagrams`. No se documenta el numero de tokens (no aplica), la composicion exacta por clase ni si hubo aumento de datos mas alla del que aplica Ultralytics por defecto. Tampoco se menciona RLHF ni DPO, tecnicas que no aplican a un detector. La innovacion destacable no esta en la arquitectura sino en el uso: los elementos detectados alimentan un grafo que un agente LangGraph recorre para aplicar STRIDE y recuperar mitigaciones con RAG sobre FAISS.

## Capacidades

- Deteccion de objetos en diagramas de arquitectura de software con 34 clases: formas y relaciones UML, dispositivos de red e iconos de nube y hardware.
- Clasificacion a nivel de pagina entre `code` y `diagram`, lo que permite decidir si una imagen contiene codigo o un diagrama antes de procesarla.
- Localizacion precisa de elementos con coordenadas `xyxy`, apta para reconstruir la estructura del diagrama.
- Salida consumible por un agente LLM externo: el modelo no interpreta semanticamente, pero entrega los elementos que el agente LangGraph usa para construir el grafo.
- Integracion con el ecosistema Ultralytics mediante la API `YOLO(...)`, con umbral de confianza configurable.
- No soporta generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes, vision general, audio ni modo de pensamiento. Cualquier capacidad de ese tipo reside en el agente que consume sus salidas, no en el modelo.

## Casos de uso

- Modelado de amenazas automatizado: el modelo detecta los componentes de un diagrama de arquitectura y el agente LangGraph resultante aplica STRIDE sobre cada elemento, recupera mitigaciones con RAG sobre FAISS y simula ataques. Es el caso de uso principal para el que se diseno.
- Auditoria de diagramas UML en repositorios: procesar en lote los diagramas de clases de un proyecto para verificar que las entidades y relaciones representadas coinciden con el codigo, usando la clasificacion `code` / `diagram` para separar imagenes.
- Inventario de topologias de red: extraer dispositivos y conexiones de diagramas de red para generar un inventario estructurado o compararlo con la configuracion real.
- Revision de diagramas de nube: identificar iconos de servicios cloud en diagramas de arquitectura para comprobar que los controles de seguridad esperados estan representados.
- Preprocesado para asistentes de documentacion tecnica: convertir diagramas en elementos estructurados que un LLM pueda describir o resumir en texto.
- Filtrado de imagenes en pipelines de documentacion: usar la clasificacion a nivel de pagina para descartar capturas de codigo y quedarse solo con diagramas antes de pasarlos a un analisis mas costoso.
- Prototipado en entornos de hackathon o docencia: al ser un modelo nano con pesos abiertos y un dataset publicado, sirve como base para experimentar con deteccion de elementos de arquitectura y ampliar clases.

## Benchmarks y rendimiento

Metricas declaradas por el autor en la mejor epoca sobre el split de validacion:

| Metrica | Valor |
|---|---|
| Precision (B) | 0.7416 |
| Recall (B) | 0.5561 |
| mAP50 (B) | 0.5942 |
| mAP50-95 (B) | 0.4183 |
| Epoca | 10 |

No se han publicado comparaciones con otros detectores ni resultados por clase en la informacion disponible. El historial completo por epoca esta en `training/results.csv` y las curvas en `training/`, segun la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano de YOLOv8n, la inferencia cabe holgadamente en cualquier GPU consumer, aunque el autor no publica cifras.
- GPU recomendadas: no disponibles. Un modelo de este tamano puede ejecutarse en CPU y en GPU de gama baja, pero no se documentan requisitos ni latencias.
- GPU consumer: previsiblemente cabe en cualquier GPU consumer moderna por el tamano de la variante nano; sin dato oficial del autor.
- Opciones de despliegue: libreria `ultralytics` (Python), tal como muestra el ejemplo de la model card. No se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp, Ollama ni TGI, que en su mayoria no aplican a un detector.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RiftShield architecture diagram detector (YOLOv8n) | Detector de objetos especializado en diagramas | no disponible (variante nano) | no aplica | AGPL-3.0 | Pesos `.pt` en Hugging Face |
| YOLOv8n estandar (Ultralytics) | Detector de objetos generico (COCO) | no disponible (variante nano) | no aplica | AGPL-3.0 | Pesos publicos en Ultralytics |
| YOLOv8s / YOLOv8m (Ultralytics) | Detectores genericos de mayor capacidad | no disponible | no aplica | AGPL-3.0 | Pesos publicos en Ultralytics |

La comparacion con modelos de lenguaje no procede: se trata de un detector de vision, no de un modelo generativo. Frente a YOLOv8n estandar, la diferencia es el dominio (34 clases de arquitectura frente a las clases COCO) y el afinamiento corto sobre un dataset pequeno; no hay datos publicados que permitan comparar mAP entre ambos en el mismo conjunto. No se dispone de alternativas especializadas en diagramas de arquitectura con metricas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El propio autor advierte que el conjunto de entrenamiento fusiona datasets publicos pequenos con distribucion de clases desequilibrada; las clases raras de relaciones UML rinden muy por debajo de las clases a nivel de pagina `diagram` y `code`.
- El modelo funciona mejor con diagramas de fondo blanco similares a las fuentes de entrenamiento; los diagramas dibujados a mano y los de tema oscuro degradan notablemente.
- Es solo deteccion: la interpretacion semantica (categoria STRIDE, mitigacion) ocurre en el agente LangGraph, no en el modelo. No debe esperarse razonamiento del detector.
- Recall de 0.5561 y mAP50 de 0.5942 en validacion: valores moderados que implican elementos no detectados con frecuencia, algo critico si el grafo posterior se construye solo con las detecciones.
- Licencia AGPL-3.0: el uso comercial y la integracion en servicios en red estan sujetos a las obligaciones de copyleft de esta licencia; conviene revisarlas antes de desplegar en produccion.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y de clasificaciones erroneas que propaguen errores al agente.
- Idiomas: documentacion y etiquetas solo en ingles; no se declara soporte multilingue.
- Sin descargas ni likes en el momento de la consulta y repositorio de 0.0 GB: artefacto reciente y sin validacion externa conocida.
- No se documentan cuantizaciones ni formatos de exportacion, lo que limita el despliegue en entornos que no usen PyTorch y Ultralytics.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bisnet0/riftshield-architecture-yolo
- Dataset complementario: https://huggingface.co/datasets/bisnet0/riftshield-architecture-diagrams
- Codigo del proyecto RiftShield: https://github.com/bisnet0/RiftShield
- Ultralytics (libreria y pesos base YOLOv8): https://github.com/ultralytics/ultralytics
