# cea-list-ia/orthophoner

## Resumen

Orthophoner es un modelo de reconocimiento de entidades nombradas (NER) para texto biomédico y clínico en francés, desarrollado por el equipo de CEA-List (instituto francés de investigación tecnológica). Se trata de un ajuste fino de `camembert-base` orientado específicamente a entidades relevantes para la logopedia (orthophonie), combinando tipos semánticos UMLS con entidades temporales y de dosificación propias del ámbito clínico.

El modelo resuelve la tarea de token classification multi-etiqueta con esquema BILOU sobre 20 tipos de entidad (14 tipos UMLS como anatomía, trastorno, procedimiento o químico, más 6 tipos adicionales como dosis, duración, frecuencia o fecha). Con 110 millones de parámetros y una salida de 82 logits por token, está pensado para pipelines de extracción de información sobre historiales clínicos en francés.

Su relevancia actual radica en la escasez de modelos NER clínicos en francés con esquemas de anotación detallados y en la combinación poco habitual de etiquetado multi-etiqueta (un token puede recibir varias entidades simultáneamente) con BILOU, lo que permite capturar entidades solapadas o anidadas típicas de textos médicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CamemBERT (RoBERTa-base adaptado a francés) + cabeza lineal de clasificación de tokens (`CamembertForTokenClassification`) |
| Parametros totales | 110.094.418 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de camembert-base; típicamente 512 tokens, no confirmado en la información) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantización estándar de transformers) |
| Idiomas soportados | francés (`fr`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Esquema de etiquetas | BILOU sobre 20 tipos de entidad + `O` + `O-pad` (82 logits) |
| Tipo de clasificación | multi-etiqueta (sigmoid por logit, umbral 0.5) |
| Tokenizador | camembert-base (SentencePiece, fast tokenizer, case-sensitive) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura estándar de `CamembertForTokenClassification`: un encoder transformer CamemBERT (basado en RoBERTa, con vocabulario SentencePiece adaptado al francés) seguido de una capa lineal que proyecta la representación de cada token a 82 logits, uno por etiqueta. La clasificación es multi-etiqueta: la pipeline original aplica `sigmoid` a cada logit de forma independiente y umbraliza a 0.5, de modo que un mismo token puede activar varias etiquetas (por ejemplo, `B-DISO` y `U-ANAT` simultáneamente en el ejemplo de la model card).

El esquema de anotación combina 14 tipos semánticos UMLS (`ACTI`, `ANAT`, `CHEM`, `CONC`, `DEVI`, `DISO`, `GEOG`, `LIVB`, `OBJC`, `OCCU`, `ORGA`, `PHEN`, `PHYS`, `PROC`) con 6 tipos clínicos adicionales (`date`, `dose`, `duree`, `frequence`, `moment`, `valeur`). Cada tipo se desdobla en cuatro etiquetas BILOU (`B-`, `I-`, `L-`, `U-`), más `O` y `O-pad` para padding.

No se especifica en la información disponible el volumen de tokens de entrenamiento, la composición exacta del corpus, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en modelos NER). Tampoco se detalla si se usó decodificación especulativa u otras optimizaciones de inferencia.

## Capacidades

- Reconocimiento de entidades nombradas en francés clínico y biomédico con 20 tipos de entidad.
- Etiquetado multi-etiqueta: un token puede recibir simultáneamente varias etiquetas de entidad.
- Esquema BILOU que permite delimitar entidades de múltiples tokens y decodificarlas a spans de caracteres.
- Extracción de entidades temporales y de dosificación (`date`, `dose`, `duree`, `frequence`, `moment`, `valeur`), útiles en notas clínicas.
- Extracción de entidades UMLS semánticas (anatomía, trastorno, procedimiento, químico, dispositivo, organización, etc.).
- Tokenización a nivel de subpalabra con agregación a nivel de palabra (la pipeline de entrenamiento conserva la predicción del primer subword).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (es un modelo discriminativo de clasificación, no generativo).
- No soporta visión, audio ni modo thinking.
- Capacidad multilingüe limitada al francés.

## Casos de uso

- Extracción de información en historiales clínicos franceses: el modelo identifica entidades como trastornos, anatomía, procedimientos y dosis, permitiendo poblar bases de datos estructuradas a partir de notas en texto libre. Es adecuado por su especialización en el dominio y su esquema UMLS.
- Procesamiento de informes de logopedia: al estar especializado en entidades relevantes para la terapia del lenguaje, puede extraer términos anatómicos (órganos fonatorios), trastornos del habla y procedimientos terapéuticos de informes de sesión.
- Normalización de entidades temporales y de dosificación: las etiquetas `date`, `dose`, `duree`, `frequence`, `moment` y `valeur` permiten estructurar prescripciones y seguimientos temporales en notas clínicas.
- Construcción de grafos de conocimiento biomédicos: las entidades UMLS extraídas pueden enlazarse con ontologías externas (UMLS, SNOMED-CT) para enriquecer bases de conocimiento clínicas en francés.
- Anonimización asistida y preprocesado de corpus clínicos: la detección de entidades permite enmascarar o etiquetar información sensible antes de compartir datasets con fines de investigación.
- Búsqueda semántica sobre documentación médica: indexar documentos por entidades detectadas (trastorno, procedimiento, anatomía) para habilitar búsquedas facetadas en repositorios clínicos franceses.
- Investigación en NER biomédico: sirve como punto de partida para fine-tuning o evaluación en dominios específicos, tal como indica el autor en los usos previstos.
- Etiquetado de datos para entrenamiento de modelos mayores: puede usarse como anotador automático débil en pipelines de weak supervision sobre texto clínico francés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB solo para pesos (110 M de parámetros × 4 bytes), más activaciones y buffers; en la práctica, menos de 2 GB para lotes pequeños.
- En fp16/bf16: alrededor de 0,22 GB de pesos, holgadamente por debajo de 1 GB en total.
- Cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU para inferencia por lotes pequeños.
- GPU recomendadas para producción de alto throughput: A100, H100 o L4 para servir grandes volúmenes de documentos; una RTX 4090 es suficiente para la mayoría de cargas.
- Opciones de despliegue: `transformers` con PyTorch (referencia del autor), `vLLM` no aplica (modelo no generativo, aunque algunos servidores soportan clasificación), `TGI` soporta token-classification, `ONNX Runtime` y `Optimum` para exportación, y `llama.cpp`/`Ollama` no son adecuados para este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dado el tamaño, se espera procesamiento de cientos a miles de documentos por minuto en GPU moderna, pero no hay cifras confirmadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cea-list-ia/orthophoner | 110 M | no disponible | NER clínico fr, 20 tipos, multi-etiqueta BILOU | no disponible | Hugging Face |
| Dr-BERT (Stanford) | ~110 M | 512 | NER biomédico en inglés | Apache 2.0 | Hugging Face |
| PubMedBERT | ~110 M | 512 | NER biomédico en inglés | MIT | Hugging Face |
| CamemBERT-base (sin fine-tuning) | 110 M | 512 | LM enmascarado fr, requiere fine-tuning para NER | MIT | Hugging Face |

La comparación directa con modelos NER clínicos en francés es limitada: la mayoría de alternativas públicas están en inglés y no cubren el esquema UMLS+BILOU multi-etiqueta ni las entidades específicas de logopedia. Orthophoner se distingue por su esquema de 20 tipos con etiquetas temporales y de dosificación, pero su licencia no declarada limita la comparación en términos de uso comercial.

## Limitaciones y advertencias

- El modelo es multi-etiqueta: un token puede recibir varias etiquetas; el umbral de 0.5 es el usado en la pipeline original, pero puede requerir ajuste según la aplicación.
- Las predicciones son etiquetas BILOU que deben decodificarse a spans; entidades anidadas o solapadas pueden requerir post-procesado específico.
- Entrenado sobre un corpus concreto: puede no generalizar a otros dominios, géneros textuales o guías de anotación distintas.
- CamemBERT distingue mayúsculas y minúsculas; es imprescindible preservar el casing original al tokenizar.
- El modelo no es un dispositivo médico: no debe usarse para decisiones clínicas sin validación independiente (advertencia explícita del autor).
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor antes de desplegarlo en producción.
- Solo soporta francés; no hay capacidades multilingües.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos/negativos en la detección de entidades, especialmente en textos con jerga o abreviaturas no vistas en entrenamiento.
- No se han publicado métricas de rendimiento (F1, precisión, recall) en la información disponible, lo que impide estimar su calidad objetiva frente a alternativas.
- Sesgos conocidos: no documentados en la model card; al entrenarse sobre corpus clínico francés, puede reflejar sesgos demográficos o de anotación del corpus original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cea-list-ia/orthophoner
- Modelo base CamemBERT: https://huggingface.co/camembert-base
- Organización CEA-List en Hugging Face: https://huggingface.co/cea-list-ia
- Documentación de `CamembertForTokenClassification`: https://huggingface.co/docs/transformers/model_doc/camembert
- Documentación de token classification en transformers: https://huggingface.co/docs/transformers/tasks/token_classification
