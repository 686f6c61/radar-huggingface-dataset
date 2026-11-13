# mradermacher/sankalpa-intent-hinglish-GGUF

## Resumen

sankalpa-intent-hinglish-GGUF es la version cuantizada en formato GGUF del modelo LatentAILabs/sankalpa-intent-hinglish, un encoder basado en XLM-RoBERTa (558.838.784 parametros) especializado en clasificacion conjunta de intencion y relleno de slots (joint intent-slot) para hindi romanizado y texto code-mixed hindi-ingles, es decir, el llamado hinglish. Lo publica mradermacher, un conocido empaquetador de cuantizaciones GGUF, y su proposito es facilitar el despliegue en local de un modelo de comprension del lenguaje natural (NLU) pensado para asistentes de voz dirigidos al mercado indio.

El modelo resuelve un problema muy concreto: los asistentes de voz comerciales suelen fallar con entradas mezcladas de hindi escrito en alfabeto latino e ingles, un registro muy habitual en India en chats y transcripciones de voz. Al ser un encoder de ~559 millones de parametros, no genera texto libre: produce etiquetas de intencion y etiquetas BIO para los slots de una utterance, lo que lo hace adecuado para pipelines de NLU con latencia baja.

Esta version GGUF es relevante porque reduce el peso del modelo desde los 1,2 GB en f16 hasta unos 0,4-0,7 GB segun la cuantizacion, permitiendo ejecucion en CPU y en GPUs de consumo. La licencia Apache 2.0 y el soporte de despliegue via llama.cpp/Ollama lo convierten en una pieza practica para prototipos y produccion ligera de asistentes conversacionales en hinglish. El modelo se entreno sobre el dataset AmazonScience/massive, segun la model card del autor original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder basado en XLM-RoBERTa (joint intent-slot) |
| Parametros totales | 558.838.784 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | hi, en (incluye hindi romanizado y code-mixing hinglish) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (original en safetensors en el repo base) |

## Arquitectura y entrenamiento

El modelo base es un encoder XLM-RoBERTa adaptado a una tarea de clasificacion conjunta de intencion y slots (joint intent-slot), una formulacion habitual en NLU de asistentes de voz en la que una misma cabeza de representacion alimenta dos clasificadores: uno de intencion a nivel de utterance y otro de etiquetado por token (esquema BIO) para los slots. Al ser un encoder bidireccional, no dispone de decodificacion autoregresiva ni de modo de razonamiento: su salida son logits de clasificacion.

Segun los metadatos disponibles, el entrenamiento se realizo sobre el dataset AmazonScience/massive, un corpus multilingue de utterances de asistente de voz. La model card no detalla el numero exacto de tokens ni la composicion exacta del dataset usado, ni confirma si se aplicaron tecnicas de RLHF o DPO (no aplicables en un encoder de clasificacion de este tipo). Esta version concreta es una conversion estatica a GGUF realizada por mradermacher; la model card indica que no hay cuantizaciones con imatrix/weighted disponibles en el momento de la publicacion.

## Capacidades

- Clasificacion de intencion a nivel de utterance en hinglish y hindi romanizado.
- Relleno de slots (slot filling) por token, con etiquetas BIO.
- Clasificacion conjunta intent-slot en una sola pasada (joint intent-slot).
- Manejo de texto code-mixed hindi-ingles, incluyendo transliteracion romanizada.
- Soporte de los idiomas hi y en segun los metadatos del modelo.
- Extraccion de caracteristicas (feature-extraction) al ser un encoder transformer.
- No soporta generacion de texto libre, tool calling, agentes, vision ni audio: es un modelo discriminativo de NLU.

## Casos de uso

- Asistentes de voz para el mercado indio: el modelo clasifica la intencion (por ejemplo, "reproducir musica", "enviar mensaje") y extrae los slots (artista, destinatario) de utterances en hinglish, lo que permite enrutar comandos de voz sin depender de APIs en la nube.
- Chatbots de atencion al cliente en India: al reconocer intenciones en texto romanizado, permite construir arboles de respuesta y derivaciones a agentes humanos a partir de mensajes escritos en hinglish.
- Enrutamiento de tickets y correos: clasificacion de intencion en un pipeline de soporte para asignar automaticamente cada consulta al equipo correspondiente, con extraccion de entidades como fechas, productos o numeros de pedido.
- Preprocesado de transcripciones ASR: los sistemas de reconocimiento de voz devuelven texto romanizado; este modelo actua como capa NLU posterior para convertir esas transcripciones en comandos estructurados.
- Prototipado en local y en el borde: con cuantizaciones de 0,4-0,7 GB y licencia Apache 2.0, se puede desplegar en portatiles o dispositivos con CPU para demos y pruebas de concepto sin GPU.
- Filtrado y analisis de conversaciones: clasificacion masiva de logs de chat en hinglish para analitica de intenciones y deteccion de temas frecuentes en un producto digital.
- Sistemas de dictado y comandos por voz en aplicaciones moviles: integracion del modelo como componente de intencion en un pipeline on-device gracias a su tamano reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB con Q2_K, 0,5 GB con Q4_K_M/IQ4_XS, 0,6 GB con Q6_K y 0,7 GB con Q8_0; 1,2 GB con F16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100, aunque estas ultimas estan sobredimensionadas para un encoder de 559M de parametros.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en iGPU y CPU.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; el repo base en safetensors es compatible con transformers y con TGI/vLLM para la version sin cuantizar.
- Latencia y throughput: no se han publicado mediciones concretas; por el tamano del modelo, se espera latencia de milisegundos por utterance en GPU y de decenas de milisegundos en CPU, pero estos valores no estan confirmados en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| sankalpa-intent-hinglish-GGUF | 558,8 M | no disponible | Joint intent-slot en hinglish | Apache 2.0 | GGUF |
| LatentAILabs/sankalpa-intent-hinglish | 558,8 M | no disponible | Joint intent-slot en hinglish | Apache 2.0 | safetensors |
| XLM-RoBERTa base | ~278 M | 512 tokens | Encoder multilingue generico | MIT | safetensors, GGUF |
| mDeBERTa-v3 base | ~278 M | 512 tokens | Encoder multilingue generico | MIT | safetensors |

La comparativa con XLM-RoBERTa y mDeBERTa es aproximada: son encoders multilingues genericos que requeririan fine-tuning especifico para la tarea de joint intent-slot en hinglish, mientras que sankalpa ya viene ajustado para ella. No se dispone de datos de rendimiento comparativo publicados en la informacion disponible.

## Limitaciones y advertencias

- Modelo discriminativo: no genera texto, por lo que no sirve para tareas generativas, razonamiento libre ni agentes.
- Entrenado sobre un dataset de dominio de asistente de voz (MASSIVE); el rendimiento fuera de ese dominio (por ejemplo, textos legales o medicos en hinglish) es incierto.
- La model card no documenta sesgos especificos; al entrenarse sobre un corpus de asistentes de voz, puede heredar sesgos de dominio y de cobertura geografica del dataset.
- Riesgo de clasificacion erronea en utterances ambiguas o con mezcla de idiomas no representada en el entrenamiento; al ser un clasificador, no hay "alucinacion" en sentido generativo, pero si errores de etiqueta.
- Longitud de contexto no documentada; no se debe asumir una ventana larga.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del dataset AmazonScience/massive usado en el entrenamiento.
- Esta version GGUF es una conversion de terceros (mradermacher); la calidad de las cuantizaciones bajas (Q2_K, Q3_K_S) puede degradar la precision de clasificacion respecto al modelo original.
- No hay cuantizaciones imatrix/weighted disponibles segun la model card.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/sankalpa-intent-hinglish-GGUF
- Modelo base: https://huggingface.co/LatentAILabs/sankalpa-intent-hinglish
- Dataset de entrenamiento: https://huggingface.co/datasets/AmazonScience/massive
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#sankalpa-intent-hinglish-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
