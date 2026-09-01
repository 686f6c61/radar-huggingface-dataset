# mariusweiss/TaxBERT

## Resumen

TaxBERT es un modelo de lenguaje especializado en el dominio fiscal, desarrollado por un equipo de investigadores (Hechtner, Schmidt, Seebeck y Weiß) para el análisis de divulgaciones fiscales corporativas de carácter cualitativo. Se basa en la arquitectura RoBERTa, un transformer encoder-only, y ha sido adaptado mediante entrenamiento continuo sobre textos del ámbito tributario y contable. Con 82,35 millones de parámetros, es un modelo compacto diseñado para tareas de clasificación y análisis de texto, no para generación de lenguaje.

Su relevancia radica en que ofrece una alternativa especializada a los modelos generales y a otros modelos financieros como FinBERT para tareas que requieren una comprensión fina de la terminología fiscal y de los matices contextuales propios de los informes corporativos. El estudio que lo acompaña demuestra que, aunque para tareas de clasificación sencillas no supera significativamente a los modelos generales, sí aporta ventajas claras cuando la tarea exige un conocimiento profundo del lenguaje fiscal. Se distribuye bajo licencia MIT, lo que facilita su uso comercial y académico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (transformer encoder-only) |
| Parametros totales | 82.350.916 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

TaxBERT es un modelo basado en RoBERTa, una arquitectura transformer encoder-only que procesa el texto de entrada y produce representaciones contextuales, sin capacidad de generacion autoregresiva. El modelo ha sido adaptado al dominio fiscal mediante un proceso de domain adaptation, es decir, un entrenamiento continuo sobre corpus especializados en contabilidad, impuestos y divulgaciones corporativas. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de tecnicas como RLHF o DPO, ya que no se especifican en la documentacion publicada.

La principal innovacion de TaxBERT no reside en su arquitectura, sino en su especializacion: al estar entrenado con textos fiscales reales, captura mejor el vocabulario tecnico, las expresiones idiomaticas y los matices contextuales de este dominio. El modelo se complementa con dos variantes adicionales publicadas por el mismo autor: TaxBERT-Sentence-Classification, para el reconocimiento de oraciones fiscales, y TaxBERT-Tax-Risk-Sentiment, para el analisis de sentimiento de riesgo fiscal.

## Capacidades

- Clasificacion de texto especializado en el dominio fiscal y contable.
- Analisis de divulgaciones fiscales cualitativas en informes corporativos.
- Reconocimiento de oraciones relacionadas con impuestos en documentos extensos (mediante el modelo complementario TaxBERT-Sentence-Classification).
- Analisis de sentimiento de riesgo fiscal en textos corporativos (mediante el modelo complementario TaxBERT-Tax-Risk-Sentiment).
- Procesamiento de textos en ingles, con vocabulario especifico del ambito tributario.
- No es un modelo generativo: no produce texto nuevo, solo representaciones y clasificaciones.
- No soporta tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Analisis de informes anuales de empresas cotizadas: TaxBERT puede clasificar automaticamente los parrafos que contienen divulgaciones fiscales, facilitando la extraccion de informacion relevante para analistas e investigadores.
- Investigacion empirica en contabilidad y fiscalidad: el modelo permite procesar grandes volumenes de textos corporativos (memorias, informes de auditoria, notas a los estados financieros) para construir bases de datos etiquetadas sobre practicas fiscales.
- Deteccion de oraciones fiscales en documentos legales y corporativos: mediante la variante de clasificacion de oraciones, se pueden identificar fragmentos especificos que mencionan impuestos, util para sistemas de gestion documental.
- Analisis de sentimiento de riesgo fiscal: la variante de sentimiento permite evaluar si una empresa comunica una mayor o menor exposicion a riesgos fiscales, informacion util para la valoracion de riesgos en auditoria y compliance.
- Automatizacion de procesos de revision de cumplimiento fiscal: el modelo puede pre-clasificar documentos para que los revisores humanos se centren en los casos mas relevantes, reduciendo el tiempo de analisis.
- Soporte a analistas financieros y de riesgos: TaxBERT ayuda a evaluar la posicion fiscal de una empresa a partir de sus comunicaciones publicas, complementando los analisis cuantitativos con informacion cualitativa estructurada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper asociado (SSRN 5146523) menciona que el modelo ofrece ventajas significativas en tareas que requieren una comprension fina de terminologia especializada, pero no se incluyen metricas concretas (MMLU, HumanEval, etc.) en la documentacion publica del repositorio.

## Requisitos de hardware

- Al tratarse de un modelo de 82 millones de parametros, es ligero y puede ejecutarse en CPU sin problemas para tareas de clasificacion por lotes.
- En GPU, cualquier tarjeta con 4 GB de VRAM o menos es suficiente. Una estimacion orientativa del consumo en memoria seria de aproximadamente 330 MB en precision fp32 y unos 165 MB en fp16, aunque estos valores no estan confirmados oficialmente.
- Es compatible con las principales librerias de transformers de Hugging Face (transformers, sentence-transformers) y puede desplegarse en entornos de produccion con herramientas como FastAPI o TorchServe.
- No requiere hardware especializado; es viable en entornos de desarrollo locales y en instancias cloud de baja gama.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| TaxBERT | 82,35 M | No disponible | MIT | Fiscal y contable |
| FinBERT (ProsusAI) | 110 M | 512 tokens (tipico) | Apache 2.0 | Financiero general |
| RoBERTa base | 125 M | 512 tokens (tipico) | MIT | Generico |

TaxBERT es mas pequeno que FinBERT y RoBERTa base, pero esta especificamente adaptado al dominio fiscal, lo que puede compensar su menor tamano en tareas especializadas. No se dispone de datos de rendimiento comparativo publicados. FinBERT es un modelo financiero general, mientras que TaxBERT se centra exclusivamente en el ambito tributario, lo que lo hace mas adecuado para tareas de analisis de divulgaciones fiscales.

## Limitaciones y advertencias

- El modelo solo soporta ingles, por lo que no es util para documentos en otros idiomas sin un proceso de traduccion previo.
- No es un modelo generativo: no puede redactar textos, resumir ni responder preguntas de forma libre. Solo produce clasificaciones o representaciones vectoriales.
- Al estar entrenado en un dominio especifico, puede presentar sesgos derivados del corpus de entrenamiento, especialmente si este no es representativo de todas las jurisdicciones fiscales o tipos de empresa.
- No se han publicado evaluaciones exhaustivas de sesgos o de robustez ante textos adversariales.
- Aunque la licencia MIT permite uso comercial, el modelo se distribuye sin garantias y su rendimiento en produccion debe validarse con datos propios.
- La longitud de contexto no esta documentada; si sigue el patron tipico de RoBERTa, estaria limitada a 512 tokens, lo que puede requerir estrategias de truncamiento o segmentacion para documentos largos.

## Enlaces

- Hugging Face: https://huggingface.co/mariusweiss/TaxBERT
- Paper (SSRN): https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5146523
- Repositorio GitHub: https://github.com/TaxBERT/TaxBERT
- Modelo complementario (clasificacion de oraciones): https://huggingface.co/mariusweiss/TaxBERT-Sentence-Classification
- Modelo complementario (sentimiento de riesgo fiscal): https://huggingface.co/mariusweiss/TaxBERT-Tax-Risk-Sentiment
