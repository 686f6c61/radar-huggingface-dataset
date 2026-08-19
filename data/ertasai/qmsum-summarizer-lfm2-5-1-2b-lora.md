# ErtasAI/qmsum-summarizer-lfm2.5-1.2b-lora

## Resumen

El modelo `ErtasAI/qmsum-summarizer-lfm2.5-1.2b-lora` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por Ertas AI para la tarea de resumen de reuniones orientado a consultas (query-focused meeting summarization). Se trata de la segunda etapa de un pipeline de dos fases denominado "locate-then-summarize": un localizador cross-encoder selecciona los fragmentos más relevantes de una transcripción de reunión según una consulta, y este adaptador genera el resumen a partir únicamente de esos fragmentos. El modelo base es `LiquidAI/LFM2.5-1.2B-Instruct`, un modelo de lenguaje de 1.17B parámetros con arquitectura híbrida (convoluciones y atención grouped-query), preentrenado sobre 28 billones de tokens.

La relevancia de este modelo radica en que demuestra que un sistema de pequeño tamaño (1.2B) puede competir en métricas ROUGE con modelos frontier cuando se descompone la tarea en localización y resumen. El adaptador se entrenó con QLoRA de 4 bits sobre el conjunto de datos QMSum, con solo 11,1 millones de parámetros entrenables (0,94% del total). El repositorio incluye resultados medidos en la partición de test oficial de QMSum, así como un export cuantizado GGUF para despliegue en dispositivos de bajo consumo.

La publicación del modelo forma parte de un paper en preparación titulado *Locate-then-summarize on QMSum: training regime and architecture outweigh scale in query-focused multi-domain meeting summarization*. El adaptador está pensado para ser usado dentro del pipeline completo, no como un modelo de chat o QA general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre LFM2.5-1.2B-Instruct (modelo híbrido: 10 bloques de convolución short-range doble-gated + 6 bloques de atención grouped-query) |
| Parametros totales | 1.181.448.960 (modelo base) + 11.108.352 (adaptador entrenable) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para el modelo base; el adaptador se entrenó con secuencias de 6.144 tokens |
| Tipos de cuantizacion | bf16 (base), Q4_K_M (export GGUF del adaptador medido) |
| Idiomas soportados | Inglés (único idioma declarado) |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | safetensors (adaptador LoRA), GGUF (export cuantizado) |

## Arquitectura y entrenamiento

El adaptador se aplica al modelo base `LiquidAI/LFM2.5-1.2B-Instruct`, que presenta una arquitectura híbrida con 16 capas: 10 bloques de convolución short-range doble-gated y 6 bloques de atención grouped-query. El modelo base fue preentrenado sobre 28 billones de tokens y posteriormente refinado con un pipeline de aprendizaje por refuerzo multi-etapa a gran escala. El adaptador LoRA se entrenó con QLoRA de 4 bits, con rango r=16, alpha=32, dropout de 0.05, aplicado a todas las capas lineales, y una tasa de aprendizaje de 2e-4.

Los datos de entrenamiento consisten en 1.095 objetivos de spans dorados (gold-span targets) extraídos de QMSum, limitados a las consultas específicas del conjunto. Se entrenó durante 3 épocas, con 207 pasos de optimizador, tamaño de lote efectivo de 16 y longitud de secuencia de 6.144 tokens. El entrenamiento se realizó en una única NVIDIA RTX 5070 Ti de 16 GB, con aproximadamente 5,5 horas de GPU para esta etapa. El adaptador resultante tiene un tamaño de descarga de 44,46 MB (49,30 MB con los archivos de tokenizer).

## Capacidades

- Resumen de reuniones orientado a consultas: dado un conjunto de fragmentos de transcripción y una pregunta sobre la reunión, genera un resumen breve y fundamentado.
- Generación de texto condicionada: el adaptador está entrenado para producir respuestas a partir de spans recuperados, no de transcripciones completas.
- Integración en pipeline de dos etapas: funciona como componente de resumen tras un localizador cross-encoder que selecciona los fragmentos relevantes.
- Soporte de cuantización GGUF: el export Q4_K_M permite inferencia en dispositivos con recursos limitados, con una pérdida de rendimiento medida de 1,04 puntos de ROUGE-1.
- No soporta tool calling, ni razonamiento multi-paso, ni capacidades multimodales.
- Multilingüismo: solo inglés, sin evidencia de capacidades en otros idiomas.

## Casos de uso

- Resumen de actas de reuniones corporativas: el pipeline localiza los pasajes relevantes a una pregunta concreta (por ejemplo, "¿qué decisiones se tomaron sobre el presupuesto?") y el adaptador genera un resumen conciso, reduciendo el tiempo de revisión de transcripciones largas.
- Extracción de acuerdos en reuniones técnicas: un equipo de desarrollo puede consultar "¿cuáles fueron los acuerdos sobre la arquitectura del backend?" y obtener una respuesta sintetizada a partir de los fragmentos más relevantes.
- Generación de minutas ejecutivas: tras una reunión de dirección, el sistema produce un resumen orientado a la consulta "¿qué acciones se asignaron a cada departamento?", facilitando la distribución de tareas.
- Resumen de llamadas de soporte al cliente: integrado en un sistema de transcripción, permite responder a preguntas como "¿qué problema reportó el cliente y qué solución se propuso?".
- Análisis de reuniones de investigación: para grupos académicos, el modelo resume discusiones sobre resultados experimentales a partir de consultas específicas, ayudando a documentar conclusiones.
- Integración en pipelines de transcripción en tiempo real: con el export GGUF cuantizado, el adaptador puede ejecutarse en dispositivos edge o en servidores de baja potencia, ofreciendo resúmenes con una latencia de 0,39 s por consulta (medida en una sola ejecución).
- Revisión de reuniones de juntas directivas: el sistema permite a los asistentes legales o administrativos extraer rápidamente los puntos clave sobre temas como "riesgos legales mencionados" o "aprobaciones de inversión".

## Benchmarks y rendimiento

Los resultados se obtuvieron sobre la partición de test oficial de QMSum (n=281), con decodificación greedy, un único scorer congelado y una sola ejecución de test por configuración. El adaptador es el mismo en ambas filas; difieren el localizador y el presupuesto de recuperación. Las métricas se calcularon con `rouge-score==0.1.2` (f-measure, Porter stemming) y `bert-score==0.3.13` con roberta-large. Los autores advierten que estos números no son comparables con los publicados en la literatura de QMSum debido a diferencias en la implementación de ROUGE.

| Configuracion | Localizador | Presupuesto | R1 | R2 | R-L | R-Lsum | BERTScore |
|---|---|---|---|---|---|---|---|
| Protocol-exact | MiniLM L6, ventanas de 900 palabras (22,7M) | 3.000 palabras | 33,39 | 10,65 | 22,83 | 29,30 | 0,8680 |
| Deviating, promoted | MiniLM L12, ventanas de 375 palabras (33M) | 2.000 palabras | 35,41 | 12,28 | 24,63 | 31,36 | 0,8733 |

Además, se midió el impacto de la cuantización GGUF Q4_K_M sobre el rendimiento en validación:

| Pipeline | ROUGE-1 |
|---|---|
| bf16 | 35,39 |
| Q4_K_M | 34,35 |
| Diferencia | -1,04 (IC 95% [-1,98, -0,11]) |

La latencia end-to-end medida fue de 2,629 s por consulta en configuración protocol-exact (de los cuales 0,022 s corresponden al localizador). En el export cuantizado, la latencia por consulta fue de 0,39 s (una sola ejecución, valor indicativo).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1,2B en bf16 requiere aproximadamente 2,5-3 GB de VRAM; el adaptador añade menos de 50 MB. Con cuantización Q4_K_M, el requisito baja a aproximadamente 1-1,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en bf16 (por ejemplo, RTX 3050, RTX 4060, Apple Silicon con Metal). Para entrenamiento se usó una RTX 5070 Ti de 16 GB.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs consumer de gama media y baja, incluso en configuraciones cuantizadas para dispositivos edge.
- Opciones de despliegue: transformers con PEFT (carga del adaptador sobre el modelo base), llama.cpp con GGUF (export cuantizado), y potencialmente vLLM o TGI si se fusiona el adaptador en el modelo base.
- Latencia y throughput: 2,6 s por consulta en bf16 end-to-end; 0,39 s por consulta en GGUF Q4_K_M (mediciones indicativas de una sola ejecución).

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de resumen de reuniones en la información proporcionada. El paper en preparación afirma que el pipeline con este adaptador compite en ROUGE con modelos frontier, pero no se incluyen cifras concretas de dichos modelos. Como referencia cualitativa:

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| ErtasAI/qmsum-summarizer-lfm2.5-1.2b-lora | 1,2B (base) + 11M (adaptador) | 6.144 tokens de entrenamiento | Resumen de reuniones con consulta (pipeline localizar-resumir) | LFM Open License v1.0 |
| LiquidAI/LFM2.5-1.2B-Instruct (base sin adaptar) | 1,2B | No disponible | Chat/instrucciones generales | LFM Open License v1.0 |
| Modelos frontier (GPT-4, Claude, etc.) | >100B | >100K | Resumen general | Propietaria |

La comparación con el modelo base sin adaptar no está disponible en los datos publicados. La comparativa con otros adaptadores LoRA para QMSum no se ha documentado en la información proporcionada.

## Limitaciones y advertencias

- No evaluado para chat general, QA factual ni usos críticos de seguridad: el modelo fue entrenado exclusivamente para resumen de reuniones con consulta y solo se evaluó en QMSum.
- Fidelidad no medida: las métricas reportadas (ROUGE, BERTScore) son de solapamiento de tokens y similitud de embeddings, no verifican si el resumen contiene afirmaciones no presentes en la reunión. El autor indica que un trabajo paralelo evalúa la fidelidad proposicional, pero no se incluye en esta release.
- Dependencia del localizador: el adaptador espera recibir spans recuperados; si se le pasa una transcripción completa, el rendimiento puede degradarse significativamente.
- Riesgo de alucinación: al ser un modelo generativo, puede producir contenido plausible pero incorrecto, especialmente si los spans de entrada son ambiguos o incompletos.
- Idioma: solo inglés; no se ha evaluado en otros idiomas.
- Licencia LFM Open License v1.0: es una licencia de código abierto con condiciones específicas; se debe revisar el texto completo para verificar restricciones de uso comercial y redistribución.
- Robustez de los resultados: los autores advierten que la diferencia entre las dos configuraciones de localizador no es robusta al cambio de semilla de entrenamiento; el rango de variación por semilla es de 1,59 puntos de ROUGE-1.
- Cuantización: el export Q4_K_M introduce una pérdida de rendimiento real (IC 95% que excluye cero); se recomienda citar el valor cuantizado (34,35) para cualquier afirmación sobre despliegue on-device.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/ErtasAI/qmsum-summarizer-lfm2.5-1.2b-lora
- Localizador (configuración promovida): https://huggingface.co/ErtasAI/qmsum-locator-minilm-l12-w375
- Localizador (configuración protocol-exact): https://huggingface.co/ErtasAI/qmsum-locator-minilm-l6-w900
- Código, protocolo y predicciones por consulta: https://github.com/ErtasAI/qmsum-retrieved-span-training
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Página del modelo base en Ertas AI: https://www.ertas.ai/models/lfm2-5-1-2b
- Paper (en preparación): *Locate-then-summarize on QMSum: training regime and architecture outweigh scale in query-focused multi-domain meeting summarization* (Ertas AI)
