# Olivia-umich/mfinemath-classifier

## Resumen

mFineMath-classifier es un clasificador de calidad de texto especializado en contenido matemático educativo, desarrollado por Olivia-umich como versión multilingüe del `HuggingFaceTB/finemath-classifier`. Su función es puntuar documentos en cualquier idioma sobre la escala FineMath de 0 a 5, que mide el grado de contenido matemático educativo y paso a paso, permitiendo filtrar corpus web multilingües con el mismo criterio que FineMath aplica al texto en inglés.

Técnicamente es un modelo pequeño: un MLP de tres capas (768 → 3072 → 3072 → 1) entrenado sobre embeddings congelados de `jhu-clsp/mmBERT-base`, con un total de 11.805.697 parámetros. Se entrenó con el método de transferencia basado en traducción descrito por Sabolčec et al. en *Adapting English Quality Classifiers for Multilingual LLM Pretraining Data Selection*, usando pares de documentos originales y sus traducciones al inglés etiquetados por el clasificador FineMath original.

Su relevancia es doble: por un lado, demuestra que es posible transferir clasificadores de calidad en inglés a 311 idiomas sin nuevas traducciones; por otro, su model card es inusualmente honesta al advertir que, sobre texto web multilingüe sin filtrar, no supera al clasificador original aplicado directamente, y que la mejor estrategia es promediar ambas puntuaciones. Es una herramienta de investigación para curación de datos de preentrenamiento, no un modelo generativo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP (768 → 3072 → 3072 → 1, ReLU) sobre embeddings congelados de mmBERT-base con mean pooling |
| Parámetros totales | 11.805.697 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 8192 tokens en el encoder; el profesor solo vio los primeros 512 tokens de la traducción |
| Tipos de cuantización | no disponible (pesos en safetensors y PyTorch; al ser un MLP, la cuantización tendría impacto mínimo) |
| Idiomas soportados | multilingüe (311 idiomas en los pares de entrenamiento; sin lista explícita publicada) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y PyTorch (`model.pt`), mismas claves `classifier.{0,2,4}.{weight,bias}` |

## Arquitectura y entrenamiento

El modelo es un clasificador de regresión lineal por capas sobre representaciones congeladas. El encoder es `jhu-clsp/mmBERT-base` en revisión `c5955035435e2bf121cde7f3c8863ef52ff35d82`, en bf16, con hasta 8192 tokens de entrada; se aplica mean pooling sobre los tokens no de padding del último estado oculto, produciendo un vector de 768 dimensiones que alimenta el MLP. Los pesos del encoder no se actualizan: solo se entrena la cabeza clasificadora.

El entrenamiento usó 544.030 pares (documento original, traducción al inglés) en 311 idiomas procedentes de FineTranslations (subconjunto de FineWeb2 filtrado por edu-filter), sin nuevas traducciones. Las etiquetas las generó el `HuggingFaceTB/finemath-classifier` sobre los primeros 512 tokens de la traducción inglesa, y esa puntuación se asignó al documento en su idioma original. Se añadieron 975.887 documentos en inglés puntuados directamente por FineMath (positivos de FineMath 3+ e InfiWebMath 3+, más muestras de MegaMath, FineWeb-edu y DCLM-edu) como ancla para evitar que el modelo olvidara el dominio inglés. El conjunto de entrenamiento final fue de 1.367.419 documentos (489.286 multilingües + 878.133 ingleses), con split 90/5/5 por documento. La optimización usó pérdida de regresión L1, AdamW, learning rate pico 3e-4 con warm-up lineal del 10 % y decaimiento coseno, batch de 1024, 6 épocas y semilla 0. Aproximadamente el 2,2 % de los pares multilingües son FineMath 3+ según el profesor, por lo que la mayoría de ejemplos positivos son ingleses.

## Capacidades

- Clasificación de calidad matemática: asigna una puntuación continua en la escala FineMath 0–5 a un documento, indicando su valor educativo y su estructura paso a paso.
- Multilingüismo: entrena sobre 311 idiomas y puntúa texto en cualquier idioma sin traducción previa.
- Filtrado de corpus a gran escala: si ya existen embeddings de mmBERT del corpus, el coste de puntuar es solo el forward del MLP.
- Puntuación por lotes mediante la clase `MFineMathScorer` incluida en el repositorio.
- No soporta generación de texto, tool calling, agentes, visión ni audio: es exclusivamente un clasificador de texto.
- No dispone de modo de razonamiento ni de capacidades conversacionales.

## Casos de uso

- Curación de corpus de preentrenamiento multilingüe: puntuar un corpus web en decenas de idiomas y conservar documentos con puntuación ≥ 2,5 para enriquecer la mezcla de datos con contenido matemático educativo, replicando el pipeline de FineMath en inglés.
- Filtrado de alta precisión para datasets especializados: aplicar umbrales de 3,0 o 3,5 sobre la media de este modelo y el clasificador original para obtener subconjuntos con precisión de juez del 74 % o 90 %, adecuados para experimentos de ablación sobre datos matemáticos.
- Enriquecimiento de mezclas de datos para modelos pequeños: identificar documentos matemáticos de calidad en idiomas de bajos recursos para construir datasets de instrucción o de razonamiento matemático.
- Investigación en transferencia de clasificadores: usar el modelo como referencia reproducible del método de Sabolčec et al. para estudiar cómo se transfieren filtros de calidad entre idiomas.
- Auditoría de datasets existentes: re-puntuar corpus ya publicados y comparar la distribución de puntuaciones con la del clasificador original para detectar sesgos por idioma.
- Detección de contenido matemático educativo en repositorios web: localizar páginas con explicaciones paso a paso (por ejemplo, tutoriales de álgebra o cálculo) para alimentar índices de búsqueda especializados.
- Evaluación comparativa de filtros: usar las métricas de acuerdo con el profesor y de juez LLM publicadas en la model card como línea base al desarrollar clasificadores alternativos.

## Benchmarks y rendimiento

Acuerdo con el profesor sobre 27.589 documentos multilingües retenidos (617 con etiqueta 3+); el objetivo es la puntuación del clasificador FineMath sobre la traducción inglesa:

| Puntuador | MAE | Spearman | F1 a 3+ | Precisión | Recall | Average precision |
|---|---|---|---|---|---|---|
| Este modelo | 0,154 | 0,848 | 0,804 | 0,883 | 0,737 | 0,889 |
| Clasificador original sobre texto original | 0,168 | 0,841 | 0,828 | 0,799 | 0,859 | 0,916 |
| Mismo MLP entrenado solo con datos ingleses | 0,257 | 0,606 | 0,568 | 0,870 | 0,421 | 0,727 |

En seis idiomas excluidos del entrenamiento (japonés, turco, persa, hindi, finés y griego), el F1 cayó de 0,78 (línea base) a 0,63.

Evaluación con juez LLM independiente (Llama-3.1-70B-Instruct, prompt oficial de anotación FineMath) sobre una muestra estratificada de 6.739 documentos de un corte de 1,5 millones de documentos de FineWeb2:

| Regla de selección | Proporción del corpus conservada | Precisión | Documentos matemáticos conservados |
|---|---|---|---|
| Este modelo ≥ 2,5 | 0,190 % | 0,46 | 0,85 |
| Clasificador original ≥ 2,5 | 0,196 % | 0,45 | 0,85 |
| Media de ambos ≥ 2,5 | 0,159 % | 0,55 | 0,84 |
| Media de ambos ≥ 3,0 | 0,076 % | 0,74 | 0,55 |
| Media de ambos ≥ 3,5 | 0,034 % | 0,90 | 0,29 |

## Requisitos de hardware

- VRAM estimada para inferencia: el MLP ocupa unos 47 MB en fp32 (11,8 M de parámetros); el coste dominante es el encoder mmBERT-base, que en bf16 requiere del orden de 0,5 GB de VRAM para los pesos, más memoria para activaciones con secuencias de hasta 8192 tokens.
- GPU recomendadas: cualquier GPU con al menos 4–8 GB de VRAM puede ejecutar el pipeline completo; una RTX 4090, A100 o H100 no son necesarias y solo aportan throughput.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 8 GB o más (RTX 3060, RTX 4060, RTX 4090, etc.).
- Opciones de despliegue: el repositorio proporciona `mfinemath.py` con la clase `MFineMathScorer`; el encoder se puede servir con vLLM o TGI si se expone como modelo de embeddings, aunque el flujo previsto es calcular embeddings de mmBERT por separado y aplicar el MLP.
- Latencia y throughput: no disponibles en la información proporcionada; al reutilizar embeddings precalculados, el coste marginal por documento es un único forward del MLP.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mFineMath-classifier | 11,8 M (MLP) + encoder mmBERT-base | 8192 tokens | MLP sobre embeddings congelados, entrenado con pares traducidos | Apache 2.0 | Hugging Face |
| HuggingFaceTB/finemath-classifier | no disponible | no disponible | Clasificador sobre `multilingual-e5-small`, entrenado en inglés | no disponible en la información | Hugging Face |
| Mismo MLP entrenado solo con datos ingleses (ablación) | 11,8 M | 8192 tokens | Igual que mFineMath pero sin pares multilingües | no aplica (ablación) | no disponible |

El clasificador original es el competidor directo y, según la propia evaluación del autor, obtiene resultados equivalentes o ligeramente mejores en F1 y average precision sobre texto web multilingüe sin filtrar, aunque con un perfil de errores distinto; la media de ambos mejora la precisión de los dos por separado.

## Limitaciones y advertencias

- Sobre texto web multilingüe sin filtrar, el modelo no supera al clasificador FineMath original aplicado directamente a texto no inglés; el uso recomendado es promediar ambas puntuaciones.
- Con el umbral estándar de 3+, menos de la mitad de los documentos seleccionados son realmente 3+ según el juez LLM; para aplicaciones donde la precisión importa, debe usarse un umbral más alto (3,0 o 3,5 sobre la media).
- Sobrese lecciona vietnamita, indonesio y tailandés (precisión de juez de 0,15–0,34 con umbral 3+).
- Rinde peor en idiomas ausentes de los pares de entrenamiento: el F1 cae de 0,78 a 0,63 en los seis idiomas excluidos.
- Las etiquetas provienen de un clasificador inglés aplicado a traducciones automáticas, y el profesor solo vio los primeros 512 tokens de la traducción mientras el embedding cubre hasta 8192 tokens del original, lo que introduce desajustes.
- Los números de juez dependen de un único modelo juez; un segundo juez (gemma-3-27b-it) resultó demasiado permisivo con el prompt empleado.
- Riesgo de alucinación no aplica al no ser un modelo generativo, pero sí existe riesgo de clasificación errónea en documentos ambiguos o con notación matemática poco convencional.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse la licencia del encoder base mmBERT-base y del clasificador profesor para pipelines completos.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validación de la comunidad fuera de la evaluación del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Olivia-umich/mfinemath-classifier
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Clasificador FineMath original: https://huggingface.co/HuggingFaceTB/finemath-classifier
- Paper de referencia (Sabolčec et al., arXiv 2610.11585): https://arxiv.org/abs/2610.11585
- Dataset FineTranslations: no disponible como enlace directo en la información proporcionada
- Dataset FineWeb2: no disponible como enlace directo en la información proporcionada
