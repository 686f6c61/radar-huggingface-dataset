# dragonscale-ai/kniv-v7-medium-en

## Resumen

kniv-v7-medium-en es un encoder multilingüe de tareas múltiples en inglés desarrollado por Dragonscale (dragonscale-ai) y publicado en noviembre de 2026. Se trata de un estudiante destilado de 122 millones de parámetros (68M en el encoder base más cabezales) construido sobre jhu-clsp/ettin-encoder-68m, un encoder de arquitectura ModernBERT. El modelo resuelve un problema concreto: proporcionar en una sola pasada una capa lingüística completa (POS, morfología, lemas, entidades, dependencias, roles semánticos, actos de diálogo, sentimiento y correferencia) y una capa de extracción de conocimiento contra un esquema definido en tiempo de inferencia, sin necesidad de fine-tuning.

Su relevancia radica en la combinación de tamaño reducido y cobertura funcional amplia: reproduce las salidas y grafos de los modelos profesores kniv-v7-xlarge-u-en (485M) y kniv-v7-xlarge-d-en (538M) con un coste computacional mucho menor, lo que lo hace apto para memoria de agentes, grafos de conocimiento y analítica documental en producción. La ventana de entrada es de hasta 512 palabras por ventana (1.024 subvocablos).

El modelo se distribuye en formato ONNX (fp16 e int8) junto con el tokenizer, la configuración y el paquete Python `kniv_v7`, lo que simplifica su despliegue sin dependencias de frameworks de entrenamiento. Está pensado exclusivamente para inglés y su licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base jhu-clsp/ettin-encoder-68m) multi-tarea con cabezales |
| Parametros totales | 122M (68M encoder + cabezales) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 512 palabras por ventana (1.024 subvocablos) |
| Tipos de cuantizacion | fp16, int8 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (repo de 2,2 GB) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, concretamente sobre el checkpoint jhu-clsp/ettin-encoder-68m, al que se añaden cabezales multi-tarea para token-classification y text-classification. La versión interna identificada es `ettin-68m-s30-coref` (2026-11-01). Se trata de un estudiante destilado de los dos profesores kniv v7: kniv-v7-xlarge-u-en (UltraBERT-380M, 485M parámetros) y kniv-v7-xlarge-d-en (deberta-v3-large, 538M parámetros). La destilación busca reproducir las mismas salidas, grafos y runtime que los modelos grandes con un coste mucho menor.

La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; estos datos no están disponibles. La model card sí menciona que el modelo forma parte de una familia escalonada (tiny 55M, small 76M, medium 122M, large 221M, xlarge 485M/538M) y que existe un documento GUIDE.md que recoge los modos de fallo conocidos de la familia y cómo sortearlos en código propio. No se documentan innovaciones como decodificación especulativa o atención lineal más allá de lo que aporta la arquitectura ModernBERT de base.

## Capacidades

- Análisis lingüístico completo: part-of-speech, morfología, lematización, entidades nombradas, árboles de dependencias, roles semánticos, actos de diálogo y sentimiento por oración, y correferencia.
- Extracción de conocimiento contra un esquema definido en inferencia: entidades de los tipos que se indiquen y hechos para las relaciones que se indiquen (nombre más descripción opcional).
- Para cada hecho extraído, el modelo produce polaridad, modalidad, titular (holder) y tiempo.
- Tratamiento de conversaciones: cada hablante se modela como una entidad, de modo que "I live in Berlin" produce la tupla `(user, lives in, Berlin)`.
- Clasificación de relaciones zero-shot (FewRel con 15 relaciones no vistas).
- Reconocimiento de entidades zero-shot en dominios no vistos (CrossNER).
- Extracción de relaciones a nivel de documento (Re-DocRED).
- No se menciona soporte de tool calling, function calling, agentes multi-paso ni modos de razonamiento explícitos; el modelo es un encoder de extracción, no un generador de texto.
- Capacidad multilingüe: no, solo inglés.

## Casos de uso

- Memoria de agentes conversacionales: el modelo convierte cada turno en hechos estructurados con hablante, polaridad, modalidad y tiempo, lo que permite mantener una memoria persistente de la conversación sin fine-tuning y con un coste de 122M parámetros por inferencia.
- Construcción de grafos de conocimiento: a partir de un esquema de entidades y relaciones definido por el usuario, el modelo extrae tripletas listas para ingerir en una base de datos de grafos, con soporte de extracción a nivel de documento (Re-DocRED).
- Analítica documental y extracción de información: procesamiento de prosa inglesa en ventanas de hasta 512 palabras para poblar pipelines de búsqueda y enriquecimiento documental con entidades, dependencias y roles semánticos.
- Análisis lingüístico para NLP downstream: generación de anotaciones POS, lemas, dependencias y SRL que alimentan sistemas de resumen, traducción asistida o análisis de estilo sin depender de pipelines separados.
- Clasificación zero-shot de relaciones y entidades: útil cuando el esquema cambia con frecuencia y no se quiere reentrenar; el modelo acepta tipos de entidad y relaciones nuevos en tiempo de inferencia (FewRel, CrossNER).
- Moderación y análisis de sentimiento por oración: la capa de sentimiento y actos de diálogo permite clasificar intervenciones en conversaciones multi-turno para sistemas de atención al cliente o análisis de feedback.
- Extracción de hechos con matices epistémicos: la salida de polaridad, modalidad y titular permite distinguir afirmaciones, negaciones, hipótesis y atribuciones de hablante, adecuada para verificación de información y análisis de discurso.
- Despliegue en entornos con recursos limitados: al distribuirse en ONNX fp16/int8 y con 122M parámetros, puede ejecutarse en CPU o GPU modesta dentro de servicios de extracción de baja latencia.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Part-of-speech tagging | UD English EWT (test) | UPOS accuracy | 0,975 |
| Dependency parsing | UD English EWT (test) | LAS | 0,919 |
| Named entity recognition | OntoNotes 5.0 (test) | span F1 | 0,835 |
| Semantic role labeling | PropBank EWT (test) | end-to-end argument F1 | 0,792 |
| Coreference resolution | LitBank (test) | CoNLL F1 | 0,642 |
| Document-level relation extraction | Re-DocRED (test) | F1 (gold entities) | 0,703 |
| Document-level relation extraction | Re-DocRED (test) | F1 (end to end) | 0,605 |
| Zero-shot relation classification | FewRel (15 unseen, train+validation) | macro F1, m=5 | 0,749 |
| Zero-shot named entity recognition | CrossNER (test) | span F1, media de 4 dominios | 0,453 |

El autor indica que el modelo está cerca de los profesores en tagging, parsing y roles semánticos, y en relaciones end-to-end (0,605 frente a 0,608 de kniv-v7-large-en, 1,8 veces su tamaño), pero es más débil en NER, correferencia y tipos de entidad.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 122M parámetros, en fp16 el peso ronda los 0,25 GB y en int8 unos 0,12 GB, más memoria de activaciones para ventanas de 1.024 subvocablos.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU consumer moderna (RTX 3060 en adelante) es suficiente, y también CPU.
- Cabe en GPU consumer: sí, con margen amplio, dado el reducido número de parámetros.
- Opciones de despliegue: ONNX Runtime (formato nativo del repo), con soporte fp16 e int8; el paquete `kniv_v7` incluido en el repositorio gestiona tokenizer, settings y grafos. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rol | Licencia | Notas |
|---|---|---|---|---|---|
| kniv-v7-tiny-en | 55M | 512 palabras | estudiante destilado | Apache-2.0 | misma familia, menor calidad |
| kniv-v7-small-en | 76M | 512 palabras | estudiante destilado | Apache-2.0 | misma familia |
| kniv-v7-medium-en (este) | 122M | 512 palabras | estudiante destilado | Apache-2.0 | equilibrio tamaño/calidad |
| kniv-v7-large-en | 221M | 512 palabras | estudiante destilado | Apache-2.0 | mejor calidad a tamaño moderado; Re-DocRED end-to-end 0,608 |
| kniv-v7-xlarge-d-en | 538M | 512 palabras | profesor (deberta-v3-large) | Apache-2.0 | referencia de calidad |
| kniv-v7-xlarge-u-en | 485M | 512 palabras | profesor (UltraBERT-380M) | Apache-2.0 | referencia de calidad |

No se dispone de comparación con modelos de otras familias en la información proporcionada; los únicos comparables documentados son los miembros de la propia familia kniv v7.

## Limitaciones y advertencias

- Solo admite inglés; cualquier otro idioma queda fuera de alcance.
- El autor reconoce debilidad relativa en NER, correferencia y tipos de entidad frente a los profesores (CrossNER span F1 medio de 0,453; LitBank CoNLL F1 de 0,642).
- Los benchmarks están declarados por el autor y marcados como no verificados; deben tomarse con cautela.
- No debe usarse para actuar sobre hechos extraídos sin revisión en contextos donde los errores importan (decisiones médicas, legales, financieras o de empleo sobre personas).
- No debe emplearse para perfilado de individuos sin consentimiento.
- Existe un documento GUIDE.md que documenta modos de fallo conocidos de la familia; es recomendable consultarlo antes de producción.
- Riesgo de alucinación en la capa de extracción: al generar hechos contra un esquema libre, pueden aparecer relaciones o entidades espurias, especialmente en dominios no vistos.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones de los datasets de evaluación citados si se redistribuyen derivados.
- No se documentan sesgos específicos; al ser un encoder entrenado sobre datos no detallados, los sesgos subyacentes no son auditables a partir de la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dragonscale-ai/kniv-v7-medium-en
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-68m
- Profesor kniv-v7-xlarge-u-en: https://huggingface.co/dragonscale-ai/kniv-v7-xlarge-u-en
- Profesor kniv-v7-xlarge-d-en: https://huggingface.co/dragonscale-ai/kniv-v7-xlarge-d-en
- kniv-v7-tiny-en: https://huggingface.co/dragonscale-ai/kniv-v7-tiny-en
- kniv-v7-small-en: https://huggingface.co/dragonscale-ai/kniv-v7-small-en
- kniv-v7-large-en: https://huggingface.co/dragonscale-ai/kniv-v7-large-en
- Guía de modos de fallo (GUIDE.md): referenciada en la model card del repositorio, no se proporciona URL directa
