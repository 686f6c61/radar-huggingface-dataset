# Seeaixyz/see-1.0

## Resumen

See 1.0 es un ajuste fino mediante LoRA del modelo Jais-3-3.7B, desarrollado por Inception / Institute of Foundation Models, y adaptado por el equipo de See AI en Egipto (seeai.xyz) para construir el "cerebro" de un agente de voz de atencion al cliente en arabe egipcio. El modelo se encarga de comprender la entrada del usuario y generar la respuesta textual; la sintesis de voz corre a cargo de un modelo separado (Replica 0.6B, TokenAI).

El objetivo declarado es dominar el dialecto arabe egipcio como idioma de primera clase, ofreciendo respuestas concisas dimensionadas a la pregunta, razonamiento breve en arabe y un formato de salida que incluye tres lineas de probabilidad (correcto / requiere revision humana / erroneo) que suman 100%. Tambien incorpora un modo `#Vote` para generar guiones de voz compatibles con el TTS Replica.

Es un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, orientado a un caso de uso muy concreto de atencion al cliente en Egipto. Su relevancia radica en la especializacion dialectal y en el formato de salida autoevaluado, aunque sus propias evaluaciones reconocen debilidades importantes en razonamiento largo, gramatica arabe clasica (i'rab) y codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Jais-3-3.7B) con adaptador LoRA |
| Parametros totales | 5.058.255.360 (modelo base, BF16) |
| Parametros activos | no aplica (no es MoE); 33.914.880 parametros entrenables en el adaptador LoRA (0,666%) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QLoRA 4-bit NF4 con doble cuantizacion durante el entrenamiento; el adaptador se distribuye en F32 |
| Idiomas soportados | arabe (arabe egipcio como objetivo principal); el modelo base Jais es bilingue arabe-ingles |
| Licencia | other |
| Formato de pesos | adaptador LoRA (PEFT) sobre el modelo base `inception42/Jais-3-3.7B`; no se especifica formato de safetensors en la informacion disponible |

## Arquitectura y entrenamiento

La arquitectura subyacente es el transformer decoder-only de Jais-3-3.7B, sobre el que se aplica un adaptador LoRA con rango r=16, alpha=32, dropout 0,05 y objetivos en las proyecciones q/k/v/o/gate/up/down. El adaptador contiene 504 tensores en F32 con 33.914.880 parametros entrenables, lo que representa un 0,666% del total del modelo base. El entrenamiento se realizo mediante QLoRA (4-bit NF4 con doble cuantizacion) usando el `Trainer` estandar de `transformers`.

El proceso consta de dos fases: una version v1 con 2.105 ejemplos, 3 epocas, 396 pasos y una reduccion de perdida de 2,34 a 0,36 en una instancia de Kaggle con 2× T4; y un ajuste posterior denominado "small100" con 114 ejemplos, 3 epocas y 24 pasos, continuando desde el adaptador v1. El repositorio distribuye el adaptador small100. Los datos de entrenamiento son ejemplos escritos a mano en el tono de Claude (sin mencionarlo), cubriendo conocimiento general, datos sobre Egipto, atencion al cliente y guiones `#Vote`, con conocimiento actualizado a diciembre de 2026. Ni los datos ni los scripts de entrenamiento se incluyen en el repositorio.

## Capacidades

- Generacion de texto conversacional en arabe egipcio, con razonamiento breve y directo en arabe, estructurado en pasos numerados cuando la tarea es multi-paso.
- Respuestas dimensionadas a la pregunta: preguntas simples reciben respuestas minimas sin relleno.
- Salida autoevaluada: cada respuesta termina con tres lineas de probabilidad (صح / تحتاج مراجعة بشرية / خطأ) que suman 100%, replicadas tambien dentro del bloque de razonamiento.
- Modo `#Vote`: al escribir `#Vote` seguido de texto, el modelo genera un guion de voz para el TTS Replica, con un unico rol, registro conversacional egipcio y etiquetas no verbales verificadas.
- Identidad fija: responde como See 1.0, desarrollado por el equipo de See AI en Egipto.
- Conocimiento general y datos sobre Egipto, con corte a diciembre de 2026.
- Atencion al cliente en dialecto egipcio como caso de uso central.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio en la informacion disponible.

## Casos de uso

- Agente de voz de atencion al cliente en arabe egipcio: el modelo actua como cerebro conversacional que interpreta la consulta del cliente y redacta la respuesta, que despues se sintetiza con el TTS Replica. Su entrenamiento especifico en dialecto egipcio y en casos de servicio al cliente lo hace adecuado para este escenario concreto.
- Respuestas cortas en canales de mensajeria: para consultas simples (horarios, direcciones, datos de contacto) el modelo produce respuestas minimas y directas, lo que encaja con interfaces donde la brevedad es un requisito.
- Triaje con intervencion humana: las tres lineas de probabilidad al final de cada respuesta permiten enrutar a revision humana las respuestas marcadas con alta probabilidad de "تحتاج مراجعة بشرية", como parte de un flujo con humano en el bucle.
- Generacion de guiones de voz para TTS: mediante el modo `#Vote`, el modelo produce guiones conversacionales de un solo rol con etiquetas no verbales, listos para el motor de sintesis Replica.
- Consultas sobre Egipto y conocimiento general: con conocimiento actualizado a diciembre de 2026, puede responder preguntas factuales sobre el pais y temas generales en dialecto egipcio.
- Asistente de atencion en puntos de informacion presenciales: integrado en un pipeline de voz a texto, modelo y texto a voz para interacciones de turno corto en mostrador, donde la concision del modelo es una ventaja.
- Generacion de respuestas breves de codigo en Python: aunque la evaluacion es superficial, el modelo puede escribir funciones cortas; no es recomendable para depuracion ni para programas de mayor tamano.

## Benchmarks y rendimiento

Los resultados proceden de la model card del autor, con decodificacion greedy, pensamiento activado y ejecucion en 2× T4 de Kaggle, sobre prompts frescos (no de entrenamiento). Las respuestas de codigo se verificaron ejecutando el codigo.

Hard-20 (20 preguntas dificiles, 4 grupos × 5):

| Modelo | Total /20 (una a una) | Arabe /5 | Codigo /5 | Razonamiento /5 | Servicio /5 | En una sola generacion /20 |
|---|---:|---:|---:|---:|---:|---:|
| See 1.0 | 15 | 4,5 | 4,5 | 2,5 | 3,5 | 6 |
| DeepSeek V4.1 Flash | 20 | 5 | 5 | 5 | 5 | 20 |
| Claude Sonnet 5.5 | 20 | 5 | 5 | 5 | 5 | 20 |
| Gemini 3.8 Flash | 20 | 5 | 5 | 5 | 5 | 20 |
| Mistral Small 4 (119B) | 18 | 4,5 | 5 | 4,5 | 4 | 18 |
| GPT-20B | 13,5 | 3,5 | 5 | 1,5 | 3,5 | 13,5 |

I'rab-10 (10 preguntas dificiles de gramatica arabe):

| Modelo | Una a una /10 | En una sola generacion /10 |
|---|---:|---:|
| See 1.0 | 5,5 | 5 |

El propio autor advierte de que la evaluacion de codigo es superficial (solo 5 preguntas cortas de funciones Python) y no constituye un benchmark fiable de capacidad de programacion, y que el rendimiento en formato largo es una debilidad real: baja de 15/20 a 6/20 cuando responde las 20 preguntas en una sola generacion.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 5.058.255.360 parametros; en BF16 requiere aproximadamente 10 GB solo para pesos, mas overhead de activaciones y cache KV (no se publican cifras exactas). En cuantizacion de 4 bits el peso se reduce a unos 2,5-3 GB, aunque la informacion disponible no detalla configuraciones de inferencia cuantizada.
- GPU recomendadas: el entrenamiento se realizo en 2× T4 (16 GB cada una) mediante QLoRA, lo que sugiere que la inferencia en BF16 cabe en GPU de 16 GB o superiores (T4, RTX 4090, A100, H100).
- Cabe en GPU de consumo: si, en tarjetas con al menos 16 GB de VRAM para BF16; con cuantizacion de 4 bits cabria en GPUs de 8 GB, aunque no se documenta esta configuracion.
- Opciones de despliegue: la model card solo documenta `transformers` con `peft` (PeftModel sobre el modelo base) y `trust_remote_code=True`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Versiones requeridas: `transformers` (la version por defecto de Kaggle 5.20.2 funciona; se advierte de no actualizar), `peft==0.22.0`, `torchao>=0.16.0`, y el `chat_template.jinja` del repositorio base.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Hard-20 (una a una) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| See 1.0 | 5,06B (base) + LoRA 33,9M | no disponible | 15/20 | other | Hugging Face (0 descargas) |
| Mistral Small 4 | 119B | no disponible | 18/20 | no disponible | no disponible |
| GPT-20B | no disponible | no disponible | 13,5/20 | no disponible | no disponible |
| DeepSeek V4.1 Flash | no disponible | no disponible | 20/20 | no disponible | no disponible |

La comparativa se limita a los datos de la propia model card. See 1.0 iguala a Mistral Small 4 (119B) en la puntuacion de arabe (4,5/5) pese a tener una fraccion de sus parametros, pero queda por detras en razonamiento (2,5 frente a 4,5) y en el total. Frente a modelos frontier como DeepSeek V4.1 Flash, Claude Sonnet 5.5 o Gemini 3.8 Flash, la diferencia es de 5 puntos sobre 20 en el total y de 14 puntos en el formato de una sola generacion.

## Limitaciones y advertencias

- SobrecConfianza: el modelo declara صح con probabilidades del 90-95% incluso en respuestas incorrectas. Las lineas de probabilidad son salidas del propio modelo, no garantias calibradas; es obligatorio mantener un humano en el bucle.
- Razonamiento largo deficiente: en una sola generacion cae de 15/20 a 6/20, llegando a responder preguntas de codigo con "I will write a function" sin escribir el codigo. Su punto fuerte son las respuestas cortas y focalizadas.
- Gramatica arabe clasica debil: en el test de i'rab obtiene 5,5/10, muy por debajo de su puntuacion en arabe general (4,5/5); en las preguntas mas dificiles (لاسيما، إنما) produce razonamiento vacio y respuestas largas en ingles.
- Evaluacion de codigo no fiable: solo 5 preguntas cortas de funciones Python, sin depuracion ni programas reales; no debe interpretarse como una medida de capacidad de programacion.
- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; el conocimiento esta cortado a diciembre de 2026 y el modelo puede generar datos facticos incorrectos con alta confianza declarada.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada; el objetivo es el arabe egipcio, y el rendimiento fuera de ese dialecto o en otros idiomas no se ha evaluado.
- Licencia "other": las condiciones de uso comercial no estan detalladas en la informacion disponible y deben consultarse antes de un despliegue en produccion. Ademas, el modelo base Jais-3-3.7B tiene sus propias condiciones de licencia.
- Reproducibilidad: los datos de entrenamiento y los scripts no se incluyen en el repositorio, lo que impide reproducir el ajuste.
- Madurez: cero descargas y cero likes en el momento de la consulta; es un artefacto recien publicado y sin validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/Seeaixyz/see-1.0
- Modelo base: https://huggingface.co/inception42/Jais-3-3.7B
- Sitio del autor: https://seeai.xyz
- Resultados completos (mencionados en el repositorio): `see1_hard20_results.json`, `see1_i3rab10_results.json`
- No se han encontrado en la informacion disponible enlaces a papers, blogs, repositorios de codigo ni demos adicionales.
