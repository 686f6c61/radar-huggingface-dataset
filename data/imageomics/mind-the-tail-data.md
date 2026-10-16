# imageomics/mind-the-tail-data

## Resumen

Mind the Tail - SAE, Selection Rankings, and Models es un repositorio de artefactos de investigacion publicado por el grupo Imageomics, no un modelo de lenguaje ni un modelo generativo. Contiene un autoencoder disperso (SAE) TopK que extrae conceptos interpretables de las representaciones internas de un DINOv3 ViT-B/16 congelado, los rankings de seleccion de datos de cinco corpus de entrenamiento y los modelos entrenados sobre los subconjuntos seleccionados. Acompana al articulo "Mind the Tail: Data Selection Through Sparse Concepts" (arXiv:2610.21007), firmado por Ziheng Zhang, Neha Hulkund, Colin Lee, Zheda Mai, Hui Shen, Ying Ding, Tanya Berger-Wolf, Sara Beery, Wei-Lun Chao y Jianyang Gu.

El problema que resuelve es el de la seleccion de datos (data selection o coreset selection): dado un corpus grande de imagenes, decidir que fraccion conservar para entrenar un modelo downstream sin degradar el rendimiento. La propuesta usa conceptos dispersos aprendidos por el SAE sobre tokens de parche de la capa 11 del DINOv3 ViT-B/16 para ordenar los ejemplos de cada clase o de forma global, y publica ese ordenamiento completo en ficheros Parquet, de modo que un subconjunto al ratio r es simplemente la cabeza del ranking.

El repositorio ocupa 5,1 GB e incluye los checkpoints de los modelos entrenados con cada ratio (10, 20, 30, 50 y 70 por ciento): ResNet-50 para los conjuntos etiquetados (NABirds, Stanford Cars, Waterbirds, Spawrious) y CLIP ViT-B/16 entrenado desde cero sobre subconjuntos de CC12M. Las imagenes originales no se redistribuyen. La licencia de los artefactos es MIT. Su relevancia es practica para equipos que investigan seleccion de datos, sesgos de correlacion espuria y entrenamiento eficiente en vision por computador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAE TopK entrenado sobre tokens de parche de la capa 11 de un DINOv3 ViT-B/16 congelado (d_model = 768); modelos downstream ResNet-50 y CLIP ViT-B/16 (OpenCLIP `ViT-B-16`) |
| Parametros totales | No publicado por el autor. Las dimensiones del SAE son W_enc (768 x 16.384) y W_dec (16.384 x 768) mas sesgos, lo que implica aproximadamente 25,2 millones de parametros (calculo derivado de las dimensiones publicadas). El recuento de los checkpoints ResNet-50 y CLIP no se indica en la model card |
| Parametros activos | 32 conceptos activos por token (TopK, k = 32) sobre un diccionario de 16.384 conceptos. No es una arquitectura MoE |
| Longitud de contexto | No aplicable: no es un modelo de lenguaje. No disponible para los modelos de vision |
| Tipos de cuantizacion | No disponible; los checkpoints se distribuyen como state dict de PyTorch |
| Idiomas soportados | No aplicable; el repositorio no procesa texto |
| Licencia | MIT (artefactos del repositorio) |
| Formato de pesos | PyTorch state dict en `.pt`; el fichero del SAE antepone una linea JSON con la arquitectura (`d_model`, `d_sae`, `top_k`); rankings en Parquet (`.parquet`) |

Detalle de los checkpoints incluidos:

| Ruta | Contenido | Entrenamiento |
|---|---|---|
| `ckpts/sae/dinov3_b_layer11_in1k_topk32/sae.pt` | SAE TopK, 16.384 conceptos | 100 M tokens de parche de la capa 11 de un DINOv3 ViT-B/16 congelado, ImageNet-1K train |
| `ckpts/downstream/nabirds/<ratio>pct/best.pt` | ResNet-50 | Fine-tuning sobre el subconjunto de NABirds al ratio dado |
| `ckpts/downstream/stanford_cars/<ratio>pct/best.pt` | ResNet-50 | Fine-tuning sobre el subconjunto de Stanford Cars |
| `ckpts/downstream/waterbirds/<ratio>pct/best.pt` | ResNet-50 | Fine-tuning sobre el subconjunto de Waterbirds |
| `ckpts/downstream/spawrious/<ratio>pct/best.pt` | ResNet-50 | Fine-tuning sobre el subconjunto de Spawrious |
| `ckpts/downstream/cc12m/<ratio>pct/clip.pt` | CLIP ViT-B/16 (`ViT-B-16` de OpenCLIP) | Entrenado desde cero sobre el subconjunto de CC12M |

Los ratios publicados son 10, 20, 30, 50 y 70 por ciento.

## Arquitectura y entrenamiento

El componente central es un autoencoder disperso TopK con un diccionario de 16.384 conceptos y k = 32 activaciones por token. Se entrena sobre 100 millones de tokens de parche extraidos de la capa 11 de un DINOv3 ViT-B/16 congelado, usando las imagenes de entrenamiento de ImageNet-1K. El espacio latente tiene 768 dimensiones en la entrada y 16.384 en el diccionario. Para obtener un vector de concepto a nivel de imagen se aplica max-pooling sobre las activaciones de los parches. Un unico SAE se reutiliza para los cinco corpus evaluados, lo que evita reentrenar el extractor de conceptos por conjunto de datos.

El fichero `sae.pt` comienza con una linea JSON que declara la arquitectura (`d_model`, `d_sae`, `top_k`) y continua con un state dict con `W_enc` (768 x 16.384), `b_enc`, `W_dec` (16.384 x 768) y `b_dec`. La seleccion se materializa en los ficheros `ranked_examples.parquet`. En los conjuntos etiquetados el ranking es intraclase y contiene las columnas `rank_within_class`, `class_candidate_count`, `image_path`, `class_idx` y `class_name`; el subconjunto al ratio r conserva `max(1, floor(r * class_candidate_count))` imagenes de cada clase, lo que garantiza representacion de todas las clases. En CC12M el ranking es global (`rank_global`, `image_path`) y conserva `floor(r * N)` imagenes; las rutas tienen la forma `tar://${DATA_ROOT}/cc12m-wds/<shard>.tar::<key>.jpg`, referidas a shards de WebDataset.

Los modelos downstream se entrenan despues sobre el subconjunto seleccionado. Los ResNet-50 parten de pesos preentrenados en ImageNet y se ajustan durante 18.700 pasos con batch de 128, SGD y learning rate 1e-3; cada fichero contiene unicamente `{"model_state_dict": ...}` y el orden de las clases de salida sigue el campo `class_idx` del ranking correspondiente. Los CLIP ViT-B/16 se entrenan desde cero sobre el subconjunto de CC12M de cada ratio y el fichero es un state dict plano del modelo `ViT-B-16` de OpenCLIP. No se documentan en la model card fases de RLHF, DPO ni tecnicas de decodificacion especulativa, ya que no se trata de un modelo generativo.

## Capacidades

- Extraccion de conceptos interpretables: el SAE convierte representaciones densas de DINOv3 en 16.384 conceptos dispersos con como maximo 32 activos por token de parche.
- Seleccion de datos por ranking: produce un ordenamiento completo de cada corpus, intraclase para conjuntos etiquetados y global para CC12M.
- Construccion de coresets a ratios configurables, con los ratios 10, 20, 30, 50 y 70 ya precalculados.
- Suministro de checkpoints downstream reproducibles que permiten comparar el efecto del ratio de seleccion sin reentrenar la infraestructura completa.
- Analisis de subgrupos y de ejemplos de cola: los rankings permiten identificar ejemplos poco frecuentes o dificiles dentro de cada clase.
- Compatibilidad con pipelines de PyTorch y con el ecosistema OpenCLIP para los checkpoints de CLIP.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: no procesa lenguaje natural.
- No dispone de modo de razonamiento explicito, vision generativa, audio ni generacion de texto.

## Casos de uso

- Reduccion del coste de entrenamiento en vision: en lugar de entrenar un clasificador con el 100 por cien de un corpus, se usa el ranking intraclase para conservar el 30 o el 50 por ciento de cada clase y se ajusta el ResNet-50 con el mismo recetario publicado (18.700 pasos, batch 128, SGD, lr 1e-3). Es adecuado porque el ordenamiento ya viene precalculado y es determinista.
- Curacion de corpus a escala web para CLIP: el ranking global de CC12M permite entrenar un `ViT-B-16` desde cero con una fraccion del corpus, util cuando el presupuesto de computo o el tiempo de preprocesado de los shards WebDataset es el cuello de botella.
- Auditoria de atajos y correlaciones espurias: los rankings y los checkpoints sobre Waterbirds y Spawrious (variante one-to-one hard) permiten estudiar si la seleccion por conceptos dispersos conserva o descarta los ejemplos que sostienen la correlacion espuria entre fondo y etiqueta.
- Clasificacion de especies con cola larga: en NABirds, donde muchas clases tienen pocos ejemplos, el criterio `max(1, floor(r * class_candidate_count))` garantiza que ninguna clase desaparezca al reducir el ratio, algo critico en dominios biologicos desbalanceados.
- Analisis de interpretabilidad de DINOv3: el SAE permite proyectar cualquier imagen sobre 16.384 conceptos y aplicar max-pooling para obtener un vector de concepto a nivel de imagen, reutilizable en estudios de representaciones auto-supervisadas.
- Linea base para nuevos metodos de seleccion de datos: los Parquet publicados sirven como referencia fija contra la que comparar tecnicas alternativas de coreset bajo el mismo recetario de entrenamiento y los mismos ratios.
- Reproduccion de experimentos: los checkpoints de cada ratio permiten verificar resultados del articulo sin reentrenar el SAE ni recalcular los ordenamientos, siempre que se disponga de las imagenes originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe los corpus de evaluacion (NABirds, Stanford Cars, Waterbirds, Spawrious y CC12M) y los modelos entrenados, pero no incluye ninguna tabla con metricas de exactitud, mAP u otras medidas, ni comparaciones numericas con otros metodos de seleccion de datos.

## Requisitos de hardware

- SAE: aproximadamente 25,2 millones de parametros; en float32 el fichero de pesos ronda los 100 MB, por lo que la inferencia cabe en cualquier GPU consumer con 4 GB o mas de VRAM. La extraccion de conceptos sobre 100 millones de tokens de parche es la fase exigente en memoria intermedia, no el modelo en si.
- Fine-tuning de ResNet-50: con batch de 128 y SGD a lr 1e-3 es viable en una GPU consumer de gama alta (RTX 3090, RTX 4090) o en una GPU de centro de datos (A100, H100) para acortar el entrenamiento.
- CLIP ViT-B/16 desde cero sobre subconjuntos de CC12M: requiere un regimen de entrenamiento mucho mas costoso que el ResNet-50; la model card no especifica numero de GPUs, horas ni tipo de acelerador, por lo que no se puede estimar con precision a partir de la informacion disponible.
- Espacio en disco: el repositorio completo ocupa 5,1 GB. Hay que anadir el almacenamiento de las imagenes originales, que no se incluyen y deben descargarse de sus fuentes.
- Despliegue: los artefactos son ficheros PyTorch (`.pt`) y Parquet, cargables con PyTorch y con OpenCLIP para el checkpoint de CLIP. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no existe un modelo generativo de lenguaje en el repositorio.
- Latencia y throughput de inferencia: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada: la model card no publica metricas propias ni de alternativas, por lo que no es posible establecer una comparacion cuantitativa con otros metodos de seleccion de datos o con otros SAE publicados. A modo de resumen interno, los artefactos incluidos se diferencian entre si por el modelo downstream y el corpus:

| Artefacto | Modelo downstream | Corpus | Inicializacion | Licencia |
|---|---|---|---|---|
| `nabirds/<ratio>pct/best.pt` | ResNet-50 | NABirds | Pesos de ImageNet | MIT |
| `stanford_cars/<ratio>pct/best.pt` | ResNet-50 | Stanford Cars | Pesos de ImageNet | MIT |
| `waterbirds/<ratio>pct/best.pt` | ResNet-50 | Waterbirds | Pesos de ImageNet | MIT |
| `spawrious/<ratio>pct/best.pt` | ResNet-50 | Spawrious | Pesos de ImageNet | MIT |
| `cc12m/<ratio>pct/clip.pt` | CLIP ViT-B/16 | CC12M | Desde cero (OpenCLIP) | MIT |

Comparacion con modelos externos: no disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo generativo: no acepta prompts, no mantiene conversaciones y no produce texto. Cualquier uso en ese sentido es un error de categoria.
- Las imagenes no se redistribuyen. Para usar los rankings y los checkpoints hay que descargar NABirds, Stanford Cars, Waterbirds, Spawrious y CC12M de sus fuentes originales y resolver las rutas contra la variable `${DATA_ROOT}`.
- Las rutas de los Parquet son relativas por diseno, pero requieren que la estructura de directorios y los nombres de shard coincidan con los del corpus original.
- Dependencia fuerte de un unico extractor de caracteristicas: DINOv3 ViT-B/16 congelado y, en concreto, su capa 11. Cambiar de backbone, de capa o de resolucion invalida el SAE y los rankings publicados.
- Los hiperparametros del SAE estan fijados (k = 32, 16.384 conceptos, 100 M tokens de entrenamiento). No se documenta ningun estudio de sensibilidad a estos valores.
- Los rankings pueden heredar sesgos presentes en ImageNet-1K (corpus de entrenamiento del SAE) y en DINOv3. La model card no incluye ninguna evaluacion de sesgo ni de equidad por subgrupo.
- El recetario de fine-tuning es unico para todos los ratios y corpus etiquetados (18.700 pasos, batch 128, SGD, lr 1e-3); no se documentan busquedas de hiperparametros por conjunto.
- Riesgo de alucinacion: no aplicable a un SAE ni a clasificadores de vision. Si se integra en una aplicacion que genere texto a partir de sus salidas, ese riesgo corresponde al componente generativo, no a este repositorio.
- La licencia MIT cubre los artefactos del repositorio, pero no las imagenes de los corpus originales, cuyos terminos de uso son los de cada fuente. CC12M tiene restricciones de uso propias que deben revisarse antes de cualquier aplicacion comercial.
- Los metadatos indican 0 descargas y 0 likes en el momento de la consulta: no hay validacion externa de la comunidad ni informes independientes de reproduccion.
- El repositorio se creo y actualizo el 16 de octubre de 2026 segun los metadatos de HuggingFace; conviene verificar si existen revisiones posteriores.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/imageomics/mind-the-tail-data
- Articulo (arXiv:2610.21007): https://arxiv.org/abs/2610.21007
- Pagina del proyecto: https://imageomics.github.io/mind-the-tail/
- Codigo: https://github.com/Imageomics/mind-the-tail
- NABirds: https://dl.allaboutbirds.org/nabirds
- Waterbirds (`waterbird_complete95_forest2water2`): https://github.com/kohpangwei/group_DRO
- Spawrious (one-to-one hard): https://github.com/aengusl/spawrious
- CC12M: https://github.com/google-research-datasets/conceptual-12m
- Stanford Cars: enlace no incluido en el texto extraido de la model card
- OpenCLIP (formato del checkpoint `ViT-B-16`): https://github.com/mlfoundations/open_clip
