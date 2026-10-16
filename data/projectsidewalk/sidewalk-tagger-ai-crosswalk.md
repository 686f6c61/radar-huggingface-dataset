# projectsidewalk/sidewalk-tagger-ai-crosswalk

## Resumen

El modelo projectsidewalk/sidewalk-tagger-ai-crosswalk es un clasificador de imagen multietiqueta desarrollado por el equipo de Project Sidewalk. Su tarea concreta es predecir que etiquetas de accesibilidad se aplican a una etiqueta de tipo Crosswalk (paso de peatones) a partir de un recorte de una imagen de Google Street View. No es un modelo generativo ni conversacional: recibe una imagen y devuelve diez puntuaciones sigmoideas, de las cuales cinco corresponden a etiquetas reales y las otras cinco son marcadores NULL que preservan los indices de clase del entrenamiento.

Tecnicamente es un ajuste fino del backbone facebook/dinov2-with-registers-base, en concreto la variante ViT-B/14 con 4 tokens de registro (dinov2_vitb14_reg4), al que se anade una cabeza propia: Lineal(768, 256) → ReLU → Lineal(256, 10) con una sigmoide por clase. La implementacion no usa una clase de `transformers`, sino una arquitectura personalizada (`DinoVisionTransformerClassifier`) cargada desde un state dict de PyTorch.

Su relevancia es doble. Por un lado, cubre un nicho poco atendido: la evaluacion a gran escala de la accesibilidad de aceras y pasos de peatones, un problema de infraestructura urbana con impacto directo en personas con movilidad reducida. Por otro, se publica junto a un dataset abierto y verificado (projectsidewalk/sidewalk-tagger-ai-validated) y a codigo de entrenamiento y evaluacion reproducible, lo que lo convierte en una referencia util para investigacion en clasificacion multietiqueta con pocos datos y en dominio muy especifico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 ViT-B/14 con 4 tokens de registro (`dinov2_vitb14_reg4`) ajustado, mas cabeza Lineal(768,256) → ReLU → Lineal(256,10) con sigmoide por clase |
| Parametros totales | No disponible en la model card; el backbone ViT-B/14 de DINOv2 tiene del orden de 86 M de parametros y la cabeza anade aproximadamente 0,2 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision; entrada de recorte RGB redimensionado a 256 px y rellenado a multiplo de 14) |
| Tipos de cuantizacion | No disponible; solo se publica el state dict de PyTorch |
| Idiomas soportados | No aplica (clasificacion de imagen; la model card no declara idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | State dict de PyTorch (`.pth`); se carga con `torch.load(..., weights_only=True)` |
| Tarea | Clasificacion de imagen multietiqueta (`image-classification`) |
| Clases de salida | 10 indices: 0 brick/cobblestone, 1 broken surface, 2 bumpy, 3 NULL, 4 NULL, 5 paint fading, 6 rail/tram track, 7 NULL, 8 uneven surface, 9 very long crossing |
| Modelo base | facebook/dinov2-with-registers-base |
| Dataset de entrenamiento | projectsidewalk/sidewalk-tagger-ai-validated |
| Libreria | pytorch |
| Tamano del repositorio | 0,3 GB |
| Hash sha256 del archivo de pesos | 2399313abc4b462fa9a708695f6febd05d0bd199e1f7f715af55ee312e618f55 |

## Arquitectura y entrenamiento

El modelo parte de DINOv2 ViT-B/14 con cuatro tokens de registro, un Vision Transformer preentrenado mediante aprendizaje autosupervisado que incorpora tokens adicionales para absorber artefactos de atencion global. Sobre ese backbone se aplica un ajuste fino supervisado con una cabeza de clasificacion multietiqueta propia: dos capas lineales con ReLU intermedia y salida sigmoidea independiente por clase, en lugar de una softmax. Esta decision es coherente con el problema: una misma imagen de paso de peatones puede presentar simultaneamente varias condiciones (por ejemplo, superficie irregular y pintura desgastada), por lo que las etiquetas no son mutuamente excluyentes.

El preprocesado esta definido en la model card: el recorte RGB se redimensiona a 256 px, se rellena hasta un multiplo de 14 para encajar con el patch size del ViT y se normaliza con la media y la desviacion tipica de ImageNet. El modelo fue entrenado sobre la version depurada del dataset descrito en el articulo *Towards Fine-Grained Sidewalk Accessibility with Deep Learning: Initial Benchmarks and an Open Dataset* (ASSETS '24). La model card no detalla el numero de tokens o imagenes de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO (no aplicables en un clasificador de vision). Tampoco se documentan innovaciones de inferencia como decodificacion especulativa. El archivo de pesos es una copia byte a byte del original publicado en el repositorio projectsidewalk/sidewalk-tagger-ai-models, en el commit `65959dbc80b87e4f39385204c4b639cbcf58e1a8`.

## Capacidades

- Clasificacion de imagen multietiqueta: asigna simultaneamente las etiquetas de accesibilidad presentes en un recorte de paso de peatones.
- Etiquetas concretas soportadas: brick/cobblestone, broken surface, bumpy, paint fading, rail/tram track, uneven surface y very long crossing.
- Reconocimiento de texturas y superficies propias del entorno urbano vial fotografiado desde camara cenital de coche.
- Puntuaciones continuas por clase (sigmoide) que permiten ajustar el punto de corte por etiqueta mediante umbrales externos.
- Integracion en un pipeline de sugerencia de etiquetas para anotacion colaborativa, servido a traves de sidewalk-ai-api.
- No soporta tool calling, function calling ni uso como agente.
- No soporta razonamiento multi-paso ni modo de pensamiento (thinking mode).
- No genera texto ni mantiene conversaciones; no es un modelo de lenguaje.
- No procesa audio ni video.
- Capacidades multilingues: no aplica, la salida son indices de clase, no texto.
- Capacidad de vision limitada a un unico tipo de objeto de interes (label Crosswalk), no es un detector de objetos ni un modelo de segmentacion.

## Casos de uso

- Sugerencia de etiquetas en cartografiado colaborativo: cuando un voluntario de Project Sidewalk marca un paso de peatones, el modelo analiza el recorte de Street View y propone que etiquetas de accesibilidad aplicar. El voluntario solo valida o corrige, lo que reduce la carga de anotacion.
- Pre-etiquetado de datasets de accesibilidad urbana a gran escala: procesar en lote miles de recortes de pasos de peatones de una ciudad antes de una campana de validacion humana, reduciendo el coste por etiqueta.
- Control de calidad del etiquetado existente: comparar las predicciones del modelo con las etiquetas ya registradas por la comunidad y priorizar para revision humana aquellas con mayor discrepancia.
- Planificacion urbana y priorizacion de reparaciones: agregar las predicciones por zona para identificar tramos con mayor concentracion de superficie irregular, pintura desgastada u obstaculos como railes de tranvia, y orientar el presupuesto de mantenimiento.
- Aplicaciones de movilidad accesible: integrar el endpoint de sidewalk-ai-api en mapas o aplicaciones de rutas para sillas de ruedas que necesiten advertir de pasos con superficie en mal estado.
- Investigacion en clasificacion multietiqueta: servir de baseline reproducible para comparar estrategias de ajuste fino de backbones autosupervisados en datasets pequenos y desbalanceados.
- Monitorizacion temporal del deterioro: aplicar el modelo a capturas de Street View de distintos anos sobre las mismas coordenadas para detectar cambios en el estado del pavimento.
- Auditoria de accesibilidad para cumplimiento normativo: generar informes cuantitativos sobre el estado de los pasos de peatones en un area, con conteos por tipo de defecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al articulo de ASSETS '24 para los resultados por etiqueta sobre el split de test de projectsidewalk/sidewalk-tagger-ai-validated, y a `REPRODUCE_RESULTS.md` en el repositorio sidewalk-tagger-ai para reproducirlos, pero ningun valor numerico (F1, precision, recall por etiqueta, etc.) aparece en la informacion proporcionada. No se dispone tampoco de comparaciones con MMLU, HumanEval, GSM8K ni otros benchmarks estandar, ya que no son aplicables a un clasificador de imagen de dominio especifico.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. En fp32, un backbone ViT-B/14 ronda los 0,3-0,4 GB de pesos, por lo que la inferencia completa cabe holgadamente en menos de 1 GB de memoria, y probablemente en torno a 1-2 GB si se procesan lotes de recortes de 256 px.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se necesita A100, H100 ni similar. Una RTX 3060, RTX 4090 o incluso una GPU integrada reciente bastan.
- Cabe en GPU de consumo: si. Practicamente cualquier GPU con soporte CUDA, e incluso ejecucion en CPU con latencias aceptables para procesamiento por lotes.
- Opciones de despliegue: inferencia nativa con PyTorch cargando el state dict; servicio HTTP mediante sidewalk-ai-api (FastAPI); exportacion a ONNX o TorchScript no esta documentada en la informacion disponible, pero es viable al ser una arquitectura de vision estandar. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponible. No se han publicado mediciones en la informacion proporcionada.
- Tamano del repositorio en HuggingFace: 0,3 GB.

## Comparativa con modelos similares

No se han identificado en la informacion disponible modelos publicos directamente comparables (mismo dominio de accesibilidad de aceras y mismo esquema multietiqueta). La comparacion mas informativa es contra su propio backbone sin ajustar.

| Modelo | Parametros | Contexto/entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| projectsidewalk/sidewalk-tagger-ai-crosswalk | No disponible (backbone ViT-B/14, del orden de 86 M mas cabeza de ~0,2 M) | Imagen (recorte a 256 px) | Clasificacion multietiqueta de etiquetas de accesibilidad en pasos de peatones | apache-2.0 | HuggingFace, uso via sidewalk-ai-api |
| facebook/dinov2-with-registers-base | Del orden de 86 M | Imagen | Backbone de proposito general; requiere cabeza y ajuste para tareas concretas | Apache 2.0 (segun el modelo original de Meta) | HuggingFace |
| Otros taggers de la familia Project Sidewalk (repositorio sidewalk-tagger-ai-models) | No disponible | Imagen | Clasificacion de etiquetas de accesibilidad para otros tipos de label | No disponible | HuggingFace |

Nota: los datos de parametros del backbone DINOv2 no aparecen en la model card de este modelo y se indican como orden de magnitud. No se dispone de cifras de rendimiento comparadas con alternativas, por lo que no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Modelo de dominio muy estrecho: solo clasifica recortes correspondientes a la etiqueta Crosswalk. Aplicado a otros tipos de label o a imagenes fuera de ese contexto, las salidas no son interpretables.
- Las cinco clases NULL son marcadores de indice, no categorias reales; cualquier consumidor del modelo debe ignorar los indices 3, 4 y 7.
- Las puntuaciones sigmoideas no estan calibradas como probabilidades, segun advierte la propia model card. Es obligatorio usar los umbrales por etiqueta definidos en `tag_thresholds.json` de sidewalk-ai-api para decidir presencia o ausencia; sin ellos, las decisiones de umbral generico produciran falsos positivos o negativos sistematicos.
- Riesgo de alucinacion en el sentido de falsos positivos: el modelo puede sugerir una etiqueta de defecto donde no lo hay, especialmente en condiciones de iluminacion adversa, oclusion o resolucion baja tipicas de Street View.
- Posible sesgo geografico: el dataset validated procede de las ciudades cubiertas por Project Sidewalk, por lo que el rendimiento puede degradarse en paises con otra tipologia de pavimento, materiales o senalizacion.
- Posible sesgo de frecuencia de clase: las etiquetas de accesibilidad son desbalanceadas por naturaleza, lo que puede favorecer las clases mayoritarias.
- El modelo no ha sido entrenado para generar texto, por lo que no puede explicar sus predicciones; cualquier justificacion debe anadirse en la capa de aplicacion.
- Restricciones de licencia: los pesos se publican bajo apache-2.0, lo que permite uso comercial. Sin embargo, la model card no detalla la licencia ni las condiciones de las imagenes de Google Street View usadas para construir el dataset, un aspecto que conviene verificar antes de un despliegue comercial.
- No se declaran idiomas ni capacidades multilingues porque la salida es numerica; no procede evaluar sesgos linguisticos.
- Ausencia de benchmarks publicados en la informacion disponible: no es posible estimar la precision esperada en produccion sin reproducir la evaluacion del articulo.
- Advertencia de produccion: al tratarse de un sistema de sugerencia de etiquetas para anotacion humana, no debe usarse de forma autonoma para tomar decisiones sobre infraestructura sin validacion posterior; el propio flujo de Project Sidewalk asume revision humana.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que implica poca validacion externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/projectsidewalk/sidewalk-tagger-ai-crosswalk
- Repositorio de modelos originales: https://huggingface.co/projectsidewalk/sidewalk-tagger-ai-models
- Dataset validado: https://huggingface.co/datasets/projectsidewalk/sidewalk-tagger-ai-validated
- Codigo de entrenamiento y evaluacion: https://github.com/ProjectSidewalk/sidewalk-tagger-ai
- Guia de reproduccion de resultados: https://github.com/ProjectSidewalk/sidewalk-tagger-ai/blob/main/REPRODUCE_RESULTS.md
- API de servicio: https://github.com/ProjectSidewalk/sidewalk-ai-api
- Codigo de carga y preprocesado: https://github.com/ProjectSidewalk/sidewalk-ai-api/blob/main/sidewalk_ai_api/tagger.py
- Umbrales por etiqueta: https://github.com/ProjectSidewalk/sidewalk-ai-api/blob/main/tag_thresholds.json
- Proyecto Project Sidewalk: https://projectsidewalk.org
- Articulo: Liu, Wu, Kulkarni, Saugstad, Rapo, Freiburger, Hosseini, Li, Froehlich. *Towards Fine-Grained Sidewalk Accessibility Assessment with Deep Learning: Initial Benchmarks and an Open Dataset*. ASSETS '24. DOI: https://doi.org/10.1145/3663548.3688531
- Modelo base: https://huggingface.co/facebook/dinov2-with-registers-base

Nota: los resultados de la busqueda web proporcionados no contienen informacion relevante sobre este modelo; consisten en entradas de diccionarios de traduccion frances-ingles sin relacion con el objeto de la ficha, por lo que no se han utilizado.
