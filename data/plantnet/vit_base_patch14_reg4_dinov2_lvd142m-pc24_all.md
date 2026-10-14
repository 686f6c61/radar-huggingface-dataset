# PlantNet/vit_base_patch14_reg4_dinov2_lvd142m.pc24_all

## Resumen

El modelo `vit_base_patch14_reg4_dinov2_lvd142m.pc24_all` es un clasificador de imagenes de especies vegetales desarrollado por PlantNet para la campana de evaluacion PlantCLEF 2024. Se trata de un Vision Transformer de tamano Base con parches de 14x14 y 4 tokens de registro, cuyo backbone fue preentrenado con el metodo de aprendizaje autosupervisado DINOv2 sobre el conjunto LVD-142M y posteriormente ajustado de forma supervisada sobre datos de la plataforma colaborativa Pl@ntNet. El modelo resuelve la identificacion automatica de flora vascular del suroeste de Europa, una tarea de clasificacion de imagenes con un numero de clases muy elevado.

El ajuste fino se realizo sobre aproximadamente 1,4 millones de imagenes repartidas en 7.806 especies de plantas vasculares, divididas en conjuntos de entrenamiento, validacion y prueba. El entrenamiento se llevo a cabo con la libreria `timm` 0.9.16 bajo `torch` 2.2.1+cu121 y empleo media movil exponencial (EMA) de los pesos. Se estructuro en dos fases: primero se congelo el backbone y se entreno solo la cabeza de clasificacion; despues se continuo el entrenamiento ajustando simultaneamente backbone y cabeza, que es la version publicada en este repositorio.

La relevancia de este modelo radica en su especializacion: frente a clasificadores genericos de ImageNet, ofrece una taxonomia de miles de especies adaptada a la flora del suroeste de Europa, con licencia Apache 2.0 y pesos cargables directamente desde el Hub mediante `timm`. El repositorio ocupa 1,5 GB y esta etiquetado como modelo de `image-classification`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base) con parches de 14x14 y 4 tokens de registro, backbone preentrenado con DINOv2 |
| Parametros totales | Aproximadamente 86 M (configuracion estandar de ViT-Base; no explicitado en la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de clasificacion de imagenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (la entrada son imagenes, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (carga mediante `timm` desde el Hub; tamano del repositorio 1,5 GB) |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer de configuracion Base con parche de 14 y cuatro tokens de registro (`reg4`). El backbone se preentreno de forma autosupervisada con DINOv2 sobre LVD-142M, lo que proporciona representaciones visuales genericas de alta calidad. Sobre esa base se anadio una cabeza de clasificacion y se ajusto el modelo para la tarea concreta de identificacion de especies. El proceso de ajuste fino se dividio en dos etapas: en la primera solo se optimizo la cabeza con el backbone congelado; en la segunda, correspondiente a los pesos publicados, se ajustaron de forma conjunta backbone y cabeza. Se utilizo media movil exponencial (EMA) durante el entrenamiento, gestionado con `timm` 0.9.16 y `torch` 2.2.1+cu121.

Los datos de ajuste provienen de la plataforma colaborativa Pl@ntNet e incluyen aproximadamente 1,4 millones de imagenes etiquetadas con 7.806 especies de plantas vasculares del suroeste de Europa (Francia, Portugal y Espana). El conjunto se dividio en entrenamiento, validacion (para controlar el sobreajuste y seleccionar el mejor modelo) y prueba. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, ya que no es un modelo generativo.

## Capacidades

- Clasificacion de imagenes de plantas en 7.806 clases correspondientes a especies de flora vascular del suroeste de Europa.
- Extraccion de representaciones visuales: al estar basado en DINOv2, el backbone puede emplearse como extractor de embeddings de imagen para tareas de similitud, recuperacion o clustering.
- Transferencia a tareas relacionadas: la cabeza de clasificacion puede reentrenarse sobre nuevas taxonomias o especies locales.
- Entrada exclusivamente de imagen; no procesa texto ni genera lenguaje.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues en el sentido de texto (no procesa idiomas).
- No dispone de modo de razonamiento (thinking mode), vision-lenguaje, audio ni otras modalidades adicionales.

## Casos de uso

- Identificacion de especies en aplicaciones de campo: el modelo clasifica una fotografia de una planta en una de las 7.806 especies soportadas, y puede integrarse en aplicaciones moviles o web para asistir a botanicos y aficionados en la flora del suroeste de Europa.
- Apoyo a ciencia ciudadana: plataformas como Pl@ntNet pueden usar el modelo para preclasificar observaciones enviadas por usuarios antes de la validacion por expertos, reduciendo la carga de revision manual.
- Inventario y monitorizacion de biodiversidad: en estudios ecologicos se pueden procesar lotes de imagenes de parcelas para estimar la composicion de especies y detectar cambios en la vegetacion.
- Filtrado previo en herbarios digitalizados: clasificacion de pliegos fotografiados para sugerir la especie y priorizar la revision taxonomica.
- Extraccion de embeddings para busqueda visual: usar el backbone como extractor de caracteristicas para construir indices de similitud entre imagenes de plantas.
- Transferencia a taxonomias regionales: ajustar la cabeza de clasificacion sobre un conjunto local reducido para adaptar el modelo a especies no presentes en las 7.806 clases originales.
- Educacion y divulgacion botanica: aplicaciones didacticas que identifican plantas a partir de fotografias y explican la especie detectada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas numericas de exactitud, F1 ni comparaciones cuantitativas con otros modelos, mas alla de la referencia al articulo de resumen de PlantCLEF 2024.

## Requisitos de hardware

- VRAM estimada para inferencia: con aproximadamente 86 millones de parametros, los pesos ocupan del orden de 0,35 GB en fp32, 0,17 GB en fp16 y cerca de 0,09 GB en int8. Sumando activaciones y lotes pequenos, la inferencia tipica requiere entre 1 y 2 GB de VRAM. Estas cifras son estimaciones a partir del tamano del modelo y no estan confirmadas en la model card.
- GPU recomendadas: cualquier GPU moderna sirve para inferencia; una NVIDIA RTX 4090, A100 o H100 ofrecen un margen amplio, pero tambien GPU de gama media con 4-6 GB de VRAM son suficientes para inferencia en lote pequeno.
- Caben en GPU de consumo: si, el modelo es de tamano Base y cabe comodamente en GPU de consumo como RTX 3060, RTX 4060 o superiores.
- Opciones de despliegue: carga nativa mediante `timm` (`timm.create_model("hf_hub:PlantNet/vit_base_patch14_reg4_dinov2_lvd142m.pc24_all", pretrained=True)`) con PyTorch. No se documentan en la informacion disponible integraciones especificas con vLLM, llama.cpp, Ollama o TGI (orientados a modelos generativos).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `PlantNet/vit_base_patch14_reg4_dinov2_lvd142m.pc24_all` | Aproximadamente 86 M (ViT-Base) | no aplica | Clasificacion de 7.806 especies de flora del suroeste de Europa | Apache 2.0 | Hub de HuggingFace, carga via `timm` |
| DINOv2 ViT-B/14 (backbone `timm`, sin ajuste fino) | Aproximadamente 86 M | no aplica | Embeddings visuales genericos (sin taxonomia de plantas) | Apache 2.0 (segun la distribucion de `timm`) | Hub de HuggingFace, carga via `timm` |
| Otros modelos participantes en PlantCLEF 2024 | no disponible | no aplica | Identificacion de especies vegetales | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Ambito geografico restringido: el modelo esta entrenado para la flora del suroeste de Europa (Francia, Portugal y Espana); su precision puede degradarse en especies de otras regiones.
- Sesgo de dominio: los datos provienen de observaciones de la plataforma Pl@ntNet, por lo que la distribucion de imagenes refleja los habitos de los usuarios (frecuencia de especies, condiciones de captura, calidad fotografica).
- Clases cerradas: solo puede predecir dentro de las 7.806 especies entrenadas; no reconoce especies fuera de ese conjunto y forzara una de las clases conocidas.
- Riesgo de clasificacion erronea: al no generar texto, no produce alucinaciones linguisticas, pero si puede asignar una especie incorrecta con alta confianza, especialmente ante imagenes ambiguas o malas condiciones.
- No apto para tareas generativas: no genera texto, no mantiene conversaciones, no soporta tool calling ni agentes.
- Ausencia de metricas publicadas: no hay datos de benchmarks en la informacion disponible, lo que dificulta estimar su precision real.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene revisar las condiciones de los datos de entrenamiento de Pl@ntNet si se redistribuye el modelo.
- Datos no confirmados: el numero de parametros y la VRAM estimada no estan explicitados en la model card y deben tratarse como aproximaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PlantNet/vit_base_patch14_reg4_dinov2_lvd142m.pc24_all
- Datos de entrenamiento (tar): https://lab.plantnet.org/LifeCLEF/PlantCLEF2024/single_plant_training_data/PlantCLEF2024singleplanttrainingdata.tar
- Metadatos de entrenamiento (CSV): https://lab.plantnet.org/LifeCLEF/PlantCLEF2024/single_plant_training_data/PlantCLEF2024singleplanttrainingdata.csv
- Sitio de Pl@ntNet: https://plantnet.org/
- Herramienta de identificacion de Pl@ntNet: https://identify.plantnet.org/fr
- Documentacion de Pl@ntNet: https://docs.plantnet.org/fr/get-started/
- Articulo de resumen de PlantCLEF 2024: Goeau, H., Espitalier, V., Bonnet, P., Joly, A. "Overview of PlantCLEF 2024: multi-species plant identification in vegetation plot images", Working Notes of CLEF 2024.
