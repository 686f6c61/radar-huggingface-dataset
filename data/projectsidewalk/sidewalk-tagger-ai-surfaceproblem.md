# projectsidewalk/sidewalk-tagger-ai-surfaceproblem

## Resumen

El Project Sidewalk Tagger: Surface Problem es un clasificador multi-etiqueta de imágenes desarrollado por Project Sidewalk, un proyecto de investigación de la Universidad de Washington orientado a auditar la accesibilidad de las aceras mediante crowdsourcing. El modelo recibe un recorte (crop) de una imagen de Google Street View y predice cuáles de las etiquetas de accesibilidad asociadas a un problema de superficie están presentes en ese tramo de acera, con el objetivo de sugerir etiquetas a los voluntarios que anotan las imágenes en la plataforma.

Técnicamente no es un modelo de lenguaje, sino un clasificador de visión: un DINOv2 ViT-B/14 con 4 tokens de registro (`dinov2_vitb14_reg4`) afinado, al que se le añade una cabeza `Linear(768, 256) → ReLU → Linear(256, 13)` con activación sigmoide por clase. La entrada es un crop RGB redimensionado a 256 píxeles y rellenado hasta un múltiplo de 14, normalizado con media y desviación estándar de ImageNet. La salida son 13 salidas independientes (una de ellas, el índice 9, es un marcador nulo sin uso).

Su relevancia radica en que forma parte del primer conjunto de benchmarks y dataset abierto para la evaluación de accesibilidad fina de aceras con aprendizaje profundo (ASSETS '24), y en que se publica bajo licencia Apache-2.0 junto con todo el código de entrenamiento, evaluación y servicio, lo que permite reproducir resultados e integrarlo en producción sin restricciones de uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DINOv2 ViT-B/14 con 4 register tokens (`dinov2_vitb14_reg4`) fine-tuned, más cabeza de clasificación `Linear(768, 256) → ReLU → Linear(256, 13)` con sigmoide por clase |
| Parámetros totales | No disponible en la model card; el backbone DINOv2 ViT-B/14 tiene del orden de 86 M de parámetros y la cabeza añade aproximadamente 0,2 M (cálculo derivado de las dimensiones indicadas, no confirmado por el autor) |
| Longitud de contexto | No aplica: modelo de clasificación de imágenes con una única entrada de 256 px (redimensionada y rellenada a múltiplo de 14) |
| Tipos de cuantización | No disponible; se distribuye como state dict de PyTorch sin cuantizar |
| Idiomas soportados | No aplica (clasificación de imágenes; no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | State dict de PyTorch (`.pth`), cargable con `torch.load(..., weights_only=True)` |

## Arquitectura y entrenamiento

El modelo parte del backbone DINOv2 ViT-B/14 con registro de tokens, un transformer de visión preentrenado de forma autosupervisada por Meta. Sobre ese backbone se ha realizado un fine-tuning supervisado para una tarea de clasificación multi-etiqueta: la cabeza es una red de dos capas lineales con ReLU intermedia y una sigmoide independiente por cada una de las 13 salidas. La arquitectura es personalizada y no se corresponde con una clase de la librería `transformers`; la carga y el preprocesado están implementados en `DinoVisionTransformerClassifier` e `ImageTagger` dentro de `sidewalk_ai_api/tagger.py`.

El entrenamiento se realizó sobre el dataset depurado `projectsidewalk/sidewalk-tagger-ai-validated`, descrito en el artículo *Towards Fine-Grained Sidewalk Accessibility Assessment with Deep Learning: Initial Benchmarks and an Open Dataset* (ASSETS '24). La model card no detalla el número de tokens, el volumen de imágenes, la composición exacta del dataset ni si se emplearon técnicas de alineación como RLHF o DPO (no aplicables en un clasificador de este tipo). El preprocesado documentado incluye redimensionado a 256 px, padding a múltiplo de 14 y normalización ImageNet; el checkpoint publicado es una copia byte a byte del fichero `validated-dino-cls-b-surfaceproblem-tags-best.pth` del repositorio `projectsidewalk/sidewalk-tagger-ai-models` (commit `65959dbc80b87e4f39385204c4b639cbcf58e1a8`), con sha256 `be88b422572a783922fa13f9b63009d5753d7c17039928375fb2c1d0fd4aa335`.

Las 13 salidas se corresponden con las siguientes etiquetas, en este orden: 0 `brick/cobblestone`, 1 `bumpy`, 2 `construction`, 3 `cracks`, 4 `grass`, 5 `height difference`, 6 `narrow sidewalk`, 7 `rail/tram track`, 8 `sand/gravel`, 9 `NULL` (marcador no usado), 10 `uneven/slanted`, 11 `utility panel` y 12 `very broken`.

## Capacidades

- Clasificación multi-etiqueta de recortes de imágenes de aceras en 13 categorías de problemas de superficie, con salidas sigmoideas independientes por clase.
- Detección simultánea de varias condiciones en una misma imagen (por ejemplo, `cracks` y `uneven/slanted` a la vez), al no tratarse de una clasificación exclusiva.
- Sugerencia de etiquetas para anotaciones de crowdsourcing: el modelo pre-anota y el voluntario valida o corrige.
- Integración como servicio mediante `sidewalk-ai-api`, que expone las predicciones a la plataforma de Project Sidewalk.
- Capacidades multilingües: no aplica; el modelo no procesa texto ni tiene componentes lingüísticos.
- Tool calling / function calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Modo de razonamiento (thinking), visión general, audio o generación de texto: no disponible; el modelo es exclusivamente un clasificador de imagen a etiquetas.
- Ajuste fino adicional: al ser un state dict de PyTorch con arquitectura publicada, es posible reentrenar la cabeza o el backbone sobre datos propios.

## Casos de uso

- Sugerencia de etiquetas en la plataforma Project Sidewalk: el modelo se ejecuta sobre cada crop enviado por un voluntario y devuelve las etiquetas probables con sus puntuaciones sigmoideas, de modo que la persona solo tiene que confirmar o descartar, reduciendo el tiempo de anotación por imagen.
- Auditoría de accesibilidad urbana a gran escala: procesado por lotes de grandes volúmenes de imágenes de Street View para generar mapas de problemas de superficie por barrio o ciudad, aprovechando que la inferencia de un ViT-B/14 a 256 px es barata en GPU.
- Priorización de reparaciones municipales: agregación de las detecciones de `very broken`, `height difference` o `cracks` por segmento de acera para que los ayuntamientos ordenen las intervenciones según gravedad y densidad de incidencias.
- Enrutado peatonal accesible: enriquecimiento de grafos de rutas peatonales con atributos de superficie (`bumpy`, `sand/gravel`, `uneven/slanted`) para calcular itinerarios adaptados a sillas de ruedas, carritos o personas con movilidad reducida.
- Control de calidad de anotaciones existentes: comparación entre la etiqueta humana y la predicción del modelo para localizar discrepancias y auditar la consistencia del corpus de Project Sidewalk.
- Investigación en visión por computador aplicada: uso como baseline reproducible en clasificación multi-etiqueta de escenas urbanas, con código de entrenamiento, evaluación y reproducción de resultados publicado.
- Monitorización temporal del estado del viario: si se dispone de imágenes georreferenciadas de distintas fechas, el modelo permite detectar cambios en la superficie (aparición o reparación de grietas y desperfectos) entre capturas.
- Despliegue como microservicio en pipelines propios: al ser Apache-2.0 y cargarse como state dict estándar, puede envolverse en un servicio HTTP interno para otras aplicaciones de accesibilidad o planificación urbana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a los resultados por etiqueta sobre el split de test de `sidewalk-tagger-ai-validated` presentados en el artículo de ASSETS '24 y a `REPRODUCE_RESULTS.md` del repositorio `sidewalk-tagger-ai`, pero no incluye cifras concretas (F1, precisión, recall por etiqueta) que puedan reproducirse aquí.

## Requisitos de hardware

- Parámetros: aproximadamente 86 M en el backbone más unos 0,2 M en la cabeza de clasificación. En fp32 el conjunto ocupa del orden de 350 MB; en fp16, alrededor de 175 MB (estimación derivada del tamaño del repositorio, 0,3 GB).
- VRAM estimada para inferencia: por debajo de 1 GB con entradas de 256 px y batch pequeño (estimación, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; modelos como RTX 3060, RTX 4090, A100 o H100 pueden ejecutar el modelo con holgura y con batches muy grandes.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo actual e incluso en iGPU o CPU, dado el reducido tamaño del modelo y la resolución de entrada.
- Opciones de despliegue: inferencia directa en PyTorch (es el formato publicado) y servicio a través de `sidewalk-ai-api`. No hay pesos GGUF ni soporte documentado para vLLM, llama.cpp, Ollama o TGI, que además no aplican a un clasificador de imágenes sin componente generativo.
- Latencia y throughput estimados: no disponibles. No se han publicado cifras de latencia ni de imágenes por segundo.

## Comparativa con modelos similares

No se dispone de información sobre otros clasificadores de etiquetado de problemas de superficie en aceras con los que comparar directamente. La única referencia documentada es el propio backbone preentrenado del que deriva el modelo.

| Modelo | Tipo | Parámetros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| projectsidewalk/sidewalk-tagger-ai-surfaceproblem | Clasificador multi-etiqueta de 13 clases sobre problemas de superficie en aceras | No indicado en la model card (backbone ViT-B/14, ~86 M) | Crop RGB a 256 px, padding a múltiplo de 14 | Apache-2.0 | HuggingFace (`projectsidewalk/sidewalk-tagger-ai-surfaceproblem`) |
| facebook/dinov2-with-registers-base | Backbone de visión preentrenado autosupervisado (modelo base del anterior) | Del orden de 86 M (ViT-B/14) | Imagen flexible, parche de 14 px | Apache-2.0 (según la familia DINOv2) | HuggingFace |
| Otros taggers de Project Sidewalk (mismo repositorio de modelos) | Clasificadores de otras etiquetas de la plataforma | No disponible | No disponible | No disponible | HuggingFace (`projectsidewalk/sidewalk-tagger-ai-models`) |
| Alternativas comerciales o académicas equivalentes | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Las puntuaciones sigmoideas no son probabilidades calibradas. Para decidir si una etiqueta está presente o ausente hay que aplicar los umbrales por etiqueta definidos en `tag_thresholds.json` de `sidewalk-ai-api`; usar un umbral genérico de 0,5 introduciría sesgos sistemáticos.
- La clase con índice 9 es un marcador `NULL` sin uso que solo sirve para preservar los índices originales de entrenamiento; debe descartarse al interpretar la salida.
- El modelo está especializado en recortes de imágenes de aceras del dominio de Project Sidewalk (imágenes de Google Street View). Fuera de ese dominio (otras resoluciones, cámaras a pie de calle, otros países o tipos de vía) el rendimiento no está documentado.
- Sesgo geográfico y de captura: al depender de imágenes de Street View, hereda la cobertura, la iluminación y las condiciones de captura de esas imágenes, así como la distribución geográfica de las etiquetas del dataset de entrenamiento, no detallada en la información disponible.
- Sesgos de anotación: el dataset de validación procede de etiquetado por crowdsourcing, por lo que puede arrastrar la subjetividad de los anotadores en categorías ambiguas (por ejemplo, `bumpy` frente a `uneven/slanted`).
- Riesgo de falsos positivos y negativos por etiqueta: no se dispone de métricas publicadas en la información proporcionada, por lo que no puede cuantificarse la fiabilidad de cada clase antes de desplegarlo.
- Limitación de contexto e idioma: no aplica un contexto textual ni soporte multilingüe porque el modelo no procesa texto; no puede generar explicaciones, solo puntuaciones por etiqueta.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se atribuya correctamente; conviene citar además el artículo de ASSETS '24.
- Caveat de producción: la arquitectura es personalizada y no se carga con `AutoModel` de `transformers`; la integración requiere el código de `sidewalk_ai_api/tagger.py` o una reimplementación equivalente, incluido el preprocesado exacto (redimensionado a 256 px, padding a múltiplo de 14 y normalización ImageNet).
- Reproducibilidad: el checkpoint publicado es idéntico al del repositorio `sidewalk-tagger-ai-models`; verificar el sha256 indicado en la model card antes de desplegarlo.
- Metadatos de la ficha de HuggingFace: 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria adicional del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/projectsidewalk/sidewalk-tagger-ai-surfaceproblem
- Dataset de validación: https://huggingface.co/datasets/projectsidewalk/sidewalk-tagger-ai-validated
- Repositorio de todos los modelos del artículo: https://huggingface.co/projectsidewalk/sidewalk-tagger-ai-models
- Código de entrenamiento y evaluación: https://github.com/ProjectSidewalk/sidewalk-tagger-ai
- Instrucciones de reproducción de resultados: https://github.com/ProjectSidewalk/sidewalk-tagger-ai/blob/main/REPRODUCE_RESULTS.md
- API de servicio del tagger: https://github.com/ProjectSidewalk/sidewalk-ai-api
- Código de carga y preprocesado (`DinoVisionTransformerClassifier`, `ImageTagger`): https://github.com/ProjectSidewalk/sidewalk-ai-api/blob/main/sidewalk_ai_api/tagger.py
- Umbrales por etiqueta: https://github.com/ProjectSidewalk/sidewalk-ai-api/blob/main/tag_thresholds.json
- Plataforma Project Sidewalk: https://projectsidewalk.org
- Artículo (ASSETS '24): Liu, Xinlei; Wu, Kevin; Kulkarni, Minchu; Saugstad, Michael; Rapo, Peyton Anton; Freiburger, Jeremy; Hosseini, Maryam; Li, Chu; Froehlich, Jon E. *Towards Fine-Grained Sidewalk Accessibility Assessment with Deep Learning: Initial Benchmarks and an Open Dataset*, 2024. DOI: https://doi.org/10.1145/3663548.3688531
- Modelo base: https://huggingface.co/facebook/dinov2-with-registers-base
- Nota sobre la búsqueda web: los resultados obtenidos corresponden a conectores eléctricos Molex Mini-Fit Sr. y no guardan relación con el modelo, por lo que no se han incorporado enlaces adicionales ni datos procedentes de ellos.
