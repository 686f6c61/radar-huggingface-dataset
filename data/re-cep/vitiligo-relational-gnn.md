# re-cep/vitiligo-relational-gnn

## Resumen

El modelo `re-cep/vitiligo-relational-gnn` es una red neuronal sobre grafos multi-relacional (R-GCN) desarrollada por The Vitiligo Initiative (cuenta de Hugging Face `re-cep`) para el descubrimiento de fármacos modificadores de la enfermedad en vitíligo y la evaluación de combinaciones terapéuticas. No es un modelo de lenguaje generativo, sino un modelo de extracción de características y predicción de enlaces (link prediction) sobre un grafo de conocimiento biomédico con entidades de tipo fármaco, diana molecular, enfermedad y ensayo clínico. Su relevancia radica en abordar un problema clínico concreto: la recaída en más del 40 % de pacientes tras suspender terapias tópicas con inhibidores de JAK, motivada por la persistencia de células T de memoria residentes (T_RM) en la piel y por barreras moleculares en lesiones no respondedoras.

Técnicamente, el modelo combina un codificador `FastRGCNConv` con descomposición en bases y normalización LayerNorm residual, junto con un decodificador `DistMult` para puntuar tripletas. Cada nodo se representa mediante un vector de 772 dimensiones que fusiona 768 dimensiones de embeddings contextuales de texto (generados por el encoder BiomedBERT ajustado `re-cep/vitiligo-relation-extractor`) con 4 dimensiones de datos funcionales de transcriptómica y genética: perfiles de expresión de biopsias cutáneas (GSE311770), movilización de células madre de melanocitos del bulbo folicular (GSE150954), diferenciación serotoninérgica inducida por fluoxetina (GSE344141) y pesos cuantitativos de loci de riesgo del catálogo GWAS.

El modelo se publica con licencia MIT y un tamaño de repositorio de 0,0 GB (checkpoint de pesos en formato `.pt` de PyTorch, no safetensors ni GGUF). Su pipeline declarado en Hugging Face es `feature-extraction` y el único idioma declarado es inglés. Está pensado para integrarse en un flujo de trabajo de descubrimiento preclínico in silico, no para inferencia de texto en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Graph Neural Network multi-relacional: `FastRGCNConv` (2 capas, descomposición en bases, LayerNorm residual) + decodificador `DistMult` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo sobre grafo, no sobre secuencias de texto) |
| Tipos de cuantizacion | no disponible (checkpoint `.pt` en precisión nativa; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | `.pt` (PyTorch, checkpoint `relational_gnn.pt`) |
| Dimension oculta | 128 |
| Dimension de features multimodales | 772 (768 texto + 4 transcriptómica/genética) |
| Entidades (nodos) | 17.685 (`DRUG`, `TARGET`, `DISEASE`, `TRIAL`) |
| Aristas (tripletas) | 62.006 en 12 predicados relacionales |
| Pipeline declarado | `feature-extraction` |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

El modelo implementa una red convolucional sobre grafos relacional (R-GCN) con dos capas `FastRGCNConv` que emplean descomposición en bases para contener el número de parámetros asociados a los 12 predicados relacionales del grafo. Cada capa incorpora conexiones residuales y normalización LayerNorm. La representación de cada nodo se inicializa con un vector de 772 dimensiones: 768 dimensiones procedentes del encoder BiomedBERT ajustado sobre BioRED (`re-cep/vitiligo-relation-extractor`) y 4 dimensiones de features funcionales derivadas de tres conjuntos de datos transcriptómicos (GSE311770 con 105 perfiles de biopsia de 1 mm, 51 lesionales frente a 31 controles no lesionales; GSE150954 con log2FC de movilización de células madre de melanocitos del bulbo folicular; GSE344141 con fold-change de diferenciación serotoninérgica vía 5-HT1A) y de 157 asociaciones de loci de riesgo del catálogo GWAS. La decodificación de tripletas se realiza con `DistMult`.

El entrenamiento incorpora varias decisiones de diseño destacables. Primero, una fase de "denoising" de ensayos clínicos que descarta más de 900 cadenas de texto libre de brazos de ensayo y restringe el pool de candidatos a 893 moléculas canónicas validadas químicamente (con identificadores MeSH, DrugBank, ChEMBL u OpenTargets). Segundo, un esquema de aprendizaje causal firmado con pesos según la escala de Bradford Hill (`perturbation_in_human` = 1,0, `animal` = 0,85, `in_vitro` = 0,70) y una penalización inversa explícita para inmunoterapias oncológicas que causan vitíligo como efecto adverso (relación `CAUSES vitiligo`). Tercero, un muestreo negativo sesgado por grado con probabilidad proporcional a `deg(v)^0,75` para neutralizar atajos de nodos hub. No se documenta el número total de tokens de entrenamiento ni el uso de RLHF o DPO, dado que no es un modelo de lenguaje.

## Capacidades

- Predicción de enlaces (link prediction) sobre un grafo de conocimiento biomédico con 12 tipos de relaciones.
- Extracción de características multimodales de nodos (fármacos, dianas, enfermedades, ensayos) combinando texto y transcriptómica.
- Predicción de dianas inhibidas por un fármaco dado (`predict_top_k` con relación `INHIBITS` y `target_kind="TARGET"`).
- Predicción de fármacos candidatos para una enfermedad (`predict_top_k` con relación `TREATS`, `target_kind="DRUG"` y filtro `canonical_only=True`).
- Puntuación de tripletas con probabilidad calibrada (salida de `DistMult` con score y probabilidad).
- Razonamiento causal firmado: distingue asociaciones humanas, animales e in vitro mediante pesos Bradford Hill.
- Aprendizaje inverso de cáncer: penaliza fármacos que causan vitíligo como efecto adverso.
- Identificación de combinaciones sinérgicas de dos fármacos (un agente de "reset inmune" más un adyuvante regenerativo).
- Capacidades multilingües: no, únicamente inglés (en).
- No soporta tool calling, function calling, agentes multi-paso ni generación de texto: no es un LLM.

## Casos de uso

- Descubrimiento de fármacos modificadores de la enfermedad en vitíligo: el modelo predice qué moléculas pueden desarmar el anclaje de células T de memoria residentes (T_RM) en la piel actuando sobre dianas como IL15, IL15RA, IL2RB, JAK1, JAK3, STAT1, CD103 y CD69. Es adecuado porque integra relaciones fármaco-diana-enfermedad en un único grafo con pesos causales, superando la predicción de enlaces naive.
- Reversión de la no respuesta terapéutica: identificación de moléculas que activan células madre de melanocitos (CTNNB1, HTR1A, MITF) y superan la barrera molecular de lesiones no respondedoras (elevación de PDE4B de +9,09 log2FC en GSE256271). El modelo incorpora esta señal transcriptómica directamente en las features de nodo.
- Diseño de terapias combinadas de dos fármacos: el modelo permite emparejar un agente de reset inmune con un adyuvante regenerativo (por ejemplo, itacitinib + clobetasone butirato, o ruxolitinib + sacubitril/valsartán) y puntuar la sinergia a través de la predicción de enlaces múltiples.
- Reposicionamiento de fármacos existentes: dado que el grafo contiene 893 moléculas canónicas validadas químicamente, el modelo puede puntuar fármacos ya aprobados para otras indicaciones (por ejemplo, sacubitril/valsartán, vilazodona, apremilast) como candidatos para vitíligo, reduciendo el riesgo de desarrollo.
- Filtrado de candidatos en pipelines preclínicos: el modelo actúa como etapa de priorización antes de validación in vitro o in vivo, ordenando candidatos por probabilidad y permitiendo a los equipos de descubrimiento centrar recursos en las hipótesis mejor puntuadas.
- Análisis de efectos adversos paradójicos: la penalización inversa sobre inmunoterapias oncológicas que causan vitíligo permite identificar mecanismos de inducción de la enfermedad y, por extensión, oportunidades terapéuticas derivadas de esos mismos mecanismos.
- Investigación en inmunología cutánea: la integración de transcriptómica de biopsias (GSE311770) con datos de movilización de células madre (GSE150954, GSE344141) permite generar hipótesis sobre ejes moleculares concretos (por ejemplo, el eje serotonérgico 5-HT1A) que luego pueden validarse experimentalmente.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la model card son métricas de predicción de enlaces sobre el propio grafo:

| Metrica | Valor |
|---|---|
| Best Val MRR | 0,1223 |
| Test Hits@10 | 12,40 % |
| Test MRR | 0,1186 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes en el dominio biomédico como DrugBank link prediction o BioKG) en la información disponible. Las métricas anteriores son específicas del grafo propietario del autor y no son directamente comparables con las de otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,0 GB y el grafo tiene 17.685 nodos con dimensión oculta 128 y features de 772 dimensiones, por lo que la huella de memoria es reducida (del orden de decenas o pocos cientos de MB en FP32, estimación no confirmada por el autor).
- GPU recomendadas: no disponible. Por el tamaño del grafo, una GPU consumer moderna (RTX 3060 o superior) debería ser suficiente, pero el autor no lo documenta.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del checkpoint y del grafo, aunque no se confirma en la model card.
- Opciones de despliegue: el uso documentado es mediante el paquete Python del proyecto (`vitiligo.gnn.train.load_trained_gnn` y `vitiligo.gnn.dataset.load_graph_dataset`) sobre PyTorch y PyTorch Geometric. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entidades / parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `re-cep/vitiligo-relational-gnn` | R-GCN + DistMult sobre grafo biomédico | 17.685 nodos, 62.006 tripletas, dim. oculta 128 | no aplica | MIT | Hugging Face (repo 0,0 GB) |
| `re-cep/vitiligo-relation-extractor` | BiomedBERT ajustado para extracción de relaciones | no disponible | no disponible | no disponible | Hugging Face |
| Modelos genéricos de link prediction biomédica (p. ej. variantes de R-GCN sobre DrugBank) | R-GCN | variable según implementación | no aplica | variable | no disponible en la información proporcionada |

No se dispone de datos de benchmarks comparables publicados en la información proporcionada para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo es específico del dominio del vitíligo y su grafo de conocimiento propietario; no es generalizable a otras enfermedades sin reentrenamiento.
- Las métricas de rendimiento son modestas (Test MRR 0,1186, Hits@10 12,40 %), lo que indica que las predicciones deben tratarse como hipótesis a validar experimentalmente, no como conclusiones clínicas.
- Riesgo de alucinación en sentido amplio: la predicción de enlaces puede producir asociaciones espurias, especialmente en nodos con pocos datos o en relaciones poco representadas en el grafo.
- El sesgo de grado se mitiga con muestreo negativo ponderado, pero no se elimina; los nodos hub pueden seguir dominando las puntuaciones.
- Los pesos causales Bradford Hill son una aproximación heurística y no sustituyen la evidencia experimental.
- El entrenamiento se limita a inglés y a datos transcriptómicos y genéticos concretos (GSE311770, GSE150954, GSE344141, GWAS Catalog); la cobertura de poblaciones no europeas y de otros subtipos de vitíligo no está documentada.
- Licencia MIT: permite uso comercial y modificación, pero no se documentan garantías ni soporte; el autor no ofrece cláusulas de responsabilidad clínica.
- No es un dispositivo médico ni un modelo validado clínicamente; cualquier uso en decisiones terapéuticas requiere validación independiente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- El formato de pesos es `.pt` de PyTorch, no safetensors ni GGUF, lo que limita la interoperabilidad con herramientas de inferencia estándar de LLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/re-cep/vitiligo-relational-gnn
- Código fuente: https://github.com/recepsirin/vitiligo-initiative
- Grafo de conocimiento (dataset): https://huggingface.co/datasets/re-cep/vitiligo-knowledge-graph
- Checkpoint del extractor de relaciones: https://huggingface.co/re-cep/vitiligo-relation-extractor
- Perfil del autor en Hugging Face: https://huggingface.co/re-cep
- Artículo relacionado sobre IA en diagnóstico y tratamiento del vitíligo: https://onlinelibrary.wiley.com/doi/10.1111/sji.70076
