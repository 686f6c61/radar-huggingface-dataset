# AAU-NLP/FLANG-SL1000

## Resumen

FLANG-SL1000 es un modelo de etiquetado de secuencias (token classification) desarrollado por el grupo AAU-NLP y afinado a partir de SALT-NLP/FLANG-BERT, un BERT de dominio financiero. Su tarea concreta es la extraccion de indicadores clave de rendimiento (KPI) en informes de resultados de la SEC estadounidense (formularios 10-K y 10-Q), mapeando cada mencion financiera a su etiqueta original de entidad iXBRL. Se trata del contrapunto basado en FLANG del modelo BERT-SL1000 dentro de la coleccion HiFi-KPI.

El modelo resuelve un problema muy especifico del procesamiento de documentos financieros: la mayoria de pipelines de extraccion de KPI dependen de las etiquetas iXBRL que las empresas incluyen en sus presentaciones, pero no todos los emisores las proporcionan de forma completa o consistente. FLANG-SL1000 aprende a predecir las 1.000 etiquetas de entidad iXBRL mas frecuentes (mas la etiqueta `O` de fuera de entidad) directamente sobre el texto, lo que permite recuperar estructura semantica alli donde el marcado nativo falta o es deficiente.

Con 109,6 millones de parametros, una ventana de entrada de 512 tokens y licencia Apache 2.0, es un modelo pequeno y ligero pensado para integrarse en pipelines de ingestion documental, no para generacion de texto. Su relevancia actual radica en que acompana al dataset HiFi-KPI y al articulo publicado en LREC 2026, ofreciendo un punto de partida reproducible para tareas de extraccion jerarquica de KPI en finanzas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (BertForTokenClassification), transformer encoder |
| Parametros totales | 109.661.417 (aproximadamente 0,11 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en F32 en el repositorio) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

FLANG-SL1000 es un transformer encoder de tipo BERT con cabeza de clasificacion token a token (BertForTokenClassification). Parte de SALT-NLP/FLANG-BERT, un modelo BERT preentrenado especificamente sobre texto financiero, y se afina sobre el dataset AAU-NLP/HiFi-KPI para predecir 1.001 etiquetas de salida: las 1.000 etiquetas de entidad iXBRL originales mas frecuentes y la etiqueta `O`. Las etiquetas se almacenan con nombres planos de entidad, sin prefijos BIO, y el mapeo exacto etiqueta-ID reside en `config.json`.

No se dispone de informacion detallada sobre el volumen de tokens de entrenamiento, la composicion exacta del corpus de afinado ni si se aplicaron tecnicas de RLHF o DPO; al tratarse de una tarea de etiquetado supervisado, el entrenamiento se basa en aprendizaje supervisado token a token sobre las anotaciones de HiFi-KPI. La innovacion principal no esta en la arquitectura, sino en el enfoque de datos: aprovechar las etiquetas iXBRL nativas de los informes SEC como supervision para reconstruir la estructura de KPI en texto plano.

## Capacidades

- Etiquetado de tokens para reconocimiento de entidades financieras (named entity recognition) en texto de informes 10-K y 10-Q.
- Prediccion de las 1.000 etiquetas de entidad iXBRL mas frecuentes del dataset HiFi-KPI, mas la etiqueta `O`.
- Mapeo de menciones financieras del texto a su etiqueta iXBRL original.
- Procesamiento de documentos financieros en ingles con ventana de 512 tokens por fragmento.
- Salida a nivel de subtoken con etiquetas, puntuaciones de confianza y offsets de caracteres.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es un modelo discriminativo de etiquetado.
- No dispone de capacidades multimodales (vision, audio) ni de modo de pensamiento (thinking mode).
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Extraccion de KPI en pipelines de ingestion de informes SEC: el modelo etiqueta menciones de ingresos, margenes, deuda y otras metricas directamente en el texto de formularios 10-K y 10-Q, permitiendo construir series temporales de KPI sin depender exclusivamente del marcado iXBRL nativo.
- Normalizacion de documentos financieros no estructurados: cuando un emisor publica un informe sin iXBRL completo, FLANG-SL1000 permite recuperar las etiquetas de entidad probables y alinear el documento con el esquema contable esperado.
- Validacion y control de calidad de iXBRL: comparar las etiquetas predichas por el modelo con las etiquetas nativas del documento para detectar omisiones o errores de marcado antes de la publicacion regulatoria.
- Enriquecimiento de bases de datos financieras: procesar grandes volumenes de presentaciones para poblar un almacen de KPI etiquetados jerarquicamente, alimentando herramientas de analisis fundamental.
- Investigacion academica en NLP financiero: servir como baseline reproducible (junto con BERT-SL1000) para experimentos de extraccion de KPI y comparacion de modelos de dominio financiero frente a BERT generico.
- Preprocesamiento para modelos de razonamiento financiero: usar las etiquetas predichas como señal de estructura para alimentar etapas posteriores de extraccion de valores, fechas y monedas, que este checkpoint no resuelve por si mismo.
- Deteccion de menciones de KPI en noticias y comunicados de resultados: aunque entrenado con informes SEC, el etiquetado de entidades financieras puede aplicarse a textos de resultados en ingles con la debida validacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en F32 (109,6 M de parametros), inferior a 0,3 GB en FP16 y del orden de 0,15 GB en cuantizacion de 8 bits.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM; una NVIDIA T4, L4, RTX 3060 o superior es mas que suficiente. Para lotes grandes, una A100 o H100 permite maximizar throughput pero no es necesaria.
- Cabe holgadamente en GPU de consumo: RTX 2060, RTX 3060, RTX 4060, GTX 1660 y similares con 4-6 GB de VRAM.
- Tambien puede ejecutarse en CPU para inferencia por lotes de documentos moderados, dado su tamano reducido.
- Opciones de despliegue: transformers (pipeline de token-classification), vLLM no aplica de forma estandar para token classification, TGI con soporte limitado; alternativas habituales son ONNX Runtime, TorchScript o servicios de inferencia propios con transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; con 512 tokens de entrada y 0,11 B de parametros, la latencia por fragmento en GPU de consumo deberia situarse en el orden de milisegundos, aunque no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLANG-SL1000 | 109,6 M | 512 tokens | Token classification (KPI financiero, 1.001 etiquetas) | Apache 2.0 | Hugging Face (AAU-NLP) |
| BERT-SL1000 | no disponible | no disponible | Token classification (KPI financiero) | no disponible | Hugging Face (AAU-NLP) |
| SALT-NLP/FLANG-BERT | no disponible | no disponible | Modelo base BERT financiero (preentrenamiento) | no disponible | Hugging Face (SALT-NLP) |

La comparativa se limita a los modelos de la misma familia HiFi-KPI y al modelo base, ya que no se dispone de datos de rendimiento de alternativas comparables en la informacion proporcionada. FLANG-SL1000 se distingue por partir de un encoder de dominio financiero, mientras que BERT-SL1000 parte de un BERT generico; no se han publicado metricas comparativas entre ambos en la informacion disponible.

## Limitaciones y advertencias

- Entrenado exclusivamente en ingles; no soporta otros idiomas.
- Ventana de contexto de 512 tokens: los informes largos deben dividirse en parrafos o fragmentos, lo que puede romper menciones que cruzan fronteras de fragmento.
- El checkpoint devuelve etiquetas a nivel de token; no genera registros estructurados con valores financieros, fechas ni monedas. Cualquier extraccion de valores requiere etapas posteriores.
- Las etiquetas se predicen sin prefijos BIO, por lo que la agregacion de entidades multi-token debe gestionarse en el pipeline de postprocesado.
- Riesgo de alucinacion estructural: el modelo puede asignar etiquetas iXBRL plausibles a menciones que no corresponden a un KPI real, especialmente en texto fuera de dominio o en secciones narrativas.
- Sesgos derivados del corpus HiFi-KPI: la distribucion de etiquetas refleja las practicas de reporte de las empresas incluidas en el dataset, lo que puede penalizar a emisores con esquemas de marcado menos frecuentes.
- Uso comercial permitido bajo Apache 2.0, pero se recomienda citar el articulo de LREC 2026 y revisar los terminos del dataset HiFi-KPI para usos derivados.
- No es un modelo generativo: no debe emplearse para resumen, respuesta a preguntas ni generacion de codigo.
- Popularidad y adopcion muy bajas (21 descargas, 0 likes en el momento de la consulta), por lo que la validacion en produccion corre a cargo del integrador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AAU-NLP/FLANG-SL1000
- Dataset HiFi-KPI: https://huggingface.co/datasets/AAU-NLP/HiFi-KPI
- Articulo HiFi-KPI (LREC 2026): https://aclanthology.org/2026.lrec-1.30/
- Paper en Hugging Face: https://huggingface.co/papers/2502.15411
- Repositorio de codigo: https://github.com/aaunlp/HiFi-KPI
- Modelo base FLANG-BERT: https://huggingface.co/SALT-NLP/FLANG-BERT
- Contraparte BERT-SL1000: https://huggingface.co/AAU-NLP/BERT-SL1000
- Ficha de referencia en Free2AITools: https://free2aitools.com/model/aau-nlp/flang-sl1000
