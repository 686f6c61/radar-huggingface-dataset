# SidraBhatti/casp4-inhibitor-screening

## Resumen

El repositorio SidraBhatti/casp4-inhibitor-screening no contiene un modelo de lenguaje ni pesos de red neuronal publicados: es el artefacto asociado a un pipeline de cribado virtual (virtual screening) asistido por IA para identificar inhibidores de CASP4 (caspasa-4) reutilizables en la enfermedad de Alzheimer. Lo firma Sidra Bhatti, que segun la propia model card lidero la parte de prediccion: generacion de embeddings con ChemBERTa, ingenieria de caracteristicas hibrida y desarrollo del clasificador y el regresor Random Forest. El repositorio ocupa 0,0 GB y no incluye ficheros de pesos.

La propuesta tecnica combina un transformer preentrenado sobre cadenas SMILES (ChemBERTa, embeddings de 768 dimensiones) con 6 descriptores fisicoquimicos calculados con RDKit, lo que produce un vector de 774 caracteristicas por compuesto. Sobre ese vector se entrena un Random Forest de 500 arboles que clasifica compuestos activos frente a inactivos (activo definido como pIC50 >= 8,2 en ChEMBL) y un segundo Random Forest de regresion que predice pIC50 sobre los activos. Los candidatos priorizados pasan despues por filtrado ADMET/PK-PD, docking con AutoDock Vina, simulacion de dinamica molecular de 100 ns por triplicado en GROMACS con campo de fuerzas CHARMM36 y ranking por energia libre MM/PBSA frente a donepezilo como referencia.

Su relevancia es metodologica: muestra como un clasificador tabular sobre embeddings quimicos puede reducir una biblioteca de compuestos a un conjunto manejable antes del docking y la dinamica molecular, con un coste computacional muy inferior al de un transformer afinado de extremo a extremo. La model card declara un manuscrito aceptado, una accuracy de clasificacion del ~95%, un ROC-AUC de 0,73 y un enriquecimiento de ~3,5x en el top 10%. No se publican pesos, por lo que el repositorio no permite inferencia directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline hibrido: ChemBERTa (transformer sobre SMILES) para embeddings de 768 dimensiones + 6 descriptores fisicoquimicos RDKit + Random Forest (clasificador y regresor) |
| Parametros totales | no disponible; el repositorio no publica pesos (0,0 GB) y no se especifica el checkpoint de ChemBERTa empleado |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la entrada es una cadena SMILES) |
| Tipos de cuantizacion | no aplica / no disponible (no hay pesos publicados) |
| Idiomas soportados | no disponible; la entrada son cadenas SMILES, no texto en lenguaje natural |
| Licencia | MIT |
| Formato de pesos | no disponible; el repositorio no contiene ficheros de pesos |

## Arquitectura y entrenamiento

El pipeline consta de cinco etapas. La primera es la curacion y el preprocesado de datos. La segunda extrae caracteristicas: cada SMILES se codifica con un ChemBERTa preentrenado para obtener un embedding de 768 dimensiones, que se concatena con 6 descriptores fisicoquimicos de RDKit, dando un vector hibrido de 774 dimensiones por compuesto. La tercera etapa entrena dos modelos Random Forest: un clasificador de 500 arboles que distingue activos de inactivos, con la etiqueta de activo tomada de ChEMBL (pIC50 >= 8,2), y un regresor entrenado unicamente sobre los valores experimentales de pIC50 de los compuestos activos, empleado para ordenar candidatos por potencia predicha. No se reporta uso de RLHF ni de DPO, algo que no aplica a este tipo de modelo.

La cuarta y quinta etapas son fisico-computacionales y no forman parte del modelo de aprendizaje automatico: identificacion del sitio de union con PrankWeb y docking con AutoDock Vina contra CASP4, seguido de dinamica molecular de 100 ns por triplicado en GROMACS con CHARMM36 y ranking por MM/PBSA. El punto de partida fue un cribado virtual basado en estructura (VSTH/Tianhe-2 frente a CASP4, PDB 6NRY) que produjo aproximadamente 1.739 hits iniciales. La innovacion destacable es precisamente el acoplamiento en cascada entre caracteristicas hibridas (embedding de transformer + descriptores clasicos) y metodos de fisica computacional, con el clasificador actuando como filtro de bajo coste antes de las etapas caras.

## Capacidades

- Clasificacion binaria de compuestos como activos o inactivos frente a CASP4, con accuracy declarada de ~95%.
- Regresion del pIC50 de compuestos previamente clasificados como activos, usada para ordenar candidatos por potencia predicha.
- Enriquecimiento de ~3,5x en el top 10% de la biblioteca evaluada.
- Cribado de bibliotecas de farmacos comercializados (DrugBank Drug-Lib) para reposicionamiento.
- Priorizacion integrada en un flujo de CADD que continua con filtrado ADMET/PK-PD, docking y dinamica molecular.
- Manejo de entradas exclusivamente en formato SMILES; no procesa lenguaje natural.
- No soporta generacion de texto, tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni de vision, audio o thinking mode.
- No se documentan capacidades de generacion de moleculas nuevas (no es un modelo generativo).

## Casos de uso

- Priorizacion de bibliotecas de reposicionamiento: dado un conjunto de farmacos aprobados de DrugBank, el clasificador y el regresor permiten ordenarlos por probabilidad de actividad y pIC50 predicho (valores entre 8,299 y 9,509 en el top 10 publicado) y descartar de forma temprana la mayor parte de la biblioteca antes de invertir recursos en docking.
- Filtro previo al docking masivo: al ser un modelo tabular de 500 arboles sobre 774 caracteristicas, su coste por compuesto es minimo comparado con AutoDock Vina, de modo que se puede usar como etapa de enriquecimiento en un embudo de cribado que solo envie el top 10-20% a las etapas fisico-computacionales.
- Generacion de hipotesis terapeuticas en Alzheimer: el pipeline completo, con docking contra el PDB 6NRY y MM/PBSA, produce candidatos concretos (por ejemplo flunitrazepam con -9,1 kcal/mol) que pueden servir como punto de partida para validacion experimental.
- Analisis de compuestos con perfil de seguridad conocido: al partir de farmacos ya comercializados se dispone de datos de farmacocinetica y toxicidad previos, lo que reduce el riesgo de las fases iniciales del desarrollo.
- Reproduccion y benchmarking metodologico: el codigo esta publicado en GitHub y los datos en un dataset aparte, de modo que otros grupos pueden replicar el flujo ChemBERTa + RDKit + Random Forest y comparar contra sus propios pipelines.
- Docencia y formacion en quimioinformatica: el repositorio ilustra de forma autocontenida la concatenacion de embeddings de transformer con descriptores clasicos, el entrenamiento de Random Forest sobre datos de ChEMBL y el encadenado con docking y MD.
- Seleccion de candidatos para ensayos de validacion enzimatica: los cinco compuestos que superaron docking y MD (DB00519, DB01068, DB06202, DB08882 y DB05316) constituyen una lista corta y justificada para experimentos in vitro de inhibicion de CASP4.
- Integracion en plataformas CADD internas: el componente de ML puede reentrenarse con datos propios de pIC50 y sustituir la capa de priorizacion dentro de un flujo corporativo existente, manteniendo el resto de etapas (ADMET, docking, MD) sin cambios.

## Benchmarks y rendimiento

### Resultados del clasificador

| Metrica | Valor |
|---|---|
| Accuracy del clasificador | ~95% |
| ROC-AUC del clasificador | 0,73 |
| Enriquecimiento en el top 10% | ~3,5x |

No se han publicado resultados de benchmarks estandar de modelos de lenguaje (MMLU, HumanEval, GSM8K, etc.), ya que el artefacto no es un modelo de lenguaje. La informacion disponible solo incluye las metricas de clasificacion anteriores y los resultados del pipeline fisico-computacional que se detallan a continuacion.

### Lista corta priorizada por IA (top 10 antes del filtrado ADMET/PK-PD)

| ID de DrugBank | pIC50 predicho | Prob. de activo predicha | Peso molecular (g/mol) | Log P | HBD | HBA | Lipinski |
|---|---|---|---|---|---|---|---|
| DB08897 | 8,481 | 0,724 | 484,66 | 4,67 | 1 | 6 | Si |
| DB09477 | 8,513 | 0,722 | 348,40 | 1,13 | 3 | 4 | Si |
| DB06202 | 8,446 | 0,720 | 413,56 | 5,73 | 1 | 3 | No |
| DB08882 | 8,299 | 0,716 | 472,55 | 1,15 | 1 | 10 | Si |
| DB05316 | 8,707 | 0,704 | 427,56 | 4,67 | 1 | 3 | Si |
| DB00519 | 8,917 | 0,700 | 430,55 | 2,77 | 2 | 5 | Si |
| DB01068 | 8,595 | 0,700 | 315,72 | 3,04 | 1 | 4 | Si |
| DB00722 | 8,490 | 0,682 | 405,50 | 1,24 | 4 | 5 | Si |
| DB00234 | 8,675 | 0,678 | 313,40 | 3,19 | 1 | 4 | Si |
| DB13867 | 9,509 | 0,676 | 444,52 | 3,47 | 2 | 5 | Si |

### Candidatos finales tras el filtrado ADMET/PK-PD (enviados a docking)

Siete compuestos coinciden con la lista anterior; tres fueron descartados y sustituidos tras el filtrado ADMET/PK-PD.

| ID de DrugBank | Compuesto | Puntuacion de docking Vina (kcal/mol) |
|---|---|---|
| DB00439 | Cerivastatina | -6,7 |
| DB00519 | Trandolapril | -5,4 |
| DB01068 | Clonazepam | -6,6 |
| DB01544 | Flunitrazepam | -9,1 |
| DB05316 | Pimavanserina | -7,7 |
| DB06202 | Lasofoxifeno | -7,5 |
| DB06203 | Alogliptina | -6,1 |
| DB08882 | Linagliptina | -6,6 |
| DB08897 | Aclidinio | -6,3 |
| DB09477 | Enalaprilato | -7,3 |

Los cinco candidatos con mejor perfil (DB00519, DB01068, DB06202, DB08882 y DB05316) se sometieron junto con donepezilo a dinamica molecular de 100 ns por triplicado y a analisis MM/PBSA. La informacion disponible en la model card se corta en este punto y no incluye la tabla final de energias libres.

## Requisitos de hardware

- Clasificador y regresor Random Forest: inferencia en CPU, sin necesidad de GPU. Un bosque de 500 arboles sobre 774 caracteristicas se evalua en milisegundos por compuesto (estimacion a partir de la arquitectura descrita; no se publican cifras de latencia o throughput).
- Generacion de embeddings ChemBERTa: es la etapa mas costosa del componente de IA. Puede ejecutarse en CPU, pero para bibliotecas grandes conviene GPU. El checkpoint no se especifica en la model card; variantes habituales de ChemBERTa, como ChemBERTa-77M-MLM, tienen del orden de 77 millones de parametros y caben holgadamente en GPUs de consumo con 8 GB o menos de VRAM.
- VRAM estimada: por debajo de 8 GB para la etapa de embeddings (estimacion, no publicada). El Random Forest no requiere VRAM.
- GPU recomendadas: no disponibles. Cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) es suficiente para la fase de embeddings; no se justifica el uso de A100 o H100 para el componente de aprendizaje automatico.
- Memoria principal: el bosque aleatorio ocupa del orden de decenas de megabytes en memoria (estimacion, no publicada).
- Opciones de despliegue: no existe despliegue oficial ni ficheros de pesos. El flujo se reconstruye con scikit-learn (Random Forest), HuggingFace Transformers y PyTorch (ChemBERTa) y RDKit (descriptores). No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no se trata de un modelo de lenguaje.
- Etapas de docking y dinamica molecular: AutoDock Vina y GROMACS con simulaciones de 100 ns por triplicado tienen un coste elevado y requieren clústeres de CPU y/o GPU de alto rendimiento; no se detallan los recursos empleados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se ha publicado ninguna comparacion directa entre este pipeline y alternativas en la informacion disponible, por lo que los campos cuantitativos no pueden rellenarse con datos verificables.

| Alternativa | Enfoque | Datos publicados | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este pipeline (ChemBERTa + RDKit + Random Forest) | Embeddings de transformer sobre SMILES concatenados con descriptores, clasificacion y regresion con Random Forest | Accuracy ~95%, ROC-AUC 0,73, enriquecimiento ~3,5x en el top 10% | MIT (repositorio) | Codigo en GitHub y datos en un dataset de HuggingFace; sin pesos publicados |
| Chemprop (D-MPNN) | Red neuronal de paso de mensajes sobre el grafo molecular | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Implementacion de codigo abierto ampliamente utilizada en quimioinformatica |
| Transformer de SMILES afinado de extremo a extremo | Ajuste fino supervisado sobre la tarea de actividad | no disponible en la informacion proporcionada | depende del checkpoint base | Amplia disponibilidad de checkpoints preentrenados |
| Cribado por docking puro (AutoDock Vina) | Acoplamiento molecular sin capa de aprendizaje automatico | no disponible en la informacion proporcionada | Licencia del software de docking | Disponible, pero con coste computacional mucho mayor por compuesto |

Las entradas relativas a Chemprop, transformers afinados y docking puro son contexto general de la disciplina y no proceden de la informacion proporcionada; no deben tomarse como datos verificados en esta ficha.

## Limitaciones y advertencias

- El ROC-AUC de 0,73 es moderado para una tarea de clasificacion bioactiva: implica una separacion limitada entre activos e inactivos y un volumen apreciable de falsos positivos y falsos negativos.
- La accuracy del ~95% puede reflejar un desbalance de clases acusado. No se publican precision, recall, F1 ni matriz de confusion, por lo que la cifra aislada no permite evaluar el comportamiento real del clasificador.
- No se han publicado pesos ni artefactos de modelo: el repositorio ocupa 0,0 GB y no permite inferencia directa. Cualquier uso requiere reimplementar el pipeline y reentrenar los bosques aleatorios.
- El checkpoint concreto de ChemBERTa no se especifica, lo que dificulta la reproducibilidad exacta de los embeddings.
- No se reporta validacion experimental in vitro o in vivo de los candidatos propuestos; todas las conclusiones son computacionales.
- Los resultados de docking (AutoDock Vina) y de MM/PBSA tienen error inherente y no garantizan actividad biologica. Diferencias de 1-2 kcal/mol entre candidatos no son concluyentes.
- Los tres compuestos que se descartaron tras el filtrado ADMET/PK-PD no se identifican individualmente en la informacion disponible, ni se detallan los criterios exactos de filtrado aplicados.
- Sesgo hacia el espacio quimico de ChEMBL y DrugBank: el modelo aprende sobre compuestos ya conocidos de esas bases de datos, con la consiguiente limitacion a moleculas pequenas de tipo farmaco. No es aplicable a biologicos ni a quimiotipos alejados de su distribucion de entrenamiento.
- La definicion de activo (pIC50 >= 8,2) introduce un umbral arbitrario y dependiente de la cobertura experimental de ChEMBL para CASP4.
- Los datos de origen (ChEMBL, DrugBank) estan sujetos a sus propias condiciones de uso, que el repositorio no detalla; la licencia MIT cubre el repositorio, no necesariamente los datos derivados.
- El repositorio registra 0 descargas y 0 likes, sin pipeline declarado, y las fechas de creacion y actualizacion (12 de septiembre de 2026) son inconsistentes con un artefacto consolidado. Conviene verificar la metadata antes de citarlo.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes, y no tiene capacidades multilingues, de vision o de audio.
- La model card esta incompleta (el texto se corta en la seccion de validacion por MD/MM-PBSA), por lo que faltan los resultados finales de energia libre y las conclusiones del manuscrito.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SidraBhatti/casp4-inhibitor-screening
- Codigo en GitHub: https://github.com/mubashirhassangcul/Caspase4-inhibitor-screening
- Dataset en HuggingFace: https://huggingface.co/datasets/SidraBhatti/caspase4-inhibitor-screening-data
- Manuscrito: aceptado segun la model card; la cita se anadira tras la publicacion, referencia no disponible.

Nota: la busqueda web asociada a esta consulta no devolvio ningun resultado relevante sobre el modelo, el articulo o el dominio de CASP4; los enlaces anteriores son los unicos verificables a partir de la informacion disponible.
