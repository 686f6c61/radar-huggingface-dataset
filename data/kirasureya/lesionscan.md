# kirasureya/LesionScan

## Resumen

LesionScan es un repositorio publicado en Hugging Face por el usuario kirasureya que contiene una aplicacion web (Gradio y FastAPI) para la segmentacion y el analisis de lesiones en radiografias de torax. No se trata de un modelo de lenguaje ni de un modelo fundacional, sino de un proyecto de vision por computador aplicado a imagen medica que empaqueta dos rutas de inferencia alternativas con conmutacion automatica.

La primera ruta (Path A) emplea una U-Net con codificador EfficientNet-B4 para producir una mascara binaria de segmentacion. La segunda (Path B) recurre a un DenseNet de la libreria TorchXRayVision combinado con Grad-CAM para generar un mapa de calor de localizacion. La aplicacion superpone el resultado sobre la radiografia original, muestra puntuaciones de confianza y realiza clasificacion multi-patologia.

El modelo es relevante como ejemplo de prototipo de investigacion en imagen medica de bajo coste de despliegue, pero su utilidad practica esta muy limitada por la ausencia total de documentacion tecnica: no declara licencia, idiomas, datos de entrenamiento, pesos publicados ni resultados de evaluacion. La propia model card lo etiqueta explicitamente como "Research use only. Not intended for clinical diagnosis". El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el 23 de septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Doble ruta: U-Net con codificador EfficientNet-B4 (segmentacion binaria) y DenseNet de TorchXRayVision con Grad-CAM (mapa de calor) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de vision; no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; la interfaz de la model card esta en ingles) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio describe una aplicacion; no se listan ficheros de pesos) |
| Entrada soportada | imagenes JPEG o PNG, maximo 10 MB |
| Interfaz | Gradio (sdk_version 5.6.0) y FastAPI; Python 3.11 |
| Endpoints | `POST /predict` (imagen + metadatos), `GET /health` (estado y ruta activa) |
| Fecha de creacion | 2026-09-23 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe un diseno de doble ruta con fallback automatico. La ruta A es un esquema clasico de segmentacion semantica encoder-decoder: un EfficientNet-B4 actua como extractor de caracteristicas y una U-Net como decodificador que produce una mascara binaria de lesion. La ruta B evita la segmentacion supervisada y genera un mapa de calor Grad-CAM sobre las activaciones de un DenseNet preentrenado de TorchXRayVision, lo que proporciona una localizacion aproximada (weak localization) en lugar de contornos precisos. La aplicacion selecciona la mejor ruta disponible en tiempo de ejecucion, lo que implica que el resultado observado puede variar segun el entorno de despliegue.

No se dispone de informacion sobre el conjunto de datos de entrenamiento, el numero de tokens o imagenes utilizadas, la composicion del dataset, el regimen de ajuste fino ni si se aplicaron tecnicas de alineacion como RLHF o DPO (no aplicables en este dominio). Tampoco se documentan tecnicas de post-procesado, umbralizacion de mascaras ni calibracion de las puntuaciones de confianza. Las innovaciones declaradas son de ingenieria de aplicacion: conmutacion automatica entre rutas, renderizado de la superposicion en tiempo real y una interfaz de panel instrumental con tema oscuro y tipografia monoespaciada.

## Capacidades

- Segmentacion binaria de areas de lesion en radiografias de torax mediante la ruta U-Net + EfficientNet-B4.
- Generacion de mapas de calor Grad-CAM sobre radiografias usando pesos DenseNet de TorchXRayVision.
- Clasificacion multi-patologia con puntuaciones de confianza (metodo y calibracion no documentados).
- Superposicion visual del resultado sobre la imagen original en tiempo real.
- Conmutacion automatica entre dos rutas de inferencia con fallback si una no esta disponible.
- Exposicion de una API REST local con endpoints de prediccion y de salud del servicio.
- Interfaz web interactiva mediante Gradio para carga manual de imagenes.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, tool calling, capacidades de agente ni soporte multimodal mas alla de la imagen radiografica de entrada.

## Casos de uso

- Pre-anotacion de datasets de radiografia de torax: usar la ruta U-Net + EfficientNet-B4 para generar mascaras iniciales que luego un radiologo revise y corrija, reduciendo el tiempo de etiquetado manual en proyectos de investigacion.
- Prototipado academico de pipelines de segmentacion medica: servir como linea base reproducible para comparar arquitecturas encoder-decoder alternativas sobre un mismo conjunto de imagenes.
- Formacion y divulgacion radiologica: emplear los mapas de calor Grad-CAM de la ruta B para ilustrar de forma visual que zonas activan los modelos de clasificacion toracica en sesiones docentes.
- Validacion cualitativa de pesos TorchXRayVision: comprobar el comportamiento de los DenseNet preentrenados sobre imagenes propias antes de integrarlos en un pipeline mayor.
- Demo interactiva en entornos de investigacion: desplegar la interfaz Gradio en un servidor interno para que un equipo clinico-tecnico explore resultados sin escribir codigo.
- Integracion en pipelines de investigacion via API: consumir `POST /predict` desde scripts de analisis por lotes para superponer resultados sobre cohortes de imagenes y almacenar los metadatos devueltos.
- Evaluacion comparativa de tecnicas de localizacion: contrastar la mascara binaria de la ruta A con la localizacion debil de Grad-CAM de la ruta B para estudiar la diferencia entre segmentacion supervisada y explicabilidad post hoc.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de segmentacion (Dice, IoU), clasificacion (AUC, F1), latencia ni throughput, y no se ha publicado ningun informe de evaluacion asociado al repositorio.

## Requisitos de hardware

- VRAM estimada: no disponible. No se declaran requisitos oficiales. Como estimacion orientativa basada en la clase de arquitectura descrita (no son datos del autor), una U-Net con codificador EfficientNet-B4 en FP16 y entradas del orden de 512x512 suele operar en el rango de 6 a 12 GB de VRAM, mientras que un DenseNet de clasificacion es considerablemente mas ligero.
- GPU recomendadas: no disponible. Por la misma estimacion orientativa, una GPU de consumo con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070) seria previsiblemente suficiente para inferencia de una sola imagen; no se justifica el uso de A100 o H100 para este tipo de carga.
- Compatibilidad con GPU de consumo: previsiblemente si, segun la estimacion anterior; no confirmado por el autor.
- Opciones de despliegue: FastAPI con uvicorn (`uvicorn app.main:app --port 7860`) y Gradio (`python app_gradio.py`). No se mencionan vLLM, llama.cpp, Ollama ni TGI; estas herramientas no aplican a un modelo de vision de este tipo. No se documenta contenedor Docker ni servicio gestionado.
- Latencia y throughput: no disponible.
- Restriccion de entrada: imagenes JPEG o PNG de hasta 10 MB.

## Comparativa con modelos similares

| Modelo | Tipo | Arquitectura | Parametros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LesionScan | Aplicacion de segmentacion toracica | U-Net + EfficientNet-B4; DenseNet + Grad-CAM | no disponible | Imagen (hasta 10 MB) | no declarada | Hugging Face, 0 descargas |
| TorchXRayVision | Libreria de clasificacion de radiografia de torax (componente de la ruta B) | DenseNet121 y otros pesos | aprox. 8 M (DenseNet121) | Imagen | no verificada en la informacion disponible | Codigo abierto, distribuida por PyPI y GitHub |
| MedSAM | Segmentacion medica generalista | ViT-B tipo SAM | aprox. 93 M | Imagen | no verificada en la informacion disponible | Pesos y codigo publicos |
| nnU-Net | Framework de segmentacion auto-configurable | U-Net adaptada por dataset | depende del dataset | Imagen o volumen | no verificada en la informacion disponible | Codigo abierto en GitHub |

Nota: los datos de parametros y licencias de los modelos comparados no proceden de la informacion proporcionada en esta busqueda y se marcan como no verificados; conviene contrastarlos con sus repositorios oficiales antes de citarlos. La comparativa es limitada porque LesionScan es una aplicacion empaquetada, no un modelo con pesos publicados, por lo que la comparacion directa de rendimiento no es posible.

## Limitaciones y advertencias

- Uso exclusivo en investigacion: la propia model card declara "Research use only. Not intended for clinical diagnosis". No debe emplearse para decisiones clinicas.
- Licencia no declarada: al no especificarse licencia, no hay autorizacion explicita de uso comercial y persisten dudas sobre la redistribucion del codigo y de los pesos.
- Ausencia de validacion: 0 descargas y 0 likes; no hay evidencia de uso, revision por pares ni validacion externa.
- Sin datos de entrenamiento: se desconoce la procedencia de los datos, el equilibrio de clases y la posible presencia de sesgos demograficos, de equipo o de protocolo radiologico.
- Riesgo de alucinacion visual: la ruta B basada en Grad-CAM produce localizaciones debiles y de baja resolucion que pueden resaltar regiones irrelevantes; no son contornos anatomicos fiables.
- Puntuaciones de confianza no calibradas: no se documenta el metodo de calculo ni su fiabilidad, por lo que no deben interpretarse como probabilidades clinicas.
- Sensibilidad al dominio: los modelos de radiografia toracica suelen degradarse ante cambios de escaner, exposicion, proyeccion o poblacion (por ejemplo, pacientes pediatricos frente a adultos).
- Reproducibilidad limitada: la conmutacion automatica entre rutas implica que una misma imagen puede procesarse con arquitecturas distintas segun el entorno, alterando el resultado.
- Ambito restringido: solo acepta radiografias de torax en JPEG o PNG de hasta 10 MB; no soporta otras modalidades de imagen ni volumenes 3D.
- Sin mantenimiento documentado: el repositorio no registra actualizaciones posteriores al 23 de septiembre de 2026 ni canal de soporte.
- No es un modelo de lenguaje: no ofrece generacion de texto, razonamiento multi-paso, tool calling ni capacidades de agente, pese a la presencia de una API REST.

## Enlaces

- Hugging Face: https://huggingface.co/kirasureya/LesionScan
- No se han encontrado en la busqueda web otros enlaces asociados: no hay paper, blog tecnico, repositorio de codigo independiente, demo publica ni ficha de dataset. Los unicos componentes externos mencionados en la model card son la libreria TorchXRayVision y el framework Gradio, sin URL facilitada.
