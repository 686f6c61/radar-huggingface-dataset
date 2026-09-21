# ItsnotAilabs/AlphaGenome-50M

## Resumen

AlphaGenome-50M es un modelo de embeddings de secuencia genómica y predicción del impacto de variantes, desarrollado por ItsnotAilabs y afinado (fine-tuning) a partir del modelo base InstaDeepAI/nucleotide-transformer-v2-50m-multi-species. Está especializado en el análisis de variantes no codificantes y en la clasificación de elementos reguladores cis (cCREs), y se publica como extractor de características, no como un LLM instruido: devuelve representaciones vectoriales de la secuencia de ADN de entrada.

Técnicamente es un transformer de 50 millones de parámetros con arquitectura Nucleotide Transformer v2 (familia RoFormer), 12 capas, 12 cabezas de atención y dimensión oculta de 512. La entrada se tokeniza con un esquema 6-mer sobre vocabulario BPE de nucleótidos, con una longitud máxima de contexto de 1024 tokens, lo que equivale a unos 6 kb de ADN por secuencia. La licencia es Apache 2.0 y el pipeline declarado es feature-extraction.

Su relevancia es acotada pero concreta: cubre tareas de genómica computacional (predicción de efecto de variante, clasificación de regiones reguladoras, embeddings para tareas biológicas posteriores) con un coste de inferencia mínimo, ya que el modelo completo ocupa entre 30 MB y 200 MB según precisión. El repositorio no acumula descargas ni valoraciones, y las métricas declaradas están marcadas como no verificadas y estimadas por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo RoFormer, familia Nucleotide Transformer v2 (12 capas, 12 cabezas, dimensión oculta 512) |
| Parámetros totales | 50 M |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens (tokenización 6-mer, equivalente a unos 6 kb de secuencia) |
| Tipos de cuantización | FP32, FP16, INT8 y GGUF/Q4_K_M |
| Idiomas soportados | en (según metadatos); la entrada real es cadena de ADN con caracteres A, T, C, G |
| Licencia | Apache 2.0 |
| Formato de pesos | Transformers/PyTorch (safetensors); la model card cita también ONNX y GGUF |

## Arquitectura y entrenamiento

El modelo parte de InstaDeepAI/nucleotide-transformer-v2-50m-multi-species, un transformer de 50 M de parámetros entrenado sobre genomas multi-especie. La configuración declarada consta de 12 capas, 12 cabezas de atención y dimensión oculta 512, con tokenización 6-mer apoyada en un vocabulario BPE de nucleótidos. La model card indica que la entrada debe ser una cadena pura de ADN (A, T, C, G) y que no deben insertarse tokens especiales como `<s>` o `[CLS]` de forma manual salvo que se evite el tokenizador.

No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset de afinado ni si se emplearon técnicas de alineación como RLHF o DPO. Los datasets citados en los metadatos son ensembl, clinvar y gnomad. La model card menciona capacidades añadidas al fine-tuning: puntuaciones de impacto de variante (AVI), análisis de efecto de variante única sobre ensayos RNA-seq, DNASE y ChIP, resolución de ontología de tipo tisular (UBERON/CL), escaneo de ventanas de mutagénesis por saturación y extracción de coordenadas GENCODE v46.

## Capacidades

- Extracción de embeddings de secuencias de ADN para tareas biológicas posteriores (feature-extraction).
- Predicción del impacto funcional de variantes genéticas, con especial foco en regiones no codificantes.
- Clasificación de elementos reguladores cis (cCREs).
- Análisis del efecto de variantes individuales por tipo de ensayo (RNA-seq, DNASE, ChIP).
- Puntuaciones de impacto de variante (AVI) y escaneo de mutagénesis por saturación en ventanas.
- Resolución de ontología tisular (UBERON/CL) y extracción de coordenadas GENCODE v46 según la model card.
- Tarea fill-mask declarada entre las etiquetas del repositorio.
- Soporte de tool calling / function calling: no disponible (no es un modelo instruido).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplica; el modelo opera sobre secuencias de nucleótidos, no sobre lenguaje natural.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Priorización de variantes no codificantes en estudios de asociación: el modelo permite puntuar el impacto funcional de variantes en regiones no codificantes (AUC 0,87 declarado en ClinVar Pathogenic) para ordenar candidatos antes de validación experimental.
- Anotación de elementos reguladores: clasificación de cCREs con un F1 declarado de 0,82 sobre ENCODE cCREs, útil en pipelines de anotación funcional de genomas.
- Embeddings para modelos downstream: al ser un extractor de características de 50 M de parámetros, permite congelar el encoder y entrenar cabezas ligeras (regresión, clasificación) sobre representaciones de 1024 tokens por secuencia.
- Análisis de efectos de variante por ensayo: evaluación del impacto de una variante concreta sobre señales de RNA-seq, DNASE y ChIP, y exploración mediante mutagénesis por saturación en ventanas.
- Enriquecimiento de pipelines de anotación genómica: resolución de ontología tisular (UBERON/CL) y extracción de coordenadas GENCODE v46 para enlazar regiones con tipos celulares y anotaciones de referencia.
- Despliegue en laboratorios sin GPU: con cuantización INT8 (~50 MB) o GGUF/Q4_K_M (~30 MB) y latencias declaradas de 20 ms y 15 ms por secuencia en CPU, es viable integrarlo en estaciones de trabajo convencionales.
- Agrupamiento y búsqueda por similitud de secuencias: uso de los embeddings para clustering de regiones genómicas o recuperación de secuencias similares en grandes colecciones.
- Triaje exploratorio en investigación genómica: filtrado previo de variantes de interés en cohortes, siempre como paso de investigación y nunca como decisión clínica autónoma.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (marcados como `verified: false` en la model card; la propia tabla del autor los etiqueta como estimados):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Variant Effect Prediction | ClinVar Pathogenic | AUC | 0,87 |
| Regulatory Element Classification | ENCODE cCREs | F1 | 0,82 |
| Variant Effect Correlation | Variant Effect Prediction | Spearman | 0,71 |
| Empirical Genomic Variant Impact | No especificado en la información | AUC | 0,4810 |
| Sequence Processing Throughput | No especificado en la información | seq/s | 8,93 |

No se han publicado en la información disponible resultados comparativos con otros modelos para estas mismas tareas. El valor de AUC 0,4810 en la fila "Empirical Genomic Variant Impact" es prácticamente equivalente a una clasificación aleatoria y contrasta con el 0,87 declarado en ClinVar, por lo que conviene tratarlo como una señal de cautela sobre la generalización de las métricas.

## Requisitos de hardware

- Huella de memoria de los pesos: ~200 MB en FP32, ~100 MB en FP16, ~50 MB en INT8 y ~30 MB en GGUF/Q4_K_M (cifras de la model card; no incluyen activaciones ni sobrecarga del runtime).
- Latencia declarada por secuencia en CPU: 45 ms (FP32), 30 ms (FP16), 20 ms (INT8), 15 ms (Q4_K_M).
- Latencia declarada por secuencia en GPU T4: 12 ms (FP32), 6 ms (FP16), 4 ms (INT8); para GGUF/Q4_K_M la model card indica "N/A".
- Rendimiento de procesamiento declarado: 8,93 secuencias/s (condiciones no especificadas).
- Cabe en cualquier GPU de consumo e incluso en CPU: con 30-200 MB de pesos, una RTX 4090, una RTX 3060 o un portátil sin GPU dedicada son suficientes. Aceleradores como A100 o H100 no aportan ventaja relevante para este tamaño.
- Opciones de despliegue: `transformers` (PyTorch) para inferencia estándar; ONNX citado en la model card; GGUF/Q4_K_M citado en la tabla de cuantización. No se indica soporte de vLLM, TGI, Ollama ni llama.cpp de forma explícita en la información disponible.
- Integración: el ejemplo oficial combina `transformers` con Biopython para leer ficheros FASTA y extraer el último estado oculto como embedding.

## Comparativa con modelos similares

La única comparación directa documentada en la información disponible es con el modelo base del que deriva. Para el resto de alternativas del mismo segmento (modelos de lenguaje genómico de tamaño pequeño) no se dispone de datos verificables en la información proporcionada.

| Modelo | Parámetros | Contexto | Licencia | Rendimiento declarado | Disponibilidad |
|---|---|---|---|---|---|
| AlphaGenome-50M | 50 M | 1024 tokens (6-mer) | Apache 2.0 | AUC 0,87 (ClinVar); F1 0,82 (ENCODE cCREs); Spearman 0,71 | HuggingFace (ItsnotAilabs), 0 descargas, 0 likes |
| InstaDeepAI/nucleotide-transformer-v2-50m-multi-species (base) | 50 M | No disponible en la información | No disponible en la información | No disponible en la información | HuggingFace (InstaDeepAI) |
| Otras alternativas de la misma categoría (por ejemplo, DNABERT-2 o Nucleotide Transformer v2 250M) | No disponible en la información | No disponible en la información | No disponible en la información | No disponible en la información | No disponible en la información |

## Limitaciones y advertencias

- Las métricas declaradas (AUC 0,87; F1 0,82; Spearman 0,71) están marcadas como no verificadas y como estimadas por el autor; no se aporta metodología de evaluación ni conjuntos de test independientes.
- El AUC de 0,4810 declarado para "Empirical Genomic Variant Impact" indica un rendimiento cercano al azar en esa evaluación concreta, lo que cuestiona la generalización del modelo más allá de las tareas para las que fue afinado.
- Aviso de bioseguridad explícito en la model card: las predicciones de impacto de variante son exclusivamente para investigación y no deben usarse para decisiones clínicas ni diagnósticas sin validación experimental rigurosa y revisión experta.
- Las predicciones están contextualizadas al genoma de referencia humano GRCh38; su aplicación a otras referencias o especies no está respaldada por la información disponible.
- La tokenización 6-mer degrada el rendimiento en regiones altamente repetitivas, según reconoce la propia model card.
- Longitud de contexto limitada: 1024 tokens equivalen a unos 6 kb, insuficiente para contextos genómicos largos sin ventanas deslizantes.
- Idiomas: los metadatos declaran únicamente "en"; el modelo no procesa lenguaje natural y no admite instrucciones en lenguaje natural.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la licencia del modelo base y de los datasets empleados (ensembl, clinvar, gnomad) debe verificarse por separado antes de un uso en producción.
- Incoherencia de identificación: el identificador de HuggingFace es ItsnotAilabs/AlphaGenome-50M, mientras que el README se refiere a MedinaMemorySystems/AlphaGenome-50M y el ejemplo de código usa esa misma ruta. Conviene confirmar la ruta correcta antes de integrarlo.
- Posible confusión de nombre con otros proyectos denominados AlphaGenome; esta ficha se refiere exclusivamente al modelo publicado por ItsnotAilabs.
- Sin tracción comunitaria: 0 descargas y 0 likes, sin validación independiente ni informes de terceros.
- Los metadatos de HuggingFace indican una fecha de creación (2026-09-21) incoherente con la fecha de consulta; conviene verificar la antigüedad real del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ItsnotAilabs/AlphaGenome-50M
- Modelo base: https://huggingface.co/InstaDeepAI/nucleotide-transformer-v2-50m-multi-species
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados obtenidos corresponden a páginas sin relación con el modelo). No se dispone de enlaces a papers, blogs, repositorios adicionales ni demos.
