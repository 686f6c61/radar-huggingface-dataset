# sampa-project/PhD-kavran

## Resumen

PhD-kavran es un checkpoint de segmentación semántica espacio-temporal de uso y cobertura del suelo sobre imágenes de satélite, publicado por `sampa-project` en HuggingFace. No es un modelo de lenguaje: es un pipeline de visión por computador que combina un extractor de características convolucional (ShuffleNetV2-x0.5) con una red neuronal de grafos heterogénea (Heterogeneous Graph Transformer, HGT) para clasificar regiones homogéneas de imágenes multiespectrales a lo largo de una serie temporal.

El modelo es el artefacto entrenado de la tesis doctoral *Method for Spatiotemporal Semantic Segmentation of Land Use on Satellite Imagery Using Graph Neural Networks*, defendida por Domen Kavran en la Universidad de Maribor (UM FERI) en marzo de 2026, con Niko Lukač como mentor. El problema que aborda es la clasificación de uso del suelo en series temporales de satélite evitando el coste computacional de aplicar un transformer denso a cada fotograma: primero segmenta cada imagen en regiones, construye un grafo con aristas espaciales y aristas temporales dirigidas entre regiones, muestrea subgrafos alrededor de cada nodo objetivo y clasifica cada nodo con la GNN.

Con solo 0,9 M de parámetros, el modelo es extremadamente ligero y está pensado para inferencia sobre grafos preconstruidos, no sobre píxeles en bruto. Está evaluado sobre DynamicEarthNet (PlanetScope) con 7 clases de cobertura y reporta mejoras estadísticamente significativas frente a GASSL, SeCo, SatMAE y TOV. Su relevancia actual es doble: por un lado, demuestra que una GNN minúscula puede superar a modelos fundacionales de teledetección mucho mayores en este benchmark concreto; por otro, sirve como referencia reproducible para pipelines de segmentación espacio-temporal basados en grafos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline híbrido CNN + GNN: extractor de características ShuffleNetV2-x0.5 (1024-d) y Heterogeneous Graph Transformer (`MyModelGraphTransformer`) con 1 capa HGT oculta de 8 cabezas × 16 features, seguida de una capa HGT de salida y layer normalisation |
| Parametros totales | 0,9 M |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: no es un modelo de lenguaje; la "ventana" es el subgrafo muestreado, con 0 pasos espaciales, 1 paso temporal hacia el pasado y fanout 2) |
| Tipos de cuantizacion | no disponible (el repositorio distribuye un state dict en PyTorch de precisión estándar) |
| Idiomas soportados | en, sl (metadatos del repositorio; el modelo no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | PyTorch state dict (`best_model.pt`), con `config.json`, `train_set_normalization_data.json` y código auxiliar Python |
| Tarea (pipeline) | image-segmentation (semantic segmentation espacio-temporal) |
| Entrada | Recortes (bounding boxes) de 32 × 32 px con 4 canales (RGB + NIR), normalizados con las medias y desviaciones del conjunto de entrenamiento, más un grafo por región (`graph.pickle` + `segmentation_masks.pickle`) |
| Clases de salida | 7: superficie impermeable, agricultura, bosque y otra vegetación, humedales, suelo, agua, nieve y hielo |
| Dataset de evaluación | DynamicEarthNet (PlanetScope) |
| Fecha de creacion | 2026-10-02 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El método sigue un flujo de cuatro etapas. Primero, cada imagen de la serie temporal se segmenta en regiones. Segundo, se construye un grafo en el que los nodos son esas regiones y las aristas son espaciales (entre regiones vecinas dentro del mismo fotograma) y temporales dirigidas (entre la misma región en instantes consecutivos). Tercero, para cada región objetivo se muestrea un subgrafo dirigido de vecinos espaciales y temporales con el componente `ProposedSampler`; el checkpoint publicado usa vecindad temporal con 0 pasos espaciales, 1 paso temporal hacia el pasado y fanout 2. Cuarto, un CNN extrae características del bounding box de 32 × 32 px y 4 canales de cada nodo del subgrafo, esas características alimentan la HGT heterogénea, y la red clasifica el nodo objetivo. Las predicciones por nodo se reproyectan después a píxeles, produciendo una serie temporal de mapas de uso del suelo (índice 255 reservado para píxeles sin región).

La innovación principal es trasladar el problema de segmentación espacio-temporal de píxeles a un problema de clasificación de nodos sobre un grafo de regiones, lo que reduce drásticamente el coste frente a aplicar un backbone denso a cada fotograma. El modelo es deliberadamente pequeño: 0,9 M de parámetros en total, con ShuffleNetV2-x0.5 como extractor y una única capa HGT oculta de 8 cabezas × 16 features. La arquitectura es heterogénea (tipos de nodo y de arista distintos para relaciones espaciales y temporales) y emplea normalización por capas. No hay información disponible sobre el número exacto de tokens de entrenamiento, la composición del dataset de entrenamiento, ni sobre el uso de RLHF o DPO, que en cualquier caso no aplicarían a un modelo de visión.

## Capacidades

- Segmentación semántica de uso y cobertura del suelo en 7 clases sobre imágenes satelitales multiespectrales (RGB + NIR).
- Modelado espacio-temporal: la vecindad temporal de 1 paso hacia el pasado permite explotar la coherencia entre instantes consecutivos de la serie.
- Clasificación por regiones con reproyección a mapas de píxeles de forma `(T, H, W)`.
- Generalización a series temporales arbitrarias siempre que existan los grafos y las máscaras de segmentación precalculados.
- Extracción de características de recortes individuales de 32 × 32 px mediante ShuffleNetV2-x0.5 (1024 dimensiones).
- Capacidad multilingüe: no aplica; los idiomas en, sl son metadatos del repositorio, no prestaciones del modelo.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no aplica.
- Modo "thinking", visión general de propósito amplio, audio: no disponible.

## Casos de uso

- Cartografía de cobertura del suelo a escala regional: procesando la serie temporal completa de una zona con PlanetScope, el modelo genera mapas anuales o mensuales de las 7 clases, útiles para inventarios de suelo y planificación territorial.
- Monitorización de expansión urbana: la clase "superficie impermeable" permite cuantificar el avance de la urbanización entre dos fechas comparando los mapas `(T, H, W)` generados para la misma zona.
- Seguimiento de masas de agua y humedales: con F1 de 0,9159 e IoU de 0,8449 en la clase agua, el modelo es adecuado para detectar cambios en láminas de agua y humedales en series temporales.
- Monitorización agrícola: la clase "agricultura" permite estimar superficies cultivadas y su evolución estacional, como insumo para modelos de rendimiento o para control de subvenciones.
- Detección de deforestación y cambios en vegetación: la clase "bosque y otra vegetación" (F1 0,7890, IoU 0,6515) sirve para localizar pérdidas de cobertura arbórea dentro de una serie temporal.
- Análisis de suelo desnudo y degradación: la clase "suelo" (F1 0,6561, IoU 0,4882) permite identificar superficies expuestas asociadas a laboreo, erosión o preparación de terreno.
- Seguimiento de nieve y hielo: la clase "nieve y hielo" habilita estudios de cobertura nivosa estacional o de glaciares a partir de series multiespectrales.
- Investigación reproducible en teledetección: el repositorio incluye el notebook `run_proposed_method.ipynb` y la librería `proposed_method_lib/`, lo que permite reproducir el pipeline completo o sustituir el clasificador por variantes propias manteniendo la construcción de grafos.
- Componente de un pipeline GIS mayor: al integrarse vía `snapshot_download` y Python puro, el modelo se puede insertar como etapa de clasificación dentro de un flujo que construya los grafos con `source/data_preparation/1_prepare_graphs.ipynb`.

## Benchmarks y rendimiento

Resultados reportados sobre DynamicEarthNet (los valores proceden del resumen de la tesis doctoral, según la model card):

| Metodo | mIoU | mF1 |
|---|---|---|
| Propuesto, vecindad espacial | 0,4145 ± 0,0051 | no disponible |
| Propuesto, vecindad temporal | no disponible | 0,5202 ± 0,0103 |
| GASSL (mejor modelo fundacional del estado del arte) | 0,3823 ± 0,0156 | 0,4908 ± 0,0198 |

El mejor modelo entrenado, el de vecindad temporal, alcanzó un wF1 de 0,6905. Resultados por clase para ese checkpoint:

| Clase | F1 | IoU |
|---|---|---|
| Agua | 0,9159 | 0,8449 |
| Bosque y otra vegetación | 0,7890 | 0,6515 |
| Suelo | 0,6561 | 0,4882 |

La model card indica que el método también se comparó con SeCo, SatMAE y TOV, y que las mejoras son estadísticamente significativas frente a todos los métodos comparados, aunque no se publican las cifras concretas de esas tres comparaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no se publica ninguna cifra. Con 0,9 M de parámetros, el state dict en fp32 ocupa del orden de unos pocos megabytes y la inferencia cabe holgadamente en menos de 1 GB de memoria (estimación derivada del recuento de parámetros, no un dato publicado).
- GPU recomendadas: no disponible. El tamaño del modelo hace que la GPU no sea un requisito; cualquier GPU con soporte CUDA para la build de DGL correspondiente es suficiente.
- Cabe en GPU de consumo: sí, con total seguridad por tamaño; la limitación real es la compatibilidad de la build de DGL con la versión de PyTorch y CUDA instalada, no la memoria.
- CPU: la inferencia en CPU es viable dado el tamaño, aunque no se publican latencias.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje y no expone pesos en GGUF ni una interfaz de `transformers`. El despliegue se hace con PyTorch + DGL, cargando `landuse_model.py` desde el snapshot del repositorio.
- Dependencias exactas indicadas en la model card: `torch==2.4.0`, `torchvision==0.19.0`, `dgl` (rueda compilada para torch 2.4), `torchdata==0.8.0`, `pydantic`, `huggingface_hub`, `networkx`, `matplotlib`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Comparación con alternativas de la misma categoría (segmentación de uso del suelo en teledetección). Solo se dispone de cifras de GASSL; el resto de datos no están publicados en la información disponible.

| Modelo | Parametros | Contexto / entrada | mIoU (DynamicEarthNet) | mF1 (DynamicEarthNet) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PhD-kavran (propuesto) | 0,9 M | Subgrafo de regiones, recortes 32 × 32 px RGB+NIR, 1 paso temporal | 0,4145 ± 0,0051 (vecindad espacial) | 0,5202 ± 0,0103 (vecindad temporal) | no disponible | HuggingFace + GitHub |
| GASSL | no disponible | no disponible | 0,3823 ± 0,0156 | 0,4908 ± 0,0198 | no disponible | no disponible |
| SeCo | no disponible | no disponible | comparado, cifra no publicada | comparado, cifra no publicada | no disponible | no disponible |
| SatMAE | no disponible | no disponible | comparado, cifra no publicada | comparado, cifra no publicada | no disponible | no disponible |
| TOV | no disponible | no disponible | comparado, cifra no publicada | comparado, cifra no publicada | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no disponible: al no declararse licencia en HuggingFace ni en la model card, no hay autorización explícita de uso comercial. En ausencia de licencia, los derechos quedan reservados por defecto al autor; cualquier uso en producción requiere contacto previo con el autor.
- No es un modelo de lenguaje: no procesa texto ni instrucciones, no soporta tool calling ni razonamiento multi-paso, y no debe evaluarse con benchmarks tipo MMLU o GSM8K.
- Requiere preprocesado propio: el modelo no consume imágenes en bruto, sino grafos y máscaras de segmentación generados por los notebooks del repositorio de GitHub. Sin ese pipeline previo el checkpoint es inutilizable.
- Dependencia estricta de versiones: DGL debe coincidir con la versión de PyTorch, y la model card fija `torch==2.4.0`, `torchvision==0.19.0` y `torchdata==0.8.0`. Esto complica la integración en entornos con versiones más recientes y en imágenes de contenedor ya existentes.
- Inconsistencia de identificadores: el ejemplo de uso de la model card descarga `SAMPA-Project/spatiotemporal-land-use-segmentation-gnn`, mientras que el ID del repositorio en HuggingFace es `sampa-project/PhD-kavran`. Conviene verificar cuál de los dos está disponible realmente antes de automatizar la descarga.
- Rendimiento desigual por clase: las tres únicas clases con métricas publicadas muestran una horquilla amplia (de IoU 0,8449 en agua a 0,4882 en suelo). No hay métricas publicadas para superficie impermeable, agricultura, humedales ni nieve y hielo, que suelen ser las clases más difíciles en este tipo de benchmarks.
- Sensibilidad a la resolución y al sensor: el modelo está entrenado sobre DynamicEarthNet, derivado de PlanetScope. No hay evidencia publicada de transferencia a otros sensores, resoluciones o composiciones de bandas distintas de RGB + NIR.
- Riesgo de error en regiones mal segmentadas: como la unidad de predicción es la región previamente segmentada, errores en la segmentación inicial se propagan directamente a los mapas finales.
- Sesgos geográficos y temporales: no se documenta la distribución geográfica ni el rango temporal del conjunto de entrenamiento, por lo que se desconoce el sesgo hacia determinadas latitudes, estaciones o tipos de paisaje.
- Adopción mínima: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación independiente por parte de terceros.
- Idiomas: los metadatos declaran en y sl, pero esto solo refleja el idioma de la documentación (la tesis está en esloveno), no una capacidad multilingüe del modelo.
- Los resultados de benchmark proceden del resumen de la tesis, no de una evaluación reproducible publicada con código y semillas fijas; los intervalos de confianza indican variabilidad no trivial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sampa-project/PhD-kavran
- Tesis doctoral (Digital Library of the University of Maribor): https://dk.um.si/IzpisGradiva.php?lang=slv&id=95633
- Repositorio de código: https://github.com/SAMPA-Project/PhD-kavran
- Contacto del autor: domen.kavran1@um.si
- Los resultados de la búsqueda web no devolvieron enlaces relevantes al modelo: todas las coincidencias corresponden a Sampa, fabricante de recambios para vehículos industriales, sin relación con el proyecto. No se han encontrado papers, blogs ni demos adicionales.
