# AMS-ICAMS-RUB/grace-foundation-models

## Resumen

GRACE (Graph Atomic Cluster Expansion) es una familia de potenciales interatómicos de machine learning desarrollada por el grupo Atomistic Modelling and Simulation del Interdisciplinary Centre for Advanced Materials Simulation (ICAMS) de la Universidad del Ruhr en Bochum (RUB). Estos modelos predicen energías y fuerzas atómicas para simular materiales a nivel atómico, sustituyendo a los potenciales empíricos clásicos con una precisión cercana a la de los cálculos DFT pero a una fracción del coste computacional.

La colección incluye tres familias principales: SMAX (entrenados con un protocolo de máxima entropía para muestrear amplias regiones del espacio configuracional), OMAT (entrenados en el dataset OMat24) y OAM (pre-entrenados en OMat24 y ajustados con los datasets sAlex y MPtraj). Los modelos están disponibles en variantes de una capa (locales) y dos capas (semilocales), con tamaños small, medium y large. Algunos incluyen cabezal de incertidumbre (UQ) y pesos optimizados para LAMMPS-Kokkos. Se distribuyen bajo la Academic Software License (ASL), que restringe el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Graph Atomic Cluster Expansion (GRACE) con 1 o 2 capas de paso de mensajes |
| Parametros totales | no disponible (varia por tamano: small, medium, large) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de potencial interatomico, no de texto) |
| Tipos de cuantizacion | nativo fp32; pesos Kokkos para LAMMPS-Kokkos |
| Idiomas soportados | no aplica |
| Licencia | Academic Software License (ASL) |
| Formato de pesos | SavedModel de TensorFlow (tensorpotential), incluye `kokkos.npz` para LAMMPS-Kokkos y `gmm_artifacts.npz` para UQ |

## Arquitectura y entrenamiento

GRACE se basa en la expansión de clúster atómico sobre grafos, una arquitectura que combina descriptores atómicos locales con capas de paso de mensajes para capturar interacciones de corto y medio alcance. Los modelos de una capa (1L) son estrictamente locales, mientras que los de dos capas (2L) son semilocales e incorporan información de vecinos de segundo orden. Los cutoffs varian: los modelos SMAX usan un radio de corte dependiente del elemento entre 5.0 y 7.5 Å, mientras que los modelos OMAT y OAM usan un cutoff fijo de 6 Å.

El entrenamiento difiere segun la familia. Los modelos SMAX se entrenan con un protocolo de generación de estructuras por máxima entropía de información, que muestrea deliberadamente regiones amplias y diversas del espacio configuracional, proporcionando un prior fisico robusto para interacciones atomicas en toda la tabla periodica. Los modelos OMAT se entrenan en el dataset OMat24 (de materiales inorganicos), y las versiones `-ft-E` se ajustan con mayor enfasis en la energia. Los modelos OAM se pre-entrenan en OMat24 y se ajustan con los datasets sAlex (10,4 millones de estructuras) y MPtraj (1,58 millones de estructuras). El ajuste se realiza con GRACEmaker, la herramienta de entrenamiento de tensorpotential.

## Capacidades

- Prediccion de energias totales y fuerzas atomicas para sistemas de materiales inorganicos.
- Soporte para simulaciones de dinamica molecular (MD) mediante integracion con LAMMPS y ASE.
- Modelos con cabezal de incertidumbre (UQ) que proporcionan estimaciones de error en las predicciones.
- Pesos Kokkos para despliegue en LAMMPS-Kokkos, que permite ejecucion en GPUs y CPUs con aceleracion.
- Cobertura quimica amplia: los modelos SMAX estan entrenados para ser quimio-agnosticos y cubrir toda la tabla periodica.
- Capacidad para modelar transformaciones de fase con grandes deformaciones, defectos en aleaciones complejas y barreras de reaccion en sistemas cataliticos.
- Los modelos OAM estan optimizados para dinamica molecular de larga duracion, con metricas F1 que evaluan la estabilidad de las trayectorias.

## Casos de uso

- Simulacion de dinamica molecular de materiales: los modelos GRACE pueden sustituir a los potenciales clasicos en simulaciones MD de larga duracion, proporcionando precision DFT a un coste mucho menor. Los modelos OAM estan especificamente ajustados para este fin, con metricas F1 que garantizan estabilidad en trayectorias largas.
- Estudio de defectos en aleaciones complejas: gracias al entrenamiento SMAX, que muestrea regiones de alta energia, los modelos pueden predecir con precision la formacion y migracion de vacantes, intersticiales y dislocaciones en aleaciones multicomponente.
- Catalisis heterogenea: la capacidad de modelar barreras de reaccion y estados de transicion permite estudiar mecanismos cataliticos en superficies y nanoparticulas, donde los potenciales clasicos fallan.
- Transformaciones de fase inducidas por presion o temperatura: los modelos SMAX capturan grandes deformaciones estructurales, lo que los hace adecuados para simular transiciones de fase polimorficas en materiales sometidos a condiciones extremas.
- Screening de materiales: integrados en flujos de trabajo de alto rendimiento, pueden evaluar rapidamente la estabilidad de miles de estructuras candidatas, por ejemplo para baterias o semiconductores, sin necesidad de calculos DFT individuales.
- Ajuste fino para sistemas especificos: los modelos base OMAT pueden fine-tunearse con datos propios (por ejemplo, de DFT) para mejorar la precision en un material o familia de materiales concreta, usando GRACEmaker.

## Benchmarks y rendimiento

La informacion disponible incluye la metrica κ_SRME (error relativo de energia) para todos los modelos y F1 para los modelos OAM. No se proporcionan comparaciones con otros potenciales interatomicos en la documentacion del repositorio.

| Modelo | κ_SRME | F1 |
|---|---|---|
| GRACE-1L-SMAX-large | 0,696 | — |
| GRACE-1L-SMAX-OMAT-large | 0,338 | — |
| GRACE-2L-SMAX-medium | 0,469 | — |
| GRACE-2L-SMAX-large | 0,444 | — |
| GRACE-2L-SMAX-OMAT-medium | 0,197 | — |
| GRACE-2L-SMAX-OMAT-large | 0,191 | — |
| GRACE-1L-OMAT | 0,398 | — |
| GRACE-1L-OMAT-medium-base | 0,380 | — |
| GRACE-1L-OMAT-medium-ft-E | 0,417 | — |
| GRACE-1L-OMAT-large-base | 0,354 | — |
| GRACE-1L-OMAT-large-ft-E | 0,383 | — |
| GRACE-2L-OMAT | 0,288 | — |
| GRACE-2L-OMAT-medium-base | 0,212 | — |
| GRACE-2L-OMAT-medium-ft-E | 0,217 | — |
| GRACE-2L-OMAT-large-base | 0,165 | — |
| GRACE-2L-OMAT-large-ft-E | 0,186 | — |
| GRACE-1L-OAM | 0,516 | 0,824 |
| GRACE-1L-OMAT-medium-ft-AM | 0,411 | 0,800 |

Valores mas bajos de κ_SRME indican mayor precision en energia. Los modelos de dos capas superan consistentemente a los de una capa, y la combinacion SMAX+OMAT ofrece el mejor equilibrio entre robustez estructural y precision.

## Requisitos de hardware

- Los modelos son significativamente mas ligeros que los LLMs: el repositorio completo pesa 41,2 GB, pero cada modelo individual (SavedModel) ocupa mucho menos, del orden de decenas a cientos de MB segun el tamano.
- Cualquier GPU de consumo moderna (p. ej., RTX 3060 o superior) es suficiente para inferencia y simulaciones MD con estos modelos.
- Para simulaciones de dinamica molecular de gran escala, se recomienda usar LAMMPS-Kokkos con GPUs de datacenter (A100, H100) para maximizar el throughput.
- Los modelos con pesos Kokkos (`kokkos.npz`) permiten ejecucion en CPUs con aceleracion vectorial y en GPUs via LAMMPS-Kokkos.
- La inferencia en Python (via tensorpotential) es adecuada para calculos puntuales o pequenos sistemas; para produccion se recomienda LAMMPS.
- No se dispone de datos de latencia o throughput especificos en la documentacion.

## Comparativa con modelos similares

No se dispone de comparaciones directas publicadas con otros potenciales interatomicos de machine learning (como MACE, NequIP o BOTNet) en la informacion proporcionada. Sin embargo, por su arquitectura y entrenamiento, GRACE compite en la misma categoria que:

| Modelo | Arquitectura | Dataset de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|
| GRACE (este repo) | Graph Atomic Cluster Expansion | OMat24, SMAX, sAlex, MPtraj | Academic Software License | HuggingFace, GitHub |
| MACE | Message-passing equivariante | Varios (MP, OMat24, etc.) | MIT (modelos base) | GitHub, HuggingFace |
| NequIP | GNN equivariante | Personalizado | MIT | GitHub |
| BOTNet | GNN equivariante | Personalizado | MIT | GitHub |

La ventaja principal de GRACE es su integracion nativa con LAMMPS (incluyendo Kokkos) y su disponibilidad como modelos fundacionales pre-entrenados en datasets publicos de gran escala.

## Limitaciones y advertencias

- Licencia restrictiva: la Academic Software License (ASL) limita el uso a fines academicos y de investigacion. No se permite uso comercial sin autorizacion explicita de ICAMS.
- Los modelos OMAT estan entrenados principalmente en materiales inorganicos del dataset OMat24; su precision en moleculas organicas o sistemas con enlaces debiles (p. ej., van der Waals) puede ser limitada.
- Los modelos SMAX, aunque quimio-agnosticos, pueden tener menor precision en energias absolutas que los modelos OMAT, como reflejan sus valores de κ_SRME mas altos.
- La metrica κ_SRME es un error relativo; no se proporcionan errores absolutos en energias o fuerzas, lo que dificulta la comparacion directa con otros potenciales.
- No se documentan sesgos especificos, pero es probable que los modelos hereden sesgos de los datasets de entrenamiento (p. ej., subrepresentacion de ciertos elementos o estados de oxidacion).
- El repositorio no incluye modelos de tres capas (GRACE-3L), que segun la documentacion de gracemaker ofrecen la mejor precision de la serie; habria que buscarlos por separado.
- La integracion con LAMMPS requiere compilar el estilo de par `grace` o `grace/3l/kk`; la curva de aprendizaje puede ser pronunciada para usuarios sin experiencia en LAMMPS.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AMS-ICAMS-RUB/grace-foundation-models
- Codigo y documentacion de GRACEmaker/tensorpotential: https://github.com/ICAMS/grace-tensorpotential
- Documentacion de gracemaker (incluye tabla de modelos fundacionales): https://gracemaker.readthedocs.io/en/latest/
- Tutorial de modelos fundacionales: https://github.com/ICAMS/grace-tutorial/tree/main/3-foundation-models
- Paper SMAX (arXiv 2602.23489): https://arxiv.org/abs/2602.23489
- Paper OMAT/OAM (arXiv 2508.17936): https://arxiv.org/abs/2508.17936
- Publicacion OMAT en npj Computational Materials: https://www.nature.com/articles/s41524-026-01979-1
- Dataset OMat24: https://huggingface.co/datasets/fairchem/OMAT24
- Dataset MPtraj: https://figshare.com/articles/dataset/Materials_Project_Trjectory_MPtrj_Dataset/23713842
- Licencia ASL: https://github.com/ICAMS/grace-tensorpotential/blob/master/LICENSE.md
