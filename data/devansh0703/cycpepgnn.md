# devansh0703/CycPepGNN

## Resumen

CycPepGNN es un modelo de red neuronal de grafos (GNN) desarrollado por Devansh Raulo para predecir la permeabilidad de membrana de péptidos cíclicos, un parámetro crítico en el diseño de fármacos basados en esta clase de moléculas. El modelo se entrena sobre el dataset CycPeptMPDB (ensayo PAMPA) y combina una arquitectura GIN (Graph Isomorphism Network) con descriptores RDKit y propiedades fisicoquímicas, con la opción de incorporar características de dinámica conformacional (4D) procedentes de simulaciones. El trabajo se publica como un manuscrito de conferencia de 6 páginas en formato IEEEtran y todo el código, los datos y los checkpoints están disponibles de forma abierta bajo licencia MIT.

La relevancia de CycPepGNN radica en que aborda un problema específico de química farmacéutica —la predicción de permeabilidad de péptidos cíclicos— con una pipeline completamente reproducible y transparente. Aunque su rendimiento (MSE 0.601, R² 0.467 en el dataset completo) queda por debajo de los métodos del estado del arte (MSF-CPMP, MSE 0.092, R² 0.88), el repositorio incluye un harness de ablación que permite aislar los factores que explican esa brecha: aumento de datos por enumeración SMILES, codificación de secuencia a nivel de monómero y aprendizaje multitarea. Esto lo convierte en una base sólida para investigación y experimentación en el campo.

El modelo no es un LLM ni un sistema de generación de texto; es un predictor de regresión para una propiedad molecular concreta. Su arquitectura es ligera (4 capas GINConv) y puede ejecutarse en GPUs de consumo, como una RTX 4060 Laptop de 8 GB, tanto para entrenamiento como para inferencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GNN con 4 capas GINConv + 66 descriptores RDKit + 16 propiedades fisicoquímicas (variante base); variante refinada con 5 capas GINConv + codificación de secuencia de aminoácidos; variante con ChemBERTa-2 + Morgan fingerprint |
| Parametros totales | no disponible (no se especifica en la documentación) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de regresión molecular, no procesa texto) |
| Tipos de cuantizacion | no disponible (no se menciona cuantización; los checkpoints se guardan en precisión completa) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch .pt (checkpoints: best_Full_1024.pt, best_With4D_512.pt, etc.) |

## Arquitectura y entrenamiento

CycPepGNN se basa en una red neuronal de grafos con capas GINConv (Graph Isomorphism Network). La variante principal (train.py) apila 4 capas GINConv y concatena 66 descriptores moleculares calculados con RDKit y 16 propiedades fisicoquímicas. La variante refinada (train_final.py) usa 5 capas GINConv e incorpora una codificación one-hot de la secuencia de aminoácidos. Existe además una variante híbrida (train2.py) que combina embeddings CLS de un ChemBERTa-2 congelado con huellas Morgan de 2048 bits. Todas las variantes comparten el mismo diseño de fusión de características auxiliares.

El entrenamiento se realiza sobre el dataset CycPeptMPDB, que contiene 6.941 péptidos cíclicos con valores de permeabilidad PAMPA (log P_app en cm/s). Los datos se descargan automáticamente en tiempo de ejecución desde el repositorio público de CycPeptMPDB y Zenodo (para las características 4D). Los valores objetivo se normalizan a media cero y varianza unitaria, y las métricas se convierten de vuelta a unidades logarítmicas. La partición de datos es fija (80/10/10) con semilla 42. No se menciona el uso de RLHF ni DPO, ya que no es un modelo generativo. El entrenamiento requiere una GPU con CUDA y se ha probado en una RTX 4060 Laptop de 8 GB.

## Capacidades

- Predicción de permeabilidad de membrana de péptidos cíclicos a partir de su estructura molecular (SMILES).
- Regresión numérica: devuelve un valor continuo de log P_app (cm/s) normalizado.
- Integración de múltiples fuentes de información: descriptores RDKit, propiedades fisicoquímicas, características de dinámica conformacional (4D) y, en la variante refinada, secuencia de aminoácidos.
- Soporte para aumento de datos mediante enumeración SMILES (configurable en train_final.py).
- Capacidad de ejecutar experimentos de ablación para aislar el efecto de cada componente (train_comprehensive.py).
- No es un modelo de lenguaje: no genera texto, no tiene tool calling, ni capacidades de agente, ni soporte multilingüe.

## Casos de uso

- Screening virtual de péptidos cíclicos candidatos a fármacos: el modelo puede filtrar bibliotecas de péptidos cíclicos y priorizar aquellos con mayor permeabilidad predicha, reduciendo el número de ensayos experimentales necesarios.
- Optimización de la permeabilidad en diseño de fármacos: los investigadores pueden modificar la secuencia de un péptido y evaluar rápidamente el impacto en la permeabilidad predicha, guiando iteraciones de diseño.
- Análisis de la relación estructura-propiedad: al combinar descriptores RDKit y propiedades fisicoquímicas, el modelo permite estudiar qué características moleculares correlacionan con una mayor permeabilidad.
- Benchmarking de arquitecturas GNN en química farmacéutica: el repositorio incluye cuatro arquitecturas comparables, lo que permite evaluar el rendimiento de GINConv frente a variantes con secuencia o embeddings de ChemBERTa-2.
- Reproducción de experimentos científicos: al ser un pipeline completamente abierto con datos descargables en tiempo de ejecución, sirve como base para reproducir y extender los resultados publicados en el paper.
- Entrenamiento de modelos personalizados: los scripts permiten adaptar el modelo a otros conjuntos de datos de permeabilidad o a otras propiedades moleculares con mínimos cambios.

## Benchmarks y rendimiento

Los resultados reportados en la model card se resumen en la siguiente tabla. Se comparan con métodos de la literatura sobre el mismo dataset (CycPeptMPDB, ensayo PAMPA).

| Modelo | Datos | Test MSE | Test R² |
|---|---|---|---|
| CycPepGNN (4× GINConv + 66 desc + 16 physchem) | Full (6.941) | 0.601 | 0.467 |
| CycPepGNN (+, 4D branch, 11 conf. features) | 4D subset (5.160) | 0.632 | 0.429 |
| CycPeptMP (literatura) | Full | 0.271 | 0.780 |
| MultiCycPermea (literatura) | Full | 0.160 | ~0.75 |
| MSF-CPMP (SOTA, literatura) | Full | 0.092 | 0.88 |

El hallazgo clave del estudio es que las características 4D de dinámica conformacional no mejoran el rendimiento del baseline; la reducción del tamaño del dataset (de 6.941 a 5.160) es el factor dominante. La brecha con el SOTA se atribuye a la enumeración SMILES, la codificación de secuencia a nivel de monómero y el aprendizaje multitarea, todos implementados en el repositorio para poder ser ablacionados.

## Requisitos de hardware

- VRAM estimada: el entrenamiento se ha probado en una NVIDIA RTX 4060 Laptop con 8 GB de VRAM. Para inferencia, los requisitos son menores; un modelo con 4 capas GINConv y descriptores RDKit es ligero y puede ejecutarse en CPU, aunque se recomienda GPU para velocidad.
- GPU recomendadas: cualquier GPU con CUDA y al menos 8 GB de VRAM (RTX 3060, RTX 4060, A100, etc.). No se requieren GPUs de datacenter.
- Compatibilidad con GPUs de consumo: sí, cabe en GPUs de consumo como la RTX 4060 Laptop (8 GB) y similares.
- Opciones de despliegue: los scripts de entrenamiento usan PyTorch y torch_geometric. Para inferencia, se puede cargar el checkpoint con `torch.load` y ejecutar el modelo en cualquier entorno con PyTorch. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un LLM.
- Latencia y throughput: no se proporcionan datos específicos. Dado el tamaño reducido del modelo, la inferencia sobre una sola molécula es del orden de milisegundos en GPU.

## Comparativa con modelos similares

CycPepGNN se compara con métodos publicados en la literatura para la misma tarea (predicción de permeabilidad de péptidos cíclicos en CycPeptMPDB). No se dispone de otros modelos open-source con la misma arquitectura GNN para comparación directa.

| Modelo | Arquitectura | Datos | Test MSE | Test R² | Licencia |
|---|---|---|---|---|---|
| CycPepGNN (este) | GINConv + descriptores | Full (6.941) | 0.601 | 0.467 | MIT |
| CycPeptMP (literatura) | no disponible | Full | 0.271 | 0.780 | no disponible |
| MultiCycPermea (literatura) | no disponible | Full | 0.160 | ~0.75 | no disponible |
| MSF-CPMP (SOTA) | no disponible | Full | 0.092 | 0.88 | no disponible |

CycPepGNN es el único de los cuatro con código y datos abiertos, lo que facilita la reproducibilidad. Su rendimiento es inferior al de los métodos de la literatura, pero el repositorio incluye las herramientas para investigar y cerrar esa brecha.

## Limitaciones y advertencias

- Rendimiento inferior al estado del arte: el modelo obtiene un MSE de 0.601 frente a 0.092 de MSF-CPMP, por lo que no es adecuado para aplicaciones de producción donde se requiera alta precisión sin un ajuste adicional.
- Las características 4D de dinámica conformacional no mejoran el resultado; su inclusión reduce el tamaño del dataset efectivo y empeora ligeramente las métricas.
- Dependencia de la versión de RDKit: los descriptores moleculares varían entre versiones, lo que puede afectar a la reproducibilidad si no se fijan las dependencias exactas (el propio autor recomienda pinar `requirements.txt`).
- Sesgo del dataset: CycPeptMPDB contiene péptidos cíclicos específicos; el modelo puede no generalizar bien a otras clases de moléculas o a condiciones experimentales diferentes.
- Riesgo de alucinación: no aplica, al ser un modelo de regresión y no generativo.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificación, pero los datos subyacentes (CycPeptMPDB, Zenodo) pueden tener sus propias condiciones; se recomienda revisarlas.
- No es un modelo de lenguaje: no puede procesar texto, mantener conversaciones ni realizar tareas de NLP.

## Enlaces

- HuggingFace: https://huggingface.co/devansh0703/CycPepGNN
- Repositorio GitHub: https://github.com/devansh0703/CycPepGNN
- Dataset CycPeptMPDB: https://github.com/akiyamalab/cycpeptmp
- Dataset CycPeptMPDB-4D (Zenodo): https://zenodo.org/records/18754430
- Perfil del autor en HuggingFace: https://huggingface.co/devansh0703/models
- Perfil del autor en GitHub: https://github.com/devansh0703
