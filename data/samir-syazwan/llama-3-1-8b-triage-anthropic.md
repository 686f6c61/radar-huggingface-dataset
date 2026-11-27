# Samir-syazwan/Llama-3.1-8B-triage-anthropic

## Resumen

Llama-3.1-8B-triage-anthropic es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base unsloth/Llama-3.1-8B-Instruct, desarrollado por Samir-syazwan. Su proposito es la triage automatizada de mensajes de clientes de una tienda online malasia: clasifica cada mensaje en una categoria, asigna un nivel de urgencia y determina si requiere intervencion humana, devolviendo exclusivamente un objeto JSON. Resuelve un problema concreto de enrutamiento de soporte al cliente donde el modelo base, sin ajuste, no respeta el formato de salida estructurado y falla en la clasificacion de urgencia.

El modelo hereda la arquitectura transformer densa de Llama 3.1 8B, con 8.030 millones de parametros y una ventana de contexto de 128.000 tokens en el modelo base, aunque el adaptador se entreno con una longitud maxima de secuencia de 2048 tokens. El adaptador en si es de reducido tamano (el repositorio ocupa 1,0 GB), lo que lo hace facil de distribuir y de cargar junto al modelo base cuantizado en 4 bits.

Su relevancia actual radica en que demuestra que un ajuste fino ligero (17 minutos en una unica GPU NVIDIA L4) con apenas 908 ejemplos etiquetados puede elevar la precision de formato JSON del 4% al 100% y la exactitud en las tres etiquetas simultaneas del 36% al 94% en el conjunto de evaluacion del autor. Es un caso practico de adaptacion de un LLM generalista a una tarea de clasificacion estructurada con requisitos estrictos de formato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1), adaptador LoRA sobre el modelo base |
| Parametros totales | 8.030 millones (modelo base Llama 3.1 8B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base; entrenado con max_seq_length de 2048 |
| Tipos de cuantizacion | QLoRA 4-bit para entrenamiento e inferencia (load_in_4bit=True); el modelo base admite otras cuantizaciones no especificadas |
| Idiomas soportados | en, ms (entrenado ademas con datos en mandarin, hinglish, tamil, frances y espanol) |
| Licencia | Llama 3.1 Community License (codigo del repositorio GitHub bajo MIT) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Llama 3.1 8B Instruct, un transformer denso decoder-only de Meta con 8.030 millones de parametros. El ajuste se realizo con QLoRA (cuantizacion 4-bit del modelo base) mediante Unsloth, con rango LoRA de 16, alpha de 16, tasa de aprendizaje 2e-4, 3 epocas (399 pasos), tamano de lote 8 y longitud maxima de 2048 tokens. La perdida se calculo unicamente sobre las respuestas (loss on answers only), lo que concentra el aprendizaje en el formato JSON de salida. El entrenamiento completo se ejecuto en una unica GPU NVIDIA L4 en aproximadamente 17 minutos.

Los datos de entrenamiento consisten en 908 mensajes etiquetados (1.057 lineas de entrenamiento): 207 procedentes de datos del curso y 701 redactados por el equipo. La composicion linguistica incluye ingles, malayo/manglish y mandarin, con algunas muestras en hinglish, tamil, frances y espanol. La tarea de salida es una clasificacion estructurada en tres campos: category (delivery, refund_return, product_fault, payment_billing, account_access, general_enquiry), urgency (low, medium, high) y needs_human (true, false). No se menciona el uso de RLHF ni DPO; el ajuste es supervisado sobre respuestas etiquetadas.

## Capacidades

- Clasificacion de mensajes de clientes en seis categorias predefinidas (delivery, refund_return, product_fault, payment_billing, account_access, general_enquiry).
- Asignacion de nivel de urgencia en tres niveles (low, medium, high).
- Deteccion de necesidad de intervencion humana (needs_human: true/false), con una recall del 95% en el conjunto de evaluacion.
- Generacion de salida estrictamente en formato JSON, con un 100% de cumplimiento de formato en la evaluacion del autor (frente al 4% del modelo base sin ajustar).
- Comprension multilingue limitada: entrenado principalmente en ingles y malayo/manglish, con presencia minoritaria de mandarin, hinglish, tamil, frances y espanol.
- Inferencia determinista recomendada a temperatura 0 con un system prompt especifico (system_prompt.txt).
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision ni audio.

## Casos de uso

- Triage automatizado de tickets de soporte: el modelo recibe el mensaje del cliente y devuelve un JSON con categoria, urgencia y necesidad de intervencion humana, permitiendo enrutar cada ticket al equipo adecuado sin revision manual previa.
- Priorizacion de incidencias criticas: gracias a la deteccion de urgencia alta y needs_human, los mensajes que describen incendios, fraudes o lesiones se escalan inmediatamente a un agente humano, reduciendo el tiempo de respuesta en casos de riesgo.
- Clasificacion por categoria para analitica: los campos de categoria permiten agregar volumen de tickets por tipo (entregas, devoluciones, pagos, etc.) y alimentar cuadros de mando operativos.
- Filtrado previo en colas de atencion: el modelo actua como primera capa que separa consultas generales de incidencias que requieren agente, reduciendo la carga sobre el equipo humano.
- Soporte multilingue en el sudeste asiatico: al estar entrenado con ingles, malayo/manglish y mandarin, puede procesar mensajes de clientes malasios que alternan idiomas en una misma conversacion.
- Integracion en pipelines de ticketing: al devolver JSON limpio y determinista (temperatura 0), la salida se puede parsear directamente y conectar a sistemas como Zendesk, Freshdesk o bases de datos propias sin postprocesado.
- Prototipado rapido de clasificadores estructurados: sirve como referencia de como un adaptador LoRA de bajo coste (17 minutos en una L4) puede transformar un LLM generalista en un clasificador con formato estricto.

## Benchmarks y rendimiento

Evaluacion sobre 50 casos reservados a temperatura 0, segun la model card del autor:

| Modelo | Las tres correctas | Categoria | Urgencia | Recall needs_human | Solo JSON |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct (sin ajustar) | 36% | 92% | 46% | 95% | 4% |
| Este adaptador | 94% | 100% | 94% | 95% | 100% |

Clasificacion en el leaderboard (100 casos ocultos): modelo sin ajustar 31%, este modelo 88%. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion 4-bit (load_in_4bit=True) el modelo base de 8B requiere aproximadamente 5-6 GB de VRAM, mas overhead de contexto y del adaptador; el entrenamiento se realizo en una GPU de 22,5 GB (NVIDIA L4).
- GPU recomendadas: NVIDIA L4 (usada en el entrenamiento), A100, H100 para despliegues de mayor throughput; RTX 4090 y RTX 3090 son suficientes para inferencia en 4-bit.
- Cabe en GPU de consumo: si, en tarjetas con al menos 8 GB de VRAM en cuantizacion 4-bit (por ejemplo RTX 3060 Ti, RTX 4060 Ti, RTX 3070 en adelante).
- Opciones de despliegue: la model card documenta el uso con Unsloth (FastLanguageModel). Al ser un adaptador PEFT estandar, es compatible con el ecosistema Hugging Face (transformers + peft); el despliegue con vLLM, llama.cpp, Ollama o TGI no esta documentado en la informacion disponible.
- Latencia y throughput: no disponibles. El entrenamiento completo tardo unos 17 minutos en una L4, pero no se publican metricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-triage-anthropic | 8B (adaptador LoRA) | 128.000 (base); 2048 en entrenamiento | Triage de soporte con salida JSON | Llama 3.1 Community License | Hugging Face (0 descargas) |
| Llama-3.1-8B-Instruct (base sin ajustar) | 8B | 128.000 | LLM generalista | Llama 3.1 Community License | Ampliamente disponible |
| Adaptadores de clasificacion de tickets especializados | variable | variable | Clasificacion de soporte | variable | no disponible (no se identifican alternativas concretas en la informacion) |

La comparativa directa mas relevante es con el modelo base sin ajustar: en la evaluacion del autor, el adaptador mejora la exactitud en las tres etiquetas del 36% al 94%, la categoria del 92% al 100%, la urgencia del 46% al 94% y el cumplimiento de formato JSON del 4% al 100%, manteniendo la misma recall de needs_human (95%). No se dispone de datos de otros adaptadores comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Debil en el calculo de dias entre fechas, lo que puede afectar a la clasificacion de urgencia en mensajes que dependen de plazos.
- A veces trata un primer mensaje como si fuera un contacto repetido, lo que puede distorsionar la categoria o la urgencia.
- Pocas filas de entrenamiento en algunos idiomas (hinglish, tamil, frances, espanol), por lo que el rendimiento en esos idiomas es incierto.
- Riesgo de alucinacion en la clasificacion: aunque el formato JSON es estricto, la categoria o urgencia asignada puede ser incorrecta en casos ambiguos.
- Requiere revision humana: un caso urgente no detectado (incendio, fraude, lesion) puede causar dano, segun advierte el propio autor.
- Licencia Llama 3.1 Community License: impone restricciones de uso comercial y obligaciones de atribucion; el codigo del repositorio GitHub es MIT, pero los pesos del adaptador y del modelo base quedan sujetos a la licencia de Llama 3.1.
- Entrenado con solo 908 ejemplos: la cobertura de casos limite y de dominios fuera de la tienda online malasia es limitada.
- Modelo con 0 descargas y 0 likes en Hugging Face en el momento de la consulta, sin validacion independiente por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Samir-syazwan/Llama-3.1-8B-triage-anthropic
- Repositorio GitHub (codigo, datos y write-up): https://github.com/aniqsfwn/Llama-3.1-8B-triage-anthropic
- Modelo base: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct
- Leaderboard run: 1795745604 (referenciado en la model card, sin URL directa disponible)
