# bouddah/hermes-osint-1.5b

## Resumen

Hermes OSINT 1.5B es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct, desarrollado por el usuario bouddah (Yassir Boudda). No es un modelo completo: se distribuye como adaptador PEFT en safetensors de 0,1 GB que debe cargarse sobre los pesos del modelo base. Su proposito es actuar como asistente de metodologia OSINT para retos CTF, respondiendo preferentemente en frances y explicando paso a paso pivotes de investigacion, busqueda en archivos, razonamiento de geolocalizacion e higiene OPSEC, en lugar de dar respuestas genericas sobre "hacking".

El entrenamiento se realizo sobre el dataset bouddah/osint-ctf-corpus-fr (185 write-ups de CTF OSINT en frances, mas skills de agente, bases de conocimiento y manuales de OPSEC), con 2 epocas, longitud maxima de secuencia de 512 tokens y un total de 18,5 millones de parametros entrenables (1,18 % del total) sobre una unica GPU gratuita Tesla T4 de Kaggle, con un coste declarado de 0 dolares y unos 4 minutos de ejecucion. El autor lo describe explicitamente como un adaptador de comportamiento y estilo, no como una inyeccion de conocimiento.

Es relevante ahora por dos motivos: primero, porque ejemplifica el patron de especializacion barata mediante QLoRA sobre modelos pequenos, ejecutable en hardware de consumo; segundo, porque cubre un nicho concreto (OSINT en frances) que los modelos generalistas no tratan con la metodologia adecuada. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopcion practicamente nula y un modelo muy reciente o poco difundido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5) con adaptador LoRA sobre el modelo base |
| Parametros totales | 1,5 mil millones en el modelo base; 18,5 millones entrenables en el adaptador (1,18 %) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens de longitud maxima de secuencia durante el entrenamiento; el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens nativos (dato del modelo base, no documentado en la model card) |
| Tipos de cuantizacion | Entrenamiento en 4-bit NF4 con doble cuantizacion (bitsandbytes); adaptador en safetensors fp16/fp32; convertible a GGUF (q4_K_M, q5_K_M, q8_0, etc.) tras fusionar el adaptador con el base |
| Idiomas soportados | Frances (principal) e ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere Qwen/Qwen2.5-1.5B-Instruct para la inferencia |
| Tamano del repositorio | 0,1 GB |
| Libreria | peft |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Dataset de entrenamiento | bouddah/osint-ctf-corpus-fr |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only con atencion por consultas agrupadas (GQA) y normalizacion RMSNorm. Sobre el se aplica un adaptador QLoRA con rango r=16, alpha=32 y dropout 0,05, con modulos objetivo q, k, v, o, gate, up y down proj. El entrenamiento se hizo en 4-bit NF4 con doble cuantizacion, precision fp16 (compatible con T4), learning rate 2e-4 con scheduler coseno y warmup del 5 %, batch efectivo de 16 (1 x 16 de acumulacion de gradientes) y 2 epocas. Las metricas declaradas son train_loss 2,38 y eval_loss 1,79.

El dataset consta de 185 write-ups de CTF OSINT en frances, complementados con skills de agente, bases de conocimiento y manuales de OPSEC. No se menciona uso de RLHF ni DPO, ni tampoco de decodificacion especulativa u otras optimizaciones de inferencia. La innovacion destacable no es tecnica sino de posicionamiento: demuestra que con un corpus pequeno y muy especifico, un adaptador de 18,5 millones de parametros y 4 minutos de GPU gratuita se puede condicionar el estilo y la metodologia de un modelo de 1,5B hacia un dominio vertical (OSINT en frances). Conviene subrayar que, con 2 epocas sobre aproximadamente 175 muestras y una longitud de secuencia limitada a 512 tokens, el adaptador modula el registro y la estructura de la respuesta mas que aportar conocimiento factual nuevo.

## Capacidades

- Generacion de texto conversacional en frances e ingles, con registro tecnico y metodologico.
- Explicacion paso a paso de metodologias OSINT: estrategias de pivote, busqueda en archivos y hemerotecas digitales, razonamiento de geolocalizacion.
- Recomendacion de higiene OPSEC en el contexto de investigaciones pasivas y autorizadas.
- Asistencia en retos CTF OSINT de tipo formativo (por ejemplo, el reto "Medileak 2" citado en la model card).
- Razonamiento multi-paso expresado en lenguaje natural (borradores de metodologia, no ejecucion real de herramientas).
- Capacidad multilingue limitada al par frances/ingles, con clara prioridad del frances.
- Plantilla de chat compatible con apply_chat_template de Qwen2.5 y system prompt especializado ("You are Hermes OSINT...").
- No dispone de tool calling ni function calling: el autor indica explicitamente que el modelo "no tiene acceso a herramientas".
- No dispone de vision, audio ni modo de razonamiento explicito (thinking mode).
- No debe considerarse un modelo de conocimiento: reproduce estilo y metodo del corpus.

## Casos de uso

- Formacion en CTF OSINT en frances: el modelo puede generar explicaciones paso a paso de la metodologia esperada en un reto, sirviendo como tutor para principiantes que necesitan entender el razonamiento y no solo la respuesta final.
- Borrador de metodologia de investigacion: dado un objetivo de investigacion pasiva, produce un plan estructurado de pivotes, fuentes archivisticas y tecnicas de geolocalizacion que el analista revisa y valida despues.
- Recordatorio de OPSEC en equipos de seguridad: se puede integrar como asistente conversacional interno que recuerda las practicas de higiene operativa antes de iniciar una investigacion autorizada.
- Baseline para fine-tuning de asistentes mayores: sirve como punto de partida o como generador de datos sinteticos de estilo para entrenar adaptadores equivalentes sobre modelos de 7B o 14B con mas capacidad.
- Enrutador o clasificador previo en un pipeline agentico: por su tamano (1,5B) y su bajo coste de inferencia, puede usarse para detectar y reformular consultas OSINT antes de enviarlas a un modelo mayor con acceso a herramientas.
- Despliegue local en portatil o entorno air-gapped: al requerir alrededor de 1 GB en cuantizacion de 4 bits, puede ejecutarse sin conexion en equipos de formacion donde no se permite enviar consultas a servicios externos.
- Generacion de material docente bilingue fr/en: redaccion de fichas, guiones de practicas o enunciados de ejercicios de OSINT con terminologia y estilo consistentes.
- Chatbot educativo en plataformas de e-learning de ciberseguridad: responde en el idioma del usuario y mantiene el foco en metodologia pasiva, no en explotacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente declara las metricas de entrenamiento, que no son comparables con evaluaciones estandar:

| Metrica | Valor |
|---|---|
| train_loss | 2,38 |
| eval_loss | 1,79 |
| Epocas | 2 |
| Tamano efectivo del dataset | ~175 muestras (185 write-ups segun la descripcion) |
| Tiempo de entrenamiento | ~4 minutos en Tesla T4 |

No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones especificas de OSINT o ciberseguridad para este adaptador.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 3,1 GB solo para los pesos del base de 1,5B, mas el adaptador (18,5 M de parametros, despreciable) y el overhead de activaciones y cache KV; en la practica, unos 4 GB.
- VRAM estimada en 8 bits: del orden de 1,6 GB para los pesos, alrededor de 2,5 GB con overhead.
- VRAM estimada en 4 bits (NF4 o GGUF Q4_K_M): aproximadamente 1 GB de pesos, utilizable con 2 GB de VRAM total.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente (RTX 3050, RTX 3060, RTX 4060, RTX 4090). En el extremo profesional, A100, H100, L40S o T4 sobran para este tamano; el propio autor entreno el adaptador en una Tesla T4 de 16 GB.
- Cabe holgadamente en GPU de consumo: si, y tambien en CPU mediante llama.cpp u Ollama con cuantizacion Q4, con velocidades de decodificacion reducidas pero funcionales.
- Opciones de despliegue: transformers + peft (metodo documentado en la model card), vLLM con soporte de adaptadores LoRA, TGI, llama.cpp y Ollama o LM Studio tras fusionar el adaptador con el base y convertir a GGUF. Tambien es posible fusionar los pesos y publicar un modelo unico.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hermes OSINT 1.5B (este) | 1,5B + adaptador de 18,5 M | 512 tokens de entrenamiento; 32.768 en el base (no documentado) | OSINT/CTF en frances, formato adaptador LoRA | Apache 2.0 | HuggingFace, requiere el modelo base |
| Qwen2.5-1.5B-Instruct (base) | 1,5B | 32.768 tokens nativos | Asistente generalista multilingue | Apache 2.0 | HuggingFace |
| Qwen2.5-7B-Instruct | 7,6B | 32.768 tokens nativos (ampliable con YaRN) | Asistente generalista, mas capacidad de razonamiento | Apache 2.0 | HuggingFace |
| Phi-3.5-mini-instruct | 3,8B | 128.000 tokens | Asistente generalista y de codigo | MIT | HuggingFace |

Nota: los datos de los modelos comparados provienen de sus especificaciones publicas conocidas y no se han verificado en la informacion proporcionada en esta busqueda. No se dispone de resultados de rendimiento comparables entre estas alternativas y el adaptador evaluado, ya que el autor no publica benchmarks. En terminos de rendimiento especifico en OSINT en frances, no disponible.

## Limitaciones y advertencias

- Modelo muy pequeno (1,5B): reproduce estilo y metodo del corpus, no aporta conocimiento factual fiable ni acceso a herramientas.
- Entrenado durante 2 epocas sobre aproximadamente 175 muestras: es un adaptador de comportamiento y estilo, no una inyeccion de conocimiento.
- Riesgo alto de confabulacion: al haberse entrenado sobre write-ups publicos, puede inventar detalles concretos de un reto que solo vio parafraseado.
- Longitud de contexto de entrenamiento de 512 tokens, muy inferior a la ventana nativa del modelo base; las respuestas largas o con contexto extenso degradan la calidad.
- Idiomas limitados a frances e ingles, con claro sesgo hacia el frances; el rendimiento en castellano no esta documentado ni garantizado.
- Sin tool calling ni function calling: no puede consultar bases de datos, ejecutar busquedas ni interactuar con APIs por si mismo.
- El autor desaconseja explicitamente su uso para investigaciones legales, de seguridad critica o sobre personas privadas.
- Sesgos conocidos: no documentados en la model card; al derivar de un corpus de write-ups de CTF, puede sobrerrepresentar tecnicas y herramientas populares en la comunidad francesa de CTF.
- Adopcion nula en el momento de la consulta (0 descargas, 0 likes), sin validacion independiente ni issues reportados.
- Licencia Apache 2.0 tanto en el adaptador como en el modelo base, lo que en principio permite uso comercial; conviene verificar igualmente los terminos del dataset de entrenamiento antes de un uso productivo.
- Restricciones eticas de uso: el autor limita el modelo a investigacion de seguridad y educacion autorizadas y legalmente permitidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bouddah/hermes-osint-1.5b
- Dataset de entrenamiento: https://huggingface.co/datasets/bouddah/osint-ctf-corpus-fr
- Codigo y plantilla de agente: https://github.com/yassirboudda/hermes-osint-ctf-agent
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- BibTeX declarado por el autor:
  ```
  @misc{hermes_osint_15b,
    title  = {Hermes OSINT 1.5B (LoRA)},
    author = {Boudda, Yassir},
    year   = {2026},
    url    = {https://huggingface.co/bouddah/hermes-osint-1.5b}
  }
  ```
- Paper, blog o demo adicionales: no disponible. La busqueda web realizada no devolvio resultados relevantes sobre el modelo (los resultados obtenidos versaban sobre la figura historica de Buda y no guardan relacion con este adaptador).
