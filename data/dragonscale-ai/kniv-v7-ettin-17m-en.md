# dragonscale-ai/kniv-v7-ettin-17m-en

## Resumen

kniv-v7-ettin-17m-en es un codificador transformer multi-tarea desarrollado por Dragonscale (dragonscale-ai) que combina una capa de análisis lingüístico completo con una capa de extracción de conocimiento guiada por esquema en tiempo de inferencia. Se construye sobre el modelo base jhu-clsp/ettin-encoder-17m (ModernBERT de 17M de parámetros) y añade cabezas de tarea hasta alcanzar 55M de parámetros totales. Es la variante más pequeña de la familia kniv v7, que incluye también kniv-v7-ultrabert-380m-en y kniv-v7-deberta-v3-large-en.

El modelo resuelve dos problemas en un único encoder: por un lado, produce análisis lingüístico denso (etiquetado POS, morfología, lemas, entidades nombradas, árboles de dependencias, roles semánticos, acto de diálogo y sentimiento por frase, y correferencia); por otro, extrae entidades y hechos según un esquema que el usuario define en inferencia, incluyendo polaridad, modalidad, portador y tiempo de cada hecho. En conversaciones, cada hablante se trata como una entidad, lo que permite obtener hechos como `(user, lives in, Lisbon)` a partir de "I moved to Lisbon".

Se distribuye en formato ONNX (fp16 e int8) con licencia Apache-2.0, únicamente para inglés y con una ventana de hasta 512 palabras (1.024 subvocablos). El autor lo publica explícitamente como *preview*: iguala a los modelos mayores en etiquetado y parsing, pero queda por debajo de sus objetivos de calidad en NER, roles semánticos, correferencia, relaciones y tipos de entidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder multi-tarea (ModernBERT) con cabezas de tarea |
| Parámetros totales | 55M (17M del encoder base + cabezas) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 512 palabras por ventana (1.024 subvocablos) |
| Tipos de cuantización | fp16, int8 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (con tokenizer y paquete Python `kniv_v7` incluidos en el repo) |

## Arquitectura y entrenamiento

El modelo es un codificador transformer multi-tarea basado en jhu-clsp/ettin-encoder-17m, un encoder de la familia ModernBERT de 17M de parámetros. Sobre ese tronco se añaden cabezas de token-classification y text-classification que comparten representaciones y producen simultáneamente las salidas de la capa lingüística (POS, morfología, lemas, NER, dependencias, roles semánticos, acto de diálogo, sentimiento, correferencia) y de la capa de conocimiento (entidades y hechos según esquema, con polaridad, modalidad, portador y tiempo).

El identificador interno de la versión es `ettin-17m-s-s30-coref` (2026-11-01). El autor lo describe como el estudiante destilado más pequeño de los dos modelos kniv v7 mayores (ultrabert-380m y deberta-v3-large), con las mismas salidas, grafos y runtime que estos. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La extracción de conocimiento es zero-shot respecto al esquema: las relaciones y tipos de entidad se especifican en inferencia mediante nombre y descripción opcional, sin fine-tuning.

## Capacidades

- Análisis lingüístico completo en inglés: part-of-speech tagging, morfología, lematización, entidades nombradas, árboles de dependencias, roles semánticos, correferencia, acto de diálogo y sentimiento por frase.
- Extracción de entidades y hechos guiada por esquema definido en tiempo de inferencia (zero-shot), con polaridad, modalidad, portador y tiempo por hecho.
- Extracción de relaciones a nivel de documento y clasificación de relaciones zero-shot.
- Tratamiento de hablantes como entidades en conversaciones, lo que habilita memoria de agente y de conversación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad generativa; el modelo es un encoder de extracción, no un generador.
- Capacidades multilingües: limitadas a inglés.
- Capacidades especiales: modo de extracción zero-shot contra esquema, orientado a grafos de conocimiento y memoria conversacional.

## Casos de uso

- Memoria de agente conversacional: el modelo procesa los turnos (`turns`) y extrae hechos por hablante, de modo que un agente puede persistir y recuperar información como `(user, lives in, Lisbon)` sin definir un esquema cerrado de antemano.
- Construcción de grafos de conocimiento: a partir de documentos en inglés, extrae entidades y relaciones con polaridad, modalidad, portador y tiempo, lo que permite poblar un KG con hechos matizados (por ejemplo, distinguir una afirmación de una hipótesis).
- Búsqueda y analítica documental: el análisis lingüístico denso (POS, lemas, dependencias, NER) alimenta índices y pipelines de búsqueda semántica o sintáctica sobre corpus en inglés.
- Anonimización y preprocesado de PII: la detección de entidades nombradas y correferencia permite localizar y resolver menciones a personas u organizaciones antes de almacenar o compartir texto.
- Enriquecimiento de transcripciones y actas: la clasificación de acto de diálogo y sentimiento por frase, junto con la extracción de hechos, permite resumir reuniones y conversaciones en forma estructurada.
- Etiquetado lingüístico a gran escala: al ser un modelo de 55M de parámetros en ONNX fp16/int8, puede ejecutarse en CPU para anotar corpus masivos con POS, lemas y dependencias sin coste de GPU.
- Extracción de relaciones en dominios con esquema variable: la clasificación zero-shot de relaciones (FewRel con 15 relaciones no vistas) permite adaptar el pipeline a nuevos dominios sin reentrenar.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Part-of-speech tagging | UD English EWT (test) | UPOS accuracy | 0,968 |
| Dependency parsing | UD English EWT (test) | LAS | 0,904 |
| Named entity recognition | OntoNotes 5.0 (test) | span F1 | 0,818 |
| Semantic role labeling | PropBank EWT (test) | end-to-end argument F1 | 0,754 |
| Coreference resolution | LitBank (test) | CoNLL F1 | 0,601 |
| Document-level relation extraction | Re-DocRED (test) | F1 (entidades gold) | 0,644 |
| Document-level relation extraction | Re-DocRED (test) | F1 (end-to-end) | 0,543 |
| Zero-shot relation classification | FewRel (15 no vistas, train+validation) | macro F1, m=5 | 0,773 |
| Zero-shot named entity recognition | CrossNER (test) | span F1, media de 4 dominios | 0,434 |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 55M de parámetros, el modelo en fp16 ocupa del orden de 110 MB de pesos y en int8 alrededor de 55 MB, más el overhead de activaciones y del runtime ONNX.
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100 ni H100. Una RTX 4090 o incluso GPUs de gama baja lo ejecutan con holgura.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en iGPU.
- Opciones de despliegue: ONNX Runtime (dependencia declarada), con el paquete `kniv_v7` incluido en el repositorio; también `huggingface_hub` para descarga. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un encoder de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Notas |
|---|---|---|---|---|---|
| kniv-v7-ettin-17m-en | 55M (17M encoder) | 512 palabras / 1.024 subvocablos | Encoder multi-tarea + extracción zero-shot | Apache-2.0 | Preview; más débil en NER, SRL, correferencia y relaciones |
| kniv-v7-modernbert-base-en | No disponible | No disponible | Misma familia kniv v7 | No disponible | Recomendado por el autor para mejor calidad a tamaño moderado |
| kniv-v7-ultrabert-380m-en | No disponible (380M según nombre) | No disponible | Misma familia kniv v7 | No disponible | Modelo mayor del que este es estudiante destilado |
| kniv-v7-deberta-v3-large-en | No disponible | No disponible | Misma familia kniv v7 | No disponible | Modelo mayor del que este es estudiante destilado |

## Limitaciones y advertencias

- El autor lo publica como *preview*: no alcanza los objetivos de calidad de la familia en NER, roles semánticos, correferencia, relaciones y tipos de entidad para su tamaño.
- Solo admite inglés; queda fuera de alcance cualquier otro idioma.
- Ventana limitada a 512 palabras (1.024 subvocablos); documentos más largos requieren ventaneo y pueden perder contexto entre ventanas.
- Riesgo de alucinación y errores en la extracción de hechos: el autor desaconseja actuar sobre hechos extraídos sin revisión en contextos médicos, legales, financieros o de decisiones laborales sobre personas.
- No debe usarse para perfilado de individuos sin su consentimiento.
- Los resultados de benchmarks son declarados por el autor y no están verificados (`verified: false`).
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar los términos del modelo base jhu-clsp/ettin-encoder-17m.
- El modelo es un encoder de extracción, no un generador de texto; no debe esperarse generación libre ni razonamiento multi-paso conversacional.
- Existe una guía (GUIDE.md) con los modos de fallo conocidos de la familia kniv v7 y cómo sortearlos en código propio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dragonscale-ai/kniv-v7-ettin-17m-en
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-17m
- Modelo mayor de la familia (ultrabert-380m): https://huggingface.co/dragonscale-ai/kniv-v7-ultrabert-380m-en
- Modelo mayor de la familia (deberta-v3-large): https://huggingface.co/dragonscale-ai/kniv-v7-deberta-v3-large-en
- Modelo recomendado a tamaño moderado: https://huggingface.co/dragonscale-ai/kniv-v7-modernbert-base-en
- Guía de modos de fallo: GUIDE.md (incluido en el repositorio del modelo)
- Organización: https://huggingface.co/dragonscale-ai
