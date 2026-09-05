# Laddaphone/topoconf-mammography-edl

## Resumen

El modelo TopoConf (Laddaphone/topoconf-mammography-edl) es un sistema de clasificación de mamografías basado en aprendizaje profundo evidencial (EDL) sobre redes neuronales de grafos (GNN). Ha sido desarrollado por Laddaphone como parte de un trabajo de investigación titulado «Evidence Phenotypes Determine Optimal Uncertainty Channels for Safety-Critical Mammography Triage», presentado a la revista CMBBE: Imaging & Visualization. El problema que aborda es la detección de falsos negativos en el cribado de cáncer de mama, proporcionando canales de incertidumbre calibrados para un triaje clínico seguro.

La arquitectura combina un backbone ResNet-18 truncado en la capa 3 (reduciendo la dimensión de 256 a 128) con tres capas de Graph Attention Network (GAT) de 4 cabezas y 128 dimensiones, con conexiones residuales y LayerNorm. La cabeza de salida es una capa lineal de 128 a 2 neuronas seguida de una función Softplus más 1.0, que produce directamente los alphas de una distribución Dirichlet. El modelo tiene aproximadamente 2,9 millones de parámetros en las variantes con grafos, y 11,2 millones en el baseline ResNet. Está entrenado sobre tres conjuntos de datos públicos: CBIS-DDSM, INbreast y CMMD, todos en inglés según los metadatos.

Su relevancia actual radica en la necesidad de herramientas de inteligencia artificial que no solo clasifiquen, sino que cuantifiquen su propia incertidumbre en entornos médicos de alto riesgo. TopoConf introduce un diagnóstico denominado S-ratio (S_FN / S_correct) que permite decidir qué canal de incertidumbre utilizar (vacuidad o entropía predictiva) en función del fenotipo de evidencia del conjunto de calibración. Los resultados reportados indican que, en CBIS-DDSM, la señal de vacuidad captura el 97,5% de los falsos negativos con una carga de revisión del 42%, mientras que en dominios digitales (INbreast y CMMD) la entropía predictiva es el mejor indicador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 truncado en layer3 + 3 capas GAT (4 cabezas, 128 dim) con residuos y LayerNorm; cabeza EDL (Linear(128,2) + Softplus + 1.0) |
| Parametros totales | ~2.9M (modelos de grafos), ~11.2M (baseline ResNet) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision medica) |
| Tipos de cuantizacion | No disponible (checkpoints en .pt) |
| Idiomas soportados | Ingles (segun metadatos) |
| Licencia | MIT |
| Formato de pesos | Checkpoints PyTorch (.pt) |

## Arquitectura y entrenamiento

TopoConf no es un modelo de lenguaje, sino un clasificador discriminativo de imágenes médicas. La arquitectura parte de un ResNet-18 preentrenado truncado en la capa 3, que extrae características de 256 dimensiones y las proyecta a 128. Estas características se modelan como nodos de un grafo, sobre el que se aplican tres capas de GAT con 4 cabezas de atención, dimensiones internas de 128, conexiones residuales y LayerNorm. La salida del grafo alimenta una cabeza de aprendizaje evidencial que produce alphas de una distribución Dirichlet mediante una capa lineal seguida de Softplus y una suma de 1.0. Los modelos no evidenciales (Softmax, MCDrop, GCN, ResNet) devuelven logits crudos.

El entrenamiento utiliza la pérdida de verosimilitud máxima de tipo II con función digamma, más una regularización KL con coeficiente 0,01. El optimizador es Adam con tasa de aprendizaje 1e-4 y programación de coseno. Se aplican pesos de clase [1.0, 5.0] para las clases benigna y maligna, respectivamente. Se entrenan 80 épocas con early stopping de 15 épocas. Las particiones de datos son disjuntas por paciente: 50% entrenamiento, 15% validación, 15% calibración y 20% test. Se ejecutan 10 semillas aleatorias (42-51) para cada configuración. Los checkpoints disponibles incluyen variantes NoTopo, TopoConf, Softmax, MCDrop, GCN y ResNet, así como modelos cross-domain de CBIS a INbreast.

## Capacidades

- Clasificación binaria de mamografías en categorías benigna y maligna, con salida en forma de alphas Dirichlet.
- Cuantificación de incertidumbre evidencial mediante dos canales principales: vacuidad (2.0 / S, donde S es la suma de alphas) y entropía predictiva.
- Detección de falsos negativos en cribado: en el conjunto CBIS-DDSM, la señal de vacuidad captura el 97,5% de los falsos negativos con una carga de revisión del 42%.
- Diagnóstico de fenotipos de evidencia mediante el S-ratio (S_FN / S_correct), que determina qué canal de incertidumbre es óptimo para un conjunto de calibración.
- Soporte para análisis de subgrupos clínicos y estudios de adaptación de dominio entre mamografía digitalizada (film) y digital (FFDM).
- No es un modelo generativo: no soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.

## Casos de uso

- Triaje de mamografías en programas de cribado poblacional: el modelo puede identificar automáticamente casos de alta incertidumbre (vacuidad) y derivarlos a revisión manual, reduciendo la carga de trabajo del radiólogo. En CBIS-DDSM, este enfoque detecta el 97,5% de los falsos negativos con un 42% de casos revisados.
- Apoyo a la decisión clínica en entornos con recursos limitados: al proporcionar una medida de incertidumbre calibrada, el modelo permite priorizar los casos que requieren una segunda lectura o una prueba diagnóstica adicional.
- Investigación en incertidumbre para imágenes médicas: TopoConf sirve como referencia para estudiar qué canal de incertidumbre (vacuidad o entropía) es más fiable en distintos dominios y fenotipos de evidencia, mediante el análisis del S-ratio.
- Adaptación de dominio entre modalidades de imagen: los checkpoints cross-domain (CBIS→INbreast) permiten evaluar el comportamiento del modelo al transferir de mamografía digitalizada a digital, útil para desplegar modelos en centros con equipos distintos.
- Análisis de subgrupos clínicos: los resultados precomputados en `cbis_subgroup_analysis.csv` permiten identificar fenotipos de falsos negativos por subgrupo, facilitando el ajuste de umbrales de triaje por población.
- Evaluación de estrategias de triaje con carga de trabajo ajustada: las tablas `triage_matched_workload.csv` y `triage_75pct.csv` proporcionan datos para calibrar umbrales de revisión según el nivel de carga aceptado, lo que resulta útil para planificar recursos clínicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas estándar como exactitud, AUC o sensibilidad específica. No obstante, el repositorio contiene tablas de análisis precomputadas en la carpeta `results/`:

- `error_prediction.csv`: AUROC corregido para los canales de incertidumbre (E[H], MI, vacuidad, H_pred).
- `triage_75pct.csv`: resultados de triaje al percentil 75 con señales antiguas y corregidas.
- `triage_matched_workload.csv`: captura de falsos negativos en 7 niveles de carga.
- `three_dataset_comprehensive.csv`: S-ratio y métricas completas en los tres conjuntos de datos.
- `directional_prediction.csv`: análisis de ventaja de triaje según R_S.
- `cbis_subgroup_analysis.csv`: fenotipos de falsos negativos por subgrupo clínico.
- `results/ablation/`: ablationes de pesos de clase, coeficiente KL y deep ensembles.

Estos datos están disponibles en el repositorio, pero no se han publicado valores concretos en la model card, por lo que no se pueden citar cifras exactas en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente, pero al tratarse de un modelo de ~2,9M parámetros, el peso en FP32 ocupa aproximadamente 12 MB. Cualquier GPU con 1 GB de VRAM es suficiente para la inferencia.
- GPU recomendadas: no se especifican. Es viable en GPUs de consumo como RTX 3060, RTX 4090 o incluso en CPU para lotes pequeños.
- Despliegue: el modelo se distribuye como checkpoints PyTorch (.pt). Puede cargarse con la clase `TopoConfGNN` del código de entrenamiento. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada. Dado el tamaño reducido, se espera una latencia baja en GPU, pero no hay datos empíricos publicados.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparativas con otros modelos de mamografía ni con modelos de la misma categoría. Los únicos modelos mencionados son los propios del estudio (NoTopo, TopoConf, Softmax, MCDrop, GCN, ResNet), que son variantes internas del mismo sistema. No se dispone de datos de rendimiento de modelos externos para establecer una comparación.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se ha entrenado exclusivamente en CBIS-DDSM, INbreast y CMMD, todos ellos de origen estadounidense y europeo. Puede no generalizar a poblaciones de otras regiones ni a equipos de mamografía diferentes a los utilizados en esos conjuntos.
- Riesgo de alucinación: no aplica, al ser un modelo discriminativo que no genera texto ni contenido sintético.
- Limitaciones de contexto o idioma: no aplica en el sentido de los modelos de lenguaje. El modelo procesa imágenes, no texto.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificación y redistribución, siempre que se incluya el aviso de copyright y licencia.
- Caveats para producción: la efectividad del triaje depende críticamente del S-ratio calculado en el conjunto de calibración. Si el S-ratio difiere de los valores reportados (0.584 en CBIS-DDSM, 0.983 en INbreast, 1.109 en CMMD), el canal de incertidumbre óptimo puede cambiar. Se recomienda recalcular el S-ratio antes de desplegar el modelo en un nuevo entorno.
- El modelo no está validado clínicamente como dispositivo médico. Debe utilizarse como herramienta de apoyo a la decisión y no como sustituto del diagnóstico de un radiólogo.

## Enlaces

- HuggingFace: https://huggingface.co/Laddaphone/topoconf-mammography-edl
- GitHub: https://github.com/Laddaphone/Topoconf
- Paper (referencia, sin enlace directo): «Evidence Phenotypes Determine Optimal Uncertainty Channels for Safety-Critical Mammography Triage», presentado a CMBBE: Imaging & Visualization.
