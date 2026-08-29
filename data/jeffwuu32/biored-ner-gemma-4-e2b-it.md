# jeffwuu32/biored-ner-gemma-4-E2B-it

## Resumen

`jeffwuu32/biored-ner-gemma-4-E2B-it` es un adaptador LoRA (entrenado con QLoRA) para extracción de entidades nombradas (NER) en el dominio biomédico, específicamente sobre el dataset BioRED. El adaptador se construye sobre el modelo base `google/gemma-4-E2B-it`, la variante de instrucción de 2 mil millones de parámetros de la familia Gemma 4 de Google DeepMind. El modelo está diseñado para identificar y clasificar seis tipos de entidades: compuestos químicos, enfermedades o fenotipos, genes o productos génicos, taxones de organismos, variantes de secuencia y líneas celulares, utilizando marcadores posicionales para preservar la ubicación exacta de cada entidad en el texto original.

Este adaptador resuelve el problema de la anotación biomédica automática, una tarea crítica para la minería de literatura científica y la construcción de bases de conocimiento. Su relevancia radica en que combina un modelo base moderno (Gemma 4) con un ajuste fino eficiente mediante PEFT, lo que permite desplegar capacidades de NER biomédico con un coste computacional reducido. Aunque el repositorio no proporciona una licencia explícita, el modelo base Gemma 4 requiere acceso gated a través de Hugging Face, lo que condiciona su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA/QLoRA sobre `google/gemma-4-E2B-it` (arquitectura base no especificada) |
| Parametros totales | no disponible (el adaptador tiene parametros propios, no indicados) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QLoRA (cuantizacion del modelo base no especificada) |
| Idiomas soportados | no disponible (probablemente ingles, ya que BioRED es en ingles, pero no se indica) |
| Licencia | no disponible (el modelo base Gemma 4 tiene su propia licencia con acceso gated) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) entrenado con QLoRA sobre el modelo base `google/gemma-4-E2B-it`. No se proporcionan detalles sobre la arquitectura interna de Gemma 4 E2B (si es un transformer estándar, si usa atención lineal, etc.), pero se sabe que la familia Gemma 4 incluye variantes optimizadas para razonamiento y agentes, con tamaños que van desde 2B hasta 31B. El adaptador se entrena específicamente para la tarea de extracción de spans de entidades en el dataset BioRED, un corpus de relaciones biomédicas publicado en 2022 por Luo et al.

El entrenamiento utiliza un prompt de sistema detallado que instruye al modelo a extraer entidades de seis categorías predefinidas, copiando el texto exacto y añadiendo marcadores posicionales (`<unused0>N<unused1>`) y tokens de categoría (`<unused3>` a `<unused8>`). El prompt especifica reglas estrictas: no extraer los marcadores, incluir menciones negadas o inciertas, y no deduplicar ocurrencias repetidas. No se informa del número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO.

## Capacidades

- Extracción de entidades nombradas biomédicas en seis categorías: ChemicalEntity, DiseaseOrPhenotypicFeature, GeneOrGeneProduct, OrganismTaxon, SequenceVariant y CellLine.
- Manejo de marcadores posicionales para preservar la ubicación exacta de cada entidad en el texto original, lo que permite reconstruir spans a nivel de caracteres.
- Capacidad para copiar texto verbatim incluyendo espacios internos irregulares y saltos de línea, adaptándose a formatos de texto biomédico complejos.
- Incluye menciones negadas, inciertas o atenuadas, pero excluye las palabras de negación o duda en sí mismas.
- Genera salidas estructuradas en formato `N<unused2>TEXT<CATEGORY_TOKEN>`, donde `N` es el identificador del marcador más cercano y `CATEGORY_TOKEN` es un token especial por categoría.
- No se reportan capacidades adicionales como tool calling, razonamiento multi-paso, soporte multimodal o generación de código, ya que el adaptador está especializado únicamente en NER biomédico.

## Casos de uso

- Anotación automática de literatura biomédica: el modelo puede procesar abstracts de PubMed o artículos completos para extraer entidades como genes, enfermedades y compuestos químicos, facilitando la creación de corpus anotados para entrenar otros sistemas.
- Construcción de bases de conocimiento biomédicas: las entidades extraídas pueden integrarse en bases de datos como UniProt o DrugBank, enriqueciendo las relaciones entre genes, enfermedades y fármacos.
- Minería de textos para farmacovigilancia: extracción de menciones de efectos adversos (DiseaseOrPhenotypicFeature) y compuestos químicos en informes clínicos o redes sociales, ayudando a detectar señales de seguridad.
- Soporte a revisiones sistemáticas: el modelo puede acelerar el cribado de la literatura al identificar automáticamente estudios que mencionan variantes genéticas (SequenceVariant) y su relación con fenotipos.
- Integración en pipelines de procesamiento de lenguaje natural biomédico: al ser un adaptador PEFT, se puede cargar junto con el modelo base en entornos de producción usando transformers y PEFT, permitiendo su combinación con otros módulos como normalización de entidades o extracción de relaciones.
- Análisis de datos de secuenciación clínica: extracción de variantes de secuencia y genes mencionados en informes de laboratorio o historiales clínicos, facilitando la interpretación de resultados genómicos.

## Benchmarks y rendimiento

El autor proporciona resultados en el conjunto de test de BioRED, medidos en dos modalidades: "Category + text (multiset)" y "Positional (char-level)". Los valores de F1 son los siguientes.

| Modalidad | Métrica | Micro | Macro |
|---|---|---|---|
| Category + text | P | 0.738 | 0.724 |
| Category + text | R | 0.734 | 0.667 |
| Category + text | F1 | 0.736 | 0.687 |
| Positional (char-level) | P | 0.765 | 0.732 |
| Positional (char-level) | R | 0.774 | 0.696 |
| Positional (char-level) | F1 | 0.770 | 0.708 |

Desglose por categoría (Category + text):

| Categoria | P | R | F1 |
|---|---|---|---|
| CellLine | 0.793 | 0.460 | 0.582 |
| ChemicalEntity | 0.697 | 0.792 | 0.741 |
| DiseaseOrPhenotypicFeature | 0.694 | 0.755 | 0.723 |
| GeneOrGeneProduct | 0.837 | 0.729 | 0.779 |
| OrganismTaxon | 0.784 | 0.776 | 0.780 |
| SequenceVariant | 0.541 | 0.490 | 0.514 |

Desglose por categoría (Positional):

| Categoria | P | R | F1 |
|---|---|---|---|
| CellLine | 0.701 | 0.444 | 0.544 |
| ChemicalEntity | 0.765 | 0.847 | 0.804 |
| DiseaseOrPhenotypicFeature | 0.769 | 0.813 | 0.790 |
| GeneOrGeneProduct | 0.819 | 0.739 | 0.777 |
| OrganismTaxon | 0.712 | 0.772 | 0.740 |
| SequenceVariant | 0.628 | 0.559 | 0.592 |

Nota: el autor indica que el 1.0% de las generaciones del test no fueron parseables y que se espera una variación menor de F1 (<0.01) entre entornos debido a diferencias de precisión (fp16 vs bf16). No se proporcionan comparaciones con otros modelos NER biomédicos.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 1.7 GB en disco (tamaño del repositorio), pero la inferencia requiere cargar el modelo base `google/gemma-4-E2B-it` completo, cuyo tamaño no se especifica en la información disponible.
- Dado que el nombre del modelo base sugiere 2 mil millones de parámetros (E2B), se estima que la VRAM necesaria para inferencia en precisión fp16 sería de al menos 4-6 GB, aunque esto no está confirmado.
- Se recomienda una GPU con al menos 8 GB de VRAM para ejecutar el modelo base con el adaptador en cuantización QLoRA, aunque es posible que funcione en GPUs de consumo como la RTX 3060 o superiores.
- El despliegue se puede realizar mediante la librería `transformers` con `PeftModel` y `AutoModelForMultimodalLM` (según el código de ejemplo), o usando `vLLM` u otras herramientas que soporten PEFT.
- No se proporcionan datos de latencia o throughput. El rendimiento dependerá del hardware y de la longitud del contexto, que no está especificada.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos NER biomédicos. El autor no menciona alternativas ni se han encontrado benchmarks comparativos en la información proporcionada. Se podría comparar con modelos como PubMedBERT o BioBERT, pero no hay datos de rendimiento de estos en las mismas condiciones, por lo que no se incluye una tabla comparativa.

## Limitaciones y advertencias

- El modelo base `google/gemma-4-E2B-it` es de acceso gated: es necesario solicitar acceso en su página de Hugging Face antes de poder cargar el adaptador.
- No se especifica la licencia del adaptador ni del modelo base en el repositorio, lo que genera incertidumbre sobre las restricciones de uso comercial.
- El adaptador está especializado exclusivamente en las seis categorías de BioRED; no es adecuado para otras tareas NER fuera de ese dominio.
- La variante SequenceVariant muestra un rendimiento notablemente inferior (F1 ~0.51-0.59), lo que indica una limitación en la detección de variantes genéticas.
- El prompt de sistema es complejo y debe respetarse exactamente para obtener resultados parseables; el autor reporta un 1% de generaciones no parseables.
- No se dispone de información sobre la longitud de contexto soportada, lo que puede afectar a documentos largos.
- El modelo puede presentar sesgos inherentes al dataset BioRED, que está en inglés y se centra en literatura biomédica, por lo que su rendimiento en otros idiomas o dominios no está garantizado.
- Existe riesgo de alucinación en la extracción de entidades, especialmente en textos ambiguos o con terminología poco frecuente, como sugiere la baja precisión en algunas categorías.

## Enlaces

- Repositorio del adaptador en Hugging Face: https://huggingface.co/jeffwuu32/biored-ner-gemma-4-E2B-it
- Modelo base Gemma 4 E2B it: https://huggingface.co/google/gemma-4-E2B-it
- Página de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Documentación de Gemma 4 para Google AI Edge: https://developers.google.com/edge/litert-lm/models/gemma-4
- Dataset BioRED (referenciado en la cita): Luo et al., "BioRED: a rich biomedical relation extraction dataset," *Briefings in Bioinformatics*, 2022.
