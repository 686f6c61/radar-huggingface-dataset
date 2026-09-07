# OneScience-Group/MVGNN-PPIS

## Resumen

MVGNN-PPIS es un modelo de predicción de sitios de interacción proteína-proteína (PPI) desarrollado por WW-AILab y publicado en Hugging Face por OneScience-Group. Dado un conjunto de características de secuencia y estructura precalculadas, el modelo estima la probabilidad de que cada residuo de aminoácido pertenezca a un sitio de interacción con otra proteína. Se trata de un modelo de grafos neuronales (GNN) de vistas múltiples que combina información de adyacencia local de secuencia y de vecindad espacial tridimensional.

El modelo integra representaciones de residuos de ProtT5, características de estructura secundaria de DSSP y estructuras predichas por AlphaFold3. La arquitectura emplea módulos de convolución sobre grafos y transformadores de grafos para extraer información local y global complementaria. Las características de nodo tienen una dimensión de 1038. El modelo realiza la predicción mediante un conjunto (ensemble) de cinco checkpoints oficiales, y genera probabilidades a nivel de residuo. El repositorio tiene un tamaño de 2.7 GB y la licencia se indica como desconocida. El modelo es relevante para aplicaciones de biología computacional y descubrimiento de fármacos, donde la identificación precisa de sitios de interacción proteína-proteína es un paso crítico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multi-view graph neural network (GNN) con módulos de graph convolution y graph Transformer |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | unknown |
| Formato de pesos | Checkpoints de PyTorch (.ckpt) |

## Arquitectura y entrenamiento

MVGNN-PPIS utiliza una red neuronal de grafos de vistas múltiples que modela conjuntamente las relaciones de adyacencia de secuencia local y las relaciones de vecindad espacial tridimensional. Para cada residuo se construye un grafo espacial K-nearest-neighbor basado en las coordenadas del centroide de la cadena lateral. La matriz de adyacencia de secuencia captura las relaciones entre residuos contiguos. Las características de nodo de 1038 dimensiones se componen de representaciones de residuos de ProtT5 y características de estructura secundaria de DSSP. Las estructuras tridimensionales provienen de predicciones de AlphaFold3. El modelo se entrena con cinco checkpoints que se combinan mediante ensamblado para la predicción final. No se proporciona información sobre el número de tokens, la composición del dataset ni el uso de RLHF o DPO, ya que no es un modelo de lenguaje. El paper asociado está disponible en DOI 10.1016/j.ijbiomac.2025.140096.

## Capacidades

- Predicción de sitios de interacción proteína-proteína a nivel de residuo, devolviendo probabilidades para cada aminoácido.
- Uso de características multimodales: ProtT5, DSSP y estructuras de AlphaFold3.
- Modelado conjunto de relaciones de secuencia local y de vecindad espacial tridimensional mediante grafos.
- Inferencia por ensamblado de cinco checkpoints, lo que mejora la robustez de la predicción.
- Cálculo de métricas de evaluación sobre conjuntos de test etiquetados: AUC, AUPRC, MCC, Accuracy, Precision, Recall y F1.
- Compatibilidad con entornos PyTorch y DCU (DTK/HIP), con soporte para inferencia en GPU/DCU.

## Casos de uso

- Identificación de residuos implicados en interacciones proteína-proteína: el modelo predice la probabilidad de que cada residuo forme parte de un sitio de interacción, útil para estudios funcionales de complejos proteicos.
- Cribado de sitios funcionales en proteínas: permite ordenar residuos candidatos según su probabilidad de interacción para guiar experimentos de mutagénesis dirigida.
- Validación de estructuras predichas por AlphaFold3: el modelo puede utilizarse para evaluar la relevancia funcional de los contactos predichos en modelos estructurales.
- Análisis de interacciones en el dataset PRO-Test60: reproduce la evaluación de referencia con las características precalculadas y los cinco checkpoints, facilitando la comparación de resultados.
- Integración en pipelines de descubrimiento de fármacos: los sitios de interacción proteína-proteína identificados pueden servir como dianas terapéuticas o para el diseño de inhibidores de interacción.
- Investigación académica en biología computacional: el modelo puede emplearse para generar hipótesis sobre el papel de residuos específicos en la formación de complejos proteicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card indica que el script de inferencia calcula AUC, AUPRC, MCC, Accuracy, Precision, Recall y F1 sobre conjuntos de test etiquetados, pero no se aportan valores numéricos concretos.

## Requisitos de hardware

- Se requiere PyTorch instalado; el modelo no es un LLM, por lo que no se especifican requisitos de VRAM en términos de GB.
- El consumo de memoria de GPU/DCU y el tiempo de ejecución dependen de la longitud de la proteína, el tamaño del lote y el número de procesos worker paralelos.
- Compatible con GPU y DCU (aceleradores de Hygon) mediante el entorno DTK/HIP.
- El script de inferencia acepta el argumento `--device cuda` para seleccionar el dispositivo.
- El despliegue se realiza mediante el script `scripts/inference.py` incluido en el paquete, no a través de vLLM, llama.cpp u Ollama.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo se centra en una tarea específica de bioinformática y no se ofrece una tabla comparativa con alternativas.

## Limitaciones y advertencias

- La licencia se indica como "unknown", lo que implica que no se garantizan permisos de uso comercial sin consultar al autor.
- El modelo requiere características precalculadas (ProtT5, DSSP, AlphaFold3) que deben generarse previamente; no realiza el cálculo de estas características en tiempo de ejecución.
- La inferencia depende de que existan los ficheros de características para cada ID de proteína; si faltan archivos, el script informa de los archivos ausentes y detiene el proceso.
- El modelo está entrenado y evaluado principalmente en inglés, y su aplicabilidad a otros idiomas no es relevante al tratarse de una tarea de biología molecular.
- El rendimiento puede variar según la longitud de la proteína y la calidad de las estructuras predichas por AlphaFold3.
- No se han publicado benchmarks numéricos, por lo que la comparación con otros modelos de predicción de sitios PPI no es posible con los datos disponibles.
- El repositorio no indica el número total de parámetros ni el tamaño del contexto, lo que limita la evaluación de su complejidad computacional.

## Enlaces

- Hugging Face: https://huggingface.co/OneScience-Group/MVGNN-PPIS
- GitHub: https://github.com/WW-AILab/MVGNN-PPIS
- Artículo: https://doi.org/10.1016/j.ijbiomac.2025.140096
