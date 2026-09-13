# amav/pubmedbert-chondrogenesis-classifier

## Resumen

PubMedBERT Chondrogenesis Regulator Classifier es un modelo de clasificación de secuencias en inglés biomédico desarrollado por el usuario amav (vinculado al proyecto ChondroTextomics) que determina, dada una oración de un texto biomédico en la que se menciona un gen, si esa mención respalda que el gen sea un regulador de la condrogénesis (desarrollo del cartílago). Se trata de un ajuste fino de PubMedBERT/BiomedBERT base, un transformer encoder de 109.486.082 parámetros (aproximadamente 109,5 millones), sobre oraciones anotadas por dos curadores a lo largo de seis iteraciones de aprendizaje activo.

El modelo resuelve un problema concreto de minería de literatura a escala: el cribado de resúmenes de PubMed para descubrir candidatos a regulador que después se validan con análisis de enriquecimiento funcional (GO) y modelado basado en grafos sobre datos multi-ómicos. No es un modelo generativo ni un sistema de razonamiento: es un clasificador binario a nivel de oración con umbral de decisión sin calibrar.

Su relevancia es acotada y de nicho. El repositorio no declara licencia, no tiene descargas ni interacciones en el momento de la consulta, y su rendimiento notificado (AUC-ROC 0,93; F1 0,67 sobre el conjunto de retención) indica una precisión moderada en la clase positiva, lo que condiciona su uso a tareas de pre-cribado y no a decisiones biológicas o clínicas autónomas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (PubMedBERT/BiomedBERT base), ajustado para clasificación de secuencias |
| Parámetros totales | 109.486.082 (≈109,5 M), según los pesos safetensors del repositorio |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (límite del modelo base PubMedBERT base; no se especifica explícitamente en la model card) |
| Tipos de cuantización | No disponible. El repositorio solo publica pesos safetensors sin cuantizaciones precalculadas |
| Idiomas soportados | Inglés (las oraciones de entrenamiento proceden de resúmenes de PubMed, en inglés). Los metadatos de HuggingFace no declaran idiomas |
| Licencia | No disponible (no declarada en el repositorio ni en la model card) |
| Formato de pesos | safetensors |
| Pipeline declarado | text-classification |
| Tamaño del repositorio | 0,4 GB |
| Modelo base | microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract-fulltext (tag de HuggingFace: microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext) |
| Tarea | Clasificación binaria a nivel de oración; el objetivo de clasificación es el gen mencionado, no la oración |

## Arquitectura y entrenamiento

La arquitectura es la de PubMedBERT base: un transformer encoder con atención completa, preentrenado desde cero sobre texto biomédico (resúmenes y texto completo) por Microsoft Research. Sobre ese checkpoint se añade una cabeza de clasificación de secuencias y se ajusta para una tarea binaria. Al ser un encoder base, no incorpora mecanismos de decodificación especulativa, atención lineal, SSM ni componentes híbridos; el coste de inferencia es el de un forward pass de 109,5 M de parámetros sobre secuencias cortas.

El entrenamiento siguió un bucle de aprendizaje activo con 6 iteraciones: 150 oraciones semilla más 100 oraciones por iteración, anotadas por 2 curadores. El desequilibrio de clases entre reguladores y no reguladores se abordó en dos frentes: pérdida ponderada por clase (class-weighted loss) y adquisición ponderada por clase, combinando criterios de incertidumbre, diversidad y aleatoriedad para forzar la aparición de más ejemplos positivos. El criterio de parada fue alcanzar un AUC-ROC ≥ 0,9 en el conjunto de validación. Las oraciones proceden de resúmenes de PubMed. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna otra fase de alineación, algo esperable en un clasificador discriminativo.

## Capacidades

- Clasificación binaria a nivel de oración: predice si una oración que menciona un gen respalda que ese gen sea regulador de la condrogénesis.
- Extracción de señal gen-específica dentro de una oración, ya que el objetivo declarado de la clasificación es el gen y no la oración completa.
- Funcionamiento sobre texto biomédico en inglés, tanto en estilo de resumen como de texto completo, heredado del preentrenamiento del modelo base.
- Integración en pipelines de minería de literatura como etapa de filtrado previo a análisis de enriquecimiento GO o modelado en grafo sobre multi-ómicos.
- Reutilización como punto de partida para nuevos bucles de aprendizaje activo en dominios o tipos de entidad relacionados.
- No soporta generación de texto, razonamiento multi-paso, código, matemáticas, visión, audio ni tool calling o function calling.
- No es un agente y no implementa modos de pensamiento ni planificación.
- Capacidad multilingüe: no disponible; los datos de entrenamiento son exclusivamente en inglés.

## Casos de uso

- Cribado masivo de literatura: dada una colección de oraciones de PubMed con menciones de genes detectadas por un etiquetador NER, el modelo puntúa cada mención y permite priorizar las que probablemente describen regulación de la condrogénesis, reduciendo el volumen que llega a revisión manual.
- Priorización de candidatos para validación experimental: los genes con mayor puntuación se envían a validación en laboratorio (por ejemplo, ensayos de expresión en condrocitos), usando el clasificador como filtro de bajo coste antes de consumir recursos experimentales.
- Pre-filtrado para análisis de enriquecimiento funcional: al restringir el conjunto de genes a los que superan el umbral, los análisis GO posteriores se ejecutan sobre listas más limpias y específicas del proceso biológico de interés.
- Construcción de grafos de regulación génica: las predicciones del modelo actúan como evidencia textual para aristas gen-condrogénesis en un grafo que combine literatura con datos multi-ómicos, tal y como describe el proyecto del autor.
- Curaduría asistida y aprendizaje activo: las predicciones se usan para pre-anotar nuevas oraciones y seleccionar las más informativas (incertidumbre alta, diversidad) en la siguiente iteración de anotación por curadores.
- Detección de sesgo en corpus: al comparar las puntuaciones del modelo con la distribución real de genes estudiados, se pueden identificar genes infrarepresentados en la literatura sobre condrogénesis y orientar búsquedas bibliográficas adicionales.
- Transferencia a otros procesos biológicos: reajustando el modelo con un conjunto semilla pequeño y pocas iteraciones de anotación, puede adaptarse a otras relaciones gen-proceso, dado que el coste de reentrenamiento de un encoder de 109,5 M es bajo.

## Benchmarks y rendimiento

Los únicos datos de rendimiento disponibles son los notificados por el autor en la model card para el modelo de producción (entrenado con los conjuntos de entrenamiento y validación, evaluado sobre un conjunto de retención):

| Métrica | Valor |
|---|---|
| AUC-ROC | 0,93 |
| F1 | 0,67 |
| Precision | 0,69 |
| Recall | 0,66 |

No se han publicado resultados de benchmarks estándar de la información disponible: no hay datos de MMLU, HumanEval, GSM8K ni de conjuntos de referencia de relación gen-enfermedad o gen-función que permitan comparación directa con otros clasificadores biomédicos. Tampoco se documenta la composición exacta del conjunto de retención ni el número de ejemplos por clase, por lo que los valores anteriores no son directamente reproducibles a partir de la información pública.

## Requisitos de hardware

- Pesos en precisión completa: aproximadamente 437 MB (109,5 M de parámetros en fp32). En fp16, unos 219 MB; en int8, unos 110 MB. Cálculo derivado del número de parámetros, no publicado por el autor.
- VRAM total para inferencia: inferior a 2 GB en fp16 con lotes pequeños, incluyendo activaciones y memoria del runtime. Cabe holgadamente en cualquier GPU de consumo con 4 GB o más.
- GPUs recomendadas: cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente y deja margen para lotes grandes; también es viable en GPU de datacenter (T4, A10, L4, A100, H100), aunque sobredimensionadas para este tamaño. La inferencia en CPU es viable para cribados de decenas de miles de oraciones.
- Despliegue: pipeline de text-classification de HuggingFace Transformers, exportación a ONNX Runtime para inferencia optimizada en CPU, TorchServe o FastAPI como servicio propio, y Hugging Face Inference Endpoints. Herramientas orientadas a modelos generativos (vLLM, TGI, llama.cpp, Ollama) no son la vía natural para este checkpoint, aunque llama.cpp soporta algunos encoders BERT para embeddings, no para esta cabeza de clasificación concreta.
- Latencia y throughput: no disponibles. No se ha publicado ninguna medición de latencia ni de frases por segundo para este modelo.
- Almacenamiento: el repositorio ocupa 0,4 GB, por lo que el despliegue en contenedores ligeros no supone un problema de espacio.

## Comparativa con modelos similares

No se dispone de resultados comparativos publicados entre este modelo y alternativas de la misma categoría. La tabla siguiente recoge únicamente lo que puede afirmarse a partir de la información disponible, marcando como no disponible todo dato no verificado.

| Modelo | Tipo | Parámetros | Contexto | Licencia | Rendimiento en esta tarea |
|---|---|---|---|---|---|
| amav/pubmedbert-chondrogenesis-classifier | Clasificador binario gen-condrogénesis (fine-tune) | 109,5 M | 512 tokens (modelo base) | No disponible | AUC-ROC 0,93; F1 0,67; precision 0,69; recall 0,66 (datos del autor) |
| microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext | Encoder biomédico preentrenado | No disponible en la información proporcionada | No disponible en la información proporcionada | No disponible en la información proporcionada | No aplica sin ajuste fino |
| Otros fine-tunes biomédicos tipo BioBERT o SciBERT para clasificación de relaciones gen-función | Clasificadores biomédicos | No disponible | No disponible | No disponible | No disponible |
| Clasificadores de relación gen-enfermedad publicados (por ejemplo, variantes de BioBERT ajustadas) | Clasificación de relaciones | No disponible | No disponible | No disponible | No disponible |

En la búsqueda web realizada no se han encontrado referencias técnicas, papers ni repositorios comparables relacionados con este modelo; los resultados devueltos eran contenido no relacionado y se han descartado.

## Limitaciones y advertencias

- El umbral de decisión no está calibrado: las métricas se obtuvieron con el corte por defecto de 0,5, por lo que las probabilidades no deben interpretarse como calibradas y el punto de operación óptimo depende del caso de uso.
- F1 de 0,67 con precision 0,69 y recall 0,66 implica una tasa notable de falsos positivos y falsos negativos; el modelo no es adecuado como fuente de verdad biológica.
- El objetivo de clasificación es la mención del gen dentro de una oración, no el documento ni el gen en su conjunto: una misma entidad puede recibir predicciones contradictorias en oraciones distintas.
- Sesgo de dominio: entrenado solo con oraciones de resúmenes de PubMed en inglés. No hay evidencia de funcionamiento en texto completo, patentes, informes clínicos ni otros idiomas.
- Sesgo de selección de literatura: los genes muy estudiados aparecen con mucha más frecuencia en la literatura, lo que puede inflar sus puntuaciones frente a genes poco caracterizados.
- Desequilibrio de clases tratado mediante ponderación, pero sin datos públicos sobre la proporción final de positivos y negativos en el conjunto de retención.
- Licencia no declarada: la ausencia de licencia explícita impide asumir derechos de uso comercial; conviene contactar con el autor antes de cualquier despliegue en producción.
- Ausencia de validación externa e independiente: el repositorio no tiene descargas ni interacciones, y no se han localizado publicaciones revisadas por pares que reproduzcan las métricas declaradas.
- El uso previsto declarado excluye explícitamente decisiones clínicas o biológicas tomadas de forma autónoma; debe emplearse como herramienta de cribado previo.
- Inconsistencia menor en los metadatos: la model card cita el identificador de PubMedBERT, mientras que las etiquetas de HuggingFace apuntan al repositorio renombrado BiomedBERT. Conviene verificar que el checkpoint base cargado es el esperado.
- Las fechas de creación y actualización del repositorio en HuggingFace (septiembre de 2026) son posteriores a la fecha habitual de consulta; verificar la vigencia de los artefactos publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amav/pubmedbert-chondrogenesis-classifier
- Modelo base (identificador citado en la model card): https://huggingface.co/microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract-fulltext
- Modelo base (identificador de las etiquetas de HuggingFace): https://huggingface.co/microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext
- Repositorio del proyecto y cita del paper: https://github.com/ChondroTextomics/ALRegulatorDiscovery/
- Enlaces adicionales de la búsqueda web: no se han encontrado enlaces relevantes; los resultados devueltos no guardaban relación con el modelo.
