# mradermacher/nandi-grievance-indic-GGUF

## Resumen

nandi-grievance-indic-GGUF es la versión cuantizada en formato GGUF del modelo LatentAILabs/nandi-grievance-indic, un clasificador de texto especializado en la clasificación de quejas y reclamaciones (grievance redressal) en el contexto del mercado indio. El modelo original lo desarrolla LatentAILabs y esta versión ha sido generada por mradermacher, un conocido autor de cuantizaciones GGUF en Hugging Face. Con 558.838.784 parámetros (aproximadamente 559 millones), se trata de un modelo encoder de tamaño medio, presumiblemente basado en la familia XLM-RoBERTa según las etiquetas de la model card, lo que explica su naturaleza multilingüe.

El problema que resuelve es concreto: la clasificación automática de reclamaciones de clientes en sectores regulados de la India (banca, seguros, telecomunicaciones), incluyendo la detección de urgencia y el enrutamiento de tickets hacia el departamento adecuado. El modelo está diseñado para manejar texto en lenguas índicas y en formato code-mixed (hinglish), un escenario muy habitual en la atención al cliente real en el subcontinente. Las etiquetas mencionan marcos regulatorios como RBI (Reserve Bank of India), IRDAI (seguros) y CPGRAMS (portal de quejas del gobierno).

La relevancia actual radica en que cubre un nicho poco atendido por los modelos generalistas: clasificación de quejas multilingüe en dominios regulados indios, con licencia Apache 2.0 y disponibilidad en cuantizaciones que van desde 0,4 GB (Q2_K) hasta 1,2 GB (f16), lo que permite desplegarlo en infraestructura modesta. Al ser un modelo de clasificación y no generativo, su coste de inferencia es muy inferior al de un LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (presumiblemente XLM-RoBERTa, según etiquetas; no confirmado en la información disponible) |
| Parametros totales | 558.838.784 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | hi, en, bn, ta, te, mr, gu, kn, ml, pa, ur, or, multilingual (hindi, inglés, bengalí, tamil, telugu, maratí, guyaratí, canarés, malabar, panyabí, urdu, odia) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base original presumiblemente en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de las etiquetas de la model card, que apuntan a XLM-RoBERTa como familia base. El recuento de 558,8 millones de parámetros es coherente con un encoder XLM-R de tamaño base/large y con la tarea de clasificación de texto. No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset, aunque se indica que se entrenó sobre el dataset LatentAILabs/nandi-grievance-synthetic, de naturaleza sintética y orientado a quejas en dominios regulados indios.

No hay información sobre si se aplicaron técnicas de RLHF, DPO u otras fases de alineación; en un modelo de clasificación esto es poco habitual y probablemente no aplica. Tampoco se documentan innovaciones técnicas específicas como atención lineal o decodificación especulativa. La aportación principal del modelo es el dominio de especialización (quejas reguladas indias, code-mixed, multilingüe) más que una innovación arquitectónica.

## Capacidades

- Clasificación de quejas y reclamaciones (complaint-classification) en dominios de banca, seguros y telecomunicaciones.
- Detección de urgencia (urgency-detection) en el texto de la reclamación.
- Enrutamiento de tickets (ticket-routing) hacia el departamento o categoría correspondiente.
- Procesamiento multilingüe en 12 lenguas índicas más inglés y texto multilingüe.
- Manejo de texto code-mixed, en particular hinglish (hindi escrito con alfabeto latino y mezclado con inglés).
- Extracción de características (feature-extraction), según las etiquetas del repositorio.
- No es un modelo generativo: no produce texto libre ni soporta tool calling ni razonamiento multi-step.

## Casos de uso

- Enrutamiento automático de reclamaciones bancarias: el modelo clasifica el texto de la queja entrante y la asigna a la categoría correcta (tarjetas, préstamos, fraude, etc.), reduciendo la carga manual en mesas de atención al cliente.
- Detección de urgencia en seguros: permite priorizar reclamaciones que contienen indicadores de urgencia (siniestros graves, plazos regulatorios) para que se atiendan antes.
- Cumplimiento regulatorio en telecomunicaciones: clasificación de quejas conforme a las categorías exigidas por organismos reguladores indios, facilitando la generación de informes periódicos.
- Atención al cliente en lenguas índicas: al soportar hindi, bengalí, tamil, telugu y otras, permite procesar reclamaciones de usuarios que escriben en su lengua materna sin traducción previa.
- Procesamiento de hinglish en canales informales: clasificación de mensajes de chat o redes sociales donde el usuario mezcla hindi e inglés, un escenario frecuente en la India urbana.
- Triaje en portales de quejas gubernamentales (CPGRAMS): categorización de reclamaciones ciudadanas para dirigirlas al ministerio u organismo competente.
- Análisis de volumen de quejas: agregación y etiquetado masivo de reclamaciones históricas para detectar patrones por producto, región o tipo de incidencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,5 GB y 1,5 GB según cuantización (Q4_K_M ~0,5 GB, Q8_0 ~0,7 GB, f16 ~1,2 GB), más overhead del runtime.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior sobra para este modelo. También funciona en CPU.
- Cabe en cualquier GPU consumer, e incluso en GPUs integradas o en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama (previa importación del GGUF), y servidores compatibles con GGUF. Para el modelo original en transformers, se puede usar con la librería transformers y posiblemente con Text Embeddings Inference o pipelines de clasificación.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño (559M parámetros) se espera un throughput alto en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización | Disponibilidad |
|---|---|---|---|---|---|
| nandi-grievance-indic-GGUF | 558,8 M | No disponible | Apache 2.0 | Quejas reguladas indias, multilingüe | GGUF en HF |
| XLM-RoBERTa base (referencia) | ~278 M | 512 tokens | MIT | Multilingüe general | Safetensors, ampliamente disponible |
| Modelos de clasificación multilingüe genéricos | Variable | Variable | Variable | Genérica | Variable |

No se dispone de información sobre modelos directamente comparables en el nicho de clasificación de quejas reguladas indias; la comparativa con XLM-RoBERTa se ofrece solo como referencia de familia arquitectónica, no como benchmark de rendimiento.

## Limitaciones y advertencias

- Modelo de clasificación, no generativo: no puede redactar respuestas ni mantener conversaciones; su salida son etiquetas.
- Entrenado sobre un dataset sintético (nandi-grievance-synthetic): el rendimiento en datos reales de producción puede degradarse respecto al dominio sintético; se recomienda validar con datos propios.
- Sesgos potenciales derivados de la composición del dataset sintético y de la sobrerrepresentación de ciertos dominios (banca, seguros, telecomunicaciones).
- Riesgo de error en la clasificación de urgencia: una falsa negativa (no detectar urgencia) puede tener consecuencias operativas o regulatorias.
- Longitud de contexto no documentada: textos largos pueden truncarse; conviene verificar el límite real antes de desplegar.
- Cobertura lingüística declarada pero no validada con benchmarks públicos; el rendimiento en lenguas menos representadas (odia, panyabí, malabar) es incierto.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset sintético deben verificarse por separado si se redistribuye.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar la calidad de clasificación; se recomienda Q4_K_M o superior para producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/nandi-grievance-indic-GGUF
- Modelo base: https://huggingface.co/LatentAILabs/nandi-grievance-indic
- Dataset de entrenamiento: https://huggingface.co/datasets/LatentAILabs/nandi-grievance-synthetic
- Página de descargas del cuantizador: https://hf.tst.eu/model#nandi-grievance-indic-GGUF
- Listado de modelos de mradermacher: https://huggingface.co/mradermacher/models
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Ficha en OpenOdia: https://openodia.com/r/model/arunp0/nandi-grievance-indic
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
