# noe95/mmfm-breast-imaging-checkpoints

## Resumen

MMFM Breast-Imaging Baselines es una coleccion de ocho checkpoints ResNet-18 de clasificacion binaria (lesion benigna frente a maligna) entrenados de forma independiente sobre ocho conjuntos publicos de imagen mamaria que cubren tres modalidades: ecografia (ultrasound), mamografia (incluida la variante con contraste, CESM) y resonancia magnetica dinamica con contraste (DCE-MRI). El autor es noe95 y el codigo asociado vive en el repositorio MMFM de Nouran Fadlallah. No es un modelo fundacional multimodal ni el modelo de fusion de tres ramas que da nombre al proyecto: son las lineas base monomodales, un backbone por dataset, pensadas para comparaciones controladas y estudios de reproduccion.

Cada checkpoint es una instancia de `models.SingleBackboneClassifier`: un unico ResNet-18 preentrenado en ImageNet, con la primera convolucion adaptada cuando la entrada no es RGB (por ejemplo, los 9 canales `img9Se` de BreastDM) y una cabeza de clasificacion binaria. El repositorio completo ocupa 0,4 GB, lo que implica unos 45 MB por checkpoint, coherente con unos 11,2 millones de parametros en FP32 por archivo. La model card no declara el numero exacto de parametros ni el recuento de imagenes de entrenamiento por dataset.

Su relevancia es metodologica mas que de rendimiento: proporciona recetas por dataset, con validacion cruzada de 5 particiones cuando la fuente lo permite, y documenta abiertamente resultados debiles o sospechosos (BUSC con exactitud casi perfecta marcada como no verificada y posible aprendizaje de atajos, mini-MIAS con 0,599 de exactitud y un 51 % de falsos negativos en casos malignos). Es material de partida para auditoria, analisis de sesgo por clase y comparacion entre modalidades, no un componente listo para produccion clinica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (CNN con conexiones residuales) como backbone unico mas cabeza de clasificacion binaria (`models.SingleBackboneClassifier`) |
| Parametros totales | No declarado en la model card. Aproximadamente 11,2 millones por checkpoint segun la arquitectura ResNet-18 con cabeza binaria; el tamano de repo (0,4 GB para 8 archivos) es coherente con pesos FP32 de ~45 MB cada uno |
| Longitud de contexto | No aplica: modelo de vision. Entrada de imagen (RGB de 224x224 en el caso estandar; primera convolucion adaptada al numero de canales del dataset, p. ej. 9 canales en BreastDM) |
| Tipos de cuantizacion | No disponible. Se distribuyen checkpoints PyTorch en precision nativa (FP32); no se documentan versiones INT8, FP16 ni GGUF |
| Idiomas soportados | No aplica: clasificacion de imagenes medicas, no procesa texto |
| Licencia | cc-by-4.0 |
| Formato de pesos | `.pth` (checkpoints PyTorch; cada archivo contiene el state_dict de un unico fold o particion, no un ensemble) |

## Arquitectura y entrenamiento

La arquitectura es deliberadamente simple y homogenea: un ResNet-18 preentrenado en ImageNet por cada fuente de datos, con la primera capa convolucional adaptada cuando la entrada no es RGB (caso de BreastDM con 9 canales). La cabeza de salida es binaria, benigno frente a maligno. El entrenamiento es especifico por dataset, sin agregacion multi-vista ni fusion entre modalidades, y sigue la receta del articulo original en el caso de BUS-BRA ("paper-matched recipe").

El regimen de evaluacion varia segun la fuente: BUS-BRA usa las 5 particiones oficiales de validacion cruzada; BUSI, BUSC y BrEaST-Lesions USG usan 5 particiones estratificadas (a nivel de caso en BrEaST-Lesions USG); mini-MIAS usa 5 particiones a nivel de paciente; BreastDM usa la particion oficial de entrenamiento y validacion; y CDD-CESM y CMMD usan una unica particion a nivel de paciente como prueba de humo, sin busqueda de aumento de datos ni ponderacion de clases afinada. Los archivos distribuidos son los checkpoints de un solo fold: las exactitudes reportadas en la model card son medias de 5 folds del informe completo y no el rendimiento del archivo concreto. No hay RLHF ni DPO (no aplica), ni decodificacion especulativa; la innovacion tecnica destacable es la propia documentacion de fallos (analisis Grad-CAM, tablas por clase y por fold). El modelo de fusion de tres ramas y el modelo LG-CAFN del articulo de BreastDM se mencionan como referencia comparativa, pero no se distribuyen en este repositorio.

## Capacidades

- Clasificacion binaria de imagenes de mama (benigno frente a maligno) en ecografia, mamografia, mamografia con contraste y DCE-MRI, con un checkpoint especializado por dataset.
- Extraccion de caracteristicas visuales mediante el backbone ResNet-18, reutilizable para transfer learning en tareas de imagen medica.
- Analisis de interpretabilidad: el informe incluye mapas Grad-CAM para diagnosticar atencion difusa o aprendizaje de atajos (caso de BUSC).
- Evaluacion por clase: el informe aporta sensibilidad, especificidad y sesgo de falsos positivos frente a falsos negativos por dataset.
- Adaptacion a entradas de distinto numero de canales (RGB para ecografia y mamografia, 9 canales para BreastDM).
- No soporta tool calling, function calling ni uso como agente.
- No soporta razonamiento multi-paso, generacion de texto, codigo ni matematicas.
- No tiene capacidades multilingues (no procesa lenguaje).
- No dispone de modo de razonamiento explicito, vision-lenguaje, audio ni generacion.

## Casos de uso

- Linea base de referencia en investigacion CAD mamaria: sirve como punto de comparacion reproducible frente a arquitecturas nuevas (EfficientNet, ConvNeXt, ViT) bajo la misma particion y el mismo preprocesamiento por dataset.
- Auditoria de aprendizaje de atajos: el analisis Grad-CAM incluido permite comprobar si un modelo con exactitud alta (BUSC, 0,992) esta mirando la lesion o artefactos del conjunto, un control metodologico util antes de publicar cualquier resultado.
- Transfer learning con pocas etiquetas: el backbone ResNet-18 preentrenado en ImageNet y ajustado a imagen mamaria puede congelarse y usarse como extractor de caracteristicas para clasificadores con datasets propietarios pequenos.
- Docencia en cursos de imagen medica: los ocho checkpoints permiten ilustrar en una practica como cambia el rendimiento entre modalidades (ecografia frente a mamografia frente a MRI) manteniendo fijo el backbone.
- Pruebas de humo de infraestructura de despliegue: al ser un modelo de ~45 MB, es util para validar pipelines de inferencia (ONNX Runtime, TorchScript, TensorRT, contenedores con API REST) antes de migrar a modelos mayores.
- Analisis comparativo de modalidades: con la misma arquitectura por dataset, se pueden estudiar diferencias de dificultad intrinseca entre ecografia (BUSI, 0,884) y mamografia (mini-MIAS, 0,599; CMMD, 0,758) aislando el efecto de la arquitectura.
- Pre-etiquetado asistido en flujos de anotacion: en un entorno de investigacion y siempre con revision de un radiologo, un checkpoint de alta exactitud por fold puede priorizar imagenes candidatas para anotacion, nunca para decision clinica.
- Reproduccion y verificacion de articulos: la receta "paper-matched" de BUS-BRA y las particiones oficiales permiten contrastar los numeros publicados por cada fuente original.

## Benchmarks y rendimiento

Los datos disponibles son exactitudes de clasificacion por dataset, no benchmarks de lenguaje. Las cifras de 5 folds corresponden al informe completo; el checkpoint distribuido es el de un unico fold.

| Dataset | Modalidad | Evaluacion | Exactitud de test | Observaciones |
|---|---|---|---|---|
| BUS-BRA | Ecografia | 1 de 5 folds oficiales | 0,828 ± 0,023 (media de 5 folds) | Receta alineada con el articulo original |
| BUSI | Ecografia | 1 de 5 folds estratificados | 0,884 ± 0,038 (media de 5 folds) | Version completa de 780 imagenes |
| BUSC | Ecografia | 1 de 5 folds estratificados | 0,992 ± 0,010 (media de 5 folds) | Resultado casi perfecto marcado como no verificado; Grad-CAM sugiere posible atajo (sin recorte de ROI en el preprocesamiento) |
| BrEaST-Lesions USG | Ecografia | 1 de 5 folds a nivel de caso | 0,726 ± 0,042 (media de 5 folds) | Varianza alta entre folds, ~51 casos de test por fold |
| mini-MIAS | Mamografia | 1 de 5 folds a nivel de paciente | 0,599 ± 0,096 (media de 5 folds) | Resultado debil; omite ~51 % de los casos malignos |
| BreastDM | DCE-MRI (9 canales `img9Se`) | Particion oficial train/val | 0,880 | A 0,002 de exactitud del modelo de fusion LG-CAFN del articulo; especificidad baja (0,542) |
| CDD-CESM | Mamografia con contraste | Particion unica a nivel de paciente (prueba de humo) | 0,614 | No es una reproduccion ajustada; sin busqueda de aumento ni ponderacion de clases |
| CMMD | Mamografia | Particion unica a nivel de paciente (prueba de humo) | 0,758 | Entropia cruzada ponderada por clase; sin validacion cruzada ni agregacion multi-vista |

No se han publicado resultados de benchmarks estandarizados (tipo MMLU, HumanEval o GSM8K) en la informacion disponible, y no serian aplicables a un modelo de clasificacion de imagen.

## Requisitos de hardware

- VRAM para inferencia: inferior a 1 GB en FP32 por checkpoint (~45 MB de pesos mas activaciones). Cabe holgadamente en cualquier GPU con 4 GB o mas, incluso con lotes grandes.
- GPU recomendadas: cualquier GPU moderna es suficiente. Para maximizar throughput, NVIDIA A100, H100, L4, T4 o RTX 4090; para desarrollo, RTX 3060/4060 o superiores.
- GPU de consumo: si, cabe en practicamente todas las GPU de consumo actuales y en iGPU/NPU modestas. Tambien es viable en CPU (por ejemplo, en un portatil o en un servidor sin GPU) para inferencia por lotes pequenos.
- Opciones de despliegue: PyTorch nativo (los `.pth` son state_dict de `SingleBackboneClassifier`), exportacion a TorchScript u ONNX Runtime, TensorRT para NVIDIA, y servicio mediante FastAPI o TorchServe. No hay soporte de llama.cpp, Ollama, vLLM ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no medidos en la informacion disponible. Como referencia arquitectonica, ResNet-18 a 224x224 requiere del orden de 1,8 GFLOPs por imagen, lo que se traduce en unos pocos milisegundos por imagen en GPU moderna y decenas de milisegundos en CPU. Estas cifras son estimaciones derivadas de la arquitectura, no medidas publicadas por el autor.
- Almacenamiento: 0,4 GB para los ocho checkpoints; unos 45 MB por archivo individual.

## Comparativa con modelos similares

Los recuentos de parametros de las alternativas son valores de referencia de sus arquitecturas, no mediciones de esta ficha. La exactitud no es directamente comparable si cambia el dataset o la particion.

| Modelo | Parametros (referencia) | Entrada | Exactitud en la informacion disponible | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MMFM ResNet-18 (este repositorio) | ~11,2 M | Imagen, 1 o 9 canales | 0,599-0,992 segun dataset (ver tabla anterior) | cc-by-4.0 | 8 checkpoints en HuggingFace |
| LG-CAFN (articulo de BreastDM) | No disponible | DCE-MRI | 0,882 en BreastDM (el checkpoint ResNet-18 queda a 0,002) | No disponible | No distribuido en este repositorio |
| MMFM fusion de 3 ramas | No disponible | Multimodal | No disponible | No disponible | Codigo en el repositorio MMFM; pesos no incluidos aqui |
| EfficientNet-B0 | ~5,3 M | Imagen RGB | No entrenado ni evaluado en esta informacion | No disponible en esta ficha | Disponible como arquitectura generica en torchvision |
| DenseNet-121 | ~8,0 M | Imagen RGB | No entrenado ni evaluado en esta informacion | No disponible en esta ficha | Disponible como arquitectura generica en torchvision |
| ViT-B/16 | ~86 M | Imagen RGB | No entrenado ni evaluado en esta informacion | No disponible en esta ficha | Disponible como arquitectura generica en torchvision |

No se han encontrado en la busqueda web resultados relevantes sobre este modelo ni sobre alternativas comparables de imagen mamaria; los enlaces devueltos tratan sobre trazabilidad en cadenas de suministro de cuero y no guardan relacion con el modelo.

## Limitaciones y advertencias

- No validado para uso clinico. La model card restringe el uso a investigacion y docencia.
- BUSC presenta una exactitud casi perfecta (0,992) marcada explicitamente como no verificada; el analisis Grad-CAM muestra activacion difusa no localizada en la lesion, compatible con aprendizaje de atajos por ausencia de recorte de ROI en el preprocesamiento.
- mini-MIAS es un resultado debil (0,599): omite aproximadamente el 51 % de los casos malignos, con un sesgo claro hacia la clase benigna.
- BreastDM alcanza 0,880 de exactitud pero con especificidad de 0,542, es decir, alta tasa de falsos positivos en casos benignos.
- CDD-CESM (0,614) y CMMD (0,758) no son reproducciones ajustadas: no hay validacion cruzada, busqueda de aumento ni agregacion multi-vista, por lo que sus cifras deben tratarse como preliminares.
- Riesgo de fuga de datos: BUSI y BUSC no incluyen identificador de paciente en su publicacion original, por lo que las particiones son a nivel de imagen o de fila y pueden existir casi duplicados repartidos entre folds.
- Los archivos distribuidos son checkpoints de un unico fold, no ensembles ni promedios: la exactitud del archivo concreto puede desviarse de la media de 5 folds reportada, especialmente en BrEaST-Lesions USG (varianza entre folds de ±0,042) y mini-MIAS (±0,096).
- Riesgo de alucinacion en el sentido de falsos positivos y falsos negativos: ninguna exactitud por debajo de 1,0 garantiza descarte de malignidad; un falso negativo tiene consecuencias clinicas graves.
- Desequilibrio de clases y posible sobreajuste a las particularidades de adquisicion de cada dataset (mismo equipo, mismo centro), lo que limita la generalizacion a otros hospitales o protocolos.
- Sesgo demografico no evaluado: la model card no documenta la distribucion por edad, etnia, tipo de tejido mamario ni densidad mamaria de las cohortes.
- Licencia cc-by-4.0 para los checkpoints, con obligacion de atribucion. Los datasets de origen tienen sus propias licencias (varias CC BY 4.0 via TCIA, otras con condiciones especificas), por lo que la redistribucion de pesos derivados exige revisar los terminos de cada fuente.
- Sin soporte de texto, tool calling, agentes ni multilingueismo: cualquier uso conversacional o de generacion esta fuera de su alcance.
- Formato `.pth` especifico de PyTorch: requiere cargar la clase `models.SingleBackboneClassifier` del repositorio para que el state_dict sea utilizable.
- No se documentan versiones cuantizadas, calibracion de probabilidades ni umbrales de decision alternativos al 0,5 implicito.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/noe95/mmfm-breast-imaging-checkpoints
- Repositorio de codigo MMFM: https://github.com/NouranFadlallah/MMFM
- Informe completo y metodologia: `docs/latex/main.tex` en el repositorio MMFM
- Informe de resultados: `docs/results_report.md` en el repositorio MMFM
- Resultados por clase (sensibilidad, especificidad, sesgo FP frente a FN): `docs/per_class_results.md` en el repositorio MMFM
- Codigo del backbone: `models/backbone.py`; codigo de entrenamiento: `training/train.py` en el repositorio MMFM
- Dataset BUS-BRA: Gomez-Flores et al., 2024, Medical Physics, https://doi.org/10.1002/mp.16812
- Dataset BUSI: Al-Dhabyani et al., 2020, Data in Brief, https://doi.org/10.1016/j.dib.2019.104863
- Dataset BUSC: https://data.mendeley.com/datasets/vckdnhtw26/1
- Dataset BrEaST-Lesions USG: Pawlowska et al., 2024, Scientific Data, https://doi.org/10.1038/s41597-024-02984-z
- Dataset mini-MIAS: Suckling et al., 1994 (no se proporciona URL en la model card)
- Dataset BreastDM: Zhao et al., 2023, Computers in Biology and Medicine, https://doi.org/10.1016/j.compbiomed.2023.107255
- Dataset CDD-CESM: Khaled et al., 2022, Scientific Data, https://doi.org/10.1038/s41597-022-01238-0 ; acceso via TCIA: https://wiki.cancerimagingarchive.net/pages/viewpage.action?pageId=109379611
- Dataset CMMD: Cui et al., 2021, The Cancer Imaging Archive, https://doi.org/10.7937/tcia.eqde-4b16 ; coleccion: https://www.cancerimagingarchive.net/collection/cmmd/
- Nota: la busqueda web realizada no devolvio resultados relacionados con este modelo; los enlaces obtenidos corresponden a herramientas de trazabilidad en cadenas de suministro de cuero y no se incluyen por no ser relevantes.
