# Offlin33er/SmolLM2-1.7B-telegram-chats

## Resumen

SmolLM2-1.7B-telegram-chats es un ajuste fino supervisado (SFT) del modelo HuggingFaceTB/SmolLM2-1.7B, publicado por el usuario Offlin33er. El entrenamiento se ha realizado con la librería TRL sobre el dataset Offlin33er/telegram-chat-export-synthetic, es decir, un corpus sintetico que imita exportaciones de conversaciones de Telegram. El objetivo declarado por el autor es adaptar un modelo pequeno de proposito general al registro y la estructura de chats de mensajeria.

Se trata de un transformer decoder causal de 1.711.376.384 parametros (dato extraido de los pesos en safetensors), por lo que hereda el tamano, la ventana de contexto y la arquitectura del modelo base. El repositorio ocupa 3,4 GB y se distribuye unicamente en formato safetensors para la libreria transformers; no se han publicado conversiones a GGUF ni cuantizaciones de terceros. La model card incluye una traza de entrenamiento en Trackio y las versiones de framework (TRL 1.13.0, Transformers 5.17.0, PyTorch 2.14.0).

Su relevancia es limitada y muy especifica: se trata de un experimento de ajuste con 0 descargas y 0 likes en el momento de la consulta, sin resultados de evaluacion publicados y sin licencia efectiva declarada. Resulta util como caso de estudio de un pipeline SFT reproducible con TRL sobre un dataset sintetico de chats, pero no como sustituto de un modelo de proposito general en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal (arquitectura heredada del modelo base SmolLM2-1.7B; el ajuste no modifica la estructura) |
| Parametros totales | 1.711.376.384 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no documentada para el ajuste; el modelo base SmolLM2-1.7B declara 8.192 tokens |
| Tipos de cuantizacion | no se publican GGUF, AWQ ni GPTQ; el repositorio contiene safetensors (3,4 GB, precision de 16 bits) |
| Idiomas soportados | no disponibles (los idiomas del ajuste no se declaran; el modelo base esta orientado principalmente al ingles) |
| Licencia | no disponible (la model card indica "licence: license", sin terminos efectivos) |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | HuggingFaceTB/SmolLM2-1.7B |
| Dataset de entrenamiento | Offlin33er/telegram-chat-export-synthetic |
| Metodo de entrenamiento | SFT con TRL 1.13.0 |
| Tamano del repositorio | 3,4 GB |
| Pipeline declarado | text-generation |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del SmolLM2-1.7B, un transformer decoder causal de 1,7 mil millones de parametros desarrollado por HuggingFaceTB. El ajuste se ha realizado con TRL en su modo de supervised fine-tuning (SFT), partiendo de los pesos del modelo base y entrenando sobre el dataset Offlin33er/telegram-chat-export-synthetic, descrito por el autor como un corpus sintetico de exportaciones de chats de Telegram. No se documentan en la model card el numero de tokens de entrenamiento, la composicion exacta del dataset, la mezcla de datos, la existencia de fases de RLHF o DPO, ni hiperparametros como tasa de aprendizaje, epochs o estrategia de enmascarado de la perdida.

La unica innovacion tecnica reseñable es de caracter procedimental: el autor publica la traza completa del entrenamiento en Trackio (proyecto smollm2-telegram-chat-sft), lo que permite auditar la curva de perdida y las metricas del job, ejecutado al parecer sobre la infraestructura hf_jobs de Hugging Face. No se declara ningun cambio arquitectonico, decodificacion especulativa, atencion lineal ni tecnica de optimizacion del contexto. Las etiquetas del repositorio incluyen text-generation-inference y endpoints_compatible, lo que indica compatibilidad con el motor TGI y con endpoints gestionados, pero no aporta informacion sobre el proceso de entrenamiento.

## Capacidades

- Generacion de texto conversacional: el modelo ha sido ajustado especificamente para producir respuestas con el registro y la estructura de un chat de mensajeria instantanea.
- Modelado de dialogos multi-turno: al derivar de un modelo base con soporte de plantillas de chat, puede procesar historiales de conversacion, aunque la ventana util depende del modelo base (8.192 tokens declarados por HuggingFaceTB).
- Reproduccion de estilos de escritura propios de exportaciones de Telegram: mensajes cortos, intervenciones encadenadas y posiblemente metadatos del formato de exportacion, en funcion de como se haya construido el dataset sintetico.
- Soporte de tool calling / function calling: no disponible; no se documenta ninguna capacidad de llamada a herramientas en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible ni documentado.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades multilingues: no documentadas; el modelo base SmolLM2-1.7B esta entrenado principalmente en ingles.
- Generacion de codigo y matematicas: no evaluada en este ajuste; la especializacion en chats sinteticos puede degradar estas capacidades respecto al modelo base.

## Casos de uso

- Prototipado de asistentes de mensajeria: el modelo puede desplegarse como backend conversacional de un bot de Telegram para validar flujos de producto, gracias a que reproduce el registro de un chat real y su tamano permite ejecutarlo en una GPU de consumo.
- Generacion de datos sinteticos de conversacion: dado que se entreno sobre un corpus sintetico de chats, puede emplearse para ampliar ese mismo corpus generando variaciones de dialogos que despues se filtren y se usen en nuevos ciclos de SFT.
- Investigacion sobre fine-tuning con TRL: sirve como caso de referencia reproducible para estudiar como un ajuste SFT de bajo coste sobre 1,7B de parametros modifica el estilo de salida respecto al modelo base.
- Analisis de sobreajuste a dominios estrechos: al estar entrenado sobre un unico tipo de corpus, es un sujeto adecuado para medir deriva de dominio, olvido catastrofico y perdida de capacidades generales tras un SFT especializado.
- Inferencia en el borde o en local: con aproximadamente 3,4 GB de pesos en 16 bits, puede ejecutarse en portatiles con GPU de 8 GB o en CPU tras convertir los pesos a GGUF, lo que habilita demos privadas sin enviar datos a un servicio externo.
- Simulacion de conversaciones para pruebas de producto: equipos de QA pueden generar transcripciones sinteticas de chats con estructura realista para probar parsers, exportadores o interfaces de mensajeria sin utilizar datos de usuarios reales.
- Base para ajustes posteriores: al ser un modelo pequeno con pesos abiertos en safetensors, puede servir como punto de partida para LoRA o SFT adicional sobre un dominio concreto, siempre que se resuelva antes la ambiguedad de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra suite, y el repositorio registra 0 descargas y 0 likes, por lo que tampoco existen evaluaciones de terceros. La busqueda web realizada no devolvio resultados relevantes sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits (bf16/fp16): en torno a 3,5 GB solo para los pesos, mas la cache KV. Partiendo de la configuracion publicada del modelo base (24 capas, 32 cabezas KV, dimension de cabeza 64), la cache KV ocupa aproximadamente 0,19 GB por cada 1.000 tokens, es decir, unos 1,5 GB con la ventana completa de 8.192 tokens. Total orientativo: 5-6 GB en el peor caso.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 1,7-2 GB de pesos, mas cache KV (que suele mantenerse en 16 bits).
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 1,0-1,2 GB de pesos si el usuario genera una conversion propia (el autor no publica ninguna).
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM sirve para inferencia en 16 bits, por ejemplo RTX 3060 Ti, RTX 4060, RTX 4070 o superiores. Para servicio concurrente con lotes grandes se recomienda A100 40/80 GB, H100 o L40S.
- Compatibilidad con GPU de consumo: si. Cabe en RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4080 y RTX 4090, y en tarjetas de 6 GB si se aplica cuantizacion de 4 u 8 bits.
- Opciones de despliegue: transformers con accelerate, vLLM para servicio con batching continuo, TGI (el repositorio esta etiquetado como text-generation-inference y endpoints_compatible) y Hugging Face Inference Endpoints. Para llama.cpp u Ollama es necesario convertir previamente los pesos a GGUF, ya que no se publica ninguna conversion.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia de primer token para este ajuste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolLM2-1.7B-telegram-chats (este modelo) | 1,71B | no documentada para el ajuste; 8.192 en el modelo base | no disponible | safetensors en HuggingFace |
| HuggingFaceTB/SmolLM2-1.7B (modelo base) | 1,71B | 8.192 tokens | Apache-2.0 | safetensors, GGUF y variantes cuantizadas |
| Qwen2.5-1.5B | 1,54B | 32.768 tokens | Apache-2.0 | safetensors, GGUF, AWQ, GPTQ |
| Llama-3.2-1B | 1,24B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF |
| Gemma-2-2B | 2,61B | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF |

Los datos de contexto y licencia de los modelos comparados corresponden a la informacion publica de sus respectivas fichas y no se han verificado en el repositorio de este ajuste. En rendimiento no es posible comparar: el modelo analizado no publica ninguna evaluacion, mientras que los modelos base citados si publican resultados en sus model cards.

## Limitaciones y advertencias

- Licencia no resuelta: la model card declara "licence: license", una etiqueta sin contenido juridico. No se puede asumir la licencia Apache-2.0 del modelo base, ya que un ajuste fino puede estar sujeto a condiciones distintas. Para uso comercial es imprescindible contactar con el autor y obtener una declaracion explicita.
- Sin evaluacion publicada: no hay benchmarks, ni evaluaciones humanas, ni pruebas de regresion frente al modelo base que indiquen si el ajuste mejora o degrada capacidades generales.
- Riesgo elevado de sobreajuste de dominio: el entrenamiento sobre un unico dataset sintetico de chats de Telegram puede sesgar el estilo, el vocabulario y la longitud de las respuestas, reduciendo su utilidad fuera de ese formato.
- Degradacion de capacidades generales: un SFT estrecho sobre 1,7B de parametros puede provocar olvido catastrofico en razonamiento, matematicas o generacion de codigo respecto al modelo base.
- Alucinacion: al ser un modelo pequeno y no contar con datos de alineacion adicionales documentados, es esperable que genere informacion falsa con seguridad, especialmente en preguntas factuales fuera de su dominio de ajuste.
- Idiomas no declarados: no se especifica que idiomas cubre el ajuste. El modelo base esta orientado principalmente al ingles, por lo que el rendimiento en castellano no esta garantizado.
- Sesgos: no se documenta ninguna auditoria de sesgos, y el dataset sintetico puede reproducir sesgos presentes en la plantilla de generacion de datos original.
- Naturaleza sintetica de los datos: al entrenarse sobre conversaciones generadas artificialmente, el modelo puede imitar artefactos de ese proceso de generacion en lugar de pautas reales de conversacion.
- Ausencia de cuantizaciones publicadas: desplegar en CPU o en GPUs pequenas exige que el usuario realice su propia conversion a GGUF, con el coste de validacion asociado.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin senales de uso en produccion ni mantenimiento posterior a la publicacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Offlin33er/SmolLM2-1.7B-telegram-chats
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/Offlin33er/telegram-chat-export-synthetic
- Traza de entrenamiento en Trackio: https://Offlin33er-smollm2-telegram-chat-sft-trackio.hf.space?project=smollm2-telegram-chat-sft&runs=Offlin33er-1789556763&sidebar=collapsed
- Repositorio de TRL: https://github.com/huggingface/trl
- Repositorio de Trackio: https://github.com/gradio-app/trackio
- Busqueda web: no se han encontrado resultados relevantes sobre este modelo distintos de los enlaces anteriores.
