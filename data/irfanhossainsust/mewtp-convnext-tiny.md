# irfanhossainsust/mewtp-convnext-tiny

## Resumen

MEWTP ConvNeXt-Tiny es un clasificador binario de imagenes que decide si un recorte de 1 km x 1 km de imagen satelital Sentinel-2 contiene una planta de tratamiento de agua (residual, potable o desalinizacion) en Oriente Medio. Lo desarrolla Irfan Hossain (usuario irfanhossainsust) y se publica bajo licencia CC BY 4.0 con un tamano de repositorio de 0,2 GB.

El modelo resuelve un problema de teledeteccion concreto: la localizacion y el inventariado de infraestructura hidrica en una region donde los registros oficiales son incompletos. Se apoya en ConvNeXt-Tiny inicializado con pesos de ImageNet y ajustado sobre el dataset Middle East Water Treatment Plants in Satellite Imagery, con tres variantes de pesos (RGB, 6 bandas y un ensemble de ambas).

Su relevancia actual es acotada pero clara: es un ejemplo de "geoai" reproducible, con notebook de entrenamiento publico, metricas de test desglosadas por pais y una declaracion de limitaciones inusualmente explicita. No es un modelo de lenguaje ni tiene capacidades generativas: es un cabezal de clasificacion de una sola logit sobre imagenes de 224 px. El autor advierte que las probabilidades no estan calibradas y que el modelo no debe usarse para cartografiado sin supervision humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Tiny (torchvision), cabezal de una sola logit para clasificacion binaria |
| Parametros totales | no disponible en la informacion proporcionada (la variante Tiny de ConvNeXt en torchvision ronda los 28 M, dato no confirmado por el autor) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen, no secuencias de texto) |
| Tipos de cuantizacion | no disponible; se distribuyen checkpoints PyTorch en precision completa |
| Idiomas soportados | no aplica (clasificacion de imagenes; sin capacidades linguisticas) |
| Licencia | CC BY 4.0 (pesos) |
| Formato de pesos | PyTorch `.pt` (`convnext_tiny_rgb_v2.pt`, `convnext_tiny_6band_v2.pt`) acompanados de `config.json` e `inference.py` |
| Tarea | image-classification (binaria: planta de tratamiento vs. no planta) |
| Resolucion de entrada | RGB: 256 px -> 224; 6 bandas: 100 x 100 a 10 m -> 224 |
| Bandas | RGB (B04/B03/B02) o 6 bandas (B02, B03, B04, B08, B11, B12) |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-10-02 (actualizado 2026-10-02) |
| Dataset de entrenamiento | irfanhossainsust/middle-east-water-treatment-satellite |

## Arquitectura y entrenamiento

La base es un ConvNeXt-Tiny de `torchvision` inicializado con pesos de ImageNet y sustituyendo la cabeza original por una unica logit. El entrenamiento se hizo con AdamW (lr 3e-4, weight decay 0,05), schedule coseno con un epoch de calentamiento, 12 epochs, batch de 64 y precision mixta sobre una Tesla T4 de Kaggle (unos 11 minutos por epoch). La aumentacion incluye random resized crop (0,75-1), volteos, rotaciones de 90 grados y color jitter; en inferencia se aplica TTA con la identidad y dos volteos.

El punto mas interesante es la limpieza de etiquetas, aplicada solo al conjunto de entrenamiento: un ConvNeXt de 5 folds out-of-fold (ROC-AUC OOF 0,927) descarto 447 imagenes positivas de 149 instalaciones con P(planta) media inferior a 0,25 y repondero por 3 un conjunto de 192 negativos confundibles (mayoritariamente comerciales o urbanos, almacenamiento de agua y balsas). Las etiquetas de validacion y test no se tocaron. La variante de 6 bandas expande la primera convolucion a 6 canales (los pesos RGB se mapean a B04/B03/B02 y NIR/SWIR se inicializan desde su media) con estandarizacion por banda. El autor indica que esta variante no supero a la RGB en test.

## Capacidades

- Clasificacion binaria de recortes Sentinel-2 L2A de aproximadamente 1000 m de extension centrados en el sitio de interes.
- Inferencia sobre chips RGB en PNG con estirado lineal de reflectancia BOA en el rango 0-0,40.
- Inferencia sobre arrays de 6 bandas `uint16` con forma `[N, 6, 100, 100]` (B02, B03, B04, B08, B11, B12).
- Modo ensemble: media de las probabilidades de las variantes RGB y 6 bandas, con umbral propio de 0,30.
- Umbrales ajustados en validacion por variante (0,05 para RGB v2, 0,20 para 6 bandas).
- Ejecucion por linea de comandos (`python inference.py chip1.png chip2.png`) o por API Python mediante `inference.predict_rgb` y `inference.predict_six_band`.
- Desglose de rendimiento por pais en el conjunto de test (AE, EG, IL, IQ, JO, KW, OM, SA).
- No dispone de tool calling, agentes, razonamiento multi-paso, generacion de texto, vision generalista, audio ni capacidades multilingues.

## Casos de uso

- Cribado de inventario hidrico regional: aplicar el clasificador sobre teselas Sentinel-2 de 1 km para producir una lista priorizada de candidatos a planta de tratamiento en los 11 paises de Oriente Medio cubiertos, que despues se confirma manualmente.
- Priorizacion de inspecciones en organismos reguladores: dado que la prevalencia real de plantas es baja y los falsos positivos dominan, el modelo se usa como filtro de primera etapa para decidir que zonas merecen una revision documental o una visita de campo.
- Investigacion academica sobre expansion de infraestructura: con un ROC-AUC de 0,957 en test, sirve para construir series temporales aproximadas aplicando el modelo a imagenes de distintos anos y estimar la aparicion de nuevas instalaciones, siempre con validacion posterior.
- Generacion de etiquetas debiles para nuevos datasets: las salidas del modelo pueden preanotar grandes volumenes de chips que luego se depuran con el mismo esquema out-of-fold descrito en la model card.
- Integracion en pipelines geoespaciales: los chips se pueden extraer con herramientas tipo SNAP, Google Earth Engine o rasterio y pasar a `inference.py` por lotes dentro de un flujo automatizado de procesamiento por teselas.
- Analisis de confundibles en planificacion urbana: la matriz de falsos positivos del autor (4,6 % en negativos ordinarios, 9,4 % en negativos dificiles, 8,0 % en zonas urbanas) permite usar el modelo para estudiar que estructuras se confunden con plantas (parques de tanques, balsas industriales, naves).
- Apoyo en contextos de emergencia hidrica o conflicto: cribado rapido de zonas sin inventario actualizado, con confirmacion humana obligatoria antes de cualquier decision operativa.
- Experimentacion en teledeteccion con pocos recursos: al ser un ConvNeXt-Tiny entrenable en una T4 en unos 11 minutos por epoch, sirve como punto de partida reproducible para comparar variantes espectrales o esquemas de limpieza de etiquetas.

## Benchmarks y rendimiento

Resultados declarados por el autor en el split de test (1.772 imagenes de zonas no vistas en entrenamiento). Las metricas del model-index figuran como `verified: false`.

| Modelo | ROC-AUC | Accuracy | Precision | Recall | F1 | FPR neg. ordinarios | FPR neg. dificiles | FPR urbano |
|---|---|---|---|---|---|---|---|---|
| ConvNeXt-Tiny RGB v2 (recomendado) | 0,957 | 0,904 | 0,847 | 0,817 | 0,832 | 4,6 % | 9,4 % | 8,0 % |
| ConvNeXt-Tiny 6 bandas v2 | 0,954 | 0,888 | 0,796 | 0,827 | 0,811 | 7,2 % | 12,1 % | 14,7 % |
| Ensemble (media de ambos) | 0,958 | 0,899 | 0,832 | 0,817 | 0,824 | 5,0 % | 11,1 % | 9,7 % |
| ConvNeXt-Tiny RGB v1 (sin limpieza adicional) | 0,957 | 0,897 | 0,816 | 0,831 | 0,824 | 6,9 % | 9,4 % | 13,9 % |

ROC-AUC por pais en test para RGB v2: AE 0,974 · EG 0,981 · IL 0,986 · IQ 0,944 · JO 0,989 · KW 0,987 · OM 0,909 · SA 0,918.

No se han publicado en la informacion disponible comparaciones con otros modelos de teledeteccion, ni resultados en benchmarks genericos (MMLU, HumanEval, GSM8K) por tratarse de un clasificador de imagenes.

## Requisitos de hardware

- VRAM estimada para inferencia: no confirmada por el autor. Un ConvNeXt-Tiny en precision completa con lotes pequenos ocupa del orden de 1-2 GB, por lo que cualquier GPU con 4 GB o mas deberia ser suficiente (estimacion, no dato oficial).
- GPU utilizadas en entrenamiento: Kaggle Tesla T4 (16 GB), batch 64 con precision mixta y aproximadamente 11 minutos por epoch durante 12 epochs.
- GPU recomendadas para entrenamiento o fine-tuning: Tesla T4, RTX 3060/4090 o superiores; el coste es bajo porque la resolucion de entrada es 224 px.
- Inferencia en GPU de consumo: si, cabe en practicamente cualquier GPU consumer moderna (GTX 1650 en adelante) y tambien en CPU para lotes pequenos, dado el tamano del repositorio (0,2 GB).
- Opciones de despliegue: PyTorch nativo mediante `huggingface_hub.snapshot_download` e importacion de `inference.py`; ejecucion por CLI con `python inference.py chip1.png chip2.png`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de vision) ni exportaciones a ONNX o TorchScript.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | ROC-AUC (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mewtp-convnext-tiny (RGB v2) | no disponible (ConvNeXt-Tiny) | chip Sentinel-2 RGB de 1 km, 224 px | 0,957 | CC BY 4.0 | HuggingFace, 0 descargas |
| mewtp-convnext-tiny (6 bandas v2) | no disponible (ConvNeXt-Tiny) | array de 6 bandas, 100 x 100 a 10 m | 0,954 | CC BY 4.0 | mismo repositorio |
| mewtp-convnext-tiny (ensemble) | no disponible (ConvNeXt-Tiny) | ambas entradas | 0,958 | CC BY 4.0 | mismo repositorio |
| Modelos alternativos de clasificacion de plantas de tratamiento en Sentinel-2 | no disponible | no disponible | no disponible | no disponible | no se han encontrado referencias en la informacion disponible |

No se dispone de datos sobre otras arquitecturas comparables (ResNet, ViT, EfficientNet) entrenadas sobre el mismo dataset, por lo que la comparativa externa queda como no disponible.

## Limitaciones y advertencias

- Etiquetas debiles: los positivos del dataset estan filtrados por modelo, no verificados por humanos; las metricas de test incluyen ruido de etiquetado.
- No apto para cartografiado sin supervision: aproximadamente 1 de cada 7 predicciones positivas es incorrecta y, dado que las plantas son raras en el terreno, los falsos positivos dominan en un uso a gran escala. Debe emplearse como herramienta de cribado con confirmacion humana.
- Confundibles conocidos: parques de tanques, balsas industriales, naves y bloques urbanos densos. Las tasas de falsos positivos documentadas son 4,6 % en negativos ordinarios, 9,4 % en negativos dificiles y 8,0 % en zonas urbanas para la variante RGB v2.
- Probabilidades no calibradas: el fuerte reponderado de clases hace obligatorio usar los umbrales ajustados en validacion que figuran en `config.json` (0,05 para RGB v2, 0,20 para 6 bandas, 0,30 para el ensemble).
- Cobertura geografica limitada: entrenado sobre 11 paises de Oriente Medio a 10 m de resolucion. Otras regiones y otros sensores no han sido probados.
- Instalaciones pequenas: las plantas compactas o de tipo paquete pueden ser invisibles a 10 m de resolucion.
- Rendimiento desigual por pais: el ROC-AUC por pais va de 0,909 (Oman) a 0,989 (Jordania), lo que implica un comportamiento notablemente peor en algunas zonas.
- La variante de 6 bandas no mejoro a la RGB en test, pese a su mayor coste de preparacion de datos.
- Licencia: los pesos son CC BY 4.0, lo que permite uso comercial con atribucion. Las imagenes de entrenamiento contienen datos Copernicus Sentinel modificados (2019-2025); las etiquetas derivan de OpenStreetMap (ODbL), HydroWASTE (CC BY 4.0) y Wikidata (CC0), y la inicializacion ImageNet proviene de torchvision (BSD-3-Clause). Hay que respetar las condiciones de cada fuente al redistribuir.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de las metricas (`verified: false`).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/irfanhossainsust/mewtp-convnext-tiny
- Dataset de entrenamiento: https://huggingface.co/datasets/irfanhossainsust/middle-east-water-treatment-satellite
- Espejo del dataset en Kaggle: https://www.kaggle.com/datasets/irfanhossain2025/middle-east-water-treatment-satellite
- Notebook de entrenamiento: https://www.kaggle.com/code/irfanhossain2025/mewtp-classification-models-v2
- Cita del autor: Hossain, Irfan (2026), "Middle East Water Treatment Plants in Satellite Imagery", https://huggingface.co/datasets/irfanhossainsust/middle-east-water-treatment-satellite
- Referencia de etiquetas: HydroWASTE (Ehalt Macedo et al., 2022, CC BY 4.0)
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces obtenidos no guardan relacion con el ambito de la ficha y se omiten.
