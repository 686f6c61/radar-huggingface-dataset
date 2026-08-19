# Chtholly17/epifoundation-compass-dann

## Resumen

EpiFoundation — CompassDB DANN es un modelo fundacional basado en transformer para datos multi-ómicos de célula única, desarrollado por Juncheng Wu (Chtholly17) en el grupo UCSC-VLAA. Está diseñado para aprender representaciones de células a partir de datos emparejados de ATAC-seq (accesibilidad de cromatina) y RNA-seq (expresión génica), integrando ambas modalidades en un único espacio de embedding. El modelo se preentrena en el conjunto de datos CompassDB, que incluye 208 muestras emparejadas y más de 1,5 millones de células, con un objetivo de reconstrucción enmascarada de expresión y un discriminador adversario de lote (DANN) para mitigar efectos de lote.

Con 301,2 millones de parámetros, la mayor parte del presupuesto se concentra en la tabla de embeddings de picos ATAC (268,4 M, 89,1 %), seguida de los embeddings de genes RNA (18,7 M). La arquitectura es un encoder transformer de 6 capas con dimensión oculta 512, 8 cabezas de atención y FFN de 1024, con soporte para hasta 8.000 tokens por modalidad. El modelo se distribuye como pesos preentrenados en formato PyTorch (fp32) bajo licencia MIT, y está pensado como inicialización para fine-tuning en tareas downstream de análisis de célula única.

La relevancia de este modelo radica en su capacidad para abordar la integración multi-ómica, un problema central en la biología computacional actual. A diferencia de modelos que trabajan con una sola modalidad, EpiFoundation modela explícitamente la correlación entre accesibilidad de cromatina y expresión génica, lo que permite transferir conocimiento entre ambas. Los resultados de fine-tuning en cinco tejidos muestran mejoras en precisión de clasificación de tipos celulares frente a una inicialización con el checkpoint UCSC-VLAA, aunque el componente DANN resultó ineficaz para eliminar la señal de lote, una limitación importante que se detalla más adelante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (scTransformer) sobre tokens de picos ATAC y genes RNA |
| Parametros totales | 301.185.880 (301,2 M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8.000 tokens ATAC + 8.000 tokens RNA (máximo por modalidad) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo biológico, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | PyTorch .pth (fp32) |

## Arquitectura y entrenamiento

El modelo utiliza un encoder transformer con backend de flash-attention, compuesto por 6 capas, dimensión oculta 512, 8 cabezas de atención y FFN de 1024, con dropout de 0,2. Los tokens de entrada son picos ATAC (hasta 8.000) y genes RNA (hasta 8.000), cada uno con su propia tabla de embeddings. Se emplean embeddings de cromosoma y de lote (batch) como características auxiliares, y el embedding de célula se obtiene mediante pooling de la token CLS. El decodificador MVC (masked value/expression reconstruction) utiliza un esquema de concatenación de query para predecir valores de expresión enmascarados.

El preentrenamiento se realizó sobre el split de CompassDB con 208 muestras emparejadas y 1.546.146 células, fusionadas en un único shard por modalidad. El RNA se preprocesó con normalización total, log1p y binning por cuantiles (bin_num=2), mientras que el ATAC se binarizó como accesibilidad de picos. El objetivo de entrenamiento combina la reconstrucción enmascarada de valores (MVC, binario) con una pérdida de entropía cruzada adversaria de lote (DANN), con pesos de tarea 1,0 y 0,1 respectivamente. El clasificador de tipo celular no se entrenó durante el preentrenamiento (peso 0,0). Se usó el optimizador Adam con lr 1e-4, cosine annealing con warm restarts, precisión mixta (AMP) y batch efectivo de 256. El entrenamiento alcanzó el epoch 58 y el paso global 1.715.504, ejecutado en una GPU NVIDIA H200 del Duke Compute Cluster.

Una innovación técnica destacable es el uso de un discriminador de lote con inversión de gradiente (DANN) para intentar eliminar los efectos de lote del embedding celular. Sin embargo, como se documenta en las limitaciones, este componente no logró aprender: la pérdida del discriminador se mantuvo en el nivel de azar (≈ ln(212) = 5,36) durante todo el entrenamiento, y una sonda kNN sobre el embedding congelado recupera la etiqueta de lote con un 95,5 % de precisión. Esto indica que la eliminación de lote no se produjo, y el rendimiento downstream proviene principalmente del objetivo de reconstrucción.

## Capacidades

- Generación de representaciones de células a partir de datos emparejados de ATAC-seq y RNA-seq, integrando ambas modalidades en un embedding de 512 dimensiones.
- Clasificación de tipos celulares mediante fine-tuning supervisado, con resultados reportados en cinco tejidos (sangre, médula ósea, cerebro, riñón y células T).
- Predicción de valores de expresión génica (RNA) a partir de datos de accesibilidad de cromatina (ATAC), gracias al decodificador MVC.
- Integración de datos multi-ómicos de diferentes muestras y lotes, aunque con limitaciones en la eliminación de efectos de lote (ver sección de limitaciones).
- Transferencia de conocimiento entre modalidades: el modelo puede inicializar tareas downstream que requieren solo ATAC o solo RNA, aprovechando el preentrenamiento conjunto.
- Extracción de características (feature extraction) para análisis posteriores, como agrupamiento celular, visualización o estudios de regulación génica.
- Soporte para datos de hasta 8.000 picos ATAC y 8.000 genes RNA por célula, lo que cubre la mayoría de los conjuntos de datos de célula única.

## Casos de uso

- Anotación de tipos celulares en datos de ATAC-seq: el modelo, tras un fine-tuning en un tejido de referencia, puede clasificar células en tipos conocidos a partir de su perfil de accesibilidad, incluso cuando solo se dispone de datos ATAC. Esto es útil para transferir anotaciones entre experimentos.
- Integración de datos multi-ómicos de diferentes laboratorios: al preentrenar con un discriminador de lote (aunque ineficaz), el modelo puede servir como base para métodos de armonización de lotes que combinen la representación de EpiFoundation con técnicas de corrección adicionales.
- Estudio de la regulación génica: las representaciones aprendidas capturan la relación entre accesibilidad de cromatina y expresión, permitiendo identificar regiones reguladoras candidatas asociadas a genes de interés.
- Análisis de heterogeneidad celular en tejidos complejos: el embedding de 512 dimensiones puede usarse para agrupamiento (clustering) y visualización (UMAP/t-SNE) de poblaciones celulares, revelando estados celulares raros o transitorios.
- Predicción de respuesta a perturbaciones: al fine-tunear con datos de experimentos de perturbación (CRISPR, fármacos), el modelo puede predecir cambios en la expresión génica a partir de cambios en la accesibilidad, ayudando a priorizar dianas terapéuticas.
- Inicialización de modelos para datos de una sola modalidad: dado que el backbone incluye embeddings de ATAC y RNA, se puede fine-tunear solo la rama de interés (por ejemplo, ATAC) para tareas donde no se dispone de datos emparejados, aprovechando el conocimiento transferido.

## Benchmarks y rendimiento

El modelo card reporta resultados de fine-tuning en cinco tejidos de CompassDB, con inicialización desde este backbone. Las métricas se evaluaron sobre células de test retenidas, tras 100 epochs de fine-tuning con clasificación conjunta de tipo celular y predicción de valor RNA zero-inflada, con un λ DANN de 0,5 en el lado del fine-tuning.

| Tejido | Células | Tipos | Acc | Bal. acc | Macro F1 | sil(CT) | NMI | ARI | kBET | iLISI | sil(batch) | Pearson | Zero acc |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Blood | 1.435 | 13 | 0,894 | 0,720 | 0,702 | 0,333 | 0,613 | 0,338 | 0,052 | 0,041 | 0,232 | 0,556 | 0,925 |
| Bone marrow | 939 | 9 | 0,909 | 0,903 | 0,874 | 0,358 | 0,630 | 0,387 | 0,060 | 0,120 | 0,195 | 0,514 | 0,932 |
| Brain | 970 | 16 | 0,720 | 0,639 | 0,660 | 0,157 | 0,530 | 0,344 | 0,934 | 0,012 | 0,087 | 0,623 | 0,926 |
| Kidney | 1.275 | 7 | 0,948 | 0,833 | 0,836 | 0,569 | 0,523 | 0,186 | 0,035 | 0,037 | 0,435 | 0,563 | 0,942 |
| T cells | 1.210 | 3 | 1,000 | 1,000 | 1,000 | 0,921 | 0,295 | 0,076 | 0,840 | 0,050 | 0,716 | 0,471 | 0,899 |

En comparación con un fine-tuning idéntico inicializado desde el checkpoint UCSC-VLAA, la precisión de tipo celular mejora en los cinco tejidos (Blood +2,6 pp, Bone marrow +2,1, Brain +20,8, Kidney +2,3, T cells +0,1) y el silhouette de tipo celular mejora en todos (por ejemplo, Blood 0,002 → 0,333, Kidney 0,273 → 0,569). Sin embargo, las métricas de mezcla de lotes (kBET, iLISI, sil(batch)) empeoran en Blood, Bone marrow y Kidney, lo que refleja la ineficacia del DANN.

## Requisitos de hardware

- El archivo de pesos en fp32 ocupa 1,12 GB, por lo que la memoria de VRAM necesaria para inferencia es de al menos 2-4 GB para los pesos, más memoria para activaciones y el procesamiento de hasta 8.000 tokens por modalidad.
- Una GPU de consumo con 8 GB de VRAM (por ejemplo, RTX 3060, RTX 3070) debería ser suficiente para inferencia en lotes pequeños. Para fine-tuning, se recomienda al menos 16-24 GB de VRAM (RTX 4090, A5000) o GPUs de centro de datos.
- El preentrenamiento se realizó en una NVIDIA H200, lo que sugiere que el entrenamiento desde cero requiere hardware de gama alta, pero el fine-tuning es viable en GPUs de gama media.
- Opciones de despliegue: al ser un modelo PyTorch, se puede cargar con la librería `transformers` o directamente con PyTorch. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- La latencia y el throughput dependen del número de tokens de entrada. Con 8.000 tokens por modalidad, la inferencia puede ser lenta en GPUs de consumo; se recomienda reducir el número de tokens si es posible.

## Comparativa con modelos similares

No se dispone de especificaciones detalladas de modelos comparables como UCSC-VLAA, scGPT o Geneformer en la información proporcionada. Sin embargo, se puede establecer una comparación cualitativa con UCSC-VLAA, que es el checkpoint de inicialización alternativo mencionado en el modelo card:

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Rendimiento relativo |
|---|---|---|---|---|---|
| EpiFoundation (CompassDB DANN) | 301,2 M | 8.000 ATAC + 8.000 RNA | ATAC + RNA | MIT | Mejora la precisión de tipo celular en 5 tejidos frente a UCSC-VLAA, pero empeora la mezcla de lotes |
| UCSC-VLAA | No disponible | No disponible | ATAC + RNA | No disponible | Línea base; peor precisión de tipo celular, mejor mezcla de lotes en algunos tejidos |

No se dispone de datos suficientes para comparar con otros modelos fundacionales de célula única como scGPT o Geneformer, que suelen centrarse en RNA-seq únicamente y tienen arquitecturas y objetivos de entrenamiento diferentes.

## Limitaciones y advertencias

- El objetivo DANN no eliminó la señal de lote: una sonda kNN sobre el embedding congelado recupera la etiqueta de lote con un 95,5 % de precisión en células sanguíneas, y la pérdida del discriminador se mantuvo en el nivel de azar (≈ ln(212) = 5,36) durante todo el preentrenamiento. El componente adversario se considera ineficaz, y el rendimiento en tipo celular proviene del objetivo de reconstrucción, no de la eliminación de lote.
- Las métricas de mezcla de lotes (kBET, iLISI, sil(batch)) empeoran en Blood, Bone marrow y Kidney en comparación con la inicialización UCSC-VLAA, lo que indica que el modelo no es adecuado para tareas de integración de lotes sin correcciones adicionales.
- El checkpoint no es reanudable: se eliminaron los estados del optimizador, scheduler y GradScaler. Solo sirve como inicialización para fine-tuning, no para continuar el entrenamiento.
- Los archivos de vocabulario (atac_vocab.json, rna_vocab.json, chr_vocab.json, gene2chr.json) no están incluidos en el repositorio. Los IDs de tokens deben coincidir con los vocabularios de CompassDB, de lo contrario los embeddings no tienen sentido. Es necesario contactar con los autores para obtenerlos.
- El clasificador de tipo celular (cls_decoder, 127 clases) no fue entrenado durante el preentrenamiento, por lo que no se puede usar directamente para clasificación sin fine-tuning.
- El modelo está pensado para datos de célula única con formato específico (ATAC binarizado, RNA con binning por cuantiles). Aplicarlo a datos con otros preprocesamientos puede degradar el rendimiento.
- No se han publicado resultados de benchmarks en tareas de lenguaje o generación de texto, ya que es un modelo biológico, no lingüístico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Chtholly17/epifoundation-compass-dann
- Repositorio GitHub de desarrollo: https://github.com/Chtholly17/EpiFoundation_dev
- Perfil del autor en GitHub: https://github.com/Chtholly17/
- Dataset de resultados en Hugging Face: https://huggingface.co/datasets/Chtholly17/EpiFoundation_results
- Paper en bioRxiv (EpiFoundation: A Foundation Model for Single-Cell ATAC-seq...): https://www.biorxiv.org/content/biorxiv/early/2025/02/08/2025.02.05.636688.full.pdf
