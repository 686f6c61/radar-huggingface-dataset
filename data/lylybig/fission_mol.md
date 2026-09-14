# lylybig/fission_mol

## Resumen

Fission (`lylybig/fission_mol`) es un proyecto de investigación para la generación de moléculas 3D mediante modelos de difusión, desarrollado por el usuario `lylybig` y publicado en HuggingFace. No se trata de un modelo de lenguaje, sino de un modelo generativo equivariante que aprende la distribución de conformaciones moleculares en 3D y permite muestrear nuevas moléculas con validez química. El repositorio (2,4 GB) contiene el código de entrenamiento y evaluación, la configuración de entorno y las instrucciones de reproducción de los experimentos sobre los conjuntos de datos GEOM-QM9 y GEOM-Drug.

La model card describe dos líneas de trabajo: el modelo denominado MFDM (entrenado en GEOM-QM9, con y sin átomos de hidrógeno explícitos) y un modelo basado en EDM + EGNN para GEOM-Drug. El entrenamiento se ha validado en configuraciones multi-GPU (4x H100, 2x A800, 6x A40) con PyTorch DDP, y el repositorio incluye scripts de preprocesado, muestreo distribuido y cálculo de métricas de estabilidad, validez, unicidad y novedad.

El interés actual de este lanzamiento reside en su enfoque de reproducibilidad: fija versiones exactas (Python 3.10, PyTorch 2.2.2, CUDA 12.1, PyG 2.5.3), documenta problemas reales de sincronización en evaluación DDP y publica resultados comparativos frente a referencias establecidas del área (EDM, GeoLDM, FlowMol, MiDi, EQGAT-diff). La información pública no especifica el número de parámetros, la licencia ni los formatos de peso distribuidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión generativa sobre grafos moleculares E(3)-equivariantes (familia EDM con EGNN; referido como MFDM en GEOM-QM9) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica: la entrada/salida son grafos moleculares y SMILES) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio incluye checkpoints, pero no se especifica el formato publicado) |
| Tamano del repositorio | 2,4 GB |
| Datasets de entrenamiento | GEOM-QM9 y GEOM-Drug |
| Frameworks | PyTorch 2.2.2 + CUDA 12.1, PyG 2.5.3, RDKit, Open Babel 3.1.1 |

## Arquitectura y entrenamiento

El proyecto emplea modelos de difusión sobre grafos moleculares con equivariancia E(3), en la línea de EDM y de los modelos con red neuronal de grafos EGNN. El modelo MFDM se entrena sobre GEOM-QM9 en dos configuraciones: con hidrógenos explícitos (`--remove_h False`) y sin ellos (`--remove_h True`). Para GEOM-Drug se trabaja con una variante `edm_egnn_drug`. El pipeline usa `torchrun` para entrenamiento y evaluación en múltiples GPUs, con sincronización explícita de rangos en la fase de evaluación (el rango 0 evalúa y el resto espera antes y después).

La model card documenta el uso de 4x H100 (epoch 2700, mejor checkpoint) y 2x A800 (epoch 2560) para el experimento sin hidrógenos, así como 6x A40 (epoch 3000) para la variante con hidrógenos. También describe experimentos previos en GEOM-Drug con 4x A40 (epoch 22) y 2x A800 (epoch 15), con resultados muy pobres. No se detalla el número de tokens ni la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables en este dominio). Entre las innovaciones prácticas documentadas figuran el sharding del muestreo global entre workers, el uso de semillas independientes por rank y el cálculo único de métricas sobre las muestras fusionadas, además de utilidades para visualización 3D e incertidumbre con Matplotlib 3.8+.

## Capacidades

- Generación de moléculas 3D mediante muestreo del proceso de difusión aprendido sobre GEOM-QM9 y GEOM-Drug.
- Evaluación automática de métricas de calidad molecular: estabilidad atómica, estabilidad molecular, validez, unicidad y novedad.
- Preprocesado de datasets QM9 (script `datasets/build_qm9_dataset.py`) y GEOM-Drug (`datasets/build_drug_dataset.py`).
- Reconstrucción y cacheado de SMILES de entrenamiento.
- Entrenamiento y evaluación distribuidos con PyTorch DDP y `torchrun`, con reparto de muestras y semillas por worker.
- Visualización de moléculas 3D y de incertidumbre, incluyendo renderizado de cadenas de entrenamiento de 100 fotogramas a PNG y GIF.
- Integración con W&B para seguimiento de experimentos.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso en lenguaje natural ni soporte multilingüe.

## Casos de uso

- Descubrimiento de fármacos asistido por computación: generar candidatos conformacionales 3D sobre el espacio químico de GEOM-Drug y filtrarlos por estabilidad y validez antes de pasarlos a simulaciones de docking.
- Aumento de datos para química computacional: producir moléculas sintéticas novedosas (métrica Novel reportada del 100 % en algunos experimentos) para ampliar conjuntos de entrenamiento de otros modelos predictivos.
- Benchmarking de modelos generativos moleculares: usar las métricas de estabilidad, validez, unicidad y novedad como referencia reproducible frente a EDM, GeoLDM, FlowMol, MiDi o EQGAT-diff.
- Investigación en difusión equivariante: servir de base para estudiar variantes arquitectónicas sobre EGNN y comparar el efecto de incluir o excluir hidrógenos explícitos.
- Reproducción de experimentos en clústeres H100: el repositorio proporciona comandos probados de 4 GPUs y scripts de lanzamiento en tmux (`TMUX_EXP.md`), útil para laboratorios con nodos Hopper.
- Análisis de incertidumbre en generación molecular: las utilidades de visualización permiten estudiar qué regiones del espacio conformacional generan predicciones de baja confianza.
- Enseñanza e investigación académica: como material de partida para cursos de química computacional o de modelos generativos con PyG.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card para GEOM-QM9:

| Modelo | Atom Stab | Mol Stab | Valid | Unique | Novel |
|---|---|---|---|---|---|
| EDM | 98,7 | 82,0 | 91,9 | 98,9 | no disponible |
| GeoLDM | 98,9 | 89,4 | 93,8 | 98,8 | no disponible |
| FlowMol | 99,7 | 96,2 | 97,3 | no disponible | no disponible |
| MiDi | 99,8 | 97,5 | 97,9 | 97,6 | no disponible |
| EQGAT-diff | 99,9 | 98,7 | 99,0 | 100 | no disponible |
| MFDM (woH, epoch=2560, 2x A800) | 30,2 | 0,0 | 94,3 | 97,5 | 100 |
| MFDM (wH, epoch=3000, 6x A40) | 77,2 | 1,2 | 21,6 | 99,9 | 100 |
| MFDM (woH, best epoch=2700, 4x H100) | 31,14 | 0,00 | 90,35 | 98,14 | 65,06 |

Resultados para GEOM-Drug:

| Modelo | Atom Stab | Mol Stab | Valid | Unique | Novel |
|---|---|---|---|---|---|
| FlowMol | 99,0 | 67,5 | 51,2 | no disponible | no disponible |
| MiDi | 99,8 | 91,6 | 77,8 | 100,0 | 100,0 |
| EQGAT-diff | 99,8 | 93,4 | 94,6 | 100,0 | 99,9 |
| edm_egnn_drug (epoch=22, 4x A40) | 9,8 | 0 | 0 | 0 | 0 |
| edm_egnn_drug_bs128_lr5e6 (epoch=15, 2x A800) | 11,3 | 0 | 0 | 0 | 0 |

Los datos de EDM y GeoLDM en GEOM-Drug aparecen vacíos en la tabla original. El autor no publica tiempos de inferencia ni throughput.

## Requisitos de hardware

- Entrenamiento verificado en NVIDIA H100 (4 GPUs), A800 (2 GPUs) y A40 (6 GPUs); la configuración de referencia es CUDA 12.1 con soporte nativo para `sm_90` (Hopper).
- La model card recomienda H100 para el entorno documentado, aunque indica que el entorno CUDA 12.1 puede ejecutarse con drivers más recientes.
- No se especifica VRAM mínima ni si el modelo cabe en GPUs de consumo (RTX 4090, 3090, etc.).
- Dependencias de software: Python 3.10.14, pip 24.0, PyTorch 2.2.2, PyG 2.5.3, RDKit, Open Babel 3.1.1 (instalado vía conda-forge), NumPy moderno, Matplotlib 3.8+.
- El código usa extensiones CUDA de PyG (`torch_cluster.radius_graph`, `torch_scatter.scatter_sum`), que requieren compilación o wheels compatibles con la versión de CUDA.
- Opciones de despliegue: no se documentan servidores de inferencia tipo vLLM, TGI, Ollama o llama.cpp, ya que no es un modelo de lenguaje. El despliegue se realiza mediante los scripts de muestreo del propio repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tarea | Atom Stab (QM9) | Mol Stab (QM9) | Valid (QM9) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Fission (MFDM, 4x H100) | Difusión molecular 3D | 31,14 | 0,00 | 90,35 | no disponible | HuggingFace (repo de código) |
| EDM | Difusión molecular 3D | 98,7 | 82,0 | 91,9 | no disponible | Publicación académica |
| GeoLDM | Difusión latente molecular | 98,9 | 89,4 | 93,8 | no disponible | Publicación académica |
| FlowMol | Flow matching molecular | 99,7 | 96,2 | 97,3 | no disponible | Publicación académica |
| MiDi | Difusión discreta molecular | 99,8 | 97,5 | 97,9 | no disponible | Publicación académica |
| EQGAT-diff | Difusión equivariante | 99,9 | 98,7 | 99,0 | no disponible | Publicación académica |

Las cifras de los modelos de referencia proceden de la propia model card de Fission, por lo que deben tratarse como valores citados y no verificados de forma independiente.

## Limitaciones y advertencias

- Rendimiento muy alejado del estado del arte: en GEOM-QM9 sin hidrógenos, la estabilidad molecular es 0,00 frente a 96,2 de FlowMol o 98,7 de EQGAT-diff; la estabilidad atómica queda en 31,14 frente a 99,9.
- El experimento con hidrógenos explícitos degrada la validez al 21,6 % frente al 94,3 % de la variante sin hidrógenos.
- Los resultados en GEOM-Drug son prácticamente nulos (validez, unicidad y novedad al 0 % en los dos experimentos publicados), lo que indica un fallo de convergencia o de configuración.
- No se especifica licencia: no hay autorización explícita para uso comercial. Debe contactarse con el autor antes de cualquier uso en producción.
- No se publican pesos con formato estándar ni cuantizaciones, lo que dificulta la integración fuera de su entorno de referencia.
- No hay información sobre sesgos del dataset ni sobre la cobertura química real; la métrica de novedad del 100 % en algunos experimentos puede reflejar muestras poco realistas más que diversidad química útil.
- El repositorio contiene scripts de entrenamiento y evaluación, no una API ni un pipeline de inferencia listo para producción.
- La fecha de creación indicada (2026-09-14) y el contenido de "Update & News" apuntan a un proyecto en desarrollo activo con posible inestabilidad en la documentación.
- Riesgo de sobreajuste a los conjuntos GEOM-QM9 y GEOM-Drug: no hay evidencia de generalización a otros dominios químicos.

## Enlaces

- HuggingFace: https://huggingface.co/lylybig/fission_mol
- Datos GEOM-Drug (Dataverse Harvard): https://dataverse.harvard.edu/api/access/datafile/4360331
- Los resultados de búsqueda web proporcionados no contienen material relacionado con este modelo (tratan sobre tiempo de pantalla en alemán), por lo que no se incluyen enlaces adicionales verificables.
- No se dispone de enlace a paper, blog técnico, repositorio GitHub ni demo asociados en la información proporcionada.
