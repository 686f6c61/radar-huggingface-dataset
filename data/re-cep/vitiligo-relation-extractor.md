# re-cep/vitiligo-relation-extractor

## Resumen

El modelo `re-cep/vitiligo-relation-extractor` es un extractor de relaciones biomédicas desarrollado por el equipo de la Vitiligo Initiative, una plataforma de investigación abierta y sin ánimo de lucro. Se trata de un fine-tuning de BiomedBERT (versión base, uncased, preentrenada sobre abstracts y texto completo de PubMed) al que se le añade un clasificador de pares de entidades de estilo ATLOP, sin pooling de contexto. Su función es clasificar la relación existente entre cada par de entidades (químicos, enfermedades, genes y variantes) en un pasaje biomédico previamente anotado, utilizando las ocho categorías de relación del corpus BioRED.

El modelo resuelve un problema concreto: leer relaciones que PubTator 3.0 no cubre, como cuerpos de texto completo de artículos y abstracts fuera de PubMed. Con 111 millones de parámetros y una licencia Apache-2.0, está pensado para construir grafos de conocimiento biomédicos donde cada arista conserva la frase de la que procede, lo que permite verificación manual. Es relevante porque demuestra que una arquitectura que codifica cada pasaje una sola vez (en lugar de codificar cada par por separado) puede procesar volúmenes grandes de candidatos —821.413 pares en textos completos— con una calidad razonable.

La especialización temática (vitíligo) y la combinación de datos plateados de PubTator con datos dorados de BioRED lo sitúan como una herramienta de nicho para investigación en literatura biomédica, no como un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BiomedBERT) con clasificador de pares de entidades estilo ATLOP, sin context pooling |
| Parametros totales | 111.357.961 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de BiomedBERT base (uncased, preentrenado sobre abstracts y texto completo de PubMed) y le añade un clasificador de pares de entidades inspirado en ATLOP, sin pooling de contexto localizado. La innovación clave es que un pasaje se codifica una sola vez y todos los pares de entidades del pasaje se puntúan a partir de esa única pasada, lo que reduce drásticamente el coste computacional frente a enfoques que codifican cada par por separado. El modelo incluye un embedding de tipo de entidad y un sesgo de decisión ajustable. Las etiquetas de salida son: Association, Positive_Correlation, Negative_Correlation, Bind, Cotreatment, Comparison, Drug_Interaction, Conversion, o ninguna. Los tipos de entidad soportados son Chemical, Disease, Gene y Variant.

El entrenamiento se realizó en dos fases. Primero, una fase plateada (silver) con las relaciones de PubTator 3.0 en 11.106 abstracts del corpus de la Vitiligo Initiative, excluyendo todos los abstracts de BioRED y un conjunto fijo de retención de 1 de cada 20. Después, una fase dorada (gold) sobre los 400 abstracts de entrenamiento de BioRED, partiendo del modelo plateado. La época (8 de 10) y el umbral de decisión se eligieron sobre el split de desarrollo de BioRED (F1 0.554). Los puntajes por época están en `relations.json`.

## Capacidades

- Extracción de relaciones biomédicas entre pares de entidades (Chemical, Disease, Gene, Variant) en texto en inglés.
- Clasificación en ocho tipos de relación de BioRED más la clase "ninguna".
- Procesamiento eficiente de pasajes completos: codifica el texto una vez y puntúa todos los pares de entidades de ese pasaje.
- Lectura de cuerpos de texto completo y abstracts fuera de PubMed, que PubTator 3.0 no cubre.
- Generación de aristas de grafo de conocimiento con la frase de origen conservada para verificación.
- Capacidad de fijar la revisión del modelo mediante `@<revision>` en el identificador.
- No detecta entidades por sí mismo; requiere anotación previa (por ejemplo, de PubTator 3.0).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- Capacidades multilingües: solo inglés.

## Casos de uso

- Construcción de grafos de conocimiento biomédicos: el modelo clasifica relaciones entre entidades anotadas y cada arista conserva la frase de origen, lo que permite auditar manualmente las relaciones de baja confianza antes de incorporarlas al grafo.
- Extracción de relaciones en texto completo de artículos: a diferencia de PubTator 3.0, el modelo lee cuerpos de texto completo y abstracts fuera de PubMed, ampliando la cobertura de literatura procesable.
- Investigación en vitíligo: la Vitiligo Initiative lo usa para generar aristas con menor confianza que las fuentes curadas o de registro, cargando solo relaciones con probabilidad ≥ 0,8, fuera de tablas y figuras, excluyendo afirmaciones de coadministración y aceptando "treats" solo cuando la enfermedad es vitíligo.
- Análisis de interacciones fármaco-enfermedad: el modelo clasifica relaciones de tipo Cotreatment, Drug_Interaction y Association entre químicos y enfermedades, útil para revisiones sistemáticas asistidas.
- Detección de asociaciones gen-enfermedad: con entidades de tipo Gene y Disease anotadas, el modelo identifica relaciones de Association y Correlation en la literatura, apoyando estudios de asociación.
- Enriquecimiento de bases de datos internas: integrado en pipelines que ya dispongan de anotación de entidades, el modelo añade capas de relación verificables con la frase de respaldo.
- Filtrado y priorización de literatura: al procesar grandes volúmenes de pares candidatos (hasta 821.413 en textos completos), permite priorizar qué artículos revisar manualmente según la confianza de las relaciones extraídas.
- Investigación metodológica en extracción de relaciones: sirve como referencia de un enfoque de codificación única por pasaje frente a la codificación por par, útil para comparar coste y calidad.

## Benchmarks y rendimiento

| Entrenamiento | Dev F1 | Test pair F1 | Test pair + type F1 |
|---|---|---|---|
| DeBERTa-v3-base on BioRED | 0.475 | 0.645 | 0.451 |
| BiomedBERT on BioRED | 0.499 | 0.642 | 0.459 |
| BiomedBERT on PubTator silver | 0.510 | 0.635 | 0.537 |
| BiomedBERT, silver then BioRED (este modelo) | 0.554 | 0.687 | 0.540 |

Datos adicionales de la model card:

| Benchmark | Pair F1 | Pair + type F1 |
|---|---|---|
| BioRED test (100 abstracts, anotación experta) | 0.687 | 0.540 |
| Acuerdo con PubTator 3.0 (591 abstracts de vitíligo retenidos) | 0.710 | 0.611 |

En el split de test de BioRED, la precisión pair + type es 0.559 y el recall 0.522. El modelo PubMedBERT del paper de BioRED alcanza 0.729 y 0.589 codificando cada par por separado; este modelo codifica cada pasaje una vez. En uso sobre textos completos, de 120 relaciones leídas de cuerpos de texto y verificadas a mano contra sus frases, el 68% fueron correctas. Bajo la regla de carga de la Vitiligo Initiative (probabilidad ≥ 0,8, fuera de tablas y figuras, sin coadministración, "treats" solo para vitíligo), 45 de 60 relaciones (75%) fueron correctas, y 15 de 17 cuando el vitíligo es una de las entidades del par.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 111 millones de parámetros en precisión completa (fp32) el peso ronda los 0,45 GB, y en fp16 unos 0,22 GB, a lo que hay que sumar activaciones y el clasificador de pares.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) debería poder alojar el modelo, aunque el autor no publica requisitos.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del repo (0,4 GB) y los 111M de parámetros, aunque no se confirma en la información disponible.
- Opciones de despliegue: el modelo se ejecuta a través del código propio del proyecto (`vitiligo.relations.train.load`), no mediante una clase de transformers; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles. El diseño de codificación única por pasaje está pensado para hacer práctico el procesamiento de 821.413 pares candidatos en textos completos, pero no se publican cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Test pair F1 (BioRED) | Test pair + type F1 (BioRED) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| re-cep/vitiligo-relation-extractor | 111M | no disponible | 0.687 | 0.540 | Apache-2.0 | Hugging Face |
| BiomedBERT on BioRED | 111M (base) | no disponible | 0.642 | 0.459 | MIT (BiomedBERT) | Hugging Face |
| DeBERTa-v3-base on BioRED | no disponible | no disponible | 0.645 | 0.451 | MIT | Hugging Face |
| PubMedBERT (paper BioRED, codificación por par) | no disponible | no disponible | 0.729 | 0.589 | no disponible | no disponible |

El modelo supera a las variantes de BiomedBERT y DeBERTa entrenadas solo con BioRED en F1 de par y de par + tipo, y se acerca al PubMedBERT del paper de BioRED pese a codificar cada pasaje una sola vez en lugar de cada par por separado.

## Limitaciones y advertencias

- Alrededor de una cuarta parte de las relaciones que carga en la práctica son incorrectas; cada relación debe leerse junto a la frase de la que procede.
- Las filas de tablas, los pies de figura y las listas de fármacos son fuentes frecuentes de error.
- Los datos plateados de entrenamiento provienen de la literatura de una sola enfermedad (vitíligo); la precisión en otros dominios no se ha probado más allá de BioRED.
- El modelo no detecta entidades por sí mismo; requiere anotación previa (por ejemplo, PubTator 3.0).
- Fuera de alcance: decisiones clínicas o cualquier uso en el que una relación no verificada se tome como hecho.
- Solo soporta inglés.
- No se documentan sesgos específicos más allá de los derivados de la literatura biomédica de entrenamiento.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos en la clasificación de relaciones, cuantificado en torno al 25-32% según el escenario de uso.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye sin garantías y el autor lo restringe explícitamente a usos de investigación con verificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/re-cep/vitiligo-relation-extractor
- Modelo base BiomedBERT: https://huggingface.co/microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext
- Repositorio de la Vitiligo Initiative: https://github.com/recepsirin/vitiligo-initiative
- Código de relaciones: https://github.com/recepsirin/vitiligo-initiative/tree/master/src/vitiligo/relations
- Paper de BioRED (Luo et al., Briefings in Bioinformatics, 2022): https://doi.org/10.1093/bib/bbac282
- Paper de BiomedBERT (Gu et al., ACM Transactions on Computing for Healthcare, 2021): https://doi.org/10.1145/3458754
- Paper de PubTator 3.0 (Wei et al., Nucleic Acids Research, 2024): https://doi.org/10.1093/nar/gkae235
- Paper de ATLOP (Zhou et al., AAAI, 2021): https://doi.org/10.1609/aaai.v35i16.17666
- Artículo sobre IA en diagnóstico y tratamiento del vitíligo (Wiley): https://onlinelibrary.wiley.com/doi/10.1111/sji.70076
- Artículo sobre fusión de datos multisource con IA en vitíligo (Nature Scientific Reports): https://www.nature.com/articles/s41598-024-75062-4
