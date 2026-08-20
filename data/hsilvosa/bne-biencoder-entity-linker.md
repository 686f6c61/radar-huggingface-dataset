# hsilvosa/bne-biencoder-entity-linker

## Resumen

BNE-BiEncoder-Entity-Linker es un modelo de embeddings semánticos desarrollado por Hugo Silvosa Cuervo, diseñado específicamente para el enlazado de entidades y la desambiguación en recursos bibliográficos y culturales en español. Se basa en BETO (dccuchile/bert-base-spanish-wwm-cased), un BERT preentrenado con masking de palabras completas sobre corpus español, y se ajusta mediante MultipleNegativesRankingLoss sobre el dataset BNE Linked Data, que contiene 260 millones de tripletas RDF de la Biblioteca Nacional de España. El modelo produce vectores densos normalizados de 768 dimensiones que permiten buscar y desambiguar menciones de autores históricos, obras literarias y materias bibliográficas contra URIs estables de la BNE.

Relevante para el patrimonio cultural y la biblioteconomía digital, este modelo resuelve el problema de asociar menciones textuales no estructuradas a entidades de una base de conocimiento, una tarea crítica en la digitalización de catálogos y la construcción de grafos de conocimiento. Con aproximadamente 110 millones de parámetros y una arquitectura BERT base, ofrece un equilibrio entre eficiencia y precisión, alcanzando un recall@1 del 99% en el conjunto de validación del autor. Su licencia CC-BY-4.0 permite uso comercial y académico con atribución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT base (encoder bidireccional, 12 capas, 12 cabezas) |
| Parámetros totales | 109.850.880 (~110 M) |
| Parámetros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | No disponible (típica de BERT: 512 tokens) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Español (es) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Safetensors (también compatible con PyTorch) |

## Arquitectura y entrenamiento

El modelo parte de BETO, un transformer bidireccional con masking de palabras completas (whole-word masking) preentrenado sobre un corpus masivo de español. Se realiza un ajuste fino con la pérdida MultipleNegativesRankingLoss (MNRL), que optimiza la similitud coseno entre la representación de una mención textual y la de la entidad correcta, a la vez que penaliza las entidades negativas dentro del mismo batch. El conjunto de entrenamiento, `hsilvosa/bne-linked-data`, se construye a partir de 1.35 millones de enlaces de autoridad `owl:sameAs`, títulos de autoridad de la BNE y metadatos bibliográficos, lo que proporciona un gran número de pares positivos y negativos para el aprendizaje contrastivo.

La arquitectura es un encoder BERT estándar sin capas de clasificación adicionales; la salida es un vector normalizado de 768 dimensiones que se usa directamente para búsqueda vectorial y similitud coseno. No se aplican técnicas de decodificación especulativa ni atención lineal; es un modelo puramente discriminativo para generar embeddings.

## Capacidades

- Generación de embeddings de frases o menciones de entidades en español, con normalización L2 opcional.
- Enlazado de entidades (entity linking) y desambiguación: dado un texto, recupera la entidad correcta de una base de conocimiento (p. ej., URIs de la BNE).
- Búsqueda semántica en colecciones bibliográficas y culturales, utilizando similitud coseno.
- Extracción de características (feature extraction) para tareas de clasificación o agrupamiento.
- No es un modelo generativo: no produce texto, solo representaciones vectoriales.
- No soporta tool calling, agentes ni razonamiento multi-paso; está diseñado para tareas de recuperación.

## Casos de uso

- **Enriquecimiento de catálogos bibliotecarios**: asociar automáticamente menciones de autores en registros MARC a sus URIs de autoridad de la BNE, facilitando la interoperabilidad y la desambiguación de homónimos.
- **Búsqueda semántica en fondos digitalizados**: permitir consultas en lenguaje natural como «novelas de la Generación del 27» para recuperar documentos que mencionen a los autores o obras correspondientes, gracias a la representación vectorial.
- **Desambiguación de autores en publicaciones académicas**: distinguir entre autores con el mismo nombre en artículos, actas de congresos o tesis, usando las embeddings para comparar con las entidades de la BNE.
- **Construcción de grafos de conocimiento**: extraer menciones de entidades de textos históricos y enlazarlas a la base de datos de la BNE, creando un grafo de conocimiento sobre el patrimonio cultural español.
- **Recomendación de recursos bibliográficos**: a partir de la similitud de embeddings, recomendar obras o autores relacionados con un texto de interés, mejorando la experiencia en plataformas de lectura digital.
- **Normalización de metadatos en archivos**: identificar y normalizar referencias a obras y autores en colecciones digitales heterogéneas, facilitando la interoperabilidad entre sistemas.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en la tarea de desambiguación de entidades sobre el dataset `hsilvosa/bne-linked-data` (model-index oficial):

| Métrica | Valor |
|---|---|
| Recall@1 | 0.99 |
| Recall@5 | 1.00 |
| MRR | 0.9948 |

Además, en la model card se reportan valores adicionales: Recall@10 = 0.9990 y NDCG@5 = 0.9948, con ligeras variaciones en Recall@1 (0.9920) y Recall@5 (0.9970). No se han publicado comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: inferior a 1 GB en FP16 (el modelo pesa ~0.4 GB en safetensors), por lo que puede ejecutarse en GPUs de consumo.
- **GPU recomendada**: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1050 Ti, RTX 2060 o superior; también funciona en CPU.
- **Compatibilidad**: es un modelo BERT-base, por lo que corre en tarjetas como RTX 3060, RTX 4090, A100, etc., pero no exige hardware específico.
- **Opciones de despliegue**: `sentence-transformers` para inferencia en Python, exportación a ONNX para servidores ligeros, o uso de `text-embeddings-inference` (TEI) de Hugging Face para endpoints de búsqueda vectorial.
- **Latencia**: en CPU se pueden obtener decenas de consultas por segundo; en GPU, miles. No se proporcionan mediciones exactas.

## Comparativa con modelos similares

No se dispone de modelos comparables directamente entrenados para entity linking en español con la BNE. Se puede comparar con el modelo base BETO, que no está afinado para esta tarea, y con modelos multilingües como `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`, que aunque produce embeddings, no está especializado en entidades bibliográficas. La siguiente tabla ilustra las diferencias:

| Modelo | Parámetros | Contexto | Entrenado para EL | Licencia |
|--------|------------|----------|-------------------|----------|
| BNE-BiEncoder-Entity-Linker | 110 M | 512 | Sí (BNE) | CC-BY-4.0 |
| dccuchile/bert-base-spanish-wwm-cased (BETO) | 110 M | 512 | No | MIT |
| paraphrase-multilingual-MiniLM-L12-v2 | 118 M | 128 | No | Apache-2.0 |

## Limitaciones y advertencias

- **Dominio específico**: el modelo está entrenado exclusivamente con datos bibliográficos de la BNE; su rendimiento puede degradarse en textos de otros dominios (medicina, tecnología, etc.).
- **Sesgos**: al basarse en BETO y el dataset de la BNE, puede reflejar sesgos históricos o de género presentes en los documentos fuente.
- **Alucinación**: no aplica, ya que es un modelo de embeddings y no genera texto.
- **Longitud de contexto**: limitado a 512 tokens, por lo que las menciones muy largas deben ser truncadas.
- **Idioma**: solo soporta español; no está entrenado para otros idiomas.
- **Licencia**: CC-BY-4.0 permite uso comercial con atribución, pero se recomienda verificar las condiciones del dataset subyacente.
- **Dependencia de la base de conocimiento**: la precisión depende de la calidad y actualización de las URIs de la BNE; no maneja entidades fuera de esa base.

## Enlaces

- Modelo en Hugging Face: [hsilvosa/bne-biencoder-entity-linker](https://huggingface.co/hsilvosa/bne-biencoder-entity-linker)
- Dataset de entrenamiento: [hsilvosa/bne-linked-data](https://huggingface.co/datasets/hsilvosa/bne-linked-data)
- Modelo base BETO: [dccuchile/bert-base-spanish-wwm-cased](https://huggingface.co/dccuchile/bert-base-spanish-wwm-cased)
- Repositorio de referencia de bi-encoders: [facebookresearch/BLINK](https://github.com/facebookresearch/BLINK) (no es el mismo modelo, pero comparte arquitectura de bi-encoder)
