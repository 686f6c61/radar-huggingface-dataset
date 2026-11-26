# dragonscale-ai/kniv-v7-xlarge-d-en

## Resumen

kniv-v7-xlarge-d-en es un encoder transformer multi-tarea en inglés desarrollado por Dragonscale (dragonscale-ai) y publicado en Hugging Face bajo licencia Apache-2.0. Se construye sobre microsoft/deberta-v3-large (538M parámetros) y se distribuye exclusivamente en formato ONNX (fp16 e int8), junto con el tokenizer, los ficheros de configuración y el paquete Python `kniv_v7` que convierte texto en resultados estructurados. Su pipeline declarado es token-classification, pero en la práctica cubre una capa lingüística completa y una capa de extracción de conocimiento.

El modelo resuelve dos problemas en una sola pasada: por un lado, ofrece análisis lingüístico denso (POS, morfología, lemas, entidades nombradas, árboles de dependencias, roles semánticos, acto de diálogo y sentimiento por oración, y correferencia); por otro, extrae hechos contra un esquema definido en tiempo de inferencia, incluyendo polaridad, modalidad, titular y tiempo de cada hecho. Esto lo hace relevante para memoria de agentes conversacionales, grafos de conocimiento, búsqueda y analítica documental, donde normalmente se encadenan varios modelos especializados.

La ventana de entrada es de hasta 512 palabras por ventana (512 subvocablos), está entrenado solo para inglés y su tamaño de repositorio es de 17,1 GB, coherente con múltiples grafos ONNX cuantizados. La versión documentada es kniv v7.1.2 (`deberta-v3-large-v7b8ev`, 2026-11-13), con iteraciones previas v7.1.1, v7.1 y v7.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder multi-tarea (base: microsoft/deberta-v3-large) |
| Parametros totales | 538M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 512 palabras por ventana (512 subvocablos) |
| Tipos de cuantizacion | fp16, int8 (ONNX) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (grafos fp16 e int8), tokenizer y configuración incluidos en el repo |

## Arquitectura y entrenamiento

El modelo es un encoder transformer multi-tarea derivado de DeBERTa-v3-large, que emplea atención desacoplada y un encoder de posiciones relativas; no se trata de un modelo generativo ni de un MoE. Sobre esa base, Dragonscale añade cabezas de predicción para tareas lingüísticas (POS, morfología, lematización, NER, parsing de dependencias, etiquetado de roles semánticos, clasificación de acto de diálogo y sentimiento, correferencia) y para extracción de conocimiento (entidades y relaciones definidas por esquema, con polaridad, modalidad, titular y tiempo asociados a cada hecho). El diseño trata a cada hablante de una conversación como una entidad, de modo que una frase como «I live in Berlin» produce el hecho `(user, lives in, Berlin)`.

La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron RLHF o DPO; el modelo es un encoder discriminativo, por lo que esas técnicas no encajan en su paradigma. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal. Lo que sí se explicita es la existencia de un modelo hermano, kniv-v7-xlarge-u-en (base UltraBERT-380M, 485M parámetros), que comparte diseño y sirve como alternativa cuando se prioriza otro equilibrio entre tareas; esta variante «d» se recomienda cuando se busca un mejor rendimiento en parsing, NER, roles semánticos y relaciones enciclopédicas. La familia incluye además estudiantes destilados: kniv-v7-tiny-en (55M, base ettin-encoder-17m), kniv-v7-small-en (76M, ettin-encoder-32m), kniv-v7-medium-en (122M, ettin-encoder-68m) y kniv-v7-large-en (221M, base ModernBERT-base).

## Capacidades

- Análisis lingüístico completo en inglés: etiquetado POS (UPOS), morfología, lematización, entidades nombradas, árboles de dependencias, roles semánticos, correferencia, acto de diálogo y sentimiento por oración.
- Extracción de entidades y relaciones contra un esquema definido en tiempo de inferencia, sin fine-tuning (zero-shot a nivel de esquema).
- Extracción de hechos con metadatos: polaridad, modalidad, titular y tiempo de cada hecho.
- Modelado de conversaciones multi-turno: cada hablante se trata como entidad, lo que permite construir memoria de agente y de conversación.
- Salida apta para grafos de conocimiento y pipelines de information extraction.
- Clasificación zero-shot de relaciones y NER zero-shot sobre tipos no vistos.
- No es un modelo generativo: no produce texto libre, no hace tool calling ni razonamiento multi-paso por sí mismo; su función es analítica y extractiva.

## Casos de uso

- Memoria de agentes conversacionales: el modelo procesa los turnos de una conversación y emite hechos del tipo `(usuario, vive en, Berlín)` con polaridad y tiempo, que se almacenan en una memoria estructurada consultable por el agente en turnos posteriores.
- Construcción de grafos de conocimiento: a partir de documentos en inglés se extraen entidades y relaciones según un esquema propio, con lo que se puebla un KG sin entrenar un extractor a medida para cada dominio.
- Búsqueda y analítica documental: el análisis de dependencias, roles semánticos y correferencia permite indexar pasajes por estructura lingüística y resolver menciones, mejorando la recuperación sobre corpus en inglés.
- Enriquecimiento de pipelines de NLP existentes: sustituye a varias herramientas encadenadas (POS, lematizador, NER, parser, SRL) por una sola pasada ONNX, lo que simplifica el despliegue y reduce la latencia agregada.
- Análisis de opinión y diálogo: la clasificación de sentimiento y acto de diálogo por oración sirve para monitorizar conversaciones de soporte, moderación o investigación cualitativa.
- Extracción zero-shot en dominios nuevos: al definir el esquema en inferencia, se pueden extraer tipos de entidad y relación no vistos durante el entrenamiento (por ejemplo, en dominios científicos o industriales) sin reentrenar.
- Preprocesado para modelos generativos: la salida estructurada (entidades, hechos, dependencias) puede alimentar a un LLM como contexto compacto y verificable, reduciendo alucinaciones en tareas posteriores.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente; `verified: false`):

| Tarea | Dataset (split) | Metrica | Valor |
|---|---|---|---|
| Part-of-speech tagging | UD English EWT (test) | UPOS accuracy | 0,982 |
| Dependency parsing | UD English EWT (test) | LAS | 0,929 |
| Named entity recognition | OntoNotes 5.0 (test) | span F1 | 0,870 |
| Semantic role labeling | PropBank EWT (test) | end-to-end argument F1 | 0,810 |
| Coreference resolution | LitBank (test) | CoNLL F1 | 0,697 |
| Document-level relation extraction | Re-DocRED (test) | F1 (gold entities) | 0,733 |
| Document-level relation extraction | Re-DocRED (test) | F1 (end to end) | 0,627 |
| Zero-shot relation classification | FewRel (15 unseen, train+validation) | macro F1, m=5 | 0,731 |
| Zero-shot NER | CrossNER (test) | span F1, media de 4 dominios | 0,533 |

No se han publicado en la información disponible resultados de benchmarks comparativos con otros modelos de la misma categoría.

## Requisitos de hardware

- El repositorio ocupa 17,1 GB e incluye varios grafos ONNX (fp16 e int8); el espacio en disco necesario depende de qué variantes se descarguen.
- VRAM estimada para inferencia: con 538M parámetros, en fp16 el peso ronda 1,1 GB y en int8 unos 0,55 GB; a ello hay que sumar activaciones y buffers de runtime, por lo que un presupuesto de 2-4 GB de VRAM es razonable para lotes pequeños en fp16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 en lotes pequeños; A100, H100, L40S o RTX 4090 para mayor throughput y lotes grandes.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070, RTX 4080 y RTX 4090, especialmente con la variante int8.
- Opciones de despliegue: ONNX Runtime (dependencia declarada por el autor), con soporte de ejecución en CPU y GPU; el paquete `kniv_v7` incluido en el repo gestiona el preprocesado y la orquestación. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama (no aplicables a un encoder ONNX de este tipo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kniv-v7-xlarge-d-en | 538M | 512 subvocablos | Encoder multi-tarea ONNX (lingüística + extracción de conocimiento) | Apache-2.0 | Hugging Face (ONNX) |
| kniv-v7-xlarge-u-en | 485M | 512 subvocablos (declarado en su ficha) | Mismo diseño, base UltraBERT-380M; mejor en otras tareas | Apache-2.0 | Hugging Face |
| kniv-v7-large-en | 221M | no disponible | Estudiante destilado, base ModernBERT-base | Apache-2.0 | Hugging Face |
| microsoft/deberta-v3-large | 435M (aprox., según ficha del modelo base) | 512 subvocablos | Encoder base, sin cabezas multi-tarea | MIT | Hugging Face |

La comparación con alternativas de propósito general (por ejemplo, pipelines de spaCy o Stanford Stanza) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: el modelo no soporta otros idiomas, y su uso fuera del inglés queda explícitamente fuera de alcance.
- Ventana de 512 subvocablos: los documentos largos deben trocearse en ventanas, lo que puede romper la correferencia y las relaciones a nivel de documento.
- Riesgo de alucinación y de extracción incorrecta: al ser un extractor, puede generar entidades o hechos espurios; el autor recomienda revisión humana en dominios sensibles (médico, legal, financiero o decisiones laborales sobre personas).
- Rendimiento zero-shot limitado: el span F1 medio en CrossNER es 0,533, sensiblemente inferior al rendimiento supervisado, por lo que los esquemas nuevos requieren validación.
- Correferencia moderada: CoNLL F1 de 0,697 en LitBank indica margen de error apreciable en textos largos o literarios.
- Uso comercial permitido por Apache-2.0, pero con las obligaciones habituales de la licencia (atribución y aviso de cambios); no se documentan restricciones adicionales.
- Prohibición de perfilado de individuos sin consentimiento, según la model card.
- Los benchmarks están declarados por el autor y marcados como no verificados; no deben tomarse como resultados auditados.
- El despliegue requiere ONNX Runtime y el paquete `kniv_v7` incluido en el repositorio; no hay integración documentada con servidores de inferencia estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dragonscale-ai/kniv-v7-xlarge-d-en
- Modelo hermano: https://huggingface.co/dragonscale-ai/kniv-v7-xlarge-u-en
- Guía comparativa (GUIDE.md): https://huggingface.co/dragonscale-ai/kniv-v7-xlarge-d-en/blob/main/GUIDE.md
- Modelo base: https://huggingface.co/microsoft/deberta-v3-large
- kniv-v7-tiny-en: https://huggingface.co/dragonscale-ai/kniv-v7-tiny-en
- kniv-v7-small-en: https://huggingface.co/dragonscale-ai/kniv-v7-small-en
- kniv-v7-medium-en: https://huggingface.co/dragonscale-ai/kniv-v7-medium-en
- kniv-v7-large-en: https://huggingface.co/dragonscale-ai/kniv-v7-large-en
- Organización en Hugging Face: https://huggingface.co/dragonscale-ai
