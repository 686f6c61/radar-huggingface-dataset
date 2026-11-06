# sachin-kukkar/ai-nose-openpom

## Resumen

AI nose: OpenPOM odor-prediction ensemble es un conjunto de diez redes neuronales de paso de mensajes (message-passing neural networks, MPNN) que predicen 138 descriptores olfativos a partir de la estructura molecular, y generan además un embedding de "mapa de olores" de 256 dimensiones para cada molécula del catálogo. El modelo reproduce el trabajo de Sanchez-Lengeling et al. 2019 ("Machine Learning for Scent") y Lee et al., Science 2023 ("A principal odor map unifies diverse tasks in olfactory perception"), utilizando la librería OpenPOM sobre DeepChem, DGL y RDKit.

El problema que resuelve es la predicción computacional de propiedades olfativas, una tarea difícil porque el olor no depende de reglas simples de estructura-propiedad. El ensemble de 10 modelos alcanza un ROC-AUC medio de 0,891 sobre 138 descriptores en un conjunto de test de 495 moléculas, superando la línea base de random forest sobre fingerprints de Morgan (0,862). Es relevante para investigadores de química computacional, perfumería y diseño de aromas que necesiten cribados rápidos de moléculas candidatas.

No se trata de un modelo de lenguaje, sino de un modelo gráfico especializado: cada MPNN procesa el grafo molecular con 5 pasos de paso de mensajes, readout set2set y una red feed-forward de capas [392, 392] que produce la salida multi-etiqueta de 138 descriptores y el embedding de 256 dimensiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MPNN (red neuronal de paso de mensajes), modelo OpenPOM `MPNNPOMModel`, ensemble de 10 modelos |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (entrada: grafos moleculares, no texto) |
| Tipos de cuantizacion | no disponible (pesos PyTorch sin cuantizar) |
| Idiomas soportados | no aplicable (modelo no lingüistico) |
| Licencia | other (revisar términos de OpenPOM y de las fuentes de datos antes de uso comercial) |
| Formato de pesos | PyTorch state dicts (`.pt`) |

## Arquitectura y entrenamiento

Cada uno de los 10 modelos del ensemble es un `MPNNPOMModel` de OpenPOM con 5 pasos de paso de mensajes sobre el grafo molecular, readout de tipo set2set y una red feed-forward con capas ocultas de [392, 392]. La salida es multi-etiqueta: 138 descriptores olfativos binarios, además de un embedding de 256 dimensiones que actúa como "mapa de olores". Se aplica dropout de 0,12 durante el entrenamiento.

Los datos de entrenamiento provienen de los catálogos de odorantes GoodScents y Leffingwell, curados por OpenPOM, con un total de 4.983 moléculas. La división train/valid/test (3.978 / 510 / 495) se realizó mediante stratification iterativa de segundo orden, apropiada para problemas multi-etiqueta. No hay información sobre técnicas de RLHF ni afinado posterior, que no serían aplicables a este tipo de modelo. La innovación principal es el uso de ensemble (10 modelos) para mejorar la robustez de las predicciones frente a un modelo único.

## Capacidades

- Prediccion multi-etiqueta de 138 descriptores olfativos (por ejemplo, notas florales, frutales, amaderadas) a partir de la estructura de una molecula individual representada como grafo (SMILES).
- Generacion de un embedding de 256 dimensiones ("odor map") para cada molecula, util como representacion aprendida para tareas posteriores.
- Comparacion de similitud olfativa mediante kNN sobre el embedding aprendido (0,818 ROC-AUC, frente a 0,794 con fingerprints de Morgan).
- Cribado (screening) de catalogos moleculares mediante procesamiento por lotes con RDKit y DGL.
- No soporta tool calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No predice intensidad de olor ni comportamiento de mezclas; solo moleculas individuales.

## Casos de uso

- Cribado de candidatos en perfumeria: dado un catalogo de miles de moleculas en SMILES, el ensemble puntua cada una frente a los 138 descriptores para priorizar sintesis de materiales con perfiles olfativos deseados.
- Busqueda de sustitutos de ingredientes: usando el embedding de 256 dimensiones y kNN, se pueden encontrar moleculas con perfil olfativo similar a un ingrediente caro, restringido o en desuso.
- Diseno racional de aromas alimentarios: filtrado previo de moleculas candidatas antes de evaluacion sensorial humana, reduciendo costes de panel de cata.
- Investigacion en quimica computacional del olfato: reproduccion y extension de los trabajos de Sanchez-Lengeling et al. 2019 y Lee et al. 2023, con pesos disponibles para verificacion.
- Construccion de bases de datos de "mapas de olor": el archivo `catalogue.npz` proporciona embeddings para 4.983 moleculas, utiles como caracteristicas de entrada para otros modelos de quimica o para visualizacion (por ejemplo, PCA/UMAP del espacio olfativo).
- Educacion y docencia: ejemplo practico de MPNNs multi-etiqueta aplicadas a propiedades perceptuales, con codigo reproducible sobre DeepChem y DGL.

## Benchmarks y rendimiento

Resultados publicados en la model card, sobre el conjunto de test reservado (495 moleculas):

| Modelo | ROC-AUC medio (138 descriptores) | IC 95% |
|---|---|---|
| Ensemble de 10 MPNN (este modelo) | 0,891 | 0,880–0,901 |
| Random forest sobre fingerprints de Morgan | 0,862 | diferencia +0,029 (IC 0,021–0,036) |
| kNN sobre embedding aprendido | 0,818 | no disponible |
| kNN sobre fingerprints de Morgan | 0,794 | no disponible |

No se han publicado comparaciones con otros benchmarks estandar (MMLU, HumanEval, etc.), que no serian aplicables a este tipo de modelo.

## Requisitos de hardware

- Tamano del repositorio: 0,1 GB; los pesos son state dicts de PyTorch de tamano pequeno, por lo que los requisitos son modestos.
- No se requiere GPU dedicada: la inferencia sobre moleculas individuales o lotes pequenos es viable en CPU. Para cribados de catalogos grandes, cualquier GPU de consumo (por ejemplo, RTX 3060 o superior) acelera el procesamiento por lotes con DGL.
- Memoria estimada: del orden de pocos GB de RAM/VRAM; no se publica una cifra exacta (no disponible).
- Despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI (no es un LLM). El uso requiere el stack de Python: PyTorch, DeepChem, DGL y RDKit.
- Latencia y throughput: no disponible; por la arquitectura ligera (5 pasos de mensaje, capas [392, 392]), se espera inferencia de milisegundos por molecula en GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Salida | ROC-AUC | Licencia |
|---|---|---|---|---|
| AI nose OpenPOM ensemble (este) | Ensemble de 10 MPNN | 138 descriptores + embedding 256d | 0,891 | other (revisar) |
| Random forest + Morgan fingerprints | Baseline clasico | 138 descriptores | 0,862 | no disponible |
| Principal Odor Map (Lee et al., Science 2023) | GNN de Google Research | Descriptores olfativos + mapa principal | no disponible en la informacion proporcionada | no disponible |

El ensemble de MPNN supera a la baseline clasica de fingerprints en +0,029 ROC-AUC, con intervalo de confianza que excluye el cero. No se dispone de cifras directas del modelo original de Lee et al. en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgo de datos: entrenado unicamente con materiales de perfumeria y aromas alimentarios (GoodScents + Leffingwell), por lo que esta sesgado hacia odorantes agradables; el rendimiento en moleculas con olores desagradables o fuera de ese dominio no esta garantizado.
- Solo moleculas individuales: no predice intensidad de olor ni el comportamiento de mezclas, limitacion critica para aplicaciones reales de formulacion.
- Las puntuaciones son rankings, no probabilidades calibradas: no deben interpretarse como probabilidades de percepcion.
- Uso previsto para investigacion y educacion; cualquier uso comercial requiere revisar la licencia de OpenPOM y los terminos de las fuentes de datos (licencia "other" en Hugging Face, no estandar).
- Riesgo de error en descriptores individuales: con ROC-AUC de 0,891, existe un margen de error apreciable por descriptor; las predicciones deben validarse experimentalmente.
- No hay documentacion sobre cobertura de quimica fuera del espacio de entrenamiento (moleculas muy grandes, metales, sales).
- Descargas registradas: 0, lo que indica ausencia de adopcion comunitaria verificada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sachin-kukkar/ai-nose-openpom
- OpenPOM (repositorio de referencia): https://github.com/Bio-ml/OpenPOM (repositorio original de OpenPOM; verificar enlace actual)
- Paper: Sanchez-Lengeling et al. 2019, "Machine Learning for Scent": https://arxiv.org/abs/1910.10685
- Paper: Lee et al., Science 2023, "A principal odor map unifies diverse tasks in olfactory perception": https://www.science.org/doi/10.1126/science.ade4401
- DeepChem: https://deepchem.io
- RDKit: https://www.rdkit.org
