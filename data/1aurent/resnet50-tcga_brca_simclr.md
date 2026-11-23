# 1aurent/resnet50.tcga_brca_simclr

## Resumen

`1aurent/resnet50.tcga_brca_simclr` es un backbone de extraccion de caracteristicas basado en ResNet50, entrenado con aprendizaje autosupervisado (SimCLR) sobre aproximadamente 2 millones de parches de histologia del conjunto TCGA-BRCA (breast invasive carcinoma) del Atlas del Genoma del Cancer. Lo publica el usuario 1aurent en Hugging Face y se integra en el ecosistema `timm`, lo que permite cargarlo con una sola llamada y obtener embeddings de imagen listos para tareas downstream.

El modelo resuelve un problema concreto en patologia computacional: disponer de representaciones densas de parches histologicos sin necesidad de etiquetas, para alimentar clasificadores, sistemas de recuperacion o pipelines de analisis de tejido. Con 23,6 millones de parametros y entradas de 256x256x3, es lo bastante pequeno para ejecutarse en GPUs de consumo y para procesar grandes volumenes de parches en poco tiempo.

Es relevante porque el preentrenamiento autosupervisado en dominios medicos suele superar al preentrenamiento generico en ImageNet cuando se transfiere a tareas de histologia, y porque el modelo se publica con pesos en safetensors y licencia GPL-3.0. Su pipeline declarado es `feature-extraction`, aunque la model card tambien lo presenta como modelo de clasificacion de imagen evaluado sobre TCGA-BRCA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet50 (CNN residual, backbone de extraccion de caracteristicas) |
| Parametros totales | 23.561.152 (23,6 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen 256 x 256 x 3) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | GPL-3.0 |
| Formato de pesos | safetensors (repo de 0,1 GB) |

## Arquitectura y entrenamiento

La arquitectura es una ResNet50 estandar, es decir, una red neuronal convolucional con conexiones residuales organizada en bloques bottleneck. El modelo se usa como backbone: la salida de la cabeza de pooling produce un vector de caracteristicas por imagen, que es lo que devuelve la llamada `model(...)` en el ejemplo de la model card (tensor de forma `(batch_size, num_features)`). La entrada esperada es de 256 x 256 pixeles y 3 canales; las transformaciones de normalizacion y redimensionado se resuelven con `timm.data.resolve_model_data_config` y `timm.data.create_transform`.

El entrenamiento emplea SimCLR, un metodo de aprendizaje autosupervisado contrastivo que aprende representaciones a partir de pares aumentados de la misma imagen sin usar etiquetas. Segun la model card, se entrenó sobre 2 millones de parches de histologia de TCGA-BRCA, el conjunto de carcinoma invasivo de mama del proyecto TCGA. El trabajo de referencia es "Self-Supervised Vision Transformers Learn Visual Concepts in Histopathology" (Chen y Krishnan, arXiv:2203.00585), y el codigo original esta en el repositorio Self-Supervised-ViT-Path. No se documentan en la informacion disponible el numero exacto de tokens o pasos de entrenamiento, la composicion detallada de aumentos, ni si hubo fases de ajuste fino supervisado posteriores.

## Capacidades

- Extraccion de embeddings de imagenes de histologia: genera un vector de caracteristicas por parche de 256 x 256, apto para similitud, clustering y recuperacion.
- Clasificacion de imagen downstream: la model card declara evaluacion en tarea de clasificacion sobre TCGA-BRCA, con un AUC de 0,879 ± 0,069.
- Transferencia a tareas de patologia: sirve como inicializacion para clasificadores lineales o cabezas ligeras sobre tejido de mama.
- Procesamiento por lotes: al ser una CNN de 23,6 M de parametros, permite inferencia en batch sobre grandes colecciones de parches.
- Integracion con `timm`: carga mediante `timm.create_model(model_name="hf-hub:1aurent/resnet50.tcga_brca_simclr", pretrained=True)`.
- Sin soporte de tool calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un modelo visual.
- Capacidades multilingues: no aplica.

## Casos de uso

- Clasificacion de subtipos tumorales en patologia de mama: usar los embeddings del modelo como entrada de un clasificador supervisado entrenado con las etiquetas clinicas de TCGA-BRCA, aprovechando que el backbone ya ha visto 2 millones de parches del mismo dominio.
- Recuperacion de imagenes similares (image retrieval): indexar los vectores de caracteristicas de una coleccion de parches y buscar los mas cercanos a una consulta para localizar casos morfologicamente parecidos en un archivo histologico.
- Preetiquetado y triaje de laminas: procesar grandes volumenes de parches sin etiquetar y ordenarlos por similitud a prototipos de tejido tumoral o sano, para priorizar la revision por patologos.
- Control de calidad de datos de entrenamiento: detectar parches atipicos, artefactos o duplicados comparando embeddings y agrupandolos con clustering.
- Inicializacion de modelos para tareas de segmentacion o deteccion: congelar el backbone y entrenar cabezas ligeras sobre el para tareas de patologia con pocos datos etiquetados.
- Extraccion de caracteristicas para estudios de investigacion: generar representaciones reproducibles de cohortes TCGA para analisis estadisticos o modelos multimodales que combinen imagen y datos genomicos.
- Prototipado rapido en GPU de consumo: al ser un modelo de 23,6 M de parametros, se puede ejecutar en una RTX 3060 o similar para experimentos de laboratorio sin infraestructura dedicada.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Dataset | Tarea | Metrica | Valor |
|---|---|---|---|
| TCGA-BRCA | Image classification | AUC | 0,879 ± 0,069 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar, ya que no son aplicables a un modelo de vision. Tampoco se documentan comparaciones numericas con otros backbones de histologia.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 23,6 M de parametros en precision completa (FP32) los pesos ocupan aproximadamente 94 MB, y en FP16 unos 47 MB. La memoria dominante sera la de los lotes de imagenes de 256 x 256.
- GPU recomendadas: cualquier GPU moderna es suficiente; para procesar lotes grandes se recomiendan A100, H100, L4 o RTX 4090.
- GPU de consumo: cabe holgadamente en tarjetas con 6-8 GB de VRAM o menos, como RTX 3060, RTX 4060 o GTX 1660, siempre que se ajuste el tamano de batch.
- Opciones de despliegue: `timm` con PyTorch es la via documentada; tambien es posible exportar a TorchScript u ONNX para servir con ONNX Runtime o Triton, aunque estas rutas no se documentan en la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependeran de la GPU y del tamano de lote.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos numericos de modelos comparables (por ejemplo, otros backbones de histologia como CTransPath o los modelos de HistoSSLscaling) para construir una comparativa rigurosa. La siguiente tabla recoge solo los datos del modelo descrito y deja el resto como no disponible.

| Modelo | Parametros | Contexto/entrada | Licencia | Datos de rendimiento |
|---|---|---|---|---|
| 1aurent/resnet50.tcga_brca_simclr | 23,6 M | imagen 256 x 256 x 3 | GPL-3.0 | AUC 0,879 ± 0,069 en TCGA-BRCA |
| Alternativas de histologia autosupervisada | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dominio restringido: entrenado especificamente con parches de TCGA-BRCA (carcinoma invasivo de mama); su transferencia a otros tejidos u otras modalidades de imagen no esta documentada.
- Riesgo de sesgo de cohorte: TCGA-BRCA tiene una composicion demografica y de centros concreta, y el modelo puede heredar esos sesgos en las representaciones.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero un clasificador construido sobre estos embeddings puede producir predicciones erroneas con alta confianza en parches fuera de distribucion.
- Licencia GPL-3.0: es una licencia copyleft; el uso comercial y la distribucion de derivados pueden quedar sujetos a obligaciones de liberacion del codigo, lo que conviene revisar con asesoria legal antes de integrarlo en un producto propietario.
- Sin verificacion independiente: el AUC declarado (0,879 ± 0,069) figura como no verificado en el model-index y presenta una desviacion estandar elevada, lo que sugiere variabilidad entre pliegues o subconjuntos.
- Sin informacion sobre cuantizacion ni exportacion: no se documentan variantes GGUF, ONNX ni cuantizaciones, por lo que el despliegue en entornos no PyTorch requiere trabajo adicional.
- No es un modelo generativo ni linguistico: no admite instrucciones en lenguaje natural ni tool calling; cualquier uso debe plantearse como backbone de caracteristicas.
- Entrada fija de 256 x 256: resoluciones distintas requieren redimensionado, lo que puede degradar la informacion morfologica fina.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/1aurent/resnet50.tcga_brca_simclr
- Paper de referencia (arXiv:2203.00585): https://arxiv.org/abs/2203.00585
- Repositorio original Self-Supervised-ViT-Path: https://github.com/Richarizardd/Self-Supervised-ViT-Path/
- Licencia GPLv3 del repositorio original: https://github.com/Richarizardd/Self-Supervised-ViT-Path/blob/master/LICENSE
- Portal de datos TCGA (GDC): https://portal.gdc.cancer.gov/
- Repositorio HistoSSLscaling (imagen de ejemplo): https://github.com/owkin/HistoSSLscaling
- Libreria `timm`: https://github.com/huggingface/pytorch-image-models
