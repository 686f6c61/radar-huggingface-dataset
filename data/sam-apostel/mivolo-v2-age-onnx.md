# Sam-Apostel/mivolo-v2-age-onnx

## Resumen

mivolo-v2-age-onnx es la exportacion a ONNX de la salida de estimacion de edad del modelo MiVOLO v2 (Multi-input Transformer for Age and Gender Estimation), desarrollado originalmente por Maksim Kuprashevich e Irina Tolstykh. El repositorio lo publica Sam-Apostel como artefacto de soporte para su proyecto Slide Station, una herramienta que fecha diapositivas familiares digitalizadas a partir de la edad de las personas que aparecen en ellas. No se trata de un modelo nuevo: los pesos son identicos a los del modelo base y solo cambia el formato de serializacion, de PyTorch a ONNX.

La arquitectura subyacente es un transformer de entrada multiple que procesa simultaneamente un recorte de rostro y un recorte de cuerpo, ambos de 384 x 384 pixeles, concatenados en un unico tensor de 6 canales. Esta doble entrada permite al modelo apoyarse en el contexto corporal cuando el rostro es pequeno, esta girado o tiene poca resolucion, un escenario habitual en fotografia analogica escaneada. La salida es un unico valor float32 en anos, con tamano de lote fijo de 1.

Su relevancia practica es de integracion: al ser un grafo ONNX con opset 18 y pesos float32, puede desplegarse sin dependencia de PyTorch ni de codigo remoto (`trust_remote_code`), lo que simplifica el empaquetado en servicios de inferencia, aplicaciones de escritorio o pipelines de procesamiento por lotes. El autor verifico la paridad numerica contra el modelo PyTorch original sobre 41 rostros, con una discrepancia maxima de 0,01 anos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multi-entrada (dos ramas de imagen: rostro y cuerpo) de MiVOLO v2, exportado como grafo ONNX |
| Parametros totales | no disponible (no declarado en la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada fija de 384 x 384 por recorte, tensor de 6 canales) |
| Tipos de cuantizacion | el repositorio distribuye unicamente pesos float32; no se publican variantes cuantizadas propias |
| Idiomas soportados | no aplica (modelo de vision, no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX, opset 18, float32, tamano de lote fijo 1 |

## Arquitectura y entrenamiento

MiVOLO es un transformer de entrada multiple disenado especificamente para estimacion de edad y genero. En lugar de alimentar la red con un unico recorte facial, concatena dos recortes: el del rostro (3 canales) y el del cuerpo (3 canales), formando una entrada de `[1, 6, 384, 384]`. Cada recorte se preprocesa con letterboxing a 384 x 384 manteniendo la relacion de aspecto, relleno negro centrado, conversion a RGB, division por 255 y normalizacion con media `[0.485, 0.456, 0.406]` y desviacion `[0.229, 0.224, 0.225]` de ImageNet. Cuando no hay recorte corporal disponible, se pasa una imagen completamente negra normalizada del mismo modo, que es el propio mecanismo de "sin cuerpo" de MiVOLO. La salida del export es `age`, un tensor float32 de `[1, 1]` expresado en anos.

El proceso de exportacion se realizo con `torch.onnx.export` en modo `dynamo=True`, `opset_version=18`, partiendo de `mivolo_v2` cargado con `trust_remote_code=True` en float32, bajo transformers 4.51.0 y timm 0.8.13dev0. El grafo se envolvio para devolver directamente `age_output` a partir de la entrada concatenada. El repositorio no documenta el dataset de entrenamiento, el numero de tokens de imagen, el regimen de ajuste ni si hubo etapas de RLHF o DPO; esa informacion corresponderia a la model card del modelo base y no se reproduce aqui. La unica innovacion tecnica atribuible a este repositorio concreto es la conversion de formato y la verificacion de equivalencia numerica frente al original.

## Capacidades

- Estimacion de edad a partir de imagen: devuelve un valor escalar en anos para un par rostro-cuerpo dado.
- Aprovechamiento del contexto corporal: la segunda rama permite estimar la edad cuando el rostro es de baja calidad, esta parcialmente ocluido o aparece en escorzo.
- Inferencia sin PyTorch: el grafo ONNX es autonomo y no requiere `trust_remote_code` ni la libreria transformers en tiempo de ejecucion.
- Ejecucion en CPU o GPU a traves de cualquier runtime compatible con ONNX opset 18.
- No realiza deteccion de rostros ni de cuerpos: presupone que los recortes ya han sido extraidos y preprocesados por el usuario.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es un clasificador/regresor de vision.
- No ofrece salida de genero. Aunque el modelo base MiVOLO cubre edad y genero, este export expone unicamente la salida de edad.
- No devuelve intervalos de confianza ni medidas de incertidumbre, solo el valor puntual de edad.

## Casos de uso

- Fechado de fotografias analogicas digitalizadas: es el caso para el que se creo el export. Dado un escaneo con varias personas, se extrae el rostro y el cuerpo de cada una, se estima la edad y se infiere la decada de la toma combinando las estimaciones, util para archivos familiares y colecciones historicas.
- Enriquecimiento de metadatos en bibliotecas de imagen: catalogos de fotografia que necesitan etiquetas demograficas aproximadas para busqueda y filtrado, sin intervencion manual.
- Analitica de audiencia en retail: estimacion agregada de la franja de edad de visitantes a partir de camaras ya instaladas, alimentando cuadros de mando de afluencia por segmento demografico (con las cautelas legales indicadas mas abajo).
- Carteleria digital (DOOH): adaptacion del contenido mostrado en pantallas publicas segun la edad predominante de quienes se detienen frente a ellas, ejecutando el modelo en el propio dispositivo por su tamano reducido.
- Control parental y verificacion de edad aproximada: estimacion como senal auxiliar en flujos de acceso a contenido restringido, siempre acompanada de un metodo de verificacion adicional dado que es una estimacion estadistica.
- Anotacion y curado de datasets: preetiquetado de conjuntos de imagenes con edad estimada para acelerar el trabajo de anotadores humanos, con revision posterior.
- Investigacion en demografia visual: estudios de evolucion de cohortes de edad a partir de corpus fotograficos historicos, donde la estimacion automatica reduce el coste de anotacion manual.
- Pipelines de vision por lotes: al ser un grafo ONNX de 0,1 GB, encaja bien en procesamiento por lotes offline sobre CPU en servidores o en contenedores ligeros, sin necesidad de acelerador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de error (MAE, CS) sobre conjuntos como UTKFace, IMDB-Clean ni ninguno de los utilizados en los articulos de MiVOLO.

El unico dato cuantitativo disponible es una verificacion de equivalencia entre formatos: la comparacion contra el modelo PyTorch original sobre 41 rostros arrojo una diferencia maxima de 0,01 anos. Se trata de una comprobacion de paridad numerica del export, no de una medida de calidad predictiva.

## Requisitos de hardware

- VRAM estimada para inferencia: no declarada por el autor. A partir del tamano del repositorio (0,1 GB en float32) y de una entrada fija de `[1, 6, 384, 384]`, la huella de memoria es pequena (del orden de cientos de MB incluyendo activaciones), pero se trata de una estimacion derivada, no de un dato oficial.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 2 GB de VRAM es suficiente en la practica; una RTX 3060, RTX 4060 o superior no presentara problema. En entornos de servidor, una T4, L4, A10, A100 o H100 funcionaran, aunque estan sobredimensionadas para un modelo de este tamano.
- GPU de consumo: si, cabe holgadamente en practicamente cualquier GPU de consumo moderna, e incluso en iGPU mediante OpenVINO o DirectML.
- CPU: viable para procesamiento por lotes, especialmente con ONNX Runtime y ejecucion en hilos multiples.
- Opciones de despliegue: ONNX Runtime (CPU y GPU), TensorRT a partir del grafo ONNX, OpenVINO, DirectML, ONNX Runtime Web para navegador. No aplican vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. El grafo fija el tamano de lote en 1, por lo que el paralelismo debe gestionarse creando varias sesiones o instancias de inferencia en lugar de aumentar el lote.
- Restriccion de despliegue destacable: al no incluir la deteccion de rostro ni de cuerpo, el coste real del sistema dependera de los detectores que se anadan por delante.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Salidas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Sam-Apostel/mivolo-v2-age-onnx | no disponible | Rostro + cuerpo, 384 x 384 cada uno | Edad | Apache-2.0 | ONNX (opset 18), float32 | HuggingFace, 0 descargas |
| iitolstykh/mivolo_v2 (original) | no disponible | Rostro + cuerpo, 384 x 384 cada uno | Edad y genero | Apache-2.0 | Pesos PyTorch, requiere `trust_remote_code` | HuggingFace |
| Otros estimadores de edad de un solo recorte | no disponible | Rostro unicamente | Edad | no disponible | no disponible | no disponible |

La diferencia funcional principal frente al modelo base es que este export elimina la rama de genero y la dependencia de codigo remoto de Python, a cambio de perder flexibilidad de lote (fijo a 1) y de cualquier capacidad de ajuste fino directo sobre el grafo ONNX. No se dispone de datos de rendimiento comparado entre alternativas.

## Limitaciones y advertencias

- La estimacion de edad es estadistica y presenta error variable segun etnia, iluminacion, calidad de imagen y rango de edad. La model card no publica analisis de sesgo ni metricas desagregadas por subgrupo.
- No se incluye ningun detector de rostros ni de cuerpos. Un preprocesado incorrecto (recorte mal encuadrado, ausencia de letterboxing, normalizacion distinta) degrada la salida sin aviso.
- El tamano de lote esta fijado en 1 en el grafo exportado. No es posible procesar varios pares rostro-cuerpo en una sola llamada sin reexportar el modelo.
- El modelo no devuelve incertidumbre ni intervalos de confianza, por lo que no hay forma de descartar automaticamente predicciones poco fiables.
- La salida de genero del modelo base no esta disponible en este export.
- El tratamiento de imagenes de personas para inferir atributos biometricos como la edad esta sujeto al RGPD en la Union Europea, que clasifica los datos biometricos como categoria especial. Cualquier despliegue sobre personas identificables requiere base juridica, evaluacion de impacto y, segun el caso, consentimiento explicito.
- Riesgo de uso discriminatorio: usar la edad estimada para decisiones con efectos sobre las personas (credito, empleo, acceso a servicios) es desaconsejable por la tasa de error propia de este tipo de modelos.
- La licencia Apache-2.0 permite uso comercial y modificacion, pero el autor no ofrece garantias y no se documentan las condiciones del dataset de entrenamiento original, lo que limita la auditoria de procedencia de los datos.
- Las busquedas web realizadas para esta ficha no devolvieron resultados relevantes sobre el modelo (los resultados obtenidos correspondian a una serie de television y a un fabricante de utillaje, sin relacion alguna).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sam-Apostel/mivolo-v2-age-onnx
- Modelo base (MiVOLO v2, PyTorch): https://huggingface.co/iitolstykh/mivolo_v2
- Proyecto Slide Station: https://github.com/Sam-Apostel/slide-station
- Articulo MiVOLO: https://arxiv.org/abs/2307.04616
- Articulo Beyond Specialization: Assessing the Capabilities of MLLMs in Age and Gender Estimation: https://arxiv.org/abs/2403.02302
