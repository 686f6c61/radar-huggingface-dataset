# dronefreak/bdd100k-weather-tiny_vit_21m_224

## Resumen

El modelo `dronefreak/bdd100k-weather-tiny_vit_21m_224` es un clasificador de imagenes de escenas de conduccion entrenado para predecir la condicion meteorologica a partir de una unica imagen. Se trata de un TinyViT-21M afinado por el usuario dronefreak sobre un subconjunto derivado del dataset BDD100K, en concreto la tarea de 7 clases (clear, partly cloudy, overcast, rainy, snowy, foggy y unknown) construida a partir del campo de atributos `attributes.weather` de cada imagen. El checkpoint parte del modelo preentrenado `timm/tiny_vit_21m_224.dist_in22k` y se distribuye bajo licencia Apache-2.0 a traves de la libreria `timm`.

La relevancia de este modelo es eminentemente practica: con solo 20,6 millones de parametros y una resolucion de entrada de 224x224 px, es un clasificador de muy bajo coste computacional que puede ejecutarse en CPU o en hardware embebido, lo que lo hace apto para etiquetado automatico de grandes corpus de imagenes de trafico, enrutado condicional dentro de pipelines de percepcion para conduccion autonoma o monitorizacion de flotas de camaras. Forma parte del ecosistema BDD100K-Toolkit, una herramienta con dependencias minimas para preparar BDD100K, entrenar modelos y evaluarlos con las mismas metricas y particiones, lo que facilita la reproducibilidad.

El autor declara un 83,90 % de top-1 y un 68,65 % de macro F1 en el split de test (10 000 imagenes), con un top-5 del 99,85 %. La principal debilidad documentada es la clase `foggy`, con solo 13 imagenes en test y un recall del 7,69 %. La model card incluye ademas un "model zoo" con 12 arquitecturas comparadas bajo el mismo protocolo de evaluacion, lo que permite situar el modelo frente a alternativas ligeras como EfficientViT, RepViT, EfficientFormerV2, ConvNeXt-Atto o MobileNetV4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TinyViT (vision transformer jerarquico con atencion local-global y convoluciones depthwise) |
| Parametros totales | 20,6 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de clasificacion de imagenes); resolucion de entrada 224x224 px |
| Tipos de cuantizacion | no disponible (se distribuye un checkpoint PyTorch en version `best.pt`) |
| Idiomas soportados | no aplica (vision); las etiquetas de clase estan en ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch checkpoint (`.pt`, archivo `best.pt`, ~0,1 GB de repositorio) |
| Tarea | Image classification (7 clases de meteorologia) |
| Numero de clases | 7: clear, partly cloudy, overcast, rainy, snowy, foggy, unknown |
| Modelo base | `timm/tiny_vit_21m_224.dist_in22k` (finetune) |
| Dataset de entrenamiento | `dronefreak/BDD100K-Weather-Classification` (derivado de BDD100K) |
| Libreria / framework | timm, PyTorch |
| Split de evaluacion | test, 10 000 imagenes |

## Arquitectura y entrenamiento

La arquitectura subyacente es TinyViT, un vision transformer jerarquico disenado especificamente para regimenes de pocos parametros (paper arXiv:2207.10666). TinyViT combina bloques de atencion con ventana local, atencion global en etapas tardias y bloques convolucionales depthwise para reducir el coste, ademas de una tecnica de destilacion durante el preentrenamiento que transfiere conocimiento desde un modelo mayor. En este caso concreto no se ha reentrenado la arquitectura: se parte del checkpoint `tiny_vit_21m_224.dist_in22k` preentrenado con destilacion sobre ImageNet-22k y se realiza un ajuste fino sobre el dataset de meteorologia. La entrada se redimensiona a 224x224 px con normalizacion segun los valores `mean` y `std` almacenados en el propio checkpoint.

Respecto a los datos, la tarea es un derivado no oficial de BDD100K (paper arXiv:1805.04687): las etiquetas provienen del campo `attributes.weather` anotado por imagen y se agrupan en 7 clases, siguiendo el dataset de Kaggle del mismo nombre. La model card declara una evaluacion sobre 10 000 imagenes de test con el siguiente reparto por clase: 5 346 `clear`, 1 239 `overcast`, 1 157 `unknown`, 769 `snowy`, 738 `rainy`, 738 `partly cloudy` y tan solo 13 `foggy`. No se documenta en la informacion disponible el numero de tokens o imagenes de entrenamiento, la composicion exacta del split de entrenamiento, ni si se aplicaron tecnicas de aumento de datos, reequilibrado de clases o ajuste de hiperparametros mas alla del ajuste fino supervisado estandar. Tampoco se documenta el uso de RLHF, DPO ni tecnicas equivalentes, algo que no aplica a un clasificador de imagenes.

## Capacidades

- Clasificacion de imagenes de escenas de conduccion en 7 categorias meteorologicas: clear, partly cloudy, overcast, rainy, snowy, foggy y unknown.
- Inferencia a resolucion fija de 224x224 px, con pipeline de preprocesado reproducible (`Resize`, `ToTensor`, `Normalize`) cuyos parametros se leen del propio checkpoint.
- Clasificacion monoclase por imagen: devuelve un vector de probabilidades sobre las 7 clases, del que se extrae la etiqueta ganadora y su confianza.
- Capacidad de operar en modo batch sobre grandes volumenes de imagenes al ser un modelo de 20,6 M de parametros.
- Integracion directa con `timm.create_model`, lo que permite cargar la arquitectura desde el nombre almacenado en el checkpoint (`model_name`).
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, function calling, capacidades de agente, modo thinking, audio ni capacidades multilingues: es un clasificador de vision de proposito especifico.
- No se documenta la capacidad de segmentacion, deteccion de objetos ni descripcion de imagenes.

## Casos de uso

- Etiquetado automatico de datasets de conduccion: el modelo permite anotar el atributo meteorologico de grandes corpus de imagenes de carretera antes de entrenar modelos de percepcion, sustituyendo el etiquetado manual y aprovechando su bajo coste de inferencia (20,6 M de parametros).
- Enrutado condicional en pipelines de conduccion autonoma: la prediccion de clima puede usarse como senal para activar o desactivar modulos de percepcion especificos (por ejemplo, preprocesado de realce en condiciones de lluvia o nieve) sin necesidad de ejecutar varios modelos en paralelo.
- Auditoria de calidad de datasets: al comparar las predicciones del modelo con las etiquetas originales de BDD100K se pueden detectar imagenes mal anotadas o ambiguas, especialmente en la clase `unknown`, que cuenta con 1 157 imagenes de test y un F1 del 75,91 %.
- Monitorizacion de flotas de camaras de trafico: desplegado sobre streams de video, el clasificador permite generar estadisticas agregadas de condiciones meteorologicas por franja horaria o por carretera, con inferencia suficiente para ejecutarse en hardware de borde.
- Analisis logistico y de rutas: la etiqueta de clima se puede cruzar con datos de incidentes, retrasos o siniestralidad para estudiar correlaciones entre meteorologia y operativa de transporte.
- Prototipado rapido en investigacion: al estar integrado en BDD100K-Toolkit y publicarse con las mismas particiones y metricas, sirve como linea base reproducible para comparar nuevas arquitecturas ligeras en la tarea de clasificacion meteorologica.
- Sistema de alerta en vehiculo embebido: dado su tamano, cabe en plataformas tipo Jetson o incluso en CPU, lo que permite ejecutar la clasificacion meteorologica a bordo sin depender de conectividad.
- Filtrado previo en herramientas de anotacion: el modelo puede ordenar o filtrar imagenes por condicion climatica antes de pasarlas a anotadores humanos, priorizando las clases minoritarias (por ejemplo, escenas con nieve o lluvia).

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test (10 000 imagenes). La model card indica `verified: false` en el model-index, es decir, son metricas autodeclaradas y no verificadas de forma independiente por Hugging Face.

| Metrica | Valor |
|---|---|
| Top-1 accuracy | 83,90 % |
| Top-5 accuracy | 99,85 % |
| Macro F1 | 68,65 % |
| Balanced accuracy | 67,15 % |
| Macro precision | 74,81 % |
| Macro recall | 67,15 % |

Desglose por clase:

| Clase | Precision | Recall | F1 | Imagenes de test |
|---|---|---|---|---|
| clear | 91,15 % | 92,89 % | 92,01 % | 5 346 |
| foggy | 50,00 % | 7,69 % | 13,33 % | 13 |
| overcast | 69,69 % | 68,12 % | 68,90 % | 1 239 |
| partly cloudy | 68,44 % | 68,16 % | 68,30 % | 738 |
| rainy | 85,95 % | 71,27 % | 77,93 % | 738 |
| snowy | 85,01 % | 83,36 % | 84,18 % | 769 |
| unknown | 73,42 % | 78,57 % | 75,91 % | 1 157 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark de lenguaje, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,1-0,5 GB segun precision, estimacion derivada del numero de parametros (20,6 M; unos 82 MB en fp32 y unos 41 MB en fp16 solo para los pesos) mas las activaciones de una entrada de 224x224 px. No es un dato publicado por el autor.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas o en CPU.
- No requiere A100, H100 ni aceleradores de datacenter; su uso en ese hardware estaria infrautilizado.
- Ejecucion viable en CPU y en plataformas de borde: Raspberry Pi, NVIDIA Jetson Nano, Jetson Orin o similares, dado el reducido numero de parametros y la resolucion de entrada.
- Opciones de despliegue documentadas: PyTorch con `timm` mediante el script de la model card, que carga `best.pt` con `torch.load` y `weights_only=True`.
- Otras opciones de despliegue (ONNX, TorchScript, TensorRT, OpenVINO) no estan documentadas por el autor; `timm` permite exportar la arquitectura, pero requeriria verificacion por parte del usuario.
- Latencia y throughput: no disponibles. El autor no publica mediciones de latencia ni de imagenes por segundo en ninguna GPU concreta.

## Comparativa con modelos similares

La model card incluye un "model zoo" con 12 arquitecturas evaluadas por el mismo autor sobre el mismo split de test y con las mismas metricas. La comparativa siguiente reproduce los datos disponibles; los parametros de los modelos alternativos no se detallan en la informacion proporcionada.

| Modelo | Top-1 | Macro F1 | Balanced accuracy | Macro precision |
|---|---|---|---|---|
| TinyViT-21M (este modelo) | 83,90 % | 68,65 % | 67,15 % | 74,81 % |
| EfficientViT-B3 | 83,51 % | 68,17 % | 66,34 % | 81,75 % |
| EfficientViT-B2 | 83,46 % | 66,07 % | 65,04 % | 67,54 % |
| EfficientFormerV2-L | 83,27 % | 65,93 % | 65,03 % | 67,12 % |
| RepViT-M1.5 | 83,19 % | 67,78 % | 65,71 % | 81,56 % |
| MobileNetV4-Conv-Large | 82,20 % | 66,62 % | 64,60 % (tabla truncada en la informacion disponible) | no disponible |

Observaciones sobre la comparativa:

- TinyViT-21M lidera el model zoo en top-1 accuracy (83,90 %), macro F1 (68,65 %) y balanced accuracy (67,15 %).
- EfficientViT-B3 y RepViT-M1.5 obtienen una macro precision mas alta (81,75 % y 81,56 %), lo que indica un comportamiento mas conservador en terminos de falsos positivos por clase, a costa de un rendimiento global ligeramente inferior.
- La comparativa completa de parametros, coste computacional, licencia y disponibilidad de cada alternativa no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Clase `foggy` practicamente inutilizable: con solo 13 imagenes de test, el recall cae al 7,69 % y el F1 al 13,33 %. Cualquier uso en produccion que dependa de detectar niebla es poco fiable.
- Brecha entre exactitud global y macro F1: la top-1 del 83,90 % esta muy influida por la clase mayoritaria `clear` (5 346 de 10 000 imagenes de test); la macro F1 del 68,65 % refleja un rendimiento bastante mas modesto en clases minoritarias.
- Clase `unknown` intrinsecamente ambigua: se trata de imagenes sin etiqueta meteorologica clara en BDD100K, lo que introduce ruido en el limite de decision con el resto de clases.
- Metricas autodeclaradas: el model-index marca `verified: false` y el unico aval es el repositorio BDD100K-Toolkit del propio autor. No hay evaluacion independiente.
- Ausencia de datos de validacion publicados: solo se documenta el rendimiento en el split de test, sin curvas de aprendizaje, sin split de validacion detallado y sin estudio de calibracion de probabilidades.
- Dominio cerrado: el modelo esta entrenado sobre escenas de conduccion de BDD100K (mayoritariamente carreteras de Estados Unidos y en su mayoria en condiciones diurnas). Su traslado a otros paises, camaras o condiciones de iluminacion no esta validado.
- Nomenclatura de la clase `clear`: en la taxonomia de BDD100K esta etiqueta suele corresponder a tiempo despejado o sin atributo meteorologico adverso, por lo que una prediccion `clear` no garantiza cielo despejado.
- Licencia del modelo Apache-2.0, permisiva para uso comercial. Sin embargo, el dataset original BDD100K tiene sus propios terminos de uso, por lo que conviene revisarlos antes de explotar comercialmente un modelo derivado de sus anotaciones.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea con alta confianza en imagenes fuera de distribucion (nocturnas, con desenfoque, con oclusiones severas o de otros dominios).
- Sin cuantizaciones publicadas: no se ofrecen versiones GGUF, ONNX ni INT8, de modo que cualquier optimizacion de despliegue corre a cargo del usuario.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de redactar esta ficha, lo que reduce la probabilidad de que existan informes de terceros sobre su comportamiento real.
- Los resultados de busqueda web realizados para esta ficha no han devuelto ninguna fuente relevante sobre el modelo (unicamente listados de cines sin relacion con el contenido tecnico).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/bdd100k-weather-tiny_vit_21m_224
- Dataset de entrenamiento: https://huggingface.co/datasets/dronefreak/BDD100K-Weather-Classification
- Repositorio BDD100K-Toolkit (fuente de los benchmarks): https://github.com/dronefreak/bdd100k-toolkit
- Modelo base en timm: https://huggingface.co/timm/tiny_vit_21m_224.dist_in22k
- Paper de TinyViT: https://arxiv.org/abs/2207.10666
- Paper de BDD100K: https://arxiv.org/abs/1805.04687
- No se han encontrado otros enlaces relevantes (papers adicionales, blogs, demos o repositorios de terceros) en la busqueda web realizada.
